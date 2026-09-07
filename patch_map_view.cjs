const fs = require('fs');
let c = fs.readFileSync('src/components/PropertyTracker.tsx', 'utf8');

const targetButtons = `<div className="flex items-center gap-1.5 p-1 bg-[#F9F8F4] rounded-xl border border-[#EAE7E0] overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setViewMode("map")}
              className={\`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all whitespace-nowrap \${
                viewMode === "map"
                  ? "bg-[#4A5D4E] text-white shadow-2xs font-bold"
                  : "text-[#606C5D] hover:text-[#2D362E]"
              }\`}
            >
              <Compass className="w-4 h-4 text-emerald-300" />
              <span>Google Maps Overlay & Radius Search</span>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-400 text-stone-900 ml-1">
                Readiness & Amenities
              </span>
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={\`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all whitespace-nowrap \${
                viewMode === "cards"
                  ? "bg-[#4A5D4E] text-white shadow-2xs font-bold"
                  : "text-[#606C5D] hover:text-[#2D362E]"
              }\`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>List & Scorecards</span>
            </button>
          </div>`;

c = c.replace('const [viewMode, setViewMode] = useState<"cards" | "map">("map");', 'const [viewMode, setViewMode] = useState<"cards" | "map">("cards");');

fs.writeFileSync('src/components/PropertyTracker.tsx', c);
