const fs = require('fs');
let code = fs.readFileSync('src/components/AdsCampaignHub.tsx', 'utf8');

const target1 = `activeAgent.marketAreas`;
const replacement1 = `(activeAgent.activeAdCounties?.length ? activeAgent.activeAdCounties : activeAgent.marketAreas)`;

code = code.replace(/activeAgent\.marketAreas/g, replacement1);

fs.writeFileSync('src/components/AdsCampaignHub.tsx', code);
