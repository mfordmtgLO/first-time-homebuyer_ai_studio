const fs = require('fs');
let code = fs.readFileSync('src/components/BranchManagement.tsx', 'utf8');

code = code.replace(
  '<option value="processor">Loan Processor</option>',
  '<option value="processor">Loan Processor</option>\\n                        <option value="mktg_ads_creator">MKTG & Ads Creator</option>\\n                        <option value="loa">Loan Officer Assistant</option>'
);

// Also let's update the filter options if any
code = code.replace(
  '<option value="processor">Processors</option>',
  '<option value="processor">Processors</option>\\n              <option value="mktg_ads_creator">Marketing</option>\\n              <option value="loa">LOA</option>'
);

fs.writeFileSync('src/components/BranchManagement.tsx', code, 'utf8');
console.log("Updated BranchManagement");
