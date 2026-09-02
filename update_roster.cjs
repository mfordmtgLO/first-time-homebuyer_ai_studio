const fs = require('fs');
let content = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

const targetStr = `                          {lo.isTeamMember && !isMike && (
                            <div className="absolute top-0 right-12 px-3 py-1 bg-[#4A5D4E] text-white text-[10px] font-bold rounded-b-xl uppercase tracking-wider">
                              Assigned Team
                            </div>
                          )}
                          {!lo.isTeamMember && !isMike && (
                            <div className="absolute top-0 right-12 px-3 py-1 bg-[#9A9488] text-white text-[10px] font-bold rounded-b-xl uppercase tracking-wider">
                              Unassigned
                            </div>
                          )}`;

const replacementStr = `                          {lo.isTeamMember && !isMike && (
                            <div className="absolute top-0 right-12 px-3 py-1 bg-[#4A5D4E] text-white text-[10px] font-bold rounded-b-xl uppercase tracking-wider flex items-center gap-1.5">
                              Assigned Team
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const currentStatus = lo.teamStarStatus || 'red';
                                  const nextStatus = currentStatus === 'red' ? 'blue' : currentStatus === 'blue' ? 'green' : 'red';
                                  const updatedLos = guidesState.loanOfficers.map(l => l.id === lo.id ? { ...l, teamStarStatus: nextStatus } : l);
                                  onUpdateGuidesState({ ...guidesState, loanOfficers: updatedLos });
                                }}
                                className="focus:outline-none hover:scale-110 transition-transform"
                                title={lo.teamStarStatus === 'green' ? 'Part of Team' : lo.teamStarStatus === 'blue' ? 'Profile Complete' : 'New Hire - Incomplete'}
                              >
                                <Star className={\`w-3.5 h-3.5 fill-current \${lo.teamStarStatus === 'green' ? 'text-green-400' : lo.teamStarStatus === 'blue' ? 'text-blue-400' : 'text-red-400'}\`} />
                              </button>
                            </div>
                          )}
                          {!lo.isTeamMember && !isMike && (
                            <div className="absolute top-0 right-12 px-3 py-1 bg-[#9A9488] text-white text-[10px] font-bold rounded-b-xl uppercase tracking-wider flex items-center gap-1.5">
                              Unassigned
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const currentStatus = lo.teamStarStatus || 'red';
                                  const nextStatus = currentStatus === 'red' ? 'blue' : currentStatus === 'blue' ? 'green' : 'red';
                                  const updatedLos = guidesState.loanOfficers.map(l => l.id === lo.id ? { ...l, teamStarStatus: nextStatus } : l);
                                  onUpdateGuidesState({ ...guidesState, loanOfficers: updatedLos });
                                }}
                                className="focus:outline-none hover:scale-110 transition-transform"
                                title={lo.teamStarStatus === 'green' ? 'Part of Team' : lo.teamStarStatus === 'blue' ? 'Profile Complete' : 'New Hire - Incomplete'}
                              >
                                <Star className={\`w-3.5 h-3.5 fill-current \${lo.teamStarStatus === 'green' ? 'text-green-400' : lo.teamStarStatus === 'blue' ? 'text-blue-400' : 'text-red-400'}\`} />
                              </button>
                            </div>
                          )}`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync('src/components/LoanOfficerPortal.tsx', content);
  console.log("Roster cards updated.");
} else {
  console.log("Could not find target string in Portal.");
}
