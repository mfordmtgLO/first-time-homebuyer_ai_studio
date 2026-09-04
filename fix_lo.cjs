const fs = require('fs');
let code = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

const lines = code.split('\n');
const newLines = [];
for (let i = 0; i < lines.length; i++) {
  if (i >= 2057 && i <= 2070) { // 2058-2071 (0-indexed 2057-2070)
    // skip these broken lines
    continue;
  }
  newLines.push(lines[i]);
}

fs.writeFileSync('src/components/LoanOfficerPortal.tsx', newLines.join('\n'));
