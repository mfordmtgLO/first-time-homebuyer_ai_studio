import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Brain, Database, ShieldCheck, Zap, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
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
  
  const [checkingGemini, setCheckingGemini] = useState(false);
  const [checkingDeepSeek, setCheckingDeepSeek] = useState(false);
  const [checkingGeoSphere, setCheckingGeoSphere] = useState(false);

  const fetchAiDiagnostics = useCallback(async () => {
    const res = await fetch('/api/ai/diagnostics');
    if (!res.ok) throw new Error("Failed to fetch ai");
    return res.json();
  }, []);

  const fetchGeoSphere = useCallback(async () => {
    const res = await fetch('/api/geosphere/classify', { 
       method: 'POST', 
       headers: { 'Content-Type': 'application/json' }, 
       body: JSON.stringify({ lat: 44.0, lng: -121.0, features: [] })
    });
    return res.json();
  }, []);

  const initialLoad = useCallback(() => {
    setLoading(true);
    Promise.allSettled([
      fetchAiDiagnostics(),
      fetchGeoSphere()
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
  }, [fetchAiDiagnostics, fetchGeoSphere]);

  useEffect(() => {
    initialLoad();
  }, [initialLoad]);

  const handleCheckGemini = async () => {
    setCheckingGemini(true);
    try {
      const data = await fetchAiDiagnostics();
      setStatus(prev => prev ? { ...prev, geminiActive: data.geminiActive, activeProvider: data.activeProvider, consensusFilterActive: data.consensusFilterActive } : data);
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingGemini(false);
    }
  };

  const handleCheckDeepSeek = async () => {
    setCheckingDeepSeek(true);
    try {
      const data = await fetchAiDiagnostics();
      setStatus(prev => prev ? { ...prev, deepseekActive: data.deepseekActive, activeProvider: data.activeProvider, consensusFilterActive: data.consensusFilterActive } : data);
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingDeepSeek(false);
    }
  };

  const handleCheckGeoSphere = async () => {
    setCheckingGeoSphere(true);
    try {
      const data = await fetchGeoSphere();
      setGeoSphereActive(data.success || false);
    } catch (err) {
      console.error(err);
      setGeoSphereActive(false);
    } finally {
      setCheckingGeoSphere(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="animate-spin text-[#C18C5D]">
          <Activity className="w-8 h-8" />
        </div>
        <p className="text-sm font-semibold text-[#606C5D]">Booting Agentic Orchestrator...</p>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-xl flex items-start gap-4">
        <AlertTriangle className="w-6 h-6 text-red-600 mt-1" />
        <div>
          <h3 className="font-bold text-red-800">Orchestrator Offline</h3>
          <p className="text-sm text-red-600 mt-1">{error || "Failed to establish connection to AI router."}</p>
          <button onClick={initialLoad} className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-bold hover:bg-red-200 transition-colors">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Overview */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#EAE7E0]">
        <div className="flex items-center gap-3 mb-2">
          <Activity className="w-6 h-6 text-[#C18C5D]" />
          <h2 className="text-xl font-black tracking-tight text-[#2D362E]">Agentic Orchestrator Status</h2>
        </div>
        <p className="text-sm text-[#606C5D] leading-relaxed mb-4">
          This dashboard provides IT professionals and system administrators with a real-time overview of the underlying AI systems powering the platform. It evaluates the connection status, routing priorities, and functional readiness of the various AI checkpoints and mathematical engines that execute complex tasks behind the scenes. Use the check buttons to ping individual services manually.
        </p>
        <div className="flex items-center justify-between p-4 bg-[#F8F9F7] rounded-xl border border-[#EAE7E0]">
          <div>
            <div className="text-xs font-bold text-[#606C5D] uppercase tracking-wider mb-1">Global System Status</div>
            <div className="text-lg font-bold text-[#2D362E]">{status.statusMessage}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-bold text-emerald-700">Healthy</span>
          </div>
        </div>
      </div>

      {/* Nodes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gemini Node */}
        <div className="bg-white border border-[#EAE7E0] p-6 rounded-2xl shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <SparklesIcon active={status.geminiActive} />
              <h3 className="font-bold text-[#2D362E]">Gemini API (Synthesizer)</h3>
            </div>
            {status.geminiActive ? (
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded-md">CONNECTED</span>
            ) : (
              <span className="bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-1 rounded-md">INACTIVE</span>
            )}
          </div>
          <p className="text-xs text-[#606C5D] leading-relaxed flex-grow">
            The primary generative AI model. Responsible for parsing large documents, generating contextual responses, performing internet ground searches, and handling conversational duties.
          </p>
          <div className="mt-4 pt-4 border-t border-[#EAE7E0] flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Zap className={`w-4 h-4 ${status.activeProvider === 'gemini' ? 'text-emerald-600' : 'text-gray-400'}`} />
              <span className="text-[10px] font-semibold text-[#606C5D]">
                {status.activeProvider === 'gemini' ? 'Currently handling active routing load.' : 'Awaiting routing priority.'}
              </span>
            </div>
            <button onClick={handleCheckGemini} disabled={checkingGemini} className="self-start flex items-center gap-2 px-3 py-1.5 bg-[#F8F9F7] hover:bg-[#EAE7E0] text-[#2D362E] text-xs font-bold rounded-lg transition-colors border border-[#EAE7E0] disabled:opacity-50">
              <RefreshCw className={`w-3 h-3 ${checkingGemini ? 'animate-spin' : ''}`} />
              {checkingGemini ? 'Checking...' : 'Check Status'}
            </button>
          </div>
        </div>

        {/* DeepSeek Node */}
        <div className="bg-white border border-[#EAE7E0] p-6 rounded-2xl shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <Brain className={`w-5 h-5 ${status.deepseekActive ? 'text-[#C18C5D]' : 'text-gray-400'}`} />
              <h3 className="font-bold text-[#2D362E]">DeepSeek API (Auditor)</h3>
            </div>
            {status.deepseekActive ? (
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded-md">CONNECTED</span>
            ) : (
              <span className="bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-1 rounded-md">INACTIVE</span>
            )}
          </div>
          <p className="text-xs text-[#606C5D] leading-relaxed flex-grow">
            The logic, reasoning, and rule auditor node. Used for structured reasoning and multi-step rule evaluation. Automatically falls back to Gemini if the API key is not provided.
          </p>
          <div className="mt-4 pt-4 border-t border-[#EAE7E0] flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Zap className={`w-4 h-4 ${status.activeProvider === 'deepseek' ? 'text-emerald-600' : 'text-gray-400'}`} />
              <span className="text-[10px] font-semibold text-[#606C5D]">
                {status.activeProvider === 'deepseek' ? 'Currently handling active routing load.' : 'Awaiting routing priority.'}
              </span>
            </div>
            <button onClick={handleCheckDeepSeek} disabled={checkingDeepSeek} className="self-start flex items-center gap-2 px-3 py-1.5 bg-[#F8F9F7] hover:bg-[#EAE7E0] text-[#2D362E] text-xs font-bold rounded-lg transition-colors border border-[#EAE7E0] disabled:opacity-50">
              <RefreshCw className={`w-3 h-3 ${checkingDeepSeek ? 'animate-spin' : ''}`} />
              {checkingDeepSeek ? 'Checking...' : 'Check Status'}
            </button>
          </div>
        </div>

        {/* GeoSphere Math Engine */}
        <div className="bg-white border border-[#EAE7E0] p-6 rounded-2xl shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={geoSphereActive ? 'text-indigo-600' : 'text-gray-400'}><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"></polygon><line x1="9" y1="3" x2="9" y2="18"></line><line x1="15" y1="6" x2="15" y2="21"></line></svg>
              </span>
              <h3 className="font-bold text-[#2D362E]">GeoSphere Math Engine</h3>
            </div>
            {geoSphereActive ? (
              <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-1 rounded-md">ACTIVE</span>
            ) : (
              <span className="bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-1 rounded-md">OFFLINE</span>
            )}
          </div>
          <p className="text-xs text-[#606C5D] leading-relaxed flex-grow">
            Custom built geographic ray-casting engine. Evaluates point-in-polygon math for intersecting properties with complex boundaries (e.g. USDA eligible zones, LMI tracts, FHFA limits) instantly on our own servers.
          </p>
          <div className="mt-4 pt-4 border-t border-[#EAE7E0] flex flex-col gap-3">
            <div className="flex items-center gap-2">
              {geoSphereActive ? <CheckCircle className="w-4 h-4 text-indigo-600" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
              <span className="text-[10px] font-semibold text-[#606C5D]">Point-in-Polygon spatial math engine initialized.</span>
            </div>
            <button onClick={handleCheckGeoSphere} disabled={checkingGeoSphere} className="self-start flex items-center gap-2 px-3 py-1.5 bg-[#F8F9F7] hover:bg-[#EAE7E0] text-[#2D362E] text-xs font-bold rounded-lg transition-colors border border-[#EAE7E0] disabled:opacity-50">
              <RefreshCw className={`w-3 h-3 ${checkingGeoSphere ? 'animate-spin' : ''}`} />
              {checkingGeoSphere ? 'Checking...' : 'Check Status'}
            </button>
          </div>
        </div>

        {/* Consensus Filter */}
        <div className="bg-white border border-[#EAE7E0] p-6 rounded-2xl shadow-sm flex flex-col">
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
          <p className="text-xs text-[#606C5D] leading-relaxed flex-grow">
            Cross-checks DeepSeek reasoning against Gemini synthesis to prevent AI hallucinations. Automatically bypasses if only one API key is active.
          </p>
          <div className="mt-4 pt-4 border-t border-[#EAE7E0] flex flex-col justify-end">
            <div className="flex items-center gap-2">
              {status.consensusFilterActive ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
              <span className="text-[10px] font-semibold text-[#606C5D]">
                {status.consensusFilterActive ? 'Dual-model consensus validation is active.' : 'Requires both API keys to activate dual-consensus.'}
              </span>
            </div>
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
