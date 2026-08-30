import React, { useState } from "react";
import { Sparkles, Search, X, Check, CheckCircle2, UserPlus, Filter, Award, Target, MapPin } from "lucide-react";
import { LoanOfficerProfile } from "../types";

interface ScrapeLoRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMultipleLos: (los: Partial<LoanOfficerProfile>[]) => void;
}

export const ScrapeLoRosterModal: React.FC<ScrapeLoRosterModalProps> = ({
  isOpen,
  onClose,
  onAddMultipleLos
}) => {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // AI Scraper filters
  const [licenseStateFilter, setLicenseStateFilter] = useState("Oregon (OR)");
  const [minYearsExp, setMinYearsExp] = useState<number>(3);
  const [minUnits, setMinUnits] = useState<number>(20);
  const [minVolume, setMinVolume] = useState<number>(10);
  
  const [scrapedProfiles, setScrapedProfiles] = useState<Partial<LoanOfficerProfile>[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [filterText, setFilterText] = useState("");

  if (!isOpen) return null;

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setErrorMsg(null);
    setScrapedProfiles([]);
    setSelectedIndices(new Set());
    
    try {
      const res = await fetch("/api/gemini/lo-roster-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query,
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
          // Auto-select all by default
          setSelectedIndices(new Set(data.profiles.map((_: any, i: number) => i)));
        } else {
          setErrorMsg(data.error || "No qualified profiles found matching your search parameters.");
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
    (p.name?.toLowerCase() || "").includes(filterText.toLowerCase()) || 
    (p.title?.toLowerCase() || "").includes(filterText.toLowerCase())
  );

  const handleToggleSelect = (index: number) => {
    const next = new Set(selectedIndices);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setSelectedIndices(next);
  };

  const handleSelectAll = () => {
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
      onAddMultipleLos(selected);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-5xl w-full p-6 sm:p-8 space-y-5 border border-[#EAE7E0] shadow-2xl animate-in zoom-in-95 duration-150 text-[#2D362E] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-3 shrink-0">
          <div>
            <h4 className="font-serif font-bold text-lg text-[#2D362E] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              AI Agent: Targeted LO Recruiting Scraper
            </h4>
            <p className="text-xs text-[#606C5D]">Deploy AI to scrape online rosters, filtering out low producers and unqualified candidates.</p>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-[#9A9488] hover:text-[#2D362E] px-3 py-1.5 rounded-xl border border-[#EAE7E0] bg-[#F9F8F4]"
          >
            ✕ Close
          </button>
        </div>

        {/* AI Scraper Filters */}
        <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#EAE7E0] shrink-0 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-[#9A9488] uppercase tracking-wider mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> License State
            </label>
            <input 
              type="text" 
              value={licenseStateFilter} 
              onChange={(e) => setLicenseStateFilter(e.target.value)}
              className="w-full bg-white border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#9A9488] uppercase tracking-wider mb-1 flex items-center gap-1">
              <Award className="w-3 h-3" /> Min Years Licensed
            </label>
            <input 
              type="number" 
              min={0}
              value={minYearsExp} 
              onChange={(e) => setMinYearsExp(parseInt(e.target.value) || 0)}
              className="w-full bg-white border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#9A9488] uppercase tracking-wider mb-1 flex items-center gap-1">
              <Target className="w-3 h-3" /> 12mo Prod (Units)
            </label>
            <input 
              type="number" 
              min={0}
              value={minUnits} 
              onChange={(e) => setMinUnits(parseInt(e.target.value) || 0)}
              className="w-full bg-white border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#9A9488] uppercase tracking-wider mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> 12mo Volume ($M)
            </label>
            <input 
              type="number" 
              min={0}
              value={minVolume} 
              onChange={(e) => setMinVolume(parseInt(e.target.value) || 0)}
              className="w-full bg-white border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Search Input */}
        <div className="flex gap-2 shrink-0">
          <input
            type="text"
            placeholder="e.g. 'Fairway Independent Mortgage - Portland Branch team roster'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
              }
            }}
            className="flex-1 bg-white border border-emerald-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-[#2D362E]"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={isSearching || !query.trim()}
            className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-sm font-bold flex items-center gap-2 shrink-0 transition-all shadow-xs"
          >
            <Search className={`w-4 h-4 text-emerald-100 ${isSearching ? 'animate-spin' : ''}`} />
            <span>{isSearching ? "Agent Searching..." : "Launch Scraper"}</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold shrink-0 flex items-center justify-between gap-2">
            <span>{errorMsg}</span>
            <button
              type="button"
              onClick={handleSearch}
              disabled={isSearching}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold shrink-0 transition-colors shadow-2xs"
            >
              Retry
            </button>
          </div>
        )}

        {/* Results Area */}
        {scrapedProfiles.length > 0 && (
          <div className="flex-1 flex flex-col min-h-0 space-y-4">
            <div className="flex items-center justify-between shrink-0 bg-[#FAF9F5] p-3 rounded-2xl border border-[#EAE7E0]">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-[#2D362E]">Qualified Targets ({scrapedProfiles.length})</span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
                  {selectedIndices.size} Selected
                </span>
              </div>
              <div className="relative w-64">
                <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9488]" />
                <input
                  type="text"
                  placeholder="Filter results by name..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="w-full bg-white border border-[#EAE7E0] rounded-xl pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {filteredProfiles.map((p, displayIndex) => {
                const actualIndex = scrapedProfiles.indexOf(p);
                const isSelected = selectedIndices.has(actualIndex);

                return (
                  <div 
                    key={actualIndex}
                    onClick={() => handleToggleSelect(actualIndex)}
                    className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected 
                        ? "bg-emerald-50/50 border-emerald-400 shadow-sm" 
                        : "bg-white border-[#EAE7E0] hover:border-emerald-600/30 hover:bg-[#FAF9F5]"
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="shrink-0">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                          isSelected ? "bg-emerald-600 border-emerald-600 text-white" : "border-gray-300"
                        }`}>
                          {isSelected && <Check className="w-3 h-3 font-bold" />}
                        </div>
                      </div>
                      
                      <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
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
                          {p.licenseStates && p.licenseStates.some(s => s.toLowerCase().includes('oregon') || s.includes('OR')) && (
                            <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200">OR Licensed</span>
                          )}
                        </h5>
                        <p className="text-[11px] text-[#606C5D] truncate">{p.title} • {p.company}</p>
                        <p className="text-[10px] text-gray-400 truncate mt-0.5">NMLS: {p.nmlsId} • {p.email}</p>
                      </div>
                    </div>

                    {/* AI Filtered Metrics */}
                    <div className="shrink-0 flex items-center gap-3 bg-white p-2.5 rounded-xl border border-[#EAE7E0]">
                      <div className="text-center px-3 border-r border-[#EAE7E0] last:border-0">
                        <div className="text-[10px] font-bold text-[#9A9488] uppercase">Experience</div>
                        <div className="text-sm font-bold text-[#2D362E]">{p.yearsExperience || 0} Yrs</div>
                      </div>
                      <div className="text-center px-3 border-r border-[#EAE7E0] last:border-0">
                        <div className="text-[10px] font-bold text-[#9A9488] uppercase">12mo Units</div>
                        <div className="text-sm font-bold text-emerald-700">{p.production12MoUnits || 0}</div>
                      </div>
                      <div className="text-center px-3">
                        <div className="text-[10px] font-bold text-[#9A9488] uppercase">12mo Vol</div>
                        <div className="text-sm font-bold text-emerald-700">${(p.production12MoVolume || 0) / 1000000}M</div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredProfiles.length === 0 && (
                <div className="text-center p-6 text-gray-400 text-sm">
                  No profiles match your filter.
                </div>
              )}
            </div>
            
            <div className="pt-3 border-t border-[#EAE7E0] flex items-center justify-between shrink-0">
              <button
                onClick={handleSelectAll}
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                {selectedIndices.size === filteredProfiles.length && filteredProfiles.length > 0 ? "Deselect All" : "Select All Visible"}
              </button>
              <button
                onClick={handleImport}
                disabled={selectedIndices.size === 0}
                className="px-6 py-3 bg-emerald-800 hover:bg-emerald-900 disabled:bg-stone-300 disabled:text-stone-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Import {selectedIndices.size} Qualified LO{selectedIndices.size !== 1 ? 's' : ''} to Pipeline</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
