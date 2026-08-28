const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');
rules = rules.replace(
  '}',
  '    match /email_templates/{templateId} {\n      allow read: if true;\n      allow write: if true;\n    }\n  }\n}'
);
// fix the braces
rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
    match /guides_state/{docId} { allow read: if true; allow write: if true; }
    match /loan_officers/{loId} { allow read: if true; allow write: if true; }
    match /agents/{agentId} { allow read: if true; allow write: if true; }
    match /pairings/{pairingId} { allow read: if true; allow write: if true; }
    match /email_templates/{templateId} { allow read: if true; allow write: if true; }
  }
}`
fs.writeFileSync('firestore.rules', rules);
