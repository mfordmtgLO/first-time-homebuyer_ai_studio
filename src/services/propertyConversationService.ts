import { db } from "../firebase";
import { doc, getDoc, setDoc, onSnapshot, collection } from "firebase/firestore";
import { PropertyConversation, PropertyConversationMessage, PropertyActionItem } from "../types";
import { evaluateBadgesForConversation } from "./loanWisdomBadgeService";

export const VISITOR_SESSION_LEAD_KEY = "oregon_homebuyer_active_lead_id";
export const VISITOR_SESSION_PROFILE_KEY = "oregon_homebuyer_active_lead_profile";

export function detectQuestionCategory(
  text: string,
  programTag?: string
): 'financing' | 'rate_buydown' | 'down_payment' | 'property_condition' | 'qualification' | 'general' {
  const lower = (text + " " + (programTag || "")).toLowerCase();
  if (lower.includes("bond") || lower.includes("grant") || lower.includes("dpa") || lower.includes("down payment") || lower.includes("cash assist") || lower.includes("ohcs") || lower.includes("hap")) {
    return 'down_payment';
  }
  if (lower.includes("buydown") || lower.includes("2-1") || lower.includes("seller credit") || lower.includes("rate") || lower.includes("discount point")) {
    return 'rate_buydown';
  }
  if (lower.includes("inspection") || lower.includes("roof") || lower.includes("foundation") || lower.includes("condition") || lower.includes("repair") || lower.includes("tour note") || lower.includes("scorecard")) {
    return 'property_condition';
  }
  if (lower.includes("credit score") || lower.includes("qualify") || lower.includes("dti") || lower.includes("income limit") || lower.includes("pre-approval") || lower.includes("pre-qual")) {
    return 'qualification';
  }
  if (lower.includes("payment") || lower.includes("p&i") || lower.includes("closing cost") || lower.includes("conventional") || lower.includes("fha") || lower.includes("monthly")) {
    return 'financing';
  }
  return 'general';
}

export interface VisitorLeadSession {
  leadId: string;
  leadName?: string;
  leadEmail?: string;
  leadPhone?: string;
}

/**
 * Gets or creates a persistent client visitor ID for property conversations
 */
export function getOrCreateVisitorLeadId(): string {
  if (typeof window === "undefined") return "lead-visitor-temp";
  
  // 1. Check if user completed the intake chat or saved profile
  try {
    const cachedProfile = localStorage.getItem(VISITOR_SESSION_PROFILE_KEY);
    if (cachedProfile) {
      const parsed = JSON.parse(cachedProfile);
      if (parsed.leadId) return parsed.leadId;
    }
  } catch (e) {
    console.warn("Could not parse cached lead profile", e);
  }

  // 2. Check simple lead ID key
  let visitorId = localStorage.getItem(VISITOR_SESSION_LEAD_KEY);
  if (!visitorId) {
    const uniqueSuffix = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().slice(0, 8)
      : `${Date.now().toString(36)}`;
    visitorId = `visitor-${Date.now()}-${uniqueSuffix}`;
    localStorage.setItem(VISITOR_SESSION_LEAD_KEY, visitorId);
  }
  return visitorId;
}

/**
 * Saves or updates the active visitor lead profile in localStorage
 */
export function setVisitorLeadProfile(session: VisitorLeadSession) {
  if (typeof window === "undefined") return;
  localStorage.setItem(VISITOR_SESSION_LEAD_KEY, session.leadId);
  localStorage.setItem(VISITOR_SESSION_PROFILE_KEY, JSON.stringify(session));
}

/**
 * Retrieves the stored visitor lead session
 */
export function getVisitorLeadProfile(): VisitorLeadSession {
  const leadId = getOrCreateVisitorLeadId();
  if (typeof window === "undefined") {
    return { leadId, leadName: "First-Time Homebuyer" };
  }

  try {
    const raw = localStorage.getItem(VISITOR_SESSION_PROFILE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        leadId: parsed.leadId || leadId,
        leadName: parsed.leadName || "First-Time Homebuyer",
        leadEmail: parsed.leadEmail,
        leadPhone: parsed.leadPhone,
      };
    }
  } catch (e) {
    console.warn("Error reading visitor lead profile", e);
  }

  return { leadId, leadName: "First-Time Homebuyer" };
}

/**
 * Generates canonical conversation document ID
 * Matches property + lead so each lead has their own thread with Mike Ford / LO
 */
export function getConversationDocId(propertyId: string, leadId: string): string {
  const cleanProp = propertyId.replace(/[^a-zA-Z0-9_-]/g, "");
  const cleanLead = leadId.replace(/[^a-zA-Z0-9_-]/g, "");
  return `${cleanProp}_${cleanLead}`;
}

/**
 * Did-you-know mortgage education facts paired with loan programs
 */
export const MORTGAGE_DID_YOU_KNOW_FACTS = [
  {
    program: "OHCS Oregon Bond Residential Loan",
    shortTag: "3% or 5% Cash Assist",
    fact: "Did you know? The State of Oregon's OHCS Bond loan provides 3% or 5% in non-repayable cash assistance towards down payment or closing costs paired with a fixed rate!",
    sampleQ: "Does this property qualify for Oregon Bond Cash Assist?",
    sampleA: "Yes! Based on current purchase price limits in this county, this home falls safely within OHCS guidelines. Mike Ford can lock your below-market bond rate."
  },
  {
    program: "HAP Down Payment Assistance",
    shortTag: "Up to $30k DPA",
    fact: "Did you know? Low-to-moderate income buyers earning ≤80% Area Median Income (AMI) can receive up to $30,000 in regional grant assistance through OHCS and DevNW.",
    sampleQ: "How does the $30,000 HAP DPA work here?",
    sampleA: "HAP acts as a silent second mortgage that forgives after staying in the home, drastically shrinking your required cash-to-close."
  },
  {
    program: "Lakeview Community 100",
    shortTag: "Zero Down / 100% LTV",
    fact: "Did you know? Selected census tracts allow first-time buyers to purchase with 100% financing (zero down payment required) and no mortgage insurance (MI) penalty.",
    sampleQ: "Can I buy this home with $0 down payment?",
    sampleA: "If this home is situated in a qualifying tract, Lakeview Community 100 allows you to preserve your savings for furnishings and repairs."
  },
  {
    program: "2-1 Temporary Interest Rate Buydown",
    shortTag: "2% Lower Rate Year 1",
    fact: "Did you know? Asking the seller for a closing credit can fund a 2-1 buydown, lowering your mortgage payment by hundreds each month for the first two years!",
    sampleQ: "Can Kanndice structure a 2-1 seller credit offer on this house?",
    sampleA: "Absolutely! Kanndice McLean specializes in negotiating seller credits in the purchase contract to fund your year 1 and 2 rate discount."
  },
  {
    program: "FHA 3.5% Down Loan",
    shortTag: "Flexible 580+ Credit",
    fact: "Did you know? FHA allows down payments as low as 3.5% with credit scores down to 580, and allows 100% of down payment funds to come as a family gift.",
    sampleQ: "Is FHA or Conventional better for this price point?",
    sampleA: "Mike Ford can run side-by-side math to show whether FHA or HomeReady gives you the lowest monthly P&I."
  }
];

/**
 * Subscribes in real-time to a property conversation thread from Firestore
 */
export function subscribeToPropertyConversation(
  propertyId: string,
  leadId: string,
  onUpdate: (conv: PropertyConversation | null) => void
): () => void {
  const docId = getConversationDocId(propertyId, leadId);
  const docRef = doc(db, "property_conversations", docId);

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as PropertyConversation);
      } else {
        onUpdate(null);
      }
    },
    (err) => {
      console.warn(`Conversation subscription error for ${docId}:`, err);
      onUpdate(null);
    }
  );
}

/**
 * Appends a message or updates notes in the property conversation thread,
 * creating structured property-specific action items for questions.
 */
export async function sendPropertyConversationMessage(params: {
  propertyId: string;
  leadId: string;
  leadName?: string;
  leadEmail?: string;
  leadPhone?: string;
  propertyAddress: string;
  propertyPrice?: number;
  propertyCity?: string;
  assignedLoId?: string;
  assignedLoName?: string;
  assignedAgentId?: string;
  assignedAgentName?: string;
  sender: 'buyer' | 'loan_officer' | 'realtor' | 'system';
  senderName: string;
  senderRole?: string;
  text: string;
  messageType?: 'question' | 'response' | 'note' | 'system';
  questionCategory?: 'financing' | 'rate_buydown' | 'down_payment' | 'property_condition' | 'qualification' | 'general';
  programTag?: string;
  didYouKnowFact?: string;
  tcpaSmsOptIn?: boolean;
  tcpaPhoneProvided?: string;
  pointsAwarded?: number;
  updatedNoteText?: string;
  actionItemIdToResolve?: string;
}): Promise<void> {
  const docId = getConversationDocId(params.propertyId, params.leadId);
  const docRef = doc(db, "property_conversations", docId);

  const existingSnap = await getDoc(docRef);
  const now = new Date().toISOString();

  const isBuyer = params.sender === 'buyer';
  const isLo = params.sender === 'loan_officer';

  const isQuestion = isBuyer && (
    params.messageType === 'question' ||
    params.text.includes('?') ||
    Boolean(params.programTag) ||
    /^(ask|how|what|can|is|does|do|will|should|could|where)\b/i.test(params.text.trim())
  );

  const resolvedMessageType: 'question' | 'response' | 'note' | 'system' = 
    params.messageType || (isQuestion ? 'question' : isLo ? 'response' : 'note');

  const questionCategory = isQuestion 
    ? (params.questionCategory || detectQuestionCategory(params.text, params.programTag))
    : undefined;

  const actionItemId = isQuestion 
    ? `action-${Date.now()}-${Math.random().toString(36).substring(2, 6)}` 
    : undefined;

  const newMessage: PropertyConversationMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    sender: params.sender,
    senderName: params.senderName,
    senderRole: params.senderRole || (isLo ? 'Loan Officer' : params.sender === 'realtor' ? 'Real Estate Agent' : 'Buyer'),
    text: params.text,
    timestamp: now,
    messageType: resolvedMessageType,
    questionCategory,
    status: isQuestion ? 'pending' : isLo ? 'resolved' : undefined,
    actionItemId,
    programTag: params.programTag,
    didYouKnowFact: params.didYouKnowFact,
    pointsAwarded: params.pointsAwarded || 10,
  };

  const newActionItem: PropertyActionItem | null = isQuestion ? {
    id: actionItemId!,
    conversationId: docId,
    messageId: newMessage.id,
    propertyId: params.propertyId,
    propertyAddress: params.propertyAddress,
    propertyPrice: params.propertyPrice,
    propertyCity: params.propertyCity,
    leadId: params.leadId,
    leadName: params.leadName || "First-Time Homebuyer",
    leadEmail: params.leadEmail,
    leadPhone: params.leadPhone,
    questionText: params.text,
    questionCategory: questionCategory || 'general',
    programTag: params.programTag,
    status: 'pending',
    priority: /urgent|offer|asap|today|deadline/i.test(params.text) ? 'urgent' : 'high',
    tcpaSmsOptIn: params.tcpaSmsOptIn,
    tcpaPhoneProvided: params.tcpaPhoneProvided,
    createdAt: now,
  } : null;

  if (existingSnap.exists()) {
    const existing = existingSnap.data() as PropertyConversation;

    // If LO is replying, resolve pending questions & action items
    let updatedActionItems = [...(existing.pendingActionItems || [])];
    if (newActionItem) {
      updatedActionItems.push(newActionItem);
    }

    let existingMessages = existing.messages || [];
    if (isLo) {
      // Mark matching or all pending action items as resolved
      updatedActionItems = updatedActionItems.map(item => {
        if (item.status === 'pending' && (!params.actionItemIdToResolve || item.id === params.actionItemIdToResolve)) {
          return {
            ...item,
            status: 'resolved' as const,
            resolvedAt: now,
            resolvedBy: params.senderName,
            resolutionText: params.text,
          };
        }
        return item;
      });

      // Mark pending questions in messages as resolved
      existingMessages = existingMessages.map(msg => {
        if (msg.messageType === 'question' && msg.status === 'pending') {
          return {
            ...msg,
            status: 'resolved' as const,
            resolvedAt: now,
            resolvedBy: params.senderName,
            resolutionText: params.text,
          };
        }
        return msg;
      });
    }

    const messages = [...existingMessages, newMessage];

    // Compute updated Loan Wisdom badges and points
    const badgeEval = evaluateBadgesForConversation(
      { ...existing, messages },
      params.text,
      params.programTag
    );

    const hasPendingActionItem = updatedActionItems.some(item => item.status === 'pending');

    const payload: Partial<PropertyConversation> = {
      notes: params.updatedNoteText !== undefined ? params.updatedNoteText : (isBuyer ? params.text : existing.notes),
      messages,
      pendingActionItems: updatedActionItems,
      hasPendingActionItem,
      lastQuestionAt: isQuestion ? now : existing.lastQuestionAt,
      gamifiedStats: {
        points: badgeEval.totalPoints,
        unlockedBadges: badgeEval.unlockedBadgeIds,
        quizAnsweredCount: (existing.gamifiedStats?.quizAnsweredCount || 0) + (params.programTag ? 1 : 0),
      },
      leadName: params.leadName || existing.leadName,
      leadEmail: params.leadEmail || existing.leadEmail,
      leadPhone: params.leadPhone || existing.leadPhone,
      assignedLoName: params.assignedLoName || existing.assignedLoName || "Mike Ford",
      assignedAgentName: params.assignedAgentName || existing.assignedAgentName || "Kanndice McLean",
      updatedAt: now,
    };

    await setDoc(docRef, payload, { merge: true });
  } else {
    // Create new conversation and evaluate initial badges
    const initialEval = evaluateBadgesForConversation(
      null,
      params.text,
      params.programTag
    );

    const newRecord: PropertyConversation = {
      id: docId,
      propertyId: params.propertyId,
      leadId: params.leadId,
      leadName: params.leadName || "First-Time Homebuyer",
      leadEmail: params.leadEmail || "",
      leadPhone: params.leadPhone || "",
      propertyAddress: params.propertyAddress,
      propertyPrice: params.propertyPrice,
      propertyCity: params.propertyCity,
      assignedLoId: params.assignedLoId || "lo-mike-ford",
      assignedLoName: params.assignedLoName || "Mike Ford",
      assignedAgentId: params.assignedAgentId || "agent-kanndice-mclean",
      assignedAgentName: params.assignedAgentName || "Kanndice McLean",
      notes: params.updatedNoteText || params.text,
      messages: [newMessage],
      pendingActionItems: newActionItem ? [newActionItem] : [],
      hasPendingActionItem: Boolean(newActionItem),
      lastQuestionAt: isQuestion ? now : undefined,
      matchedPrograms: ["OHCS Oregon Bond 3% Cash Assist", "FHA 3.5%", "2-1 Buydown"],
      gamifiedStats: {
        points: Math.max(initialEval.totalPoints, params.pointsAwarded || 20),
        unlockedBadges: initialEval.unlockedBadgeIds.length > 0 ? initialEval.unlockedBadgeIds : ["program_scout"],
        quizAnsweredCount: 1,
      },
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(docRef, newRecord);
  }
}

/**
 * Subscribes in real-time to all property-specific action items across all conversations.
 * Used by the Loan Officer TaskManagementPanel to display live pending questions linked to properties.
 */
export function subscribeToAllPropertyActionItems(
  callback: (items: PropertyActionItem[]) => void
): () => void {
  const colRef = collection(db, "property_conversations");

  return onSnapshot(
    colRef,
    (snapshot) => {
      const allItems: PropertyActionItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as PropertyConversation;
        if (data.pendingActionItems && Array.isArray(data.pendingActionItems)) {
          allItems.push(...data.pendingActionItems);
        }
      });
      // Sort by createdAt descending
      allItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(allItems);
    },
    (err) => {
      console.warn("Error subscribing to property action items:", err);
      callback([]);
    }
  );
}

/**
 * Resolves a property action item directly from the Loan Officer dashboard,
 * updating the action item status and posting the response to the property conversation thread.
 */
export async function resolvePropertyActionItemDirectly(params: {
  conversationId: string;
  actionItemId: string;
  resolutionText: string;
  loName?: string;
}): Promise<void> {
  const docRef = doc(db, "property_conversations", params.conversationId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return;

  const data = snap.data() as PropertyConversation;
  const now = new Date().toISOString();
  const loName = params.loName || data.assignedLoName || "Mike Ford";

  const updatedItems = (data.pendingActionItems || []).map((item) => {
    if (item.id === params.actionItemId) {
      return {
        ...item,
        status: 'resolved' as const,
        resolvedAt: now,
        resolvedBy: loName,
        resolutionText: params.resolutionText,
      };
    }
    return item;
  });

  const replyMsg: PropertyConversationMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    sender: 'loan_officer',
    senderName: loName,
    senderRole: 'Loan Officer',
    text: params.resolutionText,
    timestamp: now,
    messageType: 'response',
    status: 'resolved',
    actionItemId: params.actionItemId,
    resolvedAt: now,
    resolvedBy: loName,
    pointsAwarded: 20,
  };

  const updatedMessages = (data.messages || []).map((m) => {
    if (m.actionItemId === params.actionItemId && m.status === 'pending') {
      return {
        ...m,
        status: 'resolved' as const,
        resolvedAt: now,
        resolvedBy: loName,
        resolutionText: params.resolutionText,
      };
    }
    return m;
  });

  const hasPending = updatedItems.some((i) => i.status === 'pending');

  await setDoc(
    docRef,
    {
      messages: [...updatedMessages, replyMsg],
      pendingActionItems: updatedItems,
      hasPendingActionItem: hasPending,
      updatedAt: now,
    },
    { merge: true }
  );
}
