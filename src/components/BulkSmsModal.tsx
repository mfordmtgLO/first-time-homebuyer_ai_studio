import React, { useState } from "react";
import { MessageSquare, X, Send, AlertTriangle } from "lucide-react";
import { SmsTemplate, CapturedLead, LoanOfficerProfile } from "../types";

interface BulkSmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLeads: CapturedLead[];
  templates: SmsTemplate[];
  loanOfficer: LoanOfficerProfile;
  onDispatch: (template: SmsTemplate) => void;
}

export const BulkSmsModal: React.FC<BulkSmsModalProps> = ({
  isOpen,
  onClose,
  selectedLeads,
  templates,
  loanOfficer,
  onDispatch
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  if (!isOpen) return null;

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
  const optedInCount = selectedLeads.filter(l => l.smsConsentAuthorized).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 border border-[#EAE7E0] shadow-2xl animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-[#EAE7E0] pb-3">
          <h4 className="font-serif font-bold text-lg text-[#2D362E] flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-700" />
            <span>Bulk SMS Dispatch</span>
          </h4>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900">
              <strong className="block mb-1">Compliance Check</strong>
              You selected {selectedLeads.length} leads. {optedInCount} of them have explicitly opted-in to receive SMS marketing. Non-opted-in leads will be safely skipped.
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#2D362E]">Select Nurture Template</label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full text-xs p-3 bg-[#FAF9F5] border border-[#EAE7E0] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#4A5D4E] text-[#2D362E]"
            >
              <option value="">-- Choose a Pre-Written Message --</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.title} ({t.category})</option>
              ))}
            </select>
          </div>

          {selectedTemplate && (
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-[#9A9488]">
                Message Preview (Variables will be auto-filled per lead)
              </label>
              <div className="p-4 bg-[#FAF9F5] border border-[#EAE7E0] rounded-2xl text-xs text-[#2D362E] whitespace-pre-wrap">
                {selectedTemplate.content}
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-[#EAE7E0] flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-gray-600 font-bold text-xs hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (selectedTemplate) onDispatch(selectedTemplate);
            }}
            disabled={!selectedTemplate}
            className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 disabled:bg-stone-300 disabled:text-stone-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            Dispatch to {optedInCount} Leads
          </button>
        </div>
      </div>
    </div>
  );
};
