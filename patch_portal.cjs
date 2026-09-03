const fs = require('fs');
let code = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

// Update outermost div
code = code.replace(
  /<div className="min-h-screen bg-\[#F7F6F2\] text-\[#2D362E\] pb-24">/,
  '<div className="h-full bg-[#F7F6F2] text-[#2D362E] flex flex-col">'
);

// Update header
code = code.replace(
  /<header className="bg-white border-b border-\[#EAE7E0\] sticky top-0 z-40 px-4 sm:px-8 py-3 shadow-2xs">/,
  '<header className="bg-white border-b border-[#EAE7E0] shrink-0 z-40 px-4 sm:px-8 py-3 shadow-2xs">'
);

// Update flex container
code = code.replace(
  /<div className="flex flex-1 min-h-\[calc\(100vh-65px\)\]">/,
  '<div className="flex flex-1 overflow-hidden">'
);

// Update main content area
code = code.replace(
  /<div className="flex-1 min-w-0 overflow-y-auto">/,
  '<div className="flex-1 min-w-0 overflow-y-auto pb-24">'
);

fs.writeFileSync('src/components/LoanOfficerPortal.tsx', code);
