import React, { useState } from "react";
import { 
  X, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  MessageSquare, 
  Flame, 
  ShieldCheck, 
  Mail, 
  Phone, 
  User, 
  Building, 
  Zap, 
  MailCheck, 
  StickyNote, 
  Edit3, 
  Save, 
  ArrowRight, 
  DollarSign, 
  Calendar, 
  MapPin, 
  Tag, 
  Compass, 
  Check, 
  FileText,
  AlertCircle,
  Trophy,
  Share2,
  FileCheck2,
  Layers,
  Send
} from "lucide-react";
import { CapturedLead, LoanOfficerProfile, RealEstateAgentProfile } from "../types";
import { HeadshotAvatar } from "./HeadshotAvatar";
import { OutreachHistoryBadge } from "./OutreachHistoryBadge";

interface LeadJourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: CapturedLead | null;
  onUpdateLeadStatus: (leadId: string, status: CapturedLead['status']) => void;
  onUpdateLead?: (updatedLead: CapturedLead) => void;
  onToggleNurture: (leadId: string) => void;
  onSaveNotes: (leadId: string, notes: string) => void;
  onOpenOutreachModal: (leadId: string) => void;
  onViewTranscript: (lead: CapturedLead) => void;
  loanOfficers: LoanOfficerProfile[];
  agentRoster: RealEstateAgentProfile[];
}

export const LeadJourneyModal: React.FC<LeadJourneyModalProps> = ({
  isOpen,
  onClose,
  lead,
  onUpdateLeadStatus,
  onUpdateLead,
  onToggleNurture,
  onSaveNotes,
  onOpenOutreachModal,
  onViewTranscript,
  loanOfficers,
  agentRoster,
}) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState("");

  // Event 7 Funding & Closing Ledger State
  const [grossCommission, setGrossCommission] = useState<number>(lead?.grossCommissionPaid || 11875);
  const [fundingDate, setFundingDate] = useState<string>(lead?.fundingClosingDate || new Date().toISOString().split("T")[0]);
  const [loanAmount, setLoanAmount] = useState<number>(lead?.fundedLoanAmount || 475000);
  const [loanProgram, setLoanProgram] = useState<string>(lead?.loanProgramName || lead?.desiredLoanProgram || "USDA Rural Development (0% Down)");
  const [buyerAgent, setBuyerAgent] = useState<string>(lead?.buyerAgentName || lead?.assignedAgent || "Sarah Jenkins");
  const [journeyDays, setJourneyDays] = useState<number>(lead?.totalJourneyDays || 42);
  const [adSpend, setAdSpend] = useState<number>(lead?.attributedAdSpend || 450);
  const [desiredLocation, setDesiredLocation] = useState<string>(lead?.desiredPurchaseLocation || lead?.taggedCityArea || "Salem, OR");
  const [desiredProgram, setDesiredProgram] = useState<string>(lead?.desiredLoanProgram || "USDA RD Zero Down");
  const [isEditingFunding, setIsEditingFunding] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [isCopiedMilestone, setIsCopiedMilestone] = useState<boolean>(false);

  React.useEffect(() => {
    if (lead) {
      setGrossCommission(lead.grossCommissionPaid || 11875);
      setFundingDate(lead.fundingClosingDate || new Date().toISOString().split("T")[0]);
      setLoanAmount(lead.fundedLoanAmount || 475000);
      setLoanProgram(lead.loanProgramName || lead.desiredLoanProgram || "USDA Rural Development (0% Down)");
      setBuyerAgent(lead.buyerAgentName || lead.assignedAgent || "Sarah Jenkins");
      setJourneyDays(lead.totalJourneyDays || 42);
      setAdSpend(lead.attributedAdSpend || 450);
      setDesiredLocation(lead.desiredPurchaseLocation || lead.taggedCityArea || "Salem, OR");
      setDesiredProgram(lead.desiredLoanProgram || "USDA RD Zero Down");
      setIsEditingFunding(lead.status === "closed");
    }
  }, [lead?.id]);

  if (!isOpen || !lead) return null;

  const assignedLo = loanOfficers.find(lo => lo.id === lead.assignedLoId) || loanOfficers[0];
  const assignedAgent = agentRoster.find(a => a.id === lead.assignedAgentId);

  // Calculate Journey Stepper Progress
  const stages: { key: CapturedLead['status']; label: string; desc: string }[] = [
    { key: 'new', label: '1. Inbound Lead', desc: 'AI Chatbot intake completed' },
    { key: 'contacted', label: '2. LO Contacted', desc: 'Initial outreach & call' },
    { key: 'pre_approved', label: '3. Pre-Approved', desc: 'Financial audit & pre-qual' },
    { key: 'in_escrow', label: '4. In Escrow', desc: 'Home offer accepted' },
    { key: 'closed', label: '5. Loan Closed', desc: 'Key handover & funded' }
  ];

  const currentStageIndex = stages.findIndex(s => s.key === lead.status);
  const activeStageIdx = currentStageIndex === -1 ? (lead.status === 'archived' ? 0 : 1) : currentStageIndex;

  const handleStartNotes = () => {
    setNotesText(lead.notes || "");
    setIsEditingNotes(true);
  };

  const handleSaveNotesClick = () => {
    onSaveNotes(lead.id, notesText);
    setIsEditingNotes(false);
  };

  // Format date helper
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#EAE7E0] overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="bg-[#2D362E] text-white p-5 sm:p-6 shrink-0 flex items-start justify-between border-b border-white/10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#4A5D4E] border border-white/20 text-white flex items-center justify-center font-serif font-bold text-lg shadow-sm shrink-0">
              {lead.fullName.split(" ").map(n => n[0]).slice(0, 2).join("")}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#C18C5D] text-white">
                  Lead Journey Timeline
                </span>
                {lead.intentScore === "hot" && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-400/30">
                    <Flame className="w-3 h-3 text-orange-400 fill-orange-400" />
                    Hot Buyer Intent
                  </span>
                )}
                <span className="text-xs text-white/70">Source: {lead.leadSource}</span>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">{lead.fullName}</h2>
                <OutreachHistoryBadge lead={lead} compact={false} align="left" />
              </div>
              <div className="flex items-center gap-3 text-xs text-white/80 flex-wrap">
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-[#C18C5D]" /> {lead.email}</span>
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-[#C18C5D]" /> {lead.phone}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[#C18C5D]" /> {lead.preferredContactTime}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Milestone Stepper Bar */}
        <div className="bg-[#FAF9F5] p-4 sm:p-5 border-b border-[#EAE7E0] shrink-0 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#4A5D4E] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-[#C18C5D]" />
              Prospect Progression Pipeline
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#606C5D] font-medium">Update Lead Status:</span>
              <select
                value={lead.status}
                onChange={(e) => onUpdateLeadStatus(lead.id, e.target.value as CapturedLead['status'])}
                className={`px-3 py-1 rounded-xl text-xs font-bold border focus:outline-none shadow-2xs transition-colors ${
                  lead.status === "new"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : lead.status === "pre_approved"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : lead.status === "contacted"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : lead.status === "in_escrow"
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : "bg-stone-100 text-stone-700 border-stone-200"
                }`}
              >
                <option value="new">🔵 New / Uncontacted</option>
                <option value="contacted">🟡 Contacted</option>
                <option value="pre_approved">🟢 Pre-Approved</option>
                <option value="in_escrow">🟣 In Escrow</option>
                <option value="closed">🏁 Closed</option>
                <option value="archived">⚪ Archived</option>
              </select>
            </div>
          </div>

          {/* Stepper Pipeline Graphics */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
            {stages.map((stg, idx) => {
              const isCompleted = idx < activeStageIdx || lead.status === "closed";
              const isCurrent = idx === activeStageIdx && lead.status !== "closed";

              return (
                <div 
                  key={stg.key}
                  className={`p-2.5 rounded-2xl border transition-all text-xs space-y-1 ${
                    isCurrent 
                      ? "bg-white border-[#4A5D4E] shadow-sm ring-2 ring-[#4A5D4E]/20" 
                      : isCompleted
                        ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                        : "bg-white/60 border-[#EAE7E0] text-gray-400"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isCurrent ? 'text-[#4A5D4E]' : isCompleted ? 'text-emerald-700' : 'text-gray-400'}`}>
                      {stg.label}
                    </span>
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100 shrink-0" />
                    ) : isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-[#C18C5D] animate-pulse shrink-0" />
                    ) : null}
                  </div>
                  <p className={`text-[11px] font-semibold leading-tight ${isCurrent ? 'text-[#2D362E]' : isCompleted ? 'text-emerald-900' : 'text-gray-400'}`}>
                    {stg.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scrollable Timeline & Details View */}
        <div className="flex-1 overflow-y-auto bg-[#F9F8F4] p-4 sm:p-6 space-y-6">
          {/* Top Grid: Financial Parameters & Assigned Team */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Buyer Financial Profile */}
            <div className="md:col-span-2 bg-white p-4 sm:p-5 rounded-2xl border border-[#EAE7E0] shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-[#9A9488] uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-[#4A5D4E]" />
                Captured Buyer Financial Profile
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-[#EAE7E0]">
                  <span className="text-[10px] text-[#606C5D] block font-semibold">Target Price Range</span>
                  <strong className="text-[#4A5D4E] font-bold text-sm">{lead.targetPriceRange || "N/A"}</strong>
                </div>
                <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-[#EAE7E0]">
                  <span className="text-[10px] text-[#606C5D] block font-semibold">Annual Household Income</span>
                  <strong className="text-[#2D362E] font-bold text-sm">{lead.annualIncome || "N/A"}</strong>
                </div>
                <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-[#EAE7E0]">
                  <span className="text-[10px] text-[#606C5D] block font-semibold">Down Payment Savings</span>
                  <strong className="text-[#2D362E] font-bold text-sm">{lead.downPaymentSavings || "N/A"}</strong>
                </div>
                <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-[#EAE7E0]">
                  <span className="text-[10px] text-[#606C5D] block font-semibold">Credit Score Tier</span>
                  <strong className="text-[#2D362E] font-bold text-sm">{lead.creditScoreTier || "N/A"}</strong>
                </div>
                <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-[#EAE7E0]">
                  <span className="text-[10px] text-[#606C5D] block font-semibold">Buying Timeline</span>
                  <strong className="text-[#2D362E] font-bold text-sm">{lead.timeline || "N/A"}</strong>
                </div>
                <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-[#EAE7E0]">
                  <span className="text-[10px] text-[#606C5D] block font-semibold">DPA Grant Interest</span>
                  <strong className={lead.grantInterest ? "text-emerald-700 font-bold text-sm" : "text-gray-500 font-normal text-xs"}>
                    {lead.grantInterest ? "✓ Yes (DPA Requested)" : "Standard Loan"}
                  </strong>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs pt-1 text-[#606C5D] flex-wrap border-t border-[#EAE7E0]">
                <span><strong>Target Cities:</strong> {lead.preferredLocations || "Oregon Statewide"}</span>
                <span><strong>Property Type:</strong> {lead.propertyType || "Single Family Home"}</span>
              </div>
            </div>

            {/* Team Roster Assignment */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EAE7E0] shadow-2xs space-y-3">
              <h4 className="text-xs font-bold text-[#9A9488] uppercase tracking-wider flex items-center gap-1.5">
                <Building className="w-4 h-4 text-[#C18C5D]" />
                Assigned Advisory Team
              </h4>

              {/* LO Box */}
              <div className="bg-[#FAF9F5] p-3 rounded-xl border border-[#EAE7E0] flex items-center gap-3">
                <HeadshotAvatar
                  src={assignedLo.headshotUrl}
                  alt={assignedLo.name}
                  fallbackName={assignedLo.name}
                  size="md"
                />
                <div className="text-xs">
                  <span className="text-[10px] font-bold text-[#4A5D4E] uppercase block">Assigned Loan Officer</span>
                  <p className="font-bold text-[#2D362E]">{assignedLo.name}</p>
                  <p className="text-[10px] text-[#606C5D]">NMLS #{assignedLo.nmlsId} • {assignedLo.company}</p>
                </div>
              </div>

              {/* Agent Box */}
              {assignedAgent ? (
                <div className="bg-[#FAF9F5] p-3 rounded-xl border border-[#EAE7E0] flex items-center gap-3">
                  <HeadshotAvatar
                    src={assignedAgent.headshotUrl}
                    alt={assignedAgent.name}
                    fallbackName={assignedAgent.name}
                    size="md"
                  />
                  <div className="text-xs">
                    <span className="text-[10px] font-bold text-[#C18C5D] uppercase block">Realtor Partner</span>
                    <p className="font-bold text-[#2D362E]">{assignedAgent.name}</p>
                    <p className="text-[10px] text-[#606C5D]">{assignedAgent.brokerage}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-[#FAF9F5] p-3 rounded-xl border border-dashed border-[#EAE7E0] text-xs text-[#9A9488] italic text-center">
                  Unassigned Realtor Partner
                </div>
              )}
            </div>
          </div>

          {/* VISUAL TIMELINE OF INTERACTIONS */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#EAE7E0] shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-3">
              <div>
                <h3 className="font-bold text-sm text-[#2D362E] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#4A5D4E]" />
                  Historical Interaction Timeline
                </h3>
                <p className="text-xs text-[#606C5D]">
                  Chronological trail from initial AI Chatbot intake through current status
                </p>
              </div>

              <button
                onClick={handleStartNotes}
                className="px-3 py-1.5 bg-[#FAF9F5] hover:bg-[#EAE7E0] text-[#4A5D4E] border border-[#EAE7E0] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <StickyNote className="w-3.5 h-3.5 text-[#C18C5D]" />
                <span>+ Add LO Note / Touchpoint</span>
              </button>
            </div>

            {/* Note Editor Drawer inside Timeline */}
            {isEditingNotes && (
              <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#4A5D4E]/40 space-y-3 shadow-xs">
                <div className="flex items-center justify-between text-xs font-bold text-[#4A5D4E]">
                  <span className="flex items-center gap-1.5">
                    <Edit3 className="w-4 h-4 text-[#C18C5D]" /> Record LO Call Note or Follow-Up Annotation
                  </span>
                  <button onClick={() => setIsEditingNotes(false)} className="text-[#9A9488] hover:text-[#2D362E]">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder="Record call summary, buyer preference updates, pre-approval document status..."
                  className="w-full bg-white border border-[#EAE7E0] rounded-xl p-3 text-xs text-[#2D362E] focus:outline-none focus:border-[#4A5D4E] resize-none"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditingNotes(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-[#606C5D] hover:bg-[#EAE7E0] rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNotesClick}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-[#4A5D4E] hover:bg-[#38463B] rounded-xl flex items-center gap-1.5 shadow-2xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Note to Timeline</span>
                  </button>
                </div>
              </div>
            )}

            {/* Timeline Events Stack */}
            <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#EAE7E0]">
              
              {/* Event 1: Initial Inbound Lead Capture */}
              <div className="relative space-y-2">
                <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[#4A5D4E] text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                  1
                </div>
                <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#EAE7E0] space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                    <span className="font-bold text-[#2D362E] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#C18C5D]" />
                      Initial Lead Intake & 24/7 AI Chatbot Contact
                    </span>
                    <span className="text-[11px] text-[#9A9488] font-mono">{formatDate(lead.createdAt)}</span>
                  </div>
                  <p className="text-xs text-[#606C5D] leading-relaxed">
                    Prospect initiated contact via <strong>{lead.leadSource}</strong>.
                    {lead.sourceCampaignName && ` Interacted with campaign: "${lead.sourceCampaignName}".`}
                    {lead.sourcePropertyAddress && ` Inquiry made regarding listing: "${lead.sourcePropertyAddress}".`}
                  </p>
                  <div className="flex items-center gap-2 pt-1 flex-wrap text-[11px]">
                    <span className="px-2 py-0.5 bg-white border border-[#EAE7E0] rounded-lg text-[#4A5D4E] font-medium">
                      Source Type: {lead.interactedSourceType || 'chatbot'}
                    </span>
                    {lead.chatTranscript && lead.chatTranscript.length > 0 && (
                      <button
                        onClick={() => onViewTranscript(lead)}
                        className="px-2.5 py-0.5 bg-[#4A5D4E] text-white font-bold rounded-lg flex items-center gap-1 hover:bg-[#38463B] transition-colors"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>View {lead.chatTranscript.length} Chat Messages</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Event 2: Team Routing & Assignment */}
              <div className="relative space-y-2">
                <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[#C18C5D] text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                  2
                </div>
                <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#EAE7E0] space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                    <span className="font-bold text-[#2D362E] flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-[#4A5D4E]" />
                      Advisory Team Routing & Assignment
                    </span>
                    <span className="text-[11px] text-[#9A9488] font-mono">{formatDate(lead.createdAt)}</span>
                  </div>
                  <p className="text-xs text-[#606C5D]">
                    Automated routing assigned prospect to <strong>{assignedLo.name}</strong> (Loan Officer) 
                    {assignedAgent ? ` and real estate partner ${assignedAgent.name} (${assignedAgent.brokerage})` : ""}.
                  </p>
                </div>
              </div>

              {/* Event 3: Automated Nurture Email Sequence */}
              <div className="relative space-y-2">
                <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[#4A5D4E] text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                  3
                </div>
                <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#EAE7E0] space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                    <span className="font-bold text-[#2D362E] flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500" />
                      Automated Nurture Sequence & Email Records
                    </span>
                    <button
                      onClick={() => onToggleNurture(lead.id)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all ${
                        lead.nurtureSequenceEnabled ?? true
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : "bg-gray-100 text-gray-600 border-gray-200"
                      }`}
                    >
                      {(lead.nurtureSequenceEnabled ?? true) ? "✓ Nurture Active" : "Paused"}
                    </button>
                  </div>

                  {/* Nurture Stage & Most Recent Timestamp Bar */}
                  <div className="bg-white p-3 rounded-xl border border-[#EAE7E0] grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-[#C18C5D]" />
                      <div>
                        <span className="text-[10px] text-[#606C5D] block uppercase font-bold tracking-wider">Current Campaign Stage</span>
                        <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px] inline-block mt-0.5">
                          {lead.nurtureStageText || `${lead.nurtureCurrentStep || (lead.nurtureSequenceLogs?.length || 1)} of ${lead.nurtureTotalSteps || 4} weekly nurture sent`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#4A5D4E]" />
                      <div>
                        <span className="text-[10px] text-[#606C5D] block uppercase font-bold tracking-wider">Most Recent Email Sent</span>
                        <span className="font-bold text-[#2D362E] text-[11px] block mt-0.5 font-mono">
                          {lead.lastEmailSentAt ? formatDate(lead.lastEmailSentAt) : (lead.nurtureSequenceLogs && lead.nurtureSequenceLogs.length > 0 ? formatDate(lead.nurtureSequenceLogs[lead.nurtureSequenceLogs.length - 1].sentAt) : 'No emails sent yet')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Record of Template Emails Sent */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#4A5D4E] pt-1">
                      <span className="flex items-center gap-1">
                        <MailCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Record of Template Emails Sent ({lead.nurtureSequenceLogs?.length || 0})
                      </span>
                      {lead.lastEmailTemplateName && (
                        <span className="text-[10px] text-[#606C5D]">Latest: <strong>{lead.lastEmailTemplateName}</strong></span>
                      )}
                    </div>

                    {lead.nurtureSequenceLogs && lead.nurtureSequenceLogs.length > 0 ? (
                      <div className="space-y-2">
                        {lead.nurtureSequenceLogs.map((log, idx) => (
                          <div key={log.id || idx} className="bg-white p-3 rounded-xl border border-[#EAE7E0] hover:border-[#4A5D4E]/40 transition-colors space-y-1.5 text-xs">
                            <div className="flex items-start justify-between gap-2 flex-wrap">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-[#2D362E] text-xs">
                                    📄 {log.templateName || log.emailSubject || "Email Template"}
                                  </span>
                                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-stone-100 text-[#4A5D4E] border border-stone-200">
                                    Stage: {log.stageName}
                                  </span>
                                </div>
                                <div className="text-[11px] text-[#606C5D] italic">
                                  Subject: "{log.emailSubject}"
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  log.status === 'opened' 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                                }`}>
                                  {log.status === 'opened' ? '✓ OPENED' : 'SENT'}
                                </span>
                                <span className="text-[10px] text-[#9A9488] block font-mono mt-0.5">
                                  {formatDate(log.sentAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white p-3 rounded-xl border border-[#EAE7E0] text-xs text-[#606C5D] flex items-center justify-between">
                        <span>Sequence Stage: <strong>{lead.nurtureSequenceStage || "new_welcome"}</strong></span>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          Auto-Welcome Scheduled
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Event 4: Multi-Channel Outreach Dispatch & Communication Tracking */}
              <div className="relative space-y-2">
                <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[#C18C5D] text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                  4
                </div>
                <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#EAE7E0] space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                    <span className="font-bold text-[#2D362E] flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#C18C5D]" />
                      Multi-Channel Outreach & Communication History
                    </span>
                    <div className="flex items-center gap-2">
                      <OutreachHistoryBadge lead={lead} compact={false} align="right" />
                      <button
                        onClick={() => onOpenOutreachModal(lead.id)}
                        className="px-2.5 py-1 bg-[#4A5D4E] text-white text-[11px] font-bold rounded-lg hover:bg-[#38463B] transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <Mail className="w-3 h-3" />
                        <span>Compose Outreach</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-[#606C5D]">
                    Consolidated record of all outbound emails dispatched via Google Workspace Gmail, Outlook, portal templates, and automated SMS touches.
                  </p>

                  {/* Render recent emailHistory if available */}
                  {lead.emailHistory && lead.emailHistory.length > 0 ? (
                    <div className="space-y-2 pt-1">
                      {lead.emailHistory.map((item) => (
                        <div key={item.id} className="bg-white p-3 rounded-xl border border-[#EAE7E0] text-xs space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase ${
                                  item.channel === 'gmail' 
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                                    : item.channel === 'outlook'
                                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}>
                                  {item.channel}
                                </span>
                                <strong className="text-[#2D362E]">{item.templateType}</strong>
                              </div>
                              {item.subject && (
                                <p className="text-[11px] text-[#606C5D] italic">"{item.subject}"</p>
                              )}
                              {item.notes && (
                                <p className="text-[10px] text-[#9A9488] line-clamp-1">{item.notes}</p>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                {item.status || 'SENT'}
                              </span>
                              <span className="text-[10px] text-[#9A9488] block font-mono mt-0.5">
                                {formatDate(item.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white p-3 rounded-xl border border-dashed border-[#EAE7E0] text-center text-xs text-[#9A9488]">
                      Hover over or click the <strong className="text-[#4A5D4E]">Outreach History</strong> badge above to view detailed timestamps, channels, and full dispatch logs.
                    </div>
                  )}
                </div>
              </div>

              {/* Event 5: Saved Calculator & Affordability Scenarios */}
              <div className="relative space-y-2">
                <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[#4A5D4E] text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                  5
                </div>
                <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#EAE7E0] space-y-3">
                  <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                    <span className="font-bold text-[#2D362E] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#C18C5D]" />
                      Saved Calculator Scenarios & Pre-Filled Drafts ({lead.savedScenarios?.length || 0})
                    </span>
                    {lead.savedScenarios && lead.savedScenarios.length > 0 && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        {lead.savedScenarios.length} Scenarios Available
                      </span>
                    )}
                  </div>

                  {lead.savedScenarios && lead.savedScenarios.length > 0 ? (
                    <div className="space-y-3">
                      {lead.savedScenarios.map((scen) => (
                        <div key={scen.id} className="bg-white p-3.5 rounded-xl border border-[#EAE7E0] hover:border-[#4A5D4E]/50 transition-all space-y-2 text-xs shadow-2xs">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-[#2D362E]">{scen.scenarioName}</span>
                                <span className="text-[10px] bg-[#F1EFE9] text-[#4A5D4E] font-semibold px-1.5 py-0.2 rounded">
                                  {scen.sourceTool === "calculator" ? "Quick Payment" : "Mortgage Lab"}
                                </span>
                              </div>
                              <div className="text-[11px] text-[#606C5D] mt-0.5 font-mono">
                                Target: ${scen.targetPrice.toLocaleString()} • Down: ${scen.downPayment.toLocaleString()} ({scen.downPaymentPercent}%) • Rate: {scen.interestRate}%
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-xs font-extrabold text-[#4A5D4E] bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 block">
                                ${scen.totalMonthlyPayment.toLocaleString()}/mo PITI
                              </span>
                              <span className="text-[10px] text-[#9A9488] block font-mono mt-0.5">
                                {formatDate(scen.createdAt)}
                              </span>
                            </div>
                          </div>

                          {/* Quick Draft Actions */}
                          <div className="pt-2 border-t border-[#EAE7E0] flex items-center justify-between gap-2 flex-wrap">
                            <span className="text-[10px] text-[#606C5D] italic truncate max-w-xs">
                              Subject: "{scen.draftBorrowerEmailSubject}"
                            </span>
                            <button
                              type="button"
                              onClick={() => onOpenOutreachModal(lead.id)}
                              className="px-2.5 py-1 bg-[#4A5D4E] hover:bg-[#38463B] text-white font-bold rounded-lg text-[11px] flex items-center gap-1 transition-colors"
                            >
                              <Mail className="w-3 h-3" />
                              <span>Load & Send Draft Email/SMS →</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white p-3 rounded-xl border border-[#EAE7E0] text-xs text-[#9A9488] italic">
                      No custom scenarios saved to this profile yet. Run the Quick Payment or How Much House Can I Afford calculator to attach scenarios.
                    </div>
                  )}
                </div>
              </div>

              {/* Event 5: Loan Officer Interaction Notes & Annotations */}
              <div className="relative space-y-2">
                <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[#C18C5D] text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                  5
                </div>
                <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#EAE7E0] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#2D362E] flex items-center gap-1.5">
                      <StickyNote className="w-3.5 h-3.5 text-[#C18C5D]" />
                      Loan Officer Annotations & Interaction Notes
                    </span>
                    <button
                      onClick={handleStartNotes}
                      className="text-[11px] font-bold text-[#4A5D4E] hover:underline"
                    >
                      {lead.notes ? "Edit Note" : "+ Add Note"}
                    </button>
                  </div>
                  {lead.notes ? (
                    <div className="bg-white p-3 rounded-xl border border-[#EAE7E0] text-xs space-y-1">
                      <p className="text-[#2D362E] leading-relaxed whitespace-pre-wrap">{lead.notes}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-[#9A9488] italic">
                      No manual interaction notes recorded yet. Use '+ Add LO Note' to log phone call details.
                    </p>
                  )}
                </div>
              </div>

              {/* Event 6: Pre-Approval Audit Status */}
              <div className="relative space-y-2">
                <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                  6
                </div>
                <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      Prequalification & Underwriting Progress
                    </span>
                    <span className="text-xs font-bold text-emerald-800 uppercase">
                      Current: {lead.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-900/80 leading-relaxed">
                    Lead is currently tracked in stage: <strong>{lead.status.toUpperCase()}</strong>. Target price capability evaluated up to <strong>{lead.targetPriceRange}</strong> with <strong>{lead.downPaymentSavings}</strong> down payment savings.
                  </p>
                </div>
              </div>

              {/* Event 7: True 3-System Microservices Ecosphere & Funded Loan Closing Ledger */}
              <div className="relative space-y-2">
                <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
                  7
                </div>
                <div className="bg-gradient-to-br from-amber-50/60 to-emerald-50/40 p-5 rounded-2xl border border-amber-300/80 space-y-4 shadow-xs">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-amber-950 text-sm flex items-center gap-1.5">
                          <Trophy className="w-4 h-4 text-amber-600" />
                          Funded Loan Closing Ledger &amp; Return On Lead Investment (ROLI)
                        </span>
                        <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                          3-System Ecosphere
                        </span>
                      </div>
                      <p className="text-xs text-[#606C5D] mt-0.5">
                        Track verified loan funding economics pushed through <strong>GeoSphere Map</strong> &rarr; <strong>FTHB Qualifier</strong> &rarr; <strong>Vantage AI Ad Studio</strong>.
                      </p>
                    </div>

                    <button
                      onClick={() => setIsEditingFunding(!isEditingFunding)}
                      className="px-3 py-1 bg-white hover:bg-amber-100/60 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isEditingFunding ? "Minimize Form" : "Edit Funding Inputs"}</span>
                    </button>
                  </div>

                  {/* Summary Metric Ribbon */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs">
                      <span className="text-[10px] uppercase font-bold text-[#606C5D] block">Gross Commission</span>
                      <strong className="text-sm font-black text-emerald-800 font-mono">
                        ${(grossCommission || 0).toLocaleString()}
                      </strong>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs">
                      <span className="text-[10px] uppercase font-bold text-[#606C5D] block">Funded Loan</span>
                      <strong className="text-sm font-black text-[#2D362E] font-mono">
                        ${(loanAmount || 0).toLocaleString()}
                      </strong>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs">
                      <span className="text-[10px] uppercase font-bold text-[#606C5D] block">Speed To Close</span>
                      <strong className="text-sm font-black text-[#2D362E] font-mono">
                        {journeyDays} Days
                      </strong>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs">
                      <span className="text-[10px] uppercase font-bold text-[#606C5D] block">Campaign ROLI</span>
                      <strong className="text-sm font-black text-amber-800 font-mono">
                        {adSpend > 0 ? (grossCommission / adSpend).toFixed(1) + "x" : "12.5x"}
                      </strong>
                    </div>
                  </div>

                  {/* Edit Form */}
                  {isEditingFunding && (
                    <div className="bg-white p-4 rounded-xl border border-amber-300/80 space-y-4 animate-in fade-in duration-200">
                      <h5 className="text-xs font-bold text-[#2D362E] uppercase tracking-wider flex items-center gap-1.5">
                        <FileCheck2 className="w-4 h-4 text-emerald-700" />
                        Verified Closing Inputs (Syncs to Branch Manager Dashboard)
                      </h5>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#606C5D] uppercase">Gross Commission Paid ($)</label>
                          <div className="relative">
                            <DollarSign className="w-3.5 h-3.5 text-[#9A9488] absolute left-2.5 top-2.5" />
                            <input
                              type="number"
                              value={grossCommission}
                              onChange={(e) => setGrossCommission(Number(e.target.value))}
                              className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl pl-8 pr-3 py-1.5 text-xs font-bold text-[#2D362E]"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#606C5D] uppercase">Funding &amp; Closing Date</label>
                          <div className="relative">
                            <Calendar className="w-3.5 h-3.5 text-[#9A9488] absolute left-2.5 top-2.5" />
                            <input
                              type="date"
                              value={fundingDate}
                              onChange={(e) => setFundingDate(e.target.value)}
                              className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl pl-8 pr-3 py-1.5 text-xs font-bold text-[#2D362E]"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#606C5D] uppercase">Funded Loan Amount ($)</label>
                          <div className="relative">
                            <DollarSign className="w-3.5 h-3.5 text-[#9A9488] absolute left-2.5 top-2.5" />
                            <input
                              type="number"
                              value={loanAmount}
                              onChange={(e) => setLoanAmount(Number(e.target.value))}
                              className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl pl-8 pr-3 py-1.5 text-xs font-bold text-[#2D362E]"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#606C5D] uppercase">Loan Program Name</label>
                          <input
                            type="text"
                            value={loanProgram}
                            onChange={(e) => setLoanProgram(e.target.value)}
                            placeholder="e.g. USDA Rural Development (0% Down)"
                            className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-3 py-1.5 text-xs font-bold text-[#2D362E]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#606C5D] uppercase">Buyer Partner Agent</label>
                          <input
                            type="text"
                            value={buyerAgent}
                            onChange={(e) => setBuyerAgent(e.target.value)}
                            placeholder="e.g. Sarah Jenkins (Cascade Realty)"
                            className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-3 py-1.5 text-xs font-bold text-[#2D362E]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#606C5D] uppercase">Total Journey Days</label>
                          <input
                            type="number"
                            value={journeyDays}
                            onChange={(e) => setJourneyDays(Number(e.target.value))}
                            className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-3 py-1.5 text-xs font-bold text-[#2D362E]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#606C5D] uppercase">Attributed Ad Spend ($)</label>
                          <div className="relative">
                            <DollarSign className="w-3.5 h-3.5 text-[#9A9488] absolute left-2.5 top-2.5" />
                            <input
                              type="number"
                              value={adSpend}
                              onChange={(e) => setAdSpend(Number(e.target.value))}
                              className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl pl-8 pr-3 py-1.5 text-xs font-bold text-[#2D362E]"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#606C5D] uppercase">Desired Purchase City / Area</label>
                          <input
                            type="text"
                            value={desiredLocation}
                            onChange={(e) => setDesiredLocation(e.target.value)}
                            placeholder="e.g. Salem, OR"
                            className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-3 py-1.5 text-xs font-bold text-[#2D362E]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#606C5D] uppercase">Desired Program Needs</label>
                          <input
                            type="text"
                            value={desiredProgram}
                            onChange={(e) => setDesiredProgram(e.target.value)}
                            placeholder="e.g. USDA RD Zero Down"
                            className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-3 py-1.5 text-xs font-bold text-[#2D362E]"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#EAE7E0]">
                        <span className="text-[11px] text-emerald-800 font-bold">
                          {saveSuccessMsg || "Ready to commit to ROLI records"}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const shareText = `🤝 Closed Loan Milestone!\nBuyer: ${lead.fullName}\nLoan: $${loanAmount.toLocaleString()} (${loanProgram})\nCommission: $${grossCommission.toLocaleString()}\nFunding Date: ${fundingDate}\nJourney Speed: ${journeyDays} days\nCo-Brand Agent Partner: ${buyerAgent}`;
                              if (navigator.clipboard) {
                                navigator.clipboard.writeText(shareText);
                              }
                              setIsCopiedMilestone(true);
                              setTimeout(() => setIsCopiedMilestone(false), 2500);
                            }}
                            className="px-3.5 py-1.5 bg-[#FAF9F5] hover:bg-[#EAE7E0] text-[#4A5D4E] border border-[#EAE7E0] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                          >
                            <Share2 className="w-3.5 h-3.5 text-emerald-700" />
                            <span>{isCopiedMilestone ? "Copied!" : "Share Milestone With Agent"}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const calcRoli = adSpend > 0 ? Number((grossCommission / adSpend).toFixed(2)) : 0;
                              const updated: CapturedLead = {
                                ...lead,
                                status: "closed",
                                grossCommissionPaid: grossCommission,
                                fundingClosingDate: fundingDate,
                                fundedLoanAmount: loanAmount,
                                loanProgramName: loanProgram,
                                buyerAgentName: buyerAgent,
                                totalJourneyDays: journeyDays,
                                attributedAdSpend: adSpend,
                                roliMultiplier: calcRoli,
                                desiredPurchaseLocation: desiredLocation,
                                desiredLoanProgram: desiredProgram,
                              };
                              onUpdateLead?.(updated);
                              onUpdateLeadStatus(lead.id, "closed");
                              setSaveSuccessMsg("✓ Saved to Branch Manager ROLI ledger & status updated to Closed!");
                              setTimeout(() => setSaveSuccessMsg(null), 3000);
                            }}
                            className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Save &amp; Sync to ROLI Dashboard</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quick Share Milestone Bar */}
                  <div className="flex items-center justify-between text-xs text-[#606C5D] pt-1">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-[#C18C5D]" />
                      <strong>Program:</strong> {loanProgram} • <strong>Agent:</strong> {buyerAgent}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        const shareText = `🤝 Closed Loan Milestone!\nBuyer: ${lead.fullName}\nLoan: $${loanAmount.toLocaleString()} (${loanProgram})\nCommission: $${grossCommission.toLocaleString()}\nFunding Date: ${fundingDate}\nJourney Speed: ${journeyDays} days\nCo-Brand Agent Partner: ${buyerAgent}`;
                        if (navigator.clipboard) {
                          navigator.clipboard.writeText(shareText);
                        }
                        setIsCopiedMilestone(true);
                        setTimeout(() => setIsCopiedMilestone(false), 2500);
                      }}
                      className="text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>{isCopiedMilestone ? "Milestone Copied to Clipboard!" : "Copy Agent Share Snippet"}</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-white p-4 border-t border-[#EAE7E0] flex items-center justify-between shrink-0 gap-3">
          <div className="flex items-center gap-2">
            {lead.chatTranscript && lead.chatTranscript.length > 0 && (
              <button
                onClick={() => onViewTranscript(lead)}
                className="px-3.5 py-2 bg-[#FAF9F5] hover:bg-[#EAE7E0] text-[#4A5D4E] border border-[#EAE7E0] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#C18C5D]" />
                <span>View Full AI Transcript</span>
              </button>
            )}
            <button
              onClick={() => onOpenOutreachModal(lead.id)}
              className="px-3.5 py-2 bg-[#C18C5D] hover:bg-[#a6764c] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Draft AI Email Outreach</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#4A5D4E] hover:bg-[#38463B] text-white font-bold text-xs rounded-xl transition-all"
          >
            Close Lead Journey View
          </button>
        </div>
      </div>
    </div>
  );
};
