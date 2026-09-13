import React, { useState, useEffect } from "react";
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  CreditCard, 
  ShieldCheck, 
  Sparkles, 
  Copy, 
  Check, 
  Send
} from "lucide-react";
import { CommercialScriptVariation } from "../../types/commercialAds";
import { 
  LoanOfficerProfile, 
  RealEstateAgentProfile, 
  LoanOfficerAdSettings, 
  AdCampaignDraft 
} from "../../types";

interface AdDeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  variation: CommercialScriptVariation | null;
  targetPlatform: 'meta' | 'google';
  loanOfficer: LoanOfficerProfile;
  activeAgent?: RealEstateAgentProfile;
  adSettings?: LoanOfficerAdSettings;
  pairingUrl?: string;
  hasAudioSynthesized?: boolean;
  onSaveCampaignDraft: (draft: AdCampaignDraft) => void;
}

export const AdDeploymentModal: React.FC<AdDeploymentModalProps> = ({
  isOpen,
  onClose,
  variation,
  targetPlatform,
  loanOfficer,
  activeAgent,
  adSettings,
  pairingUrl,
  hasAudioSynthesized = false,
  onSaveCampaignDraft
}) => {
  const initialSettings = adSettings || loanOfficer.adSettings || {
    metaAdAccountId: "act_49182049182",
    metaPixelId: "918237192837461",
    googleCustomerId: "842-192-4910",
    googleConversionId: "AW-104928109",
    targetCities: ["Portland", "Beaverton", "Gresham", "Hillsboro", "Oregon City"],
    dailyBudgetUSD: 25,
    adSpendMonthlyCap: 750,
    creditCardConfigured: true
  };

  const isMeta = targetPlatform === 'meta';
  const platformName = isMeta ? "Meta (Facebook & Instagram)" : "Google Video & YouTube Ads";
  const accountId = isMeta 
    ? (initialSettings.metaAdAccountId || "act_49182049182") 
    : (initialSettings.googleCustomerId || "842-192-4910");
  const trackingId = isMeta 
    ? (initialSettings.metaPixelId || "918237192837461") 
    : (initialSettings.googleConversionId || "AW-104928109");

  const [campaignName, setCampaignName] = useState("");
  const [headline, setHeadline] = useState("");
  const [primaryText, setPrimaryText] = useState("");
  const [ctaButton, setCtaButton] = useState<string>("Learn More");
  const [destinationUrl, setDestinationUrl] = useState(
    pairingUrl || `https://vantage-mortgage.web.app/portal?lo=${loanOfficer.id}`
  );
  const [dailyBudget, setDailyBudget] = useState<number>(
    initialSettings.dailyBudgetUSD || 25
  );
  const [specialHousingCategory, setSpecialHousingCategory] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deployedSuccess, setDeployedSuccess] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (variation) {
      setCampaignName(`[${isMeta ? 'FB/IG' : 'Google Video'}] ${variation.title} - Q3 Commercial`);
      setHeadline(variation.adDeploymentSpec?.headline || variation.title);
      setPrimaryText(variation.adDeploymentSpec?.primaryText || `${variation.hook}\n\n${variation.fullVoiceoverScript}`);
      setCtaButton(variation.adDeploymentSpec?.ctaButton || "Learn More");
      setDestinationUrl(pairingUrl || `https://vantage-mortgage.web.app/portal?lo=${loanOfficer.id}`);
      setDailyBudget(initialSettings.dailyBudgetUSD || 25);
      setDeployedSuccess(null);
    }
  }, [variation, isMeta, pairingUrl, loanOfficer.id, initialSettings.dailyBudgetUSD]);

  if (!isOpen || !variation) return null;

  const monthlyCap = initialSettings.adSpendMonthlyCap || 750;
  const estimatedMonthlySpend = dailyBudget * 30;
  const isOverBudgetCap = estimatedMonthlySpend > monthlyCap;

  const handlePublish = (status: 'ready_to_launch' | 'draft' | 'live') => {
    setIsSubmitting(true);

    const generatedId = `cmp-${targetPlatform}-${Date.now().toString(36)}`;
    const newDraft: AdCampaignDraft = {
      id: generatedId,
      platform: targetPlatform,
      loId: loanOfficer.id,
      agentId: activeAgent?.id || "partner-agent-pool",
      campaignName,
      headline,
      primaryText,
      descriptionText: variation.fullVoiceoverScript.slice(0, 140) + "...",
      targetUrl: destinationUrl,
      dailyBudget,
      targetLocations: initialSettings.targetCities || ["Metro Area"],
      specialHousingCategory,
      adObjective: 'LEAD_GENERATION',
      status,
      lastSaved: new Date().toISOString(),
      currentLeads: 0,
      leadCap: Math.floor((dailyBudget * 30) / 18),
      auditLog: [
        {
          timestamp: new Date().toISOString(),
          actor: loanOfficer.name,
          action: status === 'live' ? 'Launched Live Campaign' : 'Published Ready-to-Launch Commercial',
          notes: `Created from AI Commercial Generator variation: "${variation.title}". Audio track included: ${hasAudioSynthesized ? 'Yes (ElevenLabs)' : 'Standard audio'}. Linked Ad Account: ${accountId}`
        }
      ]
    };

    setTimeout(() => {
      onSaveCampaignDraft(newDraft);
      setIsSubmitting(false);
      setDeployedSuccess(generatedId);
    }, 900);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(destinationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#EAE7E0] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className={`p-5 flex items-center justify-between border-b ${
          isMeta ? "bg-gradient-to-r from-blue-700 to-indigo-800 text-white" : "bg-gradient-to-r from-red-600 to-rose-700 text-white"
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center font-bold text-lg">
              {isMeta ? "f" : "▶"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">Deploy to {platformName}</h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/20 tracking-wider">
                  Direct API Connection
                </span>
              </div>
              <p className="text-xs text-white/80">
                Pre-filled from AI Commercial: <span className="font-semibold">{variation.title}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer text-white"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[#2D362E]">
          
          {deployedSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-[#2D362E]">
                  Commercial Campaign Successfully Deployed!
                </h4>
                <p className="text-sm text-[#606C5D] mt-1 max-w-md mx-auto">
                  Your commercial script, headlines, and parameters have been transmitted to your linked {platformName} account.
                </p>
              </div>

              <div className="p-4 bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl max-w-lg mx-auto text-left space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#EAE7E0]">
                  <span className="text-[#606C5D]">Campaign ID:</span>
                  <span className="font-mono font-bold text-[#2D362E]">{deployedSuccess}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#EAE7E0]">
                  <span className="text-[#606C5D]">Ad Account:</span>
                  <span className="font-mono text-[#2D362E]">{accountId}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#EAE7E0]">
                  <span className="text-[#606C5D]">Daily Budget:</span>
                  <span className="font-bold text-emerald-700">${dailyBudget}/day (${dailyBudget * 30}/mo est.)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#EAE7E0]">
                  <span className="text-[#606C5D]">Fair Housing Compliance:</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Enforced
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#606C5D]">Audio Track:</span>
                  <span className="text-[#2D362E] font-medium">
                    {hasAudioSynthesized ? "ElevenLabs Multilingual v2 Voiceover" : "Standard Audio Track"}
                  </span>
                </div>
              </div>

              <div className="flex justify-center gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-[#2D362E] hover:bg-[#1f2620] text-white font-bold text-sm shadow-xs transition-colors cursor-pointer"
                >
                  Return to AI Ad Studio
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Linked Ad Account & Credit Card Safeguard Card */}
              <div className="p-4 rounded-xl bg-[#F9F8F4] border border-[#EAE7E0] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#C18C5D]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#606C5D]">
                      Connected Ad Infrastructure & Spend Guard
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                    <ShieldCheck className="w-3 h-3" /> Account Verified
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-[#EAE7E0]">
                    <div className="text-[11px] text-[#606C5D]">Connected Account ID</div>
                    <div className="font-mono font-bold text-[#2D362E] mt-0.5 truncate">{accountId}</div>
                    <div className="text-[10px] text-[#606C5D] mt-0.5">Pixel/Tag: {trackingId}</div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-[#EAE7E0]">
                    <div className="text-[11px] text-[#606C5D]">Payment Method</div>
                    <div className="font-semibold text-[#2D362E] mt-0.5 flex items-center gap-1">
                      <span>Visa ending in •••• 4821</span>
                    </div>
                    <div className="text-[10px] text-emerald-600 mt-0.5">Auto-Billing Active</div>
                  </div>

                  <div className="bg-white p-3 rounded-lg border border-[#EAE7E0]">
                    <div className="text-[11px] text-[#606C5D]">Pre-Set Monthly Spend Cap</div>
                    <div className="font-bold text-[#2D362E] mt-0.5">${monthlyCap} / month</div>
                    <div className={`text-[10px] font-semibold mt-0.5 ${
                      isOverBudgetCap ? "text-red-600" : "text-emerald-600"
                    }`}>
                      {isOverBudgetCap 
                        ? `Warning: $${estimatedMonthlySpend} exceeds $${monthlyCap} cap` 
                        : `$${monthlyCap - estimatedMonthlySpend} safety cushion`}
                    </div>
                  </div>
                </div>

                {isOverBudgetCap && (
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Daily budget of ${dailyBudget} (${estimatedMonthlySpend}/mo) exceeds your monthly cap of ${monthlyCap}.</span>
                    </div>
                    <button
                      onClick={() => setDailyBudget(Math.floor(monthlyCap / 30))}
                      className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-bold shrink-0 cursor-pointer"
                    >
                      Clamp to ${Math.floor(monthlyCap / 30)}/day
                    </button>
                  </div>
                )}
              </div>

              {/* Form Fields Pre-filled from AI Variation */}
              <div className="space-y-4">
                
                {/* Campaign Name */}
                <div>
                  <label className="block text-xs font-bold text-[#2D362E] mb-1">
                    Campaign Name in Ad Manager
                  </label>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#EAE7E0] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#4A5D4E] focus:outline-hidden"
                  />
                </div>

                {/* Ad Headline */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-[#2D362E]">
                      Ad Headline (Title)
                    </label>
                    <span className="text-[11px] text-[#606C5D]">{headline.length}/40 characters</span>
                  </div>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    maxLength={60}
                    className="w-full px-3 py-2 bg-white border border-[#EAE7E0] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#4A5D4E] focus:outline-hidden"
                  />
                </div>

                {/* Primary Text / Hook & Post Copy */}
                <div>
                  <label className="block text-xs font-bold text-[#2D362E] mb-1">
                    Primary Text (Social Hook & Caption)
                  </label>
                  <textarea
                    rows={4}
                    value={primaryText}
                    onChange={(e) => setPrimaryText(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#EAE7E0] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#4A5D4E] focus:outline-hidden leading-relaxed"
                  />
                </div>

                {/* Video Voiceover & Audio Status */}
                <div className="p-3 bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#2D362E] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#C18C5D]" />
                      Video Commercial Voiceover Script
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      hasAudioSynthesized 
                        ? "bg-emerald-100 text-emerald-800" 
                        : "bg-amber-100 text-amber-900"
                    }`}>
                      {hasAudioSynthesized ? "ElevenLabs Audio Track Attached" : "TTS Ready to Render"}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#606C5D] line-clamp-2 italic">
                    "{variation.fullVoiceoverScript}"
                  </p>
                </div>

                {/* Call To Action & Destination URL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2D362E] mb-1">
                      Call-to-Action (CTA) Button
                    </label>
                    <select
                      value={ctaButton}
                      onChange={(e) => setCtaButton(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#EAE7E0] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#4A5D4E] focus:outline-hidden"
                    >
                      <option value="Learn More">Learn More</option>
                      <option value="Apply Now">Apply Now</option>
                      <option value="Get Offer">Get Offer</option>
                      <option value="Calculate Payment">Calculate Payment</option>
                      <option value="Contact Us">Contact Us</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-[#2D362E]">
                        Destination Landing URL
                      </label>
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="text-[10px] text-[#4A5D4E] hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        {copiedLink ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                        {copiedLink ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <input
                      type="url"
                      value={destinationUrl}
                      onChange={(e) => setDestinationUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#EAE7E0] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#4A5D4E] focus:outline-hidden font-mono"
                    />
                  </div>
                </div>

                {/* Budget Slider */}
                <div className="p-3 bg-white border border-[#EAE7E0] rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#2D362E]">Daily Ad Spend (USD)</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg">
                      ${dailyBudget} / day (~${dailyBudget * 30}/month)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={100}
                    step={5}
                    value={dailyBudget}
                    onChange={(e) => setDailyBudget(Number(e.target.value))}
                    className="w-full accent-[#4A5D4E] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#606C5D]">
                    <span>$5/day ($150/mo)</span>
                    <span>Default: $25/day ($750/mo cap)</span>
                    <span>$100/day ($3,000/mo)</span>
                  </div>
                </div>

                {/* Special Housing Category Fair Housing Compliance */}
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs">
                  <input
                    type="checkbox"
                    id="housingCategoryCheckbox"
                    checked={specialHousingCategory}
                    onChange={(e) => setSpecialHousingCategory(e.target.checked)}
                    className="mt-0.5 accent-[#4A5D4E] rounded cursor-pointer"
                  />
                  <label htmlFor="housingCategoryCheckbox" className="cursor-pointer text-[#2D362E]">
                    <span className="font-bold block">
                      Enforce Special Ad Category (Housing & Credit Opportunity)
                    </span>
                    <span className="text-[11px] text-[#606C5D] block mt-0.5">
                      Required by Meta & Google advertising policy. Enforces Equal Housing Opportunity non-discrimination safeguards on demographic targeting.
                    </span>
                  </label>
                </div>

              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-[#EAE7E0] flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#EAE7E0] text-xs font-bold text-[#606C5D] hover:bg-[#F9F8F4] transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handlePublish('draft')}
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#F9F8F4] hover:bg-[#F1EFE9] border border-[#EAE7E0] text-xs font-bold text-[#2D362E] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Save as Draft Campaign
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePublish('live')}
                    disabled={isSubmitting || isOverBudgetCap}
                    className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 ${
                      isMeta 
                        ? "bg-[#1877F2] hover:bg-blue-600" 
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? "Transmitting..." : `Deploy to ${isMeta ? 'Meta Ads' : 'Google Ads'}`}</span>
                  </button>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
