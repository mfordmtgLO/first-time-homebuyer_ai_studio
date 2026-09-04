import React, { useState, useEffect } from "react";
import { X, ShieldCheck, Key, Cloud, CheckCircle2, AlertTriangle, Send, Eye, EyeOff, Server, Database } from "lucide-react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

interface SalesforceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SalesforceSettingsModal: React.FC<SalesforceSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [config, setConfig] = useState({
    username: "",
    password: "",
    securityToken: "",
    clientId: "",
    clientSecret: "",
    loginUrl: "https://login.salesforce.com"
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showSecret, setShowSecret] = useState<boolean>(false);
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  
  const [hasEncryptedVault, setHasEncryptedVault] = useState<boolean>(false);
  const [testLoading, setTestLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    if (isOpen) {
      loadVaultState();
    }
  }, [isOpen]);

  const loadVaultState = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const docSnap = await getDoc(doc(db, "user_integrations", user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.salesforceVault) {
            setHasEncryptedVault(true);
          }
        }
      }
    } catch (e) {
      console.error("Failed to load Salesforce vault state:", e);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("idle");
    setErrorMessage("");

    try {
      let currentUser = auth.currentUser;
      
      // Prompt for login if they aren't authenticated
      if (!currentUser) {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        currentUser = result.user;
      }
      
      if (!currentUser) {
        throw new Error("You must be signed in to save enterprise credentials.");
      }

      const idToken = await currentUser.getIdToken();

      // 1. Send raw credentials to secure server to encrypt
      const encryptRes = await fetch("/api/integrations/vault/encrypt", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({
          payload: {
            salesforce: {
              username: config.username,
              password: config.password,
              securityToken: config.securityToken,
              clientId: config.clientId,
              clientSecret: config.clientSecret,
              loginUrl: config.loginUrl
            }
          }
        })
      });

      if (!encryptRes.ok) throw new Error("Failed to encrypt credentials on server.");
      const encryptData = await encryptRes.json();
      const encryptedVault = encryptData.encryptedVault;

      // 2. Save encrypted string to Firebase, merging so we don't overwrite Twilio
      await setDoc(doc(db, "user_integrations", currentUser.uid), {
        salesforceVault: encryptedVault,
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
      if (!user) {
        throw new Error("You must be logged in to test the connection.");
      }
      
      const idToken = await user.getIdToken();
      
      const docSnap = await getDoc(doc(db, "user_integrations", user.uid));
      if (!docSnap.exists() || !docSnap.data().salesforceVault) {
        throw new Error("No saved Salesforce vault found. Please save first.");
      }
      
      const reqBody = {
        salesforceVault: docSnap.data().salesforceVault
      };

      const res = await fetch("/api/salesforce/test-connection", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify(reqBody)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to connect to Salesforce.");
      }

      setTestStatus("success");
      
      setTimeout(() => {
        setTestStatus("idle");
      }, 3000);
      
    } catch (err: any) {
      console.error("Test connection error:", err);
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
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <Cloud className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#2D362E]">Salesforce Integration</h2>
              <div className="flex items-center gap-2 mt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-[#606C5D] text-sm font-medium">Enterprise CRM Sync via BYOK Vault</span>
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
                Configure your Salesforce credentials securely. Keys are encrypted via AES-256 and synced across all your devices. The raw keys are never stored in your browser.
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#606C5D] ml-1">Username</label>
                <input 
                  type="text"
                  value={config.username}
                  onChange={(e) => setConfig({...config, username: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-[#EAE7E0] rounded-xl text-sm focus:outline-none focus:border-[#C18C5D] focus:ring-1 focus:ring-[#C18C5D]"
                  placeholder="admin@yourcompany.com"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#606C5D] ml-1">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={config.password}
                    onChange={(e) => setConfig({...config, password: e.target.value})}
                    className="w-full pl-4 pr-10 py-3 bg-white border border-[#EAE7E0] rounded-xl text-sm focus:outline-none focus:border-[#C18C5D] focus:ring-1 focus:ring-[#C18C5D]"
                    placeholder="••••••••••••"
                  />
                  <button 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#9A9488] hover:text-[#2D362E] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-1.5 col-span-2">
                <label className="text-xs font-bold text-[#606C5D] ml-1">Security Token (Optional, if required by IP limits)</label>
                <input 
                  type="text"
                  value={config.securityToken}
                  onChange={(e) => setConfig({...config, securityToken: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-[#EAE7E0] rounded-xl text-sm focus:outline-none focus:border-[#C18C5D] focus:ring-1 focus:ring-[#C18C5D]"
                  placeholder="e.g. 5xX4Y..."
                />
              </div>

              <div className="space-y-1.5 col-span-2 pt-4 border-t border-[#EAE7E0]">
                <label className="text-xs font-bold text-[#606C5D] ml-1">Connected App Client ID</label>
                <input 
                  type="text"
                  value={config.clientId}
                  onChange={(e) => setConfig({...config, clientId: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-[#EAE7E0] rounded-xl text-sm focus:outline-none focus:border-[#C18C5D] focus:ring-1 focus:ring-[#C18C5D]"
                  placeholder="3MVG9..."
                />
              </div>

              <div className="space-y-1.5 col-span-2">
                <label className="text-xs font-bold text-[#606C5D] ml-1">Connected App Client Secret</label>
                <div className="relative">
                  <input 
                    type={showSecret ? "text" : "password"}
                    value={config.clientSecret}
                    onChange={(e) => setConfig({...config, clientSecret: e.target.value})}
                    className="w-full pl-4 pr-10 py-3 bg-white border border-[#EAE7E0] rounded-xl text-sm focus:outline-none focus:border-[#C18C5D] focus:ring-1 focus:ring-[#C18C5D]"
                    placeholder="••••••••••••"
                  />
                  <button 
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#9A9488] hover:text-[#2D362E] transition-colors"
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 col-span-2">
                <label className="text-xs font-bold text-[#606C5D] ml-1">Login URL</label>
                <select 
                  value={config.loginUrl}
                  onChange={(e) => setConfig({...config, loginUrl: e.target.value})}
                  className="w-full px-4 py-3 bg-white border border-[#EAE7E0] rounded-xl text-sm focus:outline-none focus:border-[#C18C5D] focus:ring-1 focus:ring-[#C18C5D]"
                >
                  <option value="https://login.salesforce.com">Production (login.salesforce.com)</option>
                  <option value="https://test.salesforce.com">Sandbox (test.salesforce.com)</option>
                </select>
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
                disabled={isSaving || (!config.username && !config.clientId)}
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
