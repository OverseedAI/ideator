import { EventEmitter } from "events";
import { prisma } from "../db";
import { AppError } from "../middleware/errorHandler";
import { aiClient } from "../ai/client";
import { analysisPrompts, IDEA_ANALYSIS_SYSTEM_PROMPT } from "../ai/prompts";
import { analysisSchemas } from "../ai/schemas";
import { AnalysisSectionType, UserProfileData } from "../types";

type IdeaStatus = "pending" | "analyzing" | "completed" | "failed";

export interface AnalysisSectionEvent {
  ideaId: string;
  analysis: Awaited<ReturnType<typeof prisma.analysis.create>>;
}

export interface AnalysisStatusEvent {
  ideaId: string;
  status: IdeaStatus;
}

class AnalysisEventEmitter extends EventEmitter {
  override emit(event: "analysis-section", payload: AnalysisSectionEvent): boolean;
  override emit(event: "analysis-status", payload: AnalysisStatusEvent): boolean;
  override emit(event: string | symbol, ...args: any[]): boolean {
    return super.emit(event, ...args);
  }

  override on(event: "analysis-section", listener: (payload: AnalysisSectionEvent) => void): this;
  override on(event: "analysis-status", listener: (payload: AnalysisStatusEvent) => void): this;
  override on(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.on(event, listener);
  }

  override off(event: "analysis-section", listener: (payload: AnalysisSectionEvent) => void): this;
  override off(event: "analysis-status", listener: (payload: AnalysisStatusEvent) => void): this;
  override off(event: string | symbol, listener: (...args: any[]) => void): this {
    return super.off(event, listener);
  }
}

export const analysisEvents = new AnalysisEventEmitter();
analysisEvents.setMaxListeners(0);

const generateAnalysis = async (
  sectionType: AnalysisSectionType,
  ideaTitle: string,
  ideaDescription: string,
  userProfile?: UserProfileData
): Promise<any> => {
  const promptFn = analysisPrompts[sectionType];
  const prompt = promptFn(ideaTitle, ideaDescription, userProfile);
  const schema = analysisSchemas[sectionType];

  // Use web search for features section to find real competitors
  if (sectionType === "features") {
    const result = await aiClient.generateStructuredOutputWithWebSearch(prompt, schema as any, IDEA_ANALYSIS_SYSTEM_PROMPT);
    return result;
  }

  const result = await aiClient.generateStructuredOutput(prompt, schema as any, IDEA_ANALYSIS_SYSTEM_PROMPT);
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

  analysisEvents.emit("analysis-status", { ideaId, status: "analyzing" });

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

      const analysis = await prisma.analysis.create({
        data: {
          ideaId,
          sectionType,
          content: content as any,
        },
      });

      analysisEvents.emit("analysis-section", { ideaId, analysis });
    }

    // Update status to completed
    await prisma.idea.update({
      where: { id: ideaId },
      data: { status: "completed" },
    });

    analysisEvents.emit("analysis-status", { ideaId, status: "completed" });

    return { message: "Analysis completed successfully" };
  } catch (error) {
    // Update status to failed
    await prisma.idea.update({
      where: { id: ideaId },
      data: { status: "failed" },
    });

    analysisEvents.emit("analysis-status", { ideaId, status: "failed" });

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
