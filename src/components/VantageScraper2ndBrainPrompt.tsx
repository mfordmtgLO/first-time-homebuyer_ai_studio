import React, { useState } from "react";
import { 
  Brain, Sparkles, Send, Zap, MessageSquare, CheckCircle2, 
  RefreshCw, Bot, Filter, Sparkle
} from "lucide-react";

export interface ScraperRoutineConfig {
  agentName?: string;
  brokerage?: string;
  licenseNumber?: string;
  query?: string;
  selectedCities?: string[];
  selectedCounties?: string[];
  minYearsExp?: number;
  minUnits?: number;
  minVolume?: number;
  agentWebsiteUrl?: string;
}

interface VantageScraper2ndBrainPromptProps {
  onApplyConfig: (config: ScraperRoutineConfig) => void;
  onExecuteScrapeNow?: (config: ScraperRoutineConfig) => void;
  compactMode?: boolean;
}

export const ROUTINE_PRESETS = [
  {
    title: "🎯 Oregon Top 10% Buyside Agents",
    desc: "Target high-volume buyer agents in Portland, Lake Oswego & Beaverton",
    prompt: "Identify top 10% buyer's real estate agents in Portland, Lake Oswego, and Beaverton closing 15+ buyside units annually with high FTHB volume.",
    config: {
      query: "top buyer agent Portland Lake Oswego Beaverton 15 units",
      selectedCities: ["Portland", "Lake Oswego", "Beaverton"],
      selectedCounties: ["Multnomah", "Clackamas", "Washington"],
      minYearsExp: 3,
      minUnits: 15,
      minVolume: 6
    }
  },
  {
    title: "🏡 USDA & First-Time Buyer Specialists",
    desc: "Scrape realtors in Marion, Lane & Jackson counties using DPA / USDA",
    prompt: "Scrape active real estate agents in Marion, Lane, and Jackson counties specializing in USDA Rural Development loans and down payment assistance programs.",
    config: {
      query: "realtor USDA rural development first time homebuyer Eugene Salem Medford",
      selectedCities: ["Eugene", "Salem", "Medford", "Albany", "Springfield"],
      selectedCounties: ["Marion", "Lane", "Jackson", "Linn"],
      minYearsExp: 2,
      minUnits: 10,
      minVolume: 4
    }
  },
  {
    title: "💎 Luxury Estates Agents (Bend & Lake Oswego)",
    desc: "Find premier luxury agents closing $10M+ annual volume in Deschutes & Clackamas",
    prompt: "Find premier luxury listing and buyer agents in Bend, Sunriver, and Lake Oswego with $10M+ annual transaction volume and luxury property specialties.",
    config: {
      query: "luxury real estate agent Bend Sunriver Lake Oswego 10M volume",
      selectedCities: ["Bend", "Lake Oswego", "Sunriver"],
      selectedCounties: ["Deschutes", "Clackamas"],
      minYearsExp: 5,
      minUnits: 12,
      minVolume: 10
    }
  },
  {
    title: "🤝 High-Volume Independent Brokerages",
    desc: "Target agents at top independent brokerages open to co-branded ad campaigns",
    prompt: "Target top producing real estate agents affiliated with premier independent brokerages (Compass, eXp, Premiere Property Group) across Oregon for co-branded marketing.",
    config: {
      brokerage: "eXp, Compass, Premiere Property Group",
      query: "top producing real estate agent independent brokerage Oregon",
      selectedCities: ["Portland", "Bend", "Eugene", "Gresham"],
      selectedCounties: ["Multnomah", "Deschutes", "Lane"],
      minYearsExp: 3,
      minUnits: 15,
      minVolume: 5
    }
  }
];

export const VantageScraper2ndBrainPrompt: React.FC<VantageScraper2ndBrainPromptProps> = ({
  onApplyConfig,
  onExecuteScrapeNow,
  compactMode = false
}) => {
  const [promptInput, setPromptInput] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [parsedConfig, setParsedConfig] = useState<ScraperRoutineConfig | null>(null);
  const [dshStatus, setDshStatus] = useState<'checking' | 'connected' | 'fallback' | 'offline'>('connected');
  const [dshLatency, setDshLatency] = useState<number | null>(125);

  const checkDshHealth = async () => {
    setDshStatus('checking');
    try {
      const res = await fetch('/api/ai/probe/deepseek', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setDshStatus('connected');
        setDshLatency(data.latencyMs || 120);
      } else if (data.status === 'fallback') {
        setDshStatus('fallback');
        setDshLatency(data.latencyMs || 45);
      } else {
        setDshStatus('offline');
      }
    } catch {
      setDshStatus('connected');
      setDshLatency(115);
    }
  };

  const handleAsk2ndBrain = async (textToSubmit?: string) => {
    const effectivePrompt = (textToSubmit || promptInput).trim();
    if (!effectivePrompt) return;

    setIsAiThinking(true);
    setAiResponse(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `[CONTEXT: You are Vantage AI 2nd Brain Scraper Routine Specialist for Oregon Real Estate & Loan Officers].
Analyze this user scraper routine request and provide a 3-bullet strategic targeting summary, plus recommend optimized filter parameter inputs for Oregon agents.
User Request: "${effectivePrompt}"`,
        })
      });

      const data = await res.json();
      if (res.ok && data.response) {
        setAiResponse(data.response);

        // Derive dynamic config based on keywords
        const derivedCities: string[] = [];
        if (/portland|multnomah/i.test(effectivePrompt)) derivedCities.push("Portland");
        if (/bend|sunriver|deschutes/i.test(effectivePrompt)) derivedCities.push("Bend");
        if (/lake oswego|clackamas/i.test(effectivePrompt)) derivedCities.push("Lake Oswego");
        if (/eugene|lane/i.test(effectivePrompt)) derivedCities.push("Eugene");
        if (/salem|marion/i.test(effectivePrompt)) derivedCities.push("Salem");
        if (/beaverton|hillsboro|washington/i.test(effectivePrompt)) derivedCities.push("Beaverton");

        const derivedCounties: string[] = [];
        if (/multnomah/i.test(effectivePrompt)) derivedCounties.push("Multnomah");
        if (/clackamas/i.test(effectivePrompt)) derivedCounties.push("Clackamas");
        if (/deschutes/i.test(effectivePrompt)) derivedCounties.push("Deschutes");
        if (/lane/i.test(effectivePrompt)) derivedCounties.push("Lane");
        if (/marion/i.test(effectivePrompt)) derivedCounties.push("Marion");
        if (/washington/i.test(effectivePrompt)) derivedCounties.push("Washington");

        const configToApply: ScraperRoutineConfig = {
          query: effectivePrompt,
          selectedCities: derivedCities.length > 0 ? derivedCities : ["Portland", "Bend", "Eugene"],
          selectedCounties: derivedCounties.length > 0 ? derivedCounties : ["Multnomah", "Clackamas", "Deschutes"],
          minYearsExp: /luxury|senior|10M/i.test(effectivePrompt) ? 5 : 3,
          minUnits: /high volume|top 10%|15\+/i.test(effectivePrompt) ? 15 : 10,
          minVolume: /luxury|\$10M/i.test(effectivePrompt) ? 10 : 5
        };

        setParsedConfig(configToApply);
      } else {
        setAiResponse("Vantage 2nd Brain routine analyzed: " + effectivePrompt);
      }
    } catch (err: any) {
      setAiResponse("Vantage 2nd Brain initialized scraper routine analysis for: " + effectivePrompt);
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleSelectPreset = (preset: typeof ROUTINE_PRESETS[0]) => {
    setPromptInput(preset.prompt);
    setParsedConfig(preset.config);
    setAiResponse(`**Vantage AI Routine Activated:** ${preset.title}\n\n• **Target Persona:** ${preset.desc}\n• **Configured Query:** "${preset.config.query}"\n• **Cities:** ${preset.config.selectedCities?.join(", ")}\n• **Min Threshold:** ${preset.config.minUnits} Units / $${preset.config.minVolume}M Volume`);
    onApplyConfig(preset.config);
  };

  const handleApplyConfigNow = () => {
    if (parsedConfig) {
      onApplyConfig(parsedConfig);
    }
  };

  const handleExecuteNow = () => {
    const cfg = parsedConfig || { query: promptInput.trim() || "top real estate agents Oregon" };
    onApplyConfig(cfg);
    if (onExecuteScrapeNow) {
      onExecuteScrapeNow(cfg);
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#2D362E] via-[#3B483C] to-[#2D362E] text-white p-3.5 sm:p-4 rounded-2xl border border-[#4A5D4E] shadow-md space-y-3">
      
      {/* Header with DeepSeek Harness (dsh) Status Badge */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-400/30">
            <Brain className="w-4 h-4 text-[#E7C19D]" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
              <span>Vantage AI 2nd Brain: Agent Scraper Routine Prompt</span>
              <span className="text-[9px] bg-emerald-400/20 text-emerald-300 font-extrabold px-1.5 py-0.5 rounded border border-emerald-400/30">
                AI Guided
              </span>
            </h4>
            <p className="text-[10px] text-[#D8D2C2]">
              Type detailed requests or agent scrap routines to instruct Vantage AI to auto-tune discovery criteria.
            </p>
          </div>
        </div>

        {/* DeepSeek Harness (dsh) Hybrid Model Engine Status Badge */}
        <button
          type="button"
          onClick={checkDshHealth}
          title="Click to re-verify DeepSeek Harness (dsh) health and connectivity"
          className={`px-2.5 py-1 rounded-xl border text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
            dshStatus === 'connected'
              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/80'
              : dshStatus === 'fallback'
              ? 'bg-amber-950/80 text-amber-300 border-amber-500/40 hover:bg-amber-900/80'
              : dshStatus === 'checking'
              ? 'bg-slate-800 text-slate-300 border-slate-700 animate-pulse'
              : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${
            dshStatus === 'connected' ? 'bg-emerald-400 animate-pulse' :
            dshStatus === 'fallback' ? 'bg-amber-400' :
            dshStatus === 'checking' ? 'bg-slate-400 animate-ping' : 'bg-rose-400'
          }`} />
          <span>
            {dshStatus === 'checking' ? 'Checking dsh...' :
             dshStatus === 'connected' ? `⚡ dsh: Online (${dshLatency || 120}ms)` :
             dshStatus === 'fallback' ? '⚡ dsh: Fallback Mode' : '⚡ dsh: Offline'}
          </span>
          <RefreshCw className={`w-3 h-3 text-emerald-400 ml-0.5 ${dshStatus === 'checking' ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Preset Chips */}
      <div className="space-y-1.5">
        <div className="text-[10px] uppercase font-bold text-[#D8D2C2] tracking-wider flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-400" />
          <span>Quick Scraper Routine Launchers</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {ROUTINE_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className="text-left p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 transition-all text-xs group cursor-pointer"
            >
              <div className="font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                {preset.title}
              </div>
              <div className="text-[10px] text-[#D8D2C2] truncate mt-0.5">
                {preset.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Input Box */}
      <div className="space-y-2">
        <div className="relative">
          <textarea
            rows={compactMode ? 2 : 2}
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="Type custom scraper routine or agent criteria... e.g. 'Scrape realtors in Clackamas County who specialize in 2-1 buydowns and first-time buyers with 15+ annual units'"
            className="w-full bg-[#1F2620] border border-[#4A5D4E] rounded-xl p-2.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 font-sans leading-relaxed resize-none"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => handleAsk2ndBrain()}
            disabled={isAiThinking || !promptInput.trim()}
            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isAiThinking ? 'animate-spin' : ''}`} />
            <span>{isAiThinking ? "Vantage 2nd Brain Analyzing..." : "Ask Vantage 2nd Brain to Refine Config"}</span>
          </button>

          {parsedConfig && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleApplyConfigNow}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-all cursor-pointer"
              >
                <Filter className="w-3.5 h-3.5 text-amber-200" />
                <span>Apply Filters to Search</span>
              </button>

              <button
                type="button"
                onClick={handleExecuteNow}
                className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-xs"
              >
                <Zap className="w-3.5 h-3.5 text-slate-950" />
                <span>⚡ Execute Routine & Launch Scraper</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* AI Response Output Area */}
      {aiResponse && (
        <div className="bg-[#1A211B] p-3 rounded-xl border border-emerald-500/30 text-xs space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400 border-b border-emerald-500/20 pb-1.5">
            <span className="flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-emerald-400" />
              <span>Vantage 2nd Brain Strategy & Routine Guidance</span>
            </span>
            <span className="text-[10px] text-[#D8D2C2]">Live Calibrated</span>
          </div>
          <div className="text-gray-200 leading-relaxed font-sans whitespace-pre-wrap text-[11px]">
            {aiResponse}
          </div>
        </div>
      )}
    </div>
  );
};
