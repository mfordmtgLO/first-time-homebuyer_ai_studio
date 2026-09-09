import React from "react";
import { 
  ArrowRight, 
  Sparkles, 
  DollarSign, 
  Compass, 
  Smartphone,
  ExternalLink,
  Search,
  CheckCircle2,
  MessageCircle,
  Home,
  MapPin,
  TrendingUp,
  Award,
  Zap
} from "lucide-react";
import { FinancialProfile, LoanOfficerProfile, RealEstateAgentProfile, CapturedLead, PropertyListing } from "../../types";
import { formatUSD } from "../../utils/mortgageMath";

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
    <div className="flex flex-col space-y-5 pb-24 bg-[#F9F8F4] dark:bg-slate-950 min-h-[100dvh] font-sans">
      
      {/* 1. App-Like Welcome / Quick Action Header */}
      <section className="bg-white dark:bg-slate-900 px-5 pt-6 pb-8 rounded-b-[2rem] shadow-sm border-b border-[#EAE7E0] dark:border-slate-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-[#9A9488] font-medium mb-0.5">Welcome to</p>
            <h1 className="text-2xl font-extrabold text-[#2D362E] dark:text-white tracking-tight">
              Homebuyer <span className="text-[#4A5D4E]">Roadmap</span>
            </h1>
          </div>
          <div className="w-12 h-12 bg-[#F1EFE9] dark:bg-slate-800 rounded-full flex items-center justify-center shrink-0 border border-[#EAE7E0] dark:border-slate-700">
            <Home className="w-6 h-6 text-[#C18C5D]" />
          </div>
        </div>

        {/* Primary Call to Action - Gamified */}
        <button
          onClick={onOpenCalculator}
          className="relative w-full overflow-hidden flex flex-col items-start gap-3 p-5 rounded-2xl bg-[#4A5D4E] hover:bg-[#38463B] shadow-lg active:scale-95 transition-transform cursor-pointer"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-[#D4A373]" />
            Step 1
          </div>
          <div className="text-left">
            <h3 className="text-xl font-bold text-white mb-1">Check Buying Power</h3>
            <p className="text-sm text-[#D1DDD3]">Find out what you can afford, instantly.</p>
          </div>
          <div className="w-full flex justify-end mt-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
          </div>
        </button>
      </section>

      {/* 2. Interactive AI Search Input */}
      <section className="px-4">
         <div className="w-full bg-white dark:bg-slate-900 border border-[#EAE7E0] dark:border-slate-800 p-1.5 rounded-2xl shadow-sm flex items-center gap-2">
            <div className="pl-3 py-2 flex items-center justify-center shrink-0">
              <Search className="w-5 h-5 text-[#9A9488]" />
            </div>
            <form 
              className="flex-1"
              onSubmit={(e) => {
                e.preventDefault();
                alert("GeoSphere AI Search Active!\n\n(Please open the 'Homes' tab to view results!)");
              }}
            >
              <input 
                 type="text" 
                 placeholder="Search '3 beds under $450k'..." 
                 className="w-full py-2.5 bg-transparent text-[15px] font-medium text-[#2D362E] dark:text-slate-100 placeholder:text-[#9A9488] focus:outline-none" 
               />
            </form>
            {onOpenLeadBot && (
              <button 
                onClick={onOpenLeadBot}
                className="shrink-0 p-2.5 mr-1 bg-[#F1EFE9] hover:bg-[#EAE7E0] dark:bg-slate-800 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                title="Ask AI Advisor"
              >
                <MessageCircle className="w-5 h-5 text-[#C18C5D]" />
              </button>
            )}
         </div>
      </section>

      {/* 3. Quick Action Grid (App Style) */}
      <section className="px-4">
        <h3 className="text-[13px] font-bold text-[#606C5D] dark:text-slate-400 mb-3 px-1 uppercase tracking-wider">
          Shortcuts
        </h3>
        <div className="grid grid-cols-4 gap-3">
          <button onClick={onOpenRoadmap} className="flex flex-col items-center gap-2 group cursor-pointer">
            <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-[1.25rem] border border-[#EAE7E0] dark:border-slate-800 shadow-sm flex items-center justify-center active:scale-90 transition-transform">
              <Compass className="w-6 h-6 text-[#4A5D4E]" />
            </div>
            <span className="text-[11px] font-semibold text-[#2D362E] dark:text-slate-300">Plan</span>
          </button>
          
          <button onClick={onOpenDashboard} className="flex flex-col items-center gap-2 group cursor-pointer">
            <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-[1.25rem] border border-[#EAE7E0] dark:border-slate-800 shadow-sm flex items-center justify-center active:scale-90 transition-transform">
              <TrendingUp className="w-6 h-6 text-[#C18C5D]" />
            </div>
            <span className="text-[11px] font-semibold text-[#2D362E] dark:text-slate-300">Market</span>
          </button>
          
          <a href={leadGenUrlwk} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group cursor-pointer">
            <div className="w-14 h-14 bg-[#D4A373] rounded-[1.25rem] shadow-sm flex items-center justify-center active:scale-90 transition-transform">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <span className="text-[11px] font-semibold text-[#2D362E] dark:text-slate-300">Apply</span>
          </a>

          {onOpenLeadBot && (
            <button onClick={onOpenLeadBot} className="flex flex-col items-center gap-2 group cursor-pointer">
              <div className="w-14 h-14 bg-[#FAF9F5] dark:bg-slate-800 rounded-[1.25rem] border border-[#DCD7CD] dark:border-slate-700 shadow-sm flex items-center justify-center active:scale-90 transition-transform">
                <Zap className="w-6 h-6 text-[#4A5D4E]" />
              </div>
              <span className="text-[11px] font-semibold text-[#2D362E] dark:text-slate-300">AI Guide</span>
            </button>
          )}
        </div>
      </section>

      {/* 4. Local Expert / Trust Card */}
      <section className="px-4">
        <div className="w-full bg-white dark:bg-slate-900 border border-[#EAE7E0] dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden p-5 flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-[#F1EFE9] border-2 border-white shadow-sm overflow-hidden shrink-0">
              {loanOfficer?.profileImageUrl ? (
                <img src={loanOfficer.profileImageUrl} alt="Expert" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#EAE7E0] text-[#606C5D] font-bold text-xl">
                  {loanOfficer?.name?.charAt(0) || "M"}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-bold uppercase tracking-wider mb-1">
                <CheckCircle2 className="w-3 h-3" />
                Verified Local Guide
              </div>
              <h4 className="text-base font-bold text-[#2D362E] leading-tight">
                {loanOfficer?.name || "Mike Ford"}
              </h4>
              <p className="text-xs text-[#606C5D] mt-0.5 font-medium">NMLS #{loanOfficer?.nmls || "288455"}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-1">
            <a 
              href={leadGenUrlwk}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 rounded-xl bg-[#4A5D4E] active:bg-[#38463B] text-white font-bold text-xs text-center transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5" />
              Get Approved
            </a>
            <button 
              onClick={onOpenLeadBot}
              className="w-full py-2.5 rounded-xl bg-[#F9F8F4] active:bg-[#F1EFE9] border border-[#EAE7E0] text-[#4A5D4E] font-bold text-xs text-center transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Ask a Question
            </button>
          </div>
        </div>
      </section>

      {/* 5. Clean Feature List */}
      <section className="px-6 py-4">
        <h3 className="text-lg font-bold text-[#2D362E] dark:text-slate-100 mb-4">Why use this app?</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#EBF3ED] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-[#2F5738]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#2D362E] dark:text-slate-200">100% Free & Transparent</h4>
              <p className="text-xs text-[#606C5D] dark:text-slate-400 mt-0.5">No paywalls. No hidden fees. Just clear data.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FDF0E6] flex items-center justify-center shrink-0">
              <Award className="w-4 h-4 text-[#91461A]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#2D362E] dark:text-slate-200">No SSN Required</h4>
              <p className="text-xs text-[#606C5D] dark:text-slate-400 mt-0.5">Explore scenarios and buying power with zero credit impact.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#EAE7E0] dark:bg-slate-800 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-[#606C5D] dark:text-slate-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#2D362E] dark:text-slate-200">Live Property Match</h4>
              <p className="text-xs text-[#606C5D] dark:text-slate-400 mt-0.5">Search MLS homes mapped directly to your buying power.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
