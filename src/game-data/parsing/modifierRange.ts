import { pd2Changes } from "../../scripts/grail/organize/_pd2";
import { Skill } from "../types";

export function readModifierRange(
  line: string[],
  modifierIndex: number,
  skills: Skill[]
) {
  // * mods seem to be meant for negative values, but appear to be ignored by the game
  if (!line[modifierIndex] || line[modifierIndex].startsWith("*")) {
    return;
  }

  let param = Number(line[modifierIndex + 1]);
  if (Number.isNaN(param)) {
    param = skills.findIndex(
      ({ code }) =>
        code.toLocaleLowerCase() ===
        line[modifierIndex + 1].trim().toLocaleLowerCase()
    );
  }

  const prop = line[modifierIndex].trim().toLocaleLowerCase();
  const override = pd2Changes.propertyOverrides[prop];

  return {
    prop: override ? override : prop,
    param,
    min: Number(line[modifierIndex + 2]),
    max: Number(line[modifierIndex + 3]),
  };
}
