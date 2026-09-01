import React, { useState, useEffect } from "react";
import {
  X,
  Mail,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Download,
  Eye,
  Sliders,
  Building,
  Compass,
  FileCheck,
  UserCheck,
  DollarSign,
  Star,
  RefreshCw,
  Bell,
  Zap,
  Clock,
  Settings2,
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import { 
  FinancialProfile, 
  RoadmapMilestone, 
  PropertyListing, 
  DocumentItem, 
  LoanOfficerProfile, 
  RealEstateAgentProfile,
  MilestoneEmailAlertSettings,
  MilestoneNotificationHistoryItem
} from "../types";
import { formatUSD } from "../utils/mortgageMath";
import { 
  getMilestoneAlertSettings, 
  saveMilestoneAlertSettings, 
  triggerMilestoneEmailNotification 
} from "../utils/milestoneNotifier";

interface ShareViaEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: FinancialProfile;
  milestones: RoadmapMilestone[];
  properties: PropertyListing[];
  documents?: DocumentItem[];
  loanOfficer?: LoanOfficerProfile;
  activeAgent?: RealEstateAgentProfile;
  defaultEmail?: string;
  initialTab?: "editor" | "auto_trigger" | "preview";
}

export const ShareViaEmailModal: React.FC<ShareViaEmailModalProps> = ({
  isOpen,
  onClose,
  profile,
  milestones,
  properties,
  documents = [],
  loanOfficer,
  activeAgent,
  defaultEmail = "fordmj@gmail.com",
  initialTab = "editor"
}) => {
  const [autoSettings, setAutoSettings] = useState<MilestoneEmailAlertSettings>(() => getMilestoneAlertSettings());
  const [recipientEmail, setRecipientEmail] = useState<string>(() => autoSettings.recipientEmail || defaultEmail);
  const [recipientName, setRecipientName] = useState<string>(() => autoSettings.recipientName || "");
  const [customNote, setCustomNote] = useState<string>("");
  const [propertyFilter, setPropertyFilter] = useState<"all" | "favorites" | "toured">("all");
  
  // Section inclusion toggles for manual email
  const [includeFinancials, setIncludeFinancials] = useState<boolean>(true);
  const [includeRoadmap, setIncludeRoadmap] = useState<boolean>(true);
  const [includeProperties, setIncludeProperties] = useState<boolean>(true);
  const [includeDocuments, setIncludeDocuments] = useState<boolean>(true);
  const [includeAdvisors, setIncludeAdvisors] = useState<boolean>(true);

  // Tab: 'editor' | 'auto_trigger' | 'preview'
  const [activeTab, setActiveTab] = useState<"editor" | "auto_trigger" | "preview">(initialTab);

  // State for manual sending
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [sendSuccess, setSendSuccess] = useState<boolean>(false);
  const [sendResult, setSendResult] = useState<{
    subject: string;
    sentAt: string;
    recipientEmail: string;
    textBody?: string;
    htmlBody?: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // State for test auto notification
  const [isTestingAutoTrigger, setIsTestingAutoTrigger] = useState<boolean>(false);
  const [testNotificationResult, setTestNotificationResult] = useState<{
    subject: string;
    sentAt: string;
    recipientEmail: string;
    milestoneTitle: string;
  } | null>(null);
  const [testNotificationError, setTestNotificationError] = useState<string | null>(null);
  const [settingsSavedToast, setSettingsSavedToast] = useState<boolean>(false);

  // Reload settings on open or when updated
  useEffect(() => {
    if (isOpen) {
      const current = getMilestoneAlertSettings();
      setAutoSettings(current);
      if (!recipientEmail) {
        setRecipientEmail(current.recipientEmail || defaultEmail);
      }
      if (initialTab) {
        setActiveTab(initialTab);
      }
    }
  }, [isOpen, initialTab, defaultEmail]);

  if (!isOpen) return null;

  // Filtered properties based on selection
  const selectedProperties = properties.filter((p) => {
    if (propertyFilter === "favorites") return p.isFavorite;
    if (propertyFilter === "toured") return p.scorecard !== undefined || p.tourDate || (p.notes && p.notes.length > 0);
    return true;
  });

  // Calculate stats
  const totalTasks = milestones.flatMap((m) => m.tasks || []).length;
  const completedTasks = milestones.flatMap((m) => m.tasks || []).filter((t) => t.done).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Find sample milestone for preview/test
  const sampleMilestone = milestones.find(m => m.completed) || milestones[0] || {
    id: "step-1",
    stepNumber: 1,
    stage: "Readiness" as const,
    title: "Discover Your True Budget Reality",
    summary: "Establish firm maximum monthly payments and total down payment reserves before touring.",
    duration: "1-2 weeks",
    completed: true,
    tasks: [],
    keyTips: ["Calculate full PITI including taxes and insurance", "Maintain at least 3 months emergency reserves"],
    commonPitfalls: ["Looking at homes before verifying actual monthly debt-to-income limits"]
  };

  // Generate plain text summary for copying and mailto link
  const generatePlainTextDossier = (): { subject: string; body: string } => {
    const subject = `Your Homebuying Roadmap & Saved Properties Dossier (${progressPercent}% Ready)`;
    let body = `FIRST-TIME HOMEBUYER ROADMAP & SAVED PROPERTIES DOSSIER\n`;
    body += `Generated on ${new Date().toLocaleDateString()} for ${recipientName || recipientEmail}\n`;
    if (customNote.trim()) {
      body += `Personal Note: "${customNote.trim()}"\n`;
    }
    body += `==================================================\n\n`;

    if (includeFinancials) {
      body += `1. FINANCIAL BLUEPRINT & PURCHASING POWER\n`;
      body += `• Target Home Price: ${formatUSD(profile.targetPrice)}\n`;
      body += `• Down Payment Saved: ${formatUSD(profile.downPaymentSavings)}\n`;
      body += `• Household Annual Income: ${formatUSD(profile.annualIncome)}\n`;
      body += `• Monthly Non-Housing Debts: ${formatUSD(profile.monthlyDebt)}\n`;
      body += `• Target Interest Rate: ${profile.interestRate}%\n\n`;
    }

    if (includeRoadmap) {
      body += `2. 10-STEP HOMEBUYING ROADMAP (${progressPercent}% COMPLETE)\n`;
      body += `Progress: ${completedTasks} of ${totalTasks} tasks completed\n`;
      milestones.forEach((m, idx) => {
        const doneCount = (m.tasks || []).filter((t) => t.done).length;
        const totalCount = (m.tasks || []).length;
        const isComplete = doneCount === totalCount && totalCount > 0;
        body += `  [${isComplete ? "✓" : " "}] Step ${idx + 1}: ${m.title} (${doneCount}/${totalCount})\n`;
        if (m.proTip) {
          body += `      Pro-Tip: ${m.proTip}\n`;
        }
      });
      body += `\n`;
    }

    if (includeProperties && selectedProperties.length > 0) {
      body += `3. SAVED PROPERTIES & INSPECTION SCORECARDS (${selectedProperties.length} HOMES)\n`;
      selectedProperties.forEach((p, idx) => {
        body += `• Property #${idx + 1}: ${p.address}, ${p.city}, ${p.state} ${p.zip}\n`;
        body += `  Price: ${formatUSD(p.price)} | ${p.beds} Beds, ${p.baths} Baths, ${p.sqft} SqFt\n`;
        if (p.isFavorite) body += `  ⭐ Tagged as Favorite\n`;
        if (p.scorecard) {
          body += `  Tour Audit Rating: ${p.scorecard.overallRating}/10 (Grade: ${p.scorecard.grade})\n`;
          if (p.scorecard.redFlags?.length) {
            body += `  Concerns: ${p.scorecard.redFlags.join(", ")}\n`;
          }
        }
        if (p.overlayEligibility?.usda) body += `  🌾 Eligible for 100% USDA Zero Down Financing\n`;
        if (p.overlayEligibility?.lakeviewNational) body += `  💳 Lakeview DPA Grant Eligible\n`;
        if (p.notes) body += `  Tour Notes: "${p.notes}"\n`;
        body += `\n`;
      });
    }

    if (includeDocuments && documents.length > 0) {
      body += `4. UNDERWRITING DOCUMENT VAULT\n`;
      documents.forEach((d) => {
        body += `  [${d.status === "uploaded" ? "✓" : " "}] ${d.name} (${d.status.toUpperCase()})\n`;
      });
      body += `\n`;
    }

    if (includeAdvisors) {
      body += `5. LOCAL PROFESSIONAL ADVISORY TEAM\n`;
      if (loanOfficer) {
        body += `• Loan Officer: ${loanOfficer.name} (${loanOfficer.company || "Cornerstone First Mortgage"}, NMLS #${loanOfficer.nmlsId})\n`;
        body += `  Phone: ${loanOfficer.phone} | Email: ${loanOfficer.email}\n`;
        body += `  Fast-Track Pre-Approval Link: ${loanOfficer.leadGenFormUrl || "https://portal.myhometrac.com/get-started/MFORD@CFMTG.COM"}\n`;
      }
      if (activeAgent) {
        body += `• Real Estate Agent: ${activeAgent.name} (${activeAgent.brokerage || "Pacific Northwest Realty"})\n`;
        body += `  Phone: ${activeAgent.phone} | Email: ${activeAgent.email}\n`;
      }
      body += `\n`;
    }

    body += `==================================================\n`;
    body += `Shared via First-Time Homebuyer Roadmap & Loan Officer Hub\n`;
    return { subject, body };
  };

  const handleCopyClipboard = async () => {
    const { body } = generatePlainTextDossier();
    try {
      await navigator.clipboard.writeText(body);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    } catch (err) {
      console.error("Clipboard copy error:", err);
    }
  };

  const handleOpenMailClient = () => {
    const { subject, body } = generatePlainTextDossier();
    const mailtoUrl = `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  const handleDownloadHtml = () => {
    const { subject, body } = generatePlainTextDossier();
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #2D362E; background: #F9F8F4; padding: 40px 20px; }
          .container { max-width: 720px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #EAE7E0; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
          .header { background: #4A5D4E; color: #ffffff; padding: 32px; }
          .header h1 { margin: 0 0 8px 0; font-size: 24px; }
          .badge { display: inline-block; background: #D4A373; color: #ffffff; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
          .content { padding: 32px; }
          pre { white-space: pre-wrap; font-family: inherit; font-size: 14px; background: #F9F8F4; padding: 20px; border-radius: 12px; border: 1px solid #EAE7E0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="badge">First-Time Homebuyer Roadmap</div>
            <h1>${subject}</h1>
            <p style="margin: 0; opacity: 0.9;">Prepared for ${recipientName || recipientEmail}</p>
          </div>
          <div class="content">
            <pre>${body}</pre>
          </div>
        </div>
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Homebuying-Roadmap-Saved-Properties-${new Date().toISOString().split("T")[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || !recipientEmail.includes("@")) {
      setErrorMessage("Please provide a valid recipient email address.");
      return;
    }

    setIsSending(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/share/email-roadmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          recipientEmail: recipientEmail.trim(),
          recipientName: recipientName.trim(),
          customNote: customNote.trim(),
          profile,
          milestones,
          properties: selectedProperties,
          documents,
          loanOfficer,
          activeAgent,
          sections: {
            financials: includeFinancials,
            roadmap: includeRoadmap,
            properties: includeProperties,
            documents: includeDocuments,
            advisors: includeAdvisors
          }
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to dispatch email summary");
      }

      setSendSuccess(true);
      setSendResult({
        subject: data.email?.subject || `Homebuying Roadmap & Saved Properties Dossier`,
        sentAt: data.email?.sentAt || new Date().toISOString(),
        recipientEmail: recipientEmail.trim(),
        textBody: data.email?.textBody,
        htmlBody: data.email?.htmlBody
      });
    } catch (err: any) {
      console.error("Send email error:", err);
      setErrorMessage(err.message || "Failed to dispatch email directly. You can use 'Open in Email App' or 'Copy Summary' below.");
    } finally {
      setIsSending(false);
    }
  };

  // Handle saving auto-trigger settings
  const handleSaveAutoSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updated: MilestoneEmailAlertSettings = {
      ...autoSettings,
      recipientEmail: recipientEmail.trim(),
      recipientName: recipientName.trim()
    };
    setAutoSettings(updated);
    saveMilestoneAlertSettings(updated);
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 3000);
  };

  // Handle triggering a test milestone notification
  const handleTestAutoTrigger = async () => {
    if (!recipientEmail || !recipientEmail.includes("@")) {
      setTestNotificationError("Please enter a valid email address first.");
      return;
    }

    setIsTestingAutoTrigger(true);
    setTestNotificationError(null);
    setTestNotificationResult(null);

    try {
      const result = await triggerMilestoneEmailNotification({
        milestone: sampleMilestone,
        profile,
        milestones,
        properties: properties.slice(0, 3),
        loanOfficer,
        activeAgent,
        overrideEmail: recipientEmail.trim(),
        isTest: true
      });

      if (!result.success || !result.email) {
        throw new Error(result.error || "Test dispatch failed.");
      }

      setTestNotificationResult({
        subject: result.email.subject,
        sentAt: result.email.sentAt,
        recipientEmail: result.email.recipientEmail,
        milestoneTitle: result.email.milestoneTitle
      });

      // Update local autoSettings history
      setAutoSettings(getMilestoneAlertSettings());
    } catch (err: any) {
      console.error("Test milestone trigger error:", err);
      setTestNotificationError(err.message || "Could not trigger test milestone email.");
    } finally {
      setIsTestingAutoTrigger(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-[#EAE7E0] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#4A5D4E] text-white flex items-center justify-between relative shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <Mail className="w-5 h-5 text-[#D4A373]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#D4A373] text-white">
                  Share & Notifications
                </span>
                <span className="text-xs text-white/80 font-medium">
                  {progressPercent}% Roadmap Readiness
                </span>
                {autoSettings.enabled && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-200 bg-emerald-800/60 px-2 py-0.5 rounded-full border border-emerald-400/30">
                    <Zap className="w-3 h-3 text-amber-300" />
                    Auto-Alerts ON
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-serif leading-tight">
                Send Homebuying Roadmap & Saved Properties
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-3 pb-2 bg-[#F9F8F4] border-b border-[#EAE7E0] flex items-center justify-between flex-wrap gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-[#EAE7E0]/60 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("editor")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "editor"
                  ? "bg-white text-[#2D362E] shadow-2xs"
                  : "text-[#606C5D] hover:text-[#2D362E]"
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Send Summary Now</span>
            </button>
            <button
              onClick={() => setActiveTab("auto_trigger")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "auto_trigger"
                  ? "bg-[#4A5D4E] text-white shadow-2xs font-bold"
                  : "text-[#606C5D] hover:text-[#2D362E]"
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${activeTab === "auto_trigger" ? "text-amber-300" : "text-[#D4A373]"}`} />
              <span>Automated Milestone Alerts</span>
              {autoSettings.enabled && (
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "preview"
                  ? "bg-white text-[#2D362E] shadow-2xs"
                  : "text-[#606C5D] hover:text-[#2D362E]"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Live Preview</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyClipboard}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#606C5D] hover:text-[#2D362E] bg-white border border-[#EAE7E0] hover:bg-stone-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              title="Copy formatted text summary"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Summary</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleDownloadHtml}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#606C5D] hover:text-[#2D362E] bg-white border border-[#EAE7E0] hover:bg-stone-50 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              title="Download HTML file"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: AUTOMATED MILESTONE ALERTS TAB */}
          {activeTab === "auto_trigger" ? (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Notification Banner / Explanation */}
              <div className="p-5 rounded-2xl bg-[#EBF3ED] border border-[#A7D1B4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-[#4A5D4E] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Zap className="w-5 h-5 text-[#D4A373]" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#2D362E]">
                        Automated Milestone Trigger
                      </h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        autoSettings.enabled ? "bg-[#4A5D4E] text-white" : "bg-stone-200 text-stone-600"
                      }`}>
                        {autoSettings.enabled ? "ACTIVE" : "PAUSED"}
                      </span>
                    </div>
                    <p className="text-xs text-[#4A5D4E] leading-relaxed">
                      Whenever you complete all action checklist items in any of the 10 roadmap steps, an AI-formatted summary is automatically sent directly to your email with your next milestone checklist and updated budget snapshot.
                    </p>
                  </div>
                </div>

                {/* Master Switch */}
                <label className="flex items-center gap-2.5 cursor-pointer shrink-0 bg-white px-3.5 py-2 rounded-xl border border-[#A7D1B4] shadow-2xs hover:bg-[#F9F8F4] transition-colors">
                  <input
                    type="checkbox"
                    checked={autoSettings.enabled}
                    onChange={(e) => {
                      const updated = { ...autoSettings, enabled: e.target.checked };
                      setAutoSettings(updated);
                      saveMilestoneAlertSettings(updated);
                    }}
                    className="w-4 h-4 text-[#4A5D4E] rounded focus:ring-[#4A5D4E]"
                  />
                  <span className="text-xs font-bold text-[#2D362E]">
                    {autoSettings.enabled ? "Enabled" : "Enable Trigger"}
                  </span>
                </label>
              </div>

              {/* Alert Configuration Form */}
              <form onSubmit={handleSaveAutoSettings} className="bg-[#F9F8F4] p-5 rounded-2xl border border-[#EAE7E0] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#4A5D4E]">
                    <Settings2 className="w-4 h-4 text-[#D4A373]" />
                    <span>Notification Settings</span>
                  </div>
                  {settingsSavedToast && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md animate-in fade-in">
                      ✓ Preferences Saved!
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#2D362E] mb-1">
                      Target Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. fordmj@gmail.com"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE7E0] bg-white text-xs text-[#2D362E] focus:ring-2 focus:ring-[#4A5D4E] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2D362E] mb-1">
                      Recipient Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mike Ford"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE7E0] bg-white text-xs text-[#2D362E] focus:ring-2 focus:ring-[#4A5D4E] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-[#EAE7E0] space-y-2">
                  <span className="text-xs font-semibold text-[#2D362E] block">
                    Information to Include in Automated Milestone Emails:
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#EAE7E0] text-xs font-medium text-[#2D362E] cursor-pointer hover:bg-stone-50">
                      <input
                        type="checkbox"
                        checked={autoSettings.includeNextSteps}
                        onChange={(e) => {
                          const updated = { ...autoSettings, includeNextSteps: e.target.checked };
                          setAutoSettings(updated);
                          saveMilestoneAlertSettings(updated);
                        }}
                        className="rounded text-[#4A5D4E] focus:ring-[#4A5D4E]"
                      />
                      <span>AI Next Step Guidance</span>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#EAE7E0] text-xs font-medium text-[#2D362E] cursor-pointer hover:bg-stone-50">
                      <input
                        type="checkbox"
                        checked={autoSettings.includeProperties}
                        onChange={(e) => {
                          const updated = { ...autoSettings, includeProperties: e.target.checked };
                          setAutoSettings(updated);
                          saveMilestoneAlertSettings(updated);
                        }}
                        className="rounded text-[#4A5D4E] focus:ring-[#4A5D4E]"
                      />
                      <span>Top Saved Homes & Notes</span>
                    </label>

                    <label className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#EAE7E0] text-xs font-medium text-[#2D362E] cursor-pointer hover:bg-stone-50">
                      <input
                        type="checkbox"
                        checked={autoSettings.includeFinancialSnapshot}
                        onChange={(e) => {
                          const updated = { ...autoSettings, includeFinancialSnapshot: e.target.checked };
                          setAutoSettings(updated);
                          saveMilestoneAlertSettings(updated);
                        }}
                        className="rounded text-[#4A5D4E] focus:ring-[#4A5D4E]"
                      />
                      <span>Purchasing Power Status</span>
                    </label>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-white border border-[#4A5D4E] text-[#4A5D4E] hover:bg-[#F9F8F4] font-bold text-xs transition-colors cursor-pointer"
                  >
                    Save Email Preferences
                  </button>

                  <button
                    type="button"
                    onClick={handleTestAutoTrigger}
                    disabled={isTestingAutoTrigger}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white font-bold text-xs shadow-xs transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {isTestingAutoTrigger ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#D4A373]" />
                        <span>Dispatching Test...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 text-amber-300" />
                        <span>Send Test Milestone Email Now</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Test Result or Error */}
              {testNotificationResult && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Test Milestone Summary Successfully Sent!</span>
                  </div>
                  <p>
                    We prepared and dispatched an automated milestone alert for <strong>"{testNotificationResult.milestoneTitle}"</strong> to <strong>{testNotificationResult.recipientEmail}</strong>.
                  </p>
                  <div className="text-[11px] text-emerald-700">
                    Subject: <em>{testNotificationResult.subject}</em>
                  </div>
                </div>
              )}

              {testNotificationError && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-bold">Failed to send test email:</strong>
                    <span>{testNotificationError}</span>
                  </div>
                </div>
              )}

              {/* Notification History */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A5D4E] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#D4A373]" />
                    <span>Recent Automated Trigger Activity Log</span>
                  </h4>
                  <span className="text-[11px] text-[#9A9488]">
                    {(autoSettings.history || []).length} Recorded Triggers
                  </span>
                </div>

                {(!autoSettings.history || autoSettings.history.length === 0) ? (
                  <div className="p-6 text-center rounded-2xl border border-dashed border-[#EAE7E0] bg-[#FAF9F5] text-xs text-[#9A9488] space-y-2">
                    <Bell className="w-6 h-6 text-[#9A9488] mx-auto opacity-50" />
                    <p>No milestone notifications have been triggered yet.</p>
                    <p className="text-[11px]">
                      Complete any roadmap task in the 10-step journey or click <strong>"Send Test Milestone Email Now"</strong> above to see it logged here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    {autoSettings.history.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl border border-[#EAE7E0] bg-white flex items-center justify-between text-xs gap-3 shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-[#EBF3ED] text-[#4A5D4E] font-bold flex items-center justify-center text-[11px]">
                            {item.stepNumber ? `S${item.stepNumber}` : "✓"}
                          </div>
                          <div>
                            <div className="font-bold text-[#2D362E] line-clamp-1">
                              {item.subject || `Milestone: ${item.milestoneTitle}`}
                            </div>
                            <div className="text-[10px] text-[#606C5D] flex items-center gap-2">
                              <span>To: {item.recipientEmail}</span>
                              <span>•</span>
                              <span>{new Date(item.sentAt).toLocaleDateString()} at {new Date(item.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            item.status === "sent" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                          }`}>
                            {item.status === "sent" ? "Dispatched" : "Test Sent"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : sendSuccess && sendResult ? (
            /* Success View */
            <div className="bg-[#EBF3ED] border border-[#A7D1B4] rounded-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 bg-[#4A5D4E] text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8 text-[#D4A373]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-serif font-bold text-[#2D362E]">
                  Roadmap & Property Dossier Dispatched!
                </h3>
                <p className="text-sm text-[#4A5D4E]">
                  We have prepared and dispatched your complete homebuying roadmap and saved properties summary to:
                </p>
                <div className="inline-block font-mono font-bold text-sm bg-white px-3 py-1 rounded-lg border border-[#A7D1B4] text-[#2D362E] mt-1">
                  {sendResult.recipientEmail}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#A7D1B4] p-4 text-left text-xs space-y-2 text-[#606C5D]">
                <div className="flex justify-between items-center border-b border-[#EAE7E0] pb-2 font-semibold text-[#2D362E]">
                  <span>Subject: {sendResult.subject}</span>
                  <span>{new Date(sendResult.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="bg-[#F9F8F4] p-2 rounded-lg text-center">
                    <span className="text-[10px] text-[#9A9488] block">Readiness</span>
                    <strong className="text-[#4A5D4E]">{progressPercent}% Done</strong>
                  </div>
                  <div className="bg-[#F9F8F4] p-2 rounded-lg text-center">
                    <span className="text-[10px] text-[#9A9488] block">Milestones</span>
                    <strong className="text-[#2D362E]">{completedTasks}/{totalTasks} Tasks</strong>
                  </div>
                  <div className="bg-[#F9F8F4] p-2 rounded-lg text-center">
                    <span className="text-[10px] text-[#9A9488] block">Properties</span>
                    <strong className="text-[#2D362E]">{selectedProperties.length} Saved</strong>
                  </div>
                  <div className="bg-[#F9F8F4] p-2 rounded-lg text-center">
                    <span className="text-[10px] text-[#9A9488] block">Target Budget</span>
                    <strong className="text-[#2D362E]">{formatUSD(profile.targetPrice)}</strong>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleOpenMailClient}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#A7D1B4] text-[#4A5D4E] hover:bg-stone-50 font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Email App</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSendSuccess(false)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#4A5D4E] text-white hover:bg-[#38463B] font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Send to Another Email</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D362E] text-white hover:bg-black font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
                >
                  <span>Done</span>
                </button>
              </div>
            </div>
          ) : activeTab === "editor" ? (
            /* Setup & Form Tab */
            <form onSubmit={handleSendEmail} className="space-y-6">
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Error sending email: </span>
                    {errorMessage}
                  </div>
                </div>
              )}

              {/* Recipient Information */}
              <div className="bg-[#F9F8F4] p-4 sm:p-5 rounded-2xl border border-[#EAE7E0] space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#4A5D4E]">
                  <Mail className="w-4 h-4 text-[#D4A373]" />
                  <span>1. Recipient Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#2D362E] mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. fordmj@gmail.com"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE7E0] bg-white text-xs text-[#2D362E] placeholder-[#9A9488] focus:outline-hidden focus:ring-2 focus:ring-[#4A5D4E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2D362E] mb-1">
                      Recipient Name / Co-Buyer (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mike Ford or Sarah & Alex"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EAE7E0] bg-white text-xs text-[#2D362E] placeholder-[#9A9488] focus:outline-hidden focus:ring-2 focus:ring-[#4A5D4E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2D362E] mb-1">
                    Personal Note / Instructions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Here is our 10-step homebuying plan and our top 3 favorited homes in Oregon with inspection notes."
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#EAE7E0] bg-white text-xs text-[#2D362E] placeholder-[#9A9488] focus:outline-hidden focus:ring-2 focus:ring-[#4A5D4E]"
                  />
                </div>
              </div>

              {/* Sections to Include */}
              <div className="bg-[#F9F8F4] p-4 sm:p-5 rounded-2xl border border-[#EAE7E0] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#4A5D4E]">
                    <Sliders className="w-4 h-4 text-[#D4A373]" />
                    <span>2. Select What to Include in the Dossier</span>
                  </div>
                  <span className="text-[11px] text-[#9A9488]">Customizable Report</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Roadmap Toggle */}
                  <label className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    includeRoadmap ? "bg-white border-[#4A5D4E] shadow-2xs" : "bg-stone-50 border-[#EAE7E0] opacity-70"
                  }`}>
                    <input
                      type="checkbox"
                      checked={includeRoadmap}
                      onChange={(e) => setIncludeRoadmap(e.target.checked)}
                      className="mt-0.5 rounded text-[#4A5D4E] focus:ring-[#4A5D4E]"
                    />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D362E]">
                        <Compass className="w-3.5 h-3.5 text-[#4A5D4E]" />
                        <span>10-Step Homebuying Roadmap</span>
                      </div>
                      <p className="text-[11px] text-[#606C5D]">
                        Full timeline, {progressPercent}% progress, completed checklist, and verified pro-tips.
                      </p>
                    </div>
                  </label>

                  {/* Properties Toggle */}
                  <label className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    includeProperties ? "bg-white border-[#4A5D4E] shadow-2xs" : "bg-stone-50 border-[#EAE7E0] opacity-70"
                  }`}>
                    <input
                      type="checkbox"
                      checked={includeProperties}
                      onChange={(e) => setIncludeProperties(e.target.checked)}
                      className="mt-0.5 rounded text-[#4A5D4E] focus:ring-[#4A5D4E]"
                    />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D362E]">
                        <Building className="w-3.5 h-3.5 text-[#4A5D4E]" />
                        <span>Saved Property Summaries ({selectedProperties.length})</span>
                      </div>
                      <p className="text-[11px] text-[#606C5D]">
                        Target prices, beds/baths, tour scorecards, notes, and USDA/DPA badges.
                      </p>
                    </div>
                  </label>

                  {/* Financial Profile Toggle */}
                  <label className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    includeFinancials ? "bg-white border-[#4A5D4E] shadow-2xs" : "bg-stone-50 border-[#EAE7E0] opacity-70"
                  }`}>
                    <input
                      type="checkbox"
                      checked={includeFinancials}
                      onChange={(e) => setIncludeFinancials(e.target.checked)}
                      className="mt-0.5 rounded text-[#4A5D4E] focus:ring-[#4A5D4E]"
                    />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D362E]">
                        <DollarSign className="w-3.5 h-3.5 text-[#4A5D4E]" />
                        <span>Financial Purchasing Blueprint</span>
                      </div>
                      <p className="text-[11px] text-[#606C5D]">
                        Income, down payment ({formatUSD(profile.downPaymentSavings)}), debts, and target payment.
                      </p>
                    </div>
                  </label>

                  {/* Document Vault Toggle */}
                  <label className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    includeDocuments ? "bg-white border-[#4A5D4E] shadow-2xs" : "bg-stone-50 border-[#EAE7E0] opacity-70"
                  }`}>
                    <input
                      type="checkbox"
                      checked={includeDocuments}
                      onChange={(e) => setIncludeDocuments(e.target.checked)}
                      className="mt-0.5 rounded text-[#4A5D4E] focus:ring-[#4A5D4E]"
                    />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D362E]">
                        <FileCheck className="w-3.5 h-3.5 text-[#4A5D4E]" />
                        <span>Underwriting Document Checklist</span>
                      </div>
                      <p className="text-[11px] text-[#606C5D]">
                        Status of W2s, tax returns, pay stubs, and pre-approval letters.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Property Filter Selection (if properties included) */}
                {includeProperties && properties.length > 0 && (
                  <div className="pt-2 border-t border-[#EAE7E0] flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-medium text-[#606C5D]">Property Filter:</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setPropertyFilter("all")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          propertyFilter === "all"
                            ? "bg-[#4A5D4E] text-white"
                            : "bg-white text-[#606C5D] border border-[#EAE7E0]"
                        }`}
                      >
                        All Saved ({properties.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setPropertyFilter("favorites")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                          propertyFilter === "favorites"
                            ? "bg-[#4A5D4E] text-white"
                            : "bg-white text-[#606C5D] border border-[#EAE7E0]"
                        }`}
                      >
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>Favorites ({properties.filter((p) => p.isFavorite).length})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPropertyFilter("toured")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          propertyFilter === "toured"
                            ? "bg-[#4A5D4E] text-white"
                            : "bg-white text-[#606C5D] border border-[#EAE7E0]"
                        }`}
                      >
                        Toured / Scored ({properties.filter((p) => p.scorecard || p.tourDate || p.notes).length})
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Advisory Guides Card */}
              {loanOfficer && (
                <div className="p-3.5 rounded-2xl bg-white border border-[#EAE7E0] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#4A5D4E]/10 flex items-center justify-center text-[#4A5D4E]">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#9A9488] uppercase block">Assigned Advisory Guide</span>
                      <strong className="text-[#2D362E]">{loanOfficer.name}</strong>
                      <span className="text-[#606C5D]"> • {loanOfficer.company || "Guild Mortgage"} (NMLS #{loanOfficer.nmlsId})</span>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeAdvisors}
                      onChange={(e) => setIncludeAdvisors(e.target.checked)}
                      className="rounded text-[#4A5D4E] focus:ring-[#4A5D4E]"
                    />
                    <span className="text-[11px] text-[#606C5D]">Include Contact Card</span>
                  </label>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#EAE7E0]">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleOpenMailClient}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#EAE7E0] hover:bg-stone-50 text-[#606C5D] hover:text-[#2D362E] font-semibold text-xs transition-colors cursor-pointer"
                    title="Open mail client with pre-filled dossier"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#4A5D4E]" />
                    <span>Open in Email App</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-[#EAE7E0] text-[#606C5D] hover:bg-stone-50 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSending}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white font-bold text-xs shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {isSending ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-[#D4A373]" />
                        <span>Preparing & Dispatching...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-[#D4A373]" />
                        <span>Send to My Email</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Live Preview Tab */
            <div className="space-y-4">
              <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-2xl p-4 text-xs space-y-2">
                <div className="flex items-center justify-between text-[#606C5D] border-b border-[#EAE7E0] pb-2">
                  <span><strong>To:</strong> {recipientEmail || "your-email@example.com"}</span>
                  <span className="text-[#4A5D4E] font-semibold">Live Preview</span>
                </div>
                <div className="text-[#2D362E] font-semibold">
                  <strong>Subject:</strong> {generatePlainTextDossier().subject}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#EAE7E0] p-6 shadow-xs font-sans space-y-6 text-sm text-[#2D362E]">
                {/* Header Badge */}
                <div className="p-5 rounded-xl bg-[#4A5D4E] text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4A373] block mb-1">
                    First-Time Homebuyer Roadmap
                  </span>
                  <h3 className="text-xl font-bold font-serif">Homebuying Plan & Saved Properties</h3>
                  <p className="text-xs text-white/80 mt-1">
                    Prepared for {recipientName || recipientEmail} • Readiness: {progressPercent}% Complete
                  </p>
                </div>

                {customNote && (
                  <div className="p-3.5 rounded-xl bg-[#F9F8F4] border border-[#EAE7E0] text-xs italic text-[#606C5D]">
                    "{customNote}"
                  </div>
                )}

                {/* Financial Summary */}
                {includeFinancials && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A5D4E] border-b border-[#EAE7E0] pb-1">
                      1. Financial Purchasing Power
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="bg-[#F9F8F4] p-3 rounded-xl border border-[#EAE7E0]">
                        <span className="text-[10px] text-[#9A9488] block">Target Home Price</span>
                        <strong className="text-sm text-[#2D362E]">{formatUSD(profile.targetPrice)}</strong>
                      </div>
                      <div className="bg-[#F9F8F4] p-3 rounded-xl border border-[#EAE7E0]">
                        <span className="text-[10px] text-[#9A9488] block">Down Payment Saved</span>
                        <strong className="text-sm text-[#4A5D4E]">{formatUSD(profile.downPaymentSavings)}</strong>
                      </div>
                      <div className="bg-[#F9F8F4] p-3 rounded-xl border border-[#EAE7E0]">
                        <span className="text-[10px] text-[#9A9488] block">Annual Income</span>
                        <strong className="text-sm text-[#2D362E]">{formatUSD(profile.annualIncome)}</strong>
                      </div>
                      <div className="bg-[#F9F8F4] p-3 rounded-xl border border-[#EAE7E0]">
                        <span className="text-[10px] text-[#9A9488] block">Interest Rate</span>
                        <strong className="text-sm text-[#2D362E]">{profile.interestRate}%</strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* Roadmap Progress */}
                {includeRoadmap && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-1">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A5D4E]">
                        2. 10-Step Homebuying Roadmap
                      </h4>
                      <span className="text-xs font-bold text-[#4A5D4E]">{progressPercent}% Complete ({completedTasks}/{totalTasks})</span>
                    </div>
                    <div className="space-y-2">
                      {milestones.map((m, idx) => {
                        const doneCount = (m.tasks || []).filter((t) => t.done).length;
                        const isDone = doneCount === (m.tasks || []).length;
                        return (
                          <div
                            key={m.id || idx}
                            className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                              isDone ? "bg-[#EBF3ED]/60 border-[#A7D1B4]" : "bg-[#F9F8F4] border-[#EAE7E0]"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                isDone ? "bg-[#4A5D4E] text-white" : "bg-[#EAE7E0] text-[#606C5D]"
                              }`}>
                                {isDone ? "✓" : idx + 1}
                              </span>
                              <span className="font-semibold text-[#2D362E]">Step {idx + 1}: {m.title}</span>
                            </div>
                            <span className="text-[11px] text-[#606C5D]">
                              {doneCount}/{(m.tasks || []).length} done
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Saved Properties */}
                {includeProperties && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-1">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A5D4E]">
                        3. Saved Target Properties ({selectedProperties.length})
                      </h4>
                      <span className="text-[11px] text-[#9A9488]">Filter: {propertyFilter}</span>
                    </div>
                    {selectedProperties.length === 0 ? (
                      <p className="text-xs text-[#9A9488] italic">No properties match the selected filter.</p>
                    ) : (
                      <div className="space-y-2.5">
                        {selectedProperties.map((p) => (
                          <div key={p.id} className="p-3.5 rounded-xl border border-[#EAE7E0] bg-[#F9F8F4] space-y-1.5">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <strong className="text-xs text-[#2D362E]">{p.address}, {p.city}</strong>
                                  {p.isFavorite && <Star className="w-3 h-3 fill-amber-400 text-amber-400" />}
                                </div>
                                <div className="text-xs font-bold text-[#4A5D4E] mt-0.5">
                                  {formatUSD(p.price)} • {p.beds} Beds, {p.baths} Baths, {p.sqft} SqFt
                                </div>
                              </div>
                              {p.scorecard && (
                                <span className="px-2 py-0.5 rounded-md bg-[#4A5D4E] text-white text-[10px] font-bold">
                                  Grade: {p.scorecard.grade} ({p.scorecard.overallRating}/10)
                                </span>
                              )}
                            </div>
                            {p.overlayEligibility?.usda && (
                              <span className="inline-block text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                                🌾 100% USDA Zero Down Eligible
                              </span>
                            )}
                            {p.notes && (
                              <p className="text-[11px] text-[#606C5D] italic bg-white p-2 rounded-lg border border-[#EAE7E0]">
                                Note: "{p.notes}"
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Advisors */}
                {includeAdvisors && loanOfficer && (
                  <div className="pt-4 border-t border-[#EAE7E0] text-xs text-[#606C5D] space-y-1">
                    <p>
                      <strong>Loan Officer Guide:</strong> {loanOfficer.name} ({loanOfficer.company || "Guild Mortgage"}, NMLS #{loanOfficer.nmlsId}) • {loanOfficer.phone} • {loanOfficer.email}
                    </p>
                    {activeAgent && (
                      <p>
                        <strong>Real Estate Agent:</strong> {activeAgent.name} ({activeAgent.brokerage || "Pacific Northwest Realty"}) • {activeAgent.phone} • {activeAgent.email}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Actions below preview */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("editor")}
                  className="px-4 py-2 rounded-xl bg-[#4A5D4E] text-white text-xs font-bold hover:bg-[#38463B] transition-colors cursor-pointer"
                >
                  Back to Setup & Send
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

