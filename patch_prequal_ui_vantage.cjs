const fs = require('fs');
let code = fs.readFileSync('src/components/AIPrequalWizard.tsx', 'utf8');

code = code.replace(
  "Hi! I'm ${loanOfficer.name}'s AI Underwriting Assistant.",
  "Hi! I'm ${loanOfficer.name}'s AI Underwriting Assistant powered by the Vantage AI Mortgage Second Brain."
);

code = code.replace(
  'Real-time Intelligent Underwriting',
  'Powered by Vantage AI Mortgage Second Brain'
);

fs.writeFileSync('src/components/AIPrequalWizard.tsx', code);
