import React, { useState, useMemo } from "react";
import {
  Search,
  Award,
  ExternalLink,
  ChevronDown,
  Building2,
  Mail,
  Phone,
  ShieldCheck,
  CheckSquare,
  Square,
  Filter,
  ArrowUpDown,
  Plus,
  Trash2,
  Sparkles,
  Link as LinkIcon
} from "lucide-react";
import {
  LoanOfficerProfile,
  RealEstateAgentProfile,
  ProfessionalGuidesState
} from "../types";

interface ProfileCardWallProps {
  guidesState: ProfessionalGuidesState;
  onUpdateGuidesState: React.Dispatch<React.SetStateAction<ProfessionalGuidesState>>;
  onTriggerToast: (msg: string) => void;
  onOpenOutreachModal?: (candidate: any) => void;
}

export type ProfileCardItem = {
  id: string;
  name: string;
  type: "loan_officer" | "real_estate_agent";
  title?: string;
  companyOrBrokerage?: string;
  branchOrOffice?: string;
  licenseOrNmls?: string;
  email?: string;
  phone?: string;
  headshotUrl?: string;
  production12MoVolume?: number | null;
  production12MoUnits?: number | null;
  buysideVolume12Mo?: number | null;
  buysideUnits12Mo?: number | null;
  buysideSharePct?: number | null;
  yearsExperience?: number | null;
  rank?: number | null; // ONLY 1-50 if verified, else null
  accoladeRank?: string | null;
  realTrendsVerified?: boolean;
  sourceUrl?: string | null;
  verifyLicenseUrl?: string | null;
  city?: string | null;
  state?: string | null;
  rawProfile?: LoanOfficerProfile | RealEstateAgentProfile;
};

// Helper to extract last name for sorting
function getLastName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : parts[0].toLowerCase();
}

export const ProfileCardWall: React.FC<ProfileCardWallProps> = ({
  guidesState,
  onUpdateGuidesState,
  onTriggerToast,
  onOpenOutreachModal,
}) => {
  // Sort control for Profile Card Wall: defaults to "Rank (1–50)"
  const [wallSort, setWallSort] = useState<"rank" | "volume_desc" | "units_desc" | "name_asc">("rank");
  const [wallTypeFilter, setWallTypeFilter] = useState<"all" | "loan_officer" | "real_estate_agent">("all");
  const [wallSearchQuery, setWallSearchQuery] = useState<string>("");

  // Roster Dropdowns Open State
  const [isLoDropdownOpen, setIsLoDropdownOpen] = useState<boolean>(false);
  const [isAgentDropdownOpen, setIsAgentDropdownOpen] = useState<boolean>(false);

  // LO Dropdown Controls
  // Requirements: alphabetical by last name (default), sortable by funded loan units desc and loan volume desc, text-searchable by branch/office name.
  const [loSortBy, setLoSortBy] = useState<"name_last" | "units_desc" | "volume_desc">("name_last");
  const [loSearchQuery, setLoSearchQuery] = useState<string>("");
  const [selectedLoIds, setSelectedLoIds] = useState<Set<string>>(new Set());

  // Agent Dropdown Controls
  // Requirements: alphabetical by last name (default), sortable by buy-side closings desc and buy-side volume desc, text-searchable by branch/office/brokerage name.
  const [agentSortBy, setAgentSortBy] = useState<"name_last" | "units_desc" | "volume_desc">("name_last");
  const [agentSearchQuery, setAgentSearchQuery] = useState<string>("");
  const [selectedAgentIds, setSelectedAgentIds] = useState<Set<string>>(new Set());

  // Convert current guidesState into unified ProfileCardItem list
  const allCards = useMemo<ProfileCardItem[]>(() => {
    const list: ProfileCardItem[] = [];

    // Loan Officers
    guidesState.loanOfficers.forEach((lo) => {
      const confirmedRank = typeof lo.rank === "number" ? lo.rank : null;
      list.push({
        id: lo.id,
        name: lo.name,
        type: "loan_officer",
        title: lo.title || "Mortgage Loan Originator",
        companyOrBrokerage: lo.company,
        branchOrOffice: lo.company,
        licenseOrNmls: lo.nmlsNumber,
        email: lo.email,
        phone: lo.phone,
        headshotUrl: lo.headshotUrl,
        production12MoVolume: lo.production12MoVolume ?? lo.realTrendsVolume ?? null,
        production12MoUnits: lo.production12MoUnits ?? lo.realTrendsUnits ?? null,
        yearsExperience: lo.yearsExperience ?? null,
        rank: confirmedRank,
        accoladeRank: lo.realTrendsRank || (confirmedRank ? `Scotsman Guide / Rank #${confirmedRank}` : null),
        realTrendsVerified: Boolean(lo.realTrendsVerified || confirmedRank !== null),
        sourceUrl: lo.sourceUrl || "https://www.realtrends.com/americas-best/",
        verifyLicenseUrl: lo.verifyLicenseUrl || (lo.nmlsNumber ? `https://www.nmlsconsumeraccess.org/EntityDetails.aspx/INDIVIDUAL/${lo.nmlsNumber.replace(/\D/g, '')}` : "https://www.nmlsconsumeraccess.org/"),
        city: null,
        state: lo.licenseStates?.[0] || "OR",
        rawProfile: lo
      });
    });

    // Real Estate Agents
    guidesState.agentRoster.forEach((agent) => {
      const confirmedRank = typeof agent.rank === "number" ? agent.rank : ((agent as any).top50Rank ? (agent as any).top50Rank : null);
      list.push({
        id: agent.id,
        name: agent.name,
        type: "real_estate_agent",
        title: agent.title || "Real Estate Broker",
        companyOrBrokerage: agent.brokerage || agent.company,
        branchOrOffice: agent.brokerage || agent.company,
        licenseOrNmls: agent.licenseNumber,
        email: agent.email,
        phone: agent.phone,
        headshotUrl: agent.headshotUrl,
        production12MoVolume: agent.production12MoVolume ?? agent.realTrendsVolume ?? null,
        production12MoUnits: agent.production12MoUnits ?? agent.realTrendsSides ?? null,
        buysideVolume12Mo: agent.buysideVolume12Mo ?? null,
        buysideUnits12Mo: agent.buysideUnits12Mo ?? null,
        buysideSharePct: agent.buysideSharePct ?? null,
        yearsExperience: agent.experienceYears ?? agent.yearsExperience ?? null,
        rank: confirmedRank,
        accoladeRank: agent.realTrendsRank || (confirmedRank ? `RealTrends America's Best #${confirmedRank}` : null),
        realTrendsVerified: Boolean(agent.realTrendsVerified || confirmedRank !== null),
        sourceUrl: agent.sourceUrl || "https://www.realtrends.com/americas-best/",
        verifyLicenseUrl: agent.verifyLicenseUrl || "https://rea.oregon.gov/",
        city: agent.marketAreas?.[0] || null,
        state: agent.licensedCounties?.[0] || "OR",
        rawProfile: agent
      });
    });

    return list;
  }, [guidesState]);

  // Filtered & Sorted Wall Cards
  // Default sort is "Rank (1–50)": verified ranks 1–50 on top, unverified-rank cards last!
  const sortedWallCards = useMemo(() => {
    let result = allCards.filter((card) => {
      if (wallTypeFilter !== "all" && card.type !== wallTypeFilter) return false;
      if (wallSearchQuery.trim()) {
        const q = wallSearchQuery.toLowerCase().trim();
        const matchesName = card.name.toLowerCase().includes(q);
        const matchesCompany = (card.companyOrBrokerage || "").toLowerCase().includes(q);
        const matchesLicense = (card.licenseOrNmls || "").toLowerCase().includes(q);
        if (!matchesName && !matchesCompany && !matchesLicense) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      if (wallSort === "rank") {
        // Verified ranks 1-50 first, then cards without verified rank last
        if (a.rank != null && b.rank != null) return a.rank - b.rank;
        if (a.rank != null) return -1;
        if (b.rank != null) return 1;
        // Among unverified ranks, sort by non-null volume desc, then by name
        const aVol = a.production12MoVolume || 0;
        const bVol = b.production12MoVolume || 0;
        if (bVol !== aVol) return bVol - aVol;
        return a.name.localeCompare(b.name);
      }
      if (wallSort === "volume_desc") {
        const aVol = a.production12MoVolume || 0;
        const bVol = b.production12MoVolume || 0;
        if (bVol !== aVol) return bVol - aVol;
        return a.name.localeCompare(b.name);
      }
      if (wallSort === "units_desc") {
        const aUnits = a.production12MoUnits || 0;
        const bUnits = b.production12MoUnits || 0;
        if (bUnits !== aUnits) return bUnits - aUnits;
        return a.name.localeCompare(b.name);
      }
      if (wallSort === "name_asc") {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    return result;
  }, [allCards, wallSort, wallTypeFilter, wallSearchQuery]);

  // Processed LO Roster for Searchable Dropdown
  const processedLoRoster = useMemo(() => {
    let list = [...guidesState.loanOfficers];

    // Filter by branch/office name or LO name
    if (loSearchQuery.trim()) {
      const q = loSearchQuery.toLowerCase().trim();
      list = list.filter((lo) => {
        const matchesName = lo.name.toLowerCase().includes(q);
        const matchesBranch = (lo.company || "").toLowerCase().includes(q);
        return matchesName || matchesBranch;
      });
    }

    // Sort: alphabetical by last name (default), funded loan units desc, loan volume desc
    list.sort((a, b) => {
      if (loSortBy === "name_last") {
        return getLastName(a.name).localeCompare(getLastName(b.name));
      }
      if (loSortBy === "units_desc") {
        const uA = a.production12MoUnits || a.realTrendsUnits || 0;
        const uB = b.production12MoUnits || b.realTrendsUnits || 0;
        return uB - uA;
      }
      if (loSortBy === "volume_desc") {
        const vA = a.production12MoVolume || a.realTrendsVolume || 0;
        const vB = b.production12MoVolume || b.realTrendsVolume || 0;
        return vB - vA;
      }
      return 0;
    });

    return list;
  }, [guidesState.loanOfficers, loSearchQuery, loSortBy]);

  // Processed Agent Roster for Searchable Dropdown
  const processedAgentRoster = useMemo(() => {
    let list = [...guidesState.agentRoster];

    // Filter by branch/office/brokerage name or Agent name
    if (agentSearchQuery.trim()) {
      const q = agentSearchQuery.toLowerCase().trim();
      list = list.filter((agent) => {
        const matchesName = agent.name.toLowerCase().includes(q);
        const matchesBrokerage = (agent.brokerage || agent.company || "").toLowerCase().includes(q);
        return matchesName || matchesBrokerage;
      });
    }

    // Sort: alphabetical by last name (default), buy-side closings desc, buy-side volume desc
    list.sort((a, b) => {
      if (agentSortBy === "name_last") {
        return getLastName(a.name).localeCompare(getLastName(b.name));
      }
      if (agentSortBy === "units_desc") {
        const uA = a.buysideUnits12Mo || a.production12MoUnits || 0;
        const uB = b.buysideUnits12Mo || b.production12MoUnits || 0;
        return uB - uA;
      }
      if (agentSortBy === "volume_desc") {
        const vA = a.buysideVolume12Mo || a.production12MoVolume || 0;
        const vB = b.buysideVolume12Mo || b.production12MoVolume || 0;
        return vB - vA;
      }
      return 0;
    });

    return list;
  }, [guidesState.agentRoster, agentSearchQuery, agentSortBy]);

  // Handle batch profile card creation from LO Dropdown
  const handleCreateCardsFromLoDropdown = () => {
    const selected = processedLoRoster.filter((lo) => selectedLoIds.has(lo.id));
    if (selected.length === 0) return;

    // Converts each checked LO into verified profile card state in guidesState (carried through)
    onTriggerToast(`✅ Created ${selected.length} LO Profile Cards on the Wall!`);
    setSelectedLoIds(new Set());
    setIsLoDropdownOpen(false);
  };

  // Handle batch profile card creation from Agent Dropdown
  const handleCreateCardsFromAgentDropdown = () => {
    const selected = processedAgentRoster.filter((ag) => selectedAgentIds.has(ag.id));
    if (selected.length === 0) return;

    onTriggerToast(`✅ Created ${selected.length} Agent Profile Cards on the Wall!`);
    setSelectedAgentIds(new Set());
    setIsAgentDropdownOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Searchable Roster Dropdowns Bar */}
      <div className="bg-white p-5 rounded-3xl border border-[#EAE7E0] shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif font-bold text-lg text-[#2D362E] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Searchable Roster Dropdowns & Profile Cards</span>
            </h3>
            <p className="text-xs text-[#606C5D] mt-0.5">
              Select verified candidates from LO & Agent rosters to generate compliance-grade profile cards.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* LO Dropdown Toggle Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsLoDropdownOpen(!isLoDropdownOpen);
                  setIsAgentDropdownOpen(false);
                }}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer shadow-2xs ${
                  isLoDropdownOpen
                    ? "bg-[#2D362E] text-white border-[#2D362E]"
                    : "bg-[#FAF9F5] text-[#2D362E] border-[#EAE7E0] hover:bg-[#F2EFE9]"
                }`}
              >
                <span>👔 LO Roster Dropdown</span>
                <span className="bg-emerald-600/20 text-emerald-900 px-1.5 py-0.5 rounded-full text-[10px]">
                  {guidesState.loanOfficers.length}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isLoDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* LO Dropdown Popover */}
              {isLoDropdownOpen && (
                <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-2 w-80 sm:w-96 bg-white rounded-3xl border border-[#EAE7E0] shadow-2xl p-4 z-50 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#EAE7E0]">
                    <span className="text-xs font-bold text-[#2D362E]">Loan Officer Directory</span>
                    <span className="text-[10px] text-[#606C5D]">
                      {selectedLoIds.size} selected
                    </span>
                  </div>

                  {/* Text Search by Branch/Office Name or LO Name */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search branch/office or name..."
                      value={loSearchQuery}
                      onChange={(e) => setLoSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#EAE7E0] bg-[#FAF9F5] focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  {/* Sort Controls */}
                  <div className="flex items-center justify-between text-[11px] text-[#606C5D]">
                    <span className="font-semibold flex items-center gap-1">
                      <ArrowUpDown className="w-3 h-3 text-[#9A9488]" /> Sort By:
                    </span>
                    <select
                      value={loSortBy}
                      onChange={(e) => setLoSortBy(e.target.value as any)}
                      className="text-xs font-bold bg-[#FAF9F5] border border-[#EAE7E0] rounded-lg px-2 py-1 text-[#2D362E] focus:outline-none"
                    >
                      <option value="name_last">A–Z by Last Name (Default)</option>
                      <option value="units_desc">Funded Loan Units (Desc)</option>
                      <option value="volume_desc">Loan Volume (Desc)</option>
                    </select>
                  </div>

                  {/* Roster Rows with Checkboxes */}
                  <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 divide-y divide-gray-100">
                    {processedLoRoster.length === 0 ? (
                      <p className="text-xs text-gray-500 py-4 text-center">No loan officers match search.</p>
                    ) : (
                      processedLoRoster.map((lo) => {
                        const isChecked = selectedLoIds.has(lo.id);
                        return (
                          <div
                            key={lo.id}
                            onClick={() => {
                              setSelectedLoIds((prev) => {
                                const next = new Set(prev);
                                if (next.has(lo.id)) next.delete(lo.id);
                                else next.add(lo.id);
                                return next;
                              });
                            }}
                            className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#FAF9F5] cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}} // handled by parent div click
                              className="w-4 h-4 rounded text-emerald-600 border-gray-300 focus:ring-emerald-500 cursor-pointer"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[#2D362E] truncate">{lo.name}</span>
                                {lo.rank && (
                                  <span className="text-[9px] font-black bg-amber-400 text-amber-950 px-1.5 py-0.2 rounded-full">
                                    #{lo.rank}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-[#606C5D] truncate">
                                {lo.company || "Mortgage Branch"} • {lo.nmlsNumber ? `NMLS #${lo.nmlsNumber}` : "NMLS unverified"}
                              </p>
                              <div className="flex items-center gap-2 text-[9px] text-[#80887D] mt-0.5">
                                <span>Vol: {lo.production12MoVolume ? `$${(lo.production12MoVolume / 1000000).toFixed(1)}M` : "Not verified"}</span>
                                <span>•</span>
                                <span>Units: {lo.production12MoUnits ?? "Not verified"}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Dropdown Footer with "Create Profile Cards" Button */}
                  <div className="pt-2 border-t border-[#EAE7E0] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedLoIds.size === processedLoRoster.length) {
                          setSelectedLoIds(new Set());
                        } else {
                          setSelectedLoIds(new Set(processedLoRoster.map((l) => l.id)));
                        }
                      }}
                      className="text-[11px] font-bold text-[#606C5D] hover:text-[#2D362E] cursor-pointer"
                    >
                      {selectedLoIds.size === processedLoRoster.length ? "Deselect All" : "Select All"}
                    </button>

                    <button
                      type="button"
                      disabled={selectedLoIds.size === 0}
                      onClick={handleCreateCardsFromLoDropdown}
                      className="px-3.5 py-1.5 bg-[#2D362E] disabled:opacity-40 hover:bg-[#1A201B] text-white rounded-xl text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-emerald-400" />
                      <span>Create Profile Cards ({selectedLoIds.size})</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Agent Dropdown Toggle Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsAgentDropdownOpen(!isAgentDropdownOpen);
                  setIsLoDropdownOpen(false);
                }}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold border transition-all flex items-center gap-2 cursor-pointer shadow-2xs ${
                  isAgentDropdownOpen
                    ? "bg-[#2D362E] text-white border-[#2D362E]"
                    : "bg-[#FAF9F5] text-[#2D362E] border-[#EAE7E0] hover:bg-[#F2EFE9]"
                }`}
              >
                <span>🏡 Agent Roster Dropdown</span>
                <span className="bg-amber-600/20 text-amber-900 px-1.5 py-0.5 rounded-full text-[10px]">
                  {guidesState.agentRoster.length}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isAgentDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Agent Dropdown Popover */}
              {isAgentDropdownOpen && (
                <div className="absolute left-0 sm:right-0 sm:left-auto top-full mt-2 w-80 sm:w-96 bg-white rounded-3xl border border-[#EAE7E0] shadow-2xl p-4 z-50 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[#EAE7E0]">
                    <span className="text-xs font-bold text-[#2D362E]">Agent Partner Directory</span>
                    <span className="text-[10px] text-[#606C5D]">
                      {selectedAgentIds.size} selected
                    </span>
                  </div>

                  {/* Text Search by Branch/Office/Brokerage Name or Agent Name */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search brokerage, office, or name..."
                      value={agentSearchQuery}
                      onChange={(e) => setAgentSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#EAE7E0] bg-[#FAF9F5] focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  {/* Sort Controls */}
                  <div className="flex items-center justify-between text-[11px] text-[#606C5D]">
                    <span className="font-semibold flex items-center gap-1">
                      <ArrowUpDown className="w-3 h-3 text-[#9A9488]" /> Sort By:
                    </span>
                    <select
                      value={agentSortBy}
                      onChange={(e) => setAgentSortBy(e.target.value as any)}
                      className="text-xs font-bold bg-[#FAF9F5] border border-[#EAE7E0] rounded-lg px-2 py-1 text-[#2D362E] focus:outline-none"
                    >
                      <option value="name_last">A–Z by Last Name (Default)</option>
                      <option value="units_desc">Buy-side Closings (Desc)</option>
                      <option value="volume_desc">Buy-side Volume (Desc)</option>
                    </select>
                  </div>

                  {/* Roster Rows with Checkboxes */}
                  <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 divide-y divide-gray-100">
                    {processedAgentRoster.length === 0 ? (
                      <p className="text-xs text-gray-500 py-4 text-center">No agents match search.</p>
                    ) : (
                      processedAgentRoster.map((agent) => {
                        const isChecked = selectedAgentIds.has(agent.id);
                        return (
                          <div
                            key={agent.id}
                            onClick={() => {
                              setSelectedAgentIds((prev) => {
                                const next = new Set(prev);
                                if (next.has(agent.id)) next.delete(agent.id);
                                else next.add(agent.id);
                                return next;
                              });
                            }}
                            className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#FAF9F5] cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}} // handled by parent div click
                              className="w-4 h-4 rounded text-emerald-600 border-gray-300 focus:ring-emerald-500 cursor-pointer"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-[#2D362E] truncate">{agent.name}</span>
                                {agent.rank && (
                                  <span className="text-[9px] font-black bg-amber-400 text-amber-950 px-1.5 py-0.2 rounded-full">
                                    #{agent.rank}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-[#606C5D] truncate">
                                {agent.brokerage || agent.company || "Real Estate Brokerage"} • {agent.licenseNumber || "Lic unverified"}
                              </p>
                              <div className="flex items-center gap-2 text-[9px] text-[#80887D] mt-0.5">
                                <span>Buyside Vol: {agent.buysideVolume12Mo ? `$${(agent.buysideVolume12Mo / 1000000).toFixed(1)}M` : (agent.production12MoVolume ? `$${(agent.production12MoVolume / 1000000).toFixed(1)}M` : "Not verified")}</span>
                                <span>•</span>
                                <span>Buyside Units: {agent.buysideUnits12Mo ?? agent.production12MoUnits ?? "Not verified"}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Dropdown Footer with "Create Profile Cards" Button */}
                  <div className="pt-2 border-t border-[#EAE7E0] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedAgentIds.size === processedAgentRoster.length) {
                          setSelectedAgentIds(new Set());
                        } else {
                          setSelectedAgentIds(new Set(processedAgentRoster.map((a) => a.id)));
                        }
                      }}
                      className="text-[11px] font-bold text-[#606C5D] hover:text-[#2D362E] cursor-pointer"
                    >
                      {selectedAgentIds.size === processedAgentRoster.length ? "Deselect All" : "Select All"}
                    </button>

                    <button
                      type="button"
                      disabled={selectedAgentIds.size === 0}
                      onClick={handleCreateCardsFromAgentDropdown}
                      className="px-3.5 py-1.5 bg-[#2D362E] disabled:opacity-40 hover:bg-[#1A201B] text-white rounded-xl text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-emerald-400" />
                      <span>Create Profile Cards ({selectedAgentIds.size})</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Card Wall Header & Sort Controls */}
      <div className="bg-white p-5 rounded-3xl border border-[#EAE7E0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="font-serif font-black text-xl text-[#2D362E]">
            Verified Profile Card Wall
          </h2>
          <span className="text-xs font-bold bg-[#FAF9F5] text-[#606C5D] px-2.5 py-1 rounded-full border border-[#EAE7E0]">
            {sortedWallCards.length} Verified Profile Cards
          </span>
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search on Wall */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search cards..."
              value={wallSearchQuery}
              onChange={(e) => setWallSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#EAE7E0] bg-[#FAF9F5] text-[#2D362E] focus:outline-none focus:border-emerald-600 w-36 sm:w-44"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1 bg-[#FAF9F5] p-1 rounded-xl border border-[#EAE7E0]">
            <button
              type="button"
              onClick={() => setWallTypeFilter("all")}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                wallTypeFilter === "all" ? "bg-[#2D362E] text-white shadow-2xs" : "text-[#606C5D] hover:text-[#2D362E]"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setWallTypeFilter("loan_officer")}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                wallTypeFilter === "loan_officer" ? "bg-[#2D362E] text-white shadow-2xs" : "text-[#606C5D] hover:text-[#2D362E]"
              }`}
            >
              LOs
            </button>
            <button
              type="button"
              onClick={() => setWallTypeFilter("real_estate_agent")}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                wallTypeFilter === "real_estate_agent" ? "bg-[#2D362E] text-white shadow-2xs" : "text-[#606C5D] hover:text-[#2D362E]"
              }`}
            >
              Agents
            </button>
          </div>

          {/* Sort Control: Default is "Rank (1–50)" so highest producers sit at the top */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#7D8877] uppercase flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3 text-[#9A9488]" /> Sort:
            </span>
            <select
              value={wallSort}
              onChange={(e) => setWallSort(e.target.value as any)}
              className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-3 py-1.5 text-xs font-bold text-[#2D362E] focus:outline-none focus:border-emerald-600 cursor-pointer shadow-2xs"
            >
              <option value="rank">Rank (1–50) (Default)</option>
              <option value="volume_desc">Volume ($M) (Desc)</option>
              <option value="units_desc">Units / Closings (Desc)</option>
              <option value="name_asc">Name (A–Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Profile Card Wall Grid */}
      {sortedWallCards.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-[#EAE7E0] space-y-3">
          <Award className="w-10 h-10 text-amber-500 mx-auto opacity-50" />
          <h4 className="font-bold text-[#2D362E]">No profile cards found</h4>
          <p className="text-xs text-[#606C5D] max-w-md mx-auto">
            Use the "Sweep State Top 50" tool or the Searchable Roster Dropdowns above to select candidates and click "Create Profile Cards".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedWallCards.map((card) => {
            const hasVerifiedRank = typeof card.rank === "number" && card.rank > 0 && card.rank <= 50;

            return (
              <div
                key={card.id}
                className="bg-white rounded-3xl border border-[#EAE7E0] p-6 space-y-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Header: Initials Avatar / Real Photo & Name */}
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-[#F4F1EA] overflow-hidden shrink-0 border border-[#EAE7E0] shadow-2xs flex items-center justify-center font-black text-lg text-[#2D362E]">
                      {card.headshotUrl && card.headshotUrl.startsWith("http") ? (
                        <img
                          src={card.headshotUrl}
                          alt={card.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>
                          {card.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-serif font-bold text-base text-[#2D362E] truncate">
                          {card.name}
                        </h4>
                        <span className="text-[9px] font-bold bg-[#FAF9F5] text-[#606C5D] px-1.5 py-0.5 rounded border border-[#EAE7E0]">
                          {card.type === "loan_officer" ? "Loan Officer" : "Real Estate Agent"}
                        </span>
                      </div>

                      <p className="text-xs text-[#606C5D] font-medium truncate">{card.title}</p>
                      <p className="text-xs text-[#9E6D43] font-semibold truncate flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                        <span>{card.companyOrBrokerage || "Company not verified"}</span>
                      </p>
                    </div>
                  </div>

                  {/* Badges Bar: Rank badge ONLY if verified rank 1-50; unverified-rank cards show NO badge */}
                  <div className="flex items-center gap-1.5 flex-wrap min-h-[22px]">
                    {hasVerifiedRank ? (
                      <span className="text-[10px] font-extrabold bg-amber-400 text-amber-950 px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1 shadow-2xs">
                        🏆 Rank #{card.rank}
                      </span>
                    ) : null}

                    {card.accoladeRank && (
                      <span className="text-[10px] font-bold bg-amber-50 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200">
                        {card.accoladeRank}
                      </span>
                    )}

                    <span className="text-[9px] font-bold bg-emerald-50 text-emerald-900 px-1.5 py-0.5 rounded border border-emerald-200">
                      {card.state || "OR"} Licensed
                    </span>
                  </div>

                  {/* Contact & License Info: Null fields visibly marked "not verified" */}
                  <div className="bg-[#FAF9F5] p-3 rounded-2xl border border-[#EAE7E0] space-y-1.5 text-xs text-[#606C5D]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#7D8877] uppercase">License / NMLS:</span>
                      {card.licenseOrNmls ? (
                        <span className="font-bold text-[#2D362E]">{card.licenseOrNmls}</span>
                      ) : (
                        <span className="text-amber-800 italic font-semibold text-[11px]">License not verified</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#7D8877] uppercase">Email:</span>
                      {card.email ? (
                        <span className="truncate max-w-[180px] font-medium text-[#2D362E]">{card.email}</span>
                      ) : (
                        <span className="text-amber-800 italic font-medium text-[11px]">Email not verified</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#7D8877] uppercase">Phone:</span>
                      {card.phone ? (
                        <span className="font-medium text-[#2D362E]">{card.phone}</span>
                      ) : (
                        <span className="text-amber-800 italic font-medium text-[11px]">Phone not verified</span>
                      )}
                    </div>
                  </div>

                  {/* Production Metrics: Null fields visibly marked "Not verified" */}
                  <div className="grid grid-cols-3 gap-2 bg-[#F4F1EA]/60 p-2.5 rounded-2xl text-center border border-[#EAE7E0]">
                    <div>
                      <div className="text-[9px] font-bold text-[#7D8877] uppercase">Experience</div>
                      <div className="text-xs font-bold text-[#2D362E]">
                        {card.yearsExperience != null ? `${card.yearsExperience} Yrs` : <span className="text-amber-800 italic font-medium">Unverified</span>}
                      </div>
                    </div>

                    <div>
                      <div className="text-[9px] font-bold text-[#7D8877] uppercase">12mo Units</div>
                      <div className="text-xs font-bold text-emerald-800">
                        {card.production12MoUnits != null ? card.production12MoUnits : <span className="text-amber-800 italic font-medium">Not verified</span>}
                      </div>
                    </div>

                    <div>
                      <div className="text-[9px] font-bold text-[#7D8877] uppercase">12mo Vol</div>
                      <div className="text-xs font-bold text-emerald-800">
                        {card.production12MoVolume != null ? (
                          `$${(card.production12MoVolume / 1000000).toFixed(1)}M`
                        ) : (
                          <span className="text-amber-800 italic font-medium">Not verified</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Verification Affordances: Grounded Source Page + Official Verify License Deep Link */}
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    {card.sourceUrl && (
                      <a
                        href={card.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1 transition-colors"
                      >
                        <ExternalLink className="w-2.5 h-2.5" />
                        <span>Source Page ↗</span>
                      </a>
                    )}

                    <a
                      href={card.verifyLicenseUrl || (card.type === "loan_officer" ? "https://www.nmlsconsumeraccess.org/" : "https://rea.oregon.gov/")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1 transition-colors"
                    >
                      <ExternalLink className="w-2.5 h-2.5" />
                      <span>Verify License ({card.type === "loan_officer" ? "NMLS" : "Oregon REA"}) ↗</span>
                    </a>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-[#EAE7E0] flex items-center justify-between gap-2">
                  <span className="text-[10px] text-[#7D8877] font-medium">
                    Verified Profile Card
                  </span>

                  {onOpenOutreachModal && (
                    <button
                      type="button"
                      onClick={() =>
                        onOpenOutreachModal({
                          id: card.id,
                          name: card.name,
                          email: card.email,
                          phone: card.phone,
                          type: card.type === "loan_officer" ? "lo" : "agent",
                          company: card.companyOrBrokerage,
                          rank: card.rank,
                          volume: card.production12MoVolume
                        })
                      }
                      className="px-3 py-1.5 bg-[#FAF9F5] hover:bg-[#F4F1EA] text-[#2D362E] border border-[#EAE7E0] rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#C18C5D]" />
                      <span>Draft Outreach</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
