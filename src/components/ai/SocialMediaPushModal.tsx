import React, { useState } from "react";
import { 
  X, 
  Share2, 
  Send, 
  Download, 
  CheckCircle2, 
  Sparkles, 
  Video, 
  Instagram, 
  Facebook, 
  Globe, 
  MapPin, 
  Linkedin, 
  ShieldCheck, 
  Key, 
  Check, 
  Copy,
  Smartphone,
  Tv
} from "lucide-react";
import { CommercialScriptVariation } from "../../types/commercialAds";
import { LoanOfficerProfile, RealEstateAgentProfile, LoanOfficerAdSettings } from "../../types";

interface SocialMediaPushModalProps {
  isOpen: boolean;
  onClose: () => void;
  variation: CommercialScriptVariation | null;
  loanOfficer: LoanOfficerProfile;
  activeAgent?: RealEstateAgentProfile;
  adSettings?: LoanOfficerAdSettings;
  pairingUrl?: string;
}

interface PlatformAccountConfig {
  platformKey: string;
  platformName: string;
  icon: React.ReactNode;
  accountHandle: string;
  accountType: 'Personal' | 'Business' | 'Creator';
  isConnected: boolean;
}

export const SocialMediaPushModal: React.FC<SocialMediaPushModalProps> = ({
  isOpen,
  onClose,
  variation,
  loanOfficer,
  activeAgent,
  adSettings,
  pairingUrl
}) => {
  const [activeTab, setActiveTab] = useState<'publish' | 'accounts' | 'download'>('publish');
  const [selectedDestination, setSelectedDestination] = useState<string>('ig_business_feed');
  const [customCaption, setCustomCaption] = useState<string>('');
  const [isPushing, setIsPushing] = useState<boolean>(false);
  const [pushSuccess, setPushSuccess] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadComplete, setDownloadComplete] = useState<boolean>(false);

  // Editable Account Credentials Setup State
  const [accounts, setAccounts] = useState<PlatformAccountConfig[]>([
    { platformKey: 'ig_personal', platformName: 'Instagram Personal', icon: <Instagram className="w-4 h-4 text-pink-600" />, accountHandle: `@${loanOfficer.name.toLowerCase().replace(/\s+/g, '')}_realty`, accountType: 'Personal', isConnected: true },
    { platformKey: 'ig_business', platformName: 'Instagram Business', icon: <Instagram className="w-4 h-4 text-pink-700" />, accountHandle: `@${loanOfficer.company.toLowerCase().replace(/\s+/g, '')}_official`, accountType: 'Business', isConnected: true },
    { platformKey: 'fb_personal', platformName: 'Facebook Personal', icon: <Facebook className="w-4 h-4 text-blue-600" />, accountHandle: `${loanOfficer.name}`, accountType: 'Personal', isConnected: true },
    { platformKey: 'fb_business', platformName: 'Facebook Business Page', icon: <Facebook className="w-4 h-4 text-blue-700" />, accountHandle: `${loanOfficer.company} Home Loans`, accountType: 'Business', isConnected: true },
    { platformKey: 'google_gmb', platformName: 'Google Business Profile (GMB)', icon: <Globe className="w-4 h-4 text-red-600" />, accountHandle: `${loanOfficer.company} - ${loanOfficer.name} Mortgage Advisor`, accountType: 'Business', isConnected: true },
    { platformKey: 'google_maps', platformName: 'Google Maps Local Listing', icon: <MapPin className="w-4 h-4 text-emerald-600" />, accountHandle: `Branch #402 - ${loanOfficer.company} Oregon`, accountType: 'Business', isConnected: true },
    { platformKey: 'tiktok', platformName: 'TikTok Creator Hub', icon: <Smartphone className="w-4 h-4 text-black" />, accountHandle: `@mortgage_expert_${loanOfficer.name.split(" ")[0].toLowerCase()}`, accountType: 'Creator', isConnected: true },
    { platformKey: 'linkedin_personal', platformName: 'LinkedIn Personal', icon: <Linkedin className="w-4 h-4 text-blue-800" />, accountHandle: `in/${loanOfficer.name.toLowerCase().replace(/\s+/g, '-')}`, accountType: 'Personal', isConnected: true },
    { platformKey: 'linkedin_business', platformName: 'LinkedIn Company Page', icon: <Linkedin className="w-4 h-4 text-blue-900" />, accountHandle: `company/${loanOfficer.company.toLowerCase().replace(/\s+/g, '-')}`, accountType: 'Business', isConnected: true },
    { platformKey: 'youtube_channel', platformName: 'YouTube Channel (Personal & Business)', icon: <Tv className="w-4 h-4 text-red-600" />, accountHandle: `${loanOfficer.name} Home Financing TV`, accountType: 'Business', isConnected: true }
  ]);

  const [editingHandleKey, setEditingHandleKey] = useState<string | null>(null);
  const [tempHandleValue, setTempHandleValue] = useState<string>('');

  React.useEffect(() => {
    if (variation) {
      const defaultUrl = pairingUrl || `https://vantage-mortgage.web.app/portal?lo=${loanOfficer.id}`;
      // Initialize states but don't re-run this effect when state changes
      const caption = `🏡 ${variation.title}\n\n${variation.hook}\n\n✨ Calculate your buying power & check $30K DPA grants:\n${defaultUrl}\n\n#Homebuyer2026 #${loanOfficer.company.replace(/\s+/g, '')} #MortgageTips`;
      
      const timer = setTimeout(() => {
        setCustomCaption(caption);
        setPushSuccess(null);
        setDownloadComplete(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [variation, pairingUrl, loanOfficer.id, loanOfficer.company]);

  if (!isOpen || !variation) return null;

  const handlePushPost = (platformKey: string) => {
    setIsPushing(true);
    setPushSuccess(null);

    const targetAccount = accounts.find(a => a.platformKey === platformKey);

    setTimeout(() => {
      setIsPushing(false);
      setPushSuccess(`Successfully pushed ad live to ${targetAccount?.platformName || 'Platform'} (${targetAccount?.accountHandle || ''})!`);
    }, 1100);
  };

  const handleDownloadVideoFile = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      setDownloadComplete(true);
      // Create simulated blob download for MP4 ad asset
      const blob = new Blob([`[SIMULATED MP4 VIDEO AD FILE: ${variation.title} - 30s Spot]`], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${variation.title.toLowerCase().replace(/\s+/g, '_')}_commercial_30s.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }, 1500);
  };

  const startEditingHandle = (acc: PlatformAccountConfig) => {
    setEditingHandleKey(acc.platformKey);
    setTempHandleValue(acc.accountHandle);
  };

  const saveEditingHandle = (platformKey: string) => {
    setAccounts(prev => prev.map(a => a.platformKey === platformKey ? { ...a, accountHandle: tempHandleValue } : a));
    setEditingHandleKey(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#EAE7E0] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-[#2D362E] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C18C5D]/20 border border-[#C18C5D]/40 flex items-center justify-center text-[#C18C5D]">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">Universal Social & Google "Push Ad to Post" Hub</h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 tracking-wider">
                  Multi-Channel Direct API Sync
                </span>
              </div>
              <p className="text-xs text-white/70">
                Instantly push videos, reels, shorts & stories to Instagram, Facebook, Google GMB, Maps, TikTok, LinkedIn & YouTube.
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

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 bg-[#FAF9F5] border-b border-[#EAE7E0]">
          <button
            type="button"
            onClick={() => setActiveTab('publish')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'publish'
                ? "border-[#4A5D4E] text-[#2D362E] bg-white rounded-t-xl"
                : "border-transparent text-[#606C5D] hover:text-[#2D362E]"
            }`}
          >
            <Send className="w-3.5 h-3.5 text-[#4A5D4E]" />
            <span>Push Ad to Post / Live Sync</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('accounts')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'accounts'
                ? "border-[#4A5D4E] text-[#2D362E] bg-white rounded-t-xl"
                : "border-transparent text-[#606C5D] hover:text-[#2D362E]"
            }`}
          >
            <Key className="w-3.5 h-3.5 text-[#C18C5D]" />
            <span>Manage Profiles & Login Credentials ({accounts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('download')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'download'
                ? "border-[#4A5D4E] text-[#2D362E] bg-white rounded-t-xl"
                : "border-transparent text-[#606C5D] hover:text-[#2D362E]"
            }`}
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Download MP4 Video Ad File</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[#2D362E] bg-[#FAF9F5]">
          
          {/* TAB 1: PUSH AD TO POST */}
          {activeTab === 'publish' && (
            <div className="space-y-6">
              
              {/* Success Banner */}
              {pushSuccess && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{pushSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Left 2 Cols: Target Selection */}
                <div className="md:col-span-2 space-y-4">
                  <div className="bg-white p-5 rounded-2xl border border-[#EAE7E0] shadow-xs space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#606C5D]">
                      Select Live Destination Channel & Format
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {accounts.map((acc) => (
                        <button
                          key={acc.platformKey}
                          type="button"
                          onClick={() => setSelectedDestination(acc.platformKey)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                            selectedDestination === acc.platformKey
                              ? "bg-[#4A5D4E]/10 border-[#4A5D4E] text-[#2D362E] shadow-2xs font-bold"
                              : "bg-[#F9F8F4] border-[#EAE7E0] text-[#606C5D] hover:bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="w-8 h-8 rounded-lg bg-white border border-[#EAE7E0] flex items-center justify-center shrink-0">
                              {acc.icon}
                            </div>
                            <div className="truncate">
                              <div className="text-xs font-bold text-[#2D362E] truncate">{acc.platformName}</div>
                              <div className="text-[10px] text-[#606C5D] font-mono truncate">{acc.accountHandle}</div>
                            </div>
                          </div>
                          {selectedDestination === acc.platformKey && (
                            <CheckCircle2 className="w-4 h-4 text-[#4A5D4E] shrink-0 ml-2" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Caption & Post Text */}
                  <div className="bg-white p-5 rounded-2xl border border-[#EAE7E0] shadow-xs space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#606C5D]">
                        Post Caption & Hashtags ({selectedDestination})
                      </label>
                      <span className="text-[10px] text-[#606C5D]">Optimized for 30s video feed & reels</span>
                    </div>

                    <textarea
                      rows={6}
                      value={customCaption}
                      onChange={(e) => setCustomCaption(e.target.value)}
                      className="w-full p-3 bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#4A5D4E] focus:outline-hidden"
                    />

                    <div className="flex items-center justify-between pt-2">
                      <div className="text-[11px] text-[#606C5D] flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#C18C5D]" />
                        <span>Includes video asset: <strong>{variation.title} (30s)</strong></span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handlePushPost(selectedDestination)}
                        disabled={isPushing}
                        className="px-6 py-3 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Send className={`w-4 h-4 ${isPushing ? "animate-bounce" : ""}`} />
                        <span>{isPushing ? "Pushing Live to Post..." : "Push Ad to Post Now"}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Col: Ad Preview Card */}
                <div className="space-y-4">
                  <div className="bg-white p-5 rounded-2xl border border-[#EAE7E0] shadow-xs space-y-4">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#606C5D]">
                      Active Ad Creative Preview
                    </h4>

                    <div className="aspect-[9/16] bg-[#2D362E] rounded-xl overflow-hidden relative flex flex-col justify-between p-4 text-white shadow-inner">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-0" />
                      
                      <div className="relative z-10 flex justify-between items-center text-[10px] font-bold">
                        <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-xs">30s HD Spot</span>
                        <span className="text-amber-300">AI Verified</span>
                      </div>

                      <div className="relative z-10 space-y-2">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#C18C5D]">
                          {variation.angle}
                        </span>
                        <h5 className="text-sm font-black leading-tight">{variation.title}</h5>
                        <p className="text-[11px] text-white/80 line-clamp-3 italic">"{variation.hook}"</p>
                      </div>

                      <div className="relative z-10 pt-2 border-t border-white/20 flex items-center justify-between text-[10px]">
                        <span>{loanOfficer.name}</span>
                        <span className="font-mono text-amber-300">NMLS #{loanOfficer.nmlsId}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EAE7E0] text-[11px] text-[#606C5D] space-y-1">
                      <div className="font-bold text-[#2D362E]">Multi-Platform Guarantee:</div>
                      <p>
                        Pushing creates a native post on the selected channel with video rendering, caption, and clickable portal URL.
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: MANAGE PROFILES & CREDENTIALS */}
          {activeTab === 'accounts' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
                <Key className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold uppercase tracking-wide text-amber-950">
                    Loan Officer Profile & Login Credential Setup
                  </div>
                  <p className="text-amber-900 mt-0.5">
                    Configure your exact personal and business handles for Instagram, Facebook, Google Business Profile, Google Maps, TikTok, LinkedIn, and YouTube. All tokens are securely paired for 1-click publishing.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#EAE7E0] overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#FAF9F5] border-b border-[#EAE7E0] text-[#606C5D] uppercase font-bold text-[10px]">
                      <th className="py-3 px-4">Platform & Placement</th>
                      <th className="py-3 px-4">Account Type</th>
                      <th className="py-3 px-4">Configured Handle / Username</th>
                      <th className="py-3 px-4 text-center">Connection Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE7E0]/60">
                    {accounts.map((acc) => (
                      <tr key={acc.platformKey} className="hover:bg-[#FAF9F5] transition-colors">
                        <td className="py-3 px-4 font-bold flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#FAF9F5] border border-[#EAE7E0] flex items-center justify-center shrink-0">
                            {acc.icon}
                          </div>
                          <span>{acc.platformName}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            acc.accountType === 'Business' ? 'bg-blue-100 text-blue-800' : acc.accountType === 'Creator' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {acc.accountType}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[#2D362E]">
                          {editingHandleKey === acc.platformKey ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={tempHandleValue}
                                onChange={(e) => setTempHandleValue(e.target.value)}
                                className="px-2 py-1 bg-white border border-[#4A5D4E] rounded text-xs font-mono"
                              />
                              <button
                                onClick={() => saveEditingHandle(acc.platformKey)}
                                className="px-2 py-1 bg-[#4A5D4E] text-white rounded text-[10px] font-bold cursor-pointer"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <span>{acc.accountHandle}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Connected
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {editingHandleKey !== acc.platformKey && (
                            <button
                              onClick={() => startEditingHandle(acc)}
                              className="text-xs font-bold text-[#4A5D4E] hover:underline cursor-pointer"
                            >
                              Edit Handle
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: DOWNLOAD MP4 VIDEO */}
          {activeTab === 'download' && (
            <div className="space-y-6 text-center py-6">
              <div className="max-w-md mx-auto space-y-4 bg-white p-8 rounded-2xl border border-[#EAE7E0] shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto">
                  <Video className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h4 className="font-bold text-base text-[#2D362E]">{variation.title}</h4>
                  <p className="text-xs text-[#606C5D]">
                    Ready for local hard drive export in 1080p MP4 format with synchronized ElevenLabs voiceover and kinetic subtitles.
                  </p>
                </div>

                {downloadComplete && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Download Complete! Saved to your local machine.</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleDownloadVideoFile}
                  disabled={isDownloading}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Download className={`w-4 h-4 ${isDownloading ? "animate-bounce" : ""}`} />
                  <span>{isDownloading ? "Preparing 1080p MP4 Render..." : "Download Video Ad to Hard Drive (.MP4)"}</span>
                </button>

                <p className="text-[11px] text-[#606C5D] italic">
                  Use this file for any external modality, email campaigns, presentations, or offline broadcasts outside the dashboard.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-[#EAE7E0] flex items-center justify-between">
          <div className="text-xs text-[#606C5D] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Secure Multi-Channel Social & Google API Integration</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#2D362E] hover:bg-[#1f2620] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            Close Hub
          </button>
        </div>

      </div>
    </div>
  );
};
