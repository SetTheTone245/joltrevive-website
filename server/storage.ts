import { repairs, appointments } from "@shared/schema";
import type { Repair, Appointment, InsertAppointment } from "@shared/schema";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq } from "drizzle-orm";

const sqlite = new Database("data.db");
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite);

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

export class DatabaseStorage implements IStorage {
  constructor() {
    this.seed();
  }

  private seed() {
    try {
      sqlite.exec("CREATE TABLE IF NOT EXISTS repairs (repair_number TEXT PRIMARY KEY, vehicle TEXT NOT NULL, service TEXT NOT NULL, status_index INTEGER NOT NULL, received_at TEXT NOT NULL, estimated_ready TEXT NOT NULL, technician TEXT NOT NULL, notes TEXT NOT NULL)");
      sqlite.exec("CREATE TABLE IF NOT EXISTS appointments (id INTEGER PRIMARY KEY AUTOINCREMENT, confirmation TEXT NOT NULL UNIQUE, service TEXT NOT NULL, date TEXT NOT NULL, time TEXT NOT NULL, name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL, notes TEXT DEFAULT '', created_at TEXT NOT NULL)");
      const existing = db.select().from(repairs).all();
      if (existing.length === 0) {
        for (const r of SEED_REPAIRS) {
          db.insert(repairs).values({
            repairNumber: r.repairNumber,
            vehicle: r.vehicle,
            service: r.service,
            statusIndex: r.statusIndex,
            receivedAt: r.receivedAt,
            estimatedReady: r.estimatedReady,
            technician: r.technician,
            notes: JSON.stringify(r.notes),
          }).run();
        }
      }
    } catch (e) {
      console.error("seed error", e);
    }
  }

  async getRepair(repairNumber: string): Promise<Repair | undefined> {
    const r = db.select().from(repairs).where(eq(repairs.repairNumber, repairNumber.toUpperCase())).get();
    if (!r) return undefined;
    return { ...r, notes: r.notes };
  }

  async listRepairs(): Promise<Repair[]> {
    return db.select().from(repairs).all();
  }

  async createAppointment(data: InsertAppointment): Promise<Appointment> {
    const confirmation = "JR-AP-" + Math.random().toString(36).slice(2, 7).toUpperCase();
    return db.insert(appointments).values({
      ...data,
      confirmation,
      createdAt: new Date().toISOString(),
    }).returning().get();
  }

  async getAppointment(confirmation: string): Promise<Appointment | undefined> {
    return db.select().from(appointments).where(eq(appointments.confirmation, confirmation.toUpperCase())).get();
  }
}

export const storage = new DatabaseStorage();
