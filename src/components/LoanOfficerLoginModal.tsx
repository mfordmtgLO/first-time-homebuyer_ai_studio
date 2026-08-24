import React, { useState } from "react";
import { ShieldCheck, Lock, User, Key, CheckCircle2, ArrowRight, X } from "lucide-react";
import { LoanOfficerProfile } from "../types";

interface LoanOfficerLoginModalProps {
  loanOfficer: LoanOfficerProfile;
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const LoanOfficerLoginModal: React.FC<LoanOfficerLoginModalProps> = ({
  loanOfficer,
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState(loanOfficer.email);
  const [password, setPassword] = useState("pass123");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your loan officer email.");
      return;
    }
    // Authenticate and open portal
    onLoginSuccess();
    onClose();
  };

  const handleQuickDemoLogin = () => {
    setEmail(loanOfficer.email);
    setPassword("password123");
    onLoginSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 border border-[#EAE7E0] shadow-2xl animate-in zoom-in-95 duration-150 text-[#2D362E]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#4A5D4E] flex items-center justify-center text-white font-bold text-sm shadow-xs">
              LO
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#2D362E]">
                Loan Officer & Partner Portal
              </h3>
              <p className="text-[11px] text-[#9A9488]">Manage co-branded agent pairings & profile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#9A9488] hover:text-[#2D362E] hover:bg-[#F1EFE9] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Sign-In Box */}
        <div className="bg-[#F1EFE9] rounded-2xl p-4 border border-[#EAE7E0] space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#4A5D4E]">
            <ShieldCheck className="w-4 h-4 text-[#C18C5D]" />
            <span>Welcome, {loanOfficer.name}</span>
          </div>
          <p className="text-xs text-[#606C5D]">
            Sign in to add real estate agent headshots, contact information, and select which partner agent is paired on the public website.
          </p>
          <button
            id="quick-demo-lo-login-btn"
            type="button"
            onClick={handleQuickDemoLogin}
            className="w-full py-2 px-3 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <span>1-Click Sign In as {loanOfficer.name} (LO)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#606C5D]">Loan Officer Email</label>
            <div className="relative">
              <User className="w-4 h-4 text-[#9A9488] absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#4A5D4E]"
                placeholder="mike.ford@pacificlending.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#606C5D]">Password</label>
            <div className="relative">
              <Key className="w-4 h-4 text-[#9A9488] absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#4A5D4E]"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#606C5D] hover:bg-[#F1EFE9] rounded-xl"
            >
              Cancel
            </button>
            <button
              id="lo-submit-login-btn"
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#2D362E] hover:bg-[#1E241F] rounded-xl shadow-xs"
            >
              Sign In to Hub
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
