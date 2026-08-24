import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Shared Gemini client utility with telemetry header
  const getGeminiClient = () => {
    return new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // API Route: Health Check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // API Route: Gemini Homebuyer Advisor / Chat
  app.post("/api/gemini/advisor", async (req, res) => {
    try {
      const { message, context, chatHistory } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const ai = getGeminiClient();
      const systemInstruction = `You are the Manus First-Time Homebuyer AI Advisor, an empathetic, expert mortgage underwriter and real estate counselor dedicated exclusively to helping first-time home buyers navigate purchasing their first property safely, affordably, and strategically.

Expertise on Interested Party Contributions (IPC) and Seller Concessions:
When asked about seller concessions, seller credits, or Interested Party Contributions (IPC), you MUST provide exact, authoritative regulatory limits according to official guidelines:
1. Conventional Loans (Fannie Mae B3-4.1-02 / Freddie Mac 5501.5):
   - LTV > 90% (< 10% down, e.g. 3% or 5% down): Maximum 3.0% IPC cap.
   - LTV > 80% to 90% (10% to 19.99% down): Maximum 6.0% IPC cap.
   - LTV ≤ 80% (≥ 20% down): Maximum 9.0% IPC cap.
   - Investment properties: Maximum 2.0% IPC cap.
2. FHA Loans (HUD Handbook 4000.1 Section II.A.4.d.iii):
   - Maximum 6.0% IPC of sales price or appraised value. Any excess triggers a dollar-for-dollar reduction in the mortgage amount.
3. USDA Rural Development (RD) Loans (HB-1-3555 Chapter 6 Section 6.3):
   - Maximum 6.0% IPC of the total acquisition price.
4. VA Loans (VA Lenders Handbook Pamphlet 26-7 Chapter 8):
   - Maximum 4.0% Seller Concessions rule (covers buyer debt payoff, temporary buydowns, VA funding fee, gifts/appliances) PLUS customary buyer closing costs and discount points.
5. Strict Down Payment Protection Rule:
   - Seller contributions and IPC can NEVER be used to satisfy the buyer's minimum required cash investment / down payment equity, and cannot be received as cash back. They can only be applied to actual allowable closing costs, prepaids, escrow impounds, discount points, or rate buydowns.

Key general guidelines:
1. Explain complex real estate and mortgage jargon (DTI, PMI, escrow, title insurance, discount points, amortization, appraisal gaps, contingencies) in clear, friendly, plain English.
2. Emphasize consumer protection: advise on keeping inspection contingencies, safe DTI thresholds (28/36 rule), emergency reserves, and avoiding risky over-leveraging.
3. If user provides financial context (Income: ${context?.income || "unspecified"}, Down Payment: ${context?.downPayment || "unspecified"}, Monthly Debt: ${context?.monthlyDebt || "unspecified"}, Target Price: ${context?.targetPrice || "unspecified"}, Location: ${context?.location || "unspecified"}), tailor your calculations and suggestions directly to their numbers.
4. Provide structured, actionable answers with bullet points, clear steps, and practical checklists where appropriate. Keep tone encouraging, authoritative, and completely unbiased.`;

      let promptContent = "";
      if (chatHistory && Array.isArray(chatHistory) && chatHistory.length > 0) {
        promptContent += "Prior conversation context:\n";
        chatHistory.slice(-6).forEach((h: { sender: string; text: string }) => {
          promptContent += `${h.sender === "user" ? "Buyer" : "Manus Advisor"}: ${h.text}\n`;
        });
        promptContent += `\nCurrent Question: ${message}`;
      } else {
        promptContent = message;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: promptContent,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ reply: response.text || "I am here to help guide your homebuying journey. Could you please rephrase or give more details?" });
    } catch (error: any) {
      console.error("Advisor API error:", error);
      res.status(500).json({
        error: error.message || "Failed to generate homebuyer advice",
        fallback: "Our AI advisor encountered a temporary hiccup. Feel free to use the built-in mortgage calculators and checklists while we reconnect."
      });
    }
  });

  // API Route: Offer Strategy Generator
  app.post("/api/gemini/offer-strategy", async (req, res) => {
    try {
      const { propertyDetails, buyerFinances, marketCondition } = req.body;
      const ai = getGeminiClient();

      const systemInstruction = `You are a top-tier Real Estate Negotiation and Offer Strategist for First-Time Homebuyers.
Analyze the provided home listing and buyer situation, and return a comprehensive, tactical offer package recommendation.`;

      const prompt = `Generate a customized Offer Strategy for this property:
Property Details:
- List Price: $${propertyDetails?.price || 450000}
- Address: ${propertyDetails?.address || "123 Maple St"}
- Days on Market: ${propertyDetails?.daysOnMarket || 12} days
- Property Condition/Notes: ${propertyDetails?.notes || "Turnkey, recent cosmetic updates"}
- Market Climate: ${marketCondition || "Balanced Market"}

Buyer Financials:
- Pre-approved Max Loan: $${buyerFinances?.preApprovalAmount || 480000}
- Available Cash for Down Payment & Closing: $${buyerFinances?.cashAvailable || 65000}
- Loan Program: ${buyerFinances?.loanType || "30-Year Conventional"}

Please provide:
1. Recommended Offer Price Range (Aggressive / Fair Market / Conservative)
2. Earnest Money Deposit (EMD) recommendation
3. Recommended Contingencies to protect the buyer (Inspection timeline, Financing period, Appraisal clause)
4. Seller Concession / Interested Party Contribution (IPC) Strategy:
   - Calculate maximum allowable IPC for this loan program (Conventional >90% LTV = 3%, Conventional 80-90% LTV = 6%, Conventional ≤80% LTV = 9%, FHA = 6%, USDA RD = 6%, VA = 4% concessions).
   - Recommend strategic utilization (e.g. permanent discount points or 2-1 temporary rate buydown vs standard closing cost coverage).
   - Remind buyer that seller credits cannot offset minimum down payment.
5. Escalation Clause recommendation (if applicable)
6. Strategic terms to make offer stand out without sacrificing safety.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.6,
        },
      });

      res.json({ strategy: response.text });
    } catch (error: any) {
      console.error("Offer strategy error:", error);
      res.status(500).json({ error: error.message || "Failed to generate offer strategy" });
    }
  });

  // API Route: Inspection Report Triage & Repair Credit Helper
  app.post("/api/gemini/inspection-audit", async (req, res) => {
    try {
      const { inspectionNotes, propertyPrice } = req.body;
      if (!inspectionNotes) {
        return res.status(400).json({ error: "Inspection notes required" });
      }

      const ai = getGeminiClient();
      const systemInstruction = `You are a licensed building inspector and real estate closing negotiator for first-time buyers.
Evaluate home inspection findings, categorize risks into Safety/Structural (Red Flags), Important Maintenance (Yellow Flags), and Minor Cosmetic (Green/Info), estimate ballpark repair costs, and draft a professional Repair/Credit Request Addendum letter to the seller.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: `Property Price: $${propertyPrice || 400000}\nInspection Issues & Notes:\n${inspectionNotes}`,
        config: {
          systemInstruction,
          temperature: 0.5,
        },
      });

      res.json({ analysis: response.text });
    } catch (error: any) {
      console.error("Inspection audit error:", error);
      res.status(500).json({ error: error.message || "Failed to audit inspection notes" });
    }
  });

  // API Route: Mortgage & Affordability Health Check
  app.post("/api/gemini/mortgage-analysis", async (req, res) => {
    try {
      const { income, monthlyDebt, downPayment, creditScore, targetHomePrice, state } = req.body;
      const ai = getGeminiClient();

      const prompt = `Analyze this first-time homebuyer's financial profile:
- Annual Gross Income: $${income}
- Total Monthly Non-Mortgage Debt: $${monthlyDebt}
- Available Down Payment: $${downPayment}
- Credit Score Tier: ${creditScore}
- Target Home Price: $${targetHomePrice}
- Target State/Market: ${state || "National Average"}

Provide:
1. Debt-to-Income (DTI) health evaluation (Front-end & Back-end assessment)
2. Risk Level (Low, Moderate, Stretched, High)
3. Estimated monthly payment breakdown and safety buffer recommendations
4. First-time buyer grant or special program opportunities (FHA, Conventional 97, USDA, State DPA)
5. Actionable tips to improve purchasing power or interest rate before applying.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a senior mortgage underwriter and financial planner providing actionable, encouraging, and financially prudent guidance to first-time homebuyers.",
          temperature: 0.6,
        },
      });

      res.json({ analysis: response.text });
    } catch (error: any) {
      console.error("Mortgage analysis error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze mortgage profile" });
    }
  });

  // Vite middleware in dev, static serving in prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Manus Homebuyer Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Fatal error starting server:", err);
  process.exit(1);
});
