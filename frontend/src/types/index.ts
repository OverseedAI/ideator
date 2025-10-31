export interface User {
  id: string;
  email: string;
  name: string;
  profileData?: UserProfileData;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfileData {
  expertise?: string[];
  funding?: string;
  followers?: number;
  linkedInUrl?: string;
  company?: string;
  experience?: string;
  industries?: string[];
}

export interface Idea {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  analyses?: Analysis[];
}

export interface Analysis {
  id: string;
  ideaId: string;
  sectionType: AnalysisSectionType;
  content: any;
  createdAt: string;
}

export type AnalysisSectionType =
  | 'education'
  | 'swot'
  | 'features'
  | 'business_values'
  | 'pmf'
  | 'next_steps'
  | 'viability';

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
  score: number;
  factors: {
    category: string;
    score: number;
    reasoning: string;
  }[];
  overallAssessment: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  error: string;
  details?: any;
}
