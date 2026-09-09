const fs = require('fs');
let code = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

// The TwilioMobileSimulator should be outside the main container to ensure absolute fixed positioning works perfectly.
code = code.replace(
  '      <TwilioMobileSimulator />\n    </div>\n  );\n};',
  '    </div>\n    <TwilioMobileSimulator />\n  );\n};'
);

fs.writeFileSync('src/components/LoanOfficerPortal.tsx', code);
