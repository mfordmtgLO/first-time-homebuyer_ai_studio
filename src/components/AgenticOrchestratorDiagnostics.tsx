import React, { useState, useEffect } from 'react';
import { Activity, Brain, Database, ShieldCheck, Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import { SystemSecurityWidget } from './SystemSecurityWidget';

interface DiagnosticStatus {
  success: boolean;
  activeProvider: 'deepseek' | 'gemini' | 'none';
  deepseekActive: boolean;
  geminiActive: boolean;
  consensusFilterActive: boolean;
  ragPipelineActive: boolean;
  statusMessage: string;
}

export function AgenticOrchestratorDiagnostics() {
  const [status, setStatus] = useState<DiagnosticStatus | null>(null);
  const [geoSphereActive, setGeoSphereActive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

    useEffect(() => {
    
    Promise.allSettled([
      fetch('/api/ai/diagnostics').then(res => {
        if (!res.ok) throw new Error("Failed to fetch ai");
        return res.json();
      }),
      fetch('/api/geosphere/classify', { 
         method: 'POST', 
         headers: { 'Content-Type': 'application/json' }, 
         body: JSON.stringify({ lat: 44.0, lng: -121.0, features: [] })
      }).then(res => res.json())
    ]).then(([aiResult, geoResult]) => {
      if (aiResult.status === 'fulfilled') {
        setStatus(aiResult.value);
      } else {
        setError("Failed to fetch diagnostics.");
      }
      
      if (geoResult.status === 'fulfilled') {
        setGeoSphereActive(geoResult.value.success || false);
      } else {
        setGeoSphereActive(false);
      }
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Activity className="w-8 h-8 text-[#C18C5D] animate-spin" />
        <p className="text-[#606C5D] font-semibold">Running Agentic Diagnostics...</p>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-5 h-5" />
          <p className="font-semibold">{error || "Unknown diagnostic error."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#EAE7E0] rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Activity className="w-5 h-5 text-blue-700" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2D362E]">Agentic Orchestrator Status</h2>
            <p className="text-xs text-[#606C5D]">Real-time telemetry for the dual-model AI routing engine.</p>
          </div>
        </div>

        <div className={`mt-6 p-4 rounded-xl border flex items-center justify-between ${
          status.activeProvider !== 'none' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
        }`}>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#606C5D] mb-1">Current Active State</p>
            <p className={`text-lg font-bold ${status.activeProvider !== 'none' ? 'text-emerald-800' : 'text-amber-800'}`}>
              {status.statusMessage}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {status.activeProvider !== 'none' ? (
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            ) : (
              <span className="h-3 w-3 rounded-full bg-amber-500"></span>
            )}
            <span className="text-xs font-bold text-[#606C5D] uppercase">
              {status.activeProvider === 'none' ? 'Fallback Mode' : 'Online'}
            </span>
          </div>
        </div>
      </div>

      {/* Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* DeepSeek Node */}
        <div className="bg-white border border-[#EAE7E0] p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <Brain className={`w-5 h-5 ${status.deepseekActive ? 'text-[#C18C5D]' : 'text-gray-400'}`} />
              <h3 className="font-bold text-[#2D362E]">DeepSeek (Auditor)</h3>
            </div>
            {status.deepseekActive ? (
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded-md">CONNECTED</span>
            ) : (
              <span className="bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-1 rounded-md">INACTIVE</span>
            )}
          </div>
          <p className="text-xs text-[#606C5D] leading-relaxed">
            The Logic & Rule Auditor node. Excels at structured reasoning and multi-step rule trees (e.g., Fannie/Freddie guidelines, DTI constraints).
          </p>
          <div className="mt-4 pt-4 border-t border-[#EAE7E0] flex items-center gap-2">
            <Zap className={`w-4 h-4 ${status.activeProvider === 'deepseek' ? 'text-emerald-600' : 'text-gray-400'}`} />
            <span className="text-[10px] font-semibold text-[#606C5D]">
              {status.activeProvider === 'deepseek' ? 'Currently handling active routing load.' : 'Awaiting routing priority.'}
            </span>
          </div>
        </div>

        {/* Gemini Node */}
        <div className="bg-white border border-[#EAE7E0] p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <SparklesIcon active={status.geminiActive} />
              <h3 className="font-bold text-[#2D362E]">Gemini (Synthesizer)</h3>
            </div>
            {status.geminiActive ? (
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded-md">CONNECTED</span>
            ) : (
              <span className="bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-1 rounded-md">INACTIVE</span>
            )}
          </div>
          <p className="text-xs text-[#606C5D] leading-relaxed">
            The High-Context Synthesizer. Excels at massive context windows, document ingestion, and conversational tone matching.
          </p>
          <div className="mt-4 pt-4 border-t border-[#EAE7E0] flex items-center gap-2">
            <Zap className={`w-4 h-4 ${status.activeProvider === 'gemini' ? 'text-emerald-600' : 'text-gray-400'}`} />
            <span className="text-[10px] font-semibold text-[#606C5D]">
              {status.activeProvider === 'gemini' ? 'Currently handling active routing load.' : 'Awaiting routing priority.'}
            </span>
          </div>
        </div>

        {/* Consensus Filter */}
        <div className="bg-white border border-[#EAE7E0] p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className={`w-5 h-5 ${status.consensusFilterActive ? 'text-blue-600' : 'text-gray-400'}`} />
              <h3 className="font-bold text-[#2D362E]">Consensus Filter</h3>
            </div>
            {status.consensusFilterActive ? (
              <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-1 rounded-md">ACTIVE</span>
            ) : (
              <span className="bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-1 rounded-md">BYPASSED</span>
            )}
          </div>
          <p className="text-xs text-[#606C5D] leading-relaxed">
            Cross-checks DeepSeek reasoning against Gemini synthesis. Defaults to ground-truth RAG vector database if models produce conflicting constraints.
          </p>
          <div className="mt-4 pt-4 border-t border-[#EAE7E0] flex items-center gap-2">
            {status.consensusFilterActive ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
            <span className="text-[10px] font-semibold text-[#606C5D]">
              {status.consensusFilterActive ? 'Dual-model consensus validation is active.' : 'Requires both API keys to activate dual-consensus.'}
            </span>
          </div>
        </div>

        {/* RAG Pipeline */}
        <div className="bg-white border border-[#EAE7E0] p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <Database className={`w-5 h-5 ${status.ragPipelineActive ? 'text-emerald-600' : 'text-gray-400'}`} />
              <h3 className="font-bold text-[#2D362E]">Hybrid RAG Pipeline</h3>
            </div>
            {status.ragPipelineActive ? (
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded-md">ACTIVE</span>
            ) : (
              <span className="bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-1 rounded-md">OFFLINE</span>
            )}
          </div>
          <p className="text-xs text-[#606C5D] leading-relaxed">
            Ingestion, memory, and zero-drift guardrails. Decouples factual underwriting knowledge from LLM weights using Vantage JSON/Cloud storage.
          </p>
          <div className="mt-4 pt-4 border-t border-[#EAE7E0] flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span className="text-[10px] font-semibold text-[#606C5D]">Vector embeddings and cosine similarity initialized.</span>
          </div>
        </div>

        {/* GeoSphere Math Engine */}
        <div className="bg-white border border-[#EAE7E0] p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={geoSphereActive ? 'text-indigo-600' : 'text-gray-400'}><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg>
              </span>
              <h3 className="font-bold text-[#2D362E]">GeoSphere Spatial Engine</h3>
            </div>
            {geoSphereActive ? (
              <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-1 rounded-md">ACTIVE</span>
            ) : (
              <span className="bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-1 rounded-md">OFFLINE</span>
            )}
          </div>
          <p className="text-xs text-[#606C5D] leading-relaxed">
            Ray-casting computational geometry logic. Intersects coordinates against complex LMI, USDA, and FHFA GeoJSON polygons for underwriting.
          </p>
          <div className="mt-4 pt-4 border-t border-[#EAE7E0] flex items-center gap-2">
            {geoSphereActive ? <CheckCircle className="w-4 h-4 text-indigo-600" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
            <span className="text-[10px] font-semibold text-[#606C5D]">Point-in-Polygon spatial math engine initialized.</span>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <SystemSecurityWidget />
      </div>
    </div>
  );
}

function SparklesIcon({ active }: { active: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? "text-[#C18C5D]" : "text-gray-400"}>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
    </svg>
  );
}
