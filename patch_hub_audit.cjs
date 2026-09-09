const fs = require('fs');
let code = fs.readFileSync('src/components/AdsCampaignHub.tsx', 'utf8');

// Add state for modal
const stateTarget = `const [activePlatformTab, setActivePlatformTab] = useState<"meta" | "google">("meta");`;
const stateReplacement = `const [activePlatformTab, setActivePlatformTab] = useState<"meta" | "google">("meta");
  const [viewAuditHistoryId, setViewAuditHistoryId] = useState<string | null>(null);`;
code = code.replace(stateTarget, stateReplacement);

// Add History button and Modal
const buttonTarget = `                        <button
                          onClick={() => onToggleCampaignState && onToggleCampaignState(camp.id, camp.status === "active" ? "paused" : "active")}
                          className={\`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors \${camp.status === "active" ? "bg-[#F1EFE9] text-[#2D362E] hover:bg-[#EAE7E0]" : "bg-[#4A5D4E] text-white hover:bg-[#38463B]"}\`}
                        >
                          {camp.status === "active" ? "Pause" : "Activate"}
                        </button>
                      )}`;

const buttonReplacement = `                        <button
                          onClick={() => onToggleCampaignState && onToggleCampaignState(camp.id, camp.status === "active" ? "paused" : "active")}
                          className={\`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors \${camp.status === "active" ? "bg-[#F1EFE9] text-[#2D362E] hover:bg-[#EAE7E0]" : "bg-[#4A5D4E] text-white hover:bg-[#38463B]"}\`}
                        >
                          {camp.status === "active" ? "Pause" : "Activate"}
                        </button>
                      )}
                      <button
                        onClick={() => setViewAuditHistoryId(camp.id)}
                        className="ml-2 px-2 py-1.5 rounded-lg text-[#606C5D] hover:bg-[#F1EFE9] transition-colors inline-flex items-center"
                        title="View Change History"
                      >
                        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      </button>`;
code = code.replace(buttonTarget, buttonReplacement);

const modalTarget = `    </div>
  );
};`;

const modalReplacement = `
      {/* Audit History Modal */}
      {viewAuditHistoryId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 border border-[#EAE7E0] shadow-2xl animate-in zoom-in-95 duration-150 text-[#2D362E]">
            <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-3">
              <h4 className="font-serif font-bold text-lg text-[#2D362E] flex items-center gap-2">
                <svg className="w-5 h-5 text-[#C18C5D]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                Campaign Change History
              </h4>
              <button
                onClick={() => setViewAuditHistoryId(null)}
                className="text-xs text-[#9A9488] hover:text-[#2D362E]"
              >
                ✕ Close
              </button>
            </div>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {(() => {
                const camp = adCampaignDrafts.find(c => c.id === viewAuditHistoryId);
                const logs = camp?.auditLog || [];
                
                if (logs.length === 0) {
                  return (
                    <div className="text-center text-sm text-[#606C5D] py-8">
                      No change history available for this campaign.
                    </div>
                  );
                }
                
                return logs.slice().reverse().map((log, index) => (
                  <div key={log.id} className="relative pl-6 pb-4 border-l-2 border-[#EAE7E0] last:border-transparent last:pb-0">
                    <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-[#C18C5D]" />
                    <div className="text-[10px] text-[#9A9488] font-mono mb-1">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                    <div className="text-xs font-bold text-[#2D362E] mb-0.5">
                      {log.actor}
                    </div>
                    <div className="text-xs text-[#606C5D]">
                      <span className="font-medium text-[#4A5D4E]">{log.action}</span>
                      {log.details && <span className="ml-1 opacity-75">— {log.details}</span>}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};`;
code = code.replace(modalTarget, modalReplacement);

fs.writeFileSync('src/components/AdsCampaignHub.tsx', code);
