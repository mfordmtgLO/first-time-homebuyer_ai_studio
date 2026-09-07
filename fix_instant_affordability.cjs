const fs = require('fs');
let c = fs.readFileSync('src/components/InstantAffordabilityCalculator.tsx', 'utf8');

c = c.replace(
  /state: profile\.state\s*}\),/g,
  'state: profile.state,\n          loanOfficer: loanOfficer,\n          agent: activeAgent\n        }),'
);

fs.writeFileSync('src/components/InstantAffordabilityCalculator.tsx', c);
