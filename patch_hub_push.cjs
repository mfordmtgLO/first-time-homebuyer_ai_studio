const fs = require('fs');
let code = fs.readFileSync('src/components/AdsCampaignHub.tsx', 'utf8');

// Add the import
code = code.replace(
  'import { Facebook, MapPin, Target, DollarSign, Activity, Users, Settings2, Sliders, Save, CreditCard, Lock, ShieldCheck, PlayCircle, PauseCircle } from "lucide-react";',
  'import { Facebook, MapPin, Target, DollarSign, Activity, Users, Settings2, Sliders, Save, CreditCard, Lock, ShieldCheck, PlayCircle, PauseCircle } from "lucide-react";\nimport { sendRealTimePushNotification } from "../utils/pushNotifications";\nimport { CapturedLead } from "../types";'
);

const targetSim = `const newLeads = (camp.currentLeads || 0) + 1;
                              const updated = { ...camp, currentLeads: newLeads };
                              if (camp.leadCap && newLeads >= camp.leadCap) {`;

const replacementSim = `const newLeads = (camp.currentLeads || 0) + 1;
                              const updated = { ...camp, currentLeads: newLeads };
                              
                              // Create fake lead for ROI tracking
                              const fakeLeadId = "lead-" + Date.now();
                              const fakeLead = {
                                id: fakeLeadId,
                                fullName: "Simulated Ad Lead " + newLeads,
                                email: \`simlead\${newLeads}@example.com\`,
                                phone: "555-0199",
                                preferredContactTime: "Evening",
                                timeline: "3-6 months",
                                targetPriceRange: "$400k-$500k",
                                targetMonthlyBudget: "$2500",
                                downPaymentSavings: "$15,000",
                                grantInterest: true,
                                creditScoreTier: "Good (670-739)",
                                preferredLocations: camp.targetLocations?.[0] || "Oregon",
                                propertyType: "Single Family",
                                assignedLoId: camp.loId,
                                assignedAgentId: camp.agentId,
                                leadSource: camp.platform === "meta" ? "Meta Ads" : "Google Ads",
                                sourceCampaignId: camp.id,
                                sourceCampaignName: camp.campaignName,
                                interactedSourceType: "campaign" as const,
                                intentScore: "warm" as const,
                                status: "new" as const
                              };

                              // Trigger Push Notification
                              sendRealTimePushNotification({
                                title: \`New \${camp.platform === "meta" ? "Meta" : "Google"} Ad Lead!\`,
                                body: \`\${fakeLead.fullName} from \${activeAgent.name}'s campaign.\`,
                                targetTab: "leads",
                                targetLeadId: fakeLeadId
                              });

                              if (camp.leadCap && newLeads >= camp.leadCap) {`;

code = code.replace(targetSim, replacementSim);

// It's possible we need to inject the fake lead into state via a prop or window event.
// Actually, `onUpdateCampaign` just updates the campaign.
// Let's add an `onCaptureLead` prop to `AdsCampaignHubProps`.
const propsTarget = `  onUpdateAdSettings: (settings: LoanOfficerAdSettings) => void;
  pairingUrl: string;
  onToggleCampaignState?: (id: string, newStatus: string) => void;
}`;
const propsReplacement = `  onUpdateAdSettings: (settings: LoanOfficerAdSettings) => void;
  pairingUrl: string;
  onToggleCampaignState?: (id: string, newStatus: string) => void;
  onCaptureLead?: (lead: CapturedLead) => void;
}`;
code = code.replace(propsTarget, propsReplacement);

// and invoke it
const invokeTarget = `if (camp.leadCap && newLeads >= camp.leadCap) {`;
const invokeReplacement = `if (onCaptureLead) onCaptureLead(fakeLead as any);\n                              if (camp.leadCap && newLeads >= camp.leadCap) {`;
code = code.replace(invokeTarget, invokeReplacement);

fs.writeFileSync('src/components/AdsCampaignHub.tsx', code);
