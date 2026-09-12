import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, Copy, Check, Terminal, Layers } from 'lucide-react';
import { AiTelemetryTask } from '../../types/orchestratorTelemetry';

interface TaskDetailModalProps {
  task: AiTelemetryTask | null;
  onClose: () => void;
}

export function TaskDetailModal({ task, onClose }: TaskDetailModalProps) {
  const [copied, setCopied] = useState(false);

  if (!task) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(task, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-[#EAE7E0] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#EAE7E0] bg-[#F8F9F7] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#2D362E] text-white">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {task.categoryLabel}
                </span>
                <span className="text-xs font-mono text-[#606C5D]">{task.timestamp}</span>
              </div>
              <h3 className="font-bold text-[#2D362E] text-base leading-tight mt-0.5">{task.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#606C5D] hover:text-[#2D362E] hover:bg-[#EAE7E0] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Metadata Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#F8F9F7] border border-[#EAE7E0] p-3 rounded-xl">
              <span className="text-[10px] font-mono text-[#606C5D] block uppercase">Endpoint</span>
              <span className="text-xs font-mono font-bold text-[#2D362E] truncate block mt-0.5">
                {task.endpoint}
              </span>
            </div>
            <div className="bg-[#F8F9F7] border border-[#EAE7E0] p-3 rounded-xl">
              <span className="text-[10px] font-mono text-[#606C5D] block uppercase">Execution Latency</span>
              <span className="text-xs font-mono font-bold text-emerald-700 block mt-0.5">
                {task.latencyMs} ms
              </span>
            </div>
            <div className="bg-[#F8F9F7] border border-[#EAE7E0] p-3 rounded-xl">
              <span className="text-[10px] font-mono text-[#606C5D] block uppercase">Tokens Processed</span>
              <span className="text-xs font-mono font-bold text-[#2D362E] block mt-0.5">
                {task.tokensProcessed.toLocaleString()} tokens
              </span>
            </div>
            <div className="bg-[#F8F9F7] border border-[#EAE7E0] p-3 rounded-xl">
              <span className="text-[10px] font-mono text-[#606C5D] block uppercase">Consensus Status</span>
              <span className="text-xs font-mono font-bold text-emerald-700 flex items-center gap-1 block mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {task.consensusVerdict}
              </span>
            </div>
          </div>

          {/* Dual Role Assignment Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-[#2D362E] uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#C18C5D]" />
              Dual-Role Execution Breakdown
            </h4>

            {/* Synthesizer Card */}
            <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-xs font-bold text-emerald-950 uppercase">
                    Primary Generative Synthesizer
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md font-bold">
                  {task.geminiModel}
                </span>
              </div>
              <p className="text-xs text-emerald-900 leading-relaxed font-sans">
                {task.geminiRoleDescription}
              </p>
            </div>

            {/* Auditor Card */}
            <div className="bg-indigo-50/50 border border-indigo-200/80 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span className="font-mono text-xs font-bold text-indigo-950 uppercase">
                    Logic, Guidelines & Math Auditor
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md font-bold">
                  {task.deepseekModel}
                </span>
              </div>
              <p className="text-xs text-indigo-900 leading-relaxed font-sans">
                {task.deepseekRoleDescription}
              </p>
            </div>
          </div>

          {/* Consensus Verification Details */}
          <div className="bg-[#2D362E] text-white p-4 rounded-xl space-y-2 font-mono">
            <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                Dual-Model Consensus Audit Proof
              </span>
              <span className="text-[10px] text-gray-400">UUID: {task.id}</span>
            </div>
            <p className="text-xs text-gray-200 leading-relaxed pt-1 font-mono">
              {task.consensusDetails}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#EAE7E0] bg-[#F8F9F7] flex items-center justify-between">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold text-[#2D362E] bg-white border border-[#EAE7E0] hover:bg-[#EAE7E0] rounded-lg transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Payload Copied!' : 'Copy Telemetry JSON'}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-white bg-[#2D362E] hover:bg-[#1E251F] rounded-lg transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
