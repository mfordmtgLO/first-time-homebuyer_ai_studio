const fs = require('fs');
let content = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

if (!content.includes('import { Upload, ')) {
    content = content.replace('import { Download,', 'import { Download, Upload,');
}

const funcTarget = `  const handleExportCsv = () => {`;
const funcReplacement = `  const csvFileInputRef = useRef<HTMLInputElement>(null);

  const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\\n').filter(line => line.trim());
      if (lines.length < 2) {
        triggerToast("CSV file is empty or invalid.");
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
      const nameIdx = headers.findIndex(h => h.includes('name'));
      const titleIdx = headers.findIndex(h => h === 'title');
      const nmlsIdx = headers.findIndex(h => h.includes('nmls'));
      const companyIdx = headers.findIndex(h => h.includes('company') || h.includes('business'));
      const branchIdx = headers.findIndex(h => h === 'branch');
      const cityIdx = headers.findIndex(h => h === 'city');
      const stateIdx = headers.findIndex(h => h === 'state');
      const emailIdx = headers.findIndex(h => h === 'email');
      const phoneIdx = headers.findIndex(h => h === 'phone');
      const yearsIdx = headers.findIndex(h => h.includes('year') || h.includes('experience'));
      const unitsIdx = headers.findIndex(h => h.includes('unit'));
      const volumeIdx = headers.findIndex(h => h.includes('volume'));
      const statusIdx = headers.findIndex(h => h.includes('status'));

      const newOfficers: LoanOfficerProfile[] = [];

      for (let i = 1; i < lines.length; i++) {
        // Regex to split by comma, ignoring commas inside quotes
        const row = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(col => col.trim().replace(/^"|"$/g, ''));
        if (row.length === 0 || (nameIdx !== -1 && !row[nameIdx])) continue;

        const name = nameIdx !== -1 ? row[nameIdx] : \`Imported LO \${i}\`;
        const company = companyIdx !== -1 ? row[companyIdx] : '';
        const yearsExperience = yearsIdx !== -1 ? parseInt(row[yearsIdx]) || 0 : undefined;

        newOfficers.push({
          id: \`lo-imported-csv-\${Date.now()}-\${i}\`,
          name,
          title: titleIdx !== -1 && row[titleIdx] ? row[titleIdx] : "Loan Officer",
          nmlsId: nmlsIdx !== -1 ? row[nmlsIdx] : "",
          company,
          branch: branchIdx !== -1 ? row[branchIdx] : "",
          city: cityIdx !== -1 ? row[cityIdx] : undefined,
          state: stateIdx !== -1 ? row[stateIdx] : undefined,
          email: emailIdx !== -1 ? row[emailIdx] : "",
          phone: phoneIdx !== -1 ? row[phoneIdx] : "",
          yearsExperience,
          production12MoUnits: unitsIdx !== -1 && row[unitsIdx] ? parseInt(row[unitsIdx]) : undefined,
          production12MoVolume: volumeIdx !== -1 && row[volumeIdx] ? parseInt(row[volumeIdx]) : undefined,
          recruitmentStatus: (statusIdx !== -1 && row[statusIdx] ? row[statusIdx] : 'New') as any,
          isTeamMember: true,
          outreachHistory: [],
          bio: "",
          headshotUrl: "",
          specialties: []
        });
      }

      if (newOfficers.length > 0) {
        setGuidesState(prev => ({
          ...prev,
          loanOfficers: [...prev.loanOfficers, ...newOfficers]
        }));
        triggerToast(\`✅ Successfully imported \${newOfficers.length} candidates from CSV!\`);
      } else {
        triggerToast("No valid candidates found in CSV.");
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const handleExportCsv = () => {`;
content = content.replace(funcTarget, funcReplacement);

const buttonTarget = `                  <Download className="w-4 h-4 text-[#4A5D4E]" />
                  <span>Export CSV</span>
                </button>`;
const buttonReplacement = `                  <Download className="w-4 h-4 text-[#4A5D4E]" />
                  <span>Export CSV</span>
                </button>
                <input 
                  type="file" 
                  accept=".csv" 
                  ref={csvFileInputRef} 
                  onChange={handleImportCsv} 
                  className="hidden" 
                />
                <button
                  onClick={() => csvFileInputRef.current?.click()}
                  className="px-5 py-2.5 bg-[#FAF9F5] text-[#2D362E] border border-[#EAE7E0] hover:bg-[#F1EFE9] text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-[#4A5D4E]" />
                  <span>Import CSV</span>
                </button>`;
content = content.replace(buttonTarget, buttonReplacement);

fs.writeFileSync('src/components/LoanOfficerPortal.tsx', content);
