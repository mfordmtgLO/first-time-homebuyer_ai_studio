const fs = require('fs');

function processDashboard() {
  const filePath = 'src/components/DashboardOverview.tsx';
  let content = fs.readFileSync(filePath, 'utf8');

  // We look for property.status === "offered" and the blocks below it
  const oldCode = `property.status === "offered" 
                        ? "bg-[#C18C5D]/10 text-[#C18C5D] dark:text-amber-400 border border-[#C18C5D]/20" 
                        : property.status === "touring"
                        ? "bg-[#4A5D4E]/10 text-[#4A5D4E] dark:text-emerald-400 border border-[#4A5D4E]/20"
                        : "bg-[#F1EFE9] dark:bg-slate-700/50 text-[#606C5D] dark:text-slate-300 border border-[#EAE7E0] dark:border-slate-700"`;

  // Actually the color replacer might have already modified it.
  // Let's just do a regex replace to be safe.
  content = content.replace(/property\.status === "offered"[\s\S]*?\: "bg-\[#F1EFE9\][^"]*"/, `property.status === "offered" 
                        ? "bg-[#C18C5D]/10 dark:bg-amber-500/20 text-[#C18C5D] dark:text-amber-400 border border-[#C18C5D]/20 dark:border-amber-500/30" 
                        : property.status === "touring"
                        ? "bg-[#4A5D4E]/10 dark:bg-emerald-500/20 text-[#4A5D4E] dark:text-emerald-400 border border-[#4A5D4E]/20 dark:border-emerald-500/30"
                        : "bg-[#F1EFE9] dark:bg-slate-700/50 text-[#606C5D] dark:text-slate-300 border border-[#EAE7E0] dark:border-slate-700"`);

  fs.writeFileSync(filePath, content);
  console.log('Patched badges in DashboardOverview');
}

function processCard() {
  const filePath = 'src/components/PropertyCard.tsx';
  let content = fs.readFileSync(filePath, 'utf8');

  // the original block in PropertyCard:
  content = content.replace(/property\.status === "offered"[\s\S]*?\: "bg-white[^"]*"/, `property.status === "offered"
                  ? "bg-[#C18C5D] dark:bg-amber-600 text-white"
                  : property.status === "touring"
                  ? "bg-[#4A5D4E] dark:bg-emerald-600 text-white"
                  : "bg-white dark:bg-slate-800 text-[#2D362E] dark:text-slate-100"`);

  fs.writeFileSync(filePath, content);
  console.log('Patched badges in PropertyCard');
}

processDashboard();
processCard();
