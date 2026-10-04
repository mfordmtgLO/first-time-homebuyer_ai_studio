import React, { useState, useRef, useEffect } from "react";
import { Search, UserCheck, X, Check, DollarSign, Sparkles, UserPlus, Phone, Mail, MapPin } from "lucide-react";
import { CapturedLead, FinancialProfile } from "../types";

interface LeadScenarioSearchProps {
  leads: CapturedLead[];
  selectedLead: CapturedLead | null;
  onSelectLead: (lead: CapturedLead | null) => void;
  onApplyLeadFinancials?: (lead: CapturedLead) => void;
  toolName?: string;
}

export const LeadScenarioSearch: React.FC<LeadScenarioSearchProps> = ({
  leads = [],
  selectedLead,
  onSelectLead,
  onApplyLeadFinancials,
  toolName = "Scenario Calculator"
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredLeads = leads.filter(lead => {
    if (!searchTerm.trim()) return false;
    const term = searchTerm.toLowerCase();
    const nameMatch = lead.fullName.toLowerCase().includes(term);
    const emailMatch = lead.email?.toLowerCase().includes(term);
    const phoneMatch = lead.phone?.toLowerCase().includes(term);
    const locMatch = lead.preferredLocations?.toLowerCase().includes(term);
    return nameMatch || emailMatch || phoneMatch || locMatch;
  });

  const handleSelect = (lead: CapturedLead) => {
    onSelectLead(lead);
    setSearchTerm("");
    setIsOpen(false);
    if (onApplyLeadFinancials) {
      onApplyLeadFinancials(lead);
    }
  };

  const handleClear = () => {
    onSelectLead(null);
    setSearchTerm("");
  };

  return (
    <div className="relative w-full bg-[#FAF9F5] p-3.5 sm:p-4 rounded-2xl border border-[#EAE7E0] shadow-2xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#4A5D4E] bg-emerald-100/70 text-emerald-900 px-2 py-0.5 rounded-md border border-emerald-300/60">
              <Sparkles className="w-3 h-3 text-emerald-700" />
              Lead Database Auto-Link
            </span>
            <span className="text-xs text-[#9A9488]">Search & attach scenario to active lead profile</span>
          </div>
          <p className="text-xs text-[#606C5D]">
            Type a borrower's name to instantly pre-fill parameters and auto-save calculated results into their profile.
          </p>
        </div>

        {/* Selected Lead Badge or Search Input */}
        {selectedLead ? (
          <div className="flex items-center gap-3 bg-white px-3.5 py-2 rounded-xl border border-emerald-400 shadow-xs">
            <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-serif text-xs font-bold shrink-0">
              {(selectedLead.fullName || "Client").split(" ").map(n => n[0]).slice(0, 2).join("")}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#2D362E]">{selectedLead.fullName || "Client"}</span>
                <span 
                  className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300"
                  title="Scenario engine is actively linked to this borrower"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  Linked Active
                </span>
              </div>
              <div className="text-[11px] text-[#606C5D] flex items-center gap-2">
                <span>{selectedLead.email}</span>
                {selectedLead.savedScenarios && selectedLead.savedScenarios.length > 0 && (
                  <span className="font-semibold text-[#C18C5D]">({selectedLead.savedScenarios.length} saved scenarios)</span>
                )}
              </div>
            </div>
            <button
              onClick={handleClear}
              title="Unlink / Switch Lead"
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-[#606C5D] hover:text-red-700 bg-[#F1EFE9] hover:bg-red-50 rounded-lg border border-[#EAE7E0] transition-colors ml-1 cursor-pointer shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              <span>Unlink</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {leads.length > 0 && (
              <div className="hidden lg:flex items-center gap-1.5">
                <span className="text-[10px] text-[#9A9488] font-bold uppercase tracking-wider">Quick Link:</span>
                {leads.slice(0, 2).map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => handleSelect(l)}
                    className="px-2 py-1 text-[10px] font-bold rounded-lg bg-white border border-[#EAE7E0] hover:border-emerald-500 text-[#4A5D4E] hover:bg-emerald-50 transition-colors cursor-pointer"
                  >
                    + {(l.fullName || "Client").split(" ")[0]}
                  </button>
                ))}
              </div>
            )}
            <div className="relative w-full md:w-80" ref={dropdownRef}>
              <div className="relative">
                <Search className="w-4 h-4 text-[#9A9488] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsOpen(true);
                  }}
                  onFocus={() => setIsOpen(true)}
                  placeholder="Type borrower name to link..."
                  className="w-full pl-9 pr-8 py-2 bg-white border border-[#EAE7E0] rounded-xl text-xs text-[#2D362E] placeholder:text-[#9A9488] focus:outline-none focus:border-[#4A5D4E] shadow-2xs font-medium"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9A9488] hover:text-[#2D362E]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Dropdown Menu */}
              {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-[#EAE7E0] shadow-xl z-50 max-h-64 overflow-y-auto p-1.5 space-y-1">
                  {(searchTerm.trim().length === 0 ? leads : filteredLeads).length > 0 ? (
                    (searchTerm.trim().length === 0 ? leads.slice(0, 5) : filteredLeads).map(lead => (
                      <button
                        key={lead.id}
                        onClick={() => handleSelect(lead)}
                        className="w-full text-left p-2.5 hover:bg-[#FAF9F5] rounded-xl transition-all flex items-start gap-3 border border-transparent hover:border-[#EAE7E0]"
                      >
                        <div className="w-7 h-7 rounded-full bg-[#4A5D4E] text-white flex items-center justify-center font-serif text-xs font-bold shrink-0 mt-0.5">
                          {(lead.fullName || "Client").split(" ").map(n => n[0]).slice(0, 2).join("")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-[#2D362E] truncate">{lead.fullName || "Client"}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#F1EFE9] text-[#4A5D4E] font-medium shrink-0">
                              {lead.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#606C5D] truncate flex items-center gap-1.5 mt-0.5">
                            <span>{lead.email}</span>
                            <span>•</span>
                            <span>{lead.targetPriceRange || "Flexible Target"}</span>
                          </div>
                          {lead.preferredLocations && (
                            <div className="text-[10px] text-[#9A9488] truncate flex items-center gap-1 mt-0.5">
                              <MapPin className="w-2.5 h-2.5 text-[#C18C5D]" />
                              <span>{lead.preferredLocations}</span>
                            </div>
                          )}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-[#9A9488]">
                      No leads found matching "<span className="font-semibold text-[#2D362E]">{searchTerm}</span>" in database.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
