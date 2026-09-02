const fs = require('fs');
let content = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

content = content.replace(/max-w-7xl/g, 'max-w-[1600px]');
fs.writeFileSync('src/components/LoanOfficerPortal.tsx', content);
console.log("Updated max-w to 1600px");
