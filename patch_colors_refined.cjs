const fs = require('fs');

function processFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix the borders
  content = content.replace(/border-t-\[\#EAE7E0\](?! dark:)/g, "border-t-[#EAE7E0] dark:border-t-slate-700");
  content = content.replace(/border-b-\[\#EAE7E0\](?! dark:)/g, "border-b-[#EAE7E0] dark:border-b-slate-700");
  content = content.replace(/border-r-\[\#EAE7E0\](?! dark:)/g, "border-r-[#EAE7E0] dark:border-r-slate-700");
  content = content.replace(/border-l-\[\#EAE7E0\](?! dark:)/g, "border-l-[#EAE7E0] dark:border-l-slate-700");

  content = content.replace(/bg-indigo-50 dark:bg-indigo-900\/300\/10/g, "bg-indigo-500/10 dark:bg-indigo-900/10");

  fs.writeFileSync(filePath, content);
  console.log('Refined', filePath);
}

processFile('src/components/PropertyTracker.tsx');
processFile('src/components/DashboardOverview.tsx');
