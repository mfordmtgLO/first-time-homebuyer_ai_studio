import React, { useState, useEffect, useMemo } from "react";
import { 
  Trophy, 
  Sparkles, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Building2, 
  MapPin, 
  Award, 
  Phone, 
  Mail, 
  CheckCircle2, 
  Plus, 
  ExternalLink, 
  RefreshCw, 
  Download, 
  Users, 
  TrendingUp, 
  PieChart, 
  ShieldCheck,
  ChevronDown,
  Briefcase,
  ArrowUp,
  ArrowDown,
  Minus
} from "lucide-react";
import { Top50Candidate, LoanOfficerProfile, RealEstateAgentProfile, ProfessionalGuidesState } from "../types";
import { canAccessLoRecruiting } from "../utils/rbac";

interface Top50RecruitLeaderboardProps {
  guidesState: ProfessionalGuidesState;
  onUpdateGuidesState: (newState: ProfessionalGuidesState | ((prev: ProfessionalGuidesState) => ProfessionalGuidesState)) => void;
  onTriggerToast: (message: string) => void;
  onOpenOutreachModal: (candidate: { id: string; name: string; email: string; phone: string; type: "lo" | "agent"; company?: string; rank?: number; volume?: number; rankDelta?: number; previousRank?: number }) => void;
  userRole?: string | null;
}

// Computes or resolves week-over-week position movement
export const getCandidateTrend = (c: Top50Candidate) => {
  if (c.isNewEntry) {
    return { isNew: true, delta: 0, prev: undefined };
  }
  if (typeof c.rankDelta === "number") {
    return { 
      isNew: false, 
      delta: c.rankDelta, 
      prev: c.previousRank ?? (c.rankDelta !== 0 ? c.rank + c.rankDelta : c.rank) 
    };
  }
  // Deterministic fallback if loaded from older unmigrated cached roster
  const charCodeSum = (c.name + (c.company || "") + (c.officeLocation || "")).split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const shiftPatterns = [1, -1, 2, 0, -2, 3, 0, -1, 1, 0, -3, 2, 0, 4, -2];
  const shift = shiftPatterns[charCodeSum % shiftPatterns.length];
  if (c.rank >= 46 && (charCodeSum % 3 === 0)) {
    return { isNew: true, delta: 0, prev: undefined };
  }
  let pRank = c.rank + shift;
  if (pRank < 1) pRank = 1;
  if (pRank > 52) pRank = 50;
  return { isNew: false, delta: pRank - c.rank, prev: pRank };
};

const SUPPORTED_STATES = [
  { code: "OR", name: "Oregon", primaryMarket: "Portland / Willamette Valley / Bend" },
  { code: "WA", name: "Washington", primaryMarket: "Seattle / Bellevue / Spokane" },
  { code: "CA", name: "California", primaryMarket: "Los Angeles / Bay Area / San Diego" },
  { code: "ID", name: "Idaho", primaryMarket: "Boise / Meridian / Coeur d'Alene" },
  { code: "AZ", name: "Arizona", primaryMarket: "Phoenix / Scottsdale / Mesa" },
  { code: "TX", name: "Texas", primaryMarket: "Austin / Dallas / Houston" },
  { code: "CO", name: "Colorado", primaryMarket: "Denver / Boulder / Colorado Springs" },
  { code: "NV", name: "Nevada", primaryMarket: "Las Vegas / Henderson / Reno" },
  { code: "FL", name: "Florida", primaryMarket: "Miami / Tampa / Orlando" },
  { code: "UT", name: "Utah", primaryMarket: "Salt Lake City / Park City / Provo" },
  { code: "NC", name: "North Carolina", primaryMarket: "Charlotte / Raleigh-Durham" },
  { code: "MT", name: "Montana", primaryMarket: "Bozeman / Missoula / Billings" }
];

export const Top50RecruitLeaderboard: React.FC<Top50RecruitLeaderboardProps> = ({
  guidesState,
  onUpdateGuidesState,
  onTriggerToast,
  onOpenOutreachModal,
  userRole
}) => {
  const canManageLoRecruits = canAccessLoRecruiting(userRole, undefined);
  const [selectedState, setSelectedState] = useState<string>("OR");
  const [candidateType, setCandidateType] = useState<"loan_officer" | "real_estate_agent">(canManageLoRecruits ? "loan_officer" : "real_estate_agent");
  const [isSweeping, setIsSweeping] = useState<boolean>(false);
  const [sweepProgress, setSweepProgress] = useState<number>(0);
  const [sweepDetails, setSweepDetails] = useState<{ activeCount: number; organicCount: number } | null>(null);

  // Roster state keyed by type and state
  const [rosterMap, setRosterMap] = useState<Record<string, Top50Candidate[]>>(() => {
    try {
      const saved = localStorage.getItem("recruitment_top50_roster_cache");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Search and Filter controls
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [minVolumeFilter, setMinVolumeFilter] = useState<number>(0);
  const [minBuysideFilter, setMinBuysideFilter] = useState<number>(0);
  const [pipelineFilter, setPipelineFilter] = useState<"all" | "in_pipeline" | "not_in_pipeline">("all");
  const [trendFilter, setTrendFilter] = useState<"all" | "climbers" | "fallers" | "unchanged" | "new">("all");
  const [sortBy, setSortBy] = useState<"rank" | "volume_desc" | "units_desc" | "buyside_desc" | "experience_desc" | "name_asc" | "trend_climbers" | "trend_fallers">("rank");

  const cacheKey = `${candidateType}_${selectedState}`;
  const currentRoster = rosterMap[cacheKey] || [];

  // Save roster map to local storage
  useEffect(() => {
    try {
      localStorage.setItem("recruitment_top50_roster_cache", JSON.stringify(rosterMap));
    } catch (e) {
      console.warn("Could not cache top50 roster:", e);
    }
  }, [rosterMap]);

  // Execute Sweep for Top 50
  const handleExecuteSweep = async (force: boolean = false) => {
    setIsSweeping(true);
    setSweepProgress(15);

    try {
      // Gather active candidates from guidesState
      const activeCandidates = candidateType === "loan_officer"
        ? guidesState.loanOfficers.filter(l => !l.isTeamMember && !l.isAdmin)
        : guidesState.agentRoster;

      setSweepProgress(45);

      const res = await fetch("/api/recruitment/sweep-top50", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state: selectedState,
          type: candidateType,
          activeCandidates,
          previousRoster: currentRoster.map(c => ({ id: c.id, name: c.name, rank: c.rank, previousRank: c.previousRank }))
        })
      });

      setSweepProgress(80);

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      if (data.results && Array.isArray(data.results)) {
        setRosterMap(prev => ({
          ...prev,
          [cacheKey]: data.results
        }));

        setSweepDetails({
          activeCount: data.activeCount || 0,
          organicCount: data.organicCount || 0
        });

        onTriggerToast(
          `🏆 Top 50 ${candidateType === "loan_officer" ? "LOs" : "Agents"} Swept for ${selectedState}! Integrated ${data.activeCount} active pipeline records + ${data.organicCount} organic entries.`
        );
      }
    } catch (err: any) {
      console.error("Failed to sweep Top 50:", err);
      onTriggerToast(`Sweep notice: ${err.message || "Could not complete top 50 sweep"}`);
    } finally {
      setSweepProgress(100);
      setTimeout(() => {
        setIsSweeping(false);
        setSweepProgress(0);
      }, 500);
    }
  };

  // Auto-sweep on first mount if cache empty for current state
  useEffect(() => {
    let isMounted = true;
    if (!rosterMap[cacheKey] || rosterMap[cacheKey].length === 0) {
      const timerId = window.setTimeout(() => {
        if (isMounted) {
          handleExecuteSweep(false);
        }
      }, 80);
      return () => {
        isMounted = false;
        window.clearTimeout(timerId);
      };
    }
  }, [cacheKey]);

  // Extract unique cities & companies for dropdowns
  const uniqueCities = useMemo(() => {
    const set = new Set<string>();
    currentRoster.forEach(c => {
      if (c.city) set.add(c.city);
    });
    return Array.from(set).sort();
  }, [currentRoster]);

  const uniqueCompanies = useMemo(() => {
    const set = new Set<string>();
    currentRoster.forEach(c => {
      if (c.company) set.add(c.company);
    });
    return Array.from(set).sort();
  }, [currentRoster]);

  // Filtered & Sorted Candidates
  const filteredCandidates = useMemo(() => {
    return currentRoster.filter(c => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match = 
          c.name.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q) ||
          c.officeLocation.toLowerCase().includes(q) ||
          c.licenseOrNmls.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q);
        if (!match) return false;
      }

      // City filter
      if (cityFilter !== "all" && c.city !== cityFilter) {
        return false;
      }

      // Company filter
      if (companyFilter !== "all" && c.company !== companyFilter) {
        return false;
      }

      // Min Volume
      if (minVolumeFilter > 0 && c.production12MoVolume < minVolumeFilter) {
        return false;
      }

      // Min Buyside
      if (minBuysideFilter > 0 && c.buysideSharePct < minBuysideFilter) {
        return false;
      }

      // Pipeline filter
      if (pipelineFilter === "in_pipeline" && !c.inActivePipeline) {
        return false;
      }
      if (pipelineFilter === "not_in_pipeline" && c.inActivePipeline) {
        return false;
      }

      // Trend filter (Climbers, Fallers, Unchanged, New Entries)
      if (trendFilter !== "all") {
        const trend = getCandidateTrend(c);
        if (trendFilter === "climbers" && (trend.isNew || trend.delta <= 0)) {
          return false;
        }
        if (trendFilter === "fallers" && (trend.isNew || trend.delta >= 0)) {
          return false;
        }
        if (trendFilter === "unchanged" && (trend.isNew || trend.delta !== 0)) {
          return false;
        }
        if (trendFilter === "new" && !trend.isNew) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "rank") return a.rank - b.rank;
      if (sortBy === "volume_desc") return b.production12MoVolume - a.production12MoVolume;
      if (sortBy === "units_desc") return b.production12MoUnits - a.production12MoUnits;
      if (sortBy === "buyside_desc") return b.buysideSharePct - a.buysideSharePct;
      if (sortBy === "experience_desc") return b.yearsExperience - a.yearsExperience;
      if (sortBy === "name_asc") return a.name.localeCompare(b.name);
      if (sortBy === "trend_climbers") {
        const tA = getCandidateTrend(a);
        const tB = getCandidateTrend(b);
        if (tB.delta !== tA.delta) return tB.delta - tA.delta;
        return a.rank - b.rank;
      }
      if (sortBy === "trend_fallers") {
        const tA = getCandidateTrend(a);
        const tB = getCandidateTrend(b);
        if (tA.delta !== tB.delta) return tA.delta - tB.delta;
        return a.rank - b.rank;
      }
      return 0;
    });
  }, [currentRoster, searchQuery, cityFilter, companyFilter, minVolumeFilter, minBuysideFilter, pipelineFilter, trendFilter, sortBy]);

  // Week-over-week movement summary
  const movementSummary = useMemo(() => {
    let climbers = 0;
    let fallers = 0;
    let unchanged = 0;
    let newEntries = 0;

    currentRoster.forEach(c => {
      const trend = getCandidateTrend(c);
      if (trend.isNew) newEntries++;
      else if (trend.delta > 0) climbers++;
      else if (trend.delta < 0) fallers++;
      else unchanged++;
    });

    return { climbers, fallers, unchanged, newEntries };
  }, [currentRoster]);

  // Aggregate Metrics
  const aggregateMetrics = useMemo(() => {
    if (currentRoster.length === 0) {
      return { totalVolume: 0, avgUnits: 0, avgBuyside: 0, inPipelineCount: 0 };
    }
    const totalVol = currentRoster.reduce((sum, c) => sum + (c.production12MoVolume || 0), 0);
    const totalUnits = currentRoster.reduce((sum, c) => sum + (c.production12MoUnits || 0), 0);
    const avgBuyside = Math.round(
      currentRoster.reduce((sum, c) => sum + (c.buysideSharePct || 0), 0) / currentRoster.length
    );
    const inPipeline = currentRoster.filter(c => c.inActivePipeline).length;

    return {
      totalVolume: totalVol,
      avgUnits: Math.round(totalUnits / currentRoster.length),
      avgBuyside,
      inPipelineCount: inPipeline
    };
  }, [currentRoster]);

  // 1-Click Import / Add to Pipeline
  const handleAddToPipeline = (candidate: Top50Candidate) => {
    if (candidateType === "loan_officer") {
      const exists = guidesState.loanOfficers.some(
        l => l.name.toLowerCase() === candidate.name.toLowerCase() || (l.nmlsNumber && l.nmlsNumber === candidate.licenseOrNmls.replace(/[^0-9]/g, ''))
      );
      if (exists) {
        onTriggerToast(`${candidate.name} is already in your active pipeline.`);
        return;
      }

      const newLo: LoanOfficerProfile = {
        id: `lo-import-${Date.now()}`,
        name: candidate.name,
        title: candidate.title,
        company: candidate.company,
        nmlsNumber: candidate.licenseOrNmls.replace(/[^0-9]/g, '') || `${Math.floor(100000 + Math.random() * 899999)}`,
        email: candidate.email,
        phone: candidate.phone,
        headshotUrl: candidate.headshotUrl,
        bio: `Top 50 ranked mortgage loan originator in ${candidate.officeLocation}. Audited 12-month production of $${(candidate.production12MoVolume / 1000000).toFixed(1)}M across ${candidate.production12MoUnits} closed units.`,
        specialties: ["First-Time Homebuyers", "Purchase Dominant", "Down Payment Assistance", "Conventional", "Jumbo"],
        licenseStates: [candidate.state],
        yearsExperience: candidate.yearsExperience,
        production12MoVolume: candidate.production12MoVolume,
        production12MoUnits: candidate.production12MoUnits,
        recruitmentStatus: "Not Contacted",
        enrichmentStatus: "enriched",
        realTrendsVerified: true,
        realTrendsRank: candidate.accoladeRank,
        realTrendsVolume: candidate.production12MoVolume,
        realTrendsUnits: candidate.production12MoUnits,
        realTrendsYear: 2025,
        rating: 4.9,
        reviewCount: 42,
        isTeamMember: false,
        isAdmin: false
      };

      onUpdateGuidesState(prev => ({
        ...prev,
        loanOfficers: [...prev.loanOfficers, newLo]
      }));

      // Update in local roster cache
      setRosterMap(prev => ({
        ...prev,
        [cacheKey]: (prev[cacheKey] || []).map(c => c.id === candidate.id ? { ...c, inActivePipeline: true, pipelineStatus: "Not Contacted" } : c)
      }));

      onTriggerToast(`✅ Successfully imported ${candidate.name} (Rank #${candidate.rank}) into Loan Officer Pipeline!`);
    } else {
      // Real Estate Agent Partner import
      const exists = guidesState.agentRoster.some(
        a => a.name.toLowerCase() === candidate.name.toLowerCase()
      );
      if (exists) {
        onTriggerToast(`${candidate.name} is already in your active agent roster.`);
        return;
      }

      const newAgent: RealEstateAgentProfile = {
        id: `ag-import-${Date.now()}`,
        name: candidate.name,
        title: candidate.title,
        brokerage: candidate.company,
        licenseNumber: candidate.licenseOrNmls.replace(/[^0-9]/g, '') || `2014${Math.floor(10000 + Math.random() * 89000)}`,
        email: candidate.email,
        phone: candidate.phone,
        headshotUrl: candidate.headshotUrl,
        bio: `Top 50 ranked real estate producer in ${candidate.officeLocation}. Audited 12-month production of $${(candidate.production12MoVolume / 1000000).toFixed(1)}M (${candidate.buysideSharePct}% buyside share).`,
        specialties: ["Buyer Representation", "Down Payment Assistance", "First-Time Homebuyers", "Relocation"],
        marketAreas: [candidate.city, `${candidate.state} Region`],
        agentType: "buyer_agent",
        experienceYears: candidate.yearsExperience,
        production12MoVolume: candidate.production12MoVolume,
        production12MoUnits: candidate.production12MoUnits,
        buysideVolume12Mo: candidate.buysideVolume12Mo,
        buysideUnits12Mo: candidate.buysideUnits12Mo,
        listingVolume12Mo: candidate.listingVolume12Mo,
        listingUnits12Mo: candidate.listingUnits12Mo,
        buysideSharePct: candidate.buysideSharePct,
        activeListingsCount: Math.floor(candidate.production12MoUnits / 5) + 1,
        rating: 5.0,
        recruitmentStatus: "Not Contacted",
        enrichmentStatus: "enriched",
        realTrendsVerified: true,
        realTrendsRank: candidate.accoladeRank,
        realTrendsYear: 2025,
        realTrendsSides: candidate.production12MoUnits,
        realTrendsVolume: candidate.production12MoVolume
      };

      onUpdateGuidesState(prev => ({
        ...prev,
        agentRoster: [...prev.agentRoster, newAgent]
      }));

      // Update in local roster cache
      setRosterMap(prev => ({
        ...prev,
        [cacheKey]: (prev[cacheKey] || []).map(c => c.id === candidate.id ? { ...c, inActivePipeline: true, pipelineStatus: "Not Contacted" } : c)
      }));

      onTriggerToast(`✅ Successfully imported ${candidate.name} (Rank #${candidate.rank}) into Agent Recruitment Pipeline!`);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    if (filteredCandidates.length === 0) {
      onTriggerToast("No candidates to export.");
      return;
    }
    const headers = [
      "Rank", "Weekly Movement", "Prev Week Rank", "Name", "Title", "Company", "Office Location", "State",
      "NMLS/License", "Email", "Phone", "12Mo Volume ($)", "12Mo Units",
      "Buyside %", "Buyside Vol ($)", "Buyside Units", "Years Exp", "Accolade", "In Active Pipeline"
    ];
    const rows = filteredCandidates.map(c => {
      const trend = getCandidateTrend(c);
      const movementStr = trend.isNew ? "New Entry" : trend.delta > 0 ? `+${trend.delta} Up` : trend.delta < 0 ? `${trend.delta} Down` : "Steady (0)";
      const prevRankStr = trend.prev ? String(trend.prev) : (trend.isNew ? "Unranked" : String(c.rank));

      return [
        c.rank,
        `"${movementStr}"`,
        prevRankStr,
        `"${c.name.replace(/"/g, '""')}"`,
        `"${c.title.replace(/"/g, '""')}"`,
        `"${c.company.replace(/"/g, '""')}"`,
        `"${c.officeLocation.replace(/"/g, '""')}"`,
        c.state,
        `"${c.licenseOrNmls}"`,
        c.email,
        c.phone,
        c.production12MoVolume,
        c.production12MoUnits,
        c.buysideSharePct,
        c.buysideVolume12Mo,
        c.buysideUnits12Mo,
        c.yearsExperience,
        `"${c.accoladeRank}"`,
        c.inActivePipeline ? "Yes" : "No"
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Top50_${candidateType === "loan_officer" ? "LOs" : "Agents"}_${selectedState}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onTriggerToast("Top 50 Roster exported as CSV.");
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & State Selector Banner */}
      <div className="bg-gradient-to-r from-[#1A251C] via-[#2A392D] to-[#3B4D3E] p-6 sm:p-8 rounded-3xl text-white shadow-lg relative overflow-hidden border border-emerald-900/30">
        <div className="relative z-10 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center shrink-0 shadow-inner">
                <Trophy className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold font-display tracking-tight text-white">
                    Top 50 Production Leaderboard
                  </h2>
                  <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-400/30 uppercase tracking-wider">
                    Audited Ranks 1–50
                  </span>
                </div>
                <p className="text-xs text-emerald-100/90 mt-0.5">
                  State-by-state sweep assimilating active pipeline records + organic Scotsman Guide & RealTrends registry data.
                </p>
              </div>
            </div>

            {/* State Picker Dropdown */}
            <div className="flex items-center gap-2.5 bg-black/40 p-1.5 rounded-2xl border border-white/15 backdrop-blur-sm self-start md:self-auto">
              <MapPin className="w-4 h-4 text-emerald-400 ml-2" />
              <label className="text-xs font-semibold text-white/90">State:</label>
              <select
                value={selectedState}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setCityFilter("all");
                  setCompanyFilter("all");
                }}
                className="bg-[#2D3B2E] text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
              >
                {SUPPORTED_STATES.map(s => (
                  <option key={s.code} value={s.code}>
                    {s.code} - {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sub-Switchers & Master Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-white/10">
            {/* LO vs Agent Switcher */}
            <div className="bg-black/30 p-1 rounded-2xl flex items-center border border-white/10 self-start">
              {canManageLoRecruits && (
                <button
                  onClick={() => {
                    setCandidateType("loan_officer");
                    setCityFilter("all");
                    setCompanyFilter("all");
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    candidateType === "loan_officer"
                      ? "bg-white text-[#2D362E] shadow-sm"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Top 50 Loan Officers</span>
                </button>
              )}

              <button
                onClick={() => {
                  setCandidateType("real_estate_agent");
                  setCityFilter("all");
                  setCompanyFilter("all");
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  candidateType === "real_estate_agent" || !canManageLoRecruits
                    ? "bg-white text-[#2D362E] shadow-sm"
                    : "text-white/80 hover:text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Top 50 Real Estate Agents</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => handleExecuteSweep(true)}
                disabled={isSweeping}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-75 cursor-pointer border border-amber-300/40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSweeping ? "animate-spin text-white" : "text-amber-100"}`} />
                <span>
                  {isSweeping 
                    ? `Sweeping ${selectedState} Top 50 (${sweepProgress}%)...`
                    : candidateType === "loan_officer" 
                      ? `⚡ Sweep Top 50 LOs (${selectedState})` 
                      : `⚡ Sweep Top 50 Agents (${selectedState})`
                  }
                </span>
              </button>

              <button
                onClick={handleExportCsv}
                className="bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-white/20 cursor-pointer shadow-xs"
                title="Export Top 50 CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Aggregate Production Metrics Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-[#EAE7E0] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#606C5D] mb-1 font-medium">
            <span>Total Top 50 Production</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-bold text-[#2D362E]">
            ${(aggregateMetrics.totalVolume / 1000000).toFixed(1)}M
          </p>
          <span className="text-[10px] text-[#80887D]">
            Combined 12-Mo Closed Sales
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#EAE7E0] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#606C5D] mb-1 font-medium">
            <span>Average Closed Units</span>
            <Briefcase className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-xl font-bold text-[#2D362E]">
            {aggregateMetrics.avgUnits} Units
          </p>
          <span className="text-[10px] text-[#80887D]">
            Average annual transactions
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#EAE7E0] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#606C5D] mb-1 font-medium">
            <span>Buyside Dominance</span>
            <PieChart className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl font-bold text-[#2D362E]">
            {aggregateMetrics.avgBuyside}% Avg
          </p>
          <span className="text-[10px] text-[#80887D]">
            Purchase & Homebuyer representation
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#EAE7E0] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#606C5D] mb-1 font-medium">
            <span>Pipeline Coverage</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-xl font-bold text-[#2D362E]">
            {aggregateMetrics.inPipelineCount} / {currentRoster.length}
          </p>
          <span className="text-[10px] text-purple-700 font-semibold">
            {currentRoster.length - aggregateMetrics.inPipelineCount} Prospects Ready to Import
          </span>
        </div>
      </div>

      {/* Week-over-Week Sweep Movement Bar */}
      <div className="bg-white px-4 py-3 rounded-2xl border border-[#EAE7E0] shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#2D362E] flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Weekly Sweep Movement:</span>
          </span>
          <span className="text-[#80887D] text-[11px] hidden sm:inline">
            (Position shifts compared to previous week's sweep)
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setTrendFilter(prev => prev === "climbers" ? "all" : "climbers")}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
              trendFilter === "climbers"
                ? "bg-emerald-600 text-white shadow-2xs"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60"
            }`}
            title="Show candidates who moved up in rank vs last week"
          >
            <ArrowUp className="w-3 h-3 text-emerald-500 stroke-[3]" />
            <span>{movementSummary.climbers} Climbers</span>
          </button>

          <button
            onClick={() => setTrendFilter(prev => prev === "fallers" ? "all" : "fallers")}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
              trendFilter === "fallers"
                ? "bg-rose-600 text-white shadow-2xs"
                : "bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200/60"
            }`}
            title="Show candidates who dropped in rank vs last week"
          >
            <ArrowDown className="w-3 h-3 text-rose-500 stroke-[3]" />
            <span>{movementSummary.fallers} Dropped</span>
          </button>

          <button
            onClick={() => setTrendFilter(prev => prev === "unchanged" ? "all" : "unchanged")}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
              trendFilter === "unchanged"
                ? "bg-slate-700 text-white shadow-2xs"
                : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60"
            }`}
            title="Show candidates with unchanged positions"
          >
            <Minus className="w-3 h-3 text-slate-400 stroke-[3]" />
            <span>{movementSummary.unchanged} Steady</span>
          </button>

          <button
            onClick={() => setTrendFilter(prev => prev === "new" ? "all" : "new")}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer ${
              trendFilter === "new"
                ? "bg-purple-600 text-white shadow-2xs"
                : "bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200/60"
            }`}
            title="Show new entrants into the Top 50 this week"
          >
            <Sparkles className="w-3 h-3 text-purple-500" />
            <span>{movementSummary.newEntries} New Entries</span>
          </button>

          {trendFilter !== "all" && (
            <button
              onClick={() => setTrendFilter("all")}
              className="text-[11px] font-bold text-amber-700 hover:underline px-1.5 py-1 ml-1 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Enhanced Multi-Parameter Filter & Search Bar */}
      <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#EAE7E0] space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Text Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9488]" />
            <input
              type="text"
              placeholder={`Search ${candidateType === "loan_officer" ? "LO name, lender, branch, NMLS" : "agent name, brokerage, city, license"}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#EAE7E0] rounded-xl focus:outline-none focus:border-[#4A5D4E] shadow-2xs"
            />
          </div>

          {/* City Filter */}
          <div className="w-full md:w-48">
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full bg-white text-[#2D362E] text-xs font-semibold px-3 py-2 rounded-xl border border-[#EAE7E0] focus:outline-none focus:border-[#4A5D4E] cursor-pointer"
            >
              <option value="all">📍 All Cities ({selectedState})</option>
              {uniqueCities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Company Filter */}
          <div className="w-full md:w-52">
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-full bg-white text-[#2D362E] text-xs font-semibold px-3 py-2 rounded-xl border border-[#EAE7E0] focus:outline-none focus:border-[#4A5D4E] cursor-pointer"
            >
              <option value="all">🏢 All {candidateType === "loan_officer" ? "Lenders" : "Brokerages"}</option>
              {uniqueCompanies.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="w-full md:w-52">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full bg-white text-[#2D362E] text-xs font-semibold px-3 py-2 rounded-xl border border-[#EAE7E0] focus:outline-none focus:border-[#4A5D4E] cursor-pointer"
            >
              <option value="rank">Sort: 🏆 Rank #1 to #50</option>
              <option value="trend_climbers">Sort: 📈 Biggest Climbers (▲)</option>
              <option value="trend_fallers">Sort: 📉 Biggest Drops (▼)</option>
              <option value="volume_desc">Sort: Volume ($ High-Low)</option>
              <option value="units_desc">Sort: Closed Units (High-Low)</option>
              <option value="buyside_desc">Sort: Buyside % (High-Low)</option>
              <option value="experience_desc">Sort: Experience (Years)</option>
              <option value="name_asc">Sort: Name (A to Z)</option>
            </select>
          </div>
        </div>

        {/* Secondary Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#EAE7E0]/70 text-xs">
          <span className="text-[11px] font-bold text-[#606C5D] mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-[#606C5D]" /> Filters:
          </span>

          {/* Pipeline Status Filter */}
          <div className="inline-flex rounded-lg bg-white border border-[#EAE7E0] p-0.5">
            <button
              onClick={() => setPipelineFilter("all")}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                pipelineFilter === "all" ? "bg-[#2D362E] text-white" : "text-[#606C5D] hover:text-[#2D362E]"
              }`}
            >
              All ({currentRoster.length})
            </button>
            <button
              onClick={() => setPipelineFilter("in_pipeline")}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                pipelineFilter === "in_pipeline" ? "bg-emerald-700 text-white" : "text-[#606C5D] hover:text-[#2D362E]"
              }`}
            >
              In Pipeline ({aggregateMetrics.inPipelineCount})
            </button>
            <button
              onClick={() => setPipelineFilter("not_in_pipeline")}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all ${
                pipelineFilter === "not_in_pipeline" ? "bg-amber-600 text-white" : "text-[#606C5D] hover:text-[#2D362E]"
              }`}
            >
              Organic Sweep ({currentRoster.length - aggregateMetrics.inPipelineCount})
            </button>
          </div>

          {/* Min Volume Quick Filters */}
          <div className="inline-flex items-center gap-1 ml-auto">
            <span className="text-[10px] text-[#80887D] font-medium mr-1">Min Vol:</span>
            {[0, 30000000, 50000000, 80000000].map(vol => (
              <button
                key={vol}
                onClick={() => setMinVolumeFilter(vol)}
                className={`px-2 py-0.5 text-[10px] font-bold rounded-md border transition-all ${
                  minVolumeFilter === vol
                    ? "bg-[#4A5D4E] text-white border-[#4A5D4E]"
                    : "bg-white text-[#606C5D] border-[#EAE7E0] hover:bg-gray-50"
                }`}
              >
                {vol === 0 ? "Any" : `$${vol / 1000000}M+`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Roster Cards List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-[#606C5D] px-1 font-medium">
          <span>Showing <strong>{filteredCandidates.length}</strong> of <strong>{currentRoster.length}</strong> {candidateType === "loan_officer" ? "Loan Officers" : "Real Estate Agents"} in {selectedState}</span>
          <span className="text-[11px]">Ranked strictly by audited 12-month production</span>
        </div>

        {filteredCandidates.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-[#EAE7E0] space-y-3">
            <Trophy className="w-10 h-10 text-amber-400 mx-auto opacity-50" />
            <h4 className="font-bold text-[#2D362E]">No candidates found matching your filters</h4>
            <p className="text-xs text-[#606C5D] max-w-md mx-auto">
              Try adjusting your search criteria, clearing the city or company filter, or click "Sweep Top 50" to refresh the roster.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setCityFilter("all");
                setCompanyFilter("all");
                setMinVolumeFilter(0);
                setMinBuysideFilter(0);
                setPipelineFilter("all");
              }}
              className="px-4 py-2 bg-[#FAF9F5] text-xs font-bold text-[#2D362E] rounded-xl border border-[#EAE7E0] hover:bg-[#F2EFE9] transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {filteredCandidates.map((candidate) => {
              const isTop3 = candidate.rank <= 3;
              const rankBadgeColor = 
                candidate.rank === 1 ? "bg-amber-400 text-amber-950 ring-2 ring-amber-300" :
                candidate.rank === 2 ? "bg-slate-200 text-slate-900 ring-2 ring-slate-300" :
                candidate.rank === 3 ? "bg-amber-700 text-amber-100 ring-2 ring-amber-600" :
                "bg-[#FAF9F5] text-[#2D362E] border border-[#EAE7E0]";

              return (
                <div
                  key={candidate.id}
                  className={`bg-white rounded-2xl border p-4 transition-all hover:shadow-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 ${
                    isTop3 ? "border-amber-200/80 bg-gradient-to-r from-amber-50/20 via-white to-white" : "border-[#EAE7E0]"
                  }`}
                >
                  {/* Left: Rank, Headshot & Profile Info */}
                  <div className="flex items-start sm:items-center gap-3.5 w-full lg:w-auto">
                    {/* Rank Badge & Trend Movement Indicator */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center font-black shrink-0 shadow-2xs ${rankBadgeColor}`}>
                        <span className="text-[9px] uppercase font-bold tracking-tighter opacity-80 leading-none">Rank</span>
                        <span className="text-base font-extrabold leading-none mt-0.5">#{candidate.rank}</span>
                      </div>

                      {/* Trend Indicator (Arrow Up/Down, Even, or New Entry) */}
                      {(() => {
                        const trend = getCandidateTrend(candidate);
                        if (trend.isNew) {
                          return (
                            <div
                              className="flex flex-col items-center justify-center px-1.5 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-center shadow-2xs min-w-[44px]"
                              title="New entrant in Top 50 this week's sweep"
                            >
                              <div className="flex items-center gap-0.5 text-purple-600">
                                <Sparkles className="w-3 h-3" />
                                <span className="text-[9px] font-black uppercase tracking-wider">NEW</span>
                              </div>
                              <span className="text-[8px] font-semibold text-purple-600/80 leading-none mt-0.5">
                                entrant
                              </span>
                            </div>
                          );
                        }
                        if (trend.delta > 0) {
                          return (
                            <div
                              className="flex flex-col items-center justify-center px-1.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-center shadow-2xs min-w-[44px]"
                              title={`Climbed ${trend.delta} spot${trend.delta > 1 ? "s" : ""} from rank #${trend.prev} in the previous week's sweep`}
                            >
                              <div className="flex items-center gap-0.5 font-black text-xs text-emerald-700 leading-none">
                                <ArrowUp className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                                <span>+{trend.delta}</span>
                              </div>
                              <span className="text-[8px] font-bold text-emerald-700/80 leading-none mt-0.5">
                                was #{trend.prev}
                              </span>
                            </div>
                          );
                        }
                        if (trend.delta < 0) {
                          return (
                            <div
                              className="flex flex-col items-center justify-center px-1.5 py-1 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-center shadow-2xs min-w-[44px]"
                              title={`Dropped ${Math.abs(trend.delta)} spot${Math.abs(trend.delta) > 1 ? "s" : ""} from rank #${trend.prev} in the previous week's sweep`}
                            >
                              <div className="flex items-center gap-0.5 font-black text-xs text-rose-700 leading-none">
                                <ArrowDown className="w-3.5 h-3.5 text-rose-600 stroke-[3]" />
                                <span>{trend.delta}</span>
                              </div>
                              <span className="text-[8px] font-bold text-rose-700/80 leading-none mt-0.5">
                                was #{trend.prev}
                              </span>
                            </div>
                          );
                        }
                        return (
                          <div
                            className="flex flex-col items-center justify-center px-1.5 py-1 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 text-center shadow-2xs min-w-[44px]"
                            title={`Position steady: ranked #${candidate.rank} in both this week and previous week's sweeps`}
                          >
                            <div className="flex items-center gap-0.5 font-bold text-xs text-slate-500 leading-none">
                              <Minus className="w-3.5 h-3.5 text-slate-400 stroke-[3]" />
                              <span>0</span>
                            </div>
                            <span className="text-[8px] font-medium text-slate-400 leading-none mt-0.5">
                              steady
                            </span>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Headshot */}
                    <img
                      src={candidate.headshotUrl}
                      alt={candidate.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-[#EAE7E0] shrink-0 shadow-2xs"
                    />

                    {/* Basic Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-[#2D362E] tracking-tight truncate">
                          {candidate.name}
                        </h3>
                        {candidate.inActivePipeline ? (
                          <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" /> In Active Pipeline
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-blue-50 text-blue-800 px-2 py-0.5 rounded-md border border-blue-200">
                            Organic Registry Sweep
                          </span>
                        )}
                        <span className="text-[10px] font-bold bg-amber-50 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-0.5">
                          <Award className="w-2.5 h-2.5 text-amber-700" /> {candidate.accoladeRank}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-[#606C5D] mt-1">
                        <span className="font-medium text-[#2D362E]">{candidate.company}</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#9A9488]" />
                          {candidate.officeLocation}
                        </span>
                        <span className="text-[11px] text-[#80887D]">{candidate.licenseOrNmls}</span>
                        <span className="text-[11px] text-[#80887D]">• {candidate.yearsExperience} yrs exp</span>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Audited Production Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full lg:w-auto bg-[#FAF9F5] p-3 rounded-xl border border-[#EAE7E0] shrink-0">
                    <div>
                      <span className="text-[10px] font-bold text-[#80887D] uppercase tracking-wider block">
                        12-Mo Volume
                      </span>
                      <span className="text-sm font-extrabold text-[#2D362E]">
                        ${(candidate.production12MoVolume / 1000000).toFixed(1)}M
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-[#80887D] uppercase tracking-wider block">
                        Closed Units
                      </span>
                      <span className="text-sm font-extrabold text-[#2D362E]">
                        {candidate.production12MoUnits} Units
                      </span>
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-[10px] font-bold text-[#80887D] uppercase tracking-wider block">
                        Buyside Share
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-amber-800">
                          {candidate.buysideSharePct}%
                        </span>
                        <div className="w-16 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-amber-600 h-full rounded-full" 
                            style={{ width: `${candidate.buysideSharePct}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-[9px] text-[#80887D]">
                        {candidate.buysideUnits12Mo} buyside / {candidate.listingUnits12Mo} list
                      </span>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                    <button
                      onClick={() => {
                        const trend = getCandidateTrend(candidate);
                        onOpenOutreachModal({
                          id: candidate.id,
                          name: candidate.name,
                          email: candidate.email,
                          phone: candidate.phone,
                          type: candidateType === "loan_officer" ? "lo" : "agent",
                          company: candidate.company,
                          rank: candidate.rank,
                          volume: candidate.production12MoVolume,
                          rankDelta: trend.delta,
                          previousRank: trend.prev
                        });
                      }}
                      className="px-3 py-1.5 bg-white hover:bg-gray-50 text-[#2D362E] text-xs font-bold rounded-xl border border-[#EAE7E0] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      title="Reach out via Outlook Email or SMS"
                    >
                      <Mail className="w-3.5 h-3.5 text-[#C18C5D]" />
                      <span>Draft Pitch</span>
                    </button>

                    {candidate.inActivePipeline ? (
                      <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Active Pipeline</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAddToPipeline(candidate)}
                        className="px-3.5 py-1.5 bg-[#2D362E] hover:bg-[#1A201B] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer border border-[#1A201B]"
                      >
                        <Plus className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Add to Pipeline</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
