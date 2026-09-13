import React, { useState, useEffect } from "react";
import { Film, Play, Download, Share2, Server, Check, RefreshCw, Smartphone } from "lucide-react";

interface SyncedAd {
  id: string;
  title: string;
  adCopy: string;
  videoUrl: string;
  platformTarget: string;
  campaignGoal: string;
  status: string;
  source: string;
}

export const SyncedAdsManager: React.FC = () => {
  const [ads, setAds] = useState<SyncedAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ads/synced?loId=lo_1");
      if (res.ok) {
        const data = await res.json();
        setAds(data.ads || []);
      }
    } catch (e) {
      console.error("Failed to fetch synced ads", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handlePublish = (id: string) => {
    setPublishingId(id);
    // Simulate publish delay
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

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-white">
          <Server className="w-6 h-6 text-blue-300" />
          <div>
            <h3 className="font-bold text-lg">Vantage AI Studio Ads Engine Sync Hub</h3>
            <p className="text-blue-100 text-sm">Inbound cross-project synced campaigns & videos</p>
          </div>
        </div>
        <button 
          onClick={fetchAds}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
          title="Refresh Sync"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700">
          <Smartphone className="w-4 h-4" />
        </span>
        <p className="text-sm text-gray-700">
          <strong>Auto-Sync Active:</strong> MP4 videos and copy generated in the <strong>Vantage AI Ads Engine</strong> project will automatically appear here via cross-project webhook.
        </p>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="py-12 flex justify-center text-gray-400">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>
        ) : ads.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <Film className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No synced ads found yet.</p>
            <p className="text-sm mt-1">Push campaigns from the Vantage AI Ads Engine project.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {ads.map((ad) => (
              <div key={ad.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors bg-white">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                      {ad.title}
                      {ad.status === "Published Live" ? (
                        <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">Published</span>
                      ) : (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">{ad.status}</span>
                      )}
                    </h4>
                    <p className="text-sm text-gray-500 font-mono mt-1">Source: {ad.source} • Target: {ad.platformTarget}</p>
                  </div>
                  <button 
                    onClick={() => handlePublish(ad.id)}
                    disabled={ad.status === "Published Live" || publishingId === ad.id}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
                      ad.status === "Published Live" 
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow'
                    }`}
                  >
                    {publishingId === ad.id ? (
                      <><RefreshCw className="w-4 h-4 animate-spin" /> Pushing to Ads Manager...</>
                    ) : ad.status === "Published Live" ? (
                      <><Check className="w-4 h-4" /> Live on {ad.platformTarget}</>
                    ) : (
                      <><Share2 className="w-4 h-4" /> Publish Campaign</>
                    )}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Ad Copy Box */}
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase">Synced Ad Copy</span>
                      <button 
                        onClick={() => copyToClipboard(ad.adCopy, ad.id)}
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                      >
                        {copiedId === ad.id ? <Check className="w-3 h-3" /> : null}
                        {copiedId === ad.id ? "Copied" : "Copy Text"}
                      </button>
                    </div>
                    <div className="text-sm text-gray-800 whitespace-pre-wrap">{ad.adCopy}</div>
                  </div>

                  {/* Video Box */}
                  {ad.videoUrl ? (
                    <div className="bg-black rounded-lg border border-gray-200 overflow-hidden relative group aspect-video flex items-center justify-center">
                       <video 
                         src={ad.videoUrl} 
                         controls 
                         className="w-full h-full object-cover"
                         poster="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                       />
                       <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                         .MP4 Synced
                       </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 p-6">
                      <Film className="w-8 h-8 mb-2 opacity-50" />
                      <span className="text-sm">No MP4 Video Attached</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
