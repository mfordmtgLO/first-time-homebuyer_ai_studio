import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useIsMobile } from "./hooks/useIsMobile";
import { Compass, ShieldCheck, Maximize2, Minimize2, ArrowRight } from "lucide-react";
import { Navbar } from "./components/Navbar";
import { StepNavigationBanner } from "./components/StepNavigationBanner";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { TelemetryDiagnosticsModal } from "./components/TelemetryDiagnosticsModal";
import { ErrorWhispererWidget } from "./components/ErrorWhispererWidget";
import { HeroWebsite } from "./components/HeroWebsite";
import { MobileHeroWebsite } from "./components/mobile/MobileHeroWebsite";
import { InstantAffordabilityCalculator } from "./components/InstantAffordabilityCalculator";
import { RoadmapView } from "./components/RoadmapView";
import { DashboardOverview } from "./components/DashboardOverview";
import { MobileDashboardOverview } from "./components/mobile/MobileDashboardOverview";
import { PropertyTracker } from "./components/PropertyTracker";
import { TourScorecardModal } from "./components/TourScorecardModal";
import { NewPropertyModal } from "./components/NewPropertyModal";
import { EscrowTracker } from "./components/EscrowTracker";
import { MarketTrends } from "./components/MarketTrends";

const MortgageLab = React.lazy(() => import("./components/MortgageLab").then(m => ({ default: m.MortgageLab })));
const AICopilot = React.lazy(() => import("./components/AICopilot").then(m => ({ default: m.AICopilot })));
const GeoSphereSyncHub = React.lazy(() => import("./components/GeoSphereSyncHub").then(m => ({ default: m.GeoSphereSyncHub })));
const Step4AIScenarioSummary = React.lazy(() => import("./components/Step4AIScenarioSummary").then(m => ({ default: m.Step4AIScenarioSummary })));
const AIPrequalWizard = React.lazy(() => import("./components/AIPrequalWizard").then(m => ({ default: m.AIPrequalWizard })));
const LoanOfficerPortal = React.lazy(() => import("./components/LoanOfficerPortal").then(m => ({ default: m.LoanOfficerPortal })));
const MobileLoanOfficerPortal = React.lazy(() => import("./components/mobile/MobileLoanOfficerPortal").then(m => ({ default: m.MobileLoanOfficerPortal })));
const LeadIntakeChatbot = React.lazy(() => import("./components/LeadIntakeChatbot").then(m => ({ default: m.LeadIntakeChatbot })));
const LoginScreen = React.lazy(() => import("./components/LoginScreen").then(m => ({ default: m.LoginScreen })));
const SystemPitchDeck = React.lazy(() => import("./components/SystemPitchDeck").then(m => ({ default: m.SystemPitchDeck })));
import { auth } from "./firebase";
import { onAuthStateChanged, signOut, getRedirectResult } from "firebase/auth";
import { checkAndProvisionUser, registerFCMToken } from "./utils/authUtils";
import { applyMetadataToDocument, fetchSavedSeoMetadata } from "./utils/seoManager";
import { SEOSchemaInjector } from "./components/SEOSchemaInjector";
import { PrivacyPolicyModal } from "./components/PrivacyPolicyModal";
import { cleanupStaleCaches } from "./utils/cacheCleanup";
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
  INITIAL_LEADS,
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
  RbacRole,
} from "./types";
import {
  sanitizeLoanOfficer,
  sanitizeAgent,
  findMatchingLoanOfficer,
  findMatchingAgent,
  findMatchingPairing,
  resolveFromUrlPath,
} from "./utils/guideMatching";
import { db } from "./firebase";
import { doc, getDoc, setDoc, onSnapshot, collection, writeBatch } from "firebase/firestore";

import { GEOSPHERE_MOCK_LISTINGS } from "./data/geoSphereData";

export default function App() {
  const isMobile = useIsMobile();
  const [currentMode, setCurrentMode] = useState<"website" | "dashboard">("website");
  const [activeTab, setActiveTab] = useState<string>("hero");
  const [mortgageLabInitialTab, setMortgageLabInitialTab] = useState<
    "buydown" | "costofwaiting" | "accelerator" | "amortization" | "closingcosts" | "rentvsbuy"
  >("buydown");
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);
  const [isLeadBotOpen, setIsLeadBotOpen] = useState<boolean>(false);
  const [showTelemetryModal, setShowTelemetryModal] = useState<boolean>(false);
  const [leadBotSourceContext, setLeadBotSourceContext] = useState<
    | { source?: string; intent?: "chat_listings" | "blueprint_download" | "buying_power" }
    | undefined
  >(undefined);
  const [globalToast, setGlobalToast] = useState<string | null>(null);
  const triggerGlobalToast = (msg: string) => {
    setGlobalToast(msg);
    setTimeout(() => setGlobalToast(null), 3500);
  };

  // Authentication & Site Visibility State
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      // If user explicitly logged out, skip loading wait and show login immediately
      if (localStorage.getItem("lo_portal_logged_out") === "true") {
        return false;
      }
    }
    return true;
  });
  const [isSettingsChecking, setIsSettingsChecking] = useState(false);
  const [userRole, setUserRole] = useState<RbacRole | "admin" | "lo" | null>(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (
        urlParams.get("review") === "true" ||
        urlParams.get("mode") === "review" ||
        urlParams.get("unlock") === "true" ||
        urlParams.get("public") === "true" ||
        urlParams.get("audit") === "true" ||
        localStorage.getItem("public_review_mode") === "true"
      ) {
        return "branch_manager";
      }
    }
    return null;
  });
  const [isAppPublic, setIsAppPublic] = useState(false);
  const [forceDesktopLoPortal, setForceDesktopLoPortal] = useState(false);

  useEffect(() => {
    // Safety timeout to prevent infinite blank screen if Firebase offline or blocked
    const timer = setTimeout(() => {
      setIsAuthChecking(false);
    }, 800);
    // Catch redirect auth completion if user returned from a full-page Google sign-in
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log("Redirect login completed for:", result.user.email);
          if (typeof window !== "undefined") {
            localStorage.removeItem("lo_portal_logged_out");
          }
        }
      })
      .catch((err) => {
        console.warn("Redirect check note:", err);
      });

    const requestNotificationPermission = async (uid: string) => {
      try {
        await registerFCMToken(uid);
      } catch (err) {
        console.warn("FCM Token Registration notice:", err);
      }
    };

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      const isExplicitlyLoggedOut =
        typeof window !== "undefined" &&
        localStorage.getItem("lo_portal_logged_out") === "true";

      if (isExplicitlyLoggedOut) {
        setUserRole(null);
        setIsAuthChecking(false);
        if (user) {
          signOut(auth).catch(() => {});
        }
        return;
      }

      if (user) {
        // Call push token registration upon successful authentication
        requestNotificationPermission(user.uid);

        const email = user.email?.toLowerCase();
        // Fast-path: Master Admin / Branch Manager is recognized instantly without blocking on network/Firestore
        if (email === "fordmj@gmail.com" || email === "mford@cfmtg.com") {
          setUserRole("branch_manager");
          setIsAuthChecking(false);
          if (typeof window !== "undefined") {
            localStorage.removeItem("lo_portal_logged_out");
            localStorage.setItem("lo_portal_auth_id", "lo-mike-ford");
          }
        }
        try {
          const role = await checkAndProvisionUser(user);
          setUserRole(role);
          if (typeof window !== "undefined") {
            localStorage.removeItem("lo_portal_logged_out");
          }
        } catch (e) {
          console.error("Auth provisioning error:", e);
          if (email === "fordmj@gmail.com" || email === "mford@cfmtg.com") {
            setUserRole("branch_manager");
          } else {
            setUserRole(null);
          }
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

    const unsubscribeSettings = onSnapshot(
      doc(db, "app_settings", "global"),
      (docSnap) => {
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
      },
      (err) => {
        console.warn("Global settings snapshot error:", err);
        setIsSettingsChecking(false);
      }
    );

    return () => {
      clearTimeout(timer);
      unsubscribeAuth();
      unsubscribeSettings();
    };
  }, []);

  // Idle tracking & cache cleanup utility on useEffect cleanup return if idle > 5 mins
  const lastActivityRef = useRef<number>(Date.now());
  useEffect(() => {
    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    window.addEventListener("mousemove", updateActivity);
    window.addEventListener("keydown", updateActivity);
    window.addEventListener("touchstart", updateActivity);
    window.addEventListener("scroll", updateActivity);
    window.addEventListener("click", updateActivity);

    return () => {
      window.removeEventListener("mousemove", updateActivity);
      window.removeEventListener("keydown", updateActivity);
      window.removeEventListener("touchstart", updateActivity);
      window.removeEventListener("scroll", updateActivity);
      window.removeEventListener("click", updateActivity);

      const idleDuration = Date.now() - lastActivityRef.current;
      const FIVE_MINUTES = 5 * 60 * 1000;
      if (idleDuration >= FIVE_MINUTES) {
        cleanupStaleCaches();
      }
    };
  }, []);

  const pathname = typeof window !== "undefined" ? window.location.pathname.toLowerCase() : "";
  const hash = typeof window !== "undefined" ? window.location.hash.toLowerCase() : "";
  const search = typeof window !== "undefined" ? window.location.search.toLowerCase() : "";

  const isPitchDeckAccess =
    pathname.includes("pitch-deck") ||
    pathname.includes("pitchdeck") ||
    pathname.includes("pitch_deck") ||
    pathname.includes("executive-deck") ||
    pathname.includes("security-deck") ||
    hash.includes("pitch-deck") ||
    hash.includes("pitchdeck") ||
    hash.includes("pitch_deck") ||
    hash.includes("executive-deck") ||
    hash.includes("security-deck") ||
    search.includes("pitch-deck") ||
    search.includes("pitchdeck") ||
    search.includes("tab=pitch-deck") ||
    search.includes("tab=system_pitch_deck") ||
    search.includes("view=pitch-deck") ||
    search.includes("deck=");

  const isPortalAccess =
    pathname.includes("portal") ||
    pathname.includes("admin") ||
    pathname.includes("lo-login") ||
    pathname.includes("secure-login") ||
    pathname === "/login" ||
    hash.includes("portal") ||
    hash.includes("admin") ||
    hash.includes("lo-login") ||
    hash.includes("login") ||
    search.includes("portal=lo") ||
    search.includes("admin=lo") ||
    search.includes("lo-login") ||
    search.includes("login=");

  // Global State
  const [profile, setProfile] = useState<FinancialProfile>(() => {
    try {
      if (typeof window !== "undefined") {
        const savedProfile = localStorage.getItem("homebuyer_user_profile");
        if (savedProfile) {
          return JSON.parse(savedProfile);
        }
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

      const saved =
        localStorage.getItem("homebuyer_roadmap_state_v2") ||
        localStorage.getItem("manus_guides_state_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.syncedProperties && parsed.syncedProperties.length > 0) {
          const published = parsed.syncedProperties.filter(
            (p: PropertyListing) => p.isPubliclyPublished !== false
          );
          return [...published, ...INITIAL_PROPERTIES];
        }
      }
    } catch (e) {
      console.warn("Error parsing properties:", e);
    }
    const defaultPublished = GEOSPHERE_MOCK_LISTINGS.filter((p) => p.isPubliclyPublished !== false);
    return [...defaultPublished, ...INITIAL_PROPERTIES];
  });
  const [milestones, setMilestones] = useState<RoadmapMilestone[]>(() => {
    try {
      const saved = localStorage.getItem("homebuyer_roadmap_milestones");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return ROADMAP_MILESTONES.map((def) => {
            const match = parsed.find((p: any) => p.id === def.id || p.stepNumber === def.stepNumber);
            return match ? { ...def, ...match } : def;
          });
        }
      }
    } catch (e) {
      console.warn("Could not load saved milestones:", e);
    }
    return ROADMAP_MILESTONES;
  });

  useEffect(() => {
    try {
      localStorage.setItem("homebuyer_roadmap_milestones", JSON.stringify(milestones));
    } catch (e) {
      console.warn("Could not save milestones state:", e);
    }
  }, [milestones]);

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
      smsTemplates: DEFAULT_SMS_TEMPLATES,
      bigPurpleDotCrmConfig: {
        apiKey: "bpd_live_crm_mike_ford_9824",
        subdomain: "cornerstone-leads",
        accountEmail: "mford@cfmtg.com",
        webhookSecret: "whsec_bpd_crm_8392019482",
        environment: "production",
        autoUploadNewLeads: true,
        connectionStatus: "connected",
        lastStatusMessage: "Connected & Active (BYOK)",
        lastSyncedAt: new Date().toISOString(),
        totalLeadsUploaded: 2,
      },
    };

    try {
      const saved =
        localStorage.getItem("homebuyer_roadmap_state_v2") ||
        localStorage.getItem("manus_guides_state_v2");
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
            DEFAULT_SMS_TEMPLATES.forEach((defaultTpl) => {
              if (!parsed.smsTemplates.some((t: any) => t.id === defaultTpl.id)) {
                parsed.smsTemplates.push(defaultTpl);
              }
            });
          }
          // Sanitize all loan officers and agents to guarantee data integrity
          parsed.loanOfficers = (parsed.loanOfficers as any[]).map((lo) => sanitizeLoanOfficer(lo));
          if (parsed.agentRoster) {
            parsed.agentRoster = (parsed.agentRoster as any[]).map((agent) => sanitizeAgent(agent));
          }

          // Merge any Team Lonn Kilstrom LOs that aren't yet in the saved state
          INITIAL_TEAM_LOAN_OFFICERS.forEach((defaultLo) => {
            const exists = parsed.loanOfficers.some((lo: any) => lo.id === defaultLo.id);
            if (!exists) {
              parsed.loanOfficers.push(sanitizeLoanOfficer(defaultLo));
            }
          });

          // Merge initial pairings
          if (!parsed.recruitingCampaigns) {
            parsed.recruitingCampaigns = INITIAL_RECRUITING_CAMPAIGNS;
          }
          INITIAL_PAIRINGS.forEach((defaultPairing) => {
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
          if (!parsed.bigPurpleDotCrmConfig) {
            parsed.bigPurpleDotCrmConfig = initialState.bigPurpleDotCrmConfig;
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
    const unsubSingleton = onSnapshot(
      doc(db, "guides_state", "singleton"),
      (snapshot) => {
        if (snapshot.exists()) {
          const remoteState = snapshot.data() as ProfessionalGuidesState;

          setGuidesState((prev) => {
            const updatedLo =
              remoteState.loanOfficers.find((lo) => lo.id === prev.loanOfficer.id) ||
              prev.loanOfficer;

            return {
              ...prev,
              loanOfficers: remoteState.loanOfficers.map((lo) => sanitizeLoanOfficer(lo)),
              agentRoster: remoteState.agentRoster.map((agent) => sanitizeAgent(agent)),
              pairings: remoteState.pairings || prev.pairings,
              recruitingCampaigns:
                remoteState.recruitingCampaigns ||
                prev.recruitingCampaigns ||
                INITIAL_RECRUITING_CAMPAIGNS,
              socialCampaigns: remoteState.socialCampaigns || prev.socialCampaigns,
              adCampaignDrafts: remoteState.adCampaignDrafts || prev.adCampaignDrafts,
              syncedProperties: remoteState.syncedProperties || prev.syncedProperties,
              loanOfficer: sanitizeLoanOfficer(updatedLo),
            };
          });

          // Also update the live properties list if the Loan Officer published new listings
          if (remoteState.syncedProperties && remoteState.syncedProperties.length > 0) {
            const published = remoteState.syncedProperties.filter(
              (p) => p.isPubliclyPublished !== false
            );
            setProperties((prev) => {
              const remainingCustom = prev.filter(
                (p) => !p.id.startsWith("geo-") && !p.id.includes("-OR-")
              );

              // Merge published properties with previous state to preserve user preferences
              const mergedPublished = published.map((pubProp) => {
                const existing = prev.find((p) => p.id === pubProp.id);
                if (existing) {
                  return {
                    ...pubProp,
                    isFavorite: existing.isFavorite,
                    priceAlertEnabled: existing.priceAlertEnabled,
                    previousPrice: existing.previousPrice,
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
            const { leads, ...strippedState } = guidesState;
            setDoc(doc(db, "guides_state", "singleton"), strippedState).catch(console.warn);
          }
        }
      },
      (error) => {
        console.warn("Guides state snapshot listener notice:", error);
      }
    );

    return () => {
      unsubSingleton();
    };
  }, []);

  // Secure reactive subscription to the sharded /leads collection (GLBA & PII Guard)
  // Ensures website visitors can never pull down the full lead register from Firebase.
  useEffect(() => {
    if (!userRole || userRole === null) {
      // Clear lead records in client memory if user is not authorized staff
      setGuidesState((prev) => ({ ...prev, leads: [] }));
      return;
    }

    const unsubLeads = onSnapshot(
      collection(db, "leads"),
      (snapshot) => {
        const remoteLeads: CapturedLead[] = [];
        snapshot.forEach((docSnap) => {
          remoteLeads.push(docSnap.data() as CapturedLead);
        });
        
        // Sort leads descending by creation date
        const sortedLeads = remoteLeads.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });

        setGuidesState((prev) => ({
          ...prev,
          leads: sortedLeads,
        }));
      },
      (error) => {
        console.warn("Sharded leads collection subscription restricted or blocked:", error);
      }
    );

    return () => unsubLeads();
  }, [userRole]);

  // Batch Processing & Debounced Idle Write Queue for Leads (minimizes Firestore writes & billing bottlenecks)
  const pendingLeadBatchRef = useRef<Map<string, CapturedLead>>(new Map());
  const leadBatchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const flushLeadBatch = async () => {
    if (pendingLeadBatchRef.current.size === 0) return;
    const entries = Array.from(pendingLeadBatchRef.current.entries());
    pendingLeadBatchRef.current.clear();

    try {
      for (let i = 0; i < entries.length; i += 500) {
        const chunk = entries.slice(i, i + 500);
        const batch = writeBatch(db);
        chunk.forEach(([id, lead]) => {
          batch.set(doc(db, "leads", id), lead, { merge: true });
        });
        await batch.commit();
      }
    } catch (err) {
      console.warn("Error committing batched lead writes to Firestore:", err);
    }
  };

  const queueLeadWrite = (lead: CapturedLead) => {
    pendingLeadBatchRef.current.set(lead.id, lead);
    if (leadBatchTimerRef.current) {
      clearTimeout(leadBatchTimerRef.current);
    }
    leadBatchTimerRef.current = setTimeout(() => {
      flushLeadBatch();
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (leadBatchTimerRef.current) clearTimeout(leadBatchTimerRef.current);
      flushLeadBatch();
    };
  }, []);

  const handleUpdateGuidesState = (
    newState: ProfessionalGuidesState | ((prev: ProfessionalGuidesState) => ProfessionalGuidesState)
  ) => {
    const saveSingleton = (stateToSave: ProfessionalGuidesState) => {
      const { leads, ...strippedState } = stateToSave;
      try {
        const payloadJson = JSON.stringify(strippedState);
        const payloadSize = typeof Blob !== "undefined" ? new Blob([payloadJson]).size : Buffer.byteLength(payloadJson, "utf8");
        if (payloadSize > 900 * 1024) {
          console.warn(`[Firestore Payload Warning] guides_state/singleton size is ${(payloadSize / 1024).toFixed(1)}KB, approaching 1MB cap.`);
          triggerGlobalToast("⚠️ Warning: Dashboard state size is approaching the 1MB limit. Please shard or archive old data.");
        }
        setDoc(doc(db, "guides_state", "singleton"), strippedState).catch((err) => {
          console.error("[Firestore Singleton Save Error]:", err);
          triggerGlobalToast("Couldn't save — please retry. If this persists, contact support.");
        });
      } catch (err) {
        console.error("[Firestore Singleton Serialization Error]:", err);
        triggerGlobalToast("Couldn't save — please retry. If this persists, contact support.");
      }
    };

    if (typeof newState === "function") {
      setGuidesState((prev) => {
        const computedState = newState(prev);

        // 1. Shard-save: Only run O(n) lead deep-diff if leads array reference actually changed
        if (computedState.leads && Array.isArray(computedState.leads) && computedState.leads !== prev.leads) {
          computedState.leads.forEach((lead) => {
            const prevLead = prev.leads?.find((l) => l.id === lead.id);
            if (!prevLead || JSON.stringify(prevLead) !== JSON.stringify(lead)) {
              queueLeadWrite(lead);
            }
          });
        }

        // 2. Singleton-save: Exclude the leads array with pre-flight size guard and error toast
        saveSingleton(computedState);
        return computedState;
      });
    } else {
      // 1. Shard-save: Only run O(n) lead deep-diff if leads array reference actually changed
      if (newState.leads && Array.isArray(newState.leads) && newState.leads !== guidesState.leads) {
        newState.leads.forEach((lead) => {
          const prevLead = guidesState.leads?.find((l) => l.id === lead.id);
          if (!prevLead || JSON.stringify(prevLead) !== JSON.stringify(lead)) {
            queueLeadWrite(lead);
          }
        });
      }

      setGuidesState(newState);
      // 2. Singleton-save with pre-flight size guard and error toast
      saveSingleton(newState);
    }
  };

  // Poll for 3rd Party Webhook Leads
  useEffect(() => {
    const pollWebhookLeads = async () => {
      try {
        if (!auth.currentUser) return;
        const token = await auth.currentUser.getIdToken().catch(() => null);
        if (!token) return;

        const url = new URL("/api/data/sync/poll", window.location.origin).toString();
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.leads && data.leads.length > 0) {
            setGuidesState((prev) => {
              const updatedLeads = [...data.leads, ...(prev.leads || [])];
              const newState = { ...prev, leads: updatedLeads };
              // Auto-sync new webhooks to Firebase
              setDoc(doc(db, "guides_state", "singleton"), newState).catch(console.error);
              return newState;
            });
          }
        }
      } catch (err: any) {
        console.error("Failed to poll webhook leads", err?.message || err);
      }
    };

    // Poll every 15 seconds
    const intervalId = setInterval(pollWebhookLeads, 15000);
    return () => clearInterval(intervalId);
  }, []);

  // LO Hub & Modals State
  const [showLoPortal, setShowLoPortal] = useState<boolean>(() => {
    return isPortalAccess;
  });

  useEffect(() => {
    if (isPortalAccess) {
      setShowLoPortal(true);
    }
  }, [isPortalAccess, userRole]);
  const [scorecardProperty, setScorecardProperty] = useState<PropertyListing | null>(null);
  const [showNewPropertyModal, setShowNewPropertyModal] = useState<boolean>(false);
  const [loPortalInitialTab, setLoPortalInitialTab] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get("tab");
      if (tabParam) {
        if (
          tabParam === "master_realtor" ||
          tabParam === "realtor" ||
          tabParam === "realtors" ||
          tabParam === "command_center" ||
          tabParam === "realtor_command_center"
        ) {
          return "master_realtor";
        }
        return tabParam;
      }
    }
    return "leads";
  });

  // Collapsible Sidebar Layout State (Initial state: collapsed)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(true);

  // Full-Screen Workspace Mode: Hides top navigation and sidebar to maximize space for document/property analysis
  const [isFullScreen, setIsFullScreen] = useState<boolean>(() => {
    try {
      return localStorage.getItem("homebuyer_fullscreen_workspace") === "true";
    } catch {
      return false;
    }
  });

  const toggleFullScreen = () => {
    setIsFullScreen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("homebuyer_fullscreen_workspace", String(next));
      } catch {}
      return next;
    });
  };

  // Listen for internal telemetry modal opening
  useEffect(() => {
    const handleOpenTelemetry = () => setShowTelemetryModal(true);
    window.addEventListener("open-telemetry", handleOpenTelemetry);
    return () => window.removeEventListener("open-telemetry", handleOpenTelemetry);
  }, []);

  // Keyboard shortcut: Press Escape to exit full-screen workspace mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullScreen) {
        setIsFullScreen(false);
        try {
          localStorage.setItem("homebuyer_fullscreen_workspace", "false");
        } catch {}
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullScreen]);

  // Dynamic Header Height for sticky sidebar
  const [headerHeight, setHeaderHeight] = useState(72);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!headerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.borderBoxSize
          ? entry.borderBoxSize[0].blockSize
          : entry.contentRect.height;
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
      pathname.includes("/lo-login") ||
      pathname.includes("/secure-login") ||
      hash.includes("portal") ||
      hash.includes("admin") ||
      params.get("portal") === "lo" ||
      params.get("admin") === "lo";

    // Legacy support: if the URL contains the public portal base path, but resolves strictly to an LO (no Realtor pairing), it is the LO's dashboard login link.
    if (
      pathname.includes("first-time_homebuyer_portal") ||
      pathname.includes("first-time-homebuyer-portal")
    ) {
      if (
        fromPathForPortalCheck.matchedLo &&
        !fromPathForPortalCheck.isPairing &&
        !fromPathForPortalCheck.matchedPairing &&
        !fromPathForPortalCheck.matchedAgent
      ) {
        isPortalPath = true;
      }
    }

    const loParam = params.get("lo");
    const agentParam = params.get("agent");
    const pairParam = params.get("pair");

    setGuidesState((prev) => {
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
        isCoBranded: isCoBranded,
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
        setShowLoPortal((prev) => !prev);
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
    setProperties((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setScorecardProperty(null);
  };

  const handleAddNewProperty = (newProp: PropertyListing) => {
    setProperties((prev) => [newProp, ...prev]);
  };

  const handleAskAiAboutProperty = (property: PropertyListing) => {
    setCurrentMode("dashboard");
    setActiveTab("ai_copilot");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveLead = (newLead: CapturedLead) => {
    const currentLeads = guidesState.leads || [];
    const updatedLeads = [newLead, ...currentLeads];
    setGuidesState((prev) => ({
      ...prev,
      leads: updatedLeads,
    }));
    
    // Shard-save: Queue sharded lead write into batch processing mechanism
    queueLeadWrite(newLead);
  };

  const activeAgent =
    guidesState.agentRoster.find((a) => a.id === guidesState.activeAgentId) ||
    guidesState.agentRoster[0];

  const handleAppLogout = async () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("lo_portal_logged_out", "true");
      localStorage.removeItem("lo_portal_auth_id");
      localStorage.removeItem("lo_portal_auth_email");
      localStorage.removeItem("lo_portal_role");
      sessionStorage.clear();
    }
    setUserRole(null);
    setShowLoPortal(true);
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("SignOut error:", e);
    }
    if (typeof window !== "undefined") {
      const isPortalUrl =
        window.location.pathname.includes("portal") ||
        window.location.search.includes("portal=lo") ||
        window.location.pathname.includes("login") ||
        window.location.pathname.includes("admin");

      const targetUrl = isPortalUrl
        ? (window.location.search.includes("portal=lo") ? "/?portal=lo" : (window.location.pathname.includes("portal") ? window.location.pathname : "/lo-login"))
        : "/lo-login";

      window.history.replaceState(null, "", targetUrl);
    }
  };

  // Access Verification Loading Screen (Wait for Auth to resolve)
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#F9F8F4] dark:bg-slate-950 flex items-center justify-center transition-colors duration-200">
        <div className="animate-pulse flex flex-col items-center">
          <ShieldCheck className="w-12 h-12 text-[#4A5D4E] dark:text-[#C18C5D] mb-4 opacity-50" />
          <p className="text-[#606C5D] dark:text-slate-400 font-mono text-xs uppercase tracking-widest">
            Verifying access...
          </p>
        </div>
      </div>
    );
  }

  // Routing Logic:
  // 0. If accessing the online pitch deck review route, render the executive deck hub directly
  if (isPitchDeckAccess) {
    return (
      <div className="min-h-screen w-full bg-[#F9F8F4] dark:bg-slate-950 text-[#2D362E] dark:text-slate-100 flex flex-col font-sans antialiased overflow-y-auto">
        <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-[#EAE7E0] dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-50 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2D362E] dark:bg-emerald-800 text-white flex items-center justify-center font-bold font-mono text-sm">
              CFM
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black text-[#2D362E] dark:text-white font-display">
                Executive & Security Pitch Deck Hub
              </h1>
              <p className="text-[10px] sm:text-xs text-[#606C5D] dark:text-slate-400 font-mono">
                Cornerstone First Mortgage • Online Executive Review
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="/"
              className="px-3.5 py-1.5 rounded-xl border border-[#EAE7E0] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-[#2D362E] dark:text-slate-200 hover:bg-[#FAF9F5] transition-all flex items-center gap-1.5"
            >
              <span>Main Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </header>
        <main className="flex-1 w-full py-6 sm:py-8">
          <React.Suspense
            fallback={
              <div className="min-h-[400px] flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-2 border-[#4A5D4E] border-t-transparent rounded-full" />
              </div>
            }
          >
            <SystemPitchDeck />
          </React.Suspense>
        </main>
      </div>
    );
  }

  // 1. If unauthenticated and accessing a portal route or LO portal is active, force the Google Sign-In screen
  // 2. If accessing the root website, always render the public consumer view
  if (!userRole && (isPortalAccess || showLoPortal)) {
    return (
      <React.Suspense
        fallback={
          <div className="min-h-screen bg-[#F9F8F4] dark:bg-slate-950 flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-2 border-[#4A5D4E] border-t-transparent rounded-full" />
          </div>
        }
      >
        <LoginScreen
          guidesState={guidesState}
          onLogin={(role) => {
            if (typeof window !== "undefined") {
              localStorage.removeItem("lo_portal_logged_out");
            }
            setUserRole(role as any);
            setShowLoPortal(true);
          }}
        />
      </React.Suspense>
    );
  }

  return (
    <>
      <SEOSchemaInjector currentCounty="Multnomah County" appName="GrantMatch Homebuyer" />
      <div className="h-[100dvh] w-full bg-[#F9F8F4] dark:bg-slate-950 text-[#2D362E] dark:text-slate-100 flex flex-col selection:bg-[#C18C5D]/25 dark:selection:bg-[#C18C5D]/40 selection:text-[#2D362E] dark:selection:text-white font-sans antialiased overflow-hidden relative transition-colors duration-200">
      {/* Top Navigation (Flex None - Pinned to Top - Hidden when Full-Screen Workspace is active) */}
      {!showLoPortal && !isFullScreen && (
        <div
          ref={headerRef}
          className="flex-none relative z-40 bg-[#F9F8F4]/98 backdrop-blur-md border-b border-[#EAE7E0]/80 shadow-md"
        >
          <Navbar
            currentTab={activeTab}
            setCurrentTab={setActiveTab}
            activeMode={currentMode}
            setActiveMode={setCurrentMode}
            profile={profile}
            setProfile={setProfile}
            savedCount={properties.length}
            onOpenLoPortal={() => setShowLoPortal(true)}
            onOpenLoAds={() => {
              setLoPortalInitialTab("ai_ad_generator");
              setShowLoPortal(true);
            }}
            onOpenLeadBot={() => {
              setLeadBotSourceContext(undefined);
              setIsLeadBotOpen(true);
            }}
            onNavigateToGuides={handleNavigateToGuides}
            loName={guidesState.loanOfficer.name}
            isFullScreen={isFullScreen}
            onToggleFullScreen={toggleFullScreen}
          />
        </div>
      )}

      {/* Floating Exit Full-Screen Control Banner when in Full-Screen Workspace */}
      {isFullScreen && (
        <aside
          aria-label="Full-Screen Workspace Controls"
          className="fixed top-3 right-5 z-50 flex items-center gap-2 bg-[#2D362E]/95 backdrop-blur-md text-white px-3.5 py-1.5 rounded-full shadow-2xl border border-white/20 animate-in fade-in slide-in-from-top-3 duration-200"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping mr-1" />
          <span className="text-xs font-semibold tracking-wide text-[#EAE7E0] hidden sm:inline">
            Full-Screen Workspace
          </span>
          <span className="text-[10px] text-[#A69F93] hidden md:inline font-mono bg-black/30 px-1.5 py-0.5 rounded">
            Press Esc
          </span>
          <button
            type="button"
            onClick={toggleFullScreen}
            className="flex items-center gap-1 text-xs font-bold bg-[#C18C5D] hover:bg-[#a67448] active:scale-95 text-white px-2.5 py-1 rounded-full transition-all cursor-pointer shadow-xs ml-1"
            title="Exit Full-Screen Workspace and restore sidebar and top navigation (Esc)"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Exit</span>
          </button>
        </aside>
      )}

      {/* Scrollable Content Area (Flex 1) */}
      <div className="flex-1 w-full overflow-y-auto overflow-x-hidden flex flex-col relative scroll-smooth">
        {/* Main Layout Wrapper */}
        <div
          className={
            showLoPortal
              ? "flex-1 w-full"
              : isFullScreen
                ? "flex-1 w-full max-w-full px-2 sm:px-4 md:px-6 transition-all duration-300"
                : "flex-1 w-full max-w-[1700px] mx-auto flex transition-all duration-300"
          }
        >
          {/* Desktop Only: Left Sidebar for Step Navigation & Tools Hub (Hidden in Full-Screen Workspace) */}
          {!showLoPortal && !isFullScreen && (
            <aside
              className={`hidden lg:flex flex-col shrink-0 border-r border-[#EAE7E0] dark:border-slate-800 bg-[#F9F8F4] dark:bg-slate-950 z-30 self-start sticky top-0 transition-all duration-300 ease-in-out ${
                isSidebarCollapsed ? "w-16 sm:w-18 md:w-20 p-2" : "w-80 sm:w-84 xl:w-88 p-3 sm:p-4"
              }`}
              style={{
                height: `calc(100vh - ${headerHeight}px)`,
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
                onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
                profile={profile}
                setProfile={setProfile}
                loanOfficer={guidesState.loanOfficer}
                activeAgent={activeAgent}
                propertiesCount={properties.length}
                isFullScreen={isFullScreen}
                onToggleFullScreen={toggleFullScreen}
                onOpenLoPortal={() => setShowLoPortal(true)}
                onOpenLoAds={() => {
                  setLoPortalInitialTab("ai_ad_generator");
                  setShowLoPortal(true);
                }}
              />
            </aside>
          )}

          {/* Main Content Area: Expands & shrinks dynamically to match sidebar & full-screen states */}
          <main
            className={
              showLoPortal
                ? "flex-1 w-full p-0 m-0"
                : isFullScreen
                  ? "flex-1 min-w-0 w-full px-2 sm:px-6 lg:px-10 py-4 md:py-6 space-y-6 pb-12 transition-all duration-300 ease-in-out"
                  : "flex-1 min-w-0 w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6 pb-8 transition-all duration-300 ease-in-out"
            }
          >
            {/* LOAN OFFICER PORTAL VIEW */}
            {showLoPortal ? (
              <React.Suspense
                fallback={
                  <div className="flex-1 w-full min-h-[500px] flex flex-col items-center justify-center gap-3">
                    <div className="animate-spin w-8 h-8 border-2 border-[#4A5D4E] border-t-transparent rounded-full" />
                    <span className="text-xs text-[#606C5D] font-mono">Loading Command Center...</span>
                  </div>
                }
              >
                {isMobile && !forceDesktopLoPortal ? (
                  <MobileLoanOfficerPortal
                    userRole={userRole}
                    guidesState={guidesState}
                    onUpdateGuidesState={handleUpdateGuidesState}
                    onClose={() => setShowLoPortal(false)}
                    onViewPublicSite={() => {
                      setShowLoPortal(false);
                      handleNavigate("hero", "website");
                    }}
                    onLogout={handleAppLogout}
                    properties={properties}
                    setProperties={setProperties}
                    onSwitchToDesktop={() => setForceDesktopLoPortal(true)}
                    initialTab={loPortalInitialTab as any}
                  />
                ) : (
                  <LoanOfficerPortal
                    userRole={userRole}
                    guidesState={guidesState}
                    onUpdateGuidesState={handleUpdateGuidesState}
                    onClose={() => setShowLoPortal(false)}
                    onViewPublicSite={() => {
                      setShowLoPortal(false);
                      handleNavigate("hero", "website");
                    }}
                    onLogout={handleAppLogout}
                    properties={properties}
                    setProperties={setProperties}
                    onSwitchToMobile={() => setForceDesktopLoPortal(false)}
                    initialTab={loPortalInitialTab as any}
                  />
                )}
              </React.Suspense>
            ) : (
              <>
                {/* WEBSITE MODE VIEWS */}
                {currentMode === "website" && (
                  <div>
                    {activeTab === "hero" && (
                      isMobile ? (
                        <MobileHeroWebsite
                          profile={profile}
                          setProfile={setProfile}
                          onOpenDashboard={() => handleNavigate("dashboard", "dashboard")}
                          onOpenProperties={() => handleNavigate("properties", "dashboard")}
                          onOpenCalculator={() => handleNavigate("calculator", "website")}
                          onOpenRoadmap={() => handleNavigate("roadmap", "website")}
                          onOpenStep4={() => handleNavigate("step4_ai_plan", "dashboard")}
                          onOpenLeadBot={() => {
                            setLeadBotSourceContext(undefined);
                            setIsLeadBotOpen(true);
                          }}
                          onCaptureLead={handleSaveLead}
                          loanOfficer={guidesState.loanOfficer}
                          activeAgent={activeAgent}
                          isCoBranded={guidesState.isCoBranded}
                          onOpenLoPortal={() => setShowLoPortal(true)}
                          properties={properties}
                          onOpenCostOfWaiting={() => {
                            setMortgageLabInitialTab("costofwaiting");
                            handleNavigate("mortgagelab", "dashboard");
                          }}
                          onOpenBuydown={() => {
                            setMortgageLabInitialTab("buydown");
                            handleNavigate("mortgagelab", "dashboard");
                          }}
                        />
                      ) : (
                        <HeroWebsite
                          profile={profile}
                          setProfile={setProfile}
                          onOpenDashboard={() => handleNavigate("properties", "dashboard")}
                          onOpenCalculator={() => handleNavigate("calculator", "website")}
                          onOpenRoadmap={() => handleNavigate("roadmap", "website")}
                          onOpenStep4={() => handleNavigate("step4_ai_plan", "dashboard")}
                          onOpenLeadBot={() => {
                            setLeadBotSourceContext(undefined);
                            setIsLeadBotOpen(true);
                          }}
                          onCaptureLead={handleSaveLead}
                          loanOfficer={guidesState.loanOfficer}
                          activeAgent={activeAgent}
                          isCoBranded={guidesState.isCoBranded}
                          onOpenLoPortal={() => setShowLoPortal(true)}
                          properties={properties}
                        />
                      )
                    )}

                    {(activeTab === "calculator" || !["hero", "roadmap"].includes(activeTab)) && (
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
                        onGoToDashboard={() => handleNavigate("step4_ai_plan", "dashboard")}
                        onBackToStep1={() => handleNavigate("calculator", "website")}
                        onNavigate={handleNavigate}
                        profile={profile}
                        properties={properties}
                        documents={documents}
                        setDocuments={setDocuments}
                        loanOfficer={guidesState.loanOfficer}
                        activeAgent={activeAgent}
                        isCoBranded={guidesState.isCoBranded}
                        agentRoster={guidesState.agentRoster}
                      />
                    )}
                  </div>
                )}

                {/* DASHBOARD MODE VIEWS (SECURED USER DASHBOARD) */}
                {currentMode === "dashboard" && (
                  <div>
                    {(activeTab === "dashboard" ||
                      ![
                        "step4_ai_plan",
                        "properties",
                        "geomap",
                        "geosphere",
                        "geosphere_sync",
                        "mortgagelab",
                        "ai_copilot",
                        "escrow",
                        "market_trends",
                      ].includes(activeTab)) && (
                      isMobile ? (
                        <MobileDashboardOverview
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
                          isCoBranded={guidesState.isCoBranded}
                          onOpenLoPortal={() => setShowLoPortal(true)}
                          onOpenLoAds={() => {
                            setLoPortalInitialTab("ai_ad_generator");
                            setShowLoPortal(true);
                          }}
                          onSaveLead={handleSaveLead}
                          agentRoster={guidesState.agentRoster}
                        />
                      ) : (
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
                          onOpenLoAds={() => {
                            setLoPortalInitialTab("ai_ad_generator");
                            setShowLoPortal(true);
                          }}
                          isSidebarCollapsed={isSidebarCollapsed}
                          onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
                          onSaveLead={handleSaveLead}
                          agentRoster={guidesState.agentRoster}
                        />
                      )
                    )}


                    {activeTab === "ai_prequal" && (
                      <React.Suspense fallback={
                        <div className="flex flex-col items-center justify-center p-16 space-y-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                          <p className="text-sm font-medium text-gray-600">Loading AI Assistant...</p>
                        </div>
                      }>
                        <AIPrequalWizard
                          loanOfficer={guidesState.loanOfficer}
                          currentProfile={profile}
                          onUpdateProfile={(updates) => setProfile(prev => ({ ...prev, ...updates }))}
                          onComplete={() => setActiveTab("step4_ai_plan")}
                        />
                      </React.Suspense>
                    )}

                    {activeTab === "step4_ai_plan" && (
                      <React.Suspense fallback={
                        <div className="flex flex-col items-center justify-center p-16 space-y-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                          <p className="text-sm font-medium text-gray-600">Loading Scenario Plan...</p>
                        </div>
                      }>
                        <Step4AIScenarioSummary
                          onRequestBlueprint={() => {
                            setLeadBotSourceContext({
                              source: "Step 4 - Blueprint Download Request",
                              intent: "blueprint_download",
                            });
                            setIsLeadBotOpen(true);
                          }}
                          onRequestListings={() => {
                            setLeadBotSourceContext({
                              source: "Step 4 - Curated Listings Request",
                              intent: "chat_listings",
                            });
                            setIsLeadBotOpen(true);
                          }}
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
                          agentRoster={guidesState.agentRoster}
                        />
                      </React.Suspense>
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

                    <React.Suspense fallback={
                      <div className="flex flex-col items-center justify-center p-16 space-y-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
                        <p className="text-sm font-medium text-gray-600 animate-pulse">Loading module with 2nd Brain Grounding...</p>
                      </div>
                    }>
                      {(activeTab === "geomap" || activeTab === "geosphere" || activeTab === "geosphere_sync") && (
                        <GeoSphereSyncHub
                          guidesState={guidesState}
                          onUpdateGuidesState={handleUpdateGuidesState}
                          properties={properties}
                          setProperties={setProperties}
                          onTriggerToast={triggerGlobalToast}
                          onNavigateToAdsPortal={() => {
                            setLoPortalInitialTab("ad_campaigns");
                            setShowLoPortal(true);
                          }}
                          onNavigateToFthbPipeline={() => {
                            setLoPortalInitialTab("fthb_pipeline");
                            setShowLoPortal(true);
                          }}
                        />
                      )}

                      {activeTab === "mortgagelab" && (
                        <MortgageLab
                          profile={profile}
                          loanOfficer={guidesState.loanOfficer}
                          activeAgent={activeAgent}
                          isLoanOfficerMode={false}
                          initialTab={mortgageLabInitialTab}
                          onBack={() => handleNavigate(isMobile ? "hero" : "dashboard", isMobile ? "website" : "dashboard")}
                        />
                      )}

                      {activeTab === "ai_copilot" && (
                        <AICopilot
                          profile={profile}
                          properties={properties}
                          loanOfficer={guidesState.loanOfficer}
                          activeAgent={activeAgent}
                        />
                      )}
                    </React.Suspense>

                    {activeTab === "escrow" && <EscrowTracker />}

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
                      />
                    )}
                  </div>
                )}
              </>
            )}
          </main>
        </div>

        {/* Footer (Hidden when Full-Screen Workspace is active) */}
        {!showLoPortal && !isFullScreen && (
          <footer className="bg-[#F1EFE9] dark:bg-slate-900 border-t border-[#EAE7E0] dark:border-slate-800 py-12 px-4 sm:px-6 lg:px-8 mt-16 text-xs text-[#606C5D] dark:text-slate-400 transition-colors duration-200">
            <div className="max-w-7xl mx-auto flex flex-col gap-10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleNavigate("hero", "website")}
                    className="flex items-center gap-2.5 text-left group focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#2D362E] flex items-center justify-center font-bold text-white shadow-sm group-hover:scale-105 transition-transform">
                      <Compass className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <span className="font-bold text-[#2D362E] dark:text-slate-200 text-sm">
                        Cornerstone First Mortgage
                      </span>
                      <p className="text-[11px] text-[#9A9488] dark:text-slate-500">
                        Mike Ford · Loan Officer · NMLS# 288455
                      </p>
                    </div>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-medium">
                  <a
                    href="/privacy-policy.html"
                    onClick={(e) => {
                      // Allow direct opening in new tab or open modal for instant review
                      if (!e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                        setShowPrivacyModal(true);
                      }
                    }}
                    className="hover:text-[#4A5D4E] dark:hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    Privacy Policy
                  </a>
                  <a
                    href="/terms-and-conditions.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#4A5D4E] dark:hover:text-slate-300 transition-colors"
                  >
                    Terms and Conditions
                  </a>
                  <a
                    href="/sms-opt-in.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#4A5D4E] dark:hover:text-slate-300 transition-colors"
                  >
                    SMS Terms &amp; Opt-In
                  </a>
                  <a href="https://www.nmlsconsumeraccess.org/" target="_blank" rel="noopener noreferrer" className="hover:text-[#4A5D4E] dark:hover:text-slate-300 transition-colors">NMLS Consumer Access</a>
                </div>
              </div>

              <div className="border-t border-[#EAE7E0] dark:border-slate-800 pt-8 flex flex-col md:flex-row gap-8 justify-between">
                <div className="space-y-4 max-w-2xl text-[10px] leading-relaxed text-[#9A9488] dark:text-slate-500">
                  <p>
                    17850 Pilkington Rd | Lake Oswego, OR 97035
                  </p>
                  <p>
                    For complete licensing information, please click: <br className="hidden md:block"/>
                    <a href="http://www.nmlsconsumeraccess.org/EntityDetails.aspx/INDIVIDUAL/288455" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#4A5D4E]">Mike Ford NMLS #288455</a> | <a href="https://www.nmlsconsumeraccess.org/EntityDetails.aspx/COMPANY/173855" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#4A5D4E]">Company NMLS #173855</a>
                  </p>
                  <p>
                    Cornerstone First Mortgage, LLC is an Equal Housing Opportunity Lender. 
                    <br />
                    This is not an offer to enter into an agreement. Not all customers will qualify. Information, rates and programs are subject to change without notice. All products are subject to credit and property approval. Other restrictions and limitations may apply.
                  </p>
                </div>

                <div className="flex flex-col md:items-end gap-2 text-[10px] text-[#9A9488] dark:text-slate-500">
                  <div className="flex items-center gap-2 mb-2">
                    <img src="https://www.hud.gov/sites/dfiles/FHEO/images/eho.jpg" alt="Equal Housing Opportunity" className="w-8 h-8 object-contain mix-blend-multiply dark:mix-blend-screen opacity-70" />
                  </div>
                  <p>© {new Date().getFullYear()} Cornerstone First Mortgage, LLC.</p>
                  <p>All Rights Reserved. NMLS ID #173855</p>
                  <p className="mt-2 text-[#C18C5D] font-medium">Powered by Gemini 3.8 Flash</p>
                </div>
              </div>
            </div>
          </footer>
        )}
      </div>
      {/* Bottom Nav (Flex None - Pinned to Bottom on Mobile - Hidden when in Full-Screen Workspace or LO Portal) */}
      {!isFullScreen && !showLoPortal && <MobileBottomNav activeTab={activeTab} onNavigate={handleNavigate} />}

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


      {/* 24/7 AI Lead Intake & Prequal Chatbot */}
      {!showLoPortal && (
        <React.Suspense fallback={null}>
          <LeadIntakeChatbot
            initialLeadSource={leadBotSourceContext?.source}
            initialIntent={leadBotSourceContext?.intent}
            loanOfficer={guidesState.loanOfficer}
            agent={activeAgent}
            isCoBranded={guidesState.isCoBranded}
            financialProfile={profile}
            onSaveLead={handleSaveLead}
            isOpen={isLeadBotOpen}
            onClose={() => {
              setLeadBotSourceContext(undefined);
              setIsLeadBotOpen(false);
            }}
            onOpen={() => setIsLeadBotOpen(true)}
          />
        </React.Suspense>
      )}


      {/* Telemetry Diagnostics Modal */}
      <TelemetryDiagnosticsModal
        isOpen={showTelemetryModal}
        onClose={() => setShowTelemetryModal(false)}
        isMikeFordAdmin={guidesState.loanOfficer?.name === "Mike Ford" || guidesState.loanOfficer?.id === "lo-mike-ford"}
      />

      {/* Privacy Policy & TCPA Disclosures Modal */}
      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />

      {/* AI Error Whisperer & IT Code Fix Widget */}
      <ErrorWhispererWidget />

      {/* Global Toast Notification Banner */}
      {globalToast && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-[#2D362E] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500/30 animate-in fade-in slide-in-from-bottom-3 pointer-events-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="text-xs font-bold">{globalToast}</span>
        </div>
      )}
    </div>
    </>
  );
}
