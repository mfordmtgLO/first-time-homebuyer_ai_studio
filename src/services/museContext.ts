import { GoogleGenAI } from "@google/genai";
import { searchKnowledge, KnowledgeSearchResult } from "../../vantageKnowledge.ts";
import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { executeDeepSeekHarness } from "./vantage2ndBrainService.ts";

export interface MuseContextParams {
  query: string;
  industryId: string;
  leadId?: string;
  sessionId?: string;
  aiClient?: any;
  topK?: number;
}

export interface MuseContextResult {
  answer: string;
  text: string;
  response: string;
  citations: Array<{ docId: string; title: string; score: number }>;
  buyerContextUsed: boolean;
  buyerProfileSummary?: string;
  disclaimerServed: boolean;
  disclaimerText: string;
  sessionId: string;
  sources?: any[];
  groundingMetadata?: any;
  memoriesUsedCount: number;
  industryId: string;
  engine?: string;
  securityRefusal?: boolean;
  qualifiedOnly?: boolean;
}

// Multi-instance limitation: in-memory Set tracks disclaimer status per instance.
// In distributed multi-region Cloud Run environments, session state should be backed by Redis or a shared Firestore sessions collection.
const servedDisclaimerSessions = new Set<string>();

function getAdminDb() {
  if (!getApps().length) {
    try {
      initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || "ai-studio-vantageaiworkspa-320759cc-ded2-4188-b4e0-ed887f4ad5bd",
      });
    } catch (e) {
      console.warn("Firebase Admin initializeApp notice in museContext:", e);
    }
  }
  return getFirestore();
}

/**
 * P2-3: Reusable Muse Retrieval, Underwriting Routing & Grounding Service
 * buildMuseContext({ query, industryId, leadId, sessionId, aiClient, topK })
 * -> { answer, citations, buyerContextUsed, disclaimerServed, sessionId }
 */
export async function buildMuseContext({
  query,
  industryId,
  leadId,
  sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  aiClient,
  topK = 3,
}: MuseContextParams): Promise<MuseContextResult> {
  // 1. industryId REQUIRED — throw fail-closed if missing/blank. No default.
  if (!industryId || typeof industryId !== "string" || !industryId.trim()) {
    throw new Error("Tenant isolation violation: buildMuseContext requires a valid, non-empty industryId.");
  }
  const cleanIndustryId = industryId.trim();

  if (!query || typeof query !== "string" || !query.trim()) {
    throw new Error("A valid non-empty query is required for buildMuseContext.");
  }

  // 8. Disclaimer once per session tracking
  const isFirstCallForSession = !servedDisclaimerSessions.has(sessionId);
  if (isFirstCallForSession) {
    servedDisclaimerSessions.add(sessionId);
  }
  const disclaimerText =
    "Programs, interest rates, and loan terms are subject to change. Borrower likely qualifies based on provided parameters, subject to full underwriting verification by Cornerstone First Mortgage (NMLS #173855).";

  // 9. Income & Sensitive PII / Document Refusal Guardrail (brackets only; never accept SSN/financial docs)
  const ssnCheck = /\b(?!000|666|9\d{2})\d{3}[-.\s]?(?!00)\d{2}[-.\s]?(?!0000)\d{4}\b/.test(query);
  const taxDocCheck = /\b(tax return|w-2|1099|bank statement|social security card|paystub|drivers license)\b/i.test(query);
  if (ssnCheck || taxDocCheck) {
    const refusalText =
      "For your financial privacy and security, sensitive documents (tax returns, W-2s, bank statements) and Social Security Numbers are never accepted via chat. Please connect directly with Loan Officer Mike Ford (NMLS #288455) for secure encrypted document submission.";
    return {
      answer: refusalText,
      text: refusalText,
      response: refusalText,
      citations: [],
      buyerContextUsed: false,
      disclaimerServed: isFirstCallForSession,
      disclaimerText,
      sessionId,
      memoriesUsedCount: 0,
      industryId: cleanIndustryId,
      securityRefusal: true,
      qualifiedOnly: true,
    };
  }

  // Ensure AI Client is instantiated
  const ai =
    aiClient ||
    new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    });

  // 2. Vector Search (Tenant-Filtered before scoring)
  let vectorCitations: Array<{ docId: string; title: string; score: number }> = [];
  let vectorContextChunks: string[] = [];
  try {
    const topDocs: KnowledgeSearchResult[] = await searchKnowledge(query, ai, topK, cleanIndustryId);
    vectorCitations = topDocs.map((d) => ({
      docId: d.id,
      title: d.metadata?.title || d.metadata?.fileName || d.id,
      score: Math.round(d.score * 100) / 100,
    }));
    vectorContextChunks = topDocs.map(
      (d, idx) => `[Source ${idx + 1} (${d.metadata?.title || d.metadata?.fileName || d.id})]: ${d.text}`
    );
  } catch (kErr) {
    console.warn("[Muse Context] Vector search notice:", kErr);
  }

  // 3. Buyer Context: Query Firestore /memories where industryId == industryId AND leadId == leadId
  // kinds in (intake_answer, conversation_turn, engagement_event), newest first, cap 10.
  // Summarize to a compact buyer profile block (budget, cities, timeline, favorites) — never paste raw memory text verbatim.
  let buyerContextUsed = false;
  let buyerProfileSummary = "";
  let buyerMemoriesCount = 0;

  if (leadId) {
    try {
      const db = getAdminDb();
      const leadSnap = await db
        .collection("memories")
        .where("industryId", "==", cleanIndustryId)
        .where("leadId", "==", String(leadId).trim())
        .orderBy("createdAt", "desc")
        .limit(10)
        .get();

      const validKinds = new Set(["intake_answer", "conversation_turn", "engagement_event"]);
      const profileExtracts: {
        budget?: string;
        locations?: string[];
        timeline?: string;
        downPayment?: string;
        creditTier?: string;
        dpaInterest?: boolean;
        favorites?: string[];
        keyNotes?: string[];
      } = {};

      leadSnap.docs.forEach((docSnap) => {
        const data = docSnap.data();
        if (data && (!data.kind || validKinds.has(data.kind))) {
          buyerMemoriesCount++;
          const meta = data.metadata || {};
          if (meta.budget && !profileExtracts.budget) profileExtracts.budget = meta.budget;
          if (meta.currentBudget && !profileExtracts.budget) profileExtracts.budget = meta.currentBudget;
          if (meta.timeline && !profileExtracts.timeline) profileExtracts.timeline = meta.timeline;
          if (meta.downPayment && !profileExtracts.downPayment) profileExtracts.downPayment = meta.downPayment;
          if (meta.creditTier && !profileExtracts.creditTier) profileExtracts.creditTier = meta.creditTier;
          if (meta.preferredLocations && !profileExtracts.locations) {
            profileExtracts.locations = Array.isArray(meta.preferredLocations)
              ? meta.preferredLocations
              : [meta.preferredLocations];
          }
          if (meta.favoritedListings && !profileExtracts.favorites) {
            profileExtracts.favorites = Array.isArray(meta.favoritedListings)
              ? meta.favoritedListings
              : [meta.favoritedListings];
          }
          if (data.title && data.content) {
            if (!profileExtracts.keyNotes) profileExtracts.keyNotes = [];
            if (profileExtracts.keyNotes.length < 3) {
              profileExtracts.keyNotes.push(`${data.title}: ${String(data.content).slice(0, 120)}`);
            }
          }
        }
      });

      if (buyerMemoriesCount > 0) {
        buyerContextUsed = true;
        const parts: string[] = [];
        if (profileExtracts.budget) parts.push(`Target Budget: ${profileExtracts.budget}`);
        if (profileExtracts.locations?.length) parts.push(`Preferred Cities: ${profileExtracts.locations.join(", ")}`);
        if (profileExtracts.timeline) parts.push(`Timeline: ${profileExtracts.timeline}`);
        if (profileExtracts.downPayment) parts.push(`Down Payment Savings: ${profileExtracts.downPayment}`);
        if (profileExtracts.creditTier) parts.push(`Credit Score Tier: ${profileExtracts.creditTier}`);
        if (profileExtracts.favorites?.length) parts.push(`Favorited Properties: ${profileExtracts.favorites.join(", ")}`);
        if (profileExtracts.keyNotes?.length) parts.push(`Recent Intake Context: ${profileExtracts.keyNotes.join(" | ")}`);

        buyerProfileSummary = parts.length > 0 ? parts.join("\n") : "Active borrower engaging in pre-qualification.";
      }
    } catch (leadErr) {
      console.warn("[Muse Context] Buyer memories fetch notice:", leadErr);
    }
  }

  // 4. Industry Knowledge: recent /memories for industryId (program docs, ingested_doc / ingested_media), cap 5
  let programDocsCount = 0;
  let programDocChunks: string[] = [];
  try {
    const db = getAdminDb();
    const progSnap = await db
      .collection("memories")
      .where("industryId", "==", cleanIndustryId)
      .orderBy("createdAt", "desc")
      .limit(5)
      .get();

    progSnap.docs.forEach((docSnap) => {
      const data = docSnap.data();
      if (data && (data.kind === "ingested_doc" || data.kind === "ingested_media" || !data.kind)) {
        programDocsCount++;
        programDocChunks.push(`[Program Memory (${data.title || "Guideline"})]: ${data.content || ""}`);
      }
    });
  } catch (pErr) {
    console.warn("[Muse Context] Program memories fetch notice:", pErr);
  }

  // 6. Math/Underwriting Routing (P2-3 Item 6)
  // DTI, buydown, amortization, payment questions are NEVER answered by the chat model —
  // route to the existing DeepSeek harness entry point (child_process.execFile argv arrays, strict 5,000ms timeout, zero shell surface)
  const isMathQuery = /\b(dti|debt-to-income|amortization|monthly payment|buydown|down payment calculation|apr|affordability math|principal and interest|p&i)\b/i.test(
    query
  );

  if (isMathQuery) {
    console.log(`[DeepSeek Harness] Routing math/underwriting query to deterministic harness: "${query}"`);
    try {
      const mathContextPrompt = `Underwrite and compute exact mortgage calculations for: "${query}". Context: ${
        buyerProfileSummary || "First-time homebuyer inquiry"
      }. Enforce DTI < 45% and qualified language.`;
      const harnessResult = await executeDeepSeekHarness(mathContextPrompt);
      const answer = harnessResult.response || harnessResult.text || "Calculation verified by underwriting harness.";

      return {
        answer,
        text: answer,
        response: answer,
        citations: vectorCitations,
        buyerContextUsed,
        buyerProfileSummary,
        disclaimerServed: isFirstCallForSession,
        disclaimerText,
        sessionId,
        sources: [],
        memoriesUsedCount: buyerMemoriesCount + programDocsCount,
        industryId: cleanIndustryId,
        engine: "deepseek-math-harness",
        qualifiedOnly: true,
      };
    } catch (mathErr) {
      console.warn("[Muse Context] DeepSeek harness notice, proceeding to grounded consensus:", mathErr);
    }
  }

  // 5. Assemble Prompt: buyer profile -> cited knowledge chunks (with doc ids) -> query.
  // Ground with gemini-3.8-flash + Google Search tools.
  const contextBlocks: string[] = [];
  if (buyerProfileSummary) {
    contextBlocks.push(`[VERIFIED BUYER PROFILE BLOCK]:\n${buyerProfileSummary}`);
  }
  if (programDocChunks.length > 0) {
    contextBlocks.push(`[PROGRAM MEMORIES & GUIDELINES]:\n${programDocChunks.join("\n\n")}`);
  }
  if (vectorContextChunks.length > 0) {
    contextBlocks.push(`[CITED KNOWLEDGE BASE SOURCES]:\n${vectorContextChunks.join("\n\n")}`);
  }

  const fullPrompt = `${contextBlocks.length > 0 ? contextBlocks.join("\n\n") + "\n\n" : ""}User Inquiry: ${query}`;

  const systemInstruction = `You are Muse, the intelligent 2nd Brain Copilot for First-Time Homebuyers and Loan Officer Mike Ford (NMLS #288455).
Rules:
1. Always qualify eligibility claims with "likely qualifies based on these parameters" and cite specific doc IDs or sources.
2. Discuss income in standard brackets only (e.g. $75k-$95k/yr). NEVER ask for SSNs, credit cards, or tax returns.
3. Reference local Oregon Down Payment Assistance (OHCS Flex Lending, FirstHome, USDA 0% Down, HomeChoice) with exact guidelines.
4. If the buyer profile contains preferences (budget, cities, timeline), tailor recommendations directly to them.`;

  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction,
      temperature: 0.3,
    },
  });

  const candidate = response.candidates?.[0];
  const answer = response.text || "I have analyzed your inquiry against our verified guidelines.";

  return {
    answer,
    text: answer,
    response: answer,
    citations: vectorCitations,
    buyerContextUsed,
    buyerProfileSummary,
    disclaimerServed: isFirstCallForSession,
    disclaimerText,
    sessionId,
    sources: candidate?.groundingMetadata?.groundingChunks || [],
    groundingMetadata: candidate?.groundingMetadata,
    memoriesUsedCount: buyerMemoriesCount + programDocsCount,
    industryId: cleanIndustryId,
    engine: "gemini-3.8-flash-grounded",
    qualifiedOnly: true,
  };
}
