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
    title: "Sunlit Craftsman with Modern Kitchen",
    address: "2845 SE Division Street",
    city: "Portland",
    state: "OR",
    zip: "97202",
    price: 435000,
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
    title: "Contemporary Cedar Townhome near MAX Light Rail",
    address: "1482 SW Beaverton-Hillsdale Hwy",
    city: "Beaverton",
    state: "OR",
    zip: "97005",
    price: 399000,
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
    name: "OHCS Homeownership Assistance Program (HAP) Grants",
    provider: "Oregon Housing & Community Services / Regional CDCs",
    scope: "State",
    state: "OR",
    assistanceType: "Forgivable Grant",
    maxAssistance: "Up to $15,000 - $30,000 (100% Forgivable Grant)",
    incomeLimitDescription: "Household income ≤80% of Oregon Area Median Income (AMI)",
    minCreditScore: 620,
    firstTimeBuyerRequired: true,
    description: "State-funded down payment assistance grants administered locally across Oregon through regional non-profits (such as DevNW, Proud Ground, Hacienda CDC, and NeighborWorks).",
    link: "https://www.oregon.gov/ohcs/homeownership/pages/downpayment-assistance.aspx",
    highlights: [
      "100% forgivable grant over residency period (never needs repayment)",
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
    maxAssistance: "Up to $12,000 - $20,000 in Matched Grant Equity (Up to 5:1 Match)",
    incomeLimitDescription: "Net worth < $20,000; household income ≤80% Oregon Area Median Income",
    minCreditScore: 580,
    firstTimeBuyerRequired: true,
    description: "Oregon's premier Individual Development Account (IDA) grant. For every $1 you deposit into your dedicated home savings account, Oregon matches it with up to $5 in free grant funds for your down payment.",
    link: "https://devnw.org/financial-programs/matched-savings-idas/",
    highlights: [
      "Up to 5:1 match on personal savings (free grant funds, not a debt)",
      "Zero repayment required — 100% direct homebuyer grant equity",
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
      "Repayable or forgiven only when home is sold, transferred, or refinanced"
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
    name: "Proud Ground Community Land Trust Down Payment Grants",
    provider: "Proud Ground (Pacific Northwest CLT)",
    scope: "State",
    state: "OR",
    assistanceType: "Forgivable Grant",
    maxAssistance: "$50,000 to $75,000 Purchase Price Subsidy Grant",
    incomeLimitDescription: "Household income ≤80% AMI in Multnomah, Washington, Clackamas, Jackson",
    minCreditScore: 620,
    firstTimeBuyerRequired: true,
    description: "Permanently affordable homeownership model that provides substantial grant subsidies to lower the purchase price of homes in the Portland Metro area and Central/Southern Oregon.",
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
    description: "Government-backed 3.5% down mortgage widely accepted across Oregon with forgiving credit criteria, high debt-to-income limits, and full compatibility with OHCS down payment assistance.",
    link: "https://www.hud.gov/states/oregon/homeownership/buyingprgms",
    highlights: [
      "580+ credit score for 3.5% down payment in Oregon",
      "100% of down payment can be gift funds or OHCS state grants",
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
      { id: "t2-3", text: "Explore state Down Payment Assistance (DPA) and Fannie Mae HomeReady grants", done: false }
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
    title: "Proof of Down Payment Assistance (DPA) Grant Approval",
    category: "Property & Contract",
    required: false,
    status: "pending",
    description: "State or housing authority grant pre-qualification certificate.",
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
  nmlsId: "NMLS #184209",
  company: "Cornerstone First Mortgage",
  branch: "Team Lonn Kilstrom Branch (Manager / Admin)",
  email: "mford@cfmtg.com",
  phone: "(503) 555-0198",
  headshotUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&auto=format&fit=crop&q=80",
  websiteUrl: "https://cfmtg.com/lo/mike-ford/",
  bio: "With over 16 years specializing exclusively in first-time homebuyers across Oregon and Washington, Mike specializes in low-stress pre-approvals, maximum Interested Party Contribution (IPC) seller concession strategies, and locking in state Down Payment Assistance (DPA) grant programs.",
  specialties: [
    "First-Time Homebuyer Programs",
    "FHA, Conventional, VA & USDA",
    "Oregon DPA & Forgivable Grants",
    "Seller Concession (IPC) Optimization",
    "2/1 Rate Buydown Engineering"
  ],
  bookingUrl: "https://calendly.com",
  licenseStates: ["Oregon", "Washington", "California", "Idaho"],
  licenseVerificationYear: 2026,
  licenseLastVerifiedDate: "2026-01-10",
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
    branch: "Team Lonn Kilstrom Branch",
    email: "LKilstrom@cfmtg.com",
    phone: "(503) 849-3478",
    headshotUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
    websiteUrl: "https://cfmtg.com/lo/lonn-kilstrom/",
    bio: "Decades of premier mortgage leadership heading the Team Lonn Kilstrom branch at Cornerstone First Mortgage, providing seasoned homebuyer advisory, custom loan structuring, and 5-star closing experiences.",
    specialties: [
      "Branch Leadership & Advisory",
      "First-Time Homebuyer Solutions",
      "Conventional, FHA & VA Loans",
      "Down Payment Assistance Grants",
      "Rate Buydown Strategies"
    ],
    bookingUrl: "https://calendly.com",
    licenseStates: ["Oregon", "Washington", "California", "Idaho", "Arizona"],
    licenseVerificationYear: 2026,
    licenseLastVerifiedDate: "2026-01-15",
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
    branch: "Team Lonn Kilstrom Branch",
    email: "alan.burkhart@cfmtg.com",
    phone: "(503) 555-0155",
    headshotUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80",
    websiteUrl: "https://cfmtg.com/lo/alan-burkhart/",
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
    branch: "Team Lonn Kilstrom Branch",
    email: "MSaftich@cfmtg.com",
    phone: "(503) 555-0177",
    headshotUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80",
    websiteUrl: "https://cfmtg.com/lo/mark-saftich/",
    bio: "With over 28 years of experience in mortgage and real estate finance, Mark delivers structured lending solutions, grant programs, and expert advisory for first-time buyers and growing families.",
    specialties: [
      "28+ Years Lending Experience",
      "Down Payment Assistance & Grants",
      "Conventional, FHA & Jumbo",
      "Mortgage Planning & Advisory"
    ],
    bookingUrl: "https://calendly.com",
    licenseStates: ["Oregon", "Washington", "California"],
    licenseVerificationYear: 2026,
    licenseLastVerifiedDate: "2026-01-18",
    isAdmin: false,
    password: "pass123",
    parentManagerId: "lo-mike-ford",
    customSlug: "mark-saftich",
    adSettings: {
      targetCities: ["Portland", "Lake Oswego", "Tigard", "Clackamas"],
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
    branch: "Team Lonn Kilstrom Branch",
    email: "darryl.symonds@cfmtg.com",
    phone: "(503) 555-0168",
    headshotUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&auto=format&fit=crop&q=80",
    websiteUrl: "https://cfmtg.com/lo/darryl-symonds/",
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
    isAdmin: false,
    password: "pass123",
    parentManagerId: "lo-mike-ford",
    customSlug: "darryl-symonds",
    adSettings: {
      targetCities: ["Beaverton", "Hillsboro", "Tigard", "Forest Grove"],
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
    branch: "Team Lonn Kilstrom Branch",
    email: "christopher.vargas@cfmtg.com",
    phone: "(503) 555-0149",
    headshotUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80",
    websiteUrl: "https://cfmtg.com/lo/christopher-vargas/",
    bio: "Dedicated Loan Officer with Team Lonn Kilstrom specializing in modern digital pre-approvals, down payment assistance programs, and strategic first-time buyer financing.",
    specialties: [
      "Digital Pre-Approval FastTrack",
      "First-Time Buyer Grants",
      "FHA & 100% Financing Programs",
      "Credit Optimization Coaching"
    ],
    bookingUrl: "https://calendly.com",
    licenseStates: ["Oregon", "Washington"],
    licenseVerificationYear: 2026,
    licenseLastVerifiedDate: "2026-01-22",
    isAdmin: false,
    password: "pass123",
    parentManagerId: "lo-mike-ford",
    customSlug: "christopher-vargas",
    adSettings: {
      targetCities: ["Portland", "Vancouver", "Beaverton", "Milwaukie"],
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
    branch: "Team Lonn Kilstrom Branch",
    email: "derek.richards@cfmtg.com",
    phone: "(503) 555-0188",
    headshotUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80",
    websiteUrl: "https://cfmtg.com/lo/derek-richards/",
    bio: "Experienced Loan Officer committed to delivering tailored loan options, competitive rates, and seamless communication from application to close with Team Lonn Kilstrom at Cornerstone First Mortgage.",
    specialties: [
      "Conventional & FHA Financing",
      "Down Payment Assistance",
      "Fast 14-Day Closings",
      "First-Time Homebuyer Advisory"
    ],
    bookingUrl: "https://calendly.com",
    licenseStates: ["Oregon", "Washington"],
    licenseVerificationYear: 2026,
    licenseLastVerifiedDate: "2026-01-24",
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
    branch: "Team Lonn Kilstrom Branch",
    email: "emanuel.etuks@cfmtg.com",
    phone: "(503) 555-0192",
    headshotUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80",
    websiteUrl: "https://cfmtg.com/lo/emanuel-etuks/",
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
  }
];

export const INITIAL_AGENT_ROSTER: RealEstateAgentProfile[] = [
  {
    id: "agent-sarah-jenkins",
    name: "Sarah Jenkins",
    title: "Senior Buyer Specialist, REALTOR®",
    brokerage: "Cascade Valley Real Estate",
    licenseNumber: "OR Lic #201208941",
    email: "sarah.jenkins@cascadevalleyre.com",
    phone: "(503) 555-0144",
    headshotUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80",
    bio: "Sarah is passionate about guiding first-time buyers through neighborhood selection, realistic tour inspections, and aggressive offer structuring to capture maximum seller closing credits.",
    specialties: [
      "First-Time Homebuyers",
      "Inspection Defect Negotiation",
      "Starter Single-Family Homes",
      "Portland Metro & Suburbs"
    ],
    marketAreas: ["Portland Metro", "Beaverton", "Tigard", "Lake Oswego", "Hillsboro"],
    websiteUrl: "https://cascadevalleyre.com",
    assignedLoIds: ["lo-mike-ford", "lo-lonn-kilstrom"],
    customSlug: "sarah-jenkins"
  },
  {
    id: "agent-marcus-vance",
    name: "Marcus Vance",
    title: "Principal Broker & First-Time Buyer Lead",
    brokerage: "Willamette Heritage Realty",
    licenseNumber: "OR Lic #200804192",
    email: "marcus@willametteheritage.com",
    phone: "(503) 555-0177",
    headshotUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
    bio: "Marcus has closed over 350+ transactions for first-time buyers in Clackamas, Oregon City, and Gresham, combining deep neighborhood knowledge with razor-sharp contract terms.",
    specialties: [
      "Competitive Offer Structuring",
      "Down Payment Grant Synergy",
      "Appraisal Gap Protections",
      "East County Neighborhoods"
    ],
    marketAreas: ["Oregon City", "Clackamas", "Gresham", "Happy Valley", "Milwaukie"],
    websiteUrl: "https://willametteheritage.com",
    assignedLoIds: ["lo-mike-ford", "lo-alan-burkhart", "lo-mark-saftich"],
    customSlug: "marcus-vance"
  },
  {
    id: "agent-elena-rostova",
    name: "Elena Rostova",
    title: "Associate Broker, REALTOR®",
    brokerage: "Urban Nest Properties",
    licenseNumber: "OR Lic #201509332",
    email: "elena@urbannestpdx.com",
    phone: "(503) 555-0122",
    headshotUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&auto=format&fit=crop&q=80",
    bio: "Elena specializes in vintage character homes, cosmetic fixers with instant sweat equity potential, and townhomes for young professionals and growing families.",
    specialties: [
      "Vintage Craftsmans & Bungalows",
      "ADU & Sweat Equity Potential",
      "Renovation Budget Planning",
      "Urban & Walkable Neighborhoods"
    ],
    marketAreas: ["East Portland", "Southeast Portland", "Milwaukie", "St. Johns"],
    websiteUrl: "https://urbannestpdx.com",
    assignedLoIds: ["lo-darryl-symonds", "lo-mike-ford", "lo-christopher-vargas"],
    customSlug: "elena-rostova"
  },
  {
    id: "agent-tyler-brooks",
    name: "Tyler Brooks",
    title: "Modern Homes & Relocation Specialist, REALTOR®",
    brokerage: "Pacific Crest Real Estate",
    licenseNumber: "OR Lic #202108194",
    email: "tyler@pacificcrestre.com",
    phone: "(503) 555-0199",
    headshotUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80",
    bio: "Tyler focuses on newly constructed townhomes, smart homes, and suburban relocations across Washington and Clackamas counties.",
    specialties: [
      "New Construction & Builder Warranties",
      "First-Time Relocations",
      "Energy Efficient Homes",
      "Beaverton & Hillsboro"
    ],
    marketAreas: ["Beaverton", "Hillsboro", "Bethany", "Sherwood"],
    websiteUrl: "https://pacificcrestre.com",
    assignedLoIds: ["lo-derek-richards", "lo-emanuel-etuks"],
    customSlug: "tyler-brooks"
  }
];

export const INITIAL_PAIRINGS: import("../types").LOPairing[] = [
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
    id: "pair-3",
    loId: "lo-alan-burkhart",
    agentId: "agent-marcus-vance",
    title: "Alan Burkhart + Marcus Vance (East County Homeownership)",
    customSlug: "alan-and-marcus",
    campaignTag: "east-county-grants",
    notes: "Targeting Clackamas & Gresham first-time buyers seeking grant assistance.",
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
    campaignTag: "valley-dpa-grants",
    notes: "Focusing on 0% down USDA and OHCS state grants in South Metro & Valley.",
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
    campaignTag: "new-home-grants",
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
    campaignTag: "multilingual-home-grants",
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
    title: "Oregon First-Time Buyer Grant & Payment Reality Check",
    topic: "Affordability & Grants",
    hook: "Thinking about buying your first home in 2026? Most buyers have NO IDEA they may qualify for up to $30,000 in state down payment assistance!",
    bodyCopy: "Stop guessing your monthly mortgage payment. We built a free, transparent interactive homebuyer portal where you can calculate exact PITI + taxes, browse verified Oregon grants, and track homes with a structural tour scorecard.\n\n👉 Test your numbers right now on our live interactive dashboard:",
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
    bodyCopy: "Here is the truth: Over 73% of our first-time homebuyer clients buy with 3% to 3.5% down—and many use forgivable state grants to cover closing costs! Tap the link to test your true monthly budget with our interactive calculator.",
    hashtags: ["#MortgageTok", "#HomebuyerHack", "#RealEstateTok", "#FinanceTips", "#MortgageBroker", "#Oregon"],
    shareUrl: "",
    status: "draft",
    createdAt: "2026-08-22"
  }
];

export const INITIAL_AD_DRAFTS: import("../types").AdCampaignDraft[] = [
  {
    id: "ad-meta-1",
    platform: "meta",
    loId: "lo-mike-ford",
    agentId: "agent-sarah-jenkins",
    campaignName: "Meta Feed - 2026 Oregon First-Time Homebuyer Portal & Grants",
    headline: "Calculate Your True Monthly Payment & Grants in 60 Sec",
    secondaryHeadlines: ["Get Free Pre-Approval Roadmap", "Oregon Down Payment Grants Available"],
    primaryText: "Don't guess what your mortgage payment will be. Use our free, transparent First-Time Homebuyer Interactive Portal to model exact monthly payments, test self-restricted budget goals, and check eligibility for up to $30,000 in Oregon down payment grants.",
    descriptionText: "Free Interactive Tool • No Credit Card Required • Powered by Mike Ford (NMLS #184209) & Sarah Jenkins (REALTOR®)",
    targetUrl: "",
    dailyBudget: 25,
    targetLocations: ["Portland Metro (25 mi)", "Beaverton", "Gresham", "Hillsboro"],
    keywords: ["first time home buyer", "mortgage calculator", "oregon down payment assistance", "buy a house in portland"],
    specialHousingCategory: true,
    adObjective: "LEAD_GENERATION",
    status: "ready_to_launch",
    lastSaved: "2026-08-22"
  },
  {
    id: "ad-google-1",
    platform: "google",
    loId: "lo-mike-ford",
    agentId: "agent-sarah-jenkins",
    campaignName: "Google Search - First Time Home Buyer Oregon Calculator & Pre-Approval",
    headline: "Oregon First Time Homebuyer Hub | Free Payment Calculator",
    secondaryHeadlines: [
      "Check 2026 Grant Eligibility",
      "Instant Affordability Breakdown",
      "Mike Ford NMLS #184209",
      "Toured Home Inspection Scorecards"
    ],
    primaryText: "Interactive First-Time Homebuyer Portal. Calculate accurate monthly PITI payments, review 10-step closing roadmap, and book a personalized strategy session.",
    descriptionText: "Explore Oregon DPA Grants & Seller Concession Strategies. Zero Obligation. Start Your Plan Today.",
    targetUrl: "",
    dailyBudget: 30,
    targetLocations: ["Portland, OR", "Washington County, OR", "Clackamas County, OR", "Multnomah County, OR"],
    keywords: [
      "first time home buyer oregon",
      "oregon down payment assistance grants",
      "mortgage calculator portland or",
      "first time buyer pre approval portland",
      "how much house can i afford oregon"
    ],
    specialHousingCategory: true,
    adObjective: "LEAD_GENERATION",
    status: "ready_to_launch",
    lastSaved: "2026-08-23"
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
    assignedLoId: "lo-mike-ford",
    assignedAgentId: "agent-sarah-jenkins",
    pairingId: "pair-mike-sarah",
    leadSource: "Website AI Intake Chatbot",
    intentScore: "hot",
    status: "new",
    notes: "Both employed in tech & healthcare. Want to verify 2/1 rate buydown vs paying permanent discount points.",
    chatTranscript: [
      { sender: "advisor", text: "Welcome! I can help check your true monthly payment and grant eligibility. What is your target timeline?", time: "10:14 AM" },
      { sender: "user", text: "We are renting until October and want to buy in 30-60 days.", time: "10:15 AM" },
      { sender: "advisor", text: "Great timeline! What target price range or monthly payment feel comfortable for you?", time: "10:15 AM" },
      { sender: "user", text: "Around $420k-$460k, keeping monthly under $3,100.", time: "10:16 AM" }
    ],
    createdAt: "2026-08-24T06:45:00Z"
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
    assignedLoId: "lo-jessica-taylor",
    assignedAgentId: "agent-marcus-vance",
    pairingId: "pair-jessica-marcus",
    leadSource: "Meta Feed Ad Campaign",
    intentScore: "warm",
    status: "contacted",
    notes: "Interested in Oregon Bond Residential Loan Program (Cash Advantaged DPA).",
    createdAt: "2026-08-23T18:20:00Z"
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
    assignedLoId: "lo-mike-ford",
    assignedAgentId: "agent-elena-rodriguez",
    pairingId: "pair-mike-elena",
    leadSource: "Website AI Intake Chatbot",
    intentScore: "hot",
    status: "pre_approved",
    notes: "Pre-approval letter issued for $510k. Toured property on Division St.",
    createdAt: "2026-08-22T14:10:00Z"
  }
];


