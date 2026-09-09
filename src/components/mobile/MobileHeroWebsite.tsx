import React from "react";
import { 
  ArrowRight, 
  Sparkles, 
  Compass, 
  MessageSquareCode,
  CheckCircle2,
  Lock,
  ExternalLink,
  Search,
  ShieldCheck,
  Smartphone
} from "lucide-react";
import { FinancialProfile, LoanOfficerProfile, RealEstateAgentProfile, CapturedLead, PropertyListing } from "../../types";

interface MobileHeroWebsiteProps {
  profile: FinancialProfile;
  setProfile: React.Dispatch<React.SetStateAction<FinancialProfile>>;
  onOpenDashboard: () => void;
  onOpenProperties?: () => void;
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
  onOpenCalculator,
  onOpenRoadmap,
  onOpenLeadBot,
  loanOfficer,
  onOpenDashboard,
  onOpenProperties,
}) => {
  const leadGenUrlwk = loanOfficer?.leadGenFormUrl || "https://portal.myhometrac.com/get-started/MFORD@CFMTG.COM";

  return (
    <div className="flex flex-col justify-between min-h-[calc(100dvh-5rem)] px-5 pt-5 pb-8 bg-[#F9F8F4] dark:bg-slate-950 font-sans">
      
      {/* Top Brand Badge & Hook */}
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAE7E0] dark:bg-slate-800 text-[#4A5D4E] dark:text-[#D4A373] text-[11px] font-bold tracking-wide shadow-xs mx-auto">
          <Sparkles className="w-3.5 h-3.5 text-[#C18C5D] animate-pulse" />
          <span>2026 First-Time Buyer Guide</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-serif font-black text-[#2D362E] dark:text-white tracking-tight leading-[1.15]">
          How much home <br />
          <span className="text-[#4A5D4E] dark:text-[#D4A373]">can you afford?</span>
        </h1>

        <p className="text-sm text-[#606C5D] dark:text-slate-400 max-w-xs mx-auto leading-normal font-medium">
          Get your monthly payment, price range, and down payment grant options in 60 seconds.
        </p>
      </div>

      {/* Main Single-Tap Conversion Action Center */}
      <div className="my-auto py-5 space-y-3">
        
        {/* Primary Single-Tap: Instant Affordability Calculator */}
        <button
          id="mobile-single-tap-calculator-btn"
          type="button"
          onClick={onOpenCalculator}
          className="relative w-full group overflow-hidden flex flex-col p-5 rounded-2xl bg-[#4A5D4E] hover:bg-[#3d4d40] active:scale-[0.98] transition-all duration-100 shadow-lg text-left cursor-pointer border border-[#38463B] select-none touch-manipulation"
        >
          {/* Subtle Ambient Background Highlight */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-[#C18C5D]/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />

          <div className="flex items-center justify-between w-full mb-2.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-xs">
              <Sparkles className="w-3 h-3 text-[#D4A373]" />
              Single-Tap Entry
            </span>
            <span className="text-[11px] text-[#E0E7E1] font-semibold flex items-center gap-1">
              <Lock className="w-3 h-3 text-white/70" /> No SSN Required
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-tight">
                Calculate Instant Affordability
              </h2>
              <p className="text-xs text-[#D1DDD3] mt-0.5">
                Sliders for income, debts & monthly budget
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0 text-white group-hover:translate-x-0.5 group-active:scale-90 transition-transform duration-100">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </button>

        {/* Co-Primary Single-Tap: Guided AI Journey */}
        {onOpenLeadBot && (
          <button
            id="mobile-single-tap-ai-journey-btn"
            type="button"
            onClick={onOpenLeadBot}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-[#EAE7E0] dark:border-slate-800 hover:border-[#DCD7CD] shadow-sm active:scale-[0.98] transition-all duration-100 text-left cursor-pointer group select-none touch-manipulation"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FAF9F5] dark:bg-slate-800 border border-[#EAE7E0] dark:border-slate-700 flex items-center justify-center text-[#C18C5D] shrink-0 group-active:scale-95 transition-transform duration-100">
                <MessageSquareCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#2D362E] dark:text-slate-100 leading-snug">
                  Start Guided AI Chat Journey
                </h3>
                <p className="text-xs text-[#606C5D] dark:text-slate-400">
                  Ask questions, check rates & pre-qualify 24/7
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#9A9488] group-hover:text-[#4A5D4E] group-hover:translate-x-0.5 transition-all duration-100 shrink-0 ml-2" />
          </button>
        )}

        {/* Micro Trust Bar */}
        <div className="flex items-center justify-center gap-3 pt-1 text-[11px] font-semibold text-[#606C5D] dark:text-slate-400">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#4A5D4E] dark:text-emerald-400" />
            100% Free
          </span>
          <span className="text-[#DCD7CD]">•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#4A5D4E] dark:text-emerald-400" />
            Zero Credit Impact
          </span>
          <span className="text-[#DCD7CD]">•</span>
          <span>FHA & Conv.</span>
        </div>
      </div>

      {/* Bottom Section: Verified Local Officer & Quick Explorers */}
      <div className="space-y-3.5 pt-2 border-t border-[#EAE7E0]/80 dark:border-slate-800">
        
        {/* Compact Loan Officer Card */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-[#EAE7E0] dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FAF9F5] border border-[#EAE7E0] overflow-hidden shrink-0 flex items-center justify-center font-bold text-[#4A5D4E] text-sm">
              {loanOfficer?.profileImageUrl ? (
                <img src={loanOfficer.profileImageUrl} alt={loanOfficer.name} className="w-full h-full object-cover" />
              ) : (
                loanOfficer?.name?.charAt(0) || "M"
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#2D362E] dark:text-slate-200">
                  {loanOfficer?.name || "Mike Ford"}
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  NMLS #{loanOfficer?.nmls || "288455"}
                </span>
              </div>
              <p className="text-[11px] text-[#9A9488]">Verified Local Lending Advisor</p>
            </div>
          </div>

          <a
            href={leadGenUrlwk}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-[#FAF9F5] hover:bg-[#EAE7E0] active:bg-[#E2DDD5] active:scale-95 dark:bg-slate-800 text-[#4A5D4E] dark:text-slate-200 text-xs font-bold border border-[#EAE7E0] dark:border-slate-700 flex items-center gap-1 shrink-0 transition-all duration-100 select-none touch-manipulation cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#C18C5D]" />
            <span>Apply</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        </div>

        {/* Secondary Exploration Pills (Compact) */}
        <div className="flex items-center justify-center gap-3 text-xs font-medium text-[#606C5D] dark:text-slate-400">
          <button
            onClick={onOpenRoadmap}
            className="flex items-center gap-1.5 hover:text-[#4A5D4E] active:scale-95 active:text-[#4A5D4E] cursor-pointer transition-all duration-100 select-none touch-manipulation py-1 px-1.5 rounded-md"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>10-Step Roadmap</span>
          </button>
          <span>•</span>
          <button
            onClick={onOpenProperties || onOpenDashboard}
            className="flex items-center gap-1.5 hover:text-[#4A5D4E] active:scale-95 active:text-[#4A5D4E] cursor-pointer transition-all duration-100 select-none touch-manipulation py-1 px-1.5 rounded-md"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Browse Homes</span>
          </button>
        </div>

      </div>

    </div>
  );
};
