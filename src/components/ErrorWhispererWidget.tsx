import React, { useState, useEffect } from 'react';
import { Terminal, ShieldAlert, Sparkles, X, CheckCircle, RefreshCw, Code, Bug, AlertCircle } from 'lucide-react';

interface ErrorLogItem {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  source: string;
  message: string;
  stackTrace?: string;
  whisperFix?: string;
}

export function ErrorWhispererWidget() {
  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('show_error_whisperer') === 'true';
    }
    return false;
  });
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLogId, setSelectedLogId] = useState<string | null>("err-1");
  const [fixedLogs, setFixedLogs] = useState<Record<string, boolean>>({});
  const [isApplyingFix, setIsApplyingFix] = useState(false);

  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (typeof window !== 'undefined') {
        const val = localStorage.getItem('show_error_whisperer') === 'true';
        setEnabled(val);
      }
    }, 1000);
    return () => clearInterval(checkInterval);
  }, []);

  if (!enabled) return null;

  const sampleErrors: ErrorLogItem[] = [
    {
      id: "err-1",
      timestamp: new Date(Date.now() - 1000 * 60 * 4).toLocaleTimeString(),
      level: "error",
      source: "BigPurpleDotCRMWebhook.ts",
      message: "REST API timeout (504 Gateway Timeout) when pushing lead contact payload.",
      stackTrace: "Error: Request timeout after 10000ms\n    at syncLeadToBpdCrm (/server/crm/bpd.ts:114:22)\n    at processTicksAndRejections (node:internal/process/task_queues:95:5)",
      whisperFix: "const controller = new AbortController();\nconst timeoutId = setTimeout(() => controller.abort(), 20000);\nconst res = await fetch(url, { signal: controller.signal });"
    },
    {
      id: "err-2",
      timestamp: new Date(Date.now() - 1000 * 60 * 18).toLocaleTimeString(),
      level: "warning",
      source: "LoanOfficerPortal.tsx",
      message: "Unstabilized useEffect dependency detected in lead engagement sorting reducer.",
      stackTrace: "Warning: React Hook useEffect has a missing dependency: 'fetchLeads'.\n    at LoanOfficerPortal (/src/components/LoanOfficerPortal.tsx:412:12)",
      whisperFix: "// Wrap fetchLeads in useCallback or add to dependency array\nconst fetchLeads = useCallback(async () => { ... }, [currentLoId]);"
    },
    {
      id: "err-3",
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toLocaleTimeString(),
      level: "info",
      source: "VaultKms.ts",
      message: "AES-256 envelope rotation executed successfully across 3 secure nodes.",
      stackTrace: "Info: KMS key rotation sequence hash #849f2b completed.\n    at rotateVaultKmsKeys (/server/security/vault.ts:88:14)",
      whisperFix: "// Key rotation operational. No remediation required."
    }
  ];

  const handleApplyFix = (id: string) => {
    setIsApplyingFix(true);
    setTimeout(() => {
      setFixedLogs(prev => ({ ...prev, [id]: true }));
      setIsApplyingFix(false);
    }, 800);
  };

  return (
    <>
      {/* Floating Bottom-Right Trigger Badge */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen ? (
          <button
            onClick={() => setIsOpen(true)}
            className="bg-[#2D362E] hover:bg-[#1A211B] text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 text-xs font-bold transition-all hover:scale-105 cursor-pointer group"
            title="Open AI Error Whisperer & IT Code Fix Tool"
          >
            <div className="relative">
              <Terminal className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            </div>
            <div className="text-left">
              <span className="block text-[10px] text-emerald-300 font-mono">IT SECURITY & LOGS</span>
              <span>AI Error Whisperer</span>
            </div>
            <span className="bg-amber-400 text-amber-950 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-black ml-1">
              2
            </span>
          </button>
        ) : (
          <div className="bg-white dark:bg-[#1A211B] text-[#2D362E] dark:text-white w-96 sm:w-[480px] rounded-3xl shadow-2xl border border-[#EAE7E0] dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
            {/* Header */}
            <div className="bg-[#2D362E] text-white p-4 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider font-mono">AI Error Whisperer & IT Code Fixer</h3>
                  <p className="text-[10px] text-slate-300">Compliance & Security Telemetry Log Monitor</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-4 space-y-4 max-h-[420px] overflow-y-auto text-xs">
              <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 p-2.5 rounded-2xl text-[11px] text-amber-900 dark:text-amber-200">
                <div className="flex items-center gap-2">
                  <Bug className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>2 active exceptions requiring IT review & 1 security audit log.</span>
                </div>
                <span className="font-mono text-[10px] font-bold bg-white dark:bg-slate-900 px-2 py-0.5 rounded shadow-2xs">
                  Zero-Trust
                </span>
              </div>

              {/* Log List */}
              <div className="space-y-2">
                {sampleErrors.map((log) => {
                  const isSelected = selectedLogId === log.id;
                  const isResolved = fixedLogs[log.id];
                  return (
                    <div
                      key={log.id}
                      onClick={() => setSelectedLogId(log.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#4A5D4E] bg-[#FAF9F5] dark:bg-slate-900/90 shadow-sm'
                          : 'border-[#EAE7E0] dark:border-slate-800 hover:bg-stone-50 dark:hover:bg-slate-900/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            log.level === 'error' ? 'bg-rose-500' : log.level === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                          }`} />
                          <span className="font-mono font-bold text-[11px] text-[#2D362E] dark:text-white">{log.source}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isResolved ? (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1 font-mono">
                              <CheckCircle className="w-3 h-3" /> Patched
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono text-gray-500">{log.timestamp}</span>
                          )}
                        </div>
                      </div>
                      <p className="text-[#606C5D] dark:text-slate-300 text-[11px] line-clamp-2">{log.message}</p>
                    </div>
                  );
                })}
              </div>

              {/* Selected Log Inspector & Whisper Fix Tool */}
              {selectedLogId && (() => {
                const activeLog = sampleErrors.find(e => e.id === selectedLogId);
                if (!activeLog) return null;
                const isResolved = fixedLogs[activeLog.id];
                return (
                  <div className="bg-stone-900 text-stone-100 p-3.5 rounded-2xl space-y-2.5 font-mono text-[11px] border border-stone-800 shadow-inner">
                    <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                      <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                        <Code className="w-3.5 h-3.5" /> AI Whisper Fix & Stack Trace
                      </span>
                      <span className="text-[10px] text-stone-400">{activeLog.source}</span>
                    </div>

                    <div className="text-[10px] text-stone-300 bg-stone-950 p-2.5 rounded-xl border border-stone-800 overflow-x-auto whitespace-pre-wrap">
                      {activeLog.stackTrace}
                    </div>

                    {activeLog.whisperFix && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-amber-400 uppercase tracking-wider block font-bold">Suggested AI Code Patch</span>
                        <div className="bg-black text-emerald-300 p-2.5 rounded-xl border border-stone-800 text-[10px] overflow-x-auto whitespace-pre-wrap">
                          {activeLog.whisperFix}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[10px] text-stone-400">
                        {isResolved ? '✓ Fix deployed to sandbox.' : 'Ready to patch via IT Whisperer.'}
                      </span>
                      <button
                        disabled={isResolved || isApplyingFix}
                        onClick={() => handleApplyFix(activeLog.id)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer ${
                          isResolved
                            ? 'bg-emerald-600 text-white cursor-default'
                            : 'bg-amber-500 hover:bg-amber-400 text-amber-950'
                        }`}
                      >
                        {isApplyingFix ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Applying Patch...</span>
                          </>
                        ) : isResolved ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Patch Deployed</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Deploy AI Whisper Fix</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="p-3 bg-stone-50 dark:bg-slate-900 border-t border-[#EAE7E0] dark:border-slate-800 text-center text-[10px] text-gray-500">
              AI Error Whisperer • SEC-256 Compliance & IT Log Telemetry
            </div>
          </div>
        )}
      </div>
    </>
  );
}
