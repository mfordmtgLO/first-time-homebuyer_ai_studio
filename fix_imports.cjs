const fs = require('fs');
let content = fs.readFileSync('src/components/RealtorCoBrandingHub.tsx', 'utf8');

if (!content.includes('MessageSquare,')) {
  content = content.replace('import {', 'import { MessageSquare, Mail,');
  fs.writeFileSync('src/components/RealtorCoBrandingHub.tsx', content);
  console.log("Imports fixed.");
}
