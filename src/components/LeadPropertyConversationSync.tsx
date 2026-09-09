import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Send,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Award,
  CheckCircle2,
  AlertCircle,
  Clock
} from "lucide-react";
import { PropertyConversation, LoanOfficerProfile, RealEstateAgentProfile } from "../types";
import {
  subscribeToPropertyConversation,
  sendPropertyConversationMessage
} from "../services/propertyConversationService";
import { LOAN_WISDOM_BADGES, calculateLoanWisdomLevel } from "../services/loanWisdomBadgeService";

interface LeadPropertyConversationSyncProps {
  propertyId: string;
  propertyAddress: string;
  propertyPrice?: number;
  propertyCity?: string;
  leadId: string;
  leadName: string;
  leadEmail?: string;
  leadPhone?: string;
  currentLo: LoanOfficerProfile;
  assignedAgent?: RealEstateAgentProfile;
  onTriggerToast?: (msg: string) => void;
}

export const LeadPropertyConversationSync: React.FC<LeadPropertyConversationSyncProps> = ({
  propertyId,
  propertyAddress,
  propertyPrice,
  propertyCity,
  leadId,
  leadName,
  leadEmail,
  leadPhone,
  currentLo,
  assignedAgent,
  onTriggerToast
}) => {
  const [conversation, setConversation] = useState<PropertyConversation | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    const unsub = subscribeToPropertyConversation(propertyId, leadId, (conv) => {
      setConversation(conv);
    });
    return () => unsub();
  }, [propertyId, leadId]);

  const handleSendLoReply = async (customText?: string, programTag?: string, fact?: string) => {
    const textToSend = (customText || replyText).trim();
    if (!textToSend) return;

    setIsSending(true);
    try {
      await sendPropertyConversationMessage({
        propertyId,
        leadId,
        leadName,
        leadEmail,
        leadPhone,
        propertyAddress,
        propertyPrice,
        propertyCity,
        assignedLoId: currentLo.id,
        assignedLoName: currentLo.name,
        assignedAgentId: assignedAgent?.id || "agent-kanndice-mclean",
        assignedAgentName: assignedAgent?.name || "Kanndice McLean",
        sender: "loan_officer",
        senderName: currentLo.name,
        senderRole: "Loan Officer",
        text: textToSend,
        programTag,
        didYouKnowFact: fact,
        pointsAwarded: 20,
      });
      setReplyText("");
      if (onTriggerToast) {
        onTriggerToast(`Note sent & synced to ${leadName}'s property card!`);
      }
    } catch (err) {
      console.error("Failed to send LO reply:", err);
      if (onTriggerToast) {
        onTriggerToast("Failed to sync note to property card.");
      }
    } finally {
      setIsSending(false);
    }
  };

  const messages = conversation?.messages || [];
  const points = conversation?.gamifiedStats?.points || 0;
  const badges = conversation?.gamifiedStats?.unlockedBadges || [];

  return (
    <div className="bg-white rounded-xl border border-[#EAE7E0] overflow-hidden shadow-2xs">
      {/* Header */}
      <div 
        onClick={() => setIsExpanded(prev => !prev)}
        className="p-3 bg-[#FAF9F5] border-b border-[#EAE7E0] flex items-center justify-between cursor-pointer hover:bg-[#F4F1EA]/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#4A5D4E]/10 flex items-center justify-center text-[#4A5D4E]">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-[#2D362E]">
                Live Property Conversation: {propertyAddress}
              </span>
              {conversation?.hasPendingActionItem ? (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center gap-0.5 animate-pulse">
                  <AlertCircle className="w-2.5 h-2.5" /> Action Required: Pending Buyer Question
                </span>
              ) : (
                <span className="px-1.5 py-0.2 rounded-full bg-[#4A5D4E] text-white text-[9px] font-bold">
                  {messages.length} notes
                </span>
              )}
            </div>
            <span className="text-[10px] text-[#606C5D]">
              Visitor: <strong className="text-[#2D362E]">{leadName}</strong> • Bidirectional live sync with website property card
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {points > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold">
              <Award className="w-3 h-3 text-amber-600" />
              <span>{points} pts</span>
            </span>
          )}
          <button type="button" className="p-1 text-[#606C5D]">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-3 space-y-3">
          {/* Loan Wisdom Status & Badges */}
          <div className="p-2 rounded-xl bg-[#FAF9F5] border border-[#EAE7E0] space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-[10px] font-bold text-[#2D362E]">Buyer Loan Wisdom:</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-bold">
                  {calculateLoanWisdomLevel(points).title} ({points} pts)
                </span>
              </div>
              <span className="text-[9px] text-[#606C5D]">
                {badges.length} of {LOAN_WISDOM_BADGES.length} unlocked
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {LOAN_WISDOM_BADGES.map((b) => {
                const isUnlocked = badges.includes(b.id) || badges.includes(b.name);
                return (
                  <span
                    key={b.id}
                    title={isUnlocked ? `${b.name}: ${b.description}` : `Locked: ${b.unlockTip}`}
                    className={`px-2 py-0.5 rounded-md text-[9px] font-bold flex items-center gap-1 transition-all ${
                      isUnlocked
                        ? `${b.unlockedColor.bg} ${b.unlockedColor.text} ${b.unlockedColor.border} border`
                        : "bg-white/60 text-[#9A9488] border border-dashed border-[#DEDAD2]"
                    }`}
                  >
                    {isUnlocked ? <CheckCircle2 className="w-2.5 h-2.5" /> : <span>🔒</span>}
                    {b.name}
                  </span>
                );
              })}
            </div>
          </div>

          {/* PENDING PROPERTY-SPECIFIC ACTION ITEMS FROM BUYER */}
          {conversation?.pendingActionItems && conversation.pendingActionItems.filter(i => i.status === 'pending').length > 0 && (
            <div className="space-y-2">
              {conversation.pendingActionItems.filter(i => i.status === 'pending').map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-amber-50/90 border border-amber-300 text-xs space-y-2 shadow-2xs"
                >
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="font-bold text-amber-900 text-[11px] flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                      Pending Action Item: Lead Question ({item.questionCategory.replace('_', ' ')})
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 text-[9px] font-bold uppercase tracking-wider">
                      {item.priority} Priority
                    </span>
                  </div>
                  <p className="text-amber-950 font-medium text-xs bg-white/70 p-2 rounded-lg border border-amber-200">
                    "{item.questionText}"
                  </p>
                  <div className="flex items-center justify-between pt-0.5">
                    <span className="text-[10px] text-amber-800">
                      Asked by {item.leadName} • {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setReplyText(`Hi ${item.leadName.split(" ")[0]}, regarding your question on ${propertyAddress}: `);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>Quick Answer & Resolve Action Item</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Messages list */}
          <div className="max-h-56 overflow-y-auto space-y-2 pr-1 text-xs">
            {messages.length === 0 ? (
              <div className="p-3 rounded-xl bg-[#FAF9F5] border border-dashed border-[#EAE7E0] text-center text-xs text-[#606C5D]">
                No notes in this thread yet. Send a message below to start communicating with {leadName} directly on this property card!
              </div>
            ) : (
              messages.map((m) => {
                const isLo = m.sender === "loan_officer";
                const isQ = m.messageType === 'question' || m.status === 'pending';
                return (
                  <div
                    key={m.id}
                    className={`p-2.5 rounded-xl border text-xs ${
                      isLo
                        ? "bg-emerald-50/80 border-emerald-200 ml-4"
                        : isQ && m.status === 'pending'
                        ? "bg-amber-50/70 border-amber-200 mr-4 ring-1 ring-amber-200"
                        : "bg-[#FAF9F5] border-[#EAE7E0] mr-4"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[#2D362E] text-[11px] flex items-center gap-1.5 flex-wrap">
                        {isLo ? (
                          <>
                            <UserCheck className="w-3 h-3 text-emerald-700" />
                            <span className="text-emerald-800">You ({currentLo.name})</span>
                          </>
                        ) : (
                          <>
                            <span className="text-[#4A5D4E]">{m.senderName} (Visitor)</span>
                          </>
                        )}
                        {isQ && m.status === 'pending' && (
                          <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-bold flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5 text-amber-600" /> Action Item Pending
                          </span>
                        )}
                        {m.messageType === 'question' && m.status === 'resolved' && (
                          <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-bold flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> Resolved
                          </span>
                        )}
                      </span>
                      <span className="text-[9px] text-[#9A9488]">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-[#2D362E] whitespace-pre-wrap">{m.text}</p>
                    {m.didYouKnowFact && (
                      <div className="mt-1.5 p-1.5 rounded-lg bg-white border border-[#EAE7E0] text-[10px] text-[#606C5D]">
                        💡 <strong>Mortgage Program:</strong> {m.didYouKnowFact}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Quick LO 1-Tap Responses */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[10px] font-bold text-[#606C5D]">1-Tap Reply:</span>
            <button
              type="button"
              onClick={() => handleSendLoReply("I ran the math on this home! It is eligible for the OHCS 3% Cash Assistance bond program. Let's do a 5-minute pre-qual to verify your income limit.")}
              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#FAF9F5] hover:bg-[#F1EFE9] border border-[#EAE7E0] text-[#4A5D4E] cursor-pointer"
            >
              + "Eligible for OHCS 3% DPA"
            </button>
            <button
              type="button"
              onClick={() => handleSendLoReply("Kanndice McLean and I checked this property. We can structure a seller credit to buy down your interest rate 2% in Year 1.")}
              className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#FAF9F5] hover:bg-[#F1EFE9] border border-[#EAE7E0] text-[#4A5D4E] cursor-pointer"
            >
              + "Pair with Kanndice for 2-1 Buydown"
            </button>
          </div>

          {/* Reply input */}
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendLoReply();
                }
              }}
              placeholder={`Send note back to ${leadName} on this property card...`}
              className="flex-1 bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs text-[#2D362E] focus:outline-none focus:border-[#4A5D4E] focus:bg-white"
            />
            <button
              type="button"
              disabled={isSending || !replyText.trim()}
              onClick={() => handleSendLoReply()}
              className="p-2 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white disabled:opacity-50 transition-colors cursor-pointer shrink-0"
              title="Post note to visitor property card"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
