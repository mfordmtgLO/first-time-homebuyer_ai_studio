const fs = require('fs');
let c = fs.readFileSync('src/components/PropertyTracker.tsx', 'utf8');

c = c.replace(/agent\.name/g, "'Your Co-branded Agent'");
c = c.replace(/agent\.phone/g, "'555-0199'");
c = c.replace(/clientName/g, "'The Client'");

fs.writeFileSync('src/components/PropertyTracker.tsx', c);
