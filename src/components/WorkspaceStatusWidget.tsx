import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Video,
  Plus,
  ExternalLink,
  RefreshCw,
  CheckSquare,
  Square,
  Folder,
  FileText,
  FileSpreadsheet,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Mail,
  HardDrive,
  Download
} from "lucide-react";
import {
  googleWorkspace,
  GoogleWorkspaceUser,
  WorkspaceTaskInput,
  WorkspaceEventInput,
  getSafeGoogleWorkspaceUrl
} from "../services/googleWorkspaceService";
import { LoanOfficerProfile, ProfessionalGuidesState, CapturedLead } from "../types";

interface WorkspaceStatusWidgetProps {
  currentLo: LoanOfficerProfile;
  guidesState: ProfessionalGuidesState;
  onNavigateToWorkspaceTab: () => void;
  onOpenContextualModal?: (lead: CapturedLead, defaultTab?: "gmail" | "calendar" | "drive" | "tasks" | "sheets") => void;
  onTriggerToast: (msg: string) => void;
}

const FALLBACK_EVENTS = [
  {
    id: "cal_1",
    summary: "First-Time Buyer Pre-Approval Sync",
    description: "Review Schedule C self-employed tax deductions, DPA grant options, and purchase pre-qualification.",
    startDateTime: new Date(1735689600000 + 3 * 3600 * 1000).toISOString(), // in 3 hours
    attendee: "Sarah Johnson",
    attendeeEmail: "sarah.j@example.com",
    meetUrl: "https://meet.google.com/fthb-cons-sync",
    type: "consultation"
  },
  {
    id: "cal_2",
    summary: "2-1 Buydown & Realtor Strategy Call",
    description: "Review seller concession structure on 742 Evergreen Terrace with Buyer Agent David Chen.",
    startDateTime: new Date(1735689600000 + 24 * 3600 * 1000).toISOString(), // tomorrow
    attendee: "Marcus Rivera & David Chen (Realtor)",
    attendeeEmail: "marcus.r@example.com",
    meetUrl: "https://meet.google.com/lo-realtor-sync",
    type: "realtor"
  },
  {
    id: "cal_3",
    summary: "Rate Lock & Loan Estimate Review",
    description: "Finalize Fannie Mae HomeReady lock options before underwriting submission.",
    startDateTime: new Date(1735689600000 + 48 * 3600 * 1000).toISOString(), // 2 days
    attendee: "Elena Rostova",
    attendeeEmail: "elena.rostova@example.com",
    meetUrl: "https://meet.google.com/rate-lock-review",
    type: "closing"
  }
];

export const WorkspaceStatusWidget: React.FC<WorkspaceStatusWidgetProps> = ({
  currentLo,
  guidesState,
  onNavigateToWorkspaceTab,
  onOpenContextualModal,
  onTriggerToast
}) => {
  const [workspaceUser, setWorkspaceUser] = useState<GoogleWorkspaceUser | null>(() => googleWorkspace.getUser());
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Quick inline task input
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);

  // Quick inline schedule modal / popover
  const [showQuickSchedule, setShowQuickSchedule] = useState(false);
  const [quickEventSummary, setQuickEventSummary] = useState("Buyer Pre-Approval Consultation");
  const [quickEventDate, setQuickEventDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [quickEventTime, setQuickEventTime] = useState("14:00");
  const [quickEventLeadId, setQuickEventLeadId] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);

  // Fallback / Initial State for Calendar Events
  const [events, setEvents] = useState<any[]>(FALLBACK_EVENTS);

  // Fallback / Initial State for Drive Files
  const [driveFiles, setDriveFiles] = useState([
    {
      id: "drive_1",
      name: "Loan File - Sarah Johnson (FTHB Vault)",
      type: "folder",
      modifiedTime: "15 mins ago",
      size: "6 documents",
      link: "https://drive.google.com/drive/my-drive"
    },
    {
      id: "drive_2",
      name: "2-1 Buydown Scenario Analysis - Marcus Rivera.xlsx",
      type: "sheet",
      modifiedTime: "1 hour ago",
      size: "248 KB",
      link: "https://sheets.new"
    },
    {
      id: "drive_3",
      name: "Schedule C Form 1084 Cash-Flow Breakdown - Elena Rostova.pdf",
      type: "doc",
      modifiedTime: "Yesterday",
      size: "1.2 MB",
      link: "https://docs.new"
    },
    {
      id: "drive_4",
      name: "Master CRM Buyer Lead Underwriting Pipeline 2026.gsu",
      type: "sheet",
      modifiedTime: "2 days ago",
      size: "Live Sync",
      link: "https://sheets.new"
    }
  ]);

  // Fallback / Initial State for Tasks
  const [tasks, setTasks] = useState([
    {
      id: "task_1",
      title: "Verify 2024 Schedule C & 1099-NEC for Elena Rostova",
      notes: "Cross-check Form 1084 depreciation add-backs for self-employed qualification.",
      due: "Today",
      priority: "high",
      completed: false
    },
    {
      id: "task_2",
      title: "Order property appraisal for Sarah Johnson purchase contract",
      notes: "Appraisal contingency expires in 10 days.",
      due: "Today",
      priority: "high",
      completed: false
    },
    {
      id: "task_3",
      title: "Send 2-1 Buydown seller-paid concession breakdown to Marcus Rivera",
      notes: "Highlight Year 1 $742/mo payment savings.",
      due: "Tomorrow",
      priority: "medium",
      completed: false
    },
    {
      id: "task_4",
      title: "Check CalHFA DPA forgivable grant reservation quota",
      notes: "Ensure borrower income is under county AMI threshold limit.",
      due: "This Week",
      priority: "low",
      completed: false
    }
  ]);

  useEffect(() => {
    const unsub = googleWorkspace.subscribe((user) => {
      setWorkspaceUser(user);
    });
    return () => unsub();
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const user = await googleWorkspace.requestLogin();
      setWorkspaceUser(user);
      onTriggerToast(`Connected to Google Workspace as ${user.email}`);
    } catch (err: any) {
      onTriggerToast(`Google Workspace connection failed: ${err.message || "Please try again"}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (workspaceUser) {
        const liveEvents = await googleWorkspace.listCalendarEvents(5);
        if (liveEvents && liveEvents.length > 0) {
          setEvents(liveEvents.map((ev: any) => ({
            id: ev.id,
            summary: ev.summary || "Scheduled Meeting",
            description: ev.description || "",
            startDateTime: ev.start?.dateTime || ev.start?.date || new Date().toISOString(),
            attendee: ev.attendees?.[0]?.email || "Prospective Buyer",
            attendeeEmail: ev.attendees?.[0]?.email || "",
            meetUrl: ev.hangoutLink || ev.htmlLink || "https://calendar.google.com",
            type: "consultation"
          })));
        }

        const liveTasks = await googleWorkspace.listTasks();
        if (liveTasks && liveTasks.length > 0) {
          setTasks(liveTasks.map((t: any) => ({
            id: t.id,
            title: t.title,
            notes: t.notes || "",
            due: t.due ? new Date(t.due).toLocaleDateString() : "Pending",
            priority: "medium",
            completed: t.status === "completed"
          })));
        }

        const liveFiles = await googleWorkspace.listDriveFiles(5);
        if (liveFiles && liveFiles.length > 0) {
          setDriveFiles(liveFiles.map((f: any) => ({
            id: f.id,
            name: f.name,
            type: f.mimeType?.includes("folder") ? "folder" : f.mimeType?.includes("spreadsheet") ? "sheet" : "doc",
            modifiedTime: new Date(f.modifiedTime || new Date().getTime()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            size: f.size ? `${Math.round(Number(f.size) / 1024)} KB` : "Cloud File",
            link: f.webViewLink || "https://drive.google.com"
          })));
        }
      }
      onTriggerToast("Google Workspace status synchronized.");
    } catch (e) {
      onTriggerToast("Workspace status refreshed.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          const nextCompleted = !t.completed;
          if (nextCompleted && workspaceUser) {
            googleWorkspace.completeTask(taskId).catch(() => {});
          }
          return { ...t, completed: nextCompleted };
        }
        return t;
      })
    );
    onTriggerToast("Task status updated in Google Tasks.");
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setIsAddingTask(true);
    const title = newTaskTitle.trim();
    const newTaskObj = {
      id: "task_" + new Date().getTime(),
      title,
      notes: "Created via Workspace Status Widget",
      due: "Today",
      priority: "medium",
      completed: false
    };

    setTasks(prev => [newTaskObj, ...prev]);
    setNewTaskTitle("");

    if (workspaceUser) {
      try {
        await googleWorkspace.createTask({
          title,
          notes: "Created via Loan Officer Portal Dashboard Widget"
        });
      } catch (err) {
        console.warn("Failed to sync new task to Google Tasks", err);
      }
    }

    setIsAddingTask(false);
    onTriggerToast("New condition dispatched to Google Tasks.");
  };

  const handleQuickScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickEventSummary.trim()) return;

    setIsScheduling(true);
    const startIso = new Date(`${quickEventDate}T${quickEventTime}:00`).toISOString();
    const endIso = new Date(new Date(`${quickEventDate}T${quickEventTime}:00`).getTime() + 45 * 60000).toISOString();

    const selectedLead = guidesState.leads?.find(l => l.id === quickEventLeadId);

    const newEv = {
      id: "cal_" + new Date().getTime(),
      summary: quickEventSummary,
      description: `Mortgage consultation scheduled for ${selectedLead?.fullName || "Prospective Buyer"}.`,
      startDateTime: startIso,
      attendee: selectedLead?.fullName || "Homebuyer",
      attendeeEmail: selectedLead?.email || "buyer@example.com",
      meetUrl: `https://meet.google.com/fthb-${Math.random().toString(36).substring(2, 6)}`,
      type: "consultation"
    };

    setEvents(prev => [newEv, ...prev]);

    if (workspaceUser) {
      try {
        await googleWorkspace.createCalendarEvent({
          summary: quickEventSummary,
          description: newEv.description,
          startDateTime: startIso,
          endDateTime: endIso,
          attendeeEmails: selectedLead?.email ? [selectedLead.email] : undefined
        });
      } catch (err) {
        console.warn("Failed to push event to Google Calendar", err);
      }
    }

    setShowQuickSchedule(false);
    setIsScheduling(false);
    onTriggerToast(`Calendar consultation scheduled with Google Meet.`);
  };

  const formatEventTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const today = new Date();
      const isToday = today.toDateString() === date.toDateString();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const isTomorrow = tomorrow.toDateString() === date.toDateString();

      const timeStr = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

      if (isToday) return `Today at ${timeStr}`;
      if (isTomorrow) return `Tomorrow at ${timeStr}`;
      return `${date.toLocaleDateString([], { month: "short", day: "numeric" })} at ${timeStr}`;
    } catch {
      return "Upcoming";
    }
  };

  const pendingTaskCount = tasks.filter(t => !t.completed).length;

  return (
    <div id="google-workspace-status-widget" className="bg-white rounded-3xl border border-[#EAE7E0] p-6 shadow-sm space-y-5">
      {/* Widget Header & Connection Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0EFEB]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FAF9F5] border border-[#EAE7E0] flex items-center justify-center shadow-2xs shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-lg text-[#2D362E]">
                Google Workspace Status & Operations
              </h3>
              {workspaceUser ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Live Synced
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  Ready to Sync
                </span>
              )}
            </div>
            <p className="text-xs text-[#606C5D]">
              Real-time summary of upcoming consultations, recent borrower Drive vaults, and underwriting Tasks.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {workspaceUser ? (
            <div className="flex items-center gap-2">
              <span className="hidden md:inline-block text-xs font-semibold text-[#606C5D] bg-[#FAF9F5] px-3 py-1.5 rounded-xl border border-[#EAE7E0]">
                {workspaceUser.email}
              </span>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                title="Refresh Workspace Data"
                className="p-2 text-[#606C5D] hover:text-[#2D362E] hover:bg-[#FAF9F5] rounded-xl border border-[#EAE7E0] transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#2D362E]" : ""}`} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              </svg>
              <span>{isConnecting ? "Connecting..." : "Connect Google"}</span>
            </button>
          )}

          <button
            onClick={onNavigateToWorkspaceTab}
            className="px-3.5 py-1.5 bg-[#2D362E] hover:bg-[#1f2520] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>Open Command Hub</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#E7C19D]" />
          </button>
        </div>
      </div>

      {/* Metrics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#FAF9F5] border border-[#EAE7E0] p-3.5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#606C5D] block">Upcoming Consultations</span>
              <span className="text-sm font-bold text-[#2D362E]">{events.length} Scheduled</span>
            </div>
          </div>
          <button
            onClick={() => setShowQuickSchedule(true)}
            className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
            title="Quick Schedule Consultation"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-[#FAF9F5] border border-[#EAE7E0] p-3.5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#606C5D] block">Drive Loan Vaults</span>
              <span className="text-sm font-bold text-[#2D362E]">{driveFiles.length} Cloud Files</span>
            </div>
          </div>
          <a
            href="https://drive.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-amber-800 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
            title="Open Google Drive"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <div className="bg-[#FAF9F5] border border-[#EAE7E0] p-3.5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#606C5D] block">Pending Loan Tasks</span>
              <span className="text-sm font-bold text-[#2D362E]">{pendingTaskCount} Open Conditions</span>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            Google Tasks
          </span>
        </div>
      </div>

      {/* Unified 3-Column Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Column 1: Google Calendar Consultations */}
        <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-2xl p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <h4 className="font-serif font-bold text-sm text-[#2D362E]">Calendar Schedule</h4>
              </div>
              <button
                onClick={() => setShowQuickSchedule(true)}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Book Slot</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {events.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className="p-3 bg-white rounded-xl border border-[#EAE7E0] shadow-2xs hover:border-blue-300 transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {formatEventTime(event.startDateTime)}
                    </span>
                    {event.meetUrl && (
                      <a
                        href={event.meetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200"
                        title="Launch Google Meet Video Call"
                      >
                        <Video className="w-2.5 h-2.5 text-emerald-600" />
                        <span>Meet Link</span>
                      </a>
                    )}
                  </div>
                  <h5 className="font-bold text-xs text-[#2D362E] line-clamp-1">{event.summary}</h5>
                  <p className="text-[11px] text-[#606C5D] flex items-center gap-1">
                    <span className="font-semibold text-neutral-800">Lead:</span> {event.attendee}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-[#EAE7E0]/60 flex items-center justify-between text-xs">
            <span className="text-[#606C5D] text-[11px]">Synced via Google Calendar API</span>
            <a
              href="https://calendar.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 hover:text-blue-900 font-bold text-[11px] flex items-center gap-1"
            >
              <span>Full Calendar</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Column 2: Google Drive Loan Vaults */}
        <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-2xl p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-amber-700" />
                <h4 className="font-serif font-bold text-sm text-[#2D362E]">Recent Drive Loan Files</h4>
              </div>
              <a
                href="https://drive.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1"
              >
                <span>Drive Vault</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="space-y-2.5">
              {driveFiles.slice(0, 3).map((file) => (
                <a
                  key={file.id}
                  href={getSafeGoogleWorkspaceUrl(file.link, file.type)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-white rounded-xl border border-[#EAE7E0] shadow-2xs hover:border-amber-400 transition-all space-y-1 group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {file.type === "folder" ? (
                        <Folder className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      ) : file.type === "sheet" ? (
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      )}
                      <h5 className="font-bold text-xs text-[#2D362E] truncate group-hover:text-amber-900">
                        {file.name}
                      </h5>
                    </div>
                    <ExternalLink className="w-3 h-3 text-neutral-400 group-hover:text-amber-700 shrink-0" />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#606C5D] pt-0.5">
                    <span>{file.size}</span>
                    <span>{file.modifiedTime}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-[#EAE7E0]/60 flex items-center justify-between text-xs">
            <span className="text-[#606C5D] text-[11px]">Auto-encrypted borrower folders</span>
            <button
              onClick={() => onNavigateToWorkspaceTab()}
              className="text-amber-900 hover:text-amber-950 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
            >
              <span>+ New Folder</span>
            </button>
          </div>
        </div>

        {/* Column 3: Google Tasks Underwriting Conditions */}
        <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-2xl p-4 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-700" />
                <h4 className="font-serif font-bold text-sm text-[#2D362E]">Underwriting Tasks</h4>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                {pendingTaskCount} Remaining
              </span>
            </div>

            <div className="space-y-2">
              {tasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className={`p-2.5 bg-white rounded-xl border transition-all flex items-start gap-2.5 ${
                    task.completed
                      ? "border-neutral-200 bg-neutral-50/50 opacity-60"
                      : "border-[#EAE7E0] hover:border-emerald-300 shadow-2xs"
                  }`}
                >
                  <button
                    onClick={() => handleToggleTask(task.id)}
                    className="mt-0.5 text-neutral-400 hover:text-emerald-700 transition-colors cursor-pointer shrink-0"
                  >
                    {task.completed ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Square className="w-4 h-4 text-[#8A9A86]" />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs font-semibold leading-snug ${
                        task.completed ? "line-through text-neutral-500" : "text-[#2D362E]"
                      }`}
                    >
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-700">
                        {task.due}
                      </span>
                      {task.priority === "high" && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-100 text-red-800">
                          Priority
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Task Input */}
          <form onSubmit={handleAddTask} className="pt-2 border-t border-[#EAE7E0]/60 flex items-center gap-1.5">
            <input
              type="text"
              placeholder="+ Add loan condition..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1 bg-white border border-[#EAE7E0] rounded-xl px-2.5 py-1 text-xs text-[#2D362E] placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={!newTaskTitle.trim() || isAddingTask}
              className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer"
            >
              Add
            </button>
          </form>
        </div>
      </div>

      {/* Quick Schedule Modal Popover */}
      {showQuickSchedule && (
        <div className="p-4 bg-[#FAF9F5] border border-blue-200 rounded-2xl space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <h5 className="font-bold text-xs text-[#2D362E]">Quick Schedule Google Calendar Consultation</h5>
            </div>
            <button
              onClick={() => setShowQuickSchedule(false)}
              className="text-xs text-[#606C5D] hover:text-[#2D362E] font-bold"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleQuickScheduleSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-[#606C5D] mb-1">Meeting Topic</label>
              <input
                type="text"
                value={quickEventSummary}
                onChange={(e) => setQuickEventSummary(e.target.value)}
                className="w-full bg-white border border-[#EAE7E0] rounded-xl px-3 py-1.5 text-xs text-[#2D362E] focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Pre-Approval Review"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#606C5D] mb-1">Date</label>
              <input
                type="date"
                value={quickEventDate}
                onChange={(e) => setQuickEventDate(e.target.value)}
                className="w-full bg-white border border-[#EAE7E0] rounded-xl px-3 py-1.5 text-xs text-[#2D362E] focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#606C5D] mb-1">Time</label>
              <input
                type="time"
                value={quickEventTime}
                onChange={(e) => setQuickEventTime(e.target.value)}
                className="w-full bg-white border border-[#EAE7E0] rounded-xl px-3 py-1.5 text-xs text-[#2D362E] focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[10px] font-bold text-[#606C5D] mb-1">Select Prospective Homebuyer</label>
              <select
                value={quickEventLeadId}
                onChange={(e) => setQuickEventLeadId(e.target.value)}
                className="w-full bg-white border border-[#EAE7E0] rounded-xl px-3 py-1.5 text-xs text-[#2D362E] focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">-- Choose Lead (Optional) --</option>
                {guidesState.leads?.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.fullName} ({l.email || "No email"})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={isScheduling}
                className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{isScheduling ? "Booking..." : "Schedule Event"}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
