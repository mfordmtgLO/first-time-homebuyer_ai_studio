const fs = require('fs');
let content = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

content = content.replace(/annualIncome: 155000,/g, 'annualIncome: "155000",');
content = content.replace(/annualIncome: 85000,/g, 'annualIncome: "85000",');
content = content.replace(/annualIncome: 95000,/g, 'annualIncome: "95000",');
content = content.replace(/annualIncome: 210000,/g, 'annualIncome: "210000",');

fs.writeFileSync('src/components/LoanOfficerPortal.tsx', content);
