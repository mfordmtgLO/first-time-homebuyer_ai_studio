const fs = require('fs');
let code = fs.readFileSync('src/components/PropertyMapOverlay.tsx', 'utf8');

const targetLegendUI = `            {/* Main Interactive Map & Synchronized Properties Split View */}`;

const replacementLegendUI = `
            {/* Map Legend (Bottom Right / Left) */}
            <div className="absolute bottom-6 left-6 z-20 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-[#EAE7E0] text-[10px] space-y-2 pointer-events-auto max-w-[200px]">
               <div className="font-bold font-serif text-[#2D362E] flex items-center gap-1.5 border-b border-[#EAE7E0] pb-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#4A5D4E]" />
                  <span>Map Legend</span>
               </div>
               
               <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-emerald-600 border border-white shadow-sm flex-shrink-0"></div>
                     <span className="text-[#606C5D] font-medium leading-tight">High Readiness (Score &ge; 80)</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-amber-500 border border-white shadow-sm flex-shrink-0"></div>
                     <span className="text-[#606C5D] font-medium leading-tight">Medium Readiness (Score 60-79)</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full bg-rose-500 border border-white shadow-sm flex-shrink-0"></div>
                     <span className="text-[#606C5D] font-medium leading-tight">Needs Work (Score &lt; 60)</span>
                  </div>
               </div>

               <div className="space-y-1.5 pt-1.5 border-t border-[#EAE7E0]">
                  <div className="flex items-center gap-2">
                     <div className="w-4 h-4 rounded-full bg-indigo-600 border-2 border-white shadow-sm flex items-center justify-center text-[8px] font-bold text-white flex-shrink-0">5</div>
                     <span className="text-[#606C5D] font-medium leading-tight">Property Cluster (Density)</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className="flex items-center justify-center w-4 h-4 bg-white rounded-full shadow-sm border border-rose-100 flex-shrink-0">
                       <Flame className="w-2.5 h-2.5 text-rose-500 fill-rose-500" />
                     </div>
                     <span className="text-[#606C5D] font-medium leading-tight">1-Click Favorites</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="px-1 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[7px] font-bold border border-emerald-200">RENTCAST</span>
                     <span className="text-[#606C5D] font-medium leading-tight">Live Geo-Synced Data</span>
                  </div>
               </div>
            </div>

            {/* Main Interactive Map & Synchronized Properties Split View */}`;

code = code.replace(targetLegendUI, replacementLegendUI);

fs.writeFileSync('src/components/PropertyMapOverlay.tsx', code);
