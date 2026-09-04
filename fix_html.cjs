const fs = require('fs');
let code = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

const target = '<div className="flex items-center gap-3">\n                  <Building className="w-4 h-4" />\n                  <span className="font-semibold text-sm tracking-wide">Branch Whitelist Mgmt</span>\n                </div>';

const replacement = '<Building className="w-4 h-4 text-[#C18C5D]" />\n                <span>Branch Whitelist Mgmt</span>';

code = code.replace(target, replacement);
fs.writeFileSync('src/components/LoanOfficerPortal.tsx', code);
