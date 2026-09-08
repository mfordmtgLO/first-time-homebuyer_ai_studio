export type RbacRole = 'branch_manager' | 'senior_lo' | 'team_lo' | 'processor';

export interface RbacPermissions {
  canManageBranchUsers: boolean;
  canManageWebhooks: boolean;
  canManageApiKeys: boolean;
  canViewAllAuditLogs: boolean;
  canViewAllLeads: boolean;
  canEditBranchSettings: boolean;
  canViewBranchMetrics?: boolean;
}

export interface RbacRoleDefinition {
  role: RbacRole;
  displayName: string;
  shortLabel: string;
  badgeColor: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  description: string;
  permissions: RbacPermissions;
  privilegeHighlights: {
    webhooks: 'Full / Branch' | 'Personal Only' | 'Restricted (Inherited)' | 'None';
    apiKeys: 'Enterprise Vault' | 'Personal Vault' | 'Restricted (Hidden)' | 'None';
    auditLogs: 'Branch-Wide' | 'Self Only' | 'Self Only' | 'Read-Only Assigned';
    leadsAccess: 'All Branch Leads' | 'Assigned & Own' | 'Assigned Only' | 'Assigned Pipeline';
  };
}

export const RBAC_ROLE_CONFIGS: Record<RbacRole, RbacRoleDefinition> = {
  branch_manager: {
    role: 'branch_manager',
    displayName: 'Branch Manager (Admin)',
    shortLabel: 'Manager',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    badgeBorder: 'border-purple-200',
    description: 'Executive branch oversight. Whitelist and manage team roles, inspect branch-wide TCPA audit logs, and configure enterprise CRM webhooks and master API keys.',
    permissions: {
      canManageBranchUsers: true,
      canManageWebhooks: true,
      canManageApiKeys: true,
      canViewAllAuditLogs: true,
      canViewAllLeads: true,
      canEditBranchSettings: true,
    },
    privilegeHighlights: {
      webhooks: 'Full / Branch',
      apiKeys: 'Enterprise Vault',
      auditLogs: 'Branch-Wide',
      leadsAccess: 'All Branch Leads',
    },
  },
  senior_lo: {
    role: 'senior_lo',
    displayName: 'Senior Loan Officer',
    shortLabel: 'Senior LO',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
    description: 'Top producing originator. Holds personal CRM webhooks, private Twilio/Total Expert API keys, and self-scoped TCPA audit logs. Strict zero-lateral access prevents viewing other LOs’ secrets.',
    permissions: {
      canManageBranchUsers: false,
      canManageWebhooks: true,
      canManageApiKeys: true,
      canViewAllAuditLogs: false,
      canViewAllLeads: false,
      canEditBranchSettings: false,
    },
    privilegeHighlights: {
      webhooks: 'Personal Only',
      apiKeys: 'Personal Vault',
      auditLogs: 'Self Only',
      leadsAccess: 'Assigned & Own',
    },
  },
  team_lo: {
    role: 'team_lo',
    displayName: 'Team Loan Officer',
    shortLabel: 'Team LO',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
    description: 'Standard team originator utilizing branch-configured CRM integrations. Cannot view raw API secrets, manage webhook endpoints, or inspect other team members’ leads or audit trails.',
    permissions: {
      canManageBranchUsers: false,
      canManageWebhooks: false,
      canManageApiKeys: false,
      canViewAllAuditLogs: false,
      canViewAllLeads: false,
      canEditBranchSettings: false,
    },
    privilegeHighlights: {
      webhooks: 'Restricted (Inherited)',
      apiKeys: 'Restricted (Hidden)',
      auditLogs: 'Self Only',
      leadsAccess: 'Assigned Only',
    },
  },
  processor: {
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
  },
};

export interface WhitelistedUserRecord {
  email: string;
  role: RbacRole;
  addedAt: any;
  addedBy?: string;
  notes?: string;
  assignedLoId?: string;
  customPermissions?: Partial<RbacPermissions>;
}

export function normalizeRole(rawRole?: string | null): RbacRole {
  if (!rawRole) return 'team_lo';
  const clean = rawRole.toLowerCase().trim();
  if (clean === 'admin' || clean === 'branch_manager' || clean === 'manager') return 'branch_manager';
  if (clean === 'senior_lo' || clean === 'senior') return 'senior_lo';
  if (clean === 'processor' || clean === 'assistant') return 'processor';
  if (clean === 'team_lo' || clean === 'lo') return 'team_lo';
  return 'team_lo';
}

export function getRolePermissions(
  rawRole?: string | null,
  custom?: Partial<RbacPermissions>
): RbacPermissions {
  const role = normalizeRole(rawRole);
  const base = RBAC_ROLE_CONFIGS[role].permissions;
  if (!custom) return { ...base };
  return {
    ...base,
    ...custom,
  };
}

export function isBranchManager(rawRole?: string | null): boolean {
  return normalizeRole(rawRole) === 'branch_manager';
}

export function canAccessMemberData(
  userRole: string | null | undefined,
  currentLoId: string,
  targetLoId: string
): boolean {
  if (isBranchManager(userRole)) return true;
  return currentLoId === targetLoId;
}
