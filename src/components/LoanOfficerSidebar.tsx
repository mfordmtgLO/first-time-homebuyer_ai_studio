import React, { useState } from "react";
import { 
  Inbox, 
  Brain, 
  Calculator, 
  Percent, 
  Users, 
  ShieldCheck, 
  MessageSquare, 
  Target, 
  Link, 
  UserCheck, 
  Award, 
  Sparkles, 
  Globe, 
  Edit3, 
  Share2, 
  PieChart, 
  TrendingUp, 
  Key, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp,
  Folder,
  Layers,
  Zap,
  Building,
  CheckCircle2,
  Calendar,
  PanelLeftClose,
  PanelRightClose
} from "lucide-react";
import { AIDailyRhythmCard } from "./AIDailyRhythmCard";
import { LoanOfficerProfile, ProfessionalGuidesState } from "../types";

export type TabId = 
  | "leads" 
  | "master_lead_journey"
  | "google_workspace" 
  | "ai_2nd_brain" 
  | "tax_schedule_c" 
  | "buydown_2_1" 
  | "realtor_cobranding" 
  | "scenario_workbench" 
  | "sms_compliance" 
  | "sms_templates" 
  | "team_distribution" 
  | "recruitment_pipeline" 
  | "pairings" 
  | "realtor_roster" 
  | "dpa_grants" 
  | "ai_partner_campaign" 
  | "geosphere_sync" 
  | "my_profile" 
  | "social_push" 
  | "ad_campaigns" 
  | "system_pitch_deck" 
  | "branch_admin_metrics" 
  | "growth_dashboard";

export interface NavCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  requiresAdmin?: boolean;
  items: {
    id: TabId;
    label: string;
    icon: React.ReactNode;
    badge?: string;
    badgeColor?: string;
    requiresAdmin?: boolean;
    urgentBadge?: boolean;
  }[];
}

interface LoanOfficerSidebarProps {
  activeTab: TabId;
  onSelectTab: (tabId: TabId) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  currentLo: LoanOfficerProfile;
  guidesState: ProfessionalGuidesState;
  isAdminUser: boolean;
  onOpenDailyReview: () => void;
  workspaceConnected?: boolean;
}

export const LoanOfficerSidebar: React.FC<LoanOfficerSidebarProps> = ({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  currentLo,
  guidesState,
  isAdminUser,
  onOpenDailyReview,
  workspaceConnected = false
}) => {
  // Category Collapsible state in expanded mode
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({
    marketing: false // keep open by default
  });

  const toggleCategory = (catId: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  const navCategories: NavCategory[] = [
    {
      id: "pipeline",
      title: "Pipeline & Buyer CRM",
      icon: <Inbox className="w-3.5 h-3.5 text-[#C18C5D]" />,
      items: [
        {
          id: "leads",
          label: "Buyer Leads & CRM",
          icon: <Inbox className="w-4 h-4" />,
          badge: `${guidesState.leads?.length || 0}`,
          badgeColor: "bg-[#4A5D4E]/15 text-[#2D362E]"
        },
        {
          id: "master_lead_journey",
          label: "Master Lead Journey",
          icon: <Layers className="w-4 h-4" />
        },
        {
          id: "google_workspace",
          label: "Google Workspace Hub",
          icon: (
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          ),
          badge: workspaceConnected ? "Connected" : "Sync",
          badgeColor: workspaceConnected ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
        },
        {
          id: "scenario_workbench",
          label: "Scenario Workbench",
          icon: <Calculator className="w-4 h-4" />,
          badge: "Scenarios",
          badgeColor: "bg-amber-100 text-amber-900"
        },
        {
          id: "sms_compliance",
          label: "SMS Compliance & Opt-in",
          icon: <ShieldCheck className="w-4 h-4" />,
          badge: `${(guidesState.leads || []).filter(l => l.smsConsentAuthorized).length}`,
          badgeColor: "bg-emerald-100 text-emerald-800"
        },
        {
          id: "sms_templates",
          label: "SMS Nurture Library",
          icon: <MessageSquare className="w-4 h-4" />,
          badge: `${guidesState.smsTemplates?.length || 0}`,
          badgeColor: "bg-[#F4F1EA] text-[#606C5D]"
        }
      ]
    },
    {
      id: "underwriting",
      title: "Underwriting & Financial",
      icon: <Brain className="w-3.5 h-3.5 text-[#C18C5D]" />,
      items: [
        {
          id: "ai_2nd_brain",
          label: "AI 2nd Brain Copilot",
          icon: <Brain className="w-4 h-4" />,
          badge: "Vantage",
          badgeColor: "bg-emerald-100 text-emerald-800"
        },
        {
          id: "tax_schedule_c",
          label: "Schedule C Tax Analyzer",
          icon: <Calculator className="w-4 h-4" />,
          badge: "1084",
          badgeColor: "bg-amber-100 text-amber-900"
        },
        {
          id: "buydown_2_1",
          label: "2-1 Buydown Engine",
          icon: <Percent className="w-4 h-4" />,
          badge: "Credits",
          badgeColor: "bg-orange-100 text-orange-900"
        },
        {
          id: "dpa_grants",
          label: "DPA & State Grants",
          icon: <Award className="w-4 h-4" />,
          badge: "50 States",
          badgeColor: "bg-amber-100 text-amber-900"
        }
      ]
    },
    {
      id: "realtor",
      title: "Realtor Partner Growth",
      icon: <Users className="w-3.5 h-3.5 text-[#C18C5D]" />,
      items: [
        {
          id: "realtor_cobranding",
          label: "Co-Branding Command Hub",
          icon: <Users className="w-4 h-4" />,
          badge: `${guidesState.agentRoster?.length || 0}`,
          badgeColor: "bg-emerald-100 text-emerald-800"
        },
        {
          id: "realtor_roster",
          label: "Realtor Partner Roster",
          icon: <UserCheck className="w-4 h-4" />,
          badge: `${guidesState.agentRoster?.length || 0}`
        },
        {
          id: "pairings",
          label: "LO + Agent Pairings",
          icon: <Link className="w-4 h-4" />,
          badge: `${guidesState.pairings?.length || 0}`
        },
        {
          id: "ai_partner_campaign",
          label: "AI Partner Outreach",
          icon: <Sparkles className="w-4 h-4" />,
          badge: "Recruit",
          badgeColor: "bg-amber-100 text-amber-900"
        }
      ]
    },
    {
      id: "branch",
      title: "Branch Admin & Recruiting",
      icon: <Building className="w-3.5 h-3.5 text-[#C18C5D]" />,
      items: [
        {
          id: "branch_admin_metrics",
          label: "Branch Manager Admin",
          icon: <ShieldCheck className="w-4 h-4" />,
          badge: "Admin",
          badgeColor: "bg-amber-500 text-white",
          requiresAdmin: true
        },
        {
          id: "growth_dashboard",
          label: "Growth & Production Metrics",
          icon: <TrendingUp className="w-4 h-4" />,
          badge: "Pacing"
        },
        {
          id: "team_distribution",
          label: "Team LO Roster & Pacing",
          icon: <Users className="w-4 h-4" />,
          badge: `${guidesState.loanOfficers?.length || 0}`,
          requiresAdmin: true,
          urgentBadge: guidesState.loanOfficers.some(l => !l.isAdmin && l.passwordResetRequestedAt && !l.passwordResetAuthorized)
        },
        {
          id: "recruitment_pipeline",
          label: "Recruitment Pipeline",
          icon: <Target className="w-4 h-4" />,
          badge: "NMLS",
          requiresAdmin: true
        }
      ]
    },
    {
      id: "marketing",
      title: "Marketing & Automation",
      icon: <Globe className="w-3.5 h-3.5 text-[#C18C5D]" />,
      items: [
        {
          id: "geosphere_sync",
          label: "GeoSphere Map Sync",
          icon: <Globe className="w-4 h-4" />,
          badge: `${guidesState.syncedProperties?.length || 6}`
        },
        {
          id: "ad_campaigns",
          label: "Meta & Google Ads Builder",
          icon: <Sparkles className="w-4 h-4" />,
          badge: "Ads",
          badgeColor: "bg-blue-100 text-blue-800"
        },
        {
          id: "social_push",
          label: "Social Push & Blasts",
          icon: <Share2 className="w-4 h-4" />
        },
        {
          id: "system_pitch_deck",
          label: "Pitch Deck & ROI Metrics",
          icon: <PieChart className="w-4 h-4" />
        },
        {
          id: "my_profile",
          label: "Edit My LO Profile",
          icon: <Edit3 className="w-4 h-4" />
        }
      ]
    }
  ];

  return (
    <aside 
      className={`relative shrink-0 flex flex-col bg-[#FDFBF7] border-r border-[#EAE7E0] transition-all duration-300 z-30 select-none ${
        isCollapsed ? "w-[68px]" : "w-64 lg:w-72"
      }`}
      aria-label="Loan Officer Portal Navigation"
    >
      {/* 0. SIDEBAR HEADER WITH TOGGLE */}
      <div className={`p-2 border-b border-[#EAE7E0]/80 bg-[#FDFBF7] flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <span className="text-[10px] font-bold tracking-wider uppercase text-[#4A5D4E] px-2 py-0.5 rounded-full bg-[#F1EFE9] border border-[#EAE7E0] self-start">
            Dashboard
          </span>
        )}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-1 rounded-lg bg-white hover:bg-[#F1EFE9] border border-[#EAE7E0] text-[#606C5D] hover:text-[#2D362E] transition-all cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
          title={isCollapsed ? "Expand Sidebar (Cmd+B)" : "Collapse Sidebar (Cmd+B)"}
        >
          {isCollapsed ? <PanelRightClose className="w-4 h-4 text-[#4A5D4E]" /> : <PanelLeftClose className="w-4 h-4 text-[#4A5D4E]" />}
          {!isCollapsed && <span className="text-[10px] text-[#606C5D]">Collapse</span>}
        </button>
      </div>

      {/* 1. STICKY TOP: AI DAILY RHYTHM CARD ("Focus & Flow" Instructor) */}
      <AIDailyRhythmCard
        key={currentLo.id}
        isSidebarCollapsed={isCollapsed}
        currentLo={currentLo}
        leads={guidesState.leads || []}
        isAdminUser={Boolean(currentLo.isAdmin || currentLo.id === guidesState.adminLoanOfficerId)}
        onOpenDailyReview={onOpenDailyReview}
        onSelectTab={onSelectTab}
      />

      {/* 2. SCROLLABLE NAVIGATION DIRECTORY */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4 dashboard-vertical-scrollbar">
        {navCategories.map(category => {
          // Filter items based on user admin status
          const visibleItems = category.items.filter(item => {
            if (item.requiresAdmin && !isAdminUser) return false;
            return true;
          });

          if (visibleItems.length === 0) return null;

          const isCatCollapsed = collapsedCategories[category.id] && !isCollapsed;

          return (
            <div key={category.id} className="space-y-1">
              {/* Category Header (Expanded Mode) */}
              {!isCollapsed ? (
                <button
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center justify-between px-2.5 py-1 text-[11px] font-bold tracking-wider text-[#7D8877] uppercase hover:text-[#2D362E] transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    {category.icon}
                    <span className="truncate">{category.title}</span>
                  </div>
                  <span className="text-[#C4BEB5] group-hover:text-[#606C5D] transition-colors">
                    {isCatCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                  </span>
                </button>
              ) : (
                /* Collapsed Icon-Rail Category Divider */
                <div className="w-6 mx-auto my-1 border-t border-[#EAE7E0]" />
              )}

              {/* Items in Category */}
              {(!isCatCollapsed || isCollapsed) && (
                <div className="space-y-0.5">
                  {visibleItems.map(item => {
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        data-tab-id={item.id}
                        onClick={() => onSelectTab(item.id)}
                        title={isCollapsed ? `${item.label} (${category.title})` : undefined}
                        className={`w-full flex items-center rounded-xl text-xs font-medium transition-all cursor-pointer relative group ${
                          isCollapsed 
                            ? "justify-center p-2.5" 
                            : "justify-between px-3 py-2"
                        } ${
                          isActive
                            ? "bg-[#2D362E] text-white font-bold shadow-xs"
                            : "text-[#606C5D] hover:bg-[#F4F1EA] hover:text-[#2D362E]"
                        }`}
                      >
                        {/* Icon & Label */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`shrink-0 transition-transform ${
                            isActive ? "text-[#E7C19D]" : "text-[#7D8877] group-hover:text-[#2D362E]"
                          }`}>
                            {item.icon}
                          </span>
                          {!isCollapsed && (
                            <span className="truncate text-left">
                              {item.label}
                            </span>
                          )}
                        </div>

                        {/* Badges (Expanded Mode) */}
                        {!isCollapsed && (
                          <div className="flex items-center gap-1 shrink-0 ml-1.5">
                            {item.urgentBadge && (
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                            )}
                            {item.badge && (
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                                isActive 
                                  ? "bg-white/20 text-white" 
                                  : item.badgeColor || "bg-[#F4F1EA] text-[#606C5D] border border-[#EAE7E0]"
                              }`}>
                                {item.badge}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Hover Tooltip in Collapsed Rail Mode */}
                        {isCollapsed && (
                          <div className="absolute left-full ml-2.5 px-2.5 py-1 bg-[#2D362E] text-white text-xs font-bold rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                            {item.label}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 3. BOTTOM FOOTER BAR: USER PROFILE */}
      <div className={`p-2.5 border-t border-[#EAE7E0] bg-white flex items-center ${isCollapsed ? "justify-center" : "gap-2"}`}>
        <img
          src={currentLo.avatarUrl || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256"}
          alt={currentLo.name}
          className="w-7 h-7 rounded-xl object-cover border border-[#EAE7E0] shrink-0"
        />
        {!isCollapsed && (
          <div className="min-w-0 flex-1">
            <p className="font-bold text-xs text-[#2D362E] truncate">
              {currentLo.name}
            </p>
            <p className="text-[10px] text-[#7D8877] truncate">
              {isAdminUser ? "Branch Manager" : "Loan Officer"}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};
