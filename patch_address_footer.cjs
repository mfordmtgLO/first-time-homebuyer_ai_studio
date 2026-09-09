const fs = require('fs');

// Patch App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
const targetAppString = `<p>
                    For complete licensing information, please click: <br className="hidden md:block"/>
                    <a href="http://www.nmlsconsumeraccess.org/EntityDetails.aspx/INDIVIDUAL/288455" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#4A5D4E]">Mike Ford NMLS #288455</a> | <a href="https://www.nmlsconsumeraccess.org/EntityDetails.aspx/COMPANY/173855" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#4A5D4E]">Company NMLS #173855</a>
                  </p>`;
const replacementAppString = `<p>
                    17850 Pilkington Rd | Lake Oswego, OR 97035
                  </p>
                  <p>
                    For complete licensing information, please click: <br className="hidden md:block"/>
                    <a href="http://www.nmlsconsumeraccess.org/EntityDetails.aspx/INDIVIDUAL/288455" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#4A5D4E]">Mike Ford NMLS #288455</a> | <a href="https://www.nmlsconsumeraccess.org/EntityDetails.aspx/COMPANY/173855" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#4A5D4E]">Company NMLS #173855</a>
                  </p>`;
appCode = appCode.replace(targetAppString, replacementAppString);
fs.writeFileSync('src/App.tsx', appCode);

// Patch LoginScreen.tsx
let loginCode = fs.readFileSync('src/components/LoginScreen.tsx', 'utf8');
const targetLoginString = `Mike Ford · Loan Officer · NMLS# 288455<br />`;
const replacementLoginString = `Mike Ford · Loan Officer · NMLS# 288455<br />
          17850 Pilkington Rd, Lake Oswego, OR 97035<br />`;
loginCode = loginCode.replace(targetLoginString, replacementLoginString);
fs.writeFileSync('src/components/LoginScreen.tsx', loginCode);

console.log("Address added to footers.");
