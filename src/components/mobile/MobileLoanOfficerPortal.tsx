import React, { useState, useMemo } from "react";
import {
  Phone,
  Mail,
  MessageSquare,
  ExternalLink,
  LogOut,
  CheckCircle2,
  Sparkles,
  Building2,
  Users,
  Calculator,
  Check,
  Award,
  Settings,
  ShieldCheck,
  X,
  Search,
  Flame
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { HeadshotAvatar } from "../HeadshotAvatar";
import { PWAInstallButton } from "../PWAInstallButton";
import { 
  ProfessionalGuidesState, 
  CapturedLead, 
  PropertyListing,
  RbacRole,
  RealEstateAgentProfile 
} from "../../types";
import { formatUSD } from "../../utils/mortgageMath";
import { auth } from "../../firebase";
import { signOut } from "firebase/auth";
import { MasterRealtorCommandCenter } from "../MasterRealtorCommandCenter";
import { ScrapeRealtorModal } from "../ScrapeRealtorModal";

interface MobileLoanOfficerPortalProps {
  userRole?: RbacRole | "admin" | "lo" | string | null;
  guidesState: ProfessionalGuidesState;
  onUpdateGuidesState: (newState: ProfessionalGuidesState) => void;
  onClose: () => void;
  onViewPublicSite: () => void;
  onLogout?: () => void;
  properties?: PropertyListing[];
  setProperties?: React.Dispatch<React.SetStateAction<PropertyListing[]>>;
  onSwitchToDesktop?: () => void;
  initialTab?: string;
}

export const MobileLoanOfficerPortal: React.FC<MobileLoanOfficerPortalProps> = ({
  userRole,
  guidesState,
  onUpdateGuidesState,
  onClose,
  onViewPublicSite,
  onLogout,
  properties = [],
  onSwitchToDesktop,
  initialTab,
}) => {
  // Current logged in LO profile
  const currentLo = useMemo(() => {
    return guidesState.loanOfficer || guidesState.loanOfficers[0] || {
      id: "lo-mike-ford",
      name: "Mike Ford",
      title: "Senior Mortgage Loan Officer",
      nmls: "173855",
      phone: "(503) 890-7798",
      email: "mford@cfmtg.com",
      company: "Cornerstone First Mortgage, LLC",
      companyNmls: "173855",
      isAdmin: true,
      role: "Branch Manager",
      headshotUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256&h=256"
    };
  }, [guidesState.loanOfficer, guidesState.loanOfficers]);

  const isAdminUser = Boolean(
    currentLo.isAdmin || 
    userRole === "branch_manager" || 
    userRole === "admin" ||
    auth.currentUser?.email?.toLowerCase() === "fordmj@gmail.com" ||
    auth.currentUser?.email?.toLowerCase() === "mford@cfmtg.com"
  );

  // Active Mobile Tab
  const [mobileTab, setMobileTab] = useState<"leads" | "ai_rhythm" | "calculators" | "realtors" | "tools">(() => {
    if (initialTab) {
      if (
        initialTab === "master_realtor" ||
        initialTab === "realtors" ||
        initialTab === "realtor_cobranding" ||
        initialTab === "recruitment_pipeline" ||
        initialTab === "pairings" ||
        initialTab === "realtor_roster" ||
        initialTab === "ai_partner_campaign"
      ) {
        return "realtors";
      }
      if (["leads", "ai_rhythm", "calculators", "tools"].includes(initialTab)) {
        return initialTab as any;
      }
    }
    return "leads";
  });

  // Filter & Search states for Leads
  const [leadSearch, setLeadSearch] = useState("");
  const [leadFilter, setLeadFilter] = useState<"all" | "hot" | "new" | "pre_approved">("all");
  const [showAiDossierModal, setShowAiDossierModal] = useState<CapturedLead | null>(null);
  const [showScrapeRealtorModal, setShowScrapeRealtorModal] = useState<boolean>(false);

  // Quick Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Logout handler
  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("lo_portal_auth_id");
      localStorage.removeItem("lo_portal_auth_email");
      localStorage.removeItem("lo_portal_role");
      localStorage.setItem("lo_portal_logged_out", "true");
      sessionStorage.clear();
    }
    try {
      await signOut(auth);
    } catch (authErr) {
      console.warn("Mobile SignOut notice:", authErr);
    }
    if (onLogout) {
      onLogout();
    } else {
      onClose();
    }
  };

  // Leads list
  const leads = useMemo(() => guidesState.leads || [], [guidesState.leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        !leadSearch ||
        (lead.fullName || "").toLowerCase().includes(leadSearch.toLowerCase()) ||
        (lead.email || "").toLowerCase().includes(leadSearch.toLowerCase()) ||
        (lead.phone || "").includes(leadSearch) ||
        (lead.preferredLocations && lead.preferredLocations.toLowerCase().includes(leadSearch.toLowerCase()));

      if (!matchesSearch) return false;

      if (leadFilter === "hot") {
        return lead.intentScore === "hot" || lead.pipelineStatus === "Hot" || lead.grantInterest;
      }
      if (leadFilter === "new") {
        return lead.status === "new" || !lead.status;
      }
      if (leadFilter === "pre_approved") {
        return lead.status === "pre_approved" || lead.pipelineStatus === "Pre-Approved";
      }
      return true;
    });
  }, [leads, leadSearch, leadFilter]);

  // Update a lead's status
  const handleUpdateLeadStatus = (leadId: string, newStatus: string) => {
    const updated = leads.map((l) =>
      l.id === leadId ? { ...l, status: newStatus } : l
    );
    onUpdateGuidesState({
      ...guidesState,
      leads: updated,
    });
    showToast(`Lead status updated to ${newStatus}`);
  };

  // Daily Tasks Checklist
  const [dailyTasks, setDailyTasks] = useState([
    { id: "1", title: "Review 5 new inbound buyer leads from AI Chatbot", done: false },
    { id: "2", title: "Send 2-1 Buydown quote to Sarah Jenkins' buyer", done: true },
    { id: "3", title: "Run Oregon DPA Grant scan for Multnomah County", done: false },
    { id: "4", title: "Sync Google Calendar tours with prospective buyers", done: false },
    { id: "5", title: "Verify appraisal condition on active contract #4802", done: true },
  ]);

  const toggleDailyTask = (id: string) => {
    setDailyTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  // Calculators State
  const [calcType, setCalcType] = useState<"buydown" | "schedule_c" | "dpa">("buydown");
  const [homePrice, setHomePrice] = useState(485000);
  const [loanRate, setLoanRate] = useState(6.75);

  // Buydown calculations
  const loanAmount = homePrice * 0.95;
  const standardMonthlyPI = (loanAmount * (loanRate / 100 / 12) * Math.pow(1 + loanRate / 100 / 12, 360)) / (Math.pow(1 + loanRate / 100 / 12, 360) - 1);
  const year1Rate = loanRate - 2;
  const year1MonthlyPI = (loanAmount * (year1Rate / 100 / 12) * Math.pow(1 + year1Rate / 100 / 12, 360)) / (Math.pow(1 + year1Rate / 100 / 12, 360) - 1);
  const year2Rate = loanRate - 1;
  const year2MonthlyPI = (loanAmount * (year2Rate / 100 / 12) * Math.pow(1 + year2Rate / 100 / 12, 360)) / (Math.pow(1 + year2Rate / 100 / 12, 360) - 1);
  const buydownSavingsYear1 = (standardMonthlyPI - year1MonthlyPI) * 12;
  const buydownSavingsYear2 = (standardMonthlyPI - year2MonthlyPI) * 12;
  const totalSellerConcession = buydownSavingsYear1 + buydownSavingsYear2;

  // Schedule C State
  const [netProfit, setNetProfit] = useState(68000);
  const [depreciationAddBack, setDepreciationAddBack] = useState(14000);
  const qualifyingMonthlyIncome = (netProfit + depreciationAddBack) / 12;

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#2D362E] pb-28 select-none">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-4 right-4 z-50 bg-[#2D362E] text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-2.5 text-xs font-semibold"
          >
            <CheckCircle2 className="w-4 h-4 text-[#D4A373] shrink-0" />
            <span className="flex-1">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP PWA INSTALL BANNER */}
      <div className="p-3 bg-[#2D362E] text-white">
        <PWAInstallButton
          variant="banner"
          label="Install Loan Officer Hub"
          className="shadow-md"
        />
      </div>

      {/* COMPACT MOBILE HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EAE7E0] px-4 py-3 shadow-2xs">
        <div className="flex items-center justify-between gap-3">
          {/* LO Avatar & Info */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <HeadshotAvatar
                src={currentLo.headshotUrl}
                name={currentLo.name}
                className="w-10 h-10 rounded-2xl border border-[#EAE7E0] shadow-2xs"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-serif font-bold text-sm text-[#2D362E] truncate">
                  {currentLo.name}
                </h1>
                {isAdminUser && (
                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-[10px] text-[#606C5D] truncate">
                {currentLo.company} • NMLS #{currentLo.nmls}
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            <PWAInstallButton variant="header" label="Install" className="h-8 py-1 px-2.5 text-[11px]" />
            <button
              type="button"
              onClick={onViewPublicSite}
              className="p-2 rounded-xl bg-[#FAF9F5] border border-[#EAE7E0] hover:bg-[#F1EFE9] text-[#4A5D4E] transition-colors"
              title="Preview Live Homebuyer Site"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mode Switcher Banner (Optional Desktop Toggle) */}
        {onSwitchToDesktop && (
          <div className="mt-2.5 pt-2 border-t border-[#EAE7E0]/60 flex items-center justify-between text-[11px] text-[#606C5D]">
            <span className="flex items-center gap-1 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Touch-Optimized Mobile View
            </span>
            <button
              type="button"
              onClick={onSwitchToDesktop}
              className="font-bold text-[#4A5D4E] underline hover:text-[#2D362E]"
            >
              Switch to Desktop Layout
            </button>
          </div>
        )}
      </header>

      {/* QUICK STATS 4-CARD STRIP */}
      <div className="p-4 grid grid-cols-2 gap-2.5">
        <div 
          onClick={() => { setMobileTab("leads"); setLeadFilter("all"); }}
          className="bg-white rounded-2xl p-3 border border-[#EAE7E0] shadow-2xs cursor-pointer active:scale-98 transition-transform"
        >
          <div className="flex items-center justify-between text-[#606C5D] mb-1">
            <span className="text-[11px] font-bold">Total Leads</span>
            <Users className="w-3.5 h-3.5 text-[#4A5D4E]" />
          </div>
          <div className="text-xl font-bold font-serif text-[#2D362E]">{leads.length}</div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">24/7 AI Intake Active</div>
        </div>

        <div 
          onClick={() => { setMobileTab("leads"); setLeadFilter("hot"); }}
          className="bg-white rounded-2xl p-3 border border-amber-200 bg-amber-50/40 shadow-2xs cursor-pointer active:scale-98 transition-transform"
        >
          <div className="flex items-center justify-between text-amber-900 mb-1">
            <span className="text-[11px] font-bold">Hot Prospects</span>
            <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
          </div>
          <div className="text-xl font-bold font-serif text-amber-950">
            {leads.filter(l => l.intentScore === "hot" || l.pipelineStatus === "Hot" || l.grantInterest).length}
          </div>
          <div className="text-[10px] text-amber-800 font-semibold mt-0.5">High Intent Today</div>
        </div>

        <div 
          onClick={() => setMobileTab("ai_rhythm")}
          className="bg-white rounded-2xl p-3 border border-[#EAE7E0] shadow-2xs cursor-pointer active:scale-98 transition-transform"
        >
          <div className="flex items-center justify-between text-[#606C5D] mb-1">
            <span className="text-[11px] font-bold">Daily Rhythm</span>
            <Sparkles className="w-3.5 h-3.5 text-[#C18C5D]" />
          </div>
          <div className="text-xl font-bold font-serif text-[#2D362E]">
            {dailyTasks.filter(t => t.done).length}/{dailyTasks.length}
          </div>
          <div className="text-[10px] text-[#606C5D] font-semibold mt-0.5">Focus Targets</div>
        </div>

        <div 
          onClick={() => setMobileTab("realtors")}
          className="bg-white rounded-2xl p-3 border border-[#EAE7E0] shadow-2xs cursor-pointer active:scale-98 transition-transform"
        >
          <div className="flex items-center justify-between text-[#606C5D] mb-1">
            <span className="text-[11px] font-bold">Realtor Partners</span>
            <Building2 className="w-3.5 h-3.5 text-[#4A5D4E]" />
          </div>
          <div className="text-xl font-bold font-serif text-[#2D362E]">
            {guidesState.agentRoster?.length || 6}
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">Co-Branded Links</div>
        </div>
      </div>

      {/* TAB CONTENT AREAS */}
      <div className="px-4 space-y-4">
        {/* TAB 1: LEADS CRM */}
        {mobileTab === "leads" && (
          <div className="space-y-3.5 animate-in fade-in duration-150">
            {/* Search & Filter Header */}
            <div className="space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-[#9A9488] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search leads by name, email, or city..."
                  value={leadSearch}
                  onChange={(e) => setLeadSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#EAE7E0] rounded-2xl text-xs text-[#2D362E] focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/20 shadow-2xs"
                />
                {leadSearch && (
                  <button
                    onClick={() => setLeadSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#9A9488]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setLeadFilter("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                    leadFilter === "all"
                      ? "bg-[#2D362E] text-white"
                      : "bg-white text-[#606C5D] border border-[#EAE7E0]"
                  }`}
                >
                  All ({leads.length})
                </button>
                <button
                  onClick={() => setLeadFilter("hot")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 flex items-center gap-1 transition-all ${
                    leadFilter === "hot"
                      ? "bg-amber-600 text-white"
                      : "bg-white text-amber-800 border border-amber-200"
                  }`}
                >
                  <Flame className="w-3 h-3 fill-current" />
                  <span>Hot Leads</span>
                </button>
                <button
                  onClick={() => setLeadFilter("new")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                    leadFilter === "new"
                      ? "bg-[#4A5D4E] text-white"
                      : "bg-white text-[#606C5D] border border-[#EAE7E0]"
                  }`}
                >
                  New Inbound
                </button>
                <button
                  onClick={() => setLeadFilter("pre_approved")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                    leadFilter === "pre_approved"
                      ? "bg-emerald-700 text-white"
                      : "bg-white text-emerald-800 border border-emerald-200"
                  }`}
                >
                  Prequalified
                </button>
              </div>
            </div>

            {/* Leads List */}
            {filteredLeads.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-[#EAE7E0] space-y-2">
                <Users className="w-8 h-8 text-[#9A9488] mx-auto opacity-50" />
                <h4 className="font-bold text-sm text-[#2D362E]">No leads found</h4>
                <p className="text-xs text-[#606C5D]">Try clearing search filters or add a new buyer lead.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="bg-white rounded-3xl p-4 border border-[#EAE7E0] shadow-2xs space-y-3"
                  >
                    {/* Top Row: Name & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-sm text-[#2D362E]">
                            {lead.fullName || "Prospective Buyer"}
                          </h4>
                          {lead.intentScore === "hot" && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-0.5">
                              <Flame className="w-2.5 h-2.5 fill-amber-500" />
                              <span>HOT</span>
                            </span>
                          )}
                          {lead.grantInterest && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                              DPA Grants
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#606C5D] mt-0.5">
                          {lead.preferredLocations || "Target Area: Oregon / Pacific NW"}
                        </p>
                      </div>

                      {/* Status Dropdown */}
                      <select
                        value={lead.status || "new"}
                        onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value)}
                        className="text-[10px] font-bold bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-2 py-1 text-[#2D362E] focus:outline-none cursor-pointer"
                      >
                        <option value="new">New Inbound</option>
                        <option value="contacted">Contacted</option>
                        <option value="in_review">In Review</option>
                        <option value="pre_approved">Prequalified</option>
                        <option value="closed">Closed / Funded</option>
                      </select>
                    </div>

                    {/* Financial Snapshot */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 bg-[#FAF9F5] rounded-2xl border border-[#EAE7E0]/70 text-center">
                      <div>
                        <div className="text-[9px] text-[#9A9488] font-bold uppercase tracking-wider">Target Price</div>
                        <div className="text-xs font-bold text-[#2D362E] mt-0.5">{lead.targetPriceRange || "$450k-$550k"}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-[#9A9488] font-bold uppercase tracking-wider">Down Pmt</div>
                        <div className="text-xs font-bold text-[#2D362E] mt-0.5">{lead.downPaymentSavings || "$25,000"}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-[#9A9488] font-bold uppercase tracking-wider">Credit Tier</div>
                        <div className="text-xs font-bold text-emerald-800 mt-0.5">{lead.creditScoreTier || "720+"}</div>
                      </div>
                    </div>

                    {/* Quick 1-Tap Action Targets */}
                    <div className="flex items-center gap-2 pt-1 border-t border-[#EAE7E0]/60">
                      {lead.phone && (
                        <a
                          href={`tel:${lead.phone}`}
                          className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 bg-[#4A5D4E] hover:bg-[#38463B] text-white rounded-xl text-xs font-bold transition-transform active:scale-95"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call</span>
                        </a>
                      )}
                      {lead.phone && (
                        <a
                          href={`sms:${lead.phone}?body=Hi ${encodeURIComponent((lead.fullName || "there").split(" ")[0])}, this is Mike Ford with Cornerstone First Mortgage. I received your homebuyer scenario and would love to help you review loan options and grants!`}
                          className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 bg-[#FAF9F5] border border-[#EAE7E0] hover:bg-[#F1EFE9] text-[#2D362E] rounded-xl text-xs font-bold transition-transform active:scale-95"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-[#4A5D4E]" />
                          <span>SMS</span>
                        </a>
                      )}
                      {lead.email && (
                        <a
                          href={`mailto:${lead.email}?subject=Your Homebuyer Financing Pre-Approval - Mike Ford, Cornerstone First Mortgage`}
                          className="flex-1 min-h-[44px] flex items-center justify-center gap-1.5 bg-[#FAF9F5] border border-[#EAE7E0] hover:bg-[#F1EFE9] text-[#2D362E] rounded-xl text-xs font-bold transition-transform active:scale-95"
                        >
                          <Mail className="w-3.5 h-3.5 text-[#4A5D4E]" />
                          <span>Email</span>
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowAiDossierModal(lead)}
                        className="min-h-[44px] px-3 flex items-center justify-center bg-gradient-to-r from-[#2D362E] to-[#4A5D4E] text-white rounded-xl text-xs font-bold transition-transform active:scale-95"
                        title="AI Strategy Dossier"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#E7C19D]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AI RHYTHM & BRIEFING */}
        {mobileTab === "ai_rhythm" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Executive Daily Briefing Card */}
            <div className="bg-gradient-to-br from-[#2D362E] via-[#38463B] to-[#4A5D4E] text-white rounded-3xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#E7C19D]" />
                  <span className="text-xs font-bold tracking-wide uppercase text-[#E7C19D]">
                    AI Executive Daily Briefing
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-mono">
                  Today
                </span>
              </div>
              <h3 className="text-base font-serif font-bold text-white">
                Morning Mortgage Rhythm for Mike Ford
              </h3>
              <p className="text-xs text-[#EAE7E0] leading-relaxed">
                You have {leads.length} active consumer inquiries in Multnomah and Washington counties. Current conventional 30-year fixed is trending at 6.625%–6.75%. Top recommendation: Reach out to hot leads with the 2-1 temporary buydown scenario to ease monthly payment anxiety.
              </p>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-[#DEDAD2]">
                <span>Pipeline Volume: $2.4M</span>
                <span className="text-emerald-300 font-bold">100% Rate Lock Protection</span>
              </div>
            </div>

            {/* Daily Targets Checklist */}
            <div className="bg-white rounded-3xl p-5 border border-[#EAE7E0] shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-sm text-[#2D362E]">
                  Daily High-Impact Targets
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                  {dailyTasks.filter(t => t.done).length} of {dailyTasks.length} Done
                </span>
              </div>

              <div className="space-y-2">
                {dailyTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => toggleDailyTask(task.id)}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF9F5] border border-[#EAE7E0] cursor-pointer active:scale-98 transition-all"
                  >
                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 ${
                      task.done
                        ? "bg-emerald-700 border-emerald-700 text-white"
                        : "border-[#C4BEB5] bg-white"
                    }`}>
                      {task.done && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className={`text-xs font-medium ${
                      task.done ? "line-through text-[#9A9488]" : "text-[#2D362E]"
                    }`}>
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CALCULATORS */}
        {mobileTab === "calculators" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Calculator Sub-tab Selector */}
            <div className="grid grid-cols-3 gap-1 bg-[#FAF9F5] p-1 rounded-2xl border border-[#EAE7E0]">
              <button
                onClick={() => setCalcType("buydown")}
                className={`py-2 text-[11px] font-bold rounded-xl transition-all ${
                  calcType === "buydown"
                    ? "bg-[#2D362E] text-white shadow-2xs"
                    : "text-[#606C5D]"
                }`}
              >
                2-1 Buydown
              </button>
              <button
                onClick={() => setCalcType("schedule_c")}
                className={`py-2 text-[11px] font-bold rounded-xl transition-all ${
                  calcType === "schedule_c"
                    ? "bg-[#2D362E] text-white shadow-2xs"
                    : "text-[#606C5D]"
                }`}
              >
                Schedule C
              </button>
              <button
                onClick={() => setCalcType("dpa")}
                className={`py-2 text-[11px] font-bold rounded-xl transition-all ${
                  calcType === "dpa"
                    ? "bg-[#2D362E] text-white shadow-2xs"
                    : "text-[#606C5D]"
                }`}
              >
                DPA Grants
              </button>
            </div>

            {/* 2-1 Buydown Calculator */}
            {calcType === "buydown" && (
              <div className="bg-white rounded-3xl p-5 border border-[#EAE7E0] shadow-2xs space-y-4">
                <div>
                  <h4 className="font-serif font-bold text-base text-[#2D362E]">
                    2-1 Seller Concession Buydown
                  </h4>
                  <p className="text-xs text-[#606C5D] mt-0.5">
                    Calculate monthly borrower payment relief funded by seller credits.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-[#2D362E] mb-1">
                      <span>Home Purchase Price</span>
                      <span>{formatUSD(homePrice)}</span>
                    </div>
                    <input
                      type="range"
                      min={250000}
                      max={950000}
                      step={5000}
                      value={homePrice}
                      onChange={(e) => setHomePrice(Number(e.target.value))}
                      className="w-full accent-[#4A5D4E]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-[#2D362E] mb-1">
                      <span>Note Rate (Standard)</span>
                      <span>{loanRate.toFixed(3)}%</span>
                    </div>
                    <input
                      type="range"
                      min={5.0}
                      max={8.5}
                      step={0.125}
                      value={loanRate}
                      onChange={(e) => setLoanRate(Number(e.target.value))}
                      className="w-full accent-[#4A5D4E]"
                    />
                  </div>
                </div>

                {/* Buydown Output Cards */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#EAE7E0]">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center">
                    <span className="text-[10px] font-bold text-emerald-900 uppercase">Year 1 (-2.0%)</span>
                    <div className="text-base font-bold text-emerald-950 mt-0.5">{formatUSD(year1MonthlyPI)}/mo</div>
                    <span className="text-[9px] text-emerald-700">Save {formatUSD(standardMonthlyPI - year1MonthlyPI)}/mo</span>
                  </div>

                  <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-3 text-center">
                    <span className="text-[10px] font-bold text-emerald-900 uppercase">Year 2 (-1.0%)</span>
                    <div className="text-base font-bold text-emerald-950 mt-0.5">{formatUSD(year2MonthlyPI)}/mo</div>
                    <span className="text-[9px] text-emerald-700">Save {formatUSD(standardMonthlyPI - year2MonthlyPI)}/mo</span>
                  </div>
                </div>

                <div className="p-3 bg-[#2D362E] text-white rounded-2xl flex items-center justify-between">
                  <span className="text-xs font-semibold">Total Seller Concession Needed:</span>
                  <span className="text-sm font-bold text-[#E7C19D]">{formatUSD(totalSellerConcession)}</span>
                </div>
              </div>
            )}

            {/* Schedule C Calculator */}
            {calcType === "schedule_c" && (
              <div className="bg-white rounded-3xl p-5 border border-[#EAE7E0] shadow-2xs space-y-4">
                <div>
                  <h4 className="font-serif font-bold text-base text-[#2D362E]">
                    Schedule C (Form 1084) Analyzer
                  </h4>
                  <p className="text-xs text-[#606C5D] mt-0.5">
                    Self-employed borrower net income with depreciation add-back.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-[#2D362E] block mb-1">
                      Line 31: Net Profit / Loss
                    </label>
                    <input
                      type="number"
                      value={netProfit}
                      onChange={(e) => setNetProfit(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl text-xs font-bold text-[#2D362E]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#2D362E] block mb-1">
                      Line 13: Depreciation Add-Back
                    </label>
                    <input
                      type="number"
                      value={depreciationAddBack}
                      onChange={(e) => setDepreciationAddBack(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl text-xs font-bold text-[#2D362E]"
                    />
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-1">
                  <span className="text-[10px] font-bold text-emerald-900 uppercase">Qualifying Monthly Income</span>
                  <div className="text-2xl font-bold font-serif text-emerald-950">
                    {formatUSD(qualifyingMonthlyIncome)}/mo
                  </div>
                  <p className="text-[10px] text-emerald-700">Annual Equivalent: {formatUSD(qualifyingMonthlyIncome * 12)}</p>
                </div>
              </div>
            )}

            {/* DPA Grants Intelligence */}
            {calcType === "dpa" && (
              <div className="bg-white rounded-3xl p-5 border border-[#EAE7E0] shadow-2xs space-y-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <h4 className="font-serif font-bold text-base text-[#2D362E]">
                    Oregon & PNW Grant Programs
                  </h4>
                </div>
                <div className="space-y-2.5 text-xs text-[#606C5D]">
                  <div className="p-3 bg-[#FAF9F5] rounded-2xl border border-[#EAE7E0] space-y-1">
                    <div className="font-bold text-[#2D362E] flex items-center justify-between">
                      <span>OHCS Down Payment Assistance</span>
                      <span className="text-emerald-700 font-bold">Up to $15,000</span>
                    </div>
                    <p className="text-[11px]">Forgivable grant after 3 years for first-time buyers in Oregon.</p>
                  </div>
                  <div className="p-3 bg-[#FAF9F5] rounded-2xl border border-[#EAE7E0] space-y-1">
                    <div className="font-bold text-[#2D362E] flex items-center justify-between">
                      <span>Portland Housing Bureau (PHB) DPA</span>
                      <span className="text-emerald-700 font-bold">Up to $100,000</span>
                    </div>
                    <p className="text-[11px]">Second mortgage with 0% interest for buyers below 100% AMI.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: REALTORS & CO-BRANDING / MASTER REALTOR COMMAND CENTER */}
        {mobileTab === "realtors" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <MasterRealtorCommandCenter
              guidesState={guidesState}
              onUpdateGuidesState={onUpdateGuidesState}
              currentLo={currentLo}
              leads={guidesState.leads || []}
              properties={properties}
              userRole={userRole}
              onTriggerToast={showToast}
              initialSubTab="roster"
              onOpenScrapeModal={() => setShowScrapeRealtorModal(true)}
            />
          </div>
        )}

        {/* TAB 5: TOOLS & INTEGRATIONS */}
        {mobileTab === "tools" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Google Workspace */}
            <div className="bg-white rounded-3xl p-5 border border-[#EAE7E0] shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <h4 className="font-bold text-sm text-[#2D362E]">Google Workspace Sync</h4>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
                  Ready
                </span>
              </div>
              <p className="text-xs text-[#606C5D]">
                Integrated with Gmail, Google Calendar tours, Sheets buyer exports, and Google Drive document vault.
              </p>
            </div>

            {/* PWA Phone Installation Settings */}
            <div className="bg-white rounded-3xl p-5 border border-[#EAE7E0] shadow-2xs space-y-3">
              <h4 className="font-bold text-sm text-[#2D362E]">Mobile App Installation</h4>
              <p className="text-xs text-[#606C5D]">
                Add the Loan Officer Hub to your iPhone or Android home screen for instant full-screen app access.
              </p>
              <PWAInstallButton variant="default" label="Install App Now" className="w-full justify-center" />
            </div>

            {/* Branch Management & Security */}
            <div className="bg-white rounded-3xl p-5 border border-[#EAE7E0] shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#4A5D4E]" />
                <h4 className="font-bold text-sm text-[#2D362E]">Security & Whitelist</h4>
              </div>
              <p className="text-xs text-[#606C5D]">
                Private credentialed environment restricted to authorized Cornerstone First Mortgage originators.
              </p>
              <button
                onClick={handleLogout}
                className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl border border-red-200 transition-colors cursor-pointer"
              >
                Log Out of Loan Officer Hub
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FIXED MOBILE BOTTOM NAVIGATION BAR FOR LOAN OFFICER */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#EAE7E0] px-2 py-2 flex items-center justify-around shadow-[0_-4px_10px_rgba(0,0,0,0.04)] pb-[env(safe-area-inset-bottom)]">
        <button
          onClick={() => setMobileTab("leads")}
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all active:scale-95 cursor-pointer ${
            mobileTab === "leads" ? "text-[#4A5D4E]" : "text-[#9A9488]"
          }`}
        >
          <Users className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold">Leads ({leads.length})</span>
        </button>

        <button
          onClick={() => setMobileTab("ai_rhythm")}
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all active:scale-95 cursor-pointer ${
            mobileTab === "ai_rhythm" ? "text-[#4A5D4E]" : "text-[#9A9488]"
          }`}
        >
          <Sparkles className="w-5 h-5 mb-1 text-[#C18C5D]" />
          <span className="text-[10px] font-bold">AI Briefing</span>
        </button>

        <button
          onClick={() => setMobileTab("calculators")}
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all active:scale-95 cursor-pointer ${
            mobileTab === "calculators" ? "text-[#4A5D4E]" : "text-[#9A9488]"
          }`}
        >
          <Calculator className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold">Calculators</span>
        </button>

        <button
          onClick={() => setMobileTab("realtors")}
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all active:scale-95 cursor-pointer ${
            mobileTab === "realtors" ? "text-[#4A5D4E]" : "text-[#9A9488]"
          }`}
        >
          <Building2 className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold">Realtors</span>
        </button>

        <button
          onClick={() => setMobileTab("tools")}
          className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all active:scale-95 cursor-pointer ${
            mobileTab === "tools" ? "text-[#4A5D4E]" : "text-[#9A9488]"
          }`}
        >
          <Settings className="w-5 h-5 mb-1" />
          <span className="text-[10px] font-bold">Tools</span>
        </button>
      </nav>

      {/* AI DOSSIER MODAL */}
      {showAiDossierModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowAiDossierModal(null)}
        >
          <div
            className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C18C5D]">
                  Gemini AI Strategy Dossier
                </span>
                <h3 className="text-lg font-serif font-bold text-[#2D362E]">
                  {showAiDossierModal.fullName || "Buyer Dossier"}
                </h3>
              </div>
              <button
                onClick={() => setShowAiDossierModal(null)}
                className="p-1 rounded-full bg-[#FAF9F5] text-[#606C5D]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Next Best Action:</span>
              </div>
              <p>
                Buyer has {showAiDossierModal.downPaymentSavings || "$20,000"} saved with a budget of {showAiDossierModal.targetMonthlyBudget || "$2,800/mo"}. Highlight the Oregon OHCS grant or 2-1 temporary buydown to increase purchasing power.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#EAE7E0]">
                <span className="text-[#606C5D]">Phone</span>
                <span className="font-bold text-[#2D362E]">{showAiDossierModal.phone || "Not provided"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#EAE7E0]">
                <span className="text-[#606C5D]">Email</span>
                <span className="font-bold text-[#2D362E]">{showAiDossierModal.email || "Not provided"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#EAE7E0]">
                <span className="text-[#606C5D]">Target Timeline</span>
                <span className="font-bold text-[#2D362E]">{showAiDossierModal.timeline || "Within 60 days"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#EAE7E0]">
                <span className="text-[#606C5D]">Credit Score</span>
                <span className="font-bold text-[#2D362E]">{showAiDossierModal.creditScoreTier || "Good (680-719)"}</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={`tel:${showAiDossierModal.phone}`}
                className="w-full py-3 bg-[#4A5D4E] hover:bg-[#38463B] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call {showAiDossierModal.fullName || "Buyer"} Now</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Scrape Realtor Modal for Mobile */}
      <ScrapeRealtorModal
        isOpen={showScrapeRealtorModal}
        onClose={() => setShowScrapeRealtorModal(false)}
        onAddMultipleAgents={(agents) => {
          const newAgents: RealEstateAgentProfile[] = agents.map((a, idx) => {
            const agentId = `agent-scraped-mobile-${Date.now()}-${idx}`;
            const name = a.name || "Realtor Partner";
            const customSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
            return {
              id: agentId,
              name: name,
              title: a.title || "Buyer Specialist, REALTOR®",
              company: a.company || a.brokerage || undefined,
              brokerage: a.brokerage || a.company || undefined,
              licenseNumber: a.licenseNumber || undefined,
              email: a.email && a.email.includes("@") ? a.email : undefined,
              phone: a.phone && !a.phone.includes("555") ? a.phone : undefined,
              headshotUrl: a.headshotUrl && a.headshotUrl.startsWith("http") ? a.headshotUrl : undefined,
              websiteUrl: a.websiteUrl || a.sourceUrl || undefined,
              sourceUrl: a.sourceUrl || a.websiteUrl || undefined,
              deepScrapedFromUrl: !!a.deepScrapedFromUrl,
              rating: undefined,
              yearsExperience: a.yearsExperience != null ? Number(a.yearsExperience) : ((a as any).experienceYears != null ? Number((a as any).experienceYears) : undefined),
              experienceYears: (a as any).experienceYears != null ? Number((a as any).experienceYears) : (a.yearsExperience != null ? Number(a.yearsExperience) : undefined),
              production12MoVolume: a.production12MoVolume != null ? Number(a.production12MoVolume) : undefined,
              production12MoUnits: a.production12MoUnits != null ? Number(a.production12MoUnits) : undefined,
              buysideVolume12Mo: a.buysideVolume12Mo != null ? Number(a.buysideVolume12Mo) : undefined,
              buysideUnits12Mo: a.buysideUnits12Mo != null ? Number(a.buysideUnits12Mo) : undefined,
              buysideSharePct: a.buysideSharePct != null ? Number(a.buysideSharePct) : undefined,
              activeListingsCount: undefined,
              agentType: a.agentType || "buyer_agent",
              bio: a.bio || undefined,
              specialties: ["First-Time Homebuyers", "Buyer Representation"],
              marketAreas: (a as any).marketAreas || ["Portland Metro", "Willamette Valley", "Bend"],
              areasServed: ["Portland Metro", "Willamette Valley", "Bend"],
              customSlug: customSlug,
              assignedLoIds: [currentLo.id],
            } as RealEstateAgentProfile;
          });

          const newPairings = newAgents.map((ag, pIdx) => ({
            id: `pair-mobile-${Date.now()}-${pIdx}`,
            loId: currentLo.id,
            agentId: ag.id,
            title: `${currentLo.name} + ${ag.name}`,
            customSlug: `${currentLo.customSlug || "lo"}-and-${ag.customSlug}`,
            campaignTag: "realtor-partnership",
            createdAt: new Date().toISOString().split("T")[0],
            active: true,
            totalViews: 0,
            totalLeads: 0,
          }));

          onUpdateGuidesState({
            ...guidesState,
            agentRoster: [...guidesState.agentRoster, ...newAgents],
            pairings: [...guidesState.pairings, ...newPairings],
            activeAgentId: newAgents[0]?.id || guidesState.activeAgentId,
          });

          showToast(`✅ Successfully imported ${newAgents.length} Realtor agent partner(s) to your roster!`);
          setShowScrapeRealtorModal(false);
        }}
      />
    </div>
  );
};
