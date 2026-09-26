import React, { useState, useMemo } from "react";
import { 
  Download, FileSpreadsheet, Check, Copy, X, Filter, Users, Target, 
  Building2, Sparkles, MapPin, CheckSquare, Square, Search, Link as LinkIcon, AlertCircle
} from "lucide-react";
import { LOPairing, LoanOfficerProfile } from "../types";
import { UnifiedAgentProfile } from "../utils/unifiedAgentRoster";
import { OREGON_CITIES, OREGON_COUNTIES } from "./ScrapeRealtorModal";

interface AgentRosterExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  masterAgentRoster: UnifiedAgentProfile[];
  currentFilteredAgents: UnifiedAgentProfile[];
  pairings: LOPairing[];
  loanOfficers: LoanOfficerProfile[];
  currentLo: LoanOfficerProfile;
  onTriggerToast: (msg: string) => void;
  initialExportMode?: "filtered" | "top50" | "all" | "scrapes" | "pairings";
}

export type ExportMode = "filtered" | "top50" | "all" | "scrapes" | "pairings";

const POPULAR_BROKERAGES = [
  "Keller Williams",
  "eXp Realty",
  "Coldwell Banker",
  "RE/MAX",
  "Windermere",
  "Compass",
  "Premiere Property Group",
  "Cascade Hasson Sotheby's",
  "John L. Scott",
  "Berkshire Hathaway"
];

export const AgentRosterExportModal: React.FC<AgentRosterExportModalProps> = ({
  isOpen,
  onClose,
  masterAgentRoster,
  currentFilteredAgents,
  pairings,
  loanOfficers,
  currentLo,
  onTriggerToast,
  initialExportMode = "filtered"
}) => {
  const [exportMode, setExportMode] = useState<ExportMode>(initialExportMode);
  
  // Scrapes & Bulk Filter options
  const [scrapeCity, setScrapeCity] = useState<string>("all");
  const [scrapeCounty, setScrapeCounty] = useState<string>("all");
  const [scrapeBrokerage, setScrapeBrokerage] = useState<string>("all");
  const [scrapeCustomBrokerage, setScrapeCustomBrokerage] = useState<string>("");
  const [scrapeKeyword, setScrapeKeyword] = useState<string>("");
  const [scrapeAgentType, setScrapeAgentType] = useState<string>("all");

  // Loan Officer column inclusion
  const [includeLoColumns, setIncludeLoColumns] = useState<boolean>(true);
  const [selectedLoId, setSelectedLoId] = useState<string>("all");

  // Copy feedback
  const [copied, setCopied] = useState<boolean>(false);

  // Origin for co-branded URLs
  const origin = useMemo(() => {
    let raw = typeof window !== "undefined" ? window.location.origin : "https://homereadypdx.com";
    if (raw.includes("ais-dev-")) {
      raw = raw.replace("ais-dev-", "ais-pre-");
    }
    return raw;
  }, []);

  // Compute Records to Export based on active mode & options
  const recordsToExport = useMemo(() => {
    // 1. LO + Agent Pairings Directory Mode
    if (exportMode === "pairings") {
      let filteredPairings = pairings || [];
      if (selectedLoId !== "all") {
        filteredPairings = filteredPairings.filter((p) => p.loId === selectedLoId);
      }

      return filteredPairings.map((pairing) => {
        const lo = loanOfficers.find((l) => l.id === pairing.loId) || currentLo;
        const agent = masterAgentRoster.find((a) => a.id === pairing.agentId) || {
          id: pairing.agentId,
          name: pairing.title.split("+")[1]?.trim() || "Realtor Partner",
          brokerage: "Premier Real Estate",
          email: "agent@brokerage.com",
          phone: "(503) 555-0199",
          licenseNumber: "OR Broker",
          isTop50: false
        } as UnifiedAgentProfile;

        return {
          agent,
          pairing,
          lo
        };
      });
    }

    // 2. Agent Pool Selection
    let baseList: UnifiedAgentProfile[] = [];

    if (exportMode === "filtered") {
      baseList = currentFilteredAgents;
    } else if (exportMode === "top50") {
      baseList = masterAgentRoster.filter((a) => a.isTop50);
    } else if (exportMode === "all") {
      baseList = masterAgentRoster;
    } else if (exportMode === "scrapes") {
      baseList = masterAgentRoster.filter((agent) => {
        // City match
        if (scrapeCity !== "all") {
          const c = scrapeCity.toLowerCase();
          const inCity = (agent.city || "").toLowerCase().includes(c) ||
            agent.areasServed?.some((area) => area.toLowerCase().includes(c)) ||
            agent.marketAreas?.some((area) => area.toLowerCase().includes(c));
          if (!inCity) return false;
        }

        // County match
        if (scrapeCounty !== "all") {
          const countyNeedle = scrapeCounty.toLowerCase();
          const inCounty = (agent.county || "").toLowerCase().includes(countyNeedle) ||
            agent.licensedCounties?.some((lc) => lc.toLowerCase().includes(countyNeedle)) ||
            agent.activeAdCounties?.some((ac) => ac.toLowerCase().includes(countyNeedle)) ||
            agent.areasServed?.some((area) => area.toLowerCase().includes(countyNeedle));
          if (!inCounty) return false;
        }

        // Brokerage / Company match
        const effectiveBrokerage = scrapeBrokerage === "custom" ? scrapeCustomBrokerage : scrapeBrokerage;
        if (effectiveBrokerage && effectiveBrokerage !== "all") {
          const bNeedle = effectiveBrokerage.toLowerCase();
          const matchesB = (agent.company || agent.brokerage || "").toLowerCase().includes(bNeedle);
          if (!matchesB) return false;
        }

        // Keyword match
        if (scrapeKeyword.trim()) {
          const kw = scrapeKeyword.toLowerCase();
          const matchesKw = agent.name.toLowerCase().includes(kw) ||
            (agent.company || agent.brokerage || "").toLowerCase().includes(kw) ||
            (agent.licenseNumber || "").toLowerCase().includes(kw) ||
            (agent.email || "").toLowerCase().includes(kw);
          if (!matchesKw) return false;
        }

        // Agent Type match
        if (scrapeAgentType !== "all") {
          if (agent.agentType !== scrapeAgentType) return false;
        }

        return true;
      });
    }

    // Filter by Loan Officer if selected and not in pairings mode
    if (selectedLoId !== "all" && exportMode !== "pairings") {
      baseList = baseList.filter((a) => 
        a.pairedLoIds?.includes(selectedLoId) || a.assignedLoIds?.includes(selectedLoId)
      );
    }

    return baseList.map((agent) => {
      // Find associated pairings
      const agentPairings = pairings.filter((p) => p.agentId === agent.id);
      const primaryPairing = agentPairings[0];
      const pairedLo = primaryPairing 
        ? loanOfficers.find((l) => l.id === primaryPairing.loId) || currentLo
        : (agent.pairedLoIds?.[0] ? loanOfficers.find((l) => l.id === agent.pairedLoIds?.[0]) : undefined);

      return {
        agent,
        pairing: primaryPairing,
        lo: pairedLo
      };
    });
  }, [
    exportMode, 
    pairings, 
    loanOfficers, 
    currentLo, 
    masterAgentRoster, 
    currentFilteredAgents, 
    scrapeCity, 
    scrapeCounty, 
    scrapeBrokerage, 
    scrapeCustomBrokerage, 
    scrapeKeyword, 
    scrapeAgentType, 
    selectedLoId
  ]);

  // Format Helper for CSV cell
  const escapeCsv = (val: any): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""').replace(/[\r\n]+/g, " ").trim();
    return `"${str}"`;
  };

  // Build CSV Output
  const generateCsvData = () => {
    const headers: string[] = [
      "Agent Full Name",
      "First Name",
      "Last Name",
      "Company / Brokerage",
      "Professional Title",
      "License Number",
      "License State",
      "Email Address",
      "Phone Number",
      "Primary City",
      "Market Areas / Counties",
      "Agent Classification",
      "Years Experience",
      "12Mo Production Units",
      "12Mo Production Volume ($)",
      "12Mo Buyside Units",
      "12Mo Buyside Volume ($)",
      "Buyside Share (%)",
      "Active Listings Count",
      "Is Top 50 State Agent",
      "Top 50 Rank",
      "Accolade / RealTrends Rank",
      "Origin Source",
      "Co-Branded Portal Landing Page URL"
    ];

    if (includeLoColumns || exportMode === "pairings") {
      headers.push(
        "Paired Loan Officer Name",
        "Loan Officer Title",
        "Loan Officer NMLS #",
        "Loan Officer Email",
        "Loan Officer Phone",
        "Pairing Title",
        "Pairing Custom Slug",
        "Pairing Status",
        "Co-Branded Portal Views",
        "Co-Branded Leads Captured"
      );
    }

    const rows = recordsToExport.map(({ agent, pairing, lo }) => {
      const nameParts = (agent.name || "").trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const coBrandSlug = `${(lo?.customSlug || currentLo.customSlug || "lo")}-and-${agent.customSlug || firstName.toLowerCase()}`;
      const coBrandUrl = `${origin}/first-time_homebuyer_portal/${coBrandSlug}`;

      const row: string[] = [
        escapeCsv(agent.name),
        escapeCsv(firstName),
        escapeCsv(lastName),
        escapeCsv(agent.company || agent.brokerage || "Premier Real Estate"),
        escapeCsv(agent.title || "Real Estate Broker"),
        escapeCsv(agent.licenseNumber || "OR Broker"),
        escapeCsv(agent.licenseStates?.[0] || "OR"),
        escapeCsv(agent.email || ""),
        escapeCsv(agent.phone || "(503) 555-0199"),
        escapeCsv(agent.city || agent.areasServed?.[0] || "Portland"),
        escapeCsv((agent.marketAreas || agent.areasServed || []).join("; ") || "Oregon Statewide"),
        escapeCsv(agent.agentType === "buyer_agent" ? "Buyer Specialist" : agent.agentType === "listing_agent" ? "Listing Specialist" : "Dual Agent"),
        escapeCsv(agent.yearsExperience || agent.experienceYears || 8),
        escapeCsv(agent.production12MoUnits || 38),
        escapeCsv(agent.production12MoVolume || 21500000),
        escapeCsv(agent.buysideUnits12Mo || 24),
        escapeCsv(agent.buysideVolume12Mo || 13500000),
        escapeCsv(agent.buysideSharePct || 62),
        escapeCsv(agent.activeListingsCount || 5),
        escapeCsv(agent.isTop50 ? "Yes" : "No"),
        escapeCsv(agent.top50Rank ? `#${agent.top50Rank}` : "N/A"),
        escapeCsv(agent.realTrendsRank || (agent.isTop50 ? `Top 50 Oregon Agent #${agent.top50Rank || 1}` : "Standard Roster")),
        escapeCsv(agent.sourceOrigin || (agent.isTop50 ? "Top 50 Sweep" : agent.id.includes("scraped") ? "AI Scraper" : "Master Roster")),
        escapeCsv(coBrandUrl)
      ];

      if (includeLoColumns || exportMode === "pairings") {
        row.push(
          escapeCsv(lo ? lo.name : (agent.pairedLoNames?.[0] || currentLo.name)),
          escapeCsv(lo ? lo.title : currentLo.title),
          escapeCsv(lo ? lo.nmlsId : currentLo.nmlsId),
          escapeCsv(lo ? lo.email : currentLo.email),
          escapeCsv(lo ? lo.phone : currentLo.phone),
          escapeCsv(pairing ? pairing.title : `${currentLo.name} + ${agent.name}`),
          escapeCsv(pairing ? pairing.customSlug : coBrandSlug),
          escapeCsv(pairing ? (pairing.active ? "Active" : "Paused") : (agent.isPaired ? "Paired" : "Unpaired")),
          escapeCsv(pairing?.totalViews || 0),
          escapeCsv(pairing?.totalLeads || 0)
        );
      }

      return row.join(",");
    });

    return [headers.join(","), ...rows].join("\r\n");
  };

  const handleDownloadCsv = () => {
    if (recordsToExport.length === 0) {
      onTriggerToast("⚠️ No agent records match your selected export criteria.");
      return;
    }

    const csvData = generateCsvData();
    // Prepend UTF-8 BOM so Excel properly opens special characters
    const blob = new Blob(["\uFEFF" + csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const dateStamp = new Date().toISOString().slice(0, 10);
    let filenameDescriptor = exportMode;
    if (exportMode === "scrapes") {
      const bDesc = scrapeBrokerage !== "all" ? (scrapeBrokerage === "custom" ? scrapeCustomBrokerage : scrapeBrokerage).toLowerCase().replace(/\s+/g, "_") : "";
      const cDesc = scrapeCity !== "all" ? scrapeCity.toLowerCase() : "";
      filenameDescriptor = [bDesc, cDesc, "scrapes"].filter(Boolean).join("_");
    }

    const fileName = `vantage_agent_roster_${filenameDescriptor}_${dateStamp}.csv`;

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    onTriggerToast(`✅ Successfully exported ${recordsToExport.length} agent(s) to ${fileName}!`);
    onClose();
  };

  const handleCopyCsv = () => {
    if (recordsToExport.length === 0) {
      onTriggerToast("⚠️ No agent records match your selected export criteria.");
      return;
    }

    const csvData = generateCsvData();
    navigator.clipboard.writeText(csvData);
    setCopied(true);
    onTriggerToast(`📋 Copied ${recordsToExport.length} agent CSV records to clipboard!`);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 border border-[#EAE7E0] shadow-2xl animate-in zoom-in-95 duration-150 text-[#2D362E] max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-[#EAE7E0] pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800 shadow-xs shrink-0">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-xl text-[#2D362E]">
                  Export Agent Roster & Partnerships to CSV
                </h3>
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
                  CRM Ready
                </span>
              </div>
              <p className="text-xs text-[#606C5D] mt-0.5">
                Download filtered agent directories for use in Salesforce, HubSpot, Follow Up Boss, KVCore, Lofty, or Excel.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-[#FAF9F5] rounded-xl text-[#9A9488] hover:text-[#2D362E] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto space-y-5 pr-1 text-xs">
          
          {/* 1. EXPORT SCOPE SELECTION */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#2D362E] flex items-center justify-between">
              <span>Select Export Scope & Dataset:</span>
              <span className="text-emerald-700 font-extrabold">{recordsToExport.length} Agents Selected</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {/* Option A: Current Filtered List */}
              <button
                type="button"
                onClick={() => setExportMode("filtered")}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  exportMode === "filtered"
                    ? "bg-emerald-50/70 border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs"
                    : "bg-[#FAF9F5] border-[#EAE7E0] hover:bg-[#F4F1EA]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#2D362E]">
                    <Filter className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Current Filtered List</span>
                  </div>
                  <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-full border border-[#EAE7E0]">
                    {currentFilteredAgents.length}
                  </span>
                </div>
                <p className="text-[11px] text-[#606C5D]">
                  Active dashboard search query, agent category, & active LO filters.
                </p>
              </button>

              {/* Option B: Top 50 State Recruits */}
              <button
                type="button"
                onClick={() => setExportMode("top50")}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  exportMode === "top50"
                    ? "bg-amber-50/70 border-amber-500 ring-2 ring-amber-500/20 shadow-xs"
                    : "bg-[#FAF9F5] border-[#EAE7E0] hover:bg-[#F4F1EA]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#2D362E]">
                    <Target className="w-3.5 h-3.5 text-amber-600" />
                    <span>Top 50 State Recruits</span>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200">
                    {masterAgentRoster.filter((a) => a.isTop50).length}
                  </span>
                </div>
                <p className="text-[11px] text-[#606C5D]">
                  Verified Top 50 Oregon producing agents with ranks, volume, & units.
                </p>
              </button>

              {/* Option C: Complete Master Agent Roster */}
              <button
                type="button"
                onClick={() => setExportMode("all")}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  exportMode === "all"
                    ? "bg-emerald-50/70 border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs"
                    : "bg-[#FAF9F5] border-[#EAE7E0] hover:bg-[#F4F1EA]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#2D362E]">
                    <Users className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Complete Master Roster</span>
                  </div>
                  <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-full border border-[#EAE7E0]">
                    {masterAgentRoster.length}
                  </span>
                </div>
                <p className="text-[11px] text-[#606C5D]">
                  Every agent brought into the system via sweeps, scrapes, or manual cards.
                </p>
              </button>

              {/* Option D: Bulk Scrapes & Custom Search Filter */}
              <button
                type="button"
                onClick={() => setExportMode("scrapes")}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  exportMode === "scrapes"
                    ? "bg-purple-50/70 border-purple-500 ring-2 ring-purple-500/20 shadow-xs"
                    : "bg-[#FAF9F5] border-[#EAE7E0] hover:bg-[#F4F1EA]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#2D362E]">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>Bulk Scrapes & Filters</span>
                  </div>
                  <span className="text-[10px] font-bold bg-purple-100 text-purple-900 px-2 py-0.5 rounded-full border border-purple-200">
                    Custom
                  </span>
                </div>
                <p className="text-[11px] text-[#606C5D]">
                  Export by City, County, Brokerage (e.g. Keller Williams), or keyword.
                </p>
              </button>

              {/* Option E: LO + Agent Pairs Directory */}
              <button
                type="button"
                onClick={() => {
                  setExportMode("pairings");
                  setIncludeLoColumns(true);
                }}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  exportMode === "pairings"
                    ? "bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-xs"
                    : "bg-[#FAF9F5] border-[#EAE7E0] hover:bg-[#F4F1EA]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#2D362E]">
                    <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
                    <span>LO + Agent Pairs View</span>
                  </div>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full border border-blue-200">
                    {pairings.length} Pairs
                  </span>
                </div>
                <p className="text-[11px] text-[#606C5D]">
                  One row per active partnership with Loan Officer Name & co-branded URLs.
                </p>
              </button>
            </div>
          </div>

          {/* 2. BULK SCRAPES FILTER CONTROLS (Displayed when 'scrapes' mode is active) */}
          {exportMode === "scrapes" && (
            <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#EAE7E0] space-y-3.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#2D362E] flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  <span>Bulk Scrape & Filter Criteria (City, County, Brokerage):</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setScrapeCity("all");
                    setScrapeCounty("all");
                    setScrapeBrokerage("all");
                    setScrapeCustomBrokerage("");
                    setScrapeKeyword("");
                    setScrapeAgentType("all");
                  }}
                  className="text-[11px] text-[#7D8877] hover:text-[#2D362E] underline"
                >
                  Reset Criteria
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Filter: City */}
                <div>
                  <label className="text-[11px] font-bold text-[#606C5D] block mb-1">City Filter:</label>
                  <select
                    value={scrapeCity}
                    onChange={(e) => setScrapeCity(e.target.value)}
                    className="w-full bg-white border border-[#EAE7E0] rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#2D362E] focus:outline-none focus:border-purple-600"
                  >
                    <option value="all">All Oregon Cities</option>
                    {OREGON_CITIES.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* Filter: County */}
                <div>
                  <label className="text-[11px] font-bold text-[#606C5D] block mb-1">County Filter:</label>
                  <select
                    value={scrapeCounty}
                    onChange={(e) => setScrapeCounty(e.target.value)}
                    className="w-full bg-white border border-[#EAE7E0] rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#2D362E] focus:outline-none focus:border-purple-600"
                  >
                    <option value="all">All Oregon Counties</option>
                    {OREGON_COUNTIES.map((county) => (
                      <option key={county} value={county}>{county} County</option>
                    ))}
                  </select>
                </div>

                {/* Filter: Agent Type */}
                <div>
                  <label className="text-[11px] font-bold text-[#606C5D] block mb-1">Agent Specialization:</label>
                  <select
                    value={scrapeAgentType}
                    onChange={(e) => setScrapeAgentType(e.target.value)}
                    className="w-full bg-white border border-[#EAE7E0] rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#2D362E] focus:outline-none focus:border-purple-600"
                  >
                    <option value="all">All Agent Roles</option>
                    <option value="buyer_agent">Buyer Specialists Only</option>
                    <option value="listing_agent">Listing Specialists Only</option>
                    <option value="dual_agent">Dual / Full Service Only</option>
                  </select>
                </div>
              </div>

              {/* Real Estate Company / Brokerage Selector */}
              <div>
                <label className="text-[11px] font-bold text-[#606C5D] block mb-1">
                  Real Estate Company / Brokerage Name:
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setScrapeBrokerage("all");
                      setScrapeCustomBrokerage("");
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      scrapeBrokerage === "all"
                        ? "bg-[#2D362E] text-white"
                        : "bg-white text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F4F1EA]"
                    }`}
                  >
                    All Brokerages
                  </button>
                  {POPULAR_BROKERAGES.map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => {
                        setScrapeBrokerage(b);
                        setScrapeCustomBrokerage("");
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        scrapeBrokerage === b
                          ? "bg-purple-600 text-white shadow-2xs"
                          : "bg-white text-[#606C5D] border border-[#EAE7E0] hover:bg-purple-50"
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setScrapeBrokerage("custom")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      scrapeBrokerage === "custom"
                        ? "bg-purple-600 text-white shadow-2xs"
                        : "bg-white text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F4F1EA]"
                    }`}
                  >
                    Custom Brokerage...
                  </button>
                </div>

                {scrapeBrokerage === "custom" && (
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="e.g. Keller Williams Sunset Corridor, John L Scott Bend..."
                      value={scrapeCustomBrokerage}
                      onChange={(e) => setScrapeCustomBrokerage(e.target.value)}
                      className="w-full bg-white border border-[#EAE7E0] rounded-xl px-3 py-1.5 text-xs text-[#2D362E] focus:outline-none focus:border-purple-600"
                    />
                  </div>
                )}
              </div>

              {/* Freeform Search Query */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9488]" />
                <input
                  type="text"
                  placeholder="Filter further by Agent Name, License #, or Email..."
                  value={scrapeKeyword}
                  onChange={(e) => setScrapeKeyword(e.target.value)}
                  className="w-full bg-white border border-[#EAE7E0] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#2D362E] focus:outline-none focus:border-purple-600"
                />
              </div>
            </div>
          )}

          {/* 3. LOAN OFFICER COLUMN & PAIRING OPTIONS */}
          <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#EAE7E0] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label 
                className="flex items-center gap-2 cursor-pointer font-bold text-xs text-[#2D362E] select-none"
                onClick={() => setIncludeLoColumns(!includeLoColumns)}
              >
                {includeLoColumns || exportMode === "pairings" ? (
                  <CheckSquare className="w-4 h-4 text-emerald-700 shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-[#9A9488] shrink-0" />
                )}
                <span>Include Loan Officer Details in CSV Columns</span>
                <span className="text-[10px] font-normal text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-1.5 py-0.5 rounded">
                  Recommended for CRM Imports
                </span>
              </label>

              {/* Filter by Specific LO */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#7D8877] uppercase">Loan Officer:</span>
                <select
                  value={selectedLoId}
                  onChange={(e) => setSelectedLoId(e.target.value)}
                  className="bg-white border border-[#EAE7E0] rounded-xl px-2.5 py-1 text-xs font-semibold text-[#2D362E] focus:outline-none focus:border-emerald-600"
                >
                  <option value="all">All Loan Officers ({loanOfficers.length})</option>
                  {loanOfficers.map((lo) => (
                    <option key={lo.id} value={lo.id}>{lo.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-[11px] text-[#606C5D] leading-relaxed">
              When checked, the CSV will include dedicated columns for <strong>Paired Loan Officer Name</strong>, <strong>LO NMLS #</strong>, <strong>LO Email & Phone</strong>, <strong>Pairing Title</strong>, and <strong>Direct Co-Branded Portal Landing Page URL</strong> so loan officers can map relationships directly into CRM partner fields.
            </p>
          </div>

          {/* 4. DATA PREVIEW TABLE */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#2D362E]">
                Export Preview (First 3 of {recordsToExport.length} Records):
              </span>
              <span className="text-[10px] text-[#7D8877]">
                Format: UTF-8 CSV (RFC 4180) with Excel BOM
              </span>
            </div>

            {recordsToExport.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-[#EAE7E0] bg-white">
                <table className="w-full text-[11px] text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FAF9F5] border-b border-[#EAE7E0] text-[#7D8877] font-bold">
                      <th className="p-2.5">Agent Name</th>
                      <th className="p-2.5">Brokerage</th>
                      <th className="p-2.5">License #</th>
                      <th className="p-2.5">City / County</th>
                      <th className="p-2.5">12Mo Vol / Units</th>
                      <th className="p-2.5">Top 50</th>
                      {(includeLoColumns || exportMode === "pairings") && (
                        <th className="p-2.5 bg-blue-50/50 text-blue-900">Paired LO</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE7E0]">
                    {recordsToExport.slice(0, 3).map(({ agent, lo }, idx) => (
                      <tr key={agent.id + idx} className="hover:bg-[#FAF9F5]">
                        <td className="p-2.5 font-bold text-[#2D362E] whitespace-nowrap">
                          {agent.name}
                        </td>
                        <td className="p-2.5 text-[#606C5D] whitespace-nowrap">
                          {agent.company || agent.brokerage}
                        </td>
                        <td className="p-2.5 text-[#7D8877] whitespace-nowrap">
                          {agent.licenseNumber || "OR Broker"}
                        </td>
                        <td className="p-2.5 text-[#606C5D] whitespace-nowrap">
                          {agent.city || agent.areasServed?.[0] || "Portland"}
                        </td>
                        <td className="p-2.5 text-emerald-700 font-semibold whitespace-nowrap">
                          ${((agent.production12MoVolume || 21500000) / 1000000).toFixed(1)}M ({agent.production12MoUnits || 38})
                        </td>
                        <td className="p-2.5 whitespace-nowrap">
                          {agent.isTop50 ? (
                            <span className="text-[10px] font-extrabold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
                              #{agent.top50Rank || "Top50"}
                            </span>
                          ) : (
                            <span className="text-[#9A9488]">No</span>
                          )}
                        </td>
                        {(includeLoColumns || exportMode === "pairings") && (
                          <td className="p-2.5 bg-blue-50/30 text-blue-900 font-semibold whitespace-nowrap">
                            {lo?.name || agent.pairedLoNames?.[0] || currentLo.name}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-[#FAF9F5] p-6 rounded-2xl border border-dashed border-[#EAE7E0] text-center space-y-1">
                <AlertCircle className="w-5 h-5 text-amber-500 mx-auto" />
                <p className="font-bold text-xs text-[#2D362E]">No records match your selected criteria.</p>
                <p className="text-[11px] text-[#606C5D]">Try adjusting your city, county, or brokerage filter.</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="pt-4 border-t border-[#EAE7E0] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-[#606C5D]">
            <span>Ready to export: </span>
            <strong className="text-[#2D362E]">{recordsToExport.length} Agent Records</strong>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopyCsv}
              disabled={recordsToExport.length === 0}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-[#FAF9F5] hover:bg-[#F4F1EA] text-[#2D362E] border border-[#EAE7E0] rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
              title="Copy CSV text to clipboard to paste into Google Sheets or Excel"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied!" : "Copy to Clipboard"}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadCsv}
              disabled={recordsToExport.length === 0}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-transform active:scale-95 disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-amber-200" />
              <span>Download .CSV File ({recordsToExport.length})</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
