import { Request } from 'express';

// Auth types
export interface JwtPayload {
  userId: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// User profile data structure
export interface UserProfileData {
  expertise?: string[];
  funding?: string;
  followers?: number;
  linkedInUrl?: string;
  company?: string;
  experience?: string;
  industries?: string[];
}

// Analysis section types
export type AnalysisSectionType =
  | 'education'
  | 'swot'
  | 'features'
  | 'business_values'
  | 'pmf'
  | 'next_steps'
  | 'viability';

// Analysis content structures
export interface EducationContent {
  keywords: string[];
  terminology: Record<string, string>;
  industryOverview: string;
}

export interface SwotContent {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  personalizedInsights: string;
}

export interface FeaturesContent {
  features: string[];
  competitiveAnalysis: {
    competitor: string;
    features: Record<string, boolean>;
  }[];
}

export interface BusinessValuesContent {
  moats: string[];
  targetMarket: {
    segments: string[];
    size: string;
    description: string;
  };
  pricingStrategies: {
    model: string;
    rationale: string;
  }[];
  timelineToMarket: string;
}

export interface PmfContent {
  strategies: {
    title: string;
    description: string;
    effort: 'low' | 'medium' | 'high';
    timeline: string;
  }[];
}

export interface NextStepsContent {
  steps: {
    title: string;
    description: string;
    priority: number;
    estimatedTime: string;
  }[];
}

export interface ViabilityContent {
  score: number; // 0-100
  factors: {
    category: string;
    score: number;
    reasoning: string;
  }[];
  overallAssessment: string;
}
