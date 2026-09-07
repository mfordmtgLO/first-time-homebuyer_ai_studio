const fs = require('fs');
let c = fs.readFileSync('src/components/TelemetryDiagnosticsModal.tsx', 'utf8');

// 1. Add download success state
c = c.replace(
  'const [expandedEventId, setExpandedEventId] = useState<string | null>(null);',
  'const [expandedEventId, setExpandedEventId] = useState<string | null>(null);\n  const [isExporting, setIsExporting] = useState(false);'
);

// 2. Refine the export function with success state and telemetry logging
const oldExportFunction = `  const exportSecurityLogToCSV = () => {
    const securityLogs = breadcrumbs.filter((b) => b.category === "security").reverse();
    if (securityLogs.length === 0) return;

    const headers = ["Timestamp", "Level", "Message", "Event ID", "Payload Data"];
    const rows = securityLogs.map((b) => {
      const dataStr = b.data ? JSON.stringify(b.data).replace(/"/g, '""') : "";
      return [
        new Date(b.timestamp).toISOString(),
        b.level,
        \`"\${b.message.replace(/"/g, '""')}"\`,
        b.id,
        \`"\${dataStr}"\`,
      ];
    });

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      \`compliance_audit_trail_\${new Date().toISOString().split("T")[0]}.csv\`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };`;

const newExportFunction = `  const exportSecurityLogToCSV = () => {
    const securityLogs = breadcrumbs.filter((b) => b.category === "security").reverse();
    if (securityLogs.length === 0) return;

    setIsExporting(true);

    const headers = ["Timestamp", "Level", "Message", "Event ID", "Payload Data"];
    const rows = securityLogs.map((b) => {
      const dataStr = b.data ? JSON.stringify(b.data).replace(/"/g, '""') : "";
      return [
        new Date(b.timestamp).toISOString(),
        b.level,
        \`"\${b.message.replace(/"/g, '""')}"\`,
        b.id,
        \`"\${dataStr}"\`,
      ];
    });

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      \`compliance_audit_trail_\${new Date().toISOString().split("T")[0]}.csv\`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Log the extraction event to the audit trail itself
    telemetry.addBreadcrumb({
      category: "security",
      message: "Compliance Record Extracted (CSV)",
      level: "warning",
      data: { exportedRecords: securityLogs.length, format: "csv", trigger: "manual_audit_export" }
    });

    // Reset button visual state after 2 seconds
    setTimeout(() => {
      setIsExporting(false);
    }, 2000);
  };`;

c = c.replace(oldExportFunction, newExportFunction);

// 3. Update the button UI to show the dynamic state
const oldButton = `<button
                    onClick={exportSecurityLogToCSV}
                    className="flex items-center gap-2 px-3 py-2 bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-semibold rounded-lg transition-colors border border-[#606C5D] whitespace-nowrap"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>`;

const newButton = `<button
                    onClick={exportSecurityLogToCSV}
                    disabled={isExporting}
                    className={\`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all border whitespace-nowrap \${
                      isExporting 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' 
                        : 'bg-[#4A5D4E] hover:bg-[#38463B] text-white border-[#606C5D]'
                    }\`}
                  >
                    {isExporting ? (
                      <>
                        <Check className="w-4 h-4" />
                        Download Complete
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Export CSV
                      </>
                    )}
                  </button>`;

c = c.replace(oldButton, newButton);

fs.writeFileSync('src/components/TelemetryDiagnosticsModal.tsx', c);
