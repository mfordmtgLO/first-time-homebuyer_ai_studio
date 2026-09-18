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
  Sparkles,
  Calculator,
  RotateCcw,
  Printer,
  Mail,
  Zap,
  X,
  Calendar,
  Flag,
  Check,
  FileText
} from "lucide-react";
import { RoadmapMilestone, FinancialProfile, PropertyListing, DocumentItem, LoanOfficerProfile, RealEstateAgentProfile, MilestoneEmailAlertSettings } from "../types";
import { HomebuyingPlanPrintModal } from "./HomebuyingPlanPrintModal";
import { ShareViaEmailModal } from "./ShareViaEmailModal";
import { DEFAULT_FINANCIAL_PROFILE } from "../data/initialData";
import { ContextualVideoPlayer } from "./ContextualVideoPlayer";
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
  setDocuments?: React.Dispatch<React.SetStateAction<DocumentItem[]>>;
  agentRoster?: RealEstateAgentProfile[];
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
  setDocuments,
  agentRoster,
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

  // Helper to format date nicely
  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return "Set Date";
    try {
      const [year, month, day] = dateStr.split("-").map(Number);
      if (!year || !month || !day) return dateStr;
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const formatDateDayMonth = (dateStr?: string) => {
    if (!dateStr) return "TBD";
    try {
      const [year, month, day] = dateStr.split("-").map(Number);
      if (!year || !month || !day) return dateStr;
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  // Calculate Overall Closing Timeline Estimate
  const closingTimelineStats = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find milestone 10 (Closing Day & Keys in Hand)
    const step10 = milestones.find(m => m.stepNumber === 10);
    let closingDateStr = step10?.expectedDate;

    // Fallback: If step 10 has no date, find max expected date across all milestones
    if (!closingDateStr) {
      const dates = milestones.map(m => m.expectedDate).filter(Boolean) as string[];
      if (dates.length > 0) {
        dates.sort();
        closingDateStr = dates[dates.length - 1];
      }
    }

    let closingDate: Date;
    if (closingDateStr) {
      const [y, m, d] = closingDateStr.split("-").map(Number);
      closingDate = new Date(y, m - 1, d);
    } else {
      closingDate = new Date(today);
      closingDate.setDate(closingDate.getDate() + 60);
      closingDateStr = closingDate.toISOString().split("T")[0];
    }

    const diffMs = closingDate.getTime() - today.getTime();
    const daysToClose = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const weeksToClose = (Math.max(0, daysToClose) / 7).toFixed(1);

    // Determine Pace
    let paceLabel = "Standard 45-60 Day Escrow Pace";
    let paceBadge = "bg-emerald-50 text-emerald-800 border-emerald-200";
    if (daysToClose <= 0) {
      paceLabel = "Closing Day Reached / In Past";
      paceBadge = "bg-purple-50 text-purple-800 border-purple-200";
    } else if (daysToClose <= 30) {
      paceLabel = "Fast-Track 30-Day Escrow Pace";
      paceBadge = "bg-amber-50 text-amber-800 border-amber-200";
    } else if (daysToClose > 60) {
      paceLabel = "Strategic / Extended Pace (60+ Days)";
      paceBadge = "bg-blue-50 text-blue-800 border-blue-200";
    }

    // Active step is first incomplete step
    const activeStep = milestones.find(m => !m.completed) || milestones[milestones.length - 1];

    // Overdue count (past expected date and not completed)
    const overdueCount = milestones.filter(m => {
      if (m.completed || !m.expectedDate) return false;
      const [y, mth, d] = m.expectedDate.split("-").map(Number);
      const mDate = new Date(y, mth - 1, d);
      return mDate < today;
    }).length;

    return {
      closingDateStr,
      closingDate,
      daysToClose,
      weeksToClose,
      paceLabel,
      paceBadge,
      activeStep,
      overdueCount
    };
  }, [milestones]);

  // Handle Date Changes
  const handleDateChange = (milestoneId: string, newDate: string) => {
    setMilestones(prev => prev.map(m => m.id === milestoneId ? { ...m, expectedDate: newDate } : m));
  };

  const handleQuickAdjustDate = (milestoneId: string, daysDelta: number) => {
    setMilestones(prev => prev.map(m => {
      if (m.id !== milestoneId) return m;
      let baseDate = new Date();
      if (m.expectedDate) {
        const [y, mo, d] = m.expectedDate.split("-").map(Number);
        baseDate = new Date(y, mo - 1, d);
      }
      baseDate.setDate(baseDate.getDate() + daysDelta);
      return {
        ...m,
        expectedDate: baseDate.toISOString().split("T")[0]
      };
    }));
  };

  const handleQuickSetToday = (milestoneId: string) => {
    const todayStr = new Date().toISOString().split("T")[0];
    handleDateChange(milestoneId, todayStr);
  };

  const handleCascadeForwardFromStep = (fromStepNumber: number) => {
    setMilestones(prev => {
      const currentStep = prev.find(m => m.stepNumber === fromStepNumber);
      if (!currentStep || !currentStep.expectedDate) return prev;

      const [curY, curM, curD] = currentStep.expectedDate.split("-").map(Number);
      let runningDate = new Date(curY, curM - 1, curD);

      const defaultGaps: Record<number, number> = {
        1: 10,
        2: 8,
        3: 16,
        4: 6,
        5: 4,
        6: 8,
        7: 11,
        8: 8,
        9: 2,
        10: 0
      };

      return prev.map(m => {
        if (m.stepNumber <= fromStepNumber) return m;
        const gap = defaultGaps[m.stepNumber - 1] || 7;
        runningDate = new Date(runningDate.getTime() + gap * 24 * 60 * 60 * 1000);
        return {
          ...m,
          expectedDate: runningDate.toISOString().split("T")[0]
        };
      });
    });
  };

  const handleAutoSchedule = (paceDays: 30 | 45 | 60 = 45) => {
    const today = new Date();
    const fractions = [0, 0.12, 0.22, 0.42, 0.50, 0.56, 0.68, 0.82, 0.94, 1.0];
    
    setMilestones(prev => {
      return prev.map((m, idx) => {
        const frac = fractions[idx] !== undefined ? fractions[idx] : idx / (prev.length - 1);
        const daysOffset = Math.round(frac * paceDays);
        const d = new Date(today);
        d.setDate(d.getDate() + daysOffset);
        return {
          ...m,
          expectedDate: d.toISOString().split("T")[0]
        };
      });
    });
  };

  const handleNotesChange = (milestoneId: string, newNotes: string) => {
    setMilestones(prev => prev.map(m => m.id === milestoneId ? { ...m, notes: newNotes } : m));
  };

  const handleAppendNotePrompt = (milestoneId: string, promptText: string) => {
    setMilestones(prev => prev.map(m => {
      if (m.id !== milestoneId) return m;
      const current = m.notes || "";
      const separator = current && !current.endsWith("\n") ? "\n" : "";
      return {
        ...m,
        notes: current + separator + promptText
      };
    }));
  };

  const getDateBadge = (step: RoadmapMilestone) => {
    if (step.completed) {
      return (
        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md shrink-0">
          Done
        </span>
      );
    }
    if (!step.expectedDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [y, m, d] = step.expectedDate.split("-").map(Number);
    const stepDate = new Date(y, m - 1, d);
    const diffDays = Math.ceil((stepDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return (
        <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded-md shrink-0">
          {Math.abs(diffDays)}d past
        </span>
      );
    } else if (diffDays === 0) {
      return (
        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-md shrink-0">
          Today
        </span>
      );
    } else {
      return (
        <span className="text-[10px] font-bold text-[#606C5D] bg-[#F1EFE9] px-1.5 py-0.5 rounded-md shrink-0">
          In {diffDays}d
        </span>
      );
    }
  };

  const toggleMilestone = (milestoneId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let justCompletedMilestone: RoadmapMilestone | null = null;
    let newMilestonesState: RoadmapMilestone[] = [];

    setMilestones(prev => {
      const next = prev.map(m => {
        if (m.id !== milestoneId) return m;
        
        const allDone = m.tasks.every(t => t.done);
        const newDoneStatus = !allDone;
        const updatedTasks = m.tasks.map(t => ({ ...t, done: newDoneStatus }));
        
        if (newDoneStatus && !m.completed) {
          justCompletedMilestone = {
            ...m,
            tasks: updatedTasks,
            completed: true
          };
          
          const rect = (e.target as HTMLElement).getBoundingClientRect();
          const x = (rect.left + rect.width / 2) / window.innerWidth;
          const y = (rect.top + rect.height / 2) / window.innerHeight;
          
          if (e) {
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            const x = (rect.left + rect.width / 2) / window.innerWidth;
            const y = (rect.top + rect.height / 2) / window.innerHeight;
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { x, y },
              colors: ['#4A5D4E', '#F1EFE9', '#DEDAD2', '#2D362E', '#9A9488']
            });
          } else {
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.7 },
              colors: ['#4A5D4E', '#F1EFE9', '#DEDAD2', '#2D362E', '#9A9488']
            });
          }
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

  const toggleTask = (milestoneId: string, taskId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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
          
          if (e) {
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            const x = (rect.left + rect.width / 2) / window.innerWidth;
            const y = (rect.top + rect.height / 2) / window.innerHeight;
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { x, y },
              colors: ['#4A5D4E', '#F1EFE9', '#DEDAD2', '#2D362E', '#9A9488']
            });
          } else {
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.7 },
              colors: ['#4A5D4E', '#F1EFE9', '#DEDAD2', '#2D362E', '#9A9488']
            });
          }
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

      {/* Contextual Video Embed for Roadmap */}
      <div className="w-full">
        <ContextualVideoPlayer 
          videoId="7gJ_U5D8334" 
          title="The 10-Step Homebuyer Playbook Explained | Mike Ford" 
          description="Watch Mike explain the critical milestones in the journey from Pre-Approval to Clear to Close."
          className="shadow-sm"
        />
      </div>
      
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
              title="Save your customized Homebuying Plan, Milestones & Property Field Notes as PDF"
            >
              <Printer className="w-4 h-4 text-[#D4A373]" />
              <span>Save PDF</span>
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

      {/* Overall Closing Timeline Estimate Interactive Widget */}
      <div className="bg-white rounded-3xl border border-[#EAE7E0] p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#EAE7E0]">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF9F5] text-[#4A5D4E] text-xs font-bold border border-[#EAE7E0]">
              <Calendar className="w-3.5 h-3.5 text-[#C18C5D]" />
              <span>Overall Closing Timeline Estimate</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#2D362E] flex flex-wrap items-center gap-2">
              <span>Target Closing Date:</span>
              <span className="text-[#4A5D4E] underline decoration-[#C18C5D] decoration-2 underline-offset-4">
                {formatDateDisplay(closingTimelineStats.closingDateStr)}
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-[#606C5D] max-w-2xl">
              Calculated dynamically from your milestone expected completion dates. Adjust any milestone date below to recalculate your projected closing velocity in real time.
            </p>
          </div>

          {/* Quick Stat Blocks */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Days to Close Counter Card */}
            <div className="bg-[#FAF9F5] p-3.5 sm:p-4 rounded-2xl border border-[#EAE7E0] text-center min-w-[140px] shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A9488] block">Projected Horizon</span>
              <span className="text-2xl font-serif font-bold text-[#2D362E]">
                {closingTimelineStats.daysToClose > 0 ? `${closingTimelineStats.daysToClose} Days` : "Target Met"}
              </span>
              <span className="text-[11px] text-[#606C5D] block font-medium">
                (~{closingTimelineStats.weeksToClose} Wks to Closing)
              </span>
            </div>

            {/* Escrow Pace Pill */}
            <div className="bg-[#FAF9F5] p-3.5 sm:p-4 rounded-2xl border border-[#EAE7E0] space-y-1 min-w-[170px] shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A9488] block">Escrow Velocity</span>
              <div className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg border ${closingTimelineStats.paceBadge}`}>
                <Flag className="w-3 h-3 shrink-0" />
                <span>{closingTimelineStats.paceLabel}</span>
              </div>
              <div className="text-[11px] text-[#606C5D]">
                {closingTimelineStats.overdueCount > 0 ? (
                  <span className="text-amber-700 font-semibold">⚠️ {closingTimelineStats.overdueCount} milestone(s) behind schedule</span>
                ) : (
                  <span className="text-emerald-700 font-semibold">✓ Active targets on schedule</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Visual Multi-Milestone Timeline Track */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs text-[#606C5D]">
            <span className="font-bold text-[#2D362E] flex items-center gap-1.5">
              <span>Milestone Schedule Progression</span>
              <span className="text-[11px] font-normal text-[#9A9488]">(Click any step to inspect)</span>
            </span>
            <span className="text-[11px]">
              Next Target: <strong className="text-[#4A5D4E]">Step {closingTimelineStats.activeStep.stepNumber}</strong> ({formatDateDisplay(closingTimelineStats.activeStep.expectedDate)})
            </span>
          </div>

          {/* Stepper bar across all 10 milestones */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 pt-1">
            {milestones.map((m) => {
              const isDone = m.completed;
              const isActive = m.id === closingTimelineStats.activeStep.id && !isDone;
              return (
                <div
                  key={m.id}
                  onClick={() => setExpandedStepId(m.id)}
                  title={`Step ${m.stepNumber}: ${m.title} - Target: ${formatDateDisplay(m.expectedDate)}`}
                  className={`p-2 rounded-xl border text-left cursor-pointer transition-all hover:scale-[1.03] select-none ${
                    isDone
                      ? "bg-emerald-50/70 border-emerald-300 text-emerald-900"
                      : isActive
                      ? "bg-[#4A5D4E] border-[#38463B] text-white shadow-sm ring-2 ring-[#C18C5D]/50"
                      : "bg-[#FAF9F5] border-[#EAE7E0] text-[#606C5D] hover:border-[#4A5D4E]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-[10px] font-bold ${isActive ? "text-[#D4A373]" : ""}`}>
                      0{m.stepNumber}
                    </span>
                    {isDone ? (
                      <Check className="w-3 h-3 text-emerald-700" />
                    ) : (
                      <span className="text-[9px] opacity-75">{m.stage.slice(0, 4)}</span>
                    )}
                  </div>
                  <div className={`text-[10px] font-semibold truncate ${isActive ? "text-white font-bold" : "text-[#2D362E]"}`}>
                    {formatDateDayMonth(m.expectedDate)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Schedule Pacing Presets */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#EAE7E0] text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#9A9488] font-bold uppercase text-[10px]">Smart Preset Pacing:</span>
            <button
              type="button"
              onClick={() => handleAutoSchedule(30)}
              className="px-2.5 py-1 rounded-lg bg-[#FAF9F5] hover:bg-[#F1EFE9] border border-[#EAE7E0] text-[11px] font-bold text-[#2D362E] transition-colors shadow-2xs"
            >
              ⚡ Fast-Track 30 Days
            </button>
            <button
              type="button"
              onClick={() => handleAutoSchedule(45)}
              className="px-2.5 py-1 rounded-lg bg-[#FAF9F5] hover:bg-[#F1EFE9] border border-[#EAE7E0] text-[11px] font-bold text-[#4A5D4E] transition-colors shadow-2xs"
            >
              🎯 Standard 45 Days
            </button>
            <button
              type="button"
              onClick={() => handleAutoSchedule(60)}
              className="px-2.5 py-1 rounded-lg bg-[#FAF9F5] hover:bg-[#F1EFE9] border border-[#EAE7E0] text-[11px] font-bold text-[#2D362E] transition-colors shadow-2xs"
            >
              🗓️ Relaxed 60 Days
            </button>
          </div>

          <div className="text-[11px] text-[#9A9488]">
            💡 Select any milestone below to customize individual target dates or cascade deadlines
          </div>
        </div>
      </div>

      {/* Step Cards List */}
      <div className="space-y-4">
        {filteredMilestones.map((step) => {
          const isExpanded = expandedStepId === step.id;
          const stepDone = step.tasks.every(t => t.done);
          const stepCompletedCount = step.tasks.filter(t => t.done).length;
          const stepTotalTasks = step.tasks.length;
          const stepProgressPercent = stepTotalTasks > 0 ? Math.round((stepCompletedCount / stepTotalTasks) * 100) : 0;

          return (
            <div
              key={step.id}
              className={`rounded-2xl border transition-all shadow-sm overflow-hidden ${
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
                    onClick={(e) => toggleMilestone(step.id, e)}
                    title={stepDone ? "Mark Milestone Incomplete" : "Mark Milestone Complete"}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-colors cursor-pointer hover:scale-105 active:scale-95 ${
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
                    <div className="flex items-center gap-2 mt-1">
                      {/* Mobile task progress label */}
                      <div className="sm:hidden flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-[#606C5D]">
                          {stepCompletedCount}/{stepTotalTasks} tasks ({stepProgressPercent}%)
                        </span>
                      </div>
                      {step.notes && step.notes.trim().length > 0 && (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold text-[#4A5D4E] bg-[#FAF9F5] border border-[#EAE7E0]"
                          title={step.notes}
                        >
                          <FileText className="w-3 h-3 text-[#C18C5D]" />
                          <span>Notes Saved</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Visual Expected Completion Date Picker in Header */}
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#EAE7E0] bg-[#FAF9F5] hover:bg-white hover:border-[#4A5D4E] transition-all cursor-pointer group shadow-2xs shrink-0"
                    title="Click to change expected completion date"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#4A5D4E] group-hover:scale-110 transition-transform shrink-0" />
                    <div className="flex flex-col text-left">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#9A9488] leading-none">
                        Target
                      </span>
                      <span className="text-xs font-bold text-[#2D362E] leading-tight whitespace-nowrap">
                        {formatDateDisplay(step.expectedDate)}
                      </span>
                    </div>
                    {getDateBadge(step)}
                    <input
                      type="date"
                      value={step.expectedDate || ""}
                      onChange={(e) => handleDateChange(step.id, e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      aria-label={`Expected completion date for Step ${step.stepNumber}: ${step.title}`}
                    />
                  </div>

                  {/* Header Visual Progress Bar Widget */}
                  <div className="hidden sm:flex flex-col items-end gap-1.5 min-w-[130px] max-w-[150px]">
                    <div className="flex items-center justify-between w-full text-xs">
                      <span className="text-[11px] font-semibold text-[#606C5D]">
                        {stepCompletedCount}/{stepTotalTasks} tasks
                      </span>
                      <span className={`text-[11px] font-bold ${stepDone ? "text-emerald-700" : "text-[#4A5D4E]"}`}>
                        {stepProgressPercent}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#EAE7E0] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ease-out ${
                          stepDone
                            ? "bg-emerald-600"
                            : stepProgressPercent > 0
                            ? "bg-[#4A5D4E]"
                            : "bg-transparent"
                        }`}
                        style={{ width: `${stepProgressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-[#F1EFE9] text-[#606C5D] border border-[#EAE7E0]">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Card Level Full-Width Progress Track */}
              <div className="w-full bg-[#EAE7E0]/60 h-1 overflow-hidden" title={`${stepProgressPercent}% of sub-tasks completed`}>
                <div
                  className={`h-full transition-all duration-500 ease-out ${
                    stepDone ? "bg-emerald-600" : "bg-[#4A5D4E]"
                  }`}
                  style={{ width: `${stepProgressPercent}%` }}
                />
              </div>

              {/* Collapsible Content */}
              {isExpanded && (
                <div className="px-5 pb-6 sm:px-6 sm:pb-8 pt-2 border-t border-[#EAE7E0] space-y-6 animate-in slide-in-from-top-2 duration-150">
                  <p className="text-xs sm:text-sm text-[#606C5D] leading-relaxed">
                    {step.summary}
                  </p>

                  {/* Target Completion & Dynamic Timeline Alignment Box */}
                  <div className="bg-[#FAF9F5] rounded-2xl p-4 sm:p-5 border border-[#EAE7E0] space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#4A5D4E]" />
                        <span className="text-xs font-bold text-[#2D362E]">Expected Completion Schedule</span>
                        <span className="text-[11px] text-[#9A9488]">• Phase Benchmark: {step.duration}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-[#606C5D]">
                          {step.completed ? "Status: Milestone Completed" : "Status: Active Projection"}
                        </span>
                        {getDateBadge(step)}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-[#EAE7E0] shadow-2xs">
                        <span className="text-xs text-[#9A9488] font-medium">Target Date:</span>
                        <input
                          type="date"
                          value={step.expectedDate || ""}
                          onChange={(e) => handleDateChange(step.id, e.target.value)}
                          className="text-xs font-bold text-[#2D362E] bg-transparent focus:outline-none cursor-pointer"
                          aria-label={`Adjust target date for step ${step.stepNumber}`}
                        />
                      </div>

                      {/* Quick Pacing Adjusters */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleQuickSetToday(step.id)}
                          className="px-2.5 py-1.5 text-[11px] font-semibold text-[#606C5D] bg-white hover:bg-[#F1EFE9] rounded-lg border border-[#EAE7E0] transition-colors shadow-2xs"
                        >
                          Set to Today
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickAdjustDate(step.id, 7)}
                          className="px-2.5 py-1.5 text-[11px] font-semibold text-[#4A5D4E] bg-white hover:bg-[#F1EFE9] rounded-lg border border-[#EAE7E0] transition-colors shadow-2xs"
                        >
                          +1 Week
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickAdjustDate(step.id, 14)}
                          className="px-2.5 py-1.5 text-[11px] font-semibold text-[#4A5D4E] bg-white hover:bg-[#F1EFE9] rounded-lg border border-[#EAE7E0] transition-colors shadow-2xs"
                        >
                          +2 Weeks
                        </button>
                        {step.stepNumber < 10 && (
                          <button
                            type="button"
                            onClick={() => handleCascadeForwardFromStep(step.stepNumber)}
                            className="px-3 py-1.5 text-[11px] font-bold text-[#C18C5D] bg-white hover:bg-[#F1EFE9] rounded-lg border border-[#C18C5D]/40 transition-colors flex items-center gap-1 shadow-2xs"
                            title="Push all remaining subsequent milestones forward proportionally"
                          >
                            <Sparkles className="w-3 h-3 text-[#C18C5D]" />
                            <span>Cascade Downstream Dates</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tasks Checklists */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#9A9488]">
                        Required Action Items
                      </h4>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-[#606C5D] font-medium">
                          {stepCompletedCount} of {stepTotalTasks} completed
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          stepDone ? "bg-emerald-100 text-emerald-800" : "bg-white text-[#4A5D4E] border border-[#EAE7E0]"
                        }`}>
                          {stepProgressPercent}% Done
                        </span>
                      </div>
                    </div>

                    {/* Visual Progress Bar inside Action Items */}
                    <div className="w-full h-2.5 bg-[#FAF9F5] border border-[#EAE7E0] rounded-full overflow-hidden p-0.5 shadow-2xs">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ease-out ${
                          stepDone ? "bg-emerald-600" : "bg-[#4A5D4E]"
                        }`}
                        style={{ width: `${stepProgressPercent}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {step.tasks.map(task => (
                        <div
                          key={task.id}
                          onClick={(e) => toggleTask(step.id, task.id, e)}
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

                  {/* Step Notes & Reminders Textarea */}
                  <div className="bg-[#FAF9F5] rounded-2xl p-4 sm:p-5 border border-[#EAE7E0] space-y-3 shadow-2xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#4A5D4E]" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D362E]">
                          Step Notes & Reminders
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        {step.notes && step.notes.trim().length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                            <Check className="w-3 h-3" /> Auto-saved
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#9A9488]">
                            Personal notes for Step {step.stepNumber}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="relative">
                      <textarea
                        value={step.notes || ""}
                        onChange={(e) => handleNotesChange(step.id, e.target.value)}
                        placeholder={`Jot down important reminders, quotes, lender conversations, questions for your agent, or key dates for Step ${step.stepNumber}...`}
                        rows={3}
                        className="w-full bg-white border border-[#EAE7E0] rounded-xl p-3 sm:p-3.5 text-xs sm:text-sm text-[#2D362E] placeholder-[#9A9488] focus:outline-none focus:border-[#4A5D4E] focus:ring-2 focus:ring-[#4A5D4E]/10 transition-all resize-y min-h-[85px] leading-relaxed shadow-2xs"
                        aria-label={`Personal notes and reminders for Step ${step.stepNumber}: ${step.title}`}
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#EAE7E0] text-[11px]">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A9488]">Quick Prompts:</span>
                        <button
                          type="button"
                          onClick={() => handleAppendNotePrompt(step.id, "• Questions for loan officer: ")}
                          className="px-2 py-0.5 rounded-lg bg-white border border-[#EAE7E0] hover:bg-[#F1EFE9] text-[#4A5D4E] font-medium transition-colors cursor-pointer shadow-2xs"
                        >
                          + Questions for LO
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAppendNotePrompt(step.id, "• Follow-up with agent: ")}
                          className="px-2 py-0.5 rounded-lg bg-white border border-[#EAE7E0] hover:bg-[#F1EFE9] text-[#4A5D4E] font-medium transition-colors cursor-pointer shadow-2xs"
                        >
                          + Agent Follow-up
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAppendNotePrompt(step.id, "• Key deadline/contingency: ")}
                          className="px-2 py-0.5 rounded-lg bg-white border border-[#EAE7E0] hover:bg-[#F1EFE9] text-[#4A5D4E] font-medium transition-colors cursor-pointer shadow-2xs"
                        >
                          + Key Deadline
                        </button>
                      </div>

                      {step.notes && step.notes.trim().length > 0 && (
                        <button
                          type="button"
                          onClick={() => handleNotesChange(step.id, "")}
                          className="text-rose-600 hover:text-rose-700 text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Clear Notes
                        </button>
                      )}
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
              Ready for Your AI Scenario Plan &amp; Local Guides?
            </h3>

            <p className="text-xs sm:text-sm text-[#DEDAD2] leading-relaxed">
              Review customized financing scenarios, down payment assistance grant findings, and connect directly with your dedicated Loan Officer and Real Estate Agent.
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
              id="step2-proceed-to-ai-plan-btn"
              onClick={() => {
                if (onNavigate) {
                  onNavigate("step4_ai_plan", "dashboard");
                } else if (onGoToDashboard) {
                  onGoToDashboard();
                }
              }}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#C18C5D] hover:bg-[#A87448] active:scale-[0.99] text-white font-bold text-sm shadow-lg transition-all cursor-pointer group"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>Continue to AI Plan &amp; Local Guides</span>
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
        agentRoster={agentRoster}
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
