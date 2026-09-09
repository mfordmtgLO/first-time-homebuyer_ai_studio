const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetReturn = `  // When website is PRIVATE (Locked), only authenticated & authorized users (Admin / LO) can access it.
  // When website is PUBLIC (Unlocked), any visitor can view the public consumer website, but portal/admin routes require login.
  if (!userRole && (!isAppPublic || isPortalAccess)) {
    return <LoginScreen onLogin={(role) => setUserRole(role as any)} />;
  }`;

const replacementReturn = `  // Routing Logic for Vercel Deployment
  // 1. If accessing /lo-login or /admin, force the secure login screen
  // 2. If accessing the root website, always render the public consumer view
  if (!userRole && isPortalAccess) {
    return <LoginScreen onLogin={(role) => setUserRole(role as any)} />;
  }`;

code = code.replace(targetReturn, replacementReturn);
fs.writeFileSync('src/App.tsx', code);
