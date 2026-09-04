const fs = require('fs');
let code = fs.readFileSync('src/components/LoginScreen.tsx', 'utf8');

code = code.replace(
  '{(error.includes("popup") || error.includes("cross-origin") || error.includes("Failed to sign in") || error.includes("auth/")) && (',
  '{(error.includes("popup") || error.includes("cross-origin") || error.includes("Failed to sign in") || error.includes("auth/")) && !error.includes("popup-closed-by-user") && ('
);

fs.writeFileSync('src/components/LoginScreen.tsx', code);
