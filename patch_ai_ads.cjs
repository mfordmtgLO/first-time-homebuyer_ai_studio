const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const routeStr = `
  // API Route: AI Meta Ads Campaign Generator
  app.post("/api/ai/meta-ads-campaign", authenticateUser, async (req, res) => {
    try {
      const { loanOfficer, activeAgent, adSettings } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server." });
      }

      // We will dynamically import the SDK or use fetch. Let's use the standard fetch API for Gemini if the SDK isn't installed.
      // Or if the SDK is installed, use it. Let's assume fetch for safety, or check if @google/genai is in package.json.
      
      const prompt = \`
You are an expert mortgage marketing copywriter and digital advertiser.
Please generate high-converting ad copy for Meta (Facebook/Instagram) and Google Ads for the following scenario:

Loan Officer: \${loanOfficer.name} (NMLS #\${loanOfficer.nmlsId})
Real Estate Agent Partner: \${activeAgent.name} (\${activeAgent.brokerage})
Target Cities: \${adSettings?.targetCities?.join(", ") || "Local Area"}
Budget: $\${adSettings?.dailyBudgetUSD || 25}/day

The ads should promote a First-Time Homebuyer Portal (down payment assistance, mortgage calculator, home touring scorecard).

Return ONLY valid JSON in this exact structure:
{
  "metaAdSpec": {
    "campaignName": "string",
    "objective": "string",
    "targetAudience": "string",
    "primaryText": "string",
    "headline": "string",
    "description": "string",
    "ctaButton": "string"
  },
  "googleAdSpec": {
    "campaignName": "string",
    "network": "string",
    "targetGeo": "string",
    "headlines": ["string", "string", "string", "string", "string"],
    "descriptions": ["string", "string", "string", "string"],
    "keywords": ["string", "string", "string", "string"]
  }
}
\`;

      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.7
          }
        })
      });

      if (!response.ok) {
        const errData = await response.text();
        throw new Error("Gemini API error: " + errData);
      }

      const data = await response.json();
      const generatedText = data.candidates[0].content.parts[0].text;
      
      res.json(JSON.parse(generatedText));
    } catch (error: any) {
      console.error("AI Ads Generation Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate ad campaign" });
    }
  });
`;

code = code.replace(
  '// API Route: Check Twilio Config Status',
  routeStr + '\\n\\n  // API Route: Check Twilio Config Status'
);

fs.writeFileSync('server.ts', code);
