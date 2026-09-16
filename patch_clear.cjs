const fs = require('fs');
let code = fs.readFileSync('src/components/AILoanOfficer2ndBrain.tsx', 'utf8');

code = code.replace(
  /setMessages\(\[\]\);/g,
  'setMessages([defaultWelcomeMessage]);'
);

fs.writeFileSync('src/components/AILoanOfficer2ndBrain.tsx', code);
console.log("Patched successfully");
