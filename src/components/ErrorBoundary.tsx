import React, { Component, ErrorInfo, ReactNode } from "react";
import { telemetry, CapturedErrorEvent } from "../services/telemetryService";
import { AlertTriangle, RefreshCw, Copy, Check, Terminal, ShieldAlert, Bug } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorEvent: CapturedErrorEvent | null;
  copied: boolean;
  showDiagnostics: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorEvent: null,
    copied: false,
    showDiagnostics: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorEvent: null,
      copied: false,
      showDiagnostics: false,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const event = telemetry.captureException(error, "react_error", errorInfo.componentStack || undefined);
    this.setState({ errorEvent: event });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleCopyReport = () => {
    const report = JSON.stringify(
      {
        error: this.state.error?.message,
        stack: this.state.error?.stack,
        breadcrumbs: telemetry.getRecentBreadcrumbs(),
        capturedErrors: telemetry.getCapturedErrors(),
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      },
      null,
      2
    );

    navigator.clipboard.writeText(report);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 3000);
  };

  public render() {
    if (this.state.hasError) {
      const breadcrumbs = telemetry.getRecentBreadcrumbs();
      const errorMsg = this.state.error?.message || "An unexpected runtime error occurred.";

      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
          <div className="max-w-2xl w-full bg-slate-900 border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Application Exception Caught</h1>
                <p className="text-xs text-red-400 font-mono">Telemetry Diagnostic Guard • Enterprise Runtime Protection</p>
              </div>
            </div>

            <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-red-200">Error Description:</p>
                  <p className="text-sm font-mono text-red-300 break-words mt-1">{errorMsg}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <button
                onClick={this.handleReload}
                className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition shadow-lg shadow-blue-600/20"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>
              <button
                onClick={this.handleCopyReport}
                className="flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl border border-slate-700 transition"
              >
                {this.state.copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{this.state.copied ? "Diagnostic Report Copied!" : "Copy Diagnostic Report"}</span>
              </button>
              <button
                onClick={() => this.setState({ showDiagnostics: !this.state.showDiagnostics })}
                className="flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl border border-slate-700 transition ml-auto"
              >
                <Bug className="w-4 h-4 text-purple-400" />
                <span>{this.state.showDiagnostics ? "Hide Breadcrumbs" : "View Breadcrumbs"}</span>
              </button>
            </div>

            {this.state.showDiagnostics && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs max-h-72 overflow-y-auto space-y-2">
                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2 mb-2">
                  <span className="flex items-center space-x-1.5">
                    <Terminal className="w-3.5 h-3.5 text-purple-400" />
                    <span>Real-Time Diagnostic Breadcrumbs ({breadcrumbs.length})</span>
                  </span>
                  <span>Latest First</span>
                </div>
                {breadcrumbs.map((bc) => (
                  <div
                    key={bc.id}
                    className={`p-2 rounded border ${
                      bc.level === "error"
                        ? "bg-red-950/20 border-red-900/40 text-red-300"
                        : bc.level === "warning"
                        ? "bg-amber-950/20 border-amber-900/40 text-amber-300"
                        : "bg-slate-900/60 border-slate-800 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                      <span className="uppercase font-semibold tracking-wider text-purple-400">{bc.category}</span>
                      <span>{new Date(bc.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div>{bc.message}</div>
                    {bc.data && Object.keys(bc.data).length > 0 && (
                      <pre className="text-[10px] text-slate-400 mt-1 overflow-x-auto">
                        {JSON.stringify(bc.data, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
