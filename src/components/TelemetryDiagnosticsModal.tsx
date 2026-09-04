import React, { useState, useEffect } from "react";
import { telemetry, Breadcrumb, CapturedErrorEvent } from "../services/telemetryService";
import { X, Bug, RefreshCw, Copy, Check, Trash2, Terminal, AlertTriangle, ShieldCheck, Activity } from "lucide-react";

interface TelemetryDiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TelemetryDiagnosticsModal: React.FC<TelemetryDiagnosticsModalProps> = ({ isOpen, onClose }) => {
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);
  const [errors, setErrors] = useState<CapturedErrorEvent[]>([]);
  const [activeTab, setActiveTab] = useState<"breadcrumbs" | "errors" | "sentry">("breadcrumbs");
  const [copied, setCopied] = useState(false);
  const [sentryDsnInput, setSentryDsnInput] = useState(() => localStorage.getItem("sentry_dsn") || "");
  const [sentrySaved, setSentrySaved] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const update = () => {
      setBreadcrumbs([...telemetry.getRecentBreadcrumbs()]);
      setErrors([...telemetry.getCapturedErrors()]);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyAll = () => {
    const report = JSON.stringify(
      {
        breadcrumbs: telemetry.getRecentBreadcrumbs(),
        errors: telemetry.getCapturedErrors(),
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      },
      null,
      2
    );
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleClear = () => {
    telemetry.clearTelemetry();
    setBreadcrumbs([]);
    setErrors([]);
  };

  const handleSaveSentry = (e: React.FormEvent) => {
    e.preventDefault();
    if (sentryDsnInput.trim()) {
      localStorage.setItem("sentry_dsn", sentryDsnInput.trim());
    } else {
      localStorage.removeItem("sentry_dsn");
    }
    setSentrySaved(true);
    setTimeout(() => {
      setSentrySaved(false);
      window.location.reload();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Bug className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Production Telemetry & Diagnostic Inspector</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Active
                </span>
              </h2>
              <p className="text-xs text-slate-400">Real-time frontend exception monitoring, API telemetry, and breadcrumb trails</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Tabs */}
        <div className="px-6 py-3 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab("breadcrumbs")}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition flex items-center space-x-2 ${
                activeTab === "breadcrumbs"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Breadcrumbs ({breadcrumbs.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("errors")}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition flex items-center space-x-2 ${
                activeTab === "errors"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Captured Errors ({errors.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("sentry")}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition flex items-center space-x-2 ${
                activeTab === "sentry"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Sentry Integration</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyAll}
              className="px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center space-x-1.5 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Export Diagnostic Report"}</span>
            </button>
            <button
              onClick={handleClear}
              className="px-3 py-1.5 text-xs font-medium bg-red-950/30 hover:bg-red-900/40 text-red-300 rounded-lg border border-red-900/50 flex items-center space-x-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Logs</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 font-mono text-xs space-y-3 bg-slate-950">
          {activeTab === "breadcrumbs" && (
            <>
              {breadcrumbs.length === 0 ? (
                <div className="text-center py-16 text-slate-500 font-sans">
                  <Terminal className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">No diagnostic breadcrumbs recorded yet.</p>
                  <p className="text-xs text-slate-600 mt-1">Interact with the app or trigger API requests to record telemetry.</p>
                </div>
              ) : (
                breadcrumbs.map((bc) => (
                  <div
                    key={bc.id}
                    className={`p-3 rounded-xl border transition ${
                      bc.level === "error"
                        ? "bg-red-950/25 border-red-900/50 text-red-300"
                        : bc.level === "warning"
                        ? "bg-amber-950/25 border-amber-900/50 text-amber-300"
                        : "bg-slate-900/60 border-slate-800/80 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-900/50">
                        {bc.category}
                      </span>
                      <span>{new Date(bc.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-sm font-sans font-medium text-slate-100">{bc.message}</div>
                    {bc.data && Object.keys(bc.data).length > 0 && (
                      <pre className="mt-2 p-2 rounded bg-black/40 text-[11px] text-slate-400 overflow-x-auto border border-slate-800/60">
                        {JSON.stringify(bc.data, null, 2)}
                      </pre>
                    )}
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === "errors" && (
            <>
              {errors.length === 0 ? (
                <div className="text-center py-16 text-slate-500 font-sans">
                  <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-emerald-500/40" />
                  <p className="text-sm font-medium text-slate-300">Zero runtime exceptions captured!</p>
                  <p className="text-xs text-slate-500 mt-1">Your frontend and API calls are running cleanly without exceptions.</p>
                </div>
              ) : (
                errors.map((err) => (
                  <div key={err.id} className="p-4 rounded-xl bg-red-950/20 border border-red-900/50 text-red-200 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-red-400">
                      <span className="uppercase font-bold px-2 py-0.5 rounded bg-red-900/40 border border-red-700/40">
                        {err.type}
                      </span>
                      <span>{new Date(err.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-sm font-sans font-bold text-white">{err.message}</div>
                    {err.stack && (
                      <pre className="p-2.5 rounded bg-black/60 text-[11px] text-red-300 overflow-x-auto border border-red-900/30">
                        {err.stack}
                      </pre>
                    )}
                    {err.breadcrumbs && err.breadcrumbs.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-red-900/40 text-[11px] text-slate-400 font-sans">
                        <span className="font-semibold text-slate-300">Attached Breadcrumbs at time of error:</span> {err.breadcrumbs.length} events logged.
                      </div>
                    )}
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === "sentry" && (
            <div className="max-w-xl mx-auto py-8 font-sans space-y-6">
              <div className="bg-purple-950/20 border border-purple-500/30 rounded-2xl p-6 space-y-4">
                <div className="flex items-center space-x-3">
                  <Activity className="w-6 h-6 text-purple-400" />
                  <div>
                    <h3 className="text-base font-bold text-white">Sentry Cloud Reporting Configuration</h3>
                    <p className="text-xs text-slate-400">Connect your Sentry project DSN to stream live error events and performance traces.</p>
                  </div>
                </div>

                <form onSubmit={handleSaveSentry} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Sentry DSN URL</label>
                    <input
                      type="text"
                      value={sentryDsnInput}
                      onChange={(e) => setSentryDsnInput(e.target.value)}
                      placeholder="https://examplePublicKey@o0.ingest.sentry.io/0"
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl text-xs transition shadow-lg shadow-purple-600/20"
                  >
                    Save & Initialize Sentry SDK
                  </button>
                  {sentrySaved && (
                    <p className="text-xs text-emerald-400 text-center font-medium">Sentry DSN saved successfully! Reloading...</p>
                  )}
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Telemetry monitoring active across all routes &amp; `fetch` API calls.</span>
          <span>Enterprise Diagnostics v1.0</span>
        </div>
      </div>
    </div>
  );
};
