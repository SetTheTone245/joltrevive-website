import express from "express";
import type { Express, Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";

/**
 * Origins allowed to call the API from a browser.
 *
 * The front end is hosted separately (GitHub Pages / joltrevive.com), so the
 * API is cross-origin and needs explicit CORS. Extra origins can be added at
 * runtime via the ALLOWED_ORIGINS env var (comma-separated) without a redeploy
 * of this list.
 */
const DEFAULT_ALLOWED_ORIGINS = [
  "https://joltrevive.com",
  "https://www.joltrevive.com",
  "https://setthetone245.github.io",
  "http://localhost:5000",
  "http://localhost:5173",
];

function allowedOrigins(): string[] {
  const extra = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  return [...DEFAULT_ALLOWED_ORIGINS, ...extra];
}

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

/**
 * Builds the API application. Deliberately contains no `listen()` call and no
 * static-file serving, so the same app object works both under a long-running
 * Node process (local dev) and as a serverless function (Vercel).
 */
export async function createApp(): Promise<Express> {
  const app = express();

  // Vercel terminates TLS upstream; trust its proxy headers so req.protocol
  // and req.ip reflect the real client rather than the internal hop.
  app.set("trust proxy", true);

  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins().includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      res.setHeader("Access-Control-Max-Age", "86400");
    }
    if (req.method === "OPTIONS") {
      // Preflight — answer immediately, never fall through to a route.
      return res.status(204).end();
    }
    next();
  });

  app.use(express.json({ limit: "64kb" }));
  app.use(express.urlencoded({ extended: false, limit: "64kb" }));

  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    res.on("finish", () => {
      if (path.startsWith("/api")) {
        log(`${req.method} ${path} ${res.statusCode} in ${Date.now() - start}ms`);
      }
    });
    next();
  });

  await registerRoutes(app);

  app.use("/api/{*path}", (_req, res) => {
    res.status(404).json({ message: "Not found" });
  });

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    // Never leak internal error text to the client on a 5xx.
    const message = status >= 500 ? "Internal Server Error" : err.message || "Request failed";
    return res.status(status).json({ message });
  });

  return app;
}
