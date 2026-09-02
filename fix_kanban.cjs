const fs = require('fs');
let content = fs.readFileSync('src/components/RecruitmentPipeline.tsx', 'utf8');

const targetStr = `      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-6 items-start">
        {['Not Contacted', 'In Outreach', 'Interested', 'Meeting Scheduled', 'Declined'].map(status => {
          const columnLos = recruitmentLos.filter(lo => (lo.recruitmentStatus || 'Not Contacted') === status);
          
          return (
            <div key={status} className="w-[340px] shrink-0 bg-[#FAF9F5] rounded-3xl border border-[#EAE7E0] p-4 flex flex-col max-h-[75vh]">`;

const replacementStr = `      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-6 items-start dashboard-horizontal-scrollbar">
        {['Not Contacted', 'In Outreach', 'Interested', 'Meeting Scheduled', 'Declined'].map(status => {
          const columnLos = recruitmentLos.filter(lo => (lo.recruitmentStatus || 'Not Contacted') === status);
          
          return (
            <div key={status} className="w-[280px] lg:w-[240px] xl:w-[260px] 2xl:flex-1 2xl:min-w-[240px] max-w-[340px] shrink-0 bg-[#FAF9F5] rounded-3xl border border-[#EAE7E0] p-4 flex flex-col max-h-[75vh]">`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync('src/components/RecruitmentPipeline.tsx', content);
  console.log("Updated Kanban layout.");
} else {
  console.log("Kanban layout string not found.");
}
