import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  onSnapshot 
} from "firebase/firestore";
import { db } from "../firebase";
import { 
  DailyPulseEntry, 
  DailyPulsePhase, 
  WeeklyPulseEntry, 
  MonthlyHorizonPulseEntry,
  DailySalesManagerCritique,
  RatioCritiqueTier 
} from "../types";

const DAILY_COLLECTION = "daily_pulses";
const WEEKLY_COLLECTION = "weekly_pulses";
const MONTHLY_COLLECTION = "monthly_pulses";

/**
 * Calculates the ISO-8601 week number and year for a date.
 */
export function getISOWeekInfo(d: Date = new Date()): { year: number; week: number } {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  const week = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  return { year: target.getFullYear(), week };
}

/**
 * Gets start (Monday) and end (Sunday) dates formatted as YYYY-MM-DD for a week
 */
export function getWeekDateRange(d: Date = new Date()): { startDate: string; endDate: string; label: string } {
  const current = new Date(d);
  const day = current.getDay();
  const diffToMonday = current.getDate() - day + (day === 0 ? -6 : 1);
  
  const monday = new Date(current.setDate(diffToMonday));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const startStr = monday.toISOString().split("T")[0];
  const endStr = sunday.toISOString().split("T")[0];
  const startMonth = monday.toLocaleString('default', { month: 'short' });
  const endMonth = sunday.toLocaleString('default', { month: 'short' });
  
  const label = startMonth === endMonth 
    ? `${startMonth} ${monday.getDate()} – ${sunday.getDate()}, ${monday.getFullYear()}`
    : `${startMonth} ${monday.getDate()} – ${endMonth} ${sunday.getDate()}, ${monday.getFullYear()}`;

  return { startDate: startStr, endDate: endStr, label };
}

/**
 * Generates a consistent document ID for a loan officer's pulse for a given date and phase.
 */
export function getDailyPulseDocId(loId: string, date: string, phase: DailyPulsePhase): string {
  return `pulse_${loId}_${date}_${phase}`;
}

/**
 * Generates a consistent document ID for a loan officer's weekly pulse.
 */
export function getWeeklyPulseDocId(loId: string, year: number, week: number): string {
  return `weekly_${loId}_${year}_W${week}`;
}

/**
 * Generates a consistent document ID for a loan officer's 30-day monthly horizon pulse.
 */
export function getMonthlyHorizonDocId(loId: string, yearMonth: string): string {
  return `monthly_${loId}_${yearMonth}`;
}

/**
 * Retrieves the most recent prior DailyPulse for an LO (e.g. yesterday's end_of_day or prior phase)
 * to provide continuous handoff memory and context to the sales coach.
 */
export async function fetchLatestPriorPulse(loId: string, currentDate: string): Promise<DailyPulseEntry | null> {
  try {
    const q = query(
      collection(db, DAILY_COLLECTION),
      where("loId", "==", loId),
      orderBy("timestamp", "desc"),
      limit(8)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    // Return the first pulse that is from a prior date or earlier timestamp
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data() as DailyPulseEntry;
      if (data.date < currentDate || (data.date === currentDate && data.timePhase === "end_of_day")) {
        return data;
      }
    }

    return snapshot.docs[0].data() as DailyPulseEntry;
  } catch (err) {
    console.warn("DailyPulseService: Failed to fetch prior daily pulse from Firestore:", err);
    return null;
  }
}

/**
 * Fetches a specific DailyPulse for a loan officer by date and phase.
 */
export async function fetchDailyPulse(
  loId: string, 
  date: string, 
  phase: DailyPulsePhase
): Promise<DailyPulseEntry | null> {
  try {
    const docId = getDailyPulseDocId(loId, date, phase);
    const docRef = doc(db, DAILY_COLLECTION, docId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as DailyPulseEntry;
    }
    return null;
  } catch (err) {
    console.warn(`DailyPulseService: Failed to fetch pulse ${loId}/${date}/${phase}:`, err);
    return null;
  }
}

/**
 * Saves or updates a DailyPulse entry in Firestore and mirrors it in localStorage.
 */
export async function saveDailyPulse(pulse: DailyPulseEntry): Promise<void> {
  try {
    const docId = pulse.id || getDailyPulseDocId(pulse.loId, pulse.date, pulse.timePhase);
    const docRef = doc(db, DAILY_COLLECTION, docId);

    await setDoc(docRef, {
      ...pulse,
      id: docId,
      timestamp: pulse.timestamp || new Date().toISOString()
    }, { merge: true });

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`lo_daily_pulse_${pulse.loId}_${pulse.date}_${pulse.timePhase}`, JSON.stringify(pulse));
        localStorage.setItem(`lo_daily_pulse_latest_${pulse.loId}`, JSON.stringify(pulse));
      } catch {
        // ignore
      }
    }
  } catch (err) {
    console.error("DailyPulseService: Error saving pulse to Firestore:", err);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`lo_daily_pulse_${pulse.loId}_${pulse.date}_${pulse.timePhase}`, JSON.stringify(pulse));
      } catch {
        // ignore
      }
    }
  }
}

/**
 * Fetches recent pulses for an LO (e.g. for calculating consistency streaks or historical audit)
 */
export async function fetchRecentPulses(loId: string, maxCount = 35): Promise<DailyPulseEntry[]> {
  try {
    const q = query(
      collection(db, DAILY_COLLECTION),
      where("loId", "==", loId),
      orderBy("timestamp", "desc"),
      limit(maxCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data() as DailyPulseEntry);
  } catch (err) {
    console.warn("DailyPulseService: Failed to fetch recent pulses:", err);
    return [];
  }
}

/**
 * Subscribes to real-time updates for today's current phase pulse
 */
export function subscribeToDailyPulse(
  loId: string,
  date: string,
  phase: DailyPulsePhase,
  callback: (pulse: DailyPulseEntry | null) => void
): () => void {
  const docId = getDailyPulseDocId(loId, date, phase);
  const docRef = doc(db, DAILY_COLLECTION, docId);

  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        callback(snap.data() as DailyPulseEntry);
      } else {
        callback(null);
      }
    },
    (err) => {
      console.warn("DailyPulseService: onSnapshot error:", err);
      callback(null);
    }
  );
}

// ==========================================
// WEEK-TO-WEEK PERSISTENCE & RESPONSE LOGIC
// ==========================================

/**
 * Saves a weekly pulse review to Firestore and local storage.
 */
export async function saveWeeklyPulse(pulse: WeeklyPulseEntry): Promise<void> {
  try {
    const docId = pulse.id || getWeeklyPulseDocId(pulse.loId, pulse.year, pulse.weekNumber);
    const docRef = doc(db, WEEKLY_COLLECTION, docId);

    await setDoc(docRef, {
      ...pulse,
      id: docId,
      timestamp: pulse.timestamp || new Date().toISOString()
    }, { merge: true });

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`lo_weekly_pulse_${pulse.loId}_${pulse.year}_W${pulse.weekNumber}`, JSON.stringify(pulse));
        localStorage.setItem(`lo_weekly_pulse_latest_${pulse.loId}`, JSON.stringify(pulse));
      } catch {
        // ignore
      }
    }
  } catch (err) {
    console.error("DailyPulseService: Error saving weekly pulse:", err);
  }
}

/**
 * Fetches a weekly pulse by year and week number.
 */
export async function fetchWeeklyPulse(
  loId: string,
  year: number,
  week: number
): Promise<WeeklyPulseEntry | null> {
  try {
    const docId = getWeeklyPulseDocId(loId, year, week);
    const docRef = doc(db, WEEKLY_COLLECTION, docId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as WeeklyPulseEntry;
    }
    return null;
  } catch (err) {
    console.warn(`DailyPulseService: Failed to fetch weekly pulse ${loId}/${year}/W${week}:`, err);
    return null;
  }
}

/**
 * Fetches the immediately preceding week's pulse for week-over-week comparative variance analysis.
 */
export async function fetchLatestPriorWeeklyPulse(
  loId: string,
  currentYear: number,
  currentWeek: number
): Promise<WeeklyPulseEntry | null> {
  try {
    const prevWeek = currentWeek > 1 ? currentWeek - 1 : 52;
    const prevYear = currentWeek > 1 ? currentYear : currentYear - 1;
    return await fetchWeeklyPulse(loId, prevYear, prevWeek);
  } catch (err) {
    console.warn("DailyPulseService: Failed to fetch prior weekly pulse:", err);
    return null;
  }
}

// ========================================================
// 30-DAY LOOKBACK & LOOKFORWARD MONTHLY HORIZON PERSISTENCE
// ========================================================

/**
 * Saves a 30-day lookback retrospective & lookforward production roadmap to Firestore.
 */
export async function saveMonthlyHorizonPulse(horizon: MonthlyHorizonPulseEntry): Promise<void> {
  try {
    const docId = horizon.id || getMonthlyHorizonDocId(horizon.loId, horizon.month);
    const docRef = doc(db, MONTHLY_COLLECTION, docId);

    await setDoc(docRef, {
      ...horizon,
      id: docId,
      timestamp: horizon.timestamp || new Date().toISOString()
    }, { merge: true });

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`lo_monthly_horizon_${horizon.loId}_${horizon.month}`, JSON.stringify(horizon));
        localStorage.setItem(`lo_monthly_horizon_latest_${horizon.loId}`, JSON.stringify(horizon));
      } catch {
        // ignore
      }
    }
  } catch (err) {
    console.error("DailyPulseService: Error saving monthly horizon pulse:", err);
  }
}

/**
 * Fetches a monthly horizon pulse by yearMonth (e.g. "2026-09").
 */
export async function fetchMonthlyHorizonPulse(
  loId: string,
  yearMonth: string
): Promise<MonthlyHorizonPulseEntry | null> {
  try {
    const docId = getMonthlyHorizonDocId(loId, yearMonth);
    const docRef = doc(db, MONTHLY_COLLECTION, docId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as MonthlyHorizonPulseEntry;
    }
    return null;
  } catch (err) {
    console.warn("DailyPulseService: Failed to fetch monthly pulse:", err);
    return null;
  }
}

// ============================================================================
// SALES MANAGER RATIO-DRIVEN RESPONSE LOGIC & CONSTRUCTIVE CRITIQUE ENGINE
// ============================================================================

export interface DailyReviewPayload {
  loProfile?: { name?: string; id?: string };
  timePhase: DailyPulsePhase;
  currentTimeString?: string;
  completedTasks: string[];
  pendingTasks: string[];
  stats?: {
    leadsCount?: number;
    hotLeadsCount?: number;
    candidatesCount?: number;
    pairingsCount?: number;
    recentTouchesCount?: number;
  };
  isAdmin?: boolean;
  priorPulse?: DailyPulseEntry | null;
}

/**
 * Evaluates the actual task-to-goal ratio and returns empathetic, high-energy Sales Manager critique.
 * Avoids generic platitudes; delivers constructive critique, diagnostic root cause, and an immediate tactical pivot.
 */
export function evaluateTaskToGoalRatio(
  completed: number,
  total: number,
  phase: DailyPulsePhase,
  timeString?: string
): DailySalesManagerCritique {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const ratioLabel = `${completed} of ${total} Goals (${pct}%)`;
  const time = timeString || "Current Shift";

  if (completed === 0) {
    return {
      ratioTier: 'zero_reset',
      ratioLabel,
      tone: 'Candid & Empathetic Reality Check',
      diagnosis: phase === 'morning'
        ? "The morning shift is rolling, but sitting at 0% means you haven't taken offensive control of your board yet. Early inbox triage and fire-fighting will devour your day if you don't take charge right now."
        : phase === 'midday'
        ? `Midday reality check (${time}): 0 on the board. You've likely spent 3+ hours reacting to incoming lender emails, processor conditions, or title hiccups. Busy is NOT productive; your origination pipeline is currently starved.`
        : phase === 'afternoon'
        ? `Afternoon audit (${time}): 0 of ${total} completed. Let's be real: you are behind pace. Reactive administrative noise crowded out proactive revenue outreach. But beating yourself up earns $0 in commission.`
        : `End-of-day audit (${time}): 0 of ${total} checklist items checked off. The day slipped away into reactive fires. Let's diagnose the gap honestly without defeatism, reset the board, and salvage our standard for tomorrow.`,
      tacticalPivot: phase === 'morning'
        ? "Close your email tab immediately. Pick up the phone and dial your top 2 purchase buyer leads before 11:00 AM sharp."
        : phase === 'midday'
        ? "The Emergency Rule of 2: Drop all administrative items. Text your top Realtor partner (Sarah Jenkins or Marcus Vance) for coffee and call 1 hot pre-approved buyer immediately."
        : phase === 'afternoon'
        ? "The 3:30 PM Pivot: One live pre-approval consult or lock recommendation redeems this entire day. Call your warmest CRM lead before they leave work."
        : "The 5-Minute EOD Reset: Send 1 high-intent text to a top agent partner right now and queue tomorrow's top 2 calls for 9:00 AM.",
      accountabilityCheck: "In mortgage origination, 0% on the board is forgivable ONLY if you made 10 live outbound calls and put out client emergencies. If you let passive busywork steal your day, own the critique, fix it, and attack tomorrow.",
      conversionMathNote: "One converted purchase pre-approval generates ~$4,500+ in commission — that completely out-values 5 routine admin checkboxes."
    };
  }

  if (pct < 40) {
    return {
      ratioTier: 'lagging_triage',
      ratioLabel,
      tone: 'Urgent High-Energy Triage',
      diagnosis: `You've converted ${completed} of ${total} targets (${pct}%). That's a lagging task-to-goal pace. You knocked out the easy, low-friction task, but the high-leverage revenue calls are still sitting untouched. Rolling tasks over is how backlogs become pipeline deal-killers.`,
      tacticalPivot: "Ruthless Triage: Discard the low-yield admin friction. Focus 100% of your next 45 minutes on the single task that directly drives purchase volume or clears an underwriting closing condition.",
      accountabilityCheck: "A 20-35% completion rate means you're on defense. Let's shift back to offense right now. High-energy outreach beats passive processing every single time.",
      conversionMathNote: "Converting 1 pending warm lead today moves an estimated $350k-$450k loan file into processing."
    };
  }

  if (pct < 70) {
    return {
      ratioTier: 'mid_flight_bubble',
      ratioLabel,
      tone: 'Anti-Complacency Surge',
      diagnosis: `You're sitting at ${completed} of ${total} (${pct}%). You're right on the bubble. Average loan officers hit 50%, feel a false sense of security, and coast into the afternoon slump. Halfway through your goals means you're pacing for average volume, not top-producer results.`,
      tacticalPivot: "Step on the gas: Power through the 2:00 PM lull. Clear your pending loan condition, then immediately leverage that forward momentum to dispatch a property buydown scenario to an active agent partner.",
      accountabilityCheck: "Don't leave the remaining 40% on the table. The difference between a $15M producer and a $40M producer is what happens between 1:30 PM and 4:30 PM.",
      conversionMathNote: "Closing out the remaining tasks protects 2 upcoming closing dates and locks in partner referral trust."
    };
  }

  if (pct < 100) {
    return {
      ratioTier: 'high_tempo',
      ratioLabel,
      tone: 'Top-Producer Momentum & Stretch Challenge',
      diagnosis: `Outstanding execution: ${completed} of ${total} targets checked (${pct}%). You've displayed elite operational discipline today. But here is the sales manager challenge: do NOT coast into the clubhouse. When your task-to-goal ratio is high, your confidence is peak.`,
      tacticalPivot: "The Top 1% Stretch Call: Capitalize on today's winning energy right now. Dial that A-list real estate agent you've hesitated to call, or ask your active pre-approved buyer for 2 friend referrals before you log off.",
      accountabilityCheck: "Winners don't stop when they're tired or satisfied; winners stop when they've capitalized on every ounce of momentum.",
      conversionMathNote: "Outbound calls made while in a high-momentum state convert at a 40% higher rate due to vocal confidence."
    };
  }

  // 100%
  return {
    ratioTier: 'championship_pace',
    ratioLabel,
    tone: 'Championship Standard & Forward Stacking',
    diagnosis: `Flawless board: ${total} of ${total} targets crushed (100%). You executed the playbook without excuses or delays. But the top producer trap after a 100% day is waking up tomorrow with zero momentum.`,
    tacticalPivot: "Tomorrow's Launchpad: Take 4 minutes right now to queue tomorrow morning's top 2 revenue-generating phone calls in your CRM before closing your laptop. Start tomorrow at 60 MPH.",
    accountabilityCheck: "Great producers celebrate today's 100% win, but legends protect the standard again tomorrow morning.",
    conversionMathNote: "Maintaining a 90%+ daily completion cadence compounds into 3x higher funded loan volume quarter-over-quarter."
  };
}

/**
 * Generates a full DailyReviewData response adopting the empathetic, high-energy Sales Manager tone,
 * thoroughly grounded in the actual task-to-goal ratio and providing constructive critique.
 */
export function generateSalesManagerDailyReview(payload: DailyReviewPayload) {
  const loName = payload.loProfile?.name || "Mike Ford";
  const phase = payload.timePhase || "morning";
  const timeStr = payload.currentTimeString || "10:00 AM";
  const completedList = Array.isArray(payload.completedTasks) ? payload.completedTasks : [];
  const pendingList = Array.isArray(payload.pendingTasks) ? payload.pendingTasks : [];
  const completed = completedList.length;
  const pending = pendingList.length;
  const total = completed + pending;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isAdmin = Boolean(payload.isAdmin);

  const critique = evaluateTaskToGoalRatio(completed, total, phase, timeStr);

  let headline = "";
  let motivationalBadge = "";
  let whatDoneSummary = "";
  let managerPerspective = "";
  let topProducerTip = {
    headline: "Top Producer Rule of 2",
    advice: "Pick the single hottest buyer lead and 1 top realtor partner. Converting those two turns any off-track day into a high-income day.",
    focusOutcome: "Lock in 1 realtor coffee or 1 buyer credit review."
  };
  let topPriorities: string[] = [];
  let coachingQuote = "";
  let nextActionRecommendation = {
    tabId: "leads",
    actionTitle: "Direct Outreach to Hot Buyer",
    actionReason: "A live conversation immediately flips your daily rhythm and momentum."
  };

  if (completed === 0) {
    headline = `${phase === 'morning' ? 'Morning Kickoff & Alignment' : phase === 'midday' ? 'Midday Reality Check & Reset' : phase === 'afternoon' ? 'Afternoon Power Pivot' : 'End-of-Day Candid Review'} (${timeStr})`;
    motivationalBadge = `Actual Ratio: 0 of ${total} Goals Completed (0%) — ${critique.tone}!`;
    whatDoneSummary = `Audit: 0 of ${total} checklist goals completed (${pct}% ratio). You're currently behind pace on daily objectives, but there is still time to take offensive control.`;
    managerPerspective = `Listen to me, ${loName}: Seeing 0 out of ${total} on the board is tough, but I've been in the trenches and I know what happens—underwriters drop conditions, borrowers panic about rates, and your whole morning gets hijacked. Here's the straight critique: If you spend all day on defense, your pipeline starves in 30 days. Let's stop the bleeding right now. You don't need to finish all ${total} tasks; you need ONE high-leverage revenue win to turn this entire shift into a $4,500+ victory.`;
    topProducerTip = {
      headline: phase === 'morning' ? "The First 90-Minute Rule" : phase === 'afternoon' ? "The 3:30 PM Emergency Two-Step" : "The Emergency Rule of 2",
      advice: "Drop all administrative spreadsheets and condition cleanup for the next 45 minutes. Dial your hottest purchase buyer lead and text a top listing agent for coffee. One live conversation saves your shift.",
      focusOutcome: "Secure 1 live borrower consultation or 1 realtor coffee meeting."
    };
    topPriorities = [
      "Call your #1 hottest CRM buyer lead immediately to structure an updated pre-approval.",
      "Send a quick personal text to Realtor partner (Sarah Jenkins or Marcus Vance) for a coffee sync.",
      isAdmin 
        ? "Check branch loan routing for stagnant incoming inquiries." 
        : "Clear the single most urgent underwriting file condition before 4:30 PM."
    ];
    coachingQuote = "Top producers don't fret about a slow morning — they adjust the target, take 2 high-impact revenue actions, and finish strong.";
    nextActionRecommendation = {
      tabId: "leads",
      actionTitle: "Call #1 Priority Hot Buyer",
      actionReason: "Converting one hot buyer to an active application makes today an absolute victory."
    };
  } else if (pct < 40) {
    headline = `${phase === 'afternoon' ? 'Afternoon Sprint & Triage' : 'Midday Triage & Momentum Check'} (${timeStr})`;
    motivationalBadge = `Actual Ratio: ${completed} of ${total} Goals Completed (${pct}%) — Triage Mode!`;
    whatDoneSummary = `Mid-shift review: ${completed} of ${total} targets completed (${pct}% ratio). You have points on the board, but you're lagging behind standard production velocity.`;
    managerPerspective = `${loName}, let's look at the numbers: ${completed} of ${total} is progress, but you're falling behind pace. Here's the constructive critique: You knocked out the easy admin item, but you're hesitating on the tough outbound calls. Rolling 3-4 tasks over to tomorrow creates compounding pipeline drag. You've got the skill and the pipeline—now let's bring the energy. Cut the busywork and hunt down the one high-yield conversion right now.`;
    topProducerTip = {
      headline: "Cut the Low-Yield Friction",
      advice: "Never let routine email replies substitute for originator prospecting. Spend the next hour exclusively on calls that generate 1003 loan applications.",
      focusOutcome: "Submit remaining condition documents or issue an active pre-approval."
    };
    topPriorities = [
      "Clear priority conditions on files currently in underwriting review.",
      "Connect with active Realtor partner on weekend open house co-marketing.",
      isAdmin 
        ? "Review loan officer candidate outreach pipeline." 
        : "Run 2-1 buydown cost analysis on listing properties with recent price adjustments."
    ];
    coachingQuote = "You don't need more hours in the day; you need more intensity in the hours you have left.";
    nextActionRecommendation = {
      tabId: "scenario_workbench",
      actionTitle: "Generate Weekend Pre-Approval Letter",
      actionReason: "Borrowers need updated verification figures before evening home showings."
    };
  } else if (pct < 70) {
    headline = `Mid-Flight Surge & Anti-Complacency (${timeStr})`;
    motivationalBadge = `Actual Ratio: ${completed} of ${total} Goals Completed (${pct}%) — Surge Pace!`;
    whatDoneSummary = `Midday checkpoint: ${completed} of ${total} targets locked in (${pct}% ratio). Solid foundation, but don't let the mid-afternoon slump pull you under.`;
    managerPerspective = `Good work getting ${completed} of ${total} done, ${loName}, but listen closely: You're right on the bubble. Average loan officers get halfway through their list and ease off the gas pedal. That's why average loan officers stay stuck at 3 loans a month. I need you to reject complacency. Attack the next 2 tasks with the exact same hunger you brought at 8:30 AM, and finish this shift in the top 10%.`;
    topProducerTip = {
      headline: "The 2 PM Surge",
      advice: "When energy dips in the afternoon, top producers switch from passive screen work to active partner outreach. Send a quick video update to a buyer or text a realtor.",
      focusOutcome: "Share a customized property flyer or 2-1 buydown comparison with an active partner."
    };
    topPriorities = [
      "Connect with Realtor partner on weekend open house co-marketing.",
      "Run 2-1 buydown cost analysis on listing properties with price drops.",
      isAdmin 
        ? "Review team loan distribution and audit LO pipeline velocity." 
        : "Finalize AUS documentation checklist for underwriting submission."
    ];
    coachingQuote = "The difference between surviving in mortgage lending and dominating the market is what you do after 2:00 PM.";
    nextActionRecommendation = {
      tabId: "realtor_cobranding",
      actionTitle: "Dispatch Open House Co-Marketing Asset",
      actionReason: "Agents finalize weekend marketing assets between 11:30 AM and 2:00 PM."
    };
  } else if (pct < 100) {
    headline = `High-Tempo Producer Momentum (${timeStr})`;
    motivationalBadge = `Actual Ratio: ${completed} of ${total} Goals Completed (${pct}%) — Dominant Tempo!`;
    whatDoneSummary = `Outstanding execution: ${completed} of ${total} targets completed (${pct}% ratio). You're dominating the board with disciplined execution.`;
    managerPerspective = `${loName}, this is high-level execution! ${completed} of ${total} goals completed is pure pro discipline. Now here is your sales manager stretch critique: Do NOT coast into the clubhouse. When your task-to-goal ratio is this high, your confidence and vocal tone are electric. Take that energy right now and make the call you've been putting off all week—dial that A-list agent or ask your pre-approved buyer for two friend referrals.`;
    topProducerTip = {
      headline: "The Top 1% Stretch Call",
      advice: "When you are ahead of pace, your vocal conviction is at its absolute peak. Reach out to an agent who does $30M+ in volume. Success confidence is magnetic.",
      focusOutcome: "Prospect a new top-producing agent partner for coffee this week."
    };
    topPriorities = [
      "Reach out to an A-tier Realtor partner for coffee or lunch next week.",
      "Review pipeline rate locks for files within 10 days of closing.",
      isAdmin 
        ? "Schedule branch coaching session with junior originators." 
        : "Send proactive status update to active under-contract borrowers."
    ];
    coachingQuote = "When you are ahead of schedule, you own the market instead of letting the market own you.";
    nextActionRecommendation = {
      tabId: "realtor_cobranding",
      actionTitle: "Create Co-Branded Flyer for Top Agent",
      actionReason: "Proactively propose weekend open house co-marketing while ahead of schedule."
    };
  } else {
    headline = `Championship Execution (${timeStr})`;
    motivationalBadge = `Actual Ratio: ${total} of ${total} Goals Crushed (100%) — Elite Standard!`;
    whatDoneSummary = `Dominant performance: ${completed} of ${total} daily targets locked down (100% completion). Flawless execution across your entire daily rhythm.`;
    managerPerspective = `Tremendous day, ${loName}! You protected the standard and ran the table 100%. That's what top 1% producers do day in and day out. Now here is my only critique: The biggest enemy of tomorrow is today's victory. Don't close your laptop and show up tomorrow morning wondering what to do. Spend 4 minutes right now queueing up your top 2 morning calls so you hit the ground running at 60 MPH.`;
    topProducerTip = {
      headline: "Protect Tomorrow's Flywheel",
      advice: "Never celebrate a 100% day without setting up tomorrow's initial 2 moves. Top producers maintain unbroken momentum by preparing their board tonight.",
      focusOutcome: "Queue up tomorrow morning's top 2 outbound calls before shutting down."
    };
    topPriorities = [
      "Verify all client text & email communications are compliant and logged in CRM.",
      "Set tomorrow morning's top 3 priority focus areas in Google Workspace.",
      isAdmin 
        ? "Review branch daily funded volume pacing and team quota metrics." 
        : "Send wrap-up summary note to Realtor partners on active buyer status."
    ];
    coachingQuote = "Excellence is not an accident — it is the consistent accumulation of days just like today.";
    nextActionRecommendation = {
      tabId: "growth_dashboard",
      actionTitle: "Review Branch & LO Production Trajectory",
      actionReason: "Close out the day with clarity on your 30-day funded volume goals."
    };
  }

  return {
    headline,
    motivationalBadge,
    whatDoneSummary,
    managerPerspective,
    salesManagerCritique: critique,
    topProducerTip,
    topPriorities,
    coachingQuote,
    nextActionRecommendation
  };
}


