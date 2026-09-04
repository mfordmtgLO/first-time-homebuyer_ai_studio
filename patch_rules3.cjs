const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

code = code.replace(
  'allow write: if isAdmin(); // Temporarily allow any signed in user to toggle',
  'allow write: if isSignedIn(); // Allow any signed in user to write to app_settings temporarily'
);
if (!code.includes('allow write: if isSignedIn();')) {
  // If the previous replace didn't work because it was 'allow write: if isAdmin();'
  code = code.replace(
    'allow write: if isAdmin();',
    'allow write: if isSignedIn(); // Allow any signed in user to write to app_settings temporarily'
  );
}

fs.writeFileSync('firestore.rules', code);
