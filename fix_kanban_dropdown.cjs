const fs = require('fs');
let content = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

const oldTarget = `                            <select
                              value={lo.recruitmentStatus || 'New'}
                              onChange={(e) => {
                                const updatedLos = guidesState.loanOfficers.map(l => 
                                  l.id === lo.id ? { ...l, recruitmentStatus: e.target.value as any } : l
                                );
                                onUpdateGuidesState({ ...guidesState, loanOfficers: updatedLos });
                                triggerToast(\`Updated status for \${lo.name} to \${e.target.value}\`);
                              }}
                              className="w-full bg-white border border-[#EAE7E0] rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:border-[#4A5D4E] text-[#606C5D]"
                            >
                              <option value="New">New</option>
                              <option value="Contacted">Contacted</option>
                              <option value="Scheduled Interview">Scheduled Interview</option>
                              <option value="Onboarding">Onboarding</option>
                              <option value="Declined">Declined</option>
                            </select>`;

const newTarget = `                            <select
                              value={lo.recruitmentStatus || 'Not Contacted'}
                              onChange={(e) => {
                                const updatedLos = guidesState.loanOfficers.map(l => 
                                  l.id === lo.id ? { ...l, recruitmentStatus: e.target.value as any } : l
                                );
                                onUpdateGuidesState({ ...guidesState, loanOfficers: updatedLos });
                                triggerToast(\`Updated status for \${lo.name} to \${e.target.value}\`);
                              }}
                              className="w-full bg-white border border-[#EAE7E0] rounded-xl px-2 py-1.5 text-xs focus:outline-none focus:border-[#4A5D4E] text-[#606C5D]"
                            >
                              <option value="Not Contacted">Not Contacted</option>
                              <option value="In Outreach">In Outreach</option>
                              <option value="Interested">Interested</option>
                              <option value="Meeting Scheduled">Meeting Scheduled</option>
                              <option value="Declined">Declined</option>
                            </select>`;

content = content.replace(oldTarget, newTarget);

fs.writeFileSync('src/components/LoanOfficerPortal.tsx', content);
