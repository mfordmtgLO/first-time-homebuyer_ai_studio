const fs = require('fs');
let code = fs.readFileSync('src/components/AdsCampaignHub.tsx', 'utf8');

const targetDescMeta = '    description: `Free Interactive Tool • Powered by ${loanOfficer.name} (${loanOfficer.nmlsId}) & ${activeAgent.name} (REALTOR®)`,';
const replaceDescMeta = '    description: `Free Interactive Tool • Powered by ${loanOfficer.name} (NMLS #${loanOfficer.nmlsId}) & ${activeAgent.name} (Lic #${activeAgent.licenseNumber || "Broker"})`,';
code = code.replace(targetDescMeta, replaceDescMeta);

const targetDescGoogle = '      `Co-presented with ${activeAgent.name} (${activeAgent.brokerage}). Transparent homebuying clarity.`,';
const replaceDescGoogle = '      `Co-presented with ${activeAgent.name} (${activeAgent.brokerage} | Lic #${activeAgent.licenseNumber}). Transparent homebuying clarity.`,';
code = code.replace(targetDescGoogle, replaceDescGoogle);

fs.writeFileSync('src/components/AdsCampaignHub.tsx', code);
