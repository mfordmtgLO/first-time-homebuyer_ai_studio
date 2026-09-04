const fs = require('fs');
let code = fs.readFileSync('src/components/LoanOfficerSidebar.tsx', 'utf8');

code = code.replace(
  'id: "branch_admin_metrics",\n          label: "Branch Manager Admin",\n          icon: <ShieldCheck className="w-4 h-4" />,\n          badge: "Admin",\n          badgeColor: "bg-amber-500 text-white",\n          requiresAdmin: true',
  'id: "branch_management",\n          label: "Branch Access & Security",\n          icon: <ShieldCheck className="w-4 h-4" />,\n          badge: "Admin",\n          badgeColor: "bg-amber-500 text-white",\n          requiresAdmin: true\n        },\n        {\n          id: "branch_admin_metrics",\n          label: "Branch Performance & ROI",\n          icon: <PieChart className="w-4 h-4" />,\n          requiresAdmin: true'
);

fs.writeFileSync('src/components/LoanOfficerSidebar.tsx', code);
