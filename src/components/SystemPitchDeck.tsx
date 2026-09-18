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
  Bot,
  Terminal,
  UserCheck
} from "lucide-react";

interface PitchSlide {
  id: string;
  slideNumber: number;
  category: string;
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
}

export const SystemPitchDeck: React.FC = () => {
  const [activeDeck, setActiveDeck] = useState<"sales" | "security">("sales");
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"slides" | "grid">("slides");
  const [copiedSlideId, setCopiedSlideId] = useState<string | null>(null);

  // Reset index when switching decks
  useEffect(() => {
    setCurrentSlideIndex(0);
  }, [activeDeck]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== "slides") return;
      const currentSlides = activeDeck === "sales" ? salesSlides : securitySlides;
      if (e.key === "ArrowRight") {
        setCurrentSlideIndex((prev) => (prev + 1) % currentSlides.length);
      } else if (e.key === "ArrowLeft") {
        setCurrentSlideIndex((prev) => (prev - 1 + currentSlides.length) % currentSlides.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewMode, activeDeck]);

  const salesSlides: PitchSlide[] = [
    {
      id: "sales-1",
      slideNumber: 1,
      category: "Sales & Conversion Strategy",
      title: "Top-of-Funnel Conversion Engine for Enterprise Lenders",
      subtitle: "Replacing Static Contact Forms with High-Intent Spatial Property Exploration",
      badge: "Sales Velocity",
      icon: <Building className="w-6 h-6 text-emerald-600" />,
      overview: "Traditional mortgage websites suffer from 68% lead abandonment on static forms. Our spatial discovery platform engages first-time homebuyers 60 to 90 days earlier in the real estate search, converting passive browsers into qualified purchase leads before they ever reach legacy CRM forms.",
      keyPillars: [
        {
          heading: "Frictionless CRM Bridge",
          description: "Syncs leads instantly into Salesforce, Big Purple Dot CRM, or Total Expert via automated bi-directional API webhooks.",
          highlight: "+38% Conversion"
        },
        {
          heading: "Early-Cycle Capture",
          description: "Engages buyers with interactive geo-targeted listing maps and instant grant finders rather than rigid pre-qual questionnaires.",
          highlight: "60-Day Head Start"
        },
        {
          heading: "Mutual Realtor Co-Branding",
          description: "Transforms standard one-way referral requests into reciprocal production partnerships with local real estate agents.",
          highlight: "Agent Lock-In"
        }
      ],
      roiTakeaway: "Increases branch purchase volume by accelerating top-of-funnel conversion without increasing marketing acquisition overhead.",
      visualComponent: (
        <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-2xl p-4 text-xs space-y-3">
          <div className="flex items-center justify-between font-bold text-[#2D362E] border-b border-[#EAE7E0] pb-2">
            <span>Legacy Form Drop-Off vs. Spatial Lead Capture</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono">Conversion Matrix</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl space-y-1">
              <span className="font-bold text-red-900 block">Old Static Lead Form</span>
              <p className="text-[11px] text-red-700">• 68% bounce rate on form load</p>
              <p className="text-[11px] text-red-700">• Zero buyer education value</p>
            </div>
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
              <span className="font-bold text-emerald-900 block">Spatial Discovery Engine</span>
              <p className="text-[11px] text-emerald-800">• 84% engagement duration</p>
              <p className="text-[11px] text-emerald-800">• Real-time DTI & Grant matching</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "sales-2",
      slideNumber: 2,
      category: "Realtor Partnership & Ad Studio",
      title: "Vantage AI Ad Studio & Co-Branded Marketing Hub",
      subtitle: "Automated Social Campaigns, Ad Copy Scripts & RESPA-Compliant Cost Sharing",
      badge: "Growth Engine",
      icon: <Target className="w-6 h-6 text-emerald-600" />,
      overview: "Empowers loan officers and real estate partners to co-create hyper-local listing ads in under 60 seconds. Features automated script generation, video asset previewing, and transparent 50/50 cost ledger distribution adhering strictly to RESPA guidelines.",
      keyPillars: [
        {
          heading: "Instant Ad Kit Generation",
          description: "Synthesizes Facebook, Instagram, and Google ad copy, imagery, and lead forms tied directly to active property listings.",
          highlight: "60-Second Setup"
        },
        {
          heading: "RESPA 50/50 Ledger",
          description: "Tracks joint marketing expenses with automated compliance logs, eliminating co-marketing regulatory exposure.",
          highlight: "Audit Proof"
        },
        {
          heading: "Media Asset Integration",
          description: "Seamlessly imports professional listing photography and walkthrough video tours for high-converting social campaigns.",
          highlight: "High CTR"
        }
      ],
      roiTakeaway: "Deepens loan officer relationships with top-producing real estate agents by providing a turnkey, zero-cost-per-lead co-marketing engine.",
      visualComponent: (
        <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-2xl p-4 text-xs space-y-3">
          <div className="flex items-center justify-between font-bold text-[#2D362E] border-b border-[#EAE7E0] pb-2">
            <span>Co-Marketing Workflow & Ad Studio</span>
            <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-mono">RESPA Compliant</span>
          </div>
          <div className="space-y-2 text-[11px]">
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
              <span>1. Listing Scrape & Asset Selection</span>
              <span className="text-emerald-600 font-bold">Automated</span>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
              <span>2. AI Ad Copy & Video Scripting</span>
              <span className="text-emerald-600 font-bold">Gemini Powered</span>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
              <span>3. 50/50 Cost Split Ledger & Meta Syndication</span>
              <span className="text-emerald-600 font-bold">Live Sync</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "sales-3",
      slideNumber: 3,
      category: "Mortgage Lab & Financial Scenarios",
      title: "Advanced Mortgage Scenarios & 2-1 Buydown Lab",
      subtitle: "Demonstrating Affordability, Cost of Waiting, and Amortization Transparency",
      badge: "Conversion Lab",
      icon: <Calculator className="w-6 h-6 text-emerald-600" />,
      overview: "Equips buyers and loan officers with interactive financial simulators. Instantly visualizes the lifetime savings of temporary 2-1 buydowns, calculates the compounding penalty of waiting to purchase in appreciating markets, and matches state down payment assistance grants.",
      keyPillars: [
        {
          heading: "2-1 Buydown Simulator",
          description: "Clearly illustrates year 1 and year 2 monthly payment relief funded by seller concessions, driving immediate purchase confidence.",
          highlight: "Visual Savings"
        },
        {
          heading: "Cost of Waiting Analysis",
          description: "Calculates rent inflation versus home appreciation over 1–5 years to compel hesitant buyers into immediate action.",
          highlight: "Urgency Driver"
        },
        {
          heading: "Down Payment Grant Finder",
          description: "Automatically matches buyer location and income against nationwide HFA limits and state-specific grant programs.",
          highlight: "Free Equity"
        }
      ],
      roiTakeaway: "Shortens sales cycle duration by transforming complex amortization math into intuitive, visual financial proof.",
      visualComponent: (
        <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-2xl p-4 text-xs space-y-3">
          <div className="flex items-center justify-between font-bold text-[#2D362E] border-b border-[#EAE7E0] pb-2">
            <span>Interactive Financial Comparison</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono">High Engagement</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] text-gray-500 block">Standard 30-Yr</span>
              <span className="font-bold text-slate-800 text-xs">$2,450/mo</span>
            </div>
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-[10px] text-emerald-700 block">2-1 Buydown (Yr 1)</span>
              <span className="font-bold text-emerald-900 text-xs">$1,940/mo</span>
            </div>
            <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl">
              <span className="text-[10px] text-indigo-700 block">Grant Matched</span>
              <span className="font-bold text-indigo-900 text-xs">$15,000 Free</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "sales-4",
      slideNumber: 4,
      category: "Economics & SaaS Cost Structure",
      title: "Negligible Enterprise SaaS Cost via BYOK Architecture",
      subtitle: "Zero Platform Bloat Fees: Branches & LOs Provide Their Own API Keys & Integrations",
      badge: "SaaS Economics",
      icon: <PieChart className="w-6 h-6 text-emerald-600" />,
      overview: "Designed for enterprise scale without runaway software licensing overhead. By leveraging a Bring-Your-Own-Key (BYOK) model for Twilio, BPD CRM, Gemini AI, and third-party ad networks, enterprise lenders eliminate arbitrary per-user SaaS price hikes.",
      keyPillars: [
        {
          heading: "Bring-Your-Own-Key (BYOK)",
          description: "Each branch or loan officer connects their own Twilio, CRM, and API credentials, keeping direct operating costs transparent.",
          highlight: "Zero Markups"
        },
        {
          heading: "Infinite Scalability",
          description: "Cloud Run auto-scaling ensures 1,000 to 2,000+ concurrent employees operate at lightning speed with zero infrastructure drag.",
          highlight: "Elastic Cloud"
        },
        {
          heading: "Controlled Third-Party Spend",
          description: "Budgets are managed directly through each branch's existing vendor subscriptions (Twilio SMS, Salesforce, RentCast).",
          highlight: "Predictable"
        }
      ],
      roiTakeaway: "Maximizes enterprise profitability by eliminating per-seat software taxes while empowering branches to utilize their preferred vendor stack.",
      visualComponent: (
        <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-2xl p-4 text-xs space-y-3">
          <div className="flex items-center justify-between font-bold text-[#2D362E] border-b border-[#EAE7E0] pb-2">
            <span>Traditional SaaS vs. BYOK Enterprise Model</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono">Cost Efficiency</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-1">
              <span className="font-bold text-red-900 block">Traditional Per-Seat SaaS</span>
              <p className="text-[11px] text-red-700">• $150–$300 per user/month flat tax</p>
              <p className="text-[11px] text-red-700">• Locked-in vendor markup on SMS & AI</p>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
              <span className="font-bold text-emerald-900 block">Our BYOK Enterprise Architecture</span>
              <p className="text-[11px] text-emerald-800">• Minimal platform license footprint</p>
              <p className="text-[11px] text-emerald-800">• Direct wholesale API billing (Twilio/OpenAI)</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "sales-5",
      slideNumber: 5,
      category: "Branch Hierarchy & National Scale",
      title: "Designed for 1,000–2,000+ Nationwide Mortgage Employees",
      subtitle: "Branch Manager Dashboards, Team Leaderboards & Regional Growth Tracking",
      badge: "Enterprise Scale",
      icon: <Users className="w-6 h-6 text-emerald-600" />,
      overview: "Built specifically for multi-branch regional and national lenders. Provides Branch Managers with instant pipeline visibility, team leaderboards, recruiting pipelines, and centralized compliance oversight across thousands of concurrent loan officers.",
      keyPillars: [
        {
          heading: "Branch Manager Command Center",
          description: "Real-time visibility into loan officer pipeline velocities, lead conversion ratios, and co-branded Realtor activity.",
          highlight: "Executive Control"
        },
        {
          heading: "Top 50 Producer Leaderboards",
          description: "Gamifies production across regional offices with audited 12-month volume rankings and real estate partner share tracking.",
          highlight: "Performance Driven"
        },
        {
          heading: "Recruiting Pipeline & Roster Sync",
          description: "Streamlines loan officer and real estate agent onboarding with instant roster importing and automated invitation triggers.",
          highlight: "Fast Expansion"
        }
      ],
      roiTakeaway: "Unifies disparate regional branches under a single standardized, high-performance sales and conversion infrastructure.",
      visualComponent: (
        <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-2xl p-4 text-xs space-y-3">
          <div className="flex items-center justify-between font-bold text-[#2D362E] border-b border-[#EAE7E0] pb-2">
            <span>Nationwide Multi-Branch Hierarchy</span>
            <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-mono">1,000+ Users</span>
          </div>
          <div className="space-y-2 text-[11px]">
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
              <span>National Enterprise Headquarters</span>
              <span className="font-bold text-slate-800">Mike Ford Admin</span>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between pl-6">
              <span>↳ Regional Branch Offices (Pacific, East, Central)</span>
              <span className="font-bold text-indigo-600">Branch Managers</span>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between pl-12">
              <span>↳ Local Loan Officers & Realtor Partners</span>
              <span className="font-bold text-emerald-600">Active Producers</span>
            </div>
          </div>
        </div>
      )
    }
  ];

  const securitySlides: PitchSlide[] = [
    {
      id: "sec-1",
      slideNumber: 1,
      category: "Cloud Architecture & Isolation",
      title: "Zero-Trust Microservices & Cloud Run Containerization",
      subtitle: "Stateless Walled-Off Containers Eliminating Lateral Vulnerability Movement",
      badge: "Zero-Trust Cloud",
      icon: <Server className="w-6 h-6 text-indigo-600" />,
      overview: "Engineered around Google Cloud Run's serverless container architecture. Each microservice runs in a strictly walled-off, stateless container instance. If any single endpoint encounters an anomaly, containers instantly isolate and cycle without affecting core database integrity or adjacent branch workloads.",
      keyPillars: [
        {
          heading: "Stateless Container Isolation",
          description: "Zero persistent local file storage. All compute instances execute in ephemeral, sandboxed memory spaces.",
          highlight: "Walled-Off"
        },
        {
          heading: "Secure HTTPS Ingress Routing",
          description: "All external traffic is routed exclusively through secured Nginx reverse proxy layers bound to strict TLS 1.3 encryption standards.",
          highlight: "TLS 1.3 Enforced"
        },
        {
          heading: "Instant Cold-Start Security",
          description: "Automated cryptographic handshake verification on container boot ensures zero tampered binaries ever enter production.",
          highlight: "Verified Boot"
        }
      ],
      roiTakeaway: "Delivers bank-grade cloud resilience and container security that satisfies the most rigorous enterprise IT and cybersecurity audits.",
      visualComponent: (
        <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-2xl p-4 text-xs space-y-3 font-mono">
          <div className="flex items-center justify-between font-bold text-[#2D362E] border-b border-[#EAE7E0] pb-2">
            <span>Cloud Run 3-Point Microservices Topology</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Isolated</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-indigo-700 block">Container A</span>
              <span className="text-gray-500">API & CRM Gateway</span>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-indigo-700 block">Container B</span>
              <span className="text-gray-500">AI & Gemini Engine</span>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-indigo-700 block">Container C</span>
              <span className="text-gray-500">Firestore Secure Vault</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "sec-2",
      slideNumber: 2,
      category: "Data Privacy & PII Protection",
      title: "Firebase Firestore & Ephemeral PII Vaults (SSN Scrub Never Allowed)",
      subtitle: "Automated Redaction, Real-Time PII Shredding & Zero-Persistence Memory",
      badge: "PII Shield",
      icon: <Lock className="w-6 h-6 text-indigo-600" />,
      overview: "Consumer privacy is absolute. Our PII protection engine enforces an uncompromising **'SSN Scrub Never Allowed in Plaintext'** protocol. Any document upload, financial profile, or chat transcript containing Social Security Numbers or credit card metadata undergoes automated redaction and cryptographic vault tokenization before touching AI memory or Firestore persistence.",
      keyPillars: [
        {
          heading: "Automated PII Redaction",
          description: "Incoming payloads are scanned in real-time; SSN and credit card numbers are instantly shredded and replaced with secure UUID vault tokens.",
          highlight: "Zero Plaintext SSN"
        },
        {
          heading: "Encrypted Firestore State",
          description: "All records are encrypted at rest using Google Cloud KMS customer-managed encryption keys (CMEK).",
          highlight: "AES-256 Encrypted"
        },
        {
          heading: "Ephemeral Memory Purge",
          description: "AI context windows and chat memory blocks automatically purge raw user identifiers upon session termination.",
          highlight: "Instant Wipe"
        }
      ],
      roiTakeaway: "Completely eliminates regulatory liability and consumer data breach exposure by ensuring sensitive borrower financials never exist unencrypted.",
      visualComponent: (
        <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-2xl p-4 text-xs space-y-3 font-mono">
          <div className="flex items-center justify-between font-bold text-[#2D362E] border-b border-[#EAE7E0] pb-2">
            <span>Zero-Trust PII Sanitization Flow</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">AES-256 Vault</span>
          </div>
          <div className="space-y-2 text-[11px]">
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
              <span>1. Raw Borrower Document Upload</span>
              <span className="text-amber-600">Contains SSN/Tax ID</span>
            </div>
            <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
              <span>2. Real-Time Regex & AI Scrubbing</span>
              <span className="text-emerald-700 font-bold">Shredded & Tokenized</span>
            </div>
            <div className="p-2.5 bg-indigo-50 rounded-xl border border-indigo-200 flex items-center justify-between">
              <span>3. Encrypted Firestore Persistence</span>
              <span className="text-indigo-700 font-bold">Vault ID Only Stored</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "sec-3",
      slideNumber: 3,
      category: "Role-Based Access Control",
      title: "Granular RBAC Access Matrix & Master Role Management",
      subtitle: "Mike Ford Admin, IT Manager, Peer Tester, Branch Manager & Auditor Boundaries",
      badge: "RBAC Governance",
      icon: <Users className="w-6 h-6 text-indigo-600" />,
      overview: "Enforces strict Role-Based Access Control (RBAC) across all portal sections and API endpoints. Mike Ford Admin holds ultimate master authority to provision temporary accounts, while IT Managers and Peer Testers receive scoped developer-grade credentials that can be revoked or deleted with a single click.",
      keyPillars: [
        {
          heading: "Mike Ford Admin Supremacy",
          description: "Unrestricted master control over role assignments, system configurations, and emergency credential revocations.",
          highlight: "Master Control"
        },
        {
          heading: "IT Manager & Peer Tester Roles",
          description: "Temporary admin-level debugging access for IT professionals and developers to inspect logs and deploy emergency error patches.",
          highlight: "Timed Debugging"
        },
        {
          heading: "Compliance Auditor (Zero-Trust)",
          description: "Read-only access restricted strictly to cryptographic audit ledgers and PII compliance verification logs.",
          highlight: "View-Only Audit"
        }
      ],
      roiTakeaway: "Guarantees absolute adherence to the Principle of Least Privilege across large multi-tier mortgage organizations.",
      visualComponent: (
        <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-2xl p-4 text-xs space-y-3 font-mono">
          <div className="flex items-center justify-between font-bold text-[#2D362E] border-b border-[#EAE7E0] pb-2">
            <span>RBAC Permission Hierarchy</span>
            <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-bold">Least Privilege</span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="p-2 bg-white rounded-lg border border-slate-200 flex justify-between">
              <span>Mike Ford Admin / System Owner</span>
              <span className="text-emerald-600 font-bold">Full Access + Revoke</span>
            </div>
            <div className="p-2 bg-white rounded-lg border border-slate-200 flex justify-between">
              <span>IT Manager / Peer Tester (Developer)</span>
              <span className="text-indigo-600 font-bold">Temporary Admin Debug</span>
            </div>
            <div className="p-2 bg-white rounded-lg border border-slate-200 flex justify-between">
              <span>Branch Managers & Loan Officers</span>
              <span className="text-amber-600 font-bold">Branch / Scoped Leads</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "sec-4",
      slideNumber: 4,
      category: "IT Telemetry & Debugging",
      title: "AI Error Whisperer & IT Tool Control (Admin Toggled)",
      subtitle: "Real-Time Exception Logging, Stack Trace Analysis & 1-Click Code Patching",
      badge: "IT Control",
      icon: <Terminal className="w-6 h-6 text-indigo-600" />,
      overview: "To maintain a pristine production environment for everyday users, the **AI Error Whisperer & IT Code Fixer** widget is hidden by default. Mike Ford Admin can instantly toggle the widget ON from the Master Role Manager when IT personnel or developers need real-time exception logging and automated stack trace patching.",
      keyPillars: [
        {
          heading: "Hidden by Default",
          description: "Zero visual clutter for regular homebuyers and loan officers; activated solely on-demand by system administrators.",
          highlight: "Clean UX"
        },
        {
          heading: "Live Telemetry & Exception Logs",
          description: "Captures frontend React warnings, backend 504 gateway timeouts, and database connection anomalies in real time.",
          highlight: "Instant Diagnostics"
        },
        {
          heading: "1-Click AI Code Patches",
          description: "Analyzes stack traces and formulates verified TypeScript/Node patch snippets for instant IT review and deployment.",
          highlight: "AI Remediation"
        }
      ],
      roiTakeaway: "Reduces mean time to resolution (MTTR) for system bugs from hours to seconds while keeping end-user interfaces pristine.",
      visualComponent: (
        <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-2xl p-4 text-xs space-y-3 font-mono">
          <div className="flex items-center justify-between font-bold text-[#2D362E] border-b border-[#EAE7E0] pb-2">
            <span>Error Whisperer Toggle Architecture</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Admin Controlled</span>
          </div>
          <div className="space-y-2 text-[11px]">
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
              <span>Default User State (`localStorage`)</span>
              <span className="text-red-600 font-bold">Hidden (OFF)</span>
            </div>
            <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
              <span>Mike Ford Admin Toggle Activated</span>
              <span className="text-emerald-700 font-bold">Visible to IT / Testers</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "sec-5",
      slideNumber: 5,
      category: "Audit Trails & Compliance",
      title: "Immutable SHA-256 Audit Ledgers & TCPA Compliance",
      subtitle: "Cryptographic Audit Trails for SMS Consent, Lead Handoffs & Role Changes",
      badge: "Compliance Trail",
      icon: <ShieldCheck className="w-6 h-6 text-indigo-600" />,
      overview: "Every sensitive system action—including TCPA SMS consent opt-ins, lead routing transfers, API key rotations, and role grants—is recorded in an immutable, cryptographic audit ledger. Complies fully with federal telemarketing and mortgage lending recordkeeping mandates.",
      keyPillars: [
        {
          heading: "TCPA SMS Consent Tracking",
          description: "Records exact IP timestamps, opt-in disclosures, and URL landing paths for every SMS lead capture event.",
          highlight: "Audit Proof"
        },
        {
          heading: "Role Change & Access Logging",
          description: "Maintains a permanent CSV-exportable log of all admin privilege grants, revocations, and profile deletions.",
          highlight: "ISO 27001 Ready"
        },
        {
          heading: "Cryptographic Hash Chaining",
          description: "Audit ledger entries are mathematically chained to prevent retroactive tampering or unauthorized log alteration.",
          highlight: "Tamper Evident"
        }
      ],
      roiTakeaway: "Provides enterprise legal and compliance teams with absolute, verifiable proof of regulatory adherence during federal audits.",
      visualComponent: (
        <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-2xl p-4 text-xs space-y-3 font-mono">
          <div className="flex items-center justify-between font-bold text-[#2D362E] border-b border-[#EAE7E0] pb-2">
            <span>Audit Ledger & TCPA Verification</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">SHA-256 Chain</span>
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="p-2 bg-white rounded-lg border border-slate-200 flex justify-between">
              <span>TCPA Opt-In Timestamp Log</span>
              <span className="text-emerald-600">Verified & Stamped</span>
            </div>
            <div className="p-2 bg-white rounded-lg border border-slate-200 flex justify-between">
              <span>Master Role Mutation History</span>
              <span className="text-indigo-600">CSV Export Ready</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "sec-6",
      slideNumber: 6,
      category: "System Access & RBAC Governance",
      title: "System Access Matrix: Complete Role Permissions Mapping",
      subtitle: "Explicit Portal Permissions, Visibility Boundaries, and Administrative Capabilities Across All 6 Tiers",
      badge: "Access Matrix",
      icon: <UserCheck className="w-6 h-6 text-indigo-600" />,
      overview: "A comprehensive governance matrix defining precise access controls, lead visibility scopes, and administrative privileges for every persona interacting with the mortgage platform.",
      keyPillars: [
        {
          heading: "Mike Ford Admin (Super Admin)",
          description: "Full master governance, role promotion/revocation, API key vault access, and global system configuration.",
          highlight: "Unrestricted Master"
        },
        {
          heading: "Branch Manager & Loan Officer",
          description: "Branch-scoped lead pipeline management, mortgage lab calculations, co-branded marketing studio, and borrower sync.",
          highlight: "Operational Branch"
        },
        {
          heading: "Agent & IT / Peer Tester",
          description: "Realtor partner co-marketing access with scoped lead handoffs; IT & Peer Testers receive debug toggles and telemetry logs.",
          highlight: "Scoped Partner / Dev"
        }
      ],
      roiTakeaway: "Eliminates privilege creep and unauthorized data exposure with mathematically enforced role boundaries.",
      visualComponent: (
        <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-2xl p-4 text-xs space-y-3 font-mono">
          <div className="flex items-center justify-between font-bold text-[#2D362E] border-b border-[#EAE7E0] pb-2">
            <span>System Access Matrix (6-Tier Governance)</span>
            <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-bold">RBAC Enforced</span>
          </div>
          <div className="space-y-2 text-[10px] max-h-56 overflow-y-auto pr-1">
            <div className="p-2 bg-white rounded-lg border border-slate-200">
              <div className="font-bold text-indigo-900 flex justify-between">
                <span>1. Mike Ford Admin</span>
                <span className="text-emerald-700">Master Super Admin</span>
              </div>
              <p className="text-gray-600 mt-0.5">Permissions: Full access to all portals, role management, API keys, compliance logs. Visibility: Global enterprise. Admin: Ultimate control.</p>
            </div>
            <div className="p-2 bg-white rounded-lg border border-slate-200">
              <div className="font-bold text-indigo-900 flex justify-between">
                <span>2. Branch Manager</span>
                <span className="text-blue-700">Branch Leadership</span>
              </div>
              <p className="text-gray-600 mt-0.5">Permissions: Branch lead roster, loan officer performance analytics, co-branding studio. Visibility: Branch-wide. Admin: Branch settings.</p>
            </div>
            <div className="p-2 bg-white rounded-lg border border-slate-200">
              <div className="font-bold text-indigo-900 flex justify-between">
                <span>3. Loan Officer (LO)</span>
                <span className="text-emerald-700">Production Originator</span>
              </div>
              <p className="text-gray-600 mt-0.5">Permissions: Lead journey pipeline, SMS templates, property tour sync, 2-1 buydown lab. Visibility: Assigned leads. Admin: Personal profile.</p>
            </div>
            <div className="p-2 bg-white rounded-lg border border-slate-200">
              <div className="font-bold text-indigo-900 flex justify-between">
                <span>4. Agent (Realtor Partner)</span>
                <span className="text-purple-700">Co-Marketing Partner</span>
              </div>
              <p className="text-gray-600 mt-0.5">Permissions: Co-branded marketing studio, shared listing leads, client tour map view. Visibility: Co-marketed leads. Admin: None.</p>
            </div>
            <div className="p-2 bg-white rounded-lg border border-slate-200">
              <div className="font-bold text-indigo-900 flex justify-between">
                <span>5. IT Tech / Manager</span>
                <span className="text-amber-700">Technical Ops</span>
              </div>
              <p className="text-gray-600 mt-0.5">Permissions: Error Whisperer telemetry, exception stack traces, container logs. Visibility: Technical logs. Admin: Patch deployment.</p>
            </div>
            <div className="p-2 bg-white rounded-lg border border-slate-200">
              <div className="font-bold text-indigo-900 flex justify-between">
                <span>6. Peer Tester</span>
                <span className="text-rose-700">Staging & QA</span>
              </div>
              <p className="text-gray-600 mt-0.5">Permissions: Sandbox testing flows, mock lead creation, feedback submission. Visibility: Isolated test data. Admin: None.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "sec-7",
      slideNumber: 7,
      category: "Access Security & Whitelist Governance",
      title: "Security & Whitelist Access Controls: Restricting Environment Access",
      subtitle: "Firestore whitelisted_emails Collection, Branch Manager Authorizations & Instant Revocation",
      badge: "Whitelist Shield",
      icon: <ShieldCheck className="w-6 h-6 text-indigo-600" />,
      overview: "To guarantee absolute data confidentiality, the platform enforces strict **Security & Whitelist** verification on every session. Unauthorized email addresses are automatically blocked at the authentication gateway. Only pre-authorized Cornerstone First Mortgage originators and staff listed in the secure `whitelisted_emails` collection are granted entry.",
      keyPillars: [
        {
          heading: "Firestore `whitelisted_emails` Collection",
          description: "Every login attempt cross-references real-time database whitelist records to verify active employment and role eligibility.",
          highlight: "Zero Unauthorized Entry"
        },
        {
          heading: "Branch Manager & Admin Provisioning",
          description: "Branch leaders and Mike Ford Admin can authorize new staff, assign custom role tiers, and manage security credentials instantly.",
          highlight: "Decentralized Governance"
        },
        {
          heading: "1-Click Revocation & Lockout",
          description: "Instantly terminate session tokens, revoke portal access, and purge whitelist records the moment an employee departs.",
          highlight: "Immediate Revocation"
        }
      ],
      roiTakeaway: "Prevents unauthorized data scraping and insider threats by locking the entire production environment behind a verified corporate whitelist.",
      visualComponent: (
        <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-2xl p-4 text-xs space-y-3 font-mono">
          <div className="flex items-center justify-between font-bold text-[#2D362E] border-b border-[#EAE7E0] pb-2">
            <span>Whitelist Access Enforcement Flow</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Encrypted Gate</span>
          </div>
          <div className="space-y-2 text-[11px]">
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
              <span>1. User Authentication Attempt (Email/Google)</span>
              <span className="text-blue-600">Incoming Login</span>
            </div>
            <div className="p-2.5 bg-indigo-50 rounded-xl border border-indigo-200 flex items-center justify-between">
              <span>2. Firestore `whitelisted_emails` Database Check</span>
              <span className="text-indigo-700 font-bold">Active Whitelist Match</span>
            </div>
            <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
              <span>3. Authorized Portal Entry & RBAC Assignment</span>
              <span className="text-emerald-700 font-bold">Secure Session Issued</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "sec-8",
      slideNumber: 8,
      category: "Compliance & IT Architecture",
      title: "Architectural Synergy: Telemetry vs. Whisperer vs. Whitelist vs. RBAC",
      subtitle: "A Complete Technical Breakdown for CISOs, Compliance Officers & IT Managers",
      badge: "Architecture 101",
      icon: <Terminal className="w-6 h-6 text-indigo-600" />,
      overview: "For IT Directors and Compliance auditors evaluating our 3-point microservices container architecture, this slide defines the precise operational boundaries and complementary roles of our four core security subsystems.",
      keyPillars: [
        {
          heading: "1. Telemetry (The System Nervous System)",
          description: "Continuous background logging of container health, API response times, and exceptions across Cloud Run without human touch.",
          highlight: "Diagnostic Sensors"
        },
        {
          heading: "2. Error Whisperer (The IT Remediation Tool)",
          description: "Hidden by default; toggled ON exclusively by Mike Ford Admin to let IT techs inspect stack traces and run AI-powered code patches.",
          highlight: "Mechanic's Diagnostic Rig"
        },
        {
          heading: "3. Whitelist (The Front-Door Security Guard)",
          description: "Database-backed email verification gate (`whitelisted_emails`) that instantly blocks unauthorized logins before entry.",
          highlight: "Lobby Turnstile"
        },
        {
          heading: "4. RBAC (The Internal Hallway Passes)",
          description: "Role-Based Access Control mapping authorized users to strict portal permissions and pipeline view boundaries (Principle of Least Privilege).",
          highlight: "Employee Badge Suites"
        }
      ],
      roiTakeaway: "Provides enterprise-grade defense-in-depth: Telemetry diagnoses health, Whisperer repairs code, Whitelist blocks outsiders, and RBAC governs insiders.",
      visualComponent: (
        <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-2xl p-4 text-xs space-y-2.5 font-mono">
          <div className="flex items-center justify-between font-bold text-[#2D362E] border-b border-[#EAE7E0] pb-2">
            <span>4-Pillar Security Ecosystem</span>
            <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold">Defense-in-Depth</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1">
              <div className="font-bold text-blue-900">1. Telemetry</div>
              <p className="text-gray-600">Background logging & latency monitoring.</p>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1">
              <div className="font-bold text-amber-900">2. Error Whisperer</div>
              <p className="text-gray-600">IT debug console (Admin toggled).</p>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1">
              <div className="font-bold text-emerald-900">3. Whitelist</div>
              <p className="text-gray-600">Firestore gatekeeper blocking outsiders.</p>
            </div>
            <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1">
              <div className="font-bold text-indigo-900">4. RBAC</div>
              <p className="text-gray-600">Granular role permission boundaries.</p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentSlides = activeDeck === "sales" ? salesSlides : securitySlides;
  const currentSlide = currentSlides[currentSlideIndex] || currentSlides[0];

  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % currentSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + currentSlides.length) % currentSlides.length);
  };

  const copySlideText = (slide: PitchSlide) => {
    const text = `DECK: ${activeDeck.toUpperCase()}\nSLIDE ${slide.slideNumber}: ${slide.title}\n${slide.subtitle}\n\nOverview:\n${slide.overview}\n\nKey Pillars:\n${slide.keyPillars.map(p => `• ${p.heading}: ${p.description}`).join("\n")}\n\nROI Takeaway:\n${slide.roiTakeaway}`;
    navigator.clipboard.writeText(text);
    setCopiedSlideId(slide.id);
    setTimeout(() => setCopiedSlideId(null), 2500);
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 sm:p-8 space-y-6 animate-in fade-in duration-300">
      {/* Header & Deck Switcher */}
      <div className="bg-white rounded-3xl border border-[#EAE7E0] p-6 lg:p-8 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-[#2D362E] text-white text-xs font-mono font-bold tracking-wider uppercase">
              Enterprise Executive Portals
            </span>
            <span className="text-xs font-mono text-[#606C5D]">
              {activeDeck === "sales" ? "Executive Sales & Conversion Deck" : "Enterprise Security & Compliance Deck"}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-[#2D362E]">
            {activeDeck === "sales" ? "First-Time Homebuyer Executive Sales Pitch Deck" : "Enterprise Security, Zero-Trust & Compliance Architecture Deck"}
          </h2>
          <p className="text-sm text-[#606C5D] max-w-3xl">
            {activeDeck === "sales" 
              ? "Comprehensive strategic overview for C-Suite executives, Sales Managers, and Loan Officers highlighting top-of-funnel conversion velocity, partner co-branding, and negligible SaaS costs."
              : "Steel-clad architectural breakdown for Chief Information Security Officers (CISOs) and IT Directors detailing Cloud Run microservices, zero-trust PII vaults, RBAC governance, and IT error whisperer telemetry."}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {/* Deck Switcher Tabs */}
          <div className="bg-[#FAF9F5] border border-[#EAE7E0] p-1.5 rounded-2xl flex items-center gap-1.5">
            <button
              onClick={() => setActiveDeck("sales")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeDeck === "sales"
                  ? "bg-[#2D362E] text-white shadow-sm"
                  : "text-[#606C5D] hover:text-[#2D362E]"
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Sales Deck</span>
            </button>
            <button
              onClick={() => setActiveDeck("security")}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeDeck === "security"
                  ? "bg-indigo-900 text-white shadow-sm"
                  : "text-[#606C5D] hover:text-[#2D362E]"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Security Deck</span>
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-2xl bg-[#4A5D4E] hover:bg-[#3D4C40] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            title="Export entire presentation deck to printable PDF"
          >
            <FileText className="w-4 h-4" />
            <span>Save Deck PDF</span>
          </button>

          <div className="bg-[#FAF9F5] border border-[#EAE7E0] p-1 rounded-2xl flex items-center gap-1">
            <button
              onClick={() => setViewMode("slides")}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "slides"
                  ? "bg-white text-[#2D362E] shadow-2xs"
                  : "text-[#606C5D] hover:text-[#2D362E]"
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Slide View</span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-[#2D362E] shadow-2xs"
                  : "text-[#606C5D] hover:text-[#2D362E]"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>All Cards</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: SLIDE-BY-SLIDE PRESENTATION STAGE */}
      {viewMode === "slides" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-[#EAE7E0] shadow-sm overflow-hidden flex flex-col">
            {/* Slide Header */}
            <div className="p-6 sm:p-8 border-b border-[#EAE7E0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#FAF9F5]">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-black text-lg text-white shadow-sm ${
                  activeDeck === "sales" ? "bg-[#2D362E]" : "bg-indigo-900"
                }`}>
                  {currentSlide.slideNumber}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#4A5D4E] font-bold">
                      {currentSlide.category} • {currentSlide.badge}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black font-display text-[#2D362E]">
                    {currentSlide.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => copySlideText(currentSlide)}
                  className="px-3 py-2 rounded-xl border border-[#EAE7E0] bg-white hover:bg-[#F1EFE9] text-xs font-bold text-[#606C5D] flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Copy slide summary"
                >
                  {copiedSlideId === currentSlide.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Slide</span>
                    </>
                  )}
                </button>
                <span className="text-xs font-mono text-[#606C5D] bg-white px-3 py-2 rounded-xl border border-[#EAE7E0]">
                  Slide {currentSlideIndex + 1} of {currentSlides.length}
                </span>
              </div>
            </div>

            {/* Slide Body */}
            <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Subtitle & Key Pillars */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-2">
                  <h4 className="text-base font-bold text-[#2D362E] font-display">
                    {currentSlide.subtitle}
                  </h4>
                  <p className="text-sm text-[#4A5D4E] leading-relaxed">
                    {currentSlide.overview}
                  </p>
                </div>

                <div className="space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-[#2D362E]">
                    Core Strategic Pillars
                  </h5>
                  <div className="space-y-2.5">
                    {currentSlide.keyPillars.map((pillar, pIdx) => (
                      <div key={pIdx} className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EAE7E0] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#2D362E]">
                            {pillar.heading}
                          </span>
                          {pillar.highlight && (
                            <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-lg border border-[#EAE7E0] text-[#4A5D4E] font-semibold">
                              {pillar.highlight}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#606C5D] leading-relaxed">
                          {pillar.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Visual Component & ROI */}
              <div className="lg:col-span-5 space-y-4">
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#2D362E]">
                  Architecture & Metrics Telemetry
                </h5>
                <div>
                  {currentSlide.visualComponent}
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-1">
                  <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Executive ROI Takeaway</span>
                  </div>
                  <p className="text-xs text-emerald-900 font-medium leading-relaxed">
                    {currentSlide.roiTakeaway}
                  </p>
                </div>
              </div>
            </div>

            {/* Pinned Navigation Footer */}
            <div className="p-4 sm:px-8 bg-[#FAF9F5] border-t border-[#EAE7E0] flex items-center justify-between shrink-0">
              <button
                onClick={prevSlide}
                className="px-4 py-2 rounded-xl border border-[#EAE7E0] bg-white hover:bg-[#F1EFE9] text-xs font-bold text-[#2D362E] flex items-center gap-2 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous Slide</span>
              </button>

              {/* Progress dots */}
              <div className="flex items-center gap-1.5">
                {currentSlides.map((s, idx) => (
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

      {/* VIEW 2: FULL DECK GRID (ALL CARDS) */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentSlides.map((slide) => (
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
                  ROI: {slide.roiTakeaway.slice(0, 45)}...
                </span>
                <button
                  onClick={() => {
                    setCurrentSlideIndex(slide.slideNumber - 1);
                    setViewMode("slides");
                  }}
                  className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Slide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hidden Print Container for Exporting All Cards to PDF */}
      <div className="hidden print:block space-y-8">
        <div className="text-center space-y-2 mb-8 page-break-after">
          <h1 className="text-3xl font-black font-display text-[#2D362E]">First-Time Homebuyer Enterprise Software Suite</h1>
          <p className="text-sm text-[#606C5D]">Executive Deck & Security Architecture Breakdown • 3-Point Microservices Ecosphere</p>
        </div>

        {currentSlides.map((s) => (
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
              <span className="text-xs font-mono text-gray-500">Slide {s.slideNumber} of {currentSlides.length}</span>
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
