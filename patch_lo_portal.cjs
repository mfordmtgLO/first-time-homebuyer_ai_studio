const fs = require('fs');
let code = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

// Inject the import
code = code.replace(
  'import { GrowthDashboard } from "./GrowthDashboard";',
  'import { GrowthDashboard } from "./GrowthDashboard";\nimport { BranchManagement } from "./BranchManagement";'
);

// Add to TabId type
code = code.replace(
  '| "system_pitch_deck"',
  '| "system_pitch_deck"\n  | "branch_management"'
);

// Add the menu item in the Sidebar
// Let's find "branch_admin_metrics" and put it near there
const metricsTabMatch = `              onClick={() => setActiveTab("branch_admin_metrics")}`;
code = code.replace(
  metricsTabMatch,
  `              onClick={() => setActiveTab("branch_management")}
              className={\`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 \${
                activeTab === "branch_management"
                  ? "bg-[#606C5D] text-white shadow-md shadow-[#4A5D4E]/20"
                  : "text-[#9A9488] hover:bg-[#F8F7F4] hover:text-[#2D362E]"
              }\`}
            >
              <div className="flex items-center gap-3">
                <Building className="w-4 h-4" />
                <span className="font-semibold text-sm tracking-wide">Branch Whitelist Mgmt</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("branch_admin_metrics")}`
);

// Render the component
const metricsRenderMatch = '{activeTab === "branch_admin_metrics" && (';
code = code.replace(
  metricsRenderMatch,
  `{activeTab === "branch_management" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out fill-mode-both">
            <BranchManagement />
          </div>
        )}

        {activeTab === "branch_admin_metrics" && (`
);

fs.writeFileSync('src/components/LoanOfficerPortal.tsx', code);
