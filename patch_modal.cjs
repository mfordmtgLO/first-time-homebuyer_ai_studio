const fs = require('fs');

let content = fs.readFileSync('src/components/RecruitingCampaignModal.tsx', 'utf-8');

// I will just rewrite the file fully to avoid complex regex
const newContent = `import React, { useState } from "react";
import { Sparkles, X, Mail, MessageSquare, Send, Calendar, Clock, Target, Play, BarChart3, Users, FastForward, CheckCircle2 } from "lucide-react";
import { LoanOfficerProfile, RecruitingCampaign } from "../types";

interface RecruitingCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLos: LoanOfficerProfile[];
  admin: LoanOfficerProfile;
  campaigns: RecruitingCampaign[];
  onDispatch: (campaignId: string) => void;
}

export const RecruitingCampaignModal: React.FC<RecruitingCampaignModalProps> = ({
  isOpen,
  onClose,
  selectedLos,
  admin,
  campaigns,
  onDispatch
}) => {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(campaigns[0]?.id || "");
  const [viewingStep, setViewingStep] = useState<number>(0);

  if (!isOpen) return null;

  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);

  const handleDispatch = () => {
    onDispatch(selectedCampaignId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-5xl w-full p-6 sm:p-8 space-y-5 border border-[#EAE7E0] shadow-2xl animate-in zoom-in-95 duration-150 text-[#2D362E] max-h-[90vh] flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#EAE7E0] pb-3 shrink-0 gap-4">
          <div>
            <h4 className="font-serif font-bold text-xl text-[#2D362E] flex items-center gap-2">
              <Target className="w-6 h-6 text-emerald-700" />
              Automated Recruiting Campaigns & Performance
            </h4>
            <p className="text-sm text-[#606C5D] mt-1">Enroll {selectedLos.length} selected Loan Officer(s) into a proven drip sequence.</p>
          </div>
          <button onClick={onClose} className="text-xs text-[#9A9488] hover:text-[#2D362E] self-start sm:self-center bg-[#F9F8F4] px-3 py-1.5 rounded-xl border border-[#EAE7E0]">
            ✕ Close
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-6">
          {/* Campaign Selection Column */}
          <div className="lg:w-1/3 flex flex-col gap-3 overflow-y-auto pr-2 border-r border-[#EAE7E0]">
            <h5 className="text-xs font-bold text-[#606C5D] uppercase tracking-wider sticky top-0 bg-white py-1">Select Playbook</h5>
            {campaigns.map(campaign => (
              <button
                key={campaign.id}
                onClick={() => { setSelectedCampaignId(campaign.id); setViewingStep(0); }}
                className={\`text-left p-4 rounded-2xl border transition-all \${
                  selectedCampaignId === campaign.id
                    ? "bg-[#FAF9F5] border-emerald-500 ring-1 ring-emerald-500/20"
                    : "bg-white border-[#EAE7E0] hover:border-[#D5DDD6]"
                }\`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-[#9A9488] uppercase tracking-wider bg-[#F9F8F4] px-2 py-0.5 rounded">{campaign.category}</span>
                  {campaign.performanceMetrics && (
                    <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                      Score: {campaign.performanceMetrics.conversionScore}
                    </span>
                  )}
                </div>
                <div className="font-bold text-sm text-[#2D362E] mb-1">{campaign.name}</div>
                <div className="text-[10px] text-[#606C5D] line-clamp-2">{campaign.description}</div>
                <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded w-fit border border-emerald-100">
                  <Calendar className="w-3 h-3" />
                  {campaign.steps.length} Steps
                </div>
              </button>
            ))}
          </div>

          {/* Campaign Preview Column */}
          <div className="flex-1 flex flex-col overflow-y-auto pr-2">
            {selectedCampaign && (
              <div className="space-y-5 h-full flex flex-col">
                <div className="shrink-0 space-y-4">
                  {/* Campaign Header */}
                  <div className="bg-white p-4 rounded-2xl border border-[#EAE7E0] shadow-sm">
                    <h4 className="font-bold text-lg text-[#2D362E]">{selectedCampaign.name}</h4>
                    <div className="text-xs text-[#606C5D] mt-1 mb-3">{selectedCampaign.description}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A9488]">Target Audience:</span>
                      <span className="text-xs text-[#2D362E] font-medium">{selectedCampaign.targetAudience}</span>
                    </div>
                  </div>

                  {/* Performance Scorecard */}
                  {selectedCampaign.performanceMetrics && (
                    <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-emerald-100 grid grid-cols-2 md:grid-cols-4 gap-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <BarChart3 className="w-24 h-24 text-emerald-900" />
                      </div>
                      
                      <div className="space-y-1 relative z-10">
                        <span className="text-[10px] font-bold text-[#9A9488] uppercase flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          Total Sent
                        </span>
                        <div className="text-xl font-bold text-[#2D362E]">{selectedCampaign.performanceMetrics.sentCount}</div>
                      </div>
                      <div className="space-y-1 relative z-10">
                        <span className="text-[10px] font-bold text-[#9A9488] uppercase flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          Active Talks
                        </span>
                        <div className="text-xl font-bold text-[#2D362E]">{selectedCampaign.performanceMetrics.activeTalksCount}</div>
                      </div>
                      <div className="space-y-1 relative z-10">
                        <span className="text-[10px] font-bold text-[#9A9488] uppercase flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Onboarded
                        </span>
                        <div className="text-xl font-bold text-emerald-700">{selectedCampaign.performanceMetrics.onboardedCount}</div>
                      </div>
                      <div className="space-y-1 relative z-10">
                        <span className="text-[10px] font-bold text-[#9A9488] uppercase flex items-center gap-1">
                          <FastForward className="w-3 h-3" />
                          Avg. Touches
                        </span>
                        <div className="text-xl font-bold text-[#2D362E]">
                          {selectedCampaign.performanceMetrics.avgTouchesToHire}
                          <span className="text-xs font-normal text-[#606C5D] ml-1">steps</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Timeline */}
                <h5 className="text-xs font-bold text-[#606C5D] uppercase tracking-wider sticky top-0 bg-white py-1 z-20">Sequence Preview</h5>
                <div className="flex-1 space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-emerald-200 before:to-transparent pb-4">
                  {selectedCampaign.steps.map((step, index) => (
                    <div key={step.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      {/* Icon Indicator */}
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-emerald-50 text-emerald-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        {step.type === 'email' ? <Mail className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                      </div>
                      
                      {/* Card */}
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl bg-white border border-[#EAE7E0] shadow-sm relative">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {step.dayOffset === 0 ? "Immediate Send" : \`Day \${step.dayOffset}\`}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A9488]">
                            {step.type === 'email' ? 'Email' : 'SMS'}
                          </span>
                        </div>
                        
                        {step.subject && (
                          <div className="text-xs font-bold text-[#2D362E] mb-1.5 pb-1.5 border-b border-[#EAE7E0]">
                            Subj: {step.subject}
                          </div>
                        )}
                        
                        <div className="text-xs text-[#606C5D] whitespace-pre-wrap leading-relaxed">
                          {step.content}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-[#EAE7E0] flex justify-between items-center shrink-0">
          <div className="text-xs text-[#606C5D] font-medium flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold">{selectedLos.length}</span>
            LOs Selected for Automation
          </div>
          <button
            onClick={handleDispatch}
            disabled={!selectedCampaign}
            className="px-6 py-3 bg-emerald-800 hover:bg-emerald-900 disabled:bg-stone-300 disabled:text-stone-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Enroll & Launch Campaign</span>
          </button>
        </div>
      </div>
    </div>
  );
};
`;

fs.writeFileSync('src/components/RecruitingCampaignModal.tsx', newContent);
