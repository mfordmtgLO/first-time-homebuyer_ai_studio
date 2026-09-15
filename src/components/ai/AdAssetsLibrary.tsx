import React, { useState, useEffect } from "react";
import { Film, Play, Share2, Server, Check, RefreshCw, Smartphone, Tag, MapPin, Search, Edit3, X, Tv, Maximize2 } from "lucide-react";

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

export const AdAssetsLibrary: React.FC = () => {
  const [ads, setAds] = useState<SyncedAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  // Modals
  const [editingAd, setEditingAd] = useState<SyncedAd | null>(null);
  const [theatreAd, setTheatreAd] = useState<SyncedAd | null>(null);

  // Edit form state
  const [editTags, setEditTags] = useState("");
  const [editAddress, setEditAddress] = useState("");

  const fetchAds = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ads/synced?loId=lo_1");
      if (res.ok) {
        const data = await res.json();
        // Decorate mock data with tags if they don't have them
        const decoratedAds = (data.ads || []).map((ad: any) => ({
          ...ad,
          tags: ad.tags || (ad.title.includes("USDA") ? ["USDA", "Zero Down"] : ad.title.includes("DPA") ? ["DPA", "First-Time Buyer"] : ["General"]),
          propertyAddress: ad.propertyAddress || (ad.title.includes("USDA") ? "123 Umatilla Dr, Umatilla, OR" : "")
        }));
        setAds(decoratedAds);
      }
    } catch (e) {
      console.error("Failed to fetch synced ads", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadAds = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/ads/synced?loId=lo_1");
        if (res.ok && isMounted) {
          const data = await res.json();
          const decoratedAds = (data.ads || []).map((ad: any) => ({
            ...ad,
            tags: ad.tags || (ad.title.includes("USDA") ? ["USDA", "Zero Down"] : ad.title.includes("DPA") ? ["DPA", "First-Time Buyer"] : ["General"]),
            propertyAddress: ad.propertyAddress || (ad.title.includes("USDA") ? "123 Umatilla Dr, Umatilla, OR" : "")
          }));
          setAds(decoratedAds);
        }
      } catch (e) {
        if (isMounted) console.error("Failed to fetch synced ads", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadAds();
    return () => { isMounted = false; };
  }, []);

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

  // Extract all unique tags for filter pills
  const allTags = Array.from(new Set(ads.flatMap(a => a.tags || []))).sort();
  const filters = ["All", "Inbox", "Published", ...allTags];

  const filteredAds = ads.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ad.adCopy.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (ad.propertyAddress && ad.propertyAddress.toLowerCase().includes(searchQuery.toLowerCase()));
    
    let matchesFilter = true;
    if (activeFilter === "Inbox") matchesFilter = ad.status !== "Published Live";
    else if (activeFilter === "Published") matchesFilter = ad.status === "Published Live";
    else if (activeFilter !== "All") matchesFilter = (ad.tags || []).includes(activeFilter);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-white">
          <Server className="w-8 h-8 text-blue-300" />
          <div>
            <h3 className="font-bold text-xl">Ad Assets Library</h3>
            <p className="text-blue-100 text-sm">Centralized vault for AI Engine campaigns and properties</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-blue-300 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search assets, copy, properties..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400 w-64 text-sm"
            />
          </div>
          <button onClick={fetchAds} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors" title="Refresh Sync">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2 overflow-x-auto">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-2">Filters:</span>
        {filters.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilter === filter 
                ? 'bg-blue-600 text-white' 
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="p-4">
        {loading ? (
          <div className="py-20 flex justify-center text-gray-400">
            <RefreshCw className="w-10 h-10 animate-spin" />
          </div>
        ) : filteredAds.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            <Film className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-gray-600">No ad assets found.</p>
            <p className="text-sm mt-1">Adjust your filters or push new campaigns from the Vantage Ads Engine.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredAds.map((ad) => (
              <div key={ad.id} className="border border-gray-200 rounded-xl overflow-hidden hover:border-blue-400 transition-colors bg-white flex flex-col">
                
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                  <div className="pr-2">
                    <h4 className="font-bold text-gray-900 text-lg line-clamp-1" title={ad.title}>{ad.title}</h4>
                    <div className="flex items-center gap-2 mt-1.5 text-xs">
                      {ad.status === "Published Live" ? (
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium flex items-center gap-1"><Check className="w-3 h-3"/> Published</span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded font-medium">{ad.status}</span>
                      )}
                      <span className="text-gray-500 font-mono">• {ad.platformTarget}</span>
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
                <div className="px-4 py-2 bg-white flex flex-wrap gap-2 text-xs border-b border-gray-100">
                  {ad.propertyAddress && (
                    <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                      <MapPin className="w-3 h-3" /> {ad.propertyAddress}
                    </span>
                  )}
                  {ad.tags?.map(tag => (
                    <span key={tag} className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                      <Tag className="w-3 h-3" /> {tag}
                    </span>
                  ))}
                  {(!ad.tags?.length && !ad.propertyAddress) && (
                    <span className="text-gray-400 italic">No tags or linked property.</span>
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
                        <span className="text-xs text-center px-2">No MP4</span>
                      </div>
                    )}
                  </div>

                  {/* Ad Copy Box */}
                  <div className="col-span-3 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Ad Copy</span>
                      <button 
                        onClick={() => copyToClipboard(ad.adCopy, ad.id)}
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                      >
                        {copiedId === ad.id ? <Check className="w-3 h-3" /> : "Copy"}
                      </button>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 text-xs text-gray-800 whitespace-pre-wrap overflow-y-auto max-h-[190px] flex-1">
                      {ad.adCopy}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 pt-0 mt-auto">
                  <button 
                    onClick={() => handlePublish(ad.id)}
                    disabled={ad.status === "Published Live" || publishingId === ad.id}
                    className={`w-full py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                      ad.status === "Published Live" 
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow'
                    }`}
                  >
                    {publishingId === ad.id ? (
                      <><RefreshCw className="w-4 h-4 animate-spin" /> Pushing to {ad.platformTarget}...</>
                    ) : ad.status === "Published Live" ? (
                      <><Check className="w-4 h-4" /> Live on {ad.platformTarget}</>
                    ) : (
                      <><Share2 className="w-4 h-4" /> Publish to {ad.platformTarget}</>
                    )}
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingAd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-blue-600" />
                Edit Asset Metadata
              </h3>
              <button onClick={() => setEditingAd(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Tags (comma separated)</label>
                <input 
                  type="text" 
                  value={editTags} 
                  onChange={e => setEditTags(e.target.value)}
                  placeholder="e.g. USDA, First-Time Buyer, Refinance"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link to MLS Property Address</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    value={editAddress} 
                    onChange={e => setEditAddress(e.target.value)}
                    placeholder="e.g. 123 Main St, City, OR"
                    className="w-full border border-gray-300 rounded-lg p-2.5 pl-9 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1.5">Linking an address allows this ad to appear in the GeoSphere property details view.</p>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
              <button onClick={() => setEditingAd(null)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg">Cancel</button>
              <button onClick={saveEdits} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm">Save Metadata</button>
            </div>
          </div>
        </div>
      )}

      {/* Theatre Modal */}
      {theatreAd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/95 backdrop-blur-md">
          <div className="bg-black/50 border border-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-black/40">
              <h3 className="font-bold text-white flex items-center gap-2 text-lg">
                <Tv className="w-5 h-5 text-blue-400" />
                Theatre Mode: {theatreAd.title}
              </h3>
              <button onClick={() => setTheatreAd(null)} className="text-gray-400 hover:text-white bg-white/10 p-1.5 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Video Player */}
              <div className="flex-1 bg-black flex items-center justify-center p-6 relative">
                {theatreAd.videoUrl ? (
                  <video 
                    src={theatreAd.videoUrl} 
                    controls 
                    autoPlay
                    className="w-full h-full max-h-full object-contain rounded-lg shadow-2xl"
                  />
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
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ad Copy</h4>
                      <button 
                        onClick={() => copyToClipboard(theatreAd.adCopy, theatreAd.id)}
                        className="text-xs bg-gray-800 hover:bg-gray-700 text-white px-2 py-1 rounded transition-colors flex items-center gap-1"
                      >
                        {copiedId === theatreAd.id ? <Check className="w-3 h-3" /> : "Copy"}
                      </button>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 text-sm text-gray-200 whitespace-pre-wrap leading-relaxed border border-gray-700 shadow-inner">
                      {theatreAd.adCopy}
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border-t border-gray-800 bg-gray-900/80">
                  <button 
                    onClick={() => handlePublish(theatreAd.id)}
                    disabled={theatreAd.status === "Published Live" || publishingId === theatreAd.id}
                    className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                      theatreAd.status === "Published Live" 
                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'
                    }`}
                  >
                    {publishingId === theatreAd.id ? (
                      <><RefreshCw className="w-5 h-5 animate-spin" /> Pushing to {theatreAd.platformTarget}...</>
                    ) : theatreAd.status === "Published Live" ? (
                      <><Check className="w-5 h-5" /> Live on {theatreAd.platformTarget}</>
                    ) : (
                      <><Share2 className="w-5 h-5" /> Publish Campaign</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
