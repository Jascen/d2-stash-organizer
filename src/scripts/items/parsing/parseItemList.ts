import { SaveFileReader } from "../../save-file/SaveFileReader";
import { Item } from "../types/Item";
import { parseItem } from "./parseItem";
import { ItemLocation } from "../types/ItemLocation";

export function parseItemList(reader: SaveFileReader) {
  const header = reader.readString(2);
  if (header !== "JM") {
    throw new Error(`Unexpected header ${header} for an item list`);
  }

  let remainingItems = reader.readInt16LE();
  const items: Item[] = [];

  // After that comes the first item
  while (remainingItems > 0) {
    const currentItemRaw = [];
    let parsedItem: Item | false = false;
    // Sometimes the item ID will contain "JM" or "ST", we have to skip over that
    while (!parsedItem) {
      currentItemRaw.push(...reader.readUntil(["JM", "ST"], 2));
      parsedItem = parseItem(Uint8Array.from(currentItemRaw));
    }
    if (parsedItem.location === ItemLocation.SOCKET) {
      const socketedItem = items[items.length - 1];
      if (!socketedItem.filledSockets) {
        throw new Error("Trying to socket a non-socketed item");
      }
      parsedItem.socketedIn = socketedItem;
      socketedItem.filledSockets.push(parsedItem);
    } else {
      items.push(parsedItem);
      remainingItems += parsedItem.nbFilledSockets ?? 0;
    }
    remainingItems--;
  }

  return items;
}
