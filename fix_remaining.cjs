const fs = require('fs');

let c = fs.readFileSync('src/components/MasterLeadJourneyTab.tsx', 'utf8');
if (!c.includes('BellRing')) {
    c = c.replace('import {\\n  CheckCircle2,', 'import {\\n  BellRing,\\n  CheckCircle2,');
}
fs.writeFileSync('src/components/MasterLeadJourneyTab.tsx', c);

let c2 = fs.readFileSync('src/components/PropertyTracker.tsx', 'utf8');
c2 = c2.replace('Compass,', 'Compass,\\n  Flame,');
fs.writeFileSync('src/components/PropertyTracker.tsx', c2);

