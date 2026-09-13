import { Pool } from 'pg';

// Enterprise Vector Database Connection (Cloud SQL / pgvector)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export interface KnowledgeDoc {
  id: string;
  text: string;
  embedding: number[];
  metadata: any;
  timestamp: string;
}

export function loadKnowledgeBase() {
  if (!process.env.DATABASE_URL) {
    console.warn("⚠️ DATABASE_URL not set. Cloud SQL Vector Database connection skipped.");
    return;
  }
  
  // Initialize the pgvector extension and table on startup
  pool.query(`CREATE EXTENSION IF NOT EXISTS vector;`)
    .then(() => {
      return pool.query(`
        CREATE TABLE IF NOT EXISTS knowledge_base (
          id SERIAL PRIMARY KEY,
          text TEXT NOT NULL,
          metadata JSONB,
          embedding vector(768),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    })
    .then(() => console.log(`Enterprise Cloud SQL Vector Database (pgvector) initialized.`))
    .catch(err => console.error("Failed to initialize pgvector table:", err));
}

export async function addDocumentToKnowledge(text: string, metadata: any, aiClient: any) {
  try {
    const response = await aiClient.models.embedContent({
      model: 'text-embedding-004',
      contents: text,
    });
    const embedding = response.embeddings[0].values;
    
    if (!process.env.DATABASE_URL) {
      console.warn("Simulating Vector DB insert (DATABASE_URL missing).");
      return { id: "simulated_id", text, metadata };
    }

    const formattedEmbedding = `[${embedding.join(',')}]`;
    const insertQuery = `
      INSERT INTO knowledge_base (text, metadata, embedding)
      VALUES ($1, $2, $3)
      RETURNING id;
    `;
    const res = await pool.query(insertQuery, [text, metadata, formattedEmbedding]);
    console.log(`Document saved to Cloud SQL Vector DB with ID: ${res.rows[0].id}`);
    
    return { id: res.rows[0].id, text, metadata };
  } catch (err) {
    console.error("Error generating/storing embedding in pgvector:", err);
    throw err;
  }
}

export async function searchKnowledge(query: string, aiClient: any, topK: number = 3) {
  if (!process.env.DATABASE_URL) {
    return [];
  }
  
  try {
    const response = await aiClient.models.embedContent({
      model: 'text-embedding-004',
      contents: query,
    });
    const queryEmbedding = response.embeddings[0].values;
    const formattedEmbedding = `[${queryEmbedding.join(',')}]`;
    
    // Perform Cosine Similarity Search using pgvector (<=> operator)
    const searchQuery = `
      SELECT id, text, metadata, 1 - (embedding <=> $1) AS score
      FROM knowledge_base
      ORDER BY embedding <=> $1
      LIMIT $2;
    `;
    
    const res = await pool.query(searchQuery, [formattedEmbedding, topK]);
    return res.rows;
  } catch (err) {
    console.error("Error searching pgvector knowledge base:", err);
    return [];
  }
}
