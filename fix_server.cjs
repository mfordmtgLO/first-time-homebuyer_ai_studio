const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const target = `    const aiResponse = await generateStructuredResponse(
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
    
    res.json(aiResponse);`;

const replacement = `    
    const prompt = \`You are a top-tier real estate and mortgage AI assistant representing local guides \${loanOfficer || 'Mike Ford'} and \${agent || 'Kanndice McLean'}.
      
The user is comparing the following properties:
\${JSON.stringify(properties, null, 2)}

The user's specific request/criteria: "\${userPrompt}"

Analyze these properties against the user's specific request. Provide a structured, insightful comparison.
Highlight key pros and cons of each, specifically addressing the user's criteria.
Organize the comparison for maximum user engagement.
At the end, include a strong Call to Action to contact \${loanOfficer || 'Mike Ford'} and \${agent || 'Kanndice McLean'} to get a tailored custom list emailed to them.\`;

    const ai = require('@google/genai').GoogleGenAI ? new (require('@google/genai').GoogleGenAI)({ apiKey: process.env.GEMINI_API_KEY }) : null;
    if (!ai) return res.status(500).json({error: "AI not configured"});

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
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
    });
    
    const data = JSON.parse(response.text || '{}');
    res.json(data);`;

content = content.replace(target, replacement);
fs.writeFileSync('server.ts', content);
