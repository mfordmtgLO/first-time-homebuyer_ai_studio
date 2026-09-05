import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useIsMobile } from "./hooks/useIsMobile";
import { Compass, ShieldCheck } from "lucide-react";
import { Navbar } from "./components/Navbar";
import { StepNavigationBanner } from "./components/StepNavigationBanner";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { TelemetryDiagnosticsModal } from "./components/TelemetryDiagnosticsModal";
import { HeroWebsite } from "./components/HeroWebsite";
import { InstantAffordabilityCalculator } from "./components/InstantAffordabilityCalculator";
import { RoadmapView } from "./components/RoadmapView";
import { DashboardOverview } from "./components/DashboardOverview";
import { PropertyTracker } from "./components/PropertyTracker";
import { TourScorecardModal } from "./components/TourScorecardModal";
import { NewPropertyModal } from "./components/NewPropertyModal";
import { MortgageLab } from "./components/MortgageLab";
import { AICopilot } from "./components/AICopilot";
import { EscrowTracker } from "./components/EscrowTracker";
import { MarketTrends } from "./components/MarketTrends";
import { Step4AIScenarioSummary } from "./components/Step4AIScenarioSummary";
import { LoanOfficerPortal } from "./components/LoanOfficerPortal";
import { LeadIntakeChatbot } from "./components/LeadIntakeChatbot";
import { LoginScreen } from "./components/LoginScreen";
import { BranchManagement } from "./components/BranchManagement";
import { auth } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { checkAndProvisionUser } from "./utils/authUtils";
import { applyMetadataToDocument, fetchSavedSeoMetadata } from "./utils/seoManager";
import { 
  INITIAL_PROFILE, 
  INITIAL_PROPERTIES, 
  ROADMAP_MILESTONES, 
  DOCUMENT_VAULT_ITEMS,
  DEFAULT_LOAN_OFFICER,
  INITIAL_TEAM_LOAN_OFFICERS,
  INITIAL_AGENT_ROSTER,
  INITIAL_PAIRINGS,
  INITIAL_SOCIAL_CAMPAIGNS,
  INITIAL_AD_DRAFTS,
  INITIAL_LEADS
} from "./data/initialData";
import { INITIAL_RECRUITING_CAMPAIGNS } from "./data/recruitingData";
import { DEFAULT_SMS_TEMPLATES } from "./data/smsTemplates";
import { 
  FinancialProfile, 
  PropertyListing, 
  RoadmapMilestone, 
  DocumentItem, 
  ProfessionalGuidesState,
  CapturedLead,
  RbacRole
} from "./types";
import { 
  sanitizeLoanOfficer, 
  sanitizeAgent,
  findMatchingLoanOfficer, 
  findMatchingAgent, 
  findMatchingPairing,
  resolveFromUrlPath 
} from "./utils/guideMatching";
import { db } from "./firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";

import { GEOSPHERE_MOCK_LISTINGS } from "./data/geoSphereData";

export default function App() {
  const [currentMode, setCurrentMode] = useState<"website" | "dashboard">("website");
  const [activeTab, setActiveTab] = useState<string>("hero");
  const [isLeadBotOpen, setIsLeadBotOpen] = useState<boolean>(false);
  const [showTelemetryModal, setShowTelemetryModal] = useState<boolean>(false);
  const [leadBotSourceContext, setLeadBotSourceContext] = useState<{ source?: string, intent?: "chat_listings" | "blueprint_download" | "buying_power" } | undefined>(undefined);

  // Authentication & Site Visibility State
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isSettingsChecking, setIsSettingsChecking] = useState(true);
  const [userRole, setUserRole] = useState<RbacRole | "admin" | "lo" | null>(null);
  const [isAppPublic, setIsAppPublic] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const role = await checkAndProvisionUser(user);
          setUserRole(role);
        } catch (e) {
          console.error("Auth provisioning error:", e);
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
      setIsAuthChecking(false);
    });

    // Initialize SEO metadata for public consumer website
    fetchSavedSeoMetadata()
      .then((meta) => {
        applyMetadataToDocument(meta);
      })
      .catch((err) => console.warn("Initial SEO metadata load notice:", err));

    const unsubscribeSettings = onSnapshot(doc(db, "app_settings", "global"), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setIsAppPublic(data.isPublic === true);
        if (data.seoMetadata) {
          applyMetadataToDocument(data.seoMetadata);
        }
      } else {
        setIsAppPublic(false);
      }
      setIsSettingsChecking(false);
    }, (err) => {
      console.warn("Global settings snapshot error:", err);
      setIsSettingsChecking(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeSettings();
    };
  }, []);

  const pathname = typeof window !== "undefined" ? window.location.pathname.toLowerCase() : "";
  const hash = typeof window !== "undefined" ? window.location.hash.toLowerCase() : "";
  const search = typeof window !== "undefined" ? window.location.search.toLowerCase() : "";
  
  const isPortalAccess = 
    pathname === "/portal" ||
    pathname.startsWith("/portal/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/login" ||
    hash.includes("portal") || 
    hash.includes("admin") ||
    search.includes("portal=lo") ||
    search.includes("admin=lo");


  // Global State
  const [profile, setProfile] = useState<FinancialProfile>(() => {
    try {
      const savedProfile = localStorage.getItem("homebuyer_user_profile");
      if (savedProfile) {
        return JSON.parse(savedProfile);
      }
    } catch (e) {
      console.warn("Error parsing user profile:", e);
    }
    return INITIAL_PROFILE;
  });
  
  const [properties, setProperties] = useState<PropertyListing[]>(() => {
    try {
      const savedUserProps = localStorage.getItem("homebuyer_user_properties");
      if (savedUserProps) {
        return JSON.parse(savedUserProps);
      }
      
      const saved = localStorage.getItem("homebuyer_roadmap_state_v2") || localStorage.getItem("manus_guides_state_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.syncedProperties && parsed.syncedProperties.length > 0) {
          const published = parsed.syncedProperties.filter((p: PropertyListing) => p.isPubliclyPublished !== false);
          return [...published, ...INITIAL_PROPERTIES];
        }
      }
    } catch (e) {
      console.warn("Error parsing properties:", e);
    }
    const defaultPublished = GEOSPHERE_MOCK_LISTINGS.filter(p => p.isPubliclyPublished !== false);
    return [...defaultPublished, ...INITIAL_PROPERTIES];
  });
  const [milestones, setMilestones] = useState<RoadmapMilestone[]>(ROADMAP_MILESTONES);
  const [documents, setDocuments] = useState<DocumentItem[]>(DOCUMENT_VAULT_ITEMS);

  // Loan Officer & Local Professional Guides State
  const [guidesState, setGuidesState] = useState<ProfessionalGuidesState>(() => {
    let initialState: ProfessionalGuidesState = {
      currentUserId: DEFAULT_LOAN_OFFICER.id,
      adminLoanOfficerId: DEFAULT_LOAN_OFFICER.id,
      loanOfficers: INITIAL_TEAM_LOAN_OFFICERS.map(sanitizeLoanOfficer),
      loanOfficer: sanitizeLoanOfficer(DEFAULT_LOAN_OFFICER),
      agentRoster: INITIAL_AGENT_ROSTER.map(sanitizeAgent),
      activeAgentId: INITIAL_AGENT_ROSTER[0].id,
      pairings: INITIAL_PAIRINGS,
      recruitingCampaigns: INITIAL_RECRUITING_CAMPAIGNS,
      socialCampaigns: INITIAL_SOCIAL_CAMPAIGNS,
      adCampaignDrafts: INITIAL_AD_DRAFTS,
      leads: INITIAL_LEADS,
      syncedProperties: GEOSPHERE_MOCK_LISTINGS,
      smsTemplates: DEFAULT_SMS_TEMPLATES
    };

    try {
      const saved = localStorage.getItem("homebuyer_roadmap_state_v2") || localStorage.getItem("manus_guides_state_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.loanOfficers && parsed.pairings) {
          if (!parsed.leads) {
            parsed.leads = INITIAL_LEADS;
          }
          // Ensure SMS Templates are populated with rich pre-written options
          if (!parsed.smsTemplates || parsed.smsTemplates.length === 0) {
            parsed.smsTemplates = DEFAULT_SMS_TEMPLATES;
          } else {
            DEFAULT_SMS_TEMPLATES.forEach(defaultTpl => {
              if (!parsed.smsTemplates.some((t: any) => t.id === defaultTpl.id)) {
                parsed.smsTemplates.push(defaultTpl);
              }
            });
          }
          // Sanitize all loan officers and agents to guarantee data integrity
          parsed.loanOfficers = (parsed.loanOfficers as any[]).map(lo => sanitizeLoanOfficer(lo));
          if (parsed.agentRoster) {
            parsed.agentRoster = (parsed.agentRoster as any[]).map(agent => sanitizeAgent(agent));
          }

          // Merge any Team Lonn Kilstrom LOs that aren't yet in the saved state
          INITIAL_TEAM_LOAN_OFFICERS.forEach(defaultLo => {
            const exists = parsed.loanOfficers.some((lo: any) => lo.id === defaultLo.id);
            if (!exists) {
              parsed.loanOfficers.push(sanitizeLoanOfficer(defaultLo));
            }
          });

          // Merge initial pairings
          if (!parsed.recruitingCampaigns) {
            parsed.recruitingCampaigns = INITIAL_RECRUITING_CAMPAIGNS;
          }
          INITIAL_PAIRINGS.forEach(defaultPairing => {
            const pairingExists = parsed.pairings.some((p: any) => p.id === defaultPairing.id);
            if (!pairingExists) {
              parsed.pairings.push(defaultPairing);
            }
          });

          if (parsed.loanOfficer) {
            parsed.loanOfficer = sanitizeLoanOfficer(parsed.loanOfficer);
          } else {
            parsed.loanOfficer = sanitizeLoanOfficer(DEFAULT_LOAN_OFFICER);
          }
          if (!parsed.syncedProperties || parsed.syncedProperties.length === 0) {
            parsed.syncedProperties = GEOSPHERE_MOCK_LISTINGS;
          }

          initialState = parsed;
        }
      }
    } catch (e) {
      console.warn("Could not load saved guides state:", e);
    }

    // Immediately resolve URL params or clean path on first render
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const pathname = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const loParam = params.get("lo");
      const agentParam = params.get("agent");
      const pairParam = params.get("pair");

      let updatedLo = initialState.loanOfficer;
      let updatedAgentId = initialState.activeAgentId;
      let isCoBranded = false;

      // 1. Resolve from clean path / hash (e.g. /mike-ford, /mike-and-sarah, /lonn-kilstrom, /mford)
      const fromPath = resolveFromUrlPath(
        pathname,
        hash,
        initialState.loanOfficers,
        initialState.agentRoster,
        initialState.pairings
      );

      if (fromPath.isPairing || fromPath.matchedPairing) {
        isCoBranded = true;
        if (fromPath.matchedLo) updatedLo = fromPath.matchedLo;
        if (fromPath.matchedAgent) updatedAgentId = fromPath.matchedAgent.id;
      } else {
        if (fromPath.matchedLo) updatedLo = fromPath.matchedLo;
        if (fromPath.matchedAgent) updatedAgentId = fromPath.matchedAgent.id;
      }

      // 2. Query params take precedence if present
      if (pairParam) {
        isCoBranded = true;
        const matchedPair = findMatchingPairing(pairParam, initialState.pairings);
        if (matchedPair) {
          const pairLo = findMatchingLoanOfficer(matchedPair.loId, initialState.loanOfficers);
          if (pairLo) updatedLo = pairLo;
          const pairAgent = findMatchingAgent(matchedPair.agentId, initialState.agentRoster);
          if (pairAgent) updatedAgentId = pairAgent.id;
        }
      }

      if (loParam) {
        const matchedLo = findMatchingLoanOfficer(loParam, initialState.loanOfficers);
        if (matchedLo) updatedLo = matchedLo;
        if (!pairParam && !fromPath.isPairing) {
          isCoBranded = false;
        }
      }

      if (agentParam && !loParam && !pairParam && !fromPath.isPairing) {
        const matchedAgent = findMatchingAgent(agentParam, initialState.agentRoster);
        if (matchedAgent) updatedAgentId = matchedAgent.id;
        isCoBranded = false;
      }

      initialState.loanOfficer = sanitizeLoanOfficer(updatedLo);
      initialState.activeAgentId = updatedAgentId;
      initialState.isCoBranded = isCoBranded;
    }

    return initialState;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("homebuyer_roadmap_state_v2", JSON.stringify(guidesState));
    } catch (e) {
      console.warn("Error saving guides state to localStorage:", e);
    }
  }, [guidesState]);

  useEffect(() => {
    try {
      localStorage.setItem("homebuyer_user_properties", JSON.stringify(properties));
    } catch (e) {
      console.warn("Error saving user properties to localStorage:", e);
    }
  }, [properties]);

  useEffect(() => {
    try {
      localStorage.setItem("homebuyer_user_profile", JSON.stringify(profile));
    } catch (e) {
      console.warn("Error saving user profile to localStorage:", e);
    }
  }, [profile]);

  // Subscribe to Firebase for live updates to headshots and profiles
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "guides_state", "singleton"),
      (snapshot) => {
        if (snapshot.exists()) {
          const remoteState = snapshot.data() as ProfessionalGuidesState;
          
          setGuidesState((prev) => {
            const updatedLo = remoteState.loanOfficers.find(lo => lo.id === prev.loanOfficer.id) || prev.loanOfficer;
            
            return {
              ...prev,
              loanOfficers: remoteState.loanOfficers.map(lo => sanitizeLoanOfficer(lo)),
              agentRoster: remoteState.agentRoster.map(agent => sanitizeAgent(agent)),
              pairings: remoteState.pairings || prev.pairings,
              recruitingCampaigns: remoteState.recruitingCampaigns || prev.recruitingCampaigns || INITIAL_RECRUITING_CAMPAIGNS,
              socialCampaigns: remoteState.socialCampaigns || prev.socialCampaigns,
              adCampaignDrafts: remoteState.adCampaignDrafts || prev.adCampaignDrafts,
              leads: remoteState.leads || prev.leads,
              syncedProperties: remoteState.syncedProperties || prev.syncedProperties,
              loanOfficer: sanitizeLoanOfficer(updatedLo)
            };
          });

          // Also update the live properties list if the Loan Officer published new listings
          if (remoteState.syncedProperties && remoteState.syncedProperties.length > 0) {
            const published = remoteState.syncedProperties.filter(p => p.isPubliclyPublished !== false);
            setProperties(prev => {
              const remainingCustom = prev.filter(p => !p.id.startsWith("geo-") && !p.id.includes("-OR-"));
              
              // Merge published properties with previous state to preserve user preferences
              const mergedPublished = published.map(pubProp => {
                const existing = prev.find(p => p.id === pubProp.id);
                if (existing) {
                  return {
                    ...pubProp,
                    isFavorite: existing.isFavorite,
                    priceAlertEnabled: existing.priceAlertEnabled,
                    previousPrice: existing.previousPrice
                  };
                }
                return pubProp;
              });
              
              return [...mergedPublished, ...remainingCustom];
            });
          }
        } else {
          // First time initialization: Push local state up to Firebase if authenticated
          if (auth.currentUser) {
            setDoc(doc(db, "guides_state", "singleton"), guidesState).catch(console.warn);
          }
        }
      },
      (error) => {
        console.warn("Guides state snapshot listener notice:", error);
      }
    );
    
    return unsub;
  }, []);

  const handleUpdateGuidesState = (newState: ProfessionalGuidesState | ((prev: ProfessionalGuidesState) => ProfessionalGuidesState)) => {
    if (typeof newState === 'function') {
      setGuidesState(prev => {
        const computedState = newState(prev);
        setDoc(doc(db, "guides_state", "singleton"), computedState).catch(console.error);
        return computedState;
      });
    } else {
      setGuidesState(newState);
      // Push updates to Firebase cloud so all visitors see the updated headshot and details instantly!
      setDoc(doc(db, "guides_state", "singleton"), newState).catch(console.error);
    }
  };

  // Poll for 3rd Party Webhook Leads
  useEffect(() => {
    const pollWebhookLeads = async () => {
      try {
        const res = await fetch("/api/data/sync/poll");
        if (res.ok) {
          const data = await res.json();
          if (data.leads && data.leads.length > 0) {
            setGuidesState(prev => {
              const updatedLeads = [...data.leads, ...(prev.leads || [])];
              const newState = { ...prev, leads: updatedLeads };
              // Auto-sync new webhooks to Firebase
              setDoc(doc(db, "guides_state", "singleton"), newState).catch(console.error);
              return newState;
            });
          }
        }
      } catch (err) {
        console.error("Failed to poll webhook leads", err);
      }
    };
    
    // Poll every 15 seconds
    const intervalId = setInterval(pollWebhookLeads, 15000);
    return () => clearInterval(intervalId);
  }, []);

  // LO Hub & Modals State
  const [showLoPortal, setShowLoPortal] = useState<boolean>(false);
  const [scorecardProperty, setScorecardProperty] = useState<PropertyListing | null>(null);
  const [showNewPropertyModal, setShowNewPropertyModal] = useState<boolean>(false);
  
  // Collapsible Sidebar Layout State (Initial state: collapsed)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(true);

  // Dynamic Header Height for sticky sidebar
  const [headerHeight, setHeaderHeight] = useState(72);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!headerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const height = entry.borderBoxSize ? entry.borderBoxSize[0].blockSize : entry.contentRect.height;
        setHeaderHeight(height);
      }
    });
    resizeObserver.observe(headerRef.current);
    return () => resizeObserver.disconnect();
  }, [showLoPortal]);

  // Check URL params for partner link or LO access
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pathname = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();

    // 1. Resolve path components first to determine if it's a co-branded link or a solo LO link
    const fromPathForPortalCheck = resolveFromUrlPath(
      pathname,
      hash,
      guidesState.loanOfficers,
      guidesState.agentRoster,
      guidesState.pairings
    );

    // Check if URL path or hash indicates LO portal or specific LO
    let isPortalPath = 
      pathname.includes("/portal") || 
      pathname.includes("/admin") || 
      pathname.includes("/login") ||
      hash.includes("portal") || 
      hash.includes("admin") ||
      params.get("portal") === "lo" || 
      params.get("admin") === "lo";

    // Legacy support: if the URL contains the public portal base path, but resolves strictly to an LO (no Realtor pairing), it is the LO's dashboard login link.
    if (pathname.includes("first-time_homebuyer_portal") || pathname.includes("first-time-homebuyer-portal")) {
      if (fromPathForPortalCheck.matchedLo && !fromPathForPortalCheck.isPairing && !fromPathForPortalCheck.matchedPairing && !fromPathForPortalCheck.matchedAgent) {
        isPortalPath = true;
      }
    }

    const loParam = params.get("lo");
    const agentParam = params.get("agent");
    const pairParam = params.get("pair");

    setGuidesState(prev => {
      let updatedLo = prev.loanOfficer;
      let updatedAgentId = prev.activeAgentId;
      let isCoBranded = false;

      // 1. Resolve from clean path / hash (e.g. /mike-ford, /mike-and-sarah, /lonn-kilstrom, /mford)
      const fromPath = resolveFromUrlPath(
        pathname,
        hash,
        prev.loanOfficers,
        prev.agentRoster,
        prev.pairings
      );

      if (fromPath.isPairing || fromPath.matchedPairing) {
        isCoBranded = true;
        if (fromPath.matchedLo) updatedLo = fromPath.matchedLo;
        if (fromPath.matchedAgent) updatedAgentId = fromPath.matchedAgent.id;
      } else {
        if (fromPath.matchedLo) updatedLo = fromPath.matchedLo;
        if (fromPath.matchedAgent) updatedAgentId = fromPath.matchedAgent.id;
      }

      // 2. Query params take precedence if present
      if (pairParam) {
        isCoBranded = true;
        const matchedPair = findMatchingPairing(pairParam, prev.pairings);
        if (matchedPair) {
          const pairLo = findMatchingLoanOfficer(matchedPair.loId, prev.loanOfficers);
          if (pairLo) updatedLo = pairLo;
          const pairAgent = findMatchingAgent(matchedPair.agentId, prev.agentRoster);
          if (pairAgent) updatedAgentId = pairAgent.id;
        }
      }

      if (loParam) {
        const matchedLo = findMatchingLoanOfficer(loParam, prev.loanOfficers);
        if (matchedLo) updatedLo = matchedLo;
        if (!pairParam && !fromPath.isPairing) {
          isCoBranded = false;
        }
      }

      if (agentParam && !loParam && !pairParam && !fromPath.isPairing) {
        const matchedAgent = findMatchingAgent(agentParam, prev.agentRoster);
        if (matchedAgent) updatedAgentId = matchedAgent.id;
        isCoBranded = false;
      }

      return {
        ...prev,
        loanOfficer: sanitizeLoanOfficer(updatedLo),
        activeAgentId: updatedAgentId,
        isCoBranded: isCoBranded
      };
    });

    if (isPortalPath) {
      setShowLoPortal(true);
    }

    // Global non-conflicting keyboard shortcuts for Loan Officer access:
    // 1. Ctrl + Alt + L (or Cmd + Option + L)
    // 2. Alt + M (Mortgage / Mike)
    // 3. Ctrl + Alt + P (Portal)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is actively typing in an input/textarea
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea" || activeTag === "select") {
        return;
      }

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const isAlt = e.altKey;

      // Ctrl + Alt + L or Alt + M or Ctrl + Alt + P
      if (
        (isCtrlOrCmd && isAlt && (e.key === "l" || e.key === "L")) ||
        (isAlt && (e.key === "m" || e.key === "M")) ||
        (isCtrlOrCmd && isAlt && (e.key === "p" || e.key === "P"))
      ) {
        e.preventDefault();
        setShowLoPortal(prev => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Navigation Helper
  const handleNavigate = (tab: string, mode?: "website" | "dashboard") => {
    if (mode) {
      setCurrentMode(mode);
    }
    setActiveTab(tab);
    setShowLoPortal(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Direct Navigate to Local Guides Section (Loan Officer & Agent Profiles)
  const handleNavigateToGuides = () => {
    setShowLoPortal(false);
    setCurrentMode("dashboard");
    setActiveTab("step4_ai_plan");
    setTimeout(() => {
      const el = document.getElementById("local-professional-guides-section");
      if (el) {
        // Use dynamically tracked headerHeight plus 32px of extra visual breathing room
        const offset = headerHeight + 32;
        const y = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }, 150);
  };

  const handleScorecardSave = (updated: PropertyListing) => {
    setProperties(prev => prev.map(p => (p.id === updated.id ? updated : p)));
    setScorecardProperty(null);
  };

  const handleAddNewProperty = (newProp: PropertyListing) => {
    setProperties(prev => [newProp, ...prev]);
  };

  const handleAskAiAboutProperty = (property: PropertyListing) => {
    setCurrentMode("dashboard");
    setActiveTab("ai_copilot");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveLead = (newLead: CapturedLead) => {
    const currentLeads = guidesState.leads || [];
    const updatedLeads = [newLead, ...currentLeads];
    setGuidesState(prev => ({
      ...prev,
      leads: updatedLeads
    }));
  };

  const activeAgent = guidesState.agentRoster.find(a => a.id === guidesState.activeAgentId) || guidesState.agentRoster[0];

  // Access Verification Loading Screen (Wait for Auth & Firestore App Settings to resolve)
  if (isAuthChecking || isSettingsChecking) {
    return (
      <div className="min-h-screen bg-[#F9F8F4] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <ShieldCheck className="w-12 h-12 text-[#4A5D4E] mb-4 opacity-50" />
          <p className="text-[#606C5D] font-mono text-xs uppercase tracking-widest">Verifying access...</p>
        </div>
      </div>
    );
  }

  // When website is PRIVATE (Locked), only authenticated & authorized users (Admin / LO) can access it.
  // When website is PUBLIC (Unlocked), any visitor can view the public consumer website, but portal/admin routes require login.
  if (!userRole && (!isAppPublic || isPortalAccess)) {
    return <LoginScreen onLogin={(role) => setUserRole(role as any)} />;
  }

  return (
    <div className="h-[100dvh] w-full bg-[#F9F8F4] text-[#2D362E] flex flex-col selection:bg-[#C18C5D]/25 selection:text-[#2D362E] font-sans antialiased overflow-hidden relative">
      
      {/* Top Navigation (Flex None - Pinned to Top) */}
      {!showLoPortal && (
        <div ref={headerRef} className="flex-none relative z-40 bg-[#F9F8F4]/98 backdrop-blur-md border-b border-[#EAE7E0]/80 shadow-md">
          <Navbar
            currentTab={activeTab}
            setCurrentTab={setActiveTab}
            activeMode={currentMode}
            setActiveMode={setCurrentMode}
            profile={profile}
            setProfile={setProfile}
            savedCount={properties.length}
            onOpenLoPortal={() => setShowLoPortal(true)}
            onOpenLeadBot={() => { setLeadBotSourceContext(undefined); setIsLeadBotOpen(true); }}
            onNavigateToGuides={handleNavigateToGuides}
            loName={guidesState.loanOfficer.name}
          />
          {/* Mobile Only: Horizontal Step Banner */}
          <div className="lg:hidden w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 bg-[#F9F8F4] border-t border-[#EAE7E0]/80 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.05)]">
            <StepNavigationBanner
              currentTab={activeTab}
              currentMode={currentMode}
              onNavigate={handleNavigate}
              onNavigateToGuides={handleNavigateToGuides}
              loanOfficerName={guidesState.loanOfficer.name}
              activeAgentName={activeAgent.name}
            />
          </div>
        </div>
      )}

      {/* Scrollable Content Area (Flex 1) */}
      <div className="flex-1 w-full overflow-y-auto overflow-x-hidden flex flex-col relative scroll-smooth">
        {/* Main Layout Wrapper */}
      <div className={showLoPortal ? "flex-1 w-full" : "flex-1 w-full max-w-[1700px] mx-auto flex transition-all duration-300"}>
        {/* Desktop Only: Left Sidebar for Step Navigation & Tools Hub */}
        {!showLoPortal && (
          <aside 
            className={`hidden lg:flex flex-col shrink-0 border-r border-[#EAE7E0] bg-[#F9F8F4] z-30 self-start sticky top-0 transition-all duration-300 ease-in-out ${
              isSidebarCollapsed ? "w-16 sm:w-18 md:w-20 p-2" : "w-80 sm:w-84 xl:w-88 p-3 sm:p-4"
            }`}
            style={{ 
              height: `calc(100vh - ${headerHeight}px)` 
            }}
          >
            <StepNavigationBanner
              currentTab={activeTab}
              currentMode={currentMode}
              onNavigate={handleNavigate}
              onNavigateToGuides={handleNavigateToGuides}
              loanOfficerName={guidesState.loanOfficer.name}
              activeAgentName={activeAgent.name}
              isVertical={true}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
              profile={profile}
              setProfile={setProfile}
              loanOfficer={guidesState.loanOfficer}
              activeAgent={activeAgent}
              propertiesCount={properties.length}
            />
          </aside>
        )}

        {/* Main Content Area: Expands & shrinks dynamically to match sidebar state */}
        <main className={showLoPortal ? "flex-1 w-full p-0 m-0" : "flex-1 min-w-0 w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6 pb-8 transition-all duration-300 ease-in-out"}>
          {/* LOAN OFFICER PORTAL VIEW */}
          {showLoPortal ? (
          <LoanOfficerPortal userRole={userRole}
            guidesState={guidesState}
            onUpdateGuidesState={handleUpdateGuidesState}
            onClose={() => setShowLoPortal(false)}
            onViewPublicSite={() => {
              setShowLoPortal(false);
              handleNavigate("hero", "website");
            }}
            properties={properties}
            setProperties={setProperties}
          />
        ) : (
          <>
            {/* WEBSITE MODE VIEWS */}
            {currentMode === "website" && (
              <div>
                {activeTab === "hero" && (
                  <HeroWebsite
                    profile={profile}
                    setProfile={setProfile}
                    onOpenDashboard={() => handleNavigate("dashboard", "dashboard")}
                    onOpenCalculator={() => handleNavigate("calculator", "website")}
                    onOpenRoadmap={() => handleNavigate("roadmap", "website")}
                    onOpenStep4={() => handleNavigate("step4_ai_plan", "dashboard")}
                    onOpenLeadBot={() => { setLeadBotSourceContext(undefined); setIsLeadBotOpen(true); }}
                    loanOfficer={guidesState.loanOfficer}
                    activeAgent={activeAgent}
                    isCoBranded={guidesState.isCoBranded}
                    onOpenLoPortal={() => setShowLoPortal(true)}
                    properties={properties}
                  />
                )}

                {(activeTab === "calculator" || (!["hero", "roadmap"].includes(activeTab))) && (
                  <InstantAffordabilityCalculator
                    profile={profile}
                    setProfile={setProfile}
                    onOpenAdvisor={() => handleNavigate("step4_ai_plan", "dashboard")}
                    onNextStep={() => handleNavigate("roadmap", "website")}
                    onNavigate={handleNavigate}
                    loanOfficer={guidesState.loanOfficer}
                    activeAgent={activeAgent}
                    isLoanOfficerMode={false}
                  />
                )}

                {activeTab === "roadmap" && (
                  <RoadmapView
                    milestones={milestones}
                    setMilestones={setMilestones}
                    onGoToDashboard={() => handleNavigate("dashboard", "dashboard")}
                    onBackToStep1={() => handleNavigate("calculator", "website")}
                    onNavigate={handleNavigate}
                    profile={profile}
                    properties={properties}
                    documents={documents}
                    setDocuments={setDocuments}
                    loanOfficer={guidesState.loanOfficer}
                    activeAgent={activeAgent}
                    isCoBranded={guidesState.isCoBranded}
                  />
                )}
              </div>
            )}

            {/* DASHBOARD MODE VIEWS (SECURED USER DASHBOARD) */}
            {currentMode === "dashboard" && (
              <div>
                {(activeTab === "dashboard" || (!["step4_ai_plan", "properties", "mortgagelab", "ai_copilot", "escrow", "market_trends"].includes(activeTab))) && (
                  <DashboardOverview
                    profile={profile}
                    setProfile={setProfile}
                    properties={properties}
                    milestones={milestones}
                    documents={documents}
                    setDocuments={setDocuments}
                    onNavigate={handleNavigate}
                    onOpenNewPropertyModal={() => setShowNewPropertyModal(true)}
                    loanOfficer={guidesState.loanOfficer}
                    activeAgent={activeAgent}
                    onOpenLoPortal={() => setShowLoPortal(true)}
                    isSidebarCollapsed={isSidebarCollapsed}
                    onToggleSidebar={() => setIsSidebarCollapsed(prev => !prev)}
                    onSaveLead={handleSaveLead}
                  />
                )}

                {activeTab === "step4_ai_plan" && (
                  <Step4AIScenarioSummary
                    onRequestBlueprint={() => { setLeadBotSourceContext({ source: "Step 4 - Blueprint Download Request", intent: "blueprint_download" }); setIsLeadBotOpen(true); }}
                    onRequestListings={() => { setLeadBotSourceContext({ source: "Step 4 - Curated Listings Request", intent: "chat_listings" }); setIsLeadBotOpen(true); }}
                    profile={profile}
                    properties={properties}
                    milestones={milestones}
                    documents={documents}
                    setDocuments={setDocuments}
                    loanOfficer={guidesState.loanOfficer}
                    activeAgent={activeAgent}
                    isCoBranded={guidesState.isCoBranded}
                    onNavigate={handleNavigate}
                    onOpenLoPortal={() => setShowLoPortal(true)}
                  />
                )}

                {activeTab === "properties" && (
                  <PropertyTracker
                    properties={properties}
                    setProperties={setProperties}
                    profile={profile}
                    milestones={milestones}
                    documents={documents}
                    setDocuments={setDocuments}
                    loanOfficer={guidesState.loanOfficer}
                    activeAgent={activeAgent}
                    onOpenScorecard={(prop) => setScorecardProperty(prop)}
                    onOpenNewModal={() => setShowNewPropertyModal(true)}
                    onAskAiAboutProperty={handleAskAiAboutProperty}
                  />
                )}

                {activeTab === "mortgagelab" && (
                  <MortgageLab 
                    profile={profile}
                    loanOfficer={guidesState.loanOfficer}
                    activeAgent={activeAgent}
                    isLoanOfficerMode={false}
                  />
                )}

                {activeTab === "ai_copilot" && (
                  <AICopilot
                    profile={profile}
                    properties={properties}
                    loanOfficer={guidesState.loanOfficer}
                  />
                )}

                {activeTab === "escrow" && (
                  <EscrowTracker />
                )}

                {activeTab === "market_trends" && (
                  <MarketTrends
                    activeAgent={activeAgent}
                    loanOfficer={guidesState.loanOfficer}
                    agentRoster={guidesState.agentRoster}
                    pairings={guidesState.pairings}
                    isCoBranded={guidesState.isCoBranded}
                    listings={properties}
                    onNavigate={handleNavigate}
                    onSaveLead={handleSaveLead}
                    onTriggerToast={triggerToast}
                  />
                )}
              </div>
            )}
          </>
        )}
      </main>
      </div>

      {/* Footer */}
      {!showLoPortal && (
        <footer className="bg-[#F1EFE9] border-t border-[#EAE7E0] py-10 px-4 sm:px-6 lg:px-8 mt-16 text-xs text-[#606C5D]">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleNavigate("hero", "website")}
                className="flex items-center gap-2.5 text-left group focus:outline-none"
              >
                <div className="w-8 h-8 rounded-lg bg-[#606C5D] flex items-center justify-center font-bold text-white shadow-sm group-hover:scale-105 transition-transform">
                  <Compass className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="font-bold text-[#2D362E] text-sm">First-Time Homebuyer Roadmap</span>
                  <p className="text-[11px] text-[#9A9488]">Buy your first home with clarity and total confidence.</p>
                </div>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-5 text-[#606C5D]">
              <button onClick={() => handleNavigate("hero", "website")} className="hover:text-[#4A5D4E] transition-colors font-medium">Overview</button>
              <button onClick={() => handleNavigate("calculator", "website")} className="hover:text-[#4A5D4E] transition-colors">Step 1: Calculator</button>
              <button onClick={() => handleNavigate("roadmap", "website")} className="hover:text-[#4A5D4E] transition-colors">Step 2: Explore</button>
              <button onClick={() => handleNavigate("dashboard", "dashboard")} className="hover:text-[#4A5D4E] transition-colors">Step 3: Dashboard</button>
              <button onClick={() => handleNavigate("step4_ai_plan", "dashboard")} className="hover:text-[#4A5D4E] transition-colors font-bold text-[#4A5D4E]">Step 4: AI Plan & Guides</button>
            </div>

            <div className="text-center md:text-right text-[11px] text-[#9A9488]">
              <span>Powered by Gemini 3.7 Flash & Natural Tones</span>
              <div className="text-[#9A9488]/80 mt-0.5">Equal Housing Opportunity Awareness</div>
            </div>
          </div>
        </footer>
      )}
      </div>
      {/* Bottom Nav (Flex None - Pinned to Bottom on Mobile) */}
      <MobileBottomNav activeTab={activeTab} onNavigate={handleNavigate} />

      {/* Scorecard Modal */}
      {scorecardProperty && (
        <TourScorecardModal
          property={scorecardProperty}
          onClose={() => setScorecardProperty(null)}
          onSave={handleScorecardSave}
        />
      )}

      {/* New Property Modal */}
      {showNewPropertyModal && (
        <NewPropertyModal
          onClose={() => setShowNewPropertyModal(false)}
          onAdd={handleAddNewProperty}
        />
      )}

      {/* Return to LO Dashboard Floating Button */}
      {!showLoPortal && typeof window !== "undefined" && localStorage.getItem("lo_portal_auth_id") && (
        <button
          onClick={() => {
            setShowLoPortal(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="fixed bottom-24 right-6 md:bottom-6 md:left-6 z-50 bg-[#2D362E] hover:bg-[#1E241F] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 font-bold text-sm transition-all animate-in slide-in-from-bottom-5 border border-white/20 hover:scale-105 active:scale-95"
        >
          <span className="bg-[#4A5D4E] w-6 h-6 rounded-full flex items-center justify-center text-[10px]">👑</span>
          <span>Return to LO Dashboard</span>
        </button>
      )}

      {/* 24/7 AI Lead Intake & Prequal Chatbot */}
      {!showLoPortal && (
        <LeadIntakeChatbot
          initialLeadSource={leadBotSourceContext?.source}
          initialIntent={leadBotSourceContext?.intent}
          loanOfficer={guidesState.loanOfficer}
          agent={activeAgent}
          isCoBranded={guidesState.isCoBranded}
          financialProfile={profile}
          onSaveLead={handleSaveLead}
          isOpen={isLeadBotOpen}
          onClose={() => { setLeadBotSourceContext(undefined); setIsLeadBotOpen(false); }}
          onOpen={() => setIsLeadBotOpen(true)}
        />
      )}

      {/* Floating Production Telemetry & Diagnostics Button */}
      <button
        onClick={() => setShowTelemetryModal(true)}
        className="fixed bottom-6 right-6 z-40 bg-slate-900 hover:bg-slate-800 text-purple-400 border border-purple-500/30 px-3.5 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2 text-xs font-mono font-medium transition hover:scale-105 active:scale-95"
        title="Open Production Telemetry & Breadcrumbs Inspector"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Telemetry Inspector</span>
      </button>

      {/* Telemetry Diagnostics Modal */}
      <TelemetryDiagnosticsModal
        isOpen={showTelemetryModal}
        onClose={() => setShowTelemetryModal(false)}
      />
    </div>
  );
}

