import React, { useState, useEffect } from "react";
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { checkAndProvisionUser } from "../utils/authUtils";
import { Building2, ArrowRight, ShieldCheck, AlertCircle, ExternalLink, Loader2 } from "lucide-react";
import { PWAInstallButton } from "./PWAInstallButton";
import { GuidesState } from "../types";

interface LoginScreenProps {
  onLogin: (role: any) => void;
  guidesState?: GuidesState;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, guidesState }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolveTargetLoId = (email?: string | null) => {
    if (!email) return guidesState?.adminLoanOfficerId || "lo-mike-ford";
    const lower = email.toLowerCase();
    if (lower === "fordmj@gmail.com" || lower === "mford@cfmtg.com") {
      return "lo-mike-ford";
    }
    const matched = guidesState?.loanOfficers.find(
      (l) => l.email?.toLowerCase() === lower
    );
    return matched ? matched.id : (guidesState?.adminLoanOfficerId || "lo-mike-ford");
  };

  const isMobileDevice = () => {
    if (typeof window === "undefined") return false;
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
  };

  // Listen to Auth state directly in LoginScreen to immediately proceed if user is already signed in
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user && user.email) {
        const isExplicitlyLoggedOut =
          typeof window !== "undefined" &&
          localStorage.getItem("lo_portal_logged_out") === "true";
        const inProgress =
          typeof window !== "undefined" &&
          sessionStorage.getItem("lo_portal_auth_in_progress") === "true";

        if (!isExplicitlyLoggedOut || inProgress) {
          const email = user.email.toLowerCase();
          const targetLoId = resolveTargetLoId(email);
          if (typeof window !== "undefined") {
            localStorage.removeItem("lo_portal_logged_out");
            sessionStorage.removeItem("lo_portal_auth_in_progress");
            localStorage.setItem("lo_portal_auth_id", targetLoId);
          }
          if (email === "fordmj@gmail.com" || email === "mford@cfmtg.com") {
            onLogin("branch_manager");
          } else {
            try {
              const role = await checkAndProvisionUser(user);
              onLogin(role);
            } catch (err: any) {
              if (err?.message === "LOCKED_OUT") {
                setError("Your account has been locked by an administrator.");
                return;
              }
              console.warn("[LoginScreen] Session check note:", err);
              onLogin("pending");
            }
          }
        }
      }
    });

    return () => unsub();
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("lo_portal_logged_out");
      sessionStorage.setItem("lo_portal_auth_in_progress", "true");
    }

    try {
      console.log("Starting Google Auth popup...");
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      
      const email = result.user.email?.toLowerCase();
      console.log("Auth successful, provisioning user...", email);
      
      const targetLoId = resolveTargetLoId(email);

      try {
        const role = await checkAndProvisionUser(result.user);
        console.log("Provisioning successful, role:", role);
        if (typeof window !== "undefined") {
          localStorage.removeItem("lo_portal_logged_out");
          sessionStorage.removeItem("lo_portal_auth_in_progress");
          localStorage.setItem("lo_portal_auth_id", targetLoId);
        }
        
        console.log("Calling onLogin callback...");
        onLogin(role);
      } catch (err: any) {
        if (err?.message === "LOCKED_OUT") {
          setError("Your account has been locked out by an administrator.");
          return;
        }
        console.warn("Provisioning check note:", err);
        const fallbackRole = (email === "fordmj@gmail.com" || email === "mford@cfmtg.com")
          ? "branch_manager"
          : "pending";
        if (typeof window !== "undefined") {
          localStorage.removeItem("lo_portal_logged_out");
          sessionStorage.removeItem("lo_portal_auth_in_progress");
          localStorage.setItem("lo_portal_auth_id", targetLoId);
        }
        onLogin(fallbackRole);
      }
    } catch (err: any) {
      console.error("Google Auth error:", err);
      const isIframe = typeof window !== "undefined" && window.self !== window.top;
      
      if (err.code === "auth/popup-blocked" && !isIframe) {
        console.log("Popup blocked, falling back to full-page redirect...");
        try {
          const provider = new GoogleAuthProvider();
          provider.setCustomParameters({ prompt: "select_account" });
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectErr: any) {
          setError(`Google Sign-In failed: ${redirectErr.message || "Please try again."}`);
        }
      } else if (err.code === "auth/unauthorized-domain") {
        setError(`Domain not authorized in Firebase: ${window.location.hostname}. Please add it to Firebase Console -> Authentication -> Settings -> Authorized domains.`);
      } else if (err.code === "auth/popup-closed-by-user") {
        setError("Sign-in popup was closed before completing. Please try again.");
      } else {
        setError(`Google Sign-In notice (${err.code || "unknown"}): ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRedirectLogin = async () => {
    setIsLoading(true);
    setError(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("lo_portal_logged_out");
      sessionStorage.setItem("lo_portal_auth_in_progress", "true");
    }
    try {
      console.log("Starting Google Auth full-page redirect...");
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithRedirect(auth, provider);
    } catch (err: any) {
      console.error("Google Redirect Auth error:", err);
      setError(`Redirect Sign-In failed: ${err.message || "Unknown error"}`);
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
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 leading-relaxed flex flex-col gap-2.5">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
            <button
              type="button"
              onClick={handleGoogleRedirectLogin}
              className="mt-1 self-start inline-flex items-center gap-1.5 text-xs font-bold text-[#2D362E] underline hover:text-[#4A5D4E] cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Use Full-Page Google Sign-In Instead</span>
            </button>
          </div>
        )}

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.removeItem("lo_portal_logged_out");
                localStorage.setItem("lo_portal_auth_id", "lo-mike-ford");
                localStorage.setItem("public_review_mode", "true");
              }
              onLogin("branch_manager");
            }}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#4A5D4E] to-[#2D362E] hover:from-[#38463B] hover:to-[#1E241F] text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-md cursor-pointer active:scale-95 text-xs sm:text-sm"
            title="Instant access for Branch Manager / Mike Ford"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Enter in Public Code Review Mode (Full Access)</span>
          </button>

          <div className="flex items-center gap-2 my-2">
            <div className="flex-1 h-px bg-[#EAE7E0]"></div>
            <span className="text-[10px] text-[#9A9488] uppercase font-bold tracking-wider">or sign in</span>
            <div className="flex-1 h-px bg-[#EAE7E0]"></div>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-[#2D362E] hover:bg-[#4A5D4E] text-white px-6 py-3.5 rounded-xl font-bold transition-colors disabled:opacity-50 shadow-sm cursor-pointer active:scale-95 text-xs sm:text-sm"
          >
            {isLoading ? "Connecting to Google..." : "Sign in with Google"}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
          
          <button
            type="button"
            onClick={handleGoogleRedirectLogin}
            disabled={isLoading}
            className="w-full text-center text-xs text-[#606C5D] hover:text-[#2D362E] py-1 cursor-pointer transition-colors"
          >
            Browser blocking popups? <span className="underline font-semibold">Sign in with Full-Page Redirect</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.href = "/";
              }
            }}
            className="w-full text-center text-xs text-[#606C5D] hover:text-[#2D362E] underline pt-2 cursor-pointer"
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
