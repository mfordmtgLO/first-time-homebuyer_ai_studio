import React, { useState } from "react";
import { 
  Share2, 
  Copy, 
  CheckCircle2, 
  Send, 
  Sparkles, 
  MessageCircle, 
  Video, 
  Linkedin, 
  Smartphone, 
  Mail, 
  ExternalLink,
  Users,
  Building2,
  Check
} from "lucide-react";
import { LoanOfficerProfile, RealEstateAgentProfile, SocialPushCampaign } from "../types";

interface SocialPushHubProps {
  loanOfficer: LoanOfficerProfile;
  activeAgent: RealEstateAgentProfile;
  socialCampaigns: SocialPushCampaign[];
  onAddCampaign: (campaign: SocialPushCampaign) => void;
  pairingUrl: string;
}

export const SocialPushHub: React.FC<SocialPushHubProps> = ({
  loanOfficer,
  activeAgent,
  socialCampaigns,
  onAddCampaign,
  pairingUrl,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<"facebook" | "instagram" | "tiktok" | "linkedin" | "crm_email" | "crm_sms">("facebook");
  const [senderMode, setSenderMode] = useState<"lo" | "agent" | "dual">("dual");
  const [marketingTopic, setMarketingTopic] = useState<string>("grants_affordability");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [customHook, setCustomHook] = useState<string>("");
  const [pushedSuccess, setPushedSuccess] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Dynamic template generator based on platform, sender, and topic
  const generatePostContent = () => {
    const loFirstName = loanOfficer.name.split(" ")[0];
    const agentFirstName = activeAgent.name.split(" ")[0];

    if (marketingTopic === "grants_affordability") {
      if (selectedPlatform === "facebook") {
        const attribution = senderMode === "dual"
          ? `Co-presented by ${loanOfficer.name} (${loanOfficer.nmlsId}) & ${activeAgent.name} (${activeAgent.brokerage})`
          : senderMode === "lo"
          ? `From ${loanOfficer.name} (${loanOfficer.company} • ${loanOfficer.nmlsId})`
          : `From ${activeAgent.name} (${activeAgent.brokerage})`;

        const text = `🏡 Thinking about buying your first home in Oregon / Washington in 2026? 

Most buyers assume they need a massive 20% down payment or get shocked by hidden property tax and insurance calculations. 

Together, we've launched our interactive First-Time Homebuyer Portal to bring 100% transparency to your buying power:
✨ Exact monthly payment calculations with self-restricted payment goal sliders
✨ Directory of verified Oregon & Washington Down Payment Assistance (DPA) grants (up to $30,000+)
✨ Tour Scorecard to inspect roof, HVAC, and plumbing condition on showings

👉 Test your numbers right now on our live co-branded portal:
${pairingUrl}

${attribution}
Questions on pre-approval or current market inventory? Send us a DM or book a free 15-min strategy call!`;

        return {
          title: "Facebook Feed Post • 2026 DPA & Affordability Reality Check",
          hook: "Most first-time buyers have NO idea they may qualify for up to $30,000 in state Down Payment Assistance (DPA).",
          body: text,
          hashtags: ["#FirstTimeHomeBuyer", "#OregonRealEstate", "#PortlandHomes", "#MortgageAdvisor", "#DownPaymentAssistance", "#BuyAHome2026"],
          shareActionUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pairingUrl)}`
        };
      }

      if (selectedPlatform === "instagram") {
        const text = `Before you assume homeownership is out of reach in 2026... read this 👇

1️⃣ You DO NOT need 20% down. (Most of our clients buy with 3% to 3.5% down).
2️⃣ State & County programs can provide $15,000 to $30,000+ in Down Payment Assistance (DPA).
3️⃣ When your Loan Officer (${loFirstName}) and Realtor (${agentFirstName}) work together in real-time, we structure offers to capture maximum seller closing credits.

We built an interactive Homebuyer Hub to test your real numbers, calculate monthly PITI payments, and track homes with a structural scorecard.

🔗 Tap the link in bio to test the interactive portal right now!
👉 ${pairingUrl}

Co-branded by ${loanOfficer.name} (${loanOfficer.nmlsId}) & ${activeAgent.name} (${activeAgent.brokerage})`;

        return {
          title: "Instagram Post / Reel Caption • Stop Believing the 20% Down Myth",
          hook: "3 things first-time buyers must know before scrolling Zillow this weekend 🏡",
          body: text,
          hashtags: ["#FirstTimeHomeBuyer", "#PortlandRealEstate", "#MortgageTips", "#PNWHomes", "#HouseHunting", "#HomebuyerEducation", "#RealEstateAgent", "#PITI"],
          shareActionUrl: null
        };
      }

      if (selectedPlatform === "tiktok") {
        const text = `🎬 TIKTOK VIDEO SCRIPT & HOOK:

[Hook - 0:00 to 0:03]:
"If you are planning to buy your first home this year, STOP scrolling Zillow until you test this one number."

[Visual On-Screen]:
(Show the interactive payment slider turning green/amber/red on screen)

[Body - 0:03 to 0:25]:
"Most calculators only show principal & interest. But in Oregon & Washington, property taxes, HOA, and home insurance can add $600+ a month. Plus, there are state programs that give first-time buyers up to $30,000 in Down Payment Assistance (DPA)."

[Call To Action - 0:25 to 0:35]:
"My team (${loFirstName} & ${agentFirstName}) put together a free interactive portal where you can calculate your exact numbers with zero pressure. Link in bio to try it!"

CAPTION:
Test your true buying power with our free interactive 2026 Homebuyer Hub! Link in bio 📲 ${pairingUrl}
#MortgageTok #FirstTimeHomebuyer #HomebuyerTips #RealEstateTok #Portland`;

        return {
          title: "TikTok Video Hook & Script • The Real Monthly Payment Reality",
          hook: "POV: You tested your true monthly mortgage budget with actual taxes and DPA...",
          body: text,
          hashtags: ["#MortgageTok", "#HomebuyerTips", "#HouseHunting", "#RealEstateTok", "#FirstHome"],
          shareActionUrl: null
        };
      }

      if (selectedPlatform === "crm_email") {
        const text = `SUBJECT: Your Interactive 2026 First-Time Homebuyer Portal (Instant Affordability & DPA)

Hi [First Name],

If buying a home is on your radar this year, one of the biggest challenges is cutting through confusing online estimates and understanding what you can comfortably afford.

To make the process clear and stress-free, our team (${loanOfficer.name}, Senior Loan Officer and ${activeAgent.name}, REALTOR®) created an interactive Homebuyer Portal just for you:

👉 Access Your Free Homebuyer Portal: ${pairingUrl}

Inside your interactive portal, you can:
• Calculate exact monthly mortgage breakdowns (including taxes, insurance, and PMI)
• Test your self-restricted monthly budget goal with our dynamic green/amber indicator
• Review our 10-Step Closing Roadmap & Escrow Checklist
• Explore verified Down Payment Assistance (DPA) programs (OHCS Cash Assist, DevNW IDA Matched Savings, PHB DPAL)

Feel free to test out different price points and let us know whenever you'd like to review your pre-approval options or tour homes in person!

Warmly,

${loanOfficer.name} | ${loanOfficer.title}
${loanOfficer.company} • ${loanOfficer.nmlsId}
Phone: ${loanOfficer.phone} | Email: ${loanOfficer.email}

${activeAgent.name} | ${activeAgent.title}
${activeAgent.brokerage} • ${activeAgent.licenseNumber}
Phone: ${activeAgent.phone} | Email: ${activeAgent.email}`;

        return {
          title: "CRM Email Blast Template • Personalized Homebuyer Portal Invite",
          hook: "High-converting email campaign for pre-approval prospects and open house leads.",
          body: text,
          hashtags: [],
          shareActionUrl: null
        };
      }

      if (selectedPlatform === "crm_sms") {
        const text = `Hi [First Name], this is ${loFirstName} & ${agentFirstName}! We put together a free interactive Homebuyer Portal where you can calculate your exact monthly payments and check eligibility for Oregon Down Payment Assistance (DPA): ${pairingUrl} - Let us know what you think!`;

        return {
          title: "CRM SMS Quick Text Blast • Direct Link Invitation",
          hook: "160-character high-response SMS text template.",
          body: text,
          hashtags: [],
          shareActionUrl: null
        };
      }
    }

    // Default Fallback
    return {
      title: "Co-Branded Social Share Campaign",
      hook: "Everything you need to buy your first home with total clarity.",
      body: `Check out our First-Time Homebuyer Portal: ${pairingUrl}\n\nCo-hosted by ${loanOfficer.name} & ${activeAgent.name}`,
      hashtags: ["#FirstTimeHomeBuyer", "#RealEstate"],
      shareActionUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pairingUrl)}`
    };
  };

  const postData = generatePostContent();

  const handlePushToSocial = () => {
    const newCamp: SocialPushCampaign = {
      id: `camp-${Date.now()}`,
      platform: selectedPlatform,
      senderMode: senderMode,
      loId: loanOfficer.id,
      agentId: activeAgent.id,
      title: postData.title,
      topic: marketingTopic,
      hook: postData.hook,
      bodyCopy: postData.body,
      hashtags: postData.hashtags,
      shareUrl: pairingUrl,
      status: "pushed",
      createdAt: new Date().toISOString().split("T")[0]
    };

    onAddCampaign(newCamp);
    setPushedSuccess(`Campaign saved to activity log! Prepared for ${selectedPlatform.toUpperCase()}.`);
    setTimeout(() => setPushedSuccess(null), 3500);

    if (postData.shareActionUrl) {
      window.open(postData.shareActionUrl, "_blank", "width=600,height=500");
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#EAE7E0] p-6 sm:p-8 space-y-6 shadow-sm text-[#2D362E]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE7E0] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-[#C18C5D] text-white px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Multi-Channel Social Blast Hub</span>
            </span>
          </div>
          <h3 className="font-serif font-bold text-2xl text-[#2D362E] mt-1">
            Push Website & Campaigns to Social Media & CRM
          </h3>
          <p className="text-xs text-[#606C5D]">
            Instantly generate high-converting captions, scripts, and links to post across Facebook, Instagram, TikTok, LinkedIn, or send CRM email/SMS blasts.
          </p>
        </div>
      </div>

      {pushedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{pushedSuccess}</span>
        </div>
      )}

      {/* Configuration Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#F9F8F4] p-4 sm:p-5 rounded-2xl border border-[#EAE7E0]">
        {/* Control 1: Destination Platform */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#2D362E] flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-[#4A5D4E]" />
            <span>1. Select Platform</span>
          </label>
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value as any)}
            className="w-full bg-white border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#4A5D4E]"
          >
            <option value="facebook">📘 Facebook (Feed Post & Direct Share)</option>
            <option value="instagram">📸 Instagram (Reels / Post / Link in Bio)</option>
            <option value="tiktok">🎵 TikTok (Video Script & Caption)</option>
            <option value="linkedin">💼 LinkedIn (Professional Article / Post)</option>
            <option value="crm_email">✉️ CRM Email Blast (HTML/Text Template)</option>
            <option value="crm_sms">💬 CRM SMS Text Blast (Short Link)</option>
          </select>
        </div>

        {/* Control 2: Sender / Attribution Mode */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#2D362E] flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#C18C5D]" />
            <span>2. Attribution / Voice</span>
          </label>
          <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-xl border border-[#EAE7E0]">
            <button
              type="button"
              onClick={() => setSenderMode("dual")}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-colors ${
                senderMode === "dual" ? "bg-[#4A5D4E] text-white" : "text-[#606C5D] hover:bg-[#F1EFE9]"
              }`}
            >
              Dual Team
            </button>
            <button
              type="button"
              onClick={() => setSenderMode("lo")}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-colors ${
                senderMode === "lo" ? "bg-[#4A5D4E] text-white" : "text-[#606C5D] hover:bg-[#F1EFE9]"
              }`}
            >
              LO Only
            </button>
            <button
              type="button"
              onClick={() => setSenderMode("agent")}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-colors ${
                senderMode === "agent" ? "bg-[#4A5D4E] text-white" : "text-[#606C5D] hover:bg-[#F1EFE9]"
              }`}
            >
              Agent Only
            </button>
          </div>
        </div>

        {/* Control 3: Topic / Marketing Hook */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-[#2D362E] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C18C5D]" />
            <span>3. Marketing Angle</span>
          </label>
          <select
            value={marketingTopic}
            onChange={(e) => setMarketingTopic(e.target.value)}
            className="w-full bg-white border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#4A5D4E]"
          >
            <option value="grants_affordability">💰 2026 Oregon Grants & True Monthly Payments</option>
            <option value="scorecard_touring">🔍 House Hunting: 3 Inspection Red Flags</option>
            <option value="myth_busting">🚫 Busting the "20% Down Payment" Myth</option>
            <option value="seller_concessions">🤝 How to Negotiate 2-1 Rate Buydowns with Sellers</option>
          </select>
        </div>
      </div>

      {/* Generated Content Box */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#2D362E] flex items-center gap-1.5">
            <span>Generated Copy for</span>
            <span className="capitalize font-mono text-[#4A5D4E] bg-[#F1EFE9] px-2 py-0.5 rounded">
              {selectedPlatform}
            </span>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => copyToClipboard(postData.body, "post-body")}
              className="flex items-center gap-1 text-xs text-[#4A5D4E] hover:text-[#38463B] font-bold px-3 py-1 rounded-lg bg-[#F1EFE9] border border-[#EAE7E0] transition-colors"
            >
              {copiedField === "post-body" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied Text!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Copywriting</span>
                </>
              )}
            </button>

            <button
              onClick={() => copyToClipboard(pairingUrl, "share-url")}
              className="flex items-center gap-1 text-xs text-[#606C5D] hover:text-[#2D362E] font-medium px-2.5 py-1 rounded-lg bg-[#F9F8F4] border border-[#EAE7E0]"
            >
              {copiedField === "share-url" ? "URL Copied!" : "Copy Link"}
            </button>
          </div>
        </div>

        <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-[#606C5D] border-b border-[#EAE7E0] pb-2">
            <span className="font-semibold">{postData.title}</span>
            <span className="text-[11px] text-[#9A9488]">Pairing: {loanOfficer.name} + {activeAgent.name}</span>
          </div>

          <pre className="text-xs text-[#2D362E] whitespace-pre-wrap font-sans leading-relaxed select-all">
            {postData.body}
          </pre>

          {postData.hashtags.length > 0 && (
            <div className="pt-2 border-t border-[#EAE7E0] flex flex-wrap gap-1.5">
              {postData.hashtags.map((h, i) => (
                <span key={i} className="text-[10px] text-[#4A5D4E] bg-white border border-[#EAE7E0] px-2 py-0.5 rounded-md">
                  {h}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="text-xs text-[#606C5D]">
          <span>Destination URL: </span>
          <span className="font-mono text-[11px] text-[#4A5D4E] bg-[#F1EFE9] px-2 py-0.5 rounded">
            {pairingUrl}
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handlePushToSocial}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Send className="w-3.5 h-3.5 text-[#D4A373]" />
            <span>
              {selectedPlatform === "facebook" ? "Launch Facebook Share & Log" : "Save & Mark Campaign Pushed"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
