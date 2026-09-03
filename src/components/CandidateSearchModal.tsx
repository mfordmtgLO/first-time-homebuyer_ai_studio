import React, { useState } from "react";
import { Search, Plus, Award, Building, X, RefreshCw, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { searchNationalRegistry } from "../services/realTrendsService";

interface CandidateSearchModalProps {
  onClose: () => void;
  type: "lo" | "agent";
  onAddCandidate: (candidate: any) => void;
  onTriggerToast: (msg: string) => void;
}

export const CandidateSearchModal: React.FC<CandidateSearchModalProps> = ({ onClose, type, onAddCandidate, onTriggerToast }) => {
  const [query, setQuery] = useState("");
  const [company, setCompany] = useState("");
  const [city, setCity] = useState("");
  const [county, setCounty] = useState("");
  const [stateParam, setStateParam] = useState("");
  
  const [minYears, setMinYears] = useState<number | "">("");
  const [minUnits, setMinUnits] = useState<number | "">("");
  const [minVolume, setMinVolume] = useState<number | "">("");
  
  const [showFilters, setShowFilters] = useState(true);

  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert million string to actual number
    const volumeRaw = minVolume !== "" ? Number(minVolume) * 1000000 : 0;
    
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const res = await searchNationalRegistry({
        query: query.trim(),
        company: company.trim(),
        city: city.trim(),
        county: county.trim(),
        state: stateParam.trim(),
        minYears: minYears !== "" ? Number(minYears) : 0,
        minUnits: minUnits !== "" ? Number(minUnits) : 0,
        minVolume: volumeRaw
      }, type);
      setResults(res);
    } catch (err) {
      onTriggerToast("Error querying national registry.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAdd = (candidate: any) => {
    setAddingId(candidate.id);
    setTimeout(() => {
      onAddCandidate(candidate);
      onTriggerToast(`✅ Successfully imported ${candidate.name} into your pipeline.`);
      setAddingId(null);
      onClose();
    }, 600);
  };

  const title = type === "lo" ? "Search NMLS & MMI Registry" : "Search MLS & RealTrends Registry";
  const subtitle = type === "lo" 
    ? "Find and import top-producing Loan Officers matching your criteria." 
    : "Find and import high-volume Real Estate Agents matching your criteria.";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-[#FAF9F5] w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-[#EAE7E0] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-white border-b border-[#EAE7E0] p-6 flex justify-between items-start shrink-0">
          <div>
            <h2 className="text-xl font-black text-[#2D362E] flex items-center gap-2">
              <Search className="w-5 h-5 text-[#C18C5D]" />
              {title}
            </h2>
            <p className="text-sm text-[#606C5D] mt-1">{subtitle}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-[#9A9488] hover:text-[#2D362E] transition-colors p-2 rounded-full hover:bg-gray-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Filters */}
        <div className="p-6 border-b border-[#EAE7E0] bg-[#F4F2EC] shrink-0">
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto space-y-4">
            
            {/* Main Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={`e.g. "Stuart Sandor", "${type === 'lo' ? 'NMLS ID' : 'License #'}", or office name...`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-[#EAE7E0] focus:border-[#C18C5D] focus:ring-4 focus:ring-[#C18C5D]/10 text-lg transition-all shadow-sm bg-white"
                autoFocus
              />
            </div>
            
            {/* Advanced Filters Toggle */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1.5 text-sm font-bold text-[#606C5D] hover:text-[#2D362E] transition-colors"
              >
                <Filter className="w-4 h-4" />
                Advanced Filters & Production Metrics
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              <button
                type="submit"
                disabled={isSearching || (!query.trim() && !company && !city && !stateParam && !county && minYears==="" && minUnits==="" && minVolume==="")}
                className="bg-[#2D362E] hover:bg-[#1A201B] text-white px-6 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Search Registry
              </button>
            </div>

            {/* Advanced Filters Grid */}
            {showFilters && (
              <div className="bg-white p-5 rounded-2xl border border-[#EAE7E0] shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
                {/* Location & Company */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-[#9A9488] uppercase tracking-wider">Demographics</h4>
                  
                  <div>
                    <label className="block text-xs font-medium text-[#606C5D] mb-1">Company / Brokerage</label>
                    <input
                      type="text"
                      placeholder="e.g. Keller Williams"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#EAE7E0] focus:border-[#C18C5D] focus:ring-2 focus:ring-[#C18C5D]/10 outline-none text-sm"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-[#606C5D] mb-1">City</label>
                      <input
                        type="text"
                        placeholder="e.g. Portland"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#EAE7E0] focus:border-[#C18C5D] focus:ring-2 focus:ring-[#C18C5D]/10 outline-none text-sm"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-[#606C5D] mb-1">County</label>
                      <input
                        type="text"
                        placeholder="e.g. Multnomah"
                        value={county}
                        onChange={(e) => setCounty(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#EAE7E0] focus:border-[#C18C5D] focus:ring-2 focus:ring-[#C18C5D]/10 outline-none text-sm"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-medium text-[#606C5D] mb-1">State</label>
                      <input
                        type="text"
                        placeholder="e.g. OR"
                        value={stateParam}
                        onChange={(e) => setStateParam(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#EAE7E0] focus:border-[#C18C5D] focus:ring-2 focus:ring-[#C18C5D]/10 outline-none text-sm uppercase"
                        maxLength={2}
                      />
                    </div>
                  </div>
                </div>

                {/* Production Metrics */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-[#9A9488] uppercase tracking-wider">Minimum Production Metrics</h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#606C5D] mb-1">Min Years Licensed</label>
                      <input
                        type="number"
                        placeholder="e.g. 5"
                        value={minYears}
                        onChange={(e) => setMinYears(e.target.value ? Number(e.target.value) : "")}
                        min="0"
                        className="w-full px-3 py-2 rounded-xl border border-[#EAE7E0] focus:border-[#C18C5D] focus:ring-2 focus:ring-[#C18C5D]/10 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[#606C5D] mb-1">Min 12Mo Units</label>
                      <input
                        type="number"
                        placeholder={type === 'lo' ? "e.g. 30" : "e.g. 15"}
                        value={minUnits}
                        onChange={(e) => setMinUnits(e.target.value ? Number(e.target.value) : "")}
                        min="0"
                        className="w-full px-3 py-2 rounded-xl border border-[#EAE7E0] focus:border-[#C18C5D] focus:ring-2 focus:ring-[#C18C5D]/10 outline-none text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-[#606C5D] mb-1">Min 12Mo Volume (in Millions $)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
                        <input
                          type="number"
                          placeholder={type === 'lo' ? "e.g. 15 (for $15M)" : "e.g. 5 (for $5M)"}
                          value={minVolume}
                          onChange={(e) => setMinVolume(e.target.value ? Number(e.target.value) : "")}
                          min="0"
                          step="0.5"
                          className="w-full pl-7 pr-8 py-2 rounded-xl border border-[#EAE7E0] focus:border-[#C18C5D] focus:ring-2 focus:ring-[#C18C5D]/10 outline-none text-sm"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">M</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </form>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-6 min-h-[300px]">
          {isSearching ? (
            <div className="py-12 flex flex-col items-center justify-center text-[#606C5D] gap-4">
              <RefreshCw className="w-8 h-8 animate-spin text-[#C18C5D]" />
              <p className="font-medium text-lg text-[#2D362E]">Querying National Database...</p>
              <p className="text-sm text-center max-w-md">Scanning production records, verifying licenses, and cross-referencing industry rankings based on your filters.</p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-4 max-w-4xl mx-auto">
              <p className="text-sm font-bold text-[#606C5D] mb-2">{results.length} Candidates Found Matching Criteria</p>
              {results.map(result => (
                <div key={result.id} className="bg-white p-5 rounded-2xl border border-[#EAE7E0] shadow-sm hover:border-[#C18C5D]/40 transition-colors flex flex-col md:flex-row gap-4 md:items-center">
                  
                  {/* Candidate Info */}
                  <div className="flex-1 min-w-0 flex items-start gap-4">
                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center text-xl font-bold text-gray-400 shrink-0 border border-gray-200">
                      {result.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#2D362E]">{result.name}</h3>
                      <p className="text-[#606C5D] text-sm flex items-center gap-1.5 mt-0.5">
                        <Building className="w-3.5 h-3.5" />
                        {result.company || result.brokerage}
                        {(result.city || city) && (result.state || stateParam) && ` • ${city || 'Portland'}, ${stateParam || 'OR'}`}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {result.realTrendsVerified && (
                          <span className="text-[10px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                            <Award className="w-3 h-3 text-amber-600" />
                            {result.realTrendsRank}
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {result.nmlsNumber ? `NMLS: ${result.nmlsNumber}` : `License: ${result.licenseNumber}`}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Stats & Add Button */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 border-t md:border-t-0 md:border-l border-[#EAE7E0] pt-4 md:pt-0 md:pl-6">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] font-bold text-[#9A9488] uppercase">12Mo Production</p>
                      <p className="text-lg font-black text-[#2D362E]">
                        ${(result.production12MoVolume / 1000000).toFixed(1)}M
                      </p>
                      <p className="text-xs font-medium text-[#606C5D]">
                        {result.production12MoUnits} Units • {result.experienceYears} Yrs Exp
                      </p>
                    </div>
                    <button
                      onClick={() => handleAdd(result)}
                      disabled={addingId === result.id}
                      className="bg-[#C18C5D] hover:bg-[#A37449] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-70 shrink-0 cursor-pointer"
                    >
                      {addingId === result.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      Import to Pipeline
                    </button>
                  </div>

                </div>
              ))}
            </div>
          ) : hasSearched ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-[#2D362E] mb-1">No matches found</h3>
              <p className="text-[#606C5D] max-w-md mx-auto">
                No {type === 'lo' ? 'Loan Officers' : 'Realtors'} found matching your specific location and production criteria. Try broadening your minimum filters.
              </p>
            </div>
          ) : (
            <div className="py-16 text-center text-[#9A9488]">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-lg">Enter criteria and search to find top producers...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
