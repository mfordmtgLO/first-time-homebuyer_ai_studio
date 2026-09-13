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
  Key,
  TrendingUp,
  TrendingDown,
  Minus,
  FileText,
  UserCheck,
  Users,
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
  ArrowDownRight,
  Globe,
  Maximize2,
  Minimize2,
  ExternalLink,
  Video
} from "lucide-react";
import { FinancialProfile } from "../types";
import { formatUSD } from "../utils/mortgageMath";
import { analyzeRateTrends, TrendHorizon } from "../utils/rateTrends";
import { PWAInstallButton } from "./PWAInstallButton";
import { ThemeToggle } from "./ThemeToggle";

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
  onOpenLoAds?: () => void;
  onOpenLeadBot?: () => void;
  onNavigateToGuides?: () => void;
  loName?: string;
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
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
  onOpenLoAds,
  onOpenLeadBot,
  onNavigateToGuides,
  loName = "Mike Ford",
  isFullScreen = false,
  onToggleFullScreen
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
    { id: "properties", label: `Step 3: Browse Homes (${savedCount})`, shortLabel: `Homes (${savedCount})`, icon: Building, mode: "dashboard" },
    { id: "step4_ai_plan", label: "Step 4: AI Plan & Guides", shortLabel: "Step 4: AI Plan", icon: Sparkles, badge: "AI Plan", mode: "dashboard", highlight: true },
    { id: "grants", label: "Down Payment Assistance (DPA) Finder", shortLabel: "DPA Finder", icon: Award, mode: "dashboard" },
    { id: "mortgagelab", label: "Mortgage Lab & PITI", shortLabel: "Mortgage Lab", icon: TrendingUp, mode: "dashboard" },
    { id: "ai_copilot", label: "AI Advisor Copilot", shortLabel: "AI Advisor", icon: Sparkles, badge: "Gemini 3.7", mode: "dashboard" },
    { id: "escrow", label: "Closing & Escrow Tracker", shortLabel: "Closing Tracker", icon: ShieldCheck, mode: "dashboard" },
    { id: "market_trends", label: "Market Trends & Insights", shortLabel: "Market Trends", icon: Globe, badge: "Live", mode: "dashboard" },
  ];

  // Secondary Tools Nav Items (Steps 1-4 removed because they are in the dedicated Guided 4-Step block; DPA is secured to dashboard mode)
  const nonStepNavItems = allNavItems.filter((item) => {
    if (["hero", "calculator", "roadmap", "properties", "step4_ai_plan", "dashboard"].includes(item.id)) return false;
    if (activeMode === "website" && item.id === "grants") return false;
    return true;
  });

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
    <header className="w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-[#EAE7E0] dark:border-slate-800 text-[#2D362E] dark:text-slate-100 transition-colors duration-200">
      {/* Top micro-banner for dashboard users / public roadmap orientation for website visitors */}
      <div className="hidden md:block bg-[#F1EFE9] dark:bg-slate-900 px-3 sm:px-6 py-1.5 text-xs text-[#606C5D] dark:text-slate-400 border-b border-[#EAE7E0] dark:border-slate-800 relative z-50 transition-colors duration-200">
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

            {/* Top Bar DPA / Status Quick Link */}
            {activeMode === "dashboard" ? (
              <button
                onClick={() => handleNavClick("grants", "dashboard")}
                className="text-[#C18C5D] font-medium hidden md:flex items-center gap-1 hover:text-[#a67448] transition-colors cursor-pointer text-xs"
              >
                <Award className="w-3.5 h-3.5" /> Secured DPA Grant Finder
              </button>
            ) : (
              <span className="text-[#606C5D] text-xs font-medium hidden md:flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#4A5D4E]" /> First-Time Homebuyer Guidance
              </span>
            )}
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

            {/* Full-Screen Workspace Toggle Button in Micro-Bar */}
            {onToggleFullScreen && (
              <button
                id="navbar-fullscreen-toggle-micro-btn"
                type="button"
                onClick={onToggleFullScreen}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-[#F1EFE9] border border-[#DEDAD2] text-[#4A5D4E] hover:text-[#2D362E] text-xs font-bold shadow-2xs transition-all cursor-pointer"
                title={isFullScreen ? "Exit Full-Screen Workspace (Esc)" : "Full-Screen Workspace (Hides navigation & sidebar for maximum document & property analysis area)"}
              >
                {isFullScreen ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5 text-[#C18C5D]" />
                    <span className="text-[11px]">Exit Full Screen</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 text-[#4A5D4E]" />
                    <span className="text-[11px]">Full Screen</span>
                  </>
                )}
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Main Header Brand & Value Proposition Line (Desktop & Tablet Only) */}
      <div className="hidden md:block border-b border-[#EAE7E0] dark:border-slate-800 bg-[#FAF9F5]/70 dark:bg-slate-900/70 py-4 px-6 lg:px-8 transition-colors duration-200">
        <div className="max-w-7xl mx-auto space-y-3">
          
          {/* Top Utility Toolbar: Renter Hook on Left, Action Buttons on Right */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#EAE7E0]/60 dark:border-slate-800">
            {/* Top Pill / Trust Hook for Renters */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAE7E0]/80 border border-[#DCD7CD] text-[11px] sm:text-xs font-bold text-[#4A5D4E] shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#C18C5D] animate-pulse" />
              <span className="font-extrabold uppercase tracking-wider text-[#C18C5D]">Stop Paying Rent</span>
              <span className="text-[#606C5D]">•</span>
              <span className="text-[#2D362E]">2026 Interactive First-Time Homebuyer Blueprint</span>
            </div>

            {/* Top-Right Action Controls Toolbar */}
            <div className="flex items-center gap-2">
              <div className="flex sm:flex">
                <ThemeToggle />
              </div>

              {onToggleFullScreen && (
                <button
                  id="navbar-fullscreen-toggle-btn"
                  type="button"
                  onClick={onToggleFullScreen}
                  className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer border ${
                    isFullScreen 
                      ? "bg-[#C18C5D] text-white border-[#A67448] hover:bg-[#A67448]" 
                      : "bg-white text-[#4A5D4E] border-[#EAE7E0] hover:bg-[#F1EFE9] hover:text-[#2D362E]"
                  }`}
                  title={isFullScreen ? "Exit Full-Screen Workspace (Esc)" : "Full-Screen Workspace (Hides navigation & sidebar for maximum document & property analysis area)"}
                >
                  {isFullScreen ? (
                    <>
                      <Minimize2 className="w-4 h-4 text-white" />
                      <span>Exit Full Screen</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-4 h-4 text-[#4A5D4E]" />
                      <span>Full Screen</span>
                    </>
                  )}
                </button>
              )}

              {/* Direct Loan Officer Portal & AI Video Ads Generator Button */}
              {(onOpenLoAds || onOpenLoPortal) && (
                <button
                  id="navbar-lo-ads-portal-btn"
                  type="button"
                  onClick={onOpenLoAds || onOpenLoPortal}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap cursor-pointer"
                  title="Open Loan Officer Marketing Suite: AI Commercial & Video Ads Studio"
                >
                  <Video className="w-4 h-4 text-amber-600" />
                  <span className="hidden sm:inline">AI Video Ads Studio</span>
                  <span className="text-[10px] bg-amber-200 text-amber-950 font-bold px-1.5 py-0.5 rounded-md">
                    LO Portal
                  </span>
                </button>
              )}

              {/* Pop-out / Open in New Tab Button */}
              <a
                id="navbar-open-newtab-btn"
                href={window.location.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer border bg-white text-[#606C5D] border-[#EAE7E0] hover:bg-[#F1EFE9] hover:text-[#2D362E]"
                title="Open application in a full independent browser tab (↗)"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#4A5D4E]" />
                <span className="hidden md:inline">New Tab</span>
              </a>

              {onOpenLeadBot && (
                <button
                  onClick={onOpenLeadBot}
                  className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C18C5D] hover:bg-[#a67448] text-white font-bold text-xs shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap cursor-pointer"
                  title="Start 24/7 AI Prequalification Assessment"
                >
                  <Zap className="w-4 h-4 text-white" />
                  <span>24/7 AI Prequal</span>
                </button>
              )}

              {/* Mobile menu hamburger button */}
              <div className="flex md:hidden items-center">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-xl bg-white text-[#606C5D] hover:text-[#2D362E] border border-[#EAE7E0] shadow-2xs focus:outline-none cursor-pointer"
                  aria-label="Toggle Navigation Menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Centered Main Title Area */}
          <div className="flex flex-col items-center text-center pt-1">
            <button
              id="navbar-brand-logo-btn"
              type="button"
              onClick={() => {
                setActiveMode("website");
                setCurrentTab("hero");
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="group inline-flex items-center justify-center gap-3 cursor-pointer focus:outline-none transition-transform hover:scale-[1.01]"
              title="Return to First-Time Homebuyer Roadmap Overview"
            >
              <div className="w-10 h-10 bg-[#4A5D4E] rounded-2xl flex items-center justify-center text-white font-bold shadow-sm group-hover:bg-[#38463B] transition-colors shrink-0">
                <Compass className="w-6 h-6 text-white group-hover:rotate-45 transition-transform duration-300" />
              </div>
              <h1 className="text-2xl lg:text-4xl font-serif font-black tracking-tight text-[#2D362E] dark:text-slate-100 drop-shadow-2xs text-center leading-tight">
                First-Time Homebuyer <span className="text-[#4A5D4E] dark:text-[#D4A373] font-serif">Roadmap</span>
              </h1>
            </button>

            {/* Renter Conversion Subtitle: Clear Purpose & Actionable Excitement */}
            <p className="mt-2 text-xs sm:text-sm md:text-base text-[#606C5D] max-w-3xl font-medium leading-relaxed px-2">
              Calculate your true buying power, check verified Down Payment Assistance (DPA), and model prequal scenarios across <strong className="text-[#2D362E] font-bold">Steps 1–4</strong> with zero guesswork.
            </p>

            {/* Quick Renter Trust Chips */}
            <div className="mt-2.5 flex items-center justify-center gap-3 sm:gap-6 text-[11px] font-semibold text-[#606C5D]">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4A5D4E]" />
                100% Free & Transparent
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4A5D4E]" />
                No Credit Card or SSN Required
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4A5D4E]" />
                FHA 3.5% & Conv 3% Models
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* ======================================================== */}
      {/* MOBILE-ONLY COMPACT HEADER                               */}
      {/* ======================================================== */}
      <div className="md:hidden flex items-center justify-between px-4 py-2.5 bg-white/95 dark:bg-slate-950/95 border-b border-[#EAE7E0] dark:border-slate-800">
        <button
          onClick={() => {
            setActiveMode("website");
            setCurrentTab("hero");
            setMobileMenuOpen(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex items-center gap-2 cursor-pointer focus:outline-none"
        >
          <div className="w-7 h-7 bg-[#4A5D4E] rounded-xl flex items-center justify-center shrink-0 shadow-sm">
            <Compass className="w-4 h-4 text-white" />
          </div>
          <span className="font-serif font-black tracking-tight text-sm text-[#2D362E] dark:text-slate-100">
            First-Time <span className="text-[#4A5D4E] dark:text-[#D4A373]">Homebuyer</span>
          </span>
        </button>
        
        <div className="flex items-center gap-2">
          {onOpenLeadBot && (
            <button
              onClick={onOpenLeadBot}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#C18C5D] active:bg-[#a67448] text-white font-bold text-[10px] shadow-sm transition-all"
            >
              <Zap className="w-3 h-3" />
              <span>AI Prequal</span>
            </button>
          )}
          <div className="sm:hidden"><PWAInstallButton className="h-7 py-0.5 px-2 text-[10px]" /></div>
          <div className="hidden sm:block"><PWAInstallButton className="h-8 py-1 px-2" /></div>
          <ThemeToggle className="h-8 w-8" />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-900 text-[#606C5D] dark:text-slate-300 border border-[#EAE7E0] dark:border-slate-700 shadow-sm focus:outline-none cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TABLET HORIZONTAL SCROLLING MENU (hidden on mobile and desktop) */}
      {/* ======================================================== */}
      <div className="hidden md:block lg:hidden border-t border-[#EAE7E0] dark:border-slate-800 max-w-7xl mx-auto px-6 py-2 bg-white dark:bg-slate-950 transition-colors duration-200">
        <div className="flex items-center justify-between gap-2">
          
          {/* Scroll Navigation Left Button */}
          <button
            type="button"
            onClick={() => handleScroll("left")}
            disabled={!canScrollLeft}
            aria-label="Scroll navigation menu left"
            className={`shrink-0 w-8 h-8 rounded-xl border flex items-center justify-center transition-all duration-200 shadow-2xs z-20 ${
              canScrollLeft
                ? "bg-white border-[#DCD7CD] text-[#2D362E] hover:bg-[#F1EFE9] hover:border-[#606C5D] hover:scale-105 cursor-pointer"
                : "bg-white/40 border-[#EAE7E0]/60 text-[#C4BEB5] cursor-not-allowed opacity-40"
            }`}
            title="Scroll menu left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* PERMANENTLY VISIBLE PINNED "Home / Overview" BUTTON */}
          <button
            id="navbar-pinned-home-btn"
            type="button"
            data-nav-id="hero"
            onClick={() => handleNavClick("hero", "website")}
            className={`flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-xs group z-20 ${
              currentTab === "hero"
                ? "bg-[#4A5D4E] text-white shadow-xs ring-1 ring-[#38463B]"
                : "text-[#4A5D4E] hover:bg-[#F1EFE9] hover:text-[#2D362E] bg-[#FAF9F5] border border-[#EAE7E0] hover:border-[#DCD7CD]"
            }`}
            title="Home / Overview (Return to Start)"
          >
            <Home className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
              currentTab === "hero" ? "text-white" : "text-[#606C5D]"
            }`} />
            <span>Home / Overview</span>
          </button>

          {/* PERMANENTLY VISIBLE PINNED "Local Guides" STICKY BUTTON */}
          <button
            id="navbar-pinned-local-guides-btn"
            type="button"
            data-nav-id="local-guides"
            onClick={() => {
              if (onNavigateToGuides) {
                onNavigateToGuides();
              } else {
                handleNavClick("step4_ai_plan", "dashboard");
              }
            }}
            className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-xs group z-20 ${
              currentTab === "step4_ai_plan"
                ? "bg-[#C18C5D] text-white shadow-xs ring-1 ring-[#9E6E45]"
                : "text-[#2D362E] hover:bg-[#F1EFE9] bg-[#FAF9F5] border border-[#EAE7E0] hover:border-[#DCD7CD]"
            }`}
            title="Meet Your Local Guides (Loan Officer & Agent Profiles)"
          >
            <Users className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
              currentTab === "step4_ai_plan" ? "text-white" : "text-[#C18C5D]"
            }`} />
            <span>Local Guides</span>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide leading-none ${
              currentTab === "step4_ai_plan"
                ? "bg-white/20 text-white"
                : "bg-[#C18C5D]/15 text-[#C18C5D]"
            }`}>
              Profiles
            </span>
          </button>

          {/* Subtle Vertical Divider */}
          <div className="h-6 w-px bg-[#EAE7E0] shrink-0 mx-0.5" aria-hidden="true" />

          {/* Scrollable Container with dedicated horizontal scrollbar */}
          <div 
            className="flex-1 relative min-w-0 group/nav"
            onMouseEnter={() => setIsHoveringNav(true)}
            onMouseLeave={() => setIsHoveringNav(false)}
          >
            {/* Left Gradient Edge Fade */}
            {canScrollLeft && (
              <div 
                aria-hidden="true" 
                className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none transition-opacity duration-200" 
              />
            )}

            {/* Scrollable Nav Track */}
            <nav
              ref={scrollContainerRef}
              onScroll={checkScroll}
              aria-label="First-Time Homebuyer Navigation Sections"
              className="flex items-center gap-2 overflow-x-auto dashboard-horizontal-scrollbar scroll-smooth py-1 px-1 flex-1 min-w-0"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {nonStepNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;

                return (
                  <button
                    key={item.id}
                    data-nav-id={item.id}
                    onClick={() => handleNavClick(item.id, item.mode)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer group ${
                      isActive
                        ? "bg-[#4A5D4E] text-white shadow-xs ring-1 ring-[#38463B]"
                        : item.highlight
                        ? "bg-[#C18C5D]/10 text-[#C18C5D] hover:bg-[#C18C5D] hover:text-white border border-[#C18C5D]/30 shadow-2xs"
                        : "text-[#4A5D4E] hover:bg-[#F1EFE9] hover:text-[#2D362E] bg-[#FAF9F5] border border-[#EAE7E0] hover:border-[#DCD7CD]"
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
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

            {/* Right Gradient Edge Fade */}
            {canScrollRight && (
              <div 
                aria-hidden="true" 
                className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none transition-opacity duration-200" 
              />
            )}
          </div>

          {/* Scroll Navigation Right Button */}
          <button
            type="button"
            onClick={() => handleScroll("right")}
            disabled={!canScrollRight}
            aria-label="Scroll navigation menu right"
            className={`shrink-0 w-8 h-8 rounded-xl border flex items-center justify-center transition-all duration-200 shadow-2xs z-20 ${
              canScrollRight
                ? "bg-white border-[#DCD7CD] text-[#2D362E] hover:bg-[#F1EFE9] hover:border-[#606C5D] hover:scale-105 cursor-pointer"
                : "bg-white/40 border-[#EAE7E0]/60 text-[#C4BEB5] cursor-not-allowed opacity-40"
            }`}
            title="Scroll menu right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Quick Prequal CTA on Tablet/Desktop for Instant Chatbot Access */}
          {onOpenLeadBot && (
            <button
              onClick={onOpenLeadBot}
              className="hidden sm:flex lg:hidden items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C18C5D] hover:bg-[#a67448] text-white font-bold text-xs shadow-xs transition-all shrink-0 cursor-pointer"
              title="Start 24/7 AI Prequalification Assessment"
            >
              <Zap className="w-3.5 h-3.5 text-white" />
              <span>AI Prequal</span>
            </button>
          )}

        </div>
      </div>

      {/* ======================================================== */}
      {/* MOBILE EXPANDED DRAWER MENU                             */}
      {/* ======================================================== */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-950 border-b border-[#EAE7E0] dark:border-slate-800 px-4 pt-3 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top duration-200 max-h-[85vh] overflow-y-auto transition-colors">
          {/* Quick Return to Start for Mobile */}
          <button
            onClick={() => {
              setActiveMode("website");
              handleNavClick("hero", "website");
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#F1EFE9] dark:bg-slate-900 text-[#4A5D4E] dark:text-slate-200 font-bold text-xs border border-[#EAE7E0] dark:border-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#C18C5D]" />
            <span>Return to Start / Overview</span>
          </button>

          {/* Menu Items List */}
          <div className="space-y-1">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#9A9488] px-2 pt-2">
              {activeMode === "website" ? "Phase 1 & 2: Planning & Research" : "Phase 3 & 4: Search, AI Plan & Closing"}
            </div>
            {allNavItems
              .filter((item) => !(activeMode === "website" && item.id === "grants"))
              .map((item) => {
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
          <div className="pt-3 border-t border-[#EAE7E0] dark:border-slate-800 space-y-2">
            <div className="w-full py-1">
              <PWAInstallButton />
            </div>

            <div className="w-full flex items-center justify-between px-2 py-2 mb-2 border-b border-[#EAE7E0] dark:border-slate-800">
              <span className="text-sm font-semibold text-[#606C5D] dark:text-slate-400">Appearance</span>
              <ThemeToggle id="navbar-theme-toggle-btn-mobile" showLabel />
            </div>

            {onOpenLeadBot && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLeadBot();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#C18C5D] text-white font-semibold text-sm shadow-xs"
              >
                <Zap className="w-4 h-4 text-white" />
                <span>Start 24/7 AI Prequal</span>
              </button>
            )}

            {(onOpenLoAds || onOpenLoPortal) && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenLoAds) onOpenLoAds();
                  else if (onOpenLoPortal) onOpenLoPortal();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-sm border border-amber-300 shadow-xs cursor-pointer"
              >
                <Video className="w-4 h-4 text-amber-600" />
                <span>AI Video Ads Studio (LO Portal)</span>
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onNavigateToGuides) {
                  onNavigateToGuides();
                } else {
                  setActiveMode("dashboard");
                  handleNavClick("step4_ai_plan", "dashboard");
                }
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#FAF9F5] text-[#2D362E] font-semibold text-sm border border-[#EAE7E0] hover:bg-[#F1EFE9] shadow-2xs"
            >
              <Users className="w-4 h-4 text-[#C18C5D]" />
              <span>Meet Your Local Guides (LO & Agent)</span>
            </button>

            <button
              onClick={() => {
                setActiveMode("dashboard");
                handleNavClick("step4_ai_plan", "dashboard");
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#4A5D4E] text-white font-semibold text-sm shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-[#D4A373]" />
              <span>Step 4: AI Plan & Summary</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};


