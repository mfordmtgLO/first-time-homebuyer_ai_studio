const fs = require('fs');
let code = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

const targetProps = `                onUpdateAdSettings={(adSettings) => {
                  const updatedLo = { ...currentLo, adSettings };
                  const updatedLos = guidesState.loanOfficers.map((l) =>
                    l.id === currentLo.id ? updatedLo : l
                  );
                  onUpdateGuidesState({
                    ...guidesState,
                    loanOfficers: updatedLos,
                  });
                }}
                pairingUrl={activePairingUrl}
              />`;

const replaceProps = targetProps.replace('pairingUrl={activePairingUrl}\n              />', `pairingUrl={activePairingUrl}
                onToggleCampaignState={(id, newStatus) => {
                  const updatedDrafts = (guidesState.adCampaignDrafts || []).map(draft => {
                    if (draft.id === id) {
                      const newLog = {
                        id: "log-" + Date.now(),
                        timestamp: new Date().toISOString(),
                        actor: \`Loan Officer (\${currentLo.name})\`,
                        action: newStatus === "active" ? "Activated Campaign" : "Paused Campaign"
                      };
                      return { 
                        ...draft, 
                        status: newStatus,
                        auditLog: [...(draft.auditLog || []), newLog]
                      };
                    }
                    return draft;
                  });
                  onUpdateGuidesState({
                    ...guidesState,
                    adCampaignDrafts: updatedDrafts
                  });
                }}
              />`);

code = code.replace(targetProps, replaceProps);

fs.writeFileSync('src/components/LoanOfficerPortal.tsx', code);
