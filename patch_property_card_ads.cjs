const fs = require('fs');
let code = fs.readFileSync('src/components/PropertyCard.tsx', 'utf8');

// Add Megaphone to lucide-react imports
if (!code.includes("Megaphone")) {
  code = code.replace("Calculator", "Calculator,\n  Megaphone");
}

const actionButtonsInsert = `
        <div className="flex items-center gap-1 sm:gap-2 mt-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              alert("Data synced to Vantage AI Ads Engine. The Marketing Team has been notified!");
              // In production, this would trigger a webhook to the Ads Engine or open a modal.
            }}
            className="flex-1 py-2 px-1 sm:px-2.5 rounded-xl bg-pink-50 dark:bg-pink-900/30 hover:bg-pink-100 text-pink-700 dark:text-pink-400 hover:text-pink-900 text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-colors border border-pink-200 shadow-sm"
            title="Send property data to Vantage AI Ads Engine to generate targeted video ads"
          >
            <Megaphone className="w-3 sm:w-3.5 h-3 sm:h-3.5 shrink-0" />
            <span className="truncate">Send to Ads Engine</span>
          </button>
        </div>
`;

code = code.replace('        </div>\n      </div>\n    </div>\n  );\n};\n', '        </div>\n' + actionButtonsInsert + '      </div>\n    </div>\n  );\n};\n');

fs.writeFileSync('src/components/PropertyCard.tsx', code, 'utf8');
console.log("Updated PropertyCard with Send to Ads Engine button");
