const fs = require('fs');
let c = fs.readFileSync('src/components/LoanOfficerSidebar.tsx', 'utf8');

// Target the bad injection inside the JSX block which looks like:
// />  const isMasterAdmin = loggedInUser?.email === "fordmj@gmail.com";
// ...
//      {/* 2. SCROLLABLE NAVIGATION DIRECTORY */}

const regex = /\/>\s*const isMasterAdmin = loggedInUser\?\.email === "fordmj@gmail\.com";[\s\S]*?badgeColor: "bg-indigo-500\/20 text-indigo-400 border-indigo-500\/30"[\s\S]*?\}\s*\}\s*\{\/\* 2\. SCROLLABLE NAVIGATION DIRECTORY \*\/\}/;

c = c.replace(regex, '/>\n\n      {/* 2. SCROLLABLE NAVIGATION DIRECTORY */}');

fs.writeFileSync('src/components/LoanOfficerSidebar.tsx', c);
