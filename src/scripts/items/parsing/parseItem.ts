import { parseSimple } from "./parseSimple";
import { binaryStream } from "../../save-file/binary";
import { parseQuality } from "./parseQuality";
import { parseQuantified } from "./parseQuantified";
import { parseModifiers } from "./parseModifiers";
import { ItemParsingError } from "../../errors/ItemParsingError";
import { SaveFileReader } from "../../save-file/SaveFileReader";
import { LAST_LEGACY } from "../../character/parsing/versions";
import { ItemsOwner } from "../../save-file/ownership";
import { PlugyStash } from "../../plugy-stash/types";

export function parseItem(reader: SaveFileReader, owner: ItemsOwner) {
  // https://squeek502.github.io/d2itemreader/formats/d2.html
  const stream = binaryStream(reader);
  if (owner.version <= LAST_LEGACY) {
    // This is awkward, but we're juggling between the regular reader and the binary stream
    // In this case, we want to read with the binary stream to make sure the header is included
    // in the raw binary of the item.
    const header = String.fromCharCode(stream.readInt(8), stream.readInt(8));
    if (header !== "JM") {
      throw new Error(`Unexpected header ${header} for an item`);
    }
  }
  const item = parseSimple(stream, owner);

  if (!item.simple) {
    // If the id is cut short, it means it contained a "JM" which was identified as a boundary
    try {
      parseQuality(stream, item);
      parseQuantified(stream, item);
      parseModifiers(stream, item);
    } catch (e) {
      console.error(`Failed to parse file '${item.owner.filename}'.`);

      const runewordInfo = item.runewordId
        ? ` -- Runeword ID: ${item.runewordId}`
        : "";
      const stash = item.owner as PlugyStash;
      if (stash?.pages) {
        console.warn(
          `Item '${item.name}' at (${item.column},${item.row}) on page ${
            stash.pages.length + 1
          }.${runewordInfo}`,
          item,
          e
        );
      } else {
        // const character = item.owner as Character;
        console.warn(
          `Item '${item.name}' at (${item.column},${item.row}).${runewordInfo}`,
          item,
          e
        );
      }

      if (e instanceof ItemParsingError) {
        throw e;
      }
      throw new ItemParsingError(item, (e as Error).message);
    }
  }

  item.raw = stream.done();
  return item;
}
