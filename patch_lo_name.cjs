const fs = require('fs');
let code = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

const targetStr = '                            <span>{lo.name}</span>\n                            <ShieldCheck className="w-3.5 h-3.5 text-[#4A5D4E]" />';

const replacementStr = `                            <span>{lo.name}</span>
                            {lo.accountRestricted ? (
                              <div title="Account Temporarily Restricted" className="flex items-center justify-center w-5 h-5 rounded-full bg-rose-100 text-rose-700">
                                <Lock className="w-3 h-3" />
                              </div>
                            ) : (
                              <ShieldCheck className="w-3.5 h-3.5 text-[#4A5D4E]" />
                            )}`;

code = code.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/LoanOfficerPortal.tsx', code);
