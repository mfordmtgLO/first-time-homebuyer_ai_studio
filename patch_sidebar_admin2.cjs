const fs = require('fs');
let code = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

code = code.replace(
  'isAdminUser={Boolean(currentLo.isAdmin || currentLo.id === guidesState.adminLoanOfficerId)}',
  'isAdminUser={Boolean(currentLo.isAdmin || currentLo.id === guidesState.adminLoanOfficerId || userRole === "admin")}'
);

fs.writeFileSync('src/components/LoanOfficerPortal.tsx', code);
