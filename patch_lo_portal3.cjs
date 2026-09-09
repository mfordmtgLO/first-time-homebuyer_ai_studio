const fs = require('fs');
let code = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

const targetHubProps = `                onSaveAdDraft={(draft) => {
                  onUpdateGuidesState({
                    ...guidesState,
                    adCampaignDrafts: [draft, ...(guidesState.adCampaignDrafts || [])],
                  });
                }}`;

const replaceHubProps = `                onSaveAdDraft={(draft) => {
                  onUpdateGuidesState({
                    ...guidesState,
                    adCampaignDrafts: [draft, ...(guidesState.adCampaignDrafts || [])],
                  });
                }}
                onUpdateCampaign={(campaign) => {
                  const updatedDrafts = (guidesState.adCampaignDrafts || []).map(d => d.id === campaign.id ? campaign : d);
                  onUpdateGuidesState({
                    ...guidesState,
                    adCampaignDrafts: updatedDrafts
                  });
                }}`;

code = code.replace(targetHubProps, replaceHubProps);

fs.writeFileSync('src/components/LoanOfficerPortal.tsx', code);
