import React from "react";
import { 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  CheckCircle2, 
  Info, 
  TrendingUp, 
  ArrowRight,
  Sparkles,
  DollarSign,
  Scale
} from "lucide-react";
import { formatUSD, getDTIStatus } from "../utils/mortgageMath";

export interface DTIUnderwritingMeterProps {
  frontEndDTI: number;
  backEndDTI: number;
  grossMonthlyIncome: number;
  totalHousingPayment: number;
  monthlyDebts: number;
  className?: string;
  isLoanOfficerMode?: boolean;
  compact?: boolean;
  showCalculations?: boolean;
}

export const DTIUnderwritingMeter: React.FC<DTIUnderwritingMeterProps> = ({
  frontEndDTI = 0,
  backEndDTI = 0,
  grossMonthlyIncome = 0,
  totalHousingPayment = 0,
  monthlyDebts = 0,
  className = "",
  isLoanOfficerMode = true,
  compact = false,
  showCalculations = true
}) => {
  // Defensive values
  const safeFrontDTI = Math.max(0, isNaN(frontEndDTI) || !isFinite(frontEndDTI) ? 0 : Math.round(frontEndDTI * 10) / 10);
  const safeBackDTI = Math.max(0, isNaN(backEndDTI) || !isFinite(backEndDTI) ? 0 : Math.round(backEndDTI * 10) / 10);
  const safeIncome = Math.max(0, isNaN(grossMonthlyIncome) || !isFinite(grossMonthlyIncome) ? 0 : grossMonthlyIncome);
  const safeHousing = Math.max(0, isNaN(totalHousingPayment) || !isFinite(totalHousingPayment) ? 0 : totalHousingPayment);
  const safeDebts = Math.max(0, isNaN(monthlyDebts) || !isFinite(monthlyDebts) ? 0 : monthlyDebts);

  const dtiStatus = getDTIStatus(safeBackDTI);

  // Calculate Underwriting Capacities & Headroom
  const maxHousingAt45 = Math.max(0, Math.round((safeIncome * 0.45) - safeDebts));
  const maxHousingAt50 = Math.max(0, Math.round((safeIncome * 0.50) - safeDebts));
  const remainingMonthlyHeadroom45 = Math.max(0, Math.round((safeIncome * 0.45) - (safeHousing + safeDebts)));
  const remainingMonthlyHeadroom50 = Math.max(0, Math.round((safeIncome * 0.50) - (safeHousing + safeDebts)));
  const monthlyOverdraft50 = safeBackDTI > 50 ? Math.max(0, Math.round((safeHousing + safeDebts) - (safeIncome * 0.50))) : 0;

  // Visual meter percentage (capped between 0 and 100 on a 0-60% DTI scale)
  const backDTIGaugePercent = Math.min(100, Math.max(0, (safeBackDTI / 60) * 100));
  const frontDTIGaugePercent = Math.min(100, Math.max(0, (safeFrontDTI / 40) * 100));

  // Determine active tier color & styling
  const getDTIColorConfig = (dti: number) => {
    if (dti <= 36) {
      return {
        bg: "bg-emerald-500",
        border: "border-emerald-200",
        text: "text-emerald-800",
        pillBg: "bg-emerald-50",
        gradient: "from-emerald-500 to-teal-600",
        lightBg: "bg-emerald-50/70",
        icon: CheckCircle2,
        label: "Optimal Underwriting Tier",
        subLabel: "AUS Automated Approval Probability: Very High"
      };
    }
    if (dti <= 45) {
      return {
        bg: "bg-amber-500",
        border: "border-amber-200",
        text: "text-amber-800",
        pillBg: "bg-amber-50",
        gradient: "from-amber-500 to-amber-600",
        lightBg: "bg-amber-50/70",
        icon: Info,
        label: "Moderate Risk Tier",
        subLabel: "Standard QM Approval Range (Compensating factors may help)"
      };
    }
    if (dti <= 50) {
      return {
        bg: "bg-orange-500",
        border: "border-orange-200",
        text: "text-orange-800",
        pillBg: "bg-orange-50",
        gradient: "from-orange-500 to-red-500",
        lightBg: "bg-orange-50/70",
        icon: AlertTriangle,
        label: "High Risk DTI Tier",
        subLabel: "Requires Strong Compensating Factors (Reserves/Credit)"
      };
    }
    return {
      bg: "bg-red-600",
      border: "border-red-300",
      text: "text-red-800",
      pillBg: "bg-red-50",
      gradient: "from-red-600 to-rose-700",
      lightBg: "bg-red-50/80",
      icon: AlertOctagon,
      label: "Ineligible / Over 50% QM Cap",
      subLabel: "Exceeds Standard Fannie/Freddie & FHA Underwriting Limits"
    };
  };

  const colorConfig = getDTIColorConfig(safeBackDTI);
  const StatusIcon = colorConfig.icon;

  return (
    <div className={`rounded-2xl border border-[#EAE7E0] bg-[#FDFCF9] p-4 sm:p-5 space-y-4 shadow-2xs ${className}`}>
      {/* Header & Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-[#EAE7E0] pb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${colorConfig.pillBg} ${colorConfig.text} border ${colorConfig.border} shrink-0`}>
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-[#2D362E] uppercase tracking-wider">
                Underwriting DTI Risk Meter
              </h4>
              {isLoanOfficerMode && (
                <span className="text-[10px] bg-[#4A5D4E]/10 text-[#4A5D4E] font-bold px-1.5 py-0.2 rounded border border-[#4A5D4E]/20">
                  LO Live AUS Sync
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#606C5D]">
              Real-time Debt-to-Income capacity & underwriting tolerance check
            </p>
          </div>
        </div>

        {/* Live Status Pill */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border shrink-0 ${colorConfig.pillBg} ${colorConfig.text} ${colorConfig.border}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          <span>
            {safeBackDTI > 50 ? (
              <span className="line-through decoration-red-600 decoration-2">
                Back-End DTI {safeBackDTI}% (Over 50% Limit)
              </span>
            ) : (
              <span>Back-End DTI {safeBackDTI}% • {colorConfig.label}</span>
            )}
          </span>
        </div>
      </div>

      {/* Main Visual Progress Bars */}
      <div className="space-y-4">
        {/* BACK-END DTI BAR (PRIMARY UNDERWRITING METRIC) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#2D362E] flex items-center gap-1.5">
              <span>Back-End DTI (Housing + Debts)</span>
              <span className="text-[11px] font-normal text-[#606C5D]">
                ({formatUSD(safeHousing + safeDebts)}/mo / {formatUSD(safeIncome)}/mo)
              </span>
            </span>
            <div className="flex items-center gap-1.5">
              {safeBackDTI > 50 ? (
                <span className="font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded text-xs">
                  {safeBackDTI}% (Over 50% Cap)
                </span>
              ) : (
                <span className={`font-mono font-bold text-sm ${colorConfig.text}`}>
                  {safeBackDTI}%
                </span>
              )}
            </div>
          </div>

          {/* Segmented Track Container */}
          <div className="relative pt-1 pb-4">
            {/* Background Track with Color Zone Indicators */}
            <div className="h-3.5 w-full bg-[#E5E2DA] rounded-full overflow-hidden flex relative shadow-inner">
              {/* Healthy Zone: 0 - 36% (60% of track) */}
              <div 
                style={{ width: "60%" }} 
                className="h-full bg-emerald-100/80 border-r border-emerald-300"
                title="Optimal / Safe Zone (0% - 36%)"
              />
              {/* Moderate Zone: 36 - 45% (15% of track) */}
              <div 
                style={{ width: "15%" }} 
                className="h-full bg-amber-100/80 border-r border-amber-300"
                title="Moderate Risk (36% - 45%)"
              />
              {/* High Zone: 45 - 50% (8.3% of track) */}
              <div 
                style={{ width: "8.33%" }} 
                className="h-full bg-orange-100/80 border-r border-red-300"
                title="High Risk (45% - 50%)"
              />
              {/* Ineligible Zone: 50% - 60%+ (16.67% of track) */}
              <div 
                style={{ width: "16.67%" }} 
                className="h-full bg-red-100/80"
                title="Ineligible (>50%)"
              />

              {/* Dynamic Active Fill Bar */}
              <div 
                style={{ width: `${backDTIGaugePercent}%` }} 
                className={`absolute left-0 top-0 bottom-0 rounded-full bg-gradient-to-r ${colorConfig.gradient} transition-all duration-300 ease-out shadow-xs`}
              />
            </div>

            {/* Threshold Marker Ticks on the Track */}
            <div className="absolute top-0 bottom-0 left-0 right-0 pointer-events-none">
              {/* 36% Optimal Marker (60% position) */}
              <div className="absolute top-0 bottom-0 left-[60%] flex flex-col items-center">
                <div className="w-0.5 h-4 bg-[#2D362E]/40" />
                <span className="text-[9px] font-bold text-emerald-800 mt-1 font-mono">36%</span>
                <span className="text-[8px] text-[#606C5D] leading-none hidden sm:block">Optimal</span>
              </div>

              {/* 45% Moderate Marker (75% position) */}
              <div className="absolute top-0 bottom-0 left-[75%] flex flex-col items-center">
                <div className="w-0.5 h-4 bg-[#2D362E]/40" />
                <span className="text-[9px] font-bold text-amber-800 mt-1 font-mono">45%</span>
                <span className="text-[8px] text-[#606C5D] leading-none hidden sm:block">Caution</span>
              </div>

              {/* 50% Hard Cap Marker (83.33% position) */}
              <div className="absolute top-0 bottom-0 left-[83.33%] flex flex-col items-center">
                <div className="w-0.5 h-4 bg-red-700" />
                <span className="text-[9px] font-bold text-red-700 mt-1 font-mono">50%</span>
                <span className="text-[8px] text-red-600 font-bold leading-none hidden sm:block">Hard Cap</span>
              </div>
            </div>
          </div>
        </div>

        {/* FRONT-END DTI BAR (HOUSING EXPENSE RATIO) */}
        {!compact && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#2D362E] flex items-center gap-1.5">
                <span>Front-End DTI (Housing Only)</span>
                <span className="text-[11px] font-normal text-[#606C5D]">
                  ({formatUSD(safeHousing)}/mo PITI+HOA / {formatUSD(safeIncome)}/mo)
                </span>
              </span>
              <span className={`font-mono font-bold ${safeFrontDTI <= 28 ? "text-emerald-700" : safeFrontDTI <= 36 ? "text-amber-700" : "text-red-700"}`}>
                {safeFrontDTI}% {safeFrontDTI <= 28 ? "(≤28% Standard)" : safeFrontDTI <= 36 ? "(Moderate)" : "(High)"}
              </span>
            </div>

            <div className="h-2 w-full bg-[#E5E2DA] rounded-full overflow-hidden relative shadow-inner">
              <div 
                style={{ width: `${frontDTIGaugePercent}%` }} 
                className={`h-full rounded-full transition-all duration-300 ease-out ${
                  safeFrontDTI <= 28 
                    ? "bg-emerald-600" 
                    : safeFrontDTI <= 36 
                    ? "bg-amber-500" 
                    : "bg-red-600"
                }`}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#9A9488]">
              <span>0%</span>
              <span className="text-emerald-800 font-semibold">28% (Standard Fannie/Freddie Benchmark)</span>
              <span>40%+</span>
            </div>
          </div>
        )}
      </div>

      {/* Underwriting Insights & Capacity Cards (LO Insights) */}
      {showCalculations && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
          {/* Card 1: Gross Monthly Income & Total Debt */}
          <div className="p-2.5 rounded-xl bg-white border border-[#EAE7E0] space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#9A9488] block">
              Monthly Debt Load
            </span>
            <div className="flex items-baseline justify-between">
              <span className="font-bold text-xs text-[#2D362E]">{formatUSD(safeHousing + safeDebts)}/mo</span>
              <span className="text-[10px] text-[#606C5D]">of {formatUSD(safeIncome)}</span>
            </div>
            <div className="text-[10px] text-[#606C5D] truncate">
              PITI: {formatUSD(safeHousing)} | Debts: {formatUSD(safeDebts)}
            </div>
          </div>

          {/* Card 2: Debt Headroom to 45% DTI */}
          <div className="p-2.5 rounded-xl bg-white border border-[#EAE7E0] space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#9A9488] block">
              Buffer to 45% DTI Cap
            </span>
            <div className="flex items-baseline justify-between">
              <span className={`font-bold text-xs ${remainingMonthlyHeadroom45 > 0 ? "text-emerald-700" : "text-amber-700"}`}>
                {remainingMonthlyHeadroom45 > 0 ? `+${formatUSD(remainingMonthlyHeadroom45)}/mo` : "0 (Exceeded)"}
              </span>
              <span className="text-[10px] text-[#606C5D]">Headroom</span>
            </div>
            <div className="text-[10px] text-[#606C5D] truncate">
              Max PITI @ 45%: {formatUSD(maxHousingAt45)}/mo
            </div>
          </div>

          {/* Card 3: AUS Approval Likelihood / Ineligibility Alert */}
          <div className={`p-2.5 rounded-xl border space-y-1 ${colorConfig.lightBg} ${colorConfig.border}`}>
            <span className="text-[10px] uppercase tracking-wider font-bold text-[#2D362E] block">
              Underwriting Outcome
            </span>
            <div className="flex items-center gap-1">
              <StatusIcon className={`w-3.5 h-3.5 shrink-0 ${colorConfig.text}`} />
              <span className={`font-bold text-xs truncate ${colorConfig.text}`}>
                {safeBackDTI <= 36 
                  ? "AUS Approve/Eligible" 
                  : safeBackDTI <= 45 
                  ? "Standard QM Approval" 
                  : safeBackDTI <= 50 
                  ? "Strict / Comp Factors" 
                  : "Ineligible (>50%)"}
              </span>
            </div>
            <div className="text-[10px] text-[#606C5D] truncate">
              {safeBackDTI > 50 
                ? `Exceeds 50% limit by ${formatUSD(monthlyOverdraft50)}/mo`
                : `Max PITI @ 50%: ${formatUSD(maxHousingAt50)}/mo`}
            </div>
          </div>
        </div>
      )}

      {/* Over-50% Ineligible Warning Callout (if applicable) */}
      {safeBackDTI > 50 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-start gap-2.5">
          <AlertOctagon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block">
              Warning: Borrower Debt-to-Income ({safeBackDTI}%) Exceeds 50.00% Hard Cap
            </span>
            <p className="text-[11px] text-red-800 leading-relaxed">
              Standard Conventional, FHA, and USDA automated underwriting systems (AUS) will reject files with Back-End DTI above 50%. To bring this scenario into approval range, increase down payment, lower purchase price, or pay down at least <strong className="font-bold">{formatUSD(monthlyOverdraft50)}/month</strong> in consumer debts.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
