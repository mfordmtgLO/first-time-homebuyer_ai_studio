const fs = require('fs');
let c = fs.readFileSync('src/components/TelemetryDiagnosticsModal.tsx', 'utf8');

// 1. Add expandedEventId state
c = c.replace(
  'const [sentrySaved, setSentrySaved] = useState(false);',
  'const [sentrySaved, setSentrySaved] = useState(false);\n  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);'
);

// 2. Replace the old security tab rendering with the new interactive timeline
const securityTabRegex = /{breadcrumbs\.filter\(b => b\.category === "security"\)\.length === 0 \? \([\s\S]*?\} \/\* end security map \*\/ \)?\s*\}\s*<\/div>\s*\)\}\s*<\/div>\s*\)\}/;

const oldSecurityTabTarget = `<div className="space-y-3">
                  {breadcrumbs
                    .filter(b => b.category === "security")
                    .reverse()
                    .map((b) => (
                      <div key={b.id} className="bg-[#2D362E] border border-[#606C5D] p-3 rounded-lg flex items-start gap-3">
                        <div className="text-emerald-400 mt-0.5">
                          <Check className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-semibold text-[#E8ECE6] break-words">{b.message}</span>
                            <span className="text-[10px] text-[#9A9488] shrink-0 ml-2 whitespace-nowrap">
                              {new Date(b.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}
                            </span>
                          </div>
                          {b.data && (
                            <pre className="mt-2 bg-[#1A211B] p-2 rounded text-[10px] text-[#9A9488] overflow-x-auto border border-[#4A5D4E]/50">
                              {JSON.stringify(b.data, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                  ))}
                </div>`;

const newSecurityTab = `<div className="relative border-l-2 border-[#4A5D4E]/40 ml-4 mt-6 space-y-8 pb-4">
                  {breadcrumbs
                    .filter(b => b.category === "security")
                    .reverse()
                    .map((b) => {
                      const isError = b.level === "error";
                      const isWarning = b.level === "warning";
                      const Icon = isError ? AlertTriangle : isWarning ? ShieldCheck : Check;
                      const dotColor = isError ? "bg-rose-500" : isWarning ? "bg-[#D4A373]" : "bg-emerald-500";
                      const isExpanded = expandedEventId === b.id;

                      return (
                      <div key={b.id} className="relative pl-6 sm:pl-8">
                        <div className={\`absolute -left-[11px] top-1.5 w-5 h-5 rounded-full flex items-center justify-center border-[3px] border-[#1A211B] \${dotColor}\`}>
                           <Icon className="w-2.5 h-2.5 text-[#1A211B]" />
                        </div>
                        
                        <div 
                          className={\`bg-[#2D362E] border \${isError ? 'border-rose-500/40' : 'border-[#606C5D]'} p-4 rounded-xl shadow-lg transition-all cursor-pointer hover:border-[#9A9488] group\`}
                          onClick={() => setExpandedEventId(isExpanded ? null : b.id)}
                        >
                          <div className="flex justify-between items-start mb-1.5">
                            <div>
                                <span className={\`text-[10px] uppercase tracking-wider font-bold \${isError ? 'text-rose-400' : 'text-emerald-400'}\`}>
                                  {isError ? 'Blocked / Alert' : 'Sanitized / Verified'}
                                </span>
                                <h4 className="text-sm font-semibold text-[#E8ECE6] mt-0.5">{b.message}</h4>
                            </div>
                            <span className="text-xs text-[#9A9488] font-mono bg-[#1A211B] px-2 py-1 rounded shrink-0 ml-2">
                              {new Date(b.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}
                            </span>
                          </div>
                          
                          <div className="mt-3 flex items-center justify-between text-xs text-[#9A9488]">
                            <div className="flex items-center gap-2">
                              <span>Status: <strong className={isError ? 'text-rose-300' : 'text-emerald-300'}>{isError ? 'Intervention Executed' : 'Secure Payload Handoff'}</strong></span>
                            </div>
                            <span className="group-hover:text-[#D4A373] transition-colors">{isExpanded ? 'Hide Payload' : 'View Payload Details'}</span>
                          </div>

                          {isExpanded && b.data && (
                            <div className="mt-4 pt-4 border-t border-[#606C5D]/50">
                              <pre className="bg-[#1A211B] p-3 rounded-lg text-[11px] font-mono text-[#9A9488] overflow-x-auto border border-[#4A5D4E]/30">
                                {JSON.stringify(b.data, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    )})}
                </div>`;

c = c.replace(oldSecurityTabTarget, newSecurityTab);

fs.writeFileSync('src/components/TelemetryDiagnosticsModal.tsx', c);
