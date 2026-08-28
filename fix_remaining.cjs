const fs = require('fs');
let content = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

content = content.replace(
  "recruitmentStatus: (lo.recruitmentStatus === 'New' || !lo.recruitmentStatus) ? 'Contacted' : lo.recruitmentStatus,",
  "recruitmentStatus: (lo.recruitmentStatus === 'Not Contacted' || lo.recruitmentStatus === 'New' || !lo.recruitmentStatus) ? 'In Outreach' : lo.recruitmentStatus,"
);

content = content.replace(
  "recruitmentStatus: (lo.recruitmentStatus === 'New' || !lo.recruitmentStatus) ? 'Contacted' : lo.recruitmentStatus,",
  "recruitmentStatus: (lo.recruitmentStatus === 'Not Contacted' || lo.recruitmentStatus === 'New' || !lo.recruitmentStatus) ? 'In Outreach' : lo.recruitmentStatus,"
);

fs.writeFileSync('src/components/LoanOfficerPortal.tsx', content);
