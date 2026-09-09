const fs = require('fs');
let code = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

code = code.replace(
  'onTriggerToast={(msg) => showToast(msg, "success")}',
  'onTriggerToast={(msg) => triggerToast(msg)}'
);

code = code.replace(
  '<TwilioMobileSimulator />',
  ''
);

fs.writeFileSync('src/components/LoanOfficerPortal.tsx', code);
