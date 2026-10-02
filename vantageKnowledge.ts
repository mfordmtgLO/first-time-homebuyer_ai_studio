import fs from 'fs';
import path from 'path';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const KNOWLEDGE_FILE = path.join(process.cwd(), 'vantage_knowledge.json');
const MAX_IN_MEMORY_DOCS = 5000;

export interface KnowledgeDoc {
  id: string;
  text: string;
  embedding: number[];
  metadata: {
    industryId: string;
    title?: string;
    fileName?: string;
    source?: string;
    tags?: string[];
    [key: string]: any;
  };
  timestamp: string;
  createdAt?: string;
}

export interface KnowledgeSearchResult {
  id: string;
  text: string;
  metadata: KnowledgeDoc['metadata'];
  score: number;
}

let knowledgeBase: KnowledgeDoc[] = [];

// Zero-Trust Ingestion PII Redaction
export function redactPII(text: string): string {
  if (!text) return text;
  let sanitized = text;

  // Redact SSN/ITIN patterns (XXX-XX-XXXX or XXXXXXXXX)
  const ssnPattern = /\b(?!000|666|9\d{2})\d{3}[-.\s]?(?!00)\d{2}[-.\s]?(?!0000)\d{4}\b/g;
  sanitized = sanitized.replace(ssnPattern, "[REDACTED_SSN_PII]");

  // Redact standard Credit Card patterns
  const ccPattern = /\b(?:\d{4}[-\s]?){3}\d{4}\b/g;
  sanitized = sanitized.replace(ccPattern, "[REDACTED_CC_PII]");

  return sanitized;
}

function getFirestoreDb() {
  if (!getApps().length) {
    try {
      initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || "astral-web-439103-g7",
      });
    } catch (e) {
      console.warn("Firebase Admin initializeApp notice in vantageKnowledge:", e);
    }
  }
  return getFirestore();
}

function cosineSimilarity(a: number[], b: number[]) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * P2-0.1: Durable Vector Store Initialization
 * Loads documents from Firestore `vantage_knowledge` collection at boot into in-memory cache.
 * Executes one-time migration from legacy local JSON if Firestore is empty.
 */
export async function loadKnowledgeBase() {
  try {
    const db = getFirestoreDb();
    const knowledgeCol = db.collection("vantage_knowledge");
    
    // Read from Firestore (capped at MAX_IN_MEMORY_DOCS)
    const snapshot = await knowledgeCol.limit(MAX_IN_MEMORY_DOCS + 1).get();
    
    if (snapshot.empty) {
      console.log("[Vantage Knowledge] Firestore vantage_knowledge collection is empty. Checking legacy JSON seed...");
      if (fs.existsSync(KNOWLEDGE_FILE)) {
        try {
          const rawDocs: any[] = JSON.parse(fs.readFileSync(KNOWLEDGE_FILE, "utf-8"));
          if (Array.isArray(rawDocs) && rawDocs.length > 0) {
            console.log(`[Vantage Knowledge Migration] Migrating ${rawDocs.length} seed docs from local JSON to Firestore...`);
            let migratedCount = 0;
            const batch = db.batch();
            
            for (const doc of rawDocs) {
              const docId = doc.id || `doc_seed_${Date.now()}_${migratedCount}`;
              const docIndustryId = doc.metadata?.industryId || "mortgage_real_estate";
              const cleanMetadata = {
                ...(doc.metadata || {}),
                industryId: docIndustryId,
              };
              const record: KnowledgeDoc = {
                id: docId,
                text: redactPII(doc.text || ""),
                embedding: doc.embedding || [],
                metadata: cleanMetadata,
                timestamp: doc.timestamp || new Date().toISOString(),
                createdAt: new Date().toISOString(),
              };
              const ref = knowledgeCol.doc(docId);
              batch.set(ref, record);
              knowledgeBase.push(record);
              migratedCount++;
            }
            await batch.commit();
            console.log(`[Vantage Knowledge Migration] Successfully migrated ${migratedCount} documents to Firestore vantage_knowledge.`);
            return;
          }
        } catch (seedErr) {
          console.error("[Vantage Knowledge Migration] Failed to parse local seed JSON:", seedErr);
        }
      }
    } else {
      const docs: KnowledgeDoc[] = [];
      snapshot.docs.forEach((docSnap) => {
        if (docs.length < MAX_IN_MEMORY_DOCS) {
          const d = docSnap.data() as KnowledgeDoc;
          // Ensure industryId is set
          if (!d.metadata) d.metadata = { industryId: "mortgage_real_estate" };
          if (!d.metadata.industryId) d.metadata.industryId = "mortgage_real_estate";
          docs.push({ ...d, id: docSnap.id });
        }
      });
      knowledgeBase = docs;
      console.log(`[Vantage Knowledge] Loaded ${knowledgeBase.length} durable docs from Firestore vantage_knowledge.`);
      if (snapshot.size > MAX_IN_MEMORY_DOCS) {
        console.warn(`[Vantage Knowledge Scaling Warning] Total documents in Firestore (${snapshot.size}) exceeds in-memory cache limit (${MAX_IN_MEMORY_DOCS}). Scaling to dedicated vector DB recommended.`);
      }
    }
  } catch (error: any) {
    console.log("[Vantage Knowledge] Firestore vantage_knowledge unavailable or unseeded. Initializing from local JSON fallback.");
    if (fs.existsSync(KNOWLEDGE_FILE)) {
      try {
        knowledgeBase = JSON.parse(fs.readFileSync(KNOWLEDGE_FILE, "utf-8"));
        console.log(`[Vantage Knowledge] Loaded ${knowledgeBase.length} fallback docs from local JSON.`);
      } catch (e) {
        console.error("[Vantage Knowledge] Failed to load local knowledge base");
      }
    }
  }
}

/**
 * P2-0.1, P2-0.2, P2-0.3: Ingest Document into Knowledge Base with PII Scrubbing and Tenant Isolation
 */
export async function addDocumentToKnowledge(text: string, metadata: any, aiClient: any): Promise<KnowledgeDoc> {
  // P2-0.2: Tenant isolation validation (fail closed)
  const industryId = metadata?.industryId?.trim();
  if (!industryId) {
    throw new Error("Tenant isolation violation: metadata.industryId is required for knowledge ingestion.");
  }

  // P2-0.3: Zero-Trust PII redaction inside ingest function before embedding
  const sanitizedText = redactPII(text);
  if (sanitizedText !== text) {
    console.log("[PII Vault] Ingestion scrubbed PII from document vector text before embedding generation.");
  }

  try {
    const response = await aiClient.models.embedContent({
      model: "gemini-embedding-001",
      contents: sanitizedText,
    });
    const embedding = response.embeddings[0].values;
    
    const docId = `doc_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const doc: KnowledgeDoc = {
      id: docId,
      text: sanitizedText,
      embedding,
      metadata: {
        ...metadata,
        industryId,
        piiScrubbed: true,
      },
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // P2-0.1: Write-through persistence to Firestore
    try {
      const db = getFirestoreDb();
      await db.collection("vantage_knowledge").doc(docId).set(doc);
    } catch (dbErr) {
      console.warn("[Vantage Knowledge] Firestore write-through notice (persisting in memory):", dbErr);
    }

    knowledgeBase.push(doc);
    return doc;
  } catch (err) {
    console.error("[Vantage Knowledge] Error generating embedding:", err);
    throw err;
  }
}

/**
 * P2-0.2 & P2-0.4 & F2: Tenant-Isolated Vector Search with Full Provenance / Citations (Fail-Closed)
 * Note on scaling ceiling: In-memory exact cosine similarity scales comfortably up to ~25,000 vectors.
 * For >50k vectors, integrate pgvector on Cloud SQL or Vertex AI Vector Search.
 */
export async function searchKnowledge(
  query: string,
  aiClient: any,
  topK: number = 3,
  industryId: string
): Promise<KnowledgeSearchResult[]> {
  if (!industryId || typeof industryId !== "string" || !industryId.trim()) {
    throw new Error("Tenant isolation violation: searchKnowledge requires a valid industryId.");
  }

  const cleanIndustryId = industryId.trim();

  // Filter candidates to tenant before computing cosine similarity
  const candidateDocs = knowledgeBase.filter(
    (doc) => doc.metadata?.industryId === cleanIndustryId
  );

  if (candidateDocs.length === 0) {
    return [];
  }

  try {
    const response = await aiClient.models.embedContent({
      model: "gemini-embedding-001",
      contents: query,
    });
    const queryEmbedding = response.embeddings[0].values;
    
    const scoredDocs: KnowledgeSearchResult[] = candidateDocs.map((doc) => ({
      id: doc.id,
      text: doc.text,
      metadata: doc.metadata,
      score: cosineSimilarity(queryEmbedding, doc.embedding),
    }));
    
    scoredDocs.sort((a, b) => b.score - a.score);
    return scoredDocs.slice(0, topK);
  } catch (err) {
    console.error("[Vantage Knowledge] Error searching knowledge base:", err);
    return [];
  }
}

// Re-export Muse context builder (F1)
export { buildMuseContext } from "./src/services/museContext.ts";
export type { MuseContextParams, MuseContextResult } from "./src/services/museContext.ts";
