const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

code = code.replace(
  'intentScore: "hot" | "warm" | "cold" | "unscored";',
  'intentScore: "hot" | "warm" | "cold" | "unscored";\\n  salesforceId?: string;\\n  salesforceSyncedAt?: string;'
);

fs.writeFileSync('src/types.ts', code);
