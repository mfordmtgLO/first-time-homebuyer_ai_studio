const fs = require('fs');
let c = fs.readFileSync('src/utils/rbac.ts', 'utf8');

c = c.replace(
  'export type RbacRole = \'branch_manager\' | \'team_lo\' | \'solo_lo\';',
  'export type RbacRole = \'branch_manager\' | \'team_lo\' | \'solo_lo\' | \'compliance_auditor\';'
);

c = c.replace(
  'export const ROLE_DEFINITIONS: Record<RbacRole, RoleDefinition> = {',
  `export const ROLE_DEFINITIONS: Record<RbacRole, RoleDefinition> = {
  compliance_auditor: {
    id: 'compliance_auditor',
    displayName: 'Compliance & IT Auditor',
    permissions: [
      'view_audit_logs',
      'export_audit_logs',
      'view_telemetry',
    ]
  },`
);

fs.writeFileSync('src/utils/rbac.ts', c);
