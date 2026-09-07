const fs = require('fs');
let c = fs.readFileSync('src/components/MasterLeadJourneyTab.tsx', 'utf8');

c = c.replace('import {\\n  Database, CapturedLead', 'import { CapturedLead');
c = c.replace('import { Layers', 'import { Database, Layers');

fs.writeFileSync('src/components/MasterLeadJourneyTab.tsx', c);
