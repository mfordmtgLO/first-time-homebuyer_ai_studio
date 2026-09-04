const fs = require('fs');
let code = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

code = code.replace(
  /} }\\n\\n            <button/g,
  ')} \\n\\n            <button'
);

code = code.replace(
  '</div>\\n            </button>\\n          )}',
  '</div>\\n            </button>\\n          )}'
); // Let's just fix it properly by finding the exact lines

fs.writeFileSync('src/components/LoanOfficerPortal.tsx', code);
