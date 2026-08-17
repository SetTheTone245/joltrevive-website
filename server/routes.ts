import type { Express } from "express";
import { timingSafeEqual } from "node:crypto";
import Stripe from "stripe";
import { z } from "zod";
import { storage } from "./storage.js";
import { insertAppointmentSchema } from "../shared/schema.js";
import { isDatabaseConfigured } from "./db.js";
import { getCatalogCheckoutItem } from "./catalog.js";
import { notifyOwner } from "./notifications.js";

const REPAIR_STEPS = [
  "Battery received",
  "Diagnostic completed",
  "Quote approved",
  "Repair in progress",
  "Testing",
  "Ready for pickup",
];

const SITE_URL = "https://www.joltrevive.com";
const checkoutRequestSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().trim().min(1).max(100),
        quantity: z.coerce.number().int().min(1).max(25),
      }),
    )
    .min(1)
    .max(50),
  fulfillment: z.enum(["ship", "pickup"]),
  email: z.string().trim().email().max(320),
});

const contactRequestSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().max(100).optional().nullable(),
  message: z.string().trim().min(1).max(5000),
});

/** Notes are stored as a JSON array in a text column; tolerate bad data. */
function parseNotes(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function readAdminToken(req: { get(name: string): string | undefined; query: Record<string, unknown> }) {
  const authorization = req.get("authorization");
  if (authorization?.startsWith("Bearer ")) return authorization.slice("Bearer ".length).trim();
  return typeof req.query.token === "string" ? req.query.token : "";
}

function adminAuthorized(req: { get(name: string): string | undefined; query: Record<string, unknown> }) {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return false;
  const supplied = readAdminToken(req);
  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(supplied);
  return (
    expectedBuffer.length === suppliedBuffer.length &&
    timingSafeEqual(expectedBuffer, suppliedBuffer)
  );
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
      await notifyOwner({
        subject: `New Jolt Revive appointment: ${created.service}`,
        text: [
          `Name: ${created.name}`,
          `Email: ${created.email}`,
          `Phone: ${created.phone}`,
          `Service: ${created.service}`,
          `When: ${created.date} at ${created.time}`,
          `Confirmation: ${created.confirmation}`,
          `Notes: ${created.notes || "(none)"}`,
        ].join("\n"),
      });
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

  app.post("/api/contact", async (req, res, next) => {
    try {
      const parsed = contactRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: "Please provide a name, valid email address, and a message under 5,000 characters.",
          errors: parsed.error.flatten(),
        });
      }

      const created = await storage.createContactMessage(parsed.data);
      await notifyOwner({
        subject: `New Jolt Revive contact message from ${created.name}`,
        text: [
          `Name: ${created.name}`,
          `Email: ${created.email}`,
          `Phone: ${created.phone || "(not provided)"}`,
          "",
          created.message,
        ].join("\n"),
      });
      res.status(201).json({ ok: true, id: created.id });
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/checkout/config", (_req, res) => {
    res.json({ enabled: Boolean(process.env.STRIPE_SECRET_KEY) });
  });

  app.post("/api/checkout/session", async (req, res, next) => {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(503).json({
        message:
          "Card payments are being switched on — call 844-NYC-JOLT or visit the shop to complete this order.",
      });
    }

    const parsed = checkoutRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Your cart could not be validated. Please return to the cart and try again.",
        errors: parsed.error.flatten(),
      });
    }

    const lineItems = parsed.data.items.map((item) => {
      const product = getCatalogCheckoutItem(item.id);
      if (!product || !product.inStock) return undefined;
      return {
        price_data: {
          currency: "usd",
          product_data: { name: product.name },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: item.quantity,
      };
    });

    if (lineItems.some((item) => !item)) {
      return res.status(400).json({
        message: "One or more items are unavailable. Please review your cart and try again.",
      });
    }

    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: parsed.data.email,
        line_items: lineItems as Stripe.Checkout.SessionCreateParams.LineItem[],
        metadata: { fulfillment: parsed.data.fulfillment },
        success_url: `${SITE_URL}/#/checkout?status=success`,
        cancel_url: `${SITE_URL}/#/checkout?status=cancelled`,
        ...(parsed.data.fulfillment === "ship"
          ? {
              shipping_address_collection: { allowed_countries: ["US"] },
              shipping_options: [
                {
                  shipping_rate_data: {
                    display_name: "Standard shipping",
                    type: "fixed_amount",
                    fixed_amount: { amount: 1495, currency: "usd" },
                    delivery_estimate: {
                      minimum: { unit: "business_day", value: 2 },
                      maximum: { unit: "business_day", value: 4 },
                    },
                  },
                },
              ],
            }
          : {}),
      });

      if (!session.url) throw new Error("Stripe did not return a Checkout URL");
      return res.json({ url: session.url });
    } catch (err) {
      console.error("Stripe Checkout session creation failed:", err);
      return res.status(502).json({
        message:
          "Card payments could not be started. Call 844-NYC-JOLT or visit the shop to complete this order.",
      });
    }
  });

  app.get("/api/admin/submissions", async (req, res, next) => {
    if (!process.env.ADMIN_TOKEN) {
      return res.status(503).json({ message: "The admin view is not configured." });
    }
    if (!adminAuthorized(req)) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const [contactMessages, appointments, repairs] = await Promise.all([
        storage.listContactMessages(),
        storage.listAppointments(),
        storage.listRepairs(),
      ]);
      res.setHeader("Cache-Control", "no-store");
      res.json({
        contactMessages,
        appointments,
        repairs: repairs.sort(
          (a, b) => Date.parse(b.receivedAt) - Date.parse(a.receivedAt),
        ),
      });
    } catch (err) {
      next(err);
    }
  });

  return app;
}
