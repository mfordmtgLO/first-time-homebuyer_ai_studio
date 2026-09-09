const fs = require('fs');
let code = fs.readFileSync('src/components/AdsCampaignHub.tsx', 'utf8');

const target1 = `        "\${activeAgent.marketAreas?.[0] || "Local"} First Time Homebuyer Hub",`;
const replacement1 = `        \`\${activeAgent.marketAreas?.[0] || "Local"} First Time Homebuyer Hub\`,`;
code = code.replace(target1, replacement1);

// Sometimes standard string replace fails if it wasn't an exact match, let's use regex to be safe
code = code.replace(/\"\$\{activeAgent\.marketAreas\?\.\[0\] \|\| \"Local\"\} First Time Homebuyer Hub\"/g, '\`\${activeAgent.marketAreas?.[0] || "Local"} First Time Homebuyer Hub\`');
code = code.replace(/\"Explore verified \$\{activeAgent\.marketAreas\?\.\[0\] \|\| \"Local\"\} Down Payment Assistance \(DPA\), 2-1 buydowns, and 10-step closing roadmap\. Try free today\.\"/g, '\`Explore verified \${activeAgent.marketAreas?.[0] || "Local"} Down Payment Assistance (DPA), 2-1 buydowns, and 10-step closing roadmap. Try free today.\`');

fs.writeFileSync('src/components/AdsCampaignHub.tsx', code);
