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
  Globe
} from "lucide-react";
import { ProfessionalGuidesState } from "../types";
import { US_STATES } from "./StateLicensingSelector";
import { getNationwideHfaDetails, NATIONWIDE_HFA_DATABASE } from "../utils/nationwideHfaLimits";
import { parseGeoid, buildGeoid, ParsedGeoid } from "../utils/geoidEngine";
import { formatUSD } from "../utils/mortgageMath";

export interface GrantFinderProps {
  guidesState?: ProfessionalGuidesState;
  onNavigate?: (tab: string, mode?: string) => void;
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

export const GrantFinder: React.FC<GrantFinderProps> = ({ guidesState, onNavigate }) => {
  const [selectedState, setSelectedState] = useState<string>("OR");
  const [targetPrice, setTargetPrice] = useState<number>(385000);
  const [geoidInput, setGeoidInput] = useState<string>("41011001000");
  const [geoidResult, setGeoidResult] = useState<ParsedGeoid | null>(() => parseGeoid("41011001000"));

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    desiredArea: "",
    consentToText: false,
  });

  const [submitted, setSubmitted] = useState(false);

  // Active state HFA profile
  const hfaProfile = useMemo(() => {
    return getNationwideHfaDetails(selectedState);
  }, [selectedState]);

  // Handle GEOID check
  const handleCheckGeoid = () => {
    if (!geoidInput.trim()) return;
    const parsed = parseGeoid(geoidInput);
    setGeoidResult(parsed);
    if (parsed.isValid && parsed.stateCode !== "US") {
      setSelectedState(parsed.stateCode);
    }
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto px-4 sm:px-6 py-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-[#2D362E] text-[#F9F8F4] rounded-2xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#C18C5D]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="max-w-3xl relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C18C5D]/20 text-[#C18C5D] text-xs font-bold tracking-wide uppercase border border-[#C18C5D]/30">
            <Globe className="w-3.5 h-3.5" />
            50-State Nationwide Housing Grants & GEOID Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
            Nationwide Down Payment Assistance & Grant Finder
          </h1>
          <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
            Instantly discover state-chartered Housing Finance Agency (HFA) grants, 0% deferred down payment assistance, and Federal CRA census tract boosters across all 50 US States.
          </p>
        </div>
      </div>

      {/* State & HFA Selector Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#EAE7E0] space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EAE7E0] pb-6">
          <div>
            <h2 className="text-xl font-serif font-bold text-[#2D362E] flex items-center gap-2">
              <Building className="w-5 h-5 text-[#C18C5D]" />
              Select Your State Housing Authority
            </h2>
            <p className="text-xs sm:text-sm text-[#4A5D4E]">
              View state-specific down payment assistance, purchase price caps, and income guidelines.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-[#2D362E] uppercase tracking-wider">State:</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-4 py-2.5 text-sm font-semibold text-[#2D362E] focus:outline-none focus:ring-2 focus:ring-[#C18C5D]/40"
            >
              {US_STATES.map((st) => (
                <option key={st.code} value={st.code}>
                  {st.name} ({st.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active State Profile Banner */}
        <div className="bg-[#F9F8F4] rounded-xl p-5 sm:p-6 border border-[#EAE7E0] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#C18C5D]">
                Official State Housing Finance Agency
              </div>
              <div className="text-lg sm:text-xl font-bold text-[#2D362E]">
                {hfaProfile.agencyName} ({hfaProfile.agencyAcronym})
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                2026 FHFA Limit: ${hfaProfile.conformingBaselineLimit.toLocaleString()}
              </span>
            </div>
          </div>

          {/* DPA Programs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {hfaProfile.programs.map((prog) => {
              const estimatedGrant = Math.round(targetPrice * (prog.maxAssistancePercent / 100));
              return (
                <div key={prog.id} className="bg-white rounded-xl p-5 border border-[#EAE7E0] shadow-sm space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm sm:text-base text-[#2D362E]">{prog.name}</h3>
                    <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-amber-50 text-amber-900 border border-amber-200 shrink-0">
                      {prog.type}
                    </span>
                  </div>

                  <p className="text-xs text-[#4A5D4E] leading-relaxed">{prog.description}</p>

                  <div className="pt-2 border-t border-[#EAE7E0]/70 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-stone-500 block">Assistance:</span>
                      <span className="font-bold text-emerald-700">{prog.assistanceAmount}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block">Est. Cash on ${targetPrice.toLocaleString()}:</span>
                      <span className="font-bold text-[#C18C5D]">+${estimatedGrant.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block">Forgiveness:</span>
                      <span className="font-medium text-[#2D362E]">{prog.forgivenessTerms || "Deferred 0%"}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block">Min FICO Score:</span>
                      <span className="font-medium text-[#2D362E]">{prog.minCreditScore}+</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-[#4A5D4E]">
            <div className="flex items-center gap-4">
              <span>Avg Property Tax: <strong>{(hfaProfile.avgPropertyTaxRate * 100).toFixed(2)}%</strong></span>
              <span>•</span>
              <span>FHA Loan Floor: <strong>${hfaProfile.fhaFloorLimit.toLocaleString()}</strong></span>
            </div>
            <a 
              href={hfaProfile.agencyWebsite} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#C18C5D] font-bold hover:underline"
            >
              Visit {hfaProfile.agencyAcronym} Official Portal <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Federal 11-Digit GEOID & Census Tract Engine Scanner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#EAE7E0] space-y-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-700">
            <Layers className="w-4 h-4" />
            Federal Census Tract & CRA Analyzer
          </div>
          <h2 className="text-xl font-serif font-bold text-[#2D362E]">
            11-Digit Federal GEOID Tract Inspector
          </h2>
          <p className="text-xs sm:text-sm text-[#4A5D4E]">
            Analyze any US Census Tract GEOID code (`SSCCCTTTTTT`) to identify FFIEC Low-to-Moderate Income (LMI) grant qualification, USDA Rural Housing eligibility, and Federal Targeted Areas.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={geoidInput}
              onChange={(e) => setGeoidInput(e.target.value)}
              placeholder="Enter 11-digit GEOID e.g. 41011001000 (Oregon Coos Bay)"
              className="w-full pl-10 pr-4 py-2.5 bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl text-sm font-mono text-[#2D362E] focus:outline-none focus:ring-2 focus:ring-teal-500/40"
            />
          </div>
          <button
            type="button"
            onClick={handleCheckGeoid}
            className="px-5 py-2.5 bg-teal-800 text-white font-bold text-sm rounded-xl hover:bg-teal-900 transition-colors shadow-sm shrink-0"
          >
            Inspect GEOID Tract
          </button>
        </div>

        {/* Quick Sample GEOID Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-stone-500 font-medium">Quick Examples:</span>
          {[
            { label: "Coos Bay, OR", geoid: "41011001000" },
            { label: "Eugene, OR", geoid: "41039002400" },
            { label: "Seattle, WA", geoid: "53033004500" },
            { label: "Los Angeles, CA", geoid: "06037201100" },
            { label: "Houston, TX", geoid: "48201100100" },
            { label: "Miami, FL", geoid: "12086001200" }
          ].map((sample) => (
            <button
              key={sample.geoid}
              type="button"
              onClick={() => {
                setGeoidInput(sample.geoid);
                const parsed = parseGeoid(sample.geoid);
                setGeoidResult(parsed);
                if (parsed.isValid && parsed.stateCode !== "US") {
                  setSelectedState(parsed.stateCode);
                }
              }}
              className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-mono text-xs transition-colors border border-stone-200"
            >
              {sample.label} ({sample.geoid})
            </button>
          ))}
        </div>

        {/* Result Card */}
        {geoidResult && geoidResult.isValid && (
          <div className="bg-[#F9F8F4] rounded-xl p-5 border border-teal-200/80 space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAE7E0] pb-3">
              <div>
                <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">GEOID {geoidResult.rawGeoid}</span>
                <h4 className="text-base font-bold text-[#2D362E]">
                  {geoidResult.countyName}, {geoidResult.stateName} ({geoidResult.formattedTract})
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                  geoidResult.isLmiEligible 
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300" 
                    : "bg-stone-100 text-stone-700 border border-stone-300"
                }`}>
                  CRA Status: {geoidResult.lmiCategory} Income Tract ({geoidResult.amiPercentage}% AMI)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white rounded-lg border border-[#EAE7E0] space-y-1">
                <span className="text-stone-500 block">FFIEC LMI Grant Boost:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {geoidResult.isLmiEligible ? "Qualified for 3-5% State DPA" : "Standard Limits Apply"}
                </span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#EAE7E0] space-y-1">
                <span className="text-stone-500 block">USDA Rural 0% Down:</span>
                <span className="font-bold text-teal-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {geoidResult.isUsdaEligible ? "Eligible (Outside Urban Area)" : "Urban Zone (Ineligible)"}
                </span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#EAE7E0] space-y-1">
                <span className="text-stone-500 block">Targeted Area Price Cap:</span>
                <span className="font-bold text-[#C18C5D] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  {geoidResult.isTargetedArea ? "Elevated $692k-$789k Cap" : "Standard Non-Targeted Cap"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* National Loan Options Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-serif font-bold text-[#2D362E]">
          Nationwide First-Time Homebuyer Loan Matrix
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {NATIONAL_LOAN_OPTIONS.map((option) => (
            <div key={option.id} className="bg-white rounded-xl p-5 border border-[#EAE7E0] shadow-sm flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-[#F9F8F4] rounded-lg border border-[#EAE7E0]">
                    {option.icon}
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-md border ${option.badgeBg} ${option.badgeText} ${option.badgeBorder}`}>
                    {option.subtitle}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-[#2D362E]">{option.name}</h3>
                <p className="text-xs text-[#4A5D4E] leading-relaxed">{option.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Consultation Lead Form */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#EAE7E0] space-y-6">
        <div className="max-w-2xl space-y-2">
          <h2 className="text-xl font-serif font-bold text-[#2D362E]">
            Request a Personalized Grant & Scenario Qualification
          </h2>
          <p className="text-xs sm:text-sm text-[#4A5D4E]">
            Connect with {guidesState?.loanOfficer?.name || "our licensed Loan Officer team"} to verify exact grant programs, GEOID tract eligibility, and lowest monthly payment scenarios.
          </p>
        </div>

        {submitted ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="font-bold text-emerald-900">Grant Qualification Request Received!</h4>
            <p className="text-xs text-emerald-700 max-w-md mx-auto">
              Our team will review your target state ({selectedState}) and prepare an authoritative Down Payment Assistance blueprint within 1 business day.
            </p>
          </div>
        ) : (
          <form onSubmit={handleApply} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#2D362E] mb-1">First Name *</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl text-sm text-[#2D362E] focus:outline-none focus:ring-2 focus:ring-[#C18C5D]/40"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2D362E] mb-1">Last Name *</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl text-sm text-[#2D362E] focus:outline-none focus:ring-2 focus:ring-[#C18C5D]/40"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2D362E] mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl text-sm text-[#2D362E] focus:outline-none focus:ring-2 focus:ring-[#C18C5D]/40"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#2D362E] mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl text-sm text-[#2D362E] focus:outline-none focus:ring-2 focus:ring-[#C18C5D]/40"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.consentToText}
                  onChange={(e) => setFormData({ ...formData, consentToText: e.target.checked })}
                  className="mt-1 rounded border-stone-300 text-[#C18C5D] focus:ring-[#C18C5D]"
                />
                <span className="text-xs text-stone-600 leading-relaxed">
                  I agree to receive mortgage grant information, prequalification updates, and educational texts from {guidesState?.loanOfficer?.name || "Manus Homebuyer"}. Msg & data rates may apply.
                </span>
              </label>
            </div>

            <div className="sm:col-span-2 pt-2">
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3 bg-[#C18C5D] hover:bg-[#A87447] text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Submit Grant Qualification Request
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
