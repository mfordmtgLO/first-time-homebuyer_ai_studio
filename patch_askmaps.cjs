const fs = require('fs');
let c = fs.readFileSync('src/components/PropertyMapOverlay.tsx', 'utf8');

const regex = /<h3 className="text-xl sm:text-2xl font-serif font-bold text-\[#2D362E\] flex items-center gap-2">[\s\S]*?<span>Homebuying Readiness Radius Explorer<\/span>[\s\S]*?<\/h3>/;

const newHeader = `<h3 className="text-xl sm:text-2xl font-serif font-bold text-[#2D362E] flex items-center gap-2">
            <span>Homebuying Readiness Radius Explorer</span>
          </h3>
          <div className="mt-4 p-3 bg-white border border-[#EAE7E0] rounded-xl shadow-sm">
             <div className="flex items-center justify-between gap-3 mb-2">
               <div className="flex items-center gap-2">
                 <Sparkles className="w-4 h-4 text-indigo-500" />
                 <span className="text-xs font-bold text-[#2D362E]">Ask GeoSphere AI</span>
               </div>
               <span className="text-[10px] text-white bg-indigo-500 px-2 py-0.5 rounded-full font-bold">New</span>
             </div>
             <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); }}>
               <input type="text" placeholder="e.g., Show me homes under $450k near St. Johns that qualify for the DevNW 0% down grant..." className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-400" />
               <button type="button" onClick={() => alert("GeoSphere AI Search logic would trigger here. Prompt parsed, bounding box applied, shapefile grants cross-referenced, and map coordinates snapped.")} className="px-4 py-2 bg-[#4A5D4E] hover:bg-[#38463B] text-white rounded-lg text-sm font-bold transition-colors whitespace-nowrap">
                 Search Map
               </button>
             </form>
          </div>`;

c = c.replace(regex, newHeader);
fs.writeFileSync('src/components/PropertyMapOverlay.tsx', c);
