import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  RefreshCw, 
  Sparkles, 
  Globe, 
  ExternalLink, 
  CheckCircle2, 
  ShieldCheck, 
  Info, 
  ArrowRight, 
  Calendar, 
  Building, 
  DollarSign,
  Search,
  Lock,
  Percent
} from "lucide-react";
import { FinancialProfile } from "../types";
import { formatUSD, calculateMonthlyPI } from "../utils/mortgageMath";

interface RateProduct {
  name: string;
  shortName: string;
  key: "conforming30Yr" | "fixed15Yr" | "fha30Yr" | "va30Yr" | "jumbo30Yr" | "arm5_1";
  rate: number;
  termYears: number;
  description: string;
  tag?: string;
}

interface GroundedSource {
  title: string;
  url: string;
}

interface RateApiResponse {
  success: boolean;
  isGrounded: boolean;
  timestamp: string;
  asOfDate: string;
  rates: {
    conforming30Yr: number;
    fixed15Yr: number;
    fha30Yr: number;
    va30Yr: number;
    jumbo30Yr: number;
    arm5_1: number;
    treasury10Yr: number;
  };
  trend: {
    direction: "down" | "up" | "stable";
    directionLabel: string;
    weeklyChangeBps: number;
  };
  summary: string;
  sources: GroundedSource[];
  webSearchQueries?: string[];
  fallbackNote?: string;
}

interface RealTimeMortgageRateTrackerProps {
  profile: FinancialProfile;
  setProfile?: React.Dispatch<React.SetStateAction<FinancialProfile>>;
  onNavigate?: (tab: string, mode?: "website" | "dashboard") => void;
}

export const RealTimeMortgageRateTracker: React.FC<RealTimeMortgageRateTrackerProps> = ({
  profile,
  setProfile,
  onNavigate,
}) => {
  const [data, setData] = useState<RateApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [appliedRateKey, setAppliedRateKey] = useState<string | null>(null);
  const [showSourcesModal, setShowSourcesModal] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<string>("conforming30Yr");

  // Approximate loan balance for live P&I payment preview
  const estimatedLoanAmount = Math.max(50000, profile.targetPrice - profile.downPaymentSavings);

  const fetchRates = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/rates/search-grounded", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceRefresh, state: profile.state || "US" }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const result: RateApiResponse = await response.json();
      setData(result);
    } catch (err: any) {
      console.error("Failed to fetch search-grounded mortgage rates:", err);
      setError(err.message || "Failed to load live rates. Using standard benchmarks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates(false);
  }, []);

  const handleApplyRate = (rateValue: number, productKey: string) => {
    if (setProfile) {
      setProfile((prev) => ({
        ...prev,
        interestRate: rateValue,
      }));
      setAppliedRateKey(productKey);
      setTimeout(() => {
        setAppliedRateKey(null);
      }, 3500);
    }
  };

  const currentRates = data?.rates || {
    conforming30Yr: 6.48,
    fixed15Yr: 5.72,
    fha30Yr: 6.18,
    va30Yr: 6.09,
    jumbo30Yr: 6.55,
    arm5_1: 6.22,
    treasury10Yr: 4.28,
  };

  const rateProducts: RateProduct[] = [
    {
      name: "30-Year Fixed (Conforming)",
      shortName: "30-Yr Fixed",
      key: "conforming30Yr",
      rate: currentRates.conforming30Yr,
      termYears: 30,
      description: "Most popular conventional first-time buyer mortgage. Rates locked for full 360 months.",
      tag: "Benchmark",
    },
    {
      name: "15-Year Fixed",
      shortName: "15-Yr Fixed",
      key: "fixed15Yr",
      rate: currentRates.fixed15Yr,
      termYears: 15,
      description: "Lowest interest expense over life of loan; higher monthly principal amortization.",
      tag: "Low Total Interest",
    },
    {
      name: "30-Year FHA Fixed",
      shortName: "30-Yr FHA",
      key: "fha30Yr",
      rate: currentRates.fha30Yr,
      termYears: 30,
      description: "Government-backed loan with 3.5% down option and lenient credit requirements.",
      tag: "3.5% Down Option",
    },
    {
      name: "30-Year VA Fixed",
      shortName: "30-Yr VA",
      key: "va30Yr",
      rate: currentRates.va30Yr,
      termYears: 30,
      description: "Zero down payment for eligible military veterans and active-duty service members.",
      tag: "0% Down for Veterans",
    },
    {
      name: "30-Year Jumbo Loan",
      shortName: "30-Yr Jumbo",
      key: "jumbo30Yr",
      rate: currentRates.jumbo30Yr,
      termYears: 30,
      description: "Exceeds conforming county loan limits (typically >$806,495 baseline in 2026).",
    },
    {
      name: "5/1 Hybrid ARM",
      shortName: "5/1 ARM",
      key: "arm5_1",
      rate: currentRates.arm5_1,
      termYears: 30,
      description: "Fixed rate for the initial 5 years, then adjusts annually based on benchmark SOFR.",
    },
  ];

  const trend = data?.trend || {
    direction: "down",
    directionLabel: "Easing / Rangebound",
    weeklyChangeBps: -4,
  };

  return (
    <div className="bg-white rounded-3xl border border-[#EAE7E0] p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EAE7E0]">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF3ED] text-[#2F5738] text-xs font-bold border border-[#C2DEC8]">
              <Search className="w-3.5 h-3.5" />
              <span>Search-Grounded Market Intelligence</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FAF9F5] text-[#606C5D] text-xs font-medium border border-[#EAE7E0]">
              <Lock className="w-3 h-3 text-[#C18C5D]" />
              <span>Dashboard Private Tool</span>
            </span>

            {data?.asOfDate && (
              <span className="text-xs text-[#9A9488] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#606C5D]" />
                <span>As of {data.asOfDate}</span>
              </span>
            )}
          </div>

          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#2D362E] flex items-center gap-2">
            <span>Real-Time National Mortgage Rates</span>
            {data?.isGrounded && (
              <span className="text-[11px] font-sans font-semibold text-[#4A5D4E] bg-[#F1EFE9] px-2 py-0.5 rounded-md border border-[#EAE7E0]">
                Google Grounded
              </span>
            )}
          </h3>

          <p className="text-xs sm:text-sm text-[#606C5D]">
            Live national average benchmarks retrieved via real-time search grounding. Test scenarios and apply live market rates directly to your purchase plan.
          </p>
        </div>

        {/* Live Refresh Button & Treasury Benchmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="bg-[#FAF9F5] px-3 py-2 rounded-xl border border-[#EAE7E0] text-right hidden sm:block">
            <span className="text-[10px] font-bold text-[#9A9488] uppercase block">10-Yr Treasury</span>
            <span className="text-sm font-bold text-[#2D362E]">{currentRates.treasury10Yr.toFixed(2)}%</span>
          </div>

          <button
            type="button"
            onClick={() => fetchRates(true)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] disabled:bg-[#9A9488] text-white font-semibold text-xs shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
            title="Fetch the latest national mortgage interest rates using real-time search grounding"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Searching Live Web..." : "Refresh Live Rates"}</span>
          </button>
        </div>
      </div>

      {/* Applied Rate Toast Alert */}
      {appliedRateKey && (
        <div className="bg-[#EBF3ED] border border-[#C2DEC8] text-[#2F5738] rounded-2xl p-4 flex items-center justify-between gap-3 text-xs font-semibold animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#2F5738] shrink-0" />
            <span>
              Updated your active financial profile interest rate to <strong>{profile.interestRate.toFixed(2)}%</strong>! Your dashboard DTI and max safe price have recalculated automatically.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setAppliedRateKey(null)}
            className="text-[#2F5738] hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Macro Momentum Status Banner */}
      <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE7E0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
            trend.direction === "down"
              ? "bg-[#EBF3ED] text-[#2F5738] border border-[#C2DEC8]"
              : trend.direction === "up"
              ? "bg-[#FDF0E6] text-[#91461A] border border-[#F6D0B5]"
              : "bg-[#F1EFE9] text-[#606C5D] border border-[#EAE7E0]"
          }`}>
            {trend.direction === "down" ? (
              <TrendingDown className="w-5 h-5 text-[#2F5738]" />
            ) : trend.direction === "up" ? (
              <TrendingUp className="w-5 h-5 text-[#91461A]" />
            ) : (
              <Minus className="w-5 h-5 text-[#606C5D]" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-xs sm:text-sm text-[#2D362E]">
                Rate Momentum: {trend.directionLabel}
              </h4>
              <span className="text-[11px] font-bold text-[#606C5D]">
                ({trend.weeklyChangeBps > 0 ? `+${trend.weeklyChangeBps}` : trend.weeklyChangeBps} bps week/week)
              </span>
            </div>
            <p className="text-xs text-[#606C5D]">
              {trend.direction === "down" 
                ? "Bond yields have eased slightly, offering first-time buyers improved monthly purchasing power."
                : "Bond yields remain sensitive to inflation and macroeconomic employment data."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {data?.sources && data.sources.length > 0 && (
            <button
              type="button"
              onClick={() => setShowSourcesModal(true)}
              className="text-xs font-semibold text-[#4A5D4E] hover:text-[#2D362E] flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-[#EAE7E0] hover:bg-[#F1EFE9] transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-[#4A5D4E]" />
              <span>{data.sources.length} Grounded Sources</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of Rate Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rateProducts.map((prod) => {
          const isSelected = profile.interestRate === prod.rate;
          const monthlyPI = calculateMonthlyPI(estimatedLoanAmount, prod.rate, prod.termYears);

          return (
            <div
              key={prod.key}
              className={`rounded-2xl border p-5 space-y-3 transition-all relative ${
                isSelected
                  ? "bg-[#FAF9F5] border-[#4A5D4E] ring-2 ring-[#4A5D4E]/20 shadow-sm"
                  : "bg-white border-[#EAE7E0] hover:border-[#DEDAD2] hover:bg-[#F9F8F4] shadow-xs"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-[#606C5D] block">{prod.name}</span>
                  {prod.tag && (
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F1EFE9] text-[#4A5D4E] border border-[#EAE7E0]">
                      {prod.tag}
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-2xl font-serif font-bold text-[#2D362E] block">
                    {prod.rate.toFixed(2)}%
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#606C5D] leading-relaxed min-h-[36px]">
                {prod.description}
              </p>

              {/* Monthly P&I estimate calculation based on target price */}
              <div className="pt-2 border-t border-[#EAE7E0] flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="text-[11px] text-[#9A9488]">Est. Monthly P&I</span>
                  <div className="font-bold text-[#2D362E]">
                    {formatUSD(monthlyPI)}
                    <span className="text-[10px] font-normal text-[#9A9488] ml-1">/mo</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleApplyRate(prod.rate, prod.key)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 ${
                    isSelected
                      ? "bg-[#4A5D4E] text-white cursor-default"
                      : "bg-[#F1EFE9] hover:bg-[#4A5D4E] text-[#4A5D4E] hover:text-white border border-[#EAE7E0]"
                  }`}
                  title={`Apply ${prod.rate.toFixed(2)}% as your active scenario interest rate`}
                >
                  {isSelected ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Active Rate</span>
                    </>
                  ) : (
                    <>
                      <span>Apply to Plan</span>
                      <ArrowRight className="w-3 h-3" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grounded Market Analysis & First-Time Buyer Strategic Advisory */}
      {data?.summary && (
        <div className="bg-[#FAF9F5] rounded-2xl border border-[#EAE7E0] p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#4A5D4E]">
            <Sparkles className="w-4 h-4 text-[#C18C5D]" />
            <span>Search-Grounded Market Analysis & First-Time Buyer Strategy</span>
          </div>

          <div className="text-xs sm:text-sm text-[#2D362E] leading-relaxed space-y-2 max-h-48 overflow-y-auto pr-2">
            {data.summary.split("\n\n").map((para, i) => (
              <p key={i} className="text-[#606C5D]">{para}</p>
            ))}
          </div>

          {data.sources && data.sources.length > 0 && (
            <div className="pt-3 border-t border-[#EAE7E0] flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[11px] font-bold text-[#9A9488]">Grounding Citations:</span>
              {data.sources.slice(0, 4).map((src, idx) => (
                <a
                  key={idx}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-[#F1EFE9] text-[#4A5D4E] text-[11px] font-medium border border-[#EAE7E0] transition-colors"
                >
                  <span className="truncate max-w-[200px]">{src.title}</span>
                  <ExternalLink className="w-3 h-3 text-[#9A9488]" />
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sources Modal */}
      {showSourcesModal && data?.sources && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-[#EAE7E0] shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE7E0]">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#4A5D4E]" />
                <h4 className="font-bold text-base text-[#2D362E]">Search-Grounded Sources</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowSourcesModal(false)}
                className="p-1 rounded-lg text-[#9A9488] hover:text-[#2D362E] hover:bg-[#F1EFE9]"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#606C5D]">
              The following verified market sources were retrieved live by Google Search Grounding to compute today's national mortgage interest rates:
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {data.sources.map((src, idx) => (
                <a
                  key={idx}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-[#FAF9F5] hover:bg-[#F1EFE9] border border-[#EAE7E0] transition-colors group"
                >
                  <div className="pr-3 truncate">
                    <span className="font-semibold text-xs text-[#2D362E] group-hover:text-[#4A5D4E] block truncate">
                      {src.title}
                    </span>
                    <span className="text-[10px] text-[#9A9488] truncate block">
                      {src.url}
                    </span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-[#9A9488] shrink-0 group-hover:text-[#4A5D4E]" />
                </a>
              ))}
            </div>

            {data.webSearchQueries && data.webSearchQueries.length > 0 && (
              <div className="pt-2 border-t border-[#EAE7E0] text-[11px] text-[#9A9488]">
                <strong>Search queries:</strong> {data.webSearchQueries.join(", ")}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSourcesModal(false)}
                className="px-4 py-2 rounded-xl bg-[#4A5D4E] text-white text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
