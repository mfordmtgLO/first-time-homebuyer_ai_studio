const fs = require('fs');
let c = fs.readFileSync('src/components/PropertyCard.tsx', 'utf8');

// Add Navigation icon
c = c.replace('import {\n  Star,', 'import {\n  Navigation,\n  Star,');

// Modify the ACTION BUTTONS FOOTER
const targetFooter = `{/* ACTION BUTTONS FOOTER */}
      <div className="p-3 bg-[#F1EFE9]/60 border-t border-[#EAE7E0] space-y-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenScorecard(property)}
            className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-[#F1EFE9] text-[#2D362E] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-[#EAE7E0] cursor-pointer shadow-2xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#4A5D4E]" />
            <span>{property.scorecard ? "Scorecard" : "Tour Scorecard"}</span>
          </button>

          <button
            type="button"
            onClick={() => onAskAiAboutProperty(property)}
            className="py-2 px-2.5 rounded-xl bg-[#4A5D4E]/10 hover:bg-[#4A5D4E]/20 text-[#4A5D4E] text-xs font-semibold flex items-center justify-center gap-1 transition-colors border border-[#4A5D4E]/20 cursor-pointer"
            title="Generate offer strategy with Gemini"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C18C5D]" />
            <span className="hidden sm:inline">Offer AI</span>
          </button>

          <a
            href={getZillowUrl(property)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="py-2 px-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-900 text-xs font-semibold flex items-center justify-center gap-1 transition-colors border border-blue-200"
            title={\`Open \${property.address} on Zillow.com in a new tab\`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Zillow</span>
          </a>

          <a
            href={\`https://www.google.com/maps/search/?api=1&query=\${property.lat},\${property.lng}\`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="py-2 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-900 text-xs font-semibold flex items-center justify-center gap-1 transition-colors border border-emerald-200"
            title="Save this home to your personal Google Maps account. Remember to click 'Save' in Google Maps!"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Maps Sync</span>
          </a>

          <button
            type="button"
            onClick={(e) => onToggleCompare(property.id, e)}
            className={\`p-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer \${
              isSelectedForCompare
                ? "bg-[#C18C5D] text-white border-[#C18C5D]"
                : "bg-white text-[#606C5D] border-[#EAE7E0] hover:text-[#2D362E]"
            }\`}
            title={isSelectedForCompare ? "Remove from comparison" : "Add to comparison"}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
        </div>`;

const injectionFooter = `{/* ACTION BUTTONS FOOTER */}
      <div className="p-3 bg-[#F1EFE9]/60 border-t border-[#EAE7E0] space-y-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenScorecard(property)}
            className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-[#F1EFE9] text-[#2D362E] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-[#EAE7E0] cursor-pointer shadow-2xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#4A5D4E]" />
            <span>{property.scorecard ? "Scorecard" : "Tour Scorecard"}</span>
          </button>

          <button
            type="button"
            onClick={() => onAskAiAboutProperty(property)}
            className="py-2 px-3 rounded-xl bg-[#4A5D4E]/10 hover:bg-[#4A5D4E]/20 text-[#4A5D4E] text-xs font-semibold flex items-center justify-center gap-1 transition-colors border border-[#4A5D4E]/20 cursor-pointer"
            title="Generate offer strategy with Gemini"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C18C5D]" />
            <span className="hidden sm:inline">Offer AI</span>
          </button>

          <button
            type="button"
            onClick={(e) => onToggleCompare(property.id, e)}
            className={\`p-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer \${
              isSelectedForCompare
                ? "bg-[#C18C5D] text-white border-[#C18C5D]"
                : "bg-white text-[#606C5D] border-[#EAE7E0] hover:text-[#2D362E]"
            }\`}
            title={isSelectedForCompare ? "Remove from comparison" : "Add to comparison"}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={\`https://www.google.com/maps/dir/?api=1&destination=\${encodeURIComponent(property.address + ', ' + property.city + ', ' + property.state + ' ' + property.zip)}\`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-1 py-2 px-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-900 text-xs font-semibold flex items-center justify-center gap-1 transition-colors border border-indigo-200"
            title="Get driving directions to this property via Google Maps"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Directions</span>
          </a>

          <a
            href={\`https://www.google.com/maps/search/?api=1&query=\${property.lat},\${property.lng}\`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-1 py-2 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-900 text-xs font-semibold flex items-center justify-center gap-1 transition-colors border border-emerald-200"
            title="Save this home to your personal Google Maps account. Remember to click 'Save' in Google Maps!"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Maps Sync</span>
          </a>

          <a
            href={getZillowUrl(property)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="py-2 px-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-900 text-xs font-semibold flex items-center justify-center gap-1 transition-colors border border-blue-200"
            title={\`Open \${property.address} on Zillow.com in a new tab\`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Zillow</span>
          </a>
        </div>`;

c = c.replace(targetFooter, injectionFooter);
fs.writeFileSync('src/components/PropertyCard.tsx', c);
