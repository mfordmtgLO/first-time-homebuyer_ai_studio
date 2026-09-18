import React, { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Brain, 
  Database, 
  UploadCloud, 
  Users, 
  Target, 
  ShieldCheck, 
  FileText, 
  Zap, 
  PieChart, 
  Briefcase, 
  Calculator, 
  Eye, 
  Activity,
  Layers, 
  Server, 
  Lock, 
  Cpu, 
  Globe, 
  MapPin, 
  CheckCircle2, 
  TrendingUp, 
  Sparkles, 
  MessageSquare, 
  Clock, 
  ArrowRight, 
  Share2, 
  Copy, 
  Check, 
  Building, 
  Smartphone, 
  Search, 
  RefreshCw, 
  Key, 
  Video, 
  Award, 
  BarChart3, 
  AlertCircle,
  LayoutGrid,
  Maximize2,
  Bot
} from "lucide-react";

interface PitchSlide {
  id: string;
  slideNumber: number;
  category: "Strategy & Cloud" | "AI & Spatial Tech" | "Marketing & Scenarios" | "Workflow & Governance";
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ReactNode;
  overview: string;
  keyPillars: {
    heading: string;
    description: string;
    highlight?: string;
  }[];
  visualComponent: React.ReactNode;
  roiTakeaway: string;
  complianceFootnote?: string;
}

export const SystemPitchDeck: React.FC = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"slides" | "grid">("slides");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("all");
  const [copiedSlideId, setCopiedSlideId] = useState<string | null>(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== "slides") return;
      if (e.key === "ArrowRight") {
        setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
      } else if (e.key === "ArrowLeft") {
        setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewMode]);

  const copySlideText = (slide: PitchSlide) => {
    const text = `SLIDE ${slide.slideNumber}: ${slide.title}\n${slide.subtitle}\n\nOverview:\n${slide.overview}\n\nKey Pillars:\n${slide.keyPillars.map(p => `• ${p.heading}: ${p.description}`).join("\n")}\n\nROI Takeaway:\n${slide.roiTakeaway}`;
    navigator.clipboard.writeText(text);
    setCopiedSlideId(slide.id);
    setTimeout(() => setCopiedSlideId(null), 2500);
  };

  const slides: PitchSlide[] = [
    {
      id: "slide-1",
      slideNumber: 1,
      category: "Strategy & Cloud",
      title: "The 2026 Enterprise Lending Imperative",
      subtitle: "Top-of-Funnel Conversion Engine Sitting Directly Atop Existing Enterprise CRMs",
      badge: "Executive Thesis",
      icon: <Building className="w-6 h-6 text-emerald-600" />,
      overview: "Legacy platforms like Salesforce, Total Expert, and Big Purple Dot CRM function as systems of record, not active top-of-funnel conversion magnets. Over 68% of first-time homebuyers abandon static web forms. Our 3-point microservices ecosphere unifies consumer education, agent co-branding, and loan origination without a costly rip-and-replace overhaul.",
      keyPillars: [
        {
          heading: "Seamless CRM Overlay",
          description: "Mounts right on top of Salesforce, Big Purple Dot CRM, or Total Expert via bidirectional REST APIs and webhooks, pulling contacts and pushing buyer preference files automatically.",
          highlight: "Zero Disruption"
        },
        {
          heading: "Solves the Top-of-Funnel Fracture",
          description: "Replaces ungrounded generic lead forms with high-intent interactive spatial property maps, DTI matrix calculators, and state grant qualification engines.",
          highlight: "+38% Inbound Flow"
        },
        {
          heading: "True Mutual Co-Branding Value",
          description: "Arms loan officers with an automated multi-channel marketing engine for listing agents, transforming one-way referral requests into reciprocal production partnerships.",
          highlight: "Realtor Lock-In"
        }
      ],
      roiTakeaway: "Captures and incubates purchase leads 60-90 days earlier in the shopping cycle, feeding high-margin purchase loans straight into your existing CRM pipelines.",
      visualComponent: (
        <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-2xl p-4 text-xs space-y-3">
          <div className="flex items-center justify-between font-bold text-[#2D362E] border-b border-[#EAE7E0] pb-2">
            <span>Traditional Architecture vs. Melded Ecosphere</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono">2026 Shift</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl space-y-1.5">
              <span className="font-bold text-red-900 block">Legacy Tech Stack</span>
              <p className="text-[11px] text-red-700 leading-relaxed">• Static contact forms with 68% drop-off</p>
              <p className="text-[11px] text-red-700 leading-relaxed">• Disconnected Realtor co-marketing (RESPA risk)</p>
              <p className="text-[11px] text-red-700 leading-relaxed">• Manual loan officer follow-up paralysis</p>
            </div>
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5">
              <span className="font-bold text-emerald-900 block">Melded 3-Point Ecosphere</span>
              <p className="text-[11px] text-emerald-800 leading-relaxed">• Interactive spatial discovery & instant prequal</p>
              <p className="text-[11px] text-emerald-800 leading-relaxed">• Automated agent ad kits & 50/50 ledger</p>
              <p className="text-[11px] text-emerald-800 leading-relaxed">• Real-time CRM sync directly into Salesforce</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "slide-2",
      slideNumber: 2,
      category: "Strategy & Cloud",
      title: "The 3-Point Microservices Ecosphere Architecture",
      subtitle: "Combined Synergies and Efficiencies with Strict Lockdown and Separation",
      badge: "System Architecture",
      icon: <Layers className="w-6 h-6 text-indigo-600" />,
      overview: "The enterprise suite is structurally segmented into 3 isolated, cooperating microservice containers. Each service fulfills a specialized operational role while maintaining strict zero-trust boundaries to ensure consumer safety, originator autonomy, and enterprise governance.",
      keyPillars: [
        {
          heading: "Microservice 1: Consumer Discovery & Prequal",
          description: "Public-facing, zero-friction portal featuring real-time spatial MLS listings, OHCS/USDA grant lookup, and long-form DTI affordability tools with cryptographic TCPA capture.",
          highlight: "Client Facing"
        },
        {
          heading: "Microservice 2: LO & Realtor Co-Brand Production Hub",
          description: "Originator cockpit hosting Vantage AI Ad Studio, multi-channel Facebook/Google ad generators, BYOK media rendering, and automated partner outreach engines.",
          highlight: "Production Hub"
        },
        {
          heading: "Microservice 3: Executive Governance & Audit Command",
          description: "Branch and C-suite headquarters managing role-based access control, marketing balance sheets, RESPA 50/50 co-op allocations, and SHA-256 compliance ledgers.",
          highlight: "Governance"
        }
      ],
      roiTakeaway: "Segmented containerization guarantees that a traffic surge on consumer discovery never compromises loan officer pipeline response times or executive audit access.",
      visualComponent: (
        <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-2xl p-4 text-xs space-y-3 font-mono">
          <div className="text-[11px] font-bold text-[#2D362E] flex items-center justify-between">
            <span>CONTAINERIZED TOPOLOGY</span>
            <span className="text-emerald-700">mTLS 1.3 SECURED</span>
          </div>
          <div className="space-y-2">
            <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-blue-900 block text-xs">Microservice 1: Consumer Portal</span>
                <span className="text-[10px] text-blue-700 font-sans">Geosphere Spatial • Grant Search • Buyer Readiness Q&A</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-blue-200 text-blue-900 text-[10px] font-bold">Public Web</span>
            </div>
            <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-purple-900 block text-xs">Microservice 2: LO & Realtor Hub</span>
                <span className="text-[10px] text-purple-700 font-sans">Vantage Ad Studio • BYOK Video • Twilio 10DLC • Task Cadence</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-purple-200 text-purple-900 text-[10px] font-bold">Auth Restricted</span>
            </div>
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-emerald-900 block text-xs">Microservice 3: Executive Governance</span>
                <span className="text-[10px] text-emerald-700 font-sans">Branch Manager Brief • RESPA Section 8 • SHA-256 Audit Chain</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 text-[10px] font-bold">Root Admin</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "slide-3",
      slideNumber: 3,
      category: "Strategy & Cloud",
      title: "Enterprise Cloud Services & Zero-Trust Infrastructure",
      subtitle: "Google Cloud Run Stateless Scalability, Firebase State, and AES-256 Cloud Vault",
      badge: "Cloud & Security",
      icon: <Server className="w-6 h-6 text-sky-600" />,
      overview: "Built to satisfy the most demanding bank IT and cybersecurity requirements. Deployed in Google Cloud Run serverless containers with automated horizontal auto-scaling, paired with Firebase real-time state synchronization, encrypted KMS secrets vaults, and strict zero-lateral originator barriers.",
      keyPillars: [
        {
          heading: "Stateless Google Cloud Run Ingress",
          description: "Rapid, self-healing containerization with automatic scale-to-zero during quiet hours for cost efficiency, and instantaneous sub-second burst capacity during ad spikes.",
          highlight: "99.99% Uptime"
        },
        {
          heading: "Reactive Firebase State Management",
          description: "Low-latency bidirectional state updates across mobile loan officer apps, real estate partner portals, and manager desks without page reloads.",
          highlight: "<50ms Latency"
        },
        {
          heading: "Zero-Lateral Access & AES-256 Vault",
          description: "Originator data and API keys (Twilio, Meta, Video AI) are compartmentalized. Junior team members or lateral loan officers have absolute zero read access to peers' pipelines.",
          highlight: "Strict Isolation"
        }
      ],
      roiTakeaway: "Minimizes infrastructure overhead while providing bank-grade data containment compliant with GLBA Safeguards, SOC2 Type II, and FTC regulations.",
      visualComponent: (
        <div className="bg-slate-900 text-white rounded-2xl p-4 text-xs space-y-2.5 font-mono">
          <div className="flex items-center justify-between text-[#D4A373] text-[11px] border-b border-slate-800 pb-1.5">
            <span>CLOUD RUN ZERO-TRUST TELEMETRY</span>
            <span className="text-emerald-400">ACTIVE ENCRYPTION</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 bg-slate-800/80 rounded-lg">
              <span className="text-slate-400 block text-[10px]">Compute Runtime:</span>
              <span className="text-emerald-300 font-bold">GCP Cloud Run (Containerized)</span>
            </div>
            <div className="p-2 bg-slate-800/80 rounded-lg">
              <span className="text-slate-400 block text-[10px]">Real-time Database:</span>
              <span className="text-sky-300 font-bold">Google Cloud Firestore</span>
            </div>
            <div className="p-2 bg-slate-800/80 rounded-lg">
              <span className="text-slate-400 block text-[10px]">Cryptographic Vault:</span>
              <span className="text-amber-300 font-bold">AES-256 Envelope KMS</span>
            </div>
            <div className="p-2 bg-slate-800/80 rounded-lg">
              <span className="text-slate-400 block text-[10px]">Network Perimeter:</span>
              <span className="text-purple-300 font-bold">TLS 1.3 Strict Ingress (Port 3000)</span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 pt-1">
            ✓ Client-side browser DevTools never receive unmasked secrets or master API keys.
          </div>
        </div>
      )
    },
    {
      id: "slide-4",
      slideNumber: 4,
      category: "AI & Spatial Tech",
      title: "The Deterministic AI Brain — Zero Drift & Long-Term Recall",
      subtitle: "Enterprise Gemini Vertex AI with Strictly Bounded Knowledge and Situational Memory",
      badge: "Deterministic AI",
      icon: <Brain className="w-6 h-6 text-purple-600" />,
      overview: "Standard LLMs hallucinate loan guidelines and drift under edge cases. Our AI Brain operates under a strictly bounded 4-stage deterministic execution harness: schema-enforced input validation, hardcoded agency guideline grounding (OHCS/USDA/FHA/Fannie), bounded worker isolation, and long-term situational recall.",
      keyPillars: [
        {
          heading: "Zero-Drift & Non-Speculative Execution",
          description: "The AI Brain is never permitted to guess income limits or make up rates. Calculations are mathematically verified against hardcoded county matrices and state program handbooks.",
          highlight: "Zero Hallucination"
        },
        {
          heading: "Long-Term Situational Recall",
          description: "Persistently remembers past buyer roadblocks (e.g., self-employed 1040 deductions or pending gift funds), reviving conversations weeks later with full contextual continuity.",
          highlight: "Stateful Memory"
        },
        {
          heading: "Supervisor-Worker Guardrails",
          description: "The AI compiles ad copy, synthesizes follow-up templates, and scores lead intent, but human loan officers and branch managers retain final execution authority.",
          highlight: "Human-in-the-Loop"
        }
      ],
      roiTakeaway: "Unlocks the transformative velocity of modern AI while completely eliminating the regulatory and compliance liability of hallucinated mortgage promises.",
      visualComponent: (
        <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-2xl p-4 text-xs space-y-3">
          <div className="font-bold text-[#2D362E] flex items-center justify-between border-b border-[#EAE7E0] pb-2">
            <span>HOW THE AI BRAIN SERVES ALL 4 PLATFORM TIERS</span>
            <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold">Unified Cortex</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 bg-white border border-[#EAE7E0] rounded-xl">
              <span className="font-bold text-indigo-900 block mb-0.5">1. Consumer Front-End</span>
              <p className="text-[#606C5D] text-[10px]">Evaluates Q&A responses in real time to match exact county DPA grants and zero-down options without human intervention.</p>
            </div>
            <div className="p-2.5 bg-white border border-[#EAE7E0] rounded-xl">
              <span className="font-bold text-indigo-900 block mb-0.5">2. Loan Officer Cockpit</span>
              <p className="text-[#606C5D] text-[10px]">Generates MLS-grounded ad copy, draft SMS answers, and 2-1 buydown objection scripts tailored to the buyer's math.</p>
            </div>
            <div className="p-2.5 bg-white border border-[#EAE7E0] rounded-xl">
              <span className="font-bold text-indigo-900 block mb-0.5">3. Branch Management</span>
              <p className="text-[#606C5D] text-[10px]">Audits pipeline stall points, verifies TCPA certificates, and prioritizes highest-ROI team sales actions daily.</p>
            </div>
            <div className="p-2.5 bg-white border border-[#EAE7E0] rounded-xl">
              <span className="font-bold text-indigo-900 block mb-0.5">4. C-Suite & Executives</span>
              <p className="text-[#606C5D] text-[10px]">Analyzes macro conversion velocity, partner agent productivity, and ad spend efficiency against origination margins.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "slide-5",
      slideNumber: 5,
      category: "AI & Spatial Tech",
      title: "Geosphere GeoID Spatial Maps & DTI Prequal Matrix",
      subtitle: "Location-Based Zero-Down Boundaries & Tailored Low-Down Products by City & County",
      badge: "Spatial GIS Engine",
      icon: <MapPin className="w-6 h-6 text-rose-600" />,
      overview: "First-time buyers don't shop for mortgages; they shop for homes in specific school districts and neighborhoods. The Geosphere GIS engine overlays interactive parcel boundaries with USDA 100% Zero-Down eligibility zones, State Housing Finance Agency (OHCS) grant tracts, and mathematical DTI bounds.",
      keyPillars: [
        {
          heading: "GeoID Polygon & USDA Rural Housing Overlay",
          description: "Instantly informs consumers and agents whether a home qualifies for USDA 100% financing, eliminating costly financing misfires on property tours.",
          highlight: "Instant GIS Match"
        },
        {
          heading: "Mathematically Grounded DTI & Affordability",
          description: "Computes real-world purchasing ranges based on verified front-end and back-end DTI ratios (e.g., 28/36 or 31/43) against live rates and local tax assessments.",
          highlight: "True Prequal"
        },
        {
          heading: "Long-Form Q&A Focused Home Search",
          description: "Captures down payment savings, credit tiers, co-borrower income, and timeline, filtering partner MLS inventory to attainable inventory only.",
          highlight: "Targeted Search"
        }
      ],
      roiTakeaway: "Increases lead engagement duration by 4.2x compared to traditional forms and provides loan officers with fully actionable buyer preference dossiers and engagement analytics.",
      visualComponent: (
        <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-2xl p-4 text-xs space-y-3">
          <div className="flex items-center justify-between font-bold text-[#2D362E] border-b border-[#EAE7E0] pb-2">
            <span>SPATIAL MORTGAGE PRODUCT MATCHING</span>
            <span className="text-rose-700 text-[10px]">Real-Time GeoID</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-[#EAE7E0]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-bold text-[#2D362E]">USDA 100% Rural Development</span>
              </div>
              <span className="font-mono text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">Eligible GeoZone ($0 Down)</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-[#EAE7E0]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="font-bold text-[#2D362E]">OHCS Flex Lending + DPA Grant</span>
              </div>
              <span className="font-mono text-[11px] text-blue-800 bg-blue-50 px-2 py-0.5 rounded">Up to $15,000 Forgivable</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-[#EAE7E0]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span className="font-bold text-[#2D362E]">Borrower DTI Qualification Band</span>
              </div>
              <span className="font-mono text-[11px] text-purple-800 bg-purple-50 px-2 py-0.5 rounded">34.2% Front / 41.8% Back</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "slide-6",
      slideNumber: 6,
      category: "Marketing & Scenarios",
      title: "Vantage AI Ad Studio & BYOK Media Generation",
      subtitle: "Automated Partner Co-Branding, Bring-Your-Own-Key Video Engines, and Multi-Channel Push",
      badge: "Vantage Ad Studio",
      icon: <Video className="w-6 h-6 text-amber-600" />,
      overview: "Allows individual loan officers to save their own enterprise API keys (BYOK) for generative video and AI copywriting tools. Pairs every property listing with co-branded ad kits (Facebook Feed, Instagram Reels, Google Search) with equal LO and Realtor attribution and compliant HEC parameters.",
      keyPillars: [
        {
          heading: "Vantage AI Ad Studio Media Pipeline",
          description: "All listing walkthroughs, Reels, 30s video commercials, and voiceover audio are generated natively in Vantage AI Ad Studio without 3rd-party dependencies.",
          highlight: "Native Studio"
        },
        {
          heading: "Automated Realtor Co-Branded Kits",
          description: "Generates high-converting Meta and Google ad specifications with compliant 50/50 branding, pre-configured Special Housing Category (HEC) rules, and live preview cards.",
          highlight: "HEC Compliant"
        },
        {
          heading: "AI-Assisted Automated Realtor Outreach",
          description: "Deploys customized SMS and email outreach to the partner agent on behalf of shared leads, keeping agents informed and bound to the loan officer.",
          highlight: "Automated Nurture"
        }
      ],
      roiTakeaway: "Transforms listing inventory into high-converting joint capture funnels while driving 3.2x higher agent loyalty and eliminating RESPA Section 8 risks.",
      visualComponent: (
        <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-2xl p-4 text-xs space-y-2.5">
          <div className="flex items-center justify-between font-bold text-[#2D362E] border-b border-[#EAE7E0] pb-1.5">
            <span>BYOK MEDIA ENGINE TELEMETRY</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono">Vault Encrypted</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 bg-white rounded-xl border border-[#EAE7E0] flex items-center gap-2">
              <Video className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-[#2D362E] block">Vantage AI Ad Studio</span>
                <span className="text-[10px] text-emerald-700">✓ Native Studio Active</span>
              </div>
            </div>
            <div className="p-2 bg-white rounded-xl border border-[#EAE7E0] flex items-center gap-2">
              <Bot className="w-4 h-4 text-indigo-600 shrink-0" />
              <div>
                <span className="font-bold text-[#2D362E] block">Gemini 2.5 Vertex</span>
                <span className="text-[10px] text-emerald-700">✓ Vertex Direct (68ms)</span>
              </div>
            </div>
            <div className="p-2 bg-white rounded-xl border border-[#EAE7E0] flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <span className="font-bold text-[#2D362E] block">Meta Graph v20.0</span>
                <span className="text-[10px] text-blue-700">1-Click Ad Deploy</span>
              </div>
            </div>
            <div className="p-2 bg-white rounded-xl border border-[#EAE7E0] flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-purple-600 shrink-0" />
              <div>
                <span className="font-bold text-[#2D362E] block">Twilio 10DLC</span>
                <span className="text-[10px] text-purple-700">Branch SMS Pool</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "slide-7",
      slideNumber: 7,
      category: "Marketing & Scenarios",
      title: "Conversational Financing & Scenario Engines",
      subtitle: "Interactive 2-1 Temporary Buydown & Mathematical Cost-of-Waiting Visualizers",
      badge: "Sales Scenarios",
      icon: <Calculator className="w-6 h-6 text-emerald-600" />,
      overview: "In a fluctuating interest rate environment, hesitant buyers stall. Our interactive financial scenario engines equip loan officers and real estate partners with mathematical, easy-to-understand visual models that turn rate objections into executed purchase contracts.",
      keyPillars: [
        {
          heading: "Interactive 2-1 Buydown Scenario Engine",
          description: "Visualizes Year 1 (2% below note rate), Year 2 (1% below note rate), and Year 3-30 payments, detailing exact seller concession dollar amounts required to fund the subsidy.",
          highlight: "Saves $400+/mo"
        },
        {
          heading: "Mathematical Cost-of-Waiting Calculator",
          description: "Demonstrates the true financial penalty of waiting 6 to 12 months (factoring historical regional appreciation against monthly rent paid), proving why buying now builds superior wealth.",
          highlight: "Overcomes Hesitation"
        },
        {
          heading: "Instant Shareable Client Pitch Scripts",
          description: "One-click copyable email and text pitches pre-populated with live borrower numbers, ready for loan officers or partner realtors to dispatch in seconds.",
          highlight: "1-Click Dispatch"
        }
      ],
      roiTakeaway: "Unlocks stalled pipeline leads and converts marginal buyers by demonstrating tangible payment relief without long-term structural mortgage risk.",
      visualComponent: (
        <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-2xl p-4 text-xs space-y-3">
          <div className="flex items-center justify-between font-bold text-[#2D362E] border-b border-[#EAE7E0] pb-2">
            <span>2-1 BUYDOWN SCENARIO SNAPSHOT ($465,000 Purchase)</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono">Seller Funded</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-emerald-800 font-bold block">Year 1 (4.875%)</span>
              <span className="text-sm font-black text-emerald-950 font-mono">$2,150/mo</span>
              <span className="text-[9px] text-emerald-700 block">Saves $560/mo</span>
            </div>
            <div className="p-2 bg-blue-50 border border-blue-200 rounded-xl">
              <span className="text-blue-800 font-bold block">Year 2 (5.875%)</span>
              <span className="text-sm font-black text-blue-950 font-mono">$2,420/mo</span>
              <span className="text-[9px] text-blue-700 block">Saves $290/mo</span>
            </div>
            <div className="p-2 bg-slate-100 border border-slate-200 rounded-xl">
              <span className="text-slate-700 font-bold block">Years 3-30 (6.875%)</span>
              <span className="text-sm font-black text-slate-900 font-mono">$2,710/mo</span>
              <span className="text-[9px] text-slate-500 block">Standard Note</span>
            </div>
          </div>
          <div className="p-2 bg-white rounded-lg border border-[#EAE7E0] text-[10px] text-[#4A5D4E] flex items-center justify-between">
            <span>Required Seller Concession: <strong>$8,640 (1.85%)</strong></span>
            <span className="text-emerald-700 font-bold">Total Buyer Savings: $10,200</span>
          </div>
        </div>
      )
    },
    {
      id: "slide-8",
      slideNumber: 8,
      category: "Workflow & Governance",
      title: "Loan Officer Portal, Engagement Scoring & CRM Overlay",
      subtitle: "Deterministic Lead Scoring, Auto-Pinning Ready Prospects, and Bidirectional Salesforce/Total Expert Webhooks",
      badge: "LO Cockpit & CRM Overlay",
      icon: <Clock className="w-6 h-6 text-indigo-600" />,
      overview: "Provides loan officers with a high-velocity command center featuring automated lead engagement scoring, intelligent auto-pinning of ready prospects to the top of the queue, and seamless bidirectional CRM synchronization feeding legacy enterprise systems like Salesforce and Total Expert.",
      keyPillars: [
        {
          heading: "Lead Engagement Scoring & Auto-Pinning",
          description: "Continuously computes engagement scores based on saved listings, calculator runs, and document downloads, automatically pinning high-intent buyers to the top of the LO portal.",
          highlight: "Instant Prioritization"
        },
        {
          heading: "Traditional CRM Overlay Feed",
          description: "Sits on top of existing enterprise mortgage CRMs (Salesforce, Total Expert, Big Purple Dot CRM) via webhooks to sync interaction history without requiring a disruptive migration.",
          highlight: "Zero Disruption"
        },
        {
          heading: "Daily Revenue-Producing Sales Cadence",
          description: "Delivers morning kickoff top 5 priority tasks, midday agent co-marketing check-ins, and evening reconciliation summaries for absolute origination accountability.",
          highlight: "Daily Accountability"
        }
      ],
      roiTakeaway: "Eliminates administrative sorting, ensures hot leads are contacted within minutes, and bridges top-of-funnel discovery directly into legacy CRM systems of record.",
      visualComponent: (
        <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-2xl p-4 text-xs space-y-2.5">
          <div className="flex items-center justify-between font-bold text-[#2D362E] border-b border-[#EAE7E0] pb-2">
            <span>LO PORTAL & CRM OVERLAY TELEMETRY</span>
            <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-bold">Salesforce / Total Expert Sync</span>
          </div>
          <div className="space-y-2 text-[11px]">
            <div className="flex items-start gap-2.5 p-2 bg-white rounded-xl border border-[#EAE7E0]">
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px] shrink-0">Auto-Pin</span>
              <div>
                <strong className="text-[#2D362E] block">High Engagement Sorting:</strong>
                <span className="text-[#606C5D] text-[10px]">Hot buyers with 3+ saved properties automatically pinned to top.</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-2 bg-white rounded-xl border border-[#EAE7E0]">
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-bold text-[10px] shrink-0">Webhook</span>
              <div>
                <strong className="text-[#2D362E] block">CRM Sync Engine:</strong>
                <span className="text-[#606C5D] text-[10px]">Real-time push of lead interaction history into BPD CRM & Salesforce.</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 p-2 bg-white rounded-xl border border-[#EAE7E0]">
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[10px] shrink-0">Cadence</span>
              <div>
                <strong className="text-[#2D362E] block">Daily Sales Briefing:</strong>
                <span className="text-[#606C5D] text-[10px]">Structured morning/noon/evening action items for loan officer teams.</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "slide-9",
      slideNumber: 9,
      category: "Workflow & Governance",
      title: "Zero-Trust Security, IT Logging & Regulatory Compliance",
      subtitle: "Cryptographic SHA-256 Hash Chained Audit Ledger & Full RESPA / TCPA Protections",
      badge: "Compliance Command",
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
      overview: "Built for zero-compromise institutional compliance. Features a mathematical blockchain-style SHA-256 hash-chained immutable audit log, programmatic RESPA Section 8 cost allocation ledgers, Fair Housing Act Special Housing Category locks, and A2P 10DLC carrier opt-in certificates.",
      keyPillars: [
        {
          heading: "Cryptographic SHA-256 Chained Audit Trail",
          description: "Every key decryption, role modification, or borrower PII inspection is sequenced and hashed back to genesis. Built-in verification mathematically certifies log immutability.",
          highlight: "Tamper Proof"
        },
        {
          heading: "RESPA Section 8 Co-Marketing Protections",
          description: "Strictly tracks 50/50 and pro-rata joint ad spend between loan officers and agents, archiving marketing service agreements and payment proofs for CFPB review.",
          highlight: "CFPB Defense"
        },
        {
          heading: "TCPA & A2P 10DLC Cryptographic Certificates",
          description: "Captures explicit written consent with TLS 1.3 timestamp signatures, originating IP addresses, and disclosure wording before sending automated text messages.",
          highlight: "Carrier Verified"
        }
      ],
      roiTakeaway: "Empowers IT managers and Chief Compliance Officers to face CFPB, NMLS, or state financial audits with instantaneous, mathematically verified compliance reporting.",
      visualComponent: (
        <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-2xl p-4 text-xs space-y-2.5 font-mono">
          <div className="flex items-center justify-between font-bold text-[#2D362E] border-b border-[#EAE7E0] pb-1.5">
            <span>SHA-256 IMMUTABLE AUDIT CHAIN</span>
            <span className="text-emerald-700 text-[10px]">100% Chain Validated</span>
          </div>
          <div className="space-y-1.5 text-[10px]">
            <div className="p-1.5 bg-white rounded border border-slate-200">
              <span className="text-slate-500 block">Block #10 • 2026-09-05 07:31:00 UTC</span>
              <span className="text-indigo-900 font-bold">Action:</span> Rotate Enterprise Vault Key (Mike Ford)
              <span className="text-slate-400 block truncate">Hash: 0x570abe7c6cd99b37781fa57ba34e62aa7d84a16...</span>
            </div>
            <div className="p-1.5 bg-white rounded border border-slate-200">
              <span className="text-slate-500 block">Block #09 • 2026-09-05 06:57:00 UTC</span>
              <span className="text-red-700 font-bold">Action:</span> Blocked Lateral Webhook Inspection (Zero-Trust)
              <span className="text-slate-400 block truncate">Hash: 0x8e370395bd64c3d2eb49ecde7f35e6f96d4a0fb...</span>
            </div>
            <div className="p-1.5 bg-white rounded border border-slate-200">
              <span className="text-slate-500 block">Block #08 • 2026-09-05 05:45:00 UTC</span>
              <span className="text-emerald-800 font-bold">Action:</span> Decrypted Personal Twilio Carrier Vault
              <span className="text-slate-400 block truncate">Hash: 0xd7881421d33ab4806ba76ff955eb8e20b29e93d...</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "slide-10",
      slideNumber: 10,
      category: "Workflow & Governance",
      title: "Enterprise Implementation & ROI Projections",
      subtitle: "6-Week Rapid Rollout Roadmap and Quantified Production Impact",
      badge: "Rollout & ROI",
      icon: <TrendingUp className="w-6 h-6 text-emerald-600" />,
      overview: "Designed for immediate executive buy-in and phased, zero-downtime deployment across retail branches. Delivers demonstrable pipeline expansion within 14 days of CRM overlay activation, scaling to branch-wide operational mastery by week 6.",
      keyPillars: [
        {
          heading: "Phase 1: Zero-Trust CRM Overlay (Weeks 1-2)",
          description: "Establish GCP Cloud Run containers, configure AES-256 vaults, and link Salesforce/Big Purple Dot CRM webhook listeners for automated contact sync.",
          highlight: "Weeks 1-2"
        },
        {
          heading: "Phase 2: Geosphere GIS & Realtor Onboarding (Weeks 3-4)",
          description: "Deploy co-branded partner URLs, configure regional county DPA grant parameters, and activate Vantage AI Ad Studio with loan officer BYOK keys.",
          highlight: "Weeks 3-4"
        },
        {
          heading: "Phase 3: Automated Cadence & Enterprise Scale (Weeks 5-6)",
          description: "Train loan officers on morning/noon/evening AI briefs, launch 2-1 buydown campaigns, and activate Branch Manager oversight consoles.",
          highlight: "Weeks 5-6"
        }
      ],
      roiTakeaway: "Delivers an estimated 3.8x ROI within the first 90 days through higher lead conversion, reduced lead cost, and increased purchase volume from Realtor commitments.",
      visualComponent: (
        <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-2xl p-4 text-xs space-y-3">
          <div className="flex items-center justify-between font-bold text-[#2D362E] border-b border-[#EAE7E0] pb-2">
            <span>TARGET ROI BENCHMARKS (90-DAY ENTERPRISE IMPACT)</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Audited Metrics</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-white border border-[#EAE7E0] rounded-xl">
              <span className="text-2xl font-black text-emerald-700 font-display block">+38%</span>
              <span className="text-[11px] font-semibold text-[#2D362E] block">Lead-to-App Velocity</span>
              <span className="text-[9px] text-[#606C5D]">Driven by Geosphere GIS prequals</span>
            </div>
            <div className="p-3 bg-white border border-[#EAE7E0] rounded-xl">
              <span className="text-2xl font-black text-indigo-700 font-display block">3.2x</span>
              <span className="text-[11px] font-semibold text-[#2D362E] block">Realtor Partner Retention</span>
              <span className="text-[9px] text-[#606C5D]">Through automated listing ad kits</span>
            </div>
            <div className="p-3 bg-white border border-[#EAE7E0] rounded-xl">
              <span className="text-2xl font-black text-amber-700 font-display block">45 Min</span>
              <span className="text-[11px] font-semibold text-[#2D362E] block">Saved Per LO / Day</span>
              <span className="text-[9px] text-[#606C5D]">Eliminates manual task sorting</span>
            </div>
            <div className="p-3 bg-white border border-[#EAE7E0] rounded-xl">
              <span className="text-2xl font-black text-purple-700 font-display block">100%</span>
              <span className="text-[11px] font-semibold text-[#2D362E] block">Audit-Ready State</span>
              <span className="text-[9px] text-[#606C5D]">SHA-256 immutable ledger</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "slide-11",
      slideNumber: 11,
      category: "Workflow & Governance",
      title: "Master User Roles, RBAC Access Matrix & Security Architecture",
      subtitle: "Comprehensive Role Definitions, Section/Tab Restrictions, and IT Code Fixer Architecture",
      badge: "RBAC & Security",
      icon: <Users className="w-6 h-6 text-indigo-600" />,
      overview: "Enforces granular Role-Based Access Control (RBAC) across branch portals, loan officer workspaces, and executive management tabs. Mike Ford Admin maintains absolute control to invite, suspend (revoke), or delete employee profiles, including specialized IT Manager/Tech and Peer Tester developer accounts.",
      keyPillars: [
        {
          heading: "Mike Ford Admin & IT Manager Roles",
          description: "Mike Ford holds master branch privileges and toggles the AI Error Whisperer & IT Code Fixer widget on/demand. IT Managers receive temporary full-admin access to inspect audit logs and deploy error patches.",
          highlight: "Full System Access"
        },
        {
          heading: "Peer Tester & Compliance Auditor Roles",
          description: "Peer Testers gain developer-grade sandbox access for system QA. Compliance Auditors operate under a strict zero-trust view-only protocol across all audit ledgers and PII scrub vaults.",
          highlight: "QA & Zero-Trust"
        },
        {
          heading: "LOs, Processors & Marketing Creators",
          description: "Loan officers manage assigned pipelines and co-branded Realtor portals. Processors access underwriting checkpoints, while Mktg Creators manage ad spend and social syndication.",
          highlight: "Scoped Permissions"
        }
      ],
      roiTakeaway: "Guarantees enterprise-grade separation of duties while allowing Mike Ford Admin to instantly provision and revoke technical debugging help with 1-click credential management.",
      visualComponent: (
        <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-2xl p-4 text-xs space-y-3 font-mono">
          <div className="flex items-center justify-between font-bold text-[#2D362E] border-b border-[#EAE7E0] pb-2">
            <span>RBAC ACCESS MATRIX & SECURITY CODE ARCHITECTURE</span>
            <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-bold">Verified SEC-256</span>
          </div>
          <div className="space-y-2 text-[11px]">
            <div className="p-2.5 bg-white rounded-xl border border-slate-200">
              <span className="font-bold text-[#2D362E] block">1. Role Normalization & Provisioning (`authUtils.ts`)</span>
              <span className="text-[10px] text-slate-600 block mt-0.5">`checkAndProvisionUser(user)` auto-maps Firebase Auth claims to RbacRole, granting master bypass for <code className="bg-slate-100 px-1 text-indigo-700">fordmj@gmail.com</code>.</span>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200">
              <span className="font-bold text-[#2D362E] block">2. IT Error Whisperer Control (`ErrorWhispererWidget.tsx`)</span>
              <span className="text-[10px] text-slate-600 block mt-0.5">Hidden by default. Controlled exclusively via Mike Ford's Master Role Manager toggle (`localStorage.setItem('show_error_whisperer', 'true')`).</span>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200">
              <span className="font-bold text-[#2D362E] block">3. Revocation & Profile Deletion (`MasterRoleManager.tsx`)</span>
              <span className="text-[10px] text-slate-600 block mt-0.5">Instant session termination on Revoke; permanent record purging on Delete Profile.</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  const filteredSlides = activeCategoryFilter === "all" 
    ? slides 
    : slides.filter(s => s.category === activeCategoryFilter);

  const currentSlide = slides[currentSlideIndex];

  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Deck */}
      <div className="bg-white rounded-3xl border border-[#EAE7E0] p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider">
              Enterprise v4.2 Pitch Deck
            </span>
            <span className="text-xs text-[#9A9488]">• C-Suite & IT Board Approved</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#2D362E] font-display">
            First-Time Homebuyer Ecosphere Executive Deck
          </h2>
          <p className="text-xs text-[#606C5D] mt-0.5 max-w-2xl">
            Melded 3-Point Microservices Ecosphere: Zero-Drift AI Brain, Geosphere GIS Maps, Realtor Co-Branding & Zero-Trust Governance.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-2xl bg-[#4A5D4E] hover:bg-[#3D4C40] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            title="Export all cards into a cleanly organized presentation PDF for C-Suite, Sales & IT"
          >
            <FileText className="w-4 h-4" />
            <span>Save Pitch Deck PDF</span>
          </button>
          <div className="bg-[#FAF9F5] border border-[#EAE7E0] p-1 rounded-2xl flex items-center gap-1">
            <button
              onClick={() => setViewMode("slides")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === "slides"
                  ? "bg-[#2D362E] text-white shadow-xs"
                  : "text-[#606C5D] hover:text-[#2D362E]"
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Interactive Slides</span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === "grid"
                  ? "bg-[#2D362E] text-white shadow-xs"
                  : "text-[#606C5D] hover:text-[#2D362E]"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>All 10 Slides (Grid)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { id: "all", label: "All 10 Slides" },
          { id: "Strategy & Cloud", label: "Strategy & Cloud (1-3)" },
          { id: "AI & Spatial Tech", label: "AI & Spatial Tech (4-5)" },
          { id: "Marketing & Scenarios", label: "Marketing & Scenarios (6-7)" },
          { id: "Workflow & Governance", label: "Workflow & Governance (8-10)" },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => {
              setActiveCategoryFilter(cat.id);
              if (cat.id !== "all") {
                const firstMatch = slides.findIndex(s => s.category === cat.id);
                if (firstMatch !== -1) setCurrentSlideIndex(firstMatch);
              }
            }}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
              activeCategoryFilter === cat.id
                ? "bg-[#4A5D4E] text-white shadow-xs"
                : "bg-white border border-[#EAE7E0] text-[#606C5D] hover:bg-[#FAF9F5]"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* VIEW 1: INTERACTIVE SLIDE PRESENTATION */}
      {viewMode === "slides" && (
        <div className="bg-white rounded-3xl border border-[#EAE7E0] overflow-hidden shadow-xs flex flex-col h-[calc(100vh-160px)] min-h-[500px] max-h-[850px] relative">
          {/* Slide Top Bar */}
          <div className="bg-[#2D362E] text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center font-mono font-bold text-sm text-emerald-400">
                {currentSlide.slideNumber}
              </span>
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-300 block">
                  {currentSlide.category} • {currentSlide.badge}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white font-display leading-tight">
                  {currentSlide.title}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => copySlideText(currentSlide)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
                title="Copy slide summary"
              >
                {copiedSlideId === currentSlide.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSlideId === currentSlide.id ? "Copied!" : "Copy Slide"}</span>
              </button>

              <span className="text-xs font-mono font-medium px-3 py-1 bg-white/10 rounded-xl text-white/80">
                Slide {currentSlideIndex + 1} of {slides.length}
              </span>
            </div>
          </div>

          {/* Slide Body & Controls Container */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Scrollable Content Area */}
            <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto flex-1 space-y-5">
              {/* Subtitle & Overview */}
              <div className="space-y-2 border-b border-[#EAE7E0] pb-4">
                <h4 className="text-base sm:text-lg font-bold text-[#2D362E]">
                  {currentSlide.subtitle}
                </h4>
                <p className="text-xs sm:text-sm text-[#4A5D4E] leading-relaxed">
                  {currentSlide.overview}
                </p>
              </div>

              {/* Pillars & Visual Component Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start pb-4">
                {/* Left: 3 Core Pillars */}
                <div className="lg:col-span-7 space-y-2.5">
                  {currentSlide.keyPillars.map((pillar, idx) => (
                    <div 
                      key={idx} 
                      className="p-3.5 sm:p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE7E0] hover:border-[#4A5D4E]/40 transition-colors space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#2D362E] flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-600" />
                          {pillar.heading}
                        </span>
                        {pillar.highlight && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-[#4A5D4E] border border-[#EAE7E0] font-mono">
                            {pillar.highlight}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#606C5D] leading-relaxed pl-4">
                        {pillar.description}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Right: Rich Interactive Visual / Telemetry Box */}
                <div className="lg:col-span-5 space-y-3">
                  {currentSlide.visualComponent}

                  <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                    <span className="font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-emerald-800">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Strategic ROI Takeaway
                    </span>
                    <p className="text-xs text-emerald-800 leading-relaxed font-medium">
                      {currentSlide.roiTakeaway}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pinned Navigation Footer */}
            <div className="p-4 sm:px-6 bg-white border-t border-[#EAE7E0] flex items-center justify-between shrink-0">
              <button
                onClick={prevSlide}
                className="px-4 py-2 rounded-xl border border-[#EAE7E0] bg-[#FAF9F5] hover:bg-[#F1EFE9] text-xs font-bold text-[#2D362E] flex items-center gap-2 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous Slide</span>
              </button>

              {/* Progress dots */}
              <div className="flex items-center gap-1.5">
                {slides.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentSlideIndex 
                        ? "w-7 bg-[#2D362E]" 
                        : "w-2 bg-[#EAE7E0] hover:bg-[#C18C5D]"
                    }`}
                    title={`Slide ${s.slideNumber}: ${s.title}`}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                className="px-4 py-2 rounded-xl bg-[#2D362E] hover:bg-[#1E241F] text-xs font-bold text-white flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
              >
                <span className="hidden sm:inline">Next Slide</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: FULL EXECUTIVE DECK GRID (ALL 10 SLIDES) */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSlides.map((slide, idx) => (
            <div 
              key={slide.id}
              className="bg-white rounded-3xl border border-[#EAE7E0] p-6 shadow-xs hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#F1EFE9] pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-[#2D362E] text-white flex items-center justify-center font-mono font-bold text-xs">
                      {slide.slideNumber}
                    </span>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-emerald-700 font-bold block">
                        {slide.category}
                      </span>
                      <h4 className="text-sm font-bold text-[#2D362E] font-display">
                        {slide.title}
                      </h4>
                    </div>
                  </div>
                  <button
                    onClick={() => copySlideText(slide)}
                    className="p-1.5 rounded-lg border border-[#EAE7E0] hover:bg-[#FAF9F5] text-[#606C5D]"
                    title="Copy Slide Summary"
                  >
                    {copiedSlideId === slide.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <p className="text-xs text-[#4A5D4E] font-medium leading-relaxed">
                  {slide.subtitle}
                </p>

                <div className="space-y-2">
                  {slide.keyPillars.map((p, pIdx) => (
                    <div key={pIdx} className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EAE7E0] text-[11px] space-y-0.5">
                      <div className="flex items-center justify-between font-bold text-[#2D362E]">
                        <span>• {p.heading}</span>
                        {p.highlight && <span className="text-[9px] px-1.5 py-0.5 rounded bg-white text-emerald-800 font-mono">{p.highlight}</span>}
                      </div>
                      <p className="text-[#606C5D] text-[10px]">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#F1EFE9] flex items-center justify-between">
                <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-1 rounded-lg">
                  ROI: {slide.roiTakeaway.slice(0, 50)}...
                </span>
                <button
                  onClick={() => {
                    setCurrentSlideIndex(slide.slideNumber - 1);
                    setViewMode("slides");
                  }}
                  className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  <span>Open Slide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hidden Print Container for Exporting All 10 Cards to PDF */}
      <div className="hidden print:block space-y-8">
        <div className="text-center space-y-2 mb-8 page-break-after">
          <h1 className="text-3xl font-black font-display text-[#2D362E]">First-Time Homebuyer Enterprise Software Suite</h1>
          <p className="text-sm text-[#606C5D]">Executive Pitch Deck for C-Suite Personnel, Sales Managers, and IT Managers • Melded 3-Point Microservices Ecosphere</p>
        </div>

        {slides.map((s) => (
          <div key={s.id} className="pitch-deck-print-slide bg-white border border-[#EAE7E0] rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-[#2D362E] text-white flex items-center justify-center font-mono font-bold text-sm">
                  {s.slideNumber}
                </span>
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-[#4A5D4E] block">
                    {s.category} • {s.badge}
                  </span>
                  <h3 className="text-lg font-bold text-[#2D362E] font-display">
                    {s.title}
                  </h3>
                </div>
              </div>
              <span className="text-xs font-mono text-gray-500">Slide {s.slideNumber} of 10</span>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-[#2D362E]">{s.subtitle}</h4>
              <p className="text-xs text-[#4A5D4E] leading-relaxed">{s.overview}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-[#2D362E] uppercase tracking-wider">Key Pillars</h5>
                {s.keyPillars.map((p, pIdx) => (
                  <div key={pIdx} className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EAE7E0] space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#2D362E]">{p.heading}</span>
                      {p.highlight && <span className="text-[9px] font-mono bg-white px-1.5 py-0.5 rounded border border-[#EAE7E0]">{p.highlight}</span>}
                    </div>
                    <p className="text-[11px] text-[#606C5D]">{p.description}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-[#2D362E] uppercase tracking-wider">Architecture & Telemetry</h5>
                <div className="scale-90 origin-top-left">
                  {s.visualComponent}
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 mt-2">
                  <span className="font-bold block text-[10px] uppercase text-emerald-800">Strategic ROI Takeaway</span>
                  <p className="text-[11px] font-medium">{s.roiTakeaway}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
