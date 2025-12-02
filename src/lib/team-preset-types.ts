import { DemonWedge } from './demon-wedges-data';
import { Geniemon, GeniemonTrait } from './geniemon-data';

/**
 * Represents a demon wedge slot for any entity (character, geniemon, support)
 */
export interface DemonWedgeSlot {
    slotIndex: number;
    wedgeId?: string;
    wedge?: DemonWedge; // reference to actual wedge
    level?: number;
    enabled?: boolean;
    conditions?: Record<string, boolean | number>;
}

/**
 * Represents a geniemon trait slot with rarity
 */
export interface GeniemonTraitSlot {
    slotIndex: number; // 0-3
    traitId?: string;
    trait?: GeniemonTrait; // reference to actual trait
    rarity?: 'blue' | 'purple' | 'gold'; // determines effect strength
}

/**
 * Main character build configuration
 */
export interface CharacterBuild {
    characterId: string;
    characterLevel: number;
    meleeWeaponId?: string;
    meleeWeaponLevel?: number;
    meleeWeaponWedges?: DemonWedgeSlot[];
    rangeWeaponId?: string;
    rangeWeaponLevel?: number;
    rangeWeaponWedges?: DemonWedgeSlot[];
    demonWedges: DemonWedgeSlot[];
    consonanceWedges?: DemonWedgeSlot[]; // for characters with consonance weapons
    trialRank?: number | null;
}

/**
 * Geniemon build configuration
 */
export interface GeniemonBuild {
    geniemonId: string;
    traits: GeniemonTraitSlot[]; // max 4 slots
    demonWedges: DemonWedgeSlot[];
}

/**
 * Support character build configuration
 */
export interface SupportBuild {
    characterId: string;
    weaponId?: string; // can be melee OR range, but only 1
    weaponLevel?: number;
    weaponCategory?: 'Melee' | 'Range'; // track which type it is
    weaponWedges?: DemonWedgeSlot[];
    demonWedges: DemonWedgeSlot[];
}

/**
 * Complete team preset with all members
 */
export interface TeamPreset {
    id: string;
    name: string;
    mainCharacter: CharacterBuild;
    geniemon: GeniemonBuild;
    supportCharacters: [SupportBuild, SupportBuild]; // exactly 2
    shareId?: string; // for sharing functionality
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * Create an empty character build
 */
export function createEmptyCharacterBuild(): CharacterBuild {
    return {
        characterId: '',
        characterLevel: 1,
        demonWedges: [],
        meleeWeaponWedges: [],
        rangeWeaponWedges: [],
        consonanceWedges: [],
    };
}

/**
 * Create an empty geniemon build
 */
export function createEmptyGeniemonBuild(): GeniemonBuild {
    return {
        geniemonId: '',
        traits: [],
        demonWedges: [],
    };
}

/**
 * Create an empty support build
 */
export function createEmptySupportBuild(): SupportBuild {
    return {
        characterId: '',
        weaponWedges: [],
        demonWedges: [],
    };
}

/**
 * Create an empty team preset
 */
export function createEmptyTeamPreset(): TeamPreset {
    return {
        id: generatePresetId(),
        name: 'New Team Preset',
        mainCharacter: createEmptyCharacterBuild(),
        geniemon: createEmptyGeniemonBuild(),
        supportCharacters: [createEmptySupportBuild(), createEmptySupportBuild()],
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}

/**
 * Generate a unique preset ID
 */
function generatePresetId(): string {
    return `preset_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Deep copy a team preset
 */
export function copyTeamPreset(preset: TeamPreset): TeamPreset {
    return {
        ...preset,
        id: generatePresetId(), // new ID for the copy
        name: `${preset.name} (Copy)`,
        mainCharacter: {
            ...preset.mainCharacter,
            demonWedges: preset.mainCharacter.demonWedges.map(w => ({ ...w, conditions: w.conditions ? { ...w.conditions } : undefined })),
            consonanceWedges: preset.mainCharacter.consonanceWedges?.map(w => ({ ...w, conditions: w.conditions ? { ...w.conditions } : undefined })),
            meleeWeaponWedges: preset.mainCharacter.meleeWeaponWedges?.map(w => ({ ...w, conditions: w.conditions ? { ...w.conditions } : undefined })),
            rangeWeaponWedges: preset.mainCharacter.rangeWeaponWedges?.map(w => ({ ...w, conditions: w.conditions ? { ...w.conditions } : undefined })),
        },
        geniemon: {
            ...preset.geniemon,
            traits: preset.geniemon.traits.map(t => ({ ...t })),
            demonWedges: preset.geniemon.demonWedges.map(w => ({ ...w, conditions: w.conditions ? { ...w.conditions } : undefined })),
        },
        supportCharacters: [
            {
                ...preset.supportCharacters[0],
                weaponWedges: preset.supportCharacters[0].weaponWedges?.map(w => ({ ...w, conditions: w.conditions ? { ...w.conditions } : undefined })),
                demonWedges: preset.supportCharacters[0].demonWedges.map(w => ({ ...w, conditions: w.conditions ? { ...w.conditions } : undefined })),
            },
            {
                ...preset.supportCharacters[1],
                weaponWedges: preset.supportCharacters[1].weaponWedges?.map(w => ({ ...w, conditions: w.conditions ? { ...w.conditions } : undefined })),
                demonWedges: preset.supportCharacters[1].demonWedges.map(w => ({ ...w, conditions: w.conditions ? { ...w.conditions } : undefined })),
            },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
    };
}

/**
 * Validate a team preset
 */
export function validateTeamPreset(preset: TeamPreset): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!preset.name || preset.name.trim() === '') {
        errors.push('Preset name is required');
    }

    if (!preset.mainCharacter.characterId) {
        errors.push('Main character is required');
    }

    if (!preset.geniemon.geniemonId) {
        errors.push('Geniemon is required');
    }

    // Support characters are optional, but if added, should have valid IDs
    preset.supportCharacters.forEach((support, index) => {
        if (support.characterId && support.characterId.trim() === '') {
            errors.push(`Support character ${index + 1} has invalid ID`);
        }
    });

    return {
        valid: errors.length === 0,
        errors,
    };
}
