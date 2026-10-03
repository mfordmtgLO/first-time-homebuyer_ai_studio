import React, { useState, useMemo, useEffect } from "react";
import { 
  Users, 
  Target, 
  Link as LinkIcon, 
  Sparkles, 
  Share2, 
  Search, 
  Filter, 
  Plus, 
  Building2, 
  Award, 
  MapPin, 
  Check, 
  ExternalLink, 
  Copy, 
  Mail, 
  Phone, 
  QrCode, 
  Edit3, 
  Trash2, 
  ChevronDown, 
  Globe, 
  ShieldCheck, 
  ArrowUpDown, 
  Layers, 
  CheckCircle2, 
  Zap,
  UserCheck,
  Download,
  FileSpreadsheet
} from "lucide-react";
import { 
  ProfessionalGuidesState, 
  LoanOfficerProfile, 
  RealEstateAgentProfile, 
  LOPairing, 
  CapturedLead, 
  PropertyListing 
} from "../types";
import { 
  getUnifiedMasterAgentRoster, 
  sortPairingsAlphabeticallyByAgentName, 
  UnifiedAgentProfile 
} from "../utils/unifiedAgentRoster";
import { Top50RecruitLeaderboard } from "./Top50RecruitLeaderboard";
import { RealtorCoBrandingHub } from "./RealtorCoBrandingHub";
import { AIPartnerCampaign } from "./AIPartnerCampaign";
import { AgentRosterExportModal, ExportMode } from "./AgentRosterExportModal";

interface MasterRealtorCommandCenterProps {
  guidesState: ProfessionalGuidesState;
  onUpdateGuidesState: (newState: ProfessionalGuidesState) => void;
  currentLo: LoanOfficerProfile;
  leads?: CapturedLead[];
  properties?: PropertyListing[];
  userRole?: string;
  onTriggerToast: (msg: string) => void;
  initialSubTab?: "roster" | "recruiting" | "pairings" | "cobranding" | "campaigns";
  onOpenScrapeModal?: () => void;
  onOpenEmailOutreachModal?: () => void;
}

const SUPPORTED_STATES = [
  { code: "OR", name: "Oregon", status: "Active (Top 50 Sweeps)" },
  { code: "WA", name: "Washington", status: "Ready for Expansion" },
  { code: "CA", name: "California", status: "Ready for Expansion" },
  { code: "ID", name: "Idaho", status: "Ready for Expansion" },
  { code: "AZ", name: "Arizona", status: "Ready for Expansion" },
  { code: "TX", name: "Texas", status: "Ready for Expansion" },
  { code: "CO", name: "Colorado", status: "Ready for Expansion" },
  { code: "NV", name: "Nevada", status: "Ready for Expansion" },
  { code: "FL", name: "Florida", status: "Ready for Expansion" },
  { code: "UT", name: "Utah", status: "Ready for Expansion" },
  { code: "NC", name: "North Carolina", status: "Ready for Expansion" },
  { code: "MT", name: "Montana", status: "Ready for Expansion" }
];

export const MasterRealtorCommandCenter: React.FC<MasterRealtorCommandCenterProps> = ({
  guidesState,
  onUpdateGuidesState,
  currentLo,
  leads = [],
  properties = [],
  userRole,
  onTriggerToast,
  initialSubTab = "roster",
  onOpenScrapeModal,
  onOpenEmailOutreachModal
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"roster" | "recruiting" | "pairings" | "cobranding" | "campaigns">(initialSubTab);

  // Get Unified Master Agent Roster (100% complete agent pool) — declared first to prevent TDZ
  const masterAgentRoster = useMemo(() => {
    return getUnifiedMasterAgentRoster(guidesState);
  }, [guidesState]);

  // Multi-State Architecture Filter (Default: OR)
  const [selectedState, setSelectedState] = useState<string>("OR");

  // Roster Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [rosterFilter, setRosterFilter] = useState<"all" | "top50" | "paired" | "buyer_agent" | "listing_agent" | "dual_agent">("all");
  const [filterLoId, setFilterLoId] = useState<string>("all");

  // Pairing State
  const [selectedPairingLoId, setSelectedPairingLoId] = useState<string>("all");
  const [showAddPairingModal, setShowNewPairingModal] = useState(false);
  const [newPairLoId, setNewPairLoId] = useState<string>(currentLo.id);
  const [newPairAgentId, setNewPairAgentId] = useState<string>("");
  const [newPairTag, setNewPairTag] = useState<string>("realtor-partner");
  const [pairingError, setPairingError] = useState<string | null>(null);

  // Auto-default agent selection when modal opens
  useEffect(() => {
    if (showAddPairingModal && !newPairAgentId && masterAgentRoster.length > 0) {
      setNewPairAgentId(masterAgentRoster[0].id);
    }
  }, [showAddPairingModal, masterAgentRoster, newPairAgentId]);

  const openNewPairingModal = (agentId?: string) => {
    setNewPairLoId(currentLo.id || guidesState.loanOfficers[0]?.id || "");
    setNewPairAgentId(agentId || masterAgentRoster[0]?.id || "");
    setPairingError(null);
    setShowNewPairingModal(true);
  };

  // New Agent Modal
  const [showAddAgentModal, setShowAddAgentModal] = useState(false);
  const [newAgentName, setNewAgentName] = useState("");
  const [newAgentCompany, setNewAgentCompany] = useState("");
  const [newAgentPhone, setNewAgentPhone] = useState("");
  const [newAgentEmail, setNewAgentEmail] = useState("");
  const [newAgentLicense, setNewAgentDre] = useState("");

  // Copy Feedback
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // CSV Export Modal States
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportInitialMode, setExportInitialMode] = useState<ExportMode>("filtered");

  // Origin for co-branding links
  let origin = typeof window !== "undefined" ? window.location.origin : "https://homereadypdx.com";
  if (origin.includes("ais-dev-")) {
    origin = origin.replace("ais-dev-", "ais-pre-");
  }

  // Filtered Master Agent Roster
  const filteredAgents = useMemo(() => {
    return masterAgentRoster.filter((agent) => {
      // 1. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = agent.name.toLowerCase().includes(q);
        const matchesCompany = (agent.company || agent.brokerage || "").toLowerCase().includes(q);
        const matchesLicense = (agent.licenseNumber || "").toLowerCase().includes(q);
        const matchesCity = (agent.city || "").toLowerCase().includes(q);
        const matchesTop50 = q.includes("top 50") || q.includes("top50") ? agent.isTop50 : false;
        const matchesLoPair = agent.pairedLoNames?.some((lo) => lo.toLowerCase().includes(q));

        if (!matchesName && !matchesCompany && !matchesLicense && !matchesCity && !matchesTop50 && !matchesLoPair) {
          return false;
        }
      }

      // 2. Category Filter
      if (rosterFilter === "top50" && !agent.isTop50) return false;
      if (rosterFilter === "paired" && !agent.isPaired) return false;
      if (rosterFilter === "buyer_agent" && agent.agentType !== "buyer_agent") return false;
      if (rosterFilter === "listing_agent" && agent.agentType !== "listing_agent") return false;
      if (rosterFilter === "dual_agent" && agent.agentType !== "dual_agent") return false;

      // 3. LO Filter
      if (filterLoId !== "all") {
        if (!agent.pairedLoIds?.includes(filterLoId) && !agent.assignedLoIds?.includes(filterLoId)) {
          return false;
        }
      }

      return true;
    });
  }, [masterAgentRoster, searchQuery, rosterFilter, filterLoId]);

  // LO + Agent Pairings Filtered & Sorted ALPHABETICALLY BY AGENT'S FIRST NAME (A-Z)
  const sortedAndFilteredPairings = useMemo(() => {
    let pairingsList = guidesState.pairings || [];

    // Filter by Selected Loan Officer
    if (selectedPairingLoId !== "all") {
      pairingsList = pairingsList.filter((p) => p.loId === selectedPairingLoId);
    }

    // Sort Alphabetically by Agent's First Name A-Z
    return sortPairingsAlphabeticallyByAgentName(pairingsList, masterAgentRoster);
  }, [guidesState.pairings, selectedPairingLoId, masterAgentRoster]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    onTriggerToast("✅ Co-branded link copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleCreatePairing = (e: React.FormEvent) => {
    e.preventDefault();
    setPairingError(null);
    onTriggerToast("Validating pairing inputs…");

    const targetAgentId = newPairAgentId || masterAgentRoster[0]?.id;
    if (!targetAgentId) {
      const errMsg = "Please select a Realtor agent partner to pair.";
      setPairingError(errMsg);
      onTriggerToast(`⚠️ ${errMsg}`);
      return;
    }

    const lo = guidesState.loanOfficers.find((l) => l.id === newPairLoId) || currentLo || guidesState.loanOfficers[0];
    const agent = masterAgentRoster.find((a) => a.id === targetAgentId) || masterAgentRoster[0];

    if (!lo || !agent) {
      const errMsg = "Could not find selected Loan Officer or Realtor Agent profile.";
      setPairingError(errMsg);
      onTriggerToast(`⚠️ ${errMsg}`);
      return;
    }

    onTriggerToast("Creating pairing…");

    const newPairing: LOPairing = {
      id: `pair-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      loId: lo.id,
      agentId: agent.id,
      title: `${lo.name} + ${agent.name}`,
      customSlug: `${lo.customSlug || "lo"}-and-${agent.customSlug || "agent"}`,
      campaignTag: newPairTag || "realtor-partner",
      createdAt: new Date().toISOString().split("T")[0],
      active: true,
      totalViews: 0,
      totalLeads: 0
    };

    onTriggerToast("Saving…");

    onUpdateGuidesState((prev) => ({
      ...prev,
      pairings: [newPairing, ...(prev.pairings || [])]
    }));

    onTriggerToast(`Done! Created pairing for ${newPairing.title}`);
    setShowNewPairingModal(false);
  };

  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName.trim()) return;

    const agentId = `agent-manual-${Date.now()}`;
    const customSlug = newAgentName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const createdAgent: RealEstateAgentProfile = {
      id: agentId,
      name: newAgentName.trim(),
      title: "Buyer Specialist, REALTOR®",
      company: newAgentCompany.trim() || "Premier Real Estate Brokerage",
      licenseNumber: newAgentLicense.trim() || "OR Lic #20148891",
      email: newAgentEmail.trim() || `${customSlug}@brokerage.com`,
      phone: newAgentPhone.trim() || "(503) 555-0199",
      headshotUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256",
      rating: 4.9,
      yearsExperience: 8,
      activeListingsCount: 5,
      agentType: "buyer_agent",
      bio: "Dedicated real estate professional specializing in Oregon first-time buyers and down payment assistance programs.",
      specialties: ["First-Time Homebuyers", "USDA Zero-Down", "Flex DPA"],
      areasServed: ["Portland Metro", "Willamette Valley", "Bend"],
      customSlug: customSlug,
      assignedLoIds: [currentLo.id]
    };

    const newPairing: LOPairing = {
      id: `pair-${Date.now()}`,
      loId: currentLo.id,
      agentId: createdAgent.id,
      title: `${currentLo.name} + ${createdAgent.name}`,
      customSlug: `${currentLo.customSlug || "lo"}-and-${customSlug}`,
      campaignTag: "realtor-partnership",
      createdAt: new Date().toISOString().split("T")[0],
      active: true,
      totalViews: 0,
      totalLeads: 0
    };

    onUpdateGuidesState({
      ...guidesState,
      agentRoster: [...guidesState.agentRoster, createdAgent],
      pairings: [...guidesState.pairings, newPairing],
      activeAgentId: createdAgent.id
    });

    onTriggerToast(`✅ Added ${createdAgent.name} to Master Agent Roster and created LO pairing!`);
    setNewAgentName("");
    setNewAgentCompany("");
    setNewAgentPhone("");
    setNewAgentEmail("");
    setNewAgentDre("");
    setShowAddAgentModal(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. MASTER HEADER & ARCHITECTURE BANNER */}
      <div className="bg-[#2D362E] text-white p-6 sm:p-8 rounded-3xl border border-[#2D362E] shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold tracking-wider uppercase bg-amber-400 text-amber-950 px-3 py-1 rounded-full font-serif border border-amber-300">
                Master Realtor Architecture
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase bg-white/10 text-emerald-200 px-3 py-1 rounded-full border border-white/15 flex items-center gap-1">
                <Globe className="w-3 h-3 text-emerald-400" />
                Multi-State Ready • Default: Oregon (OR)
              </span>
            </div>

            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#E7C19D] leading-tight">
              Master Realtor Partner & Recruiting Command Center
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Consolidated master portal across statewide Oregon agent rosters, Top 50 Leaderboard sweeps, Loan Officer + Realtor pairings (A-Z sorted), co-branded marketing flyers, and automated AI outreach campaigns.
            </p>
          </div>

          {/* Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowAddAgentModal(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Agent Partner</span>
            </button>

            {onOpenScrapeModal && (
              <button
                type="button"
                onClick={onOpenScrapeModal}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-amber-950 text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-950" />
                <span>⚡ AI Scrape Realtors</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => openNewPairingModal()}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <LinkIcon className="w-4 h-4 text-amber-300" />
              <span>Create LO+Agent Pairing</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setExportInitialMode("all");
                setShowExportModal(true);
              }}
              className="px-4 py-2.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-white border border-emerald-400/40 text-xs font-bold rounded-xl shadow-sm flex items-center gap-2 transition-all cursor-pointer"
              title="Export complete or filtered Agent Roster to CSV for CRM or marketing tools"
            >
              <Download className="w-4 h-4 text-emerald-300" />
              <span>Export to CSV</span>
            </button>
          </div>
        </div>

        {/* Multi-State Expansion Selector */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-200">State Focus Region:</span>
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                onTriggerToast(`Switched active state focus to ${e.target.value}.`);
              }}
              className="bg-white/10 border border-white/20 rounded-lg px-2.5 py-1 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
            >
              {SUPPORTED_STATES.map((st) => (
                <option key={st.code} value={st.code} className="bg-[#2D362E] text-white">
                  {st.name} ({st.code}) — {st.status}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-emerald-300 font-semibold">
            <span>👥 {masterAgentRoster.length} Total Master Agents</span>
            <span>🏆 {masterAgentRoster.filter(a => a.isTop50).length} Top 50 Recruits</span>
            <span>🔗 {guidesState.pairings?.length || 0} LO+Agent Pairs</span>
          </div>
        </div>
      </div>

      {/* 2. SUB-VIEW NAVIGATION PILLS */}
      <div className="bg-white p-2 rounded-2xl border border-[#EAE7E0] shadow-sm flex items-center gap-2 overflow-x-auto dashboard-horizontal-scrollbar">
        <button
          type="button"
          onClick={() => setActiveSubTab("roster")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
            activeSubTab === "roster"
              ? "bg-[#2D362E] text-white shadow-sm"
              : "text-[#606C5D] hover:bg-[#F4F1EA] hover:text-[#2D362E]"
          }`}
        >
          <Users className="w-4 h-4 text-emerald-400" />
          <span>Master Partner Roster ({masterAgentRoster.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("recruiting")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
            activeSubTab === "recruiting"
              ? "bg-[#2D362E] text-white shadow-sm"
              : "text-[#606C5D] hover:bg-[#F4F1EA] hover:text-[#2D362E]"
          }`}
        >
          <Target className="w-4 h-4 text-amber-400" />
          <span>Top 50 Recruit Leaderboard (Rank 1-50)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("pairings")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
            activeSubTab === "pairings"
              ? "bg-[#2D362E] text-white shadow-sm"
              : "text-[#606C5D] hover:bg-[#F4F1EA] hover:text-[#2D362E]"
          }`}
        >
          <LinkIcon className="w-4 h-4 text-blue-400" />
          <span>LO + Agent Pairings ({guidesState.pairings?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("cobranding")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
            activeSubTab === "cobranding"
              ? "bg-[#2D362E] text-white shadow-sm"
              : "text-[#606C5D] hover:bg-[#F4F1EA] hover:text-[#2D362E]"
          }`}
        >
          <Share2 className="w-4 h-4 text-purple-400" />
          <span>Co-Branding & Marketing Hub</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("campaigns")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
            activeSubTab === "campaigns"
              ? "bg-[#2D362E] text-white shadow-sm"
              : "text-[#606C5D] hover:bg-[#F4F1EA] hover:text-[#2D362E]"
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>AI Partner Campaign Engine</span>
        </button>
      </div>

      {/* SUB-VIEW 1: MASTER PARTNER ROSTER */}
      {activeSubTab === "roster" && (
        <div className="space-y-6">
          {/* Search, Filter & LO Dropdown Controls */}
          <div className="bg-white p-5 rounded-3xl border border-[#EAE7E0] shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Search Field */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9488]" />
                <input
                  type="text"
                  placeholder="Search Master Directory by Agent Name, Brokerage, License #, City, or 'Top 50'..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium text-[#2D362E] focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Filter By Loan Officer Dropdown */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-[#7D8877] uppercase">Loan Officer:</span>
                <select
                  value={filterLoId}
                  onChange={(e) => setFilterLoId(e.target.value)}
                  className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs font-bold text-[#2D362E] focus:outline-none focus:border-emerald-600"
                >
                  <option value="all">All Loan Officers ({guidesState.loanOfficers.length})</option>
                  {guidesState.loanOfficers.map((lo) => (
                    <option key={lo.id} value={lo.id}>
                      {lo.name} ({guidesState.pairings.filter((p) => p.loId === lo.id).length} Pairs)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category Filter Chips & CSV Export Action */}
            <div className="flex items-center justify-between gap-3 flex-wrap pt-2 border-t border-[#EAE7E0]">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setRosterFilter("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    rosterFilter === "all"
                      ? "bg-[#2D362E] text-white"
                      : "bg-[#FAF9F5] text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F4F1EA]"
                  }`}
                >
                  All Agents ({masterAgentRoster.length})
                </button>

                <button
                  type="button"
                  onClick={() => setRosterFilter("top50")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    rosterFilter === "top50"
                      ? "bg-amber-500 text-amber-950 font-extrabold"
                      : "bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100"
                  }`}
                >
                  <span>🏆 Top 50 Recruits</span>
                  <span>({masterAgentRoster.filter((a) => a.isTop50).length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRosterFilter("paired")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    rosterFilter === "paired"
                      ? "bg-blue-600 text-white"
                      : "bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100"
                  }`}
                >
                  <span>🔗 Paired Partners</span>
                  <span>({masterAgentRoster.filter((a) => a.isPaired).length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRosterFilter("buyer_agent")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    rosterFilter === "buyer_agent"
                      ? "bg-emerald-700 text-white"
                      : "bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100"
                  }`}
                >
                  Buyer Specialists ({masterAgentRoster.filter((a) => a.agentType === "buyer_agent").length})
                </button>

                <button
                  type="button"
                  onClick={() => setRosterFilter("listing_agent")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    rosterFilter === "listing_agent"
                      ? "bg-purple-700 text-white"
                      : "bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100"
                  }`}
                >
                  Listing Agents ({masterAgentRoster.filter((a) => a.agentType === "listing_agent").length})
                </button>
              </div>

              {/* Export to CSV Button in Roster Toolbar */}
              <button
                type="button"
                onClick={() => {
                  setExportInitialMode(rosterFilter === "top50" ? "top50" : "filtered");
                  setShowExportModal(true);
                }}
                className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer shrink-0"
                title="Download filtered agent roster to CSV for CRM or marketing tools"
              >
                <Download className="w-3.5 h-3.5 text-emerald-700" />
                <span>Export to CSV ({filteredAgents.length})</span>
              </button>
            </div>
          </div>

          {/* Master Agent Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => {
              const agentPairings = guidesState.pairings.filter((p) => p.agentId === agent.id);
              const pairedLoNames = agentPairings.map((p) => {
                const lo = guidesState.loanOfficers.find((l) => l.id === p.loId);
                return lo?.name || "Loan Officer";
              });

              const coBrandSlug = `${currentLo.customSlug || "lo"}-and-${agent.customSlug || "agent"}`;
              const coBrandUrl = `${origin}/first-time_homebuyer_portal/${coBrandSlug}`;

              return (
                <div
                  key={agent.id}
                  className="bg-white rounded-3xl border border-[#EAE7E0] p-6 space-y-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header with Badges */}
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-[#F4F1EA] overflow-hidden shrink-0 border border-[#EAE7E0] shadow-2xs">
                        <img
                          src={agent.headshotUrl || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256"}
                          alt={agent.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-serif font-bold text-base text-[#2D362E] truncate">
                            {agent.name}
                          </h4>
                          <span className="text-[9px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded border border-amber-200">
                            {agent.licenseStates?.[0] || "OR"} Licensed
                          </span>
                        </div>

                        <p className="text-xs text-[#606C5D] font-medium truncate">{agent.title}</p>
                        <p className="text-xs text-[#9E6D43] font-semibold truncate flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 shrink-0" />
                          <span>{agent.company || agent.brokerage}</span>
                        </p>
                      </div>
                    </div>

                    {/* Status Badges Bar */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {agent.isTop50 && (
                        <span className="text-[10px] font-extrabold bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1 shadow-2xs">
                          🏆 Top 50 State Recruit {agent.top50Rank ? `(#${agent.top50Rank})` : ""}
                        </span>
                      )}

                      {pairedLoNames.length > 0 ? (
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
                          🔗 Paired: {pairedLoNames.join(", ")}
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium bg-[#FAF9F5] text-[#7D8877] px-2 py-0.5 rounded-full border border-[#EAE7E0]">
                          Unpaired
                        </span>
                      )}
                    </div>

                    {/* Contact & License Info */}
                    <div className="bg-[#FAF9F5] p-3 rounded-2xl border border-[#EAE7E0] space-y-1.5 text-xs text-[#606C5D]">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#7D8877] uppercase">License #:</span>
                        <span className="font-bold text-[#2D362E]">{agent.licenseNumber || "OR Broker"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#7D8877] uppercase">Email:</span>
                        <span className="truncate max-w-[180px] font-medium text-[#2D362E]">{agent.email}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#7D8877] uppercase">Phone:</span>
                        <span className="font-medium text-[#2D362E]">{agent.phone || "(503) 555-0199"}</span>
                      </div>
                    </div>

                    {/* Production Performance Metrics */}
                    <div className="grid grid-cols-3 gap-2 bg-[#F4F1EA]/60 p-2.5 rounded-2xl text-center border border-[#EAE7E0]">
                      <div>
                        <div className="text-[9px] font-bold text-[#7D8877] uppercase">Experience</div>
                        <div className="text-xs font-bold text-[#2D362E]">{agent.yearsExperience || 8} Yrs</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-[#7D8877] uppercase">12mo Units</div>
                        <div className="text-xs font-bold text-emerald-700">{agent.production12MoUnits || 38}</div>
                      </div>
                      <div>
                        <div className="text-[9px] font-bold text-[#7D8877] uppercase">12mo Vol</div>
                        <div className="text-xs font-bold text-emerald-700">
                          ${((agent.production12MoVolume || 21500000) / 1000000).toFixed(1)}M
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="pt-3 border-t border-[#EAE7E0] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(coBrandUrl, agent.id)}
                      className="px-3 py-1.5 bg-[#FAF9F5] hover:bg-[#F4F1EA] text-[#2D362E] border border-[#EAE7E0] rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                      title="Copy Co-Branded Portal Link"
                    >
                      {copiedKey === agent.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Co-Brand URL</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openNewPairingModal(agent.id)}
                      className="px-3 py-1.5 bg-[#4A5D4E] hover:bg-[#38463B] text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <LinkIcon className="w-3.5 h-3.5 text-amber-200" />
                      <span>Pair LO</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveSubTab("campaigns");
                        onTriggerToast(`Selected ${agent.name} for AI Outreach Campaign.`);
                      }}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-amber-950 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Campaign</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredAgents.length === 0 && (
            <div className="bg-white p-12 rounded-3xl border border-[#EAE7E0] text-center space-y-3">
              <p className="text-base font-bold text-[#2D362E]">No agents match your current filter or search criteria.</p>
              <p className="text-xs text-[#606C5D]">
                Try adjusting your search terms or click "⚡ AI Scrape Realtors" to import new Oregon agents.
              </p>
            </div>
          )}
        </div>
      )}

      {/* SUB-VIEW 2: TOP 50 RECRUIT LEADERBOARD */}
      {activeSubTab === "recruiting" && (
        <Top50RecruitLeaderboard
          guidesState={guidesState}
          onUpdateGuidesState={onUpdateGuidesState}
          onTriggerToast={onTriggerToast}
          onOpenOutreachModal={(candidate) => {
            onTriggerToast(`Opening outreach modal for ${candidate.name}...`);
          }}
          userRole={userRole}
        />
      )}

      {/* SUB-VIEW 3: LO + AGENT PAIRINGS & CUSTOM LINKS */}
      {activeSubTab === "pairings" && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#EAE7E0] shadow-sm">
            <div>
              <h3 className="font-serif font-bold text-2xl text-[#2D362E]">
                Loan Officer + Real Estate Agent Pairings & Custom Links
              </h3>
              <p className="text-xs text-[#606C5D] mt-1 max-w-2xl">
                Filter by Loan Officer to view all active partnerships. Pairings are automatically sorted **alphabetically by the Agent's First Name (A-Z)**.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Loan Officer Filter Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#7D8877] uppercase">Loan Officer:</span>
                <select
                  value={selectedPairingLoId}
                  onChange={(e) => setSelectedPairingLoId(e.target.value)}
                  className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs font-bold text-[#2D362E] focus:outline-none focus:border-emerald-600"
                >
                  <option value="all">All Loan Officers ({guidesState.loanOfficers.length})</option>
                  {guidesState.loanOfficers.map((lo) => (
                    <option key={lo.id} value={lo.id}>
                      {lo.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  setExportInitialMode("pairings");
                  setShowExportModal(true);
                }}
                className="px-4 py-2.5 bg-white hover:bg-[#FAF9F5] text-[#2D362E] border border-[#EAE7E0] text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                title="Export LO + Agent pairings list to CSV"
              >
                <Download className="w-4 h-4 text-blue-600" />
                <span>Export to CSV ({sortedAndFilteredPairings.length})</span>
              </button>

              <button
                type="button"
                onClick={() => openNewPairingModal()}
                className="px-5 py-2.5 bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <LinkIcon className="w-4 h-4 text-amber-200" />
                <span>+ Create New LO + Realtor Pairing</span>
              </button>
            </div>
          </div>

          {/* Sorted Pairings Grid (A-Z by Agent First Name) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedAndFilteredPairings.map((pairing) => {
              const lo = guidesState.loanOfficers.find((l) => l.id === pairing.loId) || currentLo;
              const agent = masterAgentRoster.find((a) => a.id === pairing.agentId) || masterAgentRoster[0];

              const pairingShortUrl = `${origin}/${pairing.customSlug || pairing.id}`;

              return (
                <div
                  key={pairing.id}
                  className="bg-white rounded-3xl border border-[#EAE7E0] p-6 space-y-4 shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between border-b border-[#EAE7E0] pb-3">
                      <div>
                        <h4 className="font-serif font-bold text-base text-[#2D362E]">
                          {pairing.title}
                        </h4>
                        <p className="text-xs text-[#606C5D] mt-0.5">
                          LO: <strong>{lo.name}</strong> • Agent: <strong>{agent?.name || "Partner Agent"}</strong>
                        </p>
                      </div>

                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                        {pairing.campaignTag || "active-pair"}
                      </span>
                    </div>

                    {/* URL Link Box */}
                    <div className="bg-[#FAF9F5] p-3 rounded-2xl border border-[#EAE7E0] space-y-2">
                      <div className="text-[10px] font-bold text-[#7D8877] uppercase">Co-Branded Client Portal URL</div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={pairingShortUrl}
                          className="flex-1 bg-white border border-[#EAE7E0] rounded-xl px-3 py-1.5 text-xs text-[#2D362E] select-all font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => copyToClipboard(pairingShortUrl, pairing.id)}
                          className="px-3 py-1.5 bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                        >
                          {copiedKey === pairing.id ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>Copy</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#606C5D] pt-1">
                      <span>Total Views: <strong>{pairing.totalViews || 0}</strong></span>
                      <span>Total Leads: <strong>{pairing.totalLeads || 0}</strong></span>
                      <a
                        href={pairingShortUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Preview
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: CO-BRANDING & MARKETING HUB */}
      {activeSubTab === "cobranding" && (
        <RealtorCoBrandingHub
          guidesState={guidesState}
          onUpdateGuidesState={onUpdateGuidesState}
          currentLo={currentLo}
          leads={leads}
          properties={properties}
          onTriggerToast={onTriggerToast}
        />
      )}

      {/* SUB-VIEW 5: AI PARTNER CAMPAIGN ENGINE */}
      {activeSubTab === "campaigns" && (
        <AIPartnerCampaign
          loanOfficer={currentLo}
          agentRoster={masterAgentRoster}
          properties={properties}
          pairingUrl={`${origin}/first-time_homebuyer_portal/${currentLo.customSlug || "lo"}`}
          onOpenEmailOutreachModal={onOpenEmailOutreachModal || (() => {})}
          triggerToast={onTriggerToast}
        />
      )}

      {/* MODAL: CREATE NEW LO + REALTOR PAIRING */}
      {showAddPairingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-[#EAE7E0] shadow-2xl animate-in zoom-in-95 text-[#2D362E]">
            <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-3">
              <h4 className="font-serif font-bold text-lg text-[#2D362E] flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-emerald-600" />
                Create New LO + Realtor Pairing
              </h4>
              <button
                type="button"
                onClick={() => setShowNewPairingModal(false)}
                className="text-xs text-[#9A9488] hover:text-[#2D362E] p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePairing} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#7D8877] uppercase mb-1">
                  1. Select Loan Officer
                </label>
                <select
                  value={newPairLoId}
                  onChange={(e) => setNewPairLoId(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs font-bold text-[#2D362E]"
                >
                  {guidesState.loanOfficers.map((lo) => (
                    <option key={lo.id} value={lo.id}>
                      {lo.name} ({lo.branchName || "Oregon Branch"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#7D8877] uppercase mb-1">
                  2. Select Realtor Agent Partner (Unified Master Roster - A-Z)
                </label>
                <select
                  value={newPairAgentId}
                  onChange={(e) => {
                    setNewPairAgentId(e.target.value);
                    if (pairingError) setPairingError(null);
                  }}
                  className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs font-bold text-[#2D362E]"
                >
                  {masterAgentRoster.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} — {agent.company || agent.brokerage} {agent.isTop50 ? "🏆 (Top 50)" : ""}
                    </option>
                  ))}
                </select>
                {pairingError && (
                  <p className="mt-1.5 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-1.5 animate-in fade-in flex items-center gap-1.5">
                    <span>⚠️</span>
                    <span>{pairingError}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#7D8877] uppercase mb-1">
                  3. Campaign / Partnership Tag
                </label>
                <input
                  type="text"
                  placeholder="e.g. realtor-partnership, top-producer, USDA-DPA"
                  value={newPairTag}
                  onChange={(e) => setNewPairTag(e.target.value)}
                  className="w-full bg-white border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs text-[#2D362E]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#EAE7E0]">
                <button
                  type="button"
                  onClick={() => setShowNewPairingModal(false)}
                  className="px-4 py-2 bg-[#FAF9F5] hover:bg-[#F4F1EA] text-[#606C5D] text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Create Pairing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW AGENT PARTNER */}
      {showAddAgentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#EAE7E0] shadow-2xl animate-in zoom-in-95 text-[#2D362E]">
            <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-3">
              <h4 className="font-serif font-bold text-lg text-[#2D362E] flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                Add New Realtor Partner
              </h4>
              <button
                type="button"
                onClick={() => setShowAddAgentModal(false)}
                className="text-xs text-[#9A9488] hover:text-[#2D362E] p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAgent} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#7D8877] uppercase mb-1">Agent Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jessica Miller"
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs text-[#2D362E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#7D8877] uppercase mb-1">Brokerage / Company</label>
                <input
                  type="text"
                  placeholder="e.g. Keller Williams Realty"
                  value={newAgentCompany}
                  onChange={(e) => setNewAgentCompany(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs text-[#2D362E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#7D8877] uppercase mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="(503) 555-0188"
                  value={newAgentPhone}
                  onChange={(e) => setNewAgentPhone(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs text-[#2D362E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#7D8877] uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="agent@brokerage.com"
                  value={newAgentEmail}
                  onChange={(e) => setNewAgentEmail(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs text-[#2D362E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#7D8877] uppercase mb-1">DRE / License #</label>
                <input
                  type="text"
                  placeholder="OR Lic #20148891"
                  value={newAgentLicense}
                  onChange={(e) => setNewAgentDre(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs text-[#2D362E]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#EAE7E0]">
                <button
                  type="button"
                  onClick={() => setShowAddAgentModal(false)}
                  className="px-4 py-2 bg-[#FAF9F5] hover:bg-[#F4F1EA] text-[#606C5D] text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Save Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Agent Roster & Partnerships CSV Export Modal */}
      <AgentRosterExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        masterAgentRoster={masterAgentRoster}
        currentFilteredAgents={filteredAgents}
        pairings={guidesState.pairings || []}
        loanOfficers={guidesState.loanOfficers || []}
        currentLo={currentLo}
        onTriggerToast={onTriggerToast}
        initialExportMode={exportInitialMode}
      />
    </div>
  );
};
