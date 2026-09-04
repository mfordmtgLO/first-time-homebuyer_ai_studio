const fs = require('fs');
let code = fs.readFileSync('src/components/BranchManagerDashboard.tsx', 'utf8');

code = code.replace(
  '<h1 className="text-2xl font-bold font-display">Branch Manager Admin</h1>',
  '<h1 className="text-2xl font-bold font-display">Branch Performance & ROI</h1>'
);

fs.writeFileSync('src/components/BranchManagerDashboard.tsx', code);
