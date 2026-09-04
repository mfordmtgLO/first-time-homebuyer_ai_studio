const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The issue is that we have early returns in App.tsx before initializing all the state hooks!
// This violates the Rules of Hooks (hooks must always be called in the exact same order on every render).
// 
// Lines 123-137:
// if (isAuthChecking) { return ... }
// if (!userRole && ...) { return <LoginScreen /> }
//
// We need to move these early returns DOWN to just before the final return statement, or inside the main render block.

code = code.replace(
  '  if (isAuthChecking) {\n    return (\n      <div className="min-h-screen bg-[#F9F8F4] flex items-center justify-center">\n        <div className="animate-pulse flex flex-col items-center">\n          <ShieldCheck className="w-12 h-12 text-[#4A5D4E] mb-4 opacity-50" />\n          <p className="text-[#606C5D] font-mono text-xs uppercase tracking-widest">Verifying access...</p>\n        </div>\n      </div>\n    );\n  }\n\n  // DEVELOPMENT LOCK / PORTAL AUTH: Require authentication for the portal, or the entire application if not public\n  if (!userRole && (!isAppPublic || isPortalAccess)) {\n    return <LoginScreen onLogin={(role) => setUserRole(role as "admin" | "lo")} />;\n  }\n\n\n  // Global State',
  '  // Global State'
);

// Find the main return block and inject the auth gate there instead
const authGateUI = `
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#F9F8F4] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <ShieldCheck className="w-12 h-12 text-[#4A5D4E] mb-4 opacity-50" />
          <p className="text-[#606C5D] font-mono text-xs uppercase tracking-widest">Verifying access...</p>
        </div>
      </div>
    );
  }

  // DEVELOPMENT LOCK / PORTAL AUTH: Require authentication for the portal, or the entire application if not public
  if (!userRole && (!isAppPublic || isPortalAccess)) {
    return <LoginScreen onLogin={(role) => setUserRole(role as "admin" | "lo")} />;
  }

  return (
`;

code = code.replace(
  '  return (\n    <div className="min-h-screen bg-[#F5F4F0] font-sans selection:bg-[#4A5D4E] selection:text-white flex flex-col">',
  authGateUI + '    <div className="min-h-screen bg-[#F5F4F0] font-sans selection:bg-[#4A5D4E] selection:text-white flex flex-col">'
);

fs.writeFileSync('src/App.tsx', code);
