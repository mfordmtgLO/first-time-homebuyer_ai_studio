const fs = require('fs');
let code = fs.readFileSync('src/components/TwilioSettingsModal.tsx', 'utf8');

const webhookInfoSection = `
          <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-indigo-500" />
              Incoming SMS Webhook URL (Required)
            </h4>
            <p className="text-[11px] text-indigo-800/80 leading-relaxed">
              To receive replies from your mobile device and sync them back to the buyer's property thread, paste this URL into your Twilio Phone Number configuration under <strong>"A MESSAGE COMES IN"</strong>.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white border border-indigo-200 rounded-xl px-3 py-2 text-[10px] text-indigo-900 font-mono overflow-x-auto whitespace-nowrap">
                https://ais-pre-h5e42vrshqrry7uiwwuhmv-427099073161.us-east5.run.app/api/twilio/webhook
              </code>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText("https://ais-pre-h5e42vrshqrry7uiwwuhmv-427099073161.us-east5.run.app/api/twilio/webhook");
                  alert("Webhook URL copied to clipboard!");
                }}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-xl shrink-0 cursor-pointer"
              >
                Copy
              </button>
            </div>
          </div>
`;

// Inject before `<div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EAE7E0] shadow-2xs space-y-4">`
code = code.replace(
  '<div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EAE7E0] shadow-2xs space-y-4">',
  webhookInfoSection + '\n          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EAE7E0] shadow-2xs space-y-4">'
);

fs.writeFileSync('src/components/TwilioSettingsModal.tsx', code);
