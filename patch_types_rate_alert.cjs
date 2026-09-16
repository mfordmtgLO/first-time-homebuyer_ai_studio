const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

// Add rateAlertEnabled to PropertyListing
if (code.includes('export interface PropertyListing {') && !code.includes('rateAlertEnabled?: boolean;')) {
  code = code.replace(
    '  isBookmarked?: boolean;\n',
    '  isBookmarked?: boolean;\n  rateAlertEnabled?: boolean;\n'
  );
  fs.writeFileSync('src/types.ts', code);
  console.log("Added rateAlertEnabled to PropertyListing in src/types.ts");
}
