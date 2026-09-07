const fs = require('fs');
let c = fs.readFileSync('src/components/TelemetryDiagnosticsModal.tsx', 'utf8');

c = c.replace(
  'const [activeTab, setActiveTab] = useState<"breadcrumbs" | "errors" | "sentry">("breadcrumbs");',
  'const [activeTab, setActiveTab] = useState<"breadcrumbs" | "errors" | "security" | "sentry">("breadcrumbs");'
);

c = c.replace(
  '<button\n              onClick={() => setActiveTab("sentry")}',
  `<button
              onClick={() => setActiveTab("security")}
              className={\`flex-1 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-2 \${
                activeTab === "security"
                  ? "border-[#D4A373] text-[#D4A373]"
                  : "border-transparent text-[#9A9488] hover:text-[#E8ECE6] hover:border-[#606C5D]"
              }\`}
            >
              <ShieldCheck className="w-4 h-4" />
              Compliance
            </button>
            <button
              onClick={() => setActiveTab("sentry")}`
);

// Add rendering logic for the security tab
const tabContentTarget = `{activeTab === "sentry" && (`;
const tabContentReplacement = `{activeTab === "security" && (
            <div className="space-y-4">
              <div className="bg-[#2D362E] border border-[#606C5D] p-4 rounded-xl flex items-start gap-4">
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

              {breadcrumbs.filter(b => b.category === "security").length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-[#606C5D] rounded-xl bg-[#2D362E]/50">
                  <ShieldCheck className="w-8 h-8 text-[#606C5D] mb-3" />
                  <p className="text-[#9A9488] text-sm font-medium">No compliance events captured yet</p>
                  <p className="text-[#9A9488]/70 text-xs mt-1">AI payloads and interactions will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
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
                </div>
              )}
            </div>
          )}

          {activeTab === "sentry" && (`

c = c.replace(tabContentTarget, tabContentReplacement);

fs.writeFileSync('src/components/TelemetryDiagnosticsModal.tsx', c);
