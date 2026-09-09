const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

// Add activeAdCounties
code = code.replace(
  "  marketAreas: string[];",
  "  marketAreas: string[];\n  activeAdCounties?: string[];"
);

// Add isCompliancePaused to AdCampaignDraft
code = code.replace(
  "  targetLocations: string[];",
  "  targetLocations: string[];\n  isCompliancePaused?: boolean;"
);

fs.writeFileSync('src/types.ts', code);
