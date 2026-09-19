import React, { useState, useEffect, useMemo } from "react";
import { MessageSquare, X, Send, AlertTriangle, Sparkles, Check, ChevronDown, ChevronUp, Copy, RefreshCw, Wand2, ShieldCheck } from "lucide-react";
import { SmsTemplate, CapturedLead, LoanOfficerProfile } from "../types";
import { DEFAULT_SMS_TEMPLATES } from "../data/smsTemplates";

interface BulkSmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLeads: CapturedLead[];
  templates: SmsTemplate[];
  loanOfficer: LoanOfficerProfile;
  onDispatch: (template: SmsTemplate) => void;
  onSaveTemplate?: (template: SmsTemplate) => void;
  onTriggerToast?: (msg: string) => void;
}

const AI_PRESET_GOALS = [
  { id: "dpa", label: "💰 Down Payment Grants ($15k-$30k)", prompt: "State and regional down payment assistance grants ($15k to $30k) currently available in Oregon & Washington for qualified buyers" },
  { id: "buydown", label: "📉 2-1 Buydown Savings ($400-$700/mo)", prompt: "Seller-funded 2-1 temporary interest rate buydown reducing monthly payments by $400-$700/month for the first 2 years" },
  { id: "weekend", label: "🏡 Weekend Open House Approval Letter", prompt: "Checking if the homebuyer is touring open houses this weekend and offering an on-demand custom pre-approval letter for fast offers" },
  { id: "soft_credit", label: "🔍 Zero-Impact Soft Credit Pre-Approval", prompt: "Zero-impact soft credit pull tool for instant purchasing power calculation without dinging credit score or triggering trigger-leads" },
  { id: "casual_nurture", label: "☕ Casual Timeline Check-in", prompt: "Friendly, low-pressure check-in asking if their homebuying timeline is still active or shifted, with no pressure" },
  { id: "custom", label: "✏️ Custom AI Prompt...", prompt: "" }
];

export const BulkSmsModal: React.FC<BulkSmsModalProps> = ({
  isOpen,
  onClose,
  selectedLeads,
  templates: incomingTemplates,
  loanOfficer,
  onDispatch,
  onSaveTemplate,
  onTriggerToast
}) => {
  // Use provided templates or fallback to comprehensive default suite
  const allTemplates = useMemo(() => {
    if (incomingTemplates && incomingTemplates.length > 0) {
      return incomingTemplates;
    }
    return DEFAULT_SMS_TEMPLATES;
  }, [incomingTemplates]);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [editedContent, setEditedContent] = useState<string>("");
  const [editedTitle, setEditedTitle] = useState<string>("");
  const [showAiGenerator, setShowAiGenerator] = useState<boolean>(false);
  const [selectedAiGoal, setSelectedAiGoal] = useState<string>("dpa");
  const [customAiPrompt, setCustomAiPrompt] = useState<string>("");
  const [aiTone, setAiTone] = useState<string>("friendly, consultative, high-converting");
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [showLeadPreview, setShowLeadPreview] = useState<'text' | 'mobile' | 'hidden'>('mobile');
  const [isSavingCustom, setIsSavingCustom] = useState<boolean>(false);

  // Set initial selected template when modal opens
  useEffect(() => {
    if (isOpen) {
      if (allTemplates.length > 0) {
        const first = allTemplates[0];
        setSelectedTemplateId(first.id);
        setEditedContent(first.content);
        setEditedTitle(first.title);
      } else {
        setSelectedTemplateId("");
        setEditedContent("");
        setEditedTitle("");
      }
    }
  }, [isOpen, allTemplates]);

  // Handle template selection changes
  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id);
    const found = allTemplates.find(t => t.id === id);
    if (found) {
      setEditedContent(found.content);
      setEditedTitle(found.title);
    }
  };

  if (!isOpen) return null;

  const optedInCount = selectedLeads.filter(l => l.smsConsentAuthorized).length;
  const sampleLead = selectedLeads[0] || null;

  // Insert variable token into textarea
  const insertVariable = (token: string) => {
    setEditedContent(prev => prev + (prev.endsWith(" ") ? "" : " ") + token + " ");
  };

  // Compute live interpolated preview for sample lead
  const getInterpolatedPreview = (rawText: string) => {
    const firstName = sampleLead?.fullName ? sampleLead.fullName.split(" ")[0] : "Alex";
    const loName = loanOfficer?.name ? loanOfficer.name.split(" ")[0] : "Mike";
    const agentName = sampleLead?.assignedAgent ? sampleLead.assignedAgent.split(" ")[0] : "Sarah";
    const location = (sampleLead as any)?.preferredArea || sampleLead?.preferredLocations || "Salem, OR";
    const targetPrice = (sampleLead as any)?.targetPrice 
      ? `$${Number((sampleLead as any).targetPrice).toLocaleString()}` 
      : (sampleLead?.targetPriceRange || "$450,000");
    const tract = (sampleLead as any)?.spatialProfile?.censusTract || "41039002747";
    const coBrand = "https://homebuyer.oregon.gov/" + (loanOfficer?.id ? loanOfficer.id.replace("lo-", "") : "guide");

    return rawText
      .replace(/{{firstName}}/g, firstName)
      .replace(/\[Name\]/g, firstName)
      .replace(/{{loName}}/g, loName)
      .replace(/\[AgentName\]/g, agentName)
      .replace(/{{agentName}}/g, agentName)
      .replace(/{{location}}/g, location)
      .replace(/\[City\]/g, location)
      .replace(/{{targetPrice}}/g, targetPrice)
      .replace(/\[TargetBudget\]/g, targetPrice)
      .replace(/{{tract}}/g, tract)
      .replace(/\[Tract\]/g, tract)
      .replace(/{{coBrandUrl}}/g, coBrand);
  };

  // Generate new template using Vantage AI Assist
  const handleGenerateAiTemplate = async () => {
    setIsGeneratingAi(true);
    const goalObj = AI_PRESET_GOALS.find(g => g.id === selectedAiGoal);
    const promptToUse = customAiPrompt.trim() || (goalObj ? goalObj.prompt : "Homebuyer financing nurture");

    try {
      const res = await fetch("/api/gemini/generate-sms-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: goalObj?.label,
          customPrompt: promptToUse,
          tone: aiTone,
          loName: loanOfficer?.name || "Mike Ford",
          loCompany: loanOfficer?.company || "Cornerstone First Mortgage",
          category: "follow_up"
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.template) {
          const newTpl: SmsTemplate = data.template;
          setEditedTitle(newTpl.title);
          setEditedContent(newTpl.content);
          setSelectedTemplateId(newTpl.id);

          // Save to library if handler provided
          if (onSaveTemplate) {
            onSaveTemplate(newTpl);
          }
          if (onTriggerToast) {
            onTriggerToast(`✨ Vantage AI Assist created: "${newTpl.title}"`);
          }
          setShowAiGenerator(false);
        }
      } else {
        throw new Error("API call returned non-200");
      }
    } catch (err) {
      console.warn("AI generation fallback:", err);
      // Smart offline fallback
      const fallbackTpl: SmsTemplate = {
        id: `sms-ai-${Date.now()}`,
        title: `✨ AI: ${goalObj?.label.replace(/[^a-zA-Z0-9 ]/g, "").trim() || "Loan Options Check"}`,
        content: `Hi {{firstName}}, {{loName}} here with Cornerstone First Mortgage. Wanted to share a quick update on new down payment grants and 2-1 buydown programs in {{location}}. Would you like me to crunch sample monthly payments for you? Reply STOP to opt out.`,
        category: "follow_up",
        tags: ["Vantage AI Assist", "Nurture"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ownerId: loanOfficer?.id || "lo_default"
      };

      setEditedTitle(fallbackTpl.title);
      setEditedContent(fallbackTpl.content);
      setSelectedTemplateId(fallbackTpl.id);
      if (onSaveTemplate) onSaveTemplate(fallbackTpl);
      if (onTriggerToast) onTriggerToast(`✨ Vantage AI Assist created template!`);
      setShowAiGenerator(false);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Save current edited text as a new template in library
  const handleSaveAsTemplate = () => {
    if (!editedContent.trim()) return;
    setIsSavingCustom(true);
    const newTpl: SmsTemplate = {
      id: `sms-tpl-custom-${Date.now()}`,
      title: editedTitle.trim() || `Custom Text (${new Date().toLocaleDateString()})`,
      content: editedContent.trim(),
      category: "custom",
      tags: ["Custom", "LO Drafted"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownerId: loanOfficer?.id || "lo_default"
    };

    if (onSaveTemplate) {
      onSaveTemplate(newTpl);
    }
    setSelectedTemplateId(newTpl.id);
    if (onTriggerToast) {
      onTriggerToast(`💾 Saved "${newTpl.title}" to SMS Template Library!`);
    }
    setTimeout(() => setIsSavingCustom(false), 1200);
  };

  // Group templates by category for clean dropdown rendering
  const categorizedTemplates = useMemo(() => {
    const groups: { [key: string]: SmsTemplate[] } = {
      "📍 GeoSphere / Map Touch Demographics": [],
      "⚡ Speed to Lead & Intros": [],
      "💰 Down Payment Grants & Assistance": [],
      "📉 Rates & 2-1 Buydown Relief": [],
      "🏡 Weekend Tours & Agent Sync": [],
      "🎯 Pre-Approved & Escrow Milestones": [],
      "☕ Nurture & Re-engagement": [],
      "✨ Custom & AI Generated": []
    };

    allTemplates.forEach(tpl => {
      const cat = tpl.category;
      const titleLower = tpl.title.toLowerCase();
      if (cat === "geomap_touch" || titleLower.includes("geosphere") || titleLower.includes("tract")) {
        groups["📍 GeoSphere / Map Touch Demographics"].push(tpl);
      } else if (cat === "new_lead" || titleLower.includes("intro") || titleLower.includes("discovery")) {
        groups["⚡ Speed to Lead & Intros"].push(tpl);
      } else if (titleLower.includes("grant") || titleLower.includes("down payment") || titleLower.includes("usda") || titleLower.includes("fha")) {
        groups["💰 Down Payment Grants & Assistance"].push(tpl);
      } else if (titleLower.includes("buydown") || titleLower.includes("rate") || titleLower.includes("relief")) {
        groups["📉 Rates & 2-1 Buydown Relief"].push(tpl);
      } else if (titleLower.includes("weekend") || titleLower.includes("open house") || titleLower.includes("agent") || titleLower.includes("sync")) {
        groups["🏡 Weekend Tours & Agent Sync"].push(tpl);
      } else if (cat === "pre_approved" || cat === "in_escrow" || titleLower.includes("close") || titleLower.includes("underwriting")) {
        groups["🎯 Pre-Approved & Escrow Milestones"].push(tpl);
      } else if (cat === "post_close" || titleLower.includes("timeline") || titleLower.includes("checkin") || titleLower.includes("inventory")) {
        groups["☕ Nurture & Re-engagement"].push(tpl);
      } else {
        groups["✨ Custom & AI Generated"].push(tpl);
      }
    });

    return Object.entries(groups).filter(([_, items]) => items.length > 0);
  }, [allTemplates]);

  const charCount = editedContent.length;
  const segmentCount = charCount <= 160 ? 1 : Math.ceil(charCount / 153);

  const handleExecuteDispatch = () => {
    if (!editedContent.trim()) return;

    // Create effective template payload containing whatever text the LO finalized
    const finalTemplate: SmsTemplate = {
      id: selectedTemplateId || `sms-bulk-${Date.now()}`,
      title: editedTitle || "Bulk Outbound SMS",
      content: editedContent,
      category: "custom",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownerId: loanOfficer?.id || "lo_default"
    };

    onDispatch(finalTemplate);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 space-y-4 border border-[#EAE7E0] shadow-2xl animate-in zoom-in-95 duration-150 my-8">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif font-bold text-lg text-[#2D362E] flex items-center gap-2">
                <span>Bulk SMS Dispatch</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {allTemplates.length} Pre-written Templates
                </span>
              </h4>
              <p className="text-xs text-[#606C5D]">TCPA-compliant 1-to-many high-speed borrower SMS dispatch</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Compliance Warning */}
        <div className="flex items-start gap-3 p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Compliance Status: </span>
            You selected <span className="font-semibold">{selectedLeads.length} lead{selectedLeads.length === 1 ? "" : "s"}</span>. <span className="font-semibold text-emerald-700">{optedInCount}</span> have verified SMS marketing opt-in consent. Non-opted-in contacts will be skipped automatically.
          </div>
        </div>

        {/* AI 2nd Brain Generator Toggle / Panel */}
        <div className="bg-[#FAF9F5] border border-[#EAE7E0] rounded-2xl p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-700 flex items-center justify-center text-white text-xs">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-[#2D362E]">Vantage AI Assist SMS Studio</span>
            </div>
            <button
              type="button"
              onClick={() => setShowAiGenerator(!showAiGenerator)}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-xl border border-[#EAE7E0] shadow-xs"
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-500" />
              <span>{showAiGenerator ? "Hide AI Generator" : "✨ Create Custom AI Template"}</span>
              {showAiGenerator ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showAiGenerator && (
            <div className="pt-2 border-t border-[#EAE7E0] space-y-3 animate-in fade-in-50 duration-200">
              <div className="text-xs text-[#606C5D]">
                Select a high-converting goal or enter custom guidance. Vantage AI Assist will craft an SMS with appropriate variables and opt-out phrasing.
              </div>

              {/* Goal Presets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {AI_PRESET_GOALS.map(goal => (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => {
                      setSelectedAiGoal(goal.id);
                      if (goal.id !== "custom") setCustomAiPrompt(goal.prompt);
                    }}
                    className={`text-left px-2.5 py-2 rounded-xl text-xs transition-all flex items-center justify-between border cursor-pointer ${
                      selectedAiGoal === goal.id
                        ? "bg-emerald-800 text-white border-emerald-800 font-bold shadow-xs"
                        : "bg-white text-[#2D362E] border-[#EAE7E0] hover:bg-emerald-50/50"
                    }`}
                  >
                    <span className="truncate">{goal.label}</span>
                    {selectedAiGoal === goal.id && <Check className="w-3.5 h-3.5 text-white shrink-0 ml-1" />}
                  </button>
                ))}
              </div>

              {/* Custom Prompt Input */}
              <div className="space-y-1">
                <input
                  type="text"
                  value={customAiPrompt}
                  onChange={(e) => setCustomAiPrompt(e.target.value)}
                  placeholder="e.g. Friendly message telling buyers about new listing inventory in Salem with price drops..."
                  className="w-full text-xs p-2.5 bg-white border border-[#EAE7E0] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-700 text-[#2D362E]"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#7A887B] font-medium">Tone:</span>
                  <select
                    value={aiTone}
                    onChange={(e) => setAiTone(e.target.value)}
                    className="text-xs py-1 px-2 bg-white border border-[#EAE7E0] rounded-lg text-[#2D362E]"
                  >
                    <option value="friendly, consultative, high-converting">Friendly & Consultative</option>
                    <option value="urgent market alert, timely opportunity">Urgent Market Opportunity</option>
                    <option value="low-pressure, casual check-in">Casual / Low Pressure</option>
                    <option value="educational, program guidelines advisor">Advisor & Educational</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateAiTemplate}
                  disabled={isGeneratingAi}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  {isGeneratingAi ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Generating with AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Generate Template</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Template Selector Dropdown */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-[#2D362E]">Select Pre-Written Nurture Template</label>
            <span className="text-[11px] text-[#7A887B]">
              {allTemplates.length} templates available
            </span>
          </div>
          <select
            value={selectedTemplateId}
            onChange={(e) => handleSelectTemplate(e.target.value)}
            className="w-full text-xs p-3 bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-700 text-[#2D362E] font-medium cursor-pointer shadow-2xs"
          >
            <option value="">-- Choose a Pre-Written Message ({allTemplates.length} Options) --</option>
            {categorizedTemplates.map(([groupName, items]) => (
              <optgroup key={groupName} label={groupName} className="font-bold text-[#2D362E]">
                {items.map(t => (
                  <option key={t.id} value={t.id} className="font-normal text-xs py-1">
                    {t.title}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Message Editor with Variables & Segment Counter */}
        {selectedTemplateId && (
          <div className="space-y-2 pt-1 animate-in fade-in-50 duration-150">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[11px] font-bold text-[#606C5D] mr-1">Insert Variable:</span>
                {[
                  { token: "{{firstName}}", label: "First Name" },
                  { token: "{{loName}}", label: "My Name" },
                  { token: "{{location}}", label: "City/Area" },
                  { token: "[AgentName]", label: "Realtor" },
                  { token: "{{targetPrice}}", label: "Target Budget" },
                  { token: "{{tract}}", label: "📍 Census Tract" },
                  { token: "{{coBrandUrl}}", label: "🔗 Portal Link" }
                ].map(v => (
                  <button
                    key={v.token}
                    type="button"
                    onClick={() => insertVariable(v.token)}
                    className="text-[10px] font-semibold px-2 py-0.5 bg-[#FAF9F5] hover:bg-emerald-100 hover:text-emerald-900 border border-[#EAE7E0] rounded-lg text-[#4A5D4E] transition-colors cursor-pointer"
                    title={`Click to insert ${v.token}`}
                  >
                    +{v.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                  charCount > 320 
                    ? "bg-red-100 text-red-800 font-bold" 
                    : charCount > 160 
                    ? "bg-amber-100 text-amber-900" 
                    : "bg-emerald-100 text-emerald-900"
                }`}>
                  {charCount} chars • {segmentCount} SMS segment{segmentCount > 1 ? "s" : ""}
                </span>

                <button
                  type="button"
                  onClick={handleSaveAsTemplate}
                  disabled={isSavingCustom}
                  className="text-[11px] font-bold text-[#4A5D4E] hover:text-emerald-800 flex items-center gap-1 cursor-pointer bg-stone-100 hover:bg-stone-200 px-2 py-0.5 rounded-lg transition-colors"
                  title="Save current edited text as a reusable template in your library"
                >
                  {isSavingCustom ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{isSavingCustom ? "Saved!" : "Save to Library"}</span>
                </button>
              </div>
            </div>

            {/* Editable Textarea */}
            <div className="relative">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                rows={4}
                className="w-full text-xs p-3.5 bg-[#FAF9F5] border border-[#EAE7E0] rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-emerald-700 text-[#2D362E] leading-relaxed resize-y font-sans"
                placeholder="Type or customize your SMS message..."
              />
            </div>

            {/* Live Sample Interpolation Preview */}
            {sampleLead && (
              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-slate-500" />
                    <span>Live Lead Preview (Sample: {sampleLead.fullName || "Sample Lead"})</span>
                  </span>
                  <div className="flex items-center bg-slate-200/50 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => setShowLeadPreview(showLeadPreview === 'text' ? 'hidden' : 'text')}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${showLeadPreview === 'text' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Raw Text
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowLeadPreview(showLeadPreview === 'mobile' ? 'hidden' : 'mobile')}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${showLeadPreview === 'mobile' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Mobile View
                    </button>
                  </div>
                </div>
                
                {showLeadPreview === 'text' && (
                  <div className="animate-in fade-in zoom-in-95 duration-150">
                    <p className="text-xs text-[#2D362E] bg-white p-3 rounded-xl border border-slate-200 whitespace-pre-wrap leading-relaxed shadow-sm">
                      {getInterpolatedPreview(editedContent)}
                    </p>
                  </div>
                )}
                
                {showLeadPreview === 'mobile' && (
                  <div className="flex justify-center animate-in fade-in zoom-in-95 duration-200 py-2">
                    {/* iOS-style mobile mockup */}
                    <div className="w-[280px] bg-[#F1F1F1] rounded-[36px] border-[6px] border-slate-800 overflow-hidden shadow-xl flex flex-col h-[420px] relative">
                      {/* Dynamic Island / Notch area */}
                      <div className="absolute top-0 inset-x-0 flex justify-center z-10">
                        <div className="w-24 h-5 bg-slate-800 rounded-b-2xl"></div>
                      </div>
                      
                      {/* Status bar */}
                      <div className="h-10 w-full bg-[#F1F1F1]/80 backdrop-blur-md flex justify-between items-end pb-1.5 px-5 z-0">
                        <div className="text-[10px] font-bold tracking-tight text-black mb-0.5">9:41</div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {/* Signal */}
                          <div className="flex items-end gap-[1px] h-2.5">
                            <div className="w-[2.5px] h-1 bg-black rounded-sm"></div>
                            <div className="w-[2.5px] h-1.5 bg-black rounded-sm"></div>
                            <div className="w-[2.5px] h-2 bg-black rounded-sm"></div>
                            <div className="w-[2.5px] h-2.5 bg-black rounded-sm"></div>
                          </div>
                          {/* Wifi */}
                          <svg className="w-3.5 h-3.5 text-black" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 21L15.6 16.2C14.6 15.45 13.35 15 12 15C10.65 15 9.4 15.45 8.4 16.2L12 21ZM12 3C7.95 3 4.21 4.53 1.2 7.15L3.6 10.35C5.9 8.35 8.8 7 12 7C15.2 7 18.1 8.35 20.4 10.35L22.8 7.15C19.79 4.53 16.05 3 12 3ZM12 9C9.3 9 6.81 9.9 4.8 11.55L7.2 14.75C8.5 13.65 10.15 13 12 13C13.85 13 15.5 13.65 16.8 14.75L19.2 11.55C17.19 9.9 14.7 9 12 9Z" />
                          </svg>
                          {/* Battery */}
                          <div className="w-[18px] h-2.5 border border-black rounded-[3px] p-[1px] relative">
                            <div className="w-full h-full bg-black rounded-[1px]"></div>
                            <div className="absolute right-[-2.5px] top-[2.5px] w-[1.5px] h-1 bg-black rounded-r-[1px]"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Header */}
                      <div className="bg-[#F1F1F1]/95 backdrop-blur-md px-3 py-2 border-b border-gray-300 flex flex-col items-center justify-center shadow-sm z-0 relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-slate-400 to-slate-500 rounded-full flex items-center justify-center text-white text-lg font-medium mb-1 shadow-inner border border-slate-300">
                          {loanOfficer?.name ? loanOfficer.name.charAt(0) : "M"}
                        </div>
                        <div className="text-[11px] text-black font-semibold">
                          {loanOfficer?.name || "Mike Ford"} <span className="mx-0.5 text-slate-400 font-light">&gt;</span>
                        </div>
                      </div>
                      
                      {/* Messages area */}
                      <div className="flex-1 bg-white p-3.5 overflow-y-auto flex flex-col gap-4">
                        <div className="text-center text-[10px] text-slate-500 font-semibold my-1 uppercase tracking-wider">Today 9:41 AM</div>
                        
                        <div className="flex flex-col items-start max-w-[85%] self-start relative">
                           <div className="bg-[#E9E9EB] text-black text-[13px] leading-[1.35] px-3.5 py-2.5 rounded-2xl rounded-bl-sm shadow-sm whitespace-pre-wrap font-sans">
                             {getInterpolatedPreview(editedContent)}
                           </div>
                        </div>
                      </div>
                      
                      {/* Input area mockup */}
                      <div className="p-2.5 bg-[#F1F1F1]/95 backdrop-blur-md border-t border-gray-300 flex items-center gap-2 pb-6">
                        <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0 border border-slate-300">
                          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                        <div className="flex-1 bg-white border border-slate-300 rounded-full h-8 px-3.5 flex items-center">
                          <span className="text-[12px] text-slate-400 font-sans">Text Message</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Modal Footer Actions */}
        <div className="pt-3 border-t border-[#EAE7E0] flex items-center justify-between gap-3">
          <div className="text-[11px] text-[#7A887B]">
            {optedInCount > 0 ? (
              <span>Ready to dispatch to <strong className="text-emerald-800">{optedInCount}</strong> opted-in contact{optedInCount === 1 ? "" : "s"}</span>
            ) : (
              <span className="text-amber-700 font-medium">⚠️ No opted-in leads in selection</span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-gray-600 font-bold text-xs hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleExecuteDispatch}
              disabled={!editedContent.trim() || optedInCount === 0}
              className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:bg-stone-300 disabled:text-stone-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Dispatch to {optedInCount} Lead{optedInCount === 1 ? "" : "s"}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
