import React, { useState } from "react";
import { 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  Circle, 
  AlertTriangle, 
  Key, 
  DollarSign, 
  FileText, 
  Search,
  Building,
  PhoneCall
} from "lucide-react";
import { EscrowMilestone } from "../types";
import { ESCROW_TIMELINE_STEPS } from "../data/initialData";

export const EscrowTracker: React.FC = () => {
  const [steps, setSteps] = useState<EscrowMilestone[]>(ESCROW_TIMELINE_STEPS);

  const toggleStep = (id: string) => {
    setSteps(prev =>
      prev.map(s => {
        if (s.id !== id) return s;
        return {
          ...s,
          status: s.status === "completed" ? "in_progress" : "completed"
        };
      })
    );
  };

  const completedCount = steps.filter(s => s.status === "completed").length;
  const progress = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#EAE7E0] p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1EFE9] text-[#4A5D4E] text-xs font-semibold border border-[#EAE7E0]">
              <Clock className="w-3.5 h-3.5 text-[#C18C5D]" />
              <span>Purchase Contract to Closing Day</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D362E]">
              30-Day Escrow Closing Tracker
            </h2>
            <p className="text-xs sm:text-sm text-[#606C5D] max-w-2xl">
              From contract mutual acceptance to key exchange. Track your contingency periods, appraisal timeline, and 3-day Closing Disclosure (CD) rules.
            </p>
          </div>

          <div className="bg-[#F1EFE9] p-4 rounded-2xl border border-[#EAE7E0] flex items-center gap-4 shrink-0">
            <div className="text-right">
              <span className="text-xs text-[#606C5D] block font-medium">Escrow Pipeline</span>
              <span className="text-sm font-bold text-[#C18C5D]">{completedCount} of {steps.length} Milestones Done</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white border border-[#EAE7E0] text-[#C18C5D] flex items-center justify-center font-bold text-sm shadow-xs">
              {progress}%
            </div>
          </div>
        </div>

        {/* Wire Fraud Warning Banner */}
        <div className="bg-[#C18C5D]/10 p-4 rounded-2xl border border-[#C18C5D]/30 flex items-start gap-3.5 text-xs text-[#2D362E]">
          <ShieldAlert className="w-5 h-5 text-[#C18C5D] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold uppercase tracking-wider text-[11px] text-[#A87447]">
              CRITICAL: Wire Fraud Prevention Protocol
            </h4>
            <p className="leading-relaxed text-[#606C5D]">
              Never wire money based solely on an email request, even if it looks like it came from your real estate agent or title company. Hackers frequently spoof email addresses during active escrows. <strong className="text-[#2D362E]">Always call your verified escrow officer via phone to confirm routing and account numbers before wiring funds.</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Escrow Timeline */}
      <div className="space-y-4">
        {steps.map((step) => {
          const isDone = step.status === "completed";

          return (
            <div
              key={step.id}
              onClick={() => toggleStep(step.id)}
              className={`p-6 rounded-2xl border cursor-pointer transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm ${
                isDone
                  ? "bg-[#F9F8F4] border-[#4A5D4E]/40"
                  : "bg-white border-[#EAE7E0] hover:border-[#DEDAD2]"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1 shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-6 h-6 text-[#4A5D4E]" />
                  ) : (
                    <Circle className="w-6 h-6 text-[#9A9488] hover:text-[#4A5D4E]" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#F1EFE9] text-[#C18C5D] border border-[#EAE7E0]">
                      {step.dayTarget}
                    </span>
                    {step.criticalDeadline && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        Critical Contingency Deadline
                      </span>
                    )}
                  </div>
                  <h3 className={`text-base font-bold ${isDone ? "text-[#9A9488] line-through" : "text-[#2D362E]"}`}>
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#606C5D] leading-relaxed max-w-2xl">
                    {step.description}
                  </p>

                  {/* Action items list */}
                  <div className="pt-2 flex flex-wrap gap-2">
                    {step.actionItems.map((action, i) => (
                      <span key={i} className="text-[11px] bg-[#F1EFE9] px-2.5 py-1 rounded-lg border border-[#EAE7E0] text-[#606C5D]">
                        • {action}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="shrink-0 self-end sm:self-center">
                <span className={`text-xs font-bold px-3 py-1 rounded-xl capitalize ${
                  isDone
                    ? "bg-[#4A5D4E]/10 text-[#4A5D4E] border border-[#4A5D4E]/20"
                    : "bg-[#F1EFE9] text-[#606C5D] border border-[#EAE7E0]"
                }`}>
                  {step.status.replace("_", " ")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
