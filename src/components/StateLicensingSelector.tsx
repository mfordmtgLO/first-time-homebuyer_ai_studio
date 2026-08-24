import React, { useState, useMemo, useRef, useEffect } from "react";
import { 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  X, 
  ChevronDown, 
  ShieldCheck, 
  RefreshCw, 
  Calendar,
  Sparkles,
  Building2
} from "lucide-react";

export const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

interface StateLicensingSelectorProps {
  selectedStates: string[];
  verificationYear?: number;
  lastVerifiedDate?: string;
  onUpdate: (states: string[], verifiedYear: number, verifiedDate: string) => void;
  readOnly?: boolean;
}

export const StateLicensingSelector: React.FC<StateLicensingSelectorProps> = ({
  selectedStates = [],
  verificationYear,
  lastVerifiedDate,
  onUpdate,
  readOnly = false,
}) => {
  const currentYear = new Date().getFullYear();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check if current compliance is verified for this calendar year
  const isVerifiedForCurrentYear = Boolean(
    verificationYear === currentYear && selectedStates.length > 0
  );

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered states based on search query
  const filteredStates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return US_STATES;
    return US_STATES.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.code.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Toggle selection of a state and automatically refresh annual verification
  const handleToggleState = (stateName: string) => {
    if (readOnly) return;
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    let updated: string[];
    if (selectedStates.includes(stateName)) {
      updated = selectedStates.filter((s) => s !== stateName);
    } else {
      updated = [...selectedStates, stateName];
    }

    // Automatically re-verify for current calendar year upon user selection
    onUpdate(updated, currentYear, todayStr);
  };

  // Remove a single state chip
  const handleRemoveState = (stateName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (readOnly) return;
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const updated = selectedStates.filter((s) => s !== stateName);
    onUpdate(updated, currentYear, todayStr);
  };

  // Quick select presets
  const handleSelectPreset = (presetStates: string[]) => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const combined = Array.from(new Set([...selectedStates, ...presetStates]));
    onUpdate(combined, currentYear, todayStr);
  };

  // Manual re-verification button for current year
  const handleReVerifyAllForNewYear = () => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    onUpdate(selectedStates, currentYear, todayStr);
  };

  // Simulate / Test 1/1 compliance expiration
  const handleSimulateExpiredOnJan1 = () => {
    const priorYear = currentYear - 1;
    onUpdate(selectedStates, priorYear, `${priorYear}-12-15`);
  };

  return (
    <div className="space-y-3">
      {/* Compliance Status Header Banner */}
      <div
        className={`p-4 rounded-2xl border transition-all duration-300 ${
          isVerifiedForCurrentYear
            ? "bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-2xs"
            : "bg-red-50/90 border-red-300 text-red-950 shadow-xs"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            {isVerifiedForCurrentYear ? (
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs shrink-0 mt-0.5 sm:mt-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs shrink-0 animate-pulse mt-0.5 sm:mt-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-xs sm:text-sm">
                  {isVerifiedForCurrentYear
                    ? `NMLS Origination License Compliance • Verified ${currentYear}`
                    : "Annual NMLS License Re-Selection Required"}
                </span>

                {isVerifiedForCurrentYear ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Active Green Compliance</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600 text-white border border-red-700 flex items-center gap-1 shadow-2xs">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Re-select Annually (Reset 1/1)</span>
                  </span>
                )}
              </div>

              <p className="text-xs mt-0.5 opacity-90 leading-relaxed">
                {isVerifiedForCurrentYear ? (
                  <span>
                    Licensed in <strong className="font-bold text-emerald-900">{selectedStates.length} State{selectedStates.length === 1 ? "" : "s"}</strong> for the <strong>{currentYear}</strong> calendar year. Automatically resets on 1/1 each year.
                    {lastVerifiedDate && <span className="text-[11px] text-emerald-700 ml-1.5">(Last confirmed: {lastVerifiedDate})</span>}
                  </span>
                ) : (
                  <span className="text-red-900 font-medium">
                    ⚠️ <strong>Compliance notice:</strong> Annual renewal triggered on 1/1. Use the dropdown below to select/confirm your active state licenses for <strong>{currentYear}</strong> to restore your green checkmark.
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Quick Action / Simulator controls */}
          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            {!isVerifiedForCurrentYear && selectedStates.length > 0 && (
              <button
                type="button"
                onClick={handleReVerifyAllForNewYear}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                title="Confirm states and re-verify for the current year"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Confirm for {currentYear}</span>
              </button>
            )}

            {/* Simulated 1/1 Reset Toggle for Demo/Testing */}
            <button
              type="button"
              onClick={isVerifiedForCurrentYear ? handleSimulateExpiredOnJan1 : handleReVerifyAllForNewYear}
              className="text-[10px] px-2.5 py-1 rounded-lg bg-white/80 hover:bg-white text-[#606C5D] border border-[#EAE7E0] transition-colors"
              title="Test annual 1/1 compliance state switch"
            >
              {isVerifiedForCurrentYear ? "Simulate 1/1 Expired" : "Simulate Green Active"}
            </button>
          </div>
        </div>
      </div>

      {/* Dropdown Container & Selected Chips */}
      <div className="space-y-2" ref={dropdownRef}>
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#2D362E] flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#4A5D4E]" />
            <span>Search & Select Licensed Mortgage Origination States</span>
            <span className="text-[11px] font-semibold text-[#4A5D4E] bg-[#4A5D4E]/10 px-2 py-0.5 rounded-md">
              {selectedStates.length} Selected
            </span>
          </label>

          {/* Preset Buttons */}
          {!readOnly && (
            <div className="flex items-center gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleSelectPreset(["Oregon", "Washington", "California", "Idaho"])}
                className="text-[#4A5D4E] hover:underline font-semibold"
              >
                + Pacific NW
              </button>
              <span className="text-[#9A9488]">•</span>
              <button
                type="button"
                onClick={() => {
                  const now = new Date();
                  onUpdate([], currentYear, now.toISOString().split("T")[0]);
                }}
                className="text-red-600 hover:underline font-semibold"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Search & Trigger Box */}
        <div
          onClick={() => !readOnly && setIsOpen((prev) => !prev)}
          className={`w-full bg-[#FAF9F5] border rounded-2xl p-2.5 min-h-[46px] cursor-pointer transition-all flex items-center justify-between gap-2 ${
            isOpen ? "border-[#4A5D4E] ring-2 ring-[#4A5D4E]/10 bg-white" : "border-[#EAE7E0] hover:border-[#4A5D4E]/60"
          }`}
        >
          {/* Selected State Tags / Chips */}
          <div className="flex items-center gap-1.5 flex-wrap flex-1">
            {selectedStates.length === 0 ? (
              <span className="text-xs text-[#9A9488] italic px-1">
                Click here or search to select state mortgage licenses (e.g. Oregon, Washington, California)...
              </span>
            ) : (
              selectedStates.map((stateName) => {
                const stateObj = US_STATES.find((s) => s.name.toLowerCase() === stateName.toLowerCase());
                return (
                  <span
                    key={stateName}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-[#EAE7E0] text-xs font-semibold text-[#2D362E] shadow-2xs hover:bg-[#F4F1EA] transition-colors"
                  >
                    <span className="w-5 h-4 bg-[#4A5D4E] text-white text-[9px] font-bold rounded flex items-center justify-center font-mono">
                      {stateObj ? stateObj.code : stateName.slice(0, 2).toUpperCase()}
                    </span>
                    <span>{stateName}</span>
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={(e) => handleRemoveState(stateName, e)}
                        className="text-[#9A9488] hover:text-red-600 rounded p-0.5 ml-0.5"
                        title={`Remove ${stateName}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                );
              })
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[#606C5D] shrink-0">
            {isVerifiedForCurrentYear ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" title={`Verified for ${currentYear}`} />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 animate-bounce" title="Re-select Annually" />
            )}
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#4A5D4E]" : ""}`} />
          </div>
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="bg-white border border-[#EAE7E0] rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 z-30">
            {/* Search Input Filter */}
            <div className="p-3 border-b border-[#EAE7E0] bg-[#FAF9F5]">
              <div className="relative">
                <Search className="w-4 h-4 text-[#9A9488] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Type to search any state or 2-letter abbreviation (e.g. OR, California, TX)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full bg-white border border-[#EAE7E0] rounded-xl pl-9 pr-8 py-2 text-xs focus:outline-none focus:border-[#4A5D4E]"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchQuery("");
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9A9488] hover:text-[#2D362E]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* List of States */}
            <div className="max-h-60 overflow-y-auto p-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5">
              {filteredStates.length === 0 ? (
                <div className="col-span-full text-center py-6 text-xs text-[#9A9488]">
                  No states matching &quot;{searchQuery}&quot;
                </div>
              ) : (
                filteredStates.map((state) => {
                  const isSelected = selectedStates.some(
                    (s) => s.toLowerCase() === state.name.toLowerCase()
                  );
                  return (
                    <button
                      key={state.code}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleState(state.name);
                      }}
                      className={`flex items-center justify-between p-2 rounded-xl text-xs text-left transition-all ${
                        isSelected
                          ? "bg-[#4A5D4E] text-white font-bold shadow-xs"
                          : "bg-[#FAF9F5] hover:bg-[#F1EFE9] text-[#2D362E]"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className={`w-6 h-5 rounded text-[10px] font-bold font-mono flex items-center justify-center shrink-0 ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-[#EAE7E0] text-[#4A5D4E]"
                          }`}
                        >
                          {state.code}
                        </span>
                        <span className="truncate">{state.name}</span>
                      </div>

                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 ml-1 text-emerald-300" />}
                    </button>
                  );
                })
              )}
            </div>

            {/* Dropdown Footer */}
            <div className="p-2.5 border-t border-[#EAE7E0] bg-[#FAF9F5] flex items-center justify-between text-xs">
              <span className="text-[11px] text-[#606C5D]">
                Selecting states automatically certifies and verifies your <strong>{currentYear} NMLS compliance</strong>.
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 bg-[#4A5D4E] text-white font-bold rounded-lg text-xs hover:bg-[#38463B]"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
