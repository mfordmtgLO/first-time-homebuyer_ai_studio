import React, { useState, useEffect } from "react";
import { fetchIntegrationsVault, saveToIntegrationsVault } from "../utils/vault";
import { 
  Target, 
  CreditCard, 
  DollarSign, 
  ExternalLink, 
  Copy, 
  CheckCircle2, 
  Check, 
  AlertCircle, 
  Sliders, 
  Sparkles, 
  Globe, 
  Save, 
  Eye,
  ShieldCheck,
  Zap
} from "lucide-react";
import { 
  LoanOfficerProfile, 
  RealEstateAgentProfile, 
  AdCampaignDraft, 
  LoanOfficerAdSettings 
} from "../types";

interface AdsCampaignHubProps {
  loanOfficer: LoanOfficerProfile;
  activeAgent: RealEstateAgentProfile;
  adCampaignDrafts: AdCampaignDraft[];
  onSaveAdDraft: (draft: AdCampaignDraft) => void;
  onUpdateAdSettings: (settings: LoanOfficerAdSettings) => void;
  pairingUrl: string;
}

export const AdsCampaignHub: React.FC<AdsCampaignHubProps> = ({
  loanOfficer,
  activeAgent,
  adCampaignDrafts,
  onSaveAdDraft,
  onUpdateAdSettings,
  pairingUrl
}) => {
  const [activePlatformTab, setActivePlatformTab] = useState<"meta" | "google">("meta");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("grants_calculator");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasVault, setHasVault] = useState(false);

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
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${idToken}` },
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

  // Editable credentials state
  const [adSettings, setAdSettings] = useState<LoanOfficerAdSettings>(() => {
    return loanOfficer.adSettings || {
      metaAdAccountId: "act_49182049182",
      metaPixelId: "918237192837461",
      googleCustomerId: "842-192-4910",
      googleConversionId: "AW-104928109",
      targetCities: ["Portland", "Beaverton", "Gresham", "Hillsboro", "Oregon City"],
      dailyBudgetUSD: 25,
      adSpendMonthlyCap: 750,
      creditCardConfigured: false
    };
  });

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2500);
  };

  useEffect(() => {
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

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
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
  };

  // Meta Campaign Spec
  const metaCampaignUrl = `${pairingUrl}${pairingUrl.includes("?") ? "&" : "?"}utm_source=meta_ads&utm_medium=cpc&utm_campaign=first_time_homebuyer_dpa&utm_content=co_branded`;
  
  const metaAdSpec = aiMetaSpec || {
    campaignName: `[Homebuyer Roadmap 2026] First-Time Buyer Portal • ${loanOfficer.name} + ${activeAgent.name}`,
    specialCategory: "Housing (HEC - RESPA / Fair Housing Compliant)",
    objective: "Lead Generation / Instant Interactive Portal",
    dailyBudget: adSettings.dailyBudgetUSD || 25,
    targetAudience: `Age 24-55 • Geo: ${adSettings.targetCities?.join(", ") || "Portland Metro (25 mi)"} • Interests: First-Time Buyer, Zillow, Mortgage Loans, Down Payment Assistance`,
    primaryText: `Stop guessing what your monthly mortgage payment will be. 🏡 

We created a free, transparent interactive First-Time Homebuyer Portal for Oregon & Washington buyers to calculate exact monthly payments (including taxes, HOA, and home insurance) and check eligibility for up to $30,000 in state Down Payment Assistance (DPA).

✨ Calculate your true PITI payment in 60 seconds
✨ Browse verified Oregon & Washington Down Payment Assistance (DPA) programs
✨ Use our home tour scorecard to inspect listings without stress

Tap "Calculate Buying Power" to try the live interactive tool now!`,
    headline: "Calculate Your True Monthly Payment & DPA in 60 Sec",
    description: `Free Interactive Tool • Powered by ${loanOfficer.name} (${loanOfficer.nmlsId}) & ${activeAgent.name} (REALTOR®)`,
    ctaButton: "Calculate Buying Power / Learn More",
    destinationUrl: metaCampaignUrl
  };

  // Google Ads Search Campaign Spec
  const googleCampaignUrl = `${pairingUrl}${pairingUrl.includes("?") ? "&" : "?"}utm_source=google_ads&utm_medium=search_cpc&utm_campaign=first_time_homebuyer_calculator&utm_term=oregon_dpa_assistance`;

  const googleAdSpec = aiGoogleSpec || {
    campaignName: `[Google Search] First Time Homebuyer Oregon • ${loanOfficer.name} + ${activeAgent.name}`,
    network: "Google Search (High Intent Keywords)",
    dailyBudget: adSettings.dailyBudgetUSD ? adSettings.dailyBudgetUSD + 5 : 30,
    targetGeo: adSettings.targetCities?.join(", ") || "Portland, OR Metro, Washington County, Clackamas County",
    headlines: [
      "Oregon First Time Homebuyer Hub",
      "Free 2026 Mortgage Calculator",
      "Check $30,000 DPA Eligibility",
      `Mike Ford NMLS #${loanOfficer.nmlsId.replace(/[^0-9]/g, "") || "184209"}`,
      "Instant Monthly PITI Breakdown"
    ],
    descriptions: [
      "Calculate exact monthly payments including property taxes, HOA & insurance. Zero guesswork.",
      "Explore verified Oregon Down Payment Assistance (DPA), 2-1 buydowns, and 10-step closing roadmap. Try free today.",
      `Co-presented with ${activeAgent.name} (${activeAgent.brokerage}). Transparent homebuying clarity.`,
      "Fast 14-day pre-approval options and custom budget planning. Start your interactive plan."
    ],
    keywords: [
      "first time home buyer oregon",
      "oregon down payment assistance dpa",
      "mortgage payment calculator portland or",
      "first time buyer pre approval portland",
      "how much house can i afford oregon",
      "piti mortgage calculator oregon",
      "oregon bond residential loan program"
    ],
    destinationUrl: googleCampaignUrl
  };

  const handleSaveCurrentDraft = () => {
    if (activePlatformTab === "meta") {
      const draft: AdCampaignDraft = {
        id: `draft-meta-${Date.now()}`,
        platform: "meta",
        loId: loanOfficer.id,
        agentId: activeAgent.id,
        campaignName: metaAdSpec.campaignName,
        headline: metaAdSpec.headline,
        secondaryHeadlines: ["Free Pre-Approval & DPA Check", "Instant PITI Calculator"],
        primaryText: metaAdSpec.primaryText,
        descriptionText: metaAdSpec.description,
        targetUrl: metaCampaignUrl,
        dailyBudget: adSettings.dailyBudgetUSD || 25,
        targetLocations: adSettings.targetCities || ["Portland Metro"],
        specialHousingCategory: true,
        adObjective: "LEAD_GENERATION",
        status: "ready_to_launch",
        lastSaved: new Date().toISOString().split("T")[0]
      };
      onSaveAdDraft(draft);
    } else {
      const draft: AdCampaignDraft = {
        id: `draft-google-${Date.now()}`,
        platform: "google",
        loId: loanOfficer.id,
        agentId: activeAgent.id,
        campaignName: googleAdSpec.campaignName,
        headline: googleAdSpec.headlines[0],
        secondaryHeadlines: googleAdSpec.headlines.slice(1),
        primaryText: googleAdSpec.descriptions[0],
        descriptionText: googleAdSpec.descriptions[1],
        targetUrl: googleCampaignUrl,
        dailyBudget: googleAdSpec.dailyBudget,
        targetLocations: adSettings.targetCities || ["Portland Metro"],
        keywords: googleAdSpec.keywords,
        specialHousingCategory: true,
        adObjective: "LEAD_GENERATION",
        status: "ready_to_launch",
        lastSaved: new Date().toISOString().split("T")[0]
      };
      onSaveAdDraft(draft);
    }

    setSaveMessage(`Draft saved! Ready to push directly when ad platform is connected.`);
    setTimeout(() => setSaveMessage(null), 3000);
  };

  return (
    <div className="bg-white rounded-3xl border border-[#EAE7E0] p-6 sm:p-8 space-y-6 shadow-sm text-[#2D362E]">
      {/* Hub Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE7E0] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-[#4A5D4E] text-white px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#D4A373]" />
              <span>Automated Paid Ads & Platform Connection</span>
            </span>
          </div>
          <h3 className="font-serif font-bold text-2xl text-[#2D362E] mt-1">
            Meta (Facebook) & Google Ads Automated Campaign Builder
          </h3>
          <p className="text-xs text-[#606C5D]">
            Auto-generate high-converting ad copy, responsive search headlines, and target URLs. Connect your ad accounts and launch directly to capture local first-time homebuyer leads.
          </p>
        </div>
      </div>

      {saveMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Platform Switcher */}
      <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActivePlatformTab("meta")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activePlatformTab === "meta"
                ? "bg-[#1877F2] text-white shadow-xs"
                : "bg-[#F1EFE9] text-[#606C5D] hover:bg-[#EAE7E0]"
            }`}
          >
            <span>📘 Meta (Facebook & Instagram Feed Ads)</span>
          </button>

          <button
            onClick={() => setActivePlatformTab("google")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activePlatformTab === "google"
                ? "bg-[#EA4335] text-white shadow-xs"
                : "bg-[#F1EFE9] text-[#606C5D] hover:bg-[#EAE7E0]"
            }`}
          >
            <span>🔍 Google Ads (Responsive Search Ads)</span>
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateCampaigns}
            disabled={isGenerating}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#2D362E] hover:bg-[#4A5D4E] text-white text-xs font-bold rounded-xl transition-all shadow-xs disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>{isGenerating ? "Generating..." : "Auto-Generate with AI"}</span>
          </button>
        </div>
      </div>

      {/* Quick Launch & Direct Login Cards for Ad Accounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Meta Ads Manager Quick Link */}
        <div className="bg-[#F4F8FF] border border-[#D0E2FF] rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#1877F2] text-white flex items-center justify-center font-bold text-sm">
                f
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#002D62]">Meta Ads Manager & Billing</h4>
                <p className="text-[11px] text-[#4A6B82]">Connect payment method & launch campaigns</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              {adSettings.metaAdAccountId ? "Account Linked" : "Setup Required"}
              {hasVault && <Lock className="w-3 h-3 ml-1 inline text-blue-800" />}
            </span>
          </div>

          <p className="text-xs text-[#334E68] leading-relaxed">
            Input your Meta Ad Account ID & Pixel below, then click below to open your Ads Manager billing page to configure your credit card and activate your campaign.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <a
              href="https://adsmanager.facebook.com/adsmanager/manage/campaigns"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1877F2] hover:bg-[#1465cc] text-white text-xs font-bold transition-colors"
            >
              <span>Open Meta Ads Manager</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://www.facebook.com/ads/manager/account_settings/account_billing/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#D0E2FF] hover:bg-blue-50 text-[#1877F2] text-xs font-semibold transition-colors"
            >
              <CreditCard className="w-3 h-3" />
              <span>Add Credit Card / Ad Spend</span>
            </a>
          </div>
        </div>

        {/* Google Ads Quick Link */}
        <div className="bg-[#FFF5F5] border border-[#FFD6D6] rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#EA4335] text-white flex items-center justify-center font-bold text-sm">
                G
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#801818]">Google Ads Hub & Billing</h4>
                <p className="text-[11px] text-[#9E4040]">Search network ads & conversion tracking</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800">
              {adSettings.googleCustomerId ? "Customer ID Set" : "Setup Required"}
            </span>
          </div>

          <p className="text-xs text-[#5C2B2B] leading-relaxed">
            Enter your Google Customer ID & Conversion ID, then click below to log into your Google Ads account to confirm payment methods and activate search ads.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <a
              href="https://ads.google.com/home/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EA4335] hover:bg-[#c93022] text-white text-xs font-bold transition-colors"
            >
              <span>Open Google Ads Home</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://ads.google.com/aw/billing/summary"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#FFD6D6] hover:bg-red-50 text-[#EA4335] text-xs font-semibold transition-colors"
            >
              <CreditCard className="w-3 h-3" />
              <span>Google Billing & Budget</span>
            </a>
          </div>
        </div>
      </div>

      {/* Ad Platform Account Credentials Setup Form */}
      <form onSubmit={handleSaveSettings} className="bg-[#F9F8F4] border border-[#EAE7E0] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-2">
          <h4 className="text-xs font-bold text-[#2D362E] flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#4A5D4E]" />
            <span>Ad Account Credentials & Target Geographies</span>
          </h4>
          <span className="text-[10px] text-[#9A9488]">Settings apply to all auto-generated templates</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#606C5D]">Meta Ad Account ID</label>
            <input
              type="text"
              placeholder="act_1234567890"
              value={adSettings.metaAdAccountId || ""}
              onChange={(e) => setAdSettings(prev => ({ ...prev, metaAdAccountId: e.target.value }))}
              className="w-full bg-white border border-[#EAE7E0] rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-[#4A5D4E]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#606C5D]">Meta Pixel ID</label>
            <input
              type="text"
              placeholder="987654321098"
              value={adSettings.metaPixelId || ""}
              onChange={(e) => setAdSettings(prev => ({ ...prev, metaPixelId: e.target.value }))}
              className="w-full bg-white border border-[#EAE7E0] rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-[#4A5D4E]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#606C5D]">Google Customer ID</label>
            <input
              type="text"
              placeholder="123-456-7890"
              value={adSettings.googleCustomerId || ""}
              onChange={(e) => setAdSettings(prev => ({ ...prev, googleCustomerId: e.target.value }))}
              className="w-full bg-white border border-[#EAE7E0] rounded-xl px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-[#4A5D4E]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#606C5D]">Daily Budget ($ USD)</label>
            <input
              type="number"
              min="5"
              step="5"
              value={adSettings.dailyBudgetUSD || 25}
              onChange={(e) => setAdSettings(prev => ({ ...prev, dailyBudgetUSD: Number(e.target.value) }))}
              className="w-full bg-white border border-[#EAE7E0] rounded-xl px-3 py-1.5 text-xs font-bold text-[#4A5D4E] focus:outline-none focus:border-[#4A5D4E]"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-[11px] text-[#606C5D] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Pre-configured with Special Housing Category (HEC) compliance parameters.</span>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 bg-[#2D362E] hover:bg-[#1E241F] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Ad Settings</span>
          </button>
        </div>
      </form>

      {/* Campaign Specification & Live Draft Previews */}
      {activePlatformTab === "meta" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#2D362E] flex items-center gap-1.5">
              <span>Auto-Generated Meta Ad Specification</span>
              <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono">
                Facebook + Instagram Feed
              </span>
            </h4>

            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(metaAdSpec.primaryText, "meta-primary")}
                className="flex items-center gap-1 text-xs text-[#1877F2] font-semibold hover:bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors"
              >
                {copiedField === "meta-primary" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Primary Ad Copy</span>
              </button>

              <button
                onClick={handleSaveCurrentDraft}
                className="flex items-center gap-1 text-xs text-white font-bold bg-[#4A5D4E] hover:bg-[#38463B] px-3 py-1 rounded-lg transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Draft Campaign</span>
              </button>
            </div>
          </div>

          <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-2xl p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-[#606C5D]">Campaign Name:</span>
                <p className="font-mono text-[11px] text-[#2D362E] bg-white p-2 rounded-lg border border-[#EAE7E0]">
                  {metaAdSpec.campaignName}
                </p>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-[#606C5D]">Special Ad Category:</span>
                <p className="text-[11px] text-[#2D362E] bg-white p-2 rounded-lg border border-[#EAE7E0] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{metaAdSpec.specialCategory}</span>
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-xs text-[#606C5D]">Primary Text (Ad Copy):</span>
              <pre className="text-xs text-[#2D362E] whitespace-pre-wrap font-sans bg-white p-3.5 rounded-xl border border-[#EAE7E0] leading-relaxed">
                {metaAdSpec.primaryText}
              </pre>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-bold text-[#606C5D]">Headline:</span>
                <p className="font-semibold text-xs text-[#2D362E] bg-white p-2.5 rounded-lg border border-[#EAE7E0]">
                  {metaAdSpec.headline}
                </p>
              </div>
              <div className="space-y-1">
                <span className="font-bold text-[#606C5D]">Description / Subtitle:</span>
                <p className="text-xs text-[#606C5D] bg-white p-2.5 rounded-lg border border-[#EAE7E0]">
                  {metaAdSpec.description}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-xs text-[#606C5D]">Destination URL (with UTM tracking):</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={metaCampaignUrl}
                  className="w-full bg-white border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs font-mono text-[#4A5D4E] focus:outline-none"
                />
                <button
                  onClick={() => copyToClipboard(metaCampaignUrl, "meta-url")}
                  className="px-3 py-2 text-xs font-bold text-[#4A5D4E] bg-white border border-[#EAE7E0] rounded-xl hover:bg-[#F1EFE9] shrink-0"
                >
                  {copiedField === "meta-url" ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#2D362E] flex items-center gap-1.5">
              <span>Auto-Generated Google Responsive Search Ad Spec</span>
              <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded font-mono">
                Google Search Network
              </span>
            </h4>

            <div className="flex items-center gap-2">
              <button
                onClick={() => copyToClipboard(googleAdSpec.headlines.join("\n"), "google-headlines")}
                className="flex items-center gap-1 text-xs text-[#EA4335] font-semibold hover:bg-red-50 px-2.5 py-1 rounded-lg border border-red-200 transition-colors"
              >
                {copiedField === "google-headlines" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Headlines</span>
              </button>

              <button
                onClick={handleSaveCurrentDraft}
                className="flex items-center gap-1 text-xs text-white font-bold bg-[#4A5D4E] hover:bg-[#38463B] px-3 py-1 rounded-lg transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Draft Campaign</span>
              </button>
            </div>
          </div>

          <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-2xl p-5 space-y-4">
            {/* Headlines */}
            <div className="space-y-1.5">
              <span className="font-bold text-xs text-[#606C5D]">5x Responsive Search Headlines:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {googleAdSpec.headlines.map((hl, i) => (
                  <div key={i} className="text-xs font-semibold bg-white p-2 rounded-lg border border-[#EAE7E0] flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#9A9488] w-4">#{i+1}</span>
                    <span>{hl}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Descriptions */}
            <div className="space-y-1.5">
              <span className="font-bold text-xs text-[#606C5D]">4x Search Descriptions:</span>
              <div className="space-y-1.5">
                {googleAdSpec.descriptions.map((desc, i) => (
                  <div key={i} className="text-xs bg-white p-2.5 rounded-lg border border-[#EAE7E0] flex items-start gap-2">
                    <span className="text-[10px] font-bold text-[#9A9488] shrink-0 mt-0.5">D{i+1}:</span>
                    <span className="text-[#2D362E]">{desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Keywords */}
            <div className="space-y-1.5">
              <span className="font-bold text-xs text-[#606C5D]">High-Intent Target Search Keywords:</span>
              <div className="flex flex-wrap gap-1.5">
                {googleAdSpec.keywords.map((kw, i) => (
                  <span key={i} className="text-[11px] font-mono text-[#2D362E] bg-white border border-[#EAE7E0] px-2.5 py-1 rounded-md">
                    +[{kw}]
                  </span>
                ))}
              </div>
            </div>

            {/* Final Target URL */}
            <div className="space-y-1">
              <span className="font-bold text-xs text-[#606C5D]">Final Destination URL (UTM Tagged):</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={googleCampaignUrl}
                  className="w-full bg-white border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs font-mono text-[#4A5D4E] focus:outline-none"
                />
                <button
                  onClick={() => copyToClipboard(googleCampaignUrl, "google-url")}
                  className="px-3 py-2 text-xs font-bold text-[#4A5D4E] bg-white border border-[#EAE7E0] rounded-xl hover:bg-[#F1EFE9] shrink-0"
                >
                  {copiedField === "google-url" ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
