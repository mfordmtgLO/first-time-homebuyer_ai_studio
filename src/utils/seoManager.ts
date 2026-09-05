import { PublicWebsiteMetadata } from "../types";
import { db } from "../firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export const DEFAULT_SEO_METADATA: PublicWebsiteMetadata = {
  metaTitle: "First-Time Homebuyer Roadmap | Oregon Down Payment Grants & Calculators",
  metaDescription: "Interactive Oregon first-time homebuyer roadmap. Calculate monthly payments, find $10,000+ DPA grants, USDA 0% down loans, and connect with trusted local lenders.",
  keywords: "first time home buyer, Oregon down payment assistance, mortgage calculator, Portland home loan, USDA zero down, OHCS grant, 2-1 buydown, Eugene mortgage lender, Bend OR home loan, FHA DPA",
  canonicalUrl: "",
  robots: "index, follow",
  author: "Cascade Financial Mortgage - Mike Ford Team",

  // Open Graph
  ogTitle: "First-Time Homebuyer Roadmap & Oregon Grant Finder",
  ogDescription: "Smart first-time homebuyer roadmap, real-time mortgage calculators, county down payment grants, and AI homebuying advisor.",
  ogImage: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&h=630&q=80",
  ogType: "website",
  ogSiteName: "First-Time Homebuyer Roadmap",

  // Twitter
  twitterCard: "summary_large_image",
  twitterTitle: "First-Time Homebuyer Roadmap & Down Payment Grants",
  twitterDescription: "Calculate monthly mortgage payments, discover zero-down grant programs, and pre-qualify online.",
  twitterImage: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&h=630&q=80",
  twitterSite: "@CFMTG",

  // Structured Data
  enableStructuredData: true,
  businessName: "Cascade Financial Mortgage - Mike Ford Team",
  nmlsId: "NMLS #123456",
  phone: "(503) 555-0192",
  city: "Portland",
  state: "OR",
  postalCode: "97201",
  streetAddress: "1211 SW 5th Ave, Suite 2100"
};

export interface SeoPresetTemplate {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  targetGoal: string;
  metadata: Partial<PublicWebsiteMetadata>;
}

export const SEO_PRESET_TEMPLATES: SeoPresetTemplate[] = [
  {
    id: "grant_focus",
    name: "Down Payment & Cash Grants Focus",
    badge: "Highest CTR",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300",
    targetGoal: "Target homebuyers searching for down payment money, state grants, and zero down loans.",
    metadata: {
      metaTitle: "Oregon Down Payment Assistance 2026 | First-Time Buyer Grants ($10k-$30k)",
      metaDescription: "Qualify for $10,000 to $30,000 in Oregon down payment grants & USDA 0% down financing. Check county eligibility caps and calculate your payment in 60 seconds.",
      keywords: "Oregon down payment assistance, first time homebuyer grants, OHCS FirstHome, USDA zero down Oregon, down payment help Portland, forgivable mortgage grant",
      ogTitle: "Get Up to $30,000 in Oregon Down Payment Grants | Instant Eligibility Check",
      ogDescription: "Free grant eligibility screener for Oregon homebuyers. See if your target home qualifies for zero down payment or forgivable DPA funds.",
      ogImage: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1200&h=630&q=80",
      twitterTitle: "Oregon Down Payment Assistance 2026 | First-Time Buyer Grants",
      twitterDescription: "Qualify for $10,000 to $30,000 in Oregon down payment grants & USDA 0% down financing."
    }
  },
  {
    id: "calculator_buydown",
    name: "Mortgage Calculators & 2-1 Buydown",
    badge: "Rate Sensitive",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
    targetGoal: "Target monthly payment shoppers comparing interest rate options, 2-1 buydowns, and closing costs.",
    metadata: {
      metaTitle: "Oregon Mortgage Payment Calculator | 2-1 Buydown & Rate Tool 2026",
      metaDescription: "Accurately estimate principal, interest, taxes, PMI & HOA for Oregon homes. Compare 2-1 temporary buydowns and calculate your true monthly cash-to-close.",
      keywords: "Oregon mortgage calculator, 2-1 buydown calculator, monthly payment estimator, Portland mortgage rates, closing costs Oregon, PITI calculator",
      ogTitle: "Calculate Your True Oregon Mortgage Payment | 2-1 Buydown Tool",
      ogDescription: "Interactive payment calculator with live Oregon property tax rates, homeowner insurance estimates, and 2-1 buydown savings breakdown.",
      ogImage: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&h=630&q=80",
      twitterTitle: "Calculate Your Oregon Mortgage Payment with 2-1 Buydown",
      twitterDescription: "Interactive calculator with property taxes, homeowner insurance estimates, and rate savings."
    }
  },
  {
    id: "local_realtor_network",
    name: "Realtor Partner & Local Oregon Market",
    badge: "Local Authority",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
    targetGoal: "Target local community searches across Portland, Eugene, Bend, and Salem with high-credibility local teams.",
    metadata: {
      metaTitle: "First-Time Homebuyer Roadmap | Local Oregon Lenders & Realtors",
      metaDescription: "Navigate the Oregon housing market with confidence. Connect with vetted local Realtors and Loan Officers for low-down payment and turn-key home loans.",
      keywords: "Oregon real estate partners, Portland homebuyer guide, Mike Ford mortgage, local Oregon loan officer, co-branded home buying, Bend real estate lender",
      ogTitle: "Your Step-by-Step Oregon Homebuying Roadmap & Local Team",
      ogDescription: "Everything you need to buy a home in Oregon: verified grant listings, tour scorecards, and direct connection with top local mortgage advisors.",
      ogImage: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&h=630&q=80",
      twitterTitle: "First-Time Homebuyer Roadmap | Local Oregon Team",
      twitterDescription: "Navigate the Oregon housing market with confidence and connect with vetted local mortgage advisors."
    }
  },
  {
    id: "zero_down_usda",
    name: "0% Down Payment & USDA 100% Financing",
    badge: "Zero Down",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
    targetGoal: "Target prospective buyers who have zero savings for down payment and need 100% loan-to-value solutions.",
    metadata: {
      metaTitle: "0% Down Payment Mortgages Oregon | USDA 100% Financing & DPA",
      metaDescription: "Buy a home in Oregon with zero down payment. Explore 100% USDA financing, Lakeview Community Seconds, and forgivable grants across all 36 Oregon counties.",
      keywords: "zero down payment mortgage Oregon, 100 percent financing, USDA rural housing Oregon, no money down home loan, zero down Oregon home",
      ogTitle: "Buy an Oregon Home with $0 Down | 100% Financing Guide",
      ogDescription: "Search zero-down eligible homes across Oregon. See qualifying income limits, county price caps, and monthly payment estimates.",
      ogImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&h=630&q=80",
      twitterTitle: "Buy an Oregon Home with $0 Down | 100% Financing Guide",
      twitterDescription: "Explore 100% USDA financing, Lakeview Community Seconds, and forgivable grants across all 36 counties."
    }
  }
];

export const CURATED_OG_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&h=630&q=80",
    label: "Warm Modern Home & Welcome Key",
    tag: "High Trust"
  },
  {
    url: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1200&h=630&q=80",
    label: "Pacific Northwest Craftsman Home",
    tag: "Oregon Style"
  },
  {
    url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&h=630&q=80",
    label: "Financial Roadmap & Home Planning",
    tag: "Calculator / Financial"
  },
  {
    url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&h=630&q=80",
    label: "Scenic Suburban Residence",
    tag: "Suburban / DPA"
  }
];

/**
 * Updates DOM title and all HTML <meta>, <link>, and <script type="application/ld+json"> tags
 */
export function applyMetadataToDocument(metadata: PublicWebsiteMetadata): void {
  if (typeof document === "undefined") return;

  const currentUrl = metadata.canonicalUrl || (typeof window !== "undefined" ? window.location.href.split("?")[0] : "");

  // 1. Browser Title
  if (metadata.metaTitle) {
    document.title = metadata.metaTitle;
  }

  // 2. Helper to set or create meta tag
  const setMeta = (attributeName: string, attributeValue: string, content: string) => {
    if (!content) return;
    let element = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
    if (!element) {
      element = document.createElement("meta");
      element.setAttribute(attributeName, attributeValue);
      document.head.appendChild(element);
    }
    element.setAttribute("content", content);
  };

  // Standard SEO tags
  setMeta("name", "title", metadata.metaTitle);
  setMeta("name", "description", metadata.metaDescription);
  if (metadata.keywords) setMeta("name", "keywords", metadata.keywords);
  if (metadata.robots) setMeta("name", "robots", metadata.robots);
  if (metadata.author) setMeta("name", "author", metadata.author);

  // Open Graph tags
  setMeta("property", "og:title", metadata.ogTitle || metadata.metaTitle);
  setMeta("property", "og:description", metadata.ogDescription || metadata.metaDescription);
  if (metadata.ogImage) setMeta("property", "og:image", metadata.ogImage);
  if (metadata.ogType) setMeta("property", "og:type", metadata.ogType);
  if (metadata.ogSiteName) setMeta("property", "og:site_name", metadata.ogSiteName);
  if (currentUrl) setMeta("property", "og:url", currentUrl);

  // Twitter Card tags
  setMeta("name", "twitter:card", metadata.twitterCard || "summary_large_image");
  setMeta("name", "twitter:title", metadata.twitterTitle || metadata.ogTitle || metadata.metaTitle);
  setMeta("name", "twitter:description", metadata.twitterDescription || metadata.ogDescription || metadata.metaDescription);
  if (metadata.twitterImage || metadata.ogImage) {
    setMeta("name", "twitter:image", metadata.twitterImage || metadata.ogImage);
  }
  if (metadata.twitterSite) setMeta("name", "twitter:site", metadata.twitterSite);

  // Canonical link tag
  if (currentUrl) {
    let canonicalLink = document.querySelector<HTMLLinkElement>("link[rel='canonical']");
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", currentUrl);
  }

  // Structured Data (JSON-LD)
  if (metadata.enableStructuredData) {
    let scriptTag = document.getElementById("schema-structured-data") as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement("script");
      scriptTag.id = "schema-structured-data";
      scriptTag.type = "application/ld+json";
      document.head.appendChild(scriptTag);
    }

    const jsonLdData = {
      "@context": "https://schema.org",
      "@type": ["FinancialService", "MortgageBroker"],
      "name": metadata.businessName || "Cascade Financial Mortgage - Mike Ford Team",
      "description": metadata.metaDescription,
      "url": currentUrl,
      "telephone": metadata.phone || "(503) 555-0192",
      "priceRange": "$$",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": metadata.streetAddress || "1211 SW 5th Ave, Suite 2100",
        "addressLocality": metadata.city || "Portland",
        "addressRegion": metadata.state || "OR",
        "postalCode": metadata.postalCode || "97201",
        "addressCountry": "US"
      },
      "areaServed": [
        {
          "@type": "State",
          "name": "Oregon"
        }
      ],
      "knowsAbout": [
        "First-Time Homebuyer Grants",
        "Down Payment Assistance",
        "FHA Home Loans",
        "USDA 100% Financing",
        "2-1 Interest Rate Buydown",
        "Oregon Mortgage Refinance"
      ],
      "hasCredential": metadata.nmlsId ? {
        "@type": "EducationalOccupationalCredential",
        "credentialCategory": "NMLS License",
        "recognizedBy": {
          "@type": "Organization",
          "name": "Nationwide Multistate Licensing System"
        },
        "identifier": metadata.nmlsId
      } : undefined
    };

    scriptTag.textContent = JSON.stringify(jsonLdData, null, 2);
  } else {
    const existingScript = document.getElementById("schema-structured-data");
    if (existingScript) {
      existingScript.remove();
    }
  }
}

/**
 * Fetches saved SEO metadata from Firestore with localStorage fallback
 */
export async function fetchSavedSeoMetadata(): Promise<PublicWebsiteMetadata> {
  // Try Firestore first
  try {
    const docSnap = await getDoc(doc(db, "app_settings", "global"));
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.seoMetadata) {
        return {
          ...DEFAULT_SEO_METADATA,
          ...data.seoMetadata
        };
      }
    }
  } catch (err) {
    console.warn("SeoManager: Firestore read notice:", err);
  }

  // Try LocalStorage
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem("public_site_seo_metadata");
      if (cached) {
        return {
          ...DEFAULT_SEO_METADATA,
          ...JSON.parse(cached)
        };
      }
    } catch (e) {
      console.warn("SeoManager: LocalStorage read notice:", e);
    }
  }

  return DEFAULT_SEO_METADATA;
}

/**
 * Saves SEO metadata to Firestore and localStorage, then applies immediately to DOM
 */
export async function persistSeoMetadata(
  metadata: PublicWebsiteMetadata,
  userIdentifier: string = "Branch Manager (Mike Ford)"
): Promise<void> {
  const payload: PublicWebsiteMetadata = {
    ...metadata,
    lastUpdated: new Date().toISOString(),
    updatedBy: userIdentifier
  };

  // 1. Save to LocalStorage immediately
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("public_site_seo_metadata", JSON.stringify(payload));
    } catch (e) {
      console.warn("LocalStorage save error:", e);
    }
  }

  // 2. Apply directly to document DOM
  applyMetadataToDocument(payload);

  // 3. Persist to Firestore
  try {
    await setDoc(
      doc(db, "app_settings", "global"),
      {
        seoMetadata: payload,
        metaTitle: payload.metaTitle,
        metaDescription: payload.metaDescription,
        ogTitle: payload.ogTitle,
        ogDescription: payload.ogDescription,
        ogImage: payload.ogImage,
        updatedAt: serverTimestamp(),
        lastUpdatedBy: userIdentifier
      },
      { merge: true }
    );
  } catch (err) {
    console.error("Failed to persist SEO metadata to Firestore:", err);
    throw err;
  }
}

export interface SeoHealthAuditItem {
  id: string;
  label: string;
  status: "pass" | "warning" | "fail";
  score: number;
  maxScore: number;
  message: string;
  recommendation?: string;
}

export interface SeoHealthReport {
  score: number;
  grade: "A+" | "A" | "B" | "C" | "Needs Attention";
  items: SeoHealthAuditItem[];
}

/**
 * Calculates real-time SEO & Social CTR Health Score (0-100)
 */
export function auditSeoMetadata(meta: PublicWebsiteMetadata): SeoHealthReport {
  const items: SeoHealthAuditItem[] = [];

  // 1. Title Length Audit (Optimal: 45 - 60 chars)
  const titleLen = (meta.metaTitle || "").trim().length;
  if (titleLen >= 45 && titleLen <= 60) {
    items.push({
      id: "title_len",
      label: "Title Length (Google SERP)",
      status: "pass",
      score: 20,
      maxScore: 20,
      message: `Optimal length (${titleLen} / 60 characters). Unlikely to be truncated in search results.`
    });
  } else if (titleLen > 60 && titleLen <= 70) {
    items.push({
      id: "title_len",
      label: "Title Length (Google SERP)",
      status: "warning",
      score: 14,
      maxScore: 20,
      message: `${titleLen} characters. Google typically truncates titles over 60 characters with ellipses (...).`,
      recommendation: "Trim to under 60 characters to ensure key keywords are always visible."
    });
  } else if (titleLen > 0 && titleLen < 45) {
    items.push({
      id: "title_len",
      label: "Title Length (Google SERP)",
      status: "warning",
      score: 12,
      maxScore: 20,
      message: `Short title (${titleLen} characters). You have room to add high-value keywords like 'Oregon Grants' or 'Mortgage Calculator'.`,
      recommendation: "Expand with targeted location or benefit keywords to maximize SERP prominence."
    });
  } else {
    items.push({
      id: "title_len",
      label: "Title Length (Google SERP)",
      status: "fail",
      score: 0,
      maxScore: 20,
      message: "Meta Title is empty. Critical SEO defect.",
      recommendation: "Add a compelling title of 50-60 characters."
    });
  }

  // 2. Description Length Audit (Optimal: 120 - 158 chars)
  const descLen = (meta.metaDescription || "").trim().length;
  if (descLen >= 120 && descLen <= 160) {
    items.push({
      id: "desc_len",
      label: "Meta Description Length",
      status: "pass",
      score: 20,
      maxScore: 20,
      message: `Optimal length (${descLen} / 160 characters). Rich summary with clear call-to-action.`
    });
  } else if (descLen > 160) {
    items.push({
      id: "desc_len",
      label: "Meta Description Length",
      status: "warning",
      score: 14,
      maxScore: 20,
      message: `${descLen} characters. Search engines will cut off descriptions exceeding 155-160 characters.`,
      recommendation: "Keep description between 120 and 158 characters so the entire call-to-action displays."
    });
  } else if (descLen > 0 && descLen < 120) {
    items.push({
      id: "desc_len",
      label: "Meta Description Length",
      status: "warning",
      score: 12,
      maxScore: 20,
      message: `Brief description (${descLen} characters). Search engines prefer descriptive answers for consumer queries.`,
      recommendation: "Add specific benefits like '$10,000+ DPA Grants' or 'USDA 0% Down'."
    });
  } else {
    items.push({
      id: "desc_len",
      label: "Meta Description Length",
      status: "fail",
      score: 0,
      maxScore: 20,
      message: "Meta Description is empty. Search engines will generate random excerpt snippet.",
      recommendation: "Write a high-converting description with a clear call-to-action."
    });
  }

  // 3. Open Graph Social Card Image
  const hasOgImage = Boolean(meta.ogImage && meta.ogImage.startsWith("http"));
  if (hasOgImage) {
    items.push({
      id: "og_image",
      label: "Open Graph Social Image",
      status: "pass",
      score: 20,
      maxScore: 20,
      message: "High-resolution social card image configured for Facebook, LinkedIn, and iMessage previews."
    });
  } else {
    items.push({
      id: "og_image",
      label: "Open Graph Social Image",
      status: "fail",
      score: 0,
      maxScore: 20,
      message: "Missing Open Graph image. Shared links will appear as plain text, drastically lowering click-through rates.",
      recommendation: "Select or input a 1200x630 pixel high-impact banner image."
    });
  }

  // 4. Keywords & Search Intent
  const keywordCount = (meta.keywords || "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean).length;
  if (keywordCount >= 5) {
    items.push({
      id: "keywords",
      label: "Search Intent Keywords",
      status: "pass",
      score: 15,
      maxScore: 15,
      message: `${keywordCount} targeted keywords configured covering loans, grants, and geographic areas.`
    });
  } else if (keywordCount >= 1) {
    items.push({
      id: "keywords",
      label: "Search Intent Keywords",
      status: "warning",
      score: 8,
      maxScore: 15,
      message: `Only ${keywordCount} keywords defined. Consider targeting long-tail first-time homebuyer search terms.`
    });
  } else {
    items.push({
      id: "keywords",
      label: "Search Intent Keywords",
      status: "fail",
      score: 0,
      maxScore: 15,
      message: "No keywords defined.",
      recommendation: "Add at least 5 keywords like 'Oregon down payment assistance', 'USDA 100% financing'."
    });
  }

  // 5. Social Card Branding (Twitter & Open Graph consistency)
  const hasOgTitle = Boolean(meta.ogTitle && meta.ogTitle.trim().length > 0);
  const hasTwitterCard = meta.twitterCard === "summary_large_image";
  if (hasOgTitle && hasTwitterCard) {
    items.push({
      id: "social_cards",
      label: "Social Card Visibility (Large Image)",
      status: "pass",
      score: 15,
      maxScore: 15,
      message: "Configured for large image card format on Twitter/X and high-converting Open Graph tags on iMessage and Facebook."
    });
  } else {
    items.push({
      id: "social_cards",
      label: "Social Card Visibility",
      status: "warning",
      score: 8,
      maxScore: 15,
      message: "Social tags are partially configured. 'summary_large_image' produces up to 3x higher click-throughs."
    });
  }

  // 6. Search Indexing Directives
  const isIndexed = !meta.robots || !meta.robots.includes("noindex");
  if (isIndexed) {
    items.push({
      id: "robots",
      label: "Search Engine Indexing",
      status: "pass",
      score: 10,
      maxScore: 10,
      message: "Site is fully crawlable by Googlebot and Bingbot (index, follow)."
    });
  } else {
    items.push({
      id: "robots",
      label: "Search Engine Indexing",
      status: "warning",
      score: 3,
      maxScore: 10,
      message: "Currently set to 'noindex'. Public search engines are instructed NOT to list the site.",
      recommendation: "Change robots directive to 'index, follow' when you want public organic search traffic."
    });
  }

  const totalScore = Math.min(100, items.reduce((acc, curr) => acc + curr.score, 0));
  let grade: SeoHealthReport["grade"] = "Needs Attention";
  if (totalScore >= 95) grade = "A+";
  else if (totalScore >= 85) grade = "A";
  else if (totalScore >= 75) grade = "B";
  else if (totalScore >= 60) grade = "C";

  return {
    score: totalScore,
    grade,
    items
  };
}
