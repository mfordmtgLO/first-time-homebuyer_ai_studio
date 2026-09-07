const fs = require('fs');
let c = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

c = c.replace(
  'const [activeTab, setActiveTab] = useState<TabId>("leads");',
  `const [activeTab, setActiveTab] = useState<TabId>(userRole === "compliance_auditor" ? "compliance_audit" : "leads");`
);

c = c.replace(
  '<LoanOfficerSidebar',
  '<LoanOfficerSidebar\n        userRole={userRole as string}'
);

const renderLogicTarget = `{activeTab === "branch_admin_metrics" && (`;
const renderLogicReplacement = `{activeTab === "compliance_audit" && (
            <div className="bg-white dark:bg-[#1A211B] rounded-2xl shadow-sm border border-slate-200 dark:border-[#606C5D] p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-[#E8ECE6] flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-emerald-500" />
                    Zero-Trust Compliance Audit Trail
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-[#9A9488] mt-1">
                    Live system telemetry, PII redaction logs, and Vault encryption handoffs.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const evt = new CustomEvent('open-telemetry');
                    window.dispatchEvent(evt);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Open Interactive Telemetry Dashboard
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-[#2D362E] p-12 rounded-xl border border-slate-200 dark:border-[#606C5D] flex flex-col items-center justify-center text-center">
                 <ShieldCheck className="w-12 h-12 text-emerald-500 mb-4" />
                 <h3 className="text-lg font-bold text-slate-900 dark:text-[#E8ECE6]">Compliance Telemetry Active</h3>
                 <p className="text-slate-500 dark:text-[#9A9488] mt-2 max-w-md">
                   To view the interactive event timeline, calculate the live Security Risk Score, or export CSV forensic logs, please launch the dedicated Telemetry Dashboard using the button above.
                 </p>
              </div>
            </div>
          )}

          {activeTab === "branch_admin_metrics" && (`

c = c.replace(renderLogicTarget, renderLogicReplacement);

fs.writeFileSync('src/components/LoanOfficerPortal.tsx', c);
