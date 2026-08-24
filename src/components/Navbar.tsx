import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Home, 
  LayoutDashboard, 
  Compass, 
  Calculator, 
  Sparkles, 
  Award, 
  Menu, 
  X,
  ShieldCheck,
  Building,
  TrendingUp,
  TrendingDown,
  Minus,
  FileText,
  UserCheck,
  RotateCcw,
  Zap,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Layers,
  CheckCircle2,
  Calendar,
  Info,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { FinancialProfile } from "../types";
import { formatUSD } from "../utils/mortgageMath";
import { analyzeRateTrends, TrendHorizon } from "../utils/rateTrends";

export interface NavItem {
  id: string;
  label: string;
  shortLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  mode: "website" | "dashboard";
  highlight?: boolean;
}

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  activeMode: "website" | "dashboard";
  setActiveMode: (mode: "website" | "dashboard") => void;
  profile: FinancialProfile;
  setProfile?: React.Dispatch<React.SetStateAction<FinancialProfile>>;
  savedCount: number;
  onOpenLoPortal?: () => void;
  onOpenLeadBot?: () => void;
  loName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  activeMode,
  setActiveMode,
  profile,
  setProfile,
  savedCount,
  onOpenLoPortal,
  onOpenLeadBot,
  loName = "Mike Ford"
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isHoveringNav, setIsHoveringNav] = useState(false);

  // Interest Rate Trends & Timeline Selection State
  const [trendHorizon, setTrendHorizon] = useState<TrendHorizon>("1w");
  const [showTrendDetails, setShowTrendDetails] = useState(false);
  const trendPopoverRef = useRef<HTMLDivElement>(null);

  // Compute live mathematical trend analysis on backside benchmark data
  const rateTrend = analyzeRateTrends(trendHorizon);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (trendPopoverRef.current && !trendPopoverRef.current.contains(event.target as Node)) {
        setShowTrendDetails(false);
      }
    };
    if (showTrendDetails) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showTrendDetails]);

  // All Public & Interactive Roadmap Navigation Items
  const allNavItems: NavItem[] = [
    { id: "hero", label: "Home / Overview", shortLabel: "Overview", icon: Home, mode: "website" },
    { id: "calculator", label: "Step 1: Calculate Buying Power", shortLabel: "Step 1: Buying Power", icon: Calculator, mode: "website" },
    { id: "roadmap", label: "Step 2: Explore Roadmap", shortLabel: "Step 2: Roadmap", icon: Compass, mode: "website" },
    { id: "grants", label: "Grants & DPA Finder", shortLabel: "Grants & DPA", icon: Award, mode: "website" },
    { id: "dashboard", label: "Step 3: Buyer Dashboard", shortLabel: "Step 3: Dashboard", icon: LayoutDashboard, mode: "dashboard" },
    { id: "step4_ai_plan", label: "Step 4: AI Plan & Guides", shortLabel: "Step 4: AI Plan", icon: Sparkles, badge: "AI Plan", mode: "dashboard", highlight: true },
    { id: "properties", label: `Saved Homes (${savedCount})`, shortLabel: `Homes (${savedCount})`, icon: Building, mode: "dashboard" },
    { id: "mortgagelab", label: "Mortgage Lab & PITI", shortLabel: "Mortgage Lab", icon: TrendingUp, mode: "dashboard" },
    { id: "ai_copilot", label: "AI Advisor Copilot", shortLabel: "AI Advisor", icon: Sparkles, badge: "Gemini 3.7", mode: "dashboard" },
    { id: "escrow", label: "Closing & Escrow Tracker", shortLabel: "Closing Tracker", icon: ShieldCheck, mode: "dashboard" },
    { id: "documents", label: "Document Vault", shortLabel: "Doc Vault", icon: FileText, mode: "dashboard" },
  ];

  // Check scroll positions and update arrow button states
  const checkScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
  }, []);

  // Smooth scroll handler for buttons
  const handleScroll = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = Math.max(220, Math.floor(el.clientWidth * 0.55));
    const target = direction === "left" ? el.scrollLeft - scrollAmount : el.scrollLeft + scrollAmount;
    el.scrollTo({ left: target, behavior: "smooth" });
    setTimeout(checkScroll, 320);
  };

  // Listen to resize and scroll events
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    checkScroll();
    const handleResize = () => checkScroll();
    window.addEventListener("resize", handleResize);

    // Initial checks after font and layout load
    const timer1 = setTimeout(checkScroll, 150);
    const timer2 = setTimeout(checkScroll, 500);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [checkScroll]);

  // Center active item in scrollview when tab changes
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const activeEl = el.querySelector<HTMLElement>(`[data-nav-id="${currentTab}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
    const timer = setTimeout(checkScroll, 350);
    return () => clearTimeout(timer);
  }, [currentTab, checkScroll]);

  const handleNavClick = (tabId: string, targetMode?: "website" | "dashboard") => {
    if (targetMode) {
      setActiveMode(targetMode);
    }
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EAE7E0] text-[#2D362E] shadow-2xs">
      {/* Top micro-banner for market rates benchmark trends & savings glance */}
      <div className="bg-[#F1EFE9] px-3 sm:px-6 py-1.5 text-xs text-[#606C5D] border-b border-[#EAE7E0] relative z-50">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          
          {/* Left section: Arrow Trend + Horizon Selection + 1-Year Benchmark Match */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            
            {/* Directional Trend Pill with Dynamic Arrow Up / Down */}
            <div 
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer select-none ${
                rateTrend.direction === "down"
                  ? "bg-[#EBF3ED] text-[#2F5738] border border-[#C2DEC8]"
                  : rateTrend.direction === "up"
                  ? "bg-[#FDF0E6] text-[#91461A] border border-[#F6D0B5]"
                  : "bg-white text-[#606C5D] border border-[#EAE7E0]"
              }`}
              onClick={() => setShowTrendDetails(!showTrendDetails)}
              title="Click to view detailed interest rate trend analysis"
            >
              {rateTrend.direction === "down" ? (
                <div className="flex items-center gap-1">
                  <ArrowDownRight className="w-4 h-4 text-[#2F5738] animate-pulse" />
                  <span>Rate Trend: Easing ↓</span>
                </div>
              ) : rateTrend.direction === "up" ? (
                <div className="flex items-center gap-1">
                  <ArrowUpRight className="w-4 h-4 text-[#91461A]" />
                  <span>Rate Trend: Rising ↑</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Minus className="w-4 h-4 text-[#606C5D]" />
                  <span>Rate Trend: Stable →</span>
                </div>
              )}
            </div>

            {/* Time Horizon Selection Buttons (1 Week, 90 Days, 6 Months) */}
            <div className="flex items-center bg-white p-0.5 rounded-lg border border-[#DEDAD2] shadow-2xs">
              <span className="text-[10px] font-bold text-[#9A9488] px-1.5 uppercase hidden sm:inline">Horizon:</span>
              {(
                [
                  { id: "1w", label: "1 Week", short: "1W" },
                  { id: "90d", label: "90 Days", short: "90D" },
                  { id: "6m", label: "6 Months", short: "6M" },
                ] as const
              ).map((h) => {
                const isSelected = trendHorizon === h.id;
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => setTrendHorizon(h.id)}
                    className={`px-2 py-0.5 text-[11px] font-bold rounded-md transition-all ${
                      isSelected
                        ? "bg-[#4A5D4E] text-white shadow-xs"
                        : "text-[#606C5D] hover:text-[#2D362E] hover:bg-[#F1EFE9]"
                    }`}
                    title={`Analyze rate momentum over the last ${h.label}`}
                  >
                    <span className="hidden sm:inline">{h.label}</span>
                    <span className="sm:hidden">{h.short}</span>
                  </button>
                );
              })}
            </div>

            {/* 1-Year Benchmark Comparison Highlight Data Point */}
            <div className="relative">
              {rateTrend.isOneYearHigh ? (
                <button
                  type="button"
                  onClick={() => setShowTrendDetails(!showTrendDetails)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#C18C5D]/15 text-[#C18C5D] font-bold text-[11px] border border-[#C18C5D]/30 hover:bg-[#C18C5D]/25 transition-colors"
                  title="Highest rate peak observed in the most recent 12 months"
                >
                  <Zap className="w-3 h-3 text-[#C18C5D]" />
                  <span>1-Yr High Benchmark</span>
                  <Info className="w-3 h-3 text-[#C18C5D]/70 ml-0.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowTrendDetails(!showTrendDetails)}
                  className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white hover:bg-[#FAF9F5] text-[#2D362E] text-[11px] font-semibold border border-[#DEDAD2] transition-colors shadow-2xs group cursor-pointer"
                  title="Click to view full 1-year historical benchmark rate comparison"
                >
                  <Calendar className="w-3 h-3 text-[#4A5D4E] group-hover:scale-110 transition-transform" />
                  <span className="text-[#606C5D]">
                    Last Matched Level:{" "}
                    <strong className="text-[#4A5D4E] font-bold underline decoration-dotted">
                      {rateTrend.lastMatchedDateFormatted || "Dec 15, 2025"}
                    </strong>
                  </span>
                  <Info className="w-3 h-3 text-[#9A9488]" />
                </button>
              )}

              {/* Detailed Trend & Historical Match Popover Card */}
              {showTrendDetails && (
                <div 
                  ref={trendPopoverRef}
                  className="absolute left-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl p-4 shadow-xl border border-[#DEDAD2] text-[#2D362E] z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="flex items-start justify-between pb-2 border-b border-[#EAE7E0]">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${
                        rateTrend.direction === "down"
                          ? "bg-emerald-100 text-emerald-800"
                          : rateTrend.direction === "up"
                          ? "bg-amber-100 text-amber-900"
                          : "bg-stone-100 text-stone-700"
                      }`}>
                        {rateTrend.direction === "down" ? "↓" : rateTrend.direction === "up" ? "↑" : "→"}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-[#2D362E]">
                          Mortgage Rate Momentum ({rateTrend.horizonLabel})
                        </h4>
                        <p className="text-[11px] text-[#606C5D]">
                          Directional 30-Yr Benchmark Trajectory
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowTrendDetails(false)}
                      className="p-1 rounded-lg text-[#9A9488] hover:text-[#2D362E] hover:bg-[#F1EFE9]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="py-3 space-y-2.5 text-xs">
                    <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EAE7E0]">
                      <div className="font-bold text-[#4A5D4E] flex items-center gap-1.5 mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#C18C5D]" />
                        <span>{rateTrend.directionLabel}</span>
                      </div>
                      <p className="text-[#606C5D] text-[11px] leading-relaxed">
                        {rateTrend.insight}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-[#EAE7E0] space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold text-[#2D362E] text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-[#606C5D]" />
                        <span>1-Year Historical Context:</span>
                      </div>
                      {rateTrend.isOneYearHigh ? (
                        <p className="text-[11px] text-[#91461A] leading-relaxed font-medium">
                          Today's benchmark is near the peak level observed in the most recent 12 months. Consider negotiating seller concessions to fund a 2-1 buydown.
                        </p>
                      ) : (
                        <p className="text-[11px] text-[#4A5D4E] leading-relaxed font-medium">
                          Today's benchmark is <strong>not</strong> the 1-year high. The last time rates traded at today's matching level was <strong>{rateTrend.lastMatchedDateFormatted}</strong>.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#EAE7E0] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowTrendDetails(false);
                        handleNavClick("mortgagelab", "dashboard");
                      }}
                      className="text-[11px] font-bold text-[#4A5D4E] hover:underline flex items-center gap-1"
                    >
                      <TrendingUp className="w-3 h-3" />
                      <span>Test in Mortgage Lab →</span>
                    </button>
                    <span className="text-[10px] text-[#9A9488]">Calculated on 30-Yr Benchmark</span>
                  </div>
                </div>
              )}
            </div>

            {/* DPA Grant Quick Badge */}
            <button
              onClick={() => handleNavClick("grants", "website")}
              className="text-[#C18C5D] font-medium hidden md:flex items-center gap-1 hover:text-[#a67448] transition-colors"
            >
              <Award className="w-3 h-3" /> State & Local DPA Grants Available
            </button>
          </div>

          {/* Right section: Interactive Target Purchase Price & Cash Saved Inputs + Gyrating Dark Green GO Button */}
          <div className="flex items-center gap-2 text-[#606C5D] shrink-0">
            {/* Target Purchase Price Input Box */}
            <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-lg border border-[#DEDAD2] shadow-2xs">
              <span className="text-[11px] font-semibold text-[#606C5D] hidden sm:inline">Target Price:</span>
              <span className="text-[11px] font-semibold text-[#606C5D] sm:hidden">Target:</span>
              <div className="relative flex items-center">
                <span className="text-[11px] font-bold text-[#2D362E] mr-0.5">$</span>
                <input
                  id="navbar-target-price-input"
                  type="number"
                  min="0"
                  step="5000"
                  value={profile.targetPrice}
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value) || 0);
                    setProfile?.(prev => ({ ...prev, targetPrice: val }));
                  }}
                  className="w-18 sm:w-22 text-xs font-bold text-[#2D362E] bg-transparent focus:outline-none focus:text-[#1E3B27]"
                  title="Enter Target Purchase Price"
                />
              </div>
            </div>

            {/* Cash Saved Input Box */}
            <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-lg border border-[#DEDAD2] shadow-2xs">
              <span className="text-[11px] font-semibold text-[#606C5D] hidden sm:inline">Cash Saved:</span>
              <span className="text-[11px] font-semibold text-[#606C5D] sm:hidden">Saved:</span>
              <div className="relative flex items-center">
                <span className="text-[11px] font-bold text-[#4A5D4E] mr-0.5">$</span>
                <input
                  id="navbar-cash-saved-input"
                  type="number"
                  min="0"
                  step="1000"
                  value={profile.downPaymentSavings}
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value) || 0);
                    setProfile?.(prev => ({ ...prev, downPaymentSavings: val }));
                  }}
                  className="w-16 sm:w-20 text-xs font-bold text-[#4A5D4E] bg-transparent focus:outline-none focus:text-[#1E3B27]"
                  title="Enter Cash Saved for Down Payment"
                />
              </div>
            </div>

            {/* Dark Green Gyrating/Active GO Button */}
            <button
              id="navbar-scenario-go-btn"
              type="button"
              onClick={() => handleNavClick("calculator", "website")}
              className="bg-[#183922] hover:bg-[#112a19] active:bg-[#0c1e12] text-white border border-[#2b5736] px-3.5 py-0.5 sm:py-1 rounded-lg font-black text-xs sm:text-sm tracking-widest shadow-md animate-gyrate transition-all flex items-center justify-center cursor-pointer select-none"
              title="Apply numbers & navigate to Step 1: Calculate Buying Power"
            >
              <span className="text-white font-black tracking-widest text-xs sm:text-sm">GO</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main Header Bar with Brand, Guided Mode Switcher, Horizontal Scroll Menu, and Action CTAs */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2 lg:gap-3">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              id="navbar-brand-logo-btn"
              type="button"
              onClick={() => {
                setActiveMode("website");
                setCurrentTab("hero");
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex items-center gap-2 sm:gap-2.5 text-left group focus:outline-none cursor-pointer"
              title="Return to start: First-Time Homebuyer Roadmap"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#606C5D] rounded-xl flex items-center justify-center text-white font-bold shadow-xs group-hover:scale-105 transition-transform shrink-0">
                <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm sm:text-base font-bold tracking-tight text-[#4A5D4E] whitespace-nowrap">
                    First-Time Homebuyer
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#F1EFE9] text-[#4A5D4E] border border-[#EAE7E0] uppercase tracking-wider">
                    Roadmap
                  </span>
                </div>
                <p className="text-[10px] text-[#9A9488] hidden sm:block font-medium">
                  Clarity & Confidence from Search to Closing
                </p>
              </div>
            </button>
          </div>

          {/* Mode Pill Toggle (Explore vs Dashboard) */}
          <div className="hidden xl:flex items-center bg-[#F1EFE9] p-1 rounded-xl border border-[#EAE7E0] shrink-0">
            <button
              id="navbar-step1-2-explore-btn"
              type="button"
              onClick={() => {
                setActiveMode("website");
                if (currentTab === "hero" || !["calculator", "roadmap", "grants"].includes(currentTab)) {
                  setCurrentTab("calculator");
                }
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeMode === "website"
                  ? "bg-[#4A5D4E] text-white shadow-xs"
                  : "text-[#606C5D] hover:text-[#2D362E] hover:bg-[#FAF9F5]"
              }`}
              title="Step 1 & 2: Buying power, PITI analysis, interactive roadmap & grants"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Step 1 & 2: Explore</span>
            </button>
            <button
              id="navbar-step3-4-dashboard-btn"
              type="button"
              onClick={() => {
                setActiveMode("dashboard");
                if (!["dashboard", "step4_ai_plan", "properties", "mortgagelab", "ai_copilot", "escrow", "documents"].includes(currentTab)) {
                  setCurrentTab("dashboard");
                }
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all relative cursor-pointer ${
                activeMode === "dashboard"
                  ? "bg-[#4A5D4E] text-white shadow-xs"
                  : "text-[#606C5D] hover:text-[#2D362E] hover:bg-[#FAF9F5]"
              }`}
              title="Step 3 & 4: Buyer Dashboard, AI Plan & Local Professional Guides"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Step 3 & 4: Dashboard</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#C18C5D] absolute top-1 right-1" />
            </button>
          </div>

          {/* ======================================================== */}
          {/* ENHANCED HORIZONTAL SCROLLING MENU WITH LEFT/RIGHT ARROWS */}
          {/* ======================================================== */}
          <div 
            className="hidden md:flex items-center flex-1 min-w-0 mx-1 lg:mx-2 relative group/nav"
            onMouseEnter={() => setIsHoveringNav(true)}
            onMouseLeave={() => setIsHoveringNav(false)}
          >
            {/* Left Scroll Navigation Button */}
            <div className="relative shrink-0 z-20 flex items-center pr-1">
              <button
                type="button"
                onClick={() => handleScroll("left")}
                disabled={!canScrollLeft}
                aria-label="Scroll navigation menu left"
                className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all duration-200 shadow-xs ${
                  canScrollLeft
                    ? "bg-white border-[#DCD7CD] text-[#2D362E] hover:bg-[#F1EFE9] hover:border-[#606C5D] hover:scale-105 cursor-pointer"
                    : "bg-white/40 border-[#EAE7E0]/60 text-[#C4BEB5] cursor-not-allowed opacity-40"
                }`}
                title="Scroll menu left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Left Gradient Edge Fade (Visual cue that more items exist to the left) */}
            {canScrollLeft && (
              <div 
                aria-hidden="true" 
                className="absolute left-7 top-0 bottom-0 w-6 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none transition-opacity duration-200" 
              />
            )}

            {/* Scrollable Nav Track */}
            <nav
              ref={scrollContainerRef}
              onScroll={checkScroll}
              className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1 flex-1 min-w-0"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {allNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                const isWebsiteMode = item.mode === "website";

                return (
                  <button
                    key={item.id}
                    data-nav-id={item.id}
                    onClick={() => handleNavClick(item.id, item.mode)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 group ${
                      isActive
                        ? "bg-[#606C5D] text-white shadow-xs ring-1 ring-[#4A5D4E]"
                        : item.highlight
                        ? "bg-[#C18C5D]/10 text-[#C18C5D] hover:bg-[#C18C5D] hover:text-white border border-[#C18C5D]/30"
                        : "text-[#4A5D4E] hover:bg-[#F1EFE9] hover:text-[#2D362E] bg-white/70 border border-[#EAE7E0]"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? "text-white" : item.highlight ? "text-[#C18C5D] group-hover:text-white" : "text-[#606C5D]"
                    }`} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-extrabold uppercase tracking-wide leading-none ${
                        isActive 
                          ? "bg-white/20 text-white" 
                          : item.highlight
                          ? "bg-[#C18C5D] text-white group-hover:bg-white group-hover:text-[#C18C5D]"
                          : "bg-[#C18C5D]/15 text-[#C18C5D] border border-[#C18C5D]/30"
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Gradient Edge Fade (Visual cue that more items exist to the right) */}
            {canScrollRight && (
              <div 
                aria-hidden="true" 
                className="absolute right-7 top-0 bottom-0 w-6 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none transition-opacity duration-200" 
              />
            )}

            {/* Right Scroll Navigation Button */}
            <div className="relative shrink-0 z-20 flex items-center pl-1">
              <button
                type="button"
                onClick={() => handleScroll("right")}
                disabled={!canScrollRight}
                aria-label="Scroll navigation menu right"
                className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all duration-200 shadow-xs ${
                  canScrollRight
                    ? "bg-white border-[#DCD7CD] text-[#2D362E] hover:bg-[#F1EFE9] hover:border-[#606C5D] hover:scale-105 cursor-pointer"
                    : "bg-white/40 border-[#EAE7E0]/60 text-[#C4BEB5] cursor-not-allowed opacity-40"
                }`}
                title="Scroll menu right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick CTA Actions (Pre-Approval & LO Hub) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {onOpenLeadBot && (
              <button
                onClick={onOpenLeadBot}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C18C5D] hover:bg-[#a67448] text-white font-semibold text-xs shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
                title="Start 24/7 AI Pre-Approval Assessment"
              >
                <Zap className="w-3.5 h-3.5 text-white" />
                <span className="hidden xl:inline">24/7 AI Pre-Approval</span>
                <span className="xl:hidden">Pre-Approval</span>
              </button>
            )}

            {onOpenLoPortal && (
              <button
                id="navbar-lo-portal-btn"
                onClick={onOpenLoPortal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#F1EFE9] hover:bg-[#EAE7E0] text-[#606C5D] hover:text-[#2D362E] text-xs font-semibold border border-[#EAE7E0] transition-all hover:scale-[1.02] whitespace-nowrap"
                title={`Loan Officer & Realtor Partner Hub (${loName})`}
              >
                <Sliders className="w-3.5 h-3.5 text-[#4A5D4E]" />
                <span className="hidden lg:inline">LO Hub</span>
              </button>
            )}

            {/* Mobile menu hamburger button */}
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl bg-[#F1EFE9] text-[#606C5D] hover:text-[#2D362E] border border-[#EAE7E0] focus:outline-none"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ======================================================== */}
      {/* MOBILE EXPANDED DRAWER MENU                             */}
      {/* ======================================================== */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#EAE7E0] px-4 pt-3 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top duration-200 max-h-[85vh] overflow-y-auto">
          {/* Quick Return to Start for Mobile */}
          <button
            onClick={() => {
              setActiveMode("website");
              handleNavClick("hero", "website");
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#F1EFE9] text-[#4A5D4E] font-bold text-xs border border-[#EAE7E0]"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#C18C5D]" />
            <span>Return to Start / Overview</span>
          </button>

          {/* Mode Switcher for Mobile */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#F1EFE9] rounded-xl border border-[#EAE7E0]">
            <button
              id="mobile-step1-2-explore-btn"
              type="button"
              onClick={() => {
                setActiveMode("website");
                if (currentTab === "hero" || !["calculator", "roadmap", "grants"].includes(currentTab)) {
                  setCurrentTab("calculator");
                }
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeMode === "website" ? "bg-[#4A5D4E] text-white shadow-xs" : "text-[#606C5D]"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Step 1 & 2: Explore
            </button>
            <button
              id="mobile-step3-4-dashboard-btn"
              type="button"
              onClick={() => {
                setActiveMode("dashboard");
                if (!["dashboard", "step4_ai_plan", "properties", "mortgagelab", "ai_copilot", "escrow", "documents"].includes(currentTab)) {
                  setCurrentTab("dashboard");
                }
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeMode === "dashboard" ? "bg-[#4A5D4E] text-white shadow-xs" : "text-[#606C5D]"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Step 3 & 4: Dashboard
            </button>
          </div>

          {/* Menu Items List */}
          <div className="space-y-1">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#9A9488] px-2 pt-2">
              {activeMode === "website" ? "Phase 1 & 2: Planning & Research" : "Phase 3 & 4: Search, AI Plan & Closing"}
            </div>
            {allNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id, item.mode)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                    isActive
                      ? "bg-[#606C5D] text-white font-bold shadow-xs"
                      : "text-[#2D362E] hover:bg-[#F1EFE9] font-medium"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-[#606C5D]"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-[#C18C5D]/15 text-[#C18C5D]"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Actions Footer inside Drawer */}
          <div className="pt-3 border-t border-[#EAE7E0] space-y-2">
            {onOpenLeadBot && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLeadBot();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#C18C5D] text-white font-semibold text-sm shadow-xs"
              >
                <Zap className="w-4 h-4 text-white" />
                <span>Start 24/7 AI Pre-Approval</span>
              </button>
            )}

            <button
              onClick={() => {
                setActiveMode("dashboard");
                handleNavClick("step4_ai_plan", "dashboard");
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#4A5D4E] text-white font-semibold text-sm shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-[#D4A373]" />
              <span>Step 4: AI Plan & Local Guides</span>
            </button>

            {onOpenLoPortal && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLoPortal();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[#F1EFE9] text-[#606C5D] font-semibold text-xs border border-[#EAE7E0]"
              >
                <Sliders className="w-3.5 h-3.5 text-[#4A5D4E]" />
                <span>Loan Officer & Realtor Hub ({loName})</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};


