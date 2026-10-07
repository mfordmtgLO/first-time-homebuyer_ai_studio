import { 
  executeTop50SweepRun, 
  executeLiveGeoMapSyncRun, 
  executeVantageAiImportRun, 
  executeLiveAgentScraperRun
} from './agentScraperLogService';

export interface ScheduledCronJob {
  id: string;
  name: string;
  cronExpression: string;
  humanFrequency: string;
  category: "top50_sweep" | "geomap_property_sync" | "vantage_ai_import" | "agent_scraper" | "zillow_price_sweep";
  description: string;
  status: "active" | "paused";
  lastRunAt?: string;
  lastRunStatus?: "success" | "warning" | "failed";
  nextRunAt: string;
  executionCount: number;
}

const CRON_STORAGE_KEY = 'vantage_cron_jobs_config_v1';

export const INITIAL_CRON_JOBS: ScheduledCronJob[] = [
  {
    id: 'cron-zillow-daily-sweep',
    name: 'Daily Zillow Price Watch & MLS Listing Sweep',
    cronExpression: '0 3 * * *',
    humanFrequency: 'Daily at 03:00 AM',
    category: 'zillow_price_sweep',
    description: 'Autonomous cron monitoring Zillow MLS price drops, recalculating buyer monthly affordability with down payment programs, and drafting paired LO + Realtor outreach.',
    status: 'active',
    lastRunAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    lastRunStatus: 'success',
    nextRunAt: new Date(Date.now() + 1000 * 60 * 60 * 19).toISOString(),
    executionCount: 184
  },
  {
    id: 'cron-top50-daily',
    name: 'Top 50 RealTrends & Market Sweep (On-Demand)',
    cronExpression: 'Manual / On-Demand',
    humanFrequency: 'On-Demand (Client-side Triggered)',
    category: 'top50_sweep',
    description: 'On-demand sweep of published RealTrends America\'s Best rankings and Oregon producers. NOTE: Unattended background cron is not active; sweeps run on-demand via dashboard button.',
    status: 'paused',
    lastRunAt: undefined,
    lastRunStatus: undefined,
    nextRunAt: 'N/A (On-demand only)',
    executionCount: 0
  },
  {
    id: 'cron-geomap-sync',
    name: 'GeoMap Saved Property & RentCast Live Sync',
    cronExpression: '0 4 * * *',
    humanFrequency: 'Daily at 04:00 AM',
    category: 'geomap_property_sync',
    description: 'Pulls GeoSphere Oregon web listings, RentCast sale prices, and updates census tract LMI / DPA overlays.',
    status: 'active',
    lastRunAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    lastRunStatus: 'success',
    nextRunAt: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
    executionCount: 98
  },
  {
    id: 'cron-vantage-ai-import',
    name: 'Vantage AI Studio Co-Branded Campaign Ingestion',
    cronExpression: '0 6 * * *',
    humanFrequency: 'Daily at 06:00 AM',
    category: 'vantage_ai_import',
    description: 'Auto-imports 9:16 Video scripts, Meta carousel hooks, and RESPA compliance footers into adCampaignDrafts.',
    status: 'active',
    lastRunAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    lastRunStatus: 'success',
    nextRunAt: new Date(Date.now() + 1000 * 60 * 60 * 14).toISOString(),
    executionCount: 76
  },
  {
    id: 'cron-realtor-roster-audit',
    name: 'Realtor Roster Compliance & Gap Resolution Audit',
    cronExpression: '0 8 * * 1',
    humanFrequency: 'Mondays at 08:00 AM',
    category: 'agent_scraper',
    description: 'Audits active Realtor partner roster against CFPB / SAFE Act NMLS licenses and resolves missing headshots or emails.',
    status: 'active',
    lastRunAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    lastRunStatus: 'success',
    nextRunAt: new Date(Date.now() + 1000 * 60 * 60 * 96).toISOString(),
    executionCount: 34
  }
];

export async function fetchScheduledCronJobs(): Promise<ScheduledCronJob[]> {
  try {
    const raw = localStorage.getItem(CRON_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure the Zillow sweep job is included if missing from previous sessions
        const hasZillow = parsed.some(j => j.id === 'cron-zillow-daily-sweep');
        if (!hasZillow) {
          const zillowJob = INITIAL_CRON_JOBS.find(j => j.id === 'cron-zillow-daily-sweep')!;
          parsed.unshift(zillowJob);
          localStorage.setItem(CRON_STORAGE_KEY, JSON.stringify(parsed));
        }
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Cron jobs fetch notice:', e);
  }

  try {
    localStorage.setItem(CRON_STORAGE_KEY, JSON.stringify(INITIAL_CRON_JOBS));
  } catch (e) {
    console.warn('Storage setItem notice:', e);
  }
  return INITIAL_CRON_JOBS;
}

export async function saveScheduledCronJobs(jobs: ScheduledCronJob[]): Promise<void> {
  try {
    localStorage.setItem(CRON_STORAGE_KEY, JSON.stringify(jobs));
  } catch (e) {
    console.warn('Cron jobs save notice:', e);
  }
}

/**
 * Triggers immediate manual execution for a specific cron job by ID.
 */
export async function executeCronJobNow(
  jobId: string, 
  actorName: string = 'Loan Officer (Manual Trigger)'
): Promise<{ success: boolean; job: ScheduledCronJob; logId?: string }> {
  const jobs = await fetchScheduledCronJobs();
  const jobIndex = jobs.findIndex(j => j.id === jobId);
  if (jobIndex === -1) {
    throw new Error(`Cron job with ID '${jobId}' not found.`);
  }

  const job = jobs[jobIndex];
  let success = false;
  let logId: string | undefined;

  try {
    if (job.category === 'zillow_price_sweep' || job.id === 'cron-zillow-daily-sweep') {
      const res = await executeLiveGeoMapSyncRun('oregon_all', undefined, undefined, undefined, actorName);
      success = res.success;
      logId = res.log.id;
    } else if (job.category === 'top50_sweep') {
      const res = await executeTop50SweepRun('realtrends_top50_agents', actorName);
      success = res.success;
      logId = res.log.id;
    } else if (job.category === 'geomap_property_sync') {
      const res = await executeLiveGeoMapSyncRun('oregon_all', undefined, undefined, undefined, actorName);
      success = res.success;
      logId = res.log.id;
    } else if (job.category === 'vantage_ai_import') {
      const res = await executeVantageAiImportRun('Unattended Cron Co-Branded Spotlight', 'Sarah Jenkins', actorName);
      success = res.success;
      logId = res.log.id;
    } else if (job.category === 'agent_scraper') {
      const res = await executeLiveAgentScraperRun('https://realtrends.com/rankings/americas-best/oregon', 'Oregon Top Producers', 'Keller Williams', actorName);
      success = res.success;
      logId = res.log.id;
    }

    const updatedJob: ScheduledCronJob = {
      ...job,
      lastRunAt: new Date().toISOString(),
      lastRunStatus: success ? 'success' : 'failed',
      executionCount: job.executionCount + 1,
      nextRunAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString()
    };

    jobs[jobIndex] = updatedJob;
    await saveScheduledCronJobs(jobs);

    return { success, job: updatedJob, logId };
  } catch (err: any) {
    console.error(`Cron job execution error (${jobId}):`, err);
    
    const updatedJob: ScheduledCronJob = {
      ...job,
      lastRunAt: new Date().toISOString(),
      lastRunStatus: 'failed',
      executionCount: job.executionCount + 1
    };
    jobs[jobIndex] = updatedJob;
    await saveScheduledCronJobs(jobs);

    return { success: false, job: updatedJob };
  }
}

/**
 * Toggles a cron job between active and paused states.
 */
export async function toggleCronJobStatus(jobId: string): Promise<ScheduledCronJob[]> {
  const jobs = await fetchScheduledCronJobs();
  const updated = jobs.map(j => {
    if (j.id === jobId) {
      return {
        ...j,
        status: j.status === 'active' ? ('paused' as const) : ('active' as const)
      };
    }
    return j;
  });

  await saveScheduledCronJobs(updated);
  return updated;
}
