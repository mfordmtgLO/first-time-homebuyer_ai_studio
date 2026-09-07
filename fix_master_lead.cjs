const fs = require('fs');
let c = fs.readFileSync('src/components/MasterLeadJourneyTab.tsx', 'utf8');

c = c.replace(
  'export const MasterLeadJourneyTab: React.FC<MasterLeadJourneyTabProps> = ({ leads, onUpdateLead, loanOfficer, agentRoster = [] }) => {',
  'export const MasterLeadJourneyTab: React.FC<MasterLeadJourneyTabProps> = ({ properties, setProperties, leads, onUpdateLead, loanOfficer, agentRoster = [] }) => {'
);

fs.writeFileSync('src/components/MasterLeadJourneyTab.tsx', c);
