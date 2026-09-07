const fs = require('fs');
let c = fs.readFileSync('src/components/LoanOfficerSidebar.tsx', 'utf8');

const target = `  let navCategories: NavCategory[] = [`;

// I already changed const navCategories to let navCategories, wait... did I?
if (!c.includes('let navCategories: NavCategory[] = [')) {
    c = c.replace('const navCategories: NavCategory[] = [', 'let navCategories: NavCategory[] = [');
}

// Ensure the TabId type includes our new ones.
if (!c.includes('"master_role_manager"')) {
   c = c.replace('| "master_lead_journey"', '| "master_lead_journey"\n  | "master_role_manager"');
}
if (!c.includes('"compliance_audit"')) {
   c = c.replace('| "master_lead_journey"', '| "master_lead_journey"\n  | "compliance_audit"');
}

// Ensure interface has userRole.
if (!c.includes('userRole?: string')) {
   c = c.replace('interface LoanOfficerSidebarProps {', 'interface LoanOfficerSidebarProps {\n  userRole?: string;');
   const propsTarget = `export const LoanOfficerSidebar: React.FC<LoanOfficerSidebarProps> = ({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  currentLo,
  loggedInUser,
  guidesState,
  isAdminUser,
  onOpenDailyReview,
  workspaceConnected = false,
}) => {`;
   const propsReplacement = `export const LoanOfficerSidebar: React.FC<LoanOfficerSidebarProps> = ({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  currentLo,
  loggedInUser,
  guidesState,
  isAdminUser,
  onOpenDailyReview,
  workspaceConnected = false,
  userRole
}) => {`;
   c = c.replace(propsTarget, propsReplacement);
}

const filterTarget = `      {/* 2. SCROLLABLE NAVIGATION DIRECTORY */}`;

const newFilterLogic = `  const isMasterAdmin = loggedInUser?.email === "fordmj@gmail.com";

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

c = c.replace(filterTarget, newFilterLogic);

fs.writeFileSync('src/components/LoanOfficerSidebar.tsx', c);
