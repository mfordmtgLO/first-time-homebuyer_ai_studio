import React from "react";
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
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface StepNavigationBannerProps {
  currentTab: string;
  currentMode?: "website" | "dashboard";
  activeMode?: "website" | "dashboard";
  onNavigate: (tab: string, mode: "website" | "dashboard") => void;
  onNavigateToGuides?: () => void;
  loanOfficerName?: string;
  activeAgentName?: string;
  isVertical?: boolean;
}

export const StepNavigationBanner: React.FC<StepNavigationBannerProps> = ({
  currentTab,
  onNavigate,
  onNavigateToGuides,
  loanOfficerName,
  activeAgentName,
  isVertical = false,
}) => {
  // Determine current active step index (0 = Home, 1 = Step 1, 2 = Step 2, 3 = Step 3, 4 = Step 4)
  let activeStep = 0;
  if (currentTab === "hero") activeStep = 0;
  else if (currentTab === "calculator") activeStep = 1;
  else if (currentTab === "roadmap" || currentTab === "grants") activeStep = 2;
  else if (currentTab === "dashboard" || currentTab === "properties" || currentTab === "mortgagelab" || currentTab === "escrow") activeStep = 3;
  else if (currentTab === "step4_ai_plan" || currentTab === "ai_copilot") activeStep = 4;

  const steps = [
    {
      stepNum: 1,
      id: "calculator",
      mode: "website" as const,
      label: "Calculate Buying Power",
      tagline: "Monthly payment goal & max price",
      icon: Calculator
    },
    {
      stepNum: 2,
      id: "roadmap",
      mode: "website" as const,
      label: "Explore & Learn",
      tagline: "10-step roadmap & DPA programs",
      icon: Compass
    },
    {
      stepNum: 3,
      id: "dashboard",
      mode: "dashboard" as const,
      label: "Buyer Dashboard",
      tagline: "Brings it all together",
      icon: LayoutDashboard
    },
    {
      stepNum: 4,
      id: "step4_ai_plan",
      mode: "dashboard" as const,
      label: "AI Plan & Local Guides",
      tagline: "Scenario findings & next steps",
      icon: Sparkles
    }
  ];

  const secondaryItems = [
    { id: "grants", label: "DPA Finder", icon: Award, mode: "website" as const },
    { id: "properties", label: "Saved Homes", icon: Building, mode: "dashboard" as const },
    { id: "mortgagelab", label: "Mortgage Lab", icon: TrendingUp, mode: "dashboard" as const },
    { id: "ai_copilot", label: "AI Copilot", icon: Sparkles, mode: "dashboard" as const },
    { id: "escrow", label: "Closing Tracker", icon: ShieldCheck, mode: "dashboard" as const },
  ];

  const progressPercentage = Math.min(100, Math.max(0, (activeStep / 4) * 100));

  const handleStepClick = (s: typeof steps[0]) => {
    onNavigate(s.id, s.mode);
  };

  return (
    <div 
      id="guided-4-step-journey-banner"
      className={isVertical 
        ? "w-full h-full flex flex-col transition-all" 
        : "w-full bg-white/95 backdrop-blur-md rounded-2xl border border-[#EAE7E0] p-2.5 sm:p-3.5 shadow-sm transition-all"
      }
    >
      {/* Top Header: Return to Beginning link + Guided Workflow label + Sticky Local Guides button */}
      <div className={`shrink-0 flex ${isVertical ? "flex-col items-start gap-3" : "flex-col sm:flex-row sm:items-center justify-between"} pb-2 mb-2 border-b border-[#EAE7E0]/80`}>
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold tracking-wider uppercase bg-[#F1EFE9] text-[#4A5D4E] px-2.5 py-0.5 rounded-full border border-[#EAE7E0] self-start">
            Guided 4-Step Homebuyer Journey
          </span>
          <span className="text-xs text-[#606C5D] hidden md:inline">
            Follow the 4 steps to buy your first home with total confidence.
          </span>
        </div>

        <div className={`flex items-center gap-2 ${isVertical ? "w-full flex-wrap" : "self-start sm:self-auto flex-wrap"}`}>
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
              <span className="hidden lg:inline text-[10px] text-[#606C5D] font-medium">
                ({loanOfficerName || "Loan Officer"} & {activeAgentName || "Agent"})
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
            <span>Return to Start / Home</span>
          </button>
        </div>
      </div>

      <div className={isVertical ? "flex-1 overflow-y-auto pr-2 -mr-2 dashboard-vertical-scrollbar" : "w-full"}>
        {/* Horizontal Progress Bar */}
        <div className="w-full bg-[#F1EFE9] h-1.5 rounded-full overflow-hidden mb-2 sm:mb-2.5">
        <motion.div 
          className="h-full bg-[#4A5D4E] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
        />
      </div>

      {/* Interactive Step Cards */}
      <div className={isVertical ? "flex flex-col gap-2.5 w-full" : "grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 w-full"}>
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
              className={`text-left p-2 sm:p-2.5 rounded-xl border transition-all relative flex flex-col justify-between group min-h-[76px] sm:min-h-[82px] w-full cursor-pointer select-none ${
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
                      className={`w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-bold transition-colors ${
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
                    className={`text-xs sm:text-sm font-bold leading-tight ${
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
              <div className="relative z-10 w-full min-h-[16px] flex items-center mt-1">
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

      {isVertical && (
        <div className="mt-8 pt-6 pb-6 border-t border-[#EAE7E0]/80">
          <span className="text-[10px] font-bold tracking-wider uppercase text-[#9A9488] px-2 block mb-3">
            Advanced Tools
          </span>
          <div className="flex flex-col gap-1.5 w-full">
            {secondaryItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id, item.mode)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all w-full text-left ${
                    isActive
                      ? "bg-[#4A5D4E] text-white shadow-xs ring-1 ring-[#38463B]"
                      : "text-[#4A5D4E] hover:bg-[#F1EFE9] hover:text-[#2D362E] bg-white border border-[#EAE7E0] hover:border-[#DCD7CD]"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 transition-transform ${
                    isActive ? "text-white" : "text-[#606C5D]"
                  }`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
