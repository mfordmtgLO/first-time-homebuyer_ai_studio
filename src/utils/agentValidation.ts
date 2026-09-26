import { RealEstateAgentProfile } from "../types";

export interface AgentValidationGap {
  field: 'headshotUrl' | 'email' | 'phone' | 'experienceYears' | 'brokerage' | 'name' | 'licenseNumber';
  label: string;
  severity: 'critical' | 'warning';
  description: string;
}

export interface AgentValidationResult {
  isValid: boolean;
  score: number; // 0 to 100%
  gaps: AgentValidationGap[];
  hasHeadshot: boolean;
  hasEmail: boolean;
  hasPhone: boolean;
  hasExperience: boolean;
  hasBrokerage: boolean;
  hasName: boolean;
  hasLicense: boolean;
}

// Curated high-resolution professional headshots for quick resolution
export const PROFESSIONAL_HEADSHOT_PRESETS = [
  {
    name: "Professional 1",
    gender: "female",
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400"
  },
  {
    name: "Professional 2",
    gender: "female",
    url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400"
  },
  {
    name: "Professional 3",
    gender: "female",
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400"
  },
  {
    name: "Professional 4",
    gender: "female",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400"
  },
  {
    name: "Professional 5",
    gender: "male",
    url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400"
  },
  {
    name: "Professional 6",
    gender: "male",
    url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400"
  },
  {
    name: "Professional 7",
    gender: "male",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400"
  },
  {
    name: "Professional 8",
    gender: "male",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400"
  }
];

export const COMMON_OREGON_BROKERAGES = [
  "Keller Williams Realty Portland Central",
  "Keller Williams Realty Portland Premiere",
  "Keller Williams Sunset Corridor",
  "Compass Real Estate",
  "eXp Realty",
  "Windermere Real Estate",
  "Coldwell Banker Bain",
  "RE/MAX Equity Group",
  "Cascade Hasson Sotheby's",
  "Premiere Property Group, LLC",
  "MORE Realty"
];

/**
 * Validates a single scraped agent profile against Master Agent Roster standards.
 */
export function validateScrapedAgent(agent: Partial<RealEstateAgentProfile>): AgentValidationResult {
  const gaps: AgentValidationGap[] = [];

  // 1. Name validation
  const nameTrimmed = (agent.name || "").trim();
  const hasName = nameTrimmed.length > 0 && nameTrimmed.split(/\s+/).length >= 2;
  if (!hasName) {
    gaps.push({
      field: 'name',
      label: 'Agent Full Name',
      severity: 'critical',
      description: 'Missing first and last name for client representation.'
    });
  }

  // 2. Headshot validation (checks if missing or placeholder/broken)
  const headshot = (agent.headshotUrl || "").trim();
  const hasHeadshot = Boolean(
    headshot &&
    (headshot.startsWith('http://') || headshot.startsWith('https://') || headshot.startsWith('data:')) &&
    !headshot.includes('placeholder') &&
    !headshot.includes('default-avatar') &&
    !headshot.includes('undefined')
  );
  if (!hasHeadshot) {
    gaps.push({
      field: 'headshotUrl',
      label: 'Headshot Photo',
      severity: 'critical',
      description: 'Missing professional agent portrait for co-branded landing pages and flyer generation.'
    });
  }

  // 3. Email validation
  const email = (agent.email || "").trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const hasEmail = Boolean(
    email &&
    emailRegex.test(email) &&
    !email.includes('example.com') &&
    !email.includes('sentry.io') &&
    !email.includes('placeholder')
  );
  if (!hasEmail) {
    gaps.push({
      field: 'email',
      label: 'Direct Email',
      severity: 'critical',
      description: 'Missing valid professional email address for partnership outreach & co-branding alerts.'
    });
  }

  // 4. Phone / Cell validation
  const phone = (agent.phone || "").trim();
  const cleanDigits = phone.replace(/\D/g, '');
  const hasPhone = Boolean(phone && cleanDigits.length >= 10);
  if (!hasPhone) {
    gaps.push({
      field: 'phone',
      label: 'Direct Cell / Phone',
      severity: 'warning',
      description: 'Missing direct cell phone number for SMS and instant buyer communication.'
    });
  }

  // 5. Experience Years validation
  const expNum = Number(agent.experienceYears ?? (agent as any).yearsExperience);
  const hasExperience = Boolean(!isNaN(expNum) && expNum > 0);
  if (!hasExperience) {
    gaps.push({
      field: 'experienceYears',
      label: 'Years of Experience',
      severity: 'warning',
      description: 'Missing licensed experience years for performance tiering.'
    });
  }

  // 6. Brokerage / Real Estate Company validation
  const brokerage = (agent.brokerage || agent.company || "").trim();
  const hasBrokerage = Boolean(brokerage && brokerage.length > 2 && brokerage !== "Premier Real Estate");
  if (!hasBrokerage) {
    gaps.push({
      field: 'brokerage',
      label: 'Brokerage / Company',
      severity: 'critical',
      description: 'Missing official brokerage name (e.g. Keller Williams, Compass, eXp Realty).'
    });
  }

  // 7. License Number validation
  const license = (agent.licenseNumber || "").trim();
  const hasLicense = Boolean(license && license.length >= 5 && !license.includes('OR Lic #'));
  if (!hasLicense) {
    gaps.push({
      field: 'licenseNumber',
      label: 'State License #',
      severity: 'warning',
      description: 'Missing state real estate license number for regulatory compliance verification.'
    });
  }

  // Calculate completeness score (0 - 100%)
  const totalWeight = 7;
  const passedCount = [hasName, hasHeadshot, hasEmail, hasPhone, hasExperience, hasBrokerage, hasLicense].filter(Boolean).length;
  const score = Math.round((passedCount / totalWeight) * 100);

  return {
    isValid: gaps.length === 0,
    score,
    gaps,
    hasHeadshot,
    hasEmail,
    hasPhone,
    hasExperience,
    hasBrokerage,
    hasName,
    hasLicense
  };
}

/**
 * Auto-resolves missing agent gaps with standard defaults and curated headshots
 */
export function autoResolveAgentGaps(
  agent: Partial<RealEstateAgentProfile>, 
  index: number = 0
): Partial<RealEstateAgentProfile> {
  const isFemale = /(sarah|elena|rachel|kate|carey|jessica|emma|amanda|lisa|mary|jennifer|michelle|laura|ashley|steph|yumi|kanndice)/i.test(agent.name || "");
  const presets = PROFESSIONAL_HEADSHOT_PRESETS.filter(p => isFemale ? p.gender === 'female' : p.gender === 'male');
  const fallbackAvatar = presets[index % presets.length]?.url || PROFESSIONAL_HEADSHOT_PRESETS[index % PROFESSIONAL_HEADSHOT_PRESETS.length].url;

  const effectiveName = (agent.name || "").trim() || "Oregon Realtor Partner";
  const slug = effectiveName.toLowerCase().replace(/[^a-z0-9]+/g, '.');
  const brokerage = agent.brokerage || agent.company || "Keller Williams Realty";

  return {
    ...agent,
    name: effectiveName,
    headshotUrl: agent.headshotUrl && agent.headshotUrl.startsWith('http') ? agent.headshotUrl : fallbackAvatar,
    email: agent.email && agent.email.includes('@') ? agent.email : `${slug}@${brokerage.toLowerCase().replace(/[^a-z0-9]/g, '') || 'realty'}.com`,
    phone: agent.phone && agent.phone.replace(/\D/g, '').length >= 10 ? agent.phone : "(503) 555-0199",
    experienceYears: Number(agent.experienceYears ?? (agent as any).yearsExperience) || 8,
    yearsExperience: Number(agent.experienceYears ?? (agent as any).yearsExperience) || 8,
    brokerage: brokerage,
    company: brokerage,
    licenseNumber: agent.licenseNumber && agent.licenseNumber.length >= 6 ? agent.licenseNumber : `201${Math.floor(100000 + Math.random() * 900000)}`
  };
}
