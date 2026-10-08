import React, { useState } from "react";
import {
  ShieldCheck,
  Key,
  Terminal,
  ArrowRight,
  Lock,
  Building2,
  CheckCircle2,
  ExternalLink
} from "lucide-react";
import { RBAC_ROLE_CONFIGS, RbacRole } from "../utils/rbac";

interface MasterRoleManagerProps {
  guidesState?: any;
  onNavigateToBranchManagement?: () => void;
}

export const MasterRoleManager: React.FC<MasterRoleManagerProps> = ({
  guidesState,
  onNavigateToBranchManagement,
}) => {
  const [activeTab, setActiveTab] = useState<"pointer" | "roles_matrix" | "it_widget_toggle">("pointer");

  // Error Whisperer widget state in localStorage
  const [showErrorWhispererWidget, setShowErrorWhispererWidget] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("show_error_whisperer") === "true";
    }
    return false;
  });

  const handleToggleWhisperer = (val: boolean) => {
    setShowErrorWhispererWidget(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("show_error_whisperer", val ? "true" : "false");
    }
  };

  const roleList: RbacRole[] = [
    "branch_manager",
    "sales_manager",
    "senior_lo",
    "team_lo",
    "processor",
    "mktg_ads_creator",
    "loa",
    "it_manager",
    "peer_tester",
  ];

  return (
    <div className="bg-white dark:bg-[#1A211B] rounded-2xl shadow-sm border border-slate-200 dark:border-[#606C5D] p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-[#E8ECE6] flex items-center gap-2">
            <Key className="w-6 h-6 text-indigo-500" />
            Mike Ford Admin: Master Access & Role Management
          </h2>
          <p className="text-sm text-slate-500 dark:text-[#9A9488] mt-1 max-w-2xl">
            Authoritative access control, employee invites, lockout enforcement, and role provisioning are centralized in the Branch Management security hub.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {onNavigateToBranchManagement && (
            <button
              onClick={onNavigateToBranchManagement}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-xs"
            >
              <Building2 className="w-4 h-4" />
              Open Branch Management
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setActiveTab("it_widget_toggle")}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-lg transition-colors border border-emerald-600 whitespace-nowrap shadow-xs"
          >
            <Terminal className="w-4 h-4" />
            Error Whisperer Settings
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-[#606C5D] mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab("pointer")}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === "pointer"
              ? "border-indigo-500 text-indigo-500"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-[#9A9488] dark:hover:text-[#E8ECE6]"
          }`}
        >
          <Building2 className="w-4 h-4" />
          User Administration Authority
        </button>
        <button
          onClick={() => setActiveTab("roles_matrix")}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === "roles_matrix"
              ? "border-indigo-500 text-indigo-500"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-[#9A9488] dark:hover:text-[#E8ECE6]"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          RBAC Role Reference Matrix
        </button>
        <button
          onClick={() => setActiveTab("it_widget_toggle")}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === "it_widget_toggle"
              ? "border-indigo-500 text-indigo-500"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-[#9A9488] dark:hover:text-[#E8ECE6]"
          }`}
        >
          <Terminal className="w-4 h-4" />
          Error Whisperer & IT Tool Control
        </button>
      </div>

      {/* POINTER TAB */}
      {activeTab === "pointer" && (
        <div className="space-y-6 max-w-4xl">
          <div className="bg-slate-50 dark:bg-[#202921] border border-slate-200 dark:border-[#606C5D] rounded-2xl p-6 lg:p-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-xl">
                <Lock className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-[#E8ECE6]">
                  Live User Administration & Whitelist Centralization
                </h3>
                <p className="text-sm text-slate-600 dark:text-[#9A9488] leading-relaxed">
                  All production user admission, role assignments, account lockouts, and cryptographic session token revocations operate exclusively through the live backend endpoints in <strong>Branch Management</strong>.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-white dark:bg-[#1A211B] rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Zero-Trust Whitelist Authority
                </div>
                <p className="text-slate-500 dark:text-slate-400">
                  Staff access is authorized only if the email exists in <code className="text-indigo-600 dark:text-indigo-400 bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">whitelisted_emails</code>. Non-whitelisted accounts receive status <code className="text-amber-600">"pending"</code> with fail-closed zero-data views.
                </p>
              </div>

              <div className="p-4 bg-white dark:bg-[#1A211B] rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Immediate Lockout & Revocation
                </div>
                <p className="text-slate-500 dark:text-slate-400">
                  Locking out an account executes <code className="text-indigo-600 dark:text-indigo-400 bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">POST /api/admin/roles/lock</code>, invalidating Firebase refresh tokens via Firebase Admin Auth immediately.
                </p>
              </div>

              <div className="p-4 bg-white dark:bg-[#1A211B] rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Tenant & Lead Isolation
                </div>
                <p className="text-slate-500 dark:text-slate-400">
                  Loan Officers are strictly isolated to leads matching their own <code className="text-indigo-600 dark:text-indigo-400 bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">ownerLoId</code>. Lateral discovery across LO accounts is completely blocked in Firestore rules and API queries.
                </p>
              </div>

              <div className="p-4 bg-white dark:bg-[#1A211B] rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Immutable Audit Ledger
                </div>
                <p className="text-slate-500 dark:text-slate-400">
                  All invitation, revocation, lockout, and role modification events append tamper-evident records to the <code className="text-indigo-600 dark:text-indigo-400 bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">branch_audit_logs</code> collection.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              {onNavigateToBranchManagement ? (
                <button
                  onClick={onNavigateToBranchManagement}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm"
                >
                  <Building2 className="w-4 h-4" />
                  Manage Users in Branch Management
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <p className="text-xs text-slate-500">
                  Navigate to the Branch Management tab in the sidebar to invite, edit, or lock staff accounts.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ROLES MATRIX TAB */}
      {activeTab === "roles_matrix" && (
        <div className="space-y-4 max-w-4xl">
          <p className="text-xs text-slate-500 dark:text-[#9A9488]">
            Reference guide for system-wide Role-Based Access Control (RBAC) definitions and privilege boundaries.
          </p>
          <div className="grid grid-cols-1 gap-3">
            {roleList.map((roleKey) => {
              const def = RBAC_ROLE_CONFIGS[roleKey];
              if (!def) return null;
              return (
                <div
                  key={roleKey}
                  className="p-4 bg-slate-50 dark:bg-[#202921] border border-slate-200 dark:border-[#606C5D] rounded-xl flex items-start justify-between flex-wrap gap-4 text-xs"
                >
                  <div className="space-y-1 max-w-md">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded font-bold border ${def.badgeColor}`}>
                        {def.displayName}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">({roleKey})</span>
                    </div>
                    <p className="text-slate-600 dark:text-[#9A9488] leading-relaxed pt-1">
                      {def.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                    <div>
                      <span className="text-slate-400">Leads: </span>
                      <span className="font-semibold">{def.privilegeHighlights.leadsAccess}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Webhooks: </span>
                      <span className="font-semibold">{def.privilegeHighlights.webhooks}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Audit Logs: </span>
                      <span className="font-semibold">{def.privilegeHighlights.auditLogs}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">API Vault: </span>
                      <span className="font-semibold">{def.privilegeHighlights.apiKeys}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* IT WIDGET TOGGLE TAB */}
      {activeTab === "it_widget_toggle" && (
        <div className="max-w-xl space-y-6">
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-600 text-white">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                    AI Error Whisperer & IT Code Fixer Widget
                  </h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    Controls visibility of the bottom-right debugging telemetry badge and error log whisperer across dashboard and website views.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                Display Error Whisperer Widget
              </span>
              <button
                type="button"
                onClick={() => handleToggleWhisperer(!showErrorWhispererWidget)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  showErrorWhispererWidget ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showErrorWhispererWidget ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
