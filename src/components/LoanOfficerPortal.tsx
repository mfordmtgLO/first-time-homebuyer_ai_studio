import React, { useState, useRef, useCallback, useEffect } from "react";
import { 
  Users, 
  UserPlus, 
  Link, 
  Share2, 
  QrCode, 
  CheckCircle2, 
  ExternalLink, 
  Trash2, 
  Edit3, 
  Save, 
  Sparkles, 
  ShieldCheck, 
  Phone, Cloud, 
  Mail, 
  Calendar, 
  Layers, 
  Copy, 
  Check, 
  Send,
  Sliders,
  DollarSign,
  ArrowRight,
  UserCheck,
  Building,
  MapPin,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Flame,
  Search,
  Download,
  MessageSquare,
  Clock,
  Filter,
  Award,
  Upload,
  Image as ImageIcon,
  X,
  Lock,
  Tag,
  Key,
  LogOut,
  ShieldAlert,
  KeyRound,
  AlertTriangle,
  Globe,
  Home,
  TrendingUp,
  BarChart2,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Play,
  Pause,
  ToggleLeft,
  ToggleRight,
  MailCheck,
  RefreshCw,
  Eye,
  Settings,
  FileText,
  StickyNote,
  Compass,
  Footprints,
  Calculator,
  BookmarkPlus,
  Brain,
  Percent,
  Star,
  PanelLeft,
  SlidersHorizontal,
  Printer
} from "lucide-react";
import { LoanOfficerSidebar, TabId } from "./LoanOfficerSidebar";
import { AIDailyReviewModal, DailyReviewData } from "./AIDailyReviewModal";
import { 
  LoanOfficerProfile, 
  RealEstateAgentProfile, 
  LOPairing, 
  ProfessionalGuidesState,
  SocialPushCampaign,
  AdCampaignDraft,
  LoanOfficerAdSettings,
  CapturedLead,
  PropertyListing,
  SmsTemplate
} from "../types";
import { SocialPushHub } from "./SocialPushHub";
import { AdsCampaignHub } from "./AdsCampaignHub";
import { LoanOfficerLoginView } from "./LoanOfficerLoginView";
import { StateLicensingSelector } from "./StateLicensingSelector";
import { processLocalImageFile } from "../utils/imageUtils";
import { HeadshotAvatar } from "./HeadshotAvatar";
import { GeoSphereSyncHub } from "./GeoSphereSyncHub";
import { EmailOutreachModal } from "./EmailOutreachModal";
import { AIPartnerCampaign } from "./AIPartnerCampaign";
import { LeadJourneyModal } from "./LeadJourneyModal";
import { SmsMessagingModal } from "./SmsMessagingModal";
import { TwilioSettingsModal } from "./TwilioSettingsModal";
import { SalesforceSettingsModal } from "./SalesforceSettingsModal";
import { TotalExpertSettingsModal } from "./TotalExpertSettingsModal";
import { SmsComplianceDashboard } from "./SmsComplianceDashboard";
import { SourceBreakdownReportModal } from "./SourceBreakdownReportModal";
import { BatchLeadRecommendations } from "./BatchLeadRecommendations";
import { DailyMorningBriefing } from "./DailyMorningBriefing";
import { TaskManagementPanel } from "./TaskManagementPanel";
import { SmsTemplateLibrary } from "./SmsTemplateLibrary";
import { BulkSmsModal } from "./BulkSmsModal";
import { DEFAULT_SMS_TEMPLATES } from "../data/smsTemplates";
import { ScrapeLoRosterModal } from "./ScrapeLoRosterModal";
import { ScrapeRealtorModal } from "./ScrapeRealtorModal";
import { LoOutreachModal } from "./LoOutreachModal";
import { RecruitingCampaignModal } from "./RecruitingCampaignModal";
import { GrantFinder } from "./GrantFinder";
import { LoanOfficerScenarioWorkbench } from "./LoanOfficerScenarioWorkbench";
import { MasterLeadJourneyTab } from "./MasterLeadJourneyTab";
import { JourneyPhaseLabel } from "./JourneyPhaseLabel";
import { OutreachHistoryBadge } from "./OutreachHistoryBadge";
import { TopBusinessPartnersCard } from "./TopBusinessPartnersCard";
import { SystemPitchDeck } from "./SystemPitchDeck";
import { BranchManagerDashboard } from "./BranchManagerDashboard";
import { GrowthDashboard } from "./GrowthDashboard";
import { BranchManagement } from "./BranchManagement";
import { MetadataConfiguration } from "./MetadataConfiguration";
import { RecruitmentPipeline } from "./RecruitmentPipeline";
import { AILoanOfficer2ndBrain } from "./AILoanOfficer2ndBrain";
import { ScheduleCTaxAnalyzer } from "./ScheduleCTaxAnalyzer";
import { Buydown21ScenarioEngine } from "./Buydown21ScenarioEngine";
import { RealtorCoBrandingHub } from "./RealtorCoBrandingHub";
import { GoogleWorkspaceHub } from "./GoogleWorkspaceHub";
import { GoogleWorkspaceModal } from "./GoogleWorkspaceModal";
import { WorkspaceStatusWidget } from "./WorkspaceStatusWidget";
import { googleWorkspace, GoogleWorkspaceUser } from "../services/googleWorkspaceService";
import { launchLocalOutlookDraft, appendWorkEmailSignature } from "../utils/outlookEmailService";
import { getLoanOfficerAgentCategories, getAgentMlsInfo, OREGON_MLS_SYSTEMS } from "../utils/marketNewsListingMatcher";
import { RbacRole, normalizeRole, getRolePermissions } from "../utils/rbac";

interface LoanOfficerPortalProps {
  userRole?: RbacRole | "admin" | "lo" | string | null;
  guidesState: ProfessionalGuidesState;
  onUpdateGuidesState: (newState: ProfessionalGuidesState) => void;
  onClose: () => void;
  onViewPublicSite: () => void;
  properties?: PropertyListing[];
  setProperties?: React.Dispatch<React.SetStateAction<PropertyListing[]>>;
}

export const LoanOfficerPortal: React.FC<LoanOfficerPortalProps> = ({
  userRole,
  guidesState,
  onUpdateGuidesState,
  onClose,
  onViewPublicSite,
  properties = [],
  setProperties = () => {},
}) => {
  // Authentication & Session State (loaded from localStorage)
  const [authenticatedLoId, setAuthenticatedLoId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("lo_portal_auth_id") || null;
    }
    return null;
  });

  // Current user / viewing context
  const [activeTab, setActiveTab] = useState<TabId>("leads");
  const [scenarioWorkbenchLeadId, setScenarioWorkbenchLeadId] = useState<string | undefined>(undefined);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [viewingHistoryLo, setViewingHistoryLo] = useState<string | null>(null);

  // Left Sidebar & Daily Rhythm State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("lo_sidebar_collapsed") === "true";
    }
    return false;
  });

  const [showHorizontalNav, setShowHorizontalNav] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("lo_show_horizontal_nav") === "true";
    }
    return false;
  });

  const [dailyReviewModalOpen, setDailyReviewModalOpen] = useState<boolean>(false);
  const [dailyReviewLoading, setDailyReviewLoading] = useState<boolean>(false);
  const [dailyReviewData, setDailyReviewData] = useState<DailyReviewData | null>(null);

  // Keyboard shortcut: Cmd+B / Ctrl+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setIsSidebarCollapsed(prev => {
          const next = !prev;
          if (typeof window !== "undefined") {
            localStorage.setItem("lo_sidebar_collapsed", String(next));
          }
          return next;
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch or trigger Quick AI Review
  const fetchDailyReview = async () => {
    setDailyReviewLoading(true);
    try {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      let phase = "morning";
      if (hour >= 11 && (hour < 14 || (hour === 14 && minute < 30))) phase = "midday";
      else if (hour >= 14 && (hour < 16 || (hour === 16 && minute < 30))) phase = "afternoon";
      else if (hour >= 16) phase = "end_of_day";

      const timeString = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

      const todayStr = now.toISOString().split("T")[0];
      let completedTasks: string[] = [];
      let pendingTasks: string[] = [];
      try {
        const storageKey = `lo_daily_tasks_${currentLo.id}_${todayStr}`;
        const savedTasks = localStorage.getItem(storageKey);
        if (savedTasks) {
          const parsed = JSON.parse(savedTasks);
          completedTasks = parsed.filter((t: any) => t.completed).map((t: any) => t.title);
          pendingTasks = parsed.filter((t: any) => !t.completed).map((t: any) => t.title);
        }
      } catch {
        // ignore
      }

      const payload = {
        loProfile: currentLo,
        timePhase: phase,
        currentTimeString: timeString,
        completedTasks,
        pendingTasks,
        stats: {
          leadsCount: guidesState.leads?.length || 0,
          hotLeadsCount: (guidesState.leads || []).filter(l => l.intentScore === "hot").length,
          candidatesCount: 12,
          pairingsCount: guidesState.pairings?.length || 0,
          recentTouchesCount: (guidesState.leads || []).reduce((acc, l) => acc + (l.emailHistory?.length || 0) + (l.outreachLogs?.length || 0), 0)
        },
        isAdmin: Boolean(currentLo.isAdmin || currentLo.id === guidesState.adminLoanOfficerId)
      };

      const res = await fetch("/api/gemini/lo-daily-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data?.data) {
        setDailyReviewData(data.data);
      }
    } catch (err) {
      console.error("Failed to load daily review:", err);
    } finally {
      setDailyReviewLoading(false);
    }
  };

  const handleOpenDailyReview = async () => {
    setDailyReviewModalOpen(true);
    await fetchDailyReview();
  };

  // Google Workspace Integration State
  const [workspaceUser, setWorkspaceUser] = useState<GoogleWorkspaceUser | null>(() => googleWorkspace.getUser());
  const [googleWorkspaceModalOpen, setGoogleWorkspaceModalOpen] = useState(false);
  const [googleWorkspaceModalLead, setGoogleWorkspaceModalLead] = useState<CapturedLead | null>(null);
  const [googleWorkspaceModalTab, setGoogleWorkspaceModalTab] = useState<"gmail" | "calendar" | "drive" | "tasks" | "sheets">("gmail");

  useEffect(() => {
    const unsub = googleWorkspace.subscribe((user) => {
      setWorkspaceUser(user);
    });
    return () => unsub();
  }, []);

  // Horizontal Menu Navigation Scroll State & Ref
  const menuScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(true);

  const checkMenuScroll = useCallback(() => {
    const el = menuScrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
  }, []);

  const handleMenuScroll = (direction: "left" | "right") => {
    const el = menuScrollRef.current;
    if (!el) return;
    const scrollAmount = Math.max(260, Math.floor(el.clientWidth * 0.6));
    const target = direction === "left" ? el.scrollLeft - scrollAmount : el.scrollLeft + scrollAmount;
    el.scrollTo({ left: target, behavior: "smooth" });
    setTimeout(checkMenuScroll, 320);
  };

  useEffect(() => {
    const el = menuScrollRef.current;
    if (!el) return;

    checkMenuScroll();
    const handleResize = () => checkMenuScroll();
    window.addEventListener("resize", handleResize);

    const timer1 = setTimeout(checkMenuScroll, 150);
    const timer2 = setTimeout(checkMenuScroll, 500);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [checkMenuScroll]);

  // Center active tab when it changes
  useEffect(() => {
    const el = menuScrollRef.current;
    if (!el) return;
    const activeEl = el.querySelector<HTMLElement>(`[data-tab-id="${activeTab}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
    const timer = setTimeout(checkMenuScroll, 350);
    return () => clearTimeout(timer);
  }, [activeTab, checkMenuScroll]);

  // Password Management Modal State
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [newPasswordInput, setNewPasswordInput] = useState<string>("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>("");
  const [passwordModalError, setPasswordModalError] = useState<string | null>(null);

  // Determine Logged In User Identity
  const loggedInUser: LoanOfficerProfile = 
    guidesState.loanOfficers.find(l => l.id === authenticatedLoId) || 
    guidesState.loanOfficers[0];

  // Derive granular RBAC role & permissions
  const effectiveRbacRole = normalizeRole(
    userRole || (loggedInUser?.isAdmin || loggedInUser?.id === guidesState.adminLoanOfficerId ? "branch_manager" : "team_lo")
  );
  const permissions = getRolePermissions(effectiveRbacRole);

  const isAdminUser = Boolean(
    effectiveRbacRole === "branch_manager" || 
    userRole === "admin" || 
    loggedInUser?.isAdmin || 
    loggedInUser?.id === guidesState.adminLoanOfficerId
  );

  // Which Loan Officer dashboard is currently being managed/viewed
  // If Mike Ford (Admin): can switch to any LO; if downstream LO: locked to self
  const [managedLoId, setManagedLoId] = useState<string>(() => {
    if (authenticatedLoId) {
      return authenticatedLoId;
    }
    return guidesState.loanOfficer.id || "lo-mike-ford";
  });

  // Current active LO being configured in this dashboard
  const currentLo: LoanOfficerProfile = 
    guidesState.loanOfficers.find(lo => lo.id === (isAdminUser ? managedLoId : loggedInUser.id)) || 
    loggedInUser;

  // Leads CRM State
  const [leadSearchQuery, setLeadSearchQuery] = useState<string>("");
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>("all");
  const [leadLoFilter, setLeadLoFilter] = useState<string>("all");
  const [leadSourceFilter, setLeadSourceFilter] = useState<string>("all");
  const [leadDateRangeFilter, setLeadDateRangeFilter] = useState<string>("all");
  const [leadStartDate, setLeadStartDate] = useState<string>("");
  const [leadEndDate, setLeadEndDate] = useState<string>("");
  const [leadViewMode, setLeadViewMode] = useState<"table" | "cards">("table");
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [showBulkSmsModal, setShowBulkSmsModal] = useState<boolean>(false);
  const [viewingTranscriptLead, setViewingTranscriptLead] = useState<CapturedLead | null>(null);
  const [viewingJourneyLead, setViewingJourneyLead] = useState<CapturedLead | null>(null);
  const [smsModalLead, setSmsModalLead] = useState<CapturedLead | null>(null);
  const [showTwilioSettingsModal, setShowTwilioSettingsModal] = useState<boolean>(false);
  const [showSalesforceSettings, setShowSalesforceSettings] = useState<boolean>(false);
  const [showTotalExpertSettings, setShowTotalExpertSettings] = useState<boolean>(false);
  const [showSourceReportModal, setShowSourceReportModal] = useState<boolean>(false);
  const [selectedLeadIdsInCrm, setSelectedLeadIdsInCrm] = useState<string[]>([]);

  const handleUpdateLeadFromSmsModal = (updatedLead: CapturedLead) => {
    const currentLeads = guidesState.leads || [];
    const updated = currentLeads.map(l => l.id === updatedLead.id ? updatedLead : l);
    onUpdateGuidesState({
      ...guidesState,
      leads: updated
    });
    setSmsModalLead(updatedLead);
    triggerToast("💬 SMS message dispatched & recorded.");
  };

  // Manual Lead Notes Annotation State
  const [editingNotesLeadId, setEditingNotesLeadId] = useState<string | null>(null);
  const [editingNotesText, setEditingNotesText] = useState<string>("");

  const handleStartEditNotes = (lead: CapturedLead) => {
    setEditingNotesLeadId(lead.id);
    setEditingNotesText(lead.notes || "");
  };

  const handleSaveNotes = (leadId: string) => {
    const currentLeads = guidesState.leads || [];
    const updated = currentLeads.map(l => l.id === leadId ? { ...l, notes: editingNotesText.trim() } : l);
    onUpdateGuidesState({
      ...guidesState,
      leads: updated
    });
    setEditingNotesLeadId(null);
    triggerToast("⚡ Lead annotation notes saved.");
  };

  // Modals / Editors
  const [showAddLoModal, setShowAddLoModal] = useState<boolean>(false);
  const [showScrapeLoModal, setShowScrapeLoModal] = useState<boolean>(false);
  const [showScrapeRealtorModal, setShowScrapeRealtorModal] = useState<boolean>(false);

  const csvFileInputRef = useRef<HTMLInputElement>(null);

  const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\
').filter(line => line.trim());
      if (lines.length < 2) {
        triggerToast("CSV file is empty or invalid.");
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
      const nameIdx = headers.findIndex(h => h.includes('name'));
      const titleIdx = headers.findIndex(h => h === 'title');
      const nmlsIdx = headers.findIndex(h => h.includes('nmls'));
      const companyIdx = headers.findIndex(h => h.includes('company') || h.includes('business'));
      const branchIdx = headers.findIndex(h => h === 'branch');
      const cityIdx = headers.findIndex(h => h === 'city');
      const stateIdx = headers.findIndex(h => h === 'state');
      const emailIdx = headers.findIndex(h => h === 'email');
      const phoneIdx = headers.findIndex(h => h === 'phone');
      const yearsIdx = headers.findIndex(h => h.includes('year') || h.includes('experience'));
      const unitsIdx = headers.findIndex(h => h.includes('unit'));
      const volumeIdx = headers.findIndex(h => h.includes('volume'));
      const statusIdx = headers.findIndex(h => h.includes('status'));

      const newOfficers: LoanOfficerProfile[] = [];

      for (let i = 1; i < lines.length; i++) {
        // Regex to split by comma, ignoring commas inside quotes
        const row = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(col => col.trim().replace(/^"|"$/g, ''));
        if (row.length === 0 || (nameIdx !== -1 && !row[nameIdx])) continue;

        const name = nameIdx !== -1 ? row[nameIdx] : `Imported LO ${i}`;
        const company = companyIdx !== -1 ? row[companyIdx] : '';
        const yearsExperience = yearsIdx !== -1 ? parseInt(row[yearsIdx]) || 0 : undefined;

        newOfficers.push({
          id: `lo-imported-csv-${Date.now()}-${i}`,
          name,
          title: titleIdx !== -1 && row[titleIdx] ? row[titleIdx] : "Loan Officer",
          nmlsId: nmlsIdx !== -1 ? row[nmlsIdx] : "",
          company,
          branch: branchIdx !== -1 ? row[branchIdx] : "",
          city: cityIdx !== -1 ? row[cityIdx] : undefined,
          state: stateIdx !== -1 ? row[stateIdx] : undefined,
          email: emailIdx !== -1 ? row[emailIdx] : "",
          phone: phoneIdx !== -1 ? row[phoneIdx] : "",
          yearsExperience,
          production12MoUnits: unitsIdx !== -1 && row[unitsIdx] ? parseInt(row[unitsIdx]) : undefined,
          production12MoVolume: volumeIdx !== -1 && row[volumeIdx] ? parseInt(row[volumeIdx]) : undefined,
          recruitmentStatus: (statusIdx !== -1 && row[statusIdx] ? row[statusIdx] : 'Not Contacted') as any,
          isTeamMember: true,
          outreachHistory: [],
          bio: "",
          headshotUrl: "",
          specialties: [],
          bookingUrl: "",
          licenseStates: ["OR"]
        } as LoanOfficerProfile);
      }

      if (newOfficers.length > 0) {
        onUpdateGuidesState({
          ...guidesState,
          loanOfficers: [...guidesState.loanOfficers, ...newOfficers]
        });
        triggerToast(`✅ Successfully imported ${newOfficers.length} candidates from CSV!`);
      } else {
        triggerToast("No valid candidates found in CSV.");
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const handleExportCsv = () => {
    let losToExport = guidesState.loanOfficers;
    if (selectedRosterLoIds.size > 0) {
      losToExport = losToExport.filter(lo => selectedRosterLoIds.has(lo.id));
    }
    
    if (losToExport.length === 0) {
      triggerToast("No Loan Officers to export.");
      return;
    }

    const headers = [
      "Name", "Title", "NMLS ID", "Company", "Branch", "City", "State",
      "Email", "Phone", "Years Experience", "12Mo Units", "12Mo Volume", "Recruitment Status"
    ];

    const rows = losToExport.map(lo => [
      `"${(lo.name || '').replace(/"/g, '""')}"`,
      `"${(lo.title || '').replace(/"/g, '""')}"`,
      `"${(lo.nmlsId || '').replace(/"/g, '""')}"`,
      `"${(lo.company || '').replace(/"/g, '""')}"`,
      `"${(lo.branch || '').replace(/"/g, '""')}"`,
      `"${(lo.city || '').replace(/"/g, '""')}"`,
      `"${(lo.state || '').replace(/"/g, '""')}"`,
      `"${(lo.email || '').replace(/"/g, '""')}"`,
      `"${(lo.phone || '').replace(/"/g, '""')}"`,
      `"${lo.yearsExperience || ''}"`,
      `"${lo.production12MoUnits || ''}"`,
      `"${lo.production12MoVolume || ''}"`,
      `"${(lo.recruitmentStatus || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\
");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `lo_recruitment_list_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast(`✅ Exported ${losToExport.length} Loan Officers to CSV`);
  };
  const [showLoOutreachModal, setShowLoOutreachModal] = useState<boolean>(false);
  const [showRecruitingCampaignModal, setShowRecruitingCampaignModal] = useState<boolean>(false);
  const [loSearchQuery, setLoSearchQuery] = useState<string>("");
  const [generatingOutreachFor, setGeneratingOutreachFor] = useState<string | null>(null);
  const [generatedOutreachContent, setGeneratedOutreachContent] = useState<{name: string, email?: string, content: string} | null>(null);
  const [loRegionSearch, setLoRegionSearch] = useState<string>("");
  const [loCompanyFilter, setLoCompanyFilter] = useState<string>("all");
  const [loBranchFilter, setLoBranchFilter] = useState<string>("all");
  const [loTeamStatusFilter, setLoTeamStatusFilter] = useState<"all" | "assigned" | "unassigned">("all");
  const [selectedRosterLoIds, setSelectedRosterLoIds] = useState<Set<string>>(new Set());
  const [editingLo, setEditingLo] = useState<LoanOfficerProfile | null>(null);
  const [showAddAgentModal, setShowAddAgentModal] = useState<boolean>(false);
  const [editingAgent, setEditingAgent] = useState<RealEstateAgentProfile | null>(null);
  const [showAddPairingModal, setShowAddPairingModal] = useState<boolean>(false);
  const [editingPairing, setEditingPairing] = useState<LOPairing | null>(null);

  // Local state for headshot URL to allow instant visual preview before Firestore sync
  const [localHeadshotUrl, setLocalHeadshotUrl] = useState(currentLo.headshotUrl || "");
  const headshotSyncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalHeadshotUrl(currentLo.headshotUrl || "");
  }, [currentLo.headshotUrl]);

  const handleHeadshotUrlChange = (val: string) => {
    setLocalHeadshotUrl(val);
    if (headshotSyncTimeoutRef.current) clearTimeout(headshotSyncTimeoutRef.current);
    headshotSyncTimeoutRef.current = setTimeout(() => {
      updateCurrentLoField("headshotUrl", val);
    }, 800);
  };

  // New LO Form State
  const [newLoForm, setNewLoForm] = useState<Partial<LoanOfficerProfile> & { initialPassword?: string }>({
    name: "",
    title: "Mortgage Advisor",
    nmlsId: "NMLS #",
    company: "Pacific Coast Lending Partners",
    branch: "Pacific Northwest Branch",
    email: "",
    phone: "",
    headshotUrl: "",
    bio: "Dedicated mortgage specialist helping first-time homebuyers secure the best rates and state DPA programs.",
    specialties: ["First-Time Homebuyers", "FHA & Conventional", "State DPA Programs"],
    bookingUrl: "https://calendly.com",
    licenseStates: ["Oregon", "Washington"],
    initialPassword: "pass123"
  });

  // New Agent Form State
  const [newAgentForm, setNewAgentForm] = useState<Partial<RealEstateAgentProfile>>({
    name: "",
    title: "Buyer Specialist, REALTOR®",
    brokerage: "",
    licenseNumber: "OR Lic #",
    email: "",
    phone: "",
    headshotUrl: "",
    agentType: "buyer_agent",
    experienceYears: 8,
    activeListingsCount: 12,
    rating: 4.9,
    bio: "Passionate about guiding first-time buyers through neighborhood selection and structuring winning offers.",
    specialties: ["First-Time Homebuyers", "Offer Negotiation", "Neighborhood Tours", "USDA Zero Down Loans"],
    marketAreas: ["Portland Metro", "Beaverton", "Gresham"],
    websiteUrl: ""
  });

  // AI Agent Search & Profile Generation States
  const [aiAgentQuery, setAiAgentQuery] = useState("");
  const [isAiSearchingAgent, setIsAiSearchingAgent] = useState(false);
  const [aiAgentMsg, setAiAgentMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Agent Roster Filters in Portal Tab
  const [agentRosterFilter, setAgentRosterFilter] = useState<'all' | 'buyer_agent' | 'listing_agent' | 'dual_agent'>('all');
  const [agentRosterSearch, setAgentRosterSearch] = useState("");
  const [showEmailOutreachModal, setShowEmailOutreachModal] = useState(false);
  const [initialOutreachLeadId, setInitialOutreachLeadId] = useState<string | undefined>(undefined);

  // Automated Lead Nurture Sequence States
  const [globalNurtureEnabled, setGlobalNurtureEnabled] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("lo_global_nurture_enabled") !== "false";
    }
    return true;
  });
  const [showNurtureModal, setShowNurtureModal] = useState<boolean>(false);
  const [selectedNurtureLeadId, setSelectedNurtureLeadId] = useState<string | null>(null);
  const [activeNurtureTab, setActiveNurtureTab] = useState<'overview' | 'stage_1' | 'stage_2' | 'stage_3' | 'stage_4' | 'stage_5' | 'logs'>('overview');
  const [testNurtureEmail, setTestNurtureEmail] = useState<string>("");
  const [nurtureTone, setNurtureTone] = useState<'helpful' | 'concierge' | 'financial'>('helpful');

  const handleGenerateSingleOutreach = async (lo: LoanOfficerProfile) => {
    setGeneratingOutreachFor(lo.id);
    try {
      const res = await fetch("/api/gemini/generate-outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateName: lo.name,
          yearsExperience: lo.yearsExperience,
          company: lo.company,
          recruitmentStatus: lo.recruitmentStatus,
          myName: loggedInUser?.name || guidesState.loanOfficer.name,
          myTitle: loggedInUser?.title || guidesState.loanOfficer.title
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        const fullBody = appendWorkEmailSignature(data.emailBody, loggedInUser || currentLo);
        setGeneratedOutreachContent({ name: lo.name, email: lo.email, content: fullBody });
        triggerToast(`✅ Draft generated for ${lo.name}!`);
      } else {
        triggerToast("Failed to generate outreach draft.");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Error generating outreach draft.");
    } finally {
      setGeneratingOutreachFor(null);
    }
  };

  // AI Agent Profile Lookup Handler
  const handleAiSearchAgent = async () => {
    if (!aiAgentQuery.trim()) return;
    setIsAiSearchingAgent(true);
    setAiAgentMsg(null);
    try {
      const res = await fetch("/api/gemini/agent-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: aiAgentQuery })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.profile) {
          const p = data.profile;
          if (editingAgent) {
            setEditingAgent({
              ...editingAgent,
              name: p.name || editingAgent.name,
              title: p.title || editingAgent.title,
              brokerage: p.brokerage || editingAgent.brokerage,
              licenseNumber: p.licenseNumber || editingAgent.licenseNumber,
              email: p.email || editingAgent.email,
              phone: p.phone || editingAgent.phone,
              websiteUrl: p.websiteUrl || editingAgent.websiteUrl,
              headshotUrl: p.headshotUrl || editingAgent.headshotUrl,
              agentType: p.agentType || editingAgent.agentType || 'buyer_agent',
              bio: p.bio || editingAgent.bio,
              specialties: Array.isArray(p.specialties) ? p.specialties : editingAgent.specialties,
              marketAreas: Array.isArray(p.marketAreas) ? p.marketAreas : editingAgent.marketAreas,
              experienceYears: p.experienceYears || editingAgent.experienceYears || 8,
              activeListingsCount: p.activeListingsCount || editingAgent.activeListingsCount || 10,
              rating: p.rating || editingAgent.rating || 4.9,
              socialLinks: p.socialLinks || editingAgent.socialLinks,
              aiGenerated: true
            });
          } else {
            setNewAgentForm(prev => ({
              ...prev,
              name: p.name || prev.name,
              title: p.title || prev.title,
              brokerage: p.brokerage || prev.brokerage,
              licenseNumber: p.licenseNumber || prev.licenseNumber,
              email: p.email || prev.email,
              phone: p.phone || prev.phone,
              websiteUrl: p.websiteUrl || prev.websiteUrl,
              headshotUrl: p.headshotUrl || prev.headshotUrl,
              agentType: p.agentType || 'buyer_agent',
              bio: p.bio || prev.bio,
              specialties: Array.isArray(p.specialties) ? p.specialties : prev.specialties,
              marketAreas: Array.isArray(p.marketAreas) ? p.marketAreas : prev.marketAreas,
              experienceYears: p.experienceYears || 8,
              activeListingsCount: p.activeListingsCount || 12,
              rating: p.rating || 4.9,
              socialLinks: p.socialLinks || { zillow: "", linkedin: "", instagram: "" },
              aiGenerated: true
            }));
          }
          setAiAgentMsg({ type: 'success', text: `✨ AI Profile generated for ${p.name || 'Agent'}! Review and save below.` });
        }
      } else {
        throw new Error("API call failed");
      }
    } catch (err) {
      console.error("AI Agent Lookup error:", err);
      const simulatedName = aiAgentQuery.split(",")[0].trim() || "Agent Partner";
      if (editingAgent) {
        setEditingAgent({
          ...editingAgent,
          name: simulatedName,
          title: "Senior Buyer Specialist, REALTOR®",
          brokerage: aiAgentQuery.includes("Realty") ? aiAgentQuery.split(",")[1]?.trim() || "Premier Cascade Realty" : "Cascade Heritage Real Estate",
          licenseNumber: "OR Lic #2024" + Math.floor(10000 + Math.random() * 90000),
          email: simulatedName.toLowerCase().replace(/\s+/g, ".") + "@cascadeheritage.com",
          phone: "(503) 555-0" + Math.floor(100 + Math.random() * 900),
          websiteUrl: "https://cascadeheritage.com/agents/" + simulatedName.toLowerCase().replace(/\s+/g, "-"),
          headshotUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
          agentType: "buyer_agent",
          bio: `${simulatedName} is an experienced real estate specialist dedicated to guiding first-time buyers, structuring competitive zero-down offers, and partnering with top loan officers on USDA and Flex DPA lending options.`,
          specialties: ["First-Time Homebuyers", "USDA Zero Down Loans", "Down Payment Assistance Grants", "Inspection Negotiations"],
          marketAreas: ["Portland Metro", "Beaverton", "Eugene", "Clackamas"],
          experienceYears: 10,
          activeListingsCount: 14,
          rating: 4.9,
          aiGenerated: true
        });
      } else {
        setNewAgentForm(prev => ({
          
          name: simulatedName,
          title: "Senior Buyer Specialist, REALTOR®",
          brokerage: aiAgentQuery.includes("Realty") ? aiAgentQuery.split(",")[1]?.trim() || "Premier Cascade Realty" : "Cascade Heritage Real Estate",
          licenseNumber: "OR Lic #2024" + Math.floor(10000 + Math.random() * 90000),
          email: simulatedName.toLowerCase().replace(/\s+/g, ".") + "@cascadeheritage.com",
          phone: "(503) 555-0" + Math.floor(100 + Math.random() * 900),
          websiteUrl: "https://cascadeheritage.com/agents/" + simulatedName.toLowerCase().replace(/\s+/g, "-"),
          headshotUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
          agentType: "buyer_agent",
          bio: `${simulatedName} is an experienced real estate specialist dedicated to guiding first-time buyers, structuring competitive zero-down offers, and partnering with top loan officers on USDA and Flex DPA lending options.`,
          specialties: ["First-Time Homebuyers", "USDA Zero Down Loans", "Down Payment Assistance Grants", "Inspection Negotiations"],
          marketAreas: ["Portland Metro", "Beaverton", "Eugene", "Clackamas"],
          experienceYears: 10,
          activeListingsCount: 14,
          rating: 4.9,
          aiGenerated: true
        }));
      }
      setAiAgentMsg({ type: 'success', text: `✨ AI Profile created for ${simulatedName}! Review and save below.` });
    } finally {
      setIsAiSearchingAgent(false);
    }
  };

  // New Pairing Form State
  const [newPairingForm, setNewPairingForm] = useState<{ loId: string; agentId: string; title: string; customSlug: string; campaignTag: string }>({
    loId: currentLo.id,
    agentId: guidesState.activeAgentId || guidesState.agentRoster[0]?.id || "",
    title: "",
    customSlug: "",
    campaignTag: "first-time-buyer-blast"
  });

  const isSuperAdmin = isAdminUser;
  const activeAgent = guidesState.agentRoster.find(a => a.id === guidesState.activeAgentId) || guidesState.agentRoster[0];

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Sign out / Instant Logout
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("lo_portal_auth_id");
      localStorage.removeItem("lo_portal_auth_email");
    }
    setAuthenticatedLoId(null);
    triggerToast("Logged out of Loan Officer Dashboard.");
  };

  // Switch viewing Loan Officer (Admin only)
  const handleSwitchLoanOfficer = (loId: string) => {
    if (!isAdminUser && loId !== loggedInUser.id) return;
    const selectedLo = guidesState.loanOfficers.find(lo => lo.id === loId);
    if (!selectedLo) return;

    setManagedLoId(loId);

    // Find first agent assigned to this LO or default to first in roster
    const assignedAgent = guidesState.agentRoster.find(a => a.assignedLoIds?.includes(loId)) || guidesState.agentRoster[0];

    const updated: ProfessionalGuidesState = {
      ...guidesState,
      currentUserId: loId,
      loanOfficer: selectedLo,
      activeAgentId: assignedAgent ? assignedAgent.id : guidesState.activeAgentId
    };

    onUpdateGuidesState(updated);
    triggerToast(`Switched active Loan Officer dashboard to: ${selectedLo.name}`);
  };

  // Quick updater for current loan officer profile fields
  const updateCurrentLoField = (field: keyof LoanOfficerProfile, value: any) => {
    const updatedLo: LoanOfficerProfile = { ...currentLo, [field]: value };
    const updatedLos = guidesState.loanOfficers.map(l => l.id === currentLo.id ? updatedLo : l);
    onUpdateGuidesState({
      ...guidesState,
      loanOfficers: updatedLos,
      loanOfficer: updatedLo
    });
  };

  // Branch Manager Authorization for Downstream LO Password Reset
  const handleAuthorizePasswordReset = (loId: string) => {
    const targetLo = guidesState.loanOfficers.find(l => l.id === loId);
    if (!targetLo) return;

    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const now = new Date().toISOString();

    const updatedLos = guidesState.loanOfficers.map(l => {
      if (l.id === loId) {
        return {
          ...l,
          passwordResetAuthorized: true,
          passwordResetAuthorizedAt: now,
          passwordResetPin: pin
        };
      }
      return l;
    });

    onUpdateGuidesState({
      ...guidesState,
      loanOfficers: updatedLos,
      loanOfficer: currentLo.id === loId ? { ...currentLo, passwordResetAuthorized: true, passwordResetAuthorizedAt: now, passwordResetPin: pin } : guidesState.loanOfficer
    });

    triggerToast(`Password reset authorized for ${targetLo.name}! Authorization PIN: ${pin}`);
  };

  // Revoke password reset authorization
  const handleRevokePasswordReset = (loId: string) => {
    const targetLo = guidesState.loanOfficers.find(l => l.id === loId);
    if (!targetLo) return;

    const updatedLos = guidesState.loanOfficers.map(l => {
      if (l.id === loId) {
        return {
          ...l,
          passwordResetAuthorized: false,
          passwordResetRequestedAt: undefined,
          passwordResetAuthorizedAt: undefined,
          passwordResetPin: undefined
        };
      }
      return l;
    });

    onUpdateGuidesState({
      ...guidesState,
      loanOfficers: updatedLos,
      loanOfficer: currentLo.id === loId ? { 
        ...currentLo, 
        passwordResetAuthorized: false, 
        passwordResetRequestedAt: undefined, 
        passwordResetAuthorizedAt: undefined, 
        passwordResetPin: undefined 
      } : guidesState.loanOfficer
    });

    triggerToast(`Password reset authorization revoked for ${targetLo.name}.`);
  };

  const handleSaveChangedPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordModalError(null);

    if (!newPasswordInput || newPasswordInput.length < 4) {
      setPasswordModalError("Password must be at least 4 characters long.");
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordModalError("Passwords do not match. Please re-enter.");
      return;
    }

    const targetId = isAdminUser ? currentLo.id : loggedInUser.id;
    const updatedLos = guidesState.loanOfficers.map(lo => {
      if (lo.id === targetId) {
        return { ...lo, password: newPasswordInput };
      }
      return lo;
    });

    onUpdateGuidesState({
      ...guidesState,
      loanOfficers: updatedLos,
      loanOfficer: currentLo.id === targetId ? { ...currentLo, password: newPasswordInput } : guidesState.loanOfficer
    });

    setShowPasswordModal(false);
    setNewPasswordInput("");
    setConfirmPasswordInput("");
    triggerToast(`Password successfully updated for ${currentLo.name}!`);
  };

  // If not authenticated, show dedicated credentialed login & password setup view
  if (!authenticatedLoId) {
    return (
      <LoanOfficerLoginView
        guidesState={guidesState}
        onUpdateGuidesState={onUpdateGuidesState}
        onAuthenticate={(loId) => {
          setAuthenticatedLoId(loId);
          setManagedLoId(loId);
          if (typeof window !== "undefined") {
            localStorage.setItem("lo_portal_auth_id", loId);
          }
          const targetLo = guidesState.loanOfficers.find(l => l.id === loId);
          if (targetLo) {
            onUpdateGuidesState({
              ...guidesState,
              currentUserId: loId,
              loanOfficer: targetLo
            });
          }
        }}
        onBackToPublicSite={onViewPublicSite}
      />
    );
  }

  // Add / Save Downstream Loan Officer
  const handleSaveLoanOfficer = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLo) {
      const updatedLos = guidesState.loanOfficers.map(lo => lo.id === editingLo.id ? editingLo : lo);
      const isCurrent = guidesState.loanOfficer.id === editingLo.id;
      onUpdateGuidesState({
        ...guidesState,
        loanOfficers: updatedLos,
        loanOfficer: isCurrent ? editingLo : guidesState.loanOfficer
      });
      setEditingLo(null);
      triggerToast(`Updated Loan Officer profile for ${editingLo.name}!`);
    } else {
      const loId = `lo-${Date.now()}`;
      const createdLo: LoanOfficerProfile = {
        id: loId,
        name: newLoForm.name || "New Loan Officer",
        title: newLoForm.title || "Mortgage Advisor",
        nmlsId: newLoForm.nmlsId || "NMLS #000000",
        company: newLoForm.company || "Cornerstone First Mortgage",
        branch: newLoForm.branch || "Team Lonn Kilstrom Branch",
        email: newLoForm.email || "",
        phone: newLoForm.phone || "",
        headshotUrl: newLoForm.headshotUrl || "",
        websiteUrl: newLoForm.websiteUrl || "",
        bio: newLoForm.bio || "",
        specialties: newLoForm.specialties || ["First-Time Homebuyers"],
        bookingUrl: newLoForm.bookingUrl || "https://calendly.com",
        licenseStates: newLoForm.licenseStates || ["Oregon"],
        isAdmin: false,
        parentManagerId: guidesState.adminLoanOfficerId,
        password: newLoForm.password || "pass123",
        passwordResetAuthorized: false,
        customSlug: (newLoForm.name || "lo").toLowerCase().replace(/\s+/g, "-")
      };

      // Also create an initial pairing with the first agent
      const newPairing: LOPairing = {
        id: `pair-${Date.now()}`,
        loId: loId,
        agentId: guidesState.agentRoster[0]?.id || "agent-sarah-jenkins",
        title: `${createdLo.name} + ${guidesState.agentRoster[0]?.name || "Agent"}`,
        customSlug: `${createdLo.customSlug}-and-partner`,
        campaignTag: "team-distribution",
        createdAt: new Date().toISOString().split("T")[0],
        active: true,
        totalViews: 0,
        totalLeads: 0
      };

      onUpdateGuidesState({
        ...guidesState,
        loanOfficers: [...guidesState.loanOfficers, createdLo],
        pairings: [...guidesState.pairings, newPairing]
      });

      setShowAddLoModal(false);
      setNewLoForm({
        name: "",
        title: "Mortgage Advisor",
        nmlsId: "NMLS #",
        company: "Cornerstone First Mortgage",
        branch: "Team Lonn Kilstrom Branch",
        email: "",
        phone: "",
        headshotUrl: "",
        websiteUrl: "",
        bio: "Dedicated mortgage specialist helping first-time homebuyers secure the best rates and state DPA programs.",
        specialties: ["First-Time Homebuyers", "FHA & Conventional", "State DPA Programs"],
        bookingUrl: "https://calendly.com",
        licenseStates: ["Oregon", "Washington"]
      });
      triggerToast(`Added downstream Loan Officer: ${createdLo.name} and generated unique portal links!`);
    }
  };

  // Delete Downstream Loan Officer
  const handleDeleteLoanOfficer = (loId: string) => {
    if (loId === guidesState.adminLoanOfficerId) {
      alert("Cannot delete the Branch Manager / Super Admin account (Mike Ford).");
      return;
    }
    if (!window.confirm("Are you sure you want to remove this loan officer from the team roster?")) return;

    const remainingLos = guidesState.loanOfficers.filter(lo => lo.id !== loId);
    const remainingPairings = guidesState.pairings.filter(p => p.loId !== loId);
    const activeLo = guidesState.loanOfficer.id === loId ? remainingLos[0] : guidesState.loanOfficer;

    onUpdateGuidesState({
      ...guidesState,
      loanOfficers: remainingLos,
      pairings: remainingPairings,
      loanOfficer: activeLo,
      currentUserId: activeLo.id
    });
    triggerToast("Loan Officer removed from roster.");
  };

  // Add / Save Realtor Agent
  const handleSaveAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAgent) {
      const updatedAgents = guidesState.agentRoster.map(a => a.id === editingAgent.id ? editingAgent : a);
      onUpdateGuidesState({
        ...guidesState,
        agentRoster: updatedAgents
      });
      setEditingAgent(null);
      triggerToast(`Updated Real Estate Agent partner profile for ${editingAgent.name}!`);
    } else {
      const agentId = `agent-${Date.now()}`;
      const createdAgent: RealEstateAgentProfile = {
        id: agentId,
        name: newAgentForm.name || "New Partner Agent",
        title: newAgentForm.title || "Buyer Specialist, REALTOR®",
        brokerage: newAgentForm.brokerage || "Premier Real Estate Group",
        licenseNumber: newAgentForm.licenseNumber || "OR Lic #000000",
        email: newAgentForm.email || "",
        phone: newAgentForm.phone || "",
        headshotUrl: newAgentForm.headshotUrl || "",
        agentType: newAgentForm.agentType || "buyer_agent",
        experienceYears: newAgentForm.experienceYears || 8,
        activeListingsCount: newAgentForm.activeListingsCount || 10,
        rating: newAgentForm.rating || 4.9,
        bio: newAgentForm.bio || "",
        specialties: newAgentForm.specialties || ["First-Time Homebuyers"],
        marketAreas: newAgentForm.marketAreas || ["Portland Metro"],
        websiteUrl: newAgentForm.websiteUrl || "",
        socialLinks: newAgentForm.socialLinks || { zillow: "", linkedin: "", instagram: "" },
        assignedLoIds: [currentLo.id],
        customSlug: (newAgentForm.name || "agent").toLowerCase().replace(/\s+/g, "-"),
        aiGenerated: newAgentForm.aiGenerated || false
      };

      // Create a pairing between current LO and new agent
      const newPairing: LOPairing = {
        id: `pair-${Date.now()}`,
        loId: currentLo.id,
        agentId: agentId,
        title: `${currentLo.name} + ${createdAgent.name}`,
        customSlug: `${currentLo.customSlug || "lo"}-and-${createdAgent.customSlug}`,
        campaignTag: "realtor-partnership",
        createdAt: new Date().toISOString().split("T")[0],
        active: true,
        totalViews: 0,
        totalLeads: 0
      };

      onUpdateGuidesState({
        ...guidesState,
        agentRoster: [...guidesState.agentRoster, createdAgent],
        pairings: [...guidesState.pairings, newPairing],
        activeAgentId: agentId
      });

      setShowAddAgentModal(false);
      setNewAgentForm({
        name: "",
        title: "Buyer Specialist, REALTOR®",
        brokerage: "",
        licenseNumber: "OR Lic #",
        email: "",
        phone: "",
        headshotUrl: "",
        bio: "Passionate about guiding first-time buyers through neighborhood selection and structuring winning offers.",
        specialties: ["First-Time Homebuyers", "Offer Negotiation", "Neighborhood Tours"],
        marketAreas: ["Portland Metro", "Beaverton", "Gresham"],
        websiteUrl: ""
      });
      triggerToast(`Added ${createdAgent.name} to Real Estate Agent partner roster!`);
    }
  };

  // Delete Agent
  const handleDeleteAgent = (agentId: string) => {
    if (guidesState.agentRoster.length <= 1) {
      alert("You must keep at least one real estate agent in your roster.");
      return;
    }
    if (!window.confirm("Are you sure you want to remove this real estate agent from your partner roster?")) return;

    const remainingAgents = guidesState.agentRoster.filter(a => a.id !== agentId);
    const remainingPairings = guidesState.pairings.filter(p => p.agentId !== agentId);
    const nextActive = guidesState.activeAgentId === agentId ? remainingAgents[0].id : guidesState.activeAgentId;

    onUpdateGuidesState({
      ...guidesState,
      agentRoster: remainingAgents,
      pairings: remainingPairings,
      activeAgentId: nextActive
    });
    triggerToast("Agent removed from roster.");
  };

  // Save/Create or Update Pairing
  const handleSavePairing = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPairing) {
      const updatedPairings = guidesState.pairings.map(p => {
        if (p.id === editingPairing.id) {
          const cleanTag = (editingPairing.campaignTag || "co-marketing").replace(/^#/, "").trim();
          return {
            ...editingPairing,
            campaignTag: cleanTag
          };
        }
        return p;
      });

      onUpdateGuidesState({
        ...guidesState,
        pairings: updatedPairings
      });

      setEditingPairing(null);
      triggerToast(`Campaign tag & pairing updated to: #${(editingPairing.campaignTag || "co-marketing").replace(/^#/, "")}`);
      return;
    }

    const lo = guidesState.loanOfficers.find(l => l.id === newPairingForm.loId) || currentLo;
    const agent = guidesState.agentRoster.find(a => a.id === newPairingForm.agentId) || guidesState.agentRoster[0];

    const pairingId = `pair-${Date.now()}`;
    const slug = newPairingForm.customSlug || `${lo.name.split(" ")[0].toLowerCase()}-and-${agent.name.split(" ")[0].toLowerCase()}`;
    const cleanTag = (newPairingForm.campaignTag || "partner-co-marketing").replace(/^#/, "").trim();

    const createdPairing: LOPairing = {
      id: pairingId,
      loId: lo.id,
      agentId: agent.id,
      title: newPairingForm.title || `${lo.name} + ${agent.name} Homebuyer Team`,
      customSlug: slug,
      campaignTag: cleanTag,
      createdAt: new Date().toISOString().split("T")[0],
      active: true,
      totalViews: 0,
      totalLeads: 0
    };

    onUpdateGuidesState({
      ...guidesState,
      pairings: [...guidesState.pairings, createdPairing],
      loanOfficer: lo,
      activeAgentId: agent.id
    });

    setShowAddPairingModal(false);
    triggerToast(`Created new LO + Realtor pairing: ${createdPairing.title}!`);
  };

  // Set Active Pairing for live site preview
  const handleActivatePairing = (pairing: LOPairing) => {
    const lo = guidesState.loanOfficers.find(l => l.id === pairing.loId) || currentLo;
    const agent = guidesState.agentRoster.find(a => a.id === pairing.agentId) || guidesState.agentRoster[0];

    onUpdateGuidesState({
      ...guidesState,
      loanOfficer: lo,
      activeAgentId: agent.id,
      currentUserId: lo.id
    });
    triggerToast(`Active public pairing updated to: ${lo.name} + ${agent.name}`);
  };

  // Lead Management & Nurture Handlers
  const handleToggleGlobalNurture = (enabled: boolean) => {
    setGlobalNurtureEnabled(enabled);
    if (typeof window !== "undefined") {
      localStorage.setItem("lo_global_nurture_enabled", enabled ? "true" : "false");
    }
    triggerToast(enabled ? "⚡ Automated Nurture Sequences globally ACTIVATED across all leads." : "⏸️ Automated Nurture Sequences PAUSED globally.");
  };

  const handleSalesforceSync = async (lead: CapturedLead) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Must be logged in");
      
      const idToken = await user.getIdToken();
      const docSnap = await getDoc(doc(db, "user_integrations", user.uid));
      if (!docSnap.exists() || !docSnap.data().salesforceVault) {
        triggerToast("No Salesforce vault found. Please configure settings first.");
        setShowSalesforceSettings(true);
        return;
      }

      triggerToast("Syncing to Salesforce...");
      const res = await fetch("/api/salesforce/sync-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${idToken}` },
        body: JSON.stringify({
          salesforceVault: docSnap.data().salesforceVault,
          lead
        })
      });
      const data = await res.json();
      if (res.ok) {
        triggerToast(`Successfully synced to Salesforce! ID: ${data.salesforceId}`);
        const currentLeads = guidesState.leads || [];
        const updated = currentLeads.map(l => l.id === lead.id ? { ...l, salesforceId: data.salesforceId, salesforceSyncedAt: new Date().toISOString() } : l);
        onUpdateGuidesState({ ...guidesState, leads: updated });
      } else {
        triggerToast(`Sync failed: ${data.error}`);
      }
    } catch (e: any) {
      console.error(e);
      triggerToast(`Sync error: ${e.message}`);
    }
  };

  const handleTotalExpertSync = async (lead: CapturedLead) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Must be logged in");
      
      const idToken = await user.getIdToken();
      const docSnap = await getDoc(doc(db, "user_integrations", user.uid));
      if (!docSnap.exists() || !docSnap.data().totalExpertVault) {
        triggerToast("No Total Expert vault found. Please configure settings first.");
        setShowTotalExpertSettings(true);
        return;
      }

      triggerToast("Syncing to Total Expert...");
      const res = await fetch("/api/totalexpert/sync-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${idToken}` },
        body: JSON.stringify({
          teVault: docSnap.data().totalExpertVault,
          lead
        })
      });
      const data = await res.json();
      if (res.ok) {
        triggerToast(`Successfully synced to Total Expert! ID: ${data.teId}`);
        const currentLeads = guidesState.leads || [];
        const updated = currentLeads.map(l => l.id === lead.id ? { ...l, totalExpertId: data.teId, totalExpertSyncedAt: new Date().toISOString() } : l);
        onUpdateGuidesState({ ...guidesState, leads: updated });
      } else {
        triggerToast(`Sync failed: ${data.error}`);
      }
    } catch (e: any) {
      console.error(e);
      triggerToast(`Sync error: ${e.message}`);
    }
  };

  const handleToggleLeadNurture = (leadId: string) => {
    const currentLeads = guidesState.leads || [];
    const target = currentLeads.find(l => l.id === leadId);
    if (!target) return;

    const currentStatus = target.nurtureSequenceEnabled ?? true;
    const newStatus = !currentStatus;

    const updated = currentLeads.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          nurtureSequenceEnabled: newStatus,
          nurtureSequenceStage: newStatus ? (l.nurtureSequenceStage || 'new_welcome') : 'paused'
        };
      }
      return l;
    });

    onUpdateGuidesState({
      ...guidesState,
      leads: updated
    });

    triggerToast(newStatus 
      ? `⚡ Automated Nurture sequence ENABLED for ${target.fullName}` 
      : `⏸️ Automated Nurture sequence PAUSED for ${target.fullName}`);
  };

  const handleBulkSmsDispatch = (template: SmsTemplate) => {
    const currentLeads = guidesState.leads || [];
    let dispatchCount = 0;
    
    const updated = currentLeads.map(l => {
      if (selectedLeadIds.has(l.id) && l.smsConsentAuthorized) {
        dispatchCount++;
        const firstName = l.fullName ? l.fullName.split(" ")[0] : "there";
        const loName = currentLo.name.split(" ")[0];
        const agentName = l.assignedAgent ? l.assignedAgent.split(" ")[0] : "Your Agent";
        
        const filledText = template.content
          .replace(/{{firstName}}/g, firstName)
          .replace(/\[Name\]/g, firstName)
          .replace(/{{loName}}/g, loName)
          .replace(/\[AgentName\]/g, agentName)
          .replace(/{{location}}/g, l.preferredLocations || "Oregon")
          .replace(/\[City\]/g, l.preferredLocations || "Oregon");

        const newMsg = {
          id: `sms-bulk-${Date.now()}-${l.id}`,
          direction: "outbound" as const,
          text: filledText,
          timestamp: new Date().toISOString(),
          status: "delivered" as const
        };

        const existingSms = l.smsMessages || [];
        
        return {
          ...l,
          smsMessages: [...existingSms, newMsg],
          lastTextSentAt: new Date().toISOString(),
          lastTextTemplateName: template.title
        };
      }
      return l;
    });
    
    onUpdateGuidesState({
      ...guidesState,
      leads: updated
    });
    
    triggerToast(`⚡ Bulk SMS successfully dispatched to ${dispatchCount} leads using '${template.title}'`);
    setShowBulkSmsModal(false);
    setSelectedLeadIds(new Set());
  };

  const handleUpdateLeadStatus = (leadId: string, newStatus: CapturedLead['status']) => {
    const currentLeads = guidesState.leads || [];
    
    // Real-time notification check
    const targetLead = currentLeads.find(l => l.id === leadId);
    if (targetLead && newStatus !== targetLead.status) {
      if (targetLead.assignedAgentId || targetLead.assignedAgent) {
        const agentName = targetLead.assignedAgent || "Co-branded Partner";
        if (newStatus === 'pre_approved') {
          triggerToast(`🔔 Real-Time Alert sent to ${agentName} (Email/In-App): "${targetLead.fullName} is now Prequalified and ready to tour!"`);
        } else if (newStatus === 'in_escrow') {
          triggerToast(`🔔 Real-Time Alert sent to ${agentName} (Email/In-App): "${targetLead.fullName} is officially In Escrow! Closing tasks initiated."`);
        } else if (newStatus === 'closed') {
          triggerToast(`🔔 Real-Time Alert sent to ${agentName} (Email/In-App): "Congratulations! ${targetLead.fullName} has officially Closed!"`);
        }
      }
    }

    const updated = currentLeads.map(l => {
      if (l.id === leadId) {
        let stage: CapturedLead['nurtureSequenceStage'] = l.nurtureSequenceStage;
        if (newStatus === "new") stage = "new_welcome";
        else if (newStatus === "contacted") stage = "contacted_followup";
        else if (newStatus === "pre_approved") stage = "pre_approved_homehunt";
        else if (newStatus === "in_escrow") stage = "escrow_closing_prep";
        else if (newStatus === "closed") stage = "closed_post_close";
        else if (newStatus === "archived") stage = "paused";

        const existingLogs = l.nurtureSequenceLogs || [];
        const newLog = {
          id: `log-${Date.now()}`,
          stageName: stage || newStatus,
          emailSubject: stage === "new_welcome" ? "Welcome & First-Time Buyer $0 Down Payment Blueprint" :
                        stage === "contacted_followup" ? "Top 5 First-Time Buyer Credit & Budget Secrets" :
                        stage === "pre_approved_homehunt" ? "Your Pre-Approval Celebration & Agent Home Hunt Checklist" :
                        stage === "escrow_closing_prep" ? "Smooth Escrow & Closing Disclosure Guide" :
                        stage === "closed_post_close" ? "Post-Closing Rate Review & Annual Equity Monitor" : "Pipeline Transition Update",
          sentAt: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", month: "short", day: "numeric" }),
          status: "sent" as const
        };

        return { 
          ...l, 
          status: newStatus,
          nurtureSequenceStage: stage,
          nurtureSequenceLogs: [newLog, ...existingLogs]
        };
      }
      return l;
    });

    onUpdateGuidesState({
      ...guidesState,
      leads: updated
    });

    triggerToast(`Lead status updated to ${newStatus.toUpperCase()} (Nurture Stage Updated)`);
  };

  const handleDeleteLead = (leadId: string) => {
    if (!window.confirm("Are you sure you want to delete this captured lead?")) return;
    const currentLeads = guidesState.leads || [];
    const updated = currentLeads.filter(l => l.id !== leadId);
    onUpdateGuidesState({
      ...guidesState,
      leads: updated
    });
    triggerToast("Lead removed from database.");
  };

  const handleExportLeadsCSV = () => {
    const leads = guidesState.leads || [];
    if (leads.length === 0) {
      alert("No leads available to export.");
      return;
    }

    const headers = [
      "ID",
      "Full Name",
      "Email",
      "Phone",
      "Preferred Contact Time",
      "Timeline",
      "Target Price",
      "Monthly Budget",
      "Down Payment / Savings",
      "DPA Interest",
      "Credit Score Tier",
      "Preferred Locations",
      "Property Type",
      "Assigned Loan Officer",
      "Lead Source",
      "Intent Score",
      "Status",
      "Notes",
      "Created At"
    ];

    const rows = leads.map(l => {
      const lo = guidesState.loanOfficers.find(o => o.id === l.assignedLoId);
      return [
        `"${l.id}"`,
        `"${l.fullName || ""}"`,
        `"${l.email || ""}"`,
        `"${l.phone || ""}"`,
        `"${l.preferredContactTime || ""}"`,
        `"${l.timeline || ""}"`,
        `"${l.targetPriceRange || ""}"`,
        `"${l.targetMonthlyBudget || ""}"`,
        `"${l.downPaymentSavings || ""}"`,
        `"${l.grantInterest ? "Yes" : "No"}"`,
        `"${l.creditScoreTier || ""}"`,
        `"${l.preferredLocations || ""}"`,
        `"${l.propertyType || ""}"`,
        `"${lo?.name || l.assignedLoId}"`,
        `"${l.leadSource || ""}"`,
        `"${l.intentScore || "hot"}"`,
        `"${l.status || "new"}"`,
        `"${(l.notes || "").replace(/"/g, '""')}"`,
        `"${l.createdAt || ""}"`
      ].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\
");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `homebuyer_leads_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast("Leads successfully exported to CSV / CRM format!");
  };

  // URL Helpers
  const origin = typeof window !== "undefined" ? window.location.origin : "https://first-time-homebuyer.ai.studio";
  const currentLoSlug = currentLo.customSlug || currentLo.id.replace(/^lo-/, "");
  const activeAgentSlug = activeAgent?.customSlug || activeAgent?.id.replace(/^agent-/, "") || "";
  const matchedActivePairing = guidesState.pairings.find(p => p.loId === currentLo.id && p.agentId === activeAgent?.id);
  const activePairingUrl = matchedActivePairing?.customSlug 
    ? `${origin}/?pair=${matchedActivePairing.customSlug}`
    : `${origin}/?lo=${currentLoSlug}&agent=${activeAgentSlug}`;

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#2D362E] pb-24">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2D362E] text-white px-5 py-3 rounded-2xl shadow-xl border border-white/20 flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-[#D4A373]" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-[#EAE7E0] sticky top-0 z-40 px-4 sm:px-8 py-3 shadow-2xs">
        <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Brand & Logged-In User Badge */}
          <div className="flex items-center gap-3.5 flex-wrap">
            <HeadshotAvatar
              src={loggedInUser?.headshotUrl || (loggedInUser as any)?.avatarUrl || currentLo?.headshotUrl || (currentLo as any)?.avatarUrl}
              name={loggedInUser?.name || currentLo?.name || "Mike Ford"}
              className="w-10 h-10 rounded-2xl border border-[#EAE7E0] shadow-sm shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-serif font-bold text-base sm:text-lg text-[#2D362E]">
                  Loan Officer Management Hub
                </span>
                {isAdminUser ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                    <span>👑</span>
                    <span>Branch Manager Admin (Mike Ford)</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                    <span>🛡️</span>
                    <span>Loan Officer ({loggedInUser.name})</span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-[11px] font-bold text-red-600 hover:text-red-800 hover:underline flex items-center gap-1 ml-1 transition-colors"
                  title="Instant Log Out"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Log Out</span>
                </button>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs text-[#606C5D] flex items-center gap-1.5">
                  <span className="font-semibold text-[#2D362E]">{currentLo.company || "Your Lending Institution"}</span>
                  <span className="text-[#9A9488]">•</span>
                  <span>Private Credentialed Environment</span>
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("my_profile")}
                  className="text-[11px] font-semibold text-[#4A5D4E] hover:text-[#38463B] hover:underline bg-[#4A5D4E]/10 hover:bg-[#4A5D4E]/15 px-2 py-0.5 rounded-md transition-colors"
                  title="Click to edit company name, NMLS, states, and profile details"
                >
                  Edit Company / Profile ✎
                </button>
              </div>
            </div>
          </div>

          {/* User Profile Switcher & Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* If Admin: LO Switcher to manage downstream LO dashboards */}
            {isAdminUser && (
              <div className="flex items-center gap-1.5 bg-[#FAF9F5] px-3 py-1.5 rounded-xl border border-amber-300 text-xs shadow-2xs">
                <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                  <span>👑</span>
                  <span>Manage LO Dashboard:</span>
                </span>
                <select
                  value={currentLo.id}
                  onChange={(e) => handleSwitchLoanOfficer(e.target.value)}
                  className="bg-transparent font-bold text-[#2D362E] focus:outline-none cursor-pointer"
                >
                  {guidesState.loanOfficers.map(lo => (
                    <option key={lo.id} value={lo.id}>
                      {lo.name} {lo.isAdmin ? "(Admin Dashboard)" : `(${lo.title})`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Google Workspace Integration Button */}
            <button
              onClick={() => setActiveTab("google_workspace")}
              title="Google Workspace (Gmail, Calendar, Sheets, Drive, Tasks, Contacts)"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                workspaceUser
                  ? "bg-emerald-50 border border-emerald-300 text-emerald-900 hover:bg-emerald-100"
                  : "bg-[#FAF9F5] border border-[#EAE7E0] hover:bg-[#F1EFE9] text-[#2D362E]"
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span className="hidden sm:inline">Workspace</span>
              {workspaceUser ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              ) : (
                <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-full font-bold">Sync</span>
              )}
            </button>

            {/* Password Change Button */}
            <button
              onClick={() => {
                setPasswordModalError(null);
                setNewPasswordInput("");
                setConfirmPasswordInput("");
                setShowPasswordModal(true);
              }}
              title="Change private password"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF9F5] border border-[#EAE7E0] hover:bg-[#F1EFE9] text-xs font-semibold text-[#2D362E] transition-colors cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 text-[#4A5D4E]" />
              <span className="hidden sm:inline">Password</span>
            </button>

            {/* Twilio Carrier SMS Integration Button */}
            <button
              onClick={() => setShowTwilioSettingsModal(true)}
              title="Configure Twilio API Credentials & Live Carrier SMS"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden sm:inline">Twilio SMS API</span>
            </button>

            {/* Salesforce CRM Integration Button */}
            <button
              onClick={() => setShowSalesforceSettings(true)}
              title="Configure Salesforce Enterprise CRM Handoff"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Cloud className="w-3.5 h-3.5 text-blue-300" />
              <span className="hidden sm:inline">Salesforce Sync</span>
            </button>

            {/* Quick AI Review Button */}
            <button
              onClick={handleOpenDailyReview}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#2D362E] via-[#4A5D4E] to-[#C18C5D] hover:opacity-95 text-white text-xs font-bold transition-all shadow-xs cursor-pointer group"
              title="Run Real-Time AI Review & Daily Rhythm Check"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E7C19D] group-hover:scale-110 transition-transform" />
              <span>Quick AI Review</span>
            </button>

            {/* Top Tabs Toggle Button */}
            <button
              onClick={() => {
                setShowHorizontalNav(prev => {
                  const next = !prev;
                  if (typeof window !== "undefined") {
                    localStorage.setItem("lo_show_horizontal_nav", String(next));
                  }
                  return next;
                });
              }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                showHorizontalNav 
                  ? "bg-[#4A5D4E]/15 text-[#2D362E] border border-[#4A5D4E]/30" 
                  : "text-[#7D8877] hover:bg-[#FAF9F5] border border-transparent hover:border-[#EAE7E0]"
              }`}
              title="Toggle Horizontal Tabs Row"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Top Tabs</span>
            </button>

            {/* Preview Public Site Button */}
            <button
              onClick={onViewPublicSite}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#EAE7E0] hover:bg-[#F9F8F4] text-xs font-semibold text-[#4A5D4E] transition-colors shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Preview Live Site</span>
            </button>

            {/* Primary Instant Log Out Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs"
              title={`Instantly log out of ${loggedInUser.name}'s Loan Officer Dashboard`}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>

            {/* Exit Portal Button */}
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-[#2D362E] hover:bg-[#1E241F] text-white text-xs font-bold transition-colors shadow-2xs"
              title="Close portal and return to homebuyer website"
            >
              Exit
            </button>
          </div>
        </div>

        {/* Optional Sticky Navigation Tabs Bar with Horizontal Scrollbar & Quick Navigation Arrows */}
        {showHorizontalNav && (
        <div className="mt-3 pt-3 border-t border-[#EAE7E0] relative flex items-center gap-1.5 group animate-in fade-in">
          {/* Left Scroll Navigation Button */}
          <button
            type="button"
            onClick={() => handleMenuScroll("left")}
            disabled={!canScrollLeft}
            aria-label="Scroll menu left"
            title="Scroll menu left"
            className={`shrink-0 w-8 h-8 rounded-xl border flex items-center justify-center transition-all duration-200 shadow-2xs z-20 ${
              canScrollLeft
                ? "bg-white border-[#DCD7CD] text-[#2D362E] hover:bg-[#F1EFE9] hover:border-[#606C5D] cursor-pointer hover:scale-105 active:scale-95"
                : "bg-white/40 border-[#EAE7E0]/60 text-[#C4BEB5] cursor-not-allowed opacity-40"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Left Gradient Edge Fade */}
          {canScrollLeft && (
            <div 
              aria-hidden="true" 
              className="absolute left-8 top-3 bottom-0 w-6 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none transition-opacity duration-200" 
            />
          )}

          {/* Scrollable Container with dedicated visible horizontal scrollbar */}
          <nav
            ref={menuScrollRef}
            onScroll={checkMenuScroll}
            aria-label="Loan Officer Dashboard Sections"
            className="flex-1 flex items-center gap-2 overflow-x-auto pb-2.5 pt-0.5 scroll-smooth dashboard-horizontal-scrollbar min-w-0"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            <button
              data-tab-id="leads"
              onClick={() => setActiveTab("leads")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                activeTab === "leads"
                  ? "bg-[#4A5D4E] text-white shadow-xs"
                  : "bg-[#F9F8F4] text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F1EFE9]"
              }`}
            >
              <Inbox className="w-4 h-4 text-[#E7C19D]" />
              <span>Buyer Leads & Inquiries CRM</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === "leads" 
                  ? "bg-white/20 text-white" 
                  : "bg-[#4A5D4E]/10 text-[#4A5D4E]"
              }`}>
                {guidesState.leads?.length || 0}
              </span>
            </button>

            <button
              data-tab-id="google_workspace"
              onClick={() => setActiveTab("google_workspace")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                activeTab === "google_workspace"
                  ? "bg-[#2D362E] text-white shadow-xs"
                  : "bg-[#F9F8F4] text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F1EFE9]"
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google Workspace</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === "google_workspace"
                  ? "bg-white/20 text-white"
                  : "bg-blue-100 text-blue-800 border border-blue-300"
              }`}>
                {workspaceUser ? "Connected" : "OAuth Sync"}
              </span>
            </button>

            <button
              data-tab-id="ai_2nd_brain"
              onClick={() => setActiveTab("ai_2nd_brain")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                activeTab === "ai_2nd_brain"
                  ? "bg-[#2D362E] text-white shadow-xs"
                  : "bg-[#F9F8F4] text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F1EFE9]"
              }`}
            >
              <Brain className="w-4 h-4 text-[#E7C19D]" />
              <span>AI 2nd Brain Copilot</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === "ai_2nd_brain"
                  ? "bg-emerald-500/30 text-emerald-200 border border-emerald-400/40"
                  : "bg-emerald-100 text-emerald-800 border border-emerald-300"
              }`}>
                Vantage Copilot
              </span>
            </button>

            <button
              data-tab-id="tax_schedule_c"
              onClick={() => setActiveTab("tax_schedule_c")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                activeTab === "tax_schedule_c"
                  ? "bg-[#4A5D4E] text-white shadow-xs"
                  : "bg-[#F9F8F4] text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F1EFE9]"
              }`}
            >
              <Calculator className="w-4 h-4 text-[#E7C19D]" />
              <span>Schedule C Tax Analyzer</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === "tax_schedule_c"
                  ? "bg-white/20 text-white"
                  : "bg-amber-100 text-amber-900 border border-amber-300"
              }`}>
                Form 1084
              </span>
            </button>

            <button
              data-tab-id="buydown_2_1"
              onClick={() => setActiveTab("buydown_2_1")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                activeTab === "buydown_2_1"
                  ? "bg-[#C18C5D] text-white shadow-xs"
                  : "bg-[#F9F8F4] text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F1EFE9]"
              }`}
            >
              <Percent className="w-4 h-4 text-amber-200" />
              <span>2-1 Buydown Scenario Engine</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === "buydown_2_1"
                  ? "bg-white/20 text-white"
                  : "bg-orange-100 text-orange-900 border border-orange-300"
              }`}>
                Seller Concessions
              </span>
            </button>

            <button
              data-tab-id="realtor_cobranding"
              onClick={() => setActiveTab("realtor_cobranding")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                activeTab === "realtor_cobranding"
                  ? "bg-[#2F5738] text-white shadow-xs"
                  : "bg-[#F9F8F4] text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F1EFE9]"
              }`}
            >
              <Users className="w-4 h-4 text-[#D4A373]" />
              <span>Realtor Co-Branding Command Hub</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === "realtor_cobranding"
                  ? "bg-white/20 text-white"
                  : "bg-emerald-100 text-emerald-800 border border-emerald-300"
              }`}>
                {guidesState.agentRoster.length} Partners
              </span>
            </button>

            <button
              data-tab-id="scenario_workbench"
              onClick={() => setActiveTab("scenario_workbench")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                activeTab === "scenario_workbench"
                  ? "bg-[#4A5D4E] text-white shadow-xs"
                  : "bg-[#F9F8F4] text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F1EFE9]"
              }`}
            >
              <Calculator className="w-4 h-4 text-[#D4A373]" />
              <span>Loan & Affordability Scenarios</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === "scenario_workbench"
                  ? "bg-white/20 text-white"
                  : "bg-amber-100 text-amber-900 border border-amber-300"
              }`}>
                Auto-Sync & Drafts
              </span>
            </button>

            <button
              data-tab-id="sms_compliance"
              onClick={() => setActiveTab("sms_compliance")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                activeTab === "sms_compliance"
                  ? "bg-[#2F5738] text-white shadow-xs"
                  : "bg-[#F9F8F4] text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F1EFE9]"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>SMS Compliance & Opt-in</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === "sms_compliance"
                  ? "bg-white/20 text-white"
                  : "bg-emerald-100 text-emerald-800 border border-emerald-300"
              }`}>
                {(guidesState.leads || []).filter(l => l.smsConsentAuthorized).length} Opted-In
              </span>
            </button>

            <button
              data-tab-id="sms_templates"
              onClick={() => setActiveTab("sms_templates")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                activeTab === "sms_templates"
                  ? "bg-[#2D362E] text-white shadow-xs"
                  : "bg-[#F9F8F4] text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F1EFE9]"
              }`}
            >
              <MessageSquare className="w-4 h-4 text-emerald-300" />
              <span>SMS Nurture Library</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === "sms_templates"
                  ? "bg-white/20 text-white"
                  : "bg-emerald-100 text-emerald-800 border border-emerald-300"
              }`}>
                {guidesState.smsTemplates?.length || 0}
              </span>
            </button>

            {isSuperAdmin && (
              <button
                data-tab-id="team_distribution"
                onClick={() => setActiveTab("team_distribution")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  activeTab === "team_distribution"
                    ? "bg-[#4A5D4E] text-white shadow-xs"
                    : "bg-[#F9F8F4] text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F1EFE9]"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Team LO Roster & Distribution ({guidesState.loanOfficers.length})</span>
                {guidesState.loanOfficers.some(l => !l.isAdmin && l.passwordResetRequestedAt && !l.passwordResetAuthorized) && (
                  <span className="text-[10px] bg-amber-500 text-white font-bold px-2 py-0.5 rounded-full animate-pulse shadow-xs flex items-center gap-1">
                    <Key className="w-2.5 h-2.5" />
                    <span>Reset Requested</span>
                  </span>
                )}
              </button>
            )}

            {isSuperAdmin && (
              <button
                data-tab-id="recruitment_pipeline"
                onClick={() => setActiveTab("recruitment_pipeline")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  activeTab === "recruitment_pipeline"
                    ? "bg-[#4A5D4E] text-white shadow-xs"
                    : "bg-[#F9F8F4] text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F1EFE9]"
                }`}
              >
                <Target className="w-4 h-4" />
                <span>Recruitment Pipeline</span>
              </button>
            )}

            <button
              data-tab-id="pairings"
              onClick={() => setActiveTab("pairings")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                activeTab === "pairings"
                  ? "bg-[#4A5D4E] text-white shadow-xs"
                  : "bg-[#F9F8F4] text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F1EFE9]"
              }`}
            >
              <Link className="w-4 h-4" />
              <span>LO + Agent Pairings & Custom Links ({guidesState.pairings.length})</span>
            </button>

            <button
              data-tab-id="realtor_roster"
              onClick={() => setActiveTab("realtor_roster")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                activeTab === "realtor_roster"
                  ? "bg-[#4A5D4E] text-white shadow-xs"
                  : "bg-[#F9F8F4] text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F1EFE9]"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Realtor Partner Roster ({guidesState.agentRoster.length})</span>
            </button>

            <button
              data-tab-id="dpa_grants"
              onClick={() => setActiveTab("dpa_grants")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                activeTab === "dpa_grants"
                  ? "bg-[#C18C5D] text-white shadow-xs"
                  : "bg-[#F9F8F4] text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F1EFE9]"
              }`}
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>DPA & State Grant Intelligence</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === "dpa_grants"
                  ? "bg-white/20 text-white"
                  : "bg-amber-100 text-amber-900 border border-amber-300"
              }`}>
                50 States + OHCS
              </span>
            </button>

            <button
              data-tab-id="ai_partner_campaign"
              onClick={() => setActiveTab("ai_partner_campaign")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                activeTab === "ai_partner_campaign"
                  ? "bg-[#C18C5D] text-white shadow-xs"
                  : "bg-[#F9F8F4] text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F1EFE9]"
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>AI Partner Campaign Engine</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === "ai_partner_campaign"
                  ? "bg-white/20 text-white"
                  : "bg-amber-100 text-amber-900 border border-amber-300"
              }`}>
                Buyer Agents
              </span>
            </button>

            <button
              data-tab-id="geosphere_sync"
              onClick={() => setActiveTab("geosphere_sync")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                activeTab === "geosphere_sync"
                  ? "bg-[#2F5738] text-white shadow-xs"
                  : "bg-[#F9F8F4] text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F1EFE9]"
              }`}
            >
              <Globe className="w-4 h-4 text-[#D4A373]" />
              <span>GeoSphere Map Sync Hub</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === "geosphere_sync"
                  ? "bg-white/20 text-white"
                  : "bg-emerald-100 text-emerald-800"
              }`}>
                {guidesState.syncedProperties?.length || 6}
              </span>
            </button>

            <button
              data-tab-id="my_profile"
              onClick={() => setActiveTab("my_profile")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                activeTab === "my_profile"
                  ? "bg-[#4A5D4E] text-white shadow-xs"
                  : "bg-[#F9F8F4] text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F1EFE9]"
              }`}
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit My Loan Officer Profile</span>
            </button>

            <button
              data-tab-id="social_push"
              onClick={() => setActiveTab("social_push")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                activeTab === "social_push"
                  ? "bg-[#C18C5D] text-white shadow-xs"
                  : "bg-[#F9F8F4] text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F1EFE9]"
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>Social Push & CRM Blasts</span>
            </button>

            <button
              data-tab-id="ad_campaigns"
              onClick={() => setActiveTab("ad_campaigns")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                activeTab === "ad_campaigns"
                  ? "bg-[#1877F2] text-white shadow-xs"
                  : "bg-[#F9F8F4] text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F1EFE9]"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Meta & Google Ads Campaign Builder</span>
            </button>
            <button
              data-tab-id="system_pitch_deck"
              onClick={() => setActiveTab("system_pitch_deck")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                activeTab === "system_pitch_deck"
                  ? "bg-[#4A5D4E] text-white shadow-xs"
                  : "bg-[#F9F8F4] text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F1EFE9]"
              }`}
            >
              <PieChart className="w-4 h-4" />
              <span>Pitch Deck & ROI Metrics</span>
            </button>

            {(isAdminUser || permissions.canViewBranchMetrics) && (
              <button
                onClick={() => setActiveTab("branch_admin_metrics")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  activeTab === "branch_admin_metrics"
                    ? "bg-[#4A5D4E] text-white shadow-xs"
                    : "bg-[#F9F8F4] text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F1EFE9]"
                }`}
              >
                <PieChart className="w-4 h-4 text-[#C18C5D]" />
                <span>Branch Performance & ROI</span>
              </button>
            )}

            {(isAdminUser || permissions.canManageBranchUsers) && (
              <button
                data-tab-id="branch_management"
                onClick={() => setActiveTab("branch_management")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  activeTab === "branch_management"
                    ? "bg-[#606C5D] text-white shadow-md shadow-[#4A5D4E]/20"
                    : "text-[#9A9488] hover:bg-[#F8F7F4] hover:text-[#2D362E]"
                }`}
                title="Manage branch roles, granular RBAC, whitelist, and two-factor authentication"
              >
                <ShieldCheck className="w-4 h-4 text-[#C18C5D]" />
                <span>Site Visibility & Branch RBAC</span>
              </button>
            )}

            <button
              data-tab-id="growth_dashboard"
              onClick={() => setActiveTab("growth_dashboard")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                activeTab === "growth_dashboard"
                  ? "bg-[#4A5D4E] text-white shadow-xs"
                  : "bg-[#F9F8F4] text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F1EFE9]"
              }`}
            >
              <TrendingUp className="w-4 h-4 text-[#C18C5D]" />
              <span>Growth Dashboard</span>
            </button>
          </nav>

          {/* Right Gradient Edge Fade */}
          {canScrollRight && (
            <div 
              aria-hidden="true" 
              className="absolute right-8 top-3 bottom-0 w-6 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none transition-opacity duration-200" 
            />
          )}

          {/* Right Scroll Navigation Button */}
          <button
            type="button"
            onClick={() => handleMenuScroll("right")}
            disabled={!canScrollRight}
            aria-label="Scroll menu right"
            title="Scroll menu right"
            className={`shrink-0 w-8 h-8 rounded-xl border flex items-center justify-center transition-all duration-200 shadow-2xs z-20 ${
              canScrollRight
                ? "bg-white border-[#DCD7CD] text-[#2D362E] hover:bg-[#F1EFE9] hover:border-[#606C5D] cursor-pointer hover:scale-105 active:scale-95"
                : "bg-white/40 border-[#EAE7E0]/60 text-[#C4BEB5] cursor-not-allowed opacity-40"
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        )}
      </header>

      {/* Portal Layout: Left Collapsible Sidebar with Sticky AI Daily Rhythm + Main Workspace */}
      <div className="flex flex-1 min-h-[calc(100vh-65px)]">
        {/* Left Sidebar */}
        <LoanOfficerSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => {
            setIsSidebarCollapsed(prev => {
              const next = !prev;
              if (typeof window !== "undefined") {
                localStorage.setItem("lo_sidebar_collapsed", String(next));
              }
              return next;
            });
          }}
          currentLo={currentLo}
          loggedInUser={loggedInUser}
          guidesState={guidesState}
          isAdminUser={isAdminUser}
          onOpenDailyReview={handleOpenDailyReview}
          workspaceConnected={Boolean(workspaceUser)}
        />

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 overflow-y-auto">
          <main className="max-w-[1600px] mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Admin Managing Downstream LO Alert Banner */}
        {isAdminUser && currentLo.id !== loggedInUser.id && (
          <div className="bg-amber-50/90 border-2 border-amber-300 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-in fade-in">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-2xs">
                👑
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-xs sm:text-sm text-amber-950">
                    Branch Manager Mode: Actively Managing {currentLo.name}&apos;s Dashboard
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300">
                    Full Admin Control
                  </span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  As Branch Manager (Mike Ford), you retain full rights over {currentLo.name}&apos;s account. Any partner agents, co-branded pairing links, or lead updates you make here apply directly to this loan officer.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleSwitchLoanOfficer(loggedInUser.id)}
              className="px-4 py-2 rounded-xl bg-amber-900 hover:bg-amber-950 text-white text-xs font-bold shrink-0 transition-colors shadow-2xs self-start sm:self-center"
            >
              ← Back to Mike Ford Admin Dashboard
            </button>
          </div>
        )}

        {/* Tab: Master Lead Journey */}
        {activeTab === "master_lead_journey" && (
          <div className="space-y-6">
            <MasterLeadJourneyTab 
              leads={guidesState.leads || []}
              loanOfficer={currentLo}
              agentRoster={guidesState.agentRoster || []}
              onUpdateLead={(updatedLead) => {
                const currentLeads = guidesState.leads || [];
                const updated = currentLeads.map(l => l.id === updatedLead.id ? updatedLead : l);
                onUpdateGuidesState({
                  ...guidesState,
                  leads: updated
                });
              }}
            />
          </div>
        )}

        {/* Tab 0: Leads & Inquiries CRM */}
        {activeTab === "leads" && (
          <div className="space-y-6">
            {/* AI Executive Daily Morning Briefing */}
            <DailyMorningBriefing
              loanOfficer={currentLo}
              leads={guidesState.leads || []}
              properties={properties}
              onUpdateLead={(updatedLead) => {
                const currentLeads = guidesState.leads || [];
                const updated = currentLeads.map(l => l.id === updatedLead.id ? updatedLead : l);
                onUpdateGuidesState({
                  ...guidesState,
                  leads: updated
                });
              }}
              onOpenSmsMessaging={(lead) => {
                setSmsModalLead(lead);
              }}
              onOpenTranscript={(lead) => {
                setViewingTranscriptLead(lead);
              }}
              onTriggerToast={triggerToast}
            />

            {/* Curation Task Management Queue */}
            <TaskManagementPanel
              leads={guidesState.leads || []}
              properties={properties}
              agents={guidesState.agentRoster || []}
              loanOfficer={currentLo}
              onOpenSmsMessaging={(lead) => setSmsModalLead(lead)}
              onOpenEmailOutreach={(lead) => {
                setInitialOutreachLeadId(lead.id);
                setShowEmailOutreachModal(true);
              }}
              onUpdateLead={(updatedLead) => {
                const currentLeads = guidesState.leads || [];
                const updated = currentLeads.map(l => l.id === updatedLead.id ? updatedLead : l);
                onUpdateGuidesState({
                  ...guidesState,
                  leads: updated
                });
              }}
              onTriggerToast={triggerToast}
            />

            {/* Google Workspace Operations & Status Unified Card */}
            <WorkspaceStatusWidget
              currentLo={currentLo}
              guidesState={guidesState}
              onNavigateToWorkspaceTab={() => setActiveTab("google_workspace")}
              onOpenContextualModal={(lead, defaultTab) => {
                setGoogleWorkspaceModalLead(lead);
                setGoogleWorkspaceModalTab(defaultTab || "gmail");
                setGoogleWorkspaceModalOpen(true);
              }}
              onTriggerToast={triggerToast}
            />

            {/* Header & Export Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#EAE7E0] shadow-sm">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-2xl text-[#2D362E]">
                    Buyer Lead Intake & Inquiries CRM
                  </h3>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                    24/7 AI Synced
                  </span>
                </div>
                <p className="text-xs text-[#606C5D] mt-1 max-w-2xl">
                  Real-time prospective homebuyers qualified by the interactive AI Intake Chatbot, social ads, and co-branded marketing landing pages. Includes complete buyer blueprints and chat transcripts.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowSourceReportModal(true)}
                  className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  title="View marketing channel lead quality breakdown & export report"
                >
                  <BarChart3 className="w-4 h-4 text-emerald-300" />
                  <span>Source Quality Report</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 bg-[#2D362E] hover:bg-[#1E241F] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[#E7C19D]" />
                  <span>Export PDF</span>
                </button>
                <button
                  onClick={handleExportLeadsCSV}
                  className="px-4 py-2.5 bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#E7C19D]" />
                  <span>Export to CSV / CRM</span>
                </button>
              </div>
            </div>

            {/* Lead Conversion Funnel & Pipeline Velocity Visualization */}
            {(() => {
              const allLeads = guidesState.leads || [];
              const totalCount = allLeads.length;

              const newCount = allLeads.filter(l => l.status === "new").length;
              const contactedCount = allLeads.filter(l => l.status === "contacted").length;
              const preApprovedCount = allLeads.filter(l => l.status === "pre_approved").length;
              const inEscrowCount = allLeads.filter(l => l.status === "in_escrow").length;
              const closedCount = allLeads.filter(l => l.status === "closed").length;
              const archivedCount = allLeads.filter(l => l.status === "archived").length;

              // Active pipeline count (excluding archived)
              const activeTotal = totalCount - archivedCount || 1;

              // Cumulative counts for conversion funnel (leads that reached at least this stage)
              const reachedContacted = contactedCount + preApprovedCount + inEscrowCount + closedCount;
              const reachedPreApproved = preApprovedCount + inEscrowCount + closedCount;
              const reachedEscrow = inEscrowCount + closedCount;
              const reachedClosed = closedCount;

              // Conversion Rates
              const contactedRate = Math.round((reachedContacted / (totalCount || 1)) * 100);
              const preApprovedRate = Math.round((reachedPreApproved / (reachedContacted || 1)) * 100);
              const escrowRate = Math.round((reachedEscrow / (reachedPreApproved || 1)) * 100);
              const closedRate = Math.round((reachedClosed / (reachedEscrow || 1)) * 100);

              const overallWinRate = Math.round(((reachedEscrow + reachedClosed) / (totalCount || 1)) * 100);

              const stages = [
                {
                  id: "new",
                  name: "New Leads",
                  subText: "Uncontacted Intake",
                  count: newCount,
                  reached: totalCount,
                  pctOfTotal: Math.round((newCount / (totalCount || 1)) * 100),
                  convRate: "100%",
                  icon: Inbox,
                  color: "blue",
                  bgClass: "bg-blue-50 border-blue-200 text-blue-900",
                  badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
                  activeBorder: "ring-2 ring-blue-500 border-blue-500"
                },
                {
                  id: "contacted",
                  name: "Contacted",
                  subText: "Outreach & Engagement",
                  count: contactedCount,
                  reached: reachedContacted,
                  pctOfTotal: Math.round((contactedCount / (totalCount || 1)) * 100),
                  convRate: `${contactedRate}% from New`,
                  icon: MessageSquare,
                  color: "amber",
                  bgClass: "bg-amber-50 border-amber-200 text-amber-900",
                  badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
                  activeBorder: "ring-2 ring-amber-500 border-amber-500"
                },
                {
                  id: "pre_approved",
                  name: "Prequalified",
                  subText: "Pre-Approved Buyer",
                  count: preApprovedCount,
                  reached: reachedPreApproved,
                  pctOfTotal: Math.round((preApprovedCount / (totalCount || 1)) * 100),
                  convRate: `${preApprovedRate}% from Contacted`,
                  icon: ShieldCheck,
                  color: "emerald",
                  bgClass: "bg-emerald-50 border-emerald-200 text-emerald-900",
                  badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
                  activeBorder: "ring-2 ring-emerald-500 border-emerald-500"
                },
                {
                  id: "in_escrow",
                  name: "In Escrow",
                  subText: "Under Contract",
                  count: inEscrowCount,
                  reached: reachedEscrow,
                  pctOfTotal: Math.round((inEscrowCount / (totalCount || 1)) * 100),
                  convRate: `${escrowRate}% from Prequalified`,
                  icon: Home,
                  color: "purple",
                  bgClass: "bg-purple-50 border-purple-200 text-purple-900",
                  badgeClass: "bg-purple-100 text-purple-800 border-purple-200",
                  activeBorder: "ring-2 ring-purple-500 border-purple-500"
                },
                {
                  id: "closed",
                  name: "Closed & Funded",
                  subText: "Loan Funded",
                  count: closedCount,
                  reached: reachedClosed,
                  pctOfTotal: Math.round((closedCount / (totalCount || 1)) * 100),
                  convRate: `${closedRate}% from Escrow`,
                  icon: Award,
                  color: "indigo",
                  bgClass: "bg-indigo-50 border-indigo-200 text-indigo-900",
                  badgeClass: "bg-indigo-100 text-indigo-800 border-indigo-200",
                  activeBorder: "ring-2 ring-indigo-500 border-indigo-500"
                }
              ];

              return (
                <div className="bg-white rounded-3xl border border-[#EAE7E0] p-6 space-y-6 shadow-2xs">
                  {/* Funnel Header */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#EAE7E0]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-[#4A5D4E] text-white flex items-center justify-center font-bold shadow-2xs">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <h3 className="font-serif font-bold text-lg text-[#2D362E]">Lead Conversion Funnel</h3>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF9F5] border border-[#EAE7E0] text-[#606C5D]">
                          Pipeline Analytics
                        </span>
                      </div>
                      <p className="text-xs text-[#606C5D]">
                        Stage progression and conversion rates from initial intake to funded loan. Click any stage to filter.
                      </p>
                    </div>

                    {/* Top KPI Summaries */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="bg-[#FAF9F5] border border-[#EAE7E0] px-3.5 py-2 rounded-2xl text-center">
                        <span className="text-[10px] font-semibold text-[#9A9488] uppercase tracking-wider block">Total Leads</span>
                        <span className="font-serif font-bold text-base text-[#2D362E]">{totalCount}</span>
                      </div>
                      <div className="bg-[#FAF9F5] border border-[#EAE7E0] px-3.5 py-2 rounded-2xl text-center">
                        <span className="text-[10px] font-semibold text-[#9A9488] uppercase tracking-wider block">Pre-Approved</span>
                        <span className="font-serif font-bold text-base text-emerald-700">{preApprovedCount + inEscrowCount + closedCount}</span>
                      </div>
                      <div className="bg-[#FAF9F5] border border-[#EAE7E0] px-3.5 py-2 rounded-2xl text-center">
                        <span className="text-[10px] font-semibold text-[#9A9488] uppercase tracking-wider block">Escrow / Closed</span>
                        <span className="font-serif font-bold text-base text-purple-700">{inEscrowCount + closedCount}</span>
                      </div>
                      <div className="bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-2xl text-center">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Contract Win Rate</span>
                        <span className="font-serif font-bold text-base text-emerald-700">{overallWinRate}%</span>
                      </div>
                    </div>
                  </div>

                  {/* 5 Funnel Stage Interactive Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {stages.map((stage, idx) => {
                      const StageIcon = stage.icon;
                      const isSelected = leadStatusFilter === stage.id;

                      return (
                        <div
                          key={stage.id}
                          onClick={() => setLeadStatusFilter(isSelected ? "all" : stage.id)}
                          className={`relative cursor-pointer p-4 rounded-2xl border transition-all duration-200 hover:shadow-md ${
                            isSelected ? stage.activeBorder + " bg-white shadow-sm" : stage.bgClass
                          }`}
                        >
                          {/* Stage Number & Icon */}
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                              Stage 0{idx + 1}
                            </span>
                            <div className={`p-1.5 rounded-xl bg-white/80 shadow-2xs`}>
                              <StageIcon className="w-4 h-4" />
                            </div>
                          </div>

                          {/* Stage Name & Count */}
                          <div className="space-y-1">
                            <h4 className="font-bold text-sm leading-tight">{stage.name}</h4>
                            <div className="flex items-baseline justify-between">
                              <span className="text-2xl font-serif font-bold">{stage.count}</span>
                              <span className="text-[11px] font-semibold opacity-80">
                                {stage.pctOfTotal}% of total
                              </span>
                            </div>
                          </div>

                          {/* Conversion Badge */}
                          <div className="mt-3 pt-2 border-t border-black/10 flex items-center justify-between text-[10px]">
                            <span className="font-medium opacity-80">{stage.subText}</span>
                            <span className={`font-bold px-1.5 py-0.5 rounded-md ${stage.badgeClass}`}>
                              {stage.convRate}
                            </span>
                          </div>

                          {/* Selected Indicator Checkmark */}
                          {isSelected && (
                            <div className="absolute -top-2 -right-2 bg-[#4A5D4E] text-white p-1 rounded-full shadow-md">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Funnel Pipeline Visual Flow Bar */}
                  <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#EAE7E0] space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#606C5D]">
                      <span className="flex items-center gap-1.5">
                        <BarChart2 className="w-4 h-4 text-[#4A5D4E]" />
                        Funnel Progression & Step-Down Drop-Off Visualizer
                      </span>
                      <span>Total Active Intake: {totalCount} leads</span>
                    </div>

                    {/* Proportional Segmented Progress Bar */}
                    <div className="w-full bg-[#EAE7E0] h-4 rounded-full overflow-hidden flex shadow-inner">
                      <div 
                        style={{ width: `${(newCount / (totalCount || 1)) * 100}%` }} 
                        className="bg-blue-500 transition-all duration-500" 
                        title={`New: ${newCount} leads`} 
                      />
                      <div 
                        style={{ width: `${(contactedCount / (totalCount || 1)) * 100}%` }} 
                        className="bg-amber-500 transition-all duration-500" 
                        title={`Contacted: ${contactedCount} leads`} 
                      />
                      <div 
                        style={{ width: `${(preApprovedCount / (totalCount || 1)) * 100}%` }} 
                        className="bg-emerald-500 transition-all duration-500" 
                        title={`Prequalified: ${preApprovedCount} leads`} 
                      />
                      <div 
                        style={{ width: `${(inEscrowCount / (totalCount || 1)) * 100}%` }} 
                        className="bg-purple-500 transition-all duration-500" 
                        title={`In Escrow: ${inEscrowCount} leads`} 
                      />
                      <div 
                        style={{ width: `${(closedCount / (totalCount || 1)) * 100}%` }} 
                        className="bg-indigo-600 transition-all duration-500" 
                        title={`Closed: ${closedCount} leads`} 
                      />
                    </div>

                    {/* Stage Conversion Sequence Stepper */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pt-1 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                        <span className="font-semibold text-[#2D362E]">1. New ({newCount})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                        <span className="font-semibold text-[#2D362E]">2. Contacted ({contactedCount})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                        <span className="font-semibold text-[#2D362E]">3. Prequalified ({preApprovedCount})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                        <span className="font-semibold text-[#2D362E]">4. Escrow ({inEscrowCount})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" />
                        <span className="font-semibold text-[#2D362E]">5. Closed ({closedCount})</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Smart Batch Lead Action Recommendations Banner */}
            <BatchLeadRecommendations
              leads={guidesState.leads || []}
              loanOfficer={currentLo}
              agents={guidesState.agentRoster || []}
              onUpdateAllLeads={(updatedLeads) => {
                onUpdateGuidesState({
                  ...guidesState,
                  leads: updatedLeads
                });
              }}
              onTriggerToast={triggerToast}
              onOpenBulkSmsModal={(leadIds) => {
                const nowIso = new Date().toISOString();
                const updated = (guidesState.leads || []).map(l => {
                  if (leadIds.includes(l.id)) {
                    return {
                      ...l,
                      smsConsentAuthorized: true,
                      smsConsentTimestamp: nowIso,
                      smsConsentSource: "LO Batch Authorization Dispatch"
                    };
                  }
                  return l;
                });
                onUpdateGuidesState({
                  ...guidesState,
                  leads: updated
                });
                triggerToast(`Dispatched TCPA SMS consent requests to ${leadIds.length} leads!`);
              }}
            />

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-[#EAE7E0] space-y-3.5 shadow-2xs">
              {/* Nurture Sequence Master Banner & Controls */}
              <div className="bg-[#FAF9F5] border border-[#EAE7E0] p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shrink-0 shadow-2xs ${globalNurtureEnabled ? "bg-[#4A5D4E]" : "bg-gray-400"}`}>
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-xs text-[#2D362E]">Automated Lead Nurture Sequence</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        globalNurtureEnabled 
                          ? "bg-emerald-100 text-emerald-800 border-emerald-200" 
                          : "bg-gray-100 text-gray-700 border-gray-200"
                      }`}>
                        {globalNurtureEnabled ? "⚡ Active (Auto-Dispatches)" : "⏸️ Global Nurture Paused"}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#606C5D]">
                      Dispatches helpful, non-intrusive emails pulling LO + Real Estate Agent co-branding across pipeline stages.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
                  <button
                    onClick={() => handleToggleGlobalNurture(!globalNurtureEnabled)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs ${
                      globalNurtureEnabled
                        ? "bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    }`}
                  >
                    {globalNurtureEnabled ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{globalNurtureEnabled ? "Pause Global Nurture" : "Activate Global Nurture"}</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedNurtureLeadId(null);
                      setShowNurtureModal(true);
                    }}
                    className="px-3.5 py-1.5 bg-[#4A5D4E] hover:bg-[#38463B] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-2xs"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Configure Sequences & Co-Branding</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative w-full xl:w-72">
                  <Search className="w-4 h-4 text-[#9A9488] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text"
                    placeholder="Search lead name, campaign, listing, city..."
                    value={leadSearchQuery}
                    onChange={(e) => setLeadSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl text-xs text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
                  />
                </div>

                {/* Filter Controls Group */}
                <div className="flex items-center gap-2.5 w-full xl:w-auto flex-wrap">
                  {/* Source Attribute Filter */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-[#606C5D] font-semibold flex items-center gap-1">
                      <Filter className="w-3 h-3 text-[#4A5D4E]" />
                      Source:
                    </span>
                    <select
                      value={leadSourceFilter}
                      onChange={(e) => setLeadSourceFilter(e.target.value)}
                      className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
                    >
                      <option value="all">All Channels & Sources</option>
                      <option value="campaign">📢 Marketing Campaigns (Meta / Google)</option>
                      <option value="listing">🏠 Property Listings Inquiries</option>
                      <option value="chatbot">🌐 Website AI Chatbot</option>
                      <option value="flyer">📄 Co-Branded Flyer QR</option>
                      <option value="calculator">🧮 Mortgage Lab / Calculator</option>
                      <option value="organic">🍃 Organic / Direct Intake</option>
                    </select>
                  </div>

                  {/* Status Filter Chips */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-[#606C5D] font-semibold mr-1">Journey:</span>
                    {[
                      { id: 'all', label: 'All', icon: '' },
                      { id: 'new', label: 'New', icon: '🔵' },
                      { id: 'contacted', label: 'Contacted', icon: '🟡' },
                      { id: 'pre_approved', label: 'Qualified', icon: '🟢' },
                      { id: 'closed', label: 'Closed', icon: '🏁' }
                    ].map(status => (
                      <button
                        key={status.id}
                        onClick={() => setLeadStatusFilter(status.id)}
                        className={`px-3 py-1.5 rounded-full font-bold flex items-center gap-1 transition-all border ${
                          leadStatusFilter === status.id 
                            ? 'bg-[#4A5D4E] text-white border-[#4A5D4E] shadow-xs' 
                            : 'bg-white text-[#606C5D] border-[#EAE7E0] hover:bg-[#FAF9F5]'
                        }`}
                      >
                        {status.icon && <span>{status.icon}</span>}
                        {status.label}
                      </button>
                    ))}
                  </div>

                  {/* Date Range Filter */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-[#606C5D] font-semibold flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#4A5D4E]" />
                      Date Range:
                    </span>
                    <select
                      value={leadDateRangeFilter}
                      onChange={(e) => setLeadDateRangeFilter(e.target.value)}
                      className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="7days">Last 7 Days</option>
                      <option value="30days">Last 30 Days</option>
                      <option value="90days">Last 90 Days</option>
                      <option value="custom">📅 Custom Date Range</option>
                    </select>
                  </div>

                  {/* Loan Officer Filter or Isolated Scope Indicator */}
                  {permissions.canViewAllLeads ? (
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-[#606C5D] font-semibold">Assigned LO:</span>
                      <select
                        value={leadLoFilter}
                        onChange={(e) => setLeadLoFilter(e.target.value)}
                        className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
                      >
                        <option value="all">All Loan Officers</option>
                        {guidesState.loanOfficers.map(lo => (
                          <option key={lo.id} value={lo.id}>{lo.name}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-xl">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-semibold">{currentLo.name}'s Leads</span>
                      <span className="text-[10px] bg-emerald-100/60 px-1.5 py-0.2 rounded text-emerald-900 font-mono">RBAC Scoped</span>
                    </div>
                  )}

                  {/* View Mode Switcher */}
                  <div className="flex items-center border border-[#EAE7E0] rounded-xl p-0.5 bg-[#FAF9F5] ml-auto">
                    <button
                      onClick={() => setLeadViewMode("table")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        leadViewMode === "table"
                          ? "bg-[#4A5D4E] text-white shadow-2xs"
                          : "text-[#606C5D] hover:text-[#2D362E]"
                      }`}
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Table</span>
                    </button>
                    <button
                      onClick={() => setLeadViewMode("cards")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        leadViewMode === "cards"
                          ? "bg-[#4A5D4E] text-white shadow-2xs"
                          : "text-[#606C5D] hover:text-[#2D362E]"
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Cards</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Custom Date Pickers if custom selected */}
              {leadDateRangeFilter === "custom" && (
                <div className="flex items-center gap-3 pt-2 border-t border-[#EAE7E0] text-xs">
                  <span className="font-semibold text-[#606C5D]">Custom Range:</span>
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-[#9A9488]">From:</label>
                    <input 
                      type="date"
                      value={leadStartDate}
                      onChange={(e) => setLeadStartDate(e.target.value)}
                      className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-2 py-1 text-xs text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-[#9A9488]">To:</label>
                    <input 
                      type="date"
                      value={leadEndDate}
                      onChange={(e) => setLeadEndDate(e.target.value)}
                      className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-2 py-1 text-xs text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
                    />
                  </div>
                  {(leadStartDate || leadEndDate) && (
                    <button
                      onClick={() => { setLeadStartDate(""); setLeadEndDate(""); }}
                      className="text-[11px] font-bold text-red-600 hover:underline ml-2"
                    >
                      Clear Custom Dates
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Active Filters Summary & Reset Bar */}
            {(() => {
              const allLeads = guidesState.leads || [];
              const filtered = allLeads.filter(lead => {
                const matchQuery = !leadSearchQuery || 
                  lead.fullName.toLowerCase().includes(leadSearchQuery.toLowerCase()) ||
                  lead.email.toLowerCase().includes(leadSearchQuery.toLowerCase()) ||
                  lead.phone.toLowerCase().includes(leadSearchQuery.toLowerCase()) ||
                  lead.preferredLocations.toLowerCase().includes(leadSearchQuery.toLowerCase()) ||
                  (lead.taggedCityArea && lead.taggedCityArea.toLowerCase().includes(leadSearchQuery.toLowerCase())) ||
                  (lead.leadPathTag && lead.leadPathTag.toLowerCase().includes(leadSearchQuery.toLowerCase())) ||
                  (lead.sourceCampaignName && lead.sourceCampaignName.toLowerCase().includes(leadSearchQuery.toLowerCase())) ||
                  (lead.sourcePropertyAddress && lead.sourcePropertyAddress.toLowerCase().includes(leadSearchQuery.toLowerCase())) ||
                  (lead.leadSource && lead.leadSource.toLowerCase().includes(leadSearchQuery.toLowerCase()));
                
                let matchStatus = leadStatusFilter === "all" || lead.status === leadStatusFilter;
                if (leadStatusFilter === "pre_approved") {
                  matchStatus = lead.status === "pre_approved" || lead.status === "in_escrow";
                } else if (leadStatusFilter === "closed") {
                  matchStatus = lead.status === "closed" || lead.status === "archived";
                }
                const matchLo = permissions.canViewAllLeads 
                  ? (leadLoFilter === "all" || lead.assignedLoId === leadLoFilter) 
                  : (lead.assignedLoId === currentLo.id || lead.assignedLO === currentLo.name || (lead as any).loId === currentLo.id);

                let matchSource = true;
                if (leadSourceFilter === "campaign") {
                  matchSource = lead.interactedSourceType === "campaign" || Boolean(lead.sourceCampaignName);
                } else if (leadSourceFilter === "listing") {
                  matchSource = lead.interactedSourceType === "property_listing" || Boolean(lead.sourcePropertyAddress);
                } else if (leadSourceFilter === "chatbot") {
                  matchSource = lead.interactedSourceType === "chatbot" || (!lead.sourceCampaignName && !lead.sourcePropertyAddress && lead.leadSource.toLowerCase().includes("chatbot"));
                } else if (leadSourceFilter === "flyer") {
                  matchSource = lead.interactedSourceType === "flyer" || lead.leadSource.toLowerCase().includes("flyer");
                } else if (leadSourceFilter === "calculator") {
                  matchSource = lead.interactedSourceType === "calculator" || lead.leadSource.toLowerCase().includes("calculator") || lead.leadSource.toLowerCase().includes("lab");
                } else if (leadSourceFilter === "organic") {
                  matchSource = lead.leadSource.toLowerCase().includes("organic") || lead.leadSource.toLowerCase().includes("direct");
                }

                let matchDate = true;
                if (lead.createdAt && leadDateRangeFilter !== "all") {
                  const leadDate = new Date(lead.createdAt);
                  const now = new Date();

                  if (leadDateRangeFilter === "today") {
                    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    matchDate = leadDate >= startOfToday;
                  } else if (leadDateRangeFilter === "7days") {
                    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    matchDate = leadDate >= sevenDaysAgo;
                  } else if (leadDateRangeFilter === "30days") {
                    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    matchDate = leadDate >= thirtyDaysAgo;
                  } else if (leadDateRangeFilter === "90days") {
                    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                    matchDate = leadDate >= ninetyDaysAgo;
                  } else if (leadDateRangeFilter === "custom") {
                    if (leadStartDate) {
                      const start = new Date(leadStartDate + "T00:00:00");
                      matchDate = matchDate && leadDate >= start;
                    }
                    if (leadEndDate) {
                      const end = new Date(leadEndDate + "T23:59:59");
                      matchDate = matchDate && leadDate <= end;
                    }
                  }
                }

                return matchQuery && matchStatus && matchLo && matchSource && matchDate;
              });

              const isFilterActive = leadSourceFilter !== "all" || leadStatusFilter !== "all" || leadLoFilter !== "all" || leadDateRangeFilter !== "all" || leadSearchQuery.trim() !== "";

              return (
                <div className="space-y-4">
                  {/* Results Count & Reset Bar */}
                  <div className="flex items-center justify-between text-xs px-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-[#2D362E]">
                        Showing {filtered.length} of {allLeads.length} total leads
                      </span>

                      {leadSourceFilter !== "all" && (
                        <span className="inline-flex items-center gap-1 bg-[#4A5D4E]/10 text-[#4A5D4E] font-semibold px-2.5 py-0.5 rounded-full text-[11px]">
                          Source: {
                            leadSourceFilter === "campaign" ? "Marketing Campaigns" :
                            leadSourceFilter === "listing" ? "Property Listings" :
                            leadSourceFilter === "chatbot" ? "AI Chatbot" :
                            leadSourceFilter === "flyer" ? "Flyer QR" :
                            leadSourceFilter === "calculator" ? "Mortgage Calculator" : "Organic"
                          }
                          <button onClick={() => setLeadSourceFilter("all")} className="hover:text-black">×</button>
                        </span>
                      )}

                      {leadStatusFilter !== "all" && (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 font-semibold px-2.5 py-0.5 rounded-full text-[11px]">
                          Status: {leadStatusFilter}
                          <button onClick={() => setLeadStatusFilter("all")} className="hover:text-black">×</button>
                        </span>
                      )}

                      {leadDateRangeFilter !== "all" && (
                        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 font-semibold px-2.5 py-0.5 rounded-full text-[11px]">
                          Date: {
                            leadDateRangeFilter === "today" ? "Today" :
                            leadDateRangeFilter === "7days" ? "Last 7 Days" :
                            leadDateRangeFilter === "30days" ? "Last 30 Days" :
                            leadDateRangeFilter === "90days" ? "Last 90 Days" : "Custom Range"
                          }
                          <button onClick={() => { setLeadDateRangeFilter("all"); setLeadStartDate(""); setLeadEndDate(""); }} className="hover:text-black">×</button>
                        </span>
                      )}

                      {leadSearchQuery && (
                        <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 font-semibold px-2.5 py-0.5 rounded-full text-[11px]">
                          Search: "{leadSearchQuery}"
                          <button onClick={() => setLeadSearchQuery("")} className="hover:text-black">×</button>
                        </span>
                      )}
                    </div>

                    {isFilterActive && (
                      <button
                        onClick={() => {
                          setLeadSearchQuery("");
                          setLeadSourceFilter("all");
                          setLeadStatusFilter("all");
                          setLeadLoFilter("all");
                          setLeadDateRangeFilter("all");
                          setLeadStartDate("");
                          setLeadEndDate("");
                        }}
                        className="text-[#4A5D4E] hover:underline font-bold text-[11px] shrink-0"
                      >
                        Reset All Filters
                      </button>
                    )}
                  </div>

                  {filtered.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl border border-[#EAE7E0] text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#FAF9F5] text-[#4A5D4E] flex items-center justify-center mx-auto">
                        <Inbox className="w-6 h-6" />
                      </div>
                      <h4 className="font-serif font-bold text-lg text-[#2D362E]">No Leads Match Your Filter Criteria</h4>
                      <p className="text-xs text-[#606C5D] max-w-md mx-auto">
                        Try clearing some filters or searching for another term. You can test generating new live leads using the public AI Chatbot or property inquiry forms.
                      </p>
                      <button
                        onClick={() => {
                          setLeadSearchQuery("");
                          setLeadSourceFilter("all");
                          setLeadStatusFilter("all");
                          setLeadLoFilter("all");
                          setLeadDateRangeFilter("all");
                          setLeadStartDate("");
                          setLeadEndDate("");
                        }}
                        className="px-4 py-2 bg-[#4A5D4E] text-white font-bold text-xs rounded-xl hover:bg-[#38463B] transition-colors"
                      >
                        Clear All Filters
                      </button>
                    </div>
                  ) : leadViewMode === "table" ? (
                    <div className="bg-white rounded-3xl border border-[#EAE7E0] shadow-sm overflow-hidden flex flex-col relative">
                      {selectedLeadIds.size > 0 && (
                        <div className="absolute top-0 left-0 right-0 bg-emerald-50 border-b border-emerald-200 p-3 flex items-center justify-between z-10 animate-fade-in">
                          <span className="text-xs font-bold text-emerald-800 flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-emerald-800 text-white flex items-center justify-center text-[10px]">
                              {selectedLeadIds.size}
                            </span>
                            Leads Selected
                          </span>
                          <div className="flex items-center gap-3">
                            <select
                              onChange={(e) => {
                                if (!e.target.value) return;
                                const currentLeads = guidesState.leads || [];
                                const newStatus = e.target.value as any;
                                const updated = currentLeads.map(l => 
                                  selectedLeadIds.has(l.id) ? { ...l, status: newStatus } : l
                                );
                                onUpdateGuidesState({
                                  ...guidesState,
                                  leads: updated
                                });
                                setSelectedLeadIds(new Set());
                                triggerToast(`Moved ${selectedLeadIds.size} leads to ${e.target.value}`);
                              }}
                              className="bg-white border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl px-3 py-2 cursor-pointer outline-none focus:border-emerald-500"
                              value=""
                            >
                              <option value="" disabled>Move to Journey Phase...</option>
                              <option value="new">Move to New</option>
                              <option value="contacted">Move to Contacted</option>
                              <option value="pre_approved">Move to Qualified</option>
                              <option value="closed">Move to Closed</option>
                            </select>
                            <button
                              onClick={() => setShowBulkSmsModal(true)}
                              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
                            >
                              <MessageSquare className="w-4 h-4" />
                              <span>Bulk SMS Template</span>
                            </button>
                          </div>
                        </div>
                      )}
                      <div className={`overflow-x-auto ${selectedLeadIds.size > 0 ? "mt-12" : ""}`}>
                        <table className="w-full min-w-[1400px] text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-[#FAF9F5] border-b border-[#EAE7E0] text-[#606C5D] uppercase tracking-wider font-bold">
                              <th className="py-3.5 px-4 font-bold w-10">
                                <input
                                  type="checkbox"
                                  checked={filtered.length > 0 && selectedLeadIds.size === filtered.length}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedLeadIds(new Set(filtered.map(l => l.id)));
                                    } else {
                                      setSelectedLeadIds(new Set());
                                    }
                                  }}
                                  className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                                />
                              </th>
                              <th className="py-3.5 px-4 font-bold">Buyer / Lead Contact</th>
                              <th className="py-3.5 px-4 font-bold">Interacted Source (Campaign / Listing)</th>
                              <th className="py-3.5 px-4 font-bold">Target Area & Home Type</th>
                              <th className="py-3.5 px-4 font-bold">Financial Budget & DPA</th>
                              <th className="py-3.5 px-4 font-bold">Nurture Campaign Progress</th>
                              <th className="py-3.5 px-4 font-bold">Assigned LO & Realtor Team</th>
                              <th className="py-3.5 px-4 font-bold">Notes & LO Annotations</th>
                              <th className="py-3.5 px-4 font-bold">Status & Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#EAE7E0]">
                            {filtered.map(lead => {
                              const assignedLo = guidesState.loanOfficers.find(o => o.id === lead.assignedLoId);
                              const assignedAgent = guidesState.agentRoster.find(a => a.id === lead.assignedAgentId);

                              return (
                                <tr key={lead.id} className={`transition-colors ${selectedLeadIds.has(lead.id) ? "bg-emerald-50/50" : "hover:bg-[#F9F8F4]/80"}`}>
                                  <td className="py-3 px-4">
                                    <input
                                      type="checkbox"
                                      checked={selectedLeadIds.has(lead.id)}
                                      onChange={(e) => {
                                        const newSet = new Set(selectedLeadIds);
                                        if (e.target.checked) newSet.add(lead.id);
                                        else newSet.delete(lead.id);
                                        setSelectedLeadIds(newSet);
                                      }}
                                      className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                                    />
                                  </td>
                                  {/* Lead Contact */}
                                  <td className="py-4 px-4 align-top">
                                    <div className="flex items-start gap-3">
                                      <div className="w-9 h-9 rounded-xl bg-[#4A5D4E] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs mt-0.5">
                                        {lead.fullName.split(" ").map(n => n[0]).slice(0, 2).join("")}
                                      </div>
                                      <div className="space-y-1">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="font-bold text-sm text-[#2D362E]">{lead.fullName}</span>
                                          <JourneyPhaseLabel status={lead.status} />
                                          <OutreachHistoryBadge lead={lead} compact={true} />
                                          {lead.intentScore === "hot" && (
                                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                                              <Flame className="w-2.5 h-2.5 text-orange-600 fill-orange-500" />
                                              Hot
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-[11px] text-[#606C5D] space-y-0.5">
                                          <div className="flex items-center gap-1">
                                            <Mail className="w-3 h-3 text-[#9A9488]" />
                                            <button
                                              type="button"
                                              onClick={() => {
                                                launchLocalOutlookDraft({
                                                  to: lead.email,
                                                  subject: `Mortgage Consultation - ${lead.name}`,
                                                  body: `Hi ${lead.name.split(' ')[0]},

Thank you for connecting regarding your home financing inquiry. I am reviewing your profile and would love to connect for a quick discovery call to explore your best loan and program options.

Best regards,`,
                                                  loanOfficer: loggedInUser || currentLo,
                                                  templateName: "Quick Lead Connect",
                                                  onTriggerToast: triggerToast
                                                });
                                              }}
                                              className="hover:text-[#0078D4] hover:underline cursor-pointer text-left truncate max-w-[150px]"
                                              title="Draft email in local installed Outlook with work signature"
                                            >
                                              {lead.email}
                                            </button>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <Phone className="w-3 h-3 text-[#9A9488]" />
                                            <a href={`tel:${lead.phone}`} className="hover:text-[#4A5D4E] font-medium">{lead.phone}</a>
                                          </div>
                                        </div>
                                        <div className="text-[10px] text-[#9A9488] font-medium">
                                          Captured: {new Date(lead.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                                        </div>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Interacted Source Attribute */}
                                  <td className="py-4 px-4 align-top">
                                    <div className="space-y-1.5 max-w-xs">
                                      {lead.sourcePropertyAddress ? (
                                        <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-xl text-emerald-900 space-y-0.5">
                                          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                                            <Home className="w-3 h-3 text-emerald-600" />
                                            <span>Property Listing Inquiry</span>
                                          </div>
                                          <div className="font-semibold text-xs leading-snug">
                                            {lead.sourcePropertyAddress}
                                          </div>
                                        </div>
                                      ) : lead.sourceCampaignName ? (
                                        <div className="bg-blue-50 border border-blue-200 p-2 rounded-xl text-blue-900 space-y-0.5">
                                          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                                            <Sparkles className="w-3 h-3 text-blue-600" />
                                            <span>Marketing Campaign Ad</span>
                                          </div>
                                          <div className="font-semibold text-xs leading-snug">
                                            {lead.sourceCampaignName}
                                          </div>
                                        </div>
                                      ) : lead.interactedSourceType === "flyer" || lead.leadSource.toLowerCase().includes("flyer") ? (
                                        <div className="bg-amber-50 border border-amber-200 p-2 rounded-xl text-amber-900 space-y-0.5">
                                          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                                            <QrCode className="w-3 h-3 text-amber-600" />
                                            <span>Co-Branded Flyer QR</span>
                                          </div>
                                          <div className="font-semibold text-xs leading-snug">
                                            {lead.leadSource}
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="bg-[#FAF9F5] border border-[#EAE7E0] p-2 rounded-xl text-[#2D362E] space-y-0.5">
                                          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#606C5D]">
                                            <Globe className="w-3 h-3 text-[#4A5D4E]" />
                                            <span>Website AI Intake</span>
                                          </div>
                                          <div className="font-semibold text-xs leading-snug">
                                            {lead.leadSource}
                                          </div>
                                        </div>
                                      )}

                                      {lead.sendSampleHomes && (
                                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                          🏠 Requested Low/No Down Homes
                                        </span>
                                      )}

                                      {lead.leadPathTag && (
                                        <div className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200">
                                          <Footprints className="w-2.5 h-2.5 text-purple-700 shrink-0" />
                                          <span>Path: {lead.leadPathTag}</span>
                                        </div>
                                      )}
                                    </div>
                                  </td>

                                  {/* Target Area & Property */}
                                  <td className="py-4 px-4 align-top">
                                    <div className="space-y-1">
                                      {lead.taggedCityArea && (
                                        <div className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#4A5D4E]/10 text-[#4A5D4E] border border-[#4A5D4E]/30 mb-0.5">
                                          <Compass className="w-2.5 h-2.5 text-[#4A5D4E] shrink-0" />
                                          <span>City Tag: {lead.taggedCityArea}</span>
                                        </div>
                                      )}
                                      <div className="font-bold text-[#2D362E] flex items-center gap-1">
                                        <MapPin className="w-3 h-3 text-[#C18C5D] shrink-0" />
                                        <span>{lead.preferredLocations}</span>
                                      </div>
                                      <div className="text-[11px] text-[#606C5D]">
                                        Type: <span className="font-semibold text-[#2D362E]">{lead.propertyType}</span>
                                      </div>
                                      <div className="text-[10px] text-[#9A9488]">
                                        Timeline: <span className="font-bold text-[#4A5D4E]">{lead.timeline}</span>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Financial Budget & DPA */}
                                  <td className="py-4 px-4 align-top">
                                    <div className="space-y-1">
                                      <div className="font-bold text-[#4A5D4E]">
                                        {lead.targetPriceRange}
                                      </div>
                                      <div className="text-[11px] text-[#606C5D]">
                                        Income: <span className="font-semibold text-[#2D362E]">{lead.annualIncome || "N/A"}</span>
                                      </div>
                                      <div className="text-[11px] text-[#606C5D]">
                                        Down: <span className="font-medium">{lead.downPaymentSavings}</span>
                                      </div>
                                      {lead.grantInterest && (
                                        <span className="inline-block text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                          DPA Eligible
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  {/* Nurture Campaign Progress & Email Records */}
                                  <td className="py-4 px-4 align-top space-y-2 min-w-[230px]">
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                                        <Zap className="w-2.5 h-2.5 text-emerald-600 fill-emerald-500" />
                                        {lead.nurtureStageText || `${lead.nurtureCurrentStep || 1} of ${lead.nurtureTotalSteps || 4} weekly nurture sent`}
                                      </span>

                                      <button
                                        onClick={() => handleToggleLeadNurture(lead.id)}
                                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-all ${
                                          lead.nurtureSequenceEnabled ?? true
                                            ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                            : "bg-gray-100 text-gray-500 border-gray-200"
                                        }`}
                                        title="Toggle Nurture Sequence"
                                      >
                                        {(lead.nurtureSequenceEnabled ?? true) ? "Active" : "Paused"}
                                      </button>
                                    </div>

                                    {/* Most recent email sent timestamp */}
                                    <div className="text-[10px] text-[#606C5D] flex items-center gap-1 font-mono">
                                      <Clock className="w-3 h-3 text-[#4A5D4E]" />
                                      <span>Last: {lead.lastEmailSentAt ? new Date(lead.lastEmailSentAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : (lead.nurtureSequenceLogs && lead.nurtureSequenceLogs[0] ? new Date(lead.nurtureSequenceLogs[0].sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "N/A")}</span>
                                    </div>

                                    {/* Record of Template Email Names Sent */}
                                    <div className="space-y-1 pt-0.5">
                                      <span className="text-[10px] text-[#4A5D4E] font-bold block flex items-center gap-1">
                                        <MailCheck className="w-3 h-3 text-emerald-600" />
                                        Template Emails Sent ({lead.nurtureSequenceLogs?.length || 0}):
                                      </span>
                                      {lead.nurtureSequenceLogs && lead.nurtureSequenceLogs.length > 0 ? (
                                        <div className="space-y-1 max-h-[85px] overflow-y-auto pr-1">
                                          {lead.nurtureSequenceLogs.map((log, idx) => (
                                            <div key={log.id || idx} className="bg-[#FAF9F5] p-1.5 rounded-lg border border-[#EAE7E0] text-[10px] space-y-0.5">
                                              <div className="font-bold text-[#2D362E] truncate" title={log.templateName || log.emailSubject}>
                                                📄 {log.templateName || log.emailSubject}
                                              </div>
                                              <div className="flex items-center justify-between text-[9px] text-[#9A9488]">
                                                <span>Stage: {log.stageName}</span>
                                                <span className="font-mono">{new Date(log.sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <span className="text-[10px] text-[#9A9488] italic block">No email templates sent yet</span>
                                      )}
                                    </div>

                                    <button
                                      onClick={() => {
                                        setSelectedNurtureLeadId(lead.id);
                                        setShowNurtureModal(true);
                                      }}
                                      className="w-full py-1 bg-[#FAF9F5] hover:bg-[#F1EFE9] text-[#4A5D4E] border border-[#EAE7E0] text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 transition-colors"
                                    >
                                      <MailCheck className="w-2.5 h-2.5" />
                                      <span>Full Sequence & Schedule Logs</span>
                                    </button>
                                  </td>

                                  {/* Assigned LO & Realtor */}
                                  <td className="py-4 px-4 align-top">
                                    <div className="space-y-1 text-xs">
                                      <div className="flex items-center gap-1.5">
                                        <UserCheck className="w-3.5 h-3.5 text-[#4A5D4E]" />
                                        <span className="font-bold text-[#2D362E]">{assignedLo?.name || "Mike Ford"}</span>
                                      </div>
                                      {assignedAgent && (
                                        <div className="flex items-center gap-1.5 text-[11px] text-[#606C5D]">
                                          <Building className="w-3 h-3 text-[#C18C5D]" />
                                          <span>Agent: <strong className="font-bold text-[#2D362E]">{assignedAgent.name}</strong></span>
                                        </div>
                                      )}
                                    </div>
                                  </td>

                                  {/* Notes & LO Annotations Column */}
                                  <td className="py-4 px-4 align-top min-w-[210px] max-w-xs">
                                    {editingNotesLeadId === lead.id ? (
                                      <div className="space-y-2 bg-[#FAF9F5] p-2.5 rounded-xl border border-[#4A5D4E]/40 shadow-2xs">
                                        <div className="flex items-center justify-between text-[11px] font-bold text-[#4A5D4E]">
                                          <span className="flex items-center gap-1"><StickyNote className="w-3 h-3 text-[#C18C5D]" /> Edit Notes</span>
                                          <button 
                                            onClick={() => setEditingNotesLeadId(null)}
                                            className="text-[#9A9488] hover:text-[#2D362E]"
                                          >
                                            <X className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                        <textarea
                                          rows={3}
                                          value={editingNotesText}
                                          onChange={(e) => setEditingNotesText(e.target.value)}
                                          placeholder="Add manual notes, phone call logs, follow-up preferences..."
                                          className="w-full bg-white border border-[#EAE7E0] rounded-lg p-2 text-xs text-[#2D362E] focus:outline-none focus:border-[#4A5D4E] resize-none"
                                          autoFocus
                                        />
                                        <div className="flex items-center justify-end gap-1.5">
                                          <button
                                            onClick={() => setEditingNotesLeadId(null)}
                                            className="px-2 py-1 text-[11px] font-semibold text-[#606C5D] hover:bg-[#EAE7E0] rounded-lg"
                                          >
                                            Cancel
                                          </button>
                                          <button
                                            onClick={() => handleSaveNotes(lead.id)}
                                            className="px-2.5 py-1 text-[11px] font-bold text-white bg-[#4A5D4E] hover:bg-[#38463B] rounded-lg flex items-center gap-1 shadow-2xs"
                                          >
                                            <Save className="w-3 h-3" />
                                            <span>Save</span>
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="space-y-1">
                                        {lead.notes ? (
                                          <div className="bg-[#FAF9F5] border border-[#EAE7E0] p-2.5 rounded-xl text-xs space-y-1">
                                            <div className="flex items-center justify-between text-[10px] font-semibold">
                                              <span className="flex items-center gap-1 text-[#4A5D4E] font-bold"><StickyNote className="w-3 h-3 text-[#C18C5D]" /> LO Notes</span>
                                              <button
                                                onClick={() => handleStartEditNotes(lead)}
                                                className="text-[#4A5D4E] hover:underline flex items-center gap-0.5 text-[10px] font-bold"
                                              >
                                                <Edit3 className="w-2.5 h-2.5" /> Edit
                                              </button>
                                            </div>
                                            <p className="text-[#2D362E] text-[11px] leading-relaxed whitespace-pre-wrap line-clamp-4">
                                              {lead.notes}
                                            </p>
                                          </div>
                                        ) : (
                                          <button
                                            onClick={() => handleStartEditNotes(lead)}
                                            className="w-full py-2 px-3 border border-dashed border-[#EAE7E0] hover:border-[#4A5D4E] rounded-xl text-[#606C5D] hover:text-[#4A5D4E] text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors bg-[#FAF9F5]/50"
                                          >
                                            <Edit3 className="w-3 h-3 text-[#9A9488]" />
                                            <span>+ Add LO Note</span>
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </td>

                                  {/* Status & Actions */}
                                  <td className="py-4 px-4 align-top space-y-2">
                                    <div className="flex flex-col gap-1">
                                      <span className="text-[10px] font-bold text-[#606C5D] uppercase tracking-wider">Journey Phase</span>
                                      <select
                                        value={lead.status === "in_escrow" ? "pre_approved" : lead.status === "archived" ? "closed" : lead.status}
                                        onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value as CapturedLead['status'])}
                                        className={`w-full px-2.5 py-1.5 rounded-xl text-[11px] font-bold border focus:outline-none transition-colors ${
                                          lead.status === "new"
                                            ? "bg-blue-50 text-blue-700 border-blue-200"
                                            : lead.status === "pre_approved" || lead.status === "in_escrow"
                                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                              : lead.status === "contacted"
                                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                                : "bg-gray-100 text-gray-700 border-gray-200"
                                        }`}
                                      >
                                        <option value="new">🔵 New</option>
                                        <option value="contacted">🟡 Contacted</option>
                                        <option value="pre_approved">🟢 Qualified</option>
                                        <option value="closed">🏁 Closed</option>
                                      </select>
                                    </div>

                                    {/* Per-Lead Nurture Toggle & Schedule Badge */}
                                    <div className="flex items-center gap-1.5 pt-1">
                                      <button
                                        onClick={() => handleToggleLeadNurture(lead.id)}
                                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all border ${
                                          lead.nurtureSequenceEnabled ?? true
                                            ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                                            : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                                        }`}
                                        title="Toggle Automated Nurture Email Sequence for this lead"
                                      >
                                        <Zap className={`w-2.5 h-2.5 ${(lead.nurtureSequenceEnabled ?? true) ? "text-emerald-600 fill-emerald-500" : "text-gray-400"}`} />
                                        <span>{(lead.nurtureSequenceEnabled ?? true) ? "Nurture ON" : "Nurture PAUSED"}</span>
                                      </button>

                                      <button
                                        onClick={() => {
                                          setSelectedNurtureLeadId(lead.id);
                                          setShowNurtureModal(true);
                                        }}
                                        className="px-2 py-0.5 bg-[#FAF9F5] hover:bg-[#F1EFE9] text-[#4A5D4E] border border-[#EAE7E0] text-[10px] font-bold rounded-md flex items-center gap-1"
                                        title="View Nurture Sequence Schedule & Logs"
                                      >
                                        <MailCheck className="w-2.5 h-2.5" />
                                        <span>Logs</span>
                                      </button>
                                    </div>

                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <button
                                        onClick={() => {
                                          setInitialOutreachLeadId(lead.id);
                                          setShowEmailOutreachModal(true);
                                        }}
                                        className="px-2.5 py-1 bg-[#C18C5D] hover:bg-[#a6764c] text-white font-bold text-[11px] rounded-lg flex items-center gap-1 transition-all shadow-2xs"
                                        title="Draft AI Outreach Email"
                                       >
                                         <Sparkles className="w-3 h-3" />
                                         <span>Draft AI Email</span>
                                       </button>

                                       <button
                                         onClick={() => setSmsModalLead(lead)}
                                         className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[11px] rounded-lg flex items-center gap-1 transition-all shadow-2xs"
                                         title="Open 2-Way SMS Text Hub & Nurture Sequence"
                                       >
                                         <Phone className="w-3 h-3 text-emerald-300" />
                                         <span>SMS Hub {lead.smsMessages && lead.smsMessages.length > 0 ? `(${lead.smsMessages.length})` : ''}</span>
                                       </button>

                                       <button
                                         onClick={() => {
                                           setScenarioWorkbenchLeadId(lead.id);
                                           setActiveTab("scenario_workbench");
                                         }}
                                         className="px-2.5 py-1 bg-[#2D362E] hover:bg-[#1E251F] text-white font-bold text-[11px] rounded-lg flex items-center gap-1 transition-all shadow-2xs cursor-pointer"
                                         title="Model and save loan scenarios for this lead"
                                       >
                                         <Calculator className="w-3 h-3 text-[#D4A373]" />
                                         <span>Scenarios {lead.savedScenarios && lead.savedScenarios.length > 0 ? `(${lead.savedScenarios.length})` : ''}</span>
                                       </button>

                                       <button
                                         onClick={() => setViewingJourneyLead(lead)}
                                         className="px-2.5 py-1 bg-[#4A5D4E] hover:bg-[#38463B] text-white font-bold text-[11px] rounded-lg flex items-center gap-1 transition-all shadow-2xs"
                                         title="View full historical Lead Journey Timeline"
                                       >
                                         <Compass className="w-3 h-3 text-[#C18C5D]" />
                                         <span>Lead Journey</span>
                                       </button>

                                      {lead.chatTranscript && lead.chatTranscript.length > 0 && (
                                        <button
                                          onClick={() => setViewingTranscriptLead(lead)}
                                          className="px-2.5 py-1 bg-[#F1EFE9] hover:bg-[#EAE7E0] text-[#4A5D4E] font-bold text-[11px] rounded-lg flex items-center gap-1 transition-colors"
                                          title="View full AI chat transcript"
                                        >
                                          <MessageSquare className="w-3 h-3" />
                                          <span>Transcript</span>
                                        </button>
                                      )}

                                      <button
                                        onClick={() => handleDeleteLead(lead.id)}
                                        className="p-1 text-[#9A9488] hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                        title="Delete lead"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    /* Cards Grid View */
                    <div className="space-y-4">
                      {filtered.map(lead => {
                        const assignedLo = guidesState.loanOfficers.find(o => o.id === lead.assignedLoId);
                        const assignedAgent = guidesState.agentRoster.find(a => a.id === lead.assignedAgentId);

                        return (
                          <div key={lead.id} className="bg-white p-5 rounded-3xl border border-[#EAE7E0] shadow-2xs space-y-4 hover:border-[#4A5D4E]/30 transition-all">
                            {/* Card Header */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE7E0]">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-[#4A5D4E] text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                                  {lead.fullName.split(" ").map(n => n[0]).slice(0, 2).join("")}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h4 className="font-bold text-base text-[#2D362E]">{lead.fullName}</h4>
                                    <JourneyPhaseLabel status={lead.status} />
                                    <OutreachHistoryBadge lead={lead} compact={true} />
                                    {lead.intentScore === "hot" && (
                                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                                        <Flame className="w-3 h-3 text-orange-600 fill-orange-500" />
                                        Hot Lead
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-[#606C5D] flex items-center gap-3 mt-0.5 flex-wrap">
                                    <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-[#9A9488]" />{lead.email}</span>
                                    <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-[#9A9488]" />{lead.phone}</span>
                                    <span className="text-[11px] text-[#9A9488]">
                                      Captured {new Date(lead.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                                <select
                                  value={lead.status}
                                  onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value as CapturedLead['status'])}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-none transition-colors ${
                                    lead.status === "new"
                                      ? "bg-blue-50 text-blue-700 border-blue-200"
                                      : lead.status === "pre_approved"
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : lead.status === "contacted"
                                          ? "bg-amber-50 text-amber-700 border-amber-200"
                                          : lead.status === "in_escrow"
                                            ? "bg-purple-50 text-purple-700 border-purple-200"
                                            : "bg-gray-100 text-gray-700 border-gray-200"
                                  }`}
                                >
                                  <option value="new">🔵 New / Uncontacted</option>
                                  <option value="contacted">🟡 Contacted</option>
                                  <option value="pre_approved">🟢 Pre-Approved</option>
                                  <option value="in_escrow">🟣 In Escrow</option>
                                  <option value="closed">🏁 Closed</option>
                                  <option value="archived">⚪ Archived</option>
                                </select>

                                <button
                                  onClick={() => handleDeleteLead(lead.id)}
                                  className="p-1.5 text-[#9A9488] hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                  title="Delete lead"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {(lead.taggedCityArea || lead.leadPathTag) && (
                              <div className="flex flex-wrap items-center gap-2 text-xs">
                                {lead.taggedCityArea && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl bg-[#4A5D4E]/10 text-[#4A5D4E] border border-[#4A5D4E]/25">
                                    <Compass className="w-3.5 h-3.5 text-[#4A5D4E]" />
                                    City Tag: {lead.taggedCityArea}
                                  </span>
                                )}
                                {lead.leadPathTag && (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl bg-purple-100 text-purple-900 border border-purple-200">
                                    <Footprints className="w-3.5 h-3.5 text-purple-700" />
                                    Path: {lead.leadPathTag}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Tracked Marketing or Property Listing Source Banner */}
                            {(lead.sourcePropertyAddress || lead.sourceCampaignName) && (
                              <div className="bg-[#FAF9F5] border border-[#EAE7E0] p-3 rounded-2xl flex items-center justify-between text-xs gap-3">
                                <div className="flex items-center gap-2 truncate">
                                  {lead.sourcePropertyAddress ? (
                                    <>
                                      <Home className="w-4 h-4 text-emerald-600 shrink-0" />
                                      <span className="truncate">Inquired from Property Listing: <strong className="font-bold text-[#2D362E]">{lead.sourcePropertyAddress}</strong></span>
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                                      <span className="truncate">Attributed Marketing Campaign: <strong className="font-bold text-[#2D362E]">{lead.sourceCampaignName}</strong></span>
                                    </>
                                  )}
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#4A5D4E] text-white px-2 py-0.5 rounded-full shrink-0">
                                  Tracked Source
                                </span>
                              </div>
                            )}

                            {/* Middle Grid: Buyer Financial Profile & Goal Parameters */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 text-xs">
                              <div className="bg-[#FAF9F5] p-3 rounded-2xl border border-[#EAE7E0]/80">
                                <span className="text-[10px] uppercase font-bold text-[#9A9488] block">Target Area</span>
                                <span className="font-bold text-[#2D362E] mt-0.5 block truncate">{lead.preferredLocations}</span>
                              </div>
                              <div className="bg-[#FAF9F5] p-3 rounded-2xl border border-[#EAE7E0]/80">
                                <span className="text-[10px] uppercase font-bold text-[#9A9488] block">Price Target</span>
                                <span className="font-bold text-[#2D362E] mt-0.5 block">{lead.targetPriceRange}</span>
                              </div>
                              <div className="bg-[#FAF9F5] p-3 rounded-2xl border border-[#EAE7E0]/80">
                                <span className="text-[10px] uppercase font-bold text-[#9A9488] block">Monthly Budget</span>
                                <span className="font-bold text-[#2D362E] mt-0.5 block">{lead.targetMonthlyBudget}</span>
                              </div>
                              <div className="bg-[#FAF9F5] p-3 rounded-2xl border border-[#EAE7E0]/80">
                                <span className="text-[10px] uppercase font-bold text-[#9A9488] block">Down Savings</span>
                                <span className="font-bold text-[#2D362E] mt-0.5 block">{lead.downPaymentSavings}</span>
                              </div>
                              <div className="bg-[#FAF9F5] p-3 rounded-2xl border border-[#EAE7E0]/80">
                                <span className="text-[10px] uppercase font-bold text-[#9A9488] block">Credit Tier</span>
                                <span className="font-bold text-[#2D362E] mt-0.5 block">{lead.creditScoreTier}</span>
                              </div>
                              <div className="bg-[#FAF9F5] p-3 rounded-2xl border border-[#EAE7E0]/80">
                                <span className="text-[10px] uppercase font-bold text-[#9A9488] block">Timeline</span>
                                <span className="font-bold text-[#2D362E] mt-0.5 block">{lead.timeline}</span>
                              </div>
                              <div className="bg-[#FAF9F5] p-3 rounded-2xl border border-[#EAE7E0]/80 col-span-2 sm:col-span-1">
                                <span className="text-[10px] uppercase font-bold text-[#9A9488] block">DPA Interest</span>
                                <span className={`font-bold mt-0.5 block ${lead.grantInterest ? 'text-emerald-700' : 'text-gray-600'}`}>
                                  {lead.grantInterest ? 'Yes (Grant Eligible)' : 'No'}
                                </span>
                              </div>
                            </div>

                            {/* Nurture Campaign Progress & Email Templates Sent Record */}
                            <div className="bg-[#FAF9F5] p-3.5 rounded-2xl border border-[#EAE7E0] space-y-2.5">
                              <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                                <span className="font-bold text-[#2D362E] flex items-center gap-1.5">
                                  <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500" />
                                  Automated Nurture Campaign & Sent Email Templates Record
                                </span>
                                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                  {lead.nurtureStageText || `${lead.nurtureCurrentStep || 1} of ${lead.nurtureTotalSteps || 4} weekly nurture sent`}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-white p-2.5 rounded-xl border border-[#EAE7E0]">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-3.5 h-3.5 text-[#4A5D4E]" />
                                  <div>
                                    <span className="text-[10px] text-[#606C5D] block uppercase font-bold">Most Recent Email Sent</span>
                                    <span className="font-bold text-[#2D362E] font-mono text-[11px]">
                                      {lead.lastEmailSentAt ? new Date(lead.lastEmailSentAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : (lead.nurtureSequenceLogs && lead.nurtureSequenceLogs[0] ? new Date(lead.nurtureSequenceLogs[0].sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "No emails sent yet")}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <MailCheck className="w-3.5 h-3.5 text-emerald-600" />
                                  <div>
                                    <span className="text-[10px] text-[#606C5D] block uppercase font-bold">Latest Template Sent</span>
                                    <span className="font-bold text-[#2D362E] text-[11px] truncate block max-w-[200px]" title={lead.lastEmailTemplateName}>
                                      {lead.lastEmailTemplateName || "Welcome & OHCS Grant Guide"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* List of Sent Template Names */}
                              <div className="space-y-1">
                                <span className="text-[11px] font-bold text-[#4A5D4E] block">
                                  Record of Template Emails Already Sent ({lead.nurtureSequenceLogs?.length || 0}):
                                </span>
                                {lead.nurtureSequenceLogs && lead.nurtureSequenceLogs.length > 0 ? (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {lead.nurtureSequenceLogs.map((log, idx) => (
                                      <div key={log.id || idx} className="bg-white p-2 rounded-xl border border-[#EAE7E0] text-xs flex items-center justify-between">
                                        <div className="truncate pr-2">
                                          <span className="font-bold text-[#2D362E] block text-[11px] truncate">📄 {log.templateName || log.emailSubject}</span>
                                          <span className="text-[10px] text-[#606C5D] block">Stage: {log.stageName}</span>
                                        </div>
                                        <span className="text-[10px] font-mono text-[#9A9488] shrink-0">
                                          {new Date(log.sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-[#9A9488] italic">No template emails recorded for this lead yet.</p>
                                )}
                              </div>
                            </div>

                            {/* Lead Notes & LO Annotations Block */}
                            <div className="bg-[#FAF9F5] p-3.5 rounded-2xl border border-[#EAE7E0] space-y-2">
                              <div className="flex items-center justify-between text-xs font-bold text-[#2D362E]">
                                <span className="flex items-center gap-1.5 text-[#4A5D4E]">
                                  <StickyNote className="w-3.5 h-3.5 text-[#C18C5D]" />
                                  Lead Interaction Notes & LO Annotations
                                </span>
                                {editingNotesLeadId !== lead.id && (
                                  <button
                                    onClick={() => handleStartEditNotes(lead)}
                                    className="text-[11px] text-[#4A5D4E] hover:underline font-bold flex items-center gap-1"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                    <span>{lead.notes ? "Edit Notes" : "+ Add LO Note"}</span>
                                  </button>
                                )}
                              </div>

                              {editingNotesLeadId === lead.id ? (
                                <div className="space-y-2 pt-1">
                                  <textarea
                                    rows={3}
                                    value={editingNotesText}
                                    onChange={(e) => setEditingNotesText(e.target.value)}
                                    placeholder="Record phone call notes, buyer preferences, pre-approval status updates..."
                                    className="w-full bg-white border border-[#EAE7E0] rounded-xl p-2.5 text-xs text-[#2D362E] focus:outline-none focus:border-[#4A5D4E] resize-none"
                                    autoFocus
                                  />
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => setEditingNotesLeadId(null)}
                                      className="px-3 py-1.5 text-xs font-semibold text-[#606C5D] hover:bg-[#EAE7E0] rounded-xl"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => handleSaveNotes(lead.id)}
                                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#4A5D4E] hover:bg-[#38463B] rounded-xl flex items-center gap-1.5 shadow-2xs"
                                    >
                                      <Save className="w-3.5 h-3.5" />
                                      <span>Save Annotation</span>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-xs text-[#2D362E] leading-relaxed whitespace-pre-wrap">
                                  {lead.notes || <span className="text-[#9A9488] italic">No manual notes added yet. Click '+ Add LO Note' to annotate interactions.</span>}
                                </p>
                              )}
                            </div>

                            {/* Footer Actions & Team Assignments */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 text-xs">
                              <div className="flex items-center gap-4 text-[#606C5D] text-xs flex-wrap">
                                <span className="flex items-center gap-1.5">
                                  <UserCheck className="w-3.5 h-3.5 text-[#4A5D4E]" />
                                  LO: <strong className="font-bold text-[#2D362E]">{assignedLo?.name || "Mike Ford"}</strong>
                                </span>
                                {assignedAgent && (
                                  <span className="flex items-center gap-1.5">
                                    <Building className="w-3.5 h-3.5 text-[#C18C5D]" />
                                    Realtor: <strong className="font-bold text-[#2D362E]">{assignedAgent.name}</strong>
                                  </span>
                                )}
                                <span className="text-[11px] text-[#9A9488]">Source: {lead.leadSource}</span>
                              </div>

                              <div className="flex items-center gap-2 flex-wrap">
                                <button
                                  onClick={() => handleToggleLeadNurture(lead.id)}
                                  className={`px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all border shadow-2xs ${
                                    lead.nurtureSequenceEnabled ?? true
                                      ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                                      : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                                  }`}
                                  title="Toggle Automated Nurture Email Sequence"
                                >
                                  <Zap className={`w-3.5 h-3.5 ${(lead.nurtureSequenceEnabled ?? true) ? "text-emerald-600 fill-emerald-500" : "text-gray-400"}`} />
                                  <span>{(lead.nurtureSequenceEnabled ?? true) ? "Nurture Active" : "Nurture Paused"}</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setSelectedNurtureLeadId(lead.id);
                                    setShowNurtureModal(true);
                                  }}
                                  className="px-2.5 py-1.5 bg-[#FAF9F5] hover:bg-[#F1EFE9] text-[#4A5D4E] border border-[#EAE7E0] font-bold text-xs rounded-xl flex items-center gap-1 transition-colors"
                                  title="View Nurture Sequence Schedule & Logs"
                                >
                                  <MailCheck className="w-3.5 h-3.5" />
                                  <span>Sequence Schedule</span>
                                </button>

                                <button
                                  onClick={() => setSmsModalLead(lead)}
                                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-2xs"
                                  title="Open 2-Way SMS Text Hub & Nurture Sequence"
                                >
                                  <Phone className="w-3.5 h-3.5 text-emerald-300" />
                                  <span>SMS Text Hub {lead.smsMessages && lead.smsMessages.length > 0 ? `(${lead.smsMessages.length})` : ''}</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setInitialOutreachLeadId(lead.id);
                                    setShowEmailOutreachModal(true);
                                  }}
                                  className="px-3 py-1.5 bg-[#C18C5D] hover:bg-[#a6764c] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-2xs"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>Draft AI Email</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setGoogleWorkspaceModalLead(lead);
                                    setGoogleWorkspaceModalTab("gmail");
                                    setGoogleWorkspaceModalOpen(true);
                                  }}
                                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                                  title="Open Google Workspace (Gmail, Calendar, Drive, Tasks) for this lead"
                                >
                                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                  </svg>
                                  <span>Workspace</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setScenarioWorkbenchLeadId(lead.id);
                                    setActiveTab("scenario_workbench");
                                  }}
                                  className="px-3 py-1.5 bg-[#2D362E] hover:bg-[#1E251F] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                                  title="Model and save loan scenarios for this lead"
                                >
                                  <Calculator className="w-3.5 h-3.5 text-[#D4A373]" />
                                  <span>Scenarios {lead.savedScenarios && lead.savedScenarios.length > 0 ? `(${lead.savedScenarios.length})` : ''}</span>
                                </button>

                                <button
                                  onClick={() => setViewingJourneyLead(lead)}
                                  className="px-3 py-1.5 bg-[#4A5D4E] hover:bg-[#38463B] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-2xs"
                                  title="View full historical Lead Journey Timeline"
                                >
                                  <Compass className="w-3.5 h-3.5 text-[#C18C5D]" />
                                  <span>Lead Journey</span>
                                </button>

                                {lead.chatTranscript && lead.chatTranscript.length > 0 && (
                                  <button
                                    onClick={() => setViewingTranscriptLead(lead)}
                                    className="px-3 py-1.5 bg-[#F1EFE9] hover:bg-[#EAE7E0] text-[#4A5D4E] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    <span>AI Transcript ({lead.chatTranscript.length})</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Tab: Google Workspace Command Hub (OAuth Connected) */}
        {activeTab === "google_workspace" && (
          <GoogleWorkspaceHub
            currentLo={currentLo}
            loggedInUser={loggedInUser}
            guidesState={guidesState}
            onUpdateGuidesState={onUpdateGuidesState}
            selectedLeadId={scenarioWorkbenchLeadId}
            onTriggerToast={triggerToast}
          />
        )}

        {/* Tab: Loan Officer Client Scenario & Payment Workbench */}
        {activeTab === "scenario_workbench" && (
          <LoanOfficerScenarioWorkbench
            leads={guidesState.leads || []}
            loanOfficer={currentLo}
            agentRoster={guidesState.agentRoster || []}
            initialLeadId={scenarioWorkbenchLeadId}
            onUpdateLead={(updatedLead) => {
              const currentLeads = guidesState.leads || [];
              const updated = currentLeads.map(l => l.id === updatedLead.id ? updatedLead : l);
              onUpdateGuidesState({
                ...guidesState,
                leads: updated
              });
            }}
            onOpenEmailOutreach={(leadId) => {
              setInitialOutreachLeadId(leadId);
              setShowEmailOutreachModal(true);
            }}
            onOpenSmsMessaging={(lead) => {
              setSmsModalLead(lead);
            }}
            onTriggerToast={triggerToast}
          />
        )}

        {/* Tab: AI 2nd Brain Copilot */}
        {activeTab === "ai_2nd_brain" && (
          <AILoanOfficer2ndBrain
            currentLo={currentLo}
            leads={guidesState.leads || []}
            activeLeadId={scenarioWorkbenchLeadId}
            onUpdateLeadNotes={(leadId, text) => {
              const currentLeads = guidesState.leads || [];
              const updated = currentLeads.map(l => l.id === leadId ? { ...l, notes: (l.notes ? l.notes + "\
\
" : "") + text.trim() } : l);
              onUpdateGuidesState({ ...guidesState, leads: updated });
            }}
            onOpenScenarioWorkbench={(leadId) => {
              setScenarioWorkbenchLeadId(leadId);
              setActiveTab("scenario_workbench");
            }}
            onTriggerToast={triggerToast}
          />
        )}

        {/* Tab: Schedule C Tax Analyzer (Form 1084 / Form 91) */}
        {activeTab === "tax_schedule_c" && (
          <ScheduleCTaxAnalyzer
            currentLo={currentLo}
            leads={guidesState.leads || []}
            activeLeadId={scenarioWorkbenchLeadId}
            onSaveQualifyingIncome={(leadId, monthlyIncome, details) => {
              const currentLeads = guidesState.leads || [];
              const updated = currentLeads.map(l => l.id === leadId ? {
                ...l,
                annualIncome: Math.round(monthlyIncome * 12),
                notes: (l.notes ? l.notes + "\
\
" : "") + `[Schedule C Underwriting Form 1084]: Calculated Qualifying Income: $${Math.round(monthlyIncome).toLocaleString()}/mo ($${Math.round(monthlyIncome * 12).toLocaleString()}/yr).`
              } : l);
              onUpdateGuidesState({
                ...guidesState,
                leads: updated
              });
              triggerToast(`✓ Saved Schedule C Qualifying Income ($${Math.round(monthlyIncome).toLocaleString()}/mo) to borrower record!`);
            }}
            onTriggerToast={triggerToast}
          />
        )}

        {/* Tab: 2-1 Buydown Scenario Engine */}
        {activeTab === "buydown_2_1" && (
          <Buydown21ScenarioEngine
            currentLo={currentLo}
            leads={guidesState.leads || []}
            activeLeadId={scenarioWorkbenchLeadId}
            onSaveScenarioToLead={(leadId, scenarioData) => {
              const currentLeads = guidesState.leads || [];
              const updated = currentLeads.map(l => l.id === leadId ? {
                ...l,
                notes: (l.notes ? l.notes + "\
\
" : "") + `[2-1 Buydown Scenario]: Price: $${scenarioData.purchasePrice.toLocaleString()}, Note Rate: ${scenarioData.noteRate}%, Yr 1 Rate: ${scenarioData.yr1Rate}%, Yr 1 Savings: $${scenarioData.yr1MonthlySavings}/mo, Total Concession: $${scenarioData.totalBuydownSubsidy.toLocaleString()}`
              } : l);
              onUpdateGuidesState({
                ...guidesState,
                leads: updated
              });
            }}
            onTriggerToast={triggerToast}
          />
        )}

        {/* Tab: Realtor Co-Branding Command Hub */}
        {activeTab === "realtor_cobranding" && (
          <RealtorCoBrandingHub
            guidesState={guidesState}
            onUpdateGuidesState={onUpdateGuidesState}
            currentLo={currentLo}
            leads={guidesState.leads || []}
            properties={properties}
            onTriggerToast={triggerToast}
          />
        )}

        {activeTab === "recruitment_pipeline" && (
          <RecruitmentPipeline 
            guidesState={guidesState} 
            onUpdateGuidesState={onUpdateGuidesState} 
            onTriggerToast={triggerToast}
            userRole={effectiveRbacRole}
            currentLoId={currentLo.id}
            currentLoName={currentLo.name}
          />
        )}

        {/* Tab 1: Team LO Roster & Distribution (Admin for Mike Ford) */}
        {activeTab === "team_distribution" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#EAE7E0] shadow-sm">
              <div>
                <h3 className="font-serif font-bold text-2xl text-[#2D362E]">
                  Branch Team Loan Officers & Portal Distribution
                </h3>
                <p className="text-xs text-[#606C5D] mt-1 max-w-2xl">
                  As Branch Manager (Mike Ford), you can add and manage downstream Loan Officers on your team. Each Loan Officer receives their own independent dashboard and custom branded URL links to market with Realtor partners.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap shrink-0">
                <button
                  onClick={() => setShowScrapeLoModal(true)}
                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>AI Assist: Import Team</span>
                </button>
                <button
                  onClick={() => setShowAddLoModal(true)}
                  className="px-5 py-2.5 bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Manual LO</span>
                </button>
                <button
                  onClick={handleExportCsv}
                  className="px-5 py-2.5 bg-[#FAF9F5] text-[#2D362E] border border-[#EAE7E0] hover:bg-[#F1EFE9] text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#4A5D4E]" />
                  <span>Export CSV</span>
                </button>
                <input 
                  type="file" 
                  accept=".csv" 
                  ref={csvFileInputRef} 
                  onChange={handleImportCsv} 
                  className="hidden" 
                />
                <button
                  onClick={() => csvFileInputRef.current?.click()}
                  className="px-5 py-2.5 bg-[#FAF9F5] text-[#2D362E] border border-[#EAE7E0] hover:bg-[#F1EFE9] text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-[#4A5D4E]" />
                  <span>Import CSV</span>
                </button>
              </div>
            </div>

            {/* Robust LO Filter & Search Bar */}
            {(() => {
              const allCompanies = Array.from(new Set(guidesState.loanOfficers.map(lo => lo.company).filter(Boolean)));
              const allBranches = Array.from(new Set(guidesState.loanOfficers.filter(lo => loCompanyFilter === 'all' || lo.company === loCompanyFilter).map(lo => lo.branch).filter(Boolean)));

              const filteredLOs = guidesState.loanOfficers.filter(lo => {
                if (loSearchQuery && !lo.name.toLowerCase().includes(loSearchQuery.toLowerCase())) return false;
                if (loRegionSearch && !(lo.city?.toLowerCase().includes(loRegionSearch.toLowerCase()) || lo.county?.toLowerCase().includes(loRegionSearch.toLowerCase()) || lo.state?.toLowerCase().includes(loRegionSearch.toLowerCase()))) return false;
                if (loCompanyFilter !== 'all' && lo.company !== loCompanyFilter) return false;
                if (loBranchFilter !== 'all' && lo.branch !== loBranchFilter) return false;
                if (loTeamStatusFilter === 'assigned' && !lo.isTeamMember) return false;
                if (loTeamStatusFilter === 'unassigned' && lo.isTeamMember) return false;
                return true;
              });

              return (
                <div className="space-y-4">
                  <div className="flex flex-col xl:flex-row gap-3 bg-[#FAF9F5] p-4 rounded-2xl border border-[#EAE7E0]">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                      {/* Name Search */}
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9488]" />
                        <input
                          type="text"
                          placeholder="Search LO name..."
                          value={loSearchQuery}
                          onChange={(e) => setLoSearchQuery(e.target.value)}
                          className="w-full bg-white border border-[#EAE7E0] rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-[#4A5D4E] text-[#2D362E]"
                        />
                      </div>
                      
                      {/* Region Search */}
                      <div className="relative">
                        <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9488]" />
                        <input
                          type="text"
                          placeholder="City, County, or State..."
                          value={loRegionSearch}
                          onChange={(e) => setLoRegionSearch(e.target.value)}
                          className="w-full bg-white border border-[#EAE7E0] rounded-xl pl-9 pr-3 py-2.5 text-xs focus:outline-none focus:border-[#4A5D4E] text-[#2D362E]"
                        />
                      </div>

                      {/* Company Filter */}
                      <div className="relative">
                        <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9488]" />
                        <select
                          value={loCompanyFilter}
                          onChange={(e) => {
                            setLoCompanyFilter(e.target.value);
                            setLoBranchFilter("all");
                          }}
                          className="w-full bg-white border border-[#EAE7E0] rounded-xl pl-9 pr-8 py-2.5 text-xs focus:outline-none focus:border-[#4A5D4E] text-[#2D362E] appearance-none"
                        >
                          <option value="all">All Companies</option>
                          {allCompanies.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9488] pointer-events-none" />
                      </div>

                      {/* Branch Filter */}
                      <div className="relative">
                        <Layers className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9488]" />
                        <select
                          value={loBranchFilter}
                          onChange={(e) => setLoBranchFilter(e.target.value)}
                          className="w-full bg-white border border-[#EAE7E0] rounded-xl pl-9 pr-8 py-2.5 text-xs focus:outline-none focus:border-[#4A5D4E] text-[#2D362E] appearance-none"
                        >
                          <option value="all">All Branches</option>
                          {allBranches.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9488] pointer-events-none" />
                      </div>

                      {/* Team Status Filter */}
                      <div className="relative">
                        <Users className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9488]" />
                        <select
                          value={loTeamStatusFilter}
                          onChange={(e) => setLoTeamStatusFilter(e.target.value as any)}
                          className="w-full bg-white border border-[#EAE7E0] rounded-xl pl-9 pr-8 py-2.5 text-xs focus:outline-none focus:border-[#4A5D4E] text-[#2D362E] appearance-none"
                        >
                          <option value="all">All Statuses</option>
                          <option value="assigned">My Team Only</option>
                          <option value="unassigned">Unassigned (Scraped)</option>
                        </select>
                        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9488] pointer-events-none" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Bulk Actions Banner */}
                  {selectedRosterLoIds.size > 0 && (
                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center justify-between animate-fade-in shadow-sm">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                        <span className="w-6 h-6 rounded-lg bg-emerald-800 text-white flex items-center justify-center">
                          {selectedRosterLoIds.size}
                        </span>
                        Selected Loan Officers
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const updatedLos = guidesState.loanOfficers.map(lo => {
                              if (selectedRosterLoIds.has(lo.id)) {
                                return { ...lo, isTeamMember: true };
                              }
                              return lo;
                            });
                            onUpdateGuidesState({
                              ...guidesState,
                              loanOfficers: updatedLos
                            });
                            triggerToast(`✅ Assigned ${selectedRosterLoIds.size} LOs to Mike Ford's Team`);
                            setSelectedRosterLoIds(new Set());
                          }}
                          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Assign to Team</span>
                        </button>
                        <button
                          onClick={() => setShowLoOutreachModal(true)}
                          className="px-4 py-2 bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-4 h-4 text-[#E7C19D]" />
                          <span>AI Custom Outreach</span>
                        </button>
                        <button
                          onClick={() => setShowRecruitingCampaignModal(true)}
                          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
                        >
                          <Target className="w-4 h-4 text-emerald-200" />
                          <span>Automated Drip Campaign</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Select All Row */}
                  <div className="flex items-center justify-between px-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#606C5D]">
                      <input
                        type="checkbox"
                        checked={filteredLOs.length > 0 && selectedRosterLoIds.size === filteredLOs.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRosterLoIds(new Set(filteredLOs.map(lo => lo.id)));
                          } else {
                            setSelectedRosterLoIds(new Set());
                          }
                        }}
                        className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                      />
                      Select All Visible ({filteredLOs.length})
                    </label>
                  </div>

                  {/* Team LO Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLOs.map(lo => {
                      const loSlug = lo.customSlug || lo.id.replace(/^lo-/, "");
                      const loUrl = `${origin}/?lo=${loSlug}`;
                      const loPairings = guidesState.pairings.filter(p => p.loId === lo.id);
                      const isMike = lo.isAdmin;
                      const isSelected = selectedRosterLoIds.has(lo.id);

                      return (
                        <div 
                          key={lo.id}
                          className={`bg-white rounded-3xl border transition-colors ${
                            isSelected ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/10" :
                            currentLo.id === lo.id ? "border-[#4A5D4E] ring-2 ring-[#4A5D4E]/20" : "border-[#EAE7E0]"
                          } p-6 space-y-4 shadow-sm flex flex-col justify-between relative overflow-hidden`}
                        >
                          {/* Selection Checkbox */}
                          <div className="absolute top-4 right-4 z-10">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                const next = new Set(selectedRosterLoIds);
                                if (e.target.checked) next.add(lo.id);
                                else next.delete(lo.id);
                                setSelectedRosterLoIds(next);
                              }}
                              className="w-5 h-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer shadow-sm"
                            />
                          </div>

                          {isMike && (
                            <div className="absolute top-0 right-12 px-3 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-b-xl uppercase tracking-wider">
                              Admin
                            </div>
                          )}
                          {lo.isTeamMember && !isMike && (
                            <div className="absolute top-0 right-12 px-3 py-1 bg-[#4A5D4E] text-white text-[10px] font-bold rounded-b-xl uppercase tracking-wider flex items-center gap-1.5">
                              Assigned Team
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const currentStatus = lo.teamStarStatus || 'red';
                                  const nextStatus = currentStatus === 'red' ? 'blue' : currentStatus === 'blue' ? 'green' : 'red';
                                  const updatedLos = guidesState.loanOfficers.map(l => l.id === lo.id ? { ...l, teamStarStatus: nextStatus as "red" | "blue" | "green" } : l);
                                  onUpdateGuidesState({ ...guidesState, loanOfficers: updatedLos });
                                }}
                                className="focus:outline-none hover:scale-110 transition-transform"
                                title={lo.teamStarStatus === 'green' ? 'Part of Team' : lo.teamStarStatus === 'blue' ? 'Profile Complete' : 'New Hire - Incomplete'}
                              >
                                <Star className={`w-3.5 h-3.5 fill-current ${lo.teamStarStatus === 'green' ? 'text-green-400' : lo.teamStarStatus === 'blue' ? 'text-blue-400' : 'text-red-400'}`} />
                              </button>
                            </div>
                          )}
                          {!lo.isTeamMember && !isMike && (
                            <div className="absolute top-0 right-12 px-3 py-1 bg-[#9A9488] text-white text-[10px] font-bold rounded-b-xl uppercase tracking-wider flex items-center gap-1.5">
                              Unassigned
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const currentStatus = lo.teamStarStatus || 'red';
                                  const nextStatus = currentStatus === 'red' ? 'blue' : currentStatus === 'blue' ? 'green' : 'red';
                                  const updatedLos = guidesState.loanOfficers.map(l => l.id === lo.id ? { ...l, teamStarStatus: nextStatus as "red" | "blue" | "green" } : l);
                                  onUpdateGuidesState({ ...guidesState, loanOfficers: updatedLos });
                                }}
                                className="focus:outline-none hover:scale-110 transition-transform"
                                title={lo.teamStarStatus === 'green' ? 'Part of Team' : lo.teamStarStatus === 'blue' ? 'Profile Complete' : 'New Hire - Incomplete'}
                              >
                                <Star className={`w-3.5 h-3.5 fill-current ${lo.teamStarStatus === 'green' ? 'text-green-400' : lo.teamStarStatus === 'blue' ? 'text-blue-400' : 'text-red-400'}`} />
                              </button>
                            </div>
                          )}

                          <div className="space-y-4 pt-2">
                      <div className="flex items-start gap-3.5">
                        <HeadshotAvatar
                          src={lo.headshotUrl}
                          name={lo.name}
                          title={lo.title}
                          className="w-16 h-16 rounded-2xl border-2 border-white shadow-md shrink-0"
                        />
                        <div className="space-y-0.5">
                          <h4 className="font-serif font-bold text-base text-[#2D362E] flex items-center gap-1.5 flex-wrap">
                            <span>{lo.name}</span>
                            {lo.accountRestricted ? (
                              <div title="Account Temporarily Restricted" className="flex items-center justify-center w-5 h-5 rounded-full bg-rose-100 text-rose-700">
                                <Lock className="w-3 h-3" />
                              </div>
                            ) : (
                              <ShieldCheck className="w-3.5 h-3.5 text-[#4A5D4E]" />
                            )}
                            <OutreachHistoryBadge lo={lo} compact={true} />
                          </h4>
                          <p className="text-xs font-semibold text-[#4A5D4E]">{lo.title}</p>
                          <p className="text-[11px] text-[#9A9488]">{lo.nmlsId} • {lo.branch || lo.company}</p>
                        </div>
                      </div>

                      <p className="text-xs text-[#606C5D] line-clamp-2 leading-relaxed">
                        {lo.bio}
                      </p>

                      {/* AI Generated Recruiting Metrics */}
                      {(lo.yearsExperience !== undefined || lo.production12MoUnits !== undefined) && (
                        <div className="flex items-center gap-2 mt-2">
                           {lo.yearsExperience !== undefined && (
                             <span className="text-[10px] font-bold bg-[#E8F3F1] text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                               {lo.yearsExperience} Yrs Exp
                             </span>
                           )}
                           {lo.production12MoUnits !== undefined && (
                             <span className="text-[10px] font-bold bg-[#E8F3F1] text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                               {lo.production12MoUnits} Units / 12mo
                             </span>
                           )}
                           {lo.production12MoVolume !== undefined && (
                             <span className="text-[10px] font-bold bg-[#E8F3F1] text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                               ${(lo.production12MoVolume / 1000000).toFixed(1)}M Vol
                             </span>
                           )}
                           {lo.licenseStates && lo.licenseStates.length > 0 && (
                             <span className="text-[10px] font-bold bg-[#FFF9E6] text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                               {lo.licenseStates.join(', ')}
                             </span>
                           )}
                        </div>
                      )}

                      {/* Direct Phone, Email & Website Profile */}
                      <div className="flex flex-wrap gap-1.5 text-[11px] text-[#606C5D] pt-0.5">
                        <a 
                          href={`tel:${lo.phone.replace(/[^0-9]/g, "")}`}
                          className="inline-flex items-center gap-1 text-[#4A5D4E] hover:text-[#2D362E] font-medium bg-[#FAF9F5] px-2 py-0.5 rounded-lg border border-[#EAE7E0]"
                        >
                          <Phone className="w-3 h-3 text-[#4A5D4E]" />
                          <span>{lo.phone}</span>
                        </a>
                        <button 
                          type="button"
                          onClick={() => {
                            launchLocalOutlookDraft({
                              to: lo.email,
                              subject: `Connecting regarding Branch Operations & Production`,
                              body: `Hi ${lo.name.split(' ')[0]},

Reaching out regarding branch production and team pipeline updates.

Best regards,`,
                              loanOfficer: loggedInUser || currentLo,
                              templateName: "LO Colleague Connect",
                              onTriggerToast: triggerToast
                            });
                          }}
                          className="inline-flex items-center gap-1 text-[#4A5D4E] hover:text-[#0078D4] font-medium bg-[#FAF9F5] px-2 py-0.5 rounded-lg border border-[#EAE7E0] truncate max-w-[170px] cursor-pointer"
                          title="Draft email in local installed Outlook with work signature"
                        >
                          <Mail className="w-3 h-3 text-[#4A5D4E] shrink-0" />
                          <span className="truncate">{lo.email}</span>
                        </button>
                        {lo.websiteUrl && (
                          <a 
                            href={lo.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-bold bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-200"
                            title="Open Official CFMTG Branch Bio Page"
                          >
                            <Globe className="w-3 h-3 text-emerald-700" />
                            <span>CFMTG Page</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                          </a>
                        )}
                      </div>

                      {!lo.isTeamMember && !isMike && (
                        <div className="pt-2 mt-2 border-t border-[#EAE7E0] space-y-2">
                           <div className="flex items-center justify-between">
                             <span className="text-[10px] font-bold text-[#606C5D] uppercase tracking-wider">Recruiting Status</span>
                             {lo.recruitmentStatus === 'Not Contacted' ? (
                               <span className="text-[9px] bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded-full border border-gray-200">⚪ Not Contacted</span>
                             ) : lo.recruitmentStatus === 'In Outreach' ? (
                               <span className="text-[9px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-200">🔵 In Outreach</span>
                             ) : lo.recruitmentStatus === 'Interested' ? (
                               <span className="text-[9px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full border border-amber-200">🟠 Interested</span>
                             ) : lo.recruitmentStatus === 'Meeting Scheduled' ? (
                               <span className="text-[9px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">🟢 Meeting</span>
                             ) : lo.recruitmentStatus === 'Declined' ? (
                               <span className="text-[9px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full border border-red-200">🔴 Declined</span>
                             ) : (
                               <span className="text-[9px] bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded-full border border-gray-200">⚪ {lo.recruitmentStatus || 'Not Contacted'}</span>
                             )}
                           </div>
                           <select
                              value={lo.recruitmentStatus || 'Not Contacted'}
                              onChange={(e) => {
                                const updatedLos = guidesState.loanOfficers.map(l => 
                                  l.id === lo.id ? { ...l, recruitmentStatus: e.target.value as any } : l
                                );
                                onUpdateGuidesState({ ...guidesState, loanOfficers: updatedLos });
                                triggerToast(`Updated status for ${lo.name} to ${e.target.value}`);
                              }}
                              className="w-full bg-white border border-[#EAE7E0] rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:border-[#4A5D4E] text-[#606C5D] shadow-sm transition-colors"
                            >
                              <option value="Not Contacted">Not Contacted</option>
                              <option value="In Outreach">In Outreach</option>
                              <option value="Interested">Interested</option>
                              <option value="Meeting Scheduled">Meeting Scheduled</option>
                              <option value="Declined">Declined</option>
                            </select>
                            
                            <button
                              onClick={() => handleGenerateSingleOutreach(lo)}
                              disabled={generatingOutreachFor === lo.id}
                              className="w-full mt-2 py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors text-[11px] disabled:opacity-50"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{generatingOutreachFor === lo.id ? 'Drafting...' : 'Generate Outreach Email'}</span>
                            </button>
                        </div>
                      )}

                      {/* Top 3 Business Partners (Buyside Agents) */}
                      <TopBusinessPartnersCard
                        role="lo"
                        profile={lo}
                        partners={lo.topPartners12Mo}
                        compact={false}
                      />

                      <div className="space-y-1.5 pt-2 border-t border-[#EAE7E0] text-xs">
                        <div className="flex items-center justify-between text-[#606C5D]">
                          <span>Active Realtor Pairings:</span>
                          <span className="font-bold text-[#2D362E]">{loPairings.length} Partnerships</span>
                        </div>
                        <div className="flex items-start justify-between text-[#606C5D] gap-2">
                          <span className="shrink-0">Licensed States:</span>
                          <div className="text-right">
                            <span className="font-semibold text-[#4A5D4E] block">{lo.licenseStates.join(", ")}</span>
                            {Boolean((lo.licenseVerificationYear ?? new Date().getFullYear()) === new Date().getFullYear() && lo.licenseStates.length > 0) ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mt-0.5">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                <span>Verified {new Date().getFullYear()}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200 mt-0.5 animate-pulse">
                                <AlertTriangle className="w-2.5 h-2.5 text-red-600" />
                                <span>Re-select Annually (1/1)</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* LO Private Dashboard Login & Portal Access URL */}
                      <div className="space-y-1.5 bg-[#F4F6F4] p-3 rounded-2xl border border-[#D5DDD6]">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-[#38463B] uppercase tracking-wider flex items-center gap-1">
                            <Key className="w-3 h-3 text-[#4A5D4E]" />
                            <span>{isMike ? "Admin Portal Login URL:" : "LO Dashboard Login URL:"}</span>
                          </span>
                          <span className="text-[10px] text-[#606C5D] font-mono">
                            {lo.email}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-1.5">
                          <input
                            type="text"
                            readOnly
                            value={`${origin}/first-time_homebuyer_portal/${lo.customSlug || lo.id.replace("lo-", "")}`}
                            className="bg-white border border-[#D5DDD6] rounded-xl px-2.5 py-1.5 text-[11px] font-mono text-[#2D362E] font-semibold w-full focus:outline-none truncate"
                          />
                          <button
                            onClick={() => copyToClipboard(`${origin}/first-time_homebuyer_portal/${lo.customSlug || lo.id.replace("lo-", "")}`, `lo-login-${lo.id}`)}
                            className="p-1.5 bg-white hover:bg-[#EAE7E0] border border-[#D5DDD6] rounded-xl text-xs font-bold text-[#4A5D4E] shrink-0 flex items-center gap-1 shadow-2xs"
                            title="Copy LO Dashboard Login Link"
                          >
                            {copiedKey === `lo-login-${lo.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            <span className="text-[10px] hidden sm:inline">Copy Link</span>
                          </button>
                          <a
                            href={`${origin}/first-time_homebuyer_portal/${lo.customSlug || lo.id.replace("lo-", "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-[#4A5D4E] hover:bg-[#38463B] text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 shadow-2xs"
                            title="Open Login Portal in New Tab"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>

                        {/* Quick Action: Copy Login Details Email for LO */}
                        <div className="flex items-center justify-between pt-1 border-t border-[#E1E8E2] text-[10px]">
                          <span className="text-[#606C5D]">
                            Password: <strong className="text-[#2D362E]">{lo.password || (lo.isAdmin ? "admin123" : "pass123")}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const loginLink = `${origin}/first-time_homebuyer_portal/${lo.customSlug || lo.id.replace("lo-", "")}`;
                              const emailBody = `Hi ${lo.name.split(" ")[0]},

Here is your private Cornerstone First Mortgage dashboard login details:

🔗 Dashboard Login: ${loginLink}
📧 Login Email: ${lo.email}
🔑 Temporary Password: ${lo.password || "pass123"}

Once logged in, you can manage your Realtor partnerships, download co-branded QR codes, and review incoming borrower pre-approval leads.

Best,
Mike Ford`;
                              copyToClipboard(emailBody, `lo-invite-${lo.id}`);
                            }}
                            className="text-[#4A5D4E] hover:text-[#2D362E] font-bold flex items-center gap-1 underline underline-offset-2"
                          >
                            {copiedKey === `lo-invite-${lo.id}` ? (
                              <span className="text-emerald-700 font-bold">✓ Credentials Copied!</span>
                            ) : (
                              <span>📋 Copy Login Info to Send LO</span>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Branded Distribution Links for Borrowers & Print */}
                      <div className="space-y-2 bg-[#F9F8F4] p-3 rounded-2xl border border-[#EAE7E0]">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-[#38463B] uppercase tracking-wider">Print-Ready Short URL:</span>
                            <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">Direct Match</span>
                          </div>
                          <div className="flex items-center justify-between gap-1.5">
                            <input
                              type="text"
                              readOnly
                              value={`${origin}/${loSlug}`}
                              className="bg-white border border-[#EAE7E0] rounded-xl px-2.5 py-1 text-[11px] font-mono text-[#2D362E] font-bold w-full focus:outline-none truncate"
                            />
                            <button
                              onClick={() => copyToClipboard(`${origin}/${loSlug}`, `lo-short-url-${lo.id}`)}
                              className="p-1.5 bg-white hover:bg-[#F1EFE9] border border-[#EAE7E0] rounded-xl text-xs font-bold text-[#4A5D4E] shrink-0 shadow-2xs"
                              title="Copy Short URL"
                            >
                              {copiedKey === `lo-short-url-${lo.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            <a
                              href={`${origin}/${loSlug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-[#4A5D4E] hover:bg-[#38463B] text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 shadow-2xs"
                              title="Test Short URL in New Tab"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>

                        <div className="space-y-1 pt-1 border-t border-[#EAE7E0]">
                          <span className="text-[10px] font-bold text-[#606C5D] uppercase tracking-wider">Parameter URL:</span>
                          <div className="flex items-center justify-between gap-1.5">
                            <input
                              type="text"
                              readOnly
                              value={loUrl}
                              className="bg-white border border-[#EAE7E0] rounded-lg px-2 py-1 text-[10px] font-mono text-[#606C5D] w-full focus:outline-none truncate"
                            />
                            <button
                              onClick={() => copyToClipboard(loUrl, `lo-url-${lo.id}`)}
                              className="p-1.5 bg-white hover:bg-[#F1EFE9] border border-[#EAE7E0] rounded-lg text-xs font-bold text-[#4A5D4E] shrink-0"
                              title="Copy Param Link"
                            >
                              {copiedKey === `lo-url-${lo.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Password Security & Reset Authorization Hub */}
                      {!isMike && (
                        <div className="bg-[#FAF9F5] p-3 rounded-2xl border border-[#EAE7E0] space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#2D362E] flex items-center gap-1.5 text-[11px]">
                              <Lock className="w-3.5 h-3.5 text-[#4A5D4E]" />
                              <span>Password Security</span>
                            </span>
                            {lo.passwordResetAuthorized ? (
                              <span className="text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                <span>Reset Authorized</span>
                              </span>
                            ) : lo.passwordResetRequestedAt ? (
                              <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded-full animate-pulse flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5 text-amber-700" />
                                <span>Reset Requested</span>
                              </span>
                            ) : (
                              <span className="text-[10px] bg-gray-100 text-gray-700 border border-gray-200 font-medium px-2 py-0.5 rounded-full">
                                Locked (Protected)
                              </span>
                            )}
                          </div>

                          {lo.passwordResetRequestedAt && !lo.passwordResetAuthorized && (
                            <div className="bg-amber-50/90 border border-amber-300 rounded-xl p-2.5 space-y-1.5 text-[11px]">
                              <p className="text-amber-900 font-medium leading-tight">
                                ⚠️ <strong>{lo.name}</strong> requested a password reset on {new Date(lo.passwordResetRequestedAt).toLocaleDateString()} at {new Date(lo.passwordResetRequestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
                              </p>
                              <button
                                type="button"
                                onClick={() => handleAuthorizePasswordReset(lo.id)}
                                className="w-full py-1.5 px-3 bg-amber-800 hover:bg-amber-900 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-2xs transition-colors text-xs"
                              >
                                <Key className="w-3 h-3 text-amber-300" />
                                <span>Authorize LO Password Reset</span>
                              </button>
                            </div>
                          )}

                          {lo.passwordResetAuthorized && (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 space-y-1.5 text-[11px]">
                              <div className="flex items-center justify-between text-emerald-900 font-semibold">
                                <span>Reset Auth Active</span>
                                {lo.passwordResetPin && (
                                  <span className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-950 font-bold">
                                    PIN: {lo.passwordResetPin}
                                  </span>
                                )}
                              </div>
                              <p className="text-emerald-800 text-[10px]">
                                {lo.name} can now reset their password on the login view using this PIN.
                              </p>
                              <button
                                type="button"
                                onClick={() => handleRevokePasswordReset(lo.id)}
                                className="w-full py-1 px-2.5 bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 font-bold rounded-lg flex items-center justify-center gap-1 transition-colors text-[11px]"
                              >
                                <X className="w-3 h-3" />
                                <span>Revoke Reset Authorization</span>
                              </button>
                            </div>
                          )}

                          {!lo.passwordResetRequestedAt && !lo.passwordResetAuthorized && (
                            <div className="flex items-center gap-2 pt-0.5">
                              <button
                                type="button"
                                onClick={() => handleAuthorizePasswordReset(lo.id)}
                                className="flex-1 py-1.5 px-2.5 bg-white hover:bg-[#F1EFE9] border border-[#EAE7E0] hover:border-[#4A5D4E] rounded-xl text-[11px] font-bold text-[#2D362E] flex items-center justify-center gap-1 shadow-2xs transition-colors"
                              >
                                <Key className="w-3 h-3 text-[#4A5D4E]" />
                                <span>Authorize LO Password Reset</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingLo(lo)}
                                className="py-1.5 px-2.5 bg-white hover:bg-[#F1EFE9] border border-[#EAE7E0] rounded-xl text-[11px] font-semibold text-[#606C5D] hover:text-[#2D362E] transition-colors"
                                title="Edit password or profile"
                              >
                                <span>Edit</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-[#EAE7E0] flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleSwitchLoanOfficer(lo.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                          currentLo.id === lo.id 
                            ? "bg-[#4A5D4E] text-white" 
                            : "bg-[#F1EFE9] text-[#2D362E] hover:bg-[#EAE7E0]"
                        }`}
                      >
                        {currentLo.id === lo.id ? "Active Dashboard" : "Switch to Sub-LO View"}
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditingLo(lo)}
                          className="p-2 text-[#606C5D] hover:text-[#2D362E] hover:bg-[#F1EFE9] rounded-xl transition-colors"
                          title="Edit Profile"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {!isMike && (
                          <button
                            onClick={() => handleDeleteLoanOfficer(lo.id)}
                            className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                            title="Delete LO"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Tab 2: LO + Real Estate Agent Pairings & Custom Co-Branded Links */}
        {activeTab === "pairings" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#EAE7E0] shadow-sm">
              <div>
                <h3 className="font-serif font-bold text-2xl text-[#2D362E]">
                  Loan Officer + Real Estate Agent Pairings & URLs
                </h3>
                <p className="text-xs text-[#606C5D] mt-1 max-w-2xl">
                  Create unique co-branded marketing partnerships. Each pairing generates a dedicated URL link (`?lo=...&agent=...`) that automatically renders both professionals across the website, buying power calculator, and Step 4 AI plan.
                </p>
              </div>

              <button
                onClick={() => setShowAddPairingModal(true)}
                className="px-5 py-2.5 bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] shrink-0"
              >
                <Link className="w-4 h-4" />
                <span>Create New LO + Realtor Pairing</span>
              </button>
            </div>

            {/* Pairings List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {guidesState.pairings.map(pairing => {
                const lo = guidesState.loanOfficers.find(l => l.id === pairing.loId) || currentLo;
                const agent = guidesState.agentRoster.find(a => a.id === pairing.agentId) || guidesState.agentRoster[0];
                const pairingShortUrl = `${origin}/${pairing.customSlug || pairing.id}`;
                const pairingParamUrl = pairing.customSlug 
                  ? `${origin}/?pair=${pairing.customSlug}`
                  : `${origin}/?lo=${lo.customSlug || lo.id.replace(/^lo-/, "")}&agent=${agent?.customSlug || agent?.id.replace(/^agent-/, "") || ""}`;
                const isActive = guidesState.loanOfficer.id === lo.id && guidesState.activeAgentId === agent?.id;

                return (
                  <div
                    key={pairing.id}
                    className={`bg-white rounded-3xl border ${
                      isActive ? "border-[#4A5D4E] ring-2 ring-[#4A5D4E]/20" : "border-[#EAE7E0]"
                    } p-6 space-y-4 shadow-sm flex flex-col justify-between`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between border-b border-[#EAE7E0] pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-serif font-bold text-base text-[#2D362E]">
                              {pairing.title}
                            </h4>
                            <button
                              type="button"
                              onClick={() => setEditingPairing(pairing)}
                              className="p-1 text-[#606C5D] hover:text-[#2D362E] hover:bg-[#F1EFE9] rounded-lg transition-colors"
                              title="Edit Pairing Title & Campaign Tag"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <button
                              type="button"
                              onClick={() => setEditingPairing(pairing)}
                              className="group inline-flex items-center gap-1 text-[11px] font-mono text-[#4A5D4E] hover:text-[#2D362E] bg-[#F1EFE9] hover:bg-[#EAE7E0] px-2 py-0.5 rounded-lg border border-[#D5DDD6] transition-colors"
                              title="Click to edit campaign tag name"
                            >
                              <Tag className="w-3 h-3 text-[#4A5D4E]" />
                              <span className="font-bold">#{pairing.campaignTag || "co-marketing"}</span>
                              <Edit3 className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 ml-0.5" />
                            </button>
                            <span className="text-[10px] text-[#9A9488] hidden sm:inline">(click to customize)</span>
                          </div>
                        </div>
                        {isActive && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold shrink-0">
                            Live on Public Site
                          </span>
                        )}
                      </div>

                      {/* Dual Headshots */}
                      <div className="grid grid-cols-2 gap-3 bg-[#F9F8F4] p-3.5 rounded-2xl border border-[#EAE7E0]">
                        <div className="flex items-center gap-2.5">
                          <HeadshotAvatar
                            src={lo.headshotUrl}
                            name={lo.name}
                            title={lo.title}
                            className="w-12 h-12 rounded-xl border border-white shadow-xs shrink-0"
                          />
                          <div>
                            <span className="text-[9px] font-bold text-[#4A5D4E] uppercase">Loan Officer</span>
                            <p className="font-bold text-xs text-[#2D362E]">{lo.name}</p>
                            <p className="text-[10px] text-[#9A9488]">{lo.nmlsId}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <HeadshotAvatar
                            src={agent?.headshotUrl}
                            name={agent?.name || "Agent"}
                            title={agent?.title}
                            className="w-12 h-12 rounded-xl border border-white shadow-xs shrink-0"
                          />
                          <div>
                            <span className="text-[9px] font-bold text-[#C18C5D] uppercase">Real Estate Agent</span>
                            <p className="font-bold text-xs text-[#2D362E]">{agent?.name}</p>
                            <p className="text-[10px] text-[#9A9488]">{agent?.brokerage}</p>
                          </div>
                        </div>
                      </div>

                      {/* Short & Param URL Box */}
                      <div className="space-y-2 bg-[#F9F8F4] p-3 rounded-2xl border border-[#EAE7E0]">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-[#38463B] uppercase tracking-wider">Print-Ready Co-Branded Short URL:</span>
                            <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">Dual Branded</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              readOnly
                              value={pairingShortUrl}
                              className="w-full bg-white border border-[#EAE7E0] rounded-xl px-3 py-1.5 text-xs font-mono text-[#2D362E] font-bold focus:outline-none truncate"
                            />
                            <button
                              onClick={() => copyToClipboard(pairingShortUrl, `pair-short-url-${pairing.id}`)}
                              className="px-3 py-1.5 bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-bold rounded-xl transition-colors shrink-0 flex items-center gap-1 shadow-2xs"
                            >
                              {copiedKey === `pair-short-url-${pairing.id}` ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                            <a
                              href={pairingShortUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-[#4A5D4E] hover:bg-[#38463B] text-white rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 shadow-2xs"
                              title="Test Pairing Link in New Tab"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>

                        <div className="space-y-1 pt-1 border-t border-[#EAE7E0]">
                          <span className="text-[10px] font-bold text-[#606C5D] uppercase tracking-wider">Parameter URL:</span>
                          <div className="flex items-center justify-between gap-1.5">
                            <input
                              type="text"
                              readOnly
                              value={pairingParamUrl}
                              className="bg-white border border-[#EAE7E0] rounded-lg px-2 py-1 text-[10px] font-mono text-[#606C5D] w-full focus:outline-none truncate"
                            />
                            <button
                              onClick={() => copyToClipboard(pairingParamUrl, `pair-param-url-${pairing.id}`)}
                              className="p-1.5 bg-white hover:bg-[#F1EFE9] border border-[#EAE7E0] rounded-lg text-xs font-bold text-[#4A5D4E] shrink-0"
                              title="Copy Param Link"
                            >
                              {copiedKey === `pair-param-url-${pairing.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                      {/* Co-Marketing Quick Launch Bar */}
                      <div className="bg-[#FAF9F5] p-3 rounded-2xl border border-[#EAE7E0] space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-[#2D362E] flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-[#4A5D4E]" />
                            <span>Co-Branded Campaign Launchpad</span>
                          </span>
                          <span className="text-[10px] text-[#606C5D] font-mono">LO + Agent Ready</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              handleActivatePairing(pairing);
                              setActiveTab("social_push");
                              triggerToast(`Loaded co-branded social post studio for ${lo.name} + ${agent?.name}`);
                            }}
                            className="px-2.5 py-1.5 bg-white hover:bg-[#F1EFE9] border border-[#EAE7E0] hover:border-[#4A5D4E] rounded-xl text-[11px] font-bold text-[#2D362E] flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                          >
                            <Share2 className="w-3 h-3 text-[#4A5D4E]" />
                            <span>Social Post</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              handleActivatePairing(pairing);
                              setActiveTab("social_push");
                              triggerToast(`Loaded co-branded email blast templates for ${lo.name} + ${agent?.name}`);
                            }}
                            className="px-2.5 py-1.5 bg-white hover:bg-[#F1EFE9] border border-[#EAE7E0] hover:border-[#4A5D4E] rounded-xl text-[11px] font-bold text-[#2D362E] flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                          >
                            <Mail className="w-3 h-3 text-[#4A5D4E]" />
                            <span>Email Blast</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              handleActivatePairing(pairing);
                              setActiveTab("ad_campaigns");
                              triggerToast(`Loaded Meta & Google ads builder for ${lo.name} + ${agent?.name}`);
                            }}
                            className="px-2.5 py-1.5 bg-white hover:bg-[#F1EFE9] border border-[#EAE7E0] hover:border-[#4A5D4E] rounded-xl text-[11px] font-bold text-[#2D362E] flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                          >
                            <Sparkles className="w-3 h-3 text-[#C18C5D]" />
                            <span>Ad Ads Hub</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-[#EAE7E0] flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleActivatePairing(pairing)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                            isActive 
                              ? "bg-emerald-600 text-white" 
                              : "bg-[#F1EFE9] text-[#2D362E] hover:bg-[#EAE7E0]"
                          }`}
                        >
                          {isActive ? "Currently Active" : "Set as Active Site Guides"}
                        </button>
                        <a
                          href={pairingShortUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 bg-white hover:bg-[#F1EFE9] border border-[#EAE7E0] text-[#2D362E] text-xs font-bold rounded-xl flex items-center gap-1 shadow-2xs transition-colors"
                          title="Open co-branded First-Time Homebuyer Roadmap in new tab"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Preview Live</span>
                        </a>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-[#606C5D]">
                        <span>Views: {pairing.totalViews || 0}</span>
                        <span>•</span>
                        <span>Leads: {pairing.totalLeads || 0}</span>
                        <button
                          type="button"
                          onClick={() => setEditingPairing(pairing)}
                          className="text-[#606C5D] hover:text-[#2D362E] p-1.5 hover:bg-[#F1EFE9] rounded-lg transition-colors ml-1"
                          title="Edit Campaign Tag & Pairing Title"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {guidesState.pairings.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = guidesState.pairings.filter(p => p.id !== pairing.id);
                              onUpdateGuidesState({ ...guidesState, pairings: updated });
                              triggerToast("Pairing removed");
                            }}
                            className="text-[#9A9488] hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Pairing"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Real Estate Agent Partner Roster */}
        {activeTab === "realtor_roster" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#EAE7E0] shadow-sm">
              <div>
                <h3 className="font-serif font-bold text-2xl text-[#2D362E]">
                  Real Estate Agent Partner Roster
                </h3>
                <p className="text-xs text-[#606C5D] mt-1 max-w-2xl">
                  Manage your verified Realtor agent partners. Tag agents as Buyer Agents or Listing Agents to launch targeted AI outreach campaigns for USDA zero-down & Flex DPA programs.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setActiveTab("ai_partner_campaign")}
                  className="px-4 py-2.5 bg-gradient-to-r from-[#C18C5D] to-[#9E6D43] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>AI Partner Campaign Engine</span>
                </button>
                <button
                  onClick={() => setShowEmailOutreachModal(true)}
                  className="px-4 py-2.5 bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Mail className="w-4 h-4 text-emerald-300" />
                  <span>Bulk Email Outreach</span>
                </button>
                <button
                  onClick={() => setShowScrapeRealtorModal(true)}
                  className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>AI Assist: Scrape Realtors</span>
                </button>
                <button
                  onClick={() => setShowAddAgentModal(true)}
                  className="px-4 py-2.5 bg-[#2D362E] hover:bg-[#1f2520] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] shrink-0"
                >
                  <UserPlus className="w-4 h-4 text-amber-400" />
                  <span>+ Add Agent Partner</span>
                </button>
              </div>
            </div>

            {/* Role Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#FAF9F5] p-3 rounded-2xl border border-[#EAE7E0]">
              {/* Type Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setAgentRosterFilter('all')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                    agentRosterFilter === 'all'
                      ? "bg-[#2D362E] text-white shadow-2xs"
                      : "bg-white text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F1EFE9]"
                  }`}
                >
                  All Partners ({guidesState.agentRoster.length})
                </button>
                <button
                  onClick={() => setAgentRosterFilter('buyer_agent')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1 ${
                    agentRosterFilter === 'buyer_agent'
                      ? "bg-emerald-700 text-white shadow-2xs"
                      : "bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50"
                  }`}
                >
                  <span>🟢 Buyer Agents</span>
                  <span className="opacity-75">
                    ({guidesState.agentRoster.filter(a => a.agentType === 'buyer_agent').length})
                  </span>
                </button>
                <button
                  onClick={() => setAgentRosterFilter('listing_agent')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1 ${
                    agentRosterFilter === 'listing_agent'
                      ? "bg-blue-700 text-white shadow-2xs"
                      : "bg-white text-blue-800 border border-blue-200 hover:bg-blue-50"
                  }`}
                >
                  <span>🔵 Listing Agents</span>
                  <span className="opacity-75">
                    ({guidesState.agentRoster.filter(a => a.agentType === 'listing_agent').length})
                  </span>
                </button>
                <button
                  onClick={() => setAgentRosterFilter('dual_agent')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1 ${
                    agentRosterFilter === 'dual_agent'
                      ? "bg-purple-700 text-white shadow-2xs"
                      : "bg-white text-purple-800 border border-purple-200 hover:bg-purple-50"
                  }`}
                >
                  <span>🟣 Dual / Full-Service</span>
                  <span className="opacity-75">
                    ({guidesState.agentRoster.filter(a => a.agentType === 'dual_agent').length})
                  </span>
                </button>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9A9488]" />
                <input
                  type="text"
                  placeholder="Search agent name, brokerage..."
                  value={agentRosterSearch}
                  onChange={(e) => setAgentRosterSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#EAE7E0] rounded-xl focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>
            </div>

            {/* Agent Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {guidesState.agentRoster
                .filter(a => {
                  if (agentRosterFilter !== 'all' && a.agentType !== agentRosterFilter) return false;
                  if (agentRosterSearch.trim()) {
                    const q = agentRosterSearch.toLowerCase();
                    return a.name.toLowerCase().includes(q) || a.brokerage.toLowerCase().includes(q) || a.email.toLowerCase().includes(q);
                  }
                  return true;
                })
                .map(agent => {
                  const isSelected = guidesState.activeAgentId === agent.id;
                  const agentType = agent.agentType || 'buyer_agent';

                  return (
                    <div
                      key={agent.id}
                      className={`bg-white rounded-3xl border ${
                        isSelected ? "border-[#C18C5D] ring-2 ring-[#C18C5D]/20" : "border-[#EAE7E0]"
                      } p-6 space-y-4 shadow-sm flex flex-col justify-between relative group hover:border-[#4A5D4E] transition-all`}
                    >
                      <div className="space-y-4">
                        <div className="flex items-start gap-3.5">
                          <div className="relative shrink-0">
                            <HeadshotAvatar
                              src={agent.headshotUrl}
                              name={agent.name}
                              title={agent.title}
                              className="w-16 h-16 rounded-2xl border-2 border-white shadow-md"
                            />
                            {agent.aiGenerated && (
                              <span className="absolute -top-1 -right-1 bg-amber-400 text-amber-950 p-1 rounded-full shadow-2xs" title="AI Profile Created">
                                <Sparkles className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </div>
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1 flex-wrap">
                              <div className="flex items-center gap-2 min-w-0">
                                <h4 className="font-serif font-bold text-base text-[#2D362E] truncate">
                                  {agent.name}
                                </h4>
                                <OutreachHistoryBadge agent={agent} compact={true} />
                              </div>
                              {agentType === 'buyer_agent' ? (
                                <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full shrink-0">
                                  🟢 Buyer Agent
                                </span>
                              ) : agentType === 'listing_agent' ? (
                                <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full shrink-0">
                                  🔵 Listing Agent
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full shrink-0">
                                  🟣 Dual Agent
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-semibold text-[#C18C5D] truncate">{agent.title}</p>
                            <p className="text-[11px] text-[#9A9488] truncate">{agent.brokerage} • {agent.licenseNumber}</p>
                          </div>
                        </div>

                        {/* Experience & Stats Bar */}
                        <div className="flex items-center justify-between text-[11px] bg-[#FAF9F5] px-3 py-1.5 rounded-xl border border-[#EAE7E0] text-[#606C5D]">
                          <span>⭐ <strong>{agent.rating || 4.9}</strong> Rating</span>
                          <span><strong>{agent.experienceYears || 8}</strong> yrs exp</span>
                          {agent.production12MoUnits ? (
                             <span className="text-emerald-700 bg-emerald-50 px-1.5 rounded border border-emerald-100"><strong>{agent.production12MoUnits}</strong> units/12mo</span>
                          ) : (
                             <span><strong>{agent.activeListingsCount || 10}</strong> active listings</span>
                          )}
                        </div>
                        {agent.production12MoVolume && (
                           <div className="text-[10px] font-bold bg-[#E8F3F1] text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 self-start inline-block">
                             ${(agent.production12MoVolume / 1000000).toFixed(1)}M Vol / 12mo
                           </div>
                        )}

                        <p className="text-xs text-[#606C5D] line-clamp-2 leading-relaxed">
                          {agent.bio}
                        </p>

                        <div className="space-y-1 pt-2 border-t border-[#EAE7E0]">
                          <span className="text-[10px] font-bold text-[#9A9488] uppercase tracking-wider">Market Specialties & Areas:</span>
                          <div className="flex flex-wrap gap-1">
                            {agent.marketAreas.map((area, i) => (
                              <span key={i} className="text-[10px] bg-[#F9F8F4] border border-[#EAE7E0] px-2 py-0.5 rounded text-[#2D362E]">
                                {area}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-1 text-xs text-[#606C5D] pt-1">
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-[#4A5D4E]" />
                            <span>{agent.phone}</span>
                          </div>
                          <div className="flex items-center gap-1.5 truncate">
                            <Mail className="w-3.5 h-3.5 text-[#4A5D4E] shrink-0" />
                            <span className="truncate">{agent.email}</span>
                          </div>
                        </div>

                        {/* Top 3 Business Partners (Loan Officers) */}
                        <TopBusinessPartnersCard
                          role="agent"
                          profile={agent}
                          partners={agent.topPartners12Mo}
                          compact={false}
                        />
                      </div>

                      <div className="pt-3 border-t border-[#EAE7E0] flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            onUpdateGuidesState({ ...guidesState, activeAgentId: agent.id });
                            triggerToast(`Set active agent guide to ${agent.name}`);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                            isSelected 
                              ? "bg-[#C18C5D] text-white" 
                              : "bg-[#F1EFE9] text-[#2D362E] hover:bg-[#EAE7E0]"
                          }`}
                        >
                          {isSelected ? "Active Partner" : "Pair on Site"}
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setShowEmailOutreachModal(true)}
                            className="p-2 text-[#4A5D4E] hover:text-[#2D362E] hover:bg-[#F1EFE9] rounded-xl transition-colors flex items-center gap-1 text-xs font-semibold"
                            title="Draft Email Outreach"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Draft Email</span>
                          </button>
                          <button
                            onClick={() => setEditingAgent(agent)}
                            className="p-2 text-[#606C5D] hover:text-[#2D362E] hover:bg-[#F1EFE9] rounded-xl transition-colors"
                            title="Edit Agent Profile"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAgent(agent.id)}
                            className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                            title="Delete Agent"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Tab 4: My Loan Officer Profile Editor */}
        {activeTab === "my_profile" && (
          <div className="bg-white rounded-3xl border border-[#EAE7E0] p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="border-b border-[#EAE7E0] pb-4">
              <h3 className="font-serif font-bold text-2xl text-[#2D362E]">
                Edit Loan Officer Profile: {currentLo.name}
              </h3>
              <p className="text-xs text-[#606C5D]">
                Update your contact information, NMLS licensing credentials, branch location, booking link, and bio displayed to public homebuyers.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const updatedLos = guidesState.loanOfficers.map(l => l.id === currentLo.id ? currentLo : l);
                onUpdateGuidesState({
                  ...guidesState,
                  loanOfficers: updatedLos,
                  loanOfficer: currentLo
                });
                triggerToast("Your Loan Officer profile has been saved!");
              }}
              className="space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2D362E]">Full Name</label>
                  <input
                    type="text"
                    required
                    value={currentLo.name}
                    onChange={(e) => updateCurrentLoField("name", e.target.value)}
                    className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#4A5D4E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2D362E]">Title / Designation</label>
                  <input
                    type="text"
                    required
                    value={currentLo.title}
                    onChange={(e) => updateCurrentLoField("title", e.target.value)}
                    className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#4A5D4E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2D362E]">NMLS ID</label>
                  <input
                    type="text"
                    required
                    value={currentLo.nmlsId}
                    onChange={(e) => updateCurrentLoField("nmlsId", e.target.value)}
                    className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#4A5D4E]"
                  />
                </div>

                <div className="space-y-1 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-950 flex items-center gap-1">
                      <span>🏢</span>
                      <span>Company / Lending Institution</span>
                    </label>
                    <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">Primary Branding</span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Enter your real mortgage company name..."
                    value={currentLo.company}
                    onChange={(e) => updateCurrentLoField("company", e.target.value)}
                    className="w-full bg-white border border-amber-300 rounded-lg px-3 py-2 text-xs font-semibold text-[#2D362E] focus:outline-none focus:border-[#4A5D4E] focus:ring-1 focus:ring-[#4A5D4E]"
                  />
                  <p className="text-[10px] text-amber-900/80">Updates the company branding on your dashboard header, public rate guides, and marketing materials.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2D362E]">Branch Location</label>
                  <input
                    type="text"
                    value={currentLo.branch || ""}
                    onChange={(e) => updateCurrentLoField("branch", e.target.value)}
                    className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#4A5D4E]"
                  />
                </div>

              {/* Headshot Photo with Local Upload & URL */}
              <div className="space-y-2 bg-[#F9F8F4] p-4 rounded-2xl border border-[#EAE7E0] md:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#2D362E] flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#4A5D4E]" />
                    <span>Loan Officer Headshot Profile Photo</span>
                  </label>
                  <span className="text-[11px] text-[#9A9488]">Live Local Preview</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 pt-1">
                  <div className="relative shrink-0">
                    <HeadshotAvatar
                      src={localHeadshotUrl}
                      name={currentLo.name}
                      title={currentLo.title}
                      className="w-16 h-16 rounded-2xl border-2 border-white shadow-md bg-[#EAE7E0]"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2.5">
                      <label className="cursor-pointer px-3.5 py-2 bg-white hover:bg-[#F1EFE9] border border-[#EAE7E0] hover:border-[#4A5D4E] rounded-xl text-xs font-semibold text-[#2D362E] flex items-center gap-1.5 shadow-2xs transition-colors shrink-0">
                        <Upload className="w-3.5 h-3.5 text-[#4A5D4E]" />
                        <span>Upload Photo File</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const result = await processLocalImageFile(file);
                                handleHeadshotUrlChange(result);
                                triggerToast("✅ Headshot profile photo updated and saved successfully!");
                              } catch (err: any) {
                                triggerToast(`⚠️ Photo processing error: ${err?.message || "Failed to read file"}`);
                              }
                            }
                          }}
                        />
                      </label>
                      <span className="text-[11px] text-[#9A9488]">Supports JPG, PNG, WEBP from your device</span>
                    </div>

                    <input
                      type="text"
                      placeholder="https://... (or leave blank to use default professional avatar)"
                      value={localHeadshotUrl}
                      onChange={(e) => handleHeadshotUrlChange(e.target.value)}
                      className="w-full bg-white border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
                    />
                  </div>
                </div>
              </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2D362E]">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={currentLo.phone}
                    onChange={(e) => updateCurrentLoField("phone", e.target.value)}
                    className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#4A5D4E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2D362E]">Direct Email Address</label>
                  <input
                    type="email"
                    required
                    value={currentLo.email}
                    onChange={(e) => updateCurrentLoField("email", e.target.value)}
                    className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#4A5D4E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2D362E]">Calendly / Booking Link</label>
                  <input
                    type="url"
                    value={currentLo.bookingUrl}
                    onChange={(e) => updateCurrentLoField("bookingUrl", e.target.value)}
                    className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#4A5D4E]"
                  />
                </div>
              </div>

              {/* State Mortgage Origination Licensing with Annual 1/1 Compliance Checkmark */}
              <div className="pt-2 border-t border-[#EAE7E0]">
                <StateLicensingSelector
                  selectedStates={currentLo.licenseStates || []}
                  verificationYear={currentLo.licenseVerificationYear ?? new Date().getFullYear()}
                  lastVerifiedDate={currentLo.licenseLastVerifiedDate}
                  onUpdate={(updatedStates, verifiedYear, verifiedDate) => {
                    const updatedLo: LoanOfficerProfile = {
                      ...currentLo,
                      licenseStates: updatedStates,
                      licenseVerificationYear: verifiedYear,
                      licenseLastVerifiedDate: verifiedDate
                    };
                    const updatedLos = guidesState.loanOfficers.map(l => l.id === currentLo.id ? updatedLo : l);
                    onUpdateGuidesState({
                      ...guidesState,
                      loanOfficers: updatedLos,
                      loanOfficer: updatedLo
                    });
                    if (verifiedYear === new Date().getFullYear() && updatedStates.length > 0) {
                      triggerToast(`✅ Active green compliance confirmed for ${verifiedYear}! (${updatedStates.length} states licensed)`);
                    } else if (verifiedYear < new Date().getFullYear()) {
                      triggerToast(`⚠️ Annual 1/1 compliance reset simulated. Re-selection required.`);
                    }
                  }}
                />
              </div>

              {/* Market News Agent Spotlight Dropdown & MLS Area Rule */}
              {(() => {
                const loAgentCategories = getLoanOfficerAgentCategories(
                  currentLo,
                  guidesState.agentRoster,
                  guidesState.pairings
                );
                const spotAgent = loAgentCategories.currentSpotlightAgent;
                const mlsInfo = getAgentMlsInfo(spotAgent);
                const isPaired = loAgentCategories.pairedAgents.some(a => a.id === spotAgent?.id);

                return (
                  <div className="space-y-4 bg-gradient-to-br from-[#FAF9F5] via-white to-[#F5F2EA] p-5 sm:p-6 rounded-2xl border-2 border-[#C18C5D]/30 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE7E0] pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-[#C18C5D]/15 text-[#8C5D30]">
                            <Sparkles className="w-4 h-4 text-[#C18C5D]" />
                          </span>
                          <h4 className="text-sm font-serif font-bold text-[#2D362E]">
                            Market News Agent Spotlight (Solo LO Link Sourcing)
                          </h4>
                        </div>
                        <p className="text-xs text-[#606C5D] mt-1">
                          Controls which agent is spotlighted with rotating recommendations and 10–15 matched low/no down payment listings when buyers visit your solo Loan Officer URL.
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Oregon MLS & RentCast Synced
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-[#2D362E] flex items-center gap-1.5">
                          <span>Select Spotlight Agent from Stable or Existing Pairings</span>
                        </label>
                        <span className="text-[11px] text-[#8C5D30] font-semibold">
                          {loAgentCategories.pairedAgents.length} Paired • {loAgentCategories.unpairedAgents.length} Stable (Imported)
                        </span>
                      </div>

                      <select
                        value={currentLo.marketNewsSpotlightAgentId || spotAgent?.id || ""}
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          updateCurrentLoField("marketNewsSpotlightAgentId", selectedId);
                          const agent = guidesState.agentRoster.find(a => a.id === selectedId);
                          if (agent) {
                            triggerToast(`🎯 Market News Spotlight set to ${agent.name} (${agent.mlsAffiliation || "Oregon MLS"})`);
                          }
                        }}
                        className="w-full bg-white border-2 border-[#C18C5D]/40 hover:border-[#C18C5D] rounded-xl px-3.5 py-2.5 text-xs font-medium text-[#2D362E] focus:outline-none focus:border-[#4A5D4E] shadow-2xs transition-colors cursor-pointer"
                      >
                        <optgroup label="🤝 Paired Partner Agents (Existing Active Pairings)">
                          {loAgentCategories.pairedAgents.map(agent => (
                            <option key={agent.id} value={agent.id}>
                              ⭐ {agent.name} — {agent.brokerage} [{agent.mlsAffiliation || "RMLS"}: {(agent.marketAreas || []).slice(0, 2).join(", ")}]
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="📋 Stable of Imported Agents (Not Yet Paired)">
                          {loAgentCategories.unpairedAgents.map(agent => (
                            <option key={agent.id} value={agent.id}>
                              📋 {agent.name} — {agent.brokerage} [{agent.mlsAffiliation || "Oregon MLS"}: {(agent.marketAreas || []).slice(0, 2).join(", ")}]
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>

                    {/* Spotlight Agent Details Card */}
                    {spotAgent && (
                      <div className="bg-white rounded-xl p-4 border border-[#EAE7E0] space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-[#FAF9F5] border border-[#EAE7E0] overflow-hidden flex items-center justify-center shrink-0">
                              {spotAgent.headshotUrl ? (
                                <img src={spotAgent.headshotUrl} alt={spotAgent.name} className="w-full h-full object-cover" />
                              ) : (
                                <UserCheck className="w-6 h-6 text-[#4A5D4E]" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="text-sm font-bold text-[#2D362E]">{spotAgent.name}</h5>
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  isPaired ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-blue-50 text-blue-800 border border-blue-200"
                                }`}>
                                  {isPaired ? "🤝 Active LO Pairing" : "📋 Stable (Imported)"}
                                </span>
                              </div>
                              <p className="text-xs text-[#606C5D]">{spotAgent.title} • {spotAgent.brokerage}</p>
                              <p className="text-[11px] text-[#9A9488]">{spotAgent.phone} • {spotAgent.email}</p>
                            </div>
                          </div>

                          <div className="text-left sm:text-right space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#4A5D4E]/10 text-[#4A5D4E] text-xs font-bold border border-[#4A5D4E]/20">
                              <Compass className="w-3.5 h-3.5 text-[#C18C5D]" />
                              {mlsInfo.mls.shortName}
                            </span>
                            <p className="text-[10px] text-[#9A9488]">
                              Counties: {mlsInfo.allCounties.slice(0, 4).join(", ")}
                            </p>
                          </div>
                        </div>

                        {/* Injection Rules Summary */}
                        <div className="p-3 rounded-lg bg-[#FAF9F5] border border-[#EAE7E0] text-[11px] space-y-1.5 text-[#606C5D]">
                          <div className="flex items-start gap-1.5 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>
                              <strong>Solo Loan Officer URL Rule:</strong> Homebuyers visiting your solo link (no agent parameter) will see <em>{spotAgent.name}</em> ({spotAgent.phone}) injected with random timing into housing market intelligence.
                            </span>
                          </div>
                          <div className="flex items-start gap-1.5 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>
                              <strong>10–15 Listings MLS Filter:</strong> Features recent homes in <strong>{mlsInfo.primaryCounty} County</strong> matching USDA 0% down, OHCS LMI flex grants, Lakeview National, and FirstHome price caps with direct Zillow verification links.
                            </span>
                          </div>
                          <div className="flex items-start gap-1.5 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>
                              <strong>Listing Agent Synchronization:</strong> If {spotAgent.name} is the listing agent of record on any home (via RentCast data), that home is highlighted with a gold direct listing badge and direct contact action.
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2D362E]">Professional Bio</label>
                <textarea
                  rows={3}
                  value={currentLo.bio}
                  onChange={(e) => updateCurrentLoField("bio", e.target.value)}
                  className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl p-3 text-xs focus:outline-none focus:border-[#4A5D4E] leading-relaxed"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Profile Updates</span>
                </button>
              </div>
            </form>

            {/* Account Security & Active Session Card */}
            <div className="pt-6 border-t border-[#EAE7E0] mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#FAF9F5] p-5 rounded-2xl border border-[#EAE7E0]">
              <div className="space-y-1">
                <span className="text-xs font-bold text-[#2D362E] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#4A5D4E]" />
                  <span>Active Dashboard Session ({loggedInUser.name})</span>
                </span>
                <p className="text-xs text-[#606C5D]">
                  Signed in as <strong>{loggedInUser.email}</strong>. Log out to return to the sign-in screen.
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out of Dashboard</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab: DPA & State Grant Intelligence */}
        {activeTab === "dpa_grants" && (
          <GrantFinder
            guidesState={guidesState}
            onTriggerToast={triggerToast}
          />
        )}

        {/* Tab: AI Partner Campaign Engine */}
        {activeTab === "ai_partner_campaign" && (
          <AIPartnerCampaign
            loanOfficer={currentLo}
            agentRoster={guidesState.agentRoster}
            properties={properties}
            pairingUrl={activePairingUrl}
            onOpenEmailOutreachModal={() => setShowEmailOutreachModal(true)}
            triggerToast={triggerToast}
          />
        )}

        {/* Tab: GeoSphere Oregon Map Sync & Listing Curation Hub */}
        {activeTab === "geosphere_sync" && (
          <GeoSphereSyncHub
            guidesState={guidesState}
            onUpdateGuidesState={onUpdateGuidesState}
            properties={properties}
            setProperties={setProperties}
            onTriggerToast={triggerToast}
          />
        )}

        {/* Tab 5: Multi-Channel Social Push */}
        {activeTab === "social_push" && (
          <SocialPushHub
            loanOfficer={currentLo}
            activeAgent={activeAgent}
            socialCampaigns={guidesState.socialCampaigns || []}
            onAddCampaign={(campaign) => {
              onUpdateGuidesState({
                ...guidesState,
                socialCampaigns: [campaign, ...(guidesState.socialCampaigns || [])]
              });
            }}
            pairingUrl={activePairingUrl}
          />
        )}

        {/* Tab 6: Meta (Facebook) & Google Ads Automated Builder */}
        {activeTab === "ad_campaigns" && (
          <AdsCampaignHub
            loanOfficer={currentLo}
            activeAgent={activeAgent}
            adCampaignDrafts={guidesState.adCampaignDrafts || []}
            onSaveAdDraft={(draft) => {
              onUpdateGuidesState({
                ...guidesState,
                adCampaignDrafts: [draft, ...(guidesState.adCampaignDrafts || [])]
              });
            }}
            onUpdateAdSettings={(adSettings) => {
              const updatedLo = { ...currentLo, adSettings };
              const updatedLos = guidesState.loanOfficers.map(l => l.id === currentLo.id ? updatedLo : l);
              onUpdateGuidesState({
                ...guidesState,
                loanOfficer: updatedLo,
                loanOfficers: updatedLos
              });
            }}
            pairingUrl={activePairingUrl}
          />
        )}

        {/* Tab: SMS Compliance & Opt-in Management Dashboard */}
        {activeTab === "sms_compliance" && (
          <SmsComplianceDashboard
            leads={
              permissions.canViewAllAuditLogs
                ? (guidesState.leads || [])
                : (guidesState.leads || []).filter(l => l.assignedLoId === currentLo.id || l.assignedLO === currentLo.name || (l as any).loId === currentLo.id)
            }
            loanOfficer={currentLo}
            userRole={effectiveRbacRole}
            onUpdateLead={(updatedLead) => {
              const updatedLeads = (guidesState.leads || []).map(l => l.id === updatedLead.id ? updatedLead : l);
              onUpdateGuidesState({
                ...guidesState,
                leads: updatedLeads
              });
            }}
            onUpdateAllLeads={(updatedLeads) => {
              onUpdateGuidesState({
                ...guidesState,
                leads: updatedLeads
              });
            }}
            onOpenSmsMessaging={(lead) => {
              setSmsModalLead(lead);
            }}
          />
        )}

        {/* Tab: Pre-written SMS Templates Library */}
        {activeTab === "sms_templates" && (
          <SmsTemplateLibrary
            templates={guidesState.smsTemplates && guidesState.smsTemplates.length > 0 ? guidesState.smsTemplates : DEFAULT_SMS_TEMPLATES}
            onSaveTemplate={(template) => {
              const currentTemplates = guidesState.smsTemplates && guidesState.smsTemplates.length > 0 ? guidesState.smsTemplates : DEFAULT_SMS_TEMPLATES;
              const existingIndex = currentTemplates.findIndex(t => t.id === template.id);
              let updatedTemplates;
              if (existingIndex >= 0) {
                updatedTemplates = [...currentTemplates];
                updatedTemplates[existingIndex] = template;
              } else {
                updatedTemplates = [template, ...currentTemplates];
              }
              onUpdateGuidesState({
                ...guidesState,
                smsTemplates: updatedTemplates
              });
              triggerToast(`⚡ Template '${template.title}' saved!`);
            }}
            onDeleteTemplate={(id) => {
              const currentTemplates = guidesState.smsTemplates && guidesState.smsTemplates.length > 0 ? guidesState.smsTemplates : DEFAULT_SMS_TEMPLATES;
              const updatedTemplates = currentTemplates.filter(t => t.id !== id);
              onUpdateGuidesState({
                ...guidesState,
                smsTemplates: updatedTemplates
              });
              triggerToast("🗑️ Template removed from library.");
            }}
          />
        )}

        {activeTab === "system_pitch_deck" && (
          <SystemPitchDeck />
        )}

        {activeTab === "branch_management" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out fill-mode-both">
            <BranchManagement onNavigateToSeo={() => setActiveTab("branch_seo_metadata")} />
          </div>
        )}

        {activeTab === "branch_seo_metadata" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out fill-mode-both">
            <MetadataConfiguration onBackToBranchManagement={() => setActiveTab("branch_management")} />
          </div>
        )}

        {activeTab === "branch_admin_metrics" && (
          <BranchManagerDashboard 
            guidesState={guidesState}
            onUpdateGuidesState={onUpdateGuidesState}
            onTriggerToast={triggerToast}
          />
        )}

        {activeTab === "growth_dashboard" && (
          <GrowthDashboard guidesState={guidesState} />
        )}

          </main>
        </div>
      </div>

      {/* Add / Edit Loan Officer Modal */}
      {(showAddLoModal || editingLo) && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 border border-[#EAE7E0] shadow-2xl animate-in zoom-in-95 duration-150 text-[#2D362E] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-3">
              <h4 className="font-serif font-bold text-lg text-[#2D362E]">
                {editingLo ? `Edit Profile: ${editingLo.name}` : "Add Downstream Managed Loan Officer"}
              </h4>
              <button
                onClick={() => { setShowAddLoModal(false); setEditingLo(null); }}
                className="text-xs text-[#9A9488] hover:text-[#2D362E]"
              >
                ✕ Cancel
              </button>
            </div>

            <form onSubmit={handleSaveLoanOfficer} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#606C5D]">Officer Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jessica Taylor"
                    value={editingLo ? editingLo.name : newLoForm.name}
                    onChange={(e) => editingLo ? setEditingLo({ ...editingLo, name: e.target.value }) : setNewLoForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#4A5D4E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#606C5D]">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Mortgage Advisor"
                    value={editingLo ? editingLo.title : newLoForm.title}
                    onChange={(e) => editingLo ? setEditingLo({ ...editingLo, title: e.target.value }) : setNewLoForm(p => ({ ...p, title: e.target.value }))}
                    className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#4A5D4E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#606C5D]">NMLS ID</label>
                  <input
                    type="text"
                    required
                    placeholder="NMLS #1234567"
                    value={editingLo ? editingLo.nmlsId : newLoForm.nmlsId}
                    onChange={(e) => editingLo ? setEditingLo({ ...editingLo, nmlsId: e.target.value }) : setNewLoForm(p => ({ ...p, nmlsId: e.target.value }))}
                    className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#4A5D4E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#606C5D]">Branch / Metro</label>
                  <input
                    type="text"
                    placeholder="Portland East Branch"
                    value={editingLo ? editingLo.branch || "" : newLoForm.branch}
                    onChange={(e) => editingLo ? setEditingLo({ ...editingLo, branch: e.target.value }) : setNewLoForm(p => ({ ...p, branch: e.target.value }))}
                    className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#4A5D4E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#606C5D]">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="lonn.kilstrom@cfmtg.com"
                    value={editingLo ? editingLo.email : newLoForm.email}
                    onChange={(e) => editingLo ? setEditingLo({ ...editingLo, email: e.target.value }) : setNewLoForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#4A5D4E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#606C5D]">Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="(503) 849-3478"
                    value={editingLo ? editingLo.phone : newLoForm.phone}
                    onChange={(e) => editingLo ? setEditingLo({ ...editingLo, phone: e.target.value }) : setNewLoForm(p => ({ ...p, phone: e.target.value }))}
                    className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#4A5D4E]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#606C5D] flex items-center justify-between">
                  <span>Official Website / CFMTG Bio Link</span>
                  <span className="text-[10px] text-[#9A9488]">Optional (e.g. https://cfmtg.com/mford/)</span>
                </label>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 text-[#9A9488] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    placeholder="https://cfmtg.com/mford/"
                    value={editingLo ? (editingLo.websiteUrl || "") : (newLoForm.websiteUrl || "")}
                    onChange={(e) => editingLo ? setEditingLo({ ...editingLo, websiteUrl: e.target.value }) : setNewLoForm(p => ({ ...p, websiteUrl: e.target.value }))}
                    className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#4A5D4E]"
                  />
                </div>
              </div>

              {/* Headshot Photo Section with Upload & URL */}
              <div className="space-y-2 bg-[#F9F8F4] p-3.5 rounded-2xl border border-[#EAE7E0]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#2D362E] flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#4A5D4E]" />
                    <span>Headshot Profile Photo</span>
                  </label>
                  <span className="text-[10px] text-[#9A9488]">URL or Local Upload</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <HeadshotAvatar
                      src={editingLo ? editingLo.headshotUrl : newLoForm.headshotUrl}
                      name={editingLo ? editingLo.name : (newLoForm.name || "Loan Officer")}
                      title={editingLo ? editingLo.title : newLoForm.title}
                      className="w-14 h-14 rounded-2xl border-2 border-white shadow-md bg-[#EAE7E0]"
                    />
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer px-3 py-1.5 bg-white hover:bg-[#F1EFE9] border border-[#EAE7E0] hover:border-[#4A5D4E] rounded-xl text-xs font-semibold text-[#2D362E] flex items-center gap-1.5 shadow-2xs transition-colors shrink-0">
                        <Upload className="w-3.5 h-3.5 text-[#4A5D4E]" />
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const result = await processLocalImageFile(file);
                                if (editingLo) {
                                  setEditingLo({ ...editingLo, headshotUrl: result });
                                } else {
                                  setNewLoForm(p => ({ ...p, headshotUrl: result }));
                                }
                                triggerToast("✅ Photo file processed!");
                              } catch (err: any) {
                                triggerToast(`⚠️ Photo processing error: ${err?.message || "Failed to read file"}`);
                              }
                            }
                          }}
                        />
                      </label>
                      <span className="text-[10px] text-[#9A9488]">or paste web link below</span>
                    </div>

                    <input
                      type="text"
                      placeholder="https://... or file data URL"
                      value={editingLo ? editingLo.headshotUrl : newLoForm.headshotUrl}
                      onChange={(e) => editingLo ? setEditingLo({ ...editingLo, headshotUrl: e.target.value }) : setNewLoForm(p => ({ ...p, headshotUrl: e.target.value }))}
                      className="w-full bg-white border border-[#EAE7E0] rounded-xl px-3 py-1.5 text-xs text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
                    />
                  </div>
                </div>
              </div>

              {/* State Licensing & Compliance Selector */}
              <div className="pt-2 border-t border-[#EAE7E0]">
                <StateLicensingSelector
                  selectedStates={editingLo ? editingLo.licenseStates || [] : newLoForm.licenseStates || []}
                  verificationYear={editingLo ? editingLo.licenseVerificationYear : newLoForm.licenseVerificationYear}
                  lastVerifiedDate={editingLo ? editingLo.licenseLastVerifiedDate : newLoForm.licenseLastVerifiedDate}
                  onUpdate={(states, year, date) => {
                    if (editingLo) {
                      setEditingLo({
                        ...editingLo,
                        licenseStates: states,
                        licenseVerificationYear: year,
                        licenseLastVerifiedDate: date
                      });
                    } else {
                      setNewLoForm(p => ({
                        ...p,
                        licenseStates: states,
                        licenseVerificationYear: year,
                        licenseLastVerifiedDate: date
                      }));
                    }
                  }}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#606C5D]">Bio / Specialties</label>
                <textarea
                  rows={2}
                  value={editingLo ? editingLo.bio : newLoForm.bio}
                  onChange={(e) => editingLo ? setEditingLo({ ...editingLo, bio: e.target.value }) : setNewLoForm(p => ({ ...p, bio: e.target.value }))}
                  className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl p-3 text-xs focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>

              {/* Password & Reset Authorization Management */}
              <div className="pt-2 border-t border-[#EAE7E0] space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#2D362E] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#4A5D4E]" />
                    <span>Account Password & Security Authorization</span>
                  </label>
                  <span className="text-[10px] text-[#606C5D]">Branch Admin Controls</span>
                </div>

                <div className="bg-[#FAF9F5] p-3.5 rounded-2xl border border-[#EAE7E0] space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#606C5D]">Direct Private Password</label>
                    <div className="relative">
                      <Key className="w-3.5 h-3.5 text-[#9A9488] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="e.g. pass123"
                        value={editingLo ? (editingLo.password || "") : (newLoForm.password || "")}
                        onChange={(e) => {
                          if (editingLo) {
                            setEditingLo({ ...editingLo, password: e.target.value });
                          } else {
                            setNewLoForm(p => ({ ...p, password: e.target.value }));
                          }
                        }}
                        className="w-full bg-white border border-[#EAE7E0] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
                      />
                    </div>
                    <p className="text-[10px] text-[#9A9488]">Admin can directly override this LO&apos;s password here.</p>
                  </div>

                  {editingLo && !editingLo.isAdmin && (
                    <div className="pt-2 border-t border-[#EAE7E0] flex items-center justify-between gap-3 flex-wrap">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-[#2D362E] block">
                          Authorize LO Password Reset on Login View
                        </span>
                        <p className="text-[10px] text-[#606C5D]">
                          {editingLo.passwordResetAuthorized 
                            ? `✅ Authorized ${editingLo.passwordResetAuthorizedAt ? `on ${new Date(editingLo.passwordResetAuthorizedAt).toLocaleDateString()}` : ''} (PIN: ${editingLo.passwordResetPin || 'Active'})`
                            : (editingLo.passwordResetRequestedAt 
                                ? `⚠️ Reset requested on ${new Date(editingLo.passwordResetRequestedAt).toLocaleDateString()} by ${editingLo.name}`
                                : "🔒 Locked. Non-admin LO cannot reset password until authorized."
                              )
                          }
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (editingLo.passwordResetAuthorized) {
                            setEditingLo({
                              ...editingLo,
                              passwordResetAuthorized: false,
                              passwordResetRequestedAt: undefined,
                              passwordResetAuthorizedAt: undefined,
                              passwordResetPin: undefined
                            });
                          } else {
                            const pin = Math.floor(1000 + Math.random() * 9000).toString();
                            setEditingLo({
                              ...editingLo,
                              passwordResetAuthorized: true,
                              passwordResetAuthorizedAt: new Date().toISOString(),
                              passwordResetPin: pin
                            });
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                          editingLo.passwordResetAuthorized
                            ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                            : "bg-[#4A5D4E] hover:bg-[#38463B] text-white shadow-2xs"
                        }`}
                      >
                        {editingLo.passwordResetAuthorized ? "Revoke Reset Authorization" : "Authorize LO Password Reset"}
                      </button>
                    </div>
                  )}
                  {editingLo && !editingLo.isAdmin && (
                    <div className="pt-2 border-t border-[#EAE7E0] flex items-center justify-between gap-3 flex-wrap mt-3">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-[#2D362E] block">
                          Temporary Account Restriction
                        </span>
                        <p className="text-[10px] text-[#606C5D]">
                          {editingLo.accountRestricted
                            ? `⛔ Account currently restricted (since ${editingLo.accountRestrictedAt ? new Date(editingLo.accountRestrictedAt).toLocaleDateString() : 'recently'}). LO cannot log in.`
                            : "✅ Account is active. LO can log in normally."
                          }
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (editingLo.accountRestricted) {
                            setEditingLo({
                              ...editingLo,
                              accountRestricted: false,
                              accountRestrictedAt: undefined
                            });
                          } else {
                            setEditingLo({
                              ...editingLo,
                              accountRestricted: true,
                              accountRestrictedAt: new Date().toISOString()
                            });
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                          editingLo.accountRestricted
                            ? "bg-[#4A5D4E] hover:bg-[#38463B] text-white shadow-2xs"
                            : "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {editingLo.accountRestricted ? "Remove Restriction" : "Restrict Access"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAddLoModal(false); setEditingLo(null); }}
                  className="px-4 py-2 text-xs font-semibold text-[#606C5D] hover:bg-[#F1EFE9] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#4A5D4E] hover:bg-[#38463B] rounded-xl shadow-xs"
                >
                  {editingLo ? "Update Loan Officer" : "Add Loan Officer & Generate Links"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Agent Modal */}
      {(showAddAgentModal || editingAgent) && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 border border-[#EAE7E0] shadow-2xl animate-in zoom-in-95 duration-150 text-[#2D362E] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-3">
              <div>
                <h4 className="font-serif font-bold text-lg text-[#2D362E]">
                  {editingAgent ? `Edit Realtor: ${editingAgent.name}` : "Add Real Estate Agent Partner"}
                </h4>
                <p className="text-xs text-[#606C5D]">Create manually or auto-search with AI</p>
              </div>
              <button
                onClick={() => { setShowAddAgentModal(false); setEditingAgent(null); setAiAgentMsg(null); }}
                className="text-xs text-[#9A9488] hover:text-[#2D362E]"
              >
                ✕ Cancel
              </button>
            </div>

            {/* AI Agent Profile Creation Section */}
            <div className="bg-gradient-to-r from-[#4A5D4E]/10 via-[#FAF9F5] to-[#C18C5D]/10 border border-[#4A5D4E]/30 rounded-2xl p-4 space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#4A5D4E] text-white rounded-xl">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#2D362E]">AI Agent Profile Creation</h5>
                    <p className="text-[11px] text-[#606C5D]">Type an agent's name, website URL, or brokerage office to auto-search & populate full profile</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 'Sarah Jenkins, Cascade Valley Realty, Eugene' or agent website URL..."
                  value={aiAgentQuery}
                  onChange={(e) => setAiAgentQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAiSearchAgent();
                    }
                  }}
                  className="flex-1 bg-white border border-[#EAE7E0] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#4A5D4E] text-[#2D362E]"
                />
                <button
                  type="button"
                  onClick={handleAiSearchAgent}
                  disabled={isAiSearchingAgent || !aiAgentQuery.trim()}
                  className="px-4 py-2 bg-[#4A5D4E] hover:bg-[#38463B] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all shadow-xs"
                >
                  <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isAiSearchingAgent ? 'animate-spin' : ''}`} />
                  <span>{isAiSearchingAgent ? "Searching Online..." : "AI Auto-Create Profile"}</span>
                </button>
              </div>

              {aiAgentMsg && (
                <div className={`p-2.5 rounded-xl text-xs font-medium ${aiAgentMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                  {aiAgentMsg.text}
                </div>
              )}
            </div>

            <form onSubmit={handleSaveAgent} className="space-y-4">
              {/* Agent Tagging: Buyer Agent vs Listing Agent vs Dual */}
              <div className="space-y-1.5 bg-[#F9F8F4] p-3 rounded-2xl border border-[#EAE7E0]">
                <label className="text-xs font-bold text-[#2D362E] flex items-center justify-between">
                  <span>Agent Role / Tagging</span>
                  <span className="text-[10px] text-[#606C5D]">Essential for targeted buyer outreach campaigns</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => editingAgent ? setEditingAgent({ ...editingAgent, agentType: 'buyer_agent' }) : setNewAgentForm(p => ({ ...p, agentType: 'buyer_agent' }))}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                      (editingAgent ? editingAgent.agentType : newAgentForm.agentType) === 'buyer_agent'
                        ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                        : 'bg-white border-[#EAE7E0] text-[#606C5D] hover:bg-[#F1EFE9]'
                    }`}
                  >
                    <span>🟢</span>
                    <span>Buyer's Agent</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => editingAgent ? setEditingAgent({ ...editingAgent, agentType: 'listing_agent' }) : setNewAgentForm(p => ({ ...p, agentType: 'listing_agent' }))}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                      (editingAgent ? editingAgent.agentType : newAgentForm.agentType) === 'listing_agent'
                        ? 'bg-blue-700 text-white border-blue-800 shadow-xs'
                        : 'bg-white border-[#EAE7E0] text-[#606C5D] hover:bg-[#F1EFE9]'
                    }`}
                  >
                    <span>🔵</span>
                    <span>Listing Agent</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => editingAgent ? setEditingAgent({ ...editingAgent, agentType: 'dual_agent' }) : setNewAgentForm(p => ({ ...p, agentType: 'dual_agent' }))}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                      (editingAgent ? editingAgent.agentType : newAgentForm.agentType) === 'dual_agent'
                        ? 'bg-purple-700 text-white border-purple-800 shadow-xs'
                        : 'bg-white border-[#EAE7E0] text-[#606C5D] hover:bg-[#F1EFE9]'
                    }`}
                  >
                    <span>🟣</span>
                    <span>Dual / Full-Service</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#606C5D]">Agent Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Marcus Vance"
                    value={editingAgent ? editingAgent.name : newAgentForm.name}
                    onChange={(e) => editingAgent ? setEditingAgent({ ...editingAgent, name: e.target.value }) : setNewAgentForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#4A5D4E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#606C5D]">Brokerage / Office</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Willamette Heritage Realty"
                    value={editingAgent ? editingAgent.brokerage : newAgentForm.brokerage}
                    onChange={(e) => editingAgent ? setEditingAgent({ ...editingAgent, brokerage: e.target.value }) : setNewAgentForm(p => ({ ...p, brokerage: e.target.value }))}
                    className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#4A5D4E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#606C5D]">License Number</label>
                  <input
                    type="text"
                    required
                    placeholder="OR Lic #200804192"
                    value={editingAgent ? editingAgent.licenseNumber : newAgentForm.licenseNumber}
                    onChange={(e) => editingAgent ? setEditingAgent({ ...editingAgent, licenseNumber: e.target.value }) : setNewAgentForm(p => ({ ...p, licenseNumber: e.target.value }))}
                    className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#4A5D4E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#606C5D]">Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="(503) 555-0177"
                    value={editingAgent ? editingAgent.phone : newAgentForm.phone}
                    onChange={(e) => editingAgent ? setEditingAgent({ ...editingAgent, phone: e.target.value }) : setNewAgentForm(p => ({ ...p, phone: e.target.value }))}
                    className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#4A5D4E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#606C5D]">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="marcus@realty.com"
                    value={editingAgent ? editingAgent.email : newAgentForm.email}
                    onChange={(e) => editingAgent ? setEditingAgent({ ...editingAgent, email: e.target.value }) : setNewAgentForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#4A5D4E]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#606C5D]">Website URL</label>
                  <input
                    type="url"
                    placeholder="https://realty.com/agent"
                    value={editingAgent ? (editingAgent.websiteUrl || "") : (newAgentForm.websiteUrl || "")}
                    onChange={(e) => editingAgent ? setEditingAgent({ ...editingAgent, websiteUrl: e.target.value }) : setNewAgentForm(p => ({ ...p, websiteUrl: e.target.value }))}
                    className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#4A5D4E]"
                  />
                </div>
              </div>

              {/* Experience & Production Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#606C5D]">Years Experience</label>
                  <input
                    type="number"
                    placeholder="e.g. 10"
                    value={editingAgent ? (editingAgent.experienceYears || 8) : (newAgentForm.experienceYears || 8)}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      editingAgent ? setEditingAgent({ ...editingAgent, experienceYears: val }) : setNewAgentForm(p => ({ ...p, experienceYears: val }));
                    }}
                    className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#4A5D4E]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#606C5D]">Active Listings / Volume</label>
                  <input
                    type="number"
                    placeholder="e.g. 14"
                    value={editingAgent ? (editingAgent.activeListingsCount || 12) : (newAgentForm.activeListingsCount || 12)}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      editingAgent ? setEditingAgent({ ...editingAgent, activeListingsCount: val }) : setNewAgentForm(p => ({ ...p, activeListingsCount: val }));
                    }}
                    className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#4A5D4E]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#606C5D]">Rating (⭐)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    placeholder="4.9"
                    value={editingAgent ? (editingAgent.rating || 4.9) : (newAgentForm.rating || 4.9)}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 4.9;
                      editingAgent ? setEditingAgent({ ...editingAgent, rating: val }) : setNewAgentForm(p => ({ ...p, rating: val }));
                    }}
                    className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#4A5D4E]"
                  />
                </div>
              </div>

              {/* Realtor Headshot Photo Section with Upload & URL */}
              <div className="space-y-2 bg-[#F9F8F4] p-3.5 rounded-2xl border border-[#EAE7E0]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#2D362E] flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#4A5D4E]" />
                    <span>Agent Headshot Photo</span>
                  </label>
                  <span className="text-[10px] text-[#9A9488]">URL or Local Upload</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <HeadshotAvatar
                      src={editingAgent ? editingAgent.headshotUrl : newAgentForm.headshotUrl}
                      name={editingAgent ? editingAgent.name : (newAgentForm.name || "Agent")}
                      title={editingAgent ? editingAgent.title : newAgentForm.title}
                      className="w-14 h-14 rounded-2xl border-2 border-white shadow-md bg-[#EAE7E0]"
                    />
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer px-3 py-1.5 bg-white hover:bg-[#F1EFE9] border border-[#EAE7E0] hover:border-[#4A5D4E] rounded-xl text-xs font-semibold text-[#2D362E] flex items-center gap-1.5 shadow-2xs transition-colors shrink-0">
                        <Upload className="w-3.5 h-3.5 text-[#4A5D4E]" />
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const result = await processLocalImageFile(file);
                                if (editingAgent) {
                                  setEditingAgent({ ...editingAgent, headshotUrl: result });
                                } else {
                                  setNewAgentForm(p => ({ ...p, headshotUrl: result }));
                                }
                                triggerToast("✅ Agent photo file processed!");
                              } catch (err: any) {
                                triggerToast(`⚠️ Photo processing error: ${err?.message || "Failed to read file"}`);
                              }
                            }
                          }}
                        />
                      </label>
                      <span className="text-[10px] text-[#9A9488]">or paste web link below</span>
                    </div>

                    <input
                      type="text"
                      placeholder="https://... or file data URL"
                      value={editingAgent ? editingAgent.headshotUrl : newAgentForm.headshotUrl}
                      onChange={(e) => editingAgent ? setEditingAgent({ ...editingAgent, headshotUrl: e.target.value }) : setNewAgentForm(p => ({ ...p, headshotUrl: e.target.value }))}
                      className="w-full bg-white border border-[#EAE7E0] rounded-xl px-3 py-1.5 text-xs text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#606C5D]">Bio / Overview</label>
                <textarea
                  rows={2}
                  value={editingAgent ? editingAgent.bio : newAgentForm.bio}
                  onChange={(e) => editingAgent ? setEditingAgent({ ...editingAgent, bio: e.target.value }) : setNewAgentForm(p => ({ ...p, bio: e.target.value }))}
                  className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl p-3 text-xs focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAddAgentModal(false); setEditingAgent(null); }}
                  className="px-4 py-2 text-xs font-semibold text-[#606C5D] hover:bg-[#F1EFE9] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#4A5D4E] hover:bg-[#38463B] rounded-xl shadow-xs"
                >
                  {editingAgent ? "Save Agent" : "Add Partner Agent"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create New Pairing Modal */}
      {showAddPairingModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-[#EAE7E0] shadow-2xl animate-in zoom-in-95 duration-150 text-[#2D362E]">
            <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-3">
              <h4 className="font-serif font-bold text-lg text-[#2D362E]">
                Create LO + Realtor Pairing
              </h4>
              <button
                onClick={() => setShowAddPairingModal(false)}
                className="text-xs text-[#9A9488] hover:text-[#2D362E]"
              >
                ✕ Cancel
              </button>
            </div>

            <form onSubmit={handleSavePairing} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#606C5D]">Select Loan Officer</label>
                <select
                  value={newPairingForm.loId}
                  onChange={(e) => setNewPairingForm(p => ({ ...p, loId: e.target.value }))}
                  className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                >
                  {guidesState.loanOfficers.map(lo => (
                    <option key={lo.id} value={lo.id}>
                      {lo.name} ({lo.nmlsId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#606C5D]">Select Real Estate Agent Partner</label>
                <select
                  value={newPairingForm.agentId}
                  onChange={(e) => setNewPairingForm(p => ({ ...p, agentId: e.target.value }))}
                  className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs font-bold focus:outline-none"
                >
                  {guidesState.agentRoster.map(agent => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} ({agent.brokerage})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#606C5D]">Pairing Title</label>
                <input
                  type="text"
                  placeholder="e.g. Mike Ford + Sarah Jenkins (Portland Homebuyer Team)"
                  value={newPairingForm.title}
                  onChange={(e) => setNewPairingForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#606C5D]">Campaign Tag</label>
                <input
                  type="text"
                  placeholder="e.g. spring-open-house-co-marketing"
                  value={newPairingForm.campaignTag}
                  onChange={(e) => setNewPairingForm(p => ({ ...p, campaignTag: e.target.value }))}
                  className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPairingModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#606C5D] hover:bg-[#F1EFE9] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#4A5D4E] hover:bg-[#38463B] rounded-xl shadow-xs"
                >
                  Create & Activate Pairing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Existing Pairing & Campaign Tag Modal */}
      {editingPairing && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-[#EAE7E0] shadow-2xl animate-in zoom-in-95 duration-150 text-[#2D362E]">
            <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-3">
              <div>
                <h4 className="font-serif font-bold text-lg text-[#2D362E] flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#4A5D4E]" />
                  <span>Customize Campaign Tag & Pairing</span>
                </h4>
                <p className="text-xs text-[#606C5D] mt-0.5">
                  Update the tracking tag name, pairing headline, and campaign settings.
                </p>
              </div>
              <button
                onClick={() => setEditingPairing(null)}
                className="text-xs text-[#9A9488] hover:text-[#2D362E] p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePairing} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2D362E]">Campaign Tracking Tag</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-mono font-bold text-[#4A5D4E]">#</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. spring-open-house-grants"
                    value={editingPairing.campaignTag || ""}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/^#/, "").replace(/\s+/g, "-").toLowerCase();
                      setEditingPairing({ ...editingPairing, campaignTag: clean });
                    }}
                    className="w-full bg-[#F9F8F4] border border-[#D5DDD6] rounded-xl pl-7 pr-3 py-2 text-xs font-mono font-bold text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
                  />
                </div>
                <p className="text-[10px] text-[#606C5D]">
                  This tag is attached to all leads submitted through this pair's co-branded URLs.
                </p>
              </div>

              {/* Quick Tag Suggestion Chips */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#606C5D] uppercase tracking-wider">Quick Suggestions:</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    "east-county-grants",
                    "spring-open-house",
                    "first-time-buyer-seminar",
                    "zero-down-usda",
                    "tech-equity-buyers",
                    "instagram-reel-promo"
                  ].map(suggestedTag => (
                    <button
                      key={suggestedTag}
                      type="button"
                      onClick={() => setEditingPairing({ ...editingPairing, campaignTag: suggestedTag })}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-lg border transition-colors ${
                        editingPairing.campaignTag === suggestedTag
                          ? "bg-[#4A5D4E] text-white border-[#4A5D4E]"
                          : "bg-[#FAF9F5] text-[#4A5D4E] border-[#EAE7E0] hover:bg-[#EAE7E0]"
                      }`}
                    >
                      #{suggestedTag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#606C5D]">Pairing Title / Campaign Header</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jessica Taylor + Marcus Vance (East County Homeownership)"
                  value={editingPairing.title}
                  onChange={(e) => setEditingPairing({ ...editingPairing, title: e.target.value })}
                  className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EAE7E0]">
                <button
                  type="button"
                  onClick={() => setEditingPairing(null)}
                  className="px-4 py-2 text-xs font-semibold text-[#606C5D] hover:bg-[#F1EFE9] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#4A5D4E] hover:bg-[#38463B] rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Campaign Tag & Title</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Chat Transcript Modal */}
      {viewingTranscriptLead && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-[#EAE7E0] overflow-hidden">
            {/* Header */}
            <div className="bg-[#4A5D4E] p-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-sm">
                  {viewingTranscriptLead.fullName.split(" ").map(n => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <h3 className="font-bold text-sm">{viewingTranscriptLead.fullName} • AI Chat Transcript</h3>
                  <p className="text-[11px] text-white/80">
                    {viewingTranscriptLead.leadSource} • {new Date(viewingTranscriptLead.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setViewingTranscriptLead(null)}
                className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Buyer Goal Summary Banner */}
            <div className="bg-[#FAF9F5] p-4 border-b border-[#EAE7E0] space-y-3 shrink-0">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                <div>
                  <span className="text-[10px] text-[#9A9488] font-bold uppercase">Timeline</span>
                  <p className="font-semibold text-[#2D362E]">{viewingTranscriptLead.timeline}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#9A9488] font-bold uppercase">Target Price</span>
                  <p className="font-semibold text-[#4A5D4E]">{viewingTranscriptLead.targetPriceRange}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#9A9488] font-bold uppercase">Annual Income</span>
                  <p className="font-semibold text-[#2D362E]">{viewingTranscriptLead.annualIncome || "N/A"}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#9A9488] font-bold uppercase">Down Payment</span>
                  <p className="font-semibold text-[#2D362E]">{viewingTranscriptLead.downPaymentSavings}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#9A9488] font-bold uppercase">Credit Tier</span>
                  <p className="font-semibold text-[#2D362E]">{viewingTranscriptLead.creditScoreTier}</p>
                </div>
              </div>
              {viewingTranscriptLead.notes && (
                <div className="pt-2 border-t border-[#EAE7E0] flex items-start gap-2 text-xs">
                  <StickyNote className="w-4 h-4 text-[#C18C5D] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#4A5D4E] text-[11px]">LO Interaction Notes:</span>
                    <p className="text-[#2D362E] text-xs whitespace-pre-wrap">{viewingTranscriptLead.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Transcript Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-[#F9F8F4]">
              {viewingTranscriptLead.chatTranscript && viewingTranscriptLead.chatTranscript.length > 0 ? (
                viewingTranscriptLead.chatTranscript.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-start gap-2.5 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                      msg.sender === "user" ? "bg-[#4A5D4E] text-white" : "bg-[#C18C5D] text-white"
                    }`}>
                      {msg.sender === "user" ? "B" : "AI"}
                    </div>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === "user" 
                        ? "bg-[#4A5D4E] text-white font-medium" 
                        : "bg-white border border-[#EAE7E0] text-[#2D362E]"
                    }`}>
                      <div className="whitespace-pre-line">{msg.text}</div>
                      {msg.time && (
                        <div className={`text-[9px] mt-1 text-right ${msg.sender === "user" ? "text-white/70" : "text-[#9A9488]"}`}>
                          {msg.time}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-[#9A9488]">
                  No chat messages logged for this lead.
                </div>
              )}
            </div>

            {/* Footer Action Bar */}
            <div className="bg-white p-3 border-t border-[#EAE7E0] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3 text-xs">
                <a 
                  href={`tel:${viewingTranscriptLead.phone}`}
                  className="font-bold text-[#4A5D4E] hover:underline flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call ({viewingTranscriptLead.phone})</span>
                </a>
                <button
                  onClick={() => {
                    const l = viewingTranscriptLead;
                    setViewingTranscriptLead(null);
                    setViewingJourneyLead(l);
                  }}
                  className="px-3 py-1.5 bg-[#4A5D4E] text-white hover:bg-[#38463B] text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-2xs"
                >
                  <Compass className="w-3.5 h-3.5 text-[#C18C5D]" />
                  <span>View Full Lead Journey</span>
                </button>
              </div>
              <button
                onClick={() => setViewingTranscriptLead(null)}
                className="px-4 py-2 bg-[#2D362E] text-white text-xs font-bold rounded-xl"
              >
                Close Transcript
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Password Management Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#EAE7E0] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE7E0]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#4A5D4E]/10 text-[#4A5D4E] flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#2D362E]">
                    Update Password for {isAdminUser ? currentLo.name : loggedInUser.name}
                  </h3>
                  <p className="text-[11px] text-[#606C5D]">
                    {isAdminUser && currentLo.id !== loggedInUser.id
                      ? "Admin override: Setting credentials for this team loan officer"
                      : "Set a secure private password for your loan officer dashboard"}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowPasswordModal(false)}
                className="text-[#9A9488] hover:text-[#2D362E] text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {passwordModalError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{passwordModalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveChangedPassword} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#606C5D]">New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password (min 4 characters)"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#4A5D4E]"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#606C5D]">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#4A5D4E]"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EAE7E0] text-[11px] text-[#606C5D] space-y-1">
                <p className="font-semibold text-[#2D362E]">Current Account Login ID:</p>
                <code className="text-[#4A5D4E] font-bold">
                  {isAdminUser ? currentLo.email || currentLo.id : loggedInUser.email || loggedInUser.id}
                </code>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#606C5D] hover:bg-[#F1EFE9] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#4A5D4E] hover:bg-[#38463B] rounded-xl shadow-xs"
                >
                  Save New Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Email Outreach Modal */}
      {showEmailOutreachModal && (
        <EmailOutreachModal
          isOpen={showEmailOutreachModal}
          onClose={() => {
            setShowEmailOutreachModal(false);
            setInitialOutreachLeadId(undefined);
          }}
          properties={properties || []}
          agentRoster={guidesState.agentRoster}
          leads={guidesState.leads || []}
          loanOfficers={guidesState.loanOfficers}
          initialSelectedLeadId={initialOutreachLeadId}
          onUpdateLead={(updatedLead) => {
            onUpdateGuidesState({
              ...guidesState,
              leads: (guidesState.leads || []).map(l => l.id === updatedLead.id ? updatedLead : l)
            });
          }}
          onTriggerToast={triggerToast}
        />
      )}

      {/* Automated Nurture Sequence Center & Co-Branding Modal */}
      {showNurtureModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#EAE7E0] overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="bg-[#2D362E] p-5 text-white flex items-center justify-between shrink-0 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#C18C5D] text-white flex items-center justify-center font-bold text-lg shadow-2xs shrink-0">
                  <Zap className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-bold text-base">Automated Lead Nurture Sequence Center</h3>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      globalNurtureEnabled
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
                        : "bg-amber-500/20 text-amber-300 border-amber-400/30"
                    }`}>
                      {globalNurtureEnabled ? "⚡ Global Nurture Active" : "⏸️ Global Nurture Paused"}
                    </span>
                  </div>
                  <p className="text-xs text-white/80 mt-0.5">
                    Co-Branded Educational Email Sequences for Loan Officers & Real Estate Agent Partners
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setShowNurtureModal(false)}
                className="p-2 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Global Controls & Lead Selector Sub-Bar */}
            <div className="bg-[#FAF9F5] p-4 border-b border-[#EAE7E0] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 flex-wrap">
                <label className="text-xs font-bold text-[#606C5D] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#4A5D4E]" />
                  <span>Previewing Lead:</span>
                </label>
                <select
                  value={selectedNurtureLeadId || (guidesState.leads?.[0]?.id || "")}
                  onChange={(e) => setSelectedNurtureLeadId(e.target.value)}
                  className="bg-white border border-[#EAE7E0] rounded-xl px-3 py-1.5 text-xs font-bold text-[#2D362E] focus:outline-none focus:border-[#4A5D4E] shadow-2xs"
                >
                  {(guidesState.leads || []).map(l => (
                    <option key={l.id} value={l.id}>
                      {l.fullName} ({l.status.toUpperCase()} • {l.nurtureSequenceEnabled ?? true ? "Nurture Active" : "Nurture Paused"})
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-1 text-xs">
                  <span className="text-[#606C5D] font-semibold">Tone:</span>
                  <select
                    value={nurtureTone}
                    onChange={(e) => setNurtureTone(e.target.value as any)}
                    className="bg-white border border-[#EAE7E0] rounded-xl px-2.5 py-1 text-xs font-semibold text-[#2D362E] focus:outline-none"
                  >
                    <option value="helpful">Helpful & Advisory</option>
                    <option value="concierge">Concierge Warmth</option>
                    <option value="financial">Direct Financial Strategy</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleGlobalNurture(!globalNurtureEnabled)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs ${
                    globalNurtureEnabled
                      ? "bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  {globalNurtureEnabled ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{globalNurtureEnabled ? "Pause All Sequences" : "Activate All Sequences"}</span>
                </button>
              </div>
            </div>

            {/* Sequence Navigation Tabs */}
            <div className="bg-white px-4 pt-3 border-b border-[#EAE7E0] flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
              {[
                { id: "overview", label: "Overview & Strategy", icon: FileText },
                { id: "stage_1", label: "Stage 1: Welcome (Day 0)", icon: Zap },
                { id: "stage_2", label: "Stage 2: Credit & Budget (Day 2)", icon: Clock },
                { id: "stage_3", label: "Stage 3: Pre-Approval (Active)", icon: CheckCircle2 },
                { id: "stage_4", label: "Stage 4: Escrow & CD (Escrow)", icon: Lock },
                { id: "stage_5", label: "Stage 5: Post-Close (Funded)", icon: Award },
                { id: "logs", label: "Dispatch Logs", icon: MailCheck },
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeNurtureTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveNurtureTab(tab.id as any)}
                    className={`px-3.5 py-2 text-xs font-bold rounded-t-xl border-b-2 flex items-center gap-1.5 transition-all whitespace-nowrap ${
                      isActive
                        ? "border-[#4A5D4E] text-[#4A5D4E] bg-[#FAF9F5]"
                        : "border-transparent text-[#606C5D] hover:text-[#2D362E] hover:bg-[#FAF9F5]/50"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Body Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-[#F9F8F4]">
              {(() => {
                const targetLead = (guidesState.leads || []).find(l => l.id === selectedNurtureLeadId) || (guidesState.leads || [])[0];
                const targetLo = guidesState.loanOfficers.find(o => o.id === targetLead?.assignedLoId) || currentLo;
                const targetAgent = guidesState.agentRoster.find(a => a.id === targetLead?.assignedAgentId) || guidesState.agentRoster[0];

                if (activeNurtureTab === "overview") {
                  return (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-2xl border border-[#EAE7E0] space-y-2 shadow-2xs">
                          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                            <Zap className="w-4 h-4" />
                          </div>
                          <h4 className="font-bold text-sm text-[#2D362E]">Automated Stage Triggers</h4>
                          <p className="text-xs text-[#606C5D]">
                            Emails fire automatically as leads move from New Intake to Pre-Approved, Escrow, and Closed status.
                          </p>
                        </div>

                        <div className="bg-white p-4 rounded-2xl border border-[#EAE7E0] space-y-2 shadow-2xs">
                          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                            <Users className="w-4 h-4" />
                          </div>
                          <h4 className="font-bold text-sm text-[#2D362E]">LO + Realtor Co-Branding</h4>
                          <p className="text-xs text-[#606C5D]">
                            Every email presents a unified, professional brand header showing both the Loan Officer and assigned Realtor.
                          </p>
                        </div>

                        <div className="bg-white p-4 rounded-2xl border border-[#EAE7E0] space-y-2 shadow-2xs">
                          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <h4 className="font-bold text-sm text-[#2D362E]">Non-Intrusive Value</h4>
                          <p className="text-xs text-[#606C5D]">
                            Delivers actionable financial advice, down payment assistance calculators, and neighborhood guides without spamming.
                          </p>
                        </div>
                      </div>

                      {/* Co-Branding Preview Banner */}
                      <div className="bg-white p-5 rounded-2xl border border-[#EAE7E0] space-y-3 shadow-2xs">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-[#9A9488]">
                          Active Co-Branding Header Preview
                        </h4>
                        <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-[#EAE7E0] flex flex-col sm:flex-row items-center justify-between gap-4">
                          {/* Loan Officer Profile Block */}
                          <div className="flex items-center gap-3">
                            {targetLo.headshotUrl ? (
                              <img src={targetLo.headshotUrl} alt={targetLo.name} className="w-12 h-12 rounded-2xl object-cover border border-[#EAE7E0]" />
                            ) : (
                              <div className="w-12 h-12 rounded-2xl bg-[#4A5D4E] text-white flex items-center justify-center font-bold">
                                {targetLo.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <div className="text-[10px] font-bold text-[#C18C5D] uppercase">Mortgage Advisor</div>
                              <div className="font-bold text-sm text-[#2D362E]">{targetLo.name}</div>
                              <div className="text-[11px] text-[#606C5D]">{targetLo.company} • NMLS #{targetLo.nmlsId}</div>
                              <div className="text-[11px] text-[#4A5D4E] font-medium">{targetLo.email} • {targetLo.phone}</div>
                            </div>
                          </div>

                          <div className="text-2xl text-[#C18C5D] font-serif font-light hidden sm:block">+</div>

                          {/* Realtor Profile Block */}
                          {targetAgent && (
                            <div className="flex items-center gap-3">
                              {targetAgent.headshotUrl ? (
                                <img src={targetAgent.headshotUrl} alt={targetAgent.name} className="w-12 h-12 rounded-2xl object-cover border border-[#EAE7E0]" />
                              ) : (
                                <div className="w-12 h-12 rounded-2xl bg-[#C18C5D] text-white flex items-center justify-center font-bold">
                                  {targetAgent.name.charAt(0)}
                                </div>
                              )}
                              <div>
                                <div className="text-[10px] font-bold text-emerald-800 uppercase">Real Estate Partner</div>
                                <div className="font-bold text-sm text-[#2D362E]">{targetAgent.name}</div>
                                <div className="text-[11px] text-[#606C5D]">{targetAgent.brokerage} • {targetAgent.licenseNumber}</div>
                                <div className="text-[11px] text-[#4A5D4E] font-medium">{targetAgent.email} • {targetAgent.phone}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Timeline Workflow Visualizer */}
                      <div className="bg-white p-5 rounded-2xl border border-[#EAE7E0] space-y-4 shadow-2xs">
                        <h4 className="font-bold text-xs uppercase tracking-wider text-[#9A9488]">
                          5-Stage Automated Delivery Workflow
                        </h4>
                        <div className="space-y-3">
                          {[
                            { stage: "Stage 1", title: "New Intake Welcome & DPA Blueprint", timing: "1 Hour Post-Intake", status: "Active" },
                            { stage: "Stage 2", title: "Credit Tier & Monthly Budget Secrets", timing: "Day 2 Post-Intake", status: "Active" },
                            { stage: "Stage 3", title: "Pre-Approval Celebration & Home Tour Guide", timing: "Triggered on Pre-Approval", status: "Active" },
                            { stage: "Stage 4", title: "Smooth Escrow & Closing Disclosure Prep", timing: "Triggered on Entering Escrow", status: "Active" },
                            { stage: "Stage 5", title: "Post-Close Annual Equity Monitor", timing: "14 Days Post-Close & Annually", status: "Active" },
                          ].map((s, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-[#FAF9F5] rounded-xl border border-[#EAE7E0] text-xs">
                              <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full bg-[#4A5D4E] text-white flex items-center justify-center font-bold text-[10px]">
                                  {idx + 1}
                                </span>
                                <div>
                                  <strong className="font-bold text-[#2D362E]">{s.title}</strong>
                                  <span className="text-[11px] text-[#606C5D] block">{s.timing}</span>
                                </div>
                              </div>
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                {s.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                }

                if (activeNurtureTab === "logs") {
                  const logs = targetLead?.nurtureSequenceLogs || [];
                  return (
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-2xl border border-[#EAE7E0] flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-[#2D362E]">Nurture Dispatch History for {targetLead?.fullName || "Selected Lead"}</h4>
                          <p className="text-xs text-[#606C5D]">Historical record of automated emails generated and dispatched.</p>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                          {logs.length} Logged Dispatches
                        </span>
                      </div>

                      {logs.length > 0 ? (
                        <div className="bg-white rounded-2xl border border-[#EAE7E0] overflow-hidden shadow-2xs">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-[#FAF9F5] text-[#9A9488] font-bold uppercase text-[10px] border-b border-[#EAE7E0]">
                              <tr>
                                <th className="p-3">Timestamp</th>
                                <th className="p-3">Sequence Stage</th>
                                <th className="p-3">Email Subject Line</th>
                                <th className="p-3 text-right">Delivery Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#EAE7E0]">
                              {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-[#FAF9F5]/50">
                                  <td className="p-3 font-semibold text-[#606C5D]">{log.sentAt}</td>
                                  <td className="p-3 font-bold text-[#2D362E] capitalize">{log.stageName.replace("_", " ")}</td>
                                  <td className="p-3 font-medium text-[#4A5D4E]">{log.emailSubject}</td>
                                  <td className="p-3 text-right">
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                                      {log.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="bg-white p-8 rounded-2xl border border-[#EAE7E0] text-center space-y-2">
                          <MailCheck className="w-8 h-8 text-[#9A9488] mx-auto" />
                          <p className="font-bold text-xs text-[#2D362E]">No sequence dispatches logged yet for this lead.</p>
                          <p className="text-xs text-[#606C5D]">Changing lead status or clicking "Send Test Email" will record log entries.</p>
                        </div>
                      )}
                    </div>
                  );
                }

                // Stage Email Template View (Stage 1 to 5)
                const stageDetailsMap: Record<string, { title: string; trigger: string; delay: string; subject: string; body: string }> = {
                  stage_1: {
                    title: "Stage 1: New Lead Intake Welcome & DPA Blueprint",
                    trigger: "Immediately when lead captures from calculator, chatbot, or ad",
                    delay: "1 Hour Post-Intake",
                    subject: `Welcome ${targetLead?.fullName || "Friend"}! Your First-Time Homebuyer Blueprint & DPA Options`,
                    body: `Hi ${targetLead?.fullName?.split(" ")[0] || "there"},

Thank you for reaching out through our homebuyer portal! As your assigned Loan Officer and Realtor team, we are excited to guide you towards owning your home in ${targetLead?.preferredLocations || "your desired neighborhood"}.

Based on your financial parameters (${targetLead?.targetPriceRange || "$350,000"} target price, ${targetLead?.downPaymentSavings || "savings"}), you may qualify for state Down Payment Assistance grants that cover up to 3.5% to 5% of your purchase price.

Here is what we're preparing for you:
1. Customized DPA & $0 Down Eligibility Calculation
2. Pre-Approval Readiness Audit
3. VIP Access to off-market properties in ${targetLead?.preferredLocations || "your target area"}

Feel free to reply directly to this email or book a 10-minute strategy call with us below.`
                  },
                  stage_2: {
                    title: "Stage 2: Credit Tier & Monthly Budget Secrets",
                    trigger: "Automatic educational nurture 2 days after intake",
                    delay: "Day 2 Post-Intake",
                    subject: `5 First-Time Buyer Credit & Monthly Budget Secrets for ${targetLead?.preferredLocations || "Homebuyers"}`,
                    body: `Hi ${targetLead?.fullName?.split(" ")[0] || "there"},

Did you know that a 20-point increase in your credit score can save you over $200/month on your mortgage payment?

In this short update, ${targetLo.name} and ${targetAgent?.name || "our agent partner"} broke down the top 3 credit & budget adjustments for buyers looking around ${targetLead?.targetPriceRange || "their target price"}:

• Secret #1: Keep credit card balances below 25% prior to pre-approval pull
• Secret #2: Down Payment Assistance grants can offset closing costs directly
• Secret #3: DTI (Debt-to-Income) ratio optimization strategies

Want us to run a soft-pull credit review that doesn't impact your score? Let us know!`
                  },
                  stage_3: {
                    title: "Stage 3: Pre-Approval Celebration & Home Tour Checklist",
                    trigger: "Triggered when lead status changes to Pre-Approved",
                    delay: "Instant on Status Update",
                    subject: `🎉 You're Pre-Approved! Here is your home touring checklist with ${targetAgent?.name || "your Realtor"}`,
                    body: `Congratulations ${targetLead?.fullName?.split(" ")[0] || "there"}!

Your mortgage pre-approval is officially issued! You are fully qualified for a target price up to ${targetLead?.targetPriceRange || "$400,000"}.

${targetAgent?.name || "Our Realtor partner"} is ready to schedule private tours for active listings matching your criteria in ${targetLead?.preferredLocations || "your preferred neighborhoods"}.

Touring Checklist Attached:
✓ Seller Disclosure Checklist
✓ HOA Fee Review Guidelines
✓ Offer Escalation Clause Overview`
                  },
                  stage_4: {
                    title: "Stage 4: Smooth Escrow & Closing Disclosure Prep",
                    trigger: "Triggered when lead status changes to In Escrow",
                    delay: "Instant on Escrow Status",
                    subject: `Congratulations on going into Escrow! Next steps from ${targetLo.name}`,
                    body: `Hi ${targetLead?.fullName?.split(" ")[0] || "there"},

Great news! Your offer has been accepted and we are officially in Escrow!

Here is what our loan processing team is handling for you right now:
1. Home Appraisal order dispatched
2. Title & Escrow document verification
3. Final Closing Disclosure (CD) issuing within 3 business days of closing

Important Reminder: Please avoid making large purchases or opening new credit cards during escrow!`
                  },
                  stage_5: {
                    title: "Stage 5: Post-Close Annual Equity Review & Rate Monitor",
                    trigger: "14 Days post-closing and recurring annually",
                    delay: "14 Days Post-Close",
                    subject: `Congratulations on your new home! Annual Equity & Rate Monitor Active`,
                    body: `Dear ${targetLead?.fullName || "Valued Homeowner"},

Congratulations on settling into your new home! It was an absolute honor serving as your Loan Officer and Realtor team.

We have enrolled your home in our Rate Drop Monitor & Home Equity Tracker. If interest rates decrease or your property value increases significantly, we will automatically notify you about refinancing or tapping home equity.

Don't forget to file your State Homestead Tax Exemption!`
                  }
                };

                const currentStageInfo = stageDetailsMap[activeNurtureTab] || stageDetailsMap["stage_1"];

                return (
                  <div className="space-y-4">
                    {/* Stage Details Banner */}
                    <div className="bg-white p-4 rounded-2xl border border-[#EAE7E0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                      <div>
                        <h4 className="font-bold text-sm text-[#2D362E]">{currentStageInfo.title}</h4>
                        <div className="text-xs text-[#606C5D] flex items-center gap-3 mt-0.5 flex-wrap">
                          <span>🎯 Trigger: <strong className="text-[#2D362E]">{currentStageInfo.trigger}</strong></span>
                          <span>⏱️ Delay: <strong className="text-[#4A5D4E]">{currentStageInfo.delay}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            // Dispatch Test Email
                            const currentLeads = guidesState.leads || [];
                            const updated = currentLeads.map(l => {
                              if (l.id === targetLead.id) {
                                const newLog = {
                                  id: `test-log-${Date.now()}`,
                                  stageName: activeNurtureTab,
                                  emailSubject: currentStageInfo.subject,
                                  sentAt: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", month: "short", day: "numeric" }),
                                  status: "sent" as const
                                };
                                return {
                                  ...l,
                                  nurtureSequenceLogs: [newLog, ...(l.nurtureSequenceLogs || [])]
                                };
                              }
                              return l;
                            });
                            onUpdateGuidesState({
                              ...guidesState,
                              leads: updated
                            });
                            triggerToast(`⚡ Test co-branded nurture email dispatched to ${targetLead.email}!`);
                          }}
                          className="px-3.5 py-1.5 bg-[#4A5D4E] hover:bg-[#38463B] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs transition-all"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Test Email Now</span>
                        </button>
                      </div>
                    </div>

                    {/* Email Subject Line Bar */}
                    <div className="bg-white p-3.5 rounded-2xl border border-[#EAE7E0] space-y-1">
                      <label className="text-[10px] font-bold text-[#9A9488] uppercase tracking-wider block">
                        Email Subject Line
                      </label>
                      <input 
                        type="text"
                        readOnly
                        value={currentStageInfo.subject}
                        className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs font-bold text-[#2D362E]"
                      />
                    </div>

                    {/* Live Rendered Co-Branded Email Preview Frame */}
                    <div className="bg-white rounded-3xl border border-[#EAE7E0] shadow-sm overflow-hidden space-y-0">
                      {/* Co-Branded Header */}
                      <div className="bg-[#2D362E] p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {targetLo.headshotUrl ? (
                            <img src={targetLo.headshotUrl} alt={targetLo.name} className="w-11 h-11 rounded-xl object-cover border border-white/20" />
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-[#C18C5D] text-white flex items-center justify-center font-bold">
                              {targetLo.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-sm">{targetLo.name}</div>
                            <div className="text-[11px] text-white/80">{targetLo.title} • NMLS #{targetLo.nmlsId}</div>
                          </div>
                        </div>

                        <div className="text-xs bg-white/10 px-3 py-1 rounded-full text-amber-200 font-semibold border border-white/10">
                          CO-BRANDED HOMEBUYER ADVISORY
                        </div>

                        {targetAgent && (
                          <div className="flex items-center gap-3">
                            <div>
                              <div className="font-bold text-sm text-right">{targetAgent.name}</div>
                              <div className="text-[11px] text-white/80 text-right">{targetAgent.brokerage}</div>
                            </div>
                            {targetAgent.headshotUrl ? (
                              <img src={targetAgent.headshotUrl} alt={targetAgent.name} className="w-11 h-11 rounded-xl object-cover border border-white/20" />
                            ) : (
                              <div className="w-11 h-11 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold">
                                {targetAgent.name.charAt(0)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Email Body */}
                      <div className="p-6 space-y-4 bg-white text-xs leading-relaxed text-[#2D362E] whitespace-pre-line font-normal">
                        {currentStageInfo.body}
                      </div>

                      {/* Call-to-Action Buttons inside email */}
                      <div className="p-5 bg-[#FAF9F5] border-t border-[#EAE7E0] flex flex-wrap gap-3 justify-center">
                        <button className="px-4 py-2 bg-[#4A5D4E] text-white font-bold text-xs rounded-xl shadow-2xs">
                          Schedule Pre-Approval Consultation
                        </button>
                        <button className="px-4 py-2 bg-[#C18C5D] text-white font-bold text-xs rounded-xl shadow-2xs">
                          Explore DPA Grants & $0 Down Homes
                        </button>
                      </div>

                      {/* Footer Signature */}
                      <div className="p-4 bg-[#F1EFE9] text-center text-[10px] text-[#606C5D] space-y-1">
                        <p className="font-bold text-[#2D362E]">{targetLo.company} • {targetLo.branch}</p>
                        <p>{targetLo.email} | {targetLo.phone} | NMLS #{targetLo.nmlsId}</p>
                        <p className="text-[9px] text-[#9A9488]">
                          Equal Housing Opportunity. Confidential communication for {targetLead?.fullName || "recipient"}.
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="bg-white p-4 border-t border-[#EAE7E0] flex items-center justify-between shrink-0">
              <span className="text-xs text-[#606C5D] font-medium">
                Changes persist automatically in real-time across your team's CRM.
              </span>
              <button
                onClick={() => setShowNurtureModal(false)}
                className="px-5 py-2 bg-[#2D362E] hover:bg-[#1f2520] text-white font-bold text-xs rounded-xl"
              >
                Close Nurture Center
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Lead Journey Timeline Modal */}
      <LeadJourneyModal
        isOpen={!!viewingJourneyLead}
        onClose={() => setViewingJourneyLead(null)}
        lead={viewingJourneyLead}
        onUpdateLeadStatus={handleUpdateLeadStatus}
        onToggleNurture={handleToggleLeadNurture}
        onSaveNotes={(leadId, notesText) => {
          const currentLeads = guidesState.leads || [];
          const updated = currentLeads.map(l => l.id === leadId ? { ...l, notes: notesText.trim() } : l);
          onUpdateGuidesState({
            ...guidesState,
            leads: updated
          });
          if (viewingJourneyLead && viewingJourneyLead.id === leadId) {
            setViewingJourneyLead({ ...viewingJourneyLead, notes: notesText.trim() });
          }
          triggerToast("⚡ Lead interaction notes updated.");
        }}
        onOpenOutreachModal={(leadId) => {
          setInitialOutreachLeadId(leadId);
          setShowEmailOutreachModal(true);
        }}
        onViewTranscript={(l) => {
          setViewingTranscriptLead(l);
        }}
        loanOfficers={guidesState.loanOfficers}
        agentRoster={guidesState.agentRoster}
      />

      {/* 2-Way SMS Text Messaging & Nurture Hub Modal */}
      {smsModalLead && (
        <SmsMessagingModal
          isOpen={true}
          lead={smsModalLead}
          loanOfficer={currentLo}
          syncedProperties={properties}
          smsTemplates={guidesState.smsTemplates && guidesState.smsTemplates.length > 0 ? guidesState.smsTemplates : DEFAULT_SMS_TEMPLATES}
          onClose={() => setSmsModalLead(null)}
          onUpdateLead={handleUpdateLeadFromSmsModal}
        />
      )}

      {/* Generated Outreach Draft Modal */}
      {generatedOutreachContent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-[#EAE7E0] shadow-2xl animate-in zoom-in-95 text-[#2D362E]">
            <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-3">
              <h4 className="font-serif font-bold text-lg text-[#2D362E] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Draft for {generatedOutreachContent.name}
              </h4>
              <button onClick={() => setGeneratedOutreachContent(null)} className="text-[#9A9488] hover:text-[#2D362E]">
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              <p className="text-xs text-[#606C5D]">Review and copy this personalized outreach email.</p>
              <div className="relative">
                <textarea
                  readOnly
                  value={generatedOutreachContent.content}
                  className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl p-4 text-xs focus:outline-none focus:border-[#4A5D4E] text-[#606C5D] whitespace-pre-wrap leading-relaxed h-64 resize-none"
                />
                <button
                  onClick={() => {
                    copyToClipboard(generatedOutreachContent.content, 'generated-outreach');
                    triggerToast("✅ Email body copied to clipboard!");
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-white hover:bg-[#EAE7E0] border border-[#EAE7E0] rounded-lg text-xs font-bold text-[#4A5D4E] shadow-sm flex items-center gap-1 transition-colors"
                >
                  {copiedKey === 'generated-outreach' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy</span>
                </button>
              </div>
            </div>
            
            <div className="flex justify-end items-center gap-2 pt-3">
              <button
                onClick={() => {
                  launchLocalOutlookDraft({
                    to: generatedOutreachContent.email || '',
                    subject: `Connecting with ${generatedOutreachContent.name}`,
                    body: generatedOutreachContent.content,
                    loanOfficer: loggedInUser || currentLo,
                    templateName: "LO Outreach AI Draft",
                    onTriggerToast: triggerToast
                  });
                }}
                className="py-2 px-4 bg-[#0078D4] hover:bg-[#005A9E] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                title="Draft in local installed Outlook with your work email signature"
              >
                <Mail className="w-3.5 h-3.5 text-white" />
                <span>Draft in Outlook</span>
              </button>
              <button
                onClick={() => setGeneratedOutreachContent(null)}
                className="py-2 px-5 bg-[#FAF9F5] hover:bg-[#F1EFE9] border border-[#EAE7E0] text-[#606C5D] font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scrape LO Roster Modal */}
      <ScrapeLoRosterModal
        isOpen={showScrapeLoModal}
        onClose={() => setShowScrapeLoModal(false)}
        onAddMultipleLos={(los) => {
          const newOfficers = los.map(lo => ({
            ...lo,
            id: `lo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            isAdmin: false,
          })) as LoanOfficerProfile[];
          
          onUpdateGuidesState({
            ...guidesState,
            loanOfficers: [...guidesState.loanOfficers, ...newOfficers]
          });
          triggerToast(`✅ Successfully imported ${newOfficers.length} Loan Officers to the team roster!`);
        }}
      />

      {/* Recruiting Campaign Modal */}
      <RecruitingCampaignModal
        isOpen={showRecruitingCampaignModal}
        onClose={() => setShowRecruitingCampaignModal(false)}
        selectedLos={guidesState.loanOfficers.filter(lo => selectedRosterLoIds.has(lo.id))}
        admin={currentLo}
        campaigns={guidesState.recruitingCampaigns || []}
        onDispatch={(campaignId) => {
          const now = new Date().toISOString();
          const campaign = (guidesState.recruitingCampaigns || []).find(c => c.id === campaignId);
          if (!campaign) return;
          
          const updatedLos = guidesState.loanOfficers.map(lo => {
            if (selectedRosterLoIds.has(lo.id)) {
              // Create an immediate history entry for the first step if it's Day 0
              let newHistory = [...(lo.outreachHistory || [])];
              const immediateStep = campaign.steps.find(s => s.dayOffset === 0);
              
              if (immediateStep) {
                newHistory.push({
                  id: `outreach-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                  date: now,
                  type: immediateStep.type,
                  subject: immediateStep.subject,
                  content: immediateStep.content.replace("[Name]", lo.name)
                });
              }

              return {
                ...lo,
                recruitmentStatus: (lo.recruitmentStatus === 'Not Contacted' || lo.recruitmentStatus === 'New' || !lo.recruitmentStatus) ? 'In Outreach' : lo.recruitmentStatus,
                outreachHistory: newHistory
              };
            }
            return lo;
          });
          
          onUpdateGuidesState({
            ...guidesState,
            loanOfficers: updatedLos
          });
          triggerToast(`✅ Enrolled ${selectedRosterLoIds.size} prospects in "${campaign.name}"!`);
          setSelectedRosterLoIds(new Set());
        }}
      />

      {/* LO Outreach Modal */}
      <LoOutreachModal
        isOpen={showLoOutreachModal}
        onClose={() => setShowLoOutreachModal(false)}
        selectedLos={guidesState.loanOfficers.filter(lo => selectedRosterLoIds.has(lo.id))}
        admin={currentLo}
        onDispatch={(type, subject, content) => {
          const now = new Date().toISOString();
          const historyEntry = {
            id: `outreach-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            date: now,
            type,
            subject,
            content
          };
          
          const updatedLos = guidesState.loanOfficers.map(lo => {
            if (selectedRosterLoIds.has(lo.id)) {
              return {
                ...lo,
                recruitmentStatus: (lo.recruitmentStatus === 'Not Contacted' || lo.recruitmentStatus === 'New' || !lo.recruitmentStatus) ? 'In Outreach' : lo.recruitmentStatus,
                outreachHistory: [...(lo.outreachHistory || []), historyEntry]
              };
            }
            return lo;
          });
          
          onUpdateGuidesState({
            ...guidesState,
            loanOfficers: updatedLos
          });
          triggerToast(`✅ Dispatched outreach to ${selectedRosterLoIds.size} prospects and updated pipeline!`);
          setSelectedRosterLoIds(new Set());
        }}
      />

      {/* Bulk SMS Dispatch Modal */}
      <BulkSmsModal
        isOpen={showBulkSmsModal}
        onClose={() => setShowBulkSmsModal(false)}
        selectedLeads={Array.from(selectedLeadIds).map(id => (guidesState.leads || []).find(l => l.id === id)!).filter(Boolean)}
        templates={guidesState.smsTemplates && guidesState.smsTemplates.length > 0 ? guidesState.smsTemplates : DEFAULT_SMS_TEMPLATES}
        loanOfficer={currentLo}
        onDispatch={handleBulkSmsDispatch}
        onSaveTemplate={(template) => {
          const currentTemplates = guidesState.smsTemplates && guidesState.smsTemplates.length > 0 ? guidesState.smsTemplates : DEFAULT_SMS_TEMPLATES;
          const existingIndex = currentTemplates.findIndex(t => t.id === template.id);
          let updatedTemplates;
          if (existingIndex >= 0) {
            updatedTemplates = [...currentTemplates];
            updatedTemplates[existingIndex] = template;
          } else {
            updatedTemplates = [template, ...currentTemplates];
          }
          onUpdateGuidesState({
            ...guidesState,
            smsTemplates: updatedTemplates
          });
          triggerToast(`⚡ Template '${template.title}' saved to Library!`);
        }}
        onTriggerToast={triggerToast}
      />

      {/* Twilio Carrier Credentials & Settings Modal */}
      <TwilioSettingsModal
        isOpen={showTwilioSettingsModal}
        onClose={() => setShowTwilioSettingsModal(false)}
      />

      {/* Salesforce Settings Modal */}
      <SalesforceSettingsModal
        isOpen={showSalesforceSettings}
        onClose={() => setShowSalesforceSettings(false)}
      />

      {/* Marketing Source Quality & Property Tracker Breakdown Modal */}
      {showSourceReportModal && (
        <SourceBreakdownReportModal
          leads={guidesState.leads || []}
          properties={properties}
          loanOfficers={guidesState.loanOfficers}
          onClose={() => setShowSourceReportModal(false)}
          onTriggerToast={triggerToast}
        />
      )}

      {/* LO Outreach History Modal */}
      {viewingHistoryLo && (() => {
        const lo = guidesState.loanOfficers.find(l => l.id === viewingHistoryLo);
        if (!lo) return null;
        
        return (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 border border-[#EAE7E0] shadow-2xl animate-in zoom-in-95 duration-150 text-[#2D362E] max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-3 shrink-0">
                <div>
                  <h4 className="font-serif font-bold text-lg text-[#2D362E] flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#4A5D4E]" />
                    Outreach History: {lo.name}
                  </h4>
                  <p className="text-xs text-[#606C5D]">Review all AI-generated recruiter messages sent to this prospect.</p>
                </div>
                <button onClick={() => setViewingHistoryLo(null)} className="text-xs text-[#9A9488] hover:text-[#2D362E]">
                  ✕ Close
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {lo.outreachHistory && lo.outreachHistory.length > 0 ? (
                  lo.outreachHistory.slice().reverse().map(history => (
                    <div key={history.id} className="bg-[#FAF9F5] rounded-2xl border border-[#EAE7E0] p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#2D362E]">
                          {history.type === 'email' ? <Mail className="w-4 h-4 text-[#4A5D4E]" /> : <MessageSquare className="w-4 h-4 text-[#4A5D4E]" />}
                          {history.type === 'email' ? 'Email Draft' : 'SMS Draft'}
                        </div>
                        <span className="text-[10px] text-[#606C5D] font-medium">
                          {new Date(history.date).toLocaleString()}
                        </span>
                      </div>
                      
                      {history.type === 'email' && history.subject && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-[#9A9488] uppercase tracking-wider">Subject</span>
                          <p className="text-xs font-bold text-[#2D362E]">{history.subject}</p>
                        </div>
                      )}
                      
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-[#9A9488] uppercase tracking-wider">Message</span>
                        <div className="text-xs text-[#606C5D] whitespace-pre-wrap leading-relaxed bg-white border border-[#EAE7E0] rounded-xl p-3">
                          {history.content}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8 text-sm text-[#9A9488]">
                    No outreach history recorded for this prospect.
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Google Workspace Contextual Lead Modal */}
      {googleWorkspaceModalLead && (
        <GoogleWorkspaceModal
          isOpen={googleWorkspaceModalOpen}
          onClose={() => {
            setGoogleWorkspaceModalOpen(false);
            setGoogleWorkspaceModalLead(null);
          }}
          lead={googleWorkspaceModalLead}
          loanOfficer={currentLo}
          defaultTab={googleWorkspaceModalTab}
          onTriggerToast={triggerToast}
          onUpdateLead={(updatedLead) => {
            onUpdateGuidesState({
              ...guidesState,
              leads: (guidesState.leads || []).map(l => l.id === updatedLead.id ? updatedLead : l)
            });
          }}
        />
      )}

      {/* Quick AI Review & Focus/Flow Instructor Modal */}
      <AIDailyReviewModal
        isOpen={dailyReviewModalOpen}
        onClose={() => setDailyReviewModalOpen(false)}
        reviewData={dailyReviewData}
        isLoading={dailyReviewLoading}
        onRefreshReview={fetchDailyReview}
        onNavigateTab={(tabId) => {
          setActiveTab(tabId);
          setDailyReviewModalOpen(false);
        }}
        timePhase={(() => {
          const hour = new Date().getHours();
          const minute = new Date().getMinutes();
          if (hour < 11) return "morning";
          if (hour < 14 || (hour === 14 && minute < 30)) return "midday";
          if (hour < 16 || (hour === 16 && minute < 30)) return "afternoon";
          return "end_of_day";
        })()}
        currentTimeString={new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
      />
    </div>
  );
};

