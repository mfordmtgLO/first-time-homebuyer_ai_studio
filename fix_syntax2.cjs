const fs = require('fs');

let c = fs.readFileSync('src/components/PropertyTracker.tsx', 'utf8');
c = c.replace('Compass,\\n  Flame,', 'Compass,\n  Flame,');
fs.writeFileSync('src/components/PropertyTracker.tsx', c);

let c2 = fs.readFileSync('src/components/MasterLeadJourneyTab.tsx', 'utf8');
c2 = c2.replace('CheckCircle2,\\n  BellRing,', 'CheckCircle2,\n  BellRing,');
c2 = c2.replace('BellRing,\\n  CheckCircle2,', 'BellRing,\n  CheckCircle2,');
fs.writeFileSync('src/components/MasterLeadJourneyTab.tsx', c2);

