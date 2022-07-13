import { Item } from "../../items/types/Item";
import { layout } from "../layout";
import { PlugyStash } from "../../plugy-stash/types";
import { makeIndex } from "../../plugy-stash/makeIndex";
import { addPage } from "../../plugy-stash/addPage";
import { moveItem } from "../../items/moving/safeMove";

export function organizeUnknown(stash: PlugyStash, items: Item[]) {
  if (items.length === 0) return;

  items.sort((a, b) => a.code.localeCompare(b.code));

  const offset = stash.pages.length;
  const { nbPages, positions } = layout("lines", [items]);
  for (let i = 0; i < nbPages; i++) {
    const page = addPage(stash, "Unrecognized");
    if (i === 0) {
      makeIndex(page, true);
    }
  }

  if (items.length) {
    console.warn(
      "Unrecognized items: ",
      items.reduce<any>((acc, item) => {
        acc[item.code] = {
          code: item.code,
          name: item.name,
        };

        return acc;
      }, {})
    );
  }

  for (const [item, { page, rows, cols }] of positions.entries()) {
    moveItem(stash, item, offset + page, rows[0], cols[0]);
  }
}
