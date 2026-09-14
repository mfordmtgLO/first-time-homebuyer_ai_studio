const fs = require('fs');
let code = fs.readFileSync('src/utils/rbac.ts', 'utf8');

code = code.replace(
  'assignedLoId?: string;',
  'assignedLoId?: string;\\n  isLockedOut?: boolean;'
);

fs.writeFileSync('src/utils/rbac.ts', code, 'utf8');
console.log("Updated WhitelistedUserRecord with isLockedOut");
