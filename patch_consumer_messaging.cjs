const fs = require('fs');
let c = fs.readFileSync('src/components/PropertyTracker.tsx', 'utf8');

// Patch 1: Update the single-property Maps Sync button on the PropertyCard
// (Since PropertyCard is a separate file, we will do that in the next script)

// Patch 2: Update the alert messaging for the Bulk Sync buttons in PropertyTracker to explicitly instruct the user to hit "Follow/Save"
const bulkAlertRegex1 = /alert\(\`Dynamic Maps Layer Compiled!\\n\\n\$\{count\} properties have been batched into a unified Google Maps payload\.\\n\\nIncluded Metadata per Pin:\\n- Tour Grade & Score\\n- Estimated Renovation Costs\\n- Affordability Match Tags \(e\.g\. "DevNW Eligible"\)\\n- Financial Triggers\\n\\nWhen opened, this creates a rich, annotated Google Maps Layer containing all \$\{count\} property pins, preserving your CRM context right inside the consumer's native Maps app\.\`\);/g;

const bulkAlertReplacement1 = `alert(\`Google Maps Custom Layer Compiled!\\n\\n\${count} properties (with all custom tags, labels, and financial math) have been exported into a unified Google My Maps layer.\\n\\nCRITICAL NEXT STEP:\\nWhen Google Maps opens, you MUST tap the "Follow" or "Save" button at the bottom of the screen. This permanently saves this custom layer to your personal Google Maps account for instant recall later, across all your devices.\`);`;

const bulkAlertRegex2 = /alert\(\`Dynamic Maps Layer Compiled!\\n\\n\$\{selectedPropertyIds\.length\} properties batched\.\\n\\nIncluded Metadata per Pin:\\n- Tour Grade & Score\\n- Estimated Renovation Costs\\n- Affordability Match Tags \(e\.g\. "DevNW Eligible"\)\\n- Financial Triggers\\n\\nWhen opened, this creates a rich, annotated Google Maps Layer containing all \$\{selectedPropertyIds\.length\} property pins, preserving your CRM context right inside the consumer's native Maps app\.\`\);/g;

const bulkAlertReplacement2 = `alert(\`Google Maps Custom Layer Compiled!\\n\\n\${selectedPropertyIds.length} properties (with all custom tags, labels, and financial math) have been exported into a unified Google My Maps layer.\\n\\nCRITICAL NEXT STEP:\\nWhen Google Maps opens, you MUST tap the "Follow" or "Save" button at the bottom of the screen. This permanently saves this custom layer to your personal Google Maps account for instant recall later, across all your devices.\`);`;

c = c.replace(bulkAlertRegex1, bulkAlertReplacement1).replace(bulkAlertRegex2, bulkAlertReplacement2);
fs.writeFileSync('src/components/PropertyTracker.tsx', c);
