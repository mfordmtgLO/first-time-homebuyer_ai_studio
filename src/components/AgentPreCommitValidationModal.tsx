import React, { useState } from "react";
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, User, 
  Mail, Phone, Clock, Building, ArrowRight, Wand2, Image as ImageIcon,
  Check, ChevronDown, ChevronUp
} from "lucide-react";
import { RealEstateAgentProfile } from "../types";
import { 
  validateScrapedAgent, 
  autoResolveAgentGaps, 
  PROFESSIONAL_HEADSHOT_PRESETS,
  COMMON_OREGON_BROKERAGES,
  AgentValidationResult
} from "../utils/agentValidation";

interface AgentPreCommitValidationModalProps {
  isOpen: boolean;
  agents: Partial<RealEstateAgentProfile>[];
  onClose: () => void;
  onCommitValidated: (validatedAgents: Partial<RealEstateAgentProfile>[]) => void;
}

export const AgentPreCommitValidationModal: React.FC<AgentPreCommitValidationModalProps> = ({
  isOpen,
  agents: initialAgents,
  onClose,
  onCommitValidated
}) => {
  const [agents, setAgents] = useState<Partial<RealEstateAgentProfile>[]>(initialAgents);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [avatarPickerIndex, setAvatarPickerIndex] = useState<number | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'gaps_only' | 'ready_only'>('all');

  if (!isOpen) return null;

  // Compute validation results for all agents
  const validationResults: AgentValidationResult[] = agents.map(validateScrapedAgent);
  const totalAgents = agents.length;
  const invalidCount = validationResults.filter(r => !r.isValid).length;
  const validCount = totalAgents - invalidCount;

  // Breakdown of missing key fields
  const missingHeadshots = validationResults.filter(r => !r.hasHeadshot).length;
  const missingEmails = validationResults.filter(r => !r.hasEmail).length;
  const missingPhones = validationResults.filter(r => !r.hasPhone).length;
  const missingExp = validationResults.filter(r => !r.hasExperience).length;
  const missingBrokerage = validationResults.filter(r => !r.hasBrokerage).length;

  const handleUpdateField = (index: number, field: keyof RealEstateAgentProfile, value: any) => {
    setAgents(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      // If updating experienceYears, also sync yearsExperience
      if (field === 'experienceYears') {
        (updated[index] as any).yearsExperience = Number(value);
      }
      // If updating brokerage, sync company
      if (field === 'brokerage') {
        updated[index].company = String(value);
      }
      return updated;
    });
  };

  const handleAutoResolveSingle = (index: number) => {
    setAgents(prev => {
      const updated = [...prev];
      updated[index] = autoResolveAgentGaps(updated[index], index);
      return updated;
    });
  };

  const handleAutoResolveAll = () => {
    setAgents(prev => prev.map((agent, i) => autoResolveAgentGaps(agent, i)));
  };

  const handleSelectPresetAvatar = (index: number, avatarUrl: string) => {
    handleUpdateField(index, 'headshotUrl', avatarUrl);
    setAvatarPickerIndex(null);
  };

  const handleCommit = (includeOnlyValid: boolean = false) => {
    let finalAgents = agents;
    if (includeOnlyValid) {
      finalAgents = agents.filter((_, idx) => validationResults[idx].isValid);
    }
    if (finalAgents.length > 0) {
      onCommitValidated(finalAgents);
    }
  };

  const filteredList = agents.map((agent, index) => ({
    agent,
    index,
    validation: validationResults[index]
  })).filter(item => {
    if (filterMode === 'gaps_only') return !item.validation.isValid;
    if (filterMode === 'ready_only') return item.validation.isValid;
    return true;
  });

  return (
    <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-5xl w-full p-5 sm:p-6 space-y-4 border border-[#EAE7E0] shadow-2xl flex flex-col max-h-[92vh] text-[#2D362E]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-2xl ${invalidCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-[#2D362E] flex items-center gap-2">
                Pre-Commit Data Quality & Validation Gate
                {invalidCount > 0 ? (
                  <span className="text-xs bg-amber-100 text-amber-900 border border-amber-300 font-extrabold px-2 py-0.5 rounded-full">
                    {invalidCount} Gaps Detected
                  </span>
                ) : (
                  <span className="text-xs bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold px-2 py-0.5 rounded-full">
                    ✓ All {totalAgents} Ready to Commit
                  </span>
                )}
              </h3>
              <p className="text-xs text-[#606C5D]">
                Ensure high data fidelity before adding agent partners to the Master Agent Roster. Resolve missing headshots, emails, or experience years manually.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-xs text-[#9A9488] hover:text-[#2D362E] px-3 py-1.5 rounded-xl border border-[#EAE7E0] bg-[#F9F8F4] cursor-pointer"
          >
            ✕ Back
          </button>
        </div>

        {/* Quality Metrics & Gaps Summary Banner */}
        <div className="bg-[#FAF9F5] p-3.5 rounded-2xl border border-[#EAE7E0] shrink-0 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap text-xs font-semibold">
              <span className="text-[#2D362E] font-bold">Audit Summary:</span>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-lg border border-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                {validCount} Complete
              </span>
              {invalidCount > 0 && (
                <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-lg border border-amber-300 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                  {invalidCount} Have Gaps
                </span>
              )}
            </div>

            {invalidCount > 0 && (
              <button
                type="button"
                onClick={handleAutoResolveAll}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer self-start sm:self-auto shrink-0"
                title="Automatically populate standard defaults & realistic professional headshots for all missing fields"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Auto-Resolve All Gaps ({invalidCount})</span>
              </button>
            )}
          </div>

          {/* Missing Field Badges */}
          {invalidCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-[#EAE7E0]/60 text-[11px]">
              <span className="text-gray-500 font-medium">Missing:</span>
              {missingHeadshots > 0 && (
                <span className="bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                  <ImageIcon className="w-3 h-3 text-rose-600" />
                  {missingHeadshots} Headshot{missingHeadshots > 1 ? 's' : ''}
                </span>
              )}
              {missingEmails > 0 && (
                <span className="bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                  <Mail className="w-3 h-3 text-rose-600" />
                  {missingEmails} Email{missingEmails > 1 ? 's' : ''}
                </span>
              )}
              {missingPhones > 0 && (
                <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                  <Phone className="w-3 h-3 text-amber-600" />
                  {missingPhones} Cell / Phone{missingPhones > 1 ? 's' : ''}
                </span>
              )}
              {missingExp > 0 && (
                <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-600" />
                  {missingExp} Experience Year{missingExp > 1 ? 's' : ''}
                </span>
              )}
              {missingBrokerage > 0 && (
                <span className="bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                  <Building className="w-3 h-3 text-purple-600" />
                  {missingBrokerage} Brokerage Name{missingBrokerage > 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Filters Filter Toggle Bar */}
        <div className="flex items-center justify-between gap-2 shrink-0 pt-1">
          <div className="flex items-center gap-1.5 bg-[#FAF9F5] p-1 rounded-xl border border-[#EAE7E0] text-xs">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${filterMode === 'all' ? 'bg-white text-[#2D362E] shadow-2xs' : 'text-[#606C5D] hover:text-[#2D362E]'}`}
            >
              All ({totalAgents})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('gaps_only')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${filterMode === 'gaps_only' ? 'bg-amber-100 text-amber-900 shadow-2xs' : 'text-[#606C5D] hover:text-amber-800'}`}
            >
              Gaps Only ({invalidCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('ready_only')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${filterMode === 'ready_only' ? 'bg-emerald-100 text-emerald-900 shadow-2xs' : 'text-[#606C5D] hover:text-emerald-800'}`}
            >
              100% Ready ({validCount})
            </button>
          </div>
          <span className="text-[11px] text-[#7D8877]">
            Showing {filteredList.length} candidate{filteredList.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* Scrollable Validation Cards List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 dashboard-vertical-scrollbar">
          {filteredList.map(({ agent, index, validation }) => {
            const isExpanded = expandedIndex === index || !validation.isValid;
            const isAvatarPickerOpen = avatarPickerIndex === index;

            return (
              <div 
                key={index}
                className={`rounded-2xl border p-4 transition-all ${
                  validation.isValid 
                    ? "bg-white border-[#EAE7E0]" 
                    : "bg-amber-50/40 border-amber-300 shadow-2xs"
                }`}
              >
                {/* Agent Summary Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Headshot Avatar with Status Ring */}
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden border border-gray-200">
                        {agent.headshotUrl ? (
                          <img src={agent.headshotUrl} alt={agent.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold bg-amber-50">
                            ?
                          </div>
                        )}
                      </div>
                      <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold ${
                        validation.hasHeadshot ? 'bg-emerald-600 text-white' : 'bg-rose-500 text-white'
                      }`}>
                        {validation.hasHeadshot ? '✓' : '!'}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-[#2D362E] truncate">
                          {agent.name || "Unnamed Candidate"}
                        </h4>
                        {validation.isValid ? (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300 font-extrabold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            100% Ready
                          </span>
                        ) : (
                          <span className="text-[9px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300 font-extrabold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            {validation.gaps.length} Gap{validation.gaps.length > 1 ? 's' : ''} to Resolve ({validation.score}%)
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-[#606C5D] truncate mt-0.5">
                        <span className="font-bold text-[#2D362E]">{agent.brokerage || agent.company || "No Brokerage"}</span>
                        {" • "}
                        <span>{agent.email || "Missing Email"}</span>
                        {" • "}
                        <span>{agent.phone || "Missing Phone"}</span>
                        {" • "}
                        <span>{agent.experienceYears ?? (agent as any).yearsExperience ?? 0} Yrs Exp</span>
                      </p>
                    </div>
                  </div>

                  {/* Actions & Gap Indicators */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    {!validation.isValid && (
                      <button
                        type="button"
                        onClick={() => handleAutoResolveSingle(index)}
                        className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Wand2 className="w-3.5 h-3.5 text-amber-700" />
                        <span>Quick Fix</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                      className="px-3 py-1.5 bg-[#FAF9F5] hover:bg-[#F0EEE6] border border-[#EAE7E0] text-[#2D362E] rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <span>{isExpanded ? "Collapse" : "Edit & Resolve"}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Missing Gap Pill Tags */}
                {!validation.isValid && validation.gaps.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap mt-2 pt-2 border-t border-amber-200/60">
                    <span className="text-[10px] font-bold text-amber-900 uppercase">Attention Needed:</span>
                    {validation.gaps.map((gap, gIdx) => (
                      <span 
                        key={gIdx}
                        className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                          gap.severity === 'critical' 
                            ? 'bg-rose-100/80 text-rose-900 border-rose-300' 
                            : 'bg-amber-100/80 text-amber-900 border-amber-300'
                        }`}
                      >
                        {gap.label} missing
                      </span>
                    ))}
                  </div>
                )}

                {/* Expandable Manual Resolution Form */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-[#EAE7E0] space-y-3 bg-white p-3 rounded-xl border border-gray-100 animate-in fade-in duration-100">
                    <div className="text-[11px] font-bold text-[#4A5D4E] uppercase tracking-wider flex items-center gap-1">
                      <User className="w-3 h-3 text-emerald-600" />
                      Manual Gap Resolution Controls
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      
                      {/* 1. Headshot Photo Input & Preset Picker */}
                      <div className="sm:col-span-2 md:col-span-1 space-y-1">
                        <label className="text-[10px] font-bold text-[#7D8877] uppercase flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <ImageIcon className="w-3 h-3 text-emerald-600" />
                            Headshot URL
                          </span>
                          {!validation.hasHeadshot && (
                            <span className="text-[9px] text-rose-600 font-extrabold">Required</span>
                          )}
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="url"
                            placeholder="https://... headshot.jpg"
                            value={agent.headshotUrl || ""}
                            onChange={(e) => handleUpdateField(index, 'headshotUrl', e.target.value)}
                            className="flex-1 bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-2.5 py-1.5 text-xs text-[#2D362E] focus:outline-none focus:border-emerald-600"
                          />
                          <button
                            type="button"
                            onClick={() => setAvatarPickerIndex(isAvatarPickerOpen ? null : index)}
                            className="px-2 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-[11px] font-bold rounded-xl cursor-pointer shrink-0"
                            title="Pick from professional curated headshots"
                          >
                            Presets
                          </button>
                        </div>

                        {/* Preset Headshot Popover Grid */}
                        {isAvatarPickerOpen && (
                          <div className="p-2 bg-[#FAF9F5] border border-emerald-300 rounded-xl space-y-1.5 mt-1 animate-in fade-in">
                            <div className="text-[10px] font-bold text-emerald-950 flex items-center justify-between">
                              <span>Select Curated Professional Portrait:</span>
                              <button onClick={() => setAvatarPickerIndex(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                            </div>
                            <div className="grid grid-cols-4 gap-1.5">
                              {PROFESSIONAL_HEADSHOT_PRESETS.map((p, pIdx) => (
                                <button
                                  key={pIdx}
                                  type="button"
                                  onClick={() => handleSelectPresetAvatar(index, p.url)}
                                  className="w-12 h-12 rounded-lg overflow-hidden border-2 hover:border-emerald-600 transition-all cursor-pointer relative"
                                >
                                  <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                                  {agent.headshotUrl === p.url && (
                                    <span className="absolute inset-0 bg-emerald-600/40 flex items-center justify-center text-white">
                                      <Check className="w-4 h-4 font-bold" />
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 2. Direct Email */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#7D8877] uppercase flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-emerald-600" />
                            Direct Email
                          </span>
                          {!validation.hasEmail && (
                            <span className="text-[9px] text-rose-600 font-extrabold">Required</span>
                          )}
                        </label>
                        <input
                          type="email"
                          placeholder="agent@brokerage.com"
                          value={agent.email || ""}
                          onChange={(e) => handleUpdateField(index, 'email', e.target.value)}
                          className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-2.5 py-1.5 text-xs text-[#2D362E] focus:outline-none focus:border-emerald-600"
                        />
                      </div>

                      {/* 3. Direct Phone / Cell */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#7D8877] uppercase flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-600" />
                            Direct Cell / Phone
                          </span>
                          {!validation.hasPhone && (
                            <span className="text-[9px] text-amber-600 font-extrabold">Gaps Detected</span>
                          )}
                        </label>
                        <input
                          type="tel"
                          placeholder="e.g. (503) 282-5626"
                          value={agent.phone || ""}
                          onChange={(e) => handleUpdateField(index, 'phone', e.target.value)}
                          className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-2.5 py-1.5 text-xs text-[#2D362E] focus:outline-none focus:border-emerald-600"
                        />
                      </div>

                      {/* 4. Experience Years Stepper */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#7D8877] uppercase flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-emerald-600" />
                            Years of Experience
                          </span>
                          {!validation.hasExperience && (
                            <span className="text-[9px] text-amber-600 font-extrabold">Gaps Detected</span>
                          )}
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={50}
                          placeholder="8"
                          value={agent.experienceYears ?? (agent as any).yearsExperience ?? ""}
                          onChange={(e) => handleUpdateField(index, 'experienceYears', parseInt(e.target.value) || 0)}
                          className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-2.5 py-1.5 text-xs text-[#2D362E] focus:outline-none focus:border-emerald-600"
                        />
                      </div>

                      {/* 5. Brokerage / Real Estate Company */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#7D8877] uppercase flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Building className="w-3 h-3 text-emerald-600" />
                            Brokerage / Agency
                          </span>
                          {!validation.hasBrokerage && (
                            <span className="text-[9px] text-rose-600 font-extrabold">Required</span>
                          )}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Keller Williams Realty"
                          value={agent.brokerage || agent.company || ""}
                          onChange={(e) => handleUpdateField(index, 'brokerage', e.target.value)}
                          list="common-brokerages"
                          className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-2.5 py-1.5 text-xs text-[#2D362E] focus:outline-none focus:border-emerald-600"
                        />
                        <datalist id="common-brokerages">
                          {COMMON_OREGON_BROKERAGES.map((b, bIdx) => (
                            <option key={bIdx} value={b} />
                          ))}
                        </datalist>
                      </div>

                      {/* 6. State License Number */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#7D8877] uppercase flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            License #
                          </span>
                          {!validation.hasLicense && (
                            <span className="text-[9px] text-amber-600 font-extrabold">Optional / Gaps</span>
                          )}
                        </label>
                        <input
                          type="text"
                          placeholder="201209811"
                          value={agent.licenseNumber || ""}
                          onChange={(e) => handleUpdateField(index, 'licenseNumber', e.target.value)}
                          className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-2.5 py-1.5 text-xs text-[#2D362E] focus:outline-none focus:border-emerald-600"
                        />
                      </div>

                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Footer Controls */}
        <div className="pt-3 border-t border-[#EAE7E0] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-[#606C5D] font-medium flex items-center gap-2">
            <span>Ready to commit: <strong>{validCount} of {totalAgents}</strong> candidates.</span>
            {invalidCount > 0 && (
              <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px] font-bold">
                ⚠️ {invalidCount} unresolved gap{invalidCount > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {invalidCount > 0 && validCount > 0 && (
              <button
                type="button"
                onClick={() => handleCommit(true)}
                className="flex-1 sm:flex-none px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-300 text-[#2D362E] rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Commit Only 100% Valid ({validCount})
              </button>
            )}

            <button
              type="button"
              onClick={() => handleCommit(false)}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <span>Commit All ({totalAgents}) to Master Roster</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
