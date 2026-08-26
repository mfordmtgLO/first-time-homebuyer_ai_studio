import React, { useState } from "react";
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ShieldCheck, 
  DollarSign, 
  TrendingUp, 
  Compass, 
  RotateCcw,
  Building,
  Target,
  FileCheck,
  Calendar,
  MessageSquare
} from "lucide-react";
import { FinancialProfile, LoanOfficerProfile, RealEstateAgentProfile, PropertyListing } from "../types";
import { calculateMortgageBreakdown, formatUSD, getDTIStatus } from "../utils/mortgageMath";
import { LocalProfessionalGuides } from "./LocalProfessionalGuides";

interface Step4AIScenarioSummaryProps {
  profile: FinancialProfile;
  properties: PropertyListing[];
  loanOfficer: LoanOfficerProfile;
  activeAgent: RealEstateAgentProfile;
  onNavigate: (tab: string, mode: "website" | "dashboard") => void;
  onOpenLoPortal?: () => void;
}

export const Step4AIScenarioSummary: React.FC<Step4AIScenarioSummaryProps> = ({
  profile,
  properties,
  loanOfficer,
  activeAgent,
  onNavigate,
  onOpenLoPortal,
}) => {
  const breakdown = calculateMortgageBreakdown(profile);
  const targetMaxPayment = profile.targetMaxMonthlyPayment || 3200;
  const currentMonthly = breakdown.totalMonthly;
  const paymentDiff = targetMaxPayment - currentMonthly;
  
  // Calculate recommended loan program & IPC limit
  const downPaymentPercent = (profile.downPaymentSavings / profile.targetPrice) * 100;
  let recommendedProgram = "Conventional 97 (3% Down)";
  let maxIpcPercent = 3;
  const dtiStatus = getDTIStatus(breakdown.backEndDTI);

  if (downPaymentPercent >= 20) {
    recommendedProgram = "Conventional 20% (No PMI)";
    maxIpcPercent = 9;
  } else if (downPaymentPercent >= 10) {
    recommendedProgram = "Conventional Standard (10% Down)";
    maxIpcPercent = 6;
  } else if (profile.creditScore < 680) {
    recommendedProgram = "FHA 3.5% (Flexible Credit)";
    maxIpcPercent = 6;
  }

  const maxIpcDollar = (profile.targetPrice * maxIpcPercent) / 100;
  const estimatedClosingCosts = Math.round(profile.targetPrice * 0.025);
  const totalCashNeeded = Math.round((profile.targetPrice * (downPaymentPercent / 100)) + estimatedClosingCosts);
  const cashSurplusOrShortage = profile.downPaymentSavings - totalCashNeeded;

  return (
    <div className="space-y-10 pb-16 text-[#2D362E]">
      {/* Top Breadcrumb & Step Header */}
      <div className="bg-white rounded-3xl border border-[#EAE7E0] p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE7E0] pb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#4A5D4E] text-white text-xs font-bold uppercase tracking-wider">
              Step 4 of 4
            </span>
            <span className="text-xs text-[#606C5D] font-medium">
              AI Scenario Plan & Local Professional Alignment
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate("dashboard", "dashboard")}
              className="text-xs font-semibold text-[#606C5D] hover:text-[#4A5D4E] px-3 py-1.5 rounded-lg border border-[#EAE7E0] hover:bg-[#F9F8F4] transition-colors"
            >
              ← Back to Step 3 (Dashboard)
            </button>
            <button
              onClick={() => onNavigate("hero", "website")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4A5D4E] bg-[#F1EFE9] hover:bg-[#EAE7E0] px-3 py-1.5 rounded-lg border border-[#EAE7E0] transition-colors"
            >
              <RotateCcw className="w-3 h-3 text-[#C18C5D]" />
              <span>Return to Start / Home</span>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#2D362E]">
            AI Findings & Next Logical Step in Your Roadmap
          </h2>
          <p className="text-sm sm:text-base text-[#606C5D] max-w-3xl leading-relaxed">
            Here is the concise breakdown of your custom financial inputs and property scenario. To transition from digital simulations to verified purchasing power, the next milestone in your roadmap is connecting with your dedicated <strong className="text-[#2D362E]">Local Professional Guides</strong>.
          </p>
        </div>
      </div>

      {/* Grid: 1. Concise Scenario Audit + 2. Key AI Findings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 6 cols: Scenario Entered Audit */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-[#EAE7E0] p-6 sm:p-8 space-y-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#C18C5D]" />
                <h3 className="font-serif font-bold text-lg text-[#2D362E]">Your Scenario Entered</h3>
              </div>
              <button
                onClick={() => onNavigate("calculator", "website")}
                className="text-xs font-semibold text-[#4A5D4E] hover:underline"
              >
                Edit in Step 1 ↗
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-[#F9F8F4] p-3 rounded-xl border border-[#EAE7E0]">
                <span className="text-[#9A9488] block text-[11px]">Annual Income</span>
                <span className="font-bold text-[#2D362E] text-sm">{formatUSD(profile.annualIncome)}</span>
              </div>
              <div className="bg-[#F9F8F4] p-3 rounded-xl border border-[#EAE7E0]">
                <span className="text-[#9A9488] block text-[11px]">Monthly Debt</span>
                <span className="font-bold text-[#C18C5D] text-sm">{formatUSD(profile.monthlyDebt)}/mo</span>
              </div>
              <div className="bg-[#F9F8F4] p-3 rounded-xl border border-[#EAE7E0]">
                <span className="text-[#9A9488] block text-[11px]">Cash Savings</span>
                <span className="font-bold text-[#4A5D4E] text-sm">{formatUSD(profile.downPaymentSavings)}</span>
              </div>
              <div className="bg-[#F9F8F4] p-3 rounded-xl border border-[#EAE7E0]">
                <span className="text-[#9A9488] block text-[11px]">Target Home Price</span>
                <span className="font-bold text-[#2D362E] text-sm">{formatUSD(profile.targetPrice)}</span>
              </div>
              <div className="bg-[#F9F8F4] p-3 rounded-xl border border-[#EAE7E0]">
                <span className="text-[#9A9488] block text-[11px]">Interest Rate</span>
                <span className="font-bold text-[#2D362E] text-sm">{profile.interestRate}% (30-Yr)</span>
              </div>
              <div className="bg-[#F9F8F4] p-3 rounded-xl border border-[#EAE7E0]">
                <span className="text-[#9A9488] block text-[11px]">Max Payment Goal</span>
                <span className="font-bold text-[#4A5D4E] text-sm">{formatUSD(targetMaxPayment)}/mo</span>
              </div>
            </div>

            {/* Monthly Payment vs Target Comparison Box */}
            <div className="bg-[#F1EFE9] rounded-2xl p-4 border border-[#EAE7E0] space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[#606C5D]">Calculated Total Monthly Payment:</span>
                <span className="text-base font-bold text-[#2D362E]">{formatUSD(breakdown.totalMonthly)}/mo</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-[#EAE7E0]">
                <span className="text-[#606C5D]">Self-Restricted Monthly Payment Goal:</span>
                <span className="font-bold text-[#4A5D4E]">{formatUSD(targetMaxPayment)}/mo</span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[#606C5D]">Budget Status:</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                  paymentDiff >= 500 
                    ? "bg-emerald-100 text-emerald-800" 
                    : paymentDiff >= 0 
                    ? "bg-amber-100 text-amber-800" 
                    : "bg-red-100 text-red-700"
                }`}>
                  {paymentDiff >= 0 
                    ? `${formatUSD(paymentDiff)}/mo Comfortably Under Goal` 
                    : `${formatUSD(Math.abs(paymentDiff))}/mo Exceeds Personal Goal`}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 text-xs text-[#9A9488] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span>Back-End DTI Ratio:</span>
              {dtiStatus.isIneligible ? (
                <span className="text-black font-bold line-through decoration-red-600 decoration-2">
                  {breakdown.backEndDTI}% (most loan programs ineligible over 50% DTI)
                </span>
              ) : dtiStatus.isHigh ? (
                <strong className="text-red-600 font-bold">{breakdown.backEndDTI}% (High)</strong>
              ) : (
                <strong className={dtiStatus.colorClass}>{breakdown.backEndDTI}% ({dtiStatus.label})</strong>
              )}
            </span>
            <span>Est. Loan: <strong>{formatUSD(breakdown.loanAmount)}</strong></span>
          </div>
        </div>

        {/* Right 6 cols: AI Key Findings & Strategic Concessions */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-[#EAE7E0] p-6 sm:p-8 space-y-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D4A373]" />
                <h3 className="font-serif font-bold text-lg text-[#2D362E]">AI Strategic Findings</h3>
              </div>
              <span className="text-xs bg-[#F1EFE9] text-[#4A5D4E] font-semibold px-2.5 py-0.5 rounded-full border border-[#EAE7E0]">
                Verified Mortgage Rules
              </span>
            </div>

            <div className="space-y-3">
              {/* Finding 1: Loan Program Fit */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F9F8F4] border border-[#EAE7E0]">
                <CheckCircle2 className="w-4 h-4 text-[#4A5D4E] shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-xs">
                  <span className="font-bold text-[#2D362E]">Recommended Loan Structure: {recommendedProgram}</span>
                  <p className="text-[#606C5D]">
                    At {downPaymentPercent.toFixed(1)}% down payment on {formatUSD(profile.targetPrice)}, this gives you the optimal balance of lower upfront cash with manageable monthly PMI.
                  </p>
                </div>
              </div>

              {/* Finding 2: Seller Concession IPC Cap */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F9F8F4] border border-[#EAE7E0]">
                <DollarSign className="w-4 h-4 text-[#C18C5D] shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-xs">
                  <span className="font-bold text-[#2D362E]">
                    Max Seller Concession (IPC) Cap: {maxIpcPercent}% ({formatUSD(maxIpcDollar)})
                  </span>
                  <p className="text-[#606C5D]">
                    Under official lending rules, you can ask the seller for up to <strong>{formatUSD(maxIpcDollar)}</strong> in closing credits to cover lender fees, title insurance, or fund a 2/1 temporary interest rate buydown.
                  </p>
                </div>
              </div>

              {/* Finding 3: Cash to Close Buffer */}
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F9F8F4] border border-[#EAE7E0]">
                <FileCheck className="w-4 h-4 text-[#4A5D4E] shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-xs">
                  <span className="font-bold text-[#2D362E]">Cash-to-Close & Reserve Readiness</span>
                  <p className="text-[#606C5D]">
                    Estimated closing costs add ~{formatUSD(estimatedClosingCosts)} (2.5%). Your current savings of {formatUSD(profile.downPaymentSavings)} leaves a {cashSurplusOrShortage >= 0 ? `healthy surplus buffer of ${formatUSD(cashSurplusOrShortage)}` : `minor gap of ${formatUSD(Math.abs(cashSurplusOrShortage))}`}.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#F1EFE9] rounded-xl text-[11px] text-[#606C5D] flex items-center justify-between">
            <span>Saved properties in your pipeline: <strong>{properties.length} homes</strong></span>
            <button 
              onClick={() => onNavigate("properties", "dashboard")}
              className="text-[#4A5D4E] font-bold hover:underline"
            >
              View Saved Pipeline →
            </button>
          </div>
        </div>
      </div>

      {/* Next Logical Step in Roadmap to Homeownership Banner */}
      <div className="bg-[#2D362E] text-white rounded-3xl p-6 sm:p-10 space-y-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#4A5D4E]/30 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-[#D4A373] text-xs font-bold border border-white/15">
            <Compass className="w-3.5 h-3.5" />
            <span>Next Logical Step in Your Roadmap to Homeownership</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-snug">
            Milestone 2: Secure Your Verified Pre-Approval with Your Local Professional Guides
          </h3>

          <p className="text-xs sm:text-sm text-[#DEDAD2] leading-relaxed">
            You've completed Step 1 (Calculated Buying Power), Step 2 (Explored DPA & Roadmap), and Step 3 (Built Your Command Center).
            Online estimates only take you so far. The essential next step is having <strong className="text-white">{loanOfficer.name}</strong> issue a fully underwritten pre-approval letter and synchronizing with <strong className="text-white">{activeAgent.name}</strong> to view off-market and on-market homes within your exact comfort zone.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href={loanOfficer.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white font-semibold text-xs transition-all shadow-md hover:scale-[1.02]"
            >
              <Calendar className="w-4 h-4 text-[#D4A373]" />
              <span>Book Pre-Approval Call with {loanOfficer.name}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={() => {
                const element = document.getElementById("local-professional-guides-section");
                if (element) {
                  element.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-[#D4A373]" />
              <span>Meet & Contact Your Guides Below</span>
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Public Local Professional Guides Component */}
      <LocalProfessionalGuides
        loanOfficer={loanOfficer}
        activeAgent={activeAgent}
        onOpenLoPortal={onOpenLoPortal}
        title="Your Local Professional Guides"
        subtitle="Your assigned financing and real estate duo, ready to convert this digital plan into your first home purchase."
      />

      {/* Final Step 4 Completion Navigation Bar */}
      <div className="bg-white rounded-3xl border border-[#EAE7E0] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#4A5D4E]/15 text-[#4A5D4E] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-base text-[#2D362E]">
              Homebuyer Journey Blueprint Complete
            </h4>
            <p className="text-xs text-[#606C5D]">
              Steps 1 through 4 explored. You can revisit any step or return to your live command center anytime.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate("dashboard", "dashboard")}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#EAE7E0] hover:bg-[#F9F8F4] text-xs font-semibold text-[#2D362E] transition-colors cursor-pointer"
          >
            <span>← Back to Step 3 (Dashboard)</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate("hero", "website")}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#D4A373]" />
            <span>Return to Start / Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};
