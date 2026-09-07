const fs = require('fs');
let c = fs.readFileSync('src/components/PropertyCard.tsx', 'utf8');

const targetSingle = `title="Save this home to your personal Google Maps account"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Maps Sync</span>
          </a>`;

const injectionSingle = `title="Save this home to your personal Google Maps account. Remember to click 'Save' in Google Maps!"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Maps Sync</span>
          </a>`;

c = c.replace(targetSingle, injectionSingle);
fs.writeFileSync('src/components/PropertyCard.tsx', c);
