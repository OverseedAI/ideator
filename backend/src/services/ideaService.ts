import { prisma } from '../db';
import { AppError } from '../middleware/errorHandler';

interface CreateIdeaData {
  title: string;
  description: string;
}

export const createIdea = async (userId: string, data: CreateIdeaData) => {
  const idea = await prisma.idea.create({
    data: {
      userId,
      title: data.title,
      description: data.description,
      status: 'pending',
    },
  });

  return idea;
};

export const getUserIdeas = async (userId: string) => {
  const ideas = await prisma.idea.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
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
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!idea) {
    throw new AppError(404, 'Idea not found');
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
    throw new AppError(404, 'Idea not found');
  }

  const updatedIdea = await prisma.idea.update({
    where: { id: ideaId },
    data,
  });

  return updatedIdea;
};

export const deleteIdea = async (ideaId: string, userId: string) => {
  const idea = await prisma.idea.findFirst({
    where: {
      id: ideaId,
      userId,
    },
  });

  if (!idea) {
    throw new AppError(404, 'Idea not found');
  }

  await prisma.idea.delete({
    where: { id: ideaId },
  });

  return { message: 'Idea deleted successfully' };
};
