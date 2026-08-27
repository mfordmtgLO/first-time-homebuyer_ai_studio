import React from "react";
import { AlertCircle, Info, ExternalLink, ShieldCheck } from "lucide-react";
import { SCREENING_DISCLAIMER_COPY } from "../utils/overlayClassification";

interface ScreeningDisclaimerBannerProps {
  className?: string;
  variant?: "full" | "compact" | "inline";
  showZillowNote?: boolean;
}

export const ScreeningDisclaimerBanner: React.FC<ScreeningDisclaimerBannerProps> = ({
  className = "",
  variant = "full",
  showZillowNote = true,
}) => {
  if (variant === "inline") {
    return (
      <div className={`flex items-start sm:items-center gap-2 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-[11px] leading-relaxed ${className}`}>
        <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5 sm:mt-0" />
        <p className="flex-1">
          <strong className="font-semibold text-amber-950">Screening Aid Only:</strong> Not a loan approval. Listings are point-in-time snapshots and do not indicate verified current active/pending/sold MLS status.
        </p>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`p-3 sm:p-4 rounded-2xl bg-[#FAF9F5] border border-amber-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-2xs ${className}`}>
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-100/80 text-amber-800 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
            <Info className="w-3.5 h-3.5" />
          </div>
          <div className="space-y-0.5">
            <h5 className="font-bold text-[#2D362E] flex items-center gap-1.5 text-xs">
              <span>Screening Aid & Point-in-Time Snapshot Notice</span>
              <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                Not a Loan Approval
              </span>
            </h5>
            <p className="text-[11px] text-[#606C5D] leading-snug">
              This is an educational screening aid, not an approval. Property listings and GIS overlay tags are snapshots in time — not an indication of verified current active, pending, or sold live status.
            </p>
          </div>
        </div>

        {showZillowNote && (
          <div className="shrink-0 text-[10px] text-stone-500 font-medium sm:text-right border-t sm:border-t-0 border-stone-200 pt-1.5 sm:pt-0 w-full sm:w-auto">
            Use the <span className="font-bold text-blue-700">"View on Zillow ↗"</span> button on each card for live status.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`p-4 sm:p-5 rounded-2xl bg-[#FAF9F5] border border-[#EAE7E0] space-y-2.5 shadow-2xs ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAE7E0]/70 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center">
            <AlertCircle className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-[#2D362E] tracking-tight">
            Important Information: Screening Aid & Market Status Notice
          </span>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 w-fit">
          Educational Pre-Screening Only
        </span>
      </div>

      <div className="text-xs text-[#606C5D] space-y-1.5 leading-relaxed">
        <p>
          <strong className="text-[#2D362E] font-bold">This is a screening aid, not an approval:</strong> Automated DPA qualifications, USDA eligibility, and payment estimates are pre-calculated tools for discovery and planning. They do not constitute a commitment to lend, loan pre-approval, or official underwriting qualification.
        </p>
        <p>
          <strong className="text-[#2D362E] font-bold">Snapshots in time:</strong> Property listings, pricing, and availability records reflect point-in-time database snapshots and do not represent verified real-time active, pending, contingent, or sold live MLS market status.
        </p>
      </div>

      {showZillowNote && (
        <div className="pt-2 border-t border-[#EAE7E0]/60 flex items-center justify-between text-[11px] text-[#606C5D]">
          <span>Always verify current price and listing status on live MLS feeds.</span>
          <span className="text-blue-700 font-semibold flex items-center gap-1">
            <span>Direct 1-Click Zillow.com links provided on every listing</span>
            <ExternalLink className="w-3 h-3" />
          </span>
        </div>
      )}
    </div>
  );
};
