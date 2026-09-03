const fs = require('fs');
let content = fs.readFileSync('src/components/AIPartnerCampaign.tsx', 'utf8');

if (!content.includes('import { OutreachHistoryBadge }')) {
  content = content.replace(
    'import { RealEstateAgentProfile, LoanOfficerProfile } from "../types";',
    'import { RealEstateAgentProfile, LoanOfficerProfile } from "../types";\nimport { OutreachHistoryBadge } from "./OutreachHistoryBadge";'
  );
}

const renderReplace = `<span className="font-bold text-[#2D362E]">{agent.name}</span>
                        <div className="ml-2">
                          <OutreachHistoryBadge logs={agent.outreachLogs} />
                        </div>`;

content = content.replace(/<span className="font-bold text-\[#2D362E\]">\{agent\.name\}<\/span>/, renderReplace);

fs.writeFileSync('src/components/AIPartnerCampaign.tsx', content);
console.log("Updated AIPartnerCampaign");
