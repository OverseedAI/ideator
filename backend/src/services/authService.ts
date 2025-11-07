import { prisma } from "../db";
import { hashPassword, comparePassword } from "../utils/password";
import { generateToken } from "../utils/jwt";
import { AppError } from "../middleware/errorHandler";

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
    throw new AppError(400, "Email already registered");
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
    throw new AppError(401, "Invalid credentials");
  }

  // Check if user has a password (OAuth-only users don't have passwords)
  if (!user.password) {
    throw new AppError(401, "This account uses social login. Please sign in with Google.");
  }

  const isPasswordValid = await comparePassword(data.password, user.password);

  if (!isPasswordValid) {
    throw new AppError(401, "Invalid credentials");
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
    throw new AppError(404, "User not found");
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    profileData: user.profileData,
    createdAt: user.createdAt,
  };
};

interface OAuthData {
  provider: string;
  providerId: string;
  email: string;
  name: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export const oauthLogin = async (data: OAuthData) => {
  // Check if OAuth account already exists
  const existingOAuthAccount = await prisma.oAuthAccount.findUnique({
    where: {
      provider_providerId: {
        provider: data.provider,
        providerId: data.providerId,
      },
    },
    include: {
      user: true,
    },
  });

  if (existingOAuthAccount) {
    // Update OAuth account tokens
    await prisma.oAuthAccount.update({
      where: { id: existingOAuthAccount.id },
      data: {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
      },
    });

    const token = generateToken({
      userId: existingOAuthAccount.user.id,
      email: existingOAuthAccount.user.email,
    });

    return {
      user: {
        id: existingOAuthAccount.user.id,
        email: existingOAuthAccount.user.email,
        name: existingOAuthAccount.user.name,
        profileData: existingOAuthAccount.user.profileData,
      },
      token,
    };
  }

  // Check if user with this email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    // Merge accounts: Link OAuth account to existing user
    await prisma.oAuthAccount.create({
      data: {
        userId: existingUser.id,
        provider: data.provider,
        providerId: data.providerId,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
      },
    });

    const token = generateToken({
      userId: existingUser.id,
      email: existingUser.email,
    });

    return {
      user: {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        profileData: existingUser.profileData,
      },
      token,
      merged: true, // Indicate that accounts were merged
    };
  }

  // Create new user with OAuth account
  const newUser = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: null, // No password for OAuth-only users
      oauthAccounts: {
        create: {
          provider: data.provider,
          providerId: data.providerId,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresAt: data.expiresAt,
        },
      },
    },
  });

  const token = generateToken({
    userId: newUser.id,
    email: newUser.email,
  });

  return {
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      profileData: newUser.profileData,
    },
    token,
  };
};
