const fs = require('fs');
let code = fs.readFileSync('src/components/AdminAdComplianceSection.tsx', 'utf8');

// The escaped backticks \` were written literally into the file because we didn't escape them twice in the bash heredoc
code = code.replace(/\\`/g, '`');

fs.writeFileSync('src/components/AdminAdComplianceSection.tsx', code);
