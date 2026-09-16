const fs = require('fs');
let code = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

if (!code.includes('import { AdsRoiPerformanceTab }')) {
  code = code.replace(
    'import { AdQueueManager } from "./AdQueueManager";',
    'import { AdQueueManager } from "./AdQueueManager";\nimport { AdsRoiPerformanceTab } from "./AdsRoiPerformanceTab";'
  );
  if (!code.includes('import { AdsRoiPerformanceTab }')) {
    // try another one
    code = code.replace(
      'import { GrowthDashboard }',
      'import { GrowthDashboard }\nimport { AdsRoiPerformanceTab } from "./AdsRoiPerformanceTab";'
    );
  }
}

// Add the tab render block
const renderBlock = `
            {activeTab === "ads_roi_performance" && currentLo.role !== 'processor' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out fill-mode-both">
                <AdsRoiPerformanceTab 
                  leads={guidesState.leads || []}
                  adCampaignDrafts={guidesState.adCampaignDrafts || []}
                />
              </div>
            )}
`;

if (!code.includes('activeTab === "ads_roi_performance"')) {
  code = code.replace(
    '{/* Tab 10: Growth & Production Metrics */}',
    renderBlock + '\n            {/* Tab 10: Growth & Production Metrics */}'
  );
  fs.writeFileSync('src/components/LoanOfficerPortal.tsx', code);
  console.log("Patched LoanOfficerPortal with AdsRoiPerformanceTab.");
}
