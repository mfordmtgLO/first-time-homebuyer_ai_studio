const fs = require('fs');

// Patch App.tsx
let codeApp = fs.readFileSync('src/App.tsx', 'utf8');
codeApp = codeApp.replace(
  '<LoanOfficerPortal',
  '<LoanOfficerPortal userRole={userRole}'
);
fs.writeFileSync('src/App.tsx', codeApp);

// Patch LoanOfficerPortal.tsx
let codeLo = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

// Add to props
codeLo = codeLo.replace(
  'interface LoanOfficerPortalProps {',
  'interface LoanOfficerPortalProps {\n  userRole?: "admin" | "lo" | null;'
);

// Add to component signature
codeLo = codeLo.replace(
  'export const LoanOfficerPortal: React.FC<LoanOfficerPortalProps> = ({',
  'export const LoanOfficerPortal: React.FC<LoanOfficerPortalProps> = ({\n  userRole,'
);

// Conditionally render the button
const buttonMatch = `<button
              onClick={() => setActiveTab("branch_management")}`;
codeLo = codeLo.replace(
  buttonMatch,
  `{userRole === "admin" && (
            <button
              onClick={() => setActiveTab("branch_management")}`
);

// Find the end of the button and add the closing brace
const buttonEndMatch = `</div>
            </button>`;
codeLo = codeLo.replace(
  buttonEndMatch,
  `</div>
            </button>
          )}`
);

fs.writeFileSync('src/components/LoanOfficerPortal.tsx', codeLo);
