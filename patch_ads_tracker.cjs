const fs = require('fs');
let code = fs.readFileSync('src/components/AdsCampaignHub.tsx', 'utf8');

// Add to props
code = code.replace(
  "  pairingUrl: string;",
  "  pairingUrl: string;\n  onToggleCampaignState?: (id: string, newStatus: string) => void;"
);

// Add to destructuring
code = code.replace(
  "  pairingUrl",
  "  pairingUrl,\n  onToggleCampaignState"
);

// Append the Tracker UI
const trackerHtml = `
      {/* Active Campaigns Tracker UI */}
      {adCampaignDrafts && adCampaignDrafts.length > 0 && (
        <div className="mt-8 bg-white border border-[#EAE7E0] rounded-3xl p-6 shadow-sm">
          <h3 className="font-serif font-bold text-lg text-[#2D362E] flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-[#4A5D4E]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Active & Pending Campaign Tracker
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EAE7E0]">
                  <th className="pb-3 text-[10px] uppercase font-bold text-[#9A9488]">Campaign Name</th>
                  <th className="pb-3 text-[10px] uppercase font-bold text-[#9A9488]">Platform</th>
                  <th className="pb-3 text-[10px] uppercase font-bold text-[#9A9488]">Geo Targets</th>
                  <th className="pb-3 text-[10px] uppercase font-bold text-[#9A9488]">Budget</th>
                  <th className="pb-3 text-[10px] uppercase font-bold text-[#9A9488]">Status</th>
                  <th className="pb-3 text-[10px] uppercase font-bold text-[#9A9488]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE7E0]">
                {adCampaignDrafts.map((camp) => (
                  <tr key={camp.id} className="hover:bg-[#F9F8F4] transition-colors">
                    <td className="py-4 pr-4">
                      <div className="font-bold text-xs text-[#2D362E]">{camp.campaignName}</div>
                    </td>
                    <td className="py-4 pr-4">
                      <span className={\`text-[10px] font-bold px-2 py-0.5 rounded-full \${camp.platform === "meta" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"}\`}>
                        {camp.platform === "meta" ? "Meta" : "Google"}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="text-[10px] text-[#606C5D] max-w-[150px] truncate" title={camp.targetLocations?.join(", ")}>
                        {camp.targetLocations?.join(", ") || "Oregon"}
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="text-xs font-semibold text-[#4A5D4E]">\${camp.dailyBudget}/day</div>
                    </td>
                    <td className="py-4 pr-4">
                      {camp.isCompliancePaused ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 inline-flex items-center gap-1">
                          Admin Paused
                        </span>
                      ) : (
                        <span className={\`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 border \${camp.status === "active" ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-yellow-100 text-yellow-800 border-yellow-200"}\`}>
                          {camp.status === "active" ? (
                            <><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Running</>
                          ) : (
                            <><span className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Pending</>
                          )}
                        </span>
                      )}
                    </td>
                    <td className="py-4 pr-4">
                      {!camp.isCompliancePaused && (
                        <button
                          onClick={() => onToggleCampaignState && onToggleCampaignState(camp.id, camp.status === "active" ? "paused" : "active")}
                          className={\`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors \${camp.status === "active" ? "bg-[#F1EFE9] text-[#2D362E] hover:bg-[#EAE7E0]" : "bg-[#4A5D4E] text-white hover:bg-[#38463B]"}\`}
                        >
                          {camp.status === "active" ? "Pause" : "Activate"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
`;

code = code.replace("    </div>\n  );\n};", trackerHtml);

fs.writeFileSync('src/components/AdsCampaignHub.tsx', code);
