const fs = require('fs');
let code = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

// The top bar branch_admin_metrics button
code = code.replace(
  '<ShieldCheck className="w-4 h-4 text-[#C18C5D]" />\n              <span>Branch Manager Admin</span>',
  '<PieChart className="w-4 h-4 text-[#C18C5D]" />\n              <span>Branch Performance & ROI</span>'
);

// The top bar branch_management button (currently says "Branch Whitelist Mgmt")
code = code.replace(
  '<span>Branch Whitelist Mgmt</span>',
  '<span>Branch Access & Security</span>'
);

fs.writeFileSync('src/components/LoanOfficerPortal.tsx', code);
