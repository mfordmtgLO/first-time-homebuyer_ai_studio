const fs = require('fs');
let code = fs.readFileSync('src/utils/rbac.ts', 'utf8');

code = code.replace(
  "export type RbacRole = 'branch_manager' | 'sales_manager' | 'senior_lo' | 'team_lo' | 'processor';",
  "export type RbacRole = 'branch_manager' | 'sales_manager' | 'senior_lo' | 'team_lo' | 'processor' | 'mktg_ads_creator' | 'loa';"
);

const processorBlock = `  processor: {
    role: 'processor',
    displayName: 'Loan Processor / Assistant',
    shortLabel: 'Processor',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    badgeBorder: 'border-amber-200',
    description: 'Operational processing support. Has read-only access to assigned pipeline files and verification records. Zero access to API key vaults or CRM webhooks.',
    permissions: {
      canManageBranchUsers: false,
      canManageWebhooks: false,
      canManageApiKeys: false,
      canViewAllAuditLogs: false,
      canViewAllLeads: false,
      canEditBranchSettings: false,
    },
    privilegeHighlights: {
      webhooks: 'None',
      apiKeys: 'None',
      auditLogs: 'Read-Only Assigned',
      leadsAccess: 'Assigned Pipeline',
    },
  },`;

const newRolesBlock = `  mktg_ads_creator: {
    role: 'mktg_ads_creator',
    displayName: 'MKTG & Ads Creator',
    shortLabel: 'Marketing',
    badgeColor: 'bg-pink-100 text-pink-800 border-pink-300',
    badgeBg: 'bg-pink-50',
    badgeText: 'text-pink-700',
    badgeBorder: 'border-pink-200',
    description: 'Corporate Marketing Dept. Can create ads scripts and video content for multiple Loan Officers. Access to Vantage AI Ads Engine.',
    permissions: {
      canManageBranchUsers: false,
      canManageWebhooks: false,
      canManageApiKeys: false,
      canViewAllAuditLogs: false,
      canViewAllLeads: false,
      canEditBranchSettings: false,
    },
    privilegeHighlights: {
      webhooks: 'None',
      apiKeys: 'None',
      auditLogs: 'Read-Only Assigned',
      leadsAccess: 'Assigned Pipeline',
    },
  },
  loa: {
    role: 'loa',
    displayName: 'Loan Officer Assistant (LOA)',
    shortLabel: 'LOA',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    badgeBg: 'bg-cyan-50',
    badgeText: 'text-cyan-700',
    badgeBorder: 'border-cyan-200',
    description: 'Assists Loan Officers directly. Full access to the LO dashboard and Vantage AI Ads Engine on behalf of assigned LOs.',
    permissions: {
      canManageBranchUsers: false,
      canManageWebhooks: true,
      canManageApiKeys: false,
      canViewAllAuditLogs: false,
      canViewAllLeads: false,
      canEditBranchSettings: false,
    },
    privilegeHighlights: {
      webhooks: 'Restricted (Inherited)',
      apiKeys: 'Restricted (Hidden)',
      auditLogs: 'Self Only',
      leadsAccess: 'Assigned Pipeline',
    },
  },`;

code = code.replace(processorBlock, processorBlock + '\\n' + newRolesBlock);

code = code.replace(
  "if (clean === 'processor' || clean === 'assistant' || clean === 'loan processor') return 'processor';",
  "if (clean === 'processor' || clean === 'assistant' || clean === 'loan processor') return 'processor';\\n  if (clean === 'mktg_ads_creator' || clean === 'marketing') return 'mktg_ads_creator';\\n  if (clean === 'loa' || clean === 'loan officer assistant') return 'loa';"
);

fs.writeFileSync('src/utils/rbac.ts', code, 'utf8');
console.log("Updated RbacRoles");
