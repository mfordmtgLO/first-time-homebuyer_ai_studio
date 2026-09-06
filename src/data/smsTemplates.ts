import { SmsTemplate } from "../types";

export const DEFAULT_SMS_TEMPLATES: SmsTemplate[] = [
  // Market Trends & Local Guides Hooks (New)
  {
    id: "sms-tpl-market-trends-solo",
    title: "📈 Market Trends Hook - Low/No Down Payment (Solo LO)",
    content: "Hi {{firstName}}, this is {{loName}}, your trusted Local Guide for home financing. I saw you just requested the latest Market Trends Report for {{location}}. If you want more info on first-time homebuyer low or no down payment options (like USDA, HomeReady, or State Grants) that fit this market, let me know! Reply STOP to opt out.",
    category: "new_lead",
    tags: ["Market Trends", "Low Down Payment", "Intro", "Solo LO"],
    createdAt: "2026-09-06T15:00:00.000Z",
    updatedAt: "2026-09-06T15:00:00.000Z",
    ownerId: "system"
  },
  {
    id: "sms-tpl-market-trends-cobrand",
    title: "🤝 Market Trends Hook - Curated Homes (LO + Agent Pair)",
    content: "Hi {{firstName}}, this is {{loName}} and your realtor partner {{agentName}}, your Local Guides! Thanks for downloading the {{location}} Market Trends Report. Would you like us to send you a curated list of homes in {{location}} that likely qualify for special low/no down payment programs (like OHCS Flex or FHA DPA)? Let us know! Reply STOP to opt out.",
    category: "new_lead",
    tags: ["Market Trends", "Curated List", "Co-Branded", "Low Down Payment"],
    createdAt: "2026-09-06T15:00:00.000Z",
    updatedAt: "2026-09-06T15:00:00.000Z",
    ownerId: "system"
  },
  
  // 1. Speed to Lead / New Lead Intros
  {
    id: "sms-tpl-fast-intro",
    title: "⚡ Fast-Track Intro & Homebuyer Timeline",
    content: "Hi {{firstName}}, this is {{loName}} with Cornerstone First Mortgage. Saw you reached out regarding home financing in {{location}}. Are you looking to purchase in the next 30-90 days, or just browsing numbers? Reply STOP to opt out.",
    category: "new_lead",
    tags: ["Speed to Lead", "Intro", "Timeline"],
    createdAt: "2026-01-15T08:00:00.000Z",
    updatedAt: "2026-01-15T08:00:00.000Z",
    ownerId: "system"
  },
  {
    id: "sms-tpl-soft-credit",
    title: "🔍 Zero-Impact Soft Credit Pre-Approval",
    content: "Hi {{firstName}}, {{loName}} here with Cornerstone First Mortgage. We just enabled a soft credit pull tool that estimates your exact max purchasing power and monthly payment with zero impact to your credit score. Want me to text you the secure link? Reply STOP to opt out.",
    category: "new_lead",
    tags: ["Soft Credit", "Prequalification", "Zero Impact"],
    createdAt: "2026-01-15T08:00:00.000Z",
    updatedAt: "2026-01-15T08:00:00.000Z",
    ownerId: "system"
  },
  {
    id: "sms-tpl-3min-discovery",
    title: "📞 3-Minute Budget & Discovery Call",
    content: "Hi {{firstName}}! Thanks for checking out our Homebuyer Roadmap. I'm reviewing loan options for {{location}} and found a few low-rate programs that might fit your budget. Do you have 3 minutes for a quick chat this afternoon? Reply STOP to opt out.",
    category: "new_lead",
    tags: ["Discovery", "Call Request", "Intro"],
    createdAt: "2026-01-15T08:00:00.000Z",
    updatedAt: "2026-01-15T08:00:00.000Z",
    ownerId: "system"
  },

  // 2. Down Payment Grants & Assistance
  {
    id: "sms-tpl-dpa-grant-funds",
    title: "💰 Oregon/Washington Down Payment Grants ($15k-$30k)",
    content: "Hi {{firstName}}, quick heads-up from {{loName}} at Cornerstone: State grant funds ($15,000 to $30,000 for down payment & closing costs) just replenished for qualified buyers in {{location}}. Would you like me to check if your household qualifies? Reply STOP to opt out.",
    category: "follow_up",
    tags: ["Down Payment Assistance", "Grant Funds", "DPA"],
    createdAt: "2026-01-15T08:00:00.000Z",
    updatedAt: "2026-01-15T08:00:00.000Z",
    ownerId: "system"
  },
  {
    id: "sms-tpl-zero-down-usda",
    title: "🏡 0% Down USDA & 100% Financing Programs",
    content: "Hi {{firstName}}, did you know several areas around {{location}} qualify for 0% down USDA and 100% financing programs? You may not need a massive down payment to buy your first home. Let's spend 3 minutes seeing what programs fit your monthly comfort zone. When works for a call? Reply STOP to opt out.",
    category: "follow_up",
    tags: ["USDA", "Zero Down", "100% Financing"],
    createdAt: "2026-01-15T08:00:00.000Z",
    updatedAt: "2026-01-15T08:00:00.000Z",
    ownerId: "system"
  },
  {
    id: "sms-tpl-fha-35-down",
    title: "📊 FHA 3.5% vs Conventional Side-by-Side",
    content: "Hi {{firstName}}, {{loName}} here. If you're saving for a down payment, FHA requires just 3.5% down and allows full seller credits for closing costs. Want me to send over a quick side-by-side comparison of FHA vs Conventional monthly payments for {{location}}? Reply STOP to opt out.",
    category: "follow_up",
    tags: ["FHA", "Conventional", "Comparison"],
    createdAt: "2026-01-15T08:00:00.000Z",
    updatedAt: "2026-01-15T08:00:00.000Z",
    ownerId: "system"
  },

  // 3. Interest Rates & 2-1 Buydown Relief
  {
    id: "sms-tpl-2-1-buydown",
    title: "📉 2-1 Temporary Buydown Payment Relief ($400-$700/mo)",
    content: "Hi {{firstName}}, {{loName}} here! Sellers in {{location}} are actively paying for 2-1 interest rate buydowns, lowering your mortgage payment by $400-$700/mo in years 1 & 2! Let me know if you'd like to see an exact payment breakdown on a sample listing. Reply STOP to opt out.",
    category: "follow_up",
    tags: ["2-1 Buydown", "Payment Relief", "Seller Credit"],
    createdAt: "2026-01-15T08:00:00.000Z",
    updatedAt: "2026-01-15T08:00:00.000Z",
    ownerId: "system"
  },
  {
    id: "sms-tpl-rate-dip-alert",
    title: "⚡ Market Rate Dip & Lifetime Refi Guarantee",
    content: "Hi {{firstName}}, mortgage rates had a favorable dip this week! Plus, Cornerstone offers free future refinances if rates pull back further after you close. Want to see what your updated monthly purchasing power looks like today? Reply STOP to opt out.",
    category: "follow_up",
    tags: ["Rate Alert", "Refi Guarantee", "Buying Power"],
    createdAt: "2026-01-15T08:00:00.000Z",
    updatedAt: "2026-01-15T08:00:00.000Z",
    ownerId: "system"
  },

  // 4. Open Houses & Realtor Co-Branding
  {
    id: "sms-tpl-weekend-tours",
    title: "🏠 Weekend Open House & On-Demand Approval Letter",
    content: "Hi {{firstName}}, {{loName}} with Cornerstone. Are you and [AgentName] touring open houses this weekend? Text me any property addresses you like and I will generate an on-demand pre-approval letter matched to the asking price so you can offer immediately. Have fun touring! Reply STOP to opt out.",
    category: "pre_approved",
    tags: ["Weekend Tours", "Open House", "Pre-Approval Letter"],
    createdAt: "2026-01-15T08:00:00.000Z",
    updatedAt: "2026-01-15T08:00:00.000Z",
    ownerId: "system"
  },
  {
    id: "sms-tpl-cobranded-sync",
    title: "🤝 Co-Branded Agent Sync & Exact Payment Quotes",
    content: "Hi {{firstName}}, {{loName}} here! I'm syncing with [AgentName] on your home search in {{location}}. If you see any homes on Zillow or Redfin you want to see in person, shoot me the link and I'll crunch the exact monthly payment with taxes & HOA included. Reply STOP to opt out.",
    category: "follow_up",
    tags: ["Agent Sync", "Property Analysis", "Payment Quote"],
    createdAt: "2026-01-15T08:00:00.000Z",
    updatedAt: "2026-01-15T08:00:00.000Z",
    ownerId: "system"
  },

  // 5. Pre-Approved & Escrow Milestones
  {
    id: "sms-tpl-preapproved-ready",
    title: "🎯 Pre-Approved: Listing Agent Call-in Advantage",
    content: "Awesome news {{firstName}}, your pre-approval is fully verified! When you and [AgentName] find a home you want to write an offer on, text me the address so I can call the listing agent directly to vouch for your financing strength. It makes a huge difference in getting offers accepted! Reply STOP to opt out.",
    category: "pre_approved",
    tags: ["Pre-Approved", "Offer Advantage", "Listing Agent Call"],
    createdAt: "2026-01-15T08:00:00.000Z",
    updatedAt: "2026-01-15T08:00:00.000Z",
    ownerId: "system"
  },
  {
    id: "sms-tpl-underwriting-milestone",
    title: "📋 In Escrow: Underwriting Submission Milestone",
    content: "Great milestone {{firstName}}! Your loan file has officially been submitted into initial underwriting. Everything is on schedule for our target closing date. I will text you as soon as the conditional approval is issued. Feel free to call/text with any questions! Reply STOP to opt out.",
    category: "in_escrow",
    tags: ["Underwriting", "Escrow", "Milestone"],
    createdAt: "2026-01-15T08:00:00.000Z",
    updatedAt: "2026-01-15T08:00:00.000Z",
    ownerId: "system"
  },
  {
    id: "sms-tpl-clear-to-close",
    title: "🎉 Clear-to-Close Celebration & Signing Prep",
    content: "Huge news {{firstName}}—we just received your official CLEAR TO CLOSE! Underwriting has signed off and closing disclosures are being finalized with escrow. You are almost at the finish line! Watch for signing appointment details shortly. Reply STOP to opt out.",
    category: "in_escrow",
    tags: ["Clear to Close", "Celebration", "Escrow"],
    createdAt: "2026-01-15T08:00:00.000Z",
    updatedAt: "2026-01-15T08:00:00.000Z",
    ownerId: "system"
  },

  // 6. Long-Term Nurture & Re-engagement
  {
    id: "sms-tpl-timeline-checkin",
    title: "☕ Casual Timeline Check-in & Status Update",
    content: "Hi {{firstName}}, checking in from Cornerstone First Mortgage! Are you still hoping to purchase a home in {{location}} this year, or has your timeline shifted? No pressure at all, just want to keep your pre-qualification numbers accurate for when you're ready. Reply STOP to opt out.",
    category: "follow_up",
    tags: ["Casual", "Timeline", "Re-engagement"],
    createdAt: "2026-01-15T08:00:00.000Z",
    updatedAt: "2026-01-15T08:00:00.000Z",
    ownerId: "system"
  },
  {
    id: "sms-tpl-price-reduction-alert",
    title: "🏷️ Price Reductions & Fresh Inventory in Area",
    content: "Hi {{firstName}}, {{loName}} here. Several great properties in {{location}} just saw price reductions. If you're still curious about buying, I'd love to run an updated monthly payment scenario on any of them for you. Let me know if you'd like a quick look! Reply STOP to opt out.",
    category: "follow_up",
    tags: ["Price Drops", "Inventory", "Scenario"],
    createdAt: "2026-01-15T08:00:00.000Z",
    updatedAt: "2026-01-15T08:00:00.000Z",
    ownerId: "system"
  },
  {
    id: "sms-tpl-annual-mortgage-review",
    title: "🏡 Post-Close Annual Equity & Rate Check",
    content: "Hi {{firstName}}, {{loName}} here! Happy homeiversary! Home values in {{location}} have shifted over the last year. Would you like a complimentary equity review and market rate check to see if eliminating PMI or lowering your payment makes sense? Reply STOP to opt out.",
    category: "post_close",
    tags: ["Post-Close", "Equity Review", "PMI Removal"],
    createdAt: "2026-01-15T08:00:00.000Z",
    updatedAt: "2026-01-15T08:00:00.000Z",
    ownerId: "system"
  }
];
