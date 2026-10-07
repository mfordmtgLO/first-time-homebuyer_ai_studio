import React, { useState } from "react";
import {
  MessageSquare,
  Send,
  Paperclip,
  X,
  CheckCircle2,
  Clock,
  Zap,
  Phone,
  FileText,
  Home,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  Sparkles,
  PlusCircle,
  Play,
  Pause,
  MailCheck,
  Settings
} from "lucide-react";
import { CapturedLead, LoanOfficerProfile, RealEstateAgentProfile, PropertyListing, SmsTemplate } from "../types";
import { DEFAULT_SMS_TEMPLATES } from "../data/smsTemplates";
import { TwilioSettingsModal, getSavedTwilioConfig } from "./TwilioSettingsModal";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

interface SmsMessagingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: CapturedLead;
  loanOfficer: LoanOfficerProfile;
  agent?: RealEstateAgentProfile;
  onUpdateLead: (updatedLead: CapturedLead) => void;
  syncedProperties?: PropertyListing[];
  smsTemplates?: SmsTemplate[];
}

export const FLYER_ATTACHMENTS = [
  {
    id: "flyer-ohcs-dpa",
    title: "OHCS $10,000 Down Payment Grant Overview Flyer",
    type: "flyer" as const,
    url: "https://www.oregon.gov/ohcs/homeownership/pages/first-time-homebuyer.aspx",
    previewText: "Attached: Oregon OHCS Down Payment Assistance Grant Guide (Up to $10,000 towards down payment)."
  },
  {
    id: "flyer-rate-buydown",
    title: "2-1 Temporary Rate Buydown Savings Breakdown",
    type: "flyer" as const,
    url: "/flyers/rate-buydown-calculator-flyer.pdf",
    previewText: "Attached: 2-1 Rate Buydown Sheet showing $340/mo initial payment savings."
  },
  {
    id: "flyer-usda-zero-down",
    title: "USDA 100% Zero-Down Rural Financing Flyer",
    type: "flyer" as const,
    url: "/flyers/usda-zero-down-eligibility.pdf",
    previewText: "Attached: USDA 100% Zero Down Rural Financing Eligibility Map & Guide."
  },
  {
    id: "flyer-fha-flex",
    title: "FHA 3.5% Flex Down & DPA Combo Flyer",
    type: "flyer" as const,
    url: "/flyers/fha-3point5-flex-dpa.pdf",
    previewText: "Attached: FHA 3.5% Down Payment + Oregon Bond Cash Advantage Flyer."
  }
];

export const PROPERTY_LIST_ATTACHMENTS = [
  {
    id: "list-pdx-zero-down",
    title: "Portland Metro Low/No Down Payment Home List",
    type: "property_list" as const,
    url: "https://oregonhomeloans.example.com/listings/portland-low-down",
    previewText: "Attached: 8 Active Portland Metro Homes Qualifying for $0 Down USDA / DPA Grants."
  },
  {
    id: "list-bend-redmond",
    title: "Central Oregon (Bend & Redmond) Starter Homes",
    type: "property_list" as const,
    url: "https://oregonhomeloans.example.com/listings/bend-redmond-starter",
    previewText: "Attached: 6 Central Oregon Starter Homes under $480k with DPA Grant Eligibility."
  },
  {
    id: "list-willamette-valley",
    title: "Salem & Eugene Starter Homes Collection",
    type: "property_list" as const,
    url: "https://oregonhomeloans.example.com/listings/salem-eugene-homes",
    previewText: "Attached: Curated Salem & Eugene Starter Homes under $410,000."
  }
];

export const QUICK_SMS_TEMPLATES = [
  {
    name: "Grant & DPA Alert",
    text: "Hi {{firstName}}! This is {{loName}} with {{company}}. Great news — you qualify for the Oregon Down Payment Assistance program (up to $10k towards your down payment). Would you like me to text over the 1-page grant flyer?"
  },
  {
    name: "Low/No Down List",
    text: "Hi {{firstName}}, {{loName}} here! I put together a curated list of homes in {{location}} that qualify for $0 down USDA or 3.5% DPA grants. Here is the direct view link:"
  },
  {
    name: "Rate Buydown Breakdown",
    text: "Hi {{firstName}}! Quick update on mortgage options for your target ${{targetPrice}} budget: A 2-1 seller rate buydown drops your Year 1 monthly payment by $340/mo. Check out the attached breakdown flyer!"
  },
  {
    name: "Pre-Approval FastTrack",
    text: "Hi {{firstName}}, checking in on your home search timeline! Our fast-track pre-approval takes just 10 minutes online without impacting your credit score. Do you have 5 minutes for a quick call today?"
  }
];

export const TEXT_NURTURE_STEPS = [
  {
    stepNumber: 1,
    timing: "Day 1 (Immediate Intake)",
    templateName: "Welcome & OHCS $10k Grant Calculator Link",
    messageText: "Welcome {{firstName}}! Thanks for chatting with {{loName}}. Here is your interactive Oregon Down Payment Assistance calculator & grant roadmap: https://example.com/dpa-calc"
  },
  {
    stepNumber: 2,
    timing: "Day 3 (Follow Up)",
    templateName: "Curated Low/No Down Property List Link",
    messageText: "Hi {{firstName}}! We compiled a custom list of {{location}} homes with $0 down USDA and 3.5% DPA financing options: https://example.com/listings/curated"
  },
  {
    stepNumber: 3,
    timing: "Day 7 (Strategy)",
    templateName: "2-1 Temporary Rate Buydown Savings Breakdown",
    messageText: "Hi {{firstName}}! Want to lower your monthly payment by $300+/mo in Year 1? Learn how seller-funded rate buydowns work here: https://example.com/rate-buydown"
  },
  {
    stepNumber: 4,
    timing: "Day 14 (Check-in)",
    templateName: "Pre-Approval FastTrack & LO Strategy Call",
    messageText: "Hi {{firstName}}! Ready to start touring homes in {{location}}? Let's get your official Pre-Approval letter issued. Reply back or book 10 mins with {{loName}}: https://calendly.com/mikefordlo"
  }
];

export const SmsMessagingModal: React.FC<SmsMessagingModalProps> = ({
  isOpen,
  onClose,
  lead,
  loanOfficer,
  agent,
  onUpdateLead,
  syncedProperties = [],
  smsTemplates = [],
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<"chat" | "nurture">("chat");
  const [messageText, setMessageText] = useState<string>("");
  const [selectedFlyerId, setSelectedFlyerId] = useState<string>("");
  const [selectedListId, setSelectedListId] = useState<string>("");
  const [showAttachmentMenu, setShowAttachmentMenu] = useState<boolean>(false);
  const [showTemplateMenu, setShowTemplateMenu] = useState<boolean>(false);
  const [showTwilioSettings, setShowTwilioSettings] = useState<boolean>(false);
  const [twilioDispatchStatus, setTwilioDispatchStatus] = useState<string | null>(null);
  const [previewAttachment, setPreviewAttachment] = useState<{ url: string; title: string; type: string } | null>(null);

  const firstName = lead.fullName ? lead.fullName.split(" ")[0] : "there";
  const loName = loanOfficer.name.split(" ")[0];

  // Default initial SMS messages if none exist yet
  const initialSmsList = lead.smsMessages && lead.smsMessages.length > 0 ? lead.smsMessages : [
    {
      id: "sms-init-1",
      direction: "outbound" as const,
      text: `Hi ${firstName}! This is ${loanOfficer.name} (NMLS #${loanOfficer.nmlsId}). Thank you for requesting prequalification details for Oregon homebuyer grant options!`,
      timestamp: lead.createdAt || new Date().toISOString(),
      status: "delivered" as const
    },
    {
      id: "sms-init-2",
      direction: "inbound" as const,
      text: `Hi ${loName}! Thanks for reaching out. Yes, we are looking for homes around ${lead.targetPriceRange || "$450k"} in ${lead.preferredLocations || "Oregon"}.`,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: "read" as const
    }
  ];

  const [smsHistory, setSmsHistory] = useState(initialSmsList);

  const handleApplyTemplate = (tplText: string) => {
    const tract = lead.spatialProfile?.censusTract || "Local Area";
    const coBrand = "https://homebuyer.oregon.gov/" + (loanOfficer.id?.replace("lo-", "") || "guide");
    const replaced = tplText
      .replace(/{{firstName}}/g, firstName)
      .replace(/{{loName}}/g, loName)
      .replace(/{{agentName}}/g, agent?.name || "Your Real Estate Partner")
      .replace(/{{company}}/g, loanOfficer.company || "Guild Mortgage")
      .replace(/{{location}}/g, lead.preferredLocations || lead.spatialProfile?.county || "Oregon")
      .replace(/{{targetPrice}}/g, lead.targetPriceRange || "425,000")
      .replace(/{{tract}}/g, tract)
      .replace(/\[Tract\]/g, tract)
      .replace(/{{coBrandUrl}}/g, coBrand);

    setMessageText(replaced);
  };

  const handleSendSms = async () => {
    if (!messageText.trim() && !selectedFlyerId && !selectedListId) return;

    let attachedItem: { attachmentUrl?: string; attachmentType?: 'flyer' | 'property_list' | 'link'; attachmentTitle?: string } = {};

    if (selectedFlyerId) {
      const flyer = FLYER_ATTACHMENTS.find(f => f.id === selectedFlyerId);
      if (flyer) {
        attachedItem = {
          attachmentUrl: flyer.url,
          attachmentType: "flyer",
          attachmentTitle: flyer.title
        };
      }
    } else if (selectedListId) {
      const pList = PROPERTY_LIST_ATTACHMENTS.find(p => p.id === selectedListId);
      if (pList) {
        attachedItem = {
          attachmentUrl: pList.url,
          attachmentType: "property_list",
          attachmentTitle: pList.title
        };
      }
    }

    const currentMsgText = messageText;

    const newMsg = {
      id: `sms-msg-${Date.now()}`,
      direction: "outbound" as const,
      text: currentMsgText,
      timestamp: new Date().toISOString(),
      status: "delivered" as const,
      ...attachedItem
    };

    const updatedSmsList = [...smsHistory, newMsg];
    setSmsHistory(updatedSmsList);

    // Reset inputs
    setMessageText("");
    setSelectedFlyerId("");
    setSelectedListId("");
    setShowAttachmentMenu(false);

    // Save to lead
    onUpdateLead({
      ...lead,
      smsMessages: updatedSmsList,
      lastTextSentAt: new Date().toISOString(),
      lastTextTemplateName: selectedFlyerId ? "Flyer Attachment SMS" : (selectedListId ? "Property List Attachment SMS" : "Custom Direct Text")
    });

    // Attempt Twilio Carrier API dispatch if credentials saved
    try {
      const reqBody: any = {
        to: lead.phone,
        message: currentMsgText,
        attachmentUrl: attachedItem.attachmentUrl
      };

      // 1. Resolve Loan Officer's Individual Twilio BYOK credentials
      const loTwilioCfg = loanOfficer?.id ? getSavedTwilioConfig(loanOfficer.id) : getSavedTwilioConfig();
      const sid = loanOfficer?.twilioAccountSid || loTwilioCfg.accountSid;
      const authToken = loanOfficer?.twilioAuthToken || loTwilioCfg.authToken;
      const fromNumber = loanOfficer?.twilioPhoneNumber || loTwilioCfg.phoneNumber;

      if (auth.currentUser) {
        // Attempt to fetch vault for this specific LO or current user
        const targetVaultId = loanOfficer?.id || auth.currentUser.uid;
        try {
          const docRef = doc(db, "twilio_vault", targetVaultId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().encryptedVault) {
            reqBody.encryptedVault = docSnap.data().encryptedVault;
          }
        } catch (vErr) {
          console.warn("Vault lookup notice:", vErr);
        }
      }

      // Fallback if they haven't saved to vault: use LO's BYOK credentials
      if (!reqBody.encryptedVault) {
        if (!sid || !authToken || !fromNumber) {
          console.warn("Twilio BYOK credentials not configured for LO:", loanOfficer?.name);
          return;
        }
        reqBody.accountSid = sid;
        reqBody.authToken = authToken;
        reqBody.fromNumber = fromNumber;
      }

      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
      let data: any = null;
      try {
        const res = await fetch("/api/twilio/send-sms", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            ...(token && { "Authorization": `Bearer ${token}` })
          },
          body: JSON.stringify(reqBody)
        });
        const text = await res.text();
        try {
          data = JSON.parse(text);
        } catch {
          // not json
        }
      } catch (e: any) {
        console.warn("Backend /api/twilio/send-sms error:", e);
      }
      
      if (data && data.success) {
        setTwilioDispatchStatus(`📡 Live Twilio SMS sent from ${fromNumber || "Twilio"} to ${lead.phone} (SID: ${data.messageSid?.slice(0, 8)}...)`);
      } else if (data && data.error) {
        setTwilioDispatchStatus(`⚠️ Twilio notice: ${data.error === "twilio_dormant" ? "Twilio live transmission is dormant (in-app notes active)." : data.error}`);
      }
    } catch (e: any) {
      console.warn("Backend /api/twilio/send-sms error:", e);
      setTwilioDispatchStatus("⚠️ SMS send failed (Twilio dormant / server unavailable).");
    }
    setTimeout(() => setTwilioDispatchStatus(null), 6000);
  };


  const handleToggleTextNurture = () => {
    const isCurrentlyEnabled = lead.textNurtureEnabled ?? true;
    const nextState = !isCurrentlyEnabled;

    onUpdateLead({
      ...lead,
      textNurtureEnabled: nextState,
      textNurtureStageText: nextState
        ? `${lead.textNurtureCurrentStep || 1} of ${lead.textNurtureTotalSteps || 4} automated text nurture active`
        : "Text Nurture Paused"
    });
  };

  const handleTriggerNextNurtureStep = () => {
    const currentStep = lead.textNurtureCurrentStep || 1;
    const stepConfig = TEXT_NURTURE_STEPS.find(s => s.stepNumber === currentStep) || TEXT_NURTURE_STEPS[0];

    const filledText = stepConfig.messageText
      .replace(/{{firstName}}/g, firstName)
      .replace(/{{loName}}/g, loName)
      .replace(/{{location}}/g, lead.preferredLocations || "Oregon");

    const newNurtureMsg = {
      id: `sms-nurture-${Date.now()}`,
      direction: "outbound" as const,
      text: `[Automated Text Nurture - Step ${currentStep}]: ${filledText}`,
      timestamp: new Date().toISOString(),
      status: "delivered" as const
    };

    const nextStepNum = Math.min(4, currentStep + 1);
    const updatedSmsList = [...smsHistory, newNurtureMsg];

    const newLog = {
      id: `log-txt-${Date.now()}`,
      stepNumber: currentStep,
      templateName: stepConfig.templateName,
      messageText: filledText,
      sentAt: new Date().toISOString(),
      status: "delivered" as const
    };

    const existingLogs = lead.textNurtureLogs || [];

    onUpdateLead({
      ...lead,
      smsMessages: updatedSmsList,
      textNurtureCurrentStep: nextStepNum,
      textNurtureStageText: `${nextStepNum} of 4 automated text nurture sent`,
      lastTextSentAt: new Date().toISOString(),
      lastTextTemplateName: "Automated Nurture SMS",
      textNurtureLogs: [newLog, ...existingLogs],
      outreachLogs: [
        {
          id: `auto-sms-${Date.now()}`,
          timestamp: new Date().toISOString(),
          channel: 'sms',
          templateName: "Automated Nurture SMS",
          recipientName: lead.fullName,
          notes: `Automated Nurture Step ${nextStepNum}`
        },
        ...(lead.outreachLogs || [])
      ]
    });

    setSmsHistory(updatedSmsList);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#2D362E] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-inner">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-base text-white tracking-tight">
                  SMS Text Hub: {lead.fullName}
                </h3>
                <span className="text-xs font-mono text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800">
                  {lead.phone}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-stone-300 mt-0.5">
                {lead.smsConsentAuthorized ?? true ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    TCPA Consent Authorized ({lead.smsConsentTimestamp ? new Date(lead.smsConsentTimestamp).toLocaleDateString() : "Opted In"})
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-300 font-semibold text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    SMS Consent Not Explicitly Logged (Manual Direct Only)
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTwilioSettings(true)}
              className="px-3 py-1.5 bg-emerald-900/60 hover:bg-emerald-900 text-emerald-200 border border-emerald-700/60 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Configure Twilio API Credentials & Live Carrier Setup"
            >
              <Settings className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Twilio Settings</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close SMS Hub"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Twilio Status Notification */}
        {twilioDispatchStatus && (
          <div className="bg-emerald-950 text-emerald-200 text-xs px-4 py-2 border-b border-emerald-800 font-mono flex items-center gap-2 animate-fade-in shrink-0">
            <span>{twilioDispatchStatus}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white border-b border-[#EAE7E0] px-4 flex items-center justify-between shrink-0">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("chat")}
              className={`py-3 px-2 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "chat"
                  ? "border-[#4A5D4E] text-[#4A5D4E]"
                  : "border-transparent text-[#606C5D] hover:text-[#2D362E]"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>2-Way Text Messaging</span>
              <span className="text-[10px] bg-stone-100 text-[#4A5D4E] px-1.5 py-0.5 rounded-full font-mono">
                {smsHistory.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("nurture")}
              className={`py-3 px-2 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "nurture"
                  ? "border-[#4A5D4E] text-[#4A5D4E]"
                  : "border-transparent text-[#606C5D] hover:text-[#2D362E]"
              }`}
            >
              <Zap className="w-4 h-4 text-emerald-600 fill-emerald-500" />
              <span>Automated Text Nurture Sequence</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                lead.textNurtureEnabled ?? true ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"
              }`}>
                {(lead.textNurtureEnabled ?? true) ? "Active" : "Paused"}
              </span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2.5 text-[11px]">
            <span className="text-[#606C5D]">
              LO: <strong className="text-[#2D362E]">{loanOfficer.name}</strong>
            </span>
            {loanOfficer.twilioPhoneNumber ? (
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Twilio BYOK: {loanOfficer.twilioPhoneNumber}
              </span>
            ) : (
              <span className="bg-stone-100 text-stone-600 border border-stone-200 px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1">
                <Phone className="w-3 h-3 text-stone-400" />
                Default Twilio Pool
              </span>
            )}
          </div>
        </div>

        {/* Tab 1: 2-Way Text Conversation */}
        {activeTab === "chat" && (
          <div className="flex-1 flex flex-col min-h-0 bg-[#F4F3EE]">
            {/* Quick Templates Bar */}
            <div className="bg-white border-b border-[#EAE7E0] p-2.5 flex items-center gap-2 overflow-x-auto shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A9488] shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#C18C5D]" />
                Templates:
              </span>
              {QUICK_SMS_TEMPLATES.map((tpl, i) => (
                <button
                  key={i}
                  onClick={() => handleApplyTemplate(tpl.text)}
                  className="px-2.5 py-1 bg-[#FAF9F5] hover:bg-[#EAE7E0] text-[#2D362E] border border-[#EAE7E0] rounded-xl text-[11px] font-medium whitespace-nowrap transition-colors shrink-0 cursor-pointer"
                >
                  + {tpl.name}
                </button>
              ))}
            </div>

            {/* Chat Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {smsHistory.map((msg) => {
                const isOutbound = msg.direction === "outbound";
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 shadow-2xs space-y-1.5 ${
                        isOutbound
                          ? "bg-[#2D362E] text-white rounded-br-2xs"
                          : "bg-white text-[#2D362E] border border-[#EAE7E0] rounded-bl-2xs"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 text-[10px] text-stone-300">
                        <span className="font-bold">
                          {isOutbound ? `LO ${loanOfficer.name}` : lead.fullName}
                        </span>
                        <span className="font-mono opacity-80">
                          {new Date(msg.timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        </span>
                      </div>

                      <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                      {/* Attachment Card if present */}
                      {msg.attachmentTitle && (
                        <div
                          onClick={() => setPreviewAttachment({
                            url: msg.attachmentUrl || "",
                            title: msg.attachmentTitle || "",
                            type: msg.attachmentType || "flyer"
                          })}
                          className={`p-2.5 rounded-xl text-xs border flex items-center gap-2 mt-2 cursor-pointer transition-colors ${
                            isOutbound
                              ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
                              : "bg-[#FAF9F5] border-[#EAE7E0] text-[#2D362E] hover:bg-[#EAE7E0]"
                          }`}
                        >
                          {msg.attachmentType === "flyer" ? (
                            <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Home className="w-4 h-4 text-[#C18C5D] shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <span className="font-bold block truncate text-[11px]">
                              {msg.attachmentTitle}
                            </span>
                            <span className="text-[10px] opacity-80 block truncate">
                              {msg.attachmentUrl}
                            </span>
                          </div>
                          <a
                            href={msg.attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors shrink-0"
                            title="Open Link"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}

                      <div className="flex justify-end items-center gap-1 text-[9px] font-mono text-stone-400 pt-0.5">
                        {isOutbound && (
                          <span className="text-emerald-400">✓ Delivered</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Attachment Banner */}
            {(selectedFlyerId || selectedListId) && (
              <div 
                className="bg-emerald-50 border-t border-emerald-200 p-2.5 px-4 flex items-center justify-between text-xs text-emerald-900 shrink-0 cursor-pointer hover:bg-emerald-100 transition-colors"
                onClick={() => {
                  const flyer = FLYER_ATTACHMENTS.find(f => f.id === selectedFlyerId);
                  const pList = PROPERTY_LIST_ATTACHMENTS.find(p => p.id === selectedListId);
                  const target = flyer || pList;
                  if (target) {
                    setPreviewAttachment({
                      url: target.url,
                      title: target.title,
                      type: target.type
                    });
                  }
                }}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <Paperclip className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="font-bold">Attached:</span>
                  <span className="truncate">
                    {selectedFlyerId
                      ? FLYER_ATTACHMENTS.find(f => f.id === selectedFlyerId)?.title
                      : PROPERTY_LIST_ATTACHMENTS.find(p => p.id === selectedListId)?.title}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFlyerId("");
                    setSelectedListId("");
                  }}
                  className="text-emerald-700 hover:text-emerald-950 font-bold p-1 cursor-pointer"
                  title="Remove attachment"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Input & Attachments Control Footer */}
            <div className="bg-white border-t border-[#EAE7E0] p-3 space-y-2 shrink-0">
              {/* Attachment Picker Menu */}
              {showAttachmentMenu && (
                <div className="bg-[#FAF9F5] border border-[#EAE7E0] p-3 rounded-2xl space-y-2.5 shadow-md animate-fade-in">
                  <div className="flex justify-between items-center text-xs font-bold text-[#2D362E]">
                    <span className="flex items-center gap-1.5">
                      <Paperclip className="w-4 h-4 text-[#4A5D4E]" />
                      Select PDF Flyer or Low/No Down Property List to Attach:
                    </span>
                    <button
                      onClick={() => setShowAttachmentMenu(false)}
                      className="text-[#9A9488] hover:text-[#2D362E] text-xs font-bold"
                    >
                      Close ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {/* PDF Flyers */}
                    <div className="space-y-1 bg-white p-2.5 rounded-xl border border-[#EAE7E0]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                        <FileText className="w-3 h-3 text-emerald-600" />
                        Co-Branded PDF Flyers
                      </span>
                      <div className="space-y-1">
                        {FLYER_ATTACHMENTS.map((flyer) => (
                          <button
                            key={flyer.id}
                            onClick={() => {
                              setSelectedFlyerId(flyer.id);
                              setSelectedListId("");
                              setShowAttachmentMenu(false);
                            }}
                            className={`w-full text-left p-1.5 rounded-lg text-[11px] transition-colors border cursor-pointer ${
                              selectedFlyerId === flyer.id
                                ? "bg-emerald-100 border-emerald-400 font-bold text-emerald-900"
                                : "hover:bg-stone-50 border-stone-100 text-[#2D362E]"
                            }`}
                          >
                            📄 {flyer.title}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Property Lists */}
                    <div className="space-y-1 bg-white p-2.5 rounded-xl border border-[#EAE7E0]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#C18C5D] flex items-center gap-1">
                        <Home className="w-3 h-3 text-[#C18C5D]" />
                        Low/No Down Property Lists
                      </span>
                      <div className="space-y-1">
                        {PROPERTY_LIST_ATTACHMENTS.map((pList) => (
                          <button
                            key={pList.id}
                            onClick={() => {
                              setSelectedListId(pList.id);
                              setSelectedFlyerId("");
                              setShowAttachmentMenu(false);
                            }}
                            className={`w-full text-left p-1.5 rounded-lg text-[11px] transition-colors border cursor-pointer ${
                              selectedListId === pList.id
                                ? "bg-[#C18C5D]/10 border-[#C18C5D] font-bold text-[#8C5D33]"
                                : "hover:bg-stone-50 border-stone-100 text-[#2D362E]"
                            }`}
                          >
                            🏡 {pList.title}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {showTemplateMenu && (
                <div className="bg-[#FAF9F5] border border-[#EAE7E0] p-3 rounded-2xl space-y-2.5 shadow-md animate-fade-in max-h-60 overflow-y-auto">
                  <div className="flex justify-between items-center text-xs font-bold text-[#2D362E]">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-[#4A5D4E]" />
                      Select a Pre-Written Template:
                    </span>
                    <button
                      onClick={() => setShowTemplateMenu(false)}
                      className="text-[#9A9488] hover:text-[#2D362E] text-xs font-bold"
                    >
                      Close ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {(!smsTemplates || smsTemplates.length === 0 ? DEFAULT_SMS_TEMPLATES : smsTemplates).map(template => (
                      <button
                        key={template.id}
                        onClick={() => {
                          const tract = lead.spatialProfile?.censusTract || "Local Area";
                          const coBrand = "https://homebuyer.oregon.gov/" + (loanOfficer.id?.replace("lo-", "") || "guide");
                          const filledText = template.content
                            .replace(/{{firstName}}/g, firstName)
                            .replace(/\[Name\]/g, firstName)
                            .replace(/{{loName}}/g, loName)
                            .replace(/{{agentName}}/g, agent?.name || "Your Real Estate Partner")
                            .replace(/\[AgentName\]/g, agent?.name?.split(" ")[0] || "Your Agent")
                            .replace(/{{location}}/g, lead.preferredLocations || lead.spatialProfile?.county || "Oregon")
                            .replace(/\[City\]/g, lead.preferredLocations || lead.spatialProfile?.county || "Oregon")
                            .replace(/{{targetPrice}}/g, lead.targetPriceRange || "$450,000")
                            .replace(/\[TargetBudget\]/g, lead.targetPriceRange || "$450,000")
                            .replace(/{{tract}}/g, tract)
                            .replace(/\[Tract\]/g, tract)
                            .replace(/{{coBrandUrl}}/g, coBrand);
                          setMessageText(filledText);
                          setShowTemplateMenu(false);
                        }}
                        className="text-left p-2 bg-white border border-[#EAE7E0] rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-colors"
                      >
                        <div className="font-bold text-[#2D362E] mb-0.5 truncate">{template.title}</div>
                        <div className="text-[10px] text-[#606C5D] truncate">{template.content}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setShowTemplateMenu(!showTemplateMenu); setShowAttachmentMenu(false); }}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    showTemplateMenu
                      ? "bg-emerald-100 border-emerald-400 text-emerald-800 font-bold"
                      : "bg-[#FAF9F5] hover:bg-[#EAE7E0] border-[#EAE7E0] text-[#606C5D]"
                  }`}
                  title="Use Pre-written Template"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAttachmentMenu(!showAttachmentMenu); setShowTemplateMenu(false); }}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    showAttachmentMenu || selectedFlyerId || selectedListId
                      ? "bg-emerald-100 border-emerald-400 text-emerald-800 font-bold"
                      : "bg-[#FAF9F5] hover:bg-[#EAE7E0] border-[#EAE7E0] text-[#606C5D]"
                  }`}
                  title="Attach Flyer or Property List"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  placeholder="Type text message to lead..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendSms()}
                  className="flex-1 bg-[#FAF9F5] border border-[#EAE7E0] focus:border-[#4A5D4E] rounded-xl px-3.5 py-2.5 text-xs text-[#2D362E] focus:outline-none"
                />

                <button
                  type="button"
                  onClick={handleSendSms}
                  disabled={!messageText.trim() && !selectedFlyerId && !selectedListId}
                  className="px-4 py-2.5 bg-[#4A5D4E] hover:bg-[#38463B] text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-40 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Text</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Automated Text Nurture Sequence */}
        {activeTab === "nurture" && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#FAF9F5]">
            {/* Status & Control Card */}
            <div className="bg-white p-4 rounded-2xl border border-[#EAE7E0] shadow-xs flex items-center justify-between flex-wrap gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Automated Text Campaign Status
                </span>
                <h4 className="font-extrabold text-base text-[#2D362E] mt-1">
                  4-Step High-Converting SMS Nurture Sequence
                </h4>
                <p className="text-xs text-[#606C5D]">
                  Automatically delivers grant calculators, zero-down property lists, and rate buydown sheets to keep prospects engaged.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleToggleTextNurture}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                    lead.textNurtureEnabled ?? true
                      ? "bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700"
                      : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                  }`}
                >
                  {(lead.textNurtureEnabled ?? true) ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Text Nurture Active (Pause)</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Opt Lead In & Activate Text Nurture</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleTriggerNextNurtureStep}
                  className="px-3.5 py-2 bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-300" />
                  <span>Send Next Step Now</span>
                </button>
              </div>
            </div>

            {/* Sequence Timeline */}
            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-[#4A5D4E] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#C18C5D]" />
                Scheduled Text Campaign Steps & Delivery Log
              </h5>

              <div className="space-y-3">
                {TEXT_NURTURE_STEPS.map((step) => {
                  const currentStepNum = lead.textNurtureCurrentStep || 1;
                  const isSent = step.stepNumber < currentStepNum;
                  const isCurrent = step.stepNumber === currentStepNum;

                  const filledText = step.messageText
                    .replace(/{{firstName}}/g, firstName)
                    .replace(/{{loName}}/g, loName)
                    .replace(/{{location}}/g, lead.preferredLocations || "Oregon");

                  return (
                    <div
                      key={step.stepNumber}
                      className={`p-4 rounded-2xl border transition-all space-y-2 ${
                        isSent
                          ? "bg-emerald-50/50 border-emerald-200"
                          : isCurrent
                          ? "bg-white border-[#4A5D4E] shadow-sm ring-2 ring-[#4A5D4E]/20"
                          : "bg-white border-[#EAE7E0] opacity-80"
                      }`}
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-full font-bold flex items-center justify-center text-xs ${
                              isSent
                                ? "bg-emerald-600 text-white"
                                : isCurrent
                                ? "bg-[#4A5D4E] text-white"
                                : "bg-stone-200 text-stone-600"
                            }`}
                          >
                            {step.stepNumber}
                          </span>
                          <span className="font-extrabold text-[#2D362E]">
                            {step.templateName}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <span className="text-[#606C5D]">{step.timing}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              isSent
                                ? "bg-emerald-100 text-emerald-800"
                                : isCurrent
                                ? "bg-blue-100 text-blue-800"
                                : "bg-stone-100 text-stone-600"
                            }`}
                          >
                            {isSent ? "✓ SENT" : isCurrent ? "NEXT QUEUED" : "SCHEDULED"}
                          </span>
                        </div>
                      </div>

                      <div className="bg-[#FAF9F5] p-3 rounded-xl border border-[#EAE7E0] text-xs text-[#2D362E] font-mono leading-relaxed">
                        📱 "{filledText}"
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Twilio Settings Modal */}
      <TwilioSettingsModal
        isOpen={showTwilioSettings}
        onClose={() => setShowTwilioSettings(false)}
      />

      {/* Document/Flyer Preview Modal */}
      {previewAttachment && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl h-[85vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-stone-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                  {previewAttachment.type === "flyer" ? <FileText className="w-5 h-5" /> : <Home className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-stone-800 text-sm">{previewAttachment.title}</h3>
                  <p className="text-xs text-stone-500 font-mono">{previewAttachment.url}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={previewAttachment.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" /> Open in New Tab
                </a>
                <button
                  onClick={() => setPreviewAttachment(null)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 bg-stone-200 p-6 overflow-y-auto flex justify-center">
              {/* Fake PDF viewer rendering since we don't have real PDFs */}
              <div className="w-full max-w-2xl bg-white shadow-xl min-h-[800px] p-8 md:p-12 border border-stone-300">
                {previewAttachment.type === "flyer" ? (
                  <div className="space-y-6">
                    <div className="h-48 bg-emerald-900 rounded-xl flex items-center justify-center text-white p-8 text-center relative overflow-hidden">
                      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                      <h1 className="text-3xl font-serif font-bold relative z-10">{previewAttachment.title}</h1>
                    </div>
                    <div className="flex gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="h-6 w-3/4 bg-stone-200 rounded"></div>
                        <div className="h-4 w-full bg-stone-100 rounded"></div>
                        <div className="h-4 w-full bg-stone-100 rounded"></div>
                        <div className="h-4 w-5/6 bg-stone-100 rounded"></div>
                        <br/>
                        <div className="h-6 w-1/2 bg-stone-200 rounded"></div>
                        <div className="h-4 w-full bg-stone-100 rounded"></div>
                        <div className="h-4 w-4/5 bg-stone-100 rounded"></div>
                      </div>
                      <div className="w-1/3 bg-stone-50 border border-stone-100 p-4 rounded-xl space-y-3">
                         <div className="h-24 bg-stone-200 rounded-lg mb-4"></div>
                         <div className="h-3 w-full bg-stone-200 rounded"></div>
                         <div className="h-3 w-4/5 bg-stone-200 rounded"></div>
                         <div className="h-3 w-full bg-stone-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="border-b pb-4">
                      <h1 className="text-2xl font-bold text-stone-800">{previewAttachment.title}</h1>
                      <p className="text-stone-500 mt-2">Curated property list automatically generated for this lead.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="border border-stone-200 rounded-xl p-3 space-y-2">
                          <div className="h-32 bg-stone-100 rounded-lg"></div>
                          <div className="h-4 w-2/3 bg-stone-200 rounded"></div>
                          <div className="h-3 w-1/2 bg-stone-100 rounded"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

