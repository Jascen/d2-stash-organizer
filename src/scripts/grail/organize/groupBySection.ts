import { Item } from "../../items/types/Item";
import { SECTIONS_ORDER, SectionType } from "./sections";
import { ItemQuality } from "../../items/types/ItemQuality";
import { ARMORS, WEAPONS } from "../../../game-data";
import { EQUIPMENT_TYPES } from "../list/uniquesOrder";
import { getBase } from "../../items/getBase";
import { RESPECS } from "./respecs";
import { UBERS } from "./ubers";
import { MAP_TIERS } from "./maps";
import { pd2Changes } from "./_pd2";

const CHARMS = ["scha", "mcha", "lcha"];

function findSection(item: Item): SectionType {
  const base = getBase(item);
  if (base.type === "rpot") {
    return "rejuvs";
  }
  if (
    RESPECS.includes(item.code) ||
    base.type === pd2Changes.consumables.healthPot ||
    base.type === pd2Changes.consumables.manaPot ||
    base.type === pd2Changes.consumables.book ||
    base.type === pd2Changes.consumables.puzzleBox
  ) {
    return "consumables";
  }
  // if (base.type === pd2Changes.misc.book) {
  //   return "misc";
  // }
  if (CHARMS.includes(base.type)) {
    return "charms";
  }
  if (item.code.length === 3 && MAP_TIERS.includes(item.code.substring(0, 2))) {
    return "maps";
  }
  if (UBERS.includes(item.code)) {
    return "ubers";
  }
  if (base.type.startsWith("gem") || !!pd2Changes.stackableGems[base.type]) {
    return "gems";
  }
  if (base.type === "rune" || base.type === pd2Changes.runes.stackableRunes) {
    return "runes";
  }
  // White armors and weapons are either runewords or bases
  if (
    (item.quality ?? 10) <= ItemQuality.SUPERIOR &&
    (item.code in ARMORS || item.code in WEAPONS)
  ) {
    return "runewords";
  }
  if (item.quality === ItemQuality.SET) {
    return "sets";
  }
  if (EQUIPMENT_TYPES.includes(base.type)) {
    return "uniques";
  }
  return "unknown";
}

export function groupBySection(items: Item[]) {
  const bySection = new Map<SectionType, Item[]>(
    SECTIONS_ORDER.map((s) => [s, []])
  );
  for (const item of items) {
    bySection.get(findSection(item))!.push(item);
  }
  return bySection;
}
