const fs = require('fs');
let code = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

const targetHeader = `<header className="bg-white border-b border-[#EAE7E0] sticky top-0 z-40 px-4 sm:px-8 py-3 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">`;

const replacementHeader = `<header className="bg-white border-b border-[#EAE7E0] sticky top-0 z-40 px-4 sm:px-8 py-3 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Debug Push Notifications Simulator */}
          <div className="hidden lg:flex items-center gap-2 mr-4 bg-[#F9F8F4] p-1.5 rounded-lg border border-[#EAE7E0]">
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

code = code.replace(targetHeader, replacementHeader);

fs.writeFileSync('src/components/LoanOfficerPortal.tsx', code);
