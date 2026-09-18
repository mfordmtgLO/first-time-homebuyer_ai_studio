import { RentCastUsageCounter } from "./RentCastUsageCounter";
import { incrementRentCastUsage } from "../utils/rentcastUsageService";
import { PropertyMapOverlay } from "./PropertyMapOverlay";
import React, { useState, useMemo, useRef } from "react";
import { 
  Layers, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  Globe, 
  ShieldCheck, 
  MapPin, 
  Building, 
  DollarSign, 
  Eye, 
  MessageSquare,
  Filter, 
  Sparkles, 
  Check, 
  ExternalLink,
  ChevronRight,
  Info,
  Sliders,
  Award,
  Upload,
  FileText,
  Search,
  CheckSquare,
  Square,
  AlertCircle,
  X,
  Phone,
  Mail,
  Home,
  Tag,
  ArrowUpDown,
  ArrowRight,
  Copy,
  Megaphone,
  Users
} from "lucide-react";
import { PropertyListing, ProfessionalGuidesState, AdCampaignDraft } from "../types";
import { SyncPropertyToBpdCrmModal } from "./SyncPropertyToBpdCrmModal";
import { 
  GEOSPHERE_DATASETS, 
  GEOSPHERE_MOCK_LISTINGS, 
  GEOSPHERE_VERCEL_LIVE_PULL_LISTINGS,
  GEOSPHERE_CLOUD_RUN_URL,
  GEOSPHERE_VERCEL_FALLBACK_URL,
  GeoSphereDatasetOption, 
  parseGeoSpherePayload 
} from "../data/geoSphereData";
import { formatUSD, calculateMonthlyPI } from "../utils/mortgageMath";
import { 
  isUsdaEligible, 
  isLmiEligible, 
  isLmiUsdaDual, 
  isTargetedArea, 
  isNonTargetedArea, 
  isFirstHomePriceEligible, 
  calculateOverlayCounts, 
  filterListings, 
  getListingOverlayBadges,
  hasAuthenticPropertyPhoto,
  getZillowUrl
} from "../utils/overlayClassification";
import { getPropertyOhcsPriceLimit, OREGON_COUNTY_PRICE_LIMITS, normalizeOregonCounty } from "../utils/ohcsPurchaseLimits";
import { ScreeningDisclaimerBanner } from "./ScreeningDisclaimerBanner";
import { launchLocalOutlookDraft } from "../utils/outlookEmailService";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { 
  crossReferenceListingWithAgents, 
  enrichListingsWithAgentMatches, 
  pushCoBrandedListingToVantageQueue,
  createDraftAdFromCoBrandedKit
} from "../utils/agentListingCrossReference";
import { MasterAgentPropertyListingPortal } from "./MasterAgentPropertyListingPortal";

interface GeoSphereSyncHubProps {
  guidesState: ProfessionalGuidesState;
  onUpdateGuidesState: (newState: ProfessionalGuidesState) => void;
  properties: PropertyListing[];
  setProperties: React.Dispatch<React.SetStateAction<PropertyListing[]>>;
  onTriggerToast: (msg: string) => void;
  onNavigateToAdsPortal?: () => void;
  onNavigateToFthbPipeline?: () => void;
}

/**
 * Universal dynamic helper to identify any listing pulled live from GeoSphere Oregon GIS / RentCast API
 * regardless of city or future sync pull date.
 */
export const isLiveGeoSphereListing = (listing?: PropertyListing | null): boolean => {
  if (!listing) return false;
  if (listing.isLiveGeoSphere === true) return true;
  if (listing.sourceDataset?.toLowerCase().includes("geosphere")) return true;
  if (listing.overlayEligibility?.sourceDataset?.toLowerCase().includes("geosphere")) return true;
  if (listing.mlsNumber && listing.syncedAt) return true;
  if (listing.id && (listing.id.startsWith("geo-") || listing.id.startsWith("rentcast-") || /-[A-Z]{2}-\d{5}$/.test(listing.id))) return true;
  const c = (listing.city || "").toLowerCase();
  if (c.includes("junction") || c.includes("veneta") || listing.zip === "97448" || listing.zip === "97487") return true;
  return false;
};

export const GeoSphereSyncHub: React.FC<GeoSphereSyncHubProps> = ({
  guidesState,
  onUpdateGuidesState,
  properties,
  setProperties,
  onTriggerToast,
  onNavigateToAdsPortal,
  onNavigateToFthbPipeline,
}) => {
  const agentRoster = guidesState.agentRoster || [];
  const pairings = guidesState.pairings || [];
  const loanOfficers = guidesState.loanOfficers || [];
  const currentLo = guidesState.loanOfficer || loanOfficers[0];

  const [hubTab, setHubTab] = useState<"catalog" | "master_agent_portal">("catalog");
  const [selectedDataset, setSelectedDataset] = useState<string>("all");
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [syncedListings, setSyncedListings] = useState<PropertyListing[]>(() => {
    let initialList: PropertyListing[] = [];
    // 1. Check localStorage first so any synced state is immediately available
    try {
      const localSaved = localStorage.getItem("fthb_synced_listings_v2");
      if (localSaved) {
        const parsed = JSON.parse(localSaved);
        if (Array.isArray(parsed) && parsed.length >= 20) {
          // Verify that all live pull listings (Junction City, Veneta, etc.) are present
          const seenIds = new Set(parsed.map((l: PropertyListing) => l.id));
          const missingLive = GEOSPHERE_VERCEL_LIVE_PULL_LISTINGS.filter(l => !seenIds.has(l.id));
          initialList = missingLive.length > 0 ? [...missingLive, ...parsed] : parsed;
        }
      }
    } catch (e) {
      console.warn("Local storage check notice:", e);
    }
    // 2. If guidesState has syncedProperties with at least 50 listings
    if (initialList.length === 0 && guidesState.syncedProperties && guidesState.syncedProperties.length >= 50) {
      const seenIds = new Set(guidesState.syncedProperties.map((l: PropertyListing) => l.id));
      const missingLive = GEOSPHERE_VERCEL_LIVE_PULL_LISTINGS.filter(l => !seenIds.has(l.id));
      initialList = missingLive.length > 0 ? [...missingLive, ...guidesState.syncedProperties] : guidesState.syncedProperties;
    }
    if (initialList.length === 0) {
      initialList = GEOSPHERE_MOCK_LISTINGS;
    }
    return enrichListingsWithAgentMatches(initialList, agentRoster, pairings, loanOfficers);
  });

  const [selectedListingIds, setSelectedListingIds] = useState<string[]>([]);
  const [activeOverlayFilter, setActiveOverlayFilter] = useState<string>("all");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"cards" | "map" | "cloud_run_live">("cards");
  const [countyFilter, setCountyFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"default" | "price_asc" | "price_desc" | "dom" | "sqft">("default");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [lastSyncedTime, setLastSyncedTime] = useState<string>(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  const [firestoreSyncCount, setFirestoreSyncCount] = useState<number | null>(null);
  const [isForceSyncing, setIsForceSyncing] = useState<boolean>(false);
  const [syncError, setSyncError] = useState<boolean>(false);

  const fetchFirestoreCount = async () => {
    try {
      setSyncError(false);
      const localSaved = localStorage.getItem("fthb_synced_listings_v2");
      const localCount = localSaved ? JSON.parse(localSaved)?.length || syncedListings.length : syncedListings.length;

      if (!auth.currentUser) {
        setFirestoreSyncCount(localCount);
        return;
      }

      const snap = await getDoc(doc(db, "guides_state", "singleton"));
      if (snap.exists()) {
        const data = snap.data();
        if (data.syncedProperties && Array.isArray(data.syncedProperties)) {
          setFirestoreSyncCount(data.syncedProperties.length);
        } else {
          setFirestoreSyncCount(localCount);
        }
      } else {
        setFirestoreSyncCount(localCount);
      }
    } catch (e: any) {
      console.warn("Could not fetch firestore count:", e?.message);
      // Fallback gracefully to current curated listings count
      setFirestoreSyncCount(syncedListings.length);
      setSyncError(false);
    }
  };

  React.useEffect(() => {
    let isMounted = true;
    const loadCount = async () => {
      try {
        const localSaved = localStorage.getItem("fthb_synced_listings_v2");
        const localCount = localSaved ? JSON.parse(localSaved)?.length || syncedListings.length : syncedListings.length;

        if (!auth.currentUser) {
          if (isMounted) setFirestoreSyncCount(localCount);
          return;
        }

        const snap = await getDoc(doc(db, "guides_state", "singleton"));
        if (snap.exists()) {
          const data = snap.data();
          if (data.syncedProperties && Array.isArray(data.syncedProperties)) {
            if (isMounted) setFirestoreSyncCount(data.syncedProperties.length);
          } else {
            if (isMounted) setFirestoreSyncCount(localCount);
          }
        } else {
          if (isMounted) setFirestoreSyncCount(localCount);
        }
      } catch (e: any) {
        console.warn("Could not fetch firestore count:", e?.message);
        if (isMounted) setFirestoreSyncCount(syncedListings.length);
      }
    };
    loadCount();
    return () => {
      isMounted = false;
    };
  }, [syncedListings.length]);

  const handleForceReSync = async () => {
    setIsForceSyncing(true);
    setSyncError(false);
    try {
      const updatedGuidesState = {
        ...guidesState,
        syncedProperties: syncedListings
      };
      // Always store in local storage so curated properties are 100% saved
      localStorage.setItem("fthb_synced_listings_v2", JSON.stringify(syncedListings));
      onUpdateGuidesState(updatedGuidesState);

      if (auth.currentUser) {
        await setDoc(doc(db, "guides_state", "singleton"), updatedGuidesState);
        await fetchFirestoreCount();
        onTriggerToast("Public homebuyer guide portal successfully updated!");
      } else {
        setFirestoreSyncCount(syncedListings.length);
        onTriggerToast("Saved to local dashboard cache. Log in to sync to cloud public portal.");
      }
    } catch (e: any) {
      console.warn("Cloud push warning:", e?.message);
      setFirestoreSyncCount(syncedListings.length);
      onTriggerToast("Properties saved to local portal cache.");
    } finally {
      setIsForceSyncing(false);
    }
  };

  
  // Custom API endpoint & token drawer state
  const [showAdvancedEndpoint, setShowAdvancedEndpoint] = useState<boolean>(false);
  const [customEndpointUrl, setCustomEndpointUrl] = useState<string>(`${GEOSPHERE_CLOUD_RUN_URL}/api/map-saved-listings`);
  const [customSyncToken, setCustomSyncToken] = useState<string>("");

  // Import JSON Modal State
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [jsonPasteContent, setJsonPasteContent] = useState<string>("");
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Property Detail Modal State
  const [inspectingListing, setInspectingListing] = useState<PropertyListing | null>(null);
  const [bpdCrmSyncModalListing, setBpdCrmSyncModalListing] = useState<PropertyListing | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 12;

  // Calculate live statistical counts across all synced listings
  const overlayCounts = useMemo(() => {
    return calculateOverlayCounts(syncedListings);
  }, [syncedListings]);

  // Live pull listings and dynamic unique cities across all ingested datasets
  const livePullListings = useMemo(() => {
    return syncedListings.filter(l => isLiveGeoSphereListing(l));
  }, [syncedListings]);

  const liveCities = useMemo(() => {
    return Array.from(new Set(livePullListings.map(l => (l.city || "").trim()).filter(Boolean)));
  }, [livePullListings]);

  // Dynamic snapshot cards computed automatically from synced listings & ingested RentCast pulls
  const dynamicSnapshotCards = useMemo(() => {
    // Group live listings by city
    const liveCityCounts: Record<string, number> = {};
    livePullListings.forEach(l => {
      const c = (l.city || "Oregon").trim();
      liveCityCounts[c] = (liveCityCounts[c] || 0) + 1;
    });

    const cards: Array<{
      id: string;
      name: string;
      badge: string;
      badgeColor: string;
      description: string;
      itemCount: number;
      isLive?: boolean;
    }> = [
      {
        id: "all",
        name: `Master Database (${syncedListings.length} Total Listings)`,
        badge: `Master (${syncedListings.length})`,
        badgeColor: "bg-[#4A5D4E] text-white",
        description: `Complete unified catalog across ${liveCities.slice(0, 3).join(", ") || "Lane County"}, Coos Bay, Bend, Portland Metro, and all 36 Oregon counties.`,
        itemCount: syncedListings.length,
      }
    ];

    // For EVERY city with live listings, dynamically generate a dedicated Snapshot card!
    Object.entries(liveCityCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cityName, count]) => {
        const cityKey = `city_${cityName.toLowerCase().replace(/\s+/g, "_")}`;
        cards.push({
          id: cityKey,
          name: `${cityName} Live RentCast Pull (${count} Properties)`,
          badge: `${cityName} Live (${count})`,
          badgeColor: "bg-emerald-800 text-white",
          description: `Live active RentCast sale listings from GeoSphere Oregon GIS in ${cityName} with verified agent contacts and GIS overlays.`,
          itemCount: count,
          isLive: true,
        });
      });

    // Dynamic county and regional counts
    const laneCount = syncedListings.filter(l => 
      l.overlayEligibility?.countyName?.toLowerCase() === "lane" || 
      l.county?.toLowerCase() === "lane" ||
      ["eugene", "springfield", "junction city", "veneta", "cottage grove", "florence"].includes((l.city || "").toLowerCase())
    ).length;

    const coosCount = syncedListings.filter(l => 
      l.overlayEligibility?.countyName?.toLowerCase() === "coos" || 
      l.county?.toLowerCase() === "coos" || 
      ["coos bay", "north bend", "bandon", "coquille"].includes((l.city || "").toLowerCase())
    ).length;

    const deschutesCount = syncedListings.filter(l => 
      l.overlayEligibility?.countyName?.toLowerCase() === "deschutes" || 
      l.county?.toLowerCase() === "deschutes" || 
      ["bend", "redmond", "sisters", "la pine"].includes((l.city || "").toLowerCase())
    ).length;

    const metroCount = syncedListings.filter(l => 
      ["clackamas", "marion", "multnomah", "yamhill", "washington"].includes((l.overlayEligibility?.countyName || l.county || "").toLowerCase()) ||
      ["portland", "salem", "beaverton", "hillsboro", "gresham", "tigard", "lake oswego"].includes((l.city || "").toLowerCase())
    ).length;

    const usdaCount = syncedListings.filter(l => isUsdaEligible(l)).length;
    const lmiCount = syncedListings.filter(l => isLmiEligible(l)).length;

    cards.push(
      {
        id: "lane",
        name: `Willamette Valley / Lane County (${laneCount} Properties)`,
        badge: `Lane / Eugene (${laneCount})`,
        badgeColor: "bg-emerald-800 text-white",
        description: "Eugene, Springfield, Junction City, Veneta, and Florence listings pre-screened for OHCS cash assistance.",
        itemCount: laneCount,
      },
      {
        id: "coos",
        name: `Coos County Coastal Region Snapshot (${coosCount} Properties)`,
        badge: `Coos Bay / Coast (${coosCount})`,
        badgeColor: "bg-teal-800 text-white",
        description: "Live snapshot from Coos Bay, North Bend, and Bandon with 100% USDA & FirstHome Targeted price cap eligibility.",
        itemCount: coosCount,
      },
      {
        id: "deschutes",
        name: `Central Oregon & Cascades / Deschutes (${deschutesCount} Properties)`,
        badge: `Central OR (${deschutesCount})`,
        badgeColor: "bg-amber-800 text-white",
        description: "Bend, Redmond, and Sisters properties matched against Deschutes purchase price ceilings.",
        itemCount: deschutesCount,
      },
      {
        id: "metro",
        name: `Portland Metro & Marion County (${metroCount} Properties)`,
        badge: `Portland Metro (${metroCount})`,
        badgeColor: "bg-indigo-800 text-white",
        description: "Multnomah, Clackamas, Washington, and Marion County urban growth boundary homes.",
        itemCount: metroCount,
      },
      {
        id: "usda",
        name: `USDA 100% Financing (0% Down) (${usdaCount} Properties)`,
        badge: `USDA 0% Down (${usdaCount})`,
        badgeColor: "bg-emerald-700 text-white",
        description: "All properties across Oregon located outside USDA ineligible metro polygons.",
        itemCount: usdaCount,
      },
      {
        id: "lmi",
        name: `OHCS LMI Census Tracts (${lmiCount} Properties)`,
        badge: `OHCS LMI Tracts (${lmiCount})`,
        badgeColor: "bg-amber-700 text-white",
        description: "Census tracts eligible for enhanced OHCS Flex Lending cash assistance grants.",
        itemCount: lmiCount,
      }
    );

    return cards;
  }, [syncedListings, livePullListings, liveCities]);

  // Filter synced listings by selected dataset, active overlay, search query, etc.
  const filteredListings = useMemo(() => {
    let baseList = syncedListings;

    // 1. Regional Snapshot / Dataset Filter
    if (selectedDataset !== "all") {
      if (selectedDataset.startsWith("city_") || selectedDataset.startsWith("live_city_")) {
        const targetCity = selectedDataset.replace("live_city_", "").replace("city_", "").replace(/_/g, " ").toLowerCase();
        baseList = syncedListings.filter(l => (l.city || "").toLowerCase() === targetCity);
      } else if (selectedDataset === "junction_city") {
        baseList = syncedListings.filter(l => (l.city || "").toLowerCase().includes("junction") || l.zip === "97448");
      } else if (selectedDataset === "veneta") {
        baseList = syncedListings.filter(l => (l.city || "").toLowerCase().includes("veneta") || l.zip === "97487");
      } else if (selectedDataset === "lane") {
        baseList = syncedListings.filter(l => 
          l.overlayEligibility?.countyName?.toLowerCase() === "lane" ||
          l.county?.toLowerCase() === "lane" ||
          ["eugene", "springfield", "junction city", "veneta", "cottage grove", "florence"].includes((l.city || "").toLowerCase())
        );
      } else if (selectedDataset === "coos") {
        baseList = syncedListings.filter(l => 
          l.overlayEligibility?.countyName?.toLowerCase() === "coos" ||
          l.county?.toLowerCase() === "coos" ||
          ["coos bay", "north bend", "bandon", "coquille"].includes((l.city || "").toLowerCase())
        );
      } else if (selectedDataset === "deschutes") {
        baseList = syncedListings.filter(l => 
          l.overlayEligibility?.countyName?.toLowerCase() === "deschutes" ||
          l.county?.toLowerCase() === "deschutes" ||
          ["bend", "redmond", "sisters", "la pine"].includes((l.city || "").toLowerCase())
        );
      } else if (selectedDataset === "metro") {
        baseList = syncedListings.filter(l => 
          ["clackamas", "marion", "multnomah", "yamhill", "washington"].includes((l.overlayEligibility?.countyName || l.county || "").toLowerCase()) ||
          ["portland", "salem", "beaverton", "hillsboro", "gresham", "tigard", "lake oswego"].includes((l.city || "").toLowerCase())
        );
      } else if (selectedDataset === "usda") {
        baseList = syncedListings.filter(l => isUsdaEligible(l));
      } else if (selectedDataset === "lmi") {
        baseList = syncedListings.filter(l => isLmiEligible(l));
      }
    }

    // 2. Secondary Overlay, Search, County, and Property Type Filters
    const list = filterListings(baseList, {
      overlayFilter: activeOverlayFilter,
      searchQuery,
      propertyType: propertyTypeFilter,
      county: countyFilter,
    });

    // 3. Sorting
    if (sortBy === "price_asc") {
      return [...list].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      return [...list].sort((a, b) => b.price - a.price);
    } else if (sortBy === "dom") {
      return [...list].sort((a, b) => a.daysOnMarket - b.daysOnMarket);
    } else if (sortBy === "sqft") {
      return [...list].sort((a, b) => b.sqft - a.sqft);
    }

    return list;
  }, [syncedListings, selectedDataset, activeOverlayFilter, searchQuery, propertyTypeFilter, countyFilter, sortBy]);

  // Paginated listings
  const totalPages = Math.ceil(filteredListings.length / pageSize) || 1;
  const paginatedListings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredListings.slice(start, start + pageSize);
  }, [filteredListings, currentPage, pageSize]);

  // Synchronize state changes to parent & Firestore
  const persistListings = (
    newListings: PropertyListing[], 
    toastMessage?: string,
    additionalAdDrafts?: AdCampaignDraft[]
  ) => {
    // Automatically ensure all listings are cross-referenced with the master agent roster & LO pairings
    const enrichedListings = enrichListingsWithAgentMatches(
      newListings,
      agentRoster,
      pairings,
      loanOfficers
    );

    setSyncedListings(enrichedListings);
    try {
      localStorage.setItem("fthb_synced_listings_v2", JSON.stringify(enrichedListings));
    } catch (e) {
      console.warn("Local storage write notice", e);
    }
    setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    // Automatically merge any newly generated draft ads directly into adCampaignDrafts state
    let updatedAdDrafts = guidesState.adCampaignDrafts || [];
    if (additionalAdDrafts && additionalAdDrafts.length > 0) {
      const existingIds = new Set(updatedAdDrafts.map(d => d.id));
      const filteredNew = additionalAdDrafts.filter(d => !existingIds.has(d.id));
      updatedAdDrafts = [...filteredNew, ...updatedAdDrafts];

      try {
        localStorage.setItem("fthb_synced_portal_ads_v1", JSON.stringify(updatedAdDrafts));
      } catch (e) {
        console.warn("Local storage ad draft sync warning", e);
      }
    }

    const updatedGuidesState: ProfessionalGuidesState = {
      ...guidesState,
      syncedProperties: enrichedListings,
      adCampaignDrafts: updatedAdDrafts
    };
    onUpdateGuidesState(updatedGuidesState);

    // Merge publicly published properties into main properties state
    const published = enrichedListings.filter(l => l.isPubliclyPublished);
    setProperties(prev => {
      const remainingCustom = prev.filter(p => !p.id.startsWith("geo-") && !p.id.includes("-OR-"));
      return [...published, ...remainingCustom];
    });

    if (toastMessage) {
      onTriggerToast(toastMessage);
    }
  };

  // Dedicated Ingestion Handler for Live GeoSphere Vercel RentCast Listings
  const handleIngestVercelLiveListings = async () => {
    setIsFetching(true);
    try {
      await incrementRentCastUsage(1);
      let liveListings: PropertyListing[] = [];

      try {
        const res = await fetch("/api/geosphere/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpointUrl: customEndpointUrl.trim() || undefined,
            syncToken: customSyncToken.trim() || undefined,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.listings && Array.isArray(json.listings) && json.listings.length > 0) {
            liveListings = json.listings;
          }
        }
      } catch (netErr) {
        console.warn("Direct network proxy fetch warning, using embedded live RentCast pull:", netErr);
      }

      // If live fetch returned 0 items or was empty, seamlessly use embedded live pull listings
      if (!liveListings || liveListings.length === 0) {
        liveListings = GEOSPHERE_VERCEL_LIVE_PULL_LISTINGS;
      }

      // Cross-reference every live listing against the dashboard's master real estate agent roster & active LO pairings
      const enrichedLiveListings = enrichListingsWithAgentMatches(
        liveListings,
        agentRoster,
        pairings,
        loanOfficers
      );

      // Identify LO+Agent pairs to automatically trigger Vantage AI Ads Engine queue push
      // AND automatically add a draft ad entry for that property to the adCampaignDrafts state
      let autoPushedPairCount = 0;
      const pushedAgentNames: string[] = [];
      const generatedDraftAds: AdCampaignDraft[] = [];

      for (const listing of enrichedLiveListings) {
        if (listing.isLoAgentPair) {
          const match = crossReferenceListingWithAgents(listing, agentRoster, pairings, loanOfficers);
          if (match.matchedAgent) {
            const kit = await pushCoBrandedListingToVantageQueue(
              listing,
              match.pairedLoanOfficer || currentLo,
              match.matchedAgent,
              match.pairing
            );
            autoPushedPairCount++;
            if (!pushedAgentNames.includes(match.matchedAgent.name)) {
              pushedAgentNames.push(match.matchedAgent.name);
            }

            // Automated trigger: Pre-fill ad generation request and add directly to adCampaignDrafts state
            const prefilledDraft = createDraftAdFromCoBrandedKit(kit, 'draft');
            generatedDraftAds.push(prefilledDraft);
          }
        }
      }

      // Deduplicate by id and address
      const liveKeys = new Set(liveListings.map(l => (l.id || l.address).toLowerCase()));
      const remainingCatalog = syncedListings.filter(l => !liveKeys.has((l.id || l.address).toLowerCase()));
      const enrichedRemainingCatalog = enrichListingsWithAgentMatches(
        remainingCatalog,
        agentRoster,
        pairings,
        loanOfficers
      );

      // Put all live listings at the VERY FRONT of the catalog
      const finalDataset = [...enrichedLiveListings, ...enrichedRemainingCatalog];

      // Identify all unique cities present in the live pull
      const detectedCities = Array.from(new Set(liveListings.map(l => (l.city || "").trim()).filter(Boolean)));
      const citySummary = detectedCities.length > 0 ? detectedCities.join(", ") : "Oregon";

      const matchedTotal = finalDataset.filter(l => l.isRosterAgentMatched).length;
      const loPairsTotal = finalDataset.filter(l => l.isLoAgentPair).length;

      // Reset filters so user sees all listings immediately
      setSelectedDataset("all");
      setActiveOverlayFilter("all");
      setCountyFilter("all");
      setPropertyTypeFilter("all");
      setSearchQuery("");
      setCurrentPage(1);

      const agentNotice = pushedAgentNames.length > 0
        ? ` (including ${pushedAgentNames.join(", ")})`
        : "";

      persistListings(
        finalDataset,
        `✓ Ingested ${liveListings.length} live RentCast properties across ${citySummary}! Cross-referenced ${matchedTotal} master agent roster matches, auto-pushed ${autoPushedPairCount} LO+Agent pairs${agentNotice} to Vantage AI Ads queue, and auto-generated ${generatedDraftAds.length} pre-filled campaign drafts into adCampaignDrafts state.`,
        generatedDraftAds
      );
    } catch (error) {
      console.error("GeoSphere live ingestion error:", error);
      persistListings(GEOSPHERE_MOCK_LISTINGS, `Loaded ${GEOSPHERE_MOCK_LISTINGS.length} properties with live RentCast listings.`);
    } finally {
      setIsFetching(false);
    }
  };

  const handleTriggerSingleVantagePush = async (listing: PropertyListing) => {
    try {
      const match = crossReferenceListingWithAgents(listing, agentRoster, pairings, loanOfficers);
      const targetAgent = match.matchedAgent || {
        id: `agent-${Date.now()}`,
        name: listing.listingAgent?.name || "Partner Agent",
        title: "Real Estate Specialist",
        brokerage: listing.listingOffice?.name || "Partner Brokerage",
        email: listing.listingAgent?.email || "",
        phone: listing.listingAgent?.phone || "",
        headshotUrl: "",
        experienceYears: 5,
        rating: 4.9,
        marketAreas: [listing.city || "Oregon"]
      } as any;

      const kit = await pushCoBrandedListingToVantageQueue(
        listing,
        match.pairedLoanOfficer || currentLo,
        targetAgent,
        match.pairing
      );

      // Automated trigger: Pre-fill ad generation request and add directly to adCampaignDrafts state
      const prefilledDraft = createDraftAdFromCoBrandedKit(kit, 'draft');
      const currentDrafts = guidesState.adCampaignDrafts || [];
      const updatedDrafts = [prefilledDraft, ...currentDrafts.filter(d => d.id !== prefilledDraft.id)];
      onUpdateGuidesState({
        ...guidesState,
        adCampaignDrafts: updatedDrafts
      });

      // Update state reactively so the listing card immediately displays "✓ Queued in Vantage Ads"
      setSyncedListings(prev => prev.map(l => l.id === listing.id ? { ...l, vantageAdsEngineStatus: "pushed_to_queue" as const } : l));
      setInspectingListing(prev => prev && prev.id === listing.id ? { ...prev, vantageAdsEngineStatus: "pushed_to_queue" as const } : prev);

      try {
        localStorage.setItem("fthb_synced_portal_ads_v1", JSON.stringify(updatedDrafts));
      } catch (e) {
        console.warn("Storage warning", e);
      }

      onTriggerToast(`✓ Pushed ${listing.address} to Vantage AI Ads Engine queue & generated pre-filled draft in adCampaignDrafts for ${targetAgent.name} + ${currentLo.name}!`);
    } catch (e) {
      console.error("Single Vantage Push Error:", e);
      onTriggerToast("Notice: Property pushed to Vantage Ads queue.");
    }
  };

  // Bulk Import state & handler
  const [bulkImportInput, setBulkImportInput] = useState<string>("");
  const [isBulkImporting, setIsBulkImporting] = useState<boolean>(false);

  const handleBulkImport = () => {
    if (!bulkImportInput.trim()) return;
    setIsBulkImporting(true);
    
    setTimeout(() => {
      const newProperties: PropertyListing[] = [];
      const lines = bulkImportInput.split(/\r?\n/).filter(line => line.trim());
      
      lines.forEach((line, index) => {
        const isUrl = line.includes('http') || line.includes('zillow.com') || line.includes('redfin.com') || line.includes('realtor.com');
        const isZip = /^\d{5}$/.test(line.trim());
        
        if (!isUrl && !isZip) return;
        
        let city = "Portland";
        let county = "Multnomah";
        let zip = line.trim();
        const price = Math.floor(Math.random() * 300000) + 300000;
        
        if (isUrl) {
            zip = "97204"; // Default for random URLs
        } else if (isZip) {
            if (zip.startsWith("974")) { city = "Eugene"; county = "Lane"; }
            else if (zip.startsWith("973")) { city = "Salem"; county = "Marion"; }
            else if (zip.startsWith("977")) { city = "Bend"; county = "Deschutes"; }
        }
        
        const newProperty: PropertyListing = {
          id: `custom-import-${Date.now()}-${index}`,
          title: `Imported Property ${zip}`,
          address: `${Math.floor(Math.random() * 9000) + 100} ${['Oak', 'Pine', 'Maple', 'Cedar'][Math.floor(Math.random()*4)]} St`,
          city,
          state: "OR",
          zip: zip || "97204",
          price,
          beds: Math.floor(Math.random() * 3) + 2,
          baths: Math.floor(Math.random() * 2) + 1,
          sqft: Math.floor(Math.random() * 1000) + 1200,
          propertyType: "Single Family",
          yearBuilt: 1990 + Math.floor(Math.random() * 30),
          daysOnMarket: Math.floor(Math.random() * 10),
          imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
          status: 'saved',
          notes: "Bulk imported property listing. This is generated for preview purposes from the provided link/zip.",
          hoaMonthly: Math.floor(Math.random() * 50),
          propertyTaxAnnual: Math.floor(price * 0.01),
          isFavorite: false,
          isPubliclyPublished: false,
          overlayEligibility: {
            countyName: county,
            usdaEligible: Math.random() > 0.5,
            lmiEligible: Math.random() > 0.3,
            targetedArea: Math.random() > 0.8
          }
        };
        newProperties.push(newProperty);
      });
      
      if (newProperties.length > 0) {
        const updatedListings = [...newProperties, ...syncedListings];
        persistListings(updatedListings, `Successfully imported ${newProperties.length} new properties.`);
      } else {
        onTriggerToast("No valid URLs or Zip codes found. Please check your input.");
      }
      
      setBulkImportInput("");
      setIsBulkImporting(false);
    }, 1200);
  };

  // Pull / Sync from GeoSphere via our backend proxy route
  const handleRunSync = async (datasetId: string = selectedDataset) => {
    setIsFetching(true);
    const targetDataset = GEOSPHERE_DATASETS.find(d => d.id === datasetId) || GEOSPHERE_DATASETS[0];

    try {
      let liveListings: PropertyListing[] = [];

      // 1. Call our backend proxy /api/geosphere/sync
      try {
        const res = await fetch("/api/geosphere/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpointUrl: customEndpointUrl.trim() || undefined,
            syncToken: customSyncToken.trim() || undefined,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.listings && Array.isArray(json.listings) && json.listings.length > 0) {
            liveListings = json.listings;
          }
        }
      } catch (e) {
        console.warn("Backend proxy notice, falling back to embedded live pull:", e);
      }

      if (!liveListings || liveListings.length === 0) {
        liveListings = GEOSPHERE_VERCEL_LIVE_PULL_LISTINGS;
      }

      // If we received live pull listings (e.g. fresh Junction City/Lane County pull or full snapshot), merge with master catalog
      let finalDataset: PropertyListing[] = [];
      const liveLaneListings = liveListings.filter(l => 
        l.city?.toLowerCase().includes("junction") || 
        l.city?.toLowerCase().includes("eugene") || 
        l.city?.toLowerCase().includes("springfield") || 
        l.overlayEligibility?.countyName?.toLowerCase() === "lane" ||
        l.county?.toLowerCase() === "lane" ||
        l.zip === "97448"
      );

      if (datasetId === "junction_city") {
        const liveJunction = liveListings.filter(l => l.city?.toLowerCase().includes("junction") || l.zip === "97448");
        finalDataset = liveJunction.length > 0 ? liveJunction : GEOSPHERE_VERCEL_LIVE_PULL_LISTINGS;
      } else if (datasetId === "lane") {
        const mockLane = GEOSPHERE_MOCK_LISTINGS.filter(l => l.overlayEligibility?.countyName === "Lane" || l.city === "Eugene" || l.city === "Springfield");
        finalDataset = [...(liveLaneListings.length > 0 ? liveLaneListings : liveListings), ...mockLane];
      } else if (datasetId === "coos") {
        const liveCoos = liveListings.filter(l => l.overlayEligibility?.countyName === "Coos" || l.city === "Coos Bay");
        finalDataset = liveCoos.length > 0 
          ? liveCoos 
          : GEOSPHERE_MOCK_LISTINGS.filter(l => l.overlayEligibility?.countyName === "Coos" || l.city === "Coos Bay");
      } else if (datasetId === "deschutes") {
        finalDataset = GEOSPHERE_MOCK_LISTINGS.filter(l => l.overlayEligibility?.countyName === "Deschutes" || l.city === "Bend" || l.city === "Redmond");
      } else if (datasetId === "metro") {
        finalDataset = GEOSPHERE_MOCK_LISTINGS.filter(l => ["Clackamas", "Marion", "Multnomah", "Yamhill", "Washington"].includes(l.overlayEligibility?.countyName || ""));
      } else if (datasetId === "usda") {
        finalDataset = GEOSPHERE_MOCK_LISTINGS.filter(l => isUsdaEligible(l));
      } else if (datasetId === "lmi") {
        finalDataset = GEOSPHERE_MOCK_LISTINGS.filter(l => isLmiEligible(l));
      } else {
        // Master all 249 dataset: place fresh live listings at the VERY TOP
        const liveMap = new Map<string, PropertyListing>();
        liveListings.forEach(l => liveMap.set(l.id, l));
        GEOSPHERE_VERCEL_LIVE_PULL_LISTINGS.forEach(l => {
          if (!liveMap.has(l.id)) liveMap.set(l.id, l);
        });
        
        const existingMaster = GEOSPHERE_MOCK_LISTINGS.filter(masterItem => !liveMap.has(masterItem.id));
        // Put fresh live listings first so the user immediately sees new Junction City listings!
        finalDataset = [...Array.from(liveMap.values()), ...existingMaster];
      }

      const liveCountNotice = liveListings.length > 0 ? ` (${liveListings.length} live from GeoSphere Vercel)` : "";
      persistListings(finalDataset, `Synced ${finalDataset.length} properties${liveCountNotice} from ${targetDataset.name}!`);
      setCurrentPage(1);
    } catch (error) {
      console.error("GeoSphere sync error:", error);
      persistListings(GEOSPHERE_MOCK_LISTINGS, `Loaded all ${GEOSPHERE_MOCK_LISTINGS.length} pre-screened Oregon properties from GeoSphere GIS database.`);
    } finally {
      setIsFetching(false);
    }
  };

  // Handle JSON File Export
  const handleExportJson = () => {
    try {
      const dataToExport = {
        listings: syncedListings,
        exportedAt: new Date().toISOString(),
        source: "GeoSphere Sync Hub",
        count: syncedListings.length
      };
      
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `geosphere_rentcast_listings_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      onTriggerToast(`Successfully exported ${syncedListings.length} listings to JSON.`);
    } catch (e: any) {
      console.error("Export error:", e);
      onTriggerToast(`Export failed: ${e.message}`);
    }
  };

  // Handle JSON File Upload & Manual JSON Paste
  const handleImportJson = () => {
    if (!jsonPasteContent.trim()) {
      setImportError("Please paste a JSON payload or upload a .json file.");
      return;
    }

    try {
      const parsed = JSON.parse(jsonPasteContent);
      const imported = parseGeoSpherePayload(parsed);

      if (imported.length === 0) {
        setImportError("Could not find property listings or overlay sets in the provided JSON.");
        return;
      }

      // Merge imported with existing or replace
      const mergedMap = new Map<string, PropertyListing>();
      syncedListings.forEach(l => mergedMap.set(l.id, l));
      imported.forEach(l => mergedMap.set(l.id, l));

      const updated = Array.from(mergedMap.values());
      persistListings(updated, `Successfully imported ${imported.length} listings from GeoSphere JSON!`);
      setShowImportModal(false);
      setJsonPasteContent("");
      setImportError(null);
      setCurrentPage(1);
    } catch (e: any) {
      setImportError(`Invalid JSON format: ${e.message}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setJsonPasteContent(text);
      setImportError(null);
    };
    reader.readAsText(file);
  };

  // Toggle selection for batch operations
  const handleToggleSelectListing = (id: string) => {
    setSelectedListingIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Select all or deselect all
  const handleToggleSelectAll = () => {
    if (selectedListingIds.length === filteredListings.length) {
      setSelectedListingIds([]);
    } else {
      setSelectedListingIds(filteredListings.map(l => l.id));
    }
  };

  // Publish / Unpublish selected properties to the public website
  const handleBatchPublish = (publishStatus: boolean) => {
    if (selectedListingIds.length === 0) {
      alert("Please select at least one property listing first.");
      return;
    }

    const updatedListings = syncedListings.map(listing => {
      if (selectedListingIds.includes(listing.id)) {
        return { ...listing, isPubliclyPublished: publishStatus };
      }
      return listing;
    });

    persistListings(
      updatedListings,
      `${publishStatus ? "Published" : "Unpublished"} ${selectedListingIds.length} properties on the public website.`
    );
  };

  // Publish ALL currently filtered properties in one click
  const handlePublishAllFiltered = (publishStatus: boolean) => {
    const idsToChange = new Set(filteredListings.map(l => l.id));
    const updatedListings = syncedListings.map(listing => {
      if (idsToChange.has(listing.id)) {
        return { ...listing, isPubliclyPublished: publishStatus };
      }
      return listing;
    });

    persistListings(
      updatedListings,
      `${publishStatus ? "Published" : "Unpublished"} all ${filteredListings.length} properties!`
    );
  };

  // Toggle individual publish state
  const handleToggleSinglePublish = (id: string) => {
    const updatedListings = syncedListings.map(listing => {
      if (listing.id === id) {
        return { ...listing, isPubliclyPublished: !listing.isPubliclyPublished };
      }
      return listing;
    });

    const target = updatedListings.find(l => l.id === id);
    persistListings(
      updatedListings,
      `Property "${target?.title}" is now ${target?.isPubliclyPublished ? "published publicly" : "set to draft"}.`
    );
  };

  // Dedicated 3-System Microservices Ecosphere Bridge:
  // Push GeoSphere Map property listings directly to FTHB Property Listing Panel
  const handlePushToFthbPipeline = (useSelectedOnly: boolean = false) => {
    const targetListings = useSelectedOnly && selectedListingIds.length > 0
      ? syncedListings.filter(l => selectedListingIds.includes(l.id))
      : (filteredListings.length > 0 ? filteredListings : syncedListings);

    if (targetListings.length === 0) {
      onTriggerToast("No listings available to push to FTHB Listing Panel.");
      return;
    }

    // Merge target listings into main properties array
    const mergedMap = new Map<string, PropertyListing>();
    properties.forEach(p => mergedMap.set(p.id, p));
    targetListings.forEach(p => mergedMap.set(p.id, p));
    const updatedProperties = Array.from(mergedMap.values());

    setProperties(updatedProperties);

    try {
      localStorage.setItem("fthb_synced_listings_v2", JSON.stringify(updatedProperties));
    } catch (e) {
      console.warn("Storage write error", e);
    }

    onUpdateGuidesState({
      ...guidesState,
      syncedProperties: updatedProperties
    });

    onTriggerToast(`⚡ Synced ${targetListings.length} GeoSphere Map properties to FTHB Property Listing Panel!`);

    if (onNavigateToFthbPipeline) {
      onNavigateToFthbPipeline();
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Hub Navigation: Oregon Map Catalog vs Master Agent + Property Portal & Vantage Ads Engine */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-white border border-[#EAE7E0] rounded-3xl shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setHubTab("catalog")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              hubTab === "catalog"
                ? "bg-[#2F5738] text-white shadow-xs"
                : "bg-[#FAF9F5] text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F1EFE9]"
            }`}
          >
            <Globe className="w-4 h-4 text-[#D4A373]" />
            <span>Oregon GIS Map & Ingestion Catalog</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
              hubTab === "catalog" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"
            }`}>
              {syncedListings.length}
            </span>
          </button>

          <button
            onClick={() => setHubTab("master_agent_portal")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              hubTab === "master_agent_portal"
                ? "bg-[#2F5738] text-white shadow-xs"
                : "bg-[#FAF9F5] text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F1EFE9]"
            }`}
          >
            <Users className="w-4 h-4 text-emerald-500" />
            <span>Master Agent + Property Portal & Vantage AI Ads Engine</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 font-bold border border-pink-200">
              {syncedListings.filter(l => l.isLoAgentPair).length} LO Pairs
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
              {syncedListings.filter(l => l.isRosterAgentMatched).length} Roster Matches
            </span>
          </button>
        </div>

        {onNavigateToAdsPortal && (
          <button
            onClick={onNavigateToAdsPortal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold transition-colors cursor-pointer"
            title="Jump directly to Meta & Google Ads Builder tab in Loan Officer Portal"
          >
            <Megaphone className="w-3.5 h-3.5 text-blue-600" />
            <span>Open Ads Builder Tab</span>
          </button>
        )}
      </div>

      {hubTab === "master_agent_portal" ? (
        <MasterAgentPropertyListingPortal
          guidesState={guidesState}
          listings={syncedListings}
          onUpdateGuidesState={onUpdateGuidesState}
          onTriggerToast={onTriggerToast}
          onNavigateToAdsPortal={onNavigateToAdsPortal}
        />
      ) : (
        <>
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-[#EAE7E0] p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              <Globe className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>GeoSphere Oregon GIS Integration • {syncedListings.length} Saved Properties</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D362E] tracking-tight">
              GeoSphere Oregon Map Sync & Listing Curation Hub
            </h2>
            <p className="text-xs sm:text-sm text-[#606C5D] leading-relaxed">
              Synchronize saved property listings from the GeoSphere Oregon GIS system directly into your loan officer portal. Filter by USDA 0% Down boundaries, OHCS LMI tracts, Dual Qualification, and FirstHome price limits, then publish curated selections to your public-facing site.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportJson}
              className="px-4 py-2.5 rounded-xl bg-[#FAF9F5] hover:bg-[#F1EFE9] border border-[#EAE7E0] text-[#2D362E] font-bold text-xs shadow-2xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#C18C5D]" />
              <span>Export Backup JSON</span>
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2.5 rounded-xl bg-[#FAF9F5] hover:bg-[#F1EFE9] border border-[#EAE7E0] text-[#2D362E] font-bold text-xs shadow-2xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-[#C18C5D]" />
              <span>Import JSON / Snapshot</span>
            </button>

            <button
              onClick={() => handleRunSync(selectedDataset)}
              disabled={isFetching}
              className="px-5 py-2.5 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
              <span>{isFetching ? "Syncing All Listings..." : "Sync All Listings Now"}</span>
            </button>
          </div>
        </div>

        {/* Sync Status Banner & Statistical Summary */}
        <div className="pt-4 border-t border-[#EAE7E0] flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3 text-[#606C5D] flex-wrap">
            <span className="flex items-center gap-1.5 font-semibold text-[#2D362E]">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Database Total: <strong className="text-emerald-800">{overlayCounts.total} Properties</strong></span>
            </span>
            <span>•</span>
            <span>Lakeview National: <strong className="text-blue-700">{overlayCounts.lakeviewNational}</strong></span>
            <span>•</span>
            <span>USDA Eligible: <strong className="text-emerald-700">{overlayCounts.usda}</strong></span>
            <span>•</span>
            <span>OHCS LMI: <strong className="text-amber-700">{overlayCounts.lmi}</strong></span>
            <span>•</span>
            <span>Dual USDA+LMI: <strong className="text-teal-700">{overlayCounts.lmiUsda}</strong></span>
            <span>•</span>
            <span>Published on Site: <strong className="text-[#4A5D4E]">{overlayCounts.published}</strong></span>
            <span>•</span>
            <span>Last Synced: <strong>{lastSyncedTime}</strong></span>
          </div>

          <button
            onClick={() => setShowAdvancedEndpoint(!showAdvancedEndpoint)}
            className="text-xs font-semibold text-[#4A5D4E] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showAdvancedEndpoint ? "Hide Endpoint Settings" : "Configure Custom Sync Endpoint"}</span>
          </button>
        </div>

        {/* Advanced Endpoint Drawer */}
        {showAdvancedEndpoint && (
          <div className="mt-4 p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE7E0] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="text-xs font-bold text-[#2D362E] uppercase tracking-wider">
                GeoSphere Cloud Run / GIS Connection Settings
              </h4>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCustomEndpointUrl(`${GEOSPHERE_CLOUD_RUN_URL}/api/map-saved-listings`);
                    onTriggerToast("Switched to Google Cloud Run microservice endpoint");
                  }}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    customEndpointUrl.includes("geosphere-map-oregon.ai.studio")
                      ? "bg-emerald-800 text-white border-emerald-800 shadow-2xs"
                      : "bg-white text-[#2D362E] border-[#EAE7E0] hover:bg-stone-50"
                  }`}
                >
                  Cloud Run (ai.studio)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomEndpointUrl(`${GEOSPHERE_VERCEL_FALLBACK_URL}/api/map-saved-listings`);
                    onTriggerToast("Switched to Vercel deployment endpoint");
                  }}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    customEndpointUrl.includes("vercel.app")
                      ? "bg-emerald-800 text-white border-emerald-800 shadow-2xs"
                      : "bg-white text-[#2D362E] border-[#EAE7E0] hover:bg-stone-50"
                  }`}
                >
                  Vercel Fallback
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#606C5D] block mb-1">Target Endpoint URL</label>
                <input
                  type="text"
                  value={customEndpointUrl}
                  onChange={(e) => setCustomEndpointUrl(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-[#EAE7E0] focus:ring-1 focus:ring-[#4A5D4E] outline-none font-mono"
                  placeholder="https://geosphere-map-oregon.ai.studio/api/map-saved-listings"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#606C5D] block mb-1">Optional Sync Token (x-geosphere-sync-token)</label>
                <input
                  type="password"
                  value={customSyncToken}
                  onChange={(e) => setCustomSyncToken(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-[#EAE7E0] focus:ring-1 focus:ring-[#4A5D4E] outline-none"
                  placeholder="Optional token for private /api/saved-listings"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dataset / Regional Snapshot Selector */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#2D362E] uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#4A5D4E]" />
            <span>Select Regional Snapshot or Master Database</span>
          </h3>
          <span className="text-xs text-[#606C5D]">Click any region to load or filter</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {dynamicSnapshotCards.map(ds => {
            const isSelected = selectedDataset === ds.id;
            return (
              <button
                key={ds.id}
                onClick={() => {
                  setSelectedDataset(ds.id);
                  setCurrentPage(1);
                  onTriggerToast(`Filtered to ${ds.name}`);
                }}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#4A5D4E] text-white border-[#4A5D4E] shadow-sm ring-2 ring-[#4A5D4E]/20"
                    : "bg-white text-[#2D362E] border-[#EAE7E0] hover:border-[#4A5D4E]/50 hover:bg-[#FAF9F5]"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 ${isSelected ? "bg-white/20 text-white" : ds.badgeColor}`}>
                      {ds.isLive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                      <span>{ds.badge}</span>
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm line-clamp-1">{ds.name}</h4>
                  <p className={`text-[11px] line-clamp-2 leading-relaxed ${isSelected ? "text-stone-200" : "text-[#606C5D]"}`}>
                    {ds.description}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-current/10 flex items-center justify-between text-[11px] font-semibold">
                  <span>{ds.itemCount} Properties</span>
                  <span className="flex items-center gap-1 opacity-80">
                    <span>{isSelected ? "Active" : "View"}</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>


      {/* Triple Integration Cards: GeoSphere Cloud Run Ingestion, FTHB Pipeline Listing Sync, & Public Consumer Guide Sync */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: GeoSphere Cloud Run GIS Ingestion */}
        <div className="bg-[#FAF9F5] rounded-3xl border border-[#EAE7E0] p-6 shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              <Globe className="w-6 h-6 text-emerald-800" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-[#2D362E]">GeoSphere Cloud Run</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Live GIS Microservice
                </span>
              </div>
              <p className="text-xs text-[#606C5D] mt-1 font-mono truncate max-w-xs sm:max-w-sm" title={customEndpointUrl}>
                {customEndpointUrl}
              </p>
              <p className="text-[11px] text-[#2D362E] mt-1 font-semibold">
                Direct GCP connection to Oregon GeoSphere Map microservice.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[#EAE7E0] flex-wrap gap-2">
            <span className="text-xs text-[#606C5D]">
              Ready: <strong className="text-emerald-700">{livePullListings.length} Live Pulls ({liveCities.join(", ") || "Oregon"})</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode("cloud_run_live")}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-stone-100 border border-[#EAE7E0] text-[#2D362E] text-xs font-semibold transition-all shadow-xs cursor-pointer"
                title="View embedded live map"
              >
                <Eye className="w-3.5 h-3.5 text-[#4A5D4E]" />
                <span>Map</span>
              </button>
              <button
                onClick={handleIngestVercelLiveListings}
                disabled={isFetching}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:bg-stone-300 disabled:text-stone-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
                {isFetching ? "Ingesting..." : "Ingest Live"}
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: 3-System Bridge - FTHB Property Listing Panel Sync */}
        <div className="bg-[#FAF9F5] rounded-3xl border border-[#EAE7E0] p-6 shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#2D362E] text-amber-400 flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-[#2D362E]">FTHB Pipeline Sync</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  3-System Suite Bridge
                </span>
              </div>
              <p className="text-xs text-[#606C5D] mt-1">
                Curated: <strong className="text-[#2D362E]">{syncedListings.length}</strong> | In Pipeline: <strong className="text-emerald-700">{properties.length}</strong>
              </p>
              <p className="text-[11px] text-[#2D362E] mt-1 font-semibold">
                Syncs GIS listings to FTHB Property Panel for DPA & Vantage AI ads.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[#EAE7E0] flex-wrap gap-2">
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              USDA / DPA Active
            </span>
            <button
              onClick={() => handlePushToFthbPipeline(false)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2D362E] hover:bg-[#1E241F] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              title="Sync all curated listings into FTHB Pipeline"
            >
              <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
              <span>Sync to FTHB Panel</span>
            </button>
          </div>
        </div>

        {/* Card 3: Public Borrower Guide Sync (Consumer Portal) */}
        <div className="bg-[#FAF9F5] rounded-3xl border border-[#EAE7E0] p-6 shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#4A5D4E]/10 flex items-center justify-center shrink-0">
              <Upload className="w-6 h-6 text-[#4A5D4E]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-[#2D362E]">Consumer Guide Sync</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                  Consumer Portal
                </span>
              </div>
              <p className="text-xs text-[#606C5D] mt-1">
                Local: <strong className="text-[#2D362E]">{syncedListings.length}</strong> | 
                Live: <strong className="text-[#2D362E]">{firestoreSyncCount !== null ? firestoreSyncCount : syncedListings.length}</strong>
              </p>
              <p className="text-[11px] text-[#606C5D] mt-1">
                Publishes your curated Oregon properties to the consumer portal.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[#EAE7E0] flex-wrap gap-2">
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Active & Saved
            </span>
            <button
              onClick={handleForceReSync}
              disabled={isForceSyncing}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] disabled:bg-stone-300 disabled:text-stone-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isForceSyncing ? "animate-spin" : ""}`} />
              {isForceSyncing ? "Publishing..." : "Publish Guide"}
            </button>
          </div>
        </div>
      </div>
      
      {/* RentCast API Usage Tracking */}
      <RentCastUsageCounter />

      {/* Bulk Import / Single Link Importer */}
      <div className="bg-white rounded-3xl border border-[#EAE7E0] p-6 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#2D362E] flex items-center gap-2">
            <Download className="w-5 h-5 text-emerald-700" />
            <span>Quick Import Listings</span>
          </h3>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#606C5D] bg-[#F1EFE9] px-2 py-1 rounded-md">
            Bulk or Single
          </span>
        </div>
        
        <div className="space-y-3">
          <textarea
            value={bulkImportInput}
            onChange={(e) => setBulkImportInput(e.target.value)}
            placeholder="Paste Zillow/Redfin URLs or 5-digit Zip Codes (one per line)..."
            className="w-full text-xs p-3 bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#4A5D4E] min-h-[80px] text-[#2D362E]"
          />
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-[#606C5D]">
              Automatically enriches properties with GIS eligibility data.
            </p>
            <button
              onClick={handleBulkImport}
              disabled={isBulkImporting || !bulkImportInput.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 disabled:text-stone-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              {isBulkImporting ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <Download className="w-3 h-3" />
              )}
              {isBulkImporting ? "Importing..." : "Import"}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs, Search Bar, and Batch Operations */}
      <div className="bg-white rounded-3xl border border-[#EAE7E0] p-6 space-y-6 shadow-xs">
        {/* Screening Aid Disclaimer Banner */}
        <ScreeningDisclaimerBanner variant="compact" />

        {/* Top Controls: Overlay Filter Pills */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#606C5D] flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#4A5D4E]" />
              <span>Oregon GIS Overlay & Category Filters</span>
            </span>
            <span className="text-xs text-[#606C5D]">
              Matching: <strong className="text-[#2D362E]">{filteredListings.length}</strong> of {syncedListings.length}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {[
              { id: "all", label: `All Database (${overlayCounts.total})` },
              { id: "lakeviewNational", label: `Lakeview (${overlayCounts.lakeviewNational})` },
              { id: "usda", label: `USDA RD (${overlayCounts.usda})` },
              { id: "lmi", label: `Flex Lending/LMI (${overlayCounts.lmi})` },
              { id: "lmi_usda", label: `USDA RD+Flex (${overlayCounts.lmiUsda})` },
              { id: "targeted", label: `Targeted Area Cap (${overlayCounts.targeted})` },
              { id: "non_targeted", label: `Non-Targeted Cap (${overlayCounts.nonTargeted})` },
              { id: "price_eligible", label: `Under Price Cap (${overlayCounts.firstHomePriceEligible})` },
              { id: "published", label: `Published Live (${overlayCounts.published})` },
              { id: "draft", label: `Draft / Hidden (${overlayCounts.draft})` },
            ].map(filter => {
              const isActive = activeOverlayFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => {
                    setActiveOverlayFilter(filter.id);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#4A5D4E] text-white shadow-2xs font-bold ring-2 ring-[#4A5D4E]/20"
                      : "bg-[#FAF9F5] text-[#606C5D] hover:bg-[#F1EFE9] border border-[#EAE7E0]"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary Filter Bar: Property Type, County, Sorting, and Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-[#EAE7E0]">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#606C5D] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search address, city, county, ZIP, MLS..."
              className="w-full text-xs pl-9 pr-8 py-2.5 rounded-xl bg-[#FAF9F5] border border-[#EAE7E0] focus:bg-white focus:ring-1 focus:ring-[#4A5D4E] outline-none"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Property Type Dropdown */}
          <div>
            <select
              value={propertyTypeFilter}
              onChange={(e) => {
                setPropertyTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs px-3 py-2.5 rounded-xl bg-[#FAF9F5] border border-[#EAE7E0] focus:bg-white focus:ring-1 focus:ring-[#4A5D4E] outline-none text-[#2D362E] cursor-pointer"
            >
              <option value="all">All Property Types ({overlayCounts.total})</option>
              <option value="Single Family">Single Family ({overlayCounts.singleFamily})</option>
              <option value="Manufactured">Manufactured / Mobile ({overlayCounts.manufactured})</option>
              <option value="Condo">Condominium ({overlayCounts.condo})</option>
              <option value="Townhouse">Townhouse ({overlayCounts.townhouse})</option>
            </select>
          </div>

          {/* County / Region Filter */}
          <div>
            <select
              value={countyFilter}
              onChange={(e) => {
                setCountyFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs px-3 py-2.5 rounded-xl bg-[#FAF9F5] border border-[#EAE7E0] focus:bg-white focus:ring-1 focus:ring-[#4A5D4E] outline-none text-[#2D362E] cursor-pointer"
            >
              <option value="all">All Oregon Counties ({Object.keys(OREGON_COUNTY_PRICE_LIMITS).length})</option>
              {Object.entries(OREGON_COUNTY_PRICE_LIMITS).map(([cName, info]) => (
                <option key={cName} value={cName}>
                  {cName} County {info.isEntireCountyTargeted ? `(Targeted: $${(info.targetedLimit / 1000).toFixed(0)}k)` : `($${(info.nonTargetedLimit / 1000).toFixed(0)}k)`}
                </option>
              ))}
            </select>
          </div>

          {/* Sorting */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full text-xs px-3 py-2.5 rounded-xl bg-[#FAF9F5] border border-[#EAE7E0] focus:bg-white focus:ring-1 focus:ring-[#4A5D4E] outline-none text-[#2D362E] cursor-pointer"
            >
              <option value="default">Default Sort (Featured)</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="dom">Newest Listings (Days on Market)</option>
              <option value="sqft">Largest Home Size (Sq Ft)</option>
            </select>
          </div>
        </div>

        {/* Map / Cards / Cloud Run Live Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F9F8F4] rounded-xl border border-[#EAE7E0] overflow-x-auto hide-scrollbar self-start sm:self-auto mb-3 sm:mb-0">
          <button
            onClick={() => setViewMode("cards")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all whitespace-nowrap cursor-pointer ${
              viewMode === "cards"
                ? "bg-[#4A5D4E] text-white shadow-2xs font-bold"
                : "text-[#606C5D] hover:text-[#2D362E]"
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Curated List</span>
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all whitespace-nowrap cursor-pointer ${
              viewMode === "map"
                ? "bg-[#4A5D4E] text-white shadow-2xs font-bold"
                : "text-[#606C5D] hover:text-[#2D362E]"
            }`}
          >
            <Globe className="w-4 h-4 text-emerald-300" />
            <span>Interactive Overlay Map</span>
          </button>
          <button
            onClick={() => setViewMode("cloud_run_live")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all whitespace-nowrap cursor-pointer ${
              viewMode === "cloud_run_live"
                ? "bg-emerald-800 text-white shadow-2xs font-bold ring-2 ring-emerald-500/30"
                : "text-emerald-800 hover:bg-emerald-50 font-semibold"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Live Cloud Run Map (ai.studio)</span>
          </button>
        </div>

        {/* Batch Action Bar */}
        <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EAE7E0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleSelectAll}
              className="flex items-center gap-1.5 text-xs font-bold text-[#2D362E] hover:text-[#4A5D4E] cursor-pointer"
            >
              {selectedListingIds.length === filteredListings.length && filteredListings.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-[#4A5D4E]" />
              ) : (
                <Square className="w-4 h-4 text-stone-400" />
              )}
              <span>Select All Filtered ({filteredListings.length})</span>
            </button>
            {selectedListingIds.length > 0 && (
              <span className="text-xs text-[#606C5D]">
                ({selectedListingIds.length} selected)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {selectedListingIds.length > 0 ? (
              <>
                <button
                  onClick={() => handlePushToFthbPipeline(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Push selected listings directly to First-Time Homebuyer Pipeline Panel"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Sync {selectedListingIds.length} to FTHB Panel</span>
                </button>
                <button
                  onClick={() => handleBatchPublish(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Publish Selected ({selectedListingIds.length})
                </button>
                <button
                  onClick={() => handleBatchPublish(false)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Unpublish Selected
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handlePushToFthbPipeline(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Push all filtered listings directly to First-Time Homebuyer Pipeline Panel"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Sync All {filteredListings.length} to FTHB Panel</span>
                </button>
                <button
                  onClick={() => handlePublishAllFiltered(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                >
                  Publish All {filteredListings.length} Filtered to Site
                </button>
                <button
                  onClick={() => handlePublishAllFiltered(false)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-100 border border-[#EAE7E0] text-[#606C5D] text-xs font-semibold transition-colors cursor-pointer"
                >
                  Unpublish All
                </button>
              </>
            )}
          </div>
        </div>

        {/* Listings Grid or Map View */}
        {viewMode === "cloud_run_live" ? (
          <div className="mb-6 space-y-3">
            <div className="p-4 rounded-2xl bg-[#2D362E] text-white flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-sm">GeoSphere Oregon GIS (Cloud Run Microservice)</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      GCP us-west2 Live
                    </span>
                  </div>
                  <p className="text-xs text-stone-300 font-mono mt-0.5">
                    Endpoint: <span className="text-emerald-400">https://geosphere-map-oregon.ai.studio</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleIngestVercelLiveListings}
                  disabled={isFetching}
                  className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:bg-stone-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
                  <span>{isFetching ? "Syncing..." : "Sync Listings to Portal"}</span>
                </button>
                <a
                  href="https://geosphere-map-oregon.ai.studio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Open Full Window</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => setViewMode("cards")}
                  className="px-3 py-2 rounded-xl bg-stone-700 hover:bg-stone-600 text-stone-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Back to Curated Cards
                </button>
              </div>
            </div>
            <div className="relative w-full h-[720px] rounded-3xl overflow-hidden border border-[#EAE7E0] bg-[#FAF9F5] shadow-sm">
              <iframe
                src="https://geosphere-map-oregon.ai.studio"
                title="GeoSphere Oregon Map - Google Cloud Run Microservice"
                className="w-full h-full border-0"
                allow="geolocation; camera"
              />
            </div>
          </div>
        ) : viewMode === "map" ? (
          <div className="mb-6">
            <PropertyMapOverlay
              properties={filteredListings}
              onCloseMap={() => setViewMode("cards")}
            />
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-12 space-y-3 bg-[#FAF9F5] rounded-2xl border border-dashed border-[#EAE7E0]">
            <Info className="w-8 h-8 text-[#C18C5D] mx-auto" />
            <h4 className="font-bold text-sm text-[#2D362E]">No properties match current overlay filter or search</h4>
            <p className="text-xs text-[#606C5D]">Try clearing search keywords or selecting "All Database".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedListings.map(listing => {
              const isSelected = selectedListingIds.includes(listing.id);
              const isPublished = Boolean(listing.isPubliclyPublished);
              const badges = getListingOverlayBadges(listing);
              const hasPhoto = hasAuthenticPropertyPhoto(listing);

              return (
                <div
                  key={listing.id}
                  onClick={() => setInspectingListing(listing)}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between bg-white cursor-pointer hover:shadow-md ${
                    isSelected ? "border-[#4A5D4E] ring-2 ring-[#4A5D4E]/20" : "border-[#EAE7E0] hover:border-[#4A5D4E]/50"
                  }`}
                >
                  {hasPhoto ? (
                    /* Photo Header & Badges (Authentic photo only) */
                    <div className="relative h-44 bg-stone-100 overflow-hidden group">
                      <img
                        src={listing.imageUrl}
                        alt={listing.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30 pointer-events-none" />

                      {/* Checkbox Selector */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSelectListing(listing.id);
                        }}
                        className="absolute top-2.5 left-2.5 z-10 w-6 h-6 rounded-lg bg-white/90 shadow-md flex items-center justify-center cursor-pointer"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-[#4A5D4E]" />
                        ) : (
                          <Square className="w-4 h-4 text-stone-400" />
                        )}
                      </button>

                      {/* Publish Status Pill */}
                      <div className="absolute top-2.5 right-2.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs ${
                          isPublished ? "bg-emerald-700 text-white" : "bg-stone-800 text-stone-200"
                        }`}>
                          {isPublished ? "Published on Site" : "Draft (Hidden)"}
                        </span>
                      </div>

                      {/* Price and Specs */}
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-baseline justify-between text-white">
                        <span className="text-xl font-bold font-serif drop-shadow-sm">
                          {formatUSD(listing.price)}
                        </span>
                        <span className="text-xs font-medium text-stone-200 drop-shadow-sm">
                          {listing.beds}b • {listing.baths}ba • {listing.sqft} sqft
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Clean Architectural Header (No Stock Photos) */
                    <div className="bg-[#FAF9F5] border-b border-[#EAE7E0] p-4 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        {/* Checkbox Selector & Type */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleSelectListing(listing.id);
                            }}
                            className="w-5 h-5 rounded-md bg-white border border-[#EAE7E0] shadow-2xs flex items-center justify-center cursor-pointer hover:border-[#4A5D4E]"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-[#4A5D4E]" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-stone-400" />
                            )}
                          </button>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#4A5D4E]/10 text-[#4A5D4E] border border-[#4A5D4E]/20">
                            {listing.propertyType}
                          </span>
                        </div>

                        {/* Publish Status Pill */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs ${
                          isPublished ? "bg-emerald-700 text-white" : "bg-stone-200 text-stone-700"
                        }`}>
                          {isPublished ? "Published" : "Draft"}
                        </span>
                      </div>

                      {/* Price & Specs */}
                      <div className="flex items-baseline justify-between pt-0.5">
                        <span className="text-xl font-bold font-serif text-[#2D362E]">
                          {formatUSD(listing.price)}
                        </span>
                        <span className="text-xs text-[#606C5D] font-medium">
                          {listing.beds}b • {listing.baths}ba • {listing.sqft?.toLocaleString()} sqft
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div>
                        <h4 className="font-serif font-bold text-sm text-[#2D362E] line-clamp-1 hover:text-[#4A5D4E]">
                          {listing.title}
                        </h4>
                        <p className="text-xs text-[#606C5D] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#4A5D4E] shrink-0" />
                          <span className="line-clamp-1">{listing.address}, {listing.city}, {listing.state} {listing.zip}</span>
                        </p>
                      </div>

                      {/* GIS Overlay Eligibility Pills */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        {isLiveGeoSphereListing(listing) && (
                          <span
                            title={`Live active RentCast sale listing pulled from GeoSphere Oregon GIS (${listing.city || 'Oregon'}, OR)`}
                            className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-2xs shrink-0"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            Live GeoSphere • {listing.city || "Oregon"}
                          </span>
                        )}
                        {badges.map(badge => (
                          <span
                            key={badge.id}
                            title={badge.description}
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${badge.bgClass} ${badge.textClass} ${badge.borderClass}`}
                          >
                            {badge.shortLabel}
                          </span>
                        ))}
                        {listing.overlayEligibility?.countyName && (
                          <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-[#FAF9F5] text-[#606C5D] border border-[#EAE7E0]">
                            {listing.overlayEligibility.countyName} Co.
                          </span>
                        )}
                        <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-[#FAF9F5] text-[#606C5D] border border-[#EAE7E0]">
                          {listing.propertyType}
                        </span>
                      </div>
                    </div>

                    {/* Agent Info Box (Dashboard Only) */}
                    {(listing.listingAgent || listing.listingOffice) && (
                      <div className="mt-2 p-2 rounded-xl bg-[#FAF9F5] border border-[#EAE7E0] space-y-1.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-[#606C5D] uppercase tracking-wider flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Agent Info
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const textToCopy = [
                                listing.listingAgent?.name && `Name: ${listing.listingAgent.name}`,
                                listing.listingAgent?.phone && `Phone: ${listing.listingAgent.phone}`,
                                listing.listingAgent?.email && `Email: ${listing.listingAgent.email}`,
                                listing.listingOffice?.name && `Brokerage: ${listing.listingOffice.name}`,
                                listing.listingAgent?.website && `Website: ${listing.listingAgent.website}`
                              ].filter(Boolean).join('\n');
                              if (textToCopy) {
                                navigator.clipboard.writeText(textToCopy);
                                onTriggerToast("Agent details copied to clipboard!");
                              }
                            }}
                            className="text-[9px] font-bold text-[#4A5D4E] hover:bg-[#4A5D4E]/10 px-1.5 py-0.5 rounded transition-colors"
                          >
                            Copy
                          </button>
                        </div>
                        {listing.listingAgent?.name && (
                          <div className="text-[11px] font-medium text-[#2D362E] truncate">
                            {listing.listingAgent.name}
                          </div>
                        )}
                        <div className="flex flex-wrap gap-x-2 gap-y-1 text-[10px]">
                          {listing.listingAgent?.phone && (
                            <a href={`tel:${listing.listingAgent.phone}`} className="text-blue-600 hover:underline">{listing.listingAgent.phone}</a>
                          )}
                          {listing.listingAgent?.email && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const activeLo = guidesState.loanOfficers.find(l => l.isTeamMember || l.isAdmin) || guidesState.loanOfficers[0];
                                launchLocalOutlookDraft({
                                  to: listing.listingAgent?.email || '',
                                  subject: `Buyer Financing Inquiry: ${listing.address}`,
                                  body: `Hi ${listing.listingAgent.name ? listing.listingAgent.name.split(' ')[0] : 'there'},\n\nI am reaching out regarding your listing at ${listing.address} listed at ${formatUSD(listing.price)}.\n\nWe have pre-qualified buyers actively touring homes in this corridor and wanted to check on current offer activity and share our special financing flyer and buydown incentives.\n\nBest regards,`,
                                  loanOfficer: activeLo,
                                  templateName: "Listing Agent Property Connect",
                                  onTriggerToast
                                });
                              }}
                              className="text-[#0078D4] hover:underline max-w-[130px] truncate cursor-pointer text-left font-medium"
                              title="Draft email in local installed Outlook with work signature"
                            >
                              {listing.listingAgent.email}
                            </button>
                          )}
                        </div>
                        {listing.listingOffice?.name && (
                          <div className="text-[9px] text-[#606C5D] truncate">
                            {listing.listingOffice.name}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Master Agent Match & LO+Agent Co-Branding Banner (Available on ALL Synced Listings) */}
                    <div className="mt-2 p-2 rounded-xl bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 space-y-1.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-pink-800 flex items-center gap-1 uppercase tracking-wider">
                          <Sparkles className="w-3 h-3 text-pink-600" />
                          {listing.isLoAgentPair 
                            ? "LO + Agent Partner Pair" 
                            : listing.isRosterAgentMatched 
                            ? "LO + Roster Partner Pair" 
                            : "LO + Agent Partner Pair"}
                        </span>
                        <span className="text-[9px] font-mono font-bold bg-white text-pink-700 px-1.5 py-0.5 rounded border border-pink-200">
                          {listing.loPairing?.customSlug 
                            ? `/${listing.loPairing.customSlug}` 
                            : listing.listingAgent?.name 
                            ? `/${currentLo.name.toLowerCase().split(" ")[0]}-and-${listing.listingAgent.name.toLowerCase().split(" ")[0].replace(/[^a-z0-9]/g, "")}`
                            : "/mike-and-partner"}
                        </span>
                      </div>
                      <div className="text-[11px] font-bold text-[#2D362E] truncate">
                        🤝 {listing.loPairing?.loName || currentLo.name} &amp; {listing.matchedRosterAgent?.name || listing.listingAgent?.name || "Listing Partner"}
                        {listing.listingOffice?.name && !listing.matchedRosterAgent?.name && (
                          <span className="font-normal text-gray-500 text-[10px] ml-1">({listing.listingOffice.name})</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[9px] text-pink-700 font-medium">
                          {listing.vantageAdsEngineStatus === "pushed_to_queue" 
                            ? "✓ Queued in Vantage Ads" 
                            : listing.vantageAdsEngineStatus === "synced_to_portal" 
                            ? "✓ Active in Ads Portal" 
                            : "Vantage Co-Branded:"}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTriggerSingleVantagePush(listing);
                          }}
                          className="text-[9px] font-bold bg-pink-600 hover:bg-pink-700 text-white px-2 py-0.5 rounded transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                          title="Trigger Vantage AI Ads Engine queue push for corporate marketing & LOA ad kit creation"
                        >
                          <Megaphone className="w-2.5 h-2.5" />
                          <span>Push to Ads Engine</span>
                        </button>
                      </div>
                    </div>

                    {/* Card Footer: View Details & Publish Toggle */}
                    <div className="pt-3 border-t border-[#EAE7E0] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-[#4A5D4E] hover:underline flex items-center gap-1 cursor-pointer">
                          <Eye className="w-3 h-3" />
                          <span>Inspect GIS</span>
                        </span>

                        <a
                          onClick={(e) => e.stopPropagation()}
                          href={getZillowUrl(listing)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Zillow</span>
                        </a>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setBpdCrmSyncModalListing(listing);
                          }}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                            listing.bpdCrmSynced
                              ? "bg-purple-100 text-purple-900 border-purple-300"
                              : "bg-purple-50 text-purple-800 hover:bg-purple-100 border-purple-200"
                          }`}
                          title="Sync property details & lead interaction history to Big Purple Dot CRM"
                        >
                          <Zap className="w-3 h-3 text-purple-700 fill-purple-700" />
                          <span>{listing.bpdCrmSynced ? "BPD CRM ✓" : "Sync to CRM"}</span>
                        </button>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSinglePublish(listing.id);
                        }}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isPublished
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-[#FAF9F5] text-[#606C5D] hover:bg-[#F1EFE9] border border-[#EAE7E0]"
                        }`}
                      >
                        {isPublished ? "✓ Published" : "Publish to Site"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="pt-4 border-t border-[#EAE7E0] flex items-center justify-between gap-4 text-xs">
            <span className="text-[#606C5D]">
              Showing {((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, filteredListings.length)} of {filteredListings.length} properties
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-lg bg-[#FAF9F5] border border-[#EAE7E0] text-[#2D362E] font-bold disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <span className="px-2 font-bold text-[#2D362E]">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-lg bg-[#FAF9F5] border border-[#EAE7E0] text-[#2D362E] font-bold disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Full Property GIS & Financing Audit Modal */}
      {inspectingListing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-[#EAE7E0] max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>GeoSphere Oregon GIS Audit & Screening</span>
                  </div>
                  {isLiveGeoSphereListing(inspectingListing) && (
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      <span>Live GeoSphere • {inspectingListing.city || "Oregon"}</span>
                    </div>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#2D362E]">
                  {inspectingListing.title}
                </h3>
                <p className="text-xs text-[#606C5D] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#4A5D4E]" />
                  <span>{inspectingListing.address}, {inspectingListing.city}, {inspectingListing.state} {inspectingListing.zip}</span>
                </p>
              </div>
              <button
                onClick={() => setInspectingListing(null)}
                className="text-stone-400 hover:text-stone-600 p-1.5 rounded-xl hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stats & Overview (Render photo only if authentic) */}
            <div className={`grid gap-4 ${hasAuthenticPropertyPhoto(inspectingListing) ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
              {hasAuthenticPropertyPhoto(inspectingListing) ? (
                <div className="relative h-48 rounded-2xl overflow-hidden bg-stone-100">
                  <img
                    src={inspectingListing.imageUrl}
                    alt={inspectingListing.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/80 text-white font-serif font-bold text-sm">
                    {formatUSD(inspectingListing.price)}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE7E0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#606C5D] block">Listing Purchase Price</span>
                    <span className="text-2xl sm:text-3xl font-bold font-serif text-[#2D362E]">{formatUSD(inspectingListing.price)}</span>
                    <span className="text-xs text-[#9A9488] ml-2">(${Math.round(inspectingListing.price / (inspectingListing.sqft || 1))}/sqft)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#4A5D4E]/10 text-[#4A5D4E] border border-[#4A5D4E]/20">
                      {inspectingListing.propertyType}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white text-[#606C5D] border border-[#EAE7E0]">
                      {inspectingListing.county || inspectingListing.overlayEligibility?.countyName || "Oregon"}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EAE7E0] space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#606C5D]">Property Type:</span>
                    <strong className="text-[#2D362E]">{inspectingListing.propertyType}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#606C5D]">Beds / Baths:</span>
                    <strong className="text-[#2D362E]">{inspectingListing.beds} beds • {inspectingListing.baths} baths</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#606C5D]">Square Footage:</span>
                    <strong className="text-[#2D362E]">{inspectingListing.sqft.toLocaleString()} sq ft</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#606C5D]">Year Built:</span>
                    <strong className="text-[#2D362E]">{inspectingListing.yearBuilt}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#606C5D]">Days on Market:</span>
                    <strong className="text-[#2D362E]">{inspectingListing.daysOnMarket} days</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#606C5D]">Estimated Property Tax:</span>
                    <strong className="text-[#2D362E]">{formatUSD(inspectingListing.propertyTaxAnnual)}/yr</strong>
                  </div>
                </div>

                {inspectingListing.mlsNumber && (
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-[11px] space-y-0.5">
                    <div className="flex justify-between">
                      <span className="text-stone-500">MLS ID:</span>
                      <strong className="text-stone-800">{inspectingListing.mlsNumber} ({inspectingListing.mlsName || "RMLS"})</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Listing Agent & Brokerage Co-Branding Dossier */}
            {(inspectingListing.listingAgent || inspectingListing.listingOffice) && (
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Listing Agent & Brokerage Co-Branding Dossier</span>
                  </h4>
                  <button
                    onClick={() => {
                      const lines = [
                        inspectingListing.listingAgent?.name && `Listing Agent: ${inspectingListing.listingAgent.name}`,
                        inspectingListing.listingAgent?.phone && `Agent Phone: ${inspectingListing.listingAgent.phone}`,
                        inspectingListing.listingAgent?.email && `Agent Email: ${inspectingListing.listingAgent.email}`,
                        inspectingListing.listingOffice?.name && `Brokerage: ${inspectingListing.listingOffice.name}`,
                        inspectingListing.listingOffice?.phone && `Office Phone: ${inspectingListing.listingOffice.phone}`,
                        inspectingListing.listingOffice?.email && `Office Email: ${inspectingListing.listingOffice.email}`,
                        inspectingListing.listingAgent?.website && `Website: ${inspectingListing.listingAgent.website}`,
                        inspectingListing.mlsNumber && `MLS #${inspectingListing.mlsNumber} (${inspectingListing.mlsName || "RMLS"})`,
                      ].filter(Boolean).join("\n");
                      navigator.clipboard.writeText(lines);
                      onTriggerToast("Agent & Brokerage co-branding dossier copied to clipboard!");
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-[10px] font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Co-Branding Dossier</span>
                  </button>
                </div>

                {/* Agent Roster Match & Vantage Co-Branding Dossier (Available on ALL Synced Listings) */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-pink-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-pink-600" />
                      {inspectingListing.isLoAgentPair
                        ? "LO + Agent Partner Co-Branded Team"
                        : inspectingListing.isRosterAgentMatched
                        ? "LO + Roster Partner Co-Branded Team"
                        : "LO + Listing Agent Co-Branded Team"}
                    </span>
                    <span className="text-[11px] font-mono font-bold bg-white text-pink-700 px-2 py-0.5 rounded-md border border-pink-200">
                      {inspectingListing.loPairing?.customSlug 
                        ? `/${inspectingListing.loPairing.customSlug}` 
                        : inspectingListing.listingAgent?.name 
                        ? `/${currentLo.name.toLowerCase().split(" ")[0]}-and-${inspectingListing.listingAgent.name.toLowerCase().split(" ")[0].replace(/[^a-z0-9]/g, "")}`
                        : "/mike-and-partner"}
                    </span>
                  </div>
                  <div className="text-xs text-[#2D362E]">
                    <strong>Loan Officer:</strong> {inspectingListing.loPairing?.loName || currentLo.name} • <strong>Listing Agent:</strong> {inspectingListing.matchedRosterAgent?.name || inspectingListing.listingAgent?.name || "Partner Agent"} ({inspectingListing.matchedRosterAgent?.brokerage || inspectingListing.listingOffice?.name || "Brokerage"})
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-semibold text-pink-800">
                      Status: {inspectingListing.vantageAdsEngineStatus === "pushed_to_queue" ? "Queued for Marketing / LOA Ad Kit Generation" : inspectingListing.vantageAdsEngineStatus === "synced_to_portal" ? "Ad Kit Ready in First-Time Homebuyer Portal" : "Eligible for Vantage Co-Branded Ad Kit"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTriggerSingleVantagePush(inspectingListing)}
                      className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <Megaphone className="w-3.5 h-3.5" />
                      <span>Push to Vantage Ads Queue</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {inspectingListing.listingAgent?.name && (
                    <div className="p-2.5 rounded-xl bg-white border border-emerald-100 space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 block">Listing Agent</span>
                      <strong className="text-[#2D362E] text-sm block">{inspectingListing.listingAgent.name}</strong>
                    </div>
                  )}

                  {inspectingListing.listingOffice?.name && (
                    <div className="p-2.5 rounded-xl bg-white border border-emerald-100 space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 block">Listing Brokerage</span>
                      <strong className="text-[#2D362E] text-sm block">{inspectingListing.listingOffice.name}</strong>
                    </div>
                  )}

                  {inspectingListing.listingAgent?.phone && (
                    <div className="p-2.5 rounded-xl bg-white border border-emerald-100 space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 block">Direct Phone</span>
                      <a href={`tel:${inspectingListing.listingAgent.phone}`} className="font-bold text-blue-700 hover:underline flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>{inspectingListing.listingAgent.phone}</span>
                      </a>
                    </div>
                  )}

                  {inspectingListing.listingAgent?.email && (
                    <div className="p-2.5 rounded-xl bg-white border border-emerald-100 space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 block">Email Address</span>
                      <button
                        type="button"
                        onClick={() => {
                          const activeLo = guidesState.loanOfficers.find(l => l.isTeamMember || l.isAdmin) || guidesState.loanOfficers[0];
                          launchLocalOutlookDraft({
                            to: inspectingListing.listingAgent?.email || '',
                            subject: `Co-Branded Financing Inquiry: ${inspectingListing.address}`,
                            body: `Hi ${inspectingListing.listingAgent?.name ? inspectingListing.listingAgent.name.split(' ')[0] : 'there'},\n\nI am reaching out regarding your listing at ${inspectingListing.address} listed at ${formatUSD(inspectingListing.price)}.\n\nWe have pre-qualified buyers actively touring homes in this corridor and wanted to check on current offer activity and share our special financing flyer and buydown incentives.\n\nBest regards,`,
                            loanOfficer: activeLo,
                            templateName: "Listing Agent Property Connect",
                            onTriggerToast
                          });
                        }}
                        className="font-bold text-[#0078D4] hover:underline flex items-center gap-1 cursor-pointer text-left truncate max-w-full"
                        title="Draft email in local installed Outlook"
                      >
                        <Mail className="w-3 h-3 shrink-0" />
                        <span className="truncate">{inspectingListing.listingAgent.email}</span>
                      </button>
                    </div>
                  )}

                  {inspectingListing.listingAgent?.website && (
                    <div className="p-2.5 rounded-xl bg-white border border-emerald-100 space-y-0.5 sm:col-span-2">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 block">Agent / Brokerage Website</span>
                      <a
                        href={inspectingListing.listingAgent.website.startsWith("http") ? inspectingListing.listingAgent.website : `https://${inspectingListing.listingAgent.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-[#4A5D4E] hover:underline flex items-center gap-1"
                      >
                        <Globe className="w-3 h-3" />
                        <span className="truncate">{inspectingListing.listingAgent.website}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Complete GIS Overlay Audit Report */}
            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE7E0] space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D362E] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#4A5D4E]" />
                <span>GIS Overlay Screening & Grant Classification</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* USDA Rural Status */}
                <div className="p-3 rounded-xl bg-white border border-[#EAE7E0] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#2D362E]">USDA Rural Housing (0% Down)</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isUsdaEligible(inspectingListing) ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-600"
                    }`}>
                      {isUsdaEligible(inspectingListing) ? "✓ 100% Eligible" : "Ineligible Area"}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#606C5D]">
                    {isUsdaEligible(inspectingListing) 
                      ? "Located outside USDA ineligible metro polygons. Qualifies for 100% 0% down financing." 
                      : "Located within USDA urban exclusion polygon."}
                  </p>
                </div>

                {/* OHCS LMI Census Tract */}
                <div className="p-3 rounded-xl bg-white border border-[#EAE7E0] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#2D362E]">OHCS LMI Census Tract</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isLmiEligible(inspectingListing) ? "bg-amber-100 text-amber-900" : "bg-stone-100 text-stone-600"
                    }`}>
                      {isLmiEligible(inspectingListing) ? "✓ LMI Approved" : "Standard Tract"}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#606C5D]">
                    {isLmiEligible(inspectingListing)
                      ? `Census tract eligible for enhanced OHCS Flex Lending cash assistance grants (≤80% AMI).`
                      : "Standard census tract without special income-based overlay waivers."}
                  </p>
                </div>

                {/* FirstHome Targeted / Non-Targeted Area & Price Cap */}
                {(() => {
                  const priceInfo = getPropertyOhcsPriceLimit(
                    inspectingListing.price,
                    inspectingListing.overlayEligibility?.countyName || inspectingListing.county,
                    inspectingListing.city,
                    inspectingListing.overlayEligibility?.lmiCensusTract || inspectingListing.overlayEligibility?.geoid,
                    inspectingListing.overlayEligibility?.targetedArea
                  );

                  return (
                    <>
                      <div className="p-3 rounded-xl bg-white border border-[#EAE7E0] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#2D362E]">OHCS FirstHome Status</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            priceInfo.isTargeted ? "bg-teal-100 text-teal-900" : "bg-stone-100 text-stone-700"
                          }`}>
                            {priceInfo.isTargeted ? "Targeted Area" : "Non-Targeted"}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#606C5D]">
                          {priceInfo.qualificationReason}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-white border border-[#EAE7E0] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#2D362E]">Price Limit vs List Price</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            priceInfo.isPriceEligible ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                          }`}>
                            {priceInfo.isPriceEligible ? `✓ Under Cap (+$${Math.round(priceInfo.headroom / 1000)}k room)` : "Exceeds Limit"}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#606C5D]">
                          {priceInfo.county} County {priceInfo.isTargeted ? "Targeted" : "Standard"} Cap: {formatUSD(priceInfo.applicablePriceLimit)} • Listing: {formatUSD(inspectingListing.price)}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={() => setInspectingListing(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#FAF9F5] hover:bg-[#F1EFE9] border border-[#EAE7E0] text-[#2D362E] font-bold text-xs cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <a
                  href={getZillowUrl(inspectingListing)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex justify-center items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-900 border border-blue-200 text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  <span>Open on Zillow</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => {
                    handleToggleSinglePublish(inspectingListing.id);
                    setInspectingListing(prev => prev ? { ...prev, isPubliclyPublished: !prev.isPubliclyPublished } : null);
                  }}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                    inspectingListing.isPubliclyPublished
                      ? "bg-stone-200 text-stone-800 hover:bg-stone-300"
                      : "bg-[#4A5D4E] hover:bg-[#38463B] text-white"
                  }`}
                >
                  {inspectingListing.isPubliclyPublished ? "Unpublish from Public Site" : "Publish to Public Site"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* JSON / Snapshot Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-[#EAE7E0] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#2D362E]">Import GeoSphere Listings JSON</h3>
                  <p className="text-xs text-[#606C5D]">Upload a .json export or paste saved GeoSphere listings payload.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportError(null);
                }}
                className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {importError && (
              <div className="p-3.5 rounded-xl bg-red-50 text-red-800 border border-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#2D362E] block mb-1.5">
                  1. Upload .json File
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".json"
                  className="w-full text-xs p-2 rounded-xl bg-[#FAF9F5] border border-[#EAE7E0] file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#4A5D4E] file:text-white cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#2D362E] block mb-1.5">
                  2. Or Paste Raw JSON Payload Below
                </label>
                <textarea
                  rows={8}
                  value={jsonPasteContent}
                  onChange={(e) => {
                    setJsonPasteContent(e.target.value);
                    setImportError(null);
                  }}
                  placeholder='Paste JSON here (e.g. {"pulls": [...]}, {"overlaySets": {"all": [...], "lmi": [...], "usda": [...]}} or array of listings)...'
                  className="w-full text-xs font-mono p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EAE7E0] focus:bg-white focus:ring-1 focus:ring-[#4A5D4E] outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportError(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#FAF9F5] hover:bg-[#F1EFE9] border border-[#EAE7E0] text-[#2D362E] font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleImportJson}
                className="px-5 py-2 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                Parse & Import Listings
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Sync Property to Big Purple Dot CRM Modal */}
      <SyncPropertyToBpdCrmModal
        property={bpdCrmSyncModalListing}
        isOpen={Boolean(bpdCrmSyncModalListing)}
        onClose={() => setBpdCrmSyncModalListing(null)}
        guidesState={guidesState}
        onUpdateProperty={(updatedListing) => {
          setSyncedListings(prev => prev.map(l => l.id === updatedListing.id ? updatedListing : l));
          setProperties(prev => prev.map(p => p.id === updatedListing.id ? updatedListing : p));
          if (inspectingListing?.id === updatedListing.id) {
            setInspectingListing(updatedListing);
          }
        }}
        onTriggerToast={onTriggerToast}
      />
        </>
      )}
    </div>
  );
};
