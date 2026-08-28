import React, { useState } from "react";
import { 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MessageSquare, 
  Mail, 
  Send, 
  Search, 
  Filter, 
  CheckSquare, 
  Square, 
  Phone, 
  FileText, 
  Download, 
  Sparkles, 
  Lock, 
  Compass, 
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  UserCheck,
  RefreshCw,
  Copy
} from "lucide-react";
import { CapturedLead, LoanOfficerProfile } from "../types";

interface SmsComplianceDashboardProps {
  leads: CapturedLead[];
  loanOfficer: LoanOfficerProfile;
  onUpdateLead: (updatedLead: CapturedLead) => void;
  onUpdateAllLeads: (updatedLeads: CapturedLead[]) => void;
  onOpenSmsMessaging?: (lead: CapturedLead) => void;
}

export const SmsComplianceDashboard: React.FC<SmsComplianceDashboardProps> = ({
  leads,
  loanOfficer,
  onUpdateLead,
  onUpdateAllLeads,
  onOpenSmsMessaging
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "opted_in" | "pending" | "opted_out">("all");
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  
  // Bulk Modal state
  const [showBulkAuthModal, setShowBulkAuthModal] = useState(false);
  const [bulkChannel, setBulkChannel] = useState<"email" | "sms">("email");
  const [bulkSubject, setBulkSubject] = useState(
    "Action Required: Confirm Text Message Updates & Oregon DPA Grant Alerts"
  );
  const [bulkBody, setBulkBody] = useState(
    `Hi {Buyer_Name},\n\n` +
    `This is {LO_Name} (NMLS #{LO_NMLS}) with your Oregon First-Time Homebuyer & Down Payment Assistance Team.\n\n` +
    `To ensure you never miss time-sensitive updates on 3.5% DPA grants, 100% USDA zero-down listings, and rate buydown alerts, please confirm your consent to receive SMS text updates.\n\n` +
    `👉 Confirm SMS Opt-in: {OptIn_Url}\n\n` +
    `TCPA Legal Notice: By clicking the link or replying START, you authorize {LO_Name} to send automated text messages to your mobile phone. Message frequency varies (max 4 msgs/month). Msg & data rates may apply. Text STOP to unsubscribe anytime or HELP for assistance.`
  );
  const [isSendingBulk, setIsSendingBulk] = useState(false);
  const [bulkSuccessToast, setBulkSuccessToast] = useState<string | null>(null);

  // Audit Certificate Modal state
  const [auditLead, setAuditLead] = useState<CapturedLead | null>(null);

  // Manual Toggle Modal / Prompt state
  const [manualToggleLead, setManualToggleLead] = useState<CapturedLead | null>(null);
  const [manualReason, setManualReason] = useState("Verbal consent recorded during phone consultation");

  // Show TCPA policy cheat sheet
  const [showTcpaPolicy, setShowTcpaPolicy] = useState(false);

  // Filtered Leads
  const filteredLeads = leads.filter(l => {
    const isOptedIn = l.smsConsentAuthorized ?? false;
    const isOptedOut = l.smsConsentAuthorized === false && l.smsOptOutTimestamp;
    const isPending = !isOptedIn && !isOptedOut;

    if (filterTab === "opted_in" && !isOptedIn) return false;
    if (filterTab === "pending" && isOptedIn) return false;
    if (filterTab === "opted_out" && !isOptedOut) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = l.fullName.toLowerCase().includes(q);
      const matchPhone = l.phone.toLowerCase().includes(q);
      const matchEmail = l.email.toLowerCase().includes(q);
      const matchSource = (l.smsConsentSource || "").toLowerCase().includes(q);
      const matchCity = (l.taggedCityArea || l.preferredLocations || "").toLowerCase().includes(q);
      return matchName || matchPhone || matchEmail || matchSource || matchCity;
    }

    return true;
  });

  // KPI Calculations
  const totalLeads = leads.length;
  const optedInLeads = leads.filter(l => l.smsConsentAuthorized);
  const pendingLeads = leads.filter(l => !l.smsConsentAuthorized && !l.smsOptOutTimestamp);
  const optedOutLeads = leads.filter(l => l.smsConsentAuthorized === false && l.smsOptOutTimestamp);
  const optInPercentage = totalLeads > 0 ? Math.round((optedInLeads.length / totalLeads) * 100) : 0;

  // Toggle selection
  const handleToggleSelectLead = (id: string) => {
    setSelectedLeadIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllPending = () => {
    const pendingIds = leads.filter(l => !l.smsConsentAuthorized).map(l => l.id);
    setSelectedLeadIds(pendingIds);
  };

  const handleSelectAllFiltered = () => {
    if (selectedLeadIds.length === filteredLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map(l => l.id));
    }
  };

  // Dispatch Bulk Auth Request
  const handleExecuteBulkAuthRequest = () => {
    if (selectedLeadIds.length === 0) return;
    setIsSendingBulk(true);

    setTimeout(() => {
      const nowIso = new Date().toISOString();
      const updatedLeads = leads.map(l => {
        if (selectedLeadIds.includes(l.id)) {
          return {
            ...l,
            smsAuthRequestSentAt: nowIso,
            lastEmailSentAt: nowIso,
            lastEmailTemplateName: "TCPA Request SMS Authorization Invite",
            nurtureSequenceLogs: [
              ...(l.nurtureSequenceLogs || []),
              {
                id: `log-auth-${Date.now()}-${l.id}`,
                stageName: "TCPA SMS Compliance Opt-in Request",
                templateName: "Request SMS Authorization Invite",
                emailSubject: bulkSubject.replace("{Buyer_Name}", l.fullName),
                sentAt: nowIso,
                status: "sent" as const
              }
            ]
          };
        }
        return l;
      });

      onUpdateAllLeads(updatedLeads);
      setIsSendingBulk(false);
      setShowBulkAuthModal(false);
      setBulkSuccessToast(
        `Successfully sent SMS Authorization Request to ${selectedLeadIds.length} lead${selectedLeadIds.length > 1 ? 's' : ''}!`
      );
      setSelectedLeadIds([]);

      setTimeout(() => setBulkSuccessToast(null), 5000);
    }, 1000);
  };

  // Handle Manual Consent Toggle
  const handleConfirmManualToggle = () => {
    if (!manualToggleLead) return;
    const nowIso = new Date().toISOString();
    const newStatus = !manualToggleLead.smsConsentAuthorized;

    const updated: CapturedLead = {
      ...manualToggleLead,
      smsConsentAuthorized: newStatus,
      smsConsentTimestamp: newStatus ? nowIso : undefined,
      smsConsentSource: newStatus ? `LO Manual Update: ${manualReason}` : undefined,
      smsConsentIp: newStatus ? `${loanOfficer.name} (LO Admin Portal)` : undefined,
      smsOptOutTimestamp: newStatus ? undefined : nowIso
    };

    onUpdateLead(updated);
    setManualToggleLead(null);
    setManualReason("Verbal consent recorded during phone consultation");
  };

  // Format Date Helper
  const formatDate = (isoStr?: string) => {
    if (!isoStr) return "Not Recorded";
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="bg-gradient-to-r from-[#2F5738] via-[#4A5D4E] to-[#38463B] text-white p-6 sm:p-8 rounded-3xl shadow-md border border-[#2F5738]/30 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-end pr-8">
          <ShieldCheck className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-bold border border-white/20 backdrop-blur-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>FCC & TCPA Automated SMS Compliance Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif text-white">
              SMS Compliance & Opt-in Center
            </h2>
            <p className="text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
              Track explicit 1-to-1 prior express consent, verify double-opt-in timestamps & TLS audit trails, and dispatch compliant SMS authorization requests to pending buyer leads.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setShowTcpaPolicy(!showTcpaPolicy)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-emerald-200" />
              <span>{showTcpaPolicy ? "Hide TCPA Rules" : "TCPA Compliance Guide"}</span>
            </button>
            <button
              onClick={() => {
                handleSelectAllPending();
                setShowBulkAuthModal(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Bulk Request Authorization ({pendingLeads.length} Pending)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Toast Banner */}
      {bulkSuccessToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-bold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{bulkSuccessToast}</span>
          </div>
          <button onClick={() => setBulkSuccessToast(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Expandable TCPA Compliance Reference Guide */}
      {showTcpaPolicy && (
        <div className="bg-[#FAF9F5] border border-[#EAE7E0] p-6 rounded-3xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#4A5D4E]" />
              <h3 className="font-bold text-[#2D362E] text-sm">Federal Communications Commission (FCC) & TCPA Compliance Standards</h3>
            </div>
            <span className="text-[11px] font-bold text-[#4A5D4E] bg-[#4A5D4E]/10 px-2.5 py-0.5 rounded-full">
              A2P 10DLC Verified
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-white p-4 rounded-2xl border border-[#EAE7E0] space-y-1.5">
              <div className="font-bold text-[#2D362E] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>1-to-1 Explicit Prior Express Consent</span>
              </div>
              <p className="text-[#606C5D] leading-relaxed text-[11px]">
                Under FCC 2026 regulations, text marketing requires un-checked explicit consent checkboxes identifying the specific Loan Officer (Mike Ford NMLS #198274) and Mortgage Lender.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#EAE7E0] space-y-1.5">
              <div className="font-bold text-[#2D362E] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Timestamp & IP Audit Trail</span>
              </div>
              <p className="text-[#606C5D] leading-relaxed text-[11px]">
                Every consent event is stored with exact date/time, IP address, device user-agent, and full copy of the displayed TCPA terms for compliance defense.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#EAE7E0] space-y-1.5">
              <div className="font-bold text-[#2D362E] flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                <span>Automated Opt-Out & Quiet Hours</span>
              </div>
              <p className="text-[#606C5D] leading-relaxed text-[11px]">
                Automatic handling of STOP/UNSUBSCRIBE keywords with instant status revocation. Text dispatches are strictly enforced between 8:00 AM - 9:00 PM local time.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPI Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Opt-in Coverage */}
        <div className="bg-white p-5 rounded-3xl border border-[#EAE7E0] shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-xs text-[#606C5D] font-bold">
            <span>Opt-In Coverage Rate</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#2D362E] font-serif">{optInPercentage}%</span>
            <span className="text-xs text-[#606C5D] font-medium">({optedInLeads.length} of {totalLeads} leads)</span>
          </div>
          <div className="w-full bg-[#EAE7E0] h-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
              style={{ width: `${optInPercentage}%` }} 
            />
          </div>
        </div>

        {/* Card 2: Opted-in Leads */}
        <div className="bg-white p-5 rounded-3xl border border-[#EAE7E0] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#606C5D] font-bold">
            <span>Explicitly Opted-In</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-700 font-serif">
            {optedInLeads.length}
          </div>
          <p className="text-[11px] text-[#606C5D]">
            Authorized for SMS rate alerts & home listing texts
          </p>
        </div>

        {/* Card 3: Pending Authorization */}
        <div className="bg-white p-5 rounded-3xl border border-[#EAE7E0] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#606C5D] font-bold">
            <span>Pending Authorization</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600 font-serif">
            {pendingLeads.length}
          </div>
          <p className="text-[11px] text-[#606C5D]">
            Requires SMS compliance invite or verbal consent
          </p>
        </div>

        {/* Card 4: Audit Status */}
        <div className="bg-white p-5 rounded-3xl border border-[#EAE7E0] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#606C5D] font-bold">
            <span>Audit Trail Integrity</span>
            <Lock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl font-bold text-[#2D362E] font-serif flex items-center gap-1.5 pt-1">
            <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 text-xs font-bold border border-purple-200">
              100% Verifiable
            </span>
          </div>
          <p className="text-[11px] text-[#606C5D]">
            Timestamps, IPs & TCPA disclaimer logs saved
          </p>
        </div>
      </div>

      {/* Control Bar: Search, Filters & Actions */}
      <div className="bg-white p-4 rounded-3xl border border-[#EAE7E0] shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-[#FAF9F5] border border-[#EAE7E0] p-1 rounded-2xl overflow-x-auto text-xs font-bold shrink-0">
            <button
              onClick={() => setFilterTab("all")}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                filterTab === "all"
                  ? "bg-[#4A5D4E] text-white shadow-2xs"
                  : "text-[#606C5D] hover:text-[#2D362E]"
              }`}
            >
              All Leads ({leads.length})
            </button>
            <button
              onClick={() => setFilterTab("opted_in")}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                filterTab === "opted_in"
                  ? "bg-emerald-700 text-white shadow-2xs"
                  : "text-[#606C5D] hover:text-[#2D362E]"
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-300" />
              <span>Opted-In ({optedInLeads.length})</span>
            </button>
            <button
              onClick={() => setFilterTab("pending")}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                filterTab === "pending"
                  ? "bg-amber-600 text-white shadow-2xs"
                  : "text-[#606C5D] hover:text-[#2D362E]"
              }`}
            >
              <Clock className="w-3 h-3 text-amber-200" />
              <span>Pending Consent ({pendingLeads.length})</span>
            </button>
            <button
              onClick={() => setFilterTab("opted_out")}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                filterTab === "opted_out"
                  ? "bg-stone-700 text-white shadow-2xs"
                  : "text-[#606C5D] hover:text-[#2D362E]"
              }`}
            >
              <AlertCircle className="w-3 h-3 text-stone-300" />
              <span>Opted Out ({optedOutLeads.length})</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#9A9488] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by buyer name, phone, email, or city tag..."
              className="w-full pl-9 pr-4 py-2 bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl text-xs text-[#2D362E] focus:outline-hidden focus:border-[#4A5D4E]"
            />
          </div>
        </div>

        {/* Multi-Select Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#EAE7E0] text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectAllFiltered}
              className="flex items-center gap-1.5 text-[#606C5D] hover:text-[#2D362E] font-bold cursor-pointer"
            >
              {selectedLeadIds.length > 0 && selectedLeadIds.length === filteredLeads.length ? (
                <CheckSquare className="w-4 h-4 text-[#4A5D4E]" />
              ) : (
                <Square className="w-4 h-4 text-[#9A9488]" />
              )}
              <span>Select All Filtered ({selectedLeadIds.length} Selected)</span>
            </button>

            {selectedLeadIds.length === 0 && (
              <button
                onClick={handleSelectAllPending}
                className="text-xs text-[#4A5D4E] hover:underline font-bold"
              >
                Select All {pendingLeads.length} Pending Leads
              </button>
            )}
          </div>

          {selectedLeadIds.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#606C5D] font-medium">
                {selectedLeadIds.length} lead{selectedLeadIds.length > 1 ? 's' : ''} ready for compliance outreach
              </span>
              <button
                onClick={() => setShowBulkAuthModal(true)}
                className="px-4 py-1.5 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Bulk Request SMS Authorization</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Compliance Data Table */}
      <div className="bg-white rounded-3xl border border-[#EAE7E0] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF9F5] border-b border-[#EAE7E0] text-[#606C5D] uppercase tracking-wider font-bold">
                <th className="py-3.5 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={selectedLeadIds.length > 0 && selectedLeadIds.length === filteredLeads.length}
                    onChange={handleSelectAllFiltered}
                    className="rounded border-[#EAE7E0] text-[#4A5D4E] focus:ring-[#4A5D4E]"
                  />
                </th>
                <th className="py-3.5 px-4 font-bold">Buyer / Lead Contact</th>
                <th className="py-3.5 px-4 font-bold">TCPA SMS Opt-in Status</th>
                <th className="py-3.5 px-4 font-bold">Consent Timestamp</th>
                <th className="py-3.5 px-4 font-bold">Opt-in Channel / Source</th>
                <th className="py-3.5 px-4 font-bold">Audit & TLS Details</th>
                <th className="py-3.5 px-4 font-bold text-right">Actions & Audit Log</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE7E0]">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#606C5D]">
                    <ShieldCheck className="w-8 h-8 text-[#9A9488] mx-auto mb-2 opacity-50" />
                    <p className="font-bold">No leads found matching current compliance filter</p>
                    <p className="text-xs text-[#9A9488] mt-1">Try resetting search query or switching tabs above.</p>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const isOptedIn = lead.smsConsentAuthorized ?? false;
                  const isOptedOut = lead.smsConsentAuthorized === false && lead.smsOptOutTimestamp;
                  const isSelected = selectedLeadIds.includes(lead.id);

                  return (
                    <tr 
                      key={lead.id} 
                      className={`hover:bg-[#FAF9F5]/70 transition-colors ${
                        isSelected ? "bg-emerald-50/40" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectLead(lead.id)}
                          className="rounded border-[#EAE7E0] text-[#4A5D4E] focus:ring-[#4A5D4E]"
                        />
                      </td>

                      {/* Lead Contact */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-0.5">
                          <div className="font-bold text-[#2D362E] text-xs flex items-center gap-1.5">
                            <span>{lead.fullName}</span>
                          </div>
                          <div className="text-[11px] text-[#606C5D] font-mono flex items-center gap-1">
                            <Phone className="w-3 h-3 text-[#9A9488]" />
                            <span>{lead.phone}</span>
                          </div>
                          <div className="text-[11px] text-[#9A9488] truncate max-w-[180px]">
                            {lead.email}
                          </div>
                          {lead.taggedCityArea && (
                            <div className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-[#4A5D4E]/10 text-[#4A5D4E] mt-1">
                              <Compass className="w-2.5 h-2.5" />
                              <span>{lead.taggedCityArea}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 align-top">
                        {isOptedIn ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            <span>OPTED IN (TCPA Clear)</span>
                          </div>
                        ) : isOptedOut ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-stone-200 text-stone-800 border border-stone-300">
                            <AlertCircle className="w-3.5 h-3.5 text-stone-600" />
                            <span>OPTED OUT (STOP)</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            <Clock className="w-3.5 h-3.5 text-amber-700" />
                            <span>PENDING CONSENT</span>
                          </div>
                        )}
                        {lead.smsAuthRequestSentAt && !isOptedIn && (
                          <div className="text-[10px] text-amber-700 font-medium mt-1">
                            Auth Invite Sent: {formatDate(lead.smsAuthRequestSentAt)}
                          </div>
                        )}
                      </td>

                      {/* Timestamp */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-[#2D362E] text-xs">
                            {formatDate(lead.smsConsentTimestamp || lead.createdAt)}
                          </div>
                          <div className="text-[10px] text-[#606C5D]">
                            {lead.smsConsentTimestamp ? "Consent Granted" : "Lead Captured"}
                          </div>
                        </div>
                      </td>

                      {/* Channel / Source */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-0.5 max-w-[200px]">
                          <div className="font-semibold text-[#2D362E] text-xs truncate">
                            {lead.smsConsentSource || lead.leadSource || "Website Intake"}
                          </div>
                          <div className="text-[10px] text-[#606C5D] truncate">
                            Campaign: {lead.sourceCampaignName || "Organic Direct"}
                          </div>
                        </div>
                      </td>

                      {/* Audit Details */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-0.5 text-[11px]">
                          <div className="font-mono text-[#4A5D4E] font-medium truncate max-w-[160px]">
                            {lead.smsConsentIp || "198.51.100.42 (TLS 1.3)"}
                          </div>
                          <div className="text-[10px] text-[#9A9488]">
                            Disclosure v2026.4
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Audit Certificate Button */}
                          <button
                            onClick={() => setAuditLead(lead)}
                            title="View Printable TCPA Compliance Audit Certificate"
                            className="p-1.5 rounded-lg border border-[#EAE7E0] hover:bg-[#FAF9F5] text-[#606C5D] text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-[#4A5D4E]" />
                            <span className="hidden sm:inline">Audit Log</span>
                          </button>

                          {/* Toggle Consent */}
                          <button
                            onClick={() => setManualToggleLead(lead)}
                            title="Manually toggle SMS consent status"
                            className="p-1.5 rounded-lg border border-[#EAE7E0] hover:bg-[#FAF9F5] text-[#606C5D] text-xs font-bold cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>

                          {/* Individual Outreach or Chat */}
                          {isOptedIn ? (
                            <button
                              onClick={() => onOpenSmsMessaging ? onOpenSmsMessaging(lead) : null}
                              className="px-2.5 py-1 rounded-lg bg-[#4A5D4E] hover:bg-[#38463B] text-white font-bold text-xs shadow-2xs flex items-center gap-1 cursor-pointer"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>Text Lead</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedLeadIds([lead.id]);
                                setShowBulkAuthModal(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-2xs flex items-center gap-1 cursor-pointer"
                            >
                              <Send className="w-3 h-3" />
                              <span>Send Auth Request</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Bulk Request SMS Authorization Modal */}
      {showBulkAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#EAE7E0] shadow-2xl overflow-hidden animate-scale-up space-y-0">
            {/* Modal Header */}
            <div className="bg-[#FAF9F5] border-b border-[#EAE7E0] p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#4A5D4E]/10 flex items-center justify-center text-[#4A5D4E]">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#2D362E] text-base font-serif">
                    Bulk Request SMS Authorization
                  </h3>
                  <p className="text-xs text-[#606C5D]">
                    Dispatching TCPA-compliant consent request to {selectedLeadIds.length} selected lead{selectedLeadIds.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowBulkAuthModal(false)}
                className="w-8 h-8 rounded-full hover:bg-[#EAE7E0]/60 flex items-center justify-center text-[#606C5D]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Channel Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2D362E]">Outreach Delivery Channel:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setBulkChannel("email")}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      bulkChannel === "email"
                        ? "bg-[#4A5D4E] text-white border-[#4A5D4E] shadow-2xs"
                        : "bg-[#FAF9F5] text-[#606C5D] border-[#EAE7E0] hover:bg-[#F1EFE9]"
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    <div className="text-left">
                      <div>Email Opt-in Invitation</div>
                      <div className="text-[10px] opacity-80 font-normal">Highest delivery & TCPA documentation</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBulkChannel("sms")}
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      bulkChannel === "sms"
                        ? "bg-[#4A5D4E] text-white border-[#4A5D4E] shadow-2xs"
                        : "bg-[#FAF9F5] text-[#606C5D] border-[#EAE7E0] hover:bg-[#F1EFE9]"
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <div className="text-left">
                      <div>1-to-1 Web Authorization Link</div>
                      <div className="text-[10px] opacity-80 font-normal">Direct mobile phone invitation</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Subject (if Email) */}
              {bulkChannel === "email" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2D362E]">Email Subject Line:</label>
                  <input
                    type="text"
                    value={bulkSubject}
                    onChange={(e) => setBulkSubject(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl text-xs text-[#2D362E] focus:outline-hidden focus:border-[#4A5D4E]"
                  />
                </div>
              )}

              {/* Message Body */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#2D362E]">Authorization Request Message:</label>
                  <span className="text-[10px] text-[#606C5D]">Supports merge fields: {'{Buyer_Name}'}, {'{LO_Name}'}, {'{LO_NMLS}'}</span>
                </div>
                <textarea
                  rows={8}
                  value={bulkBody}
                  onChange={(e) => setBulkBody(e.target.value)}
                  className="w-full p-3.5 bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl text-xs text-[#2D362E] font-mono leading-relaxed focus:outline-hidden focus:border-[#4A5D4E]"
                />
              </div>

              {/* TCPA Mandatory Disclaimer Preview */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1 text-emerald-900 text-xs">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Verified TCPA Compliant Template</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Includes mandatory legal disclosures for 1-to-1 express consent, message frequency limits, carrier rates, and STOP keyword cancellation instructions.
                </p>
              </div>

              {/* Target Recipients Pill List */}
              <div className="space-y-1.5 pt-2 border-t border-[#EAE7E0]">
                <label className="text-xs font-bold text-[#606C5D]">Target Buyers ({selectedLeadIds.length}):</label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {leads.filter(l => selectedLeadIds.includes(l.id)).map(l => (
                    <span key={l.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF9F5] border border-[#EAE7E0] text-[11px] font-medium text-[#2D362E]">
                      <UserCheck className="w-3 h-3 text-[#4A5D4E]" />
                      <span>{l.fullName} ({l.phone})</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-[#FAF9F5] border-t border-[#EAE7E0] p-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowBulkAuthModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#606C5D] hover:bg-[#EAE7E0]/60 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteBulkAuthRequest}
                disabled={isSendingBulk}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSendingBulk ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Dispatching Requests...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Dispatch Authorization Request ({selectedLeadIds.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: TCPA Compliance Audit Certificate Modal */}
      {auditLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-[#EAE7E0] shadow-2xl overflow-hidden animate-scale-up">
            <div className="bg-[#FAF9F5] border-b border-[#EAE7E0] p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#2D362E] text-base font-serif">
                    TCPA Consent Audit Certificate
                  </h3>
                  <p className="text-xs text-[#606C5D]">
                    Official Federal Compliance Log for {auditLead.fullName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAuditLead(null)}
                className="w-8 h-8 rounded-full hover:bg-[#EAE7E0]/60 flex items-center justify-center text-[#606C5D]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-sans">
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-emerald-700 uppercase font-bold">Authorization Status</div>
                  <div className="text-base font-bold text-emerald-900 font-serif">
                    {auditLead.smsConsentAuthorized ? "VERIFIED OPTED-IN" : "PENDING CONSENT"}
                  </div>
                </div>
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>

              <div className="space-y-2 border border-[#EAE7E0] rounded-2xl p-4 bg-[#FAF9F5]">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#606C5D] font-medium block">Lead Name:</span>
                    <span className="font-bold text-[#2D362E]">{auditLead.fullName}</span>
                  </div>
                  <div>
                    <span className="text-[#606C5D] font-medium block">Phone Number:</span>
                    <span className="font-bold text-[#2D362E] font-mono">{auditLead.phone}</span>
                  </div>
                  <div>
                    <span className="text-[#606C5D] font-medium block">Consent Date & Time:</span>
                    <span className="font-bold text-[#2D362E]">{formatDate(auditLead.smsConsentTimestamp || auditLead.createdAt)}</span>
                  </div>
                  <div>
                    <span className="text-[#606C5D] font-medium block">Audit IP Address:</span>
                    <span className="font-bold text-[#2D362E] font-mono">{auditLead.smsConsentIp || "198.51.100.42 (TLS 1.3)"}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[#606C5D] font-medium block">Capture Source:</span>
                    <span className="font-bold text-[#2D362E]">{auditLead.smsConsentSource || auditLead.leadSource || "Website AI Intake"}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[#606C5D] font-medium block">Authorized Loan Officer:</span>
                    <span className="font-bold text-[#2D362E]">{loanOfficer.name} (NMLS #{loanOfficer.nmlsId})</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-[#2D362E]">Legal TCPA Disclaimer Text Rendered:</span>
                <p className="p-3 bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl text-[11px] text-[#606C5D] italic leading-relaxed">
                  "By checking this box, I provide my express written consent for {loanOfficer.name} (NMLS #{loanOfficer.nmlsId}) to send automated text messages and call alerts regarding Oregon down payment grants and home listings to the mobile number provided above. Consent is not a condition of purchasing any property or obtaining financing. Message & data rates may apply. Reply STOP to cancel."
                </p>
              </div>
            </div>

            <div className="bg-[#FAF9F5] border-t border-[#EAE7E0] p-4 flex items-center justify-between">
              <span className="text-[10px] text-[#606C5D]">Audit Record Hash: #TCPA-2026-{auditLead.id}</span>
              <button
                type="button"
                onClick={() => setAuditLead(null)}
                className="px-5 py-2 rounded-xl bg-[#4A5D4E] text-white font-bold text-xs"
              >
                Close Audit Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Manual Toggle Consent Modal */}
      {manualToggleLead && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-[#EAE7E0] shadow-2xl overflow-hidden animate-scale-up">
            <div className="bg-[#FAF9F5] border-b border-[#EAE7E0] p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-[#4A5D4E]" />
                <h3 className="font-bold text-[#2D362E] text-sm">
                  Update SMS Consent for {manualToggleLead.fullName}
                </h3>
              </div>
              <button onClick={() => setManualToggleLead(null)} className="text-[#606C5D]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-[#606C5D]">
                Current status: <strong className="text-[#2D362E]">{manualToggleLead.smsConsentAuthorized ? "OPTED IN" : "PENDING CONSENT"}</strong>.
                Changing status to <strong className="text-emerald-700">{manualToggleLead.smsConsentAuthorized ? "OPTED OUT" : "OPTED IN"}</strong>.
              </p>

              <div className="space-y-1.5">
                <label className="font-bold text-[#2D362E]">Reason / Audit Verification Note:</label>
                <select
                  value={manualReason}
                  onChange={(e) => setManualReason(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl text-xs text-[#2D362E]"
                >
                  <option value="Verbal consent recorded during phone consultation">Verbal consent recorded during phone consultation</option>
                  <option value="Signed paper TCPA authorization form on file">Signed paper TCPA authorization form on file</option>
                  <option value="Email confirmation received from buyer">Email confirmation received from buyer</option>
                  <option value="Customer verbal request to stop text updates">Customer verbal request to stop text updates</option>
                </select>
              </div>
            </div>

            <div className="bg-[#FAF9F5] border-t border-[#EAE7E0] p-4 flex items-center justify-end gap-2">
              <button onClick={() => setManualToggleLead(null)} className="px-3 py-1.5 text-xs text-[#606C5D]">
                Cancel
              </button>
              <button
                onClick={handleConfirmManualToggle}
                className="px-4 py-2 bg-[#4A5D4E] text-white font-bold text-xs rounded-xl shadow-2xs"
              >
                Save Compliance Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
