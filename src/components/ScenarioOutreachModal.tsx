import React, { useState } from "react";
import { 
  X, 
  Mail, 
  MessageSquare, 
  Copy, 
  Check, 
  Send, 
  Sparkles, 
  DollarSign, 
  User, 
  Building, 
  ShieldCheck, 
  ExternalLink,
  ChevronRight,
  BookmarkCheck
} from "lucide-react";
import { SavedScenario, CapturedLead, LoanOfficerProfile, RealEstateAgentProfile } from "../types";
import { formatUSD } from "../utils/mortgageMath";
import { launchLocalOutlookDraft, appendWorkEmailSignature } from "../utils/outlookEmailService";

interface ScenarioOutreachModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: SavedScenario;
  lead: CapturedLead;
  loanOfficer?: LoanOfficerProfile;
  agent?: RealEstateAgentProfile;
  onSendEmail?: (to: string, subject: string, body: string) => void;
  onSendSms?: (to: string, text: string) => void;
  onOpenFullEmailModal?: (leadId: string, customSubject?: string, customBody?: string) => void;
  onOpenFullSmsModal?: (leadId: string, initialText?: string) => void;
}

export const ScenarioOutreachModal: React.FC<ScenarioOutreachModalProps> = ({
  isOpen,
  onClose,
  scenario,
  lead,
  loanOfficer,
  agent,
  onSendEmail,
  onSendSms,
  onOpenFullEmailModal,
  onOpenFullSmsModal,
}) => {
  const [activeChannel, setActiveChannel] = useState<"borrower_email" | "borrower_sms" | "realtor_email">("borrower_email");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Editable draft states
  const [borrowerEmailSubject, setBorrowerEmailSubject] = useState(scenario.draftBorrowerEmailSubject);
  const [borrowerEmailBody, setBorrowerEmailBody] = useState(() => 
    appendWorkEmailSignature(scenario.draftBorrowerEmailBody, loanOfficer)
  );
  const [borrowerSmsText, setBorrowerSmsText] = useState(scenario.draftBorrowerSmsText);
  const [realtorEmailSubject, setRealtorEmailSubject] = useState(scenario.draftRealtorEmailSubject);
  const [realtorEmailBody, setRealtorEmailBody] = useState(() => 
    appendWorkEmailSignature(scenario.draftRealtorEmailBody, loanOfficer)
  );

  const [isSending, setIsSending] = useState(false);
  const [sentSuccessMsg, setSentSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleQuickSend = async () => {
    setIsSending(true);
    setSentSuccessMsg(null);

    try {
      if (activeChannel === "borrower_email") {
        launchLocalOutlookDraft({
          to: lead.email,
          subject: borrowerEmailSubject,
          body: borrowerEmailBody,
          loanOfficer,
          lead,
          agent,
          templateName: "Scenario Lead Outreach"
        });
        if (onSendEmail) {
          onSendEmail(lead.email, borrowerEmailSubject, borrowerEmailBody);
        }
        setSentSuccessMsg(`✓ Pre-filled scenario email launched in Outlook with work email signature for ${lead.email}`);
      } else if (activeChannel === "borrower_sms") {
        if (onSendSms) {
          onSendSms(lead.phone, borrowerSmsText);
        }
        setSentSuccessMsg(`✓ Pre-filled scenario SMS dispatched to ${lead.phone}`);
      } else if (activeChannel === "realtor_email") {
        const realtorEmail = agent?.email || "sarah.jenkins@cascadevalleyre.com";
        launchLocalOutlookDraft({
          to: realtorEmail,
          subject: realtorEmailSubject,
          body: realtorEmailBody,
          loanOfficer,
          lead,
          agent,
          templateName: "Realtor Scenario Update"
        });
        if (onSendEmail) {
          onSendEmail(realtorEmail, realtorEmailSubject, realtorEmailBody);
        }
        setSentSuccessMsg(`✓ Co-brand realtor update email launched in Outlook with work email signature for ${realtorEmail}`);
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#EAE7E0] overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-[#2D362E] text-white p-5 sm:p-6 shrink-0 flex items-start justify-between border-b border-white/10">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#4A5D4E] border border-white/20 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
              <Sparkles className="w-5 h-5 text-[#C18C5D]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#C18C5D] text-white">
                  Scenario Saved to Profile
                </span>
                <span className="text-xs text-white/80 font-mono">
                  {formatUSD(scenario.targetPrice)} • {scenario.loanProgram} • {formatUSD(scenario.totalMonthlyPayment)}/mo
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1">
                Ready-Made Outreach Drafts for {lead.fullName}
              </h2>
              <p className="text-xs text-white/70">
                AI Studio has pre-filled complete email & SMS templates with exact calculated payment numbers.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Scenario Snapshot Pill */}
        <div className="bg-[#FAF9F5] px-6 py-3 border-b border-[#EAE7E0] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-[#606C5D]">
              <strong>Lead:</strong> {lead.fullName} ({lead.email})
            </span>
            <span className="text-[#606C5D]">
              <strong>P&I:</strong> {formatUSD(scenario.monthlyPrincipalInterest)}
            </span>
            <span className="text-[#606C5D]">
              <strong>Taxes+Ins:</strong> {formatUSD(scenario.monthlyPropertyTax + scenario.monthlyHomeInsurance)}
            </span>
            <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Total PITI: {formatUSD(scenario.totalMonthlyPayment)}/mo
            </span>
          </div>

          <span className="text-[11px] text-[#9A9488] font-mono">
            Saved {new Date(scenario.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Channel Selection Tabs */}
        <div className="flex border-b border-[#EAE7E0] px-6 pt-3 gap-2 bg-white shrink-0 overflow-x-auto">
          {[
            { id: "borrower_email", label: "📧 Borrower Email Draft", icon: Mail, recipient: lead.email },
            { id: "borrower_sms", label: "💬 Borrower SMS Draft", icon: MessageSquare, recipient: lead.phone },
            { id: "realtor_email", label: "🤝 Co-Brand Realtor Email", icon: Building, recipient: agent?.name || "Sarah Jenkins" },
          ].map(tab => {
            const isActive = activeChannel === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveChannel(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? "border-[#4A5D4E] text-[#2D362E] bg-[#FAF9F5] rounded-t-xl"
                    : "border-transparent text-[#606C5D] hover:text-[#2D362E]"
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content & Editors */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {sentSuccessMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs text-emerald-900 font-bold flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center gap-2">
                <BookmarkCheck className="w-4 h-4 text-emerald-700" />
                <span>{sentSuccessMsg}</span>
              </div>
              <button onClick={() => setSentSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 1. Borrower Email Tab */}
          {activeChannel === "borrower_email" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#2D362E]">Recipient: <span className="font-normal text-[#606C5D]">{lead.fullName} &lt;{lead.email}&gt;</span></span>
                <button
                  onClick={() => handleCopy(`${borrowerEmailSubject}\n\n${borrowerEmailBody}`, "b_email")}
                  className="flex items-center gap-1 text-[#4A5D4E] hover:text-[#38463B] font-bold text-xs"
                >
                  {copiedKey === "b_email" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === "b_email" ? "Copied Full Email!" : "Copy Text"}</span>
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#606C5D] uppercase tracking-wider mb-1">Subject Line</label>
                <input
                  type="text"
                  value={borrowerEmailSubject}
                  onChange={(e) => setBorrowerEmailSubject(e.target.value)}
                  className="w-full bg-white border border-[#EAE7E0] rounded-xl p-3 text-xs font-semibold text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#606C5D] uppercase tracking-wider mb-1">Email Body (Pre-Filled with Scenario Results)</label>
                <textarea
                  rows={11}
                  value={borrowerEmailBody}
                  onChange={(e) => setBorrowerEmailBody(e.target.value)}
                  className="w-full bg-white border border-[#EAE7E0] rounded-xl p-3 text-xs text-[#2D362E] focus:outline-none focus:border-[#4A5D4E] leading-relaxed font-sans"
                />
              </div>
            </div>
          )}

          {/* 2. Borrower SMS Tab */}
          {activeChannel === "borrower_sms" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#2D362E]">Recipient: <span className="font-normal text-[#606C5D]">{lead.fullName} ({lead.phone})</span></span>
                <button
                  onClick={() => handleCopy(borrowerSmsText, "b_sms")}
                  className="flex items-center gap-1 text-[#4A5D4E] hover:text-[#38463B] font-bold text-xs"
                >
                  {copiedKey === "b_sms" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === "b_sms" ? "Copied SMS Text!" : "Copy Text"}</span>
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#606C5D] uppercase tracking-wider mb-1">SMS Message Content (Pre-Formatted with PITI)</label>
                <textarea
                  rows={5}
                  value={borrowerSmsText}
                  onChange={(e) => setBorrowerSmsText(e.target.value)}
                  className="w-full bg-white border border-[#EAE7E0] rounded-xl p-3 text-xs text-[#2D362E] focus:outline-none focus:border-[#4A5D4E] leading-relaxed font-sans"
                />
                <div className="flex justify-between items-center mt-1 text-[11px] text-[#9A9488]">
                  <span>Characters: {borrowerSmsText.length} (~{Math.ceil(borrowerSmsText.length / 160)} SMS segment)</span>
                  {lead.smsConsentAuthorized ? (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> TCPA Opt-In Verified
                    </span>
                  ) : (
                    <span className="text-amber-700 font-bold">Standard SMS Outreach</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3. Realtor Co-Brand Tab */}
          {activeChannel === "realtor_email" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#2D362E]">
                  Co-Brand Realtor: <span className="font-normal text-[#606C5D]">{agent?.name || "Sarah Jenkins"} ({agent?.email || "sarah.jenkins@cascadevalleyre.com"})</span>
                </span>
                <button
                  onClick={() => handleCopy(`${realtorEmailSubject}\n\n${realtorEmailBody}`, "r_email")}
                  className="flex items-center gap-1 text-[#4A5D4E] hover:text-[#38463B] font-bold text-xs"
                >
                  {copiedKey === "r_email" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === "r_email" ? "Copied Realtor Update!" : "Copy Text"}</span>
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#606C5D] uppercase tracking-wider mb-1">Subject Line</label>
                <input
                  type="text"
                  value={realtorEmailSubject}
                  onChange={(e) => setRealtorEmailSubject(e.target.value)}
                  className="w-full bg-white border border-[#EAE7E0] rounded-xl p-3 text-xs font-semibold text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#606C5D] uppercase tracking-wider mb-1">Realtor Partner Update Body</label>
                <textarea
                  rows={9}
                  value={realtorEmailBody}
                  onChange={(e) => setRealtorEmailBody(e.target.value)}
                  className="w-full bg-white border border-[#EAE7E0] rounded-xl p-3 text-xs text-[#2D362E] focus:outline-none focus:border-[#4A5D4E] leading-relaxed font-sans"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-[#FAF9F5] p-4 sm:p-5 border-t border-[#EAE7E0] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {onOpenFullEmailModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFullEmailModal(
                    lead.id,
                    activeChannel === "realtor_email" ? realtorEmailSubject : borrowerEmailSubject,
                    activeChannel === "realtor_email" ? realtorEmailBody : borrowerEmailBody
                  );
                }}
                className="px-3.5 py-2 text-xs font-bold text-[#4A5D4E] bg-white border border-[#EAE7E0] hover:bg-[#EAE7E0] rounded-xl flex items-center gap-1.5 transition-all shadow-2xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Full Email Suite</span>
              </button>
            )}

            {onOpenFullSmsModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFullSmsModal(lead.id, borrowerSmsText);
                }}
                className="px-3.5 py-2 text-xs font-bold text-[#4A5D4E] bg-white border border-[#EAE7E0] hover:bg-[#EAE7E0] rounded-xl flex items-center gap-1.5 transition-all shadow-2xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Open SMS Hub</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#606C5D] hover:bg-[#EAE7E0] rounded-xl transition-colors"
            >
              Done / Close
            </button>

            <button
              type="button"
              onClick={handleQuickSend}
              disabled={isSending}
              className={`px-5 py-2 text-xs font-bold text-white rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                activeChannel.includes("email") 
                  ? "bg-[#0078D4] hover:bg-[#005A9E]" 
                  : "bg-[#4A5D4E] hover:bg-[#38463B]"
              }`}
            >
              {activeChannel.includes("email") ? (
                <>
                  <Mail className="w-3.5 h-3.5 text-white" />
                  <span>{isSending ? "Opening Outlook..." : "Draft in Outlook (Work Signature)"}</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSending ? "Sending SMS..." : "Quick Dispatch SMS"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
