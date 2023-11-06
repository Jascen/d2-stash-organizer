import { Item } from "../../items/types/Item";
import { layout } from "../layout";
import { PlugyStash } from "../../plugy-stash/types";
import { makeIndex } from "../../plugy-stash/makeIndex";
import { MISC } from "../../../game-data";
import { addPage } from "../../plugy-stash/addPage";
import { moveItem } from "../../items/moving/safeMove";

interface Gems {
  stackable: Gems2;
  nonStackable: Gems2;
}

interface Gems2 {
  items: Item[];
  sortOrder: string[];
  gemTypes: string[];
  isSkullGroup(index: number): boolean;
}

// Chipped first, this order has been crafted to work for all gem types
const QUALITIES = ["c", "f", "u", "s", "l", "z", "p"];

function qualityChar(skulls = false) {
  return (item: Item) => QUALITIES.indexOf(item.code.charAt(skulls ? 2 : 1));
}

export function organizeGems(stash: PlugyStash, items: Item[]) {
  if (items.length === 0) return;

  const gems = {
    stackable: {
      // Amethyst
      // Diamond
      // Emerald
      // Ruby
      // Sapphire
      // Skull
      // Topaz
      sortOrder: [
        "gzvs",
        "gpvs",
        "glws",
        "gpws",
        "glgs",
        "gpgs",
        "glrs",
        "gprs",
        "glbs",
        "gpbs",
        "skls",
        "skzs",
        "glys",
        "gpys",
      ],
      isSkullGroup: (index) => index === 10 || index === 11, // ^ Location in array
      gemTypes: [],
      items: [],
    },
    nonStackable: {
      sortOrder: ["gsv", "gsw", "gsg", "gsr", "gsb", "sku", "gsy"],
      isSkullGroup: (index) => index === 5, // ^ Location in array
      gemTypes: [],
      items: [],
    },
  } as Gems;

  gems.stackable.sortOrder.forEach((code) =>
    gems.stackable.gemTypes.push(MISC[code]!.type)
  );
  gems.nonStackable.sortOrder.forEach((code) =>
    gems.nonStackable.gemTypes.push(MISC[code]!.type)
  );

  items.forEach((item) => {
    const type = MISC[item.code]?.type;
    if (!type) {
      console.warn("Unknown gem type for item code: " + item.code);
      return;
    }

    if (type.startsWith("gem")) {
      gems.nonStackable.items.push(item);
    } else {
      gems.stackable.items.push(item);
    }
  });

  moveItems(stash, group(gems.stackable), "Gems");
  moveItems(stash, group(gems.nonStackable), "Unstacked Gems");
}

function group(gems: Gems2) {
  const byType = gems.sortOrder.map<Item[]>(() => []);
  for (const item of gems.items) {
    byType[gems.gemTypes.indexOf(MISC[item.code]!.type)].push(item);
  }

  byType.forEach((items, index) => {
    const isSkullGroup = gems.isSkullGroup(index);
    if (isSkullGroup) {
      console.log(items);
    }
    items.sort(
      (a, b) => qualityChar(isSkullGroup)(a) - qualityChar(isSkullGroup)(b)
    );

    // Quantity descending
    items.sort((a, b) => (b.quantity || 0) - (a.quantity || 0));
  });

  return byType;
}

function moveItems(stash: PlugyStash, items: Item[][], tabName: string) {
  const offset = stash.pages.length;

  const { nbPages, positions } = layout("lines", items);
  for (let j = 0; j < nbPages; j++) {
    const page = addPage(stash, tabName);
    if (j === 0) {
      makeIndex(page, true);
    }
  }

  for (const [item, { page, rows, cols }] of positions.entries()) {
    moveItem(stash, item, offset + page, rows[0], cols[0]);
  }
}
