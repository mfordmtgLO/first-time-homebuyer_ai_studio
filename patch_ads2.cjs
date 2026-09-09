const fs = require('fs');
let code = fs.readFileSync('src/components/AdsCampaignHub.tsx', 'utf8');

const target = `We created a free, transparent interactive First-Time Homebuyer Portal for Oregon & Washington buyers to calculate exact monthly payments (including taxes, HOA, and home insurance) and check eligibility for up to $30,000 in state Down Payment Assistance (DPA).`;
const replacement = `We created a free, transparent interactive First-Time Homebuyer Portal for \${activeAgent.marketAreas?.join(" & ") || "local"} buyers to calculate exact monthly payments (including taxes, HOA, and home insurance) and check eligibility for up to $30,000 in state Down Payment Assistance (DPA).`;

code = code.replace(target, replacement);

const target2 = `Browse verified Oregon & Washington Down Payment Assistance`;
const replacement2 = `Browse verified \${activeAgent.marketAreas?.[0] || "Local"} Down Payment Assistance`;

code = code.replace(target2, replacement2);

fs.writeFileSync('src/components/AdsCampaignHub.tsx', code);
