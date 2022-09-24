import { Item } from "../../items/types/Item";
import { layout } from "../layout";
import { PlugyStash } from "../../plugy-stash/types";
import { makeIndex } from "../../plugy-stash/makeIndex";
import { sortAndGroupBy } from "./sortAndGroupBy";
import { addPage } from "../../plugy-stash/addPage";
import { moveItem } from "../../items/moving/safeMove";
import { pd2Changes } from "./_pd2";

// Order to display them in
export const MAP_TIERS = [
    pd2Changes.maps.tier1,
    pd2Changes.maps.tier2,
    pd2Changes.maps.tier3,
];

export function organizeMaps(stash: PlugyStash, items: Item[]) {
    if (items.length === 0) return;

    const groups = sortAndGroupBy(items, (item) => MAP_TIERS.indexOf(item.code.substring(0, 2)));
    groups.forEach(items => items.sort((a, b) => a.code.localeCompare(b.code) || (a.quality || 0) - (b.quality || 0)));

    // Supposed bug that happens if too many maps (ex: rares) are on a single page.
    const offset = stash.pages.length;
    const { nbPages, positions } = layout("seventy-percent", groups);
    for (let i = 0; i < nbPages; i++) {
        const page = addPage(stash, "Maps");
        if (i === 0) {
            makeIndex(page, false);
        }
    }
    for (const [item, { page, rows, cols }] of positions.entries()) {
        moveItem(stash, item, offset + page, rows[0], cols[0]);
    }
}
