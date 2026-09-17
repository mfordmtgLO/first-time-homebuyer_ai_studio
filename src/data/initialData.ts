import { 
  FinancialProfile, 
  PropertyListing, 
  GrantProgram, 
  RoadmapMilestone, 
  DocumentItem, 
  EscrowMilestone, 
  GlossaryTerm,
  LoanOfficerProfile,
  RealEstateAgentProfile
} from "../types";

export const DEFAULT_FINANCIAL_PROFILE: FinancialProfile = {
  annualIncome: 115000,
  monthlyDebt: 450, // student loan + car payment
  downPaymentSavings: 45000,
  creditScore: 740,
  targetPrice: 425000,
  interestRate: 6.625,
  loanTermYears: 30,
  propertyTaxRate: 1.15,
  annualHomeInsurance: 1350,
  monthlyHOA: 75,
  state: "OR",
  pmiRate: 0.65,
  targetMaxMonthlyPayment: 3200
};

export const INITIAL_PROFILE = DEFAULT_FINANCIAL_PROFILE;


export const INITIAL_PROPERTIES: PropertyListing[] = [
  {
    id: "prop-1",
    isPubliclyPublished: false,
    title: "Sunlit Craftsman with Modern Kitchen",
    address: "2845 SE Division Street",
    city: "Portland",
    state: "OR",
    zip: "97202",
    price: 435000,
    priceHistory: [
      { date: "2026-06-01", price: 460000, event: "Listed" },
      { date: "2026-07-15", price: 450000, event: "Price Drop" },
      { date: "2026-08-10", price: 435000, event: "Price Drop" }
    ],
    beds: 3,
    baths: 2,
    sqft: 1840,
    yearBuilt: 2018,
    propertyType: "Single Family",
    imageUrl: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
    ],
    status: "touring",
    notes: "New roof installed 2023. Great backyard with cedar fencing. Walkable to local cafes and parks. Water pressure was strong in master bath.",
    tourDate: "2026-08-25T14:00:00",
    daysOnMarket: 9,
    hoaMonthly: 35,
    propertyTaxAnnual: 5200,
    isFavorite: true,
    scorecard: {
      roofAndExterior: 9,
      foundationAndStructure: 9,
      hvacAndElectrical: 8,
      plumbingAndWaterPressure: 8,
      kitchenAndBathrooms: 9,
      layoutAndNaturalLight: 9,
      neighborhoodAndSafety: 8,
      parkingAndAccess: 8,
      noiseAndSurroundings: 8,
      estimatedRenovationCost: 3500,
      redFlags: ["Minor hairline mortar joint on garage facade (cosmetic)"],
      positives: ["Brand new architectural shingle roof", "Quartz countertops", "Hardwood floors throughout", "Level 2 EV charger pre-wired"],
      overallRating: 8.9,
      grade: "A"
    }
  },
  {
    id: "prop-2",
    isPubliclyPublished: false,
    title: "Contemporary Cedar Townhome near MAX Light Rail",
    address: "1482 SW Beaverton-Hillsdale Hwy",
    city: "Beaverton",
    state: "OR",
    zip: "97005",
    price: 399000,
    priceHistory: [
      { date: "2026-07-01", price: 399000, event: "Listed" }
    ],
    beds: 2,
    baths: 2.5,
    sqft: 1450,
    yearBuilt: 2021,
    propertyType: "Townhouse",
    imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
    ],
    status: "saved",
    notes: "Low maintenance exterior. HOA covers water/trash and common grounds. 8 minutes to Beaverton Central MAX station.",
    daysOnMarket: 14,
    hoaMonthly: 195,
    propertyTaxAnnual: 3400,
    isFavorite: true,
    scorecard: {
      roofAndExterior: 9,
      foundationAndStructure: 9,
      hvacAndElectrical: 9,
      plumbingAndWaterPressure: 9,
      kitchenAndBathrooms: 8,
      layoutAndNaturalLight: 8,
      neighborhoodAndSafety: 9,
      parkingAndAccess: 7,
      noiseAndSurroundings: 8,
      estimatedRenovationCost: 1000,
      redFlags: ["Tandem 2-car garage instead of side-by-side"],
      positives: ["Under builder warranty", "Tankless water heater", "Private cedar balcony with greenbelt views"],
      overallRating: 8.7,
      grade: "A"
    }
  },
  {
    id: "prop-3",
    isPubliclyPublished: false,
    title: "Mid-Century Ranch on South Hills Mature Lot",
    address: "1840 University Street",
    city: "Eugene",
    state: "OR",
    zip: "97403",
    price: 460000,
    beds: 3,
    baths: 2,
    sqft: 1920,
    yearBuilt: 1978,
    propertyType: "Single Family",
    imageUrl: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=80"
    ],
    status: "saved",
    notes: "Original Douglas fir hardwood floors, great natural lighting. Heat pump is 14 years old and will need replacement in 2-3 years.",
    daysOnMarket: 22,
    hoaMonthly: 0,
    propertyTaxAnnual: 4100,
    isFavorite: false,
    scorecard: {
      roofAndExterior: 7,
      foundationAndStructure: 8,
      hvacAndElectrical: 5,
      plumbingAndWaterPressure: 7,
      kitchenAndBathrooms: 6,
      layoutAndNaturalLight: 8,
      neighborhoodAndSafety: 9,
      parkingAndAccess: 9,
      noiseAndSurroundings: 9,
      estimatedRenovationCost: 14000,
      redFlags: ["Aging heat pump unit (2012 model)", "Galvanized plumbing branch in laundry room"],
      positives: ["Zero HOA fees", "0.32 acre mature landscaped yard", "Close to South Eugene schools & trails"],
      overallRating: 7.6,
      grade: "B+"
    }
  },
  {
    id: "prop-4",
    isPubliclyPublished: false,
    title: "Modern Deschutes Pines Craftsman",
    address: "61420 Brosterhous Road",
    city: "Bend",
    state: "OR",
    zip: "97702",
    price: 445000,
    beds: 3,
    baths: 2,
    sqft: 1680,
    yearBuilt: 2019,
    propertyType: "Single Family",
    imageUrl: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
    galleryUrls: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1200&q=80"
    ],
    status: "offered",
    notes: "Submitted offer for $440,000 with $6,000 seller credit towards 2-1 interest rate buydown. Awaiting seller response.",
    daysOnMarket: 5,
    hoaMonthly: 60,
    propertyTaxAnnual: 3850,
    isFavorite: true,
    scorecard: {
      roofAndExterior: 9,
      foundationAndStructure: 9,
      hvacAndElectrical: 9,
      plumbingAndWaterPressure: 9,
      kitchenAndBathrooms: 9,
      layoutAndNaturalLight: 8,
      neighborhoodAndSafety: 8,
      parkingAndAccess: 8,
      noiseAndSurroundings: 8,
      estimatedRenovationCost: 1500,
      redFlags: [],
      positives: ["Move-in ready", "Smart home thermostat & keyless locks included", "Direct access to Larkspur trail system"],
      overallRating: 9.1,
      grade: "A+"
    }
  }
];

export const GRANT_PROGRAMS: GrantProgram[] = [
  {
    id: "grant-or-bond-cashassist",
    name: "OHCS Oregon Bond Residential Loan (Cash Assist)",
    provider: "Oregon Housing and Community Services (OHCS)",
    scope: "State",
    state: "OR",
    assistanceType: "Silent Second Loan",
    maxAssistance: "Up to 3% or 5% Cash Assistance (Down Payment & Closing)",
    incomeLimitDescription: "County limits up to $130,000+ (varies by county & household size in Oregon)",
    minCreditScore: 620,
    firstTimeBuyerRequired: true,
    description: "State of Oregon flagship loan program offering a below-market 30-year fixed rate mortgage paired with 3% or 5% in cash assistance for down payment and closing costs.",
    link: "https://www.oregon.gov/ohcs/homeownership/pages/housing-programs-buyers.aspx",
    highlights: [
      "Choice of 3% or 5% cash assistance for down payment & closing funds",
      "Available across all 36 Oregon counties",
      "Can pair with FHA, VA, USDA, or Conventional first mortgages"
    ]
  },
  {
    id: "grant-or-hap-grant",
    name: "OHCS Homeownership Assistance Program (HAP) DPA",
    provider: "Oregon Housing & Community Services / Regional CDCs",
    scope: "State",
    state: "OR",
    assistanceType: "Down Payment Assistance (DPA)",
    maxAssistance: "Up to $15,000 - $30,000 Down Payment Assistance",
    incomeLimitDescription: "Household income ≤80% of Oregon Area Median Income (AMI)",
    minCreditScore: 620,
    firstTimeBuyerRequired: true,
    description: "State-funded down payment assistance (DPA) administered across Oregon through regional non-profits (such as DevNW, Proud Ground, Hacienda CDC, and NeighborWorks).",
    link: "https://www.oregon.gov/ohcs/homeownership/pages/downpayment-assistance.aspx",
    highlights: [
      "State-funded down payment assistance (DPA) program",
      "Up to $30,000 for qualifying low-to-moderate income Oregon homebuyers",
      "Includes HUD-approved Oregon homebuyer counseling & certification"
    ]
  },
  {
    id: "grant-or-devnw-ida",
    name: "Oregon IDA Matched Savings Program (DevNW)",
    provider: "DevNW & Oregon IDA Initiative",
    scope: "State",
    state: "OR",
    assistanceType: "Matched Savings",
    maxAssistance: "Up to $12,000 - $20,000 in Matched Assistance Equity (Up to 5:1 Match)",
    incomeLimitDescription: "Net worth < $20,000; household income ≤80% Oregon Area Median Income",
    minCreditScore: 580,
    firstTimeBuyerRequired: true,
    description: "Oregon's premier Individual Development Account (IDA) matched savings program. For every $1 you deposit into your dedicated home savings account, Oregon matches it with up to $5 in matched assistance funds for your down payment.",
    link: "https://devnw.org/financial-programs/matched-savings-idas/",
    highlights: [
      "Up to 5:1 match on personal savings (matched assistance funds, not high-interest debt)",
      "Direct homebuyer equity assistance",
      "Active in Lane, Marion, Clackamas, Multnomah, Deschutes, and all OR counties"
    ]
  },
  {
    id: "grant-or-phb-dpal",
    name: "Portland Housing Bureau Down Payment Assistance (DPAL)",
    provider: "City of Portland Housing Bureau (PHB)",
    scope: "County",
    state: "OR",
    assistanceType: "Silent Second Loan",
    maxAssistance: "Up to $80,000 - $100,000 (0% Interest, 30-Year Deferred)",
    incomeLimitDescription: "Household income ≤100% Area Median Income (AMI) for City of Portland",
    minCreditScore: 620,
    firstTimeBuyerRequired: true,
    description: "0% interest, 30-year deferred second mortgage for first-time buyers purchasing a single-family home, townhome, or condo within Portland city boundaries.",
    link: "https://www.portland.gov/phb/dpal",
    highlights: [
      "0% interest rate with zero required monthly payments for 30 years",
      "Major purchasing power boost up to $100,000 in Portland metro area",
      "Deferred loan repayable only when home is sold, transferred, or refinanced"
    ]
  },
  {
    id: "grant-or-odva-veterans",
    name: "Oregon Department of Veterans' Affairs (ODVA) Home Loan",
    provider: "Oregon Department of Veterans' Affairs (State of Oregon)",
    scope: "State",
    state: "OR",
    assistanceType: "0% Down Program",
    maxAssistance: "100% Financing (0% Down) & Below-Market State Fixed Rates",
    incomeLimitDescription: "No income ceiling for eligible Oregon veterans and service members",
    minCreditScore: 620,
    firstTimeBuyerRequired: false,
    description: "Exclusive State of Oregon constitutional loan program offering low-interest fixed-rate home loans exclusively for Oregon veterans, separate from and usable in addition to federal VA benefits.",
    link: "https://www.oregon.gov/odva/benefits/pages/home-loans.aspx",
    highlights: [
      "State-backed below-market fixed interest rates for Oregon veterans",
      "0% down payment financing options available",
      "Valid for single-family residences, manufactured homes, and acreage in Oregon"
    ]
  },
  {
    id: "grant-or-proudground-clt",
    name: "Proud Ground Community Land Trust Down Payment Assistance (DPA)",
    provider: "Proud Ground (Pacific Northwest CLT)",
    scope: "State",
    state: "OR",
    assistanceType: "Down Payment Assistance (DPA)",
    maxAssistance: "$50,000 to $75,000 Purchase Price Subsidy / DPA",
    incomeLimitDescription: "Household income ≤80% AMI in Multnomah, Washington, Clackamas, Jackson",
    minCreditScore: 620,
    firstTimeBuyerRequired: true,
    description: "Permanently affordable homeownership model that provides substantial down payment assistance subsidies to lower the purchase price of homes in the Portland Metro area and Central/Southern Oregon.",
    link: "https://proudground.org/buy-a-home/",
    highlights: [
      "Directly reduces purchase price by $50,000 to $75,000+",
      "Locks in long-term affordability and low monthly mortgage payments",
      "Includes comprehensive pre-purchase and ongoing post-purchase advocacy"
    ]
  },
  {
    id: "grant-or-nw-umpqua",
    name: "NeighborWorks Umpqua Down Payment Assistance (DPA)",
    provider: "NeighborWorks Umpqua",
    scope: "County",
    state: "OR",
    assistanceType: "Silent Second Loan",
    maxAssistance: "Up to $20,000 at 0% Interest (Deferred Payment)",
    incomeLimitDescription: "Household income ≤80% Area Median Income (AMI) in SW Oregon",
    minCreditScore: 620,
    firstTimeBuyerRequired: true,
    description: "0% interest, deferred-payment second mortgage assisting first-time homebuyers across Douglas, Coos, Curry, Josephine, and Jackson counties in Oregon.",
    link: "https://nwumpqua.org/services/homeownership/",
    highlights: [
      "0% interest deferred second mortgage with zero monthly payments",
      "Specifically covers down payment and closing costs in rural/coastal Oregon",
      "Pairs seamlessly with USDA, FHA, or Conventional first mortgages"
    ]
  },
  {
    id: "grant-or-usda-rural",
    name: "USDA 0% Down Single Family Housing Loans (Oregon Eligible)",
    provider: "USDA Rural Development - Oregon State Office",
    scope: "State",
    state: "OR",
    assistanceType: "0% Down Program",
    maxAssistance: "100% Financing (0% Down Payment)",
    incomeLimitDescription: "Up to 115% AMI for eligible Oregon suburban/rural census tracts",
    minCreditScore: 640,
    firstTimeBuyerRequired: false,
    description: "Zero down payment government loan valid throughout designated suburban and rural communities across Oregon (including outer Willamette Valley, Central OR, Southern OR, and coastal areas).",
    link: "https://www.rd.usda.gov/or/programs-services/single-family-housing-programs",
    highlights: [
      "True 0% down payment required across eligible Oregon zip codes",
      "Lowest annual guarantee fee (0.35%) compared to other loan types",
      "USDA Direct 502 loan offers interest rate payment subsidies down to 1% in Oregon"
    ]
  },
  {
    id: "grant-or-va-guaranty",
    name: "Federal VA Home Loan (0% Down in Oregon)",
    provider: "U.S. Department of Veterans Affairs (Oregon Approved Lenders)",
    scope: "State",
    state: "OR",
    assistanceType: "0% Down Program",
    maxAssistance: "100% Financing (0% Down) & No Monthly PMI",
    incomeLimitDescription: "No income limit for qualifying veterans, active military, & surviving spouses in Oregon",
    minCreditScore: 580,
    firstTimeBuyerRequired: false,
    description: "100% financing (zero down payment) with no monthly private mortgage insurance (PMI) and competitive interest rates for military service members purchasing anywhere in Oregon.",
    link: "https://www.va.gov/housing-assistance/home-loans/",
    highlights: [
      "0% down payment across all 36 Oregon counties",
      "Zero monthly private mortgage insurance (PMI)",
      "Can be combined with Oregon state veteran benefits"
    ]
  },
  {
    id: "grant-or-homeready",
    name: "Fannie Mae HomeReady® / Freddie Home Possible® (Oregon)",
    provider: "Fannie Mae & Freddie Mac (Oregon Approved Lenders)",
    scope: "State",
    state: "OR",
    assistanceType: "0% Down Program",
    maxAssistance: "97% Financing (Only 3% Down) + Discounted PMI",
    incomeLimitDescription: "Household income ≤80% of Oregon County Area Median Income (AMI)",
    minCreditScore: 620,
    firstTimeBuyerRequired: false,
    description: "Conventional 3% down payment mortgage program tailored for low-to-moderate income Oregon homebuyers, featuring deeply discounted monthly mortgage insurance (PMI) rates.",
    link: "https://singlefamily.fanniemae.com/originating-underwriting/mortgage-products/homeready-mortgage",
    highlights: [
      "Only 3% down payment required on Oregon residential properties",
      "Reduced PMI saves $60-$180/month compared to standard conventional",
      "Supports ADUs (Accessory Dwelling Units) and boarder income in Oregon"
    ]
  },
  {
    id: "grant-or-fha",
    name: "FHA 3.5% Down Mortgage (Oregon County Limits)",
    provider: "Federal Housing Administration (HUD / Oregon Lenders)",
    scope: "State",
    state: "OR",
    assistanceType: "0% Down Program",
    maxAssistance: "96.5% Financing (Only 3.5% Down)",
    incomeLimitDescription: "Flexible debt ratios; conforms to Oregon county limits ($498k - $600k+ in Portland metro)",
    minCreditScore: 580,
    firstTimeBuyerRequired: false,
    description: "Government-backed 3.5% down mortgage widely accepted across Oregon with flexible credit criteria, high debt-to-income limits, and full compatibility with OHCS down payment assistance.",
    link: "https://www.hud.gov/states/oregon/homeownership/buyingprgms",
    highlights: [
      "580+ credit score for 3.5% down payment in Oregon",
      "100% of down payment can be gift funds or OHCS Down Payment Assistance (DPA)",
      "Seller can contribute up to 6% towards buyer closing costs"
    ]
  }
];

export const ROADMAP_MILESTONES: RoadmapMilestone[] = [
  {
    id: "step-1",
    stepNumber: 1,
    stage: "Readiness",
    title: "Financial Health Check & Budget Reality",
    summary: "Audit your credit reports, calculate your front-end and back-end DTI ratios, and establish your true maximum down payment reserve.",
    duration: "1-2 Weeks",
    completed: true,
    tasks: [
      { id: "t1-1", text: "Pull free official credit reports from AnnualCreditReport.com (look for errors)", done: true },
      { id: "t1-2", text: "Calculate Debt-to-Income (DTI) ratio keeping total debts under 36-43%", done: true },
      { id: "t1-3", text: "Calculate 3-6 month post-closing emergency emergency reserve separate from down payment", done: true }
    ],
    keyTips: [
      "Lenders check your 3-digit FICO scores (FICO 2, 4, 5 for mortgages), which differ from Credit Karma VantageScore.",
      "Do NOT open new credit cards, finance a car, or make large deposits before applying."
    ],
    commonPitfalls: [
      "Spending 100% of savings on the down payment, leaving zero dollars for immediate roof/plumbing emergencies or moving.",
      "Assuming pre-qualification is the same as a verified underwriter pre-approval."
    ]
  },
  {
    id: "step-2",
    stepNumber: 2,
    stage: "Financing",
    title: "Mortgage Pre-Approval & Loan Shopping",
    summary: "Submit W-2s, tax returns, and bank statements to 2-3 lenders (direct lender, mortgage broker, credit union) to secure a verified pre-approval letter.",
    duration: "1-3 Weeks",
    completed: true,
    tasks: [
      { id: "t2-1", text: "Gather 2 years W-2s, 30 days paystubs, and 2 months bank statements", done: true },
      { id: "t2-2", text: "Compare Loan Estimates (LE) from at least 3 lenders within a 14-45 day window to protect credit", done: true },
      { id: "t2-3", text: "Explore state Down Payment Assistance (DPA) and Fannie Mae HomeReady programs", done: false }
    ],
    keyTips: [
      "Credit bureaus count multiple mortgage inquiries within a 14-45 day window as a single credit pull!",
      "Compare the APR (Annual Percentage Rate), not just the interest rate, to see true lender fees."
    ],
    commonPitfalls: [
      "Choosing a lender solely based on a low advertised rate that includes expensive hidden discount points.",
      "Switching jobs or going from W-2 to 1099 freelance during the pre-approval phase."
    ]
  },
  {
    id: "step-3",
    stepNumber: 3,
    stage: "Hunting",
    title: "Hire a Buyer's Agent & Define Non-Negotiables",
    summary: "Interview 2-3 local buyer's agents who specialize in first-time buyer representation, local school zones, and property negotiation.",
    duration: "1 Week",
    completed: false,
    tasks: [
      { id: "t3-1", text: "Interview 2-3 buyer agents and ask how many first-time buyers they closed this year", done: false },
      { id: "t3-2", text: "Create a strict 'Needs vs Nice-to-Haves' checklist with commute, HOA, and floorplan rules", done: false },
      { id: "t3-3", text: "Set up automated MLS search portal alerts for your target price and zip codes", done: false }
    ],
    keyTips: [
      "Ask your agent how they handle appraisal gaps, escalation clauses, and seller repair credits.",
      "Review the buyer representation agreement terms before signing."
    ],
    commonPitfalls: [
      "Using the seller's listing agent directly (dual agency), which creates a conflict of interest in negotiations."
    ]
  },
  {
    id: "step-4",
    stepNumber: 4,
    stage: "Hunting",
    title: "Home Tours & Structural Scorecard Audits",
    summary: "Attend open houses and private showings. Use the interactive Home Tour Scorecard to inspect foundation, HVAC age, water pressure, and neighborhood vibes.",
    duration: "2-6 Weeks",
    completed: false,
    tasks: [
      { id: "t4-1", text: "Tour at least 6-10 properties to build an accurate gauge of neighborhood price/sqft value", done: false },
      { id: "t4-2", text: "Test water pressure, check age of water heater/HVAC label plate, and inspect window seals", done: false },
      { id: "t4-3", text: "Drive through the neighborhood on a weekday morning and Friday night for noise and parking checks", done: false }
    ],
    keyTips: [
      "Focus on things you CANNOT change: location, lot slope, floorplan layout, ceiling height, and traffic noise.",
      "Paint, outdated lighting, and carpet are cheap cosmetic fixes that often scare off competing buyers."
    ],
    commonPitfalls: [
      "Falling in love with home staging furniture and ignoring an ancient 20-year-old roof or cracked slab foundation."
    ]
  },
  {
    id: "step-5",
    stepNumber: 5,
    stage: "Contract",
    title: "Crafting a Winning & Safe Purchase Offer",
    summary: "Work with your agent to run comparative market analysis (comps), formulate offer price, earnest money deposit, and protective contingencies.",
    duration: "1-3 Days",
    completed: false,
    tasks: [
      { id: "t5-1", text: "Review recent 90-day sold comps in the same subdivision with your agent", done: false },
      { id: "t5-2", text: "Determine Earnest Money Deposit (EMD, typically 1-3% of purchase price)", done: false },
      { id: "t5-3", text: "Include essential contingencies: 7-10 day Home Inspection, Financing, and Appraisal", done: false }
    ],
    keyTips: [
      "In a buyer's market, request a 2-3% seller credit to fund a 2-1 temporary interest rate buydown!",
      "An escalation clause allows you to automatically outbid competing offers up to a strict maximum cap."
    ],
    commonPitfalls: [
      "Waiving the inspection contingency as a first-time buyer on an older home."
    ]
  },
  {
    id: "step-6",
    stepNumber: 6,
    stage: "Contract",
    title: "Offer Acceptance & Escrow Opened",
    summary: "Congratulations! Your offer is accepted. Wire your Earnest Money Deposit (EMD) to the escrow/title company within 48-72 hours.",
    duration: "Day 1-3 of Escrow",
    completed: false,
    tasks: [
      { id: "t6-1", text: "Verify wiring instructions by calling title officer directly (prevent wire fraud)", done: false },
      { id: "t6-2", text: "Transfer Earnest Money Deposit before strict contract deadline", done: false },
      { id: "t6-3", text: "Send ratified purchase agreement to your mortgage loan officer to lock interest rate", done: false }
    ],
    keyTips: [
      "CRITICAL: Always verbally verify wire instructions over the phone with the title company before wiring money.",
      "Title companies never change wire instructions via last-minute email."
    ],
    commonPitfalls: [
      "Missing the EMD deadline, which can allow the seller to legally cancel the contract and keep your deposit."
    ]
  },
  {
    id: "step-7",
    stepNumber: 7,
    stage: "Closing",
    title: "Home Inspection & Repair Negotiation",
    summary: "Hire an independent licensed home inspector (and specialists for sewer scope, radon, or roof if recommended) and negotiate repair credits.",
    duration: "Day 5-12 of Escrow",
    completed: false,
    tasks: [
      { id: "t7-1", text: "Attend the last hour of the home inspection to walk through findings with inspector", done: false },
      { id: "t7-2", text: "Review 40+ page inspection report for major safety, structural, electrical, and plumbing hazards", done: false },
      { id: "t7-3", text: "Submit Repair Request Addendum asking for seller closing credits or critical repairs", done: false }
    ],
    keyTips: [
      "Request financial closing credits rather than asking the seller to do repairs, so you can hire quality contractors yourself.",
      "Order a $150-$250 sewer lateral scope camera inspection for homes older than 15 years."
    ],
    commonPitfalls: [
      "Focusing on 20 minor $50 cosmetic punchlist items and missing a $10,000 failing sewer pipe or knob-and-tube wiring."
    ]
  },
  {
    id: "step-8",
    stepNumber: 8,
    stage: "Closing",
    title: "Appraisal & Underwriting Final Approval",
    summary: "The lender orders an independent appraisal to verify market value and completes full underwriting scrutiny to issue 'Clear to Close' (CTC).",
    duration: "Day 12-25 of Escrow",
    completed: false,
    tasks: [
      { id: "t8-1", text: "Lender appraisal ordered and confirmed meeting contract price", done: false },
      { id: "t8-2", text: "Secure homeowners insurance policy binder and send to loan officer", done: false },
      { id: "t8-3", text: "Receive formal 'Clear to Close' (CTC) notification from underwriter", done: false }
    ],
    keyTips: [
      "If appraisal comes in low, options include: seller lowers price, buyer pays difference, meet in the middle, or dispute comp data.",
      "Keep all bank accounts steady. Do not move large funds between accounts without documenting paper trails."
    ],
    commonPitfalls: [
      "Applying for new credit or financing furniture for the new house before final loan documents are signed."
    ]
  },
  {
    id: "step-9",
    stepNumber: 9,
    stage: "Closing",
    title: "Closing Disclosure (CD) & Final Walkthrough",
    summary: "Review your final Closing Disclosure (CD) 3 business days prior to closing, compare against original Loan Estimate, and do the final walkthrough.",
    duration: "Day 27-29 of Escrow",
    completed: false,
    tasks: [
      { id: "t9-1", text: "Review Closing Disclosure line-by-line; check cash-to-close amount and interest rate", done: false },
      { id: "t9-2", text: "Conduct final walkthrough 24 hours before closing: test appliances, AC/heat, outlets, and ensure seller moved out", done: false },
      { id: "t9-3", text: "Set up electricity, water, gas, and internet accounts for closing day transfer", done: false }
    ],
    keyTips: [
      "Bring a phone charger to test every wall outlet during the final walkthrough.",
      "Ensure all agreed inspection repair receipts and contractor warranties are in hand."
    ],
    commonPitfalls: [
      "Skipping the final walkthrough because you are busy packing."
    ]
  },
  {
    id: "step-10",
    stepNumber: 10,
    stage: "Closing",
    title: "Signing, Funding, Recording & Keys in Hand!",
    summary: "Sign closing documents with a notary/settlement agent, wire final down payment funds, await deed recording at the county, and receive your keys!",
    duration: "Closing Day (Day 30)",
    completed: false,
    tasks: [
      { id: "t10-1", text: "Bring 2 forms of government photo ID and cashier's check / confirmed wire receipt", done: false },
      { id: "t10-2", text: "Sign Deed of Trust, Promissory Note, and closing disclosures with notary", done: false },
      { id: "t10-3", text: "Await county recording confirmation and celebrate receiving the keys to your first home!", done: false }
    ],
    keyTips: [
      "Change the deadbolts and garage door codes on Day 1 of moving in.",
      "Locate your main water shutoff valve and electrical breaker panel immediately."
    ],
    commonPitfalls: [
      "Forgetting to file for your state's Homestead Property Tax Exemption after moving in to save on property taxes!"
    ]
  }
];

export const DOCUMENT_VAULT_ITEMS: DocumentItem[] = [
  {
    id: "doc-1",
    title: "Last 2 Years W-2 Forms (All employers)",
    category: "Income & Taxes",
    required: true,
    status: "ready",
    description: "Full federal W-2 wage statements for past 2 consecutive calendar years.",
    acceptedFormats: "PDF, scanned image"
  },
  {
    id: "doc-2",
    title: "Recent 30 Days Paystubs",
    category: "Income & Taxes",
    required: true,
    status: "ready",
    description: "Most recent 2-4 consecutive paystubs showing Year-to-Date (YTD) earnings.",
    acceptedFormats: "PDF"
  },
  {
    id: "doc-3",
    title: "2 Years Federal Tax Returns (1040s with all schedules)",
    category: "Income & Taxes",
    required: true,
    status: "ready",
    description: "Complete federal tax returns, especially vital for 1099, bonus, or overtime income.",
    acceptedFormats: "PDF"
  },
  {
    id: "doc-4",
    title: "Last 2 Months Bank Statements (Checking & Savings)",
    category: "Assets & Bank",
    required: true,
    status: "ready",
    description: "All pages of statements (e.g. Page 1 to 6) showing source of down payment funds.",
    acceptedFormats: "Official Bank PDF"
  },
  {
    id: "doc-5",
    title: "Retirement / 401(k) / Investment Statements",
    category: "Assets & Bank",
    required: false,
    status: "submitted",
    description: "Quarterly statements proving reserves or funds eligible for hardship withdrawal.",
    acceptedFormats: "PDF"
  },
  {
    id: "doc-6",
    title: "Gift Letter & Donor Bank Statement (if applicable)",
    category: "Assets & Bank",
    required: false,
    status: "pending",
    description: "Signed lender gift letter stating funds are a gift with no repayment required.",
    acceptedFormats: "Lender form PDF"
  },
  {
    id: "doc-7",
    title: "Government-Issued Photo ID (Driver's License / Passport)",
    category: "Identification & Credit",
    required: true,
    status: "ready",
    description: "Valid unexpired state driver's license, Real ID, or passport.",
    acceptedFormats: "High-res color photo or PDF"
  },
  {
    id: "doc-8",
    title: "Proof of Down Payment Assistance (DPA) Approval",
    category: "Property & Contract",
    required: false,
    status: "pending",
    description: "State or housing authority Down Payment Assistance (DPA) pre-qualification certificate.",
    acceptedFormats: "PDF"
  },
  {
    id: "doc-9",
    title: "Homeowners Insurance Binder & Quote",
    category: "Property & Contract",
    required: true,
    status: "pending",
    description: "1-year prepaid hazard and fire insurance policy with lender named as loss payee.",
    acceptedFormats: "Insurance agency PDF"
  }
];

export const ESCROW_TIMELINE_STEPS: EscrowMilestone[] = [
  {
    id: "escrow-1",
    dayTarget: "Day 1-3",
    title: "Earnest Money Deposit (EMD) Wire & Escrow Opening",
    status: "completed",
    description: "Escrow officer opens file. Buyer wires 1-3% deposit to title trust account.",
    actionItems: ["Call title company to verify wire routing number", "Obtain wire confirmation receipt", "Forward receipt to loan officer"],
    criticalDeadline: true
  },
  {
    id: "escrow-2",
    dayTarget: "Day 4-10",
    title: "Home & Specialty Inspections Window",
    status: "in_progress",
    description: "Full physical inspection of roof, attic, HVAC, electrical panel, plumbing, and foundation.",
    actionItems: ["Book licensed inspector", "Attend summary walkthrough", "Request sewer scope camera inspection", "Compile list of safety red flags"],
    criticalDeadline: true
  },
  {
    id: "escrow-3",
    dayTarget: "Day 11-14",
    title: "Inspection Repair Negotiation & Addendum",
    status: "upcoming",
    description: "Submit official repair request or request seller closing credit/price reduction.",
    actionItems: ["Consult with buyer agent on credit vs repair strategy", "Sign repair addendum with seller", "Release inspection contingency if satisfied"],
    criticalDeadline: true
  },
  {
    id: "escrow-4",
    dayTarget: "Day 12-18",
    title: "Lender Appraisal & Preliminary Title Report",
    status: "upcoming",
    description: "Licensed appraiser evaluates property valuation. Title company clears any liens.",
    actionItems: ["Review appraisal report valuation", "Review title preliminary report for easements or tax liens"],
    criticalDeadline: false
  },
  {
    id: "escrow-5",
    dayTarget: "Day 20-25",
    title: "Loan Underwriting Approval (Clear to Close)",
    status: "upcoming",
    description: "Underwriter completes final employment verification and issues official Clear to Close.",
    actionItems: ["Provide any last-minute updated paystub", "Lock homeowners hazard insurance policy", "Receive 3-Day Closing Disclosure (CD)"],
    criticalDeadline: true
  },
  {
    id: "escrow-6",
    dayTarget: "Day 28-29",
    title: "Final Walkthrough & Signing Appointment",
    status: "upcoming",
    description: "Inspect home to confirm condition and agreed repairs. Sign notary deed documents.",
    actionItems: ["Test heat/AC, water faucets, and appliances", "Verify seller moved out and broom cleaned", "Sign closing documents with title notary"],
    criticalDeadline: false
  },
  {
    id: "escrow-7",
    dayTarget: "Day 30",
    title: "Funding, County Deed Recording & Key Handover",
    status: "upcoming",
    description: "Lender wires loan funds to escrow. County recorder registers deed. Keys delivered!",
    actionItems: ["Wire final Cash-to-Close funds", "Receive county recording confirmation number", "Pick up keys and garage remotes"],
    criticalDeadline: true
  }
];

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    term: "Debt-to-Income (DTI) Ratio",
    category: "Financial & DTI",
    definition: "The percentage of your gross monthly income that goes toward paying monthly debts (credit cards, student loans, car payments, plus your proposed new mortgage payment).",
    whyItMatters: "Most conventional loans require a back-end DTI of 43-45% or lower, while FHA allows up to 50% in certain circumstances.",
    proTip: "Pay off small installment loans with high monthly payments right before applying to dramatically boost your purchasing power."
  },
  {
    term: "Private Mortgage Insurance (PMI)",
    category: "Mortgage & Rates",
    definition: "An insurance policy that protects the lender in case you default on your loan, required on conventional loans when putting down less than 20%.",
    whyItMatters: "Typically costs 0.3% to 1.2% of your loan amount per year ($100-$300/mo on a $400k home).",
    proTip: "On conventional loans, PMI automatically cancels when your loan balance reaches 78% of the original purchase price, or you can request cancellation at 80% with an updated appraisal."
  },
  {
    term: "Earnest Money Deposit (EMD)",
    category: "Closing & Legal",
    definition: "A good-faith cash deposit (usually 1% to 3% of purchase price) placed into escrow when your purchase offer is accepted.",
    whyItMatters: "Shows the seller you are serious. If you back out for reasons protected by your contingencies (like inspection), you get 100% of this money back.",
    proTip: "Never waive your inspection or financing contingency unless you are willing to forfeit this deposit if something goes wrong."
  },
  {
    term: "Appraisal Gap Clause",
    category: "Closing & Legal",
    definition: "A clause in your offer where the buyer agrees to pay a specific cash amount if the lender's appraisal comes in lower than the agreed purchase price.",
    whyItMatters: "Lenders only loan money based on the appraised value, not your contract price.",
    proTip: "If offering over list price in a competitive market, a capped appraisal gap guarantee (e.g. up to $5,000) makes your offer competitive without infinite risk."
  },
  {
    term: "Seller Concessions / Seller Credits",
    category: "Closing & Legal",
    definition: "Money paid by the seller at closing to cover a portion of the buyer's closing costs, prepaid escrow fees, or mortgage rate buydown.",
    whyItMatters: "Saves you thousands of dollars out-of-pocket on closing day.",
    proTip: "Use a 2-3% seller concession to fund a '2-1 Buydown'—lowering your interest rate by 2% in Year 1 and 1% in Year 2!"
  },
  {
    term: "Discount Points / Rate Buydown",
    category: "Mortgage & Rates",
    definition: "Prepaid interest paid directly to the lender at closing in exchange for a permanently lower interest rate. 1 point costs 1% of the loan amount and typically lowers rate by 0.25%.",
    whyItMatters: "Determine your break-even period (Cost of points divided by monthly savings). If break-even is 5 years and you plan to refinance in 2 years, points are a waste.",
    proTip: "In a declining rate environment, avoid paying high upfront discount points since you will likely refinance anyway."
  },
  {
    term: "Escrow Account (Impound Account)",
    category: "Mortgage & Rates",
    definition: "A holding account managed by your loan servicer where a portion of your monthly mortgage payment is set aside to pay annual property taxes and homeowners insurance on your behalf.",
    whyItMatters: "Ensures you don't face a surprise multi-thousand dollar tax bill at the end of the year.",
    proTip: "At closing, lenders typically require 2-4 months of prepaid property taxes and 12-14 months of insurance to seed this account."
  },
  {
    term: "Title Insurance (Owner's Policy vs Lender's Policy)",
    category: "Closing & Legal",
    definition: "Insurance that protects against past financial liens, boundary disputes, forged deeds, or unknown heirs claiming ownership of the property.",
    whyItMatters: "The lender requires a Lender's Policy to protect their loan, but first-time buyers should ALWAYS purchase the Owner's Policy for one-time protection.",
    proTip: "Owner's title insurance lasts as long as you or your heirs own the property with just a single one-time premium paid at closing."
  },
  {
    term: "Loan Estimate (LE)",
    category: "Mortgage & Rates",
    definition: "A standardized 3-page disclosure form that lenders are legally required to send you within 3 business days of applying for a mortgage.",
    whyItMatters: "Allows easy side-by-side comparison of loan terms, interest rates, origination charges, and estimated closing costs between different lenders.",
    proTip: "Look closely at 'Section A: Origination Charges' on Page 2—this is the only section the lender directly controls and sets."
  },
  {
    term: "Closing Disclosure (CD)",
    category: "Closing & Legal",
    definition: "A final 5-page document provided 3 business days before closing detailing your exact loan terms, monthly payment, and final 'Cash to Close' wire amount.",
    whyItMatters: "Compare every line item on the CD against your initial Loan Estimate (LE) to catch any unexpected fee increases.",
    proTip: "By federal law (TRID rule), you have 3 business days to review this document before you are allowed to sign closing papers."
  }
];

export const DEFAULT_LOAN_OFFICER: LoanOfficerProfile = {
  id: "lo-mike-ford",
  name: "Mike Ford",
  title: "Senior Loan Officer & Branch Admin",
  nmlsId: "288455",
  company: "Cornerstone First Mortgage, LLC NMLS#173855",
  branch: "Pacific Northwest HQ - Lake Oswego",
  branchId: "BRANCH-001-OR",
  branchManagerName: "Mike Ford",
  branchCity: "Lake Oswego",
  branchState: "Oregon",
  email: "mford@cfmtg.com",
  phone: "(541) 729-0819",
  headshotUrl: "/mike-ford-headshot.jpg",
  websiteUrl: "https://cfmtg.com/mford/",
  bio: "With over 16 years specializing exclusively in first-time homebuyers across Oregon and Washington, Mike specializes in low-stress pre-approvals, maximum Interested Party Contribution (IPC) seller concession strategies, and locking in state Down Payment Assistance (DPA) programs.",
  specialties: [
    "First-Time Homebuyer Programs",
    "FHA, Conventional, VA & USDA",
    "Oregon Down Payment Assistance (DPA)",
    "Seller Concession (IPC) Optimization",
    "2/1 Rate Buydown Engineering"
  ],
  bookingUrl: "https://calendly.com",
  leadGenFormUrl: "https://portal.myhometrac.com/get-started/MFORD@CFMTG.COM",
  leadGenQrCodeUrl: "/lead-gen-qr-code.png",
  licenseStates: ["Oregon", "Washington", "California", "Idaho"],
  licenseVerificationYear: 2026,
  licenseLastVerifiedDate: "2026-01-10",
  production12MoVolume: 48500000,
  production12MoUnits: 86,
  production6MoVolume: 24800000,
  production6MoUnits: 44,
  production3MoVolume: 12600000,
  production3MoUnits: 22,
  production30DaysVolume: 4200000,
  production30DaysUnits: 8,
  adExpensesTotal: 1850,
  adExpensesBreakdown: [
    { source: "Facebook Ads", amount: 650, campaignName: "Meta Feed - 2026 Oregon FTHB DPA Flyer", assetType: "facebook_ad" },
    { source: "Google Ads", amount: 500, campaignName: "Google Search - Oregon First-Time Buyer Grants", assetType: "google_ad" },
    { source: "YouTube Video Ads", amount: 450, campaignName: "Vantage AI Video - 1240 Willamette Heights Walkthrough", assetType: "youtube_video" },
    { source: "GeoSphere GIS Map", amount: 250, campaignName: "GeoSphere Map Interactive Property Widget", assetType: "geosphere_map" }
  ],
  geosphereAccessGranted: true,
  vantageAdsAccessGranted: true,
  twilioPhoneNumber: "+15038493478",
  twilioAccountSid: "AC9981a2f4c39e801b7a661f22d9b4001e",
  twilioEnabled: true,
  twilioByokConfigured: true,
  byokKeysStatus: { rentcast: true, videoAi: true, metaAds: true, twilio: true },
  topPartners12Mo: [
    {
      partnerId: "agent-sarah-jenkins",
      partnerName: "Sarah Jenkins",
      partnerCompanyOrBrokerage: "Cascade Valley Real Estate",
      partnerRole: "agent",
      closedUnits12Mo: 16,
      closedVolume12Mo: 8450000,
      partnerNmlsOrLicense: "OR Lic #201208941",
      buysideSharePct: 82
    },
    {
      partnerId: "agent-marcus-vance",
      partnerName: "Marcus Vance",
      partnerCompanyOrBrokerage: "Willamette Heritage Realty",
      partnerRole: "agent",
      closedUnits12Mo: 12,
      closedVolume12Mo: 6200000,
      partnerNmlsOrLicense: "OR Lic #200804192",
      buysideSharePct: 76
    },
    {
      partnerId: "agent-elena-rostova",
      partnerName: "Elena Rostova",
      partnerCompanyOrBrokerage: "Urban Nest Properties",
      partnerRole: "agent",
      closedUnits12Mo: 10,
      closedVolume12Mo: 4850000,
      partnerNmlsOrLicense: "OR Lic #201509332",
      buysideSharePct: 80
    }
  ],
  isAdmin: true,
  password: "admin123",
  customSlug: "mike-ford",
  adSettings: {
    metaAdAccountId: "act_49182049182",
    metaPixelId: "918237192837461",
    googleCustomerId: "842-192-4910",
    googleConversionId: "AW-104928109",
    targetCities: ["Portland", "Beaverton", "Gresham", "Oregon City", "Lake Oswego"],
    dailyBudgetUSD: 25,
    adSpendMonthlyCap: 750,
    creditCardConfigured: false
  }
};

export const INITIAL_TEAM_LOAN_OFFICERS: LoanOfficerProfile[] = [
  DEFAULT_LOAN_OFFICER,
  {
    id: "lo-lonn-kilstrom",
    name: "Lonn Kilstrom",
    title: "Branch Manager",
    nmlsId: "NMLS #117954",
    company: "Cornerstone First Mortgage",
    branch: "Team Lonn Kilstrom Branch - Portland",
    branchId: "BRANCH-001-OR",
    branchManagerName: "Lonn Kilstrom",
    branchCity: "Portland",
    branchState: "Oregon",
    email: "LKilstrom@cfmtg.com",
    phone: "(503) 849-3478",
    headshotUrl: "",
    websiteUrl: "https://cfmtg.com/lkilstrom/",
    bio: "Decades of premier mortgage leadership heading the Team Lonn Kilstrom branch at Cornerstone First Mortgage, providing seasoned homebuyer advisory, custom loan structuring, and 5-star closing experiences.",
    specialties: [
      "Branch Leadership & Advisory",
      "First-Time Homebuyer Solutions",
      "Conventional, FHA & VA Loans",
      "Down Payment Assistance (DPA)",
      "Rate Buydown Strategies"
    ],
    bookingUrl: "https://calendly.com",
    licenseStates: ["Oregon", "Washington", "California", "Idaho", "Arizona"],
    licenseVerificationYear: 2026,
    licenseLastVerifiedDate: "2026-01-15",
    production12MoVolume: 32400000,
    production12MoUnits: 64,
    production6MoVolume: 16500000,
    production6MoUnits: 32,
    production3MoVolume: 8200000,
    production3MoUnits: 16,
    production30DaysVolume: 2900000,
    production30DaysUnits: 6,
    adExpensesTotal: 1420,
    adExpensesBreakdown: [
      { source: "Facebook Ads", amount: 520, campaignName: "FB Carousel - 3% Down Conventional vs FHA", assetType: "facebook_ad" },
      { source: "Google Ads", amount: 450, campaignName: "Google Search - Portland First-Time Buyer Loans", assetType: "google_ad" },
      { source: "YouTube Video Ads", amount: 300, campaignName: "Vantage AI Video - Rate Buydown Calculation Guide", assetType: "youtube_video" },
      { source: "GeoSphere GIS Map", amount: 150, campaignName: "GeoSphere Map USDA Zero Down Homes", assetType: "geosphere_map" }
    ],
    geosphereAccessGranted: true,
    vantageAdsAccessGranted: true,
    twilioPhoneNumber: "+15038493478",
    twilioAccountSid: "AC9981a2f4c39e801b7a661f22d9b4001e",
    twilioEnabled: true,
    twilioByokConfigured: true,
    byokKeysStatus: { rentcast: true, videoAi: true, metaAds: true, twilio: true },
    topPartners12Mo: [
      {
        partnerId: "agent-sarah-jenkins",
        partnerName: "Sarah Jenkins",
        partnerCompanyOrBrokerage: "Cascade Valley Real Estate",
        partnerRole: "agent",
        closedUnits12Mo: 11,
        closedVolume12Mo: 5600000,
        partnerNmlsOrLicense: "OR Lic #201208941",
        buysideSharePct: 78
      },
      {
        partnerId: "agent-tyler-brooks",
        partnerName: "Tyler Brooks",
        partnerCompanyOrBrokerage: "Pacific Crest Real Estate",
        partnerRole: "agent",
        closedUnits12Mo: 9,
        closedVolume12Mo: 4650000,
        partnerNmlsOrLicense: "OR Lic #202108194",
        buysideSharePct: 72
      },
      {
        partnerId: "agent-marcus-vance",
        partnerName: "Marcus Vance",
        partnerCompanyOrBrokerage: "Willamette Heritage Realty",
        partnerRole: "agent",
        closedUnits12Mo: 8,
        closedVolume12Mo: 3950000,
        partnerNmlsOrLicense: "OR Lic #200804192",
        buysideSharePct: 70
      }
    ],
    isAdmin: false,
    password: "pass123",
    parentManagerId: "lo-mike-ford",
    customSlug: "lonn-kilstrom",
    adSettings: {
      targetCities: ["Portland", "Beaverton", "Lake Oswego", "West Linn"],
      dailyBudgetUSD: 25,
      adSpendMonthlyCap: 750,
      creditCardConfigured: false
    }
  },
  {
    id: "lo-alan-burkhart",
    name: "Alan Burkhart",
    title: "Home Mortgage Consultant",
    nmlsId: "NMLS #312229",
    company: "Cornerstone First Mortgage",
    branch: "Team Lonn Kilstrom Branch - Portland",
    branchId: "BRANCH-001-OR",
    branchManagerName: "Lonn Kilstrom",
    branchCity: "Portland",
    branchState: "Oregon",
    email: "aburkhart@cfmtg.com",
    phone: "(503) 555-0155",
    headshotUrl: "",
    websiteUrl: "https://cfmtg.com/aburkhart/",
    bio: "Experienced Home Mortgage Consultant with Team Lonn Kilstrom at Cornerstone First Mortgage, providing personalized service, expert first-time buyer pre-approvals, and comprehensive loan program options across Oregon and Washington.",
    specialties: [
      "First-Time Buyer Pre-Approvals",
      "Oregon & Washington Home Loans",
      "FHA & Conventional 3% Down",
      "Seller Concession Structuring"
    ],
    bookingUrl: "https://calendly.com",
    licenseStates: ["Oregon", "Washington"],
    licenseVerificationYear: 2026,
    licenseLastVerifiedDate: "2026-01-16",
    production12MoVolume: 29800000,
    production12MoUnits: 58,
    production6MoVolume: 14900000,
    production6MoUnits: 29,
    production3MoVolume: 7400000,
    production3MoUnits: 14,
    production30DaysVolume: 2400000,
    production30DaysUnits: 5,
    adExpensesTotal: 980,
    adExpensesBreakdown: [
      { source: "Facebook Ads", amount: 380, campaignName: "FB Stories - FTHB Grant Eligibility", assetType: "facebook_ad" },
      { source: "Google Ads", amount: 350, campaignName: "Gresham & East County FTHB Loans", assetType: "google_ad" },
      { source: "Social Media", amount: 150, campaignName: "Instagram Reel - First Time Buyer Credit Hacks", assetType: "social_media" },
      { source: "YouTube Video Ads", amount: 100, campaignName: "Vantage AI Video - Closing Costs Explained", assetType: "youtube_video" }
    ],
    geosphereAccessGranted: true,
    vantageAdsAccessGranted: false,
    topPartners12Mo: [
      {
        partnerId: "agent-elena-rostova",
        partnerName: "Elena Rostova",
        partnerCompanyOrBrokerage: "Urban Nest Properties",
        partnerRole: "agent",
        closedUnits12Mo: 11,
        closedVolume12Mo: 5250000,
        partnerNmlsOrLicense: "OR Lic #201509332",
        buysideSharePct: 85
      },
      {
        partnerId: "agent-tyler-brooks",
        partnerName: "Tyler Brooks",
        partnerCompanyOrBrokerage: "Pacific Crest Real Estate",
        partnerRole: "agent",
        closedUnits12Mo: 9,
        closedVolume12Mo: 4400000,
        partnerNmlsOrLicense: "OR Lic #202108194",
        buysideSharePct: 74
      },
      {
        partnerId: "agent-sarah-jenkins",
        partnerName: "Sarah Jenkins",
        partnerCompanyOrBrokerage: "Cascade Valley Real Estate",
        partnerRole: "agent",
        closedUnits12Mo: 7,
        closedVolume12Mo: 3650000,
        partnerNmlsOrLicense: "OR Lic #201208941",
        buysideSharePct: 70
      }
    ],
    isAdmin: false,
    password: "pass123",
    parentManagerId: "lo-mike-ford",
    customSlug: "alan-burkhart",
    adSettings: {
      targetCities: ["Portland", "Gresham", "Troutdale", "Sandy"],
      dailyBudgetUSD: 20,
      adSpendMonthlyCap: 600,
      creditCardConfigured: false
    }
  },
  {
    id: "lo-mark-saftich",
    name: "Mark Saftich",
    title: "Senior Loan Officer",
    nmlsId: "NMLS #115868",
    company: "Cornerstone First Mortgage",
    branch: "Willamette Valley Division - Eugene",
    branchId: "BRANCH-002-OR",
    branchManagerName: "David Ross",
    branchCity: "Eugene",
    branchState: "Oregon",
    email: "MSaftich@cfmtg.com",
    phone: "(503) 555-0177",
    headshotUrl: "",
    websiteUrl: "https://cfmtg.com/msaftich/",
    bio: "With over 28 years of experience in mortgage and real estate finance, Mark delivers structured lending solutions, Down Payment Assistance (DPA) programs, and expert advisory for first-time buyers and growing families in Lane County and the Willamette Valley.",
    specialties: [
      "28+ Years Lending Experience",
      "Down Payment Assistance (DPA)",
      "Conventional, FHA & Jumbo",
      "Mortgage Planning & Advisory"
    ],
    bookingUrl: "https://calendly.com",
    licenseStates: ["Oregon", "Washington", "California"],
    licenseVerificationYear: 2026,
    licenseLastVerifiedDate: "2026-01-18",
    production12MoVolume: 36200000,
    production12MoUnits: 71,
    production6MoVolume: 18100000,
    production6MoUnits: 36,
    production3MoVolume: 9200000,
    production3MoUnits: 18,
    production30DaysVolume: 3100000,
    production30DaysUnits: 6,
    adExpensesTotal: 1250,
    adExpensesBreakdown: [
      { source: "Facebook Ads", amount: 480, campaignName: "FB Feed - Lane County USDA 0% Down", assetType: "facebook_ad" },
      { source: "YouTube Video Ads", amount: 420, campaignName: "Vantage AI Video - Eugene First Time Buyer Grants", assetType: "youtube_video" },
      { source: "GeoSphere GIS Map", amount: 350, campaignName: "GeoSphere Map - Junction City & Coburg Eligible Homes", assetType: "geosphere_map" }
    ],
    geosphereAccessGranted: true,
    vantageAdsAccessGranted: true,
    twilioPhoneNumber: "+15035550188",
    twilioAccountSid: "AC7762b1e3f28d702c8b552e11c8a3002f",
    twilioEnabled: true,
    twilioByokConfigured: true,
    byokKeysStatus: { rentcast: true, videoAi: true, metaAds: true, twilio: true },
    topPartners12Mo: [
      {
        partnerId: "agent-marcus-vance",
        partnerName: "Marcus Vance",
        partnerCompanyOrBrokerage: "Willamette Heritage Realty",
        partnerRole: "agent",
        closedUnits12Mo: 14,
        closedVolume12Mo: 7150000,
        partnerNmlsOrLicense: "OR Lic #200804192",
        buysideSharePct: 76
      },
      {
        partnerName: "Carey Hughes",
        partnerCompanyOrBrokerage: "Keller Williams Sunset Corridor",
        partnerRole: "agent",
        closedUnits12Mo: 10,
        closedVolume12Mo: 5300000,
        partnerNmlsOrLicense: "OR Lic #201103829",
        buysideSharePct: 80
      },
      {
        partnerId: "agent-tyler-brooks",
        partnerName: "Tyler Brooks",
        partnerCompanyOrBrokerage: "Pacific Crest Real Estate",
        partnerRole: "agent",
        closedUnits12Mo: 8,
        closedVolume12Mo: 4100000,
        partnerNmlsOrLicense: "OR Lic #202108194",
        buysideSharePct: 68
      }
    ],
    isAdmin: false,
    password: "pass123",
    parentManagerId: "lo-mike-ford",
    customSlug: "mark-saftich",
    adSettings: {
      targetCities: ["Eugene", "Springfield", "Cottage Grove", "Veneta"],
      dailyBudgetUSD: 20,
      adSpendMonthlyCap: 600,
      creditCardConfigured: false
    }
  },
  {
    id: "lo-darryl-symonds",
    name: "Darryl Symonds",
    title: "Sales Manager",
    nmlsId: "NMLS #70035",
    company: "Cornerstone First Mortgage",
    branch: "Willamette Valley Division - Eugene",
    branchId: "BRANCH-002-OR",
    branchManagerName: "David Ross",
    branchCity: "Eugene",
    branchState: "Oregon",
    email: "dsymonds@cfmtg.com",
    phone: "(503) 555-0168",
    headshotUrl: "",
    websiteUrl: "https://cfmtg.com/dsymonds/",
    bio: "Mortgage and financial services veteran since 1989. Known for high-touch customer care, transparent lending roadmaps, and extensive homebuyer education to empower confident homeownership.",
    specialties: [
      "Sales & Lending Leadership",
      "First-Time Homebuyer Education",
      "VA & Military Lending",
      "Competitive Rate Structuring"
    ],
    bookingUrl: "https://calendly.com",
    licenseStates: ["Oregon", "Washington", "Hawaii"],
    licenseVerificationYear: 2026,
    licenseLastVerifiedDate: "2026-01-20",
    production12MoVolume: 26500000,
    production12MoUnits: 52,
    production6MoVolume: 13200000,
    production6MoUnits: 26,
    production3MoVolume: 6700000,
    production3MoUnits: 13,
    production30DaysVolume: 2100000,
    production30DaysUnits: 4,
    adExpensesTotal: 860,
    adExpensesBreakdown: [
      { source: "Facebook Ads", amount: 360, campaignName: "FB Carousel - VA Home Loan Myths Busted", assetType: "facebook_ad" },
      { source: "Google Ads", amount: 300, campaignName: "Google Search - Eugene Oregon VA Loans", assetType: "google_ad" },
      { source: "Social Media", amount: 200, campaignName: "LinkedIn Lead Magnet - Military Relocation Guide", assetType: "social_media" }
    ],
    geosphereAccessGranted: true,
    vantageAdsAccessGranted: false,
    twilioPhoneNumber: "+15415550144",
    twilioAccountSid: "AC4451c3d2e17c603b9a443d22b7a2003a",
    twilioEnabled: true,
    twilioByokConfigured: true,
    byokKeysStatus: { rentcast: true, videoAi: false, metaAds: true, twilio: true },
    topPartners12Mo: [
      {
        partnerId: "agent-elena-rostova",
        partnerName: "Elena Rostova",
        partnerCompanyOrBrokerage: "Urban Nest Properties",
        partnerRole: "agent",
        closedUnits12Mo: 12,
        closedVolume12Mo: 5850000,
        partnerNmlsOrLicense: "OR Lic #201509332",
        buysideSharePct: 88
      },
      {
        partnerId: "agent-sarah-jenkins",
        partnerName: "Sarah Jenkins",
        partnerCompanyOrBrokerage: "Cascade Valley Real Estate",
        partnerRole: "agent",
        closedUnits12Mo: 8,
        closedVolume12Mo: 4100000,
        partnerNmlsOrLicense: "OR Lic #201208941",
        buysideSharePct: 75
      },
      {
        partnerName: "Kevin O'Neill",
        partnerCompanyOrBrokerage: "Compass Lake Oswego",
        partnerRole: "agent",
        closedUnits12Mo: 6,
        closedVolume12Mo: 3200000,
        partnerNmlsOrLicense: "OR Lic #200904812",
        buysideSharePct: 70
      }
    ],
    isAdmin: false,
    password: "pass123",
    parentManagerId: "lo-mike-ford",
    customSlug: "darryl-symonds",
    adSettings: {
      targetCities: ["Eugene", "Springfield", "Albany", "Corvallis"],
      dailyBudgetUSD: 25,
      adSpendMonthlyCap: 750,
      creditCardConfigured: false
    }
  },
  {
    id: "lo-christopher-vargas",
    name: "Christopher Vargas",
    title: "Loan Officer",
    nmlsId: "NMLS #2592558",
    company: "Cornerstone First Mortgage",
    branch: "Central Oregon Hub - Bend",
    branchId: "BRANCH-003-OR",
    branchManagerName: "Sarah Mitchell",
    branchCity: "Bend",
    branchState: "Oregon",
    email: "cvargas@cfmtg.com",
    phone: "(503) 555-0149",
    headshotUrl: "",
    websiteUrl: "https://cfmtg.com/cvargas/",
    bio: "Dedicated Loan Officer specializing in modern digital pre-approvals, Central Oregon affordable housing grants, down payment assistance, and strategic first-time buyer financing in Deschutes County.",
    specialties: [
      "Digital Pre-Approval FastTrack",
      "First-Time Buyer DPA Programs",
      "FHA & 100% Financing Programs",
      "Credit Optimization Coaching"
    ],
    bookingUrl: "https://calendly.com",
    licenseStates: ["Oregon", "Washington"],
    licenseVerificationYear: 2026,
    licenseLastVerifiedDate: "2026-01-22",
    production12MoVolume: 24800000,
    production12MoUnits: 49,
    production6MoVolume: 12400000,
    production6MoUnits: 25,
    production3MoVolume: 6100000,
    production3MoUnits: 12,
    production30DaysVolume: 1950000,
    production30DaysUnits: 4,
    adExpensesTotal: 790,
    adExpensesBreakdown: [
      { source: "Facebook Ads", amount: 340, campaignName: "FB Ad - Bend First-Time Buyer Grants Under $500k", assetType: "facebook_ad" },
      { source: "Google Ads", amount: 250, campaignName: "Google Search - Redmond & Prineville Home Loans", assetType: "google_ad" },
      { source: "GeoSphere GIS Map", amount: 200, campaignName: "GeoSphere Map - Deschutes County USDA Boundaries", assetType: "geosphere_map" }
    ],
    geosphereAccessGranted: true,
    vantageAdsAccessGranted: true,
    twilioPhoneNumber: "+15415550166",
    twilioAccountSid: "AC5562d4e3f26b504c8a332c11a6b1004b",
    twilioEnabled: true,
    twilioByokConfigured: true,
    byokKeysStatus: { rentcast: true, videoAi: true, metaAds: false, twilio: true },
    topPartners12Mo: [
      {
        partnerId: "agent-elena-rostova",
        partnerName: "Elena Rostova",
        partnerCompanyOrBrokerage: "Urban Nest Properties",
        partnerRole: "agent",
        closedUnits12Mo: 10,
        closedVolume12Mo: 4900000,
        partnerNmlsOrLicense: "OR Lic #201509332",
        buysideSharePct: 82
      },
      {
        partnerId: "agent-marcus-vance",
        partnerName: "Marcus Vance",
        partnerCompanyOrBrokerage: "Willamette Heritage Realty",
        partnerRole: "agent",
        closedUnits12Mo: 8,
        closedVolume12Mo: 4050000,
        partnerNmlsOrLicense: "OR Lic #200804192",
        buysideSharePct: 74
      },
      {
        partnerName: "Marc Gallagher",
        partnerCompanyOrBrokerage: "RE/MAX Equity Group",
        partnerRole: "agent",
        closedUnits12Mo: 6,
        closedVolume12Mo: 3100000,
        partnerNmlsOrLicense: "OR Lic #201309112",
        buysideSharePct: 70
      }
    ],
    isAdmin: false,
    password: "pass123",
    parentManagerId: "lo-mike-ford",
    customSlug: "christopher-vargas",
    adSettings: {
      targetCities: ["Bend", "Redmond", "Sisters", "Prineville"],
      dailyBudgetUSD: 20,
      adSpendMonthlyCap: 600,
      creditCardConfigured: false
    }
  },
  {
    id: "lo-derek-richards",
    name: "Derek Richards",
    title: "Loan Officer",
    nmlsId: "NMLS #590516",
    company: "Cornerstone First Mortgage",
    branch: "Puget Sound Branch - Seattle",
    branchId: "BRANCH-004-WA",
    branchManagerName: "Rachel Adams",
    branchCity: "Seattle",
    branchState: "Washington",
    email: "drichards@cfmtg.com",
    phone: "(503) 555-0188",
    headshotUrl: "",
    websiteUrl: "https://cfmtg.com/drichards/",
    bio: "Experienced Loan Officer committed to delivering tailored loan options, competitive rates, and seamless communication from application to close across the Puget Sound region and Greater Seattle area.",
    specialties: [
      "Conventional & FHA Financing",
      "Washington WSHFC Down Payment Assistance",
      "Fast 14-Day Closings",
      "First-Time Homebuyer Advisory"
    ],
    bookingUrl: "https://calendly.com",
    licenseStates: ["Washington", "Oregon"],
    licenseVerificationYear: 2026,
    licenseLastVerifiedDate: "2026-01-24",
    production12MoVolume: 31000000,
    production12MoUnits: 61,
    production6MoVolume: 15500000,
    production6MoUnits: 30,
    production3MoVolume: 7900000,
    production3MoUnits: 15,
    production30DaysVolume: 2600000,
    production30DaysUnits: 5,
    adExpensesTotal: 1120,
    adExpensesBreakdown: [
      { source: "Facebook Ads", amount: 450, campaignName: "FB Feed - WSHFC Down Payment Assistance Seattle", assetType: "facebook_ad" },
      { source: "Google Ads", amount: 420, campaignName: "Google Search - First Time Homebuyer Tacoma Seattle", assetType: "google_ad" },
      { source: "YouTube Video Ads", amount: 250, campaignName: "Vantage AI Video - Seattle Condo & Townhome Financing", assetType: "youtube_video" }
    ],
    geosphereAccessGranted: true,
    vantageAdsAccessGranted: true,
    twilioPhoneNumber: "+12065550177",
    twilioAccountSid: "AC3321e5f4a15a405d7b221b00f5c0005c",
    twilioEnabled: true,
    twilioByokConfigured: true,
    byokKeysStatus: { rentcast: true, videoAi: true, metaAds: true, twilio: true },
    topPartners12Mo: [
      {
        partnerId: "agent-tyler-brooks",
        partnerName: "Tyler Brooks",
        partnerCompanyOrBrokerage: "Pacific Crest Real Estate",
        partnerRole: "agent",
        closedUnits12Mo: 12,
        closedVolume12Mo: 6350000,
        partnerNmlsOrLicense: "OR Lic #202108194",
        buysideSharePct: 78
      },
      {
        partnerId: "agent-sarah-jenkins",
        partnerName: "Sarah Jenkins",
        partnerCompanyOrBrokerage: "Cascade Valley Real Estate",
        partnerRole: "agent",
        closedUnits12Mo: 9,
        closedVolume12Mo: 4600000,
        partnerNmlsOrLicense: "OR Lic #201208941",
        buysideSharePct: 72
      },
      {
        partnerName: "Carey Hughes",
        partnerCompanyOrBrokerage: "Keller Williams Sunset Corridor",
        partnerRole: "agent",
        closedUnits12Mo: 7,
        closedVolume12Mo: 3750000,
        partnerNmlsOrLicense: "OR Lic #201103829",
        buysideSharePct: 75
      }
    ],
    isAdmin: false,
    password: "pass123",
    parentManagerId: "lo-mike-ford",
    customSlug: "derek-richards",
    adSettings: {
      targetCities: ["Salem", "Eugene", "Oregon City", "Wilsonville"],
      dailyBudgetUSD: 15,
      adSpendMonthlyCap: 450,
      creditCardConfigured: false
    }
  },
  {
    id: "lo-emanuel-etuks",
    name: "Emanuel Etuks",
    title: "Loan Consultant",
    nmlsId: "NMLS #2514299",
    company: "Cornerstone First Mortgage",
    branch: "Team Lonn Kilstrom Branch - Portland",
    branchId: "BRANCH-001-OR",
    branchManagerName: "Lonn Kilstrom",
    branchCity: "Portland",
    branchState: "Oregon",
    email: "eetuks@cfmtg.com",
    phone: "(503) 555-0192",
    headshotUrl: "",
    websiteUrl: "https://cfmtg.com/eetuks/",
    bio: "Experienced Loan Consultant licensed in Florida, Oregon, Texas, and Washington, empowering homebuyers with transparent mortgage roadmaps, low down payment options, and proactive communication.",
    specialties: [
      "Multi-State Licensing (OR, WA, FL, TX)",
      "First-Time Buyer Programs",
      "FHA, VA & Conventional Loans",
      "Bilingual / Inclusive Lending"
    ],
    bookingUrl: "https://calendly.com",
    licenseStates: ["Oregon", "Washington", "Florida", "Texas"],
    licenseVerificationYear: 2026,
    licenseLastVerifiedDate: "2026-01-25",
    production12MoVolume: 22500000,
    production12MoUnits: 44,
    production6MoVolume: 11200000,
    production6MoUnits: 22,
    production3MoVolume: 5600000,
    production3MoUnits: 11,
    production30DaysVolume: 1800000,
    production30DaysUnits: 4,
    adExpensesTotal: 650,
    adExpensesBreakdown: [
      { source: "Facebook Ads", amount: 350, campaignName: "FB Feed - Bilingual Homebuyer Roadmap (English & Spanish)", assetType: "facebook_ad" },
      { source: "Social Media", amount: 200, campaignName: "Instagram Reels - First Time Homeowner Financial Prep", assetType: "social_media" },
      { source: "Google Ads", amount: 100, campaignName: "Google Search - East Portland FTHB Loans", assetType: "google_ad" }
    ],
    geosphereAccessGranted: true,
    vantageAdsAccessGranted: false,
    twilioPhoneNumber: "+15035550192",
    twilioAccountSid: "AC8892f6a5b24c306e6a110a99e4d9006d",
    twilioEnabled: true,
    twilioByokConfigured: true,
    byokKeysStatus: { rentcast: true, videoAi: false, metaAds: true, twilio: true },
    topPartners12Mo: [
      {
        partnerId: "agent-tyler-brooks",
        partnerName: "Tyler Brooks",
        partnerCompanyOrBrokerage: "Pacific Crest Real Estate",
        partnerRole: "agent",
        closedUnits12Mo: 10,
        closedVolume12Mo: 5150000,
        partnerNmlsOrLicense: "OR Lic #202108194",
        buysideSharePct: 75
      },
      {
        partnerId: "agent-marcus-vance",
        partnerName: "Marcus Vance",
        partnerCompanyOrBrokerage: "Willamette Heritage Realty",
        partnerRole: "agent",
        closedUnits12Mo: 7,
        closedVolume12Mo: 3550000,
        partnerNmlsOrLicense: "OR Lic #200804192",
        buysideSharePct: 70
      },
      {
        partnerName: "Kate Bergsgaard",
        partnerCompanyOrBrokerage: "Windermere Realty Trust",
        partnerRole: "agent",
        closedUnits12Mo: 6,
        closedVolume12Mo: 3100000,
        partnerNmlsOrLicense: "OR Lic #201402941",
        buysideSharePct: 80
      }
    ],
    isAdmin: false,
    password: "pass123",
    parentManagerId: "lo-mike-ford",
    customSlug: "emanuel-etuks",
    adSettings: {
      targetCities: ["Portland", "Hillsboro", "Salem", "Orlando"],
      dailyBudgetUSD: 20,
      adSpendMonthlyCap: 600,
      creditCardConfigured: false
    }
  },
  {
    id: "lo-carlos-mendez",
    name: "Carlos Mendez",
    title: "Branch Manager & Senior Advisor",
    nmlsId: "NMLS #189204",
    company: "Cornerstone First Mortgage",
    branch: "Northern California Division - Sacramento",
    branchId: "BRANCH-005-CA",
    branchManagerName: "Carlos Mendez",
    branchCity: "Sacramento",
    branchState: "California",
    email: "cmendez@cfmtg.com",
    phone: "(916) 555-0198",
    headshotUrl: "",
    websiteUrl: "https://cfmtg.com/cmendez/",
    bio: "Heading the Northern California division at Cornerstone First Mortgage, Carlos guides first-time homebuyers through CalHFA down payment grants, jumbo-to-conforming transitions, and builder concessions.",
    specialties: [
      "CalHFA First-Time Buyer Grants",
      "FHA, Conventional & VA",
      "Builder Incentive Negotiation",
      "Branch Leadership & Strategy"
    ],
    bookingUrl: "https://calendly.com",
    licenseStates: ["California", "Oregon", "Nevada"],
    licenseVerificationYear: 2026,
    licenseLastVerifiedDate: "2026-01-26",
    production12MoVolume: 42800000,
    production12MoUnits: 76,
    production6MoVolume: 21500000,
    production6MoUnits: 38,
    production3MoVolume: 10800000,
    production3MoUnits: 19,
    production30DaysVolume: 3600000,
    production30DaysUnits: 6,
    adExpensesTotal: 1680,
    adExpensesBreakdown: [
      { source: "Facebook Ads", amount: 620, campaignName: "FB Video - CalHFA Dream For All Grant Guide", assetType: "facebook_ad" },
      { source: "Google Ads", amount: 580, campaignName: "Google Search - Sacramento First Time Buyer Loans", assetType: "google_ad" },
      { source: "YouTube Video Ads", amount: 480, campaignName: "Vantage AI Video - Roseville & Folsom Neighborhood Tour", assetType: "youtube_video" }
    ],
    geosphereAccessGranted: true,
    vantageAdsAccessGranted: true,
    twilioPhoneNumber: "+19165550199",
    twilioAccountSid: "AC8892f6a5b24c306e6a110a99e4d9006d",
    twilioEnabled: true,
    twilioByokConfigured: true,
    byokKeysStatus: { rentcast: true, videoAi: true, metaAds: true, twilio: true },
    topPartners12Mo: [
      {
        partnerId: "agent-sarah-jenkins",
        partnerName: "Sarah Jenkins",
        partnerCompanyOrBrokerage: "Cascade Valley Real Estate",
        partnerRole: "agent",
        closedUnits12Mo: 14,
        closedVolume12Mo: 7800000,
        partnerNmlsOrLicense: "CA DRE #01928471",
        buysideSharePct: 80
      },
      {
        partnerId: "agent-marcus-vance",
        partnerName: "Marcus Vance",
        partnerCompanyOrBrokerage: "Willamette Heritage Realty",
        partnerRole: "agent",
        closedUnits12Mo: 11,
        closedVolume12Mo: 6100000,
        partnerNmlsOrLicense: "CA DRE #01827419",
        buysideSharePct: 75
      }
    ],
    isAdmin: false,
    password: "pass123",
    parentManagerId: "lo-mike-ford",
    customSlug: "carlos-mendez",
    adSettings: {
      targetCities: ["Sacramento", "Roseville", "Folsom", "Elk Grove"],
      dailyBudgetUSD: 25,
      adSpendMonthlyCap: 750,
      creditCardConfigured: false
    }
  }
];

export const INITIAL_AGENT_ROSTER: RealEstateAgentProfile[] = [
  {
    id: "agent-jake-zach",
    name: "Jake Zach",
    title: "Principal Broker, REALTOR®",
    brokerage: "Hybrid Real Estate",
    licenseNumber: "OR Lic #201239842",
    email: "bigjakerealestate@gmail.com",
    phone: "(541) 216-0695",
    headshotUrl: "",
    agentType: "listing_agent",
    experienceYears: 9,
    production12MoVolume: 19800000,
    production12MoUnits: 34,
    buysideVolume12Mo: 8400000,
    buysideUnits12Mo: 14,
    listingVolume12Mo: 11400000,
    listingUnits12Mo: 20,
    buysideSharePct: 41,
    activeListingsCount: 6,
    rating: 4.93,
    bio: "Jake specializes in Lane County, Junction City, and Eugene properties with deep expertise in rural and suburban homes, USDA zero-down financing, and aggressive co-marketing partnerships.",
    specialties: [
      "Junction City & Lane County",
      "USDA Zero-Down Eligibility",
      "Listing Marketing",
      "First-Time Buyer Tours"
    ],
    marketAreas: ["Junction City", "Eugene", "Springfield", "Veneta", "Lane County"],
    mlsAffiliation: "RMLS",
    mlsAreas: ["Lane"],
    licensedCounties: ["Lane"],
    websiteUrl: "https://jakezach.bhhsrep.com",
    assignedLoIds: ["lo-mike-ford", "lo-lonn-kilstrom"],
    customSlug: "jake-zach",
    realTrendsVerified: true,
    realTrendsRank: "America's Best - Lane County Specialist",
    realTrendsSides: 34,
    realTrendsVolume: 19800000,
    realTrendsYear: 2025,
    realTrendsCategory: "Individual Agent - Volume",
    recruitmentStatus: "Partner Active"
  },
  {
    id: "agent-kanndice-mclean",
    name: "Kanndice McLean",
    title: "Senior Home Specialist, REALTOR®",
    brokerage: "Cascade Valley Real Estate",
    licenseNumber: "OR Lic #201248911",
    email: "kanndice.mclean@cascadevalleyre.com",
    phone: "(503) 555-0182",
    headshotUrl: "",
    agentType: "buyer_agent",
    experienceYears: 10,
    production12MoVolume: 22400000,
    production12MoUnits: 38,
    buysideVolume12Mo: 17200000,
    buysideUnits12Mo: 29,
    listingVolume12Mo: 5200000,
    listingUnits12Mo: 9,
    buysideSharePct: 76,
    activeListingsCount: 7,
    rating: 4.95,
    bio: "Kanndice is an expert in property inspection discovery, neighborhood nuances, home details, and crafting winning offer strategies that secure homes for first-time buyers in competitive markets.",
    specialties: [
      "Winning Offer Strategy",
      "Home & Inspection Nuances",
      "First-Time Homebuyers",
      "Portland Metro & Willamette Valley"
    ],
    marketAreas: ["Portland Metro", "Lake Oswego", "Beaverton", "Tigard", "West Linn"],
    mlsAffiliation: "RMLS",
    mlsAreas: ["Multnomah", "Washington", "Clackamas"],
    licensedCounties: ["Multnomah", "Washington", "Clackamas"],
    websiteUrl: "https://cascadevalleyre.com/kanndice-mclean",
    assignedLoIds: ["lo-mike-ford", "lo-lonn-kilstrom"],
    customSlug: "kanndice-mclean",
    realTrendsVerified: true,
    realTrendsRank: "America's Best - Oregon Top Buyer Specialists",
    realTrendsSides: 38,
    realTrendsVolume: 22400000,
    realTrendsYear: 2025,
    realTrendsCategory: "Individual Agent - Volume",
    topPartners12Mo: [
      {
        partnerId: "lo-mike-ford",
        partnerName: "Mike Ford",
        partnerCompanyOrBrokerage: "Cornerstone First Mortgage",
        partnerRole: "loan_officer",
        closedUnits12Mo: 18,
        closedVolume12Mo: 9200000,
        partnerNmlsOrLicense: "NMLS #288455",
        buysideSharePct: 100
      }
    ]
  },
  {
    id: "agent-sarah-jenkins",
    name: "Sarah Jenkins",
    title: "Senior Buyer Specialist, REALTOR®",
    brokerage: "Cascade Valley Real Estate",
    licenseNumber: "OR Lic #201208941",
    email: "sarah.jenkins@cascadevalleyre.com",
    phone: "(503) 555-0144",
    headshotUrl: "",
    agentType: "buyer_agent",
    experienceYears: 12,
    production12MoVolume: 24800000,
    production12MoUnits: 42,
    buysideVolume12Mo: 18600000,
    buysideUnits12Mo: 31,
    listingVolume12Mo: 6200000,
    listingUnits12Mo: 11,
    buysideSharePct: 74,
    activeListingsCount: 8,
    rating: 4.9,
    bio: "Sarah is passionate about guiding first-time buyers through neighborhood selection, realistic tour inspections, and aggressive offer structuring to capture maximum seller closing credits.",
    specialties: [
      "First-Time Homebuyers",
      "Inspection Defect Negotiation",
      "Starter Single-Family Homes",
      "Portland Metro & Suburbs"
    ],
    marketAreas: ["Portland Metro", "Beaverton", "Tigard", "Lake Oswego", "Hillsboro"],
    mlsAffiliation: "RMLS",
    mlsAreas: ["Multnomah", "Washington", "Clackamas"],
    licensedCounties: ["Multnomah", "Washington", "Clackamas"],
    websiteUrl: "https://cascadevalleyre.com",
    assignedLoIds: ["lo-mike-ford", "lo-lonn-kilstrom"],
    customSlug: "sarah-jenkins",
    realTrendsVerified: true,
    realTrendsRank: "America's Best #14 - Oregon Individuals by Volume",
    realTrendsSides: 42,
    realTrendsVolume: 24800000,
    realTrendsYear: 2025,
    realTrendsCategory: "Individual Agent - Volume",
    topPartners12Mo: [
      {
        partnerId: "lo-mike-ford",
        partnerName: "Mike Ford",
        partnerCompanyOrBrokerage: "Cornerstone First Mortgage",
        partnerRole: "loan_officer",
        closedUnits12Mo: 16,
        closedVolume12Mo: 8450000,
        partnerNmlsOrLicense: "NMLS #288455",
        buysideSharePct: 100
      },
      {
        partnerId: "lo-lonn-kilstrom",
        partnerName: "Lonn Kilstrom",
        partnerCompanyOrBrokerage: "Cornerstone First Mortgage",
        partnerRole: "loan_officer",
        closedUnits12Mo: 11,
        closedVolume12Mo: 5600000,
        partnerNmlsOrLicense: "NMLS #117954",
        buysideSharePct: 100
      },
      {
        partnerId: "lo-derek-richards",
        partnerName: "Derek Richards",
        partnerCompanyOrBrokerage: "Cornerstone First Mortgage",
        partnerRole: "loan_officer",
        closedUnits12Mo: 9,
        closedVolume12Mo: 4600000,
        partnerNmlsOrLicense: "NMLS #590516",
        buysideSharePct: 100
      }
    ],
    emailHistory: [
      {
        id: "aeh-sarah-1",
        timestamp: "2026-08-20T10:00:00Z",
        templateType: "Co-Branded Mortgage Portal Invite",
        subject: "Custom Co-Branded Mortgage Portal for Your Buyers",
        channel: "portal_email",
        recipientEmail: "sarah.jenkins@cascadevalleyre.com",
        recipientName: "Sarah Jenkins",
        status: "opened",
        notes: "Sarah reviewed co-branded flyer with live buydown widget."
      }
    ],
    outreachLogs: [
      {
        id: "a-ol-sarah-1",
        timestamp: "2026-08-20T10:00:00Z",
        channel: "email",
        templateName: "Co-Branded Mortgage Portal Invite",
        subject: "Custom Co-Branded Mortgage Portal for Your Buyers",
        recipientName: "Sarah Jenkins"
      }
    ]
  },
  {
    id: "agent-marcus-vance",
    name: "Marcus Vance",
    title: "Principal Broker & First-Time Buyer Lead",
    brokerage: "Willamette Heritage Realty",
    licenseNumber: "OR Lic #200804192",
    email: "marcus@willametteheritage.com",
    phone: "(503) 555-0177",
    headshotUrl: "",
    agentType: "buyer_agent",
    experienceYears: 16,
    production12MoVolume: 29500000,
    production12MoUnits: 58,
    buysideVolume12Mo: 21800000,
    buysideUnits12Mo: 43,
    listingVolume12Mo: 7700000,
    listingUnits12Mo: 15,
    buysideSharePct: 74,
    activeListingsCount: 14,
    rating: 5.0,
    bio: "Marcus has closed over 350+ transactions for first-time buyers in Clackamas, Oregon City, and Gresham, combining deep neighborhood knowledge with razor-sharp contract terms.",
    specialties: [
      "Competitive Offer Structuring",
      "Down Payment Assistance (DPA) Synergy",
      "Appraisal Gap Protections",
      "East County Neighborhoods"
    ],
    marketAreas: ["Oregon City", "Clackamas", "Gresham", "Happy Valley", "Milwaukie"],
    mlsAffiliation: "RMLS",
    mlsAreas: ["Clackamas", "Multnomah", "Marion"],
    licensedCounties: ["Clackamas", "Multnomah", "Marion"],
    websiteUrl: "https://willametteheritage.com",
    assignedLoIds: ["lo-mike-ford", "lo-alan-burkhart", "lo-mark-saftich"],
    customSlug: "marcus-vance",
    realTrendsVerified: true,
    realTrendsRank: "America's Best #22 - Oregon Individuals by Sides",
    realTrendsSides: 58,
    realTrendsVolume: 29500000,
    realTrendsYear: 2025,
    realTrendsCategory: "Individual Agent - Sides",
    topPartners12Mo: [
      {
        partnerId: "lo-mark-saftich",
        partnerName: "Mark Saftich",
        partnerCompanyOrBrokerage: "Cornerstone First Mortgage",
        partnerRole: "loan_officer",
        closedUnits12Mo: 14,
        closedVolume12Mo: 7150000,
        partnerNmlsOrLicense: "NMLS #115868",
        buysideSharePct: 100
      },
      {
        partnerId: "lo-mike-ford",
        partnerName: "Mike Ford",
        partnerCompanyOrBrokerage: "Cornerstone First Mortgage",
        partnerRole: "loan_officer",
        closedUnits12Mo: 12,
        closedVolume12Mo: 6200000,
        partnerNmlsOrLicense: "NMLS #288455",
        buysideSharePct: 100
      },
      {
        partnerId: "lo-christopher-vargas",
        partnerName: "Christopher Vargas",
        partnerCompanyOrBrokerage: "Cornerstone First Mortgage",
        partnerRole: "loan_officer",
        closedUnits12Mo: 8,
        closedVolume12Mo: 4050000,
        partnerNmlsOrLicense: "NMLS #2592558",
        buysideSharePct: 100
      }
    ],
    emailHistory: [
      {
        id: "aeh-marcus-1",
        timestamp: "2026-08-22T14:30:00Z",
        templateType: "Listing 2-1 Buydown Strategy",
        subject: "Strategy to Move Price-Conscious Buyers on Your Listings",
        channel: "gmail",
        recipientEmail: "marcus@willametteheritage.com",
        recipientName: "Marcus Vance",
        status: "opened",
        notes: "Shared 2-1 rate buydown seller flyer for Marcus's Clackamas listing."
      }
    ],
    outreachLogs: [
      {
        id: "a-ol-marcus-1",
        timestamp: "2026-08-22T14:30:00Z",
        channel: "email",
        templateName: "Listing 2-1 Buydown Strategy",
        subject: "Strategy to Move Price-Conscious Buyers on Your Listings",
        recipientName: "Marcus Vance"
      }
    ]
  },
  {
    id: "agent-elena-rostova",
    name: "Elena Rostova",
    title: "Associate Broker, REALTOR®",
    brokerage: "Urban Nest Properties",
    licenseNumber: "OR Lic #201509332",
    email: "elena@urbannestpdx.com",
    phone: "(503) 555-0122",
    headshotUrl: "",
    agentType: "dual_agent",
    experienceYears: 9,
    production12MoVolume: 16400000,
    production12MoUnits: 28,
    buysideVolume12Mo: 10500000,
    buysideUnits12Mo: 18,
    listingVolume12Mo: 5900000,
    listingUnits12Mo: 10,
    buysideSharePct: 64,
    activeListingsCount: 11,
    rating: 4.8,
    bio: "Elena specializes in vintage character homes, cosmetic fixers with instant sweat equity potential, and townhomes for young professionals and growing families.",
    specialties: [
      "Vintage Craftsmans & Bungalows",
      "ADU & Sweat Equity Potential",
      "Renovation Budget Planning",
      "Urban & Walkable Neighborhoods"
    ],
    marketAreas: ["East Portland", "Southeast Portland", "Milwaukie", "St. Johns"],
    mlsAffiliation: "RMLS",
    mlsAreas: ["Multnomah", "Clackamas"],
    licensedCounties: ["Multnomah", "Clackamas"],
    websiteUrl: "https://urbannestpdx.com",
    assignedLoIds: ["lo-darryl-symonds", "lo-mike-ford", "lo-christopher-vargas"],
    customSlug: "elena-rostova",
    topPartners12Mo: [
      {
        partnerId: "lo-darryl-symonds",
        partnerName: "Darryl Symonds",
        partnerCompanyOrBrokerage: "Cornerstone First Mortgage",
        partnerRole: "loan_officer",
        closedUnits12Mo: 12,
        closedVolume12Mo: 5850000,
        partnerNmlsOrLicense: "NMLS #70035",
        buysideSharePct: 100
      },
      {
        partnerId: "lo-alan-burkhart",
        partnerName: "Alan Burkhart",
        partnerCompanyOrBrokerage: "Cornerstone First Mortgage",
        partnerRole: "loan_officer",
        closedUnits12Mo: 11,
        closedVolume12Mo: 5250000,
        partnerNmlsOrLicense: "NMLS #312229",
        buysideSharePct: 100
      },
      {
        partnerId: "lo-mike-ford",
        partnerName: "Mike Ford",
        partnerCompanyOrBrokerage: "Cornerstone First Mortgage",
        partnerRole: "loan_officer",
        closedUnits12Mo: 10,
        closedVolume12Mo: 4850000,
        partnerNmlsOrLicense: "NMLS #288455",
        buysideSharePct: 100
      }
    ],
    emailHistory: [
      {
        id: "aeh-elena-1",
        timestamp: "2026-08-25T11:15:00Z",
        templateType: "First-Time Buyer Grant Opportunity",
        subject: "Exclusive $12,500 Down Payment Grant for Southeast PDX Buyers",
        channel: "gmail",
        recipientEmail: "elena@urbannestpdx.com",
        recipientName: "Elena Rostova",
        status: "opened",
        notes: "Shared Oregon down payment assistance matrix and co-branded flyer."
      }
    ],
    outreachLogs: [
      {
        id: "a-ol-elena-1",
        timestamp: "2026-08-25T11:15:00Z",
        channel: "email",
        templateName: "First-Time Buyer Grant Opportunity",
        subject: "Exclusive $12,500 Down Payment Grant for Southeast PDX Buyers",
        recipientName: "Elena Rostova"
      }
    ]
  },
  {
    id: "agent-tyler-brooks",
    name: "Tyler Brooks",
    title: "Modern Homes & Relocation Specialist, REALTOR®",
    brokerage: "Pacific Crest Real Estate",
    licenseNumber: "OR Lic #202108194",
    email: "tyler@pacificcrestre.com",
    phone: "(503) 555-0199",
    headshotUrl: "",
    agentType: "listing_agent",
    experienceYears: 5,
    activeListingsCount: 19,
    rating: 4.9,
    bio: "Tyler focuses on newly constructed townhomes, smart homes, and suburban relocations across Washington and Clackamas counties.",
    specialties: [
      "New Construction & Builder Warranties",
      "First-Time Relocations",
      "Energy Efficient Homes",
      "Beaverton & Hillsboro"
    ],
    marketAreas: ["Beaverton", "Hillsboro", "Bethany", "Sherwood"],
    mlsAffiliation: "RMLS",
    mlsAreas: ["Washington", "Yamhill"],
    licensedCounties: ["Washington", "Yamhill"],
    websiteUrl: "https://pacificcrestre.com",
    assignedLoIds: ["lo-derek-richards", "lo-emanuel-etuks"],
    customSlug: "tyler-brooks",
    production12MoVolume: 26500000,
    production12MoUnits: 46,
    buysideVolume12Mo: 17800000,
    buysideUnits12Mo: 30,
    listingVolume12Mo: 8700000,
    listingUnits12Mo: 16,
    buysideSharePct: 67,
    topPartners12Mo: [
      {
        partnerId: "lo-derek-richards",
        partnerName: "Derek Richards",
        partnerCompanyOrBrokerage: "Cornerstone First Mortgage",
        partnerRole: "loan_officer",
        closedUnits12Mo: 12,
        closedVolume12Mo: 6350000,
        partnerNmlsOrLicense: "NMLS #590516",
        buysideSharePct: 100
      },
      {
        partnerId: "lo-emanuel-etuks",
        partnerName: "Emanuel Etuks",
        partnerCompanyOrBrokerage: "Cornerstone First Mortgage",
        partnerRole: "loan_officer",
        closedUnits12Mo: 10,
        closedVolume12Mo: 5150000,
        partnerNmlsOrLicense: "NMLS #2514299",
        buysideSharePct: 100
      },
      {
        partnerId: "lo-lonn-kilstrom",
        partnerName: "Lonn Kilstrom",
        partnerCompanyOrBrokerage: "Cornerstone First Mortgage",
        partnerRole: "loan_officer",
        closedUnits12Mo: 9,
        closedVolume12Mo: 4650000,
        partnerNmlsOrLicense: "NMLS #117954",
        buysideSharePct: 100
      }
    ],
    emailHistory: [
      {
        id: "aeh-tyler-1",
        timestamp: "2026-08-28T09:40:00Z",
        templateType: "New Construction Extended Rate Lock",
        subject: "360-Day Builder Rate Lock Program for Washington County Buyers",
        channel: "outlook",
        recipientEmail: "tyler@pacificcrestre.com",
        recipientName: "Tyler Brooks",
        status: "delivered",
        notes: "Sent extended lock breakdown for Bethany townhome buyers."
      }
    ],
    outreachLogs: [
      {
        id: "a-ol-tyler-1",
        timestamp: "2026-08-28T09:40:00Z",
        channel: "email",
        templateName: "New Construction Extended Rate Lock",
        subject: "360-Day Builder Rate Lock Program for Washington County Buyers",
        recipientName: "Tyler Brooks"
      }
    ]
  },
  {
    id: "agent-jessica-miller",
    name: "Jessica Miller",
    title: "Willamette Valley Principal Broker, REALTOR®",
    brokerage: "Mid-Valley Heritage Properties",
    licenseNumber: "OR Lic #201809112",
    email: "jessica@midvalleyproperties.com",
    phone: "(503) 555-0288",
    headshotUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
    agentType: "listing_agent",
    experienceYears: 10,
    production12MoVolume: 19800000,
    production12MoUnits: 48,
    buysideVolume12Mo: 11400000,
    buysideUnits12Mo: 28,
    listingVolume12Mo: 8400000,
    listingUnits12Mo: 20,
    buysideSharePct: 58,
    activeListingsCount: 16,
    rating: 4.9,
    bio: "Jessica is a recognized Willamette Valley expert specializing in starter homes, USDA 100% zero-down properties, and rural homesteads throughout Marion, Polk, and Linn counties.",
    specialties: [
      "USDA 100% Zero Down Programs",
      "First-Time Rural Housing",
      "Salem & Keizer Starter Homes",
      "Marion & Polk County DPA"
    ],
    marketAreas: ["Salem", "Keizer", "Albany", "Corvallis", "Silverton", "Dallas"],
    mlsAffiliation: "WVMLS",
    mlsAreas: ["Marion", "Polk", "Linn", "Benton"],
    licensedCounties: ["Marion", "Polk", "Linn", "Benton", "Yamhill"],
    websiteUrl: "https://midvalleyproperties.com",
    assignedLoIds: ["lo-mike-ford", "lo-lonn-kilstrom"],
    customSlug: "jessica-miller",
    realTrendsVerified: true,
    realTrendsRank: "America's Best #31 - Willamette Valley Top Producers",
    realTrendsSides: 48,
    realTrendsVolume: 19800000,
    realTrendsYear: 2025,
    realTrendsCategory: "Individual Agent - Sides"
  },
  {
    id: "agent-colton-hayes",
    name: "Colton Hayes",
    title: "Central Oregon Mountain & High Desert Specialist, REALTOR®",
    brokerage: "High Desert Cascades Realty",
    licenseNumber: "OR Lic #201704289",
    email: "colton@highdesertcascades.com",
    phone: "(541) 555-0319",
    headshotUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    agentType: "dual_agent",
    experienceYears: 11,
    production12MoVolume: 31200000,
    production12MoUnits: 44,
    buysideVolume12Mo: 21500000,
    buysideUnits12Mo: 30,
    listingVolume12Mo: 9700000,
    listingUnits12Mo: 14,
    buysideSharePct: 69,
    activeListingsCount: 12,
    rating: 5.0,
    bio: "Colton leads first-time buyers through Central Oregon's competitive high desert market, finding hidden value in Bend, Redmond, Sisters, and Prineville with tailored loan incentives.",
    specialties: [
      "Central Oregon Starter Properties",
      "USDA Eligible Enclaves in Deschutes & Crook",
      "High Desert Energy Efficient Homes",
      "Bend & Redmond Relocations"
    ],
    marketAreas: ["Bend", "Redmond", "Sisters", "Sunriver", "Prineville", "Madras"],
    mlsAffiliation: "CESMLS",
    mlsAreas: ["Deschutes", "Crook", "Jefferson", "Klamath"],
    licensedCounties: ["Deschutes", "Crook", "Jefferson", "Klamath", "Lake"],
    websiteUrl: "https://highdesertcascades.com",
    assignedLoIds: ["lo-mike-ford", "lo-lonn-kilstrom"],
    customSlug: "colton-hayes",
    realTrendsVerified: true,
    realTrendsRank: "America's Best #19 - Central Oregon Production",
    realTrendsSides: 44,
    realTrendsVolume: 31200000,
    realTrendsYear: 2025,
    realTrendsCategory: "Individual Agent - Volume"
  },
  {
    id: "agent-kendra-martinez",
    name: "Kendra Martinez",
    title: "Southern Oregon & Coastal Homes Lead, REALTOR®",
    brokerage: "Pacific Crest Southern Realty",
    licenseNumber: "OR Lic #201905881",
    email: "kendra@pacificcrestcoastal.com",
    phone: "(541) 555-0455",
    headshotUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    agentType: "buyer_agent",
    experienceYears: 8,
    production12MoVolume: 17400000,
    production12MoUnits: 46,
    buysideVolume12Mo: 12800000,
    buysideUnits12Mo: 34,
    listingVolume12Mo: 4600000,
    listingUnits12Mo: 12,
    buysideSharePct: 74,
    activeListingsCount: 9,
    rating: 4.9,
    bio: "Kendra specializes in Southern Oregon and coastal communities, pairing buyers with 0% down USDA Rural Development loans and local county grant programs in Jackson, Douglas, and Coos counties.",
    specialties: [
      "USDA 100% Rural Development Financing",
      "Coastal First-Time Properties",
      "Medford & Grants Pass Starter Homes",
      "Coos County Affordable Housing"
    ],
    marketAreas: ["Medford", "Ashland", "Grants Pass", "Coos Bay", "Roseburg", "Bandon"],
    mlsAffiliation: "SOMLS",
    mlsAreas: ["Jackson", "Josephine", "Douglas", "Coos"],
    licensedCounties: ["Jackson", "Josephine", "Douglas", "Coos", "Curry"],
    websiteUrl: "https://pacificcrestcoastal.com",
    assignedLoIds: ["lo-mike-ford", "lo-darryl-symonds"],
    customSlug: "kendra-martinez",
    realTrendsVerified: true,
    realTrendsRank: "America's Best #27 - Southern Oregon Transactions",
    realTrendsSides: 46,
    realTrendsVolume: 17400000,
    realTrendsYear: 2025,
    realTrendsCategory: "Individual Agent - Sides"
  }
];

export const INITIAL_PAIRINGS: import("../types").LOPairing[] = [
  {
    id: "pair-mike-jake",
    loId: "lo-mike-ford",
    agentId: "agent-jake-zach",
    title: "Mike Ford + Jake Zach (Junction City & Lane County Co-Branded Team)",
    customSlug: "mike-and-jake",
    campaignTag: "lane-county-first-time-buyers",
    notes: "Flagship co-branded pairing for Junction City & Lane County USDA Zero-Down financing and active listing tours.",
    createdAt: "2026-08-01",
    active: true,
    totalViews: 486,
    totalLeads: 42
  },
  {
    id: "pair-mike-kanndice",
    loId: "lo-mike-ford",
    agentId: "agent-kanndice-mclean",
    title: "Mike Ford + Kanndice McLean (Winning Offer & Financing Strategy)",
    customSlug: "mike-and-kanndice",
    campaignTag: "winning-offer-financing-team",
    notes: "Local Guides pairing Mike Ford (Financing & Pre-Qual) with Kanndice McLean (Home Details & Winning Offer Strategy).",
    createdAt: "2026-08-01",
    active: true,
    totalViews: 412,
    totalLeads: 36
  },
  {
    id: "pair-1",
    loId: "lo-mike-ford",
    agentId: "agent-sarah-jenkins",
    title: "Mike Ford + Sarah Jenkins (Portland Metro Homebuyer Team)",
    customSlug: "mike-and-sarah",
    campaignTag: "pdx-first-time-buyers",
    notes: "Flagship partnership for Portland & Westside first-time buyers.",
    createdAt: "2026-08-01",
    active: true,
    totalViews: 342,
    totalLeads: 28
  },
  {
    id: "pair-2",
    loId: "lo-lonn-kilstrom",
    agentId: "agent-marcus-vance",
    title: "Lonn Kilstrom + Marcus Vance (Team Lonn Kilstrom Branch)",
    customSlug: "lonn-and-marcus",
    campaignTag: "branch-premier-buyers",
    notes: "Targeting Oregon and Westside first-time buyers seeking down payment assistance and veteran advisory.",
    createdAt: "2026-08-05",
    active: true,
    totalViews: 286,
    totalLeads: 24
  },
  {
    id: "pair-lonn-sarah",
    loId: "lo-lonn-kilstrom",
    agentId: "agent-sarah-jenkins",
    title: "Lonn Kilstrom + Sarah Jenkins (Portland Metro Co-Branded)",
    customSlug: "lonn-and-sarah",
    campaignTag: "pdx-metro-cobranded",
    notes: "Co-branded for Portland Metro first-time buyers and down payment assistance.",
    createdAt: "2026-08-06",
    active: true,
    totalViews: 198,
    totalLeads: 18
  },
  {
    id: "pair-lonn-elena",
    loId: "lo-lonn-kilstrom",
    agentId: "agent-elena-rostova",
    title: "Lonn Kilstrom + Elena Rostova (Silicon Forest Co-Branded)",
    customSlug: "lonn-and-elena",
    campaignTag: "silicon-forest-cobranded",
    notes: "Co-branded for Beaverton & Hillsboro tech buyers and starter homes.",
    createdAt: "2026-08-07",
    active: true,
    totalViews: 172,
    totalLeads: 15
  },
  {
    id: "pair-lonn-tyler",
    loId: "lo-lonn-kilstrom",
    agentId: "agent-tyler-brooks",
    title: "Lonn Kilstrom + Tyler Brooks (Willamette Valley Co-Branded)",
    customSlug: "lonn-and-tyler",
    campaignTag: "willamette-valley-cobranded",
    notes: "Co-branded for Salem, Eugene & Willamette Valley homebuyers.",
    createdAt: "2026-08-08",
    active: true,
    totalViews: 154,
    totalLeads: 12
  },
  {
    id: "pair-3",
    loId: "lo-alan-burkhart",
    agentId: "agent-marcus-vance",
    title: "Alan Burkhart + Marcus Vance (East County Homeownership)",
    customSlug: "alan-and-marcus",
    campaignTag: "east-county-dpa",
    notes: "Targeting Clackamas & Gresham first-time buyers seeking Down Payment Assistance (DPA).",
    createdAt: "2026-08-08",
    active: true,
    totalViews: 218,
    totalLeads: 19
  },
  {
    id: "pair-4",
    loId: "lo-mark-saftich",
    agentId: "agent-elena-rostova",
    title: "Mark Saftich + Elena Rostova (Silicon Forest & Character Homes)",
    customSlug: "mark-and-elena",
    campaignTag: "westside-tech-buyers",
    notes: "Co-marketed for Beaverton/Hillsboro buyers and vintage starter homes.",
    createdAt: "2026-08-10",
    active: true,
    totalViews: 194,
    totalLeads: 16
  },
  {
    id: "pair-5",
    loId: "lo-darryl-symonds",
    agentId: "agent-tyler-brooks",
    title: "Darryl Symonds + Tyler Brooks (Willamette Valley DPA Initiative)",
    customSlug: "darryl-and-tyler",
    campaignTag: "valley-dpa-assistance",
    notes: "Focusing on 0% down USDA and OHCS state DPA in South Metro & Valley.",
    createdAt: "2026-08-12",
    active: true,
    totalViews: 162,
    totalLeads: 14
  },
  {
    id: "pair-6",
    loId: "lo-christopher-vargas",
    agentId: "agent-sarah-jenkins",
    title: "Christopher Vargas + Sarah Jenkins (Digital Pre-Approval Hub)",
    customSlug: "christopher-and-sarah",
    campaignTag: "fasttrack-preapproval",
    notes: "Fast digital intake and down payment assistance matching.",
    createdAt: "2026-08-14",
    active: true,
    totalViews: 145,
    totalLeads: 11
  },
  {
    id: "pair-7",
    loId: "lo-derek-richards",
    agentId: "agent-tyler-brooks",
    title: "Derek Richards + Tyler Brooks (New Construction Buyers)",
    customSlug: "derek-and-tyler",
    campaignTag: "new-home-dpa",
    notes: "Specialized for townhomes and builder incentive programs.",
    createdAt: "2026-08-16",
    active: true,
    totalViews: 128,
    totalLeads: 9
  },
  {
    id: "pair-8",
    loId: "lo-emanuel-etuks",
    agentId: "agent-elena-rostova",
    title: "Emanuel Etuks + Elena Rostova (Inclusive First-Time Homebuyers)",
    customSlug: "emanuel-and-elena",
    campaignTag: "multilingual-home-dpa",
    notes: "Dedicated first-generation and multi-state homebuyer advisory.",
    createdAt: "2026-08-18",
    active: true,
    totalViews: 139,
    totalLeads: 10
  }
];

export const INITIAL_SOCIAL_CAMPAIGNS: import("../types").SocialPushCampaign[] = [
  {
    id: "soc-1",
    platform: "facebook",
    senderMode: "dual",
    loId: "lo-mike-ford",
    agentId: "agent-sarah-jenkins",
    title: "Oregon First-Time Buyer DPA & Payment Reality Check",
    topic: "Affordability & DPA",
    hook: "Thinking about buying your first home in 2026? Most buyers have NO IDEA they may qualify for up to $30,000 in state down payment assistance!",
    bodyCopy: "Stop guessing your monthly mortgage payment. We built a free, transparent interactive homebuyer portal where you can calculate exact PITI + taxes, browse verified Oregon Down Payment Assistance (DPA), and track homes with a structural tour scorecard.\n\n👉 Test your numbers right now on our live interactive dashboard:",
    hashtags: ["#FirstTimeHomeBuyer", "#OregonRealEstate", "#PortlandHomes", "#MortgageAdvisor", "#DownPaymentAssistance", "#BuyAHome2026"],
    shareUrl: "",
    status: "pushed",
    createdAt: "2026-08-18"
  },
  {
    id: "soc-2",
    platform: "instagram",
    senderMode: "agent",
    loId: "lo-mike-ford",
    agentId: "agent-sarah-jenkins",
    title: "Realtor Tour Scorecard & Seller Concession Secret",
    topic: "Home Touring & Inspection",
    hook: "Before you fall in love with staging furniture... here are 3 things we inspect during every single home tour:",
    bodyCopy: "1️⃣ Age of the water heater & HVAC (avoids $10k surprises)\n2️⃣ Electrical panel & water pressure\n3️⃣ Potential for 2-3% seller repair credits to lower your mortgage rate!\n\nLink in bio to calculate your buying power with our free interactive First-Time Homebuyer Roadmap! 🏡✨",
    hashtags: ["#PortlandRealtor", "#HomeTour", "#HouseHunting", "#RealEstateTips", "#FirstHome", "#PITI"],
    shareUrl: "",
    status: "draft",
    createdAt: "2026-08-20"
  },
  {
    id: "soc-3",
    platform: "tiktok",
    senderMode: "lo",
    loId: "lo-mike-ford",
    agentId: "agent-sarah-jenkins",
    title: "Loan Officer Myth Buster: The 20% Down Lie",
    topic: "Mortgage Myth Busting",
    hook: "POV: You thought you needed 20% down to buy a house in Oregon... 🤯",
    bodyCopy: "Here is the truth: Over 73% of our first-time homebuyer clients buy with 3% to 3.5% down—and many use Down Payment Assistance (DPA) to cover down payment and closing costs! Tap the link to test your true monthly budget with our interactive calculator.",
    hashtags: ["#MortgageTok", "#HomebuyerHack", "#RealEstateTok", "#FinanceTips", "#MortgageBroker", "#Oregon"],
    shareUrl: "",
    status: "draft",
    createdAt: "2026-08-22"
  }
];

export const INITIAL_AD_DRAFTS: import("../types").AdCampaignDraft[] = [
  {
    id: "ad-vantage-sync-101",
    platform: "meta",
    loId: "lo-mike-ford",
    agentId: "agent-jake-zach",
    campaignName: "[Vantage AI Curated] 94265 Highway 99N - Turnkey 0% Down USDA Showcase",
    headline: "Stop Renting in Lane County: 0% Down USDA Eligible Home",
    secondaryHeadlines: ["Pre-Qualify in 60 Sec with Mike Ford", "Co-Listed with Jake Zach | Real Broker"],
    primaryText: "Why pay your landlord's mortgage? Discover this turnkey 3-bedroom craftsman in Junction City. 100% USDA Zero-Down financing available with special local grant options paired with Mike Ford (NMLS #184209) & Jake Zach.",
    descriptionText: "Zero Out-of-Pocket Options Available • Free Rate Buydown Calculator Inside",
    targetUrl: "/pair-mike-jake?prop=94265-highway-99n",
    dailyBudget: 35,
    targetLocations: ["Junction City, OR", "Eugene Metro", "Lane County (30 mi)"],
    keywords: ["0 down home loan oregon", "usda approved junction city", "first time buyer lane county"],
    specialHousingCategory: true,
    adObjective: "LEAD_GENERATION",
    status: "ready_to_launch",
    lastSaved: "2026-09-14",
    propertyId: "prop-jc-94265",
    propertyAddress: "94265 Highway 99N",
    propertyCity: "Junction City, OR",
    propertyPrice: 425000,
    isVantageCurated: true,
    isNewAwaitingPublication: true,
    publishedChannels: []
  },
  {
    id: "ad-vantage-sync-102",
    platform: "meta",
    loId: "lo-mike-ford",
    agentId: "agent-jake-zach",
    campaignName: "[Vantage AI Video] 1240 Willamette Heights - Sunset Video Walkthrough",
    headline: "Tour Willamette Heights: Exclusive 2-1 Buydown Available",
    secondaryHeadlines: ["Save $412/mo Year One", "Mike Ford & Jake Zach Co-Branded Video"],
    primaryText: "Watch the full walkthrough video! Lock in a 2-1 temporary rate buydown funded by seller concessions, saving you over $400 every month on your first year of payments.",
    descriptionText: "Watch HD Video Tour • Calculate Exact Concession Savings",
    targetUrl: "/pair-mike-jake?prop=1240-willamette",
    dailyBudget: 40,
    targetLocations: ["Eugene, OR", "Springfield, OR", "Coburg"],
    keywords: ["eugene video tour", "2-1 buydown oregon", "mortgage pre approval eugene"],
    specialHousingCategory: true,
    adObjective: "LEAD_GENERATION",
    status: "draft",
    lastSaved: "2026-09-14",
    propertyId: "prop-eug-1240",
    propertyAddress: "1240 Willamette Heights Dr",
    propertyCity: "Eugene, OR",
    propertyPrice: 489000,
    isVantageCurated: true,
    isNewAwaitingPublication: true,
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-modern-suburban-houses-4217-large.mp4",
    assets: ["https://assets.mixkit.co/videos/preview/mixkit-modern-suburban-houses-4217-large.mp4"],
    publishedChannels: []
  },
  {
    id: "ad-meta-1",
    platform: "meta",
    loId: "lo-mike-ford",
    agentId: "agent-sarah-jenkins",
    campaignName: "Meta Feed - 2026 Oregon First-Time Homebuyer Portal & DPA",
    headline: "Calculate Your True Monthly Payment & DPA in 60 Sec",
    secondaryHeadlines: ["Get Free Pre-Approval Roadmap", "Oregon Down Payment Assistance (DPA) Available"],
    primaryText: "Don't guess what your mortgage payment will be. Use our free, transparent First-Time Homebuyer Interactive Portal to model exact monthly payments, test self-restricted budget goals, and check eligibility for up to $30,000 in Oregon Down Payment Assistance (DPA).",
    descriptionText: "Free Interactive Tool • No Credit Card Required • Powered by Mike Ford (NMLS #184209) & Sarah Jenkins (REALTOR®)",
    targetUrl: "/fthb-calculator",
    dailyBudget: 25,
    targetLocations: ["Portland Metro (25 mi)", "Beaverton", "Gresham", "Hillsboro"],
    keywords: ["first time home buyer", "mortgage calculator", "oregon down payment assistance", "buy a house in portland"],
    specialHousingCategory: true,
    adObjective: "LEAD_GENERATION",
    status: "published",
    lastSaved: "2026-08-22",
    publishedChannels: ["facebook", "social_media"],
    publishedAt: "2026-09-10T10:00:00.000Z",
    isNewAwaitingPublication: false
  },
  {
    id: "ad-google-1",
    platform: "google",
    loId: "lo-mike-ford",
    agentId: "agent-sarah-jenkins",
    campaignName: "Google Search - First Time Home Buyer Oregon Calculator & Pre-Approval",
    headline: "Oregon First Time Homebuyer Hub | Free Payment Calculator",
    secondaryHeadlines: [
      "Check 2026 DPA Eligibility",
      "Instant Affordability Breakdown",
      "Mike Ford NMLS #184209",
      "Toured Home Inspection Scorecards"
    ],
    primaryText: "Interactive First-Time Homebuyer Portal. Calculate accurate monthly PITI payments, review 10-step closing roadmap, and book a personalized strategy session.",
    descriptionText: "Explore Oregon Down Payment Assistance (DPA) & Seller Concession Strategies. Zero Obligation. Start Your Plan Today.",
    targetUrl: "/fthb-calculator",
    dailyBudget: 30,
    targetLocations: ["Portland, OR", "Washington County, OR", "Clackamas County, OR", "Multnomah County, OR"],
    keywords: [
      "first time home buyer oregon",
      "oregon down payment assistance dpa",
      "mortgage calculator portland or",
      "first time buyer pre approval portland",
      "how much house can i afford oregon"
    ],
    specialHousingCategory: true,
    adObjective: "LEAD_GENERATION",
    status: "published",
    lastSaved: "2026-08-23",
    publishedChannels: ["google"],
    publishedAt: "2026-09-08T15:30:00.000Z",
    isNewAwaitingPublication: false
  }
];

export const INITIAL_LEADS: import("../types").CapturedLead[] = [
  {
    id: "lead-101",
    fullName: "Tyler & Emily Richardson",
    email: "tyler.richardson89@gmail.com",
    phone: "(503) 555-0182",
    preferredContactTime: "Weekday Evenings (After 5 PM)",
    timeline: "Ready in 30-60 Days",
    targetPriceRange: "$420,000 - $460,000",
    targetMonthlyBudget: "Keep total monthly payment under $3,100/mo",
    downPaymentSavings: "$45,000 (Approx 10% down)",
    grantInterest: true,
    creditScoreTier: "740+ Excellent",
    preferredLocations: "Portland (SE / Sellwood) or Beaverton",
    propertyType: "Single Family Craftsman or Modern Townhome",
    sendSampleHomes: true,
    sendSampleHomesOption: "Flex DPA 3.5% Grants & Rate Buydowns",
    assignedLoId: "lo-mike-ford",
    assignedAgentId: "agent-sarah-jenkins",
    pairingId: "pair-mike-sarah",
    leadSource: "Listing: 1420 SE Walnut St (Albany)",
    sourceCampaignId: "ad-meta-1",
    sourceCampaignName: "Meta Feed - 2026 Oregon First-Time Homebuyer Portal & DPA",
    sourcePropertyId: "geo-1",
    sourcePropertyAddress: "1420 SE Walnut St, Albany, OR",
    interactedSourceType: "property_listing",
    taggedCityArea: "Portland & Beaverton",
    leadPathTag: "Property Listing Inquiry (Albany)",
    intentScore: "hot",
    status: "new",
    notes: "Requested a list of recent homes for sale in Portland/Beaverton. Interested in 2/1 rate buydown & Flex DPA.",
    chatTranscript: [
      { sender: "advisor", text: "Welcome to the Mike Ford & Sarah Jenkins Co-Branded Homebuyer Portal! How soon are you looking to buy in Portland/Beaverton?", time: "10:14 AM" },
      { sender: "user", text: "We are renting until October and want to buy in 30-60 days.", time: "10:15 AM" },
      { sender: "advisor", text: "Great timeline! What target price range or monthly payment feel comfortable for you?", time: "10:15 AM" },
      { sender: "user", text: "Around $420k-$460k, keeping monthly under $3,100. Would love a list of low/no down homes in SE Portland or Beaverton!", time: "10:16 AM" }
    ],
    createdAt: "2026-08-24T06:45:00Z",
    smsConsentAuthorized: true,
    smsConsentTimestamp: "2026-08-24T06:45:12Z",
    smsConsentSource: "AI Intake Chatbot (Oregon DPA Portal)",
    smsConsentIp: "198.51.100.42 (TLS 1.3 Verified)",
    nurtureSequenceEnabled: true,
    nurtureCurrentStep: 2,
    nurtureTotalSteps: 4,
    nurtureStageText: "2 of 4 weekly nurture sent",
    lastEmailSentAt: "2026-08-27T16:15:00Z",
    lastEmailTemplateName: "Flex DPA 3.5% & Rate Buydown Strategy Sheet",
    nurtureSequenceLogs: [
      {
        id: "log-101-1",
        stageName: "1 of 4 weekly nurture sent",
        templateName: "Welcome & OHCS Down Payment Grant Guide",
        emailSubject: "Welcome Tyler & Emily - Your First-Time Homebuyer Roadmap!",
        sentAt: "2026-08-24T07:00:00Z",
        status: "opened"
      },
      {
        id: "log-101-2",
        stageName: "2 of 4 weekly nurture sent",
        templateName: "Flex DPA 3.5% & Rate Buydown Strategy Sheet",
        emailSubject: "Tyler & Emily: How 2-1 Rate Buydowns Save $340/mo",
        sentAt: "2026-08-27T16:15:00Z",
        status: "sent"
      }
    ],
    emailHistory: [
      {
        id: "eh-101-1",
        timestamp: "2026-08-24T07:00:00Z",
        templateType: "Welcome & OHCS Down Payment Grant Guide",
        subject: "Welcome Tyler & Emily - Your First-Time Homebuyer Roadmap!",
        channel: "portal_email",
        recipientEmail: "tyler.richardson89@gmail.com",
        recipientName: "Tyler & Emily Richardson",
        sentBy: "Mike Ford",
        status: "opened",
        notes: "Client opened email and reviewed $15k DPA grant rules."
      },
      {
        id: "eh-101-2",
        timestamp: "2026-08-27T16:15:00Z",
        templateType: "Flex DPA 3.5% & Rate Buydown Strategy Sheet",
        subject: "Tyler & Emily: How 2-1 Rate Buydowns Save $340/mo",
        channel: "portal_email",
        recipientEmail: "tyler.richardson89@gmail.com",
        recipientName: "Tyler & Emily Richardson",
        sentBy: "Mike Ford",
        status: "sent",
        notes: "Dispatched from portal with attached 2-1 buydown payment breakdown."
      },
      {
        id: "eh-101-3",
        timestamp: "2026-08-29T11:20:00Z",
        templateType: "Google Workspace Pre-Approval & Meet Consultation",
        subject: "Mortgage Strategy Consultation - Tyler & Emily Richardson",
        channel: "gmail",
        recipientEmail: "tyler.richardson89@gmail.com",
        recipientName: "Tyler & Emily Richardson",
        sentBy: "Mike Ford",
        status: "delivered",
        notes: "Direct Gmail dispatch via Google Workspace with Calendar invitation."
      }
    ],
    outreachLogs: [
      {
        id: "ol-101-1",
        timestamp: "2026-08-24T07:00:00Z",
        channel: "email",
        templateName: "Welcome & OHCS Down Payment Grant Guide",
        subject: "Welcome Tyler & Emily - Your First-Time Homebuyer Roadmap!",
        recipientName: "Tyler & Emily Richardson"
      },
      {
        id: "ol-101-2",
        timestamp: "2026-08-27T16:15:00Z",
        channel: "email",
        templateName: "Flex DPA 3.5% & Rate Buydown Strategy Sheet",
        subject: "Tyler & Emily: How 2-1 Rate Buydowns Save $340/mo",
        recipientName: "Tyler & Emily Richardson"
      },
      {
        id: "ol-101-3",
        timestamp: "2026-08-29T11:20:00Z",
        channel: "email",
        templateName: "Google Workspace Consultation Email",
        subject: "Mortgage Strategy Consultation - Tyler & Emily Richardson",
        recipientName: "Tyler & Emily Richardson"
      }
    ]
  },
  {
    id: "lead-104",
    fullName: "Brandon & Chloe Vance",
    email: "bvance.oregon@gmail.com",
    phone: "(541) 555-0219",
    preferredContactTime: "Afternoons (1-4 PM)",
    timeline: "Ready in 30-60 Days",
    targetPriceRange: "$380,000 - $425,000",
    targetMonthlyBudget: "$2,400 - $2,700/mo",
    downPaymentSavings: "$4,500 (Wants $0 Down USDA)",
    grantInterest: true,
    creditScoreTier: "710 Good",
    preferredLocations: "Albany & Corvallis",
    propertyType: "Single Family 3bd/2ba Craftsman",
    sendSampleHomes: true,
    sendSampleHomesOption: "🌾 100% USDA Zero Down Rural Development",
    assignedLoId: "lo-mike-ford",
    assignedAgentId: "agent-sarah-jenkins",
    pairingId: "pair-mike-sarah",
    leadSource: "Campaign: Meta Feed - USDA 100% Zero-Down Oregon Push",
    sourceCampaignId: "soc-1",
    sourceCampaignName: "Oregon First-Time Buyer DPA & Payment Reality Check",
    sourcePropertyId: "geo-2",
    sourcePropertyAddress: "2840 NW Camellia Dr, Corvallis, OR",
    interactedSourceType: "campaign",
    taggedCityArea: "Albany & Corvallis",
    leadPathTag: "USDA 100% Zero-Down Campaign",
    intentScore: "hot",
    status: "new",
    notes: "Currently renting in Corvallis for $2,350/mo. Requested recent 100% USDA Zero Down listings in Albany/Linn County.",
    chatTranscript: [
      { sender: "advisor", text: "Hi Brandon! Did you know Albany and surrounding Linn County qualify for 100% USDA Zero Down Financing?", time: "02:10 PM" },
      { sender: "user", text: "Really? We have $4,500 saved and pay $2,350 in rent. Can you send us a list of USDA $0 down homes near Albany?", time: "02:11 PM" },
      { sender: "advisor", text: "Absolutely! Mike Ford (LO) & Sarah Jenkins (Agent) will email you the active zero-down list right away.", time: "02:12 PM" }
    ],
    createdAt: "2026-08-25T14:20:00Z",
    smsConsentAuthorized: true,
    smsConsentTimestamp: "2026-08-25T14:20:08Z",
    smsConsentSource: "AI Intake Chatbot (USDA 100% Zero-Down)",
    smsConsentIp: "198.51.100.89 (TLS 1.3 Verified)",
    nurtureSequenceEnabled: true,
    nurtureCurrentStep: 1,
    nurtureTotalSteps: 4,
    nurtureStageText: "1 of 4 weekly nurture sent",
    lastEmailSentAt: "2026-08-25T14:30:00Z",
    lastEmailTemplateName: "USDA 100% Zero-Down Rural Eligibility Guide",
    nurtureSequenceLogs: [
      {
        id: "log-104-1",
        stageName: "1 of 4 weekly nurture sent",
        templateName: "USDA 100% Zero-Down Rural Eligibility Guide",
        emailSubject: "Brandon & Chloe: 100% Zero Down USDA Homes in Albany & Linn County",
        sentAt: "2026-08-25T14:30:00Z",
        status: "opened"
      }
    ],
    emailHistory: [
      {
        id: "eh-104-1",
        timestamp: "2026-08-25T14:30:00Z",
        templateType: "USDA 100% Zero-Down Rural Eligibility Guide",
        subject: "Brandon & Chloe: 100% Zero Down USDA Homes in Albany & Linn County",
        channel: "portal_email",
        recipientEmail: "bvance.oregon@gmail.com",
        recipientName: "Brandon & Chloe Vance",
        sentBy: "Mike Ford",
        status: "opened",
        notes: "Portal email dispatch with Albany USDA geographic tract guide."
      },
      {
        id: "eh-104-2",
        timestamp: "2026-08-28T10:15:00Z",
        templateType: "Property Financing Datasheet (Outlook Outreach)",
        subject: "Albany USDA Zero-Down Homes & Rate Matrix",
        channel: "outlook",
        recipientEmail: "bvance.oregon@gmail.com",
        recipientName: "Brandon & Chloe Vance",
        sentBy: "Mike Ford",
        status: "sent",
        notes: "Pre-encoded Outlook email dispatch with attached Linn County property flyers."
      }
    ],
    outreachLogs: [
      {
        id: "ol-104-1",
        timestamp: "2026-08-25T14:30:00Z",
        channel: "email",
        templateName: "USDA 100% Zero-Down Rural Eligibility Guide",
        subject: "Brandon & Chloe: 100% Zero Down USDA Homes in Albany & Linn County",
        recipientName: "Brandon & Chloe Vance"
      },
      {
        id: "ol-104-2",
        timestamp: "2026-08-28T10:15:00Z",
        channel: "email",
        templateName: "Outlook Property Financing Datasheet",
        subject: "Albany USDA Zero-Down Homes & Rate Matrix",
        recipientName: "Brandon & Chloe Vance"
      }
    ]
  },
  {
    id: "lead-102",
    fullName: "Marcus Holloway",
    email: "marcus.holloway@outlook.com",
    phone: "(503) 555-0941",
    preferredContactTime: "Saturday Morning",
    timeline: "3 to 6 Months Out",
    targetPriceRange: "$350,000 - $400,000",
    targetMonthlyBudget: "Around $2,500/mo",
    downPaymentSavings: "$18,000 (3.5% - 5% down)",
    grantInterest: true,
    creditScoreTier: "680-719 Good",
    preferredLocations: "Gresham, Oregon City, or Clackamas",
    propertyType: "Single Family or Starter Ranch",
    sendSampleHomes: true,
    sendSampleHomesOption: "Flex DPA 3.5% Grants",
    assignedLoId: "lo-jessica-taylor",
    assignedAgentId: "agent-marcus-vance",
    pairingId: "pair-jessica-marcus",
    leadSource: "Campaign: Google Search - First Time Home Buyer Oregon Hub",
    sourceCampaignId: "ad-google-1",
    sourceCampaignName: "Google Search - First Time Home Buyer Oregon Calculator & Pre-Approval",
    sourcePropertyId: "geo-3",
    sourcePropertyAddress: "3120 SW Beaverton Hillsdale Hwy, Beaverton, OR",
    interactedSourceType: "campaign",
    taggedCityArea: "Gresham & Clackamas",
    leadPathTag: "Google Search Pre-Approval Path",
    intentScore: "warm",
    status: "contacted",
    notes: "Interested in Oregon Bond Residential Loan Program (Cash Advantaged DPA) and list of starter homes in Gresham.",
    createdAt: "2026-08-23T18:20:00Z",
    smsConsentAuthorized: false,
    nurtureSequenceEnabled: true,
    nurtureCurrentStep: 3,
    nurtureTotalSteps: 4,
    nurtureStageText: "3 of 4 weekly nurture sent",
    lastEmailSentAt: "2026-08-27T09:45:00Z",
    lastEmailTemplateName: "Credit Score & Debt-to-Income Optimization Guide",
    nurtureSequenceLogs: [
      {
        id: "log-102-1",
        stageName: "1 of 4 weekly nurture sent",
        templateName: "Oregon Bond Residential Loan & DPA Overview",
        emailSubject: "Marcus - Your Oregon Down Payment Assistance Plan",
        sentAt: "2026-08-23T18:30:00Z",
        status: "opened"
      },
      {
        id: "log-102-2",
        stageName: "2 of 4 weekly nurture sent",
        templateName: "Gresham & Clackamas Starter Home Tour Scorecard",
        emailSubject: "Marcus: 3 Starter Homes under $400k with Low Down Options",
        sentAt: "2026-08-25T10:00:00Z",
        status: "opened"
      },
      {
        id: "log-102-3",
        stageName: "3 of 4 weekly nurture sent",
        templateName: "Credit Score & Debt-to-Income Optimization Guide",
        emailSubject: "Marcus: Simple Credit Hacks for Lower Mortgage Rates",
        sentAt: "2026-08-27T09:45:00Z",
        status: "sent"
      }
    ],
    emailHistory: [
      {
        id: "eh-102-1",
        timestamp: "2026-08-23T18:30:00Z",
        templateType: "Oregon Bond Residential Loan & DPA Overview",
        subject: "Marcus - Your Oregon Down Payment Assistance Plan",
        channel: "portal_email",
        recipientEmail: "marcus.holloway@outlook.com",
        recipientName: "Marcus Holloway",
        sentBy: "Jessica Taylor",
        status: "opened"
      },
      {
        id: "eh-102-2",
        timestamp: "2026-08-25T10:00:00Z",
        templateType: "Gresham & Clackamas Starter Home Tour Scorecard",
        subject: "Marcus: 3 Starter Homes under $400k with Low Down Options",
        channel: "portal_email",
        recipientEmail: "marcus.holloway@outlook.com",
        recipientName: "Marcus Holloway",
        sentBy: "Jessica Taylor",
        status: "opened"
      },
      {
        id: "eh-102-3",
        timestamp: "2026-08-27T09:45:00Z",
        templateType: "Credit Score & Debt-to-Income Optimization Guide",
        subject: "Marcus: Simple Credit Hacks for Lower Mortgage Rates",
        channel: "portal_email",
        recipientEmail: "marcus.holloway@outlook.com",
        recipientName: "Marcus Holloway",
        sentBy: "Jessica Taylor",
        status: "sent"
      }
    ],
    outreachLogs: [
      {
        id: "ol-102-1",
        timestamp: "2026-08-23T18:30:00Z",
        channel: "email",
        templateName: "Oregon Bond Residential Loan & DPA Overview",
        subject: "Marcus - Your Oregon Down Payment Assistance Plan",
        recipientName: "Marcus Holloway"
      },
      {
        id: "ol-102-2",
        timestamp: "2026-08-25T10:00:00Z",
        channel: "email",
        templateName: "Gresham & Clackamas Starter Home Tour Scorecard",
        subject: "Marcus: 3 Starter Homes under $400k with Low Down Options",
        recipientName: "Marcus Holloway"
      },
      {
        id: "ol-102-3",
        timestamp: "2026-08-27T09:45:00Z",
        channel: "email",
        templateName: "Credit Score & Debt-to-Income Optimization Guide",
        subject: "Marcus: Simple Credit Hacks for Lower Mortgage Rates",
        recipientName: "Marcus Holloway"
      }
    ]
  },
  {
    id: "lead-105",
    fullName: "Jessica & David Miller",
    email: "dmiller.pdx@yahoo.com",
    phone: "(541) 555-0892",
    preferredContactTime: "Weekday Mornings",
    timeline: "30-60 Days",
    targetPriceRange: "$450,000 - $510,000",
    targetMonthlyBudget: "$3,200/mo",
    downPaymentSavings: "$12,000",
    grantInterest: true,
    creditScoreTier: "730 Excellent",
    preferredLocations: "Bend & Redmond",
    propertyType: "Single Family or Townhome",
    sendSampleHomes: true,
    sendSampleHomesOption: "USDA 0% Down & Deschutes County Grants",
    assignedLoId: "lo-mike-ford",
    assignedAgentId: "agent-elena-rodriguez",
    pairingId: "pair-mike-elena",
    leadSource: "Listing: 560 NW Rimrock Rd (Redmond)",
    sourceCampaignId: "soc-2",
    sourceCampaignName: "Realtor Tour Scorecard & Seller Concession Secret",
    sourcePropertyId: "geo-4",
    sourcePropertyAddress: "560 NW Rimrock Rd, Redmond, OR",
    interactedSourceType: "property_listing",
    taggedCityArea: "Bend & Redmond",
    leadPathTag: "Property Listing Inquiry (Redmond)",
    intentScore: "hot",
    status: "new",
    notes: "Relocating to Central Oregon. Requested zero-down USDA listings in Redmond & Deschutes Pines.",
    chatTranscript: [
      { sender: "advisor", text: "Welcome! Are you exploring homes in Bend or Redmond?", time: "09:05 AM" },
      { sender: "user", text: "We want a house in Redmond or Bend area under $500k. Can we get a list of low or zero down homes?", time: "09:06 AM" }
    ],
    createdAt: "2026-08-26T10:15:00Z",
    smsConsentAuthorized: true,
    smsConsentTimestamp: "2026-08-26T10:15:45Z",
    smsConsentSource: "Web Intake Form (Rimrock Rd Inquiry)",
    smsConsentIp: "198.51.100.104 (TLS 1.3 Verified)",
    nurtureSequenceEnabled: true,
    nurtureCurrentStep: 1,
    nurtureTotalSteps: 4,
    nurtureStageText: "1 of 4 weekly nurture sent",
    lastEmailSentAt: "2026-08-26T10:30:00Z",
    lastEmailTemplateName: "Central Oregon Homebuyer Welcome & DPA Map",
    nurtureSequenceLogs: [
      {
        id: "log-105-1",
        stageName: "1 of 4 weekly nurture sent",
        templateName: "Central Oregon Homebuyer Welcome & DPA Map",
        emailSubject: "Jessica & David: Redmond & Bend Zero-Down Home Search",
        sentAt: "2026-08-26T10:30:00Z",
        status: "opened"
      }
    ],
    emailHistory: [
      {
        id: "eh-105-1",
        timestamp: "2026-08-26T10:30:00Z",
        templateType: "Central Oregon Homebuyer Welcome & DPA Map",
        subject: "Jessica & David: Redmond & Bend Zero-Down Home Search",
        channel: "portal_email",
        recipientEmail: "dmiller.pdx@yahoo.com",
        recipientName: "Jessica & David Miller",
        sentBy: "Mike Ford",
        status: "opened",
        notes: "Dispatched initial welcome and zero-down USDA Redmond tract overview."
      }
    ],
    outreachLogs: [
      {
        id: "ol-105-1",
        timestamp: "2026-08-26T10:30:00Z",
        channel: "email",
        templateName: "Central Oregon Homebuyer Welcome & DPA Map",
        subject: "Jessica & David: Redmond & Bend Zero-Down Home Search",
        recipientName: "Jessica & David Miller"
      }
    ]
  },
  {
    id: "lead-103",
    fullName: "Samantha Wei",
    email: "samantha.wei@designgroup.org",
    phone: "(503) 555-0337",
    preferredContactTime: "Lunchtime (12-1 PM)",
    timeline: "Found a House / In Escrow Soon",
    targetPriceRange: "$495,000",
    targetMonthlyBudget: "$3,400/mo",
    downPaymentSavings: "$65,000 (13% down)",
    grantInterest: false,
    creditScoreTier: "760+ Exceptional",
    preferredLocations: "Lake Oswego / West Linn",
    propertyType: "Townhouse",
    sendSampleHomes: false,
    assignedLoId: "lo-mike-ford",
    assignedAgentId: "agent-elena-rodriguez",
    pairingId: "pair-mike-elena",
    leadSource: "Flyer QR Code: Lake Oswego Co-Branded Open House",
    sourceCampaignName: "Lake Oswego Open House Co-Marketing Flyer",
    sourcePropertyAddress: "1280 SW Crestline Dr, Lake Oswego, OR",
    interactedSourceType: "flyer",
    taggedCityArea: "Lake Oswego & West Linn",
    leadPathTag: "Flyer QR Code Open House Path",
    intentScore: "hot",
    status: "pre_approved",
    notes: "Pre-approval letter issued for $510k. Toured property on Division St.",
    createdAt: "2026-08-22T14:10:00Z",
    nurtureSequenceEnabled: true,
    nurtureCurrentStep: 4,
    nurtureTotalSteps: 4,
    nurtureStageText: "4 of 4 weekly nurture sent",
    lastEmailSentAt: "2026-08-26T15:20:00Z",
    lastEmailTemplateName: "Escrow Milestone & Closing Preparation Checklist",
    nurtureSequenceLogs: [
      {
        id: "log-103-1",
        stageName: "1 of 4 weekly nurture sent",
        templateName: "Welcome & Pre-Approval FastTrack",
        emailSubject: "Samantha: Lake Oswego Homebuyer Pre-Approval Confirmation",
        sentAt: "2026-08-22T14:15:00Z",
        status: "opened"
      },
      {
        id: "log-103-2",
        stageName: "2 of 4 weekly nurture sent",
        templateName: "Touring & Home Inspection Red Flag Matrix",
        emailSubject: "Samantha: Key Inspection Points for Townhomes",
        sentAt: "2026-08-24T09:00:00Z",
        status: "opened"
      },
      {
        id: "log-103-3",
        stageName: "3 of 4 weekly nurture sent",
        templateName: "Underwriting Document Audit & Appraisal Guide",
        emailSubject: "Samantha: Underwriting Verification Next Steps",
        sentAt: "2026-08-25T11:30:00Z",
        status: "opened"
      },
      {
        id: "log-103-4",
        stageName: "4 of 4 weekly nurture sent",
        templateName: "Escrow Milestone & Closing Preparation Checklist",
        emailSubject: "Samantha: Clear to Close & Escrow Final Steps",
        sentAt: "2026-08-26T15:20:00Z",
        status: "opened"
      }
    ],
    emailHistory: [
      {
        id: "eh-103-1",
        timestamp: "2026-08-22T14:15:00Z",
        templateType: "Welcome & Pre-Approval FastTrack",
        subject: "Samantha: Lake Oswego Homebuyer Pre-Approval Confirmation",
        channel: "portal_email",
        recipientEmail: "samantha.wei@designgroup.org",
        recipientName: "Samantha Wei",
        sentBy: "Mike Ford",
        status: "opened"
      },
      {
        id: "eh-103-2",
        timestamp: "2026-08-24T09:00:00Z",
        templateType: "Touring & Home Inspection Red Flag Matrix",
        subject: "Samantha: Key Inspection Points for Townhomes",
        channel: "portal_email",
        recipientEmail: "samantha.wei@designgroup.org",
        recipientName: "Samantha Wei",
        sentBy: "Mike Ford",
        status: "opened"
      },
      {
        id: "eh-103-3",
        timestamp: "2026-08-25T11:30:00Z",
        templateType: "Google Workspace Pre-Approval Document Sync",
        subject: "Samantha: Underwriting Verification Next Steps",
        channel: "gmail",
        recipientEmail: "samantha.wei@designgroup.org",
        recipientName: "Samantha Wei",
        sentBy: "Mike Ford",
        status: "opened",
        notes: "Shared underwriting needs list via Google Drive & Gmail."
      },
      {
        id: "eh-103-4",
        timestamp: "2026-08-26T15:20:00Z",
        templateType: "Escrow Milestone & Closing Preparation Checklist",
        subject: "Samantha: Clear to Close & Escrow Final Steps",
        channel: "portal_email",
        recipientEmail: "samantha.wei@designgroup.org",
        recipientName: "Samantha Wei",
        sentBy: "Mike Ford",
        status: "opened"
      }
    ],
    outreachLogs: [
      {
        id: "ol-103-1",
        timestamp: "2026-08-22T14:15:00Z",
        channel: "email",
        templateName: "Welcome & Pre-Approval FastTrack",
        subject: "Samantha: Lake Oswego Homebuyer Pre-Approval Confirmation",
        recipientName: "Samantha Wei"
      },
      {
        id: "ol-103-2",
        timestamp: "2026-08-24T09:00:00Z",
        channel: "email",
        templateName: "Touring & Home Inspection Red Flag Matrix",
        subject: "Samantha: Key Inspection Points for Townhomes",
        recipientName: "Samantha Wei"
      },
      {
        id: "ol-103-3",
        timestamp: "2026-08-25T11:30:00Z",
        channel: "email",
        templateName: "Google Workspace Underwriting Sync",
        subject: "Samantha: Underwriting Verification Next Steps",
        recipientName: "Samantha Wei"
      },
      {
        id: "ol-103-4",
        timestamp: "2026-08-26T15:20:00Z",
        channel: "email",
        templateName: "Escrow Milestone & Closing Checklist",
        subject: "Samantha: Clear to Close & Escrow Final Steps",
        recipientName: "Samantha Wei"
      }
    ]
  }
];


