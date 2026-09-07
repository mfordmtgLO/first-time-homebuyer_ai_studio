const fs = require('fs');
let c = fs.readFileSync('src/services/telemetryService.ts', 'utf8');

c = c.replace(
  'category: "navigation" | "http" | "user-action" | "console" | "error" | "lifecycle";',
  'category: "navigation" | "http" | "user-action" | "console" | "error" | "lifecycle" | "security";'
);

fs.writeFileSync('src/services/telemetryService.ts', c);
