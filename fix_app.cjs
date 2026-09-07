const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

c = c.replace(
  /loanOfficer=\{guidesState\.loanOfficer\}\s*\/>/g,
  'loanOfficer={guidesState.loanOfficer}\n                    activeAgent={activeAgent}\n                  />'
);

fs.writeFileSync('src/App.tsx', c);
