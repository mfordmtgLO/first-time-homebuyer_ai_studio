const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetFooterLinks = `              <div className="flex gap-6">
                <a href="#" className="hover:text-[#4A5D4E] dark:hover:text-slate-300 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-[#4A5D4E] dark:hover:text-slate-300 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-[#4A5D4E] dark:hover:text-slate-300 transition-colors">Fair Housing</a>
              </div>`;

const replacementFooterLinks = `              <div className="flex gap-6">
                <a href="#" className="hover:text-[#4A5D4E] dark:hover:text-slate-300 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-[#4A5D4E] dark:hover:text-slate-300 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-[#4A5D4E] dark:hover:text-slate-300 transition-colors">Fair Housing</a>
                <button 
                  onClick={() => window.location.href = "/lo-login"} 
                  className="hover:text-[#4A5D4E] dark:hover:text-slate-300 transition-colors"
                >
                  Partner Login
                </button>
              </div>`;

if (code.includes(targetFooterLinks)) {
  code = code.replace(targetFooterLinks, replacementFooterLinks);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Footer patched.");
} else {
  console.log("Could not find target footer links.");
}
