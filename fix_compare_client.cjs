const fs = require('fs');
let content = fs.readFileSync('src/components/SmartCompareAI.tsx', 'utf8');

const targetStr = `        body: JSON.stringify({
          properties,
          userPrompt: prompt,
          loanOfficer: loanOfficer?.name,
          agent: agent?.name,
        }),`;

const replacementStr = `        body: JSON.stringify({
          properties,
          userPrompt: prompt,
          loanOfficer: loanOfficer,
          agent: agent,
        }),`;

content = content.replace(targetStr, replacementStr);

const targetText = `{result.callToAction ||
                \`Contact your local guides \${loanOfficer?.name || "Mike Ford"} and \${agent?.name || "Kanndice McLean"} to get a custom property list emailed directly to you matching these exact criteria.\`}`;

const replacementText = `{result.callToAction ||
                \`Contact your local guides \${loanOfficer?.name || "Mike Ford"} and \${agent?.name || "Kanndice McLean"} to get a custom property list emailed directly to you matching these exact criteria.\`}`;
// Wait, no need to touch the fallback if the AI always returns callToAction... actually let's update it.

const newTargetText = `\`Contact your local guides \${loanOfficer?.name || "Mike Ford"} and \${agent?.name || "Kanndice McLean"} to get a custom property list emailed directly to you matching these exact criteria.\``;
const newReplacementText = `\`Contact your local guides \${loanOfficer?.name || "Mike Ford"} and \${agent?.name || "Kanndice McLean"} to get a custom property list emailed directly to you matching these exact criteria.\``;
// The fallback text is already basically fine, but we can make it better. Let's just update the JSON payload for now.

fs.writeFileSync('src/components/SmartCompareAI.tsx', content);
