const fs = require('fs');
let code = fs.readFileSync('src/utils/authUtils.ts', 'utf8');

if (!code.includes('isLockedOut')) {
    code = code.replace(
        'const assignedRole = normalizeRole(whitelistData.role || "team_lo");',
        `if (whitelistData.isLockedOut === true) {\n        throw new Error("LOCKED_OUT");\n      }\n      const assignedRole = normalizeRole(whitelistData.role || "team_lo");`
    );
    fs.writeFileSync('src/utils/authUtils.ts', code);
    console.log("Patched authUtils.ts to include Admin Kill Switch");
} else {
    console.log("Already patched");
}
