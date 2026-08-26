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
  Globe
} from "lucide-react";
import { LoanOfficerProfile, RealEstateAgentProfile } from "../types";

interface LocalProfessionalGuidesProps {
  loanOfficer: LoanOfficerProfile;
  activeAgent?: RealEstateAgentProfile;
  isCoBranded?: boolean;
  onOpenLoPortal?: () => void;
  title?: string;
  subtitle?: string;
}

export const LocalProfessionalGuides: React.FC<LocalProfessionalGuidesProps> = ({
  loanOfficer,
  activeAgent,
  isCoBranded = false,
  onOpenLoPortal,
  title,
  subtitle,
}) => {
  const [contactSuccess, setContactSuccess] = useState<string | null>(null);
  const [showDirectMsgModal, setShowDirectMsgModal] = useState<boolean>(false);
  const [buyerMsg, setBuyerMsg] = useState({ name: "", email: "", phone: "", notes: "" });

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
    setContactSuccess(`Thank you! Your message has been sent directly to ${recipientText}. They will reach out to you within 2-4 business hours.`);
    setShowDirectMsgModal(false);
    setBuyerMsg({ name: "", email: "", phone: "", notes: "" });
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

        {/* Quick Contact CTA */}
        <div className="flex flex-col sm:items-end gap-2 shrink-0">
          <button
            id="contact-guides-btn"
            onClick={() => setShowDirectMsgModal(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white font-semibold text-xs shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
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
              <img
                src={loanOfficer.headshotUrl || "/mike-ford-headshot.jpg"}
                alt={loanOfficer.name}
                referrerPolicy="no-referrer"
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-white shadow-md shrink-0 bg-[#EAE7E0]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/mike-ford-headshot.jpg";
                }}
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
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-[#D4A373]" />
              <span>Schedule Free Pre-Approval Call with {loanOfficer.name.split(" ")[0]}</span>
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
                <img
                  src={activeAgent.headshotUrl}
                  alt={activeAgent.name}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-white shadow-md shrink-0 bg-[#EAE7E0]"
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
                  <label className="text-xs font-semibold text-[#606C5D]">Email Address</label>
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
                  <label className="text-xs font-semibold text-[#606C5D]">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="(503) 555-0199"
                    value={buyerMsg.phone}
                    onChange={(e) => setBuyerMsg(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#4A5D4E]"
                  />
                </div>
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
