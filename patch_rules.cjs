const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

const newRule = `
    match /app_settings/{docId} {
      allow read: if true;
      allow write: if isAdmin();
    }
`;

code = code.replace(
  "match /whitelisted_emails/{emailId} {",
  newRule + "\n    match /whitelisted_emails/{emailId} {"
);

fs.writeFileSync('firestore.rules', code);
