import { Prisma } from "@prisma/client";
import { prisma } from "../db";
import { AppError } from "../middleware/errorHandler";

interface CreateIdeaData {
  title: string;
  description: string;
}

export const createIdea = async (userId: string, data: CreateIdeaData) => {
  try {
    const idea = await prisma.idea.create({
      data: {
        userId,
        title: data.title,
        description: data.description,
        status: "pending",
      },
    });

    return idea;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      // Unique constraint violation on userId + title
      throw new AppError(
        409,
        "An idea with this name already exists. Please choose a different name."
      );
    }
    throw error;
  }
};

export const getUserIdeas = async (userId: string) => {
  const ideas = await prisma.idea.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      analyses: {
        select: {
          id: true,
          sectionType: true,
          createdAt: true,
        },
      },
    },
  });

  return ideas;
};

export const getIdeaById = async (ideaId: string, userId: string) => {
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

  return idea;
};

export const updateIdea = async (
  ideaId: string,
  userId: string,
  data: Partial<CreateIdeaData & { status: string }>
) => {
  const idea = await prisma.idea.findFirst({
    where: {
      id: ideaId,
      userId,
    },
  });

  if (!idea) {
    throw new AppError(404, "Idea not found");
  }

  // If updating the title, check if another idea with the same title exists for this user
  if (data.title && data.title !== idea.title) {
    const existingIdea = await prisma.idea.findFirst({
      where: {
        userId,
        title: data.title,
        id: { not: ideaId },
      },
    });

    if (existingIdea) {
      throw new AppError(
        409,
        "An idea with this name already exists. Please choose a different name."
      );
    }
  }

  try {
    const updatedIdea = await prisma.idea.update({
      where: { id: ideaId },
      data,
    });

    return updatedIdea;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      // Unique constraint violation on userId + title
      throw new AppError(
        409,
        "An idea with this name already exists. Please choose a different name."
      );
    }
    throw error;
  }
};

export const deleteIdea = async (ideaId: string, userId: string) => {
  const idea = await prisma.idea.findFirst({
    where: {
      id: ideaId,
      userId,
    },
  });

  if (!idea) {
    throw new AppError(404, "Idea not found");
  }

  await prisma.idea.delete({
    where: { id: ideaId },
  });

  return { message: "Idea deleted successfully" };
};
