const fs = require('fs');
let code = fs.readFileSync('src/components/TotalExpertSettingsModal.tsx', 'utf8');

code = code.replace(
  /"Authorization": \\`Bearer \\\${idToken}\\`/g,
  '"Authorization": `Bearer ${idToken}`'
);

code = code.replace(
  /"Authorization": \\\`Bearer \\\\\\\${idToken}\\\\\\\`/g,
  '"Authorization": `Bearer ${idToken}`'
);

// Catch-all regex to fix any malformed template literal in the Authorization header
code = code.replace(
  /"Authorization": .*/g,
  '"Authorization": `Bearer ${idToken}`'
);


fs.writeFileSync('src/components/TotalExpertSettingsModal.tsx', code);
