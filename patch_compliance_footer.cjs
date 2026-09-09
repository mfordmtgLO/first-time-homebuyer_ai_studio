const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetFooter = `<footer className="bg-[#F1EFE9] dark:bg-slate-900 border-t border-[#EAE7E0] dark:border-slate-800 py-10 px-4 sm:px-6 lg:px-8 mt-16 text-xs text-[#606C5D] dark:text-slate-400 transition-colors duration-200">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleNavigate("hero", "website")}
                  className="flex items-center gap-2.5 text-left group focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#606C5D] flex items-center justify-center font-bold text-white shadow-sm group-hover:scale-105 transition-transform">
                    <Compass className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="font-bold text-[#2D362E] dark:text-slate-200 text-sm">
                      First-Time Homebuyer Roadmap
                    </span>
                    <p className="text-[11px] text-[#9A9488] dark:text-slate-500">
                      Buy your first home with clarity and total confidence.
                    </p>
                  </div>
                </button>
              </div>

              <div className="flex gap-6">
                <a href="#" className="hover:text-[#4A5D4E] dark:hover:text-slate-300 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-[#4A5D4E] dark:hover:text-slate-300 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-[#4A5D4E] dark:hover:text-slate-300 transition-colors">Fair Housing</a>
              </div>

              <div className="text-center md:text-right text-[11px] text-[#9A9488]">
                <span>Powered by Gemini 3.7 Flash & Natural Tones</span>
                <div className="text-[#9A9488]/80 mt-0.5">Equal Housing Opportunity Awareness</div>
              </div>
            </div>
          </footer>`;

const replacementFooter = `<footer className="bg-[#F1EFE9] dark:bg-slate-900 border-t border-[#EAE7E0] dark:border-slate-800 py-12 px-4 sm:px-6 lg:px-8 mt-16 text-xs text-[#606C5D] dark:text-slate-400 transition-colors duration-200">
            <div className="max-w-7xl mx-auto flex flex-col gap-10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleNavigate("hero", "website")}
                    className="flex items-center gap-2.5 text-left group focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#2D362E] flex items-center justify-center font-bold text-white shadow-sm group-hover:scale-105 transition-transform">
                      <Compass className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <span className="font-bold text-[#2D362E] dark:text-slate-200 text-sm">
                        Cornerstone First Mortgage
                      </span>
                      <p className="text-[11px] text-[#9A9488] dark:text-slate-500">
                        Mike Ford · Loan Officer · NMLS# 288455
                      </p>
                    </div>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-medium">
                  <a href="#" className="hover:text-[#4A5D4E] dark:hover:text-slate-300 transition-colors">Privacy Policy</a>
                  <a href="#" className="hover:text-[#4A5D4E] dark:hover:text-slate-300 transition-colors">Terms of Service</a>
                  <a href="https://www.nmlsconsumeraccess.org/" target="_blank" rel="noopener noreferrer" className="hover:text-[#4A5D4E] dark:hover:text-slate-300 transition-colors">NMLS Consumer Access</a>
                </div>
              </div>

              <div className="border-t border-[#EAE7E0] dark:border-slate-800 pt-8 flex flex-col md:flex-row gap-8 justify-between">
                <div className="space-y-4 max-w-2xl text-[10px] leading-relaxed text-[#9A9488] dark:text-slate-500">
                  <p>
                    For complete licensing information, please click: <br className="hidden md:block"/>
                    <a href="http://www.nmlsconsumeraccess.org/EntityDetails.aspx/INDIVIDUAL/288455" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#4A5D4E]">Mike Ford NMLS #288455</a> | <a href="https://www.nmlsconsumeraccess.org/EntityDetails.aspx/COMPANY/173855" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#4A5D4E]">Company NMLS #173855</a>
                  </p>
                  <p>
                    Cornerstone First Mortgage, LLC is an Equal Housing Opportunity Lender. 
                    <br />
                    This is not an offer to enter into an agreement. Not all customers will qualify. Information, rates and programs are subject to change without notice. All products are subject to credit and property approval. Other restrictions and limitations may apply.
                  </p>
                </div>

                <div className="flex flex-col md:items-end gap-2 text-[10px] text-[#9A9488] dark:text-slate-500">
                  <div className="flex items-center gap-2 mb-2">
                    <img src="https://www.hud.gov/sites/dfiles/FHEO/images/eho.jpg" alt="Equal Housing Opportunity" className="w-8 h-8 object-contain mix-blend-multiply dark:mix-blend-screen opacity-70" />
                  </div>
                  <p>© {new Date().getFullYear()} Cornerstone First Mortgage, LLC.</p>
                  <p>All Rights Reserved. NMLS ID #173855</p>
                  <p className="mt-2 text-[#C18C5D] font-medium">Powered by Gemini 3.7 Flash</p>
                </div>
              </div>
            </div>
          </footer>`;

if (code.includes('footer className="bg-[#F1EFE9] dark:bg-slate-900 border-t')) {
  // We need to use regex because the target string might have been modified slightly
  const footerStart = code.indexOf('<footer className="bg-[#F1EFE9] dark:bg-slate-900 border-t');
  const footerEnd = code.indexOf('</footer>', footerStart) + '</footer>'.length;
  
  if (footerStart !== -1 && footerEnd !== -1) {
    const oldFooter = code.substring(footerStart, footerEnd);
    code = code.replace(oldFooter, replacementFooter);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Footer updated with compliance info.");
  } else {
    console.log("Footer tags not found properly.");
  }
} else {
  console.log("Could not find footer block.");
}
