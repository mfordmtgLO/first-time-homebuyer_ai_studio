const fs = require('fs');
const content = fs.readFileSync('server.ts', 'utf8');

const newEndpoint = `
// Property Compare AI Endpoint
app.post("/api/gemini/property-compare", async (req, res) => {
  try {
    const { properties, userPrompt, loanOfficer, agent } = req.body;
    
    if (!properties || properties.length === 0) {
      return res.status(400).json({ error: "Missing properties for comparison." });
    }

    const aiResponse = await generateStructuredResponse(
      \`You are a top-tier real estate and mortgage AI assistant representing local guides \${loanOfficer || 'Mike Ford'} and \${agent || 'Kanndice McLean'}.
      
The user is comparing the following properties:
\${JSON.stringify(properties, null, 2)}

The user's specific request/criteria: "\${userPrompt}"

Analyze these properties against the user's specific request. Provide a structured, insightful comparison.
Highlight key pros and cons of each, specifically addressing the user's criteria.
Organize the comparison for maximum user engagement.
At the end, include a strong Call to Action to contact \${loanOfficer || 'Mike Ford'} and \${agent || 'Kanndice McLean'} to get a tailored custom list emailed to them.\`,
      {
        preferredModel: "gemini-3.7-flash",
        responseSchema: {
          type: "object",
          properties: {
            overview: { type: "string" },
            propertyComparisons: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  propertyId: { type: "string" },
                  address: { type: "string" },
                  pros: { type: "array", items: { type: "string" } },
                  cons: { type: "array", items: { type: "string" } },
                  matchScore: { type: "number" }
                }
              }
            },
            recommendation: { type: "string" },
            callToAction: { type: "string" }
          },
          required: ["overview", "propertyComparisons", "recommendation", "callToAction"]
        }
      }
    );
    
    res.json(aiResponse);
  } catch (error) {
    console.error("Compare AI error:", error);
    res.status(500).json({ error: "Failed to generate comparison" });
  }
});

// END Property Compare AI Endpoint
`;

// Insert before the last app.listen or similar
const lastListenIndex = content.lastIndexOf("app.listen");
const updatedContent = content.substring(0, lastListenIndex) + newEndpoint + content.substring(lastListenIndex);

fs.writeFileSync('server.ts', updatedContent);
