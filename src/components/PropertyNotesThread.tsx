import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Send,
  Award,
  Lightbulb,
  ExternalLink,
  UserCheck,
  Building,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  ArrowRight,
  Clock,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { PropertyListing, LoanOfficerProfile, RealEstateAgentProfile, PropertyConversation } from "../types";
import {
  subscribeToPropertyConversation,
  sendPropertyConversationMessage,
  getVisitorLeadProfile,
  MORTGAGE_DID_YOU_KNOW_FACTS,
} from "../services/propertyConversationService";
import { LoanWisdomBadgeShelf } from "./LoanWisdomBadgeShelf";

interface PropertyNotesThreadProps {
  property: PropertyListing;
  loanOfficer?: LoanOfficerProfile;
  agent?: RealEstateAgentProfile;
  origin?: string;
  onOpenLoanOfficerContact?: () => void;
}

export const PropertyNotesThread: React.FC<PropertyNotesThreadProps> = ({
  property,
  loanOfficer,
  agent,
  origin,
  onOpenLoanOfficerContact
}) => {
  const [conversation, setConversation] = useState<PropertyConversation | null>(null);
  const [inputText, setInputText] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFactIdx, setActiveFactIdx] = useState(0);
  const [showDidYouKnow, setShowDidYouKnow] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'financing' | 'rate_buydown' | 'down_payment' | 'property_condition' | 'qualification' | 'general'>('general');
  const [isQuestionMode, setIsQuestionMode] = useState(false);
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [optInPhone, setOptInPhone] = useState("");
  const [justSubmittedNotice, setJustSubmittedNotice] = useState<string | null>(null);

  const visitorSession = getVisitorLeadProfile();

  // Effective LO & Agent (Defaulting to Mike Ford & Kanndice McLean as requested)
  const loName = loanOfficer?.name || "Mike Ford";
  const loSlug = loanOfficer?.customSlug || "mike-ford";
  const agentName = agent?.name || "Kanndice McLean";
  const agentSlug = agent?.customSlug || "kanndice-mclean";

  // Build co-branded URL
  const baseOrigin = origin || (typeof window !== "undefined" ? window.location.origin : "https://homereadypdx.com");
  const cleanOrigin = baseOrigin.replace("ais-dev-", "ais-pre-");
  const coBrandUrl = `${cleanOrigin}/first-time_homebuyer_portal/${loSlug}-and-${agentSlug}`;

  // Subscribe to real-time sync for this property + lead thread
  useEffect(() => {
    const unsub = subscribeToPropertyConversation(
      property.id,
      visitorSession.leadId,
      (conv) => {
        setConversation(conv);
      }
    );
    return () => unsub();
  }, [property.id, visitorSession.leadId]);

  const handleSendMessage = async (
    customText?: string,
    programTag?: string,
    didYouKnowFact?: string,
    explicitCategory?: 'financing' | 'rate_buydown' | 'down_payment' | 'property_condition' | 'qualification' | 'general',
    forceQuestion?: boolean
  ) => {
    const messageToSend = (customText || inputText).trim();
    if (!messageToSend) return;

    setIsSubmitting(true);
    const isQ = forceQuestion || isQuestionMode || Boolean(programTag) || messageToSend.includes('?');

    try {
      await sendPropertyConversationMessage({
        propertyId: property.id,
        leadId: visitorSession.leadId,
        leadName: visitorSession.leadName,
        leadEmail: visitorSession.leadEmail,
        leadPhone: visitorSession.leadPhone,
        propertyAddress: property.address,
        propertyPrice: property.price,
        propertyCity: property.city,
        assignedLoId: loanOfficer?.id || "lo-mike-ford",
        assignedLoName: loName,
        assignedAgentId: agent?.id || "agent-kanndice-mclean",
        assignedAgentName: agentName,
        sender: "buyer",
        senderName: visitorSession.leadName || "You (Buyer)",
        text: messageToSend,
        messageType: isQ ? 'question' : 'note',
        questionCategory: explicitCategory || selectedCategory,
        tcpaSmsOptIn: smsOptIn,
        tcpaPhoneProvided: smsOptIn ? optInPhone : undefined,
        programTag,
        didYouKnowFact,
        pointsAwarded: programTag ? 25 : 15,
        updatedNoteText: messageToSend,
      });
      setInputText("");
      setIsExpanded(true);
      if (isQ) {
        setJustSubmittedNotice(`Your question was sent to ${loName}'s dashboard as a priority property action item!`);
        setTimeout(() => setJustSubmittedNotice(null), 5000);
      }
    } catch (err) {
      console.error("Failed to send property note:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAskPrebuiltQ = (item: typeof MORTGAGE_DID_YOU_KNOW_FACTS[0]) => {
    handleSendMessage(item.sampleQ, item.shortTag, item.fact, 'down_payment', true);
  };

  const messages = conversation?.messages || [];
  const points = conversation?.gamifiedStats?.points || 0;
  const badges = conversation?.gamifiedStats?.unlockedBadges || [];
  const pendingInquiriesCount = conversation?.pendingActionItems?.filter(i => i.status === 'pending').length || 
    messages.filter(m => m.messageType === 'question' && m.status === 'pending').length;

  return (
    <div className="mt-3 rounded-2xl border border-[#EAE7E0] bg-white overflow-hidden shadow-2xs transition-all">
      {/* HEADER: Bidirectional Thread Title & Gamified Points */}
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
                Property Q&A & LO Sync
              </span>
              {pendingInquiriesCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" /> {pendingInquiriesCount} Pending LO Answer
                </span>
              )}
              {messages.length > 0 && pendingInquiriesCount === 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#4A5D4E] text-white text-[9px] font-bold">
                  {messages.length} notes
                </span>
              )}
            </div>
            <span className="text-[10px] text-[#606C5D] block">
              Synced directly with {loName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {points > 0 && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold">
              <Award className="w-3 h-3 text-amber-600" />
              <span>{points} pts</span>
            </div>
          )}
          <button 
            type="button" 
            className="p-1 rounded-md text-[#606C5D] hover:text-[#2D362E]"
            aria-label="Toggle notes thread"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* QUICK PREVIEW WHEN COLLAPSED */}
      {!isExpanded && (
        <div className="p-2.5 bg-white flex items-center justify-between text-xs">
          <p className="text-[11px] text-[#606C5D] italic line-clamp-1 flex-1 pr-2">
            {pendingInquiriesCount > 0
              ? `Waiting for ${loName.split(" ")[0]}'s answer on your property inquiry...`
              : conversation?.notes 
              ? `Note: "${conversation.notes}"`
              : property.notes 
              ? `Note: "${property.notes}"`
              : "Ask Mike Ford about down payment programs or financing options..."}
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(true);
            }}
            className="text-[11px] font-bold text-[#4A5D4E] hover:underline shrink-0"
          >
            {pendingInquiriesCount > 0 ? "View Q&A" : "View Thread"}
          </button>
        </div>
      )}

      {/* EXPANDED VIEW: Thread, Gamified Q&A, and Interactive Notes */}
      {isExpanded && (
        <div className="p-3 space-y-3 bg-white">
          {/* Real-Time Action Item Confirmation Alert */}
          {justSubmittedNotice && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-[11px] font-semibold">{justSubmittedNotice}</span>
            </div>
          )}

          {/* LOAN WISDOM BADGE SYSTEM */}
          <LoanWisdomBadgeShelf
            unlockedBadgeIds={badges}
            points={points}
            onAskQuestionToUnlock={(question, programTag, fact) => {
              handleSendMessage(question, programTag, fact, 'down_payment', true);
            }}
            onOpenPreApproval={onOpenLoanOfficerContact}
          />

          {/* MESSAGES THREAD */}
          <div className="max-h-56 overflow-y-auto space-y-2.5 pr-1 text-xs">
            {messages.length === 0 ? (
              <div className="p-3 rounded-xl bg-[#FAF9F5] border border-dashed border-[#EAE7E0] text-center space-y-1">
                <p className="text-xs text-[#606C5D]">
                  No shared notes or Q&A yet. Ask {loName.split(" ")[0]} a question below to trigger a priority action item on their dashboard.
                </p>
                <p className="text-[10px] text-[#9A9488]">
                  All notes and answers sync securely in real time between your device and the Loan Officer portal.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isLo = msg.sender === "loan_officer";
                const isBuyer = msg.sender === "buyer";
                const isQuestion = msg.messageType === 'question' || msg.status === 'pending' || msg.text.includes('?');
                const isPending = msg.status === 'pending';
                const isResolved = msg.status === 'resolved';

                return (
                  <div
                    key={msg.id}
                    className={`p-2.5 rounded-xl border text-xs transition-all ${
                      isLo
                        ? "bg-emerald-50/80 border-emerald-200 ml-3 shadow-2xs"
                        : isBuyer
                        ? isPending
                          ? "bg-amber-50/70 border-amber-200 mr-3 ring-1 ring-amber-100"
                          : "bg-[#FAF9F5] border-[#EAE7E0] mr-3"
                        : "bg-indigo-50/80 border-indigo-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                      <div className="flex items-center gap-1.5">
                        {isLo ? (
                          <>
                            <UserCheck className="w-3 h-3 text-emerald-700" />
                            <span className="font-bold text-emerald-800 text-[11px]">{msg.senderName} (Loan Officer)</span>
                          </>
                        ) : (
                          <>
                            <span className="font-bold text-[#4A5D4E] text-[11px]">{msg.senderName}</span>
                          </>
                        )}

                        {/* Question Category & Status Badge */}
                        {isQuestion && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#EAE7E0] text-[#5C6F60] uppercase tracking-wider">
                            {msg.questionCategory ? msg.questionCategory.replace('_', ' ') : 'Property Question'}
                          </span>
                        )}
                        {isPending && (
                          <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-bold flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5 text-amber-600 animate-pulse" /> Pending LO Action Item
                          </span>
                        )}
                        {isResolved && isQuestion && (
                          <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] font-bold flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> Answered
                          </span>
                        )}
                      </div>

                      <span className="text-[9px] text-[#9A9488]">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <p className="text-[#2D362E] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    
                    {msg.didYouKnowFact && (
                      <div className="mt-1.5 p-1.5 rounded-lg bg-white/90 border border-[#EAE7E0] text-[10px] text-[#606C5D] flex items-start gap-1">
                        <span className="shrink-0">💡</span>
                        <span><strong>Mortgage Fact:</strong> {msg.didYouKnowFact}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* GAMIFIED 'DID YOU KNOW' & 1-TAP MORTGAGE QUESTIONS */}
          <div className="bg-[#F8F7F2] p-2.5 rounded-xl border border-[#EAE7E0] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#4A5D4E] flex items-center gap-1 uppercase tracking-wider">
                <Lightbulb className="w-3 h-3 text-amber-500" /> Gamified Loan Matcher & 1-Tap Q&A
              </span>
              <button
                type="button"
                onClick={() => setShowDidYouKnow(prev => !prev)}
                className="text-[10px] font-semibold text-[#606C5D] hover:text-[#2D362E] cursor-pointer"
              >
                {showDidYouKnow ? "Hide programs" : "Explore loan programs (+25 pts)"}
              </button>
            </div>

            {showDidYouKnow && (
              <div className="space-y-1.5 pt-1">
                <div className="p-2 rounded-lg bg-white border border-[#EAE7E0] text-[11px] space-y-1">
                  <div className="flex items-center justify-between font-bold text-[#2D362E]">
                    <span>{MORTGAGE_DID_YOU_KNOW_FACTS[activeFactIdx].program}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-900">
                      {MORTGAGE_DID_YOU_KNOW_FACTS[activeFactIdx].shortTag}
                    </span>
                  </div>
                  <p className="text-[#606C5D] text-[10px]">
                    {MORTGAGE_DID_YOU_KNOW_FACTS[activeFactIdx].fact}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleAskPrebuiltQ(MORTGAGE_DID_YOU_KNOW_FACTS[activeFactIdx])}
                    className="mt-1 w-full py-1.5 px-2 rounded-lg bg-[#4A5D4E] hover:bg-[#38463B] text-white font-bold text-[10px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>Ask {loName.split(" ")[0]}: "{MORTGAGE_DID_YOU_KNOW_FACTS[activeFactIdx].sampleQ}"</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Fact selector dots */}
                <div className="flex items-center justify-center gap-1.5 pt-0.5">
                  {MORTGAGE_DID_YOU_KNOW_FACTS.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveFactIdx(idx)}
                      className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                        activeFactIdx === idx ? "bg-[#4A5D4E] w-4" : "bg-[#DEDAD2]"
                      }`}
                      aria-label={`Show mortgage fact ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* QUESTION CATEGORY & MODE CONTROLS */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1 text-[#606C5D]">
                <button
                  type="button"
                  onClick={() => setIsQuestionMode(!isQuestionMode)}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    isQuestionMode
                      ? "bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs"
                      : "bg-[#FAF9F5] text-[#5C6F60] border border-[#EAE7E0] hover:bg-[#F2EFEA]"
                  }`}
                >
                  <HelpCircle className="w-3 h-3 text-amber-600" />
                  <span>{isQuestionMode ? "Asking LO Question (Priority Queue)" : "Ask Structured Question"}</span>
                </button>
              </div>

              {isQuestionMode && (
                <div className="flex items-center gap-1">
                  <span className="text-[#9A9488]">Category:</span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as any)}
                    className="text-[10px] bg-[#FAF9F5] border border-[#EAE7E0] rounded-md px-1.5 py-0.5 font-bold text-[#2D362E] focus:outline-none"
                  >
                    <option value="down_payment">Down Payment & Grants</option>
                    <option value="rate_buydown">Rate Buydown (2-1)</option>
                    <option value="financing">Monthly Payment & Rates</option>
                    <option value="qualification">Pre-Approval & Credit</option>
                    <option value="property_condition">Property Condition / Inspection</option>
                    <option value="general">General Question</option>
                  </select>
                </div>
              )}
            </div>

            {/* Quick 1-Tap Category Prompts */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button
                type="button"
                onClick={() => {
                  setInputText("Does this home qualify for the OHCS 3% Oregon Bond Cash Assist?");
                  setIsQuestionMode(true);
                  setSelectedCategory("down_payment");
                }}
                className="text-[10px] font-medium whitespace-nowrap px-2 py-0.5 rounded-full bg-[#FAF9F5] hover:bg-amber-50 hover:border-amber-200 border border-[#EAE7E0] text-[#4A5D4E] cursor-pointer"
              >
                + OHCS 3% Grant?
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputText("Can we negotiate a 2-1 seller credit rate buydown on this property?");
                  setIsQuestionMode(true);
                  setSelectedCategory("rate_buydown");
                }}
                className="text-[10px] font-medium whitespace-nowrap px-2 py-0.5 rounded-full bg-[#FAF9F5] hover:bg-amber-50 hover:border-amber-200 border border-[#EAE7E0] text-[#4A5D4E] cursor-pointer"
              >
                + 2-1 Buydown Credit?
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputText("What would the estimated monthly payment & P&I be at this listing price?");
                  setIsQuestionMode(true);
                  setSelectedCategory("financing");
                }}
                className="text-[10px] font-medium whitespace-nowrap px-2 py-0.5 rounded-full bg-[#FAF9F5] hover:bg-amber-50 hover:border-amber-200 border border-[#EAE7E0] text-[#4A5D4E] cursor-pointer"
              >
                + Estimated Monthly P&I?
              </button>
            </div>
          </div>

          {/* INPUT FORM */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(undefined, undefined, undefined, selectedCategory, isQuestionMode);
                  }
                }}
                placeholder={
                  isQuestionMode
                    ? `Type question for ${loName.split(" ")[0]} (e.g., "Can I use gifted down payment?")...`
                    : `Ask ${loName.split(" ")[0]} about rates, grants, or add a tour note...`
                }
                className={`flex-1 border rounded-xl px-3 py-2 text-xs text-[#2D362E] placeholder-[#9A9488] focus:outline-none transition-all ${
                  isQuestionMode 
                    ? "bg-amber-50/40 border-amber-300 focus:border-amber-500 focus:bg-white" 
                    : "bg-[#FAF9F5] border-[#EAE7E0] focus:border-[#4A5D4E] focus:bg-white"
                }`}
              />
              <button
                type="button"
                disabled={isSubmitting || !inputText.trim()}
                onClick={() => handleSendMessage(undefined, undefined, undefined, selectedCategory, isQuestionMode)}
                className={`p-2 rounded-xl text-white font-semibold transition-colors cursor-pointer shrink-0 shadow-2xs disabled:opacity-50 ${
                  isQuestionMode
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-[#4A5D4E] hover:bg-[#38463B]"
                }`}
                title={isQuestionMode ? "Send question to LO Priority Queue" : "Post note to loan officer thread"}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            {isQuestionMode && (
              <div className="space-y-2 mt-1">
                <p className="text-[10px] text-amber-800 flex items-start gap-1.5 px-1 bg-amber-50 p-2 rounded-lg border border-amber-200">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span className="leading-tight">
                    <strong>Note:</strong> Your questions are securely logged on this web portal, not sent as standard text messages to the Loan Officer. They will see it in their priority dashboard.
                  </span>
                </p>
                <div className="bg-[#F1EFE9] p-2.5 rounded-xl border border-[#EAE7E0] space-y-2">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="mt-0.5 rounded border-stone-300 text-[#4A5D4E] focus:ring-[#4A5D4E]"
                      checked={smsOptIn}
                      onChange={(e) => setSmsOptIn(e.target.checked)}
                    />
                    <span className="text-[10px] text-[#2D362E] font-medium leading-snug">
                      I authorize {loName} to send an SMS text message alert to my mobile phone when they reply to this specific question. (Standard msg & data rates apply).
                    </span>
                  </label>
                  {smsOptIn && (
                    <input 
                      type="tel"
                      placeholder="Mobile Phone (e.g., 503-555-0199)"
                      value={optInPhone}
                      onChange={(e) => setOptInPhone(e.target.value)}
                      className="w-full bg-white border border-[#EAE7E0] rounded-lg px-2.5 py-1.5 text-xs text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
                      required
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* MANDATED CO-BRANDED AGENT URL SCHEMA & DUAL GUIDES FOOTER */}
          <div className="pt-2.5 border-t border-[#EAE7E0] bg-[#FAF9F5] -mx-3 -mb-3 p-3 space-y-2">
            <div className="flex items-center justify-between text-[10px] text-[#606C5D] font-medium">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#4A5D4E]" />
                <span>Local Guides Co-Branded Team</span>
              </span>
              <a
                href={coBrandUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-bold text-[#4A5D4E] hover:underline flex items-center gap-1"
                title="Open Co-Branded Guide Page"
              >
                <span>Pairing Portal</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              {/* Mike Ford CTA */}
              <div className="p-2 rounded-xl bg-white border border-[#EAE7E0] flex flex-col justify-between space-y-1 shadow-2xs">
                <div>
                  <div className="flex items-center gap-1 text-[#2D362E] font-bold">
                    <UserCheck className="w-3.5 h-3.5 text-[#4A5D4E]" />
                    <span>Mike Ford</span>
                  </div>
                  <p className="text-[10px] text-[#606C5D] leading-tight mt-0.5">
                    For a quick pre-qualification and financing options customized to this property.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenLoanOfficerContact) {
                      onOpenLoanOfficerContact();
                    } else {
                      window.location.href = `mailto:mford@cfmtg.com?subject=Quick Pre-Qual & Financing Options: ${encodeURIComponent(property.address)}&body=Hi Mike,\n\nI am viewing ${encodeURIComponent(property.address)} (${encodeURIComponent(property.city)}) and would like a quick pre-qualification and financing options.\n\nThank you!`;
                    }
                  }}
                  className="mt-1 w-full py-1 px-2 rounded-lg bg-[#4A5D4E]/10 hover:bg-[#4A5D4E]/20 text-[#4A5D4E] font-bold text-[10px] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <span>Quick Pre-Qual</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </button>
              </div>

              {/* Kanndice McLean CTA */}
              <div className="p-2 rounded-xl bg-white border border-[#EAE7E0] flex flex-col justify-between space-y-1 shadow-2xs">
                <div>
                  <div className="flex items-center gap-1 text-[#2D362E] font-bold">
                    <Building className="w-3.5 h-3.5 text-[#C18C5D]" />
                    <span>Kanndice McLean</span>
                  </div>
                  <p className="text-[10px] text-[#606C5D] leading-tight mt-0.5">
                    To learn more about details of this home and to build a winning offer strategy.
                  </p>
                </div>
                <a
                  href={`mailto:kanndice.mclean@cascadevalleyre.com?subject=Home Details & Winning Offer Strategy: ${encodeURIComponent(property.address)}&body=Hi Kanndice,\n\nI would love to learn more details about ${encodeURIComponent(property.address)} and start building a winning offer strategy!\n\nThank you!`}
                  className="mt-1 w-full py-1 px-2 rounded-lg bg-[#C18C5D]/10 hover:bg-[#C18C5D]/20 text-[#9C683B] font-bold text-[10px] flex items-center justify-center gap-1 transition-colors text-center"
                >
                  <span>Winning Offer Strategy</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
