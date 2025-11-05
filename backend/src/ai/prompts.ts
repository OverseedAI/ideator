import { UserProfileData } from "../types";

/**
 * System prompt that establishes the AI's role and guidelines for all idea analysis tasks.
 * This should be prepended to all analysis prompts to ensure consistent, fact-based responses.
 */
export const IDEA_ANALYSIS_SYSTEM_PROMPT = `
You are a lean startup coach who approaches topics with sensibility, but are not afraid to be ruthlessly truthful on business idea prospects. You will be provided with instructions to provide business insights, but in areas where you have insufficient knowledge or your confidence level is below 80%, you MUST refrain from just making up facts. Provide just enough context to make your points make sense, nothing more. All your points must be based on facts. If you reference any stats, you MUST provide sources. You must NEVER populate data just to make it look pretty.
`.trim();

const formatUserContext = (profile?: UserProfileData): string => {
  if (!profile) {
    return `
User Context:
- Expertise: Not specified
- Funding: Not specified
- Followers: Not specified
- LinkedIn: Not specified
- Company: Not specified
- Experience: Not specified
- Industries: Not specified
`.trim();
  }

  return `
User Context:
- Expertise: ${profile.expertise?.join(", ") || "Not specified"}
- Funding: ${profile.funding || "Not specified"}
- Followers: ${profile.followers || "Not specified"}
- LinkedIn: ${profile.linkedInUrl || "Not specified"}
- Company: ${profile.company || "Not specified"}
- Experience: ${profile.experience || "Not specified"}
- Industries: ${profile.industries?.join(", ") || "Not specified"}
`.trim();
};

export const createEducationPrompt = (ideaTitle: string, ideaDescription: string): string => {
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
  userProfile?: UserProfileData
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

export const createFeaturesPrompt = (ideaTitle: string, ideaDescription: string): string => {
  return `
Analyze this business idea and identify:

Idea: ${ideaTitle}
Description: ${ideaDescription}

IMPORTANT: Use web search to find REAL competitors currently operating in this space.

1. Core features this product should have (5-10 features).
2. Search the web for 3-5 REAL competitors that currently exist and operate in this space
3. For each competitor, provide:
   - The exact company name
   - Their official website URL (must be a real, working URL)
   - Which features from the core feature list they currently have. Cross reference this with their landing page or their features/services pages.
4. Create a competitive comparison matrix showing which features each competitor has

Make sure all competitors are real companies with actual websites that you can find through web search.
`.trim();
};

export const createBusinessValuesPrompt = (
  ideaTitle: string,
  ideaDescription: string,
  userProfile?: UserProfileData
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

export const createPmfPrompt = (ideaTitle: string, ideaDescription: string): string => {
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
  userProfile?: UserProfileData
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
- Estimated time (be hyper realistic)
`.trim();
};

export const createViabilityPrompt = (
  ideaTitle: string,
  ideaDescription: string,
  userProfile?: UserProfileData
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

export const createGoogleKeywordsPrompt = (ideaTitle: string, ideaDescription: string): string => {
  return `
Analyze relevant Google search keywords for this business idea:

Idea: ${ideaTitle}
Description: ${ideaDescription}

IMPORTANT: Use web search to find REAL search data and keyword trends.

Provide a comprehensive keyword analysis:
1. Identify 6-8 highly relevant search keywords and phrases that potential customers would use
2. For each keyword, provide:
   - Search volume estimate (e.g., "10K-100K/month", "1K-10K/month")
   - Market sentiment (positive/neutral/negative) - how favorable the search intent is for a business
   - Competition level (low/medium/high) for ranking or advertising on this keyword
   - Relevance score (0-100) to the business idea

3. Include a mix of:
   - High-volume generic keywords (broader market)
   - Mid-volume specific keywords (targeted audience)
   - Long-tail keywords (niche opportunities)

4. Provide an overall summary of the keyword landscape
5. Give 3-5 strategic recommendations for keyword targeting and SEO strategy

Focus on keywords that indicate purchase intent, problem awareness, or solution seeking.
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
  google_keywords: createGoogleKeywordsPrompt,
};
