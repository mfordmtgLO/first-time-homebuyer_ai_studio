const fs = require('fs');
let code = fs.readFileSync('src/components/PropertyNotesThread.tsx', 'utf8');

// 1. Add states
const stateInjection = `  const [isQuestionMode, setIsQuestionMode] = useState(false);
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [optInPhone, setOptInPhone] = useState("");`;

code = code.replace('  const [isQuestionMode, setIsQuestionMode] = useState(false);', stateInjection);

// 2. Add optIn tracking to the handleSendMessage payload if we want it, but the prompt just says:
// "can you give short instructions or explanation for website notes creator that notes Q&A are not a text message and check here to authorize if you are ok receiving Property Note reply text message alerts"
// I will just add the visual UI checkbox. If they check it, we can store it in the db payload.
code = code.replace(
  'questionCategory: explicitCategory || selectedCategory,',
  'questionCategory: explicitCategory || selectedCategory,\n        tcpaSmsOptIn: smsOptIn,\n        tcpaPhoneProvided: smsOptIn ? optInPhone : undefined,'
);

// 3. Add the UI block below the input button
const tcpaUI = `            {isQuestionMode && (
              <div className="space-y-2 mt-1">
                <p className="text-[10px] text-amber-800 flex items-start gap-1.5 px-1 bg-amber-50 p-2 rounded-lg border border-amber-200">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span className="leading-tight">
                    <strong>Note:</strong> Your questions are securely logged on this web portal, not sent as standard text messages to the Loan Officer. They will see it in their priority dashboard.
                  </span>
                </p>
                <div className="bg-[#F1EFE9] p-2.5 rounded-xl border border-[#EAE7E0] space-y-2">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="mt-0.5 rounded border-stone-300 text-[#4A5D4E] focus:ring-[#4A5D4E]"
                      checked={smsOptIn}
                      onChange={(e) => setSmsOptIn(e.target.checked)}
                    />
                    <span className="text-[10px] text-[#2D362E] font-medium leading-snug">
                      I authorize {loName} to send an SMS text message alert to my mobile phone when they reply to this specific question. (Standard msg & data rates apply).
                    </span>
                  </label>
                  {smsOptIn && (
                    <input 
                      type="tel"
                      placeholder="Mobile Phone (e.g., 503-555-0199)"
                      value={optInPhone}
                      onChange={(e) => setOptInPhone(e.target.value)}
                      className="w-full bg-white border border-[#EAE7E0] rounded-lg px-2.5 py-1.5 text-xs text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
                      required
                    />
                  )}
                </div>
              </div>
            )}`;

code = code.replace(
  `            {isQuestionMode && (
              <p className="text-[10px] text-amber-800 flex items-center gap-1 px-1">
                <AlertCircle className="w-3 h-3 text-amber-600" />
                <span>This question will be logged as a pending action item in {loName}'s LO dashboard.</span>
              </p>
            )}`,
  tcpaUI
);

fs.writeFileSync('src/components/PropertyNotesThread.tsx', code);
