const fs = require('fs');
let c = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

c = c.replace(
    '<MasterLeadJourneyTab\\n                  leads={guidesState.leads || []}\\n                  loanOfficer={currentLo}',
    '<MasterLeadJourneyTab\\n                  properties={properties}\\n                  setProperties={setProperties}\\n                  leads={guidesState.leads || []}\\n                  loanOfficer={currentLo}'
);

fs.writeFileSync('src/components/LoanOfficerPortal.tsx', c);
