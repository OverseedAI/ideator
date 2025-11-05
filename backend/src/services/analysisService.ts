import { prisma } from "../db";
import { AppError } from "../middleware/errorHandler";
import { aiClient } from "../ai/client";
import { analysisPrompts } from "../ai/prompts";
import { analysisSchemas } from "../ai/schemas";
import { AnalysisSectionType, UserProfileData } from "../types";

const generateAnalysis = async (
  sectionType: AnalysisSectionType,
  ideaTitle: string,
  ideaDescription: string,
  userProfile?: UserProfileData
): Promise<any> => {
  const promptFn = analysisPrompts[sectionType];
  const prompt = promptFn(ideaTitle, ideaDescription, userProfile);
  const schema = analysisSchemas[sectionType];

  const systemPrompt =
    "You are a business analyst helping entrepreneurs evaluate their ideas. Provide thorough, actionable insights.";

  // Use web search for features section to find real competitors
  if (sectionType === "features") {
    const result = await aiClient.generateStructuredOutputWithWebSearch(prompt, schema as any, systemPrompt);
    return result;
  }

  const result = await aiClient.generateStructuredOutput(prompt, schema as any, systemPrompt);
  return result;
};

export const analyzeIdea = async (ideaId: string, userId: string) => {
  // Get idea
  const idea = await prisma.idea.findFirst({
    where: {
      id: ideaId,
      userId,
    },
  });

  if (!idea) {
    throw new AppError(404, "Idea not found");
  }

  // Get user profile
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const userProfile = user.profileData as UserProfileData | null;

  // Update status to analyzing
  await prisma.idea.update({
    where: { id: ideaId },
    data: { status: "analyzing" },
  });

  try {
    // Generate all analyses
    const sections: AnalysisSectionType[] = [
      "education",
      "swot",
      "features",
      "business_values",
      "pmf",
      "next_steps",
      "viability",
    ];

    for (const sectionType of sections) {
      const content = await generateAnalysis(
        sectionType,
        idea.title,
        idea.description,
        userProfile || undefined
      );

      await prisma.analysis.create({
        data: {
          ideaId,
          sectionType,
          content: content as any,
        },
      });
    }

    // Update status to completed
    await prisma.idea.update({
      where: { id: ideaId },
      data: { status: "completed" },
    });

    return { message: "Analysis completed successfully" };
  } catch (error) {
    // Update status to failed
    await prisma.idea.update({
      where: { id: ideaId },
      data: { status: "failed" },
    });

    throw error;
  }
};

export const getAnalyses = async (ideaId: string, userId: string) => {
  // Verify ownership
  const idea = await prisma.idea.findFirst({
    where: {
      id: ideaId,
      userId,
    },
  });

  if (!idea) {
    throw new AppError(404, "Idea not found");
  }

  const analyses = await prisma.analysis.findMany({
    where: { ideaId },
    orderBy: { createdAt: "asc" },
  });

  return analyses;
};
