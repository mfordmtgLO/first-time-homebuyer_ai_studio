import React, { useState, useEffect } from "react";
import { X, ShieldCheck, Key, Users, CheckCircle2, AlertTriangle, Send, Eye, EyeOff, Server, Database } from "lucide-react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

interface TotalExpertSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TotalExpertSettingsModal: React.FC<TotalExpertSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [config, setConfig] = useState({
    apiKey: "",
    username: "", // Optional context
  });

  const [showKey, setShowKey] = useState<boolean>(false);
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  
  const [hasEncryptedVault, setHasEncryptedVault] = useState<boolean>(false);
  const [testLoading, setTestLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "success" | "error">("idle");

  const loadVaultState = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const docSnap = await getDoc(doc(db, "user_integrations", user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.totalExpertVault) {
            setHasEncryptedVault(true);
          }
        }
      }
    } catch (e) {
      console.error("Failed to load Total Expert vault state:", e);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      Promise.resolve().then(() => {
        if (isMounted) loadVaultState();
      });
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("idle");
    setErrorMessage("");

    try {
      let currentUser = auth.currentUser;
      if (!currentUser) {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        currentUser = result.user;
      }
      
      if (!currentUser) throw new Error("You must be signed in to save enterprise credentials.");

      const idToken = await currentUser.getIdToken();

      const encryptRes = await fetch("/api/integrations/vault/encrypt", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({
          payload: {
            totalExpert: {
              apiKey: config.apiKey,
              username: config.username
            }
          }
        })
      });

      if (!encryptRes.ok) throw new Error("Failed to encrypt credentials on server.");
      const encryptData = await encryptRes.json();

      await setDoc(doc(db, "user_integrations", currentUser.uid), {
        totalExpertVault: encryptData.encryptedVault,
        updatedAt: serverTimestamp()
      }, { merge: true });

      setHasEncryptedVault(true);
      setSaveStatus("success");
      
      setTimeout(() => {
        setSaveStatus("idle");
      }, 3000);

    } catch (err: any) {
      console.error("Save config error:", err);
      setSaveStatus("error");
      setErrorMessage(err.message || "Failed to save configuration");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTestLoading(true);
    setTestStatus("idle");
    setErrorMessage("");

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("You must be logged in.");
      
      const idToken = await user.getIdToken();
      const docSnap = await getDoc(doc(db, "user_integrations", user.uid));
      if (!docSnap.exists() || !docSnap.data().totalExpertVault) {
        throw new Error("No saved Total Expert vault found.");
      }
      
      const res = await fetch("/api/totalexpert/test-connection", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({
          teVault: docSnap.data().totalExpertVault
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to connect.");

      setTestStatus("success");
      setTimeout(() => setTestStatus("idle"), 3000);
      
    } catch (err: any) {
      console.error("Test error:", err);
      setTestStatus("error");
      setErrorMessage(err.message || "Connection test failed.");
    } finally {
      setTestLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#2D362E]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#EAE7E0] shadow-2xl relative animate-in fade-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 p-2 text-[#9A9488] hover:text-[#2D362E] hover:bg-[#F5F4F0] rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
              <Users className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#2D362E]">Total Expert Integration</h2>
              <div className="flex items-center gap-2 mt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-[#606C5D] text-sm font-medium">Marketing OS Sync via BYOK Vault</span>
              </div>
            </div>
          </div>

          <div className="bg-[#F8F7F4] p-5 rounded-2xl border border-[#EAE7E0] flex gap-4 mb-8">
            <div className="p-2 bg-white rounded-xl shadow-sm shrink-0 h-fit">
              <Key className="w-5 h-5 text-[#C18C5D]" />
            </div>
            <div>
              <h3 className="font-bold text-[#2D362E] text-sm mb-1">Encrypted At Rest</h3>
              <p className="text-sm text-[#606C5D] leading-relaxed">
                Configure your Total Expert API Key securely. Keys are encrypted via AES-256 and synced across all your devices. The raw keys are never stored in your browser.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-emerald-900 text-sm">Vault Status</span>
              </div>
              {hasEncryptedVault ? (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Database Encryption Active
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Awaiting Credentials
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#606C5D] ml-1">Total Expert API Key</label>
                <div className="relative">
                  <input 
                    type={showKey ? "text" : "password"}
                    value={config.apiKey}
                    onChange={(e) => setConfig({...config, apiKey: e.target.value})}
                    className="w-full pl-4 pr-10 py-3 bg-white border border-[#EAE7E0] rounded-xl text-sm focus:outline-none focus:border-[#C18C5D] focus:ring-1 focus:ring-[#C18C5D]"
                    placeholder="••••••••••••••••••••••••"
                  />
                  <button 
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#9A9488] hover:text-[#2D362E] transition-colors"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#606C5D] ml-1">Account Username / Email (Optional)</label>
                <input 
                  type="text"
                  value={config.username}
                  onChange={(e) => setConfig({...config, username: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-[#EAE7E0] rounded-xl text-sm focus:outline-none focus:border-[#C18C5D] focus:ring-1 focus:ring-[#C18C5D]"
                  placeholder="admin@yourcompany.com"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 leading-relaxed">{errorMessage}</p>
              </div>
            )}

            <div className="flex items-center gap-3 pt-6 border-t border-[#EAE7E0]">
              <button
                onClick={handleSave}
                disabled={isSaving || !config.apiKey}
                className="flex-1 bg-[#2D362E] hover:bg-[#4A5D4E] text-white px-6 py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <span>Encrypting & Saving...</span>
                ) : saveStatus === "success" ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Vault Secured</span>
                  </>
                ) : (
                  <>
                    <Server className="w-4 h-4" />
                    <span>Save Secure Vault</span>
                  </>
                )}
              </button>

              <button
                onClick={handleTestConnection}
                disabled={testLoading || !hasEncryptedVault}
                className="px-6 py-3.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center min-w-[200px]"
              >
                {testLoading ? (
                  <span>Dispatching...</span>
                ) : testStatus === "success" ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Test Connection
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
