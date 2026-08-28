import React, { useState } from "react";
import { Sparkles, X, Mail, MessageSquare, Send } from "lucide-react";
import { LoanOfficerProfile } from "../types";

interface LoOutreachModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLos: LoanOfficerProfile[];
  admin: LoanOfficerProfile;
  onDispatch: (type: 'email' | 'sms', subject: string, content: string) => void;
}

export const LoOutreachModal: React.FC<LoOutreachModalProps> = ({
  isOpen,
  onClose,
  selectedLos,
  admin,
  onDispatch
}) => {
  const [outreachType, setOutreachType] = useState<"email" | "sms">("email");
  const [recruiterTone, setRecruiterTone] = useState<"casual" | "professional" | "aggressive">("professional");
  const [keywords, setKeywords] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [draftContent, setDraftContent] = useState("");
  const [subject, setSubject] = useState("");

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/gemini/lo-outreach-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminName: admin.name,
          adminTitle: admin.title,
          adminCompany: admin.company,
          outreachType,
          tone: recruiterTone,
          keywords,
          loCount: selectedLos.length
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setDraftContent(data.draft);
          setSubject(data.subject || "");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDispatch = () => {
    onDispatch(outreachType, subject, draftContent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 border border-[#EAE7E0] shadow-2xl animate-in zoom-in-95 duration-150 text-[#2D362E] max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-3 shrink-0">
          <div>
            <h4 className="font-serif font-bold text-lg text-[#2D362E] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              AI Recruiter Outreach
            </h4>
            <p className="text-xs text-[#606C5D]">Draft and send targeted recruiting {outreachType === 'email' ? 'emails' : 'texts'} to {selectedLos.length} selected Loan Officers.</p>
          </div>
          <button onClick={onClose} className="text-xs text-[#9A9488] hover:text-[#2D362E]">
            ✕ Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-5 pr-2">
          {/* Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#606C5D]">Channel</label>
              <div className="flex bg-[#FAF9F5] p-1 rounded-xl border border-[#EAE7E0]">
                <button
                  onClick={() => setOutreachType("email")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                    outreachType === "email" ? "bg-white shadow-xs text-[#2D362E]" : "text-[#9A9488] hover:text-[#2D362E]"
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" /> Email
                </button>
                <button
                  onClick={() => setOutreachType("sms")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                    outreachType === "sms" ? "bg-white shadow-xs text-[#2D362E]" : "text-[#9A9488] hover:text-[#2D362E]"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" /> SMS Text
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#606C5D]">Recruiter Tone</label>
              <select
                value={recruiterTone}
                onChange={(e) => setRecruiterTone(e.target.value as any)}
                className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#4A5D4E] text-[#2D362E]"
              >
                <option value="professional">Professional & Value-Driven</option>
                <option value="casual">Casual & Conversational</option>
                <option value="aggressive">High-Urgency / Opportunity-Focused</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#606C5D]">Key Selling Points (Optional Keywords)</label>
            <input
              type="text"
              placeholder="e.g. 'zero down programs, better splits, proprietary AI leads, fast processing'"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full bg-white border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#4A5D4E] text-[#2D362E]"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-2.5 bg-[#4A5D4E] hover:bg-[#38463B] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <Sparkles className={`w-4 h-4 text-amber-300 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? "Drafting with AI..." : `Generate ${outreachType.toUpperCase()} Draft`}</span>
          </button>

          {/* Draft Preview */}
          {draftContent && (
            <div className="space-y-3 pt-4 border-t border-[#EAE7E0] animate-fade-in">
              <h5 className="text-xs font-bold text-[#2D362E] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#4A5D4E]" /> AI Draft Preview
              </h5>
              
              {outreachType === 'email' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#9A9488] uppercase tracking-wider">Subject Line</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-white border border-[#EAE7E0] rounded-xl px-3 py-2 text-xs focus:outline-none font-bold text-[#2D362E]"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#9A9488] uppercase tracking-wider">Message Body</label>
                <textarea
                  rows={outreachType === 'email' ? 6 : 4}
                  value={draftContent}
                  onChange={(e) => setDraftContent(e.target.value)}
                  className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl p-3 text-xs focus:outline-none focus:border-[#4A5D4E] leading-relaxed text-[#2D362E]"
                />
              </div>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-[#EAE7E0] flex justify-end shrink-0">
          <button
            onClick={handleDispatch}
            disabled={!draftContent}
            className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:bg-stone-300 disabled:text-stone-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Dispatch to {selectedLos.length} LOs</span>
          </button>
        </div>
      </div>
    </div>
  );
};
