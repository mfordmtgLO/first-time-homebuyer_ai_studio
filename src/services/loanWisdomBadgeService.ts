import { PropertyConversation } from "../types";

export interface LoanWisdomBadge {
  id: string;
  name: string;
  iconName: string;
  category: "discovery" | "strategy" | "trust" | "readiness";
  description: string;
  unlockTip: string;
  points: number;
  unlockedColor: {
    bg: string;
    border: string;
    text: string;
    iconBg: string;
  };
}

export const LOAN_WISDOM_BADGES: LoanWisdomBadge[] = [
  {
    id: "program_scout",
    name: "Program Scout",
    iconName: "Compass",
    category: "discovery",
    description: "Explored initial mortgage and financing options tailored to this property.",
    unlockTip: "Ask any question about loan programs or down payment options.",
    points: 20,
    unlockedColor: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      iconBg: "bg-blue-500",
    },
  },
  {
    id: "dpa_savvy",
    name: "Bond & DPA Savvy",
    iconName: "Sparkles",
    category: "strategy",
    description: "Investigated Oregon OHCS Bond 3-5% cash assistance and county grant programs.",
    unlockTip: "Ask Mike Ford about OHCS Cash Assist or HAP grants.",
    points: 25,
    unlockedColor: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-800",
      iconBg: "bg-emerald-500",
    },
  },
  {
    id: "rate_strategist",
    name: "Rate Strategist",
    iconName: "TrendingDown",
    category: "strategy",
    description: "Analyzed 2-1 temporary interest rate buydowns and seller credit negotiation.",
    unlockTip: "Ask about 2-1 temporary rate buydowns or seller closing credits.",
    points: 25,
    unlockedColor: {
      bg: "bg-purple-50",
      border: "border-purple-200",
      text: "text-purple-800",
      iconBg: "bg-purple-500",
    },
  },
  {
    id: "trust_builder",
    name: "Trust Builder",
    iconName: "HeartHandshake",
    category: "trust",
    description: "Established active bi-directional communication with Loan Officer Mike Ford.",
    unlockTip: "Exchange 2 or more sync notes or responses with your Loan Officer.",
    points: 30,
    unlockedColor: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-800",
      iconBg: "bg-amber-500",
    },
  },
  {
    id: "tour_nuance_scout",
    name: "Tour Nuance Scout",
    iconName: "Eye",
    category: "discovery",
    description: "Documented physical inspection observations and property condition notes.",
    unlockTip: "Save inspection findings or tour notes in the Tour Scorecard.",
    points: 20,
    unlockedColor: {
      bg: "bg-teal-50",
      border: "border-teal-200",
      text: "text-teal-800",
      iconBg: "bg-teal-500",
    },
  },
  {
    id: "application_ready",
    name: "Application Ready",
    iconName: "Trophy",
    category: "readiness",
    description: "Attained top Loan Wisdom tier — confident and pre-qual ready for your offer!",
    unlockTip: "Earn 100+ trust points across mortgage program exploration.",
    points: 40,
    unlockedColor: {
      bg: "bg-amber-100",
      border: "border-amber-300",
      text: "text-amber-900",
      iconBg: "bg-amber-600",
    },
  },
];

/**
 * Calculates user's overall Loan Wisdom level and progress
 */
export function calculateLoanWisdomLevel(points: number): {
  level: number;
  title: string;
  nextTierPoints: number;
  progressPct: number;
} {
  if (points >= 120) {
    return {
      level: 4,
      title: "Pre-Approval Master",
      nextTierPoints: 120,
      progressPct: 100,
    };
  } else if (points >= 70) {
    return {
      level: 3,
      title: "Pre-Qual Contender",
      nextTierPoints: 120,
      progressPct: Math.round(((points - 70) / (120 - 70)) * 100),
    };
  } else if (points >= 30) {
    return {
      level: 2,
      title: "Smart Home Shopper",
      nextTierPoints: 70,
      progressPct: Math.round(((points - 30) / (70 - 30)) * 100),
    };
  } else {
    return {
      level: 1,
      title: "Financing Explorer",
      nextTierPoints: 30,
      progressPct: Math.round((points / 30) * 100),
    };
  }
}

/**
 * Determines which badges should be unlocked based on the conversation history
 */
export function evaluateBadgesForConversation(
  conversation: Partial<PropertyConversation> | null,
  newIncomingText?: string,
  newProgramTag?: string
): {
  unlockedBadgeIds: string[];
  newlyUnlocked: LoanWisdomBadge[];
  totalPoints: number;
} {
  const currentBadges = new Set<string>(conversation?.gamifiedStats?.unlockedBadges || []);
  const messages = conversation?.messages || [];
  
  const allTexts = [
    ...messages.map((m) => m.text.toLowerCase()),
    (newIncomingText || "").toLowerCase(),
  ];

  const allTags = [
    ...messages.map((m) => (m.programTag || "").toLowerCase()),
    (newProgramTag || "").toLowerCase(),
  ];

  const hasAskedQuestion = allTexts.length > 0;
  const hasDpa =
    allTexts.some((t) => t.includes("ohcs") || t.includes("bond") || t.includes("cash assist") || t.includes("hap") || t.includes("dpa") || t.includes("grant")) ||
    allTags.some((tag) => tag.includes("dpa") || tag.includes("cash assist") || tag.includes("bond"));

  const hasRateStrategy =
    allTexts.some((t) => t.includes("buydown") || t.includes("2-1") || t.includes("seller credit") || t.includes("rate discount") || t.includes("interest rate")) ||
    allTags.some((tag) => tag.includes("buydown") || tag.includes("rate"));

  const hasTourNuance =
    allTexts.some((t) => t.includes("tour note") || t.includes("scorecard") || t.includes("roof") || t.includes("inspection") || t.includes("foundation"));

  const hasExchangedMessages =
    messages.length >= 2 || (messages.length >= 1 && Boolean(newIncomingText));

  const newlyUnlocked: LoanWisdomBadge[] = [];

  function tryUnlock(badgeId: string) {
    if (!currentBadges.has(badgeId)) {
      currentBadges.add(badgeId);
      const found = LOAN_WISDOM_BADGES.find((b) => b.id === badgeId);
      if (found) newlyUnlocked.push(found);
    }
  }

  // 1. Program Scout
  if (hasAskedQuestion) {
    tryUnlock("program_scout");
  }

  // 2. Bond & DPA Savvy
  if (hasDpa) {
    tryUnlock("dpa_savvy");
  }

  // 3. Rate Strategist
  if (hasRateStrategy) {
    tryUnlock("rate_strategist");
  }

  // 4. Tour Nuance Scout
  if (hasTourNuance) {
    tryUnlock("tour_nuance_scout");
  }

  // 5. Trust Builder
  if (hasExchangedMessages) {
    tryUnlock("trust_builder");
  }

  // Calculate points
  let calculatedPoints = 0;
  LOAN_WISDOM_BADGES.forEach((b) => {
    if (currentBadges.has(b.id)) {
      calculatedPoints += b.points;
    }
  });

  // 6. Application Ready (100+ points or 4+ badges)
  if (calculatedPoints >= 100 || currentBadges.size >= 4) {
    tryUnlock("application_ready");
    if (!currentBadges.has("application_ready")) {
      calculatedPoints += 40;
    }
  }

  // Ensure points from prior record aren't erased
  const existingPoints = conversation?.gamifiedStats?.points || 0;
  const totalPoints = Math.max(calculatedPoints, existingPoints + (newlyUnlocked.reduce((acc, b) => acc + b.points, 0)));

  return {
    unlockedBadgeIds: Array.from(currentBadges),
    newlyUnlocked,
    totalPoints,
  };
}
