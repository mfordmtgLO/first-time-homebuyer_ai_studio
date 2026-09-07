const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const targetStr = `  app.post("/api/gemini/lead-intake", async (req, res) => {
    const { message, leadData, chatHistory, loName, loNmls, agentName } = req.body || {};`;

const replacementStr = `  app.post("/api/gemini/lead-intake", async (req, res) => {
    const { message, leadData, chatHistory, loanOfficer, agent } = req.body || {};
    const loName = loanOfficer?.name || "Mike Ford";
    const loNmls = loanOfficer?.nmlsId || "288455";
    const loContact = loanOfficer?.phone || loanOfficer?.email ? \`(\${loanOfficer.phone || ""} \${loanOfficer.email || ""})\` : "";
    const agentName = agent?.name || "Kanndice McLean";
    const agentBrokerage = agent?.brokerage ? \` of \${agent.brokerage}\` : "";
    const agentContact = agent?.phone || agent?.email ? \`(\${agent.phone || ""} \${agent.email || ""})\` : "";
`;

content = content.replace(targetStr, replacementStr);

const instructionTarget = `systemInstruction: \`You are the interactive 24/7 Lead Intake & Pre-Qualification AI Assistant for \${loName || "Mike Ford"} (\${loNmls ? "NMLS #" + loNmls : "Senior Loan Officer"}) and paired Real Estate Specialist \${agentName || "Sarah Jenkins"}. Be encouraging, warm, consultative, and protect buyer privacy (NO SSN/credit card required). Use the terms "prequal" or "prequalification".\``;

const instructionReplacement = `systemInstruction: \`You are the interactive 24/7 Lead Intake & Pre-Qualification AI Assistant for \${loName} (NMLS #\${loNmls}) \${loContact} and paired Real Estate Specialist \${agentName}\${agentBrokerage} \${agentContact}. Be encouraging, warm, consultative, and protect buyer privacy (NO SSN/credit card required). If you refer the user to contact their guides, use their specific contact information. Use the terms "prequal" or "prequalification".\``;

content = content.replace(instructionTarget, instructionReplacement);

fs.writeFileSync('server.ts', content);
