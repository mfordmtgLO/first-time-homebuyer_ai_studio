const fs = require('fs');
let c = fs.readFileSync('src/components/PropertyCard.tsx', 'utf8');

const target = `            href={getZillowUrl(property)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="py-2 px-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-900 text-xs font-semibold flex items-center justify-center gap-1 transition-colors border border-blue-200"
            title={\`Open \${property.address} on Zillow.com in a new tab\`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Zillow</span>
          </a>`;

const injection = `            href={getZillowUrl(property)}
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
            title="Save this home to your personal Google Maps account"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Maps Sync</span>
          </a>`;

c = c.replace(target, injection);
fs.writeFileSync('src/components/PropertyCard.tsx', c);
