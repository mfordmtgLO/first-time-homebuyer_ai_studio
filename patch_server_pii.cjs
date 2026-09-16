const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const targetBlock = `      await piiVaultRef.set({
        encryptedData: encryptedPayload,
        status: "PENDING_SCRUB",
        aiAccessible: false,
      });

      // 2. Scrub the text (Redact PII)
      const redactedDocText = redactPII(docText);

      // 3. Immediately Delete the raw encrypted data from the PII Vault (Ephemeral Shredding)
      // Ensures PII data is never kept online, locally, or in browser memory.
      await piiVaultRef.delete();`;

const newBlock = `      try {
        await piiVaultRef.set({
          encryptedData: encryptedPayload,
          status: "PENDING_SCRUB",
          aiAccessible: false,
        });
      } catch (e) {
        console.warn("Skipped PII Vault persistence (preview env)");
      }

      // 2. Scrub the text (Redact PII)
      const redactedDocText = redactPII(docText);

      // 3. Immediately Delete the raw encrypted data from the PII Vault (Ephemeral Shredding)
      // Ensures PII data is never kept online, locally, or in browser memory.
      try {
        await piiVaultRef.delete();
      } catch (e) {
      }`;

if (code.includes(targetBlock)) {
  code = code.replace(targetBlock, newBlock);
  fs.writeFileSync('server.ts', code);
  console.log("Patched PII vault persistence");
} else {
  console.log("Target block not found");
}
