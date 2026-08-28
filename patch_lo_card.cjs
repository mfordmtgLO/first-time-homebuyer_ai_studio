const fs = require('fs');

let content = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

// I will insert the new metrics right after the bio in the card.
const target = `<p className="text-xs text-[#606C5D] line-clamp-2 leading-relaxed">
                        {lo.bio}
                      </p>`;

const replacement = `<p className="text-xs text-[#606C5D] line-clamp-2 leading-relaxed">
                        {lo.bio}
                      </p>

                      {/* AI Generated Recruiting Metrics */}
                      {(lo.yearsExperience !== undefined || lo.production12MoUnits !== undefined) && (
                        <div className="flex items-center gap-2 mt-2">
                           {lo.yearsExperience !== undefined && (
                             <span className="text-[10px] font-bold bg-[#E8F3F1] text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                               {lo.yearsExperience} Yrs Exp
                             </span>
                           )}
                           {lo.production12MoUnits !== undefined && (
                             <span className="text-[10px] font-bold bg-[#E8F3F1] text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                               {lo.production12MoUnits} Units / 12mo
                             </span>
                           )}
                           {lo.production12MoVolume !== undefined && (
                             <span className="text-[10px] font-bold bg-[#E8F3F1] text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                               $\{(lo.production12MoVolume / 1000000).toFixed(1)}M Vol
                             </span>
                           )}
                           {lo.licenseStates && lo.licenseStates.length > 0 && (
                             <span className="text-[10px] font-bold bg-[#FFF9E6] text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                               {lo.licenseStates.join(', ')}
                             </span>
                           )}
                        </div>
                      )}`;

content = content.replace(target, replacement);
fs.writeFileSync('src/components/LoanOfficerPortal.tsx', content, 'utf8');
