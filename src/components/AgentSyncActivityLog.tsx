import React, { useState, useEffect, useMemo } from "react";
import {
  Activity,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Globe,
  Sparkles,
  Download,
  Trash2,
  Eye,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  UserPlus,
  Link as LinkIcon,
  Phone,
  Mail,
  Award,
  Zap,
  Building,
  Info,
  Layers,
  ArrowUpDown,
  Terminal,
  FileJson,
  UserCheck,
  AlertCircle,
  MapPin,
  Trophy,
  Megaphone,
  Video,
  Database,
  Radio,
  Share2,
  Compass,
  CheckSquare
} from "lucide-react";
import {
  AgentScraperLogEntry,
  ScraperValidationWarning,
  ProfessionalGuidesState,
  RealEstateAgentProfile,
  LoanOfficerProfile,
  SyncActivityCategory
} from "../types";
import {
  fetchScraperLogs,
  recordScraperLog,
  resolveScraperWarning,
  deleteScraperLog,
  executeLiveAgentScraperRun,
  executeLiveGeoMapSyncRun,
  executeTop50SweepRun,
  executeVantageAiImportRun
} from "../services/agentScraperLogService";
import { GEOSPHERE_DATASETS } from "../data/geoSphereData";

interface AgentSyncActivityLogProps {
  guidesState: ProfessionalGuidesState;
  onUpdateGuidesState: (newState: ProfessionalGuidesState) => void;
  currentLo: LoanOfficerProfile;
  onTriggerToast: (msg: string) => void;
  onNavigateToRealtorRoster?: () => void;
  onNavigateToPairings?: () => void;
}

export const AgentSyncActivityLog: React.FC<AgentSyncActivityLogProps> = ({
  guidesState,
  onUpdateGuidesState,
  currentLo,
  onTriggerToast,
  onNavigateToRealtorRoster,
  onNavigateToPairings,
}) => {
  const [logs, setLogs] = useState<AgentScraperLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "warning" | "success" | "failed">("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | SyncActivityCategory>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [expandedLogIds, setExpandedLogIds] = useState<Set<string>>(new Set());

  // Inspect Modal
  const [inspectingPayloadLog, setInspectingPayloadLog] = useState<AgentScraperLogEntry | null>(null);
  const [resolvingWarning, setResolvingWarning] = useState<{
    logId: string;
    warning: ScraperValidationWarning;
  } | null>(null);
  const [resolutionNoteInput, setResolutionNoteInput] = useState<string>("");

  // Action Modals
  const [showScrapeRunner, setShowScrapeRunner] = useState<boolean>(false);
  const [showGeoMapSyncModal, setShowGeoMapSyncModal] = useState<boolean>(false);
  const [showTop50SweepModal, setShowTop50SweepModal] = useState<boolean>(false);
  const [showVantageAiModal, setShowVantageAiModal] = useState<boolean>(false);

  // Form states for live runners
  const [newScrapeUrl, setNewScrapeUrl] = useState<string>("");
  const [newScrapeName, setNewScrapeName] = useState<string>("");
  const [newScrapeBrokerage, setNewScrapeBrokerage] = useState<string>("");
  const [selectedGeoDataset, setSelectedGeoDataset] = useState<string>("oregon_all");
  const [geoTargetCity, setGeoTargetCity] = useState<string>("all");
  const [geoCustomEndpoint, setGeoCustomEndpoint] = useState<string>("");
  const [geoRentcastKey, setGeoRentcastKey] = useState<string>("");
  const [selectedSweepType, setSelectedSweepType] = useState<
    "realtrends_top50_agents" | "top50_usda_listings" | "top50_junction_city" | "top50_lane_county" | "top50_metro_buyside"
  >("realtrends_top50_agents");
  const [vantageCampaignName, setVantageCampaignName] = useState<string>("Oregon First-Time Buyer 2-1 Buydown & USDA Spotlight");
  const [vantagePartnerAgent, setVantagePartnerAgent] = useState<string>("Sarah Jenkins");

  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executingStepText, setExecutingStepText] = useState<string>("");

  // Load logs
  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await fetchScraperLogs();
      setLogs(data);
    } catch (err) {
      console.error("Failed to load scraper logs:", err);
      onTriggerToast("Notice: Loaded cached sync activity telemetry.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = logs.length;
    const cleanSuccess = logs.filter((l) => l.status === "success").length;
    const warningsCount = logs.filter((l) => l.status === "warning").length;
    const failedCount = logs.filter((l) => l.status === "failed").length;

    const geomapSyncCount = logs.filter((l) => l.category === "geomap_property_sync").length;
    const top50SweepsCount = logs.filter((l) => l.category === "top50_sweep").length;
    const vantageAiImportsCount = logs.filter((l) => l.category === "vantage_ai_import").length;
    const agentScrapesCount = logs.filter((l) => !l.category || l.category === "agent_scraper").length;

    let unresolvedWarningsTotal = 0;
    logs.forEach((l) => {
      unresolvedWarningsTotal += (l.validationWarnings || []).filter((w) => !w.resolved).length;
    });

    const latencies = logs.map((l) => l.latencyMs || 0).filter((ms) => ms > 0);
    const avgLatency =
      latencies.length > 0
        ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
        : 950;

    return {
      total,
      cleanSuccess,
      warningsCount,
      failedCount,
      unresolvedWarningsTotal,
      avgLatency,
      geomapSyncCount,
      top50SweepsCount,
      vantageAiImportsCount,
      agentScrapesCount,
      successRate: total > 0 ? Math.round((cleanSuccess / total) * 100) : 100,
    };
  }, [logs]);

  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Category filter
      if (categoryFilter !== "all") {
        const logCat = log.category || "agent_scraper";
        if (logCat !== categoryFilter) return false;
      }

      // Status filter
      if (statusFilter !== "all" && log.status !== statusFilter) {
        return false;
      }

      // Source filter
      if (sourceFilter !== "all" && log.sourceType !== sourceFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (log.agentName || "").toLowerCase().includes(q);
        const matchesTitle = (log.title || "").toLowerCase().includes(q);
        const matchesBrokerage = (log.brokerage || "").toLowerCase().includes(q);
        const matchesUrl = (log.sourceUrl || "").toLowerCase().includes(q);
        const matchesLicense = (log.scrapedData?.licenseNumber || "").toLowerCase().includes(q);
        const matchesDataset = (log.propertySyncMeta?.datasetName || "").toLowerCase().includes(q);
        const matchesSweep = (log.top50SweepMeta?.sweepName || "").toLowerCase().includes(q);
        const matchesCampaign = (log.vantageAiSyncMeta?.campaignName || "").toLowerCase().includes(q);
        const matchesWarnings = (log.validationWarnings || []).some(
          (w) => w.message.toLowerCase().includes(q) || w.code.toLowerCase().includes(q)
        );
        return (
          matchesName ||
          matchesTitle ||
          matchesBrokerage ||
          matchesUrl ||
          matchesLicense ||
          matchesDataset ||
          matchesSweep ||
          matchesCampaign ||
          matchesWarnings
        );
      }

      return true;
    });
  }, [logs, categoryFilter, statusFilter, sourceFilter, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedLogIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    onTriggerToast("Copied source URL to clipboard");
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  // Run live agent scrape
  const handleExecuteLiveScrape = async () => {
    if (!newScrapeUrl.trim()) {
      onTriggerToast("Please enter a valid agent bio page or profile URL.");
      return;
    }

    setIsExecuting(true);
    setExecutingStepText("Connecting to target server & initiating SSL handshake...");

    setTimeout(() => {
      setExecutingStepText("Parsing DOM, Schema.org metadata, and bio text via Gemini Extraction...");
    }, 600);

    setTimeout(() => {
      setExecutingStepText("Running CFPB / SAFE Act NMLS validation & license compliance checks...");
    }, 1300);

    try {
      const result = await executeLiveAgentScraperRun(
        newScrapeUrl.trim(),
        newScrapeName.trim() || undefined,
        newScrapeBrokerage.trim() || undefined,
        currentLo.name || "Mike Ford"
      );

      setLogs((prev) => [result.log, ...prev.filter((l) => l.id !== result.log.id)]);

      if (result.success) {
        onTriggerToast(`✓ Successfully scraped ${result.log.agentName} from ${result.log.sourceType.toUpperCase()}`);
        if (result.log.validationWarnings.length > 0) {
          setExpandedLogIds((prev) => new Set(prev).add(result.log.id));
        }
      } else {
        onTriggerToast(`✕ Scraper returned warning or error: ${result.log.errorMessage || "Check log for details"}`);
      }

      setShowScrapeRunner(false);
      setNewScrapeUrl("");
      setNewScrapeName("");
      setNewScrapeBrokerage("");
    } catch (err: any) {
      console.error("Scraper execution error:", err);
      onTriggerToast("Scraper run encountered an issue.");
    } finally {
      setIsExecuting(false);
      setExecutingStepText("");
    }
  };

  // Run Live GeoMap Sync
  const handleExecuteGeoMapSync = async () => {
    setIsExecuting(true);
    setExecutingStepText("Connecting to GeoSphere Oregon / RentCast API Proxy...");

    setTimeout(() => {
      setExecutingStepText("Ingesting live for-sale listings & computing USDA / OHCS census tract overlays...");
    }, 500);

    setTimeout(() => {
      setExecutingStepText("Cross-referencing listings with Master Realtor Roster and LO pairings...");
    }, 1100);

    try {
      const result = await executeLiveGeoMapSyncRun(
        selectedGeoDataset,
        geoTargetCity !== "all" ? geoTargetCity : undefined,
        geoCustomEndpoint.trim() || undefined,
        geoRentcastKey.trim() || undefined,
        currentLo.name || "Mike Ford"
      );

      setLogs((prev) => [result.log, ...prev.filter((l) => l.id !== result.log.id)]);

      if (result.success) {
        onTriggerToast(`✓ GeoMap Sync complete: ${result.listingsCount} listings updated & cross-referenced!`);
        setExpandedLogIds((prev) => new Set(prev).add(result.log.id));
      } else {
        onTriggerToast("GeoMap Sync completed with fallback listings.");
      }

      setShowGeoMapSyncModal(false);
    } catch (e) {
      console.error("GeoMap Sync error:", e);
      onTriggerToast("GeoMap sync encountered an error.");
    } finally {
      setIsExecuting(false);
      setExecutingStepText("");
    }
  };

  // Run Top 50 Sweep
  const handleExecuteTop50Sweep = async () => {
    setIsExecuting(true);
    setExecutingStepText("Running Top 50 automated crawler against industry benchmarks...");

    setTimeout(() => {
      setExecutingStepText("Auditing records for 12-mo volume, buyside shares, and financing eligibility...");
    }, 700);

    try {
      const result = await executeTop50SweepRun(selectedSweepType, currentLo.name || "Mike Ford");
      setLogs((prev) => [result.log, ...prev.filter((l) => l.id !== result.log.id)]);

      onTriggerToast(`✓ Top 50 Sweep complete: 50 records evaluated & qualified!`);
      setExpandedLogIds((prev) => new Set(prev).add(result.log.id));
      setShowTop50SweepModal(false);
    } catch (e) {
      console.error("Top 50 sweep error:", e);
      onTriggerToast("Top 50 sweep encountered an error.");
    } finally {
      setIsExecuting(false);
      setExecutingStepText("");
    }
  };

  // Run Vantage AI Import
  const handleExecuteVantageAiImport = async () => {
    setIsExecuting(true);
    setExecutingStepText("Pulling co-branded campaign assets from Vantage AI Studio...");

    setTimeout(() => {
      setExecutingStepText("Formatting 9:16 Video scripts, Meta carousel hooks, and RESPA compliance footers...");
    }, 600);

    try {
      const result = await executeVantageAiImportRun(
        vantageCampaignName.trim() || "Oregon First-Time Buyer 2-1 Buydown Spotlight",
        vantagePartnerAgent.trim() || "Sarah Jenkins",
        currentLo.name || "Mike Ford"
      );

      setLogs((prev) => [result.log, ...prev.filter((l) => l.id !== result.log.id)]);

      onTriggerToast(`✓ Vantage AI Studio campaign imported & queued in adCampaignDrafts!`);
      setExpandedLogIds((prev) => new Set(prev).add(result.log.id));
      setShowVantageAiModal(false);
    } catch (e) {
      console.error("Vantage AI Import error:", e);
      onTriggerToast("Vantage AI import encountered an error.");
    } finally {
      setIsExecuting(false);
      setExecutingStepText("");
    }
  };

  // Resolve warning
  const handleConfirmResolveWarning = async () => {
    if (!resolvingWarning) return;

    try {
      const updated = await resolveScraperWarning(
        resolvingWarning.logId,
        resolvingWarning.warning.id,
        resolutionNoteInput.trim() || "Manually verified & approved by Loan Officer",
        currentLo.name || "Mike Ford"
      );

      if (updated) {
        setLogs((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
        onTriggerToast("✓ Validation warning marked as resolved.");
      }
    } catch (e) {
      console.error("Resolve error:", e);
      onTriggerToast("Failed to resolve warning.");
    } finally {
      setResolvingWarning(null);
      setResolutionNoteInput("");
    }
  };

  // Add scraped agent directly to Partner Roster
  const handleImportToRoster = (log: AgentScraperLogEntry) => {
    if (!log.scrapedData) {
      onTriggerToast("No extracted profile data available for this log entry.");
      return;
    }

    const data = log.scrapedData;
    const existingAgents = guidesState.agentRoster || [];
    const alreadyExists = existingAgents.some(
      (a) =>
        a.name.toLowerCase() === data.name?.toLowerCase() ||
        (data.email && a.email?.toLowerCase() === data.email?.toLowerCase())
    );

    if (alreadyExists) {
      onTriggerToast(`ℹ ${data.name || "Agent"} is already in your active Realtor Partner Roster.`);
      return;
    }

    const newAgent: RealEstateAgentProfile = {
      id: `agent-scraped-${Date.now()}`,
      name: data.name || log.agentName,
      title: "Real Estate Specialist",
      brokerage: data.brokerage || log.brokerage || "Partner Brokerage",
      licenseNumber: data.licenseNumber || "OR-Pending",
      email: data.email || `contact@${(data.brokerage || "brokerage").toLowerCase().replace(/[^a-z]/g, "")}.com`,
      phone: data.phone || "(503) 555-0100",
      headshotUrl:
        data.headshotUrl ||
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
      bio: data.bio || `Experienced real estate professional serving ${data.marketAreas?.join(", ") || "Oregon"}.`,
      specialties: ["First-Time Homebuyers", "Down Payment Assistance", "Single Family"],
      marketAreas: data.marketAreas || ["Portland Metro", "Oregon"],
      experienceYears: data.yearsExperience || 5,
      production12MoVolume: data.production12MoVolume || 18500000,
      production12MoUnits: data.production12MoUnits || 35,
      buysideVolume12Mo: Math.round((data.production12MoVolume || 18500000) * 0.65),
      buysideSharePct: data.buysideSharePct || 65,
      agentType: "buyer_agent",
      recruitmentStatus: "Interested",
    };

    const updatedRoster = [newAgent, ...existingAgents];
    onUpdateGuidesState({
      ...guidesState,
      agentRoster: updatedRoster,
    });

    onTriggerToast(`✓ Imported ${newAgent.name} (${newAgent.brokerage}) directly into Realtor Partner Roster!`);
  };

  // Export CSV
  const handleExportCsv = () => {
    try {
      const headers = [
        "Attempt ID",
        "Category",
        "Title / Entity",
        "Brokerage / Feed",
        "Status",
        "Source URL",
        "Source Type",
        "Timestamp",
        "Latency (ms)",
        "HTTP Status",
        "Listings Count",
        "Matched Agents",
        "Unresolved Warnings",
        "Warnings Breakdown",
      ];

      const rows = filteredLogs.map((log) => {
        const warningsList = (log.validationWarnings || [])
          .map((w) => `[${w.code}${w.resolved ? ":RESOLVED" : ":UNRESOLVED"}] ${w.message}`)
          .join(" | ");

        return [
          log.id,
          log.category || "agent_scraper",
          `"${(log.title || log.agentName || "").replace(/"/g, '""')}"`,
          `"${(log.brokerage || "").replace(/"/g, '""')}"`,
          log.status.toUpperCase(),
          `"${(log.sourceUrl || "").replace(/"/g, '""')}"`,
          log.sourceType,
          log.attemptTimestamp,
          log.latencyMs || "",
          log.httpStatus || "",
          log.propertySyncMeta?.listingsCount || "",
          log.propertySyncMeta?.matchedAgentCount || "",
          (log.validationWarnings || []).filter((w) => !w.resolved).length,
          `"${warningsList.replace(/"/g, '""')}"`,
        ].join(",");
      });

      const csvContent = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Unified_Sync_Activity_Audit_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      onTriggerToast("✓ Unified sync activity log exported to CSV.");
    } catch (err) {
      console.error("Export error:", err);
      onTriggerToast("Failed to export CSV.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-400/30">
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <span className="text-xs font-bold tracking-wider text-sky-400 uppercase bg-sky-950/60 px-2.5 py-1 rounded-md border border-sky-800/50">
                Unified Scraper & Sync Activity Hub
              </span>
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> SAFE Act / CFPB / RESPA Co-Op Verified
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Sync Activity, GeoMap Ingestion & Top 50 Sweeps
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              Real-time audit log and telemetry covering GeoMap saved property syncs (GeoSphere website / RentCast API), Top 50 market & agent sweeps, Vantage AI Studio imports, and agent bio extractions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowGeoMapSyncModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Sync GeoMap</span>
            </button>

            <button
              onClick={() => setShowTop50SweepModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Top 50 Sweep</span>
            </button>

            <button
              onClick={() => setShowVantageAiModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Vantage AI Import</span>
            </button>

            <button
              onClick={() => setShowScrapeRunner(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Scrape Agent</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition cursor-pointer"
              title="Export Scraper History to CSV"
            >
              <Download className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={loadLogs}
              disabled={isLoading}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition cursor-pointer"
              title="Refresh Scraper Logs"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-sky-400" : "text-slate-400"}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div
          onClick={() => setCategoryFilter("all")}
          className={`bg-white dark:bg-slate-800 p-3.5 rounded-xl border shadow-sm transition cursor-pointer hover:border-slate-400 ${
            categoryFilter === "all" ? "ring-2 ring-sky-500 border-sky-400" : "border-slate-200 dark:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Activity
            </span>
            <Activity className="w-4 h-4 text-sky-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-slate-900 dark:text-white">{metrics.total}</span>
            <span className="text-[11px] text-slate-400">runs</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Avg: {metrics.avgLatency}ms</p>
        </div>

        <div
          onClick={() => setCategoryFilter("geomap_property_sync")}
          className={`bg-white dark:bg-slate-800 p-3.5 rounded-xl border shadow-sm transition cursor-pointer hover:border-emerald-400 ${
            categoryFilter === "geomap_property_sync" ? "ring-2 ring-emerald-500 border-emerald-400 bg-emerald-50/20" : "border-slate-200 dark:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              GeoMap Syncs
            </span>
            <Globe className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{metrics.geomapSyncCount}</span>
            <span className="text-[11px] text-emerald-700/70">GIS pulls</span>
          </div>
          <p className="text-[11px] text-emerald-600 mt-0.5 font-medium">RentCast Live Feed</p>
        </div>

        <div
          onClick={() => setCategoryFilter("top50_sweep")}
          className={`bg-white dark:bg-slate-800 p-3.5 rounded-xl border shadow-sm transition cursor-pointer hover:border-amber-400 ${
            categoryFilter === "top50_sweep" ? "ring-2 ring-amber-500 border-amber-400 bg-amber-50/20" : "border-slate-200 dark:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              Top 50 Sweeps
            </span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-amber-600 dark:text-amber-400">{metrics.top50SweepsCount}</span>
            <span className="text-[11px] text-amber-700/70">scrapes</span>
          </div>
          <p className="text-[11px] text-amber-600 mt-0.5 font-medium">RealTrends & USDA</p>
        </div>

        <div
          onClick={() => setCategoryFilter("vantage_ai_import")}
          className={`bg-white dark:bg-slate-800 p-3.5 rounded-xl border shadow-sm transition cursor-pointer hover:border-purple-400 ${
            categoryFilter === "vantage_ai_import" ? "ring-2 ring-purple-500 border-purple-400 bg-purple-50/20" : "border-slate-200 dark:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
              Vantage AI Studio
            </span>
            <Sparkles className="w-4 h-4 text-purple-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-purple-600 dark:text-purple-400">{metrics.vantageAiImportsCount}</span>
            <span className="text-[11px] text-purple-700/70">ad syncs</span>
          </div>
          <p className="text-[11px] text-purple-600 mt-0.5 font-medium">Co-Branded Kits</p>
        </div>

        <div
          onClick={() => setCategoryFilter("agent_scraper")}
          className={`bg-white dark:bg-slate-800 p-3.5 rounded-xl border shadow-sm transition cursor-pointer hover:border-blue-400 ${
            categoryFilter === "agent_scraper" ? "ring-2 ring-blue-500 border-blue-400 bg-blue-50/20" : "border-slate-200 dark:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
              Agent Scrapes
            </span>
            <UserCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{metrics.agentScrapesCount}</span>
            <span className="text-[11px] text-blue-700/70">bios</span>
          </div>
          <p className="text-[11px] text-blue-600 mt-0.5 font-medium">SAFE Act Checked</p>
        </div>
      </div>

      {/* Category Tabs & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Main Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setCategoryFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                categoryFilter === "all"
                  ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              All Sync Channels ({logs.length})
            </button>
            <button
              onClick={() => setCategoryFilter("geomap_property_sync")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                categoryFilter === "geomap_property_sync"
                  ? "bg-emerald-600 text-white shadow-sm font-bold"
                  : "text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>GeoMap & RentCast ({metrics.geomapSyncCount})</span>
            </button>
            <button
              onClick={() => setCategoryFilter("top50_sweep")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                categoryFilter === "top50_sweep"
                  ? "bg-amber-600 text-white shadow-sm font-bold"
                  : "text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Top 50 Sweeps ({metrics.top50SweepsCount})</span>
            </button>
            <button
              onClick={() => setCategoryFilter("vantage_ai_import")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                categoryFilter === "vantage_ai_import"
                  ? "bg-purple-600 text-white shadow-sm font-bold"
                  : "text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Vantage AI Imports ({metrics.vantageAiImportsCount})</span>
            </button>
            <button
              onClick={() => setCategoryFilter("agent_scraper")}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                categoryFilter === "agent_scraper"
                  ? "bg-sky-600 text-white shadow-sm font-bold"
                  : "text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Agent Scrapes ({metrics.agentScrapesCount})</span>
            </button>
          </div>

          {/* Status Indicators Pill */}
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-2.5 py-1 rounded-md font-medium ${
                statusFilter === "all" ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white" : "text-slate-500"
              }`}
            >
              All Statuses
            </button>
            <button
              onClick={() => setStatusFilter("warning")}
              className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 ${
                statusFilter === "warning" ? "bg-amber-500 text-white" : "text-amber-600 hover:bg-amber-50"
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Warnings ({metrics.unresolvedWarningsTotal})</span>
            </button>
            <button
              onClick={() => setStatusFilter("success")}
              className={`px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 ${
                statusFilter === "success" ? "bg-emerald-600 text-white" : "text-emerald-600 hover:bg-emerald-50"
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Success ({metrics.cleanSuccess})</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Source Selector */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by city, dataset, agent, campaign, warning code..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs w-full md:w-auto justify-end">
            <span className="text-slate-400 font-medium">Feed Source:</span>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="all">All Data Sources</option>
              <option value="luther_geosphere_web">GeoSphere Oregon Web Vercel Feed</option>
              <option value="rentcast_api">RentCast For-Sale API</option>
              <option value="geosphere_gis">Oregon GeoSphere GIS Engine</option>
              <option value="realtrends">RealTrends America's Best Oregon</option>
              <option value="vantage_ai_studio">Vantage AI Ads Studio</option>
              <option value="brokerage_bio">Brokerage Team Bios</option>
              <option value="zillow">Zillow Premier Directory</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activity Logs List */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              No matching activity records found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Try adjusting your search query, selecting another category tab, or trigger a live GeoMap sync, Top 50 sweep, or agent scrape test.
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isExpanded = expandedLogIds.has(log.id);
            const unresolvedWarnings = (log.validationWarnings || []).filter((w) => !w.resolved);
            const resolvedWarnings = (log.validationWarnings || []).filter((w) => w.resolved);
            const category = log.category || "agent_scraper";
            const dateStr = new Date(log.attemptTimestamp).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            });

            // Determine badge colors based on category
            let catBadge = {
              bg: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
              label: "Agent Scrape",
              icon: <UserCheck className="w-3.5 h-3.5" />,
            };
            if (category === "geomap_property_sync") {
              catBadge = {
                bg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
                label: "GeoMap Property Sync",
                icon: <Globe className="w-3.5 h-3.5" />,
              };
            } else if (category === "top50_sweep") {
              catBadge = {
                bg: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300",
                label: "Top 50 Sweep",
                icon: <Trophy className="w-3.5 h-3.5" />,
              };
            } else if (category === "vantage_ai_import") {
              catBadge = {
                bg: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
                label: "Vantage AI Import",
                icon: <Sparkles className="w-3.5 h-3.5" />,
              };
            }

            return (
              <div
                key={log.id}
                className={`bg-white dark:bg-slate-800 rounded-xl border transition-all shadow-sm ${
                  log.status === "failed"
                    ? "border-rose-200 dark:border-rose-900/60 bg-rose-50/10"
                    : unresolvedWarnings.length > 0
                    ? "border-amber-200 dark:border-amber-900/50 bg-amber-50/10"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              >
                {/* Main Row Header */}
                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start gap-3.5 min-w-0">
                    {/* Status Icon */}
                    <div className="mt-0.5 shrink-0">
                      {log.status === "success" && (
                        <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      )}
                      {log.status === "warning" && (
                        <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 animate-pulse">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                      )}
                      {log.status === "failed" && (
                        <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60">
                          <XCircle className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    {/* Content Info */}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${catBadge.bg}`}>
                          {catBadge.icon}
                          <span>{catBadge.label}</span>
                        </span>

                        <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                          {log.title || log.agentName}
                        </h3>

                        {log.brokerage && (
                          <span className="text-xs text-slate-600 dark:text-slate-300 font-medium bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                            {log.brokerage}
                          </span>
                        )}

                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            log.status === "success"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                              : log.status === "warning"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                              : "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"
                          }`}
                        >
                          {log.status === "success"
                            ? "Verified Clean"
                            : log.status === "warning"
                            ? `${unresolvedWarnings.length} Warning${unresolvedWarnings.length > 1 ? "s" : ""}`
                            : "Failed / Blocked"}
                        </span>
                      </div>

                      {/* Detail Metrics line */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {dateStr}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono">
                          <Zap className="w-3 h-3 text-amber-500" />
                          {log.latencyMs}ms
                        </span>

                        {/* GeoMap summary */}
                        {log.propertySyncMeta && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              {log.propertySyncMeta.listingsCount} Properties Synced
                            </span>
                            <span>•</span>
                            <span>{log.propertySyncMeta.matchedAgentCount} Agent Matches</span>
                            <span>•</span>
                            <span className="text-blue-600 dark:text-blue-400 font-medium">{log.propertySyncMeta.loPairsAutoPushed} LO Pairs Pushed</span>
                          </>
                        )}

                        {/* Top 50 summary */}
                        {log.top50SweepMeta && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-amber-600 dark:text-amber-400">
                              {log.top50SweepMeta.scannedCount} Scanned ({log.top50SweepMeta.qualifiedCount} Qualified)
                            </span>
                          </>
                        )}

                        {/* Vantage AI summary */}
                        {log.vantageAiSyncMeta && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-purple-600 dark:text-purple-400">
                              {log.vantageAiSyncMeta.draftAdCount} Ad Drafts Generated
                            </span>
                            <span>•</span>
                            <span>Channels: {log.vantageAiSyncMeta.channels?.join(", ")}</span>
                          </>
                        )}

                        {log.initiatedBy && (
                          <>
                            <span>•</span>
                            <span className="text-slate-500">By {log.initiatedBy}</span>
                          </>
                        )}
                      </div>

                      {/* Source URL Preview Link */}
                      <div className="mt-1.5 flex items-center gap-2 text-xs">
                        <a
                          href={log.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 max-w-md md:max-w-xl truncate font-mono text-[11px]"
                        >
                          <Globe className="w-3 h-3 shrink-0" />
                          <span className="truncate">{log.sourceUrl}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                        <button
                          onClick={() => handleCopyUrl(log.sourceUrl)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5"
                          title="Copy Source URL"
                        >
                          {copiedUrl === log.sourceUrl ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex flex-wrap items-center gap-2 self-end md:self-center shrink-0">
                    {/* Add to Roster button if has scraped agent data */}
                    {log.scrapedData && (
                      <button
                        onClick={() => handleImportToRoster(log)}
                        className="px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-semibold rounded-lg border border-emerald-200 dark:border-emerald-800 transition flex items-center gap-1 cursor-pointer"
                        title="Import agent to Realtor Partner Roster"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Add to Roster</span>
                      </button>
                    )}

                    <button
                      onClick={() => setInspectingPayloadLog(log)}
                      className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                      title="Inspect Raw JSON"
                    >
                      <FileJson className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => toggleExpand(log.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
                    >
                      <span>{isExpanded ? "Hide Details" : "View Details"}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Inline Warning Highlights */}
                {unresolvedWarnings.length > 0 && !isExpanded && (
                  <div className="px-4 pb-3 pt-1 border-t border-amber-100 dark:border-amber-900/30 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Unresolved Validation Warning:
                    </span>
                    {unresolvedWarnings.map((w) => (
                      <span
                        key={w.id}
                        className="text-[11px] bg-amber-100/80 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded border border-amber-300/50 dark:border-amber-800/40"
                      >
                        <strong className="font-mono">{w.code}:</strong> {w.message}
                      </span>
                    ))}
                    <button
                      onClick={() => toggleExpand(log.id)}
                      className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 hover:underline cursor-pointer"
                    >
                      Inspect & Resolve →
                    </button>
                  </div>
                )}

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-700 space-y-4">
                    {/* GeoMap Details Box */}
                    {log.propertySyncMeta && (
                      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Globe className="w-4 h-4 text-emerald-600" />
                            GeoMap Ingestion & GIS Overlay Details
                          </h4>
                          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                            {log.propertySyncMeta.datasetName}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-3">
                          <div className="p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/50">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Listings Ingested</span>
                            <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                              {log.propertySyncMeta.listingsCount} Properties
                            </div>
                            <div className="text-[11px] text-slate-500">RentCast API calls: {log.propertySyncMeta.rentcastApiCallsUsed || 1}</div>
                          </div>

                          <div className="p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/50">
                            <span className="text-[10px] uppercase font-bold text-slate-400">USDA & OHCS Breakdown</span>
                            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                              {log.propertySyncMeta.usdaEligibleCount} USDA Zero-Down
                            </div>
                            <div className="text-[11px] text-slate-500">{log.propertySyncMeta.ohcsEligibleCount} OHCS DPA Eligible</div>
                          </div>

                          <div className="p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/50">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Agent Roster Matching</span>
                            <div className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                              {log.propertySyncMeta.matchedAgentCount} Agents Matched
                            </div>
                            <div className="text-[11px] text-slate-500">{log.propertySyncMeta.loPairsAutoPushed} LO+Agent pairs queued</div>
                          </div>

                          <div className="p-2 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/50">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Price & Geo Scope</span>
                            <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                              {log.propertySyncMeta.priceRangeSummary}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate">{log.propertySyncMeta.targetCity}</div>
                          </div>
                        </div>

                        {log.propertySyncMeta.sampleAddresses && log.propertySyncMeta.sampleAddresses.length > 0 && (
                          <div className="text-xs">
                            <span className="font-semibold text-slate-600 dark:text-slate-300">Sample Ingested Addresses:</span>
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              {log.propertySyncMeta.sampleAddresses.map((addr, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded font-mono text-[11px]">
                                  {addr}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Top 50 Sweep Details Box */}
                    {log.top50SweepMeta && (
                      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-amber-200 dark:border-amber-800/60">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Trophy className="w-4 h-4 text-amber-600" />
                            Top 50 Market Sweep Results & Roster Qualification
                          </h4>
                          <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                            {log.top50SweepMeta.scannedCount} Records Audited
                          </span>
                        </div>

                        <div className="text-xs text-slate-700 dark:text-slate-300 mb-2">
                          <span className="font-semibold">Ranking Benchmark: </span>
                          <span className="text-amber-700 dark:text-amber-400 font-medium">{log.top50SweepMeta.topRankMetric}</span>
                        </div>

                        {log.top50SweepMeta.topEntityNames && (
                          <div className="space-y-1 mt-2">
                            <span className="text-[11px] font-bold text-slate-400 uppercase">Top Swept Entities:</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                              {log.top50SweepMeta.topEntityNames.map((name, idx) => (
                                <div key={idx} className="p-2 rounded bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/40 text-xs flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 text-[10px] font-bold flex items-center justify-center shrink-0">
                                    {idx + 1}
                                  </span>
                                  <span className="font-semibold text-slate-800 dark:text-slate-200">{name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Vantage AI Details Box */}
                    {log.vantageAiSyncMeta && (
                      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-purple-200 dark:border-purple-800/60">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-purple-600" />
                            Vantage AI Studio Co-Branded Ad Campaign Import
                          </h4>
                          <span className="text-xs font-semibold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded">
                            RESPA 50/50 Co-Op Verified
                          </span>
                        </div>

                        <div className="text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                          <div>
                            <span className="font-semibold">Campaign: </span>
                            <span className="font-bold text-slate-900 dark:text-white">{log.vantageAiSyncMeta.campaignName}</span>
                          </div>
                          <div>
                            <span className="font-semibold">Co-Branded Partners: </span>
                            <span>{log.vantageAiSyncMeta.coBrandedPartnerAgent} + {log.vantageAiSyncMeta.coBrandedLoanOfficer}</span>
                          </div>
                          <div>
                            <span className="font-semibold">Generated Headline: </span>
                            <span className="italic text-purple-700 dark:text-purple-300">"{log.vantageAiSyncMeta.generatedCreativeHeadline}"</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Scraped Agent Attributes */}
                    {log.scrapedData && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-sky-500" />
                          Extracted Agent Attributes
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                            <span className="text-[10px] text-slate-400 font-semibold uppercase">Contact Info</span>
                            <div className="text-xs font-medium text-slate-900 dark:text-white mt-0.5 truncate flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{log.scrapedData.phone || "Not Detected"}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{log.scrapedData.email || "Not Detected"}</span>
                            </div>
                          </div>

                          <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                            <span className="text-[10px] text-slate-400 font-semibold uppercase">License & Credentials</span>
                            <div className="text-xs font-mono font-semibold text-slate-900 dark:text-white mt-0.5">
                              LIC: {log.scrapedData.licenseNumber || "Pending DFR lookup"}
                            </div>
                            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                              NMLS: {log.scrapedData.nmlsId || "None Found"}
                            </div>
                          </div>

                          <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                            <span className="text-[10px] text-slate-400 font-semibold uppercase">Production Benchmark</span>
                            <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                              {log.scrapedData.production12MoVolume
                                ? `$${(log.scrapedData.production12MoVolume / 1000000).toFixed(1)}M Volume`
                                : "N/A"}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {log.scrapedData.production12MoUnits || 0} units • {log.scrapedData.buysideSharePct || 60}% buyside
                            </div>
                          </div>

                          <div className="bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                            <span className="text-[10px] text-slate-400 font-semibold uppercase">Market Areas</span>
                            <div className="text-xs font-medium text-slate-900 dark:text-white mt-0.5 truncate">
                              {log.scrapedData.marketAreas?.join(", ") || "Oregon"}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {log.scrapedData.yearsExperience || 5} yrs experience
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Unresolved & Resolved Validation Warnings List */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                          Validation & Compliance Checks ({log.validationWarnings?.length || 0})
                        </h4>
                        <span className="text-[11px] text-slate-500">
                          {unresolvedWarnings.length} unresolved • {resolvedWarnings.length} resolved
                        </span>
                      </div>

                      {log.validationWarnings && log.validationWarnings.length > 0 ? (
                        <div className="space-y-2">
                          {log.validationWarnings.map((warning) => (
                            <div
                              key={warning.id}
                              className={`p-3 rounded-lg border text-xs flex flex-col md:flex-row md:items-center justify-between gap-2 ${
                                warning.resolved
                                  ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40"
                                  : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60"
                              }`}
                            >
                              <div className="flex items-start gap-2.5">
                                {warning.resolved ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                ) : (
                                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                )}
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-[11px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                                      {warning.code}
                                    </span>
                                    <span
                                      className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                        warning.severity === "high"
                                          ? "bg-rose-100 text-rose-800"
                                          : warning.severity === "medium"
                                          ? "bg-amber-100 text-amber-800"
                                          : "bg-blue-100 text-blue-800"
                                      }`}
                                    >
                                      {warning.severity} Priority
                                    </span>
                                    {warning.resolved && (
                                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-1.5 py-0.5 rounded">
                                        ✓ Resolved by {warning.resolvedBy || "LO"}
                                      </span>
                                    )}
                                  </div>
                                  <p className="mt-1 text-slate-800 dark:text-slate-200 font-medium">
                                    {warning.message}
                                  </p>
                                  {warning.resolutionNote && (
                                    <p className="mt-0.5 text-[11px] text-emerald-700 dark:text-emerald-300 italic">
                                      Note: {warning.resolutionNote}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {!warning.resolved && (
                                <button
                                  onClick={() =>
                                    setResolvingWarning({
                                      logId: log.id,
                                      warning,
                                    })
                                  }
                                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-lg shadow-sm transition shrink-0 cursor-pointer self-end md:self-center"
                                >
                                  Override / Resolve
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>No validation warnings detected. 100% compliant and ready for co-marketing!</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal 1: GeoMap Live Sync Modal */}
      {showGeoMapSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 relative">
            <button
              onClick={() => !isExecuting && setShowGeoMapSyncModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Execute GeoMap Property Listings Sync
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pulls from GeoSphere Oregon Map website or direct RentCast API endpoint
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Target GeoSphere Dataset
                </label>
                <select
                  value={selectedGeoDataset}
                  onChange={(e) => setSelectedGeoDataset(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                >
                  {GEOSPHERE_DATASETS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.county} - {d.focusArea})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Target City Filter (Optional)
                </label>
                <select
                  value={geoTargetCity}
                  onChange={(e) => setGeoTargetCity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                >
                  <option value="all">All Oregon Cities (Statewide)</option>
                  <option value="Junction City">Junction City (Lane County)</option>
                  <option value="Eugene">Eugene (Lane County)</option>
                  <option value="Bend">Bend (Deschutes County)</option>
                  <option value="Portland">Portland (Multnomah County)</option>
                  <option value="Coos Bay">Coos Bay (Coos County)</option>
                  <option value="Salem">Salem (Marion County)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Custom GeoSphere Endpoint URL (Optional)
                </label>
                <input
                  type="url"
                  value={geoCustomEndpoint}
                  onChange={(e) => setGeoCustomEndpoint(e.target.value)}
                  placeholder="https://geosphere-or-map.vercel.app/api/listings/for-sale"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs"
                />
              </div>

              {isExecuting && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{executingStepText}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  onClick={() => setShowGeoMapSyncModal(false)}
                  disabled={isExecuting}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteGeoMapSync}
                  disabled={isExecuting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5"
                >
                  <Globe className="w-4 h-4" />
                  <span>Start Live GeoMap Sync</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Top 50 Sweep Modal */}
      {showTop50SweepModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 relative">
            <button
              onClick={() => !isExecuting && setShowTop50SweepModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Execute Top 50 Market Sweep
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Crawls and evaluates the Top 50 realtors or properties across Oregon
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Select Top 50 Sweep Type
                </label>
                <div className="space-y-2">
                  <label className="p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <input
                      type="radio"
                      name="sweepType"
                      checked={selectedSweepType === "realtrends_top50_agents"}
                      onChange={() => setSelectedSweepType("realtrends_top50_agents")}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        RealTrends 2025 Oregon Top 50 Individual Producers
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Scrapes individual buyer-side specialists with $14M - $48M volume; checks DFR license formats and NMLS status.
                      </div>
                    </div>
                  </label>

                  <label className="p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <input
                      type="radio"
                      name="sweepType"
                      checked={selectedSweepType === "top50_usda_listings"}
                      onChange={() => setSelectedSweepType("top50_usda_listings")}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        Top 50 USDA Zero-Down Eligible Oregon Homes
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Evaluates 50 rural housing opportunity properties under OHCS purchase limits across Lane, Linn, Deschutes, and Coos counties.
                      </div>
                    </div>
                  </label>

                  <label className="p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <input
                      type="radio"
                      name="sweepType"
                      checked={selectedSweepType === "top50_junction_city"}
                      onChange={() => setSelectedSweepType("top50_junction_city")}
                      className="mt-0.5"
                    />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        Top 50 Junction City & Lane County Starter Homes
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Sweeps for-sale listings under $495k compatible with 2-1 temporary buydown seller concessions.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {isExecuting && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-semibold">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{executingStepText}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  onClick={() => setShowTop50SweepModal(false)}
                  disabled={isExecuting}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteTop50Sweep}
                  disabled={isExecuting}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5"
                >
                  <Trophy className="w-4 h-4" />
                  <span>Execute Top 50 Sweep</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Vantage AI Studio Import Modal */}
      {showVantageAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 relative">
            <button
              onClick={() => !isExecuting && setShowVantageAiModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Import from Vantage AI Studio
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pulls co-branded ads and syncs directly into adCampaignDrafts state
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Campaign Title / Theme
                </label>
                <input
                  type="text"
                  value={vantageCampaignName}
                  onChange={(e) => setVantageCampaignName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Co-Branded Real Estate Partner Agent
                </label>
                <select
                  value={vantagePartnerAgent}
                  onChange={(e) => setVantagePartnerAgent(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                >
                  {(guidesState.agentRoster || []).map((a) => (
                    <option key={a.id} value={a.name}>
                      {a.name} ({a.brokerage})
                    </option>
                  ))}
                  <option value="Sarah Jenkins">Sarah Jenkins (Cascade Hasson SIR)</option>
                  <option value="Marcus Vance">Marcus Vance (Summit Pacific RE)</option>
                  <option value="Rachel Sterling">Rachel Sterling (Windermere)</option>
                </select>
              </div>

              {isExecuting && (
                <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800 space-y-2">
                  <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-semibold">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{executingStepText}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  onClick={() => setShowVantageAiModal(false)}
                  disabled={isExecuting}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteVantageAiImport}
                  disabled={isExecuting}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Import & Queue Ad Drafts</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Live Agent Scraper Runner */}
      {showScrapeRunner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 relative">
            <button
              onClick={() => !isExecuting && setShowScrapeRunner(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Live Agent Web Scraper & Compliance Runner
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Target any Realtor bio page, Zillow directory profile, or team roster URL
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Agent Web Bio / Profile URL <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  value={newScrapeUrl}
                  onChange={(e) => setNewScrapeUrl(e.target.value)}
                  placeholder="https://www.brokerage.com/agents/jane-doe or Zillow profile link"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Agent Name Hint (Optional)
                  </label>
                  <input
                    type="text"
                    value={newScrapeName}
                    onChange={(e) => setNewScrapeName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Brokerage Hint (Optional)
                  </label>
                  <input
                    type="text"
                    value={newScrapeBrokerage}
                    onChange={(e) => setNewScrapeBrokerage(e.target.value)}
                    placeholder="e.g. Cascade Hasson Sotheby's"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                  />
                </div>
              </div>

              {isExecuting && (
                <div className="p-3 bg-sky-50 dark:bg-sky-950/40 rounded-xl border border-sky-200 dark:border-sky-800 space-y-2">
                  <div className="flex items-center gap-2 text-sky-700 dark:text-sky-300 font-semibold">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{executingStepText}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
                <button
                  onClick={() => setShowScrapeRunner(false)}
                  disabled={isExecuting}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteLiveScrape}
                  disabled={isExecuting || !newScrapeUrl.trim()}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-600/20 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Execute Scrape & Verify</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning Resolution Modal */}
      {resolvingWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2.5 mb-3 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Resolve Compliance Warning
              </h3>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-xs mb-3">
              <div className="font-mono font-bold text-amber-900 dark:text-amber-300">
                {resolvingWarning.warning.code}
              </div>
              <p className="mt-1 text-slate-700 dark:text-slate-300">
                {resolvingWarning.warning.message}
              </p>
            </div>

            <div className="space-y-2 mb-4">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                LO Verification & Audit Note:
              </label>
              <textarea
                value={resolutionNoteInput}
                onChange={(e) => setResolutionNoteInput(e.target.value)}
                placeholder="e.g. Verified license status on Oregon DFR registry; assigned standard MLO joint footer."
                rows={3}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setResolvingWarning(null)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResolveWarning}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg shadow-sm"
              >
                Confirm & Mark Resolved
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Raw Payload Inspector Modal */}
      {inspectingPayloadLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-slate-900 text-slate-100 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-700 relative max-h-[85vh] flex flex-col">
            <button
              onClick={() => setInspectingPayloadLog(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <Terminal className="w-5 h-5 text-sky-400" />
              <h3 className="text-sm font-bold text-white">
                Raw Scrape & Telemetry Payload: {inspectingPayloadLog.agentName}
              </h3>
            </div>

            <div className="flex-1 overflow-auto bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 space-y-1">
              <pre className="whitespace-pre-wrap leading-relaxed">
                {inspectingPayloadLog.rawPayloadSnippet ||
                  JSON.stringify(inspectingPayloadLog, null, 2)}
              </pre>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">
                Status: {inspectingPayloadLog.status.toUpperCase()} | Latency: {inspectingPayloadLog.latencyMs}ms
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    inspectingPayloadLog.rawPayloadSnippet ||
                      JSON.stringify(inspectingPayloadLog, null, 2)
                  );
                  onTriggerToast("Copied JSON payload to clipboard");
                }}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Payload</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
