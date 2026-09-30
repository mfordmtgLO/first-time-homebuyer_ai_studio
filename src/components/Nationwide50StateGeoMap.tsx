import React, { useState, useMemo } from "react";
import { 
  Globe, 
  MapPin, 
  ShieldCheck, 
  Award, 
  Building, 
  DollarSign, 
  Layers, 
  Sliders, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Share2, 
  ExternalLink, 
  Copy, 
  Check, 
  ArrowRight, 
  HelpCircle,
  Phone,
  Mail,
  UserCheck,
  TrendingUp,
  Flame,
  Search,
  Filter
} from "lucide-react";
import { ProfessionalGuidesState, LoanOfficerProfile, RealEstateAgentProfile, LOPairing, PropertyListing } from "../types";
import { US_STATES } from "./StateLicensingSelector";
import { getNationwideHfaDetails, NATIONWIDE_HFA_DATABASE } from "../utils/nationwideHfaLimits";
import { getNationwideUsdaIncomeLimit, evaluateUsdaDualMatch } from "../utils/usdaIncomeLimits";
import { formatUSD } from "../utils/mortgageMath";

export interface Nationwide50StateGeoMapProps {
  guidesState?: ProfessionalGuidesState;
  onNavigateToTab?: (tab: string) => void;
  onTriggerToast?: (msg: string) => void;
  initialStateCode?: string;
  properties?: PropertyListing[];
}

export type ProgramFilterType = 
  | "all" 
  | "usda_rd" 
  | "lakeview_140" 
  | "fha_nhf" 
  | "state_hfa" 
  | "fannie_97" 
  | "fannie_homeready" 
  | "stacked_benefits";

interface StateGeoCoord {
  code: string;
  name: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
}

// Visual geographic grid coordinates for all 50 states + DC
const STATE_GRID: StateGeoCoord[] = [
  // Row 1
  { code: "AK", name: "Alaska", x: 20, y: 30 },
  { code: "ME", name: "Maine", x: 880, y: 30 },
  // Row 2
  { code: "WA", name: "Washington", x: 100, y: 90 },
  { code: "ID", name: "Idaho", x: 170, y: 110 },
  { code: "MT", name: "Montana", x: 250, y: 90 },
  { code: "ND", name: "North Dakota", x: 340, y: 90 },
  { code: "MN", name: "Minnesota", x: 420, y: 90 },
  { code: "WI", name: "Wisconsin", x: 500, y: 90 },
  { code: "MI", name: "Michigan", x: 600, y: 110 },
  { code: "VT", name: "Vermont", x: 800, y: 90 },
  { code: "NH", name: "New Hampshire", x: 860, y: 90 },
  // Row 3
  { code: "OR", name: "Oregon", x: 80, y: 170 },
  { code: "NV", name: "Nevada", x: 150, y: 190 },
  { code: "WY", name: "Wyoming", x: 250, y: 170 },
  { code: "SD", name: "South Dakota", x: 340, y: 170 },
  { code: "IA", name: "Iowa", x: 420, y: 170 },
  { code: "IL", name: "Illinois", x: 500, y: 170 },
  { code: "IN", name: "Indiana", x: 570, y: 170 },
  { code: "OH", name: "Ohio", x: 640, y: 170 },
  { code: "PA", name: "Pennsylvania", x: 720, y: 170 },
  { code: "NY", name: "New York", x: 800, y: 160 },
  { code: "MA", name: "Massachusetts", x: 870, y: 150 },
  // Row 4
  { code: "CA", name: "California", x: 60, y: 260 },
  { code: "UT", name: "Utah", x: 170, y: 260 },
  { code: "CO", name: "Colorado", x: 260, y: 250 },
  { code: "NE", name: "Nebraska", x: 350, y: 250 },
  { code: "MO", name: "Missouri", x: 440, y: 250 },
  { code: "KY", name: "Kentucky", x: 550, y: 250 },
  { code: "WV", name: "West Virginia", x: 660, y: 240 },
  { code: "VA", name: "Virginia", x: 740, y: 240 },
  { code: "MD", name: "Maryland", x: 810, y: 230 },
  { code: "NJ", name: "New Jersey", x: 870, y: 220 },
  { code: "CT", name: "Connecticut", x: 910, y: 180 },
  { code: "RI", name: "Rhode Island", x: 930, y: 140 },
  // Row 5
  { code: "AZ", name: "Arizona", x: 150, y: 340 },
  { code: "NM", name: "New Mexico", x: 240, y: 340 },
  { code: "KS", name: "Kansas", x: 340, y: 330 },
  { code: "AR", name: "Arkansas", x: 440, y: 330 },
  { code: "TN", name: "Tennessee", x: 550, y: 320 },
  { code: "NC", name: "North Carolina", x: 720, y: 310 },
  { code: "SC", name: "South Carolina", x: 770, y: 370 },
  { code: "DE", name: "Delaware", x: 860, y: 280 },
  { code: "DC", name: "District of Columbia", x: 830, y: 270 },
  // Row 6
  { code: "OK", name: "Oklahoma", x: 330, y: 410 },
  { code: "LA", name: "Louisiana", x: 440, y: 410 },
  { code: "MS", name: "Mississippi", x: 530, y: 400 },
  { code: "AL", name: "Alabama", x: 610, y: 400 },
  { code: "GA", name: "Georgia", x: 690, y: 400 },
  // Row 7
  { code: "HI", name: "Hawaii", x: 70, y: 450 },
  { code: "TX", name: "Texas", x: 310, y: 490 },
  { code: "FL", name: "Florida", x: 720, y: 480 }
];

export const Nationwide50StateGeoMap: React.FC<Nationwide50StateGeoMapProps> = ({
  guidesState,
  onNavigateToTab,
  onTriggerToast,
  initialStateCode = "OR",
  properties = []
}) => {
  const [selectedState, setSelectedState] = useState<string>(initialStateCode);
  const [activeFilter, setActiveFilter] = useState<ProgramFilterType>("all");
  const [householdIncome, setHouseholdIncome] = useState<number>(98000);
  const [householdSize, setHouseholdSize] = useState<number>(3);
  const [searchCounty, setSearchCounty] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [targetPurchasePrice, setTargetPurchasePrice] = useState<number>(450000);

  // Active state profile data
  const stateHfa = useMemo(() => {
    return getNationwideHfaDetails(selectedState);
  }, [selectedState]);

  // USDA RD Income limit evaluation
  const usdaLimitInfo = useMemo(() => {
    return getNationwideUsdaIncomeLimit(selectedState, searchCounty, householdSize);
  }, [selectedState, searchCounty, householdSize]);

  // Dual match evaluation
  const usdaDualMatch = useMemo(() => {
    return evaluateUsdaDualMatch(householdIncome, householdSize, selectedState, searchCounty, true);
  }, [householdIncome, householdSize, selectedState, searchCounty]);

  // Loan Officers who hold licensing in this state
  const licensedPeerLos = useMemo(() => {
    if (!guidesState?.loanOfficers) return [];
    return guidesState.loanOfficers.filter((lo) => {
      const states = lo.licenseStates || [];
      return (
        states.some((s) => s.toLowerCase() === selectedState.toLowerCase()) ||
        states.some((s) => s.toLowerCase() === stateHfa.stateName.toLowerCase())
      );
    });
  }, [guidesState?.loanOfficers, selectedState, stateHfa.stateName]);

  // Fallback peer LO if none in local roster
  const assignedLo: LoanOfficerProfile = useMemo(() => {
    if (licensedPeerLos.length > 0) return licensedPeerLos[0];
    // Return senior company peer LO profile with notice
    return {
      id: `peer-lo-${selectedState.toLowerCase()}`,
      name: `Cornerstone Peer Branch Specialist (${selectedState})`,
      title: "Licensed State Origination Partner",
      nmlsId: "CFMTG Peer Network",
      company: "Cornerstone First Mortgage, LLC NMLS#173855",
      branch: `${stateHfa.stateName} Regional Branch Division`,
      email: "referrals@cfmtg.com",
      phone: "(800) 555-CFMTG",
      headshotUrl: "",
      bio: `Dedicated senior mortgage consultant licensed in ${stateHfa.stateName} providing full-spectrum first-time homebuyer advisory and local DPA origination on behalf of Mike Ford's team.`,
      specialties: ["State HFA DPA Grants", "USDA 0% Down", "Lakeview National", "FHA NHF"],
      bookingUrl: "https://calendly.com",
      licenseStates: [stateHfa.stateName, selectedState]
    };
  }, [licensedPeerLos, selectedState, stateHfa.stateName]);

  // Associated partner agent for this market
  const partnerAgent: RealEstateAgentProfile | undefined = useMemo(() => {
    if (!guidesState?.agentRoster) return undefined;
    // Look for matching market areas or pairings
    const pairedAgent = guidesState.agentRoster.find((a) =>
      a.marketAreas?.some(
        (m) =>
          m.toLowerCase().includes(selectedState.toLowerCase()) ||
          m.toLowerCase().includes(stateHfa.stateName.toLowerCase())
      )
    );
    return (
      pairedAgent ||
      guidesState.agentRoster[0] || {
        id: `agent-partner-${selectedState.toLowerCase()}`,
        name: `Local ${stateHfa.stateName} Realtor Partner`,
        title: "Senior Buyer Specialist",
        brokerage: "Premier Regional Realty Partner",
        licenseNumber: `${selectedState} Lic #Active`,
        email: "partner@agentnetwork.com",
        phone: "(555) 019-2831",
        headshotUrl: "",
        bio: `Top-producing buyer agent specializing in low/no down payment home purchases and DPA pairing in ${stateHfa.stateName}.`,
        specialties: ["First-Time Buyers", "DPA Programs", "Negotiating Seller Credits"],
        marketAreas: [stateHfa.stateName]
      }
    );
  }, [guidesState?.agentRoster, selectedState, stateHfa.stateName]);

  // Stacked Benefits Calculation
  const stackedBenefits = useMemo(() => {
    const price = targetPurchasePrice;
    const firstMortgageType = "FHA 96.5% or Fannie 97%";
    const downPaymentRequired = Math.round(price * 0.035); // 3.5%
    const nhfDpaGrant = Math.round(price * 0.035); // 3.5% grant
    const stateHfaGrant = stateHfa.hasStateDpa ? Math.round(price * 0.04) : 0;
    const craTractGrant = 5000;
    const sellerIpcConcession = Math.round(price * 0.03); // 3% seller credit

    const totalPotentialAssistance = nhfDpaGrant + stateHfaGrant + craTractGrant + sellerIpcConcession;
    const netEstimatedCashToClose = Math.max(0, downPaymentRequired + Math.round(price * 0.03) - totalPotentialAssistance);

    return {
      price,
      downPaymentRequired,
      nhfDpaGrant,
      stateHfaGrant,
      craTractGrant,
      sellerIpcConcession,
      totalPotentialAssistance,
      netEstimatedCashToClose
    };
  }, [targetPurchasePrice, stateHfa]);

  // Helper to copy co-branded link
  const handleCopyCoBrandedLink = () => {
    const url = `https://portal.myhometrac.com/fthb/${selectedState.toLowerCase()}?lo=${encodeURIComponent(assignedLo.name)}&agent=${encodeURIComponent(partnerAgent?.name || "")}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    onTriggerToast?.(`📋 Co-branded ${stateHfa.stateName} Lead Generation URL copied!`);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header & Strategic Scope */}
      <div className="bg-gradient-to-r from-[#2D362E] via-[#3A473C] to-[#4A5D4E] text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                50-State National Origination & DPA Hub
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-semibold border border-amber-400/30">
                2026 FHFA & USDA RD Grounded
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              Interactive 50-State Loan Program & Peer Pairing GeoMap
            </h1>
            <p className="text-xs sm:text-sm text-stone-200 max-w-3xl leading-relaxed">
              Originate first-time homebuyer leads across all 50 states with instant overlays for <strong>USDA RD 0% Down</strong> (with 1-4 & 5-8 household income caps), <strong>Lakeview National (≤140% AMI)</strong>, <strong>FHA NHF DPA</strong>, <strong>State HFA Grants</strong>, and <strong>Fannie 97% HomeReady</strong>. For states outside Oregon, the system automatically routes to your licensed peer company loan officer and local agent partner!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNavigateToTab?.("dpa_grants")}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 flex items-center justify-center gap-2"
            >
              <Award className="w-4 h-4 text-emerald-300" />
              <span>State HFA Directory</span>
            </button>
            <button
              onClick={() => onNavigateToTab?.("realtor_cobranding")}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Users className="w-4 h-4" />
              <span>Co-Branded Pairing Hub</span>
            </button>
          </div>
        </div>
      </div>

      {/* Program Overlay Toggle Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
            <Filter className="w-4 h-4 text-emerald-700" />
            <span>Select Program Overlay to Filter State Rules & Limits:</span>
          </div>
          <span className="text-[11px] text-stone-500">
            Selected: <strong className="text-emerald-800">{stateHfa.stateName} ({selectedState})</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {[
            { id: "all", label: "All Programs", icon: "🌐", color: "hover:border-stone-400" },
            { id: "usda_rd", label: "USDA RD 0% Down (Area + Income)", icon: "🚜", color: "hover:border-emerald-500" },
            { id: "lakeview_140", label: "Lakeview National (≤140% AMI)", icon: "🌊", color: "hover:border-blue-500" },
            { id: "fha_nhf", label: "FHA NHF DPA (Up to 5%)", icon: "🏛️", color: "hover:border-amber-500" },
            { id: "state_hfa", label: "State HFA Grants & Bonds", icon: "🏢", color: "hover:border-teal-500" },
            { id: "fannie_97", label: "Fannie Mae 97% LTV (3% Down)", icon: "📈", color: "hover:border-indigo-500" },
            { id: "fannie_homeready", label: "Fannie HomeReady (≤80% AMI)", icon: "🎯", color: "hover:border-violet-500" },
            { id: "stacked_benefits", label: "Stacked Benefits Engine", icon: "✨", color: "hover:border-purple-500" },
          ].map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as ProgramFilterType)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                  isActive
                    ? "bg-[#2D362E] text-white border-[#2D362E] shadow-sm"
                    : `bg-stone-50 text-stone-700 border-stone-200 ${tab.color}`
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Interactive 50-State SVG GeoMap & Inspector Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Visual SVG 50-State Map */}
        <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                United States GeoMap (Click Any State)
              </h2>
              <p className="text-xs text-stone-500">
                Click any state to inspect USDA income caps, state HFA grants, and active licensed peer LO pairing.
              </p>
            </div>

            {/* Quick State Search Dropdown */}
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-bold text-stone-800 focus:outline-none focus:border-emerald-600"
            >
              {US_STATES.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          {/* SVG Map Canvas */}
          <div className="relative w-full bg-gradient-to-b from-stone-50/70 to-emerald-50/30 rounded-2xl p-4 border border-stone-200/80 overflow-x-auto">
            <svg
              viewBox="0 0 980 560"
              className="w-full h-auto min-w-[650px] select-none"
              style={{ maxHeight: "480px" }}
            >
              {/* Background Map Frame */}
              <rect x="0" y="0" width="980" height="560" rx="16" fill="transparent" />

              {/* State Tiles */}
              {STATE_GRID.map((st) => {
                const isSelected = selectedState === st.code;
                const isOregon = st.code === "OR";
                const isPeerLicensed = guidesState?.loanOfficers?.some((lo) =>
                  lo.licenseStates?.some(
                    (s) => s.toLowerCase() === st.code.toLowerCase() || s.toLowerCase() === st.name.toLowerCase()
                  )
                );

                // Fill color logic
                let fillColor = "#F3F4F6"; // default neutral
                let strokeColor = "#D1D5DB";
                let textColor = "#374151";

                if (isSelected) {
                  fillColor = "#047857"; // active emerald
                  strokeColor = "#064E3B";
                  textColor = "#FFFFFF";
                } else if (isOregon) {
                  fillColor = "#D1FAE5"; // Oregon home state green
                  strokeColor = "#10B981";
                  textColor = "#065F46";
                } else if (isPeerLicensed) {
                  fillColor = "#DBEAFE"; // Blue peer licensed
                  strokeColor = "#3B82F6";
                  textColor = "#1E40AF";
                }

                return (
                  <g
                    key={st.code}
                    onClick={() => setSelectedState(st.code)}
                    className="cursor-pointer transition-transform duration-150 hover:scale-105"
                    style={{ transformOrigin: `${st.x + 27}px ${st.y + 22}px` }}
                  >
                    <rect
                      x={st.x}
                      y={st.y}
                      width={54}
                      height={44}
                      rx={8}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      className="shadow-sm transition-colors"
                    />
                    <text
                      x={st.x + 27}
                      y={st.y + 21}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={textColor}
                      fontSize="12"
                      fontWeight="bold"
                    >
                      {st.code}
                    </text>
                    <text
                      x={st.x + 27}
                      y={st.y + 34}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill={textColor}
                      opacity={isSelected ? 0.9 : 0.75}
                      fontSize="8"
                      fontWeight="600"
                    >
                      {isOregon ? "Home" : isPeerLicensed ? "Peer LO" : "HFA"}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Map Legend */}
            <div className="flex items-center justify-between flex-wrap gap-2 pt-3 border-t border-stone-200 text-[11px] text-stone-600">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-sm bg-[#D1FAE5] border border-[#10B981]" />
                  <span>Oregon (Home Lic #288455)</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-sm bg-[#DBEAFE] border border-[#3B82F6]" />
                  <span>Licensed Peer LO Active</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-sm bg-[#047857] border border-[#064E3B]" />
                  <span>Selected State</span>
                </span>
              </div>
              <span className="text-[10px] text-stone-500 font-medium">
                Click any tile to toggle out-of-state rules
              </span>
            </div>
          </div>

          {/* Real-Time Household Income & Family Size Qualifier Adjuster */}
          <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-700" />
                Live Household Income & Size Qualifier Adjuster
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Calculates USDA RD & Lakeview AMI
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Income Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-stone-700">Gross Household Income:</span>
                  <span className="font-extrabold text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-200 shadow-2xs">
                    {formatUSD(householdIncome)}
                  </span>
                </div>
                <input
                  type="range"
                  min="40000"
                  max="250000"
                  step="1000"
                  value={householdIncome}
                  onChange={(e) => setHouseholdIncome(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-500">
                  <span>$40k</span>
                  <div className="flex gap-1">
                    {[75000, 95000, 125000, 150000].map((val) => (
                      <button
                        key={val}
                        onClick={() => setHouseholdIncome(val)}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-semibold transition-colors ${
                          householdIncome === val
                            ? "bg-emerald-700 text-white"
                            : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
                        }`}
                      >
                        ${val / 1000}k
                      </button>
                    ))}
                  </div>
                  <span>$250k</span>
                </div>
              </div>

              {/* Household Size Selector */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-stone-700">Household Members:</span>
                  <span className="font-extrabold text-stone-800 bg-white px-2.5 py-0.5 rounded-md border border-stone-200 shadow-2xs">
                    {householdSize} {householdSize === 1 ? "Person" : "Persons"} (
                    {householdSize > 4 ? "5-8 Large Cap" : "1-4 Standard Cap"})
                  </span>
                </div>
                <div className="flex gap-1.5 pt-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((size) => (
                    <button
                      key={size}
                      onClick={() => setHouseholdSize(size)}
                      className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all border ${
                        householdSize === size
                          ? "bg-emerald-700 text-white border-emerald-800 shadow-xs"
                          : "bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-emerald-800 leading-tight">
                  USDA RD caps increase automatically for 5+ member families ($148,450+ baseline).
                </p>
              </div>
            </div>

            {/* Income Dual Match Verdict Bar */}
            <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${usdaDualMatch.badgeColor}`}>
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-700" />
              <div className="text-xs space-y-0.5">
                <div className="font-bold flex items-center gap-2">
                  <span>{usdaDualMatch.badgeLabel}</span>
                  <span className="text-[10px] opacity-75">({usdaLimitInfo.tierDesc})</span>
                </div>
                <p className="leading-snug">{usdaDualMatch.verdictText}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Columns: State Program Rules, Out-of-State Peer LO + Agent Pair */}
        <div className="lg:col-span-5 space-y-5">
          {/* Out-of-State Peer LO + Local Agent Pair Card */}
          <div className="bg-gradient-to-br from-white via-stone-50 to-emerald-50/40 p-5 rounded-3xl border-2 border-emerald-600/30 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {selectedState === "OR" ? "Direct Origination (Home State)" : "Licensed Peer LO + Agent Pair"}
                </span>
                <h3 className="text-base font-serif font-bold text-stone-900 mt-1">
                  {selectedState === "OR"
                    ? "Oregon Direct Origination Hub"
                    : `${stateHfa.stateName} Co-Marketing Pair`}
                </h3>
              </div>
              <UserCheck className="w-5 h-5 text-emerald-600" />
            </div>

            {selectedState !== "OR" && (
              <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-tight flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
                <span>
                  <strong>Licensing Guard:</strong> You are licensed in Oregon. For {stateHfa.stateName}, originations are handled through our licensed peer company loan officer on your behalf, with leads tracked into your unified dashboard.
                </span>
              </div>
            )}

            {/* Co-Branded Dual Contact Box */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* Loan Officer */}
              <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs space-y-1.5">
                <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider block">
                  {selectedState === "OR" ? "Licensed Loan Officer" : "Licensed Peer LO"}
                </span>
                <div className="font-bold text-xs text-stone-900 leading-tight">{assignedLo.name}</div>
                <div className="text-[10px] text-emerald-700 font-semibold">{assignedLo.nmlsId}</div>
                <div className="text-[10px] text-stone-500 leading-tight truncate">{assignedLo.company}</div>
                <div className="pt-1 flex items-center gap-1 text-[10px] text-stone-600">
                  <Phone className="w-3 h-3 text-stone-400" />
                  <span>{assignedLo.phone}</span>
                </div>
              </div>

              {/* Agent Partner */}
              <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs space-y-1.5">
                <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider block">
                  Realtor Partner
                </span>
                <div className="font-bold text-xs text-stone-900 leading-tight">
                  {partnerAgent?.name || "Local Agent Partner"}
                </div>
                <div className="text-[10px] text-blue-700 font-semibold">
                  {partnerAgent?.brokerage || "Premier Partner Brokerage"}
                </div>
                <div className="text-[10px] text-stone-500 leading-tight">{partnerAgent?.licenseNumber}</div>
                <div className="pt-1 flex items-center gap-1 text-[10px] text-stone-600">
                  <Mail className="w-3 h-3 text-stone-400" />
                  <span className="truncate">{partnerAgent?.email}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons: Copy Co-Branded URL or Launch Out-of-State Funnel */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleCopyCoBrandedLink}
                className="w-full py-2.5 px-3 rounded-xl bg-[#2D362E] hover:bg-[#3D4B3E] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                <span>
                  {copiedLink ? "Link Copied to Clipboard!" : `Generate ${stateHfa.stateName} Co-Branded Funnel Link`}
                </span>
              </button>

              <p className="text-[9px] text-stone-400 text-center leading-tight">
                RESPA Section 8 Compliant co-marketing link attribution. Captures leads directly into Big Purple Dot CRM.
              </p>
            </div>
          </div>

          {/* Program Limits & Overlays Card */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <span className="font-bold text-stone-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-600" />
                {stateHfa.stateName} Loan Overlays & Caps
              </span>
              <span className="text-[10px] font-bold text-stone-500">2026 Guidelines</span>
            </div>

            {/* Table of Program Limits */}
            <div className="space-y-2.5">
              {/* 1. USDA RD Limit */}
              <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-emerald-950 flex items-center gap-1">
                    <span>🚜</span> USDA RD 0% Down Limits
                  </span>
                  <span className="font-extrabold text-emerald-800">
                    {formatUSD(usdaLimitInfo.limit)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-emerald-800">
                  <span>1-4 Persons: {formatUSD(usdaLimitInfo.limit1to4)}</span>
                  <span>5-8 Persons: {formatUSD(usdaLimitInfo.limit5to8)}</span>
                </div>
                <p className="text-[10px] text-emerald-700 leading-tight">
                  Zero down payment required. Subject to property location in an eligible USDA Rural Area.
                </p>
              </div>

              {/* 2. Lakeview National */}
              <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-100 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-blue-950 flex items-center gap-1">
                    <span>🌊</span> Lakeview National (≤140% AMI)
                  </span>
                  <span className="font-extrabold text-blue-800">Available Nationwide</span>
                </div>
                <p className="text-[10px] text-blue-800 leading-tight">
                  High-earning first-time homebuyers up to 140% of county AMI. Conventional low down payment with discounted PMI.
                </p>
              </div>

              {/* 3. FHA NHF DPA */}
              <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-100 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-amber-950 flex items-center gap-1">
                    <span>🏛️</span> FHA NHF (National Homebuyer Fund)
                  </span>
                  <span className="font-extrabold text-amber-800">Up to 5% DPA Grant</span>
                </div>
                <p className="text-[10px] text-amber-800 leading-tight">
                  Pairs with FHA 203(b) first mortgage. Available in 48+ states, non-repayable grant or 0% interest second lien, 620 min FICO.
                </p>
              </div>

              {/* 4. State HFA Program */}
              <div className="p-2.5 bg-teal-50/60 rounded-xl border border-teal-100 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-teal-950 flex items-center gap-1">
                    <span>🏢</span> {stateHfa.agencyAcronym} ({stateHfa.featuredProgramName})
                  </span>
                  <span className="font-extrabold text-teal-800">
                    {stateHfa.programs[0]?.assistanceAmount || "State Grant Available"}
                  </span>
                </div>
                <div className="text-[10px] text-teal-800 leading-tight">
                  {stateHfa.programs[0]?.description || stateHfa.agencyName}
                </div>
              </div>

              {/* 5. Conforming & FHA Loan Limits */}
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="bg-stone-50 p-2 rounded-lg border border-stone-200">
                  <span className="text-stone-500 block text-[9px] uppercase">Conforming Baseline</span>
                  <strong className="text-stone-900">{formatUSD(stateHfa.conformingBaselineLimit)}</strong>
                </div>
                <div className="bg-stone-50 p-2 rounded-lg border border-stone-200">
                  <span className="text-stone-500 block text-[9px] uppercase">FHA Floor Limit</span>
                  <strong className="text-stone-900">{formatUSD(stateHfa.fhaFloorLimit)}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Stacked Benefits Engine Preview */}
          <div className="bg-gradient-to-br from-purple-50 via-white to-indigo-50/40 p-4 rounded-3xl border border-purple-200 shadow-sm space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Stacked Benefits Engine ({stateHfa.stateName})
              </span>
              <span className="font-extrabold text-purple-800">
                Target: {formatUSD(targetPurchasePrice)}
              </span>
            </div>

            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between text-stone-600">
                <span>Required Down Payment (3.5%):</span>
                <span>{formatUSD(stackedBenefits.downPaymentRequired)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>+ FHA NHF DPA Grant (3.5%):</span>
                <span>-{formatUSD(stackedBenefits.nhfDpaGrant)}</span>
              </div>
              <div className="flex justify-between text-blue-700 font-medium">
                <span>+ CRA Census Tract Grant:</span>
                <span>-{formatUSD(stackedBenefits.craTractGrant)}</span>
              </div>
              <div className="flex justify-between text-purple-700 font-medium">
                <span>+ Seller Concession (3% IPC):</span>
                <span>-{formatUSD(stackedBenefits.sellerIpcConcession)}</span>
              </div>
              <div className="border-t border-purple-200 pt-1.5 flex justify-between font-bold text-xs text-purple-950">
                <span>Net Estimated Cash to Close:</span>
                <span className="text-emerald-700 text-sm font-extrabold">
                  {formatUSD(stackedBenefits.netEstimatedCashToClose)}
                </span>
              </div>
            </div>

            <p className="text-[10px] text-purple-800 leading-tight">
              By stacking FHA + NHF DPA + Seller Credits + CRA credits, qualified buyers can achieve near-$0 out-of-pocket acquisition.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
