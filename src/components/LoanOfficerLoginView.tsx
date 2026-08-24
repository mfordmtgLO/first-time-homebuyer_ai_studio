import React, { useState } from "react";
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Key, 
  CheckCircle2, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Building, 
  ExternalLink,
  Users,
  Award,
  AlertCircle,
  ShieldAlert,
  KeyRound,
  Send,
  Clock,
  Sparkles
} from "lucide-react";
import { LoanOfficerProfile, ProfessionalGuidesState } from "../types";

interface LoanOfficerLoginViewProps {
  guidesState: ProfessionalGuidesState;
  onUpdateGuidesState: (newState: ProfessionalGuidesState) => void;
  onAuthenticate: (authenticatedLoId: string) => void;
  onBackToPublicSite: () => void;
}

export const LoanOfficerLoginView: React.FC<LoanOfficerLoginViewProps> = ({
  guidesState,
  onUpdateGuidesState,
  onAuthenticate,
  onBackToPublicSite,
}) => {
  const [activeTab, setActiveTab] = useState<"signin" | "setup_password" | "demo_accounts">("signin");
  
  // Sign-in Form
  const [email, setEmail] = useState<string>(() => guidesState.loanOfficer?.email || "mford@cfmtg.com");
  const [password, setPassword] = useState<string>(() => guidesState.loanOfficer?.password || (guidesState.loanOfficer?.isAdmin ? "admin123" : "pass123"));
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Setup / Reset Password Form
  const [setupLoId, setSetupLoId] = useState<string>(guidesState.loanOfficers[0]?.id || "");
  const [inputResetPin, setInputResetPin] = useState<string>("");
  const [adminCurrentPassword, setAdminCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");
  const [setupSuccessMessage, setSetupSuccessMessage] = useState<string | null>(null);
  const [setupErrorMessage, setSetupErrorMessage] = useState<string | null>(null);

  const selectedTargetLo = guidesState.loanOfficers.find(l => l.id === setupLoId) || guidesState.loanOfficers[0];
  const isSelectedAdmin = selectedTargetLo?.isAdmin;
  const isResetAuthorized = selectedTargetLo?.passwordResetAuthorized === true;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const matchedLo = guidesState.loanOfficers.find(
      lo => lo.email.toLowerCase() === cleanEmail || 
            (lo.isAdmin && (cleanEmail === "mford@cfmtg.com" || cleanEmail === "fordmj@gmail.com"))
    );

    if (!matchedLo) {
      setErrorMessage("No loan officer account found with this email address. Please check your spelling or contact Branch Admin.");
      return;
    }

    // Check password (fallback to "admin123" for admin, "pass123" for LOs if not set)
    const expectedPassword = matchedLo.password || (matchedLo.isAdmin ? "admin123" : "pass123");
    if (password !== expectedPassword) {
      setErrorMessage("Incorrect password. If you forgot your password, ask Branch Manager (Mike Ford) to authorize a password reset.");
      return;
    }

    // Success: authenticate
    onAuthenticate(matchedLo.id);
  };

  // Request Reset Authorization from Admin (Mike Ford)
  const handleRequestResetAuthorization = (loId: string) => {
    setSetupErrorMessage(null);
    setSetupSuccessMessage(null);

    const now = new Date().toISOString();
    const updatedLos = guidesState.loanOfficers.map(lo => {
      if (lo.id === loId) {
        return {
          ...lo,
          passwordResetRequestedAt: now,
          passwordResetAuthorized: false
        };
      }
      return lo;
    });

    const target = guidesState.loanOfficers.find(l => l.id === loId);
    onUpdateGuidesState({
      ...guidesState,
      loanOfficers: updatedLos,
      loanOfficer: target ? { ...target, passwordResetRequestedAt: now, passwordResetAuthorized: false } : guidesState.loanOfficer
    });

    setSetupSuccessMessage(`Password reset request submitted for ${target?.name}! Branch Manager (Mike Ford) will see this in the Admin Hub.`);
  };

  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setSetupErrorMessage(null);
    setSetupSuccessMessage(null);

    const targetLo = guidesState.loanOfficers.find(l => l.id === setupLoId);
    if (!targetLo) {
      setSetupErrorMessage("Selected loan officer account not found.");
      return;
    }

    // Security Gate: If non-admin LO and not authorized, block reset
    if (!targetLo.isAdmin && !targetLo.passwordResetAuthorized) {
      setSetupErrorMessage("Password reset is locked. You must have Branch Manager (Mike Ford) click 'Authorize LO Password Reset' in your profile first.");
      return;
    }

    // If PIN is set on profile, verify PIN
    if (!targetLo.isAdmin && targetLo.passwordResetPin && targetLo.passwordResetPin !== inputResetPin.trim()) {
      setSetupErrorMessage("Incorrect Admin Reset Authorization PIN. Please check with Mike Ford.");
      return;
    }

    // If Admin resetting own password, verify previous password or passkey
    if (targetLo.isAdmin) {
      const currentExpected = targetLo.password || "admin123";
      if (adminCurrentPassword && adminCurrentPassword !== currentExpected) {
        setSetupErrorMessage("Current Master Admin password does not match.");
        return;
      }
    }

    if (!newPassword || newPassword.length < 4) {
      setSetupErrorMessage("Password must be at least 4 characters long.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setSetupErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    const updatedLos = guidesState.loanOfficers.map(lo => {
      if (lo.id === setupLoId) {
        return { 
          ...lo, 
          password: newPassword,
          passwordResetAuthorized: false, // Single-use authorization token consumed
          passwordResetRequestedAt: undefined,
          passwordResetAuthorizedAt: undefined,
          passwordResetPin: undefined
        };
      }
      return lo;
    });

    onUpdateGuidesState({
      ...guidesState,
      loanOfficers: updatedLos,
      loanOfficer: targetLo ? { 
        ...targetLo, 
        password: newPassword,
        passwordResetAuthorized: false,
        passwordResetRequestedAt: undefined,
        passwordResetAuthorizedAt: undefined,
        passwordResetPin: undefined
      } : guidesState.loanOfficer
    });

    setSetupSuccessMessage(`Password successfully updated for ${targetLo?.name}! Signing you in...`);
    
    setTimeout(() => {
      onAuthenticate(setupLoId);
    }, 1200);
  };

  const handleOneClickLogin = (lo: LoanOfficerProfile) => {
    onAuthenticate(lo.id);
  };

  return (
    <div className="min-h-screen bg-[#F4F1EA] flex flex-col justify-between p-4 sm:p-6 lg:p-8 text-[#2D362E]">
      {/* Top Header */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between py-2 border-b border-[#EAE7E0]/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#4A5D4E] text-white flex items-center justify-center font-serif font-bold text-lg shadow-sm">
            {(guidesState.loanOfficer?.company || guidesState.loanOfficers[0]?.company || "Cornerstone First Mortgage")[0]}
          </div>
          <div>
            <span className="font-serif font-bold text-base text-[#2D362E]">
              {guidesState.loanOfficer?.company || guidesState.loanOfficers[0]?.company || "Cornerstone First Mortgage"}
            </span>
            <p className="text-[11px] text-[#606C5D]">
              Private Loan Officer & Partner Management Hub
            </p>
          </div>
        </div>

        <button
          onClick={onBackToPublicSite}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-[#EAE7E0] hover:bg-[#F9F8F4] text-xs font-semibold text-[#4A5D4E] transition-colors shadow-2xs"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Return to Homebuyer Site</span>
        </button>
      </header>

      {/* Main Authentication Box */}
      <main className="max-w-xl w-full mx-auto my-8 space-y-6">
        {/* Security / Privacy Warning Banner */}
        <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-3xl p-4 sm:p-5 shadow-2xs flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-[#4A5D4E]/10 flex items-center justify-center text-[#4A5D4E] shrink-0 mt-0.5">
            <Lock className="w-4 h-4" />
          </div>
          <div className="text-xs space-y-1">
            <div className="font-bold text-[#2D362E] flex items-center gap-2">
              <span>Private Branch Credential Access</span>
              <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded-full">
                Protected Portal
              </span>
            </div>
            <p className="text-[#606C5D] leading-relaxed">
              This private hub is exclusively for licensed Mortgage Loan Officers and Real Estate Partners to manage their tailored dashboards, leads, and co-branded pairing links. Public users cannot access these internal tools without authenticating.
            </p>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-3xl border border-[#EAE7E0] shadow-xl overflow-hidden">
          {/* Card Tabs */}
          <div className="grid grid-cols-3 border-b border-[#EAE7E0] bg-[#FAF9F5] text-xs font-bold">
            <button
              onClick={() => { setActiveTab("signin"); setErrorMessage(null); }}
              className={`py-3.5 text-center transition-colors border-b-2 ${
                activeTab === "signin"
                  ? "border-[#4A5D4E] text-[#4A5D4E] bg-white"
                  : "border-transparent text-[#606C5D] hover:text-[#2D362E]"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setActiveTab("setup_password"); setSetupErrorMessage(null); }}
              className={`py-3.5 text-center transition-colors border-b-2 ${
                activeTab === "setup_password"
                  ? "border-[#4A5D4E] text-[#4A5D4E] bg-white"
                  : "border-transparent text-[#606C5D] hover:text-[#2D362E]"
              }`}
            >
              Set / Reset Password
            </button>
            <button
              onClick={() => setActiveTab("demo_accounts")}
              className={`py-3.5 text-center transition-colors border-b-2 ${
                activeTab === "demo_accounts"
                  ? "border-[#4A5D4E] text-[#4A5D4E] bg-white"
                  : "border-transparent text-[#606C5D] hover:text-[#2D362E]"
              }`}
            >
              Quick Test Sign-In
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {/* TAB 1: SIGN IN */}
            {activeTab === "signin" && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="text-center space-y-1 pb-2">
                  <h2 className="font-serif font-bold text-xl text-[#2D362E]">
                    Loan Officer Sign In
                  </h2>
                  <p className="text-xs text-[#606C5D]">
                    Enter your official branch email and private password.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2D362E]">Loan Officer Email</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#9A9488] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. mford@cfmtg.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#2D362E]">Password</label>
                    <button
                      type="button"
                      onClick={() => setActiveTab("setup_password")}
                      className="text-[11px] text-[#4A5D4E] hover:underline"
                    >
                      Forgot / Set up password?
                    </button>
                  </div>
                  <div className="relative">
                    <Key className="w-4 h-4 text-[#9A9488] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9A9488] hover:text-[#2D362E]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  id="lo-private-signin-btn"
                  className="w-full py-3 px-4 bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-bold rounded-xl shadow-md transition-transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-[#E7C19D]" />
                  <span>Authenticate & Enter Hub</span>
                </button>
              </form>
            )}

            {/* TAB 2: SETUP / RESET PASSWORD */}
            {activeTab === "setup_password" && (
              <div className="space-y-4">
                <div className="text-center space-y-1 pb-1">
                  <h2 className="font-serif font-bold text-xl text-[#2D362E]">
                    Set Up / Reset Password
                  </h2>
                  <p className="text-xs text-[#606C5D]">
                    Configure your private password for your unique Loan Officer profile.
                  </p>
                </div>

                {setupErrorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{setupErrorMessage}</span>
                  </div>
                )}

                {setupSuccessMessage && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                    <span>{setupSuccessMessage}</span>
                  </div>
                )}

                {/* Account Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2D362E]">Select Your Loan Officer Account</label>
                  <select
                    value={setupLoId}
                    onChange={(e) => {
                      setSetupLoId(e.target.value);
                      setSetupErrorMessage(null);
                      setSetupSuccessMessage(null);
                    }}
                    className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-3 py-2.5 text-xs font-semibold text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
                  >
                    {guidesState.loanOfficers.map(lo => (
                      <option key={lo.id} value={lo.id}>
                        {lo.name} ({lo.email}) {lo.isAdmin ? "• 👑 Branch Manager / Admin" : (lo.passwordResetAuthorized ? "• ✅ Reset Authorized" : "• 🔒 Reset Protected")}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Security Gate: Non-Admin LO without Authorization */}
                {!isSelectedAdmin && !isResetAuthorized && (
                  <div className="bg-amber-50/80 border border-amber-300 rounded-2xl p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0 mt-0.5">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                          <span>Branch Admin Authorization Required</span>
                          <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-semibold">Locked</span>
                        </h4>
                        <p className="text-[11px] text-amber-900/90 leading-relaxed">
                          To protect consumer lead privacy and prevent unauthorized account access, loan officers cannot reset passwords until <strong>Branch Manager Admin (Mike Ford)</strong> authorizes the reset from within the Loan Officer Management Hub.
                        </p>
                      </div>
                    </div>

                    {selectedTargetLo?.passwordResetRequestedAt ? (
                      <div className="bg-white/80 p-3 rounded-xl border border-amber-200 space-y-2 text-xs">
                        <div className="flex items-center gap-1.5 text-amber-900 font-semibold text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-amber-700 animate-spin" />
                          <span>Reset Request Submitted on {new Date(selectedTargetLo.passwordResetRequestedAt).toLocaleDateString()} at {new Date(selectedTargetLo.passwordResetRequestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-[11px] text-[#606C5D]">
                          Mike Ford has been notified. Once Mike Ford clicks <strong>&quot;Authorize LO Password Reset&quot;</strong> in your profile, this form will instantly unlock for you.
                        </p>
                        <button
                          type="button"
                          onClick={() => handleRequestResetAuthorization(selectedTargetLo.id)}
                          className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>Re-ping Mike Ford with Reset Request Alert</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRequestResetAuthorization(selectedTargetLo.id)}
                        className="w-full py-2.5 px-4 bg-amber-900 hover:bg-amber-950 text-white text-xs font-bold rounded-xl shadow-2xs flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] active:scale-[0.99]"
                      >
                        <Send className="w-3.5 h-3.5 text-amber-300" />
                        <span>Request Password Reset from Mike Ford (Admin)</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Security Gate: Non-Admin LO WITH Authorization */}
                {!isSelectedAdmin && isResetAuthorized && (
                  <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3.5 space-y-1.5">
                    <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Password Reset Authorized by Mike Ford (Branch Manager)</span>
                    </div>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      Authorization granted on {selectedTargetLo?.passwordResetAuthorizedAt ? new Date(selectedTargetLo.passwordResetAuthorizedAt).toLocaleDateString() : "today"}. Please set your new private password below.
                    </p>
                  </div>
                )}

                {/* Security Gate: Admin Account */}
                {isSelectedAdmin && (
                  <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-950 font-bold text-xs">
                      <span>👑</span>
                      <span>Branch Manager Master Account (Mike Ford)</span>
                    </div>
                    <p className="text-[11px] text-amber-800">
                      Enter your current master password to verify identity before setting a new admin key.
                    </p>
                  </div>
                )}

                {/* Password Form (Shown if Admin OR if Authorized) */}
                {(isSelectedAdmin || isResetAuthorized) && (
                  <form onSubmit={handleSaveNewPassword} className="space-y-4 pt-1">
                    {isSelectedAdmin && (
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#2D362E]">Current Master Password</label>
                        <div className="relative">
                          <Key className="w-4 h-4 text-[#9A9488] absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="password"
                            required
                            placeholder="Enter current admin password (default: admin123)"
                            value={adminCurrentPassword}
                            onChange={(e) => setAdminCurrentPassword(e.target.value)}
                            className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
                          />
                        </div>
                      </div>
                    )}

                    {selectedTargetLo?.passwordResetPin && (
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#2D362E]">Admin Reset Authorization PIN</label>
                        <div className="relative">
                          <KeyRound className="w-4 h-4 text-[#9A9488] absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            maxLength={6}
                            placeholder="Enter 4-digit PIN provided by Mike Ford"
                            value={inputResetPin}
                            onChange={(e) => setInputResetPin(e.target.value)}
                            className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl pl-10 pr-3 py-2.5 text-xs font-mono font-bold text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#2D362E]">New Private Password</label>
                      <div className="relative">
                        <Key className="w-4 h-4 text-[#9A9488] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          required
                          placeholder="Enter new password (min 4 characters)"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#2D362E]">Confirm New Password</label>
                      <div className="relative">
                        <Key className="w-4 h-4 text-[#9A9488] absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          required
                          placeholder="Re-type new password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 px-4 bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-bold rounded-xl shadow-md transition-transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#E7C19D]" />
                      <span>Save Password & Enter Dashboard</span>
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* TAB 3: QUICK TEST SIGN-IN / DEMO ROSTER */}
            {activeTab === "demo_accounts" && (
              <div className="space-y-3">
                <div className="text-center space-y-1 pb-1">
                  <h2 className="font-serif font-bold text-lg text-[#2D362E]">
                    Team Loan Officer Accounts
                  </h2>
                  <p className="text-xs text-[#606C5D]">
                    Click any Loan Officer to sign in with their unique profile, or test Mike Ford Admin rights.
                  </p>
                </div>

                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {guidesState.loanOfficers.map(lo => {
                    const isSuper = lo.isAdmin || lo.id === guidesState.adminLoanOfficerId;
                    return (
                      <div
                        key={lo.id}
                        onClick={() => handleOneClickLogin(lo)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSuper 
                            ? "bg-amber-50/70 border-amber-200 hover:border-amber-400 hover:shadow-xs" 
                            : "bg-[#FAF9F5] border-[#EAE7E0] hover:border-[#4A5D4E] hover:shadow-xs"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={lo.headshotUrl}
                            alt={lo.name}
                            className="w-11 h-11 rounded-xl object-cover border border-white shadow-xs shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&auto=format&fit=crop&q=80";
                            }}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-[#2D362E]">{lo.name}</span>
                              {isSuper ? (
                                <span className="text-[9px] bg-amber-200 text-amber-950 font-bold px-1.5 py-0.5 rounded-md">
                                  👑 Branch Manager / Admin
                                </span>
                              ) : (
                                <span className="text-[9px] bg-emerald-100 text-emerald-900 font-semibold px-1.5 py-0.5 rounded-md">
                                  Team LO
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#606C5D]">{lo.title} • {lo.nmlsId}</p>
                            <p className="text-[10px] text-[#9A9488] font-mono">{lo.email}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="px-3 py-1.5 bg-[#4A5D4E] text-white text-[11px] font-bold rounded-xl shrink-0 flex items-center gap-1 shadow-2xs hover:bg-[#38463B]"
                        >
                          <span>Sign In</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto text-center py-3 text-[11px] text-[#9A9488] border-t border-[#EAE7E0]/80">
        {guidesState.loanOfficer?.company || guidesState.loanOfficers[0]?.company || "Mortgage Lending Organization"} • Confidential & Proprietary Platform • {guidesState.loanOfficer?.nmlsId || "NMLS Verified"}
      </footer>
    </div>
  );
};
