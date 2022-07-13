import { Item } from "../../items/types/Item";
import { SECTIONS_ORDER, SectionType } from "./sections";
import { ItemQuality } from "../../items/types/ItemQuality";
import { ARMORS, WEAPONS } from "../../../game-data";
import { EQUIPMENT_TYPES } from "../list/uniquesOrder";
import { getBase } from "../../items/getBase";
import { RESPECS } from "./respecs";
import { UBERS } from "./ubers";

export const pd2Changes = {
  stackableGems: {
    gg3a: true,
    gg4a: true,
    gg3t: true,
    gg4t: true,
    gg3s: true,
    gg4s: true,
    gg3e: true,
    gg4e: true,
    gg3r: true,
    gg4r: true,
    gg3d: true,
    gg4d: true,
    gg3z: true,
    gg4z: true,
  } as Record<string, boolean>,
  runes: {
    stackableRunes: "runs",
    jewelFragments: "jewf",
  },
  consumables: {
    healthPot: "hpot",
    manaPot: "mpot",
    book: "book",
    puzzleBox: "lbox",
    key: "key",
    wss: "wss",
    cwss: "cwss",
    // Essences for respec
  },
  misc: {
    horadricCube: "box",
  },
  ubers: {
    // skullEye: "",
    // shadowEye: "",
    // Standard of Heroes
    // Baal's Eye
    // Key Of Terror
    // Key Of Hate
    // Key Of Destruction
  },
  diabloClone: {
    /*
    dcbl
    dcho
    dcma
    dcso
    */
    // Black soulstone
    // Vision Of Terror
    // Prime Evil Soul
    // Pure Demonic Essence
  },
  maps: {
    // orbOfDestruction: "",
    // horadrimOrb: "",
    // arcaneOrb: "",
    tier1: "t1m",
    tier2: "t2m",
    tier3: "t3m",
    pvp: "pvpm",
  },
};

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
