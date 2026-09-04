import React, { useState } from "react";
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { checkAndProvisionUser } from "../utils/authUtils";
import { ShieldCheck, AlertTriangle, Building, ArrowRight } from "lucide-react";

interface LoginScreenProps {
  onLogin: (role: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
      setError("Failed to sign in with Google.");
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
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <p className="text-sm text-red-800 leading-relaxed">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-[#2D362E] hover:bg-[#4A5D4E] text-white px-6 py-4 rounded-xl font-bold transition-colors disabled:opacity-50"
          >
            {isLoading ? "Authenticating..." : "Sign in with Google"}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
          
          <div className="flex items-center justify-center gap-2 text-xs text-[#9A9488]">
            <ShieldCheck className="w-4 h-4" />
            <span>Secure Enterprise Login</span>
          </div>
        </div>
      </div>
    </div>
  );
};
