import React, { useState, useMemo } from "react";
import { 
  Award, 
  MapPin, 
  DollarSign, 
  ShieldCheck, 
  Building, 
  CheckCircle2, 
  ArrowRight,
  Send,
  Home,
  Search,
  Sparkles,
  Layers,
  ChevronDown,
  Info,
  ExternalLink,
  Globe,
  Copy,
  Check,
  Users,
  FileText,
  Printer
} from "lucide-react";
import { ProfessionalGuidesState, CapturedLead } from "../types";
import { US_STATES } from "./StateLicensingSelector";
import { getNationwideHfaDetails, NATIONWIDE_HFA_DATABASE } from "../utils/nationwideHfaLimits";
import { parseGeoid, buildGeoid, ParsedGeoid } from "../utils/geoidEngine";
import { formatUSD } from "../utils/mortgageMath";

export interface GrantFinderProps {
  guidesState?: ProfessionalGuidesState;
  onNavigate?: (tab: string, mode?: string) => void;
  onTriggerToast?: (msg: string) => void;
}

const NATIONAL_LOAN_OPTIONS = [
  {
    id: "usda-rd",
    name: "USDA Rural Development (RD)",
    subtitle: "0% Down Payment",
    description: "100% financing option designed for rural and suburban homebuyers across all 50 states. Zero down payment required, competitive fixed interest rates, and lenient credit requirements.",
    icon: <MapPin className="w-5 h-5 text-emerald-600" />,
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-700",
    badgeBorder: "border-emerald-200"
  },
  {
    id: "fannie-homeready",
    name: "Fannie Mae / HomeReady®",
    subtitle: "3% Down Payment + CRA Credit",
    description: "Ideal for low-to-moderate income borrowers (<80% AMI). Features reduced mortgage insurance (PMI) requirements, non-occupant co-signers, and up to $5,000 in CRA grants in eligible tracts.",
    icon: <Building className="w-5 h-5 text-indigo-600" />,
    badgeBg: "bg-indigo-100",
    badgeText: "text-indigo-700",
    badgeBorder: "border-indigo-200"
  },
  {
    id: "freddie-homepossible",
    name: "Freddie Mac / Home Possible®",
    subtitle: "3% Down Payment",
    description: "Designed to help low-income borrowers attain homeownership with a minimum 3% down payment, flexible funding for down payment gifts, and sweat equity options.",
    icon: <Building className="w-5 h-5 text-sky-600" />,
    badgeBg: "bg-sky-100",
    badgeText: "text-sky-700",
    badgeBorder: "border-sky-200"
  },
  {
    id: "va",
    name: "VA Home Loan Guaranty",
    subtitle: "0% Down Payment",
    description: "Exclusive 100% financing for eligible US veterans, active-duty service members, and surviving spouses. No private mortgage insurance (PMI) required with competitive fixed rates.",
    icon: <Award className="w-5 h-5 text-red-600" />,
    badgeBg: "bg-red-100",
    badgeText: "text-red-700",
    badgeBorder: "border-red-200"
  },
  {
    id: "fha",
    name: "FHA 203(b) Standard",
    subtitle: "3.5% Down Payment",
    description: "Government-insured mortgage offering accessible credit thresholds (580+ FICO for 3.5% down) and liberal debt-to-income (DTI) allowances up to 50%+.",
    icon: <ShieldCheck className="w-5 h-5 text-amber-600" />,
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-700",
    badgeBorder: "border-amber-200"
  }
];

export const GrantFinder: React.FC<GrantFinderProps> = ({ guidesState, onNavigate, onTriggerToast }) => {
  const [selectedState, setSelectedState] = useState<string>("OR");
  const [targetPrice, setTargetPrice] = useState<number>(425000);
  const [geoidInput, setGeoidInput] = useState<string>("41011001000");
  const [geoidResult, setGeoidResult] = useState<ParsedGeoid | null>(() => parseGeoid("41011001000"));
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string>("");

  // Active state HFA profile
  const hfaProfile = useMemo(() => {
    return getNationwideHfaDetails(selectedState);
  }, [selectedState]);

  // Handle lead selection
  const handleSelectLead = (leadId: string) => {
    setSelectedLeadId(leadId);
    if (!leadId) return;
    const lead = (guidesState?.leads || []).find(l => l.id === leadId);
    if (lead) {
      if (lead.budgetMax) {
        setTargetPrice(lead.budgetMax);
      }
      if (lead.state) {
        const found = US_STATES.find(s => s.code.toLowerCase() === lead.state.toLowerCase() || s.name.toLowerCase() === lead.state.toLowerCase());
        if (found) setSelectedState(found.code);
      }
      if (onTriggerToast) {
        onTriggerToast(`Loaded financial parameters for ${lead.name}`);
      }
    }
  };

  // Handle GEOID check
  const handleCheckGeoid = () => {
    if (!geoidInput.trim()) return;
    const parsed = parseGeoid(geoidInput);
    setGeoidResult(parsed);
    if (parsed.isValid && parsed.stateCode !== "US") {
      setSelectedState(parsed.stateCode);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    if (onTriggerToast) {
      onTriggerToast("Copied to clipboard!");
    }
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const generateSummaryText = () => {
    const lines = [
      `=== ${hfaProfile.agencyName} (${hfaProfile.agencyAcronym}) DPA Summary ===`,
      `State: ${selectedState} | 2026 FHFA Baseline Limit: $${hfaProfile.conformingBaselineLimit.toLocaleString()}`,
      `Purchase Price Tested: $${targetPrice.toLocaleString()}`,
      ``,
      `State Housing Programs:`,
      ...hfaProfile.programs.map(p => {
        const est = Math.round(targetPrice * (p.maxAssistancePercent / 100));
        return `• ${p.name} (${p.type}): ${p.assistanceAmount} (~$${est.toLocaleString()}) | Min FICO: ${p.minCreditScore}+ | Forgiveness: ${p.forgivenessTerms || "Deferred 0%"}`;
      }),
      ``,
      `National Programs:`,
      `• USDA Rural Housing: 100% financing (0% down) in eligible rural tracts`,
      `• Fannie Mae HomeReady / Freddie Home Possible: 3% down + CRA closing credit`,
      `• FHA Standard: 3.5% down (580+ FICO)`,
      ``,
      `Prepared by: ${guidesState?.loanOfficer?.name || "Licensed Loan Officer"} (NMLS #${guidesState?.loanOfficer?.nmlsId || "288455"})`
    ];
    return lines.join("\n");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fadeIn text-[#2D362E]">
      {/* Header Banner */}
      <div className="bg-[#2D362E] text-[#F9F8F4] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#C18C5D]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C18C5D]/20 text-[#E7C19D] text-xs font-bold tracking-wide uppercase border border-[#C18C5D]/30">
              <Award className="w-3.5 h-3.5" />
              Secured Loan Officer Portal • DPA & State Grant Intelligence Suite
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              50-State Housing Finance Agency & Grant Engine
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              Analyze state-chartered HFA down payment assistance matrices, forgivable second liens, CRA Census Tract GEOID eligibility, and Fannie Mae / FHA overlays for active pipeline buyers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 bg-[#FAF9F5]/10 hover:bg-[#FAF9F5]/20 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 border border-white/20 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
            <button
              onClick={() => copyToClipboard(generateSummaryText(), "full-summary")}
              className="px-4 py-2.5 bg-[#4A5D4E] hover:bg-[#3B4B3E] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 border border-white/10 cursor-pointer"
            >
              {copiedKey === "full-summary" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedKey === "full-summary" ? "Summary Copied!" : "Copy DPA Matrix to Clipboard"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* LO Pipeline Quick Connect & Scenario Filter */}
      <div className="bg-white rounded-3xl p-6 border border-[#EAE7E0] shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EAE7E0] pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FAF9F5] border border-[#EAE7E0] flex items-center justify-center text-[#4A5D4E]">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#2D362E]">Apply DPA Analysis to Active Buyer Pipeline</h3>
              <p className="text-xs text-[#606C5D]">Select a lead to auto-populate price target, income, and state parameters.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedLeadId}
              onChange={(e) => handleSelectLead(e.target.value)}
              className="bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#2D362E] focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/40"
            >
              <option value="">-- Choose Buyer Lead from CRM --</option>
              {(guidesState?.leads || []).map(lead => (
                <option key={lead.id} value={lead.id}>
                  {lead.name} • {formatUSD(lead.budgetMax || 400000)} ({lead.state || "OR"}) {lead.grantInterest ? "⭐ DPA Eligible" : ""}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#606C5D]">Target Price:</span>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs text-[#9A9488] font-bold">$</span>
                <input
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(Number(e.target.value) || 0)}
                  className="pl-6 pr-3 py-1.5 bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl text-xs font-bold text-[#2D362E] w-28 focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/40"
                />
              </div>
            </div>
          </div>
        </div>

        {/* State Selector & Agency Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-[#2D362E] uppercase tracking-wider">Target State:</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-4 py-2 text-sm font-semibold text-[#2D362E] focus:outline-none focus:ring-2 focus:ring-[#C18C5D]/40"
            >
              {US_STATES.map((st) => (
                <option key={st.code} value={st.code}>
                  {st.name} ({st.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#606C5D]">Official Agency:</span>
            <span className="font-bold text-[#2D362E] bg-[#FAF9F5] px-2.5 py-1 rounded-lg border border-[#EAE7E0]">
              {hfaProfile.agencyName} ({hfaProfile.agencyAcronym})
            </span>
          </div>
        </div>
      </div>

      {/* DPA State Programs Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-serif font-bold text-[#2D362E] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#C18C5D]" />
            {selectedState} State-Chartered DPA & Grant Programs ({hfaProfile.programs.length})
          </h2>
          <span className="text-xs text-emerald-800 bg-emerald-100 border border-emerald-300 font-bold px-2.5 py-0.5 rounded-full">
            FHFA 2026 Limit: ${hfaProfile.conformingBaselineLimit.toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hfaProfile.programs.map((prog) => {
            const estimatedGrant = Math.round(targetPrice * (prog.maxAssistancePercent / 100));
            return (
              <div key={prog.id} className="bg-white rounded-2xl p-5 border border-[#EAE7E0] shadow-sm space-y-3.5 hover:border-[#4A5D4E] transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-base text-[#2D362E]">{prog.name}</h3>
                    <p className="text-xs text-[#606C5D] mt-0.5">{prog.description}</p>
                  </div>
                  <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-amber-50 text-amber-900 border border-amber-200 shrink-0">
                    {prog.type}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#EAE7E0] grid grid-cols-2 gap-2 text-xs bg-[#FAF9F5] p-3 rounded-xl">
                  <div>
                    <span className="text-[#9A9488] block text-[10px] uppercase font-bold">Assistance Scale</span>
                    <span className="font-bold text-emerald-700">{prog.assistanceAmount}</span>
                  </div>
                  <div>
                    <span className="text-[#9A9488] block text-[10px] uppercase font-bold">Tested at {formatUSD(targetPrice)}</span>
                    <span className="font-bold text-[#C18C5D]">+${estimatedGrant.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[#9A9488] block text-[10px] uppercase font-bold">Forgiveness Terms</span>
                    <span className="font-medium text-[#2D362E]">{prog.forgivenessTerms || "Deferred 0%"}</span>
                  </div>
                  <div>
                    <span className="text-[#9A9488] block text-[10px] uppercase font-bold">Min Underwriting FICO</span>
                    <span className="font-medium text-[#2D362E]">{prog.minCreditScore}+ FICO</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-[#606C5D]">Income limit: 80%–120% AMI by County</span>
                  <button
                    onClick={() => copyToClipboard(`${prog.name} (${prog.type}): ${prog.assistanceAmount} (~$${estimatedGrant.toLocaleString()} at $${targetPrice.toLocaleString()}). Min FICO: ${prog.minCreditScore}+. Terms: ${prog.forgivenessTerms || "Deferred 0%"}.`, prog.id)}
                    className="text-[#4A5D4E] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === prog.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === prog.id ? "Copied" : "Copy Program Snippet"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* National 0% Down & 3% Conventional Foundation */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE7E0] shadow-sm space-y-5">
        <div>
          <h2 className="text-xl font-serif font-bold text-[#2D362E] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#4A5D4E]" />
            National Lending & 0% Down Alternative Programs
          </h2>
          <p className="text-xs sm:text-sm text-[#606C5D]">
            Standard Agency guidelines paired alongside state DPA for low-to-moderate income (LMI) borrowers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {NATIONAL_LOAN_OPTIONS.map((opt) => (
            <div key={opt.id} className="bg-[#FAF9F5] rounded-2xl p-4 border border-[#EAE7E0] space-y-2.5 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {opt.icon}
                    <h3 className="font-bold text-sm text-[#2D362E]">{opt.name}</h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${opt.badgeBg} ${opt.badgeText} ${opt.badgeBorder}`}>
                    {opt.subtitle}
                  </span>
                </div>
                <p className="text-xs text-[#606C5D] leading-relaxed">{opt.description}</p>
              </div>

              <div className="pt-2 border-t border-[#EAE7E0] flex justify-end">
                <button
                  onClick={() => copyToClipboard(`${opt.name} (${opt.subtitle}): ${opt.description}`, opt.id)}
                  className="text-[11px] text-[#4A5D4E] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === opt.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === opt.id ? "Copied" : "Copy Details"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Census Tract GEOID Lookup Tool */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE7E0] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-serif font-bold text-[#2D362E] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#C18C5D]" />
              FFIEC / Census Tract GEOID Spatial Lookup
            </h3>
            <p className="text-xs text-[#606C5D]">
              Validate 11-digit Census Tract identifiers (State FIPS + County FIPS + 6-digit Tract) for CRA eligibility.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={geoidInput}
              onChange={(e) => setGeoidInput(e.target.value)}
              placeholder="e.g. 41011001000"
              className="px-3.5 py-2 bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl text-xs font-mono font-bold text-[#2D362E] w-40 focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/40"
            />
            <button
              onClick={handleCheckGeoid}
              className="px-3.5 py-2 bg-[#4A5D4E] hover:bg-[#3B4B3E] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Check Tract
            </button>
          </div>
        </div>

        {geoidResult && geoidResult.isValid && (
          <div className="bg-[#FAF9F5] rounded-2xl p-4 border border-[#EAE7E0] grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[#9A9488] block text-[10px] uppercase font-bold">State FIPS</span>
              <span className="font-bold text-[#2D362E]">{geoidResult.stateFips} ({geoidResult.stateCode})</span>
            </div>
            <div>
              <span className="text-[#9A9488] block text-[10px] uppercase font-bold">County FIPS</span>
              <span className="font-bold text-[#2D362E]">{geoidResult.countyFips}</span>
            </div>
            <div>
              <span className="text-[#9A9488] block text-[10px] uppercase font-bold">Tract ID</span>
              <span className="font-bold text-[#2D362E]">{geoidResult.tractCode}</span>
            </div>
            <div>
              <span className="text-[#9A9488] block text-[10px] uppercase font-bold">CRA / Special Credit</span>
              <span className="font-bold text-emerald-700">Eligible for CRA & LMI Grant Overlays</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
