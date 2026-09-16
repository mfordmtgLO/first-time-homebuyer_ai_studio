const fs = require('fs');
let code = fs.readFileSync('src/components/AILoanOfficer2ndBrain.tsx', 'utf8');

code = code.replace(
  /text: \`\*\*Error:\*\* Failed to ingest URL\. The server may have blocked the request or the document was unreachable\.\`,/g,
  'text: `**Error:** ` + (error.message || "Failed to ingest URL. The server may have blocked the request or the document was unreachable."),'
);

fs.writeFileSync('src/components/AILoanOfficer2ndBrain.tsx', code);
console.log("Patched successfully");
