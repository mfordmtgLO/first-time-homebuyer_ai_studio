import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { Building, UserPlus, Mail, ShieldCheck, Trash2, ShieldAlert, Globe, Lock, Fingerprint } from "lucide-react";
import { MfaSetupModal } from "./MfaSetupModal";

interface WhitelistedUser {
  email: string;
  addedAt: any;
  role: string;
}

export const BranchManagement: React.FC = () => {
  const [users, setUsers] = useState<WhitelistedUser[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isAppPublic, setIsAppPublic] = useState(false);
  const [isTogglingPublic, setIsTogglingPublic] = useState(false);
  const [showMfaModal, setShowMfaModal] = useState(false);

  useEffect(() => {
    fetchWhitelistedUsers();
    
    const unsubscribe = onSnapshot(doc(db, "app_settings", "global"), (docSnap) => {
      if (docSnap.exists()) {
        setIsAppPublic(docSnap.data().isPublic === true);
      } else {
        setIsAppPublic(false);
      }
    });

    return () => unsubscribe();
  }, []);


  const handleTogglePublic = async () => {
    setIsTogglingPublic(true);
    try {
      await setDoc(doc(db, "app_settings", "global"), {
        isPublic: !isAppPublic,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.error("Failed to toggle public state:", err);
      alert("Error toggling website visibility: " + err.message);
    } finally {
      setIsTogglingPublic(false);
    }
  };

  const fetchWhitelistedUsers = async () => {
    try {
      const snap = await getDocs(collection(db, "whitelisted_emails"));
      const loaded: WhitelistedUser[] = [];
      snap.forEach(d => {
        loaded.push(d.data() as WhitelistedUser);
      });
      setUsers(loaded);
    } catch (err) {
      console.error("Failed to fetch whitelisted users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes("@")) return;
    
    setIsAdding(true);
    const email = newEmail.toLowerCase().trim();
    try {
      await setDoc(doc(db, "whitelisted_emails", email), {
        email,
        role: "lo",
        addedAt: serverTimestamp()
      });
      setNewEmail("");
      fetchWhitelistedUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to whitelist email.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveUser = async (email: string) => {
    if (!confirm(`Are you sure you want to revoke access for ${email}?`)) return;
    
    try {
      await deleteDoc(doc(db, "whitelisted_emails", email));
      fetchWhitelistedUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to remove user.");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-[#E8F0FE] text-[#1967D2] rounded-xl">
          <Building className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-[#2D362E]">Branch & Team Management</h2>
          <p className="text-sm text-[#606C5D]">Securely provision access for your loan officers</p>
        </div>
      </div>

      
      <div className="bg-white rounded-2xl border border-[#EAE7E0] p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${isAppPublic ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {isAppPublic ? <Globe className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2D362E] mb-1">Website Visibility</h3>
              <p className="text-sm text-[#606C5D]">
                {isAppPublic 
                  ? "Your website is currently fully PUBLIC. Anyone on the internet can view your main consumer site." 
                  : "Your website is currently locked and PRIVATE. Only authorized users can see it."}
              </p>
            </div>
          </div>
          <button
            onClick={handleTogglePublic}
            disabled={isTogglingPublic}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-colors disabled:opacity-50 flex items-center gap-2 ${
              isAppPublic 
                ? "bg-white border-2 border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            {isTogglingPublic ? "Updating..." : (isAppPublic ? (
              <>
                <Lock className="w-4 h-4" /> Make Private (Lock)
              </>
            ) : (
              <>
                <Globe className="w-4 h-4" /> Make Public (Unlock)
              </>
            ))}
          </button>
        </div>
      </div>
      
      
      <div className="bg-white rounded-2xl border border-[#EAE7E0] p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Fingerprint className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2D362E] mb-1">2-Factor Authentication (2FA)</h3>
              <p className="text-sm text-[#606C5D]">
                Require a second factor (Text Message or Authenticator App) when logging into your admin account.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowMfaModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" /> Setup 2FA
          </button>
        </div>
      </div>
      
      {showMfaModal && <MfaSetupModal onClose={() => setShowMfaModal(false)} />}

      {/* Add New User */}

      <div className="bg-white rounded-2xl border border-[#EAE7E0] p-6 shadow-sm">
        <h3 className="text-sm font-bold text-[#2D362E] mb-4 flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-[#4A5D4E]" />
          Authorize New Employee
        </h3>
        
        <form onSubmit={handleAddUser} className="flex gap-3">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9A9488]" />
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="s.jones@yourbranch.com"
              className="w-full pl-10 pr-4 py-3 bg-[#F8F7F4] border border-[#EAE7E0] rounded-xl text-sm focus:outline-none focus:border-[#4A5D4E]"
            />
          </div>
          <button
            type="submit"
            disabled={isAdding || !newEmail}
            className="px-6 py-3 bg-[#2D362E] hover:bg-[#4A5D4E] text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            {isAdding ? "Authorizing..." : "Send Invite & Whitelist"}
          </button>
        </form>
      </div>

      {/* Whitelisted Users */}
      <div className="bg-white rounded-2xl border border-[#EAE7E0] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#EAE7E0]">
          <h3 className="text-sm font-bold text-[#2D362E] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Authorized Accounts
          </h3>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center text-sm text-[#9A9488]">Loading accounts...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#9A9488]">No standard employees have been whitelisted yet.</div>
        ) : (
          <div className="divide-y divide-[#EAE7E0]">
            {users.map((user) => (
              <div key={user.email} className="flex items-center justify-between p-4 hover:bg-[#F8F7F4] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F5F4F0] flex items-center justify-center border border-[#EAE7E0]">
                    <span className="font-bold text-[#2D362E]">{user.email.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-[#2D362E]">{user.email}</div>
                    <div className="text-xs text-[#606C5D]">Standard Loan Officer Role</div>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveUser(user.email)}
                  className="p-2 text-[#9A9488] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Revoke Access"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-800 leading-relaxed">
          <strong>Zero-Trust Data Isolation is active.</strong> Every authorized Loan Officer receives their own unique secure ID upon their first login. Their Big Purple Dot configurations, Twilio credentials, Meta Ad Settings, and Leads are cryptographically tied to their account. They cannot access other employees' data.
        </p>
      </div>
    </div>
  );
};
