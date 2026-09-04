const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// I'll replace the fetch call with the GoogleGenAI instance.
const oldFetch = `      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey, {
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
      
      res.json(JSON.parse(generatedText));`;

const newGenAI = `      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7
        }
      });
      
      if (!response || !response.text) {
        throw new Error("Failed to generate response from Gemini");
      }
      
      res.json(JSON.parse(response.text));`;

code = code.replace(oldFetch, newGenAI);
fs.writeFileSync('server.ts', code);
