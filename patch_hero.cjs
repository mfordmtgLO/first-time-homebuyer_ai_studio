const fs = require('fs');
let c = fs.readFileSync('src/components/HeroWebsite.tsx', 'utf8');

const target = `            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">`;

const injection = `            {/* Ask GeoSphere Maps Search */}
            <div className="w-full bg-[#FAF9F5] border border-[#EAE7E0] p-4 sm:p-5 rounded-2xl shadow-sm relative overflow-hidden mt-2">
              <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="relative z-10 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-indigo-700 text-[11px] font-bold shadow-xs border border-indigo-100">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ask GeoSphere AI</span>
                  </div>
                </div>
                <form 
                  className="flex flex-col sm:flex-row gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert("GeoSphere AI Search Active!\\n\\nParsing your intent...\\nCross-referencing live MLS and Oregon Down Payment Assistance boundaries.\\n\\n(Please open the 'Property Map Tracker' tab to view results!)");
                  }}
                >
                  <input 
                    type="text" 
                    placeholder="e.g., Show me 3 bed homes under $450k near St. Johns that qualify for the DevNW 0% down grant..." 
                    className="flex-1 px-4 py-3 rounded-xl border border-indigo-200 bg-white text-sm text-[#2D362E] placeholder:text-[#9A9488] focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 shadow-xs" 
                  />
                  <button 
                    type="submit" 
                    className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 whitespace-nowrap text-sm"
                  >
                    <Search className="w-4 h-4" /> Ask Maps
                  </button>
                </form>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2 mt-4">`;

c = c.replace(target, injection);
fs.writeFileSync('src/components/HeroWebsite.tsx', c);
