const fs = require('fs');
let code = fs.readFileSync('src/components/AdsCampaignHub.tsx', 'utf8');

const tableHeaderTarget = `<th className="pb-3 text-[10px] uppercase font-bold text-[#9A9488]">Budget</th>
                  <th className="pb-3 text-[10px] uppercase font-bold text-[#9A9488]">Status</th>`;
const tableHeaderReplacement = `<th className="pb-3 text-[10px] uppercase font-bold text-[#9A9488]">Budget</th>
                  <th className="pb-3 text-[10px] uppercase font-bold text-[#9A9488]">Leads / Cap</th>
                  <th className="pb-3 text-[10px] uppercase font-bold text-[#9A9488]">Status</th>`;
code = code.replace(tableHeaderTarget, tableHeaderReplacement);

const tableRowTarget = `<td className="py-4 pr-4">
                      <div className="font-bold text-[10px] text-[#2D362E]">${"$"}{camp.dailyBudget}/day</div>
                    </td>
                    <td className="py-4 pr-4">`;

const tableRowReplacement = `<td className="py-4 pr-4">
                      <div className="font-bold text-[10px] text-[#2D362E]">${"$"}{camp.dailyBudget}/day</div>
                    </td>
                    <td className="py-4 pr-4">
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
                            className="px-2 py-0.5 bg-[#F9F8F4] hover:bg-[#EAE7E0] border border-[#EAE7E0] text-[#606C5D] text-[9px] rounded font-bold transition-colors"
                          >
                            + Sim Lead
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-4 pr-4">`;
code = code.replace(tableRowTarget, tableRowReplacement);

fs.writeFileSync('src/components/AdsCampaignHub.tsx', code);
