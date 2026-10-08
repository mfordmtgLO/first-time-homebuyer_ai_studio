export type RbacRole = 'branch_manager' | 'sales_manager' | 'senior_lo' | 'team_lo' | 'processor' | 'mktg_ads_creator' | 'loa' | 'it_manager' | 'peer_tester';

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
  sales_manager: {
    role: 'sales_manager',
    displayName: 'Sales Manager',
    shortLabel: 'Sales Mgr',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    badgeBorder: 'border-indigo-200',
    description: 'Sales and production leadership. Authorized to manage LO & Agent recruiting pipelines, conduct state sweeps, track candidate outreach, and review production pacing.',
    permissions: {
      canManageBranchUsers: false,
      canManageWebhooks: true,
      canManageApiKeys: true,
      canViewAllAuditLogs: true,
      canViewAllLeads: true,
      canEditBranchSettings: false,
      canViewBranchMetrics: true,
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
  mktg_ads_creator: {
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
  },
  it_manager: {
    role: 'it_manager',
    displayName: 'IT Manager / Tech',
    shortLabel: 'IT Tech',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
    description: 'Temporary admin-level role invited by Mike Ford to debug system errors, inspect audit logs, troubleshoot database telemetry, and operate the Error Whisperer.',
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
  peer_tester: {
    role: 'peer_tester',
    displayName: 'Peer Tester (Developer)',
    shortLabel: 'Tester',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
    description: 'Developer testing role invited by Mike Ford for peer testing and quality assurance across the entire system with full admin access.',
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
};

export interface WhitelistedUserRecord {
  email: string;
  role: RbacRole;
  addedAt: any;
  addedBy?: string;
  notes?: string;
  assignedLoId?: string;
  isLockedOut?: boolean;
  customPermissions?: Partial<RbacPermissions>;
}

export function normalizeRole(rawRole?: string | null): RbacRole {
  if (!rawRole) return 'team_lo';
  const clean = rawRole.toLowerCase().trim();
  if (clean === 'admin' || clean === 'superadmin' || clean === 'branch_manager' || clean === 'manager' || clean === 'branch manager') return 'branch_manager';
  if (clean === 'sales_manager' || clean === 'sales manager' || clean === 'sales_mgr' || clean === 'salesmgr') return 'sales_manager';
  if (clean === 'senior_lo' || clean === 'senior' || clean === 'senior lo' || clean === 'senior loan officer') return 'senior_lo';
  if (clean === 'processor' || clean === 'assistant' || clean === 'loan processor') return 'processor';
  if (clean === 'mktg_ads_creator' || clean === 'marketing') return 'mktg_ads_creator';
  if (clean === 'loa' || clean === 'loan officer assistant') return 'loa';
  if (clean === 'it_manager' || clean === 'it manager' || clean === 'it tech' || clean === 'it') return 'it_manager';
  if (clean === 'peer_tester' || clean === 'peer tester' || clean === 'tester' || clean === 'developer') return 'peer_tester';
  if (clean === 'team_lo' || clean === 'lo' || clean === 'loan_officer' || clean === 'loan officer') return 'team_lo';
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

export function isProcessorRole(rawRole?: string | null): boolean {
  if (!rawRole) return false;
  return normalizeRole(rawRole) === 'processor';
}

/**
 * Access control for Loan Officer recruit functions:
 * Mike Ford admin dashboard user role (Mike is also branch manager role+loan officer role
 * for audit and compliance logging search and sort logging audit trails purposes Mike Ford must appear in several roles)
 * and Branch Manager dashboard user role and newly created Sales Manager dashboard user role
 * are the only role designations that can see and use loan officer recruit functions
 * in their combined “LO+Agent Recruit Command Center” tab.
 */
export const MASTER_ADMIN_EMAILS = ['fordmj@gmail.com', 'mford@cfmtg.com'];

export function isMasterAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return MASTER_ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

export function canAccessLoRecruiting(rawRole?: string | null, userEmail?: string | null): boolean {
  if (isMasterAdminEmail(userEmail)) return true;
  const clean = (rawRole || '').toLowerCase().trim();
  if (clean === 'admin' || clean === 'superadmin') return true;
  const role = normalizeRole(rawRole);
  return role === 'branch_manager' || role === 'sales_manager';
}

/**
 * Access control for Real Estate Agent recruiting functions:
 * Loan officer dashboard user role can only see and use agent recruiting functions
 * including Top 50 in their “Find Top Agents” tab.
 * Processor dashboard user role does not see or have any loan officer recruit
 * or agent recruit functions or tab at all.
 */
export function canAccessAgentRecruiting(rawRole?: string | null, userEmail?: string | null): boolean {
  if (isMasterAdminEmail(userEmail)) return true;
  const clean = (rawRole || '').toLowerCase().trim();
  if (clean === 'admin' || clean === 'superadmin') return true;
  const role = normalizeRole(rawRole);
  if (role === 'processor') return false;
  return true;
}

/**
 * Access control for "BPD Recruit" platform:
 * ONLY visible to Mike Ford Admin and branch manager user roles.
 * Downstream team LOs, processors, LOAs, and other non-manager roles cannot access or view BPD Recruit.
 */
export function canAccessBpdRecruit(rawRole?: string | null, userEmail?: string | null): boolean {
  if (isMasterAdminEmail(userEmail)) return true;
  const clean = (rawRole || '').toLowerCase().trim();
  if (clean === 'admin' || clean === 'superadmin') return true;
  const role = normalizeRole(rawRole);
  return role === 'branch_manager';
}

export function canAccessMemberData(
  userRole: string | null | undefined,
  currentLoId: string,
  targetLoId: string
): boolean {
  if (isBranchManager(userRole)) return true;
  return currentLoId === targetLoId;
}
