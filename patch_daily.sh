sed -i 's/let headline = "";/let headline: string;/g' src/services/dailyPulseService.ts
sed -i 's/let motivationalBadge = "";/let motivationalBadge: string;/g' src/services/dailyPulseService.ts
sed -i 's/let whatDoneSummary = "";/let whatDoneSummary: string;/g' src/services/dailyPulseService.ts
sed -i 's/let managerPerspective = "";/let managerPerspective: string;/g' src/services/dailyPulseService.ts
sed -i '/let topProducerTip = {/,/};/c\  let topProducerTip: { headline: string; advice: string; focusOutcome: string; };' src/services/dailyPulseService.ts
sed -i 's/let coachingQuote = "";/let coachingQuote: string;/g' src/services/dailyPulseService.ts
sed -i '/let nextActionRecommendation = {/,/};/c\  let nextActionRecommendation: { tabId: string; actionTitle: string; actionReason: string; };' src/services/dailyPulseService.ts
