const fs = require('fs');
let code = fs.readFileSync('src/components/AdsCampaignHub.tsx', 'utf8');

const stateTarget = `const [viewAuditHistoryId, setViewAuditHistoryId] = useState<string | null>(null);`;
const stateReplacement = `const [viewAuditHistoryId, setViewAuditHistoryId] = useState<string | null>(null);
  const [targetLeadCap, setTargetLeadCap] = useState<number | "">("");`;
code = code.replace(stateTarget, stateReplacement);

const saveTarget = `        status: "ready_to_launch",
        lastSaved: new Date().toISOString().split("T")[0]
      };
      onSaveAdDraft(draft);`;

const saveReplacement = `        status: "ready_to_launch",
        lastSaved: new Date().toISOString().split("T")[0],
        leadCap: typeof targetLeadCap === "number" ? targetLeadCap : undefined,
        currentLeads: 0
      };
      onSaveAdDraft(draft);`;
code = code.replace(saveTarget, saveReplacement);
code = code.replace(saveTarget, saveReplacement); // for the second (Google) block

// Now let's find the save draft button to inject the input
const uiTarget1 = `<div className="flex items-center gap-3">
              {saveMessage && (
                <span className="text-xs font-bold text-emerald-600 animate-in fade-in slide-in-from-right-2">
                  ✓ {saveMessage}
                </span>
              )}
              <button
                onClick={handleSaveCurrentDraft}
                className="flex items-center gap-1 text-xs text-white font-bold bg-[#4A5D4E] hover:bg-[#38463B] px-3 py-1 rounded-lg transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Draft Campaign</span>
              </button>
            </div>`;

const uiReplacement1 = `<div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-[#EAE7E0]">
                <label className="text-[10px] font-bold text-[#606C5D] whitespace-nowrap">Auto-Pause Lead Cap:</label>
                <input
                  type="number"
                  min="1"
                  placeholder="∞"
                  value={targetLeadCap}
                  onChange={(e) => setTargetLeadCap(e.target.value ? parseInt(e.target.value, 10) : "")}
                  className="w-12 text-xs font-mono text-center outline-none bg-transparent"
                />
              </div>
              {saveMessage && (
                <span className="text-xs font-bold text-emerald-600 animate-in fade-in slide-in-from-right-2">
                  ✓ {saveMessage}
                </span>
              )}
              <button
                onClick={handleSaveCurrentDraft}
                className="flex items-center gap-1 text-xs text-white font-bold bg-[#4A5D4E] hover:bg-[#38463B] px-3 py-1 rounded-lg transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Draft Campaign</span>
              </button>
            </div>`;

code = code.replace(uiTarget1, uiReplacement1);
code = code.replace(uiTarget1, uiReplacement1); // for the google block

// Add current leads and lead cap columns to the table, and the simulate button
const tableHeaderTarget = `<th className="py-3 px-4 text-[10px] uppercase font-bold text-[#9A9488]">Counties</th>
                      <th className="py-3 px-4 text-[10px] uppercase font-bold text-[#9A9488]">Status</th>`;
const tableHeaderReplacement = `<th className="py-3 px-4 text-[10px] uppercase font-bold text-[#9A9488]">Counties</th>
                      <th className="py-3 px-4 text-[10px] uppercase font-bold text-[#9A9488]">Lead Cap</th>
                      <th className="py-3 px-4 text-[10px] uppercase font-bold text-[#9A9488]">Status</th>`;
code = code.replace(tableHeaderTarget, tableHeaderReplacement);

const tableRowTarget = `<td className="py-4 px-4">
                        <div className="text-[10px] font-semibold text-[#4A5D4E] max-w-[150px] truncate" title={camp.targetLocations?.join(", ")}>
                          {camp.targetLocations?.join(", ") || "Oregon"}
                        </div>
                      </td>
                      <td className="py-4 px-4">`;

const tableRowReplacement = `<td className="py-4 px-4">
                        <div className="text-[10px] font-semibold text-[#4A5D4E] max-w-[150px] truncate" title={camp.targetLocations?.join(", ")}>
                          {camp.targetLocations?.join(", ") || "Oregon"}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col items-start gap-1">
                          <div className="text-[10px] font-bold text-[#2D362E]">
                            {camp.currentLeads || 0} / {camp.leadCap || '∞'}
                          </div>
                          {camp.status === "active" && (
                            <button
                              onClick={() => {
                                const newLeads = (camp.currentLeads || 0) + 1;
                                const updated = { ...camp, currentLeads: newLeads };
                                if (camp.leadCap && newLeads >= camp.leadCap) {
                                  updated.status = "paused";
                                  updated.auditLog = [
                                    ...(updated.auditLog || []),
                                    {
                                      id: "log-" + Date.now(),
                                      timestamp: new Date().toISOString(),
                                      actor: "System Auto-Pilot",
                                      action: "Campaign Suspended",
                                      details: \`Lead cap (\${camp.leadCap}) reached.\`
                                    }
                                  ];
                                  alert(\`Campaign "\${camp.campaignName}" auto-suspended: Lead cap reached!\`);
                                }
                                if (onUpdateCampaign) onUpdateCampaign(updated);
                              }}
                              className="px-2 py-0.5 bg-blue-100 hover:bg-blue-200 text-blue-800 text-[9px] rounded font-bold transition-colors"
                            >
                              + Sim Lead
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">`;
code = code.replace(tableRowTarget, tableRowReplacement);

fs.writeFileSync('src/components/AdsCampaignHub.tsx', code);
