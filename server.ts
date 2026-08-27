import express from "express";
import path from "path";
import fs from "fs";
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

  // API Route: Lead Intake Chatbot & Pre-Qualification Assistant
  app.post("/api/gemini/lead-intake", async (req, res) => {
    try {
      const { message, leadData, chatHistory, loName, loNmls, agentName } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Hardcoded SSN detection & blocking on backend endpoint
      const ssnPattern = /\b(?!000|666|9\d{2})\d{3}[-.\s]?(?!00)\d{2}[-.\s]?(?!0000)\d{4}\b/;
      if (ssnPattern.test(message)) {
        return res.json({
          reply: "🛡️ For your privacy and security, Social Security Numbers are strictly blocked and never stored. No Credit Card or SSN is required to explore prequalification or Down Payment Assistance programs.",
        });
      }

      const ai = getGeminiClient();
      const systemInstruction = `You are the interactive 24/7 Lead Intake & Pre-Qualification AI Assistant for ${loName || "Mike Ford"} (${loNmls ? "NMLS #" + loNmls : "Senior Loan Officer"}) and paired Real Estate Specialist ${agentName || "Sarah Jenkins"}.
Your primary goal is to guide prospective first-time homebuyers through an engaging, frictionless, consultative intake process to discover their purchasing power, explore Down Payment Assistance (DPA) opportunities, and collect their profile to generate a Custom Prequalification Blueprint.

Security & Privacy Guarantee:
- No credit card or Social Security Number (SSN) is ever required. 
- If a user asks about SSN or credit checks, reassure them that this preliminary inquiry is 100% confidential with NO hard credit pull, NO SSN required, and NO credit card required.

Rules for response:
1. Keep responses warm, encouraging, conversational, and concise (under 3-4 short paragraphs or bullet points).
2. If the user asks specific mortgage or market questions (rates, down payment, FHA vs Conventional, Down Payment Assistance (DPA), seller concessions), give a clear, accurate, jargon-free answer.
3. Positively reassure the buyer that first-time homebuying with 3-3.5% down or down payment assistance is very achievable.
4. Seamlessly transition back to the next step of their intake questionnaire if they haven't finished providing their timeline, target price/budget, down payment, or contact details.
5. Emphasize that their information is strictly confidential and used only by ${loName || "their local Loan Officer"} and ${agentName || "licensed Realtor"} to craft their customized mortgage options.
6. MANDATORY TERMINOLOGY RULE: ALWAYS and ONLY use the terms "prequal" or "prequalification". NEVER use the terms "pre-approval" or "preapproval".`;

      let promptContent = `Buyer Profile Context collected so far:\n`;
      promptContent += `- Full Name: ${leadData?.fullName || "Not provided yet"}\n`;
      promptContent += `- Timeline: ${leadData?.timeline || "Not provided yet"}\n`;
      promptContent += `- Target Price / Monthly Budget: ${leadData?.targetPriceRange || leadData?.targetMonthlyBudget || "Not provided yet"}\n`;
      promptContent += `- Down Payment Savings: ${leadData?.downPaymentSavings || "Not provided yet"}\n`;
      promptContent += `- DPA Interest: ${leadData?.grantInterest ? "Yes, interested in Down Payment Assistance (DPA)" : "Standard loan"}\n`;
      promptContent += `- Credit Tier: ${leadData?.creditScoreTier || "Not provided yet"}\n`;
      promptContent += `- Target Locations: ${leadData?.preferredLocations || "Not provided yet"}\n\n`;

      if (chatHistory && Array.isArray(chatHistory) && chatHistory.length > 0) {
        promptContent += "Recent Conversation:\n";
        chatHistory.slice(-6).forEach((h: { sender: string; text: string }) => {
          promptContent += `${h.sender === "user" ? "Homebuyer" : "Intake Bot"}: ${h.text}\n`;
        });
        promptContent += `\nCurrent User Message: ${message}`;
      } else {
        promptContent += `User Message: ${message}`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: promptContent,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ reply: response.text || "I'd love to help you determine your purchasing power and Down Payment Assistance (DPA) options! What timeline are you thinking for your home purchase?" });
    } catch (error: any) {
      console.error("Lead Intake API error:", error);
      res.status(500).json({
        error: error.message || "Failed to process lead intake",
        fallback: "Thank you for reaching out! We've noted your preferences and our team is ready to prepare your custom prequalification options."
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
4. First-time buyer Down Payment Assistance (DPA) or special program opportunities (FHA, Conventional 97, USDA, State DPA)
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

  // API Route: GeoSphere Oregon GIS Proxy & Synchronization
  app.post("/api/geosphere/sync", async (req, res) => {
    try {
      const { endpointUrl, syncToken } = req.body || {};
      const targetUrl = endpointUrl || "https://geosphere-map-oregon.vercel.app/api/map-saved-listings";

      const headers: Record<string, string> = {
        "User-Agent": "Manus-Homebuyer-Sync-Agent/1.0",
        "Accept": "application/json",
      };
      if (syncToken) {
        headers["x-geosphere-sync-token"] = syncToken;
      }

      const response = await fetch(targetUrl, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        return res.status(response.status).json({
          error: `GeoSphere endpoint responded with HTTP ${response.status}`,
          status: response.status,
        });
      }

      const data: any = await response.json();

      // Extract listings from all possible structures (pulls, overlaySets, raw array)
      let rawListings: any[] = [];
      if (data && Array.isArray(data.pulls)) {
        data.pulls.forEach((pull: any) => {
          const items = pull.overlaySets?.all || pull.listings || [];
          rawListings.push(...items);
        });
      } else if (data && Array.isArray(data.listings)) {
        rawListings = data.listings;
      } else if (Array.isArray(data)) {
        rawListings = data;
      }

      // Deduplicate and transform into standardized PropertyListing format
      const seenIds = new Set<string>();
      const standardized = rawListings
        .filter((item: any) => {
          const id = item.id || item.formattedAddress || `${item.latitude}-${item.longitude}`;
          if (!id || seenIds.has(id)) return false;
          seenIds.add(id);
          return true;
        })
        .map((item: any, idx: number) => {
          const price = Number(item.price) || 350000;
          const address = item.addressLine1 || (item.formattedAddress ? item.formattedAddress.split(",")[0] : "Oregon Property");
          const city = item.city || "Coos Bay";
          const state = item.state || "OR";
          const zip = item.zipCode || item.zip || "97420";

          const rawPtype = String(item.propertyType || "").toLowerCase();
          let propertyType = "Single Family";
          if (rawPtype.includes("manufactured")) propertyType = "Manufactured";
          else if (rawPtype.includes("mobile")) propertyType = "Mobile";
          else if (rawPtype.includes("condo")) propertyType = "Condo";
          else if (rawPtype.includes("townhouse") || rawPtype.includes("townhome")) propertyType = "Townhouse";
          else if (rawPtype.includes("multi")) propertyType = "Multi-Family";
          else if (rawPtype.includes("land")) propertyType = "Land";

          const usda = Boolean(item.overlayEligibility?.usda ?? item.overlayEligibility?.usdaEligible);
          const lmi = Boolean(item.overlayEligibility?.lmi ?? item.overlayEligibility?.lmiEligible);
          const firstHome = item.overlayEligibility?.firstHome;

          return {
            id: item.id || `geo-${Date.now()}-${idx}`,
            title: item.formattedAddress ? `${item.formattedAddress.split(",")[0]} Home` : `${address} - ${city}`,
            address,
            city,
            state,
            zip,
            price,
            beds: Number(item.bedrooms ?? item.beds) || 3,
            baths: Number(item.bathrooms ?? item.baths) || 2,
            sqft: Number(item.squareFootage ?? item.sqft) || 1500,
            yearBuilt: Number(item.yearBuilt) || 2018,
            propertyType,
            imageUrl: (item.photos && item.photos[0] && !item.photos[0].includes("unsplash.com")) ? item.photos[0] : (item.imageUrl && !item.imageUrl.includes("unsplash.com") ? item.imageUrl : undefined),
            status: "saved",
            notes: `MLS #${item.mlsNumber || "N/A"}. ${usda ? "USDA 100% Financing Eligible. " : ""}${lmi ? "OHCS LMI Tract Approved. " : ""}${firstHome?.targetedAreaDetails || ""}`.trim(),
            daysOnMarket: Number(item.daysOnMarket) || 14,
            hoaMonthly: Number(item.hoaMonthly || item.hoa?.fee || 0),
            propertyTaxAnnual: Number(item.propertyTaxAnnual || Math.round(price * 0.009)),
            isFavorite: false,
            isPubliclyPublished: true,
            syncedAt: new Date().toISOString(),
            mlsNumber: item.mlsNumber,
            mlsName: item.mlsName,
            listingAgent: item.listingAgent,
            listingOffice: item.listingOffice,
            overlayEligibility: {
              usda,
              usdaEligible: usda,
              usdaZoneName: item.overlayEligibility?.usdaInterpretation || "USDA Rural Eligible Area",
              usdaInterpretation: item.overlayEligibility?.usdaInterpretation || "outside-ineligible-v1",
              lmi,
              lmiEligible: lmi,
              lmiLevel: item.overlayEligibility?.lmiLevel || (lmi ? "Moderate" : undefined),
              lmiPercentage: item.overlayEligibility?.lmiPercentage || (lmi ? 72 : undefined),
              lmiCensusTract: item.overlayEligibility?.tract?.geoid || item.overlayEligibility?.lmiCensusTract || firstHome?.targetedAreaDetails,
              firstHomeEligible: Boolean(firstHome?.available ?? true),
              firstHomePriceCap: firstHome?.priceLimit || item.overlayEligibility?.firstHomePriceCap || 692211,
              targetedArea: firstHome?.areaType === "targeted" || Boolean(item.overlayEligibility?.targetedArea),
              countyName: item.county || firstHome?.county || item.overlayEligibility?.countyName || "Coos",
              sourceDataset: "GeoSphere Oregon GIS",
              firstHome: firstHome ? {
                available: Boolean(firstHome.available),
                priceEligible: firstHome.priceEligible !== undefined ? firstHome.priceEligible : (price <= (firstHome.priceLimit || 692211)),
                lmiEligible: Boolean(firstHome.lmiEligible ?? lmi),
                areaType: firstHome.areaType || "targeted",
                priceLimit: firstHome.priceLimit || 692211,
                county: firstHome.county || item.county || "Coos",
                targetedAreaDetails: firstHome.targetedAreaDetails || "Entire county is targeted."
              } : undefined
            },
          };
        });

      res.json({
        success: true,
        count: standardized.length,
        pullsCount: data.pulls?.length || 1,
        generatedAt: data.generatedAt || new Date().toISOString(),
        listings: standardized,
      });
    } catch (error: any) {
      console.error("GeoSphere sync error:", error);
      res.status(500).json({ error: error.message || "Failed to sync with GeoSphere" });
    }
  });

  // Vite middleware in dev, static serving in prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // Fallback for HTML SPA navigation routes (e.g. /mike-ford, /mford, /mike-and-sarah)
    app.get("*", async (req, res, next) => {
      if (req.originalUrl.startsWith("/api")) {
        return next();
      }
      try {
        const indexPath = path.resolve(process.cwd(), "index.html");
        let template = fs.readFileSync(indexPath, "utf-8");
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res, next) => {
      if (req.originalUrl.startsWith("/api")) {
        return next();
      }
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
