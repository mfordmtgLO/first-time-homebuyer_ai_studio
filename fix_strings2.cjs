const fs = require('fs');
let code = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

code = code.replace(/'\n'/g, "'\\\\n'");
code = code.replace(/"\n\n"/g, '"\\\\n\\\\n"');
code = code.replace(/"\n"/g, '"\\\\n"');
code = code.replace(/\\n/g, '\\n');

// Also make sure we escape the backticks in the Authorization header.
code = code.replace(/Authorization": `Bearer \${idToken}`/g, 'Authorization": `Bearer ${idToken}`');
code = code.replace(/`Successfully synced to Total Expert! ID: \${data.teId}`/g, '`Successfully synced to Total Expert! ID: ${data.teId}`');
code = code.replace(/`Sync failed: \${data.error}`/g, '`Sync failed: ${data.error}`');
code = code.replace(/`Sync error: \${e.message}`/g, '`Sync error: ${e.message}`');


fs.writeFileSync('src/components/LoanOfficerPortal.tsx', code);
