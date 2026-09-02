const fs = require('fs');
let content = fs.readFileSync('src/types.ts', 'utf8');
content = content.replace(
  /export interface LoanOfficerProfile \{/,
  `export interface LoanOfficerProfile {
  enrichmentStatus?: 'none' | 'syncing' | 'enriched';
  topRealtorPartners?: { name: string; volume: number; company: string }[];
  nmlsNumber?: string;`
);
fs.writeFileSync('src/types.ts', content);
console.log("types.ts updated");
