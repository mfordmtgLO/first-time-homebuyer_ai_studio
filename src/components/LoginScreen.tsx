import React, { useState } from "react";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { checkAndProvisionUser } from "../utils/authUtils";
import { Building2, ArrowRight, ShieldCheck } from "lucide-react";

interface LoginScreenProps {
  onLogin: (role: any) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      // Use signInWithPopup which works reliably in standard Chrome tabs without redirect loops or stuck spinners
      const result = await signInWithPopup(auth, provider);
      try {
        const role = await checkAndProvisionUser(result.user);
        onLogin(role);
      } catch (err: any) {
        if (err.message === "NOT_WHITELISTED") {
          setError("Access Denied: Your email has not been whitelisted by the Branch Manager.");
          await signOut(auth);
        } else {
          setError("Authentication error. Please contact support.");
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/popup-closed-by-user") {
        setError("Sign-in popup was closed before completing.");
      } else {
        setError(`Google Sign-In failed: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F1EA] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-[#EAE7E0]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#2D362E] rounded-2xl flex items-center justify-center text-white mb-4 shadow-md">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#2D362E]">Cornerstone Hub</h1>
          <p className="text-xs text-[#606C5D] mt-1">First-Time Homebuyer Acquisition Platform</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 leading-relaxed">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-[#2D362E] hover:bg-[#4A5D4E] text-white px-6 py-4 rounded-xl font-bold transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
          >
            {isLoading ? "Authenticating..." : "Sign in with Google"}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[#9A9488] border-t border-[#EAE7E0] pt-6">
          <ShieldCheck className="w-4 h-4 text-[#4A5D4E]" />
          <span>Secure Enterprise Login</span>
        </div>
      </div>
    </div>
  );
};
