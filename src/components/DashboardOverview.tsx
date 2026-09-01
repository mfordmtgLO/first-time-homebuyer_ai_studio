import React, { useState } from "react";
import { 
  LayoutDashboard, 
  TrendingUp, 
  Building, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  FileText, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  AlertCircle,
  Plus,
  Users,
  Calendar,
  Compass,
  RotateCcw,
  ExternalLink,
  PanelLeftOpen,
  PanelLeftClose,
  Award,
  Printer,
  Mail
} from "lucide-react";
import { FinancialProfile, PropertyListing, RoadmapMilestone, DocumentItem, LoanOfficerProfile, RealEstateAgentProfile } from "../types";
import { calculateMortgageBreakdown, formatUSD, getDTIStatus } from "../utils/mortgageMath";
import { hasAuthenticPropertyPhoto, getZillowUrl } from "../utils/overlayClassification";
import { SavingsGoalTracker } from "./SavingsGoalTracker";
import { ScreeningDisclaimerBanner } from "./ScreeningDisclaimerBanner";
import { RealTimeMortgageRateTracker } from "./RealTimeMortgageRateTracker";
import { HomebuyingPlanPrintModal } from "./HomebuyingPlanPrintModal";
import { ShareViaEmailModal } from "./ShareViaEmailModal";

interface DashboardOverviewProps {
  profile: FinancialProfile;
  setProfile?: React.Dispatch<React.SetStateAction<FinancialProfile>>;
  onUpdateSavings?: (newSavings: number) => void;
  properties: PropertyListing[];
  milestones: RoadmapMilestone[];
  documents: DocumentItem[];
  onNavigate: (tab: string, mode?: "website" | "dashboard") => void;
  onOpenNewPropertyModal: () => void;
  loanOfficer?: LoanOfficerProfile;
  activeAgent?: RealEstateAgentProfile;
  isCoBranded?: boolean;
  onOpenLoPortal?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  profile,
  setProfile,
  onUpdateSavings,
  properties,
  milestones,
  documents,
  onNavigate,
  onOpenNewPropertyModal,
  loanOfficer,
  activeAgent,
  isCoBranded = false,
  onOpenLoPortal,
  isSidebarCollapsed = false,
  onToggleSidebar,
}) => {
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const breakdown = calculateMortgageBreakdown(profile);

  const handleSavingsUpdate = (amount: number) => {
    if (onUpdateSavings) {
      onUpdateSavings(amount);
    } else if (setProfile) {
      setProfile(prev => ({ ...prev, downPaymentSavings: amount }));
    }
  };

  const handleTargetPriceUpdate = (price: number) => {
    if (setProfile) {
      setProfile(prev => ({ ...prev, targetPrice: price }));
    }
  };

  const completedTasks = milestones.flatMap(m => m.tasks).filter(t => t.done).length;
  const totalTasks = milestones.flatMap(m => m.tasks).length;
  const readinessPercent = Math.round((completedTasks / totalTasks) * 100);

  const readyDocsCount = documents.filter(d => d.status === "ready" || d.status === "submitted").length;
  const touringHomes = properties.filter(p => p.status === "touring" || p.status === "saved");
  const offeredHomes = properties.filter(p => p.status === "offered" || p.status === "under_contract");

  return (
    <div className="space-y-8">
      {/* Dashboard Top Hero Greeting */}
      <div className="bg-white rounded-3xl border border-[#EAE7E0] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1EFE9] text-[#4A5D4E] text-xs font-semibold border border-[#EAE7E0]">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Homebuyer Command Center</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D362E]">
            Welcome to Your Homebuying Workspace
          </h2>
          <p className="text-xs sm:text-sm text-[#606C5D] max-w-2xl">
            You are actively tracking <strong className="text-[#2D362E]">{properties.length} properties</strong> and are <strong className="text-[#4A5D4E]">{readinessPercent}% ready</strong> for closing day.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F9F8F4] hover:bg-[#F1EFE9] text-[#4A5D4E] font-semibold text-xs border border-[#EAE7E0] transition-colors cursor-pointer"
              title={isSidebarCollapsed ? "Expand Sidebar Navigation" : "Collapse Sidebar"}
            >
              {isSidebarCollapsed ? (
                <>
                  <PanelLeftOpen className="w-4 h-4 text-[#4A5D4E]" />
                  <span>Expand Sidebar</span>
                </>
              ) : (
                <>
                  <PanelLeftClose className="w-4 h-4 text-[#606C5D]" />
                  <span>Collapse Sidebar</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#F1EFE9] text-[#4A5D4E] font-semibold text-xs border border-[#4A5D4E] transition-colors cursor-pointer shadow-2xs"
            title="Send your Homebuying Roadmap & Saved Properties to your email"
          >
            <Mail className="w-4 h-4 text-[#4A5D4E]" />
            <span>Share via Email</span>
          </button>

          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#F1EFE9] text-[#2D362E] font-semibold text-xs border border-[#EAE7E0] transition-colors cursor-pointer shadow-2xs"
            title="Print your customized Homebuying Plan, Milestones & Property Notes"
          >
            <Printer className="w-4 h-4 text-[#4A5D4E]" />
            <span>Print Plan & Notes</span>
          </button>

          <button
            onClick={onOpenNewPropertyModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white font-semibold text-xs shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Property to Tour</span>
          </button>

          <button
            onClick={() => onNavigate("ai_copilot", "dashboard")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#F1EFE9] text-[#4A5D4E] font-semibold text-xs border border-[#EAE7E0] transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#C18C5D]" />
            <span>AI Advisor</span>
          </button>
        </div>
      </div>

      {/* Official Screening Aid & Snapshot Disclaimer Banner */}
      <ScreeningDisclaimerBanner variant="full" />

      {/* 4-Stat Metric Cards */}
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible hide-scrollbar">
        {/* Card 1: Readiness Score */}
        <div 
          onClick={() => onNavigate("roadmap", "website")}
          className="cursor-pointer bg-white hover:bg-[#F9F8F4] border border-[#EAE7E0] hover:border-[#4A5D4E] rounded-2xl p-5 space-y-3 transition-all shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9A9488] font-semibold">Buyer Readiness Score</span>
            <div className="w-8 h-8 rounded-lg bg-[#F1EFE9] text-[#4A5D4E] border border-[#EAE7E0] flex items-center justify-center font-bold text-xs">
              {readinessPercent}%
            </div>
          </div>
          <div className="text-2xl font-bold text-[#2D362E]">
            {completedTasks} / {totalTasks}
            <span className="text-xs font-normal text-[#9A9488] ml-1.5">tasks done</span>
          </div>
          <div className="w-full h-1.5 bg-[#EAE7E0] rounded-full overflow-hidden">
            <div style={{ width: `${readinessPercent}%` }} className="h-full bg-[#4A5D4E]" />
          </div>
        </div>

        {/* Card 2: Max Safe Price */}
        {(() => {
          const dtiStatus = getDTIStatus(breakdown.backEndDTI);
          return (
            <div 
              onClick={() => onNavigate("calculator", "website")}
              className="cursor-pointer bg-white hover:bg-[#F9F8F4] border border-[#EAE7E0] hover:border-[#4A5D4E] rounded-2xl p-5 space-y-3 transition-all shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#9A9488] font-semibold">Max Safe Home Price</span>
                <div className="w-8 h-8 rounded-lg bg-[#F1EFE9] text-[#4A5D4E] border border-[#EAE7E0] flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-bold text-[#2D362E]">
                {formatUSD(breakdown.maxSafePriceConservative)}
              </div>
              {dtiStatus.isIneligible ? (
                <span className="text-[11px] text-black flex items-center gap-1 font-bold">
                  <AlertCircle className="w-3 h-3 text-red-600" />
                  <span className="line-through decoration-red-600 decoration-2">
                    Back-End DTI {breakdown.backEndDTI}% (most loan programs ineligible over 50% DTI)
                  </span>
                </span>
              ) : dtiStatus.isHigh ? (
                <span className="text-[11px] text-red-600 flex items-center gap-1 font-bold">
                  <AlertCircle className="w-3 h-3 text-red-600" /> Back-End DTI {breakdown.backEndDTI}% (High)
                </span>
              ) : (
                <span className={`text-[11px] flex items-center gap-1 font-semibold ${dtiStatus.colorClass}`}>
                  <CheckCircle2 className="w-3 h-3" /> Back-End DTI {breakdown.backEndDTI}% ({dtiStatus.label})
                </span>
              )}
            </div>
          );
        })()}

        {/* Card 3: Saved & Touring Homes */}
        <div 
          onClick={() => onNavigate("properties", "dashboard")}
          className="cursor-pointer bg-white hover:bg-[#F9F8F4] border border-[#EAE7E0] hover:border-[#4A5D4E] rounded-2xl p-5 space-y-3 transition-all shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9A9488] font-semibold">Properties Pipeline</span>
            <div className="w-8 h-8 rounded-lg bg-[#F1EFE9] text-[#4A5D4E] border border-[#EAE7E0] flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#2D362E]">
            {properties.length}
            <span className="text-xs font-normal text-[#9A9488] ml-1.5">
              ({offeredHomes.length} active offer)
            </span>
          </div>
          <span className="text-[11px] text-[#606C5D] block">
            {touringHomes.length} saved for upcoming walkthroughs
          </span>
        </div>

        {/* Card 4: Step 4 AI Action Plan */}
        <div 
          onClick={() => onNavigate("step4_ai_plan", "dashboard")}
          className="cursor-pointer bg-white hover:bg-[#F9F8F4] border border-[#EAE7E0] hover:border-[#4A5D4E] rounded-2xl p-5 space-y-3 transition-all shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#9A9488] font-semibold">Step 4: AI Strategic Plan</span>
            <div className="w-8 h-8 rounded-lg bg-[#F1EFE9] text-[#C18C5D] border border-[#EAE7E0] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#2D362E]">
            Step 4
            <span className="text-xs font-normal text-[#9A9488] ml-1.5">Action Plan</span>
          </div>
          <span className="text-[11px] text-[#4A5D4E] font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#4A5D4E]" /> AI recommendations & local guides
          </span>
        </div>
      </div>

      {/* Savings Goal Tracker Component */}
      <SavingsGoalTracker
        profile={profile}
        onUpdateSavings={handleSavingsUpdate}
        onUpdateTargetPrice={handleTargetPriceUpdate}
        onNavigate={onNavigate}
      />

      {/* Real-Time Search-Grounded National Mortgage Rate Tracker (Dashboard Users Only) */}
      <RealTimeMortgageRateTracker
        profile={profile}
        setProfile={setProfile}
        onNavigate={onNavigate}
      />

      {/* Main Grid: Pipeline Preview & Quick Action Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Property Watchlist Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#2D362E] flex items-center gap-2">
              <Building className="w-4 h-4 text-[#4A5D4E]" />
              <span>Active Property Pipeline</span>
            </h3>
            <button
              onClick={() => onNavigate("properties", "dashboard")}
              className="text-xs font-semibold text-[#4A5D4E] hover:text-[#2D362E] flex items-center gap-1"
            >
              <span>View All ({properties.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {properties.slice(0, 3).map((property) => (
              <div
                key={property.id}
                onClick={() => onNavigate("properties", "dashboard")}
                className="group cursor-pointer bg-white hover:bg-[#F9F8F4] rounded-2xl border border-[#EAE7E0] hover:border-[#DEDAD2] p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all shadow-sm"
              >
                {hasAuthenticPropertyPhoto(property) ? (
                  <img
                    src={property.imageUrl}
                    alt={property.title}
                    className="w-full sm:w-24 h-20 object-cover rounded-xl shrink-0"
                  />
                ) : (
                  <div className="w-full sm:w-20 h-16 bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl flex flex-col items-center justify-center text-[#4A5D4E] shrink-0 p-2 text-center group-hover:border-[#4A5D4E]/40 transition-colors">
                    <Building className="w-5 h-5 mb-1 text-[#4A5D4E]" />
                    <span className="text-[9px] font-bold text-[#606C5D] truncate max-w-full">{property.propertyType}</span>
                  </div>
                )}

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      property.status === "offered" 
                        ? "bg-[#C18C5D]/10 text-[#C18C5D] border border-[#C18C5D]/20" 
                        : property.status === "touring"
                        ? "bg-[#4A5D4E]/10 text-[#4A5D4E] border border-[#4A5D4E]/20"
                        : "bg-[#F1EFE9] text-[#606C5D] border border-[#EAE7E0]"
                    }`}>
                      {property.status}
                    </span>
                    {property.scorecard && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F1EFE9] text-[#4A5D4E] border border-[#EAE7E0]">
                        Grade {property.scorecard.grade} ({property.scorecard.overallRating}/10)
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-sm text-[#2D362E] truncate group-hover:text-[#4A5D4E] transition-colors">
                    {property.title}
                  </h4>
                  <p className="text-xs text-[#606C5D] truncate">
                    {property.address}, {property.city}, {property.state}
                  </p>
                </div>

                <div className="text-right shrink-0 sm:self-center flex flex-col sm:items-end gap-1.5">
                  <div className="text-sm font-bold text-[#2D362E]">
                    {formatUSD(property.price)}
                  </div>
                  <span className="text-[11px] text-[#9A9488]">
                    {property.beds}b • {property.baths}ba • {property.sqft} sqft
                  </span>
                  <a
                    href={getZillowUrl(property)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold border border-blue-200 transition-colors"
                    title={`Open ${property.address} live on Zillow.com`}
                  >
                    <span>Zillow</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: AI & Strategy Quick-Launch Hub */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-base font-bold text-[#2D362E] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C18C5D]" />
            <span>AI Copilot & Fast Actions</span>
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {/* Action 1: Offer Strategist */}
            <div
              onClick={() => onNavigate("ai_copilot", "dashboard")}
              className="cursor-pointer bg-white hover:bg-[#F9F8F4] rounded-2xl border border-[#EAE7E0] hover:border-[#4A5D4E] p-4 flex items-center justify-between gap-3 transition-all shadow-sm"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#F1EFE9] text-[#4A5D4E] border border-[#EAE7E0] flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-[#C18C5D]" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#2D362E]">Offer Strategy Generator</h4>
                  <p className="text-xs text-[#606C5D]">Craft competitive offer prices, EMD, and seller concessions.</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#9A9488]" />
            </div>

            {/* Action 2: Inspection Audit */}
            <div
              onClick={() => onNavigate("ai_copilot", "dashboard")}
              className="cursor-pointer bg-white hover:bg-[#F9F8F4] rounded-2xl border border-[#EAE7E0] hover:border-[#4A5D4E] p-4 flex items-center justify-between gap-3 transition-all shadow-sm"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#F1EFE9] text-[#4A5D4E] border border-[#EAE7E0] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#2D362E]">Inspection Punchlist Triage</h4>
                  <p className="text-xs text-[#606C5D]">Paste defects to get repair costs & seller credit letters.</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#9A9488]" />
            </div>

            {/* Action 3: Mortgage Amortization & Early Payoff */}
            <div
              onClick={() => onNavigate("mortgagelab", "dashboard")}
              className="cursor-pointer bg-white hover:bg-[#F9F8F4] rounded-2xl border border-[#EAE7E0] hover:border-[#4A5D4E] p-4 flex items-center justify-between gap-3 transition-all shadow-sm"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#F1EFE9] text-[#4A5D4E] border border-[#EAE7E0] flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#2D362E]">Mortgage & Rent vs Buy Lab</h4>
                  <p className="text-xs text-[#606C5D]">See 10-year equity projections & extra payment savings.</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#9A9488]" />
            </div>

            {/* Action 4: 30-Day Escrow Closing Countdown */}
            <div
              onClick={() => onNavigate("escrow", "dashboard")}
              className="cursor-pointer bg-white hover:bg-[#F9F8F4] rounded-2xl border border-[#EAE7E0] hover:border-[#4A5D4E] p-4 flex items-center justify-between gap-3 transition-all shadow-sm"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#F1EFE9] text-[#4A5D4E] border border-[#EAE7E0] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#2D362E]">30-Day Escrow Tracker</h4>
                  <p className="text-xs text-[#606C5D]">Critical deadlines, wiring safety, and CTC milestones.</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#9A9488]" />
            </div>

            {/* Action 5: Step 4 AI Plan & Local Professional Guides */}
            {loanOfficer && activeAgent && (
              <div
                onClick={() => onNavigate("step4_ai_plan", "dashboard")}
                className="cursor-pointer bg-[#FAF9F5] hover:bg-[#F5F2EA] rounded-2xl border-2 border-[#4A5D4E] p-4 flex items-center justify-between gap-3 transition-all shadow-sm group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#4A5D4E] text-[#D4A373] flex items-center justify-center shrink-0 shadow-2xs font-bold text-xs">
                    04
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-sm text-[#2D362E] group-hover:text-[#4A5D4E] transition-colors">
                        Step 4: AI Plan & Local Guides
                      </h4>
                      <span className="text-[10px] bg-[#4A5D4E] text-white px-1.5 py-0.2 rounded-full font-bold">
                        Next Step
                      </span>
                    </div>
                    <p className="text-xs text-[#606C5D]">
                      {isCoBranded && activeAgent 
                        ? `Paired with ${loanOfficer.name} (LO) & ${activeAgent.name} (Agent).`
                        : `Dedicated Mortgage Specialist: ${loanOfficer.name} (LO).`}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#4A5D4E] group-hover:translate-x-1 transition-transform" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Guided 4-Step Flow: Proceed to Step 4 Navigation Card */}
      <div className="bg-gradient-to-br from-[#2D362E] to-[#1E251F] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#4A5D4E]/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#4A5D4E]/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Step 3 Active: Buyer Dashboard & Command Center
              </span>
              <span className="text-xs text-[#DEDAD2]">Next Up in Your Homebuyer Journey</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white leading-tight">
              Ready for Step 4: AI Plan & Local Professional Alignment?
            </h3>

            <p className="text-xs sm:text-sm text-[#DEDAD2] leading-relaxed">
              Synthesize your complete purchasing scenario into actionable next steps and connect directly with your dedicated Loan Officer {loanOfficer ? `(${loanOfficer.name})` : ""}{isCoBranded && activeAgent ? ` and Real Estate Agent (${activeAgent.name})` : ""}.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              type="button"
              id="step3-back-to-step2-btn"
              onClick={() => onNavigate("roadmap", "website")}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#DEDAD2] hover:text-white text-xs font-semibold border border-white/15 transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4 text-[#D4A373]" />
              <span>← Back to Step 2 (Roadmap)</span>
            </button>

            <button
              type="button"
              id="step3-proceed-to-step4-btn"
              onClick={() => onNavigate("step4_ai_plan", "dashboard")}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#C18C5D] hover:bg-[#A87448] active:scale-[0.99] text-white font-bold text-sm shadow-lg transition-all cursor-pointer group"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>Continue to Step 4: AI Plan & Local Guides</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Printable Master Plan & Property Field Notes Modal */}
      <HomebuyingPlanPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        profile={profile}
        milestones={milestones}
        properties={properties}
        documents={documents}
        loanOfficer={loanOfficer}
        activeAgent={activeAgent}
        isCoBranded={isCoBranded}
      />

      {/* Share Roadmap & Saved Properties via Email Modal */}
      <ShareViaEmailModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        profile={profile}
        milestones={milestones}
        properties={properties}
        documents={documents}
        loanOfficer={loanOfficer}
        activeAgent={activeAgent}
      />
    </div>
  );
};
