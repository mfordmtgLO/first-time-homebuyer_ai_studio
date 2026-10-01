import { jsPDF } from "jspdf";
import { MarketingFlyer, LoanOfficerProfile, PropertyListing, RealEstateAgentProfile } from "../types";

export interface FlyerPdfOptions {
  loanOfficer?: LoanOfficerProfile;
  agent?: RealEstateAgentProfile;
  leadName?: string;
  properties?: PropertyListing[];
  targetCity?: string;
}

/**
 * Detailed program information catalog for generating authentic, compliant
 * mortgage marketing flyers in real PDF format.
 */
interface FlyerProgramData {
  heroTitle: string;
  heroBadge: string;
  tagline: string;
  keyBenefits: string[];
  specs: { label: string; value: string }[];
  eligibilityNotes: string[];
  loanOfficerPitch: string;
  tableData?: { cols: string[]; rows: string[][] };
}

function getFlyerProgramData(flyer: MarketingFlyer): FlyerProgramData {
  const cat = flyer.category.toUpperCase();
  const fid = flyer.id.toLowerCase();
  const name = flyer.name.toLowerCase();

  if (fid.includes("flyer-1b") || name.includes("boundary") || name.includes("geographic")) {
    return {
      heroTitle: "USDA ELIGIBLE GEOGRAPHIC TRACT GUIDE",
      heroBadge: "USDA RURAL DEVELOPMENT • TRACT OVERLAY",
      tagline: "Navigating Zero-Down Qualifying Rural & Suburban Communities Across Central Oregon",
      keyBenefits: [
        "100% Financing Geographic Coverage: Over 85% of surrounding land outside metro core qualifies.",
        "Zero Down Payment Barrier: Qualified buyers purchase with $0 required cash down payment.",
        "Tract Eligibility Verification: Fast confirmation using official USDA Rural Development GIS mapping.",
        "Compatible Properties: Single-family homes, approved PUDs, modular homes, and new construction.",
        "Lot Size Flexibility: Acreage permitted provided site is typical for area and non-commercial.",
      ],
      specs: [
        { label: "Down Payment", value: "$0 (100% LTV Financing)" },
        { label: "Guarantee Fee", value: "1.00% Upfront (Financed into loan)" },
        { label: "Annual Fee", value: "0.35% (Much lower than FHA MIP)" },
        { label: "Occupancy", value: "Owner-Occupied Primary Residence" },
        { label: "Property Zones", value: "USDA Designated Rural/Suburban Tracts" },
      ],
      eligibilityNotes: [
        "Property must fall within eligible USDA boundary maps (Bend perimeter, Redmond, Sisters, La Pine, Prineville).",
        "Modest household income caps apply (based on county and total family household size).",
        "Minimum recommended credit score of 640 for automated underwriting approval.",
      ],
      loanOfficerPitch:
        "We verify USDA property tract eligibility within 15 minutes of receiving any MLS address or tax parcel ID. Pair this with our fast pre-approvals to make winning offers!",
    };
  }

  if (cat.includes("USDA") || fid.includes("flyer-1") || name.includes("usda")) {
    return {
      heroTitle: "USDA 100% ZERO-DOWN HOME FINANCING",
      heroBadge: "USDA RURAL HOUSING GUARANTEED LOAN",
      tagline: "Government-Backed 100% Financing for First-Time & Repeat Homebuyers",
      keyBenefits: [
        "Zero Down Payment Required: Finance 100% of the appraised market value.",
        "Substantially Lower Monthly Costs: Annual fee is only 0.35%, compared to 0.55%+ for standard FHA.",
        "Roll Closing Costs Into Loan: If the appraisal comes in above contract price, excess equity covers closing costs!",
        "Competitive 30-Year Fixed Rates: Backed by the federal government for optimal security and stability.",
        "Up to 6% Seller Concessions: Sellers can contribute up to 6% of the purchase price toward closing costs and prepaid items.",
      ],
      specs: [
        { label: "Minimum Down Payment", value: "$0.00 (Zero Down)" },
        { label: "Max Loan-to-Value", value: "100% of Appraised Value" },
        { label: "Upfront Guarantee Fee", value: "1.00% (Can be financed)" },
        { label: "Monthly Guarantee Fee", value: "0.35% / 12 per month" },
        { label: "Credit Score Target", value: "640+ (Manual down to 620)" },
      ],
      eligibilityNotes: [
        "Must be used for primary residence in an eligible suburban or rural tract.",
        "Household income cannot exceed 115% of the local median household income.",
        "Borrower must demonstrate ability to comfortably repay mortgage debt.",
      ],
      loanOfficerPitch:
        "Many buyers mistakenly assume they need $30,000+ saved for a down payment. USDA financing unlocks homeownership with zero down payment for qualified properties!",
    };
  }

  if (fid.includes("flyer-2") || name.includes("15k") || name.includes("grant") || name.includes("firsthome")) {
    return {
      heroTitle: "FIRSTHOME $15,000 DOWN PAYMENT GRANT",
      heroBadge: "FIRST-TIME HOMEBUYER ASSISTANCE PROGRAM",
      tagline: "State Housing Finance Agency Down Payment & Closing Cost Assistance Program",
      keyBenefits: [
        "Up to $15,000 in Direct Assistance: Apply directly toward down payment and allowable closing expenses.",
        "Forgivable Grant Structure: Zero monthly principal or interest payments required on grant funds.",
        "Combine With First Mortgages: Pairs seamlessly with 30-year Conventional, FHA, and VA purchase loans.",
        "Minimal Borrower Cash Required: Buy with as little as $1,000 or 1% of your own funds out of pocket.",
        "Local Agency Approval: Administered with local underwriting for dependable 21-day closing timelines.",
      ],
      specs: [
        { label: "Grant Assistance Cap", value: "Up to $15,000.00" },
        { label: "Interest Rate on Grant", value: "0.00% (Forgivable Grant)" },
        { label: "Eligible First Loans", value: "Conventional 97, FHA 203(b), VA" },
        { label: "Minimum Borrower Cash", value: "$1,000 or 1% of Purchase Price" },
        { label: "Buyer Type", value: "First-Time Homebuyer (3-year rule)" },
      ],
      eligibilityNotes: [
        "Must not have owned a primary residence in the past 3 years (exceptions for targeted areas).",
        "Borrower must complete an approved HUD homebuyer education course prior to closing.",
        "Qualifying household income must fall within state county income guidelines.",
      ],
      loanOfficerPitch:
        "The FirstHome $15K Grant bridges the cash barrier for qualified first-time buyers. We guide borrowers through quick pre-approval and handle all agency grant filings.",
    };
  }

  if (fid.includes("flyer-2b") || name.includes("flex") || name.includes("3.5%")) {
    return {
      heroTitle: "FLEX 3.5% DOWN PAYMENT ASSISTANCE",
      heroBadge: "FLEX DPA & SECOND LIEN SOLUTIONS",
      tagline: "Flexible Down Payment Assistance Featuring Deferred & Forgivable Second Mortgages",
      keyBenefits: [
        "Covers Full 3.5% Down Payment: Eliminates the out-of-pocket down payment barrier for FHA financing.",
        "0% Interest Second Lien: Assistance provided as a deferred second mortgage with no monthly payment.",
        "Forgiveness Options Available: Forgiven after designated owner-occupancy period.",
        "Both First-Time and Repeat Buyers: Unlike some grants, repeat buyers in target areas may qualify.",
        "Keep Personal Reserves Intact: Maintain emergency savings while transitioning into homeownership.",
      ],
      specs: [
        { label: "Assistance Amount", value: "3.5% to 5.0% of Purchase Price" },
        { label: "Monthly DPA Payment", value: "$0.00 (Deferred / Forgivable)" },
        { label: "First Mortgage Type", value: "30-Year Fixed FHA or Conventional" },
        { label: "Credit Requirement", value: "620 minimum credit score" },
        { label: "Loan Term", value: "30-Year Fixed First Mortgage" },
      ],
      eligibilityNotes: [
        "Full-document income qualification with stable 2-year employment history.",
        "Subject to county purchase price caps and debt-to-income limits.",
      ],
      loanOfficerPitch:
        "Flex DPA helps creditworthy buyers keep their liquid savings while purchasing their home now before rates and prices shift.",
    };
  }

  if (cat.includes("BUYDOWN") || fid.includes("flyer-3") || name.includes("buydown")) {
    return {
      heroTitle: "2-1 TEMPORARY RATE BUYDOWN MATRIX",
      heroBadge: "SELLER-FUNDED CONCESSION PROGRAM",
      tagline: "Substantially Lower Monthly Mortgage Payments for the First Two Years",
      keyBenefits: [
        "Year 1 Rate: 2.00% Below Note Rate: Enjoy immediate significant monthly cash-flow relief.",
        "Year 2 Rate: 1.00% Below Note Rate: Gradual step-up as homebuyer earnings and career expand.",
        "Years 3–30: Fixed Note Rate: Fully predictable 30-year fixed rate mortgage.",
        "100% Seller or Builder Funded: Buyer pays zero additional fee or markup for buydown.",
        "Unused Funds Protected: If buyer refinances early, remaining escrow funds apply directly to loan principal balance!",
      ],
      specs: [
        { label: "Year 1 Effective Rate", value: "Note Rate minus 2.00%" },
        { label: "Year 2 Effective Rate", value: "Note Rate minus 1.00%" },
        { label: "Years 3 to 30", value: "Fixed Initial Note Rate" },
        { label: "Cost Responsibility", value: "Seller / Builder Concession" },
        { label: "Underwriting Basis", value: "Qualified at Full Note Rate" },
      ],
      eligibilityNotes: [
        "Conforming Conventional, FHA, and VA purchase loans eligible.",
        "Seller concessions must remain within maximum program guidelines (3% to 9% depending on LTV).",
      ],
      loanOfficerPitch:
        "On a $450,000 loan, a 2-1 buydown saves the homebuyer over $570/month in Year 1 and over $10,300 total across the first two years—making high-interest markets dramatically more affordable!",
      tableData: {
        cols: ["Period", "Interest Rate", "Est. Monthly P&I ($450k Loan)", "Monthly Savings"],
        rows: [
          ["Year 1", "4.75%", "$2,347 / mo", "SAVE $571 / month"],
          ["Year 2", "5.75%", "$2,626 / mo", "SAVE $292 / month"],
          ["Years 3-30", "6.75% (Note Rate)", "$2,918 / mo", "Standard Payment"],
        ],
      },
    };
  }

  if (fid.includes("flyer-4") || name.includes("va") || name.includes("military")) {
    return {
      heroTitle: "VA MILITARY ZERO-DOWN MORTGAGE",
      heroBadge: "U.S. DEPT OF VETERANS AFFAIRS BENEFIT",
      tagline: "Superior 100% Financing, No Monthly PMI, & Preferential Terms for Veterans",
      keyBenefits: [
        "100% Financing with $0 Down: Veterans and active military purchase with zero required down payment.",
        "NO Monthly Mortgage Insurance (PMI): Saves $150–$350+ every single month over conventional/FHA.",
        "Funding Fee Exemptions: 100% waiver of the VA funding fee for service-connected disability ratings.",
        "Lenient Underwriting: Flexible debt-to-income tolerances and generous credit underwriting.",
        "Seller Concessions: Sellers can pay up to 4% in seller concessions plus standard customary closing costs.",
      ],
      specs: [
        { label: "Minimum Down Payment", value: "$0.00 (Zero Down)" },
        { label: "Monthly PMI", value: "NONE ($0.00/mo)" },
        { label: "Maximum Loan Limits", value: "Full Entitlement = No Loan Cap" },
        { label: "Funding Fee", value: "0% for disabled vets (or 2.15% 1st use)" },
        { label: "Term", value: "15 or 30-Year Fixed" },
      ],
      eligibilityNotes: [
        "Requires valid Certificate of Eligibility (COE) - we retrieve this electronically in minutes.",
        "Available to Active Duty, Veterans, National Guard, and surviving spouses.",
      ],
      loanOfficerPitch:
        "VA loans are the single most powerful mortgage program in America. We honor your service by delivering fast, stress-free 18-day closings.",
    };
  }

  if (fid.includes("flyer-5") || name.includes("203k") || name.includes("renovation")) {
    return {
      heroTitle: "FHA 203(k) RENOVATION & PURCHASE LOAN",
      heroBadge: "PURCHASE & REHABILITATION MORTGAGE",
      tagline: "Combine Home Purchase Price and Remodel Budget Into One Single Fixed-Rate Mortgage",
      keyBenefits: [
        "One Single Mortgage: Roll purchase price and renovation costs together into a single 30-year fixed loan.",
        "Only 3.5% Down Payment: Down payment calculated from the future 'After-Improved' appraised value.",
        "Turn Fixer-Uppers into Dream Homes: Finance kitchen upgrades, new roof, HVAC, flooring, and room additions.",
        "Streamlined Limited 203(k): Up to $35,000 for cosmetic and non-structural repairs with simplified contractor bidding.",
        "Avoid Higher-Rate Personal Loans: Far more cost-effective than taking high-interest personal loans or credit cards.",
      ],
      specs: [
        { label: "Minimum Down Payment", value: "3.5% of Total Completed Value" },
        { label: "Limited 203(k) Cap", value: "Up to $35,000 for repairs" },
        { label: "Standard 203(k)", value: "Major structural & additions allowed" },
        { label: "Loan Type", value: "Government-Backed 30-Year Fixed" },
      ],
      eligibilityNotes: [
        "All work must be completed by licensed and insured general contractors.",
        "Funds held in specialized escrow account and disbursed as work phases complete inspection.",
      ],
      loanOfficerPitch:
        "Don't let an outdated kitchen or deferred maintenance kill a deal. FHA 203(k) allows buyers to create their dream home with only 3.5% down!",
    };
  }

  // Default / General Flyer Data
  return {
    heroTitle: flyer.name.toUpperCase(),
    heroBadge: `${flyer.category.toUpperCase()} SPECIALIZED LOAN PROGRAM`,
    tagline: flyer.description || "Comprehensive Financing Options Tailored to Local Homebuyers",
    keyBenefits: [
      "Competitive Fixed Interest Rates: Backed by top national secondary market execution.",
      "Customized Down Payment Options: From 0% down specialty programs to 3% conventional first-time buyer solutions.",
      "Rapid Local Pre-Approval: Full underwriter-verified approvals that strengthen purchase offers.",
      "Co-Branded Agent & Buyer Coordination: Clear weekly milestone communication through closing.",
      "Dedicated Loan Officer Guidance: Direct access to experienced mortgage specialists.",
    ],
    specs: [
      { label: "Program Category", value: flyer.category },
      { label: "File Format", value: flyer.fileType.toUpperCase() },
      { label: "Occupancy Type", value: "Primary Residence & Second Home" },
      { label: "Turnaround Time", value: "Average 18 to 21-Day Closing" },
    ],
    eligibilityNotes: [
      "Subject to borrower credit, asset, and income verification.",
      "Programs available throughout Oregon, Washington, California, Idaho, and Arizona.",
    ],
    loanOfficerPitch:
      "Contact us directly to review your specific scenario and run custom loan payment scenarios for properties of interest!",
  };
}

/**
 * Renders a single flyer's layout and content onto the current page of a jsPDF document.
 */
export function renderFlyerOnDoc(
  doc: jsPDF,
  flyer: MarketingFlyer,
  options: FlyerPdfOptions = {}
): void {

  const {
    loanOfficer,
    agent,
    leadName,
    properties = [],
    targetCity = "Bend & Redmond, OR",
  } = options;

  const loName = loanOfficer?.name || "Mike Ford";
  const loTitle = loanOfficer?.title || "Senior Loan Officer | Producing Branch Manager";
  const loCompany = loanOfficer?.company || "Cornerstone First Mortgage";
  const loNmls = loanOfficer?.nmlsId ? `NMLS #${loanOfficer.nmlsId}` : "NMLS #288455";
  const loPhone = loanOfficer?.phone || "(541) 729-0819";
  const loEmail = loanOfficer?.email || "fordmj@gmail.com";
  const loWebsite = loanOfficer?.websiteUrl || "https://cfmtg.com/mford/";

  const pageWidth = doc.internal.pageSize.getWidth(); // 612
  const pageHeight = doc.internal.pageSize.getHeight(); // 792
  const margin = 36;
  const contentWidth = pageWidth - margin * 2; // 540

  const data = getFlyerProgramData(flyer);

  // Background subtle tint
  doc.setFillColor(252, 252, 250);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // 1. TOP HEADER BRANDING BAR
  // Primary dark forest green banner
  doc.setFillColor(45, 54, 46); // #2D362E
  doc.rect(0, 0, pageWidth, 56, "F");

  // Secondary accent stripe below banner
  doc.setFillColor(193, 140, 93); // #C18C5D
  doc.rect(0, 56, pageWidth, 4, "F");

  // Header Title & Subtitle
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(loCompany.toUpperCase(), margin, 24);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(234, 231, 224);
  doc.text("Specialized Residential Mortgage Programs & Homebuyer Grant Solutions", margin, 38);

  // Header Right Side Contact Info
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`${loName} • ${loNmls}`, pageWidth - margin, 24, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(193, 140, 93); // gold/bronze
  doc.text(`${loPhone}  |  ${loEmail}`, pageWidth - margin, 38, { align: "right" });

  let y = 74;

  // 2. HERO TITLE & CATEGORY BADGE
  // Badge
  doc.setFillColor(74, 93, 78); // #4A5D4E
  doc.roundedRect(margin, y, 220, 18, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(data.heroBadge, margin + 8, y + 12);

  if (leadName) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(100, 115, 100);
    doc.text(`PREPARED EXCLUSIVELY FOR: ${leadName.toUpperCase()}`, pageWidth - margin, y + 12, {
      align: "right",
    });
  }

  y += 26;

  // Big Bold Hero Title
  doc.setTextColor(30, 38, 32);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(17);
  doc.text(data.heroTitle, margin, y + 4);

  y += 20;

  // Tagline
  doc.setTextColor(96, 108, 93); // #606C5D
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9.5);
  doc.text(data.tagline, margin, y + 2);

  y += 18;

  // Divider line
  doc.setDrawColor(220, 215, 205);
  doc.setLineWidth(0.75);
  doc.line(margin, y, pageWidth - margin, y);

  y += 14;

  // 3. KEY HIGHLIGHTS & BENEFIT BULLETS (LEFT COLUMN / MAIN BOX)
  const boxWidth = contentWidth;
  const benefitsBoxHeight = 148;

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, y, boxWidth, benefitsBoxHeight, 6, 6, "F");
  doc.setDrawColor(230, 226, 218);
  doc.roundedRect(margin, y, boxWidth, benefitsBoxHeight, 6, 6, "S");

  // Box Header Strip
  doc.setFillColor(245, 243, 237);
  doc.roundedRect(margin, y, boxWidth, 24, 6, 6, "F");
  doc.rect(margin, y + 12, boxWidth, 12, "F"); // square bottom corners
  doc.setDrawColor(230, 226, 218);
  doc.line(margin, y + 24, margin + boxWidth, y + 24);

  doc.setTextColor(45, 54, 46);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("PROGRAM HIGHLIGHTS & HOMEBUYER ADVANTAGES", margin + 12, y + 16);

  // Bullets
  let bulletY = y + 40;
  data.keyBenefits.forEach((b) => {
    // Green bullet dot
    doc.setFillColor(74, 93, 78);
    doc.circle(margin + 16, bulletY - 3, 2.5, "F");

    doc.setTextColor(45, 54, 46);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);

    const split = doc.splitTextToSize(b, boxWidth - 36);
    doc.text(split, margin + 26, bulletY);
    bulletY += split.length * 11 + 4;
  });

  y += benefitsBoxHeight + 12;

  // 4. SPECS / FINANCING MATRIX (GRID ROW)
  const specCount = data.specs.length;
  const specWidth = (boxWidth - (specCount - 1) * 8) / specCount;
  const specHeight = 44;

  data.specs.forEach((sp, i) => {
    const sx = margin + i * (specWidth + 8);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(sx, y, specWidth, specHeight, 4, 4, "F");
    doc.setDrawColor(215, 220, 215);
    doc.roundedRect(sx, y, specWidth, specHeight, 4, 4, "S");

    // Top subtle bar
    doc.setFillColor(74, 93, 78);
    doc.rect(sx, y, specWidth, 3, "F");

    doc.setTextColor(110, 120, 110);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text(sp.label.toUpperCase(), sx + 6, y + 14);

    doc.setTextColor(35, 45, 35);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    const valSplit = doc.splitTextToSize(sp.value, specWidth - 10);
    doc.text(valSplit, sx + 6, y + 26);
  });

  y += specHeight + 12;

  // 5. BUYDOWN TABLE OR ELIGIBILITY / HOW IT WORKS SECTION
  if (data.tableData) {
    // Draw rate comparison table
    const tableH = 76;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, y, boxWidth, tableH, 5, 5, "F");
    doc.setDrawColor(220, 215, 205);
    doc.roundedRect(margin, y, boxWidth, tableH, 5, 5, "S");

    // Table Header
    doc.setFillColor(74, 93, 78);
    doc.roundedRect(margin, y, boxWidth, 20, 5, 5, "F");
    doc.rect(margin, y + 10, boxWidth, 10, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);

    const colWidth = boxWidth / data.tableData.cols.length;
    data.tableData.cols.forEach((col, cIdx) => {
      doc.text(col, margin + cIdx * colWidth + 8, y + 13);
    });

    let rowY = y + 34;
    data.tableData.rows.forEach((row, rIdx) => {
      if (rIdx % 2 === 1) {
        doc.setFillColor(248, 247, 244);
        doc.rect(margin + 1, rowY - 10, boxWidth - 2, 16, "F");
      }
      doc.setTextColor(45, 54, 46);
      doc.setFont("helvetica", rIdx === 0 ? "bold" : "normal");
      doc.setFontSize(8);
      row.forEach((cell, cIdx) => {
        if (cIdx === 3 && cell.includes("SAVE")) {
          doc.setTextColor(193, 140, 93); // highlight savings
          doc.setFont("helvetica", "bold");
        } else {
          doc.setTextColor(45, 54, 46);
          doc.setFont("helvetica", "normal");
        }
        doc.text(cell, margin + cIdx * colWidth + 8, rowY);
      });
      rowY += 17;
    });

    y += tableH + 12;
  } else {
    // Standard Eligibility & Underwriting Box
    const eligHeight = 76;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, y, boxWidth, eligHeight, 5, 5, "F");
    doc.setDrawColor(225, 220, 210);
    doc.roundedRect(margin, y, boxWidth, eligHeight, 5, 5, "S");

    doc.setFillColor(248, 246, 240);
    doc.roundedRect(margin, y, boxWidth, 20, 5, 5, "F");
    doc.rect(margin, y + 10, boxWidth, 10, "F");
    doc.setDrawColor(225, 220, 210);
    doc.line(margin, y + 20, margin + boxWidth, y + 20);

    doc.setTextColor(45, 54, 46);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("QUALIFICATION GUIDELINES & NEXT STEPS", margin + 10, y + 14);

    let eY = y + 33;
    data.eligibilityNotes.forEach((note) => {
      doc.setFillColor(193, 140, 93);
      doc.circle(margin + 14, eY - 2.5, 2, "F");

      doc.setTextColor(60, 70, 60);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      const sp = doc.splitTextToSize(note, boxWidth - 30);
      doc.text(sp, margin + 22, eY);
      eY += sp.length * 10 + 3;
    });

    y += eligHeight + 12;
  }

  // 6. LOAN OFFICER ADVICE & MARKET SPOTLIGHT (CO-BRANDED / LOCAL CONTEXT)
  const pitchHeight = 62;
  doc.setFillColor(245, 248, 245); // light sage tint
  doc.roundedRect(margin, y, boxWidth, pitchHeight, 5, 5, "F");
  doc.setDrawColor(180, 200, 185);
  doc.roundedRect(margin, y, boxWidth, pitchHeight, 5, 5, "S");

  doc.setTextColor(45, 54, 46);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("EXPERT LOAN OFFICER ADVISORY", margin + 10, y + 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(50, 60, 50);
  const pitchLines = doc.splitTextToSize(data.loanOfficerPitch, boxWidth - 20);
  doc.text(pitchLines, margin + 10, y + 27);

  if (agent) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(74, 93, 78);
    doc.text(
      `In Partnership with: ${agent.name} (${agent.brokerage}) • Phone: ${agent.phone} • Email: ${agent.email}`,
      margin + 10,
      y + pitchHeight - 8
    );
  } else {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(120, 130, 120);
    doc.text(
      `Targeting qualifying properties across ${targetCity}${properties.length > 0 ? ` (${properties.length} active listings identified)` : ""} and surrounding regional markets.`,
      margin + 10,
      y + pitchHeight - 8
    );
  }

  y += pitchHeight + 12;

  // 7. BOTTOM FOOTER & COMPLIANCE BOX
  const footerHeight = pageHeight - y - margin;
  doc.setFillColor(45, 54, 46); // #2D362E
  doc.roundedRect(margin, y, boxWidth, footerHeight, 6, 6, "F");

  // Inside Footer Left: LO Card
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text(loName, margin + 14, y + 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(215, 210, 200);
  doc.text(`${loTitle}  |  ${loNmls}`, margin + 14, y + 30);
  doc.text(`${loCompany}  |  Licensed in OR, WA, CA, ID, AZ`, margin + 14, y + 42);

  // Inside Footer Right: Contact Details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(193, 140, 93); // Gold
  doc.text(`Direct: ${loPhone}`, margin + boxWidth - 14, y + 18, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`Email: ${loEmail}`, margin + boxWidth - 14, y + 30, { align: "right" });
  doc.text(`Web: ${loWebsite.replace(/^https?:\/\//, "")}`, margin + boxWidth - 14, y + 42, { align: "right" });

  // Compliance Line
  doc.setDrawColor(70, 80, 70);
  doc.line(margin + 14, y + 50, margin + boxWidth - 14, y + 50);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(180, 190, 180);
  const legalText =
    "EQUAL HOUSING LENDER. All loans subject to credit and property underwriting approval. Rates, terms, and program guidelines are subject to change without notice. Not all borrowers will qualify. This marketing material is prepared for real estate professionals and consumer informational purposes only and does not constitute a commitment to lend.";
  const legalLines = doc.splitTextToSize(legalText, boxWidth - 28);
  doc.text(legalLines, margin + 14, y + 60);
}

/**
 * Triggers a robust, browser-compatible download of a jsPDF instance as a genuine .pdf file.
 * Handles iframe constraints, blob conversion, and clean URL revocation.
 */
export function savePdfDocument(doc: jsPDF, filename: string): void {
  const safeFilename = filename.toLowerCase().endsWith(".pdf") ? filename : `${filename}.pdf`;
  try {
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = safeFilename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
      URL.revokeObjectURL(url);
    }, 3000);
  } catch (err) {
    console.warn("Direct blob anchor download failed, attempting doc.save fallback:", err);
    doc.save(safeFilename);
  }
}

/**
 * Generates an authentic, professionally styled mortgage marketing flyer PDF.
 */
export function generateFlyerPDF(
  flyer: MarketingFlyer,
  options: FlyerPdfOptions = {}
): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter", // 612 x 792 pt
  });
  renderFlyerOnDoc(doc, flyer, options);
  return doc;
}

/**
 * Generates a unified multi-page PDF booklet containing multiple marketing flyers.
 */
export function generateFlyersPacketPDF(
  flyers: MarketingFlyer[],
  options: FlyerPdfOptions = {}
): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
  });
  flyers.forEach((flyer, index) => {
    if (index > 0) {
      doc.addPage("letter", "portrait");
    }
    renderFlyerOnDoc(doc, flyer, options);
  });
  return doc;
}

/**
 * Downloads a single marketing flyer as a high-resolution, genuine .pdf file.
 */
export function downloadFlyerPDF(
  flyer: MarketingFlyer,
  options: FlyerPdfOptions = {}
): void {
  const doc = generateFlyerPDF(flyer, options);
  
  // Clean filename ensuring .pdf extension
  const baseName = (flyer.filename || flyer.name || "Mortgage_Program_Flyer")
    .replace(/\.(txt|jpg|png|jpeg)$/i, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_");
  
  const finalFilename = baseName.endsWith(".pdf") ? baseName : `${baseName}.pdf`;
  savePdfDocument(doc, finalFilename);
}

/**
 * Downloads multiple marketing flyers. When multiple flyers are provided,
 * bundles them into a multi-page PDF booklet to prevent browser popup blockers.
 */
export function downloadMultipleFlyersPDF(
  flyers: MarketingFlyer[],
  options: FlyerPdfOptions = {}
): void {
  if (!flyers || flyers.length === 0) return;

  if (flyers.length === 1) {
    downloadFlyerPDF(flyers[0], options);
    return;
  }

  const doc = generateFlyersPacketPDF(flyers, options);
  const dateStr = new Date().toISOString().slice(0, 10);
  savePdfDocument(doc, `Mortgage_Marketing_Flyers_Packet_${dateStr}.pdf`);
}

/**
 * Generates an authentic, professionally formatted Property Datasheet & Flyer Summary PDF
 * for email attachments.
 */
export function generateDatasheetPDF(options: {
  properties: PropertyListing[];
  flyers: MarketingFlyer[];
  loanOfficer?: LoanOfficerProfile;
  agent?: RealEstateAgentProfile;
  leadName?: string;
}): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
  });

  const { properties, flyers, loanOfficer, agent, leadName } = options;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;
  const contentWidth = pageWidth - margin * 2;

  const loName = loanOfficer?.name || "Mike Ford";
  const loCompany = loanOfficer?.company || "Cornerstone First Mortgage";
  const loNmls = loanOfficer?.nmlsId ? `NMLS #${loanOfficer.nmlsId}` : "NMLS #288455";
  const loPhone = loanOfficer?.phone || "(541) 316-0444";
  const loEmail = loanOfficer?.email || "fordmj@gmail.com";

  // Background
  doc.setFillColor(252, 252, 250);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Top header banner
  doc.setFillColor(45, 54, 46);
  doc.rect(0, 0, pageWidth, 54, "F");
  doc.setFillColor(193, 140, 93);
  doc.rect(0, 54, pageWidth, 3, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(loCompany.toUpperCase(), margin, 24);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(230, 225, 215);
  doc.text("Official Client Property Datasheet & Program Verification", margin, 38);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text(`${loName} • ${loNmls}`, pageWidth - margin, 24, { align: "right" });
  doc.setTextColor(193, 140, 93);
  doc.text(`${loPhone}  |  ${loEmail}`, pageWidth - margin, 38, { align: "right" });

  let y = 72;

  // Title Box
  doc.setTextColor(45, 54, 46);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("FEATURED PROPERTY SPECIFICATIONS & FINANCING OVERLAY", margin, y);

  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 110, 100);
  const partnerInfo = agent ? `  •  Co-marketing Partner: ${agent.name} (${agent.company || "Real Estate"})` : "";
  const sub = leadName
    ? `Prepared for: ${leadName}${partnerInfo}  •  Date: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
    : `Date: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}${partnerInfo}  •  Bend & Redmond Area Listings`;
  doc.text(sub, margin, y);

  y += 18;

  // Property Cards
  const displayProps = properties.slice(0, 4);
  displayProps.forEach((p, idx) => {
    const cardH = 58;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, y, contentWidth, cardH, 4, 4, "F");
    doc.setDrawColor(225, 220, 210);
    doc.roundedRect(margin, y, contentWidth, cardH, 4, 4, "S");

    // Left accent bar
    doc.setFillColor(74, 93, 78);
    doc.rect(margin, y, 4, cardH, "F");

    // Title / Address
    doc.setTextColor(45, 54, 46);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text(`#${idx + 1}. ${p.address}, ${p.city}, ${p.state} ${p.zip}`, margin + 12, y + 16);

    // Price (Phase 1B: Null guarded)
    doc.setTextColor(193, 140, 93);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    const priceText = p.price ? `$${p.price.toLocaleString()}` : "Price unavailable";
    doc.text(priceText, pageWidth - margin - 12, y + 16, { align: "right" });

    // Details (Phase 1B: Null guarded)
    doc.setTextColor(90, 100, 90);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const bedsText = p.beds != null ? `${p.beds} Beds` : "— Beds";
    const bathsText = p.baths != null ? `${p.baths} Baths` : "— Baths";
    const sqftText = p.sqft != null ? `${p.sqft.toLocaleString()} Sq Ft` : "— Sq Ft";
    doc.text(
      `${bedsText}  |  ${bathsText}  |  ${sqftText}  |  Status: ${p.status || "Active"}`,
      margin + 12,
      y + 30
    );

    // Overlay Eligibility Badges
    const usdaText = p.overlayEligibility?.usda ? "USDA 100% Eligible Zone" : "Standard Zone";
    const fhText = p.overlayEligibility?.firstHomeEligible ? "FirstHome $15K Grant Qualified" : "Standard Conventional/FHA";
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(74, 93, 78);
    doc.text(`Financing Specs: [${usdaText}]  •  [${fhText}]`, margin + 12, y + 46);

    y += cardH + 8;
  });

  // Attached Flyers Section
  if (flyers && flyers.length > 0) {
    y += 8;
    doc.setTextColor(45, 54, 46);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`ATTACHED MARKETING FLYERS & GUIDES (${flyers.length})`, margin, y);

    y += 14;
    flyers.forEach((f, i) => {
      doc.setFillColor(245, 245, 240);
      doc.roundedRect(margin, y, contentWidth, 34, 4, 4, "F");
      doc.setDrawColor(220, 215, 205);
      doc.roundedRect(margin, y, contentWidth, 34, 4, 4, "S");

      doc.setTextColor(45, 54, 46);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text(`Flyer #${i + 1}: ${f.name} [${f.fileType.toUpperCase()}]`, margin + 10, y + 14);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 110, 100);
      doc.text(`Category: ${f.category}  |  File: ${f.filename}  |  ${f.description}`, margin + 10, y + 26);

      y += 40;
    });
  }

  // Footer
  const footerY = pageHeight - 56;
  doc.setFillColor(45, 54, 46);
  doc.rect(0, footerY, pageWidth, 56, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(`${loCompany}  •  ${loName} (${loNmls})`, margin, footerY + 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(200, 210, 200);
  doc.text(`Direct: ${loPhone}  |  Email: ${loEmail}  |  Equal Housing Lender`, margin, footerY + 34);

  return doc;
}

/**
 * Downloads the Property Datasheet as a clean, genuine PDF file.
 */
export function downloadDatasheetPDF(options: {
  properties: PropertyListing[];
  flyers: MarketingFlyer[];
  loanOfficer?: LoanOfficerProfile;
  agent?: RealEstateAgentProfile;
  leadName?: string;
}): void {
  const doc = generateDatasheetPDF(options);
  const dateStr = new Date().toISOString().slice(0, 10);
  savePdfDocument(doc, `Property_Financing_Datasheet_${dateStr}.pdf`);
}

export interface EmailDraftPdfOptions {
  subject: string;
  bodyText: string;
  leadName?: string;
  agent?: RealEstateAgentProfile;
  loanOfficer?: LoanOfficerProfile;
  properties?: PropertyListing[];
  targetCity?: string;
}

/**
 * Generates an executive letterhead PDF proposal representing the crafted email draft,
 * pre-approval strategy blueprint, co-branded officer/agent team, and property highlights.
 */
export function generateEmailDraftPDF(options: EmailDraftPdfOptions): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter", // 612 x 792 pt
  });

  const {
    subject,
    bodyText,
    leadName,
    agent,
    loanOfficer,
    properties = [],
    targetCity = "Bend & Redmond, OR",
  } = options;

  const loName = loanOfficer?.name || "Mike Ford";
  const loTitle = loanOfficer?.title || "Senior Loan Officer | Producing Branch Manager";
  const loCompany = loanOfficer?.company || "Cornerstone First Mortgage";
  const loNmls = loanOfficer?.nmlsId ? `NMLS #${loanOfficer.nmlsId}` : "NMLS #288455";
  const loPhone = loanOfficer?.phone || "(541) 729-0819";
  const loEmail = loanOfficer?.email || "fordmj@gmail.com";

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;
  const contentWidth = pageWidth - margin * 2;

  // Background
  doc.setFillColor(252, 252, 250);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // Top header banner
  doc.setFillColor(45, 54, 46);
  doc.rect(0, 0, pageWidth, 54, "F");
  doc.setFillColor(193, 140, 93);
  doc.rect(0, 54, pageWidth, 4, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(loCompany.toUpperCase(), margin, 24);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(230, 227, 220);
  doc.text("First-Time Homebuyer Strategy & Pre-Approval Blueprint", margin, 38);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`${loName} • ${loNmls}`, pageWidth - margin, 24, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(230, 227, 220);
  doc.text(`Direct: ${loPhone}`, pageWidth - margin, 38, { align: "right" });

  let currentY = 72;

  // Metadata Card (Prepared For, Partner, Date)
  doc.setFillColor(244, 242, 235);
  doc.roundedRect(margin, currentY, contentWidth, 38, 4, 4, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(45, 54, 46);
  doc.text(`Prepared for: ${leadName || "Prospective Homebuyer"}`, margin + 12, currentY + 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(96, 108, 93);
  const partnerText = agent
    ? `Co-Marketing Partner: ${agent.name} (${agent.company || "Real Estate"})`
    : "Realtor Partner Co-Branded Outreach";
  doc.text(partnerText, margin + 12, currentY + 28);

  const dateStr = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  doc.text(`Date: ${dateStr}`, pageWidth - margin - 12, currentY + 16, { align: "right" });
  doc.text(
    `Market: ${targetCity}${properties.length > 0 ? ` (${properties.length} homes)` : ""}`,
    pageWidth - margin - 12,
    currentY + 28,
    { align: "right" }
  );

  currentY += 46;

  // Subject Box
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(234, 231, 224);
  doc.setLineWidth(1);
  doc.roundedRect(margin, currentY, contentWidth, 28, 4, 4, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(45, 54, 46);
  doc.text(`Subject: ${subject}`, margin + 10, currentY + 18);

  currentY += 38;

  // Render Body Paragraphs
  const cleanBody = bodyText
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

  const paragraphs = cleanBody.split(/\n\s*\n/);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(50, 55, 50);

  paragraphs.forEach((para) => {
    const trimmed = para.trim();
    if (!trimmed) return;

    const isHeader =
      trimmed.startsWith("YOUR DEDICATED") ||
      trimmed.startsWith("RECENT LOW") ||
      trimmed.startsWith("FINANCING ADVANTAGE") ||
      trimmed.startsWith("NEXT STEPS");

    if (isHeader) {
      currentY += 4;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(45, 54, 46);
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(60, 65, 60);
    }

    const lines = doc.splitTextToSize(trimmed, contentWidth - 14);

    if (currentY + lines.length * 11 > pageHeight - 90) {
      doc.addPage("letter", "portrait");
      currentY = 40;
      doc.setFillColor(45, 54, 46);
      doc.rect(0, 0, pageWidth, 28, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(`${loCompany}  •  ${subject.slice(0, 50)}...`, margin, 18);
      currentY += 16;
    }

    doc.text(lines, margin + 6, currentY);
    currentY += lines.length * 11 + 7;
  });

  // Footer / LO info
  const footerY = pageHeight - 54;
  doc.setFillColor(45, 54, 46);
  doc.rect(0, footerY, pageWidth, 54, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text(`${loCompany}  •  ${loName} - ${loTitle} (${loNmls})`, margin, footerY + 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(200, 210, 200);
  doc.text(`Direct: ${loPhone}  |  Email: ${loEmail}  |  Equal Housing Lender`, margin, footerY + 34);

  return doc;
}

/**
 * Downloads the complete Email Draft & Pre-Approval Strategy Proposal as a genuine PDF.
 */
export function downloadEmailDraftPDF(options: EmailDraftPdfOptions): void {
  const doc = generateEmailDraftPDF(options);
  const dateStr = new Date().toISOString().slice(0, 10);
  savePdfDocument(doc, `Homebuyer_PreApproval_Proposal_${dateStr}.pdf`);
}
