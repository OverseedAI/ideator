import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const configSchema = z.object({
  nodeEnv: z.enum(["development", "production", "test"]).default("development"),
  port: z.coerce.number().default(3000),
  host: z.string().default("0.0.0.0"),

  databaseUrl: z.string().min(1),

  jwt: z.object({
    secret: z.string().min(32),
    expiresIn: z.string().default("7d"),
  }),

  ai: z.object({
    apiKey: z.string().min(1),
    model: z.string().default("gpt-4o"),
  }),

  cors: z.object({
    allowedOrigins: z.array(z.string()).default(["http://localhost:5173"]),
  }),

  google: z.object({
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),
    redirectUri: z.string().optional(),
  }),
});

const parseConfig = () => {
  const config = {
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    host: process.env.HOST,
    databaseUrl: process.env.DATABASE_URL,
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
    ai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.AI_MODEL,
    },
    cors: {
      allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",") || undefined,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI,
    },
  };

  return configSchema.parse(config);
};

export const config = parseConfig();

export const isDevelopment = config.nodeEnv === "development";
export const isProduction = config.nodeEnv === "production";
export const isTest = config.nodeEnv === "test";
