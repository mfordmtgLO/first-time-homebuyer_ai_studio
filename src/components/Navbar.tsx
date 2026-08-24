import React from "react";
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
  RotateCcw
} from "lucide-react";
import { FinancialProfile } from "../types";
import { formatUSD } from "../utils/mortgageMath";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  mode?: "website" | "dashboard";
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
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const websiteNavItems: NavItem[] = [
    { id: "hero", label: "Home / Overview", icon: Home, mode: "website" },
    { id: "calculator", label: "Step 1: Calculate Buying Power", icon: Calculator, mode: "website" },
    { id: "roadmap", label: "Step 2: Explore & Learn", icon: Compass, mode: "website" },
    { id: "grants", label: "Grants & DPA", icon: Award, mode: "website" },
  ];

  const dashboardNavItems: NavItem[] = [
    { id: "dashboard", label: "Step 3: Buyer Dashboard", icon: LayoutDashboard, mode: "dashboard" },
    { id: "step4_ai_plan", label: "Step 4: AI Plan & Local Guides", icon: Sparkles, badge: "AI + Guides", mode: "dashboard" },
    { id: "properties", label: `Saved Homes (${savedCount})`, icon: Building, mode: "dashboard" },
    { id: "mortgagelab", label: "Mortgage Lab", icon: TrendingUp, mode: "dashboard" },
    { id: "ai_copilot", label: "AI Advisor", icon: Sparkles, badge: "Gemini 3.7", mode: "dashboard" },
    { id: "escrow", label: "Closing Tracker", icon: ShieldCheck, mode: "dashboard" },
    { id: "documents", label: "Doc Vault", icon: FileText, mode: "dashboard" },
  ];

  const handleNavClick = (tabId: string, targetMode?: "website" | "dashboard") => {
    if (targetMode) {
      setActiveMode(targetMode);
    }
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EAE7E0] text-[#2D362E]">
      {/* Top micro-banner for market rates benchmark */}
      <div className="bg-[#F1EFE9] px-4 py-1.5 text-xs text-[#606C5D] border-b border-[#EAE7E0] flex items-center justify-between overflow-x-auto whitespace-nowrap">
        <div className="flex items-center gap-4 text-xs font-medium">
          <span className="flex items-center gap-1.5 text-[#4A5D4E] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#4A5D4E] animate-pulse"></span>
            Live 30-Yr Fixed Benchmark: 6.62%
          </span>
          <span className="text-[#DEDAD2]">|</span>
          <span className="text-[#606C5D]">VA 30-Yr: 6.00%</span>
          <span className="text-[#DEDAD2]">|</span>
          <span className="text-[#606C5D]">FHA 30-Yr: 6.18%</span>
          <span className="text-[#DEDAD2]">|</span>
          <span className="text-[#C18C5D] font-medium flex items-center gap-1">
            <Award className="w-3 h-3" /> FHA Down Payment: 3.5%
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[#606C5D]">
          <span>Target Home Budget: <strong className="text-[#2D362E]">{formatUSD(profile.targetPrice)}</strong></span>
          <span className="text-[#DEDAD2]">•</span>
          <span>Cash Saved: <strong className="text-[#4A5D4E]">{formatUSD(profile.downPaymentSavings)}</strong></span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Logo & Return to Start */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                setActiveMode("website");
                setCurrentTab("hero");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
              title="Return to the beginning: Buy your first home with clarity and total confidence"
            >
              <div className="w-8 h-8 bg-[#606C5D] rounded-lg flex items-center justify-center text-white font-bold shadow-sm group-hover:scale-105 transition-transform">
                M
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-semibold tracking-tight text-[#4A5D4E]">
                    Manus
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F1EFE9] text-[#4A5D4E] border border-[#EAE7E0]">
                    Homebuyer
                  </span>
                </div>
                <p className="text-[10px] text-[#9A9488] hidden sm:block font-medium">
                  Buy with Clarity & Total Confidence
                </p>
              </div>
            </button>
          </div>

          {/* Guided Mode Switcher Pill */}
          <div className="hidden md:flex items-center bg-[#F1EFE9] p-1 rounded-xl border border-[#EAE7E0]">
            <button
              onClick={() => {
                setActiveMode("website");
                if (currentTab === "hero") {
                  setCurrentTab("calculator");
                }
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeMode === "website"
                  ? "bg-[#4A5D4E] text-white shadow-sm"
                  : "text-[#606C5D] hover:text-[#2D362E]"
              }`}
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
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeMode === "dashboard"
                  ? "bg-[#4A5D4E] text-white shadow-sm"
                  : "text-[#606C5D] hover:text-[#2D362E]"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Step 3 & 4: Dashboard</span>
              <span className="w-2 h-2 rounded-full bg-[#C18C5D]"></span>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {(activeMode === "website" ? websiteNavItems : dashboardNavItems.slice(0, 4)).map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id, item.mode)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                    isActive
                      ? "bg-[#F1EFE9] text-[#4A5D4E] font-bold border border-[#EAE7E0] shadow-2xs"
                      : "text-[#606C5D] hover:text-[#2D362E] hover:bg-[#F9F8F4] font-medium"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#4A5D4E]" : "text-[#9A9488]"}`} />
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#C18C5D]/15 text-[#C18C5D] font-bold border border-[#C18C5D]/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick AI Advisor CTA + LO Portal Trigger */}
          <div className="hidden sm:flex items-center gap-2">
            {onOpenLeadBot && (
              <button
                onClick={onOpenLeadBot}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C18C5D] hover:bg-[#a67448] text-white font-semibold text-xs shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span>24/7 AI Pre-Approval</span>
              </button>
            )}

            <button
              onClick={() => {
                setActiveMode("dashboard");
                setCurrentTab("step4_ai_plan");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4A5D4E] hover:bg-[#38463B] text-white font-semibold text-xs shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
              <span>Step 4: AI Plan</span>
            </button>

            {onOpenLoPortal && (
              <button
                id="navbar-lo-portal-btn"
                onClick={onOpenLoPortal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#F1EFE9] hover:bg-[#EAE7E0] text-[#606C5D] hover:text-[#2D362E] text-xs font-semibold border border-[#EAE7E0] transition-colors"
                title={`Loan Officer & Partner Portal (Logged in as ${loName})`}
              >
                <UserCheck className="w-3.5 h-3.5 text-[#4A5D4E]" />
                <span className="hidden xl:inline">LO Hub:</span>
                <span className="text-[#4A5D4E] font-bold">{loName.split(" ")[0]}</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-[#F1EFE9] text-[#606C5D] hover:text-[#2D362E] border border-[#EAE7E0] focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#EAE7E0] px-4 pt-3 pb-5 space-y-4 shadow-lg animate-in slide-in-from-top duration-200">
          {/* Quick Return to Start for Mobile */}
          <button
            onClick={() => {
              setActiveMode("website");
              handleNavClick("hero", "website");
            }}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-[#F1EFE9] text-[#4A5D4E] font-bold text-xs border border-[#EAE7E0]"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#C18C5D]" />
            <span>Return to Start / Home (Clarity & Confidence)</span>
          </button>

          {/* Mode Switcher for Mobile */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#F1EFE9] rounded-xl border border-[#EAE7E0]">
            <button
              onClick={() => {
                setActiveMode("website");
                setCurrentTab("calculator");
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold ${
                activeMode === "website" ? "bg-[#4A5D4E] text-white shadow-sm" : "text-[#606C5D]"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Step 1 & 2
            </button>
            <button
              onClick={() => {
                setActiveMode("dashboard");
                setCurrentTab("dashboard");
              }}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold ${
                activeMode === "dashboard" ? "bg-[#4A5D4E] text-white shadow-sm" : "text-[#606C5D]"
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Step 3 & 4
            </button>
          </div>

          <div className="space-y-1">
            {(activeMode === "website" ? websiteNavItems : dashboardNavItems).map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id, item.mode)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm ${
                    isActive
                      ? "bg-[#F1EFE9] text-[#4A5D4E] font-bold border border-[#EAE7E0]"
                      : "text-[#606C5D] hover:bg-[#F9F8F4] font-medium"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-[#4A5D4E]" : "text-[#9A9488]"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C18C5D]/15 text-[#C18C5D] font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-[#EAE7E0] space-y-2">
            <button
              onClick={() => {
                setActiveMode("dashboard");
                handleNavClick("step4_ai_plan", "dashboard");
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#4A5D4E] text-white font-semibold text-sm shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-[#D4A373]" />
              <span>Go to Step 4: AI Plan & Local Guides</span>
            </button>

            {onOpenLoPortal && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLoPortal();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-[#F1EFE9] text-[#606C5D] font-semibold text-xs border border-[#EAE7E0]"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#4A5D4E]" />
                <span>Loan Officer Hub ({loName})</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

