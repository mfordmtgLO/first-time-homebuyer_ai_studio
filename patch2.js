const fs = require('fs');
let code = fs.readFileSync('src/components/Step4AIScenarioSummary.tsx', 'utf8');

code = code.replace(
  '<RotateCcw className="w-3.5 h-3.5 text-[#D4A373]" />\n            <span>Return to Start / Home</span>\n          </button>\n        </div>',
  `<RotateCcw className="w-3.5 h-3.5 text-[#D4A373]" />
            <span>Return to Start / Home</span>
          </button>
          
          <button
            type="button"
            onClick={() => onRequestBlueprint?.()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            <FileCheck className="w-4 h-4 text-amber-200" />
            <span>Receive My Completed Blueprint NOW</span>
          </button>
          
          <button
            type="button"
            onClick={() => onRequestListings?.()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            <Building className="w-4 h-4 text-indigo-200" />
            <span>Send Low/No Down Homes in My Area</span>
          </button>
        </div>`
);

fs.writeFileSync('src/components/Step4AIScenarioSummary.tsx', code);
