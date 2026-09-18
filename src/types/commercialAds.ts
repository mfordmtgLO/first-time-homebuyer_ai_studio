export type AdPlatformType = 'meta' | 'google' | 'tiktok' | 'linkedin';

export interface CommercialScene {
  sceneNumber: number;
  timecode: string; // e.g. "0:00 - 0:05"
  visual: string;
  onScreenText: string;
  voiceover: string;
  audioCue: string;
  bRollPrompt?: string;
}

export interface AdDeploymentSpec {
  headline: string;
  primaryText: string;
  ctaButton: 'Learn More' | 'Apply Now' | 'Get Offer' | 'Calculate Payment' | 'Contact Us';
  suggestedBudget: number;
  suggestedPlacements: string[];
  targetLocations?: string[];
}

export interface CommercialScriptVariation {
  id: string; // "variation-1" | "variation-2" | "variation-3"
  title: string;
  angle: string;
  hook: string;
  targetAudience: string;
  platform: AdPlatformType;
  totalDuration: string; // "30s"
  scenes: CommercialScene[];
  fullVoiceoverScript: string;
  callToAction: string;
  disclaimer: string;
  adDeploymentSpec: AdDeploymentSpec;
}

export interface VantageStudioVoice {
  id: string;
  name: string;
  accent: string;
  gender: 'female' | 'male';
  description: string;
  previewSample?: string;
}

export type ElevenLabsVoice = VantageStudioVoice;

export interface AdDeploymentModalData {
  variation: CommercialScriptVariation;
  platform: 'meta' | 'google';
  campaignName: string;
  headline: string;
  primaryText: string;
  voiceoverScript: string;
  ctaButton: string;
  destinationUrl: string;
  dailyBudget: number;
  monthlyCap: number;
  specialHousingCategory: boolean;
  creditCardLast4?: string;
  adAccountId?: string;
  pixelOrConversionId?: string;
  targetCities?: string[];
}
