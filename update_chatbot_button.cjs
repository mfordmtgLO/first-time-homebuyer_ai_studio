const fs = require('fs');
const content = fs.readFileSync('src/components/LeadIntakeChatbot.tsx', 'utf8');

const targetStr = `              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isSubmittingQuery || !inputText.trim()}`;

const replacementStr = `              />
              {speechSupported && (
                <button
                  onClick={toggleListening}
                  title={isListening ? "Stop listening" : "Speak to answer"}
                  className={\`p-2.5 rounded-xl transition-all shadow-sm shrink-0 flex items-center justify-center cursor-pointer \${
                    isListening 
                      ? 'bg-rose-100 text-rose-600 animate-pulse border border-rose-200' 
                      : 'bg-[#FAF9F5] text-[#606C5D] border border-[#EAE7E0] hover:bg-[#EAE7E0]'
                  }\`}
                >
                  {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>
              )}
              <button
                onClick={() => handleSendMessage()}
                disabled={isSubmittingQuery || !inputText.trim() || isListening}`;

const newContent = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/LeadIntakeChatbot.tsx', newContent);
