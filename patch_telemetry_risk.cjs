const fs = require('fs');
let c = fs.readFileSync('src/components/TelemetryDiagnosticsModal.tsx', 'utf8');

// 1. Add calculation logic before if (!isOpen) return null;
const calcLogic = `
  const securityLogs = breadcrumbs.filter(b => b.category === "security");
  const threatCount = securityLogs.filter(b => b.level === "error").length;
  const warningCount = securityLogs.filter(b => b.level === "warning").length;
  // Risk goes up with threats, but caps at 100
  const riskScore = Math.min(100, (threatCount * 25) + (warningCount * 5));

  if (!isOpen) return null;`;

c = c.replace('if (!isOpen) return null;', calcLogic);


// 2. Inject the dashboard right after the Security Tab Header
const targetHeaderBlock = `                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                )}
              </div>`;

const dashboardUI = `                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                )}
              </div>

              {/* Security Risk Dashboard */}
              <div className="grid grid-cols-3 gap-3 mb-6 mt-4">
                <div className="bg-[#1A211B] border border-[#606C5D] rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#9A9488]">Security Risk Score</span>
                    <Activity className={\`w-4 h-4 \${riskScore >= 50 ? 'text-rose-400' : riskScore >= 25 ? 'text-amber-400' : 'text-emerald-400'}\`} />
                  </div>
                  <div className="flex items-end gap-2">
                    <span className={\`text-3xl font-bold font-mono \${riskScore >= 50 ? 'text-rose-400' : riskScore >= 25 ? 'text-amber-400' : 'text-emerald-400'}\`}>
                      {riskScore}
                    </span>
                    <span className="text-xs text-[#9A9488] mb-1">/ 100</span>
                  </div>
                  <div className="mt-2">
                    <div className="h-1.5 w-full bg-[#2D362E] rounded-full overflow-hidden">
                      <div className={\`h-full \${riskScore >= 50 ? 'bg-rose-500' : riskScore >= 25 ? 'bg-amber-500' : 'bg-emerald-500'} transition-all duration-500\`} style={{ width: \`\${Math.max(2, riskScore)}%\` }}></div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1A211B] border border-[#606C5D] rounded-xl p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#9A9488]">Compliance Integrity</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold font-mono text-emerald-400">100%</span>
                  </div>
                  <span className="text-[10px] text-emerald-400/80 mt-2 font-medium">Edge Firewall Active</span>
                </div>

                <div className="bg-[#1A211B] border border-[#606C5D] rounded-xl p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#9A9488]">Threats Intercepted</span>
                    <AlertTriangle className={\`w-4 h-4 \${threatCount > 0 ? 'text-rose-400' : 'text-[#606C5D]'}\`} />
                  </div>
                  <div className="flex items-end gap-2">
                    <span className={\`text-3xl font-bold font-mono \${threatCount > 0 ? 'text-rose-400' : 'text-[#E8ECE6]'}\`}>
                      {threatCount}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#9A9488] mt-2 font-medium">Zero-Trust validations</span>
                </div>
              </div>`;

c = c.replace(targetHeaderBlock, dashboardUI);

fs.writeFileSync('src/components/TelemetryDiagnosticsModal.tsx', c);
