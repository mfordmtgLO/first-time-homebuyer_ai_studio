const fs = require('fs');

let content = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

const target = `{/* Experience & Stats Bar */}
                        <div className="flex items-center justify-between text-[11px] bg-[#FAF9F5] px-3 py-1.5 rounded-xl border border-[#EAE7E0] text-[#606C5D]">
                          <span>⭐ <strong>{agent.rating || 4.9}</strong> Rating</span>
                          <span><strong>{agent.experienceYears || 8}</strong> yrs exp</span>
                          <span><strong>{agent.activeListingsCount || 10}</strong> active listings</span>
                        </div>`;

const replacement = `{/* Experience & Stats Bar */}
                        <div className="flex items-center justify-between text-[11px] bg-[#FAF9F5] px-3 py-1.5 rounded-xl border border-[#EAE7E0] text-[#606C5D]">
                          <span>⭐ <strong>{agent.rating || 4.9}</strong> Rating</span>
                          <span><strong>{agent.experienceYears || 8}</strong> yrs exp</span>
                          {agent.production12MoUnits ? (
                             <span className="text-emerald-700 bg-emerald-50 px-1.5 rounded border border-emerald-100"><strong>{agent.production12MoUnits}</strong> units/12mo</span>
                          ) : (
                             <span><strong>{agent.activeListingsCount || 10}</strong> active listings</span>
                          )}
                        </div>
                        {agent.production12MoVolume && (
                           <div className="text-[10px] font-bold bg-[#E8F3F1] text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 self-start inline-block">
                             $\{(agent.production12MoVolume / 1000000).toFixed(1)}M Vol / 12mo
                           </div>
                        )}`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/LoanOfficerPortal.tsx', content);
