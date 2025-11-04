import { prisma } from "../db";
import { AppError } from "../middleware/errorHandler";
import { UserProfileData } from "../types";

export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      profileData: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return user;
};

export const updateProfile = async (
  userId: string,
  data: Partial<{ name: string; profileData: UserProfileData }>
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.profileData && { profileData: data.profileData as any }),
    },
    select: {
      id: true,
      email: true,
      name: true,
      profileData: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};
