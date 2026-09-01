import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { 
  CheckCircle2, 
  Circle, 
  Compass, 
  Clock, 
  AlertTriangle, 
  Lightbulb, 
  ChevronDown, 
  ChevronUp, 
  Trophy, 
  Award,
  ArrowRight,
  LayoutDashboard,
  Calculator,
  RotateCcw,
  Printer,
  Mail,
  Zap,
  X
} from "lucide-react";
import { RoadmapMilestone, FinancialProfile, PropertyListing, DocumentItem, LoanOfficerProfile, RealEstateAgentProfile, MilestoneEmailAlertSettings } from "../types";
import { HomebuyingPlanPrintModal } from "./HomebuyingPlanPrintModal";
import { ShareViaEmailModal } from "./ShareViaEmailModal";
import { DEFAULT_FINANCIAL_PROFILE } from "../data/initialData";
import { getMilestoneAlertSettings, triggerMilestoneEmailNotification } from "../utils/milestoneNotifier";

interface RoadmapViewProps {
  milestones: RoadmapMilestone[];
  setMilestones: React.Dispatch<React.SetStateAction<RoadmapMilestone[]>>;
  onGoToDashboard?: () => void;
  onNavigate?: (tab: string, mode?: "website" | "dashboard") => void;
  onBackToStep1?: () => void;
  profile?: FinancialProfile;
  properties?: PropertyListing[];
  documents?: DocumentItem[];
  loanOfficer?: LoanOfficerProfile;
  activeAgent?: RealEstateAgentProfile;
  isCoBranded?: boolean;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  milestones,
  setMilestones,
  onGoToDashboard,
  onNavigate,
  onBackToStep1,
  profile = DEFAULT_FINANCIAL_PROFILE,
  properties = [],
  documents = [],
  loanOfficer,
  activeAgent,
  isCoBranded = false,
}) => {
  const [selectedStage, setSelectedStage] = useState<string>("All");
  const [expandedStepId, setExpandedStepId] = useState<string>("step-1");
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareModalTab, setShareModalTab] = useState<"editor" | "auto_trigger" | "preview">("editor");

  // Milestone auto-email notification state
  const [autoSettings, setAutoSettings] = useState<MilestoneEmailAlertSettings>(() => getMilestoneAlertSettings());
  const [activeAlertToast, setActiveAlertToast] = useState<{
    milestoneTitle: string;
    stepNumber: number;
    recipientEmail: string;
    sentAt: string;
  } | null>(null);

  // Sync settings when modified
  useEffect(() => {
    const handleSettingsChange = (e: any) => {
      if (e.detail) {
        setAutoSettings(e.detail);
      } else {
        setAutoSettings(getMilestoneAlertSettings());
      }
    };
    window.addEventListener("manus-milestone-settings-changed", handleSettingsChange);
    return () => {
      window.removeEventListener("manus-milestone-settings-changed", handleSettingsChange);
    };
  }, []);

  // Calculate total completed tasks
  const allTasks = milestones.flatMap(m => m.tasks);
  const completedTasks = allTasks.filter(t => t.done).length;
  const totalTasks = allTasks.length;
  const progressPercent = Math.round((completedTasks / totalTasks) * 100);

  const toggleTask = (milestoneId: string, taskId: string) => {
    let justCompletedMilestone: RoadmapMilestone | null = null;
    let newMilestonesState: RoadmapMilestone[] = [];

    setMilestones(prev => {
      const next = prev.map(m => {
        if (m.id !== milestoneId) return m;
        const updatedTasks = m.tasks.map(t => (t.id === taskId ? { ...t, done: !t.done } : t));
        const allDone = updatedTasks.every(t => t.done);
        
        if (allDone && !m.completed) {
          justCompletedMilestone = {
            ...m,
            tasks: updatedTasks,
            completed: true
          };
          confetti({
            particleCount: 70,
            spread: 60,
            origin: { y: 0.7 }
          });
        }

        return {
          ...m,
          tasks: updatedTasks,
          completed: allDone
        };
      });
      newMilestonesState = next;
      return next;
    });

    // If milestone was just completed, trigger automated email notification
    if (justCompletedMilestone) {
      const milestoneCompleted: RoadmapMilestone = justCompletedMilestone;
      const settings = getMilestoneAlertSettings();
      if (settings.enabled && settings.recipientEmail) {
        triggerMilestoneEmailNotification({
          milestone: milestoneCompleted,
          profile,
          milestones: newMilestonesState.length > 0 ? newMilestonesState : milestones,
          properties,
          loanOfficer,
          activeAgent,
          overrideEmail: settings.recipientEmail
        }).then(result => {
          if (result.success) {
            setActiveAlertToast({
              milestoneTitle: milestoneCompleted.title,
              stepNumber: milestoneCompleted.stepNumber,
              recipientEmail: settings.recipientEmail,
              sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
            setTimeout(() => {
              setActiveAlertToast(prev => (prev?.milestoneTitle === milestoneCompleted.title ? null : prev));
            }, 8000);
          }
        });
      }
    }
  };

  const filteredMilestones = selectedStage === "All"
    ? milestones
    : milestones.filter(m => m.stage === selectedStage);

  const stages = ["All", "Readiness", "Financing", "Hunting", "Contract", "Closing"];

  return (
    <div className="space-y-10 relative">
      {/* Floating Milestone Email Sent Toast Notification */}
      {activeAlertToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-[#2D362E] text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-start gap-3.5 animate-in slide-in-from-bottom-5 duration-300">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
            <Zap className="w-5 h-5 text-amber-300" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                🎉 Milestone Dispatched to Email
              </span>
              <button
                onClick={() => setActiveAlertToast(null)}
                className="text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs font-bold text-white">
              Step {activeAlertToast.stepNumber}: {activeAlertToast.milestoneTitle}
            </p>
            <p className="text-[11px] text-white/80">
              An updated roadmap and status summary was sent to <strong>{activeAlertToast.recipientEmail}</strong> at {activeAlertToast.sentAt}.
            </p>
            <div className="pt-1.5 flex items-center gap-2">
              <button
                onClick={() => {
                  setShareModalTab("auto_trigger");
                  setIsShareModalOpen(true);
                  setActiveAlertToast(null);
                }}
                className="text-[11px] font-bold text-[#D4A373] hover:text-white underline cursor-pointer"
              >
                View Email Log & Settings →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header & Overall Progress Bar */}
      <div className="bg-white rounded-3xl border border-[#EAE7E0] p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1EFE9] text-[#4A5D4E] text-xs font-semibold border border-[#EAE7E0]">
              <Compass className="w-3.5 h-3.5" />
              <span>The 10-Step Chronological Playbook</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D362E]">
              Your Master Homebuying Journey
            </h2>
            <p className="text-sm text-[#606C5D] max-w-2xl">
              Track tasks from budget reality to closing day keys. Every milestone includes vetted pro tips, red-flag pitfalls, and automated email progress triggers.
            </p>
          </div>

          {/* Header Action / Readiness Strip */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Auto-Email Notification Status Pill */}
            <button
              onClick={() => {
                setShareModalTab("auto_trigger");
                setIsShareModalOpen(true);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-3 rounded-2xl border text-xs font-bold transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                autoSettings.enabled
                  ? "bg-[#EBF3ED] border-[#A7D1B4] text-[#4A5D4E] hover:bg-[#dfeee3]"
                  : "bg-[#F9F8F4] border-[#EAE7E0] text-[#606C5D] hover:bg-stone-100"
              }`}
              title="Configure Automated Milestone Email Notifications"
            >
              <Zap className={`w-3.5 h-3.5 ${autoSettings.enabled ? "text-amber-500 fill-amber-500" : "text-[#9A9488]"}`} />
              <span>
                {autoSettings.enabled ? "Auto-Email Alerts: ON" : "Auto-Email Alerts: OFF"}
              </span>
            </button>

            <button
              onClick={() => {
                setShareModalTab("editor");
                setIsShareModalOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border border-[#4A5D4E] text-[#4A5D4E] hover:bg-[#F9F8F4] font-bold text-xs shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="Send your Homebuying Roadmap & Saved Properties to your email"
            >
              <Mail className="w-4 h-4 text-[#4A5D4E]" />
              <span>Share via Email</span>
            </button>
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#4A5D4E] hover:bg-[#38463B] text-white font-bold text-xs shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="Print your customized Homebuying Plan, Milestones & Property Field Notes"
            >
              <Printer className="w-4 h-4 text-[#D4A373]" />
              <span>Print Plan & Notes</span>
            </button>

            {/* Overall Readiness Pill */}
            <div className="bg-[#F1EFE9] p-3.5 sm:p-4 rounded-2xl border border-[#EAE7E0] flex items-center gap-4 shrink-0 shadow-2xs">
              <div className="relative w-14 h-14 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[#DEDAD2]"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#4A5D4E] transition-all duration-700"
                    strokeDasharray={`${progressPercent}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-xs font-bold text-[#2D362E]">{progressPercent}%</span>
              </div>
              <div>
                <span className="text-xs text-[#9A9488] block font-medium">Buyer Readiness</span>
                <span className="text-sm font-bold text-[#2D362E]">{completedTasks} of {totalTasks} Tasks Complete</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stage Filter Buttons */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-[#EAE7E0]">
          {stages.map(stage => (
            <button
              key={stage}
              onClick={() => setSelectedStage(stage)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedStage === stage
                  ? "bg-[#4A5D4E] text-white shadow-sm font-bold"
                  : "bg-white text-[#606C5D] hover:text-[#2D362E] border border-[#EAE7E0]"
              }`}
            >
              {stage}
            </button>
          ))}
        </div>
      </div>

      {/* Step Cards List */}
      <div className="space-y-4">
        {filteredMilestones.map((step) => {
          const isExpanded = expandedStepId === step.id;
          const stepDone = step.tasks.every(t => t.done);
          const stepCompletedCount = step.tasks.filter(t => t.done).length;

          return (
            <div
              key={step.id}
              className={`rounded-2xl border transition-all shadow-sm ${
                stepDone
                  ? "bg-[#F1EFE9] border-[#4A5D4E]/40"
                  : "bg-white border-[#EAE7E0] hover:border-[#DEDAD2]"
              }`}
            >
              {/* Card Header */}
              <div
                onClick={() => setExpandedStepId(isExpanded ? "" : step.id)}
                className="p-5 sm:p-6 cursor-pointer flex items-center justify-between gap-4 select-none"
              >
                <div className="flex items-center gap-4">
                  {/* Step badge */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                      stepDone
                        ? "bg-[#4A5D4E] text-white shadow-sm"
                        : "bg-[#F1EFE9] text-[#4A5D4E] border border-[#EAE7E0]"
                    }`}
                  >
                    {stepDone ? <CheckCircle2 className="w-5 h-5" /> : `0${step.stepNumber}`}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#4A5D4E]">
                        {step.stage}
                      </span>
                      <span className="text-[#DEDAD2]">•</span>
                      <span className="text-[11px] text-[#9A9488] flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {step.duration}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-[#2D362E]">
                      {step.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-[#606C5D] hidden sm:block">
                    {stepCompletedCount}/{step.tasks.length} tasks
                  </span>
                  <div className="p-2 rounded-lg bg-[#F1EFE9] text-[#606C5D] border border-[#EAE7E0]">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Collapsible Content */}
              {isExpanded && (
                <div className="px-5 pb-6 sm:px-6 sm:pb-8 pt-2 border-t border-[#EAE7E0] space-y-6 animate-in slide-in-from-top-2 duration-150">
                  <p className="text-xs sm:text-sm text-[#606C5D] leading-relaxed">
                    {step.summary}
                  </p>

                  {/* Tasks Checklists */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#9A9488]">
                      Required Action Items
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {step.tasks.map(task => (
                        <div
                          key={task.id}
                          onClick={() => toggleTask(step.id, task.id)}
                          className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                            task.done
                              ? "bg-white border-[#4A5D4E]/30 text-[#9A9488]"
                              : "bg-[#F9F8F4] border-[#EAE7E0] text-[#2D362E] hover:border-[#4A5D4E]/50"
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {task.done ? (
                              <CheckCircle2 className="w-4 h-4 text-[#4A5D4E]" />
                            ) : (
                              <Circle className="w-4 h-4 text-[#9A9488] hover:text-[#4A5D4E]" />
                            )}
                          </div>
                          <span className={`text-xs sm:text-sm ${task.done ? "line-through text-[#9A9488] font-normal" : "font-medium"}`}>
                            {task.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pro Tips & Pitfalls */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Pro Tips */}
                    <div className="bg-[#F1EFE9] rounded-xl p-4 border border-[#4A5D4E]/20 space-y-2">
                      <div className="flex items-center gap-1.5 text-[#4A5D4E] font-bold">
                        <Lightbulb className="w-4 h-4 text-[#C18C5D]" />
                        <span>Roadmap Pro Tips</span>
                      </div>
                      <ul className="space-y-1.5 text-[#2D362E] pl-4 list-disc marker:text-[#4A5D4E]">
                        {step.keyTips.map((tip, idx) => (
                          <li key={idx} className="leading-relaxed">{tip}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Common Pitfalls */}
                    <div className="bg-rose-50/50 rounded-xl p-4 border border-rose-200 space-y-2">
                      <div className="flex items-center gap-1.5 text-[#B94A48] font-bold">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Common First-Time Pitfalls</span>
                      </div>
                      <ul className="space-y-1.5 text-[#2D362E] pl-4 list-disc marker:text-[#B94A48]">
                        {step.commonPitfalls.map((pitfall, idx) => (
                          <li key={idx} className="leading-relaxed">{pitfall}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Guided 4-Step Flow: Proceed to Step 3 Navigation Card */}
      <div className="bg-gradient-to-br from-[#2D362E] to-[#1E251F] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-[#4A5D4E]/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#4A5D4E]/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Step 2 Explored: Master Roadmap & Strategy
              </span>
              <span className="text-xs text-[#DEDAD2]">Next Up in Your Homebuyer Journey</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white leading-tight">
              Ready for Step 3: Your Live Buyer Dashboard & Command Center?
            </h3>

            <p className="text-xs sm:text-sm text-[#DEDAD2] leading-relaxed">
              Bring together all your monthly budget calculations, saved touring properties, document prep vault, and closing milestones in your dedicated buyer workspace.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              type="button"
              id="step2-back-to-step1-btn"
              onClick={() => {
                if (onBackToStep1) {
                  onBackToStep1();
                } else if (onNavigate) {
                  onNavigate("calculator", "website");
                }
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#DEDAD2] hover:text-white text-xs font-semibold border border-white/15 transition-all cursor-pointer"
            >
              <Calculator className="w-4 h-4 text-[#D4A373]" />
              <span>← Back to Step 1</span>
            </button>

            <button
              type="button"
              id="step2-proceed-to-step3-btn"
              onClick={() => {
                if (onGoToDashboard) {
                  onGoToDashboard();
                } else if (onNavigate) {
                  onNavigate("dashboard", "dashboard");
                }
              }}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#C18C5D] hover:bg-[#A87448] active:scale-[0.99] text-white font-bold text-sm shadow-lg transition-all cursor-pointer group"
            >
              <LayoutDashboard className="w-4 h-4 text-white" />
              <span>Continue to Step 3: Buyer Dashboard</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Printable Homebuying Plan & Property Notes Modal */}
      <HomebuyingPlanPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        profile={profile}
        milestones={milestones}
        properties={properties}
        documents={documents}
        loanOfficer={loanOfficer}
        activeAgent={activeAgent}
        isCoBranded={isCoBranded}
      />

      {/* Share Roadmap & Properties via Email Modal with Automated Milestone Alerts */}
      <ShareViaEmailModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        profile={profile}
        milestones={milestones}
        properties={properties}
        documents={documents}
        loanOfficer={loanOfficer}
        activeAgent={activeAgent}
        initialTab={shareModalTab}
      />
    </div>
  );
};
