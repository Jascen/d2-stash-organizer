export const SECTIONS_ORDER = [
  "unknown",
  "gems",
  "runes",
  "consumables",
  "ubers",
  // "misc",
  "rejuvs",
  "runewords",
  "uniques",
  "sets",
] as const;

export type SectionType = typeof SECTIONS_ORDER[number];
