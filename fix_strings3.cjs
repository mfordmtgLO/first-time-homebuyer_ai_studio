const fs = require('fs');
let code = fs.readFileSync('src/components/TotalExpertSettingsModal.tsx', 'utf8');
code = code.replace(/\\`Bearer \\${idToken}\\`/g, '`Bearer ${idToken}`');
fs.writeFileSync('src/components/TotalExpertSettingsModal.tsx', code);
