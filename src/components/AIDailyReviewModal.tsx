import React from "react";
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
  Target
} from "lucide-react";

export interface DailyReviewData {
  headline: string;
  motivationalBadge: string;
  whatDoneSummary: string;
  topPriorities: string[];
  coachingQuote: string;
  nextActionRecommendation?: {
    tabId: string;
    actionTitle: string;
    actionReason: string;
  };
}

interface AIDailyReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewData: DailyReviewData | null;
  isLoading: boolean;
  onRefreshReview: () => void;
  onNavigateTab: (tabId: any) => void;
  timePhase: "morning" | "midday" | "afternoon" | "end_of_day";
  currentTimeString: string;
}

export const AIDailyReviewModal: React.FC<AIDailyReviewModalProps> = ({
  isOpen,
  onClose,
  reviewData,
  isLoading,
  onRefreshReview,
  onNavigateTab,
  timePhase,
  currentTimeString
}) => {
  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div 
        className="relative w-full max-w-2xl bg-[#FDFBF7] rounded-3xl border border-[#DCD7CD] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-[#EAE7E0] bg-white flex items-start justify-between gap-4">
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
                  <span>Real-Time AI Review</span>
                </span>
              </div>
              <h3 className="font-serif font-bold text-xl text-[#2D362E]">
                {reviewData?.headline || "AI Production Coach & Daily Review"}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-full bg-[#F4F1EA] hover:bg-[#EAE7E0] text-[#606C5D] flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {isLoading ? (
            <div className="py-14 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#C18C5D] animate-spin mx-auto" />
              <p className="font-serif font-bold text-base text-[#2D362E]">
                Analyzing today&apos;s pipeline progress & daily milestones...
              </p>
              <p className="text-xs text-[#7D8877] max-w-sm mx-auto">
                Synthesizing completed touches, open pre-approvals, and current shift bandwidth.
              </p>
            </div>
          ) : (
            <>
              {/* Motivational Banner */}
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
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#EAE7E0] bg-white flex items-center justify-between gap-3">
          <button
            onClick={onRefreshReview}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-[#F4F1EA] hover:bg-[#EAE7E0] text-[#2D362E] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Re-Run AI Review</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#2D362E] hover:bg-[#1E241F] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            Close & Continue
          </button>
        </div>
      </div>
    </div>
  );
};
