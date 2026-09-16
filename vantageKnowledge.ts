import fs from 'fs';
import path from 'path';

const KNOWLEDGE_FILE = path.join(process.cwd(), 'vantage_knowledge.json');

export interface KnowledgeDoc {
  id: string;
  text: string;
  embedding: number[];
  metadata: any;
  timestamp: string;
}

let knowledgeBase: KnowledgeDoc[] = [];

export function loadKnowledgeBase() {
  if (fs.existsSync(KNOWLEDGE_FILE)) {
    try {
      knowledgeBase = JSON.parse(fs.readFileSync(KNOWLEDGE_FILE, 'utf-8'));
      console.log(`Loaded ${knowledgeBase.length} docs into Vantage Knowledge Base.`);
    } catch (e) {
      console.error("Failed to load knowledge base");
    }
  }
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

export async function addDocumentToKnowledge(text: string, metadata: any, aiClient: any) {
  try {
    const response = await aiClient.models.embedContent({
      model: 'gemini-embedding-001',
      contents: text,
    });
    const embedding = response.embeddings[0].values;
    
    const doc: KnowledgeDoc = {
      id: `doc_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      text,
      embedding,
      metadata,
      timestamp: new Date().toISOString()
    };
    knowledgeBase.push(doc);
    fs.writeFileSync(KNOWLEDGE_FILE, JSON.stringify(knowledgeBase, null, 2));
    return doc;
  } catch (err) {
    console.error("Error generating embedding:", err);
    throw err;
  }
}

export async function searchKnowledge(query: string, aiClient: any, topK: number = 3) {
  if (knowledgeBase.length === 0) return [];
  try {
    const response = await aiClient.models.embedContent({
      model: 'gemini-embedding-001',
      contents: query,
    });
    const queryEmbedding = response.embeddings[0].values;
    
    const scoredDocs = knowledgeBase.map(doc => ({
      ...doc,
      score: cosineSimilarity(queryEmbedding, doc.embedding)
    }));
    
    scoredDocs.sort((a, b) => b.score - a.score);
    return scoredDocs.slice(0, topK);
  } catch (err) {
    console.error("Error searching knowledge base:", err);
    return [];
  }
}
