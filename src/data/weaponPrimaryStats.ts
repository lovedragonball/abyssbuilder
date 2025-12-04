/**
 * Weapon Primary Stats Reference
 * 
 * This file contains mapping of weapon names to their primary attack stat type.
 * Primary stat types: Slash, Smash, Spike
 * 
 * Source: weapons_refinement_0_to_5.txt
 * 
 * Note: This is for internal reference/documentation purposes.
 * Not displayed in the UI.
 */

export type WeaponPrimaryStat = 'Slash' | 'Smash' | 'Spike';

export const WEAPON_PRIMARY_STATS: Record<string, WeaponPrimaryStat> = {
    // Slash weapons (16 total)
    "Destructo": "Slash",
    "Dreamweaver's Feather": "Slash",
    "Elpides Abound": "Slash",
    "Embla Inflorescence": "Slash",
    "Entropic Singularity": "Slash",
    "Exiled Fangs": "Slash",
    "Flamme De Epuration": "Slash",
    "Guixu Ratchet": "Slash",
    "Ingenious Tactics": "Slash",
    "Ironforger": "Slash",
    "Momiji Itteki": "Slash",
    "Rendhusk": "Slash",
    "Sacrosanct Chorus": "Slash",
    "Submerged Serenade": "Slash",
    "Vernal Jade Halberd": "Slash",
    "Wanewraith": "Slash",

    // Smash weapons (11 total)
    "Arclight Apocalypse": "Smash",
    "Aurate Yore": "Smash",
    "Blade Amberglow": "Smash",
    "Blast Artistry": "Smash",
    "Punitive Inferno": "Smash",
    "Pyrothirst": "Smash",
    "Silent Sower": "Smash",
    "Soulrend": "Smash",
    "Stellar Finality": "Smash",
    "Tetherlash": "Smash",
    "Withershade": "Smash",

    // Spike weapons (18 total)
    "Bluecurrent Pulse": "Spike",
    "Day of Sacred Verdict": "Spike",
    "Daybreak Hymn": "Spike",
    "Excresduo": "Spike",
    "Exiled Thunderwyrm": "Spike",
    "Fathomless Sharkgaze": "Spike",
    "Osteobreaker": "Spike",
    "Remanent Reminiscence": "Spike",
    "Sacred Favour": "Spike",
    "Sacrosanct Decree": "Spike",
    "Screamshot": "Spike",
    "Searing Sandwhisper": "Spike",
    "Shackle of Lonewolf": "Spike",
    "Silverwhite Edict": "Spike",
    "Siren's Kiss": "Spike",
    "Undying Oneiros": "Spike",
    "Viridis Reefs": "Spike",
    "Wandering Rose": "Spike",
} as const;

/**
 * Helper function to get weapon primary stat
 * @param weaponName - The name of the weapon
 * @returns The primary stat type or undefined if not found
 */
export function getWeaponPrimaryStat(weaponName: string): WeaponPrimaryStat | undefined {
    return WEAPON_PRIMARY_STATS[weaponName];
}

/**
 * Total weapon count by stat type
 */
export const WEAPON_STAT_COUNTS = {
    Slash: 16,
    Smash: 11,
    Spike: 18,
    Total: 45,
} as const;
