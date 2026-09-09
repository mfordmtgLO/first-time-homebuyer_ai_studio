import React, { useState } from "react";
import {
  Award,
  Sparkles,
  Compass,
  TrendingDown,
  HeartHandshake,
  Eye,
  Trophy,
  Lock,
  CheckCircle2,
  ChevronRight,
  Zap,
  ArrowRight
} from "lucide-react";
import {
  LOAN_WISDOM_BADGES,
  LoanWisdomBadge,
  calculateLoanWisdomLevel,
} from "../services/loanWisdomBadgeService";

interface LoanWisdomBadgeShelfProps {
  unlockedBadgeIds: string[];
  points: number;
  onAskQuestionToUnlock?: (question: string, programTag?: string, fact?: string) => void;
  onOpenPreApproval?: () => void;
}

export const LoanWisdomBadgeShelf: React.FC<LoanWisdomBadgeShelfProps> = ({
  unlockedBadgeIds,
  points,
  onAskQuestionToUnlock,
  onOpenPreApproval,
}) => {
  const [selectedBadge, setSelectedBadge] = useState<LoanWisdomBadge | null>(null);
  const [showAllBadges, setShowAllBadges] = useState(false);

  const levelInfo = calculateLoanWisdomLevel(points);
  const unlockedSet = new Set(unlockedBadgeIds);

  const getBadgeIcon = (iconName: string, isUnlocked: boolean) => {
    const iconProps = { className: `w-3.5 h-3.5 ${isUnlocked ? "text-white" : "text-[#9A9488]"}` };
    switch (iconName) {
      case "Compass":
        return <Compass {...iconProps} />;
      case "Sparkles":
        return <Sparkles {...iconProps} />;
      case "TrendingDown":
        return <TrendingDown {...iconProps} />;
      case "HeartHandshake":
        return <HeartHandshake {...iconProps} />;
      case "Eye":
        return <Eye {...iconProps} />;
      case "Trophy":
        return <Trophy {...iconProps} />;
      default:
        return <Award {...iconProps} />;
    }
  };

  return (
    <div className="rounded-xl border border-[#EAE7E0] bg-[#FAF9F5] p-3 space-y-2.5 transition-all">
      {/* HEADER: Loan Wisdom Level & Tier Progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 shadow-2xs">
            <Award className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-[#2D362E]">Loan Wisdom Level</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-900 border border-amber-300 text-[10px] font-bold">
                Tier {levelInfo.level}: {levelInfo.title}
              </span>
            </div>
            <span className="text-[10px] text-[#606C5D] block">
              Gamified achievement badges unlocked as you explore financing
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-bold text-[#4A5D4E] flex items-center gap-1 justify-end">
            <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span>{points} pts</span>
          </div>
          <span className="text-[9px] text-[#9A9488]">
            {unlockedSet.size} of {LOAN_WISDOM_BADGES.length} unlocked
          </span>
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="space-y-1">
        <div className="w-full bg-[#EAE7E0] h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-amber-500 to-[#4A5D4E] transition-all duration-500 rounded-full"
            style={{ width: `${Math.min(100, Math.max(5, levelInfo.progressPct))}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[9px] text-[#606C5D]">
          <span>Current: {levelInfo.title}</span>
          <span>{levelInfo.level === 4 ? "Max Trust Level" : `${levelInfo.nextTierPoints - points} pts to next tier`}</span>
        </div>
      </div>

      {/* GAMIFIED ACHIEVEMENT ICONS ROW */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-[#606C5D] uppercase tracking-wider">
            Achievement Badges
          </span>
          <button
            type="button"
            onClick={() => setShowAllBadges((prev) => !prev)}
            className="text-[10px] font-semibold text-[#4A5D4E] hover:underline cursor-pointer"
          >
            {showAllBadges ? "Show less" : "View all criteria"}
          </button>
        </div>

        {/* Small gamified badge icons */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {LOAN_WISDOM_BADGES.map((badge) => {
            const isUnlocked = unlockedSet.has(badge.id);
            const isSelected = selectedBadge?.id === badge.id;

            return (
              <button
                key={badge.id}
                type="button"
                onClick={() => setSelectedBadge(isSelected ? null : badge)}
                className={`group relative p-2 rounded-xl border flex flex-col items-center text-center transition-all cursor-pointer ${
                  isUnlocked
                    ? `${badge.unlockedColor.bg} ${badge.unlockedColor.border} hover:scale-105 shadow-2xs`
                    : "bg-white/80 border-[#EAE7E0] hover:bg-white text-[#9A9488]"
                } ${isSelected ? "ring-2 ring-[#4A5D4E]" : ""}`}
                title={isUnlocked ? `${badge.name} (Unlocked)` : `${badge.name} (Locked - click to see how to unlock)`}
              >
                {/* Icon Container */}
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors mb-1 shadow-2xs ${
                    isUnlocked ? badge.unlockedColor.iconBg : "bg-[#EAE7E0]"
                  }`}
                >
                  {getBadgeIcon(badge.iconName, isUnlocked)}
                </div>

                {/* Badge Name */}
                <span
                  className={`text-[10px] font-bold leading-tight line-clamp-1 ${
                    isUnlocked ? badge.unlockedColor.text : "text-[#78716C]"
                  }`}
                >
                  {badge.name}
                </span>

                {/* Status Indicator */}
                <div className="mt-1 flex items-center gap-0.5">
                  {isUnlocked ? (
                    <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-700">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      +{badge.points}
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5 text-[9px] text-[#9A9488]">
                      <Lock className="w-2.5 h-2.5" />
                      {badge.points}p
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SELECTED BADGE DETAIL CARD / UNLOCK ASSISTANT */}
      {selectedBadge && (
        <div className="p-2.5 rounded-xl bg-white border border-[#EAE7E0] shadow-2xs text-xs space-y-1.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center text-white ${
                  unlockedSet.has(selectedBadge.id)
                    ? selectedBadge.unlockedColor.iconBg
                    : "bg-[#9A9488]"
                }`}
              >
                {getBadgeIcon(selectedBadge.iconName, unlockedSet.has(selectedBadge.id))}
              </div>
              <span className="font-bold text-[#2D362E]">{selectedBadge.name}</span>
            </div>
            <span
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                unlockedSet.has(selectedBadge.id)
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-[#FAF9F5] text-[#9A9488] border border-[#EAE7E0]"
              }`}
            >
              {unlockedSet.has(selectedBadge.id) ? "✓ Unlocked" : "🔒 Locked"}
            </span>
          </div>

          <p className="text-[#606C5D] text-[11px] leading-relaxed">
            {selectedBadge.description}
          </p>

          {!unlockedSet.has(selectedBadge.id) && (
            <div className="p-2 rounded-lg bg-[#FAF9F5] border border-amber-200/80 text-[10px] space-y-1.5">
              <div className="flex items-center gap-1 text-amber-800 font-bold">
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>How to Unlock:</span>
              </div>
              <p className="text-[#606C5D]">{selectedBadge.unlockTip}</p>
              
              {onAskQuestionToUnlock && (
                <button
                  type="button"
                  onClick={() => {
                    if (selectedBadge.id === "dpa_savvy") {
                      onAskQuestionToUnlock(
                        "Does this property qualify for the Oregon Bond 3% Cash Assistance or local DPA grants?",
                        "OHCS Oregon Bond DPA",
                        "OHCS Oregon Bond provides 3% or 5% in cash assistance towards down payment or closing costs."
                      );
                    } else if (selectedBadge.id === "rate_strategist") {
                      onAskQuestionToUnlock(
                        "Can we negotiate a seller credit to fund a 2-1 interest rate buydown on this listing?",
                        "2-1 Rate Buydown",
                        "A 2-1 buydown reduces your mortgage payment by 2% in year 1 and 1% in year 2 via seller credits."
                      );
                    } else if (selectedBadge.id === "trust_builder") {
                      onAskQuestionToUnlock(
                        "Hi Mike, what documents do I need to prepare for a quick pre-qualification on this home?",
                        "Quick Pre-Qual",
                        "Bi-directional sync notes directly communicate with Mike Ford and your local Realtor."
                      );
                    } else {
                      onAskQuestionToUnlock(
                        `What loan programs and down payment strategies do you recommend for this home?`,
                        "Loan Options"
                      );
                    }
                    setSelectedBadge(null);
                  }}
                  className="w-full py-1 px-2 rounded-md bg-[#4A5D4E] hover:bg-[#38463B] text-white font-bold text-[10px] flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-2xs"
                >
                  <span>Ask Question to Unlock (+{selectedBadge.points} pts)</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* DETAILED CRITERIA EXPANSION */}
      {showAllBadges && !selectedBadge && (
        <div className="space-y-1.5 pt-1 border-t border-[#EAE7E0]">
          {LOAN_WISDOM_BADGES.map((b) => {
            const isUnlocked = unlockedSet.has(b.id);
            return (
              <div
                key={b.id}
                className="p-2 rounded-lg bg-white border border-[#EAE7E0] flex items-start justify-between gap-2 text-[10px]"
              >
                <div>
                  <div className="font-bold text-[#2D362E] flex items-center gap-1">
                    <span>{b.name}</span>
                    {isUnlocked && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />}
                  </div>
                  <p className="text-[#606C5D]">{b.description}</p>
                  <p className="text-[#9A9488] italic text-[9px] mt-0.5">Unlock: {b.unlockTip}</p>
                </div>
                <span className="font-bold text-[#4A5D4E] shrink-0">+{b.points} pts</span>
              </div>
            );
          })}
        </div>
      )}

      {/* PRE-APPROVAL CALLOUT WHEN LEVEL >= 3 OR APPLICATION READY BADGE */}
      {(levelInfo.level >= 3 || unlockedSet.has("application_ready")) && onOpenPreApproval && (
        <div className="p-2.5 rounded-xl bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1 text-emerald-900 font-bold text-[11px]">
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              <span>Loan Wisdom Tier Unlocked: Ready to Apply!</span>
            </div>
            <p className="text-[10px] text-emerald-800 leading-tight">
              You've built high financing clarity. Launch your quick pre-qualification with Mike Ford now.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenPreApproval}
            className="px-2.5 py-1.5 rounded-lg bg-[#4A5D4E] hover:bg-[#38463B] text-white font-bold text-[10px] shrink-0 flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
          >
            <span>Pre-Qualify</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
