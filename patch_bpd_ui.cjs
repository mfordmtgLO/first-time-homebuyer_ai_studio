const fs = require('fs');
let modal = fs.readFileSync('src/components/BigPurpleDotModal.tsx', 'utf8');

// Update BigPurpleDotModal test-connection to use token and pass vault
modal = modal.replace(
  /const res = await fetch\("\/api\/big-purple-dot\/test-connection", {[\s\S]*?body: JSON\.stringify\({/,
  `const { auth } = await import("../firebase");
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";
      
      let bpdVault = undefined;
      if (hasVault) {
        const vaultRes = await fetchIntegrationsVault();
        if (vaultRes.hasVault) bpdVault = vaultRes.encryptedVault;
      }
      
      const res = await fetch("/api/big-purple-dot/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": \`Bearer \${token}\` },
        body: JSON.stringify({
          bpdVault,`
);
fs.writeFileSync('src/components/BigPurpleDotModal.tsx', modal);

let pipeline = fs.readFileSync('src/components/RecruitmentPipeline.tsx', 'utf8');

// Update RecruitmentPipeline sync to use token and pass vault
pipeline = pipeline.replace(
  /const res = await fetch\("\/api\/big-purple-dot\/sync", {[\s\S]*?body: JSON\.stringify\({ items, type }\)/,
  `const { auth } = await import("../firebase");
      const user = auth.currentUser;
      const token = user ? await user.getIdToken() : "";
      
      const { fetchIntegrationsVault } = await import("../utils/vault");
      const vaultRes = await fetchIntegrationsVault();
      
      const res = await fetch("/api/big-purple-dot/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": \`Bearer \${token}\` },
        body: JSON.stringify({ items, type, bpdVault: vaultRes.encryptedVault })`
);
fs.writeFileSync('src/components/RecruitmentPipeline.tsx', pipeline);

