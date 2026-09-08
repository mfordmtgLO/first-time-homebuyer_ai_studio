import React, { useState, useMemo, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Webhook,
  FileText,
  Lock,
  Search,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  ExternalLink,
  Copy,
  Check,
  PlusCircle,
  RefreshCw,
  X,
  UserCheck,
  FileSpreadsheet
} from "lucide-react";
import {
  CrmAuditLogEntry,
  AuditAssetCategory,
  AuditLogStatus,
  AuditActionType
} from "../types";
import {
  fetchBranchAuditLogs,
  logSensitiveAssetAccess,
  exportAuditLogsToCsv,
  exportAuditLogsToText,
  verifyAuditChainIntegrity,
  ChainVerificationResult,
  GENESIS_AUDIT_HASH
} from "../utils/auditLogger";

interface BranchAuditLogSectionProps {
  currentLoName?: string;
  currentLoEmail?: string;
  userRole?: string;
  onTriggerToast?: (message: string) => void;
}

export const BranchAuditLogSection: React.FC<BranchAuditLogSectionProps> = ({
  currentLoName = "Branch Director",
  currentLoEmail = "fordmj@gmail.com",
  userRole = "branch_manager",
  onTriggerToast,
}) => {
  const [logs, setLogs] = useState<CrmAuditLogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Modal states
  const [inspectingLog, setInspectingLog] = useState<CrmAuditLogEntry | null>(null);
  const [showSimulateModal, setShowSimulateModal] = useState<boolean>(false);
  const [copiedHashId, setCopiedHashId] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<ChainVerificationResult | null>(null);
  const [isVerifyingChain, setIsVerifyingChain] = useState<boolean>(false);

  // Simulation form state
  const [simActorEmail, setSimActorEmail] = useState<string>("alex.ramos@premier.loans");
  const [simActorName, setSimActorName] = useState<string>("Alex Ramos");
  const [simActorRole, setSimActorRole] = useState<"branch_manager" | "senior_lo" | "team_lo" | "processor">("team_lo");
  const [simAssetCategory, setSimAssetCategory] = useState<AuditAssetCategory>("api_keys");
  const [simAssetChoice, setSimAssetChoice] = useState<string>("twilio_vault");
  const [simActionChoice, setSimActionChoice] = useState<string>("view_secret");
  const [simOutcome, setSimOutcome] = useState<"auto" | "granted" | "blocked">("auto");
  const [simSubmitting, setSimSubmitting] = useState<boolean>(false);

  const toast = (msg: string) => {
    if (onTriggerToast) onTriggerToast(msg);
  };

  // Load audit logs on mount
  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchBranchAuditLogs();
      setLogs(data);
    } catch (e) {
      console.error("Error loading audit logs", e);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort logs
  const filteredLogs = useMemo(() => {
    return logs
      .filter((item) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchSearch =
            item.actorEmail.toLowerCase().includes(q) ||
            item.actorName.toLowerCase().includes(q) ||
            item.assetName.toLowerCase().includes(q) ||
            item.actionLabel.toLowerCase().includes(q) ||
            item.details.toLowerCase().includes(q) ||
            item.ipAddress.toLowerCase().includes(q) ||
            item.integrityHash.toLowerCase().includes(q);
          if (!matchSearch) return false;
        }

        // Category filter
        if (selectedCategory !== "all" && item.assetCategory !== selectedCategory) {
          return false;
        }

        // Role filter
        if (selectedRole !== "all" && item.actorRole !== selectedRole) {
          return false;
        }

        // Status filter
        if (selectedStatus !== "all" && item.status !== selectedStatus) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return sortOrder === "desc" ? timeB - timeA : timeA - timeB;
      });
  }, [logs, searchQuery, selectedCategory, selectedRole, selectedStatus, sortOrder]);

  // Aggregate stats
  const metrics = useMemo(() => {
    const total = logs.length;
    const apiKeys = logs.filter((l) => l.assetCategory === "api_keys").length;
    const webhooks = logs.filter((l) => l.assetCategory === "webhooks").length;
    const customerPii = logs.filter((l) => l.assetCategory === "customer_pii").length;
    const blockedViolations = logs.filter((l) => l.status === "blocked").length;
    return { total, apiKeys, webhooks, customerPii, blockedViolations };
  }, [logs]);

  // Verify SHA-256 Hash Chain Integrity
  const handleVerifyChain = async () => {
    setIsVerifyingChain(true);
    try {
      const res = await verifyAuditChainIntegrity(logs);
      setVerificationResult(res);
      if (res.isValid) {
        toast(`Cryptographic verification passed: All ${res.verifiedCount} audit records linked to Genesis block.`);
      } else {
        toast(`Tamper warning: Hash chain broken at record ${res.brokenLogId}`);
      }
    } catch (err) {
      console.error("Chain verification error:", err);
    } finally {
      setIsVerifyingChain(false);
    }
  };

  // Copy hash to clipboard
  const handleCopyHash = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHashId(id);
    setTimeout(() => setCopiedHashId(null), 2000);
    toast(`Copied SHA-256 hash ${hash.substring(0, 10)}... to clipboard`);
  };

  // Handle simulation submit
  const handleSimulateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimSubmitting(true);

    try {
      let finalStatus: AuditLogStatus = "granted";
      let finalSeverity: "low" | "medium" | "high" | "critical" = "medium";
      let policyRule = "";
      let details = "";
      let assetName = "";
      let actionType: AuditActionType = "view_secret";
      let actionLabel = "";

      // Logic for simulated event resolution
      if (simAssetChoice === "twilio_vault") {
        assetName = "Twilio Live Carrier SMS Vault";
        if (simActorRole === "processor" || (simActorRole === "team_lo" && simOutcome !== "granted")) {
          finalStatus = "blocked";
          finalSeverity = "critical";
          actionType = "lateral_access_blocked";
          actionLabel = "Twilio Vault Access Denied";
          policyRule = "RBAC-SEC-ZERO-LATERAL: Role prohibited from viewing encrypted carrier API keys.";
          details = `${simActorName} attempted to query decrypted Twilio auth token. Access denied by server middleware.`;
        } else {
          finalStatus = "granted";
          actionType = "view_secret";
          actionLabel = "Decrypted Twilio SMS Vault";
          policyRule = "RBAC-SEC-PRODUCER-CUSTODY: Producer holds self-scoped credential custody.";
          details = `${simActorName} queried carrier auth token for live SMS dispatch monitoring.`;
        }
      } else if (simAssetChoice === "bpd_webhook") {
        assetName = "Big Purple Dot Inbound Webhook Endpoint";
        if (simActorRole === "team_lo" && simOutcome !== "granted") {
          finalStatus = "blocked";
          finalSeverity = "critical";
          actionType = "lateral_access_blocked";
          actionLabel = "Unauthorized Webhook Reconfiguration Blocked";
          policyRule = "RBAC-SEC-WH-INHERITED: Team LO cannot modify branch webhook listeners.";
          details = `${simActorName} attempted to change HMAC secret on branch inbound stream. Event halted.`;
        } else {
          finalStatus = "granted";
          actionType = "update_webhook";
          actionLabel = "Updated Inbound Webhook Listener";
          policyRule = "RBAC-SEC-ORIGINATOR-WH: Originator personal webhook configuration approved.";
          details = `${simActorName} refreshed HMAC secret key for incoming CRM payload bridge.`;
        }
      } else if (simAssetChoice === "lead_pii") {
        assetName = "Borrower 1003 File - Sophia Martinez ($520k Conforming)";
        finalStatus = "granted";
        finalSeverity = "medium";
        actionType = "view_lead_pii";
        actionLabel = "Inspected Borrower Financial PII";
        policyRule = "GLBA-SAFEGUARDS-16CFR314: Originator access to assigned borrower tax records & DTI.";
        details = `${simActorName} accessed credit reports and 2-year W-2 income breakdown for underwriter submittal.`;
      } else if (simAssetChoice === "total_expert_key") {
        assetName = "Total Expert Enterprise Marketing Key Vault";
        if (simActorRole !== "branch_manager" && simOutcome !== "granted") {
          finalStatus = "blocked";
          finalSeverity = "critical";
          actionType = "lateral_access_blocked";
          actionLabel = "Master CRM Key Access Denied";
          policyRule = "RBAC-SEC-BM-ONLY: Enterprise API vaults restricted strictly to Branch Managers.";
          details = `${simActorName} triggered zero-trust perimeter alert querying master Total Expert token.`;
        } else {
          finalStatus = "elevated";
          finalSeverity = "high";
          actionType = "rotate_key";
          actionLabel = "Rotated Enterprise Marketing Key";
          policyRule = "RBAC-SEC-BM-ROOT: Authorized branch executive administrative key rotation.";
          details = `Key rotation completed. New OAuth client secret cached in KMS envelope.`;
        }
      }

      if (simOutcome === "blocked") {
        finalStatus = "blocked";
        finalSeverity = "critical";
        actionType = "lateral_access_blocked";
      } else if (simOutcome === "granted") {
        finalStatus = "granted";
      }

      const newLog = await logSensitiveAssetAccess({
        actorEmail: simActorEmail,
        actorName: simActorName,
        actorRole: simActorRole,
        actionType,
        actionLabel,
        assetCategory: simAssetCategory,
        assetName,
        targetAssetId: `asset_${Date.now()}`,
        status: finalStatus,
        severity: finalSeverity,
        ipAddress: "198.51.100.82 (TLS 1.3)",
        userAgent: navigator.userAgent,
        details,
        rbacPolicyRule: policyRule,
      });

      setLogs((prev) => [newLog, ...prev]);
      setShowSimulateModal(false);
      toast(`Simulated audit event logged: ${newLog.actionLabel} (${newLog.status.toUpperCase()})`);
    } catch (err) {
      console.error("Simulation error", err);
      toast("Error creating test audit event.");
    } finally {
      setSimSubmitting(false);
    }
  };

  // Helper badge renderers
  const renderCategoryBadge = (category: AuditAssetCategory) => {
    switch (category) {
      case "api_keys":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <KeyRound className="w-3 h-3 text-amber-600" />
            API Vault
          </span>
        );
      case "webhooks":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
            <Webhook className="w-3 h-3 text-indigo-600" />
            Webhook
          </span>
        );
      case "customer_pii":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
            <FileText className="w-3 h-3 text-sky-600" />
            Customer PII
          </span>
        );
      case "rbac_admin":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
            <ShieldAlert className="w-3 h-3 text-purple-600" />
            RBAC Policy
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-700">
            General
          </span>
        );
    }
  };

  const renderStatusBadge = (status: AuditLogStatus) => {
    switch (status) {
      case "granted":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            GRANTED
          </span>
        );
      case "blocked":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200 animate-pulse">
            <AlertTriangle className="w-3 h-3 text-rose-600" />
            BLOCKED
          </span>
        );
      case "elevated":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-800 border border-purple-200">
            <ShieldCheck className="w-3 h-3 text-purple-600" />
            ELEVATED
          </span>
        );
      case "flagged":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            FLAGGED
          </span>
        );
    }
  };

  const renderRoleBadge = (role: string) => {
    switch (role) {
      case "branch_manager":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-100 text-purple-800 border border-purple-300">
            Manager
          </span>
        );
      case "senior_lo":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
            Senior LO
          </span>
        );
      case "team_lo":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-100 text-blue-800 border border-blue-300">
            Team LO
          </span>
        );
      case "processor":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-300">
            Processor
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-700">
            {role}
          </span>
        );
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / (60 * 1000));
      const diffHours = Math.floor(diffMs / (3600 * 1000));
      const diffDays = Math.floor(diffMs / (24 * 3600 * 1000));

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch {
      return "Recent";
    }
  };

  return (
    <div id="branch-audit-log-section" className="space-y-6">
      {/* SECTION HEADER WITH COMPLIANCE METRIC SUMMARY */}
      <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-[#EAE7E0]">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#4A5D4E] text-white rounded-xl shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-[#2D362E] tracking-tight">
                CRM & Sensitive Asset Audit Log
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Live Monitoring Active
              </span>
            </div>
            <p className="text-xs text-[#606C5D] max-w-2xl leading-relaxed">
              Cryptographically verified audit trail tracking team members' access to API key vaults, CRM webhooks, and private customer PII. Enforces Gramm-Leach-Bliley Act (GLBA Safeguards) compliance and zero-lateral leakage guarantees.
            </p>
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleVerifyChain}
              disabled={isVerifyingChain}
              className={`inline-flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-semibold transition-all ${
                verificationResult?.isValid
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : verificationResult?.isTampered
                  ? "bg-rose-50 text-rose-800 border-rose-300"
                  : "bg-white hover:bg-[#F3F1EC] text-[#2D362E] border-[#EAE7E0]"
              }`}
              title="Cryptographically verify SHA-256 Hash Chain Merkle links"
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${verificationResult?.isValid ? "text-emerald-600" : "text-indigo-600"} ${isVerifyingChain ? "animate-spin" : ""}`} />
              {isVerifyingChain ? "Verifying..." : verificationResult?.isValid ? "Chain Verified" : "Verify Hash Chain"}
            </button>

            <button
              onClick={() => setShowSimulateModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#2D362E] hover:bg-[#4A5D4E] text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              title="Simulate team member asset access or lateral attempt"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              Simulate Access Event
            </button>

            <button
              onClick={() => exportAuditLogsToCsv(filteredLogs)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#F3F1EC] text-[#2D362E] border border-[#EAE7E0] rounded-xl text-xs font-semibold transition-colors"
              title="Download CSV report for compliance examiners"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              Export CSV
            </button>

            <button
              onClick={() => exportAuditLogsToText(filteredLogs)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#F3F1EC] text-[#2D362E] border border-[#EAE7E0] rounded-xl text-xs font-semibold transition-colors"
              title="Download Official Audit Certificate"
            >
              <Download className="w-3.5 h-3.5 text-[#606C5D]" />
              Audit Transcript
            </button>

            <button
              onClick={loadLogs}
              className="p-2 bg-white hover:bg-[#F3F1EC] text-[#606C5D] hover:text-[#2D362E] border border-[#EAE7E0] rounded-xl transition-colors"
              title="Refresh Audit Logs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* HASH CHAIN INTEGRITY STATUS BANNER */}
        {verificationResult && (
          <div className={`mt-4 p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
            verificationResult.isValid
              ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
              : "bg-rose-50/80 border-rose-200 text-rose-900"
          }`}>
            <div className="flex items-center gap-2.5">
              {verificationResult.isValid ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <div>
                <span className="font-bold">
                  {verificationResult.isValid ? "Cryptographic Hash Chain Verified: " : "Integrity Failure Detected: "}
                </span>
                {verificationResult.isValid ? (
                  <span>
                    All {verificationResult.verifiedCount} audit ledger blocks mathematically verified via SHA-256 links back to Genesis block ({GENESIS_AUDIT_HASH.slice(0, 10)}...). Zero tampering detected.
                  </span>
                ) : (
                  <span>{verificationResult.reason}</span>
                )}
              </div>
            </div>
            <button
              onClick={() => setVerificationResult(null)}
              className="p-1 text-[#606C5D] hover:text-[#2D362E] rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* METRICS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-6">
          <div className="bg-white p-3.5 rounded-2xl border border-[#EAE7E0] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#606C5D]">Total Tracked Events</span>
              <div className="p-1.5 bg-[#F8F7F4] rounded-lg">
                <Clock className="w-3.5 h-3.5 text-[#2D362E]" />
              </div>
            </div>
            <div className="text-xl font-black text-[#2D362E]">{metrics.total}</div>
            <div className="text-[10px] text-[#606C5D]">Immutable tamper-resistant logs</div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-[#EAE7E0] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#606C5D]">API Key Vault Access</span>
              <div className="p-1.5 bg-amber-50 rounded-lg">
                <KeyRound className="w-3.5 h-3.5 text-amber-700" />
              </div>
            </div>
            <div className="text-xl font-black text-amber-900">{metrics.apiKeys}</div>
            <div className="text-[10px] text-amber-700 font-medium">Twilio, TE & Salesforce</div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-[#EAE7E0] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#606C5D]">Webhook Operations</span>
              <div className="p-1.5 bg-indigo-50 rounded-lg">
                <Webhook className="w-3.5 h-3.5 text-indigo-700" />
              </div>
            </div>
            <div className="text-xl font-black text-indigo-900">{metrics.webhooks}</div>
            <div className="text-[10px] text-indigo-700 font-medium">Big Purple Dot & Zapier</div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-[#EAE7E0] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#606C5D]">Customer PII Inspected</span>
              <div className="p-1.5 bg-sky-50 rounded-lg">
                <FileText className="w-3.5 h-3.5 text-sky-700" />
              </div>
            </div>
            <div className="text-xl font-black text-sky-900">{metrics.customerPii}</div>
            <div className="text-[10px] text-sky-700 font-medium">GLBA 1003 & TCPA certs</div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-[#EAE7E0] space-y-1 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-rose-800">Zero-Lateral Blocks</span>
              <div className="p-1.5 bg-rose-50 rounded-lg">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              </div>
            </div>
            <div className="text-xl font-black text-rose-700">{metrics.blockedViolations}</div>
            <div className="text-[10px] text-rose-600 font-bold">Unauthorized leaks halted</div>
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS & SEARCH */}
      <div className="bg-white border border-[#EAE7E0] rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* SEARCH INPUT */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9A9488]" />
            <input
              type="text"
              placeholder="Search by team member, email, asset name, IP, or hash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl text-xs text-[#2D362E] placeholder-[#9A9488] focus:outline-hidden focus:border-[#4A5D4E]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#9A9488] hover:text-[#2D362E]"
              >
                Clear
              </button>
            )}
          </div>

          {/* CATEGORY FILTER */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#606C5D]" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="py-2 px-3 bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl text-xs font-semibold text-[#2D362E] focus:outline-hidden focus:border-[#4A5D4E]"
            >
              <option value="all">All Asset Categories</option>
              <option value="api_keys">API Keys & Vaults</option>
              <option value="webhooks">CRM Webhooks</option>
              <option value="customer_pii">Customer PII & Leads</option>
              <option value="rbac_admin">RBAC & Governance</option>
            </select>

            {/* ROLE FILTER */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="py-2 px-3 bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl text-xs font-semibold text-[#2D362E] focus:outline-hidden focus:border-[#4A5D4E]"
            >
              <option value="all">All RBAC Roles</option>
              <option value="branch_manager">Branch Manager</option>
              <option value="senior_lo">Senior LO</option>
              <option value="team_lo">Team LO</option>
              <option value="processor">Loan Processor</option>
            </select>

            {/* STATUS FILTER */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="py-2 px-3 bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl text-xs font-semibold text-[#2D362E] focus:outline-hidden focus:border-[#4A5D4E]"
            >
              <option value="all">All Outcomes</option>
              <option value="granted">Granted (Authorized)</option>
              <option value="blocked">Blocked (Violation Prevented)</option>
              <option value="elevated">Elevated (Admin Action)</option>
            </select>

            {/* SORT ORDER */}
            <button
              onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
              className="px-3 py-2 bg-[#FAF9F5] border border-[#EAE7E0] hover:bg-[#F3F1EC] rounded-xl text-xs font-semibold text-[#2D362E] transition-colors flex items-center gap-1.5"
              title="Toggle sort order"
            >
              <Clock className="w-3.5 h-3.5 text-[#606C5D]" />
              {sortOrder === "desc" ? "Newest First" : "Oldest First"}
            </button>
          </div>
        </div>

        {/* ACTIVE FILTER SUMMARY & RESET */}
        {(selectedCategory !== "all" || selectedRole !== "all" || selectedStatus !== "all" || searchQuery) && (
          <div className="flex items-center justify-between pt-2 border-t border-[#EAE7E0] text-xs">
            <span className="text-[#606C5D]">
              Showing <strong>{filteredLogs.length}</strong> of <strong>{logs.length}</strong> audit records matching active filters.
            </span>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSelectedRole("all");
                setSelectedStatus("all");
                setSearchQuery("");
              }}
              className="text-[#4A5D4E] hover:underline font-semibold"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* AUDIT LOG TABLE / LIST */}
      <div className="bg-white border border-[#EAE7E0] rounded-3xl shadow-xs overflow-hidden">
        <div className="p-4 bg-[#FAF9F5] border-b border-[#EAE7E0] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-[#2D362E]">
            <Lock className="w-4 h-4 text-[#4A5D4E]" />
            <span>Immutable Regulatory Access Ledger</span>
            <span className="text-[#606C5D] font-normal">({filteredLogs.length} events indexed)</span>
          </div>
          <div className="text-[11px] text-[#606C5D] hidden sm:block">
            Standard: <strong>GLBA Safeguards (16 CFR Part 314)</strong> &bull; <strong>TCPA Recordation</strong>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-[#606C5D] space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#4A5D4E]" />
            <p>Verifying ledger integrity and loading audit events...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#606C5D] space-y-2">
            <ShieldCheck className="w-8 h-8 mx-auto text-[#9A9488]" />
            <p className="font-bold text-[#2D362E]">No audit events found matching query.</p>
            <p>Adjust your search filters or click "Simulate Access Event" to test tracking.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#EAE7E0]">
            {filteredLogs.map((log) => {
              const isBlocked = log.status === "blocked";
              return (
                <div
                  key={log.id}
                  className={`p-4 transition-colors hover:bg-[#FAF9F5] flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                    isBlocked ? "bg-rose-50/30" : ""
                  }`}
                >
                  {/* LEFT: ACTOR + ASSET + ACTION */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="mt-1 shrink-0">
                      {isBlocked ? (
                        <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                      ) : log.assetCategory === "api_keys" ? (
                        <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                          <KeyRound className="w-4 h-4" />
                        </div>
                      ) : log.assetCategory === "webhooks" ? (
                        <div className="p-2 bg-indigo-100 text-indigo-800 rounded-xl">
                          <Webhook className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="p-2 bg-sky-100 text-sky-800 rounded-xl">
                          <FileText className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      {/* TOP LINE: ACTION + CATEGORY + STATUS */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-[#2D362E]">
                          {log.actionLabel}
                        </span>
                        {renderCategoryBadge(log.assetCategory)}
                        {renderStatusBadge(log.status)}
                        <span className="text-[10px] text-[#9A9488] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatRelativeTime(log.timestamp)}
                        </span>
                      </div>

                      {/* MIDDLE LINE: TARGET ASSET */}
                      <div className="text-xs text-[#2D362E] font-medium flex items-center gap-1.5">
                        <span className="text-[#606C5D]">Target Asset:</span>
                        <span className="font-semibold text-[#2D362E]">{log.assetName}</span>
                      </div>

                      {/* BOTTOM LINE: DETAILS & RBAC POLICY */}
                      <p className="text-[11px] text-[#606C5D] leading-relaxed line-clamp-2">
                        {log.details}
                      </p>

                      <div className="text-[10px] font-mono text-[#7A7468] pt-0.5">
                        Rule: {log.rbacPolicyRule}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: ACTOR PROFILE + HASH + INSPECT BUTTON */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#EAE7E0]">
                    {/* ACTOR INFO */}
                    <div className="text-right flex items-center lg:flex-col lg:items-end gap-2 lg:gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#2D362E]">{log.actorName}</span>
                        {renderRoleBadge(log.actorRole)}
                      </div>
                      <span className="text-[11px] text-[#606C5D] font-mono">{log.actorEmail}</span>
                    </div>

                    {/* HASH & ACTIONS */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyHash(log.integrityHash, log.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-[#FAF9F5] hover:bg-[#EAE7E0] border border-[#EAE7E0] rounded-lg text-[10px] font-mono text-[#606C5D] transition-colors"
                        title="Copy cryptographic tamper-evident hash"
                      >
                        {copiedHashId === log.id ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{log.integrityHash.substring(0, 10)}...</span>
                      </button>

                      <button
                        onClick={() => setInspectingLog(log)}
                        className="px-2.5 py-1 bg-[#2D362E] hover:bg-[#4A5D4E] text-white rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1"
                        title="Inspect cryptographic audit envelope"
                      >
                        <Info className="w-3 h-3" />
                        Inspect
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* INSPECT AUDIT RECORD MODAL */}
      {inspectingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-[#EAE7E0] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE7E0]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#4A5D4E] text-white rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#2D362E]">Cryptographic Audit Envelope</h3>
                  <p className="text-xs text-[#606C5D]">Record ID: {inspectingLog.id}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectingLog(null)}
                className="p-1.5 text-[#9A9488] hover:text-[#2D362E] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* EVENT METRICS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#EAE7E0]">
                <div className="text-[10px] text-[#606C5D]">Outcome Status</div>
                <div className="pt-1">{renderStatusBadge(inspectingLog.status)}</div>
              </div>
              <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#EAE7E0]">
                <div className="text-[10px] text-[#606C5D]">Asset Class</div>
                <div className="pt-1">{renderCategoryBadge(inspectingLog.assetCategory)}</div>
              </div>
              <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#EAE7E0]">
                <div className="text-[10px] text-[#606C5D]">Severity Tier</div>
                <div className="pt-1 font-bold uppercase text-[#2D362E]">{inspectingLog.severity}</div>
              </div>
              <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#EAE7E0]">
                <div className="text-[10px] text-[#606C5D]">Recorded At</div>
                <div className="pt-1 font-medium text-[#2D362E] text-[11px]">
                  {new Date(inspectingLog.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>

            {/* ACTOR IDENTITY DETAILS */}
            <div className="p-4 bg-[#F8F7F4] rounded-2xl border border-[#EAE7E0] space-y-2 text-xs">
              <div className="font-bold text-[#2D362E] pb-1 border-b border-[#EAE7E0] flex items-center justify-between">
                <span>Actor Authorization Identity</span>
                {renderRoleBadge(inspectingLog.actorRole)}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#2D362E]">
                <div>
                  <span className="text-[#606C5D]">Full Name:</span> <strong>{inspectingLog.actorName}</strong>
                </div>
                <div>
                  <span className="text-[#606C5D]">Email:</span> <span className="font-mono">{inspectingLog.actorEmail}</span>
                </div>
                <div>
                  <span className="text-[#606C5D]">Session Origin:</span> <span className="font-mono">{inspectingLog.ipAddress}</span>
                </div>
                <div>
                  <span className="text-[#606C5D]">Timestamp UTC:</span> {new Date(inspectingLog.timestamp).toUTCString()}
                </div>
              </div>
              {inspectingLog.userAgent && (
                <div className="text-[10px] font-mono text-[#606C5D] break-all pt-1">
                  User-Agent: {inspectingLog.userAgent}
                </div>
              )}
            </div>

            {/* SENSITIVE ASSET DETAILS */}
            <div className="p-4 bg-white rounded-2xl border border-[#EAE7E0] space-y-2 text-xs">
              <div className="font-bold text-[#2D362E] pb-1 border-b border-[#EAE7E0]">
                Target Asset & Action Details
              </div>
              <div>
                <span className="text-[#606C5D]">Asset Name:</span>{" "}
                <span className="font-bold text-[#2D362E]">{inspectingLog.assetName}</span>
              </div>
              <div>
                <span className="text-[#606C5D]">Action Type:</span>{" "}
                <span className="font-semibold text-[#2D362E]">{inspectingLog.actionLabel} ({inspectingLog.actionType})</span>
              </div>
              <div className="p-2.5 bg-[#FAF9F5] rounded-xl text-[#2D362E] text-[11px] leading-relaxed">
                {inspectingLog.details}
              </div>
              <div className="text-[11px] text-[#4A5D4E] font-medium">
                <strong>Enforced RBAC Rule:</strong> {inspectingLog.rbacPolicyRule}
              </div>
            </div>

            {/* INTEGRITY PROOF */}
            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs space-y-1.5">
              <div className="flex items-center justify-between font-bold text-blue-900">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  Cryptographic Non-Repudiation Envelope
                </span>
                <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded-md border border-blue-200 text-blue-800">
                  {inspectingLog.integrityHash}
                </span>
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                This record is stamped with a SHA-256 tamper-evident integrity hash. Any manual modification of database fields invalidates the verification certificate during CFPB or state mortgage regulatory examinations.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(inspectingLog, null, 2));
                  toast("Copied complete JSON audit record to clipboard");
                }}
                className="px-4 py-2 bg-[#FAF9F5] hover:bg-[#EAE7E0] text-[#2D362E] rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy JSON Payload
              </button>

              <button
                onClick={() => setInspectingLog(null)}
                className="px-5 py-2 bg-[#2D362E] hover:bg-[#4A5D4E] text-white rounded-xl text-xs font-bold transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIMULATE ACCESS EVENT MODAL */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#EAE7E0] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE7E0]">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 text-purple-800 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#2D362E]">Simulate Asset Access Event</h3>
                  <p className="text-xs text-[#606C5D]">Test real-time RBAC logging & zero-lateral security</p>
                </div>
              </div>
              <button
                onClick={() => setShowSimulateModal(false)}
                className="p-1.5 text-[#9A9488] hover:text-[#2D362E] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSimulateSubmit} className="space-y-4 text-xs">
              {/* ACTOR SELECTOR */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#2D362E]">Team Member / Originator:</label>
                <select
                  value={simActorEmail}
                  onChange={(e) => {
                    const email = e.target.value;
                    setSimActorEmail(email);
                    if (email.includes("fordmj")) {
                      setSimActorName("Mike Ford");
                      setSimActorRole("branch_manager");
                    } else if (email.includes("sarah")) {
                      setSimActorName("Sarah Jenkins");
                      setSimActorRole("senior_lo");
                    } else if (email.includes("rachel")) {
                      setSimActorName("Rachel Chen");
                      setSimActorRole("processor");
                    } else {
                      setSimActorName("Alex Ramos");
                      setSimActorRole("team_lo");
                    }
                  }}
                  className="w-full p-2.5 bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl text-xs font-medium text-[#2D362E] focus:outline-hidden focus:border-[#4A5D4E]"
                >
                  <option value="alex.ramos@premier.loans">Alex Ramos (Team Loan Officer)</option>
                  <option value="sarah.jenkins@premier.loans">Sarah Jenkins (Senior Loan Officer)</option>
                  <option value="rachel.chen@premier.loans">Rachel Chen (Loan Processor)</option>
                  <option value="fordmj@gmail.com">Mike Ford (Branch Manager)</option>
                </select>
              </div>

              {/* TARGET ASSET SELECTOR */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#2D362E]">Target Sensitive Asset:</label>
                <select
                  value={simAssetChoice}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSimAssetChoice(val);
                    if (val === "twilio_vault" || val === "total_expert_key") {
                      setSimAssetCategory("api_keys");
                    } else if (val === "bpd_webhook") {
                      setSimAssetCategory("webhooks");
                    } else {
                      setSimAssetCategory("customer_pii");
                    }
                  }}
                  className="w-full p-2.5 bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl text-xs font-medium text-[#2D362E] focus:outline-hidden focus:border-[#4A5D4E]"
                >
                  <option value="twilio_vault">Twilio Live Carrier Vault (Encrypted API Token)</option>
                  <option value="bpd_webhook">Big Purple Dot Webhook Inbound Listener (HMAC Secret)</option>
                  <option value="lead_pii">Borrower 1003 File - Sophia Martinez ($520k Conforming)</option>
                  <option value="total_expert_key">Total Expert Enterprise Marketing Key Vault (Master)</option>
                </select>
              </div>

              {/* EXPECTED OUTCOME */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#2D362E]">Simulated Policy Evaluation:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSimOutcome("auto")}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-colors ${
                      simOutcome === "auto"
                        ? "bg-[#2D362E] text-white border-[#2D362E]"
                        : "bg-[#FAF9F5] text-[#2D362E] border-[#EAE7E0]"
                    }`}
                  >
                    Auto RBAC Rule
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimOutcome("granted")}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-colors ${
                      simOutcome === "granted"
                        ? "bg-emerald-700 text-white border-emerald-700"
                        : "bg-[#FAF9F5] text-emerald-800 border-[#EAE7E0]"
                    }`}
                  >
                    Force Granted
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimOutcome("blocked")}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-colors ${
                      simOutcome === "blocked"
                        ? "bg-rose-700 text-white border-rose-700"
                        : "bg-[#FAF9F5] text-rose-800 border-[#EAE7E0]"
                    }`}
                  >
                    Simulate Block
                  </button>
                </div>
              </div>

              <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#EAE7E0] text-[11px] text-[#606C5D] space-y-1">
                <strong>Simulated Security Guarantee:</strong> Submitting will evaluate assigned role boundaries. If a Team LO attempts to view an unassigned Senior LO's webhook or master key, zero-lateral protection immediately logs a BLOCKED violation with full origin IP forensics.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-4 py-2 bg-[#FAF9F5] hover:bg-[#EAE7E0] text-[#606C5D] rounded-xl text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={simSubmitting}
                  className="px-5 py-2 bg-[#2D362E] hover:bg-[#4A5D4E] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  {simSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  Dispatch Event Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
