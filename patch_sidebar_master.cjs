const fs = require('fs');
let c = fs.readFileSync('src/components/LoanOfficerSidebar.tsx', 'utf8');

c = c.replace(
  '| "compliance_audit"',
  '| "compliance_audit"\n  | "master_role_manager"'
);

// We need to determine if logged in user is master admin. We have `loggedInUser` passed.
const filterLogicRegex = /  if \(userRole === "compliance_auditor"\) \{[\s\S]*?\} else \{[\s\S]*?\}\n\n  \/\/ Filter out categories and items based on admin status/;

const newFilterLogic = `
  const isMasterAdmin = loggedInUser?.email === "fordmj@gmail.com";

  if (userRole === "compliance_auditor") {
    navCategories = [
      {
        id: "compliance",
        title: "Compliance & Security",
        items: [
          {
            id: "compliance_audit",
            label: "Zero-Trust Audit Trail",
            icon: <ShieldCheck className="w-5 h-5" />,
            badge: "Secure",
          }
        ]
      }
    ];
  } else {
    // Hide compliance audit from normal LOs
    const branchAdminCategory = navCategories.find(c => c.id === "branch_admin");
    if (branchAdminCategory) {
       // Only Master Admin can see compliance audit in the normal portal
       if (isMasterAdmin) {
         branchAdminCategory.items.push({
           id: "compliance_audit",
           label: "Zero-Trust Audit Trail",
           icon: <ShieldCheck className="w-5 h-5" />,
           requiresAdmin: true
         });
         branchAdminCategory.items.push({
           id: "master_role_manager",
           label: "Master Role & Access",
           icon: <Key className="w-5 h-5" />,
           requiresAdmin: true,
           badge: "Master",
           badgeColor: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
         });
       }
    }
  }

  // Filter out categories and items based on admin status`;

c = c.replace(filterLogicRegex, newFilterLogic);

fs.writeFileSync('src/components/LoanOfficerSidebar.tsx', c);
