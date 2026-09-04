import React, { useState } from "react";
import { signInWithPopup, signInWithRedirect, GoogleAuthProvider, signOut, getRedirectResult, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { checkAndProvisionUser } from "../utils/authUtils";
import { ShieldCheck, AlertTriangle, Building, ArrowRight } from "lucide-react";

interface LoginScreenProps {
  onLogin: (role: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [useEmail, setUseEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

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


  React.useEffect(() => {
    setIsLoading(true);
    getRedirectResult(auth).then((result) => {
      if (result) {
        checkAndProvisionUser(result.user)
          .then((role) => onLogin(role))
          .catch(async (err) => {
            if (err.message === "NOT_WHITELISTED") {
              setError("Access Denied: Your email has not been whitelisted by the Branch Manager. Please request access.");
              await signOut(auth);
            } else {
              setError("Authentication error. Please contact support.");
            }
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    }).catch((err) => {
      console.error(err);
      setError(`Redirect login failed: ${err.message}`);
      setIsLoading(false);
    });
  }, []);




  
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
      setError(`Authentication failed: ${err.message}`);
      setIsLoading(false);
    }

  };

  const handleRedirectLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
      // The page will redirect, so no code runs after this
    } catch (err: any) {
      console.error(err);
      setError(`Redirect login failed: ${err.message}`);
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      try {
        const role = await checkAndProvisionUser(result.user);
        onLogin(role);
      } catch (err: any) {
         if (err.message === "NOT_WHITELISTED") {
           setError("Access Denied: Your email has not been whitelisted by the Branch Manager. Please request access.");
           await signOut(auth);
         } else {
           setError("Authentication error. Please contact support.");
         }
      }
    } catch (err) {
      console.error(err);
      setError(`Failed to sign in with Google: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F4F0] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-sm border border-[#EAE7E0]">
        <div className="flex flex-col items-center text-center space-y-4 mb-8">
          <div className="w-16 h-16 bg-[#F5F4F0] rounded-2xl flex items-center justify-center border border-[#EAE7E0]">
            <Building className="w-8 h-8 text-[#2D362E]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#2D362E] tracking-tight">Cornerstone Hub</h1>
            <p className="text-[#606C5D] text-sm mt-1">First-Time Homebuyer Acquisition Platform</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 leading-relaxed">{error}</p>
            </div>
            {(error.includes("popup") || error.includes("cross-origin") || error.includes("Failed to sign in") || error.includes("auth/")) && !error.includes("popup-closed-by-user") && !error.includes("Redirect login") && (
              <div className="w-full mt-1 p-3 bg-white rounded-lg border border-red-200 text-xs text-red-700">
                <strong>Having trouble?</strong> If you are viewing this inside the AI Studio preview window, popup authentication is likely blocked by your browser. 
                <br/><br/>
                Please click the <strong>"Open in New Tab"</strong> icon at the top of your preview window (or open your Shared App URL directly) and try logging in from that full browser tab instead.
              </div>
            )}
          </div>
        )}

        
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

      </div>
          )} {/* close mfa ui */}
    </div>
  );
};
