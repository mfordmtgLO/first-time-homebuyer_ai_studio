import { RecruitingCampaign } from "../types";

export const INITIAL_RECRUITING_CAMPAIGNS: RecruitingCampaign[] = [
  {
    id: "campaign-1",
    name: "Top Producer Attraction",
    category: "Mentorship & Growth",
    targetAudience: "High-volume producers at competing local branches",
    description: "A 3-step value-driven sequence highlighting our proprietary AI tools, better splits, and operational support.",
    performanceMetrics: {
      sentCount: 142,
      activeTalksCount: 28,
      onboardedCount: 4,
      avgTouchesToHire: 4.5,
      avgJourneyDays: 32,
      conversionScore: 82
    },
    steps: [
      {
        id: "step-1-1",
        dayOffset: 0,
        type: "email",
        subject: "Quick question about your current tech stack",
        content: "Hi [Name],\n\nI've been following your production at [Company] and wanted to reach out directly. Our branch just rolled out a proprietary AI-driven marketing and lead-generation portal for our LOs, and it's already increasing our team's pull-through rates.\n\nI'd love to buy you a coffee and show you what we're doing differently to support top producers in this market.\n\nBest,\nMike Ford\nBranch Manager"
      },
      {
        id: "step-1-2",
        dayOffset: 3,
        type: "sms",
        content: "Hey [Name], Mike Ford here. Just checking if you saw my email about our new AI tools. Would love to chat briefly next week. Let me know what your schedule looks like!"
      },
      {
        id: "step-1-3",
        dayOffset: 7,
        type: "email",
        subject: "The operational support you deserve",
        content: "Hi [Name],\n\nBeyond the tech I mentioned earlier, one thing our team at [Branch] takes pride in is our in-house processing speed. We know that as a top producer, your time is best spent originating, not chasing conditions.\n\nAre you open to a brief 10-minute confidential call to see if our platform might be a better fit for your 2026 goals?\n\nBest,\nMike"
      }
    ]
  },
  {
    id: "campaign-2",
    name: "New Licensee / Rising Star",
    category: "Mentorship & Growth",
    targetAudience: "Newly licensed LOs or those with 1-2 years experience",
    description: "Focuses on mentorship, training, and our structured leads program to help them build their book of business.",
    performanceMetrics: {
      sentCount: 305,
      activeTalksCount: 45,
      onboardedCount: 12,
      avgTouchesToHire: 3.2,
      avgJourneyDays: 18,
      conversionScore: 76
    },
    steps: [
      {
        id: "step-2-1",
        dayOffset: 0,
        type: "sms",
        content: "Hi [Name], Mike Ford from CFMTG here. I'm expanding my team and looking for hungry, newer LOs who want hands-on mentorship. Are you open to grabbing coffee?"
      },
      {
        id: "step-2-2",
        dayOffset: 2,
        type: "email",
        subject: "Accelerating your mortgage career",
        content: "Hi [Name],\n\nI wanted to follow up on my text. The first couple of years in this industry are the hardest, but they don't have to be. \n\nMy team operates differently: we provide direct mentorship, co-branded Realtor marketing portals, and a structured leads system so you aren't just cold-calling all day.\n\nI have a spot open for someone driven. Let's schedule a brief call this week.\n\nBest,\nMike Ford"
      }
    ]
  },
  {
    id: "campaign-3",
    name: "Direct Competitor Poach",
    category: "Aggressive",
    targetAudience: "Loan Officers at a specific competing branch",
    description: "Aggressive and confidential approach focusing on comp plan improvements and better rates.",
    performanceMetrics: {
      sentCount: 89,
      activeTalksCount: 14,
      onboardedCount: 2,
      avgTouchesToHire: 5.1,
      avgJourneyDays: 45,
      conversionScore: 68
    },
    steps: [
      {
        id: "step-3-1",
        dayOffset: 0,
        type: "email",
        subject: "Confidential: Exploring options?",
        content: "Hi [Name],\n\nI'll keep this brief. We are actively expanding our branch and I am looking specifically for professionals with your track record at [Company]. \n\nWe recently updated our compensation models and pricing structure, and quite frankly, we are beating the local market. \n\nIf you are open to a strictly confidential conversation about how our platform compares to your current setup, let me know when you are free for a quick call.\n\nRegards,\nMike Ford"
      }
    ]
  },
  {
    id: "campaign-top10-rates",
    name: "Top 10: Aggressive Pricing & Rates",
    category: "Best Rates",
    targetAudience: "Volume-driven LOs losing deals to pricing",
    description: "Our #1 highest converting playbook. A direct 2-step AI-assisted draft sequence focusing purely on our aggressive rate sheet, margin compression, and how we help LOs win on price.",
    performanceMetrics: {
      sentCount: 512,
      activeTalksCount: 124,
      onboardedCount: 22,
      avgTouchesToHire: 2.8,
      avgJourneyDays: 14,
      conversionScore: 96
    },
    steps: [
      {
        id: "step-4-1",
        dayOffset: 0,
        type: "email",
        subject: "Are you losing deals to pricing right now?",
        content: "Hi [Name],\n\nI know how tough the market is right now. If you're like most top producers I talk to, you're probably losing 1 or 2 deals a month simply because your current branch's rate sheet isn't keeping up with market compression.\n\nI run the team at CFMTG, and we've restructured our margins specifically to give our LOs an aggressive pricing advantage. We are currently beating the local market by 0.25 to 0.5 bps on most conventional and FHA scenarios.\n\nI don't want to waste your time. I'd love to just send you our rate sheet for today so you can compare it yourself against what you're currently quoting. Reply 'yes' and I'll send it over.\n\nBest,\nMike Ford\nBranch Manager"
      },
      {
        id: "step-4-2",
        dayOffset: 1,
        type: "sms",
        content: "Hey [Name], Mike Ford here. Sent an email yesterday about our aggressive rate sheet. We're beating the street by 0.25+ bps right now. Let me know if you want me to text over a screenshot of today's pricing to compare."
      }
    ]
  }
];
