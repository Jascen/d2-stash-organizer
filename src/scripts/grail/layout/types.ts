import { SetItem, UniqueItem } from "../../../game-data";
import { Item } from "../../items/types/Item";
import { Position } from "./position";

export type LayoutType =
  | "lines"
  | "tier-lines"
  | "tier-columns"
  | "single-line"
  | "single-column"
  | "seventy-percent"
  | "set"
  | "runes";

export type LayoutItem = UniqueItem | SetItem | Item;

export interface LayoutResult<T extends LayoutItem = LayoutItem> {
  nbPages: number;
  positions: Map<T, Position>;
}
