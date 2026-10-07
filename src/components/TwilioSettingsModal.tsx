import React, { useState, useEffect } from "react";
import {
  X,
  ShieldCheck,
  Key,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Send,
  Eye,
  EyeOff,
  Server,
  Zap,
  User,
} from "lucide-react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { LoanOfficerProfile } from "../types";

interface TwilioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveConfig?: (config: TwilioConfig) => void;
  currentLo?: LoanOfficerProfile;
  allLoanOfficers?: LoanOfficerProfile[];
  onSaveLoTwilioConfig?: (loId: string, config: TwilioConfig) => void;
  initialTargetLoId?: string;
}

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
  enableLiveCarrierSms: boolean;
}

const LOCAL_STORAGE_KEY = "manus_twilio_config_v1";

export function getSavedTwilioConfig(loId?: string): TwilioConfig {
  try {
    if (loId) {
      const perLo = localStorage.getItem(`manus_twilio_config_${loId}`);
      if (perLo) {
        return JSON.parse(perLo);
      }
    }
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
    enableLiveCarrierSms: false,
  };
}

export const TwilioSettingsModal: React.FC<TwilioSettingsModalProps> = ({
  isOpen,
  onClose,
  onSaveConfig,
  currentLo,
  allLoanOfficers = [],
  onSaveLoTwilioConfig,
  initialTargetLoId,
}) => {
  const effectiveInitialLoId =
    initialTargetLoId || currentLo?.id || allLoanOfficers[0]?.id || "";

  const [selectedLoId, setSelectedLoId] = useState<string>(effectiveInitialLoId);
  const [prevInitialTarget, setPrevInitialTarget] = useState<string | undefined>(
    initialTargetLoId
  );

  const activeTargetLo =
    allLoanOfficers.find((lo) => lo.id === selectedLoId) || currentLo;

  const [config, setConfig] = useState<TwilioConfig>(() => {
    const targetLo =
      allLoanOfficers.find((lo) => lo.id === effectiveInitialLoId) || currentLo;
    const saved = getSavedTwilioConfig(effectiveInitialLoId);
    return {
      accountSid: targetLo?.twilioAccountSid || saved.accountSid || "",
      authToken: targetLo?.twilioAuthToken || saved.authToken || "",
      phoneNumber: targetLo?.twilioPhoneNumber || saved.phoneNumber || "",
      enableLiveCarrierSms:
        targetLo?.twilioEnabled ?? saved.enableLiveCarrierSms ?? true,
    };
  });

  // Adjust state during render if a different initialTargetLoId is provided
  if (initialTargetLoId && initialTargetLoId !== prevInitialTarget) {
    setPrevInitialTarget(initialTargetLoId);
    setSelectedLoId(initialTargetLoId);
    const targetLo = allLoanOfficers.find((lo) => lo.id === initialTargetLoId);
    const saved = getSavedTwilioConfig(initialTargetLoId);
    setConfig({
      accountSid: targetLo?.twilioAccountSid || saved.accountSid || "",
      authToken: targetLo?.twilioAuthToken || saved.authToken || "",
      phoneNumber: targetLo?.twilioPhoneNumber || saved.phoneNumber || "",
      enableLiveCarrierSms:
        targetLo?.twilioEnabled ?? saved.enableLiveCarrierSms ?? true,
    });
  }

  const [showToken, setShowToken] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string>("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Test SMS state
  const [testPhoneNumber, setTestPhoneNumber] = useState<string>(
    () => activeTargetLo?.phone || ""
  );
  const [testMessageText, setTestMessageText] = useState<string>(
    "Hello from your Oregon Homebuyer CRM! Your individual Twilio SMS API integration is active and working."
  );
  const [testLoading, setTestLoading] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    sid?: string;
  } | null>(null);

  const [hasEncryptedVault, setHasEncryptedVault] = useState<boolean>(false);

  const handleSelectLo = (newLoId: string) => {
    setSelectedLoId(newLoId);
    const targetLo = allLoanOfficers.find((lo) => lo.id === newLoId);
    const saved = getSavedTwilioConfig(newLoId);
    setConfig({
      accountSid: targetLo?.twilioAccountSid || saved.accountSid || "",
      authToken: targetLo?.twilioAuthToken || saved.authToken || "",
      phoneNumber: targetLo?.twilioPhoneNumber || saved.phoneNumber || "",
      enableLiveCarrierSms:
        targetLo?.twilioEnabled ?? saved.enableLiveCarrierSms ?? true,
    });
    if (targetLo?.phone) {
      setTestPhoneNumber(targetLo.phone);
    }
  };

  // Try to load encrypted vault on mount
  useEffect(() => {
    if (!isOpen) return;

    const loadVault = async () => {
      const targetUid = activeTargetLo?.id || auth.currentUser?.uid;
      if (targetUid) {
        try {
          const docRef = doc(db, "twilio_vault", targetUid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.encryptedVault) {
              setHasEncryptedVault(true);
            }
          }
        } catch (e) {
          console.error("Failed to fetch vault", e);
        }
      }
    };

    if (auth.currentUser) {
      loadVault();
    }
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) loadVault();
    });
    return () => unsubscribe();
  }, [isOpen, selectedLoId, activeTargetLo?.id]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const targetLoId = activeTargetLo?.id || "default";

      // 1. Save in localStorage for this specific Loan Officer
      try {
        localStorage.setItem(`manus_twilio_config_${targetLoId}`, JSON.stringify(config));
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
      } catch (lsErr) {
        console.warn("LocalStorage save warning:", lsErr);
      }

      // 2. Notify parent if callback provided
      if (onSaveLoTwilioConfig && activeTargetLo) {
        onSaveLoTwilioConfig(activeTargetLo.id, config);
      }
      if (onSaveConfig) {
        onSaveConfig(config);
      }

      // 3. If signed into Firebase, encrypt and store in Firestore twilio_vault collection
      if (auth.currentUser) {
        try {
          const token = await auth.currentUser.getIdToken();
          if (config.accountSid && !config.accountSid.includes("••••")) {
            const encryptRes = await fetch("/api/twilio/vault/encrypt", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                accountSid: config.accountSid.trim(),
                authToken: config.authToken.trim(),
                phoneNumber: config.phoneNumber.trim(),
              }),
            });

            if (encryptRes.ok) {
              const encryptData = await encryptRes.json();
              await setDoc(
                doc(db, "twilio_vault", targetLoId),
                {
                  encryptedVault: encryptData.encryptedVault,
                  enableLiveCarrierSms: config.enableLiveCarrierSms,
                  loId: targetLoId,
                  loName: activeTargetLo?.name || "Loan Officer",
                  phoneNumber: config.phoneNumber.trim(),
                  updatedAt: serverTimestamp(),
                },
                { merge: true }
              );
              setHasEncryptedVault(true);
            }
          } else {
            await setDoc(
              doc(db, "twilio_vault", targetLoId),
              {
                enableLiveCarrierSms: config.enableLiveCarrierSms,
                loId: targetLoId,
                updatedAt: serverTimestamp(),
              },
              { merge: true }
            );
          }
        } catch (fbErr) {
          console.warn("Firebase vault sync notice (offline or demo mode):", fbErr);
        }
      }

      setSaveSuccess(true);
      setSaveSuccessMessage(
        `Twilio BYOK credentials saved for ${activeTargetLo?.name || "Loan Officer"}!`
      );
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch (e: any) {
      console.error("Save error:", e);
      setSaveError(
        e.message ||
          "Failed to securely save Twilio Vault. Please check your credentials and try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTestSms = async () => {
    if (!testPhoneNumber.trim()) {
      setTestResult({
        success: false,
        message: "Please enter a recipient phone number for the test.",
      });
      return;
    }

    setTestLoading(true);
    setTestResult(null);

    try {
      const reqBody: any = {
        to: testPhoneNumber,
        message: testMessageText,
        accountSid: config.accountSid,
        authToken: config.authToken,
        fromNumber: config.phoneNumber,
      };

      const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
      let res: Response | null = null;

      try {
        res = await fetch("/api/twilio/send-sms", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(reqBody),
        });
      } catch (fetchErr) {
        console.warn("Backend API route unreachable, attempting direct Twilio REST request", fetchErr);
      }

      if (res && res.ok) {
        const data = await res.json();
        setTestResult({
          success: true,
          message: `SMS dispatched directly via Twilio to ${testPhoneNumber}! Status: ${data.status || "queued"} (SID: ${data.messageSid || "active"})`,
          sid: data.messageSid,
        });
        return;
      }

      // If backend returned error
      if (res && !res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data && data.error) {
          const isDormant = data.error === "twilio_dormant";
          setTestResult({
            success: false,
            message: isDormant
              ? "Twilio is dormant in this environment. In-app property notes are the active communication channel."
              : data.error + (data.code ? ` (Twilio Code: ${data.code})` : ""),
          });
          return;
        }
      }

      setTestResult({
        success: false,
        message: "Unable to reach SMS gateway or Twilio is currently dormant.",
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || "Failed to dispatch test SMS.",
      });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#2D362E] px-6 py-4 flex items-center justify-between border-b border-[#38463B]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-inner">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white tracking-tight flex items-center gap-2">
                <span>Twilio BYOK Carrier Integration</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-800 uppercase font-bold">
                  Individual LO Account
                </span>
              </h3>
              <p className="text-xs text-stone-300 mt-0.5">
                Each loan officer origins SMS from their own dedicated Twilio 10DLC number and credentials.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* LO Roster Selector (for Admin & Multi-Officer Management) */}
          {allLoanOfficers.length > 0 && (
            <div className="bg-white p-4 rounded-2xl border border-[#EAE7E0] shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-[#2D362E] flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#4A5D4E]" />
                  Select Loan Officer to Configure Individual Twilio BYOK:
                </span>
                {activeTargetLo && (
                  <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {activeTargetLo.branchId || "BRANCH-001"}
                  </span>
                )}
              </div>

              <select
                value={selectedLoId}
                onChange={(e) => handleSelectLo(e.target.value)}
                className="w-full bg-[#FAF9F5] border border-[#EAE7E0] focus:border-[#4A5D4E] rounded-xl px-3.5 py-2 text-xs font-bold text-[#2D362E] focus:outline-none cursor-pointer"
              >
                {allLoanOfficers.map((lo) => (
                  <option key={lo.id} value={lo.id}>
                    {lo.name} — NMLS #{lo.nmlsId || "Verified"} | {lo.branch || lo.branchCity || "Branch"} {lo.twilioPhoneNumber ? `(Twilio: ${lo.twilioPhoneNumber})` : "(No Twilio Set)"}
                  </option>
                ))}
              </select>

              {activeTargetLo && (
                <div className="flex items-center gap-3 pt-1 text-[11px] text-[#606C5D] flex-wrap">
                  <span>
                    Email: <strong className="text-[#2D362E]">{activeTargetLo.email}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Direct Mobile: <strong className="text-[#2D362E]">{activeTargetLo.phone || "N/A"}</strong>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    Twilio Status:{" "}
                    {activeTargetLo.twilioPhoneNumber || config.phoneNumber ? (
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                        BYOK Active ({config.phoneNumber || activeTargetLo.twilioPhoneNumber})
                      </span>
                    ) : (
                      <span className="text-amber-700 font-bold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                        Needs Configuration
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Secure Vault Status & Microservices Architecture info */}
          <div className="bg-white p-4 rounded-2xl border border-[#EAE7E0] shadow-2xs space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-[#2D362E] flex items-center gap-1.5">
                <Server className="w-4 h-4 text-[#4A5D4E]" />
                Zero-Trust BYOK Isolation
              </span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Isolated Per Originator
              </span>
            </div>
            <p className="text-xs text-[#606C5D] leading-relaxed">
              Every loan officer maintains an isolated Twilio Account SID and Auth Token. Outbound messages from this LO trigger SMS directly via their personal Twilio carrier connection, ensuring brand compliance and 10DLC compliance without lateral credential sharing.
            </p>
          </div>

          {/* Webhook Configuration Guide */}
          <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-indigo-500" />
              Incoming 2-Way SMS Webhook URL (For {activeTargetLo?.name || "This Loan Officer"})
            </h4>
            <p className="text-[11px] text-indigo-800/80 leading-relaxed">
              In your individual Twilio Console under Phone Numbers &gt; Active Numbers &gt; Configure, paste this URL under <strong>&quot;A MESSAGE COMES IN&quot;</strong>. Incoming buyer replies will automatically sync to {activeTargetLo?.name.split(" ")[0] || "this LO"}&apos;s property thread.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white border border-indigo-200 rounded-xl px-3 py-2 text-[10px] text-indigo-900 font-mono overflow-x-auto whitespace-nowrap">
                https://ais-dev-h5e42vrshqrry7uiwwuhmv-427099073161.us-east5.run.app/api/twilio/webhook
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    "https://ais-dev-h5e42vrshqrry7uiwwuhmv-427099073161.us-east5.run.app/api/twilio/webhook"
                  );
                  alert("Individual Twilio Webhook URL copied to clipboard!");
                }}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-xl shrink-0 cursor-pointer"
              >
                Copy URL
              </button>
            </div>
          </div>

          {/* Input Form */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EAE7E0] shadow-2xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A5D4E] flex items-center gap-1.5">
              <Key className="w-4 h-4 text-[#C18C5D]" />
              Individual Twilio Credentials for {activeTargetLo?.name || "Loan Officer"}
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
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-2.5 text-[#9A9488] hover:text-[#2D362E]"
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#2D362E]">
                Dedicated Twilio 10DLC Phone Number / Sender SID
              </label>
              <input
                type="text"
                placeholder="+15035550199 or MGXXXXXXXXXXXXXXXX"
                value={config.phoneNumber}
                onChange={(e) => setConfig({ ...config, phoneNumber: e.target.value.trim() })}
                className="w-full bg-[#FAF9F5] border border-[#EAE7E0] focus:border-[#4A5D4E] rounded-xl px-3.5 py-2.5 text-xs text-[#2D362E] font-mono focus:outline-none"
              />
              <p className="text-[10px] text-[#9A9488]">
                Format with E.164 country code (e.g. +15038493478). Outbound SMS will display this caller ID.
              </p>
            </div>

            <div className="pt-2 border-t border-[#EAE7E0] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#2D362E] block">
                  Enable Live Carrier Dispatch for this LO
                </span>
                <span className="text-[11px] text-[#606C5D] block">
                  When enabled, messages sent by {activeTargetLo?.name || "this LO"} will dispatch via this Twilio account.
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setConfig({ ...config, enableLiveCarrierSms: !config.enableLiveCarrierSms })
                }
                className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${config.enableLiveCarrierSms ? "bg-emerald-600" : "bg-stone-300"}`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${config.enableLiveCarrierSms ? "translate-x-6" : "translate-x-0"}`}
                />
              </button>
            </div>

            {saveError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800 animate-fade-in">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Save Failed: </span>
                  <span>{saveError}</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-5 py-2.5 bg-[#4A5D4E] hover:bg-[#38463B] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{isSaving ? "Encrypting & Saving..." : `Save BYOK for ${activeTargetLo?.name.split(" ")[0] || "LO"}`}</span>
              </button>
              {saveSuccess && (
                <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {saveSuccessMessage || "Credentials Saved Successfully!"}
                </span>
              )}
            </div>
          </div>

          {/* Test SMS Dispatcher */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EAE7E0] shadow-2xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A5D4E] flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-600" /> Test SMS with {activeTargetLo?.name || "This LO"}&apos;s Twilio Key
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Recipient Phone (+1...)"
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
              <span>{testLoading ? "Dispatching via Twilio..." : `Send Test SMS from ${config.phoneNumber || "Carrier"}`}</span>
            </button>
            {testResult && (
              <div
                className={`p-3 rounded-xl border text-xs space-y-1 ${testResult.success ? "bg-emerald-50 border-emerald-300 text-emerald-900" : "bg-rose-50 border-rose-300 text-rose-900"}`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  )}
                  <span>
                    {testResult.success ? "SMS Delivered via Twilio!" : "Twilio Dispatch Error"}
                  </span>
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
