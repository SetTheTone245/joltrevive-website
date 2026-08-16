import type { Express } from "express";
import { storage } from "./storage.js";
import { insertAppointmentSchema } from "../shared/schema.js";
import { isDatabaseConfigured } from "./db.js";

const REPAIR_STEPS = [
  "Battery received",
  "Diagnostic completed",
  "Quote approved",
  "Repair in progress",
  "Testing",
  "Ready for pickup",
];

/** Notes are stored as a JSON array in a text column; tolerate bad data. */
function parseNotes(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export async function registerRoutes(app: Express): Promise<Express> {
  // Liveness + database reachability, for uptime checks and post-deploy smoke tests.
  app.get("/api/health", async (_req, res) => {
    if (!isDatabaseConfigured()) {
      return res.status(503).json({
        status: "degraded",
        database: "not_configured",
        detail: "DATABASE_URL is not set on this deployment.",
      });
    }
    try {
      const repairs = await storage.listRepairs();
      res.json({
        status: "ok",
        database: "connected",
        repairs: repairs.length,
        time: new Date().toISOString(),
      });
    } catch (err) {
      console.error("health check failed:", err);
      res.status(503).json({ status: "degraded", database: "unreachable" });
    }
  });

  app.get("/api/repairs/:number", async (req, res, next) => {
    try {
      const repair = await storage.getRepair(req.params.number);
      if (!repair) return res.status(404).json({ message: "Repair not found" });
      res.json({
        ...repair,
        notes: parseNotes(repair.notes),
        steps: REPAIR_STEPS,
      });
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/repairs", async (_req, res, next) => {
    try {
      const list = await storage.listRepairs();
      res.json(list.map((r) => ({ ...r, notes: parseNotes(r.notes), steps: REPAIR_STEPS })));
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/appointments", async (req, res, next) => {
    try {
      const parsed = insertAppointmentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: "Invalid appointment data",
          errors: parsed.error.flatten(),
        });
      }
      const created = await storage.createAppointment(parsed.data);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/appointments/:confirmation", async (req, res, next) => {
    try {
      const appt = await storage.getAppointment(req.params.confirmation);
      if (!appt) return res.status(404).json({ message: "Appointment not found" });
      res.json(appt);
    } catch (err) {
      next(err);
    }
  });

  return app;
}
