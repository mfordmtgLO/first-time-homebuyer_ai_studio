import React, { useEffect, useState } from "react";
import { Clock, RefreshCw } from "lucide-react";
import { getRentCastUsage, resetRentCastUsage, RENTCAST_FREE_TIER_LIMIT } from "../utils/rentcastUsageService";

export const RentCastUsageCounter: React.FC = () => {
  const [pulls, setPulls] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      const usage = await getRentCastUsage();
      setPulls(usage.pulls);
      setLoading(false);
    };
    fetchUsage();
  }, []);

  const handleReset = async () => {
    setLoading(true);
    await resetRentCastUsage();
    setPulls(0);
    setLoading(false);
  };

  const percentage = Math.min((pulls / RENTCAST_FREE_TIER_LIMIT) * 100, 100);
  const remaining = Math.max(RENTCAST_FREE_TIER_LIMIT - pulls, 0);

  return (
    <div className="bg-white rounded-2xl border border-[#EAE7E0] p-4 sm:p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-[#EAE7E0]/70 pb-3">
        <h3 className="text-xs font-bold text-[#2D362E] flex items-center gap-2 uppercase tracking-wide">
          <Clock className="w-4 h-4 text-emerald-700" />
          RENTCAST API USAGE
        </h3>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
          Property Value Pulls
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-[#606C5D]">{pulls} / {RENTCAST_FREE_TIER_LIMIT}</span>
          <span className={remaining > 0 ? "text-emerald-700" : "text-red-600"}>
            Ready — {remaining} pulls available
          </span>
        </div>
        
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 rounded-full ${percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="pt-3 border-t border-[#EAE7E0]/70 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-[10px] text-[#606C5D]">
          Resets counter to 0. Use on billing cycle date 6th.
        </p>
        <button
          onClick={handleReset}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 hover:text-orange-900 border border-orange-200 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Reset Monthly Counter (Admin)
        </button>
      </div>
    </div>
  );
};
