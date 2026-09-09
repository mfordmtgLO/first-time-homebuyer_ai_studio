const fs = require('fs');
let code = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

// The broken one is line 9714: `return (<><div className="fixed inset-0...`
code = code.replace('return (<><div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">', 'return (<div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">');

// There is a `</>` at 9848 from my previous run:
/*
      <TwilioMobileSimulator />
      </>
    );
*/
// And we need to fix line 2112: `return (<div className="min-h-screen...`
code = code.replace('return (<div className="min-h-screen bg-[#F7F6F2] text-[#2D362E] pb-24">', 'return (<>\n<div className="min-h-screen bg-[#F7F6F2] text-[#2D362E] pb-24">');

fs.writeFileSync('src/components/LoanOfficerPortal.tsx', code);
