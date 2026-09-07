const fs = require('fs');
let c = fs.readFileSync('src/components/TelemetryDiagnosticsModal.tsx', 'utf8');

// 1. Add Download icon import
c = c.replace(
  'ShieldCheck,',
  'ShieldCheck,\n  Download,'
);

// 2. Add the export function before the return statement of the component
const exportFunction = `
  const exportSecurityLogToCSV = () => {
    const securityLogs = breadcrumbs.filter(b => b.category === "security").reverse();
    if (securityLogs.length === 0) return;

    const headers = ["Timestamp", "Level", "Message", "Event ID", "Payload Data"];
    const rows = securityLogs.map(b => {
      const dataStr = b.data ? JSON.stringify(b.data).replace(/"/g, '""') : "";
      return [
        new Date(b.timestamp).toISOString(),
        b.level,
        \`"\${b.message.replace(/"/g, '""')}"\`,
        b.id,
        \`"\${dataStr}"\`
      ];
    });

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", \`compliance_audit_trail_\${new Date().toISOString().split('T')[0]}.csv\`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;
`;
c = c.replace('if (!isOpen) return null;', exportFunction);

// 3. Add the button to the UI
const targetHeader = `<div className="bg-[#2D362E] border border-[#606C5D] p-4 rounded-xl flex items-start gap-4">
                <div className="bg-[#4A5D4E]/30 p-3 rounded-full text-[#D4A373]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-[#E8ECE6] font-bold text-sm">Zero Trust Audit Trail</h4>
                  <p className="text-xs text-[#9A9488] mt-1 leading-relaxed">
                    Live log of AI payload sanitization, PII blocking events, and secure CRM
                    handoffs.
                  </p>
                </div>
              </div>`;

const newHeader = `<div className="bg-[#2D362E] border border-[#606C5D] p-4 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="bg-[#4A5D4E]/30 p-3 rounded-full text-[#D4A373]">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-[#E8ECE6] font-bold text-sm">Zero Trust Audit Trail</h4>
                    <p className="text-xs text-[#9A9488] mt-1 leading-relaxed">
                      Live log of AI payload sanitization, PII blocking events, and secure CRM handoffs.
                    </p>
                  </div>
                </div>
                {breadcrumbs.filter(b => b.category === "security").length > 0 && (
                  <button
                    onClick={exportSecurityLogToCSV}
                    className="flex items-center gap-2 px-3 py-2 bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-semibold rounded-lg transition-colors border border-[#606C5D] whitespace-nowrap"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                )}
              </div>`;

c = c.replace(targetHeader, newHeader);

fs.writeFileSync('src/components/TelemetryDiagnosticsModal.tsx', c);
