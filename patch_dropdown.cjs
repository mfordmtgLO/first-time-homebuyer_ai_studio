const fs = require('fs');
let content = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

const target1 = `                      <div className="space-y-1.5 pt-2 border-t border-[#EAE7E0] text-xs">
                        <div className="flex items-center justify-between text-[#606C5D]">
                          <span>Active Realtor Pairings:</span>`;

const rep1 = `                      {!lo.isTeamMember && !isMike && (
                        <div className="pt-2 mt-2 border-t border-[#EAE7E0] space-y-2">
                           <div className="flex items-center justify-between">
                             <span className="text-[10px] font-bold text-[#606C5D] uppercase tracking-wider">Recruiting Status</span>
                             {lo.recruitmentStatus === 'Not Contacted' ? (
                               <span className="text-[9px] bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded-full border border-gray-200">⚪ Not Contacted</span>
                             ) : lo.recruitmentStatus === 'In Outreach' ? (
                               <span className="text-[9px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-200">🔵 In Outreach</span>
                             ) : lo.recruitmentStatus === 'Interested' ? (
                               <span className="text-[9px] bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full border border-amber-200">🟠 Interested</span>
                             ) : lo.recruitmentStatus === 'Meeting Scheduled' ? (
                               <span className="text-[9px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">🟢 Meeting</span>
                             ) : lo.recruitmentStatus === 'Declined' ? (
                               <span className="text-[9px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full border border-red-200">🔴 Declined</span>
                             ) : (
                               <span className="text-[9px] bg-gray-100 text-gray-600 font-bold px-2 py-0.5 rounded-full border border-gray-200">⚪ {lo.recruitmentStatus || 'Not Contacted'}</span>
                             )}
                           </div>
                           <select
                              value={lo.recruitmentStatus || 'Not Contacted'}
                              onChange={(e) => {
                                const updatedLos = guidesState.loanOfficers.map(l => 
                                  l.id === lo.id ? { ...l, recruitmentStatus: e.target.value as any } : l
                                );
                                onUpdateGuidesState({ ...guidesState, loanOfficers: updatedLos });
                                triggerToast(\`Updated status for \${lo.name} to \${e.target.value}\`);
                              }}
                              className="w-full bg-white border border-[#EAE7E0] rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:border-[#4A5D4E] text-[#606C5D] shadow-sm transition-colors"
                            >
                              <option value="Not Contacted">Not Contacted</option>
                              <option value="In Outreach">In Outreach</option>
                              <option value="Interested">Interested</option>
                              <option value="Meeting Scheduled">Meeting Scheduled</option>
                              <option value="Declined">Declined</option>
                            </select>
                        </div>
                      )}

                      <div className="space-y-1.5 pt-2 border-t border-[#EAE7E0] text-xs">
                        <div className="flex items-center justify-between text-[#606C5D]">
                          <span>Active Realtor Pairings:</span>`;

content = content.replace(target1, rep1);

fs.writeFileSync('src/components/LoanOfficerPortal.tsx', content);
