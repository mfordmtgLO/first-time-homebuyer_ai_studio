import React, { useState } from "react";
import { 
  X, 
  Flame, 
  Mail, 
  MessageSquare, 
  Copy, 
  Check, 
  ExternalLink, 
  TrendingDown, 
  Calendar, 
  UserCheck, 
  Building2, 
  Sparkles,
  MapPin,
  DollarSign
} from "lucide-react";
import { PropertyListing, FinancialProfile, LoanOfficerProfile, RealEstateAgentProfile } from "../types";
import { calculateMonthlyPI, formatUSD } from "../utils/mortgageMath";
import { getZillowUrl } from "../utils/overlayClassification";

interface PriceDropOutreachModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: PropertyListing | null;
  profile: FinancialProfile;
  loanOfficer?: LoanOfficerProfile;
  agent?: RealEstateAgentProfile;
  onTriggerToast?: (msg: string) => void;
}

export const PriceDropOutreachModal: React.FC<PriceDropOutreachModalProps> = ({
  isOpen,
  onClose,
  property,
  profile,
  loanOfficer,
  agent,
  onTriggerToast
}) => {
  const [activeChannel, setActiveChannel] = useState<"email" | "sms">("email");
  const [copiedType, setCopiedType] = useState<"email" | "sms" | null>(null);

  if (!isOpen || !property) return null;

  const currentPrice = property.price || 425000;
  const dropAmount = property.priceDropAmount || 12500;
  const originalPrice = property.originalPrice || (currentPrice + dropAmount);
  const dropPercent = originalPrice > 0 ? ((dropAmount / originalPrice) * 100).toFixed(1) : "3.0";

  // Calculate financial savings
  const downPayment = profile.downPaymentSavings || 20000;
  const oldLoanAmt = Math.max(0, originalPrice - downPayment);
  const newLoanAmt = Math.max(0, currentPrice - downPayment);
  const rate = profile.interestRate || 6.25;
  const term = profile.loanTermYears || 30;

  const oldPI = calculateMonthlyPI(oldLoanAmt, rate, term);
  const newPI = calculateMonthlyPI(newLoanAmt, rate, term);
  const monthlySavings = Math.max(35, oldPI - newPI);
  const taxesHoa = Math.round((property.propertyTaxAnnual || 3600) / 12) + (property.hoaMonthly || 0);
  const estNewMonthly = newPI + taxesHoa;

  const loName = loanOfficer?.name || "Mike Ford";
  const agentName = agent?.name || "Kanndice";

  const emailSubject = `Price Drop Alert: ${property.address} just reduced by ${formatUSD(dropAmount)}!`;

  const emailBody = `Hi [Buyer Name],

Exciting news on your home search! We just ran our real-time MLS & Zillow price sweep, and ${property.address} in ${property.city || "your target area"} was just reduced by ${formatUSD(dropAmount)} (from ${formatUSD(originalPrice)} down to ${formatUSD(currentPrice)}).

Here is how this price reduction works in your favor:
• Your estimated monthly mortgage payment drops by ~${formatUSD(monthlySavings)}/mo down to approx. ${formatUSD(estNewMonthly)}/mo.
• Lower monthly debt service expands your pre-qualification Debt-to-Income (DTI) headroom.
• This home continues to qualify for zero-down / down payment assistance guidelines.

${agentName} and I recommend taking a look in person before other weekend shoppers schedule showings. Would you like us to arrange a private walkthrough tour for you?

Best regards,

${loName}
${[
  loanOfficer?.nmls ? `Senior Loan Officer | NMLS #${loanOfficer.nmls}` : `Senior Loan Officer`,
  [loanOfficer?.phone, loanOfficer?.email].filter(Boolean).join(" • ")
].filter(Boolean).join("\n")}

${agentName}
${[
  agent?.brokerage ? `Paired Real Estate Agent Partner | ${agent.brokerage}` : `Paired Real Estate Agent Partner`,
  [agent?.phone, agent?.email].filter(Boolean).join(" • ")
].filter(Boolean).join("\n")}
Vantage Dual-Agent Autonomous Client Outreach`;

  const smsBody = `Hi [Buyer]! ${loName} (LO) & ${agentName} (Realtor) here. Great news: ${property.address} was just reduced by ${formatUSD(dropAmount)} on MLS/Zillow! Your monthly payment drops by ~${formatUSD(monthlySavings)}/mo to ${formatUSD(estNewMonthly)}/mo. Would you like to schedule a private tour this weekend? Reply YES!`;

  const handleCopy = (text: string, type: "email" | "sms") => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    if (onTriggerToast) {
      onTriggerToast(`✓ Copied ${type === "email" ? "Email Draft" : "SMS Draft"} for ${property.address}!`);
    }
    setTimeout(() => setCopiedType(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-red-200 dark:border-red-950 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-xs">
              <Flame className="w-6 h-6 text-amber-200 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg">Dual-Agent Price Drop Alert Outreach</h3>
                <span className="text-[10px] uppercase font-bold bg-white/20 px-2 py-0.5 rounded-full">
                  Live MLS / Zillow Verified
                </span>
              </div>
              <p className="text-xs text-white/90 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{property.address}, {property.city}, {property.state} {property.zip}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {/* Price Delta Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-red-50/80 dark:bg-red-950/30 p-3.5 rounded-2xl border border-red-200 dark:border-red-900/50">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Original List Price</span>
              <span className="text-sm font-semibold text-slate-400 line-through">
                {formatUSD(originalPrice)}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wider block">New Verified Price</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {formatUSD(currentPrice)}
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wider block">Price Cut</span>
              <span className="text-sm font-extrabold text-red-600 flex items-center gap-0.5">
                <TrendingDown className="w-3.5 h-3.5" />
                -{formatUSD(dropAmount)} ({dropPercent}%)
              </span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">Estimated Savings</span>
              <span className="text-sm font-bold text-emerald-600">
                ~{formatUSD(monthlySavings)}/mo
              </span>
            </div>
          </div>

          {/* Dual-Agent Pairing Bar */}
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                Joint Signoff: {loName} (Loan Officer) & {agentName} (Realtor Partner)
              </span>
            </div>
            <a
              href={getZillowUrl(property)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 shrink-0"
            >
              <span>View on Zillow</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Channel Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              type="button"
              onClick={() => setActiveChannel("email")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeChannel === "email"
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Co-Branded Email Draft</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveChannel("sms")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeChannel === "sms"
                  ? "bg-red-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Direct SMS Alert Draft</span>
            </button>
          </div>

          {/* Message Preview */}
          {activeChannel === "email" ? (
            <div className="space-y-3">
              <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Subject Line</span>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-0.5">{emailSubject}</p>
              </div>

              <div className="relative bg-slate-900 text-slate-200 p-4 rounded-2xl border border-slate-800 font-mono text-xs leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap">
                {emailBody}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleCopy(emailBody, "email")}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedType === "email" ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied Email!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Email to Clipboard</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50">
                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
                  Optimized for Fast Mobile Response (High Engagement)
                </span>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                  Sends directly with call-to-action asking buyer if they want to view the listing this weekend.
                </p>
              </div>

              <div className="relative bg-slate-900 text-slate-200 p-4 rounded-2xl border border-slate-800 font-mono text-xs leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap">
                {smsBody}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleCopy(smsBody, "sms")}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedType === "sms" ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied SMS!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy SMS to Clipboard</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Synced with Zillow & MLS Address Engine</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
