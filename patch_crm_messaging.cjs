const fs = require('fs');
let c = fs.readFileSync('src/components/MasterLeadJourneyTab.tsx', 'utf8');

const targetCRM = `alert(\`Success! Pushed \${lead.curatedPropertyIds?.length} curated property pins directly to \${lead.fullName}'s personal Google Maps "Saved Lists" via secure token!\\n\\nThe synced map layer includes your custom CRM tags:\\n✓ "Pre-Approved" Badge\\n✓ Est. Monthly Payments\\n✓ Zero-Down Eligibility Flags\\n\\nA co-branded invite email (featuring you and \${lead.assignedAgent || 'the realtor'}) has been dispatched to \${lead.email}.\`);`;

const injectionCRM = `alert(\`Success! Pushed \${lead.curatedPropertyIds?.length} curated property pins directly to \${lead.fullName}'s personal Google Maps "Saved Lists" via secure token!\\n\\nThe synced map layer includes your custom CRM tags:\\n✓ "Pre-Approved" Badge\\n✓ Est. Monthly Payments\\n✓ Zero-Down Eligibility Flags\\n\\nNote: The co-branded invite email dispatched to \${lead.email} explicitly instructs the buyer to click "Follow" or "Save" once the map opens to ensure permanent retention.\`);`;

c = c.replace(targetCRM, injectionCRM);
fs.writeFileSync('src/components/MasterLeadJourneyTab.tsx', c);
