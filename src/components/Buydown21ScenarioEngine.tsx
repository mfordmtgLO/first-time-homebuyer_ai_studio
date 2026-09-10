import React, { useState } from "react";
import { 
  Percent, 
  Sparkles, 
  ArrowRight, 
  DollarSign, 
  TrendingDown, 
  ShieldCheck, 
  Copy, 
  Check, 
  Printer, 
  Send, 
  Share2, 
  CheckCircle2, 
  AlertCircle, 
  Building, 
  UserCheck, 
  Calculator,
  Flame,
  FileText
} from "lucide-react";
import { CapturedLead, LoanOfficerProfile, FinancialProfile } from "../types";
import { calculateMonthlyPI, formatUSD } from "../utils/mortgageMath";
import { ContextualVideoPlayer } from "./ContextualVideoPlayer";

interface Buydown21ScenarioEngineProps {
  currentLo?: LoanOfficerProfile;
  leads?: CapturedLead[];
  activeLeadId?: string;
  initialProfile?: FinancialProfile;
  onSaveScenarioToLead?: (leadId: string, scenarioData: any) => void;
  onTriggerToast?: (msg: string) => void;
}

export const Buydown21ScenarioEngine: React.FC<Buydown21ScenarioEngineProps> = ({
  currentLo,
  leads = [],
  activeLeadId,
  initialProfile,
  onSaveScenarioToLead,
  onTriggerToast
}) => {
  const [selectedLeadId, setSelectedLeadId] = useState<string>(activeLeadId || (leads[0]?.id || ""));
  const activeLead = leads.find(l => l.id === selectedLeadId);

  // Scenario Parameters
  const [purchasePrice, setPurchasePrice] = useState<number>(initialProfile?.targetPrice || 450000);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(
    initialProfile?.targetPrice && initialProfile?.downPaymentSavings
      ? Math.max(3, Math.round((initialProfile.downPaymentSavings / initialProfile.targetPrice) * 100))
      : 5
  );
  const [noteRate, setNoteRate] = useState<number>(6.625);
  const [loanTermYears, setLoanTermYears] = useState<number>(30);
  const [propertyTaxRate, setPropertyTaxRate] = useState<number>(1.15); // %/yr
  const [annualInsurance, setAnnualInsurance] = useState<number>(1400); // $/yr
  const [monthlyHoa, setMonthlyHoa] = useState<number>(0);
  const [pmiRate, setPmiRate] = useState<number>(0.55); // %/yr if < 20% down

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Core Math Calculations
  const downPaymentAmount = Math.round((purchasePrice * downPaymentPercent) / 100);
  const loanAmount = purchasePrice - downPaymentAmount;

  // Monthly Escrows
  const monthlyPropertyTax = Math.round((purchasePrice * (propertyTaxRate / 100)) / 12);
  const monthlyHomeInsurance = Math.round(annualInsurance / 12);
  const monthlyPmi = downPaymentPercent < 20 ? Math.round((loanAmount * (pmiRate / 100)) / 12) : 0;
  const fixedMonthlyEscrow = monthlyPropertyTax + monthlyHomeInsurance + monthlyHoa + monthlyPmi;

  // 1. Permanent Note Rate (Year 3 - 30)
  const yr3Pi = calculateMonthlyPI(loanAmount, noteRate, loanTermYears);
  const yr3Total = yr3Pi + fixedMonthlyEscrow;

  // 2. Year 1 (Note Rate - 2.00%)
  const yr1Rate = Math.max(0.5, noteRate - 2.0);
  const yr1Pi = calculateMonthlyPI(loanAmount, yr1Rate, loanTermYears);
  const yr1Total = yr1Pi + fixedMonthlyEscrow;
  const yr1MonthlySavings = yr3Pi - yr1Pi;
  const yr1AnnualSavings = yr1MonthlySavings * 12;

  // 3. Year 2 (Note Rate - 1.00%)
  const yr2Rate = Math.max(0.5, noteRate - 1.0);
  const yr2Pi = calculateMonthlyPI(loanAmount, yr2Rate, loanTermYears);
  const yr2Total = yr2Pi + fixedMonthlyEscrow;
  const yr2MonthlySavings = yr3Pi - yr2Pi;
  const yr2AnnualSavings = yr2MonthlySavings * 12;

  // Total Seller Credit / Escrow Subsidy Needed
  const totalBuydownSubsidy = yr1AnnualSavings + yr2AnnualSavings;
  const buydownPercentOfPrice = purchasePrice > 0 ? (totalBuydownSubsidy / purchasePrice) * 100 : 0;

  // Comparison: What if the seller gave the exact same $ amount as a PRICE REDUCTION instead?
  const priceReductionAmount = totalBuydownSubsidy;
  const reducedPurchasePrice = purchasePrice - priceReductionAmount;
  const reducedLoanAmount = reducedPurchasePrice * (1 - downPaymentPercent / 100);
  const reducedPricePi = calculateMonthlyPI(reducedLoanAmount, noteRate, loanTermYears);
  const reducedPriceMonthlyTax = Math.round((reducedPurchasePrice * (propertyTaxRate / 100)) / 12);
  const reducedPricePmi = downPaymentPercent < 20 ? Math.round((reducedLoanAmount * (pmiRate / 100)) / 12) : 0;
  const reducedPriceTotal = reducedPricePi + reducedPriceMonthlyTax + monthlyHomeInsurance + monthlyHoa + reducedPricePmi;
  const priceReductionMonthlySavings = yr3Total - reducedPriceTotal;

  const buydownCashflowMultiplier = priceReductionMonthlySavings > 0 
    ? (yr1MonthlySavings / priceReductionMonthlySavings).toFixed(1) 
    : "9.5";

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    if (onTriggerToast) onTriggerToast("✓ Copied script to clipboard!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveToLead = () => {
    if (!selectedLeadId) {
      if (onTriggerToast) onTriggerToast("⚠️ Select a lead to save this scenario.");
      return;
    }
    const scenarioPayload = {
      purchasePrice,
      downPaymentPercent,
      noteRate,
      yr1Rate,
      yr2Rate,
      yr1MonthlySavings,
      totalBuydownSubsidy,
      year1MonthlyTotal: yr1Total,
      permanentMonthlyTotal: yr3Total
    };
    if (onSaveScenarioToLead) {
      onSaveScenarioToLead(selectedLeadId, scenarioPayload);
    }
    if (onTriggerToast) {
      onTriggerToast(`✓ Saved 2-1 Buydown Scenario (Saves ${formatUSD(yr1MonthlySavings)}/mo) to ${activeLead?.fullName || "lead"}!`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const clientSharePitch = `Hi ${activeLead?.fullName?.split(" ")[0] || "there"}!

Here is the custom 2-1 Rate Buydown strategy we modeled for you on a ${formatUSD(purchasePrice)} home:

💰 MONTHLY PAYMENT BREAKDOWN:
• Year 1 (${yr1Rate.toFixed(2)}% Rate): ${formatUSD(yr1Total)}/mo (Saves ${formatUSD(yr1MonthlySavings)}/mo!)
• Year 2 (${yr2Rate.toFixed(2)}% Rate): ${formatUSD(yr2Total)}/mo (Saves ${formatUSD(yr2MonthlySavings)}/mo)
• Years 3-30 (${noteRate.toFixed(2)}% Note Rate): ${formatUSD(yr3Total)}/mo

💡 WHY THIS WINS:
The seller covers the ${formatUSD(totalBuydownSubsidy)} subsidy at closing. This gives you ${formatUSD(yr1AnnualSavings + yr2AnnualSavings)} in total cash-flow relief during your first 2 years, saving you ${buydownCashflowMultiplier}x more money every month than an equivalent price drop!

Let's review this with your Realtor before writing your next offer!
${currentLo?.name || "Mike Ford"} | ${currentLo?.company || "Mortgage Advisory Group"}`;

  return (
    <div className="space-y-6">
      {/* Contextual Video Embed for Buydown Strategy */}
      <div className="w-full">
        <ContextualVideoPlayer 
          videoId="sXQxhojSdZM" 
          title="How a 2-1 Buydown Saves You $500+/mo | Mike Ford" 
          description="Watch Mike explain exactly how seller-paid buydowns work and why they are the ultimate hack in today's market."
          className="shadow-sm"
        />
      </div>
      
      {/* Header Banner */}
      <div className="bg-[#2D362E] rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-emerald-500/15 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#E7C19D] border border-white/15 text-xs font-bold uppercase tracking-wider">
              <Percent className="w-3.5 h-3.5 text-[#E7C19D]" />
              <span>Seller Concession & Cash-Flow Architecture</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
              2-1 Temporary Interest Rate Buydown Engine
            </h2>
            <p className="text-sm text-[#D8D2C2] max-w-2xl leading-relaxed">
              Structure seller-funded temporary rate buydowns that reduce Year 1 interest rates by 2.0% and Year 2 by 1.0%, delivering up to 9x greater monthly cash-flow relief than a purchase price cut.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white flex items-center gap-2 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Save PDF</span>
            </button>

            <button
              type="button"
              onClick={() => copyToClipboard(clientSharePitch, "client_pitch")}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              {copiedKey === "client_pitch" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Client Script</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sync to Active Lead Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EAE7E0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4A5D4E]/10 text-[#4A5D4E] flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#9A9488] block">
              Borrower File Sync
            </span>
            <select
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              className="text-xs font-bold bg-[#F9F8F4] border border-[#EAE7E0] rounded-lg px-2.5 py-1.5 text-[#2D362E]"
            >
              <option value="">-- Select Active Borrower --</option>
              {leads.map(l => (
                <option key={l.id} value={l.id}>
                  {l.fullName} (Target: {l.targetPriceRange || "$450k"})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-[#9A9488] uppercase block">Year 1 Monthly Savings</span>
            <span className="text-lg font-mono font-extrabold text-[#2F5738]">
              {formatUSD(yr1MonthlySavings)}/mo
            </span>
          </div>

          <button
            type="button"
            onClick={handleSaveToLead}
            disabled={!selectedLeadId}
            className="px-4 py-2.5 rounded-xl bg-[#4A5D4E] hover:bg-[#3d4d40] text-xs font-bold text-white flex items-center gap-1.5 disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>Save Scenario to Lead</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Matrix (Left Inputs & Controls + Right 3-Tier Amortization Matrix) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Loan & Concession Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-[#EAE7E0] shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#2D362E] flex items-center gap-2">
              <Calculator className="w-4 h-4 text-[#4A5D4E]" />
              <span>Loan Parameters & Concession Inputs</span>
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-[#2D362E] mb-1">
                  <span>Purchase Price:</span>
                  <span className="font-mono font-bold text-[#4A5D4E]">{formatUSD(purchasePrice)}</span>
                </div>
                <input
                  type="range"
                  min={200000}
                  max={1200000}
                  step={5000}
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(Number(e.target.value))}
                  className="w-full accent-[#4A5D4E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[#606C5D] font-medium block mb-1">Down Payment (%):</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={3}
                      max={50}
                      value={downPaymentPercent}
                      onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                      className="w-full font-mono font-bold bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs"
                    />
                    <span className="font-bold text-[#606C5D]">%</span>
                  </div>
                  <span className="text-[10px] text-[#9A9488] block mt-0.5 font-mono">
                    {formatUSD(downPaymentAmount)} down
                  </span>
                </div>

                <div>
                  <span className="text-[#606C5D] font-medium block mb-1">Permanent Note Rate:</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step={0.125}
                      min={4}
                      max={10}
                      value={noteRate}
                      onChange={(e) => setNoteRate(Number(e.target.value))}
                      className="w-full font-mono font-bold bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs"
                    />
                    <span className="font-bold text-[#606C5D]">%</span>
                  </div>
                  <span className="text-[10px] text-[#9A9488] block mt-0.5 font-mono">
                    30-Year Fixed Note
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#EAE7E0]">
                <div>
                  <span className="text-[11px] text-[#606C5D] block mb-1">Property Tax:</span>
                  <input
                    type="number"
                    step={0.05}
                    value={propertyTaxRate}
                    onChange={(e) => setPropertyTaxRate(Number(e.target.value))}
                    className="w-full text-right font-mono bg-[#F9F8F4] border border-[#EAE7E0] rounded-lg px-2 py-1 text-xs"
                  />
                  <span className="text-[10px] text-[#9A9488] block mt-0.5">{propertyTaxRate}%/yr</span>
                </div>

                <div>
                  <span className="text-[11px] text-[#606C5D] block mb-1">Insurance ($/yr):</span>
                  <input
                    type="number"
                    step={50}
                    value={annualInsurance}
                    onChange={(e) => setAnnualInsurance(Number(e.target.value))}
                    className="w-full text-right font-mono bg-[#F9F8F4] border border-[#EAE7E0] rounded-lg px-2 py-1 text-xs"
                  />
                  <span className="text-[10px] text-[#9A9488] block mt-0.5">{formatUSD(monthlyHomeInsurance)}/mo</span>
                </div>

                <div>
                  <span className="text-[11px] text-[#606C5D] block mb-1">Monthly HOA:</span>
                  <input
                    type="number"
                    step={25}
                    value={monthlyHoa}
                    onChange={(e) => setMonthlyHoa(Number(e.target.value))}
                    className="w-full text-right font-mono bg-[#F9F8F4] border border-[#EAE7E0] rounded-lg px-2 py-1 text-xs"
                  />
                  <span className="text-[10px] text-[#9A9488] block mt-0.5">${monthlyHoa}/mo</span>
                </div>
              </div>
            </div>

            {/* Escrow Subsidy Requirement Card */}
            <div className="bg-[#F9F8F4] rounded-2xl p-4 border border-[#EAE7E0] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2D362E]">Required Seller Concession</span>
                <span className="text-xs font-bold font-mono text-[#2F5738] bg-emerald-100/80 px-2 py-0.5 rounded-md">
                  {buydownPercentOfPrice.toFixed(2)}% of Price
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold font-mono text-[#2D362E]">
                  {formatUSD(totalBuydownSubsidy)}
                </span>
                <span className="text-[11px] text-[#606C5D]">Total 24-Mo Escrow Deposit</span>
              </div>
              <div className="text-[11px] text-[#606C5D] border-t border-[#EAE7E0] pt-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  Within Conventional 3% & FHA 6% IPC Regulatory Caps.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 3-Tier Amortization Matrix & Price Drop Battlecard (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* 3-Tier Amortization Visual Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#EAE7E0] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#2D362E] flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>3-Year Step-Up Payment Schedule</span>
              </h3>
              <span className="text-xs font-bold text-[#4A5D4E] bg-[#4A5D4E]/10 px-2.5 py-1 rounded-full">
                Total 2-Yr Cash Savings: {formatUSD(totalBuydownSubsidy)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Year 1 */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-emerald-50 to-emerald-100/40 border-2 border-emerald-400/60 space-y-2 relative shadow-xs">
                <div className="inline-block bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Year 1 (Note - 2.0%)
                </div>
                <div className="space-y-0.5">
                  <span className="text-2xl font-extrabold font-mono text-emerald-950 block">
                    {yr1Rate.toFixed(2)}%
                  </span>
                  <span className="text-lg font-bold font-mono text-[#2D362E] block">
                    {formatUSD(yr1Total)}<span className="text-xs font-normal text-[#606C5D]">/mo</span>
                  </span>
                </div>
                <div className="pt-2 border-t border-emerald-200 text-xs">
                  <span className="font-bold text-emerald-800 block">
                    Saves {formatUSD(yr1MonthlySavings)}/mo
                  </span>
                  <span className="text-[11px] text-emerald-700">
                    ({formatUSD(yr1AnnualSavings)} in Yr 1)
                  </span>
                </div>
              </div>

              {/* Year 2 */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-amber-50 to-amber-100/40 border border-amber-300 space-y-2 relative">
                <div className="inline-block bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Year 2 (Note - 1.0%)
                </div>
                <div className="space-y-0.5">
                  <span className="text-2xl font-extrabold font-mono text-amber-950 block">
                    {yr2Rate.toFixed(2)}%
                  </span>
                  <span className="text-lg font-bold font-mono text-[#2D362E] block">
                    {formatUSD(yr2Total)}<span className="text-xs font-normal text-[#606C5D]">/mo</span>
                  </span>
                </div>
                <div className="pt-2 border-t border-amber-200 text-xs">
                  <span className="font-bold text-amber-900 block">
                    Saves {formatUSD(yr2MonthlySavings)}/mo
                  </span>
                  <span className="text-[11px] text-amber-800">
                    ({formatUSD(yr2AnnualSavings)} in Yr 2)
                  </span>
                </div>
              </div>

              {/* Year 3-30 */}
              <div className="p-4 rounded-2xl bg-[#F9F8F4] border border-[#EAE7E0] space-y-2">
                <div className="inline-block bg-[#606C5D] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Years 3-30 (Note Rate)
                </div>
                <div className="space-y-0.5">
                  <span className="text-2xl font-extrabold font-mono text-[#2D362E] block">
                    {noteRate.toFixed(2)}%
                  </span>
                  <span className="text-lg font-bold font-mono text-[#2D362E] block">
                    {formatUSD(yr3Total)}<span className="text-xs font-normal text-[#606C5D]">/mo</span>
                  </span>
                </div>
                <div className="pt-2 border-t border-[#EAE7E0] text-xs text-[#606C5D]">
                  <span className="block font-medium">Standard Note PITI</span>
                  <span className="text-[11px] text-[#9A9488]">Fixed for remainder of loan</span>
                </div>
              </div>
            </div>
          </div>

          {/* High-Impact Battlecard: 2-1 Buydown vs. Equivalent Price Cut */}
          <div className="bg-gradient-to-br from-[#2D362E] to-[#3B483C] rounded-3xl p-6 text-white shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#E7C19D] block">
                  Realtor & Buyer Negotiation Weapon
                </span>
                <h4 className="text-lg font-serif font-bold">
                  2-1 Buydown vs. Equivalent Price Drop Battlecard
                </h4>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold text-center">
                {buydownCashflowMultiplier}x Greater Payment Relief
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-white/10 border border-white/15 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-300">Option 1: 2-1 Rate Buydown</span>
                  <span className="text-[10px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded">RECOMMENDED</span>
                </div>
                <p className="text-[11px] text-[#D8D2C2]">
                  Seller provides <strong>{formatUSD(totalBuydownSubsidy)}</strong> credit to fund the 2-1 rate buydown.
                </p>
                <div className="pt-2 border-t border-white/10 flex justify-between items-baseline">
                  <span className="text-[#D8D2C2]">Year 1 Monthly Savings:</span>
                  <span className="text-lg font-mono font-extrabold text-emerald-300">
                    +{formatUSD(yr1MonthlySavings)}/mo
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 opacity-80">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#D8D2C2]">Option 2: Price Reduction</span>
                  <span className="text-[10px] text-white/50">Traditional</span>
                </div>
                <p className="text-[11px] text-white/70">
                  Seller reduces list price by the exact same <strong>{formatUSD(priceReductionAmount)}</strong> (from {formatUSD(purchasePrice)} to {formatUSD(reducedPurchasePrice)}).
                </p>
                <div className="pt-2 border-t border-white/10 flex justify-between items-baseline">
                  <span className="text-[#D8D2C2]">Monthly Payment Savings:</span>
                  <span className="text-lg font-mono font-bold text-white/90">
                    +{formatUSD(priceReductionMonthlySavings)}/mo
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[#D8D2C2] leading-relaxed">
              💡 <strong>Underwriting Takeaway:</strong> Asking the seller for a {buydownPercentOfPrice.toFixed(2)}% concession to fund a 2-1 buydown gives your buyer <strong>{formatUSD(yr1MonthlySavings)}/mo</strong> in payment relief vs. only <strong>{formatUSD(priceReductionMonthlySavings)}/mo</strong> from a price cut. The seller nets the exact same proceeds either way.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
