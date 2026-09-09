import React, { useState } from "react";
import { GuidesState, LoanOfficerProfile } from "../types";
import { HeadshotAvatar } from "./HeadshotAvatar";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { checkAndProvisionUser } from "../utils/authUtils";
import { 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  ExternalLink, 
  Sparkles,
  AlertCircle
} from "lucide-react";

interface LoanOfficerLoginViewProps {
  guidesState: GuidesState;
  onUpdateGuidesState: (newState: GuidesState) => void;
  onAuthenticate: (loId: string) => void;
  onBackToPublicSite: () => void;
}

export const LoanOfficerLoginView: React.FC<LoanOfficerLoginViewProps> = ({
  guidesState,
  onUpdateGuidesState,
  onAuthenticate,
  onBackToPublicSite,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const companyName =
    guidesState.loanOfficer?.company ||
    guidesState.loanOfficers[0]?.company ||
    "Cornerstone First Mortgage, LLC NMLS#173855";

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      
      const email = result.user.email?.toLowerCase();
      
      // Auto-match user to LO roster or default to admin (Mike Ford)
      let targetLoId = guidesState.adminLoanOfficerId || "lo-mike-ford";
      if (email) {
        const matched = guidesState.loanOfficers.find(
          (l) => l.email?.toLowerCase() === email
        );
        if (matched) {
          targetLoId = matched.id;
        }
      }

      try {
        await checkAndProvisionUser(result.user);
      } catch (provisionErr: any) {
        console.warn("Provisioning warning:", provisionErr);
        if (provisionErr.message === "NOT_WHITELISTED") {
          setError("Access Denied: Your email has not been whitelisted by the Branch Manager.");
          await signOut(auth);
          setIsLoading(false);
          return;
        }
      }

      // Successful auth: set session
      if (typeof window !== "undefined") {
        localStorage.removeItem("lo_portal_logged_out");
      localStorage.setItem("lo_portal_auth_id", targetLoId);
      }
      onAuthenticate(targetLoId);
    } catch (err: any) {
      console.error("Google Auth error:", err);
      if (err.code === "auth/popup-closed-by-user") {
        setError("Sign-in popup was closed before completing.");
      } else if (err.code === "auth/unauthorized-domain") {
        setError(`Domain ${window.location.hostname} is not authorized in Firebase. Please add it to Firebase Console -> Authentication -> Settings -> Authorized Domains.`);
      } else if (err.code === "auth/popup-blocked") {
        setError("The login popup was blocked by your browser. Please allow popups for this site.");
      } else {
        setError(`Google Sign-In failed: ${err.message || "Unknown error"}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F1EA] flex flex-col justify-between p-4 md:p-8 selection:bg-[#4A5D4E]/20">
      {/* Header bar */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between py-2 border-b border-[#EAE7E0]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#2D362E] text-white flex items-center justify-center font-serif font-bold text-sm shadow-xs">
            C
          </div>
          <div>
            <h1 className="font-serif font-bold text-[#2D362E] text-sm md:text-base leading-tight">
              {companyName}
            </h1>
            <p className="text-[11px] text-[#606C5D]">
              Private Loan Officer & Partner Management Hub
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onBackToPublicSite}
          className="text-xs font-semibold text-[#606C5D] hover:text-[#2D362E] flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#EAE7E0] hover:bg-white transition-all cursor-pointer"
        >
          <span>Return to Consumer Website</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Main card */}
      <main className="max-w-lg w-full mx-auto my-8">
        <div className="bg-white rounded-3xl border border-[#EAE7E0] shadow-xl overflow-hidden p-6 sm:p-8">
          <div className="text-center space-y-2 mb-6">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#2D362E] text-white flex items-center justify-center shadow-md mb-4">
              <Building2 className="w-7 h-7" />
            </div>
            <h2 className="font-serif font-bold text-2xl text-[#2D362E]">
              Loan Officer Sign In
            </h2>
            <p className="text-xs text-[#606C5D]">
              Sign in with your verified Google account to access your private pipeline, leads, and co-branded pairing links.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          <div className="space-y-4 pt-2">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-4 px-6 bg-[#2D362E] hover:bg-[#38463B] text-white text-sm font-bold rounded-2xl shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoading ? "Connecting to Google..." : "Sign in with Google"}</span>
              {!isLoading && <ArrowRight className="w-4 h-4 ml-1" />}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-[#EAE7E0] flex items-center justify-center gap-2 text-xs text-[#9A9488]">
            <ShieldCheck className="w-4 h-4 text-[#4A5D4E]" />
            <span>Secure Enterprise Authentication</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto text-center py-3 text-[11px] text-[#9A9488] border-t border-[#EAE7E0]/80">
        {companyName} • Confidential & Proprietary Platform • NMLS Verified
      </footer>
    </div>
  );
};
