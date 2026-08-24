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
  FileText,
  UserCheck,
  RotateCcw,
  Zap,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Layers,
  CheckCircle2
} from "lucide-react";
import { FinancialProfile } from "../types";
import { formatUSD } from "../utils/mortgageMath";

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
      {/* Top micro-banner for market rates benchmark & savings glance */}
      <div className="bg-[#F1EFE9] px-3 sm:px-6 py-1.5 text-xs text-[#606C5D] border-b border-[#EAE7E0] flex items-center justify-between overflow-x-auto whitespace-nowrap no-scrollbar">
        <div className="flex items-center gap-3 sm:gap-4 text-xs font-medium shrink-0">
          <span className="flex items-center gap-1.5 text-[#4A5D4E] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#4A5D4E] animate-pulse"></span>
            Live 30-Yr Benchmark: 6.62%
          </span>
          <span className="text-[#DEDAD2]">|</span>
          <span className="text-[#606C5D] hidden sm:inline">VA 30-Yr: 6.00%</span>
          <span className="text-[#DEDAD2] hidden sm:inline">|</span>
          <span className="text-[#606C5D]">FHA 30-Yr: 6.18% (3.5% Down)</span>
          <span className="text-[#DEDAD2]">|</span>
          <span className="text-[#C18C5D] font-medium flex items-center gap-1">
            <Award className="w-3 h-3" /> State & Local DPA Grants Available
          </span>
        </div>
        <div className="hidden lg:flex items-center gap-3 text-[#606C5D] shrink-0 pl-4">
          <span>Target Budget: <strong className="text-[#2D362E]">{formatUSD(profile.targetPrice)}</strong></span>
          <span className="text-[#DEDAD2]">•</span>
          <span>Cash Saved: <strong className="text-[#4A5D4E]">{formatUSD(profile.downPaymentSavings)}</strong></span>
        </div>
      </div>

      {/* Main Header Bar with Brand, Guided Mode Switcher, Horizontal Scroll Menu, and Action CTAs */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2 lg:gap-3">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => {
                setActiveMode("website");
                setCurrentTab("hero");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex items-center gap-2 sm:gap-2.5 text-left group focus:outline-none"
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
              onClick={() => {
                setActiveMode("website");
                if (currentTab === "hero") {
                  setCurrentTab("calculator");
                }
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeMode === "website"
                  ? "bg-[#4A5D4E] text-white shadow-xs"
                  : "text-[#606C5D] hover:text-[#2D362E]"
              }`}
              title="Step 1 & 2: Buying power, PITI analysis, interactive roadmap & grants"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Step 1 & 2: Explore</span>
            </button>
            <button
              onClick={() => {
                setActiveMode("dashboard");
                if (currentTab === "hero" || currentTab === "calculator" || currentTab === "roadmap" || currentTab === "grants") {
                  setCurrentTab("dashboard");
                }
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all relative ${
                activeMode === "dashboard"
                  ? "bg-[#4A5D4E] text-white shadow-xs"
                  : "text-[#606C5D] hover:text-[#2D362E]"
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
              onClick={() => {
                setActiveMode("website");
                setCurrentTab("calculator");
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeMode === "website" ? "bg-[#4A5D4E] text-white shadow-xs" : "text-[#606C5D]"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Step 1 & 2: Explore
            </button>
            <button
              onClick={() => {
                setActiveMode("dashboard");
                setCurrentTab("dashboard");
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


