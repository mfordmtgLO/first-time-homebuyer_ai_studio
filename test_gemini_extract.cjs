const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

async function test() {
  const url = "https://cfmtg.com/mford/";
  console.log("Fetching URL...");
  try {
    const fetchRes = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const htmlText = await fetchRes.text();
    console.log("Got text length:", htmlText.length);
    
    console.log("Calling Gemini to parse...");
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `Extract the main readable content, product guidelines, and information from this raw HTML string. Ignore navigation and scripts:\n\n${htmlText.substring(0, 50000)}`,
    });
    console.log("Gemini parse success, response text length:", response.text.length);
  } catch (e) {
    console.log("Gemini parse failed:", e.message);
  }
}
test();
