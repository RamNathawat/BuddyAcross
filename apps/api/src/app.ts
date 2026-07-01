import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import kycRoutes from "./routes/kyc.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import taskRoutes from "./routes/task.routes.js";
import bidRoutes from "./routes/bid.routes.js";

export function createApp() {
  const app = express();

  // ── Prevent 304 Caching on API ────────────────────────────
  app.set("etag", false);
  app.use((_req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
  });

  // ── Security ──────────────────────────────────────────────
  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (
          !origin ||
          origin.startsWith("http://localhost:") ||
          origin.startsWith("http://127.0.0.1:") ||
          origin.endsWith(".vercel.app") ||
          origin === env.FRONTEND_URL
        ) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    })
  );

  // ── Parsing ───────────────────────────────────────────────
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  // ── Logging ───────────────────────────────────────────────
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

  // ── Health Check ──────────────────────────────────────────
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ── API Routes ────────────────────────────────────────────
  app.use("/v1/auth", authRoutes);
  app.use("/v1/users", userRoutes);
  app.use("/v1/kyc", kycRoutes);
  app.use("/v1/admin", adminRoutes);
  app.use("/v1/tasks", taskRoutes);
  app.use("/v1/bids", bidRoutes);

  // ── 404 Handler ───────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "The requested endpoint does not exist",
      },
    });
  });

  // ── Error Handler ─────────────────────────────────────────
  app.use(errorHandler);

  return app;
}
