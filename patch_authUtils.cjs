const fs = require('fs');
let code = fs.readFileSync('src/utils/authUtils.ts', 'utf8');

code = code.replace(
  'const ADMIN_EMAIL = "fordmj@gmail.com";',
  'const ADMIN_EMAIL = "fordmj@gmail.com";' // Ensure it's correct
);

fs.writeFileSync('src/utils/authUtils.ts', code);
