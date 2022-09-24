import { Item } from "../../items/types/Item";
import { layout } from "../layout";
import { PlugyStash } from "../../plugy-stash/types";
import { makeIndex } from "../../plugy-stash/makeIndex";
import { sortAndGroupBy } from "./sortAndGroupBy";
import { addPage } from "../../plugy-stash/addPage";
import { moveItem } from "../../items/moving/safeMove";

const ALL_SKILL_PROPERTY = "item_addclassskills"; // Torches || Anni
const CLASS_SKILL_PROPERTY = "item_addskill_tab"; // Skillers

const SORTED_CHARM_PROPS = [
    "item_magicbonus", // MF
    "maxdamage", // Max Damage
    "item_fastergethitrate", // Faster Hit Recovery
    "group:all-res", // All Resist
    "fireresist",
    "coldresist",
    "lightresist",
    "poisonresist",
    // Put mana/hp after Resists because dual-prop charms should sort into Resist over Life
    "maxhp", // Life
    "maxmana", // Mana

    // passive_ltng_mastery 
    // TODO: + Elemental damage (for Vengeance)
];

const CLASSES = [
    "Amazon",
    "Assassin",
    "Barbarian",
    "Druid",
    "Necromancer",
    "Paladin",
    "Sorceress",
];

interface Torch extends Item {
    torchClassName: string;
    allResistValue: number;
    vitalityvalue: number;
}

interface Skiller extends Item {
    skillerDescription: string;
    skillerClassName: string;
}

export function organizeCharms(stash: PlugyStash, items: Item[]) {
    if (items.length === 0) return;

    const classMap = CLASSES.reduce<Record<string, number>>((acc, stat, index) => {
        acc[stat] = index;
        return acc;
    }, {});
    const charmPropsMap = SORTED_CHARM_PROPS.reduce<Record<string, number>>((acc, stat, index) => {
        acc[stat] = index;
        return acc;
    }, {});

    const charms = {
        // TODO: Anni charms
        torches: [] as Torch[],
        skillers: [] as Skiller[],
        explicit: [] as Item[],
        unsorted: [] as Item[]
    };
    items.forEach(item => {
        const modifiers = item.modifiers?.filter(m => charmPropsMap[m.stat] !== undefined || m.stat === ALL_SKILL_PROPERTY || m.stat === CLASS_SKILL_PROPERTY)
        if (modifiers?.length) {
            const allSkillsModifier = item.modifiers!.find(m => m.stat === ALL_SKILL_PROPERTY);
            if (allSkillsModifier) {
                const description = allSkillsModifier!.description!;
                const words = description.split(' ');
                const className = words[2];
                charms.torches.push({
                    ...item,
                    torchClassName: className,
                    allResistValue: 0,
                    vitalityvalue: 0
                });
            } else {
                const skillsModifier = item.modifiers!.find(m => m.stat === ALL_SKILL_PROPERTY);
                if (skillsModifier) {
                    const description = skillsModifier!.description!;
                    const parenthesisIndex = description.indexOf('(');
                    const classNameEndIndex = description.indexOf(' ', parenthesisIndex + 1);
                    const className = description.substring(parenthesisIndex + 1, classNameEndIndex);
                    charms.skillers.push({
                        ...item,
                        skillerClassName: className,
                        skillerDescription: description
                    });
                } else {
                    charms.explicit.push(item);
                }
            }
        } else {
            charms.unsorted.push(item);
        }
    });

    const torchGroups = sortAndGroupBy(charms.torches, item => classMap[(item as Torch).torchClassName]) as Torch[][];
    const skillerGroups = sortAndGroupBy(charms.skillers, item => classMap[(item as Skiller).skillerClassName]) as Skiller[][];
    skillerGroups.forEach(items => items.sort((a, b) => a.skillerDescription.localeCompare(b.skillerDescription) || (b.modifiers?.length || 0) - (a.modifiers?.length || 0)));

    const explicitGroups = sortAndGroupBy(charms.explicit, item => Math.min(...item.modifiers!.map(m => charmPropsMap[m.stat]).filter(m => m !== undefined)));
    explicitGroups.forEach(items => items.sort((a, b) => b.code.localeCompare(a.code) || (b.modifiers?.length || 0) - (a.modifiers?.length || 0)));

    const unsortedCharms: Item[][] = sortAndGroupBy(charms.unsorted, () => 0);

    const charmsByGroup = [
        {
            name: 'Anni/Torch Charms',
            group: torchGroups
        },
        {
            name: 'Skiller Charms',
            group: skillerGroups
        },
        {
            name: 'Sorted Charms',
            group: explicitGroups
        },
        {
            name: 'Unsorted Charms',
            group: unsortedCharms
        },

    ];

    charmsByGroup.forEach((itemGroup, charmsGroupIndex) => {
        const offset = stash.pages.length;
        const { nbPages, positions } = layout("lines", itemGroup.group); // Lines?
        for (let i = 0; i < nbPages; i++) {
            const page = addPage(stash, itemGroup.name);
            if (charmsGroupIndex === 0) {
                makeIndex(page, false);
            }
        }
        for (const [item, { page, rows, cols }] of positions.entries()) {
            moveItem(stash, item, offset + page, rows[0], cols[0]);
        }
    });
}
