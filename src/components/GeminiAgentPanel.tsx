import React, { useState } from 'react';
import { Sparkles, Globe, Clock, Send, CheckCircle2, Loader2 } from 'lucide-react';

export const GeminiAgentPanel: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [scheduledJobs, setScheduledJobs] = useState<Array<{ id: string; name: string; cron: string }>>([
    { id: '1', name: 'Daily Mortgage Rate Monitor', cron: '0 8 * * *' },
    { id: '2', name: 'Weekly FHA & VA Guideline Update Check', cron: '0 6 * * 1' }
  ]);

  const handleRunAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/agent/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, enableSearch: true })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 text-slate-100 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-wide">Gemini Homebuyer Agent & Search Grounding</h3>
            <p className="text-xs text-slate-400">Automate mortgage research, rate checks, and scheduled monitoring tasks</p>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-blue-950 text-blue-400 text-[10px] font-mono font-bold rounded-full border border-blue-800">
          Agent SDK Active
        </span>
      </div>

      <form onSubmit={handleRunAgent} className="space-y-3">
        <div>
          <textarea
            rows={3}
            placeholder="Ask agent to research current FHA loan limits, analyze down payment assistance programs, or check live mortgage rates..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 transition shadow-inner"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-2xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Run Agent with Google Search Grounding
        </button>
      </form>

      {result && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3 animate-in fade-in duration-200">
          <h4 className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Agent Response & Grounding Analysis
          </h4>
          <p className="text-xs leading-relaxed text-slate-300 whitespace-pre-wrap">{result.output}</p>
          {result.sources && result.sources.length > 0 && (
            <div className="pt-3 border-t border-slate-800/80 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Globe className="w-3 h-3" /> Grounded Web Sources
              </span>
              <div className="flex flex-wrap gap-1.5">
                {result.sources.map((src: string, idx: number) => (
                  <a key={idx} href={src} target="_blank" rel="noreferrer" className="text-[10px] bg-slate-900 text-blue-400 hover:underline px-2.5 py-1 rounded-lg border border-slate-800 truncate max-w-[280px]">
                    {src}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cron / Scheduled Background Task Section */}
      <div className="pt-4 border-t border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-blue-400" /> Active Automated Cron Jobs (Background Monitoring)
        </h4>
        <div className="space-y-2">
          {scheduledJobs.map(job => (
            <div key={job.id} className="flex items-center justify-between bg-slate-950 px-3.5 py-2.5 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-300 font-medium">{job.name}</span>
              <span className="text-[10px] font-mono bg-blue-950 text-blue-300 px-2 py-0.5 rounded-md border border-blue-900">{job.cron}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
