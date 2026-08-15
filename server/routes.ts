import type { Express } from "express";
import type { Server } from "node:http";
import { storage } from "./storage";
import { insertAppointmentSchema } from "@shared/schema";

export async function registerRoutes(
  _httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/repairs/:number", async (req, res) => {
    const repair = await storage.getRepair(req.params.number);
    if (!repair) return res.status(404).json({ message: "Repair not found" });
    res.json({
      ...repair,
      notes: JSON.parse(repair.notes),
      steps: [
        "Battery received",
        "Diagnostic completed",
        "Quote approved",
        "Repair in progress",
        "Testing",
        "Ready for pickup",
      ],
    });
  });

  app.get("/api/repairs", async (_req, res) => {
    const list = await storage.listRepairs();
    res.json(list.map((r) => ({ ...r, notes: JSON.parse(r.notes) })));
  });

  app.post("/api/appointments", async (req, res) => {
    const parsed = insertAppointmentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid appointment data", errors: parsed.error.flatten() });
    }
    const created = await storage.createAppointment(parsed.data);
    res.status(201).json(created);
  });

  app.get("/api/appointments/:confirmation", async (req, res) => {
    const appt = await storage.getAppointment(req.params.confirmation);
    if (!appt) return res.status(404).json({ message: "Appointment not found" });
    res.json(appt);
  });

  return _httpServer;
}
