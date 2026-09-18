import React, { useState, useEffect } from "react";
import { 
  X, 
  DollarSign, 
  Calendar, 
  Award, 
  CheckCircle2, 
  Clock, 
  Users, 
  TrendingUp, 
  Zap, 
  Sparkles, 
  MapPin, 
  Share2, 
  Layers, 
  Calculator, 
  Building2,
  FileCheck2,
  HelpCircle,
  Tag
} from "lucide-react";
import { CapturedLead, RealEstateAgentProfile, LoanOfficerProfile } from "../../types";

interface LeadFundingClosingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: CapturedLead | null;
  agentRoster?: RealEstateAgentProfile[];
  loanOfficer?: LoanOfficerProfile;
  onSaveLead: (updatedLead: CapturedLead) => void;
  onTriggerToast?: (message: string) => void;
}

export const POPULAR_LOAN_PROGRAMS = [
  "USDA RD (0% Down)",
  "OHCS FirstHome ($15k DPA)",
  "Lakeview National (140% AMI)",
  "Stacked: USDA + OHCS FirstHome",
  "Stacked: Lakeview + DPA Grant",
  "FHA 3.5% (2/1 Rate Buydown)",
  "Conventional 97% HomeReady",
  "VA 100% Financing (Zero Down)",
  "Oregon Bond Residential Loan"
];

const LeadFundingClosingModalContent: React.FC<LeadFundingClosingModalProps & { lead: CapturedLead }> = ({
  onClose,
  lead,
  agentRoster = [],
  loanOfficer,
  onSaveLead,
  onTriggerToast
}) => {
  // Derive initial values
  const intakeDateStr = lead.createdAt ? lead.createdAt.split("T")[0] : new Date().toISOString().split("T")[0];
  const defaultCloseDate = lead.fundingClosingDate || new Date().toISOString().split("T")[0];

  // Calculate default journey days from intake to funding
  const calculateDefaultDays = (intake: string, close: string) => {
    try {
      const d1 = new Date(intake).getTime();
      const d2 = new Date(close).getTime();
      const diffDays = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
      return Math.max(1, isNaN(diffDays) ? 45 : diffDays);
    } catch {
      return 45;
    }
  };

  // Form states
  const [grossCommission, setGrossCommission] = useState<number>(
    lead.grossCommissionPaid || 11875
  );
  const [fundingDate, setFundingDate] = useState<string>(defaultCloseDate);
  const [loanAmount, setLoanAmount] = useState<number>(
    lead.fundedLoanAmount || 475000
  );
  const [loanProgram, setLoanProgram] = useState<string>(
    lead.loanProgramName || lead.desiredLoanProgram || "USDA RD (0% Down)"
  );
  const [customProgram, setCustomProgram] = useState<string>("");
  const [isCustomProgram, setIsCustomProgram] = useState<boolean>(
    Boolean(lead.loanProgramName && !POPULAR_LOAN_PROGRAMS.includes(lead.loanProgramName))
  );

  const [buyerAgent, setBuyerAgent] = useState<string>(
    lead.buyerAgentName || lead.assignedAgent || (agentRoster[0]?.name || "Partner Agent")
  );
  const [attributedAdSpend, setAttributedAdSpend] = useState<number>(
    lead.adSpendAttributed || 950
  );

  // Auto-calculated vs manual total journey days
  const autoDays = calculateDefaultDays(intakeDateStr, fundingDate);
  const [journeyDays, setJourneyDays] = useState<number>(
    lead.totalJourneyDays || autoDays
  );
  const [manualOverrideDays, setManualOverrideDays] = useState<boolean>(
    Boolean(lead.totalJourneyDays && lead.totalJourneyDays !== autoDays)
  );

  const handleFundingDateChange = (newDate: string) => {
    setFundingDate(newDate);
    if (!manualOverrideDays) {
      setJourneyDays(calculateDefaultDays(intakeDateStr, newDate));
    }
  };

  // Desired location & program fields
  const [purchaseLocation, setPurchaseLocation] = useState<string>(
    lead.desiredPurchaseLocation || lead.taggedCityArea || lead.preferredLocations || "Albany / Linn County, OR"
  );
  const [desiredProgram, setDesiredProgram] = useState<string>(
    lead.desiredLoanProgram || "Low/No Down Payment (USDA 0% or OHCS DPA)"
  );

  // ROLI calculations
  const effectiveProgram = isCustomProgram ? (customProgram || "Custom Loan Program") : loanProgram;
  const netCommission = Math.max(0, grossCommission - attributedAdSpend);
  const roliMultiplier = attributedAdSpend > 0 ? (grossCommission / attributedAdSpend) : 0;
  const netRoiPct = attributedAdSpend > 0 ? ((grossCommission - attributedAdSpend) / attributedAdSpend) * 100 : 0;

  const handleSave = () => {
    const updatedLead: CapturedLead = {
      ...lead,
      status: "closed",
      grossCommissionPaid: Number(grossCommission) || 0,
      fundingClosingDate: fundingDate,
      fundedLoanAmount: Number(loanAmount) || 0,
      loanProgramName: effectiveProgram,
      buyerAgentName: buyerAgent,
      totalJourneyDays: Number(journeyDays) || autoDays,
      desiredPurchaseLocation: purchaseLocation,
      desiredLoanProgram: desiredProgram,
      adSpendAttributed: Number(attributedAdSpend) || 0,
      roliMultiplier: Number(roliMultiplier.toFixed(2))
    };

    onSaveLead(updatedLead);
    if (onTriggerToast) {
      onTriggerToast(
        `🏆 Funding & Closing Recorded! $${Number(grossCommission).toLocaleString()} gross commission saved. ROLI: ${roliMultiplier.toFixed(1)}x over ${journeyDays} journey days.`
      );
    }
    onClose();
  };

  const handleShareWithAgent = () => {
    const shareMessage = `🤝 Co-Brand Lead Journey Milestone:\nBuyer: ${lead.fullName}\nFunded: $${Number(loanAmount).toLocaleString()} via ${effectiveProgram}\nGross Commission: $${Number(grossCommission).toLocaleString()}\nJourney Days: ${journeyDays} days\nBuyer Agent: ${buyerAgent}\nLoan Officer: ${loanOfficer?.name || "Mike Ford"}\n\nROLI Factor: ${roliMultiplier.toFixed(1)}x`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareMessage);
    }
    if (onTriggerToast) {
      onTriggerToast(`Copied verified co-brand closing milestone package to share with ${buyerAgent}!`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-[#EAE7E0] shadow-2xl overflow-hidden my-auto text-[#2D362E] animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#2D362E] via-[#3A4A3C] to-[#4A5D4E] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-[#E7C19D] text-[#2D362E] text-[10px] font-bold uppercase tracking-wider">
              True 3-System Microservices Ecosphere
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 text-[10px] font-semibold border border-emerald-400/30">
              Funding & Closing Ledger
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-display">
            Record Funded Loan &amp; Calculate Campaign ROLI
          </h2>
          <p className="text-xs text-emerald-100/90 max-w-2xl mt-1 leading-relaxed">
            Input verified loan funding metrics for <strong>{lead.fullName}</strong>. Realized gross commission, funding date, loan amount, and journey days feed directly into the enterprise 30-day, 99-day, 6-month, and 12-month ROLI performance analytics.
          </p>
        </div>

        {/* 3-System Microservices Synergy Strip */}
        <div className="bg-[#FAF9F5] border-b border-[#EAE7E0] px-6 py-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-[#EAE7E0]">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                1
              </div>
              <div className="truncate">
                <span className="text-[10px] uppercase font-bold text-[#606C5D] block">System 1: GeoSphere Map</span>
                <span className="font-semibold text-[#2D362E] truncate block text-[11px]">
                  {lead.sourcePropertyAddress || lead.taggedCityArea || "Sourced GIS Listing"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-[#EAE7E0]">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0">
                2
              </div>
              <div className="truncate">
                <span className="text-[10px] uppercase font-bold text-[#606C5D] block">System 2: FTHB Qualifier</span>
                <span className="font-semibold text-[#2D362E] truncate block text-[11px]">
                  {lead.leadPathTag || "Low/No Down Payment"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-[#EAE7E0]">
              <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs shrink-0">
                3
              </div>
              <div className="truncate">
                <span className="text-[10px] uppercase font-bold text-[#606C5D] block">System 3: Vantage AI Ad Studio</span>
                <span className="font-semibold text-[#2D362E] truncate block text-[11px]">
                  {lead.sourceCampaignName ? "Published Ad Campaign" : "Ad Brain Storyboard & Script"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
          
          {/* Main User Input Fields Grid */}
          <div className="bg-white p-5 rounded-2xl border border-[#EAE7E0] shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#4A5D4E] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#C18C5D]" />
              User Input Loan Funding &amp; Closing Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Gross Commission Paid ($) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#2D362E] flex items-center justify-between">
                  <span>Gross Commission Paid ($) *</span>
                  <span className="text-[10px] text-emerald-700 font-bold">Direct ROLI Driver</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#606C5D] font-bold text-sm">
                    $
                  </div>
                  <input
                    type="number"
                    step="50"
                    min="0"
                    value={grossCommission}
                    onChange={(e) => setGrossCommission(Number(e.target.value))}
                    placeholder="11875"
                    className="w-full pl-8 pr-3 py-2.5 bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl text-sm font-mono font-bold text-[#2D362E] focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]"
                  />
                </div>
                <span className="text-[10px] text-[#606C5D]">Actual net revenue earned by loan officer / branch</span>
              </div>

              {/* Final Loan Amount ($) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#2D362E] flex items-center justify-between">
                  <span>Final Funded Loan Amount ($) *</span>
                  <span className="text-[10px] text-[#606C5D]">Volume Stat</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#606C5D] font-bold text-sm">
                    $
                  </div>
                  <input
                    type="number"
                    step="1000"
                    min="0"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Number(e.target.value))}
                    placeholder="475000"
                    className="w-full pl-8 pr-3 py-2.5 bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl text-sm font-mono font-bold text-[#2D362E] focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]"
                  />
                </div>
                <span className="text-[10px] text-[#606C5D]">Recorded in branch production volume units</span>
              </div>

              {/* Funding + Closing Date */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#2D362E] flex items-center justify-between">
                  <span>Funding &amp; Closing Date *</span>
                  <span className="text-[10px] text-[#606C5D]">Timeframe Sorter</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={fundingDate}
                    onChange={(e) => handleFundingDateChange(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl text-sm font-medium text-[#2D362E] focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]"
                  />
                </div>
                <span className="text-[10px] text-[#606C5D]">Determines 30-day, 99-day, 6-mo, or 12-mo ROLI filter window</span>
              </div>

              {/* Total Journey Days */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-[#2D362E] flex items-center gap-1">
                    <span>Total Journey Days *</span>
                    <Clock className="w-3 h-3 text-[#C18C5D]" />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (manualOverrideDays) {
                        setJourneyDays(autoDays);
                        setManualOverrideDays(false);
                      } else {
                        setManualOverrideDays(true);
                      }
                    }}
                    className="text-[10px] font-semibold text-[#C18C5D] hover:underline"
                  >
                    {manualOverrideDays ? "Reset to Auto (Intake to Close)" : "Manual Override"}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="730"
                    value={journeyDays}
                    disabled={!manualOverrideDays}
                    onChange={(e) => setJourneyDays(Number(e.target.value))}
                    className={`w-full px-3 py-2.5 rounded-xl text-sm font-mono font-bold text-[#2D362E] border focus:outline-none focus:ring-2 focus:ring-[#4A5D4E] ${
                      manualOverrideDays ? 'bg-amber-50 border-amber-300' : 'bg-[#FAF9F5] border-[#EAE7E0]'
                    }`}
                  />
                </div>
                <span className="text-[10px] text-[#606C5D]">
                  {manualOverrideDays ? "Custom manual days active" : `Auto-calculated from intake (${intakeDateStr}) to funding date (${fundingDate})`}
                </span>
              </div>

              {/* Loan Program Name */}
              <div className="space-y-1.5 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-[#2D362E] flex items-center gap-1">
                    <span>Loan Program Name *</span>
                    <Tag className="w-3 h-3 text-[#4A5D4E]" />
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomProgram(!isCustomProgram)}
                    className="text-[10px] font-semibold text-[#4A5D4E] hover:underline"
                  >
                    {isCustomProgram ? "Pick from Program List" : "+ Enter Custom Program"}
                  </button>
                </div>

                {isCustomProgram ? (
                  <input
                    type="text"
                    value={customProgram}
                    onChange={(e) => setCustomProgram(e.target.value)}
                    placeholder="e.g. USDA Rural 502 Direct, Down Payment Grant 5%"
                    className="w-full px-3 py-2.5 bg-amber-50 border border-amber-300 rounded-xl text-sm font-medium text-[#2D362E] focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]"
                  />
                ) : (
                  <select
                    value={loanProgram}
                    onChange={(e) => setLoanProgram(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl text-sm font-medium text-[#2D362E] focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]"
                  >
                    {POPULAR_LOAN_PROGRAMS.map((prog) => (
                      <option key={prog} value={prog}>
                        {prog}
                      </option>
                    ))}
                  </select>
                )}
                <span className="text-[10px] text-[#606C5D]">Tracks production program mix (USDA 0%, OHCS $15k DPA, Lakeview 140% AMI)</span>
              </div>

              {/* Buyer Agent Partner Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#2D362E] flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#4A5D4E]" />
                  <span>Buyer Agent Partner Name *</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={buyerAgent}
                    onChange={(e) => setBuyerAgent(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    list="agent-names-list"
                    className="w-full px-3 py-2.5 bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl text-sm font-medium text-[#2D362E] focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]"
                  />
                  <datalist id="agent-names-list">
                    {agentRoster.map(a => (
                      <option key={a.id} value={a.name} />
                    ))}
                  </datalist>
                </div>
                <span className="text-[10px] text-[#606C5D]">Credited on agent partner leaderboard and co-brand reports</span>
              </div>

              {/* Attributed Ad Spend ($) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#2D362E] flex items-center justify-between">
                  <span>Attributed Campaign Ad Spend ($)</span>
                  <span className="text-[10px] text-amber-700 font-bold">ROLI Divisor</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#606C5D] font-bold text-sm">
                    $
                  </div>
                  <input
                    type="number"
                    step="25"
                    min="0"
                    value={attributedAdSpend}
                    onChange={(e) => setAttributedAdSpend(Number(e.target.value))}
                    placeholder="950"
                    className="w-full pl-8 pr-3 py-2.5 bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl text-sm font-mono font-bold text-[#2D362E] focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]"
                  />
                </div>
                <span className="text-[10px] text-[#606C5D]">Ad cost allocated to this prospect's campaign funnel</span>
              </div>

              {/* Desired Purchase Location City/Area */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#2D362E] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>Desired Purchase Location / City Area</span>
                </label>
                <input
                  type="text"
                  value={purchaseLocation}
                  onChange={(e) => setPurchaseLocation(e.target.value)}
                  placeholder="e.g. Albany, OR (Linn County)"
                  className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl text-xs font-medium text-[#2D362E]"
                />
              </div>

              {/* Desired Loan Program Needs */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#2D362E] flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>Lead Loan Program Needs</span>
                </label>
                <input
                  type="text"
                  value={desiredProgram}
                  onChange={(e) => setDesiredProgram(e.target.value)}
                  placeholder="e.g. Zero-Down USDA or OHCS DPA Grant"
                  className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl text-xs font-medium text-[#2D362E]"
                />
              </div>

            </div>
          </div>

          {/* Dynamic ROLI Performance Calculation Summary Box */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-[#FAF9F5] p-5 rounded-2xl border border-emerald-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-700" />
                Live Campaign ROLI &amp; Efficiency Multiplier
              </h4>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Verified Closed Loan Output
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
                <span className="text-[10px] text-[#606C5D] block uppercase font-bold">Gross Commission</span>
                <span className="font-mono font-bold text-base text-emerald-800">
                  ${grossCommission.toLocaleString()}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
                <span className="text-[10px] text-[#606C5D] block uppercase font-bold">Ad Spend</span>
                <span className="font-mono font-bold text-base text-[#606C5D]">
                  ${attributedAdSpend.toLocaleString()}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs ring-2 ring-emerald-500/30">
                <span className="text-[10px] text-emerald-700 block uppercase font-bold">Realized ROLI</span>
                <span className="font-mono font-black text-lg text-emerald-700">
                  {roliMultiplier.toFixed(1)}x
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
                <span className="text-[10px] text-[#606C5D] block uppercase font-bold">Speed to Fund</span>
                <span className="font-mono font-bold text-base text-[#2D362E]">
                  {journeyDays} Days
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-emerald-950/80 pt-1">
              <span>Net Profit After Ad Spend: <strong>+${netCommission.toLocaleString()}</strong> ({netRoiPct.toFixed(0)}% Net ROI)</span>
              <button
                type="button"
                onClick={handleShareWithAgent}
                className="text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1 hover:underline"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Milestone with {buyerAgent}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="bg-[#FAF9F5] p-5 border-t border-[#EAE7E0] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#EAE7E0] text-xs font-bold text-[#606C5D] hover:bg-white transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShareWithAgent}
              className="px-4 py-2.5 rounded-xl bg-white border border-[#EAE7E0] text-xs font-bold text-[#2D362E] hover:bg-[#F1EFE9] transition-colors flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5 text-[#C18C5D]" />
              <span>Copy Agent Co-Brand Text</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm shadow-[#4A5D4E]/30"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Save &amp; Sync to ROLI &amp; Production Stats</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export const LeadFundingClosingModal: React.FC<LeadFundingClosingModalProps> = (props) => {
  if (!props.isOpen || !props.lead) return null;
  return <LeadFundingClosingModalContent {...props} lead={props.lead} />;
};
