import React, { useState, useRef } from "react";
import { 
  Sparkles, 
  Video, 
  Upload, 
  Image as ImageIcon, 
  Play, 
  Pause, 
  Download, 
  Layers, 
  Clock, 
  Send, 
  Copy, 
  Check, 
  RefreshCw, 
  User, 
  Film, 
  Tv, 
  X,
  Wand2,
  Activity,
  Share2
} from "lucide-react";
import { 
  CommercialScriptVariation, 
  AdPlatformType, 
  ElevenLabsVoice 
} from "../../types/commercialAds";
import { 
  LoanOfficerProfile, 
  RealEstateAgentProfile, 
  LoanOfficerAdSettings, 
  AdCampaignDraft 
} from "../../types";
import { AdDeploymentModal } from "./AdDeploymentModal";
import { LiveAdSpendSyncModal } from "./LiveAdSpendSyncModal";
import { SocialMediaPushModal } from "./SocialMediaPushModal";

interface AICommercialAdGeneratorProps {
  loanOfficer: LoanOfficerProfile;
  activeAgent?: RealEstateAgentProfile;
  adCampaignDrafts?: AdCampaignDraft[];
  onSaveAdDraft: (draft: AdCampaignDraft) => void;
  pairingUrl?: string;
  onUpdateAdSettings?: (settings: LoanOfficerAdSettings) => void;
}

const ELEVENLABS_VOICES: ElevenLabsVoice[] = [
  {
    id: "21m00Tcm4TlvDq8ikWAM",
    name: "Rachel",
    accent: "American - Warm & Calm",
    gender: "female",
    description: "Ideal for reassuring first-time homebuyers and explanatory videos."
  },
  {
    id: "pNInz6obpgDQGcFmaJgB",
    name: "Adam",
    accent: "American - Deep & Confident",
    gender: "male",
    description: "Authoritative financial broadcast tone, great for market updates."
  },
  {
    id: "EXAVITQu4vr4xnSDxMaL",
    name: "Bella",
    accent: "American - Friendly & Engaging",
    gender: "female",
    description: "High energy and vibrant, perfect for social reels and TikTok."
  },
  {
    id: "ErXwobaYiN019PkySvjV",
    name: "Antoni",
    accent: "American - Approachable & Trustworthy",
    gender: "male",
    description: "Friendly neighborhood mortgage advisor and realtor partner tone."
  },
  {
    id: "yoZ06aMxZJJ28mfd3POQ",
    name: "Sam",
    accent: "American - Dynamic Commercial",
    gender: "male",
    description: "Fast-paced, punchy delivery for scroll-stopping hooks."
  },
  {
    id: "MF3mGyEYCl7XYWbV9V6O",
    name: "Nicole",
    accent: "American - Articulate & Polished",
    gender: "female",
    description: "Refined corporate presentation for luxury and investor ads."
  }
];

const TARGET_AUDIENCES = [
  { id: "First-Time Homebuyers", label: "First-Time Homebuyers", desc: "Down payment assistance, debunking 20% myth" },
  { id: "Down Payment Assistance (DPA) Seekers", label: "DPA Grant Seekers", desc: "State & county grants up to $25k" },
  { id: "Move-Up Buyers & Growing Families", label: "Move-Up Buyers", desc: "Equity rollover, contingency solutions" },
  { id: "VA Military Families & Veterans", label: "VA Military Homebuyers", desc: "0% down, zero monthly PMI, VA benefits" },
  { id: "Refinance & Rate Relief", label: "Refinance & Rate Relief", desc: "Debt consolidation, cash-out, lower rates" },
  { id: "Real Estate Investors (DSCR / Non-QM)", label: "Real Estate Investors", desc: "DSCR cash-flow loans, no W-2 required" },
  { id: "Self-Employed / 1099 Borrowers", label: "Self-Employed / 1099", desc: "Bank statement loans, 1040 write-offs" }
];

const AD_PLATFORMS: { id: AdPlatformType; label: string; icon: string; format: string }[] = [
  { id: "meta", label: "Facebook & Instagram Reels", icon: "f", format: "9:16 Vertical Video & Feed" },
  { id: "google", label: "YouTube Shorts & Video", icon: "▶", format: "Skippable In-Stream & Shorts" },
  { id: "tiktok", label: "TikTok Ads", icon: "♪", format: "Fast 9:16 Mobile Native" },
  { id: "linkedin", label: "LinkedIn Sponsored Video", icon: "in", format: "Professional 16:9 & 1:1" }
];

const SAMPLE_SCREENSHOTS = [
  {
    id: "dpa_map",
    title: "DPA Grant Map & County Finder",
    url: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "buydown_calc",
    title: "2-1 Buydown Savings Scorecard",
    url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "home_tour",
    title: "Homebuyer App Tour & Scorecard",
    url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80"
  }
];

export const AICommercialAdGenerator: React.FC<AICommercialAdGeneratorProps> = ({
  loanOfficer,
  activeAgent,
  adCampaignDrafts = [],
  onSaveAdDraft,
  pairingUrl,
  onUpdateAdSettings
}) => {
  // Inputs
  const [targetAudience, setTargetAudience] = useState<string>("First-Time Homebuyers");
  const [platform, setPlatform] = useState<AdPlatformType>("meta");
  const [customGoal, setCustomGoal] = useState<string>("");
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(SAMPLE_SCREENSHOTS[0].url);
  const [uploadedScreenshotName, setUploadedScreenshotName] = useState<string | null>("DPA Grant Map");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [variations, setVariations] = useState<CommercialScriptVariation[]>([]);
  const [activeVariationId, setActiveVariationId] = useState<string>("variation-1");

  // Audio / ElevenLabs state
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>(ELEVENLABS_VOICES[0].id);
  const [isSynthesizingAudio, setIsSynthesizingAudio] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioDuration, setAudioDuration] = useState<number>(30);
  const [audioCurrentTime, setAudioCurrentTime] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Deployment Modal state
  const [deploymentModalOpen, setDeploymentModalOpen] = useState<boolean>(false);
  const [deployTargetPlatform, setDeployTargetPlatform] = useState<'meta' | 'google'>('meta');
  const [activeDeployVariation, setActiveDeployVariation] = useState<CommercialScriptVariation | null>(null);
  const [liveSpendModalOpen, setLiveSpendModalOpen] = useState<boolean>(false);
  const [socialPushModalOpen, setSocialPushModalOpen] = useState<boolean>(false);

  // Preview modals for Luma / HeyGen
  const [previewMediaModal, setPreviewMediaModal] = useState<{
    type: 'luma' | 'heygen';
    title: string;
    url: string;
    promptOrScript: string;
  } | null>(null);

  const [copiedScriptId, setCopiedScriptId] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSelectedScreenshot(base64);
      setUploadedScreenshotName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateAds = React.useCallback(async () => {
    setIsGenerating(true);
    setAudioUrl(null);
    setIsPlayingAudio(false);

    try {
      const res = await fetch("/api/ads/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetAudience,
          platform,
          screenshot: selectedScreenshot,
          loanOfficer,
          activeAgent,
          adSettings: loanOfficer.adSettings,
          customTopicOrGoal: customGoal,
          tone: "confident, engaging, and authoritative"
        })
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.variations)) {
        setVariations(data.variations);
        if (data.variations.length > 0) {
          setActiveVariationId(data.variations[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to generate commercial scripts:", err);
    } finally {
      setIsGenerating(false);
    }
  }, [targetAudience, platform, selectedScreenshot, loanOfficer, activeAgent, customGoal]);

  // Initial generation on first mount if empty
  React.useEffect(() => {
    handleGenerateAds();
  }, [handleGenerateAds]);

  const activeVariation = variations.find((v) => v.id === activeVariationId) || variations[0];

  const handleSynthesizeAudio = async () => {
    if (!activeVariation) return;
    setIsSynthesizingAudio(true);
    const selectedVoice = ELEVENLABS_VOICES.find((v) => v.id === selectedVoiceId) || ELEVENLABS_VOICES[0];

    try {
      const res = await fetch("/api/ads/elevenlabs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: activeVariation.fullVoiceoverScript,
          voiceId: selectedVoice.id,
          voiceName: selectedVoice.name,
        })
      });

      const data = await res.json();
      if (data.success && data.audioUrl) {
        setAudioUrl(data.audioUrl);
      }
    } catch (err) {
      console.error("Audio synthesis error:", err);
    } finally {
      setIsSynthesizingAudio(false);
    }
  };

  const togglePlayAudio = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      setAudioCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration) {
        setAudioDuration(audioRef.current.duration);
      }
    }
  };

  const handleAudioEnded = () => {
    setIsPlayingAudio(false);
    setAudioCurrentTime(0);
  };

  const handleDownloadAudio = () => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `${activeVariation?.title.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase() || "mortgage-commercial"}-elevenlabs.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleGenerateLumaBRoll = async (promptText: string) => {
    try {
      const res = await fetch("/api/ads/luma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText, aspectRatio: platform === "meta" || platform === "tiktok" ? "9:16" : "16:9" })
      });
      const data = await res.json();
      setPreviewMediaModal({
        type: "luma",
        title: "Luma Dream Machine B-Roll Preview",
        url: data.videoUrl || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1280&q=80",
        promptOrScript: promptText
      });
    } catch (err) {
      console.error("Luma error:", err);
    }
  };

  const handleGenerateHeyGenAvatar = async (scriptText: string) => {
    try {
      const res = await fetch("/api/ads/heygen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script: scriptText })
      });
      const data = await res.json();
      setPreviewMediaModal({
        type: "heygen",
        title: "HeyGen AI Avatar Studio Preview",
        url: data.avatarVideoUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1280&q=80",
        promptOrScript: scriptText
      });
    } catch (err) {
      console.error("HeyGen error:", err);
    }
  };

  const handleCopyScript = (scriptText: string, id: string) => {
    navigator.clipboard.writeText(scriptText);
    setCopiedScriptId(id);
    setTimeout(() => setCopiedScriptId(null), 2000);
  };

  const openDeploymentModal = (v: CommercialScriptVariation, plat: 'meta' | 'google') => {
    setActiveDeployVariation(v);
    setDeployTargetPlatform(plat);
    setDeploymentModalOpen(true);
  };

  const loAdSettings = loanOfficer.adSettings || {
    metaAdAccountId: "act_49182049182",
    dailyBudgetUSD: 25,
    adSpendMonthlyCap: 750
  };

  return (
    <div className="space-y-6">
      
      {/* Hidden audio element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleAudioTimeUpdate}
          onEnded={handleAudioEnded}
          onLoadedMetadata={handleAudioTimeUpdate}
        />
      )}

      {/* Hero Header & Quick Stats */}
      <div className="bg-white rounded-2xl border border-[#EAE7E0] p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-600" />
                Commercial Video & Audio Studio
              </span>
              <span className="text-xs text-[#606C5D]">
                Multi-Model: Gemini 3.8 + ElevenLabs Multilingual v2
              </span>
            </div>
            <h2 className="text-2xl font-black text-[#2D362E] tracking-tight">
              AI Commercial & Ads Generator
            </h2>
            <p className="text-sm text-[#606C5D] max-w-2xl">
              Produce high-converting 30-second video commercials with scene-by-scene storyboards, 
              studio ElevenLabs voiceovers, and 1-click publishing directly to your connected Meta and Google Ad accounts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLiveSpendModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-[#F9F8F4] hover:bg-[#F1EFE9] border border-[#EAE7E0] text-xs space-y-0.5 text-right transition-all cursor-pointer group"
              title="Click to open Live Ad Spend & Billing Sync Hub (Google Ads & Meta Ads API reporting)"
            >
              <div className="text-[10px] uppercase font-bold text-[#606C5D] group-hover:text-[#2D362E] flex items-center justify-end gap-1">
                <span>Ad Spend Guard</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="font-extrabold text-[#2D362E]">
                ${loAdSettings.dailyBudgetUSD || 25}/day · Max ${loAdSettings.adSpendMonthlyCap || 750}/mo
              </div>
            </button>

            <button
              onClick={handleGenerateAds}
              disabled={isGenerating}
              className="px-5 py-3 rounded-xl bg-[#2D362E] hover:bg-[#1f2620] text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
              <span>{isGenerating ? "Generating 3 Variations..." : "Regenerate Commercials"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control Panel: Audience, Platform, & Screenshot Upload */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Step 1: Target Audience Selection */}
        <div className="bg-white rounded-2xl border border-[#EAE7E0] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#606C5D] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#C18C5D]" /> 1. Target Audience
            </span>
            <span className="text-[11px] font-semibold text-[#4A5D4E]">
              {targetAudience}
            </span>
          </div>

          <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
            {TARGET_AUDIENCES.map((aud) => (
              <button
                key={aud.id}
                type="button"
                onClick={() => setTargetAudience(aud.id)}
                className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all cursor-pointer ${
                  targetAudience === aud.id
                    ? "bg-[#2D362E] text-white border-[#2D362E] shadow-2xs font-semibold"
                    : "bg-[#F9F8F4] text-[#2D362E] border-[#EAE7E0] hover:bg-[#F1EFE9]"
                }`}
              >
                <div className="font-bold">{aud.label}</div>
                <div className={`text-[10px] line-clamp-1 ${
                  targetAudience === aud.id ? "text-white/80" : "text-[#606C5D]"
                }`}>
                  {aud.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Platform & Goal */}
        <div className="bg-white rounded-2xl border border-[#EAE7E0] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#606C5D] flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5 text-[#C18C5D]" /> 2. Ad Platform & Focus
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {AD_PLATFORMS.map((plat) => (
              <button
                key={plat.id}
                type="button"
                onClick={() => setPlatform(plat.id)}
                className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer flex flex-col justify-between ${
                  platform === plat.id
                    ? "bg-[#4A5D4E] text-white border-[#4A5D4E] shadow-2xs"
                    : "bg-[#F9F8F4] text-[#2D362E] border-[#EAE7E0] hover:bg-[#F1EFE9]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="w-6 h-6 rounded-lg bg-black/10 flex items-center justify-center font-bold text-xs">
                    {plat.icon}
                  </span>
                  {platform === plat.id && <Check className="w-3.5 h-3.5" />}
                </div>
                <div>
                  <div className="font-bold text-[11px] leading-tight">{plat.label}</div>
                  <div className={`text-[10px] mt-0.5 ${
                    platform === plat.id ? "text-white/80" : "text-[#606C5D]"
                  }`}>
                    {plat.format}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#2D362E] mb-1">
              Custom Angle or Special Offer (Optional)
            </label>
            <input
              type="text"
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              placeholder="e.g., $15,000 Oregon Grant, 5.5% 2-1 Buydown, No PMI"
              className="w-full px-3 py-2 bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl text-xs focus:ring-2 focus:ring-[#4A5D4E] focus:outline-hidden"
            />
          </div>
        </div>

        {/* Step 3: Screenshot / Visual Asset Input */}
        <div className="bg-white rounded-2xl border border-[#EAE7E0] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#606C5D] flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-[#C18C5D]" /> 3. Screenshot or Property Photo
            </span>
            {selectedScreenshot && (
              <button
                onClick={() => {
                  setSelectedScreenshot(null);
                  setUploadedScreenshotName(null);
                }}
                className="text-[10px] text-red-600 hover:underline cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Active Preview */}
          <div className="relative rounded-xl overflow-hidden border border-[#EAE7E0] aspect-video bg-[#F9F8F4] flex items-center justify-center group">
            {selectedScreenshot ? (
              <>
                <img
                  src={selectedScreenshot}
                  alt="Commercial context screenshot"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-white/90 hover:bg-white text-[#2D362E] text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Change Image
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-medium backdrop-blur-xs">
                  {uploadedScreenshotName || "Active Visual"}
                </div>
              </>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="text-center p-4 cursor-pointer hover:bg-[#F1EFE9] transition-colors w-full h-full flex flex-col items-center justify-center"
              >
                <Upload className="w-6 h-6 text-[#606C5D] mb-1" />
                <span className="text-xs font-bold text-[#2D362E]">Upload Screenshot or Photo</span>
                <span className="text-[10px] text-[#606C5D]">PNG, JPG, or Property Listing</span>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Sample Presets */}
          <div>
            <div className="text-[10px] font-bold text-[#606C5D] mb-1.5 uppercase tracking-wider">
              Or pick an instant app feature preset:
            </div>
            <div className="grid grid-cols-3 gap-2">
              {SAMPLE_SCREENSHOTS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => {
                    setSelectedScreenshot(sample.url);
                    setUploadedScreenshotName(sample.title);
                  }}
                  className={`p-1 rounded-lg border text-[10px] font-medium text-left truncate transition-colors cursor-pointer ${
                    selectedScreenshot === sample.url
                      ? "border-[#4A5D4E] bg-[#4A5D4E]/10 font-bold text-[#4A5D4E]"
                      : "border-[#EAE7E0] hover:bg-[#F9F8F4] text-[#2D362E]"
                  }`}
                >
                  <img
                    src={sample.url}
                    alt={sample.title}
                    className="w-full h-10 object-cover rounded-md mb-1"
                  />
                  <div className="truncate">{sample.title.split(" ")[0]} {sample.title.split(" ")[1]}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Variations Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-2">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-[#C18C5D]" />
            <h3 className="text-base font-bold text-[#2D362E]">
              3 Generated 30-Second Commercial Variations
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {variations.map((v, index) => (
              <button
                key={v.id}
                onClick={() => {
                  setActiveVariationId(v.id);
                  setAudioUrl(null);
                  setIsPlayingAudio(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeVariationId === v.id
                    ? "bg-[#2D362E] text-white shadow-xs"
                    : "bg-[#F9F8F4] text-[#606C5D] hover:bg-[#F1EFE9] border border-[#EAE7E0]"
                }`}
              >
                <span>Variation {index + 1}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/20">
                  {v.totalDuration || "30s"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Variation Display */}
        {activeVariation ? (
          <div className="bg-white rounded-2xl border border-[#EAE7E0] p-6 shadow-xs space-y-6">
            
            {/* Variation Header & Hook */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 p-4 rounded-xl bg-[#F9F8F4] border border-[#EAE7E0]">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#4A5D4E] text-white">
                    {activeVariation.angle}
                  </span>
                  <span className="text-xs text-[#606C5D] font-mono">
                    Target: {activeVariation.targetAudience} · Platform: {activeVariation.platform.toUpperCase()}
                  </span>
                </div>
                <h3 className="text-xl font-black text-[#2D362E]">
                  {activeVariation.title}
                </h3>
                <p className="text-sm font-semibold text-[#4A5D4E] italic">
                  "{activeVariation.hook}"
                </p>
              </div>

              {/* Action Buttons: Deploy to Facebook / Google Ads & Push Ad to Post Hub */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                <button
                  onClick={() => setSocialPushModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#C18C5D] hover:bg-[#b07b4c] text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  title="Push Ad to Post / Live Sync across Instagram, Facebook, Google GMB/Maps, TikTok, LinkedIn & YouTube"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Push Ad to Post (All Social & Google)</span>
                </button>

                <button
                  onClick={() => openDeploymentModal(activeVariation, 'meta')}
                  className="px-4 py-2.5 rounded-xl bg-[#1877F2] hover:bg-blue-600 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Deploy to Facebook Ads</span>
                </button>

                <button
                  onClick={() => openDeploymentModal(activeVariation, 'google')}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Deploy to Google Ads</span>
                </button>
              </div>
            </div>

            {/* ElevenLabs Voice Selection Toolbar */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
                    XI
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#2D362E] flex items-center gap-2">
                      <span>ElevenLabs Multilingual v2 Voice Studio</span>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        AI TTS Active
                      </span>
                    </div>
                    <div className="text-[11px] text-[#606C5D]">
                      Synthesize ultra-realistic 30s broadcast audio with natural breathing and pacing.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Voice Selector */}
                  <select
                    value={selectedVoiceId}
                    onChange={(e) => setSelectedVoiceId(e.target.value)}
                    className="px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-semibold text-[#2D362E] focus:outline-hidden cursor-pointer"
                  >
                    {ELEVENLABS_VOICES.map((voice) => (
                      <option key={voice.id} value={voice.id}>
                        {voice.name} ({voice.accent})
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={handleSynthesizeAudio}
                    disabled={isSynthesizingAudio}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Wand2 className={`w-3.5 h-3.5 ${isSynthesizingAudio ? "animate-spin" : ""}`} />
                    <span>{isSynthesizingAudio ? "Synthesizing..." : "Synthesize 30s Audio"}</span>
                  </button>
                </div>
              </div>

              {/* Audio Player Bar (when generated) */}
              {audioUrl && (
                <div className="p-3 bg-white rounded-xl border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={togglePlayAudio}
                      className="w-10 h-10 rounded-full bg-[#2D362E] hover:bg-[#1f2620] text-white flex items-center justify-center transition-transform hover:scale-105 cursor-pointer shrink-0"
                      aria-label={isPlayingAudio ? "Pause voiceover" : "Play voiceover"}
                    >
                      {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>

                    <div className="space-y-1 flex-1 sm:w-60">
                      <div className="flex justify-between text-[11px] font-bold text-[#2D362E]">
                        <span>Voice: {ELEVENLABS_VOICES.find(v => v.id === selectedVoiceId)?.name}</span>
                        <span className="font-mono text-[#606C5D]">
                          {Math.floor(audioCurrentTime)}s / {Math.floor(audioDuration || 30)}s
                        </span>
                      </div>
                      <div className="w-full bg-[#EAE7E0] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-600 h-full transition-all duration-100"
                          style={{
                            width: `${(audioCurrentTime / (audioDuration || 30)) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Equalizer Visualizer animation when playing */}
                  {isPlayingAudio && (
                    <div className="flex items-end gap-1 h-5 px-3">
                      <div className="w-1 bg-amber-500 rounded-full animate-pulse h-3" />
                      <div className="w-1 bg-amber-600 rounded-full animate-bounce h-5" />
                      <div className="w-1 bg-amber-500 rounded-full animate-pulse h-4" />
                      <div className="w-1 bg-amber-600 rounded-full animate-bounce h-2" />
                      <div className="w-1 bg-amber-500 rounded-full animate-pulse h-5" />
                    </div>
                  )}

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={handleDownloadAudio}
                      className="px-3 py-1.5 bg-[#F9F8F4] hover:bg-[#F1EFE9] border border-[#EAE7E0] rounded-xl text-xs font-bold text-[#2D362E] flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download MP3</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 4-Scene Breakdown Table / Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[#2D362E] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#C18C5D]" />
                  <span>Scene-by-Scene Storyboard Breakdown (30s Total)</span>
                </h4>
                <button
                  onClick={() => handleCopyScript(activeVariation.fullVoiceoverScript, activeVariation.id)}
                  className="text-xs font-semibold text-[#4A5D4E] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedScriptId === activeVariation.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedScriptId === activeVariation.id ? "Script Copied" : "Copy Full Voiceover"}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeVariation.scenes.map((scene) => (
                  <div
                    key={scene.sceneNumber}
                    className="p-4 rounded-xl border border-[#EAE7E0] bg-[#FDFBF7] space-y-3 flex flex-col justify-between hover:border-[#4A5D4E] transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-[#2D362E] text-white">
                          Scene {scene.sceneNumber}
                        </span>
                        <span className="text-xs font-mono font-bold text-[#C18C5D] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {scene.timecode}
                        </span>
                      </div>

                      {/* Visual Direction */}
                      <div>
                        <div className="text-[10px] uppercase font-bold text-[#606C5D]">Visual Shot & Camera Direction</div>
                        <p className="text-xs text-[#2D362E] font-medium leading-relaxed mt-0.5">
                          {scene.visual}
                        </p>
                      </div>

                      {/* On-Screen Text Overlay */}
                      <div className="p-2 rounded-lg bg-white border border-[#EAE7E0]">
                        <div className="text-[10px] uppercase font-bold text-[#4A5D4E]">On-Screen Kinetic Text</div>
                        <div className="text-xs font-black text-[#2D362E] mt-0.5">
                          {scene.onScreenText}
                        </div>
                      </div>

                      {/* Spoken Voiceover */}
                      <div>
                        <div className="text-[10px] uppercase font-bold text-[#606C5D]">Spoken Voiceover</div>
                        <p className="text-xs text-[#2D362E] italic leading-relaxed mt-0.5 bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                          "{scene.voiceover}"
                        </p>
                      </div>
                    </div>

                    {/* Footer with Audio cue & Luma / HeyGen generation shortcuts */}
                    <div className="pt-2 border-t border-[#EAE7E0] flex items-center justify-between text-[11px]">
                      <span className="text-[#606C5D] italic truncate max-w-[170px]" title={scene.audioCue}>
                        ♫ {scene.audioCue}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleGenerateLumaBRoll(scene.bRollPrompt || scene.visual)}
                          className="px-2 py-1 rounded bg-white hover:bg-[#F1EFE9] border border-[#EAE7E0] text-[10px] font-bold text-[#2D362E] cursor-pointer"
                          title="Generate B-Roll with Luma AI"
                        >
                          Luma B-Roll
                        </button>
                        <button
                          onClick={() => handleGenerateHeyGenAvatar(scene.voiceover)}
                          className="px-2 py-1 rounded bg-white hover:bg-[#F1EFE9] border border-[#EAE7E0] text-[10px] font-bold text-[#2D362E] cursor-pointer"
                          title="Generate Avatar with HeyGen"
                        >
                          AI Avatar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Complete Voiceover & Call-to-Action Card */}
            <div className="p-4 rounded-xl bg-[#F9F8F4] border border-[#EAE7E0] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#2D362E] uppercase tracking-wider">
                  Full 30-Second Commercial Script (65–75 Words)
                </span>
                <span className="text-[11px] font-semibold text-[#606C5D]">
                  Estimated Spoken Time: 28–30 seconds
                </span>
              </div>

              <div className="p-3 bg-white rounded-xl border border-[#EAE7E0] text-xs leading-relaxed text-[#2D362E]">
                {activeVariation.fullVoiceoverScript}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-[#EAE7E0]">
                  <div className="text-[10px] uppercase font-bold text-[#606C5D]">Primary Call-to-Action</div>
                  <div className="font-bold text-[#2D362E] mt-0.5">{activeVariation.callToAction}</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-[#EAE7E0]">
                  <div className="text-[10px] uppercase font-bold text-[#606C5D]">Mandatory Compliance Footer</div>
                  <div className="text-[11px] text-[#606C5D] mt-0.5">{activeVariation.disclaimer}</div>
                </div>
              </div>
            </div>

            {/* Bottom Deployment Actions */}
            <div className="p-4 rounded-xl bg-[#2D362E] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="font-bold text-sm">Ready to Publish this Commercial?</div>
                <div className="text-xs text-white/80">
                  Pre-fills headline, post copy, tracking pixel, and links to your authorized ad spend card.
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => openDeploymentModal(activeVariation, 'meta')}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#1877F2] hover:bg-blue-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Deploy to Facebook</span>
                </button>
                <button
                  onClick={() => openDeploymentModal(activeVariation, 'google')}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Deploy to Google</span>
                </button>
              </div>
            </div>

          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-[#EAE7E0] space-y-3">
            <RefreshCw className="w-8 h-8 text-[#C18C5D] animate-spin mx-auto" />
            <h4 className="font-bold text-[#2D362E]">Synthesizing Commercial Script Variations...</h4>
            <p className="text-xs text-[#606C5D]">
              Gemini is breaking down your visual screenshots and crafting 3 targeted 30-second scripts.
            </p>
          </div>
        )}
      </div>

      {/* Deployment Modal */}
      <AdDeploymentModal
        isOpen={deploymentModalOpen}
        onClose={() => setDeploymentModalOpen(false)}
        variation={activeDeployVariation}
        targetPlatform={deployTargetPlatform}
        loanOfficer={loanOfficer}
        activeAgent={activeAgent}
        adSettings={loanOfficer.adSettings}
        pairingUrl={pairingUrl}
        hasAudioSynthesized={!!audioUrl}
        onSaveCampaignDraft={onSaveAdDraft}
      />

      {/* Luma / HeyGen Media Preview Modal */}
      {previewMediaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#EAE7E0] space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-[#2D362E] flex items-center gap-2">
                <Video className="w-4 h-4 text-[#C18C5D]" />
                {previewMediaModal.title}
              </h4>
              <button
                onClick={() => setPreviewMediaModal(null)}
                className="w-7 h-7 rounded-lg bg-[#F9F8F4] hover:bg-[#F1EFE9] flex items-center justify-center text-[#606C5D] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-xl overflow-hidden border border-[#EAE7E0] aspect-video bg-black relative">
              <img
                src={previewMediaModal.url}
                alt="AI Video Render"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
                <div className="text-white text-xs space-y-0.5">
                  <div className="font-bold">
                    {previewMediaModal.type === "luma" ? "Luma Dream Machine Render" : "HeyGen Photorealistic Avatar"}
                  </div>
                  <div className="text-[10px] text-white/80 line-clamp-2">
                    {previewMediaModal.promptOrScript}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-[#606C5D] text-[11px]">
                {previewMediaModal.type === "luma" ? "9:16 Vertical B-Roll (4K 60fps)" : "1080p AI Studio Avatar"}
              </span>
              <button
                onClick={() => setPreviewMediaModal(null)}
                className="px-4 py-2 bg-[#2D362E] text-white rounded-xl font-bold cursor-pointer hover:bg-[#1f2620]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Ad Spend & Billing Sync Modal */}
      <LiveAdSpendSyncModal
        isOpen={liveSpendModalOpen}
        onClose={() => setLiveSpendModalOpen(false)}
        loanOfficer={loanOfficer}
        adSettings={loAdSettings}
      />

      {/* Universal Social & Google Push Ad to Post Modal */}
      <SocialMediaPushModal
        isOpen={socialPushModalOpen}
        onClose={() => setSocialPushModalOpen(false)}
        variation={activeVariation}
        loanOfficer={loanOfficer}
        activeAgent={activeAgent}
        adSettings={loAdSettings}
        pairingUrl={pairingUrl}
      />

    </div>
  );
};
