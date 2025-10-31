import { prisma } from '../db';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { AppError } from '../middleware/errorHandler';

interface SignupData {
  email: string;
  password: string;
  name: string;
}

interface LoginData {
  email: string;
  password: string;
}

export const signup = async (data: SignupData) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new AppError(400, 'Email already registered');
  }

  const hashedPassword = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
    },
  });

  const token = generateToken({
    userId: user.id,
    email: user.email,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      profileData: user.profileData,
    },
    token,
  };
};

export const login = async (data: LoginData) => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new AppError(401, 'Invalid credentials');
  }

  const isPasswordValid = await comparePassword(data.password, user.password);

  if (!isPasswordValid) {
    throw new AppError(401, 'Invalid credentials');
  }

  const token = generateToken({
    userId: user.id,
    email: user.email,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      profileData: user.profileData,
    },
    token,
  };
};

export const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    profileData: user.profileData,
    createdAt: user.createdAt,
  };
};
