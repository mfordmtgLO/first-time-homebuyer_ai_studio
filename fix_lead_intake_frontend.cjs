const fs = require('fs');
let c = fs.readFileSync('src/components/LeadIntakeChatbot.tsx', 'utf8');
c = c.replace(
  /loName: loanOfficer\.name,\s*loNmls: loanOfficer\.nmlsId,\s*agentName: agent\.name/g,
  'loanOfficer: loanOfficer,\n          agent: agent'
);
fs.writeFileSync('src/components/LeadIntakeChatbot.tsx', c);
