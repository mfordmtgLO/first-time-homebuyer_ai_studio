const fs = require('fs');

let content = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

// Add state for ScrapeRealtorModal
if(!content.includes('const [showScrapeRealtorModal')) {
    const stateTarget = `const [showScrapeLoModal, setShowScrapeLoModal] = useState<boolean>(false);`;
    const stateReplacement = `const [showScrapeLoModal, setShowScrapeLoModal] = useState<boolean>(false);
  const [showScrapeRealtorModal, setShowScrapeRealtorModal] = useState<boolean>(false);`;
    content = content.replace(stateTarget, stateReplacement);
}

// Add import
if(!content.includes('import { ScrapeRealtorModal }')) {
    const importTarget = `import { ScrapeLoRosterModal } from "./ScrapeLoRosterModal";`;
    const importReplacement = `import { ScrapeLoRosterModal } from "./ScrapeLoRosterModal";
import { ScrapeRealtorModal } from "./ScrapeRealtorModal";`;
    content = content.replace(importTarget, importReplacement);
}

// Add Button
const buttonTarget = `<button
                  onClick={() => setShowAddAgentModal(true)}
                  className="px-4 py-2.5 bg-[#2D362E] hover:bg-[#1f2520] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] shrink-0"
                >
                  <UserPlus className="w-4 h-4 text-amber-400" />
                  <span>+ Add Agent Partner</span>
                </button>`;
const buttonReplacement = `<button
                  onClick={() => setShowScrapeRealtorModal(true)}
                  className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>AI Assist: Scrape Realtors</span>
                </button>
                <button
                  onClick={() => setShowAddAgentModal(true)}
                  className="px-4 py-2.5 bg-[#2D362E] hover:bg-[#1f2520] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] shrink-0"
                >
                  <UserPlus className="w-4 h-4 text-amber-400" />
                  <span>+ Add Agent Partner</span>
                </button>`;
content = content.replace(buttonTarget, buttonReplacement);

// Render Modal
const renderModalTarget = `<ScrapeLoRosterModal
        isOpen={showScrapeLoModal}
        onClose={() => setShowScrapeLoModal(false)}
        onAddMultipleLos={(los) => {
          const newOfficers = los.map((p, idx) => ({
            id: \`lo-imported-\${Date.now()}-\${idx}\`,
            name: p.name || "",
            title: p.title || "",
            nmlsId: p.nmlsId || "",
            company: p.company || "",
            branch: p.branch || "",
            email: p.email || "",
            phone: p.phone || "",
            headshotUrl: p.headshotUrl || "",
            bio: p.bio || "",
            specialties: p.specialties || [],
            licenseStates: p.licenseStates || ["OR"],
            websiteUrl: p.websiteUrl || "",
            yearsExperience: p.yearsExperience,
            production12MoVolume: p.production12MoVolume,
            production12MoUnits: p.production12MoUnits,
            isTeamMember: true,
            recruitmentStatus: 'Contacted',
            outreachHistory: []
          })) as LoanOfficerProfile[];
          setGuidesState(prev => ({
            ...prev,
            loanOfficers: [...prev.loanOfficers, ...newOfficers]
          }));
          triggerToast(\`✅ Successfully imported \${newOfficers.length} Loan Officers to the team roster!\`);
        }}
      />`;
const renderModalReplacement = `<ScrapeLoRosterModal
        isOpen={showScrapeLoModal}
        onClose={() => setShowScrapeLoModal(false)}
        onAddMultipleLos={(los) => {
          const newOfficers = los.map((p, idx) => ({
            id: \`lo-imported-\${Date.now()}-\${idx}\`,
            name: p.name || "",
            title: p.title || "",
            nmlsId: p.nmlsId || "",
            company: p.company || "",
            branch: p.branch || "",
            email: p.email || "",
            phone: p.phone || "",
            headshotUrl: p.headshotUrl || "",
            bio: p.bio || "",
            specialties: p.specialties || [],
            licenseStates: p.licenseStates || ["OR"],
            websiteUrl: p.websiteUrl || "",
            yearsExperience: p.yearsExperience,
            production12MoVolume: p.production12MoVolume,
            production12MoUnits: p.production12MoUnits,
            isTeamMember: true,
            recruitmentStatus: 'Contacted',
            outreachHistory: []
          })) as LoanOfficerProfile[];
          setGuidesState(prev => ({
            ...prev,
            loanOfficers: [...prev.loanOfficers, ...newOfficers]
          }));
          triggerToast(\`✅ Successfully imported \${newOfficers.length} Loan Officers to the team roster!\`);
        }}
      />

      <ScrapeRealtorModal
        isOpen={showScrapeRealtorModal}
        onClose={() => setShowScrapeRealtorModal(false)}
        onAddMultipleAgents={(agents) => {
          const newAgents = agents.map((p, idx) => ({
            id: \`agent-imported-\${Date.now()}-\${idx}\`,
            name: p.name || "",
            title: p.title || "",
            brokerage: p.company || p.brokerage || "", // Ensure brokerage/company fallback
            licenseNumber: p.licenseNumber || p.nmlsId || "",
            email: p.email || "",
            phone: p.phone || "",
            headshotUrl: p.headshotUrl || "",
            bio: p.bio || "",
            specialties: p.specialties || [],
            marketAreas: p.marketAreas || ["Portland Metro"],
            agentType: p.agentType || 'buyer_agent',
            experienceYears: p.experienceYears || p.yearsExperience,
            production12MoVolume: p.production12MoVolume,
            production12MoUnits: p.production12MoUnits,
            activeListingsCount: p.activeListingsCount || 0,
            websiteUrl: p.websiteUrl || "",
            socialLinks: p.socialLinks || {}
          })) as RealEstateAgentProfile[];
          setGuidesState(prev => ({
            ...prev,
            agentRoster: [...prev.agentRoster, ...newAgents]
          }));
          triggerToast(\`✅ Successfully imported \${newAgents.length} Realtor Partners to the roster!\`);
        }}
      />`;

content = content.replace(renderModalTarget, renderModalReplacement);
fs.writeFileSync('src/components/LoanOfficerPortal.tsx', content);
