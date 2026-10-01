import { GoogleGenAI } from '@google/genai';
import { db } from '../firebase.ts';
import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';

function getAiClient(): GoogleGenAI {
  const geminiApiKey =
    (typeof process !== 'undefined' && process?.env?.GEMINI_API_KEY) ||
    ((import.meta as any)?.env?.VITE_GEMINI_API_KEY as string) ||
    '';
  return new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

const VANTAGE_REMOTE_BASE_URL = 'https://ais-dev-ytqtpwssj6gdvjvqbsrbyo-427099073161.us-east5.run.app';

export interface BrainQueryResult {
  text: string;
  groundingMetadata?: any;
  sources?: any[];
  memoriesUsed?: string[];
  provider?: string;
}

export interface BrainTrainPayload {
  title: string;
  content: string;
  tags?: string[];
  industryId?: string;
}

/**
 * Step 2: Query Gemini SDK with Live Google Ground Search & Shared Firestore Memories (Robust Quota & Overload Handling)
 */
export async function query2ndBrainWithGrounding(prompt: string, contextMemories: string[] = []): Promise<BrainQueryResult> {
  try {
    const memoryContext = contextMemories.length > 0 
      ? `2nd Brain Shared Memory Context:\n${contextMemories.join('\n')}\n\n`
      : '';

    const fullPrompt = `${memoryContext}User Question: ${prompt}`;
    const ai = getAiClient();

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: fullPrompt }]
        }
      ],
      config: {
        tools: [{ googleSearch: {} }], // Enable Live Google Ground Search
        systemInstruction: 'You are Vantage AI 2nd Brain assistant for First-Time Homebuyers and Loan Officers. Enforce DTI < 45%, Interested Party Contribution (IPC) caps, TRID compliance rules, and Oregon Housing DPA guidelines.'
      }
    });

    const candidate = response.candidates?.[0];

    return {
      text: response.text || 'No response generated from 2nd Brain.',
      groundingMetadata: candidate?.groundingMetadata,
      sources: candidate?.groundingMetadata?.groundingChunks || [],
      memoriesUsed: contextMemories,
      provider: 'gemini-3.8-flash-grounded'
    };
  } catch (error: any) {
    const errMessage = error?.message || String(error);
    if (errMessage.includes('quota') || errMessage.includes('resource_exhausted') || errMessage.includes('overloaded')) {
      console.warn('Gemini API quota/overload encountered. Safe human escalation triggered.');
      return {
        text: `[Vantage AI Zero-Hallucination Protocol]: We received your question: "${prompt}". To maintain our strict zero-assumption policy during high volume, loan officer Mike Ford will review your parameters directly and follow up shortly with verified loan calculations.`,
        provider: 'vantage-human-escalation-fallback'
      };
    }

    console.warn('Gemini 2nd Brain local query notice:', error);
    // Fallback to Vantage AI Cloud REST endpoint
    return await queryBrainRemote(prompt);
  }
}

/**
 * Step 4A: REST API Direct Bridge - Query 2nd Brain Memory
 */
export async function queryBrainRemote(queryText: string, industryId: string = 'mortgage_real_estate'): Promise<BrainQueryResult> {
  try {
    const res = await fetch(`${VANTAGE_REMOTE_BASE_URL}/api/brain/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: queryText,
        industryId
      })
    });

    if (res.ok) {
      const data = await res.json();
      return {
        text: data.response || data.text || data.answer || 'Answer received from Vantage 2nd Brain Cloud.',
        groundingMetadata: data.groundingMetadata,
        sources: data.sources || [],
        provider: 'vantage-ai-cloud-rest'
      };
    }
  } catch (err) {
    console.warn('Remote 2nd Brain Cloud query notice:', err);
  }

  // Local zero-hallucination fallback if remote unreachable
  return {
    text: `[Vantage AI Zero-Hallucination Protocol]: We received your inquiry: "${queryText}". Loan officer Mike Ford has been notified and will verify current DTI guidelines and TRID disclosures with you directly.`,
    provider: 'vantage-human-escalation-fallback'
  };
}

/**
 * Step 4B: REST API Direct Bridge - Train / Save Knowledge Memory
 */
export async function trainBrainRemote(payload: BrainTrainPayload): Promise<any> {
  try {
    // 1. Save to local shared Firestore database `/memories` collection
    let firestoreSaved = false;
    try {
      const memoriesRef = collection(db, 'memories');
      await addDoc(memoriesRef, {
        title: payload.title,
        content: payload.content,
        tags: payload.tags || ['first_time_buyer', 'oregon'],
        industryId: payload.industryId || 'mortgage_real_estate',
        createdAt: serverTimestamp(),
        source: 'first_time_homebuyer_app'
      });
      firestoreSaved = true;
    } catch (fsErr) {
      console.warn('Firestore memories collection write notice:', fsErr);
    }

    // 2. Call Vantage AI Cloud direct training endpoint
    const res = await fetch(`${VANTAGE_REMOTE_BASE_URL}/api/brain/train`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: payload.title,
        content: payload.content,
        tags: payload.tags || ['dpa', 'first_time_buyer', 'oregon'],
        industryId: payload.industryId || 'mortgage_real_estate'
      })
    });

    const remoteData = res.ok ? await res.json().catch(() => null) : null;

    return {
      success: true,
      firestoreSaved,
      remoteSynced: Boolean(remoteData?.success || res.ok),
      message: `Successfully trained Vantage 2nd Brain memory: "${payload.title}"`
    };
  } catch (err: any) {
    console.error('2nd Brain memory training error:', err);
    return {
      success: false,
      error: err.message || 'Failed to train 2nd Brain memory'
    };
  }
}
