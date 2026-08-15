// Client-side static data layer.
// Replicates the Express/SQLite backend so the built site runs on any static
// host (Netlify, Vercel, S3, GitHub Pages, etc.) with no server required.
// Repair records are seeded (demo); appointment bookings are stored in
// localStorage so a user can look up their confirmation after a refresh.

export interface RepairResponse {
  repairNumber: string;
  vehicle: string;
  service: string;
  statusIndex: number;
  receivedAt: string;
  estimatedReady: string;
  technician: string;
  notes: string[];
  steps: string[];
}

export interface AppointmentInput {
  service: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
}

export interface Appointment {
  id: number;
  confirmation: string;
  service: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
  createdAt: string;
}

export const REPAIR_STEPS: string[] = [
  "Battery received",
  "Diagnostic completed",
  "Quote approved",
  "Repair in progress",
  "Testing",
  "Ready for pickup",
];

// Seeded demo repairs (mirrors server/storage.ts). These are sample records for
// the public tracking portal — customers enter their own JR-#### number.
const SEED_REPAIRS: RepairResponse[] = [
  {
    repairNumber: "JR-10287",
    vehicle: "Sur-Ron Light Bee X",
    service: "Battery Rebuilding",
    statusIndex: 3,
    receivedAt: "Aug 11, 2026",
    estimatedReady: "Aug 16, 2026",
    technician: "Alex M.",
    notes: [
      "8 of 14 cells below 70% capacity",
      "Installing Molicel P28A grade-A cells",
      "BMS firmware update pending",
    ],
    steps: REPAIR_STEPS,
  },
  {
    repairNumber: "JR-10312",
    vehicle: "Aventon Aventure.2",
    service: "BMS Replacement",
    statusIndex: 5,
    receivedAt: "Aug 10, 2026",
    estimatedReady: "Aug 15, 2026",
    technician: "Sam R.",
    notes: [
      "Original BMS had a blown MOSFET",
      "Replacement board installed & paired",
      "Awaiting customer pickup",
    ],
    steps: REPAIR_STEPS,
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
    steps: REPAIR_STEPS,
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
    steps: REPAIR_STEPS,
  },
];

const APPOINTMENTS_KEY = "joltrevive:appointments";

function readAppointments(): Appointment[] {
  try {
    const raw = localStorage.getItem(APPOINTMENTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAppointments(list: Appointment[]) {
  try {
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(list));
  } catch {
    /* localStorage may be unavailable (e.g. private mode) — ignore */
  }
}

// Simulate network latency so loading states behave as in the live demo.
function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export async function lookupRepair(
  number: string,
): Promise<RepairResponse | undefined> {
  await delay(350);
  const normalized = number.trim().toUpperCase();
  return SEED_REPAIRS.find((r) => r.repairNumber === normalized);
}

export async function createAppointment(
  input: AppointmentInput,
): Promise<Appointment> {
  await delay(450);
  const confirmation =
    "JR-AP-" + Math.random().toString(36).slice(2, 7).toUpperCase();
  const list = readAppointments();
  const appointment: Appointment = {
    id: list.length + 1,
    confirmation,
    service: input.service,
    date: input.date,
    time: input.time,
    name: input.name,
    email: input.email,
    phone: input.phone,
    notes: input.notes || "",
    createdAt: new Date().toISOString(),
  };
  list.push(appointment);
  writeAppointments(list);
  return appointment;
}

export async function getAppointment(
  confirmation: string,
): Promise<Appointment | undefined> {
  await delay(200);
  const normalized = confirmation.trim().toUpperCase();
  return readAppointments().find((a) => a.confirmation === normalized);
}
