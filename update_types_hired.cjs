const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');

const targetStr = `recruitmentStatus?: 'Not Contacted' | 'In Outreach' | 'Interested' | 'Meeting Scheduled' | 'Declined';`;
const replacementStr = `recruitmentStatus?: 'Not Contacted' | 'In Outreach' | 'Interested' | 'Meeting Scheduled' | 'Declined' | 'Hired';`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync('src/types.ts', content);
  console.log("Types updated for Hired logic.");
} else {
  console.log("Could not find target string in Types.");
}
