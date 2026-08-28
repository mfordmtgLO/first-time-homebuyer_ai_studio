export interface WalkScoreResult {
  score: number;
  category: "Walker's Paradise" | "Very Walkable" | "Somewhat Walkable" | "Car-Dependent";
  description: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  badgePillBg: string;
}

/**
 * Calculates a mock Walk Score (0-100) deterministically from a property address.
 * If an explicit walkScore is provided, that value is used instead.
 */
export function calculateMockWalkScore(
  address: string = "",
  city: string = "",
  zip: string = "",
  walkScoreOverride?: number
): WalkScoreResult {
  let score: number;

  if (typeof walkScoreOverride === "number" && walkScoreOverride >= 0 && walkScoreOverride <= 100) {
    score = Math.round(walkScoreOverride);
  } else {
    // Generate a deterministic hash based on address, city, and zip
    const normalizedInput = `${address.trim().toLowerCase()}_${city.trim().toLowerCase()}_${zip.trim()}`;
    let hash = 5381;
    for (let i = 0; i < normalizedInput.length; i++) {
      hash = ((hash << 5) + hash) + normalizedInput.charCodeAt(i);
      hash |= 0;
    }
    const positiveHash = Math.abs(hash);
    
    // Maps to a realistic score between 48 and 98
    score = 48 + (positiveHash % 51);
  }

  if (score >= 90) {
    return {
      score,
      category: "Walker's Paradise",
      description: "Daily errands do not require a car. Excellent access to transit, parks, and amenities.",
      badgeBg: "bg-emerald-50",
      badgeText: "text-emerald-800",
      badgeBorder: "border-emerald-200",
      badgePillBg: "bg-emerald-600 text-white",
    };
  } else if (score >= 70) {
    return {
      score,
      category: "Very Walkable",
      description: "Most errands can be accomplished on foot. Nearby grocery stores, cafes, and schools.",
      badgeBg: "bg-teal-50",
      badgeText: "text-teal-800",
      badgeBorder: "border-teal-200",
      badgePillBg: "bg-teal-600 text-white",
    };
  } else if (score >= 50) {
    return {
      score,
      category: "Somewhat Walkable",
      description: "Some errands can be accomplished on foot. Suburban connectivity with nearby routes.",
      badgeBg: "bg-amber-50",
      badgeText: "text-amber-800",
      badgeBorder: "border-amber-200",
      badgePillBg: "bg-amber-600 text-white",
    };
  } else {
    return {
      score,
      category: "Car-Dependent",
      description: "Most errands require a car. Few walkable destinations in immediate vicinity.",
      badgeBg: "bg-stone-100",
      badgeText: "text-stone-700",
      badgeBorder: "border-stone-200",
      badgePillBg: "bg-stone-600 text-white",
    };
  }
}
