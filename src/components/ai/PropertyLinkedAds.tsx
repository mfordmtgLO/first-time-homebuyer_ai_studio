import React, { useState, useEffect } from "react";
import { Film, Play, Send, Check, Copy } from "lucide-react";
import { sendPropertyConversationMessage } from "../../services/propertyConversationService";

interface SyncedAd {
  id: string;
  title: string;
  adCopy: string;
  videoUrl: string;
  platformTarget: string;
}

interface PropertyLinkedAdsProps {
  propertyId: string;
  propertyAddress: string;
  leadId?: string;
  loanOfficerId?: string;
}

export const PropertyLinkedAds: React.FC<PropertyLinkedAdsProps> = ({ propertyId, propertyAddress, leadId, loanOfficerId = "lo_1" }) => {
  const [ads, setAds] = useState<SyncedAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await fetch(`/api/ads/property/${encodeURIComponent(propertyId)}?loId=${loanOfficerId}`);
        if (res.ok) {
          const data = await res.json();
          // Mock data fallback if none found (for preview purposes)
          if (data.ads.length === 0) {
             setAds([
               {
                 id: "mock_prop_1",
                 title: "Zero-Down Open House Invite",
                 adCopy: `Hey! I saw you looking at ${propertyAddress}. Did you know this exact home qualifies for 0% down USDA financing? I made a quick video breakdown for you, check it out!`,
                 videoUrl: "https://vjs.zencdn.net/v/oceans.mp4",
                 platformTarget: "1-to-1 SMS/Notes"
               }
             ]);
          } else {
             setAds(data.ads);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (propertyId) fetchAds();
  }, [propertyId, loanOfficerId, propertyAddress]);

  const handleSendToNotes = async (ad: SyncedAd) => {
    if (!leadId) {
      alert("No active lead selected to send this message to.");
      return;
    }
    setSendingId(ad.id);
    
    try {
      await sendPropertyConversationMessage({
        propertyId,
        leadId,
        senderType: "lo",
        senderId: loanOfficerId,
        senderName: "Mike Ford (Loan Officer)",
        text: `${ad.adCopy}\n\n[Attached Video: ${ad.title}]`,
      });
    } catch (error) {
      console.error(error);
    }
    
    setTimeout(() => {
      setSendingId(null);
    }, 1500);
  };
  
  const handleCopy = (ad: SyncedAd) => {
    navigator.clipboard.writeText(ad.adCopy);
    setCopiedId(ad.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  if (loading) return <div className="text-xs text-gray-500 animate-pulse p-4">Loading linked marketing assets...</div>;
  if (ads.length === 0) return null;

  return (
    <div className="mt-2 border-t border-[#EAE7E0] pt-3 pb-1">
      <h4 className="text-[10px] font-bold text-[#C18C5D] uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <Film className="w-3.5 h-3.5" />
        Vantage Ads Engine Assets
      </h4>
      <div className="space-y-2">
        {ads.map(ad => (
          <div key={ad.id} className="bg-pink-50/50 border border-pink-100 rounded-lg p-2.5 shadow-2xs">
            <div className="flex justify-between items-start mb-2 gap-2">
              <span className="font-semibold text-[11px] sm:text-xs text-pink-900 leading-tight">{ad.title}</span>
              {leadId ? (
                <button 
                  onClick={() => handleSendToNotes(ad)}
                  disabled={sendingId === ad.id}
                  className="bg-pink-600 hover:bg-pink-700 text-white px-2 py-1 rounded text-[10px] sm:text-xs flex items-center gap-1 transition-colors shrink-0"
                  title="Send via Property Notes Chat"
                >
                  {sendingId === ad.id ? <Check className="w-3 h-3" /> : <Send className="w-3 h-3" />}
                  <span className="hidden sm:inline">{sendingId === ad.id ? "Sent" : "Send to Buyer"}</span>
                </button>
              ) : (
                <button 
                  onClick={() => handleCopy(ad)}
                  className="bg-white border border-pink-200 text-pink-700 hover:bg-pink-100 px-2 py-1 rounded text-[10px] sm:text-xs flex items-center gap-1 transition-colors shrink-0 shadow-2xs font-semibold"
                  title="Copy ad script for social media posting"
                >
                  {copiedId === ad.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span className="hidden sm:inline">{copiedId === ad.id ? "Copied!" : "Copy Script"}</span>
                </button>
              )}
            </div>
            <div className="flex gap-2.5">
              {ad.videoUrl && (
                <div className="w-16 h-24 bg-black rounded overflow-hidden relative shrink-0 shadow-2xs group cursor-pointer">
                  <video src={ad.videoUrl} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                  <Play className="w-5 h-5 text-white absolute inset-0 m-auto drop-shadow-md" />
                </div>
              )}
              <div className="text-[10px] sm:text-[11px] text-[#606C5D] whitespace-pre-wrap flex-1 bg-white/60 p-2 rounded border border-pink-50">
                <span className="line-clamp-4 leading-relaxed">{ad.adCopy}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
