import { OAuth2Client } from "google-auth-library";
import { prisma } from "../db";
import { config } from "../config";
import { generateToken } from "../utils/jwt";
import { AppError } from "../middleware/errorHandler";
import crypto from "crypto";

const googleClient = new OAuth2Client(
  config.google.clientId,
  config.google.clientSecret,
  config.google.redirectUri
);

interface GoogleUserInfo {
  sub: string; // Google user ID
  email: string;
  email_verified: boolean;
  name: string;
  picture?: string;
}

/**
 * Generate Google OAuth URL with state for CSRF protection
 */
export const generateGoogleAuthUrl = (state: string): string => {
  if (!config.google.clientId || !config.google.redirectUri) {
    throw new AppError(500, "Google OAuth is not configured");
  }

  const url = googleClient.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    state,
  });

  return url;
};

/**
 * Generate a secure random state for CSRF protection
 */
export const generateOAuthState = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Verify OAuth state to prevent CSRF attacks
 */
export const verifyOAuthState = (receivedState: string, expectedState: string): boolean => {
  return receivedState === expectedState;
};

/**
 * Handle Google OAuth callback
 * Implements account linking logic with security checks
 */
export const handleGoogleCallback = async (code: string) => {
  if (!config.google.clientId || !config.google.clientSecret) {
    throw new AppError(500, "Google OAuth is not configured");
  }

  try {
    // Exchange code for tokens
    const { tokens } = await googleClient.getToken(code);
    googleClient.setCredentials(tokens);

    // Get user info from Google
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token!,
      audience: config.google.clientId,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new AppError(400, "Failed to get user info from Google");
    }

    const googleUserInfo: GoogleUserInfo = {
      sub: payload.sub,
      email: payload.email!,
      email_verified: payload.email_verified || false,
      name: payload.name || payload.email!.split("@")[0],
      picture: payload.picture,
    };

    // Normalize email for comparison
    const normalizedEmail = googleUserInfo.email.toLowerCase().trim();

    // Check if this Google account is already linked
    const existingProviderAccount = await prisma.providerAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: "google",
          providerAccountId: googleUserInfo.sub,
        },
      },
      include: {
        user: true,
      },
    });

    // If provider account exists, login the user
    if (existingProviderAccount) {
      // Update access token
      await prisma.providerAccount.update({
        where: { id: existingProviderAccount.id },
        data: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        },
      });

      const token = generateToken({
        userId: existingProviderAccount.user.id,
        email: existingProviderAccount.user.email,
      });

      return {
        user: {
          id: existingProviderAccount.user.id,
          email: existingProviderAccount.user.email,
          name: existingProviderAccount.user.name,
          profileData: existingProviderAccount.user.profileData,
        },
        token,
        isNewUser: false,
      };
    }

    // Check if a user with this email already exists (account linking scenario)
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        providerAccounts: true,
      },
    });

    if (existingUser) {
      // SECURITY CHECK: Only link if Google email is verified
      if (!googleUserInfo.email_verified) {
        throw new AppError(
          400,
          "Cannot link account: Google email is not verified. Please verify your email with Google first."
        );
      }

      // SECURITY CHECK: If user has a password, they should be verified
      // For backward compatibility, we'll allow linking if they have a password
      // In production, you might want to require the user to login first
      if (existingUser.password && !existingUser.emailVerified) {
        // Mark their email as verified since Google verified it
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { emailVerified: true },
        });
      }

      // Link the Google account to existing user
      await prisma.providerAccount.create({
        data: {
          userId: existingUser.id,
          provider: "google",
          providerAccountId: googleUserInfo.sub,
          email: normalizedEmail,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
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
        isNewUser: false,
        accountLinked: true,
      };
    }

    // Create new user with Google account
    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: googleUserInfo.name,
        emailVerified: googleUserInfo.email_verified,
        password: null, // OAuth users don't have passwords
        providerAccounts: {
          create: {
            provider: "google",
            providerAccountId: googleUserInfo.sub,
            email: normalizedEmail,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
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
      isNewUser: true,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    console.error("Google OAuth error:", error);
    throw new AppError(400, "Failed to authenticate with Google");
  }
};

/**
 * Get linked provider accounts for a user
 */
export const getLinkedProviders = async (userId: string) => {
  const providerAccounts = await prisma.providerAccount.findMany({
    where: { userId },
    select: {
      provider: true,
      email: true,
      createdAt: true,
    },
  });

  return providerAccounts;
};

/**
 * Unlink a provider account
 */
export const unlinkProvider = async (userId: string, provider: string) => {
  // Check if user has other auth methods
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      providerAccounts: true,
    },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  // Prevent unlinking if it's the only auth method
  if (!user.password && user.providerAccounts.length <= 1) {
    throw new AppError(
      400,
      "Cannot unlink the only authentication method. Please set a password first."
    );
  }

  const result = await prisma.providerAccount.deleteMany({
    where: {
      userId,
      provider,
    },
  });

  if (result.count === 0) {
    throw new AppError(404, "Provider account not found");
  }

  return { success: true };
};
