const fs = require('fs');
let code = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

const targetProps = `                onUpdateCampaign={(campaign) => {
                  const updatedDrafts = (guidesState.adCampaignDrafts || []).map(d => d.id === campaign.id ? campaign : d);
                  onUpdateGuidesState({
                    ...guidesState,
                    adCampaignDrafts: updatedDrafts
                  });
                }}
                onUpdateAdSettings={(adSettings) => {`;

const replaceProps = `                onUpdateCampaign={(campaign) => {
                  const updatedDrafts = (guidesState.adCampaignDrafts || []).map(d => d.id === campaign.id ? campaign : d);
                  onUpdateGuidesState({
                    ...guidesState,
                    adCampaignDrafts: updatedDrafts
                  });
                }}
                onCaptureLead={(newLead) => {
                  onUpdateGuidesState({
                    ...guidesState,
                    capturedLeads: [newLead, ...(guidesState.capturedLeads || [])]
                  });
                }}
                onUpdateAdSettings={(adSettings) => {`;

code = code.replace(targetProps, replaceProps);

fs.writeFileSync('src/components/LoanOfficerPortal.tsx', code);
