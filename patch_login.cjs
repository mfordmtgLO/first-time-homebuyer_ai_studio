const fs = require('fs');
let code = fs.readFileSync('src/components/LoginScreen.tsx', 'utf8');

if (!code.includes('signInWithRedirect')) {
  code = code.replace(
    'import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";',
    'import { signInWithPopup, signInWithRedirect, GoogleAuthProvider, signOut } from "firebase/auth";'
  );
}

const handleRedirectLogin = `
  const handleRedirectLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
      // The page will redirect, so no code runs after this
    } catch (err: any) {
      console.error(err);
      setError(\`Redirect login failed: \${err.message}\`);
      setIsLoading(false);
    }
  };
`;

if (!code.includes('handleRedirectLogin')) {
  code = code.replace(
    '  const handleLogin = async () => {',
    handleRedirectLogin + '\n  const handleLogin = async () => {'
  );
}

const redirectButton = `
          {error && error.includes("popup-closed-by-user") && (
            <button
              onClick={handleRedirectLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-bold transition-colors disabled:opacity-50 mt-4"
            >
              {isLoading ? "Redirecting..." : "Try Alternate Login Method (Redirect)"}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
          )}
`;

code = code.replace(
  '          <div className="flex items-center justify-center gap-2 text-xs text-[#9A9488]">',
  redirectButton + '\n          <div className="flex items-center justify-center gap-2 text-xs text-[#9A9488]">'
);

fs.writeFileSync('src/components/LoginScreen.tsx', code);
