const fs = require('fs');
let code = fs.readFileSync('src/components/AdminAdComplianceSection.tsx', 'utf8');

code = code.replace(/className=\{\\\`flex/g, 'className={`flex');
code = code.replace(/hover:bg-red-200"\\n                      \}\\`\}/g, 'hover:bg-red-200"\n                      }`}');
// just to be safe, replace all `\` ` with backtick
code = code.replace(/\\\`/g, '`');

fs.writeFileSync('src/components/AdminAdComplianceSection.tsx', code);
