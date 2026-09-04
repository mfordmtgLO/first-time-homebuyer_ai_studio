const fs = require('fs');
let code = fs.readFileSync('src/components/AdsCampaignHub.tsx', 'utf8');

// We need to add state for the AI generated specs
const stateStr = `
  const [activePlatformTab, setActivePlatformTab] = useState<"meta" | "google">("meta");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // New AI states
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiMetaSpec, setAiMetaSpec] = useState<any>(null);
  const [aiGoogleSpec, setAiGoogleSpec] = useState<any>(null);

  const handleGenerateCampaigns = async () => {
    setIsGenerating(true);
    try {
      const { auth } = await import("../firebase");
      const user = auth.currentUser;
      if (!user) throw new Error("Must be logged in to generate campaigns");
      
      const idToken = await user.getIdToken();
      const res = await fetch("/api/ai/meta-ads-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": \`Bearer \${idToken}\` },
        body: JSON.stringify({
          loanOfficer,
          activeAgent,
          adSettings
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate");
      
      setAiMetaSpec(data.metaAdSpec);
      setAiGoogleSpec(data.googleAdSpec);
      setSaveMessage("Campaigns generated successfully via AI!");
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (e: any) {
      console.error(e);
      alert("Error generating campaign: " + e.message);
    } finally {
      setIsGenerating(false);
    }
  };
`;

code = code.replace(
  '  const [activePlatformTab, setActivePlatformTab] = useState<"meta" | "google">("meta");\n  const [saveMessage, setSaveMessage] = useState<string | null>(null);\n  const [copiedField, setCopiedField] = useState<string | null>(null);',
  stateStr
);

const replaceMeta = `const metaAdSpec = aiMetaSpec || {`;
code = code.replace(/const metaAdSpec = {/g, replaceMeta);

const replaceGoogle = `const googleAdSpec = aiGoogleSpec || {`;
code = code.replace(/const googleAdSpec = {/g, replaceGoogle);

const genBtnStr = `
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateCampaigns}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#2D362E] hover:bg-[#4A5D4E] text-white text-xs font-bold rounded-xl transition-all shadow-xs disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>{isGenerating ? "Generating..." : "Generate AI Campaigns"}</span>
          </button>
        </div>
      </div>
`;
code = code.replace(/<\/div>\n\n      {!-- Quick Launch & Direct Login Cards for Ad Accounts --}/, genBtnStr + '\n\n      {/* Quick Launch & Direct Login Cards for Ad Accounts */}');

// Let's replace exactly what's there
code = code.replace('        </div>\n      </div>\n\n      {/* Quick Launch & Direct Login Cards for Ad Accounts */}', genBtnStr);


fs.writeFileSync('src/components/AdsCampaignHub.tsx', code);
