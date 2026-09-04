const fs = require('fs');
let code = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

// The main issues are single and double quotes that span newlines now.
// For example: `const lines = text.split('\n')` became `const lines = text.split('` (newline) `')`
// Let's replace cases of string spanning a newline.
code = code.replace(/'\n'/g, "'\\\\n'");
code = code.replace(/"\n\n"/g, '"\\\\n\\\\n"');
code = code.replace(/"\n"/g, '"\\\\n"');
code = code.replace(/\\n/g, '\\n');

fs.writeFileSync('src/components/LoanOfficerPortal.tsx', code);
