const fs = require('fs');
let content = fs.readFileSync('src/components/GrowthDashboard.tsx', 'utf8');

// 1. Add icons
content = content.replace(
  /Search, Filter, ChevronDown, Award, Target, Activity, DollarSign, Trophy, Medal/,
  "Search, Filter, ChevronDown, Award, Target, Activity, DollarSign, Trophy, Medal, Download, Gift, Star, Printer"
);

// 2. Add states to the component
const stateReplacement = `export const GrowthDashboard: React.FC<GrowthDashboardProps> = ({ guidesState }) => {
  const [dateRange, setDateRange] = useState("YTD");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  
  // Sorting & Winners Circle State
  const [leaderboardSortMetric, setLeaderboardSortMetric] = useState<'conversionRate' | 'closedLeads' | 'totalLeads' | 'avgDaysToClose'>('conversionRate');
  const [winnerPeriod, setWinnerPeriod] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Annual'>('Q3');
  const [winnerYear, setWinnerYear] = useState('2026');
  const [prizes, setPrizes] = useState({ closedLeads: '', conversionRate: '', avgDaysToClose: '' });
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);`;

content = content.replace(
  /export const GrowthDashboard: React\.FC<GrowthDashboardProps> = \(\{ guidesState \}\) => \{\n  const \[dateRange, setDateRange\] = useState\("YTD"\);\n  const \[customStartDate, setCustomStartDate\] = useState\(""\);\n  const \[customEndDate, setCustomEndDate\] = useState\(""\);/,
  stateReplacement
);

// 3. Helper to generate LO stats array
const helperReplacement = `
  const calculateLoStatsArray = (leadsArray: CapturedLead[]) => {
    const loanOfficers = guidesState.loanOfficers || [];
    const loStats = leadsArray.reduce((acc, lead) => {
      const loId = lead.assignedLoId;
      if (!loId) return acc;
      if (!acc[loId]) acc[loId] = { total: 0, closed: 0, totalDays: 0 };
      
      acc[loId].total += 1;
      if (lead.status === 'closed') {
        acc[loId].closed += 1;
        acc[loId].totalDays += (20 + (lead.id.length % 10));
      }
      return acc;
    }, {} as Record<string, { total: number, closed: number, totalDays: number }>);
    
    return loanOfficers.map(lo => {
      const stats = loStats[lo.id] || { total: 0, closed: 0, totalDays: 0 };
      const conversionRate = stats.total > 0 ? (stats.closed / stats.total) * 100 : 0;
      const avgDays = stats.closed > 0 ? stats.totalDays / stats.closed : 0;
      return {
        id: lo.id,
        name: lo.name,
        totalLeads: stats.total,
        closedLeads: stats.closed,
        conversionRate: Math.round(conversionRate),
        avgDaysToClose: avgDays > 0 ? avgDays.toFixed(1) : "-",
      };
    }).filter(lo => lo.totalLeads > 0);
  };
  
  // Calculate LO Leaderboard Data
  const loLeaderboard = useMemo(() => {
    const data = calculateLoStatsArray(filteredLeads);
    return data.sort((a, b) => {
      if (leaderboardSortMetric === 'closedLeads') return b.closedLeads - a.closedLeads;
      if (leaderboardSortMetric === 'totalLeads') return b.totalLeads - a.totalLeads;
      if (leaderboardSortMetric === 'conversionRate') return b.conversionRate - a.conversionRate || b.closedLeads - a.closedLeads;
      if (leaderboardSortMetric === 'avgDaysToClose') {
        const aSpeed = a.avgDaysToClose === "-" ? 999 : Number(a.avgDaysToClose);
        const bSpeed = b.avgDaysToClose === "-" ? 999 : Number(b.avgDaysToClose);
        return aSpeed - bSpeed;
      }
      return 0;
    });
  }, [filteredLeads, guidesState.loanOfficers, leaderboardSortMetric]);

  // Calculate Winners Circle Data
  const winnersCircleData = useMemo(() => {
    let leads = guidesState.leads || [];
    
    leads = leads.filter(l => {
      const d = new Date(l.createdAt);
      if (isNaN(d.getTime())) return true;
      if (d.getFullYear().toString() !== winnerYear) return false;
      
      if (winnerPeriod !== 'Annual') {
        const month = d.getMonth();
        if (winnerPeriod === 'Q1' && month > 2) return false;
        if (winnerPeriod === 'Q2' && (month < 3 || month > 5)) return false;
        if (winnerPeriod === 'Q3' && (month < 6 || month > 8)) return false;
        if (winnerPeriod === 'Q4' && month < 9) return false;
      }
      return true;
    });
    
    const statsArray = calculateLoStatsArray(leads);
    
    const topVolume = [...statsArray].sort((a, b) => b.closedLeads - a.closedLeads)[0];
    const topConversion = [...statsArray].sort((a, b) => b.conversionRate - a.conversionRate || b.closedLeads - a.closedLeads)[0];
    const topSpeed = [...statsArray].filter(l => l.avgDaysToClose !== "-").sort((a, b) => Number(a.avgDaysToClose) - Number(b.avgDaysToClose))[0];
    
    return { topVolume, topConversion, topSpeed };
  }, [guidesState.leads, guidesState.loanOfficers, winnerPeriod, winnerYear]);

  const handleGeneratePDF = () => {
    setIsGeneratingPDF(true);
    setTimeout(() => {
      window.print();
      setIsGeneratingPDF(false);
    }, 500);
  };
`;

content = content.replace(
  /\/\/ Calculate LO Leaderboard Data[\s\S]*?\}, \[filteredLeads, guidesState\.loanOfficers\]\);/,
  helperReplacement
);

// 4. Update the Leaderboard UI (Sorting and Headers)
const leaderboardUIReplacement = `
      {/* LO Performance Leaderboard */}
      <div className="bg-white rounded-3xl border border-[#EAE7E0] shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#EAE7E0] flex flex-wrap items-center justify-between gap-4 bg-[#F9F8F4]/50">
          <div>
            <h3 className="text-lg font-bold text-[#2D362E] flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Loan Officer Leaderboard
            </h3>
            <p className="text-xs text-[#606C5D]">Click any column header to change the ranking logic</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[#606C5D] uppercase bg-white border-b border-[#EAE7E0]">
              <tr>
                <th className="px-6 py-4 font-semibold w-16 text-center">Rank</th>
                <th className="px-6 py-4 font-semibold">Loan Officer</th>
                <th 
                  className={\`px-6 py-4 font-semibold cursor-pointer transition-colors \${leaderboardSortMetric === 'totalLeads' ? 'text-[#4A5D4E] bg-[#F9F8F4]' : 'hover:bg-gray-50'}\`}
                  onClick={() => setLeaderboardSortMetric('totalLeads')}
                >
                  <div className="flex items-center gap-1">Total Leads {leaderboardSortMetric === 'totalLeads' && <ChevronDown className="w-3 h-3" />}</div>
                </th>
                <th 
                  className={\`px-6 py-4 font-semibold cursor-pointer transition-colors \${leaderboardSortMetric === 'closedLeads' ? 'text-[#4A5D4E] bg-[#F9F8F4]' : 'hover:bg-gray-50'}\`}
                  onClick={() => setLeaderboardSortMetric('closedLeads')}
                >
                  <div className="flex items-center gap-1">Funded (Units) {leaderboardSortMetric === 'closedLeads' && <ChevronDown className="w-3 h-3" />}</div>
                </th>
                <th 
                  className={\`px-6 py-4 font-semibold cursor-pointer transition-colors \${leaderboardSortMetric === 'conversionRate' ? 'text-[#4A5D4E] bg-[#F9F8F4]' : 'hover:bg-gray-50'}\`}
                  onClick={() => setLeaderboardSortMetric('conversionRate')}
                >
                  <div className="flex items-center gap-1">Conversion Rate {leaderboardSortMetric === 'conversionRate' && <ChevronDown className="w-3 h-3" />}</div>
                </th>
                <th 
                  className={\`px-6 py-4 font-semibold cursor-pointer transition-colors \${leaderboardSortMetric === 'avgDaysToClose' ? 'text-[#4A5D4E] bg-[#F9F8F4]' : 'hover:bg-gray-50'}\`}
                  onClick={() => setLeaderboardSortMetric('avgDaysToClose')}
                >
                  <div className="flex items-center gap-1">Avg Days to Fund {leaderboardSortMetric === 'avgDaysToClose' && <ChevronDown className="w-3 h-3" />}</div>
                </th>
              </tr>
            </thead>
`;

content = content.replace(
  /\{\/\* LO Performance Leaderboard \*\/\}[\s\S]*?<\/thead>/,
  leaderboardUIReplacement
);


// 5. Insert Winners Circle Gamification Card above Leaderboard
const winnersCircleUI = `
      {/* Winners Circle Gamification */}
      <div className="bg-gradient-to-br from-[#4A5D4E] to-[#2D362E] rounded-3xl shadow-xl overflow-hidden print:shadow-none print:border print:border-[#EAE7E0]">
        <div className="p-6 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              Winners Circle Gamification
            </h3>
            <p className="text-xs text-white/70 mt-1">Set prizes and generate reports for quarterly and annual top performers</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <select 
              value={winnerPeriod}
              onChange={(e) => setWinnerPeriod(e.target.value as any)}
              className="bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#C18C5D] font-medium"
            >
              <option value="Q1" className="text-gray-900">Q1 (Jan-Mar)</option>
              <option value="Q2" className="text-gray-900">Q2 (Apr-Jun)</option>
              <option value="Q3" className="text-gray-900">Q3 (Jul-Sep)</option>
              <option value="Q4" className="text-gray-900">Q4 (Oct-Dec)</option>
              <option value="Annual" className="text-gray-900">Annual Winner</option>
            </select>
            
            <select 
              value={winnerYear}
              onChange={(e) => setWinnerYear(e.target.value)}
              className="bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#C18C5D] font-medium"
            >
              <option value="2026" className="text-gray-900">2026</option>
              <option value="2027" className="text-gray-900">2027</option>
              <option value="2028" className="text-gray-900">2028</option>
              <option value="2029" className="text-gray-900">2029</option>
              <option value="2030" className="text-gray-900">2030</option>
            </select>

            <button 
              onClick={handleGeneratePDF}
              disabled={isGeneratingPDF}
              className="flex items-center gap-2 bg-[#C18C5D] hover:bg-[#A8794D] text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
            >
              {isGeneratingPDF ? <Activity className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {isGeneratingPDF ? "Generating..." : "Download PDF Report"}
            </button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Highest Volume */}
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col print:border-[#EAE7E0] print:bg-white">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-emerald-400" />
              <h4 className="text-sm font-bold text-white print:text-black">Top Funded Units</h4>
            </div>
            
            {winnersCircleData.topVolume ? (
              <div className="flex-1 flex flex-col justify-center items-center text-center space-y-2 mb-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center border-2 border-emerald-400">
                  <span className="text-2xl font-bold text-white print:text-black">{winnersCircleData.topVolume.name.charAt(0)}</span>
                </div>
                <div>
                  <div className="text-lg font-bold text-white print:text-black">{winnersCircleData.topVolume.name}</div>
                  <div className="text-emerald-400 font-bold text-xl">{winnersCircleData.topVolume.closedLeads} Units</div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-white/50 text-sm mb-6 print:text-gray-500">
                No active data for this period
              </div>
            )}
            
            <div className="mt-auto">
              <label className="text-xs font-medium text-white/70 block mb-1.5 print:text-gray-600">Assign Prize for Winner:</label>
              <div className="relative">
                <Gift className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/50 print:text-gray-400" />
                <input 
                  type="text" 
                  value={prizes.closedLeads}
                  onChange={(e) => setPrizes({...prizes, closedLeads: e.target.value})}
                  placeholder="e.g., $1000 Bonus" 
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-emerald-400 print:bg-white print:text-black print:border-gray-300 print:placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Highest Conversion */}
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col print:border-[#EAE7E0] print:bg-white">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-amber-400" />
              <h4 className="text-sm font-bold text-white print:text-black">Top Conversion Rate</h4>
            </div>
            
            {winnersCircleData.topConversion && winnersCircleData.topConversion.totalLeads > 0 ? (
              <div className="flex-1 flex flex-col justify-center items-center text-center space-y-2 mb-6">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center border-2 border-amber-400">
                  <span className="text-2xl font-bold text-white print:text-black">{winnersCircleData.topConversion.name.charAt(0)}</span>
                </div>
                <div>
                  <div className="text-lg font-bold text-white print:text-black">{winnersCircleData.topConversion.name}</div>
                  <div className="text-amber-400 font-bold text-xl">{winnersCircleData.topConversion.conversionRate}%</div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-white/50 text-sm mb-6 print:text-gray-500">
                No active data for this period
              </div>
            )}
            
            <div className="mt-auto">
              <label className="text-xs font-medium text-white/70 block mb-1.5 print:text-gray-600">Assign Prize for Winner:</label>
              <div className="relative">
                <Gift className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/50 print:text-gray-400" />
                <input 
                  type="text" 
                  value={prizes.conversionRate}
                  onChange={(e) => setPrizes({...prizes, conversionRate: e.target.value})}
                  placeholder="e.g., $500 Gift Card" 
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-amber-400 print:bg-white print:text-black print:border-gray-300 print:placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Fastest Speed */}
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5 flex flex-col print:border-[#EAE7E0] print:bg-white">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-purple-400" />
              <h4 className="text-sm font-bold text-white print:text-black">Fastest to Fund</h4>
            </div>
            
            {winnersCircleData.topSpeed ? (
              <div className="flex-1 flex flex-col justify-center items-center text-center space-y-2 mb-6">
                <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center border-2 border-purple-400">
                  <span className="text-2xl font-bold text-white print:text-black">{winnersCircleData.topSpeed.name.charAt(0)}</span>
                </div>
                <div>
                  <div className="text-lg font-bold text-white print:text-black">{winnersCircleData.topSpeed.name}</div>
                  <div className="text-purple-400 font-bold text-xl">{winnersCircleData.topSpeed.avgDaysToClose} Days Avg</div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-white/50 text-sm mb-6 print:text-gray-500">
                No active data for this period
              </div>
            )}
            
            <div className="mt-auto">
              <label className="text-xs font-medium text-white/70 block mb-1.5 print:text-gray-600">Assign Prize for Winner:</label>
              <div className="relative">
                <Gift className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/50 print:text-gray-400" />
                <input 
                  type="text" 
                  value={prizes.avgDaysToClose}
                  onChange={(e) => setPrizes({...prizes, avgDaysToClose: e.target.value})}
                  placeholder="e.g., Weekend Getaway" 
                  className="w-full bg-black/20 border border-white/10 rounded-xl py-2 pl-9 pr-3 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400 print:bg-white print:text-black print:border-gray-300 print:placeholder-gray-400"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LO Performance Leaderboard */}`;

content = content.replace(
  /\{\/\* LO Performance Leaderboard \*\/\}/,
  winnersCircleUI
);

fs.writeFileSync('src/components/GrowthDashboard.tsx', content);
console.log("File updated successfully.");
