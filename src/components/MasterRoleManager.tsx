import React, { useState } from "react";
import {
  ShieldCheck, Users, Send,
  Key,
  UserPlus,
  FileText,
  Trash2,
  Edit3,
  X,
  Save,
  AlertTriangle,
  Download,
  Terminal,
  CheckCircle,
  Power
} from "lucide-react";
import { LoanOfficerProfile } from "../types";
import { HeadshotAvatar } from "./HeadshotAvatar";

interface MasterRoleManagerProps {
  guidesState?: any;
}

export const MasterRoleManager: React.FC<MasterRoleManagerProps> = ({ guidesState }) => {
  const [activeTab, setActiveTab] = useState<"accounts" | "invites" | "audit_log" | "it_widget_toggle">("accounts");

  const [accounts, setAccounts] = useState([
    {
      id: "1",
      email: "fordmj@gmail.com",
      role: "branch_manager",
      status: "active",
      name: "Mike Ford",
      notes: "System Owner.",
    },
    {
      id: "2",
      email: "it-tech@cfmtg.com",
      role: "it_manager",
      status: "active",
      name: "IT Manager / Tech",
      notes: "Temporary admin-level debugging & error logging access.",
    },
    {
      id: "3",
      email: "developer-tester@cfmtg.com",
      role: "peer_tester",
      status: "active",
      name: "Peer Tester (Developer)",
      notes: "System-wide developer peer testing access.",
    },
    {
      id: "4",
      email: "auditor@yourcompany.com",
      role: "compliance_auditor",
      status: "active",
      name: "IT Compliance Team",
      notes: "Zero-Trust view only.",
    },
    {
      id: "5",
      email: "sjenkins@pnwrealty.com",
      role: "team_lo",
      status: "suspended",
      name: "Sarah Jenkins",
      notes: "Access temporarily suspended pending NMLS renewal.",
    },
  ]);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("it_manager");
  const [inviteNotes, setInviteNotes] = useState("");

  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editStatus, setEditStatus] = useState("");

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

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    const roleNames: Record<string, string> = {
      it_manager: "IT Manager / Tech",
      peer_tester: "Peer Tester (Developer)",
      branch_manager: "Branch Manager (Admin)",
      team_lo: "Loan Officer (Team)",
      compliance_auditor: "Compliance Auditor",
    };

    const newAcc = {
      id: Date.now().toString(),
      email: inviteEmail,
      role: inviteRole,
      status: "active",
      name: roleNames[inviteRole] || "Invited Employee",
      notes: inviteNotes || "Invited by Mike Ford Admin with temporary system access credentials.",
    };
    setAccounts([...accounts, newAcc]);
    setInviteEmail("");
    setInviteNotes("");
    setActiveTab("accounts");
  };

  const handleRevoke = (id: string) => {
    setAccounts(
      accounts.map((acc) => {
        if (acc.id === id) {
          return { ...acc, status: "suspended", notes: `Access revoked by Mike Ford Admin on ${new Date().toLocaleDateString()}` };
        }
        return acc;
      })
    );
  };

  const handleDeleteProfile = (id: string) => {
    if (window.confirm("Are you sure you want to delete this employee profile from the system altogether?")) {
      setAccounts(accounts.filter((acc) => acc.id !== id));
    }
  };

  const handleSaveEdit = () => {
    setAccounts(
      accounts.map((acc) => {
        if (acc.id === editingAccount.id) {
          return { ...acc, notes: editNotes, role: editRole, status: editStatus };
        }
        return acc;
      })
    );
    setEditingAccount(null);
  };

  const exportCSV = () => {
    const headers = ["ID", "Email", "Name", "Role", "Status", "Notes"];
    const rows = accounts.map((a) => [a.id, a.email, a.name, a.role, a.status, `"${a.notes}"`]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `master_role_audit_log_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-[#1A211B] rounded-2xl shadow-sm border border-slate-200 dark:border-[#606C5D] p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-[#E8ECE6] flex items-center gap-2">
            <Key className="w-6 h-6 text-indigo-500" />
            Mike Ford Admin: Master Access & Role Management
          </h2>
          <p className="text-sm text-slate-500 dark:text-[#9A9488] mt-1 max-w-2xl">
            System owner dashboard. Invite IT Managers/Techs and Peer Testers, manage temporary admin credentials, revoke or delete profiles, and toggle the Error Whisperer debugging tool.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("it_widget_toggle")}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-lg transition-colors border border-emerald-600 whitespace-nowrap shadow-xs"
          >
            <Terminal className="w-4 h-4" />
            Error Whisperer Settings
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-[#4A5D4E] hover:bg-[#38463B] text-white text-sm font-semibold rounded-lg transition-colors border border-[#606C5D] whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            Export Audit CSV
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-[#606C5D] mb-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab("accounts")}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === "accounts"
              ? "border-indigo-500 text-indigo-500"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-[#9A9488] dark:hover:text-[#E8ECE6]"
          }`}
        >
          <Users className="w-4 h-4" />
          Active Accounts & Roles ({accounts.length})
        </button>
        <button
          onClick={() => setActiveTab("invites")}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === "invites"
              ? "border-indigo-500 text-indigo-500"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-[#9A9488] dark:hover:text-[#E8ECE6]"
          }`}
        >
          <UserPlus className="w-4 h-4" />
          Invite IT Manager / Peer Tester
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
              <button
                onClick={() => handleToggleWhisperer(!showErrorWhispererWidget)}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm cursor-pointer ${
                  showErrorWhispererWidget
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                    : "bg-stone-200 dark:bg-slate-800 text-stone-700 dark:text-slate-300 hover:bg-stone-300"
                }`}
              >
                <Power className="w-4 h-4" />
                <span>{showErrorWhispererWidget ? "Enabled (ON)" : "Hidden (OFF)"}</span>
              </button>
            </div>
            <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed pt-2 border-t border-emerald-200/60 dark:border-emerald-800/40">
              {showErrorWhispererWidget ? (
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                  ✓ The Error Whisperer widget is currently ACTIVE in the bottom-right corner of the dashboard for IT Managers and Techs to debug system errors.
                </span>
              ) : (
                <span className="text-slate-500 dark:text-slate-400">
                  • Hidden from dashboard default state. Toggle ON to enable debugging telemetry for IT personnel.
                </span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* INVITES TAB */}
      {activeTab === "invites" && (
        <div className="max-w-xl">
          <div className="bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-xl mb-6 space-y-1">
            <h4 className="text-indigo-400 font-bold text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Mike Ford Admin Exclusive: IT & Tester Onboarding
            </h4>
            <p className="text-indigo-400/80 text-xs">
              Invite IT Managers/Techs or Peer Testers via email. They receive temporary full-system admin credentials to debug and troubleshoot errors, with one-click revocation or complete profile deletion anytime by Mike Ford.
            </p>
          </div>

          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-[#E8ECE6] uppercase tracking-wider block mb-1">
                Invitee Email Address
              </label>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#2D362E] border border-slate-200 dark:border-[#606C5D] rounded-lg p-3 text-sm text-slate-900 dark:text-[#E8ECE6] focus:border-indigo-400 focus:outline-none transition-colors"
                placeholder="it-manager@company.com or tester@company.com"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-[#E8ECE6] uppercase tracking-wider block mb-1">
                Specialized Temporary Role
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#2D362E] border border-slate-200 dark:border-[#606C5D] rounded-lg p-3 text-sm text-slate-900 dark:text-[#E8ECE6] focus:border-indigo-400 focus:outline-none transition-colors"
              >
                <option value="it_manager">IT Manager / Tech (Temporary Admin Access for Debugging)</option>
                <option value="peer_tester">Peer Tester (Developer Full System Access)</option>
                <option value="branch_manager">Branch Manager (Full Admin)</option>
                <option value="team_lo">Loan Officer (Team)</option>
                <option value="compliance_auditor">Compliance & IT Auditor (Zero-Trust Only)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-[#E8ECE6] uppercase tracking-wider block mb-1">
                Assignment / Trace Note
              </label>
              <input
                type="text"
                value={inviteNotes}
                onChange={(e) => setInviteNotes(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#2D362E] border border-slate-200 dark:border-[#606C5D] rounded-lg p-3 text-sm text-slate-900 dark:text-[#E8ECE6] focus:border-indigo-400 focus:outline-none transition-colors"
                placeholder="e.g. Invited for sprint error log debugging & API timeout troubleshooting"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-colors w-full flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              Send Invitation & Grant Temporary Admin Access
            </button>
          </form>
        </div>
      )}

      {/* ACTIVE ACCOUNTS TAB */}
      {activeTab === "accounts" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-stone-100 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
            <span>Manage onboarded employees, IT managers, peer testers, and branch personnel. Mike Ford can revoke temporary access or delete profiles instantly.</span>
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{accounts.length} Total Accounts</span>
          </div>

          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="bg-slate-50 dark:bg-[#2D362E] border border-slate-200 dark:border-[#606C5D] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-[#E8ECE6]">
                    {acc.name}
                  </h4>
                  <span
                    className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full ${
                      acc.status === "active"
                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                        : acc.status === "invited"
                          ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                          : "bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                    }`}
                  >
                    {acc.status}
                  </span>
                  <span className="text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                    Role: {acc.role}
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-[#9A9488] mb-2 font-mono">
                  {acc.email}
                </div>
                <div className="text-xs text-slate-700 dark:text-[#C18C5D] bg-[#C18C5D]/10 px-3 py-1.5 rounded-lg border border-[#C18C5D]/20 inline-block">
                  <strong>Trace Note:</strong> {acc.notes}
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    setEditingAccount(acc);
                    setEditNotes(acc.notes);
                    setEditRole(acc.role);
                    setEditStatus(acc.status);
                  }}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer"
                  title="Edit Account & Password / Notes"
                >
                  <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Edit</span>
                </button>

                {acc.status !== "suspended" && (
                  <button
                    onClick={() => handleRevoke(acc.id)}
                    className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 rounded-xl transition-colors text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 cursor-pointer"
                    title="Revoke temporary login credentials instantly"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Revoke</span>
                  </button>
                )}

                <button
                  onClick={() => handleDeleteProfile(acc.id)}
                  className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 hover:bg-rose-100 rounded-xl transition-colors text-xs font-semibold text-rose-800 dark:text-rose-300 flex items-center gap-1.5 cursor-pointer"
                  title="Delete employee profile from system altogether"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Delete Profile</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDIT MODAL */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#1A211B] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#606C5D] w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-200 dark:border-[#606C5D] flex items-center justify-between bg-slate-50 dark:bg-[#2D362E]">
              <h3 className="font-bold text-slate-900 dark:text-[#E8ECE6] flex items-center gap-2 text-sm">
                <Edit3 className="w-4 h-4 text-indigo-500" />
                Manage Employee Profile: {editingAccount.email}
              </h3>
              <button
                onClick={() => setEditingAccount(null)}
                className="text-slate-500 hover:text-slate-700 dark:text-[#9A9488] dark:hover:text-[#E8ECE6] transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-[#E8ECE6] uppercase tracking-wider block mb-1">
                  Account Status & Access Control
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#2D362E] border border-slate-200 dark:border-[#606C5D] rounded-xl p-3 text-sm text-slate-900 dark:text-[#E8ECE6] focus:border-indigo-400 focus:outline-none transition-colors font-sans"
                >
                  <option value="active">Active (Permitted Full System Access)</option>
                  <option value="suspended">Suspended (Revoked Credentials)</option>
                  <option value="deleted">Deleted (Pending Removal)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-[#E8ECE6] uppercase tracking-wider block mb-1">
                  RBAC Role Assignment
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#2D362E] border border-slate-200 dark:border-[#606C5D] rounded-xl p-3 text-sm text-slate-900 dark:text-[#E8ECE6] focus:border-indigo-400 focus:outline-none transition-colors font-sans"
                >
                  <option value="it_manager">IT Manager / Tech (Temporary Admin Debugging)</option>
                  <option value="peer_tester">Peer Tester (Developer Full System Access)</option>
                  <option value="branch_manager">Branch Manager (Admin)</option>
                  <option value="team_lo">Loan Officer (Team)</option>
                  <option value="compliance_auditor">Compliance & IT Auditor (Zero-Trust Only)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-[#E8ECE6] uppercase tracking-wider block mb-1">
                  Trace Notes & Password Reset Log
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#2D362E] border border-slate-200 dark:border-[#606C5D] rounded-xl p-3 text-sm text-slate-900 dark:text-[#E8ECE6] focus:border-indigo-400 focus:outline-none transition-colors min-h-[90px] font-sans"
                  placeholder="Record password reset timestamp or debugging task rationale..."
                />
              </div>

              {editStatus === "suspended" && (
                <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-rose-400 leading-relaxed">
                    Revoking or suspending this profile immediately terminates login sessions and API token generation for {editingAccount.email}.
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-[#606C5D] bg-slate-50 dark:bg-[#2D362E] flex justify-end gap-3">
              <button
                onClick={() => setEditingAccount(null)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 dark:text-[#9A9488] dark:hover:text-[#E8ECE6] text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Save className="w-4 h-4" />
                Save Changes & Credentials
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
