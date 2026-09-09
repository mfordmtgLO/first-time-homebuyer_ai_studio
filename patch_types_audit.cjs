const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf8');

const auditType = `
export interface CampaignAuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details?: string;
}
`;

if (!code.includes("CampaignAuditEntry")) {
  code = code + auditType;
}

code = code.replace(
  "  isCompliancePaused?: boolean;",
  "  isCompliancePaused?: boolean;\n  auditLog?: CampaignAuditEntry[];"
);

fs.writeFileSync('src/types.ts', code);
