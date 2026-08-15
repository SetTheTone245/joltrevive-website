import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import type * as z from "zod/mini";

// Repair tracking records (seeded with sample repairs for the demo)
export const repairs = sqliteTable("repairs", {
  repairNumber: text("repair_number").primaryKey(),
  vehicle: text("vehicle").notNull(),
  service: text("service").notNull(),
  statusIndex: integer("status_index").notNull().default(0),
  receivedAt: text("received_at").notNull(),
  estimatedReady: text("estimated_ready").notNull(),
  technician: text("technician").notNull(),
  notes: text("notes").notNull(), // JSON array of strings
});

export const appointments = sqliteTable("appointments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  confirmation: text("confirmation").notNull().unique(),
  service: text("service").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  notes: text("notes").default(""),
  createdAt: text("created_at").notNull(),
});

export const insertAppointmentSchema = createInsertSchema(appointments).pick({
  service: true,
  date: true,
  time: true,
  name: true,
  email: true,
  phone: true,
  notes: true,
});

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type Repair = typeof repairs.$inferSelect;
