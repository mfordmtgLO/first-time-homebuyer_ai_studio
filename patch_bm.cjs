const fs = require('fs');
let code = fs.readFileSync('src/components/BranchManagement.tsx', 'utf8');

code = code.replace(
  'console.error("Failed to toggle public state:", err);',
  'console.error("Failed to toggle public state:", err);\n      alert("Error toggling website visibility: " + err.message);'
);

fs.writeFileSync('src/components/BranchManagement.tsx', code);
