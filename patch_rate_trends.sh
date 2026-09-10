sed -i 's/let direction: "up" | "down" | "flat" = "flat";/let direction: "up" | "down" | "flat";/g' src/utils/rateTrends.ts
sed -i 's/let directionLabel = "Holding Steady";/let directionLabel: string;/g' src/utils/rateTrends.ts
sed -i 's/let sentiment: "favorable" | "unfavorable" | "neutral" = "neutral";/let sentiment: "favorable" | "unfavorable" | "neutral";/g' src/utils/rateTrends.ts
sed -i 's/let summary = "";/let summary: string;/g' src/utils/rateTrends.ts
sed -i 's/let insight = "";/let insight: string;/g' src/utils/rateTrends.ts
