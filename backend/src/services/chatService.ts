import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { prisma } from "../db";
import { AppError } from "../middleware/errorHandler";
import { config } from "../config";
import { Analysis } from "@prisma/client";

const CHAT_SYSTEM_PROMPT = `You are an AI assistant helping entrepreneurs develop and refine their business ideas. You have access to the user's idea details and analysis.

Your role is to:
- Answer questions about the business idea
- Provide insights and suggestions
- Help refine and improve the idea
- Offer strategic advice based on the analysis

Be conversational, supportive, and insightful. Use the provided idea context to give personalized advice.`;

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

const formatIdeaContext = (
  ideaTitle: string,
  ideaDescription: string,
  analyses: Analysis[]
): string => {
  let context = `
## Business Idea
**Title:** ${ideaTitle}
**Description:** ${ideaDescription}

## Analysis Insights
`;

  if (analyses.length === 0) {
    context += "\nNo analysis has been completed yet for this idea.";
    return context;
  }

  analyses.forEach((analysis) => {
    context += `\n### ${analysis.sectionType.replace(/_/g, " ").toUpperCase()}\n`;
    context += `${JSON.stringify(analysis.content, null, 2)}\n`;
  });

  return context;
};

export const chatWithIdea = async (
  ideaId: string,
  userId: string,
  messages: Message[]
) => {
  // Verify ownership and get idea with analyses
  const idea = await prisma.idea.findFirst({
    where: {
      id: ideaId,
      userId,
    },
    include: {
      analyses: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!idea) {
    throw new AppError(404, "Idea not found");
  }

  // Format idea context
  const ideaContext = formatIdeaContext(idea.title, idea.description, idea.analyses);

  // Prepare messages with context
  const conversationMessages: Message[] = [
    {
      role: "system",
      content: CHAT_SYSTEM_PROMPT,
    },
    {
      role: "system",
      content: `Here is the business idea you're helping with:\n\n${ideaContext}`,
    },
    ...messages,
  ];

  // Stream the response
  const result = streamText({
    model: openai(config.ai.model),
    messages: conversationMessages as any,
    temperature: 0.7,
  });

  return result;
};
