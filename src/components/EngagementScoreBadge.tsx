import React, { useState } from "react";
import { CapturedLead } from "../types";
import { computeLeadEngagement } from "../utils/leadEngagementScoring";
import { Zap, Home, Calculator, FileText, MessageSquare } from "lucide-react";

interface EngagementScoreBadgeProps {
  lead: CapturedLead;
  compact?: boolean;
}

export const EngagementScoreBadge: React.FC<EngagementScoreBadgeProps> = ({ lead, compact = false }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const breakdown = computeLeadEngagement(lead);

  if (compact) {
    return (
      <div 
        className="relative inline-block"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-help shadow-2xs ${breakdown.badgeColorClass}`}>
          <Zap className="w-2.5 h-2.5 shrink-0" />
          <span>Score: {breakdown.score}/100</span>
        </span>

        {showTooltip && (
          <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-stone-900 text-white rounded-2xl shadow-xl text-xs space-y-2 pointer-events-none">
            <div className="font-bold flex items-center justify-between border-b border-stone-800 pb-1.5">
              <span>Engagement Score: {breakdown.score}/100</span>
              <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-mono">{breakdown.tier} tier</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-300">
              <div className="flex items-center gap-1">
                <Home className="w-3 h-3 text-emerald-400" />
                <span>Saved: {breakdown.metrics.savedPropertiesCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calculator className="w-3 h-3 text-amber-400" />
                <span>Calcs: {breakdown.metrics.calculatorRunsCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <FileText className="w-3 h-3 text-blue-400" />
                <span>Guides: {breakdown.metrics.documentDownloadsCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3 text-purple-400" />
                <span>Chat: {breakdown.metrics.chatMessagesCount}</span>
              </div>
            </div>
            <p className="text-[10px] text-stone-400 italic">
              Weighted by interaction frequency &amp; recency.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EAE7E0] space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${breakdown.badgeColorClass}`}>
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#2D362E]">Engagement Score</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${breakdown.badgeColorClass}`}>
                {breakdown.score}/100 • {breakdown.badgeLabel}
              </span>
            </div>
            <p className="text-[11px] text-[#606C5D]">
              Calculated from active property saves, mortgage calculations, &amp; chat interactions.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        <div className="p-2 rounded-xl bg-white border border-[#EAE7E0] text-center">
          <div className="text-xs font-bold text-[#2D362E]">{breakdown.metrics.savedPropertiesCount}</div>
          <div className="text-[10px] text-[#606C5D] flex items-center justify-center gap-1">
            <Home className="w-3 h-3 text-emerald-700" />
            <span>Saved Homes</span>
          </div>
        </div>
        <div className="p-2 rounded-xl bg-white border border-[#EAE7E0] text-center">
          <div className="text-xs font-bold text-[#2D362E]">{breakdown.metrics.calculatorRunsCount}</div>
          <div className="text-[10px] text-[#606C5D] flex items-center justify-center gap-1">
            <Calculator className="w-3 h-3 text-amber-700" />
            <span>Calc Scenarios</span>
          </div>
        </div>
        <div className="p-2 rounded-xl bg-white border border-[#EAE7E0] text-center">
          <div className="text-xs font-bold text-[#2D362E]">{breakdown.metrics.documentDownloadsCount}</div>
          <div className="text-[10px] text-[#606C5D] flex items-center justify-center gap-1">
            <FileText className="w-3 h-3 text-blue-700" />
            <span>Guide Downloads</span>
          </div>
        </div>
        <div className="p-2 rounded-xl bg-white border border-[#EAE7E0] text-center">
          <div className="text-xs font-bold text-[#2D362E]">{breakdown.metrics.chatMessagesCount}</div>
          <div className="text-[10px] text-[#606C5D] flex items-center justify-center gap-1">
            <MessageSquare className="w-3 h-3 text-purple-700" />
            <span>Chat Msgs</span>
          </div>
        </div>
      </div>
    </div>
  );
};
