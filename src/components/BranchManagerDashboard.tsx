import React, { useState } from "react";
import { 
  Users, TrendingUp, PieChart, BarChart3, Clock, Calendar, 
  Search, Filter, ChevronDown, Award, Target, Activity 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, LineChart, Line 
} from "recharts";

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

const teamData = [
  { id: 1, name: "Sarah Jenkins", activeLeads: 45, closedYTD: 28, avgDaysToClose: 24, brainUsage: 92, pairs: 12 },
  { id: 2, name: "Marcus Reed", activeLeads: 32, closedYTD: 19, avgDaysToClose: 28, brainUsage: 65, pairs: 5 },
  { id: 3, name: "Elena Rodriguez", activeLeads: 68, closedYTD: 41, avgDaysToClose: 21, brainUsage: 98, pairs: 18 },
  { id: 4, name: "David Chen", activeLeads: 24, closedYTD: 12, avgDaysToClose: 31, brainUsage: 40, pairs: 3 },
];

export const BranchManagerDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState("YTD");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#2D362E] to-[#4A5D4E] rounded-3xl p-6 sm:p-8 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-6 h-6 text-[#E7C19D]" />
              <h1 className="text-2xl font-bold font-display">Branch Manager Admin</h1>
            </div>
            <p className="text-emerald-100 opacity-90 max-w-2xl">
              Shadow team dashboards, track 2nd Brain utilization, monitor agent co-brand pairs, and analyze average days-to-close metrics across the branch.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-[#C18C5D] font-medium"
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
          { label: "Total Leads (YTD)", value: "845", trend: "+12%", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
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
                    <button className="text-xs bg-white border border-[#EAE7E0] hover:border-[#4A5D4E] text-[#4A5D4E] px-3 py-1.5 rounded-lg font-semibold transition-colors shadow-sm">
                      Shadow Dashboard
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
