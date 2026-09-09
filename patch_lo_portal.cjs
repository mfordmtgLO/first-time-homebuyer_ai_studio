const fs = require('fs');
let code = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

const targetHubProps = `                onUpdateAdSettings={(adSettings) => {
                  updateCurrentLoField("adSettings", adSettings);
                }}
                pairingUrl={activePairingUrl}
              />`;

const replacementHubProps = `                onUpdateAdSettings={(adSettings) => {
                  updateCurrentLoField("adSettings", adSettings);
                }}
                pairingUrl={activePairingUrl}
                onToggleCampaignState={(id, newStatus) => {
                  const updatedDrafts = (guidesState.adCampaignDrafts || []).map(draft => 
                    draft.id === id ? { ...draft, status: newStatus } : draft
                  );
                  onUpdateGuidesState({
                    ...guidesState,
                    adCampaignDrafts: updatedDrafts
                  });
                }}
              />`;

code = code.replace(targetHubProps, replacementHubProps);

fs.writeFileSync('src/components/LoanOfficerPortal.tsx', code);
