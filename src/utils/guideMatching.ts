import { LoanOfficerProfile, RealEstateAgentProfile, LOPairing } from "../types";
import { DEFAULT_LOAN_OFFICER, INITIAL_TEAM_LOAN_OFFICERS } from "../data/initialData";

/**
 * Sanitizes and guarantees data integrity for Loan Officers,
 * specifically ensuring Mike Ford always uses the authentic headshot and correct company details.
 */
export function sanitizeLoanOfficer(lo: LoanOfficerProfile): LoanOfficerProfile {
  if (!lo) return DEFAULT_LOAN_OFFICER;

  const isMike = 
    lo.id === "lo-mike-ford" || 
    lo.id === "mike-ford" ||
    lo.name.toLowerCase().includes("mike ford") || 
    lo.isAdmin === true ||
    (lo.email && (lo.email.toLowerCase() === "mford@cfmtg.com" || lo.email.toLowerCase() === "fordmj@gmail.com"));

  if (isMike) {
    // Fix branch location if empty or if containing the old placeholder "Team Lonn Kilstrom Branch (Manager / Admin)"
    const branch = (!lo.branch || lo.branch.includes("Team Lonn Kilstrom Branch (Manager / Admin)"))
      ? "Lake Oswego, OR (serving Oregonians state-wide since 2000)"
      : lo.branch;

    return {
      ...lo,
      id: "lo-mike-ford",
      name: lo.name || "Mike Ford",
      title: lo.title || "Senior Loan Officer & Branch Admin",
      nmlsId: lo.nmlsId || "288455",
      company: lo.company || "Cornerstone First Mortgage",
      branch: branch,
      email: lo.email || "mford@cfmtg.com",
      phone: lo.phone || "(541) 729-0819",
      headshotUrl: lo.headshotUrl || "/mike-ford-headshot.jpg", // Preserve custom uploaded headshot, fallback to default photo
      websiteUrl: lo.websiteUrl || "https://cfmtg.com/mford/",
      customSlug: lo.customSlug || "mike-ford",
      isAdmin: true
    };
  }

  const isLonn = 
    lo.id === "lo-lonn-kilstrom" || 
    lo.id === "lonn-kilstrom" ||
    lo.name.toLowerCase().includes("lonn kilstrom") || 
    lo.name.toLowerCase() === "lonn" ||
    (lo.email && lo.email.toLowerCase().includes("lkilstrom"));

  if (isLonn) {
    return {
      ...lo,
      id: "lo-lonn-kilstrom",
      name: lo.name || "Lonn Kilstrom",
      title: lo.title || "Branch Manager",
      nmlsId: lo.nmlsId || "117954",
      company: lo.company || "Cornerstone First Mortgage",
      branch: lo.branch || "Team Lonn Kilstrom Branch",
      email: lo.email || "LKilstrom@cfmtg.com",
      phone: lo.phone || "(503) 849-3478",
      headshotUrl: (lo.headshotUrl && lo.headshotUrl.length > 5)
        ? lo.headshotUrl
        : "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80",
      websiteUrl: lo.websiteUrl || "https://cfmtg.com/lkilstrom/",
      customSlug: lo.customSlug || "lonn-kilstrom",
      isAdmin: false
    };
  }

  // Normalize other team members
  const matchedDefault = INITIAL_TEAM_LOAN_OFFICERS.find(d => d.id === lo.id || d.customSlug === lo.customSlug || d.name.toLowerCase() === (lo.name || "").toLowerCase());
  return {
    ...lo,
    company: lo.company || "Cornerstone First Mortgage",
    customSlug: lo.customSlug || lo.id.replace(/^lo-/, ""),
    headshotUrl: (lo.headshotUrl && lo.headshotUrl.length > 5) ? lo.headshotUrl : (matchedDefault?.headshotUrl || ""),
    websiteUrl: lo.websiteUrl && !lo.websiteUrl.includes("/lo/") ? lo.websiteUrl : (matchedDefault?.websiteUrl || `https://cfmtg.com/${lo.customSlug || lo.id.replace(/^lo-/, "")}/`)
  };
}

/**
 * Robust matcher for Loan Officers supporting any URL param variation:
 * ?lo=mike-ford, ?lo=lo-mike-ford, ?lo=mike, ?lo=mford, ?lo=288455, etc.
 */
export function findMatchingLoanOfficer(
  query: string | null | undefined,
  loanOfficers: LoanOfficerProfile[]
): LoanOfficerProfile | undefined {
  if (!query) return undefined;
  const raw = query.trim().toLowerCase();
  if (!raw) return undefined;

  const clean = raw.replace(/^lo-/, "").replace(/[^a-z0-9]/g, "");

  // Priority 1: Exact Mike Ford shortcuts
  if (
    clean === "mikeford" || 
    clean === "mike" || 
    clean === "mford" || 
    clean === "288455" || 
    raw === "lo-mike-ford" || 
    raw === "mike-ford" ||
    raw === "fordmj@gmail.com" ||
    raw === "mford@cfmtg.com"
  ) {
    const foundMike = loanOfficers.find(l => 
      l.id === "lo-mike-ford" || 
      l.id === "mike-ford" ||
      l.customSlug === "mike-ford" || 
      l.name.toLowerCase().includes("mike ford") || 
      l.isAdmin
    );
    return sanitizeLoanOfficer(foundMike || DEFAULT_LOAN_OFFICER);
  }

  // Priority 2: Direct lookup across the roster
  const matched = loanOfficers.find(lo => {
    const id = lo.id.toLowerCase();
    const idClean = id.replace(/^lo-/, "").replace(/[^a-z0-9]/g, "");
    const slug = (lo.customSlug || "").toLowerCase();
    const slugClean = slug.replace(/^lo-/, "").replace(/[^a-z0-9]/g, "");
    const nameClean = lo.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const emailPrefix = (lo.email || "").split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
    const nmlsDigits = (lo.nmlsId || "").replace(/[^0-9]/g, "");

    // Exact matches
    if (id === raw || id === `lo-${raw}` || `lo-${id}` === raw) return true;
    if (slug && (slug === raw || slug === `lo-${raw}` || `lo-${slug}` === raw)) return true;
    if (idClean === clean || slugClean === clean || nameClean === clean) return true;
    if (emailPrefix && (emailPrefix === clean || emailPrefix === raw)) return true;
    if (nmlsDigits && (nmlsDigits === clean || nmlsDigits === raw)) return true;

    // First name & Handle helpers
    if (clean === "lonn" && (idClean.includes("lonn") || nameClean.includes("lonn"))) return true;
    if (clean === "lkilstrom" && (idClean.includes("lonn") || emailPrefix === "lkilstrom")) return true;
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

  return agents.find(ag => {
    const id = ag.id.toLowerCase();
    const idClean = id.replace(/^agent-/, "").replace(/[^a-z0-9]/g, "");
    const slug = (ag.customSlug || "").toLowerCase();
    const slugClean = slug.replace(/^agent-/, "").replace(/[^a-z0-9]/g, "");
    const nameClean = ag.name.toLowerCase().replace(/[^a-z0-9]/g, "");

    if (id === raw || id === `agent-${raw}` || `agent-${id}` === raw) return true;
    if (slug && (slug === raw || slug === `agent-${slug}` || `agent-${slug}` === raw)) return true;
    if (idClean === clean || slugClean === clean || nameClean === clean) return true;

    // First name match
    if (clean === "sarah" && nameClean.includes("sarah")) return true;
    if (clean === "marcus" && nameClean.includes("marcus")) return true;
    if (clean === "elena" && nameClean.includes("elena")) return true;
    if (clean === "tyler" && nameClean.includes("tyler")) return true;

    return false;
  });
}

/**
 * Robust matcher for Co-Branded Pairings supporting any URL param variation:
 * ?pair=mike-and-sarah, ?pair=pair-1, ?pair=lonn-and-marcus, etc.
 */
export function findMatchingPairing(
  query: string | null | undefined,
  pairings: LOPairing[]
): LOPairing | undefined {
  if (!query) return undefined;
  const raw = query.trim().toLowerCase();
  if (!raw) return undefined;

  const clean = raw.replace(/^pair-/, "").replace(/[^a-z0-9]/g, "");

  return pairings.find(p => {
    const id = p.id.toLowerCase();
    const idClean = id.replace(/^pair-/, "").replace(/[^a-z0-9]/g, "");
    const slug = (p.customSlug || "").toLowerCase();
    const slugClean = slug.replace(/^pair-/, "").replace(/[^a-z0-9]/g, "");

    if (id === raw || slug === raw) return true;
    if (idClean === clean || slugClean === clean) return true;

    if (clean.includes("mike") && clean.includes("sarah")) {
      if (id.includes("mike") || slug.includes("mike") || id === "pair-1") return true;
    }
    if (clean.includes("lonn") && clean.includes("marcus")) {
      if (id.includes("lonn") || slug.includes("lonn") || id === "pair-2" || slug === "lonn-and-marcus") return true;
    }
    if (clean.includes("lonn") && clean.includes("sarah")) {
      if (id.includes("lonn") || slug.includes("lonn") || id === "pair-lonn-sarah" || slug === "lonn-and-sarah") return true;
    }
    if (clean.includes("lonn") && clean.includes("elena")) {
      if (id.includes("lonn") || slug.includes("lonn") || id === "pair-lonn-elena" || slug === "lonn-and-elena") return true;
    }
    if (clean.includes("lonn") && clean.includes("tyler")) {
      if (id.includes("lonn") || slug.includes("lonn") || id === "pair-lonn-tyler" || slug === "lonn-and-tyler") return true;
    }
    if (clean.includes("alan") && clean.includes("marcus")) {
      if (id.includes("alan") || slug.includes("alan") || id === "pair-3") return true;
    }
    if (clean.includes("mark") && clean.includes("elena")) {
      if (id.includes("mark") || slug.includes("mark") || id === "pair-4") return true;
    }
    if (clean.includes("darryl") && clean.includes("tyler")) {
      if (id.includes("darryl") || slug.includes("darryl") || id === "pair-5") return true;
    }
    if (clean.includes("christopher") && clean.includes("sarah")) {
      if (id.includes("christopher") || slug.includes("christopher") || id === "pair-6") return true;
    }
    if (clean.includes("derek") && clean.includes("tyler")) {
      if (id.includes("derek") || slug.includes("derek") || id === "pair-7") return true;
    }

    return false;
  });
}

/**
 * Resolves Loan Officer, Agent, and Pairing from any path (e.g. /mike-ford, /mford, /mike, /mike-and-sarah, /lonn-and-marcus, /sarah-jenkins, /lo/mike-ford)
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
  // Extract all segment candidates from pathname and hash
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

  // Check if segment has "and" or "-" joining LO and Agent (e.g. lonn-and-sarah, mike-and-sarah, lonn-and-marcus)
  for (const seg of rawSegments) {
    const pair = findMatchingPairing(seg, pairings);
    if (pair) {
      const pairLo = findMatchingLoanOfficer(pair.loId, loanOfficers);
      const pairAgent = findMatchingAgent(pair.agentId, agents);
      return { matchedLo: pairLo, matchedAgent: pairAgent, matchedPairing: pair, isPairing: true };
    }

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
    if (seg === "portal" || seg === "admin" || seg === "lo" || seg === "api" || seg === "assets") continue;
    const lo = findMatchingLoanOfficer(seg, loanOfficers);
    if (lo) {
      matchedLo = lo;
      break;
    }
  }

  // 3. Check for Agent in segments
  let matchedAgent: RealEstateAgentProfile | undefined;
  for (const seg of rawSegments) {
    if (seg === "portal" || seg === "admin" || seg === "agent" || seg === "api" || seg === "assets") continue;
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
