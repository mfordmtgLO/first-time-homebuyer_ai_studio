const fs = require('fs');
let content = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

if (!content.includes('import { OutreachHistoryBadge }')) {
  content = content.replace(
    'import { LoanOfficerScenarioWorkbench } from "./LoanOfficerScenarioWorkbench";',
    'import { LoanOfficerScenarioWorkbench } from "./LoanOfficerScenarioWorkbench";\nimport { OutreachHistoryBadge } from "./OutreachHistoryBadge";'
  );
}

// Add badge next to lead name in CRM table
const tableReplacement = `<div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="font-bold text-sm text-[#2D362E]">{lead.fullName}</span>
                                          <OutreachHistoryBadge logs={lead.outreachLogs} />`;
                                          
content = content.replace(/<div className="flex items-center gap-1\.5 flex-wrap">\s*<span className="font-bold text-sm text-\[#2D362E\]">\{lead\.fullName\}<\/span>/, tableReplacement);

fs.writeFileSync('src/components/LoanOfficerPortal.tsx', content);
console.log("Updated LoanOfficerPortal");
