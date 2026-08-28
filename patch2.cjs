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
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#D4A373] hover:bg-[#C18C5D] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            <FileCheck className="w-4 h-4 text-white" />
            <span>Receive My Completed Blueprint NOW</span>
          </button>
          
          <button
            type="button"
            onClick={() => onRequestListings?.()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2D362E] hover:bg-[#1A201A] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            <Building className="w-4 h-4 text-[#D4A373]" />
            <span>Send Low/No Down Homes in My Area</span>
          </button>
        </div>`
);

fs.writeFileSync('src/components/Step4AIScenarioSummary.tsx', code);
