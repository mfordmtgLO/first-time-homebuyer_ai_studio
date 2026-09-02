const fs = require('fs');
const file = 'server.ts';
let content = fs.readFileSync(file, 'utf8');

const analyzeDocRegex = /app\.post\('\/api\/analyze-doc', async \(req, res\) => \{[\s\S]*?res\.status\(500\)\.json\(\{ error: 'Document analysis failed' \}\);\n    \}\n  \}\);/;

const newAnalyzeDoc = `
  // Document Analysis Endpoint with RAG Context
  app.post('/api/analyze-doc', async (req, res) => {
    try {
      const { documentText, documentType, fileName } = req.body;
      const provider = getActiveAIProvider();
      if (provider === 'none') return res.status(500).json({ error: 'No AI key configured.' });

      let augmentedPrompt = \`Analyze this mortgage document (\${fileName || documentType}):\\n"""\${documentText}"""\\nProvide a structured Underwriting Analysis including Income Extraction, Risk Flags, and Action Items.\`;

      const ai = getGeminiClient();
      
      // Inject RAG context based on the document text
      try {
        if (ai) {
          // Use a snippet of the document to find related guidelines in our Knowledge Base
          const queryText = (documentText || "").substring(0, 1000);
          const relevantDocs = await searchKnowledge(queryText, ai);
          const strongDocs = relevantDocs.filter(d => d.score > 0.50);
          
          if (strongDocs.length > 0) {
            let contextStr = "\\n\\n[RELEVANT MIKE FORD OREGON KNOWLEDGE BASE & CASE STUDIES]:\\n";
            contextStr += strongDocs.map((d, i) => \`--- Reference \${i+1} (\${d.metadata?.fileName || 'Historical Data'}) ---\\n\${d.text}\`).join("\\n\\n");
            contextStr += "\\n\\nINSTRUCTION: Cross-reference the uploaded document against the above local underwriting guidelines and case studies. Identify if the document meets our specific overlays or requires additional structuring.";
            
            augmentedPrompt += contextStr;
          }
        }
      } catch (e) {
        console.error("RAG Search failed for analyze-doc, proceeding without context", e);
      }

      if (ai) {
          const response = await ai.models.generateContent({
              model: 'gemini-3.7-flash',
              contents: augmentedPrompt,
              config: { systemInstruction: SYSTEM_PROMPT, temperature: 0.4 }
          });
          return res.json({ analysis: response.text });
      }
    } catch (error: any) {
      res.status(500).json({ error: 'Document analysis failed' });
    }
  });
`;

content = content.replace(analyzeDocRegex, newAnalyzeDoc.trim());
fs.writeFileSync(file, content);
