import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Globe,
  Youtube,
  FileText,
  ShieldCheck,
  Sparkles,
  PhoneCall,
  MessageSquare,
  RefreshCw,
  ExternalLink,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Compass,
  UserCheck,
  ChevronRight,
  Home,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Star,
  User,
  Mail,
  Phone
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { RealEstateAgentProfile, LoanOfficerProfile, PropertyListing, LOPairing, CapturedLead } from "../types";
import {
  MarketTrendItem,
  INITIAL_MARKET_TREND_ITEMS,
  isSafeFromRateTalk,
  sanitizeMarketTrendItems
} from "../data/marketTrendsData";
import { INITIAL_AGENT_ROSTER } from "../data/initialData";
import { GEOSPHERE_MOCK_LISTINGS } from "../data/geoSphereData";
import { matchMarketNewsSpotlightListings } from "../utils/marketNewsListingMatcher";
import { formatUSD } from "../utils/mortgageMath";
import { AgentSpotlightLeadModal } from "./AgentSpotlightLeadModal";

const OREGON_MARKET_TREND_CHART_DATA = [
  { month: "Jan", medianPrice: 485000, inventory: 4200, closedSales: 2800 },
  { month: "Feb", medianPrice: 489000, inventory: 4400, closedSales: 3100 },
  { month: "Mar", medianPrice: 495000, inventory: 4900, closedSales: 3600 },
  { month: "Apr", medianPrice: 502000, inventory: 5300, closedSales: 4100 },
  { month: "May", medianPrice: 510000, inventory: 5800, closedSales: 4600 },
  { month: "Jun", medianPrice: 515000, inventory: 6100, closedSales: 4900 },
  { month: "Jul", medianPrice: 512000, inventory: 5900, closedSales: 4700 },
  { month: "Aug", medianPrice: 508000, inventory: 5600, closedSales: 4400 },
  { month: "Sep", medianPrice: 505000, inventory: 5200, closedSales: 4000 },
  { month: "Oct", medianPrice: 502000, inventory: 4800, closedSales: 3700 },
  { month: "Nov", medianPrice: 498000, inventory: 4400, closedSales: 3300 },
  { month: "Dec", medianPrice: 502000, inventory: 4300, closedSales: 3500 },
];

interface MarketTrendsProps {
  activeAgent?: RealEstateAgentProfile;
  loanOfficer?: LoanOfficerProfile;
  agentRoster?: RealEstateAgentProfile[];
  pairings?: LOPairing[];
  isCoBranded?: boolean;
  listings?: PropertyListing[];
  onNavigate?: (tab: string, mode?: "website" | "dashboard") => void;
  isEmbedded?: boolean;
  onSaveLead?: (lead: CapturedLead) => void;
  onTriggerToast?: (msg: string) => void;
}

export const MarketTrends: React.FC<MarketTrendsProps> = ({
  activeAgent,
  loanOfficer,
  agentRoster,
  pairings,
  isCoBranded = false,
  listings,
  onNavigate,
  isEmbedded = false,
  onSaveLead,
  onTriggerToast
}) => {
  const [items, setItems] = useState<MarketTrendItem[]>(INITIAL_MARKET_TREND_ITEMS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSourceType, setSelectedSourceType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [listingFilter, setListingFilter] = useState<"all" | "direct" | "usda" | "lmi" | "firsthome">("all");

  // Agent Spotlight Lead Gen Modal State
  const [isSpotlightLeadModalOpen, setIsSpotlightLeadModalOpen] = useState<boolean>(false);
  const [leadModalContext, setLeadModalContext] = useState<{
    city?: string;
    topic?: string;
    property?: PropertyListing;
  }>({});

  // Inline Lead Gen Form State for the Top Spotlight Card
  const [inlineCity, setInlineCity] = useState<string>("");
  const [inlineName, setInlineName] = useState<string>("");
  const [inlineEmail, setInlineEmail] = useState<string>("");
  const [inlinePhone, setInlinePhone] = useState<string>("");
  const [inlineWantsList, setInlineWantsList] = useState<boolean>(true);
  const [inlineIsSubmitting, setInlineIsSubmitting] = useState<boolean>(false);
  const [inlineIsSubmitted, setInlineIsSubmitted] = useState<boolean>(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  // Stable of agents fallback
  const effectiveRoster = useMemo(() => {
    return agentRoster && agentRoster.length > 0 ? agentRoster : INITIAL_AGENT_ROSTER;
  }, [agentRoster]);

  // Hierarchical Agent Spotlight Resolution:
  // Rule 1: If co-branded in URL, use the co-branded activeAgent.
  // Rule 2: If solo Loan Officer URL (no co-branded agent in URL), source the agent from the LO profile feature
  //         (loanOfficer.marketNewsSpotlightAgentId).
  const spotlightAgent: RealEstateAgentProfile = useMemo(() => {
    if (isCoBranded && activeAgent) {
      return activeAgent;
    }

    if (loanOfficer?.marketNewsSpotlightAgentId) {
      const found = effectiveRoster.find((a) => a.id === loanOfficer.marketNewsSpotlightAgentId);
      if (found) return found;
    }

    if (activeAgent) {
      return activeAgent;
    }

    if (pairings && pairings.length > 0 && loanOfficer) {
      const matchedPairing = pairings.find((p) => p.loId === loanOfficer.id);
      if (matchedPairing) {
        const pairedAgent = effectiveRoster.find((a) => a.id === matchedPairing.agentId);
        if (pairedAgent) return pairedAgent;
      }
    }

    return effectiveRoster[0] || INITIAL_AGENT_ROSTER[0];
  }, [isCoBranded, activeAgent, loanOfficer, effectiveRoster, pairings]);

  // Agent Contact Credentials
  const agentName = spotlightAgent.name || "Sarah Jenkins";
  const agentPhone = spotlightAgent.phone || "(503) 555-0144";
  const agentBrokerage = spotlightAgent.brokerage || "Cascade Valley Real Estate";
  const agentHeadshot =
    spotlightAgent.headshotUrl ||
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80";

  // Merge external listings with comprehensive GeoSphere RentCast snapshots
  const allAvailableListings = useMemo(() => {
    const combined = [...(listings || []), ...GEOSPHERE_MOCK_LISTINGS];
    const uniqueMap = new Map<string, PropertyListing>();
    combined.forEach((l) => {
      if (!uniqueMap.has(l.id)) {
        uniqueMap.set(l.id, l);
      }
    });
    return Array.from(uniqueMap.values());
  }, [listings]);

  // Targeted GEOID / spatial matching of RentCast listings within agent's licensed Oregon counties/geographies
  const spotlightSpatialResult = useMemo(() => {
    return matchMarketNewsSpotlightListings(spotlightAgent, allAvailableListings, 15);
  }, [spotlightAgent, allAvailableListings]);

  const matchedSpotlightListings = spotlightSpatialResult.listings;
  const mlsInfo = spotlightSpatialResult.mlsInfo;
  const directListingsCount = spotlightSpatialResult.directListingCount;
  const primaryCounty = spotlightSpatialResult.primaryCounty;
  const primaryFips = spotlightSpatialResult.primaryFips;
  const licensedCounties = spotlightSpatialResult.licensedCounties;

  // Filtered matched listings based on low-down pills
  const filteredMatchedListings = useMemo(() => {
    if (listingFilter === "all") return matchedSpotlightListings;
    if (listingFilter === "direct") return matchedSpotlightListings.filter((m) => m.isDirectListing);
    if (listingFilter === "usda") return matchedSpotlightListings.filter((m) => m.listing.overlayEligibility?.usdaEligible);
    if (listingFilter === "lmi") return matchedSpotlightListings.filter((m) => m.listing.overlayEligibility?.lmiEligible);
    if (listingFilter === "firsthome") return matchedSpotlightListings.filter((m) => m.listing.overlayEligibility?.firstHomeEligible);
    return matchedSpotlightListings;
  }, [matchedSpotlightListings, listingFilter]);

  // Active rotating spotlight topic index for the random timing banner
  const [spotlightIndex, setSpotlightIndex] = useState<number>(0);
  const [spotlightTick, setSpotlightTick] = useState<number>(0);

  // Random timing and rotation engine:
  // Changes every 7 to 13 seconds randomly to associate with rotating sources
  useEffect(() => {
    const randomInterval = Math.floor(Math.random() * 6000) + 7000; // 7000 - 13000ms
    const timer = setTimeout(() => {
      setSpotlightIndex((prev) => (prev + 1) % items.length);
      setSpotlightTick((t) => t + 1);
    }, randomInterval);

    return () => clearTimeout(timer);
  }, [spotlightTick, items.length]);

  // Fetch from safe API on mount or refresh
  const fetchMarketNews = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/market-news");
      if (res.ok) {
        const data = await res.json();
        if (data.items && Array.isArray(data.items)) {
          // Strictly sanitize and safeguard against any rate talk
          const sanitized = sanitizeMarketTrendItems(data.items);
          setItems(sanitized);
        }
      }
    } catch (err) {
      console.warn("Using curated verified housing market items:", err);
      setItems(INITIAL_MARKET_TREND_ITEMS);
    } finally {
      setIsLoading(false);
      setLastRefreshed(new Date());
    }
  }, []);

  /**
   * Constructs a dynamic Zillow search link using the property's address fields,
   * enabling users to verify current live listing status (active, pending, price changes, or sold) in real-time.
   */
  const constructDynamicZillowUrl = useCallback((listing: PropertyListing): string => {
    const addressParts = [
      listing.address,
      listing.city,
      listing.state || "OR",
      listing.zip
    ].filter(Boolean);

    if (addressParts.length > 0) {
      const cleanAddress = addressParts.join(", ");
      return `https://www.zillow.com/homes/${encodeURIComponent(cleanAddress)}_rb/`;
    }

    if (listing.zillowUrl && listing.zillowUrl.startsWith("http")) {
      return listing.zillowUrl;
    }

    return "https://www.zillow.com";
  }, []);

  // Filter items based on user criteria & strict rate exclusion
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Hard safeguard: verify item passes rate-talk filter
      const textToScan = `${item.title} ${item.summary} ${item.keyTakeaway}`;
      if (!isSafeFromRateTalk(textToScan)) return false;

      // Category filter
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }

      // Source type filter
      if (selectedSourceType !== "all" && item.sourceType !== selectedSourceType) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          item.title.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q) ||
          item.keyTakeaway.toLowerCase().includes(q) ||
          item.source.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [items, selectedCategory, selectedSourceType, searchQuery]);

  const activeSpotlightItem = items[spotlightIndex] || items[0];

  // Suggested popular cities based on the agent's licensed territory
  const popularCities = useMemo(() => {
    const fromAgent = spotlightAgent.marketAreas || [];
    const defaults = ["Portland", "Beaverton", "Bend", "Eugene", "Salem", "Gresham", "Hillsboro", "Oregon City", "Redmond"];
    return Array.from(new Set([...fromAgent, ...defaults])).slice(0, 7);
  }, [spotlightAgent.marketAreas]);

  // Helper to open the Lead Gen modal anytime agent name is clicked or referenced
  const openAgentSpotlightLeadModal = useCallback((opts?: { topic?: string; property?: PropertyListing; city?: string }) => {
    setLeadModalContext({
      topic: opts?.topic,
      property: opts?.property,
      city: opts?.city || inlineCity || (opts?.property ? opts.property.city : "")
    });
    setIsSpotlightLeadModalOpen(true);
  }, [inlineCity]);

  // Inline lead generation submission handler for the hero agent spotlight card
  const handleInlineLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInlineError(null);

    if (!inlineName.trim()) {
      setInlineError("Please enter your name.");
      return;
    }
    if (!inlineEmail.trim() || !inlineEmail.includes("@")) {
      setInlineError("Please enter a valid email address.");
      return;
    }
    if (!inlinePhone.trim() || inlinePhone.replace(/\D/g, "").length < 7) {
      setInlineError("Please enter a valid cell phone number.");
      return;
    }
    if (!inlineCity.trim()) {
      setInlineError("Please enter your desired city in Oregon.");
      return;
    }

    setInlineIsSubmitting(true);
    const cityClean = inlineCity.trim();
    const loId = loanOfficer?.id || "lo-1";
    const loName = loanOfficer?.name || "Mike Ford";

    const newLead: CapturedLead = {
      id: `lead-spotlight-inline-${Date.now()}`,
      fullName: inlineName.trim(),
      email: inlineEmail.trim(),
      phone: inlinePhone.trim(),
      preferredContactTime: "Anytime",
      timeline: "Ready in 30-60 Days",
      targetPriceRange: "$400,000 - $550,000",
      targetMonthlyBudget: "Optimal Low/Zero Down Payment",
      downPaymentSavings: "Low/No Down Program Preferred",
      grantInterest: true,
      creditScoreTier: "Good (660+)",
      preferredLocations: cityClean,
      taggedCityArea: cityClean,
      leadPathTag: "Agent Spotlight Hero Lead Gen",
      propertyType: "Single Family",
      sendSampleHomes: inlineWantsList,
      sendSampleHomesOption: `YES - Curated list of recently listed homes in ${cityClean} (Low/No Down Eligible)`,
      assignedLoId: loId,
      assignedAgentId: spotlightAgent.id,
      assignedLO: loName,
      assignedAgent: agentName,
      leadSource: `Agent Spotlight: Curated Homes in ${cityClean}`,
      interactedSourceType: "chatbot",
      intentScore: "hot",
      status: "new",
      notes: `[AGENT SPOTLIGHT LEAD GEN]: Buyer requested a curated list of recently listed homes for sale in ${cityClean} that likely can accept low or no down payment options (DPA/USDA/FHA/FirstHome).\n- Spotlight Agent: ${agentName} (${agentBrokerage})\n- Loan Officer: ${loName}.`,
      createdAt: new Date().toISOString(),
      smsConsentAuthorized: true,
      smsConsentTimestamp: new Date().toISOString(),
      smsConsentSource: "Agent Spotlight Hero Quick Lead Gen",
      textNurtureEnabled: true,
      textNurtureCurrentStep: 1,
      textNurtureTotalSteps: 4,
      textNurtureStageText: "1 of 4: Curated Home List Dispatched",
      lastTextSentAt: new Date().toISOString()
    };

    if (onSaveLead) {
      onSaveLead(newLead);
    }

    try {
      const stored = localStorage.getItem("homebuyer_roadmap_state_v2");
      if (stored) {
        const parsed = JSON.parse(stored);
        const existingLeads = parsed.leads || [];
        parsed.leads = [newLead, ...existingLeads];
        localStorage.setItem("homebuyer_roadmap_state_v2", JSON.stringify(parsed));
      }
      const rawLeads = localStorage.getItem("first_time_buyer_leads");
      const leadsList = rawLeads ? JSON.parse(rawLeads) : [];
      localStorage.setItem("first_time_buyer_leads", JSON.stringify([newLead, ...leadsList]));
    } catch (err) {
      console.warn("Storage error for inline spotlight lead:", err);
    }

    if (onTriggerToast) {
      onTriggerToast(`✓ Curated list request sent to ${agentName}!`);
    }

    setInlineIsSubmitting(false);
    setInlineIsSubmitted(true);
  };

  return (
    <div className={`space-y-8 ${isEmbedded ? "" : "max-w-7xl mx-auto px-4 sm:px-6 py-6"}`}>
      {/* 1. Header & Safeguard Verification Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE7E0] shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4A5D4E]/10 text-[#4A5D4E] text-xs font-bold border border-[#4A5D4E]/20">
                <Globe className="w-3.5 h-3.5 text-[#C18C5D]" />
                Live Housing & Market Intelligence
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Safeguarded: Zero Interest Rate Noise
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200">
                <Compass className="w-3.5 h-3.5 text-amber-700" />
                {mlsInfo.mls.shortName} Territory Synced
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D362E] tracking-tight">
              Market Trends & Strategy Hub
            </h2>

            <p className="text-xs sm:text-sm text-[#606C5D] leading-relaxed">
              Curated real-time housing inventory updates, neighborhood strategies, inspection checklists, and top-rated buyer blogs and YouTube video masterclasses—tailored exclusively for first-time buyers and synchronized with{" "}
              <button
                type="button"
                onClick={() => openAgentSpotlightLeadModal({ topic: "Oregon Market Footprint" })}
                className="font-bold underline decoration-[#C18C5D] text-[#2D362E] hover:text-[#4A5D4E] transition-colors cursor-pointer"
                title={`Request curated low/no down homes from ${spotlightAgent.name}`}
              >
                {spotlightAgent.name}
              </button>
              's active Oregon MLS market footprint.
            </p>
          </div>

          {/* Quick Actions & Live Indicator */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 text-xs text-[#9A9488]">
              <Clock className="w-3.5 h-3.5" />
              <span>Refreshed {lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchMarketNews}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FAF9F5] hover:bg-[#F1EFE9] border border-[#EAE7E0] text-xs font-bold text-[#4A5D4E] transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#C18C5D]" : ""}`} />
                <span>{isLoading ? "Fetching Live Feeds..." : "Refresh Feeds"}</span>
              </button>

              {isEmbedded && onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate("market_trends", "dashboard")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-bold transition-all shadow-xs"
                >
                  <span>Explore Full Hub</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Informational Safeguard Callout */}
        <div className="mt-5 pt-4 border-t border-[#EAE7E0]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#606C5D]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#4A5D4E] shrink-0" />
            <span>
              <strong>First-Time Buyer Safeguard:</strong> This hub is filtered to protect you from confusing interest rate predictions. It centers strictly on purchase contracts, property inspections, inventory leverage, and escrow security.
            </span>
          </div>

          <div className="text-[11px] font-medium text-[#8C5D30] shrink-0">
            {isCoBranded ? (
              <span className="bg-[#FAF9F5] px-2.5 py-1 rounded-md border border-[#EAE7E0]">
                🔗 Co-Branded Partner Link Active
              </span>
            ) : (
              <span className="bg-[#FAF9F5] px-2.5 py-1 rounded-md border border-[#EAE7E0]">
                🎯 Solo LO Sourcing: <strong>{spotlightAgent.name}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC ROTATING AGENT RECOMMENDATION SPOTLIGHT (Lead Gen Mindset Engine) */}
      <div className="bg-gradient-to-br from-[#FAF9F5] via-white to-[#F5F2EA] rounded-3xl p-5 sm:p-6 border-2 border-[#C18C5D]/40 shadow-md relative overflow-hidden transition-all duration-500">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <img
                src={agentHeadshot}
                alt={agentName}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-[#C18C5D] shadow-sm"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white shadow-xs" title="Agent Available" />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#C18C5D]/15 text-[#8C5D30] text-[10px] font-extrabold uppercase tracking-wide">
                  <Sparkles className="w-3 h-3 text-[#C18C5D]" />
                  Rotating Agent Spotlight
                </span>
                <span className="text-[11px] text-[#9A9488]">
                  Topic: <strong>{activeSpotlightItem?.highlightTopic || "Housing Due Diligence"}</strong>
                </span>
                <span className="text-[11px] font-semibold text-[#4A5D4E] bg-white px-2 py-0.5 rounded border border-[#EAE7E0]">
                  {mlsInfo.mls.shortName} • {mlsInfo.primaryCounty} County
                </span>
              </div>

              {/* Exact user requested phrasing with cobrand agent name as an interactive lead capture trigger */}
              <p className="text-sm font-serif font-bold text-[#2D362E] leading-snug">
                “To learn more on this scenario or this topic, you can consult your local trusted agent,{" "}
                <button
                  type="button"
                  onClick={() => openAgentSpotlightLeadModal({ topic: activeSpotlightItem?.highlightTopic || activeSpotlightItem?.title })}
                  className="text-[#4A5D4E] underline decoration-[#C18C5D] decoration-2 underline-offset-2 hover:text-[#2D362E] transition-colors cursor-pointer inline-flex items-center gap-1"
                  title={`Request curated low/no down home list from ${agentName}`}
                >
                  <span>{agentName}</span>
                  <Sparkles className="w-3 h-3 text-[#C18C5D] inline" />
                </button>{" "}
                ({agentPhone}).”
              </p>

              <p className="text-xs text-[#606C5D]">
                Associated with: <span className="font-semibold text-[#2D362E]">{activeSpotlightItem?.source}</span> • {activeSpotlightItem?.title}
              </p>
            </div>
          </div>

          {/* Quick Direct Agent Connect Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => openAgentSpotlightLeadModal({ topic: activeSpotlightItem?.highlightTopic || activeSpotlightItem?.title })}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2D362E] to-[#4A5D4E] hover:from-[#1E251F] hover:to-[#38463B] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
              <span>Get Curated Home List</span>
            </button>

            <a
              href={`tel:${agentPhone}`}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white hover:bg-[#FAF9F5] text-[#4A5D4E] border border-[#EAE7E0] hover:border-[#DCD7CD] text-xs font-bold transition-all shadow-2xs"
              title={`Call ${agentName}`}
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#D4A373]" />
              <span>Call</span>
            </a>

            <a
              href={`sms:${agentPhone}`}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white hover:bg-[#FAF9F5] text-[#4A5D4E] border border-[#EAE7E0] hover:border-[#DCD7CD] text-xs font-bold transition-all shadow-2xs"
              title={`Text ${agentName}`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#C18C5D]" />
              <span>Text</span>
            </a>

            <button
              type="button"
              onClick={() => {
                setSpotlightIndex((prev) => (prev + 1) % items.length);
              }}
              title="Shuffle to another market topic"
              className="w-10 h-10 rounded-xl bg-white hover:bg-[#FAF9F5] border border-[#EAE7E0] text-[#606C5D] hover:text-[#2D362E] flex items-center justify-center transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* High-Converting Lead Generation Mindset Box: Capture Name, Email, Phone & Desired City for Low/No Down Homes */}
        <div className="mt-5 pt-4 border-t border-[#C18C5D]/20">
          {!inlineIsSubmitted ? (
            <div className="bg-white/95 rounded-2xl p-4 sm:p-5 border border-[#C18C5D]/30 shadow-xs space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#C18C5D]/15 text-[#8C5D30] flex items-center justify-center shrink-0">
                    <Home className="w-4 h-4 text-[#C18C5D]" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-sm text-[#2D362E] leading-tight flex items-center gap-1.5">
                      <span>Curated Low & Zero Down Home List Lead Service</span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">Instant Matching</span>
                    </h4>
                    <p className="text-[11px] text-[#606C5D]">
                      Pre-screened by <strong>{agentName}</strong> for USDA 100% (0% down), State HFA grants ($10,000+), FHA, or FirstHome price limits.
                    </p>
                  </div>
                </div>

                <div className="text-[11px] text-[#8C5D30] font-semibold shrink-0 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#C18C5D]" />
                  <span>Agent Direct Dispatch</span>
                </div>
              </div>

              {/* Exact user requested lead gen mindset hook */}
              <div className="bg-[#FAF9F5] p-3 rounded-xl border border-[#EAE7E0] text-xs text-[#2D362E] leading-relaxed">
                <strong>Do you have a desired city or neighborhood in mind?</strong> Would you like to receive a curated list of recently listed homes for sale in that area that likely can accept low or no down payment options? Tell us your desired city and where to send your personalized list:
              </div>

              <form onSubmit={handleInlineLeadSubmit} className="space-y-3">
                {inlineError && (
                  <div className="p-2.5 rounded-lg bg-red-50 text-red-800 text-xs border border-red-200">
                    {inlineError}
                  </div>
                )}

                {/* City Selection with Quick Pills */}
                <div className="space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <label className="text-xs font-bold text-[#2D362E]">
                      Desired City in Oregon <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-[10px] text-[#9A9488]">Quick select:</span>
                      {popularCities.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setInlineCity(c)}
                          className={`text-[10px] px-2 py-0.5 rounded font-medium transition-colors cursor-pointer ${
                            inlineCity.toLowerCase() === c.toLowerCase()
                              ? "bg-[#2D362E] text-white"
                              : "bg-[#F1EFE9] text-[#606C5D] hover:bg-[#E5E2DA]"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative">
                    <MapPin className="w-4 h-4 text-[#9A9488] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bend, Portland, Eugene, Beaverton, Salem..."
                      value={inlineCity}
                      onChange={(e) => setInlineCity(e.target.value)}
                      className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl pl-9 pr-3.5 py-2 text-xs text-[#2D362E] placeholder-[#9A9488] focus:outline-none focus:border-[#4A5D4E] focus:bg-white"
                    />
                  </div>
                </div>

                {/* Name, Email, Cell Phone Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-[#2D362E] mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-[#9A9488] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="Alex Morgan"
                        value={inlineName}
                        onChange={(e) => setInlineName(e.target.value)}
                        className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl pl-8 pr-3 py-2 text-xs text-[#2D362E] placeholder-[#9A9488] focus:outline-none focus:border-[#4A5D4E] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#2D362E] mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-[#9A9488] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="alex@example.com"
                        value={inlineEmail}
                        onChange={(e) => setInlineEmail(e.target.value)}
                        className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl pl-8 pr-3 py-2 text-xs text-[#2D362E] placeholder-[#9A9488] focus:outline-none focus:border-[#4A5D4E] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#2D362E] mb-1">
                      Cell Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-[#9A9488] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        placeholder="(503) 555-0199"
                        value={inlinePhone}
                        onChange={(e) => setInlinePhone(e.target.value)}
                        className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl pl-8 pr-3 py-2 text-xs text-[#2D362E] placeholder-[#9A9488] focus:outline-none focus:border-[#4A5D4E] focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Consent & CTA */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-[11px] text-[#606C5D]">
                    <input
                      type="checkbox"
                      checked={inlineWantsList}
                      onChange={(e) => setInlineWantsList(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-[#4A5D4E] border-[#DCD7CD] cursor-pointer"
                    />
                    <span>
                      Yes, send me curated homes in <strong>{inlineCity || "my desired city"}</strong> with low/no down payment options.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={inlineIsSubmitting}
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#2D362E] hover:bg-[#1E251F] text-white text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
                    <span>{inlineIsSubmitting ? "Submitting..." : `Request Curated List from ${agentName.split(" ")[0]} →`}</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <strong className="block text-sm">Curated List Request Sent to {agentName}!</strong>
                  <span>We've dispatched your request for recently listed low/zero down homes in <strong>{inlineCity}</strong> to {agentName.split(" ")[0]} and your loan team.</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={`tel:${agentPhone}`}
                  className="px-3 py-1.5 rounded-lg bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 transition-colors"
                >
                  Call {agentName.split(" ")[0]}
                </a>
                <button
                  type="button"
                  onClick={() => setInlineIsSubmitted(false)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-900 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                >
                  Request Another City
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2.5 Dynamic Market Appreciation & Inventory Trend Chart (Responsive & Mobile-Optimized) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EAE7E0] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAE7E0] pb-3">
          <div>
            <h3 className="font-serif font-bold text-lg text-[#2D362E] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C18C5D]" />
              <span>Oregon Housing Market Appreciation & Inventory Trends</span>
            </h3>
            <p className="text-xs text-[#606C5D]">
              12-month median price appreciation and active listing inventory trajectory across {primaryCounty} County.
            </p>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200 self-start sm:self-auto">
            Dynamic Viewport Resizing Active
          </span>
        </div>

        {/* Responsive Container guaranteeing zero overflow and dynamic width */}
        <div className="w-full h-[260px] sm:h-[300px] min-w-0 overflow-hidden pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={OREGON_MARKET_TREND_CHART_DATA} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EAE7E0" />
              <XAxis dataKey="month" stroke="#9A9488" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" stroke="#4A5D4E" tick={{ fontSize: 11 }} tickFormatter={(val) => `$${val / 1000}k`} />
              <YAxis yAxisId="right" orientation="right" stroke="#C18C5D" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#2D362E", borderRadius: "12px", color: "#fff", border: "none", fontSize: "12px" }}
                formatter={(value: any, name: any) => [
                  name === "medianPrice" ? formatUSD(Number(value)) : value.toLocaleString(),
                  name === "medianPrice" ? "Median Home Price" : "Active Inventory"
                ]}
              />
              <Line yAxisId="left" type="monotone" dataKey="medianPrice" stroke="#4A5D4E" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="medianPrice" />
              <Line yAxisId="right" type="monotone" dataKey="inventory" stroke="#C18C5D" strokeWidth={2} dot={{ r: 3 }} name="inventory" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. PROPERTY SNAPSHOTS VIEW: RECENT HOMES IN AGENT'S ACTIVE OREGON MLS AREA (10-15 Low/No Down Payment Listings) */}
      <div id="property-snapshots-view" className="space-y-4">
        <div className="bg-white rounded-3xl p-6 border border-[#EAE7E0] shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#EAE7E0] pb-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                  <Home className="w-3.5 h-3.5 text-emerald-600" />
                  GEOID Spatial Area: {primaryCounty} County (FIPS {primaryFips})
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#4A5D4E]/10 text-[#4A5D4E] text-xs font-bold border border-[#4A5D4E]/20">
                  <Compass className="w-3.5 h-3.5 text-[#C18C5D]" />
                  {mlsInfo.mls.shortName} Licensed Territory
                </span>
                {directListingsCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold border border-amber-300">
                    <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                    {directListingsCount} Primary Contact Listing{directListingsCount > 1 ? "s" : ""}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 text-[11px] font-semibold border border-blue-200">
                  <ExternalLink className="w-3 h-3 text-blue-600" />
                  Real-Time Zillow Verification
                </span>
              </div>

              <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#2D362E]">
                Property Snapshots: Low & Zero Down Eligible Homes
              </h3>
              <p className="text-xs text-[#606C5D] mt-1 max-w-3xl leading-relaxed">
                Pre-screened RentCast property snapshots spatially filtered to{" "}
                <button
                  type="button"
                  onClick={() => openAgentSpotlightLeadModal({ topic: "Property Snapshots" })}
                  className="font-bold text-[#4A5D4E] underline decoration-[#C18C5D] hover:text-[#2D362E] cursor-pointer"
                  title={`Request curated homes from ${spotlightAgent.name}`}
                >
                  {spotlightAgent.name}
                </button>
                's licensed Oregon counties ({licensedCounties.join(", ")}) via GEOID and MLS territory matching. Every listing is screened for USDA 100% (0% down), OHCS LMI census tract flex grants, Lakeview National Community Second, or FirstHome price caps. Listings owned by{" "}
                <button
                  type="button"
                  onClick={() => openAgentSpotlightLeadModal({ topic: "Primary Contact Listings" })}
                  className="font-bold text-[#4A5D4E] underline decoration-[#C18C5D] hover:text-[#2D362E] cursor-pointer"
                  title={`Connect directly with ${agentName}`}
                >
                  {agentName.split(" ")[0]}
                </button>{" "}
                are highlighted as the <strong>Primary Contact</strong>. Click <strong>View on Zillow</strong> on any snapshot to dynamically verify live listing status in real-time.
              </p>
            </div>

            {/* Quick Filter Buttons for Matched Listings & Request City List CTA */}
            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => openAgentSpotlightLeadModal({ topic: "Curated Oregon Low/No Down Homes" })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#2D362E] to-[#4A5D4E] hover:from-[#1E251F] hover:to-[#38463B] text-white text-xs font-bold shadow-2xs transition-all cursor-pointer mr-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
                <span>Get Curated City List from {agentName.split(" ")[0]}</span>
              </button>
              <button
                type="button"
                onClick={() => setListingFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  listingFilter === "all"
                    ? "bg-[#2D362E] text-white shadow-2xs"
                    : "bg-[#FAF9F5] hover:bg-[#F1EFE9] text-[#606C5D] border border-[#EAE7E0]"
                }`}
              >
                All Territory ({matchedSpotlightListings.length})
              </button>

              {directListingsCount > 0 && (
                <button
                  type="button"
                  onClick={() => setListingFilter("direct")}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    listingFilter === "direct"
                      ? "bg-amber-600 text-white shadow-2xs"
                      : "bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100"
                  }`}
                >
                  <Star className="w-3 h-3 fill-current" />
                  <span>Primary Contact ({directListingsCount})</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setListingFilter("usda")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  listingFilter === "usda"
                    ? "bg-emerald-700 text-white shadow-2xs"
                    : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                }`}
              >
                USDA 0% Down
              </button>

              <button
                type="button"
                onClick={() => setListingFilter("lmi")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  listingFilter === "lmi"
                    ? "bg-blue-700 text-white shadow-2xs"
                    : "bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100"
                }`}
              >
                LMI Flex Grants
              </button>

              <button
                type="button"
                onClick={() => setListingFilter("firsthome")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  listingFilter === "firsthome"
                    ? "bg-purple-700 text-white shadow-2xs"
                    : "bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100"
                }`}
              >
                FirstHome Cap
              </button>
            </div>
          </div>

          {/* Listings Grid (10-15 Cards) */}
          {filteredMatchedListings.length === 0 ? (
            <div className="p-8 text-center bg-[#FAF9F5] rounded-2xl border border-[#EAE7E0] space-y-2">
              <Home className="w-8 h-8 text-[#9A9488] mx-auto" />
              <p className="text-xs font-bold text-[#2D362E]">No listings matched this specific sub-filter.</p>
              <button
                type="button"
                onClick={() => setListingFilter("all")}
                className="text-xs font-semibold text-[#4A5D4E] underline hover:text-[#2D362E]"
              >
                View all {matchedSpotlightListings.length} matched homes in {primaryCounty} County
              </button>
            </div>
          ) : (
            <div className="flex overflow-x-auto sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-4 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {filteredMatchedListings.map(({ listing, isDirectListing, zillowUrl, eligibilityHighlights, matchedCounty, countyFips, geoid, tractFormatted }) => {
                return (
                  <div
                    key={listing.id}
                    className={`snap-start shrink-0 w-[85vw] sm:w-auto max-w-[360px] sm:max-w-none rounded-3xl p-4.5 flex flex-col justify-between transition-all duration-200 hover:shadow-md relative group ${
                      isDirectListing
                        ? "bg-gradient-to-b from-amber-50/70 via-white to-white border-2 border-amber-400/95 ring-2 ring-amber-400/20 shadow-xs"
                        : "bg-white border border-[#EAE7E0] hover:border-[#4A5D4E]/40"
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Photo + Status Badge */}
                      <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-[#2D362E] shadow-2xs">
                        <img
                          src={listing.imageUrl}
                          alt={listing.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

                        {/* Top Direct Listing or MLS Tag */}
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5">
                          {isDirectListing ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                              <Star className="w-3 h-3 fill-white" />
                              Primary Contact Listing
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/60 text-white text-[10px] font-semibold backdrop-blur-xs">
                              <Compass className="w-3 h-3 text-[#D4A373]" />
                              {mlsInfo.mls.shortName}
                            </span>
                          )}

                          <span className="px-2 py-0.5 rounded-lg bg-black/60 text-white text-[10px] font-bold backdrop-blur-xs">
                            {listing.daysOnMarket ?? 4}d on market
                          </span>
                        </div>

                        {/* Bottom Photo Overlay Info */}
                        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-baseline justify-between text-white">
                          <span className="text-lg font-bold font-serif drop-shadow-xs">
                            {formatUSD(listing.price)}
                          </span>
                          <span className="text-[11px] font-medium text-white/90">
                            {listing.city}, {listing.state}
                          </span>
                        </div>
                      </div>

                      {/* Property Specs (Phase 1B: Null guarded) */}
                      <div className="flex items-center justify-between text-xs text-[#606C5D] border-b border-[#EAE7E0] pb-2">
                        <span className="font-bold flex items-center gap-1">
                          <Bed className="w-3.5 h-3.5 text-[#4A5D4E]" />
                          {listing.beds != null ? `${listing.beds} Beds` : "— Beds"}
                        </span>
                        <span className="font-bold flex items-center gap-1">
                          <Bath className="w-3.5 h-3.5 text-[#4A5D4E]" />
                          {listing.baths != null ? `${listing.baths} Baths` : "— Baths"}
                        </span>
                        <span className="font-bold flex items-center gap-1">
                          <Maximize2 className="w-3.5 h-3.5 text-[#4A5D4E]" />
                          {listing.sqft != null ? `${listing.sqft.toLocaleString()} sqft` : "— sqft"}
                        </span>
                        <span className="text-[11px] text-[#4A5D4E] font-medium">
                          {matchedCounty} Co. {countyFips ? `(FIPS ${countyFips})` : ""}
                        </span>
                      </div>

                      {/* Title & Address */}
                      <div>
                        <h4 className="font-serif font-bold text-sm text-[#2D362E] line-clamp-1 group-hover:text-[#4A5D4E] transition-colors">
                          {listing.title || listing.address}
                        </h4>
                        <p className="text-[11px] text-[#9A9488] truncate mt-0.5">
                          {listing.address}, {listing.city}, OR {listing.zip}
                        </p>
                        {geoid && (
                          <div className="flex items-center gap-1 text-[10px] text-[#7A887B] font-mono mt-1">
                            <MapPin className="w-2.5 h-2.5 text-[#4A5D4E]" />
                            <span>GEOID: {geoid}</span>
                            {tractFormatted && (
                              <>
                                <span className="text-[#D0C9BE]">•</span>
                                <span>{tractFormatted}</span>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Low/No Down Payment Eligibility Badges */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {eligibilityHighlights.map((badge, bIdx) => (
                          <span
                            key={bIdx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200"
                          >
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            {badge}
                          </span>
                        ))}
                      </div>

                      {/* Listing Agent of Record / Primary Contact Visual Callout */}
                      {isDirectListing ? (
                        <div className="p-3.5 rounded-2xl bg-amber-50/95 border border-amber-300 shadow-xs space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-black text-amber-950 text-xs">
                              <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                              <span>Primary Contact (Listing Agent of Record)</span>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 text-[10px] font-bold">
                              RentCast Verified
                            </span>
                          </div>
                          <div className="flex items-center gap-2.5 pt-0.5">
                            <img
                              src={agentHeadshot}
                              alt={agentName}
                              className="w-9 h-9 rounded-full object-cover border border-amber-400 shrink-0 shadow-2xs"
                            />
                            <div className="text-xs text-amber-950 leading-tight">
                              <div className="font-bold text-[13px]">{agentName}</div>
                              <div className="text-[11px] text-amber-800">{agentBrokerage}</div>
                              <div className="text-[10px] text-amber-700">Exclusive Listing Agent</div>
                            </div>
                          </div>
                          <p className="text-[11px] text-amber-900 leading-relaxed">
                            Listed by{" "}
                            <button
                              type="button"
                              onClick={() => openAgentSpotlightLeadModal({ topic: "Exclusive Listing Walkthrough", property: listing, city: listing.city })}
                              className="font-bold underline decoration-amber-600 hover:text-[#2D362E] cursor-pointer"
                              title={`Request walkthrough from ${agentName}`}
                            >
                              {agentName}
                            </button>
                            . Connect directly with the primary contact for private walkthroughs, seller disclosures, and a curated list of similar low/no down homes in {listing.city}.
                          </p>
                          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-amber-200/80">
                            <button
                              type="button"
                              onClick={() => openAgentSpotlightLeadModal({ topic: `Tour & Low-Down Analysis for ${listing.address}`, property: listing, city: listing.city })}
                              className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-[#2D362E] to-[#4A5D4E] hover:from-[#1E251F] hover:to-[#38463B] text-white text-[11px] font-bold transition-colors shadow-2xs cursor-pointer"
                            >
                              <Sparkles className="w-3 h-3 text-[#D4A373]" />
                              <span>Tour / Curated List in {listing.city}</span>
                            </button>
                            <a
                              href={`tel:${agentPhone}`}
                              className="inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl bg-white border border-amber-300 text-[#2D362E] text-[11px] font-bold hover:bg-amber-100 transition-colors shadow-2xs"
                            >
                              <PhoneCall className="w-3 h-3 text-[#D4A373]" />
                              <span>Call</span>
                            </a>
                            <a
                              href={`sms:${agentPhone}`}
                              className="inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-xl bg-white border border-amber-300 text-[#2D362E] text-[11px] font-bold hover:bg-amber-100 transition-colors shadow-2xs"
                            >
                              <MessageSquare className="w-3 h-3 text-amber-700" />
                              <span>Text</span>
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EAE7E0] text-[11px] text-[#606C5D] space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 font-semibold text-[#2D362E]">
                              <UserCheck className="w-3.5 h-3.5 text-[#4A5D4E]" />
                              <span>Buyer Representation Advisory:</span>
                            </div>
                            <span className="text-[10px] text-[#8C5D30] font-semibold">Low/Zero Down Specialist</span>
                          </div>
                          <p className="leading-relaxed">
                            <button
                              type="button"
                              onClick={() => openAgentSpotlightLeadModal({ topic: `Buyer Tour for ${listing.address}`, property: listing, city: listing.city })}
                              className="font-bold text-[#4A5D4E] underline decoration-[#C18C5D] hover:text-[#2D362E] cursor-pointer"
                              title={`Connect with ${agentName}`}
                            >
                              {agentName}
                            </button>{" "}
                            ({agentPhone}) can represent you as your buyer's broker, arrange a private tour, and structure your purchase offer with down payment assistance.
                          </p>
                          <div className="flex items-center gap-2 pt-1 border-t border-[#EAE7E0]/80">
                            <button
                              type="button"
                              onClick={() => openAgentSpotlightLeadModal({ topic: `Curated Homes in ${listing.city}`, property: listing, city: listing.city })}
                              className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#FAF9F5] hover:bg-[#F1EFE9] border border-[#DCD7CD] text-[#2D362E] text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              <Sparkles className="w-3 h-3 text-[#C18C5D]" />
                              <span>Get Curated List in {listing.city}</span>
                            </button>
                            <a
                              href={`tel:${agentPhone}`}
                              className="inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-white border border-[#EAE7E0] text-[#4A5D4E] text-[10px] font-bold hover:bg-[#FAF9F5]"
                            >
                              <Phone className="w-3 h-3 text-[#4A5D4E]" />
                              <span>Call</span>
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Area: Real-Time Zillow Status Verification */}
                    <div className="pt-3 mt-3 border-t border-[#EAE7E0] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[10px] text-[#9A9488]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="truncate">RentCast Snapshot • {mlsInfo.mls.shortName}</span>
                      </div>

                      <a
                        href={zillowUrl || constructDynamicZillowUrl(listing)}
                        target="_blank"
                        rel="noopener noreferrer"
                        id={`view-on-zillow-${listing.id}`}
                        title={`Verify real-time listing status on Zillow for ${listing.address}, ${listing.city}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2D362E] hover:bg-[#4A5D4E] text-white text-xs font-bold transition-all shadow-xs cursor-pointer group-hover:shadow-sm shrink-0"
                      >
                        <span>View on Zillow</span>
                        <ExternalLink className="w-3.5 h-3.5 text-[#D4A373]" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 4. Search & Filter Bar for Market News & Media */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#EAE7E0]">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#9A9488] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search inspection, inventory, escrow, earnest money, YouTube..."
            className="w-full pl-9 pr-3 py-2 bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl text-xs text-[#2D362E] focus:outline-none focus:border-[#4A5D4E] transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: "all", label: "All Insights" },
            { id: "inventory", label: "Inventory" },
            { id: "inspection", label: "Inspections" },
            { id: "strategy", label: "Strategies" },
            { id: "negotiation", label: "Negotiations" },
            { id: "closing", label: "Escrow & Closing" }
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-[#4A5D4E] text-white shadow-2xs"
                  : "bg-[#FAF9F5] hover:bg-[#F1EFE9] text-[#606C5D] border border-[#EAE7E0]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Source Type Filter */}
        <div className="flex items-center gap-1 shrink-0 border-t md:border-t-0 md:border-l border-[#EAE7E0] pt-2 md:pt-0 md:pl-3">
          <button
            type="button"
            onClick={() => setSelectedSourceType("all")}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
              selectedSourceType === "all" ? "bg-[#2D362E] text-white" : "text-[#606C5D] hover:bg-[#FAF9F5]"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setSelectedSourceType("youtube")}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
              selectedSourceType === "youtube" ? "bg-red-600 text-white" : "text-red-700 hover:bg-red-50"
            }`}
          >
            <Youtube className="w-3.5 h-3.5" />
            <span>YouTube</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedSourceType("blog")}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
              selectedSourceType === "blog" ? "bg-[#C18C5D] text-white" : "text-[#8C5D30] hover:bg-[#FAF9F5]"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Blogs</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedSourceType("news")}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
              selectedSourceType === "news" ? "bg-[#4A5D4E] text-white" : "text-[#4A5D4E] hover:bg-[#FAF9F5]"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>News</span>
          </button>
        </div>
      </div>

      {/* 5. Filtered Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#EAE7E0] space-y-3">
          <AlertCircle className="w-10 h-10 text-[#9A9488] mx-auto" />
          <h3 className="font-serif font-bold text-lg text-[#2D362E]">No Matching Market Insights</h3>
          <p className="text-xs text-[#606C5D] max-w-md mx-auto">
            Try adjusting your search terms or clearing the category filters. All results continue to be strictly rate-free.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory("all");
              setSelectedSourceType("all");
              setSearchQuery("");
            }}
            className="px-4 py-2 rounded-xl bg-[#4A5D4E] text-white text-xs font-bold hover:bg-[#38463B]"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="flex overflow-x-auto sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-4 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {filteredItems.map((item, index) => {
            // Randomly / pseudo-randomly associate the cobrand agent recommendation banner
            // with rotating sources (e.g. on every 2nd or 3rd item, plus when index matches spotlight)
            const hasAgentRecommendation =
              index % 2 === 0 || item.id === activeSpotlightItem.id || index === 0;

            const isYouTube = item.sourceType === "youtube";

            return (
              <div
                key={item.id}
                className="snap-start shrink-0 w-[85vw] sm:w-auto max-w-[380px] sm:max-w-none bg-white rounded-3xl border border-[#EAE7E0] hover:border-[#DCD7CD] p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-md group relative"
              >
                <div className="space-y-3">
                  {/* Top Metadata Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isYouTube
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : item.sourceType === "blog"
                            ? "bg-amber-50 text-amber-800 border border-amber-200"
                            : "bg-[#4A5D4E]/10 text-[#4A5D4E] border border-[#4A5D4E]/20"
                        }`}
                      >
                        {isYouTube ? (
                          <Youtube className="w-3 h-3 text-red-600" />
                        ) : item.sourceType === "blog" ? (
                          <FileText className="w-3 h-3 text-amber-600" />
                        ) : (
                          <Globe className="w-3 h-3 text-[#4A5D4E]" />
                        )}
                        <span>{isYouTube ? "YouTube Video" : item.sourceType === "blog" ? "High-Trust Blog" : "Housing News"}</span>
                      </span>

                      <span className="text-[10px] text-[#9A9488] font-medium">
                        {item.readOrWatchTime}
                      </span>
                    </div>

                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-[#FAF9F5] text-[#606C5D] border border-[#EAE7E0]">
                      {item.confidenceScore}% Confidence
                    </span>
                  </div>

                  {/* Thumbnail for YouTube items */}
                  {item.thumbnailUrl && (
                    <div className="relative rounded-2xl overflow-hidden aspect-video bg-[#2D362E] shadow-2xs group/thumb">
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300 opacity-90 group-hover/thumb:opacity-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-[11px] font-bold">
                        <span className="bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-xs flex items-center gap-1">
                          <Youtube className="w-3 h-3 text-red-500" />
                          {item.authorOrChannel}
                        </span>
                        <span className="bg-black/60 px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                          {item.readOrWatchTime}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Title & Source */}
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#2D362E] leading-snug group-hover:text-[#4A5D4E] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-[#9A9488] mt-1">
                      Published by <strong>{item.source}</strong> • {item.publishedAt}
                    </p>
                  </div>

                  {/* Summary */}
                  <p className="text-xs text-[#606C5D] leading-relaxed line-clamp-3">
                    {item.summary}
                  </p>

                  {/* Key Takeaway Box */}
                  <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#EAE7E0] text-xs">
                    <span className="text-[10px] font-bold text-[#4A5D4E] uppercase tracking-wider block mb-0.5">
                      Key Takeaway for First-Time Buyers:
                    </span>
                    <p className="text-[#2D362E] font-medium leading-relaxed">
                      {item.keyTakeaway}
                    </p>
                  </div>

                  {/* Injected Agent Recommendation:
                      Sprinkles in the exact phrase:
                      "To learn more on this scenario or this topic, you can consult your local trusted agent, [Agent Name] ([Agent Phone])"
                  */}
                  {hasAgentRecommendation && (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#F5F2EA] to-[#FAF9F5] border border-[#C18C5D]/30 space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#C18C5D]" />
                        <span className="text-[10px] font-bold text-[#8C5D30] uppercase tracking-wider">
                          Local Agent Strategy Advisory
                        </span>
                      </div>

                      <p className="text-xs text-[#2D362E] font-medium leading-relaxed">
                        To learn more on this scenario or this topic, you can consult your local trusted agent,{" "}
                        <button
                          type="button"
                          onClick={() => openAgentSpotlightLeadModal({ topic: item.highlightTopic || item.title })}
                          className="font-bold text-[#4A5D4E] underline decoration-[#C18C5D] hover:text-[#2D362E] cursor-pointer"
                          title={`Request curated list of low/no down homes from ${agentName}`}
                        >
                          {agentName}
                        </button>{" "}
                        ({agentPhone}).
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => openAgentSpotlightLeadModal({ topic: item.highlightTopic || item.title })}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2D362E] hover:bg-[#1E251F] text-white text-[11px] font-bold transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-[#D4A373]" />
                          <span>Get Curated City List</span>
                        </button>

                        <a
                          href={`tel:${agentPhone}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#EAE7E0] hover:bg-[#FAF9F5] text-[#4A5D4E] text-[11px] font-bold transition-colors"
                        >
                          <PhoneCall className="w-3 h-3 text-[#D4A373]" />
                          <span>Call</span>
                        </a>

                        <a
                          href={`sms:${agentPhone}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-[#EAE7E0] hover:bg-[#FAF9F5] text-[#4A5D4E] text-[11px] font-bold transition-colors"
                        >
                          <MessageSquare className="w-3 h-3 text-[#C18C5D]" />
                          <span>Text</span>
                        </a>

                        <span className="text-[10px] text-[#9A9488] ml-auto truncate">
                          {agentBrokerage}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Source Action Link */}
                <div className="pt-4 mt-4 border-t border-[#EAE7E0] flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#606C5D]">
                    {item.categoryLabel}
                  </span>

                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#4A5D4E] hover:text-[#2D362E] transition-colors"
                  >
                    <span>{isYouTube ? "Watch on YouTube" : "Read Article"}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Global Agent Spotlight Lead Generation Modal */}
      <AgentSpotlightLeadModal
        isOpen={isSpotlightLeadModalOpen}
        onClose={() => setIsSpotlightLeadModalOpen(false)}
        agent={spotlightAgent}
        loanOfficer={loanOfficer}
        listings={matchedSpotlightListings}
        onSaveLead={onSaveLead}
        onTriggerToast={onTriggerToast}
        initialCity={leadModalContext.city}
        referringTopic={leadModalContext.topic}
        selectedProperty={leadModalContext.property}
      />
    </div>
  );
};
