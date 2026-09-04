const fs = require('fs');
let code = fs.readFileSync('src/components/LoanOfficerSidebar.tsx', 'utf8');

code = code.replace(
  'const isAdminUser = Boolean(currentLo.isAdmin || currentLo.id === guidesState.adminLoanOfficerId);',
  'const isAdminUser = Boolean(currentLo.isAdmin || currentLo.id === guidesState.adminLoanOfficerId || userRole === "admin");'
);

fs.writeFileSync('src/components/LoanOfficerSidebar.tsx', code);
