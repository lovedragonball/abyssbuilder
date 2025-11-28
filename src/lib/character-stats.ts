// Character Stats Data Structure
export interface CharacterLevelStats {
    Level: number;
    ATK: string;
    HP: string;
    Shield: string;
    DEF: string;
    "Max Sanity": string;
    "Skill DMG": string;
    "Skill Range": string;
    "Skill Duration": string;
    "Skill Efficiency": string;
    Morale: string;
    Resolve: string;
}

export interface CharacterData {
    name: string;
    overview_stats: CharacterLevelStats[];
}

// Final Stats structure used by the calculator
export interface FinalStats {
    ATK: number;
    HP: number;
    Shield: number;
    DEF: number;
    MaxSanity: number;
    SkillDMG: number;        // percentage, e.g. 100 means 100%
    SkillRange: number;       // percentage
    SkillDuration: number;   // percentage
    SkillEfficiency: number; // percentage
    Morale: number;          // percentage
    Resolve: number;         // percentage
}

// Normalized wedge stat for applying bonuses
export interface NormalizedWedgeStat {
    statName: keyof FinalStats; // e.g. "ATK", "HP", "SkillDMG", etc.
    value: number;              // numeric amount (either flat or percentage)
    isPercentage: boolean;
}

// Import character data
import BereniceData from '@/data/characters/Berenica.json';
import DaphneData from '@/data/characters/Daphne.json';
import HellfireData from '@/data/characters/Hellfire.json';
import LadyNifleData from '@/data/characters/Lady Nifle.json';
import LisbellData from '@/data/characters/Lisbell.json';
import LynnData from '@/data/characters/Lynn.json';
import MCData from '@/data/characters/MC.json';
import MargieData from '@/data/characters/Margie.json';
import OutsiderData from '@/data/characters/Outsider.json';
import PhantasioData from '@/data/characters/Phantasio.json';
import PsycheData from '@/data/characters/Psyche.json';
import RandyData from '@/data/characters/Randy.json';
import RebeccaData from '@/data/characters/Rebecca.json';
import RhythmData from '@/data/characters/Rhythm.json';
import SibylleData from '@/data/characters/Sibylle.json';
import TabetheData from '@/data/characters/Tabethe.json';
import TruffleFilbertData from '@/data/characters/Truffle and Filbert.json';
import YaleOliverData from '@/data/characters/Yale and Oliver.json';

// Character data map
const characterDataMap: Record<string, CharacterData> = {
    'Berenica': BereniceData as CharacterData,
    'Daphne': DaphneData as CharacterData,
    'Hellfire': HellfireData as CharacterData,
    'Lady Nifle': LadyNifleData as CharacterData,
    'Lisbell': LisbellData as CharacterData,
    'Lynn': LynnData as CharacterData,
    'MC': MCData as CharacterData,
    'Margie': MargieData as CharacterData,
    'Outsider': OutsiderData as CharacterData,
    'Phantasio': PhantasioData as CharacterData,
    'Psyche': PsycheData as CharacterData,
    'Randy': RandyData as CharacterData,
    'Rebecca': RebeccaData as CharacterData,
    'Rhythm': RhythmData as CharacterData,
    'Sibylle': SibylleData as CharacterData,
    'Tabethe': TabetheData as CharacterData,
    'Truffle and Filbert': TruffleFilbertData as CharacterData,
    'Yale and Oliver': YaleOliverData as CharacterData,
};

/**
 * Get character stats for a specific level
 * @param characterName - Name of the character
 * @param level - Character level (1-80)
 * @returns Character stats object or null if not found
 */
export function getCharacterStats(
    characterName: string,
    level: number
): CharacterLevelStats | null {
    const characterData = characterDataMap[characterName];
    if (!characterData) return null;

    const levelStats = characterData.overview_stats.find(
        (stat) => stat.Level === level
    );

    return levelStats || null;
}

/**
 * Parse stat value string to number and percentage flag
 * @param value - Stat value as string (e.g., "23.00", "100.00%")
 * @returns Object with parsed number value and percentage flag
 */
export function parseStatValue(raw: string): { value: number; isPercentage: boolean } {
    // Check if value ends with "%"
    const isPercentage = raw.trim().endsWith('%');
    // Remove % sign if present
    const cleanValue = raw.replace('%', '').trim();
    const value = parseFloat(cleanValue);
    return { value: isNaN(value) ? 0 : value, isPercentage };
}

/**
 * Get all available character names
 */
export function getAllCharacterNames(): string[] {
    return Object.keys(characterDataMap);
}

/**
 * Parse and normalize a demon wedge stat to FinalStats key
 * @param rawName - Raw stat name from wedge data (e.g., "ATK", "Max Sanity", "Skill DMG")
 * @param rawValue - Raw stat value (e.g., "30%", "100")
 * @returns Normalized wedge stat or null if stat doesn't map to FinalStats
 */
export function parseDemonWedgeStat(
    rawName: string,
    rawValue: string
): NormalizedWedgeStat | null {
    // Parse the value
    const parsed = parseStatValue(rawValue);
    
    // Map raw stat names to FinalStats keys
    const statNameMap: Record<string, keyof FinalStats> = {
        'ATK': 'ATK',
        'HP': 'HP',
        'Shield': 'Shield',
        'DEF': 'DEF',
        'Max Sanity': 'MaxSanity',
        'Max Sanity%': 'MaxSanity',
        'Skill DMG': 'SkillDMG',
        'Skill Range': 'SkillRange',
        'Skill Duration': 'SkillDuration',
        'Skill Efficiency': 'SkillEfficiency',
        'Morale': 'Morale',
        'Resolve': 'Resolve',
    };

    // Normalize the stat name (trim and check for exact match or contains)
    const normalizedName = rawName.trim();
    const statKey = statNameMap[normalizedName];
    
    // If no direct match, try case-insensitive lookup
    if (!statKey) {
        const lowerName = normalizedName.toLowerCase();
        for (const [key, value] of Object.entries(statNameMap)) {
            if (key.toLowerCase() === lowerName) {
                return {
                    statName: value,
                    value: parsed.value,
                    isPercentage: parsed.isPercentage
                };
            }
        }
        // Stat doesn't map to FinalStats (e.g., "Smash ATK", "Crit DMG", "Trigger Probability")
        return null;
    }

    return {
        statName: statKey,
        value: parsed.value,
        isPercentage: parsed.isPercentage
    };
}

/**
 * Apply normalized wedge stats to base stats
 * @param base - Base FinalStats to apply bonuses to
 * @param wedgeStats - Array of normalized wedge stats to apply
 * @returns Updated FinalStats with all bonuses applied
 */
export function applyWedgeStats(
    base: FinalStats,
    wedgeStats: NormalizedWedgeStat[]
): FinalStats {
    // Start with a shallow copy of base
    const result: FinalStats = { ...base };

    // Separate number stats from percentage stats
    const numberStats: (keyof FinalStats)[] = ['ATK', 'HP', 'Shield', 'DEF', 'MaxSanity'];
    const percentageStats: (keyof FinalStats)[] = ['SkillDMG', 'SkillRange', 'SkillDuration', 'SkillEfficiency', 'Morale', 'Resolve'];

    // Apply each wedge stat
    wedgeStats.forEach(stat => {
        const { statName, value, isPercentage } = stat;

        if (numberStats.includes(statName)) {
            // For number stats (ATK, HP, Shield, DEF, MaxSanity):
            if (isPercentage) {
                // Percentage bonus: base * (1 + value / 100)
                result[statName] = result[statName] * (1 + value / 100);
            } else {
                // Flat bonus: base + value
                result[statName] = result[statName] + value;
            }
        } else if (percentageStats.includes(statName)) {
            // For percentage stats (SkillDMG, SkillRange, etc.):
            // All bonuses are additive: base + value
            // (value is already a percentage number, e.g., 20 means 20%)
            result[statName] = result[statName] + value;
        }
    });

    return result;
}

/**
 * Collect all wedge stats from enabled wedges
 * @param wedges - Array of wedge items with level and enabled flag
 * @returns Array of normalized wedge stats
 */
export function collectWedgeStats(
    wedges: Array<{ wedge: { stats: Array<{ name: string; value: string }>; levels?: Array<{ level: number; stats: Array<{ name: string; value: string }> }> }; level: number; enabled: boolean }>
): NormalizedWedgeStat[] {
    const normalizedStats: NormalizedWedgeStat[] = [];

    wedges.forEach(item => {
        if (!item || !item.enabled) return;

        // Find the correct level data
        // item.level is the upgrade level (0-5 for +5 to +10)
        // Match against DemonWedgeLevel.level property, not array index
        const levelData = item.wedge.levels?.find(l => l.level === item.level);
        const wedgeStats = levelData?.stats ?? item.wedge.stats;

        // Normalize each stat
        wedgeStats.forEach(stat => {
            const normalized = parseDemonWedgeStat(stat.name, stat.value);
            if (normalized) {
                normalizedStats.push(normalized);
            }
        });
    });

    return normalizedStats;
}
