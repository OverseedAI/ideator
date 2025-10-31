import {
  UserProfileData,
  EducationContent,
  SwotContent,
  FeaturesContent,
  BusinessValuesContent,
  PmfContent,
  NextStepsContent,
  ViabilityContent,
} from '../types';

const formatUserContext = (profile: UserProfileData): string => {
  return `
User Context:
- Expertise: ${profile.expertise?.join(', ') || 'Not specified'}
- Funding: ${profile.funding || 'Not specified'}
- Followers: ${profile.followers || 'Not specified'}
- LinkedIn: ${profile.linkedInUrl || 'Not specified'}
- Company: ${profile.company || 'Not specified'}
- Experience: ${profile.experience || 'Not specified'}
- Industries: ${profile.industries?.join(', ') || 'Not specified'}
`.trim();
};

export const createEducationPrompt = (
  ideaTitle: string,
  ideaDescription: string
): string => {
  return `
Analyze this business idea and provide educational context about the product space:

Idea: ${ideaTitle}
Description: ${ideaDescription}

Please provide:
1. Key industry keywords and terminology (5-10 terms)
2. Important product terms and concepts specific to this space
3. A brief industry overview

Return your response in JSON format:
{
  "keywords": ["keyword1", "keyword2", ...],
  "terminology": {
    "term1": "definition1",
    "term2": "definition2"
  },
  "industryOverview": "overview text"
}
`.trim();
};

export const createSwotPrompt = (
  ideaTitle: string,
  ideaDescription: string,
  userProfile: UserProfileData
): string => {
  return `
Perform a SWOT analysis for this business idea, personalized to the entrepreneur's profile:

Idea: ${ideaTitle}
Description: ${ideaDescription}

${formatUserContext(userProfile)}

Provide a comprehensive SWOT analysis:
- Strengths: Internal positive factors
- Weaknesses: Internal limitations or gaps
- Opportunities: External favorable conditions
- Threats: External challenges or risks
- Personalized Insights: How the user's profile affects this analysis

Return your response in JSON format:
{
  "strengths": ["strength1", "strength2", ...],
  "weaknesses": ["weakness1", "weakness2", ...],
  "opportunities": ["opportunity1", "opportunity2", ...],
  "threats": ["threat1", "threat2", ...],
  "personalizedInsights": "insights text"
}
`.trim();
};

export const createFeaturesPrompt = (
  ideaTitle: string,
  ideaDescription: string
): string => {
  return `
Analyze this business idea and identify:

Idea: ${ideaTitle}
Description: ${ideaDescription}

1. Core features this product should have (5-10 features)
2. Key competitors and their feature sets (3-5 competitors)
3. A competitive comparison matrix

Return your response in JSON format:
{
  "features": ["feature1", "feature2", ...],
  "competitiveAnalysis": [
    {
      "competitor": "Competitor Name",
      "features": {
        "feature1": true,
        "feature2": false,
        ...
      }
    }
  ]
}
`.trim();
};

export const createBusinessValuesPrompt = (
  ideaTitle: string,
  ideaDescription: string,
  userProfile: UserProfileData
): string => {
  return `
Identify core business values for this idea:

Idea: ${ideaTitle}
Description: ${ideaDescription}

${formatUserContext(userProfile)}

Provide:
1. Product differentiators (moats) - what makes this unique
2. Target market - segments, size, description
3. Pricing strategies - models and rationale
4. Estimated timeline to market

Return your response in JSON format:
{
  "moats": ["moat1", "moat2", ...],
  "targetMarket": {
    "segments": ["segment1", "segment2", ...],
    "size": "market size estimate",
    "description": "description text"
  },
  "pricingStrategies": [
    {
      "model": "pricing model name",
      "rationale": "why this works"
    }
  ],
  "timelineToMarket": "estimated timeline"
}
`.trim();
};

export const createPmfPrompt = (
  ideaTitle: string,
  ideaDescription: string
): string => {
  return `
Brainstorm creative ways to quickly gauge product-market fit for this idea:

Idea: ${ideaTitle}
Description: ${ideaDescription}

Think of unconventional, low-effort strategies (like Netflix initially sending VHS tapes through mail).
Focus on speed and learning, not perfection.

Provide 3-5 strategies with:
- Title
- Description
- Effort level (low/medium/high)
- Timeline estimate

Return your response in JSON format:
{
  "strategies": [
    {
      "title": "strategy title",
      "description": "detailed description",
      "effort": "low",
      "timeline": "2-4 weeks"
    }
  ]
}
`.trim();
};

export const createNextStepsPrompt = (
  ideaTitle: string,
  ideaDescription: string,
  userProfile: UserProfileData
): string => {
  return `
Propose concrete next steps to get started developing this product:

Idea: ${ideaTitle}
Description: ${ideaDescription}

${formatUserContext(userProfile)}

Provide 5-7 prioritized, actionable steps with:
- Title
- Description
- Priority (1 being highest)
- Estimated time

Return your response in JSON format:
{
  "steps": [
    {
      "title": "step title",
      "description": "what to do",
      "priority": 1,
      "estimatedTime": "time estimate"
    }
  ]
}
`.trim();
};

export const createViabilityPrompt = (
  ideaTitle: string,
  ideaDescription: string,
  userProfile: UserProfileData
): string => {
  return `
Score the viability of this business idea based on the entrepreneur's profile:

Idea: ${ideaTitle}
Description: ${ideaDescription}

${formatUserContext(userProfile)}

Evaluate across multiple factors:
- Market opportunity
- User's expertise alignment
- Competitive landscape
- Execution feasibility
- Funding requirements vs availability
- Time to market

Provide:
- Overall viability score (0-100)
- Individual factor scores with reasoning
- Overall assessment summary

Return your response in JSON format:
{
  "score": 75,
  "factors": [
    {
      "category": "Market Opportunity",
      "score": 80,
      "reasoning": "explanation"
    }
  ],
  "overallAssessment": "summary text"
}
`.trim();
};

export type AnalysisPromptFunction = (
  ideaTitle: string,
  ideaDescription: string,
  userProfile?: UserProfileData
) => string;

export const analysisPrompts = {
  education: createEducationPrompt,
  swot: createSwotPrompt,
  features: createFeaturesPrompt,
  business_values: createBusinessValuesPrompt,
  pmf: createPmfPrompt,
  next_steps: createNextStepsPrompt,
  viability: createViabilityPrompt,
};
