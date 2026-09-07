const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

const targetStr = `3. Break down why buying with 0% down (USDA Rural Development) or 3.5% Flex DPA grants makes sense compared to local rent.
4. Keep the tone encouraging, clear, transparent, and easy to respond to with zero pressure.`;

const replacementStr = `3. Break down why buying with 0% down (USDA Rural Development) or 3.5% Flex DPA grants makes sense compared to local rent.
4. Keep the tone encouraging, clear, transparent, and easy to respond to with zero pressure.
5. You MUST include the full contact information for the team at the end of the email:
   - Loan Officer: \${loName} (\${lo?.phone || ""} \${lo?.email || ""})
   \${agentName ? \`- Real Estate Agent: \${agentName} (\${agentPhone || ""} \${agentEmail || ""})\` : ""}
`;

content = content.replace(targetStr, replacementStr);

fs.writeFileSync('server.ts', content);
