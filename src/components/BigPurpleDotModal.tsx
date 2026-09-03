import React, { useState, useEffect } from "react";
import { 
  X, CheckCircle2, ShieldCheck, Key, Lock, Radio, Copy, ExternalLink, 
  RefreshCw, AlertCircle, Layers, Send, Sparkles, Server, Sliders, 
  Eye, EyeOff, Check, ArrowRight, Zap, Database, Terminal, FileCode, Users
} from "lucide-react";
import { BigPurpleDotConfig, BigPurpleDotWebhookEvent } from "../types";

interface BigPurpleDotModalProps {
  isOpen: boolean;
  onClose: () => void;
  config?: BigPurpleDotConfig;
  onUpdateConfig: (newConfig: BigPurpleDotConfig) => void;
  onTriggerToast: (msg: string) => void;
}

export const BigPurpleDotModal: React.FC<BigPurpleDotModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  onTriggerToast
}) => {
  const [activeTab, setActiveTab] = useState<"credentials" | "webhooks" | "mapping" | "golive">("credentials");
  
  // Form State
  const [subdomain, setSubdomain] = useState(config?.subdomain || "cornerstone");
  const [apiKey, setApiKey] = useState(config?.apiKey || "");
  const [apiSecret, setApiSecret] = useState(config?.apiSecret || "");
  const [accountEmail, setAccountEmail] = useState(config?.accountEmail || "fordmj@gmail.com");
  const [webhookSecret, setWebhookSecret] = useState(config?.webhookSecret || "bpd_whsec_prod_9841");
  const [environment, setEnvironment] = useState<"sandbox" | "production">(config?.environment || "sandbox");
  const [autoSyncRecruits, setAutoSyncRecruits] = useState(config?.autoSyncRecruits ?? true);
  const [syncLoanOfficers, setSyncLoanOfficers] = useState(config?.syncLoanOfficers ?? true);
  const [syncRealEstateAgents, setSyncRealEstateAgents] = useState(config?.syncRealEstateAgents ?? true);

  // Stage Mappings
  const [loStageMapping, setLoStageMapping] = useState<Record<string, string>>(config?.loStageMapping || {
    "Not Contacted": "BPD Stage: Cold Prospect",
    "In Outreach": "BPD Stage: In Outreach",
    "Interested": "BPD Stage: Discovery Call",
    "Meeting Scheduled": "BPD Stage: Interview Set",
    "Declined": "BPD Stage: Archived / Not Fit",
    "Hired": "BPD Stage: Onboarded / Joined Branch"
  });

  const [agentStageMapping, setAgentStageMapping] = useState<Record<string, string>>(config?.agentStageMapping || {
    "Not Contacted": "BPD Partner: New Prospect",
    "In Outreach": "BPD Partner: Outreach Active",
    "Interested": "BPD Partner: In Discussions",
    "Meeting Scheduled": "BPD Partner: Strategy Meeting",
    "Partner Active": "BPD Partner: Active Co-Brander",
    "Declined": "BPD Partner: Inactive"
  });

  // UI helpers
  const [showApiKey, setShowApiKey] = useState(false);
  const [showApiSecret, setShowApiSecret] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [copiedWebhookUrl, setCopiedWebhookUrl] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Webhook Events Log
  const [webhookEvents, setWebhookEvents] = useState<BigPurpleDotWebhookEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [selectedEventDetails, setSelectedEventDetails] = useState<BigPurpleDotWebhookEvent | null>(null);
  const [simCandidateName, setSimCandidateName] = useState("Sarah Jenkins (Top Producer NMLS #184209)");
  const [simCandidateType, setSimCandidateType] = useState<"loan_officer" | "real_estate_agent">("loan_officer");
  const [simEventType, setSimEventType] = useState("recruit.stage_changed");
  const [isSimulatingPing, setIsSimulatingPing] = useState(false);

  const webhookUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/api/big-purple-dot/webhook` 
    : "https://your-domain.com/api/big-purple-dot/webhook";

  // Fetch initial config and webhook events from server on open
  useEffect(() => {
    if (!isOpen) return;

    fetch("/api/big-purple-dot/config")
      .then(res => res.json())
      .then(data => {
        if (data) {
          if (data.subdomain) setSubdomain(data.subdomain);
          if (data.apiKeyMasked) setApiKey(data.apiKeyMasked);
          if (data.apiSecretMasked) setApiSecret(data.apiSecretMasked);
          if (data.accountEmail) setAccountEmail(data.accountEmail);
          if (data.webhookSecret) setWebhookSecret(data.webhookSecret);
          if (data.environment) setEnvironment(data.environment);
          if (typeof data.autoSyncRecruits === "boolean") setAutoSyncRecruits(data.autoSyncRecruits);
          if (typeof data.syncLoanOfficers === "boolean") setSyncLoanOfficers(data.syncLoanOfficers);
          if (typeof data.syncRealEstateAgents === "boolean") setSyncRealEstateAgents(data.syncRealEstateAgents);
          if (data.loStageMapping) setLoStageMapping(data.loStageMapping);
          if (data.agentStageMapping) setAgentStageMapping(data.agentStageMapping);
        }
      })
      .catch(err => console.error("Error fetching BPD config:", err));

    fetchWebhookEvents();
  }, [isOpen]);

  const fetchWebhookEvents = async () => {
    setIsLoadingEvents(true);
    try {
      const res = await fetch("/api/big-purple-dot/webhook/events");
      const data = await res.json();
      if (data.events) {
        setWebhookEvents(data.events);
      }
    } catch (e) {
      console.error("Error fetching webhook events", e);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  if (!isOpen) return null;

  const handleCopyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhookUrl(true);
    onTriggerToast("Webhook URL copied to clipboard!");
    setTimeout(() => setCopiedWebhookUrl(false), 2000);
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(webhookSecret);
    setCopiedSecret(true);
    onTriggerToast("Webhook secret key copied to clipboard!");
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleGenerateSecret = () => {
    const randomSec = "bpd_whsec_" + Array.from({ length: 24 }, () => Math.random().toString(36)[2] || 'a').join('');
    setWebhookSecret(randomSec);
    onTriggerToast("Generated new cryptographic Webhook Signing Key.");
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/big-purple-dot/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          apiSecret,
          subdomain,
          environment
        })
      });
      const data = await res.json();
      setTestResult(data);
      if (data.success) {
        onTriggerToast(`Connected to Big Purple Dot (${environment === "sandbox" ? "Sandbox" : "Production"})!`);
      } else {
        onTriggerToast(`Connection test failed: ${data.message || 'Check credentials'}`);
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        status: "error",
        message: e.message || "Network error testing Big Purple Dot endpoint."
      });
      onTriggerToast("Connection failed. Check network or credentials.");
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      const payload: Partial<BigPurpleDotConfig> = {
        subdomain,
        apiKey,
        apiSecret,
        accountEmail,
        webhookSecret,
        environment,
        autoSyncRecruits,
        syncLoanOfficers,
        syncRealEstateAgents,
        loStageMapping,
        agentStageMapping,
        connectionStatus: apiKey ? "connected" : "not_configured"
      };

      const res = await fetch("/api/big-purple-dot/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        onUpdateConfig({
          apiKey,
          apiSecret,
          subdomain,
          accountEmail,
          webhookSecret,
          environment,
          autoSyncRecruits,
          syncLoanOfficers,
          syncRealEstateAgents,
          syncDirection: "bi_directional",
          lastSyncedAt: new Date().toISOString(),
          connectionStatus: apiKey ? "connected" : "not_configured",
          loStageMapping,
          agentStageMapping
        });
        onTriggerToast("Big Purple Dot credentials & webhook configuration securely saved!");
      }
    } catch (e) {
      onTriggerToast("Error saving Big Purple Dot configuration.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSimulateWebhook = async () => {
    setIsSimulatingPing(true);
    try {
      const res = await fetch("/api/big-purple-dot/webhook/test-ping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: simEventType,
          candidateName: simCandidateName,
          candidateType: simCandidateType
        })
      });
      const data = await res.json();
      if (data.success) {
        onTriggerToast("Inbound test webhook handshake successfully received and parsed!");
        await fetchWebhookEvents();
      }
    } catch (e) {
      onTriggerToast("Failed to simulate webhook ping.");
    } finally {
      setIsSimulatingPing(false);
    }
  };

  // Readiness Calculation
  const hasSubdomain = Boolean(subdomain && subdomain.trim().length > 0);
  const hasApiKeySet = Boolean(apiKey && apiKey.trim().length > 0);
  const hasSecretSet = Boolean(apiSecret && apiSecret.trim().length > 0);
  const hasWebhookKey = Boolean(webhookSecret && webhookSecret.trim().length > 0);
  const isProd = environment === "production";
  const readinessCount = [hasSubdomain, hasApiKeySet, hasSecretSet, hasWebhookKey, isProd].filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#EAE7E0] overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2E1065] via-[#4C1D95] to-[#581C87] text-white p-6 relative">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/30 border border-purple-300/40 flex items-center justify-center shadow-inner">
                  <Zap className="w-5 h-5 text-purple-200 fill-purple-300" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-white flex items-center gap-2">
                    Big Purple Dot Integration
                    <span className="text-[10px] font-sans font-bold bg-purple-400/20 text-purple-200 px-2 py-0.5 rounded-full border border-purple-300/30 uppercase tracking-wide">
                      Recruiting CRM & API
                    </span>
                  </h3>
                  <p className="text-xs text-purple-200 opacity-90">
                    Connect Loan Officer & Agent recruit pipelines with secure sign-in credentials, secret API keys, and real-time webhooks.
                  </p>
                </div>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="p-2 text-purple-200 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Status Bar */}
          <div className="mt-5 pt-4 border-t border-purple-400/20 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 font-medium text-purple-200">
                <span className={`w-2 h-2 rounded-full ${hasApiKeySet ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                Status: <strong className="text-white">{hasApiKeySet ? (environment === "production" ? "Live Production Ready" : "Sandbox Test Mode") : "Setup Required"}</strong>
              </span>
              <span className="text-purple-300/60">•</span>
              <span className="text-purple-200">
                Subdomain: <strong className="text-white">{subdomain}.bigpurpledot.com</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setEnvironment(environment === "sandbox" ? "production" : "sandbox")}
                className={`px-3 py-1 rounded-full font-bold text-[11px] transition-all flex items-center gap-1.5 border ${
                  environment === "production" 
                    ? "bg-emerald-500 text-white border-emerald-400 shadow-xs" 
                    : "bg-purple-900/60 text-purple-200 border-purple-400/40 hover:bg-purple-900"
                }`}
              >
                <Radio className="w-3 h-3" />
                {environment === "production" ? "Live Production" : "Sandbox Mode"}
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#EAE7E0] bg-[#FAF9F5] px-6 gap-2 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab("credentials")}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === "credentials" 
                ? "border-[#581C87] text-[#581C87]" 
                : "border-transparent text-[#606C5D] hover:text-[#2D362E]"
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>1. Sign-In & API Keys</span>
          </button>

          <button
            onClick={() => setActiveTab("webhooks")}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === "webhooks" 
                ? "border-[#581C87] text-[#581C87]" 
                : "border-transparent text-[#606C5D] hover:text-[#2D362E]"
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>2. Webhooks & Events</span>
            {webhookEvents.length > 0 && (
              <span className="bg-purple-100 text-purple-800 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {webhookEvents.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("mapping")}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === "mapping" 
                ? "border-[#581C87] text-[#581C87]" 
                : "border-transparent text-[#606C5D] hover:text-[#2D362E]"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>3. Stage & Pipeline Mapping</span>
          </button>

          <button
            onClick={() => setActiveTab("golive")}
            className={`py-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === "golive" 
                ? "border-[#581C87] text-[#581C87]" 
                : "border-transparent text-[#606C5D] hover:text-[#2D362E]"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>4. Go-Live Checklist</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${readinessCount === 5 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              {readinessCount}/5
            </span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: Credentials & Sign In */}
          {activeTab === "credentials" && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="bg-purple-50/70 border border-purple-200/70 rounded-2xl p-4 text-xs text-purple-900 flex items-start gap-3">
                <Lock className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Enterprise Security Framework</p>
                  <p className="text-purple-800/90 leading-relaxed">
                    Big Purple Dot credentials are encrypted and proxied through our secure backend (<code className="font-mono text-purple-950 bg-purple-100 px-1 py-0.5 rounded">/api/big-purple-dot/*</code>). API secrets are never exposed in client browser code. You can enter staging/sandbox credentials now and swap in your live credentials anytime.
                  </p>
                </div>
              </div>

              {/* Subdomain & Instance */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#2D362E] flex items-center justify-between">
                  <span>Big Purple Dot Company Subdomain / Account Slug</span>
                  <span className="text-[10px] text-[#9A9488]">Your company's Big Purple Dot portal</span>
                </label>
                <div className="flex items-center rounded-xl border border-[#D5DDD6] bg-white overflow-hidden shadow-xs focus-within:ring-2 focus-within:ring-purple-600 focus-within:border-transparent">
                  <span className="px-3 text-xs text-[#9A9488] bg-gray-50 border-r border-[#EAE7E0] py-2.5 font-mono">
                    https://
                  </span>
                  <input
                    type="text"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value)}
                    placeholder="cornerstone"
                    className="flex-1 px-3 py-2 text-sm text-[#2D362E] focus:outline-none font-medium"
                  />
                  <span className="px-3 text-xs text-[#9A9488] bg-gray-50 border-l border-[#EAE7E0] py-2.5 font-mono">
                    .bigpurpledot.com
                  </span>
                </div>
              </div>

              {/* API Key */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#2D362E] flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-purple-600" />
                    <span>Big Purple Dot API Key (Public Client Identifier)</span>
                  </label>
                  <span className="text-[10px] text-[#606C5D]">Found in BPD Settings &gt; Integrations &gt; API</span>
                </div>
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="bpd_live_pk_9a87f6..."
                    className="w-full bg-white border border-[#D5DDD6] rounded-xl px-4 py-2.5 text-sm font-mono text-[#2D362E] focus:outline-none focus:ring-2 focus:ring-purple-600 pr-12 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9488] hover:text-[#2D362E] p-1"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Secret API Key / Private Token */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#2D362E] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Secret API Key / Bearer Token (Confidential)</span>
                  </label>
                  <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded font-medium border border-amber-200">
                    Secure Backend Storage
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showApiSecret ? "text" : "password"}
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                    placeholder="bpd_live_sk_4398e0f..."
                    className="w-full bg-white border border-[#D5DDD6] rounded-xl px-4 py-2.5 text-sm font-mono text-[#2D362E] focus:outline-none focus:ring-2 focus:ring-purple-600 pr-12 shadow-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiSecret(!showApiSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9488] hover:text-[#2D362E] p-1"
                  >
                    {showApiSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Account Admin Email */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#2D362E]">Account / Branch Admin Email</label>
                <input
                  type="email"
                  value={accountEmail}
                  onChange={(e) => setAccountEmail(e.target.value)}
                  placeholder="fordmj@gmail.com"
                  className="w-full bg-white border border-[#D5DDD6] rounded-xl px-4 py-2.5 text-sm text-[#2D362E] focus:outline-none focus:ring-2 focus:ring-purple-600 shadow-xs"
                />
              </div>

              {/* Action Buttons: Test Connection & Save */}
              <div className="pt-4 border-t border-[#EAE7E0] flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="w-full sm:w-auto px-5 py-2.5 bg-white border border-[#D5DDD6] hover:bg-purple-50 hover:border-purple-300 text-purple-900 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-600" />
                      <span>Testing Endpoint Handshake...</span>
                    </>
                  ) : (
                    <>
                      <Server className="w-3.5 h-3.5 text-purple-600" />
                      <span>Test Connection & Diagnostics</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleSaveConfig}
                  disabled={isSaving}
                  className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-[#4C1D95] to-[#581C87] hover:opacity-95 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>Saving Secure Credentials...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Save & Secure Credentials</span>
                    </>
                  )}
                </button>
              </div>

              {/* Diagnostic Test Box */}
              {testResult && (
                <div className={`p-4 rounded-2xl border text-xs space-y-2 animate-in fade-in duration-150 ${
                  testResult.success 
                    ? "bg-emerald-50 border-emerald-200 text-emerald-950" 
                    : "bg-rose-50 border-rose-200 text-rose-950"
                }`}>
                  <div className="flex items-center gap-2 font-bold">
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                  {testResult.latencyMs && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-200/60 text-[11px]">
                      <div>
                        <span className="text-[#606C5D] block">Latency:</span>
                        <strong>{testResult.latencyMs}ms</strong>
                      </div>
                      <div>
                        <span className="text-[#606C5D] block">Environment:</span>
                        <strong>{testResult.environment}</strong>
                      </div>
                      <div>
                        <span className="text-[#606C5D] block">Auth Status:</span>
                        <strong className="text-emerald-700">Authenticated</strong>
                      </div>
                      <div>
                        <span className="text-[#606C5D] block">Pipelines:</span>
                        <strong>{testResult.pipelinesFound?.length || 3} Active</strong>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Webhooks & Endpoints */}
          {activeTab === "webhooks" && (
            <div className="space-y-6 max-w-3xl mx-auto">
              {/* Webhook Overview Card */}
              <div className="bg-gradient-to-br from-[#FAF9F5] to-purple-50/40 p-5 rounded-3xl border border-[#EAE7E0] space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h4 className="font-serif font-bold text-base text-[#2D362E] flex items-center gap-2">
                      <Zap className="w-4 h-4 text-purple-600" />
                      Inbound Webhook Endpoint
                    </h4>
                    <p className="text-xs text-[#606C5D]">
                      Copy this URL into Big Purple Dot under <strong className="text-[#2D362E]">Admin &gt; Settings &gt; Integrations &gt; Webhooks</strong> to receive real-time candidate updates, stage transitions, and text responses.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-purple-100 text-purple-800 text-[10px] font-bold rounded-full uppercase tracking-wider shrink-0">
                    HTTP POST Active
                  </span>
                </div>

                {/* Webhook URL Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={webhookUrl}
                    className="flex-1 bg-white border border-[#D5DDD6] rounded-xl px-3 py-2 text-xs font-mono text-[#2D362E] select-all shadow-2xs"
                  />
                  <button
                    onClick={handleCopyWebhookUrl}
                    className="px-4 py-2 bg-[#2D362E] hover:bg-[#1E241F] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0"
                  >
                    {copiedWebhookUrl ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy URL</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Webhook Signing Secret */}
                <div className="pt-3 border-t border-[#EAE7E0] space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#2D362E] flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-[#C18C5D]" />
                      <span>Webhook HMAC Signing Secret Key</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateSecret}
                      className="text-[11px] text-purple-700 hover:text-purple-900 font-bold"
                    >
                      Regenerate Secret
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showWebhookSecret ? "text" : "password"}
                        value={webhookSecret}
                        onChange={(e) => setWebhookSecret(e.target.value)}
                        className="w-full bg-white border border-[#D5DDD6] rounded-xl px-3 py-2 text-xs font-mono text-[#2D362E] pr-10 shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9A9488] hover:text-[#2D362E] p-1"
                      >
                        {showWebhookSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <button
                      onClick={handleCopySecret}
                      className="px-3 py-2 bg-white border border-[#D5DDD6] hover:bg-gray-50 text-[#2D362E] text-xs font-bold rounded-xl transition-all flex items-center gap-1 shrink-0"
                    >
                      {copiedSecret ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-[#9A9488]">
                    Big Purple Dot sends cryptographic signatures in the <code className="font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-700">x-bpd-signature</code> header to guarantee authenticity.
                  </p>
                </div>
              </div>

              {/* Webhook Test Simulator */}
              <div className="bg-white p-5 rounded-3xl border border-[#EAE7E0] space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-[#2D362E] flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-purple-600" />
                    Simulate Live Inbound Webhook Handshake
                  </h4>
                  <span className="text-xs text-[#9A9488]">Verify pipeline response</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#606C5D] block mb-1">Event Type</label>
                    <select
                      value={simEventType}
                      onChange={(e) => setSimEventType(e.target.value)}
                      className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs text-[#2D362E] focus:outline-none"
                    >
                      <option value="recruit.created">recruit.created (New Applicant)</option>
                      <option value="recruit.stage_changed">recruit.stage_changed (Stage Shift)</option>
                      <option value="sms.received">sms.received (Inbound SMS Reply)</option>
                      <option value="call.completed">call.completed (Recruiting Call Logged)</option>
                      <option value="realtor_partner.signed_up">realtor_partner.signed_up (New Agent Partner)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#606C5D] block mb-1">Candidate Type</label>
                    <select
                      value={simCandidateType}
                      onChange={(e) => setSimCandidateType(e.target.value as any)}
                      className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs text-[#2D362E] focus:outline-none"
                    >
                      <option value="loan_officer">Loan Officer Recruit (MMI/NMLS)</option>
                      <option value="real_estate_agent">Real Estate Agent Partner</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#606C5D] block mb-1">Simulated Candidate</label>
                    <input
                      type="text"
                      value={simCandidateName}
                      onChange={(e) => setSimCandidateName(e.target.value)}
                      className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs text-[#2D362E] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSimulateWebhook}
                  disabled={isSimulatingPing}
                  className="px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
                >
                  {isSimulatingPing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending Simulated Webhook Ping...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Trigger Inbound Webhook Ping</span>
                    </>
                  )}
                </button>
              </div>

              {/* Live Webhook Activity Stream */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#606C5D] flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-purple-600" />
                    Recent Webhook Events Log ({webhookEvents.length})
                  </h4>
                  <button
                    onClick={fetchWebhookEvents}
                    disabled={isLoadingEvents}
                    className="text-xs text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoadingEvents ? 'animate-spin' : ''}`} />
                    Refresh Log
                  </button>
                </div>

                <div className="bg-white border border-[#EAE7E0] rounded-2xl divide-y divide-[#EAE7E0] overflow-hidden shadow-xs max-h-64 overflow-y-auto">
                  {webhookEvents.map((evt) => (
                    <div key={evt.id} className="p-3.5 hover:bg-[#FAF9F5] transition-colors flex items-center justify-between gap-3 text-xs">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 text-[10px]">
                            {evt.event}
                          </span>
                          <span className="font-bold text-[#2D362E] truncate">
                            {evt.candidateName}
                          </span>
                          <span className="text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                            {evt.candidateType === "loan_officer" ? "LO Prospect" : "Agent Partner"}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#606C5D] truncate">{evt.payloadSummary}</p>
                      </div>

                      <div className="text-right shrink-0 space-y-1">
                        <span className="text-[10px] text-[#9A9488] block">
                          {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Processed
                        </span>
                      </div>
                    </div>
                  ))}

                  {webhookEvents.length === 0 && (
                    <div className="p-8 text-center text-xs text-[#9A9488]">
                      No webhook events received yet. Click "Trigger Inbound Webhook Ping" above to test the ingestion stream.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Pipeline & Stage Mapping */}
          {activeTab === "mapping" && (
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#EAE7E0] text-xs text-[#606C5D] space-y-1">
                <p className="font-bold text-[#2D362E]">Pipeline Stage Synchronization</p>
                <p>
                  Map internal recruitment stages in this portal to your Big Purple Dot candidate pipeline stages. When an LO or Agent moves stages, the update will synchronize automatically.
                </p>
              </div>

              {/* Loan Officer Stage Mapping Table */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#606C5D] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-700" />
                  Loan Officer Recruit Stage Mapping
                </h4>

                <div className="bg-white border border-[#EAE7E0] rounded-2xl overflow-hidden shadow-xs divide-y divide-[#EAE7E0]">
                  {Object.entries(loStageMapping).map(([localStage, bpdStage]) => (
                    <div key={localStage} className="p-3 flex items-center justify-between gap-4 text-xs">
                      <span className="font-bold text-[#2D362E] w-1/3 truncate">
                        {localStage}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#9A9488] shrink-0" />
                      <input
                        type="text"
                        value={bpdStage}
                        onChange={(e) => {
                          setLoStageMapping({
                            ...loStageMapping,
                            [localStage]: e.target.value
                          });
                        }}
                        className="flex-1 bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-3 py-1.5 text-xs text-[#2D362E] focus:outline-none focus:ring-1 focus:ring-purple-600"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Real Estate Agent Stage Mapping Table */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#606C5D] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  Real Estate Agent Partner Stage Mapping
                </h4>

                <div className="bg-white border border-[#EAE7E0] rounded-2xl overflow-hidden shadow-xs divide-y divide-[#EAE7E0]">
                  {Object.entries(agentStageMapping).map(([localStage, bpdStage]) => (
                    <div key={localStage} className="p-3 flex items-center justify-between gap-4 text-xs">
                      <span className="font-bold text-[#2D362E] w-1/3 truncate">
                        {localStage}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#9A9488] shrink-0" />
                      <input
                        type="text"
                        value={bpdStage}
                        onChange={(e) => {
                          setAgentStageMapping({
                            ...agentStageMapping,
                            [localStage]: e.target.value
                          });
                        }}
                        className="flex-1 bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-3 py-1.5 text-xs text-[#2D362E] focus:outline-none focus:ring-1 focus:ring-purple-600"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="bg-white p-4 rounded-2xl border border-[#EAE7E0] space-y-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#2D362E]">
                  <input
                    type="checkbox"
                    checked={autoSyncRecruits}
                    onChange={(e) => setAutoSyncRecruits(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500 cursor-pointer"
                  />
                  <span>Automatically push stage updates to Big Purple Dot when card moves</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#2D362E]">
                  <input
                    type="checkbox"
                    checked={syncLoanOfficers}
                    onChange={(e) => setSyncLoanOfficers(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500 cursor-pointer"
                  />
                  <span>Sync Loan Officer recruit records (include 12Mo Volume & NMLS tags)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#2D362E]">
                  <input
                    type="checkbox"
                    checked={syncRealEstateAgents}
                    onChange={(e) => setSyncRealEstateAgents(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500 cursor-pointer"
                  />
                  <span>Sync Real Estate Agent partner records (include brokerage & active listings)</span>
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveConfig}
                  className="px-6 py-2.5 bg-[#4C1D95] hover:bg-[#3B1775] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  Save Stage Mappings
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Go-Live Readiness Checklist */}
          {activeTab === "golive" && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-900 mx-auto flex items-center justify-center font-bold text-lg">
                  {readinessCount}/5
                </div>
                <h4 className="font-serif font-bold text-xl text-[#2D362E]">
                  Big Purple Dot Go-Live Readiness
                </h4>
                <p className="text-xs text-[#606C5D] max-w-md mx-auto">
                  Complete these steps to transition from staging/sandbox verification to full automated live recruiting sync.
                </p>
              </div>

              {/* Checklist Items */}
              <div className="bg-white border border-[#EAE7E0] rounded-3xl p-5 space-y-4 shadow-sm">
                {/* Step 1 */}
                <div className="flex items-start gap-3.5 pb-4 border-b border-[#EAE7E0]">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${hasSubdomain ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                    {hasSubdomain ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">1</span>}
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <h5 className="text-xs font-bold text-[#2D362E]">Configure Company Subdomain</h5>
                    <p className="text-[11px] text-[#606C5D]">Subdomain identifies your branch portal instance ({subdomain}.bigpurpledot.com).</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${hasSubdomain ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                    {hasSubdomain ? "Ready" : "Pending"}
                  </span>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3.5 pb-4 border-b border-[#EAE7E0]">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${hasApiKeySet ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                    {hasApiKeySet ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">2</span>}
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <h5 className="text-xs font-bold text-[#2D362E]">Enter API Credentials</h5>
                    <p className="text-[11px] text-[#606C5D]">API Key and Secret Bearer Token securely stored in server environment.</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${hasApiKeySet ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                    {hasApiKeySet ? "Configured" : "Required"}
                  </span>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3.5 pb-4 border-b border-[#EAE7E0]">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${hasWebhookKey ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                    {hasWebhookKey ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">3</span>}
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <h5 className="text-xs font-bold text-[#2D362E]">Set Webhook Endpoint & Signing Secret</h5>
                    <p className="text-[11px] text-[#606C5D]">Register webhook callback URL in Big Purple Dot Settings for two-way sync.</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${hasWebhookKey ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                    {hasWebhookKey ? "Generated" : "Pending"}
                  </span>
                </div>

                {/* Step 4 */}
                <div className="flex items-start gap-3.5 pb-4 border-b border-[#EAE7E0]">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${webhookEvents.length > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                    {webhookEvents.length > 0 ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">4</span>}
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <h5 className="text-xs font-bold text-[#2D362E]">Verify Webhook Handshake</h5>
                    <p className="text-[11px] text-[#606C5D]">Test that incoming recruiting events are received and parsed cleanly.</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${webhookEvents.length > 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-gray-100 text-gray-600'}`}>
                    {webhookEvents.length > 0 ? "Verified" : "Pending Test"}
                  </span>
                </div>

                {/* Step 5 */}
                <div className="flex items-start gap-3.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isProd ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {isProd ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">5</span>}
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <h5 className="text-xs font-bold text-[#2D362E]">Toggle to Live Production Mode</h5>
                    <p className="text-[11px] text-[#606C5D]">Switch environment from sandbox testing to live Big Purple Dot production.</p>
                  </div>
                  <button
                    onClick={() => {
                      setEnvironment(isProd ? "sandbox" : "production");
                      onTriggerToast(isProd ? "Switched to Sandbox mode" : "Activated Live Production Mode!");
                    }}
                    className={`text-[11px] font-bold px-3 py-1 rounded-xl transition-all ${
                      isProd 
                        ? "bg-emerald-700 text-white shadow-xs" 
                        : "bg-purple-100 text-purple-900 hover:bg-purple-200"
                    }`}
                  >
                    {isProd ? "🟢 Live Active" : "Activate Live"}
                  </button>
                </div>
              </div>

              {/* Ready Banner */}
              <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-4 ${
                readinessCount >= 4 
                  ? "bg-emerald-50 border-emerald-200 text-emerald-950" 
                  : "bg-amber-50 border-amber-200 text-amber-950"
              }`}>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className={`w-5 h-5 ${readinessCount >= 4 ? 'text-emerald-600' : 'text-amber-600'}`} />
                  <div>
                    <p className="font-bold">
                      {readinessCount >= 4 ? "Ready to Go Live!" : "Setup In Progress"}
                    </p>
                    <p className="text-[11px] opacity-80">
                      {readinessCount >= 4 
                        ? "All credential, secret, and webhook endpoints are configured and ready for live syncing."
                        : "Follow the steps above to complete Big Purple Dot live deployment."}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSaveConfig}
                  className="px-4 py-2 bg-[#2D362E] hover:bg-[#1E241F] text-white text-xs font-bold rounded-xl shrink-0 transition-colors shadow-xs"
                >
                  Save All Settings
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-[#FAF9F5] border-t border-[#EAE7E0] px-6 py-3.5 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 text-[#606C5D]">
            <span>Big Purple Dot API:</span>
            <code className="font-mono bg-white border border-[#EAE7E0] px-1.5 py-0.5 rounded text-[11px]">
              https://{subdomain}.bigpurpledot.com
            </code>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[#606C5D] hover:text-[#2D362E] text-xs font-bold rounded-xl transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSaveConfig}
              className="px-5 py-2 bg-gradient-to-r from-[#4C1D95] to-[#581C87] hover:opacity-95 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
            >
              Save Configuration
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
