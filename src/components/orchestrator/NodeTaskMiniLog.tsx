import React from 'react';
import { AiTelemetryTask } from '../../types/orchestratorTelemetry';

interface NodeTaskMiniLogProps {
  nodeType: 'gemini' | 'deepseek' | 'geosphere';
  tasks: AiTelemetryTask[];
  onInspectTask?: (task: AiTelemetryTask) => void;
}

export function NodeTaskMiniLog({
  nodeType,
  tasks,
  onInspectTask
}: NodeTaskMiniLogProps) {
  // Filter relevant tasks for this node
  const nodeTasks = tasks
    .filter((t) => {
      if (nodeType === 'gemini') return t.geminiModel && t.geminiModel !== 'N/A';
      if (nodeType === 'deepseek') return true; // all audits are recorded
      if (nodeType === 'geosphere') return t.category === 'geosphere_spatial';
      return true;
    })
    .slice(0, 4);

  if (nodeTasks.length === 0) {
    return (
      <div className="p-3 bg-[#F8F9F7] rounded-lg text-center text-xs font-mono text-[#606C5D]">
        No recent executions logged for this node.
      </div>
    );
  }

  return (
    <div className="space-y-2 font-mono">
      <div className="flex items-center justify-between text-[10px] uppercase font-bold text-[#606C5D] border-b border-[#EAE7E0] pb-1">
        <span>Recent Node Executions & Model Logs</span>
        <span>Latency / Time</span>
      </div>

      <div className="space-y-1.5">
        {nodeTasks.map((t) => {
          const modelBadge =
            nodeType === 'gemini'
              ? t.geminiModel
              : nodeType === 'deepseek'
              ? t.deepseekModel
              : 'GeoSphere v2.4';

          const description =
            nodeType === 'gemini'
              ? t.geminiRoleDescription.replace(/^Synthesizer:\s*/i, '')
              : nodeType === 'deepseek'
              ? t.deepseekRoleDescription.replace(/^Auditor:\s*/i, '')
              : t.consensusDetails;

          return (
            <div
              key={`${nodeType}-${t.id}`}
              onClick={() => onInspectTask && onInspectTask(t)}
              className="p-2 rounded-lg bg-[#F8F9F7] hover:bg-[#EAE7E0] border border-[#EAE7E0] transition-colors cursor-pointer text-xs group"
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#2D362E] text-white">
                    {modelBadge}
                  </span>
                  <span className="text-[10px] text-gray-500 truncate">{t.endpoint}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0 text-[10px] text-[#606C5D]">
                  <span className="text-emerald-700 font-bold">{t.latencyMs}ms</span>
                  <span>•</span>
                  <span>{t.timestamp}</span>
                </div>
              </div>

              <p className="text-[11px] text-[#2D362E] font-sans line-clamp-2 leading-relaxed">
                {description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
