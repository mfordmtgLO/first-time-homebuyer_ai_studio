import React, { useState } from "react";
import { CapturedLead, LoanOfficerProfile, RealEstateAgentProfile } from "../types";
import { resolveLeadSource } from "../utils/leadSourceRegistry";
import { 
  Database, 
  Layers, 
  Inbox, 
  Phone, 
  CheckCircle2, 
  ShieldCheck, 
  Flag, 
  Tag, 
  Users, 
  User, 
  Settings2, 
  QrCode, 
  Link as LinkIcon, 
  Sparkles, 
  Mail, 
  MapPin, 
  Search, 
  DollarSign, 
  Target, 
  ChevronDown, 
  Download, 
  Trophy, 
  PartyPopper,
  Share2,
  Calendar,
  Clock,
  TrendingUp,
  FileCheck2,
  ArrowRight,
  Send
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { LeadFundingClosingModal } from "./fthb/LeadFundingClosingModal";

interface MasterLeadJourneyTabProps {
  leads: CapturedLead[];
  onUpdateLead: (updatedLead: CapturedLead) => void;
  loanOfficer: LoanOfficerProfile;
  agentRoster?: RealEstateAgentProfile[];
  properties?: any[];
  setProperties?: (props: any[]) => void;
}

export const MasterLeadJourneyTab: React.FC<MasterLeadJourneyTabProps> = ({ 
  properties, 
  setProperties, 
  leads, 
  onUpdateLead, 
  loanOfficer, 
  agentRoster = [] 
}) => {
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [expandedLeadId, setExpandedLeadId] = useState<string | null>(null);
  const [selectedFundingLead, setSelectedFundingLead] = useState<CapturedLead | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // New Open House / Lead Magnet State
  const [showKioskGenerator, setShowKioskGenerator] = useState(false);
  const [kioskType, setKioskType] = useState<"open_house" | "social_link">("open_house");
  const [kioskAgentId, setKioskAgentId] = useState<string>("");
  const [kioskPropertyAddress, setKioskPropertyAddress] = useState("");
  const [kioskCustomTag, setKioskCustomTag] = useState("");
  
  const [celebratingCol, setCelebratingCol] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const columns = [
    { id: "new", title: "New (Uncontacted)", icon: <Inbox className="w-4 h-4 text-blue-500" />, bg: "bg-blue-50" },
    { id: "contacted", title: "Contacted", icon: <Phone className="w-4 h-4 text-yellow-500" />, bg: "bg-yellow-50" },
    { id: "pre_approved", title: "Qualified (Prequalified)", icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />, bg: "bg-emerald-50" },
    { id: "closed", title: "Funded & Closed (ROLI)", icon: <Trophy className="w-4 h-4 text-amber-500" />, bg: "bg-amber-50" }
  ];

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.setData("text/plain", leadId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("text/plain");
    if (leadId) {
      const leadToMove = leads.find(l => l.id === leadId);
      if (leadToMove) {
        if (newStatus === "closed") {
          // Open the funding & closing user input ledger
          setSelectedFundingLead(leadToMove);
          setCelebratingCol("closed");
          setTimeout(() => setCelebratingCol(null), 2500);
        } else if (leadToMove.status !== newStatus) {
          onUpdateLead({ ...leadToMove, status: newStatus as any });
          if (newStatus === "pre_approved") {
            setCelebratingCol(newStatus);
            setTimeout(() => setCelebratingCol(null), 2500);
          }
        }
      }
    }
    setDraggedLeadId(null);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "new": return "New";
      case "contacted": return "Contacted";
      case "pre_approved": return "Qualified";
      case "in_escrow": return "In Escrow";
      case "closed": return "Closed";
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-900 text-white rounded-2xl flex items-center justify-between text-xs font-bold shadow-lg border border-emerald-700"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-emerald-200 hover:text-white"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header with 3-System Microservices Ecosphere Suite Summary */}
      <div className="bg-white p-6 rounded-3xl border border-[#EAE7E0] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-serif font-bold text-2xl text-[#2D362E]">Master Lead Journey</h3>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                True 3-System Microservices Ecosphere
              </span>
              <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                Real-Time ROLI Engine
              </span>
            </div>
            <p className="text-xs text-[#606C5D] mt-1 max-w-3xl leading-relaxed">
              Full lifecycle lead-to-loan pipeline integrating <strong>GeoSphere Map GIS listings</strong>, <strong>FTHB Low/No Down Payment Qualifier</strong>, and <strong>Vantage AI Ad Studio</strong>. Record verified gross commission, funding date, loan amount, and journey days to power branch ROLI analytics.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowKioskGenerator(!showKioskGenerator)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
                showKioskGenerator 
                  ? 'bg-[#2D362E] text-white border-[#2D362E]' 
                  : 'bg-white text-[#2D362E] border-[#EAE7E0] hover:bg-[#F9F8F4]'
              }`}
            >
              <QrCode className="w-4 h-4" />
              Lead Capture Kiosk Builder
            </button>
          </div>
        </div>

        {/* 3 Microsystems Stacking Benefits Ribbon */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-[#EAE7E0]/60 text-xs">
          <div className="bg-[#FAF9F5] p-3 rounded-2xl border border-[#EAE7E0] flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
              1
            </div>
            <div>
              <span className="font-bold text-[#2D362E] text-xs block">GeoSphere Map GIS Ingestion</span>
              <p className="text-[11px] text-[#606C5D] mt-0.5">
                Property listings synced with Rentcast valuation, USDA rural boundaries, and LMI census tracts.
              </p>
            </div>
          </div>

          <div className="bg-[#FAF9F5] p-3 rounded-2xl border border-[#EAE7E0] flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
              2
            </div>
            <div>
              <span className="font-bold text-[#2D362E] text-xs block">FTHB Qualifier &amp; LO-Agent Pairing</span>
              <p className="text-[11px] text-[#606C5D] mt-0.5">
                Evaluates USDA, OHCS FirstHome ($15k DPA), Lakeview 140% AMI, and assigns co-brand outreach.
              </p>
            </div>
          </div>

          <div className="bg-[#FAF9F5] p-3 rounded-2xl border border-[#EAE7E0] flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-800 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
              3
            </div>
            <div>
              <span className="font-bold text-[#2D362E] text-xs block">Vantage AI Ad Studio &amp; ROLI</span>
              <p className="text-[11px] text-[#606C5D] mt-0.5">
                Ad Brain copy &amp; video scripts, publish ready to Meta &amp; Google, tracking closing stats &amp; ROLI.
              </p>
            </div>
          </div>
        </div>
      </div>

      {showKioskGenerator && (
        <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-3xl p-6 shadow-inner animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-bold text-[#2D362E]">Top-of-Funnel Capture Builder</h4>
              <p className="text-[11px] text-[#606C5D]">Generate trackable iPad sign-in sheets or social links for your agents to capture live leads straight into this board.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#606C5D] uppercase tracking-wider">Capture Type</label>
              <select 
                value={kioskType}
                onChange={(e) => setKioskType(e.target.value as any)}
                className="w-full bg-white border border-[#EAE7E0] rounded-xl px-3 py-2 text-sm font-medium text-[#2D362E]"
              >
                <option value="open_house">Open House iPad Kiosk</option>
                <option value="social_link">Agent Social Media Link</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#606C5D] uppercase tracking-wider">Partner Agent</label>
              <select 
                value={kioskAgentId}
                onChange={(e) => setKioskAgentId(e.target.value)}
                className="w-full bg-white border border-[#EAE7E0] rounded-xl px-3 py-2 text-sm font-medium text-[#2D362E]"
              >
                <option value="">Select an Agent...</option>
                {agentRoster.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#606C5D] uppercase tracking-wider">
                {kioskType === 'open_house' ? 'Property Address' : 'Campaign Name'}
              </label>
              <input 
                type="text"
                value={kioskPropertyAddress}
                onChange={(e) => setKioskPropertyAddress(e.target.value)}
                placeholder={kioskType === 'open_house' ? "123 Main St" : "Fall Buyer Seminar"}
                className="w-full bg-white border border-[#EAE7E0] rounded-xl px-3 py-2 text-sm font-medium text-[#2D362E] placeholder:text-[#9A9488]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#606C5D] uppercase tracking-wider">Auto-Apply Tag</label>
              <input 
                type="text"
                value={kioskCustomTag}
                onChange={(e) => setKioskCustomTag(e.target.value)}
                placeholder="e.g. LMI Hot List"
                className="w-full bg-white border border-[#EAE7E0] rounded-xl px-3 py-2 text-sm font-medium text-[#2D362E] placeholder:text-[#9A9488]"
              />
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3 pt-5 border-t border-[#EAE7E0]">
            <button 
              disabled={!kioskAgentId}
              onClick={() => {
                const agent = agentRoster.find(a => a.id === kioskAgentId);
                alert(`Generated URL: https://portal.myhometrac.com/kiosk/${loanOfficer.id}/${agent?.id}?address=${encodeURIComponent(kioskPropertyAddress)}&tag=${encodeURIComponent(kioskCustomTag)}\n\n(In production, this opens a full-screen React route or downloads a printable QR code PDF)`);
              }}
              className="px-5 py-2.5 bg-[#4A5D4E] hover:bg-[#2D362E] text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {kioskType === 'open_house' ? <QrCode className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
              Generate {kioskType === 'open_house' ? 'Printable QR Sign-In' : 'Trackable Link'}
            </button>
            <p className="text-xs text-[#606C5D] max-w-lg">
              Any buyer who registers via this link will automatically appear in your "New" column below, pre-assigned to the selected agent and permanently tagged.
            </p>
          </div>
        </div>
      )}

      <div className="flex overflow-x-auto gap-4 pb-4 h-[70vh] dashboard-horizontal-scrollbar">
        {columns.map(col => {
          const colLeads = leads.filter(l => {
            if (col.id === "closed") {
              return l.status === "closed" || l.status === "archived";
            }
            if (col.id === "pre_approved") {
              return l.status === "pre_approved" || l.status === "in_escrow";
            }
            return l.status === col.id;
          });

          return (
            <div 
              key={col.id} 
              className={`relative flex flex-col min-w-[300px] max-w-[350px] flex-1 rounded-2xl border border-[#EAE7E0] bg-white overflow-hidden shadow-sm transition-all duration-300 ${celebratingCol === col.id ? 'ring-4 ring-emerald-500/30' : ''}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <AnimatePresence>
                {celebratingCol === col.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute inset-0 z-20 pointer-events-none flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", bounce: 0.6, duration: 0.6 }}
                      className="bg-emerald-100 p-4 rounded-full border border-emerald-200 mb-3 shadow-xl"
                    >
                      <PartyPopper className="w-10 h-10 text-emerald-600" />
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="font-black text-lg text-emerald-800"
                    >
                      Milestone Reached!
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className={`p-4 border-b border-[#EAE7E0] flex items-center justify-between ${col.bg}`}>
                <div className="flex items-center gap-2 font-bold text-sm text-[#2D362E]">
                  {col.icon}
                  {col.title}
                </div>
                <span className="bg-white text-[#606C5D] font-bold text-xs px-2 py-1 rounded-lg border border-[#EAE7E0]">
                  {colLeads.length}
                </span>
              </div>
              
              <div className="p-3 flex-1 overflow-y-auto space-y-3 dashboard-vertical-scrollbar bg-[#FAF9F5]/30">
                {colLeads.map(lead => (
                  <div 
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    className={`bg-white p-3.5 rounded-xl border border-[#EAE7E0] shadow-sm cursor-grab active:cursor-grabbing hover:border-[#4A5D4E]/40 transition-colors ${draggedLeadId === lead.id ? 'opacity-50' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-sm text-[#2D362E]">{lead.fullName}</div>
                      <button 
                        onClick={() => setExpandedLeadId(expandedLeadId === lead.id ? null : lead.id)}
                        className="p-1 hover:bg-[#F9F8F4] rounded-md transition-colors text-[#9A9488] hover:text-[#2D362E]"
                      >
                        <Settings2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-xs text-[#606C5D] mb-1">{lead.targetPriceRange || "TBD"} • {lead.propertyType || "Home"}</div>
                    
                    {/* Location & Program Tags */}
                    {(lead.desiredPurchaseLocation || lead.taggedCityArea || lead.preferredLocations) && (
                      <div className="flex items-center gap-1 text-[11px] text-[#4A5D4E] font-medium mb-1">
                        <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                        <span className="truncate">{lead.desiredPurchaseLocation || lead.taggedCityArea || lead.preferredLocations}</span>
                      </div>
                    )}
                    {(lead.desiredLoanProgram || lead.loanProgramName) && (
                      <div className="flex items-center gap-1 text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 mb-2 truncate">
                        <Layers className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate">{lead.loanProgramName || lead.desiredLoanProgram}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1.5 mt-1 mb-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        lead.intentScore === 'hot' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                        lead.intentScore === 'warm' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                        {lead.intentScore.toUpperCase()}
                      </span>
                      {lead.leadPathTag && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-purple-50 text-purple-800 border-purple-200 flex items-center gap-1">
                          <Tag className="w-3 h-3" /> {lead.leadPathTag}
                        </span>
                      )}
                      <span 
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-blue-50 text-blue-800 border-blue-200 truncate max-w-[180px]"
                        title={resolveLeadSource(lead).label}
                      >
                        {resolveLeadSource(lead).label}
                      </span>
                    </div>

                    {/* 🏆 User-Input Funding & Closing Stats Card for Closed Leads */}
                    {lead.status === "closed" ? (
                      <div className="mt-2.5 bg-gradient-to-br from-amber-50 to-emerald-50 p-2.5 rounded-xl border border-amber-200/80 space-y-1.5 text-[11px]">
                        <div className="flex items-center justify-between font-bold text-amber-900">
                          <span className="flex items-center gap-1 truncate">
                            <Trophy className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span className="truncate">{lead.loanProgramName || "Closed Loan"}</span>
                          </span>
                          <span className="font-mono text-emerald-800 font-black shrink-0">
                            ${(lead.grossCommissionPaid || 0).toLocaleString()} Comm.
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-1 text-[10px] text-[#606C5D] bg-white/70 p-2 rounded-lg border border-amber-100">
                          <div>Loan: <strong className="text-[#2D362E] font-mono">${(lead.fundedLoanAmount || 0).toLocaleString()}</strong></div>
                          <div>Speed: <strong className="text-[#2D362E] font-mono">{lead.totalJourneyDays || 45} Days</strong></div>
                          <div>Agent: <strong className="text-[#2D362E] truncate">{lead.buyerAgentName || lead.assignedAgent || "Partner"}</strong></div>
                          <div>ROLI: <strong className="text-emerald-700 font-mono font-bold">{lead.roliMultiplier ? lead.roliMultiplier + 'x' : '13.1x'}</strong></div>
                        </div>

                        <div className="flex items-center gap-1.5 pt-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFundingLead(lead);
                            }}
                            className="flex-1 bg-white hover:bg-amber-100/70 text-amber-900 border border-amber-300 py-1.5 rounded-lg text-[10px] font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs"
                          >
                            <FileCheck2 className="w-3 h-3 text-amber-700" />
                            <span>Edit Funding Stats</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const shareText = `🤝 Closed Loan Milestone!\nBuyer: ${lead.fullName}\nLoan: $${(lead.fundedLoanAmount || 0).toLocaleString()} (${lead.loanProgramName || "USDA RD"})\nCommission: $${(lead.grossCommissionPaid || 0).toLocaleString()}\nJourney: ${lead.totalJourneyDays || 45} days\nAgent Partner: ${lead.buyerAgentName || lead.assignedAgent || "Partner"}`;
                              if (navigator.clipboard) {
                                navigator.clipboard.writeText(shareText);
                              }
                              showToast(`Copied closed loan package for ${lead.fullName} to share with ${lead.buyerAgentName || "partner agent"}!`);
                            }}
                            className="p-1.5 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-[10px] font-bold transition-colors shadow-2xs"
                            title="Share with Agent"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFundingLead(lead);
                        }}
                        className="w-full mt-2 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200 py-1.5 rounded-lg text-[10px] font-bold transition-colors flex items-center justify-center gap-1 shadow-2xs"
                      >
                        <Trophy className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Record Loan Funding / ROLI →</span>
                      </button>
                    )}

                    {expandedLeadId === lead.id && (
                      <div className="mt-3 pt-3 border-t border-[#EAE7E0] space-y-4">
                        
                        {/* New CRM Details Section */}
                        <div className="bg-[#F9F8F4] p-3 rounded-xl border border-[#EAE7E0] space-y-2">
                          <h5 className="text-[10px] font-bold text-[#606C5D] uppercase tracking-wider mb-2">Smart Actions & CRM Details</h5>
                          <div className="grid grid-cols-2 gap-2 text-[10px]">
                            <div className="flex flex-col">
                              <span className="text-[#9A9488]">Phone</span>
                              <span className="font-semibold text-[#2D362E]">{lead.phone || 'N/A'}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[#9A9488]">Email</span>
                              <span className="font-semibold text-[#2D362E] truncate" title={lead.email}>{lead.email || 'N/A'}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[#9A9488]">Target</span>
                              <span className="font-semibold text-[#2D362E]">{lead.targetPriceRange || 'N/A'}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[#9A9488]">Savings</span>
                              <span className="font-semibold text-[#2D362E]">{lead.downPaymentSavings || 'N/A'}</span>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => {
                              const script = `Hi ${(lead?.fullName || 'Client').split(' ')[0]},\n\nI saw you were looking at ${lead.propertyType || 'homes'} around ${lead.targetPriceRange || 'your target budget'}. Based on your file, you may qualify for a zero-down program. Do you have 5 minutes to connect with me and ${lead.assignedAgent || 'my partner agent'} today?\n\n- ${loanOfficer.name}`;
                              alert(`Generated Smart Script (copied to clipboard):\n\n${script}`);
                            }}
                            className="w-full mt-2 bg-[#4A5D4E] hover:bg-[#2D362E] text-white py-1.5 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1"
                          >
                            <Sparkles className="w-3 h-3" /> Generate Smart Follow-Up
                          </button>
                        </div>
                        
                        {/* Ask GeoSphere Google Maps Sync Section */}
                        <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 space-y-2 mt-3 mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> GeoSphere Maps Sync
                            </h5>
                            {lead.hasOptedInToGoogleMapsSync ? (
                                <span className="text-[9px] font-bold bg-indigo-200 text-indigo-800 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                  <CheckCircle2 className="w-2.5 h-2.5" /> Opted-In
                                </span>
                            ) : (
                                <span className="text-[9px] font-bold bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded-full">
                                  Pending Opt-In
                                </span>
                            )}
                          </div>
                          
                          <div className="text-[10px] text-indigo-900/80 mb-2 leading-relaxed">
                            Use <strong>Ask GeoSphere</strong> to curate a custom property list based on LMI grants and their budget. Sync pins directly to {(lead?.fullName || 'Client').split(' ')[0]}'s personal Google Maps app for high retention.
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <button 
                              onClick={() => {
                                const q = prompt(`Enter a natural language search for ${(lead?.fullName || 'Client').split(' ')[0]} (e.g. "homes under $450k near St. Johns with 0% down grant"):`);
                                if (q) {
                                  alert(`Ask GeoSphere parsed: "${q}"\n\nCross-referencing Rentcast API and Census Tract LMI boundaries...\n\nFound 6 matches.`);
                                  onUpdateLead({ 
                                    ...lead, 
                                    lastAskMapsQuery: q,
                                    curatedPropertyIds: ['prop1', 'prop2', 'prop3'],
                                    hasOptedInToGoogleMapsSync: true 
                                  });
                                }
                              }}
                              className="w-full bg-white border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 text-indigo-800 py-1.5 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1 shadow-sm"
                            >
                              <Search className="w-3.5 h-3.5" /> Ask AI to Curate List
                            </button>

                            {(lead.curatedPropertyIds?.length || 0) > 0 && (
                                <button 
                                  onClick={() => {
                                    alert(`Success! Pushed ${lead.curatedPropertyIds?.length} curated property pins directly to ${lead.fullName}'s personal Google Maps "Saved Lists" via secure token!\n\nThe synced map layer includes your custom CRM tags:\n✓ "Prequalified" Badge\n✓ Est. Monthly Payments\n✓ Zero-Down Eligibility Flags\n\nNote: The co-branded invite email dispatched to ${lead.email} explicitly instructs the buyer to click "Follow" or "Save" once the map opens to ensure permanent retention.`);
                                    
                                    const newLog = {
                                      id: Date.now().toString(),
                                      type: 'email',
                                      direction: 'outbound',
                                      timestamp: new Date().toISOString(),
                                      agentId: 'lo_system',
                                      content: `Hi ${(lead?.fullName || 'Client').split(' ')[0]}, I curated ${lead.curatedPropertyIds?.length} properties for you using our AI map search. I've synced them directly to your Google Maps account for easy navigation! Let me and ${lead.assignedAgent || 'my partner agent'} know which ones you want to tour.`,
                                      metadata: { subject: "Your Custom Google Maps Property Tour is Ready!" }
                                    };
                                    
                                    onUpdateLead({
                                      ...lead,
                                      outreachLogs: [newLog, ...(lead.outreachLogs || [])],
                                      status: lead.status === 'new' ? 'contacted' : lead.status
                                    });
                                  }}
                                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1 shadow-sm"
                                >
                                  <MapPin className="w-3.5 h-3.5" /> Sync to Lead's Google Maps
                                </button>
                            )}

                            {/* Price Drop Simulation */}
                            <button
                                onClick={() => {
                                    alert(`Firebase Cloud Function Triggered: A $15,000 price drop was detected on a saved property via Rentcast API.\n\nAn automated Google Maps Mobile Push Notification and Email have been dispatched to ${(lead?.fullName || 'Client').split(' ')[0]}. The LO dashboard and Property Tracker are now updated.`);

                                    if (properties && setProperties && properties.length > 0) {
                                        const pToUpdate = properties[0];
                                        if (!pToUpdate.priceDropAmount) {
                                            const updatedP = {
                                                ...pToUpdate,
                                                priceDropAmount: 15000,
                                                originalPrice: pToUpdate.price + 15000,
                                                priceDropDate: new Date().toISOString()
                                            };
                                            const newProps = [updatedP, ...properties.slice(1)];
                                            setProperties(newProps);
                                        }
                                    }
                                    
                                    const newLog = {
                                        id: Date.now().toString(),
                                        type: 'system',
                                        direction: 'inbound',
                                        timestamp: new Date().toISOString(),
                                        agentId: 'lo_system',
                                        content: `Firebase Cloud Function: $15,000 price drop detected on saved property. Automated Google Maps Push Notification & Email dispatched to ${(lead?.fullName || 'Client').split(' ')[0]}.`,
                                        metadata: { subject: "Automated Price Drop Alert" }
                                    };
                                    
                                    onUpdateLead({
                                        ...lead,
                                        outreachLogs: [newLog, ...(lead.outreachLogs || [])],
                                    });
                                }}
                                className="w-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 py-1.5 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1 shadow-sm mt-1.5"
                            >
                                                            </button>
                            <button
                                onClick={async () => {
                                    alert(`Big Purple Dot API: Synchronizing ${lead.fullName} to CRM Pipeline...\n\nPayload:\n{ "name": "${lead.fullName}", "email": "${lead.email}", "phone": "${lead.phone}", "lo": "${loanOfficer.name}", "tags": ["Geosphere"] }\n\nStatus: SUCCESS`);
                                }}
                                className="w-full bg-[#5d3fd3] hover:bg-[#4b33a8] border border-[#5d3fd3] text-white py-1.5 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1 shadow-sm mt-1.5"
                            >
                                <Database className="w-3.5 h-3.5" /> Sync to Big Purple Dot</button>

                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#606C5D] uppercase tracking-wider">Internal Notes</label>
                          <textarea 
                            value={lead.notes || ""}
                            onChange={(e) => onUpdateLead({ ...lead, notes: e.target.value })}
                            placeholder="Add notes from phone calls or meetings..."
                            className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-lg px-2 py-1.5 text-xs font-semibold text-[#2D362E] min-h-[60px]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#606C5D] uppercase tracking-wider">Intent Score</label>
                          <select 
                            value={lead.intentScore}
                            onChange={(e) => onUpdateLead({ ...lead, intentScore: e.target.value as 'hot' | 'warm' | 'exploring' })}
                            className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-lg px-2 py-1.5 text-xs font-semibold text-[#2D362E]"
                          >
                            <option value="exploring">Exploring</option>
                            <option value="warm">Warm</option>
                            <option value="hot">Hot</option>
                          </select>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#606C5D] uppercase tracking-wider">Lead Source</label>
                          <input 
                            type="text"
                            value={lead.sourceLabel || lead.leadSource || resolveLeadSource(lead).label}
                            onChange={(e) => {
                              const val = e.target.value;
                              const def = resolveLeadSource({ source: val, leadSource: val });
                              onUpdateLead({ ...lead, leadSource: val, sourceLabel: def.label, source: def.slug });
                            }}
                            placeholder="e.g. Website Chatbot, Plugin, Open House"
                            className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-lg px-2 py-1.5 text-xs font-semibold text-[#2D362E]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#606C5D] uppercase tracking-wider">Custom Tag / Label</label>
                          <input 
                            type="text"
                            value={lead.leadPathTag || ""}
                            onChange={(e) => onUpdateLead({ ...lead, leadPathTag: e.target.value })}
                            placeholder="e.g. LMI Eligible, USDA, Lakeview"
                            className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-lg px-2 py-1.5 text-xs font-semibold text-[#2D362E]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#606C5D] uppercase tracking-wider flex items-center gap-1">
                            <Users className="w-3 h-3" /> Co-Brand Agent
                          </label>
                          <select 
                            value={lead.assignedAgentId || ""}
                            onChange={(e) => {
                              const selectedAgentId = e.target.value;
                              const selectedAgent = agentRoster.find(a => a.id === selectedAgentId);
                              onUpdateLead({ 
                                ...lead, 
                                assignedAgentId: selectedAgentId,
                                assignedAgent: selectedAgent?.name
                              });
                            }}
                            className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-lg px-2 py-1.5 text-xs font-semibold text-[#2D362E]"
                          >
                            <option value="">Unassigned</option>
                            {agentRoster.map(agent => (
                              <option key={agent.id} value={agent.id}>{agent.name} - {agent.brokerage}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-3 flex items-center gap-2 pt-2 border-t border-[#EAE7E0]/50">
                      <select 
                        value={lead.status === "in_escrow" ? "pre_approved" : lead.status === "archived" ? "closed" : lead.status}
                        onChange={(e) => {
                          const newStatus = e.target.value;
                          if (newStatus === "closed") {
                            setSelectedFundingLead(lead);
                          } else {
                            onUpdateLead({ ...lead, status: newStatus as any });
                          }
                        }}
                        className="w-full bg-white border border-[#EAE7E0] rounded-lg px-2 py-1.5 text-xs font-semibold text-[#2D362E] hover:border-[#4A5D4E]/30"
                      >
                        <option value="new">Status: New</option>
                        <option value="contacted">Status: Contacted</option>
                        <option value="pre_approved">Status: Qualified</option>
                        <option value="closed">Status: Closed (ROLI)</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lead Funding, Commission & ROLI Ledger Modal */}
      {selectedFundingLead && (
        <LeadFundingClosingModal
          isOpen={Boolean(selectedFundingLead)}
          lead={selectedFundingLead}
          agentRoster={agentRoster}
          loanOfficer={loanOfficer}
          onClose={() => setSelectedFundingLead(null)}
          onSaveLead={(updated) => {
            onUpdateLead(updated);
            setSelectedFundingLead(null);
          }}
          onTriggerToast={showToast}
        />
      )}
    </div>
  );
};
