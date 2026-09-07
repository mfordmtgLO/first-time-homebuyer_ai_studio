const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const targetStr = `  app.post("/api/gemini/property-compare", async (req, res) => {
    try {
      const { properties, userPrompt, loanOfficer, agent } = req.body;

      if (!properties || properties.length === 0) {
        return res.status(400).json({ error: "Missing properties for comparison." });
      }

      const prompt = \`You are a top-tier real estate and mortgage AI assistant representing local guides \${loanOfficer || "Mike Ford"} and \${agent || "Kanndice McLean"}.
      
The user is comparing the following properties:
\${JSON.stringify(properties, null, 2)}

The user's specific request/criteria: "\${userPrompt}"

Analyze these properties against the user's specific request. Provide a structured, insightful comparison.
Highlight key pros and cons of each, specifically addressing the user's criteria.
Organize the comparison for maximum user engagement.
At the end, include a strong Call to Action to contact \${loanOfficer || "Mike Ford"} and \${agent || "Kanndice McLean"} to get a tailored custom list emailed to them.\`;`;

const replacementStr = `  app.post("/api/gemini/property-compare", async (req, res) => {
    try {
      const { properties, userPrompt, loanOfficer, agent } = req.body;

      if (!properties || properties.length === 0) {
        return res.status(400).json({ error: "Missing properties for comparison." });
      }

      const loName = loanOfficer?.name || "Mike Ford";
      const loContact = loanOfficer?.phone || loanOfficer?.email ? \`(\${loanOfficer.phone || ''} \${loanOfficer.email || ''})\` : "";
      const agentName = agent?.name || "Kanndice McLean";
      const agentBrokerage = agent?.brokerage ? \` of \${agent.brokerage}\` : "";
      const agentContact = agent?.phone || agent?.email ? \`(\${agent.phone || ''} \${agent.email || ''})\` : "";

      const prompt = \`You are a top-tier real estate and mortgage AI assistant representing local guides \${loName} and \${agentName}\${agentBrokerage}.
      
The user is comparing the following properties:
\${JSON.stringify(properties, null, 2)}

The user's specific request/criteria: "\${userPrompt}"

Analyze these properties against the user's specific request. Provide a structured, insightful comparison.
Highlight key pros and cons of each, specifically addressing the user's criteria.
Organize the comparison for maximum user engagement.
At the end, include a strong, dynamic Call to Action encouraging the user to reach out directly to their local guides \${loName} \${loContact} and \${agentName} \${agentContact} to get a tailored custom list emailed to them.\`;`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('server.ts', content);
