import { Misc, Runeword, Skill } from "../types";
import { readGameFile, writeJson } from "./files";
import { getString } from "../strings";
import { readModifierRange } from "./modifierRange";

const customRunewordMap: Record<string, number> = {
  ['Asylum']: 2412,
  // ['Asylum Staff']: ,
  ['Dominion']: 2410,
  ['Ferocity']: 2376,
  ['Hustle']: 3463,
  ['Melody']: 80,
  ['Neophyte']: 2403,
  ['Neophyte2']: 2404,
  ['Phoenix Staff']: 2409,
  ['Rampage']: 2402,
  ['Shattered Wall']: 2411,
  ['Wind Staff']: 2408,
  ['Zenith']: 2377,
};

export async function runewordsToJson(
  misc: Record<string, Misc>,
  skills: Skill[]
) {
  let runewords: Runeword[] = [];
  for (const line of await readGameFile("Runes")) {
    const runes = line
      .slice(14, 20)
      .map((rune) => rune.trim())
      .filter((rune) => !!rune);
    const runeword: Runeword = {
      id: -1, // Set at the end
      name: getString(line[0].trim()),
      enabled: line[2].trim() === "1",
      runes,
      levelReq: runes.length
        ? Math.max(...runes.map((rune) => misc[rune]?.levelReq ?? 0))
        : 0,
      modifiers: [],
    };
    for (let i = 0; i < 7; i++) {
      const modifier = readModifierRange(line, 20 + 4 * i, skills);
      if (modifier) {
        runeword.modifiers.push(modifier);
      }
    }

    const isOriginalRuneword = line[0].startsWith("Runeword");
    if (isOriginalRuneword) {
      // This is a bit crazy, but it's what the game seems to actually do for runeword names
      let index = Number(line[0].split("Runeword")[1]);
      // Thereis a bug in the data, there are two Runeword95 but no Runeword96
      if (runewords[index] && !runeword.enabled) index++;

      runeword.id = index;
    } else {
      runeword.id = customRunewordMap[runeword.name] ?? null;
      if (!runeword.id) {
        // Skipping means:
        // Label will be missing
        // Perfection won't be able to compare modifiers
        console.log(`Failed to find runeword ID: ${runeword.name}`)
        continue;
      }
    }

    runewords[runeword.id] = runeword;
  }

  runewords = runewords.filter((runeword) => !!runeword);
  runewords.forEach((r, i) => r.id = customRunewordMap[r.name] ?? i); // Custom runewords use the given ID

  await writeJson("Runewords", runewords);
  return runewords;
}
