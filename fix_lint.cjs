const fs = require('fs');
let content = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

content = content.replace(/teamStarStatus: nextStatus }/g, 'teamStarStatus: nextStatus as "red" | "blue" | "green" }');

fs.writeFileSync('src/components/LoanOfficerPortal.tsx', content);
console.log("Fixed teamStarStatus TS errors.");
