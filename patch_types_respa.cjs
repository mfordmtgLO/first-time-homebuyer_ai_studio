const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

const respaInterface = `
export interface RespaCostSharingExpense {
  id: string;
  ventureName: string;
  category: 'facebook_ad' | 'google_ad' | 'open_house' | 'event' | 'print_media' | 'radio' | 'tech_stack' | 'other';
  date: string;
  totalAmount: number;
  loPaidAmount: number;
  agentPaidAmount: number;
  loSharePercentage: number;
  agentSharePercentage: number;
  isCompliant: boolean; // Agent share <= 50% (or exact proportional split)
  agentName: string;
  notes?: string;
}
`;

if (!code.includes('RespaCostSharingExpense')) {
  fs.writeFileSync('src/types.ts', code + '\n' + respaInterface);
  console.log("Added RespaCostSharingExpense to types.ts");
}
