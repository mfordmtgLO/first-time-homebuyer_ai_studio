/**
 * Historical 30-Year Mortgage Benchmark Trend Analysis Engine
 * Calculates interest rate trajectories, momentum indicators, and 1-year historical matches
 * without exposing raw quoted percentage rates to the user interface.
 */

export type TrendHorizon = "1w" | "90d" | "6m";

export interface RateDataPoint {
  date: string; // YYYY-MM-DD
  rate: number; // Underlying 30-Yr Benchmark Rate
}

export interface TrendAnalysisResult {
  horizon: TrendHorizon;
  horizonLabel: string;
  direction: "up" | "down" | "flat";
  directionLabel: string;
  sentiment: "favorable" | "unfavorable" | "neutral";
  summary: string;
  diffBasisPoints: number; // e.g. -6 bps or +14 bps
  isOneYearHigh: boolean;
  oneYearHighRate: number;
  oneYearLowRate: number;
  lastMatchedDate: string | null; // e.g., "Nov 14, 2025"
  lastMatchedDateFormatted: string | null;
  insight: string;
}

// 52+ weeks historical benchmark dataset leading up to Aug 2026
export const HISTORICAL_BENCHMARK_RATES: RateDataPoint[] = [
  // 2025 Historical Curve
  { date: "2025-08-25", rate: 6.52 },
  { date: "2025-09-01", rate: 6.48 },
  { date: "2025-09-15", rate: 6.42 },
  { date: "2025-10-01", rate: 6.55 },
  { date: "2025-10-15", rate: 6.78 },
  { date: "2025-10-28", rate: 6.95 },
  { date: "2025-11-05", rate: 7.08 }, // 1-Year Peak at 7.08%
  { date: "2025-11-12", rate: 6.98 },
  { date: "2025-11-19", rate: 6.82 },
  { date: "2025-12-01", rate: 6.72 },
  { date: "2025-12-15", rate: 6.62 }, // Historical Exact Match with today! (Dec 15, 2025)
  { date: "2025-12-29", rate: 6.54 },
  
  // 2026 Historical Curve
  { date: "2026-01-12", rate: 6.45 },
  { date: "2026-01-26", rate: 6.38 }, // 1-Year Low around 6.38%
  { date: "2026-02-09", rate: 6.42 },
  { date: "2026-02-24", rate: 6.48 }, // 6 Months ago (~6.48%)
  { date: "2026-03-10", rate: 6.58 },
  { date: "2026-03-24", rate: 6.65 },
  { date: "2026-04-07", rate: 6.74 },
  { date: "2026-04-21", rate: 6.82 },
  { date: "2026-05-05", rate: 6.88 },
  { date: "2026-05-26", rate: 6.85 }, // 90 Days ago (~6.85%)
  { date: "2026-06-09", rate: 6.80 },
  { date: "2026-06-23", rate: 6.76 },
  { date: "2026-07-07", rate: 6.72 },
  { date: "2026-07-21", rate: 6.70 },
  { date: "2026-08-04", rate: 6.69 },
  { date: "2026-08-11", rate: 6.67 },
  { date: "2026-08-17", rate: 6.68 }, // 1 Week ago (~6.68%)
  { date: "2026-08-24", rate: 6.62 }, // Today's Current Benchmark (~6.62%)
];

/**
 * Format a YYYY-MM-DD string to Month Day, Year (e.g. Dec 15, 2025)
 */
export function formatRateDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC"
    });
  } catch {
    return dateStr;
  }
}

/**
 * Compute the Rate Trend Analysis based on the selected timeline
 */
export function analyzeRateTrends(
  horizon: TrendHorizon = "1w",
  history: RateDataPoint[] = HISTORICAL_BENCHMARK_RATES
): TrendAnalysisResult {
  const currentDataPoint = history[history.length - 1];
  const currentRate = currentDataPoint.rate;

  // Filter 1-year data window (past 365 days)
  const oneYearAgoDate = "2025-08-24";
  const oneYearHistory = history.filter((p) => p.date >= oneYearAgoDate);

  const ratesInYear = oneYearHistory.map((p) => p.rate);
  const oneYearHighRate = Math.max(...ratesInYear);
  const oneYearLowRate = Math.min(...ratesInYear);

  // Check if today is the 1-Year High
  const isOneYearHigh = currentRate >= oneYearHighRate - 0.01;

  // If not the highest, find the last time the rate matched today's rate
  let lastMatchedDate: string | null = null;
  let lastMatchedDateFormatted: string | null = null;

  if (!isOneYearHigh) {
    // Search backward from prior entries (excluding current 2 weeks)
    for (let i = history.length - 3; i >= 0; i--) {
      const point = history[i];
      // Check if within 0.03% margin of today's rate or exact match
      if (Math.abs(point.rate - currentRate) <= 0.03) {
        lastMatchedDate = point.date;
        lastMatchedDateFormatted = formatRateDate(point.date);
        break;
      }
    }
    // Fallback search: check for closest crossing point in the past 12 months
    if (!lastMatchedDate) {
      for (let i = oneYearHistory.length - 3; i >= 0; i--) {
        const point = oneYearHistory[i];
        if (Math.abs(point.rate - currentRate) <= 0.08) {
          lastMatchedDate = point.date;
          lastMatchedDateFormatted = formatRateDate(point.date);
          break;
        }
      }
    }
  }

  // Determine comparison data point based on chosen horizon
  let comparisonPoint: RateDataPoint;
  let horizonLabel: string;

  if (horizon === "1w") {
    // ~7 days ago (second to last point or closest to 7 days)
    comparisonPoint = history[history.length - 2] || history[0];
    horizonLabel = "1 Week";
  } else if (horizon === "90d") {
    // ~90 days ago (~8-10 points back)
    const targetDate = "2026-05-26";
    comparisonPoint = history.find((p) => p.date <= targetDate) || history[Math.max(0, history.length - 8)];
    horizonLabel = "90 Days";
  } else {
    // 6 Months ago (~12-14 points back)
    const targetDate = "2026-02-24";
    comparisonPoint = history.find((p) => p.date <= targetDate) || history[Math.max(0, history.length - 13)];
    horizonLabel = "6 Months";
  }

  const rateDiff = Math.round((currentRate - comparisonPoint.rate) * 100) / 100;
  const diffBasisPoints = Math.round(rateDiff * 100);

  let direction: "up" | "down" | "flat" = "flat";
  let directionLabel = "Holding Steady";
  let sentiment: "favorable" | "unfavorable" | "neutral" = "neutral";

  if (rateDiff <= -0.02) {
    direction = "down";
    directionLabel = "Trending Lower (Improving)";
    sentiment = "favorable"; // Lower rates = better affordability
  } else if (rateDiff >= 0.02) {
    direction = "up";
    directionLabel = "Trending Higher (Rising)";
    sentiment = "unfavorable"; // Higher rates = higher borrowing cost
  } else {
    direction = "flat";
    directionLabel = "Holding Steady";
    sentiment = "neutral";
  }

  // Summary generation
  let summary = "";
  let insight = "";

  if (direction === "down") {
    summary = `Rates trending downward over the last ${horizonLabel}. Monthly purchasing power has expanded.`;
    insight = `Borrowing costs have eased compared to ${horizonLabel} ago. Favorable window for locking pre-approvals.`;
  } else if (direction === "up") {
    summary = `Rates trending upward over the last ${horizonLabel}. Focus on seller credits & buydowns.`;
    insight = `Upward rate momentum over ${horizonLabel}. Leverage a 2-1 temporary buydown or seller concessions to offset payments.`;
  } else {
    summary = `Rates holding steady over the last ${horizonLabel}. Predictable pricing window.`;
    insight = `Market momentum is stable. Great environment to compare loan programs and final closing costs.`;
  }

  return {
    horizon,
    horizonLabel,
    direction,
    directionLabel,
    sentiment,
    summary,
    diffBasisPoints,
    isOneYearHigh,
    oneYearHighRate,
    oneYearLowRate,
    lastMatchedDate,
    lastMatchedDateFormatted,
    insight,
  };
}
