const fs = require('fs');
const file = 'src/components/CuratedHomesSection.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Imports
if (!content.includes('Star,')) {
  content = content.replace(/X,/, 'X,\n  Star,');
}
if (!content.includes('AffordabilityComparisonModal')) {
  content = content.replace(
    /import \{ ScreeningDisclaimerBanner \} from "\.\/ScreeningDisclaimerBanner";/,
    `import { ScreeningDisclaimerBanner } from "./ScreeningDisclaimerBanner";\nimport { AffordabilityComparisonModal } from "./AffordabilityComparisonModal";`
  );
}

// 2. State
if (!content.includes('const [favorites, setFavorites] = useState<string[]>')) {
  content = content.replace(
    /const \[displayCount, setDisplayCount\] = useState<number>\(12\);/,
    `const [displayCount, setDisplayCount] = useState<number>(12);\n  const [favorites, setFavorites] = useState<string[]>([]);\n  const [showComparison, setShowComparison] = useState(false);`
  );
}

// 3. Star Button on Card (Inside the map)
// The card has: <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 flex-wrap">
const starButtonHtml = `
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFavorites(prev => 
                          prev.includes(property.id) 
                            ? prev.filter(id => id !== property.id)
                            : [...prev, property.id]
                        );
                      }}
                      className="absolute top-2.5 right-2.5 z-10 p-2 rounded-xl bg-white/90 shadow-md hover:bg-white transition-colors border border-stone-200"
                    >
                      <Star className={\`w-4 h-4 \${favorites.includes(property.id) ? "fill-[#C18C5D] text-[#C18C5D]" : "text-stone-400"}\`} />
                    </button>
`;

if (!content.includes('favorites.includes(property.id)')) {
  content = content.replace(
    /<div className="absolute top-2\.5 left-2\.5 right-2\.5 flex items-center justify-between gap-1\.5 flex-wrap">/g,
    starButtonHtml + `\n                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">`
  );
  
  // also handle the clean architectural header if hasPhoto is false
  const cleanHeaderStar = `
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setFavorites(prev => 
                              prev.includes(property.id) 
                                ? prev.filter(id => id !== property.id)
                                : [...prev, property.id]
                            );
                          }}
                          className="p-1.5 rounded-lg hover:bg-stone-200 transition-colors shrink-0"
                        >
                          <Star className={\`w-4 h-4 \${favorites.includes(property.id) ? "fill-[#C18C5D] text-[#C18C5D]" : "text-stone-400"}\`} />
                        </button>
                      </div>
                      
                      {property.scorecard ? (
  `;
  content = content.replace(
    /<\/div>\s+\{property\.scorecard \? \(/,
    cleanHeaderStar
  );
}

// 4. Floating Action Bar and Modal
const floatingBarHtml = `
      {favorites.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-fade-in-up">
          <div className="bg-[#2D362E] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 border border-[#4A5D4E]/30">
            <span className="text-sm font-medium">
              <span className="font-bold text-[#C18C5D]">{favorites.length}</span> properties selected
            </span>
            <div className="w-px h-4 bg-white/20" />
            <button
              onClick={() => setShowComparison(true)}
              className="text-sm font-bold bg-[#C18C5D] hover:bg-[#b07d50] px-4 py-1.5 rounded-full transition-colors text-white"
            >
              Compare Affordability
            </button>
          </div>
        </div>
      )}

      {showComparison && (
        <AffordabilityComparisonModal 
          properties={publishedHomes.filter(p => favorites.includes(p.id))}
          onClose={() => setShowComparison(false)}
        />
      )}
    </section>
`;

if (!content.includes('favorites.length > 0 && (')) {
  content = content.replace(
    /<\/section>/,
    floatingBarHtml
  );
}

fs.writeFileSync(file, content);
