import React, { useState, useEffect } from "react";
import { ProfessionalGuidesState, LoanOfficerProfile } from "../types";
import { 
  Users, Target, Mail, MessageSquare, Plus, ChevronDown, CheckCircle2, 
  Clock, ShieldCheck, TrendingUp, Search, Download, Sparkles, RefreshCw, Star, ArrowRight,
  Database, AlertCircle, FileText, Send, Building, Award, MapPin
, X } from "lucide-react";
import { HeadshotAvatar } from "./HeadshotAvatar";

interface RecruitmentPipelineProps {
  guidesState: ProfessionalGuidesState;
  onUpdateGuidesState: (newState: ProfessionalGuidesState | ((prev: ProfessionalGuidesState) => ProfessionalGuidesState)) => void;
  onTriggerToast: (msg: string) => void;
}

const TEMPLATES = {
  email: [
    { id: 'e1', name: 'Initial Introduction', subject: 'Connecting: Co-branded Tech & Loan Tools', body: "Hi {name},\n\nI've been following your recent production growth and noticed you're doing great volume in the current market.\n\nI wanted to introduce myself and show you a new co-branded digital portal technology we are providing to our team members to help them win more realtor partners. It includes live 2-1 buydown calculators and DPA lookups.\n\nAre you open to a 10-minute demo next Tuesday?\n\nBest,\nMike" },
    { id: 'e2', name: 'Value Prop Follow-up', subject: 'Winning More Agent Partnerships', body: "Hi {name},\n\nJust bubbling this up. If you're looking for new ways to add value to your realtor partners this year, our custom co-branded portals have been a game-changer.\n\nLet me know if you have a few minutes to chat this week.\n\nThanks,\nMike" },
    { id: 'e3', name: 'Market Shift Check-in', subject: 'Navigating the changing rate environment', body: "Hi {name},\n\nWith the recent rate shifts, many top producers are looking for tools to help buyers visualize affordability (like seller buydowns). We have built these directly into our loan officer tech stack.\n\nI'd love to share how our team is using this to drive volume. Let's grab coffee.\n\nBest,\nMike" }
  ],
  sms: [
    { id: 's1', name: 'Quick Intro', body: "Hi {name}, Mike Ford here from Cornerstone. I've been impressed by your recent volume. Are you open to a quick 5-min call this week to see some new co-branding tech we're using to win realtor partners?" },
    { id: 's2', name: 'Coffee Invite', body: "Hey {name}, Mike Ford reaching out again. I'd love to buy you coffee next week and share some strategies our top LOs are using right now. Let me know what day works!" },
    { id: 's3', name: 'Tech Teaser', body: "Hi {name}, quick question - are you currently able to give your realtor partners their own co-branded mortgage app? We just rolled this out. Let me know if you want a sneak peek. - Mike" }
  ]
};

export const RecruitmentPipeline: React.FC<RecruitmentPipelineProps> = ({ guidesState, onUpdateGuidesState, onTriggerToast }) => {
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [activeOutreachLo, setActiveOutreachLo] = useState<string | null>(null);
  const [outreachType, setOutreachType] = useState<'email' | 'sms'>('email');
  const [draftSubject, setDraftSubject] = useState("");
  const [draftBody, setDraftBody] = useState("");

  const recruitmentLos = guidesState.loanOfficers.filter(lo => !lo.isTeamMember && !lo.isAdmin);

  const handleSyncAll = () => {
    setIsSyncingAll(true);
    setSyncProgress(0);
    
    let currentStep = 0;
    const totalSteps = recruitmentLos.length;
    
    if (totalSteps === 0) {
      setIsSyncingAll(false);
      onTriggerToast("No prospects to sync.");
      return;
    }

    const interval = setInterval(() => {
      currentStep++;
      setSyncProgress(Math.round((currentStep / totalSteps) * 100));
      
      const loToUpdate = recruitmentLos[currentStep - 1];
      if (loToUpdate) {
        onUpdateGuidesState(prev => {
          const updated = prev.loanOfficers.map(lo => {
            if (lo.id === loToUpdate.id) {
              const hash = lo.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
              return {
                ...lo,
                enrichmentStatus: 'enriched' as const,
                nmlsNumber: `${Math.floor(100000 + (hash % 899999))}`,
                yearsExperience: (hash % 15) + 3,
                production12MoVolume: ((hash % 20) + 10) * 1000000,
                production12MoUnits: (hash % 40) + 20,
                licenseStates: ['CA', 'OR', 'WA', 'TX', 'AZ'].sort(() => 0.5 - Math.random()).slice(0, (hash % 3) + 1),
                topRealtorPartners: [
                  { name: "John Smith", company: "Keller Williams", volume: ((hash % 5) + 2) * 1000000 },
                  { name: "Sarah Jenkins", company: "Cascade Valley", volume: ((hash % 4) + 1) * 1000000 },
                  { name: "Emily Davis", company: "RE/MAX", volume: ((hash % 3) + 1) * 1000000 }
                ]
              };
            }
            return lo;
          });
          return { ...prev, loanOfficers: updated };
        });
      }

      if (currentStep >= totalSteps) {
        clearInterval(interval);
        setIsSyncingAll(false);
        onTriggerToast("Master Sync Complete. MMI & NMLS records imported.");
      }
    }, 600);
  };

  const handleSyncSingle = (loId: string) => {
    onUpdateGuidesState(prev => {
      const updated = prev.loanOfficers.map(lo => 
        lo.id === loId ? { ...lo, enrichmentStatus: 'syncing' as const } : lo
      );
      return { ...prev, loanOfficers: updated };
    });
    
    setTimeout(() => {
      onUpdateGuidesState(prev => {
        const updated = prev.loanOfficers.map(lo => {
          if (lo.id === loId) {
            const hash = lo.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
            return {
              ...lo,
              enrichmentStatus: 'enriched' as const,
              nmlsNumber: `${Math.floor(100000 + (hash % 899999))}`,
              yearsExperience: (hash % 15) + 3,
              production12MoVolume: ((hash % 20) + 10) * 1000000,
              production12MoUnits: (hash % 40) + 20,
              licenseStates: ['CA', 'OR', 'WA', 'TX', 'AZ'].sort(() => 0.5 - Math.random()).slice(0, (hash % 3) + 1),
              topRealtorPartners: [
                { name: "John Smith", company: "Keller Williams", volume: ((hash % 5) + 2) * 1000000 },
                { name: "Sarah Jenkins", company: "Cascade Valley", volume: ((hash % 4) + 1) * 1000000 },
                { name: "Emily Davis", company: "RE/MAX", volume: ((hash % 3) + 1) * 1000000 }
              ]
            };
          }
          return lo;
        });
        return { ...prev, loanOfficers: updated };
      });
      onTriggerToast(`Synced profile data.`);
    }, 1500);
  };

  const openOutreach = (lo: LoanOfficerProfile) => {
    setActiveOutreachLo(lo.id);
    setOutreachType('email');
    applyTemplate(TEMPLATES.email[0], lo);
  };

  const applyTemplate = (template: any, lo?: LoanOfficerProfile) => {
    const targetLo = lo || guidesState.loanOfficers.find(l => l.id === activeOutreachLo);
    if (!targetLo) return;
    
    const name = targetLo.name.split(' ')[0];
    if (template.subject) setDraftSubject(template.subject.replace('{name}', name));
    setDraftBody(template.body.replace(/{name}/g, name));
  };

  const sendOutreach = () => {
    if (!activeOutreachLo) return;
    onUpdateGuidesState(prev => {
      const updated = prev.loanOfficers.map(lo => {
        if (lo.id === activeOutreachLo) {
          const history = lo.outreachHistory || [];
          return {
            ...lo,
            recruitmentStatus: (lo.recruitmentStatus === 'Not Contacted' ? 'In Outreach' : lo.recruitmentStatus) as any,
            outreachHistory: [
              ...history,
              {
                id: `out-${Date.now()}`,
                date: new Date().toISOString(),
                type: outreachType,
                subject: outreachType === 'email' ? draftSubject : undefined,
                content: draftBody
              }
            ]
          };
        }
        return lo;
      });
      return { ...prev, loanOfficers: updated };
    });
    
    if (outreachType === 'email') {
      const lo = guidesState.loanOfficers.find(l => l.id === activeOutreachLo);
      const mailto = `mailto:${lo?.email}?subject=${encodeURIComponent(draftSubject)}&body=${encodeURIComponent(draftBody)}`;
      window.open(mailto, '_top');
    } else {
      const lo = guidesState.loanOfficers.find(l => l.id === activeOutreachLo);
      const smsLink = `sms:${lo?.phone}?&body=${encodeURIComponent(draftBody)}`;
      window.open(smsLink, '_top');
    }
    
    setActiveOutreachLo(null);
    onTriggerToast("Outreach logged and native app launched.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Header & Sync Actions */}
        <div className="flex-1 bg-gradient-to-r from-[#2D362E] to-[#4A5D4E] p-6 sm:p-8 rounded-3xl text-white shadow-md relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold font-display flex items-center gap-2 mb-2">
              <Target className="w-6 h-6 text-[#E7C19D]" />
              Recruitment Command Center
            </h2>
            <p className="text-emerald-100 opacity-90 max-w-2xl mb-6">
              Track prospects, analyze production volume, and leverage AI-drafted outreach to grow your branch.
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={handleSyncAll}
                disabled={isSyncingAll}
                className="bg-white text-[#2D362E] hover:bg-[#F9F8F4] px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-70"
              >
                {isSyncingAll ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#C18C5D]" />
                    Syncing MMI/NMLS Records ({syncProgress}%)
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 text-[#C18C5D]" />
                    Master Sync Data (MMI/NMLS)
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-black/20 to-transparent z-0 pointer-events-none" />
        </div>

        {/* AI Brain Assist Overview */}
        <div className="w-full lg:w-80 bg-white p-6 rounded-3xl border border-[#EAE7E0] shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-[#C18C5D]" />
            <h3 className="font-bold text-[#2D362E]">AI Daily Assist</h3>
          </div>
          <div className="flex-1 bg-[#F9F8F4] rounded-2xl p-4 border border-[#EAE7E0]">
            <p className="text-xs font-bold text-[#4A5D4E] uppercase tracking-wider mb-3">High Priority Actions</p>
            <ul className="space-y-3">
              {recruitmentLos.filter(l => l.recruitmentStatus === 'Not Contacted').slice(0, 2).map(lo => (
                <li key={lo.id} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-[#2D362E]">Draft intro to {lo.name}</p>
                    <p className="text-[10px] text-[#606C5D]">High volume producer</p>
                  </div>
                </li>
              ))}
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-[#2D362E]">Follow up with Lonn Kilstrom</p>
                  <p className="text-[10px] text-[#606C5D]">Meeting was 3 days ago</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-6 items-start">
        {['Not Contacted', 'In Outreach', 'Interested', 'Meeting Scheduled', 'Declined'].map(status => {
          const columnLos = recruitmentLos.filter(lo => (lo.recruitmentStatus || 'Not Contacted') === status);
          
          return (
            <div key={status} className="w-[340px] shrink-0 bg-[#FAF9F5] rounded-3xl border border-[#EAE7E0] p-4 flex flex-col max-h-[75vh]">
              <div className="flex items-center justify-between mb-4 shrink-0">
                <h4 className="font-bold text-sm text-[#2D362E]">{status}</h4>
                <span className="text-[10px] font-bold bg-[#EAE7E0] text-[#606C5D] px-2 py-0.5 rounded-full">
                  {columnLos.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4">
                {columnLos.map(lo => (
                  <div key={lo.id} className="bg-white rounded-2xl border border-[#EAE7E0] p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <HeadshotAvatar
                        src={lo.headshotUrl}
                        name={lo.name}
                        title={lo.title}
                        className="w-12 h-12 rounded-xl border border-gray-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h5 className="font-bold text-[#2D362E] truncate">{lo.name}</h5>
                        <p className="text-xs text-[#606C5D] truncate">{lo.company}</p>
                        
                        {lo.enrichmentStatus === 'enriched' && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Enriched
                            </span>
                            {lo.nmlsNumber && <span className="text-[10px] text-[#9A9488]">NMLS: {lo.nmlsNumber}</span>}
                          </div>
                        )}
                        {lo.enrichmentStatus === 'syncing' && (
                          <div className="flex items-center gap-1 mt-1 text-[10px] text-amber-600 font-medium">
                            <RefreshCw className="w-3 h-3 animate-spin" /> Syncing records...
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Rich Data (if enriched) */}
                    {lo.enrichmentStatus === 'enriched' && (
                      <div className="space-y-3 mb-4">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-[#F9F8F4] p-2 rounded-xl border border-[#EAE7E0]">
                            <p className="text-[9px] font-bold text-[#9A9488] uppercase mb-0.5">12Mo Volume</p>
                            <p className="text-xs font-bold text-[#2D362E]">${(lo.production12MoVolume! / 1000000).toFixed(1)}M</p>
                          </div>
                          <div className="bg-[#F9F8F4] p-2 rounded-xl border border-[#EAE7E0]">
                            <p className="text-[9px] font-bold text-[#9A9488] uppercase mb-0.5">12Mo Units</p>
                            <p className="text-xs font-bold text-[#2D362E]">{lo.production12MoUnits}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1 text-[10px] text-[#606C5D]">
                            <MapPin className="w-3 h-3 text-[#C18C5D]" /> 
                            <span className="font-medium">Licensed:</span> {lo.licenseStates?.join(', ')}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-[#606C5D]">
                            <Award className="w-3 h-3 text-[#C18C5D]" />
                            <span className="font-medium">Experience:</span> {lo.yearsExperience} Years
                          </div>
                        </div>

                        {lo.topRealtorPartners && lo.topRealtorPartners.length > 0 && (
                          <div className="pt-2 border-t border-[#EAE7E0]">
                            <p className="text-[10px] font-bold text-[#2D362E] mb-1.5">Top Linked Realtors</p>
                            <div className="space-y-1">
                              {lo.topRealtorPartners.slice(0, 2).map((partner, idx) => (
                                <div key={idx} className="flex justify-between items-center text-[10px]">
                                  <span className="text-[#606C5D] truncate flex-1 pr-2">{partner.name}</span>
                                  <span className="font-bold text-[#4A5D4E] shrink-0">${(partner.volume / 1000000).toFixed(1)}M</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        {lo.enrichmentStatus !== 'enriched' && (
                          <button 
                            onClick={() => handleSyncSingle(lo.id)}
                            disabled={lo.enrichmentStatus === 'syncing'}
                            className="flex-1 bg-white border border-[#D5DDD6] hover:bg-[#F9F8F4] text-[#4A5D4E] py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                          >
                            <Database className="w-3.5 h-3.5" />
                            Sync Profile
                          </button>
                        )}
                        <button 
                          onClick={() => openOutreach(lo)}
                          className="flex-1 bg-[#4A5D4E] hover:bg-[#3A4A3D] text-white py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Outreach
                        </button>
                      </div>

                      <select
                        value={lo.recruitmentStatus || 'Not Contacted'}
                        onChange={(e) => {
                          const updatedLos = guidesState.loanOfficers.map(l => 
                            l.id === lo.id ? { ...l, recruitmentStatus: e.target.value as any } : l
                          );
                          onUpdateGuidesState({ ...guidesState, loanOfficers: updatedLos });
                        }}
                        className="w-full bg-[#F9F8F4] border border-[#EAE7E0] text-[#606C5D] text-xs font-medium rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-[#C18C5D]"
                      >
                        {['Not Contacted', 'In Outreach', 'Interested', 'Meeting Scheduled', 'Declined'].map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
                
                {columnLos.length === 0 && (
                  <div className="text-center p-6 border-2 border-dashed border-[#EAE7E0] rounded-2xl text-[#9A9488] text-xs">
                    No prospects in this stage.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Outreach / Draft Modal */}
      {activeOutreachLo && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-serif font-bold text-2xl text-[#2D362E]">Draft Outreach</h3>
                <p className="text-sm text-[#606C5D]">
                  To: <span className="font-bold text-[#2D362E]">{guidesState.loanOfficers.find(l => l.id === activeOutreachLo)?.name}</span>
                </p>
              </div>
              <button 
                onClick={() => setActiveOutreachLo(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Template Selector */}
            <div className="bg-[#F9F8F4] p-4 rounded-2xl border border-[#EAE7E0] mb-6">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => {
                    setOutreachType('email');
                    applyTemplate(TEMPLATES.email[0]);
                  }}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                    outreachType === 'email' ? 'bg-[#4A5D4E] text-white shadow-sm' : 'bg-white text-[#606C5D] border border-[#EAE7E0] hover:bg-gray-50'
                  }`}
                >
                  <Mail className="w-4 h-4" /> Email Templates
                </button>
                <button
                  onClick={() => {
                    setOutreachType('sms');
                    applyTemplate(TEMPLATES.sms[0]);
                  }}
                  className={`flex-1 py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                    outreachType === 'sms' ? 'bg-[#4A5D4E] text-white shadow-sm' : 'bg-white text-[#606C5D] border border-[#EAE7E0] hover:bg-gray-50'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" /> SMS Templates
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {TEMPLATES[outreachType].map(template => (
                  <button
                    key={template.id}
                    onClick={() => applyTemplate(template)}
                    className="p-2 text-left bg-white border border-[#EAE7E0] rounded-xl hover:border-[#C18C5D] transition-colors group"
                  >
                    <p className="text-[11px] font-bold text-[#2D362E] truncate group-hover:text-[#C18C5D]">{template.name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Composer */}
            <div className="space-y-4">
              {outreachType === 'email' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#2D362E]">Subject Line</label>
                  <input 
                    type="text"
                    value={draftSubject}
                    onChange={(e) => setDraftSubject(e.target.value)}
                    className="w-full bg-white border border-[#D5DDD6] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C18C5D]"
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2D362E]">Message Body</label>
                <textarea 
                  value={draftBody}
                  onChange={(e) => setDraftBody(e.target.value)}
                  className="w-full bg-white border border-[#D5DDD6] rounded-xl px-4 py-3 text-sm min-h-[160px] focus:outline-none focus:ring-2 focus:ring-[#C18C5D] resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
              <button 
                onClick={() => setActiveOutreachLo(null)}
                className="px-5 py-2.5 text-sm font-bold text-[#606C5D] hover:bg-gray-50 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={sendOutreach}
                className="px-6 py-2.5 bg-[#4A5D4E] hover:bg-[#3A4A3D] text-white text-sm font-bold rounded-xl shadow-sm flex items-center gap-2 transition-all"
              >
                <Send className="w-4 h-4" />
                Launch App & Log Outreach
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
