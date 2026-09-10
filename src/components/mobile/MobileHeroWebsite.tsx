import React, { useState } from "react";
import { 
  ArrowRight, 
  Sparkles, 
  Compass, 
  MessageSquareCode,
  CheckCircle2,
  Lock,
  ExternalLink,
  Search,
  ShieldCheck,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Gift,
  Percent,
  Calculator,
  Hourglass,
  TrendingUp
} from "lucide-react";
import { motion, AnimatePresence, PanInfo } from "motion/react";
import { FinancialProfile, LoanOfficerProfile, RealEstateAgentProfile, CapturedLead, PropertyListing } from "../../types";

interface MobileHeroWebsiteProps {
  profile: FinancialProfile;
  setProfile: React.Dispatch<React.SetStateAction<FinancialProfile>>;
  onOpenDashboard: () => void;
  onOpenProperties?: () => void;
  onOpenCalculator: () => void;
  onOpenRoadmap: () => void;
  onOpenStep4?: () => void;
  onOpenLeadBot?: () => void;
  onCaptureLead?: (lead: CapturedLead) => void;
  loanOfficer?: LoanOfficerProfile;
  activeAgent?: RealEstateAgentProfile;
  isCoBranded?: boolean;
  onOpenLoPortal?: () => void;
  properties?: PropertyListing[];
  onOpenCostOfWaiting?: () => void;
  onOpenBuydown?: () => void;
}

export const MobileHeroWebsite: React.FC<MobileHeroWebsiteProps> = ({
  onOpenCalculator,
  onOpenRoadmap,
  onOpenLeadBot,
  loanOfficer,
  onOpenDashboard,
  onOpenProperties,
  onOpenCostOfWaiting,
  onOpenBuydown,
}) => {
  const leadGenUrlwk = loanOfficer?.leadGenFormUrl || "https://portal.myhometrac.com/get-started/MFORD@CFMTG.COM";

  const [activeSlide, setActiveSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  const heroCards = [
    {
      id: "calc",
      badge: "Single-Tap Entry",
      badgeIcon: <Sparkles className="w-3 h-3 text-[#D4A373]" />,
      badgeRight: "No SSN Required",
      badgeRightIcon: <Lock className="w-3 h-3 text-white/70" />,
      title: "Calculate Instant Affordability",
      description: "Interactive sliders for income, debts & monthly payment targets.",
      ctaText: "Launch Calculator",
      ctaIcon: <Calculator className="w-4 h-4" />,
      onClick: onOpenCalculator,
      bgGradient: "from-[#4A5D4E] to-[#36453A]",
      borderColor: "border-[#38463B]",
      accentCircle: "bg-[#C18C5D]/20",
    },
    {
      id: "costofwaiting",
      badge: "Cost of Waiting",
      badgeIcon: <Hourglass className="w-3 h-3 text-amber-300" />,
      badgeRight: "Lost Equity & Rates",
      badgeRightIcon: <TrendingUp className="w-3 h-3 text-emerald-300" />,
      title: "Cost of Waiting Analysis",
      description: "See what waiting 6mo to 3yrs costs in home price inflation, lost appreciation & monthly payments.",
      ctaText: "Analyze Cost of Waiting",
      ctaIcon: <Hourglass className="w-4 h-4" />,
      onClick: onOpenCostOfWaiting || onOpenCalculator,
      bgGradient: "from-[#334438] to-[#202E24]",
      borderColor: "border-[#202E24]",
      accentCircle: "bg-amber-500/20",
    },
    {
      id: "grants",
      badge: "$10k - $25k Grants",
      badgeIcon: <Gift className="w-3 h-3 text-amber-300" />,
      badgeRight: "OR & WA Approved",
      badgeRightIcon: <ShieldCheck className="w-3 h-3 text-emerald-300" />,
      title: "Match Down Payment Grants",
      description: "Explore state assistance, forgivable loans & first-time buyer subsidies.",
      ctaText: "Check Grant Eligibility",
      ctaIcon: <Gift className="w-4 h-4" />,
      onClick: onOpenCalculator,
      bgGradient: "from-[#2C4336] to-[#1E3025]",
      borderColor: "border-[#1E3025]",
      accentCircle: "bg-emerald-500/20",
    },
    {
      id: "buydown",
      badge: "Payment Relief",
      badgeIcon: <Percent className="w-3 h-3 text-amber-200" />,
      badgeRight: "Year 1 & 2 Discount",
      badgeRightIcon: <Sparkles className="w-3 h-3 text-amber-200" />,
      title: "2-1 Buydown Scenario",
      description: "Lower your initial mortgage payment by up to 2% in year one.",
      ctaText: "Calculate Buydown",
      ctaIcon: <ArrowRight className="w-4 h-4" />,
      onClick: onOpenBuydown || onOpenCalculator,
      bgGradient: "from-[#3D4D40] to-[#2B382D]",
      borderColor: "border-[#2B382D]",
      accentCircle: "bg-amber-500/20",
    },
    {
      id: "bot",
      badge: "24/7 AI Copilot",
      badgeIcon: <MessageSquareCode className="w-3 h-3 text-[#D4A373]" />,
      badgeRight: "Instant Prequal",
      badgeRightIcon: <CheckCircle2 className="w-3 h-3 text-white/70" />,
      title: "Guided AI Chat Journey",
      description: "Ask mortgage questions, check current rates & pre-qualify in chat.",
      ctaText: "Start AI Chat",
      ctaIcon: <MessageSquareCode className="w-4 h-4" />,
      onClick: onOpenLeadBot || onOpenCalculator,
      bgGradient: "from-[#1F2D24] to-[#141F18]",
      borderColor: "border-[#141F18]",
      accentCircle: "bg-amber-400/20",
    },
  ];

  const totalSlides = heroCards.length;

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setActiveSlide((prev) => (prev + newDirection + totalSlides) % totalSlides);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    const swipeThreshold = 40;
    if (info.offset.x < -swipeThreshold) {
      paginate(1);
    } else if (info.offset.x > swipeThreshold) {
      paginate(-1);
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 250 : -250,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.25, ease: "easeOut" },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 250 : -250,
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2, ease: "easeIn" },
    }),
  };

  const currentCard = heroCards[activeSlide];

  return (
    <div className="flex flex-col justify-between min-h-[calc(100dvh-5rem)] px-4 pt-4 pb-6 bg-[#F9F8F4] dark:bg-slate-950 font-sans">
      
      {/* Top Brand Badge & Hook */}
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAE7E0] dark:bg-slate-800 text-[#4A5D4E] dark:text-[#D4A373] text-[11px] font-bold tracking-wide shadow-xs mx-auto">
          <Sparkles className="w-3.5 h-3.5 text-[#C18C5D] animate-pulse" />
          <span>2026 First-Time Buyer Guide</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-serif font-black text-[#2D362E] dark:text-white tracking-tight leading-[1.15]">
          How much home <br />
          <span className="text-[#4A5D4E] dark:text-[#D4A373]">can you afford?</span>
        </h1>

        <p className="text-xs sm:text-sm text-[#606C5D] dark:text-slate-400 max-w-xs mx-auto leading-normal font-medium">
          Get monthly payments, price range & down payment grant matches in 60 seconds.
        </p>
      </div>

      {/* Touch Swipeable Card Showcase Carousel */}
      <div className="my-auto py-3 space-y-2.5">
        
        {/* Swipe Header & Controls */}
        <div className="flex items-center justify-between px-1 text-[11px] font-semibold text-[#606C5D] dark:text-slate-400">
          <span className="flex items-center gap-1 text-[#4A5D4E] dark:text-[#D4A373] font-bold">
            <Sparkles className="w-3 h-3" />
            <span>Swipe features ({activeSlide + 1} of {totalSlides})</span>
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => paginate(-1)}
              aria-label="Previous slide"
              className="p-1.5 rounded-full bg-white dark:bg-slate-800 border border-[#EAE7E0] dark:border-slate-700 text-[#2D362E] dark:text-slate-200 active:scale-90 transition-transform cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => paginate(1)}
              aria-label="Next slide"
              className="p-1.5 rounded-full bg-white dark:bg-slate-800 border border-[#EAE7E0] dark:border-slate-700 text-[#2D362E] dark:text-slate-200 active:scale-90 transition-transform cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Interactive Swipe Container */}
        <div className="relative overflow-hidden rounded-2xl min-h-[175px] shadow-lg">
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={activeSlide}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={handleDragEnd}
              className={`w-full p-5 bg-gradient-to-br ${currentCard.bgGradient} rounded-2xl border ${currentCard.borderColor} text-left select-none touch-pan-y cursor-grab active:cursor-grabbing relative overflow-hidden`}
            >
              {/* Background Glow */}
              <div className={`absolute top-0 right-0 w-36 h-36 ${currentCard.accentCircle} rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none`} />

              {/* Card Header Badge */}
              <div className="flex items-center justify-between w-full mb-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-xs">
                  {currentCard.badgeIcon}
                  <span>{currentCard.badge}</span>
                </span>
                <span className="text-[11px] text-[#E0E7E1] font-semibold flex items-center gap-1">
                  {currentCard.badgeRightIcon}
                  <span>{currentCard.badgeRight}</span>
                </span>
              </div>

              {/* Card Body */}
              <div className="space-y-1 mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-tight">
                  {currentCard.title}
                </h2>
                <p className="text-xs text-[#D1DDD3]">
                  {currentCard.description}
                </p>
              </div>

              {/* Card Action Button */}
              <button
                type="button"
                onClick={currentCard.onClick}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-[#1E3025] font-extrabold text-xs flex items-center justify-between shadow-md active:scale-[0.98] transition-all duration-100 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  {currentCard.ctaIcon}
                  <span>{currentCard.ctaText}</span>
                </span>
                <ArrowRight className="w-4 h-4 text-[#4A5D4E]" />
              </button>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel Pagination Dots */}
        <div className="flex items-center justify-center gap-1.5 pt-1">
          {heroCards.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDirection(idx > activeSlide ? 1 : -1);
                setActiveSlide(idx);
              }}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                idx === activeSlide
                  ? "w-6 bg-[#4A5D4E] dark:bg-[#D4A373]"
                  : "w-1.5 bg-[#DCD7CD] dark:bg-slate-700 hover:bg-[#9A9488]"
              }`}
            />
          ))}
        </div>

        {/* Co-Primary Single-Tap: Guided AI Journey */}
        {onOpenLeadBot && (
          <button
            id="mobile-single-tap-ai-journey-btn"
            type="button"
            onClick={onOpenLeadBot}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-[#EAE7E0] dark:border-slate-800 hover:border-[#DCD7CD] shadow-2xs active:scale-[0.98] transition-all duration-100 text-left cursor-pointer group select-none touch-manipulation"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FAF9F5] dark:bg-slate-800 border border-[#EAE7E0] dark:border-slate-700 flex items-center justify-center text-[#C18C5D] shrink-0 group-active:scale-95 transition-transform duration-100">
                <MessageSquareCode className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-[#2D362E] dark:text-slate-100 leading-snug">
                  Start Guided AI Chat Journey
                </h3>
                <p className="text-[11px] text-[#606C5D] dark:text-slate-400">
                  Ask questions, check rates & pre-qualify 24/7
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#9A9488] group-hover:text-[#4A5D4E] group-hover:translate-x-0.5 transition-all duration-100 shrink-0 ml-2" />
          </button>
        )}

        {/* Micro Trust Bar */}
        <div className="flex items-center justify-center gap-3 text-[11px] font-semibold text-[#606C5D] dark:text-slate-400 pt-0.5">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#4A5D4E] dark:text-emerald-400" />
            100% Free
          </span>
          <span className="text-[#DCD7CD]">•</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#4A5D4E] dark:text-emerald-400" />
            Zero Credit Impact
          </span>
          <span className="text-[#DCD7CD]">•</span>
          <span>FHA & Conv.</span>
        </div>
      </div>

      {/* Bottom Section: Verified Local Officer & Quick Explorers */}
      <div className="space-y-3 pt-2 border-t border-[#EAE7E0]/80 dark:border-slate-800">
        
        {/* Compact Loan Officer Card */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-[#EAE7E0] dark:border-slate-800 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FAF9F5] border border-[#EAE7E0] overflow-hidden shrink-0 flex items-center justify-center font-bold text-[#4A5D4E] text-sm">
              {loanOfficer?.profileImageUrl ? (
                <img src={loanOfficer.profileImageUrl} alt={loanOfficer.name} className="w-full h-full object-cover" />
              ) : (
                loanOfficer?.name?.charAt(0) || "M"
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#2D362E] dark:text-slate-200">
                  {loanOfficer?.name || "Mike Ford"}
                </span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  NMLS #{loanOfficer?.nmls || "288455"}
                </span>
              </div>
              <p className="text-[11px] text-[#9A9488]">Verified Local Lending Advisor</p>
            </div>
          </div>

          <a
            href={leadGenUrlwk}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-[#FAF9F5] hover:bg-[#EAE7E0] active:bg-[#E2DDD5] active:scale-95 dark:bg-slate-800 text-[#4A5D4E] dark:text-slate-200 text-xs font-bold border border-[#EAE7E0] dark:border-slate-700 flex items-center gap-1 shrink-0 transition-all duration-100 select-none touch-manipulation cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#C18C5D]" />
            <span>Apply</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        </div>

        {/* Secondary Exploration Pills (Compact) */}
        <div className="flex items-center justify-center gap-3 text-xs font-medium text-[#606C5D] dark:text-slate-400">
          <button
            onClick={onOpenRoadmap}
            className="flex items-center gap-1.5 hover:text-[#4A5D4E] active:scale-95 active:text-[#4A5D4E] cursor-pointer transition-all duration-100 select-none touch-manipulation py-1 px-1.5 rounded-md"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>10-Step Roadmap</span>
          </button>
          <span>•</span>
          <button
            onClick={onOpenProperties || onOpenDashboard}
            className="flex items-center gap-1.5 hover:text-[#4A5D4E] active:scale-95 active:text-[#4A5D4E] cursor-pointer transition-all duration-100 select-none touch-manipulation py-1 px-1.5 rounded-md"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Browse Homes</span>
          </button>
        </div>

      </div>

    </div>
  );
};

