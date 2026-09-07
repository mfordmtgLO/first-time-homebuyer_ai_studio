const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const targetStr = `  app.post("/api/gemini/buyer-agent-email", async (req, res) => {
    const { agentNames, properties, loName, campaignType, tone, customNotes } = req.body || {};`;

const replacementStr = `  app.post("/api/gemini/buyer-agent-email", async (req, res) => {
    const { agentNames, properties, loName, loPhone, loEmail, loanOfficer, campaignType, tone, customNotes } = req.body || {};
    
    // Resolve dynamically from multiple possible input styles (backward compat)
    const finalLoName = loanOfficer?.name || loName || "Mike Ford";
    const finalLoContact = loanOfficer ? (loanOfficer.phone || loanOfficer.email ? \`(\${loanOfficer.phone || ""} \${loanOfficer.email || ""})\` : "") : \`(\${loPhone || ""} \${loEmail || ""})\`;
`;

content = content.replace(targetStr, replacementStr);

const instTarget = `Your goal is to convince local Buyer's Agents to partner up with Senior Loan Officer \${loName || "Mike Ford"} to co-market zero-down and low-down property listings to renters who want to stop paying rent and buy their first home.`;

const instReplacement = `Your goal is to convince local Buyer's Agents to partner up with Senior Loan Officer \${finalLoName} \${finalLoContact} to co-market zero-down and low-down property listings to renters who want to stop paying rent and buy their first home. Include the Loan Officer's full contact information elegantly in the sign-off.`;

content = content.replace(instTarget, instReplacement);

fs.writeFileSync('server.ts', content);
