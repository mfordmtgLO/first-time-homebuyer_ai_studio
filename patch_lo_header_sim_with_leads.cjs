const fs = require('fs');
let code = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

const targetHeader = `<div className="hidden lg:flex items-center gap-2 mr-4 bg-[#F9F8F4] p-1.5 rounded-lg border border-[#EAE7E0]">
            <span className="text-[9px] font-bold text-[#9A9488] uppercase px-1">Simulate Push:</span>
            <button 
              onClick={() => sendRealTimePushNotification({
                title: "New AI Chatbot Lead!",
                body: "Jordan Smith just submitted an intake form via Chatbot.",
                targetTab: "leads",
                targetLeadId: guidesState.capturedLeads?.[0]?.id
              })}
              className="text-[10px] bg-white border border-[#EAE7E0] hover:bg-[#F1EFE9] text-[#2D362E] px-2 py-1 rounded shadow-sm transition-colors"
            >
              🤖 Chat Lead
            </button>
            <button 
              onClick={() => sendRealTimePushNotification({
                title: "Twilio SMS Received",
                body: "Emily Davis: 'Does this home qualify for the DPA?'",
                targetTab: "sms_templates"
              })}
              className="text-[10px] bg-white border border-[#EAE7E0] hover:bg-[#F1EFE9] text-[#2D362E] px-2 py-1 rounded shadow-sm transition-colors"
            >
              📱 Twilio Text
            </button>
            <button 
              onClick={() => sendRealTimePushNotification({
                title: "Property Inquiry Note",
                body: "Sarah requested a tour for 123 Main St.",
                targetTab: "geosphere_sync"
              })}
              className="text-[10px] bg-white border border-[#EAE7E0] hover:bg-[#F1EFE9] text-[#2D362E] px-2 py-1 rounded shadow-sm transition-colors"
            >
              🏡 Prop Note
            </button>
          </div>`;

const replacementHeader = `<div className="hidden lg:flex items-center gap-2 mr-4 bg-[#F9F8F4] p-1.5 rounded-lg border border-[#EAE7E0]">
            <span className="text-[9px] font-bold text-[#9A9488] uppercase px-1">Simulate Push:</span>
            <button 
              onClick={() => {
                const fakeId = "lead-" + Date.now();
                onUpdateGuidesState({
                  ...guidesState,
                  capturedLeads: [{
                    id: fakeId,
                    fullName: "Jordan Smith",
                    email: "jordan@example.com",
                    phone: "555-0922",
                    preferredContactTime: "Morning",
                    timeline: "1-3 months",
                    targetPriceRange: "$350k-$450k",
                    targetMonthlyBudget: "$2200",
                    downPaymentSavings: "$12,000",
                    grantInterest: true,
                    creditScoreTier: "Good (670-739)",
                    preferredLocations: "Oregon",
                    propertyType: "Single Family",
                    assignedLoId: currentLo.id,
                    leadSource: "AI Chatbot",
                    interactedSourceType: "chatbot",
                    intentScore: "hot",
                    status: "new"
                  }, ...(guidesState.capturedLeads || [])]
                });
                sendRealTimePushNotification({
                  title: "New AI Chatbot Lead!",
                  body: "Jordan Smith just submitted an intake form via Chatbot.",
                  targetTab: "leads",
                  targetLeadId: fakeId
                });
              }}
              className="text-[10px] bg-white border border-[#EAE7E0] hover:bg-[#F1EFE9] text-[#2D362E] px-2 py-1 rounded shadow-sm transition-colors"
            >
              🤖 Chat Lead
            </button>
            <button 
              onClick={() => {
                const fakeId = "lead-" + Date.now();
                onUpdateGuidesState({
                  ...guidesState,
                  capturedLeads: [{
                    id: fakeId,
                    fullName: "Emily Davis",
                    email: "emily@example.com",
                    phone: "555-1102",
                    preferredContactTime: "Anytime",
                    timeline: "ASAP",
                    targetPriceRange: "$500k",
                    targetMonthlyBudget: "$3000",
                    downPaymentSavings: "$25,000",
                    grantInterest: false,
                    creditScoreTier: "Excellent (740+)",
                    preferredLocations: "Portland",
                    propertyType: "Condo",
                    assignedLoId: currentLo.id,
                    leadSource: "Twilio SMS",
                    interactedSourceType: "campaign",
                    intentScore: "hot",
                    status: "new"
                  }, ...(guidesState.capturedLeads || [])]
                });
                sendRealTimePushNotification({
                  title: "Twilio SMS Received",
                  body: "Emily Davis: 'Does this home qualify for the DPA?'",
                  targetTab: "sms_compliance"
                });
              }}
              className="text-[10px] bg-white border border-[#EAE7E0] hover:bg-[#F1EFE9] text-[#2D362E] px-2 py-1 rounded shadow-sm transition-colors"
            >
              📱 Twilio Text
            </button>
            <button 
              onClick={() => {
                const fakeId = "lead-" + Date.now();
                onUpdateGuidesState({
                  ...guidesState,
                  capturedLeads: [{
                    id: fakeId,
                    fullName: "Sarah Johnson",
                    email: "sarah@example.com",
                    phone: "555-8811",
                    preferredContactTime: "Evening",
                    timeline: "1-3 months",
                    targetPriceRange: "$400k",
                    targetMonthlyBudget: "$2500",
                    downPaymentSavings: "$15,000",
                    grantInterest: true,
                    creditScoreTier: "Good (670-739)",
                    preferredLocations: "Portland",
                    propertyType: "Single Family",
                    assignedLoId: currentLo.id,
                    leadSource: "Property Listing Inquiry",
                    interactedSourceType: "property_listing",
                    intentScore: "warm",
                    status: "new"
                  }, ...(guidesState.capturedLeads || [])]
                });
                sendRealTimePushNotification({
                  title: "Property Inquiry Note",
                  body: "Sarah requested a tour for 123 Main St.",
                  targetTab: "geosphere_sync"
                });
              }}
              className="text-[10px] bg-white border border-[#EAE7E0] hover:bg-[#F1EFE9] text-[#2D362E] px-2 py-1 rounded shadow-sm transition-colors"
            >
              🏡 Prop Note
            </button>
            <button 
              onClick={() => {
                const fakeId = "lead-" + Date.now();
                onUpdateGuidesState({
                  ...guidesState,
                  capturedLeads: [{
                    id: fakeId,
                    fullName: "Marcus Robinson",
                    email: "marcus@example.com",
                    phone: "555-4422",
                    preferredContactTime: "Afternoon",
                    timeline: "3-6 months",
                    targetPriceRange: "$600k",
                    targetMonthlyBudget: "$3500",
                    downPaymentSavings: "$40,000",
                    grantInterest: false,
                    creditScoreTier: "Excellent (740+)",
                    preferredLocations: "Seattle",
                    propertyType: "Single Family",
                    assignedLoId: currentLo.id,
                    assignedAgentId: activeAgent.id,
                    leadSource: "Co-Branded Website",
                    interactedSourceType: "calculator",
                    intentScore: "warm",
                    status: "new"
                  }, ...(guidesState.capturedLeads || [])]
                });
                sendRealTimePushNotification({
                  title: "Co-Branded Lead Captured!",
                  body: "Marcus Robinson came through " + activeAgent.name + "'s roadmap portal.",
                  targetTab: "leads",
                  targetLeadId: fakeId
                });
              }}
              className="text-[10px] bg-white border border-[#EAE7E0] hover:bg-[#F1EFE9] text-[#2D362E] px-2 py-1 rounded shadow-sm transition-colors"
            >
              🤝 Co-Brand URL
            </button>
          </div>`;

code = code.replace(targetHeader, replacementHeader);

fs.writeFileSync('src/components/LoanOfficerPortal.tsx', code);
