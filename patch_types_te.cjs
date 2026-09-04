const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(
  'salesforceSyncedAt?: string;',
  'salesforceSyncedAt?: string;\\n  totalExpertId?: string;\\n  totalExpertSyncedAt?: string;'
);

fs.writeFileSync('src/types.ts', code);
