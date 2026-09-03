import React, { useState, useMemo } from "react";
import { 
  CheckSquare, 
  Sparkles, 
  Building, 
  Send, 
  Mail, 
  Phone, 
  UserPlus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  MapPin, 
  DollarSign, 
  Plus, 
  X, 
  Tag, 
  Share2,
  ExternalLink,
  Flame,
  FileText
} from "lucide-react";
import { CapturedLead, PropertyListing, RealEstateAgentProfile, CurationTask, LoanOfficerProfile } from "../types";
import { OutreachHistoryBadge } from "./OutreachHistoryBadge";

interface TaskManagementPanelProps {
  leads: CapturedLead[];
  properties: PropertyListing[];
  agents: RealEstateAgentProfile[];
  loanOfficer: LoanOfficerProfile;
  onOpenSmsMessaging?: (lead: CapturedLead) => void;
  onOpenEmailOutreach?: (lead: CapturedLead) => void;
  onUpdateLead?: (updatedLead: CapturedLead) => void;
  onTriggerToast?: (msg: string) => void;
}

export const TaskManagementPanel: React.FC<TaskManagementPanelProps> = ({
  leads = [],
  properties = [],
  agents = [],
  loanOfficer,
  onOpenSmsMessaging,
  onOpenEmailOutreach,
  onUpdateLead,
  onTriggerToast
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAgentAssignments, setSelectedAgentAssignments] = useState<Record<string, string>>({});
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // Custom task status override state (persisted locally per leadId)
  const [taskStateMap, setTaskStateMap] = useState<Record<string, {
    status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
    notes?: string;
    completedAt?: string;
    assignedAgentId?: string;
  }>>({});

  // Manual tasks created by LO
  const [manualTasks, setManualTasks] = useState<CurationTask[]>([]);

  // Automatically detect leads tagged with 'chat_listings' or custom listings requests
  const generatedCurationTasks = useMemo(() => {
    const tasks: CurationTask[] = [];

    leads.forEach(lead => {
      const isChatListings = 
        lead.leadPathTag?.toLowerCase().includes("chat_listings") ||
        lead.leadPathTag?.toLowerCase().includes("curated listings") ||
        lead.notes?.toLowerCase().includes("chat_listings") ||
        lead.notes?.toLowerCase().includes("curated list") ||
        lead.sendSampleHomes === true ||
        (lead.interactedSourceType === 'chatbot' && (lead.notes?.toLowerCase().includes("homes") || lead.notes?.toLowerCase().includes("properties")));

      if (isChatListings) {
        const customState = taskStateMap[lead.id];
        const requestedCity = lead.taggedCityArea || lead.preferredLocations || "Mid-Willamette Valley";
        const budget = lead.targetPriceRange || "$350,000 - $450,000";

        // Find matching properties
        const matchedPropIds = properties.filter(p => {
          const cityMatch = requestedCity.toLowerCase().includes(p.city.toLowerCase()) || 
                            p.city.toLowerCase().includes(requestedCity.toLowerCase());
          const maxPrice = lead.targetPriceRange ? parseInt(lead.targetPriceRange.replace(/[^0-9]/g, "")) || 400000 : 400000;
          const priceMatch = p.price <= (maxPrice * 1.15);
          return cityMatch || priceMatch;
        }).map(p => p.id);

        tasks.push({
          id: `task-curate-${lead.id}`,
          leadId: lead.id,
          leadName: lead.fullName,
          leadEmail: lead.email,
          leadPhone: lead.phone,
          sourceTag: lead.leadPathTag || "Chatbot Custom Listings (chat_listings)",
          requestedCityArea: requestedCity,
          targetPriceRange: budget,
          grantInterest: lead.grantInterest || false,
          status: customState?.status || (lead.status === 'contacted' ? 'in_progress' : lead.status === 'pre_approved' ? 'completed' : 'pending'),
          priority: lead.intentScore === 'hot' ? 'urgent' : 'high',
          createdAt: lead.createdAt || new Date().toISOString(),
          completedAt: customState?.completedAt,
          matchedPropertyIds: matchedPropIds,
          assignedAgentId: customState?.assignedAgentId || lead.assignedAgentId,
          notes: customState?.notes || lead.notes
        });
      }
    });

    // Merge manual tasks
    return [...tasks, ...manualTasks];
  }, [leads, properties, taskStateMap, manualTasks]);

  // Filter tasks based on search & tab
  const filteredTasks = useMemo(() => {
    return generatedCurationTasks.filter(task => {
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        task.leadName.toLowerCase().includes(q) || 
        task.requestedCityArea.toLowerCase().includes(q) ||
        task.sourceTag.toLowerCase().includes(q);

      return matchesStatus && matchesSearch;
    });
  }, [generatedCurationTasks, statusFilter, searchQuery]);

  // Counts
  const pendingCount = generatedCurationTasks.filter(t => t.status === 'pending').length;
  const inProgressCount = generatedCurationTasks.filter(t => t.status === 'in_progress').length;
  const completedCount = generatedCurationTasks.filter(t => t.status === 'completed').length;

  const handleUpdateTaskStatus = (leadId: string, newStatus: 'pending' | 'in_progress' | 'completed' | 'dismissed') => {
    setTaskStateMap(prev => ({
      ...prev,
      [leadId]: {
        ...prev[leadId],
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined
      }
    }));

    if (onTriggerToast) {
      const statusLabel = newStatus === 'completed' ? 'Marked Complete' : newStatus === 'in_progress' ? 'Moved to In Progress' : 'Updated';
      onTriggerToast(`Task status updated: ${statusLabel}`);
    }
  };

  const handleAssignRealtor = (task: CurationTask, agentId: string) => {
    setSelectedAgentAssignments(prev => ({ ...prev, [task.leadId]: agentId }));
    setTaskStateMap(prev => ({
      ...prev,
      [task.leadId]: {
        ...prev[task.leadId],
        status: prev[task.leadId]?.status || 'in_progress',
        assignedAgentId: agentId
      }
    }));

    // Update lead record if handler exists
    const targetLead = leads.find(l => l.id === task.leadId);
    if (targetLead && onUpdateLead) {
      const assignedAgent = agents.find(a => a.id === agentId);
      onUpdateLead({
        ...targetLead,
        assignedAgentId: agentId,
        assignedAgent: assignedAgent?.name
      });
    }

    const agent = agents.find(a => a.id === agentId);
    if (onTriggerToast) {
      onTriggerToast(`Co-assigned ${task.leadName}'s curation task to Realtor ${agent?.name || 'Partner'}!`);
    }
  };

  // Form state for creating a manual curation task
  const [newLeadId, setNewLeadId] = useState<string>('');
  const [newCity, setNewCity] = useState<string>('');
  const [newPriority, setNewPriority] = useState<'urgent' | 'high' | 'normal'>('high');

  const handleCreateManualTask = (e: React.FormEvent) => {
    e.preventDefault();
    const lead = leads.find(l => l.id === newLeadId);
    if (!lead) return;

    const newTask: CurationTask = {
      id: `manual-task-${Date.now()}`,
      leadId: lead.id,
      leadName: lead.fullName,
      leadEmail: lead.email,
      leadPhone: lead.phone,
      sourceTag: "Manual LO Curation Dispatch (chat_listings)",
      requestedCityArea: newCity || lead.taggedCityArea || "Willamette Valley",
      targetPriceRange: lead.targetPriceRange || "$350,000 - $450,000",
      grantInterest: lead.grantInterest || false,
      status: "pending",
      priority: newPriority,
      createdAt: new Date().toISOString(),
      matchedPropertyIds: properties.slice(0, 3).map(p => p.id)
    };

    setManualTasks(prev => [newTask, ...prev]);
    setShowCreateModal(false);
    setNewLeadId('');
    setNewCity('');
    if (onTriggerToast) onTriggerToast(`Created new curation task for ${lead.fullName}!`);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#EAE7E0] shadow-xs space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#F0EDF4] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Automated Lead Task Engine</span>
            </span>
            <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
              chat_listings Source Listener Active
            </span>
          </div>
          <h2 className="text-xl font-bold font-serif text-[#2D362E] flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-emerald-700" />
            <span>Listing Curation & Property Matching Queue</span>
          </h2>
          <p className="text-xs text-[#5C6F60]">
            Automatically generates listing curation tasks whenever new buyer leads request property samples via AI Chatbot or Intake flows.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-300" />
            <span>New Curation Task</span>
          </button>
        </div>
      </div>

      {/* Stats KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setStatusFilter('all')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'all' ? 'bg-[#2D362E] text-white border-[#2D362E] shadow-sm' : 'bg-[#F9F8F6] hover:bg-[#F2EFEA] border-[#EAE7E0] text-[#2D362E]'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider opacity-80">Total Queue</div>
          <div className="text-2xl font-bold font-serif mt-0.5">{generatedCurationTasks.length}</div>
        </button>

        <button
          onClick={() => setStatusFilter('pending')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'pending' ? 'bg-amber-600 text-white border-amber-600 shadow-sm' : 'bg-amber-50/70 hover:bg-amber-100/70 border-amber-200/80 text-amber-900'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider opacity-80 flex items-center justify-between">
            <span>Pending Curation</span>
            <AlertCircle className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-bold font-serif mt-0.5">{pendingCount}</div>
        </button>

        <button
          onClick={() => setStatusFilter('in_progress')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'in_progress' ? 'bg-sky-600 text-white border-sky-600 shadow-sm' : 'bg-sky-50/70 hover:bg-sky-100/70 border-sky-200/80 text-sky-900'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider opacity-80 flex items-center justify-between">
            <span>In Progress</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-bold font-serif mt-0.5">{inProgressCount}</div>
        </button>

        <button
          onClick={() => setStatusFilter('completed')}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            statusFilter === 'completed' ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm' : 'bg-emerald-50/70 hover:bg-emerald-100/70 border-emerald-200/80 text-emerald-900'
          }`}
        >
          <div className="text-[11px] font-bold uppercase tracking-wider opacity-80 flex items-center justify-between">
            <span>Completed</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-bold font-serif mt-0.5">{completedCount}</div>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#F9F8F6] p-3 rounded-2xl border border-[#EAE7E0]">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#8C9A8E] absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by lead name, city, tag..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#D5D0C5] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-[#2D362E]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-[#5C6F60]">
          <Filter className="w-3.5 h-3.5" />
          <span>Showing {filteredTasks.length} of {generatedCurationTasks.length} tasks</span>
        </div>
      </div>

      {/* Task List Cards */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-[#EAE7E0] rounded-3xl space-y-3 bg-[#FAF8F5]">
          <Building className="w-12 h-12 text-[#8C9A8E] mx-auto opacity-50" />
          <div className="space-y-1">
            <h3 className="font-bold text-[#2D362E] text-sm">No Curation Tasks Found</h3>
            <p className="text-xs text-[#5C6F60] max-w-sm mx-auto">
              No tasks match your current filter criteria. When new buyer leads request property samples via <code className="bg-emerald-100 text-emerald-900 px-1 py-0.5 rounded text-[10px]">chat_listings</code>, curation tasks will appear here automatically.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map(task => {
            const leadObj = leads.find(l => l.id === task.leadId);
            const taskAgentId = selectedAgentAssignments[task.leadId] || task.assignedAgentId;
            const assignedAgent = agents.find(a => a.id === taskAgentId);

            // Fetch matched properties for this lead
            const matchedProps = properties.filter(p => task.matchedPropertyIds?.includes(p.id) || p.city.toLowerCase().includes(task.requestedCityArea.toLowerCase())).slice(0, 2);

            return (
              <div
                key={task.id}
                className={`bg-white rounded-2xl border transition-all p-5 space-y-4 shadow-2xs ${
                  task.status === 'completed' 
                    ? 'border-emerald-200 bg-emerald-50/20' 
                    : task.priority === 'urgent'
                    ? 'border-amber-300 ring-1 ring-amber-200'
                    : 'border-[#EAE7E0] hover:border-emerald-300'
                }`}
              >
                {/* Task Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#F0EDF4] pb-3.5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        task.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : task.status === 'in_progress'
                          ? 'bg-sky-100 text-sky-800 border border-sky-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}>
                        {task.status === 'completed' ? '✓ Completed' : task.status === 'in_progress' ? '⌛ In Progress' : '⚡ Action Required'}
                      </span>

                      <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 text-[10px] font-bold border border-purple-200 flex items-center gap-1">
                        <Tag className="w-3 h-3 text-purple-600" />
                        <span>Source: chat_listings</span>
                      </span>

                      {task.priority === 'urgent' && (
                        <span className="px-2 py-0.5 rounded-md bg-rose-500 text-white text-[9px] font-extrabold flex items-center gap-1 uppercase">
                          <Flame className="w-3 h-3" />
                          <span>HOT LEAD</span>
                        </span>
                      )}

                      {task.grantInterest && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-700 text-white text-[10px] font-bold">
                          $0 USDA / DPA Eligible
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold font-serif text-[#2D362E]">
                        Curate Property Packet for {task.leadName}
                      </h3>
                      {leadObj && <OutreachHistoryBadge lead={leadObj} compact={true} />}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-[#5C6F60] flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                        Target: <strong className="text-[#2D362E]">{task.requestedCityArea}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
                        Budget: <strong className="text-[#2D362E]">{task.targetPriceRange}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-emerald-700" />
                        Requested: {new Date(task.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Status Toggle Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleUpdateTaskStatus(task.leadId, 'pending')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        task.status === 'pending' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Pending
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateTaskStatus(task.leadId, 'in_progress')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        task.status === 'in_progress' ? 'bg-sky-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      In Progress
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateTaskStatus(task.leadId, 'completed')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        task.status === 'completed' ? 'bg-emerald-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      ✓ Complete
                    </button>
                  </div>
                </div>

                {/* Property Match & Actions Body Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Matched Listings Preview (2 columns) */}
                  <div className="md:col-span-2 bg-[#FAF9F6] border border-[#EAE7E0] rounded-xl p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#2D362E] flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-emerald-700" />
                        <span>MLS Matched Homes in {task.requestedCityArea} ({matchedProps.length}):</span>
                      </span>
                      <span className="text-[10px] text-emerald-800 font-medium">Auto-Filtered by Price & Location</span>
                    </div>

                    {matchedProps.length === 0 ? (
                      <p className="text-xs text-gray-500 italic py-2">
                        No direct MLS property matches found for this location/budget. Consider expanding search parameters.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {matchedProps.map(prop => (
                          <div key={prop.id} className="bg-white p-2.5 rounded-lg border border-[#EAE7E0] text-xs space-y-1 shadow-2xs">
                            <div className="font-bold text-[#2D362E] truncate">{prop.address}</div>
                            <div className="text-[#5C6F60] flex items-center justify-between">
                              <span className="font-bold text-emerald-800">${prop.price.toLocaleString()}</span>
                              <span>{prop.beds}b / {prop.baths}ba</span>
                            </div>
                            {prop.overlayEligibility?.usdaEligible && (
                              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded block text-center">
                                $0 USDA DOWN ELIGIBLE
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick Action Hub & Agent Co-Assignment (1 column) */}
                  <div className="space-y-3 bg-white p-3.5 rounded-xl border border-[#EAE7E0] flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-[#2D362E] block">1-Click Dispatch Actions:</span>
                      
                      <div className="space-y-1.5">
                        {leadObj && onOpenSmsMessaging && (
                          <button
                            type="button"
                            onClick={() => onOpenSmsMessaging(leadObj)}
                            className="w-full py-2 px-3 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl flex items-center justify-between transition-colors cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5">
                              <Send className="w-3.5 h-3.5 text-emerald-300" />
                              <span>Send Packet via SMS</span>
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-emerald-300" />
                          </button>
                        )}

                        {leadObj && onOpenEmailOutreach && (
                          <button
                            type="button"
                            onClick={() => onOpenEmailOutreach(leadObj)}
                            className="w-full py-2 px-3 bg-[#4A5D4E] hover:bg-[#38463B] text-white text-xs font-bold rounded-xl flex items-center justify-between transition-colors cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-[#E7C19D]" />
                              <span>Email Listings Portfolio</span>
                            </span>
                            <ChevronRight className="w-3.5 h-3.5 text-[#E7C19D]" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Realtor Partner Co-Assignment Selector */}
                    <div className="pt-2 border-t border-[#F0EDF4] space-y-1">
                      <label className="text-[10px] font-bold text-[#5C6F60] uppercase block">
                        Co-Assign to Partner Realtor:
                      </label>
                      <select
                        value={taskAgentId || ''}
                        onChange={(e) => handleAssignRealtor(task, e.target.value)}
                        className="w-full text-xs p-1.5 bg-[#FAF9F6] border border-[#D5D0C5] rounded-lg text-[#2D362E] font-medium"
                      >
                        <option value="">Unassigned Partner</option>
                        {agents.map(agent => (
                          <option key={agent.id} value={agent.id}>
                            {agent.name} ({agent.brokerage})
                          </option>
                        ))}
                      </select>
                      {assignedAgent && (
                        <p className="text-[10px] text-emerald-800 font-bold flex items-center gap-1 mt-1">
                          <UserPlus className="w-3 h-3 text-emerald-600" />
                          Assigned: {assignedAgent.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manual Curation Task Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-[#EAE7E0] space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0EDF4] pb-3">
              <h3 className="font-bold text-base font-serif text-[#2D362E] flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-700" />
                <span>Create Curation Task</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualTask} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#2D362E]">Select Target Lead:</label>
                <select
                  required
                  value={newLeadId}
                  onChange={(e) => setNewLeadId(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF9F6] border border-[#D5D0C5] rounded-xl text-[#2D362E]"
                >
                  <option value="">Select a lead...</option>
                  {leads.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.fullName} ({l.taggedCityArea || l.preferredLocations || "Oregon"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#2D362E]">Requested City / Market Area:</label>
                <input
                  type="text"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  placeholder="e.g. Corvallis, Albany, Salem"
                  className="w-full p-2.5 bg-[#FAF9F6] border border-[#D5D0C5] rounded-xl text-[#2D362E]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#2D362E]">Priority Tier:</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full p-2.5 bg-[#FAF9F6] border border-[#D5D0C5] rounded-xl text-[#2D362E]"
                >
                  <option value="urgent">Urgent / Hot Buyer</option>
                  <option value="high">High Priority</option>
                  <option value="normal">Normal Priority</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
