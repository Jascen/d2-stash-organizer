import { LayoutItem, LayoutResult, LayoutType } from "./types";
import { singleLineLayout } from "./singleLineLayout";
import { tiersLayout } from "./tiersLayout";
import { singleColumnLayout } from "./singleColumnLayout";
import { setLayout } from "./setLayout";
import { linesLayout } from "./linesLayout";
import { runesLayout } from "./runesLayout";
import { PAGE_HEIGHT } from "../../plugy-stash/dimensions";

export function layout<T extends LayoutItem = LayoutItem>(
  layout: LayoutType | undefined,
  items: T[][]
): LayoutResult<T> {
  switch (layout) {
    case "single-line":
      return singleLineLayout(items);
    case "single-column":
      return singleColumnLayout(items);
    case "set":
      return setLayout(items);
    case "runes":
      return runesLayout(items);
    case "tier-lines":
      return tiersLayout(items, false);
    case "tier-columns":
      return tiersLayout(items, true);
    case "seventy-percent":
      return linesLayout(items, PAGE_HEIGHT * 0.7);
    default:
      return linesLayout(items);
  }
}

export * from "./types";
