import React, { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  Phone, 
  Calendar, 
  ChevronRight, 
  User, 
  Bot, 
  DollarSign, 
  ShieldCheck, 
  Home, 
  Clock, 
  HelpCircle, 
  Maximize2, 
  Minimize2, 
  Check, 
  ArrowRight,
  Download,
  Flame,
  Award
} from "lucide-react";
import confetti from "canvas-confetti";
import { 
  LoanOfficerProfile, 
  RealEstateAgentProfile, 
  CapturedLead, 
  FinancialProfile 
} from "../types";
import { formatUSD } from "../utils/mortgageMath";

interface LeadIntakeChatbotProps {
  loanOfficer: LoanOfficerProfile;
  agent: RealEstateAgentProfile;
  financialProfile?: FinancialProfile;
  onSaveLead: (lead: CapturedLead) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

interface IntakeStep {
  id: string;
  question: string;
  field: keyof CapturedLead;
  options: { label: string; value: string; sub?: string }[];
}

const INTAKE_STEPS: IntakeStep[] = [
  {
    id: "timeline",
    question: "When are you hoping to move into your new home?",
    field: "timeline",
    options: [
      { label: "Ready Now (30-60 Days)", value: "Ready in 30-60 Days", sub: "Actively searching" },
      { label: "3 to 6 Months Out", value: "3 to 6 Months Out", sub: "Planning & saving" },
      { label: "6 to 12 Months", value: "6 to 12 Months", sub: "Exploring options" },
      { label: "Found a Home Already!", value: "Found a House / In Escrow Soon", sub: "Need fast pre-approval" },
    ]
  },
  {
    id: "budget",
    question: "What price range or comfortable monthly payment are you aiming for?",
    field: "targetPriceRange",
    options: [
      { label: "$300k - $450k", value: "$300,000 - $450,000", sub: "Est. $2,200 - $3,100/mo" },
      { label: "$450k - $600k", value: "$450,000 - $600,000", sub: "Est. $3,100 - $4,100/mo" },
      { label: "$600k - $800k", value: "$600,000 - $800,000", sub: "Est. $4,100 - $5,400/mo" },
      { label: "Keep Under $2,500/mo", value: "Keep monthly under $2,500/mo", sub: "Based on rent budget" },
    ]
  },
  {
    id: "downPayment",
    question: "How much do you estimate having available for down payment & closing costs?",
    field: "downPaymentSavings",
    options: [
      { label: "3% to 5% Down ($12k - $25k)", value: "3% - 5% Down ($12k - $25k)", sub: "Conventional 97 / FHA" },
      { label: "10% to 20% Down ($45k+)", value: "10% - 20%+ Down ($45k+)", sub: "Lower monthly PMI" },
      { label: "Seeking Down Payment Grants", value: "Need First-Time Buyer Grants / DPA", sub: "Up to $30k assistance" },
      { label: "$0 Down (VA / USDA Rural)", value: "$0 Down (VA / USDA Eligible)", sub: "Zero down payment" },
    ]
  },
  {
    id: "creditTier",
    question: "What is your approximate credit score tier?",
    field: "creditScoreTier",
    options: [
      { label: "Excellent (740+)", value: "740+ Excellent", sub: "Best interest rates" },
      { label: "Good (680 - 739)", value: "680 - 739 Good", sub: "Strong conventional terms" },
      { label: "Fair (620 - 679)", value: "620 - 679 Fair", sub: "FHA & grant eligible" },
      { label: "Rebuilding / Need Advice", value: "Rebuilding / Need Credit Advice", sub: "Free plan to improve" },
    ]
  },
  {
    id: "location",
    question: "Which cities or neighborhoods are you most excited to explore?",
    field: "preferredLocations",
    options: [
      { label: "Portland Metro (East / West)", value: "Portland Metro (East/West)", sub: "Close to city center" },
      { label: "Beaverton / Hillsboro", value: "Beaverton / Hillsboro", sub: "Westside tech & parks" },
      { label: "Clackamas / Oregon City", value: "Clackamas / Oregon City / SE", sub: "Spacious lots" },
      { label: "Vancouver / SW Washington", value: "Vancouver / SW Washington", sub: "No state income tax" },
    ]
  }
];

export const LeadIntakeChatbot: React.FC<LeadIntakeChatbotProps> = ({
  loanOfficer,
  agent,
  financialProfile,
  onSaveLead,
  isOpen,
  onClose,
  onOpen,
}) => {
  const [messages, setMessages] = useState<{ id: string; sender: 'user' | 'advisor'; text: string; time: string }[]>([
    {
      id: "intro-1",
      sender: "advisor",
      text: `👋 Hi there! I'm your 24/7 Homebuyer Intake & Pre-Approval Guide, working alongside ${loanOfficer.name} (NMLS #${loanOfficer.nmlsId}) and ${agent.name} (${agent.brokerage}).\n\nI can help you calculate your true monthly budget, check eligibility for first-time buyer grants, and build your custom Pre-Approval Blueprint in under 2 minutes.`,
      time: "Just now"
    }
  ]);

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [inputText, setInputText] = useState<string>("");
  const [isAiTyping, setIsAiTyping] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showTeaser, setShowTeaser] = useState<boolean>(true);

  // Form data for step 6 contact info
  const [contactForm, setContactForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    preferredContactTime: "Weekday Evenings",
    propertyType: "Single Family Home"
  });

  // Collected Lead State
  const [leadState, setLeadState] = useState<Partial<CapturedLead>>({
    timeline: "",
    targetPriceRange: "",
    targetMonthlyBudget: "",
    downPaymentSavings: "",
    grantInterest: true,
    creditScoreTier: "",
    preferredLocations: "",
    propertyType: "Single Family",
    assignedLoId: loanOfficer.id,
    assignedAgentId: agent.id,
    leadSource: "Website AI Intake Chatbot",
    intentScore: "hot",
    status: "new"
  });

  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom on message
  useEffect(() => {
    if (isOpen && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAiTyping, isOpen, currentStepIndex]);

  // Handle Option Select
  const handleSelectOption = async (step: IntakeStep, optionValue: string) => {
    const updatedLead = {
      ...leadState,
      [step.field]: optionValue
    };
    if (step.id === "downPayment" && optionValue.includes("Grants")) {
      updatedLead.grantInterest = true;
    }
    setLeadState(updatedLead);

    // Add user message
    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: "user" as const,
      text: optionValue,
      time: "Just now"
    };

    setMessages(prev => [...prev, userMsg]);

    const nextIndex = currentStepIndex + 1;
    setCurrentStepIndex(nextIndex);

    if (nextIndex < INTAKE_STEPS.length) {
      const nextStep = INTAKE_STEPS[nextIndex];
      // Simulate quick natural pause
      setIsAiTyping(true);
      setTimeout(() => {
        setIsAiTyping(false);
        const botMsg = {
          id: `bot-${Date.now()}`,
          sender: "advisor" as const,
          text: `Got it! ${nextStep.question}`,
          time: "Just now"
        };
        setMessages(prev => [...prev, botMsg]);
      }, 500);
    } else {
      // Step 6: Request Contact Info for Blueprint Delivery
      setIsAiTyping(true);
      setTimeout(() => {
        setIsAiTyping(false);
        const botMsg = {
          id: `bot-${Date.now()}`,
          sender: "advisor" as const,
          text: `🎉 Excellent! Based on your answers, you have strong pre-approval potential for FHA & Conventional 97 financing with local grant assistance. Who should ${loanOfficer.name} send your custom Pre-Approval Blueprint to?`,
          time: "Just now"
        };
        setMessages(prev => [...prev, botMsg]);
      }, 600);
    }
  };

  // Free-form chat / question handler
  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isAiTyping) return;

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: "user" as const,
      text: query,
      time: "Just now"
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsAiTyping(true);

    try {
      const res = await fetch("/api/gemini/lead-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          leadData: leadState,
          chatHistory: messages.slice(-4),
          loName: loanOfficer.name,
          loNmls: loanOfficer.nmlsId,
          agentName: agent.name
        }),
      });

      const data = await res.json();
      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: "advisor" as const,
        text: data.reply || data.fallback || "I can help guide your pre-approval steps and grant options!",
        time: "Just now"
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      console.error(e);
      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: "advisor" as const,
        text: "I've noted that! We are ready to structure your customized loan options. Please let us know how best to connect.",
        time: "Just now"
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsAiTyping(false);
    }
  };

  // Submit Final Lead Form
  const handleSubmitLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.fullName || !contactForm.email || !contactForm.phone) {
      alert("Please provide your Name, Email, and Phone Number so we can send your blueprint.");
      return;
    }

    const newLead: CapturedLead = {
      id: `lead-${Date.now()}`,
      fullName: contactForm.fullName,
      email: contactForm.email,
      phone: contactForm.phone,
      preferredContactTime: contactForm.preferredContactTime,
      timeline: leadState.timeline || "Ready in 30-60 Days",
      targetPriceRange: leadState.targetPriceRange || "$425,000",
      targetMonthlyBudget: leadState.targetMonthlyBudget || "Comfortable budget",
      downPaymentSavings: leadState.downPaymentSavings || "3% - 5% Down",
      grantInterest: leadState.grantInterest ?? true,
      creditScoreTier: leadState.creditScoreTier || "Good (680+)",
      preferredLocations: leadState.preferredLocations || "Portland Metro",
      propertyType: contactForm.propertyType || "Single Family",
      assignedLoId: loanOfficer.id,
      assignedAgentId: agent.id,
      leadSource: "Website AI Intake Chatbot",
      intentScore: (leadState.timeline?.includes("30-60") || leadState.timeline?.includes("Found")) ? "hot" : "warm",
      status: "new",
      notes: `Captured via 24/7 AI Lead Intake Assistant. Target: ${leadState.targetPriceRange || "N/A"}, Timeline: ${leadState.timeline || "N/A"}.`,
      chatTranscript: messages.map(m => ({ sender: m.sender, text: m.text, time: m.time })),
      createdAt: new Date().toISOString()
    };

    onSaveLead(newLead);
    setIsCompleted(true);

    // Confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.warn(err);
    }

    // Add confirmation message
    const botConfirmMsg = {
      id: `bot-confirm-${Date.now()}`,
      sender: "advisor" as const,
      text: `🎉 Congratulations ${contactForm.fullName.split(" ")[0]}! Your Pre-Approval Blueprint has been generated and dispatched to ${loanOfficer.name}. You can also schedule a direct 1-on-1 strategy call below!`,
      time: "Just now"
    };
    setMessages(prev => [...prev, botConfirmMsg]);
  };

  const handleResetChat = () => {
    setCurrentStepIndex(0);
    setIsCompleted(false);
    setLeadState({
      timeline: "",
      targetPriceRange: "",
      targetMonthlyBudget: "",
      downPaymentSavings: "",
      grantInterest: true,
      creditScoreTier: "",
      preferredLocations: "",
      propertyType: "Single Family",
      assignedLoId: loanOfficer.id,
      assignedAgentId: agent.id,
      leadSource: "Website AI Intake Chatbot",
      intentScore: "hot",
      status: "new"
    });
    setMessages([
      {
        id: `intro-${Date.now()}`,
        sender: "advisor",
        text: `👋 Let's build your new Pre-Approval Blueprint! ${INTAKE_STEPS[0].question}`,
        time: "Just now"
      }
    ]);
  };

  return (
    <>
      {/* Floating Launcher Button & Teaser (When Closed) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
          {/* Proactive Teaser Bubble */}
          {showTeaser && (
            <div className="relative bg-white rounded-2xl p-4 shadow-xl border border-[#EAE7E0] max-w-xs animate-bounce-subtle">
              <button 
                onClick={() => setShowTeaser(false)}
                className="absolute top-2 right-2 text-[#9A9488] hover:text-[#2D362E] p-1"
                aria-label="Dismiss message"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-start gap-3">
                <div className="relative shrink-0">
                  <img 
                    src={loanOfficer.headshotUrl} 
                    alt={loanOfficer.name} 
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#4A5D4E]"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-[#2D362E]">{loanOfficer.name}</span>
                    <span className="text-[10px] bg-[#F1EFE9] text-[#4A5D4E] px-1.5 py-0.5 rounded font-semibold">24/7 AI</span>
                  </div>
                  <p className="text-xs text-[#606C5D] leading-tight">
                    Want to see your true monthly buying power & check down payment grants?
                  </p>
                  <button
                    onClick={onOpen}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#4A5D4E] hover:text-[#38463B] pt-1"
                  >
                    <span>Start 2-Min Pre-Approval</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Floating Action Badge */}
          <button
            onClick={onOpen}
            className="group relative flex items-center gap-3 px-4 py-3 bg-[#4A5D4E] hover:bg-[#38463B] text-white rounded-full shadow-2xl transition-all hover:scale-105 border-2 border-white/20"
            aria-label="Open AI Pre-Approval Chatbot"
          >
            <div className="relative flex items-center">
              <img 
                src={loanOfficer.headshotUrl} 
                alt={loanOfficer.name} 
                className="w-8 h-8 rounded-full object-cover border border-white"
              />
              <img 
                src={agent.headshotUrl} 
                alt={agent.name} 
                className="w-8 h-8 rounded-full object-cover border border-white -ml-3"
              />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#4A5D4E] animate-pulse"></span>
            </div>

            <div className="text-left pr-1">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#E7C19D]" />
                <span className="text-xs font-bold tracking-tight">AI Pre-Approval Guide</span>
              </div>
              <span className="text-[11px] text-white/80 font-medium">Check grants & buying power</span>
            </div>

            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
              <MessageSquare className="w-3.5 h-3.5 text-white" />
            </div>
          </button>
        </div>
      )}

      {/* Interactive Chat Window (When Open) */}
      {isOpen && (
        <div 
          className={`fixed z-50 transition-all duration-300 shadow-2xl bg-white flex flex-col overflow-hidden border border-[#EAE7E0] ${
            isExpanded 
              ? "inset-4 sm:inset-10 rounded-3xl" 
              : "bottom-4 right-4 sm:bottom-6 sm:right-6 w-[95vw] sm:w-[440px] h-[660px] max-h-[90vh] rounded-3xl"
          }`}
        >
          {/* Header Bar */}
          <div className="bg-[#4A5D4E] p-4 text-white flex items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src={loanOfficer.headshotUrl} 
                  alt={loanOfficer.name} 
                  className="w-10 h-10 rounded-full object-cover border-2 border-white/40"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#4A5D4E]"></span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold tracking-tight">{loanOfficer.name}</h3>
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white font-medium">
                    NMLS #{loanOfficer.nmlsId}
                  </span>
                </div>
                <p className="text-[11px] text-white/80 flex items-center gap-1">
                  <span>Co-Guide: {agent.name}</span>
                  <span>•</span>
                  <span className="text-emerald-300 font-semibold">24/7 AI Online</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="bg-[#F1EFE9] px-4 py-2 border-b border-[#EAE7E0] flex items-center justify-between text-xs text-[#606C5D] shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#C18C5D]" />
              <span className="font-semibold text-[#2D362E]">Pre-Approval Intake</span>
            </div>
            <div className="flex items-center gap-1">
              {INTAKE_STEPS.map((step, idx) => (
                <div 
                  key={step.id} 
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx < currentStepIndex || isCompleted
                      ? "bg-[#4A5D4E]" 
                      : idx === currentStepIndex 
                        ? "bg-[#C18C5D] scale-125 ring-2 ring-[#C18C5D]/30" 
                        : "bg-[#D5D0C6]"
                  }`}
                  title={step.question}
                />
              ))}
              <div 
                className={`w-2 h-2 rounded-full ${
                  isCompleted ? "bg-[#4A5D4E]" : "bg-[#D5D0C6]"
                }`}
                title="Blueprint"
              />
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#FAF9F5]">
            {messages.map((msg) => {
              const isUser = msg.sender === "user";
              return (
                <div key={msg.id} className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}>
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                    isUser ? "bg-[#4A5D4E] text-white" : "bg-[#EAE7E0] text-[#4A5D4E]"
                  }`}>
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5 text-[#C18C5D]" />}
                  </div>

                  <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                    isUser 
                      ? "bg-[#4A5D4E] text-white font-medium" 
                      : "bg-white text-[#2D362E] border border-[#EAE7E0]"
                  }`}>
                    <div className="whitespace-pre-line">{msg.text}</div>
                  </div>
                </div>
              );
            })}

            {isAiTyping && (
              <div className="flex items-center gap-2 text-xs text-[#606C5D] italic py-1">
                <div className="w-7 h-7 rounded-xl bg-[#EAE7E0] flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-[#C18C5D]" />
                </div>
                <span className="animate-pulse">{loanOfficer.name.split(" ")[0]}'s AI is typing...</span>
              </div>
            )}

            {/* Current Step Option Chips (if intake not yet completed) */}
            {!isCompleted && currentStepIndex < INTAKE_STEPS.length && (
              <div className="pt-2 pl-9 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A9488]">
                  Select an option or type below:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {INTAKE_STEPS[currentStepIndex].options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectOption(INTAKE_STEPS[currentStepIndex], opt.value)}
                      className="text-left p-2.5 rounded-xl border border-[#EAE7E0] bg-white hover:bg-[#F1EFE9] hover:border-[#4A5D4E] transition-all group shadow-2xs"
                    >
                      <div className="text-xs font-bold text-[#2D362E] group-hover:text-[#4A5D4E] flex items-center justify-between">
                        <span>{opt.label}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#9A9488] group-hover:text-[#4A5D4E]" />
                      </div>
                      {opt.sub && (
                        <div className="text-[10px] text-[#606C5D] mt-0.5">{opt.sub}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 6: Lead Contact Info Submission Form */}
            {!isCompleted && currentStepIndex >= INTAKE_STEPS.length && (
              <div className="bg-white rounded-2xl border border-[#EAE7E0] p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#4A5D4E]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Where should we deliver your Pre-Approval Blueprint?</span>
                </div>

                <form onSubmit={handleSubmitLead} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#606C5D] mb-1">Your Full Name *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Tyler Richardson"
                      value={contactForm.fullName}
                      onChange={(e) => setContactForm({ ...contactForm, fullName: e.target.value })}
                      className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#606C5D] mb-1">Email Address *</label>
                      <input 
                        type="email" 
                        required
                        placeholder="you@gmail.com"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#606C5D] mb-1">Phone Number *</label>
                      <input 
                        type="tel" 
                        required
                        placeholder="(503) 555-0199"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#606C5D] mb-1">Preferred Time to Chat</label>
                      <select
                        value={contactForm.preferredContactTime}
                        onChange={(e) => setContactForm({ ...contactForm, preferredContactTime: e.target.value })}
                        className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
                      >
                        <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                        <option value="Afternoon (12 PM - 5 PM)">Afternoon (12 PM - 5 PM)</option>
                        <option value="Weekday Evenings">Weekday Evenings</option>
                        <option value="Saturday Morning">Saturday Morning</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#606C5D] mb-1">Home Type</label>
                      <select
                        value={contactForm.propertyType}
                        onChange={(e) => setContactForm({ ...contactForm, propertyType: e.target.value })}
                        className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
                      >
                        <option value="Single Family Home">Single Family Home</option>
                        <option value="Townhome / Condo">Townhome / Condo</option>
                        <option value="Multi-Family (House Hacking)">Multi-Family (House Hacking)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#4A5D4E] hover:bg-[#38463B] text-white font-bold rounded-xl text-xs shadow-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <Award className="w-4 h-4 text-[#E7C19D]" />
                    <span>Generate & Send My Pre-Approval Blueprint</span>
                  </button>
                  <p className="text-[10px] text-center text-[#9A9488]">
                    🔒 Confidential. Zero spam. Directly reviewed by licensed professionals.
                  </p>
                </form>
              </div>
            )}

            {/* Post-Completion Blueprint Card */}
            {isCompleted && (
              <div className="bg-white rounded-2xl border border-emerald-200 p-4 space-y-4 shadow-sm animate-fade-in">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Blueprint Delivered & Saved!</span>
                </div>

                <div className="bg-[#FAF9F5] rounded-xl p-3.5 border border-[#EAE7E0] space-y-2.5 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-[#EAE7E0]">
                    <span className="text-[#606C5D]">Buyer Name:</span>
                    <span className="font-bold text-[#2D362E]">{contactForm.fullName}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-[#EAE7E0]">
                    <span className="text-[#606C5D]">Target Price:</span>
                    <span className="font-bold text-[#4A5D4E]">{leadState.targetPriceRange || "$425,000"}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-[#EAE7E0]">
                    <span className="text-[#606C5D]">Timeline:</span>
                    <span className="font-semibold text-[#2D362E]">{leadState.timeline}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#606C5D]">Eligible Loan Programs:</span>
                    <span className="text-emerald-700 font-semibold">Conventional 97, FHA 3.5%, State DPA</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <a
                    href={loanOfficer.bookingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 bg-[#4A5D4E] hover:bg-[#38463B] text-white font-bold rounded-xl text-xs shadow-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Book 15-Min Strategy Call with {loanOfficer.name.split(" ")[0]}</span>
                  </a>

                  <button
                    onClick={handleResetChat}
                    className="w-full py-2 bg-[#FAF9F5] hover:bg-[#F1EFE9] text-[#606C5D] font-semibold rounded-xl text-xs border border-[#EAE7E0] transition-colors"
                  >
                    Start New Inquiry / Change Details
                  </button>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-white border-t border-[#EAE7E0] flex items-center gap-2 shrink-0">
            <input 
              type="text"
              placeholder={isCompleted ? "Ask a question about rates, grants, or closing..." : "Type your question or reply..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={isAiTyping}
              className="flex-1 bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#2D362E] placeholder-[#9A9488] focus:outline-none focus:border-[#4A5D4E]"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isAiTyping || !inputText.trim()}
              className="p-2.5 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white disabled:opacity-40 transition-all shadow-sm shrink-0"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
