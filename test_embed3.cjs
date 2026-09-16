const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
async function test() {
  const response = await ai.models.embedContent({
    model: 'text-embedding-004',
    contents: "Hello world"
  }).catch(() => ai.models.embedContent({
    model: 'gemini-embedding-001',
    contents: "Hello world"
  }));
  console.log("Response keys:", Object.keys(response));
  console.log("embeddings:", response.embeddings);
}
test();
