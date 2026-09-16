import React, { useState, useMemo } from "react";
import { ShieldCheck, AlertTriangle, Plus, DollarSign, Download, Printer, Search, Calendar, Users, CheckCircle2, Trash2 } from "lucide-react";
import { RespaCostSharingExpense, LoanOfficerProfile, RealEstateAgentProfile } from "../types";

interface RespaCostSharingHubProps {
  loanOfficer: LoanOfficerProfile;
  activeAgent?: RealEstateAgentProfile;
  expenses: RespaCostSharingExpense[];
  onAddExpense: (expense: RespaCostSharingExpense) => void;
  onDeleteExpense: (id: string) => void;
}

export const RespaCostSharingHub: React.FC<RespaCostSharingHubProps> = ({
  loanOfficer,
  activeAgent,
  expenses = [],
  onAddExpense,
  onDeleteExpense
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [ventureName, setVentureName] = useState("");
  const [category, setCategory] = useState<RespaCostSharingExpense['category']>('facebook_ad');
  const [totalAmount, setTotalAmount] = useState<number>(300);
  const [loPaidAmount, setLoPaidAmount] = useState<number>(150);
  const [agentPaidAmount, setAgentPaidAmount] = useState<number>(150);
  const [agentName, setAgentName] = useState(activeAgent?.name || "Partner Agent");
  const [notes, setNotes] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Initial mock data if empty
  const defaultExpenses: RespaCostSharingExpense[] = expenses.length > 0 ? expenses : [
    {
      id: "resp-1",
      ventureName: "First-Time Homebuyer 2-1 Buydown FB Ad Campaign",
      category: "facebook_ad",
      date: "2026-09-01",
      totalAmount: 450,
      loPaidAmount: 225,
      agentPaidAmount: 225,
      loSharePercentage: 50,
      agentSharePercentage: 50,
      isCompliant: true,
      agentName: "Sarah Connor (Realty One)",
      notes: "50/50 split invoice verified."
    },
    {
      id: "resp-2",
      ventureName: "Downtown Open House Weekend Banner & Flyers",
      category: "open_house",
      date: "2026-09-05",
      totalAmount: 200,
      loPaidAmount: 120,
      agentPaidAmount: 80,
      loSharePercentage: 60,
      agentSharePercentage: 40,
      isCompliant: true,
      agentName: "Michael Scott (Keller Williams)",
      notes: "LO paid 60% for co-branded mortgage flyers."
    },
    {
      id: "resp-3",
      ventureName: "Monthly CRM & Co-Branded Tech Stack Fees",
      category: "tech_stack",
      date: "2026-09-01",
      totalAmount: 350,
      loPaidAmount: 140,
      agentPaidAmount: 210,
      loSharePercentage: 40,
      agentSharePercentage: 60,
      isCompliant: false, // Flagged RESPA warning!
      agentName: "Jessica Pearson (RE/MAX)",
      notes: "⚠️ Warning: Agent paid 60% which exceeds 50% threshold. Requires adjustment."
    }
  ];

  const allExpenses = expenses.length > 0 ? expenses : defaultExpenses;

  const handleTotalChange = (val: number) => {
    setTotalAmount(val);
    setLoPaidAmount(val / 2);
    setAgentPaidAmount(val / 2);
  };

  const handleLoChange = (val: number) => {
    setLoPaidAmount(val);
    setAgentPaidAmount(Math.max(0, totalAmount - val));
  };

  const handleAgentChange = (val: number) => {
    setAgentPaidAmount(val);
    setLoPaidAmount(Math.max(0, totalAmount - val));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = totalAmount || 1;
    const loPct = Math.round((loPaidAmount / total) * 100);
    const agentPct = Math.round((agentPaidAmount / total) * 100);
    const isComp = agentPct <= 50;

    const newExpense: RespaCostSharingExpense = {
      id: "resp-" + Date.now(),
      ventureName: ventureName || "Joint Marketing Venture",
      category,
      date: new Date().toISOString().split('T')[0],
      totalAmount,
      loPaidAmount,
      agentPaidAmount,
      loSharePercentage: loPct,
      agentSharePercentage: agentPct,
      isCompliant: isComp,
      agentName,
      notes
    };

    onAddExpense(newExpense);
    setShowAddModal(false);
    setVentureName("");
    setNotes("");
  };

  const filteredExpenses = useMemo(() => {
    return allExpenses.filter(exp => {
      if (categoryFilter !== "all" && exp.category !== categoryFilter) return false;
      if (searchQuery.trim() && !exp.ventureName.toLowerCase().includes(searchQuery.toLowerCase()) && !exp.agentName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [allExpenses, categoryFilter, searchQuery]);

  const totals = useMemo(() => {
    let totalSpent = 0;
    let loSpent = 0;
    let agentSpent = 0;
    let violations = 0;

    allExpenses.forEach(exp => {
      totalSpent += exp.totalAmount;
      loSpent += exp.loPaidAmount;
      agentSpent += exp.agentPaidAmount;
      if (!exp.isCompliant) violations++;
    });

    return { totalSpent, loSpent, agentSpent, violations };
  }, [allExpenses]);

  const exportCSV = () => {
    const headers = ["Venture Name", "Category", "Agent Partner", "Total Amount", "LO Paid", "Agent Paid", "LO %", "Agent %", "RESPA Status", "Date"];
    const rows = allExpenses.map(e => [
      e.ventureName,
      e.category,
      e.agentName,
      `$${e.totalAmount}`,
      `$${e.loPaidAmount}`,
      `$${e.agentPaidAmount}`,
      `${e.loSharePercentage}%`,
      `${e.agentSharePercentage}%`,
      e.isCompliant ? "Compliant" : "Violation (>50% Agent)",
      e.date
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `RESPA_Cost_Sharing_Audit.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#F9F8F4] min-h-screen p-6 sm:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-[#EAE7E0] shadow-sm print:hidden">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#4A5D4E] text-white px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#D4A373]" /> RESPA & Co-Marketing Compliance
              </span>
              {totals.violations > 0 && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-red-600" /> {totals.violations} Compliance Warning(s)
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold font-serif text-[#2D362E]">LO + Agent RESPA Cost-Sharing Hub</h1>
            <p className="text-[#606C5D] text-sm mt-1">Track exact expense splitting per marketing venture, ad campaign, and tech stack to ensure strict RESPA 50/50 equitable compliance.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportCSV}
              className="px-4 py-2.5 bg-white border border-[#EAE7E0] hover:bg-[#F9F8F4] rounded-xl text-xs font-bold text-[#2D362E] flex items-center gap-2 shadow-xs transition-colors"
            >
              <Download className="w-4 h-4 text-[#606C5D]" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 bg-white border border-[#EAE7E0] hover:bg-[#F9F8F4] rounded-xl text-xs font-bold text-[#2D362E] flex items-center gap-2 shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4 text-[#606C5D]" />
              <span>Save PDF</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-[#4A5D4E] hover:bg-[#3B4C3F] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Log Expense Split</span>
            </button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-[#EAE7E0] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#606C5D] mb-4">
              <span className="text-xs font-bold uppercase tracking-wider">Total Joint Spend</span>
              <DollarSign className="w-5 h-5 text-[#4A5D4E]" />
            </div>
            <h3 className="text-3xl font-serif font-bold text-[#2D362E]">${totals.totalSpent.toLocaleString()}</h3>
            <p className="text-[11px] text-[#9A9488] mt-1">Across all logged marketing ventures</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#EAE7E0] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#606C5D] mb-4">
              <span className="text-xs font-bold uppercase tracking-wider">LO Total Contribution</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                {Math.round((totals.loSpent / (totals.totalSpent || 1)) * 100)}%
              </span>
            </div>
            <h3 className="text-3xl font-serif font-bold text-emerald-700">${totals.loSpent.toLocaleString()}</h3>
            <p className="text-[11px] text-[#9A9488] mt-1">Loan officer funded portion</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#EAE7E0] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#606C5D] mb-4">
              <span className="text-xs font-bold uppercase tracking-wider">Agent Total Contribution</span>
              <span className="text-xs bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">
                {Math.round((totals.agentSpent / (totals.totalSpent || 1)) * 100)}%
              </span>
            </div>
            <h3 className="text-3xl font-serif font-bold text-purple-700">${totals.agentSpent.toLocaleString()}</h3>
            <p className="text-[11px] text-[#9A9488] mt-1">Realtor partner funded portion</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#EAE7E0] shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#606C5D] mb-4">
              <span className="text-xs font-bold uppercase tracking-wider">Compliance Status</span>
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-[#2D362E]">
              {totals.violations === 0 ? "100% RESPA Compliant" : `${totals.violations} Flagged Item(s)`}
            </h3>
            <p className="text-[11px] text-[#9A9488] mt-1">Equitable split rule (&le;50% agent)</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-[#EAE7E0] flex flex-col sm:flex-row gap-4 justify-between items-center print:hidden">
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
            {['all', 'facebook_ad', 'google_ad', 'open_house', 'tech_stack', 'other'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-colors ${
                  categoryFilter === cat ? 'bg-[#4A5D4E] text-white shadow-xs' : 'bg-[#F9F8F4] text-[#606C5D] hover:bg-[#EAE7E0]/50'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#606C5D]" />
            <input
              type="text"
              placeholder="Search venture or agent partner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#D4A373]/30"
            />
          </div>
        </div>

        {/* Expenses List with Gradient Bar Charts */}
        <div className="bg-white rounded-3xl border border-[#EAE7E0] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#EAE7E0] bg-[#F9F8F4] flex justify-between items-center">
            <h3 className="font-bold font-serif text-lg text-[#2D362E]">Expense Splitting & RESPA Compliance Audits</h3>
            <span className="text-xs text-[#606C5D]">{filteredExpenses.length} Venture(s) Logged</span>
          </div>

          <div className="divide-y divide-[#EAE7E0]">
            {filteredExpenses.map(exp => {
              const isViolating = !exp.isCompliant;
              return (
                <div key={exp.id} className="p-6 space-y-4 hover:bg-[#FDFCF9] transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                          {exp.category.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-[#9A9488]">{exp.date}</span>
                        {isViolating ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> RESPA Warning (&gt;50% Agent Subsidization)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Compliant Split
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-base text-[#2D362E]">{exp.ventureName}</h4>
                      <p className="text-xs text-[#606C5D] flex items-center gap-1 mt-0.5">
                        <Users className="w-3.5 h-3.5 text-[#4A5D4E]" /> Realtor Partner: <span className="font-semibold text-[#2D362E]">{exp.agentName}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-[#9A9488] uppercase font-bold">Total Venture Spend</p>
                        <p className="text-xl font-bold font-serif text-[#2D362E]">${exp.totalAmount.toLocaleString()}</p>
                      </div>
                      <button
                        onClick={() => onDeleteExpense(exp.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                        title="Delete expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Colored Gradient Bar Chart (Left=LO Green, Right=Agent Red if >50%) */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-emerald-800">
                        LO Share: ${exp.loPaidAmount.toLocaleString()} ({exp.loSharePercentage}%)
                      </span>
                      <span className={`font-bold ${isViolating ? 'text-red-700' : 'text-purple-800'}`}>
                        Agent Share: ${exp.agentPaidAmount.toLocaleString()} ({exp.agentSharePercentage}%)
                      </span>
                    </div>

                    {/* Gradient Progress Track */}
                    <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden flex shadow-inner relative">
                      {/* LO Side (Green) */}
                      <div
                        className="h-full bg-emerald-600 transition-all duration-500 flex items-center justify-start pl-2"
                        style={{ width: `${exp.loSharePercentage}%` }}
                      >
                        {exp.loSharePercentage >= 20 && (
                          <span className="text-[9px] font-bold text-white uppercase tracking-wider">LO {exp.loSharePercentage}%</span>
                        )}
                      </div>

                      {/* Agent Side (Turns red if > 50%) */}
                      <div
                        className={`h-full transition-all duration-500 flex items-center justify-end pr-2 ${
                          isViolating ? 'bg-red-600 animate-pulse' : 'bg-purple-600'
                        }`}
                        style={{ width: `${exp.agentSharePercentage}%` }}
                      >
                        {exp.agentSharePercentage >= 20 && (
                          <span className="text-[9px] font-bold text-white uppercase tracking-wider">Agent {exp.agentSharePercentage}%</span>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-[#9A9488]">
                      <span>Target: &ge; 50% LO Contribution for Safe Harbor RESPA Compliance</span>
                      <span>{isViolating ? '⚠️ Non-Compliant Subsidization Detected' : '✅ Compliant Equitable Split'}</span>
                    </div>
                  </div>

                  {exp.notes && (
                    <div className="bg-[#F9F8F4] p-3 rounded-xl text-xs text-[#606C5D] border border-[#EAE7E0]">
                      <span className="font-bold text-[#2D362E]">Audit Notes:</span> {exp.notes}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredExpenses.length === 0 && (
              <div className="p-12 text-center text-sm text-[#9A9488]">
                No cost-sharing expenses match your search or filter. Click "Log Expense Split" to add one.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-[#EAE7E0] pb-4">
              <h3 className="font-serif font-bold text-xl text-[#2D362E]">Log Co-Marketing Expense Split</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 font-bold text-lg">×</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#606C5D] mb-1">Venture / Ad Campaign Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Summer Open House & Facebook Lead Gen"
                  value={ventureName}
                  onChange={(e) => setVentureName(e.target.value)}
                  className="w-full px-4 py-2 bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl text-sm focus:ring-2 focus:ring-[#D4A373]/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#606C5D] mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-4 py-2 bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl text-sm focus:ring-2 focus:ring-[#D4A373]/30 cursor-pointer"
                  >
                    <option value="facebook_ad">Facebook Ad</option>
                    <option value="google_ad">Google Ad</option>
                    <option value="open_house">Open House</option>
                    <option value="event">Event / Seminar</option>
                    <option value="print_media">Print Media / Flyers</option>
                    <option value="radio">Radio / Podcast</option>
                    <option value="tech_stack">Website & Tech Stack</option>
                    <option value="other">Other Venture</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#606C5D] mb-1">Realtor Partner Name</label>
                  <input
                    type="text"
                    required
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    className="w-full px-4 py-2 bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl text-sm focus:ring-2 focus:ring-[#D4A373]/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#606C5D] mb-1">Total Venture Cost ($)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={totalAmount}
                  onChange={(e) => handleTotalChange(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl text-sm font-bold text-[#2D362E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 bg-[#F9F8F4] p-4 rounded-2xl border border-[#EAE7E0]">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">LO Paid Share ($)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max={totalAmount}
                    value={loPaidAmount}
                    onChange={(e) => handleLoChange(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-sm font-bold text-emerald-800"
                  />
                  <p className="text-[10px] text-emerald-700 mt-1 font-semibold">{Math.round((loPaidAmount / (totalAmount || 1)) * 100)}% of total</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-purple-800 mb-1">Agent Paid Share ($)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max={totalAmount}
                    value={agentPaidAmount}
                    onChange={(e) => handleAgentChange(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-purple-300 rounded-xl text-sm font-bold text-purple-800"
                  />
                  <p className="text-[10px] text-purple-700 mt-1 font-semibold">{Math.round((agentPaidAmount / (totalAmount || 1)) * 100)}% of total</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#606C5D] mb-1">Audit Notes / Receipt Ref</label>
                <textarea
                  rows={2}
                  placeholder="Invoice #, check details, or verification notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2 bg-[#F9F8F4] border border-[#EAE7E0] rounded-xl text-sm focus:ring-2 focus:ring-[#D4A373]/30"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#EAE7E0]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#EAE7E0] text-xs font-bold text-[#606C5D] hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#4A5D4E] hover:bg-[#3B4C3F] text-white text-xs font-bold shadow-sm transition-colors"
                >
                  Save Expense Split
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
