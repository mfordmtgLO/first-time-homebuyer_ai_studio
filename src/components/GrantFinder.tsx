import React, { useState } from "react";
import { 
  Award, 
  Search, 
  Filter, 
  ExternalLink, 
  CheckCircle2, 
  DollarSign, 
  CreditCard, 
  ShieldCheck,
  Building,
  HelpCircle,
  MapPin,
  Sparkles
} from "lucide-react";
import { GrantProgram } from "../types";
import { GRANT_PROGRAMS } from "../data/initialData";

export const GrantFinder: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedType, setSelectedType] = useState("All");

  const regions = [
    { id: "All", label: "All Oregon Programs" },
    { id: "Statewide", label: "Statewide OR (OHCS / ODVA / USDA / Fannie)" },
    { id: "Portland", label: "Portland Metro & Multnomah County" },
    { id: "DevNW", label: "Willamette Valley & Central OR (DevNW)" },
    { id: "Umpqua", label: "Southern & Coastal Oregon" }
  ];

  const types = [
    "All", 
    "Forgivable Grant", 
    "Silent Second Loan", 
    "Matched Savings", 
    "0% Down Program"
  ];

  const filteredGrants = GRANT_PROGRAMS.filter(grant => {
    const matchesSearch = 
      grant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grant.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grant.provider.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRegion =
      selectedRegion === "All" ||
      (selectedRegion === "Statewide" && (grant.scope === "State" && !grant.id.includes("phb") && !grant.id.includes("umpqua"))) ||
      (selectedRegion === "Portland" && (grant.id.includes("phb") || grant.id.includes("proudground") || grant.scope === "State")) ||
      (selectedRegion === "DevNW" && (grant.id.includes("devnw") || grant.scope === "State")) ||
      (selectedRegion === "Umpqua" && (grant.id.includes("umpqua") || grant.scope === "State"));

    const matchesType =
      selectedType === "All" ||
      grant.assistanceType === selectedType;

    return matchesSearch && matchesRegion && matchesType;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#EAE7E0] p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1EFE9] text-[#4A5D4E] text-xs font-semibold border border-[#EAE7E0]">
            <MapPin className="w-3.5 h-3.5 text-[#C18C5D]" />
            <span>State of Oregon Verified DPA Directory</span>
          </div>
          <span className="text-xs font-semibold text-[#606C5D] bg-[#F9F8F4] px-3 py-1 rounded-full border border-[#EAE7E0]">
            {GRANT_PROGRAMS.length} Oregon-Eligible Programs Active
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D362E]">
          Oregon Down Payment Assistance, Grants & 0% Down Programs
        </h2>
        <p className="text-sm text-[#606C5D] max-w-3xl leading-relaxed">
          Comprehensive directory of state-funded assistance programs, forgivable grants, matched savings IDAs, and zero-down mortgage options specifically eligible for first-time homebuyers in Oregon.
        </p>

        {/* Quick Highlights Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 bg-[#F9F8F4] rounded-2xl border border-[#EAE7E0] text-xs space-y-0.5">
            <span className="font-bold text-[#4A5D4E] block">OHCS State Cash Assist</span>
            <span className="text-[#606C5D]">3% to 5% cash-to-close assistance across all 36 OR counties.</span>
          </div>
          <div className="p-3 bg-[#F9F8F4] rounded-2xl border border-[#EAE7E0] text-xs space-y-0.5">
            <span className="font-bold text-[#C18C5D] block">DevNW Matched Savings (5:1)</span>
            <span className="text-[#606C5D]">Up to $20,000 free equity match through Oregon IDA Initiative.</span>
          </div>
          <div className="p-3 bg-[#F9F8F4] rounded-2xl border border-[#EAE7E0] text-xs space-y-0.5">
            <span className="font-bold text-[#2D362E] block">Portland DPAL (Up to $100k)</span>
            <span className="text-[#606C5D]">0% interest, 30-year deferred second loan for Portland city buyers.</span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="pt-4 grid grid-cols-1 sm:grid-cols-12 gap-3 border-t border-[#EAE7E0]">
          {/* Search bar */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-[#9A9488] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by OHCS, Portland DPAL, DevNW IDA, ODVA, USDA..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#2D362E] placeholder-[#9A9488] focus:outline-none focus:border-[#4A5D4E]"
            />
          </div>

          {/* Oregon Region Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2.5 text-xs sm:text-sm text-[#2D362E] font-medium focus:outline-none focus:border-[#4A5D4E]"
            >
              {regions.map(r => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Program Type Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2.5 text-xs sm:text-sm text-[#2D362E] font-medium focus:outline-none focus:border-[#4A5D4E]"
            >
              {types.map(t => (
                <option key={t} value={t}>
                  {t === "All" ? "All Program Types" : t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Program Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredGrants.map((grant) => (
          <div
            key={grant.id}
            className="bg-white rounded-2xl border border-[#EAE7E0] p-6 flex flex-col justify-between space-y-5 hover:border-[#4A5D4E] transition-all shadow-sm"
          >
            <div className="space-y-3">
              {/* Header tags */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#F1EFE9] text-[#4A5D4E] border border-[#EAE7E0] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#C18C5D]" />
                  <span>{grant.scope === "County" ? "Oregon County Program" : "Oregon Statewide"}</span>
                </span>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#C18C5D]/10 text-[#C18C5D] border border-[#C18C5D]/20">
                  {grant.assistanceType}
                </span>
              </div>

              {/* Title & Provider */}
              <div>
                <h3 className="text-lg font-bold text-[#2D362E] leading-snug">
                  {grant.name}
                </h3>
                <span className="text-xs text-[#9A9488] font-medium">
                  Provided by {grant.provider}
                </span>
              </div>

              {/* Assistance Amount Banner */}
              <div className="bg-[#F1EFE9] p-3 rounded-xl border border-[#EAE7E0] flex items-center justify-between">
                <span className="text-xs text-[#606C5D]">Assistance Max:</span>
                <span className="text-xs sm:text-sm font-bold text-[#4A5D4E]">
                  {grant.maxAssistance}
                </span>
              </div>

              <p className="text-xs text-[#606C5D] leading-relaxed">
                {grant.description}
              </p>

              {/* Requirement Chips */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 text-[#606C5D]">
                <div className="flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#4A5D4E] shrink-0" />
                  <span>Min Credit: <strong className="text-[#2D362E]">{grant.minCreditScore}+</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#4A5D4E] shrink-0" />
                  <span className="truncate">Income: <strong className="text-[#2D362E]">{grant.incomeLimitDescription.slice(0, 24)}...</strong></span>
                </div>
              </div>

              {/* Highlights */}
              <div className="space-y-1.5 pt-2 border-t border-[#EAE7E0] text-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#9A9488]">Key Program Perks:</span>
                {grant.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-[#2D362E]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#4A5D4E] shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#EAE7E0]">
              <a
                href={grant.link}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-[#F1EFE9] hover:bg-[#EAE7E0] text-[#2D362E] font-semibold text-xs flex items-center justify-center gap-2 transition-colors border border-[#EAE7E0]"
              >
                <span>Official Oregon Guidelines & Application</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {filteredGrants.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-[#EAE7E0] space-y-3">
          <Award className="w-10 h-10 text-[#9A9488] mx-auto" />
          <h4 className="text-[#2D362E] font-bold text-base">No matching Oregon assistance programs found</h4>
          <p className="text-xs text-[#606C5D]">Try adjusting your search terms or region filter.</p>
        </div>
      )}
    </div>
  );
};
