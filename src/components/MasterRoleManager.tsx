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
} from "lucide-react";
import { LoanOfficerProfile } from "../types";
import { HeadshotAvatar } from "./HeadshotAvatar";

interface MasterRoleManagerProps {
  // In a real app, we'd fetch this from the "whitelisted_emails" Firestore collection.
  // For the presentation demo, we can use static/mock data to prove the UI works.
  guidesState?: any;
}

export const MasterRoleManager: React.FC<MasterRoleManagerProps> = ({ guidesState }) => {
  const [activeTab, setActiveTab] = useState<"accounts" | "invites" | "audit_log">("accounts");

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
      email: "auditor@yourcompany.com",
      role: "compliance_auditor",
      status: "active",
      name: "IT Compliance Team",
      notes: "Zero-Trust view only.",
    },
    {
      id: "3",
      email: "sjenkins@pnwrealty.com",
      role: "team_lo",
      status: "suspended",
      name: "Sarah Jenkins",
      notes: "Access temporarily suspended pending NMLS renewal.",
    },
  ]);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("team_lo");

  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editStatus, setEditStatus] = useState("");

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    const newAcc = {
      id: Date.now().toString(),
      email: inviteEmail,
      role: inviteRole,
      status: "invited",
      name: "Pending Invite",
      notes: "Invitation sent.",
    };
    setAccounts([...accounts, newAcc]);
    setInviteEmail("");
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
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\\n");
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
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-[#E8ECE6] flex items-center gap-2">
            <Key className="w-6 h-6 text-indigo-500" />
            Master Access & Role Management
          </h2>
          <p className="text-sm text-slate-500 dark:text-[#9A9488] mt-1 max-w-2xl">
            System owner controls. Invite users, manage RBAC credentials, suspend accounts, and
            maintain a strict audit log of all system access changes.
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-[#4A5D4E] hover:bg-[#38463B] text-white text-sm font-semibold rounded-lg transition-colors border border-[#606C5D] whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          Export Master Audit CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-[#606C5D] mb-6">
        <button
          onClick={() => setActiveTab("accounts")}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "accounts"
              ? "border-indigo-500 text-indigo-500"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-[#9A9488] dark:hover:text-[#E8ECE6]"
          }`}
        >
          <Users className="w-4 h-4" />
          Active Accounts & Roles
        </button>
        <button
          onClick={() => setActiveTab("invites")}
          className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "invites"
              ? "border-indigo-500 text-indigo-500"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-[#9A9488] dark:hover:text-[#E8ECE6]"
          }`}
        >
          <UserPlus className="w-4 h-4" />
          Invite Credentials
        </button>
      </div>

      {activeTab === "invites" && (
        <div className="max-w-xl">
          <div className="bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-xl mb-6">
            <h4 className="text-indigo-400 font-bold text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Owner Exclusive Action
            </h4>
            <p className="text-indigo-400/80 text-xs mt-1">
              Only Mike Ford can generate initial login credentials. Once invited, the user can
              authenticate via Google Workspace or their email to activate the assigned role.
            </p>
          </div>

          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-[#E8ECE6] uppercase tracking-wider block mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#2D362E] border border-slate-200 dark:border-[#606C5D] rounded-lg p-3 text-sm text-slate-900 dark:text-[#E8ECE6] focus:border-indigo-400 focus:outline-none transition-colors"
                placeholder="user@company.com"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-[#E8ECE6] uppercase tracking-wider block mb-1">
                RBAC Role Assignment
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#2D362E] border border-slate-200 dark:border-[#606C5D] rounded-lg p-3 text-sm text-slate-900 dark:text-[#E8ECE6] focus:border-indigo-400 focus:outline-none transition-colors"
              >
                <option value="team_lo">Loan Officer (Team)</option>
                <option value="branch_manager">Branch Manager (Admin)</option>
                <option value="compliance_auditor">
                  Compliance & IT Auditor (Zero-Trust Only)
                </option>
              </select>
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-colors w-full flex items-center justify-center gap-2 mt-4"
            >
              <Send className="w-4 h-4" />
              Generate Invitation & Whitelist
            </button>
          </form>
        </div>
      )}

      {activeTab === "accounts" && (
        <div className="space-y-4">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="bg-slate-50 dark:bg-[#2D362E] border border-slate-200 dark:border-[#606C5D] rounded-xl p-4 flex items-start justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-[#E8ECE6]">
                    {acc.name}
                  </h4>
                  <span
                    className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                      acc.status === "active"
                        ? "bg-emerald-500/20 text-emerald-500"
                        : acc.status === "invited"
                          ? "bg-blue-500/20 text-blue-500"
                          : "bg-rose-500/20 text-rose-500"
                    }`}
                  >
                    {acc.status}
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-[#9A9488] mb-2">
                  {acc.email} • {acc.role}
                </div>
                <div className="text-xs text-slate-700 dark:text-[#C18C5D] bg-[#C18C5D]/10 px-3 py-2 rounded-lg border border-[#C18C5D]/20 inline-block">
                  <strong>Trace Note:</strong> {acc.notes}
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingAccount(acc);
                    setEditNotes(acc.notes);
                    setEditRole(acc.role);
                    setEditStatus(acc.status);
                  }}
                  className="p-2 hover:bg-slate-200 dark:hover:bg-[#1A211B] rounded-lg transition-colors text-slate-500 dark:text-[#9A9488]"
                  title="Edit Account & Trace Notes"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-[#1A211B] rounded-2xl shadow-xl border border-slate-200 dark:border-[#606C5D] w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-200 dark:border-[#606C5D] flex items-center justify-between bg-slate-50 dark:bg-[#2D362E]">
              <h3 className="font-bold text-slate-900 dark:text-[#E8ECE6] flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-500" />
                Manage Account: {editingAccount.email}
              </h3>
              <button
                onClick={() => setEditingAccount(null)}
                className="text-slate-500 hover:text-slate-700 dark:text-[#9A9488] dark:hover:text-[#E8ECE6] transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-[#E8ECE6] uppercase tracking-wider block mb-1">
                  Account Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#2D362E] border border-slate-200 dark:border-[#606C5D] rounded-lg p-3 text-sm text-slate-900 dark:text-[#E8ECE6] focus:border-indigo-400 focus:outline-none transition-colors"
                >
                  <option value="active">Active (Permitted)</option>
                  <option value="suspended">Suspended (Access Revoked)</option>
                  <option value="deleted">Deleted (Wipe Data)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-[#E8ECE6] uppercase tracking-wider block mb-1">
                  RBAC Role Assignment
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#2D362E] border border-slate-200 dark:border-[#606C5D] rounded-lg p-3 text-sm text-slate-900 dark:text-[#E8ECE6] focus:border-indigo-400 focus:outline-none transition-colors"
                >
                  <option value="team_lo">Loan Officer (Team)</option>
                  <option value="branch_manager">Branch Manager (Admin)</option>
                  <option value="compliance_auditor">
                    Compliance & IT Auditor (Zero-Trust Only)
                  </option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-[#E8ECE6] uppercase tracking-wider block mb-1">
                  Trace Notes / Comments
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#2D362E] border border-slate-200 dark:border-[#606C5D] rounded-lg p-3 text-sm text-slate-900 dark:text-[#E8ECE6] focus:border-indigo-400 focus:outline-none transition-colors min-h-[100px]"
                  placeholder="Record rationale for role change or suspension..."
                />
              </div>

              {editStatus === "suspended" && (
                <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-rose-400 leading-relaxed">
                    Suspending this account immediately revokes API access and portal login
                    capabilities for {editingAccount.email}.
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
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Trace Notes & Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
