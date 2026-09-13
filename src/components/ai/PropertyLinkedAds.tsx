import React, { useState, useEffect } from "react";
import { Film, Play, Send, Check } from "lucide-react";
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

  if (loading) return <div className="text-xs text-gray-500 animate-pulse p-4">Loading linked marketing assets...</div>;
  if (ads.length === 0) return null;

  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
        <Film className="w-4 h-4 text-indigo-500" />
        Vantage Ads Engine: Linked Assets
      </h4>
      <div className="space-y-3">
        {ads.map(ad => (
          <div key={ad.id} className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-lg p-3">
            <div className="flex justify-between items-start mb-2">
              <span className="font-semibold text-sm text-indigo-900">{ad.title}</span>
              <button 
                onClick={() => handleSendToNotes(ad)}
                disabled={sendingId === ad.id}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors"
                title="Send via Property Notes Chat"
              >
                {sendingId === ad.id ? <Check className="w-3 h-3" /> : <Send className="w-3 h-3" />}
                {sendingId === ad.id ? "Sent" : "Send to Buyer"}
              </button>
            </div>
            <div className="flex gap-3">
              {ad.videoUrl && (
                <div className="w-20 h-24 bg-black rounded overflow-hidden relative shrink-0">
                  <video src={ad.videoUrl} className="w-full h-full object-cover opacity-80" />
                  <Play className="w-6 h-6 text-white absolute inset-0 m-auto" />
                </div>
              )}
              <div className="text-xs text-gray-700 whitespace-pre-wrap flex-1">
                <span className="line-clamp-4">{ad.adCopy}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
