const fs = require('fs');
let content = fs.readFileSync('src/components/RecruitmentPipeline.tsx', 'utf8');

const targetStr = `{['Not Contacted', 'In Outreach', 'Interested', 'Meeting Scheduled', 'Declined'].map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>`;
                      
const replacementStr = `{['Not Contacted', 'In Outreach', 'Interested', 'Meeting Scheduled', 'Declined'].map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      
                      <button
                        onClick={() => {
                          const updatedLos = guidesState.loanOfficers.map(l => 
                            l.id === lo.id ? { ...l, isTeamMember: true, teamStarStatus: 'red' as const } : l
                          );
                          onUpdateGuidesState({ ...guidesState, loanOfficers: updatedLos });
                          onTriggerToast(\`\${lo.name} moved to Team LO Roster\`);
                        }}
                        className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 mt-1"
                      >
                        <Users className="w-3.5 h-3.5" />
                        Hire & Move to Team
                      </button>`;
                      
if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync('src/components/RecruitmentPipeline.tsx', content);
  console.log("Pipeline updated.");
} else {
  console.log("Could not find target string in Pipeline.");
}
