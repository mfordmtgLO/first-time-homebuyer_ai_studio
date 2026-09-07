const fs = require('fs');

// Patch 1: Single Property Card URL with custom labels/tags
let c1 = fs.readFileSync('src/components/PropertyCard.tsx', 'utf8');
const t1 = `href={\`https://www.google.com/maps/search/?api=1&query=\${property.lat},\${property.lng}\`}`;
// Let's add more context to the Maps intent if possible. Google Maps Search intent doesn't natively take arbitrary labels in the standard query unless it's a 'q' parameter with the name. 
// For a place, we can pass the address, and the user can see it. But to pass 'tags', it's tricky in a plain URL. 
// However, since this is a simulation/prototype, we can simulate the "Sync" action by showing an alert of what data is being passed in the payload.
