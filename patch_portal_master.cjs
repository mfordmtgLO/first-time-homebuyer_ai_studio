const fs = require('fs');
let c = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

c = c.replace(
  'import { LoanOfficerSidebar, TabId } from "./LoanOfficerSidebar";',
  'import { LoanOfficerSidebar, TabId } from "./LoanOfficerSidebar";\nimport { MasterRoleManager } from "./MasterRoleManager";'
);

const renderLogicTarget = `{activeTab === "branch_admin_metrics" && (`;
const renderLogicReplacement = `{activeTab === "master_role_manager" && (
            <MasterRoleManager guidesState={guidesState} />
          )}

          {activeTab === "branch_admin_metrics" && (`

c = c.replace(renderLogicTarget, renderLogicReplacement);

fs.writeFileSync('src/components/LoanOfficerPortal.tsx', c);
