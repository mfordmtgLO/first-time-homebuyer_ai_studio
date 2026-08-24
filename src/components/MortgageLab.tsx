import React, { useState } from "react";
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
  CheckCircle2 
} from "lucide-react";
import { FinancialProfile } from "../types";
import { 
  calculateMortgageBreakdown, 
  calculateAmortizationCurve, 
  calculateClosingCosts, 
  calculateRentVsBuy, 
  formatUSD 
} from "../utils/mortgageMath";

interface MortgageLabProps {
  profile: FinancialProfile;
}

export const MortgageLab: React.FC<MortgageLabProps> = ({ profile }) => {
  const [activeTab, setActiveTab] = useState<"amortization" | "accelerator" | "rentvsbuy" | "closingcosts">("accelerator");
  const [extraPrincipal, setExtraPrincipal] = useState<number>(150);
  const [currentRent, setCurrentRent] = useState<number>(2100);

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
    3.5,
    2.8,
    profile.interestRate
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#EAE7E0] p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1EFE9] text-[#4A5D4E] text-xs font-semibold border border-[#EAE7E0]">
              <TrendingUp className="w-3.5 h-3.5 text-[#C18C5D]" />
              <span>Financial Modeling & Strategy Lab</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D362E]">
              Mortgage Math, Amortization & True Costs
            </h2>
            <p className="text-xs sm:text-sm text-[#606C5D]">
              Simulate early loan payoff acceleration, true itemized closing costs, and 10-year net equity growth.
            </p>
          </div>
        </div>

        {/* Lab Navigation Tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-[#EAE7E0]">
          {[
            { id: "accelerator", label: "Early Payoff Accelerator", icon: Sparkles },
            { id: "amortization", label: "Amortization Curve", icon: Layers },
            { id: "closingcosts", label: "Itemized Closing Costs", icon: FileText },
            { id: "rentvsbuy", label: "Rent vs Buy (10-Yr Equity)", icon: TrendingUp },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#4A5D4E] text-white shadow-sm font-bold"
                    : "bg-white text-[#606C5D] hover:text-[#2D362E] border border-[#EAE7E0]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Early Payoff Accelerator */}
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

      {/* Tab 2: Amortization Schedule Table */}
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

      {/* Tab 3: Itemized Closing Costs */}
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
                <li>Ask for <strong className="text-[#2D362E]">Seller Concessions</strong> (e.g. 2% credit paid by seller at closing).</li>
                <li>Apply for local <strong className="text-[#2D362E]">Down Payment Assistance (DPA)</strong> closing grants.</li>
                <li>Compare <strong className="text-[#2D362E]">Title Company rates</strong> (buyers have the legal right to shop title services).</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Rent vs Buy 10-Year Equity Model */}
      {activeTab === "rentvsbuy" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#EAE7E0] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <h3 className="text-lg font-serif font-bold text-[#2D362E]">10-Year Net Wealth Projection: Renting vs Buying</h3>
              <p className="text-xs text-[#606C5D]">Based on 3.5% annual home appreciation and 2.8% annual rent inflation.</p>
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
              <span className="text-[11px] text-[#9A9488] block">+3.5% compound annual growth</span>
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
    </div>
  );
};
