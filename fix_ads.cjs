const fs = require('fs');
let code = fs.readFileSync('src/components/AdsCampaignHub.tsx', 'utf8');

const target1 = `        "\${activeAgent.marketAreas?.[0] || "Local"} First Time Homebuyer Hub",`;
const replacement1 = `        \`\${activeAgent.marketAreas?.[0] || "Local"} First Time Homebuyer Hub\`,`;
code = code.replace(target1, replacement1);

const target2 = `        "Explore verified \${activeAgent.marketAreas?.[0] || "Local"} Down Payment Assistance (DPA), 2-1 buydowns, and 10-step closing roadmap. Try free today.",`;
const replacement2 = `        \`Explore verified \${activeAgent.marketAreas?.[0] || "Local"} Down Payment Assistance (DPA), 2-1 buydowns, and 10-step closing roadmap. Try free today.\`,`;
code = code.replace(target2, replacement2);

fs.writeFileSync('src/components/AdsCampaignHub.tsx', code);
