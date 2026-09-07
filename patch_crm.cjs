const fs = require('fs');
let c = fs.readFileSync('src/components/MasterLeadJourneyTab.tsx', 'utf8');

const target = `                                  onClick={() => {
                                    alert(\`Success! Pushed \${lead.curatedPropertyIds?.length} curated property pins directly to \${lead.fullName}'s personal Google Maps "Saved Lists" via secure token!\\n\\nA co-branded invite email (featuring you and \${lead.assignedAgent || 'the realtor'}) has been dispatched to \${lead.email}.\`);`;

const injection = `                                  onClick={() => {
                                    alert(\`Success! Pushed \${lead.curatedPropertyIds?.length} curated property pins directly to \${lead.fullName}'s personal Google Maps "Saved Lists" via secure token!\\n\\nThe synced map layer includes your custom CRM tags:\\n✓ "Pre-Approved" Badge\\n✓ Est. Monthly Payments\\n✓ Zero-Down Eligibility Flags\\n\\nA co-branded invite email (featuring you and \${lead.assignedAgent || 'the realtor'}) has been dispatched to \${lead.email}.\`);`;

c = c.replace(target, injection);
fs.writeFileSync('src/components/MasterLeadJourneyTab.tsx', c);
