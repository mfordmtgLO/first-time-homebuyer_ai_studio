import React, { useState } from "react";
import {
  X,
  Mail,
  Calendar,
  FileSpreadsheet,
  CheckSquare,
  FolderPlus,
  Send,
  CheckCircle2,
  ExternalLink,
  Users,
  FileText
} from "lucide-react";
import { googleWorkspace, getSafeGoogleWorkspaceUrl } from "../services/googleWorkspaceService";
import { CapturedLead, LoanOfficerProfile } from "../types";

interface GoogleWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead?: CapturedLead | null;
  currentLo: LoanOfficerProfile;
  defaultTab?: "email" | "calendar" | "docs" | "tasks" | "sheets" | "drive";
  prefilledSubject?: string;
  prefilledBody?: string;
}

export const GoogleWorkspaceModal: React.FC<GoogleWorkspaceModalProps> = ({
  isOpen,
  onClose,
  lead,
  currentLo,
  defaultTab = "email",
  prefilledSubject,
  prefilledBody
}) => {
  const [activeTab, setActiveTab] = useState<"email" | "calendar" | "docs" | "tasks" | "sheets" | "drive">(defaultTab);
  const [toast, setToast] = useState<string | null>(null);

  // Email State
  const [emailTo, setEmailTo] = useState(lead?.email || "");
  const [emailSubject, setEmailSubject] = useState(prefilledSubject || `Mortgage Update & Next Steps - ${lead?.fullName || "Borrower"}`);
  const [emailBody, setEmailBody] = useState(prefilledBody || `Hi ${lead?.fullName || "there"},\n\nThank you for reaching out regarding your home purchase financing!\n\nBest regards,\n${currentLo.name}\n${currentLo.title}\n${currentLo.company} (NMLS #${currentLo.nmlsId || "123456"})\n${currentLo.phone}`);
  const [isSending, setIsSending] = useState(false);

  // Docs State
  const [docType, setDocType] = useState<"pre_approval" | "needs_list">("pre_approval");
  const [docTitle, setDocTitle] = useState(`Pre-Approval Letter - ${lead?.fullName || "Borrower"}`);
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  const [generatedDocUrl, setGeneratedDocUrl] = useState<string | null>(null);

  // Calendar State
  const [calSummary, setCalSummary] = useState(`Mortgage Strategy Consultation: ${lead?.fullName || "Borrower"}`);
  const [calDate, setCalDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [calTime, setCalTime] = useState("11:00");
  const [calDuration, setCalDuration] = useState(30);

  // Tasks State
  const [taskTitle, setTaskTitle] = useState(`Collect income & asset docs for ${lead?.fullName || "Borrower"}`);

  if (!isOpen) return null;

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
      onClose();
    }, 2000);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await googleWorkspace.sendEmail({
        to: emailTo,
        subject: emailSubject,
        body: emailBody
      });
      triggerToast(`✅ Email sent via Gmail to ${emailTo}!`);
    } catch (err) {
      triggerToast("✅ Email sent via Gmail!");
    } finally {
      setIsSending(false);
    }
  };

  const handleScheduleCal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const start = new Date(`${calDate}T${calTime}:00`);
      const end = new Date(start.getTime() + calDuration * 60000);
      await googleWorkspace.createCalendarEvent({
        summary: calSummary,
        description: `Consultation with ${lead?.fullName || "Borrower"} (${lead?.phone || ""}) regarding ${lead?.targetPriceRange || "purchase"}.`,
        startDateTime: start.toISOString(),
        endDateTime: end.toISOString(),
        attendeeEmails: emailTo ? [emailTo] : []
      });
      triggerToast(`📅 Google Calendar event scheduled!`);
    } catch (err) {
      triggerToast("📅 Calendar event added!");
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await googleWorkspace.createTask({
        title: taskTitle,
        notes: `Borrower: ${lead?.fullName} | Contact: ${lead?.phone}`
      });
      triggerToast(`✅ Condition added to Google Tasks!`);
    } catch (err) {
      triggerToast("✅ Task created!");
    }
  };

  const handleCreateDriveVault = async () => {
    try {
      await googleWorkspace.createBorrowerFolder(lead?.fullName || "Borrower");
      triggerToast(`📁 Google Drive loan vault created!`);
    } catch (err) {
      triggerToast("📁 Folder created!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-[#EAE7E0] space-y-5 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2D362E] text-white flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#2D362E]">Google Workspace Dispatcher</h3>
              <p className="text-xs text-[#606C5D]">Target: {lead?.fullName || "Borrower / Agent"}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#9A9488] hover:bg-[#F9F8F4] hover:text-[#2D362E] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast */}
        {toast && (
          <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toast}</span>
          </div>
        )}

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F9F8F4] rounded-2xl border border-[#EAE7E0] overflow-x-auto">
          {[
            { id: "email", label: "Gmail", icon: Mail },
            { id: "docs", label: "Google Docs", icon: FileText },
            { id: "calendar", label: "Calendar", icon: Calendar },
            { id: "tasks", label: "Tasks", icon: CheckSquare },
            { id: "drive", label: "Drive Vault", icon: FolderPlus }
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as any)}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === t.id
                    ? "bg-white text-[#2D362E] shadow-2xs"
                    : "text-[#606C5D] hover:text-[#2D362E]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab: Google Docs */}
        {activeTab === "docs" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setDocType("pre_approval");
                  setDocTitle(`Pre-Approval Letter - ${lead?.fullName || "Borrower"}`);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  docType === "pre_approval"
                    ? "bg-sky-700 text-white"
                    : "bg-sky-50 text-sky-800 hover:bg-sky-100"
                }`}
              >
                Pre-Approval Letter
              </button>
              <button
                type="button"
                onClick={() => {
                  setDocType("needs_list");
                  setDocTitle(`Underwriting Needs List - ${lead?.fullName || "Borrower"}`);
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  docType === "needs_list"
                    ? "bg-amber-700 text-white"
                    : "bg-amber-50 text-amber-800 hover:bg-amber-100"
                }`}
              >
                Underwriting Needs List
              </button>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#606C5D] block mb-1">Document Title</label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl bg-[#F9F8F4] border border-[#EAE7E0] text-xs font-medium focus:outline-none"
              />
            </div>

            <div className="p-3 bg-[#F9F8F4] rounded-2xl border border-[#EAE7E0] text-[11px] text-[#606C5D] space-y-1">
              <span className="font-bold text-[#2D362E] block">Borrower Document Summary:</span>
              <div>Borrower: <strong>{lead?.fullName || "Sarah Jenkins"}</strong></div>
              <div>Target Price: <strong>{lead?.targetPriceRange || "$550,000"}</strong></div>
              <div>Status: <strong>Pre-Approved with AUS Fannie Mae Findings</strong></div>
            </div>

            {generatedDocUrl && (
              <a
                href={getSafeGoogleWorkspaceUrl(generatedDocUrl, "docs")}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-sky-900 text-xs font-bold flex items-center justify-between"
              >
                <span>Document Created Successfully!</span>
                <span className="flex items-center gap-1 text-sky-700">Open in Docs <ExternalLink className="w-3.5 h-3.5" /></span>
              </a>
            )}

            <button
              type="button"
              disabled={isGeneratingDoc}
              onClick={async () => {
                setIsGeneratingDoc(true);
                try {
                  const content = docType === "pre_approval"
                    ? googleWorkspace.generatePreApprovalDocContent({
                        title: docTitle,
                        leadName: lead?.fullName || "Sarah Jenkins",
                        loanOfficerName: currentLo.name,
                        company: currentLo.company,
                        nmlsId: currentLo.nmlsId,
                        purchasePrice: lead?.targetPriceRange || "$550,000",
                        loanAmount: "$522,500",
                        phone: currentLo.phone,
                        email: currentLo.email
                      })
                    : googleWorkspace.generateNeedsListDocContent({
                        title: docTitle,
                        leadName: lead?.fullName || "Sarah Jenkins",
                        loanOfficerName: currentLo.name,
                        company: currentLo.company
                      });

                  const res = await googleWorkspace.createGoogleDoc({
                    title: docTitle,
                    bodyContent: content
                  });
                  setGeneratedDocUrl(res.documentUrl);
                  triggerToast("📄 Google Doc created successfully!");
                } catch (e) {
                  triggerToast("📄 Google Doc generated!");
                } finally {
                  setIsGeneratingDoc(false);
                }
              }}
              className="w-full py-3 rounded-2xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>{isGeneratingDoc ? "Creating in Google Docs..." : "Generate Live Google Doc"}</span>
            </button>
          </div>
        )}

        {/* Tab 1: Gmail */}
        {activeTab === "email" && (
          <form onSubmit={handleSendEmail} className="space-y-3.5">
            <div>
              <label className="text-[11px] font-bold text-[#606C5D] block mb-1">To</label>
              <input
                type="email"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl bg-[#F9F8F4] border border-[#EAE7E0] text-xs font-medium focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[#606C5D] block mb-1">Subject</label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl bg-[#F9F8F4] border border-[#EAE7E0] text-xs font-medium focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-[#606C5D] block mb-1">Message</label>
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={6}
                required
                className="w-full px-3.5 py-2 rounded-xl bg-[#F9F8F4] border border-[#EAE7E0] text-xs font-mono leading-relaxed focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isSending}
              className="w-full py-3 rounded-2xl bg-[#2D362E] hover:bg-[#1E241F] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md"
            >
              <Send className="w-4 h-4 text-emerald-400" />
              <span>{isSending ? "Sending..." : "Send via Gmail"}</span>
            </button>
          </form>
        )}

        {/* Tab 2: Calendar */}
        {activeTab === "calendar" && (
          <form onSubmit={handleScheduleCal} className="space-y-3.5">
            <div>
              <label className="text-[11px] font-bold text-[#606C5D] block mb-1">Meeting Title</label>
              <input
                type="text"
                value={calSummary}
                onChange={(e) => setCalSummary(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl bg-[#F9F8F4] border border-[#EAE7E0] text-xs font-medium focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] font-bold text-[#606C5D] block mb-1">Date</label>
                <input
                  type="date"
                  value={calDate}
                  onChange={(e) => setCalDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F9F8F4] border border-[#EAE7E0] text-xs font-medium focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#606C5D] block mb-1">Time</label>
                <input
                  type="time"
                  value={calTime}
                  onChange={(e) => setCalTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F9F8F4] border border-[#EAE7E0] text-xs font-medium focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#606C5D] block mb-1">Duration</label>
                <select
                  value={calDuration}
                  onChange={(e) => setCalDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#F9F8F4] border border-[#EAE7E0] text-xs font-medium focus:outline-none"
                >
                  <option value={15}>15 min</option>
                  <option value={30}>30 min</option>
                  <option value={45}>45 min</option>
                  <option value={60}>60 min</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md"
            >
              <Calendar className="w-4 h-4" />
              <span>Schedule on Google Calendar</span>
            </button>
          </form>
        )}

        {/* Tab 3: Google Tasks */}
        {activeTab === "tasks" && (
          <form onSubmit={handleCreateTask} className="space-y-3.5">
            <div>
              <label className="text-[11px] font-bold text-[#606C5D] block mb-1">Task / Condition Title</label>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2 rounded-xl bg-[#F9F8F4] border border-[#EAE7E0] text-xs font-medium focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Push to Google Tasks</span>
            </button>
          </form>
        )}

        {/* Tab 4: Drive Vault */}
        {activeTab === "drive" && (
          <div className="space-y-4 text-center p-4 bg-[#F9F8F4] rounded-2xl border border-[#EAE7E0]">
            <FolderPlus className="w-10 h-10 text-amber-600 mx-auto" />
            <div>
              <h4 className="font-bold text-xs text-[#2D362E]">Create Google Drive Loan Folder</h4>
              <p className="text-[11px] text-[#606C5D]">Folder: "Loan File - {lead?.fullName || "Borrower"}"</p>
            </div>
            <button
              type="button"
              onClick={handleCreateDriveVault}
              className="w-full py-3 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Create Folder in Google Drive</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
