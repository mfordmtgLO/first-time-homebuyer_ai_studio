import React, { useState } from "react";
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
  Phone, 
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
  Key,
  LogOut,
  ShieldAlert,
  KeyRound,
  AlertTriangle
} from "lucide-react";
import { 
  LoanOfficerProfile, 
  RealEstateAgentProfile, 
  LOPairing, 
  ProfessionalGuidesState,
  SocialPushCampaign,
  AdCampaignDraft,
  LoanOfficerAdSettings,
  CapturedLead
} from "../types";
import { SocialPushHub } from "./SocialPushHub";
import { AdsCampaignHub } from "./AdsCampaignHub";
import { LoanOfficerLoginView } from "./LoanOfficerLoginView";
import { StateLicensingSelector } from "./StateLicensingSelector";

interface LoanOfficerPortalProps {
  guidesState: ProfessionalGuidesState;
  onUpdateGuidesState: (newState: ProfessionalGuidesState) => void;
  onClose: () => void;
  onViewPublicSite: () => void;
}

export const LoanOfficerPortal: React.FC<LoanOfficerPortalProps> = ({
  guidesState,
  onUpdateGuidesState,
  onClose,
  onViewPublicSite,
}) => {
  // Authentication & Session State (loaded from localStorage)
  const [authenticatedLoId, setAuthenticatedLoId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("lo_portal_auth_id") || null;
    }
    return null;
  });

  // Current user / viewing context
  const [activeTab, setActiveTab] = useState<"leads" | "team_distribution" | "pairings" | "realtor_roster" | "my_profile" | "social_push" | "ad_campaigns">("leads");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Password Management Modal State
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [newPasswordInput, setNewPasswordInput] = useState<string>("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>("");
  const [passwordModalError, setPasswordModalError] = useState<string | null>(null);

  // Determine Logged In User Identity
  const loggedInUser: LoanOfficerProfile = 
    guidesState.loanOfficers.find(l => l.id === authenticatedLoId) || 
    guidesState.loanOfficers[0];

  const isAdminUser = Boolean(loggedInUser?.isAdmin || loggedInUser?.id === guidesState.adminLoanOfficerId);

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
  const [viewingTranscriptLead, setViewingTranscriptLead] = useState<CapturedLead | null>(null);

  // Modals / Editors
  const [showAddLoModal, setShowAddLoModal] = useState<boolean>(false);
  const [editingLo, setEditingLo] = useState<LoanOfficerProfile | null>(null);
  const [showAddAgentModal, setShowAddAgentModal] = useState<boolean>(false);
  const [editingAgent, setEditingAgent] = useState<RealEstateAgentProfile | null>(null);
  const [showAddPairingModal, setShowAddPairingModal] = useState<boolean>(false);
  const [editingPairing, setEditingPairing] = useState<LOPairing | null>(null);

  // New LO Form State
  const [newLoForm, setNewLoForm] = useState<Partial<LoanOfficerProfile> & { initialPassword?: string }>({
    name: "",
    title: "Mortgage Advisor",
    nmlsId: "NMLS #",
    company: "Pacific Coast Lending Partners",
    branch: "Pacific Northwest Branch",
    email: "",
    phone: "",
    headshotUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
    bio: "Dedicated mortgage specialist helping first-time homebuyers secure the best rates and state grant programs.",
    specialties: ["First-Time Homebuyers", "FHA & Conventional", "State DPA Grants"],
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
    headshotUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80",
    bio: "Passionate about guiding first-time buyers through neighborhood selection and structuring winning offers.",
    specialties: ["First-Time Homebuyers", "Offer Negotiation", "Neighborhood Tours"],
    marketAreas: ["Portland Metro", "Beaverton", "Gresham"],
    websiteUrl: ""
  });

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

  // Sign out / Lock Hub
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("lo_portal_auth_id");
    }
    setAuthenticatedLoId(null);
    triggerToast("Loan Officer Hub locked.");
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
        company: newLoForm.company || "Pacific Coast Lending Partners",
        branch: newLoForm.branch || "Pacific Northwest Branch",
        email: newLoForm.email || "",
        phone: newLoForm.phone || "",
        headshotUrl: newLoForm.headshotUrl || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&auto=format&fit=crop&q=80",
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
        company: "Pacific Coast Lending Partners",
        branch: "Pacific Northwest Branch",
        email: "",
        phone: "",
        headshotUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
        bio: "Dedicated mortgage specialist helping first-time homebuyers secure the best rates and state grant programs.",
        specialties: ["First-Time Homebuyers", "FHA & Conventional", "State DPA Grants"],
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
        headshotUrl: newAgentForm.headshotUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80",
        bio: newAgentForm.bio || "",
        specialties: newAgentForm.specialties || ["First-Time Homebuyers"],
        marketAreas: newAgentForm.marketAreas || ["Portland Metro"],
        websiteUrl: newAgentForm.websiteUrl || "",
        assignedLoIds: [currentLo.id],
        customSlug: (newAgentForm.name || "agent").toLowerCase().replace(/\s+/g, "-")
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
        headshotUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80",
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

  // Save/Create New Pairing
  const handleSavePairing = (e: React.FormEvent) => {
    e.preventDefault();
    const lo = guidesState.loanOfficers.find(l => l.id === newPairingForm.loId) || currentLo;
    const agent = guidesState.agentRoster.find(a => a.id === newPairingForm.agentId) || guidesState.agentRoster[0];

    const pairingId = `pair-${Date.now()}`;
    const slug = newPairingForm.customSlug || `${lo.name.split(" ")[0].toLowerCase()}-and-${agent.name.split(" ")[0].toLowerCase()}`;

    const createdPairing: LOPairing = {
      id: pairingId,
      loId: lo.id,
      agentId: agent.id,
      title: newPairingForm.title || `${lo.name} + ${agent.name} Homebuyer Team`,
      customSlug: slug,
      campaignTag: newPairingForm.campaignTag || "partner-co-marketing",
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

  // Lead Management Handlers
  const handleUpdateLeadStatus = (leadId: string, newStatus: CapturedLead['status']) => {
    const currentLeads = guidesState.leads || [];
    const updated = currentLeads.map(l => l.id === leadId ? { ...l, status: newStatus } : l);
    onUpdateGuidesState({
      ...guidesState,
      leads: updated
    });
    triggerToast(`Lead status updated to: ${newStatus.toUpperCase()}`);
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
      "Grant Interest",
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

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
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
  const origin = typeof window !== "undefined" ? window.location.origin : "https://homebuyer-roadmap.app";
  const activePairingUrl = `${origin}/?lo=${currentLo.id}&agent=${activeAgent?.id || ""}`;

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
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Brand & Logged-In User Badge */}
          <div className="flex items-center gap-3.5 flex-wrap">
            <div className="w-10 h-10 rounded-2xl bg-[#4A5D4E] text-white flex items-center justify-center font-serif font-bold text-lg shadow-sm shrink-0">
              M
            </div>
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

            {/* Password Change Button */}
            <button
              onClick={() => {
                setPasswordModalError(null);
                setNewPasswordInput("");
                setConfirmPasswordInput("");
                setShowPasswordModal(true);
              }}
              title="Change private password"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF9F5] border border-[#EAE7E0] hover:bg-[#F1EFE9] text-xs font-semibold text-[#2D362E] transition-colors"
            >
              <Key className="w-3.5 h-3.5 text-[#4A5D4E]" />
              <span className="hidden sm:inline">Password</span>
            </button>

            {/* Preview Public Site Button */}
            <button
              onClick={onViewPublicSite}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#EAE7E0] hover:bg-[#F9F8F4] text-xs font-semibold text-[#4A5D4E] transition-colors shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Preview Live Site</span>
            </button>

            {/* Sign Out / Lock Hub Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold transition-colors shadow-2xs"
              title="Lock portal & return to sign in"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Lock Hub</span>
            </button>

            {/* Exit Portal Button */}
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-[#2D362E] hover:bg-[#1E241F] text-white text-xs font-bold transition-colors shadow-2xs"
            >
              Exit
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 space-y-6">
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
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#EAE7E0]">
          <button
            onClick={() => setActiveTab("leads")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === "leads"
                ? "bg-[#4A5D4E] text-white shadow-xs"
                : "bg-white text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F9F8F4]"
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

          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab("team_distribution")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === "team_distribution"
                  ? "bg-[#4A5D4E] text-white shadow-xs"
                  : "bg-white text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F9F8F4]"
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

          <button
            onClick={() => setActiveTab("pairings")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === "pairings"
                ? "bg-[#4A5D4E] text-white shadow-xs"
                : "bg-white text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F9F8F4]"
            }`}
          >
            <Link className="w-4 h-4" />
            <span>LO + Agent Pairings & Custom Links ({guidesState.pairings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("realtor_roster")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === "realtor_roster"
                ? "bg-[#4A5D4E] text-white shadow-xs"
                : "bg-white text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F9F8F4]"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Realtor Partner Roster ({guidesState.agentRoster.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("my_profile")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === "my_profile"
                ? "bg-[#4A5D4E] text-white shadow-xs"
                : "bg-white text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F9F8F4]"
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit My Loan Officer Profile</span>
          </button>

          <button
            onClick={() => setActiveTab("social_push")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === "social_push"
                ? "bg-[#C18C5D] text-white shadow-xs"
                : "bg-white text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F9F8F4]"
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>Social Push & CRM Blasts</span>
          </button>

          <button
            onClick={() => setActiveTab("ad_campaigns")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === "ad_campaigns"
                ? "bg-[#1877F2] text-white shadow-xs"
                : "bg-white text-[#606C5D] border border-[#EAE7E0] hover:bg-[#F9F8F4]"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Meta & Google Ads Campaign Builder</span>
          </button>
        </div>

        {/* Tab 0: Leads & Inquiries CRM */}
        {activeTab === "leads" && (
          <div className="space-y-6">
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

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleExportLeadsCSV}
                  className="px-4 py-2.5 bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Download className="w-4 h-4 text-[#E7C19D]" />
                  <span>Export to CSV / CRM</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            {(() => {
              const allLeads = guidesState.leads || [];
              const hotCount = allLeads.filter(l => l.intentScore === "hot" || l.timeline.includes("30-60")).length;
              const grantsCount = allLeads.filter(l => l.grantInterest).length;
              const newCount = allLeads.filter(l => l.status === "new").length;
              const preApprovedCount = allLeads.filter(l => l.status === "pre_approved").length;

              return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-[#EAE7E0] shadow-2xs">
                    <div className="flex items-center justify-between text-xs text-[#606C5D]">
                      <span>Total Captured Leads</span>
                      <Inbox className="w-4 h-4 text-[#4A5D4E]" />
                    </div>
                    <div className="text-2xl font-serif font-bold text-[#2D362E] mt-1">{allLeads.length}</div>
                    <div className="text-[10px] text-emerald-600 font-semibold mt-1">From all channels & pairings</div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#EAE7E0] shadow-2xs">
                    <div className="flex items-center justify-between text-xs text-[#606C5D]">
                      <span>Hot / Ready Now</span>
                      <Flame className="w-4 h-4 text-orange-500" />
                    </div>
                    <div className="text-2xl font-serif font-bold text-orange-600 mt-1">{hotCount}</div>
                    <div className="text-[10px] text-[#606C5D] mt-1">Purchasing within 30-60 days</div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#EAE7E0] shadow-2xs">
                    <div className="flex items-center justify-between text-xs text-[#606C5D]">
                      <span>Grant / DPA Inquiries</span>
                      <Award className="w-4 h-4 text-[#C18C5D]" />
                    </div>
                    <div className="text-2xl font-serif font-bold text-[#C18C5D] mt-1">{grantsCount}</div>
                    <div className="text-[10px] text-[#606C5D] mt-1">First-time buyer grant seekers</div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#EAE7E0] shadow-2xs">
                    <div className="flex items-center justify-between text-xs text-[#606C5D]">
                      <span>Action Needed (New)</span>
                      <Clock className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="text-2xl font-serif font-bold text-blue-600 mt-1">{newCount}</div>
                    <div className="text-[10px] text-[#606C5D] mt-1">{preApprovedCount} pre-approved to date</div>
                  </div>
                </div>
              );
            })()}

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-[#EAE7E0] flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-[#9A9488] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  placeholder="Search lead name, email, phone, city..."
                  value={leadSearchQuery}
                  onChange={(e) => setLeadSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl text-xs text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
                {/* Status Filter */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-[#606C5D] font-semibold">Status:</span>
                  <select
                    value={leadStatusFilter}
                    onChange={(e) => setLeadStatusFilter(e.target.value)}
                    className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#2D362E] focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="new">New (Uncontacted)</option>
                    <option value="contacted">Contacted</option>
                    <option value="pre_approved">Pre-Approved</option>
                    <option value="in_escrow">In Escrow</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                {/* Loan Officer Filter */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-[#606C5D] font-semibold">Assigned LO:</span>
                  <select
                    value={leadLoFilter}
                    onChange={(e) => setLeadLoFilter(e.target.value)}
                    className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#2D362E] focus:outline-none"
                  >
                    <option value="all">All Loan Officers</option>
                    {guidesState.loanOfficers.map(lo => (
                      <option key={lo.id} value={lo.id}>{lo.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Leads Cards Grid */}
            {(() => {
              const allLeads = guidesState.leads || [];
              const filtered = allLeads.filter(lead => {
                const matchQuery = !leadSearchQuery || 
                  lead.fullName.toLowerCase().includes(leadSearchQuery.toLowerCase()) ||
                  lead.email.toLowerCase().includes(leadSearchQuery.toLowerCase()) ||
                  lead.phone.toLowerCase().includes(leadSearchQuery.toLowerCase()) ||
                  lead.preferredLocations.toLowerCase().includes(leadSearchQuery.toLowerCase());
                
                const matchStatus = leadStatusFilter === "all" || lead.status === leadStatusFilter;
                const matchLo = leadLoFilter === "all" || lead.assignedLoId === leadLoFilter;

                return matchQuery && matchStatus && matchLo;
              });

              if (filtered.length === 0) {
                return (
                  <div className="bg-white p-12 rounded-3xl border border-[#EAE7E0] text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#FAF9F5] text-[#4A5D4E] flex items-center justify-center mx-auto">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <h4 className="font-serif font-bold text-lg text-[#2D362E]">No Leads Match Your Filters</h4>
                    <p className="text-xs text-[#606C5D] max-w-md mx-auto">
                      Try adjusting your search query or status filter, or test the 24/7 AI Lead Intake Chatbot on the public homebuyer site to generate a new live lead.
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {filtered.map(lead => {
                    const assignedLo = guidesState.loanOfficers.find(o => o.id === lead.assignedLoId);
                    const assignedAgent = guidesState.agentRoster.find(a => a.id === lead.assignedAgentId);

                    return (
                      <div 
                        key={lead.id} 
                        className="bg-white rounded-3xl border border-[#EAE7E0] p-6 shadow-sm hover:shadow-md transition-shadow space-y-5"
                      >
                        {/* Top Row: Buyer Name & Status Controls */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EAE7E0]">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-[#4A5D4E] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                              {lead.fullName.split(" ").map(n => n[0]).slice(0, 2).join("")}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-base text-[#2D362E]">{lead.fullName}</h4>
                                {lead.intentScore === "hot" && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                                    <Flame className="w-3 h-3 text-orange-600 fill-orange-500" />
                                    <span>Hot Lead</span>
                                  </span>
                                )}
                                {lead.grantInterest && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                                    Grant Seeking
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-[#606C5D] mt-0.5 flex-wrap">
                                <span>{lead.leadSource}</span>
                                <span>•</span>
                                <span>{new Date(lead.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
                              </div>
                            </div>
                          </div>

                          {/* Status Selector Dropdown */}
                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            <span className="text-[11px] font-semibold text-[#606C5D]">Status:</span>
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
                          </div>
                        </div>

                        {/* Middle Grid: Buyer Financial Profile & Goal Parameters */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                          <div className="bg-[#FAF9F5] p-3 rounded-2xl border border-[#EAE7E0]/80">
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#9A9488] block">Timeline</span>
                            <span className="font-bold text-[#2D362E] block mt-0.5">{lead.timeline}</span>
                          </div>

                          <div className="bg-[#FAF9F5] p-3 rounded-2xl border border-[#EAE7E0]/80">
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#9A9488] block">Target Price / Budget</span>
                            <span className="font-bold text-[#4A5D4E] block mt-0.5">{lead.targetPriceRange}</span>
                          </div>

                          <div className="bg-[#FAF9F5] p-3 rounded-2xl border border-[#EAE7E0]/80">
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#9A9488] block">Down Payment</span>
                            <span className="font-semibold text-[#2D362E] block mt-0.5">{lead.downPaymentSavings}</span>
                          </div>

                          <div className="bg-[#FAF9F5] p-3 rounded-2xl border border-[#EAE7E0]/80">
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#9A9488] block">Credit Tier</span>
                            <span className="font-semibold text-[#2D362E] block mt-0.5">{lead.creditScoreTier}</span>
                          </div>

                          <div className="bg-[#FAF9F5] p-3 rounded-2xl border border-[#EAE7E0]/80">
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#9A9488] block">Target Areas</span>
                            <span className="font-semibold text-[#2D362E] block mt-0.5 truncate" title={lead.preferredLocations}>
                              {lead.preferredLocations}
                            </span>
                          </div>

                          <div className="bg-[#FAF9F5] p-3 rounded-2xl border border-[#EAE7E0]/80">
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#9A9488] block">Best Time</span>
                            <span className="font-semibold text-[#2D362E] block mt-0.5 truncate" title={lead.preferredContactTime}>
                              {lead.preferredContactTime}
                            </span>
                          </div>
                        </div>

                        {/* Attribution & Action Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                          <div className="flex items-center gap-4 text-xs text-[#606C5D] flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold">LO Assigned:</span>
                              <span className="font-bold text-[#2D362E]">{assignedLo?.name || "Mike Ford"}</span>
                            </div>
                            {assignedAgent && (
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold">Partner Agent:</span>
                                <span className="font-bold text-[#2D362E]">{assignedAgent.name}</span>
                              </div>
                            )}
                          </div>

                          {/* 1-Click Action Buttons */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <a
                              href={`tel:${lead.phone}`}
                              className="px-3 py-1.5 bg-[#FAF9F5] hover:bg-[#F1EFE9] border border-[#EAE7E0] text-[#2D362E] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5 text-[#4A5D4E]" />
                              <span>{lead.phone}</span>
                            </a>

                            <a
                              href={`mailto:${lead.email}?subject=Your First-Time Homebuyer Pre-Approval Blueprint&body=Hi ${lead.fullName.split(" ")[0]},%0D%0A%0D%0AThank you for completing your intake on our portal. Based on your target budget of ${lead.targetPriceRange} and timeline (${lead.timeline}), we have prepared your customized mortgage and grant options.%0D%0A%0D%0ALet's connect at your preferred time: ${lead.preferredContactTime}.%0D%0A%0D%0ABest regards,%0D%0A${assignedLo?.name || "Mike Ford"}%0D%0ANMLS #${assignedLo?.nmlsId || "184209"}`}
                              className="px-3 py-1.5 bg-[#FAF9F5] hover:bg-[#F1EFE9] border border-[#EAE7E0] text-[#2D362E] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                            >
                              <Mail className="w-3.5 h-3.5 text-[#4A5D4E]" />
                              <span>Email Blueprint</span>
                            </a>

                            {lead.chatTranscript && lead.chatTranscript.length > 0 && (
                              <button
                                onClick={() => setViewingTranscriptLead(lead)}
                                className="px-3 py-1.5 bg-[#F1EFE9] hover:bg-[#EAE7E0] text-[#4A5D4E] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>Chat Transcript ({lead.chatTranscript.length})</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteLead(lead.id)}
                              className="p-1.5 text-[#9A9488] hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                              title="Delete lead"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
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

              <button
                onClick={() => setShowAddLoModal(true)}
                className="px-5 py-2.5 bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Downstream Loan Officer</span>
              </button>
            </div>

            {/* Team LO Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {guidesState.loanOfficers.map(lo => {
                const loUrl = `${origin}/?lo=${lo.id}`;
                const loPairings = guidesState.pairings.filter(p => p.loId === lo.id);
                const isMike = lo.isAdmin;

                return (
                  <div 
                    key={lo.id}
                    className={`bg-white rounded-3xl border ${
                      currentLo.id === lo.id ? "border-[#4A5D4E] ring-2 ring-[#4A5D4E]/20" : "border-[#EAE7E0]"
                    } p-6 space-y-4 shadow-sm flex flex-col justify-between relative overflow-hidden`}
                  >
                    {isMike && (
                      <div className="absolute top-0 right-0 px-3 py-1 bg-amber-500 text-white text-[10px] font-bold rounded-bl-xl uppercase tracking-wider">
                        Branch Manager / Admin
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="flex items-start gap-3.5">
                        <img
                          src={lo.headshotUrl}
                          alt={lo.name}
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md shrink-0"
                        />
                        <div className="space-y-0.5">
                          <h4 className="font-serif font-bold text-base text-[#2D362E] flex items-center gap-1.5">
                            <span>{lo.name}</span>
                            <ShieldCheck className="w-3.5 h-3.5 text-[#4A5D4E]" />
                          </h4>
                          <p className="text-xs font-semibold text-[#4A5D4E]">{lo.title}</p>
                          <p className="text-[11px] text-[#9A9488]">{lo.nmlsId} • {lo.branch || lo.company}</p>
                        </div>
                      </div>

                      <p className="text-xs text-[#606C5D] line-clamp-2 leading-relaxed">
                        {lo.bio}
                      </p>

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

                      {/* Branded Distribution Link */}
                      <div className="space-y-1 bg-[#F9F8F4] p-2.5 rounded-xl border border-[#EAE7E0]">
                        <span className="text-[10px] font-bold text-[#606C5D] uppercase tracking-wider">Distributed Public URL:</span>
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            readOnly
                            value={loUrl}
                            className="bg-white border border-[#EAE7E0] rounded-lg px-2 py-1 text-[11px] font-mono text-[#4A5D4E] w-full focus:outline-none"
                          />
                          <button
                            onClick={() => copyToClipboard(loUrl, `lo-url-${lo.id}`)}
                            className="p-1.5 bg-white hover:bg-[#F1EFE9] border border-[#EAE7E0] rounded-lg text-xs font-bold text-[#4A5D4E] shrink-0"
                            title="Copy LO Public Link"
                          >
                            {copiedKey === `lo-url-${lo.id}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
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
                const pairingFullUrl = `${origin}/?lo=${lo.id}&agent=${agent?.id || ""}`;
                const isActive = guidesState.loanOfficer.id === lo.id && guidesState.activeAgentId === agent?.id;

                return (
                  <div
                    key={pairing.id}
                    className={`bg-white rounded-3xl border ${
                      isActive ? "border-[#4A5D4E] ring-2 ring-[#4A5D4E]/20" : "border-[#EAE7E0]"
                    } p-6 space-y-4 shadow-sm flex flex-col justify-between`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-3">
                        <div>
                          <h4 className="font-serif font-bold text-base text-[#2D362E]">
                            {pairing.title}
                          </h4>
                          <span className="text-[10px] text-[#9A9488] font-mono">
                            Campaign Tag: #{pairing.campaignTag || "co-marketing"}
                          </span>
                        </div>
                        {isActive && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Live on Public Site
                          </span>
                        )}
                      </div>

                      {/* Dual Headshots */}
                      <div className="grid grid-cols-2 gap-3 bg-[#F9F8F4] p-3.5 rounded-2xl border border-[#EAE7E0]">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={lo.headshotUrl}
                            alt={lo.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-xl object-cover border border-white shadow-xs shrink-0"
                          />
                          <div>
                            <span className="text-[9px] font-bold text-[#4A5D4E] uppercase">Loan Officer</span>
                            <p className="font-bold text-xs text-[#2D362E]">{lo.name}</p>
                            <p className="text-[10px] text-[#9A9488]">{lo.nmlsId}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <img
                            src={agent?.headshotUrl}
                            alt={agent?.name}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-xl object-cover border border-white shadow-xs shrink-0"
                          />
                          <div>
                            <span className="text-[9px] font-bold text-[#C18C5D] uppercase">Real Estate Agent</span>
                            <p className="font-bold text-xs text-[#2D362E]">{agent?.name}</p>
                            <p className="text-[10px] text-[#9A9488]">{agent?.brokerage}</p>
                          </div>
                        </div>
                      </div>

                      {/* URL Box */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-[#606C5D] uppercase tracking-wider">
                          Co-Branded Marketing Link:
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={pairingFullUrl}
                            className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-3 py-1.5 text-xs font-mono text-[#4A5D4E] focus:outline-none"
                          />
                          <button
                            onClick={() => copyToClipboard(pairingFullUrl, `pair-url-${pairing.id}`)}
                            className="px-3 py-1.5 bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-bold rounded-xl transition-colors shrink-0 flex items-center gap-1"
                          >
                            {copiedKey === `pair-url-${pairing.id}` ? (
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
                          href={pairingFullUrl}
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
                        {guidesState.pairings.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = guidesState.pairings.filter(p => p.id !== pairing.id);
                              onUpdateGuidesState({ ...guidesState, pairings: updated });
                              triggerToast("Pairing removed");
                            }}
                            className="text-[#9A9488] hover:text-red-600 p-1 transition-colors"
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#EAE7E0] shadow-sm">
              <div>
                <h3 className="font-serif font-bold text-2xl text-[#2D362E]">
                  Real Estate Agent Partner Roster
                </h3>
                <p className="text-xs text-[#606C5D] mt-1 max-w-2xl">
                  Manage your verified Realtor agent partners. Add new agent profiles, headshots, contact information, and market areas to pair with your loan officer team.
                </p>
              </div>

              <button
                onClick={() => setShowAddAgentModal(true)}
                className="px-5 py-2.5 bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Real Estate Agent Partner</span>
              </button>
            </div>

            {/* Agent Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {guidesState.agentRoster.map(agent => {
                const isSelected = guidesState.activeAgentId === agent.id;

                return (
                  <div
                    key={agent.id}
                    className={`bg-white rounded-3xl border ${
                      isSelected ? "border-[#C18C5D] ring-2 ring-[#C18C5D]/20" : "border-[#EAE7E0]"
                    } p-6 space-y-4 shadow-sm flex flex-col justify-between`}
                  >
                    <div className="space-y-4">
                      <div className="flex items-start gap-3.5">
                        <img
                          src={agent.headshotUrl}
                          alt={agent.name}
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md shrink-0"
                        />
                        <div className="space-y-0.5">
                          <h4 className="font-serif font-bold text-base text-[#2D362E]">
                            {agent.name}
                          </h4>
                          <p className="text-xs font-semibold text-[#C18C5D]">{agent.title}</p>
                          <p className="text-[11px] text-[#9A9488]">{agent.brokerage} • {agent.licenseNumber}</p>
                        </div>
                      </div>

                      <p className="text-xs text-[#606C5D] line-clamp-3 leading-relaxed">
                        {agent.bio}
                      </p>

                      <div className="space-y-1 pt-2 border-t border-[#EAE7E0]">
                        <span className="text-[10px] font-bold text-[#9A9488] uppercase tracking-wider">Market Areas:</span>
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
                          onClick={() => setEditingAgent(agent)}
                          className="p-2 text-[#606C5D] hover:text-[#2D362E] hover:bg-[#F1EFE9] rounded-xl transition-colors"
                          title="Edit Agent"
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
                  <span className="text-[11px] text-[#9A9488]">Upload local file or paste image link</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 pt-1">
                  <div className="relative shrink-0">
                    <img
                      src={currentLo.headshotUrl || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&auto=format&fit=crop&q=80"}
                      alt={currentLo.name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md bg-[#EAE7E0]"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&auto=format&fit=crop&q=80";
                      }}
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
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (uploadEvent) => {
                                const result = uploadEvent.target?.result as string;
                                if (result) {
                                  onUpdateGuidesState({
                                    ...guidesState,
                                    loanOfficer: { ...currentLo, headshotUrl: result }
                                  });
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      <span className="text-[11px] text-[#9A9488]">Supports JPG, PNG, WEBP from your device</span>
                    </div>

                    <input
                      type="text"
                      placeholder="https://... (or leave blank to use default professional avatar)"
                      value={currentLo.headshotUrl}
                      onChange={(e) => updateCurrentLoField("headshotUrl", e.target.value)}
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
          </div>
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
      </main>

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
                    placeholder="jessica@pacificlending.com"
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
                    placeholder="(503) 555-0182"
                    value={editingLo ? editingLo.phone : newLoForm.phone}
                    onChange={(e) => editingLo ? setEditingLo({ ...editingLo, phone: e.target.value }) : setNewLoForm(p => ({ ...p, phone: e.target.value }))}
                    className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#4A5D4E]"
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
                    <img
                      src={editingLo ? editingLo.headshotUrl : newLoForm.headshotUrl}
                      alt="Preview"
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md bg-[#EAE7E0]"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&auto=format&fit=crop&q=80";
                      }}
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
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (uploadEvent) => {
                                const result = uploadEvent.target?.result as string;
                                if (result) {
                                  if (editingLo) {
                                    setEditingLo({ ...editingLo, headshotUrl: result });
                                  } else {
                                    setNewLoForm(p => ({ ...p, headshotUrl: result }));
                                  }
                                }
                              };
                              reader.readAsDataURL(file);
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
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 border border-[#EAE7E0] shadow-2xl animate-in zoom-in-95 duration-150 text-[#2D362E] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-3">
              <h4 className="font-serif font-bold text-lg text-[#2D362E]">
                {editingAgent ? `Edit Realtor: ${editingAgent.name}` : "Add Real Estate Agent Partner"}
              </h4>
              <button
                onClick={() => { setShowAddAgentModal(false); setEditingAgent(null); }}
                className="text-xs text-[#9A9488] hover:text-[#2D362E]"
              >
                ✕ Cancel
              </button>
            </div>

            <form onSubmit={handleSaveAgent} className="space-y-4">
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
                  <label className="text-xs font-semibold text-[#606C5D]">Brokerage</label>
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
                    <img
                      src={editingAgent ? editingAgent.headshotUrl : newAgentForm.headshotUrl}
                      alt="Preview"
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md bg-[#EAE7E0]"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80";
                      }}
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
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (uploadEvent) => {
                                const result = uploadEvent.target?.result as string;
                                if (result) {
                                  if (editingAgent) {
                                    setEditingAgent({ ...editingAgent, headshotUrl: result });
                                  } else {
                                    setNewAgentForm(p => ({ ...p, headshotUrl: result }));
                                  }
                                }
                              };
                              reader.readAsDataURL(file);
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
            <div className="bg-[#FAF9F5] p-4 border-b border-[#EAE7E0] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs shrink-0">
              <div>
                <span className="text-[10px] text-[#9A9488] font-bold uppercase">Timeline</span>
                <p className="font-semibold text-[#2D362E]">{viewingTranscriptLead.timeline}</p>
              </div>
              <div>
                <span className="text-[10px] text-[#9A9488] font-bold uppercase">Target Price</span>
                <p className="font-semibold text-[#4A5D4E]">{viewingTranscriptLead.targetPriceRange}</p>
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
    </div>
  );
};
