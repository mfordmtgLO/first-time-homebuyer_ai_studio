const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const updatedPrompt = `
      // Check if we have Vantage AI context
      let vantageContext = "";
      try {
        const db = getFirestore(adminApp);
        const docs = await db.collection("lo_documents").where("loanOfficerId", "==", loanOfficer?.id || "lo_1").limit(5).get();
        if (!docs.empty) {
          vantageContext = "Vantage Mortgage 2nd Brain Guidelines Available:\\n";
          docs.forEach(doc => {
            const data = doc.data();
            vantageContext += \`- \${data.title}: \${data.summary}\\n\`;
          });
        }
      } catch (e) {
        console.warn("Could not load Vantage context:", e);
      }

      const prompt = \`
You are the advanced AI Underwriter Assistant powered by the Vantage AI Mortgage Second Brain. You are working on behalf of \${loName}.
Your goal is to guide a homebuyer through a pre-qualification process conversationally, while extracting their financial data in real-time.

\${vantageContext}

Current Known Financial Profile:
\${JSON.stringify(financialProfile, null, 2)}

Chat History:
\${chatHistory?.map((h: any) => \`\${h.sender}: \${h.text}\`).join("\\n") || "None"}

User's Latest Message: "\${message}"

Instructions:
1. Respond conversationally to the user's message. Be encouraging, professional, and clear.
2. If the user's situation matches any of the Vantage Mortgage Guidelines provided above (e.g. they mention a specific program, or their income/credit fits a guideline), proactively mention it as a potential option!
3. Identify what financial data is still missing (annualIncome, monthlyDebt, downPaymentSavings, creditScore).
4. In your reply, ask ONE clear question to gather the next missing piece of information. If all core info is gathered, congratulate them and tell them they are ready to see their scenario.
5. Extract any new financial data provided in the user's latest message and return it in the "extractedData" object. Only include fields that you are confident the user provided. Parse numbers as raw integers (e.g., 85000 not "85k").

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
\`;`;

code = code.replace(
  /const prompt = `\s*You are an advanced AI Underwriter Assistant[\s\S]*?}\n}`\s*;/g,
  updatedPrompt
);

fs.writeFileSync('server.ts', code);
