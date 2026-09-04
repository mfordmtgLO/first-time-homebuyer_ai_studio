const fs = require('fs');
let code = fs.readFileSync('src/components/BigPurpleDotModal.tsx', 'utf8');

code = code.replace(
  'import { BigPurpleDotConfig, BigPurpleDotWebhookEvent } from "../types";',
  'import { BigPurpleDotConfig, BigPurpleDotWebhookEvent } from "../types";\nimport { fetchIntegrationsVault, saveToIntegrationsVault } from "../utils/vault";'
);

code = code.replace(
  'const [activeTab, setActiveTab] = useState<"credentials" | "webhooks" | "mapping" | "golive">("credentials");',
  'const [activeTab, setActiveTab] = useState<"credentials" | "webhooks" | "mapping" | "golive">("credentials");\n  const [hasVault, setHasVault] = useState(false);\n  const [isSaving, setIsSaving] = useState(false);'
);

code = code.replace(
  /fetch\("\/api\/big-purple-dot\/config"\)\n\s*\.then\(res => res\.json\(\)\)\n\s*\.then\(data => \{[^}]*\}\)/,
  `fetchIntegrationsVault().then(res => {
      if (res.hasVault) {
        setHasVault(true);
        setApiKey("••••••••••••••••");
        setApiSecret("••••••••••••••••••••••••••••••••");
      }
    })`
);

code = code.replace(
  /const handleSaveConfig = async \(\) => \{[^}]*\n\s*try \{[^}]*const res = await fetch\("\/api\/big-purple-dot\/config"[^}]*\}[^}]*onUpdateConfig\([^}]*\}[^}]*\};/m,
  `const handleSaveConfig = async () => {
    setIsSaving(true);
    try {
      const payload = {
        subdomain,
        apiKey,
        apiSecret,
        accountEmail,
        webhookSecret,
        environment,
        autoSyncRecruits,
        syncLoanOfficers,
        syncRealEstateAgents,
        loStageMapping,
        agentStageMapping,
        connectionStatus: apiKey ? "connected" : "not_configured"
      };

      if (apiKey && !apiKey.includes("••••")) {
        await saveToIntegrationsVault(payload);
        setHasVault(true);
      }

      onUpdateConfig(payload as any);
      onTriggerToast("BPD Integration settings & Vault encrypted successfully.");
      setTimeout(() => onClose(), 1500);
    } catch (e: any) {
      console.error(e);
      alert("Failed to securely encrypt BPD Vault");
    } finally {
      setIsSaving(false);
    }
  };`
);

// We should replace the hardcoded "Save Configuration" with dynamic isSaving
code = code.replace(
  '<span className="font-bold">Save Integration Configuration</span>',
  '<span className="font-bold">{isSaving ? "Encrypting Vault..." : "Save Integration Configuration"}</span>'
);

// Also replace the button disabled prop
code = code.replace(
  'disabled={!apiKey || !subdomain}',
  'disabled={!apiKey || !subdomain || isSaving}'
);

fs.writeFileSync('src/components/BigPurpleDotModal.tsx', code);
