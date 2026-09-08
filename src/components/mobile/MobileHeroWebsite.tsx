import React, { useState } from "react";
import { 
  ArrowRight, 
  Sparkles, 
  DollarSign, 
  Compass, 
  Smartphone,
  ExternalLink,
  Search,
  CheckCircle2,
  Home
} from "lucide-react";
import { FinancialProfile, LoanOfficerProfile, RealEstateAgentProfile, CapturedLead, PropertyListing } from "../../types";
import { formatUSD } from "../../utils/mortgageMath";
import { LocalProfessionalGuides } from "../LocalProfessionalGuides";
import { CuratedHomesSection } from "../CuratedHomesSection";

interface MobileHeroWebsiteProps {
  profile: FinancialProfile;
  setProfile: React.Dispatch<React.SetStateAction<FinancialProfile>>;
  onOpenDashboard: () => void;
  onOpenCalculator: () => void;
  onOpenRoadmap: () => void;
  onOpenStep4?: () => void;
  onOpenLeadBot?: () => void;
  onCaptureLead?: (lead: CapturedLead) => void;
  loanOfficer?: LoanOfficerProfile;
  activeAgent?: RealEstateAgentProfile;
  isCoBranded?: boolean;
  onOpenLoPortal?: () => void;
  properties?: PropertyListing[];
}

export const MobileHeroWebsite: React.FC<MobileHeroWebsiteProps> = ({
  profile,
  onOpenCalculator,
  onOpenRoadmap,
  onOpenLeadBot,
  onCaptureLead,
  loanOfficer,
  activeAgent,
  isCoBranded = false,
  onOpenLoPortal,
  properties = [],
  onOpenDashboard,
}) => {
  const leadGenUrlwk = loanOfficer?.leadGenFormUrl || "https://portal.myhometrac.com/get-started/MFORD@CFMTG.COM";

  return (
    <div className="flex flex-col space-y-6 pb-20 bg-[#F9F8F4] dark:bg-slate-950">
      
      {/* Mobile Value Prop Banner */}
      <section className="bg-white dark:bg-slate-900 px-5 pt-8 pb-8 rounded-b-3xl shadow-sm border-b border-[#EAE7E0] dark:border-slate-800 relative overflow-hidden">
        {/* Subtle Background Elements */}
        <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-[#F1EFE9] dark:bg-slate-800 rounded-full blur-3xl pointer-events-none opacity-60" />
        
        <div className="relative z-10 space-y-5 text-center">
          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-[#F1EFE9] dark:bg-slate-800 border border-[#EAE7E0] dark:border-slate-700 text-xs font-bold shadow-xs mx-auto">
            <Sparkles className="w-3 h-3 text-[#C18C5D] animate-pulse" />
            <span className="text-[#C18C5D] uppercase tracking-widest text-[10px]">First-Time Buyers</span>
          </div>

          <h1 className="text-3xl font-serif font-bold text-[#2D362E] dark:text-slate-100 leading-tight">
            Stop Paying Rent.<br/>
            Buy with <span className="text-[#4A5D4E] dark:text-[#C18C5D]">Clarity</span>.
          </h1>

          <p className="text-sm text-[#606C5D] dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
            Find out what you can afford, uncover state DPA programs, and track real properties.
          </p>

          <div className="pt-2">
            <button
              onClick={onOpenCalculator}
              className="w-full flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-[#4A5D4E] hover:bg-[#38463B] text-white font-bold text-sm shadow-md transition-all active:scale-[0.98]"
            >
              <DollarSign className="w-4 h-4 text-[#D4A373]" />
              <span>Step 1: Calculate Buying Power</span>
              <ArrowRight className="w-4 h-4 ml-1 opacity-70" />
            </button>
          </div>
        </div>
      </section>

      {/* Primary Action Grid */}
      <section className="px-4">
        <div className="grid grid-cols-2 gap-3">
          <a
            href={leadGenUrlwk}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-[#D4A373] text-white font-bold shadow-sm active:scale-95 transition-transform"
          >
            <Smartphone className="w-6 h-6 mb-1" />
            <span className="text-[13px]">Apply Online</span>
            <ExternalLink className="w-3 h-3 opacity-60 mt-1" />
          </a>

          <button
            onClick={onOpenRoadmap}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#EAE7E0] dark:border-slate-800 text-[#4A5D4E] dark:text-slate-200 font-bold shadow-sm active:scale-95 transition-transform"
          >
            <Compass className="w-6 h-6 mb-1" />
            <span className="text-[13px]">View 10-Step Plan</span>
          </button>
        </div>

        {onOpenLeadBot && (
          <button
            onClick={onOpenLeadBot}
            className="w-full mt-3 flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-[#EAE7E0] dark:border-slate-800 text-[#2D362E] dark:text-slate-200 font-bold shadow-sm active:scale-95 transition-transform"
          >
            <Sparkles className="w-4 h-4 text-[#C18C5D]" />
            <span className="text-sm">Chat with 24/7 AI Advisor</span>
          </button>
        )}
      </section>

      {/* Ask GeoSphere Maps Search Mobile */}
      <section className="px-4">
         <div className="w-full bg-[#FAF9F5] dark:bg-slate-900 border border-[#EAE7E0] dark:border-slate-800 p-4 rounded-2xl shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="relative z-10 flex flex-col gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 text-[11px] font-bold shadow-xs border border-indigo-100 dark:border-slate-700 self-start">
                <Sparkles className="w-3 h-3" />
                <span>Ask GeoSphere AI</span>
              </div>
              <form 
                className="flex flex-col gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("GeoSphere AI Search Active!\n\n(Please open the 'Property Map Tracker' tab to view results!)");
                }}
              >
                <input 
                  type="text" 
                  placeholder="Find 3 beds under $450k near..." 
                  className="w-full px-4 py-3 rounded-xl border border-indigo-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-[#2D362E] dark:text-slate-100 placeholder:text-[#9A9488] focus:outline-none focus:border-indigo-400 shadow-xs" 
                />
                <button 
                  type="submit" 
                  className="w-full px-4 py-3 bg-indigo-600 active:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2 text-sm"
                >
                  <Search className="w-4 h-4" /> Search Maps
                </button>
              </form>
            </div>
          </div>
      </section>

      {/* Trust Signals */}
      <section className="px-4">
         <div className="grid grid-cols-1 gap-2 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-[#EAE7E0] dark:border-slate-800 shadow-sm text-xs text-[#606C5D] dark:text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#4A5D4E] shrink-0" />
              <span>FHA 3.5% & Conventional 3% Down Programs</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <CheckCircle2 className="w-4 h-4 text-[#4A5D4E] shrink-0" />
              <span>Verified Local Mortgage Pre-Approvals</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <CheckCircle2 className="w-4 h-4 text-[#4A5D4E] shrink-0" />
              <span>Property Tour Inspection Scorecards</span>
            </div>
          </div>
      </section>

      {/* Curated Eligible Homes Section */}
      <div className="px-4">
        <CuratedHomesSection
          properties={properties}
          onOpenDashboard={onOpenDashboard}
          onOpenLeadBot={onOpenLeadBot}
          onCaptureLead={onCaptureLead}
          loanOfficer={loanOfficer}
          activeAgent={activeAgent}
        />
      </div>

      {/* Local Professional Guides Section */}
      {loanOfficer && (
        <div className="px-4">
          <LocalProfessionalGuides
            loanOfficer={loanOfficer}
            activeAgent={activeAgent}
            isCoBranded={isCoBranded}
            onOpenLoPortal={onOpenLoPortal}
          />
        </div>
      )}

    </div>
  );
};
