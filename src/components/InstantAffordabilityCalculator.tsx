import React, { useState, useMemo } from "react";
import { 
  Calculator, 
  DollarSign, 
  Percent, 
  ShieldAlert, 
  Sparkles, 
  TrendingUp, 
  Info,
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  RefreshCw,
  Target,
  ShieldCheck,
  Compass,
  RotateCcw,
  LayoutDashboard,
  Globe,
  Building
} from "lucide-react";
import { FinancialProfile } from "../types";
import { calculateMortgageBreakdown, formatUSD, getDTIStatus } from "../utils/mortgageMath";
import { US_STATES } from "./StateLicensingSelector";
import { getNationwideHfaDetails } from "../utils/nationwideHfaLimits";

interface InstantAffordabilityCalculatorProps {
  profile: FinancialProfile;
  setProfile: React.Dispatch<React.SetStateAction<FinancialProfile>>;
  onOpenAdvisor?: () => void;
  onNextStep?: () => void;
  onNavigate?: (tab: string, mode?: "website" | "dashboard") => void;
}

export const InstantAffordabilityCalculator: React.FC<InstantAffordabilityCalculatorProps> = ({
  profile,
  setProfile,
  onOpenAdvisor,
  onNextStep,
  onNavigate,
}) => {
  const [loanTypePreset, setLoanTypePreset] = useState<"30yr" | "fha" | "usda" | "va">("30yr");
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const breakdown = calculateMortgageBreakdown(profile);

  const handlePresetChange = (type: "30yr" | "fha" | "usda" | "va") => {
    setLoanTypePreset(type);
    if (type === "30yr") {
      setProfile(prev => ({ ...prev, loanTermYears: 30, interestRate: 6.625, pmiRate: 0.65 }));
    } else if (type === "fha") {
      setProfile(prev => ({ ...prev, loanTermYears: 30, interestRate: 6.125, pmiRate: 0.55 }));
    } else if (type === "usda") {
      setProfile(prev => ({ ...prev, loanTermYears: 30, interestRate: 6.125, pmiRate: 0.35 }));
    } else if (type === "va") {
      setProfile(prev => ({ ...prev, loanTermYears: 30, interestRate: 6.000, pmiRate: 0 }));
    }
  };

  const handleRunAiAnalysis = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch("/api/gemini/mortgage-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          income: profile.annualIncome,
          monthlyDebt: profile.monthlyDebt,
          downPayment: profile.downPaymentSavings,
          creditScore: profile.creditScore,
          targetHomePrice: profile.targetPrice,
          state: profile.state
        }),
      });
      const data = await res.json();
      if (data.analysis) {
        setAiAnalysis(data.analysis);
      } else {
        setAiAnalysis("Analysis complete. Your debt-to-income profile is healthy. Consider setting aside 3 months of emergency reserves before locking your loan.");
      }
    } catch (e) {
      console.error(e);
      setAiAnalysis("Your current numbers reflect a strong base for a 30-year conventional or FHA mortgage. We recommend aiming for a back-end DTI under 36% for the lowest interest rate tiers.");
    } finally {
      setLoadingAi(false);
    }
  };

  // Percent calculation for visual stacked bar
  const total = Math.max(1, breakdown.totalMonthly);
  const piPct = Math.round((breakdown.principalAndInterest / total) * 100);
  const taxPct = Math.round((breakdown.propertyTax / total) * 100);
  const insPct = Math.round((breakdown.homeInsurance / total) * 100);
  const pmiPct = Math.round((breakdown.pmi / total) * 100);
  const hoaPct = Math.round((breakdown.hoa / total) * 100);

  // Self-Restricted Target Max Monthly Payment Logic & Dynamic Color Coding
  const targetMaxPayment = profile.targetMaxMonthlyPayment || 3200;
  const currentMonthlyPayment = breakdown.totalMonthly;
  const paymentGap = targetMaxPayment - currentMonthlyPayment;

  // Visual state calculation based on the user's explicit rule:
  // 1. Dark Green: easily within range (more than $500 below goal, <= targetMaxPayment - 500)
  // 2. Different color (Amber/Gold): within $500 of max payment goal (> targetMaxPayment - 500 && < targetMaxPayment)
  // 3. Red: reaches the exact payment goal and beyond (>= targetMaxPayment)
  let paymentStatus: "safe" | "warning" | "exceeded" = "safe";
  let sliderTrackColor = "#166534"; // Dark Green
  let statusBadgeText = `${formatUSD(paymentGap)} Under Max Goal (Comfortable)`;
  let statusBadgeBg = "bg-emerald-50 text-emerald-800 border-emerald-200";
  let statusDotColor = "bg-emerald-600";

  if (currentMonthlyPayment >= targetMaxPayment) {
    paymentStatus = "exceeded";
    sliderTrackColor = "#DC2626"; // Red
    statusBadgeText = `${formatUSD(currentMonthlyPayment - targetMaxPayment)} Over Max Goal (Exceeds Budget)`;
    statusBadgeBg = "bg-red-50 text-red-700 border-red-200";
    statusDotColor = "bg-red-600";
  } else if (currentMonthlyPayment > targetMaxPayment - 500) {
    paymentStatus = "warning";
    sliderTrackColor = "#D97706"; // Amber / Warm Gold
    statusBadgeText = `Within ${formatUSD(paymentGap)} of Max Goal (Caution)`;
    statusBadgeBg = "bg-amber-50 text-amber-800 border-amber-200";
    statusDotColor = "bg-amber-500";
  }

  // Calculate percentage of Target Price slider for linear-gradient fill
  const minPrice = 100000;
  const maxPrice = 1200000;
  const priceSliderPercent = Math.min(100, Math.max(0, ((profile.targetPrice - minPrice) / (maxPrice - minPrice)) * 100));

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#EAE7E0] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1EFE9] text-[#4A5D4E] text-xs font-semibold border border-[#EAE7E0]">
            <Calculator className="w-3.5 h-3.5" />
            <span>Interactive Buying Power & DTI Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D362E]">
            How Much House Can You Truly Afford?
          </h2>
          <p className="text-sm text-[#606C5D] max-w-2xl">
            Test loan scenarios with accurate property taxes, homeowners insurance, PMI, and standard DTI underwriting limits.
          </p>
        </div>

        {/* Loan Program Presets */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#F1EFE9] p-1.5 rounded-xl border border-[#EAE7E0]">
          <button
            onClick={() => handlePresetChange("30yr")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              loanTypePreset === "30yr" ? "bg-[#4A5D4E] text-white shadow-sm" : "text-[#606C5D] hover:text-[#2D362E]"
            }`}
          >
            30-Yr Conventional
          </button>
          <button
            onClick={() => handlePresetChange("fha")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              loanTypePreset === "fha" ? "bg-[#4A5D4E] text-white shadow-sm" : "text-[#606C5D] hover:text-[#2D362E]"
            }`}
          >
            FHA 3.5%
          </button>
          <button
            onClick={() => handlePresetChange("usda")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              loanTypePreset === "usda" ? "bg-[#4A5D4E] text-white shadow-sm" : "text-[#606C5D] hover:text-[#2D362E]"
            }`}
          >
            USDA 0%
          </button>
          <button
            onClick={() => handlePresetChange("va")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              loanTypePreset === "va" ? "bg-[#4A5D4E] text-white shadow-sm" : "text-[#606C5D] hover:text-[#2D362E]"
            }`}
          >
            VA 0%
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input Sliders */}
        <div className="lg:col-span-6 space-y-6 bg-white rounded-2xl border border-[#EAE7E0] p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE7E0] pb-4">
            <div>
              <h3 className="text-base font-bold text-[#2D362E] flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#C18C5D]" />
                <span>Financial Inputs & Location</span>
              </h3>
              <span className="text-xs text-[#9A9488]">Adjust values & state in real-time</span>
            </div>

            {/* State Selector */}
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-[#2D362E]">State:</label>
              <select
                id="calculator-state-selector"
                value={profile.state || "OR"}
                onChange={(e) => {
                  const newState = e.target.value;
                  const hfa = getNationwideHfaDetails(newState);
                  setProfile(prev => ({
                    ...prev,
                    state: newState,
                    propertyTaxRate: Number((hfa.avgPropertyTaxRate * 100).toFixed(2))
                  }));
                }}
                className="bg-[#F9F8F4] border border-[#EAE7E0] rounded-lg px-2.5 py-1 text-xs font-bold text-[#2D362E] focus:outline-none focus:ring-1 focus:ring-[#C18C5D]"
              >
                {US_STATES.map((st) => (
                  <option key={st.code} value={st.code}>
                    {st.name} ({st.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* State HFA Grant Snapshot Pill */}
          {(() => {
            const hfa = getNationwideHfaDetails(profile.state || "OR");
            return (
              <div className="bg-[#F9F8F4] rounded-xl p-3 border border-[#EAE7E0] flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#C18C5D] shrink-0" />
                  <div>
                    <span className="font-bold text-[#2D362E] block">{hfa.agencyAcronym}: {hfa.featuredProgramName}</span>
                    <span className="text-stone-500 text-[11px]">2026 Conforming Limit: ${hfa.conformingBaselineLimit.toLocaleString()} • Avg Tax: {(hfa.avgPropertyTaxRate * 100).toFixed(2)}%</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate("grants", "website")}
                  className="px-2 py-1 bg-white border border-[#EAE7E0] hover:bg-[#F1EFE9] text-[#C18C5D] font-bold rounded-lg text-[11px] shrink-0 transition-colors"
                >
                  View Grants →
                </button>
              </div>
            );
          })()}

          <div className="space-y-5">
            {/* User Input at top of Financial Inputs: Self-Restricted Target Max Monthly Payment Goal */}
            <div 
              id="self-restricted-max-payment-container"
              className="bg-[#F9F8F4] p-4 rounded-xl border border-[#EAE7E0] space-y-2.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label 
                  htmlFor="self-restricted-max-payment-input" 
                  className="text-xs font-bold text-[#2D362E] flex items-center gap-1.5"
                >
                  <Target className="w-3.5 h-3.5 text-[#C18C5D]" />
                  <span>Target Max Monthly Payment Goal (Self-Restricted)</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#606C5D]">$</span>
                  <input
                    id="self-restricted-max-payment-input"
                    type="number"
                    step="50"
                    min="500"
                    max="10000"
                    value={profile.targetMaxMonthlyPayment || 3200}
                    onChange={(e) => setProfile(prev => ({ ...prev, targetMaxMonthlyPayment: Math.max(100, Number(e.target.value)) }))}
                    className="w-28 bg-white border border-[#EAE7E0] rounded-lg px-2.5 py-1 text-xs font-bold text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
                  />
                  <span className="text-xs font-semibold text-[#606C5D]">/mo</span>
                </div>
              </div>

              {/* Quick Presets & Status Legend */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#EAE7E0]/60">
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[10px] font-bold text-[#9A9488] uppercase mr-1">Presets:</span>
                  {[2500, 2800, 3000, 3200, 3500].map((preset) => {
                    const isSelected = (profile.targetMaxMonthlyPayment || 3200) === preset;
                    return (
                      <button
                        key={preset}
                        id={`preset-max-payment-${preset}`}
                        type="button"
                        onClick={() => setProfile(prev => ({ ...prev, targetMaxMonthlyPayment: preset }))}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                          isSelected
                            ? "bg-[#4A5D4E] text-white shadow-xs"
                            : "bg-white text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F1EFE9]"
                        }`}
                      >
                        {formatUSD(preset)}
                      </button>
                    );
                  })}
                </div>

                {/* Live 3-Stage Visual Legend */}
                <div className="flex items-center gap-2.5 text-[10px] text-[#606C5D] font-medium">
                  <span className="flex items-center gap-1" title="Dark Green: More than $500 below target monthly max">
                    <span className="w-2 h-2 rounded-full bg-emerald-800 inline-block" />
                    <span>&gt;$500 under</span>
                  </span>
                  <span className="flex items-center gap-1" title="Amber: Within $500 of target monthly max">
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                    <span>Within $500</span>
                  </span>
                  <span className="flex items-center gap-1" title="Red: Reached or exceeded target monthly max">
                    <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
                    <span>At / Over Max</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Target Purchase Price with Dynamic Color-Changing Slider Bar */}
            <div id="target-purchase-price-container" className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-[#606C5D] font-semibold flex-wrap gap-1">
                <span className="text-[#2D362E] font-bold">Target Home Purchase Price</span>
                <div className="flex items-center gap-2">
                  {/* Dynamic Status Chip */}
                  <span 
                    id="payment-status-badge"
                    className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-bold ${statusBadgeBg}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDotColor}`} />
                    <span>{statusBadgeText}</span>
                  </span>
                  <span 
                    className="font-bold text-sm"
                    style={{ color: sliderTrackColor }}
                  >
                    {formatUSD(profile.targetPrice)}
                  </span>
                </div>
              </div>

              {/* Dynamic Color-Shifting Slider Input */}
              <div className="relative py-1">
                <input
                  id="target-home-price-slider"
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  step="5000"
                  value={profile.targetPrice}
                  onChange={(e) => setProfile(prev => ({ ...prev, targetPrice: Number(e.target.value) }))}
                  style={{
                    accentColor: sliderTrackColor,
                    background: `linear-gradient(to right, ${sliderTrackColor} 0%, ${sliderTrackColor} ${priceSliderPercent}%, #DEDAD2 ${priceSliderPercent}%, #DEDAD2 100%)`
                  }}
                  className="w-full h-2.5 rounded-lg appearance-none cursor-pointer transition-all duration-200"
                  title={`Target Price: ${formatUSD(profile.targetPrice)} (Total Est. Monthly: ${formatUSD(breakdown.totalMonthly)}/mo)`}
                />
              </div>

              <div className="flex justify-between text-[11px] text-[#9A9488]">
                <span>$100k</span>
                <span>$600k</span>
                <span>$1.2M</span>
              </div>
            </div>

            {/* Annual Income */}
            <div>
              <div className="flex justify-between text-xs text-[#606C5D] mb-1.5 font-semibold">
                <span>Gross Household Annual Income</span>
                <span className="text-[#2D362E] font-bold text-sm">{formatUSD(profile.annualIncome)}/yr</span>
              </div>
              <input
                type="range"
                min="40000"
                max="350000"
                step="5000"
                value={profile.annualIncome}
                onChange={(e) => setProfile(prev => ({ ...prev, annualIncome: Number(e.target.value) }))}
                className="w-full h-2 bg-[#DEDAD2] rounded-lg appearance-none cursor-pointer accent-[#4A5D4E]"
              />
              <div className="text-[11px] text-[#9A9488] mt-1">
                Gross monthly income: <strong className="text-[#2D362E]">{formatUSD(profile.annualIncome / 12)}/mo</strong>
              </div>
            </div>

            {/* Down Payment Section with % vs $ Dual Mode, Direct Inputs & Quick Presets */}
            <div className="bg-[#FAF9F5] p-3.5 rounded-xl border border-[#EAE7E0] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D362E]">
                    <DollarSign className="w-3.5 h-3.5 text-[#4A5D4E]" />
                    <span>Down Payment Available</span>
                  </div>
                  <div className="text-[11px] text-[#606C5D]">
                    {breakdown.downPaymentPercent >= 20 ? (
                      <span className="text-[#4A5D4E] font-semibold flex items-center gap-1 mt-0.5">
                        <ShieldCheck className="w-3 h-3 text-[#4A5D4E]" /> 20%+ Down (No PMI required)
                      </span>
                    ) : (
                      <span className="text-[#9A9488] block mt-0.5">
                        {formatUSD(Math.max(0, profile.targetPrice * 0.2 - profile.downPaymentSavings))} more to reach 20% no-PMI milestone
                      </span>
                    )}
                  </div>
                </div>

                {/* Input Toggle and Direct Input Fields */}
                <div className="flex items-center gap-2">
                  {/* Dollar Amount Input */}
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#606C5D]">$</span>
                    <input
                      id="down-payment-dollar-input"
                      type="number"
                      min="0"
                      max={profile.targetPrice}
                      step="1000"
                      value={profile.downPaymentSavings}
                      onChange={(e) => {
                        const val = Math.max(0, Math.min(profile.targetPrice, Number(e.target.value) || 0));
                        setProfile(prev => ({ ...prev, downPaymentSavings: val }));
                      }}
                      className="w-24 sm:w-28 pl-5 pr-2 py-1 bg-white border border-[#DEDAD2] rounded-lg text-xs font-bold text-[#2D362E] focus:outline-none focus:border-[#4A5D4E] shadow-2xs text-right"
                      title="Direct Dollar Amount"
                    />
                  </div>

                  {/* Percentage Input */}
                  <div className="relative">
                    <input
                      id="down-payment-percent-input"
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
                      className="w-16 sm:w-18 pl-2 pr-5 py-1 bg-white border border-[#DEDAD2] rounded-lg text-xs font-bold text-[#4A5D4E] focus:outline-none focus:border-[#4A5D4E] shadow-2xs text-right"
                      title="Direct Percentage of Purchase Price"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-[#4A5D4E]">%</span>
                  </div>
                </div>
              </div>

              {/* Slider Bar */}
              <div className="space-y-1">
                <input
                  id="down-payment-slider"
                  type="range"
                  min="0"
                  max={Math.max(150000, profile.targetPrice * 0.5)}
                  step="1000"
                  value={profile.downPaymentSavings}
                  onChange={(e) => setProfile(prev => ({ ...prev, downPaymentSavings: Number(e.target.value) }))}
                  className="w-full h-2.5 bg-[#DEDAD2] rounded-lg appearance-none cursor-pointer accent-[#4A5D4E]"
                  title={`Down payment: ${formatUSD(profile.downPaymentSavings)} (${breakdown.downPaymentPercent}%)`}
                />
              </div>

              {/* Quick % and Program Presets */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-[#EAE7E0]/80">
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[10px] font-bold text-[#9A9488] uppercase mr-1">Quick %:</span>
                  {[
                    { label: "3% (Conv)", pct: 3 },
                    { label: "3.5% (FHA)", pct: 3.5 },
                    { label: "5%", pct: 5 },
                    { label: "10%", pct: 10 },
                    { label: "15%", pct: 15 },
                    { label: "20% (No PMI)", pct: 20 },
                  ].map((preset) => {
                    const presetDollar = Math.round(profile.targetPrice * (preset.pct / 100));
                    const isSelected = Math.abs(profile.downPaymentSavings - presetDollar) < 100 || Math.abs(breakdown.downPaymentPercent - preset.pct) < 0.2;
                    return (
                      <button
                        key={preset.pct}
                        type="button"
                        onClick={() => {
                          setProfile(prev => ({ ...prev, downPaymentSavings: presetDollar }));
                        }}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all ${
                          isSelected
                            ? "bg-[#4A5D4E] text-white shadow-2xs font-bold"
                            : "bg-white text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F1EFE9] hover:text-[#2D362E]"
                        }`}
                        title={`Set down payment to ${preset.pct}% (${formatUSD(presetDollar)})`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                <div className="text-[11px] text-[#606C5D] font-medium ml-auto">
                  Loan: <strong className="text-[#2D362E]">{formatUSD(breakdown.loanAmount)}</strong> ({Math.round(100 - breakdown.downPaymentPercent)}% LTV)
                </div>
              </div>
            </div>

            {/* Monthly Debt */}
            <div>
              <div className="flex justify-between text-xs text-[#606C5D] mb-1.5 font-semibold">
                <span>Monthly Non-Mortgage Debt (Cars, Student, CC)</span>
                <span className="text-[#C18C5D] font-bold text-sm">{formatUSD(profile.monthlyDebt)}/mo</span>
              </div>
              <input
                type="range"
                min="0"
                max="3000"
                step="50"
                value={profile.monthlyDebt}
                onChange={(e) => setProfile(prev => ({ ...prev, monthlyDebt: Number(e.target.value) }))}
                className="w-full h-2 bg-[#DEDAD2] rounded-lg appearance-none cursor-pointer accent-[#C18C5D]"
              />
            </div>

            {/* Interest Rate & HOA */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-[#606C5D] mb-1">
                  Interest Rate (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.125"
                    min="3"
                    max="12"
                    value={profile.interestRate}
                    onChange={(e) => setProfile(prev => ({ ...prev, interestRate: Number(e.target.value) }))}
                    className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-sm text-[#2D362E] font-bold focus:outline-none focus:border-[#4A5D4E]"
                  />
                  <Percent className="w-3.5 h-3.5 text-[#9A9488] absolute right-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#606C5D] mb-1">
                  Monthly HOA ($)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="25"
                    min="0"
                    max="1000"
                    value={profile.monthlyHOA}
                    onChange={(e) => setProfile(prev => ({ ...prev, monthlyHOA: Number(e.target.value) }))}
                    className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-sm text-[#2D362E] font-bold focus:outline-none focus:border-[#4A5D4E]"
                  />
                  <DollarSign className="w-3.5 h-3.5 text-[#9A9488] absolute right-3 top-3" />
                </div>
              </div>
            </div>

            {/* Property Tax Rate */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#606C5D] mb-1">
                  Property Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.05"
                  min="0.4"
                  max="3.0"
                  value={profile.propertyTaxRate}
                  onChange={(e) => setProfile(prev => ({ ...prev, propertyTaxRate: Number(e.target.value) }))}
                  className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-sm text-[#2D362E] font-bold focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#606C5D] mb-1">
                  Annual Home Insurance ($)
                </label>
                <input
                  type="number"
                  step="50"
                  min="500"
                  max="5000"
                  value={profile.annualHomeInsurance}
                  onChange={(e) => setProfile(prev => ({ ...prev, annualHomeInsurance: Number(e.target.value) }))}
                  className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-sm text-[#2D362E] font-bold focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Calculations, DTI Gauges & Visual Breakdown */}
        <div className="lg:col-span-6 space-y-6">
          {/* Monthly Payment Hero Card */}
          <div className="bg-white rounded-2xl border border-[#EAE7E0] p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#9A9488] font-bold">Estimated Total Monthly Cost</span>
                <div className="text-3xl sm:text-4xl font-extrabold text-[#4A5D4E] tracking-tight">
                  {formatUSD(breakdown.totalMonthly)}
                  <span className="text-sm font-normal text-[#9A9488] ml-1.5">/ month</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-[#9A9488] block">Loan Amount</span>
                <span className="text-sm font-bold text-[#2D362E]">{formatUSD(breakdown.loanAmount)}</span>
              </div>
            </div>

            {/* Visual Stacked Bar */}
            <div className="space-y-2">
              <div className="flex h-3 w-full rounded-full overflow-hidden bg-[#F1EFE9] gap-0.5">
                <div style={{ width: `${piPct}%` }} className="bg-[#4A5D4E]" title={`Principal & Interest: ${piPct}%`} />
                <div style={{ width: `${taxPct}%` }} className="bg-[#606C5D]" title={`Property Taxes: ${taxPct}%`} />
                <div style={{ width: `${insPct}%` }} className="bg-[#8E9A8B]" title={`Homeowners Insurance: ${insPct}%`} />
                {pmiPct > 0 && <div style={{ width: `${pmiPct}%` }} className="bg-[#C18C5D]" title={`PMI: ${pmiPct}%`} />}
                {hoaPct > 0 && <div style={{ width: `${hoaPct}%` }} className="bg-[#D4A373]" title={`HOA: ${hoaPct}%`} />}
              </div>

              {/* Itemized List */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4A5D4E] shrink-0" />
                  <div>
                    <span className="text-[#9A9488] block text-[11px]">Principal & Interest</span>
                    <span className="font-bold text-[#2D362E]">{formatUSD(breakdown.principalAndInterest)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#606C5D] shrink-0" />
                  <div>
                    <span className="text-[#9A9488] block text-[11px]">Property Taxes</span>
                    <span className="font-bold text-[#2D362E]">{formatUSD(breakdown.propertyTax)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8E9A8B] shrink-0" />
                  <div>
                    <span className="text-[#9A9488] block text-[11px]">Home Insurance</span>
                    <span className="font-bold text-[#2D362E]">{formatUSD(breakdown.homeInsurance)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C18C5D] shrink-0" />
                  <div>
                    <span className="text-[#9A9488] block text-[11px]">PMI ({breakdown.downPaymentPercent < 20 ? "Active" : "None"})</span>
                    <span className="font-bold text-[#2D362E]">{formatUSD(breakdown.pmi)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D4A373] shrink-0" />
                  <div>
                    <span className="text-[#9A9488] block text-[11px]">Monthly HOA</span>
                    <span className="font-bold text-[#2D362E]">{formatUSD(breakdown.hoa)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* DTI Ratios Bar */}
            {(() => {
              const backEndDtiStatus = getDTIStatus(breakdown.backEndDTI);
              return (
                <div className="bg-[#F1EFE9] rounded-xl p-4 border border-[#EAE7E0] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2D362E]">Underwriting DTI Ratios</span>
                    {backEndDtiStatus.isIneligible ? (
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-red-50 text-black border border-red-300">
                        <span className="line-through decoration-red-600 decoration-2">most loan programs ineligible over 50% DTI</span>
                      </span>
                    ) : (
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        backEndDtiStatus.isHigh
                          ? "bg-red-50 text-red-600 border border-red-200"
                          : breakdown.backEndDTI <= 36 
                          ? "bg-white text-[#4A5D4E] border border-[#EAE7E0]"
                          : "bg-[#C18C5D]/10 text-[#C18C5D] border border-[#C18C5D]/20"
                      }`}>
                        {backEndDtiStatus.isHigh ? "High DTI (45.01% - 50%)" : breakdown.backEndDTI <= 36 ? "Optimal Tier (≤36%)" : "Moderate Risk (36.01% - 45%)"}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="flex justify-between text-[#606C5D] mb-1">
                        <span>Front-End DTI (Housing Only)</span>
                        <strong className="text-[#2D362E]">{breakdown.frontEndDTI}%</strong>
                      </div>
                      <div className="w-full h-1.5 bg-[#DEDAD2] rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${Math.min(100, (breakdown.frontEndDTI / 28) * 100)}%` }} 
                          className={`h-full ${breakdown.frontEndDTI <= 28 ? "bg-[#4A5D4E]" : "bg-[#C18C5D]"}`}
                        />
                      </div>
                      <span className="text-[10px] text-[#9A9488] mt-0.5 block">Standard benchmark: ≤28%</span>
                    </div>

                    <div>
                      <div className="flex justify-between text-[#606C5D] mb-1">
                        <span>Back-End DTI (Housing + Debts)</span>
                        {backEndDtiStatus.isIneligible ? (
                          <strong className="text-black font-bold line-through decoration-red-600 decoration-2">
                            {breakdown.backEndDTI}%
                          </strong>
                        ) : backEndDtiStatus.isHigh ? (
                          <strong className="text-red-600 font-bold">{breakdown.backEndDTI}% (High)</strong>
                        ) : (
                          <strong className={breakdown.backEndDTI <= 36 ? "text-[#4A5D4E]" : "text-[#C18C5D]"}>{breakdown.backEndDTI}%</strong>
                        )}
                      </div>
                      <div className="w-full h-1.5 bg-[#DEDAD2] rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${Math.min(100, (breakdown.backEndDTI / 50) * 100)}%` }} 
                          className={`h-full ${breakdown.backEndDTI <= 36 ? "bg-[#4A5D4E]" : breakdown.backEndDTI <= 45 ? "bg-[#C18C5D]" : "bg-red-600"}`}
                        />
                      </div>
                      {backEndDtiStatus.isIneligible ? (
                        <span className="text-[10px] text-black font-semibold line-through decoration-red-600 decoration-2 mt-0.5 block">
                          most loan programs ineligible over 50% DTI
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#9A9488] mt-0.5 block">Standard benchmark: ≤36-45%</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Purchasing Power Tier Matrix */}
          <div className="bg-white rounded-2xl border border-[#EAE7E0] p-5 space-y-3 shadow-sm">
            <h4 className="text-xs font-bold text-[#2D362E] uppercase tracking-wider">
              Maximum Safe Purchase Price Tiers
            </h4>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="bg-[#F1EFE9] p-3 rounded-xl border border-[#EAE7E0] space-y-1">
                <span className="text-[#4A5D4E] font-bold block text-[11px]">Conservative (28/36)</span>
                <span className="text-base font-extrabold text-[#2D362E] block">{formatUSD(breakdown.maxSafePriceConservative)}</span>
                <span className="text-[10px] text-[#606C5D] block">Lowest stress, strong savings rate</span>
              </div>

              <div className="bg-[#F1EFE9] p-3 rounded-xl border border-[#EAE7E0] space-y-1">
                <span className="text-[#606C5D] font-bold block text-[11px]">Moderate (33/43)</span>
                <span className="text-base font-extrabold text-[#2D362E] block">{formatUSD(breakdown.maxSafePriceModerate)}</span>
                <span className="text-[10px] text-[#606C5D] block">Typical lender maximum qualification</span>
              </div>

              <div className="bg-[#F1EFE9] p-3 rounded-xl border border-[#EAE7E0] space-y-1">
                <span className="text-[#C18C5D] font-bold block text-[11px]">Aggressive (36/45)</span>
                <span className="text-base font-extrabold text-[#2D362E] block">{formatUSD(breakdown.maxSafePriceAggressive)}</span>
                <span className="text-[10px] text-[#606C5D] block">Requires tight monthly budgeting</span>
              </div>
            </div>
          </div>

          {/* AI Mortgage Analysis Button & Response */}
          <div className="bg-[#F1EFE9] rounded-2xl border border-[#EAE7E0] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#4A5D4E] text-xs font-bold">
                <Sparkles className="w-4 h-4 text-[#C18C5D]" />
                <span>AI Mortgage Underwriter Analysis</span>
              </div>

              <button
                onClick={handleRunAiAnalysis}
                disabled={loadingAi}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4A5D4E] hover:bg-[#38463B] text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-50"
              >
                {loadingAi ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>{loadingAi ? "Analyzing..." : "Audit My Numbers with AI"}</span>
              </button>
            </div>

            {aiAnalysis ? (
              <div className="bg-white rounded-xl p-4 border border-[#EAE7E0] text-xs text-[#2D362E] leading-relaxed space-y-2 whitespace-pre-line shadow-2xs">
                {aiAnalysis}
              </div>
            ) : (
              <p className="text-xs text-[#606C5D]">
                Click above to generate an instant, personalized audit of your DTI ratios, safe price ceiling, and recommended loan programs via Gemini 3.7 Flash.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Guided 4-Step Flow: Proceed to Step 2 Navigation Card */}
      <div className="bg-gradient-to-br from-[#2D362E] to-[#1E251F] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#4A5D4E]/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#4A5D4E]/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Step 1 Complete: Buying Power Modeled
              </span>
              <span className="text-xs text-[#DEDAD2]">Next Up in Your Homebuyer Journey</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white leading-tight">
              Ready for Step 2: Explore & Learn (Master Roadmap & DPA Grants)?
            </h3>

            <p className="text-xs sm:text-sm text-[#DEDAD2] leading-relaxed">
              Now that your monthly budget ({formatUSD(breakdown.totalMonthly)}/mo) and safe purchase target ({formatUSD(profile.targetPrice)}) are modeled, advance to the 10-step milestone roadmap and discover Oregon down payment assistance programs.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate("hero", "website")}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-[#DEDAD2] hover:text-white text-xs font-semibold border border-white/15 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#D4A373]" />
                <span>Return to Start / Home</span>
              </button>
            )}

            <button
              type="button"
              id="step1-proceed-to-step2-btn"
              onClick={() => {
                if (onNextStep) {
                  onNextStep();
                } else if (onNavigate) {
                  onNavigate("roadmap", "website");
                }
              }}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#C18C5D] hover:bg-[#A87448] active:scale-[0.99] text-white font-bold text-sm shadow-lg transition-all cursor-pointer group"
            >
              <Compass className="w-4 h-4 text-white" />
              <span>Continue to Step 2: Explore & Learn</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
