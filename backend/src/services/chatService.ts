import { openai } from "@ai-sdk/openai";
import { CoreMessage, streamText } from "ai";
import { config } from "../config";
import { prisma } from "../db";
import { AppError } from "../middleware/errorHandler";

export interface ChatContext {
  ideaId: string;
  ideaName: string;
  ideaDescription: string;
  analyses: {
    id: string;
    title: string;
    summary: string;
  }[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

export interface ChatRequest {
  ideaId: string;
  userId: string;
  message: string;
  conversationHistory?: ChatMessage[];
}

/**
 * Build context string for the AI from Idea and Analysis data
 */
const buildContextString = (context: ChatContext): string => {
  let contextStr = `# Current Idea Context\n\n`;
  contextStr += `**Idea Name:** ${context.ideaName}\n`;
  contextStr += `**Description:** ${context.ideaDescription}\n\n`;

  if (context.analyses && context.analyses.length > 0) {
    contextStr += `## Available Analyses\n\n`;
    context.analyses.forEach((analysis, idx) => {
      contextStr += `${idx + 1}. **${analysis.title}** (ID: ${analysis.id})\n`;
      contextStr += `   ${analysis.summary}\n\n`;
    });
  }

  return contextStr;
};

/**
 * Fetch Idea context including analyses
 */
export const getIdeaContext = async (ideaId: string, userId: string): Promise<ChatContext> => {
  const idea = await prisma.idea.findFirst({
    where: {
      id: ideaId,
      userId,
    },
    include: {
      analyses: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!idea) {
    throw new AppError(404, "Idea not found");
  }

  // Build analysis summaries
  const analyses = idea.analyses.map((analysis) => {
    // Extract a short summary from the content based on section type
    let summary = "";
    const content = analysis.content as any;

    switch (analysis.sectionType) {
      case "education":
        summary = `Keywords and terminology for the ${idea.title} industry`;
        break;
      case "swot":
        summary = `SWOT analysis with ${content.strengths?.length || 0} strengths, ${content.weaknesses?.length || 0} weaknesses`;
        break;
      case "features":
        summary = `Feature comparison with ${content.features?.length || 0} suggested features`;
        break;
      case "business_values":
        summary = `Business model, target market, and pricing strategies`;
        break;
      case "pmf":
        summary = `${content.strategies?.length || 0} product-market fit strategies`;
        break;
      case "next_steps":
        summary = `${content.steps?.length || 0} actionable next steps prioritized`;
        break;
      case "viability":
        summary = `Viability score: ${content.score || 0}/100`;
        break;
      case "google_keywords":
        summary = `${content.keywords?.length || 0} Google search keywords analyzed`;
        break;
      default:
        summary = `Analysis section: ${analysis.sectionType}`;
    }

    return {
      id: analysis.id,
      title: analysis.sectionType
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      summary,
    };
  });

  return {
    ideaId: idea.id,
    ideaName: idea.title,
    ideaDescription: idea.description,
    analyses,
  };
};

/**
 * Generate streaming chat response
 */
export const streamChatResponse = async (request: ChatRequest) => {
  const { ideaId, userId, message, conversationHistory = [] } = request;

  // Fetch idea context
  const context = await getIdeaContext(ideaId, userId);

  // Build system prompt with context
  const systemPrompt = `You are an AI assistant helping entrepreneurs evaluate and develop their business ideas. You have access to the following context about the user's current idea:

${buildContextString(context)}

Your role:
- Provide insights, answer questions, and offer guidance related to this specific idea
- Reference the analyses above when relevant
- Be conversational, supportive, and practical
- If the user asks about something not covered in the context, acknowledge the limitation but still provide helpful general guidance
- Keep responses concise but informative (aim for 2-4 paragraphs unless more detail is requested)

Important:
- Focus on actionable advice
- Ask clarifying questions when needed
- Suggest next steps when appropriate
`;

  // Build message history
  const messages: CoreMessage[] = [
    { role: "system", content: systemPrompt },
    ...conversationHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
    { role: "user", content: message },
  ];

  // Generate streaming response

  try {
    const model = openai(config.ai.model);

    const result = streamText({
      model,
      messages,
      temperature: 0.7,
    });

    return result;
  } catch (error) {
    console.error("[Chat Service] Error in streamChatResponse:", error);
    throw error;
  }
};
