import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import v1Routes from "./routes/v1";

export const createApp = (): Application => {
  const app = express();

  // Security middleware
  app.use(helmet());

  // CORS
  app.use(
    cors({
      origin: config.cors.allowedOrigins,
      credentials: true,
    })
  );

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // API routes
  app.use("/api/v1", v1Routes);

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
