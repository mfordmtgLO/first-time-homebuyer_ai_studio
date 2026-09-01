import React, { useState } from "react";
import { 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  DollarSign, 
  Compass, 
  Award, 
  CheckCircle2, 
  Building2, 
  BadgePercent,
  Home,
  HeartHandshake,
  QrCode,
  ExternalLink,
  Smartphone,
  Check,
  Copy
} from "lucide-react";
import { FinancialProfile, LoanOfficerProfile, RealEstateAgentProfile, PropertyListing } from "../types";
import { calculateMortgageBreakdown, formatUSD, getDTIStatus } from "../utils/mortgageMath";
import { LocalProfessionalGuides } from "./LocalProfessionalGuides";
import { CuratedHomesSection } from "./CuratedHomesSection";

interface HeroWebsiteProps {
  profile: FinancialProfile;
  setProfile: React.Dispatch<React.SetStateAction<FinancialProfile>>;
  onOpenDashboard: () => void;
  onOpenCalculator: () => void;
  onOpenRoadmap: () => void;
  onOpenStep4?: () => void;
  onOpenLeadBot?: () => void;
  loanOfficer?: LoanOfficerProfile;
  activeAgent?: RealEstateAgentProfile;
  isCoBranded?: boolean;
  onOpenLoPortal?: () => void;
  properties?: PropertyListing[];
}

export const HeroWebsite: React.FC<HeroWebsiteProps> = ({
  profile,
  setProfile,
  onOpenDashboard,
  onOpenCalculator,
  onOpenRoadmap,
  onOpenStep4,
  onOpenLeadBot,
  loanOfficer,
  activeAgent,
  isCoBranded = false,
  onOpenLoPortal,
  properties = [],
}) => {
  const [showHeroQrModal, setShowHeroQrModal] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  const leadGenUrlwk = loanOfficer?.leadGenFormUrl || "https://portal.myhometrac.com/get-started/MFORD@CFMTG.COM";
  const qrCodeUrlwk进 = loanOfficer?.leadGenQrCodeUrl || "/lead-gen-qr-code.png";

  const breakdown = calculateMortgageBreakdown(profile);
  const dtiStatus = getDTIStatus(breakdown.backEndDTI);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(leadGenUrlwk);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-14 bg-white text-[#2D362E] rounded-3xl border border-[#EAE7E0] shadow-sm p-6 sm:p-10 lg:p-12">
        {/* Subtle warm background accents */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#F1EFE9] rounded-full blur-3xl pointer-events-none opacity-60" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#C18C5D]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Value Prop */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F1EFE9] border border-[#EAE7E0] text-[#4A5D4E] text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#C18C5D] animate-pulse" />
              <span className="text-[#C18C5D] uppercase tracking-wider font-extrabold">Stop Paying Rent</span>
              <span>•</span>
              <span>2026 First-Time Homebuyer Interactive Blueprint & AI Advisor</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#2D362E] leading-tight">
              Stop paying rent. Buy your first home with <span className="text-[#4A5D4E]">clarity</span> and confidence.
            </h1>

            <p className="text-base sm:text-lg text-[#606C5D] max-w-2xl leading-relaxed">
              Find out what you can truly afford, uncover state Down Payment Assistance (DPA) programs from $0 down, and test real monthly mortgage scenarios across <strong className="text-[#2D362E] font-bold">Steps 1–4</strong> with zero guesswork and zero sales pressure.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onOpenCalculator}
                className="flex items-center gap-2.5 px-5 py-3.5 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white font-bold text-sm shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <DollarSign className="w-4 h-4 text-[#D4A373]" />
                <span>Step 1: Calculate Buying Power</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={leadGenUrlwk}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3.5 rounded-xl bg-[#D4A373] hover:bg-[#C18C5D] text-white font-bold text-sm shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                title="Start official pre-approval application online"
              >
                <Smartphone className="w-4 h-4 text-white" />
                <span>Apply Online</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>

              <button
                type="button"
                onClick={() => setShowHeroQrModal(true)}
                className="flex items-center gap-1.5 px-3 py-3.5 rounded-xl bg-[#FAF9F5] hover:bg-[#F1EFE9] text-[#4A5D4E] border border-[#EAE7E0] font-bold text-sm transition-all cursor-pointer"
                title="Scan QR Code with phone camera"
              >
                <QrCode className="w-4 h-4 text-[#4A5D4E]" />
                <span>Scan QR</span>
              </button>

              {onOpenLeadBot && (
                <button
                  onClick={onOpenLeadBot}
                  className="flex items-center gap-2 px-4 py-3.5 rounded-xl bg-white hover:bg-[#F1EFE9] text-[#2D362E] border border-[#EAE7E0] font-bold text-sm shadow-2xs hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#C18C5D]" />
                  <span>24/7 AI Chatbot</span>
                </button>
              )}

              <button
                onClick={onOpenRoadmap}
                className="flex items-center gap-2 px-4 py-3.5 rounded-xl bg-white hover:bg-[#F1EFE9] text-[#4A5D4E] border border-[#EAE7E0] font-bold text-sm transition-all cursor-pointer"
              >
                <Compass className="w-4 h-4 text-[#4A5D4E]" />
                <span>Step 2: Roadmap</span>
              </button>
            </div>

            {/* Trust Signals */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-[#EAE7E0] text-xs text-[#606C5D]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4A5D4E] shrink-0" />
                <span>FHA 3.5% & Conv 3% Models</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4A5D4E] shrink-0" />
                <span>Local Mortgage Prequal</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4A5D4E] shrink-0" />
                <span>Tour Inspection Scorecard</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Quick-Audit Card */}
          <div className="lg:col-span-5 bg-[#F1EFE9] rounded-2xl border border-[#EAE7E0] p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${dtiStatus.isIneligible ? "bg-red-600 animate-pulse" : dtiStatus.isHigh ? "bg-red-600" : dtiStatus.tier === "moderate" ? "bg-[#C18C5D]" : "bg-[#4A5D4E]"}`}></div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#2D362E]">Instant Affordability Preview</span>
              </div>
              {dtiStatus.isIneligible ? (
                <span className="text-[11px] font-bold text-black bg-red-50 px-2 py-0.5 rounded-md border border-red-300">
                  <span className="line-through decoration-red-600 decoration-2">most loan programs ineligible over 50% DTI</span>
                </span>
              ) : (
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${dtiStatus.badgeClass}`}>
                  {dtiStatus.badgeLabel}
                </span>
              )}
            </div>

            {/* Quick Sliders */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-[#606C5D] mb-1.5 font-medium">
                  <span>Household Annual Income</span>
                  <span className="text-[#4A5D4E] font-bold">{formatUSD(profile.annualIncome)}</span>
                </div>
                <input
                  type="range"
                  min="40000"
                  max="300000"
                  step="5000"
                  value={profile.annualIncome}
                  onChange={(e) => setProfile(prev => ({ ...prev, annualIncome: Number(e.target.value) }))}
                  className="w-full h-1.5 bg-[#DEDAD2] rounded-lg appearance-none cursor-pointer accent-[#4A5D4E]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-[#606C5D] mb-1.5 font-medium">
                  <span>Monthly Debt Payments (Cars, Student, CC)</span>
                  <span className="text-[#C18C5D] font-bold">{formatUSD(profile.monthlyDebt)}/mo</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4500"
                  step="50"
                  value={profile.monthlyDebt}
                  onChange={(e) => setProfile(prev => ({ ...prev, monthlyDebt: Number(e.target.value) }))}
                  className="w-full h-1.5 bg-[#DEDAD2] rounded-lg appearance-none cursor-pointer accent-[#C18C5D]"
                />
              </div>

              <div className="bg-[#FAF9F5] p-3 rounded-xl border border-[#EAE7E0] space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div>
                    <span className="text-xs text-[#606C5D] font-medium block">Down Payment</span>
                    <span className="text-[10px] text-[#9A9488]">
                      {breakdown.downPaymentPercent.toFixed(1)}% of {formatUSD(profile.targetPrice)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Dollar Input */}
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-[#606C5D]">$</span>
                      <input
                        type="number"
                        min="0"
                        max={profile.targetPrice}
                        step="1000"
                        value={profile.downPaymentSavings}
                        onChange={(e) => {
                          const val = Math.max(0, Math.min(profile.targetPrice, Number(e.target.value) || 0));
                          setProfile(prev => ({ ...prev, downPaymentSavings: val }));
                        }}
                        className="w-22 pl-4 pr-1.5 py-0.5 bg-white border border-[#DEDAD2] rounded text-xs font-bold text-[#4A5D4E] focus:outline-none focus:border-[#4A5D4E] text-right"
                        title="Down payment dollar amount"
                      />
                    </div>

                    {/* % Input */}
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={Math.round(breakdown.downPaymentPercent * 10) / 10}
                        onChange={(e) => {
                          const pct = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                          const calculatedDollar = Math.round(profile.targetPrice * (pct / 100));
                          setProfile(prev => ({ ...prev, downPaymentSavings: calculatedDollar }));
                        }}
                        className="w-14 pl-1.5 pr-4 py-0.5 bg-white border border-[#DEDAD2] rounded text-xs font-bold text-[#4A5D4E] focus:outline-none focus:border-[#4A5D4E] text-right"
                        title="Down payment percentage"
                      />
                      <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#4A5D4E]">%</span>
                    </div>
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max={Math.max(150000, profile.targetPrice * 0.4)}
                  step="1000"
                  value={profile.downPaymentSavings}
                  onChange={(e) => setProfile(prev => ({ ...prev, downPaymentSavings: Number(e.target.value) }))}
                  className="w-full h-1.5 bg-[#DEDAD2] rounded-lg appearance-none cursor-pointer accent-[#4A5D4E]"
                />

                {/* Quick % buttons */}
                <div className="flex items-center justify-between gap-1 pt-0.5">
                  <div className="flex items-center gap-1">
                    {[3.5, 5, 10, 20].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => {
                          const dollar = Math.round(profile.targetPrice * (pct / 100));
                          setProfile(prev => ({ ...prev, downPaymentSavings: dollar }));
                        }}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-all ${
                          Math.abs(breakdown.downPaymentPercent - pct) < 0.3
                            ? "bg-[#4A5D4E] text-white font-bold"
                            : "bg-white text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F1EFE9]"
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-[#606C5D]">
                    {breakdown.downPaymentPercent >= 20 ? "No PMI" : "PMI active"}
                  </span>
                </div>
              </div>
            </div>

            {/* Calculated Result Box */}
            <div className="bg-white rounded-xl p-4 border border-[#EAE7E0] space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#9A9488]">Max Safe Home Price:</span>
                <span className="text-xl font-bold text-[#4A5D4E]">
                  {formatUSD(breakdown.maxSafePriceConservative)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#EAE7E0]">
                <div>
                  <span className="text-[#9A9488] block text-[11px] mb-0.5">Est. Monthly (P&I+Tax+Ins):</span>
                  <span className="text-[#2D362E] font-bold">{formatUSD(breakdown.totalMonthly)}/mo</span>
                </div>
                <div>
                  <span className="text-[#9A9488] block text-[11px] mb-0.5">Back-End DTI:</span>
                  {dtiStatus.isIneligible ? (
                    <div className="space-y-0.5">
                      <span className="text-black font-bold text-xs line-through decoration-red-600 decoration-2">
                        {breakdown.backEndDTI}%
                      </span>
                      <span className="block text-[11px] font-bold text-black line-through decoration-red-600 decoration-2 leading-tight">
                        most loan programs ineligible over 50% DTI
                      </span>
                    </div>
                  ) : dtiStatus.isHigh ? (
                    <span className="font-bold text-red-600 text-xs">
                      {breakdown.backEndDTI}% (High)
                    </span>
                  ) : (
                    <span className={`font-bold text-xs ${dtiStatus.colorClass}`}>
                      {breakdown.backEndDTI}% ({dtiStatus.label})
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onOpenCalculator}
              className="w-full py-2.5 rounded-lg bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <span>Explore Detailed Amortization & Taxes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 5-Stage Homebuying Journey Section */}
      <section className="space-y-6">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1EFE9] text-[#4A5D4E] text-xs font-bold border border-[#EAE7E0]">
            <Compass className="w-3.5 h-3.5" />
            <span>The Master Framework</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#2D362E]">
            The 5 Critical Stages of Buying Your First Home
          </h2>
          <p className="text-sm sm:text-base text-[#606C5D]">
            Our roadmap guides you step-by-step through every phase—eliminating costly blindspots before they happen.
          </p>
        </div>

        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 lg:grid-cols-5 md:overflow-visible hide-scrollbar">
          {/* Stage 1 */}
          <div 
            onClick={onOpenRoadmap}
            className="group cursor-pointer bg-white hover:bg-[#F9F8F4] border border-[#EAE7E0] hover:border-[#4A5D4E] rounded-2xl p-5 space-y-3 transition-all shadow-sm min-w-[260px] md:min-w-0 snap-center shrink-0"
          >
            <div className="w-9 h-9 rounded-lg bg-[#F1EFE9] border border-[#EAE7E0] flex items-center justify-center text-[#4A5D4E] font-bold text-xs group-hover:bg-[#4A5D4E] group-hover:text-white transition-colors">
              01
            </div>
            <h3 className="font-bold text-[#2D362E] text-sm group-hover:text-[#4A5D4E] transition-colors">
              Readiness & Budget
            </h3>
            <p className="text-xs text-[#606C5D] leading-relaxed">
              Audit credit scores, calculate front/back DTI, establish 3-6 month emergency buffers.
            </p>
            <div className="text-[11px] font-semibold text-[#4A5D4E] flex items-center gap-1">
              <span>View Checklist</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Stage 2 */}
          <div 
            onClick={onOpenRoadmap}
            className="group cursor-pointer bg-white hover:bg-[#F9F8F4] border border-[#EAE7E0] hover:border-[#4A5D4E] rounded-2xl p-5 space-y-3 transition-all shadow-sm min-w-[260px] md:min-w-0 snap-center shrink-0"
          >
            <div className="w-9 h-9 rounded-lg bg-[#F1EFE9] border border-[#EAE7E0] flex items-center justify-center text-[#4A5D4E] font-bold text-xs group-hover:bg-[#4A5D4E] group-hover:text-white transition-colors">
              02
            </div>
            <h3 className="font-bold text-[#2D362E] text-sm group-hover:text-[#4A5D4E] transition-colors">
              Pre-Approval & Lending
            </h3>
            <p className="text-xs text-[#606C5D] leading-relaxed">
              Shop 3 lenders in a 14-day window, lock loan options, and review Fannie Mae 3% / FHA 3.5% guidelines.
            </p>
            <div className="text-[11px] font-semibold text-[#4A5D4E] flex items-center gap-1">
              <span>View 10-Step Roadmap</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Stage 3 */}
          <div 
            onClick={onOpenDashboard}
            className="group cursor-pointer bg-white hover:bg-[#F9F8F4] border border-[#EAE7E0] hover:border-[#4A5D4E] rounded-2xl p-5 space-y-3 transition-all shadow-sm min-w-[260px] md:min-w-0 snap-center shrink-0"
          >
            <div className="w-9 h-9 rounded-lg bg-[#F1EFE9] border border-[#EAE7E0] flex items-center justify-center text-[#4A5D4E] font-bold text-xs group-hover:bg-[#4A5D4E] group-hover:text-white transition-colors">
              03
            </div>
            <h3 className="font-bold text-[#2D362E] text-sm group-hover:text-[#4A5D4E] transition-colors">
              Hunting & Scorecards
            </h3>
            <p className="text-xs text-[#606C5D] leading-relaxed">
              Score physical homes on foundation, HVAC, water pressure, and neighborhood vibes during tours.
            </p>
            <div className="text-[11px] font-semibold text-[#4A5D4E] flex items-center gap-1">
              <span>Tour Scorecard</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Stage 4 */}
          <div 
            onClick={onOpenDashboard}
            className="group cursor-pointer bg-white hover:bg-[#F9F8F4] border border-[#EAE7E0] hover:border-[#4A5D4E] rounded-2xl p-5 space-y-3 transition-all shadow-sm min-w-[260px] md:min-w-0 snap-center shrink-0"
          >
            <div className="w-9 h-9 rounded-lg bg-[#F1EFE9] border border-[#EAE7E0] flex items-center justify-center text-[#4A5D4E] font-bold text-xs group-hover:bg-[#4A5D4E] group-hover:text-white transition-colors">
              04
            </div>
            <h3 className="font-bold text-[#2D362E] text-sm group-hover:text-[#4A5D4E] transition-colors">
              Offers & Negotiation
            </h3>
            <p className="text-xs text-[#606C5D] leading-relaxed">
              Craft protective contingencies, appraisal gap clauses, and seller closing credit requests with AI.
            </p>
            <div className="text-[11px] font-semibold text-[#4A5D4E] flex items-center gap-1">
              <span>Offer Strategist</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Stage 5 */}
          <div 
            onClick={onOpenDashboard}
            className="group cursor-pointer bg-white hover:bg-[#F9F8F4] border border-[#EAE7E0] hover:border-[#4A5D4E] rounded-2xl p-5 space-y-3 transition-all shadow-sm min-w-[260px] md:min-w-0 snap-center shrink-0"
          >
            <div className="w-9 h-9 rounded-lg bg-[#F1EFE9] border border-[#EAE7E0] flex items-center justify-center text-[#4A5D4E] font-bold text-xs group-hover:bg-[#4A5D4E] group-hover:text-white transition-colors">
              05
            </div>
            <h3 className="font-bold text-[#2D362E] text-sm group-hover:text-[#4A5D4E] transition-colors">
              Escrow to Keys
            </h3>
            <p className="text-xs text-[#606C5D] leading-relaxed">
              30-day countdown with wire fraud protections, inspection repairs, CD review, and final walkthrough.
            </p>
            <div className="text-[11px] font-semibold text-[#4A5D4E] flex items-center gap-1">
              <span>Closing Pipeline</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* Curated Eligible Homes Section (Published from GeoSphere GIS by Loan Officer) */}
      <CuratedHomesSection
        properties={properties}
        onOpenDashboard={onOpenDashboard}
        onOpenLeadBot={onOpenLeadBot}
        loanOfficer={loanOfficer}
        activeAgent={activeAgent}
      />

      {/* First-Time Buyer Myth Busters & Essential Truths */}
      <section className="bg-[#F1EFE9] rounded-3xl border border-[#EAE7E0] p-6 sm:p-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#4A5D4E]">First-Time Buyer Intelligence</span>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#2D362E]">Busting the Top 3 Homebuyer Myths</h3>
          </div>
          <button
            onClick={onOpenRoadmap}
            className="self-start sm:self-auto text-xs text-[#4A5D4E] hover:text-[#2D362E] bg-white hover:bg-[#F9F8F4] px-4 py-2 rounded-xl border border-[#EAE7E0] font-semibold transition-colors shadow-2xs"
          >
            Explore 10-Step Playbook →
          </button>
        </div>

        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 md:overflow-visible hide-scrollbar">
          <div className="bg-white rounded-2xl p-6 border border-[#EAE7E0] shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-[#C18C5D] text-xs font-bold">
              <span className="px-2 py-0.5 rounded bg-[#C18C5D]/10 border border-[#C18C5D]/20">MYTH #1</span>
              <span>"You Need 20% Down Payment"</span>
            </div>
            <h4 className="font-bold text-[#2D362E] text-sm">Reality: 3% to 3.5% is standard.</h4>
            <p className="text-xs text-[#606C5D] leading-relaxed">
              Over 68% of first-time buyers put down less than 10%. Conventional 97 requires only 3%, FHA requires 3.5%, and VA/USDA require 0%.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#EAE7E0] shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-[#C18C5D] text-xs font-bold">
              <span className="px-2 py-0.5 rounded bg-[#C18C5D]/10 border border-[#C18C5D]/20">MYTH #2</span>
              <span>"Your Down Payment Is All You Need"</span>
            </div>
            <h4 className="font-bold text-[#2D362E] text-sm">Reality: Budget 2-4% extra for Closing Costs.</h4>
            <p className="text-xs text-[#606C5D] leading-relaxed">
              Lender fees, appraisals, title insurance, transfer taxes, and prepaid property tax escrows add $6,000–$14,000 in true cash-to-close requirements.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#EAE7E0] shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-[#C18C5D] text-xs font-bold">
              <span className="px-2 py-0.5 rounded bg-[#C18C5D]/10 border border-[#C18C5D]/20">MYTH #3</span>
              <span>"Pre-Qualification Is a Guarantee"</span>
            </div>
            <h4 className="font-bold text-[#2D362E] text-sm">Reality: Only Verified Underwriting Counts.</h4>
            <p className="text-xs text-[#606C5D] leading-relaxed">
              Pre-qualification is an unverified estimate. A verified Pre-Approval with audited W-2s and bank statements is what makes your offer competitive.
            </p>
          </div>
        </div>
      </section>

      {/* Local Professional Guides Section */}
      {loanOfficer && (
        <LocalProfessionalGuides
          loanOfficer={loanOfficer}
          activeAgent={activeAgent}
          isCoBranded={isCoBranded}
          onOpenLoPortal={onOpenLoPortal}
        />
      )}

      {/* QR Code Modal for Phone Camera Scanning */}
      {showHeroQrModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 border border-[#EAE7E0] shadow-2xl animate-in zoom-in-95 duration-150 text-[#2D362E] text-center">
            <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-3 text-left">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#D4A373]"></div>
                <h4 className="font-serif font-bold text-lg text-[#2D362E]">
                  Scan to Start Application
                </h4>
              </div>
              <button
                onClick={() => setShowHeroQrModal(false)}
                className="text-xs text-[#9A9488] hover:text-[#2D362E] p-1"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3">
              <div className="inline-block p-4 bg-[#FAF9F5] border-2 border-[#EAE7E0] rounded-2xl shadow-inner">
                <img 
                  src={qrCodeUrlwk进} 
                  alt="Loan Officer Pre-Approval QR Code" 
                  className="w-48 h-48 sm:w-56 sm:h-56 mx-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="space-y-1">
                <h5 className="font-bold text-sm text-[#2D362E]">
                  Point Your Phone Camera at the QR Code
                </h5>
                <p className="text-xs text-[#606C5D] leading-relaxed max-w-xs mx-auto">
                  Instantly open <strong className="text-[#2D362E]">{loanOfficer?.name || "Mike Ford"}</strong>'s official HomeTrac secure pre-approval application on your mobile device.
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#EAE7E0] space-y-2 text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A9488] block">
                Direct Portal Link:
              </span>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={leadGenUrlwk} 
                  className="flex-1 bg-white border border-[#EAE7E0] rounded-lg px-2.5 py-1.5 text-xs text-[#606C5D] select-all font-mono"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-lg bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-bold flex items-center gap-1 shrink-0 transition-colors"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-[#D4A373]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? "Copied!" : "Copy"}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowHeroQrModal(false)}
                className="flex-1 py-2.5 text-xs font-semibold text-[#606C5D] hover:bg-[#F1EFE9] rounded-xl border border-[#EAE7E0]"
              >
                Close Window
              </button>
              <a
                href={leadGenUrlwk}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-white bg-[#4A5D4E] hover:bg-[#38463B] rounded-xl shadow-xs"
              >
                <span>Open in Browser</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
