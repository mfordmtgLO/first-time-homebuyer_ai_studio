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
  ChevronDown,
  ChevronUp,
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
  Award,
  MapPin,
  Search,
  CheckSquare,
  Square,
  Loader2,
  Mic,
  MicOff,
  Lock,
  AlertTriangle,
} from "lucide-react";
import confetti from "canvas-confetti";
import {
  LoanOfficerProfile,
  RealEstateAgentProfile,
  CapturedLead,
  FinancialProfile,
} from "../types";
import { HeadshotAvatar } from "./HeadshotAvatar";
import { formatUSD } from "../utils/mortgageMath";
import { containsSSN, sanitizeSSN } from "../utils/ssnProtection";
import { useIsMobile } from "../hooks/useIsMobile";
import { telemetry } from "../services/telemetryService";

// Comprehensive alphabetical listing of cities and towns across the state of Oregon
export const OREGON_CITIES: string[] = [
  "Albany",
  "Aloha",
  "Amity",
  "Ashland",
  "Astoria",
  "Athena",
  "Aumsville",
  "Aurora",
  "Baker City",
  "Bandon",
  "Banks",
  "Bay City",
  "Beavercreek",
  "Beaverton",
  "Bend",
  "Boardman",
  "Bonanza",
  "Brookings",
  "Brownsville",
  "Burns",
  "Canby",
  "Cannon Beach",
  "Canyonville",
  "Carlton",
  "Cascade Locks",
  "Cave Junction",
  "Central Point",
  "Clackamas",
  "Clatskanie",
  "Coburg",
  "Columbia City",
  "Condon",
  "Coos Bay",
  "Coquille",
  "Corbett",
  "Cornelius",
  "Corvallis",
  "Cottage Grove",
  "Cove",
  "Creswell",
  "Culver",
  "Dallas",
  "Damascus",
  "Dayton",
  "Dayville",
  "Depoe Bay",
  "Drain",
  "Dundee",
  "Dufur",
  "Eagle Crest",
  "Eagle Point",
  "Echo",
  "Elgin",
  "Elkton",
  "Enterprise",
  "Estacada",
  "Eugene",
  "Fairview",
  "Florence",
  "Forest Grove",
  "Fossil",
  "Garibaldi",
  "Gearhart",
  "Gladstone",
  "Glendale",
  "Gold Beach",
  "Gold Hill",
  "Grand Ronde",
  "Grants Pass",
  "Gresham",
  "Haines",
  "Halfway",
  "Halsey",
  "Happy Valley",
  "Harrisburg",
  "Helix",
  "Heppner",
  "Hermiston",
  "Hillsboro",
  "Hines",
  "Hood River",
  "Hubbard",
  "Huntington",
  "Idanha",
  "Imbler",
  "Independence",
  "Ione",
  "Irrigon",
  "Island City",
  "Jacksonville",
  "Jefferson",
  "John Day",
  "Joseph",
  "Junction City",
  "Keizer",
  "King City",
  "Klamath Falls",
  "La Grande",
  "La Pine",
  "Lafayette",
  "Lake Oswego",
  "Lakeside",
  "Lakeview",
  "Lebanon",
  "Lincoln City",
  "Lonerock",
  "Long Creek",
  "Lostine",
  "Lowell",
  "Lyons",
  "Madras",
  "Malin",
  "Manzanita",
  "Maupin",
  "Mayville",
  "McMinnville",
  "Medford",
  "Merrill",
  "Metolius",
  "Mill City",
  "Millersburg",
  "Milton-Freewater",
  "Milwaukie",
  "Mitchell",
  "Molalla",
  "Monmouth",
  "Monroe",
  "Monument",
  "Moro",
  "Mosier",
  "Mount Angel",
  "Mount Hood Village",
  "Mount Vernon",
  "Myrtle Creek",
  "Myrtle Point",
  "Nehalem",
  "Newberg",
  "Newport",
  "North Bend",
  "North Plains",
  "North Powder",
  "Nyssa",
  "Oak Grove",
  "Oakland",
  "Oakridge",
  "Ontario",
  "Oregon City",
  "Pacific City",
  "Paisley",
  "Parkdale",
  "Pendleton",
  "Philomath",
  "Phoenix",
  "Pilot Rock",
  "Port Orford",
  "Portland",
  "Powers",
  "Prairie City",
  "Prineville",
  "Rainier",
  "Redmond",
  "Reedsport",
  "Rhododendron",
  "Richland",
  "Riddle",
  "Rivergrove",
  "Rockaway Beach",
  "Rogue River",
  "Roseburg",
  "Rufus",
  "Saint Helens",
  "Saint Paul",
  "Salem",
  "Sandy",
  "Scappoose",
  "Scio",
  "Scotts Mills",
  "Seaside",
  "Seneca",
  "Shady Cove",
  "Shaniko",
  "Sheridan",
  "Sherwood",
  "Siletz",
  "Silverton",
  "Sisters",
  "Sodaville",
  "Spray",
  "Springfield",
  "Stanfield",
  "Stayton",
  "Sublimity",
  "Summerville",
  "Sumpter",
  "Sunriver",
  "Sutherlin",
  "Sweet Home",
  "Talent",
  "Tanget",
  "Terrebonne",
  "The Dalles",
  "Tigard",
  "Tillamook",
  "Toledo",
  "Troutdale",
  "Tualatin",
  "Turner",
  "Ukiah",
  "Umatilla",
  "Union",
  "Vale",
  "Veneta",
  "Vernonia",
  "Waldport",
  "Wallowa",
  "Warm Springs",
  "Warrenton",
  "Wasco",
  "Waterloo",
  "Welches",
  "West Linn",
  "Westfir",
  "Weston",
  "Wheeler",
  "White City",
  "Willamina",
  "Wilsonville",
  "Winchester Bay",
  "Winston",
  "Wood Village",
  "Woodburn",
  "Yachats",
  "Yamhill",
  "Yoncalla",
];

interface LeadIntakeChatbotProps {
  loanOfficer: LoanOfficerProfile;
  agent?: RealEstateAgentProfile;
  isCoBranded?: boolean;
  financialProfile?: FinancialProfile;
  sourceCampaignId?: string;
  sourceCampaignName?: string;
  sourcePropertyId?: string;
  sourcePropertyAddress?: string;
  initialSourceType?: "campaign" | "property_listing" | "chatbot" | "flyer" | "calculator";
  initialLeadSource?: string;
  initialIntent?: "chat_listings" | "blueprint_download" | "buying_power";
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
      {
        label: "Found a Home Already!",
        value: "Found a House / In Escrow Soon",
        sub: "Need fast prequalification",
      },
    ],
  },
  {
    id: "budget",
    question: "What price range or comfortable monthly payment are you aiming for?",
    field: "targetPriceRange",
    options: [
      { label: "$300k - $450k", value: "$300,000 - $450,000", sub: "Est. $2,200 - $3,100/mo" },
      { label: "$450k - $600k", value: "$450,000 - $600,000", sub: "Est. $3,100 - $4,100/mo" },
      { label: "$600k - $800k", value: "$600,000 - $800,000", sub: "Est. $4,100 - $5,400/mo" },
      {
        label: "Keep Under $2,500/mo",
        value: "Keep monthly under $2,500/mo",
        sub: "Based on rent budget",
      },
    ],
  },
  {
    id: "downPayment",
    question: "How much do you estimate having available for down payment & closing costs?",
    field: "downPaymentSavings",
    options: [
      {
        label: "3% to 5% Down ($12k - $25k)",
        value: "3% - 5% Down ($12k - $25k)",
        sub: "Conventional 97 / FHA",
      },
      {
        label: "10% to 20% Down ($45k+)",
        value: "10% - 20%+ Down ($45k+)",
        sub: "Lower monthly PMI",
      },
      {
        label: "Seeking Down Payment Assistance",
        value: "Need Down Payment Assistance (DPA)",
        sub: "State & local assistance programs",
      },
      {
        label: "$0 Down (VA / USDA Rural)",
        value: "$0 Down (VA / USDA Eligible)",
        sub: "Zero down payment",
      },
    ],
  },
  {
    id: "creditTier",
    question: "What is your approximate credit score tier?",
    field: "creditScoreTier",
    options: [
      { label: "Excellent (740+)", value: "740+ Excellent", sub: "Best interest rates" },
      { label: "Good (680 - 739)", value: "680 - 739 Good", sub: "Strong conventional terms" },
      { label: "Fair (620 - 679)", value: "620 - 679 Fair", sub: "FHA & DPA eligible" },
      {
        label: "Rebuilding / Need Advice",
        value: "Rebuilding / Need Credit Advice",
        sub: "Free plan to improve",
      },
    ],
  },
  {
    id: "annualIncome",
    question: "What is your approximate gross annual household income before taxes?",
    field: "annualIncome",
    options: [], // Custom interactive slider ($0 - $1,000,000) and currency formatted input
  },
  {
    id: "location",
    question: "Which cities are you most excited to explore?",
    field: "preferredLocations",
    options: [], // Replaced by the comprehensive Oregon cities dropdown selector
  },
  {
    id: "sampleHomes",
    question:
      "Would you like us to send you a few recently available homes for sale in your desired city or surrounding areas that have potential for low or no down payment financing options?",
    field: "sendSampleHomesOption",
    options: [
      {
        label: "YES",
        value: "YES - Please send available homes with low/no down payment options",
        sub: "Curated listings in my target Oregon areas",
      },
      {
        label: "NO",
        value: "NO - Just send my Prequalification Blueprint",
        sub: "Only my customized blueprint for now",
      },
    ],
  },
];

export const LeadIntakeChatbot: React.FC<LeadIntakeChatbotProps> = ({
  loanOfficer,
  agent,
  isCoBranded = false,
  financialProfile,
  sourceCampaignId,
  sourceCampaignName,
  sourcePropertyId,
  sourcePropertyAddress,
  initialSourceType,
  initialLeadSource,
  initialIntent,
  onSaveLead,
  isOpen,
  onClose,
  onOpen,
}) => {
  const showAgent = isCoBranded && !!agent;
  const isMobile = useIsMobile();

  const [messages, setMessages] = useState<
    { id: string; sender: "user" | "advisor"; text: string; time: string }[]
  >(() => {
    const partnerInfo =
      isCoBranded && agent
        ? `working alongside ${loanOfficer.name} (NMLS #${loanOfficer.nmlsId}) and ${agent.name} (${agent.brokerage})`
        : `working alongside ${loanOfficer.name} (NMLS #${loanOfficer.nmlsId})`;

    return [
      {
        id: "intro-1",
        sender: "advisor",
        text: `👋 Hi there! I'm your 24/7 Homebuyer Intake & Prequalification Guide, ${partnerInfo}.\n\n🔒 **No Credit Card or SSN Required** — Let's calculate your true monthly budget, check Down Payment Assistance (DPA) options, and build your custom Prequalification Blueprint in under 2 minutes.\n\n${INTAKE_STEPS[0].question}`,
        time: "Just now",
      },
    ];
  });

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [inputText, setInputText] = useState<string>("");
  const [inputError, setInputError] = useState<string>("");
  const [isSubmittingQuery, setIsSubmittingQuery] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showTeaser, setShowTeaser] = useState<boolean>(true);
  const [aiProvider, setAiProvider] = useState<"deepseek" | "gemini" | "none">("none");

  // Web Speech API State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInputText((prev) => (prev ? prev + " " + finalTranscript : finalTranscript));
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }
  };

  useEffect(() => {
    fetch("/api/ai/diagnostics")
      .then(async (res) => {
        const contentType = res.headers.get("content-type") || "";
        if (!res.ok || !contentType.includes("application/json")) {
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.activeProvider) {
          setAiProvider(data.activeProvider);
        }
      })
      .catch((e) => console.error("Failed to fetch AI diagnostics:", e));
  }, []);
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fast-track contact form for contextual intents
  useEffect(() => {
    if (isOpen && initialIntent) {
      if (initialIntent === "chat_listings") {
        setLeadState((prev) => ({
          ...prev,
          sendSampleHomesOption:
            "YES - Please send available homes with low/no down payment options",
        }));
      }
      setCurrentStepIndex(INTAKE_STEPS.length);
    }
  }, [isOpen, initialIntent]);

  // Handle setting messages for initial intent
  useEffect(() => {
    if (isOpen && initialIntent) {
      let msgText = "";
      if (initialIntent === "blueprint_download") {
        msgText =
          "Great! Let's get your personalized Homebuyer Journey Blueprint sent over immediately. Where should we send it?";
      } else if (initialIntent === "chat_listings") {
        msgText =
          "Awesome! We will compile a curated list of low and no down payment homes in your target area. Who should we send it to?";
      } else if (initialIntent === "buying_power") {
        msgText =
          "Great! I have your Buying Power results ready to send. What is the best Name and Email to send your customized report to?";
      }

      setMessages([
        {
          id: `msg-initial-${Date.now()}`,
          sender: "advisor",
          text: msgText,
          time: "Just now",
        },
      ]);
    } else if (isOpen && currentStepIndex === 0 && messages.length === 0) {
      // Original initial greeting
      setMessages([
        {
          id: "msg-initial",
          sender: "advisor",
          text: `Hi there! I'm ${loanOfficer.name}'s AI assistant. Ready to build your customized First-Time Homebuyer Blueprint?`,
          time: "Just now",
        },
      ]);
    }
  }, [isOpen, initialIntent]);

  // Detect scroll to expand or make compact
  useEffect(() => {
    const handleWindowScroll = () => {
      // BULLETPROOF MOBILE FIX: Completely ignore scroll events on screens smaller than 1024px
      // This prevents the chatbot state from EVER changing to 'isScrolling=true' on an iPhone
      if (window.innerWidth < 1024) return;
      
      setIsScrolling(true);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 1500); // return to compact after 1.5s of stillness
    };

    window.addEventListener("scroll", handleWindowScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleWindowScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // Form data for step 6 contact info
  const [contactForm, setContactForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    preferredContactTime: "Weekday Evenings",
    propertyType: "Single Family Home",
    notes: "",
    smsConsentAuthorized: true,
  });

  // Oregon Cities selection state
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [citySearchQuery, setCitySearchQuery] = useState<string>("");
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState<boolean>(true);

  // Annual Income interactive state ($0 to $1,000,000)
  const [annualIncomeAmount, setAnnualIncomeAmount] = useState<number>(120000);
  const [annualIncomeInputStr, setAnnualIncomeInputStr] = useState<string>("$120,000");

  const formatIncomeCurrency = (val: number) => {
    return `$${val.toLocaleString()}`;
  };

  const handleIncomeSliderChange = (val: number) => {
    const clamped = Math.min(1000000, Math.max(0, val));
    setAnnualIncomeAmount(clamped);
    setAnnualIncomeInputStr(formatIncomeCurrency(clamped));
  };

  const handleIncomeInputChange = (raw: string) => {
    const digits = raw.replace(/[^0-9]/g, "");
    if (!digits) {
      setAnnualIncomeAmount(0);
      setAnnualIncomeInputStr("$");
      return;
    }
    const num = Math.min(1000000, parseInt(digits, 10));
    setAnnualIncomeAmount(num);
    setAnnualIncomeInputStr(formatIncomeCurrency(num));
  };

  const handleConfirmAnnualIncome = () => {
    const step = INTAKE_STEPS[currentStepIndex];
    if (step && step.id === "annualIncome") {
      const formatted = `${formatIncomeCurrency(annualIncomeAmount)} / year`;
      handleSelectOption(step, formatted);
    }
  };

  // Collected Lead State
  const [leadState, setLeadState] = useState<Partial<CapturedLead>>({
    timeline: "",
    targetPriceRange: "",
    targetMonthlyBudget: "",
    downPaymentSavings: "",
    grantInterest: true,
    creditScoreTier: "",
    annualIncome: "",
    preferredLocations: "",
    propertyType: "Single Family",
    assignedLoId: loanOfficer.id,
    assignedAgentId: showAgent && agent ? agent.id : undefined,
    leadSource: "Website AI Intake Chatbot",
    intentScore: "hot",
    status: "new",
  });

  // Batch processing mechanism for consolidating lead intake updates during idle periods
  const pendingIntakeBatchRef = useRef<Partial<CapturedLead>>({});
  const intakeIdleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const queueIntakeBatchUpdate = (update: Partial<CapturedLead>) => {
    pendingIntakeBatchRef.current = {
      ...pendingIntakeBatchRef.current,
      ...update,
    };
    if (intakeIdleTimerRef.current) {
      clearTimeout(intakeIdleTimerRef.current);
    }
    intakeIdleTimerRef.current = setTimeout(() => {
      const batched = pendingIntakeBatchRef.current;
      pendingIntakeBatchRef.current = {};
      if (Object.keys(batched).length > 0) {
        try {
          const leadId = localStorage.getItem("fthb_lead_id") || `lead-draft-${Date.now()}`;
          localStorage.setItem(`fthb_lead_draft_${leadId}`, JSON.stringify(batched));
        } catch (e) {
          // ignore
        }
      }
    }, 1500);
  };

  useEffect(() => {
    return () => {
      if (intakeIdleTimerRef.current) clearTimeout(intakeIdleTimerRef.current);
    };
  }, []);

  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const activeOptionsRef = useRef<HTMLDivElement | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const messageElementsRef = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const scrollToActiveMessage = (msgId?: string) => {
    if (!chatContainerRef.current) return;
    const container = chatContainerRef.current;

    let targetEl: HTMLElement | null = null;
    if (msgId && messageElementsRef.current[msgId]) {
      targetEl = messageElementsRef.current[msgId];
    } else if (messages.length > 0) {
      // Find the latest advisor message or the last message in general
      const lastAdvisorMsg = [...messages].reverse().find((m) => m.sender === "advisor");
      const lastMsg = lastAdvisorMsg || messages[messages.length - 1];
      if (lastMsg && messageElementsRef.current[lastMsg.id]) {
        targetEl = messageElementsRef.current[lastMsg.id];
      }
    }

    if (targetEl && activeOptionsRef.current) {
      const containerRect = container.getBoundingClientRect();
      const elemRect = targetEl.getBoundingClientRect();
      const optionsRect = activeOptionsRef.current.getBoundingClientRect();
      const currentScroll = container.scrollTop;

      const totalBlockHeight = optionsRect.bottom - elemRect.top;

      if (totalBlockHeight <= containerRect.height - 28) {
        // Fits comfortably: align to top of message
        const targetScroll = currentScroll + (elemRect.top - containerRect.top) - 12;
        container.scrollTo({
          top: Math.max(0, targetScroll),
          behavior: "smooth",
        });
      } else {
        // Taller than viewport: scroll so the interactive options / question controls are fully visible in view
        const targetScroll = currentScroll + (optionsRect.bottom - containerRect.bottom) + 20;
        container.scrollTo({
          top: Math.max(0, targetScroll),
          behavior: "smooth",
        });
      }
    } else if (targetEl) {
      const containerRect = container.getBoundingClientRect();
      const elemRect = targetEl.getBoundingClientRect();
      const currentScroll = container.scrollTop;
      const targetScroll = currentScroll + (elemRect.top - containerRect.top) - 12;
      container.scrollTo({
        top: Math.max(0, targetScroll),
        behavior: "smooth",
      });
    } else {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  // Scroll to ensure the newest advisor message and interactive options are fully visible
  useEffect(() => {
    if (!isOpen) return;

    const timer1 = setTimeout(() => {
      scrollToActiveMessage();
    }, 40);

    const timer2 = setTimeout(() => {
      scrollToActiveMessage();
    }, 180);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [messages, currentStepIndex, isOpen, isCompleted, isCityDropdownOpen]);

  const handleRevisitStep = (stepIndex: number) => {
    setCurrentStepIndex(stepIndex);
    setIsCompleted(false);
    const targetCount = 1 + stepIndex * 2;
    setMessages((prev) => prev.slice(0, Math.min(prev.length, targetCount)));
    if (INTAKE_STEPS[stepIndex]?.id === "annualIncome") {
      if (leadState.annualIncome) {
        const digits = leadState.annualIncome.replace(/[^0-9]/g, "");
        if (digits) {
          const num = Math.min(1000000, parseInt(digits, 10));
          setAnnualIncomeAmount(num);
          setAnnualIncomeInputStr(formatIncomeCurrency(num));
        }
      }
    }
    if (INTAKE_STEPS[stepIndex]?.id === "location") {
      setIsCityDropdownOpen(true);
      if (leadState.preferredLocations) {
        const parsed = leadState.preferredLocations
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean);
        setSelectedCities(parsed);
      }
    }
  };

  const handleToggleCity = (city: string) => {
    setSelectedCities((prev) => {
      const next = prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city];
      return next;
    });
    // Ensure the confirm button / bottom is scrolled into view when selecting cities
    setTimeout(() => {
      scrollToActiveMessage();
    }, 60);
  };

  const handleConfirmCitiesSelection = () => {
    if (selectedCities.length === 0) return;
    const citiesString = selectedCities.join(", ");
    const step = INTAKE_STEPS[currentStepIndex];
    setIsCityDropdownOpen(false);
    if (step) {
      handleSelectOption(step, citiesString);
    }
  };

  // Handle Option Select - Instant natural flow without typing delays or scroll hiccups
  const handleSelectOption = (step: IntakeStep, optionValue: string) => {
    const updatedLead = {
      ...leadState,
      [step.field]: optionValue,
    };
    if (step.id === "location" || step.field === "preferredLocations") {
      updatedLead.taggedCityArea = optionValue;
    }
    if (step.id === "annualIncome") {
      updatedLead.annualIncome = optionValue;
    }
    if (step.id === "downPayment" && optionValue.includes("Grants")) {
      updatedLead.grantInterest = true;
    }
    if (step.id === "sampleHomes") {
      updatedLead.sendSampleHomes = optionValue.startsWith("YES");
      updatedLead.sendSampleHomesOption = optionValue;
    }
    setLeadState(updatedLead);
    queueIntakeBatchUpdate(updatedLead);

    // Add user message
    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: "user" as const,
      text: optionValue,
      time: "Just now",
    };

    const nextIndex = currentStepIndex + 1;
    setCurrentStepIndex(nextIndex);

    // Part P2-4: Write answered intake step to /memories (Shared Memory Schema)
    try {
      const activeLeadId = (leadState as any)?.id || localStorage.getItem("fthb_lead_id") || "anonymous_lead";
      fetch("/api/memories/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Intake Step ${step.stepNumber}: ${step.question}`,
          content: `Borrower answered: ${optionValue}`,
          kind: "intake_answer",
          industryId: "mortgage_real_estate",
          leadId: activeLeadId,
          source: "lead_intake_chatbot",
          metadata: {
            stepId: step.id,
            stepNumber: step.stepNumber,
            selectedValue: optionValue,
            currentBudget: leadState.targetPriceRange,
            timeline: leadState.timeline,
          },
        }),
      }).catch((e) => console.warn("Memory event notice:", e));
    } catch (memErr) {
      console.warn("Intake memory record notice:", memErr);
    }

    if (nextIndex < INTAKE_STEPS.length) {
      const nextStep = INTAKE_STEPS[nextIndex];
      const botMsg = {
        id: `bot-${Date.now() + 1}`,
        sender: "advisor" as const,
        text: `Got it! ${nextStep.question}`,
        time: "Just now",
      };
      setMessages((prev) => [...prev, userMsg, botMsg]);
    } else {
      // Step 6: Request Contact Info for Blueprint Delivery
      const botMsg = {
        id: `bot-${Date.now() + 1}`,
        sender: "advisor" as const,
        text: `🎉 Excellent! Based on your answers, you have strong prequalification potential for FHA & Conventional 97 financing with Down Payment Assistance (DPA). Who should ${loanOfficer.name} send your custom Prequalification Blueprint to?`,
        time: "Just now",
      };
      setMessages((prev) => [...prev, userMsg, botMsg]);
    }
  };

  // Free-form chat / question handler
  const handleSendMessage = async (textToSend?: string) => {
    const rawQuery = textToSend || inputText;
    if (!rawQuery.trim() || isSubmittingQuery) return;

    // Strict SSN Detection & Hardcoded Rejection Rule
    if (containsSSN(rawQuery)) {
      setInputError(
        "⚠️ For your security, Social Security Numbers (SSN) are blocked and never accepted here. No SSN or Credit Card is required."
      );
      const warningBotMsg = {
        id: `bot-ssn-${Date.now()}`,
        sender: "advisor" as const,
        text: "🛡️ **Security Alert: Social Security Numbers are never accepted here.**\n\nNo SSN, credit check, or credit card is required to explore prequalification or Down Payment Assistance. Please do not share sensitive identifiers.",
        time: "Just now",
      };
      setMessages((prev) => [...prev, warningBotMsg]);
      setInputText("");
      setTimeout(() => {
        setInputError("");
      }, 5000);
      return;
    }

    setInputError("");
    const query = sanitizeSSN(rawQuery);

    const userMsg = {
      id: `usr-${Date.now()}`,
      sender: "user" as const,
      text: query,
      time: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsSubmittingQuery(true);

    try {
      telemetry.addBreadcrumb(
        "security",
        "AI Payload Sanitized & Dispatched",
        { endpoint: "/api/gemini/lead-intake", payloadSize: query.length, piiRedacted: true },
        "info"
      );
      const res = await fetch("/api/gemini/lead-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          industryId: "mortgage_real_estate",
          leadData: leadState,
          chatHistory: messages.slice(-4),
          loanOfficer: loanOfficer,
          agent: agent,
        }),
      });

      const data = await res.json();
      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: "advisor" as const,
        text:
          data.reply ||
          data.fallback ||
          "I can help guide your prequalification steps and Down Payment Assistance (DPA) options!",
        time: "Just now",
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      console.error(e);
      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: "advisor" as const,
        text: "I've noted that! We are ready to structure your customized loan options. Please let us know how best to connect.",
        time: "Just now",
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsSubmittingQuery(false);
    }
  };

  // Submit Final Lead Form
  const handleSubmitLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.fullName || !contactForm.email || !contactForm.phone) {
      alert("Please provide your Name, Email, and Phone Number so we can send your blueprint.");
      return;
    }

    // Check if user accidentally inputted an SSN in any contact field
    if (
      containsSSN(contactForm.fullName) ||
      containsSSN(contactForm.email) ||
      containsSSN(contactForm.phone)
    ) {
      alert(
        "⚠️ For your privacy and security, Social Security Numbers are strictly blocked and never accepted. Please remove any SSN to proceed."
      );
      return;
    }

    const finalSourceType =
      initialSourceType ||
      (sourcePropertyAddress ? "property_listing" : sourceCampaignName ? "campaign" : "chatbot");
    const computedLeadSource =
      initialLeadSource ||
      (sourcePropertyAddress
        ? `Listing: ${sourcePropertyAddress}`
        : sourceCampaignName
          ? `Campaign: ${sourceCampaignName}`
          : `Website AI Intake Chatbot`);

    const computedLeadPathTag =
      leadState.leadPathTag ||
      (initialIntent === "chat_listings"
        ? "Curated Listings Request Shortcut"
        : initialIntent === "blueprint_download"
          ? "Blueprint Download Fast-Track"
          : initialIntent === "buying_power"
            ? "Buying Power Report Shortcut"
            : sourcePropertyAddress
              ? `Property Listing Inquiry (${sourcePropertyAddress.split(",")[0]})`
              : sourceCampaignName
                ? `Ad Campaign (${sourceCampaignName})`
                : "Interactive Guided AI Intake");

    const computedTaggedCityArea =
      leadState.taggedCityArea ||
      leadState.preferredLocations ||
      (sourcePropertyAddress
        ? sourcePropertyAddress.includes(",")
          ? sourcePropertyAddress.split(",")[1]?.trim()
          : sourcePropertyAddress
        : "Portland Metro Area");

    const newLead: CapturedLead = {
      id: `lead-${Date.now()}`,
      fullName: sanitizeSSN(contactForm.fullName),
      email: sanitizeSSN(contactForm.email),
      phone: sanitizeSSN(contactForm.phone),
      preferredContactTime: contactForm.preferredContactTime,
      timeline: leadState.timeline || "Ready in 30-60 Days",
      targetPriceRange: leadState.targetPriceRange || "$425,000",
      targetMonthlyBudget: leadState.targetMonthlyBudget || "Comfortable budget",
      downPaymentSavings: leadState.downPaymentSavings || "3% - 5% Down",
      grantInterest: leadState.grantInterest ?? true,
      creditScoreTier: leadState.creditScoreTier || "Good (680+)",
      annualIncome: leadState.annualIncome || `${formatIncomeCurrency(annualIncomeAmount)} / year`,
      preferredLocations: leadState.preferredLocations || computedTaggedCityArea,
      taggedCityArea: computedTaggedCityArea,
      leadPathTag: computedLeadPathTag,
      propertyType: contactForm.propertyType || "Single Family",
      sendSampleHomes:
        leadState.sendSampleHomes ?? leadState.sendSampleHomesOption?.startsWith("YES") ?? true,
      sendSampleHomesOption:
        leadState.sendSampleHomesOption ||
        "YES - Please send available homes with low/no down payment options",
      assignedLoId: loanOfficer.id,
      assignedAgentId: agent?.id,
      leadSource: computedLeadSource,
      sourceCampaignId: sourceCampaignId,
      sourceCampaignName: sourceCampaignName,
      sourcePropertyId: sourcePropertyId,
      sourcePropertyAddress: sourcePropertyAddress,
      interactedSourceType: finalSourceType,
      intentScore:
        leadState.timeline?.includes("30-60") || leadState.timeline?.includes("Found")
          ? "hot"
          : "warm",
      status: "new",
      leadCurationRequest: initialIntent === "chat_listings" ? {
        status: "requested",
        city: leadState.preferredLocations || "Unknown",
        priceRange: leadState.targetPriceRange || null,
        source: "chatbot",
        requestedAt: new Date().toISOString()
      } : undefined,
      notes:
        (initialIntent === "chat_listings"
          ? "[URGENT ACTION REQUIRED]: Lead requested a curated list of low/no down payment homes in their desired city. Generate and send a property list via the SMS Hub or Email Outreach!\n\n"
          : "") +
        (contactForm.notes?.trim()
          ? `${sanitizeSSN(contactForm.notes.trim())}\n\n[System Record]: Captured via 24/7 AI Lead Intake Assistant. Source: ${computedLeadSource}. Target: ${leadState.targetPriceRange || "N/A"}, Income: ${leadState.annualIncome || `${formatIncomeCurrency(annualIncomeAmount)}/yr`}, Timeline: ${leadState.timeline || "N/A"}.`
          : `Captured via 24/7 AI Lead Intake Assistant. Source: ${computedLeadSource}. Target: ${leadState.targetPriceRange || "N/A"}, Income: ${leadState.annualIncome || `${formatIncomeCurrency(annualIncomeAmount)}/yr`}, Timeline: ${leadState.timeline || "N/A"}.`),
      chatTranscript: messages.map((m) => ({
        sender: m.sender,
        text: sanitizeSSN(m.text),
        time: m.time,
      })),
      createdAt: new Date().toISOString(),
      // TCPA SMS Consent & Automated Text Nurture
      smsConsentAuthorized: contactForm.smsConsentAuthorized,
      smsConsentTimestamp: contactForm.smsConsentAuthorized ? new Date().toISOString() : undefined,
      textNurtureEnabled: contactForm.smsConsentAuthorized,
      textNurtureCurrentStep: 1,
      textNurtureTotalSteps: 4,
      textNurtureStageText: contactForm.smsConsentAuthorized
        ? "1 of 4 automated text nurture active"
        : "Text Nurture Opted Out",
      lastTextSentAt: new Date().toISOString(),
      lastTextTemplateName: "Welcome & OHCS $10k Grant Calculator Link",
      smsMessages: [
        {
          id: `sms-init-${Date.now()}`,
          direction: "outbound",
          text: `Hi ${(contactForm.fullName || "there").split(" ")[0]}! This is ${loanOfficer.name} with ${loanOfficer.company || "Guild Mortgage"}. Thank you for completing your Oregon Homebuyer Blueprint! We sent your custom DPA grant calculation details to ${contactForm.email}.`,
          timestamp: new Date().toISOString(),
          status: "delivered",
        },
      ],
    };

    onSaveLead(newLead);
    setIsCompleted(true);

    // Confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.warn(err);
    }

    // Add confirmation message
    const botConfirmMsg = {
      id: `bot-confirm-${Date.now()}`,
      sender: "advisor" as const,
      text: `🎉 Congratulations ${(contactForm.fullName || "there").split(" ")[0]}! Your Prequalification Blueprint has been generated and dispatched to ${loanOfficer.name}. You can also schedule a direct 1-on-1 strategy call below!`,
      time: "Just now",
    };
    setMessages((prev) => [...prev, botConfirmMsg]);
  };

  const handleResetChat = () => {
    setCurrentStepIndex(0);
    setIsCompleted(false);
    setSelectedCities([]);
    setCitySearchQuery("");
    setIsCityDropdownOpen(true);
    setAnnualIncomeAmount(120000);
    setAnnualIncomeInputStr("$120,000");
    setLeadState({
      timeline: "",
      targetPriceRange: "",
      targetMonthlyBudget: "",
      downPaymentSavings: "",
      grantInterest: true,
      creditScoreTier: "",
      annualIncome: "",
      preferredLocations: "",
      propertyType: "Single Family",
      sendSampleHomes: true,
      sendSampleHomesOption: "",
      assignedLoId: loanOfficer.id,
      assignedAgentId: agent.id,
      leadSource: "Website AI Intake Chatbot",
      intentScore: "hot",
      status: "new",
    });
    setMessages([
      {
        id: `intro-${Date.now()}`,
        sender: "advisor",
        text: `👋 Let's build your new Prequalification Blueprint!\n\n${INTAKE_STEPS[0].question}`,
        time: "Just now",
      },
    ]);
  };

  return (
    <>
      {/* Floating Launcher Button & Teaser (When Closed) */}
      {!isOpen && (
        <div className="fixed bottom-24 lg:bottom-6 right-6 z-50 flex flex-col items-end gap-3">
          {/* Proactive Teaser Bubble */}
          {showTeaser && isScrolling && (
            <div className="hidden lg:block relative bg-white rounded-2xl p-4 shadow-xl border border-[#EAE7E0] max-w-xs transition-all duration-300 animate-fade-in mb-2">
              <button
                onClick={() => setShowTeaser(false)}
                className="absolute top-2 right-2 text-[#9A9488] hover:text-[#2D362E] p-1"
                aria-label="Dismiss message"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-start gap-3">
                <div className="relative shrink-0">
                  <HeadshotAvatar
                    src={loanOfficer.headshotUrl}
                    name={loanOfficer.name}
                    title={loanOfficer.title}
                    className="w-10 h-10 rounded-full border-2 border-[#4A5D4E]"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-[#2D362E]">{loanOfficer.name}</span>
                    <span className="text-[10px] bg-[#F1EFE9] text-[#4A5D4E] px-1.5 py-0.5 rounded font-semibold">
                      24/7 AI
                    </span>
                  </div>
                  <p className="text-xs text-[#606C5D] leading-tight">
                    Want to see your true monthly buying power & check Down Payment Assistance
                    (DPA)?
                  </p>
                  <button
                    onClick={onOpen}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#4A5D4E] hover:text-[#38463B] pt-1"
                  >
                    <span>Start 2-Min Prequal</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Floating Action Badge / Compact Icon */}
          <button
            onClick={onOpen}
            className={`group relative flex items-center bg-[#4A5D4E] hover:bg-[#38463B] text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-105 border-2 border-white/20 ${
              isScrolling
                ? "w-14 h-14 justify-center p-0 lg:w-auto lg:h-auto lg:gap-3 lg:px-4 lg:py-3 lg:justify-start"
                : "w-14 h-14 justify-center p-0"
            }`}
            aria-label="Open AI Prequal Chatbot"
          >
            {/* COMPACT ICON (Always visible on mobile OR when not scrolling on desktop) */}
            <div className={`relative flex items-center justify-center w-full h-full p-1 ${isScrolling ? "lg:hidden" : ""}`}>
              <HeadshotAvatar
                src={loanOfficer.headshotUrl}
                name={loanOfficer.name}
                title={loanOfficer.title}
                className="w-10 h-10 rounded-full border-2 border-white"
              />
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#4A5D4E]"></span>
            </div>

            {/* EXPANDED CONTENT (Only visible on desktop AND when scrolling) */}
            {isScrolling && (
              <div className="hidden lg:flex items-center w-full">
                <div className="relative flex items-center shrink-0">
                  <HeadshotAvatar
                    src={loanOfficer.headshotUrl}
                    name={loanOfficer.name}
                    title={loanOfficer.title}
                    className="w-8 h-8 rounded-full border border-white"
                  />
                  {showAgent && agent && (
                    <HeadshotAvatar
                      src={agent.headshotUrl}
                      name={agent.name}
                      title={agent.title}
                      className="w-8 h-8 rounded-full border border-white -ml-3"
                    />
                  )}
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#4A5D4E] animate-pulse"></span>
                </div>

                <div className="text-left pr-1 pl-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#E7C19D]" />
                    <span className="text-xs font-bold tracking-tight">AI Prequal Guide</span>
                  </div>
                  <span className="text-[11px] text-white/80 font-medium">
                    Check DPA & buying power
                  </span>
                </div>

                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center ml-auto">
                  <MessageSquare className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            )}
          </button>
        </div>
      )}

      {/* Interactive Chat Window (When Open) */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 shadow-2xl bg-white flex flex-col overflow-hidden border border-[#EAE7E0] ${
            isExpanded
              ? "inset-4 sm:inset-10 rounded-3xl"
              : "bottom-4 right-4 sm:bottom-6 sm:right-6 w-[95vw] sm:w-[460px] h-[690px] max-h-[92vh] rounded-3xl"
          }`}
        >
          {/* Header Bar */}
          <div className="bg-[#4A5D4E] p-4 text-white flex items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <HeadshotAvatar
                  src={loanOfficer.headshotUrl}
                  name={loanOfficer.name}
                  title={loanOfficer.title}
                  className="w-10 h-10 rounded-full border-2 border-white/40"
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
                  {showAgent && agent && (
                    <>
                      <span>Co-Guide: {agent.name}</span>
                      <span>•</span>
                    </>
                  )}
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

          {/* Progress & Privacy Indicator */}
          <div className="bg-[#F1EFE9] px-4 py-2 border-b border-[#EAE7E0] flex flex-wrap items-center justify-between gap-1.5 text-xs text-[#606C5D] shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#C18C5D]" />
              <span className="font-semibold text-[#2D362E]">Prequalification Intake</span>
              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                <Lock className="w-2.5 h-2.5" />
                No Credit Card or SSN Required
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {INTAKE_STEPS.map((step, idx) => (
                <button
                  key={step.id}
                  onClick={() => idx <= currentStepIndex && handleRevisitStep(idx)}
                  disabled={idx > currentStepIndex && !isCompleted}
                  className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                    idx < currentStepIndex || isCompleted
                      ? "bg-[#4A5D4E] hover:scale-125"
                      : idx === currentStepIndex
                        ? "bg-[#C18C5D] scale-125 ring-2 ring-[#C18C5D]/30"
                        : "bg-[#D5D0C6] opacity-60 cursor-not-allowed"
                  }`}
                  title={`Revisit ${step.id}`}
                />
              ))}
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  isCompleted ? "bg-[#4A5D4E]" : "bg-[#D5D0C6]"
                }`}
                title="Blueprint"
              />
            </div>
          </div>

          {/* Active Tracked Campaign / Listing Ribbon */}
          {(sourcePropertyAddress || sourceCampaignName) && (
            <div className="bg-[#C18C5D]/10 px-4 py-2 border-b border-[#C18C5D]/30 flex items-center justify-between text-xs text-[#2D362E] font-medium shrink-0">
              <div className="flex items-center gap-1.5 truncate">
                {sourcePropertyAddress ? (
                  <>
                    <Home className="w-3.5 h-3.5 text-[#C18C5D] shrink-0" />
                    <span className="truncate">
                      Inquiring on Listing:{" "}
                      <strong className="font-semibold text-[#4A5D4E]">
                        {sourcePropertyAddress}
                      </strong>
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#C18C5D] shrink-0" />
                    <span className="truncate">
                      Attributed Campaign:{" "}
                      <strong className="font-semibold text-[#4A5D4E]">{sourceCampaignName}</strong>
                    </span>
                  </>
                )}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#C18C5D] text-white px-2 py-0.5 rounded-full shrink-0 ml-2">
                Source Tracked
              </span>
            </div>
          )}

          {/* Chat Messages Body with Free Scroll & Smooth Transitions */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#FAF9F5] scroll-smooth relative"
          >
            {/* Quick Revisit Bar if user scrolled up or has answered steps */}
            {currentStepIndex > 0 && !isCompleted && (
              <div className="bg-white/80 backdrop-blur-xs border border-[#EAE7E0] rounded-xl p-2.5 text-center text-xs text-[#606C5D] flex items-center justify-between shadow-2xs">
                <span>💡 You can scroll up/down or jump back to edit prior answers:</span>
                <button
                  onClick={() => handleRevisitStep(0)}
                  className="text-xs font-bold text-[#4A5D4E] hover:underline px-2 py-1 bg-[#F1EFE9] rounded-lg"
                >
                  Restart Intake
                </button>
              </div>
            )}

            {messages.map((msg, index) => {
              const isUser = msg.sender === "user";
              return (
                <div
                  key={msg.id}
                  ref={(el) => {
                    if (el) messageElementsRef.current[msg.id] = el;
                  }}
                  className={`flex items-start gap-2.5 transition-all duration-300 ease-out animate-fade-in ${isUser ? "flex-row-reverse" : ""}`}
                >
                  {isUser ? (
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 bg-[#4A5D4E] text-white">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="relative shrink-0">
                      <HeadshotAvatar
                        src={loanOfficer.headshotUrl}
                        name={loanOfficer.name}
                        title={loanOfficer.title}
                        className="w-7 h-7 rounded-xl border border-[#EAE7E0]"
                      />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed shadow-xs break-words overflow-hidden ${
                      isUser
                        ? "bg-[#4A5D4E] text-white font-medium flex items-center justify-between gap-3"
                        : "bg-white text-[#2D362E] border border-[#EAE7E0]"
                    }`}
                  >
                    <div className="whitespace-pre-line break-words text-left">{msg.text}</div>
                    {isUser && (
                      <button
                        onClick={() => {
                          // Find which step this user message corresponds to
                          const stepIdx = Math.floor(index / 2);
                          if (stepIdx < INTAKE_STEPS.length) {
                            handleRevisitStep(stepIdx);
                          }
                        }}
                        className="text-[10px] bg-white/20 hover:bg-white/30 text-white px-2 py-1 rounded-lg font-semibold shrink-0 transition-colors"
                        title="Click to edit or change this answer"
                      >
                        Edit / Change
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Current Step Option Controls (if intake not yet completed) */}
            {!isCompleted && currentStepIndex < INTAKE_STEPS.length && (
              <div ref={activeOptionsRef} className="pt-2 pl-0 sm:pl-9 space-y-2">
                {INTAKE_STEPS[currentStepIndex].id === "location" ? (
                  /* Oregon Cities Multi-Select Dropdown with Checkboxes */
                  <div className="space-y-2.5 animate-fade-in">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A9488] flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-[#C18C5D]" />
                        Select Oregon Cities (One or Multiple):
                      </span>
                      {selectedCities.length > 0 && (
                        <button
                          type="button"
                          onClick={handleConfirmCitiesSelection}
                          className="text-[11px] font-extrabold text-[#4A5D4E] hover:text-[#38463B] bg-[#EAE7E0] hover:bg-[#dedad0] px-2.5 py-0.5 rounded-full flex items-center gap-1 transition-colors cursor-pointer"
                          title="Confirm and proceed to next question"
                        >
                          <span>{selectedCities.length} selected</span>
                          <span className="text-[10px] underline">Confirm →</span>
                        </button>
                      )}
                    </div>

                    <div className="bg-white rounded-2xl border border-[#EAE7E0] shadow-sm overflow-hidden">
                      {/* Dropdown Toggle Header */}
                      <div className="w-full p-2.5 sm:p-3 bg-[#FAF9F5] border-b border-[#EAE7E0] flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                          className="flex items-center gap-2 text-xs font-semibold text-[#2D362E] min-w-0 pr-2 cursor-pointer text-left flex-1"
                        >
                          <MapPin className="w-4 h-4 text-[#4A5D4E] shrink-0" />
                          {selectedCities.length === 0 ? (
                            <span className="text-[#9A9488]">
                              Select Oregon cities from alphabetical list...
                            </span>
                          ) : (
                            <span className="truncate">
                              <strong className="text-[#4A5D4E]">
                                {selectedCities.length}{" "}
                                {selectedCities.length === 1 ? "City" : "Cities"}:
                              </strong>{" "}
                              {selectedCities.slice(0, 3).join(", ")}
                              {selectedCities.length > 3
                                ? ` +${selectedCities.length - 3} more`
                                : ""}
                            </span>
                          )}
                        </button>

                        <div className="flex items-center gap-2 shrink-0">
                          {selectedCities.length > 0 && (
                            <button
                              type="button"
                              onClick={handleConfirmCitiesSelection}
                              className="px-2.5 py-1 bg-[#4A5D4E] hover:bg-[#38463B] text-white text-[11px] font-bold rounded-lg shadow-xs flex items-center gap-1 transition-all cursor-pointer"
                            >
                              <span>Confirm</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                            className="flex items-center gap-1 text-[#606C5D] hover:text-[#2D362E] text-[11px] font-medium p-1 cursor-pointer"
                          >
                            <span className="hidden sm:inline">
                              {isCityDropdownOpen ? "Collapse" : "Browse"}
                            </span>
                            {isCityDropdownOpen ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Dropdown Content */}
                      {isCityDropdownOpen && (
                        <div className="p-3 space-y-2.5">
                          {/* Search Bar */}
                          <div className="relative">
                            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#9A9488]" />
                            <input
                              type="text"
                              placeholder="Search Oregon cities (e.g. Bend, Eugene, Beaverton)..."
                              value={citySearchQuery}
                              onChange={(e) => setCitySearchQuery(e.target.value)}
                              className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl pl-8 pr-8 py-2 text-xs text-[#2D362E] focus:outline-none focus:border-[#4A5D4E] placeholder-[#9A9488]"
                            />
                            {citySearchQuery && (
                              <button
                                type="button"
                                onClick={() => setCitySearchQuery("")}
                                className="absolute right-2.5 top-2 text-[#9A9488] hover:text-[#2D362E] text-xs p-0.5"
                                title="Clear search"
                              >
                                ✕
                              </button>
                            )}
                          </div>

                          {/* Selected Tags Display */}
                          {selectedCities.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto py-1">
                              {selectedCities.map((city) => (
                                <span
                                  key={city}
                                  className="inline-flex items-center gap-1 text-[11px] font-medium bg-[#4A5D4E] text-white px-2 py-0.5 rounded-lg shadow-2xs"
                                >
                                  {city}
                                  <button
                                    type="button"
                                    onClick={() => handleToggleCity(city)}
                                    className="hover:text-[#E7C19D] ml-0.5 text-xs"
                                    title={`Remove ${city}`}
                                  >
                                    ✕
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Quick Select Presets */}
                          <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-[#EAE7E0] text-[10px]">
                            <div className="flex items-center gap-1 text-[#606C5D] flex-wrap">
                              <span className="font-semibold">Quick Add:</span>
                              {[
                                "Portland",
                                "Beaverton",
                                "Bend",
                                "Eugene",
                                "Salem",
                                "Oregon City",
                                "Hillsboro",
                              ].map((pop) => (
                                <button
                                  key={pop}
                                  type="button"
                                  onClick={() => handleToggleCity(pop)}
                                  className={`px-1.5 py-0.5 rounded-md border transition-all cursor-pointer ${
                                    selectedCities.includes(pop)
                                      ? "bg-[#4A5D4E] text-white border-[#4A5D4E] font-bold"
                                      : "bg-[#FAF9F5] text-[#2D362E] border-[#EAE7E0] hover:border-[#4A5D4E]"
                                  }`}
                                >
                                  {selectedCities.includes(pop) ? `✓ ${pop}` : `+ ${pop}`}
                                </button>
                              ))}
                            </div>

                            {selectedCities.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setSelectedCities([])}
                                className="text-[#9A9488] hover:text-rose-600 underline font-medium text-[10px] cursor-pointer"
                              >
                                Clear All
                              </button>
                            )}
                          </div>

                          {/* Alphabetical Scrollable List with Checkboxes */}
                          <div className="max-h-36 overflow-y-auto border border-[#EAE7E0] rounded-xl divide-y divide-[#EAE7E0] bg-[#FAF9F5]/40 pr-1">
                            {OREGON_CITIES.filter((c) =>
                              c.toLowerCase().includes(citySearchQuery.toLowerCase().trim())
                            ).map((city) => {
                              const isChecked = selectedCities.includes(city);
                              return (
                                <div
                                  key={city}
                                  onClick={() => handleToggleCity(city)}
                                  className={`flex items-center justify-between px-3 py-2 text-xs cursor-pointer select-none transition-colors ${
                                    isChecked
                                      ? "bg-[#4A5D4E]/10 font-bold text-[#2D362E]"
                                      : "hover:bg-white text-[#2D362E]"
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <div
                                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                                        isChecked
                                          ? "bg-[#4A5D4E] border-[#4A5D4E] text-white"
                                          : "border-[#9A9488] bg-white"
                                      }`}
                                    >
                                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                                    </div>
                                    <span>{city}</span>
                                  </div>
                                  <span className="text-[10px] font-medium text-[#9A9488]">
                                    Oregon
                                  </span>
                                </div>
                              );
                            })}

                            {OREGON_CITIES.filter((c) =>
                              c.toLowerCase().includes(citySearchQuery.toLowerCase().trim())
                            ).length === 0 && (
                              <div className="p-4 text-center text-xs text-[#9A9488] space-y-2">
                                <p>No Oregon cities found matching "{citySearchQuery}".</p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (citySearchQuery.trim()) {
                                      handleToggleCity(citySearchQuery.trim());
                                      setCitySearchQuery("");
                                    }
                                  }}
                                  className="text-[11px] font-bold text-[#4A5D4E] underline hover:text-[#38463B]"
                                >
                                  + Add "{citySearchQuery.trim()}" as custom location
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Submit / Confirm Button */}
                          <button
                            type="button"
                            onClick={handleConfirmCitiesSelection}
                            disabled={selectedCities.length === 0}
                            className={`w-full py-2.5 rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                              selectedCities.length > 0
                                ? "bg-[#4A5D4E] hover:bg-[#38463B] text-white ring-2 ring-[#C18C5D]/40"
                                : "bg-[#FAF9F5] text-[#9A9488] border border-[#EAE7E0] opacity-60 cursor-not-allowed"
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4 text-[#E7C19D]" />
                            <span>
                              {selectedCities.length === 0
                                ? "Select One or Multiple Cities Above to Continue"
                                : `Confirm ${selectedCities.length} Selected ${selectedCities.length === 1 ? "City" : "Cities"} & Continue`}
                            </span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : INTAKE_STEPS[currentStepIndex].id === "annualIncome" ? (
                  /* Custom Interactive Annual Income Slider & Currency Formatted Input */
                  <div className="bg-white rounded-2xl border border-[#EAE7E0] p-4 shadow-sm space-y-3.5 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#4A5D4E]">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        <span>Approximate Gross Annual Income</span>
                      </div>
                      <span className="text-[10px] text-[#9A9488] font-medium">
                        Household total before taxes
                      </span>
                    </div>

                    {/* Currency Input Field */}
                    <div className="space-y-1">
                      <div className="relative">
                        <input
                          type="text"
                          value={annualIncomeInputStr}
                          onChange={(e) => handleIncomeInputChange(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleConfirmAnnualIncome();
                            }
                          }}
                          className="w-full bg-[#FAF9F5] border-2 border-[#4A5D4E]/30 focus:border-[#4A5D4E] rounded-xl px-4 py-2.5 text-center text-xl font-extrabold text-[#2D362E] focus:outline-none shadow-xs transition-colors tracking-tight"
                          placeholder="$0"
                        />
                      </div>
                      <p className="text-[10px] text-center text-[#606C5D]">
                        Type any amount or use the slider below ($0 to $1,000,000)
                      </p>
                    </div>

                    {/* Range Slider */}
                    <div className="space-y-1.5 pt-1">
                      <input
                        type="range"
                        min="0"
                        max="1000000"
                        step="5000"
                        value={annualIncomeAmount}
                        onChange={(e) => handleIncomeSliderChange(Number(e.target.value))}
                        className="w-full h-2 bg-[#EAE7E0] rounded-lg appearance-none cursor-pointer accent-[#4A5D4E]"
                      />
                      <div className="flex justify-between text-[10px] text-[#9A9488] font-semibold px-0.5">
                        <span>$0</span>
                        <span>$250k</span>
                        <span>$500k</span>
                        <span>$750k</span>
                        <span>$1.0M</span>
                      </div>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A9488] block">
                        Quick Presets:
                      </span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[60000, 95000, 140000, 220000].map((presetVal) => (
                          <button
                            key={presetVal}
                            type="button"
                            onClick={() => handleIncomeSliderChange(presetVal)}
                            className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all border cursor-pointer ${
                              annualIncomeAmount === presetVal
                                ? "bg-[#4A5D4E] text-white border-[#4A5D4E]"
                                : "bg-[#FAF9F5] hover:bg-[#F1EFE9] text-[#2D362E] border-[#EAE7E0]"
                            }`}
                          >
                            ${presetVal >= 1000 ? `${presetVal / 1000}k` : presetVal}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Confirm Button */}
                    <button
                      type="button"
                      onClick={handleConfirmAnnualIncome}
                      className="w-full py-2.5 bg-[#4A5D4E] hover:bg-[#38463B] text-white font-bold rounded-xl text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#E7C19D]" />
                      <span>
                        Confirm Annual Income ({formatIncomeCurrency(annualIncomeAmount)}/yr)
                      </span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : INTAKE_STEPS[currentStepIndex].id === "sampleHomes" ? (
                  /* Specialized YES / NO Box Selection Controls */
                  <div className="space-y-2.5 animate-fade-in">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A9488]">
                      Please choose an option to continue:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* YES Box */}
                      <button
                        type="button"
                        onClick={() =>
                          handleSelectOption(
                            INTAKE_STEPS[currentStepIndex],
                            "YES - Please send available homes with low/no down payment options"
                          )
                        }
                        className="p-4 rounded-2xl border-2 border-emerald-600/40 bg-emerald-50/60 hover:bg-emerald-100 hover:border-emerald-600 transition-all text-left group shadow-xs cursor-pointer flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-extrabold text-emerald-800 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            YES
                          </span>
                          <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                        <p className="text-[11px] text-emerald-900/80 mt-1.5 font-medium leading-snug">
                          Send curated homes in my target areas with low or 0% down financing
                          options
                        </p>
                      </button>

                      {/* NO Box */}
                      <button
                        type="button"
                        onClick={() =>
                          handleSelectOption(
                            INTAKE_STEPS[currentStepIndex],
                            "NO - Just send my Prequalification Blueprint"
                          )
                        }
                        className="p-4 rounded-2xl border-2 border-[#EAE7E0] bg-white hover:bg-[#F1EFE9] hover:border-[#9A9488] transition-all text-left group shadow-xs cursor-pointer flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-[#606C5D] flex items-center gap-1.5">
                            <X className="w-4 h-4 text-[#9A9488]" />
                            NO
                          </span>
                          <ChevronRight className="w-4 h-4 text-[#9A9488] group-hover:translate-x-1 transition-transform" />
                        </div>
                        <p className="text-[11px] text-[#606C5D] mt-1.5 font-medium leading-snug">
                          No thank you, just send my customized Prequalification Blueprint for now
                        </p>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Standard Option Buttons for other intake steps */
                  <>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A9488]">
                      Select an option or type below:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {INTAKE_STEPS[currentStepIndex].options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() =>
                            handleSelectOption(INTAKE_STEPS[currentStepIndex], opt.value)
                          }
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
                  </>
                )}
              </div>
            )}

            {/* Step 6: Lead Contact Info Submission Form */}
            {!isCompleted && currentStepIndex >= INTAKE_STEPS.length && (
              <div className="bg-white rounded-2xl border border-[#EAE7E0] p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#4A5D4E]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>
                    {initialIntent === "chat_listings"
                      ? "Where should we send your curated list of low/no down payment homes?"
                      : initialIntent === "blueprint_download"
                        ? "Where should we deliver your completed Blueprint?"
                        : "Where should we deliver your Prequalification Blueprint?"}
                  </span>
                </div>

                <form onSubmit={handleSubmitLead} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#606C5D] mb-1">
                      Your Full Name *
                    </label>
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
                      <label className="block text-[11px] font-semibold text-[#606C5D] mb-1">
                        Email Address *
                      </label>
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
                      <label className="block text-[11px] font-semibold text-[#606C5D] mb-1">
                        Phone Number *
                      </label>
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

                  {/* TCPA SMS Authorization Consent Question */}
                  <div className="bg-[#FAF9F5] p-3 rounded-xl border border-[#EAE7E0] space-y-1.5">
                    <label className="flex items-start gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={contactForm.smsConsentAuthorized}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, smsConsentAuthorized: e.target.checked })
                        }
                        className="mt-0.5 rounded border-[#9A9488] text-[#4A5D4E] focus:ring-[#4A5D4E]"
                      />
                      <span className="text-[11px] text-[#2D362E] font-semibold leading-tight">
                        I authorize {loanOfficer.name} & partner team to send text messages (SMS)
                        regarding rate alerts, DPA grants, and low/no down home listings.
                      </span>
                    </label>
                    <p className="text-[10px] text-[#9A9488] pl-5">
                      Message and data rates may apply. Reply STOP anytime to opt out. View our{" "}
                      <a
                        href="/privacy-policy.html"
                        target="_blank"
                        rel="noreferrer"
                        className="underline text-[#4A5D4E] hover:text-[#2D362E]"
                      >
                        Privacy Policy &amp; Terms
                      </a>
                      .
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#606C5D] mb-1">
                        Preferred Time to Chat
                      </label>
                      <select
                        value={contactForm.preferredContactTime}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, preferredContactTime: e.target.value })
                        }
                        className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
                      >
                        <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                        <option value="Afternoon (12 PM - 5 PM)">Afternoon (12 PM - 5 PM)</option>
                        <option value="Weekday Evenings">Weekday Evenings</option>
                        <option value="Saturday Morning">Saturday Morning</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-[#606C5D] mb-1">
                        Home Type
                      </label>
                      <select
                        value={contactForm.propertyType}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, propertyType: e.target.value })
                        }
                        className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs text-[#2D362E] focus:outline-none focus:border-[#4A5D4E]"
                      >
                        <option value="Single Family Home">Single Family Home</option>
                        <option value="Townhome / Condo">Townhome / Condo</option>
                        <option value="Multi-Family (House Hacking)">
                          Multi-Family (House Hacking)
                        </option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#606C5D] mb-1">
                      Additional Notes or Special Requests{" "}
                      <span className="text-[#9A9488] font-normal">(Optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g., Looking for homes near top-rated school districts, interested in VA loan options, etc."
                      value={contactForm.notes}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (containsSSN(val)) {
                          setInputError(
                            "⚠️ SSNs are blocked for your privacy. Please do not enter sensitive identifiers."
                          );
                        } else if (inputError) {
                          setInputError("");
                        }
                        setContactForm({ ...contactForm, notes: val });
                      }}
                      className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs text-[#2D362E] focus:outline-none focus:border-[#4A5D4E] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#4A5D4E] hover:bg-[#38463B] text-white font-bold rounded-xl text-xs shadow-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <Award className="w-4 h-4 text-[#E7C19D]" />
                    <span>Generate & Send My Prequalification Blueprint</span>
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
                    <span className="font-bold text-[#4A5D4E]">
                      {leadState.targetPriceRange || "$425,000"}
                    </span>
                  </div>
                  {leadState.annualIncome && (
                    <div className="flex justify-between items-center pb-2 border-b border-[#EAE7E0]">
                      <span className="text-[#606C5D]">Annual Income:</span>
                      <span className="font-bold text-[#2D362E]">{leadState.annualIncome}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pb-2 border-b border-[#EAE7E0]">
                    <span className="text-[#606C5D]">Timeline:</span>
                    <span className="font-semibold text-[#2D362E]">{leadState.timeline}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-[#EAE7E0]">
                    <span className="text-[#606C5D]">Eligible Loan Programs:</span>
                    <span className="text-emerald-700 font-semibold">
                      Conventional 97, FHA 3.5%, State DPA
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#606C5D]">Low/No Down Homes:</span>
                    <span
                      className={`font-semibold ${leadState.sendSampleHomes ? "text-emerald-700" : "text-[#606C5D]"}`}
                    >
                      {leadState.sendSampleHomes
                        ? "✓ Curated Listings Requested"
                        : "Blueprint Only"}
                    </span>
                  </div>
                  {contactForm.notes && (
                    <div className="pt-2 border-t border-[#EAE7E0]">
                      <span className="text-[#606C5D] block mb-0.5 font-semibold text-[11px]">
                        Your Notes / Special Requests:
                      </span>
                      <p className="text-[#2D362E] font-medium italic text-[11px] bg-[#FAF9F5] p-2 rounded-lg border border-[#EAE7E0]">
                        "{contactForm.notes}"
                      </p>
                    </div>
                  )}
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

            <div ref={chatBottomRef} className="h-1 shrink-0" />
          </div>

          {/* Chat Input Bar & Security Notice */}
          
          {/* Quick Replies for Ask AI */}
          {isCompleted && (
             <div className="px-3 pt-3 flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-1">
                 <button onClick={() => { setInputText("Should I continue renting or buy now?"); handleSendMessage(); }} className="shrink-0 px-2.5 py-1 bg-[#FAF9F5] border border-[#EAE7E0] rounded-full text-[10px] font-bold text-[#4A5D4E] hover:bg-[#F1EFE9] transition-colors shadow-sm whitespace-nowrap">⚖️ Rent vs. Buy Analysis</button>
                 <button onClick={() => { setInputText("What are today's mortgage interest rates?"); handleSendMessage(); }} className="shrink-0 px-2.5 py-1 bg-[#FAF9F5] border border-[#EAE7E0] rounded-full text-[10px] font-bold text-[#4A5D4E] hover:bg-[#F1EFE9] transition-colors shadow-sm whitespace-nowrap">📈 Current Rates</button>
                 <button onClick={() => { setInputText("How much down payment do I actually need?"); handleSendMessage(); }} className="shrink-0 px-2.5 py-1 bg-[#FAF9F5] border border-[#EAE7E0] rounded-full text-[10px] font-bold text-[#4A5D4E] hover:bg-[#F1EFE9] transition-colors shadow-sm whitespace-nowrap">💰 Down Payment Helper</button>
                 <button onClick={() => { setInputText("Can you estimate closing costs on a $400k home?"); handleSendMessage(); }} className="shrink-0 px-2.5 py-1 bg-[#FAF9F5] border border-[#EAE7E0] rounded-full text-[10px] font-bold text-[#4A5D4E] hover:bg-[#F1EFE9] transition-colors shadow-sm whitespace-nowrap">📝 Estimate Closing Costs</button>
             </div>
          )}
          <div className="p-3 bg-white border-t border-[#EAE7E0] space-y-1.5 shrink-0">

            {inputError && (
              <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-800 px-3 py-1.5 rounded-xl text-[11px] font-semibold animate-shake">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>{inputError}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={
                  isCompleted
                    ? "Ask a question about rates, DPA options, or closing..."
                    : "Type your question or reply..."
                }
                value={inputText}
                onChange={(e) => {
                  const val = e.target.value;
                  if (containsSSN(val)) {
                    setInputError(
                      "⚠️ SSNs are blocked for your privacy. No SSN or Credit Card required."
                    );
                  } else if (inputError) {
                    setInputError("");
                  }
                  setInputText(val);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                disabled={isSubmittingQuery}
                className={`flex-1 bg-[#FAF9F5] border rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#2D362E] placeholder-[#9A9488] focus:outline-none transition-colors ${
                  inputError
                    ? "border-rose-400 bg-rose-50/30 focus:border-rose-500"
                    : "border-[#EAE7E0] focus:border-[#4A5D4E]"
                }`}
              />
              {speechSupported && (
                <button
                  onClick={toggleListening}
                  title={isListening ? "Stop listening" : "Speak to answer"}
                  className={`p-2.5 rounded-xl transition-all shadow-sm shrink-0 flex items-center justify-center cursor-pointer ${
                    isListening
                      ? "bg-rose-100 text-rose-600 animate-pulse border border-rose-200"
                      : "bg-[#FAF9F5] text-[#606C5D] border border-[#EAE7E0] hover:bg-[#EAE7E0]"
                  }`}
                >
                  {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>
              )}
              <button
                onClick={() => handleSendMessage()}
                disabled={isSubmittingQuery || !inputText.trim() || isListening}
                className="p-2.5 rounded-xl bg-[#4A5D4E] hover:bg-[#38463B] text-white disabled:opacity-40 transition-all shadow-sm shrink-0 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                title="Send message"
              >
                {isSubmittingQuery ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#9A9488] px-1 pt-0.5">
              <span className="flex items-center gap-1">
                <Lock className="w-2.5 h-2.5 text-emerald-600" />
                <span>No SSN Required</span>
              </span>
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold border ${
                  aiProvider === "deepseek"
                    ? "bg-[#4A5D4E]/10 text-[#4A5D4E] border-[#4A5D4E]/20"
                    : aiProvider === "gemini"
                      ? "bg-[#C18C5D]/10 text-[#C18C5D] border-[#C18C5D]/20"
                      : "bg-gray-100 text-gray-500 border-gray-200"
                }`}
              >
                <Bot className="w-2.5 h-2.5" />
                AI Engine:{" "}
                {aiProvider === "deepseek"
                  ? "DeepSeek"
                  : aiProvider === "gemini"
                    ? "Gemini"
                    : "Simulated"}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
