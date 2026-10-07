import React, { useState, useMemo, useEffect } from "react";
import {
  X,
  Sparkles,
  MapPin,
  User,
  Mail,
  Phone,
  CheckCircle2,
  Home,
  Building,
  ArrowRight,
  ShieldCheck,
  PhoneCall,
  MessageSquare,
  ExternalLink,
  ChevronRight,
  Tag,
  Clock,
  Star
} from "lucide-react";
import { RealEstateAgentProfile, LoanOfficerProfile, PropertyListing, CapturedLead } from "../types";
import { formatUSD } from "../utils/mortgageMath";
import { getZillowUrl } from "../utils/overlayClassification";

interface AgentSpotlightLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: RealEstateAgentProfile;
  loanOfficer?: LoanOfficerProfile;
  listings?: PropertyListing[];
  initialCity?: string;
  initialTopic?: string;
  initialProperty?: PropertyListing;
  onSaveLead?: (lead: CapturedLead) => void;
  onTriggerToast?: (msg: string) => void;
}

export const AgentSpotlightLeadModal: React.FC<AgentSpotlightLeadModalProps> = ({
  isOpen,
  onClose,
  agent,
  loanOfficer,
  listings = [],
  initialCity = "",
  initialTopic,
  initialProperty,
  onSaveLead,
  onTriggerToast
}) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [cellPhone, setCellPhone] = useState("");
  const [desiredCity, setDesiredCity] = useState(initialCity || "");
  const [wantsCuratedList, setWantsCuratedList] = useState(true);
  const [smsConsent, setSmsConsent] = useState(false);
  const [downPaymentPreference, setDownPaymentPreference] = useState<string>("any_low_down");
  const [timeline, setTimeline] = useState<string>("ready_30_60");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync initial city if prop changes
  useEffect(() => {
    if (initialCity && !desiredCity) {
      setDesiredCity(initialCity);
    }
  }, [initialCity]);

  // Suggested popular cities based on the agent's licensed territory and market areas
  const suggestedCities = useMemo(() => {
    const fromAgent = agent.marketAreas || [];
    const defaults = ["Portland", "Beaverton", "Bend", "Eugene", "Salem", "Gresham", "Hillsboro", "Oregon City", "Redmond"];
    const combined = Array.from(new Set([...fromAgent, ...defaults]));
    return combined.slice(0, 8);
  }, [agent.marketAreas]);

  // Find preview properties in or near desired city that accept low/no down payment options
  const matchedPreviewProperties = useMemo(() => {
    if (!listings || listings.length === 0) return [];
    
    const filtered = listings.filter((l) => {
      // Must be eligible for at least one low/no down program
      const isEligible =
        l.overlayEligibility?.usdaEligible ||
        l.overlayEligibility?.lmiEligible ||
        l.overlayEligibility?.firstHomeEligible ||
        l.isZeroDownUsda ||
        l.hasGrantEligibleBadge;
      return isEligible;
    });

    if (desiredCity.trim()) {
      const cityQuery = desiredCity.toLowerCase().trim();
      const cityMatches = filtered.filter(
        (l) =>
          l.city?.toLowerCase().includes(cityQuery) ||
          l.county?.toLowerCase().includes(cityQuery) ||
          l.address?.toLowerCase().includes(cityQuery)
      );
      if (cityMatches.length > 0) {
        return cityMatches.slice(0, 3);
      }
    }

    return filtered.slice(0, 3);
  }, [listings, desiredCity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Basic validation
    if (!fullName.trim()) {
      setErrorMsg("Please provide your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please provide a valid email address so we can send your curated home list.");
      return;
    }
    if (!cellPhone.trim() || cellPhone.replace(/\D/g, "").length < 7) {
      setErrorMsg("Please enter a valid cell phone number for property alerts.");
      return;
    }
    if (!smsConsent && cellPhone.trim()) {
      setErrorMsg("You must check the SMS authorization box to receive text updates.");
      return;
    }
    if (!desiredCity.trim()) {
      setErrorMsg("Please enter your desired city or neighborhood in Oregon.");
      return;
    }

    setIsSubmitting(true);

    const cityClean = desiredCity.trim();
    const loId = loanOfficer?.id || "lo-1";
    const loName = loanOfficer?.name || "Mike Ford";

    const downPaymentLabelMap: Record<string, string> = {
      any_low_down: "Low or No Down Payment (All Programs)",
      usda_zero_down: "USDA 100% Financing (0% Down)",
      dpa_grants: "State HFA / OHCS $10k+ Cash Grants",
      fha_community_second: "FHA 3.5% with Community Second",
      first_home: "FirstHome Oregon Bond Advantage"
    };

    const newLead: CapturedLead = {
      id: `lead-spotlight-${Date.now()}`,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: cellPhone.trim(),
      preferredContactTime: "Anytime",
      timeline: timeline === "ready_30_60" ? "Ready in 30-60 Days" : "Browsing (3-6 Months)",
      targetPriceRange: initialProperty ? formatUSD(initialProperty.price) : "$400,000 - $550,000",
      targetMonthlyBudget: "Optimal Low/Zero Down Payment",
      downPaymentSavings: downPaymentLabelMap[downPaymentPreference] || "Low/No Down Payment",
      grantInterest: true,
      creditScoreTier: "Good (660+)",
      preferredLocations: cityClean,
      taggedCityArea: cityClean,
      leadPathTag: "Agent Spotlight Curated Home List",
      propertyType: "Single Family",
      sendSampleHomes: wantsCuratedList,
      sendSampleHomesOption: `YES - Curated list of recently listed homes in ${cityClean} (Low/No Down Eligible)`,
      assignedLoId: loId,
      assignedAgentId: agent.id,
      assignedLO: loName,
      assignedAgent: agent.name,
      leadSource: `Agent Spotlight: Curated Homes in ${cityClean}`,
      interactedSourceType: initialProperty ? "property_listing" : "chatbot",
      intentScore: "hot",
      status: "new",
      notes: `[AGENT SPOTLIGHT LEAD GEN]: Buyer requested a curated list of recently listed homes for sale in ${cityClean} that likely can accept low or no down payment options.\n- Target City: ${cityClean}\n- Program Preference: ${downPaymentLabelMap[downPaymentPreference]}\n- Spotlight Agent: ${agent.name} (${agent.brokerage})\n- Loan Officer: ${loName}\n- Context: ${initialTopic ? `Topic: ${initialTopic}` : initialProperty ? `Listing: ${initialProperty.address}` : "Market Trends Spotlight"}.`,
      createdAt: new Date().toISOString(),
      smsConsentAuthorized: true,
      smsConsentTimestamp: new Date().toISOString(),
      smsConsentSource: "Agent Spotlight Modal Curated List Request",
      textNurtureEnabled: true,
      textNurtureCurrentStep: 1,
      textNurtureTotalSteps: 4,
      textNurtureStageText: "1 of 4: Curated Home List Dispatched",
      lastTextSentAt: new Date().toISOString()
    };

    // 1. Invoke onSaveLead
    if (onSaveLead) {
      onSaveLead(newLead);
    }

    // 2. Persist to localStorage
    try {
      const stored = localStorage.getItem("homebuyer_roadmap_state_v2");
      if (stored) {
        const parsed = JSON.parse(stored);
        const existingLeads = parsed.leads || [];
        parsed.leads = [newLead, ...existingLeads];
        localStorage.setItem("homebuyer_roadmap_state_v2", JSON.stringify(parsed));
      }
      const rawLeads = localStorage.getItem("first_time_buyer_leads");
      const leadsList = rawLeads ? JSON.parse(rawLeads) : [];
      localStorage.setItem("first_time_buyer_leads", JSON.stringify([newLead, ...leadsList]));
    } catch (err) {
      console.warn("Local storage write error for spotlight lead:", err);
    }

    // 3. Trigger toast
    if (onTriggerToast) {
      onTriggerToast(`✓ Curated home list request sent to ${agent.name}!`);
    }

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setFullName("");
    setEmail("");
    setCellPhone("");
    setDesiredCity("");
    setErrorMsg(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#EAE7E0] overflow-hidden my-6 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#2D362E] via-[#38463B] to-[#4A5D4E] text-white p-5 sm:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          
          <button
            type="button"
            onClick={handleResetAndClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#C18C5D] text-white text-[10px] font-extrabold uppercase tracking-wide">
              <Sparkles className="w-3 h-3 text-white" />
              Agent Spotlight Lead Service
            </span>
            <span className="text-[11px] text-white/80 font-medium">
              {agent.brokerage}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white leading-tight">
            Curated Low & No Down Payment Homes
          </h2>
          <p className="text-xs text-white/80 mt-1 max-w-md leading-relaxed">
            Direct from <strong>{agent.name}</strong> • Licensed Oregon Real Estate Specialist
          </p>
        </div>

        {/* Agent Profile Co-Banner */}
        <div className="bg-[#FAF9F5] border-b border-[#EAE7E0] px-5 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {agent.headshotUrl ? (
              <img
                src={agent.headshotUrl}
                alt={agent.name}
                className="w-11 h-11 rounded-2xl object-cover border-2 border-[#C18C5D] shadow-xs shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-2xl bg-emerald-800 text-white font-bold flex items-center justify-center border-2 border-[#C18C5D] shadow-xs shrink-0 text-sm">
                {(agent.name || "A").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="text-xs">
              <div className="font-bold text-[#2D362E] flex items-center gap-1.5">
                <span>{agent.name}</span>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">Active MLS</span>
              </div>
              <div className="text-[#606C5D] text-[11px]">
                {agent.title} • Lic #{agent.licenseNumber || "Verified"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`tel:${agent.phone}`}
              className="p-2 rounded-xl bg-white border border-[#EAE7E0] hover:border-[#4A5D4E] text-[#4A5D4E] text-xs font-bold transition-all shadow-2xs"
              title={`Call ${agent.name}`}
            >
              <PhoneCall className="w-4 h-4 text-[#D4A373]" />
            </a>
            <a
              href={`sms:${agent.phone}`}
              className="p-2 rounded-xl bg-white border border-[#EAE7E0] hover:border-[#4A5D4E] text-[#4A5D4E] text-xs font-bold transition-all shadow-2xs"
              title={`Text ${agent.name}`}
            >
              <MessageSquare className="w-4 h-4 text-[#C18C5D]" />
            </a>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Intent Explainer / Lead Gen Hook */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#F5F2EA] to-[#FAF9F5] border border-[#C18C5D]/30 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#8C5D30]">
                  <Home className="w-4 h-4 text-[#C18C5D]" />
                  <span>Receive a Curated Low / Zero Down Home List</span>
                </div>
                <p className="text-xs text-[#2D362E] leading-relaxed">
                  Tell us your desired city or neighborhood in Oregon. <strong>{agent.name}</strong> will curate a personalized list of recently listed homes for sale that are pre-screened to accept low or no down payment options (DPA grants, USDA 0% down, FHA 3.5%, or FirstHome price caps).
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. Desired City Input & Fast Chips */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#2D362E]">
                  Desired City or Neighborhood in Oregon <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#9A9488] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Portland, Bend, Eugene, Beaverton, Salem..."
                    value={desiredCity}
                    onChange={(e) => setDesiredCity(e.target.value)}
                    className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#2D362E] placeholder-[#9A9488] focus:outline-none focus:border-[#4A5D4E] focus:bg-white"
                  />
                </div>

                {/* Popular City Quick-Select Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-semibold text-[#9A9488] mr-1">Suggested:</span>
                  {suggestedCities.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => setDesiredCity(city)}
                      className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                        desiredCity.toLowerCase() === city.toLowerCase()
                          ? "bg-[#2D362E] text-white"
                          : "bg-[#F1EFE9] text-[#606C5D] hover:bg-[#E5E2DA]"
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Matching Inventory Feedback */}
              {matchedPreviewProperties.length > 0 && (
                <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      <strong>{matchedPreviewProperties.length}+ matching low/zero down homes</strong> ready for review in {desiredCity || "Oregon territory"}.
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wide bg-emerald-200/70 text-emerald-900 px-2 py-0.5 rounded">
                    Active
                  </span>
                </div>
              )}

              {/* 2. Contact Fields: Name, Email, Cell Phone */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-[#2D362E] mb-1">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#9A9488] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Morgan"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#2D362E] placeholder-[#9A9488] focus:outline-none focus:border-[#4A5D4E] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#2D362E] mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#9A9488] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        placeholder="alex@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#2D362E] placeholder-[#9A9488] focus:outline-none focus:border-[#4A5D4E] focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2D362E] mb-1">
                      Cell Phone (for SMS Alerts) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#9A9488] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        placeholder="e.g. (503) 282-5626"
                        value={cellPhone}
                        onChange={(e) => setCellPhone(e.target.value)}
                        className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#2D362E] placeholder-[#9A9488] focus:outline-none focus:border-[#4A5D4E] focus:bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Program Preference Selector */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold text-[#2D362E]">
                  Financing & Down Payment Assistance Preference
                </label>
                <select
                  value={downPaymentPreference}
                  onChange={(e) => setDownPaymentPreference(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#2D362E] focus:outline-none focus:border-[#4A5D4E] cursor-pointer"
                >
                  <option value="any_low_down">Any Low or Zero Down Payment Program (All Options)</option>
                  <option value="usda_zero_down">USDA Rural Development 100% Financing (0% Down)</option>
                  <option value="dpa_grants">State HFA / OHCS Flex Grant ($10,000+ Down Payment Aid)</option>
                  <option value="fha_community_second">FHA 3.5% with Community Second</option>
                  <option value="first_home">FirstHome Oregon Bond Advantage (Below-Market Interest)</option>
                </select>
              </div>

              {/* 4. Explicit Opt-In Confirmation Checkbox (The Exact Lead Gen Mindset Hook) */}
              <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EAE7E0] space-y-4">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wantsCuratedList}
                    onChange={(e) => setWantsCuratedList(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-[#4A5D4E] focus:ring-[#4A5D4E] border-[#DCD7CD] cursor-pointer"
                  />
                  <span className="text-xs text-[#2D362E] font-medium leading-relaxed">
                    <strong>Yes, please send me a curated list</strong> of recently listed homes for sale in{" "}
                    <span className="text-[#4A5D4E] font-bold underline decoration-[#C18C5D]">
                      {desiredCity || "my desired area"}
                    </span>{" "}
                    that likely can accept low or no down payment options.
                  </span>
                </label>

                {/* Unbundled SMS Consent (Twilio Compliant) */}
                <div className="space-y-1">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={smsConsent}
                      onChange={(e) => setSmsConsent(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-[#4A5D4E] focus:ring-[#4A5D4E] border-[#DCD7CD] cursor-pointer"
                    />
                    <span className="text-xs text-[#2D362E] font-medium leading-relaxed">
                      I authorize {agent.name} and {loanOfficer?.name || "my Loan Officer"} to send text messages (SMS) regarding property updates, home listings, and loan details.
                    </span>
                  </label>
                  <p className="text-[10px] text-[#9A9488] leading-tight pl-6.5">
                    Message and data rates may apply. Reply STOP anytime to opt out. View our <a href="/privacy-policy.html" target="_blank" rel="noreferrer" className="underline text-[#4A5D4E] hover:text-[#2D362E]">Privacy Policy &amp; Terms</a>.
                  </p>
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-[#2D362E] to-[#4A5D4E] hover:from-[#1E251F] hover:to-[#38463B] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-[#D4A373]" />
                  <span>
                    {isSubmitting
                      ? "Generating & Dispatching Request..."
                      : `Get Curated Low/No Down Homes in ${desiredCity || "My City"} →`}
                  </span>
                </button>
              </div>
            </form>
          ) : (
            /* Confirmation & Immediate Gratification View */
            <div className="space-y-5 animate-fadeIn">
              <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50 via-[#FAF9F5] to-emerald-50/50 border border-emerald-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    Lead Generation Request Dispatched
                  </span>
                  <h3 className="font-serif font-bold text-xl text-[#2D362E]">
                    Curated Home List Request Sent to {agent.name}!
                  </h3>
                  <p className="text-xs text-[#606C5D] max-w-md mx-auto leading-relaxed">
                    Thank you, <strong>{fullName}</strong>. {agent.name.split(" ")[0]} has received your request for recently listed homes in <strong>{desiredCity}</strong> eligible for low or no down payment programs.
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  <a
                    href={`tel:${agent.phone}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D362E] hover:bg-[#1E251F] text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-[#D4A373]" />
                    <span>Call {agent.name.split(" ")[0]} Now ({agent.phone})</span>
                  </a>

                  <a
                    href={`sms:${agent.phone}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#EAE7E0] hover:bg-[#FAF9F5] text-[#4A5D4E] text-xs font-bold transition-all shadow-2xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#C18C5D]" />
                    <span>Send SMS Text</span>
                  </a>
                </div>
              </div>

              {/* Matching Homes Instant Preview */}
              {matchedPreviewProperties.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-sm text-[#2D362E] flex items-center gap-1.5">
                      <Home className="w-4 h-4 text-[#4A5D4E]" />
                      <span>Instant Preview: Low/No Down Homes in Area</span>
                    </h4>
                    <span className="text-[11px] text-[#9A9488]">
                      {matchedPreviewProperties.length} snapshot properties
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {matchedPreviewProperties.map((prop) => (
                      <div
                        key={prop.id}
                        className="bg-[#FAF9F5] rounded-2xl border border-[#EAE7E0] p-3 flex items-center justify-between gap-3 hover:border-[#DCD7CD] transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {prop.imageUrl ? (
                            <img
                              src={prop.imageUrl}
                              alt={prop.address}
                              className="w-14 h-14 rounded-xl object-cover shrink-0 border border-[#EAE7E0]"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-[#EAE7E0] text-lg">
                              🏡
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-[#2D362E] truncate">
                              {prop.address}
                            </div>
                            <div className="text-[11px] text-[#606C5D]">
                              {prop.city}, {prop.county} County • <strong>{formatUSD(prop.price)}</strong>
                            </div>
                            <div className="flex flex-wrap items-center gap-1 mt-1">
                              {prop.overlayEligibility?.usdaEligible && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                                  USDA 0% Down
                                </span>
                              )}
                              {prop.overlayEligibility?.lmiEligible && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900">
                                  OHCS LMI Grant
                                </span>
                              )}
                              {prop.overlayEligibility?.firstHomeEligible && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-900">
                                  FirstHome Cap
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <a
                          href={getZillowUrl(prop as any)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-white border border-[#EAE7E0] hover:bg-[#FAF9F5] text-[#4A5D4E] text-xs font-bold shrink-0 transition-colors"
                          title="View on Zillow"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full py-2.5 rounded-xl bg-[#FAF9F5] hover:bg-[#F1EFE9] border border-[#EAE7E0] text-xs font-bold text-[#606C5D] transition-colors cursor-pointer"
              >
                Close & Return to Market Trends
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
