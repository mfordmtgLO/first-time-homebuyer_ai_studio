import React, { useState } from "react";
import { CapturedLead, LoanOfficerProfile } from "../types";
import { Layers, Inbox, Phone, CheckCircle2, ShieldCheck, Flag } from "lucide-react";

interface MasterLeadJourneyTabProps {
  leads: CapturedLead[];
  onUpdateLead: (updatedLead: CapturedLead) => void;
  loanOfficer: LoanOfficerProfile;
}

export const MasterLeadJourneyTab: React.FC<MasterLeadJourneyTabProps> = ({ leads, onUpdateLead, loanOfficer }) => {
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  const columns = [
    { id: "new", title: "New (Uncontacted)", icon: <Inbox className="w-4 h-4 text-blue-500" />, bg: "bg-blue-50" },
    { id: "contacted", title: "Contacted", icon: <Phone className="w-4 h-4 text-yellow-500" />, bg: "bg-yellow-50" },
    { id: "pre_approved", title: "Qualified (Pre-Approved)", icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />, bg: "bg-emerald-50" },
    { id: "closed", title: "Closed", icon: <Flag className="w-4 h-4 text-gray-500" />, bg: "bg-gray-50" }
  ];

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.setData("text/plain", leadId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("text/plain");
    if (leadId) {
      const leadToMove = leads.find(l => l.id === leadId);
      if (leadToMove && leadToMove.status !== newStatus) {
        onUpdateLead({ ...leadToMove, status: newStatus as any });
      }
    }
    setDraggedLeadId(null);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "new": return "New";
      case "contacted": return "Contacted";
      case "pre_approved": return "Qualified";
      case "in_escrow": return "In Escrow";
      case "closed": return "Closed";
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#EAE7E0] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif font-bold text-2xl text-[#2D362E]">Master Lead Journey</h3>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
              Interactive Pipeline
            </span>
          </div>
          <p className="text-xs text-[#606C5D] mt-1 max-w-2xl">
            Drag and drop leads to seamlessly move them through the master journey pipeline. 
          </p>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-4 pb-4 h-[70vh] dashboard-horizontal-scrollbar">
        {columns.map(col => {
          const colLeads = leads.filter(l => {
            if (col.id === "closed") {
              return l.status === "closed" || l.status === "archived";
            }
            if (col.id === "pre_approved") {
              return l.status === "pre_approved" || l.status === "in_escrow";
            }
            return l.status === col.id;
          });

          return (
            <div 
              key={col.id} 
              className={`flex flex-col min-w-[300px] max-w-[350px] flex-1 rounded-2xl border border-[#EAE7E0] bg-white overflow-hidden shadow-sm`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className={`p-4 border-b border-[#EAE7E0] flex items-center justify-between ${col.bg}`}>
                <div className="flex items-center gap-2 font-bold text-sm text-[#2D362E]">
                  {col.icon}
                  {col.title}
                </div>
                <span className="bg-white text-[#606C5D] font-bold text-xs px-2 py-1 rounded-lg border border-[#EAE7E0]">
                  {colLeads.length}
                </span>
              </div>
              
              <div className="p-3 flex-1 overflow-y-auto space-y-3 dashboard-vertical-scrollbar bg-[#FAF9F5]/30">
                {colLeads.map(lead => (
                  <div 
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    className={`bg-white p-3.5 rounded-xl border border-[#EAE7E0] shadow-sm cursor-grab active:cursor-grabbing hover:border-[#4A5D4E]/40 transition-colors ${draggedLeadId === lead.id ? 'opacity-50' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-bold text-sm text-[#2D362E]">{lead.fullName}</div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        lead.intentScore === 'hot' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                        lead.intentScore === 'warm' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                        {lead.intentScore.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-[#606C5D] mb-1">{lead.targetPriceRange || "TBD"} • {lead.propertyType || "Home"}</div>
                    
                    <div className="mt-3 flex items-center gap-2">
                      <select 
                        value={lead.status === "in_escrow" ? "pre_approved" : lead.status === "archived" ? "closed" : lead.status}
                        onChange={(e) => onUpdateLead({ ...lead, status: e.target.value as any })}
                        className="w-full bg-[#FAF9F5] border border-[#EAE7E0] rounded-lg px-2 py-1.5 text-xs font-semibold text-[#2D362E]"
                      >
                        <option value="new">Move to New</option>
                        <option value="contacted">Move to Contacted</option>
                        <option value="pre_approved">Move to Qualified</option>
                        <option value="closed">Move to Closed</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
