// Jolt Revive — site-wide static content (prototype data)

import { Battery } from "./batteryCatalog";

export interface Service {
  id: string;
  name: string;
  startingPrice: number;
  priceNote: string;
  blurb: string;
  icon: string;
  steps: string[];
}

export const SERVICES: Service[] = [
  {
    id: "diagnostic",
    name: "Diagnostic Services",
    startingPrice: 80,
    priceNote: "Labor only. Diagnostic fee credited toward repair if you proceed.",
    blurb: "Full battery health audit: cell voltage, capacity, internal resistance, and BMS fault scan.",
    icon: "stethoscope",
    steps: ["Receive battery", "Visual & connector inspection", "Cell-level voltage scan", "Capacity & IR test", "BMS fault code read", "Detailed report"],
  },
  {
    id: "repair",
    name: "Battery Repair",
    startingPrice: 149,
    priceNote: "Labor only. Replacement cells, connectors, and parts billed separately.",
    blurb: "Targeted fixes for failed cells, connectors, wiring, and BMS communication faults.",
    icon: "wrench",
    steps: ["Receive battery", "Diagnostic", "Quote approval", "Replace failed cells", "Repair connectors/wiring", "Load test", "Ready for pickup"],
  },
  {
    id: "rebuilding",
    name: "Battery Rebuilding",
    startingPrice: 249,
    priceNote: "Labor only. New cells and BMS components billed separately.",
    blurb: "Full teardown and cell refresh — new cells installed across all parallel groups with BMS reprogram.",
    icon: "hammer",
    steps: ["Receive battery", "Teardown & cell map", "Quote approval", "Full cell refresh", "Repack & spot weld", "BMS reprogram", "Load test", "Ready for pickup"],
  },
  {
    id: "cell-replacement",
    name: "Cell Replacement",
    startingPrice: 199,
    priceNote: "Labor only. Replacement cells billed separately at parts pricing.",
    blurb: "Swap out degraded or imbalanced cells with grade-A matched replacements.",
    icon: "battery",
    steps: ["Receive battery", "Cell map & imbalance check", "Quote approval", "Replace degraded cells", "Rebalance pack", "Capacity test", "Ready for pickup"],
  },
  {
    id: "bms-replacement",
    name: "BMS Replacement",
    startingPrice: 149,
    priceNote: "Labor only. Replacement BMS board billed separately.",
    blurb: "Failed or misbehaving battery management system? We replace and reprogram the BMS board.",
    icon: "circuit",
    steps: ["Receive battery", "BMS diagnostic", "Quote approval", "Replace BMS board", "Reprogram & pair cells", "Charge/discharge test", "Ready for pickup"],
  },
  {
    id: "connector-repair",
    name: "Connector Repair",
    startingPrice: 79,
    priceNote: "Labor only. Replacement connectors billed separately.",
    blurb: "Damaged charge or discharge connectors, broken pins, and shorted leads — fast turnaround.",
    icon: "plug",
    steps: ["Receive battery", "Connector inspection", "Quote approval", "Replace connector", "Reseal & insulate", "Continuity test", "Ready for pickup"],
  },
];

export interface RepairStatusStep {
  key: string;
  label: string;
  done: boolean;
}

export interface RepairRecord {
  repairNumber: string;
  vehicle: string;
  service: string;
  statusIndex: number; // index of current step (0..n-1)
  receivedAt: string;
  estimatedReady: string;
  technician: string;
  notes: string[];
  steps: string[];
}

const REPAIR_STEPS = [
  "Battery received",
  "Diagnostic completed",
  "Quote approved",
  "Repair in progress",
  "Testing",
  "Ready for pickup",
];

export function repairSteps(): string[] {
  return REPAIR_STEPS;
}

export const SAMPLE_REPAIRS: RepairRecord[] = [
  {
    repairNumber: "JR-10287",
    vehicle: "Sur-Ron Light Bee X",
    service: "Battery Rebuilding",
    statusIndex: 3,
    receivedAt: "Aug 11, 2026",
    estimatedReady: "Aug 16, 2026",
    technician: "Alex M.",
    notes: ["8 of 14 cells below 70% capacity", "Installing Molicel P28A grade-A cells", "BMS firmware update pending"],
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
    notes: ["Original BMS had a blown MOSFET", "Replacement board installed & paired", "Awaiting customer pickup"],
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
];

export interface Testimonial {
  author: string;
  vehicle: string;
  rating: number;
  text: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    author: "Marcus T.",
    vehicle: "Sur-Ron Light Bee X",
    rating: 5,
    text: "My Sur-Ron battery stopped charging. Jolt Revive rebuilt it in three days, and it performs better than it did when it was new.",
  },
  {
    author: "Elena V.",
    vehicle: "Aventon Level.2",
    rating: 5,
    text: "Excellent communication and fair pricing. They texted me photos and a quote before touching anything.",
  },
  {
    author: "Chris D.",
    vehicle: "Segway Ninebot Max G2",
    rating: 5,
    text: "The online battery finder helped me identify the exact replacement battery for my scooter. Pickup was easy.",
  },
];

export interface Phase2Feature {
  name: string;
  blurb: string;
  icon: string;
}

export const PHASE2: Phase2Feature[] = [
  {
    name: "Battery Builder",
    blurb: "Choose chemistry, voltage, capacity, and cell manufacturer — get an instant custom battery estimate.",
    icon: "sliders",
  },
  {
    name: "AI Diagnostic Assistant",
    blurb: "Answer a few questions about charging behavior and symptoms — get a recommended service path.",
    icon: "sparkles",
  },
];

export const STORE_INFO = {
  name: "Jolt Revive",
  address: "1401 Blondell Avenue, Bronx, NY 10461",
  addressShort: "1401 Blondell Ave, Bronx, NY 10461",
  mapsQuery: "1401 Blondell Avenue, Bronx, NY 10461",
  hours: [
    { day: "Mon – Fri", time: "9:00 AM – 7:00 PM" },
    { day: "Saturday", time: "10:00 AM – 6:00 PM" },
    { day: "Sunday", time: "11:00 AM – 4:00 PM" },
  ],
  phone: "844-NYC-JOLT",
  phoneTel: "+18446925658",
  email: "Admin@JoltRevive.com",
};

export function formatPrice(n: number): string {
  return "$" + n.toLocaleString("en-US");
}

export function conditionLabel(c: Battery["condition"]): string {
  switch (c) {
    case "new": return "New";
    case "refurbished": return "Refurbished";
    case "rebuilt": return "Rebuilt";
    case "out-of-stock": return "Out of stock";
  }
}

export function conditionBadgeClass(c: Battery["condition"]): string {
  switch (c) {
    case "new": return "bg-primary/15 text-primary border-primary/30";
    case "refurbished": return "bg-chart-3/15 text-chart-3 border-chart-3/30";
    case "rebuilt": return "bg-chart-2/15 text-chart-2 border-chart-2/30";
    default: return "bg-destructive/15 text-destructive border-destructive/30";
  }
}
