const fs = require('fs');
let content = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

if (!content.includes('import { RecruitmentPipeline }')) {
  content = content.replace(
    /import \{ GrowthDashboard \} from "\.\/GrowthDashboard";/,
    `import { GrowthDashboard } from "./GrowthDashboard";\nimport { RecruitmentPipeline } from "./RecruitmentPipeline";`
  );
}

// Replace the inline recruitment pipeline section
const startStr = `{activeTab === "recruitment_pipeline" && (`;
const endStr = `        )}

        {activeTab === "pairings" && (`;

if (content.includes(startStr) && content.includes(endStr)) {
  const before = content.substring(0, content.indexOf(startStr));
  const after = content.substring(content.indexOf(endStr));
  
  content = before + `{activeTab === "recruitment_pipeline" && (
          <RecruitmentPipeline 
            guidesState={guidesState} 
            onUpdateGuidesState={onUpdateGuidesState} 
            onTriggerToast={onTriggerToast} 
          />\n` + after;
          
  fs.writeFileSync('src/components/LoanOfficerPortal.tsx', content);
  console.log("Portal updated.");
} else {
  console.log("Could not find start or end strings.");
}

