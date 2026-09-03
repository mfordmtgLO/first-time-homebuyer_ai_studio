const fs = require('fs');
let content = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

content = content.replace(/annualIncome: 125000,/g, 'annualIncome: "125000",');

fs.writeFileSync('src/components/LoanOfficerPortal.tsx', content);
