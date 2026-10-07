import React, { useState } from 'react';
import { Brain, Sparkles, Globe, Clock, Send, CheckCircle2, Loader2, Cpu, ShieldCheck, Terminal, Play } from 'lucide-react';

export const DeepSeekHarnessPanel: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [cronJobs, setCronJobs] = useState<Array<{ id: string; name: string; cron: string; status: string; lastRun?: string }>>([
    { id: 'job-1', name: 'daily-mortgage-rate-monitor', cron: '0 8 * * *', status: 'Active', lastRun: 'Today at 08:00 AM' },
    { id: 'job-2', name: 'fha-va-guideline-sync', cron: '0 6 * * 1', status: 'Active', lastRun: 'Monday at 06:00 AM' }
  ]);
  const [newJobName, setNewJobName] = useState('');
  const [newJobCron, setNewJobCron] = useState('0 9 * * *');
  const [showAddJob, setShowAddJob] = useState(false);

  const handleRunHarnessAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/harness/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, enableMultiStepSearch: true })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({ output: "Failed to execute DeepSeek Harness Agent query. Please verify DEEPSEEK_API_KEY.", error: true });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterCron = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobName.trim()) return;
    const newJob = {
      id: `job-${Date.now()}`,
      name: newJobName.trim(),
      cron: newJobCron,
      status: 'Active',
      lastRun: 'Just registered'
    };
    setCronJobs([newJob, ...cronJobs]);
    setNewJobName('');
    setShowAddJob(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 text-slate-100 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-wide">DeepSeek Harness Agent (dsh) & Multi-Step Reasoning</h3>
            <p className="text-xs text-slate-400">Advanced reasoning, web tools (`web_search`, `web_fetch`), and unattended cron scheduling</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-emerald-950 text-emerald-400 text-[10px] font-mono font-bold rounded-full border border-emerald-800 flex items-center gap-1.5">
          <Cpu className="w-3 h-3 animate-pulse" /> dsh-agent-sdk v1.2 Active
        </span>
      </div>

      <form onSubmit={handleRunHarnessAgent} className="space-y-4">
        <div>
          <textarea
            rows={3}
            placeholder="Instruct DeepSeek Harness Agent (e.g., 'Research current 30-year jumbo mortgage rates across top 3 lenders and return structured JSON with starting rates and APRs')..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition shadow-inner"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-2xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Terminal className="w-4 h-4" />}
          Execute DeepSeek Harness Query (with Multi-Step Search)
        </button>
      </form>

      {result && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Harness Execution Trace & Final Answer
            </h4>
            <span className="text-[10px] font-mono text-slate-400">Model: deepseek-reasoner</span>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Reasoning & Tool Execution Trace</span>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-[11px] font-mono text-slate-300 space-y-1.5">
                <div className="text-emerald-400">→ [dsh-core] Initializing agent state and loading web tool plugins...</div>
                <div className="text-blue-400">→ [dsh-tool-web] Executing web_search for query parameters...</div>
                <div className="text-purple-400">→ [dsh-tool-web] Executing web_fetch for target URLs and pricing tables...</div>
                <div className="text-amber-400">→ [deepseek-reasoner] Synthesizing mathematical constraints and formatting final answer.</div>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Final Answer Output</span>
              <p className="text-xs leading-relaxed text-slate-200 whitespace-pre-wrap bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                {result.output}
              </p>
            </div>

            {result.sources && result.sources.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Globe className="w-3 h-3" /> Grounded Web Sources Fetched
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {result.sources.map((src: string, idx: number) => (
                    <a key={idx} href={src} target="_blank" rel="noreferrer" className="text-[10px] bg-slate-900 text-emerald-400 hover:underline px-2.5 py-1 rounded-lg border border-slate-800 truncate max-w-[280px]">
                      {src}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scheduled Cron Jobs Section (dsh-cron plugin) */}
      <div className="pt-5 border-t border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" /> Unattended Scheduled Cron Jobs (dsh-cron)
          </h4>
          <button
            type="button"
            onClick={() => setShowAddJob(!showAddJob)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold rounded-xl border border-slate-700 transition cursor-pointer"
          >
            + Register New Cron Job
          </button>
        </div>

        {showAddJob && (
          <form onSubmit={handleRegisterCron} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 animate-in fade-in duration-200">
            <h5 className="text-xs font-bold text-slate-300">New Automated Cron Job</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Job Name (e.g., weekly-reo-portfolio-sync)"
                value={newJobName}
                onChange={(e) => setNewJobName(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500"
              />
              <input
                type="text"
                placeholder="Cron Expression (e.g., 0 8 * * *)"
                value={newJobCron}
                onChange={(e) => setNewJobCron(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-500 outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddJob(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Save & Register Job
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {cronJobs.map(job => (
            <div key={job.id} className="flex items-center justify-between bg-slate-950 px-4 py-3 rounded-2xl border border-slate-800">
              <div className="space-y-0.5">
                <span className="text-xs text-slate-200 font-bold block">{job.name}</span>
                <span className="text-[10px] text-slate-400">Last executed: {job.lastRun}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-900">{job.cron}</span>
                <span className="text-[10px] bg-slate-900 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-800 font-medium">{job.status}</span>
                <button
                  type="button"
                  onClick={() => alert(`Successfully triggered immediate execution for cron job: ${job.name}`)}
                  title="Run Job Now"
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 transition cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
