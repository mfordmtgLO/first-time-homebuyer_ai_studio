const fs = require('fs');

let content = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

// Insert the handleExportCsv function inside the component, near the top
const funcTarget = `  const [showScrapeRealtorModal, setShowScrapeRealtorModal] = useState<boolean>(false);`;
const funcReplacement = `  const [showScrapeRealtorModal, setShowScrapeRealtorModal] = useState<boolean>(false);

  const handleExportCsv = () => {
    let losToExport = guidesState.loanOfficers;
    if (selectedRosterLoIds.size > 0) {
      losToExport = losToExport.filter(lo => selectedRosterLoIds.has(lo.id));
    }
    
    if (losToExport.length === 0) {
      triggerToast("No Loan Officers to export.");
      return;
    }

    const headers = [
      "Name", "Title", "NMLS ID", "Company", "Branch", "City", "State",
      "Email", "Phone", "Years Experience", "12Mo Units", "12Mo Volume", "Recruitment Status"
    ];

    const rows = losToExport.map(lo => [
      \`"\${(lo.name || '').replace(/"/g, '""')}"\`,
      \`"\${(lo.title || '').replace(/"/g, '""')}"\`,
      \`"\${(lo.nmlsId || '').replace(/"/g, '""')}"\`,
      \`"\${(lo.company || '').replace(/"/g, '""')}"\`,
      \`"\${(lo.branch || '').replace(/"/g, '""')}"\`,
      \`"\${(lo.city || '').replace(/"/g, '""')}"\`,
      \`"\${(lo.state || '').replace(/"/g, '""')}"\`,
      \`"\${(lo.email || '').replace(/"/g, '""')}"\`,
      \`"\${(lo.phone || '').replace(/"/g, '""')}"\`,
      \`"\${lo.yearsExperience || ''}"\`,
      \`"\${lo.production12MoUnits || ''}"\`,
      \`"\${lo.production12MoVolume || ''}"\`,
      \`"\${(lo.recruitmentStatus || '').replace(/"/g, '""')}"\`
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", \`lo_recruitment_list_\${new Date().toISOString().split('T')[0]}.csv\`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast(\`✅ Exported \${losToExport.length} Loan Officers to CSV\`);
  };`;
content = content.replace(funcTarget, funcReplacement);

// Insert the button
const buttonTarget = `<button
                  onClick={() => setShowAddLoModal(true)}
                  className="px-5 py-2.5 bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Manual LO</span>
                </button>`;
const buttonReplacement = `<button
                  onClick={() => setShowAddLoModal(true)}
                  className="px-5 py-2.5 bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Manual LO</span>
                </button>
                <button
                  onClick={handleExportCsv}
                  className="px-5 py-2.5 bg-[#FAF9F5] text-[#2D362E] border border-[#EAE7E0] hover:bg-[#F1EFE9] text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#4A5D4E]" />
                  <span>Export CSV</span>
                </button>`;
content = content.replace(buttonTarget, buttonReplacement);

// Import Download if needed
if (!content.includes('Download,')) {
    content = content.replace('import { ', 'import { Download, ');
}

fs.writeFileSync('src/components/LoanOfficerPortal.tsx', content);
