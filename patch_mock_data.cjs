const fs = require('fs');
let code = fs.readFileSync('src/components/LoanOfficerPortal.tsx', 'utf8');

// We want to make sure guidesState initializes with mock published ads and mock captured leads that match their campaignIds if they are empty or for training purposes.
const seedInjection = `
  // Seed Mock Published Ads & Leads for Training & Illustration if empty
  useEffect(() => {
    if ((!guidesState.adCampaignDrafts || guidesState.adCampaignDrafts.length === 0) || (!guidesState.leads || guidesState.leads.length === 0)) {
      const mockAds = [
        {
          id: "mock-ad-1",
          platform: "meta",
          loId: currentLo.id,
          agentId: "agent-1",
          campaignName: "First-Time Homebuyer 2-1 Buydown & Grant Spotlight (FB Story/Reels)",
          headline: "Stop Renting! Get $10,000 DPA Grant & Save $400/mo in Year 1",
          primaryText: "Tired of rising rents? Discover how our exclusive 2-1 Buydown program combined with state down payment assistance makes homeownership instantly affordable.",
          descriptionText: "Pre-qualify in under 2 minutes with zero credit impact.",
          targetUrl: "https://cfmtg.com/mford/buydown",
          dailyBudget: 45,
          targetLocations: ["Portland, OR", "Beaverton, OR"],
          specialHousingCategory: true,
          adObjective: "LEAD_GENERATION",
          status: "published",
          sourceType: "draft_campaign",
          isVantageCurated: true,
          isNewAwaitingPublication: false,
          publishedChannels: ["facebook", "social_media"],
          publishedAt: "2026-09-01",
          propertyAddress: "1242 SW Morrison St",
          propertyCity: "Portland",
          propertyPrice: 475000,
          propertyBeds: 3,
          propertyBaths: 2,
          propertySqft: 1650,
          propertyImage: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
          videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-building-tour-41847-large.mp4"
        },
        {
          id: "mock-ad-2",
          platform: "google",
          loId: currentLo.id,
          agentId: "agent-2",
          campaignName: "Google Search: Low Down Payment FHA & Conventional Loans",
          headline: "Zero & Low Down Payment Options in Oregon | Official Lender",
          primaryText: "Compare FHA, VA, USDA and Conventional 3% down loans with licensed mortgage expert Mike Ford.",
          descriptionText: "Instant Pre-Approval Letter Issued Online.",
          targetUrl: "https://cfmtg.com/mford/fha",
          dailyBudget: 60,
          targetLocations: ["Oregon Statewide"],
          specialHousingCategory: true,
          adObjective: "TRAFFIC",
          status: "published",
          sourceType: "draft_campaign",
          isVantageCurated: true,
          isNewAwaitingPublication: false,
          publishedChannels: ["google"],
          publishedAt: "2026-09-03",
          propertyAddress: "Regional Oregon Search",
          propertyCity: "Portland",
          propertyPrice: 520000,
          propertyBeds: 4,
          propertyBaths: 2.5,
          propertySqft: 2100,
          propertyImage: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80"
        },
        {
          id: "mock-ad-3",
          platform: "meta",
          loId: currentLo.id,
          agentId: "agent-3",
          campaignName: "TikTok & Instagram Reels: Schedule C Self-Employed Bank Statement Loans",
          headline: "No Tax Return Mortgage? Use 12-Month Bank Statements!",
          primaryText: "Self-employed and write off most of your income? Our 12-month bank statement program qualifies you using revenue deposits instead of W2s.",
          descriptionText: "Designed specifically for business owners and freelancers.",
          targetUrl: "https://cfmtg.com/mford/selfemployed",
          dailyBudget: 35,
          targetLocations: ["Oregon & Washington"],
          specialHousingCategory: true,
          adObjective: "LEAD_GENERATION",
          status: "published",
          sourceType: "draft_campaign",
          isVantageCurated: true,
          isNewAwaitingPublication: false,
          publishedChannels: ["social_media"],
          publishedAt: "2026-09-05",
          propertyAddress: "Self-Employed Specialist Portfolio",
          propertyCity: "Vancouver",
          propertyPrice: 650000,
          propertyBeds: 4,
          propertyBaths: 3,
          propertySqft: 2600,
          propertyImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
          videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-real-estate-agent-showing-a-house-to-a-client-42253-large.mp4"
        }
      ];

      const mockLeads = [
        {
          id: "lead-m-1",
          fullName: "Sarah Jenkins",
          email: "sarah.j@example.com",
          phone: "503-555-0192",
          preferredContactTime: "Evening",
          timeline: "0-3 months",
          targetPriceRange: "$450,000 - $500,000",
          targetMonthlyBudget: "$2,800",
          downPaymentSavings: "$25,000",
          grantInterest: true,
          creditScoreTier: "740+",
          preferredLocations: "Portland / Beaverton",
          propertyType: "Single Family",
          assignedLoId: currentLo.id,
          assignedLO: currentLo.name,
          leadSource: "Facebook story",
          sourceCampaignId: "mock-ad-1",
          sourceCampaignName: "First-Time Homebuyer 2-1 Buydown & Grant Spotlight (FB Story/Reels)",
          interactedSourceType: "campaign",
          intentScore: "hot",
          status: "new",
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
        },
        {
          id: "lead-m-2",
          fullName: "Marcus Vance",
          email: "marcus.v@example.com",
          phone: "503-555-8821",
          preferredContactTime: "Afternoon",
          timeline: "3-6 months",
          targetPriceRange: "$500,000 - $550,000",
          targetMonthlyBudget: "$3,200",
          downPaymentSavings: "$40,000",
          grantInterest: false,
          creditScoreTier: "720-739",
          preferredLocations: "Lake Oswego",
          propertyType: "Single Family",
          assignedLoId: currentLo.id,
          assignedLO: currentLo.name,
          leadSource: "Google ads",
          sourceCampaignId: "mock-ad-2",
          sourceCampaignName: "Google Search: Low Down Payment FHA & Conventional Loans",
          interactedSourceType: "campaign",
          intentScore: "hot",
          status: "contacted",
          createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
        },
        {
          id: "lead-m-3",
          fullName: "Elena Rostova",
          email: "elena.r@example.com",
          phone: "360-555-4190",
          preferredContactTime: "Morning",
          timeline: "Ready Now",
          targetPriceRange: "$600,000 - $700,000",
          targetMonthlyBudget: "$4,100",
          downPaymentSavings: "$80,000",
          grantInterest: false,
          creditScoreTier: "740+",
          preferredLocations: "Vancouver / Camas",
          propertyType: "Luxury Home",
          assignedLoId: currentLo.id,
          assignedLO: currentLo.name,
          leadSource: "Instagram reels",
          sourceCampaignId: "mock-ad-3",
          sourceCampaignName: "TikTok & Instagram Reels: Schedule C Self-Employed Bank Statement Loans",
          interactedSourceType: "campaign",
          intentScore: "warm",
          status: "new",
          createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
        },
        {
          id: "lead-m-4",
          fullName: "David Chen",
          email: "david.c@example.com",
          phone: "971-555-9032",
          preferredContactTime: "Evening",
          timeline: "0-3 months",
          targetPriceRange: "$420,000",
          targetMonthlyBudget: "$2,600",
          downPaymentSavings: "$20,000",
          grantInterest: true,
          creditScoreTier: "700-719",
          preferredLocations: "Hillsboro",
          propertyType: "Townhome",
          assignedLoId: currentLo.id,
          assignedLO: currentLo.name,
          leadSource: "Facebook reels",
          sourceCampaignId: "mock-ad-1",
          sourceCampaignName: "First-Time Homebuyer 2-1 Buydown & Grant Spotlight (FB Story/Reels)",
          interactedSourceType: "campaign",
          intentScore: "hot",
          status: "pre_approved",
          createdAt: new Date(Date.now() - 3600000 * 72).toISOString()
        }
      ];

      onUpdateGuidesState({
        ...guidesState,
        adCampaignDrafts: guidesState.adCampaignDrafts?.length > 0 ? guidesState.adCampaignDrafts : mockAds,
        leads: guidesState.leads?.length > 0 ? guidesState.leads : mockLeads
      });
    }
  }, []);
`;

code = code.replace(
  'const [activeTab, setActiveTab] = useState<string>(',
  seedInjection + '\n  const [activeTab, setActiveTab] = useState<string>('
);

fs.writeFileSync('src/components/LoanOfficerPortal.tsx', code);
console.log("Injected mock published ads and synced leads successfully.");
