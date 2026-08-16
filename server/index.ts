import "dotenv/config";
import { createApp, log } from "./app.js";
import { createServer } from "node:http";

/**
 * Local development / self-hosted entry point.
 *
 * Serves the API and the client from one process. On Vercel this file is not
 * used at all — `api/index.ts` imports the same app factory instead.
 */
(async () => {
  const app = await createApp();
  const httpServer = createServer(app);

  if (process.env.NODE_ENV === "production") {
    const { serveStatic } = await import("./static.js");
    serveStatic(app);
  } else {
    // Vite middleware must be registered after the API routes so its catch-all
    // doesn't swallow /api requests.
    const { setupVite } = await import("./vite.js");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen({ port, host: "0.0.0.0", reusePort: true }, () => {
    log(`serving on port ${port}`);
  });
})();
