import React, { useState, useEffect, useCallback } from "react";
import { 
  Film, 
  Play, 
  Share2, 
  Server, 
  Check, 
  RefreshCw, 
  Tag, 
  MapPin, 
  Search, 
  Edit3, 
  X, 
  Tv, 
  Maximize2,
  Plus,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Layers,
  Radio
} from "lucide-react";

interface SyncedAd {
  id: string;
  title: string;
  adCopy: string;
  videoUrl: string;
  platformTarget: string;
  campaignGoal: string;
  status: string;
  source: string;
  tags?: string[];
  propertyAddress?: string;
  propertyId?: string;
}

interface AdAssetsLibraryProps {
  onNavigateToCampaignBuilder?: () => void;
  loanOfficerName?: string;
}

export const AdAssetsLibrary: React.FC<AdAssetsLibraryProps> = ({
  onNavigateToCampaignBuilder
}) => {
  const [ads, setAds] = useState<SyncedAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  // Modals
  const [editingAd, setEditingAd] = useState<SyncedAd | null>(null);
  const [theatreAd, setTheatreAd] = useState<SyncedAd | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Edit form state
  const [editTags, setEditTags] = useState("");
  const [editAddress, setEditAddress] = useState("");

  // Ingest modal form state
  const [importTitle, setImportTitle] = useState("");
  const [importCopy, setImportCopy] = useState("");
  const [importPlatform, setImportPlatform] = useState("Facebook Ads");
  const [importGoal, setImportGoal] = useState("Lead Generation");
  const [importVideoUrl, setImportVideoUrl] = useState("");
  const [importAddress, setImportAddress] = useState("");
  const [isSubmittingImport, setIsSubmittingImport] = useState(false);

  const fetchAds = useCallback(async () => {
    try {
      // 1. Fetch from server backend
      const res = await fetch("/api/ads/synced?loId=lo_1");
      let serverAds: SyncedAd[] = [];
      if (res.ok) {
        const data = await res.json();
        serverAds = (data.ads || []).map((ad: any) => ({
          ...ad,
          tags: ad.tags || (ad.title?.includes("USDA") ? ["USDA", "Zero Down"] : ad.title?.includes("DPA") ? ["DPA", "First-Time Buyer"] : ["Facebook Ad", "Vantage AI"]),
          propertyAddress: ad.propertyAddress || (ad.title?.includes("USDA") ? "123 Umatilla Dr, Umatilla, OR" : "")
        }));
      }

      // 2. Also check local storage for any pushed ads from Vantage AI Studio queue
      let localAds: SyncedAd[] = [];
      try {
        const localSaved = localStorage.getItem("fthb_synced_portal_ads_v1");
        if (localSaved) {
          const parsed = JSON.parse(localSaved);
          if (Array.isArray(parsed)) {
            localAds = parsed.map((item: any) => ({
              id: item.id || `local_${Math.random()}`,
              title: item.title || item.campaignName || "Synced Vantage AI Ad",
              adCopy: item.adCopy || item.copy || "",
              videoUrl: item.videoUrl || "",
              platformTarget: item.platformTarget || item.platform || "Facebook Ads",
              campaignGoal: item.campaignGoal || "Lead Generation",
              status: item.status || "Ready for Review",
              source: "Vantage AI Studio Ads Engine",
              tags: item.tags || ["Vantage AI", "Meta Ready"],
              propertyAddress: item.propertyAddress || ""
            }));
          }
        }
      } catch (err) {
        console.warn("Error reading local ad queue:", err);
      }

      // Merge and deduplicate
      const seen = new Set<string>();
      const combined: SyncedAd[] = [];
      for (const ad of [...serverAds, ...localAds]) {
        if (!seen.has(ad.id)) {
          seen.add(ad.id);
          combined.push(ad);
        }
      }

      setAds(combined);
    } catch (e) {
      console.error("Failed to fetch synced ads", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const run = async () => {
      await Promise.resolve();
      if (active) {
        await fetchAds();
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [fetchAds]);

  const handlePublish = (id: string) => {
    setPublishingId(id);
    setTimeout(() => {
      setAds(prev => prev.map(a => a.id === id ? { ...a, status: "Published Live" } : a));
      setPublishingId(null);
    }, 2000);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openEditModal = (ad: SyncedAd) => {
    setEditingAd(ad);
    setEditTags((ad.tags || []).join(", "));
    setEditAddress(ad.propertyAddress || "");
  };

  const saveEdits = async () => {
    if (!editingAd) return;
    const tagsArray = editTags.split(",").map(t => t.trim()).filter(Boolean);
    
    // Optimistic update
    setAds(prev => prev.map(a => a.id === editingAd.id ? { ...a, tags: tagsArray, propertyAddress: editAddress } : a));
    
    try {
      await fetch(`/api/ads/synced/${editingAd.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: tagsArray, propertyAddress: editAddress })
      });
    } catch (e) {
      console.error(e);
    }
    setEditingAd(null);
  };

  const handleManualIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importTitle || !importCopy) return;

    setIsSubmittingImport(true);
    try {
      const payload = {
        title: importTitle,
        adCopy: importCopy,
        platformTarget: importPlatform,
        campaignGoal: importGoal,
        videoUrl: importVideoUrl,
        propertyAddress: importAddress,
        status: "Draft Ready for Review",
        source: "Vantage AI Studio Ads Engine",
        loId: "lo_1",
        tags: [importPlatform, "Vantage AI", "Facebook Ad"]
      };

      const res = await fetch("/api/webhooks/ads-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        // Also save to localStorage cache
        try {
          const existing = JSON.parse(localStorage.getItem("fthb_synced_portal_ads_v1") || "[]");
          existing.unshift({
            id: `ad_${Date.now()}`,
            ...payload
          });
          localStorage.setItem("fthb_synced_portal_ads_v1", JSON.stringify(existing));
        } catch {
          // ignore
        }

        // Refresh list
        await fetchAds();
        setIsImportModalOpen(false);
        setImportTitle("");
        setImportCopy("");
        setImportVideoUrl("");
        setImportAddress("");
      }
    } catch (err) {
      console.error("Manual ingest failed:", err);
    } finally {
      setIsSubmittingImport(false);
    }
  };

  const handleDeployToCampaignBuilder = (ad: SyncedAd) => {
    try {
      // Store in campaign builder draft storage
      const draft = {
        id: `campaign_${Date.now()}`,
        name: ad.title,
        platform: ad.platformTarget.includes("Facebook") ? "Meta / Facebook" : ad.platformTarget,
        adCopy: ad.adCopy,
        mediaUrl: ad.videoUrl,
        propertyAddress: ad.propertyAddress || "",
        status: "Draft",
        timestamp: new Date().toISOString()
      };
      const existing = JSON.parse(localStorage.getItem("fthb_ad_campaign_drafts_v1") || "[]");
      existing.unshift(draft);
      localStorage.setItem("fthb_ad_campaign_drafts_v1", JSON.stringify(existing));
    } catch (err) {
      console.warn("Could not save to campaign drafts:", err);
    }

    if (onNavigateToCampaignBuilder) {
      onNavigateToCampaignBuilder();
    }
  };

  // Extract all unique tags for filter pills
  const allTags = Array.from(new Set(ads.flatMap(a => a.tags || []))).sort();
  const filters = ["All", "Inbox", "Published", ...allTags];

  const filteredAds = ads.filter(ad => {
    const matchesSearch = ad.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ad.adCopy?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (ad.propertyAddress && ad.propertyAddress.toLowerCase().includes(searchQuery.toLowerCase()));
    
    let matchesFilter = true;
    if (activeFilter === "Inbox") matchesFilter = ad.status !== "Published Live";
    else if (activeFilter === "Published") matchesFilter = ad.status === "Published Live";
    else if (activeFilter !== "All") matchesFilter = (ad.tags || []).includes(activeFilter);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-white">
          <div className="p-2.5 bg-blue-600/30 rounded-lg border border-blue-400/30 backdrop-blur-sm">
            <Server className="w-7 h-7 text-blue-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-xl">AI Commercial & Video Ads Vault</h3>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Radio className="w-3 h-3 animate-pulse" /> Live Sync Active
              </span>
            </div>
            <p className="text-blue-200 text-xs mt-0.5">
              Inbound bridge for scripts & commercials pushed from Vantage AI Studio
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-blue-300 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search assets, copy..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 w-56 text-xs"
            />
          </div>

          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow transition-colors"
            title="Paste or import ad copy manually"
          >
            <Plus className="w-4 h-4" /> Ingest Ad Script
          </button>

          {onNavigateToCampaignBuilder && (
            <button 
              onClick={onNavigateToCampaignBuilder}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow transition-colors"
              title="Jump to Meta & Google Ads Campaign Builder"
            >
              <Layers className="w-4 h-4" /> Campaign Builder <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button 
            onClick={fetchAds} 
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors" 
            title="Refresh Sync with Vantage Engine"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Sync Status Callout */}
      <div className="bg-blue-50/70 border-b border-blue-100 px-5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-blue-900">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Vantage AI Studio Integration:</strong> Ads pushed from Vantage AI Studio arrive automatically at 
            <code className="bg-blue-100/80 px-1.5 py-0.5 rounded text-[11px] font-mono mx-1">POST /api/webhooks/ads-sync</code>
            and are cataloged below.
          </span>
        </div>
        <div className="text-blue-700 font-medium shrink-0">
          Total Assets Synced: <strong>{ads.length}</strong>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-2">Filters:</span>
        {filters.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              activeFilter === filter 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="p-5">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-xs text-gray-500 font-medium">Synchronizing with Vantage AI Studio ad repository...</p>
          </div>
        ) : filteredAds.length === 0 ? (
          <div className="py-16 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 p-6">
            <Film className="w-14 h-14 mx-auto mb-3 text-gray-300" />
            <p className="text-base font-bold text-gray-700">No ad copy or video scripts match your filter.</p>
            <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
              When you push an ad from Vantage AI Studio, it will appear here automatically. You can also manually paste any Facebook script using the "+ Ingest Ad Script" button above.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={() => setIsImportModalOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow"
              >
                <Plus className="w-4 h-4" /> Ingest Script Now
              </button>
              {activeFilter !== "All" && (
                <button
                  onClick={() => setActiveFilter("All")}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-xs font-semibold"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAds.map((ad) => (
              <div key={ad.id} className="border border-gray-200 rounded-xl overflow-hidden hover:border-blue-400 transition-all shadow-sm hover:shadow-md bg-white flex flex-col">
                
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-start bg-gray-50/70">
                  <div className="pr-2">
                    <h4 className="font-bold text-gray-900 text-base line-clamp-1" title={ad.title}>{ad.title}</h4>
                    <div className="flex items-center gap-2 mt-1.5 text-xs">
                      {ad.status === "Published Live" ? (
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium flex items-center gap-1">
                          <Check className="w-3 h-3"/> Published Live
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">
                          {ad.status}
                        </span>
                      )}
                      <span className="text-blue-700 font-semibold">• {ad.platformTarget}</span>
                      <span className="text-gray-400 text-[11px]">• {ad.source}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => openEditModal(ad)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Edit Metadata & Tags"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Linked Metadata */}
                <div className="px-4 py-2 bg-white flex flex-wrap items-center gap-2 text-xs border-b border-gray-100">
                  {ad.propertyAddress && (
                    <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-medium">
                      <MapPin className="w-3 h-3" /> {ad.propertyAddress}
                    </span>
                  )}
                  {ad.tags?.map(tag => (
                    <span key={tag} className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 text-[11px]">
                      <Tag className="w-3 h-3" /> {tag}
                    </span>
                  ))}
                  {(!ad.tags?.length && !ad.propertyAddress) && (
                    <span className="text-gray-400 italic text-[11px]">Ready for multi-channel targeting</span>
                  )}
                </div>

                <div className="p-4 grid grid-cols-5 gap-4 flex-1">
                  {/* Video Box */}
                  <div className="col-span-2 relative">
                    {ad.videoUrl ? (
                      <div className="bg-black rounded-lg overflow-hidden relative group aspect-[9/16] max-h-[220px] flex items-center justify-center cursor-pointer" onClick={() => setTheatreAd(ad)}>
                         <video src={ad.videoUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                         <div className="absolute inset-0 flex items-center justify-center">
                           <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/40 transition-colors">
                             <Play className="w-5 h-5 text-white fill-white ml-1" />
                           </div>
                         </div>
                         <div className="absolute top-2 right-2 flex items-center gap-1">
                           <button className="p-1.5 bg-black/60 text-white rounded hover:bg-black transition-colors" onClick={(e) => { e.stopPropagation(); setTheatreAd(ad); }} title="Theatre Mode">
                             <Maximize2 className="w-3 h-3" />
                           </button>
                         </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 h-full aspect-[9/16] max-h-[220px]">
                        <Film className="w-6 h-6 mb-2 opacity-50" />
                        <span className="text-xs text-center font-medium px-2">Ready Ad Copy</span>
                        <span className="text-[10px] text-gray-400 mt-1">Facebook Text Ad</span>
                      </div>
                    )}
                  </div>

                  {/* Ad Copy Box */}
                  <div className="col-span-3 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Ad Copy Script</span>
                      <button 
                        onClick={() => copyToClipboard(ad.adCopy, ad.id)}
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold"
                      >
                        {copiedId === ad.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : "Copy Script"}
                      </button>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-xs text-gray-800 whitespace-pre-wrap overflow-y-auto max-h-[190px] flex-1 font-sans leading-relaxed">
                      {ad.adCopy}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 pt-0 mt-auto flex items-center gap-2">
                  <button 
                    onClick={() => handlePublish(ad.id)}
                    disabled={ad.status === "Published Live" || publishingId === ad.id}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      ad.status === "Published Live" 
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                    }`}
                  >
                    {publishingId === ad.id ? (
                      <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Pushing to {ad.platformTarget}...</>
                    ) : ad.status === "Published Live" ? (
                      <><Check className="w-3.5 h-3.5" /> Published Live</>
                    ) : (
                      <><Share2 className="w-3.5 h-3.5" /> Publish to {ad.platformTarget}</>
                    )}
                  </button>

                  <button
                    onClick={() => handleDeployToCampaignBuilder(ad)}
                    className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                    title="Send directly into Meta & Google Ads Campaign Builder"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Launch in Builder
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Ingest Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                <Plus className="w-4 h-4 text-emerald-600" />
                Ingest Ad Copy / Script from Vantage AI Studio
              </h3>
              <button onClick={() => setIsImportModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleManualIngest} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Ad Title / Headline</label>
                <input 
                  type="text" 
                  value={importTitle} 
                  onChange={(e) => setImportTitle(e.target.value)} 
                  placeholder="e.g. Facebook High-Converting First-Time Homebuyer Ad"
                  required
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Platform Target</label>
                  <select 
                    value={importPlatform} 
                    onChange={(e) => setImportPlatform(e.target.value)}
                    className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Facebook Ads">Facebook Ads</option>
                    <option value="Instagram Reels">Instagram Reels</option>
                    <option value="Meta & Google Ads">Meta & Google Ads</option>
                    <option value="TikTok Ads">TikTok Ads</option>
                    <option value="YouTube Shorts">YouTube Shorts</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Campaign Goal</label>
                  <select 
                    value={importGoal} 
                    onChange={(e) => setImportGoal(e.target.value)}
                    className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Lead Generation">Lead Generation</option>
                    <option value="Down Payment Quiz Intake">Down Payment Quiz Intake</option>
                    <option value="Open House Traffic">Open House Traffic</option>
                    <option value="Brand Awareness">Brand Awareness</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Ad Copy / Script Content</label>
                <textarea 
                  rows={5}
                  value={importCopy} 
                  onChange={(e) => setImportCopy(e.target.value)} 
                  placeholder="Paste your ad copy script from Vantage AI Studio here..."
                  required
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Video Asset URL (Optional)</label>
                <input 
                  type="url" 
                  value={importVideoUrl} 
                  onChange={(e) => setImportVideoUrl(e.target.value)} 
                  placeholder="https://...mp4"
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Property Address (Optional)</label>
                <input 
                  type="text" 
                  value={importAddress} 
                  onChange={(e) => setImportAddress(e.target.value)} 
                  placeholder="e.g. 123 Main St, Portland, OR"
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsImportModalOpen(false)} 
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmittingImport}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow flex items-center gap-1.5"
                >
                  {isSubmittingImport ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingAd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                <Tag className="w-4 h-4 text-blue-600" />
                Edit Asset Metadata
              </h3>
              <button onClick={() => setEditingAd(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Associated Property Address</label>
                <input 
                  type="text" 
                  value={editAddress} 
                  onChange={(e) => setEditAddress(e.target.value)} 
                  placeholder="e.g. 123 Main St, Portland, OR"
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Tags (comma-separated)</label>
                <input 
                  type="text" 
                  value={editTags} 
                  onChange={(e) => setEditTags(e.target.value)} 
                  placeholder="USDA, Zero Down, First-Time Buyer"
                  className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button onClick={() => setEditingAd(null)} className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button onClick={saveEdits} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Theatre / Detail Modal */}
      {theatreAd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-gray-950 rounded-2xl border border-gray-800 shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
              <div className="flex items-center gap-2 text-white">
                <Tv className="w-5 h-5 text-blue-400" />
                <span className="font-bold text-sm">{theatreAd.title}</span>
              </div>
              <button onClick={() => setTheatreAd(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Media Player */}
              <div className="flex-1 bg-black flex items-center justify-center relative p-4 min-h-[300px]">
                {theatreAd.videoUrl ? (
                  <video src={theatreAd.videoUrl} controls autoPlay className="max-h-[60vh] max-w-full rounded-lg shadow-2xl" />
                ) : (
                  <div className="text-gray-500 flex flex-col items-center">
                    <Film className="w-12 h-12 mb-2 opacity-50" />
                    <span>No video source available</span>
                  </div>
                )}
              </div>
              
              {/* Info Panel */}
              <div className="w-full md:w-96 bg-gray-900 border-l border-gray-800 flex flex-col">
                <div className="p-5 flex-1 overflow-y-auto">
                  <div className="mb-6">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Campaign Details</h4>
                    <div className="bg-gray-800/50 rounded-lg p-3 space-y-2 text-sm text-gray-300">
                      <div className="flex justify-between"><span className="text-gray-500">Target</span><span className="text-white">{theatreAd.platformTarget}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Goal</span><span className="text-white">{theatreAd.campaignGoal}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="text-emerald-400">{theatreAd.status}</span></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ad Copy Script</h4>
                      <button 
                        onClick={() => copyToClipboard(theatreAd.adCopy, theatreAd.id)}
                        className="text-xs bg-gray-800 hover:bg-gray-700 text-white px-2 py-1 rounded transition-colors flex items-center gap-1"
                      >
                        {copiedId === theatreAd.id ? <Check className="w-3 h-3 text-emerald-400" /> : "Copy"}
                      </button>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 text-sm text-gray-200 whitespace-pre-wrap leading-relaxed border border-gray-700 shadow-inner">
                      {theatreAd.adCopy}
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border-t border-gray-800 bg-gray-900/80 flex flex-col gap-2">
                  <button 
                    onClick={() => handlePublish(theatreAd.id)}
                    disabled={theatreAd.status === "Published Live" || publishingId === theatreAd.id}
                    className={`w-full py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      theatreAd.status === "Published Live" 
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'
                    }`}
                  >
                    {publishingId === theatreAd.id ? (
                      <><RefreshCw className="w-4 h-4 animate-spin" /> Pushing to {theatreAd.platformTarget}...</>
                    ) : theatreAd.status === "Published Live" ? (
                      <><Check className="w-4 h-4" /> Live on {theatreAd.platformTarget}</>
                    ) : (
                      <><Share2 className="w-4 h-4" /> Publish Campaign</>
                    )}
                  </button>
                  {onNavigateToCampaignBuilder && (
                    <button
                      onClick={() => {
                        setTheatreAd(null);
                        handleDeployToCampaignBuilder(theatreAd);
                      }}
                      className="w-full py-2 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Layers className="w-3.5 h-3.5" /> Launch in Campaign Builder
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
