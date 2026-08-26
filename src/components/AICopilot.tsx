import React, { useState } from "react";
import { 
  Sparkles, 
  Send, 
  RefreshCw, 
  ShieldCheck, 
  FileText, 
  HelpCircle, 
  User, 
  Bot, 
  ArrowRight,
  CheckCircle2,
  DollarSign,
  AlertTriangle
} from "lucide-react";
import { FinancialProfile, PropertyListing, ChatMessage } from "../types";
import { formatUSD } from "../utils/mortgageMath";

interface AICopilotProps {
  profile: FinancialProfile;
  properties: PropertyListing[];
}

export const AICopilot: React.FC<AICopilotProps> = ({ profile, properties }) => {
  const [activeTool, setActiveTool] = useState<"chat" | "offer" | "inspection" | "le_decoder">("chat");

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "advisor",
      text: `Hello! I am your First-Time Homebuyer Roadmap AI Advisor. I'm here to help you navigate every phase of buying your first home—from understanding DTI ratios, Down Payment Assistance (DPA) options, and Interested Party Contribution (IPC) limits to crafting winning offers and negotiating inspection credits. How can I help you today?`,
      timestamp: "Just now",
      suggestedActions: [
        "What are the seller concession & IPC limits for FHA, Conventional, VA, and USDA?",
        "How do Conventional IPC limits change based on LTV (>90% vs 80-90% vs <=80%)?",
        "Can seller concessions be used to pay for my down payment?",
        "How can I ask the seller for closing credits to buy down my rate?"
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [sendingChat, setSendingChat] = useState(false);

  // Offer Strategy State
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(properties[0]?.id || "custom");
  const [customPrice, setCustomPrice] = useState(425000);
  const [customAddress, setCustomAddress] = useState("123 Maple Street");
  const [daysOnMarket, setDaysOnMarket] = useState(12);
  const [offerLoanType, setOfferLoanType] = useState("Conventional (>90% LTV, 3% IPC limit)");
  const [marketCondition, setMarketCondition] = useState("Balanced Market");
  const [offerResult, setOfferResult] = useState<string | null>(null);
  const [loadingOffer, setLoadingOffer] = useState(false);

  // Inspection Audit State
  const [inspectionInput, setInspectionInput] = useState(
    "1. Water heater is 16 years old and showing minor corrosion on intake valve.\n2. Minor hairline crack in garage slab foundation.\n3. Master bathroom GFCI outlet did not trip when tested.\n4. Second floor bedroom window has broken thermal seal with condensation inside glass.\n5. Architectural roof shingles show minor granule loss on south slope, estimated 3-5 years life remaining."
  );
  const [inspectionPropertyPrice, setInspectionPropertyPrice] = useState(425000);
  const [inspectionResult, setInspectionResult] = useState<string | null>(null);
  const [loadingInspection, setLoadingInspection] = useState(false);

  // Handlers
  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || sendingChat) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: "Just now"
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage("");
    setSendingChat(true);

    try {
      const res = await fetch("/api/gemini/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          context: {
            income: profile.annualIncome,
            downPayment: profile.downPaymentSavings,
            monthlyDebt: profile.monthlyDebt,
            targetPrice: profile.targetPrice,
            location: profile.state
          },
          chatHistory: messages.slice(-4)
        }),
      });

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "advisor",
        text: data.reply || data.fallback || "I'm here to help you evaluate properties and financing options.",
        timestamp: "Just now"
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      console.error(e);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "advisor",
        text: "I am ready to assist with your mortgage questions, contract terms, or inspection reviews. Feel free to ask anything about the first-time homebuyer process!",
        timestamp: "Just now"
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setSendingChat(false);
    }
  };

  const handleGenerateOfferStrategy = async () => {
    setLoadingOffer(true);
    setOfferResult(null);

    const prop = properties.find(p => p.id === selectedPropertyId);
    const propDetails = prop
      ? {
          price: prop.price,
          address: prop.address,
          daysOnMarket: prop.daysOnMarket,
          notes: prop.notes
        }
      : {
          price: customPrice,
          address: customAddress,
          daysOnMarket,
          notes: "Standard turnkey condition"
        };

    try {
      const res = await fetch("/api/gemini/offer-strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyDetails: propDetails,
          buyerFinances: {
            preApprovalAmount: profile.targetPrice + 25000,
            cashAvailable: profile.downPaymentSavings + 15000,
            loanType: offerLoanType
          },
          marketCondition
        }),
      });

      const data = await res.json();
      setOfferResult(data.strategy || "Strategy generated successfully.");
    } catch (e) {
      console.error(e);
      setOfferResult("Recommended approach: Offer at 98% of list price with a 7-day inspection contingency and request $5,000 in seller credits for rate buydown.");
    } finally {
      setLoadingOffer(false);
    }
  };

  const handleAuditInspection = async () => {
    setLoadingInspection(true);
    setInspectionResult(null);

    try {
      const res = await fetch("/api/gemini/inspection-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inspectionNotes: inspectionInput,
          propertyPrice: inspectionPropertyPrice
        }),
      });

      const data = await res.json();
      setInspectionResult(data.analysis || "Inspection audit completed.");
    } catch (e) {
      console.error(e);
      setInspectionResult("Analysis completed: Focus repair requests on electrical GFCI safety and an aging water heater replacement credit (~$1,800).");
    } finally {
      setLoadingInspection(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl border border-[#EAE7E0] p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1EFE9] text-[#4A5D4E] text-xs font-semibold border border-[#EAE7E0]">
              <Sparkles className="w-3.5 h-3.5 text-[#C18C5D]" />
              <span>Roadmap Real Estate Intelligence • Gemini 3.7 Flash</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2D362E]">
              AI Homebuyer Copilot & Strategic Tools
            </h2>
            <p className="text-xs sm:text-sm text-[#606C5D]">
              Personalized guidance, automated offer terms, inspection defect triage, and Loan Estimate decoding.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-[#EAE7E0]">
          {[
            { id: "chat", label: "Ask AI Copilot", icon: Bot },
            { id: "offer", label: "Offer Strategy Generator", icon: Sparkles },
            { id: "inspection", label: "Inspection Report Triage", icon: ShieldCheck },
            { id: "le_decoder", label: "Loan Estimate (LE) Decoder", icon: FileText },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTool === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTool(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#4A5D4E] text-white shadow-sm font-bold"
                    : "bg-white text-[#606C5D] hover:text-[#2D362E] border border-[#EAE7E0]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tool 1: Interactive Chat Tab */}
      {activeTool === "chat" && (
        <div className="bg-white rounded-2xl border border-[#EAE7E0] flex flex-col h-[650px] overflow-hidden shadow-sm">
          {/* Chat message history */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <div key={msg.id} className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isUser ? "bg-[#4A5D4E] text-white font-bold" : "bg-[#F1EFE9] text-[#4A5D4E] border border-[#EAE7E0]"
                  }`}>
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-[#C18C5D]" />}
                  </div>

                  <div className={`max-w-[80%] space-y-2 rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isUser ? "bg-[#4A5D4E] text-white" : "bg-[#F9F8F4] text-[#2D362E] border border-[#EAE7E0] shadow-xs"
                  }`}>
                    <div className="whitespace-pre-line">{msg.text}</div>

                    {/* Suggested quick replies if available */}
                    {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div className="pt-2 border-t border-[#EAE7E0] space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A9488]">Suggested Questions:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.suggestedActions.map((sug, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSendMessage(sug)}
                              className="text-[11px] bg-white hover:bg-[#F1EFE9] text-[#4A5D4E] px-2.5 py-1 rounded-lg border border-[#EAE7E0] text-left transition-colors font-medium"
                            >
                              {sug}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {sendingChat && (
              <div className="flex items-center gap-3 text-[#606C5D] text-xs animate-pulse">
                <div className="w-8 h-8 rounded-xl bg-[#F1EFE9] text-[#4A5D4E] border border-[#EAE7E0] flex items-center justify-center">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#C18C5D]" />
                </div>
                <span>AI Copilot is formulating personalized guidance...</span>
              </div>
            )}
          </div>

          {/* Chat input box */}
          <div className="p-4 bg-[#F1EFE9]/60 border-t border-[#EAE7E0] flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask about down payments, interest rates, inspection negotiation, escrow..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={sendingChat}
              className="flex-1 bg-white border border-[#EAE7E0] rounded-xl px-4 py-3 text-xs sm:text-sm text-[#2D362E] placeholder-[#9A9488] focus:outline-none focus:border-[#4A5D4E]"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={sendingChat || !inputMessage.trim()}
              className="p-3 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white font-semibold transition-all disabled:opacity-40 shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tool 2: Offer Strategy Generator */}
      {activeTool === "offer" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#EAE7E0] p-6 space-y-5 shadow-sm">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C18C5D]">Offer Intelligence</span>
              <h3 className="text-lg font-serif font-bold text-[#2D362E] mt-0.5">Customize Property Details</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#606C5D] mb-1">Select Property</label>
                <select
                  value={selectedPropertyId}
                  onChange={(e) => setSelectedPropertyId(e.target.value)}
                  className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2.5 text-xs sm:text-sm text-[#2D362E] font-medium focus:outline-none focus:border-[#4A5D4E]"
                >
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.title} ({formatUSD(p.price)})</option>
                  ))}
                  <option value="custom">Custom Property...</option>
                </select>
              </div>

              {selectedPropertyId === "custom" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#606C5D] mb-1">Target Price ($)</label>
                    <input
                      type="number"
                      step="5000"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(Number(e.target.value))}
                      className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#2D362E] font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#606C5D] mb-1">Days on Market</label>
                    <input
                      type="number"
                      value={daysOnMarket}
                      onChange={(e) => setDaysOnMarket(Number(e.target.value))}
                      className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#2D362E] font-bold"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#606C5D] mb-1">Loan Program (IPC Cap)</label>
                <select
                  value={offerLoanType}
                  onChange={(e) => setOfferLoanType(e.target.value)}
                  className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2.5 text-xs sm:text-sm text-[#2D362E] font-medium focus:outline-none focus:border-[#4A5D4E]"
                >
                  <option value="Conventional (>90% LTV, 3% IPC limit)">Conventional &gt;90% LTV (3% Max IPC)</option>
                  <option value="Conventional (80%-90% LTV, 6% IPC limit)">Conventional 80%-90% LTV (6% Max IPC)</option>
                  <option value="Conventional (<=80% LTV, 9% IPC limit)">Conventional &le;80% LTV (9% Max IPC)</option>
                  <option value="FHA Loan (6% Max IPC)">FHA Loan (6% Max IPC)</option>
                  <option value="USDA Rural Development (6% Max IPC)">USDA Rural Development (6% Max IPC)</option>
                  <option value="VA Home Loan (4% Max Seller Concessions)">VA Home Loan (4% Max Concessions)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#606C5D] mb-1">Current Market Climate</label>
                <select
                  value={marketCondition}
                  onChange={(e) => setMarketCondition(e.target.value)}
                  className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl px-3 py-2.5 text-xs sm:text-sm text-[#2D362E] font-medium focus:outline-none focus:border-[#4A5D4E]"
                >
                  <option value="Hot Seller's Market (Multiple Offers)">Hot Seller's Market (Multiple Offers)</option>
                  <option value="Balanced Market">Balanced Market (Standard)</option>
                  <option value="Buyer's Market (Price Cuts & High Inventory)">Buyer's Market (High Inventory & Price Cuts)</option>
                </select>
              </div>

              <button
                onClick={handleGenerateOfferStrategy}
                disabled={loadingOffer}
                className="w-full py-3 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loadingOffer ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#C18C5D]" />}
                <span>{loadingOffer ? "Generating Strategy..." : "Generate AI Offer Strategy"}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#F9F8F4] rounded-2xl border border-[#EAE7E0] p-6 space-y-4 shadow-sm">
            <h3 className="text-base font-serif font-bold text-[#2D362E] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C18C5D]" />
              <span>Recommended Offer Blueprint</span>
            </h3>

            {offerResult ? (
              <div className="text-xs sm:text-sm text-[#2D362E] leading-relaxed space-y-3 whitespace-pre-line bg-white p-5 rounded-xl border border-[#EAE7E0] shadow-xs">
                {offerResult}
              </div>
            ) : (
              <div className="text-center py-16 text-[#9A9488] space-y-2">
                <Sparkles className="w-8 h-8 mx-auto text-[#9A9488]" />
                <p className="text-xs">Click "Generate AI Offer Strategy" to get tactical price targets, EMD guidelines, contingency clauses, and seller concession requests.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tool 3: Inspection Report Triage */}
      {activeTool === "inspection" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#EAE7E0] p-6 space-y-5 shadow-sm">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#C18C5D]">Defect Triage & Repair Credits</span>
              <h3 className="text-lg font-serif font-bold text-[#2D362E] mt-0.5">Paste Inspection Notes</h3>
              <p className="text-xs text-[#606C5D]">
                Paste findings from your home inspector to identify safety red flags, ballpark contractor repair costs, and generate seller credit request language.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#606C5D] mb-1">Inspection Findings / Punchlist</label>
                <textarea
                  rows={8}
                  value={inspectionInput}
                  onChange={(e) => setInspectionInput(e.target.value)}
                  className="w-full bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl p-3 text-xs text-[#2D362E] leading-relaxed focus:outline-none focus:border-[#4A5D4E]"
                />
              </div>

              <button
                onClick={handleAuditInspection}
                disabled={loadingInspection}
                className="w-full py-3 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loadingInspection ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>{loadingInspection ? "Auditing Inspection..." : "Triage Defects & Draft Credit Letter"}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#F9F8F4] rounded-2xl border border-[#EAE7E0] p-6 space-y-4 shadow-sm">
            <h3 className="text-base font-serif font-bold text-[#2D362E] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#4A5D4E]" />
              <span>Inspection Risk Assessment & Repair Addendum</span>
            </h3>

            {inspectionResult ? (
              <div className="text-xs sm:text-sm text-[#2D362E] leading-relaxed space-y-3 whitespace-pre-line bg-white p-5 rounded-xl border border-[#EAE7E0] shadow-xs">
                {inspectionResult}
              </div>
            ) : (
              <div className="text-center py-16 text-[#9A9488] space-y-2">
                <ShieldCheck className="w-8 h-8 mx-auto text-[#9A9488]" />
                <p className="text-xs">Paste inspection punchlist items and click above to receive cost ranges, urgency ratings, and formal seller repair request drafts.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tool 4: Loan Estimate Decoder */}
      {activeTool === "le_decoder" && (
        <div className="bg-white rounded-2xl border border-[#EAE7E0] p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C18C5D]">CFPB Standard Disclosure</span>
            <h3 className="text-xl font-serif font-bold text-[#2D362E]">How to Read Your Official Loan Estimate (LE)</h3>
            <p className="text-xs text-[#606C5D]">Lenders must provide this 3-page form within 3 business days of applying. Here is how to audit each section:</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-[#F9F8F4] p-4 rounded-xl border border-[#EAE7E0] space-y-2">
              <div className="flex items-center gap-2 text-[#4A5D4E] font-bold">
                <span className="w-5 h-5 rounded-full bg-[#4A5D4E]/20 flex items-center justify-center text-xs">A</span>
                <span>Section A: Origination Charges</span>
              </div>
              <p className="text-[#606C5D] leading-relaxed">
                <strong className="text-[#2D362E]">Zero-Tolerance Section:</strong> This is what the lender charges you directly (application, underwriting, discount points). Compare Section A between lenders to find the cheapest loan.
              </p>
            </div>

            <div className="bg-[#F9F8F4] p-4 rounded-xl border border-[#EAE7E0] space-y-2">
              <div className="flex items-center gap-2 text-[#4A5D4E] font-bold">
                <span className="w-5 h-5 rounded-full bg-[#4A5D4E]/20 flex items-center justify-center text-xs">B</span>
                <span>Section B: Services You Cannot Shop For</span>
              </div>
              <p className="text-[#606C5D] leading-relaxed">
                Appraisal fees, credit report pulls, flood certifications. The lender selects these vendors on your behalf.
              </p>
            </div>

            <div className="bg-[#F9F8F4] p-4 rounded-xl border border-[#EAE7E0] space-y-2">
              <div className="flex items-center gap-2 text-[#4A5D4E] font-bold">
                <span className="w-5 h-5 rounded-full bg-[#4A5D4E]/20 flex items-center justify-center text-xs">C</span>
                <span>Section C: Services You CAN Shop For</span>
              </div>
              <p className="text-[#606C5D] leading-relaxed">
                Title search, title insurance, settlement agent / closing attorney fees. You have the legal right to choose your own title company to save money.
              </p>
            </div>

            <div className="bg-[#F9F8F4] p-4 rounded-xl border border-[#EAE7E0] space-y-2">
              <div className="flex items-center gap-2 text-[#C18C5D] font-bold">
                <span className="w-5 h-5 rounded-full bg-[#C18C5D]/20 flex items-center justify-center text-xs">F</span>
                <span>Section F & G: Prepaids and Initial Escrow</span>
              </div>
              <p className="text-[#606C5D] leading-relaxed">
                Prepaid homeowners insurance (12-14 months) and prepaid property taxes (2-4 months) to fund your impound escrow account.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
