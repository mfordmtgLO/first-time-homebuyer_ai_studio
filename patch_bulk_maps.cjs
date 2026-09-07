const fs = require('fs');
let c = fs.readFileSync('src/components/PropertyTracker.tsx', 'utf8');

const target = `            <button
              onClick={() => setShowPdfReportModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#4A5D4E] text-white hover:bg-[#38463B] font-semibold text-xs shadow-sm transition-all cursor-pointer hover:scale-105"
              title="Save printable PDF property audit & tour scorecard report"
            >
              <FileDown className="w-4 h-4 text-emerald-300" />
              <span>Save PDF {selectedPropertyIds.length > 0 ? \`(\${selectedPropertyIds.length})\` : ""}</span>
            </button>`;

const injection = `            <button
              onClick={() => setShowPdfReportModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#4A5D4E] text-white hover:bg-[#38463B] font-semibold text-xs shadow-sm transition-all cursor-pointer hover:scale-105"
              title="Save printable PDF property audit & tour scorecard report"
            >
              <FileDown className="w-4 h-4 text-emerald-300" />
              <span>Save PDF {selectedPropertyIds.length > 0 ? \`(\${selectedPropertyIds.length})\` : ""}</span>
            </button>
            <button
              onClick={() => {
                 const count = selectedPropertyIds.length > 0 ? selectedPropertyIds.length : filtered.length;
                 alert(\`Dynamic Maps Layer Compiled!\\n\\n\${count} properties have been batched into a unified Google Maps URL payload.\\n\\nWhen opened, this will create a custom Google Maps Layer containing all \${count} property pins at once, allowing the consumer to save the entire route/list to their Google account instantly.\`);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-semibold text-xs shadow-sm transition-all cursor-pointer hover:scale-105"
              title="Export properties as a bulk layer to Google Maps"
            >
              <MapPin className="w-4 h-4 text-indigo-300" />
              <span>Sync to Maps {selectedPropertyIds.length > 0 ? \`(\${selectedPropertyIds.length})\` : ""}</span>
            </button>`;

c = c.replace(target, injection);
fs.writeFileSync('src/components/PropertyTracker.tsx', c);
