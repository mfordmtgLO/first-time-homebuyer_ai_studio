const fs = require('fs');
let content = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

const oldArray = `['New', 'Contacted', 'Scheduled Interview', 'Onboarding', 'Declined']`;
const newArray = `['Not Contacted', 'In Outreach', 'Interested', 'Meeting Scheduled', 'Declined']`;
content = content.replace(oldArray, newArray);

const filterOld = `(lo.recruitmentStatus || 'New') === status`;
const filterNew = `(lo.recruitmentStatus || 'Not Contacted') === status`;
content = content.replace(filterOld, filterNew);

fs.writeFileSync('src/components/LoanOfficerPortal.tsx', content);
