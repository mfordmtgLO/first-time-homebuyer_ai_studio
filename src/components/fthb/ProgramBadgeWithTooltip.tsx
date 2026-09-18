import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, CheckCircle2, XCircle, Info, MapPin, DollarSign, Users, Award, ShieldCheck } from 'lucide-react';
import { FthbPropertyEval } from '../../utils/fthbAdStudioBridge';
import { formatUSD } from '../../utils/mortgageMath';

interface ProgramBadgeProps {
  evalData: FthbPropertyEval;
  propertyPrice: number;
  className?: string;
}

/**
 * USDA Rural Development (0% Down) Badge with rich calculation & income limit hover tooltip
 */
export const UsdaProgramBadge: React.FC<ProgramBadgeProps> = ({ evalData, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);

  // Close on outside click for mobile touch accessibility
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (badgeRef.current && !badgeRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const qualifies = evalData.usdaQualifies;
  const headroom = evalData.usdaHeadroom;
  const isPassIncome = evalData.usdaHouseholdIncome <= evalData.usdaLimit;
  const isRural = evalData.usdaIsRuralArea;

  return (
    <div 
      ref={badgeRef}
      className={`relative inline-flex items-center group/badge ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onClick={(e) => {
        e.stopPropagation();
        setIsOpen(prev => !prev);
      }}
    >
      {/* Badge Button */}
      <button
        type="button"
        id={`badge-usda-${evalData.county.toLowerCase()}-${qualifies ? 'qualified' : 'ineligible'}`}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-help border ${
          qualifies
            ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-400'
            : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100 hover:text-stone-700'
        }`}
        title="Click or hover to inspect USDA income limits and census tract qualification"
      >
        <span>🚜</span>
        <span>{qualifies ? 'USDA RD (0% Down)' : 'USDA (Ineligible)'}</span>
        <Info className={`w-2.5 h-2.5 ${qualifies ? 'text-emerald-600' : 'text-stone-400'}`} />
      </button>

      {/* Floating Hover Tooltip */}
      {isOpen && (
        <div 
          className="absolute bottom-full left-0 mb-2 w-72 sm:w-80 p-3.5 bg-stone-900 text-stone-100 rounded-2xl shadow-2xl border border-stone-700/80 z-50 animate-in fade-in-0 zoom-in-95 duration-150 text-left select-text"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Tooltip Arrow */}
          <div className="absolute top-full left-5 -mt-px w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-stone-900" />

          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-stone-800 gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">🚜</span>
              <span className="font-bold text-xs text-white">USDA Rural Development</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide flex items-center gap-1 ${
              qualifies 
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' 
                : 'bg-rose-950 text-rose-300 border border-rose-800'
            }`}>
              {qualifies ? (
                <>
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                  Qualified (0% Down)
                </>
              ) : (
                <>
                  <XCircle className="w-2.5 h-2.5 text-rose-400" />
                  Ineligible
                </>
              )}
            </span>
          </div>

          {/* Calculation Matrix */}
          <div className="mt-2.5 space-y-2 text-[11px]">
            {/* Income Limit Breakdown */}
            <div className="p-2 rounded-xl bg-stone-800/80 border border-stone-700/60 space-y-1.5">
              <div className="flex justify-between items-center text-stone-300">
                <span className="flex items-center gap-1 text-[10px] text-stone-400">
                  <DollarSign className="w-3 h-3 text-emerald-400" />
                  Household Income Evaluated:
                </span>
                <span className="font-bold text-white">
                  {formatUSD(evalData.usdaHouseholdIncome)}
                </span>
              </div>

              <div className="flex justify-between items-center text-stone-300">
                <span className="flex items-center gap-1 text-[10px] text-stone-400">
                  <Users className="w-3 h-3 text-blue-400" />
                  {evalData.county} County USDA Limit:
                </span>
                <span className="font-bold text-amber-300">
                  {formatUSD(evalData.usdaLimit)}
                </span>
              </div>

              <div className="flex justify-between items-center text-[10px] pt-1 border-t border-stone-700/50">
                <span className="text-stone-400">
                  Tier: {evalData.usdaHouseholdSize > 4 ? '5+ Person Family' : '1–4 Person Household'} ({evalData.usdaHouseholdSize} members)
                </span>
                <span className={`font-extrabold ${isPassIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {headroom >= 0 
                    ? `+$${headroom.toLocaleString()} below cap (PASS)` 
                    : `-$${Math.abs(headroom).toLocaleString()} over limit (FAIL)`}
                </span>
              </div>
            </div>

            {/* Geographic & Census Tract Eligibility */}
            <div className="p-2 rounded-xl bg-stone-800/80 border border-stone-700/60 space-y-1 text-[10px]">
              <div className="flex justify-between items-center">
                <span className="text-stone-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  Rural Area Boundary:
                </span>
                <span className={`font-bold ${isRural ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isRural ? '✓ Eligible Rural Tract' : '✗ Urban / Ineligible'}
                </span>
              </div>
              <div className="flex justify-between items-center text-stone-400">
                <span>Zoning Overlay:</span>
                <span className="text-stone-300 font-mono text-[9px] truncate max-w-[150px]">
                  {evalData.usdaZoneName || 'USDA Rural Standard'}
                </span>
              </div>
            </div>

            {/* Financing Angle */}
            <div className="flex items-center justify-between text-[10px] px-1 text-stone-300">
              <span className="text-stone-400">Financing Terms:</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> 100% LTV • $0 Down Payment
              </span>
            </div>

            {/* Specific Verdict Note */}
            <div className="p-2 rounded-lg bg-stone-950/60 border border-stone-800 text-[10px] text-stone-300 leading-snug">
              <span className="font-bold text-amber-200">Calculation Note: </span>
              {evalData.usdaReason}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * OHCS FirstHome ($15k DPA) Badge with Census Tract & County Purchase Price Limit hover tooltip
 */
export const OhcsProgramBadge: React.FC<ProgramBadgeProps> = ({ evalData, propertyPrice, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);

  // Close on outside click for mobile touch accessibility
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (badgeRef.current && !badgeRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const qualifies = evalData.ohcsQualifies;
  const headroom = evalData.ohcsHeadroom;
  const isTargeted = evalData.ohcsIsTargeted;
  const isPriceEligible = propertyPrice <= evalData.ohcsApplicablePriceLimit;

  return (
    <div 
      ref={badgeRef}
      className={`relative inline-flex items-center group/badge ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onClick={(e) => {
        e.stopPropagation();
        setIsOpen(prev => !prev);
      }}
    >
      {/* Badge Button */}
      <button
        type="button"
        id={`badge-ohcs-${evalData.county.toLowerCase()}-${qualifies ? 'qualified' : 'ineligible'}`}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-help border ${
          qualifies
            ? 'bg-orange-50 border-orange-300 text-orange-800 hover:bg-orange-100 hover:border-orange-400'
            : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100 hover:text-stone-700'
        }`}
        title="Click or hover to inspect OHCS purchase price limits and census tract data"
      >
        <span>🏠</span>
        <span>{qualifies ? 'OHCS FirstHome ($15k DPA)' : 'OHCS (Price Cap/LMI)'}</span>
        <Info className={`w-2.5 h-2.5 ${qualifies ? 'text-orange-600' : 'text-stone-400'}`} />
      </button>

      {/* Floating Hover Tooltip */}
      {isOpen && (
        <div 
          className="absolute bottom-full left-0 mb-2 w-72 sm:w-84 p-3.5 bg-stone-900 text-stone-100 rounded-2xl shadow-2xl border border-stone-700/80 z-50 animate-in fade-in-0 zoom-in-95 duration-150 text-left select-text"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Tooltip Arrow */}
          <div className="absolute top-full left-6 -mt-px w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-stone-900" />

          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-stone-800 gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">🏠</span>
              <span className="font-bold text-xs text-white">OHCS FirstHome & DPA</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide flex items-center gap-1 ${
              qualifies 
                ? 'bg-orange-950 text-orange-300 border border-orange-700' 
                : 'bg-stone-800 text-stone-400 border border-stone-700'
            }`}>
              {qualifies ? (
                <>
                  <Award className="w-2.5 h-2.5 text-orange-400" />
                  Qualified ($15k DPA)
                </>
              ) : (
                <>
                  <XCircle className="w-2.5 h-2.5 text-rose-400" />
                  Ineligible
                </>
              )}
            </span>
          </div>

          {/* Calculation Matrix */}
          <div className="mt-2.5 space-y-2 text-[11px]">
            {/* Census Tract Targeting */}
            <div className="p-2 rounded-xl bg-stone-800/80 border border-stone-700/60 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1 text-[10px] text-stone-400">
                  <MapPin className="w-3 h-3 text-orange-400" />
                  Census Tract:
                </span>
                <span className="font-mono font-bold text-white text-[11px]">
                  {evalData.ohcsCensusTract}
                </span>
              </div>

              <div className="flex justify-between items-center text-[10px]">
                <span className="text-stone-400">Tract Status:</span>
                <span className={`font-bold ${isTargeted ? 'text-amber-300' : (evalData.ohcsLmiEligible ? 'text-emerald-400' : 'text-stone-300')}`}>
                  {isTargeted ? 'OHCS Targeted Area' : (evalData.ohcsLmiEligible ? 'LMI Census Tract' : 'Standard Area')}
                </span>
              </div>

              {evalData.ohcsLmiPercentage !== undefined && (
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-stone-400">Census AMI Ratio:</span>
                  <span className="text-stone-200 font-mono">
                    {evalData.ohcsLmiPercentage}% of Area Median Income
                  </span>
                </div>
              )}
            </div>

            {/* Purchase Price Limit Comparison */}
            <div className="p-2 rounded-xl bg-stone-800/80 border border-stone-700/60 space-y-1.5">
              <div className="flex justify-between items-center text-stone-300">
                <span className="flex items-center gap-1 text-[10px] text-stone-400">
                  <DollarSign className="w-3 h-3 text-orange-400" />
                  Listing Price:
                </span>
                <span className="font-bold text-white">
                  {formatUSD(propertyPrice)}
                </span>
              </div>

              <div className="flex justify-between items-center text-stone-300">
                <span className="flex items-center gap-1 text-[10px] text-stone-400">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  {evalData.county} Cap ({isTargeted ? 'Targeted' : 'Non-Targeted'}):
                </span>
                <span className="font-bold text-amber-300">
                  {formatUSD(evalData.ohcsApplicablePriceLimit)}
                </span>
              </div>

              <div className="flex justify-between items-center text-[10px] pt-1 border-t border-stone-700/50">
                <span className="text-stone-400">
                  Limit Tier Headroom:
                </span>
                <span className={`font-extrabold ${isPriceEligible ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {headroom >= 0 
                    ? `+$${headroom.toLocaleString()} under cap (PASS)` 
                    : `-$${Math.abs(headroom).toLocaleString()} over limit (FAIL)`}
                </span>
              </div>
            </div>

            {/* DPA Cash Grant Angle */}
            <div className="flex items-center justify-between text-[10px] px-1 text-stone-300">
              <span className="text-stone-400">DPA Grant Benefit:</span>
              <span className="font-bold text-orange-400 flex items-center gap-1">
                <Award className="w-2.5 h-2.5" /> $15,000 Cash Grant (0% Forgivable)
              </span>
            </div>

            {/* Specific Verdict Note */}
            <div className="p-2 rounded-lg bg-stone-950/60 border border-stone-800 text-[10px] text-stone-300 leading-snug">
              <span className="font-bold text-orange-200">Calculation Note: </span>
              {evalData.ohcsReason}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Lakeview National (140% AMI) Badge with Qualifying Income Limit hover tooltip
 */
export const LakeviewProgramBadge: React.FC<ProgramBadgeProps> = ({ evalData, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (badgeRef.current && !badgeRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const qualifies = evalData.lakeviewQualifies;
  const borrowerIncome = evalData.borrowerIncomeUsed ?? 85000;
  const headroom = (evalData.lakeviewHeadroom ?? (evalData.lakeviewLimit - borrowerIncome));

  return (
    <div 
      ref={badgeRef}
      className={`relative inline-flex items-center group/badge ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onClick={(e) => {
        e.stopPropagation();
        setIsOpen(prev => !prev);
      }}
    >
      <button
        type="button"
        id={`badge-lakeview-${evalData.county.toLowerCase()}-${qualifies ? 'qualified' : 'ineligible'}`}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-help border ${
          qualifies
            ? 'bg-blue-50 border-blue-300 text-blue-800 hover:bg-blue-100 hover:border-blue-400'
            : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100 hover:text-stone-700'
        }`}
        title="Click or hover to inspect Lakeview 140% AMI limits"
      >
        <span>🌊</span>
        <span>{qualifies ? 'Lakeview (140% AMI)' : 'Lakeview (Ineligible)'}</span>
        <Info className={`w-2.5 h-2.5 ${qualifies ? 'text-blue-600' : 'text-stone-400'}`} />
      </button>

      {isOpen && (
        <div 
          className="absolute bottom-full left-0 mb-2 w-72 sm:w-80 p-3.5 bg-stone-900 text-stone-100 rounded-2xl shadow-2xl border border-stone-700/80 z-50 animate-in fade-in-0 zoom-in-95 duration-150 text-left select-text"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-full left-6 -mt-px w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-stone-900" />

          <div className="flex items-center justify-between pb-2 border-b border-stone-800 gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">🌊</span>
              <span className="font-bold text-xs text-white">Lakeview National DPA</span>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide flex items-center gap-1 ${
              qualifies 
                ? 'bg-blue-950 text-blue-300 border border-blue-700' 
                : 'bg-stone-800 text-stone-400 border border-stone-700'
            }`}>
              {qualifies ? (
                <>
                  <CheckCircle2 className="w-2.5 h-2.5 text-blue-400" />
                  Qualified (140% AMI)
                </>
              ) : (
                <>
                  <XCircle className="w-2.5 h-2.5 text-rose-400" />
                  Ineligible
                </>
              )}
            </span>
          </div>

          <div className="mt-2.5 space-y-2 text-[11px]">
            <div className="p-2 rounded-xl bg-stone-800/80 border border-stone-700/60 space-y-1.5">
              <div className="flex justify-between items-center text-stone-300">
                <span className="text-stone-400">Borrower Qualifying Income:</span>
                <span className="font-bold text-white">{formatUSD(borrowerIncome)}</span>
              </div>
              <div className="flex justify-between items-center text-stone-300">
                <span className="text-stone-400">{evalData.county} 140% AMI Cap:</span>
                <span className="font-bold text-blue-300">{formatUSD(evalData.lakeviewLimit)}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] pt-1 border-t border-stone-700/50">
                <span className="text-stone-400">Income Room:</span>
                <span className={`font-bold ${headroom >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {headroom >= 0 ? `+$${headroom.toLocaleString()} below cap` : `-$${Math.abs(headroom).toLocaleString()} over cap`}
                </span>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-stone-950/60 border border-stone-800 text-[10px] text-stone-300 leading-snug">
              <span className="font-bold text-blue-200">Key Advantage: </span>
              No First-Time Homebuyer restriction. Available to both repeat and first-time buyers statewide.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
