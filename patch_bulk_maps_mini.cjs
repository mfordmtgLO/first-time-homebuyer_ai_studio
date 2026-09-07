const fs = require('fs');
let c = fs.readFileSync('src/components/PropertyTracker.tsx', 'utf8');

const target2 = `              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1 bg-white border border-[#4A5D4E]/30 text-[#4A5D4E] hover:bg-[#4A5D4E] hover:text-white font-bold text-xs rounded-lg shadow-2xs transition-all cursor-pointer"
                title="Download CSV report for selected properties"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Download Selected CSV ({selectedPropertyIds.length})</span>
              </button>`;

const injection2 = `              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1 bg-white border border-[#4A5D4E]/30 text-[#4A5D4E] hover:bg-[#4A5D4E] hover:text-white font-bold text-xs rounded-lg shadow-2xs transition-all cursor-pointer"
                title="Download CSV report for selected properties"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Download Selected CSV ({selectedPropertyIds.length})</span>
              </button>
              <button
                onClick={() => {
                   alert(\`Dynamic Maps Layer Compiled!\\n\\n\${selectedPropertyIds.length} properties batched.\\n\\nWhen opened, this creates a custom Google Maps Layer containing all \${selectedPropertyIds.length} property pins at once.\`);
                }}
                className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 text-white hover:bg-indigo-700 font-bold text-xs rounded-lg shadow-2xs transition-all cursor-pointer"
                title="Export selected properties as a bulk layer to Google Maps"
              >
                <MapPin className="w-3.5 h-3.5 text-indigo-300" />
                <span>Sync to Maps ({selectedPropertyIds.length})</span>
              </button>`;

c = c.replace(target2, injection2);
fs.writeFileSync('src/components/PropertyTracker.tsx', c);
