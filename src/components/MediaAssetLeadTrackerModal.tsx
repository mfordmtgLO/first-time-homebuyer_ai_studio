import React, { useState, useMemo, useEffect } from "react";
import { X, Calendar, Download, Search, Printer, Activity, UserPlus, Target } from "lucide-react";
import { CapturedLead, AdQueueItem } from "../types"; // Will update types.ts to export AdQueueItem if needed
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface MediaAssetLeadTrackerModalProps {
  assetId: string;
  assetName: string;
  allLeads: CapturedLead[];
  onClose: () => void;
}

export const MediaAssetLeadTrackerModal: React.FC<MediaAssetLeadTrackerModalProps> = ({
  assetId,
  assetName,
  allLeads,
  onClose
}) => {
  const [dateRange, setDateRange] = useState("all_time");
  const [searchSource, setSearchSource] = useState("");

  const filteredLeads = useMemo(() => {
    let filtered = allLeads.filter(l => l.sourceCampaignId === assetId || l.sourceCampaignName === assetName);
    
    // Apply Date Range
    if (dateRange !== "all_time") {
      const now = new Date();
      const cutoff = new Date();
      if (dateRange === "7") cutoff.setDate(now.getDate() - 7);
      if (dateRange === "30") cutoff.setDate(now.getDate() - 30);
      if (dateRange === "90") cutoff.setDate(now.getDate() - 90);
      filtered = filtered.filter(l => new Date(l.createdAt) >= cutoff);
    }
    
    // Apply Source Search
    if (searchSource.trim()) {
      filtered = filtered.filter(l => l.leadSource.toLowerCase().includes(searchSource.toLowerCase()));
    }
    
    // Sort chronological
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allLeads, assetId, assetName, dateRange, searchSource]);

  const sourceBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredLeads.forEach(l => {
      counts[l.leadSource] = (counts[l.leadSource] || 0) + 1;
    });
    return Object.keys(counts).map(k => ({ name: k, value: counts[k] })).sort((a, b) => b.value - a.value);
  }, [filteredLeads]);

  const exportCSV = () => {
    const headers = ["Date", "Name", "Source", "Status", "Intent"];
    const rows = filteredLeads.map(l => [
      new Date(l.createdAt).toLocaleDateString(),
      l.fullName,
      l.leadSource,
      l.status,
      l.intentScore
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Leads_Tracker_${assetName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200 print:bg-white print:p-0">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden print:w-full print:max-h-none print:shadow-none print:rounded-none">
        
        {/* Header */}
        <div className="p-6 border-b border-[#EAE7E0] flex justify-between items-center bg-[#F9F8F4] print:hidden">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-purple-100 text-purple-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">Asset Analytics</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1">
                <Activity className="w-3 h-3" /> Live Tracking
              </span>
            </div>
            <h2 className="text-xl font-bold font-serif text-[#2D362E]">{assetName}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportCSV} className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-[#EAE7E0] transition-colors" title="Export CSV">
              <Download className="w-4 h-4 text-[#606C5D]" />
            </button>
            <button onClick={handlePrint} className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-[#EAE7E0] transition-colors" title="Save PDF / Print">
              <Printer className="w-4 h-4 text-[#606C5D]" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors ml-2">
              <X className="w-5 h-5 text-[#2D362E]" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white print:p-0">
          
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center print:hidden">
            <div className="flex items-center gap-4 w-full sm:w-auto bg-[#F9F8F4] p-1.5 rounded-xl border border-[#EAE7E0]">
              <Calendar className="w-4 h-4 text-[#606C5D] ml-2" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-transparent border-none text-sm font-bold text-[#2D362E] focus:ring-0 cursor-pointer pr-8"
              >
                <option value="all_time">All Time</option>
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
              </select>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#606C5D]" />
              <input
                type="text"
                placeholder="Search ad source (e.g., Facebook, TikTok)..."
                value={searchSource}
                onChange={(e) => setSearchSource(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-[#EAE7E0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A373]/30"
              />
            </div>
          </div>

          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-sm flex flex-col justify-between">
              <UserPlus className="w-6 h-6 text-emerald-200 mb-4" />
              <div>
                <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">Total Leads</p>
                <h4 className="text-4xl font-serif">{filteredLeads.length}</h4>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-[#F9F8F4] border border-[#EAE7E0] shadow-sm flex flex-col justify-between print:border-gray-300">
              <Target className="w-6 h-6 text-[#4A5D4E] mb-4" />
              <div>
                <p className="text-[#606C5D] text-xs font-bold uppercase tracking-wider mb-1">Top Source</p>
                <h4 className="text-xl font-bold text-[#2D362E] truncate">
                  {sourceBreakdown.length > 0 ? sourceBreakdown[0].name : "N/A"}
                </h4>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-[#F9F8F4] border border-[#EAE7E0] shadow-sm flex flex-col justify-between print:border-gray-300">
              <Activity className="w-6 h-6 text-[#4A5D4E] mb-4" />
              <div>
                <p className="text-[#606C5D] text-xs font-bold uppercase tracking-wider mb-1">Hot Leads Captured</p>
                <h4 className="text-xl font-bold text-[#2D362E]">
                  {filteredLeads.filter(l => l.intentScore === 'hot').length}
                </h4>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white p-4 rounded-2xl border border-[#EAE7E0] print:border-gray-300">
            <h3 className="font-bold text-[#2D362E] mb-4 text-sm">Leads by Source Category</h3>
            {sourceBreakdown.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sourceBreakdown} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#EAE7E0" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12, fill: "#606C5D" }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: '1px solid #EAE7E0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                    <Bar dataKey="value" fill="#4A5D4E" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-sm text-[#9A9488]">No source data available for this filter.</div>
            )}
          </div>

          {/* Chronological Leads Table */}
          <div className="bg-white rounded-2xl border border-[#EAE7E0] overflow-hidden print:border-gray-300">
            <div className="p-4 border-b border-[#EAE7E0] bg-[#F9F8F4]">
              <h3 className="font-bold text-[#2D362E] text-sm">Chronological Lead Intake ({filteredLeads.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#EAE7E0] bg-white">
                    <th className="px-4 py-3 text-[10px] uppercase font-bold text-[#9A9488]">Date</th>
                    <th className="px-4 py-3 text-[10px] uppercase font-bold text-[#9A9488]">Lead Name</th>
                    <th className="px-4 py-3 text-[10px] uppercase font-bold text-[#9A9488]">Source Platform</th>
                    <th className="px-4 py-3 text-[10px] uppercase font-bold text-[#9A9488]">Intent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE7E0]">
                  {filteredLeads.map(lead => (
                    <tr key={lead.id} className="hover:bg-[#F9F8F4] transition-colors">
                      <td className="px-4 py-3 text-xs text-[#606C5D]">
                        {new Date(lead.createdAt).toLocaleDateString()} {new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-[#2D362E]">{lead.fullName}</td>
                      <td className="px-4 py-3 text-xs">
                        <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full border border-gray-200">
                          {lead.leadSource}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          lead.intentScore === 'hot' ? 'bg-red-100 text-red-700' :
                          lead.intentScore === 'warm' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {lead.intentScore}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredLeads.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-sm text-[#9A9488]">
                        No leads match this filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
