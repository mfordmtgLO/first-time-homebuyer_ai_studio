import { LoanOfficerProfile, RealEstateAgentProfile, LOPairing } from "../types";
import { DEFAULT_LOAN_OFFICER, INITIAL_TEAM_LOAN_OFFICERS, INITIAL_AGENT_ROSTER, INITIAL_PAIRINGS } from "../data/initialData";

/**
 * Helper to check if a headshot URL is a cartoon, placeholder, or invalid string
 */
function isCartoonOrPlaceholder(url?: string): boolean {
  if (!url || url.length < 5) return true;
  const lower = url.toLowerCase();
  return (
    lower.includes("dicebear") ||
    lower.includes("avataaars") ||
    lower.includes("multavatar") ||
    lower.includes("placeholder") ||
    lower.includes("cartoon") ||
    lower.includes("unsplash")
  );
}

/**
 * Sanitizes and guarantees data integrity for Loan Officers across the entire platform.
 * Ensures authentic professional headshots for Mike Ford, Lonn Kilstrom, and all team members.
 */
export function sanitizeLoanOfficer(lo: LoanOfficerProfile): LoanOfficerProfile {
  if (!lo) return DEFAULT_LOAN_OFFICER;

  const rawId = (lo.id || "").toLowerCase();
  const rawSlug = (lo.customSlug || "").toLowerCase();
  const rawName = (lo.name || "").toLowerCase();
  const rawEmail = (lo.email || "").toLowerCase();
  const rawNmls = (lo.nmlsId || "").replace(/[^0-9]/g, "");

  // Find matching default team profile
  const matchedDefault = INITIAL_TEAM_LOAN_OFFICERS.find(d => {
    const dId = d.id.toLowerCase();
    const dSlug = (d.customSlug || "").toLowerCase();
    const dName = d.name.toLowerCase();
    const dEmail = (d.email || "").toLowerCase();
    const dNmls = (d.nmlsId || "").replace(/[^0-9]/g, "");

    return (
      dId === rawId || 
      `lo-${dSlug}` === rawId ||
      dSlug === rawSlug || 
      dName === rawName ||
      (rawName && (rawName.includes("mike ford") && dName.includes("mike ford"))) ||
      (rawName && (rawName.includes("lonn") && dName.includes("lonn"))) ||
      (rawName && (rawName.includes("alan") && dName.includes("alan"))) ||
      (rawName && (rawName.includes("mark") && dName.includes("mark"))) ||
      (rawName && (rawName.includes("darryl") && dName.includes("darryl"))) ||
      (rawName && (rawName.includes("christopher") && dName.includes("christopher"))) ||
      (rawName && (rawName.includes("derek") && dName.includes("derek"))) ||
      (rawName && (rawName.includes("emanuel") && dName.includes("emanuel"))) ||
      (rawEmail && dEmail && rawEmail === dEmail) ||
      (rawNmls && dNmls && rawNmls === dNmls)
    );
  });

  const canonicalId = matchedDefault?.id || lo.id || `lo-${lo.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
  const canonicalSlug = matchedDefault?.customSlug || lo.customSlug || canonicalId.replace(/^lo-/, "");

  let finalHeadshot = lo.headshotUrl;
  
  // A headshot is only "invalid" if it explicitly contains our known placeholder domains
  const isInvalidPlaceholder = finalHeadshot && typeof finalHeadshot === 'string' && (
    finalHeadshot.includes("unsplash.com") || 
    finalHeadshot.includes("dicebear.com") || 
    finalHeadshot.includes("avataaars") || 
    finalHeadshot.includes("multavatar")
  );

  if (!finalHeadshot || isInvalidPlaceholder) {
    if (canonicalId === "lo-mike-ford" || rawName.includes("mike ford")) {
      finalHeadshot = "/mike-ford-headshot.jpg";
    } else {
      finalHeadshot = ""; 
    }
  }

  // Branch fixes
  let branch = lo.branch || matchedDefault?.branch || "Team Lonn Kilstrom Branch";
  if (canonicalId === "lo-mike-ford") {
    branch = (!lo.branch || lo.branch.includes("Team Lonn Kilstrom Branch (Manager / Admin)"))
      ? "Lake Oswego, OR (serving Oregonians state-wide since 2000)"
      : lo.branch;
  }

  return {
    ...matchedDefault,
    ...lo,
    id: canonicalId,
    name: lo.name || matchedDefault?.name || "Loan Officer",
    title: lo.title || matchedDefault?.title || "Senior Loan Officer",
    nmlsId: lo.nmlsId || matchedDefault?.nmlsId || "",
    company: "Cornerstone First Mortgage, LLC NMLS#173855", // Enforce compliance name
    branch: branch,
    email: lo.email || matchedDefault?.email || "",
    phone: lo.phone || matchedDefault?.phone || "",
    headshotUrl: finalHeadshot,
    websiteUrl: lo.websiteUrl && !lo.websiteUrl.includes("/lo/") ? lo.websiteUrl : (matchedDefault?.websiteUrl || `https://cfmtg.com/${canonicalSlug}/`),
    customSlug: canonicalSlug,
    isAdmin: matchedDefault?.isAdmin ?? lo.isAdmin ?? false,
  };

  const spotlightId = lo.marketNewsSpotlightAgentId || matchedDefault?.marketNewsSpotlightAgentId;
  if (spotlightId) {
    cleaned.marketNewsSpotlightAgentId = spotlightId;
  } else {
    delete cleaned.marketNewsSpotlightAgentId;
  }

  return cleanFirestoreData(cleaned);
}

/**
 * Recursively strips undefined keys and ensures compatibility with Firestore setDoc
 */
export function cleanFirestoreData<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => cleanFirestoreData(item)) as unknown as T;
  }
  if (typeof obj === "object" && obj !== null) {
    if (obj instanceof Date) return obj;
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanFirestoreData(value);
      }
    }
    return cleaned as T;
  }
  return obj;
}

/**
 * Sanitizes and guarantees data integrity for Real Estate Agents across the entire platform.
 */
export function sanitizeAgent(agent: RealEstateAgentProfile): RealEstateAgentProfile {
  if (!agent) return INITIAL_AGENT_ROSTER[0];

  let finalHeadshot = agent.headshotUrl;
  
  const isInvalidPlaceholder = finalHeadshot && typeof finalHeadshot === 'string' && (
    finalHeadshot.includes("unsplash.com") || 
    finalHeadshot.includes("dicebear.com") || 
    finalHeadshot.includes("avataaars") || 
    finalHeadshot.includes("multavatar")
  );

  if (!finalHeadshot || isInvalidPlaceholder) {
    finalHeadshot = ""; 
  }

  const cleaned = {
    ...agent,
    headshotUrl: finalHeadshot
  };

  return cleanFirestoreData(cleaned);
}

/**
 * Robust matcher for Loan Officers supporting any URL param variation or short path:
 * ?lo=mike-ford, ?lo=lonn-kilstrom, ?lo=lkilstrom, ?lo=lonn, ?lo=117954, /lonn-kilstrom, /lkilstrom, /lonn, etc.
 */
export function findMatchingLoanOfficer(
  query: string | null | undefined,
  loanOfficers: LoanOfficerProfile[]
): LoanOfficerProfile | undefined {
  if (!query) return undefined;
  const raw = query.trim().toLowerCase();
  if (!raw) return undefined;

  const clean = raw.replace(/^lo-/, "").replace(/[^a-z0-9]/g, "");

  const allOfficers = [...loanOfficers];
  INITIAL_TEAM_LOAN_OFFICERS.forEach(defaultLo => {
    if (!allOfficers.some(l => l.id === defaultLo.id || l.customSlug === defaultLo.customSlug)) {
      allOfficers.push(defaultLo);
    }
  });

  const matched = allOfficers.find(lo => {
    const id = lo.id.toLowerCase();
    const idClean = id.replace(/^lo-/, "").replace(/[^a-z0-9]/g, "");
    const slug = (lo.customSlug || "").toLowerCase();
    const slugClean = slug.replace(/^lo-/, "").replace(/[^a-z0-9]/g, "");
    const nameClean = lo.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const firstNameClean = lo.name.split(" ")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
    const emailPrefix = (lo.email || "").split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
    const nmlsDigits = (lo.nmlsId || "").replace(/[^0-9]/g, "");

    // Direct matches
    if (id === raw || id === `lo-${raw}` || `lo-${id}` === raw) return true;
    if (slug && (slug === raw || slug === `lo-${raw}` || `lo-${slug}` === raw)) return true;
    if (idClean === clean || slugClean === clean || nameClean === clean) return true;
    if (firstNameClean && (firstNameClean === clean || firstNameClean === raw)) return true;
    if (emailPrefix && (emailPrefix === clean || emailPrefix === raw)) return true;
    if (nmlsDigits && (nmlsDigits === clean || nmlsDigits === raw)) return true;

    // Direct shortcut handles
    if (clean === "lonn" && (idClean.includes("lonn") || nameClean.includes("lonn"))) return true;
    if (clean === "lkilstrom" && (idClean.includes("lonn") || emailPrefix === "lkilstrom")) return true;
    if (clean === "mike" && (idClean.includes("mike") || nameClean.includes("mike"))) return true;
    if (clean === "mford" && (idClean.includes("mike") || emailPrefix === "mford")) return true;
    if (clean === "alan" && (idClean.includes("alan") || nameClean.includes("alan"))) return true;
    if (clean === "aburkhart" && (idClean.includes("alan") || emailPrefix === "aburkhart")) return true;
    if (clean === "mark" && (idClean.includes("mark") || nameClean.includes("mark"))) return true;
    if (clean === "msaftich" && (idClean.includes("mark") || emailPrefix === "msaftich")) return true;
    if (clean === "darryl" && (idClean.includes("darryl") || nameClean.includes("darryl"))) return true;
    if (clean === "dsymonds" && (idClean.includes("darryl") || emailPrefix === "dsymonds")) return true;
    if (clean === "christopher" && (idClean.includes("christopher") || nameClean.includes("christopher"))) return true;
    if (clean === "cvargas" && (idClean.includes("christopher") || emailPrefix === "cvargas")) return true;
    if (clean === "derek" && (idClean.includes("derek") || nameClean.includes("derek"))) return true;
    if (clean === "drichards" && (idClean.includes("derek") || emailPrefix === "drichards")) return true;
    if (clean === "emanuel" && (idClean.includes("emanuel") || nameClean.includes("emanuel"))) return true;
    if (clean === "eetuks" && (idClean.includes("emanuel") || emailPrefix === "eetuks")) return true;

    return false;
  });

  return matched ? sanitizeLoanOfficer(matched) : undefined;
}

/**
 * Robust matcher for Real Estate Agents supporting any URL param variation:
 * ?agent=sarah-jenkins, ?agent=agent-sarah-jenkins, ?agent=sarah, etc.
 */
export function findMatchingAgent(
  query: string | null | undefined,
  agents: RealEstateAgentProfile[]
): RealEstateAgentProfile | undefined {
  if (!query) return undefined;
  const raw = query.trim().toLowerCase();
  if (!raw) return undefined;

  const clean = raw.replace(/^agent-/, "").replace(/[^a-z0-9]/g, "");

  const allAgents = [...agents];
  INITIAL_AGENT_ROSTER.forEach(defaultAgent => {
    if (!allAgents.some(a => a.id === defaultAgent.id || a.customSlug === defaultAgent.customSlug)) {
      allAgents.push(defaultAgent);
    }
  });

  return allAgents.find(ag => {
    const id = ag.id.toLowerCase();
    const idClean = id.replace(/^agent-/, "").replace(/[^a-z0-9]/g, "");
    const slug = (ag.customSlug || "").toLowerCase();
    const slugClean = slug.replace(/^agent-/, "").replace(/[^a-z0-9]/g, "");
    const nameClean = ag.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const firstNameClean = ag.name.split(" ")[0].toLowerCase().replace(/[^a-z0-9]/g, "");

    if (id === raw || id === `agent-${raw}` || `agent-${id}` === raw) return true;
    if (slug && (slug === raw || slug === `agent-${slug}` || `agent-${slug}` === raw)) return true;
    if (idClean === clean || slugClean === clean || nameClean === clean) return true;
    if (firstNameClean && (firstNameClean === clean || firstNameClean === raw)) return true;

    return false;
  });
}

/**
 * Robust matcher for Co-Branded Pairings supporting any URL param variation:
 * ?pair=mike-and-sarah, ?pair=pair-1, ?pair=lonn-and-marcus, ?pair=lonn-and-sarah, etc.
 */
export function findMatchingPairing(
  query: string | null | undefined,
  pairings: LOPairing[]
): LOPairing | undefined {
  if (!query) return undefined;
  const raw = query.trim().toLowerCase();
  if (!raw) return undefined;

  const clean = raw.replace(/^pair-/, "").replace(/[^a-z0-9]/g, "");

  const allPairings = [...pairings];
  INITIAL_PAIRINGS.forEach(ip => {
    if (!allPairings.some(p => p.id === ip.id || p.customSlug === ip.customSlug)) {
      allPairings.push(ip);
    }
  });

  return allPairings.find(p => {
    const id = p.id.toLowerCase();
    const idClean = id.replace(/^pair-/, "").replace(/[^a-z0-9]/g, "");
    const slug = (p.customSlug || "").toLowerCase();
    const slugClean = slug.replace(/^pair-/, "").replace(/[^a-z0-9]/g, "");

    if (id === raw || slug === raw) return true;
    if (idClean === clean || slugClean === clean) return true;

    // Checks for composite pair slugs
    if (clean === "lonnandmarcus" && (slugClean.includes("lonn") && slugClean.includes("marcus"))) return true;
    if (clean === "lonnandsarah" && (slugClean.includes("lonn") && slugClean.includes("sarah"))) return true;
    if (clean === "lonnandelena" && (slugClean.includes("lonn") && slugClean.includes("elena"))) return true;
    if (clean === "lonnandtyler" && (slugClean.includes("lonn") && slugClean.includes("tyler"))) return true;
    if (clean === "mikeandsarah" && (slugClean.includes("mike") && slugClean.includes("sarah"))) return true;
    if (clean === "mikeandkanndice" && (slugClean.includes("mike") && slugClean.includes("kanndice"))) return true;

    if (clean.includes("mike") && clean.includes("kanndice")) {
      if (id === "pair-mike-kanndice" || slug === "mike-and-kanndice" || (p.loId.includes("mike") && p.agentId.includes("kanndice"))) return true;
    }
    if (clean.includes("lonn") && clean.includes("marcus")) {
      if (id === "pair-2" || slug === "lonn-and-marcus" || (p.loId.includes("lonn") && p.agentId.includes("marcus"))) return true;
    }
    if (clean.includes("lonn") && clean.includes("sarah")) {
      if (id === "pair-lonn-sarah" || slug === "lonn-and-sarah" || (p.loId.includes("lonn") && p.agentId.includes("sarah"))) return true;
    }
    if (clean.includes("lonn") && clean.includes("elena")) {
      if (id === "pair-lonn-elena" || slug === "lonn-and-elena" || (p.loId.includes("lonn") && p.agentId.includes("elena"))) return true;
    }
    if (clean.includes("lonn") && clean.includes("tyler")) {
      if (id === "pair-lonn-tyler" || slug === "lonn-and-tyler" || (p.loId.includes("lonn") && p.agentId.includes("tyler"))) return true;
    }
    if (clean.includes("mike") && clean.includes("sarah")) {
      if (id === "pair-1" || slug === "mike-and-sarah" || (p.loId.includes("mike") && p.agentId.includes("sarah"))) return true;
    }

    return false;
  });
}

/**
 * Resolves Loan Officer, Agent, and Pairing from any path (e.g. /mike-ford, /mford, /mike, /lonn-kilstrom, /lkilstrom, /lonn, /lonn-and-marcus, /sarah-jenkins)
 */
export function resolveFromUrlPath(
  pathname: string,
  hash: string,
  loanOfficers: LoanOfficerProfile[],
  agents: RealEstateAgentProfile[],
  pairings: LOPairing[]
): {
  matchedLo?: LoanOfficerProfile;
  matchedAgent?: RealEstateAgentProfile;
  matchedPairing?: LOPairing;
  isPairing: boolean;
} {
  const rawSegments = [
    ...pathname.split("/"),
    ...hash.replace("#", "").split("/")
  ].map(s => s.trim().toLowerCase()).filter(Boolean);

  // 1. Check for Pairing in any segment or composite path
  for (const seg of rawSegments) {
    const pair = findMatchingPairing(seg, pairings);
    if (pair) {
      const pairLo = findMatchingLoanOfficer(pair.loId, loanOfficers);
      const pairAgent = findMatchingAgent(pair.agentId, agents);
      return { matchedLo: pairLo, matchedAgent: pairAgent, matchedPairing: pair, isPairing: true };
    }
  }

  // Check if entire path or hash matches a pair
  const cleanPath = pathname.replace(/^\/+|\/+$/g, "").toLowerCase();
  const pairByPath = findMatchingPairing(cleanPath, pairings);
  if (pairByPath) {
    const pairLo = findMatchingLoanOfficer(pairByPath.loId, loanOfficers);
    const pairAgent = findMatchingAgent(pairByPath.agentId, agents);
    return { matchedLo: pairLo, matchedAgent: pairAgent, matchedPairing: pairByPath, isPairing: true };
  }

  // Check if segment has "and" or "-" joining LO and Agent (e.g. lonn-and-sarah, lonn-and-marcus)
  for (const seg of rawSegments) {
    if (seg.includes("-and-") || seg.includes("and")) {
      const parts = seg.split(/-and-|\band\b/).map(p => p.trim()).filter(Boolean);
      if (parts.length >= 2) {
        const potentialLo = findMatchingLoanOfficer(parts[0], loanOfficers) || findMatchingLoanOfficer(parts[1], loanOfficers);
        const potentialAgent = findMatchingAgent(parts[1], agents) || findMatchingAgent(parts[0], agents);
        if (potentialLo && potentialAgent) {
          return { matchedLo: potentialLo, matchedAgent: potentialAgent, isPairing: true };
        }
      }
    }
  }

  // 2. Check for Loan Officer in segments
  let matchedLo: LoanOfficerProfile | undefined;
  for (const seg of rawSegments) {
    if (seg === "portal" || seg === "admin" || seg === "lo" || seg === "api" || seg === "assets" || seg === "dashboard" || seg === "backend" || seg === "command-center") continue;
    const lo = findMatchingLoanOfficer(seg, loanOfficers);
    if (lo) {
      matchedLo = lo;
      break;
    }
  }

  // 3. Check for Agent in segments
  let matchedAgent: RealEstateAgentProfile | undefined;
  for (const seg of rawSegments) {
    if (seg === "portal" || seg === "admin" || seg === "agent" || seg === "api" || seg === "assets" || seg === "dashboard" || seg === "backend" || seg === "command-center") continue;
    const ag = findMatchingAgent(seg, agents);
    if (ag) {
      matchedAgent = ag;
      break;
    }
  }

  if (matchedLo && matchedAgent) {
    return { matchedLo, matchedAgent, isPairing: true };
  }

  if (matchedLo && !matchedAgent) {
    return { matchedLo, matchedAgent: undefined, isPairing: false };
  }

  if (!matchedLo && matchedAgent) {
    return { matchedLo: undefined, matchedAgent, isPairing: false };
  }

  return { matchedLo, matchedAgent, isPairing: false };
}

