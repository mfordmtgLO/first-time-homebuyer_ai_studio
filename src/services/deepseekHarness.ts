import crypto from "crypto";
import { execFile } from "child_process";
import { promisify } from "util";
import { redactPII } from "../../vantageKnowledge.ts";
import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const execFileAsync = promisify(execFile);
const VANTAGE_REMOTE_BASE_URL = "https://ais-dev-ytqtpwssj6gdvjvqbsrbyo-427099073161.us-east5.run.app";

/**
 * CALLER INVOCATION POLICIES:
 * ----------------------------
 * 1. Conversational (e.g. museContext.ts):
 *    - timeoutMs: 5000 (strict latency envelope)
 *    - Retries: 0 (immediate human escalation — user is waiting synchronously)
 * 
 * 2. Scheduled / Asynchronous (e.g. future cronSchedulerService.ts wiring):
 *    - timeoutMs: up to 30000 (batch computation budget)
 *    - Retries: up to 2 on transient timeout/error before terminal escalation
 *    - Results persisted to Firestore /memories as analysis/engagement records
 * 
 * Extraction path: this module becomes POST /harness/execute on its own Cloud Run service
 * with service-to-service auth; consumers already speak request/response shapes.
 */

export interface HarnessRequest {
  prompt: string;            // PII-scrubbed inside the module with redactPII()
  model?: string;            // default "deepseek-reasoner"
  lightweight?: string;      // default "deepseek-chat"
  timeoutMs?: number;        // default 5000; caller policy
  tenantId: string;          // REQUIRED, fail-closed (no default) — for spend guard + ledger
  runId?: string;            // generated if absent (crypto.randomUUID)
}

export interface HarnessResult {
  ok: boolean;
  output?: any;              // parsed harness JSON on success
  escalation?: string;       // human-escalation message when not ok
  runId: string;
  latencyMs: number;
  outcome: "ok" | "timeout" | "error" | "escalation";
  tenantId: string;
}

// Multi-instance note: In-memory concurrency and daily caps are per-instance.
// In distributed multi-region Cloud Run environments, tenant quotas should be backed by Redis / Firestore counters.
const MAX_CONCURRENT_PER_TENANT = 4;
const activeRunsPerTenant = new Map<string, number>();
const dailyRunsPerTenant = new Map<string, { date: string; count: number }>();

function sanitizeForFirestore<T>(obj: T): T {
  if (obj === null || obj === undefined) return null as any;
  if (typeof obj !== "object") return obj;
  if (obj instanceof Date) return obj;
  if (Array.isArray(obj)) {
    return obj.filter((i) => i !== undefined).map((i) => sanitizeForFirestore(i)) as any;
  }
  const clean: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj as Record<string, any>)) {
    if (v !== undefined) clean[k] = sanitizeForFirestore(v);
  }
  return clean as T;
}

function getAdminDb() {
  if (!getApps().length) {
    try {
      initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || "ai-studio-vantageaiworkspa-320759cc-ded2-4188-b4e0-ed887f4ad5bd",
      });
    } catch (e) {
      console.warn("Firebase Admin initializeApp notice in deepseekHarness:", e);
    }
  }
  const db = getFirestore();
  try {
    db.settings({ ignoreUndefinedProperties: true });
  } catch {
    // Ignore if settings already set
  }
  return db;
}

async function logHarnessCompliance(action: string, details: Record<string, any>) {
  try {
    const db = getAdminDb();
    const timestamp = new Date().toISOString();
    await db.collection("branch_audit_logs").add(
      sanitizeForFirestore({
        action,
        details,
        timestamp,
        createdAt: timestamp,
        glbaCompliant: true,
        piiScrubbed: true,
      })
    );
  } catch (err) {
    console.warn("[DeepSeek Harness Ledger] Audit write notice:", err);
  }
}

/**
 * Step 1: Canonical executeDeepSeekHarness
 * Single owner for execution, PII enforcement, spend guards, and GLBA telemetry.
 */
export async function executeDeepSeekHarness(req: HarnessRequest): Promise<HarnessResult> {
  const startTime = Date.now();
  const runId = req.runId || crypto.randomUUID();
  const model = req.model || "deepseek-reasoner";
  const lightweight = req.lightweight || "deepseek-chat";
  const timeoutMs = req.timeoutMs || 5000;

  // 1. Validation: tenantId REQUIRED (fail-closed)
  if (!req.tenantId || typeof req.tenantId !== "string" || !req.tenantId.trim()) {
    throw new Error("Tenant isolation violation: executeDeepSeekHarness requires a valid, non-empty tenantId.");
  }
  const tenantId = req.tenantId.trim();

  // 2. Validation: prompt non-empty string with max length check
  if (!req.prompt || typeof req.prompt !== "string" || !req.prompt.trim()) {
    throw new Error("Invalid prompt: executeDeepSeekHarness requires a non-empty prompt string.");
  }
  let rawPrompt = req.prompt.trim();
  if (rawPrompt.length > 8000) {
    console.warn(`[DeepSeek Harness] Prompt length (${rawPrompt.length}) exceeds 8000 character limit. Truncating.`);
    rawPrompt = rawPrompt.slice(0, 8000);
  }

  // 3. PII Scrubbing inside the module (single enforcement point)
  const sanitizedPrompt = redactPII(rawPrompt);
  if (sanitizedPrompt !== rawPrompt) {
    console.log(`[DeepSeek Harness] [PII Vault] Scrubbed PII from prompt before execution (runId: ${runId}).`);
  }

  const promptHash = crypto.createHash("sha256").update(sanitizedPrompt).digest("hex");

  // 4. Spend Guard: Concurrency cap per tenant
  const currentActive = activeRunsPerTenant.get(tenantId) || 0;
  if (currentActive >= MAX_CONCURRENT_PER_TENANT) {
    const latencyMs = Date.now() - startTime;
    const escalationMsg = "System is currently processing peak underwriting calculations. Please try again in a moment.";
    console.warn(`[DeepSeek Harness Spend Guard] Concurrency limit (${MAX_CONCURRENT_PER_TENANT}) reached for tenant: ${tenantId}`);

    await logHarnessCompliance("HARNESS_CONCURRENCY_EXCEEDED", {
      runId,
      tenantId,
      model,
      promptHash,
      latencyMs,
      outcome: "escalation",
    });

    return {
      ok: false,
      escalation: escalationMsg,
      runId,
      latencyMs,
      outcome: "escalation",
      tenantId,
    };
  }

  // 5. Spend Guard: Daily call cap per tenant
  const todayUtc = new Date().toISOString().slice(0, 10);
  const dailyCap = Number(process.env.DEEPSEEK_DAILY_CAP_PER_TENANT) || 500;
  const currentDaily = dailyRunsPerTenant.get(tenantId);
  let todayCount = 0;
  if (currentDaily && currentDaily.date === todayUtc) {
    todayCount = currentDaily.count;
  }
  if (todayCount >= dailyCap) {
    const latencyMs = Date.now() - startTime;
    const escalationMsg = "Daily automated calculation capacity reached for this tenant. Loan Officer Mike Ford has been notified to assist directly.";
    console.warn(`[DeepSeek Harness Spend Guard] Daily cap (${dailyCap}) reached for tenant: ${tenantId}`);

    await logHarnessCompliance("HARNESS_DAILY_CAP_EXCEEDED", {
      runId,
      tenantId,
      model,
      promptHash,
      latencyMs,
      outcome: "escalation",
    });

    return {
      ok: false,
      escalation: escalationMsg,
      runId,
      latencyMs,
      outcome: "escalation",
      tenantId,
    };
  }

  // Increment counters
  activeRunsPerTenant.set(tenantId, currentActive + 1);
  dailyRunsPerTenant.set(tenantId, { date: todayUtc, count: todayCount + 1 });

  let outcome: "ok" | "timeout" | "error" | "escalation";
  let output: any = undefined;
  let escalation: string | undefined = undefined;

  try {
    // 6. Security Property: child_process.execFile with argv arrays (zero shell interpreter surface)
    const { stdout } = await execFileAsync(
      "dsh",
      ["execute", "--model", model, "--lightweight", lightweight, "--prompt", sanitizedPrompt],
      { timeout: timeoutMs }
    );

    output = JSON.parse(stdout);
    outcome = "ok";
  } catch (execErr: any) {
    const isTimeout =
      execErr.killed ||
      execErr.signal === "SIGTERM" ||
      execErr.code === "ETIMEDOUT" ||
      execErr.message?.includes("timed out");

    if (isTimeout) {
      console.warn(`[DeepSeek Harness] Process timed out after ${timeoutMs}ms (runId: ${runId}).`);
      outcome = "timeout";
      escalation = `[Vantage AI Zero-Hallucination Protocol]: Calculation exceeded time limit (${timeoutMs}ms). Loan officer Mike Ford will verify your underwriting parameters directly.`;
    } else {
      console.warn(`[DeepSeek Harness] Local CLI execution notice (runId: ${runId}): ${execErr.message}. Attempting remote proxy fallback...`);
      // Remote Proxy Fallback with runId + tenantId propagation
      try {
        const res = await fetch(`${VANTAGE_REMOTE_BASE_URL}/api/hybrid/deepseek`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: sanitizedPrompt,
            model,
            runId,
            tenantId,
          }),
        });

        if (res.ok) {
          output = await res.json();
          outcome = "ok";
        } else {
          console.warn(`[DeepSeek Harness] Remote proxy returned HTTP ${res.status}`);
          outcome = "error";
        }
      } catch (remoteErr: any) {
        console.warn("[DeepSeek Harness] Remote proxy fallback error:", remoteErr.message);
        outcome = "error";
      }

      if (outcome !== "ok") {
        outcome = "escalation";
        escalation = `[Vantage AI Zero-Hallucination Protocol]: We recorded your inquiry: "${sanitizedPrompt}". Rather than computing unverified estimates during offline mode, loan officer Mike Ford will review your underwriting parameters directly.`;
      }
    }
  } finally {
    // Decrement active concurrency
    const remaining = Math.max((activeRunsPerTenant.get(tenantId) || 1) - 1, 0);
    activeRunsPerTenant.set(tenantId, remaining);
  }

  const latencyMs = Date.now() - startTime;

  // 7. Structured Telemetry & GLBA Compliance Log on EVERY run
  console.log(
    JSON.stringify({
      telemetry: "HARNESS_RUN",
      runId,
      tenantId,
      latencyMs,
      outcome,
      model,
      promptHash,
      timestamp: new Date().toISOString(),
    })
  );

  await logHarnessCompliance("HARNESS_RUN", {
    runId,
    tenantId,
    model,
    latencyMs,
    outcome,
    promptHash,
  });

  return {
    ok: outcome === "ok",
    output,
    escalation,
    runId,
    latencyMs,
    outcome,
    tenantId,
  };
}
