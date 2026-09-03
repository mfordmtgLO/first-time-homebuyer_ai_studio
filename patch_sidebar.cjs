const fs = require('fs');
let code = fs.readFileSync('src/components/LoanOfficerSidebar.tsx', 'utf8');

code = code.replace(
  /className=\{\`sticky top-\[65px\] h-\[calc\(100vh-65px\)\] shrink-0 flex flex-col bg-\[#FDFBF7\] border-r border-\[#EAE7E0\] transition-all duration-300 z-30 select-none \$\{/,
  'className={`h-full overflow-y-auto shrink-0 flex flex-col bg-[#FDFBF7] border-r border-[#EAE7E0] transition-all duration-300 z-30 select-none ${'
);

fs.writeFileSync('src/components/LoanOfficerSidebar.tsx', code);
