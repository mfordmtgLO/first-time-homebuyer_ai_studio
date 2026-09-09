const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The replacement I made accidentally swallowed the end of advanced-prequal and the start of agent-campaign.
// I will find the end of the replaced prompt and inject the missing code.

const target = `    "creditScore": number (or null),
    "isComplete": boolean (true if income, debt, savings, and credit score are all known)
  }
}
\`;

      const prompt = \`Campaign Focus: \${campaignType || "Attract Buyer Agents - Stop Renting Zero-Down Push"}`;

const missingCode = `    "creditScore": number (or null),
    "isComplete": boolean (true if income, debt, savings, and credit score are all known)
  }
}
\`;

      const response = await generateWithModelFallback({
        preferredModel: "gemini-3.7-flash",
        contents: prompt,
        config: {
          temperature: 0.7,
          responseMimeType: "application/json",
        },
      });

      const jsonText = response.text || "{}";
      let result: any = {};
      try {
        result = JSON.parse(jsonText.replace(/\`\`\`json\\n?|\\n?\`\`\`/g, "").trim());
      } catch {
        result = null;
      }
      
      res.json(result || { reply: "I'm having trouble analyzing that right now. Could you clarify?", extractedData: {} });
    } catch (error: any) {
      console.log("Advanced Prequal API notice:", "API Limitation handled.");
      res.json({
        reply: "Sorry, I'm experiencing a temporary delay. Please check back in a moment or ask a simpler question.",
        extractedData: {},
        isFallback: true,
        quotaDepleted: isQuotaOrDepleted(error),
      });
    }
  });

  // API Route: Generate Buyer Agent Campaign Email
  app.post("/api/gemini/agent-campaign", authenticateUser, async (req, res) => {
    const { campaignType, tone, agentNames, propertySummary, customNotes, loanOfficer } = req.body || {};
    const loName = loanOfficer?.name || "Mike Ford";
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ error: "API Key missing" });
    }

    try {
      const systemInstruction = \`You are an expert real estate and mortgage marketing copywriter working for \${loName}. Write an engaging, high-converting outreach email targeted at real estate buyer agents.\`;
      
      const prompt = \`Campaign Focus: \${campaignType || "Attract Buyer Agents - Stop Renting Zero-Down Push"}`;

code = code.replace(target, missingCode);

// Also remove the previous fix I tried that changed `prompt` to `prequalPrompt` because I will just separate the routes.
// Wait, the previous fix was:
// 'contents: [{ parts: [{ text: prequalPrompt }] }],'
// I'll just write it correctly. I need to undo that if it's there.

fs.writeFileSync('server.ts', code);
