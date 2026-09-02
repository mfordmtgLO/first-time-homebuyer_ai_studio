const fs = require('fs');
const file = 'server.ts';
let content = fs.readFileSync(file, 'utf8');

const newIngest = `
  app.post('/api/knowledge/ingest', async (req, res) => {
    try {
      const { text, fileName, fileBase64, mimeType } = req.body;
      const ai = getGeminiClient();
      if (!ai) return res.status(500).json({ error: 'No AI key configured for embeddings.' });
      
      let docText = text;

      // If a file was uploaded as base64, extract text with Gemini first
      if (fileBase64 && mimeType) {
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-3.7-flash',
            contents: [
              {
                inlineData: { data: fileBase64, mimeType }
              },
              "Please extract all text and structured data from this document accurately so it can be added to a knowledge base."
            ]
          });
          docText = response.text || docText;
        } catch (extErr) {
          console.error("Failed to extract text via Gemini:", extErr);
          if (!docText) throw new Error("Could not extract text and no fallback text provided.");
        }
      }

      if (!docText) {
        return res.status(400).json({ error: 'No text provided or extracted.' });
      }

      const doc = await addDocumentToKnowledge(docText, { fileName }, ai);
      res.json({ success: true, message: \`Successfully ingested \${fileName} into Vantage Knowledge Base.\`, docId: doc.id, extractedTextPreview: docText.substring(0, 200) });
    } catch (error: any) {
      console.error("Knowledge ingestion error:", error);
      res.status(500).json({ error: 'Knowledge ingestion failed' });
    }
  });
`;

content = content.replace(/app\.post\('\/api\/knowledge\/ingest', async \(req, res\) => \{[\s\S]*?res\.status\(500\)\.json\(\{ error: 'Knowledge ingestion failed' \}\);\n    \}\n  \}\);/, newIngest.trim());

fs.writeFileSync(file, content);
