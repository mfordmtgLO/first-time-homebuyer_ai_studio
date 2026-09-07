const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const targetStr = `  app.post("/api/gemini/mortgage-analysis", async (req, res) => {
    const { income, monthlyDebt, downPayment, creditScore, targetHomePrice, state } =
      req.body || {};
    try {
      const prompt = \`Analyze this first-time homebuyer's financial profile:`;

const replacementStr = `  app.post("/api/gemini/mortgage-analysis", async (req, res) => {
    const { income, monthlyDebt, downPayment, creditScore, targetHomePrice, state, loanOfficer, agent } =
      req.body || {};
    try {
      const loName = loanOfficer?.name || "Mike Ford";
      const loContact = loanOfficer?.phone || loanOfficer?.email ? \`(\${loanOfficer.phone || ""} \${loanOfficer.email || ""})\` : "";
      const agentName = agent?.name || "Kanndice McLean";
      const agentBrokerage = agent?.brokerage ? \` of \${agent.brokerage}\` : "";
      const agentContact = agent?.phone || agent?.email ? \`(\${agent.phone || ""} \${agent.email || ""})\` : "";
    
      const prompt = \`Analyze this first-time homebuyer's financial profile:`;

content = content.replace(targetStr, replacementStr);

const instTarget = `"You are a senior mortgage underwriter and financial planner providing actionable, encouraging, and financially prudent guidance to first-time homebuyers.",`;
const instReplacement = `\`You are a senior mortgage underwriter and financial planner providing actionable, encouraging, and financially prudent guidance to first-time homebuyers. Represent their local guides: \${loName} \${loContact} and \${agentName}\${agentBrokerage} \${agentContact}. End the analysis with a clear call-to-action to contact their guides for a custom strategy.\`,`;

content = content.replace(instTarget, instReplacement);

fs.writeFileSync('server.ts', content);
