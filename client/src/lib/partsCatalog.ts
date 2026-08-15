// JoltRevive — battery parts catalog (prototype data)
// Individual components consumers can buy to build / repair a pack.
// Prices are competitive market baselines, then adjusted for supply & demand:
// brand demand multiplier + per-item scarcity + out-of-stock premium.

export type PartCategory =
  | "Cells"
  | "BMS"
  | "Chargers"
  | "Connectors"
  | "Enclosures"
  | "Accessories";

export interface Part {
  kind: "part";
  id: string;
  sku: string;
  name: string;
  category: PartCategory;
  brand: string;
  spec: string;
  compatibility: string[];
  price: number;
  compareAt?: number;
  inStock: boolean;
  stockCount: number;
  rating: number;
  reviewCount: number;
  demandTier: "High" | "Standard" | "Value";
}

interface RawPart {
  name: string;
  category: PartCategory;
  brand: string;
  spec: string;
  basePrice: number;
  compatibility: string[];
}

// Brand demand multipliers — premium cell/charger brands carry a premium,
// high-supply value brands sit below baseline.
const PART_DEMAND: Record<string, number> = {
  Samsung: 1.18,
  Molicel: 1.2,
  Sony: 1.15,
  Panasonic: 1.12,
  Grin: 1.22,
  Luna: 1.15,
  Daly: 1.08,
  JBD: 1.05,
  Smartduck: 1.03,
  ANT: 1.0,
  LG: 1.0,
  EVE: 0.95,
  BAK: 0.9,
  JoltRevive: 1.0,
  Generic: 0.92,
};

const PARTS_RAW: RawPart[] = [
  // --- Cells (18650 / 21700) ---
  { name: "Samsung 25R 18650 Cell", category: "Cells", brand: "Samsung", spec: "3.6V · 2500mAh · 20A", basePrice: 4.5, compatibility: ["E-Bike", "E-Scooter", "E-Board"] },
  { name: "Samsung 30Q 18650 Cell", category: "Cells", brand: "Samsung", spec: "3.6V · 3000mAh · 20A", basePrice: 6.0, compatibility: ["E-Bike", "E-Scooter", "E-Motorcycle"] },
  { name: "Samsung 40T 21700 Cell", category: "Cells", brand: "Samsung", spec: "3.6V · 4000mAh · 30A", basePrice: 9.0, compatibility: ["E-Motorcycle", "E-Bike"] },
  { name: "Samsung 50S 21700 Cell", category: "Cells", brand: "Samsung", spec: "3.6V · 5000mAh · 20A", basePrice: 11.5, compatibility: ["E-Motorcycle", "E-Bike"] },
  { name: "LG MJ1 18650 Cell", category: "Cells", brand: "LG", spec: "3.6V · 3500mAh · 10A", basePrice: 5.5, compatibility: ["E-Bike", "E-Board"] },
  { name: "LG HG2 18650 Cell", category: "Cells", brand: "LG", spec: "3.6V · 3000mAh · 20A", basePrice: 6.2, compatibility: ["E-Bike", "E-Scooter"] },
  { name: "Molicel P26A 18650 Cell", category: "Cells", brand: "Molicel", spec: "3.6V · 2600mAh · 35A", basePrice: 7.8, compatibility: ["E-Motorcycle", "E-Scooter"] },
  { name: "Molicel P28A 18650 Cell", category: "Cells", brand: "Molicel", spec: "3.6V · 2800mAh · 40A", basePrice: 8.5, compatibility: ["E-Motorcycle", "E-Scooter"] },
  { name: "Molicel P42A 21700 Cell", category: "Cells", brand: "Molicel", spec: "3.6V · 4000mAh · 45A", basePrice: 10.5, compatibility: ["E-Motorcycle", "E-Bike"] },
  { name: "Sony VTC6 18650 Cell", category: "Cells", brand: "Sony", spec: "3.6V · 3000mAh · 30A", basePrice: 7.2, compatibility: ["E-Scooter", "E-Motorcycle"] },
  { name: "Panasonic NCR18650GA Cell", category: "Cells", brand: "Panasonic", spec: "3.6V · 3500mAh · 10A", basePrice: 6.8, compatibility: ["E-Bike", "E-Board"] },
  { name: "EVE 25P 18650 Cell", category: "Cells", brand: "EVE", spec: "3.6V · 2500mAh · 25A", basePrice: 4.2, compatibility: ["E-Scooter", "E-Board"] },
  { name: "BAK N18650 Cell", category: "Cells", brand: "BAK", spec: "3.6V · 2600mAh · 15A", basePrice: 3.8, compatibility: ["E-Bike", "E-Board"] },

  // --- BMS boards ---
  { name: "JBD 36V 10A BMS (10S)", category: "BMS", brand: "JBD", spec: "10S · 36V · 10A continuous", basePrice: 18, compatibility: ["E-Bike", "E-Board"] },
  { name: "JBD 48V 20A BMS (13S)", category: "BMS", brand: "JBD", spec: "13S · 48V · 20A continuous", basePrice: 26, compatibility: ["E-Bike", "E-Scooter"] },
  { name: "JBD 60V 30A BMS (15S)", category: "BMS", brand: "JBD", spec: "15S · 60V · 30A continuous", basePrice: 38, compatibility: ["E-Scooter", "E-Motorcycle"] },
  { name: "Daly 72V 40A BMS (20S)", category: "BMS", brand: "Daly", spec: "20S · 72V · 40A continuous", basePrice: 52, compatibility: ["E-Motorcycle", "E-Scooter"] },
  { name: "Daly 72V 60A BMS (20S)", category: "BMS", brand: "Daly", spec: "20S · 72V · 60A continuous", basePrice: 68, compatibility: ["E-Motorcycle"] },
  { name: "ANT 36V 20A Bluetooth BMS", category: "BMS", brand: "ANT", spec: "10S · 36V · 20A · BT app", basePrice: 42, compatibility: ["E-Bike", "E-Board"] },
  { name: "JBD 48V 30A Bluetooth BMS", category: "BMS", brand: "JBD", spec: "13S · 48V · 30A · BT app", basePrice: 55, compatibility: ["E-Bike", "E-Scooter"] },
  { name: "Smartduck 60V 40A Smart BMS", category: "BMS", brand: "Smartduck", spec: "15S · 60V · 40A · BT + CAN", basePrice: 72, compatibility: ["E-Scooter", "E-Motorcycle"] },
  { name: "Daly 84V 50A BMS (24S)", category: "BMS", brand: "Daly", spec: "24S · 84V · 50A continuous", basePrice: 89, compatibility: ["E-Motorcycle"] },
  { name: "JBD 100.8V 60A BMS (24S)", category: "BMS", brand: "JBD", spec: "24S · 100.8V · 60A continuous", basePrice: 115, compatibility: ["E-Motorcycle"] },

  // --- Chargers ---
  { name: "42V 2A Charger (36V pack)", category: "Chargers", brand: "JoltRevive", spec: "42V · 2A · CC/CV", basePrice: 24, compatibility: ["E-Bike", "E-Board"] },
  { name: "42V 5A Fast Charger (36V)", category: "Chargers", brand: "JoltRevive", spec: "42V · 5A · CC/CV", basePrice: 48, compatibility: ["E-Bike", "E-Scooter"] },
  { name: "54.6V 2A Charger (48V pack)", category: "Chargers", brand: "JoltRevive", spec: "54.6V · 2A · CC/CV", basePrice: 28, compatibility: ["E-Bike", "E-Scooter"] },
  { name: "54.6V 4A Charger (48V pack)", category: "Chargers", brand: "JoltRevive", spec: "54.6V · 4A · CC/CV", basePrice: 46, compatibility: ["E-Bike", "E-Scooter"] },
  { name: "60V 5A Charger (60V pack)", category: "Chargers", brand: "JoltRevive", spec: "60V · 5A · CC/CV", basePrice: 58, compatibility: ["E-Scooter", "E-Motorcycle"] },
  { name: "71.4V 5A Charger (72V pack)", category: "Chargers", brand: "JoltRevive", spec: "71.4V · 5A · CC/CV", basePrice: 72, compatibility: ["E-Motorcycle", "E-Scooter"] },
  { name: "84V 5A Charger (72V pack)", category: "Chargers", brand: "JoltRevive", spec: "84V · 5A · CC/CV", basePrice: 95, compatibility: ["E-Motorcycle"] },
  { name: "100.8V 5A Charger (96V pack)", category: "Chargers", brand: "JoltRevive", spec: "100.8V · 5A · CC/CV", basePrice: 120, compatibility: ["E-Motorcycle"] },
  { name: "Grin Satiator Programmable Charger", category: "Chargers", brand: "Grin", spec: "36–100V · 8A · programmable", basePrice: 195, compatibility: ["E-Bike", "E-Scooter", "E-Motorcycle", "E-Board"] },
  { name: "Luna Advanced 52V 6A Charger", category: "Chargers", brand: "Luna", spec: "58.8V · 6A · CC/CV", basePrice: 89, compatibility: ["E-Bike", "E-Scooter"] },

  // --- Connectors ---
  { name: "XT60 Connector Pair", category: "Connectors", brand: "Generic", spec: "60A · 2-pin · gold-plated", basePrice: 2.5, compatibility: ["E-Bike", "E-Scooter", "E-Board"] },
  { name: "XT90 Connector Pair", category: "Connectors", brand: "Generic", spec: "90A · 2-pin · gold-plated", basePrice: 4.5, compatibility: ["E-Scooter", "E-Motorcycle"] },
  { name: "XT90H Anti-Spark Pair", category: "Connectors", brand: "Generic", spec: "90A · 2-pin · anti-spark", basePrice: 6.5, compatibility: ["E-Motorcycle", "E-Scooter"] },
  { name: "AS150 Connector Pair", category: "Connectors", brand: "Generic", spec: "150A · 2-pin · gold-plated", basePrice: 8.0, compatibility: ["E-Motorcycle"] },
  { name: "MT60 3-Pin Connector Pair", category: "Connectors", brand: "Generic", spec: "60A · 3-pin · gold-plated", basePrice: 3.5, compatibility: ["E-Bike", "E-Board"] },
  { name: "Deans T-Plug Pair", category: "Connectors", brand: "Generic", spec: "50A · 2-pin · gold-plated", basePrice: 2.0, compatibility: ["E-Board", "E-Scooter"] },
  { name: "GX16 3-Pin Charging Port", category: "Connectors", brand: "Generic", spec: "16mm · 3-pin · panel-mount", basePrice: 4.0, compatibility: ["E-Bike", "E-Scooter"] },
  { name: "Anderson SB50 Pair", category: "Connectors", brand: "Generic", spec: "50A · 2-pin · PP45", basePrice: 5.5, compatibility: ["E-Bike", "E-Motorcycle"] },

  // --- Enclosures ---
  { name: "Universal Hard Battery Case", category: "Enclosures", brand: "JoltRevive", spec: "Hailong-style · ABS · water-resistant", basePrice: 45, compatibility: ["E-Bike"] },
  { name: "E-Bike Triangle Frame Bag", category: "Enclosures", brand: "JoltRevive", spec: "600D · velcro mount · fits 13S", basePrice: 28, compatibility: ["E-Bike"] },
  { name: "18650 Heat-Shrink Pack Wrap", category: "Enclosures", brand: "Generic", spec: "0.2mm PVC · 18650 packs", basePrice: 9, compatibility: ["E-Bike", "E-Scooter", "E-Board"] },
  { name: "PVC Heat-Shrink Roll (1m)", category: "Enclosures", brand: "Generic", spec: "0.15mm · 100mm wide", basePrice: 7, compatibility: ["E-Bike", "E-Scooter", "E-Board"] },

  // --- Accessories ---
  { name: "Silicone Wire 10AWG (1m)", category: "Accessories", brand: "Generic", spec: "10 AWG · 600V · high-strand silicone", basePrice: 6, compatibility: ["E-Bike", "E-Scooter", "E-Motorcycle"] },
  { name: "Pure Nickel Strip 0.15×8mm (10m)", category: "Accessories", brand: "Generic", spec: "0.15mm · pure Ni · spot-weld", basePrice: 16, compatibility: ["E-Bike", "E-Scooter", "E-Board"] },
  { name: "Nickel-Plated Strip 0.1×8mm (10m)", category: "Accessories", brand: "Generic", spec: "0.1mm · Ni-plated steel", basePrice: 9, compatibility: ["E-Bike", "E-Board"] },
  { name: "Copper Strip 0.1×8mm (5m)", category: "Accessories", brand: "Generic", spec: "0.1mm · pure Cu · spot-weld", basePrice: 24, compatibility: ["E-Motorcycle", "E-Scooter"] },
  { name: "Kapton Tape 33mm (30m)", category: "Accessories", brand: "Generic", spec: "33mm · 260°C · polyimide", basePrice: 8, compatibility: ["E-Bike", "E-Scooter", "E-Motorcycle", "E-Board"] },
  { name: "Fish Paper Insulation (10m)", category: "Accessories", brand: "Generic", spec: "0.2mm · electrical insulation", basePrice: 5, compatibility: ["E-Bike", "E-Scooter", "E-Board"] },
  { name: "Thermal Fuse 72°C", category: "Accessories", brand: "Generic", spec: "72°C · 10A · over-temp cutoff", basePrice: 3.5, compatibility: ["E-Bike", "E-Scooter", "E-Motorcycle"] },
  { name: "Balance Wire Set 13S", category: "Accessories", brand: "Generic", spec: "13S · 24AWG silicone", basePrice: 7, compatibility: ["E-Bike", "E-Scooter"] },
  { name: "BMS Balance Harness 13S", category: "Accessories", brand: "JBD", spec: "13S · JST · 13-pin", basePrice: 8, compatibility: ["E-Bike", "E-Scooter"] },
  { name: "Spot Welder W-Mesh Tip", category: "Accessories", brand: "Generic", spec: "0.8mm tungsten · replacement", basePrice: 12, compatibility: ["E-Bike", "E-Scooter", "E-Board"] },
];

function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function buildParts(): Part[] {
  const rand = seededRandom(987654);
  const out: Part[] = [];
  PARTS_RAW.forEach((raw, i) => {
    const demand = PART_DEMAND[raw.brand] ?? 1;
    const scarcity = 0.92 + rand() * 0.25; // 0.92–1.17
    const inStock = rand() > 0.14;
    const stockPremium = inStock ? 1 : 1.16; // scarce (out-of-stock) parts carry a premium
    const price = Math.max(3, Math.round(raw.basePrice * demand * scarcity * stockPremium));
    const stockCount = inStock ? Math.floor(5 + rand() * 60) : 0;
    const demandTier: Part["demandTier"] = demand >= 1.12 ? "High" : demand <= 0.95 ? "Value" : "Standard";
    const hasCompareAt = inStock && rand() > 0.55;
    const compareAt = hasCompareAt ? Math.round(price * (1.12 + rand() * 0.18)) : undefined;
    out.push({
      kind: "part",
      id: `JP-${String(i + 1).padStart(4, "0")}`,
      sku: `${raw.brand.slice(0, 3).toUpperCase()}-${raw.category.slice(0, 3).toUpperCase()}-${String(i + 1).padStart(3, "0")}`,
      name: raw.name,
      category: raw.category,
      brand: raw.brand,
      spec: raw.spec,
      compatibility: raw.compatibility,
      price,
      compareAt,
      inStock,
      stockCount,
      rating: Math.round((3.9 + rand() * 1.1) * 10) / 10,
      reviewCount: Math.floor(3 + rand() * 140),
      demandTier,
    });
  });
  return out;
}

export const parts: Part[] = buildParts();

export const PART_CATEGORIES: { key: PartCategory | "All"; label: string }[] = [
  { key: "All", label: "All Parts" },
  { key: "Cells", label: "Cells" },
  { key: "BMS", label: "BMS Boards" },
  { key: "Chargers", label: "Chargers" },
  { key: "Connectors", label: "Connectors" },
  { key: "Enclosures", label: "Enclosures" },
  { key: "Accessories", label: "Accessories" },
];

export function getPartById(id: string): Part | undefined {
  return parts.find((p) => p.id === id);
}

export function isHighDemandPart(brand: string): boolean {
  return (PART_DEMAND[brand] ?? 1) >= 1.12;
}
