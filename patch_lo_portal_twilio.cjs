const fs = require('fs');
let code = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

// Add import
if (!code.includes('TwilioMobileSimulator')) {
  code = code.replace(
    'import { AIDailyReviewModal } from "./AIDailyReviewModal";',
    'import { AIDailyReviewModal } from "./AIDailyReviewModal";\nimport { TwilioMobileSimulator } from "./TwilioMobileSimulator";'
  );
  
  // Inject before last </div>
  const parts = code.split('    </div>\n  );\n};');
  if (parts.length === 2) {
    code = parts[0] + '      <TwilioMobileSimulator />\n    </div>\n  );\n};' + parts[1];
    fs.writeFileSync('src/components/LoanOfficerPortal.tsx', code);
    console.log("Patched successfully");
  } else {
    console.error("Could not find end of file pattern");
  }
} else {
  console.log("Already imported");
}
