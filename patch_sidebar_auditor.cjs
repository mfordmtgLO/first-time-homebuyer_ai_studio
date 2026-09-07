const fs = require('fs');
let c = fs.readFileSync('src/components/LoanOfficerSidebar.tsx', 'utf8');

c = c.replace(
  '| "master_lead_journey"',
  '| "master_lead_journey"\n  | "compliance_audit"'
);

c = c.replace(
  'interface LoanOfficerSidebarProps {',
  'interface LoanOfficerSidebarProps {\n  userRole?: string;'
);

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
  workspaceConnected = false
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


// We need to modify navCategories dynamically if userRole === "compliance_auditor"
const navCategoriesTarget = `  const navCategories: NavCategory[] = [`;

const navCategoriesReplacement = `  let navCategories: NavCategory[] = [`;
c = c.replace(navCategoriesTarget, navCategoriesReplacement);

const filterLogic = `  if (userRole === "compliance_auditor") {
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
    // Hide compliance audit from normal LOs, or let branch managers see it?
    // Let's add it to the Branch Admin section if they are an admin
    const branchAdminCategory = navCategories.find(c => c.id === "branch_admin");
    if (branchAdminCategory) {
       branchAdminCategory.items.push({
         id: "compliance_audit",
         label: "Zero-Trust Audit Trail",
         icon: <ShieldCheck className="w-5 h-5" />,
         requiresAdmin: true
       });
    }
  }

  // Filter out categories and items based on admin status
`;

// Insert the filter logic right after the navCategories array definition
c = c.replace(
  '  // Filter out categories and items based on admin status',
  filterLogic
);

fs.writeFileSync('src/components/LoanOfficerSidebar.tsx', c);
