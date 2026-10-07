import React, { useState, useEffect } from "react";
import {
  PropertyListing,
  ProfessionalGuidesState,
  RealEstateAgentProfile,
  LOPairing,
  LoanOfficerProfile,
  VantageCoBrandedAdKit,
  AdCampaignDraft
} from "../types";
import {
  crossReferenceListingWithAgents,
  enrichListingsWithAgentMatches,
  generateVantageCoBrandedAdKit,
  pushCoBrandedListingToVantageQueue,
  syncCompletedAdKitToFthbPortal
} from "../utils/agentListingCrossReference";
import {
  Sparkles,
  Users,
  Building2,
  Megaphone,
  CheckCircle2,
  ExternalLink,
  Search,
  Filter,
  ArrowRight,
  Play,
  Share2,
  Copy,
  Check,
  Send,
  Eye,
  RefreshCw,
  Film,
  Smartphone,
  ShieldCheck,
  Layers,
  MapPin
} from "lucide-react";

interface MasterAgentPropertyListingPortalProps {
  guidesState: ProfessionalGuidesState;
  onUpdateGuidesState: (updated: ProfessionalGuidesState) => void;
  properties: PropertyListing[];
  setProperties: React.Dispatch<React.SetStateAction<PropertyListing[]>>;
  onTriggerToast: (msg: string) => void;
  onNavigateToAdsPortal?: () => void;
}

export const MasterAgentPropertyListingPortal: React.FC<MasterAgentPropertyListingPortalProps> = ({
  guidesState,
  onUpdateGuidesState,
  properties,
  setProperties,
  onTriggerToast,
  onNavigateToAdsPortal
}) => {
  const currentLo = guidesState.loanOfficer || guidesState.loanOfficers[0];
  const agentRoster = guidesState.agentRoster || [];
  const pairings = guidesState.pairings || [];
  const loanOfficers = guidesState.loanOfficers || [currentLo];

  // Tab mode
  const [activeTab, setActiveTab] = useState<"portal" | "ads_queue">("portal");
  const [filterType, setFilterType] = useState<"all" | "lo_pairs" | "matched_roster" | "unmatched">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Role simulation for marketing & LOA employee peers
  const [employeeRole, setEmployeeRole] = useState<"mktg_ads_creator" | "loa" | "loan_officer">("mktg_ads_creator");
  const [employeeName, setEmployeeName] = useState<string>("Alex Morgan");

  // Queue state
  const [adsQueue, setAdsQueue] = useState<VantageCoBrandedAdKit[]>([]);
  const [selectedKitId, setSelectedKitId] = useState<string | null>(null);
  const [isPushingToQueue, setIsPushingToQueue] = useState<string | null>(null);
  const [isCompletingAd, setIsCompletingAd] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeMediaPreviewTab, setActiveMediaPreviewTab] = useState<"facebook" | "google" | "video">("facebook");

  // Load existing queue from storage
  const loadQueue = () => {
    try {
      const raw = localStorage.getItem("vantage_ai_ads_queue_v1");
      if (raw) {
        const list: VantageCoBrandedAdKit[] = JSON.parse(raw);
        setAdsQueue(list);
        if (list.length > 0 && !selectedKitId) {
          setSelectedKitId(list[0].id);
        }
      }
    } catch (e) {
      console.warn("Could not load ads queue:", e);
    }
  };

  useEffect(() => {
    loadQueue();
    const handleUpdated = () => loadQueue();
    window.addEventListener("vantage_ads_queue_updated", handleUpdated);
    window.addEventListener("vantage_ad_synced_to_portal", handleUpdated);
    return () => {
      window.removeEventListener("vantage_ads_queue_updated", handleUpdated);
      window.removeEventListener("vantage_ad_synced_to_portal", handleUpdated);
    };
  }, []);

  // Enriched listings with cross reference
  const enrichedListings = React.useMemo(() => {
    return enrichListingsWithAgentMatches(properties, agentRoster, pairings, loanOfficers);
  }, [properties, agentRoster, pairings, loanOfficers]);

  // Statistics
  const totalListings = enrichedListings.length;
  const matchedListings = enrichedListings.filter((l) => l.isRosterAgentMatched);
  const loPairListings = enrichedListings.filter((l) => l.isLoAgentPair);
  const queuePendingCount = adsQueue.filter((k) => k.queueStatus !== "synced_to_ads_portal").length;
  const queueSyncedCount = adsQueue.filter((k) => k.queueStatus === "synced_to_ads_portal").length;

  // Filtered view
  const filteredListings = enrichedListings.filter((listing) => {
    if (filterType === "lo_pairs" && !listing.isLoAgentPair) return false;
    if (filterType === "matched_roster" && !listing.isRosterAgentMatched) return false;
    if (filterType === "unmatched" && listing.isRosterAgentMatched) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const addr = (listing.address || "").toLowerCase();
      const city = (listing.city || "").toLowerCase();
      const agName = (listing.matchedRosterAgent?.name || listing.listingAgent?.name || "").toLowerCase();
      const brokerage = (listing.matchedRosterAgent?.brokerage || listing.listingOffice?.name || "").toLowerCase();
      return addr.includes(q) || city.includes(q) || agName.includes(q) || brokerage.includes(q);
    }
    return true;
  });

  // Push single listing to Vantage AI Ads Queue
  const handlePushToAdsQueue = async (listing: PropertyListing) => {
    setIsPushingToQueue(listing.id);
    try {
      const match = crossReferenceListingWithAgents(listing, agentRoster, pairings, loanOfficers);
      const targetAgent = match.matchedAgent || {
        id: `agent-custom-${Date.now()}`,
        name: listing.listingAgent?.name || "Local REALTOR® Partner",
        title: "Real Estate Specialist",
        brokerage: listing.listingOffice?.name || undefined,
        licenseNumber: undefined,
        email: listing.listingAgent?.email || undefined,
        phone: listing.listingAgent?.phone || undefined,
        headshotUrl: "",
        bio: "Specializing in local buyer guidance.",
        specialties: ["First-Time Homebuyers"],
        marketAreas: [listing.city || "Oregon"]
      };

      const kit = await pushCoBrandedListingToVantageQueue(
        listing,
        match.pairedLoanOfficer || currentLo,
        targetAgent,
        match.pairing
      );

      loadQueue();
      setSelectedKitId(kit.id);
      onTriggerToast(`✓ Listing at ${listing.address} pushed to Vantage AI Ads Engine queue for ${targetAgent.name} + ${currentLo.name}!`);
    } catch (e: any) {
      console.error("Queue push error:", e);
      onTriggerToast("Failed to push to Ads Queue");
    } finally {
      setIsPushingToQueue(null);
    }
  };

  // Bulk Push all LO+Agent pair listings
  const handleBulkPushAllLoPairs = async () => {
    setIsPushingToQueue("bulk");
    try {
      let count = 0;
      for (const listing of loPairListings) {
        const match = crossReferenceListingWithAgents(listing, agentRoster, pairings, loanOfficers);
        if (match.matchedAgent) {
          await pushCoBrandedListingToVantageQueue(
            listing,
            match.pairedLoanOfficer || currentLo,
            match.matchedAgent,
            match.pairing
          );
          count++;
        }
      }
      loadQueue();
      onTriggerToast(`✓ Successfully pushed ${count} LO + Agent co-branded listings to Vantage AI Ads Engine queue!`);
    } catch (e) {
      console.error(e);
      onTriggerToast("Bulk push encountered an error");
    } finally {
      setIsPushingToQueue(null);
    }
  };

  // Complete ad creation by Marketing / LOA employee peer
  const handleCompleteAdCreation = async (kit: VantageCoBrandedAdKit) => {
    setIsCompletingAd(true);
    try {
      const roleTitle =
        employeeRole === "mktg_ads_creator"
          ? "Corporate Marketing Dept (MKTG & Ads Creator)"
          : employeeRole === "loa"
          ? "Loan Officer Assistant (LOA)"
          : "Loan Officer";

      const draft = await syncCompletedAdKitToFthbPortal(kit, roleTitle, employeeName);

      // Also add directly into guidesState.adCampaignDrafts
      const currentDrafts = guidesState.adCampaignDrafts || [];
      const updatedDrafts = [draft, ...currentDrafts.filter((d) => d.id !== draft.id)];

      onUpdateGuidesState({
        ...guidesState,
        adCampaignDrafts: updatedDrafts
      });

      loadQueue();
      onTriggerToast(
        `✓ Ad Creation completed by ${employeeName} (${roleTitle}) and synced to First-Time Homebuyer AI Ads Portal for ${kit.loName}!`
      );
    } catch (e: any) {
      console.error(e);
      onTriggerToast("Error completing ad creation");
    } finally {
      setIsCompletingAd(false);
    }
  };

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    onTriggerToast("Copied to clipboard!");
    setTimeout(() => setCopiedField(null), 2500);
  };

  const selectedKit = adsQueue.find((k) => k.id === selectedKitId) || adsQueue[0] || null;

  return (
    <div className="space-y-6">
      {/* Top Banner: Master Agent + Property Portal & Vantage Ads Engine */}
      <div className="bg-gradient-to-br from-[#1E2922] via-[#2A372E] to-[#162019] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-emerald-900/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Live Cross-Reference & Ads Engine Engine
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-pink-500/20 text-pink-300 border border-pink-500/30">
                RentCast ↔ Master Agent Roster
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              Master Agent + Property Listing & Vantage AI Ads Portal
            </h2>
            <p className="text-stone-300 text-sm max-w-2xl leading-relaxed">
              Cross-references every ingested RentCast property listing with your dashboard's master real estate agent list, detects active <strong>LO + Agent Co-Branded Pairs</strong>, and automatically queues listings into the <strong>Vantage AI Ads Engine</strong> for ready-made marketing scripts and video assets.
            </p>
          </div>

          {/* Quick Bulk Action Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={handleBulkPushAllLoPairs}
              disabled={isPushingToQueue !== null || loPairListings.length === 0}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-pink-900/40 transition-all cursor-pointer hover:scale-[1.02]"
            >
              <Megaphone className={`w-4 h-4 ${isPushingToQueue === "bulk" ? "animate-spin" : ""}`} />
              <span>Bulk Push ({loPairListings.length}) LO Pairs to Ads Engine</span>
            </button>
            {onNavigateToAdsPortal && (
              <button
                onClick={onNavigateToAdsPortal}
                className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-white/20 transition-all cursor-pointer"
              >
                <ExternalLink className="w-4 h-4 text-emerald-300" />
                <span>Go to AI Ads Portal</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Statistical Highlight Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="flex items-center justify-between text-stone-300 text-xs font-medium mb-1">
              <span>Total Listings Checked</span>
              <Building2 className="w-4 h-4 text-stone-400" />
            </div>
            <div className="text-2xl font-bold font-serif text-white">{totalListings}</div>
            <div className="text-[11px] text-stone-400 mt-0.5">Ingested Oregon properties</div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="flex items-center justify-between text-stone-300 text-xs font-medium mb-1">
              <span>Roster Agent Matches</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-serif text-emerald-300">{matchedListings.length}</div>
            <div className="text-[11px] text-emerald-400 mt-0.5">Linked to Master Roster</div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-pink-950/30 border border-pink-500/30 backdrop-blur-xs">
            <div className="flex items-center justify-between text-pink-300 text-xs font-medium mb-1">
              <span>LO + Agent Active Pairs</span>
              <Sparkles className="w-4 h-4 text-pink-400" />
            </div>
            <div className="text-2xl font-bold font-serif text-pink-200">{loPairListings.length}</div>
            <div className="text-[11px] text-pink-400 mt-0.5">Co-Branding campaigns ready</div>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div className="flex items-center justify-between text-stone-300 text-xs font-medium mb-1">
              <span>Vantage Ads Engine Queue</span>
              <Megaphone className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-serif text-amber-300">
              {queuePendingCount} <span className="text-xs font-normal text-stone-400">pending</span> / {queueSyncedCount} <span className="text-xs font-normal text-emerald-400">synced</span>
            </div>
            <div className="text-[11px] text-stone-400 mt-0.5">MKTG & LOA peers ready</div>
          </div>
        </div>
      </div>

      {/* Top Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("portal")}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "portal"
                ? "bg-[#2D362E] text-white shadow-sm"
                : "bg-stone-100 text-[#606C5D] hover:bg-stone-200"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Master Agent + Property Listing Portal ({filteredListings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("ads_queue")}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "ads_queue"
                ? "bg-pink-700 text-white shadow-sm"
                : "bg-pink-50 text-pink-800 hover:bg-pink-100 border border-pink-200"
            }`}
          >
            <Megaphone className="w-4 h-4 text-pink-300" />
            <span>Vantage AI Ads Engine Queue & Co-Branding Studio ({adsQueue.length})</span>
            {queuePendingCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>
        </div>

        {/* Quick Refresh */}
        <button
          onClick={loadQueue}
          className="p-2 text-[#606C5D] hover:bg-[#FAF9F5] rounded-xl border border-[#EAE7E0] transition-colors"
          title="Refresh Queue and Listings"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* TAB 1: MASTER AGENT + PROPERTY LISTING PORTAL */}
      {activeTab === "portal" && (
        <div className="space-y-6">
          {/* Controls: Search & Filters */}
          <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by address, city, agent name, or brokerage..."
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-[#EAE7E0] bg-white focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setFilterType("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterType === "all"
                    ? "bg-[#2D362E] text-white"
                    : "bg-white text-[#606C5D] border border-[#EAE7E0] hover:bg-stone-50"
                }`}
              >
                All ({enrichedListings.length})
              </button>

              <button
                onClick={() => setFilterType("lo_pairs")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  filterType === "lo_pairs"
                    ? "bg-pink-700 text-white"
                    : "bg-pink-50 text-pink-800 border border-pink-200 hover:bg-pink-100"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span>LO + Agent Pairs ({loPairListings.length})</span>
              </button>

              <button
                onClick={() => setFilterType("matched_roster")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterType === "matched_roster"
                    ? "bg-emerald-800 text-white"
                    : "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                }`}
              >
                Matched Roster ({matchedListings.length})
              </button>

              <button
                onClick={() => setFilterType("unmatched")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterType === "unmatched"
                    ? "bg-stone-700 text-white"
                    : "bg-white text-[#606C5D] border border-[#EAE7E0] hover:bg-stone-50"
                }`}
              >
                Unmatched ({enrichedListings.length - matchedListings.length})
              </button>
            </div>
          </div>

          {/* Listing Grid */}
          {filteredListings.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-[#EAE7E0] p-12 text-center text-stone-500">
              <Building2 className="w-12 h-12 mx-auto mb-3 text-stone-300" />
              <p className="font-bold text-[#2D362E]">No listings found matching criteria</p>
              <p className="text-xs text-[#606C5D] mt-1">Try broadening your search query or selecting 'All'.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredListings.map((listing) => {
                const match = crossReferenceListingWithAgents(listing, agentRoster, pairings, loanOfficers);
                const isLoPair = listing.isLoAgentPair || match.isLoAgentPair;
                const matchedAgent = listing.matchedRosterAgent || match.matchedAgent;
                const loPairInfo = listing.loPairing || (isLoPair ? {
                  loName: match.pairedLoanOfficer?.name || currentLo.name,
                  agentName: matchedAgent?.name || listing.listingAgent?.name || "Partner Agent",
                  customSlug: match.coBrandSlug || "mike-and-sarah",
                  title: `${match.pairedLoanOfficer?.name || currentLo.name} + ${matchedAgent?.name} Co-Branded`
                } : undefined);

                return (
                  <div
                    key={listing.id}
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between bg-white shadow-xs hover:shadow-md ${
                      isLoPair
                        ? "border-pink-300 ring-2 ring-pink-500/10"
                        : matchedAgent
                        ? "border-emerald-300"
                        : "border-[#EAE7E0]"
                    }`}
                  >
                    {/* Header: Co-Branding Pair or Roster Match Banner */}
                    {isLoPair ? (
                      <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-purple-700 p-3 text-white">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-pink-200" />
                            LO + Agent Partner Co-Branded Pair
                          </span>
                          <span className="text-[10px] font-mono bg-black/30 px-2 py-0.5 rounded text-pink-200">
                            /{loPairInfo?.customSlug}
                          </span>
                        </div>
                        <div className="text-xs font-bold mt-1 text-white truncate">
                          🤝 {loPairInfo?.loName} &amp; {loPairInfo?.agentName}
                        </div>
                      </div>
                    ) : matchedAgent ? (
                      <div className="bg-emerald-800 p-2.5 text-white flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                          Master Agent Roster Match
                        </span>
                        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
                          {matchedAgent.brokerage}
                        </span>
                      </div>
                    ) : (
                      <div className="bg-stone-100 p-2.5 text-stone-600 flex items-center justify-between border-b border-[#EAE7E0]">
                        <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          Listing Agent (Unmatched in Roster)
                        </span>
                        <span className="text-[10px] text-stone-400">RentCast Source</span>
                      </div>
                    )}

                    {/* Listing Summary Body */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Price & Specs */}
                        <div className="flex items-baseline justify-between">
                          <span className="text-xl font-bold font-serif text-[#2D362E]">
                            ${listing.price.toLocaleString()}
                          </span>
                          <span className="text-xs text-[#606C5D]">
                            {listing.beds}b • {listing.baths}ba • {listing.sqft} sqft
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-[#2D362E] mt-1 truncate">
                          {listing.address}
                        </div>
                        <div className="text-[11px] text-[#606C5D]">
                          {listing.city}, {listing.state} {listing.zip}
                        </div>

                        {/* Overlay tags */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {(listing.isUsdaEligible || listing.overlayEligibility?.usdaEligible) && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                              USDA 0% Down
                            </span>
                          )}
                          {(listing.isOhcsEligible || listing.overlayEligibility?.firstHomeEligible) && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                              OHCS Grant Eligible
                            </span>
                          )}
                          {listing.mlsNumber && (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
                              MLS #{listing.mlsNumber}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Agent Association Card */}
                      <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl p-3 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-[#606C5D] uppercase tracking-wider">
                            Listing Agent Cross-Reference
                          </span>
                          {isLoPair && (
                            <span className="text-[9px] font-bold text-pink-700 bg-pink-100 px-1.5 py-0.2 rounded-full">
                              Co-Brand Ready
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#4A5D4E]/10 flex items-center justify-center font-bold text-xs text-[#4A5D4E] shrink-0">
                            {(matchedAgent?.name || listing.listingAgent?.name || "A").slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-[#2D362E] truncate">
                              {matchedAgent?.name || listing.listingAgent?.name || "Unknown Agent"}
                            </div>
                            <div className="text-[10px] text-[#606C5D] truncate">
                              {matchedAgent?.brokerage || listing.listingOffice?.name || "Brokerage"}
                            </div>
                          </div>
                        </div>

                        {/* Co-branded Link Indicator */}
                        {isLoPair && loPairInfo?.customSlug && (
                          <div className="pt-1.5 border-t border-[#EAE7E0] flex items-center justify-between text-[10px]">
                            <span className="text-[#606C5D]">Co-Branded Link:</span>
                            <a
                              href={`/${loPairInfo.customSlug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-bold text-pink-700 hover:underline flex items-center gap-1"
                            >
                              /{loPairInfo.customSlug}
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Action Button: Push to Vantage AI Ads Queue */}
                      <div className="pt-2">
                        <button
                          onClick={() => handlePushToAdsQueue(listing)}
                          disabled={isPushingToQueue === listing.id}
                          className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                            isLoPair
                              ? "bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white shadow-pink-900/20"
                              : "bg-[#2D362E] hover:bg-[#4A5D4E] text-white"
                          }`}
                        >
                          <Megaphone className={`w-3.5 h-3.5 ${isPushingToQueue === listing.id ? "animate-spin" : ""}`} />
                          <span>
                            {isPushingToQueue === listing.id
                              ? "Pushing to Vantage Queue..."
                              : isLoPair
                              ? "Push Co-Branded Ad to Vantage Queue"
                              : "Push Property to Vantage Queue"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: VANTAGE AI ADS ENGINE QUEUE & CO-BRANDING STUDIO */}
      {activeTab === "ads_queue" && (
        <div className="space-y-6">
          {/* Employee Peer Role Selector Banner (Corporate Marketing vs LOA vs LO) */}
          <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#606C5D] uppercase tracking-wider">
                  Active Workspace Role Simulation:
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  employeeRole === "mktg_ads_creator"
                    ? "bg-pink-100 text-pink-800 border border-pink-300"
                    : employeeRole === "loa"
                    ? "bg-cyan-100 text-cyan-800 border border-cyan-300"
                    : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                }`}>
                  {employeeRole === "mktg_ads_creator"
                    ? "Corporate Marketing Dept (MKTG & Ads Creator)"
                    : employeeRole === "loa"
                    ? "Loan Officer Assistant (LOA)"
                    : "Producing Loan Officer"}
                </span>
              </div>
              <p className="text-xs text-[#606C5D]">
                Employee peers in <strong>Corporate Marketing</strong> and <strong>LOA roles</strong> review queued co-branded listings, finalize scripts &amp; video storyboards, and sync approved output assets directly to the Loan Officer's dashboard AI Ads Portal.
              </p>
            </div>

            {/* Role Switcher */}
            <div className="flex items-center gap-2">
              <select
                value={employeeRole}
                onChange={(e) => setEmployeeRole(e.target.value as any)}
                className="text-xs font-semibold px-3 py-2 rounded-xl border border-[#EAE7E0] bg-white text-[#2D362E] focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]"
              >
                <option value="mktg_ads_creator">Corporate Marketing Dept</option>
                <option value="loa">Loan Officer Assistant (LOA)</option>
                <option value="loan_officer">Loan Officer (Self)</option>
              </select>
              <input
                type="text"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="Peer Name"
                className="w-32 text-xs px-3 py-2 rounded-xl border border-[#EAE7E0] bg-white text-[#2D362E]"
                title="Employee Peer Name"
              />
            </div>
          </div>

          {/* Queue Interface Grid */}
          {adsQueue.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-[#EAE7E0] p-12 text-center text-stone-500">
              <Megaphone className="w-12 h-12 mx-auto mb-3 text-stone-300" />
              <h4 className="font-bold text-[#2D362E] text-base">The Vantage AI Ads Queue is currently empty</h4>
              <p className="text-xs text-[#606C5D] mt-1 max-w-md mx-auto">
                Go to the Master Agent + Property Portal tab and click <strong>"Push Co-Branded Ad to Vantage Queue"</strong> on any listing to automatically generate co-branded ad copy and video assets.
              </p>
              <button
                onClick={() => setActiveTab("portal")}
                className="mt-4 px-4 py-2 rounded-xl bg-[#2D362E] text-white text-xs font-bold"
              >
                Browse Listings &amp; Push to Queue
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Queue Items List (5 cols) */}
              <div className="lg:col-span-4 space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-bold text-[#606C5D] uppercase tracking-wider">
                    Queued Co-Branded Campaigns ({adsQueue.length})
                  </span>
                  <button
                    onClick={() => {
                      localStorage.removeItem("vantage_ai_ads_queue_v1");
                      setAdsQueue([]);
                      onTriggerToast("Queue cleared");
                    }}
                    className="text-[10px] text-stone-400 hover:text-red-600 transition-colors"
                  >
                    Clear Queue
                  </button>
                </div>

                <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                  {adsQueue.map((kit) => {
                    const isSelected = kit.id === selectedKit?.id;
                    const isSynced = kit.queueStatus === "synced_to_ads_portal";

                    return (
                      <div
                        key={kit.id}
                        onClick={() => setSelectedKitId(kit.id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                          isSelected
                            ? "bg-white border-pink-500 ring-2 ring-pink-500/20 shadow-md"
                            : "bg-[#FAF9F5] border-[#EAE7E0] hover:border-stone-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isSynced
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}>
                            {isSynced ? "✓ Synced to AI Ads Portal" : "In Review / Ready"}
                          </span>
                          <span className="text-xs font-bold text-[#2D362E]">
                            ${kit.propertyPrice.toLocaleString()}
                          </span>
                        </div>

                        <div className="font-bold text-xs text-[#2D362E] truncate">
                          {kit.propertyAddress}
                        </div>
                        <div className="text-[11px] text-[#606C5D]">
                          {kit.propertyCity}, OR • {kit.agentName} + {kit.loName}
                        </div>

                        {kit.completedBy && (
                          <div className="text-[10px] text-emerald-700 font-medium mt-1">
                            Completed by: {kit.completedBy}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Active Co-Branded Asset Preview & Peer Completion Studio (8 cols) */}
              {selectedKit && (
                <div className="lg:col-span-8 bg-white border border-[#EAE7E0] rounded-3xl p-6 shadow-sm space-y-6">
                  {/* Co-Branding Pair Dossier Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE7E0]">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-pink-800 border border-pink-200">
                          Co-Branded Team Dossier
                        </span>
                        <span className="text-xs font-mono text-[#606C5D]">
                          /{selectedKit.coBrandSlug}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-[#2D362E] mt-1">
                        {selectedKit.agentName} ({selectedKit.agentBrokerage}) &amp; {selectedKit.loName} (CFM)
                      </h3>
                      <p className="text-xs text-[#606C5D]">
                        Target Listing: <strong>{selectedKit.propertyAddress}, {selectedKit.propertyCity}</strong> (${selectedKit.propertyPrice.toLocaleString()})
                      </p>
                    </div>

                    {/* Completion Button */}
                    <button
                      onClick={() => handleCompleteAdCreation(selectedKit)}
                      disabled={isCompletingAd || selectedKit.queueStatus === "synced_to_ads_portal"}
                      className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
                        selectedKit.queueStatus === "synced_to_ads_portal"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default"
                          : "bg-emerald-700 hover:bg-emerald-800 text-white hover:scale-[1.02]"
                      }`}
                    >
                      <CheckCircle2 className={`w-4 h-4 ${isCompletingAd ? "animate-spin" : ""}`} />
                      <span>
                        {selectedKit.queueStatus === "synced_to_ads_portal"
                          ? "Output Synced to LO Ads Portal"
                          : isCompletingAd
                          ? "Pushing Assets to Portal..."
                          : `Complete & Push to LO Ads Portal (${employeeRole === 'mktg_ads_creator' ? 'MKTG Dept' : 'LOA'})`}
                      </span>
                    </button>
                  </div>

                  {/* Channel Subtabs: Meta Facebook Ads, Google Ads, Short-form Video */}
                  <div className="flex items-center gap-2 border-b border-[#EAE7E0] pb-2">
                    <button
                      onClick={() => setActiveMediaPreviewTab("facebook")}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeMediaPreviewTab === "facebook"
                          ? "bg-blue-600 text-white"
                          : "bg-blue-50 text-blue-800 hover:bg-blue-100"
                      }`}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Meta / Facebook Ads Copy</span>
                    </button>

                    <button
                      onClick={() => setActiveMediaPreviewTab("google")}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeMediaPreviewTab === "google"
                          ? "bg-red-600 text-white"
                          : "bg-red-50 text-red-800 hover:bg-red-100"
                      }`}
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Google Ads Responsive Search</span>
                    </button>

                    <button
                      onClick={() => setActiveMediaPreviewTab("video")}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        activeMediaPreviewTab === "video"
                          ? "bg-purple-600 text-white"
                          : "bg-purple-50 text-purple-800 hover:bg-purple-100"
                      }`}
                    >
                      <Film className="w-3.5 h-3.5" />
                      <span>30s Video Script &amp; Storyboard</span>
                    </button>
                  </div>

                  {/* TAB: Meta / Facebook Ads Preview */}
                  {activeMediaPreviewTab === "facebook" && (
                    <div className="space-y-4">
                      {/* Live Facebook Card Mockup */}
                      <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-sm max-w-xl mx-auto">
                        <div className="p-3.5 bg-stone-50 border-b border-stone-200 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                            {selectedKit.loName.slice(0, 1)}{selectedKit.agentName.slice(0, 1)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-xs text-[#2D362E] flex items-center gap-1.5">
                              <span>{selectedKit.loName} &amp; {selectedKit.agentName}</span>
                              <span className="text-[10px] text-stone-500 font-normal">• Sponsored</span>
                            </div>
                            <div className="text-[10px] text-stone-500 truncate">
                              Oregon First-Time Homebuyer Advisory • {selectedKit.agentBrokerage}
                            </div>
                          </div>
                          <button
                            onClick={() => copyToClipboard(selectedKit.metaAd.primaryText, "meta_text")}
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                          >
                            {copiedField === "meta_text" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedField === "meta_text" ? "Copied" : "Copy Ad Copy"}</span>
                          </button>
                        </div>

                        {/* Primary Ad Copy Text */}
                        <div className="p-4 text-xs text-[#2D362E] whitespace-pre-wrap leading-relaxed font-sans bg-stone-50/50">
                          {selectedKit.metaAd.primaryText}
                        </div>

                        {/* Creative Image or Video Placeholder */}
                        <div className="relative aspect-video bg-stone-900 flex items-center justify-center overflow-hidden">
                          {selectedKit.imageUrl ? (
                            <img
                              src={selectedKit.imageUrl}
                              alt={selectedKit.propertyAddress}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-center p-6 text-stone-400">
                              <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                              <p className="text-xs">{selectedKit.propertyAddress}</p>
                            </div>
                          )}

                          {/* Co-Branded Lower Third Overlay */}
                          <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-md rounded-xl p-2.5 text-white flex items-center justify-between">
                            <div className="min-w-0">
                              <div className="text-[11px] font-bold truncate">
                                🌲 {selectedKit.propertyAddress} ({selectedKit.propertyCity})
                              </div>
                              <div className="text-[10px] text-emerald-300">
                                0% Down USDA &amp; DPA Eligible • Verified Co-Brand
                              </div>
                            </div>
                            <div className="text-xs font-bold px-2 py-1 rounded bg-white text-stone-900 shrink-0">
                              Learn More
                            </div>
                          </div>
                        </div>

                        {/* CTA Bar */}
                        <div className="p-3 bg-stone-100 flex items-center justify-between text-xs">
                          <div>
                            <div className="text-[10px] text-stone-500 uppercase tracking-wider">HOMEBUYER.OREGON.GOV</div>
                            <div className="font-bold text-[#2D362E]">{selectedKit.metaAd.headline}</div>
                          </div>
                          <a
                            href={selectedKit.coBrandUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-stone-900 text-white font-bold text-xs flex items-center gap-1"
                          >
                            <span>Tour Home</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB: Google Ads Responsive Search */}
                  {activeMediaPreviewTab === "google" && (
                    <div className="space-y-4">
                      <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                            Google Search Ad Simulation
                          </span>
                          <button
                            onClick={() => copyToClipboard(selectedKit.googleAd.headlines.join(" | "), "google_h")}
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                          >
                            {copiedField === "google_h" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                            <span>Copy Headlines</span>
                          </button>
                        </div>

                        {/* Google SERP Mockup */}
                        <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-1">
                          <div className="text-[11px] text-stone-600 flex items-center gap-1">
                            <span className="font-bold text-stone-800">Sponsored</span>
                            <span>•</span>
                            <span className="truncate">{selectedKit.coBrandUrl}</span>
                          </div>
                          <h4 className="text-base text-blue-800 font-medium hover:underline cursor-pointer">
                            {selectedKit.googleAd.headlines.join(" | ")}
                          </h4>
                          <p className="text-xs text-stone-600">
                            {selectedKit.googleAd.descriptions.join(" ")}
                          </p>

                          {/* Sitelinks */}
                          <div className="pt-2 flex flex-wrap gap-3 text-xs text-blue-700">
                            {selectedKit.googleAd.sitelinks.map((link, idx) => (
                              <span key={idx} className="hover:underline cursor-pointer font-medium">
                                • {link.title}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB: 30s Short-Form Video Script & Storyboard */}
                  {activeMediaPreviewTab === "video" && (
                    <div className="space-y-4">
                      <div className="bg-stone-900 rounded-2xl p-4 text-white space-y-4">
                        <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                          <div className="flex items-center gap-2">
                            <Film className="w-4 h-4 text-purple-400" />
                            <span className="font-bold text-xs">
                              30-Second Co-Branded Video Script (TikTok, Reels, Shorts)
                            </span>
                          </div>
                          <span className="text-xs font-mono text-purple-300">
                            Est: ~30s • 3 Scenes
                          </span>
                        </div>

                        {/* Storyboard scenes */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {selectedKit.videoScript.scenes.map((scene) => (
                            <div key={scene.sceneNumber} className="bg-stone-800/80 rounded-xl p-3 border border-stone-700 space-y-2">
                              <div className="flex items-center justify-between text-[11px] font-bold text-purple-300">
                                <span>Scene {scene.sceneNumber}</span>
                                <span>{scene.durationSec} sec</span>
                              </div>
                              <div className="text-[10px] text-stone-300">
                                <strong>Visual:</strong> {scene.visual}
                              </div>
                              <div className="text-[11px] text-white bg-black/40 p-2 rounded border border-stone-700 italic">
                                "{scene.narration}"
                              </div>
                              <div className="text-[10px] text-amber-300 font-mono">
                                Overlay: {scene.onScreenText}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Hashtags & Caption */}
                        <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-xs">
                          <span className="text-stone-400 truncate max-w-md">
                            {selectedKit.videoScript.hashtags.join(" ")}
                          </span>
                          <button
                            onClick={() => copyToClipboard(selectedKit.videoScript.captionText, "video_cap")}
                            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy Video Caption</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Footer: Launch / Push to Channels */}
                  <div className="pt-4 border-t border-[#EAE7E0] flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-[#606C5D]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Ready for Meta Ads Manager, Google Ads &amp; Social Feeds</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const text = `Facebook Ad Setup for ${selectedKit.propertyAddress}:\n\nHeadline: ${selectedKit.metaAd.headline}\nTarget URL: ${selectedKit.coBrandUrl}\n\nPrimary Text:\n${selectedKit.metaAd.primaryText}`;
                          copyToClipboard(text, "export_fb");
                          onTriggerToast("Facebook Ad Bundle copied ready for Meta Ads Manager!");
                        }}
                        className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Push to Facebook Ads</span>
                      </button>

                      <button
                        onClick={() => {
                          const text = `Google Ads Campaign Spec for ${selectedKit.propertyAddress}:\nHeadlines:\n${selectedKit.googleAd.headlines.join('\n')}\n\nDescriptions:\n${selectedKit.googleAd.descriptions.join('\n')}\nFinal URL: ${selectedKit.googleAd.finalUrl}`;
                          copyToClipboard(text, "export_goog");
                          onTriggerToast("Google Ads Spec copied ready for Google Ads Console!");
                        }}
                        className="px-3 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Push to Google Ads</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
