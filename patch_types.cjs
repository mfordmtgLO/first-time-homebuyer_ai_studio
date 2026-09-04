const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(
  "export interface LoanOfficerProfile {\n  enrichmentStatus?",
  "export interface LoanOfficerProfile {\n  accountRestricted?: boolean;\n  accountRestrictedAt?: string;\n  enrichmentStatus?"
);

fs.writeFileSync('src/types.ts', code);
