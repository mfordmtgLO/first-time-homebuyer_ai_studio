const fs = require('fs');
let code = fs.readFileSync('src/components/LoanOfficerSidebar.tsx', 'utf8');

const target = `{
          id: "branch_admin_metrics",
          label: "Branch Performance & ROI",
          icon: <PieChart className="w-4 h-4" />,
          requiresAdmin: true,
        },`;

const addition = `
        {
          id: "respa_cost_sharing",
          label: "LO+Agent RESPA Cost-Sharing",
          icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
        },`;

if (!code.includes('respa_cost_sharing')) {
  code = code.replace(target, target + addition);
  fs.writeFileSync('src/components/LoanOfficerSidebar.tsx', code);
  console.log("Added respa_cost_sharing to sidebar");
}
