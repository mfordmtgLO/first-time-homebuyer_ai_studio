import React from "react";
import { 
  Home, 
  Calculator, 
  Compass, 
  LayoutDashboard, 
  Sparkles, 
  ArrowRight,
  RotateCcw,
  Check
} from "lucide-react";

interface StepNavigationBannerProps {
  currentTab: string;
  activeMode: "website" | "dashboard";
  onNavigate: (tab: string, mode: "website" | "dashboard") => void;
}

export const StepNavigationBanner: React.FC<StepNavigationBannerProps> = ({
  currentTab,
  activeMode,
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
      tagline: "10-step roadmap & DPA grants",
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

  return (
    <div className="w-full bg-white rounded-2xl border border-[#EAE7E0] p-3 sm:p-4 shadow-sm mb-6">
      {/* Top Header: Return to Beginning link + Guided Workflow label */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-[#EAE7E0]/80">
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
          onClick={() => onNavigate("hero", "website")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4A5D4E] hover:text-[#2D362E] bg-[#F9F8F4] hover:bg-[#F1EFE9] px-3 py-1 rounded-lg border border-[#EAE7E0] transition-colors"
          title="Return to the beginning: Buy your first home with clarity and total confidence"
        >
          <RotateCcw className="w-3 h-3 text-[#C18C5D]" />
          <span>Return to Start / Home</span>
        </button>
      </div>

      {/* 4 Interactive Step Buttons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {steps.map((s) => {
          const Icon = s.icon;
          const isActive = activeStep === s.stepNum;
          const isCompleted = activeStep > s.stepNum;

          return (
            <button
              key={s.stepNum}
              id={`guided-step-${s.stepNum}-btn`}
              onClick={() => onNavigate(s.id, s.mode)}
              className={`text-left p-3 rounded-xl border transition-all relative flex flex-col justify-between group ${
                isActive
                  ? "bg-[#F1EFE9] border-[#4A5D4E] shadow-sm ring-1 ring-[#4A5D4E]"
                  : isCompleted
                  ? "bg-white border-[#EAE7E0] hover:border-[#4A5D4E]/50 hover:bg-[#F9F8F4]"
                  : "bg-white border-[#EAE7E0] hover:border-[#4A5D4E]/40 hover:bg-[#F9F8F4]"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isActive
                        ? "bg-[#4A5D4E] text-white"
                        : isCompleted
                        ? "bg-[#4A5D4E]/15 text-[#4A5D4E]"
                        : "bg-[#EAE7E0] text-[#606C5D]"
                    }`}
                  >
                    {isCompleted ? <Check className="w-3 h-3 text-[#4A5D4E]" /> : s.stepNum}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#9A9488]">
                    Step {s.stepNum}
                  </span>
                </div>
                <Icon
                  className={`w-4 h-4 transition-colors ${
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
                  className={`text-xs sm:text-sm font-bold truncate ${
                    isActive
                      ? "text-[#2D362E]"
                      : "text-[#2D362E] group-hover:text-[#4A5D4E]"
                  }`}
                >
                  {s.label}
                </h4>
                <p className="text-[11px] text-[#606C5D] truncate mt-0.5">
                  {s.tagline}
                </p>
              </div>

              {isActive && (
                <div className="mt-2 pt-1 border-t border-[#4A5D4E]/20 flex items-center gap-1 text-[10px] font-bold text-[#4A5D4E]">
                  <span>Active Step</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
