const fs = require('fs');
let code = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

if (!code.includes('RespaCostSharingHub')) {
  code = code.replace(
    'import { AdsRoiPerformanceTab } from "./AdsRoiPerformanceTab";',
    'import { AdsRoiPerformanceTab } from "./AdsRoiPerformanceTab";\nimport { RespaCostSharingHub } from "./RespaCostSharingHub";'
  );

  const tabRenderBlock = `
            {activeTab === "respa_cost_sharing" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out fill-mode-both">
                <RespaCostSharingHub
                  loanOfficer={currentLo}
                  activeAgent={activeAgent}
                  expenses={guidesState.respaExpenses || []}
                  onAddExpense={(exp) => {
                    const existing = guidesState.respaExpenses || [];
                    onUpdateGuidesState({
                      ...guidesState,
                      respaExpenses: [exp, ...existing]
                    });
                  }}
                  onDeleteExpense={(id) => {
                    const existing = guidesState.respaExpenses || [];
                    onUpdateGuidesState({
                      ...guidesState,
                      respaExpenses: existing.filter(e => e.id !== id)
                    });
                  }}
                />
              </div>
            )}
  `;

  code = code.replace(
    '{/* Tab 10: Growth & Production Metrics */}',
    tabRenderBlock + '\n            {/* Tab 10: Growth & Production Metrics */}'
  );

  fs.writeFileSync('src/components/LoanOfficerPortal.tsx', code);
  console.log("Patched LoanOfficerPortal with RespaCostSharingHub");
}
