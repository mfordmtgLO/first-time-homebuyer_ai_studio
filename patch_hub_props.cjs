const fs = require('fs');
let code = fs.readFileSync('src/components/AdsCampaignHub.tsx', 'utf8');

const targetProps = `interface AdsCampaignHubProps {
  loanOfficer: LoanOfficerProfile;
  activeAgent: RealEstateAgentProfile;
  adCampaignDrafts: AdCampaignDraft[];
  onSaveAdDraft: (draft: AdCampaignDraft) => void;
  onUpdateAdSettings: (settings: LoanOfficerAdSettings) => void;
  pairingUrl,
  onToggleCampaignState: string;
  onToggleCampaignState?: (id: string, newStatus: string) => void;
}`;

const replaceProps = `interface AdsCampaignHubProps {
  loanOfficer: LoanOfficerProfile;
  activeAgent: RealEstateAgentProfile;
  adCampaignDrafts: AdCampaignDraft[];
  onSaveAdDraft: (draft: AdCampaignDraft) => void;
  onUpdateCampaign?: (campaign: AdCampaignDraft) => void;
  onUpdateAdSettings: (settings: LoanOfficerAdSettings) => void;
  pairingUrl: string;
  onToggleCampaignState?: (id: string, newStatus: string) => void;
}`;

code = code.replace(targetProps, replaceProps);
code = code.replace("  pairingUrl,\n  onToggleCampaignState", "  pairingUrl,\n  onToggleCampaignState,\n  onUpdateCampaign");

fs.writeFileSync('src/components/AdsCampaignHub.tsx', code);
