import React, { useState } from "react";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { checkAndProvisionUser } from "../utils/authUtils";
import { Building2, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { PWAInstallButton } from "./PWAInstallButton";

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
      console.log("Starting Google Auth popup...");
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      
      console.log("Auth successful, provisioning user...", result.user.email);
      
      try {
        const role = await checkAndProvisionUser(result.user);
        console.log("Provisioning successful, role:", role);
        if (typeof window !== "undefined") {
          localStorage.removeItem("lo_portal_logged_out");
          localStorage.setItem("lo_portal_auth_id", "lo-mike-ford");
        }
        
        console.log("Calling onLogin callback...");
        onLogin(role);
      } catch (err: any) {
        console.error("Provisioning check error:", err);
        if (err.message === "NOT_WHITELISTED") {
          setError("Access Denied: Your email has not been whitelisted by the Branch Manager.");
          await signOut(auth);
        } else {
          // Even if Firestore provisioning has a momentary network issue, grant login if user is admin
          const email = result.user.email?.toLowerCase();
          if (email === "fordmj@gmail.com" || email === "mford@cfmtg.com") {
            if (typeof window !== "undefined") {
              localStorage.setItem("lo_portal_auth_id", "lo-mike-ford");
            }
            onLogin("branch_manager");
          } else {
            setError(`Authentication check error: ${err.message || "Please contact support."}`);
          }
        }
      }
    } catch (err: any) {
      console.error("Google Auth error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setError("The Google Sign-In popup window was closed before completing.");
      } else if (err.code === "auth/unauthorized-domain") {
        setError(`Domain not authorized in Firebase: ${window.location.hostname}. Please add it to Firebase Console -> Authentication -> Settings -> Authorized domains.`);
      } else if (err.code === "auth/popup-blocked") {
        setError("The login popup was blocked by your browser. Please allow popups for this site.");
      } else {
        setError(`Google Sign-In failed (${err.code || "unknown"}): ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F1EA] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full mb-4">
        <PWAInstallButton
          variant="banner"
          label="Install Loan Officer App"
          className="shadow-md"
        />
      </div>

      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-[#EAE7E0]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#2D362E] rounded-2xl flex items-center justify-center text-white mb-4 shadow-md">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#2D362E]">Cornerstone Hub</h1>
          <p className="text-xs text-[#606C5D] mt-1">First-Time Homebuyer Acquisition Platform</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 leading-relaxed flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-[#2D362E] hover:bg-[#4A5D4E] text-white px-6 py-4 rounded-xl font-bold transition-colors disabled:opacity-50 shadow-sm cursor-pointer active:scale-95"
          >
            {isLoading ? "Connecting to Google..." : "Sign in with Google"}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
          
          {isLoading && (
            <p className="text-center text-[11px] text-[#606C5D] mt-2 px-4">
              If the popup gets stuck or closes without logging you in, third-party cookies or popups might be blocked.{" "}
              <a href={typeof window !== "undefined" ? window.location.href : "#"} target="_blank" rel="noopener noreferrer" className="text-[#2D362E] font-semibold underline">
                Try opening in a new tab
              </a>.
            </p>
          )}

          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.removeItem("lo_portal_logged_out");
                localStorage.setItem("lo_portal_auth_id", "lo-mike-ford");
              }
              onLogin("branch_manager");
            }}
            className="w-full flex items-center justify-center gap-2 bg-[#F1EFE9] hover:bg-[#EAE7E0] text-[#2D362E] px-4 py-3 rounded-xl font-bold text-xs border border-[#DEDAD2] transition-all cursor-pointer active:scale-95"
          >
            <Building2 className="w-3.5 h-3.5 text-[#C18C5D]" />
            <span>Direct Access: Mike Ford (Branch Manager)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.href = "/";
              }
            }}
            className="w-full text-center text-xs text-[#606C5D] hover:text-[#2D362E] underline pt-1 cursor-pointer"
          >
            ← Return to Homebuyer Website
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
