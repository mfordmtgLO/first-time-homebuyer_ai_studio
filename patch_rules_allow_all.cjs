const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

code = code.replace(
  'allow write: if isSignedIn(); // Temporarily allow any signed in user to toggle',
  'allow write: if true; // ALlow all for testing'
);

fs.writeFileSync('firestore.rules', code);
