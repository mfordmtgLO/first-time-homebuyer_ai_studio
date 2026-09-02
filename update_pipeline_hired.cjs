const fs = require('fs');
let content = fs.readFileSync('src/components/RecruitmentPipeline.tsx', 'utf8');

const targetStr = `l.id === lo.id ? { ...l, isTeamMember: true, teamStarStatus: 'red' as const } : l`;
const replacementStr = `l.id === lo.id ? { ...l, isTeamMember: false, recruitmentStatus: 'Hired' as any, teamStarStatus: 'red' as const } : l`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync('src/components/RecruitmentPipeline.tsx', content);
  console.log("Pipeline updated for Hired logic.");
} else {
  console.log("Could not find target string in Pipeline.");
}
