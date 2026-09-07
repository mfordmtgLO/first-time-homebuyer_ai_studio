import React, { useState, useEffect } from "react";
import { X, Calculator } from "lucide-react";
import { PropertyListing, FinancialProfile } from "../types";
import { formatUSD, calculateMonthlyPI } from "../utils/mortgageMath";

interface Props {
  property: PropertyListing;
  profile: FinancialProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const PropertyCalculatorModal: React.FC<Props> = ({ property, profile, isOpen, onClose }) => {
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [interestRate, setInterestRate] = useState(6.5);
  const [loanTerm, setLoanTerm] = useState(30);
  const [propertyTax, setPropertyTax] = useState(Math.round(property.price * 0.012 / 12));
  const [homeInsurance, setHomeInsurance] = useState(120);
  const [hoaFees, setHoaFees] = useState(0);

  // Sync when property changes
  useEffect(() => {
    setPropertyTax(Math.round(property.price * 0.012 / 12));
  }, [property]);

  if (!isOpen) return null;

  const downPaymentAmt = Math.round(property.price * (downPaymentPct / 100));
  const loanAmount = property.price - downPaymentAmt;
  const pi = calculateMonthlyPI(loanAmount, interestRate, loanTerm);
  const totalMonthly = pi + propertyTax + homeInsurance + hoaFees;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-[#EAE7E0] dark:border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-serif font-bold text-[#2D362E] dark:text-slate-100 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#4A5D4E] dark:text-emerald-500" />
            What-If Scenario
          </h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-stone-100 dark:hover:bg-slate-800 text-[#606C5D] dark:text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-sm text-[#2D362E] dark:text-slate-200">
          <div className="bg-stone-50 dark:bg-slate-800 p-4 rounded-xl border border-stone-100 dark:border-slate-700">
            <div className="text-xs text-[#606C5D] dark:text-slate-400 mb-1">Target Property</div>
            <div className="font-bold truncate">{property.address}</div>
            <div className="text-lg font-bold text-[#4A5D4E] dark:text-emerald-400 mt-1">{formatUSD(property.price)}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#606C5D] dark:text-slate-400">Down Payment (%)</label>
              <input type="number" value={downPaymentPct} onChange={e => setDownPaymentPct(Number(e.target.value))} className="w-full p-2.5 rounded-xl border border-[#EAE7E0] dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-[#4A5D4E] outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#606C5D] dark:text-slate-400">Interest Rate (%)</label>
              <input type="number" step="0.125" value={interestRate} onChange={e => setInterestRate(Number(e.target.value))} className="w-full p-2.5 rounded-xl border border-[#EAE7E0] dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-[#4A5D4E] outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#606C5D] dark:text-slate-400">Monthly Taxes ($)</label>
              <input type="number" value={propertyTax} onChange={e => setPropertyTax(Number(e.target.value))} className="w-full p-2.5 rounded-xl border border-[#EAE7E0] dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-[#4A5D4E] outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#606C5D] dark:text-slate-400">Monthly HOA ($)</label>
              <input type="number" value={hoaFees} onChange={e => setHoaFees(Number(e.target.value))} className="w-full p-2.5 rounded-xl border border-[#EAE7E0] dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-[#4A5D4E] outline-none" />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#EAE7E0] dark:border-slate-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[#606C5D] dark:text-slate-400">Principal & Interest</span>
              <span className="font-semibold">{formatUSD(pi)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[#606C5D] dark:text-slate-400">Taxes, Ins, & HOA</span>
              <span className="font-semibold">{formatUSD(propertyTax + homeInsurance + hoaFees)}</span>
            </div>
            <div className="flex justify-between items-center text-lg font-bold mt-4 text-[#2D362E] dark:text-slate-100">
              <span>Total Est. Payment</span>
              <span className="text-[#4A5D4E] dark:text-emerald-400">{formatUSD(totalMonthly)}/mo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
