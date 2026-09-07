const fs = require('fs');
let c = fs.readFileSync('src/components/MasterLeadJourneyTab.tsx', 'utf8');

const targetButtonStr = '<BellRing className="w-3.5 h-3.5" /> Trigger Cloud Function: Price Drop\n                            </button>';

const bpdButton = `                            </button>
                            <button
                                onClick={async () => {
                                    alert(\`Big Purple Dot API: Synchronizing \${lead.fullName} to CRM Pipeline...\\n\\nPayload:\\n{ "name": "\${lead.fullName}", "email": "\${lead.email}", "phone": "\${lead.phone}", "lo": "\${loanOfficer.name}", "tags": ["Geosphere"] }\\n\\nStatus: SUCCESS\`);
                                }}
                                className="w-full bg-[#5d3fd3] hover:bg-[#4b33a8] border border-[#5d3fd3] text-white py-1.5 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1 shadow-sm mt-1.5"
                            >
                                <Database className="w-3.5 h-3.5" /> Sync to Big Purple Dot
`;

if (c.includes(targetButtonStr) && !c.includes('Sync to Big Purple Dot')) {
    c = c.replace(targetButtonStr, bpdButton);
    // ensure Database icon is imported
    if (!c.includes('Database,')) {
        c = c.replace('import {', 'import {\\n  Database,');
    }
    fs.writeFileSync('src/components/MasterLeadJourneyTab.tsx', c);
    console.log("Patched BPD button");
} else {
    console.log("Not found or already patched");
}
