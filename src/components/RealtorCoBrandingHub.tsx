import React, { useState } from "react";
import { MessageSquare, Mail, 
  Users, 
  Link as LinkIcon, 
  QrCode, 
  Printer, 
  Sparkles, 
  Copy, 
  Check, 
  ExternalLink, 
  Share2, 
  Building, 
  UserCheck, 
  FileText, 
  Send, 
  Percent, 
  ShieldCheck, 
  CheckCircle2, 
  Plus, 
  TrendingUp, 
  Image as ImageIcon,
  DollarSign
} from "lucide-react";
import { 
  ProfessionalGuidesState, 
  LoanOfficerProfile, 
  RealEstateAgentProfile, 
  LOPairing, 
  CapturedLead,
  PropertyListing
} from "../types";
import { formatUSD, calculateMonthlyPI } from "../utils/mortgageMath";
import { OutreachHistoryBadge } from "./OutreachHistoryBadge";

interface RealtorCoBrandingHubProps {
  guidesState: ProfessionalGuidesState;
  onUpdateGuidesState: (newState: ProfessionalGuidesState) => void;
  currentLo: LoanOfficerProfile;
  leads?: CapturedLead[];
  properties?: PropertyListing[];
  onTriggerToast?: (msg: string) => void;
}

export const RealtorCoBrandingHub: React.FC<RealtorCoBrandingHubProps> = ({
  guidesState,
  onUpdateGuidesState,
  currentLo,
  leads = [],
  properties = [],
  onTriggerToast
}) => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>(
    guidesState.agentRoster[0]?.id || ""
  );
  const [activeSubTab, setActiveSubTab] = useState<"portal_links" | "flyer_studio" | "partner_pipeline" | "invite_realtor">("portal_links");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Flyer Studio Customization State
  const [flyerPropertyPrice, setFlyerPropertyPrice] = useState<number>(475000);
  const [flyerPropertyAddress, setFlyerPropertyAddress] = useState<string>("1428 Elm Ridge Way, Portland, OR 97229");
  const [flyerPropertyBedBath, setFlyerPropertyBedBath] = useState<string>("4 Beds • 3 Baths • 2,450 Sq Ft");
  const [flyerHeadline, setFlyerHeadline] = useState<string>("Exclusive First-Time Buyer Financing with 2-1 Rate Buydown");
  const [flyerNoteRate, setFlyerNoteRate] = useState<number>(6.50);

  // New Realtor Modal / Form State
  const [showNewAgentForm, setShowNewAgentForm] = useState(false);
  const [newAgentName, setNewAgentName] = useState("");
  const [newAgentBrokerage, setNewAgentBrokerage] = useState("");
  const [newAgentPhone, setNewAgentPhone] = useState("");
  const [newAgentEmail, setNewAgentEmail] = useState("");
  const [newAgentDre, setNewAgentDre] = useState("");

  const selectedAgent = guidesState.agentRoster.find(a => a.id === selectedAgentId) || guidesState.agentRoster[0];

  // Find or generate pairing
  const existingPairing = guidesState.pairings.find(
    p => p.loId === currentLo.id && p.agentId === selectedAgent?.id
  );

  let origin = typeof window !== "undefined" ? window.location.origin : "https://homereadypdx.com";
  if (origin.includes("ais-dev-")) {
    origin = origin.replace("ais-dev-", "ais-pre-");
  }
  const agentSlug = selectedAgent?.customSlug || selectedAgent?.name.toLowerCase().replace(/[^a-z0-9]/g, "-") || "partner";
  const loSlug = currentLo.customSlug || currentLo.name.toLowerCase().replace(/[^a-z0-9]/g, "-") || "mike-ford";
  
  const coBrandedUrl = `${origin}/first-time_homebuyer_portal/${loSlug}-and-${agentSlug}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(coBrandedUrl)}`;

  // Filter leads attributed to this realtor
  const partnerLeads = leads.filter(l => {
    const source = (l.leadSource || "").toLowerCase();
    const agentName = (selectedAgent?.name || "").toLowerCase();
    const notes = (l.notes || "").toLowerCase();
    return source.includes(agentName) || notes.includes(agentName) || (l as any).assignedAgentId === selectedAgent?.id;
  });

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    if (onTriggerToast) onTriggerToast("✓ Link copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const logAgentOutreach = (channel: 'email' | 'sms', templateName: string, subject?: string) => {
    if (!selectedAgent) return;
    const newLog = {
      id: `agent-outreach-${Date.now()}`,
      timestamp: new Date().toISOString(),
      channel,
      templateName,
      recipientName: selectedAgent.name,
      subject
    };
    const updatedAgents = guidesState.agentRoster.map(a => 
      a.id === selectedAgent.id 
        ? { ...a, outreachLogs: [newLog, ...(a.outreachLogs || [])] }
        : a
    );
    onUpdateGuidesState({
      ...guidesState,
      agentRoster: updatedAgents
    });
  };

  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName.trim()) return;

    const newId = `agent-${Date.now()}`;
    const slug = newAgentName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const newAgent: RealEstateAgentProfile = {
      id: newId,
      name: newAgentName,
      title: "Senior Real Estate Specialist",
      brokerage: newAgentBrokerage || "Premier Real Estate Group",
      phone: newAgentPhone || "(503) 555-0199",
      email: newAgentEmail || `${slug}@realtypartner.com`,
      licenseNumber: newAgentDre || "201234567",
      headshotUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
      bio: "Dedicated first-time homebuyer advocate and local market specialist.",
      customSlug: slug,
      marketAreas: ["Portland Metro", "Beaverton", "Lake Oswego"],
      specialties: ["First-Time Homebuyers", "Move-Up Buyers", "Down Payment Assistance"]
    };

    const newPairing: LOPairing = {
      id: `pair-${Date.now()}`,
      loId: currentLo.id,
      agentId: newId,
      customSlug: `${loSlug}-and-${slug}`,
      title: `${currentLo.name} + ${newAgentName} (Co-Branded)`,
      notes: `Active co-marketing portal for ${newAgentName} and ${currentLo.name}.`,
      createdAt: new Date().toISOString().split("T")[0],
      active: true
    };

    onUpdateGuidesState({
      ...guidesState,
      agentRoster: [newAgent, ...guidesState.agentRoster],
      pairings: [newPairing, ...guidesState.pairings]
    });

    setSelectedAgentId(newId);
    setShowNewAgentForm(false);
    setNewAgentName("");
    setNewAgentBrokerage("");
    setNewAgentPhone("");
    setNewAgentEmail("");
    setNewAgentDre("");
    if (onTriggerToast) onTriggerToast(`✓ Added ${newAgent.name} & created co-branded portal link!`);
  };

  // 2-1 Buydown calculations for the flyer
  const flyerDown = Math.round(flyerPropertyPrice * 0.05);
  const flyerLoan = flyerPropertyPrice - flyerDown;
  const flyerYr1Rate = flyerNoteRate - 2.0;
  const flyerYr2Rate = flyerNoteRate - 1.0;

  const flyerMonthlyTaxIns = Math.round((flyerPropertyPrice * 0.012) / 12) + 115 + Math.round((flyerLoan * 0.0055) / 12);
  const flyerYr1Total = calculateMonthlyPI(flyerLoan, flyerYr1Rate, 30) + flyerMonthlyTaxIns;
  const flyerYr2Total = calculateMonthlyPI(flyerLoan, flyerYr2Rate, 30) + flyerMonthlyTaxIns;
  const flyerYr3Total = calculateMonthlyPI(flyerLoan, flyerNoteRate, 30) + flyerMonthlyTaxIns;
  const flyerMonthlySavingsYr1 = flyerYr3Total - flyerYr1Total;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#2D362E] rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-emerald-500/15 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#E7C19D] border border-white/15 text-xs font-bold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5 text-[#E7C19D]" />
              <span>Realtor Partner Growth Architecture</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
              Realtor Co-Branding & Partner Command Hub
            </h2>
            <p className="text-sm text-[#D8D2C2] max-w-2xl leading-relaxed">
              Launch dual-branded client portals, co-branded open house flyers with 2-1 buydown payment sheets, QR code sign-in kits, and shared real-time lead pipelines for your top agent partners.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowNewAgentForm(!showNewAgentForm)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-2 transition-all cursor-pointer shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Realtor Partner</span>
          </button>
        </div>
      </div>

      {/* Add New Realtor Partner Drawer */}
      {showNewAgentForm && (
        <form onSubmit={handleCreateAgent} className="bg-white rounded-3xl p-6 border border-[#EAE7E0] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#2D362E] flex items-center gap-2">
              <Building className="w-4 h-4 text-[#4A5D4E]" />
              <span>Create New Realtor Partner Profile</span>
            </h3>
            <span className="text-[11px] text-[#9A9488]">Auto-generates co-branded portal link</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-[#606C5D] font-medium block mb-1">Agent Full Name *</span>
              <input
                type="text"
                required
                value={newAgentName}
                onChange={(e) => setNewAgentName(e.target.value)}
                placeholder="e.g. Jessica Miller"
                className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs text-[#2D362E]"
              />
            </div>
            <div>
              <span className="text-[#606C5D] font-medium block mb-1">Brokerage / Company *</span>
              <input
                type="text"
                required
                value={newAgentBrokerage}
                onChange={(e) => setNewAgentBrokerage(e.target.value)}
                placeholder="e.g. Keller Williams Realty"
                className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs text-[#2D362E]"
              />
            </div>
            <div>
              <span className="text-[#606C5D] font-medium block mb-1">Phone Number</span>
              <input
                type="text"
                value={newAgentPhone}
                onChange={(e) => setNewAgentPhone(e.target.value)}
                placeholder="(503) 555-0188"
                className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs text-[#2D362E]"
              />
            </div>
            <div>
              <span className="text-[#606C5D] font-medium block mb-1">Email Address</span>
              <input
                type="email"
                value={newAgentEmail}
                onChange={(e) => setNewAgentEmail(e.target.value)}
                placeholder="agent@brokerage.com"
                className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs text-[#2D362E]"
              />
            </div>
            <div>
              <span className="text-[#606C5D] font-medium block mb-1">DRE / License #</span>
              <input
                type="text"
                value={newAgentDre}
                onChange={(e) => setNewAgentDre(e.target.value)}
                placeholder="OR DRE #20148891"
                className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs text-[#2D362E]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#EAE7E0]">
            <button
              type="button"
              onClick={() => setShowNewAgentForm(false)}
              className="px-4 py-2 rounded-xl border border-[#EAE7E0] text-xs font-semibold text-[#606C5D] hover:bg-[#F9F8F4] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#4A5D4E] hover:bg-[#3d4d40] text-xs font-bold text-white cursor-pointer shadow-xs"
            >
              Save & Generate Co-Brand Link
            </button>
          </div>
        </form>
      )}

      {/* Realtor Partner Selector Bar & Sub-Navigation Tabs */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EAE7E0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#4A5D4E]/10 text-[#4A5D4E] flex items-center justify-center shrink-0">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A9488] block">
              Active Realtor Partner Selection
            </span>
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="text-xs font-bold bg-[#F9F8F4] border border-[#EAE7E0] rounded-lg px-3 py-1.5 text-[#2D362E]"
            >
              {guidesState.agentRoster.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.name} ({agent.brokerage})
                </option>
              ))}
                        </select>
            <div className="mt-1">
              <OutreachHistoryBadge agent={selectedAgent} compact={true} />
            </div>
          </div>
        </div>

        {/* Sub Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: "portal_links", label: "Co-Branded Links & QR", icon: LinkIcon },
            { id: "flyer_studio", label: "Open House Flyer Studio", icon: Printer },
            { id: "partner_pipeline", label: `Realtor Pipeline (${partnerLeads.length})`, icon: Users },
            { id: "invite_realtor", label: "Invite & Outreach Kit", icon: Send }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  activeSubTab === tab.id
                    ? "bg-[#4A5D4E] text-white shadow-xs"
                    : "bg-[#F9F8F4] text-[#606C5D] hover:bg-[#EAE7E0]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-TAB 1: Co-Branded Portal Links & QR Codes */}
      {activeSubTab === "portal_links" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Live Link & Details (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#EAE7E0] shadow-xs space-y-5">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#4A5D4E] block">
                Dual-Branded Homebuyer Portal
              </span>
              <h3 className="text-xl font-bold text-[#2D362E]">
                {currentLo.name} + {selectedAgent?.name} Co-Marketing Hub
              </h3>
              <p className="text-xs text-[#606C5D]">
                When buyers access this URL, they see both your headshot and {selectedAgent?.name}'s headshot, brokerage logos, direct phone numbers, and co-branded pre-qualification tools.
              </p>
            </div>

            {/* Custom URL Display Box */}
            <div className="p-4 bg-[#F9F8F4] rounded-2xl border border-[#EAE7E0] space-y-3">
              <span className="text-[11px] font-bold text-[#606C5D] uppercase tracking-wider block">
                Official Live Portal URL
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={coBrandedUrl}
                  className="flex-1 bg-white border border-[#EAE7E0] rounded-xl px-3.5 py-2.5 text-xs font-mono font-semibold text-[#2D362E]"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(coBrandedUrl, "portal_url")}
                  className="px-4 py-2.5 rounded-xl bg-[#4A5D4E] hover:bg-[#3d4d40] text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                >
                  {copiedKey === "portal_url" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === "portal_url" ? "Copied" : "Copy Link"}</span>
                </button>
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <a
                  href={coBrandedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#4A5D4E] font-bold hover:underline"
                >
                  <span>Test Open in New Tab</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <span className="text-[11px] text-[#9A9488]">Zero setup required</span>
              </div>
            </div>

            {/* Partner Details Card */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-[#FDFCF9] rounded-2xl border border-[#EAE7E0] space-y-1">
                <span className="text-[10px] text-[#9A9488] uppercase block">Loan Officer</span>
                <span className="font-bold text-[#2D362E] block">{currentLo.name}</span>
                <span className="text-[11px] text-[#606C5D] block">{currentLo.company} (NMLS #{currentLo.nmlsId || "123456"})</span>
                <span className="text-[11px] text-[#4A5D4E] block">{currentLo.phone}</span>
              </div>

              <div className="p-3.5 bg-[#FDFCF9] rounded-2xl border border-[#EAE7E0] space-y-1">
                <span className="text-[10px] text-[#9A9488] uppercase block">Realtor Partner</span>
                <span className="font-bold text-[#2D362E] block">{selectedAgent?.name}</span>
                <span className="text-[11px] text-[#606C5D] block">{selectedAgent?.brokerage} (DRE #{selectedAgent?.licenseNumber})</span>
                <span className="text-[11px] text-[#4A5D4E] block">{selectedAgent?.phone}</span>
              </div>
            </div>
          </div>

          {/* Right Column: High-Res QR Code Generator (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#EAE7E0] shadow-xs flex flex-col items-center text-center space-y-4">
            <div className="w-full text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2D362E] flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-[#4A5D4E]" />
                <span>Open House & Sign-in QR Code</span>
              </span>
              <p className="text-[11px] text-[#606C5D]">
                Scan to instantly launch co-branded pre-approval portal.
              </p>
            </div>

            <div className="p-4 bg-[#F9F8F4] rounded-2xl border border-[#EAE7E0] shadow-2xs inline-block">
              <img
                src={qrCodeUrl}
                alt="Co-Branded QR Code"
                className="w-44 h-44 rounded-xl shadow-xs"
              />
            </div>

            <div className="w-full space-y-2">
              <button
                type="button"
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = qrCodeUrl;
                  link.download = `QR-${loSlug}-and-${agentSlug}.png`;
                  link.click();
                  if (onTriggerToast) onTriggerToast("✓ Downloaded high-resolution QR code!");
                }}
                className="w-full py-2.5 rounded-xl bg-[#4A5D4E] hover:bg-[#3d4d40] text-xs font-bold text-white flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Download High-Res QR Image</span>
              </button>

              <button
                type="button"
                onClick={() => copyToClipboard(qrCodeUrl, "qr_img_url")}
                className="w-full py-2 rounded-xl bg-[#F9F8F4] hover:bg-[#EAE7E0] text-xs font-semibold text-[#606C5D] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedKey === "qr_img_url" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === "qr_img_url" ? "Copied Image URL" : "Copy QR Image URL"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Co-Branded Open House Flyer Studio */}
      {activeSubTab === "flyer_studio" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Controls (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#EAE7E0] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#2D362E] flex items-center gap-2">
                <Printer className="w-4 h-4 text-[#4A5D4E]" />
                <span>Flyer Property Parameters</span>
              </h3>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print PDF</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[#606C5D] font-medium block mb-1">Listing Price ($):</span>
                <input
                  type="number"
                  step={5000}
                  value={flyerPropertyPrice}
                  onChange={(e) => setFlyerPropertyPrice(Number(e.target.value))}
                  className="w-full font-mono font-bold bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <span className="text-[#606C5D] font-medium block mb-1">Property Address:</span>
                <input
                  type="text"
                  value={flyerPropertyAddress}
                  onChange={(e) => setFlyerPropertyAddress(e.target.value)}
                  className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <span className="text-[#606C5D] font-medium block mb-1">Bed / Bath / Sq Ft:</span>
                <input
                  type="text"
                  value={flyerPropertyBedBath}
                  onChange={(e) => setFlyerPropertyBedBath(e.target.value)}
                  className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <span className="text-[#606C5D] font-medium block mb-1">Permanent Note Rate (%):</span>
                <input
                  type="number"
                  step={0.125}
                  value={flyerNoteRate}
                  onChange={(e) => setFlyerNoteRate(Number(e.target.value))}
                  className="w-full font-mono font-bold bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2"
                />
              </div>

              <div>
                <span className="text-[#606C5D] font-medium block mb-1">Flyer Headline:</span>
                <input
                  type="text"
                  value={flyerHeadline}
                  onChange={(e) => setFlyerHeadline(e.target.value)}
                  className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2"
                />
              </div>
            </div>
          </div>

          {/* Right Live Printable Flyer Sheet Preview (8 cols) */}
          <div className="lg:col-span-8 bg-[#F4F1EA] rounded-3xl p-6 border border-[#EAE7E0] shadow-md flex justify-center">
            {/* Printable Letter Sheet Canvas */}
            <div className="w-full max-w-2xl bg-white rounded-2xl p-6 sm:p-8 border border-[#D8D2C2] shadow-lg space-y-6 text-[#2D362E] font-sans">
              {/* Header with Dual Branding */}
              <div className="flex items-center justify-between border-b-2 border-[#2D362E] pb-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#4A5D4E] block">
                    EXCLUSIVE FINANCING & PROPERTY SHOWCASE
                  </span>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2D362E] leading-tight">
                    {flyerPropertyAddress}
                  </h2>
                  <p className="text-xs text-[#606C5D] font-medium">
                    {flyerPropertyBedBath} • Offered at <strong className="text-[#2D362E] font-bold">{formatUSD(flyerPropertyPrice)}</strong>
                  </p>
                </div>

                <div className="w-16 h-16 shrink-0">
                  <img
                    src={qrCodeUrl}
                    alt="Scan for Pre-approval"
                    className="w-full h-full rounded border border-[#EAE7E0]"
                  />
                </div>
              </div>

              {/* 2-1 Buydown Payment Comparison Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#2D362E] flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-[#4A5D4E]" />
                    <span>Special 2-1 Seller Rate Buydown Payment Schedule</span>
                  </h4>
                  <span className="text-[10px] text-emerald-800 bg-emerald-100 font-bold px-2 py-0.5 rounded">
                    Saves {formatUSD(flyerMonthlySavingsYr1)}/mo in Year 1!
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase block">Year 1 ({flyerYr1Rate.toFixed(2)}%)</span>
                    <span className="text-base font-extrabold font-mono text-emerald-950 block mt-0.5">
                      {formatUSD(flyerYr1Total)}/mo
                    </span>
                    <span className="text-[10px] text-emerald-700 font-medium">PITI + Escrows</span>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-300">
                    <span className="text-[10px] font-bold text-amber-800 uppercase block">Year 2 ({flyerYr2Rate.toFixed(2)}%)</span>
                    <span className="text-base font-extrabold font-mono text-amber-950 block mt-0.5">
                      {formatUSD(flyerYr2Total)}/mo
                    </span>
                    <span className="text-[10px] text-amber-700 font-medium">PITI + Escrows</span>
                  </div>

                  <div className="p-3 bg-[#F9F8F4] rounded-xl border border-[#EAE7E0]">
                    <span className="text-[10px] font-bold text-[#606C5D] uppercase block">Years 3-30 ({flyerNoteRate.toFixed(2)}%)</span>
                    <span className="text-base font-extrabold font-mono text-[#2D362E] block mt-0.5">
                      {formatUSD(flyerYr3Total)}/mo
                    </span>
                    <span className="text-[10px] text-[#9A9488] font-medium">Fixed Note Rate</span>
                  </div>
                </div>
              </div>

              {/* Dual Professional Advisory Signoff Card */}
              <div className="pt-4 border-t-2 border-[#EAE7E0] grid grid-cols-2 gap-4 text-xs">
                {/* LO Card */}
                <div className="p-3 bg-[#FDFCF9] rounded-xl border border-[#EAE7E0] space-y-1">
                  <span className="text-[9px] font-bold text-[#9A9488] uppercase tracking-wider block">
                    Mortgage Loan Specialist
                  </span>
                  <span className="font-bold text-[#2D362E] block">{currentLo.name}</span>
                  <span className="text-[11px] text-[#606C5D] block">{currentLo.company}</span>
                  <span className="text-[10px] text-[#9A9488] block">NMLS #{currentLo.nmlsId || "123456"} • {currentLo.phone}</span>
                </div>

                {/* Agent Card */}
                <div className="p-3 bg-[#FDFCF9] rounded-xl border border-[#EAE7E0] space-y-1">
                  <span className="text-[9px] font-bold text-[#9A9488] uppercase tracking-wider block">
                    Listing & Buyer Specialist
                  </span>
                  <span className="font-bold text-[#2D362E] block">{selectedAgent?.name}</span>
                  <span className="text-[11px] text-[#606C5D] block">{selectedAgent?.brokerage}</span>
                  <span className="text-[10px] text-[#9A9488] block">DRE #{selectedAgent?.licenseNumber} • {selectedAgent?.phone}</span>
                </div>
              </div>

              {/* Equal Housing Disclaimer */}
              <p className="text-[9px] text-[#9A9488] text-center leading-tight">
                Equal Housing Lender. For informational purposes only; not a commitment to lend. Rates & payment terms subject to underwriting approval, creditworthiness, and market conditions.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: Realtor Partner Pipeline */}
      {activeSubTab === "partner_pipeline" && (
        <div className="bg-white rounded-3xl p-6 border border-[#EAE7E0] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#4A5D4E] block">
                Joint Pipeline Tracking
              </span>
              <h3 className="text-lg font-bold text-[#2D362E]">
                Buyers Attributed to {selectedAgent?.name} ({partnerLeads.length})
              </h3>
            </div>

            <button
              type="button"
              onClick={() => copyToClipboard(
                `Hi ${selectedAgent?.name?.split(" ")[0]}! Here is our current joint pipeline update:\n` +
                partnerLeads.map(l => `• ${l.fullName} (${l.targetPriceRange || "$450k"}) - Status: ${l.status || "Pre-Approved"}`).join("\n") +
                `\nLet's catch up this week! - ${currentLo.name}`,
                "pipeline_digest"
              )}
              className="px-4 py-2 rounded-xl bg-[#4A5D4E] hover:bg-[#3d4d40] text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              {copiedKey === "pipeline_digest" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Pipeline Digest for Agent</span>
            </button>
          </div>

          {partnerLeads.length > 0 ? (
            <div className="divide-y divide-[#EAE7E0]">
              {partnerLeads.map((lead) => (
                <div key={lead.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-[#2D362E]">{lead.fullName}</span>
                      <OutreachHistoryBadge lead={lead} compact={true} />
                    </div>
                    <span className="text-[11px] text-[#606C5D]">
                      Price: {lead.targetPriceRange || "$425k"} • FICO: {lead.creditScore || "720"} • {lead.email}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {lead.status || "Pre-Approved"}
                    </span>
                    <span className="text-[11px] text-[#9A9488]">{lead.timestamp || "Recently"}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-[#F9F8F4] rounded-2xl border border-dashed border-[#EAE7E0] space-y-2">
              <Users className="w-8 h-8 text-[#9A9488] mx-auto" />
              <p className="text-xs font-bold text-[#2D362E]">No attributed leads yet for {selectedAgent?.name}</p>
              <p className="text-[11px] text-[#606C5D] max-w-sm mx-auto">
                Share your co-branded portal link (<code className="text-[#4A5D4E]">{coBrandedUrl}</code>) with {selectedAgent?.name} so all incoming open house visitors and social clicks are tracked here automatically.
              </p>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 4: Invite & Outreach Kit */}
      {activeSubTab === "invite_realtor" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(() => {
            const smsBody = `Hi ${selectedAgent?.name?.split(" ")[0]}! I just built a custom co-branded first-time homebuyer portal for us with live 2-1 buydown calculators, Oregon DPA grant lookups, and instant pre-qualification.\n\nTake a look: ${coBrandedUrl}\n\nWe can put this on our open house flyers this weekend! - ${currentLo.name}`;
            const smsLink = `sms:?&body=${encodeURIComponent(smsBody)}`;
            
            const emailSubject = `Co-Branded Homebuyer Portal & 2-1 Buydown Flyer Kit for ${selectedAgent?.name}`;
            const emailBody = `Hi ${selectedAgent?.name?.split(" ")[0]},\n\nI wanted to share a new marketing technology asset I created for our partnership: a dedicated co-branded digital portal that features both of our headshots, contact information, and interactive loan tools for your buyer clients.\n\nHere is your portal link: ${coBrandedUrl}\n\nTop features ready to use:\n1. Live 2-1 Seller Rate Buydown Engine (shows buyers how to save $350-$500/mo without price cuts)\n2. Oregon Bond & Flex DPA 3.5% Grant Finders\n3. Co-branded Open House flyer generator with instant QR codes\n\nLet's connect this week to launch our next co-branded open house campaign.\n\nBest,\n${currentLo.name}\n${currentLo.company} (NMLS #${currentLo.nmlsNumber})`;
            
            // Note: encodeURIComponent is used for mailto links
            const mailtoLink = `mailto:${selectedAgent?.email || ''}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

            return (
              <>
                {/* SMS Invite Script */}
                <div className="bg-white rounded-3xl p-6 border border-[#EAE7E0] shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D362E]">
                      1-Click Realtor Co-Brand SMS Invite
                    </h4>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(smsBody, "sms_invite")}
                        className="text-xs font-bold text-[#4A5D4E] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === "sms_invite" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === "sms_invite" ? "Copied" : "Copy"}</span>
                      </button>
                      <a
                        href={smsLink}
                        target="_top"
                        className="text-xs font-bold text-white bg-[#4A5D4E] hover:bg-[#3A4A3D] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Draft SMS
                      </a>
                    </div>
                  </div>

                  <div className="p-4 bg-[#F9F8F4] rounded-2xl border border-[#EAE7E0] text-xs text-[#2D362E] font-sans leading-relaxed whitespace-pre-wrap">
                    {smsBody}
                  </div>
                </div>

                {/* Email Partnership Pitch */}
                <div className="bg-white rounded-3xl p-6 border border-[#EAE7E0] shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#2D362E]">
                      Realtor Partnership Pitch Email
                    </h4>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(`Subject: ${emailSubject}\n\n${emailBody}`, "email_invite")}
                        className="text-xs font-bold text-[#4A5D4E] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedKey === "email_invite" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === "email_invite" ? "Copied" : "Copy"}</span>
                      </button>
                      <a
                        href={mailtoLink}
                        target="_top"
                        onClick={() => logAgentOutreach('email', 'Co-Brand Partner Invite', emailSubject)}
                        className="text-xs font-bold text-white bg-[#4A5D4E] hover:bg-[#3A4A3D] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Draft Email
                      </a>
                    </div>
                  </div>

                  <div className="p-4 bg-[#F9F8F4] rounded-2xl border border-[#EAE7E0] text-xs text-[#2D362E] font-sans leading-relaxed whitespace-pre-wrap">
                    <span className="font-bold text-[#4A5D4E]">Subject:</span> {emailSubject}
                    <br/><br/>
                    {emailBody}
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};
