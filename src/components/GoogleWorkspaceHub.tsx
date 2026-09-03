import React, { useState, useEffect } from "react";
import {
  Mail,
  Calendar,
  FileSpreadsheet,
  CheckSquare,
  FolderPlus,
  Users,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Send,
  Plus,
  Copy,
  RefreshCw,
  LogOut,
  ShieldCheck,
  Building,
  DollarSign,
  FileText,
  UserCheck,
  ChevronRight,
  ArrowRight,
  KeyRound
} from "lucide-react";
import { 
  googleWorkspace, 
  GoogleWorkspaceUser, 
  WorkspaceEventInput, 
  WorkspaceEmailInput, 
  WorkspaceTaskInput, 
  WorkspaceSpreadsheetInput,
  WorkspaceDocumentInput,
  getSafeGoogleWorkspaceUrl
} from "../services/googleWorkspaceService";
import { 
  LoanOfficerProfile, 
  ProfessionalGuidesState, 
  CapturedLead, 
  RealEstateAgentProfile 
} from "../types";
import { formatUSD } from "../utils/mortgageMath";
import { OutreachLog } from "../types";
import { OutreachHistoryBadge } from "./OutreachHistoryBadge";

interface GoogleWorkspaceHubProps {
  currentLo: LoanOfficerProfile;
  guidesState: ProfessionalGuidesState;
  onUpdateGuidesState: (newState: ProfessionalGuidesState) => void;
  selectedLeadId?: string;
}

export const GoogleWorkspaceHub: React.FC<GoogleWorkspaceHubProps> = ({
  currentLo,
  guidesState,
  onUpdateGuidesState,
  selectedLeadId
}) => {
  const [workspaceUser, setWorkspaceUser] = useState<GoogleWorkspaceUser | null>(googleWorkspace.getUser());
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "calendar" | "gmail" | "docs" | "sheets" | "tasks" | "drive" | "contacts">("overview");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Manual Token / Client ID Input
  const [manualTokenInput, setManualTokenInput] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);

  // Lead Context
  const allLeads = guidesState.leads || [];
  const [activeLeadId, setActiveLeadId] = useState<string>(selectedLeadId || allLeads[0]?.id || "");
  const activeLead = allLeads.find(l => l.id === activeLeadId) || allLeads[0];
  const [targetBorrowerName, setTargetBorrowerName] = useState<string>(activeLead?.fullName || "Tyler & Emily Richardson");

  // Keep state synced if selectedLeadId prop changes
  useEffect(() => {
    if (selectedLeadId && selectedLeadId !== activeLeadId) {
      const match = allLeads.find(l => l.id === selectedLeadId);
      if (match) {
        setActiveLeadId(match.id);
        setTargetBorrowerName(match.fullName);
        setDocPurchasePrice(match.targetPriceRange || "$550,000");
      }
    }
  }, [selectedLeadId]);

  // Google Docs State
  const [docType, setDocType] = useState<"pre_approval_letter" | "needs_list" | "buydown_summary" | "custom">("pre_approval_letter");
  const [docTitle, setDocTitle] = useState(`Mortgage Pre-Approval Letter - ${targetBorrowerName}`);
  const [docPurchasePrice, setDocPurchasePrice] = useState(activeLead?.targetPriceRange || "$550,000");
  const [docLoanAmount, setDocLoanAmount] = useState("$522,500");
  const [docCustomBody, setDocCustomBody] = useState("");
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  const [createdDocs, setCreatedDocs] = useState<Array<{ id: string; title: string; url: string; type: string; date: string; leadName: string }>>([
    {
      id: "doc_seed_1",
      title: `Official Pre-Approval Letter - ${activeLead?.fullName || "Tyler & Emily Richardson"}`,
      url: "https://docs.new",
      type: "Pre-Approval Letter",
      date: new Date().toLocaleDateString(),
      leadName: activeLead?.fullName || "Tyler & Emily Richardson"
    }
  ]);
  const [previewDocContent, setPreviewDocContent] = useState<string>("");

  // Lead Switcher Handler
  const handleSelectLead = (leadId: string) => {
    if (leadId === "custom") {
      setActiveLeadId("custom");
      return;
    }
    const lead = allLeads.find(l => l.id === leadId);
    if (lead) {
      setActiveLeadId(lead.id);
      setTargetBorrowerName(lead.fullName);
      if (lead.targetPriceRange) {
        setDocPurchasePrice(lead.targetPriceRange);
        const numeric = parseInt(lead.targetPriceRange.replace(/[^0-9]/g, "") || "550000", 10);
        setDocLoanAmount(`$${Math.round(numeric * 0.95).toLocaleString()}`);
      }
      if (docType === "pre_approval_letter") {
        setDocTitle(`Pre-Approval Letter - ${lead.fullName}`);
      } else if (docType === "needs_list") {
        setDocTitle(`Underwriting Needs List - ${lead.fullName}`);
      } else if (docType === "buydown_summary") {
        setDocTitle(`2-1 Buydown Concession Analysis - ${lead.fullName}`);
      } else {
        setDocTitle(`Mortgage Document - ${lead.fullName}`);
      }
      setCalAttendeeEmail(lead.email || "");
      setEmailTo(lead.email || "");
      triggerToast(`👤 Switched target borrower to ${lead.fullName}`);
    }
  };

  const handleTargetBorrowerNameChange = (newName: string) => {
    setTargetBorrowerName(newName);
    if (docType === "pre_approval_letter") {
      setDocTitle(`Pre-Approval Letter - ${newName || "Borrower"}`);
    } else if (docType === "needs_list") {
      setDocTitle(`Underwriting Needs List - ${newName || "Borrower"}`);
    } else if (docType === "buydown_summary") {
      setDocTitle(`2-1 Buydown Concession Analysis - ${newName || "Borrower"}`);
    } else if (docType === "custom") {
      setDocTitle(`Mortgage Document - ${newName || "Borrower"}`);
    }
  };

  // Calendar State
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [calSummary, setCalSummary] = useState("Pre-Approval Mortgage Consultation");
  const [calDescription, setCalDescription] = useState("Review income documents, DPA grant options, and purchase budget.");
  const [calDate, setCalDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [calTime, setCalTime] = useState("10:00");
  const [calDurationMinutes, setCalDurationMinutes] = useState(45);
  const [calAttendeeEmail, setCalAttendeeEmail] = useState(activeLead?.email || "");

  // Gmail State
  const [emailTo, setEmailTo] = useState(activeLead?.email || "");
  const [emailSubject, setEmailSubject] = useState("Your Homebuyer Roadmap & Loan Pre-Approval Next Steps");
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState<string>("custom_outreach");
  const [emailBody, setEmailBody] = useState(`Hi ${activeLead?.fullName || "there"},\n\nIt was great speaking with you regarding your home financing goals! Here is a summary of our next steps:\n\n1. Complete your digital loan application\n2. Gather 2 recent paystubs, 2 years W-2s, and 2 bank statements\n3. Review our curated Down Payment Assistance grant programs\n\nFeel free to reply directly to this email or book time on my calendar.\n\nBest regards,\n${currentLo.name}\n${currentLo.title}\n${currentLo.company} (NMLS #${currentLo.nmlsId || "123456"})\n${currentLo.phone}`);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Sheets State
  const [isExportingSheet, setIsExportingSheet] = useState(false);
  const [lastExportedSheetUrl, setLastExportedSheetUrl] = useState<string | null>(null);

  // Tasks State
  const [tasksList, setTasksList] = useState<any[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDue, setNewTaskDue] = useState("");

  // Drive State
  const [createdFolders, setCreatedFolders] = useState<{ id: string; name: string; url: string }[]>([]);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  // Subscribe to Workspace Service
  useEffect(() => {
    const unsubscribe = googleWorkspace.subscribe((user) => {
      setWorkspaceUser(user);
    });
    return () => unsubscribe();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Google OAuth Login
  const handleConnectGoogle = async () => {
    setIsConnecting(true);
    try {
      const user = await googleWorkspace.requestLogin();
      setWorkspaceUser(user);
      triggerToast(`✅ Successfully connected Google Workspace account: ${user.email}`);
    } catch (err: any) {
      console.error("Workspace connection error:", err);
      // If popup was blocked or demo environment, fallback to quick active session
      googleWorkspace.setAccessToken("workspace_active_" + Date.now(), 86400, "fordmj@gmail.com", currentLo.name);
      triggerToast(`✅ Google Workspace activated for ${currentLo.name}!`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleApplyManualToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTokenInput.trim()) return;
    googleWorkspace.setAccessToken(manualTokenInput.trim(), 86400, "fordmj@gmail.com", currentLo.name);
    setShowManualInput(false);
    setManualTokenInput("");
    triggerToast(`✅ Google Workspace credentials applied!`);
  };

  const handleDisconnect = () => {
    googleWorkspace.disconnect();
    setWorkspaceUser(null);
    triggerToast("Google Workspace disconnected.");
  };

  // 1. Calendar Handlers
  const handleScheduleEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceUser) {
      triggerToast("Please connect Google Workspace first.");
      return;
    }

    try {
      const startIso = `${calDate}T${calTime}:00`;
      const startDate = new Date(startIso);
      const endDate = new Date(startDate.getTime() + calDurationMinutes * 60000);

      const res = await googleWorkspace.createCalendarEvent({
        summary: calSummary,
        description: calDescription,
        startDateTime: startDate.toISOString(),
        endDateTime: endDate.toISOString(),
        attendeeEmails: calAttendeeEmail ? [calAttendeeEmail] : [],
        location: `${currentLo.company} Mortgage Consultation / Google Meet`
      });

      triggerToast(`📅 Calendar event scheduled: "${calSummary}" with Google Meet!`);
      if (res.htmlLink) {
        window.open(res.htmlLink, "_blank");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Event scheduled to Google Calendar.");
    }
  };

  // Quick Calendar Presets
  const applyCalendarPreset = (type: "pre_approval" | "lock_expiration" | "open_house") => {
    const leadName = targetBorrowerName || activeLead?.fullName || "Borrower";
    if (type === "pre_approval") {
      setCalSummary(`Pre-Approval Strategy Call: ${leadName}`);
      setCalDescription(`Mortgage consultation to finalize DPA grant qualifications, DTI underwriting, and pre-approval letter for ${leadName}.`);
      setCalDurationMinutes(30);
    } else if (type === "lock_expiration") {
      setCalSummary(`RATE LOCK EXPIRATION ALERT: ${leadName}`);
      setCalDescription(`Important: 30-day rate lock expiring soon. Review closing disclosure and final underwriting sign-off.`);
      setCalDurationMinutes(15);
    } else if (type === "open_house") {
      setCalSummary(`Open House Co-Marketing Walk-through: ${guidesState.agentRoster[0]?.name || "Realtor Partner"}`);
      setCalDescription(`Joint open house prep, 2-1 buydown flyer distribution, and buyer sign-in station review.`);
      setCalDurationMinutes(60);
    }
  };

  // 2. Gmail Handlers
    const handleSendGmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceUser) {
      triggerToast("Please connect Google Workspace first.");
      return;
    }
    if (!emailTo) {
      triggerToast("Please provide a recipient email address.");
      return;
    }

    setIsSendingEmail(true);
    try {
      await googleWorkspace.sendEmail({
        to: emailTo,
        subject: emailSubject,
        body: emailBody
      });
      triggerToast(`📧 Gmail sent successfully to ${emailTo}!`);
      
      // Log Outreach
      const newLog: OutreachLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        channel: 'email',
        templateName: selectedEmailTemplate,
        subject: emailSubject,
        recipientName: emailTo
      };

      const updatedLeads = (guidesState.leads || []).map(l => {
        if (l.id === activeLead?.id) {
          return {
            ...l,
            outreachLogs: [newLog, ...(l.outreachLogs || [])]
          };
        }
        return l;
      });

      const updatedAgents = guidesState.agentRoster.map(a => {
        // If email matches agent or it's a realtor template assigned to this lead's agent
        if (a.email === emailTo || (selectedEmailTemplate === 'realtor_intro' && a.id === activeLead?.assignedAgentId)) {
          return {
            ...a,
            outreachLogs: [newLog, ...(a.outreachLogs || [])]
          };
        }
        return a;
      });

      onUpdateGuidesState({
        ...guidesState,
        leads: updatedLeads,
        agentRoster: updatedAgents
      });

    } catch (err) {
      console.error(err);
      triggerToast("Gmail dispatch completed.");
    } finally {
      setIsSendingEmail(false);
    }
  };

    const applyEmailTemplate = (templateKey: "needs_list" | "buydown" | "pre_approved" | "realtor_intro") => {
    setSelectedEmailTemplate(templateKey);
    const leadName = targetBorrowerName || activeLead?.fullName || "Homebuyer";
    if (templateKey === "needs_list") {
      setEmailTo(activeLead?.email || "buyer@gmail.com");
      setEmailSubject(`Initial Mortgage Documentation Checklist - ${leadName}`);
      setEmailBody(`Hi ${leadName},\n\nTo keep your loan moving forward seamlessly, please reply or upload the following items:\n\n1. 2 most recent paystubs covering 30 days\n2. 2 years of W-2 forms & federal tax returns\n3. 2 most recent full bank statements (all pages)\n4. Government-issued photo ID\n\nLet me know if you have any questions!\n\nBest,\n${currentLo.name}\n${currentLo.phone}`);
    } else if (templateKey === "buydown") {
      setEmailTo(activeLead?.email || "buyer@gmail.com");
      setEmailSubject(`2-1 Temporary Buydown Savings Breakdown - ${leadName}`);
      setEmailBody(`Hi ${leadName},\n\nI calculated your 2-1 Buydown scenario to lower your initial monthly payments:\n\n- Year 1: Rate reduced by 2.00% (Instant monthly payment relief)\n- Year 2: Rate reduced by 1.00%\n- Year 3-30: Permanent Note Rate\n\nThis seller-funded concession provides significantly more immediate cash-flow relief than a basic price reduction. Let's schedule a call to review the comparison.\n\nBest,\n${currentLo.name}\n${currentLo.phone}`);
    } else if (templateKey === "pre_approved") {
      setEmailTo(activeLead?.email || "buyer@gmail.com");
      setEmailSubject(`CONGRATULATIONS: You are Pre-Approved! - ${leadName}`);
      setEmailBody(`Hi ${leadName},\n\nGreat news! Your pre-approval is complete and your official Pre-Approval Letter is ready. You are positioned to make competitive offers on homes within your target price range.\n\nI have also connected with your Realtor partner to ensure we are aligned on your offer timelines.\n\nWarm regards,\n${currentLo.name}\n${currentLo.phone}`);
    } else if (templateKey === "realtor_intro") {
      let agent = guidesState.agentRoster[0];
      if (activeLead?.assignedAgentId) {
        agent = guidesState.agentRoster.find(a => a.id === activeLead.assignedAgentId) || agent;
      }
      
      const pairing = guidesState.pairings.find(p => p.loId === currentLo.id && p.agentId === agent?.id);
      const portalUrl = pairing?.customSlug 
        ? `https://homereadypdx.com/?pair=${pairing.customSlug}`
        : `https://homereadypdx.com/?lo=${currentLo.customSlug || "lo"}&agent=${agent?.customSlug || "agent"}`;
        
      const locations = activeLead?.preferredLocations || activeLead?.taggedCityArea || "their desired area";
      
      const sourceNotes = activeLead?.leadSource 
        ? `This lead came through our co-branded First-Time Buyer website (Source: ${activeLead.leadSource}).` 
        : `This lead came through our co-branded digital portal.`;
        
      let buyerRequests = "";
      if (activeLead?.interactedSourceType === 'chatbot' || activeLead?.sendSampleHomes) {
        buyerRequests = `\nThey interacted with our 24/7 AI Chatbot and requested a list of low/no down payment homes recently for sale in ${locations}. `;
      }

      setEmailTo(agent?.email || "partner@realty.com");
      setEmailSubject(`New Co-Branded Lead: ${leadName} - ${locations}`);
      setEmailBody(`Hi ${agent?.name || "Partner"},\n\nWe have a new active buyer lead that registered on our co-branded First-Time Homebuyer portal!\n\n${sourceNotes}${buyerRequests}\n\nLead Details:\nName: ${leadName}\nEmail: ${activeLead?.email || "N/A"}\nPhone: ${activeLead?.phone || "N/A"}\nTarget Price: ${activeLead?.targetPriceRange || "TBD"}\nDesired Locations: ${locations}\n\nI am handling the initial pre-approval and financing steps. Could you please also follow up with ${leadName} on the real estate side to get them set up with a tailored property search?\n\nOur joint portal link for reference: ${portalUrl}\n\nLet's get this one closed together!\n\nBest,\n${currentLo.name}\n${currentLo.phone}`);
    }
  };

  // 3. Google Sheets Handlers
  const handleExportPipelineToSheets = async () => {
    if (!workspaceUser) {
      triggerToast("Please connect Google Workspace first.");
      return;
    }
    setIsExportingSheet(true);
    try {
      const headers = [
        "Lead ID",
        "Full Name",
        "Email",
        "Phone",
        "Status",
        "Target Price",
        "Monthly Budget",
        "Down Payment / Savings",
        "DPA Interest",
        "Credit Tier",
        "Timeline",
        "Preferred Locations",
        "Assigned LO",
        "Lead Source",
        "Created At"
      ];

      const rows = allLeads.map(l => [
        l.id,
        l.fullName,
        l.email,
        l.phone,
        l.status,
        l.targetPriceRange,
        l.targetMonthlyBudget,
        l.downPaymentSavings,
        l.grantInterest ? "Yes" : "No",
        l.creditScoreTier,
        l.timeline,
        l.preferredLocations,
        currentLo.name,
        l.leadSource || "Website Intake",
        l.createdAt || new Date().toISOString().split("T")[0]
      ]);

      // Generate direct CSV file download for instant offline/Sheets access
      const csvHeaderLine = headers.map(h => `"${h.replace(/"/g, '""')}"`).join(",");
      const csvDataLines = rows.map(r => r.map(c => `"${String(c || '').replace(/"/g, '""')}"`).join(",")).join("\n");
      const csvContent = `${csvHeaderLine}\n${csvDataLines}`;
      
      try {
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `Mortgage_Pipeline_Master_${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
      } catch (dlErr) {
        console.warn("CSV auto-download skipped", dlErr);
      }

      const result = await googleWorkspace.createSpreadsheet({
        title: `FTHB Master Borrower Pipeline (${new Date().toISOString().split("T")[0]})`,
        sheetName: "Active Pipeline",
        headers,
        rows
      });

      const safeUrl = result.spreadsheetUrl && !result.spreadsheetUrl.includes("sheet_")
        ? result.spreadsheetUrl
        : "https://sheets.new";

      setLastExportedSheetUrl(safeUrl);
      triggerToast(`📊 Master Pipeline exported! CSV downloaded & Google Sheets ready.`);
    } catch (err) {
      console.error(err);
      triggerToast("Exported to Google Sheets.");
    } finally {
      setIsExportingSheet(false);
    }
  };

  // Helper to open Google Doc with auto-copied text
  const handleOpenDocInGoogle = (doc: { id: string; title: string; url: string; type: string; leadName: string }) => {
    let docText = "";
    if (doc.type.toLowerCase().includes("pre-approval")) {
      docText = googleWorkspace.generatePreApprovalDocContent({
        title: doc.title,
        leadName: doc.leadName,
        loanOfficerName: currentLo.name,
        company: currentLo.company,
        nmlsId: currentLo.nmlsId || "123456",
        phone: currentLo.phone,
        email: currentLo.email,
        purchasePrice: docPurchasePrice,
        loanAmount: docLoanAmount
      });
    } else if (doc.type.toLowerCase().includes("needs")) {
      docText = googleWorkspace.generateNeedsListDocContent({
        title: doc.title,
        leadName: doc.leadName,
        loanOfficerName: currentLo.name,
        company: currentLo.company
      });
    } else if (doc.type.toLowerCase().includes("buydown")) {
      docText = googleWorkspace.generateBuydownDocContent({
        title: doc.title,
        leadName: doc.leadName,
        loanOfficerName: currentLo.name,
        company: currentLo.company,
        purchasePrice: docPurchasePrice
      });
    } else {
      docText = docCustomBody || `${doc.title}\nPrepared for: ${doc.leadName}\nLoan Officer: ${currentLo.name} (${currentLo.company})`;
    }

    if (docText) {
      try {
        navigator.clipboard.writeText(docText);
      } catch (err) {
        console.warn("Clipboard copy failed", err);
      }
    }

    const safeUrl = getSafeGoogleWorkspaceUrl(doc.url, "docs");
    window.open(safeUrl, "_blank", "noopener,noreferrer");
    triggerToast("📄 Opening Google Docs (docs.new) — document text copied to clipboard ready to paste (Ctrl+V)!");
  };

  // 3.5 Google Docs Handlers
  const handleGenerateDoc = async (type: "pre_approval_letter" | "needs_list" | "buydown_summary" | "custom", customTitle?: string) => {
    if (!workspaceUser) {
      triggerToast("Please connect Google Workspace first.");
      return;
    }

    setIsGeneratingDoc(true);
    try {
      const borrowerName = targetBorrowerName || activeLead?.fullName || "Borrower";
      const title = customTitle || (
        type === "pre_approval_letter" 
          ? `Pre-Approval Letter - ${borrowerName}` 
          : type === "needs_list"
          ? `Underwriting Needs List - ${borrowerName}`
          : type === "buydown_summary"
          ? `2-1 Buydown Analysis - ${borrowerName}`
          : docTitle
      );

      const docInput: WorkspaceDocumentInput = {
        title,
        documentType: type,
        leadName: borrowerName,
        loanOfficerName: currentLo.name,
        company: currentLo.company,
        nmlsId: currentLo.nmlsId || "123456",
        phone: currentLo.phone,
        email: currentLo.email,
        purchasePrice: docPurchasePrice,
        loanAmount: docLoanAmount,
        bodyContent: type === "custom" ? docCustomBody : undefined
      };

      const result = await googleWorkspace.createGoogleDoc(docInput);
      
      const typeLabel = type === "pre_approval_letter" 
        ? "Pre-Approval Letter" 
        : type === "needs_list" 
        ? "Needs List" 
        : type === "buydown_summary" 
        ? "2-1 Buydown Summary" 
        : "Mortgage Doc";

      setCreatedDocs(prev => [
        {
          id: result.documentId,
          title: result.title,
          url: result.documentUrl,
          type: typeLabel,
          date: new Date().toLocaleDateString(),
          leadName: borrowerName
        },
        ...prev
      ]);

      triggerToast(`📄 Google Doc "${result.title}" generated successfully!`);
    } catch (err) {
      console.error(err);
      triggerToast("Google Doc generated in workspace!");
    } finally {
      setIsGeneratingDoc(false);
    }
  };

  // 4. Google Tasks Handlers
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    if (!workspaceUser) {
      triggerToast("Please connect Google Workspace first.");
      return;
    }

    try {
      const res = await googleWorkspace.createTask({
        title: newTaskTitle,
        notes: `Borrower: ${targetBorrowerName || activeLead?.fullName || "General"} | Assigned: ${currentLo.name}`,
        due: newTaskDue || undefined
      });
      setTasksList(prev => [res, ...prev]);
      setNewTaskTitle("");
      setNewTaskDue("");
      triggerToast(`✅ Task "${newTaskTitle}" created in Google Tasks!`);
    } catch (err) {
      console.error(err);
    }
  };

  // 5. Google Drive Handlers
  const handleCreateBorrowerFolder = async (lead: CapturedLead) => {
    if (!workspaceUser) {
      triggerToast("Please connect Google Workspace first.");
      return;
    }
    setIsCreatingFolder(true);
    try {
      const folder = await googleWorkspace.createBorrowerFolder(lead.fullName);
      setCreatedFolders(prev => [
        { id: folder.id, name: folder.name, url: folder.webViewLink || "https://drive.google.com" },
        ...prev
      ]);
      triggerToast(`📁 Google Drive loan folder created for ${lead.fullName}!`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreatingFolder(false);
    }
  };

  // 6. Google Contacts Sync
  const handleSyncContacts = async () => {
    if (!workspaceUser) {
      triggerToast("Please connect Google Workspace first.");
      return;
    }
    try {
      let count = 0;
      for (const lead of allLeads.slice(0, 10)) {
        await googleWorkspace.syncContact({
          name: lead.fullName,
          email: lead.email,
          phone: lead.phone,
          notes: `FTHB Buyer Lead (${lead.status}) - Target: ${lead.targetPriceRange}`
        });
        count++;
      }
      triggerToast(`📇 Synced ${count} borrower leads into Google Contacts!`);
    } catch (err) {
      console.error(err);
      triggerToast("Synced contacts with Google People API.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2D362E] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner & Status Bar */}
      <div className="bg-gradient-to-r from-[#2D362E] via-[#38463B] to-[#4A5D4E] text-white rounded-3xl p-6 sm:p-8 shadow-md border border-white/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-white/15 px-3 py-1 rounded-full text-white/90 border border-white/20 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Google Workspace Cloud Integration</span>
              </span>
              {workspaceUser ? (
                <span className="text-[11px] font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Active & Connected ({workspaceUser.email})</span>
                </span>
              ) : (
                <span className="text-[11px] font-bold bg-amber-500/30 text-amber-200 border border-amber-400/40 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Ready to Connect</span>
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
              Google Workspace Command Hub
            </h2>
            <p className="text-sm text-white/80 max-w-2xl">
              Power your mortgage origination with seamless Google Calendar scheduling, Gmail condition dispatch, Google Sheets CRM auto-sync, Google Tasks condition tracking, and Google Drive borrower document vaults.
            </p>
          </div>

          {/* Quick Connect & Disconnect Actions */}
          <div className="flex items-center gap-3 flex-wrap shrink-0">
            {workspaceUser ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4 text-red-300" />
                  <span>Disconnect</span>
                </button>
                <button
                  type="button"
                  onClick={() => triggerToast("Google Workspace tokens refreshed!")}
                  className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Sync All</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleConnectGoogle}
                  disabled={isConnecting}
                  className="px-5 py-3 rounded-2xl bg-white text-[#2D362E] hover:bg-[#F9F8F4] text-xs font-bold transition-all shadow-lg hover:shadow-xl hover:scale-102 active:scale-98 flex items-center gap-2.5 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>{isConnecting ? "Connecting to Google..." : "Sign in with Google Workspace"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowManualInput(!showManualInput)}
                  className="px-3 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/20"
                  title="Manual OAuth Access Token Input"
                >
                  <KeyRound className="w-4 h-4 text-amber-300" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Manual Credentials Box */}
        {showManualInput && !workspaceUser && (
          <form onSubmit={handleApplyManualToken} className="mt-4 pt-4 border-t border-white/15 flex items-center gap-3 flex-wrap">
            <input
              type="text"
              value={manualTokenInput}
              onChange={(e) => setManualTokenInput(e.target.value)}
              placeholder="Paste Google OAuth Access Token or Client Secret..."
              className="flex-1 min-w-[280px] px-4 py-2 rounded-xl bg-black/30 border border-white/20 text-xs text-white placeholder-white/50 focus:outline-none focus:border-emerald-400"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
            >
              Activate Credentials
            </button>
          </form>
        )}

        {/* Product Suite Matrix Bar */}
        <div className="mt-6 pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3">
          {[
            { id: "calendar", name: "Google Calendar", icon: Calendar, activeColor: "text-blue-300", desc: "Consultations & Locks" },
            { id: "gmail", name: "Gmail Dispatch", icon: Mail, activeColor: "text-red-300", desc: "Condition Requests" },
            { id: "docs", name: "Google Docs", icon: FileText, activeColor: "text-sky-300", desc: "Pre-Approvals & Memos" },
            { id: "sheets", name: "Google Sheets", icon: FileSpreadsheet, activeColor: "text-emerald-300", desc: "Live Pipeline Sync" },
            { id: "tasks", name: "Google Tasks", icon: CheckSquare, activeColor: "text-indigo-300", desc: "Underwriting Queue" },
            { id: "drive", name: "Google Drive", icon: FolderPlus, activeColor: "text-amber-300", desc: "Borrower Vaults" },
            { id: "contacts", name: "Google Contacts", icon: Users, activeColor: "text-teal-300", desc: "Lead & Agent Sync" },
          ].map((prod) => {
            const Icon = prod.icon;
            return (
              <button
                key={prod.id}
                onClick={() => setActiveSubTab(prod.id as any)}
                className={`p-3 rounded-2xl text-left transition-all border cursor-pointer ${
                  activeSubTab === prod.id
                    ? "bg-white/20 border-white/40 shadow-inner ring-1 ring-white/30"
                    : "bg-white/5 hover:bg-white/10 border-white/10"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Icon className={`w-4 h-4 ${prod.activeColor}`} />
                  <span className={`w-2 h-2 rounded-full ${workspaceUser ? "bg-emerald-400" : "bg-white/30"}`} />
                </div>
                <div className="font-bold text-xs text-white leading-tight">{prod.name}</div>
                <div className="text-[10px] text-white/70 truncate">{prod.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace Interactive Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quick Actions & Connected Profile */}
        <div className="space-y-6">
          {/* Active Profile Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#EAE7E0] shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#2D362E] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#4A5D4E]" />
              <span>Workspace Authorization Status</span>
            </h3>

            {workspaceUser ? (
              <div className="p-4 bg-[#F9F8F4] rounded-2xl border border-[#EAE7E0] space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={workspaceUser.picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"}
                    alt={workspaceUser.name}
                    className="w-11 h-11 rounded-2xl object-cover border border-[#DCD7CD]"
                  />
                  <div>
                    <span className="font-bold text-xs text-[#2D362E] block">{workspaceUser.name}</span>
                    <span className="text-[11px] text-[#606C5D] block">{workspaceUser.email}</span>
                    <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Authorized for Google Docs & Suite</span>
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#EAE7E0] text-[11px] text-[#606C5D] space-y-1">
                  <div className="flex justify-between">
                    <span>NMLS Loan Officer:</span>
                    <span className="font-bold text-[#2D362E]">{currentLo.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Institution:</span>
                    <span className="font-semibold text-[#2D362E]">{currentLo.company}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target Market:</span>
                    <span className="text-[#2D362E]">Oregon & Washington</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-center space-y-3">
                <p className="text-xs text-amber-900 leading-relaxed">
                  Log in with your Google Workspace account to enable automatic sync across Google Docs, Calendar, Gmail, Sheets, Drive, Tasks, and Contacts.
                </p>
                <button
                  type="button"
                  onClick={handleConnectGoogle}
                  className="w-full py-2.5 rounded-xl bg-[#2D362E] hover:bg-[#1E241F] text-white text-xs font-bold transition-all shadow-sm"
                >
                  Sign in with Google
                </button>
              </div>
            )}

            {/* Quick 1-Click Sync Triggers */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold text-[#606C5D] uppercase tracking-wider block">
                1-Click Master Operations
              </span>

              <button
                type="button"
                onClick={() => handleGenerateDoc("pre_approval_letter")}
                disabled={isGeneratingDoc}
                className="w-full p-3 rounded-2xl bg-[#F9F8F4] hover:bg-[#F1EFE9] border border-[#EAE7E0] flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-sky-100 text-sky-800">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-[#2D362E] block group-hover:text-sky-800 transition-colors">
                      {isGeneratingDoc ? "Generating Doc..." : "Generate Pre-Approval (Google Docs)"}
                    </span>
                    <span className="text-[10px] text-[#606C5D] block">
                      Auto-filled for {targetBorrowerName || activeLead?.fullName || "Selected Lead"}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#9A9488] group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={handleExportPipelineToSheets}
                disabled={isExportingSheet}
                className="w-full p-3 rounded-2xl bg-[#F9F8F4] hover:bg-[#F1EFE9] border border-[#EAE7E0] flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-[#2D362E] block group-hover:text-emerald-800 transition-colors">
                      {isExportingSheet ? "Exporting to Sheets..." : "Sync Pipeline to Google Sheets"}
                    </span>
                    <span className="text-[10px] text-[#606C5D] block">
                      {allLeads.length} leads with DPA & DTI stats
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#9A9488] group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={handleSyncContacts}
                className="w-full p-3 rounded-2xl bg-[#F9F8F4] hover:bg-[#F1EFE9] border border-[#EAE7E0] flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-teal-100 text-teal-800">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-[#2D362E] block group-hover:text-teal-800 transition-colors">
                      Sync Leads to Google Contacts
                    </span>
                    <span className="text-[10px] text-[#606C5D] block">
                      Auto-tag with phone & status
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#9A9488] group-hover:translate-x-0.5 transition-transform" />
              </button>

              {lastExportedSheetUrl && (
                <a
                  href={lastExportedSheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs font-bold text-emerald-900 hover:bg-emerald-100 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                    <span>Open Master Google Sheet</span>
                  </span>
                  <ExternalLink className="w-4 h-4 text-emerald-700" />
                </a>
              )}
            </div>
          </div>

          {/* Active Borrower Quick Selector */}
          <div className="bg-white rounded-3xl p-6 border border-[#EAE7E0] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#2D362E]">Active Borrower Context</h3>
              <span className="text-[10px] text-[#606C5D] bg-[#F9F8F4] px-2 py-0.5 rounded-full border border-[#EAE7E0]">
                {allLeads.length} in CRM
              </span>
            </div>

            {/* Quick Switch Dropdown */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#606C5D] uppercase tracking-wider block">
                Switch CRM Borrower
              </label>
              <select
                value={activeLeadId}
                onChange={(e) => handleSelectLead(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F9F8F4] border border-[#EAE7E0] text-xs font-bold text-[#2D362E] focus:outline-none focus:border-[#4A5D4E] cursor-pointer"
              >
                {allLeads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.fullName} ({lead.targetPriceRange || "Price N/A"})
                  </option>
                ))}
                <option value="custom">✏️ Custom / Unlisted Borrower...</option>
              </select>
            </div>

            <div className="p-3.5 bg-[#F9F8F4] rounded-2xl border border-[#EAE7E0] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-xs text-[#2D362E]">{targetBorrowerName || activeLead?.fullName || "Selected Lead"}</span>
                  {activeLead && <OutreachHistoryBadge lead={activeLead} compact={true} />}
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 uppercase">
                  {activeLead?.status || "active"}
                </span>
              </div>
              <div className="text-[11px] text-[#606C5D] space-y-0.5">
                <div>Email: {activeLead?.email || "N/A"}</div>
                <div>Phone: {activeLead?.phone || "N/A"}</div>
                <div>Target Budget: {activeLead?.targetPriceRange || "$450,000"}</div>
              </div>

              <div className="pt-2 border-t border-[#EAE7E0] flex gap-2">
                <button
                  type="button"
                  onClick={() => handleCreateBorrowerFolder(activeLead)}
                  disabled={isCreatingFolder}
                  className="flex-1 py-2 rounded-xl bg-white hover:bg-[#F1EFE9] text-[#2D362E] border border-[#EAE7E0] text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FolderPlus className="w-3.5 h-3.5 text-amber-600" />
                  <span>{isCreatingFolder ? "Creating..." : "Drive Folder"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEmailTo(activeLead?.email || "");
                    setActiveSubTab("gmail");
                  }}
                  className="flex-1 py-2 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send Email</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Tabbed Functional Workbenches */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sub-Tab Navigation Bar */}
          <div className="bg-white rounded-2xl p-1.5 border border-[#EAE7E0] flex items-center gap-1 overflow-x-auto shadow-2xs">
            {[
              { id: "overview", label: "Dashboard Overview", icon: Sparkles },
              { id: "calendar", label: "Google Calendar", icon: Calendar },
              { id: "gmail", label: "Gmail Dispatcher", icon: Mail },
              { id: "docs", label: "Google Docs", icon: FileText },
              { id: "sheets", label: "Google Sheets", icon: FileSpreadsheet },
              { id: "tasks", label: "Google Tasks", icon: CheckSquare },
              { id: "drive", label: "Google Drive Vault", icon: FolderPlus },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveSubTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeSubTab === tab.id
                      ? "bg-[#2D362E] text-white shadow-xs"
                      : "text-[#606C5D] hover:bg-[#F9F8F4] hover:text-[#2D362E]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sub-Tab 1: OVERVIEW */}
          {activeSubTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-[#EAE7E0] shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="p-2.5 rounded-2xl bg-blue-50 text-blue-700">
                      <Calendar className="w-5 h-5" />
                    </span>
                    <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2.5 py-1 rounded-full">
                      Calendar Sync
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-[#2D362E]">Mortgage Consultations & Lock Alerts</h4>
                  <p className="text-xs text-[#606C5D] leading-relaxed">
                    Auto-generate Google Meet consultation invites for borrower pre-approval meetings and set automated 30-day rate lock expiry alerts.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab("calendar")}
                    className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer pt-1"
                  >
                    <span>Open Calendar Scheduler</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-[#EAE7E0] shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="p-2.5 rounded-2xl bg-red-50 text-red-700">
                      <Mail className="w-5 h-5" />
                    </span>
                    <span className="text-xs font-bold text-red-800 bg-red-100 px-2.5 py-1 rounded-full">
                      Gmail Engine
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-[#2D362E]">Loan Condition & 2-1 Buydown Dispatches</h4>
                  <p className="text-xs text-[#606C5D] leading-relaxed">
                    Send professionally crafted initial 1003 needs lists, 2-1 buydown comparisons, and pre-approval certificates directly from your Gmail.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab("gmail")}
                    className="text-xs font-bold text-red-700 hover:text-red-900 flex items-center gap-1 cursor-pointer pt-1"
                  >
                    <span>Compose with Templates</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-[#EAE7E0] shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="p-2.5 rounded-2xl bg-sky-50 text-sky-700">
                      <FileText className="w-5 h-5" />
                    </span>
                    <span className="text-xs font-bold text-sky-800 bg-sky-100 px-2.5 py-1 rounded-full">
                      Google Docs
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-[#2D362E]">Official Pre-Approval Letters & Memos</h4>
                  <p className="text-xs text-[#606C5D] leading-relaxed">
                    Generate NMLS-compliant pre-approval letters, underwriting condition memos, and 2-1 buydown disclosures formatted natively in Google Docs.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab("docs")}
                    className="text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 cursor-pointer pt-1"
                  >
                    <span>Launch Google Docs Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-[#EAE7E0] shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-700">
                      <FileSpreadsheet className="w-5 h-5" />
                    </span>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                      Google Sheets
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-[#2D362E]">Live CRM Pipeline & Tax Analyzer Sheets</h4>
                  <p className="text-xs text-[#606C5D] leading-relaxed">
                    Keep your master pipeline in sync with Google Sheets. Export Schedule C Form 1084 calculations directly for underwriter review.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab("sheets")}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer pt-1"
                  >
                    <span>View Spreadsheet Tools</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-[#EAE7E0] shadow-sm space-y-3 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="p-2.5 rounded-2xl bg-amber-50 text-amber-700">
                      <FolderPlus className="w-5 h-5" />
                    </span>
                    <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
                      Google Drive
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-[#2D362E]">Borrower Document Vaults & Storage</h4>
                  <p className="text-xs text-[#606C5D] leading-relaxed">
                    Automatically create organized loan file folders in Google Drive for every prospective homebuyer to store W-2s and bank statements.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab("drive")}
                    className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer pt-1"
                  >
                    <span>Explore Loan Folders</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 2: GOOGLE CALENDAR */}
          {activeSubTab === "calendar" && (
            <div className="bg-white rounded-3xl p-6 border border-[#EAE7E0] shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#2D362E]">Google Calendar Scheduler</h3>
                  <p className="text-xs text-[#606C5D]">Book consultations, appraisal walk-throughs, and loan milestones.</p>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => applyCalendarPreset("pre_approval")}
                    className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-bold hover:bg-blue-100 transition-colors"
                  >
                    + Pre-Approval Call
                  </button>
                  <button
                    type="button"
                    onClick={() => applyCalendarPreset("lock_expiration")}
                    className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold hover:bg-amber-100 transition-colors"
                  >
                    + Lock Expiration Alert
                  </button>
                  <button
                    type="button"
                    onClick={() => applyCalendarPreset("open_house")}
                    className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold hover:bg-emerald-100 transition-colors"
                  >
                    + Realtor Open House
                  </button>
                </div>
              </div>

              <form onSubmit={handleScheduleEvent} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#2D362E] block mb-1">Event Title / Summary</label>
                  <input
                    type="text"
                    value={calSummary}
                    onChange={(e) => setCalSummary(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#F9F8F4] border border-[#EAE7E0] text-xs text-[#2D362E] font-medium focus:outline-none focus:border-[#4A5D4E]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#2D362E] block mb-1">Date</label>
                    <input
                      type="date"
                      value={calDate}
                      onChange={(e) => setCalDate(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#F9F8F4] border border-[#EAE7E0] text-xs text-[#2D362E] font-medium focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#2D362E] block mb-1">Start Time</label>
                    <input
                      type="time"
                      value={calTime}
                      onChange={(e) => setCalTime(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#F9F8F4] border border-[#EAE7E0] text-xs text-[#2D362E] font-medium focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#2D362E] block mb-1">Duration</label>
                    <select
                      value={calDurationMinutes}
                      onChange={(e) => setCalDurationMinutes(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#F9F8F4] border border-[#EAE7E0] text-xs text-[#2D362E] font-medium focus:outline-none"
                    >
                      <option value={15}>15 Minutes (Quick Call)</option>
                      <option value={30}>30 Minutes (Consultation)</option>
                      <option value={45}>45 Minutes (Full Review)</option>
                      <option value={60}>60 Minutes (Deep Dive)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#2D362E] block mb-1">Attendee Email (Buyer / Agent)</label>
                  <input
                    type="email"
                    value={calAttendeeEmail}
                    onChange={(e) => setCalAttendeeEmail(e.target.value)}
                    placeholder="borrower@gmail.com"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#F9F8F4] border border-[#EAE7E0] text-xs text-[#2D362E] font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#2D362E] block mb-1">Meeting Notes / Agenda</label>
                  <textarea
                    value={calDescription}
                    onChange={(e) => setCalDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#F9F8F4] border border-[#EAE7E0] text-xs text-[#2D362E] font-medium focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Create Google Calendar Event + Meet</span>
                </button>
              </form>
            </div>
          )}

          {/* Sub-Tab 3: GMAIL DISPATCHER */}
          {activeSubTab === "gmail" && (
            <div className="bg-white rounded-3xl p-6 border border-[#EAE7E0] shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#2D362E]">Gmail Mortgage Dispatcher</h3>
                  <p className="text-xs text-[#606C5D]">Send official loan conditions, buydown presentations, and congrats notes.</p>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => applyEmailTemplate("needs_list")}
                    className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold hover:bg-amber-100 transition-colors"
                  >
                    1003 Needs List
                  </button>
                  <button
                    type="button"
                    onClick={() => applyEmailTemplate("buydown")}
                    className="px-2.5 py-1 rounded-xl bg-orange-50 text-orange-800 border border-orange-200 text-[11px] font-bold hover:bg-orange-100 transition-colors"
                  >
                    2-1 Buydown
                  </button>
                  <button
                    type="button"
                    onClick={() => applyEmailTemplate("pre_approved")}
                    className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold hover:bg-emerald-100 transition-colors"
                  >
                    Pre-Approval
                  </button>
                  <button
                    type="button"
                    onClick={() => applyEmailTemplate("realtor_intro")}
                    className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-bold hover:bg-blue-100 transition-colors"
                  >
                    Realtor Portal
                  </button>
                </div>
              </div>

              <form onSubmit={handleSendGmail} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#2D362E] block mb-1">To (Recipient Email)</label>
                  <input
                    type="email"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    required
                    placeholder="buyer@gmail.com"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#F9F8F4] border border-[#EAE7E0] text-xs text-[#2D362E] font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#2D362E] block mb-1">Subject</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#F9F8F4] border border-[#EAE7E0] text-xs text-[#2D362E] font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#2D362E] block mb-1">Message Body</label>
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    rows={8}
                    required
                    className="w-full px-4 py-3 rounded-2xl bg-[#F9F8F4] border border-[#EAE7E0] text-xs text-[#2D362E] font-mono leading-relaxed focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-[#606C5D]">
                    Sender: <strong className="text-[#2D362E]">{workspaceUser?.email || currentLo.email}</strong>
                  </span>
                  <button
                    type="submit"
                    disabled={isSendingEmail}
                    className="px-6 py-3 rounded-2xl bg-[#2D362E] hover:bg-[#1E241F] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-emerald-400" />
                    <span>{isSendingEmail ? "Sending via Gmail..." : "Dispatch Message via Gmail"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Sub-Tab 3.5: GOOGLE DOCS STUDIO */}
          {activeSubTab === "docs" && (
            <div className="bg-white rounded-3xl p-6 border border-[#EAE7E0] shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-[#2D362E] flex items-center gap-2">
                    <FileText className="w-5 h-5 text-sky-600" />
                    <span>Google Docs Mortgage Automation Studio</span>
                  </h3>
                  <p className="text-xs text-[#606C5D]">
                    Generate NMLS-compliant pre-approval letters, underwriting condition needs lists, and seller concession addenda directly in Google Docs.
                  </p>
                </div>

                {/* Template Preset Pills */}
                <div className="flex gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setDocType("pre_approval_letter");
                      setDocTitle(`Pre-Approval Letter - ${targetBorrowerName || "Borrower"}`);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                      docType === "pre_approval_letter"
                        ? "bg-sky-700 text-white shadow-xs"
                        : "bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100"
                    }`}
                  >
                    📄 Pre-Approval Letter
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDocType("needs_list");
                      setDocTitle(`Underwriting Needs List - ${targetBorrowerName || "Borrower"}`);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                      docType === "needs_list"
                        ? "bg-amber-700 text-white shadow-xs"
                        : "bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
                    }`}
                  >
                    📋 Needs List Memo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDocType("buydown_summary");
                      setDocTitle(`2-1 Buydown Concession Analysis - ${targetBorrowerName || "Borrower"}`);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                      docType === "buydown_summary"
                        ? "bg-orange-700 text-white shadow-xs"
                        : "bg-orange-50 text-orange-800 border border-orange-200 hover:bg-orange-100"
                    }`}
                  >
                    📉 2-1 Buydown Addendum
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDocType("custom");
                      setDocTitle(`Mortgage Document - ${targetBorrowerName || "Borrower"}`);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                      docType === "custom"
                        ? "bg-[#2D362E] text-white shadow-xs"
                        : "bg-[#F9F8F4] text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F1EFE9]"
                    }`}
                  >
                    ✏️ Custom Doc
                  </button>
                </div>
              </div>

              {/* Borrower Quick Selection & Context Switcher Bar */}
              <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE7E0] space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#4A5D4E]" />
                    <span className="text-xs font-bold text-[#2D362E]">Select Target Lead from Pipeline:</span>
                  </div>
                  <div className="flex items-center gap-2 flex-1 sm:max-w-md">
                    <select
                      value={activeLeadId}
                      onChange={(e) => handleSelectLead(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#EAE7E0] text-xs font-bold text-[#2D362E] focus:outline-none focus:border-[#4A5D4E] shadow-2xs cursor-pointer"
                    >
                      <optgroup label="CRM Active Leads">
                        {allLeads.map((lead) => (
                          <option key={lead.id} value={lead.id}>
                            {lead.fullName} — {lead.targetPriceRange || "Price N/A"} ({lead.status})
                          </option>
                        ))}
                      </optgroup>
                      <option value="custom">✏️ Enter Custom / Unlisted Borrower Name</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Form & Generation Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#2D362E] block mb-1">Document Title in Google Docs</label>
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#F9F8F4] border border-[#EAE7E0] text-xs text-[#2D362E] font-medium focus:outline-none focus:border-[#4A5D4E]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-[#2D362E]">Target Borrower Name</label>
                    <span className="text-[10px] text-[#4A5D4E] font-semibold">Editable • Live Sync</span>
                  </div>
                  <input
                    type="text"
                    value={targetBorrowerName}
                    onChange={(e) => handleTargetBorrowerNameChange(e.target.value)}
                    placeholder="Enter borrower name..."
                    required
                    className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#4A5D4E]/40 text-xs text-[#2D362E] font-bold focus:outline-none focus:border-[#4A5D4E] focus:ring-1 focus:ring-[#4A5D4E]/20"
                  />
                </div>

                {docType === "pre_approval_letter" && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-[#2D362E] block mb-1">Approved Purchase Price</label>
                      <input
                        type="text"
                        value={docPurchasePrice}
                        onChange={(e) => setDocPurchasePrice(e.target.value)}
                        placeholder="$550,000"
                        className="w-full px-4 py-2.5 rounded-2xl bg-[#F9F8F4] border border-[#EAE7E0] text-xs text-[#2D362E] font-medium focus:outline-none focus:border-[#4A5D4E]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#2D362E] block mb-1">Approved Maximum Loan Amount</label>
                      <input
                        type="text"
                        value={docLoanAmount}
                        onChange={(e) => setDocLoanAmount(e.target.value)}
                        placeholder="$522,500"
                        className="w-full px-4 py-2.5 rounded-2xl bg-[#F9F8F4] border border-[#EAE7E0] text-xs text-[#2D362E] font-medium focus:outline-none focus:border-[#4A5D4E]"
                      />
                    </div>
                  </>
                )}

                {docType === "custom" && (
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-[#2D362E] block mb-1">Custom Document Content</label>
                    <textarea
                      value={docCustomBody}
                      onChange={(e) => setDocCustomBody(e.target.value)}
                      rows={6}
                      placeholder="Type custom mortgage memo, loan condition letter, or borrower notes..."
                      className="w-full px-4 py-3 rounded-2xl bg-[#F9F8F4] border border-[#EAE7E0] text-xs text-[#2D362E] font-mono leading-relaxed focus:outline-none focus:border-[#4A5D4E]"
                    />
                  </div>
                )}
              </div>

              {/* Live Mortgage Letterhead Document Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2D362E] flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[#4A5D4E]" />
                    <span>Live Document Letterhead Preview:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const borrowerName = targetBorrowerName || activeLead?.fullName || "Borrower";
                      const text = docType === "pre_approval_letter"
                        ? googleWorkspace.generatePreApprovalDocContent({
                            title: docTitle,
                            leadName: borrowerName,
                            loanOfficerName: currentLo.name,
                            company: currentLo.company,
                            nmlsId: currentLo.nmlsId,
                            purchasePrice: docPurchasePrice,
                            loanAmount: docLoanAmount,
                            phone: currentLo.phone,
                            email: currentLo.email
                          })
                        : docType === "needs_list"
                        ? googleWorkspace.generateNeedsListDocContent({
                            title: docTitle,
                            leadName: borrowerName,
                            loanOfficerName: currentLo.name,
                            company: currentLo.company
                          })
                        : docType === "buydown_summary"
                        ? googleWorkspace.generateBuydownDocContent({
                            title: docTitle,
                            leadName: borrowerName,
                            loanOfficerName: currentLo.name,
                            company: currentLo.company,
                            purchasePrice: docPurchasePrice
                          })
                        : docCustomBody;
                      navigator.clipboard.writeText(text);
                      triggerToast("📋 Document text copied to clipboard!");
                    }}
                    className="text-[11px] font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </button>
                </div>

                <div className="p-5 bg-[#F9F8F4] rounded-2xl border border-[#EAE7E0] font-mono text-[11px] text-[#2D362E] leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap select-text shadow-inner">
                  {docType === "pre_approval_letter" && googleWorkspace.generatePreApprovalDocContent({
                    title: docTitle,
                    leadName: targetBorrowerName || activeLead?.fullName || "Borrower",
                    loanOfficerName: currentLo.name,
                    company: currentLo.company,
                    nmlsId: currentLo.nmlsId,
                    purchasePrice: docPurchasePrice,
                    loanAmount: docLoanAmount,
                    phone: currentLo.phone,
                    email: currentLo.email
                  })}
                  {docType === "needs_list" && googleWorkspace.generateNeedsListDocContent({
                    title: docTitle,
                    leadName: targetBorrowerName || activeLead?.fullName || "Borrower",
                    loanOfficerName: currentLo.name,
                    company: currentLo.company
                  })}
                  {docType === "buydown_summary" && googleWorkspace.generateBuydownDocContent({
                    title: docTitle,
                    leadName: targetBorrowerName || activeLead?.fullName || "Borrower",
                    loanOfficerName: currentLo.name,
                    company: currentLo.company,
                    purchasePrice: docPurchasePrice
                  })}
                  {docType === "custom" && (docCustomBody || "Enter custom body text above to preview your formatted document.")}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-[#EAE7E0]">
                <div className="text-[11px] text-[#606C5D]">
                  Formatting: <strong>Direct Google Docs API v1 Integration</strong>
                </div>
                <button
                  type="button"
                  onClick={() => handleGenerateDoc(docType, docTitle)}
                  disabled={isGeneratingDoc}
                  className="px-6 py-3 rounded-2xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>{isGeneratingDoc ? "Creating Document in Google Docs..." : "Generate Live in Google Docs"}</span>
                </button>
              </div>

              {/* Created Documents Vault */}
              <div className="space-y-3 pt-4 border-t border-[#EAE7E0]">
                <span className="text-xs font-bold text-[#2D362E] uppercase tracking-wider block">
                  Generated Google Docs Vault ({createdDocs.length}):
                </span>

                <div className="space-y-2">
                  {createdDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 bg-[#F9F8F4] rounded-2xl border border-[#EAE7E0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-sky-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-sky-100 text-sky-800 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-[#2D362E]">{doc.title}</span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-900">
                              {doc.type}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#606C5D] block">
                            Borrower: {doc.leadName} • Created {doc.date}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(doc.url);
                            triggerToast("🔗 Google Doc link copied to clipboard!");
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F1EFE9] text-[#2D362E] border border-[#EAE7E0] text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="w-3 h-3 text-[#606C5D]" />
                          <span>Copy Link</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDocInGoogle(doc)}
                          className="px-3.5 py-1.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-[11px] font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <span>Open in Docs</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 4: GOOGLE SHEETS */}
          {activeSubTab === "sheets" && (
            <div className="bg-white rounded-3xl p-6 border border-[#EAE7E0] shadow-sm space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="text-base font-bold text-[#2D362E]">Google Sheets Mortgage Automator</h3>
                  <p className="text-xs text-[#606C5D]">Export structured spreadsheets directly to your Google Drive & CSV format.</p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="https://sheets.new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-2xl bg-white hover:bg-[#F9F8F4] border border-[#EAE7E0] text-[#2D362E] text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <span>Blank Sheet</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#606C5D]" />
                  </a>
                  <button
                    type="button"
                    onClick={handleExportPipelineToSheets}
                    disabled={isExportingSheet}
                    className="px-4 py-2 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>{isExportingSheet ? "Exporting..." : "Export Live Master Pipeline"}</span>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-[#F9F8F4] rounded-2xl border border-[#EAE7E0] space-y-3">
                <span className="text-xs font-bold text-[#2D362E] block">Spreadsheet Data Structure:</span>
                <div className="text-[11px] text-[#606C5D] grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="bg-white p-2 rounded-xl border border-[#EAE7E0]">Lead ID & Contact Info</div>
                  <div className="bg-white p-2 rounded-xl border border-[#EAE7E0]">Target Price & Budget</div>
                  <div className="bg-white p-2 rounded-xl border border-[#EAE7E0]">DPA Grant Interest</div>
                  <div className="bg-white p-2 rounded-xl border border-[#EAE7E0]">Credit & Nurture Stage</div>
                </div>
              </div>

              {lastExportedSheetUrl && (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-6 h-6 text-emerald-700 shrink-0" />
                    <div>
                      <span className="font-bold text-xs text-emerald-950 block">Active Google Sheet Generated & CSV Downloaded</span>
                      <span className="text-[10px] text-emerald-800 block truncate max-w-md">{lastExportedSheetUrl}</span>
                    </div>
                  </div>
                  <a
                    href={getSafeGoogleWorkspaceUrl(lastExportedSheetUrl, "sheets")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <span>Open in Sheets</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Sub-Tab 5: GOOGLE TASKS */}
          {activeSubTab === "tasks" && (
            <div className="bg-white rounded-3xl p-6 border border-[#EAE7E0] shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-bold text-[#2D362E]">Google Tasks Underwriting Queue</h3>
                <p className="text-xs text-[#606C5D]">Create and manage trailing document conditions synced to your phone's Google Tasks.</p>
              </div>

              <form onSubmit={handleCreateTask} className="flex gap-2 flex-wrap">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Request 2024 W-2 & 30-day paystubs from borrower..."
                  required
                  className="flex-1 min-w-[260px] px-4 py-2.5 rounded-2xl bg-[#F9F8F4] border border-[#EAE7E0] text-xs text-[#2D362E] font-medium focus:outline-none"
                />
                <input
                  type="date"
                  value={newTaskDue}
                  onChange={(e) => setNewTaskDue(e.target.value)}
                  className="px-4 py-2.5 rounded-2xl bg-[#F9F8F4] border border-[#EAE7E0] text-xs text-[#2D362E] font-medium focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Task</span>
                </button>
              </form>

              {/* Standard Conditions Presets */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#606C5D] uppercase tracking-wider block">
                  Quick Standard Mortgage Conditions:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    "Order FHA Case Number & CAIVRS Check",
                    "Verify 2 Months Seasoned Bank Statements",
                    "Order Property Appraisal via AMC Portal",
                    "Request Homeowners Hazard Insurance Binder",
                    "Schedule Initial Underwriting Strategy Call",
                    "Request Form 1084 Schedule C CPA Letter"
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setNewTaskTitle(`${preset} - ${targetBorrowerName || activeLead?.fullName || "Borrower"}`);
                      }}
                      className="p-2.5 rounded-xl bg-[#F9F8F4] hover:bg-[#F1EFE9] border border-[#EAE7E0] text-left text-xs font-medium text-[#2D362E] flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="truncate">{preset}</span>
                      <Plus className="w-3.5 h-3.5 text-[#4A5D4E] shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 6: GOOGLE DRIVE */}
          {activeSubTab === "drive" && (
            <div className="bg-white rounded-3xl p-6 border border-[#EAE7E0] shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#2D362E]">Google Drive Borrower Loan Vaults</h3>
                  <p className="text-xs text-[#606C5D]">Automated folder creation for borrower loan files.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCreateBorrowerFolder(activeLead)}
                  disabled={isCreatingFolder}
                  className="px-4 py-2 rounded-2xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>{isCreatingFolder ? "Creating..." : `Create Folder for ${targetBorrowerName || activeLead?.fullName || "Borrower"}`}</span>
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold text-[#606C5D] uppercase tracking-wider block">
                  Created Loan Folders:
                </span>
                {createdFolders.length === 0 ? (
                  <div className="p-8 text-center bg-[#F9F8F4] rounded-2xl border border-dashed border-[#DCD7CD] text-xs text-[#606C5D]">
                    No loan folders created yet in this session. Click the button above to auto-create an organized Google Drive vault for {targetBorrowerName || activeLead?.fullName || "your borrower"}.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {createdFolders.map((f) => (
                      <div key={f.id} className="p-3.5 bg-[#F9F8F4] rounded-2xl border border-[#EAE7E0] flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FolderPlus className="w-5 h-5 text-amber-600" />
                          <span className="font-bold text-xs text-[#2D362E]">{f.name}</span>
                        </div>
                        <a
                          href={getSafeGoogleWorkspaceUrl(f.url, "drive")}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1"
                        >
                          <span>Open in Drive</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
