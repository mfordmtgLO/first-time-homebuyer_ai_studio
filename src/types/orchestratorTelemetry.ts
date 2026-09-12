export interface AiTelemetryTask {
  id: string;
  timestamp: string;
  isoTime?: string;
  category:
    | "vantage_brain"
    | "tax_cashflow"
    | "focus_flow"
    | "ground_search"
    | "guidelines_matrix"
    | "workspace_outreach"
    | "geosphere_spatial"
    | "underwriting_audit"
    | "system_probe";
  categoryLabel: string;
  title: string;
  endpoint: string;
  geminiModel: string;
  geminiRoleDescription: string;
  deepseekModel: string;
  deepseekRoleDescription: string;
  consensusVerdict:
    | "CONSENSUS_VERIFIED"
    | "AUDIT_PASSED"
    | "ZERO_HALLUCINATIONS"
    | "SPATIAL_VALIDATED"
    | "PROBE_SUCCESS"
    | "FALLBACK_VERIFIED";
  consensusDetails: string;
  latencyMs: number;
  tokensProcessed: number;
  status: "success" | "warning" | "error";
}

export interface NodeProbeState {
  target: "gemini" | "deepseek" | "geosphere" | "consensus" | "fleet";
  status: "idle" | "probing" | "success" | "error" | "fallback";
  latencyMs?: number;
  stepMessage?: string;
  message?: string;
  lastChecked?: string;
}

export interface OrchestratorMetrics {
  totalTasksExecuted: number;
  consensusAgreementRate: string;
  averageLatencyMs: number;
  activeSynthesizer: string;
  activeAuditor: string;
  consensusStatus: string;
}
