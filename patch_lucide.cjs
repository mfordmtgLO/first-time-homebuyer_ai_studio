const fs = require('fs');
let code = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

if (!code.includes('AlertCircle,')) {
  code = code.replace(
    'import {\n',
    'import {\n  AlertCircle,\n'
  );
  fs.writeFileSync('src/components/LoanOfficerPortal.tsx', code);
  console.log("Added AlertCircle");
}
