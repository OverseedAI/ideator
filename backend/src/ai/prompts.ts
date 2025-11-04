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

IMPORTANT: Use the webSearch tool to find real, current competitors for this idea.
Search for terms like "competitors to [idea]", "alternatives to [idea]", or "[idea] competitors".

Based on your web search results:
1. Core features this product should have (5-10 features)
2. Key competitors and their feature sets (3-5 competitors)
   - Use REAL competitors you found through web search
   - For each competitor, include their actual website URL in the 'url' field
   - Analyze what features they currently offer based on the search results
3. A competitive comparison matrix showing which features each competitor has

Make sure to search the web first to get accurate, up-to-date competitor information.
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
