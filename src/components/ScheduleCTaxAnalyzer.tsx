import React, { useState } from "react";
import { 
  Calculator, 
  FileText, 
  Sparkles, 
  Download, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Copy, 
  DollarSign, 
  HelpCircle,
  ShieldCheck,
  FileCheck,
  Building,
  UserCheck,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { CapturedLead, LoanOfficerProfile } from "../types";
import { formatUSD } from "../utils/mortgageMath";

interface ScheduleCTaxAnalyzerProps {
  currentLo?: LoanOfficerProfile;
  leads?: CapturedLead[];
  activeLeadId?: string;
  onSyncIncomeToLead?: (leadId: string, qualifyingMonthlyIncome: number, annualIncome: number) => void;
  onTriggerToast?: (msg: string) => void;
}

interface TaxYearScheduleC {
  taxYear: number;
  grossReceipts: number;
  netProfit: number; // Line 31
  depreciation: number; // Line 13
  depletion: number; // Line 12
  amortization: number;
  homeOffice: number; // Line 30 / Form 8829
  businessMiles: number;
  mealsDeduction: number;
  otherIncomeOrLoss: number;
}

export const ScheduleCTaxAnalyzer: React.FC<ScheduleCTaxAnalyzerProps> = ({
  currentLo,
  leads = [],
  activeLeadId,
  onSyncIncomeToLead,
  onTriggerToast
}) => {
  const [selectedLeadId, setSelectedLeadId] = useState<string>(activeLeadId || (leads[0]?.id || ""));
  const activeLead = leads.find(l => l.id === selectedLeadId);

  const [analysisType, setAnalysisType] = useState<"2-year" | "1-year">("2-year");
  const [aiParseInput, setAiParseInput] = useState("");
  const [parsingAi, setParsingAi] = useState(false);
  const [showAiParser, setShowAiParser] = useState(false);
  const [showFormulasGuide, setShowFormulasGuide] = useState(false);

  // Year 1 (Most Recent, e.g., 2024)
  const [year1, setYear1] = useState<TaxYearScheduleC>({
    taxYear: 2024,
    grossReceipts: 185000,
    netProfit: 72000,
    depreciation: 14500,
    depletion: 0,
    amortization: 1200,
    homeOffice: 3600,
    businessMiles: 12000,
    mealsDeduction: 1800,
    otherIncomeOrLoss: 0
  });

  // Year 2 (Prior Year, e.g., 2023)
  const [year2, setYear2] = useState<TaxYearScheduleC>({
    taxYear: 2023,
    grossReceipts: 165000,
    netProfit: 64000,
    depreciation: 12000,
    depletion: 0,
    amortization: 1200,
    homeOffice: 3600,
    businessMiles: 10500,
    mealsDeduction: 1500,
    otherIncomeOrLoss: 0
  });

  // IRS Mileage Depreciation Rate ($0.28 per mile for 2023/2024)
  const MILEAGE_DEPRECIATION_RATE = 0.28;

  // Calculate Year 1 Adjusted Cash Flow
  const calculateYearCashFlow = (y: TaxYearScheduleC) => {
    const mileageAddback = Math.round(y.businessMiles * MILEAGE_DEPRECIATION_RATE);
    const totalAddbacks = y.depreciation + y.depletion + y.amortization + y.homeOffice + mileageAddback;
    const totalDeductions = y.mealsDeduction + (y.otherIncomeOrLoss < 0 ? Math.abs(y.otherIncomeOrLoss) : 0);
    const otherPositive = y.otherIncomeOrLoss > 0 ? y.otherIncomeOrLoss : 0;
    const adjustedAnnual = y.netProfit + totalAddbacks + otherPositive - totalDeductions;
    return {
      mileageAddback,
      totalAddbacks,
      totalDeductions,
      adjustedAnnual: Math.max(0, adjustedAnnual)
    };
  };

  const y1Calc = calculateYearCashFlow(year1);
  const y2Calc = calculateYearCashFlow(year2);

  // Income Trending & Fannie Mae / Freddie Mac Calculation
  const isDeclining = analysisType === "2-year" && y1Calc.adjustedAnnual < y2Calc.adjustedAnnual;
  const declinePercentage = analysisType === "2-year" && y2Calc.adjustedAnnual > 0 
    ? Math.round(((y2Calc.adjustedAnnual - y1Calc.adjustedAnnual) / y2Calc.adjustedAnnual) * 100) 
    : 0;

  let qualifyingAnnualIncome = 0;
  let calculationMethod = "";

  if (analysisType === "1-year") {
    qualifyingAnnualIncome = y1Calc.adjustedAnnual;
    calculationMethod = "1-Year AUS Finding / 12-Month Baseline";
  } else if (isDeclining) {
    // Underwriting Rule: If income is declining, use the lower (most recent) 12-month year
    qualifyingAnnualIncome = y1Calc.adjustedAnnual;
    calculationMethod = `Declining Income Rule (${declinePercentage}% decrease — Underwriting uses lower most-recent 12 months)`;
  } else {
    // Increasing or Stable: 24-Month Average
    qualifyingAnnualIncome = Math.round((y1Calc.adjustedAnnual + y2Calc.adjustedAnnual) / 2);
    calculationMethod = "24-Month Average (Stable / Increasing Income Trend)";
  }

  const qualifyingMonthlyIncome = Math.round(qualifyingAnnualIncome / 12);

  // AI Tax Extraction Handler
  const handleAiParse = async () => {
    if (!aiParseInput.trim() || parsingAi) return;
    setParsingAi(true);
    try {
      const res = await fetch("/api/gemini/analyze-tax-schedule-c", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          textData: aiParseInput,
          taxYear: year1.taxYear
        })
      });
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        setYear1(prev => ({
          ...prev,
          grossReceipts: d.grossReceipts || prev.grossReceipts,
          netProfit: d.netProfit !== undefined ? d.netProfit : prev.netProfit,
          depreciation: d.depreciation || 0,
          depletion: d.depletion || 0,
          amortization: d.amortization || 0,
          homeOffice: d.homeOffice || 0,
          mealsDeduction: d.mealsDeduction || 0,
          businessMiles: d.businessMiles || 0,
          otherIncomeOrLoss: d.otherIncomeOrLoss || 0
        }));
        if (onTriggerToast) onTriggerToast("✓ Extracted Schedule C line items into Year 1!");
        setShowAiParser(false);
      } else {
        if (onTriggerToast) onTriggerToast("⚠️ Could not extract values. Please review format.");
      }
    } catch (err) {
      console.error("AI parse error:", err);
      if (onTriggerToast) onTriggerToast("⚠️ Error analyzing tax document.");
    } finally {
      setParsingAi(false);
    }
  };

  const handleSyncToLead = () => {
    if (!selectedLeadId) {
      if (onTriggerToast) onTriggerToast("⚠️ Please select a borrower lead to sync.");
      return;
    }
    if (onSyncIncomeToLead) {
      onSyncIncomeToLead(selectedLeadId, qualifyingMonthlyIncome, qualifyingAnnualIncome);
    }
    if (onTriggerToast) {
      onTriggerToast(`✓ Synced qualifying income (${formatUSD(qualifyingMonthlyIncome)}/mo) to ${activeLead?.fullName || "lead"}!`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#2D362E] rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#E7C19D] border border-white/15 text-xs font-bold uppercase tracking-wider">
              <Calculator className="w-3.5 h-3.5 text-[#E7C19D]" />
              <span>Fannie Mae Form 1084 & Freddie Mac Form 91 Specification</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
              Schedule C Self-Employed Cash Flow Analyzer
            </h2>
            <p className="text-sm text-[#D8D2C2] max-w-2xl leading-relaxed">
              Calculate automated qualifying monthly income for 1040 Schedule C Sole Proprietorships and 1099 independent contractors with full non-cash add-backs, mileage depreciation, and trending checks.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setShowAiParser(!showAiParser)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white flex items-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E7C19D]" />
              <span>{showAiParser ? "Close AI Tax Parser" : "AI Tax Document OCR / Paste"}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Save PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI OCR & Text Extractor Drawer */}
      {showAiParser && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-700" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                AI 1040 Schedule C Document & Text Extractor
              </h3>
            </div>
            <span className="text-[11px] text-amber-800">Auto-detects Line 3, 31, 13, 30, Miles & Meals</span>
          </div>

          <textarea
            value={aiParseInput}
            onChange={(e) => setAiParseInput(e.target.value)}
            rows={4}
            placeholder="Paste raw OCR text, CPA tax summary, or line item figures from the borrower's 1040 Schedule C here (e.g. 'Line 3 Gross: $185,000, Line 31 Net: $72,000, Depreciation: $14,500, Home office: $3,600, Miles: 12,000')..."
            className="w-full bg-white border border-amber-200 rounded-2xl p-3 text-xs text-[#2D362E] placeholder-[#9A9488] focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAiParser(false)}
              className="px-3 py-1.5 rounded-xl border border-amber-300 text-xs font-semibold text-amber-900 hover:bg-amber-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAiParse}
              disabled={!aiParseInput.trim() || parsingAi}
              className="px-4 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {parsingAi ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{parsingAi ? "Extracting..." : "Extract to Year 1 Inputs"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Synchronize to Active Borrower Banner */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EAE7E0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4A5D4E]/10 text-[#4A5D4E] flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#9A9488] block">
              Lead Synchronization
            </span>
            <div className="flex items-center gap-2">
              <select
                value={selectedLeadId}
                onChange={(e) => setSelectedLeadId(e.target.value)}
                className="text-xs font-bold bg-[#F9F8F4] border border-[#EAE7E0] rounded-lg px-2.5 py-1.5 text-[#2D362E]"
              >
                <option value="">-- Select Borrower to Sync --</option>
                {leads.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.fullName} (Current Stated: {formatUSD(l.annualIncome || 85000)}/yr)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-[#9A9488] uppercase block">Qualifying Monthly</span>
            <span className="text-lg font-mono font-extrabold text-[#2F5738]">
              {formatUSD(qualifyingMonthlyIncome)}/mo
            </span>
          </div>

          <button
            type="button"
            onClick={handleSyncToLead}
            disabled={!selectedLeadId}
            className="px-4 py-2.5 rounded-xl bg-[#4A5D4E] hover:bg-[#3d4d40] text-xs font-bold text-white flex items-center gap-1.5 disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>Sync to Lead CRM Profile</span>
          </button>
        </div>
      </div>

      {/* Main Income Calculation Summary Card */}
      <div className="bg-[#FDFCF9] rounded-3xl p-6 border border-[#EAE7E0] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE7E0] pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#606C5D]">
              Underwriting Determination
            </span>
            <h3 className="text-xl font-bold text-[#2D362E]">
              Qualifying Income: <span className="text-[#2F5738]">{formatUSD(qualifyingMonthlyIncome)}/month</span> ({formatUSD(qualifyingAnnualIncome)}/year)
            </h3>
            <p className="text-xs text-[#606C5D] mt-0.5">
              Methodology: <strong className="text-[#2D362E]">{calculationMethod}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAnalysisType("2-year")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                analysisType === "2-year"
                  ? "bg-[#4A5D4E] text-white shadow-xs"
                  : "bg-white text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F9F8F4]"
              }`}
            >
              2-Year Analysis (Standard)
            </button>
            <button
              type="button"
              onClick={() => setAnalysisType("1-year")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                analysisType === "1-year"
                  ? "bg-[#4A5D4E] text-white shadow-xs"
                  : "bg-white text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F9F8F4]"
              }`}
            >
              1-Year (AUS Waiver)
            </button>
          </div>
        </div>

        {/* Status Callout if Declining */}
        {isDeclining && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block">
                Warning: Declining Self-Employed Cash Flow Trend ({declinePercentage}% Drop)
              </strong>
              <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                Under Fannie Mae B3-3.2-01 & Freddie Mac 5304.1 guidelines, when self-employment income declines from the previous tax year, the lender must utilize the lower (most recent year) cash flow, and obtain an underwriter letter of explanation and YTD profit & loss verifying business stabilization.
              </p>
            </div>
          </div>
        )}

        {/* 2-Column Comparison Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Year 1 (Most Recent) */}
          <div className="bg-white rounded-2xl p-5 border border-[#EAE7E0] shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-2.5">
              <div>
                <span className="text-xs font-bold text-[#2D362E]">
                  Tax Year {year1.taxYear} (Most Recent)
                </span>
                <span className="text-[11px] text-[#9A9488] block">Form 1040 Schedule C</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-[#4A5D4E] font-mono">
                  {formatUSD(y1Calc.adjustedAnnual)}/yr
                </span>
                <span className="text-[10px] text-[#9A9488] block">
                  ({formatUSD(Math.round(y1Calc.adjustedAnnual / 12))}/mo)
                </span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#606C5D]">Line 3: Gross Receipts / Sales:</span>
                <input
                  type="number"
                  value={year1.grossReceipts}
                  onChange={(e) => setYear1({ ...year1, grossReceipts: Number(e.target.value) })}
                  className="w-28 text-right font-mono font-semibold bg-[#F9F8F4] border border-[#EAE7E0] rounded-lg px-2 py-1"
                />
              </div>

              <div className="flex items-center justify-between bg-emerald-50/50 p-1.5 rounded-lg">
                <span className="font-bold text-[#2D362E]">Line 31: Net Profit or (Loss):</span>
                <input
                  type="number"
                  value={year1.netProfit}
                  onChange={(e) => setYear1({ ...year1, netProfit: Number(e.target.value) })}
                  className="w-28 text-right font-mono font-bold text-emerald-800 bg-white border border-emerald-300 rounded-lg px-2 py-1"
                />
              </div>

              <div className="pt-2 border-t border-[#EAE7E0] space-y-2">
                <span className="text-[11px] font-bold text-[#4A5D4E] uppercase tracking-wider block">
                  + Allowable Non-Cash Add-backs
                </span>

                <div className="flex items-center justify-between">
                  <span className="text-[#606C5D]">Line 13: Depreciation:</span>
                  <input
                    type="number"
                    value={year1.depreciation}
                    onChange={(e) => setYear1({ ...year1, depreciation: Number(e.target.value) })}
                    className="w-28 text-right font-mono text-emerald-700 bg-[#F9F8F4] border border-[#EAE7E0] rounded-lg px-2 py-1"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#606C5D]">Line 12: Depletion:</span>
                  <input
                    type="number"
                    value={year1.depletion}
                    onChange={(e) => setYear1({ ...year1, depletion: Number(e.target.value) })}
                    className="w-28 text-right font-mono text-emerald-700 bg-[#F9F8F4] border border-[#EAE7E0] rounded-lg px-2 py-1"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#606C5D]">Amortization / Casualty Loss:</span>
                  <input
                    type="number"
                    value={year1.amortization}
                    onChange={(e) => setYear1({ ...year1, amortization: Number(e.target.value) })}
                    className="w-28 text-right font-mono text-emerald-700 bg-[#F9F8F4] border border-[#EAE7E0] rounded-lg px-2 py-1"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#606C5D]">Line 30: Business Use of Home:</span>
                  <input
                    type="number"
                    value={year1.homeOffice}
                    onChange={(e) => setYear1({ ...year1, homeOffice: Number(e.target.value) })}
                    className="w-28 text-right font-mono text-emerald-700 bg-[#F9F8F4] border border-[#EAE7E0] rounded-lg px-2 py-1"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[#606C5D] block">Business Miles ({year1.businessMiles} mi):</span>
                    <span className="text-[10px] text-[#9A9488]">Add-back @ ${MILEAGE_DEPRECIATION_RATE}/mi</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={year1.businessMiles}
                      onChange={(e) => setYear1({ ...year1, businessMiles: Number(e.target.value) })}
                      className="w-20 text-right font-mono bg-[#F9F8F4] border border-[#EAE7E0] rounded-lg px-2 py-1"
                    />
                    <span className="text-xs font-mono font-bold text-emerald-700 w-16 text-right">
                      +{formatUSD(y1Calc.mileageAddback)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#EAE7E0] space-y-2">
                <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
                  - Non-Deductible / Expense Adjustments
                </span>

                <div className="flex items-center justify-between">
                  <span className="text-[#606C5D]">Non-deductible Meals (50% exclusion):</span>
                  <input
                    type="number"
                    value={year1.mealsDeduction}
                    onChange={(e) => setYear1({ ...year1, mealsDeduction: Number(e.target.value) })}
                    className="w-28 text-right font-mono text-rose-700 bg-[#F9F8F4] border border-[#EAE7E0] rounded-lg px-2 py-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Year 2 (Prior Year) */}
          {analysisType === "2-year" ? (
            <div className="bg-white rounded-2xl p-5 border border-[#EAE7E0] shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-2.5">
                <div>
                  <span className="text-xs font-bold text-[#2D362E]">
                    Tax Year {year2.taxYear} (Prior Year)
                  </span>
                  <span className="text-[11px] text-[#9A9488] block">Form 1040 Schedule C</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-[#4A5D4E] font-mono">
                    {formatUSD(y2Calc.adjustedAnnual)}/yr
                  </span>
                  <span className="text-[10px] text-[#9A9488] block">
                    ({formatUSD(Math.round(y2Calc.adjustedAnnual / 12))}/mo)
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#606C5D]">Line 3: Gross Receipts / Sales:</span>
                  <input
                    type="number"
                    value={year2.grossReceipts}
                    onChange={(e) => setYear2({ ...year2, grossReceipts: Number(e.target.value) })}
                    className="w-28 text-right font-mono font-semibold bg-[#F9F8F4] border border-[#EAE7E0] rounded-lg px-2 py-1"
                  />
                </div>

                <div className="flex items-center justify-between bg-emerald-50/50 p-1.5 rounded-lg">
                  <span className="font-bold text-[#2D362E]">Line 31: Net Profit or (Loss):</span>
                  <input
                    type="number"
                    value={year2.netProfit}
                    onChange={(e) => setYear2({ ...year2, netProfit: Number(e.target.value) })}
                    className="w-28 text-right font-mono font-bold text-emerald-800 bg-white border border-emerald-300 rounded-lg px-2 py-1"
                  />
                </div>

                <div className="pt-2 border-t border-[#EAE7E0] space-y-2">
                  <span className="text-[11px] font-bold text-[#4A5D4E] uppercase tracking-wider block">
                    + Allowable Non-Cash Add-backs
                  </span>

                  <div className="flex items-center justify-between">
                    <span className="text-[#606C5D]">Line 13: Depreciation:</span>
                    <input
                      type="number"
                      value={year2.depreciation}
                      onChange={(e) => setYear2({ ...year2, depreciation: Number(e.target.value) })}
                      className="w-28 text-right font-mono text-emerald-700 bg-[#F9F8F4] border border-[#EAE7E0] rounded-lg px-2 py-1"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#606C5D]">Line 12: Depletion:</span>
                    <input
                      type="number"
                      value={year2.depletion}
                      onChange={(e) => setYear2({ ...year2, depletion: Number(e.target.value) })}
                      className="w-28 text-right font-mono text-emerald-700 bg-[#F9F8F4] border border-[#EAE7E0] rounded-lg px-2 py-1"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#606C5D]">Amortization / Casualty Loss:</span>
                    <input
                      type="number"
                      value={year2.amortization}
                      onChange={(e) => setYear2({ ...year2, amortization: Number(e.target.value) })}
                      className="w-28 text-right font-mono text-emerald-700 bg-[#F9F8F4] border border-[#EAE7E0] rounded-lg px-2 py-1"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#606C5D]">Line 30: Business Use of Home:</span>
                    <input
                      type="number"
                      value={year2.homeOffice}
                      onChange={(e) => setYear2({ ...year2, homeOffice: Number(e.target.value) })}
                      className="w-28 text-right font-mono text-emerald-700 bg-[#F9F8F4] border border-[#EAE7E0] rounded-lg px-2 py-1"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[#606C5D] block">Business Miles ({year2.businessMiles} mi):</span>
                      <span className="text-[10px] text-[#9A9488]">Add-back @ ${MILEAGE_DEPRECIATION_RATE}/mi</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        value={year2.businessMiles}
                        onChange={(e) => setYear2({ ...year2, businessMiles: Number(e.target.value) })}
                        className="w-20 text-right font-mono bg-[#F9F8F4] border border-[#EAE7E0] rounded-lg px-2 py-1"
                      />
                      <span className="text-xs font-mono font-bold text-emerald-700 w-16 text-right">
                        +{formatUSD(y2Calc.mileageAddback)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#EAE7E0] space-y-2">
                  <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
                    - Non-Deductible / Expense Adjustments
                  </span>

                  <div className="flex items-center justify-between">
                    <span className="text-[#606C5D]">Non-deductible Meals (50% exclusion):</span>
                    <input
                      type="number"
                      value={year2.mealsDeduction}
                      onChange={(e) => setYear2({ ...year2, mealsDeduction: Number(e.target.value) })}
                      className="w-28 text-right font-mono text-rose-700 bg-[#F9F8F4] border border-[#EAE7E0] rounded-lg px-2 py-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#F9F8F4] rounded-2xl p-6 border border-dashed border-[#EAE7E0] flex flex-col items-center justify-center text-center space-y-2">
              <ShieldCheck className="w-8 h-8 text-[#4A5D4E]" />
              <h4 className="text-xs font-bold text-[#2D362E]">1-Year Tax Return Documentation Mode</h4>
              <p className="text-[11px] text-[#606C5D] max-w-xs">
                Under Fannie Mae Desktop Underwriter (DU) or Freddie Mac LPA guidelines, eligible borrowers in business for at least 5 years may qualify with only 1 year of 1040 tax returns.
              </p>
              <button
                type="button"
                onClick={() => setAnalysisType("2-year")}
                className="mt-2 text-xs font-bold text-[#4A5D4E] hover:underline cursor-pointer"
              >
                Switch to 2-Year Analysis →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Guidelines Reference & Form 1084 Notes */}
      <div className="bg-white rounded-2xl p-5 border border-[#EAE7E0] shadow-xs space-y-3">
        <button
          type="button"
          onClick={() => setShowFormulasGuide(!showFormulasGuide)}
          className="w-full flex items-center justify-between text-xs font-bold text-[#2D362E] cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#4A5D4E]" />
            <span>Fannie Mae Form 1084 & Underwriting Guideline References</span>
          </span>
          {showFormulasGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showFormulasGuide && (
          <div className="pt-2 border-t border-[#EAE7E0] grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#606C5D] leading-relaxed">
            <div className="p-3 bg-[#F9F8F4] rounded-xl space-y-1">
              <strong className="text-[#2D362E] font-bold block">1. Depreciation & Depletion (Lines 12 & 13)</strong>
              <p className="text-[11px]">
                Non-cash accounting writeoffs are added back in full to net profit on Form 1084.
              </p>
            </div>
            <div className="p-3 bg-[#F9F8F4] rounded-xl space-y-1">
              <strong className="text-[#2D362E] font-bold block">2. Business Use of Home (Line 30)</strong>
              <p className="text-[11px]">
                Home office expenses from Form 8829 / Line 30 are added back because the housing expense is already captured in the primary mortgage payment.
              </p>
            </div>
            <div className="p-3 bg-[#F9F8F4] rounded-xl space-y-1">
              <strong className="text-[#2D362E] font-bold block">3. Business Mileage Depreciation</strong>
              <p className="text-[11px]">
                The standard mileage rate includes a non-cash depreciation factor ($0.28/mile) that can be added back when standard mileage is claimed.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
