const fs = require('fs');

const colorMap = {
  // Backgrounds
  "bg-white": "bg-white dark:bg-slate-900",
  "bg-\\\\[#FAF9F5\\\\]": "bg-[#FAF9F5] dark:bg-slate-800",
  "bg-\\\\[#F9F8F4\\\\]": "bg-[#F9F8F4] dark:bg-slate-800",
  "bg-\\\\[#F1EFE9\\\\]": "bg-[#F1EFE9] dark:bg-slate-700/50",
  "bg-\\\\[#EAE7E0\\\\]": "bg-[#EAE7E0] dark:bg-slate-700",
  "bg-\\\\[#F5F2EA\\\\]": "bg-[#F5F2EA] dark:bg-slate-800/80",
  "bg-\\\\[#4A5D4E\\\\]": "bg-[#4A5D4E] dark:bg-emerald-600",
  "hover:bg-\\\\[#38463B\\\\]": "hover:bg-[#38463B] dark:hover:bg-emerald-700",
  "bg-\\\\[#C18C5D\\\\]": "bg-[#C18C5D] dark:bg-amber-600",
  "hover:bg-\\\\[#C18C5D\\\\]": "hover:bg-[#C18C5D] dark:hover:bg-amber-500",
  "bg-\\\\[#ECFDF5\\\\]": "bg-[#ECFDF5] dark:bg-emerald-900/40",
  "bg-indigo-50": "bg-indigo-50 dark:bg-indigo-900/30",
  "bg-indigo-100": "bg-indigo-100 dark:bg-indigo-900/50",
  "bg-red-50": "bg-red-50 dark:bg-red-900/30",
  "bg-red-100": "bg-red-100 dark:bg-red-900/50",
  "bg-emerald-50": "bg-emerald-50 dark:bg-emerald-900/30",
  "bg-blue-50": "bg-blue-50 dark:bg-blue-900/30",
  "bg-blue-100": "bg-blue-100 dark:bg-blue-900/50",
  "bg-amber-50": "bg-amber-50 dark:bg-amber-900/30",
  "bg-amber-100": "bg-amber-100 dark:bg-amber-900/50",
  "bg-stone-50": "bg-stone-50 dark:bg-stone-900/30",
  "bg-slate-100": "bg-slate-100 dark:bg-slate-800",
  "bg-slate-200": "bg-slate-200 dark:bg-slate-700",

  // Text
  "text-\\\\[#2D362E\\\\]": "text-[#2D362E] dark:text-slate-100",
  "text-\\\\[#606C5D\\\\]": "text-[#606C5D] dark:text-slate-300",
  "text-\\\\[#9A9488\\\\]": "text-[#9A9488] dark:text-slate-400",
  "text-\\\\[#4A5D4E\\\\]": "text-[#4A5D4E] dark:text-emerald-400",
  "text-\\\\[#C18C5D\\\\]": "text-[#C18C5D] dark:text-amber-400",
  "text-\\\\[#DEDAD2\\\\]": "text-[#DEDAD2] dark:text-slate-500",
  "text-\\\\[#D4A373\\\\]": "text-[#D4A373] dark:text-amber-300",
  "text-indigo-900": "text-indigo-900 dark:text-indigo-300",
  "text-indigo-800": "text-indigo-800 dark:text-indigo-300",
  "text-indigo-700": "text-indigo-700 dark:text-indigo-400",
  "text-indigo-600": "text-indigo-600 dark:text-indigo-400",
  "text-indigo-500": "text-indigo-500 dark:text-indigo-400",
  "text-red-900": "text-red-900 dark:text-red-300",
  "text-red-800": "text-red-800 dark:text-red-300",
  "text-red-600": "text-red-600 dark:text-red-400",
  "text-red-500": "text-red-500 dark:text-red-400",
  "text-emerald-700": "text-emerald-700 dark:text-emerald-400",
  "text-emerald-600": "text-emerald-600 dark:text-emerald-400",
  "text-emerald-500": "text-emerald-500 dark:text-emerald-400",
  "text-blue-700": "text-blue-700 dark:text-blue-400",
  "text-amber-900": "text-amber-900 dark:text-amber-300",
  "text-amber-800": "text-amber-800 dark:text-amber-300",
  "text-stone-900": "text-stone-900 dark:text-stone-300",

  // Borders
  "border-\\\\[#EAE7E0\\\\]": "border-[#EAE7E0] dark:border-slate-700",
  "border-\\\\[#4A5D4E\\\\]": "border-[#4A5D4E] dark:border-emerald-600/30",
  "border-\\\\[#C18C5D\\\\]": "border-[#C18C5D] dark:border-amber-600",
  "border-\\\\[#DEDAD2\\\\]": "border-[#DEDAD2] dark:border-slate-600",
  "border-indigo-100": "border-indigo-100 dark:border-indigo-900/50",
  "border-red-200": "border-red-200 dark:border-red-900/50",
};

function processFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix the specific borders
  content = content.replace(/border-t-\[\#EAE7E0\](?! dark:)/g, "border-t-[#EAE7E0] dark:border-t-slate-700");
  content = content.replace(/border-b-\[\#EAE7E0\](?! dark:)/g, "border-b-[#EAE7E0] dark:border-b-slate-700");
  content = content.replace(/border-r-\[\#EAE7E0\](?! dark:)/g, "border-r-[#EAE7E0] dark:border-r-slate-700");
  content = content.replace(/border-l-\[\#EAE7E0\](?! dark:)/g, "border-l-[#EAE7E0] dark:border-l-slate-700");
  
  content = content.replace(/border-b-\[\#DEDAD2\](?! dark:)/g, "border-b-[#DEDAD2] dark:border-b-slate-600");
  content = content.replace(/border-t-\[\#DEDAD2\](?! dark:)/g, "border-t-[#DEDAD2] dark:border-t-slate-600");

  content = content.replace(/bg-indigo-50 dark:bg-indigo-900\/300\/10/g, "bg-indigo-500/10 dark:bg-indigo-900/10");

  for (const [key, val] of Object.entries(colorMap)) {
    const re = new RegExp(`(?<!-)${key}(?! dark:)`, 'g');
    content = content.replace(re, val);
  }
  
  fs.writeFileSync(filePath, content);
  console.log('Patched all in', filePath);
}

processFile('src/components/PropertyTracker.tsx');
processFile('src/components/DashboardOverview.tsx');
processFile('src/components/PropertyCard.tsx');
