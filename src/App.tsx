import React, { useState, useEffect } from "react";
import { Compass, ShieldCheck } from "lucide-react";
import { Navbar } from "./components/Navbar";
import { StepNavigationBanner } from "./components/StepNavigationBanner";
import { HeroWebsite } from "./components/HeroWebsite";
import { InstantAffordabilityCalculator } from "./components/InstantAffordabilityCalculator";
import { RoadmapView } from "./components/RoadmapView";
import { GrantFinder } from "./components/GrantFinder";
import { DashboardOverview } from "./components/DashboardOverview";
import { PropertyTracker } from "./components/PropertyTracker";
import { TourScorecardModal } from "./components/TourScorecardModal";
import { NewPropertyModal } from "./components/NewPropertyModal";
import { MortgageLab } from "./components/MortgageLab";
import { AICopilot } from "./components/AICopilot";
import { EscrowTracker } from "./components/EscrowTracker";
import { Step4AIScenarioSummary } from "./components/Step4AIScenarioSummary";
import { LoanOfficerPortal } from "./components/LoanOfficerPortal";
import { LeadIntakeChatbot } from "./components/LeadIntakeChatbot";
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
import { 
  FinancialProfile, 
  PropertyListing, 
  RoadmapMilestone, 
  DocumentItem, 
  ProfessionalGuidesState,
  CapturedLead
} from "./types";

export default function App() {
  const [currentMode, setCurrentMode] = useState<"website" | "dashboard">("website");
  const [activeTab, setActiveTab] = useState<string>("hero");
  const [isLeadBotOpen, setIsLeadBotOpen] = useState<boolean>(false);

  // Global State
  const [profile, setProfile] = useState<FinancialProfile>(INITIAL_PROFILE);
  const [properties, setProperties] = useState<PropertyListing[]>(INITIAL_PROPERTIES);
  const [milestones, setMilestones] = useState<RoadmapMilestone[]>(ROADMAP_MILESTONES);
  const [documents, setDocuments] = useState<DocumentItem[]>(DOCUMENT_VAULT_ITEMS);

  // Loan Officer & Local Professional Guides State
  const [guidesState, setGuidesState] = useState<ProfessionalGuidesState>(() => {
    try {
      const saved = localStorage.getItem("homebuyer_roadmap_state_v2") || localStorage.getItem("manus_guides_state_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.loanOfficers && parsed.pairings) {
          if (!parsed.leads) {
            parsed.leads = INITIAL_LEADS;
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Could not load saved guides state:", e);
    }
    return {
      currentUserId: DEFAULT_LOAN_OFFICER.id,
      adminLoanOfficerId: DEFAULT_LOAN_OFFICER.id,
      loanOfficers: INITIAL_TEAM_LOAN_OFFICERS,
      loanOfficer: DEFAULT_LOAN_OFFICER,
      agentRoster: INITIAL_AGENT_ROSTER,
      activeAgentId: INITIAL_AGENT_ROSTER[0].id,
      pairings: INITIAL_PAIRINGS,
      socialCampaigns: INITIAL_SOCIAL_CAMPAIGNS,
      adCampaignDrafts: INITIAL_AD_DRAFTS,
      leads: INITIAL_LEADS
    };
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("homebuyer_roadmap_state_v2", JSON.stringify(guidesState));
    } catch (e) {
      console.warn("Error saving guides state to localStorage:", e);
    }
  }, [guidesState]);

  // LO Hub & Modals State
  const [showLoPortal, setShowLoPortal] = useState<boolean>(false);
  const [scorecardProperty, setScorecardProperty] = useState<PropertyListing | null>(null);
  const [showNewPropertyModal, setShowNewPropertyModal] = useState<boolean>(false);

  // Check URL params for partner link or LO access
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const loParam = params.get("lo");
    const agentParam = params.get("agent");
    const pairParam = params.get("pair");

    setGuidesState(prev => {
      let updatedLo = prev.loanOfficer;
      let updatedAgentId = prev.activeAgentId;

      if (loParam) {
        const matchedLo = prev.loanOfficers.find(l => l.id === loParam || l.customSlug === loParam);
        if (matchedLo) updatedLo = matchedLo;
      }

      if (agentParam) {
        const matchedAgent = prev.agentRoster.find(a => a.id === agentParam || a.customSlug === agentParam);
        if (matchedAgent) updatedAgentId = matchedAgent.id;
      }

      if (pairParam) {
        const matchedPair = prev.pairings.find(p => p.id === pairParam || p.customSlug === pairParam);
        if (matchedPair) {
          const pairLo = prev.loanOfficers.find(l => l.id === matchedPair.loId);
          if (pairLo) updatedLo = pairLo;
          updatedAgentId = matchedPair.agentId;
        }
      }

      return {
        ...prev,
        loanOfficer: updatedLo,
        activeAgentId: updatedAgentId
      };
    });

    if (params.get("portal") === "lo" || params.get("admin") === "lo") {
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

  return (
    <div className="min-h-screen bg-[#F9F8F4] text-[#2D362E] flex flex-col selection:bg-[#C18C5D]/25 selection:text-[#2D362E] font-sans antialiased">
      {/* Top Fixed Navigation */}
      <Navbar
        currentTab={activeTab}
        setCurrentTab={setActiveTab}
        activeMode={currentMode}
        setActiveMode={setCurrentMode}
        profile={profile}
        setProfile={setProfile}
        savedCount={properties.length}
        onOpenLoPortal={() => setShowLoPortal(true)}
        onOpenLeadBot={() => setIsLeadBotOpen(true)}
        loName={guidesState.loanOfficer.name}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">
        {/* Step Navigation Banner */}
        {!showLoPortal && (
          <StepNavigationBanner
            currentTab={activeTab}
            currentMode={currentMode}
            onNavigate={handleNavigate}
            loanOfficerName={guidesState.loanOfficer.name}
            activeAgentName={activeAgent.name}
          />
        )}

        {/* LOAN OFFICER PORTAL VIEW */}
        {showLoPortal ? (
          <LoanOfficerPortal
            guidesState={guidesState}
            onUpdateGuidesState={setGuidesState}
            onClose={() => setShowLoPortal(false)}
            onViewPublicSite={() => {
              setShowLoPortal(false);
              handleNavigate("hero", "website");
            }}
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
                    onOpenGrants={() => handleNavigate("grants", "website")}
                    onOpenStep4={() => handleNavigate("step4_ai_plan", "dashboard")}
                    onOpenLeadBot={() => setIsLeadBotOpen(true)}
                    loanOfficer={guidesState.loanOfficer}
                    activeAgent={activeAgent}
                    onOpenLoPortal={() => setShowLoPortal(true)}
                  />
                )}

                {(activeTab === "calculator" || (!["hero", "roadmap", "grants"].includes(activeTab))) && (
                  <InstantAffordabilityCalculator
                    profile={profile}
                    setProfile={setProfile}
                    onOpenAdvisor={() => handleNavigate("step4_ai_plan", "dashboard")}
                  />
                )}

                {activeTab === "roadmap" && (
                  <RoadmapView
                    milestones={milestones}
                    setMilestones={setMilestones}
                    onGoToDashboard={() => handleNavigate("dashboard", "dashboard")}
                  />
                )}

                {activeTab === "grants" && (
                  <GrantFinder />
                )}
              </div>
            )}

            {/* DASHBOARD MODE VIEWS */}
            {currentMode === "dashboard" && (
              <div>
                {(activeTab === "dashboard" || (!["step4_ai_plan", "properties", "mortgagelab", "ai_copilot", "escrow"].includes(activeTab))) && (
                  <DashboardOverview
                    profile={profile}
                    setProfile={setProfile}
                    properties={properties}
                    milestones={milestones}
                    documents={documents}
                    onNavigate={handleNavigate}
                    onOpenNewPropertyModal={() => setShowNewPropertyModal(true)}
                    loanOfficer={guidesState.loanOfficer}
                    activeAgent={activeAgent}
                    onOpenLoPortal={() => setShowLoPortal(true)}
                  />
                )}

                {activeTab === "step4_ai_plan" && (
                  <Step4AIScenarioSummary
                    profile={profile}
                    properties={properties}
                    loanOfficer={guidesState.loanOfficer}
                    activeAgent={activeAgent}
                    onNavigate={handleNavigate}
                    onOpenLoPortal={() => setShowLoPortal(true)}
                  />
                )}

                {activeTab === "properties" && (
                  <PropertyTracker
                    properties={properties}
                    setProperties={setProperties}
                    profile={profile}
                    onOpenScorecard={(prop) => setScorecardProperty(prop)}
                    onOpenNewModal={() => setShowNewPropertyModal(true)}
                    onAskAiAboutProperty={handleAskAiAboutProperty}
                  />
                )}

                {activeTab === "mortgagelab" && (
                  <MortgageLab profile={profile} />
                )}

                {activeTab === "ai_copilot" && (
                  <AICopilot
                    profile={profile}
                    properties={properties}
                  />
                )}

                {activeTab === "escrow" && (
                  <EscrowTracker />
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
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
            <button 
              id="footer-lo-portal-btn"
              onClick={() => setShowLoPortal(true)}
              className="text-xs text-[#9A9488] hover:text-[#4A5D4E] flex items-center gap-1.5 transition-colors border-l border-[#EAE7E0] pl-4 ml-1"
              title="Loan Officer & Real Estate Agent Management Portal (Shortcut: Alt+M or Ctrl+Alt+L)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#C18C5D]" />
              <span>LO / Partner Hub</span>
            </button>
          </div>

          <div className="text-center md:text-right text-[11px] text-[#9A9488]">
            <span>Powered by Gemini 3.7 Flash & Natural Tones</span>
            <div className="text-[#9A9488]/80 mt-0.5">Equal Housing Opportunity Awareness</div>
          </div>
        </div>
      </footer>

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

      {/* 24/7 AI Lead Intake & Pre-Approval Chatbot */}
      {!showLoPortal && (
        <LeadIntakeChatbot
          loanOfficer={guidesState.loanOfficer}
          agent={activeAgent}
          financialProfile={profile}
          onSaveLead={handleSaveLead}
          isOpen={isLeadBotOpen}
          onClose={() => setIsLeadBotOpen(false)}
          onOpen={() => setIsLeadBotOpen(true)}
        />
      )}
    </div>
  );
}

