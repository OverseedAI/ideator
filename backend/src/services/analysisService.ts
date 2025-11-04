import { prisma } from '../db';
import { AppError } from '../middleware/errorHandler';
import { aiClient } from '../ai/client';
import { analysisPrompts } from '../ai/prompts';
import { analysisSchemas } from '../ai/schemas';
import { AnalysisSectionType, UserProfileData } from '../types';
import { aiTools } from '../ai/tools.js';

const generateAnalysis = async (
  sectionType: AnalysisSectionType,
  ideaTitle: string,
  ideaDescription: string,
  userProfile?: UserProfileData
): Promise<any> => {
  const schema = analysisSchemas[sectionType];
  const systemPrompt =
    'You are a business analyst helping entrepreneurs evaluate their ideas. Provide thorough, actionable insights.';

  // Generate prompt
  const promptFn = analysisPrompts[sectionType];
  const prompt = promptFn(ideaTitle, ideaDescription, userProfile);

  // Special handling for features section - enable web search tool
  if (sectionType === 'features') {
    console.log('Generating features analysis with web search tool enabled...');
    const result = await aiClient.generateStructuredOutputWithTools(
      prompt,
      schema,
      aiTools,
      systemPrompt,
      10 // Allow up to 10 steps for tool calling
    );
    return result;
  }

  // Standard generation for other sections
  const result = await aiClient.generateStructuredOutput(prompt, schema, systemPrompt);
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
    throw new AppError(404, 'Idea not found');
  }

  // Get user profile
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  const userProfile = user.profileData as UserProfileData | null;

  // Update status to analyzing
  await prisma.idea.update({
    where: { id: ideaId },
    data: { status: 'analyzing' },
  });

  try {
    // Generate all analyses
    const sections: AnalysisSectionType[] = [
      'education',
      'swot',
      'features',
      'business_values',
      'pmf',
      'next_steps',
      'viability',
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
      data: { status: 'completed' },
    });

    return { message: 'Analysis completed successfully' };
  } catch (error) {
    // Update status to failed
    await prisma.idea.update({
      where: { id: ideaId },
      data: { status: 'failed' },
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
    throw new AppError(404, 'Idea not found');
  }

  const analyses = await prisma.analysis.findMany({
    where: { ideaId },
    orderBy: { createdAt: 'asc' },
  });

  return analyses;
};
