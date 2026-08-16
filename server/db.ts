import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";

export class DatabaseNotConfiguredError extends Error {
  readonly status = 503;
  constructor() {
    super(
      "DATABASE_URL is not set. Attach a Postgres database to this project " +
        "(Vercel → Storage → Neon) or set DATABASE_URL locally in .env.",
    );
    this.name = "DatabaseNotConfiguredError";
  }
}

let cached: NeonHttpDatabase | null = null;

/**
 * Lazily builds the Drizzle client.
 *
 * Deliberately not evaluated at module load: if it were, a missing
 * DATABASE_URL would crash the whole serverless function at import time and
 * every route would return an opaque platform error. Resolving on first use
 * means a misconfigured deployment still boots and reports a clear 503 from
 * /api/health.
 */
export function getDb(): NeonHttpDatabase {
  if (cached) return cached;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new DatabaseNotConfiguredError();

  cached = drizzle(neon(connectionString));
  return cached;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
