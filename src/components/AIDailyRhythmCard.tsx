import React, { useState, useEffect } from "react";
import { 
  Sun, 
  Compass, 
  Flame, 
  Moon, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  Clock,
  Target
} from "lucide-react";
import { LoanOfficerProfile, CapturedLead } from "../types";

export type DailyTimePhase = "morning" | "midday" | "afternoon" | "end_of_day";

export interface DailyTaskItem {
  id: string;
  title: string;
  completed: boolean;
  category: "lead" | "scenario" | "partner" | "recruitment" | "admin" | "custom";
  isDefault?: boolean;
}

interface AIDailyRhythmCardProps {
  isSidebarCollapsed: boolean;
  currentLo: LoanOfficerProfile;
  leads: CapturedLead[];
  isAdminUser: boolean;
  onOpenDailyReview: () => void;
  onSelectTab: (tabId: any) => void;
}

export const AIDailyRhythmCard: React.FC<AIDailyRhythmCardProps> = ({
  isSidebarCollapsed,
  currentLo,
  leads = [],
  isAdminUser,
  onOpenDailyReview,
  onSelectTab
}) => {
  // Live Time
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isCardCompact, setIsCardCompact] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("lo_daily_card_compact") === "true";
    }
    return false;
  });

  const [newTaskInput, setNewTaskInput] = useState<string>("");
  const [isAddingTask, setIsAddingTask] = useState<boolean>(false);

  // Update clock every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Determine current shift phase based on time
  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();

  const getTimePhase = (): DailyTimePhase => {
    if (currentHour < 11) return "morning"; // 8am - 11am
    if (currentHour < 14 || (currentHour === 14 && currentMinute < 30)) return "midday"; // 11am - 2:30pm
    if (currentHour < 16 || (currentHour === 16 && currentMinute < 30)) return "afternoon"; // 2:30pm - 4:30pm
    return "end_of_day"; // 4:30pm+
  };

  const timePhase = getTimePhase();
  const todayStr = currentTime.toISOString().split("T")[0];
  const storageKey = `lo_daily_tasks_${currentLo.id}_${todayStr}`;

  // Daily Tasks State with LocalStorage Persistence
  const [tasks, setTasks] = useState<DailyTaskItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as DailyTaskItem[];
          if (!isAdminUser) {
            return parsed.filter(t => t.category !== "recruitment" && t.category !== "admin");
          }
          return parsed;
        } catch {
          // fallback
        }
      }
    }

    // Default Seed Tasks based on role
    const initialTasks: DailyTaskItem[] = [
      {
        id: "task-leads-1",
        title: "Contact 3 high-intent CRM buyer inquiries",
        completed: false,
        category: "lead",
        isDefault: true
      },
      {
        id: "task-scenario-2",
        title: "Run pre-approval scenario on Scenario Workbench",
        completed: false,
        category: "scenario",
        isDefault: true
      },
      {
        id: "task-partner-3",
        title: "Share Co-Branded flyer with top Realtor partner",
        completed: false,
        category: "partner",
        isDefault: true
      }
    ];

    if (isAdminUser) {
      initialTasks.push({
        id: "task-recruiting-4",
        title: "Check candidate pipeline & NMLS production stats",
        completed: false,
        category: "recruitment",
        isDefault: true
      });
      initialTasks.push({
        id: "task-distribution-5",
        title: "Review branch lead distribution & LO quotas",
        completed: false,
        category: "admin",
        isDefault: true
      });
    } else {
      initialTasks.push({
        id: "task-buydown-4",
        title: "Structure 2-1 buydown on active purchase listing",
        completed: false,
        category: "scenario",
        isDefault: true
      });
      initialTasks.push({
        id: "task-eod-5",
        title: "Log SMS compliance & end-of-day pipeline audit",
        completed: false,
        category: "lead",
        isDefault: true
      });
    }

    return initialTasks;
  });

  // Persist tasks
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(storageKey, JSON.stringify(tasks));
    }
  }, [tasks, storageKey]);

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    const newTask: DailyTaskItem = {
      id: `task-custom-${Date.now()}`,
      title: newTaskInput.trim(),
      completed: false,
      category: "custom"
    };
    setTasks(prev => [...prev, newTask]);
    setNewTaskInput("");
    setIsAddingTask(false);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const toggleCardCompact = () => {
    setIsCardCompact(prev => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("lo_daily_card_compact", String(next));
      }
      return next;
    });
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const timeString = currentTime.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  const getPhaseConfig = () => {
    switch (timePhase) {
      case "morning":
        return {
          title: "Morning Kickoff",
          subtitle: "Early Pipeline & Fast Touches",
          icon: <Sun className="w-3.5 h-3.5 text-amber-500" />,
          accent: "text-amber-500",
          bgBadge: "bg-amber-50 text-amber-900 border-amber-200"
        };
      case "midday":
        return {
          title: "Midday Pulse",
          subtitle: "Partner & Production Pacing",
          icon: <Compass className="w-3.5 h-3.5 text-blue-500" />,
          accent: "text-blue-500",
          bgBadge: "bg-blue-50 text-blue-900 border-blue-200"
        };
      case "afternoon":
        return {
          title: "Afternoon Momentum",
          subtitle: "Condition Clearing & Pushing",
          icon: <Flame className="w-3.5 h-3.5 text-orange-500" />,
          accent: "text-orange-500",
          bgBadge: "bg-orange-50 text-orange-900 border-orange-200"
        };
      case "end_of_day":
        return {
          title: "EOD Wrap-Up",
          subtitle: "Final Review & Tomorrow Prep",
          icon: <Moon className="w-3.5 h-3.5 text-indigo-400" />,
          accent: "text-indigo-400",
          bgBadge: "bg-indigo-50 text-indigo-900 border-indigo-200"
        };
    }
  };

  const phaseConfig = getPhaseConfig();

  // 1. COLLAPSED SIDEBAR (ICON-RAIL) MODE:
  // Render ultra-compact circular progress indicator with hover tooltip
  if (isSidebarCollapsed) {
    return (
      <div className="p-2 border-b border-[#EAE7E0] bg-[#FDFBF7] flex flex-col items-center gap-2 relative group">
        <button
          onClick={onOpenDailyReview}
          title={`AI Daily Rhythm: ${completedCount}/${totalCount} Done (${progressPercent}%)\nPhase: ${phaseConfig.title}\nClick for Quick AI Review`}
          className="relative w-11 h-11 rounded-2xl bg-white border border-[#DCD7CD] shadow-xs flex items-center justify-center hover:border-[#C18C5D] transition-all cursor-pointer group-hover:scale-105"
        >
          {/* Circular SVG Progress */}
          <svg className="w-9 h-9 transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-[#EAE7E0]"
              strokeWidth="3"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-[#C18C5D] transition-all duration-500"
              strokeDasharray={`${progressPercent}, 100`}
              strokeWidth="3.2"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-bold text-[10px] text-[#2D362E]">
            {progressPercent}%
          </div>
        </button>

        <button
          onClick={onOpenDailyReview}
          title="Quick AI Review"
          className="w-7 h-7 rounded-lg bg-[#2D362E] text-white flex items-center justify-center hover:bg-[#C18C5D] transition-colors shadow-2xs cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#E7C19D]" />
        </button>
      </div>
    );
  }

  // 2. EXPANDED SIDEBAR MODE:
  return (
    <div className="border-b border-[#EAE7E0] bg-white sticky top-0 z-20 shadow-xs transition-all">
      {/* Header Bar */}
      <div className="p-3 pb-2.5 flex items-center justify-between gap-2 border-b border-[#F4F1EA]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-[#2D362E] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Zap className="w-3.5 h-3.5 text-[#E7C19D]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-bold text-xs text-[#2D362E] truncate">
                AI Focus & Flow
              </span>
              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border flex items-center gap-1 shrink-0 ${phaseConfig.bgBadge}`}>
                {phaseConfig.icon}
                <span>{timeString}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Compact Toggle Chevron */}
        <button
          onClick={toggleCardCompact}
          title={isCardCompact ? "Expand Daily Focus Checklist" : "Minimize Checklist"}
          className="w-6 h-6 rounded-lg bg-[#F4F1EA] hover:bg-[#EAE7E0] text-[#606C5D] flex items-center justify-center transition-colors shrink-0 cursor-pointer"
        >
          {isCardCompact ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* When Minimized: Sleek Single-Line Status Chip */}
      {isCardCompact ? (
        <div className="px-3 py-2 flex items-center justify-between gap-2 bg-[#FDFBF7]">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-[11px] font-bold text-[#2D362E] truncate">
              {completedCount}/{totalCount} Done ({progressPercent}%)
            </span>
            <span className="text-[10px] text-[#7D8877] truncate">
              • {phaseConfig.title}
            </span>
          </div>

          <button
            onClick={onOpenDailyReview}
            className="px-2 py-1 rounded-lg bg-[#2D362E] hover:bg-[#C18C5D] text-white text-[10px] font-bold flex items-center gap-1 transition-colors shrink-0 cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-2.5 h-2.5 text-[#E7C19D]" />
            <span>AI Review</span>
          </button>
        </div>
      ) : (
        /* When Expanded: Full Checklist & Quick AI Review */
        <div className="p-3 pt-2.5 space-y-3 bg-[#FDFBF7]">
          {/* Progress Bar & Percentage */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-[#2D362E] flex items-center gap-1">
                <span>Daily Targets</span>
                <span className="text-[#9A9488]">({completedCount}/{totalCount})</span>
              </span>
              <span className="font-bold text-[#C18C5D]">{progressPercent}% Done</span>
            </div>

            <div className="w-full h-2 rounded-full bg-[#EAE7E0] overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#4A5D4E] to-[#C18C5D] transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Quick AI Review Button */}
          <button
            onClick={onOpenDailyReview}
            className="w-full py-2 px-3 rounded-xl bg-[#2D362E] hover:bg-[#1E241F] text-white font-bold text-xs flex items-center justify-between transition-all cursor-pointer shadow-xs group"
          >
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#E7C19D] group-hover:scale-110 transition-transform" />
              <span>Quick AI Review</span>
            </div>
            <span className="text-[10px] font-semibold text-[#E7C19D] bg-white/10 px-1.5 py-0.5 rounded-md">
              {phaseConfig.title.split(" ")[0]} Check
            </span>
          </button>

          {/* Task Checklist Items */}
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {tasks.map(task => (
              <div 
                key={task.id}
                className={`group flex items-start gap-2 p-1.5 rounded-lg text-xs transition-colors ${
                  task.completed 
                    ? "bg-white/60 text-[#9A9488]" 
                    : "bg-white hover:bg-[#F4F1EA] text-[#2D362E] border border-[#EAE7E0]/70"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleTask(task.id)}
                  className="mt-0.5 text-left shrink-0 cursor-pointer"
                  aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                  ) : (
                    <Circle className="w-4 h-4 text-[#C4BEB5] hover:text-[#C18C5D] transition-colors" />
                  )}
                </button>

                <span 
                  onClick={() => toggleTask(task.id)}
                  className={`flex-1 text-[11px] leading-tight cursor-pointer select-none ${
                    task.completed ? "line-through text-[#9A9488]" : "font-medium"
                  }`}
                >
                  {task.title}
                </span>

                {!task.isDefault && (
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 text-[#C4BEB5] hover:text-red-500 transition-opacity cursor-pointer p-0.5"
                    title="Delete task"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add Custom Task Form */}
          {isAddingTask ? (
            <form onSubmit={handleAddTask} className="flex items-center gap-1.5">
              <input
                type="text"
                autoFocus
                placeholder="New daily task..."
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                className="flex-1 text-xs px-2 py-1 rounded-lg border border-[#DCD7CD] bg-white focus:outline-hidden focus:border-[#C18C5D]"
              />
              <button
                type="submit"
                className="px-2 py-1 bg-[#4A5D4E] text-white text-xs font-bold rounded-lg hover:bg-[#3B4A3E] cursor-pointer"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setIsAddingTask(false)}
                className="text-xs text-[#7D8877] px-1 hover:text-[#2D362E] cursor-pointer"
              >
                ✕
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingTask(true)}
              className="w-full py-1 text-[10px] font-bold text-[#606C5D] hover:text-[#2D362E] flex items-center justify-center gap-1 transition-colors cursor-pointer border border-dashed border-[#DCD7CD] rounded-lg hover:bg-white"
            >
              <Plus className="w-3 h-3" />
              <span>Add Custom To-Do</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
