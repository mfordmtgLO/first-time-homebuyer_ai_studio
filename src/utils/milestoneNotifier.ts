import { 
  MilestoneEmailAlertSettings, 
  MilestoneNotificationHistoryItem, 
  RoadmapMilestone, 
  FinancialProfile, 
  PropertyListing, 
  LoanOfficerProfile, 
  RealEstateAgentProfile 
} from "../types";

const STORAGE_KEY = "manus_milestone_email_settings_v1";

export const DEFAULT_MILESTONE_EMAIL_SETTINGS: MilestoneEmailAlertSettings = {
  enabled: true,
  recipientEmail: "fordmj@gmail.com",
  recipientName: "Mike Ford",
  includeProperties: true,
  includeNextSteps: true,
  includeFinancialSnapshot: true,
  history: []
};

export const getMilestoneAlertSettings = (): MilestoneEmailAlertSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_MILESTONE_EMAIL_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_MILESTONE_EMAIL_SETTINGS,
      ...parsed,
      history: Array.isArray(parsed.history) ? parsed.history : []
    };
  } catch (err) {
    console.warn("Failed to load milestone email alert settings from localStorage:", err);
    return DEFAULT_MILESTONE_EMAIL_SETTINGS;
  }
};

export const saveMilestoneAlertSettings = (
  settings: MilestoneEmailAlertSettings
): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    // Dispatch local event so UI components stay in sync
    window.dispatchEvent(new CustomEvent("manus-milestone-settings-changed", { detail: settings }));
  } catch (err) {
    console.error("Failed to save milestone email settings:", err);
  }
};

export interface TriggerMilestoneParams {
  milestone: RoadmapMilestone;
  profile: FinancialProfile;
  milestones: RoadmapMilestone[];
  properties?: PropertyListing[];
  loanOfficer?: LoanOfficerProfile;
  activeAgent?: RealEstateAgentProfile;
  overrideEmail?: string;
  isTest?: boolean;
}

export interface MilestoneNotificationResult {
  success: boolean;
  email?: {
    recipientEmail: string;
    recipientName?: string;
    subject: string;
    sentAt: string;
    textBody?: string;
    htmlBody?: string;
    milestoneId: string;
    milestoneTitle: string;
    stepNumber: number;
    progressPercent: number;
  };
  error?: string;
  historyItem?: MilestoneNotificationHistoryItem;
}

export const triggerMilestoneEmailNotification = async (
  params: TriggerMilestoneParams
): Promise<MilestoneNotificationResult> => {
  const currentSettings = getMilestoneAlertSettings();
  const targetEmail = (params.overrideEmail || currentSettings.recipientEmail || "fordmj@gmail.com").trim();

  if (!targetEmail || !targetEmail.includes("@")) {
    return {
      success: false,
      error: "No valid recipient email address configured."
    };
  }

  // Calculate current progress
  const allTasks = params.milestones.flatMap(m => m.tasks || []);
  const completedTasks = allTasks.filter(t => t.done).length;
  const totalTasks = allTasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  try {
    const response = await fetch("/api/share/email-milestone-trigger", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        recipientEmail: targetEmail,
        recipientName: currentSettings.recipientName || targetEmail.split("@")[0],
        milestone: params.milestone,
        profile: params.profile,
        milestones: params.milestones,
        properties: currentSettings.includeProperties ? (params.properties || []).slice(0, 5) : [],
        loanOfficer: params.loanOfficer,
        activeAgent: params.activeAgent,
        isTest: !!params.isTest,
        settings: {
          includeProperties: currentSettings.includeProperties,
          includeNextSteps: currentSettings.includeNextSteps,
          includeFinancialSnapshot: currentSettings.includeFinancialSnapshot
        }
      })
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || "Failed to trigger milestone notification");
    }

    const historyItem: MilestoneNotificationHistoryItem = {
      id: "notif-" + Date.now(),
      milestoneId: params.milestone.id,
      milestoneTitle: params.milestone.title,
      stepNumber: params.milestone.stepNumber,
      sentAt: new Date().toISOString(),
      recipientEmail: targetEmail,
      progressPercent,
      subject: data.email?.subject || `🎉 Milestone Achieved: Step ${params.milestone.stepNumber}: ${params.milestone.title}`,
      status: params.isTest ? "simulated" : "sent"
    };

    // Update settings with new history item and last notified tracking
    const updatedSettings: MilestoneEmailAlertSettings = {
      ...currentSettings,
      lastNotifiedMilestoneId: params.milestone.id,
      lastNotifiedAt: historyItem.sentAt,
      history: [historyItem, ...(currentSettings.history || [])].slice(0, 20)
    };
    saveMilestoneAlertSettings(updatedSettings);

    // Dispatch global toast event
    window.dispatchEvent(
      new CustomEvent("manus-milestone-email-sent", {
        detail: {
          milestone: params.milestone,
          recipientEmail: targetEmail,
          historyItem,
          isTest: params.isTest
        }
      })
    );

    return {
      success: true,
      email: data.email,
      historyItem
    };
  } catch (err: any) {
    console.error("Milestone notification trigger error:", err);
    return {
      success: false,
      error: err.message || "Failed to dispatch milestone notification email"
    };
  }
};
