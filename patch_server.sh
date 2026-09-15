sed -i '/\/\/ POST \/api\/gemini\/realtor-roster-lookup/i \
  // API Route: Boost Ad Campaign Draft with AI\
  app.post("/api/gemini/ads-boost", async (req, res) => {\
    try {\
      const { property, loanOfficer, agent } = req.body || {};\
      if (!property) return res.status(400).json({ error: "Missing property details" });\
\
      const apiKey = process.env.GEMINI_API_KEY;\
      if (!apiKey) {\
        return res.json({\
          headlines: ["Unlock Your Dream Home Today", "Stop Renting, Start Owning", "Exclusive 0% Down Programs Available"],\
          audiences: ["First-Time Home Buyers", "Real Estate Enthusiasts", "Zillow Users", "Personal Finance"]\
        });\
      }\
\
      const ai = getGeminiClient();\
      const prompt = `You are an expert real estate performance marketer. Based on this property: ${property.address} in ${property.city} for $${property.price} (${property.beds} bed, ${property.baths} bath) co-listed by ${agent?.name || "Agent"} and ${loanOfficer?.name || "Loan Officer"}, suggest 3 high-converting ad headlines and 3-5 target audience interest groups on Facebook/Meta. Return as JSON with exactly these keys: "headlines" (array of 3 strings) and "audiences" (array of 3-5 strings).`;\
\
      const response = await ai.models.generateContent({\
        model: "gemini-3.7-flash",\
        contents: prompt,\
        config: {\
          responseMimeType: "application/json",\
          temperature: 0.7,\
        },\
      });\
\
      if (response.text) {\
        const parsed = JSON.parse(response.text);\
        return res.json({\
          headlines: parsed.headlines || [],\
          audiences: parsed.audiences || [],\
        });\
      }\
      throw new Error("No response text");\
    } catch (e) {\
      console.error("[Ads Boost Error]", e);\
      return res.status(500).json({ error: "Failed to boost ad copy" });\
    }\
  });\
\
' server.ts
