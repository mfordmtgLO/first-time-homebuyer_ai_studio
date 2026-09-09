const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetPortalAccess = `  const isPortalAccess =
    pathname === "/portal" ||
    pathname.startsWith("/portal/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/login" ||
    hash.includes("portal") ||
    hash.includes("admin") ||
    search.includes("portal=lo") ||
    search.includes("admin=lo");`;

const replacementPortalAccess = `  const isPortalAccess =
    pathname === "/portal" ||
    pathname.startsWith("/portal/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/login" ||
    pathname === "/lo-login" ||
    pathname === "/secure-login" ||
    hash.includes("portal") ||
    hash.includes("admin") ||
    search.includes("portal=lo") ||
    search.includes("admin=lo");`;

code = code.replace(targetPortalAccess, replacementPortalAccess);

const targetPortalPath = `    let isPortalPath =
      pathname.includes("/portal") ||
      pathname.includes("/admin") ||
      pathname.includes("/login") ||
      hash.includes("portal") ||
      hash.includes("admin") ||
      params.get("portal") === "lo" ||
      params.get("admin") === "lo";`;

const replacementPortalPath = `    let isPortalPath =
      pathname.includes("/portal") ||
      pathname.includes("/admin") ||
      pathname.includes("/login") ||
      pathname.includes("/lo-login") ||
      pathname.includes("/secure-login") ||
      hash.includes("portal") ||
      hash.includes("admin") ||
      params.get("portal") === "lo" ||
      params.get("admin") === "lo";`;

code = code.replace(targetPortalPath, replacementPortalPath);
fs.writeFileSync('src/App.tsx', code);
