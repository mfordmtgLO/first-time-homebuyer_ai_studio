const fs = require('fs');
let content = fs.readFileSync('src/components/RealtorCoBrandingHub.tsx', 'utf8');

if (!content.includes('import { OutreachHistoryBadge }')) {
  content = content.replace(
    'import { formatUSD, calculateMonthlyPI } from "../utils/mortgageMath";',
    'import { formatUSD, calculateMonthlyPI } from "../utils/mortgageMath";\nimport { OutreachHistoryBadge } from "./OutreachHistoryBadge";'
  );
}

// Add badge next to agent selector
const agentSelectorReplacement = `            </select>
            <div className="mt-1">
              <OutreachHistoryBadge logs={selectedAgent?.outreachLogs} />
            </div>
          </div>`;
content = content.replace(/<\/select>\s*<\/div>/, agentSelectorReplacement);

// Add badge next to lead name in partner pipeline
const leadReplacement = `<div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-[#2D362E]">{lead.fullName}</span>
                      <OutreachHistoryBadge logs={lead.outreachLogs} />
                    </div>`;
content = content.replace(/<span className="font-bold text-\[#2D362E\] block">\{lead\.fullName\}<\/span>/, leadReplacement);

fs.writeFileSync('src/components/RealtorCoBrandingHub.tsx', content);
console.log("Updated RealtorCoBrandingHub");
