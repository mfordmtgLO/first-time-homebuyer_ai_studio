const fs = require('fs');
let c = fs.readFileSync('src/components/MasterLeadJourneyTab.tsx', 'utf8');

c = c.replace('<Database className="w-3.5 h-3.5" /> Sync to Big Purple Dot\\n\\n                          </div>', '<Database className="w-3.5 h-3.5" /> Sync to Big Purple Dot\\n                            </button>\\n                          </div>');

fs.writeFileSync('src/components/MasterLeadJourneyTab.tsx', c);
