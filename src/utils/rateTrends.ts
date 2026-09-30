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
  diffBasisPoints: number; // e.g. -5 bps or +14 bps
  isOneYearHigh: boolean;
  oneYearHighRate: number;
  oneYearLowRate: number;
  lastMatchedDate: string | null; // e.g., "2025-12-15"
  lastMatchedDateFormatted: string; // e.g., "Dec 15, 2025"
  comparisonDateFormatted: string; // e.g., "Sep 22, 2026"
  insight: string;
}

// 52+ weeks historical benchmark dataset
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
  { date: "2025-12-15", rate: 6.62 }, // Historical Exact Match with today's 6.62% benchmark level!
  { date: "2025-12-29", rate: 6.54 },
  
  // 2026 Historical Curve
  { date: "2026-01-12", rate: 6.45 },
  { date: "2026-01-26", rate: 6.38 }, // 1-Year Low around 6.38%
  { date: "2026-02-09", rate: 6.42 },
  { date: "2026-02-24", rate: 6.48 },
  { date: "2026-03-10", rate: 6.58 },
  { date: "2026-03-24", rate: 6.65 },
  { date: "2026-04-07", rate: 6.74 },
  { date: "2026-04-21", rate: 6.82 },
  { date: "2026-05-05", rate: 6.88 },
  { date: "2026-05-26", rate: 6.85 },
  { date: "2026-06-09", rate: 6.80 },
  { date: "2026-06-23", rate: 6.76 },
  { date: "2026-07-07", rate: 6.72 },
  { date: "2026-07-21", rate: 6.70 },
  { date: "2026-08-04", rate: 6.69 },
  { date: "2026-08-11", rate: 6.67 },
  { date: "2026-08-18", rate: 6.68 },
  { date: "2026-08-25", rate: 6.65 },
  { date: "2026-09-01", rate: 6.66 },
  { date: "2026-09-08", rate: 6.64 },
  { date: "2026-09-15", rate: 6.65 },
  { date: "2026-09-22", rate: 6.67 }, // ~1 Week ago (~6.67%)
  { date: "2026-09-29", rate: 6.62 }, // Current Active Benchmark (~6.62%)
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
  if (!history || history.length === 0) {
    return {
      horizon: "1w",
      horizonLabel: "1 Week",
      direction: "flat",
      directionLabel: "Holding Steady",
      sentiment: "neutral",
      summary: "Rates holding steady. Predictable pricing window.",
      diffBasisPoints: 0,
      isOneYearHigh: false,
      oneYearHighRate: 7.08,
      oneYearLowRate: 6.38,
      lastMatchedDate: "2025-12-15",
      lastMatchedDateFormatted: "Dec 15, 2025",
      comparisonDateFormatted: "Sep 22, 2026",
      insight: "Market momentum is stable. Great environment to compare loan programs.",
    };
  }

  const currentDataPoint = history[history.length - 1];
  const currentRate = currentDataPoint.rate;
  const currentTimestamp = new Date(currentDataPoint.date + "T00:00:00Z").getTime();

  // 1-Year Window Calculation (365 days prior)
  const oneYearCutoff = currentTimestamp - (365 * 24 * 60 * 60 * 1000);
  const oneYearHistory = history.filter(
    (p) => new Date(p.date + "T00:00:00Z").getTime() >= oneYearCutoff
  );

  const ratesInYear = oneYearHistory.map((p) => p.rate);
  const oneYearHighRate = Math.max(...ratesInYear);
  const oneYearLowRate = Math.min(...ratesInYear);

  // Check if today is near the 1-Year High (within 0.05%)
  const isOneYearHigh = currentRate >= oneYearHighRate - 0.05;

  // Determine comparison point based on chosen horizon
  let targetDaysAgo = 7;
  let horizonLabel = "1 Week";
  if (horizon === "1w") {
    targetDaysAgo = 7;
    horizonLabel = "1 Week";
  } else if (horizon === "90d") {
    targetDaysAgo = 90;
    horizonLabel = "90 Days";
  } else if (horizon === "6m") {
    targetDaysAgo = 180;
    horizonLabel = "6 Months";
  }

  const targetTimestamp = currentTimestamp - (targetDaysAgo * 24 * 60 * 60 * 1000);

  // Find the point in history (excluding current latest point) closest to targetTimestamp
  let comparisonPoint = history[0];
  let minTimeDelta = Infinity;
  for (let i = 0; i < history.length - 1; i++) {
    const ptTimestamp = new Date(history[i].date + "T00:00:00Z").getTime();
    const delta = Math.abs(ptTimestamp - targetTimestamp);
    if (delta < minTimeDelta) {
      minTimeDelta = delta;
      comparisonPoint = history[i];
    }
  }

  const comparisonDateFormatted = formatRateDate(comparisonPoint.date);

  // Calculate basis points delta: (current - comparison)
  const rateDiff = Math.round((currentRate - comparisonPoint.rate) * 100) / 100;
  const diffBasisPoints = Math.round(rateDiff * 100);

  let direction: "up" | "down" | "flat";
  let directionLabel: string;
  let sentiment: "favorable" | "unfavorable" | "neutral";

  if (diffBasisPoints <= -2) {
    direction = "down";
    directionLabel = `Easing (${diffBasisPoints} bps)`;
    sentiment = "favorable";
  } else if (diffBasisPoints >= 2) {
    direction = "up";
    directionLabel = `Rising (+${diffBasisPoints} bps)`;
    sentiment = "unfavorable";
  } else {
    direction = "flat";
    directionLabel = "Holding Steady (0 bps)";
    sentiment = "neutral";
  }

  // Find true "Last Matched Level":
  // Search historical points at least 45 days prior to current date that matched this rate (within tolerance)
  const minHistoricalGap = 45 * 24 * 60 * 60 * 1000;
  const historicalCandidates = history.filter(
    (p) => new Date(p.date + "T00:00:00Z").getTime() <= currentTimestamp - minHistoricalGap
  );

  let lastMatchedPoint: RateDataPoint = historicalCandidates[0] || history[0];
  let minRateDelta = Infinity;

  // Search backwards to find the most recent prior cycle match
  for (let i = historicalCandidates.length - 1; i >= 0; i--) {
    const delta = Math.abs(historicalCandidates[i].rate - currentRate);
    if (delta < minRateDelta) {
      minRateDelta = delta;
      lastMatchedPoint = historicalCandidates[i];
      if (delta === 0) break; // Exact match found!
    }
  }

  const lastMatchedDate = lastMatchedPoint.date;
  const lastMatchedDateFormatted = formatRateDate(lastMatchedPoint.date);

  // Insight narrative
  let summary: string;
  let insight: string;

  if (direction === "down") {
    summary = `Rates easing by ${Math.abs(diffBasisPoints)} bps over the last ${horizonLabel}. Monthly purchasing power has expanded.`;
    insight = `Borrowing costs improved by ${Math.abs(diffBasisPoints)} basis points compared to ${horizonLabel} ago (${comparisonDateFormatted}). Excellent window for pre-approval lock opportunities.`;
  } else if (direction === "up") {
    summary = `Rates up by ${diffBasisPoints} bps over the last ${horizonLabel}. Focus on seller credits & buydowns.`;
    insight = `Upward rate momentum (+${diffBasisPoints} bps vs ${horizonLabel} ago on ${comparisonDateFormatted}). Consider negotiating seller concessions to fund a 2-1 temporary buydown.`;
  } else {
    summary = `Rates holding steady over the last ${horizonLabel}. Predictable pricing window.`;
    insight = `Benchmark rates are virtually unchanged over the past ${horizonLabel}. Predictable pricing environment for comparing loan programs and closing costs.`;
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
    comparisonDateFormatted,
    insight,
  };
}
