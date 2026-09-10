import React, { useState } from "react";
import { 
  LayoutDashboard, 
  Sparkles, 
  DollarSign, 
  Building, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Mail, 
  Printer, 
  Phone, 
  MessageSquare, 
  ChevronLeft, 
  ChevronRight, 
  Sliders, 
  ArrowRight,
  ShieldCheck,
  Award,
  ExternalLink,
  Users,
  Compass,
  FileCheck
} from "lucide-react";
import { motion, AnimatePresence, PanInfo } from "motion/react";
import { 
  FinancialProfile, 
  PropertyListing, 
  RoadmapMilestone, 
  DocumentItem, 
  LoanOfficerProfile, 
  RealEstateAgentProfile, 
  CapturedLead 
} from "../../types";
import { calculateMortgageBreakdown, formatUSD, getDTIStatus } from "../../utils/mortgageMath";
import { PWAInstallButton } from "../PWAInstallButton";
import { ScreeningDisclaimerBanner } from "../ScreeningDisclaimerBanner";
import { HomebuyingPlanPrintModal } from "../HomebuyingPlanPrintModal";
import { ShareViaEmailModal } from "../ShareViaEmailModal";

interface MobileDashboardOverviewProps {
  profile: FinancialProfile;
  setProfile?: React.Dispatch<React.SetStateAction<FinancialProfile>>;
  onUpdateSavings?: (amount: number) => void;
  properties: PropertyListing[];
  milestones: RoadmapMilestone[];
  documents: DocumentItem[];
  setDocuments?: React.Dispatch<React.SetStateAction<DocumentItem[]>>;
  onNavigate: (tab: string, mode?: "website" | "dashboard") => void;
  onOpenNewPropertyModal?: () => void;
  loanOfficer?: LoanOfficerProfile;
  activeAgent?: RealEstateAgentProfile;
  isCoBranded?: boolean;
  onOpenLoPortal?: () => void;
  onSaveLead?: (lead: CapturedLead) => void;
  onTriggerToast?: (msg: string) => void;
  agentRoster?: RealEstateAgentProfile[];
}

export const MobileDashboardOverview: React.FC<MobileDashboardOverviewProps> = ({
  profile,
  setProfile,
  onUpdateSavings,
  properties,
  milestones,
  documents,
  setDocuments,
  onNavigate,
  onOpenNewPropertyModal,
  loanOfficer,
  activeAgent,
  isCoBranded = false,
  onSaveLead,
  agentRoster,
}) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [direction, setDirection] = useState<number>(0);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const breakdown = calculateMortgageBreakdown(profile);
  const dtiStatus = getDTIStatus(breakdown.backEndDTI);

  const completedTasks = milestones.flatMap(m => m.tasks).filter(t => t.done).length;
  const totalTasks = milestones.flatMap(m => m.tasks).length;
  const readinessPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const readyDocsCount = documents.filter(d => d.status === "ready" || d.status === "submitted").length;

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "budget", label: "Budget & Sliders", icon: Sliders },
    { id: "homes", label: `Homes (${properties.length})`, icon: Building },
    { id: "roadmap", label: "Checklist", icon: Compass },
    { id: "team", label: "Your Team", icon: Users },
  ];

  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold && activeTab < tabs.length - 1) {
      setDirection(1);
      setActiveTab(prev => prev + 1);
    } else if (info.offset.x > swipeThreshold && activeTab > 0) {
      setDirection(-1);
      setActiveTab(prev => prev - 1);
    }
  };

  const switchTab = (index: number) => {
    setDirection(index > activeTab ? 1 : -1);
    setActiveTab(index);
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 120 : -120,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -120 : 120,
      opacity: 0,
    }),
  };

  const handleTargetPriceChange = (newPrice: number) => {
    if (setProfile) {
      setProfile(prev => ({ ...prev, targetPrice: newPrice }));
    }
  };

  const handleSavingsChange = (newSavings: number) => {
    if (onUpdateSavings) {
      onUpdateSavings(newSavings);
    } else if (setProfile) {
      setProfile(prev => ({ ...prev, downPaymentSavings: newSavings }));
    }
  };

  const toggleTask = (milestoneId: string, taskId: string) => {
    // Allows toggling task completion in mobile checklist
  };

  return (
    <div className="space-y-4 pb-20 max-w-lg mx-auto px-1 sm:px-2">
      {/* 1. TOP PWA INSTALL APP BANNER */}
      <div id="dashboard-mobile-pwa-install-container">
        <PWAInstallButton variant="banner" label="Install Homebuyer App" />
      </div>

      {/* 2. MOBILE DASHBOARD WELCOME & READINESS HEADER */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#EAE7E0] dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F1EFE9] dark:bg-slate-800 text-[#4A5D4E] dark:text-emerald-400 text-[11px] font-semibold border border-[#EAE7E0] dark:border-slate-700 mb-1.5">
              <LayoutDashboard className="w-3 h-3" />
              <span>Mobile Command Center</span>
            </div>
            <h2 className="text-xl font-serif font-bold text-[#2D362E] dark:text-slate-100">
              Welcome, Homebuyer
            </h2>
            <p className="text-xs text-[#606C5D] dark:text-slate-400">
              Tracking {properties.length} homes • Closing target $450k
            </p>
          </div>

          {/* Readiness Circle Badge */}
          <div 
            onClick={() => onNavigate("roadmap", "website")}
            className="flex flex-col items-center justify-center bg-[#FAF9F5] dark:bg-slate-800 border border-[#EAE7E0] dark:border-slate-700 rounded-2xl p-2.5 shrink-0 cursor-pointer active:scale-95 transition-transform"
          >
            <span className="text-[10px] text-[#9A9488] font-bold uppercase tracking-wider">Readiness</span>
            <span className="text-lg font-black text-[#4A5D4E] dark:text-emerald-400">
              {readinessPercent}%
            </span>
          </div>
        </div>

        {/* 4 Quick-Action Touch Pills */}
        <div className="grid grid-cols-4 gap-2 pt-1 border-t border-[#F1EFE9] dark:border-slate-800">
          <button
            type="button"
            onClick={onOpenNewPropertyModal}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#F9F8F4] dark:bg-slate-800/80 hover:bg-[#F1EFE9] text-[#2D362E] dark:text-slate-200 border border-[#EAE7E0] dark:border-slate-700 transition-colors active:scale-95 cursor-pointer text-center"
          >
            <Plus className="w-4 h-4 text-[#4A5D4E] dark:text-emerald-400 mb-1" />
            <span className="text-[10px] font-semibold truncate w-full">Add Home</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate("ai_copilot", "dashboard")}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#F9F8F4] dark:bg-slate-800/80 hover:bg-[#F1EFE9] text-[#2D362E] dark:text-slate-200 border border-[#EAE7E0] dark:border-slate-700 transition-colors active:scale-95 cursor-pointer text-center"
          >
            <Sparkles className="w-4 h-4 text-[#C18C5D] mb-1" />
            <span className="text-[10px] font-semibold truncate w-full">AI Advisor</span>
          </button>

          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#F9F8F4] dark:bg-slate-800/80 hover:bg-[#F1EFE9] text-[#2D362E] dark:text-slate-200 border border-[#EAE7E0] dark:border-slate-700 transition-colors active:scale-95 cursor-pointer text-center"
          >
            <Mail className="w-4 h-4 text-[#4A5D4E] dark:text-emerald-400 mb-1" />
            <span className="text-[10px] font-semibold truncate w-full">Email Plan</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="flex flex-col items-center justify-center p-2 rounded-xl bg-[#F9F8F4] dark:bg-slate-800/80 hover:bg-[#F1EFE9] text-[#2D362E] dark:text-slate-200 border border-[#EAE7E0] dark:border-slate-700 transition-colors active:scale-95 cursor-pointer text-center"
          >
            <Printer className="w-4 h-4 text-[#4A5D4E] dark:text-emerald-400 mb-1" />
            <span className="text-[10px] font-semibold truncate w-full">Print PDF</span>
          </button>
        </div>
      </div>

      {/* 3. HORIZONTAL SCROLLING / TAP SEGMENT CONTROLLER */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar -mx-1 px-1">
        {tabs.map((tab, idx) => {
          const Icon = tab.icon;
          const isActive = activeTab === idx;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => switchTab(idx)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer whitespace-nowrap ${
                isActive 
                  ? "bg-[#4A5D4E] text-white shadow-sm scale-102" 
                  : "bg-white dark:bg-slate-900 text-[#606C5D] dark:text-slate-400 border border-[#EAE7E0] dark:border-slate-800 hover:bg-[#F9F8F4]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SWIPE GESTURE INSTRUCTION CHIP */}
      <div className="flex items-center justify-between px-1 text-[11px] text-[#9A9488]">
        <span className="flex items-center gap-1">
          <ChevronLeft className="w-3 h-3" />
          <span>Swipe or tap tabs to navigate</span>
        </span>
        <div className="flex items-center gap-1">
          {tabs.map((_, idx) => (
            <div
              key={idx}
              onClick={() => switchTab(idx)}
              className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                activeTab === idx ? "w-5 bg-[#4A5D4E]" : "bg-[#DCD8CE] dark:bg-slate-700"
              }`}
            />
          ))}
        </div>
        <ChevronRight className="w-3 h-3" />
      </div>

      {/* 4. SWIPEABLE VIEW CONTAINER (FRAMER MOTION) */}
      <div className="relative overflow-hidden min-h-[420px]">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={activeTab}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: "easeInOut" }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="space-y-4 touch-pan-y"
          >
            {/* TAB 0: OVERVIEW & READINESS */}
            {activeTab === 0 && (
              <div className="space-y-4">
                {/* 4 Key Stat Cards in 2x2 Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Card 1: Readiness */}
                  <div 
                    onClick={() => switchTab(3)}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-[#EAE7E0] dark:border-slate-800 shadow-xs space-y-2 cursor-pointer active:scale-98 transition-transform"
                  >
                    <div className="text-[11px] text-[#9A9488] font-semibold">Tasks Completed</div>
                    <div className="text-xl font-bold text-[#2D362E] dark:text-slate-100">
                      {completedTasks} / {totalTasks}
                    </div>
                    <div className="w-full h-1.5 bg-[#EAE7E0] dark:bg-slate-700 rounded-full overflow-hidden">
                      <div style={{ width: `${readinessPercent}%` }} className="h-full bg-[#4A5D4E]" />
                    </div>
                    <div className="text-[10px] text-[#4A5D4E] dark:text-emerald-400 font-bold flex items-center gap-1">
                      <span>View Roadmap</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </div>
                  </div>

                  {/* Card 2: Max Safe Price */}
                  <div 
                    onClick={() => switchTab(1)}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-[#EAE7E0] dark:border-slate-800 shadow-xs space-y-2 cursor-pointer active:scale-98 transition-transform"
                  >
                    <div className="text-[11px] text-[#9A9488] font-semibold">Max Safe Price</div>
                    <div className="text-xl font-bold text-[#2D362E] dark:text-slate-100">
                      {formatUSD(breakdown.maxSafePriceConservative)}
                    </div>
                    <div className={`text-[10px] font-bold truncate ${dtiStatus.isHigh ? "text-red-600" : "text-emerald-700 dark:text-emerald-400"}`}>
                      DTI {breakdown.backEndDTI}% ({dtiStatus.label})
                    </div>
                    <div className="text-[10px] text-[#4A5D4E] dark:text-emerald-400 font-bold flex items-center gap-1">
                      <span>Adjust Sliders</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </div>
                  </div>

                  {/* Card 3: Saved Homes */}
                  <div 
                    onClick={() => switchTab(2)}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-[#EAE7E0] dark:border-slate-800 shadow-xs space-y-2 cursor-pointer active:scale-98 transition-transform"
                  >
                    <div className="text-[11px] text-[#9A9488] font-semibold">Saved Properties</div>
                    <div className="text-xl font-bold text-[#2D362E] dark:text-slate-100">
                      {properties.length} Homes
                    </div>
                    <div className="text-[10px] text-[#606C5D] dark:text-slate-400">
                      {properties.filter(p => p.status === "touring").length} touring active
                    </div>
                    <div className="text-[10px] text-[#4A5D4E] dark:text-emerald-400 font-bold flex items-center gap-1">
                      <span>Open Homes</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </div>
                  </div>

                  {/* Card 4: Document Vault */}
                  <div 
                    onClick={() => onNavigate("roadmap", "website")}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-[#EAE7E0] dark:border-slate-800 shadow-xs space-y-2 cursor-pointer active:scale-98 transition-transform"
                  >
                    <div className="text-[11px] text-[#9A9488] font-semibold">Document Vault</div>
                    <div className="text-xl font-bold text-[#2D362E] dark:text-slate-100">
                      {readyDocsCount} / {documents.length}
                    </div>
                    <div className="text-[10px] text-[#606C5D] dark:text-slate-400">
                      Pre-approval ready
                    </div>
                    <div className="text-[10px] text-[#4A5D4E] dark:text-emerald-400 font-bold flex items-center gap-1">
                      <span>Verify Docs</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </div>
                  </div>
                </div>

                {/* Quick Action Navigation Card */}
                <div className="bg-gradient-to-br from-[#F9F8F4] to-[#F1EFE9] dark:from-slate-900 dark:to-slate-800/80 rounded-2xl p-4 border border-[#EAE7E0] dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2D362E] dark:text-slate-100">
                      Quick Step Launchers
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#4A5D4E]/10 text-[#4A5D4E] dark:text-emerald-400 font-bold">
                      Interactive
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onNavigate("calculator", "website")}
                      className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-[#EAE7E0] dark:border-slate-700 text-left hover:border-[#4A5D4E] transition-all cursor-pointer active:scale-98 shadow-2xs"
                    >
                      <DollarSign className="w-4 h-4 text-[#4A5D4E] dark:text-emerald-400 mb-1" />
                      <div className="text-xs font-bold text-[#2D362E] dark:text-slate-100">Step 1: Calculator</div>
                      <div className="text-[10px] text-[#606C5D] dark:text-slate-400">Affordability & Grants</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => onNavigate("roadmap", "website")}
                      className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-[#EAE7E0] dark:border-slate-700 text-left hover:border-[#4A5D4E] transition-all cursor-pointer active:scale-98 shadow-2xs"
                    >
                      <Compass className="w-4 h-4 text-[#4A5D4E] dark:text-emerald-400 mb-1" />
                      <div className="text-xs font-bold text-[#2D362E] dark:text-slate-100">Step 2: Roadmap</div>
                      <div className="text-[10px] text-[#606C5D] dark:text-slate-400">10-Step Closing Plan</div>
                    </button>
                  </div>
                </div>

                {/* Screening Disclaimer */}
                <ScreeningDisclaimerBanner variant="full" />
              </div>
            )}

            {/* TAB 1: BUDGET & SLIDERS */}
            {activeTab === 1 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#EAE7E0] dark:border-slate-800 p-5 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-[#F1EFE9] dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#2D362E] dark:text-slate-100">
                      Monthly Payment & Savings
                    </h3>
                    <p className="text-xs text-[#606C5D] dark:text-slate-400">
                      Fine-tune target price and down payment savings
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#9A9488] font-bold block uppercase">Monthly Est</span>
                    <span className="text-lg font-bold text-[#4A5D4E] dark:text-emerald-400">
                      {formatUSD(breakdown.totalMonthlyPayment)}/mo
                    </span>
                  </div>
                </div>

                {/* Target Home Price Slider */}
                <div className="space-y-2 bg-[#FAF9F5] dark:bg-slate-800/60 p-4 rounded-2xl border border-[#EAE7E0] dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#2D362E] dark:text-slate-200">
                      Target Home Price
                    </label>
                    <span className="text-sm font-extrabold text-[#4A5D4E] dark:text-emerald-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-[#EAE7E0] dark:border-slate-800">
                      {formatUSD(profile.targetPrice || 450000)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="150000"
                    max="1200000"
                    step="5000"
                    value={profile.targetPrice || 450000}
                    onChange={(e) => handleTargetPriceChange(Number(e.target.value))}
                    className="w-full accent-[#4A5D4E] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#9A9488]">
                    <span>$150k</span>
                    <span>$600k</span>
                    <span>$1.2M</span>
                  </div>
                </div>

                {/* Down Payment Savings Slider & Quick Add */}
                <div className="space-y-2 bg-[#FAF9F5] dark:bg-slate-800/60 p-4 rounded-2xl border border-[#EAE7E0] dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#2D362E] dark:text-slate-200">
                      Down Payment Savings
                    </label>
                    <span className="text-sm font-extrabold text-[#4A5D4E] dark:text-emerald-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-[#EAE7E0] dark:border-slate-800">
                      {formatUSD(profile.downPaymentSavings || 25000)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200000"
                    step="1000"
                    value={profile.downPaymentSavings || 25000}
                    onChange={(e) => handleSavingsChange(Number(e.target.value))}
                    className="w-full accent-[#4A5D4E] cursor-pointer"
                  />
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-[#9A9488] font-bold">Quick Add:</span>
                    {[1000, 5000, 10000].map((addVal) => (
                      <button
                        key={addVal}
                        type="button"
                        onClick={() => handleSavingsChange((profile.downPaymentSavings || 0) + addVal)}
                        className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-[#F1EFE9] border border-[#EAE7E0] dark:border-slate-700 text-[10px] font-bold text-[#4A5D4E] dark:text-emerald-400 cursor-pointer active:scale-95"
                      >
                        +{formatUSD(addVal)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Monthly Payment Breakdown Pills */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#2D362E] dark:text-slate-200 block">
                    Estimated Monthly Breakdown
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-[#FAF9F5] dark:bg-slate-800 rounded-xl border border-[#EAE7E0] dark:border-slate-700">
                      <span className="text-[10px] text-[#9A9488] block">Principal & Interest</span>
                      <span className="font-bold text-[#2D362E] dark:text-slate-200">
                        {formatUSD(breakdown.monthlyPI)}
                      </span>
                    </div>
                    <div className="p-2.5 bg-[#FAF9F5] dark:bg-slate-800 rounded-xl border border-[#EAE7E0] dark:border-slate-700">
                      <span className="text-[10px] text-[#9A9488] block">Property Taxes</span>
                      <span className="font-bold text-[#2D362E] dark:text-slate-200">
                        {formatUSD(breakdown.monthlyTaxes)}
                      </span>
                    </div>
                    <div className="p-2.5 bg-[#FAF9F5] dark:bg-slate-800 rounded-xl border border-[#EAE7E0] dark:border-slate-700">
                      <span className="text-[10px] text-[#9A9488] block">Homeowners Ins.</span>
                      <span className="font-bold text-[#2D362E] dark:text-slate-200">
                        {formatUSD(breakdown.monthlyInsurance)}
                      </span>
                    </div>
                    <div className="p-2.5 bg-[#FAF9F5] dark:bg-slate-800 rounded-xl border border-[#EAE7E0] dark:border-slate-700">
                      <span className="text-[10px] text-[#9A9488] block">Mortgage Ins. (PMI)</span>
                      <span className="font-bold text-[#2D362E] dark:text-slate-200">
                        {formatUSD(breakdown.monthlyPMI)}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate("calculator", "website")}
                  className="w-full py-2.5 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Open Full Affordability Lab</span>
                </button>
              </div>
            )}

            {/* TAB 2: SAVED HOMES & TOURS */}
            {activeTab === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-[#EAE7E0] dark:border-slate-800">
                  <div>
                    <h3 className="font-bold text-sm text-[#2D362E] dark:text-slate-100">
                      My Tracked Homes ({properties.length})
                    </h3>
                    <p className="text-[11px] text-[#606C5D] dark:text-slate-400">
                      Physical inspection scorecards & tour notes
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenNewPropertyModal}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#4A5D4E] text-white text-xs font-bold shadow-xs active:scale-95 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>

                {properties.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#EAE7E0] dark:border-slate-800 p-8 text-center space-y-3">
                    <Building className="w-10 h-10 text-[#9A9488] mx-auto" />
                    <h4 className="font-bold text-sm text-[#2D362E] dark:text-slate-200">No properties saved yet</h4>
                    <p className="text-xs text-[#606C5D] dark:text-slate-400 max-w-xs mx-auto">
                      Add a listing URL or address to start tracking tour scorecards and loan suitability.
                    </p>
                    <button
                      type="button"
                      onClick={onOpenNewPropertyModal}
                      className="px-4 py-2 rounded-xl bg-[#4A5D4E] text-white text-xs font-bold shadow-xs"
                    >
                      Add Your First Property
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {properties.map((prop) => (
                      <div
                        key={prop.id}
                        className="bg-white dark:bg-slate-900 rounded-2xl border border-[#EAE7E0] dark:border-slate-800 overflow-hidden shadow-xs space-y-3 p-4"
                      >
                        <div className="flex gap-3">
                          {prop.photoUrl ? (
                            <img
                              src={prop.photoUrl}
                              alt={prop.address}
                              className="w-20 h-20 rounded-xl object-cover shrink-0 border border-[#EAE7E0]"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-xl bg-[#F1EFE9] flex items-center justify-center shrink-0">
                              <Building className="w-8 h-8 text-[#9A9488]" />
                            </div>
                          )}

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-bold text-sm text-[#2D362E] dark:text-slate-100 truncate">
                                {formatUSD(prop.price)}
                              </span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                prop.status === "touring"
                                  ? "bg-amber-100 text-amber-800"
                                  : prop.status === "offered"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}>
                                {prop.status}
                              </span>
                            </div>
                            <p className="text-xs text-[#606C5D] dark:text-slate-300 truncate">
                              {prop.address}
                            </p>
                            <p className="text-[11px] text-[#9A9488]">
                              {prop.beds} Beds • {prop.baths} Baths • {prop.sqft ? `${prop.sqft.toLocaleString()} sqft` : 'Active'}
                            </p>
                          </div>
                        </div>

                        {/* Property Action Buttons */}
                        <div className="flex items-center gap-2 pt-2 border-t border-[#F1EFE9] dark:border-slate-800">
                          <button
                            type="button"
                            onClick={() => onNavigate("properties", "dashboard")}
                            className="flex-1 py-1.5 rounded-xl bg-[#F9F8F4] dark:bg-slate-800 hover:bg-[#F1EFE9] text-[#4A5D4E] dark:text-emerald-400 text-xs font-bold border border-[#EAE7E0] dark:border-slate-700 text-center cursor-pointer"
                          >
                            Tour Scorecard
                          </button>
                          <button
                            type="button"
                            onClick={() => onNavigate("ai_copilot", "dashboard")}
                            className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl bg-[#4A5D4E] text-white text-xs font-bold cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
                            <span>Ask AI</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: ROADMAP CHECKLIST */}
            {activeTab === 3 && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#EAE7E0] dark:border-slate-800 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#F1EFE9] dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#2D362E] dark:text-slate-100">
                      10-Step Closing Checklist
                    </h3>
                    <p className="text-xs text-[#606C5D] dark:text-slate-400">
                      {completedTasks} of {totalTasks} milestones completed
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#F1EFE9] dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-[#4A5D4E] dark:text-emerald-400">
                    {readinessPercent}%
                  </div>
                </div>

                <div className="space-y-3">
                  {milestones.map((m, mIdx) => (
                    <div
                      key={m.id}
                      className="bg-[#FAF9F5] dark:bg-slate-800/60 rounded-2xl p-3.5 border border-[#EAE7E0] dark:border-slate-700 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#2D362E] dark:text-slate-200">
                          {mIdx + 1}. {m.title}
                        </span>
                        <span className="text-[10px] text-[#9A9488]">
                          {m.tasks.filter(t => t.done).length}/{m.tasks.length}
                        </span>
                      </div>

                      <div className="space-y-1.5 pl-1">
                        {m.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-start gap-2 text-xs text-[#606C5D] dark:text-slate-300"
                          >
                            <div className={`w-4 h-4 rounded-md mt-0.5 flex items-center justify-center shrink-0 ${
                              task.done 
                                ? "bg-[#4A5D4E] text-white" 
                                : "border border-[#DCD8CE] dark:border-slate-600 bg-white dark:bg-slate-900"
                            }`}>
                              {task.done && <CheckCircle2 className="w-3 h-3" />}
                            </div>
                            <span className={`pt-0.5 leading-tight ${task.done ? "line-through opacity-75" : ""}`}>
                              {task.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate("roadmap", "website")}
                  className="w-full py-2.5 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Compass className="w-4 h-4" />
                  <span>Open Interactive Roadmap</span>
                </button>
              </div>
            )}

            {/* TAB 4: YOUR LOCAL TEAM (LO & AGENT) */}
            {activeTab === 4 && (
              <div className="space-y-4">
                {/* Loan Officer Profile Card */}
                {loanOfficer && (
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#EAE7E0] dark:border-slate-800 p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F1EFE9] dark:bg-slate-800 text-[#4A5D4E] dark:text-emerald-400 text-[10px] font-bold uppercase">
                        <Award className="w-3 h-3" />
                        <span>Dedicated Senior Loan Officer</span>
                      </div>
                      <span className="text-[10px] text-[#9A9488]">NMLS #{loanOfficer.nmlsId}</span>
                    </div>

                    <div className="flex items-center gap-3.5">
                      {loanOfficer.headshotUrl ? (
                        <img
                          src={loanOfficer.headshotUrl}
                          alt={loanOfficer.name}
                          className="w-14 h-14 rounded-2xl object-cover border border-[#EAE7E0] shadow-xs"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-[#4A5D4E] text-white flex items-center justify-center font-bold text-lg">
                          {loanOfficer.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-base text-[#2D362E] dark:text-slate-100">
                          {loanOfficer.name}
                        </h3>
                        <p className="text-xs text-[#4A5D4E] dark:text-emerald-400 font-medium">
                          {loanOfficer.title}
                        </p>
                        <p className="text-[11px] text-[#9A9488]">
                          {loanOfficer.company}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <a
                        href={`tel:${loanOfficer.phone}`}
                        className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#F9F8F4] dark:bg-slate-800 border border-[#EAE7E0] dark:border-slate-700 text-[#2D362E] dark:text-slate-200 text-xs font-semibold active:scale-95 transition-transform"
                      >
                        <Phone className="w-4 h-4 text-[#4A5D4E] mb-1" />
                        <span className="text-[10px]">Call</span>
                      </a>
                      <a
                        href={`sms:${loanOfficer.phone}`}
                        className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#F9F8F4] dark:bg-slate-800 border border-[#EAE7E0] dark:border-slate-700 text-[#2D362E] dark:text-slate-200 text-xs font-semibold active:scale-95 transition-transform"
                      >
                        <MessageSquare className="w-4 h-4 text-[#4A5D4E] mb-1" />
                        <span className="text-[10px]">Text SMS</span>
                      </a>
                      <a
                        href={`mailto:${loanOfficer.email}`}
                        className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-[#F9F8F4] dark:bg-slate-800 border border-[#EAE7E0] dark:border-slate-700 text-[#2D362E] dark:text-slate-200 text-xs font-semibold active:scale-95 transition-transform"
                      >
                        <Mail className="w-4 h-4 text-[#4A5D4E] mb-1" />
                        <span className="text-[10px]">Email</span>
                      </a>
                    </div>

                    {loanOfficer.leadGenFormUrl && (
                      <a
                        href={loanOfficer.leadGenFormUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#C18C5D] hover:bg-[#A87448] text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
                      >
                        <span>Apply & Get Pre-Approved</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                )}

                {/* Real Estate Agent Profile Card */}
                {activeAgent && (
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#EAE7E0] dark:border-slate-800 p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F1EFE9] dark:bg-slate-800 text-[#4A5D4E] dark:text-emerald-400 text-[10px] font-bold uppercase">
                        <Users className="w-3 h-3" />
                        <span>Matched Buyer's Agent</span>
                      </div>
                      <span className="text-[10px] text-[#9A9488]">{activeAgent.brokerage}</span>
                    </div>

                    <div className="flex items-center gap-3.5">
                      {activeAgent.headshotUrl ? (
                        <img
                          src={activeAgent.headshotUrl}
                          alt={activeAgent.name}
                          className="w-14 h-14 rounded-2xl object-cover border border-[#EAE7E0] shadow-xs"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-[#C18C5D] text-white flex items-center justify-center font-bold text-lg">
                          {activeAgent.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-base text-[#2D362E] dark:text-slate-100">
                          {activeAgent.name}
                        </h3>
                        <p className="text-xs text-[#4A5D4E] dark:text-emerald-400 font-medium">
                          {activeAgent.title || "Licensed Real Estate Specialist"}
                        </p>
                        <p className="text-[11px] text-[#9A9488]">
                          {activeAgent.areaFocus?.join(", ") || "Pacific Northwest"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={`tel:${activeAgent.phone}`}
                        className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#F9F8F4] dark:bg-slate-800 border border-[#EAE7E0] dark:border-slate-700 text-[#2D362E] dark:text-slate-200 text-xs font-semibold active:scale-95 transition-transform"
                      >
                        <Phone className="w-4 h-4 text-[#4A5D4E]" />
                        <span>Call Agent</span>
                      </a>
                      <a
                        href={`sms:${activeAgent.phone}`}
                        className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#F9F8F4] dark:bg-slate-800 border border-[#EAE7E0] dark:border-slate-700 text-[#2D362E] dark:text-slate-200 text-xs font-semibold active:scale-95 transition-transform"
                      >
                        <MessageSquare className="w-4 h-4 text-[#4A5D4E]" />
                        <span>Text Agent</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Modals for Share and Print */}
      {isPrintModalOpen && (
        <HomebuyingPlanPrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          profile={profile}
          milestones={milestones}
          documents={documents}
          properties={properties}
          loanOfficer={loanOfficer}
          activeAgent={activeAgent}
          isCoBranded={isCoBranded}
          agentRoster={agentRoster}
        />
      )}

      {isShareModalOpen && (
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
      )}
    </div>
  );
};
