export interface SchoolScoreResult {
  score: number;
  grade: string;
  category: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  badgePillBg: string;
  description: string;
}

export function calculateMockSchoolScore(address: string, city: string, zip: string): SchoolScoreResult {
  // Generate a deterministic pseudo-random score based on address/zip string
  const str = (address + city + zip).toLowerCase().replace(/[^a-z0-9]/g, '');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; 
  }
  
  // Normal distribution favoring 6-9
  let rawScore = (Math.abs(hash) % 10) + 1; // 1-10
  
  // Nudge it a bit up if it's very low, just for better demo optics
  if (rawScore < 4) rawScore += 3;

  const getDetails = (score: number) => {
    if (score >= 9) {
      return {
        grade: "A+",
        category: "Excellent",
        badgeBg: "bg-emerald-50 dark:bg-emerald-900/30",
        badgeText: "text-emerald-700 dark:text-emerald-400",
        badgeBorder: "border-emerald-200 dark:border-emerald-800",
        badgePillBg: "bg-emerald-500 text-white",
        description: "Highly rated local schools with great test scores and academic progress."
      };
    }
    if (score >= 7) {
      return {
        grade: "A",
        category: "Above Average",
        badgeBg: "bg-blue-50 dark:bg-blue-900/30",
        badgeText: "text-blue-700 dark:text-blue-400",
        badgeBorder: "border-blue-200 dark:border-blue-800",
        badgePillBg: "bg-blue-500 text-white",
        description: "Above average school district with solid academic progress."
      };
    }
    if (score >= 5) {
      return {
        grade: "B",
        category: "Average",
        badgeBg: "bg-amber-50 dark:bg-amber-900/30",
        badgeText: "text-amber-800 dark:text-amber-400",
        badgeBorder: "border-amber-200 dark:border-amber-800",
        badgePillBg: "bg-amber-500 text-white",
        description: "Average local schools meeting standard academic expectations."
      };
    }
    return {
      grade: "C",
      category: "Below Average",
      badgeBg: "bg-stone-50 dark:bg-stone-900/30",
      badgeText: "text-stone-700 dark:text-stone-400",
      badgeBorder: "border-stone-200 dark:border-stone-800",
      badgePillBg: "bg-stone-500 text-white",
      description: "Below average school district according to test scores."
    };
  };

  return {
    score: rawScore,
    ...getDetails(rawScore)
  };
}
