const fs = require('fs');
let code = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

// Imports
code = code.replace(
  'import { TwilioSettingsModal } from "./TwilioSettingsModal";',
  'import { TwilioSettingsModal } from "./TwilioSettingsModal";\nimport { SalesforceSettingsModal } from "./SalesforceSettingsModal";'
);

// State
code = code.replace(
  'const [showTwilioSettingsModal, setShowTwilioSettingsModal] = useState<boolean>(false);',
  'const [showTwilioSettingsModal, setShowTwilioSettingsModal] = useState<boolean>(false);\n  const [showSalesforceSettings, setShowSalesforceSettings] = useState<boolean>(false);'
);

// Header Buttons
const twilioBtnStr = '            {/* Twilio Carrier SMS Integration Button */}\n            <button\n              onClick={() => setShowTwilioSettingsModal(true)}\n              title="Configure Twilio API Credentials & Live Carrier SMS"\n              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"\n            >\n              <Phone className="w-3.5 h-3.5 text-emerald-300" />\n              <span>Twilio SMS API</span>\n            </button>';

const sfBtnStr = '            {/* Twilio Carrier SMS Integration Button */}\n            <button\n              onClick={() => setShowTwilioSettingsModal(true)}\n              title="Configure Twilio API Credentials & Live Carrier SMS"\n              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"\n            >\n              <Phone className="w-3.5 h-3.5 text-emerald-300" />\n              <span className="hidden sm:inline">Twilio SMS API</span>\n            </button>\n\n            {/* Salesforce CRM Integration Button */}\n            <button\n              onClick={() => setShowSalesforceSettings(true)}\n              title="Configure Salesforce Enterprise CRM Handoff"\n              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"\n            >\n              <Cloud className="w-3.5 h-3.5 text-blue-300" />\n              <span className="hidden sm:inline">Salesforce Sync</span>\n            </button>';

code = code.replace(twilioBtnStr, sfBtnStr);

// Modal
const twilioModalStr = '      {/* Twilio Carrier Credentials & Settings Modal */}\n      <TwilioSettingsModal\n        isOpen={showTwilioSettingsModal}\n        onClose={() => setShowTwilioSettingsModal(false)}\n      />';

const sfModalStr = twilioModalStr + '\n\n      {/* Salesforce Settings Modal */}\n      <SalesforceSettingsModal\n        isOpen={showSalesforceSettings}\n        onClose={() => setShowSalesforceSettings(false)}\n      />';

code = code.replace(twilioModalStr, sfModalStr);

fs.writeFileSync('src/components/LoanOfficerPortal.tsx', code);
