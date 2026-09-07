export function calculateEstimatedMarketValue(propertyId: string, currentPrice: number) {
  let hash = 0;
  for (let i = 0; i < propertyId.length; i++) {
    hash = ((hash << 5) - hash) + propertyId.charCodeAt(i);
    hash |= 0;
  }
  // Convert hash to a pseudo-random number between 0 and 1
  const randomSeed = Math.abs(hash) % 1000 / 1000;
  
  // Variance from -0.05 to +0.08 (AI predicts value is between 5% lower and 8% higher)
  const variance = -0.05 + (randomSeed * 0.13);
  const estimatedValue = currentPrice * (1 + variance);
  
  let condition: 'underpriced' | 'fair' | 'overpriced' = 'fair';
  if (variance > 0.02) condition = 'underpriced'; // AI says it's worth more than asking (good deal)
  else if (variance < -0.02) condition = 'overpriced'; // AI says it's worth less than asking
  
  return {
    estimatedValue: Math.round(estimatedValue / 1000) * 1000,
    condition,
    variancePct: (variance * 100).toFixed(1)
  };
}
