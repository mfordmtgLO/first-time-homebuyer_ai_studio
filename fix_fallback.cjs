const fs = require('fs');
let content = fs.readFileSync('src/components/SmartCompareAI.tsx', 'utf8');

content = content.replace(
  '`Contact your local guides ${loanOfficer?.name || "Mike Ford"} and ${agent?.name || "Kanndice McLean"} to get a custom property list emailed directly to you matching these exact criteria.`',
  '`Contact your local guides ${loanOfficer?.name || "Mike Ford"} ${loanOfficer?.phone ? "("+loanOfficer.phone+")" : ""} and ${agent?.name || "Kanndice McLean"} ${agent?.phone ? "("+agent.phone+")" : ""} to get a custom property list emailed directly to you matching these exact criteria.`'
);

fs.writeFileSync('src/components/SmartCompareAI.tsx', content);
