const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const advancedPrequalEndpoint = `
  // API Route: Advanced AI Pre-Qualification (Structured Data + Chat)
  app.post("/api/gemini/advanced-prequal", authenticateUser, async (req, res) => {
    const { message, chatHistory, financialProfile, loanOfficer } = req.body || {};
    const loName = loanOfficer?.name || "Mike Ford";
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: "API Key missing" });
    }

    try {
      const prompt = \`
You are an advanced AI Underwriter Assistant for \${loName}. Your goal is to guide a homebuyer through a pre-qualification process conversationally, while extracting their financial data in real-time.

Current Known Financial Profile:
\${JSON.stringify(financialProfile, null, 2)}

Chat History:
\${chatHistory?.map((h: any) => \`\${h.sender}: \${h.text}\`).join("\\n") || "None"}

User's Latest Message: "\${message}"

Instructions:
1. Respond conversationally to the user's message. Be encouraging, professional, and clear.
2. Identify what financial data is still missing (annualIncome, monthlyDebt, downPaymentSavings, creditScore).
3. In your reply, ask ONE clear question to gather the next missing piece of information. If all core info is gathered, congratulate them and tell them they are ready to see their scenario.
4. Extract any new financial data provided in the user's latest message and return it in the "extractedData" object. Only include fields that you are confident the user provided. Parse numbers as raw integers (e.g., 85000 not "85k").

Respond STRICTLY in JSON format matching this schema:
{
  "reply": "Your conversational response here",
  "extractedData": {
    "annualIncome": number (or null if not provided/changed),
    "monthlyDebt": number (or null),
    "downPaymentSavings": number (or null),
    "creditScore": number (or null),
    "isComplete": boolean (true if income, debt, savings, and credit score are all known)
  }
}
\`;

      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=" + apiKey, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.2
          }
        })
      });

      if (!response.ok) {
        throw new Error("Failed to call Gemini API");
      }

      const data = await response.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (textResponse) {
        const parsed = JSON.parse(textResponse);
        return res.json(parsed);
      } else {
        throw new Error("Empty response from AI");
      }
    } catch (error: any) {
      console.error("Advanced Prequal Error:", error);
      res.status(500).json({ error: "Failed to generate AI prequal response" });
    }
  });
`;

code = code.replace(
  '  // API Route: Offer Strategy Generator',
  advancedPrequalEndpoint + '\n  // API Route: Offer Strategy Generator'
);

fs.writeFileSync('server.ts', code);
