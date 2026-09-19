import React, { useState, useMemo } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Brain,
  Layers,
  RefreshCw,
  Eye
} from 'lucide-react';
import { AiTelemetryTask } from '../../types/orchestratorTelemetry';
import { TaskDetailModal } from './TaskDetailModal';

interface DualRoleAssignmentListProps {
  tasks: AiTelemetryTask[];
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function DualRoleAssignmentList({
  tasks,
  onRefresh,
  isLoading
}: DualRoleAssignmentListProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectedTask, setInspectedTask] = useState<AiTelemetryTask | null>(null);

  const categories = [
    { id: 'all', label: 'All Operations' },
    { id: 'vantage_brain', label: 'Vantage AI Assist' },
    { id: 'tax_cashflow', label: 'Tax & Cash Flow' },
    { id: 'focus_flow', label: 'Daily Focus & Flow' },
    { id: 'ground_search', label: 'Ground Sweeps' },
    { id: 'guidelines_matrix', label: 'Guideline Matrices' },
    { id: 'geosphere_spatial', label: 'GeoMap Raycast' },
    { id: 'workspace_outreach', label: 'Workspace AI' }
  ];

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesCategory =
        selectedCategory === 'all' || task.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        task.title.toLowerCase().includes(q) ||
        task.categoryLabel.toLowerCase().includes(q) ||
        task.geminiRoleDescription.toLowerCase().includes(q) ||
        task.deepseekRoleDescription.toLowerCase().includes(q) ||
        task.geminiModel.toLowerCase().includes(q) ||
        task.deepseekModel.toLowerCase().includes(q) ||
        task.endpoint.toLowerCase().includes(q);

      return matchesCategory && matchesQuery;
    });
  }, [tasks, selectedCategory, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Search & Category Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#F8F9F7] p-3.5 rounded-xl border border-[#EAE7E0]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#606C5D] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks by model, prompt, guideline, 1040, DTI, sweep, or matrix..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-[#EAE7E0] rounded-lg text-[#2D362E] placeholder-[#606C5D] focus:outline-hidden focus:ring-1 focus:ring-[#C18C5D] transition-shadow"
          />
        </div>

        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh Telemetry Stream"
              className="p-1.5 bg-white hover:bg-[#EAE7E0] text-[#2D362E] border border-[#EAE7E0] rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          )}
          <span className="text-[11px] font-mono font-semibold text-[#606C5D] px-2 py-1 bg-white rounded-md border border-[#EAE7E0]">
            {filteredTasks.length} {filteredTasks.length === 1 ? 'Task' : 'Tasks'}
          </span>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`whitespace-nowrap px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-colors border ${
              selectedCategory === cat.id
                ? 'bg-[#2D362E] text-white border-[#2D362E]'
                : 'bg-white hover:bg-[#F8F9F7] text-[#606C5D] border-[#EAE7E0]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Running List Rows */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center bg-[#F8F9F7] rounded-xl border border-[#EAE7E0] space-y-2">
            <Layers className="w-8 h-8 text-[#606C5D] mx-auto opacity-50" />
            <p className="text-xs font-mono text-[#606C5D]">No dual-role assignment logs match this filter.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white border border-[#EAE7E0] rounded-xl p-4 hover:border-[#C18C5D]/50 hover:shadow-xs transition-all space-y-3"
            >
              {/* Top Row: Category, Title, Timestamp, Consensus Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAE7E0] pb-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {task.categoryLabel}
                  </span>
                  <span className="text-xs font-bold text-[#2D362E]">{task.title}</span>
                  <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                    {task.endpoint}
                  </span>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                  <div className="flex items-center gap-1 text-[11px] font-mono text-[#606C5D]">
                    <Clock className="w-3 h-3 text-[#C18C5D]" />
                    <span>{task.timestamp}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {task.consensusVerdict}
                  </span>
                </div>
              </div>

              {/* Middle Row: Dual Role Assignment Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs font-sans">
                {/* Gemini Synthesizer Box */}
                <div className="bg-[#FAFBF9] border border-[#EAE7E0] rounded-lg p-2.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#C18C5D]" />
                      <span className="font-mono text-[11px] font-bold text-[#2D362E]">
                        Gemini Synthesizer
                      </span>
                    </div>
                    <span className="px-1.5 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded font-mono text-[10px] font-bold">
                      {task.geminiModel}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#4A5568] leading-relaxed line-clamp-2">
                    {task.geminiRoleDescription}
                  </p>
                </div>

                {/* DeepSeek Auditor Box */}
                <div className="bg-[#FAFBF9] border border-[#EAE7E0] rounded-lg p-2.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Brain className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="font-mono text-[11px] font-bold text-[#2D362E]">
                        DeepSeek Auditor
                      </span>
                    </div>
                    <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-900 border border-indigo-200 rounded font-mono text-[10px] font-bold">
                      {task.deepseekModel}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#4A5568] leading-relaxed line-clamp-2">
                    {task.deepseekRoleDescription}
                  </p>
                </div>
              </div>

              {/* Bottom Row: Audit Proof Summary & Detail Trigger */}
              <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-[#606C5D]">
                <div className="flex items-center gap-3 truncate pr-2">
                  <span className="truncate text-emerald-800">
                    <span className="font-bold text-[#2D362E]">Consensus Proof:</span> {task.consensusDetails}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-gray-500">{task.latencyMs}ms</span>
                  <button
                    onClick={() => setInspectedTask(task)}
                    className="flex items-center gap-1 px-2 py-1 bg-[#F8F9F7] hover:bg-[#EAE7E0] text-[#2D362E] font-bold text-[10px] rounded border border-[#EAE7E0] transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Inspect</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Task Inspection Modal */}
      {inspectedTask && (
        <TaskDetailModal task={inspectedTask} onClose={() => setInspectedTask(null)} />
      )}
    </div>
  );
}
