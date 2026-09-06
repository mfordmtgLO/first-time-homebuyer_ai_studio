import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  X, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  Zap, 
  TrendingUp, 
  Sun, 
  Compass, 
  Flame, 
  Moon, 
  RefreshCw, 
  Target,
  Trophy,
  Coffee,
  Lightbulb,
  Award,
  Database,
  History,
  Calendar,
  CalendarDays,
  BarChart3,
  Check,
  ChevronRight,
  ShieldCheck,
  Milestone,
  AlertCircle,
  Briefcase,
  Layers,
  ArrowUpRight,
  Megaphone,
  Scale,
  ShieldAlert,
  DollarSign
} from "lucide-react";
import { WeeklyPulseEntry, MonthlyHorizonPulseEntry, DailySalesManagerCritique } from "../types";
import { evaluateTaskToGoalRatio } from "../services/dailyPulseService";

export interface DailyReviewData {
  headline: string;
  motivationalBadge: string;
  whatDoneSummary: string;
  topPriorities: string[];
  coachingQuote: string;
  salesManagerCritique?: DailySalesManagerCritique;
  topProducerTip?: {
    headline: string;
    advice: string;
    focusOutcome: string;
  };
  managerPerspective?: string;
  yesterdayHandoffSummary?: string;
  nextActionRecommendation?: {
    tabId: string;
    actionTitle: string;
    actionReason: string;
  };
}

export interface AIDailyReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewData: DailyReviewData | null;
  taskRatio?: { completed: number; total: number };
  weeklyData?: WeeklyPulseEntry | null;
  monthlyData?: MonthlyHorizonPulseEntry | null;
  isLoading: boolean;
  weeklyLoading?: boolean;
  monthlyLoading?: boolean;
  onRefreshReview: () => void;
  onRefreshWeekly?: () => void;
  onRefreshMonthly?: () => void;
  onNavigateTab: (tabId: any) => void;
  timePhase: "morning" | "midday" | "afternoon" | "end_of_day";
  currentTimeString: string;
  syncedWithFirestore?: boolean;
  consistencyStreakDays?: number;
  initialTab?: "daily" | "weekly" | "monthly";
  onSelectHorizonTab?: (tab: "daily" | "weekly" | "monthly") => void;
}

export const AIDailyReviewModal: React.FC<AIDailyReviewModalProps> = ({
  isOpen,
  onClose,
  reviewData,
  taskRatio,
  weeklyData,
  monthlyData,
  isLoading,
  weeklyLoading = false,
  monthlyLoading = false,
  onRefreshReview,
  onRefreshWeekly,
  onRefreshMonthly,
  onNavigateTab,
  timePhase,
  currentTimeString,
  syncedWithFirestore = false,
  consistencyStreakDays = 0,
  initialTab = "daily",
  onSelectHorizonTab
}) => {
  const [activeHorizon, setActiveHorizon] = useState<"daily" | "weekly" | "monthly">(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveHorizon(initialTab);
    }
  }, [initialTab]);

  // Resolve Sales Manager Critique from reviewData or dynamic ratio calculation
  const resolvedCritique = reviewData?.salesManagerCritique || (taskRatio ? evaluateTaskToGoalRatio(taskRatio.completed, taskRatio.total, timePhase, currentTimeString) : null);

  const getTierTheme = (tier: string) => {
    switch (tier) {
      case 'zero_reset':
        return {
          cardBg: 'bg-gradient-to-br from-rose-50/80 via-amber-50/40 to-white',
          border: 'border-rose-200',
          badgeBg: 'bg-rose-600',
          badgeText: 'text-white',
          tagBg: 'bg-rose-100 text-rose-800 border-rose-300',
          icon: ShieldAlert,
          iconColor: 'text-rose-600'
        };
      case 'lagging_triage':
        return {
          cardBg: 'bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-white',
          border: 'border-amber-200',
          badgeBg: 'bg-amber-600',
          badgeText: 'text-white',
          tagBg: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: AlertCircle,
          iconColor: 'text-amber-600'
        };
      case 'mid_flight_bubble':
        return {
          cardBg: 'bg-gradient-to-br from-sky-50/80 via-blue-50/30 to-white',
          border: 'border-sky-200',
          badgeBg: 'bg-sky-700',
          badgeText: 'text-white',
          tagBg: 'bg-sky-100 text-sky-800 border-sky-300',
          icon: Scale,
          iconColor: 'text-sky-700'
        };
      case 'high_tempo':
        return {
          cardBg: 'bg-gradient-to-br from-emerald-50/80 via-teal-50/30 to-white',
          border: 'border-emerald-200',
          badgeBg: 'bg-emerald-700',
          badgeText: 'text-white',
          tagBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: Flame,
          iconColor: 'text-emerald-700'
        };
      case 'championship_pace':
      default:
        return {
          cardBg: 'bg-gradient-to-br from-amber-50/90 via-[#FAF6EE] to-white',
          border: 'border-amber-300/80',
          badgeBg: 'bg-[#C18C5D]',
          badgeText: 'text-white',
          tagBg: 'bg-amber-100 text-amber-900 border-amber-300',
          icon: Trophy,
          iconColor: 'text-[#C18C5D]'
        };
    }
  };

  if (!isOpen) return null;

  const handleTabChange = (tab: "daily" | "weekly" | "monthly") => {
    setActiveHorizon(tab);
    onSelectHorizonTab?.(tab);
    if (tab === "weekly" && !weeklyData && onRefreshWeekly) {
      onRefreshWeekly();
    }
    if (tab === "monthly" && !monthlyData && onRefreshMonthly) {
      onRefreshMonthly();
    }
  };

  const getPhaseIcon = () => {
    switch (timePhase) {
      case "morning":
        return <Sun className="w-5 h-5 text-amber-500" />;
      case "midday":
        return <Compass className="w-5 h-5 text-blue-500" />;
      case "afternoon":
        return <Flame className="w-5 h-5 text-orange-500" />;
      case "end_of_day":
        return <Moon className="w-5 h-5 text-indigo-400" />;
      default:
        return <Zap className="w-5 h-5 text-[#C18C5D]" />;
    }
  };

  const getPhaseColor = () => {
    switch (timePhase) {
      case "morning":
        return "bg-amber-50 border-amber-200 text-amber-900";
      case "midday":
        return "bg-blue-50 border-blue-200 text-blue-900";
      case "afternoon":
        return "bg-orange-50 border-orange-200 text-orange-900";
      case "end_of_day":
        return "bg-indigo-50 border-indigo-200 text-indigo-900";
      default:
        return "bg-[#F4F1EA] border-[#EAE7E0] text-[#2D362E]";
    }
  };

  const currentLoading = activeHorizon === "daily" ? isLoading : activeHorizon === "weekly" ? weeklyLoading : monthlyLoading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="relative w-full max-w-3xl bg-[#FDFBF7] rounded-3xl border border-[#DCD7CD] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 pb-3 border-b border-[#EAE7E0] bg-white flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#2D362E] text-white flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles className="w-6 h-6 text-[#E7C19D] animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${getPhaseColor()}`}>
                  {getPhaseIcon()}
                  <span className="capitalize">{timePhase.replace(/_/g, " ")} Pulse</span>
                  <span className="text-[#9A9488]">•</span>
                  <span>{currentTimeString}</span>
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <span>Real-Time AI Pulse</span>
                </span>
                {syncedWithFirestore && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300 flex items-center gap-1" title="Persisted to Firestore daily_pulses with cross-device memory">
                    <Database className="w-3 h-3 text-sky-600" />
                    <span>DailyPulse Synced</span>
                  </span>
                )}
                {typeof consistencyStreakDays === "number" && consistencyStreakDays > 0 && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-600" />
                    <span>{consistencyStreakDays}-Day Streak</span>
                  </span>
                )}
              </div>
              <h3 className="font-serif font-bold text-xl text-[#2D362E]">
                {activeHorizon === "daily" 
                  ? (reviewData?.headline || "AI Production Coach & Daily Shift Pulse") 
                  : activeHorizon === "weekly"
                  ? (weeklyData?.reviewData?.headline || "Week-to-Week Production Debrief & Pacing")
                  : (monthlyData?.reviewData?.headline || "30-Day Productivity Horizon & Roadmap")}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-full bg-[#F4F1EA] hover:bg-[#EAE7E0] text-[#606C5D] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3-Horizon Navigation Switcher */}
        <div className="px-5 py-2.5 bg-[#FAF8F5] border-b border-[#EAE7E0] flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => handleTabChange("daily")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeHorizon === "daily"
                ? "bg-[#2D362E] text-white shadow-xs"
                : "bg-white text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F4F1EA]"
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>Daily Shift</span>
            <span className="text-[10px] opacity-75">Day-to-Day</span>
          </button>

          <button
            onClick={() => handleTabChange("weekly")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeHorizon === "weekly"
                ? "bg-[#2D362E] text-white shadow-xs"
                : "bg-white text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F4F1EA]"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-[#E7C19D]" />
            <span>Weekly Momentum</span>
            <span className="text-[10px] opacity-75">Week-to-Week</span>
            {weeklyData?.reviewData?.performanceGrade && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#C18C5D] text-white">
                {weeklyData.reviewData.performanceGrade.split(" ")[0]}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabChange("monthly")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeHorizon === "monthly"
                ? "bg-[#2D362E] text-white shadow-xs"
                : "bg-white text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F4F1EA]"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
            <span>30-Day Horizon</span>
            <span className="text-[10px] opacity-75">Lookback &amp; Forward</span>
            {typeof monthlyData?.reviewData?.productivityScore === "number" && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-700 text-white">
                {monthlyData.reviewData.productivityScore}/100
              </span>
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {currentLoading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#C18C5D] animate-spin mx-auto" />
              <p className="font-serif font-bold text-base text-[#2D362E]">
                {activeHorizon === "daily" 
                  ? "Analyzing today's pipeline progress & daily milestones..."
                  : activeHorizon === "weekly"
                  ? "Evaluating week-to-week momentum & prior week comparisons..."
                  : "Calculating 30-day lookback retrospective & 30-day forward production roadmap..."}
              </p>
              <p className="text-xs text-[#7D8877] max-w-md mx-auto">
                {activeHorizon === "daily"
                  ? "Synthesizing completed touches, open pre-approvals, and current shift bandwidth."
                  : activeHorizon === "weekly"
                  ? "Analyzing task-to-goal conversion velocity and generating next week's top producer playbook."
                  : "Synthesizing 30-day operating consistency, closing velocity, and four weekly milestone targets."}
              </p>
            </div>
          ) : (
            <>
              {/* ============================================================ */}
              {/* HORIZON 1: DAILY SHIFT (DAY-TO-DAY)                          */}
              {/* ============================================================ */}
              {activeHorizon === "daily" && (
                <div className="space-y-4">
                  {/* Yesterday Handoff Continuity Banner */}
                  {reviewData?.yesterdayHandoffSummary && (
                    <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 flex items-start gap-3 shadow-2xs">
                      <div className="w-7 h-7 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <History className="w-3.5 h-3.5" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 block">
                          Prior Shift Handoff Memory
                        </span>
                        <p className="text-xs text-sky-950 leading-relaxed font-medium">
                          {reviewData.yesterdayHandoffSummary}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Motivational Status Badge */}
                  {reviewData?.motivationalBadge && (
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-[#4A5D4E]/10 via-[#C18C5D]/10 to-[#4A5D4E]/10 border border-[#C18C5D]/30 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[#C18C5D] text-white flex items-center justify-center shrink-0 shadow-xs">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#C18C5D]">AI Status Sentiment</span>
                        <p className="font-bold text-sm text-[#2D362E]">
                          {reviewData.motivationalBadge}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Sales Manager Task-to-Goal Ratio & Constructive Critique */}
                  {resolvedCritique && (() => {
                    const theme = getTierTheme(resolvedCritique.ratioTier);
                    const TierIcon = theme.icon;
                    return (
                      <div className={`p-4 sm:p-5 rounded-2xl ${theme.cardBg} border ${theme.border} space-y-3.5 shadow-xs`}>
                        {/* Header with Ratio & Tone */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-black/5">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-xl ${theme.badgeBg} ${theme.badgeText} flex items-center justify-center shrink-0 shadow-2xs`}>
                              <TierIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#4A5D4E]">
                                  Sales Manager Ratio Audit
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${theme.tagBg}`}>
                                  {resolvedCritique.tone}
                                </span>
                              </div>
                              <h4 className="font-bold text-sm text-[#2D362E]">
                                Task-to-Goal Ratio: {resolvedCritique.ratioLabel}
                              </h4>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#606C5D] bg-white/80 px-2.5 py-1 rounded-lg border border-black/5">
                            Constructive Critique
                          </span>
                        </div>

                        {/* Diagnosis */}
                        <div className="space-y-1 bg-white/80 backdrop-blur-xs p-3.5 rounded-xl border border-black/5 shadow-2xs">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D362E]">
                            <Megaphone className="w-3.5 h-3.5 text-[#C18C5D]" />
                            <span>Manager Diagnosis & Root Cause</span>
                          </div>
                          <p className="text-xs text-[#4A5D4E] leading-relaxed">
                            {resolvedCritique.diagnosis}
                          </p>
                        </div>

                        {/* Tactical Pivot */}
                        <div className="p-3.5 rounded-xl bg-[#2D362E] text-white space-y-1 shadow-2xs">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#E7C19D]">
                            <Zap className="w-3.5 h-3.5 text-[#E7C19D]" />
                            <span>Tactical 45-Minute Pivot</span>
                          </div>
                          <p className="text-xs text-stone-200 leading-relaxed font-medium">
                            {resolvedCritique.tacticalPivot}
                          </p>
                        </div>

                        {/* Accountability & Conversion Math */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                          <div className="p-3 rounded-xl bg-white/85 border border-black/5 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#606C5D] block">
                              Accountability Standard
                            </span>
                            <p className="text-[11px] text-[#2D362E] leading-snug font-medium">
                              {resolvedCritique.accountabilityCheck}
                            </p>
                          </div>

                          {resolvedCritique.conversionMathNote && (
                            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 space-y-1">
                              <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                                <DollarSign className="w-3 h-3 text-amber-700" />
                                <span>Conversion Math</span>
                              </div>
                              <p className="text-[11px] text-amber-950 font-medium leading-snug">
                                {resolvedCritique.conversionMathNote}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* What Has Been Accomplished So Far */}
                  <div className="p-4 rounded-2xl bg-white border border-[#EAE7E0] space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#4A5D4E]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Accomplished Today Across Dashboard</span>
                    </div>
                    <p className="text-sm text-[#4A5D4E] leading-relaxed">
                      {reviewData?.whatDoneSummary || "Logging touches, scenario evaluations, and lead updates."}
                    </p>
                  </div>

                  {/* Recommended Top Priorities Left To Do */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2D362E]">
                        <Target className="w-4 h-4 text-[#C18C5D]" />
                        <span>Top Recommended Priorities Left Before EOD</span>
                      </div>
                      <span className="text-[11px] text-[#7D8877]">Realistic Daily Targets</span>
                    </div>

                    <div className="space-y-2.5">
                      {reviewData?.topPriorities?.map((priority, idx) => (
                        <div 
                          key={idx}
                          className="p-3.5 rounded-2xl bg-white border border-[#EAE7E0] hover:border-[#C18C5D]/50 transition-colors flex items-start gap-3 shadow-2xs"
                        >
                          <span className="w-6 h-6 rounded-full bg-[#2D362E] text-[#E7C19D] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <p className="text-xs sm:text-sm font-medium text-[#2D362E] leading-snug">
                            {priority}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Sales Manager Direct Coaching & Top Producer Tip */}
                  {reviewData?.topProducerTip && (
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FAF6EE] to-[#F2EDE2] border border-[#DCD7CD] space-y-2.5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#C18C5D] text-white flex items-center justify-center shrink-0 shadow-2xs">
                            <Trophy className="w-4 h-4 text-amber-100" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A87447] block">
                              Sales Manager &ldquo;Top Producer&rdquo; Advice
                            </span>
                            <h4 className="font-bold text-xs sm:text-sm text-[#2D362E]">
                              {reviewData.topProducerTip.headline}
                            </h4>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-200/60 text-amber-900 border border-amber-300/60 flex items-center gap-1 shrink-0">
                          <Award className="w-3 h-3 text-[#A87447]" />
                          <span>Top LO Track</span>
                        </span>
                      </div>

                      <p className="text-xs text-[#4A5D4E] leading-relaxed">
                        {reviewData.topProducerTip.advice}
                      </p>

                      <div className="pt-2 border-t border-[#DCD7CD]/60 flex items-center gap-2 text-[11px] font-semibold text-[#606C5D]">
                        <Coffee className="w-3.5 h-3.5 text-[#C18C5D] shrink-0" />
                        <span className="text-[#2D362E] font-bold">Key Win:</span>
                        <span className="text-[#606C5D]">{reviewData.topProducerTip.focusOutcome}</span>
                      </div>
                    </div>
                  )}

                  {/* Sales Manager Perspective */}
                  {reviewData?.managerPerspective && (
                    <div className="p-3.5 rounded-2xl bg-white border border-[#EAE7E0] flex items-start gap-3 shadow-2xs">
                      <div className="w-7 h-7 rounded-xl bg-[#2D362E] text-[#E7C19D] flex items-center justify-center shrink-0 mt-0.5">
                        <Lightbulb className="w-3.5 h-3.5" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#7D8877] block">
                          Branch Manager Perspective
                        </span>
                        <p className="text-xs text-[#2D362E] leading-relaxed font-medium">
                          {reviewData.managerPerspective}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* AI Coaching Quote */}
                  {reviewData?.coachingQuote && (
                    <div className="p-3.5 rounded-2xl bg-[#F4F1EA] border border-[#EAE7E0] text-center">
                      <p className="text-xs italic text-[#606C5D]">
                        &ldquo;{reviewData.coachingQuote}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Recommended Next Action */}
                  {reviewData?.nextActionRecommendation && (
                    <div className="p-4 rounded-2xl bg-[#2D362E] text-white space-y-3 shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#E7C19D]">
                          Recommended Next Action
                        </span>
                        <span className="text-[11px] text-white/60">One-Click Jump</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-white">
                          {reviewData.nextActionRecommendation.actionTitle}
                        </h4>
                        <p className="text-xs text-[#C4BEB5] mt-1">
                          {reviewData.nextActionRecommendation.actionReason}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (reviewData.nextActionRecommendation?.tabId) {
                            onNavigateTab(reviewData.nextActionRecommendation.tabId);
                            onClose();
                          }
                        }}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#C18C5D] hover:bg-[#A87447] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                      >
                        <span>Jump to Section Now</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================ */}
              {/* HORIZON 2: WEEK-TO-WEEK PERSISTENCE & COMPARATIVE REVIEW     */}
              {/* ============================================================ */}
              {activeHorizon === "weekly" && (
                <div className="space-y-4">
                  {weeklyData?.reviewData ? (
                    <>
                      {/* Week Header Badge & Grade */}
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#2D362E] via-[#3B473D] to-[#2D362E] text-white flex items-center justify-between gap-4 shadow-md">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/15 text-[#E7C19D] border border-white/10 flex items-center gap-1">
                              <CalendarDays className="w-3 h-3" />
                              <span>{weeklyData.weekLabel || `Week ${weeklyData.weekNumber}`}</span>
                            </span>
                            <span className="text-[11px] text-[#C4BEB5]">
                              {weeklyData.startDate} to {weeklyData.endDate}
                            </span>
                          </div>
                          <h4 className="font-serif font-bold text-lg text-white">
                            {weeklyData.reviewData.headline}
                          </h4>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#E7C19D] block">
                            Pacing Grade
                          </span>
                          <span className="text-xl sm:text-2xl font-black text-white font-mono">
                            {weeklyData.reviewData.performanceGrade}
                          </span>
                        </div>
                      </div>

                      {/* Week-over-Week Comparative Callout */}
                      <div className="p-4 rounded-2xl bg-white border border-[#EAE7E0] space-y-2.5 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-[#C18C5D]" />
                            <span className="text-xs font-bold uppercase tracking-wider text-[#2D362E]">
                              Week-Over-Week Execution Variance
                            </span>
                          </div>

                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                            weeklyData.reviewData.weekOverWeekTrend === "improving"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                              : weeklyData.reviewData.weekOverWeekTrend === "steady"
                              ? "bg-blue-50 text-blue-800 border-blue-300"
                              : "bg-amber-50 text-amber-800 border-amber-300"
                          }`}>
                            <span className="capitalize">
                              {weeklyData.reviewData.weekOverWeekTrend.replace(/_/g, " ")}
                            </span>
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm text-[#4A5D4E] leading-relaxed">
                          {weeklyData.reviewData.priorWeekComparisonSummary}
                        </p>

                        <div className="pt-2 border-t border-[#F4F1EA] flex items-center justify-between text-[11px] text-[#7D8877]">
                          <span>Execution: {weeklyData.totalTasksCompleted}/{weeklyData.totalTasksTargeted} tasks completed</span>
                          <span className="font-bold text-[#2D362E]">{weeklyData.completionRate}% Weekly Pacing</span>
                        </div>
                      </div>

                      {/* Key Accomplishments This Week */}
                      <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#EAE7E0] space-y-2.5">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2D362E]">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Key Accomplishments Moved Forward This Week</span>
                        </div>
                        <div className="space-y-2">
                          {weeklyData.reviewData.keyAccomplishments.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-2.5 text-xs text-[#2D362E]">
                              <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                                ✓
                              </span>
                              <span className="leading-relaxed">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Top Producer Playbook For Next Week */}
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FAF6EE] to-[#F2EDE2] border border-[#DCD7CD] space-y-3 shadow-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-[#A87447]" />
                            <span className="text-xs font-bold uppercase tracking-wider text-[#A87447]">
                              Top Producer 3-Point Playbook for Next Week
                            </span>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/60 text-amber-900 border border-amber-300">
                            High Leverage
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          {weeklyData.reviewData.topProducerPlaybookNextWeek.map((tactic, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-white border border-[#EAE7E0] flex items-start gap-3 shadow-2xs">
                              <span className="w-5 h-5 rounded-full bg-[#C18C5D] text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <p className="text-xs text-[#2D362E] font-medium leading-snug">
                                {tactic}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Sales Manager Weekly Directive */}
                      <div className="p-4 rounded-2xl bg-white border border-[#EAE7E0] flex items-start gap-3 shadow-2xs">
                        <div className="w-8 h-8 rounded-xl bg-[#2D362E] text-[#E7C19D] flex items-center justify-center shrink-0 mt-0.5">
                          <Lightbulb className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7D8877] block">
                            Branch Manager Weekly Directive
                          </span>
                          <p className="text-xs sm:text-sm text-[#2D362E] leading-relaxed font-medium">
                            {weeklyData.reviewData.salesManagerWeeklyDirective}
                          </p>
                        </div>
                      </div>

                      {/* Recommended Focus Tab Button */}
                      {weeklyData.reviewData.recommendedFocusTab && (
                        <button
                          onClick={() => {
                            onNavigateTab(weeklyData.reviewData?.recommendedFocusTab);
                            onClose();
                          }}
                          className="w-full py-2.5 px-4 rounded-2xl bg-[#C18C5D] hover:bg-[#A87447] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                        >
                          <span>Open Recommended Weekly Focus Area</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="py-12 text-center space-y-4">
                      <Calendar className="w-12 h-12 text-[#C18C5D] mx-auto opacity-70" />
                      <div>
                        <h4 className="font-serif font-bold text-base text-[#2D362E]">
                          No Weekly Pulse Generated Yet for this Week
                        </h4>
                        <p className="text-xs text-[#7D8877] max-w-sm mx-auto mt-1">
                          Generate a week-to-week retrospective to benchmark task pacing against prior weeks and lock in next week&apos;s playbook.
                        </p>
                      </div>
                      <button
                        onClick={onRefreshWeekly}
                        className="px-4 py-2 rounded-xl bg-[#2D362E] hover:bg-[#1E241F] text-white font-bold text-xs inline-flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#E7C19D]" />
                        <span>Generate Weekly Pulse Now</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================ */}
              {/* HORIZON 3: 30-DAY PRODUCTIVITY HORIZON (LOOKBACK & FORWARD)  */}
              {/* ============================================================ */}
              {activeHorizon === "monthly" && (
                <div className="space-y-4">
                  {monthlyData?.reviewData ? (
                    <>
                      {/* Productivity Score & Pacing Header */}
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#2D362E] via-[#3E4C3F] to-[#2D362E] text-white flex items-center justify-between gap-4 shadow-md">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white/15 text-emerald-300 border border-white/10 flex items-center gap-1">
                              <BarChart3 className="w-3 h-3" />
                              <span>{monthlyData.monthLabel}</span>
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              monthlyData.reviewData.pacingStatus === "ahead_of_quota"
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
                                : monthlyData.reviewData.pacingStatus === "on_track"
                                ? "bg-blue-500/20 text-blue-300 border-blue-400/40"
                                : "bg-amber-500/20 text-amber-300 border-amber-400/40"
                            }`}>
                              <span className="capitalize">{monthlyData.reviewData.pacingStatus.replace(/_/g, " ")}</span>
                            </span>
                          </div>
                          <h4 className="font-serif font-bold text-lg text-white">
                            {monthlyData.reviewData.headline}
                          </h4>
                        </div>

                        <div className="text-right shrink-0 bg-white/10 px-3 py-2 rounded-2xl border border-white/15">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#E7C19D] block">
                            Productivity Score
                          </span>
                          <div className="flex items-baseline justify-end gap-1">
                            <span className="text-2xl font-black text-white font-mono">
                              {monthlyData.reviewData.productivityScore}
                            </span>
                            <span className="text-xs text-white/60">/100</span>
                          </div>
                        </div>
                      </div>

                      {/* 30-Day Lookback Retrospective */}
                      <div className="p-4 rounded-2xl bg-white border border-[#EAE7E0] space-y-3 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <History className="w-4 h-4 text-sky-600" />
                            <span className="text-xs font-bold uppercase tracking-wider text-[#2D362E]">
                              30-Day Lookback Retrospective
                            </span>
                          </div>
                          <span className="text-[11px] text-[#7D8877]">
                            {monthlyData.reviewData.lookback30Days.totalDaysTracked} Operating Days Logged
                          </span>
                        </div>

                        <p className="text-xs text-[#4A5D4E] leading-relaxed">
                          {monthlyData.reviewData.lookback30Days.retrospectiveSummary}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Biggest Accomplishments</span>
                            </span>
                            <ul className="text-xs text-emerald-950 space-y-1 list-disc list-inside">
                              {monthlyData.reviewData.lookback30Days.biggestWins.map((win, idx) => (
                                <li key={idx} className="leading-snug">{win}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 text-amber-600" />
                              <span>Missed Opportunities &amp; Gaps</span>
                            </span>
                            <ul className="text-xs text-amber-950 space-y-1 list-disc list-inside">
                              {monthlyData.reviewData.lookback30Days.missedOpportunities.map((gap, idx) => (
                                <li key={idx} className="leading-snug">{gap}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* 30-Day Forward Production Roadmap */}
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FAF6EE] to-[#F2EDE2] border border-[#DCD7CD] space-y-3.5 shadow-xs">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <Milestone className="w-4 h-4 text-[#C18C5D]" />
                            <span className="text-xs font-bold uppercase tracking-wider text-[#A87447]">
                              30-Day Lookforward Production Roadmap
                            </span>
                          </div>
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#2D362E] text-[#E7C19D]">
                            Target: {monthlyData.reviewData.lookforward30Days.revenueGoalVolume}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white/80 border border-[#EAE7E0] text-xs text-[#4A5D4E]">
                          <span className="font-bold text-[#2D362E]">Recommended Monthly Focus: </span>
                          <span>{monthlyData.reviewData.lookforward30Days.recommendedFocus}</span>
                        </div>

                        {/* 4 Weekly Milestones */}
                        <div className="space-y-2">
                          {monthlyData.reviewData.lookforward30Days.weeklyMilestones.map((m, idx) => (
                            <div 
                              key={idx}
                              className="p-3 rounded-xl bg-white border border-[#EAE7E0] flex items-start justify-between gap-3 shadow-2xs"
                            >
                              <div className="flex items-start gap-2.5 min-w-0">
                                <span className="w-5 h-5 rounded-full bg-[#2D362E] text-[#E7C19D] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                  {idx + 1}
                                </span>
                                <div className="space-y-0.5 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-[#2D362E]">{m.weekLabel}</span>
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#F4F1EA] text-[#7D8877] font-semibold">
                                      {m.focusArea}
                                    </span>
                                  </div>
                                  <p className="text-xs text-[#606C5D] leading-snug">
                                    {m.milestone}
                                  </p>
                                </div>
                              </div>

                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                                m.status === "completed"
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                  : m.status === "in_progress"
                                  ? "bg-sky-100 text-sky-800 border-sky-300"
                                  : "bg-[#F4F1EA] text-[#7D8877] border-[#EAE7E0]"
                              }`}>
                                {m.status === "in_progress" ? "In Progress" : m.status === "completed" ? "Done" : "Planned"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Top Producer 30-Day Blueprint */}
                      <div className="p-4 rounded-2xl bg-white border border-[#EAE7E0] flex items-start gap-3 shadow-2xs">
                        <div className="w-8 h-8 rounded-xl bg-[#C18C5D] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                          <Trophy className="w-4 h-4 text-amber-100" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#A87447] block">
                            Top 1% Originator 30-Day Blueprint
                          </span>
                          <p className="text-xs sm:text-sm text-[#2D362E] leading-relaxed font-medium">
                            {monthlyData.reviewData.lookforward30Days.topProducer30DayBlueprint}
                          </p>
                        </div>
                      </div>

                      {/* Executive Sales Manager Prescription */}
                      <div className="p-4 rounded-2xl bg-[#2D362E] text-white flex items-start gap-3 shadow-md">
                        <div className="w-8 h-8 rounded-xl bg-white/15 text-[#E7C19D] flex items-center justify-center shrink-0 mt-0.5">
                          <Lightbulb className="w-4 h-4 text-[#E7C19D]" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#E7C19D] block">
                            Executive Sales Director Prescription
                          </span>
                          <p className="text-xs sm:text-sm text-[#F4F1EA] leading-relaxed">
                            {monthlyData.reviewData.lookforward30Days.executiveSalesManagerPrescription}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="py-12 text-center space-y-4">
                      <BarChart3 className="w-12 h-12 text-[#C18C5D] mx-auto opacity-70" />
                      <div>
                        <h4 className="font-serif font-bold text-base text-[#2D362E]">
                          No 30-Day Productivity Horizon Formatted Yet
                        </h4>
                        <p className="text-xs text-[#7D8877] max-w-sm mx-auto mt-1">
                          Generate your 30-day lookback retrospective and 4-week forward production roadmap with revenue targets.
                        </p>
                      </div>
                      <button
                        onClick={onRefreshMonthly}
                        className="px-4 py-2 rounded-xl bg-[#2D362E] hover:bg-[#1E241F] text-white font-bold text-xs inline-flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#E7C19D]" />
                        <span>Generate 30-Day Horizon Now</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#EAE7E0] bg-white flex items-center justify-between gap-3">
          <button
            onClick={() => {
              if (activeHorizon === "daily") onRefreshReview();
              else if (activeHorizon === "weekly") onRefreshWeekly?.();
              else if (activeHorizon === "monthly") onRefreshMonthly?.();
            }}
            disabled={currentLoading}
            className="px-3.5 py-2 rounded-xl bg-[#F4F1EA] hover:bg-[#EAE7E0] text-[#2D362E] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${currentLoading ? 'animate-spin' : ''}`} />
            <span>
              {activeHorizon === "daily" 
                ? "Re-Run Daily Review" 
                : activeHorizon === "weekly"
                ? "Re-Run Weekly Pulse"
                : "Re-Calculate 30-Day Horizon"}
            </span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#2D362E] hover:bg-[#1E241F] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            Close &amp; Continue
          </button>
        </div>
      </div>
    </div>
  );
};
