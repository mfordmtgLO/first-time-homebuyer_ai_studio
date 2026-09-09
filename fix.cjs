const fs = require('fs');
let code = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

// Undo the bad regex
code = code.replace(/return \(\n    <>\n      <div/g, 'return (<div');
code = code.replace(/    <\/div>\n      <TwilioMobileSimulator \/>\n    <\/>\n  \);\n};/, '    </div>\n  );\n};');

// Re-apply it safely
// The main return is at the end of the file
const lastReturn = code.lastIndexOf('return (<div className="fixed inset-0');
if (lastReturn !== -1) {
    code = code.substring(0, lastReturn) + 'return (<><div className="fixed inset-0' + code.substring(lastReturn + 'return (<div className="fixed inset-0'.length);
}

const lastDiv = code.lastIndexOf('    </div>\n  );\n};');
if (lastDiv !== -1) {
    code = code.substring(0, lastDiv) + '    </div>\n    <TwilioMobileSimulator />\n    </>\n  );\n};' + code.substring(lastDiv + '    </div>\n  );\n};'.length);
}

fs.writeFileSync('src/components/LoanOfficerPortal.tsx', code);
