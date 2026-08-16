import type { IncomingMessage, ServerResponse } from "node:http";

/**
 * Vercel serverless entry point for the JoltRevive API.
 *
 * The app is imported dynamically inside the try/catch rather than with a
 * static top-level import. A static import that throws takes down the whole
 * module and Vercel returns an opaque FUNCTION_INVOCATION_FAILED with no
 * usable detail; importing here means any boot failure is caught, logged with
 * a full stack, and reported as a normal 500.
 *
 * The resolved app is cached so warm invocations skip this entirely.
 */
let appPromise: Promise<(req: IncomingMessage, res: ServerResponse) => void> | null = null;

function boot() {
  if (!appPromise) {
    appPromise = import("../server/app.js")
      .then((mod) => mod.createApp())
      .catch((err) => {
        appPromise = null; // don't cache a failed boot
        throw err;
      });
  }
  return appPromise;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    const app = await boot();
    return app(req, res);
  } catch (err) {
    console.error("API boot failed:", err);
    if (res.headersSent) return;
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        message: "Internal Server Error",
        // Opt-in diagnostics: set DEBUG_BOOT=1 to surface the cause while
        // troubleshooting a deployment, then remove it.
        ...(process.env.DEBUG_BOOT === "1"
          ? { error: String(err), stack: err instanceof Error ? err.stack : undefined }
          : {}),
      }),
    );
  }
}
