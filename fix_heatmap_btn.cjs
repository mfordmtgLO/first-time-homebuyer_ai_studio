const fs = require('fs');
let content = fs.readFileSync('src/components/PropertyMapOverlay.tsx', 'utf8');

const targetStr = `            <span className="text-base font-serif font-bold text-[#C18C5D]">
              {radiusStats.totalCount > 0 ? \`\${radiusStats.avgScore} / 100\` : "—"}
            </span>
          </div>`;

const replacementStr = `            <span className="text-base font-serif font-bold text-[#C18C5D]">
              {radiusStats.totalCount > 0 ? \`\${radiusStats.avgScore} / 100\` : "—"}
            </span>
          </div>

          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={\`px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 \${
              showHeatmap ? "bg-rose-100 text-rose-700 border-rose-200" : "bg-white text-[#606C5D] border-[#EAE7E0] hover:bg-[#FAF9F5]"
            } border shadow-2xs\`}
          >
            <Flame className="w-3.5 h-3.5" />
            Geosphere Heatmap
          </button>`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('src/components/PropertyMapOverlay.tsx', content);
