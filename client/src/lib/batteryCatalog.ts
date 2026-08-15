// Jolt Revive — sample battery catalog (prototype data)
// Specs are illustrative sample values for the demo, not verified manufacturer data.

export type VehicleType = "E-Bike" | "E-Scooter" | "E-Motorcycle" | "E-Board";
export type BatteryCondition = "new" | "refurbished" | "rebuilt" | "out-of-stock";
export type Chemistry = "Li-ion NMC" | "LiFePO4" | "Li-ion NCA" | "LiPo";

export interface RefurbishedDetail {
  remainingCapacityPct: number;
  cycleCount: number;
  newCells: string;
  testResult: string;
}

export interface BatteryReview {
  author: string;
  rating: number;
  text: string;
  date: string;
}

export interface Battery {
  id: string;
  sku: string;
  vehicleType: VehicleType;
  brand: string;
  model: string;
  name: string;
  voltage: number;
  capacityAh: number;
  wattHours: number;
  chemistry: Chemistry;
  cellManufacturer: string;
  estRangeMiles: number;
  warrantyMonths: number;
  dimensions: string;
  chargeTimeHours: number;
  condition: BatteryCondition;
  price: number;
  compareAt?: number;
  rating: number;
  reviewCount: number;
  featured: boolean;
  inStock: boolean;
  hue: number;
  refurbished?: RefurbishedDetail;
  reviews?: BatteryReview[];
}

// --- Source brand/model matrix (real brands from the brief) ---
const MATRIX: Record<VehicleType, { brand: string; models: string[] }[]> = {
  "E-Bike": [
    { brand: "Aventon", models: ["Aventure.2", "Level.2", "Pace 500.3", "Sinch.2"] },
    { brand: "Trek", models: ["Verve+", "Allant+", "FX+", "Domane+"] },
    { brand: "Rad Power", models: ["RadRover 6", "RadCity 5", "RadMini 4", "RadExpand 5"] },
    { brand: "Lectric", models: ["XP 3.0", "XPremium 3", "XPeak", "XP 2.0"] },
    { brand: "Specialized", models: ["Turbo Vado", "Turbo Como", "Turbo Tero"] },
    { brand: "Giant", models: ["Explore E+", "Road E+", "Vall E+"] },
  ],
  "E-Scooter": [
    { brand: "Segway", models: ["Ninebot Max G2", "Ninebot F40", "E2 Pro", "F2 Pro"] },
    { brand: "NIU", models: ["KQi3 Max", "KQi Air", "BQi Sport"] },
    { brand: "Apollo", models: ["City Pro", "Air 2024", "Phantom V3"] },
    { brand: "Hiboy", models: ["S2 Pro", "S2 Max", "NEX5", "Ek8"] },
    { brand: "Kaabo", models: ["Mantis 8", "Mantis 10", "Wolf Warrior GT"] },
    { brand: "Gotrax", models: ["G4", "GX2", "G Max Ultra"] },
  ],
  "E-Motorcycle": [
    { brand: "Sur-Ron", models: ["Light Bee X", "Ultra Bee", "Storm Bee"] },
    { brand: "Talaria", models: ["Sting R", "MX3", "FX3"] },
    { brand: "E Ride Pro", models: ["SS 2.0", "SS 3.0", "SR"] },
    { brand: "Zero", models: ["SR", "FX", "DSR"] },
    { brand: "Stark", models: ["Varg EX", "Varg Standard"] },
  ],
  "E-Board": [
    { brand: "Boosted", models: ["Stealth", "Mini X", "Plus", "Mini S"] },
    { brand: "Meepo", models: ["V4", "Shuffle", "Voyager", "Atom"] },
    { brand: "Exway", models: ["X1 Pro", "Flex", "Atlas", "Wave"] },
    { brand: "Backfire", models: ["Zealot", "G2 Black", "Ranger X1"] },
    { brand: "Evolve", models: ["GTR", "Stoke", "Hadean"] },
  ],
};

const CELLS = ["Samsung 25R", "Samsung 30Q", "LG MJ1", "LG HG2", "Panasonic NCR18650GA", "Molicel P26A", "Molicel P28A", "Sony VTC6", "EVE 25P", "BAK N18650"];
const CHEMS: Chemistry[] = ["Li-ion NMC", "Li-ion NMC", "Li-ion NCA", "LiFePO4"];

// deterministic PRNG so the catalog is stable across renders
function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

const VEHICLE_VOLTAGE: Record<VehicleType, number[]> = {
  "E-Bike": [36, 48],
  "E-Scooter": [36, 48, 60],
  "E-Motorcycle": [60, 72, 96],
  "E-Board": [36, 42],
};

const VEHICLE_RANGE_BASE: Record<VehicleType, number> = {
  "E-Bike": 45,
  "E-Scooter": 32,
  "E-Motorcycle": 70,
  "E-Board": 16,
};

function roundWh(v: number, ah: number) {
  return Math.round(v * ah);
}

function pad(n: number, len = 4) {
  return String(n).padStart(len, "0");
}

const FEATURED_REVIEWS: BatteryReview[] = [
  { author: "Marcus T.", rating: 5, text: "Dropped in perfectly on my Aventure.2 — range is back to factory specs and the build quality looks better than OEM.", date: "2026-07-18" },
  { author: "Priya K.", rating: 5, text: "Jolt Revive diagnosed a dead BMS in one day and rebuilt my pack. Saved me from buying a whole new battery.", date: "2026-07-02" },
  { author: "Diego R.", rating: 4, text: "Solid replacement, fits well. Charging time matches the listed spec. Would recommend.", date: "2026-06-21" },
];

function buildCatalog(): Battery[] {
  const rand = seededRandom(20260815);
  const out: Battery[] = [];
  let counter = 1;

  const vehicleOrder: VehicleType[] = ["E-Bike", "E-Scooter", "E-Motorcycle", "E-Board"];

  for (const vt of vehicleOrder) {
    const brands = MATRIX[vt];
    for (const { brand, models } of brands) {
      for (const model of models) {
        const voltages = VEHICLE_VOLTAGE[vt];
        const v = voltages[Math.floor(rand() * voltages.length)];
        // base capacity varies by vehicle
        const capBase = vt === "E-Motorcycle" ? 40 : vt === "E-Board" ? 4 : vt === "E-Scooter" ? 15 : 14;
        const ah = Math.round((capBase + rand() * capBase * 0.8) * 10) / 10;
        const wh = roundWh(v, ah);
        const cell = CELLS[Math.floor(rand() * CELLS.length)];
        const chem = CHEMS[Math.floor(rand() * CHEMS.length)];
        const rangeBase = VEHICLE_RANGE_BASE[vt];
        const range = Math.round(rangeBase * (0.6 + rand() * 0.7) * (ah / capBase));
        const warranty = [6, 12, 12, 18, 24][Math.floor(rand() * 5)];
        const dims = vt === "E-Motorcycle"
          ? `${Math.round(280 + rand() * 120)} × ${Math.round(120 + rand() * 40)} × ${Math.round(90 + rand() * 30)} mm`
          : vt === "E-Board"
          ? `${Math.round(280 + rand() * 40)} × ${Math.round(130 + rand() * 20)} × ${Math.round(30 + rand() * 14)} mm`
          : `${Math.round(300 + rand() * 100)} × ${Math.round(80 + rand() * 30)} × ${Math.round(70 + rand() * 25)} mm`;
        const charge = Math.round((1.5 + rand() * 4) * 10) / 10;
        const hue = Math.floor(60 + rand() * 90); // green-yellow-cyan band
        const featured = counter <= 24 && rand() > 0.35;

        const basePrice = Math.round((wh * (vt === "E-Motorcycle" ? 1.9 : vt === "E-Board" ? 4.5 : 2.4)) * 100) / 100;

        // --- New variant ---
        out.push({
          id: `JR-${pad(counter)}`,
          sku: `${brand.slice(0, 3).toUpperCase()}-${model.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase()}-${v}V`,
          vehicleType: vt,
          brand,
          model,
          name: `${brand} ${model} ${v}V ${ah}Ah Pack`,
          voltage: v,
          capacityAh: ah,
          wattHours: wh,
          chemistry: chem,
          cellManufacturer: cell,
          estRangeMiles: range,
          warrantyMonths: warranty,
          dimensions: dims,
          chargeTimeHours: charge,
          condition: "new",
          price: Math.round(basePrice),
          rating: Math.round((4.2 + rand() * 0.7) * 10) / 10,
          reviewCount: Math.floor(4 + rand() * 80),
          featured: !!featured,
          inStock: rand() > 0.12,
          hue,
          ...(featured
            ? { reviews: FEATURED_REVIEWS.slice(0, 2 + Math.floor(rand() * 2)) }
            : {}),
        });
        counter++;

        // --- Refurbished variant (most models) ---
        if (rand() > 0.18) {
          const rem = Math.round((72 + rand() * 22) * 10) / 10;
          const cycles = Math.floor(90 + rand() * 420);
          const refPrice = Math.round(basePrice * (0.45 + rand() * 0.2));
          out.push({
            id: `JR-${pad(counter)}`,
            sku: `${brand.slice(0, 3).toUpperCase()}-${model.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase()}-${v}V-RFB`,
            vehicleType: vt,
            brand,
            model,
            name: `${brand} ${model} ${v}V ${ah}Ah Refurbished`,
            voltage: v,
            capacityAh: ah,
            wattHours: Math.round(wh * (rem / 100)),
            chemistry: chem,
            cellManufacturer: cell,
            estRangeMiles: Math.round(range * (rem / 100)),
            warrantyMonths: 6,
            dimensions: dims,
            chargeTimeHours: charge,
            condition: "refurbished",
            price: refPrice,
            compareAt: Math.round(basePrice),
            rating: Math.round((3.9 + rand() * 0.7) * 10) / 10,
            reviewCount: Math.floor(2 + rand() * 30),
            featured: false,
            inStock: rand() > 0.2,
            hue,
            refurbished: {
              remainingCapacityPct: rem,
              cycleCount: cycles,
              newCells: `${cell.split(" ")[0]} ${cell.split(" ")[1] || ""} (${Math.floor(rand() * 8 + 4)} cells replaced)`,
              testResult: `All parallel groups balanced within 2%. IR within spec. ${Math.floor(85 + rand() * 14)}% capacity retained.`,
            },
          });
          counter++;
        }

        // --- Rebuilt variant (some models) ---
        if (rand() > 0.5) {
          const rebuildPrice = Math.round(basePrice * (0.6 + rand() * 0.2));
          out.push({
            id: `JR-${pad(counter)}`,
            sku: `${brand.slice(0, 3).toUpperCase()}-${model.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase()}-${v}V-RB`,
            vehicleType: vt,
            brand,
            model,
            name: `${brand} ${model} ${v}V Rebuilt Pack`,
            voltage: v,
            capacityAh: Math.round((ah * 1.05) * 10) / 10,
            wattHours: roundWh(v, Math.round((ah * 1.05) * 10) / 10),
            chemistry: chem,
            cellManufacturer: cell,
            estRangeMiles: Math.round(range * 1.05),
            warrantyMonths: 12,
            dimensions: dims,
            chargeTimeHours: charge,
            condition: "rebuilt",
            price: rebuildPrice,
            compareAt: Math.round(basePrice * 1.1),
            rating: Math.round((4.3 + rand() * 0.6) * 10) / 10,
            reviewCount: Math.floor(1 + rand() * 22),
            featured: false,
            inStock: rand() > 0.25,
            hue,
            refurbished: {
              remainingCapacityPct: 98,
              cycleCount: 0,
              newCells: `Full cell refresh — ${cell} (all groups)`,
              testResult: "New cells installed, BMS reprogrammed, full load test passed.",
            },
          });
          counter++;
        }
      }
    }
  }

  // mark a few as out of stock
  for (let i = 0; i < 6; i++) {
    const idx = Math.floor(rand() * out.length);
    if (out[idx].condition === "new") out[idx].inStock = false;
  }
  return out;
}

export const batteries: Battery[] = buildCatalog();

export const VEHICLE_TYPES: { type: VehicleType; icon: string; blurb: string }[] = [
  { type: "E-Bike", icon: "🚲", blurb: "Commuter, fat-tire & cargo e-bikes" },
  { type: "E-Scooter", icon: "🛴", blurb: "Stand-up & seated electric scooters" },
  { type: "E-Motorcycle", icon: "🏍️", blurb: "Sur-Ron, Talaria, Zero & Stark" },
  { type: "E-Board", icon: "🛹", blurb: "Electric skateboards & longboards" },
];

export function getBrandsFor(vehicle: VehicleType): string[] {
  return MATRIX[vehicle].map((b) => b.brand);
}

export function getModelsFor(vehicle: VehicleType, brand: string): string[] {
  return MATRIX[vehicle].find((b) => b.brand === brand)?.models ?? [];
}

export function getBatteryById(id: string): Battery | undefined {
  return batteries.find((b) => b.id === id);
}

export function countByCondition(cond: BatteryCondition): number {
  return batteries.filter((b) => b.condition === cond).length;
}

export function featuredBatteries(): Battery[] {
  return batteries.filter((b) => b.featured).slice(0, 8);
}
