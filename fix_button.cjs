const fs = require('fs');
let c = fs.readFileSync('src/components/MasterLeadJourneyTab.tsx', 'utf8');

c = c.replace('<Database className="w-3.5 h-3.5" /> Sync to Big Purple Dot\\n\\n                          </div>', '<Database className="w-3.5 h-3.5" /> Sync to Big Purple Dot\\n</button>\\n\\n                          </div>');

// also fix the import
c = c.replace('import {\\n  Database, CapturedLead, LoanOfficerProfile, RealEstateAgentProfile } from "../types";', 'import { CapturedLead, LoanOfficerProfile, RealEstateAgentProfile } from "../types";');

fs.writeFileSync('src/components/MasterLeadJourneyTab.tsx', c);
