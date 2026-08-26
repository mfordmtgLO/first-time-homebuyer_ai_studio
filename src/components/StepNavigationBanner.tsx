import React from "react";
import { 
  Calculator, 
  Compass, 
  LayoutDashboard, 
  Sparkles, 
  ArrowRight,
  RotateCcw,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface StepNavigationBannerProps {
  currentTab: string;
  currentMode?: "website" | "dashboard";
  activeMode?: "website" | "dashboard";
  onNavigate: (tab: string, mode: "website" | "dashboard") => void;
  loanOfficerName?: string;
  activeAgentName?: string;
}

export const StepNavigationBanner: React.FC<StepNavigationBannerProps> = ({
  currentTab,
  onNavigate,
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

  const progressPercentage = Math.min(100, Math.max(0, (activeStep / 4) * 100));

  const handleStepClick = (s: typeof steps[0]) => {
    onNavigate(s.id, s.mode);
  };

  return (
    <div 
      id="guided-4-step-journey-banner"
      className="w-full bg-white/95 backdrop-blur-md rounded-2xl border border-[#EAE7E0] p-3 sm:p-4 shadow-sm mb-6 sticky top-0 z-30 transition-all"
    >
      {/* Top Header: Return to Beginning link + Guided Workflow label */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-[#EAE7E0]/80">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold tracking-wider uppercase bg-[#F1EFE9] text-[#4A5D4E] px-2.5 py-0.5 rounded-full border border-[#EAE7E0]">
            Guided 4-Step Homebuyer Journey
          </span>
          <span className="text-xs text-[#606C5D] hidden md:inline">
            Follow the 4 steps to buy your first home with total confidence.
          </span>
        </div>

        {/* Quick Return to Beginning / Home Button */}
        <button
          id="return-to-start-btn"
          type="button"
          onClick={() => onNavigate("hero", "website")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4A5D4E] hover:text-[#2D362E] bg-[#F9F8F4] hover:bg-[#F1EFE9] px-3 py-1 rounded-lg border border-[#EAE7E0] transition-colors cursor-pointer self-start sm:self-auto"
          title="Return to the beginning: Buy your first home with clarity and total confidence"
        >
          <RotateCcw className="w-3 h-3 text-[#C18C5D]" />
          <span>Return to Start / Home</span>
        </button>
      </div>

      {/* Horizontal Progress Bar */}
      <div className="w-full bg-[#F1EFE9] h-1.5 rounded-full overflow-hidden mb-3">
        <motion.div 
          className="h-full bg-[#4A5D4E] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
        />
      </div>

      {/* 4 Interactive Step Cards — Fixed Grid (No Horizontal Scrolling, Permanently Pinned) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 w-full">
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
              className={`text-left p-2.5 sm:p-3 rounded-xl border transition-all relative flex flex-col justify-between group min-h-[90px] sm:min-h-[96px] w-full cursor-pointer select-none ${
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
                <div className="flex items-center justify-between gap-1.5 mb-1 sm:mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] font-bold transition-colors ${
                        isActive
                          ? "bg-[#4A5D4E] text-white"
                          : isCompleted
                          ? "bg-[#4A5D4E]/15 text-[#4A5D4E]"
                          : "bg-[#EAE7E0] text-[#606C5D]"
                      }`}
                    >
                      {isCompleted ? <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#4A5D4E]" /> : s.stepNum}
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#9A9488]">
                      Step {s.stepNum}
                    </span>
                  </div>
                  <Icon
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors shrink-0 ${
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
                  <p className="text-[10px] sm:text-[11px] text-[#606C5D] leading-tight line-clamp-1 mt-0.5">
                    {s.tagline}
                  </p>
                </div>
              </div>

              {/* Active Step Indicator Footer */}
              <div className="relative z-10 w-full min-h-[18px] sm:min-h-[20px] flex items-center mt-1">
                <AnimatePresence mode="wait">
                  {isActive && (
                    <motion.div
                      key={`active-indicator-${s.stepNum}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="pt-1 border-t border-[#4A5D4E]/20 w-full flex items-center justify-between text-[9px] sm:text-[10px] font-bold text-[#4A5D4E]"
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
    </div>
  );
};
