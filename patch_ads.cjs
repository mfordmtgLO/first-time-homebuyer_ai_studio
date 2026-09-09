const fs = require('fs');
let code = fs.readFileSync('src/components/AdsCampaignHub.tsx', 'utf8');

const target1 = `    primaryText: \`Stop guessing what your monthly mortgage payment will be. 🏡 We created a free, transparent interactive First-Time Homebuyer Portal for Oregon & Washington buyers to calculate exact monthly payments (including taxes, HOA, and home insurance) and check eligibility for up to $30,000 in state Down Payment Assistance (DPA).`;

const replacement1 = `    primaryText: \`Stop guessing what your monthly mortgage payment will be. 🏡 We created a free, transparent interactive First-Time Homebuyer Portal for \${activeAgent.marketAreas?.join(" & ") || "local"} buyers to calculate exact monthly payments (including taxes, HOA, and home insurance) and check eligibility for up to $30,000 in state Down Payment Assistance (DPA).`;

code = code.replace(target1, replacement1);

const target2 = `    campaignName: \`[Google Search] First Time Homebuyer Oregon • \${loanOfficer.name} + \${activeAgent.name}\`,`;
const replacement2 = `    campaignName: \`[Google Search] First Time Homebuyer \${activeAgent.marketAreas?.[0] || "Local"} • \${loanOfficer.name} + \${activeAgent.name}\`,`;

code = code.replace(target2, replacement2);

const target3 = `"Oregon First Time Homebuyer Hub",`;
const replacement3 = `"\${activeAgent.marketAreas?.[0] || "Local"} First Time Homebuyer Hub",`;
code = code.replace(target3, replacement3);

const target4 = `"Explore verified Oregon Down Payment Assistance (DPA), 2-1 buydowns, and 10-step closing roadmap. Try free today.",`;
const replacement4 = `"Explore verified \${activeAgent.marketAreas?.[0] || "Local"} Down Payment Assistance (DPA), 2-1 buydowns, and 10-step closing roadmap. Try free today.",`;
code = code.replace(target4, replacement4);

const target5 = `"first time home buyer oregon",
      "oregon down payment assistance dpa",
      "mortgage payment calculator portland or",
      "first time buyer pre approval portland",
      "how much house can i afford oregon",
      "piti mortgage calculator oregon",
      "oregon bond residential loan program"`;

const replacement5 = `\`first time home buyer \${activeAgent.marketAreas?.[0]?.toLowerCase() || "oregon"}\`,
      \`\${activeAgent.marketAreas?.[0]?.toLowerCase() || "oregon"} down payment assistance dpa\`,
      \`mortgage payment calculator \${activeAgent.marketAreas?.[0]?.toLowerCase() || "portland"}\`,
      \`first time buyer pre approval \${activeAgent.marketAreas?.[0]?.toLowerCase() || "portland"}\`,
      \`how much house can i afford \${activeAgent.marketAreas?.[0]?.toLowerCase() || "oregon"}\`,
      \`piti mortgage calculator \${activeAgent.marketAreas?.[0]?.toLowerCase() || "oregon"}\`,
      "local bond residential loan program"`;

code = code.replace(target5, replacement5);

fs.writeFileSync('src/components/AdsCampaignHub.tsx', code);
