const fs = require('fs');
let c = fs.readFileSync('src/components/EmailOutreachModal.tsx', 'utf8');

c = c.replace(
  /loName: "Mike Ford",/g,
  'loName: activeLo.name,\n          loPhone: activeLo.phone,\n          loEmail: activeLo.email,'
);

fs.writeFileSync('src/components/EmailOutreachModal.tsx', c);
