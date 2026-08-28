const fs = require('fs');
const file = 'src/components/PropertyTracker.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import { BarChart')) {
  content = content.replace(
    'import { ScreeningDisclaimerBanner } from "./ScreeningDisclaimerBanner";',
    'import { ScreeningDisclaimerBanner } from "./ScreeningDisclaimerBanner";\nimport { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";'
  );
}

const aggregationLogic = `  const comparedProperties = properties.filter(p => compareIds.includes(p.id));

  const agentDistribution = React.useMemo(() => {
    const counts = {};
    filtered.forEach(p => {
      if (p.listingAgent?.name) {
        counts[p.listingAgent.name] = (counts[p.listingAgent.name] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [filtered]);`;

content = content.replace(
  '  const comparedProperties = properties.filter(p => compareIds.includes(p.id));',
  aggregationLogic
);

const chartUI = `      </div>

      {/* Listing Agent Distribution Chart */}
      {agentDistribution.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#EAE7E0] p-6 shadow-sm mb-6 mt-6">
          <div className="flex items-center gap-2 mb-6">
            <Building className="w-5 h-5 text-[#4A5D4E]" />
            <h3 className="font-serif text-lg font-bold text-[#2D362E]">Listing Agent Distribution</h3>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agentDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 11, fill: '#606C5D' }} 
                  axisLine={{ stroke: '#EAE7E0' }}
                  tickLine={false}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#606C5D' }} 
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip 
                  cursor={{ fill: '#FAF9F5' }}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #EAE7E0', fontSize: '12px', padding: '8px 12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="count" fill="#4A5D4E" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Property Cards Grid */}`;

content = content.replace(
  /      <\/div>\s+\{\/\* Property Cards Grid \*\/\}/,
  chartUI
);

fs.writeFileSync(file, content);
