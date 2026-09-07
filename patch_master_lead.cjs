const fs = require('fs');
let c = fs.readFileSync('src/components/MasterLeadJourneyTab.tsx', 'utf8');

const target = `export interface MasterLeadJourneyTabProps {
  leads: LeadRecord[];
  loanOfficer: LoanOfficerProfile;
  agentRoster: BusinessPartner[];
  onUpdateLead: (updated: LeadRecord) => void;
}`;

const injection = `import { PropertyListing } from "../types";

export interface MasterLeadJourneyTabProps {
  properties?: PropertyListing[];
  setProperties?: React.Dispatch<React.SetStateAction<PropertyListing[]>>;
  leads: LeadRecord[];
  loanOfficer: LoanOfficerProfile;
  agentRoster: BusinessPartner[];
  onUpdateLead: (updated: LeadRecord) => void;
}`;

c = c.replace(target, injection);
c = c.replace(
  'export const MasterLeadJourneyTab: React.FC<MasterLeadJourneyTabProps> = ({ leads, loanOfficer, agentRoster, onUpdateLead }) => {',
  'export const MasterLeadJourneyTab: React.FC<MasterLeadJourneyTabProps> = ({ properties, setProperties, leads, loanOfficer, agentRoster, onUpdateLead }) => {'
);

fs.writeFileSync('src/components/MasterLeadJourneyTab.tsx', c);
