const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldRouterLogic = `
    // Check if URL path or hash indicates LO portal or specific LO
    const isPortalPath = 
      pathname.includes("/portal") || 
      pathname.includes("/admin") || 
      pathname.includes("/login") ||
      hash.includes("portal") || 
      hash.includes("admin") ||
      params.get("portal") === "lo" || 
      params.get("admin") === "lo";
`;

const newRouterLogic = `
    // 1. Resolve path components first to determine if it's a co-branded link or a solo LO link
    const fromPathForPortalCheck = resolveFromUrlPath(
      pathname,
      hash,
      guidesState.loanOfficers,
      guidesState.agentRoster,
      guidesState.pairings
    );

    // Check if URL path or hash indicates LO portal or specific LO
    let isPortalPath = 
      pathname.includes("/portal") || 
      pathname.includes("/admin") || 
      pathname.includes("/login") ||
      hash.includes("portal") || 
      hash.includes("admin") ||
      params.get("portal") === "lo" || 
      params.get("admin") === "lo";

    // Legacy support: if the URL contains the public portal base path, but resolves strictly to an LO (no Realtor pairing), it is the LO's dashboard login link.
    if (pathname.includes("first-time_homebuyer_portal") || pathname.includes("first-time-homebuyer-portal")) {
      if (fromPathForPortalCheck.matchedLo && !fromPathForPortalCheck.isPairing && !fromPathForPortalCheck.matchedPairing && !fromPathForPortalCheck.matchedAgent) {
        isPortalPath = true;
      }
    }
`;

content = content.replace(oldRouterLogic.trim(), newRouterLogic.trim());

fs.writeFileSync('src/App.tsx', content);
console.log("Successfully updated App.tsx");
