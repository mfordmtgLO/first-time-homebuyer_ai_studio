const fs = require('fs');
let content = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

const target = `              aiGenerated: true
            });
          }
          setAiAgentMsg`;

const rep = `              aiGenerated: true
            }));
          }
          setAiAgentMsg`;

content = content.replace(target, rep);

fs.writeFileSync('src/components/LoanOfficerPortal.tsx', content);
