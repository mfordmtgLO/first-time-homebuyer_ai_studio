const fs = require('fs');
let code = fs.readFileSync('src/components/LoginScreen.tsx', 'utf8');

if (!code.includes('signInWithEmailAndPassword')) {
  code = code.replace(
    'import { signInWithPopup, signInWithRedirect, GoogleAuthProvider, signOut, getRedirectResult } from "firebase/auth";',
    'import { signInWithPopup, signInWithRedirect, GoogleAuthProvider, signOut, getRedirectResult, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";'
  );
}

// Add state for email login
code = code.replace(
  '  const [isLoading, setIsLoading] = useState(false);',
  `  const [isLoading, setIsLoading] = useState(false);
  const [useEmail, setUseEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);`
);

const handleEmailAuth = `
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      let result;
      if (isSignUp) {
        result = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        result = await signInWithEmailAndPassword(auth, email, password);
      }
      
      try {
        const role = await checkAndProvisionUser(result.user);
        onLogin(role);
      } catch (err: any) {
        if (err.message === "NOT_WHITELISTED") {
          setError("Access Denied: Your email has not been whitelisted.");
          await signOut(auth);
        } else {
          setError("Authentication error. Please contact support.");
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError("Account already exists. Please sign in instead.");
        setIsSignUp(false);
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError("Invalid email or password.");
      } else {
        setError(\`Authentication failed: \${err.message}\`);
      }
    } finally {
      setIsLoading(false);
    }
  };
`;

code = code.replace(
  '  const handleRedirectLogin = async () => {',
  handleEmailAuth + '\n  const handleRedirectLogin = async () => {'
);

const emailFormUI = `
        {!useEmail ? (
          <div className="space-y-6">
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#2D362E] hover:bg-[#4A5D4E] text-white px-6 py-4 rounded-xl font-bold transition-colors disabled:opacity-50"
            >
              {isLoading ? "Authenticating..." : "Sign in with Google"}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </button>
            
            {error && (error.includes("popup-closed-by-user") || error.includes("Redirect login") || error.includes("cross-origin")) && (
              <button
                onClick={() => { setError(null); setUseEmail(true); }}
                className="w-full flex items-center justify-center gap-2 bg-white border-2 border-[#2D362E] text-[#2D362E] hover:bg-gray-50 px-6 py-4 rounded-xl font-bold transition-colors mt-4"
              >
                Use Email & Password Instead
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => { setError(null); setUseEmail(true); }}
              className="w-full text-center text-sm text-[#606C5D] hover:text-[#2D362E] mt-4 underline"
            >
              Alternative: Sign in with Email
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-[#9A9488]">
              <ShieldCheck className="w-4 h-4" />
              <span>Secure Enterprise Login</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#2D362E] mb-1">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#EAE7E0] focus:outline-none focus:ring-2 focus:ring-[#C18C5D] bg-[#F9F8F4]"
                placeholder="fordmj@gmail.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2D362E] mb-1">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#EAE7E0] focus:outline-none focus:ring-2 focus:ring-[#C18C5D] bg-[#F9F8F4]"
                placeholder="••••••••"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#2D362E] hover:bg-[#4A5D4E] text-white px-6 py-4 rounded-xl font-bold transition-colors disabled:opacity-50 mt-2"
            >
              {isLoading ? "Authenticating..." : (isSignUp ? "Create Admin Account" : "Sign in securely")}
            </button>

            <div className="flex flex-col items-center gap-3 mt-4">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-[#C18C5D] font-medium hover:underline"
              >
                {isSignUp ? "Already have an account? Sign in" : "First time using password? Create account"}
              </button>
              
              <button
                type="button"
                onClick={() => { setUseEmail(false); setError(null); }}
                className="text-sm text-[#606C5D] hover:text-[#2D362E] underline"
              >
                Back to Google Sign In
              </button>
            </div>
          </form>
        )}
`;

code = code.replace(
  /<div className="space-y-6">[\s\S]*?<\/div>\n      <\/div>\n    <\/div>\n  \);\n};/,
  emailFormUI + '\n      </div>\n    </div>\n  );\n};'
);

fs.writeFileSync('src/components/LoginScreen.tsx', code);
