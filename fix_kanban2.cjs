const fs = require('fs');
let content = fs.readFileSync('src/components/RecruitmentPipeline.tsx', 'utf8');

const targetStr = `            <div key={status} className="w-[280px] lg:w-[240px] xl:w-[260px] 2xl:flex-1 2xl:min-w-[240px] max-w-[340px] shrink-0 bg-[#FAF9F5] rounded-3xl border border-[#EAE7E0] p-4 flex flex-col max-h-[75vh]">`;
const replacementStr = `            <div key={status} className="flex-1 min-w-[240px] max-w-[340px] shrink-0 bg-[#FAF9F5] rounded-3xl border border-[#EAE7E0] p-4 flex flex-col max-h-[75vh]">`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync('src/components/RecruitmentPipeline.tsx', content);
  console.log("Updated Kanban layout 2.");
} else {
  console.log("Kanban layout string not found 2.");
}
