import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, AlertTriangle, Radio } from 'lucide-react';
import { NodeProbeState } from '../../types/orchestratorTelemetry';

interface TacticalCheckButtonProps {
  target: 'gemini' | 'deepseek' | 'geosphere' | 'consensus';
  label?: string;
  onProbe: (target: 'gemini' | 'deepseek' | 'geosphere' | 'consensus') => Promise<{
    success: boolean;
    latencyMs?: number;
    message?: string;
    status?: string;
  }>;
  onSuccess?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function TacticalCheckButton({
  target,
  label = 'Check Status',
  onProbe,
  onSuccess,
  size = 'sm'
}: TacticalCheckButtonProps) {
  const [probeState, setProbeState] = useState<NodeProbeState>({
    target,
    status: 'idle'
  });

  const steps = [
    'Dispatching runtime socket probe...',
    'Probing API endpoint & TLS handshake...',
    'Evaluating model credentials & quota...',
    'Analyzing roundtrip latency metric...'
  ];

  const handleClick = async () => {
    if (probeState.status === 'probing') return;

    setProbeState({
      target,
      status: 'probing',
      stepMessage: steps[0]
    });

    let currentStep = 0;
    // Rapid tactical telemetry cycling
    const stepInterval = setInterval(() => {
      currentStep = (currentStep + 1) % steps.length;
      setProbeState((s) => ({ ...s, stepMessage: steps[currentStep] }));
    }, 180);

    try {
      const result = await onProbe(target);
      clearInterval(stepInterval);

      const isSuccess = result.success;
      const isFallback = result.status === 'fallback' || result.status === 'bypassed_single_key';

      setProbeState({
        target,
        status: isSuccess ? 'success' : isFallback ? 'fallback' : 'error',
        latencyMs: result.latencyMs,
        message: result.message,
        lastChecked: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit'
        })
      });

      if (onSuccess) {
        onSuccess();
      }

      // Keep gratifying finality badge visible for 6 seconds, then remain subtly completed
      setTimeout(() => {
        setProbeState((s) => ({
          ...s,
          status: isSuccess ? 'success' : isFallback ? 'fallback' : 'error'
        }));
      }, 6000);
    } catch (err: any) {
      clearInterval(stepInterval);
      setProbeState({
        target,
        status: 'error',
        message: err.message || 'Probe request failed',
        lastChecked: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit'
        })
      });
    }
  };

  const isProbing = probeState.status === 'probing';
  const isSuccess = probeState.status === 'success';
  const isFallback = probeState.status === 'fallback';
  const isError = probeState.status === 'error';

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        id={`tactical-probe-btn-${target}`}
        onClick={handleClick}
        disabled={isProbing}
        className={`relative group inline-flex items-center justify-center gap-2 font-mono font-bold tracking-tight rounded-xl transition-all duration-200 select-none shadow-sm active:scale-95 disabled:pointer-events-none ${
          size === 'sm' ? 'px-3 py-1.5 text-xs' : size === 'md' ? 'px-4 py-2 text-sm' : 'px-5 py-2.5 text-base'
        } ${
          isProbing
            ? 'bg-amber-500 text-white shadow-amber-200/50 shadow-md ring-2 ring-amber-400/40 animate-pulse cursor-wait'
            : isSuccess
            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-300/40 ring-2 ring-emerald-500/30'
            : isFallback
            ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-200/40 ring-2 ring-amber-500/30'
            : isError
            ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200/40 ring-2 ring-rose-500/30'
            : 'bg-[#2D362E] hover:bg-[#1E251F] text-[#F8F9F7] hover:shadow-md'
        }`}
      >
        {/* Probing animated state */}
        {isProbing && (
          <>
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
            <span>PROBING...</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          </>
        )}

        {/* Green Finality State */}
        {!isProbing && isSuccess && (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-100" />
            <span>CONNECTED {probeState.latencyMs !== undefined ? `(${probeState.latencyMs}ms)` : ''}</span>
          </>
        )}

        {/* Fallback / Single Key State */}
        {!isProbing && isFallback && (
          <>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-200" />
            <span>FALLBACK ACTIVE {probeState.latencyMs !== undefined ? `(${probeState.latencyMs}ms)` : ''}</span>
          </>
        )}

        {/* Red Finality State */}
        {!isProbing && isError && (
          <>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-200" />
            <span>OFFLINE / FAILED</span>
          </>
        )}

        {/* Idle Ready State */}
        {!isProbing && probeState.status === 'idle' && (
          <>
            <Radio className="w-3.5 h-3.5 text-amber-400 group-hover:animate-pulse" />
            <span>{label}</span>
          </>
        )}
      </button>

      {/* Real-time tactical micro-status feedback */}
      {isProbing && probeState.stepMessage && (
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-amber-700 animate-fadeIn">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
          <span className="truncate">{probeState.stepMessage}</span>
        </div>
      )}

      {/* Confirmation text upon finality */}
      {!isProbing && probeState.lastChecked && (
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#606C5D]">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isSuccess ? 'bg-emerald-500' : isFallback ? 'bg-amber-500' : 'bg-rose-500'
            }`}
          />
          <span className="truncate">
            {isSuccess
              ? `Verified online (${probeState.latencyMs}ms) at ${probeState.lastChecked}`
              : isFallback
              ? `Operational via fallback at ${probeState.lastChecked}`
              : `Handshake failed at ${probeState.lastChecked}`}
          </span>
        </div>
      )}
    </div>
  );
}
