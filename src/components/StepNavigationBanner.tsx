import React, { useState } from "react";
import { 
  Calculator, 
  Compass, 
  LayoutDashboard, 
  Sparkles, 
  ArrowRight,
  RotateCcw,
  Check,
  Users,
  Award,
  Building,
  TrendingUp,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
  DollarSign,
  Plus,
  Minus,
  Sliders,
  PhoneCall,
  Zap,
  Clock,
  ExternalLink,
  Percent,
  Layers,
  ChevronRight,
  ChevronLeft,
  QrCode,
  Smartphone,
  Copy,
  Globe,
  Maximize2,
  Minimize2,
  Video
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { FinancialProfile, LoanOfficerProfile, RealEstateAgentProfile } from "../types";
import { SearchGroundedSidebarBot } from "./SearchGroundedSidebarBot";
import { formatUSD, calculateMonthlyPI, calculateMortgageBreakdown } from "../utils/mortgageMath";

interface StepNavigationBannerProps {
  currentTab: string;
  currentMode?: "website" | "dashboard";
  activeMode?: "website" | "dashboard";
  onNavigate: (tab: string, mode: "website" | "dashboard") => void;
  onNavigateToGuides?: () => void;
  loanOfficerName?: string;
  activeAgentName?: string;
  isVertical?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  profile?: FinancialProfile;
  setProfile?: React.Dispatch<React.SetStateAction<FinancialProfile>>;
  onTriggerToast?: (msg: string) => void;
  loanOfficer?: LoanOfficerProfile;
  activeAgent?: RealEstateAgentProfile;
  propertiesCount?: number;
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
  onOpenLoPortal?: () => void;
  onOpenLoAds?: () => void;
}

export const StepNavigationBanner: React.FC<StepNavigationBannerProps> = ({
  currentTab,
  currentMode = "website",
  activeMode,
  onNavigate,
  onNavigateToGuides,
  loanOfficerName,
  activeAgentName,
  isVertical = false,
  isCollapsed = false,
  onToggleCollapse,
  profile,
  setProfile,
  onTriggerToast,
  loanOfficer,
  activeAgent,
  propertiesCount = 0,
  isFullScreen = false,
  onToggleFullScreen,
  onOpenLoPortal,
  onOpenLoAds,
}) => {
  const effectiveMode = activeMode || currentMode;
  const [showNavQrModal, setShowNavQrModal] = useState<boolean>(false);
  const [navCopiedUrl, setNavCopiedUrl] = useState<boolean>(false);

  const leadGenUrl = loanOfficer?.leadGenFormUrl || "https://portal.myhometrac.com/get-started/MFORD@CFMTG.COM";
  const leadQrUrl = loanOfficer?.leadGenQrCodeUrl || "/lead-gen-qr-code.png";

  const handleCopyNavUrl = () => {
    navigator.clipboard.writeText(leadGenUrl);
    setNavCopiedUrl(true);
    setTimeout(() => setNavCopiedUrl(false), 2500);
  };
  
  // Active step index (0 = Home, 1 = Step 1, 2 = Step 2, 3 = Step 3, 4 = Step 4)
  let activeStep = 0;
  if (currentTab === "hero") activeStep = 0;
  else if (currentTab === "calculator") activeStep = 1;
  else if (currentTab === "roadmap") activeStep = 2;
  else if (currentTab === "dashboard" || currentTab === "properties" || currentTab === "mortgagelab" || currentTab === "escrow") activeStep = 3;
  else if (currentTab === "step4_ai_plan" || currentTab === "ai_copilot") activeStep = 4;

  const steps = [
    {
      stepNum: 1,
      id: "calculator",
      mode: "website" as const,
      label: "Calculate Buying Power",
      tagline: "Monthly payment goal & max price",
      shortLabel: "Calculator",
      icon: Calculator
    },
    {
      stepNum: 2,
      id: "roadmap",
      mode: "website" as const,
      label: "Explore & Learn",
      tagline: "10-step roadmap & homebuyer guide",
      shortLabel: "Roadmap",
      icon: Compass
    },
    {
      stepNum: 3,
      id: "properties",
      mode: "dashboard" as const,
      label: "Browse & Tour Homes",
      tagline: "Saved listings & scorecards",
      shortLabel: "Homes",
      icon: Building
    },
    {
      stepNum: 4,
      id: "step4_ai_plan",
      mode: "dashboard" as const,
      label: "AI Plan & Local Guides",
      tagline: "Scenario findings & next steps",
      shortLabel: "AI Plan",
      icon: Sparkles
    }
  ];

  const financialTools = [
    { id: "calculator", label: "Affordability Calculator", icon: Calculator, mode: "website" as const, badge: "Step 1" },
    { id: "mortgagelab", label: "Mortgage Lab & 2-1 Buydown", icon: TrendingUp, mode: "dashboard" as const, badge: "Lab" },
  ];

  const searchTools = [
    { id: "properties", label: "Saved Properties", icon: Building, mode: "dashboard" as const, count: propertiesCount },
    { id: "market_trends", label: "Market Trends & Insights", icon: Globe, mode: "dashboard" as const },
    { id: "ai_copilot", label: "AI Property Copilot", icon: Sparkles, mode: "dashboard" as const },
    { id: "escrow", label: "Closing Tracker & Escrow", icon: ShieldCheck, mode: "dashboard" as const },
  ];

  const progressPercentage = Math.min(100, Math.max(0, (activeStep / 4) * 100));

  const handleStepClick = (s: typeof steps[0]) => {
    onNavigate(s.id, s.mode);
  };

  // Quick mortgage calculation for snapshot widget
  const loanAmt = profile ? Math.max(0, profile.targetPrice - profile.downPaymentSavings) : 0;
  const estPI = profile ? calculateMonthlyPI(loanAmt, profile.interestRate || 6.625, profile.loanTermYears || 30) : 0;

  // Adjust savings amount with quick triggers
  const handleQuickSavingsDelta = (delta: number) => {
    if (!setProfile || !profile) return;
    const newSavings = Math.max(0, profile.downPaymentSavings + delta);
    setProfile(prev => ({ ...prev, downPaymentSavings: newSavings }));
    onTriggerToast?.(`Down payment savings updated to ${formatUSD(newSavings)}`);
  };

  // ----------------------------------------------------
  // VERTICAL SIDEBAR: COLLAPSED ICON RAIL MODE
  // ----------------------------------------------------
  if (isVertical && isCollapsed) {
    return (
      <div 
        id="guided-sidebar-collapsed-rail"
        className="w-full h-full flex flex-col items-center justify-between py-2.5 transition-all select-none"
      >
        {/* Top: Expand Toggle Button */}
        <div className="w-full flex flex-col items-center gap-2 pb-2.5 border-b border-[#EAE7E0]/80">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="w-10 h-10 rounded-xl bg-white hover:bg-[#FAF9F5] border border-[#EAE7E0] hover:border-[#4A5D4E] flex items-center justify-center text-[#4A5D4E] shadow-2xs transition-all hover:scale-105 active:scale-95 cursor-pointer group"
            title="Expand Sidebar Navigation & Tools (Click to expand)"
          >
            <PanelLeftOpen className="w-5 h-5 text-[#4A5D4E] group-hover:text-[#2D362E] transition-transform group-hover:translate-x-0.5" />
          </button>
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#9A9488]">
            Nav
          </span>
        </div>

        {/* Middle: Step Icons & Tool Shortcuts */}
        <div className="flex-1 w-full flex flex-col items-center gap-2 py-3 overflow-y-auto hide-scrollbar">
          {/* Step 1-4 Mini Icons */}
          <div className="flex flex-col items-center gap-1.5 w-full">
            {steps.map((s) => {
              const Icon = s.icon;
              const isActive = activeStep === s.stepNum;
              const isCompleted = activeStep > s.stepNum;

              return (
                <button
                  key={s.stepNum}
                  type="button"
                  onClick={() => handleStepClick(s)}
                  className={`w-10 h-10 rounded-xl relative flex items-center justify-center transition-all cursor-pointer group ${
                    isActive
                      ? "bg-[#4A5D4E] text-white shadow-xs ring-2 ring-[#4A5D4E]/30"
                      : isCompleted
                      ? "bg-[#EBF3ED] text-[#2F5738] border border-[#C2DEC8] hover:bg-[#DDEEE1]"
                      : "bg-white text-[#606C5D] border border-[#EAE7E0] hover:bg-[#FAF9F5] hover:text-[#2D362E]"
                  }`}
                  title={`Step ${s.stepNum}: ${s.label} (${s.tagline})`}
                >
                  <Icon className="w-4 h-4" />
                  
                  {/* Step Number or Checkmark Badge */}
                  <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[8px] font-black flex items-center justify-center ${
                    isActive
                      ? "bg-[#D4A373] text-[#2D362E] border border-white"
                      : isCompleted
                      ? "bg-[#2F5738] text-white"
                      : "bg-[#EAE7E0] text-[#606C5D]"
                  }`}>
                    {isCompleted ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : s.stepNum}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="w-6 h-px bg-[#EAE7E0] my-1" />

          {/* Tool Shortcut Icons */}
          <div className="flex flex-col items-center gap-1.5 w-full">
            <button
              type="button"
              onClick={() => onNavigate("mortgagelab", "dashboard")}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                currentTab === "mortgagelab"
                  ? "bg-[#4A5D4E] text-white shadow-xs"
                  : "bg-white text-[#606C5D] border border-[#EAE7E0] hover:bg-[#FAF9F5] hover:text-[#4A5D4E]"
              }`}
              title="Mortgage Lab (2-1 Buydown & Cost of Waiting)"
            >
              <TrendingUp className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate("grants", "dashboard")}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                currentTab === "grants"
                  ? "bg-[#4A5D4E] text-white shadow-xs"
                  : "bg-white text-[#606C5D] border border-[#EAE7E0] hover:bg-[#FAF9F5] hover:text-[#4A5D4E]"
              }`}
              title="DPA Grant & Census Tracker (Secured Portal)"
            >
              <Award className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate("properties", "dashboard")}
              className={`w-9 h-9 rounded-xl relative flex items-center justify-center transition-all cursor-pointer ${
                currentTab === "properties"
                  ? "bg-[#4A5D4E] text-white shadow-xs"
                  : "bg-white text-[#606C5D] border border-[#EAE7E0] hover:bg-[#FAF9F5] hover:text-[#4A5D4E]"
              }`}
              title={`Saved Properties (${propertiesCount} homes tracked)`}
            >
              <Building className="w-4 h-4" />
              {propertiesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C18C5D] text-white text-[8px] font-bold flex items-center justify-center">
                  {propertiesCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => onNavigate("market_trends", "dashboard")}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                currentTab === "market_trends"
                  ? "bg-[#4A5D4E] text-white shadow-xs"
                  : "bg-white text-[#606C5D] border border-[#EAE7E0] hover:bg-[#FAF9F5] hover:text-[#4A5D4E]"
              }`}
              title="Market Trends & Real Estate Intelligence"
            >
              <Globe className="w-4 h-4 text-[#C18C5D]" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate("ai_copilot", "dashboard")}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                currentTab === "ai_copilot"
                  ? "bg-[#4A5D4E] text-white shadow-xs"
                  : "bg-white text-[#606C5D] border border-[#EAE7E0] hover:bg-[#FAF9F5] hover:text-[#4A5D4E]"
              }`}
              title="AI Property Copilot"
            >
              <Sparkles className="w-4 h-4 text-[#C18C5D]" />
            </button>

            <button
              type="button"
              onClick={() => {
                if (onNavigateToGuides) onNavigateToGuides();
                else onNavigate("step4_ai_plan", "dashboard");
              }}
              className="w-9 h-9 rounded-xl bg-white hover:bg-[#FAF9F5] text-[#2D362E] border border-[#EAE7E0] hover:border-[#DCD7CD] flex items-center justify-center transition-all cursor-pointer"
              title={`Local Guides: ${loanOfficerName || "Loan Officer"} & ${activeAgentName || "Agent"}`}
            >
              <Users className="w-4 h-4 text-[#C18C5D]" />
            </button>

            {(onOpenLoAds || onOpenLoPortal) && (
              <button
                type="button"
                onClick={onOpenLoAds || onOpenLoPortal}
                className="w-9 h-9 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                title="AI Commercial & Video Ads Studio (LO Portal)"
              >
                <Video className="w-4 h-4 text-amber-600" />
              </button>
            )}
          </div>
        </div>

        {/* Bottom: Quick Expand Strip & Fullscreen Toggle */}
        <div className="w-full pt-2 border-t border-[#EAE7E0]/80 flex flex-col items-center gap-1.5">
          {onToggleFullScreen && (
            <button
              type="button"
              onClick={onToggleFullScreen}
              className="w-10 h-10 rounded-xl bg-white hover:bg-[#FAF9F5] border border-[#EAE7E0] hover:border-[#4A5D4E] text-[#4A5D4E] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
              title={isFullScreen ? "Exit Full-Screen Workspace" : "Enter Full-Screen Workspace"}
            >
              {isFullScreen ? (
                <Minimize2 className="w-4 h-4 text-[#C18C5D]" />
              ) : (
                <Maximize2 className="w-4 h-4 text-[#4A5D4E]" />
              )}
            </button>
          )}

          <button
            type="button"
            onClick={onToggleCollapse}
            className="w-full py-1.5 px-1 rounded-lg bg-[#FAF9F5] hover:bg-[#EAE7E0] border border-[#EAE7E0] text-[9px] font-bold text-[#4A5D4E] flex flex-col items-center gap-0.5 transition-colors cursor-pointer"
            title="Expand full sidebar with financial calculators and education bot"
          >
            <ChevronRight className="w-3.5 h-3.5" />
            <span>Expand</span>
          </button>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // EXPANDED VERTICAL SIDEBAR OR HORIZONTAL BANNER MODE
  // ----------------------------------------------------
  return (
    <div 
      id="guided-4-step-journey-banner"
      className={isVertical 
        ? "w-full h-full flex flex-col transition-all select-none" 
        : "w-full bg-white/95 backdrop-blur-md rounded-2xl border border-[#EAE7E0] p-2.5 sm:p-3.5 shadow-sm transition-all"
      }
    >
      {/* Top Header: Step Workflow Badge + Collapse Button (when vertical) */}
      <div className={`shrink-0 flex ${isVertical ? "flex-col items-start gap-2.5" : "flex-col sm:flex-row sm:items-center justify-between"} pb-2.5 mb-2 border-b border-[#EAE7E0]/80`}>
        <div className="w-full flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-wider uppercase bg-[#F1EFE9] text-[#4A5D4E] px-2.5 py-0.5 rounded-full border border-[#EAE7E0] self-start">
            Guided 4-Step Homebuyer Journey
          </span>
          
          {/* Vertical Sidebar Collapse Button & Full-Screen Workspace Toggle */}
          <div className="flex items-center gap-1.5">
            {isVertical && onToggleFullScreen && (
              <button
                id="step-banner-fullscreen-toggle-btn"
                type="button"
                onClick={onToggleFullScreen}
                className="p-1 rounded-lg bg-white hover:bg-[#F1EFE9] border border-[#EAE7E0] text-[#606C5D] hover:text-[#2D362E] transition-all cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                title={isFullScreen ? "Exit Full-Screen Workspace (Esc)" : "Full-Screen Workspace (Hides top navigation & sidebar)"}
              >
                {isFullScreen ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5 text-[#C18C5D]" />
                    <span className="text-[10px] text-[#C18C5D]">Exit Full</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 text-[#4A5D4E]" />
                    <span className="text-[10px] text-[#4A5D4E]">Full</span>
                  </>
                )}
              </button>
            )}

            {isVertical && onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="p-1 rounded-lg bg-white hover:bg-[#F1EFE9] border border-[#EAE7E0] text-[#606C5D] hover:text-[#2D362E] transition-all cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                title="Collapse Sidebar to compact rail"
              >
                <PanelLeftClose className="w-4 h-4 text-[#4A5D4E]" />
                <span className="text-[10px] text-[#606C5D]">Collapse</span>
              </button>
            )}
          </div>
        </div>

        <div className={`flex items-center gap-2 ${isVertical ? "w-full flex-wrap justify-between" : "self-start sm:self-auto flex-wrap"}`}>
          {/* Sticky Local Guides Quick Button */}
          <button
            id="step-banner-local-guides-btn"
            type="button"
            onClick={() => {
              if (onNavigateToGuides) {
                onNavigateToGuides();
              } else {
                onNavigate("step4_ai_plan", "dashboard");
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2D362E] hover:text-[#4A5D4E] bg-[#FAF9F5] hover:bg-[#F1EFE9] px-2.5 py-1 rounded-lg border border-[#EAE7E0] hover:border-[#DCD7CD] transition-colors cursor-pointer"
            title="Meet your dedicated Local Professional Guides (Loan Officer and Real Estate Agent)"
          >
            <Users className="w-3.5 h-3.5 text-[#C18C5D]" />
            <span>Local Guides</span>
            {(loanOfficerName || activeAgentName) && (
              <span className="hidden lg:inline text-[10px] text-[#606C5D] font-medium truncate max-w-[120px]">
                ({loanOfficerName || "Loan Officer"})
              </span>
            )}
          </button>

          {/* Quick Return to Beginning / Home Button */}
          <button
            id="return-to-start-btn"
            type="button"
            onClick={() => onNavigate("hero", "website")}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4A5D4E] hover:text-[#2D362E] bg-[#F9F8F4] hover:bg-[#F1EFE9] px-2.5 py-1 rounded-lg border border-[#EAE7E0] transition-colors cursor-pointer"
            title="Return to the beginning: Buy your first home with clarity and total confidence"
          >
            <RotateCcw className="w-3 h-3 text-[#C18C5D]" />
            <span>Return to Start</span>
          </button>
        </div>
      </div>

      <div className={isVertical ? "flex-1 overflow-y-auto pr-1 -mr-1 dashboard-vertical-scrollbar space-y-4" : "w-full"}>
        {/* Horizontal Progress Bar */}
        <div className="w-full bg-[#F1EFE9] h-1.5 rounded-full overflow-hidden mb-2 sm:mb-2.5">
          <motion.div 
            className="h-full bg-[#4A5D4E] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
          />
        </div>

        {/* Section 1: 4-Step Interactive Cards */}
        <div className={isVertical ? "flex flex-col gap-2 w-full" : "flex overflow-x-auto snap-x snap-mandatory gap-2 pb-3 -mx-3 px-3 sm:mx-0 sm:px-0 sm:pb-0 lg:grid lg:grid-cols-4 sm:gap-2.5 w-full hide-scrollbar"}>
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = activeStep === s.stepNum;
            const isCompleted = activeStep > s.stepNum;

            return (
              <motion.button
                key={s.stepNum}
                id={`guided-step-${s.stepNum}-btn`}
                type="button"
                onClick={() => handleStepClick(s)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.985 }}
                className={`text-left p-2 sm:p-2.5 rounded-xl border transition-all relative flex flex-col justify-between group min-h-[70px] sm:min-h-[76px] min-w-[200px] lg:min-w-0 snap-center shrink-0 lg:w-full cursor-pointer select-none ${
                  isActive
                    ? "border-[#4A5D4E] bg-[#FAF9F5] shadow-xs"
                    : isCompleted
                    ? "bg-white border-[#EAE7E0] hover:border-[#4A5D4E]/50 hover:bg-[#F9F8F4]"
                    : "bg-white border-[#EAE7E0] hover:border-[#4A5D4E]/40 hover:bg-[#F9F8F4]"
                }`}
              >
                {/* Smooth Active Step Background Highlight */}
                {isActive && (
                  <motion.div
                    layoutId="activeStepHighlight"
                    className="absolute inset-0 bg-[#F1EFE9]/80 rounded-xl -z-0 ring-1 ring-[#4A5D4E] shadow-xs"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 32,
                    }}
                  />
                )}

                {/* Card Content */}
                <div className="relative z-10 w-full">
                  <div className="flex items-center justify-between gap-1.5 mb-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold transition-colors ${
                          isActive
                            ? "bg-[#4A5D4E] text-white"
                            : isCompleted
                            ? "bg-[#4A5D4E]/15 text-[#4A5D4E]"
                            : "bg-[#EAE7E0] text-[#606C5D]"
                        }`}
                      >
                        {isCompleted ? <Check className="w-2.5 h-2.5 text-[#4A5D4E]" /> : s.stepNum}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A9488]">
                        Step {s.stepNum}
                      </span>
                    </div>
                    <Icon
                      className={`w-3.5 h-3.5 transition-colors shrink-0 ${
                        isActive
                          ? "text-[#4A5D4E]"
                          : isCompleted
                          ? "text-[#4A5D4E]/70"
                          : "text-[#9A9488] group-hover:text-[#606C5D]"
                      }`}
                    />
                  </div>

                  <div>
                    <h4
                      className={`text-xs font-bold leading-tight ${
                        isActive
                          ? "text-[#2D362E]"
                          : "text-[#2D362E] group-hover:text-[#4A5D4E]"
                      }`}
                    >
                      {s.label}
                    </h4>
                    <p className="text-[10px] text-[#606C5D] leading-tight line-clamp-1 mt-0.5">
                      {s.tagline}
                    </p>
                  </div>
                </div>

                {/* Active Step Indicator Footer */}
                <div className="relative z-10 w-full min-h-[14px] flex items-center mt-1">
                  <AnimatePresence mode="wait">
                    {isActive && (
                      <motion.div
                        key={`active-indicator-${s.stepNum}`}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 6 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="pt-0.5 border-t border-[#4A5D4E]/20 w-full flex items-center justify-between text-[9px] font-bold text-[#4A5D4E]"
                      >
                        <span>Active Step</span>
                        <motion.span
                          animate={{ x: [0, 3, 0] }}
                          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                        >
                          <ArrowRight className="w-2.5 h-2.5" />
                        </motion.span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* ORGANIZED SIDEBAR SECTIONS (Visible in Vertical Layout) */}
        {isVertical && (
          <div className="space-y-4 pt-2">
            {/* Section 2: Interactive Quick Financial Snapshot */}
            {profile && setProfile && (
              <div className="p-3 rounded-2xl bg-white border border-[#EAE7E0] shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-[#C18C5D]" />
                    <span className="text-[11px] font-bold text-[#2D362E]">Scenario Snapshot</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate("calculator", "website")}
                    className="text-[10px] font-bold text-[#4A5D4E] hover:underline"
                  >
                    Edit Full →
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Target Price */}
                  <div className="p-2 rounded-xl bg-[#FAF9F5] border border-[#EAE7E0]">
                    <span className="text-[9px] font-semibold text-[#606C5D] block">Target Price</span>
                    <div className="flex items-center mt-0.5">
                      <span className="text-[11px] font-bold text-[#2D362E] mr-0.5">$</span>
                      <input
                        type="number"
                        min="0"
                        step="5000"
                        value={profile.targetPrice}
                        onChange={(e) => {
                          const val = Math.max(0, Number(e.target.value) || 0);
                          setProfile(prev => ({ ...prev, targetPrice: val }));
                        }}
                        className="w-full text-xs font-bold text-[#2D362E] bg-transparent focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Cash Saved */}
                  <div className="p-2 rounded-xl bg-[#FAF9F5] border border-[#EAE7E0]">
                    <span className="text-[9px] font-semibold text-[#606C5D] block">Cash Saved</span>
                    <div className="flex items-center mt-0.5">
                      <span className="text-[11px] font-bold text-[#4A5D4E] mr-0.5">$</span>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={profile.downPaymentSavings}
                        onChange={(e) => {
                          const val = Math.max(0, Number(e.target.value) || 0);
                          setProfile(prev => ({ ...prev, downPaymentSavings: val }));
                        }}
                        className="w-full text-xs font-bold text-[#4A5D4E] bg-transparent focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Estimated Monthly Payment Metric */}
                <div className="p-2 rounded-xl bg-[#EBF3ED] border border-[#C2DEC8] flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-[#606C5D] block">Estimated P&I / mo</span>
                    <span className="text-xs font-bold text-[#2F5738]">{formatUSD(estPI)}/mo</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-[#606C5D] block">Loan Balance</span>
                    <span className="text-[10px] font-bold text-[#2D362E]">{formatUSD(loanAmt)}</span>
                  </div>
                </div>

                {/* Quick Savings Adjustment Shortcuts */}
                <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-[#EAE7E0]/80 text-[10px]">
                  <span className="text-[#606C5D]">Quick Cash +/-:</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleQuickSavingsDelta(-1000)}
                      className="px-1.5 py-0.5 rounded bg-[#FAF9F5] hover:bg-[#EAE7E0] border border-[#EAE7E0] font-bold text-[#606C5D] cursor-pointer"
                    >
                      -$1k
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickSavingsDelta(1000)}
                      className="px-1.5 py-0.5 rounded bg-[#FAF9F5] hover:bg-[#EAE7E0] border border-[#EAE7E0] font-bold text-[#4A5D4E] cursor-pointer"
                    >
                      +$1k
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickSavingsDelta(5000)}
                      className="px-1.5 py-0.5 rounded bg-[#4A5D4E] hover:bg-[#38463B] text-white font-bold cursor-pointer"
                    >
                      +$5k
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Section 3: Mortgage & Financial Tools Hub */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#9A9488] px-1 block">
                Mortgage & Financial Tools
              </span>
              <div className="flex flex-col gap-1.5 w-full">
                {financialTools.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onNavigate(item.id, item.mode)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all w-full text-left cursor-pointer ${
                        isActive
                          ? "bg-[#4A5D4E] text-white shadow-xs"
                          : "text-[#2D362E] hover:bg-[#FAF9F5] bg-white border border-[#EAE7E0] hover:border-[#DCD7CD]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${
                          isActive ? "text-white" : "text-[#606C5D]"
                        }`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                          isActive ? "bg-white/20 text-white" : "bg-[#F1EFE9] text-[#606C5D]"
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 4: Home Search & Closing Vault */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold tracking-wider uppercase text-[#9A9488] px-1 block">
                Home Search & Closing
              </span>
              <div className="flex flex-col gap-1.5 w-full">
                {searchTools.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onNavigate(item.id, item.mode)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all w-full text-left cursor-pointer ${
                        isActive
                          ? "bg-[#4A5D4E] text-white shadow-xs"
                          : "text-[#2D362E] hover:bg-[#FAF9F5] bg-white border border-[#EAE7E0] hover:border-[#DCD7CD]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className={`w-3.5 h-3.5 shrink-0 ${
                          isActive ? "text-white" : "text-[#606C5D]"
                        }`} />
                        <span>{item.label}</span>
                      </div>
                      {item.count !== undefined && item.count > 0 && (
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                          isActive ? "bg-white text-[#4A5D4E]" : "bg-[#C18C5D] text-white"
                        }`}>
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 5: Dedicated Local Professional Guides Widget */}
            <div className="p-3 rounded-2xl bg-white border border-[#EAE7E0] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#C18C5D]" />
                  <span className="text-[11px] font-bold text-[#2D362E]">Your Local Guides</span>
                </div>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full">
                  Licensed
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="p-1.5 rounded-lg bg-[#FAF9F5] border border-[#EAE7E0] flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-[#9A9488] block">Loan Officer</span>
                    <span className="font-bold text-[#2D362E] text-[11px]">{loanOfficerName || "Mike Ford"}</span>
                  </div>
                  <span className="text-[9px] text-[#606C5D] font-mono">NMLS #288455</span>
                </div>

                {activeAgentName && (
                  <div className="p-1.5 rounded-lg bg-[#FAF9F5] border border-[#EAE7E0] flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-[#9A9488] block">Real Estate Agent</span>
                      <span className="font-bold text-[#2D362E] text-[11px]">{activeAgentName}</span>
                    </div>
                    <span className="text-[9px] text-[#606C5D]">Partner</span>
                  </div>
                )}
              </div>

              <div className="pt-1 flex items-center gap-1.5">
                <a
                  href={leadGenUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-1.5 px-2 rounded-lg bg-[#D4A373] hover:bg-[#C18C5D] text-white font-bold text-[10px] flex items-center justify-center gap-1 transition-colors text-center"
                  title="Open official pre-approval application online"
                >
                  <Smartphone className="w-3 h-3 text-white shrink-0" />
                  <span>Start Loan App</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-80" />
                </a>

                <button
                  type="button"
                  onClick={() => setShowNavQrModal(true)}
                  className="py-1.5 px-2 rounded-lg bg-[#FAF9F5] hover:bg-[#F1EFE9] text-[#4A5D4E] border border-[#EAE7E0] font-bold text-[10px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="Scan QR code with phone"
                >
                  <QrCode className="w-3 h-3 text-[#4A5D4E]" />
                  <span>QR</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (onNavigateToGuides) onNavigateToGuides();
                  else onNavigate("step4_ai_plan", "dashboard");
                }}
                className="w-full py-1.5 px-2 rounded-lg bg-[#4A5D4E] hover:bg-[#38463B] text-white font-bold text-[10px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <PhoneCall className="w-3 h-3 text-[#D4A373]" />
                <span>Contact Local Guides</span>
              </button>
            </div>

            {/* Section 5.5: Marketing & Loan Officer Suite */}
            {(onOpenLoAds || onOpenLoPortal) && (
              <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/60 border border-amber-300/80 space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-amber-700" />
                    <span className="text-[11px] font-extrabold text-amber-950">Marketing & LO Suite</span>
                  </div>
                  <span className="text-[9px] font-black text-amber-950 bg-amber-200 px-1.5 py-0.5 rounded-md">
                    AI Studio
                  </span>
                </div>

                <p className="text-[10px] text-amber-900 leading-tight">
                  Commercials, 30s video scripts, Vantage AI Ad Studio voiceovers, and Meta/Google ad campaigns.
                </p>

                <div className="space-y-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={onOpenLoAds || onOpenLoPortal}
                    className="w-full py-2 px-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>AI Commercial & Video Ads</span>
                    <ArrowRight className="w-3 h-3 ml-auto opacity-80" />
                  </button>

                  {onOpenLoPortal && (
                    <button
                      type="button"
                      onClick={onOpenLoPortal}
                      className="w-full py-1.5 px-2 rounded-lg bg-white/90 hover:bg-white text-amber-950 border border-amber-200 font-semibold text-[11px] flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-2xs"
                    >
                      <ShieldCheck className="w-3 h-3 text-[#4A5D4E]" />
                      <span>Loan Officer Command Center</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Section 6: Search-Grounded Mortgage Education AI Bot */}
            {profile && (
              <div className="w-full">
                <span className="text-[10px] font-bold tracking-wider uppercase text-[#9A9488] px-1 block mb-2">
                  Mortgage Education AI
                </span>
                <SearchGroundedSidebarBot
                  profile={profile}
                  setProfile={setProfile}
                  onNavigate={onNavigate}
                  onTriggerToast={onTriggerToast}
                  loanOfficerName={loanOfficerName}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showNavQrModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 border border-[#EAE7E0] shadow-2xl animate-in zoom-in-95 duration-150 text-[#2D362E] text-center">
            <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-2.5 text-left">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#D4A373]"></div>
                <h4 className="font-serif font-bold text-base text-[#2D362E]">
                  Scan to Start Loan App
                </h4>
              </div>
              <button
                onClick={() => setShowNavQrModal(false)}
                className="text-xs text-[#9A9488] hover:text-[#2D362E] p-1"
              >
                ✕ Close
              </button>
            </div>

            <div className="inline-block p-3.5 bg-[#FAF9F5] border-2 border-[#EAE7E0] rounded-2xl shadow-inner">
              <img 
                src={leadQrUrl} 
                alt="Loan Officer Pre-Approval QR Code" 
                className="w-44 h-44 mx-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="space-y-1">
              <p className="text-xs text-[#606C5D] leading-relaxed">
                Scan with your phone to open <strong className="text-[#2D362E]">{loanOfficerName || "Mike Ford"}</strong>'s official HomeTrac secure pre-approval application.
              </p>
            </div>

            <div className="p-2.5 bg-[#FAF9F5] rounded-xl border border-[#EAE7E0] space-y-1.5 text-left">
              <div className="flex items-center gap-1.5">
                <input 
                  type="text" 
                  readOnly 
                  value={leadGenUrl} 
                  className="flex-1 bg-white border border-[#EAE7E0] rounded-lg px-2 py-1 text-[11px] text-[#606C5D] select-all font-mono"
                />
                <button
                  onClick={handleCopyNavUrl}
                  className="px-2.5 py-1 rounded-lg bg-[#4A5D4E] hover:bg-[#38463B] text-white text-[11px] font-bold flex items-center gap-1 shrink-0"
                >
                  <Copy className="w-3 h-3" />
                  <span>{navCopiedUrl ? "Copied!" : "Copy"}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowNavQrModal(false)}
                className="flex-1 py-2 text-xs font-semibold text-[#606C5D] hover:bg-[#F1EFE9] rounded-xl border border-[#EAE7E0]"
              >
                Close
              </button>
              <a
                href={leadGenUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-white bg-[#4A5D4E] hover:bg-[#38463B] rounded-xl shadow-xs"
              >
                <span>Open Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
