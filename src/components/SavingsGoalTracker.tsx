import React, { useState } from "react";
import { 
  PiggyBank, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Target,
  ArrowRight,
  Sparkles,
  Handshake,
  Info,
  Sliders,
  Receipt,
  Scale,
  ShieldCheck,
  Building,
  HelpCircle
} from "lucide-react";
import { FinancialProfile } from "../types";
import { formatUSD, calculateIPCLimits, LoanProgramType } from "../utils/mortgageMath";

interface SavingsGoalTrackerProps {
  profile: FinancialProfile;
  onUpdateSavings?: (newSavings: number) => void;
  onUpdateTargetPrice?: (newTargetPrice: number) => void;
  onNavigate?: (tab: string, mode?: "website" | "dashboard") => void;
}

export const SavingsGoalTracker: React.FC<SavingsGoalTrackerProps> = ({
  profile,
  onUpdateSavings,
  onUpdateTargetPrice,
  onNavigate,
}) => {
  const targetPrice = profile.targetPrice || 425000;
  const [isEditingPrice, setIsEditingPrice] = useState<boolean>(false);
  const [tempPriceInput, setTempPriceInput] = useState<number>(targetPrice);
  
  // Loan Program Selection for IPC calculations
  const [loanProgram, setLoanProgram] = useState<LoanProgramType>("conventional");

  // Down payment preset selection
  const [selectedPreset, setSelectedPreset] = useState<number | "custom">(5); // default 5%
  const [customGoalAmount, setCustomGoalAmount] = useState<number>(30000);
  const [includeClosingBuffer, setIncludeClosingBuffer] = useState<boolean>(true);
  const [closingBufferPercent, setClosingBufferPercent] = useState<number>(2.5); // default 2.5%
  const [monthlyContribution, setMonthlyContribution] = useState<number>(1200);
  const [isEditingSavings, setIsEditingSavings] = useState<boolean>(false);
  const [tempSavingsInput, setTempSavingsInput] = useState<number>(profile.downPaymentSavings);

  // Seller Concessions & Contributions State
  const [sellerConcessionPercent, setSellerConcessionPercent] = useState<number>(0);
  const [sellerConcessionAmount, setSellerConcessionAmount] = useState<number>(0);

  // Closing cost buffer estimate (approx 2.5% of target price by default)
  const estimatedClosingBuffer = includeClosingBuffer
    ? Math.round(targetPrice * (closingBufferPercent / 100))
    : 0;

  // Base Down Payment Goal
  const baseDownPaymentGoal =
    selectedPreset === "custom"
      ? customGoalAmount
      : Math.round(targetPrice * (selectedPreset / 100));

  // Compute official Interested Party Contribution (IPC) limits & dual-limiter results
  const ipcResult = calculateIPCLimits({
    loanProgram,
    targetPrice,
    downPaymentAmount: baseDownPaymentGoal,
    requestedConcessionAmount: sellerConcessionAmount,
    closingBufferAmount: estimatedClosingBuffer,
  });

  // Effective applied seller concession after program IPC & closing buffer limits
  const appliedSellerConcession = ipcResult.appliedConcessionDollar;

  // Net Buyer Closing Costs needed out-of-pocket after applying seller credits
  const netBuyerClosingCosts = Math.max(0, estimatedClosingBuffer - appliedSellerConcession);

  // TOTAL TARGET CASH-TO-CLOSE GOAL
  // = Required Down Payment + Net Out-of-Pocket Closing Costs
  const totalTargetGoal = baseDownPaymentGoal + netBuyerClosingCosts;

  const currentSavings = profile.downPaymentSavings;
  const progressPercent = Math.min(
    100,
    totalTargetGoal > 0 ? Math.round((currentSavings / totalTargetGoal) * 100) : 0
  );
  const remainingGap = Math.max(0, totalTargetGoal - currentSavings);

  // Timeline projection
  const monthsToGoal =
    monthlyContribution > 0 && remainingGap > 0
      ? Math.ceil(remainingGap / monthlyContribution)
      : 0;

  const targetDate = new Date();
  targetDate.setMonth(targetDate.getMonth() + monthsToGoal);
  const formattedTargetDate = targetDate.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  // Milestone checks
  const fhaMinimum = Math.round(targetPrice * 0.035);
  const convMinimum = Math.round(targetPrice * 0.05);
  const tenPercent = Math.round(targetPrice * 0.10);
  const twentyPercent = Math.round(targetPrice * 0.20);

  const isFhaReady = currentSavings >= fhaMinimum;
  const isConvReady = currentSavings >= convMinimum;
  const isTenPercentReady = currentSavings >= tenPercent;
  const isTwentyPercentReady = currentSavings >= twentyPercent;

  // Handlers for syncing % and $ for seller concessions
  const handleConcessionPercentChange = (pct: number) => {
    const sanitizedPct = Math.max(0, Math.min(10, pct));
    setSellerConcessionPercent(sanitizedPct);
    const calculatedDollar = Math.round(targetPrice * (sanitizedPct / 100));
    setSellerConcessionAmount(calculatedDollar);
  };

  const handleConcessionDollarChange = (dollar: number) => {
    const sanitizedDollar = Math.max(0, dollar);
    setSellerConcessionAmount(sanitizedDollar);
    const calculatedPct = targetPrice > 0 ? Number(((sanitizedDollar / targetPrice) * 100).toFixed(2)) : 0;
    setSellerConcessionPercent(calculatedPct);
  };

  // Handlers for Savings
  const handleApplySavings = (newAmount: number) => {
    const sanitized = Math.max(0, newAmount);
    if (onUpdateSavings) {
      onUpdateSavings(sanitized);
    }
    setTempSavingsInput(sanitized);
    setIsEditingSavings(false);
  };

  const handleApplyTargetPrice = (newPrice: number) => {
    const sanitized = Math.max(50000, newPrice);
    if (onUpdateTargetPrice) {
      onUpdateTargetPrice(sanitized);
    }
    setTempPriceInput(sanitized);
    setIsEditingPrice(false);
  };

  const handleQuickAdd = (increment: number) => {
    const updated = currentSavings + increment;
    handleApplySavings(updated);
  };

  return (
    <div 
      id="savings-goal-tracker-container"
      className="bg-white rounded-3xl border border-[#EAE7E0] p-6 sm:p-8 space-y-6 shadow-sm"
    >
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1EFE9] text-[#4A5D4E] text-xs font-semibold border border-[#EAE7E0]">
            <PiggyBank className="w-3.5 h-3.5 text-[#C18C5D]" />
            <span>Down Payment & Closing Funds Scenario</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#2D362E]">
            Down Payment & Cash-to-Close Tracker
          </h3>
          <div className="flex items-center flex-wrap gap-2 text-xs sm:text-sm text-[#606C5D]">
            <span>Track your cash savings against your target home purchase of</span>
            {isEditingPrice ? (
              <div className="inline-flex items-center gap-1.5 bg-[#F9F8F4] px-2 py-0.5 rounded-lg border border-[#4A5D4E]">
                <span className="font-bold text-[#2D362E]">$</span>
                <input
                  id="target-price-inline-input"
                  type="number"
                  step="5000"
                  min="50000"
                  value={tempPriceInput}
                  onChange={(e) => setTempPriceInput(Number(e.target.value))}
                  className="w-28 bg-white border border-[#EAE7E0] rounded px-1.5 py-0.5 text-xs font-bold text-[#2D362E] focus:outline-none"
                  autoFocus
                />
                <button
                  id="save-target-price-inline-btn"
                  onClick={() => handleApplyTargetPrice(tempPriceInput)}
                  className="px-2 py-0.5 bg-[#4A5D4E] text-white rounded text-[10px] font-bold"
                >
                  Apply
                </button>
                <button
                  onClick={() => setIsEditingPrice(false)}
                  className="text-[10px] text-[#9A9488] hover:text-[#2D362E] font-semibold"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <strong className="text-[#2D362E] font-bold bg-[#F1EFE9] px-2 py-0.5 rounded-lg border border-[#EAE7E0]">
                  {formatUSD(targetPrice)}
                </strong>
                <button
                  id="edit-target-price-btn"
                  onClick={() => {
                    setTempPriceInput(targetPrice);
                    setIsEditingPrice(true);
                  }}
                  className="text-xs text-[#C18C5D] hover:underline font-semibold"
                  title="Change your target home purchase price"
                >
                  (Change Price)
                </button>
              </span>
            )}
            <span>with real-world closing costs and official IPC limits.</span>
          </div>
        </div>

        {/* Current Savings Edit Box */}
        <div className="bg-[#F9F8F4] p-3.5 sm:p-4 rounded-2xl border border-[#EAE7E0] flex items-center justify-between sm:justify-end gap-3 shrink-0">
          <div>
            <span className="text-[10px] text-[#9A9488] font-bold uppercase tracking-wider block">
              Current Saved
            </span>
            {isEditingSavings ? (
              <div className="flex items-center gap-1.5 mt-1">
                <input
                  id="savings-goal-input-amount"
                  type="number"
                  step="500"
                  value={tempSavingsInput}
                  onChange={(e) => setTempSavingsInput(Number(e.target.value))}
                  className="w-28 bg-white border border-[#4A5D4E] rounded-lg px-2 py-1 text-sm font-bold text-[#2D362E] focus:outline-none"
                  autoFocus
                />
                <button
                  id="save-savings-btn"
                  onClick={() => handleApplySavings(tempSavingsInput)}
                  className="px-2.5 py-1 bg-[#4A5D4E] hover:bg-[#38463B] text-white rounded-lg text-xs font-semibold"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-bold text-[#4A5D4E]">
                  {formatUSD(currentSavings)}
                </span>
                <button
                  id="edit-savings-btn"
                  onClick={() => {
                    setTempSavingsInput(currentSavings);
                    setIsEditingSavings(true);
                  }}
                  className="text-[11px] text-[#C18C5D] hover:underline font-semibold"
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          <div className="h-9 w-px bg-[#EAE7E0] hidden sm:block" />

          {/* Quick Increment Buttons */}
          <div className="flex items-center gap-1">
            <button
              id="quick-add-500"
              onClick={() => handleQuickAdd(500)}
              className="px-2 py-1.5 bg-white hover:bg-[#F1EFE9] border border-[#EAE7E0] rounded-lg text-xs font-semibold text-[#606C5D] transition-colors shadow-xs"
              title="Add $500 to savings"
            >
              +$500
            </button>
            <button
              id="quick-add-1000"
              onClick={() => handleQuickAdd(1000)}
              className="px-2 py-1.5 bg-white hover:bg-[#F1EFE9] border border-[#EAE7E0] rounded-lg text-xs font-semibold text-[#606C5D] transition-colors shadow-xs"
              title="Add $1,000 to savings"
            >
              +$1k
            </button>
          </div>
        </div>
      </div>

      {/* Down Payment Target Selector */}
      <div className="bg-[#F9F8F4] p-4 sm:p-5 rounded-2xl border border-[#EAE7E0] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs font-bold text-[#2D362E] flex items-center gap-1.5">
            <Target className="w-4 h-4 text-[#C18C5D]" />
            <span>1. Select Target Down Payment Tier</span>
          </span>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-[#606C5D] cursor-pointer">
              <input
                id="include-closing-buffer-checkbox"
                type="checkbox"
                checked={includeClosingBuffer}
                onChange={(e) => setIncludeClosingBuffer(e.target.checked)}
                className="w-4 h-4 rounded text-[#4A5D4E] accent-[#4A5D4E]"
              />
              <span>Include Closing Cost Buffer ({closingBufferPercent}% = {formatUSD(Math.round(targetPrice * (closingBufferPercent / 100)))})</span>
            </label>
          </div>
        </div>

        {/* Goal Preset Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {[
            { id: 3.5, label: "3.5% FHA Min", amount: fhaMinimum, desc: "Fastest entry" },
            { id: 5, label: "5% Conventional", amount: convMinimum, desc: "Standard 1st time" },
            { id: 10, label: "10% Equity", amount: tenPercent, desc: "Lower PMI" },
            { id: 20, label: "20% Zero PMI", amount: twentyPercent, desc: "No monthly PMI" },
            { id: "custom", label: "Custom Goal", amount: customGoalAmount, desc: "Custom Target" },
          ].map((preset) => {
            const isSelected = selectedPreset === preset.id;
            return (
              <button
                key={preset.label}
                id={`preset-btn-${preset.id}`}
                onClick={() => {
                  setSelectedPreset(preset.id as any);
                  if (preset.id === 3.5) {
                    setLoanProgram("fha");
                  } else if (typeof preset.id === "number") {
                    setLoanProgram("conventional");
                  }
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "bg-[#4A5D4E] text-white border-[#4A5D4E] shadow-sm"
                    : "bg-white text-[#2D362E] border-[#EAE7E0] hover:border-[#DEDAD2]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold block">{preset.label}</span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
                <div className={`text-sm font-bold mt-0.5 ${isSelected ? "text-white" : "text-[#4A5D4E]"}`}>
                  {formatUSD(preset.amount)}
                </div>
                <span className={`text-[10px] block ${isSelected ? "text-white/80" : "text-[#9A9488]"}`}>
                  {preset.desc}
                </span>
              </button>
            );
          })}
        </div>

        {selectedPreset === "custom" && (
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#EAE7E0]">
            <span className="text-xs font-semibold text-[#606C5D]">Custom Down Payment Target:</span>
            
            <div className="flex items-center gap-2">
              {/* Dollar Input */}
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#606C5D]">$</span>
                <input
                  id="custom-down-payment-input"
                  type="number"
                  step="1000"
                  min="0"
                  max={targetPrice}
                  value={customGoalAmount}
                  onChange={(e) => {
                    const dollar = Math.max(0, Math.min(targetPrice, Number(e.target.value) || 0));
                    setCustomGoalAmount(dollar);
                  }}
                  className="w-32 pl-5 pr-2 py-1.5 bg-white border border-[#DEDAD2] rounded-xl text-xs text-[#2D362E] font-bold focus:outline-none focus:border-[#4A5D4E] text-right"
                  title="Custom target dollar amount"
                />
              </div>

              {/* % Input */}
              <div className="relative">
                <input
                  id="custom-down-payment-percent-input"
                  type="number"
                  step="0.5"
                  min="0"
                  max="100"
                  value={targetPrice > 0 ? Number(((customGoalAmount / targetPrice) * 100).toFixed(1)) : 0}
                  onChange={(e) => {
                    const pct = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                    const calculatedDollar = Math.round(targetPrice * (pct / 100));
                    setCustomGoalAmount(calculatedDollar);
                  }}
                  className="w-20 pl-2 pr-5 py-1.5 bg-white border border-[#DEDAD2] rounded-xl text-xs text-[#4A5D4E] font-bold focus:outline-none focus:border-[#4A5D4E] text-right"
                  title="Custom target percentage of purchase price"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-[#4A5D4E]">%</span>
              </div>
            </div>

            <span className="text-[11px] text-[#9A9488]">
              ({targetPrice > 0 ? ((customGoalAmount / targetPrice) * 100).toFixed(1) : 0}% of {formatUSD(targetPrice)})
            </span>
          </div>
        )}
      </div>

      {/* SELLER CONTRIBUTIONS AND CONCESSIONS SECTION (WITH AUTOMATIC IPC & CLOSING COST LIMITERS) */}
      <div 
        id="seller-concessions-section"
        className="bg-[#F9F8F4] p-4 sm:p-6 rounded-2xl border border-[#EAE7E0] space-y-4"
      >
        {/* Section Title & Loan Type Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Handshake className="w-4 h-4 text-[#C18C5D]" />
            <span className="text-xs sm:text-sm font-bold text-[#2D362E]">
              2. Seller Contributions & Concessions Scenario
            </span>
          </div>

          {/* Loan Program Toggle for IPC Rule Matching */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-[#606C5D] mr-1">Loan Program:</span>
            {[
              { id: "conventional", label: "Conventional" },
              { id: "fha", label: "FHA (6%)" },
              { id: "usda", label: "USDA RD (6%)" },
              { id: "va", label: "VA (4%)" },
            ].map((p) => {
              const active = loanProgram === p.id;
              return (
                <button
                  key={p.id}
                  id={`select-loan-prog-${p.id}`}
                  onClick={() => setLoanProgram(p.id as LoanProgramType)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? "bg-[#4A5D4E] text-white shadow-xs"
                      : "bg-white text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F1EFE9]"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Interested Party Contribution (IPC) Policy Badges */}
        <div className="p-3 bg-white rounded-xl border border-[#EAE7E0] space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-[#2D362E] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#4A5D4E]" />
                <span>Program IPC Cap:</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#F1EFE9] text-[#4A5D4E] font-bold">
                {ipcResult.maxIPCPercent}% of Sales Price ({formatUSD(ipcResult.maxIPCDollar)})
              </span>
              <span className="text-[11px] text-[#606C5D] hidden md:inline">
                • LTV: {ipcResult.ltv.toFixed(1)}% ({ipcResult.downPaymentPercent.toFixed(1)}% Down)
              </span>
            </div>

            <div className="text-[11px] text-[#606C5D] flex items-center gap-1">
              <Scale className="w-3 h-3 text-[#C18C5D]" />
              <span>Closing Buffer Cap: <strong className="text-[#2D362E]">{formatUSD(estimatedClosingBuffer)}</strong> ({closingBufferPercent}%)</span>
            </div>
          </div>

          <p className="text-[11px] text-[#606C5D] leading-relaxed border-t border-[#EAE7E0] pt-2">
            <strong>Regulatory Rule ({ipcResult.regulatorySource}):</strong> {ipcResult.guidelineSummary}
          </p>
        </div>

        {/* Dual Input Controls: % and Flat Dollar Amount */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* % Entry */}
          <div className="lg:col-span-4 bg-white p-3 rounded-xl border border-[#EAE7E0] space-y-1">
            <label className="text-[11px] font-bold text-[#606C5D] uppercase tracking-wider block">
              Seller Concession (% of Price)
            </label>
            <div className="flex items-center gap-2">
              <input
                id="seller-concession-percent-input"
                type="number"
                step="0.25"
                min="0"
                max="10"
                value={sellerConcessionPercent || ""}
                placeholder="0.00"
                onChange={(e) => handleConcessionPercentChange(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-lg px-3 py-1.5 text-sm font-bold text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
              />
              <span className="text-sm font-bold text-[#606C5D]">%</span>
            </div>
          </div>

          {/* $ Entry */}
          <div className="lg:col-span-4 bg-white p-3 rounded-xl border border-[#EAE7E0] space-y-1">
            <label className="text-[11px] font-bold text-[#606C5D] uppercase tracking-wider block">
              Seller Concession ($ Amount)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#606C5D]">$</span>
              <input
                id="seller-concession-dollar-input"
                type="number"
                step="250"
                min="0"
                value={sellerConcessionAmount || ""}
                placeholder="0"
                onChange={(e) => handleConcessionDollarChange(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-lg px-3 py-1.5 text-sm font-bold text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
              />
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="lg:col-span-4 flex flex-wrap items-center gap-1.5">
            <button
              id="concession-preset-0"
              onClick={() => handleConcessionPercentChange(0)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                sellerConcessionPercent === 0 
                  ? "bg-[#4A5D4E] text-white border-[#4A5D4E]" 
                  : "bg-white text-[#606C5D] border-[#EAE7E0] hover:bg-[#F1EFE9]"
              }`}
            >
              $0 (0%)
            </button>
            <button
              id="concession-preset-match-buffer"
              onClick={() => handleConcessionPercentChange(closingBufferPercent)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                sellerConcessionPercent === closingBufferPercent 
                  ? "bg-[#4A5D4E] text-white border-[#4A5D4E]" 
                  : "bg-white text-[#606C5D] border-[#EAE7E0] hover:bg-[#F1EFE9]"
              }`}
              title="Full closing cost coverage"
            >
              {closingBufferPercent}% (Full Buffer)
            </button>
            <button
              id="concession-preset-max-ipc"
              onClick={() => handleConcessionPercentChange(ipcResult.maxIPCPercent)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                sellerConcessionPercent === ipcResult.maxIPCPercent 
                  ? "bg-[#4A5D4E] text-white border-[#4A5D4E]" 
                  : "bg-white text-[#606C5D] border-[#EAE7E0] hover:bg-[#F1EFE9]"
              }`}
              title={`Program maximum allowable IPC: ${ipcResult.maxIPCPercent}%`}
            >
              {ipcResult.maxIPCPercent}% (Max IPC)
            </button>
          </div>
        </div>

        {/* Limiter Analysis & Breakdown */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#EAE7E0] space-y-2 text-xs">
          {/* Dynamic Status Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <div className="bg-[#F9F8F4] p-2.5 rounded-lg border border-[#EAE7E0]">
              <span className="text-[10px] text-[#9A9488] font-bold block uppercase">Entered Concession</span>
              <span className="text-xs sm:text-sm font-bold text-[#2D362E]">
                {formatUSD(sellerConcessionAmount)} ({sellerConcessionPercent}%)
              </span>
            </div>

            <div className="bg-[#F9F8F4] p-2.5 rounded-lg border border-[#EAE7E0]">
              <span className="text-[10px] text-[#9A9488] font-bold block uppercase">Program Cap ({ipcResult.maxIPCPercent}%)</span>
              <span className="text-xs sm:text-sm font-bold text-[#4A5D4E]">
                {formatUSD(ipcResult.maxIPCDollar)}
              </span>
            </div>

            <div className="bg-[#F9F8F4] p-2.5 rounded-lg border border-[#EAE7E0]">
              <span className="text-[10px] text-[#9A9488] font-bold block uppercase">Applied to Closing Buffer</span>
              <span className="text-xs sm:text-sm font-bold text-[#4A5D4E]">
                {formatUSD(appliedSellerConcession)}
              </span>
            </div>

            <div className="bg-[#F9F8F4] p-2.5 rounded-lg border border-[#EAE7E0]">
              <span className="text-[10px] text-[#9A9488] font-bold block uppercase">Net Buyer Closing Costs</span>
              <span className="text-xs sm:text-sm font-bold text-[#2D362E]">
                {netBuyerClosingCosts === 0 ? (
                  <span className="text-emerald-700 font-bold">$0 (100% Covered)</span>
                ) : (
                  formatUSD(netBuyerClosingCosts)
                )}
              </span>
            </div>
          </div>

          {/* Warning 1: Capped by Program Maximum IPC */}
          {ipcResult.isCappedByProgram && (
            <div 
              id="ipc-program-cap-warning"
              className="p-3 bg-red-50 rounded-lg border border-red-200 text-red-900 text-[11px] flex items-start gap-2 mt-2"
            >
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Underwriting Guideline Violation ({ipcResult.regulatorySource}): </strong>
                Your requested seller concession of {formatUSD(sellerConcessionAmount)} ({sellerConcessionPercent}%) exceeds the <strong>{ipcResult.maxIPCPercent}% maximum allowable Interested Party Contribution (IPC) limit of {formatUSD(ipcResult.maxIPCDollar)}</strong> for a {ipcResult.programName}. 
                The excess <strong className="font-bold">+{formatUSD(ipcResult.excessOverProgramCap)}</strong> is illegal under program guidelines and will trigger a dollar-for-dollar reduction in loan amount or loan rejection.
              </div>
            </div>
          )}

          {/* Warning 2: Capped by Closing Buffer (Cannot be applied to Down Payment) */}
          {!ipcResult.isCappedByProgram && ipcResult.isCappedByClosingBuffer && (
            <div 
              id="concession-limiter-warning"
              className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2 mt-2"
            >
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Down Payment Limiter Applied: </strong>
                Your seller concession of {formatUSD(sellerConcessionAmount)} is within the program IPC limit ({ipcResult.maxIPCPercent}%), but exceeds your estimated closing costs buffer of {formatUSD(estimatedClosingBuffer)}. 
                The excess <strong className="font-bold">+{formatUSD(ipcResult.excessOverClosingBuffer)}</strong> cannot be used to pay for your minimum down payment or given as cash back. <em>(Tip: You can use excess seller funds to buy down your interest rate via discount points or a 2-1 temporary buydown!)</em>
              </div>
            </div>
          )}

          {/* Helpful Reference Table Accordion */}
          <div className="pt-2 border-t border-[#EAE7E0] flex items-center justify-between text-[11px] text-[#606C5D]">
            <span>
              <strong>IPC Quick Matrix:</strong> Conv &gt;90% LTV = 3% | Conv 80-90% LTV = 6% | Conv &le;80% LTV = 9% | FHA = 6% | USDA = 6% | VA = 4% Concessions
            </span>
          </div>
        </div>
      </div>

      {/* Cash-to-Close Equation Summary Banner */}
      <div className="bg-[#F1EFE9] p-4 rounded-2xl border border-[#EAE7E0] space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="font-bold text-[#2D362E] flex items-center gap-1.5">
            <Receipt className="w-4 h-4 text-[#4A5D4E]" />
            <span>Cash-to-Close Financial Formula:</span>
          </span>
          <span className="text-[11px] text-[#606C5D]">
            Required Down Payment + Net Out-of-Pocket Closing Costs
          </span>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 font-mono text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="bg-white px-2.5 py-1 rounded-lg border border-[#EAE7E0] text-[#2D362E] font-bold">
              Down Payment: {formatUSD(baseDownPaymentGoal)}
            </span>
            <span className="text-[#9A9488] font-bold">+</span>
            <span className="bg-white px-2.5 py-1 rounded-lg border border-[#EAE7E0] text-[#2D362E] font-bold">
              Net Closing: {formatUSD(netBuyerClosingCosts)}
            </span>
            <span className="text-[#9A9488] font-bold">=</span>
          </div>

          <div className="bg-[#4A5D4E] text-white px-3.5 py-1.5 rounded-xl font-bold font-sans text-sm sm:text-base flex items-center gap-2 shadow-xs">
            <span>Total Cash Goal:</span>
            <span>{formatUSD(totalTargetGoal)}</span>
          </div>
        </div>
      </div>

      {/* Main Progress Visualization Card */}
      <div className="space-y-4 pt-1">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-serif font-bold text-[#2D362E]">
                {progressPercent}%
              </span>
              <span className="text-xs sm:text-sm font-semibold text-[#4A5D4E] bg-[#4A5D4E]/10 px-2.5 py-0.5 rounded-full border border-[#4A5D4E]/20">
                {progressPercent >= 100 ? "Goal Reached!" : `${formatUSD(remainingGap)} Remaining`}
              </span>
            </div>
            <p className="text-xs text-[#606C5D]">
              <strong className="text-[#2D362E]">{formatUSD(currentSavings)}</strong> saved toward{" "}
              <strong className="text-[#2D362E]">{formatUSD(totalTargetGoal)}</strong> total cash-to-close goal
            </p>
          </div>

          {/* Timeline Estimation */}
          <div className="flex items-center gap-3 bg-[#F1EFE9] px-3.5 py-2 rounded-xl border border-[#EAE7E0] text-xs">
            <Calendar className="w-4 h-4 text-[#C18C5D] shrink-0" />
            <div>
              <span className="text-[#606C5D] block text-[10px]">Estimated Horizon</span>
              <span className="font-bold text-[#2D362E]">
                {remainingGap === 0 ? "Ready to Buy Now" : `${monthsToGoal} Months (${formattedTargetDate})`}
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Multi-Tier Progress Bar */}
        <div className="space-y-2">
          <div className="relative w-full h-4 bg-[#EAE7E0] rounded-full overflow-hidden shadow-inner">
            <div
              id="savings-progress-bar-fill"
              style={{ width: `${progressPercent}%` }}
              className={`h-full rounded-full transition-all duration-500 ${
                progressPercent >= 100
                  ? "bg-emerald-600"
                  : progressPercent >= 60
                  ? "bg-[#4A5D4E]"
                  : "bg-[#C18C5D]"
              }`}
            />
          </div>

          {/* Key Milestone Status Checkpoints */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            <div className={`p-2.5 rounded-xl border text-xs space-y-1 ${
              isFhaReady ? "bg-emerald-50/70 border-emerald-200 text-emerald-900" : "bg-[#F9F8F4] border-[#EAE7E0] text-[#606C5D]"
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span>3.5% FHA Min</span>
                {isFhaReady ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <span className="text-[10px] text-[#9A9488] font-normal">{formatUSD(fhaMinimum)}</span>}
              </div>
              <span className="text-[10px] block font-medium">
                {isFhaReady ? "Unlocked & Ready" : `${formatUSD(Math.max(0, fhaMinimum - currentSavings))} more needed`}
              </span>
            </div>

            <div className={`p-2.5 rounded-xl border text-xs space-y-1 ${
              isConvReady ? "bg-emerald-50/70 border-emerald-200 text-emerald-900" : "bg-[#F9F8F4] border-[#EAE7E0] text-[#606C5D]"
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span>5% Conventional</span>
                {isConvReady ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <span className="text-[10px] text-[#9A9488] font-normal">{formatUSD(convMinimum)}</span>}
              </div>
              <span className="text-[10px] block font-medium">
                {isConvReady ? "Unlocked & Ready" : `${formatUSD(Math.max(0, convMinimum - currentSavings))} more needed`}
              </span>
            </div>

            <div className={`p-2.5 rounded-xl border text-xs space-y-1 ${
              isTenPercentReady ? "bg-emerald-50/70 border-emerald-200 text-emerald-900" : "bg-[#F9F8F4] border-[#EAE7E0] text-[#606C5D]"
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span>10% Equity Tier</span>
                {isTenPercentReady ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <span className="text-[10px] text-[#9A9488] font-normal">{formatUSD(tenPercent)}</span>}
              </div>
              <span className="text-[10px] block font-medium">
                {isTenPercentReady ? "Unlocked" : `${formatUSD(Math.max(0, tenPercent - currentSavings))} more needed`}
              </span>
            </div>

            <div className={`p-2.5 rounded-xl border text-xs space-y-1 ${
              isTwentyPercentReady ? "bg-emerald-50/70 border-emerald-200 text-emerald-900" : "bg-[#F9F8F4] border-[#EAE7E0] text-[#606C5D]"
            }`}>
              <div className="flex items-center justify-between font-bold">
                <span>20% Zero-PMI</span>
                {isTwentyPercentReady ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <span className="text-[10px] text-[#9A9488] font-normal">{formatUSD(twentyPercent)}</span>}
              </div>
              <span className="text-[10px] block font-medium">
                {isTwentyPercentReady ? "Zero PMI Unlocked" : `${formatUSD(Math.max(0, twentyPercent - currentSavings))} more needed`}
              </span>
            </div>
          </div>
        </div>

        {/* Monthly Contribution Pace Setting */}
        <div className="bg-[#F9F8F4] p-4 rounded-2xl border border-[#EAE7E0] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#EAE7E0] flex items-center justify-center text-[#4A5D4E] shrink-0 shadow-xs">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-[#2D362E] block">Monthly Savings Pace</span>
              <span className="text-[#606C5D]">
                Adjust how much cash you deposit monthly to recalculate target completion.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#606C5D] font-semibold">$</span>
            <input
              id="monthly-savings-pace-input"
              type="number"
              step="100"
              min="50"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Math.max(1, Number(e.target.value)))}
              className="w-28 bg-white border border-[#EAE7E0] rounded-xl px-3 py-1.5 text-xs text-[#2D362E] font-bold focus:outline-none focus:border-[#4A5D4E]"
            />
            <span className="text-[#606C5D]">/ month</span>
          </div>
        </div>

        {/* DPA Grants Prompt */}
        {onNavigate && (
          <div className="bg-[#C18C5D]/10 p-3.5 rounded-2xl border border-[#C18C5D]/25 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#2D362E]">
              <Sparkles className="w-4 h-4 text-[#C18C5D] shrink-0" />
              <span>
                Want to accelerate your goal? You may be eligible for up to <strong className="text-[#A87447]">$15,000+ in Oregon Down Payment Assistance Grants</strong>.
              </span>
            </div>
            <button
              id="check-grants-btn"
              onClick={() => onNavigate("grants", "website")}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F1EFE9] text-[#C18C5D] font-bold border border-[#C18C5D]/30 flex items-center gap-1 transition-colors shadow-xs text-[11px]"
            >
              <span>Explore Oregon Grants</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
