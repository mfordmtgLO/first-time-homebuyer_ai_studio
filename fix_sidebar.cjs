const fs = require('fs');
let c = fs.readFileSync('src/components/LoanOfficerSidebar.tsx', 'utf8');

const badBlock = `/>  const isMasterAdmin = loggedInUser?.email === "fordmj@gmail.com";

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
    const branchAdminCategory = navCategories.find(c => c.id === "branch_admin");
    if (branchAdminCategory && isMasterAdmin) {
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

      {/* 2. SCROLLABLE NAVIGATION DIRECTORY */}`;

c = c.replace(badBlock, '/>\n\n      {/* 2. SCROLLABLE NAVIGATION DIRECTORY */}');

// Now inject the logic in the correct place, right before return (
const target = `  // Filter items based on user admin status`;

const replacement = `
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
    const branchAdminCategory = navCategories.find(c => c.id === "branch_admin");
    if (branchAdminCategory && isMasterAdmin) {
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

  // Filter items based on user admin status`;

c = c.replace(target, replacement);

fs.writeFileSync('src/components/LoanOfficerSidebar.tsx', c);
