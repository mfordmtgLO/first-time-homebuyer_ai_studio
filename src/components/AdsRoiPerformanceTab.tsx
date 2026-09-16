import React, { useState, useMemo } from "react";
import { Download, Printer, Calendar, TrendingUp, BarChart3, Target, Activity, Share2, Video, Sparkles } from "lucide-react";
import { CapturedLead, AdCampaignDraft } from "../types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface AdsRoiPerformanceTabProps {
  leads: CapturedLead[];
  adCampaignDrafts: AdCampaignDraft[];
}

export const AdsRoiPerformanceTab: React.FC<AdsRoiPerformanceTabProps> = ({ leads, adCampaignDrafts }) => {
  const [dateRange, setDateRange] = useState("all_time");

  const filteredLeads = useMemo(() => {
    let filtered = leads;
    if (dateRange !== "all_time") {
      const now = new Date();
      const cutoff = new Date();
      if (dateRange === "7") cutoff.setDate(now.getDate() - 7);
      if (dateRange === "30") cutoff.setDate(now.getDate() - 30);
      if (dateRange === "90") cutoff.setDate(now.getDate() - 90);
      filtered = filtered.filter(l => new Date(l.createdAt) >= cutoff);
    }
    return filtered;
  }, [leads, dateRange]);

  // Aggregate Data
  const adPerformance = useMemo(() => {
    // Break down by each Ad item
    return adCampaignDrafts.map(ad => {
      const generatedLeads = filteredLeads.filter(l => l.sourceCampaignId === ad.id || l.sourceCampaignName === ad.campaignName);
      const totalLeads = generatedLeads.length;
      const hotLeads = generatedLeads.filter(l => l.intentScore === 'hot').length;
      const estimatedSpend = (ad.dailyBudget || 15) * (dateRange === 'all_time' ? 30 : parseInt(dateRange)); // Rough estimate
      const estimatedRevenue = hotLeads * 3500; // Mock revenue per hot lead
      const roi = estimatedSpend > 0 ? ((estimatedRevenue - estimatedSpend) / estimatedSpend) * 100 : 0;
      
      return {
        ...ad,
        totalLeads,
        hotLeads,
        estimatedSpend,
        estimatedRevenue,
        roi: Math.round(roi)
      };
    }).sort((a, b) => b.roi - a.roi);
  }, [adCampaignDrafts, filteredLeads, dateRange]);

  const socialMediaPerformance = useMemo(() => {
    // For social media, we find leads where leadSource indicates social
    const socialSources = ["Facebook social", "Facebook story", "Facebook short", "Facebook reels", "Instagram post", "Instagram story", "Instagram short", "Instagram reels", "TikTok post", "YouTube channel list", "YouTube short", "YouTube reels"];
    return socialSources.map(source => {
      const generatedLeads = filteredLeads.filter(l => l.leadSource === source);
      const totalLeads = generatedLeads.length;
      const hotLeads = generatedLeads.filter(l => l.intentScore === 'hot').length;
      const estimatedSpend = 0; // Organic is free
      const estimatedRevenue = hotLeads * 3500; 
      
      return {
        name: source,
        totalLeads,
        hotLeads,
        estimatedSpend,
        estimatedRevenue,
        roi: totalLeads > 0 ? "Infinite (Organic)" : "0%"
      };
    }).filter(s => s.totalLeads > 0).sort((a, b) => b.totalLeads - a.totalLeads);
  }, [filteredLeads]);

  const combinedPlatformRoi = useMemo(() => {
    const platforms = ["Facebook ads", "Google ads", "Facebook social", "Instagram", "TikTok", "YouTube"];
    return platforms.map(platform => {
      const platformLeads = filteredLeads.filter(l => l.leadSource.toLowerCase().includes(platform.toLowerCase().split(' ')[0]));
      const totalLeads = platformLeads.length;
      const hotLeads = platformLeads.filter(l => l.intentScore === 'hot').length;
      const revenue = hotLeads * 3500;
      return { name: platform, totalLeads, revenue };
    }).filter(p => p.totalLeads > 0);
  }, [filteredLeads]);

  const exportCSV = () => {
    const headers = ["Campaign/Source Name", "Platform", "Total Leads", "Hot Leads", "Est. Spend", "Est. Revenue", "ROI"];
    const rows = [
      ...adPerformance.map(ad => [ad.campaignName, ad.platform, ad.totalLeads, ad.hotLeads, `$${ad.estimatedSpend}`, `$${ad.estimatedRevenue}`, `${ad.roi}%`]),
      ...socialMediaPerformance.map(s => [s.name, "Social", s.totalLeads, s.hotLeads, `$0`, `$${s.estimatedRevenue}`, s.roi])
    ];
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Ads_Posts_ROI_Performance.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const COLORS = ['#4A5D4E', '#D4A373', '#2D362E', '#9A9488', '#6B7A6F', '#EAE7E0'];

  return (
    <div className="bg-[#F9F8F4] min-h-screen p-6 sm:p-8 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-[#EAE7E0] shadow-sm print:hidden">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#4A5D4E] text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Enhanced Analytics
              </span>
            </div>
            <h1 className="text-2xl font-bold font-serif text-[#2D362E]">Ads & Posts ROI+Performance</h1>
            <p className="text-[#606C5D] text-sm mt-1">Live tracking of individual ad performance and social media organic ROI.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-[#F9F8F4] p-1.5 rounded-xl border border-[#EAE7E0] flex-1 sm:flex-none">
              <Calendar className="w-4 h-4 text-[#606C5D] ml-2" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-transparent border-none text-sm font-bold text-[#2D362E] focus:ring-0 cursor-pointer pr-8 w-full"
              >
                <option value="all_time">All Time</option>
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
              </select>
            </div>
            <button onClick={exportCSV} className="p-2.5 bg-white border border-[#EAE7E0] hover:bg-[#F9F8F4] rounded-xl transition-colors shadow-xs" title="Export CSV">
              <Download className="w-4 h-4 text-[#2D362E]" />
            </button>
            <button onClick={() => window.print()} className="p-2.5 bg-white border border-[#EAE7E0] hover:bg-[#F9F8F4] rounded-xl transition-colors shadow-xs" title="Save PDF">
              <Printer className="w-4 h-4 text-[#2D362E]" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Combined Platform ROI */}
          <div className="bg-white p-6 rounded-3xl border border-[#EAE7E0] shadow-sm lg:col-span-1">
            <h3 className="font-bold text-[#2D362E] mb-4 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#4A5D4E]" />
              Combined Platform ROI
            </h3>
            {combinedPlatformRoi.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={combinedPlatformRoi}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="revenue"
                    >
                      {combinedPlatformRoi.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: '1px solid #EAE7E0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-sm text-[#9A9488]">No data for selected range.</div>
            )}
            <div className="mt-4 space-y-2">
              {combinedPlatformRoi.map((p, i) => (
                <div key={p.name} className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="font-bold text-[#2D362E]">{p.name}</span>
                  </span>
                  <span className="text-[#606C5D]">{p.totalLeads} leads (${p.revenue})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Published Ads Breakdown */}
          <div className="bg-white rounded-3xl border border-[#EAE7E0] shadow-sm lg:col-span-2 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[#EAE7E0] bg-[#F9F8F4] flex items-center gap-2">
              <Target className="w-5 h-5 text-[#4A5D4E]" />
              <h3 className="font-bold text-[#2D362E]">Published Ads Breakdown ROI</h3>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#EAE7E0] bg-white">
                    <th className="px-6 py-3 text-[10px] uppercase font-bold text-[#9A9488]">Campaign Item</th>
                    <th className="px-6 py-3 text-[10px] uppercase font-bold text-[#9A9488]">Leads (Hot)</th>
                    <th className="px-6 py-3 text-[10px] uppercase font-bold text-[#9A9488]">Est. Spend</th>
                    <th className="px-6 py-3 text-[10px] uppercase font-bold text-[#9A9488]">Revenue</th>
                    <th className="px-6 py-3 text-[10px] uppercase font-bold text-[#9A9488]">ROI %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE7E0]">
                  {adPerformance.slice(0, 5).map(ad => (
                    <tr key={ad.id} className="hover:bg-[#F9F8F4] transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-[#2D362E] truncate w-48">{ad.campaignName}</p>
                        <p className="text-[10px] text-[#606C5D] uppercase">{ad.platform}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-[#2D362E]">
                          <span className="font-bold">{ad.totalLeads}</span>
                          <span className="text-[10px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded-full">
                            {ad.hotLeads} hot
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#606C5D]">${ad.estimatedSpend.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm font-bold text-emerald-700">${ad.estimatedRevenue.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                          ad.roi > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {ad.roi > 0 ? '+' : ''}{ad.roi}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  {adPerformance.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-[#9A9488]">No active ads match this date range.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Social Media Breakdown */}
          <div className="bg-white rounded-3xl border border-[#EAE7E0] shadow-sm lg:col-span-3 overflow-hidden">
            <div className="p-6 border-b border-[#EAE7E0] bg-[#F9F8F4] flex items-center gap-2">
              <Share2 className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-[#2D362E]">Social Media Sources Breakdown ROI</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#EAE7E0] bg-white">
                    <th className="px-6 py-3 text-[10px] uppercase font-bold text-[#9A9488]">Social Post/Source</th>
                    <th className="px-6 py-3 text-[10px] uppercase font-bold text-[#9A9488]">Leads (Hot)</th>
                    <th className="px-6 py-3 text-[10px] uppercase font-bold text-[#9A9488]">Cost</th>
                    <th className="px-6 py-3 text-[10px] uppercase font-bold text-[#9A9488]">Est. Value</th>
                    <th className="px-6 py-3 text-[10px] uppercase font-bold text-[#9A9488]">ROI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE7E0]">
                  {socialMediaPerformance.map(social => (
                    <tr key={social.name} className="hover:bg-purple-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4 text-purple-400" />
                          <span className="text-sm font-bold text-[#2D362E]">{social.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-[#2D362E]">
                          <span className="font-bold">{social.totalLeads}</span>
                          <span className="text-[10px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded-full">
                            {social.hotLeads} hot
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#606C5D] bg-green-50/50">Free (Organic)</td>
                      <td className="px-6 py-4 text-sm font-bold text-emerald-700">${social.estimatedRevenue.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                          <Sparkles className="w-3 h-3" /> {social.roi}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {socialMediaPerformance.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-[#9A9488]">No social media leads match this date range.</td>
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
