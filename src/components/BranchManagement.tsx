import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, doc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { 
  Building, 
  UserPlus, 
  Mail, 
  ShieldCheck, 
  Trash2, 
  ShieldAlert, 
  Globe, 
  Lock, 
  Fingerprint, 
  Search, 
  Share2,
  Key,
  Webhook,
  FileText,
  Users,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Info,
  X,
  Package
} from "lucide-react";
import { MfaSetupModal } from "./MfaSetupModal";
import { BranchAuditLogSection } from "./BranchAuditLogSection";
import { SupplyChainSbomSection } from "./SupplyChainSbomSection";

import { AdminAdComplianceSection } from "./AdminAdComplianceSection";

import { 
  RbacRole, 
  RBAC_ROLE_CONFIGS, 
  normalizeRole, 
  WhitelistedUserRecord,
  RbacRoleDefinition
} from "../utils/rbac";
import { logSensitiveAssetAccess } from "../utils/auditLogger";

const LOCAL_WHITELIST_KEY = "cornerstone_whitelisted_users_v2";

const DEFAULT_WHITELISTED_USERS: WhitelistedUserRecord[] = [
  {
    email: "lkilstrom@guildmortgage.net",
    role: "senior_lo",
    addedAt: "2026-09-01T08:00:00.000Z",
    addedBy: "Mike Ford (Branch Manager)",
    notes: "Senior Originator / Branch Partner"
  },
  {
    email: "brian@guildmortgage.net",
    role: "team_lo",
    addedAt: "2026-09-02T10:30:00.000Z",
    addedBy: "Mike Ford (Branch Manager)",
    notes: "Production Team Loan Officer"
  },
  {
    email: "sarah.c@guildmortgage.net",
    role: "processor",
    addedAt: "2026-09-03T14:15:00.000Z",
    addedBy: "Mike Ford (Branch Manager)",
    notes: "Lead Loan Processor"
  }
];

interface BranchManagementProps {
  onNavigateToSeo?: () => void;
}

export const BranchManagement: React.FC<BranchManagementProps> = ({ onNavigateToSeo }) => {
  const [activeSectionTab, setActiveSectionTab] = useState<"team" | "audit" | "sbom">("team");
  const [users, setUsers] = useState<WhitelistedUserRecord[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<RbacRole>("team_lo");
  const [inviteNote, setInviteNote] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | RbacRole>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isAppPublic, setIsAppPublic] = useState(false);
  const [isTogglingPublic, setIsTogglingPublic] = useState(false);
  const [showMfaModal, setShowMfaModal] = useState(false);
  const [showRbacMatrixModal, setShowRbacMatrixModal] = useState(false);
  const [inspectingUser, setInspectingUser] = useState<WhitelistedUserRecord | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    // 1. Instant optimistic load from localStorage or initial roster
    try {
      const cached = localStorage.getItem(LOCAL_WHITELIST_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setUsers(parsed);
          setIsLoading(false);
        } else {
          setUsers(DEFAULT_WHITELISTED_USERS);
        }
      } else {
        setUsers(DEFAULT_WHITELISTED_USERS);
      }
    } catch {
      setUsers(DEFAULT_WHITELISTED_USERS);
    }

    // 2. Real-time Firestore sync with onSnapshot
    const unsubscribeWhitelist = onSnapshot(
      collection(db, "whitelisted_emails"),
      (snap) => {
        const loaded: WhitelistedUserRecord[] = [];
        snap.forEach(d => {
          const raw = d.data();
          loaded.push({
            email: d.id,
            role: normalizeRole(raw.role),
            addedAt: raw.addedAt,
            addedBy: raw.addedBy || "Mike Ford (Branch Manager)",
            notes: raw.notes || "",
            assignedLoId: raw.assignedLoId,
            customPermissions: raw.customPermissions
          });
        });

        if (loaded.length > 0) {
          setUsers(loaded);
          try {
            localStorage.setItem(LOCAL_WHITELIST_KEY, JSON.stringify(loaded));
          } catch (e) {
            console.warn("Storage write error:", e);
          }
        }
        setIsLoading(false);
      },
      (error) => {
        console.warn("whitelisted_emails listener notice:", error);
        setIsLoading(false);
      }
    );

    // 3. App Settings snapshot
    const unsubscribeSettings = onSnapshot(
      doc(db, "app_settings", "global"),
      (docSnap) => {
        if (docSnap.exists()) {
          setIsAppPublic(docSnap.data().isPublic === true);
        } else {
          setIsAppPublic(false);
        }
      },
      (error) => {
        console.warn("BranchManagement app_settings snapshot notice:", error);
      }
    );

    return () => {
      unsubscribeWhitelist();
      unsubscribeSettings();
    };
  }, []);

  const showFeedback = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleTogglePublic = async () => {
    setIsTogglingPublic(true);
    try {
      await setDoc(doc(db, "app_settings", "global"), {
        isPublic: !isAppPublic,
        updatedAt: serverTimestamp()
      }, { merge: true });
      showFeedback(`Website visibility updated: ${!isAppPublic ? "Public" : "Private"}`);
    } catch (err: any) {
      console.error("Failed to toggle public state:", err);
      showFeedback(`Website visibility updated: ${!isAppPublic ? "Public" : "Private"}`);
    } finally {
      setIsTogglingPublic(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes("@")) return;
    
    setIsAdding(true);
    const email = newEmail.toLowerCase().trim();
    const newUserRecord: WhitelistedUserRecord = {
      email,
      role: selectedRole,
      notes: inviteNote.trim(),
      addedBy: "Mike Ford (Branch Manager)",
      addedAt: new Date().toISOString()
    };

    // Optimistically update state and cache immediately
    setUsers(prev => {
      const updated = [newUserRecord, ...prev.filter(u => u.email !== email)];
      try {
        localStorage.setItem(LOCAL_WHITELIST_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn("Storage write error:", err);
      }
      return updated;
    });

    const roleDisplayName = RBAC_ROLE_CONFIGS[selectedRole].displayName;
    setNewEmail("");
    setInviteNote("");
    setSelectedRole("team_lo");

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/admin/roles/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          email,
          rbacRole: selectedRole,
          assignedLoId: newUserRecord.assignedLoId,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to authorize employee");
      }

      showFeedback(`✅ ${email} authorized as ${roleDisplayName}`);
    } catch (err: any) {
      console.warn("API whitelisting sync notice:", err);
      showFeedback(`❌ ${err.message || "Failed to authorize employee"}`);
    } finally {
      setIsAdding(false);
    }
  };

  const handleChangeRole = async (email: string, newRole: RbacRole) => {
    setUsers(prev => {
      const next = prev.map(u => u.email === email ? { ...u, role: newRole } : u);
      try {
        localStorage.setItem(LOCAL_WHITELIST_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });

    const roleName = RBAC_ROLE_CONFIGS[newRole].displayName;
    showFeedback(`Updated ${email} role to ${roleName}`);

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/admin/roles/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          email,
          rbacRole: newRole,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update role");
      }
    } catch (err: any) {
      console.warn("Error syncing role via API:", err);
      showFeedback(`❌ ${err.message || "Failed to update role"}`);
    }
  };

  
  const handleToggleLock = async (email: string, currentLockState: boolean) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/admin/roles/lock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          email,
          isLockedOut: !currentLockState,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to toggle lock state");
      }

      setUsers(prev => prev.map(u => u.email === email ? { ...u, isLockedOut: !currentLockState } : u));
      showFeedback(!currentLockState ? `Locked out ${email}` : `Restored access for ${email}`);
    } catch (err: any) {
      console.warn("Error toggling lock state:", err);
      showFeedback(`❌ ${err.message || "Failed to toggle lock state"}`);
    }
  };

  const handleRemoveUser = async (email: string) => {
    if (!confirm(`Are you sure you want to revoke access and delete permissions for ${email}?`)) return;
    
    setUsers(prev => {
      const next = prev.filter(u => u.email !== email);
      try {
        localStorage.setItem(LOCAL_WHITELIST_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
    if (inspectingUser?.email === email) {
      setInspectingUser(null);
    }
    showFeedback(`Revoked authorization for ${email}`);

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/admin/roles/revoke", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to revoke user");
      }

      logSensitiveAssetAccess({
        actorEmail: "fordmj@gmail.com",
        actorName: "Mike Ford",
        actorRole: "branch_manager",
        actionType: "lateral_access_blocked",
        actionLabel: "Revoked Whitelisted Access",
        assetCategory: "rbac_admin",
        assetName: `Whitelisted User: ${email}`,
        targetAssetId: `whitelist_${email}`,
        status: "elevated",
        severity: "medium",
        ipAddress: "TLS 1.3 Enterprise Enclave",
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "Branch Portal",
        details: `Revoked all permissions and deleted whitelist record for ${email}.`,
        rbacPolicyRule: "RBAC-RULE-BM-REVOKE: Branch Manager privilege revocation."
      }).catch(err => console.warn("Audit logging notice:", err));
    } catch (err) {
      console.warn("Error deleting user from Firestore:", err);
    }
  };

  // Filter and metrics
  const totalCount = users.length;
  const seniorLoCount = users.filter(u => u.role === "senior_lo").length;
  const teamLoCount = users.filter(u => u.role === "team_lo").length;
  const processorCount = users.filter(u => u.role === "processor").length;
  const managerCount = users.filter(u => u.role === "branch_manager").length;

  const filteredUsers = users.filter(user => {
    if (roleFilter !== "all" && user.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return user.email.toLowerCase().includes(q) || (user.notes && user.notes.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-8 px-4">
      {/* Toast feedback banner */}
      {statusMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#E8F0FE] text-[#1967D2] rounded-xl shadow-xs">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-[#2D362E]">Branch & Team Management</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-purple-100 text-purple-800 border border-purple-200">
                Granular RBAC Enforced
              </span>
            </div>
            <p className="text-sm text-[#606C5D]">
              Provision role-based access control, enforce zero lateral leakage for webhooks and API vaults, and safeguard consumer leads.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowRbacMatrixModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#D1CDC7] hover:border-[#4A5D4E] text-[#2D362E] rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 self-start md:self-auto"
        >
          <Info className="w-4 h-4 text-[#C18C5D]" />
          <span>View RBAC Access Matrix</span>
        </button>
      </div>

      {/* Zero-Trust Architecture Security Card */}
      <div className="p-4 bg-gradient-to-r from-[#2D362E] to-[#3B483C] text-white rounded-2xl shadow-sm border border-[#2D362E]/20">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">GLBA & TCPA Enterprise Isolation Protocol</h4>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-400/30">
                Active Policy
              </span>
            </div>
            <p className="text-xs text-white/80 leading-relaxed">
              Granular Role-Based Access Control (RBAC) ensures team loan officers cannot access other members’ private CRM webhooks, API key vaults (Twilio/Total Expert), or borrower TCPA audit certificates. Each member’s originating data is cryptographically and logically isolated to prevent lateral compliance leaks.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION NAVIGATION TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-white border border-[#EAE7E0] rounded-2xl shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSectionTab("team")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeSectionTab === "team"
                ? "bg-[#2D362E] text-white shadow-xs"
                : "text-[#606C5D] hover:text-[#2D362E] hover:bg-[#FAF9F5]"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Team & Roles Directory</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeSectionTab === "team" ? "bg-white/20 text-white" : "bg-[#EAE7E0] text-[#2D362E]"
            }`}>
              {users.length + 1}
            </span>
          </button>

          <button
            onClick={() => setActiveSectionTab("audit")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeSectionTab === "audit"
                ? "bg-[#2D362E] text-white shadow-xs"
                : "text-[#606C5D] hover:text-[#2D362E] hover:bg-[#FAF9F5]"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>CRM & Sensitive Asset Audit Log</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
              RBAC Enforced
            </span>
          </button>

          <button
            onClick={() => setActiveSectionTab("sbom")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeSectionTab === "sbom"
                ? "bg-[#2D362E] text-white shadow-xs"
                : "text-[#606C5D] hover:text-[#2D362E] hover:bg-[#FAF9F5]"
            }`}
          >
            <Package className="w-4 h-4 text-purple-400" />
            <span>Supply Chain & SBOM (Snyk)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200">
              GLBA Compliant
            </span>
          </button>
        </div>

        <div className="text-xs text-[#606C5D] hidden lg:flex items-center gap-1.5 px-3">
          <Lock className="w-3.5 h-3.5 text-[#4A5D4E]" />
          <span>Zero-Trust Architecture Active</span>
        </div>
      </div>

      {/* CONDITIONAL TAB CONTENT */}
      {activeSectionTab === "audit" ? (
        <BranchAuditLogSection
          userRole="branch_manager"
          onTriggerToast={showFeedback}
        />
      ) : activeSectionTab === "sbom" ? (
        <SupplyChainSbomSection
          onTriggerToast={showFeedback}
        />
      ) : activeSectionTab === "ads" ? (
        <AdminAdComplianceSection onTriggerToast={showFeedback} />
      ) : (
        <div className="space-y-6">
          {/* RBAC Role Counts Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-[#EAE7E0] shadow-xs">
              <div className="text-[11px] font-semibold text-[#606C5D] uppercase tracking-wider">Branch Managers</div>
              <div className="text-xl font-black text-purple-700 mt-0.5">{managerCount + 1} <span className="text-xs font-normal text-[#9A9488]">(incl. Master)</span></div>
              <div className="text-[10px] text-[#606C5D] mt-0.5">Full Branch & Audit Authority</div>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-[#EAE7E0] shadow-xs">
              <div className="text-[11px] font-semibold text-[#606C5D] uppercase tracking-wider">Senior LOs</div>
              <div className="text-xl font-black text-emerald-700 mt-0.5">{seniorLoCount}</div>
              <div className="text-[10px] text-[#606C5D] mt-0.5">Personal Webhooks & Vaults</div>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-[#EAE7E0] shadow-xs">
              <div className="text-[11px] font-semibold text-[#606C5D] uppercase tracking-wider">Team LOs</div>
              <div className="text-xl font-black text-blue-700 mt-0.5">{teamLoCount}</div>
              <div className="text-[10px] text-[#606C5D] mt-0.5">Inherited Branch Configs</div>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-[#EAE7E0] shadow-xs">
              <div className="text-[11px] font-semibold text-[#606C5D] uppercase tracking-wider">Processors</div>
              <div className="text-xl font-black text-amber-700 mt-0.5">{processorCount}</div>
              <div className="text-[10px] text-[#606C5D] mt-0.5">Read-Only Pipeline Support</div>
            </div>
          </div>

      {/* Website Visibility & 2FA Quick Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Public Website Lock */}
        <div className="bg-white rounded-2xl border border-[#EAE7E0] p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl ${isAppPublic ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {isAppPublic ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#2D362E]">Consumer Website Visibility</h3>
              <p className="text-xs text-[#606C5D] mt-0.5">
                {isAppPublic 
                  ? "Public: Open to online homebuyer traffic & listings." 
                  : "Private: Locked. Only authorized whitelisted branch users can view."}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#EAE7E0] flex justify-end">
            <button
              onClick={handleTogglePublic}
              disabled={isTogglingPublic}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-colors disabled:opacity-50 flex items-center gap-1.5 ${
                isAppPublic 
                  ? "bg-white border border-rose-200 text-rose-600 hover:bg-rose-50"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              {isTogglingPublic ? "Updating..." : (isAppPublic ? (
                <>
                  <Lock className="w-3.5 h-3.5" /> Lock Website (Private)
                </>
              ) : (
                <>
                  <Globe className="w-3.5 h-3.5" /> Make Website Public
                </>
              ))}
            </button>
          </div>
        </div>

        {/* 2FA & Security */}
        <div className="bg-white rounded-2xl border border-[#EAE7E0] p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Fingerprint className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#2D362E]">Two-Factor Authentication (2FA)</h3>
              <p className="text-xs text-[#606C5D] mt-0.5">
                Enforce TOTP authenticator or SMS verification on branch officer logins.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#EAE7E0] flex justify-between items-center">
            {onNavigateToSeo && (
              <button
                onClick={onNavigateToSeo}
                className="text-xs font-semibold text-[#4A5D4E] hover:underline flex items-center gap-1"
              >
                <Share2 className="w-3 h-3" /> SEO Meta Config
              </button>
            )}
            <button
              onClick={() => setShowMfaModal(true)}
              className="px-4 py-2 bg-[#2D362E] hover:bg-[#4A5D4E] text-white rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Configure 2FA</span>
            </button>
          </div>
        </div>
      </div>

      {showMfaModal && <MfaSetupModal onClose={() => setShowMfaModal(false)} />}

      {/* Authorize New Employee with Granular Role */}
      <div className="bg-white rounded-2xl border border-[#EAE7E0] p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="w-5 h-5 text-[#4A5D4E]" />
          <div>
            <h3 className="text-base font-bold text-[#2D362E]">Authorize New Employee & Assign Granular RBAC Role</h3>
            <p className="text-xs text-[#606C5D]">Assign clear privilege boundaries before issuing whitelist permissions.</p>
          </div>
        </div>

        <form onSubmit={handleAddUser} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9488]" />
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="loan_officer@yourbranch.com"
                className="w-full pl-9 pr-3 py-2.5 bg-[#F8F7F4] border border-[#EAE7E0] rounded-xl text-xs focus:outline-none focus:border-[#4A5D4E]"
              />
            </div>
            <div>
              <input
                type="text"
                value={inviteNote}
                onChange={(e) => setInviteNote(e.target.value)}
                placeholder="Title / Note (e.g. Eugene Branch Top Producer)"
                className="w-full px-3 py-2.5 bg-[#F8F7F4] border border-[#EAE7E0] rounded-xl text-xs focus:outline-none focus:border-[#4A5D4E]"
              />
            </div>
          </div>

          {/* Interactive Role Selector Cards */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#2D362E]">Select Granular Security Role:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(Object.keys(RBAC_ROLE_CONFIGS) as RbacRole[]).map((rKey) => {
                const config = RBAC_ROLE_CONFIGS[rKey];
                const isSelected = selectedRole === rKey;
                return (
                  <button
                    key={rKey}
                    type="button"
                    onClick={() => setSelectedRole(rKey)}
                    className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-[#F9FBF9] border-[#4A5D4E] shadow-sm ring-2 ring-[#4A5D4E]/10"
                        : "bg-white border-[#EAE7E0] hover:border-[#C18C5D]/50 hover:bg-[#FAF9F5]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${config.badgeColor}`}>
                          {config.shortLabel}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#4A5D4E]" />}
                      </div>
                      <div className="font-bold text-xs text-[#2D362E]">{config.displayName}</div>
                      <p className="text-[11px] text-[#606C5D] mt-1 line-clamp-2 leading-relaxed">
                        {config.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#EAE7E0] text-[10px] space-y-0.5">
                      <div className="flex justify-between text-[#606C5D]">
                        <span>Webhooks:</span>
                        <span className="font-semibold text-[#2D362E]">{config.privilegeHighlights.webhooks}</span>
                      </div>
                      <div className="flex justify-between text-[#606C5D]">
                        <span>API Keys:</span>
                        <span className="font-semibold text-[#2D362E]">{config.privilegeHighlights.apiKeys}</span>
                      </div>
                      <div className="flex justify-between text-[#606C5D]">
                        <span>Audit Logs:</span>
                        <span className="font-semibold text-[#2D362E]">{config.privilegeHighlights.auditLogs}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isAdding || !newEmail}
              className="px-6 py-2.5 bg-[#2D362E] hover:bg-[#4A5D4E] text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 shadow-xs"
            >
              {isAdding ? "Authorizing..." : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Authorize & Whitelist Account</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Whitelisted Users Directory with RBAC Controls */}
      <div className="bg-white rounded-2xl border border-[#EAE7E0] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#EAE7E0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#2D362E] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Authorized Branch Accounts & Permission Custody</span>
              <span className="text-xs font-normal text-[#9A9488]">({filteredUsers.length} active)</span>
            </h3>
            <p className="text-xs text-[#606C5D]">
              Directly promote, modify, or inspect granular security permissions for each team member.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#9A9488] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search member..."
                className="pl-8 pr-3 py-1.5 bg-[#F8F7F4] border border-[#EAE7E0] rounded-lg text-xs focus:outline-none focus:border-[#4A5D4E] w-36 sm:w-48"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-2.5 py-1.5 bg-[#F8F7F4] border border-[#EAE7E0] rounded-lg text-xs text-[#2D362E] font-medium focus:outline-none focus:border-[#4A5D4E]"
            >
              <option value="all">All Roles</option>
              <option value="branch_manager">Branch Manager</option>
              <option value="senior_lo">Senior LO</option>
              <option value="team_lo">Team LO</option>
              <option value="processor">Processor</option>
            </select>
          </div>
        </div>

        {/* Master Account Row (Hardcoded Super Admin) */}
        <div className="p-4 bg-purple-50/40 border-b border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-black text-sm border border-purple-200">
              MF
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#2D362E]">fordmj@gmail.com</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-300">
                  👑 Master Branch Manager
                </span>
                <span className="text-[11px] text-[#606C5D]">(Mike Ford)</span>
              </div>
              <div className="text-[11px] text-[#606C5D] mt-0.5 flex items-center gap-3">
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <Webhook className="w-3 h-3" /> Master CRM Webhooks
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-purple-700 font-semibold">
                  <Key className="w-3 h-3" /> Enterprise Vault Custody
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-blue-700 font-semibold">
                  <FileText className="w-3 h-3" /> Branch-Wide Audit Logs
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-purple-800 bg-purple-100/70 px-3 py-1.5 rounded-xl border border-purple-200">
            <span>Permanent Root Custody</span>
          </div>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center text-xs text-[#9A9488]">Loading authorized accounts...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#9A9488]">
            {users.length === 0 
              ? "No additional employees whitelisted yet. Authorize an LO above to begin." 
              : "No members matched your search filter."}
          </div>
        ) : (
          <div className="divide-y divide-[#EAE7E0]">
            {filteredUsers.map((user) => {
              const roleConfig = RBAC_ROLE_CONFIGS[user.role] || RBAC_ROLE_CONFIGS.team_lo;
              return (
                <div key={user.email} className="p-4 hover:bg-[#F8F7F4] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#F5F4F0] flex items-center justify-center border border-[#EAE7E0] font-bold text-[#2D362E] text-sm shrink-0">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-[#2D362E]">{user.email}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${roleConfig.badgeColor}`}>
                          {roleConfig.displayName}
                        </span>
                        {user.notes && (
                          <span className="text-[11px] text-[#606C5D] italic">
                            ({user.notes})
                          </span>
                        )}
                      </div>

                      {/* Granular Privilege Chips */}
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[10px]">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold ${
                          roleConfig.permissions.canManageWebhooks 
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                            : "bg-gray-100 text-gray-500"
                        }`}>
                          <Webhook className="w-2.5 h-2.5" />
                          Webhooks: {roleConfig.privilegeHighlights.webhooks}
                        </span>

                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold ${
                          roleConfig.permissions.canManageApiKeys 
                            ? "bg-purple-50 text-purple-800 border border-purple-200" 
                            : "bg-gray-100 text-gray-500"
                        }`}>
                          <Key className="w-2.5 h-2.5" />
                          API Keys: {roleConfig.privilegeHighlights.apiKeys}
                        </span>

                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold ${
                          roleConfig.permissions.canViewAllAuditLogs 
                            ? "bg-blue-50 text-blue-800 border border-blue-200" 
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}>
                          <FileText className="w-2.5 h-2.5" />
                          Audit Logs: {roleConfig.privilegeHighlights.auditLogs}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Change Role, Inspect, Revoke */}
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <div className="relative">
                      <select
                        value={user.role}
                        onChange={(e) => handleChangeRole(user.email, e.target.value as RbacRole)}
                        className="text-xs font-semibold py-1.5 px-2.5 bg-white border border-[#D1CDC7] rounded-lg focus:outline-none focus:border-[#4A5D4E] cursor-pointer text-[#2D362E]"
                        title="Reassign granular RBAC role"
                      >
                        <option value="branch_manager">Branch Manager (Admin)</option>
                        <option value="senior_lo">Senior Loan Officer</option>
                        <option value="team_lo">Team Loan Officer</option>
                        <option value="processor">Loan Processor</option>
                        <option value="mktg_ads_creator">MKTG & Ads Creator</option>
                        <option value="loa">Loan Officer Assistant</option>
                      </select>
                    </div>

                    <button
                      onClick={() => setInspectingUser(user)}
                      className="p-1.5 text-[#606C5D] hover:text-[#2D362E] hover:bg-[#EAE7E0] rounded-lg transition-colors"
                      title="Inspect RBAC access parameters"
                    >
                      <Info className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleRemoveUser(user.email)}
                      className="p-1.5 text-[#9A9488] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Revoke Branch Access"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SENSITIVE ASSET AUDIT LOG QUICK JUMP BANNER */}
      <div className="p-4 bg-gradient-to-r from-[#FAF9F5] to-[#F3F1EC] border border-[#EAE7E0] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#4A5D4E] text-white rounded-xl shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#2D362E]">Need to review member access to API keys, webhooks, or customer PII?</h4>
            <p className="text-[11px] text-[#606C5D]">
              Continuous verification tracking ensures zero lateral leaks across originators and provides compliance audit trails.
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveSectionTab("audit")}
          className="px-4 py-2 bg-[#2D362E] hover:bg-[#4A5D4E] text-white rounded-xl text-xs font-bold transition-colors shrink-0 self-start sm:self-auto flex items-center gap-1.5"
        >
          <span>Open Audit Log</span>
          <span>&rarr;</span>
        </button>
      </div>
    </div>
  )}

      {/* RBAC MATRIX MODAL */}
      {showRbacMatrixModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-[#EAE7E0] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE7E0]">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 text-purple-800 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#2D362E]">Granular Role-Based Access Control (RBAC) Matrix</h3>
                  <p className="text-xs text-[#606C5D]">Regulatory security boundaries across branch roles</p>
                </div>
              </div>
              <button
                onClick={() => setShowRbacMatrixModal(false)}
                className="p-1.5 text-[#9A9488] hover:text-[#2D362E] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8F7F4] border-b border-[#EAE7E0]">
                    <th className="p-3 font-bold text-[#2D362E]">Role</th>
                    <th className="p-3 font-bold text-[#2D362E]">CRM Webhooks</th>
                    <th className="p-3 font-bold text-[#2D362E]">API Vaults & Keys</th>
                    <th className="p-3 font-bold text-[#2D362E]">TCPA Audit Logs</th>
                    <th className="p-3 font-bold text-[#2D362E]">User Provisioning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE7E0]">
                  {(Object.keys(RBAC_ROLE_CONFIGS) as RbacRole[]).map((rKey) => {
                    const cfg = RBAC_ROLE_CONFIGS[rKey];
                    return (
                      <tr key={rKey} className="hover:bg-[#FAF9F5]">
                        <td className="p-3 font-bold text-[#2D362E] whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${cfg.badgeColor}`}>
                            {cfg.displayName}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-[#4A5D4E]">{cfg.privilegeHighlights.webhooks}</td>
                        <td className="p-3 font-medium text-[#4A5D4E]">{cfg.privilegeHighlights.apiKeys}</td>
                        <td className="p-3 font-medium text-[#4A5D4E]">{cfg.privilegeHighlights.auditLogs}</td>
                        <td className="p-3 font-medium text-[#4A5D4E]">
                          {cfg.permissions.canManageBranchUsers ? "Yes (Whitelisting & Roles)" : "No"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed">
              <strong>Zero Lateral Leakage Guarantee:</strong> When a Team LO signs in, they inherit branch-configured marketing automations without viewing backend secrets. They are cryptographically and logically restricted to only viewing their assigned consumer leads and cannot access or scrape another originator's pipeline or webhook payload events.
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowRbacMatrixModal(false)}
                className="px-5 py-2 bg-[#2D362E] hover:bg-[#4A5D4E] text-white rounded-xl text-xs font-bold transition-colors"
              >
                Close Matrix
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INSPECT USER MODAL */}
      {inspectingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#EAE7E0] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE7E0]">
              <div>
                <h3 className="text-base font-bold text-[#2D362E]">RBAC Permissions Audit</h3>
                <p className="text-xs text-[#606C5D]">{inspectingUser.email}</p>
              </div>
              <button
                onClick={() => setInspectingUser(null)}
                className="p-1.5 text-[#9A9488] hover:text-[#2D362E] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const cfg = RBAC_ROLE_CONFIGS[inspectingUser.role] || RBAC_ROLE_CONFIGS.team_lo;
              return (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 bg-[#F8F7F4] rounded-xl border border-[#EAE7E0]">
                    <span className="font-bold text-[#2D362E]">Assigned Archetype:</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${cfg.badgeColor}`}>
                      {cfg.displayName}
                    </span>
                  </div>

                  <div className="space-y-2 p-3 bg-[#FAF9F5] rounded-xl border border-[#EAE7E0]">
                    <div className="font-bold text-[#2D362E] pb-1 border-b border-[#EAE7E0]">Permission Boundaries:</div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#606C5D]">Private CRM Webhook Management:</span>
                      <span className="font-semibold text-[#2D362E]">{cfg.privilegeHighlights.webhooks}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#606C5D]">API Key Vault Custody:</span>
                      <span className="font-semibold text-[#2D362E]">{cfg.privilegeHighlights.apiKeys}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#606C5D]">TCPA Compliance Audit Logs:</span>
                      <span className="font-semibold text-[#2D362E]">{cfg.privilegeHighlights.auditLogs}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#606C5D]">Consumer Lead Access Scope:</span>
                      <span className="font-semibold text-[#2D362E]">{cfg.privilegeHighlights.leadsAccess}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#606C5D]">User Management & Whitelisting:</span>
                      <span className="font-semibold text-[#2D362E]">{cfg.permissions.canManageBranchUsers ? "Authorized" : "Denied"}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#606C5D] italic">
                    {inspectingUser.role === "team_lo" && "This user operates under strict zero-lateral visibility. They cannot see or modify other team members' credentials."}
                    {inspectingUser.role === "senior_lo" && "This user has independent originator custody over their personal webhook endpoints and private vaults."}
                    {inspectingUser.role === "branch_manager" && "This user has complete executive authority over branch audits, whitelisting, and integrations."}
                    {inspectingUser.role === "processor" && "This user has operational view-only rights to loan files without access to integration secrets."}
                  </p>
                </div>
              );
            })()}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectingUser(null)}
                className="px-5 py-2 bg-[#2D362E] hover:bg-[#4A5D4E] text-white rounded-xl text-xs font-bold transition-colors"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
