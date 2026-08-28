const fs = require('fs');
let content = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

const target = `      if (newOfficers.length > 0) {
        onUpdateGuidesState({\\n          ...guidesState,
          
          loanOfficers: [...prev.loanOfficers, ...newOfficers]
        }));`;

const fixedTarget = "onUpdateGuidesState({\\n          ...guidesState,";
content = content.replace(fixedTarget, "onUpdateGuidesState({ ...guidesState,");
content = content.replace("loanOfficers: [...prev.loanOfficers, ...newOfficers]", "loanOfficers: [...guidesState.loanOfficers, ...newOfficers]");
content = content.replace("}));", "});");

fs.writeFileSync('src/components/LoanOfficerPortal.tsx', content);
