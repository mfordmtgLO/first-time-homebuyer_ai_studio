const fs = require('fs');
let c = fs.readFileSync('src/components/AIPartnerCampaign.tsx', 'utf8');

c = c.replace(
  /loName: loanOfficer\.name,/g,
  'loanOfficer: loanOfficer,'
);

fs.writeFileSync('src/components/AIPartnerCampaign.tsx', c);
