const fs = require('fs');
let code = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');
code = code.replace(
  'Phone,',
  'Phone, Cloud,'
);
fs.writeFileSync('src/components/LoanOfficerPortal.tsx', code);
