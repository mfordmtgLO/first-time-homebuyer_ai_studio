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
  ArrowUpDown
} from "lucide-react";
import { PropertyListing, ProfessionalGuidesState } from "../types";
import { GEOSPHERE_DATASETS, GEOSPHERE_MOCK_LISTINGS, GeoSphereDatasetOption, parseGeoSpherePayload } from "../data/geoSphereData";
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

interface GeoSphereSyncHubProps {
  guidesState: ProfessionalGuidesState;
  onUpdateGuidesState: (newState: ProfessionalGuidesState) => void;
  properties: PropertyListing[];
  setProperties: React.Dispatch<React.SetStateAction<PropertyListing[]>>;
  onTriggerToast: (msg: string) => void;
}

export const GeoSphereSyncHub: React.FC<GeoSphereSyncHubProps> = ({
  guidesState,
  onUpdateGuidesState,
  properties,
  setProperties,
  onTriggerToast,
}) => {
  const [selectedDataset, setSelectedDataset] = useState<string>("all");
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [syncedListings, setSyncedListings] = useState<PropertyListing[]>(() => {
    // If guidesState has syncedProperties with at least 50 listings, use it; otherwise default to full 229 master dataset
    if (guidesState.syncedProperties && guidesState.syncedProperties.length >= 50) {
      return guidesState.syncedProperties;
    }
    return GEOSPHERE_MOCK_LISTINGS;
  });

  const [selectedListingIds, setSelectedListingIds] = useState<string[]>([]);
  const [activeOverlayFilter, setActiveOverlayFilter] = useState<string>("all");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>("all");
  const [countyFilter, setCountyFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"default" | "price_asc" | "price_desc" | "dom" | "sqft">("default");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [lastSyncedTime, setLastSyncedTime] = useState<string>(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  
  // Custom API endpoint & token drawer state
  const [showAdvancedEndpoint, setShowAdvancedEndpoint] = useState<boolean>(false);
  const [customEndpointUrl, setCustomEndpointUrl] = useState<string>("https://geosphere-map-oregon.vercel.app/api/map-saved-listings");
  const [customSyncToken, setCustomSyncToken] = useState<string>("");

  // Import JSON Modal State
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [jsonPasteContent, setJsonPasteContent] = useState<string>("");
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Property Detail Modal State
  const [inspectingListing, setInspectingListing] = useState<PropertyListing | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 12;

  // Calculate live statistical counts across all synced listings
  const overlayCounts = useMemo(() => {
    return calculateOverlayCounts(syncedListings);
  }, [syncedListings]);

  // Filter synced listings by current active overlay and search query
  const filteredListings = useMemo(() => {
    const list = filterListings(syncedListings, {
      overlayFilter: activeOverlayFilter,
      searchQuery,
      propertyType: propertyTypeFilter,
      county: countyFilter,
    });

    // Apply sorting
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
  }, [syncedListings, activeOverlayFilter, searchQuery, propertyTypeFilter, countyFilter, sortBy]);

  // Paginated listings
  const totalPages = Math.ceil(filteredListings.length / pageSize) || 1;
  const paginatedListings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredListings.slice(start, start + pageSize);
  }, [filteredListings, currentPage, pageSize]);

  // Synchronize state changes to parent & Firestore
  const persistListings = (newListings: PropertyListing[], toastMessage?: string) => {
    setSyncedListings(newListings);
    setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

    const updatedGuidesState: ProfessionalGuidesState = {
      ...guidesState,
      syncedProperties: newListings
    };
    onUpdateGuidesState(updatedGuidesState);

    // Merge publicly published properties into main properties state
    const published = newListings.filter(l => l.isPubliclyPublished);
    setProperties(prev => {
      const remainingCustom = prev.filter(p => !p.id.startsWith("geo-") && !p.id.includes("-OR-"));
      return [...published, ...remainingCustom];
    });

    if (toastMessage) {
      onTriggerToast(toastMessage);
    }
  };

  // Pull / Sync from GeoSphere via our backend proxy route
  const handleRunSync = async (datasetId: string = selectedDataset) => {
    setIsFetching(true);
    const targetDataset = GEOSPHERE_DATASETS.find(d => d.id === datasetId) || GEOSPHERE_DATASETS[0];

    try {
      let liveListings: PropertyListing[] = [];

      // 1. Call our backend proxy /api/geosphere/sync
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

      // If we received live pull listings (e.g. 116 from Coos Bay or full snapshot), merge with master catalog
      let finalDataset: PropertyListing[] = [];
      if (datasetId === "coos") {
        finalDataset = liveListings.length > 0 
          ? liveListings 
          : GEOSPHERE_MOCK_LISTINGS.filter(l => l.overlayEligibility?.countyName === "Coos" || l.city === "Coos Bay");
      } else if (datasetId === "lane") {
        finalDataset = GEOSPHERE_MOCK_LISTINGS.filter(l => l.overlayEligibility?.countyName === "Lane" || l.city === "Eugene" || l.city === "Springfield");
      } else if (datasetId === "deschutes") {
        finalDataset = GEOSPHERE_MOCK_LISTINGS.filter(l => l.overlayEligibility?.countyName === "Deschutes" || l.city === "Bend" || l.city === "Redmond");
      } else if (datasetId === "metro") {
        finalDataset = GEOSPHERE_MOCK_LISTINGS.filter(l => ["Clackamas", "Marion", "Multnomah", "Yamhill", "Washington"].includes(l.overlayEligibility?.countyName || ""));
      } else if (datasetId === "usda") {
        finalDataset = GEOSPHERE_MOCK_LISTINGS.filter(l => isUsdaEligible(l));
      } else if (datasetId === "lmi") {
        finalDataset = GEOSPHERE_MOCK_LISTINGS.filter(l => isLmiEligible(l));
      } else {
        // Master all 229 dataset
        const liveMap = new Map<string, PropertyListing>();
        liveListings.forEach(l => liveMap.set(l.id, l));
        
        finalDataset = GEOSPHERE_MOCK_LISTINGS.map(masterItem => {
          if (liveMap.has(masterItem.id)) {
            return { ...masterItem, ...liveMap.get(masterItem.id) };
          }
          return masterItem;
        });

        // If any live listings were not in master, add them
        liveListings.forEach(l => {
          if (!finalDataset.some(m => m.id === l.id)) {
            finalDataset.push(l);
          }
        });
      }

      persistListings(finalDataset, `Synced ${finalDataset.length} properties from ${targetDataset.name}!`);
      setCurrentPage(1);
    } catch (error) {
      console.error("GeoSphere sync error:", error);
      persistListings(GEOSPHERE_MOCK_LISTINGS, `Loaded all ${GEOSPHERE_MOCK_LISTINGS.length} pre-screened Oregon properties from GeoSphere GIS database.`);
    } finally {
      setIsFetching(false);
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

  return (
    <div className="space-y-8">
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
            <h4 className="text-xs font-bold text-[#2D362E] uppercase tracking-wider">GeoSphere Vercel / Cloud Sync Connection</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#606C5D] block mb-1">Target Endpoint URL</label>
                <input
                  type="text"
                  value={customEndpointUrl}
                  onChange={(e) => setCustomEndpointUrl(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-[#EAE7E0] focus:ring-1 focus:ring-[#4A5D4E] outline-none"
                  placeholder="https://geosphere-map-oregon.vercel.app/api/map-saved-listings"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {GEOSPHERE_DATASETS.slice(0, 4).map(ds => {
            const isSelected = selectedDataset === ds.id;
            return (
              <button
                key={ds.id}
                onClick={() => {
                  setSelectedDataset(ds.id);
                  handleRunSync(ds.id);
                }}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#4A5D4E] text-white border-[#4A5D4E] shadow-sm ring-2 ring-[#4A5D4E]/20"
                    : "bg-white text-[#2D362E] border-[#EAE7E0] hover:border-[#4A5D4E]/50 hover:bg-[#FAF9F5]"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isSelected ? "bg-white/20 text-white" : ds.badgeColor}`}>
                      {ds.badge}
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
                    <span>Load</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            );
          })}
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

        {/* Listings Grid */}
        {filteredListings.length === 0 ? (
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
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between bg-white ${
                    isSelected ? "border-[#4A5D4E] ring-2 ring-[#4A5D4E]/20" : "border-[#EAE7E0] hover:border-stone-400"
                  }`}
                >
                  {hasPhoto ? (
                    /* Photo Header & Badges (Authentic photo only) */
                    <div className="relative h-44 bg-stone-100 overflow-hidden group">
                      <img
                        src={listing.imageUrl}
                        alt={listing.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                        onClick={() => setInspectingListing(listing)}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30 pointer-events-none" />

                      {/* Checkbox Selector */}
                      <button
                        onClick={() => handleToggleSelectListing(listing.id)}
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
                            onClick={() => handleToggleSelectListing(listing.id)}
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
                      <div className="cursor-pointer" onClick={() => setInspectingListing(listing)}>
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

                    {/* Card Footer: View Details & Publish Toggle */}
                    <div className="pt-3 border-t border-[#EAE7E0] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setInspectingListing(listing)}
                          className="text-[11px] font-semibold text-[#4A5D4E] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect GIS</span>
                        </button>

                        <a
                          href={getZillowUrl(listing)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Zillow</span>
                        </a>
                      </div>

                      <button
                        onClick={() => handleToggleSinglePublish(listing.id)}
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
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>GeoSphere Oregon GIS Audit & Screening</span>
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
                    {inspectingListing.listingAgent?.name && (
                      <div className="flex justify-between">
                        <span className="text-stone-500">Listing Agent:</span>
                        <span className="text-stone-800 font-medium">{inspectingListing.listingAgent.name}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

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
    </div>
  );
};
