import { Item } from "../../items/types/Item";
import { layout } from "../layout";
import { PlugyStash } from "../../plugy-stash/types";
import { makeIndex } from "../../plugy-stash/makeIndex";
import { sortAndGroupBy } from "./sortAndGroupBy";
import { addPage } from "../../plugy-stash/addPage";
import { moveItem } from "../../items/moving/safeMove";
import { pd2Changes } from "./groupBySection";
import { RESPECS } from "./respecs";

// Order to display them in

export function organizeConsumables(stash: PlugyStash, items: Item[]) {
  if (items.length === 0) return;

  const CONSUMABLES = Object.values(pd2Changes.consumables)
    .concat(RESPECS)
    .sort((a, b) => a?.localeCompare(b));
  const groups = sortAndGroupBy(items, (item) =>
    CONSUMABLES.indexOf(item.code)
  );
  groups.forEach((items) =>
    items.sort((a, b) => {
      const codeSort = a.code.localeCompare(b.code);
      if (codeSort !== 0) {
        return codeSort;
      }

      const nameSort = a.name!.localeCompare(b.name!);
      if (nameSort !== 0) {
        return nameSort;
      }

      return (b.quantity || 0) - (a.quantity || 0);
    })
  );

  const offset = stash.pages.length;
  const { nbPages, positions } = layout("lines", groups);
  for (let i = 0; i < nbPages; i++) {
    const page = addPage(stash, "Consumables");
    if (i === 0) {
      makeIndex(page, false);
    }
  }
  for (const [item, { page, rows, cols }] of positions.entries()) {
    moveItem(stash, item, offset + page, rows[0], cols[0]);
  }
}
