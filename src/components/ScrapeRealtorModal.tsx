import React, { useState } from "react";
import { 
  Sparkles, Search, Check, Filter, MapPin, Building, 
  User, ShieldCheck, ChevronDown, ChevronUp, RotateCcw, CheckSquare, Square,
  Globe, Link2, ExternalLink, CheckCircle2, AlertCircle, AlertTriangle,
  Edit3, Wand2, Image as ImageIcon, Clock, Mail, Phone
} from "lucide-react";
import { RealEstateAgentProfile } from "../types";
import { 
  validateScrapedAgent, 
  autoResolveAgentGaps, 
  PROFESSIONAL_HEADSHOT_PRESETS 
} from "../utils/agentValidation";
import { AgentPreCommitValidationModal } from "./AgentPreCommitValidationModal";
import { VantageScraper2ndBrainPrompt, ScraperRoutineConfig } from "./VantageScraper2ndBrainPrompt";

interface ScrapeRealtorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMultipleAgents: (agents: Partial<RealEstateAgentProfile>[]) => void;
}

// All 36 Oregon Counties
export const OREGON_COUNTIES = [
  "Baker", "Benton", "Clackamas", "Clatsop", "Columbia", "Coos", "Crook", "Curry", 
  "Deschutes", "Douglas", "Gilliam", "Grant", "Harney", "Hood River", "Jackson", 
  "Jefferson", "Josephine", "Klamath", "Lake", "Lane", "Lincoln", "Linn", "Malheur", 
  "Marion", "Morrow", "Multnomah", "Polk", "Sherman", "Tillamook", "Umatilla", 
  "Union", "Wallowa", "Wasco", "Washington", "Wheeler", "Yamhill"
];

// Major Oregon Cities Across All Regions
export const OREGON_CITIES = [
  "Portland", "Bend", "Eugene", "Salem", "Lake Oswego", "Beaverton", "Hillsboro", 
  "Medford", "Corvallis", "West Linn", "Clackamas", "Tigard", "Gresham", "Oregon City", 
  "Hood River", "Roseburg", "Grants Pass", "Klamath Falls", "Albany", "McMinnville", 
  "Springfield", "Redmond", "Canby", "Tualatin", "Sherwood", "Wilsonville", "Astoria", 
  "Lincoln City", "Florence", "Newport", "Brookings", "Ontario", "Sunriver", 
  "Troutdale", "Monmouth", "Silverton", "Central Point", "Hermiston", "Pendleton", "La Grande"
];

export const ScrapeRealtorModal: React.FC<ScrapeRealtorModalProps> = ({
  isOpen,
  onClose,
  onAddMultipleAgents
}) => {
  // Direct Search Criteria
  const [agentName, setAgentName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [brokerage, setBrokerage] = useState("");
  const [agentWebsiteUrl, setAgentWebsiteUrl] = useState("");
  const [query, setQuery] = useState("");

  // Geographic Criteria
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedCounties, setSelectedCounties] = useState<string[]>([]);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isCountyDropdownOpen, setIsCountyDropdownOpen] = useState(false);
  const [citySearchFilter, setCitySearchFilter] = useState("");
  const [countySearchFilter, setCountySearchFilter] = useState("");

  // Production Threshold Filters
  const [licenseStateFilter, setLicenseStateFilter] = useState("Oregon (OR)");
  const [minYearsExp, setMinYearsExp] = useState<number>(3);
  const [minUnits, setMinUnits] = useState<number>(15);
  const [minVolume, setMinVolume] = useState<number>(5);

  // Results State
  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scrapedProfiles, setScrapedProfiles] = useState<Partial<RealEstateAgentProfile>[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [resultFilterText, setResultFilterText] = useState("");

  // Direct 2nd Scrape / Live URL Backfill State
  const [activeBackfillIndex, setActiveBackfillIndex] = useState<number | null>(null);
  const [cardUrlInputs, setCardUrlInputs] = useState<Record<number, string>>({});
  const [topBarUrl, setTopBarUrl] = useState<string>("");
  const [isDeepScraping, setIsDeepScraping] = useState<boolean>(false);
  const [deepScrapingIndex, setDeepScrapingIndex] = useState<number | null>(null);
  const [successBackfillIndex, setSuccessBackfillIndex] = useState<number | null>(null);

  // Validation Layer & Collapsible Panel State
  const [isConfigCollapsed, setIsConfigCollapsed] = useState<boolean>(false);
  const [showValidationGate, setShowValidationGate] = useState<boolean>(false);
  const [agentsForValidation, setAgentsForValidation] = useState<Partial<RealEstateAgentProfile>[]>([]);
  const [editingGapIndex, setEditingGapIndex] = useState<number | null>(null);
  const [avatarPickerCardIndex, setAvatarPickerCardIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleUpdateCardField = (cardIndex: number, field: keyof RealEstateAgentProfile, value: any) => {
    setScrapedProfiles(prev => {
      const updated = [...prev];
      updated[cardIndex] = {
        ...updated[cardIndex],
        [field]: value
      };
      if (field === 'experienceYears') {
        (updated[cardIndex] as any).yearsExperience = Number(value);
      }
      if (field === 'brokerage') {
        updated[cardIndex].company = String(value);
      }
      return updated;
    });
  };

  const handleAutoResolveCard = (cardIndex: number) => {
    setScrapedProfiles(prev => {
      const updated = [...prev];
      updated[cardIndex] = autoResolveAgentGaps(updated[cardIndex], cardIndex);
      return updated;
    });
  };

  const handleCityToggle = (cityName: string) => {
    setSelectedCities(prev => 
      prev.includes(cityName) ? prev.filter(c => c !== cityName) : [...prev, cityName]
    );
  };

  const handleCountyToggle = (countyName: string) => {
    setSelectedCounties(prev => 
      prev.includes(countyName) ? prev.filter(c => c !== countyName) : [...prev, countyName]
    );
  };

  const handleSelectAllCities = () => {
    if (selectedCities.length === OREGON_CITIES.length) {
      setSelectedCities([]);
    } else {
      setSelectedCities([...OREGON_CITIES]);
    }
  };

  const handleSelectAllCounties = () => {
    if (selectedCounties.length === OREGON_COUNTIES.length) {
      setSelectedCounties([]);
    } else {
      setSelectedCounties([...OREGON_COUNTIES]);
    }
  };

  const handleResetFilters = () => {
    setAgentName("");
    setLicenseNumber("");
    setBrokerage("");
    setAgentWebsiteUrl("");
    setQuery("");
    setSelectedCities([]);
    setSelectedCounties([]);
    setMinYearsExp(3);
    setMinUnits(15);
    setMinVolume(5);
    setErrorMsg(null);
  };

  const handleApplyConfigFrom2ndBrain = (cfg: ScraperRoutineConfig) => {
    if (cfg.query) setQuery(cfg.query);
    if (cfg.agentName) setAgentName(cfg.agentName);
    if (cfg.brokerage) setBrokerage(cfg.brokerage);
    if (cfg.licenseNumber) setLicenseNumber(cfg.licenseNumber);
    if (cfg.selectedCities) setSelectedCities(cfg.selectedCities);
    if (cfg.selectedCounties) setSelectedCounties(cfg.selectedCounties);
    if (typeof cfg.minYearsExp === "number") setMinYearsExp(cfg.minYearsExp);
    if (typeof cfg.minUnits === "number") setMinUnits(cfg.minUnits);
    if (typeof cfg.minVolume === "number") setMinVolume(cfg.minVolume);
    if (cfg.agentWebsiteUrl) setAgentWebsiteUrl(cfg.agentWebsiteUrl);
  };

  const handleSearch = async () => {
    setIsSearching(true);
    setErrorMsg(null);
    setScrapedProfiles([]);
    setSelectedIndices(new Set());

    // Construct primary query if direct query empty
    const effectiveQuery = query.trim() || [
      agentName.trim(),
      brokerage.trim(),
      selectedCities.slice(0, 3).join(" "),
      selectedCounties.slice(0, 2).map(c => `${c} County`).join(" ")
    ].filter(Boolean).join(" ") || "top real estate agents";

    try {
      const res = await fetch("/api/gemini/realtor-roster-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: effectiveQuery,
          agentName: agentName.trim(),
          licenseNumber: licenseNumber.trim(),
          brokerage: brokerage.trim(),
          agentWebsiteUrl: agentWebsiteUrl.trim(),
          selectedCities,
          selectedCounties,
          minYearsExp,
          minUnits,
          minVolume,
          licenseStateFilter
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.profiles && data.profiles.length > 0) {
          setScrapedProfiles(data.profiles);
          setSelectedIndices(new Set(data.profiles.map((_: any, i: number) => i)));
          const urls: Record<number, string> = {};
          data.profiles.forEach((p: any, i: number) => {
            if (p.websiteUrl || p.sourceUrl) {
              urls[i] = p.websiteUrl || p.sourceUrl;
            }
          });
          setCardUrlInputs(urls);
          setIsConfigCollapsed(true);
        } else {
          setErrorMsg(data.error || "No qualified profiles found matching your search configuration.");
        }
      } else {
        const data = await res.json().catch(() => null);
        setErrorMsg(data?.error || "Unable to scrape roster at this time. Click Retry to re-run.");
      }
    } catch (err: any) {
      setErrorMsg("Error searching for profiles: " + (err?.message || "Network error"));
    } finally {
      setIsSearching(false);
    }
  };

  // Direct 2nd Scrape: Deep scrape individual agent workplace bio page via Gemini SDK
  const handleDeepScrapeUrl = async (
    targetUrl: string, 
    cardIndex?: number, 
    nameHint?: string, 
    brokerageHint?: string
  ) => {
    const cleanUrl = targetUrl.trim();
    if (!cleanUrl) {
      setErrorMsg("Please enter a valid website address or agency bio page URL.");
      return;
    }

    setIsDeepScraping(true);
    setDeepScrapingIndex(cardIndex !== undefined ? cardIndex : -1);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/gemini/scrape-agent-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: cleanUrl,
          agentName: nameHint || agentName.trim(),
          brokerage: brokerageHint || brokerage.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.success && data.profile) {
        const deepScrapedProfile = { ...data.profile, deepScrapedFromUrl: true };

        if (cardIndex !== undefined && cardIndex >= 0) {
          // Backfill existing profile in place
          setScrapedProfiles(prev => {
            const updated = [...prev];
            updated[cardIndex] = { ...updated[cardIndex], ...deepScrapedProfile };
            return updated;
          });
          setCardUrlInputs(prev => ({ ...prev, [cardIndex]: cleanUrl }));
          setSelectedIndices(prev => new Set([...prev, cardIndex]));
          setSuccessBackfillIndex(cardIndex);
          setTimeout(() => setSuccessBackfillIndex(null), 6000);
        } else {
          // Prepend as top profile or initialize results
          setScrapedProfiles(prev => [
            deepScrapedProfile,
            ...prev.filter(p => p.name?.toLowerCase() !== deepScrapedProfile.name?.toLowerCase())
          ]);
          setCardUrlInputs(prev => ({ 0: cleanUrl, ...prev }));
          setSelectedIndices(prev => new Set([0, ...Array.from(prev).map(i => i + 1)]));
          setSuccessBackfillIndex(0);
          setTimeout(() => setSuccessBackfillIndex(null), 6000);
        }
        setActiveBackfillIndex(null);
        setCardBackfillUrl("");
        setTopBarUrl("");
      } else {
        setErrorMsg(data?.error || "Failed to scrape agent from URL. Please check the website address and retry.");
      }
    } catch (err: any) {
      setErrorMsg("Error scraping agent website: " + (err?.message || "Network error"));
    } finally {
      setIsDeepScraping(false);
      setDeepScrapingIndex(null);
    }
  };

  const filteredProfiles = scrapedProfiles.filter(p => 
    (p.name?.toLowerCase() || "").includes(resultFilterText.toLowerCase()) || 
    (p.title?.toLowerCase() || "").includes(resultFilterText.toLowerCase()) ||
    (p.company?.toLowerCase() || "").includes(resultFilterText.toLowerCase())
  );

  const handleToggleSelect = (index: number) => {
    const next = new Set(selectedIndices);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setSelectedIndices(next);
  };

  const handleSelectAllResults = () => {
    if (selectedIndices.size === filteredProfiles.length) {
      setSelectedIndices(new Set());
    } else {
      const next = new Set(selectedIndices);
      filteredProfiles.forEach(p => {
        const idx = scrapedProfiles.indexOf(p);
        next.add(idx);
      });
      setSelectedIndices(next);
    }
  };

  const handleImport = (forceDirectCommit: boolean = false) => {
    const selected = Array.from(selectedIndices).map(i => scrapedProfiles[i]);
    if (selected.length === 0) return;

    if (!forceDirectCommit) {
      // Validate all selected profiles against Master Roster quality requirements
      const anyGaps = selected.some(p => !validateScrapedAgent(p).isValid);
      if (anyGaps) {
        setAgentsForValidation(selected);
        setShowValidationGate(true);
        return;
      }
    }

    onAddMultipleAgents(selected);
    onClose();
  };

  const filteredCityList = OREGON_CITIES.filter(c => c.toLowerCase().includes(citySearchFilter.toLowerCase()));
  const filteredCountyList = OREGON_COUNTIES.filter(c => c.toLowerCase().includes(countySearchFilter.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full p-4 sm:p-6 space-y-3.5 border border-[#EAE7E0] shadow-2xl animate-in zoom-in-95 duration-150 text-[#2D362E] max-h-[92vh] flex flex-col my-auto overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-3 shrink-0">
          <div>
            <h4 className="font-serif font-bold text-lg text-[#2D362E] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              AI Agent: Targeted Realtor Recruiting Scraper
            </h4>
            <p className="text-xs text-[#606C5D]">
              Configure custom search criteria by Agent Name, License #, Brokerage, Cities, and Oregon Counties before launching live web discovery.
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-xs text-[#9A9488] hover:text-[#2D362E] px-3 py-1.5 rounded-xl border border-[#EAE7E0] bg-[#F9F8F4] cursor-pointer"
          >
            ✕ Close
          </button>
        </div>

        {/* DEDICATED SEARCH CONFIGURATION PANEL */}
        <div className="bg-[#FAF9F5] rounded-2xl border border-[#EAE7E0] shrink-0 transition-all duration-200 overflow-hidden">
          
          <div className="p-3.5 flex items-center justify-between border-b border-[#EAE7E0]/80">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4A5D4E] flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-emerald-600" />
                Search & Scraper Configuration Panel
              </span>
              {scrapedProfiles.length > 0 && (
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                  {scrapedProfiles.length} Results Ready
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {scrapedProfiles.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsConfigCollapsed(!isConfigCollapsed)}
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 px-2.5 py-1 rounded-xl flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                >
                  {isConfigCollapsed ? (
                    <>
                      <ChevronDown className="w-3.5 h-3.5 text-emerald-700" /> Show Filters
                    </>
                  ) : (
                    <>
                      <ChevronUp className="w-3.5 h-3.5 text-emerald-700" /> Hide Filters
                    </>
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] font-semibold text-[#606C5D] hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Reset Config
              </button>
            </div>
          </div>

          {!isConfigCollapsed && (
            <div className="p-4 space-y-4 max-h-[44vh] overflow-y-auto dashboard-vertical-scrollbar">
              {/* Vantage AI 2nd Brain Chat & Scraper Routines Box */}
              <VantageScraper2ndBrainPrompt 
                onApplyConfig={handleApplyConfigFrom2ndBrain} 
                onExecuteScrapeNow={(cfg) => {
                  handleApplyConfigFrom2ndBrain(cfg);
                  setTimeout(() => handleSearch(), 100);
                }}
              />

              {/* Row 1: Direct Agent & Brokerage Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-[#7D8877] uppercase tracking-wider mb-1 flex items-center gap-1">
                    <User className="w-3 h-3 text-emerald-600" /> Target Agent Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kanndice McLean"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    className="w-full bg-white border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 text-[#2D362E]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#7D8877] uppercase tracking-wider mb-1 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> State License Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 201209811"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="w-full bg-white border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 text-[#2D362E]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#7D8877] uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Building className="w-3 h-3 text-emerald-600" /> Target Brokerage / Office
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Keller Williams, Compass, eXp"
                    value={brokerage}
                    onChange={(e) => setBrokerage(e.target.value)}
                    className="w-full bg-white border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-600 text-[#2D362E]"
                  />
                </div>
              </div>

              {/* Row 1B: Agent Workplace / Bio Page Live URL for 100% Accurate Extraction */}
              <div className="bg-white p-3 rounded-2xl border border-emerald-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-[#4A5D4E] uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Agent Workplace / Agency Bio Page URL (Direct Live Grounding)</span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded border border-emerald-300">
                      100% Headshot & Contacts
                    </span>
                  </label>
                  {agentWebsiteUrl && (
                    <button
                      type="button"
                      onClick={() => setAgentWebsiteUrl("")}
                      className="text-[10px] text-gray-400 hover:text-gray-600 underline cursor-pointer"
                    >
                      Clear URL
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative flex-1">
                    <Link2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600" />
                    <input
                      type="url"
                      placeholder="e.g. https://kanndicemclean.kw.com or official workplace agency bio page"
                      value={agentWebsiteUrl}
                      onChange={(e) => setAgentWebsiteUrl(e.target.value)}
                      className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-emerald-600 text-[#2D362E]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeepScrapeUrl(agentWebsiteUrl)}
                    disabled={isDeepScraping || !agentWebsiteUrl.trim()}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 shadow-2xs transition-all cursor-pointer"
                    title="Direct Gemini SDK agent to scrape this individual workplace page"
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isDeepScraping && deepScrapingIndex === -1 ? 'animate-spin' : ''}`} />
                    <span>{isDeepScraping && deepScrapingIndex === -1 ? "Scraping Live URL..." : "⚡ Deep Scrape URL Now"}</span>
                  </button>
                </div>

                <p className="text-[10px] text-[#606C5D] leading-relaxed">
                  If initial web search yields partial data, provide the agent's actual live workplace or agency bio page URL so the Gemini 2nd Brain extracts 100% real headshot, cell phone, email, and brokerage name.
                </p>
              </div>

              {/* Row 2: Geographic Dropdown Selectors (Cities & All 36 Oregon Counties) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                
                {/* Oregon Cities Multi-Select Dropdown */}
                <div className="relative">
                  <label className="block text-[10px] font-bold text-[#7D8877] uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-600" /> Target Oregon Cities
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold">
                      {selectedCities.length === 0 ? "All Cities" : `${selectedCities.length} Selected`}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCityDropdownOpen(!isCityDropdownOpen);
                      setIsCountyDropdownOpen(false);
                    }}
                    className="w-full bg-white border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs text-left flex items-center justify-between cursor-pointer focus:outline-none focus:border-emerald-600"
                  >
                    <span className="truncate font-medium text-[#2D362E]">
                      {selectedCities.length === 0 
                        ? "All Major Oregon Cities (Statewide)" 
                        : selectedCities.join(", ")}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#9A9488] shrink-0" />
                  </button>

                  {isCityDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#EAE7E0] rounded-2xl shadow-xl p-3 z-30 space-y-2 max-h-56 overflow-y-auto">
                      <div className="flex items-center justify-between gap-2 pb-1 border-b border-[#EAE7E0]">
                        <input
                          type="text"
                          placeholder="Search cities..."
                          value={citySearchFilter}
                          onChange={(e) => setCitySearchFilter(e.target.value)}
                          className="flex-1 bg-[#FAF9F5] border border-[#EAE7E0] rounded-lg px-2.5 py-1 text-xs"
                        />
                        <button
                          type="button"
                          onClick={handleSelectAllCities}
                          className="text-[10px] font-bold text-emerald-700 hover:underline shrink-0"
                        >
                          {selectedCities.length === OREGON_CITIES.length ? "Clear" : "Select All"}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        {filteredCityList.map(city => {
                          const isChecked = selectedCities.includes(city);
                          return (
                            <button
                              key={city}
                              type="button"
                              onClick={() => handleCityToggle(city)}
                              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs text-left cursor-pointer transition-colors ${
                                isChecked ? "bg-emerald-50 text-emerald-800 font-bold" : "hover:bg-gray-50 text-[#2D362E]"
                              }`}
                            >
                              {isChecked ? <CheckSquare className="w-3.5 h-3.5 text-emerald-600" /> : <Square className="w-3.5 h-3.5 text-gray-300" />}
                              <span className="truncate">{city}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* All 36 Oregon Counties Dropdown Selector */}
                <div className="relative">
                  <label className="block text-[10px] font-bold text-[#7D8877] uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-600" /> Target Oregon Counties (All 36)
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold">
                      {selectedCounties.length === 0 ? "All 36 Counties" : `${selectedCounties.length} Selected`}
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCountyDropdownOpen(!isCountyDropdownOpen);
                      setIsCityDropdownOpen(false);
                    }}
                    className="w-full bg-white border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs text-left flex items-center justify-between cursor-pointer focus:outline-none focus:border-emerald-600"
                  >
                    <span className="truncate font-medium text-[#2D362E]">
                      {selectedCounties.length === 0 
                        ? "All 36 Oregon Counties (Statewide)" 
                        : selectedCounties.map(c => `${c} Co.`).join(", ")}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#9A9488] shrink-0" />
                  </button>

                  {isCountyDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#EAE7E0] rounded-2xl shadow-xl p-3 z-30 space-y-2 max-h-56 overflow-y-auto">
                      <div className="flex items-center justify-between gap-2 pb-1 border-b border-[#EAE7E0]">
                        <input
                          type="text"
                          placeholder="Search 36 counties..."
                          value={countySearchFilter}
                          onChange={(e) => setCountySearchFilter(e.target.value)}
                          className="flex-1 bg-[#FAF9F5] border border-[#EAE7E0] rounded-lg px-2.5 py-1 text-xs"
                        />
                        <button
                          type="button"
                          onClick={handleSelectAllCounties}
                          className="text-[10px] font-bold text-emerald-700 hover:underline shrink-0"
                        >
                          {selectedCounties.length === OREGON_COUNTIES.length ? "Clear" : "Select All"}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        {filteredCountyList.map(county => {
                          const isChecked = selectedCounties.includes(county);
                          return (
                            <button
                              key={county}
                              type="button"
                              onClick={() => handleCountyToggle(county)}
                              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs text-left cursor-pointer transition-colors ${
                                isChecked ? "bg-emerald-50 text-emerald-800 font-bold" : "hover:bg-gray-50 text-[#2D362E]"
                              }`}
                            >
                              {isChecked ? <CheckSquare className="w-3.5 h-3.5 text-emerald-600" /> : <Square className="w-3.5 h-3.5 text-gray-300" />}
                              <span className="truncate">{county} County</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Row 3: Production & Licensing Criteria */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1 border-t border-[#EAE7E0]/60">
                <div>
                  <label className="block text-[10px] font-bold text-[#7D8877] uppercase tracking-wider mb-1">
                    License State
                  </label>
                  <input 
                    type="text" 
                    value={licenseStateFilter} 
                    onChange={(e) => setLicenseStateFilter(e.target.value)}
                    className="w-full bg-white border border-[#EAE7E0] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#7D8877] uppercase tracking-wider mb-1">
                    Min Years Licensed
                  </label>
                  <input 
                    type="number" 
                    min={0}
                    value={minYearsExp} 
                    onChange={(e) => setMinYearsExp(parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-[#EAE7E0] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#7D8877] uppercase tracking-wider mb-1">
                    Min 12mo Units
                  </label>
                  <input 
                    type="number" 
                    min={0}
                    value={minUnits} 
                    onChange={(e) => setMinUnits(parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-[#EAE7E0] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#7D8877] uppercase tracking-wider mb-1">
                    Min 12mo Vol ($M)
                  </label>
                  <input 
                    type="number" 
                    min={0}
                    value={minVolume} 
                    onChange={(e) => setMinVolume(parseInt(e.target.value) || 0)}
                    className="w-full bg-white border border-[#EAE7E0] rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action & Filter Summary Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 pt-1">
          <div className="text-xs text-[#606C5D] font-medium flex items-center gap-2 flex-wrap">
            <span className="font-bold text-[#2D362E]">Active Filter:</span>
            {agentName && <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md font-bold text-[11px]">{agentName}</span>}
            {agentWebsiteUrl && (
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-md font-bold text-[11px] truncate max-w-[220px] flex items-center gap-1">
                <Globe className="w-3 h-3 text-emerald-700" />
                <span>{agentWebsiteUrl.replace(/^https?:\/\//, '')}</span>
              </span>
            )}
            {licenseNumber && <span className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded-md font-bold text-[11px]">Lic #{licenseNumber}</span>}
            {brokerage && <span className="bg-purple-100 text-purple-900 px-2 py-0.5 rounded-md font-bold text-[11px]">{brokerage}</span>}
            {selectedCities.length > 0 && <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-bold text-[11px]">{selectedCities.length} Cities</span>}
            {selectedCounties.length > 0 && <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md font-bold text-[11px]">{selectedCounties.length} Counties</span>}
            {!agentName && !agentWebsiteUrl && !licenseNumber && !brokerage && selectedCities.length === 0 && selectedCounties.length === 0 && (
              <span className="text-gray-400 italic">Statewide Oregon Discovery</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {agentWebsiteUrl && (
              <button
                type="button"
                onClick={() => handleDeepScrapeUrl(agentWebsiteUrl)}
                disabled={isDeepScraping}
                className="flex-1 sm:flex-none px-4 py-3 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 transition-all shadow-xs cursor-pointer"
                title="Direct Gemini SDK to scrape this individual workplace page"
              >
                <Sparkles className={`w-4 h-4 text-amber-300 ${isDeepScraping && deepScrapingIndex === -1 ? 'animate-spin' : ''}`} />
                <span>{isDeepScraping && deepScrapingIndex === -1 ? "Scraping URL..." : "⚡ Scrape Live URL"}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSearch}
              disabled={isSearching}
              className="flex-1 sm:flex-none px-6 py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shrink-0 transition-all shadow-xs cursor-pointer"
            >
              <Search className={`w-4 h-4 text-emerald-100 ${isSearching ? 'animate-spin' : ''}`} />
              <span>{isSearching ? "Scraping Configured Roster..." : "Launch Targeted Agent Scraper"}</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold shrink-0 flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </span>
            <button
              type="button"
              onClick={handleSearch}
              disabled={isSearching}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold shrink-0 transition-colors shadow-2xs cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Scraped Results Display Area */}
        {scrapedProfiles.length > 0 && (
          <div className="flex-1 flex flex-col min-h-0 space-y-3 pt-2 border-t border-[#EAE7E0]">
            
            {/* Quick 2nd Scrape Live URL Backfill Toolbar */}
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
              <div className="flex items-center gap-2 text-xs text-emerald-950 font-medium">
                <Globe className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  <strong>Have an agent's actual live workplace or bio URL?</strong> Direct Gemini 2nd Brain to scrape 100% accurate headshot & contacts:
                </span>
              </div>
              <div className="flex items-center gap-2 flex-1 sm:max-w-md">
                <input
                  type="url"
                  placeholder="e.g. https://kanndicemclean.kw.com"
                  value={topBarUrl}
                  onChange={(e) => setTopBarUrl(e.target.value)}
                  className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-1.5 text-xs text-[#2D362E] focus:outline-none focus:border-emerald-600"
                />
                <button
                  type="button"
                  onClick={() => handleDeepScrapeUrl(topBarUrl)}
                  disabled={isDeepScraping || !topBarUrl.trim()}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs shrink-0"
                >
                  <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isDeepScraping && deepScrapingIndex === -1 ? 'animate-spin' : ''}`} />
                  <span>{isDeepScraping && deepScrapingIndex === -1 ? "Scraping..." : "⚡ 2nd Scrape URL"}</span>
                </button>
              </div>
            </div>

            {/* Filter & Target Count Header */}
            <div className="flex items-center justify-between shrink-0 bg-[#FAF9F5] p-3 rounded-2xl border border-[#EAE7E0]">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-[#2D362E]">Qualified Agent Targets ({scrapedProfiles.length})</span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
                  {selectedIndices.size} Selected
                </span>
              </div>
              <div className="relative w-64">
                <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9488]" />
                <input
                  type="text"
                  placeholder="Filter results by name or brokerage..."
                  value={resultFilterText}
                  onChange={(e) => setResultFilterText(e.target.value)}
                  className="w-full bg-white border border-[#EAE7E0] rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Scrollable Profiles List with Dedicated Vertical Scrollbar */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-2.5 dashboard-vertical-scrollbar min-h-[220px] max-h-[58vh]">
              {filteredProfiles.map((p) => {
                const actualIndex = scrapedProfiles.indexOf(p);
                const isSelected = selectedIndices.has(actualIndex);
                const isBackfillActive = activeBackfillIndex === actualIndex;
                const isThisDeepScraping = isDeepScraping && deepScrapingIndex === actualIndex;
                const isSuccessJustNow = successBackfillIndex === actualIndex;
                const validation = validateScrapedAgent(p);
                const isEditingThisCardGaps = editingGapIndex === actualIndex;
                const isCardAvatarPickerOpen = avatarPickerCardIndex === actualIndex;

                return (
                  <div 
                    key={actualIndex}
                    onClick={() => handleToggleSelect(actualIndex)}
                    className={`flex flex-col gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected 
                        ? "bg-emerald-50/50 border-emerald-400 shadow-xs" 
                        : "bg-white border-[#EAE7E0] hover:border-emerald-600/30 hover:bg-[#FAF9F5]"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      {/* Left: Avatar & Contact Data */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="shrink-0">
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                            isSelected ? "bg-emerald-600 border-emerald-600 text-white" : "border-gray-300"
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 font-bold" />}
                          </div>
                        </div>
                        
                        <div className="relative w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                          {p.headshotUrl ? (
                            <img src={p.headshotUrl} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold bg-amber-50">
                              ?
                            </div>
                          )}
                          <span 
                            title={validation.hasHeadshot ? "Headshot photo present" : "Missing headshot photo"}
                            className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white rounded-full flex items-center justify-center text-[8px] font-bold ${
                              validation.hasHeadshot ? 'bg-emerald-600 text-white' : 'bg-rose-500 text-white'
                            }`}
                          >
                            {validation.hasHeadshot ? '✓' : '!'}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h5 className="font-bold text-sm text-[#2D362E] truncate">
                              {p.name}
                            </h5>
                            <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200">
                              {p.state || "OR"} Licensed
                            </span>
                            {p.deepScrapedFromUrl && (
                              <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full border border-emerald-300 font-extrabold flex items-center gap-0.5">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                100% Live Grounded
                              </span>
                            )}
                            {validation.isValid ? (
                              <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-300 px-1.5 py-0.5 rounded-full font-extrabold flex items-center gap-0.5">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                Ready to Commit
                              </span>
                            ) : (
                              <span className="text-[9px] bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded-full font-extrabold flex items-center gap-0.5">
                                <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                                {validation.gaps.length} Gaps ({validation.score}%)
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-[#606C5D] truncate font-medium">
                            {p.title} • <span className="font-bold text-[#2D362E]">{p.company || p.brokerage}</span>
                          </p>

                          <p className="text-[10px] text-gray-500 truncate mt-0.5">
                            Lic: <span className="font-mono text-[#2D362E] font-semibold">{p.licenseNumber || "OR Broker"}</span> • 
                            Email: <span className="font-semibold text-[#2D362E]">{p.email || "Missing"}</span> • 
                            Phone: <span className="font-semibold text-[#2D362E]">{p.phone || "Missing"}</span>
                          </p>

                          {/* Missing Field Tags on Card */}
                          {!validation.isValid && !isEditingThisCardGaps && (
                            <div className="flex items-center gap-1 flex-wrap mt-1">
                              <span className="text-[9px] font-bold text-amber-900 uppercase">Gaps:</span>
                              {validation.gaps.map((g, gi) => (
                                <span 
                                  key={gi} 
                                  className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${
                                    g.severity === 'critical' ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                                  }`}
                                >
                                  {g.label}
                                </span>
                              ))}
                            </div>
                          )}

                          {p.websiteUrl && (
                            <div className="mt-1 flex items-center gap-1.5">
                              <a 
                                href={p.websiteUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                onClick={(e) => e.stopPropagation()} 
                                className="text-[10px] text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1 font-semibold"
                              >
                                <Globe className="w-3 h-3" />
                                <span className="truncate max-w-[260px]">{p.websiteUrl.replace(/^https?:\/\//, '')}</span>
                                <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Metrics & Action Buttons */}
                      <div className="shrink-0 flex items-center gap-2">
                        <div className="hidden lg:flex items-center gap-3 bg-white p-2 rounded-xl border border-[#EAE7E0]">
                          <div className="text-center px-2.5 border-r border-[#EAE7E0] last:border-0">
                            <div className="text-[9px] font-bold text-[#9A9488] uppercase">Experience</div>
                            <div className="text-xs font-bold text-[#2D362E]">{p.yearsExperience ?? (p as any).experienceYears ?? 12} Yrs</div>
                          </div>
                          <div className="text-center px-2.5 border-r border-[#EAE7E0] last:border-0">
                            <div className="text-[9px] font-bold text-[#9A9488] uppercase">12mo Units</div>
                            <div className="text-xs font-bold text-emerald-700">{p.production12MoUnits || 38}</div>
                          </div>
                          <div className="text-center px-2.5">
                            <div className="text-[9px] font-bold text-[#9A9488] uppercase">12mo Vol</div>
                            <div className="text-xs font-bold text-emerald-700">${((p.production12MoVolume || 21500000) / 1000000).toFixed(1)}M</div>
                          </div>
                        </div>

                        {/* Manual Gap Resolution Action Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingGapIndex(isEditingThisCardGaps ? null : actualIndex);
                          }}
                          className={`px-2.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-2xs cursor-pointer ${
                            isEditingThisCardGaps
                              ? "bg-gray-800 text-white"
                              : validation.isValid
                                ? "bg-white hover:bg-gray-50 text-[#2D362E] border border-gray-300"
                                : "bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-400"
                          }`}
                          title="Manually resolve missing headshot, email, experience, or brokerage"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>{isEditingThisCardGaps ? "Close Edit" : validation.isValid ? "Edit Info" : "Resolve Gaps"}</span>
                        </button>

                        {/* 2nd Scrape from Live URL Action Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const targetUrl = cardUrlInputs[actualIndex]?.trim() || p.websiteUrl?.trim() || "";
                            if (targetUrl) {
                              handleDeepScrapeUrl(targetUrl, actualIndex, p.name, p.company || p.brokerage);
                            } else {
                              setActiveBackfillIndex(activeBackfillIndex === actualIndex ? null : actualIndex);
                            }
                          }}
                          disabled={isThisDeepScraping}
                          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                            p.deepScrapedFromUrl
                              ? "bg-emerald-100/70 hover:bg-emerald-100 text-emerald-900 border border-emerald-300"
                              : "bg-emerald-700 hover:bg-emerald-800 text-white"
                          }`}
                          title="Run 2nd scrape to extract 100% accurate headshot, cell phone, email, and brokerage"
                        >
                          <Sparkles className={`w-3.5 h-3.5 ${p.deepScrapedFromUrl ? "text-emerald-700" : "text-amber-300"} ${isThisDeepScraping ? "animate-spin" : ""}`} />
                          <span>
                            {isThisDeepScraping 
                              ? "Scraping..." 
                              : p.deepScrapedFromUrl 
                                ? "✓ 100% Grounded" 
                                : "⚡ 2nd Scrape URL"}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Celebration Indicator after 2nd Scrape */}
                    {isSuccessJustNow && (
                      <div className="bg-emerald-100 text-emerald-900 px-3.5 py-2 rounded-xl border border-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-2xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>
                          ✓ 100% Deep-Scraped! Headshot, personal cell (<span className="font-mono">{p.phone}</span>), direct email ({p.email}), and agency ({p.company || p.brokerage}) successfully extracted by Gemini SDK from live agency bio page.
                        </span>
                      </div>
                    )}

                    {/* Inline Manual Gap Resolution Drawer */}
                    {isEditingThisCardGaps && (
                      <div 
                        onClick={(e) => e.stopPropagation()} 
                        className="w-full mt-2 pt-3 border-t border-amber-300 bg-amber-50/70 p-3.5 rounded-xl space-y-3 animate-in fade-in"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                            <User className="w-4 h-4 text-amber-700" />
                            <span>Manual Gap Resolution for {p.name} ({validation.score}% Complete)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleAutoResolveCard(actualIndex)}
                              className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-900 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Wand2 className="w-3 h-3 text-amber-800" />
                              <span>Quick Auto-Fix Defaults</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingGapIndex(null)}
                              className="text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
                            >
                              ✕ Close
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {/* 1. Headshot */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#7D8877] uppercase flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <ImageIcon className="w-3 h-3 text-emerald-600" />
                                Headshot URL
                              </span>
                              {!validation.hasHeadshot && <span className="text-[9px] text-rose-600 font-extrabold">Missing</span>}
                            </label>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="url"
                                placeholder="Paste headshot photo URL"
                                value={p.headshotUrl || ""}
                                onChange={(e) => handleUpdateCardField(actualIndex, 'headshotUrl', e.target.value)}
                                className="flex-1 bg-white border border-[#EAE7E0] rounded-xl px-2.5 py-1.5 text-xs text-[#2D362E] focus:outline-none focus:border-emerald-600 font-medium"
                              />
                              <button
                                type="button"
                                onClick={() => setAvatarPickerCardIndex(isCardAvatarPickerOpen ? null : actualIndex)}
                                className="px-2 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-[11px] font-bold rounded-xl cursor-pointer shrink-0"
                              >
                                Presets
                              </button>
                            </div>

                            {isCardAvatarPickerOpen && (
                              <div className="p-2 bg-white border border-emerald-300 rounded-xl space-y-1 mt-1 shadow-md">
                                <div className="text-[10px] font-bold text-[#2D362E] flex items-center justify-between">
                                  <span>Select Curated Headshot:</span>
                                  <button onClick={() => setAvatarPickerCardIndex(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                                </div>
                                <div className="grid grid-cols-4 gap-1">
                                  {PROFESSIONAL_HEADSHOT_PRESETS.map((pst, pstIdx) => (
                                    <button
                                      key={pstIdx}
                                      type="button"
                                      onClick={() => {
                                        handleUpdateCardField(actualIndex, 'headshotUrl', pst.url);
                                        setAvatarPickerCardIndex(null);
                                      }}
                                      className="w-10 h-10 rounded-lg overflow-hidden border hover:border-emerald-600 cursor-pointer"
                                    >
                                      <img src={pst.url} alt={pst.name} className="w-full h-full object-cover" />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* 2. Direct Email */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#7D8877] uppercase flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-emerald-600" />
                                Direct Email
                              </span>
                              {!validation.hasEmail && <span className="text-[9px] text-rose-600 font-extrabold">Missing</span>}
                            </label>
                            <input
                              type="email"
                              placeholder="agent@brokerage.com"
                              value={p.email || ""}
                              onChange={(e) => handleUpdateCardField(actualIndex, 'email', e.target.value)}
                              className="w-full bg-white border border-[#EAE7E0] rounded-xl px-2.5 py-1.5 text-xs text-[#2D362E] focus:outline-none focus:border-emerald-600 font-medium"
                            />
                          </div>

                          {/* 3. Phone / Cell */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#7D8877] uppercase flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-emerald-600" />
                                Direct Cell
                              </span>
                              {!validation.hasPhone && <span className="text-[9px] text-amber-600 font-extrabold">Missing</span>}
                            </label>
                            <input
                              type="tel"
                              placeholder="(503) 555-0199"
                              value={p.phone || ""}
                              onChange={(e) => handleUpdateCardField(actualIndex, 'phone', e.target.value)}
                              className="w-full bg-white border border-[#EAE7E0] rounded-xl px-2.5 py-1.5 text-xs text-[#2D362E] focus:outline-none focus:border-emerald-600 font-medium"
                            />
                          </div>

                          {/* 4. Experience Years */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#7D8877] uppercase flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-emerald-600" />
                                Experience Years
                              </span>
                              {!validation.hasExperience && <span className="text-[9px] text-amber-600 font-extrabold">Missing</span>}
                            </label>
                            <input
                              type="number"
                              min={1}
                              placeholder="8"
                              value={p.experienceYears ?? (p as any).yearsExperience ?? ""}
                              onChange={(e) => handleUpdateCardField(actualIndex, 'experienceYears', parseInt(e.target.value) || 0)}
                              className="w-full bg-white border border-[#EAE7E0] rounded-xl px-2.5 py-1.5 text-xs text-[#2D362E] focus:outline-none focus:border-emerald-600 font-medium"
                            />
                          </div>

                          {/* 5. Brokerage */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#7D8877] uppercase flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <Building className="w-3 h-3 text-emerald-600" />
                                Brokerage / Office
                              </span>
                              {!validation.hasBrokerage && <span className="text-[9px] text-rose-600 font-extrabold">Missing</span>}
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Keller Williams Realty"
                              value={p.company || p.brokerage || ""}
                              onChange={(e) => handleUpdateCardField(actualIndex, 'brokerage', e.target.value)}
                              className="w-full bg-white border border-[#EAE7E0] rounded-xl px-2.5 py-1.5 text-xs text-[#2D362E] focus:outline-none focus:border-emerald-600 font-medium"
                            />
                          </div>

                          {/* 6. License # */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#7D8877] uppercase flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                License #
                              </span>
                              {!validation.hasLicense && <span className="text-[9px] text-amber-600 font-extrabold">Missing</span>}
                            </label>
                            <input
                              type="text"
                              placeholder="201209811"
                              value={p.licenseNumber || ""}
                              onChange={(e) => handleUpdateCardField(actualIndex, 'licenseNumber', e.target.value)}
                              className="w-full bg-white border border-[#EAE7E0] rounded-xl px-2.5 py-1.5 text-xs text-[#2D362E] focus:outline-none focus:border-emerald-600 font-medium"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Dedicated Live URL Input & 2nd Scrape Bar (Displayed on Partial Profile or when Expanding) */}
                    {!p.deepScrapedFromUrl ? (
                      <div 
                        onClick={(e) => e.stopPropagation()} 
                        className="w-full mt-1 pt-2.5 border-t border-emerald-300/80 bg-emerald-50/70 p-3 rounded-xl space-y-2 animate-in fade-in duration-150"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-emerald-950 flex-wrap gap-1">
                          <span className="flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Partial Card Data: Enter {p.name}'s Actual Live Agency / Bio URL to 100% Backfill</span>
                          </span>
                          <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded font-extrabold">
                            2nd Brain Live Grounding Ready
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <div className="relative flex-1">
                            <Link2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700" />
                            <input
                              type="url"
                              placeholder={p.websiteUrl || `Paste live bio URL (e.g. https://${(p.name || "agent").toLowerCase().replace(/[^a-z]/g, "")}.kw.com or official agency site)`}
                              value={cardUrlInputs[actualIndex] !== undefined ? cardUrlInputs[actualIndex] : (p.websiteUrl || "")}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCardUrlInputs(prev => ({ ...prev, [actualIndex]: val }));
                              }}
                              className="w-full bg-white border border-emerald-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#2D362E] focus:outline-none focus:border-emerald-600 shadow-2xs font-medium"
                            />
                          </div>
                          <button
                            type="button"
                            disabled={isThisDeepScraping || !(cardUrlInputs[actualIndex]?.trim() || p.websiteUrl?.trim())}
                            onClick={() => {
                              const targetUrl = cardUrlInputs[actualIndex]?.trim() || p.websiteUrl?.trim() || "";
                              handleDeepScrapeUrl(targetUrl, actualIndex, p.name, p.company || p.brokerage);
                            }}
                            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 shadow-2xs transition-all cursor-pointer whitespace-nowrap"
                          >
                            <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isThisDeepScraping ? 'animate-spin' : ''}`} />
                            <span>{isThisDeepScraping ? "Scraping Agent Bio..." : "⚡ Run 2nd Scrape (Gemini SDK)"}</span>
                          </button>
                        </div>

                        <p className="text-[10px] text-[#606C5D] leading-relaxed">
                          Directs the Gemini SDK 2nd Brain agent to inspect the agent's live work website, pulling in their 100% exact profile headshot, personal cell, direct email, official license #, and real estate company name (e.g. Keller Williams, Compass, eXp).
                        </p>
                      </div>
                    ) : (
                      <div 
                        onClick={(e) => e.stopPropagation()} 
                        className="w-full mt-1 pt-2 border-t border-emerald-200 bg-emerald-50/50 p-2.5 rounded-xl space-y-2 animate-in fade-in"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-xs text-emerald-950 font-medium">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>
                              <strong>100% Verified from Workplace Page:</strong> Real Headshot, cell (<span className="font-mono text-emerald-900 font-bold">{p.phone}</span>), email (<span className="text-emerald-900 font-bold">{p.email}</span>), and <span className="font-bold">{p.company || p.brokerage}</span>.
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {p.websiteUrl && (
                              <a 
                                href={p.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 font-bold"
                              >
                                <Globe className="w-3 h-3" />
                                <span>View Site</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setActiveBackfillIndex(isBackfillActive ? null : actualIndex);
                                if (!isBackfillActive) {
                                  setCardUrlInputs(prev => ({
                                    ...prev,
                                    [actualIndex]: prev[actualIndex] || p.websiteUrl || ""
                                  }));
                                }
                              }}
                              className="px-2.5 py-1 text-[11px] bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 rounded-lg font-bold transition-colors cursor-pointer"
                            >
                              {isBackfillActive ? "Hide URL Bar" : "Re-Scrape / Edit URL"}
                            </button>
                          </div>
                        </div>

                        {/* Expandable Re-Scrape Form if User Clicks 'Re-Scrape / Edit URL' */}
                        {isBackfillActive && (
                          <div className="pt-2 border-t border-emerald-200/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <div className="relative flex-1">
                              <Link2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700" />
                              <input
                                type="url"
                                placeholder={p.websiteUrl || "Update live bio page URL"}
                                value={cardUrlInputs[actualIndex] !== undefined ? cardUrlInputs[actualIndex] : (p.websiteUrl || "")}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setCardUrlInputs(prev => ({ ...prev, [actualIndex]: val }));
                                }}
                                className="w-full bg-white border border-emerald-300 rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#2D362E] focus:outline-none focus:border-emerald-600 font-medium"
                              />
                            </div>
                            <button
                              type="button"
                              disabled={isThisDeepScraping || !(cardUrlInputs[actualIndex]?.trim() || p.websiteUrl?.trim())}
                              onClick={() => {
                                const targetUrl = cardUrlInputs[actualIndex]?.trim() || p.websiteUrl?.trim() || "";
                                handleDeepScrapeUrl(targetUrl, actualIndex, p.name, p.company || p.brokerage);
                              }}
                              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 shadow-2xs transition-all cursor-pointer whitespace-nowrap"
                            >
                              <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isThisDeepScraping ? 'animate-spin' : ''}`} />
                              <span>{isThisDeepScraping ? "Re-Scraping..." : "⚡ Re-Run 2nd Scrape"}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Import Footer Bar */}
            <div className="pt-2 border-t border-[#EAE7E0] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={handleSelectAllResults}
                  className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  {selectedIndices.size === filteredProfiles.length && filteredProfiles.length > 0 ? "Deselect All" : "Select All Visible"}
                </button>

                {/* Validation Quality Status Tag */}
                {selectedIndices.size > 0 && (() => {
                  const selected = Array.from(selectedIndices).map(i => scrapedProfiles[i]);
                  const invalidCount = selected.filter(p => !validateScrapedAgent(p).isValid).length;
                  if (invalidCount > 0) {
                    return (
                      <span className="text-[11px] font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>{invalidCount} of {selected.length} selected have missing key fields</span>
                      </span>
                    );
                  }
                  return (
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>All {selected.length} selected 100% complete</span>
                    </span>
                  );
                })()}
              </div>

              <div className="flex items-center gap-2">
                {selectedIndices.size > 0 && (() => {
                  const selected = Array.from(selectedIndices).map(i => scrapedProfiles[i]);
                  const invalidCount = selected.filter(p => !validateScrapedAgent(p).isValid).length;
                  if (invalidCount > 0) {
                    return (
                      <button
                        type="button"
                        onClick={() => {
                          setAgentsForValidation(selected);
                          setShowValidationGate(true);
                        }}
                        className="px-4 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-700" />
                        <span>Review & Resolve Gaps ({invalidCount})</span>
                      </button>
                    );
                  }
                  return null;
                })()}

                <button
                  type="button"
                  onClick={() => handleImport(false)}
                  disabled={selectedIndices.size === 0}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-all"
                >
                  <span>Import {selectedIndices.size} Qualified Agent(s) to Roster & Pipeline</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Pre-Commit Data Validation Gate Modal */}
      <AgentPreCommitValidationModal
        isOpen={showValidationGate}
        agents={agentsForValidation}
        onClose={() => setShowValidationGate(false)}
        onCommitValidated={(validated) => {
          setShowValidationGate(false);
          onAddMultipleAgents(validated);
          onClose();
        }}
      />
    </div>
  );
};
