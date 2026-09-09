const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardOverview.tsx', 'utf8');

const importTarget = `import { RealTimeMortgageRateTracker } from "./RealTimeMortgageRateTracker";\n`;
code = code.replace(importTarget, '');

const componentTarget = `      {/* Real-Time Search-Grounded National Mortgage Rate Tracker (Dashboard Users Only) */}
      <RealTimeMortgageRateTracker
        profile={profile}
        setProfile={setProfile}
        onNavigate={onNavigate}
      />\n`;
code = code.replace(componentTarget, '');

fs.writeFileSync('src/components/DashboardOverview.tsx', code);
