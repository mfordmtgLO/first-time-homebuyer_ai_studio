const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

async function addDocumentToKnowledge(text, metadata, aiClient) {
  try {
    const response = await aiClient.models.embedContent({
      model: 'gemini-embedding-001',
      contents: text,
    });
    console.log("Embed success!");
  } catch (err) {
    console.error("Error generating embedding:", err);
    throw err;
  }
}

async function test() {
  try {
    await addDocumentToKnowledge("This is some sample text.", {}, ai);
  } catch (e) {
    console.log("Failed:", e.message);
  }
}
test();
