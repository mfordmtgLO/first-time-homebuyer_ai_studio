const fs = require('fs');
let code = fs.readFileSync('src/components/PropertyCard.tsx', 'utf8');

code = code.replace('import { PropertyNotesThread } from "./PropertyNotesThread";\\nimport { PropertyLinkedAds } from "./ai/PropertyLinkedAds";', 'import { PropertyNotesThread } from "./PropertyNotesThread";\nimport { PropertyLinkedAds } from "./ai/PropertyLinkedAds";');

fs.writeFileSync('src/components/PropertyCard.tsx', code, 'utf8');
console.log("Fixed import syntax in PropertyCard.tsx");
