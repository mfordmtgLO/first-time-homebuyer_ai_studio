const fs = require('fs');
let code = fs.readFileSync('src/components/LoginScreen.tsx', 'utf8');

// 1. Add new imports
if (!code.includes('getMultiFactorResolver')) {
  code = code.replace(
    'signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";',
    'signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut,\n  getMultiFactorResolver, PhoneAuthProvider, PhoneMultiFactorGenerator, TotpMultiFactorGenerator, RecaptchaVerifier } from "firebase/auth";'
  );
  
  // 2. Add new states for MFA inside the component
  const mfaStates = `
  // MFA States
  const [mfaResolver, setMfaResolver] = useState<any>(null);
  const [mfaVerificationCode, setMfaVerificationCode] = useState("");
  const [mfaMethod, setMfaMethod] = useState<"totp" | "sms" | null>(null);
  const [mfaVerificationId, setMfaVerificationId] = useState("");
  
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'login-recaptcha', {
        size: 'invisible'
      });
    }
  }, []);
`;
  code = code.replace(
    'const [isSignUp, setIsSignUp] = useState(false);',
    'const [isSignUp, setIsSignUp] = useState(false);\n' + mfaStates
  );
  
  // 3. Update the handleEmailAuth catch block to handle multi-factor required
  const mfaCatchBlock = `
    } catch (err: any) {
      if (err.code === 'auth/multi-factor-auth-required') {
        const resolver = getMultiFactorResolver(auth, err);
        setMfaResolver(resolver);
        
        // Find which hints are available
        const hints = resolver.hints;
        if (hints[0].factorId === 'totp') {
          setMfaMethod('totp');
        } else if (hints[0].factorId === 'phone') {
          setMfaMethod('sms');
          // Automatically send SMS
          try {
            const phoneInfoOptions = {
              multiFactorHint: hints[0],
              session: resolver.session
            };
            const phoneAuthProvider = new PhoneAuthProvider(auth);
            const verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, window.recaptchaVerifier);
            setMfaVerificationId(verificationId);
          } catch (smsErr: any) {
            setError("Failed to send SMS code.");
          }
        }
        setIsLoading(false);
        return;
      }
      
      console.error(err);
      setError(\`Authentication failed: \${err.message}\`);
      setIsLoading(false);
    }
`;

  code = code.replace(
    /    \} catch \(err: any\) \{[\s\S]*?setIsLoading\(false\);\n    \}/,
    mfaCatchBlock
  );
  
  // 4. Add the MFA Verify function
  const mfaVerifyFunc = `
  const handleVerifyMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaVerificationCode || !mfaResolver) return;
    setIsLoading(true);
    setError(null);
    try {
      let assertion;
      if (mfaMethod === 'totp') {
        assertion = TotpMultiFactorGenerator.assertionForSignIn(mfaResolver.hints[0].uid, mfaVerificationCode);
      } else {
        const phoneAuthCredential = PhoneAuthProvider.credential(mfaVerificationId, mfaVerificationCode);
        assertion = PhoneMultiFactorGenerator.assertion(phoneAuthCredential);
      }
      
      const result = await mfaResolver.resolveSignIn(assertion);
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
      setError("Invalid verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
`;
  
  code = code.replace(
    'const handleEmailAuth = async',
    mfaVerifyFunc + '\n  const handleEmailAuth = async'
  );
  
  // 5. Render MFA UI
  const mfaUI = `
      {mfaResolver ? (
        <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md relative overflow-hidden border border-[#EAE7E0]">
          <div id="login-recaptcha"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-[#4A5D4E]" />
          
          <div className="mb-8 text-center">
            <div className="w-16 h-16 bg-[#F8F7F4] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#EAE7E0]">
              <ShieldCheck className="w-8 h-8 text-[#4A5D4E]" />
            </div>
            <h1 className="text-2xl font-bold text-[#2D362E] font-display">2-Step Verification</h1>
            <p className="text-sm text-[#606C5D] mt-2">
              {mfaMethod === 'totp' 
                ? "Open your Authenticator app and enter the 6-digit code." 
                : "Enter the 6-digit code sent to your phone."}
            </p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-rose-50 text-rose-600 text-sm rounded-xl border border-rose-100 flex items-start gap-2">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleVerifyMfa} className="space-y-6">
            <div>
              <input
                type="text"
                required
                maxLength={6}
                value={mfaVerificationCode}
                onChange={(e) => setMfaVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="000000"
                className="w-full px-4 py-4 bg-[#F8F7F4] border border-[#EAE7E0] rounded-xl text-center text-3xl tracking-[0.5em] font-mono focus:outline-none focus:border-[#4A5D4E] focus:ring-1 focus:ring-[#4A5D4E]"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading || mfaVerificationCode.length < 6}
              className="w-full py-4 bg-[#2D362E] hover:bg-[#4A5D4E] text-white font-bold rounded-xl transition-all shadow-md disabled:opacity-50"
            >
              {isLoading ? "Verifying..." : "Verify & Continue"}
            </button>
            
            <button
              type="button"
              onClick={() => setMfaResolver(null)}
              className="w-full py-2 text-[#9A9488] hover:text-[#2D362E] text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
          </form>
        </div>
      ) : (
`;
  
  code = code.replace(
    'return (\n    <div className="min-h-screen bg-[#F5F4F0] flex flex-col items-center justify-center p-4">',
    'return (\n    <div className="min-h-screen bg-[#F5F4F0] flex flex-col items-center justify-center p-4">\n' + mfaUI
  );
  
  code = code.replace(
    /<\/div>\n  \);\n\}/,
    '      )} <!-- close mfa ui -->\n    </div>\n  );\n}'
  );
  
  fs.writeFileSync('src/components/LoginScreen.tsx', code);
}
