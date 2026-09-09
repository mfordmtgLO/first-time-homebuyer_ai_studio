const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add Import
code = code.replace(
  'import { Step4AIScenarioSummary } from "./components/Step4AIScenarioSummary";',
  'import { Step4AIScenarioSummary } from "./components/Step4AIScenarioSummary";\nimport { AIPrequalWizard } from "./components/AIPrequalWizard";'
);

// 2. Add Tab rendering
const prequalTab = `
                    {activeTab === "ai_prequal" && (
                      <AIPrequalWizard
                        loanOfficer={guidesState.loanOfficer}
                        currentProfile={profile}
                        onUpdateProfile={(updates) => setProfile(prev => ({ ...prev, ...updates }))}
                        onComplete={() => setActiveTab("step4_ai_plan")}
                      />
                    )}
`;

code = code.replace(
  '                    {activeTab === "step4_ai_plan" && (',
  prequalTab + '\n                    {activeTab === "step4_ai_plan" && ('
);

fs.writeFileSync('src/App.tsx', code);
