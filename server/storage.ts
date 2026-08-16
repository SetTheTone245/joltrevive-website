import { repairs, appointments } from "../shared/schema.js";
import type { Repair, Appointment, InsertAppointment } from "../shared/schema.js";
import { getDb } from "./db.js";
import { eq, sql } from "drizzle-orm";

interface SeedRepair {
  repairNumber: string;
  vehicle: string;
  service: string;
  statusIndex: number;
  receivedAt: string;
  estimatedReady: string;
  technician: string;
  notes: string[];
}

const SEED_REPAIRS: SeedRepair[] = [
  {
    repairNumber: "JR-10287",
    vehicle: "Sur-Ron Light Bee X",
    service: "Battery Rebuilding",
    statusIndex: 3,
    receivedAt: "Aug 11, 2026",
    estimatedReady: "Aug 16, 2026",
    technician: "Alex M.",
    notes: ["8 of 14 cells below 70% capacity", "Installing Molicel P28A grade-A cells", "BMS firmware update pending"],
  },
  {
    repairNumber: "JR-10312",
    vehicle: "Aventon Aventure.2",
    service: "BMS Replacement",
    statusIndex: 5,
    receivedAt: "Aug 10, 2026",
    estimatedReady: "Aug 15, 2026",
    technician: "Sam R.",
    notes: ["Original BMS had a blown MOSFET", "Replacement board installed & paired", "Awaiting customer pickup"],
  },
  {
    repairNumber: "JR-10299",
    vehicle: "Segway Ninebot Max G2",
    service: "Connector Repair",
    statusIndex: 1,
    receivedAt: "Aug 14, 2026",
    estimatedReady: "Aug 18, 2026",
    technician: "Jordan P.",
    notes: ["Charge port corroded", "Preparing diagnostic report"],
  },
  {
    repairNumber: "JR-10340",
    vehicle: "Boosted Stealth",
    service: "Cell Replacement",
    statusIndex: 2,
    receivedAt: "Aug 14, 2026",
    estimatedReady: "Aug 19, 2026",
    technician: "Alex M.",
    notes: ["2 cells in group 3 imbalanced", "Quote sent to customer"],
  },
];

export interface IStorage {
  getRepair(repairNumber: string): Promise<Repair | undefined>;
  listRepairs(): Promise<Repair[]>;
  createAppointment(data: InsertAppointment): Promise<Appointment>;
  getAppointment(confirmation: string): Promise<Appointment | undefined>;
}

// Schema creation + seeding runs at most once per serverless instance.
// The promise is cached so concurrent requests share a single initialisation.
let readyPromise: Promise<void> | null = null;

function initialise(): Promise<void> {
  if (!readyPromise) {
    readyPromise = (async () => {
      await getDb().execute(sql`
        CREATE TABLE IF NOT EXISTS repairs (
          repair_number TEXT PRIMARY KEY,
          vehicle TEXT NOT NULL,
          service TEXT NOT NULL,
          status_index INTEGER NOT NULL DEFAULT 0,
          received_at TEXT NOT NULL,
          estimated_ready TEXT NOT NULL,
          technician TEXT NOT NULL,
          notes TEXT NOT NULL
        )
      `);

      await getDb().execute(sql`
        CREATE TABLE IF NOT EXISTS appointments (
          id SERIAL PRIMARY KEY,
          confirmation TEXT NOT NULL UNIQUE,
          service TEXT NOT NULL,
          date TEXT NOT NULL,
          time TEXT NOT NULL,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL,
          notes TEXT DEFAULT '',
          created_at TEXT NOT NULL
        )
      `);

      // Idempotent seed — ON CONFLICT means re-running never duplicates or
      // overwrites a record an operator has since edited.
      for (const r of SEED_REPAIRS) {
        await getDb()
          .insert(repairs)
          .values({
            repairNumber: r.repairNumber,
            vehicle: r.vehicle,
            service: r.service,
            statusIndex: r.statusIndex,
            receivedAt: r.receivedAt,
            estimatedReady: r.estimatedReady,
            technician: r.technician,
            notes: JSON.stringify(r.notes),
          })
          .onConflictDoNothing();
      }
    })().catch((err) => {
      // Reset so a transient failure (cold Neon branch, network blip) can retry
      // on the next request instead of poisoning the whole instance.
      readyPromise = null;
      throw err;
    });
  }
  return readyPromise;
}

export class DatabaseStorage implements IStorage {
  async getRepair(repairNumber: string): Promise<Repair | undefined> {
    await initialise();
    const rows = await getDb()
      .select()
      .from(repairs)
      .where(eq(repairs.repairNumber, repairNumber.trim().toUpperCase()))
      .limit(1);
    return rows[0];
  }

  async listRepairs(): Promise<Repair[]> {
    await initialise();
    return getDb().select().from(repairs);
  }

  async createAppointment(data: InsertAppointment): Promise<Appointment> {
    await initialise();
    // Retry on the (astronomically unlikely) confirmation-code collision rather
    // than returning a 500 to a customer who is trying to book.
    for (let attempt = 0; attempt < 5; attempt++) {
      const confirmation = "JR-AP-" + Math.random().toString(36).slice(2, 7).toUpperCase();
      const rows = await getDb()
        .insert(appointments)
        .values({
          ...data,
          confirmation,
          createdAt: new Date().toISOString(),
        })
        .onConflictDoNothing({ target: appointments.confirmation })
        .returning();
      if (rows[0]) return rows[0];
    }
    throw new Error("Could not allocate a unique confirmation code");
  }

  async getAppointment(confirmation: string): Promise<Appointment | undefined> {
    await initialise();
    const rows = await getDb()
      .select()
      .from(appointments)
      .where(eq(appointments.confirmation, confirmation.trim().toUpperCase()))
      .limit(1);
    return rows[0];
  }
}

export const storage = new DatabaseStorage();
