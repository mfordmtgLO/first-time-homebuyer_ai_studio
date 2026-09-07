const fs = require('fs');
let c = fs.readFileSync('src/components/AICopilot.tsx', 'utf8');

c = c.replace(
  /interface AICopilotProps {([^}]+)}/,
  'interface AICopilotProps {$1  activeAgent?: any;\n}'
);

c = c.replace(
  /export const AICopilot: React.FC<AICopilotProps> = \({ profile, properties, loanOfficer }\) => {/,
  'export const AICopilot: React.FC<AICopilotProps> = ({ profile, properties, loanOfficer, activeAgent }) => {'
);

// gemini/advisor payload
c = c.replace(
  /chatHistory: messages.slice\(-40\)\s*}\),/g,
  'chatHistory: messages.slice(-40),\n          loanOfficer,\n          agent: activeAgent\n        }),'
);

// gemini/offer-strategy payload
c = c.replace(
  /marketCondition\s*}\),/g,
  'marketCondition,\n          loanOfficer,\n          agent: activeAgent\n        }),'
);

// gemini/inspection-audit payload
c = c.replace(
  /concernLevel: inspectionConcernLevel\s*}\),/g,
  'concernLevel: inspectionConcernLevel,\n          loanOfficer,\n          agent: activeAgent\n        }),'
);

fs.writeFileSync('src/components/AICopilot.tsx', c);
