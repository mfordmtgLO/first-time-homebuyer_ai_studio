import React, { useRef, useState, useEffect, useCallback } from "react";
import { 
  Calculator, 
  Compass, 
  LayoutDashboard, 
  Sparkles, 
  ArrowRight,
  RotateCcw,
  Check,
  ChevronLeft,
  ChevronRight,
  Hand
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

  // Drag-to-scroll & Touch state
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll boundaries and dynamic overflow detection
  const updateScrollBounds = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const isOverflowing = scrollWidth > clientWidth + 4;
    setHasOverflow(isOverflowing);
    setCanScrollLeft(isOverflowing && scrollLeft > 8);
    setCanScrollRight(isOverflowing && scrollLeft + clientWidth < scrollWidth - 8);
  }, []);

  // Smoothly center an active tab in the scroll viewport
  const centerActiveTab = useCallback((stepNum: number, smooth: boolean = true) => {
    const container = scrollContainerRef.current;
    if (!container || stepNum === 0) return;
    const activeEl = container.querySelector<HTMLElement>(`#guided-step-${stepNum}-btn`);
    if (!activeEl) return;

    const containerWidth = container.clientWidth;
    const cardLeft = activeEl.offsetLeft;
    const cardWidth = activeEl.offsetWidth;
    const targetScrollLeft = cardLeft - (containerWidth / 2) + (cardWidth / 2);

    container.scrollTo({
      left: Math.max(0, targetScrollLeft),
      behavior: smooth ? "smooth" : "auto",
    });
  }, []);

  // ResizeObserver and scroll event listeners
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    updateScrollBounds();

    const resizeObserver = new ResizeObserver(() => {
      updateScrollBounds();
      if (activeStep > 0) {
        centerActiveTab(activeStep, false);
      }
    });

    resizeObserver.observe(el);
    el.addEventListener("scroll", updateScrollBounds, { passive: true });
    window.addEventListener("resize", updateScrollBounds);

    return () => {
      resizeObserver.disconnect();
      el.removeEventListener("scroll", updateScrollBounds);
      window.removeEventListener("resize", updateScrollBounds);
    };
  }, [updateScrollBounds, centerActiveTab, activeStep]);

  // Auto-center active card on step change
  useEffect(() => {
    if (activeStep > 0) {
      // Small timeout ensures layout metrics are resolved after DOM render
      const timer = setTimeout(() => {
        centerActiveTab(activeStep, true);
        updateScrollBounds();
      }, 40);
      return () => clearTimeout(timer);
    }
  }, [activeStep, centerActiveTab, updateScrollBounds]);

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current || !hasOverflow) return;
    setIsMouseDown(true);
    setHasDragged(false);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDown || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.4;
    if (Math.abs(walk) > 4) {
      setHasDragged(true);
    }
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    updateScrollBounds();
  };

  const handleMouseUpOrLeave = () => {
    setIsMouseDown(false);
  };

  // Touch Screen Drag Handlers
  const touchStartXRef = useRef<number>(0);
  const touchScrollLeftRef = useRef<number>(0);
  const isTouchDraggingRef = useRef<boolean>(false);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current || e.touches.length === 0) return;
    touchStartXRef.current = e.touches[0].pageX;
    touchScrollLeftRef.current = scrollContainerRef.current.scrollLeft;
    isTouchDraggingRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current || e.touches.length === 0) return;
    const currentX = e.touches[0].pageX;
    const diff = touchStartXRef.current - currentX;
    if (Math.abs(diff) > 6) {
      isTouchDraggingRef.current = true;
      setHasDragged(true);
    }
    updateScrollBounds();
  };

  const handleTouchEnd = () => {
    updateScrollBounds();
    setTimeout(() => {
      isTouchDraggingRef.current = false;
      setHasDragged(false);
    }, 80);
  };

  const handleStepClick = (s: typeof steps[0]) => {
    // Prevent navigation if user was dragging via mouse or touch
    if (hasDragged || isTouchDraggingRef.current) {
      setHasDragged(false);
      isTouchDraggingRef.current = false;
      return;
    }
    onNavigate(s.id, s.mode);
    centerActiveTab(s.stepNum, true);
  };

  const scrollByAmount = (offset: number) => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-[#EAE7E0] p-3 sm:p-4 shadow-sm mb-6 overflow-hidden">
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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4A5D4E] hover:text-[#2D362E] bg-[#F9F8F4] hover:bg-[#F1EFE9] px-3 py-1 rounded-lg border border-[#EAE7E0] transition-colors cursor-pointer"
          title="Return to the beginning: Buy your first home with clarity and total confidence"
        >
          <RotateCcw className="w-3 h-3 text-[#C18C5D]" />
          <span>Return to Start / Home</span>
        </button>
      </div>

      {/* Horizontal Progress Bar & Mobile Drag Hint */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex-1 bg-[#F1EFE9] h-1.5 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-[#4A5D4E] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
          />
        </div>
        {hasOverflow && (
          <div className="flex items-center gap-1 text-[10px] font-medium text-[#9A9488] shrink-0">
            <Hand className="w-3 h-3 text-[#C18C5D] animate-pulse" />
            <span>Swipe or drag steps</span>
          </div>
        )}
      </div>

      {/* 4 Interactive Step Buttons Track with Touch Drag-to-Scroll & Dynamic Navigation Arrows */}
      <div className="relative group/carousel">
        {/* Left Navigation Arrow & Dynamic Gradient Fade */}
        <AnimatePresence>
          {canScrollLeft && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 top-0 bottom-0 z-30 flex items-center"
            >
              <div className="w-12 h-full bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none absolute left-0" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  scrollByAmount(-240);
                }}
                className="relative z-10 ml-1 w-8 h-8 bg-white/95 hover:bg-[#FAF9F5] active:bg-[#F1EFE9] border border-[#EAE7E0] rounded-full shadow-md flex items-center justify-center text-[#2D362E] hover:text-[#4A5D4E] transition-all hover:scale-105 active:scale-95 cursor-pointer"
                aria-label="Scroll steps left"
                title="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Navigation Arrow & Dynamic Gradient Fade */}
        <AnimatePresence>
          {canScrollRight && (
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-0 bottom-0 z-30 flex items-center justify-end"
            >
              <div className="w-12 h-full bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none absolute right-0" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  scrollByAmount(240);
                }}
                className="relative z-10 mr-1 w-8 h-8 bg-white/95 hover:bg-[#FAF9F5] active:bg-[#F1EFE9] border border-[#EAE7E0] rounded-full shadow-md flex items-center justify-center text-[#2D362E] hover:text-[#4A5D4E] transition-all hover:scale-105 active:scale-95 cursor-pointer"
                aria-label="Scroll steps right"
                title="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom Horizontal Scroll & Drag Container with touch-action: pan-x */}
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          className={`flex lg:grid lg:grid-cols-4 gap-2.5 sm:gap-3 overflow-x-auto lg:overflow-x-visible pb-2 pt-0.5 px-0.5 snap-x snap-mandatory lg:snap-none scrollbar-none select-none touch-pan-x ${
            hasOverflow
              ? isMouseDown
                ? "cursor-grabbing"
                : "cursor-grab lg:cursor-default"
              : "cursor-default"
          }`}
          style={{
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-x",
            scrollbarWidth: "none",
            msOverflowStyle: "none"
          }}
        >
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = activeStep === s.stepNum;
            const isCompleted = activeStep > s.stepNum;

            return (
              <motion.button
                key={s.stepNum}
                id={`guided-step-${s.stepNum}-btn`}
                onClick={() => handleStepClick(s)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.985 }}
                className={`text-left p-3 rounded-xl border transition-colors relative flex flex-col justify-between group min-h-[96px] shrink-0 w-[240px] sm:w-[260px] lg:w-auto snap-center lg:snap-align-none cursor-pointer ${
                  isActive
                    ? "border-[#4A5D4E]"
                    : isCompleted
                    ? "bg-white border-[#EAE7E0] hover:border-[#4A5D4E]/50 hover:bg-[#F9F8F4]"
                    : "bg-white border-[#EAE7E0] hover:border-[#4A5D4E]/40 hover:bg-[#F9F8F4]"
                }`}
              >
                {/* Smooth Horizontal Sliding Active Background Highlight */}
                {isActive && (
                  <motion.div
                    layoutId="activeStepHighlight"
                    className="absolute inset-0 bg-[#F1EFE9] rounded-xl -z-0 ring-1 ring-[#4A5D4E] shadow-xs"
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
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
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
                </div>

                {/* Active Step Indicator with Horizontal Slide-In Animation */}
                <div className="relative z-10 w-full min-h-[22px] flex items-center">
                  <AnimatePresence mode="wait">
                    {isActive && (
                      <motion.div
                        key={`active-indicator-${s.stepNum}`}
                        initial={{ opacity: 0, x: -14 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 14 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="mt-1 pt-1 border-t border-[#4A5D4E]/20 w-full flex items-center justify-between text-[10px] font-bold text-[#4A5D4E]"
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
    </div>
  );
};


