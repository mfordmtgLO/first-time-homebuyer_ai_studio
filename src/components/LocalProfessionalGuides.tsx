import React, { useState } from "react";
import { 
  ShieldCheck, 
  Phone, 
  Mail, 
  Calendar, 
  Award, 
  MapPin, 
  ExternalLink, 
  CheckCircle2, 
  MessageSquare,
  Sparkles,
  Users,
  Settings,
  Globe,
  QrCode,
  Smartphone,
  Check,
  Copy
} from "lucide-react";
import { LoanOfficerProfile, RealEstateAgentProfile, CapturedLead } from "../types";
import { HeadshotAvatar } from "./HeadshotAvatar";

interface LocalProfessionalGuidesProps {
  loanOfficer: LoanOfficerProfile;
  activeAgent?: RealEstateAgentProfile;
  isCoBranded?: boolean;
  onOpenLoPortal?: () => void;
  title?: string;
  subtitle?: string;
  onSaveLead?: (lead: CapturedLead) => void;
}

export const LocalProfessionalGuides: React.FC<LocalProfessionalGuidesProps> = ({
  loanOfficer,
  activeAgent,
  isCoBranded = false,
  onOpenLoPortal,
  title,
  subtitle,
  onSaveLead,
}) => {
  const [contactSuccess, setContactSuccess] = useState<string | null>(null);
  const [showDirectMsgModal, setShowDirectMsgModal] = useState<boolean>(false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [buyerMsg, setBuyerMsg] = useState({
    name: "",
    email: "",
    phone: "",
    desiredCity: "",
    wantsCuratedList: true,
    notes: "",
    smsConsentAuthorized: true
  });

  const leadGenUrl = loanOfficer.leadGenFormUrl || "https://portal.myhometrac.com/get-started/MFORD@CFMTG.COM";
  const qrCodeUrl = loanOfficer.leadGenQrCodeUrl || "/lead-gen-qr-code.png";

  const showAgent = isCoBranded && !!activeAgent;

  const defaultTitle = showAgent 
    ? "Your Local Professional Guides" 
    : "Your Dedicated Mortgage Financing Guide";

  const defaultSubtitle = showAgent
    ? "A synchronized team of mortgage financing and neighborhood real estate experts dedicated to guiding your first purchase safely."
    : "Dedicated first-time homebuyer financing specialist ready to calculate your exact monthly payment, optimize seller concessions (IPC), and structure winning pre-approvals.";

  const displayTitle = title || defaultTitle;
  const displaySubtitle = subtitle || defaultSubtitle;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const recipientText = showAgent && activeAgent
      ? `${loanOfficer.name} and ${activeAgent.name}`
      : loanOfficer.name;

    const cityClean = buyerMsg.desiredCity.trim();
    const newLead: CapturedLead = {
      id: `lead-guide-msg-${Date.now()}`,
      fullName: buyerMsg.name.trim(),
      email: buyerMsg.email.trim(),
      phone: buyerMsg.phone.trim(),
      preferredContactTime: "Anytime",
      timeline: "Ready in 30-60 Days",
      targetPriceRange: "$400,000 - $550,000",
      targetMonthlyBudget: "Optimal Low/Zero Down Payment",
      downPaymentSavings: "Low/No Down Program Preferred",
      grantInterest: true,
      creditScoreTier: "Good (660+)",
      preferredLocations: cityClean || (activeAgent?.marketAreas?.[0] || "Portland"),
      taggedCityArea: cityClean || (activeAgent?.marketAreas?.[0] || "Portland"),
      leadPathTag: showAgent ? "Agent Spotlight Guide Advisory" : "LO Direct Advisory",
      propertyType: "Single Family",
      sendSampleHomes: buyerMsg.wantsCuratedList,
      sendSampleHomesOption: buyerMsg.wantsCuratedList
        ? `YES - Curated list of recently listed homes in ${cityClean || "Oregon"} (Low/No Down Eligible)`
        : "No sample list",
      assignedLoId: loanOfficer.id,
      assignedAgentId: activeAgent?.id || "agent-1",
      assignedLO: loanOfficer.name,
      assignedAgent: activeAgent?.name || "Sarah Jenkins",
      leadSource: `Guide Consultation: ${cityClean || "Local Market"}`,
      interactedSourceType: "chatbot",
      intentScore: "hot",
      status: "new",
      notes: `[DIRECT CONSULTATION]: Buyer message: "${buyerMsg.notes}".\nDesired City: ${cityClean || "Not specified"}. Curated Low/No Down Homes requested: ${buyerMsg.wantsCuratedList ? "YES" : "NO"}.`,
      createdAt: new Date().toISOString(),
      smsConsentAuthorized: buyerMsg.smsConsentAuthorized,
      smsConsentTimestamp: new Date().toISOString(),
      smsConsentSource: "Local Professional Guide Advisory Message",
      textNurtureEnabled: true,
      textNurtureCurrentStep: 1,
      textNurtureTotalSteps: 4,
      textNurtureStageText: "1 of 4: Consultation Received",
      lastTextSentAt: new Date().toISOString()
    };

    if (onSaveLead) {
      onSaveLead(newLead);
    }

    try {
      const stored = localStorage.getItem("homebuyer_roadmap_state_v2");
      if (stored) {
        const parsed = JSON.parse(stored);
        const existingLeads = parsed.leads || [];
        parsed.leads = [newLead, ...existingLeads];
        localStorage.setItem("homebuyer_roadmap_state_v2", JSON.stringify(parsed));
      }
      const rawLeads = localStorage.getItem("first_time_buyer_leads");
      const leadsList = rawLeads ? JSON.parse(rawLeads) : [];
      localStorage.setItem("first_time_buyer_leads", JSON.stringify([newLead, ...leadsList]));
    } catch (err) {
      console.warn("Storage error for guide lead:", err);
    }

    setContactSuccess(`Thank you! Your message and home search criteria have been sent directly to ${recipientText}. They will reach out within 2-4 business hours with your customized options.`);
    setShowDirectMsgModal(false);
    setBuyerMsg({
      name: "",
      email: "",
      phone: "",
      desiredCity: "",
      wantsCuratedList: true,
      notes: "",
      smsConsentAuthorized: true
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(leadGenUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  return (
    <div id="local-professional-guides-section" className="bg-white rounded-3xl border border-[#EAE7E0] p-6 sm:p-8 lg:p-10 space-y-8 shadow-sm text-[#2D362E]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE7E0] pb-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1EFE9] text-[#4A5D4E] text-xs font-semibold border border-[#EAE7E0]">
            {showAgent ? (
              <>
                <Users className="w-3.5 h-3.5 text-[#C18C5D]" />
                <span>Dedicated Co-Branded Advisory Team</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-[#4A5D4E]" />
                <span>Licensed Mortgage Financing Advisor</span>
              </>
            )}
          </div>
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D362E]">
            {displayTitle}
          </h3>
          <p className="text-xs sm:text-sm text-[#606C5D] leading-relaxed">
            {displaySubtitle}
          </p>
        </div>

        {/* Quick Contact & Lead Gen CTAs */}
        <div className="flex flex-wrap items-center sm:items-end gap-2 shrink-0">
          <a
            href={leadGenUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4A373] hover:bg-[#C18C5D] text-white font-bold text-xs shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            title="Start your official pre-approval application online"
          >
            <Smartphone className="w-4 h-4 text-white" />
            <span>Start Loan App Online</span>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </a>

          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#FAF9F5] hover:bg-[#F1EFE9] text-[#4A5D4E] font-bold text-xs border border-[#EAE7E0] transition-colors cursor-pointer"
            title="Scan QR code with phone camera to apply"
          >
            <QrCode className="w-4 h-4 text-[#4A5D4E]" />
            <span className="hidden sm:inline">Scan QR</span>
          </button>

          <button
            id="contact-guides-btn"
            onClick={() => setShowDirectMsgModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white font-semibold text-xs shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <MessageSquare className="w-4 h-4 text-[#D4A373]" />
            <span>{showAgent ? "Message Both Guides" : `Message ${loanOfficer.name.split(" ")[0]}`}</span>
          </button>
        </div>
      </div>

      {contactSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{contactSuccess}</span>
        </div>
      )}

      {/* Guides Showcase Grid: 2-Column for Pairing, 1-Column for Single LO */}
      <div className={showAgent ? "grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8" : "max-w-4xl mx-auto"}>
        {/* Guide 1: Loan Officer */}
        <div className="bg-[#F9F8F4] rounded-2xl border border-[#EAE7E0] p-6 sm:p-7 space-y-5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 px-3 py-1 bg-[#4A5D4E] text-white text-[10px] font-bold rounded-bl-xl uppercase tracking-wider">
            Mortgage Financing Guide
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <HeadshotAvatar
                src={loanOfficer.headshotUrl}
                name={loanOfficer.name}
                title={loanOfficer.title}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-white shadow-md shrink-0 bg-[#EAE7E0]"
              />
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-serif font-bold text-[#2D362E]">
                    {loanOfficer.name}
                  </h4>
                  <ShieldCheck className="w-4 h-4 text-[#4A5D4E]" title="Verified Licensed Mortgage Loan Originator" />
                </div>
                <p className="text-xs font-semibold text-[#4A5D4E]">
                  {loanOfficer.title}
                </p>
                <div className="text-[11px] text-[#606C5D]">
                  <span className="font-medium text-[#2D362E]">{loanOfficer.company}</span>
                  <div className="text-[10px] text-[#9A9488]">NMLS #{loanOfficer.nmlsId} • {loanOfficer.branch}</div>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#606C5D] leading-relaxed">
              {loanOfficer.bio}
            </p>

            {/* Specialties */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[10px] font-bold text-[#9A9488] uppercase tracking-wider">Core Mortgage Specialties:</span>
              <div className="flex flex-wrap gap-1.5">
                {loanOfficer.specialties.map((spec, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-2.5 py-0.5 rounded-lg bg-white text-[#4A5D4E] font-semibold border border-[#EAE7E0]"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Direct Fast-Track Application Box with QR Code */}
            <div className="mt-4 p-4 rounded-2xl bg-white border-2 border-[#D4A373]/40 shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D362E]">
                    <Sparkles className="w-3.5 h-3.5 text-[#D4A373]" />
                    <span>Fast-Track Pre-Approval Portal</span>
                  </div>
                  <p className="text-[11px] text-[#606C5D] leading-snug">
                    Submit your details securely to {loanOfficer.name.split(" ")[0]}'s direct loan intake portal to check your qualification status today.
                  </p>
                </div>

                {/* QR Code Mini-Card */}
                <div 
                  onClick={() => setShowQrModal(true)}
                  className="group relative cursor-pointer shrink-0 p-1.5 bg-[#FAF9F5] border border-[#EAE7E0] hover:border-[#D4A373] rounded-xl flex flex-col items-center gap-1 transition-all"
                  title="Click to view & scan full QR Code"
                >
                  <img 
                    src={qrCodeUrl} 
                    alt="Scan to start application" 
                    className="w-14 h-14 object-contain rounded-lg group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-[9px] font-bold text-[#4A5D4E] flex items-center gap-0.5">
                    <QrCode className="w-2.5 h-2.5 text-[#D4A373]" />
                    <span>Scan QR</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                <a
                  href={leadGenUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-bold shadow-xs transition-all hover:scale-[1.01]"
                >
                  <Smartphone className="w-3.5 h-3.5 text-[#D4A373]" />
                  <span>Start Online Application</span>
                  <ExternalLink className="w-3 h-3 opacity-80" />
                </a>

                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-1 py-2.5 px-3 rounded-xl bg-[#FAF9F5] hover:bg-[#F1EFE9] text-[#2D362E] text-xs font-semibold border border-[#EAE7E0] transition-colors"
                >
                  <QrCode className="w-3.5 h-3.5 text-[#C18C5D]" />
                  <span>View QR Code</span>
                </button>
              </div>
            </div>
          </div>

          {/* Contact Actions for Loan Officer */}
          <div className="pt-4 border-t border-[#EAE7E0] space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#606C5D]">
              <a 
                href={`tel:${loanOfficer.phone.replace(/[^0-9]/g, "")}`}
                className="flex items-center gap-1.5 p-2 bg-white rounded-lg border border-[#EAE7E0] hover:border-[#4A5D4E] transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#C18C5D] shrink-0" />
                <span className="font-semibold">{loanOfficer.phone}</span>
              </a>
              <a 
                href={`mailto:${loanOfficer.email}?subject=First-Time%20Homebuyer%20Inquiry%20from%20Roadmap`}
                className="flex items-center gap-1.5 p-2 bg-white rounded-lg border border-[#EAE7E0] hover:border-[#4A5D4E] transition-colors truncate"
              >
                <Mail className="w-3.5 h-3.5 text-[#C18C5D] shrink-0" />
                <span className="font-semibold truncate">{loanOfficer.email}</span>
              </a>
            </div>

            {loanOfficer.websiteUrl && (
              <a
                href={loanOfficer.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-semibold text-[#4A5D4E] hover:text-[#2D362E] hover:underline"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>View {loanOfficer.name}&apos;s Official CFMTG Branch Page</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            )}

            <a
              href={loanOfficer.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white hover:bg-[#FAF9F5] text-[#4A5D4E] border border-[#4A5D4E] text-xs font-semibold shadow-2xs transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-[#D4A373]" />
              <span>Schedule Free Strategy Call with {loanOfficer.name.split(" ")[0]}</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          </div>
        </div>

        {/* Guide 2: Real Estate Agent (Shown ONLY in Co-Branded Pairing Mode) */}
        {showAgent && activeAgent && (
          <div className="bg-[#F9F8F4] rounded-2xl border border-[#EAE7E0] p-6 space-y-5 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-[#C18C5D] text-white text-[10px] font-bold rounded-bl-xl uppercase tracking-wider">
              Local Real Estate Specialist
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <HeadshotAvatar
                  src={activeAgent.headshotUrl}
                  name={activeAgent.name}
                  title={activeAgent.title}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-white shadow-md shrink-0 bg-[#EAE7E0]"
                />
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-serif font-bold text-[#2D362E]">
                      {activeAgent.name}
                    </h4>
                    <Award className="w-4 h-4 text-[#C18C5D]" title="Licensed REALTOR® Specialist" />
                  </div>
                  <p className="text-xs font-semibold text-[#C18C5D]">
                    {activeAgent.title}
                  </p>
                  <div className="text-[11px] text-[#606C5D]">
                    <span className="font-medium text-[#2D362E]">{activeAgent.brokerage}</span>
                    <div className="text-[10px] text-[#9A9488]">{activeAgent.licenseNumber}</div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-[#606C5D] leading-relaxed">
                {activeAgent.bio}
              </p>

              {/* Specialties & Market Areas */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-bold text-[#9A9488] uppercase tracking-wider">Primary Market Areas:</span>
                <div className="flex flex-wrap gap-1.5">
                  {activeAgent.marketAreas.map((area, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-2.5 py-0.5 rounded-lg bg-white text-[#2D362E] font-medium border border-[#EAE7E0] flex items-center gap-1"
                    >
                      <MapPin className="w-2.5 h-2.5 text-[#C18C5D]" />
                      <span>{area}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Actions for Real Estate Agent */}
            <div className="pt-4 border-t border-[#EAE7E0] space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#606C5D]">
                <a 
                  href={`tel:${activeAgent.phone.replace(/[^0-9]/g, "")}`}
                  className="flex items-center gap-1.5 p-2 bg-white rounded-lg border border-[#EAE7E0] hover:border-[#C18C5D] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#4A5D4E] shrink-0" />
                  <span className="font-semibold">{activeAgent.phone}</span>
                </a>
                <a 
                  href={`mailto:${activeAgent.email}?subject=Home%20Tour%20Inquiry%20from%20Roadmap`}
                  className="flex items-center gap-1.5 p-2 bg-white rounded-lg border border-[#EAE7E0] hover:border-[#C18C5D] transition-colors truncate"
                >
                  <Mail className="w-3.5 h-3.5 text-[#4A5D4E] shrink-0" />
                  <span className="font-semibold truncate">{activeAgent.email}</span>
                </a>
              </div>

              <button
                id="schedule-tour-agent-btn"
                onClick={() => setShowDirectMsgModal(true)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#2D362E] hover:bg-[#1E241F] text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-[#C18C5D]" />
                <span>Request Private Home Tours with {activeAgent.name.split(" ")[0]}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Advisory Synergy Note */}
      {showAgent ? (
        <div className="bg-[#F1EFE9] rounded-2xl p-5 border border-[#EAE7E0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#4A5D4E] shadow-2xs shrink-0">
              <Sparkles className="w-5 h-5 text-[#C18C5D]" />
            </div>
            <div>
              <h5 className="font-bold text-xs sm:text-sm text-[#2D362E]">
                Why your Loan Officer + Real Estate Agent must be in sync:
              </h5>
              <p className="text-[11px] text-[#606C5D]">
                When structuring purchase offers, your agent verifies seller credit limits (IPC) with Mike in real-time, preventing wasted concession dollars or loan denial triggers.
              </p>
            </div>
          </div>
          <div className="text-[11px] font-bold text-[#4A5D4E] shrink-0">
            ✓ Real-Time IPC & Pre-Approval Checks
          </div>
        </div>
      ) : (
        <div className="bg-[#F1EFE9] rounded-2xl p-5 border border-[#EAE7E0] flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#4A5D4E] shadow-2xs shrink-0">
              <CheckCircle2 className="w-5 h-5 text-[#4A5D4E]" />
            </div>
            <div>
              <h5 className="font-bold text-xs sm:text-sm text-[#2D362E]">
                Direct Pre-Approval Advantage with {loanOfficer.name}:
              </h5>
              <p className="text-[11px] text-[#606C5D]">
                Get verified directly underwritten financing options, accurate Oregon/Washington property tax estimates, and personalized rate buydown calculations.
              </p>
            </div>
          </div>
          <div className="text-[11px] font-bold text-[#4A5D4E] shrink-0">
            ✓ Direct Lender Pre-Approval
          </div>
        </div>
      )}

      {/* QR Code Modal for Phone Camera Scanning */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 border border-[#EAE7E0] shadow-2xl animate-in zoom-in-95 duration-150 text-[#2D362E] text-center">
            <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-3 text-left">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#D4A373]"></div>
                <h4 className="font-serif font-bold text-lg text-[#2D362E]">
                  Scan to Start Application
                </h4>
              </div>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-xs text-[#9A9488] hover:text-[#2D362E] p-1"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3">
              <div className="inline-block p-4 bg-[#FAF9F5] border-2 border-[#EAE7E0] rounded-2xl shadow-inner">
                <img 
                  src={qrCodeUrl} 
                  alt="Loan Officer Pre-Approval QR Code" 
                  className="w-48 h-48 sm:w-56 sm:h-56 mx-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="space-y-1">
                <h5 className="font-bold text-sm text-[#2D362E]">
                  Point Your Phone Camera at the QR Code
                </h5>
                <p className="text-xs text-[#606C5D] leading-relaxed max-w-xs mx-auto">
                  Instantly open <strong className="text-[#2D362E]">{loanOfficer.name}</strong>'s official HomeTrac secure pre-approval application on your mobile device.
                </p>
              </div>
            </div>

            <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#EAE7E0] space-y-2 text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A9488] block">
                Direct Portal Link:
              </span>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={leadGenUrl} 
                  className="flex-1 bg-white border border-[#EAE7E0] rounded-lg px-2.5 py-1.5 text-xs text-[#606C5D] select-all font-mono"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-lg bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-bold flex items-center gap-1 shrink-0 transition-colors"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-[#D4A373]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? "Copied!" : "Copy"}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="flex-1 py-2.5 text-xs font-semibold text-[#606C5D] hover:bg-[#F1EFE9] rounded-xl border border-[#EAE7E0]"
              >
                Close Window
              </button>
              <a
                href={leadGenUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-white bg-[#4A5D4E] hover:bg-[#38463B] rounded-xl shadow-xs"
              >
                <span>Open in Browser</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Direct Message Modal */}
      {showDirectMsgModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-[#EAE7E0] shadow-2xl animate-in zoom-in-95 duration-150 text-[#2D362E]">
            <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#4A5D4E]"></div>
                <h4 className="font-serif font-bold text-lg text-[#2D362E]">
                  Message {showAgent && activeAgent ? `${loanOfficer.name} & ${activeAgent.name}` : loanOfficer.name}
                </h4>
              </div>
              <button
                onClick={() => setShowDirectMsgModal(false)}
                className="text-xs text-[#9A9488] hover:text-[#2D362E]"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#606C5D]">Your Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Miller"
                  value={buyerMsg.name}
                  onChange={(e) => setBuyerMsg(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#606C5D]">Email Address <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    required
                    placeholder="jordan@example.com"
                    value={buyerMsg.email}
                    onChange={(e) => setBuyerMsg(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#4A5D4E]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#606C5D]">Cell Phone <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    required
                    placeholder="(503) 555-0199"
                    value={buyerMsg.phone}
                    onChange={(e) => setBuyerMsg(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#4A5D4E]"
                  />
                </div>
              </div>

              {/* Lead Gen Mindset: Desired City and Curated Low/No Down Payment Home List */}
              <div className="bg-[#FAF9F5] p-3 rounded-xl border border-[#EAE7E0] space-y-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2D362E] flex items-center justify-between">
                    <span>Desired City or Neighborhood in Oregon</span>
                    <span className="text-[10px] font-normal text-[#8C5D30]">Curated Low/No Down Homes</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Portland, Beaverton, Bend, Eugene, Salem, Gresham..."
                    value={buyerMsg.desiredCity}
                    onChange={(e) => setBuyerMsg(prev => ({ ...prev, desiredCity: e.target.value }))}
                    className="w-full bg-white border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#4A5D4E]"
                  />
                </div>

                <label className="flex items-start gap-2 cursor-pointer select-none pt-1">
                  <input
                    type="checkbox"
                    checked={buyerMsg.wantsCuratedList}
                    onChange={(e) => setBuyerMsg(prev => ({ ...prev, wantsCuratedList: e.target.checked }))}
                    className="mt-0.5 rounded border-[#9A9488] text-[#4A5D4E] focus:ring-[#4A5D4E]"
                  />
                  <span className="text-[11px] text-[#2D362E] font-medium leading-tight">
                    Yes, send me a curated list of recently listed homes for sale in {buyerMsg.desiredCity ? <strong>{buyerMsg.desiredCity}</strong> : "my desired area"} that likely can accept low or no down payment options.
                  </span>
                </label>
              </div>

              {/* TCPA SMS Consent Question */}
              <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-[#EAE7E0] space-y-1">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={buyerMsg.smsConsentAuthorized}
                    onChange={(e) => setBuyerMsg(prev => ({ ...prev, smsConsentAuthorized: e.target.checked }))}
                    className="mt-0.5 rounded border-[#9A9488] text-[#4A5D4E] focus:ring-[#4A5D4E]"
                  />
                  <span className="text-[11px] text-[#2D362E] font-semibold leading-tight">
                    I authorize team to send text messages (SMS) regarding rate updates, DPA grants, and requested property listings.
                  </span>
                </label>
                <p className="text-[10px] text-[#9A9488] pl-5">
                  Msg & data rates may apply. Reply STOP to cancel anytime.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#606C5D]">What would you like assistance with?</label>
                <textarea
                  rows={3}
                  required
                  placeholder={`I'm planning to buy in the next 1-6 months. I'd like to get pre-approved with ${loanOfficer.name.split(" ")[0]}...`}
                  value={buyerMsg.notes}
                  onChange={(e) => setBuyerMsg(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl p-3 text-xs focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDirectMsgModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#606C5D] hover:bg-[#F1EFE9] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#4A5D4E] hover:bg-[#38463B] rounded-xl shadow-xs"
                >
                  {showAgent ? "Send Message Directly to Team" : `Send Message to ${loanOfficer.name.split(" ")[0]}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
