const fs = require('fs');
let c = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

const regex = /const isAdminUser = Boolean\([\s\S]*?\);/;

const newLogic = `
  const isMasterAdmin = auth.currentUser?.email === "fordmj@gmail.com";
  const isAdminUser = Boolean(
    isMasterAdmin ||
    effectiveRbacRole === "branch_manager" ||
    userRole === "admin"
  );
`;

c = c.replace(regex, newLogic);
fs.writeFileSync('src/components/LoanOfficerPortal.tsx', c);
