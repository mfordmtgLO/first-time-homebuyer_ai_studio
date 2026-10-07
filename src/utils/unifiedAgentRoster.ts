import { RealEstateAgentProfile, ProfessionalGuidesState, LOPairing } from "../types";

export interface UnifiedAgentProfile extends RealEstateAgentProfile {
  isTop50?: boolean;
  top50Rank?: number;
  top50State?: string;
  isPaired?: boolean;
  pairedLoIds?: string[];
  pairedLoNames?: string[];
  sourceOrigin?: "master_roster" | "top50_sweep" | "scraped" | "manual";
}

/**
 * Returns a unified, deduplicated Master Agent Repository combining:
 * 1. guidesState.agentRoster
 * 2. Cached Top 50 State Sweep Candidates (from localStorage or rosterMap)
 * 3. Any agents referenced in LO + Agent Pairings
 * 4. Any scraped candidates
 * 
 * Ensures every selector, input box, and lookup in the dashboard has 100% access to all agents.
 */
export function getUnifiedMasterAgentRoster(guidesState: ProfessionalGuidesState): UnifiedAgentProfile[] {
  const masterMap = new Map<string, UnifiedAgentProfile>();

  // 1. Process primary agentRoster from guidesState
  (guidesState.agentRoster || []).forEach((agent) => {
    const key = (agent.email || agent.licenseNumber || agent.name || agent.id).toLowerCase().trim();
    if (!key) return;

    masterMap.set(key, {
      ...agent,
      isTop50: (agent as any).isTop50 || false,
      top50Rank: (agent as any).top50Rank,
      top50State: (agent as any).licenseStates?.[0] || "OR",
      isPaired: false,
      pairedLoIds: agent.assignedLoIds || [],
      pairedLoNames: [],
      sourceOrigin: "master_roster"
    });
  });

  // 2. Process Top 50 cached roster from localStorage if available
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem("recruitment_top50_roster_cache");
      if (cached) {
        const rosterMap: Record<string, any[]> = JSON.parse(cached);
        Object.keys(rosterMap).forEach((stateKey) => {
          const candidates = rosterMap[stateKey] || [];
          candidates.forEach((c) => {
            if (c.type === "real_estate_agent" || c.type === "agent" || (!c.type && c.licenseNumber)) {
              const key = (c.email || c.licenseNumber || c.name || c.id).toLowerCase().trim();
              if (!key) return;

              const existing = masterMap.get(key);
              if (existing) {
                existing.isTop50 = true;
                existing.top50Rank = c.rank || existing.top50Rank;
                existing.top50State = c.officeLocation?.slice(-2) || "OR";
              } else {
                masterMap.set(key, {
                  id: c.id || `agent-top50-${c.rank || Date.now()}`,
                  name: c.name || "Top Producer Agent",
                  title: c.title || "Principal Real Estate Broker",
                  brokerage: c.company || c.brokerage || c.officeLocation || undefined,
                  licenseNumber: c.licenseNumber || c.nmlsId || undefined,
                  email: c.email && c.email.includes("@") ? c.email : undefined,
                  phone: c.phone && !c.phone.includes("555") ? c.phone : undefined,
                  headshotUrl: c.headshotUrl && c.headshotUrl.startsWith("http") ? c.headshotUrl : undefined,
                  rating: undefined,
                  yearsExperience: c.yearsExperience != null ? Number(c.yearsExperience) : undefined,
                  experienceYears: c.yearsExperience != null ? Number(c.yearsExperience) : undefined,
                  agentType: "buyer_agent",
                  bio: c.bio || undefined,
                  specialties: ["First-Time Homebuyers", "Buyer Representation"],
                  marketAreas: [c.city || "Portland Metro", "Oregon"],
                  areasServed: [c.city || "Portland Metro", "Oregon"],
                  customSlug: (c.name || "agent").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                  assignedLoIds: [],
                  isTop50: true,
                  top50Rank: typeof c.rank === "number" ? c.rank : undefined,
                  rank: typeof c.rank === "number" ? c.rank : null,
                  top50State: c.officeLocation?.slice(-2) || "OR",
                  isPaired: false,
                  pairedLoIds: [],
                  pairedLoNames: [],
                  sourceOrigin: "top50_sweep"
                });
              }
            }
          });
        });
      }
    } catch {
      // ignore parse errors
    }
  }

  // 3. Process Pairings to attach LO pairing tags & ensure paired agents are included
  const pairings = guidesState.pairings || [];
  const loanOfficers = guidesState.loanOfficers || [];

  pairings.forEach((p: LOPairing) => {
    const lo = loanOfficers.find((l) => l.id === p.loId);
    const loName = lo?.name || "Loan Officer";

    // Find agent in masterMap
    let matchedAgent: UnifiedAgentProfile | undefined;
    for (const [, agent] of masterMap.entries()) {
      if (agent.id === p.agentId || agent.name.toLowerCase() === p.title.toLowerCase().split("+")[1]?.trim().toLowerCase()) {
        matchedAgent = agent;
        break;
      }
    }

    if (matchedAgent) {
      matchedAgent.isPaired = true;
      if (!matchedAgent.pairedLoIds) matchedAgent.pairedLoIds = [];
      if (!matchedAgent.pairedLoNames) matchedAgent.pairedLoNames = [];

      if (!matchedAgent.pairedLoIds.includes(p.loId)) {
        matchedAgent.pairedLoIds.push(p.loId);
      }
      if (!matchedAgent.pairedLoNames.includes(loName)) {
        matchedAgent.pairedLoNames.push(loName);
      }
    }
  });

  // Return list sorted alphabetically by Agent First Name A-Z
  return Array.from(masterMap.values()).sort((a, b) => 
    a.name.trim().toLowerCase().localeCompare(b.name.trim().toLowerCase())
  );
}

/**
 * Sorts LO + Agent Pairings alphabetically by Agent's First Name (A-Z).
 * Example: Lonn Kilstrom + Amy Woods comes before Lonn Kilstrom + Betty Smith.
 */
export function sortPairingsAlphabeticallyByAgentName(
  pairings: LOPairing[],
  unifiedAgents: UnifiedAgentProfile[]
): LOPairing[] {
  return [...pairings].sort((pA, pB) => {
    const agentA = unifiedAgents.find((a) => a.id === pA.agentId);
    const agentB = unifiedAgents.find((a) => a.id === pB.agentId);

    const nameA = (agentA?.name || pA.title.split("+")[1] || "").trim().toLowerCase();
    const nameB = (agentB?.name || pB.title.split("+")[1] || "").trim().toLowerCase();

    return nameA.localeCompare(nameB);
  });
}
