export const SECTIONS_ORDER = [
  "unknown",
  "maps",
  "gems",
  "runes",
  "consumables",
  "ubers",
  // "misc",
  "rejuvs",
  "charms",
  "runewords",
  "uniques",
  "sets",
] as const;

export type SectionType = typeof SECTIONS_ORDER[number];
