import fs from "node:fs";
import path from "node:path";
import placeholder from "./businesses.json";
import type { Business } from "./business-helpers";

export * from "./business-helpers";

// data/businesses.local.json (gitignored) tiene el dataset local opcional.
const localPath = path.join(process.cwd(), "data", "businesses.local.json");
let raw: Business[] = placeholder as Business[];
if (fs.existsSync(localPath)) {
  try {
    const localData = JSON.parse(fs.readFileSync(localPath, "utf-8"));
    if (Array.isArray(localData) && localData.length >= placeholder.length) {
      raw = localData as Business[];
    }
  } catch (e) {
    raw = placeholder as Business[];
  }
}

import { DEFAULT_DEMO_BUSINESS } from "./demo-business";
import { BORGES_BUSINESS } from "./borges-data";
import { JDS_DETAILING_BUSINESS } from "./jds-data";

const JDS_ALIAS: Business = {
  ...JDS_DETAILING_BUSINESS,
  slug: "jds-detailing-car-estudio",
};

const TALLER_DEMO_BUSINESS: Business = {
  ...DEFAULT_DEMO_BUSINESS,
  slug: "taller-demo",
  nombre: "Taller Piloto Detail Studio",
};

const rawList: Business[] = [
  DEFAULT_DEMO_BUSINESS,
  TALLER_DEMO_BUSINESS,
  BORGES_BUSINESS,
  JDS_DETAILING_BUSINESS,
  JDS_ALIAS,
  ...raw,
];
const businessesMap = new Map<string, Business>();

for (const b of rawList) {
  if (b && b.slug && !businessesMap.has(b.slug)) {
    businessesMap.set(b.slug, b);
  }
}

const businesses: Business[] = Array.from(businessesMap.values());

export function getAllBusinesses(): Business[] {
  return businesses;
}

export function getBusiness(slug: string): Business | undefined {
  if (slug === "demo") return DEFAULT_DEMO_BUSINESS;
  if (slug === "taller-demo") return TALLER_DEMO_BUSINESS;
  if (slug === "borges-ppf-y-detailing") return BORGES_BUSINESS;
  if (slug === "jds-detailing" || slug === "jds-detailing-car-estudio") return JDS_DETAILING_BUSINESS;
  if (slug === "thezone" || slug === "the-zone") return businessesMap.get("the-zone-car-autospa-detailing");
  return businessesMap.get(slug);
}
