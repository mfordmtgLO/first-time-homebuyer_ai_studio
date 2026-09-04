const fs = require('fs');
let code = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

code = code.replace(/\\n/g, '\n');

fs.writeFileSync('src/components/LoanOfficerPortal.tsx', code);
