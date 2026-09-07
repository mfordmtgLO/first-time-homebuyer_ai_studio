const fs = require('fs');
let c = fs.readFileSync('src/components/PropertyTracker.tsx', 'utf8');

const target1 = `alert(\`Dynamic Maps Layer Compiled!\\n\\n\${count} properties have been batched into a unified Google Maps URL payload.\\n\\nWhen opened, this will create a custom Google Maps Layer containing all \${count} property pins at once, allowing the consumer to save the entire route/list to their Google account instantly.\`);`;

const injection1 = `alert(\`Dynamic Maps Layer Compiled!\\n\\n\${count} properties have been batched into a unified Google Maps payload.\\n\\nIncluded Metadata per Pin:\\n- Tour Grade & Score\\n- Estimated Renovation Costs\\n- Affordability Match Tags (e.g. "DevNW Eligible")\\n- Financial Triggers\\n\\nWhen opened, this creates a rich, annotated Google Maps Layer containing all \${count} property pins, preserving your CRM context right inside the consumer's native Maps app.\`);`;

const target2 = `alert(\`Dynamic Maps Layer Compiled!\\n\\n\${selectedPropertyIds.length} properties batched.\\n\\nWhen opened, this creates a custom Google Maps Layer containing all \${selectedPropertyIds.length} property pins at once.\`);`;

const injection2 = `alert(\`Dynamic Maps Layer Compiled!\\n\\n\${selectedPropertyIds.length} properties batched.\\n\\nIncluded Metadata per Pin:\\n- Tour Grade & Score\\n- Estimated Renovation Costs\\n- Affordability Match Tags (e.g. "DevNW Eligible")\\n- Financial Triggers\\n\\nWhen opened, this creates a rich, annotated Google Maps Layer containing all \${selectedPropertyIds.length} property pins, preserving your CRM context right inside the consumer's native Maps app.\`);`;

c = c.replace(target1, injection1).replace(target1, injection1).replace(target2, injection2); // replace target1 twice just in case (there are two buttons for bulk)
fs.writeFileSync('src/components/PropertyTracker.tsx', c);
