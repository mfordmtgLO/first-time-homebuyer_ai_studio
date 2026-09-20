import { CapturedLead } from "../types";

export interface EngagementBreakdown {
  score: number;
  tier: 'high' | 'moderate' | 'low';
  badgeLabel: string;
  badgeColorClass: string;
  metrics: {
    savedPropertiesCount: number;
    calculatorRunsCount: number;
    documentDownloadsCount: number;
    chatMessagesCount: number;
  };
}

/**
 * Computes a weighted 0-100 engagement score for a lead based on real-time interaction frequency.
 */
export function computeLeadEngagement(lead: CapturedLead): EngagementBreakdown {
  const savedPropertiesCount = (lead.curatedPropertyIds?.length || 0) + (lead.spatialProfile?.pinnedPropertyIds?.length || 0);
  const calculatorRunsCount = lead.savedScenarios?.length || 0;
  // Estimate document downloads or guides viewed based on metadata or lead path
  const documentDownloadsCount = lead.leadPathTag?.includes("download") || lead.interactedSourceType === 'flyer' ? 2 : (savedPropertiesCount > 0 ? 1 : 0);
  const chatMessagesCount = lead.chatTranscript?.length || 0;

  // Calculate points
  let score = 0;
  score += Math.min(30, savedPropertiesCount * 12); // Up to 30 pts for saved properties
  score += Math.min(30, calculatorRunsCount * 15); // Up to 30 pts for calculator scenarios
  score += Math.min(20, documentDownloadsCount * 10); // Up to 20 pts for document downloads
  score += Math.min(20, chatMessagesCount * 4); // Up to 20 pts for chat/SMS engagement

  // Intent bonus multiplier
  if (lead.intentScore === 'hot') {
    score += 15;
  } else if (lead.intentScore === 'warm') {
    score += 8;
  }

  // Cap at 100
  const finalScore = Math.min(100, Math.max(15, score));

  // Determine tier
  let tier: 'high' | 'moderate' | 'low';
  let badgeLabel: string;
  let badgeColorClass: string;

  if (finalScore >= 75) {
    tier = 'high';
    badgeLabel = '🔥 Hot / Highly Engaged';
    badgeColorClass = 'bg-red-100 text-red-800 border-red-200';
  } else if (finalScore >= 40) {
    tier = 'moderate';
    badgeLabel = '⚡ Moderately Active';
    badgeColorClass = 'bg-amber-100 text-amber-800 border-amber-200';
  } else {
    tier = 'low';
    badgeLabel = '💤 Exploring / Low Activity';
    badgeColorClass = 'bg-blue-100 text-blue-800 border-blue-200';
  }

  return {
    score: finalScore,
    tier,
    badgeLabel,
    badgeColorClass,
    metrics: {
      savedPropertiesCount,
      calculatorRunsCount,
      documentDownloadsCount,
      chatMessagesCount,
    },
  };
}

/**
 * Enriches a list of leads with computed engagement scores and sorts them optionally.
 */
export function enrichAndSortLeadsByEngagement(leads: CapturedLead[], sortBy: 'engagement' | 'newest' | 'intent' = 'engagement'): CapturedLead[] {
  const enriched = leads.map(lead => {
    const breakdown = computeLeadEngagement(lead);
    return {
      ...lead,
      engagementScore: breakdown.score,
      engagementTier: breakdown.tier,
      engagementMetrics: breakdown.metrics,
    };
  });

  return enriched.sort((a, b) => {
    if (sortBy === 'engagement') {
      return (b.engagementScore || 0) - (a.engagementScore || 0);
    }
    if (sortBy === 'intent') {
      const rank = { hot: 3, warm: 2, exploring: 1 };
      return (rank[b.intentScore] || 0) - (rank[a.intentScore] || 0);
    }
    // Default newest
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });
}
