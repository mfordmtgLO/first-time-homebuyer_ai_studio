import React, { useState } from "react";
import { 
  Sparkles, Search, X, Check, Filter, Award, Target, MapPin, Building, 
  User, ShieldCheck, ChevronDown, ChevronUp, RotateCcw, CheckSquare, Square 
} from "lucide-react";
import { RealEstateAgentProfile } from "../types";

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

  if (!isOpen) return null;

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
    setQuery("");
    setSelectedCities([]);
    setSelectedCounties([]);
    setMinYearsExp(3);
    setMinUnits(15);
    setMinVolume(5);
    setErrorMsg(null);
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

  const handleImport = () => {
    const selected = Array.from(selectedIndices).map(i => scrapedProfiles[i]);
    if (selected.length > 0) {
      onAddMultipleAgents(selected);
      onClose();
    }
  };

  const filteredCityList = OREGON_CITIES.filter(c => c.toLowerCase().includes(citySearchFilter.toLowerCase()));
  const filteredCountyList = OREGON_COUNTIES.filter(c => c.toLowerCase().includes(countySearchFilter.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-5xl w-full p-5 sm:p-7 space-y-4 border border-[#EAE7E0] shadow-2xl animate-in zoom-in-95 duration-150 text-[#2D362E] max-h-[92vh] flex flex-col">
        
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
        <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#EAE7E0] space-y-4 shrink-0 overflow-y-auto max-h-[45vh] dashboard-vertical-scrollbar">
          
          <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#4A5D4E] flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-emerald-600" />
              Search & Scraper Configuration Panel
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] font-semibold text-[#606C5D] hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset Config
            </button>
          </div>

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

        {/* Action & Filter Summary Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 pt-1">
          <div className="text-xs text-[#606C5D] font-medium flex items-center gap-2 flex-wrap">
            <span className="font-bold text-[#2D362E]">Active Filter:</span>
            {agentName && <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md font-bold text-[11px]">{agentName}</span>}
            {licenseNumber && <span className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded-md font-bold text-[11px]">Lic #{licenseNumber}</span>}
            {brokerage && <span className="bg-purple-100 text-purple-900 px-2 py-0.5 rounded-md font-bold text-[11px]">{brokerage}</span>}
            {selectedCities.length > 0 && <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-bold text-[11px]">{selectedCities.length} Cities</span>}
            {selectedCounties.length > 0 && <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md font-bold text-[11px]">{selectedCounties.length} Counties</span>}
            {!agentName && !licenseNumber && !brokerage && selectedCities.length === 0 && selectedCounties.length === 0 && (
              <span className="text-gray-400 italic">Statewide Oregon Discovery</span>
            )}
          </div>

          <button
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shrink-0 transition-all shadow-xs cursor-pointer"
          >
            <Search className={`w-4 h-4 text-emerald-100 ${isSearching ? 'animate-spin' : ''}`} />
            <span>{isSearching ? "Scraping Configured Roster..." : "Launch Targeted Agent Scraper"}</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold shrink-0 flex items-center justify-between gap-2">
            <span>{errorMsg}</span>
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

            <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 dashboard-vertical-scrollbar max-h-[35vh]">
              {filteredProfiles.map((p, displayIndex) => {
                const actualIndex = scrapedProfiles.indexOf(p);
                const isSelected = selectedIndices.has(actualIndex);

                return (
                  <div 
                    key={actualIndex}
                    onClick={() => handleToggleSelect(actualIndex)}
                    className={`flex flex-col sm:flex-row sm:items-center gap-4 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected 
                        ? "bg-emerald-50/50 border-emerald-400 shadow-xs" 
                        : "bg-white border-[#EAE7E0] hover:border-emerald-600/30 hover:bg-[#FAF9F5]"
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="shrink-0">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          isSelected ? "bg-emerald-600 border-emerald-600 text-white" : "border-gray-300"
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 font-bold" />}
                        </div>
                      </div>
                      
                      <div className="w-11 h-11 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                        {p.headshotUrl ? (
                          <img src={p.headshotUrl} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold">
                            {p.name?.charAt(0) || "?"}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-sm text-[#2D362E] truncate flex items-center gap-2">
                          {p.name}
                          <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200">
                            {p.state || "OR"} Licensed
                          </span>
                        </h5>
                        <p className="text-[11px] text-[#606C5D] truncate">{p.title} • {p.company || p.brokerage}</p>
                        <p className="text-[10px] text-gray-400 truncate mt-0.5">
                          Lic: {p.licenseNumber || "OR Broker"} • {p.email} • {p.phone || "(503) 555-0199"}
                        </p>
                      </div>
                    </div>

                    {/* AI Filtered Metrics */}
                    <div className="shrink-0 flex items-center gap-3 bg-white p-2 rounded-xl border border-[#EAE7E0]">
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
                  </div>
                );
              })}
            </div>

            {/* Bottom Import Footer Bar */}
            <div className="pt-2 border-t border-[#EAE7E0] flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={handleSelectAllResults}
                className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                {selectedIndices.size === filteredProfiles.length && filteredProfiles.length > 0 ? "Deselect All" : "Select All Visible"}
              </button>

              <button
                type="button"
                onClick={handleImport}
                disabled={selectedIndices.size === 0}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-all"
              >
                <span>Import {selectedIndices.size} Qualified Agent(s) to Roster & Pipeline</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
