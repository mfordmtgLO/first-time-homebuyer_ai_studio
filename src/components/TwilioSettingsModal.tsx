import React, { useState, useEffect } from "react";
import {
  X, ShieldCheck, Key, Smartphone, CheckCircle2, AlertTriangle, Send, Eye, EyeOff, ExternalLink, Sparkles, Server, Zap
} from "lucide-react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

interface TwilioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveConfig?: (config: TwilioConfig) => void;
}

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
  enableLiveCarrierSms: boolean;
}

const LOCAL_STORAGE_KEY = "manus_twilio_config_v1";

export function getSavedTwilioConfig(): TwilioConfig {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load Twilio config:", e);
  }
  return {
    accountSid: "",
    authToken: "",
    phoneNumber: "",
    enableLiveCarrierSms: false
  };
}

export const TwilioSettingsModal: React.FC<TwilioSettingsModalProps> = ({
  isOpen,
  onClose,
  onSaveConfig
}) => {
  const [config, setConfig] = useState<TwilioConfig>({
    accountSid: "", authToken: "", phoneNumber: "", enableLiveCarrierSms: false
  });
  
  const [showToken, setShowToken] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  
  // Test SMS state
  const [testPhoneNumber, setTestPhoneNumber] = useState<string>("");
  const [testMessageText, setTestMessageText] = useState<string>(
    "Hello from your Oregon Homebuyer CRM! Your Twilio SMS API integration is active and working."
  );
  const [testLoading, setTestLoading] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; sid?: string } | null>(null);

  const [hasEncryptedVault, setHasEncryptedVault] = useState<boolean>(false);
  
  // Try to load encrypted vault on mount
  useEffect(() => {
    if (!isOpen) return;
    
    const loadVault = async () => {
      if (auth.currentUser) {
        try {
          const docRef = doc(db, "twilio_vault", auth.currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.encryptedVault) {
              setHasEncryptedVault(true);
              setConfig(prev => ({
                ...prev,
                enableLiveCarrierSms: data.enableLiveCarrierSms || false,
                accountSid: "••••••••••••••••••••••••••••••••", // mask visually
                authToken: "••••••••••••••••••••••••••••••••••••••", // mask visually
                phoneNumber: "Secure Vault active"
              }));
            }
          }
        } catch (e) {
          console.error("Failed to fetch vault", e);
        }
      }
    };
    
    // Using onAuthStateChanged to ensure auth is ready
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) loadVault();
    });
    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let user = auth.currentUser;
      if (!user) {
        // Log in to create user profile to attach secure vault
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        user = result.user;
      }

      // If user typed entirely new credentials (not the mask dots)
      if (config.accountSid && !config.accountSid.includes("••••")) {
        // 1. Send raw credentials to secure server to encrypt
        const token = await user.getIdToken();
        const encryptRes = await fetch("/api/twilio/vault/encrypt", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            accountSid: config.accountSid,
            authToken: config.authToken,
            phoneNumber: config.phoneNumber
          })
        });
        
        if (!encryptRes.ok) throw new Error("Failed to encrypt credentials on server.");
        const encryptData = await encryptRes.json();
        const encryptedVault = encryptData.encryptedVault;

        // 2. Save encrypted string to Firebase
        await setDoc(doc(db, "twilio_vault", user.uid), {
          encryptedVault,
          enableLiveCarrierSms: config.enableLiveCarrierSms,
          ownerId: user.uid,
          updatedAt: serverTimestamp()
        });

        setHasEncryptedVault(true);
      } else {
        // Just updating the boolean toggle
        await setDoc(doc(db, "twilio_vault", user.uid), {
          enableLiveCarrierSms: config.enableLiveCarrierSms,
          ownerId: user.uid,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      setSaveSuccess(true);
      if (onSaveConfig) {
        onSaveConfig(config);
      }
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error("Save error:", e);
      alert("Failed to securely save Twilio Vault.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestSms = async () => {
    if (!testPhoneNumber.trim()) {
      setTestResult({ success: false, message: "Please enter a recipient phone number for the test." });
      return;
    }

    setTestLoading(true);
    setTestResult(null);

    try {
      let reqBody: any = {
        to: testPhoneNumber,
        message: testMessageText
      };

      if (auth.currentUser) {
        // Attempt to fetch vault and pass cipher string to server
        const docRef = doc(db, "twilio_vault", auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().encryptedVault) {
          reqBody.encryptedVault = docSnap.data().encryptedVault;
        }
      }
      
      // Fallback if they haven't saved to vault but are trying to test raw inputs
      if (!reqBody.encryptedVault) {
        reqBody.accountSid = config.accountSid;
        reqBody.authToken = config.authToken;
        reqBody.fromNumber = config.phoneNumber;
      }

      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
      const res = await fetch("/api/twilio/send-sms", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` })
        },
        body: JSON.stringify(reqBody)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: `Test SMS sent successfully to ${data.to}! Status: ${data.status}`,
          sid: data.messageSid
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || "Failed to dispatch test SMS via Twilio API."
        });
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message || "Network error reaching backend SMS API route."
      });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-[#2D362E] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-inner">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white tracking-tight flex items-center gap-2">
                <span>Enterprise Twilio Vault</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-800 uppercase font-bold">
                  Encrypted At Rest
                </span>
              </h3>
              <p className="text-xs text-stone-300 mt-0.5">
                Configure your Twilio credentials securely. Keys are encrypted and synced across all your devices.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          <div className="bg-white p-4 rounded-2xl border border-[#EAE7E0] shadow-2xs space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-[#2D362E] flex items-center gap-1.5">
                <Server className="w-4 h-4 text-[#4A5D4E]" />
                Secure Vault Status
              </span>
              {hasEncryptedVault ? (
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Database Encryption Active
                </span>
              ) : (
                <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Setup Required
                </span>
              )}
            </div>
            <p className="text-xs text-[#606C5D] leading-relaxed">
              Your API keys will be encrypted on our Node.js server and stored securely in your private database profile. The raw keys are never stored in your browser.
            </p>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EAE7E0] shadow-2xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A5D4E] flex items-center gap-1.5">
              <Key className="w-4 h-4 text-[#C18C5D]" />
              API Key & Phone Configuration
            </h4>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#2D362E]">Twilio Account SID</label>
              <input
                type="text"
                placeholder="ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                value={config.accountSid}
                onChange={(e) => setConfig({ ...config, accountSid: e.target.value.trim() })}
                className="w-full bg-[#FAF9F5] border border-[#EAE7E0] focus:border-[#4A5D4E] rounded-xl px-3.5 py-2.5 text-xs text-[#2D362E] font-mono focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#2D362E]">Twilio Auth Token</label>
              <div className="relative">
                <input
                  type={showToken ? "text" : "password"}
                  placeholder="Your 32-character Auth Token"
                  value={config.authToken}
                  onChange={(e) => setConfig({ ...config, authToken: e.target.value.trim() })}
                  className="w-full bg-[#FAF9F5] border border-[#EAE7E0] focus:border-[#4A5D4E] rounded-xl px-3.5 py-2.5 text-xs text-[#2D362E] font-mono focus:outline-none pr-10"
                />
                <button type="button" onClick={() => setShowToken(!showToken)} className="absolute right-3 top-2.5 text-[#9A9488] hover:text-[#2D362E]">
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#2D362E]">Twilio Phone Number / Service SID</label>
              <input
                type="text"
                placeholder="+15035550199 or MGXXXXXXXXXXXXXXXX"
                value={config.phoneNumber}
                onChange={(e) => setConfig({ ...config, phoneNumber: e.target.value.trim() })}
                className="w-full bg-[#FAF9F5] border border-[#EAE7E0] focus:border-[#4A5D4E] rounded-xl px-3.5 py-2.5 text-xs text-[#2D362E] font-mono focus:outline-none"
              />
            </div>

            <div className="pt-2 border-t border-[#EAE7E0] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#2D362E] block">Enable Live Carrier Dispatch</span>
                <span className="text-[11px] text-[#606C5D] block">When enabled, outbound messages will trigger real Twilio SMS delivery.</span>
              </div>
              <button
                type="button"
                onClick={() => setConfig({ ...config, enableLiveCarrierSms: !config.enableLiveCarrierSms })}
                className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${config.enableLiveCarrierSms ? "bg-emerald-600" : "bg-stone-300"}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${config.enableLiveCarrierSms ? "translate-x-6" : "translate-x-0"}`} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-5 py-2.5 bg-[#4A5D4E] hover:bg-[#38463B] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{isSaving ? "Encrypting & Saving..." : "Save Secure Vault"}</span>
              </button>
              {saveSuccess && (
                <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Saved!
                </span>
              )}
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EAE7E0] shadow-2xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A5D4E] flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-600" /> Live Test SMS Gateway Dispatcher
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Your Cell Number"
                value={testPhoneNumber}
                onChange={(e) => setTestPhoneNumber(e.target.value)}
                className="bg-[#FAF9F5] border border-[#EAE7E0] focus:border-[#4A5D4E] rounded-xl px-3.5 py-2 text-xs text-[#2D362E] focus:outline-none"
              />
              <input
                type="text"
                placeholder="Test Message text..."
                value={testMessageText}
                onChange={(e) => setTestMessageText(e.target.value)}
                className="sm:col-span-2 bg-[#FAF9F5] border border-[#EAE7E0] focus:border-[#4A5D4E] rounded-xl px-3.5 py-2 text-xs text-[#2D362E] focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleSendTestSms}
              disabled={testLoading}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{testLoading ? "Dispatching via Vault..." : "Test Encrypted Payload"}</span>
            </button>
            {testResult && (
              <div className={`p-3 rounded-xl border text-xs space-y-1 ${testResult.success ? "bg-emerald-50 border-emerald-300 text-emerald-900" : "bg-rose-50 border-rose-300 text-rose-900"}`}>
                <div className="font-bold flex items-center gap-1.5">
                  {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
                  <span>{testResult.success ? "SMS Delivered via Twilio!" : "Twilio Dispatch Error"}</span>
                </div>
                <p className="font-mono text-[11px]">{testResult.message}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
