import { z } from 'zod';

// Education content schema
export const educationSchema = z.object({
  keywords: z.array(z.string()).describe('5-10 key industry keywords'),
  terminology: z.record(z.string(), z.string()).describe('Product terms and their definitions'),
  industryOverview: z.string().describe('Brief industry overview'),
});

export type EducationContent = z.infer<typeof educationSchema>;

// SWOT content schema
export const swotSchema = z.object({
  strengths: z.array(z.string()).describe('Internal positive factors'),
  weaknesses: z.array(z.string()).describe('Internal limitations or gaps'),
  opportunities: z.array(z.string()).describe('External favorable conditions'),
  threats: z.array(z.string()).describe('External challenges or risks'),
  personalizedInsights: z.string().describe('How the user profile affects this analysis'),
});

export type SwotContent = z.infer<typeof swotSchema>;

// Features content schema
export const featuresSchema = z.object({
  features: z.array(z.string()).describe('5-10 core features for the product'),
  competitiveAnalysis: z.array(
    z.object({
      competitor: z.string(),
      features: z.record(z.string(), z.boolean()).describe('Which features the competitor has'),
    })
  ).describe('3-5 key competitors and their feature sets'),
});

export type FeaturesContent = z.infer<typeof featuresSchema>;

// Business values content schema
export const businessValuesSchema = z.object({
  moats: z.array(z.string()).describe('Product differentiators and competitive advantages'),
  targetMarket: z.object({
    segments: z.array(z.string()).describe('Target market segments'),
    size: z.string().describe('Market size estimate'),
    description: z.string().describe('Target market description'),
  }),
  pricingStrategies: z.array(
    z.object({
      model: z.string().describe('Pricing model name'),
      rationale: z.string().describe('Why this pricing model works'),
    })
  ).describe('Recommended pricing strategies'),
  timelineToMarket: z.string().describe('Estimated timeline to bring product to market'),
});

export type BusinessValuesContent = z.infer<typeof businessValuesSchema>;

// PMF content schema
export const pmfSchema = z.object({
  strategies: z.array(
    z.object({
      title: z.string().describe('Strategy title'),
      description: z.string().describe('Detailed description of the strategy'),
      effort: z.enum(['low', 'medium', 'high']).describe('Effort level required'),
      timeline: z.string().describe('Estimated timeline'),
    })
  ).describe('3-5 creative strategies to quickly gauge product-market fit'),
});

export type PmfContent = z.infer<typeof pmfSchema>;

// Next steps content schema
export const nextStepsSchema = z.object({
  steps: z.array(
    z.object({
      title: z.string().describe('Step title'),
      description: z.string().describe('What to do'),
      priority: z.number().describe('Priority (1 being highest)'),
      estimatedTime: z.string().describe('Time estimate'),
    })
  ).describe('5-7 prioritized, actionable steps'),
});

export type NextStepsContent = z.infer<typeof nextStepsSchema>;

// Viability content schema
export const viabilitySchema = z.object({
  score: z.number().min(0).max(100).describe('Overall viability score from 0-100'),
  factors: z.array(
    z.object({
      category: z.string().describe('Factor category name'),
      score: z.number().min(0).max(100).describe('Score for this factor'),
      reasoning: z.string().describe('Explanation for the score'),
    })
  ).describe('Individual factor scores and reasoning'),
  overallAssessment: z.string().describe('Summary of the overall viability assessment'),
});

export type ViabilityContent = z.infer<typeof viabilitySchema>;

// Export all schemas in a map for easy access
export const analysisSchemas = {
  education: educationSchema,
  swot: swotSchema,
  features: featuresSchema,
  business_values: businessValuesSchema,
  pmf: pmfSchema,
  next_steps: nextStepsSchema,
  viability: viabilitySchema,
} as const;
