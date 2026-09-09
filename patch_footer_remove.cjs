const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetFooter = `              <div className="text-center md:text-right text-[11px] text-[#9A9488]">
                <span>Powered by Gemini 3.7 Flash & Natural Tones</span>
                <div className="text-[#9A9488]/80 mt-0.5 mb-2">Equal Housing Opportunity Awareness</div>
                <button 
                  onClick={() => window.location.href = "/lo-login"} 
                  className="hover:text-[#4A5D4E] transition-colors underline decoration-dotted underline-offset-2"
                >
                  Loan Officer Login
                </button>
              </div>`;

const replacementFooter = `              <div className="text-center md:text-right text-[11px] text-[#9A9488]">
                <span>Powered by Gemini 3.7 Flash & Natural Tones</span>
                <div className="text-[#9A9488]/80 mt-0.5">Equal Housing Opportunity Awareness</div>
              </div>`;

if (code.includes(targetFooter)) {
  code = code.replace(targetFooter, replacementFooter);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Footer login removed.");
} else {
  console.log("Could not find target footer links.");
}
