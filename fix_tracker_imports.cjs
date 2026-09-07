const fs = require('fs');
let c = fs.readFileSync('src/components/PropertyTracker.tsx', 'utf8');

if (!c.includes('Flame')) {
    c = c.replace('  MapPin,', '  MapPin,\\n  Flame,\\n  BellRing,');
}

fs.writeFileSync('src/components/PropertyTracker.tsx', c);
