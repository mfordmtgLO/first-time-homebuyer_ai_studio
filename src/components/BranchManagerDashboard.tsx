import React, { useState } from "react";
import { ProfessionalGuidesState } from "../types";
import { 
  Users, TrendingUp, PieChart, BarChart3, Clock, Calendar, 
  Search, Filter, ChevronDown, Award, Target, Activity, ShieldCheck,
  Download, FileSpreadsheet, Database, CheckCircle2, Layers
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, LineChart, Line 
} from "recharts";
import { SalesforceCsvExportModal } from "./SalesforceCsvExportModal";
import { 
  CrmExportFormat,
  triggerCrmCsvDownload,
  triggerSalesforceCsvDownload,
  triggerTotalExpertCsvDownload 
} from "../services/crmLeadExportService";

const performanceData = [
  { name: 'Jan', leads: 120, closed: 25 },
  { name: 'Feb', leads: 150, closed: 32 },
  { name: 'Mar', leads: 180, closed: 45 },
  { name: 'Apr', leads: 140, closed: 38 },
  { name: 'May', leads: 210, closed: 55 },
  { name: 'Jun', leads: 195, closed: 48 },
];

const sourceData = [
  { name: 'Agent Co-Brand', value: 45, color: '#4A5D4E' },
  { name: 'Roadmap App', value: 30, color: '#C18C5D' },
  { name: 'Chatbot Intake', value: 15, color: '#E7C19D' },
  { name: 'Paid Ads', value: 10, color: '#2D362E' },
];

interface BranchManagerDashboardProps {
  guidesState: ProfessionalGuidesState;
  onUpdateGuidesState: (newState: ProfessionalGuidesState | ((prev: ProfessionalGuidesState) => ProfessionalGuidesState)) => void;
  onTriggerToast?: (msg: string) => void;
}

export const BranchManagerDashboard: React.FC<BranchManagerDashboardProps> = ({ guidesState, onUpdateGuidesState, onTriggerToast }) => {
  const [dateRange, setDateRange] = useState("YTD");
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [modalFormat, setModalFormat] = useState<CrmExportFormat>("salesforce");
  const [localToast, setLocalToast] = useState<string | null>(null);

  const leads = guidesState.leads || [];

  const handleQuickDownloadCsv = (format: CrmExportFormat = "salesforce") => {
    if (leads.length === 0) {
      const msg = "No leads in current branch state to export.";
      if (onTriggerToast) onTriggerToast(msg);
      else {
        setLocalToast(msg);
        setTimeout(() => setLocalToast(null), 3000);
      }
      return;
    }

    const result = triggerCrmCsvDownload(
      format,
      leads,
      guidesState.loanOfficers || [],
      guidesState.agents || []
    );

    const formatName = format === "totalexpert" ? "Total Expert CRM" : "Salesforce CRM";
    const msg = `Downloaded ${result.rowCount} branch leads formatted for ${formatName} (${result.fileName})`;
    if (onTriggerToast) {
      onTriggerToast(msg);
    } else {
      setLocalToast(msg);
      setTimeout(() => setLocalToast(null), 3500);
    }
  };

  const teamData = guidesState.loanOfficers
    .filter(lo => lo.id !== guidesState.adminLoanOfficerId)
    .map(lo => {
      const pairsCount = guidesState.pairings.filter(p => p.loId === lo.id).length;
      // Generate deterministic pseudo-random metrics based on LO id
      const idNum = lo.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      
      return {
        id: lo.id,
        name: lo.name,
        activeLeads: (idNum % 50) + 10,
        closedYTD: (idNum % 30) + 5,
        avgDaysToClose: (idNum % 15) + 18,
        brainUsage: (idNum % 60) + 40,
        pairs: pairsCount || (idNum % 5) + 1,
        realId: lo.id
      };
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2D362E] to-[#4A5D4E] rounded-3xl p-6 sm:p-8 text-white shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-6 h-6 text-[#E7C19D]" />
              <h1 className="text-2xl font-bold font-display">Branch Performance & ROI</h1>
            </div>
            <p className="text-emerald-100 opacity-90 max-w-2xl">
              Shadow team dashboards, track 2nd Brain utilization, monitor agent co-brand pairs, and analyze average days-to-close metrics across the branch.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick Download Leads Buttons */}
            <div className="flex items-center bg-white/10 rounded-xl p-1 border border-white/20">
              <button
                onClick={() => handleQuickDownloadCsv("salesforce")}
                className="px-3 py-1.5 bg-[#00A1E0] hover:bg-[#0089BE] text-white rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                title="Download leads formatted for Salesforce CRM"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Salesforce CSV</span>
              </button>
              <button
                onClick={() => handleQuickDownloadCsv("totalexpert")}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm ml-1"
                title="Download leads formatted for Total Expert CRM"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Total Expert CSV</span>
              </button>
            </div>

            {/* Ingestion Studio Modal Trigger */}
            <button
              onClick={() => {
                setModalFormat("salesforce");
                setShowExportModal(true);
              }}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs transition-colors flex items-center gap-1.5 border border-white/20 shrink-0"
              title="View field mapping and preview CRM leads"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#00A1E0]" />
              <span>CRM Schema Studio</span>
            </button>

            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-[#C18C5D] font-medium text-xs sm:text-sm"
            >
              <option value="30" className="text-gray-900">Last 30 Days</option>
              <option value="90" className="text-gray-900">Last 90 Days</option>
              <option value="YTD" className="text-gray-900">Year to Date</option>
              <option value="ALL" className="text-gray-900">All Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Leads (Branch Roster)", value: leads.length > 0 ? String(leads.length) : "845", trend: "+12%", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Funded/Closed (YTD)", value: "158", trend: "+18%", icon: Award, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Avg Days to Close", value: "24.5", trend: "-2.3 days", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Active Agent Pairs", value: "38", trend: "+5", icon: Target, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-[#EAE7E0] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#606C5D] mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-bold text-[#2D362E]">{stat.value}</h3>
                <span className={`text-[10px] font-bold ${stat.trend.startsWith('+') ? 'text-emerald-600' : (stat.trend.includes('-') ? 'text-emerald-600' : 'text-red-600')} bg-white px-1.5 py-0.5 rounded-full border border-gray-100`}>
                  {stat.trend}
                </span>
              </div>
            </div>
            <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Enterprise CRM & Salesforce/Total Expert Leads Ingestion Hub */}
      <div className="bg-gradient-to-br from-[#1B365D] via-[#24426E] to-[#1B365D] rounded-3xl p-6 sm:p-7 text-white shadow-sm border border-[#2D4E7C]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/10 rounded-2xl border border-white/15 text-[#00A1E0] shrink-0">
              <Database className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-lg font-bold font-display">Enterprise CRM Lead Ingestion (Salesforce &amp; Total Expert)</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00A1E0]/20 text-[#00A1E0] border border-[#00A1E0]/30 uppercase tracking-wider">
                  RFC 4180 UTF-8 BOM
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Total Expert &amp; Jungo FSC Ready
                </span>
              </div>
              <p className="text-xs text-blue-100/85 mt-1.5 max-w-2xl leading-relaxed">
                Export branch homebuyer leads transformed according to the enterprise schemas for <strong>Salesforce Lead Object / Jungo CRM</strong> and <strong>Total Expert Mortgage Marketing Engine</strong>. Includes automatic contact name splitting, household creation, Total Expert owner email routing, standardized date formatting (ISO 8601 vs YYYY-MM-DD HH:mm:ss), TCPA opt-in audit stamps, and Realtor co-brand attribution.
              </p>
              <div className="flex items-center gap-3 sm:gap-4 mt-3 text-xs text-blue-200 flex-wrap">
                <span className="flex items-center gap-1.5 font-semibold text-white">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  {leads.length} Leads in Current State
                </span>
                <span className="text-blue-300/40">&bull;</span>
                <span>Salesforce (39 Fields)</span>
                <span className="text-blue-300/40">&bull;</span>
                <span>Total Expert (42 Fields)</span>
                <span className="text-blue-300/40">&bull;</span>
                <span>UTF-8 Byte Order Mark (BOM)</span>
              </div>
            </div>
          </div>

          <div className="flex sm:items-center gap-2.5 flex-col sm:flex-row shrink-0">
            <button
              onClick={() => {
                setModalFormat("salesforce");
                setShowExportModal(true);
              }}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 border border-white/20"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#00A1E0]" />
              CRM Schema Studio
            </button>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleQuickDownloadCsv("salesforce")}
                className="px-4 py-2.5 bg-[#00A1E0] hover:bg-[#0089BE] text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                title="Download Salesforce Lead CSV"
              >
                <Download className="w-4 h-4" />
                Salesforce
              </button>
              <button
                onClick={() => handleQuickDownloadCsv("totalexpert")}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                title="Download Total Expert Contact CSV"
              >
                <Download className="w-4 h-4" />
                Total Expert
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funnel/Volume Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-[#EAE7E0] shadow-xs">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-[#2D362E]">Lead to Funded Pipeline</h3>
              <p className="text-xs text-[#606C5D]">Monthly intake vs closed volume</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#606C5D' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#606C5D' }} />
                <RechartsTooltip 
                  cursor={{ fill: '#f9f9f9' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #EAE7E0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="leads" name="New Leads" fill="#EAE7E0" radius={[4, 4, 0, 0]} />
                <Bar dataKey="closed" name="Funded Loans" fill="#4A5D4E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Source Pie Chart */}
        <div className="bg-white p-6 rounded-3xl border border-[#EAE7E0] shadow-xs">
          <div className="mb-2">
            <h3 className="text-base font-bold text-[#2D362E]">Lead Sources</h3>
            <p className="text-xs text-[#606C5D]">Conversion origin distribution</p>
          </div>
          <div className="h-48 relative">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                   itemStyle={{ color: '#2D362E', fontWeight: 600, fontSize: '12px' }}
                />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {sourceData.map(source => (
              <div key={source.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: source.color }} />
                <span className="text-[10px] font-medium text-[#606C5D] truncate">{source.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Oversight Table */}
      <div className="bg-white rounded-3xl border border-[#EAE7E0] shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#EAE7E0] flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-[#2D362E]">Team Utilization & Performance</h3>
            <p className="text-xs text-[#606C5D]">Shadow downstream Loan Officers and track system adoption</p>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search team member..." 
              className="pl-9 pr-4 py-2 text-sm border border-[#EAE7E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C18C5D]"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {teamData.length === 0 ? (
          <div className="p-12 text-center text-[#606C5D]">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-bold text-[#2D362E] mb-2">No Team Members Found</h3>
            <p className="text-sm max-w-md mx-auto">You haven't added any downstream loan officers yet. Go to the main dashboard to add new loan officers to your branch.</p>
          </div>
        ) : (
        <table className="w-full text-sm text-left">
            <thead className="text-xs text-[#606C5D] uppercase bg-[#F9F8F4] border-b border-[#EAE7E0]">
              <tr>
                <th className="px-6 py-4 font-semibold">Loan Officer</th>
                <th className="px-6 py-4 font-semibold">Active Leads</th>
                <th className="px-6 py-4 font-semibold">Funded (YTD)</th>
                <th className="px-6 py-4 font-semibold">Avg Days to Close</th>
                <th className="px-6 py-4 font-semibold">2nd Brain Usage</th>
                <th className="px-6 py-4 font-semibold">Agent Pairs</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE7E0]">
              {teamData.map((lo) => (
                <tr key={lo.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#4A5D4E] text-white flex items-center justify-center font-bold text-xs">
                        {lo.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-[#2D362E]">{lo.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#606C5D] font-medium">{lo.activeLeads}</td>
                  <td className="px-6 py-4 font-bold text-[#2D362E]">{lo.closedYTD}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${lo.avgDaysToClose < 25 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {lo.avgDaysToClose} days
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden w-24">
                        <div 
                          className={`h-full ${lo.brainUsage > 80 ? 'bg-[#C18C5D]' : (lo.brainUsage > 50 ? 'bg-amber-500' : 'bg-red-400')}`}
                          style={{ width: `${lo.brainUsage}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-[#606C5D]">{lo.brainUsage}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-[#606C5D]">{lo.pairs}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onUpdateGuidesState(prev => ({ ...prev, currentUserId: lo.realId }))}
                      className="text-xs bg-white border border-[#EAE7E0] hover:border-[#4A5D4E] text-[#4A5D4E] px-3 py-1.5 rounded-lg font-semibold transition-colors shadow-sm">
                      Shadow Dashboard
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        </div>
      </div>

      {/* Local Toast Notification */}
      {localToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1B365D] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-300">
          <CheckCircle2 className="w-4 h-4 text-[#00A1E0] shrink-0" />
          <span>{localToast}</span>
        </div>
      )}

      {/* Salesforce & Total Expert CSV Export & Ingestion Studio Modal */}
      <SalesforceCsvExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        leads={leads}
        loanOfficers={guidesState.loanOfficers || []}
        agents={guidesState.agents || []}
        defaultFormat={modalFormat}
        onTriggerToast={onTriggerToast || setLocalToast}
      />
    </div>
  );
};
