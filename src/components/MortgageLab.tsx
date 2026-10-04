import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  PieChart, 
  Layers, 
  FileText, 
  Clock, 
  CheckCircle2,
  BookmarkPlus,
  Check,
  Percent,
  Hourglass,
  HelpCircle,
  Award,
  AlertTriangle,
  ArrowLeft
} from "lucide-react";
import { FinancialProfile, CapturedLead, SavedScenario, LoanOfficerProfile, RealEstateAgentProfile } from "../types";
import { 
  calculateMortgageBreakdown, 
  calculateAmortizationCurve, 
  calculateClosingCosts, 
  calculateRentVsBuy, 
  calculateMonthlyPI, 
  formatUSD 
} from "../utils/mortgageMath";
import { LeadScenarioSearch } from "./LeadScenarioSearch";
import { ScenarioOutreachModal } from "./ScenarioOutreachModal";
import { buildSavedScenario } from "../utils/scenarioOutreachGenerator";
import { DTIUnderwritingMeter } from "./DTIUnderwritingMeter";
import { ContextualVideoPlayer } from "./ContextualVideoPlayer";
import { GeminiAgentPanel } from "./GeminiAgentPanel";

interface MortgageLabProps {
  profile: FinancialProfile;
  leads?: CapturedLead[];
  onUpdateLead?: (lead: CapturedLead) => void;
  loanOfficer?: LoanOfficerProfile;
  activeAgent?: RealEstateAgentProfile;
  onOpenEmailOutreach?: (leadId: string, subject?: string, body?: string) => void;
  onOpenSmsOutreach?: (leadId: string, text?: string) => void;
  initialTab?: "buydown" | "costofwaiting" | "accelerator" | "amortization" | "closingcosts" | "rentvsbuy";
  isLoanOfficerMode?: boolean;
  onBack?: () => void;
}

export const MortgageLab: React.FC<MortgageLabProps> = ({
  profile,
  leads = [],
  onUpdateLead,
  loanOfficer,
  activeAgent,
  onOpenEmailOutreach,
  onOpenSmsOutreach,
  initialTab = "buydown",
  isLoanOfficerMode = false,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<"buydown" | "costofwaiting" | "accelerator" | "amortization" | "closingcosts" | "rentvsbuy" | "agent">(initialTab as any);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
  const [extraPrincipal, setExtraPrincipal] = useState<number>(150);
  const [currentRent, setCurrentRent] = useState<number>(2100);
  const [appreciationRate, setAppreciationRate] = useState<number>(3.8);
  const [rateShiftScenario, setRateShiftScenario] = useState<"down" | "flat" | "up">("flat");

  // Lead linking state
  const [selectedLead, setSelectedLead] = useState<CapturedLead | null>(() => {
    return leads.length > 0 ? leads[0] : null;
  });
  const [activeOutreachScenario, setActiveOutreachScenario] = useState<SavedScenario | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const breakdown = calculateMortgageBreakdown(profile);
  const amortizationData = calculateAmortizationCurve(
    breakdown.loanAmount,
    profile.interestRate,
    profile.loanTermYears,
    extraPrincipal
  );

  const closingCosts = calculateClosingCosts(profile.targetPrice, breakdown.loanAmount);
  const rentVsBuyTimeline = calculateRentVsBuy(
    profile.targetPrice,
    profile.downPaymentSavings,
    currentRent,
    3.0,
    2.0,
    profile.interestRate
  );

  // 2-1 Rate Buydown Calculations
  const loanAmount = Math.max(0, profile.targetPrice - profile.downPaymentSavings);
  const fullRate = profile.interestRate || 6.5;
  const year1Rate = Math.max(0.1, Number((fullRate - 2.0).toFixed(3)));
  const year2Rate = Math.max(0.1, Number((fullRate - 1.0).toFixed(3)));

  const fullMonthlyPI = calculateMonthlyPI(loanAmount, fullRate, 30);
  const year1MonthlyPI = calculateMonthlyPI(loanAmount, year1Rate, 30);
  const year2MonthlyPI = calculateMonthlyPI(loanAmount, year2Rate, 30);

  const year1MonthlySavings = Math.max(0, fullMonthlyPI - year1MonthlyPI);
  const year2MonthlySavings = Math.max(0, fullMonthlyPI - year2MonthlyPI);

  const year1TotalSavings = year1MonthlySavings * 12;
  const year2TotalSavings = year2MonthlySavings * 12;
  const totalBuydownSubsidyCost = year1TotalSavings + year2TotalSavings;
  const buydownPercentOfPrice = profile.targetPrice > 0 ? (totalBuydownSubsidyCost / profile.targetPrice) * 100 : 2.15;

  // Cost of Waiting Calculations (6mo, 1yr, 2yr, 3yr)
  const waitingIntervals = [0.5, 1, 2, 3];
  const costOfWaitingData = waitingIntervals.map(yrs => {
    const futurePrice = profile.targetPrice * Math.pow(1 + (appreciationRate / 100), yrs);
    const priceIncrease = futurePrice - profile.targetPrice;
    const cumulativeRentPaid = currentRent * 12 * yrs;
    
    // Principal paydown equity foregone
    const estAnnualPrincipalPaid = (breakdown.principalAndInterest * 12) * 0.32;
    const missedPrincipalEquity = estAnnualPrincipalPaid * yrs;
    
    let projectedFutureRate = profile.interestRate;
    if (rateShiftScenario === "down") projectedFutureRate = Math.max(3.5, profile.interestRate - 0.75);
    if (rateShiftScenario === "up") projectedFutureRate = profile.interestRate + 0.75;
    
    const futureLoanAmount = futurePrice * (1 - (profile.downPaymentSavings / (profile.targetPrice || 1)));
    const futurePI = calculateMonthlyPI(futureLoanAmount, projectedFutureRate, 30);
    const monthlyPaymentDiff = futurePI - breakdown.principalAndInterest;
    
    const totalCostOfWaiting = priceIncrease + cumulativeRentPaid + missedPrincipalEquity;
    
    return {
      years: yrs,
      label: yrs === 0.5 ? "6 Months" : `${yrs} Year${yrs > 1 ? "s" : ""}`,
      futurePrice,
      priceIncrease,
      cumulativeRentPaid,
      missedPrincipalEquity,
      projectedFutureRate,
      futurePI,
      monthlyPaymentDiff,
      totalCostOfWaiting
    };
  });

  const handleSaveScenario = () => {
    if (!selectedLead) return;

    let scenarioTitle = `2-1 Buydown Strategy (Saves ${formatUSD(year1MonthlySavings)}/mo Year 1)`;
    if (activeTab === "costofwaiting") scenarioTitle = `Cost of Waiting Analysis (${formatUSD(costOfWaitingData[1]?.totalCostOfWaiting || 0)} 1-Yr Cost)`;
    if (activeTab === "accelerator") scenarioTitle = `Early Payoff Accelerator (+${formatUSD(extraPrincipal)}/mo)`;
    if (activeTab === "closingcosts") scenarioTitle = `Closing Costs Breakdown (${formatUSD(closingCosts.totalEstimatedClosingCosts)})`;
    if (activeTab === "rentvsbuy") scenarioTitle = `10-Yr Wealth Strategy (${formatUSD(rentVsBuyTimeline[9]?.homeEquity || 0)} Equity)`;
    if (activeTab === "amortization") scenarioTitle = `Amortization Schedule (${profile.loanTermYears}-Yr @ ${profile.interestRate}%)`;

    const newScenario = buildSavedScenario({
      lead: selectedLead,
      profile,
      breakdown,
      loanProgram: activeTab === "buydown" ? "2-1 Temporary Rate Buydown" : `${profile.loanTermYears}-Yr Fixed Strategy`,
      sourceTool: "mortgagelab",
      loanOfficer,
      agent: activeAgent,
      scenarioName: `${scenarioTitle} @ ${formatUSD(profile.targetPrice)}`
    });

    const updatedScenarios = [newScenario, ...(selectedLead.savedScenarios || [])];
    const updatedLead: CapturedLead = {
      ...selectedLead,
      savedScenarios: updatedScenarios
    };

    if (onUpdateLead) {
      onUpdateLead(updatedLead);
    }
    setSelectedLead(updatedLead);
    setActiveOutreachScenario(newScenario);
    setSaveSuccessMsg(`✓ Saved ${scenarioTitle} to ${selectedLead.fullName}'s profile! Ready-made drafts generated.`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-8">
      {/* Lead Profile Search & Link Bar (Only in Loan Officer Mode) */}
      {isLoanOfficerMode && leads.length > 0 && (
        <LeadScenarioSearch
          leads={leads}
          selectedLead={selectedLead}
          onSelectLead={(lead) => setSelectedLead(lead)}
          toolName="Mortgage Lab & Financial Modeling Suite"
        />
      )}

      {/* Back Button (e.g. from mobile or deep link) */}
      {onBack && (
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4A5D4E] hover:text-[#2D362E] dark:text-[#A9BBAA] bg-white dark:bg-slate-800 px-3.5 py-2 rounded-xl border border-[#EAE7E0] dark:border-slate-700 shadow-2xs cursor-pointer active:scale-95 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Overview</span>
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#EAE7E0] p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1EFE9] text-[#4A5D4E] text-xs font-semibold border border-[#EAE7E0]">
              <TrendingUp className="w-3.5 h-3.5 text-[#C18C5D]" />
              <span>Financial Modeling & Strategy Lab</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D362E]">
              Mortgage Math, Scenario Modeling & True Costs
            </h2>
            <p className="text-xs sm:text-sm text-[#606C5D]">
              Explore 2-1 seller rate buydowns, cost of waiting analytics, payoff accelerators, and closing cost breakdowns.
            </p>
          </div>

          {isLoanOfficerMode && selectedLead && (
            <button
              type="button"
              onClick={handleSaveScenario}
              className="px-4 py-2.5 bg-[#4A5D4E] hover:bg-[#38463B] text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer"
            >
              <BookmarkPlus className="w-4 h-4 text-[#D4A373]" />
              <span>Save Strategy to {(selectedLead.fullName || "Client").split(" ")[0]}</span>
            </button>
          )}
        </div>

        {isLoanOfficerMode && saveSuccessMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-900 animate-fadeIn">
            <span className="font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              {saveSuccessMsg}
            </span>
            {activeOutreachScenario && (
              <button
                type="button"
                onClick={() => setActiveOutreachScenario(activeOutreachScenario)}
                className="font-bold text-emerald-800 underline hover:text-emerald-950"
              >
                View Drafts Now →
              </button>
            )}
          </div>
        )}

        {/* Lab Navigation Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-[#EAE7E0]">
          {[
            { id: "buydown", label: "2-1 Rate Buydown Calculator", icon: Percent, badge: "Popular" },
            { id: "costofwaiting", label: "Cost of Waiting Analysis", icon: Hourglass, badge: "Strategy" },
            { id: "accelerator", label: "Early Payoff Accelerator", icon: Sparkles },
            { id: "amortization", label: "Amortization Curve", icon: Layers },
            { id: "closingcosts", label: "Itemized Closing Costs", icon: FileText },
            { id: "rentvsbuy", label: "Rent vs Buy (10-Yr Equity)", icon: TrendingUp },
            { id: "agent", label: "Gemini Agent & Search", icon: Sparkles, badge: "AI" },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#4A5D4E] text-white shadow-sm font-bold"
                    : "bg-white text-[#606C5D] hover:text-[#2D362E] border border-[#EAE7E0]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                    isActive ? "bg-white/20 text-white" : "bg-[#F1EFE9] text-[#C18C5D]"
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 0: 2-1 Temporary Interest Rate Buydown Calculator */}
      {activeTab === "buydown" && (
        <div className="space-y-6">
          {/* Contextual Video Embed for Buydown Strategy */}
          <div className="w-full">
            <ContextualVideoPlayer 
              videoId="YprqzJp5hTc" 
              title="Understanding the 2-1 Rate Buydown Strategy" 
              description="Learn exactly how a seller-paid 2-1 buydown works to temporarily lower your interest rate and save you money."
              className="shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Buydown Controls & Explanation */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-[#EAE7E0] p-6 space-y-6 shadow-sm">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EBF3ED] text-[#2F5738] text-[10px] font-bold border border-[#C2DEC8] mb-2">
                  <Sparkles className="w-3 h-3 text-[#C18C5D]" />
                  <span>Seller-Funded Payment Relief</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-[#2D362E]">2-1 Temporary Rate Buydown</h3>
                <p className="text-xs text-[#606C5D] mt-1 leading-relaxed">
                  A 2-1 Buydown reduces your mortgage interest rate by <strong className="text-[#2D362E]">2.0% in Year 1</strong> and <strong className="text-[#2D362E]">1.0% in Year 2</strong> before returning to the permanent note rate in Year 3.
                </p>
              </div>

              {/* Financial Inputs Summary */}
              <div className="space-y-3 bg-[#FAF9F5] p-4 rounded-xl border border-[#EAE7E0] text-xs">
                <div className="flex justify-between items-center text-[#606C5D]">
                  <span>Purchase Price:</span>
                  <span className="font-bold text-[#2D362E]">{formatUSD(profile.targetPrice)}</span>
                </div>
                <div className="flex justify-between items-center text-[#606C5D]">
                  <span>Down Payment ({breakdown.downPaymentPercent}%):</span>
                  <span className="font-bold text-[#2D362E]">{formatUSD(profile.downPaymentSavings)}</span>
                </div>
                <div className="flex justify-between items-center text-[#606C5D]">
                  <span>Base Loan Amount:</span>
                  <span className="font-bold text-[#4A5D4E]">{formatUSD(loanAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-[#606C5D] border-t border-[#EAE7E0] pt-2">
                  <span>Permanent Note Rate:</span>
                  <span className="font-bold text-[#2D362E]">{fullRate}% Fixed (30 Years)</span>
                </div>
              </div>

              {/* Total 2-Year Subsidy Box */}
              <div className="bg-[#4A5D4E]/10 p-4 rounded-xl border border-[#4A5D4E]/30 space-y-2">
                <span className="text-[11px] font-bold text-[#4A5D4E] uppercase tracking-wider block">
                  Seller Concession Credit Required to Fund:
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold text-[#4A5D4E]">{formatUSD(totalBuydownSubsidyCost)}</span>
                  <span className="text-xs font-semibold text-[#606C5D]">
                    ({buydownPercentOfPrice.toFixed(2)}% of Purchase Price)
                  </span>
                </div>
                <p className="text-[11px] text-[#606C5D] leading-snug">
                  The seller deposits this exact amount into an escrow account at closing. Each month during Years 1 & 2, the lender draws the difference from escrow so you pay the lower payment!
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <Award className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="font-bold">First-Time Buyer Pro-Tip:</strong> Asking for a {buydownPercentOfPrice.toFixed(1)}% seller credit to fund a 2-1 buydown gives you immediate cash-flow relief while preserving the option to refinance if rates drop later with zero penalty.
                </p>
              </div>
            </div>

            {/* Right Column: Year-by-Year Payment Tiers & Savings */}
            <div className="lg:col-span-7 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Year 1 Card */}
                <div className="bg-white rounded-2xl border-2 border-emerald-500/60 p-5 space-y-3 shadow-xs relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">
                    -2.0% RATE
                  </div>
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">Year 1 Payment</span>
                  <div className="text-2xl font-bold text-emerald-900">
                    {formatUSD(year1MonthlyPI)}
                    <span className="text-xs font-normal text-[#606C5D]">/mo P&I</span>
                  </div>
                  <div className="text-xs space-y-1 pt-2 border-t border-[#EAE7E0]">
                    <div className="flex justify-between text-[#606C5D]">
                      <span>Effective Rate:</span>
                      <strong className="text-emerald-700">{year1Rate}%</strong>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Monthly Savings:</span>
                      <span>-{formatUSD(year1MonthlySavings)}/mo</span>
                    </div>
                    <div className="flex justify-between text-[#2D362E] font-medium pt-1">
                      <span>12-Month Total:</span>
                      <span>{formatUSD(year1TotalSavings)} Saved</span>
                    </div>
                  </div>
                </div>

                {/* Year 2 Card */}
                <div className="bg-white rounded-2xl border-2 border-teal-500/60 p-5 space-y-3 shadow-xs relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-teal-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg">
                    -1.0% RATE
                  </div>
                  <span className="text-xs font-bold text-teal-800 uppercase tracking-wider block">Year 2 Payment</span>
                  <div className="text-2xl font-bold text-teal-900">
                    {formatUSD(year2MonthlyPI)}
                    <span className="text-xs font-normal text-[#606C5D]">/mo P&I</span>
                  </div>
                  <div className="text-xs space-y-1 pt-2 border-t border-[#EAE7E0]">
                    <div className="flex justify-between text-[#606C5D]">
                      <span>Effective Rate:</span>
                      <strong className="text-teal-700">{year2Rate}%</strong>
                    </div>
                    <div className="flex justify-between text-teal-700 font-bold">
                      <span>Monthly Savings:</span>
                      <span>-{formatUSD(year2MonthlySavings)}/mo</span>
                    </div>
                    <div className="flex justify-between text-[#2D362E] font-medium pt-1">
                      <span>12-Month Total:</span>
                      <span>{formatUSD(year2TotalSavings)} Saved</span>
                    </div>
                  </div>
                </div>

                {/* Year 3-30 Card */}
                <div className="bg-[#FAF9F5] rounded-2xl border border-[#EAE7E0] p-5 space-y-3 shadow-xs">
                  <span className="text-xs font-bold text-[#606C5D] uppercase tracking-wider block">Years 3 to 30</span>
                  <div className="text-2xl font-bold text-[#2D362E]">
                    {formatUSD(fullMonthlyPI)}
                    <span className="text-xs font-normal text-[#606C5D]">/mo P&I</span>
                  </div>
                  <div className="text-xs space-y-1 pt-2 border-t border-[#EAE7E0]">
                    <div className="flex justify-between text-[#606C5D]">
                      <span>Full Note Rate:</span>
                      <strong className="text-[#2D362E]">{fullRate}%</strong>
                    </div>
                    <div className="flex justify-between text-[#606C5D]">
                      <span>Status:</span>
                      <span className="text-[#9A9488]">Standard Rate</span>
                    </div>
                    <div className="flex justify-between text-[#2D362E] font-medium pt-1">
                      <span>Loan Term:</span>
                      <span>Fixed 30 Years</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comprehensive Comparison Table */}
              <div className="bg-white rounded-2xl border border-[#EAE7E0] p-5 space-y-3 shadow-xs">
                <h4 className="font-bold text-sm text-[#2D362E] flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#4A5D4E]" />
                  <span>2-Year Total Out-of-Pocket Cash Flow Savings</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 bg-[#FAF9F5] rounded-xl border border-[#EAE7E0] space-y-1.5">
                    <span className="text-[#606C5D] font-medium block">Total Buyer Relief (24 Months):</span>
                    <span className="text-2xl font-extrabold text-[#2F5738]">{formatUSD(totalBuydownSubsidyCost)}</span>
                    <span className="text-[11px] text-[#606C5D] block">
                      Year 1 Savings ({formatUSD(year1TotalSavings)}) + Year 2 Savings ({formatUSD(year2TotalSavings)})
                    </span>
                  </div>

                  <div className="p-3.5 bg-[#FAF9F5] rounded-xl border border-[#EAE7E0] space-y-1.5">
                    <span className="text-[#606C5D] font-medium block">Total Estimated Monthly PITI with Escrow (Year 1):</span>
                    <span className="text-2xl font-extrabold text-[#4A5D4E]">
                      {formatUSD(year1MonthlyPI + breakdown.propertyTax + breakdown.homeInsurance + breakdown.pmi)}
                      <span className="text-xs font-normal text-[#606C5D]">/mo</span>
                    </span>
                    <span className="text-[11px] text-[#606C5D] block">
                      Includes P&I + Property Tax + Insurance + PMI
                    </span>
                  </div>
                </div>
              </div>

              {/* Real-time DTI Underwriting Risk Meter */}
              <DTIUnderwritingMeter
                frontEndDTI={breakdown.frontEndDTI}
                backEndDTI={breakdown.backEndDTI}
                grossMonthlyIncome={Math.max(1, profile.annualIncome / 12)}
                totalHousingPayment={breakdown.totalMonthly}
                monthlyDebts={profile.monthlyDebt}
                isLoanOfficerMode={isLoanOfficerMode}
                showCalculations={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: Cost of Waiting Analysis Tool */}
      {activeTab === "costofwaiting" && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl border border-[#EAE7E0] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 text-[10px] font-bold border border-amber-200">
                <Hourglass className="w-3 h-3 text-amber-700" />
                <span>Opportunity Cost Modeling</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-[#2D362E]">Cost of Waiting Analysis</h3>
              <p className="text-xs text-[#606C5D]">
                Simulate what happens if you delay purchasing for 6 months, 1 year, 2 years, or 3 years due to home price appreciation, dead rent money, and missed equity.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[#606C5D] font-medium block">Est. Annual Appreciation:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1.0"
                    max="8.0"
                    step="0.2"
                    value={appreciationRate}
                    onChange={(e) => setAppreciationRate(Number(e.target.value))}
                    className="w-24 h-1.5 bg-[#EAE7E0] rounded-lg appearance-none cursor-pointer accent-[#4A5D4E]"
                  />
                  <span className="font-bold text-[#2D362E]">{appreciationRate}%/yr</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[#606C5D] font-medium block">Current Monthly Rent:</span>
                <div className="relative">
                  <DollarSign className="w-3.5 h-3.5 text-[#9A9488] absolute left-2.5 top-2" />
                  <input
                    type="number"
                    step="50"
                    value={currentRent}
                    onChange={(e) => setCurrentRent(Number(e.target.value))}
                    className="w-28 bg-[#F9F8F4] border border-[#EAE7E0] rounded-lg pl-6 pr-2 py-1 text-xs text-[#2D362E] font-bold focus:outline-none focus:border-[#4A5D4E]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[#606C5D] font-medium block">Future Interest Rates:</span>
                <div className="flex items-center gap-1 bg-[#F1EFE9] p-1 rounded-lg border border-[#EAE7E0]">
                  <button
                    type="button"
                    onClick={() => setRateShiftScenario("down")}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rateShiftScenario === "down" ? "bg-[#4A5D4E] text-white" : "text-[#606C5D]"
                    }`}
                  >
                    -0.75% Drop
                  </button>
                  <button
                    type="button"
                    onClick={() => setRateShiftScenario("flat")}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rateShiftScenario === "flat" ? "bg-[#4A5D4E] text-white" : "text-[#606C5D]"
                    }`}
                  >
                    Flat
                  </button>
                  <button
                    type="button"
                    onClick={() => setRateShiftScenario("up")}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rateShiftScenario === "up" ? "bg-[#4A5D4E] text-white" : "text-[#606C5D]"
                    }`}
                  >
                    +0.75% Rise
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 4-Period Comparative Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {costOfWaitingData.map((item, idx) => {
              const isOneYear = item.years === 1;
              return (
                <div
                  key={item.label}
                  className={`bg-white rounded-2xl p-5 space-y-3 shadow-sm border transition-all ${
                    isOneYear ? "border-2 border-[#C18C5D] bg-[#FAF9F5]" : "border-[#EAE7E0]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2D362E] uppercase tracking-wider">{item.label} Delay</span>
                    {isOneYear && (
                      <span className="text-[9px] bg-[#C18C5D] text-white font-bold px-2 py-0.5 rounded-full">
                        Key Benchmark
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-[#606C5D] block">Net Financial Opportunity Cost:</span>
                    <span className="text-2xl font-extrabold text-[#A84A4A] block">
                      +{formatUSD(item.totalCostOfWaiting)}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-[#606C5D] pt-3 border-t border-[#EAE7E0]">
                    <div className="flex justify-between">
                      <span>Future Home Price:</span>
                      <strong className="text-[#2D362E]">{formatUSD(item.futurePrice)}</strong>
                    </div>
                    <div className="flex justify-between text-amber-800">
                      <span>Price Appreciation Loss:</span>
                      <strong>+{formatUSD(item.priceIncrease)}</strong>
                    </div>
                    <div className="flex justify-between text-red-700">
                      <span>Rent Paid to Landlord:</span>
                      <strong>+{formatUSD(item.cumulativeRentPaid)}</strong>
                    </div>
                    <div className="flex justify-between text-emerald-800">
                      <span>Foregone Principal Equity:</span>
                      <strong>+{formatUSD(item.missedPrincipalEquity)}</strong>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-[#EAE7E0]">
                      <span>New Monthly Payment:</span>
                      <strong className="text-[#2D362E]">
                        {formatUSD(item.futurePI)}/mo ({item.monthlyPaymentDiff >= 0 ? `+${formatUSD(item.monthlyPaymentDiff)}` : `-${formatUSD(Math.abs(item.monthlyPaymentDiff))}`})
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Strategic Insight Box */}
          <div className="bg-[#FAF9F5] p-6 rounded-2xl border border-[#EAE7E0] space-y-3">
            <h4 className="font-bold text-sm text-[#2D362E] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#4A5D4E]" />
              <span>Why Waiting Rarely Pays Off: The "Marry the House, Date the Rate" Principle</span>
            </h4>
            <p className="text-xs text-[#606C5D] leading-relaxed">
              When interest rates soften in the future, waves of sidelined buyers flood back into the market, driving property bidding wars and higher purchase prices. By purchasing when you find the right home today, you lock in today’s purchase price, immediately begin paying down your own mortgage principal, and can refinance into a lower permanent rate in the future when rates drop!
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Early Payoff Accelerator */}
      {activeTab === "accelerator" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#EAE7E0] p-6 space-y-6 shadow-sm">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C18C5D]">Accelerated Wealth Builder</span>
              <h3 className="text-lg font-serif font-bold text-[#2D362E] mt-0.5">Extra Monthly Principal</h3>
              <p className="text-xs text-[#606C5D]">
                Adding even a small amount directly to your principal each month dramatically slashes your lifetime interest payments.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs text-[#2D362E] font-semibold">
                <span>Extra Monthly Principal Payment</span>
                <span className="text-[#4A5D4E] font-bold text-sm">+{formatUSD(extraPrincipal)}/mo</span>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                step="25"
                value={extraPrincipal}
                onChange={(e) => setExtraPrincipal(Number(e.target.value))}
                className="w-full h-2 bg-[#EAE7E0] rounded-lg appearance-none cursor-pointer accent-[#4A5D4E]"
              />
              <div className="flex justify-between text-[11px] text-[#9A9488]">
                <span>$0</span>
                <span>+$500/mo</span>
                <span>+$1,000/mo</span>
              </div>
            </div>

            {/* Payoff Gains Summary */}
            <div className="bg-[#F1EFE9] p-4 rounded-xl border border-[#EAE7E0] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#606C5D]">Lifetime Interest Saved:</span>
                <span className="text-xl font-bold text-[#4A5D4E]">
                  {formatUSD(amortizationData.interestSaved)}
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-[#EAE7E0] pt-3">
                <span className="text-xs text-[#606C5D]">Time Shaved Off Mortgage:</span>
                <span className="text-sm font-bold text-[#C18C5D]">
                  {amortizationData.yearsSaved} Years Faster
                </span>
              </div>

              <div className="flex items-center justify-between border-t border-[#EAE7E0] pt-3">
                <span className="text-xs text-[#606C5D]">Payoff In:</span>
                <span className="text-xs font-bold text-[#2D362E]">
                  {Math.round(profile.loanTermYears - amortizationData.yearsSaved)} Years (vs {profile.loanTermYears} Yrs)
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Comparison Cards */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Standard Loan */}
              <div className="bg-white rounded-2xl border border-[#EAE7E0] p-5 space-y-3 shadow-sm">
                <span className="text-xs font-bold text-[#9A9488] uppercase tracking-wider">Standard 30-Year Loan</span>
                <div className="text-2xl font-bold text-[#2D362E]">
                  {formatUSD(breakdown.principalAndInterest)}
                  <span className="text-xs font-normal text-[#9A9488]">/mo</span>
                </div>
                <div className="space-y-1 text-xs text-[#606C5D] pt-2 border-t border-[#EAE7E0]">
                  <div className="flex justify-between">
                    <span>Total Loan Interest:</span>
                    <strong className="text-[#2D362E]">{formatUSD(amortizationData.standardTotalInterest)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Cost of Loan:</span>
                    <strong className="text-[#2D362E]">{formatUSD(breakdown.loanAmount + amortizationData.standardTotalInterest)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Full Term:</span>
                    <strong className="text-[#2D362E]">{profile.loanTermYears} Years (360 payments)</strong>
                  </div>
                </div>
              </div>

              {/* Accelerated Loan */}
              <div className="bg-[#4A5D4E]/10 rounded-2xl border border-[#4A5D4E]/30 p-5 space-y-3 shadow-sm">
                <span className="text-xs font-bold text-[#4A5D4E] uppercase tracking-wider">Accelerated Payoff Plan</span>
                <div className="text-2xl font-bold text-[#4A5D4E]">
                  {formatUSD(breakdown.principalAndInterest + extraPrincipal)}
                  <span className="text-xs font-normal text-[#606C5D]">/mo</span>
                </div>
                <div className="space-y-1 text-xs text-[#606C5D] pt-2 border-t border-[#4A5D4E]/20">
                  <div className="flex justify-between">
                    <span>New Total Interest:</span>
                    <strong className="text-[#2D362E]">{formatUSD(amortizationData.acceleratedTotalInterest)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Cost of Loan:</span>
                    <strong className="text-[#4A5D4E]">{formatUSD(breakdown.loanAmount + amortizationData.acceleratedTotalInterest)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>New Full Term:</span>
                    <strong className="text-[#2D362E]">{(profile.loanTermYears - amortizationData.yearsSaved).toFixed(1)} Years</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Pro Tip */}
            <div className="bg-white p-4 rounded-xl border border-[#EAE7E0] text-xs text-[#606C5D] flex items-start gap-2.5 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-[#4A5D4E] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-[#2D362E]">First-Time Buyer Strategy:</strong> You don't have to commit to an extra $150 every month automatically. Most mortgage servicers allow you to make one-time principal payments whenever you receive a tax refund or work bonus!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Amortization Schedule Table */}
      {activeTab === "amortization" && (
        <div className="bg-white rounded-2xl border border-[#EAE7E0] p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-serif font-bold text-[#2D362E]">Year-by-Year Amortization Schedule</h3>
            <span className="text-xs text-[#606C5D]">Initial Loan: {formatUSD(breakdown.loanAmount)} @ {profile.interestRate}%</span>
          </div>

          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F1EFE9] text-[#606C5D] font-semibold sticky top-0">
                <tr>
                  <th className="p-3">Year</th>
                  <th className="p-3">Standard Balance</th>
                  <th className="p-3">Cumulative Interest</th>
                  <th className="p-3">Principal Paid</th>
                  {extraPrincipal > 0 && <th className="p-3 text-[#4A5D4E]">Accelerated Balance (+{formatUSD(extraPrincipal)})</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE7E0] text-[#606C5D]">
                {amortizationData.schedule.map((row) => (
                  <tr key={row.year} className="hover:bg-[#F9F8F4] transition-colors">
                    <td className="p-3 font-bold text-[#2D362E]">Year {row.year}</td>
                    <td className="p-3">{formatUSD(row.balanceStandard)}</td>
                    <td className="p-3 text-[#C18C5D] font-medium">{formatUSD(row.cumulativeInterestStandard)}</td>
                    <td className="p-3 text-[#4A5D4E] font-medium">{formatUSD(row.principalPaidStandard)}</td>
                    {extraPrincipal > 0 && (
                      <td className="p-3 font-bold text-[#4A5D4E]">
                        {row.balanceAccelerated === 0 ? "PAID OFF 🎉" : formatUSD(row.balanceAccelerated)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Itemized Closing Costs */}
      {activeTab === "closingcosts" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 bg-white rounded-2xl border border-[#EAE7E0] p-6 space-y-5 shadow-sm">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C18C5D]">Out-of-Pocket Breakdown</span>
              <h3 className="text-lg font-serif font-bold text-[#2D362E] mt-0.5">Estimated Closing Costs</h3>
              <p className="text-xs text-[#606C5D]">
                In addition to your down payment, budget approximately 2% to 4% of your loan amount for mandatory closing fees and escrow reserves.
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between p-3 rounded-xl bg-[#F1EFE9] border border-[#EAE7E0]">
                <span className="text-[#606C5D] font-medium">Lender Origination & Processing</span>
                <span className="font-bold text-[#2D362E]">{formatUSD(closingCosts.originationFee)}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-[#F1EFE9] border border-[#EAE7E0]">
                <span className="text-[#606C5D] font-medium">Independent Home Appraisal</span>
                <span className="font-bold text-[#2D362E]">{formatUSD(closingCosts.appraisalFee)}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-[#F1EFE9] border border-[#EAE7E0]">
                <span className="text-[#606C5D] font-medium">Physical Home Inspection</span>
                <span className="font-bold text-[#2D362E]">{formatUSD(closingCosts.homeInspection)}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-[#F1EFE9] border border-[#EAE7E0]">
                <span className="text-[#606C5D] font-medium">Title Insurance & Search (Lender + Owner)</span>
                <span className="font-bold text-[#2D362E]">{formatUSD(closingCosts.titleInsuranceAndSearch)}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-[#F1EFE9] border border-[#EAE7E0]">
                <span className="text-[#606C5D] font-medium">Government Recording & Transfer Taxes</span>
                <span className="font-bold text-[#2D362E]">{formatUSD(closingCosts.recordingAndTransferTaxes)}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-[#F1EFE9] border border-[#EAE7E0]">
                <span className="text-[#606C5D] font-medium">Prepaid Escrow Reserves (4 mo Tax + 14 mo Ins)</span>
                <span className="font-bold text-[#2D362E]">{formatUSD(closingCosts.prepaidEscrowsAndInsurance)}</span>
              </div>
              <div className="flex justify-between p-3 rounded-xl bg-[#F1EFE9] border border-[#EAE7E0]">
                <span className="text-[#606C5D] font-medium">Underwriting & Doc Prep</span>
                <span className="font-bold text-[#2D362E]">{formatUSD(closingCosts.lenderUnderwritingDocFee)}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-2xl border border-[#EAE7E0] p-6 space-y-4 shadow-sm">
              <span className="text-xs uppercase tracking-wider text-[#9A9488] font-bold">Total Cash Needed on Closing Day</span>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-[#606C5D]">
                  <span>Down Payment ({breakdown.downPaymentPercent}%):</span>
                  <span className="font-bold text-[#2D362E]">{formatUSD(profile.downPaymentSavings)}</span>
                </div>
                <div className="flex justify-between text-xs text-[#606C5D]">
                  <span>Estimated Closing Costs:</span>
                  <span className="font-bold text-[#2D362E]">{formatUSD(closingCosts.totalEstimatedClosingCosts)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#4A5D4E] pt-3 border-t border-[#EAE7E0]">
                  <span>True Cash-to-Close:</span>
                  <span>{formatUSD(profile.downPaymentSavings + closingCosts.totalEstimatedClosingCosts)}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#F1EFE9] p-5 rounded-2xl border border-[#EAE7E0] space-y-2 text-xs text-[#606C5D]">
              <h4 className="font-bold text-[#2D362E] text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#C18C5D]" />
                How to Reduce Closing Costs:
              </h4>
              <ul className="space-y-1.5 list-disc pl-4 text-[#606C5D] marker:text-[#4A5D4E]">
                <li>Ask for <strong className="text-[#2D362E]">Seller Concessions</strong> (e.g. 2% to 3% credit paid by seller at closing).</li>
                <li>Apply for <strong className="text-[#2D362E]">Down Payment Assistance (DPA)</strong> closing assistance.</li>
                <li>Compare <strong className="text-[#2D362E]">Title Company rates</strong> (buyers have the legal right to shop title services).</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Rent vs Buy 10-Year Equity Model */}
      {activeTab === "rentvsbuy" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#EAE7E0] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <h3 className="text-lg font-serif font-bold text-[#2D362E]">10-Year Net Wealth Projection: Renting vs Buying</h3>
              <p className="text-xs text-[#606C5D]">Based on 3.0% annual home appreciation and 2.0% annual rent inflation.</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#606C5D] font-semibold">Your Current Rent:</span>
              <div className="relative">
                <DollarSign className="w-3.5 h-3.5 text-[#9A9488] absolute left-2.5 top-2.5" />
                <input
                  type="number"
                  step="50"
                  value={currentRent}
                  onChange={(e) => setCurrentRent(Number(e.target.value))}
                  className="w-32 bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl pl-7 pr-3 py-1.5 text-xs text-[#2D362E] font-bold focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#EAE7E0] space-y-1 text-center shadow-sm">
              <span className="text-xs text-[#606C5D] block font-medium">Home Value at Year 10</span>
              <span className="text-2xl font-bold text-[#4A5D4E]">
                {formatUSD(rentVsBuyTimeline[9]?.homeValue || 0)}
              </span>
              <span className="text-[11px] text-[#9A9488] block">+3.0% compound annual growth</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#EAE7E0] space-y-1 text-center shadow-sm">
              <span className="text-xs text-[#606C5D] block font-medium">Home Equity Built (Year 10)</span>
              <span className="text-2xl font-bold text-[#C18C5D]">
                {formatUSD(rentVsBuyTimeline[9]?.homeEquity || 0)}
              </span>
              <span className="text-[11px] text-[#9A9488] block">Principal paid down + appreciation</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#EAE7E0] space-y-1 text-center shadow-sm">
              <span className="text-xs text-[#606C5D] block font-medium">Total Rent Paid Out over 10 Yrs</span>
              <span className="text-2xl font-bold text-[#A84A4A]">
                {formatUSD(rentVsBuyTimeline[9]?.totalRentPaid || 0)}
              </span>
              <span className="text-[11px] text-[#9A9488] block">100% unrecoverable housing cost</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "agent" && (
        <div className="space-y-6">
          <GeminiAgentPanel />
        </div>
      )}

      {/* Scenario Outreach Modal for Draft Review / Dispatch (Loan Officer Portal only) */}
      {isLoanOfficerMode && selectedLead && activeOutreachScenario && (
        <ScenarioOutreachModal
          isOpen={!!activeOutreachScenario}
          onClose={() => setActiveOutreachScenario(null)}
          lead={selectedLead}
          scenario={activeOutreachScenario}
          loanOfficer={loanOfficer}
          agent={activeAgent}
          onOpenEmailOutreach={onOpenEmailOutreach}
          onOpenSmsOutreach={onOpenSmsOutreach}
        />
      )}
    </div>
  );
};
