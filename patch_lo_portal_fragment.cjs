const fs = require('fs');
let code = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

// I will just replace the return div with a fragment.
// Find `return (`
code = code.replace(/return \(\s*<div/g, 'return (\n    <>\n      <div');
code = code.replace(/    <\/div>\n    <TwilioMobileSimulator \/>\n  \);\n};/, '    </div>\n      <TwilioMobileSimulator />\n    </>\n  );\n};');

fs.writeFileSync('src/components/LoanOfficerPortal.tsx', code);
