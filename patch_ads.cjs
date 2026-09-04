const fs = require('fs');
let code = fs.readFileSync('src/components/AdsCampaignHub.tsx', 'utf8');

code = code.replace(
  'import { ShieldCheck, Copy, CheckCircle2, ChevronRight, ExternalLink, Activity, Users, Target, MousePointerClick, Smartphone, ArrowUpRight } from "lucide-react";',
  'import { ShieldCheck, Copy, CheckCircle2, ChevronRight, ExternalLink, Activity, Users, Target, MousePointerClick, Smartphone, ArrowUpRight, Lock } from "lucide-react";\nimport { fetchIntegrationsVault, saveToIntegrationsVault } from "../utils/vault";'
);

code = code.replace(
  'const [saveMessage, setSaveMessage] = useState<string | null>(null);',
  'const [saveMessage, setSaveMessage] = useState<string | null>(null);\n  const [isSaving, setIsSaving] = useState(false);\n  const [hasVault, setHasVault] = useState(false);'
);

code = code.replace(
  'const handleSaveSettings = (e: React.FormEvent) => {',
  `useEffect(() => {
    fetchIntegrationsVault().then(res => {
      if (res.hasVault) {
        setHasVault(true);
        setAdSettings(prev => ({
          ...prev,
          metaAdAccountId: "••••••••••••",
          googleCustomerId: "••••-••••-••••"
        }));
      }
    });
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {`
);

code = code.replace(
  /onUpdateAdSettings\(adSettings\);\n\s*setSaveMessage\("Ad Platform credentials and budget settings saved successfully!"\);\n\s*setTimeout\(\(\) => setSaveMessage\(null\), 3000\);\n\s*\};/,
  `setIsSaving(true);
    try {
      if (adSettings.metaAdAccountId && !adSettings.metaAdAccountId.includes("••••")) {
        await saveToIntegrationsVault({
          metaAdAccountId: adSettings.metaAdAccountId,
          metaPixelId: adSettings.metaPixelId,
          googleCustomerId: adSettings.googleCustomerId,
          dailyBudgetUSD: adSettings.dailyBudgetUSD
        });
        setHasVault(true);
      }
      onUpdateAdSettings(adSettings);
      setSaveMessage("Vault encrypted & credentials saved successfully!");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to securely encrypt Ad credentials.");
    } finally {
      setIsSaving(false);
    }
  };`
);

code = code.replace(
  'Setup Required"}',
  'Setup Required"}\n              {hasVault && <Lock className="w-3 h-3 ml-1 inline text-blue-800" />}'
);

fs.writeFileSync('src/components/AdsCampaignHub.tsx', code);
