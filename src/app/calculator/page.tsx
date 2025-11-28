'use client';

import { useState, useMemo, useEffect } from 'react';
import { DamageVisualization } from '@/components/calculator/DamageVisualization';
import { WedgeSelectionModal } from '@/components/calculator/WedgeSelectionModal';
import { CharacterSelectionModal } from '@/components/calculator/CharacterSelectionModal';
import { calculateDamage, EquippedCalculatorWedge } from '@/lib/damage-calculator';
import { DemonWedge, DemonWedgeCategory } from '@/lib/demon-wedges-data';
import { Character } from '@/lib/types';
import {
    getCharacterStats,
    parseStatValue,
    CharacterLevelStats,
    FinalStats,
    collectWedgeStats,
    applyWedgeStats
} from '@/lib/character-stats';
import { getConditionalEffects } from '@/lib/demon-wedge-conditions';
import { User, X } from 'lucide-react';
import Image from 'next/image';

const MULTI_EQUIP_PHRASE = "Once upgraded to +5, this Demon Wedge can be equipped in multiples";

type PresetSlot = EquippedCalculatorWedge & { enabled: boolean };
type MaybePresetSlot = PresetSlot | undefined;

const canEquipMultiple = (wedge: DemonWedge) => {
    if (wedge.canEquipMultiple) return true;

    const hasPhraseInDescription = wedge.description?.includes(MULTI_EQUIP_PHRASE);
    const hasPhraseInLevels = wedge.levels?.some(level => level.description?.includes(MULTI_EQUIP_PHRASE));
    const hasPhraseInStats = wedge.stats.some(
        (stat) => stat.name.includes(MULTI_EQUIP_PHRASE) || stat.value.includes(MULTI_EQUIP_PHRASE)
    );
    const hasPhraseInLevelStats = wedge.levels?.some(level =>
        level.stats?.some(stat => stat.name.includes(MULTI_EQUIP_PHRASE) || stat.value.includes(MULTI_EQUIP_PHRASE))
    );

    return Boolean(hasPhraseInDescription || hasPhraseInLevels || hasPhraseInStats || hasPhraseInLevelStats);
};

const buildConditionDefaults = (wedge: DemonWedge) => {
    const effects = getConditionalEffects(wedge);
    if (!effects.length) return undefined;
    return effects.reduce((acc, effect) => {
        acc[effect.id] = effect.defaultEnabled;
        return acc;
    }, {} as Record<string, boolean | number>);
};

export default function CalculatorPage() {
    const [damageType, setDamageType] = useState<'character' | 'weapon'>('character');
    const [selectedCharacterA, setSelectedCharacterA] = useState<Character | null>(null);
    const [selectedCharacterB, setSelectedCharacterB] = useState<Character | null>(null);

    // Character Levels
    const [characterLevelA, setCharacterLevelA] = useState<number>(1);
    const [characterLevelB, setCharacterLevelB] = useState<number>(1);

    // Default base stats (hidden from UI but used in calculation)
    const [characterBaseAtk] = useState(1000);
    const [weaponBaseAtk] = useState(500);
    const [skillMultiplier] = useState(200);
    const [weaponTypeAtkPercent] = useState(0);
    const [proficiency] = useState(1.0);

    // 9 slots for each preset (0-7: normal, 8: center)
    const [presetA, setPresetA] = useState<MaybePresetSlot[]>([]);
    const [presetB, setPresetB] = useState<MaybePresetSlot[]>([]);

    // 4 Consonance Weapon slots for characters that need them
    const [consonanceA, setConsonanceA] = useState<MaybePresetSlot[]>([]);
    const [consonanceB, setConsonanceB] = useState<MaybePresetSlot[]>([]);

    const [isWedgeModalOpen, setIsWedgeModalOpen] = useState(false);
    const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
    const [editingPreset, setEditingPreset] = useState<'A' | 'B'>('A');
    const [editingCharacterPreset, setEditingCharacterPreset] = useState<'A' | 'B'>('A');
    const [editingSlot, setEditingSlot] = useState<number>(-1);
    const [isConsonanceSlot, setIsConsonanceSlot] = useState(false);

    // Characters that can use Consonance Weapons
    const requiresConsonance = (character: Character | null) => {
        if (!character) return false;
        const consonanceCharacters = ['Lynn', 'Lisbell', 'Psyche', 'Berenica'];
        return consonanceCharacters.includes(character.name);
    };

    const allowedCategories: DemonWedgeCategory[] = useMemo(() => (
        damageType === 'character'
            ? ['character']
            : ['melee-weapon', 'ranged-weapon', 'melee-consonance', 'ranged-consonance']
    ), [damageType]);

    useEffect(() => {
        const sanitizePreset = (preset: MaybePresetSlot[]) =>
            preset.map((item) => (item && allowedCategories.includes(item.wedge.category) ? item : undefined)) as typeof preset;

        setPresetA((prev) => sanitizePreset(prev));
        setPresetB((prev) => sanitizePreset(prev));
    }, [allowedCategories]);

    const resultA = useMemo(() => {
        const enabledWedges = presetA
            .filter((w): w is PresetSlot => Boolean(w && w.enabled))
            .map(w => ({ wedge: w.wedge, level: w.level, conditions: w.conditions }));

        // Add enabled consonance wedges
        const enabledConsonanceWedges = consonanceA
            .filter((w): w is PresetSlot => Boolean(w && w.enabled))
            .map(w => ({ wedge: w.wedge, level: w.level, conditions: w.conditions }));

        const allWedges = [...enabledWedges, ...enabledConsonanceWedges];

        return calculateDamage({
            damageType,
            characterBaseAtk,
            weaponBaseAtk,
            skillMultiplier,
            weaponTypeAtkPercent,
            proficiency,
            wedges: allWedges
        });
    }, [damageType, characterBaseAtk, weaponBaseAtk, skillMultiplier, weaponTypeAtkPercent, proficiency, presetA, consonanceA]);

    const resultB = useMemo(() => {
        const enabledWedges = presetB
            .filter((w): w is PresetSlot => Boolean(w && w.enabled))
            .map(w => ({ wedge: w.wedge, level: w.level, conditions: w.conditions }));

        // Add enabled consonance wedges
        const enabledConsonanceWedges = consonanceB
            .filter((w): w is PresetSlot => Boolean(w && w.enabled))
            .map(w => ({ wedge: w.wedge, level: w.level, conditions: w.conditions }));

        const allWedges = [...enabledWedges, ...enabledConsonanceWedges];

        return calculateDamage({
            damageType,
            characterBaseAtk,
            weaponBaseAtk,
            skillMultiplier,
            weaponTypeAtkPercent,
            proficiency,
            wedges: allWedges
        });
    }, [damageType, characterBaseAtk, weaponBaseAtk, skillMultiplier, weaponTypeAtkPercent, proficiency, presetB, consonanceB]);

    // Calculate Final Stats for Preset A
    const finalStatsA = useMemo(() => {
        return calculateFinalStats(selectedCharacterA, characterLevelA, presetA, consonanceA);
    }, [selectedCharacterA, characterLevelA, presetA, consonanceA]);

    // Calculate Final Stats for Preset B
    const finalStatsB = useMemo(() => {
        return calculateFinalStats(selectedCharacterB, characterLevelB, presetB, consonanceB);
    }, [selectedCharacterB, characterLevelB, presetB, consonanceB]);

    function calculateFinalStats(
        character: Character | null,
        level: number,
        preset: MaybePresetSlot[],
        consonance: MaybePresetSlot[]
    ): FinalStats {
        // 1. Get Base Stats
        let baseStats: CharacterLevelStats | null = null;
        if (character) {
            baseStats = getCharacterStats(character.name, level);
        }

        // If no character selected, return 0s
        if (!character || !baseStats) {
            return {
                ATK: 0,
                HP: 0,
                Shield: 0,
                DEF: 0,
                MaxSanity: 0,
                SkillDMG: 0,
                SkillRange: 0,
                SkillDuration: 0,
                SkillEfficiency: 0,
                Morale: 0,
                Resolve: 0,
            };
        }

        // 2. Convert CharacterLevelStats to FinalStats (parse all string values)
        const parsedATK = parseStatValue(baseStats.ATK);
        const parsedHP = parseStatValue(baseStats.HP);
        const parsedShield = parseStatValue(baseStats.Shield);
        const parsedDEF = parseStatValue(baseStats.DEF);
        const parsedMaxSanity = parseStatValue(baseStats["Max Sanity"]);
        const parsedSkillDMG = parseStatValue(baseStats["Skill DMG"]);
        const parsedSkillRange = parseStatValue(baseStats["Skill Range"]);
        const parsedSkillDuration = parseStatValue(baseStats["Skill Duration"]);
        const parsedSkillEfficiency = parseStatValue(baseStats["Skill Efficiency"]);
        const parsedMorale = parseStatValue(baseStats.Morale);
        const parsedResolve = parseStatValue(baseStats.Resolve);

        const baseStatsFinal: FinalStats = {
            ATK: parsedATK.value,
            HP: parsedHP.value,
            Shield: parsedShield.value,
            DEF: parsedDEF.value,
            MaxSanity: parsedMaxSanity.value,
            SkillDMG: parsedSkillDMG.value,
            SkillRange: parsedSkillRange.value,
            SkillDuration: parsedSkillDuration.value,
            SkillEfficiency: parsedSkillEfficiency.value,
            Morale: parsedMorale.value,
            Resolve: parsedResolve.value,
        };

        // 3. Collect all enabled wedge stats (normal + consonance)
        const allWedges = [...preset, ...consonance].filter((item): item is PresetSlot => Boolean(item && item.enabled));
        const normalizedWedgeStats = collectWedgeStats(allWedges);

        // 4. Apply all wedge stats to base stats
        return applyWedgeStats(baseStatsFinal, normalizedWedgeStats);
    }

    const handleOpenWedgeModal = (preset: 'A' | 'B', slot: number, isConsonance = false) => {
        setEditingPreset(preset);
        setEditingSlot(slot);
        setIsConsonanceSlot(isConsonance);
        setIsWedgeModalOpen(true);
    };

    const handleSelectWedge = (wedge: DemonWedge) => {
        if (isConsonanceSlot) {
            // Handle consonance weapon slots
            const currentPreset = editingPreset === 'A' ? [...consonanceA] : [...consonanceB];
            const setPreset = editingPreset === 'A' ? setConsonanceA : setConsonanceB;

            // Ensure array is large enough
            while (currentPreset.length <= editingSlot) {
                currentPreset.push(undefined);
            }

            if (editingSlot >= 0 && editingSlot < 4) {
                currentPreset[editingSlot] = {
                    wedge,
                    level: 0,
                    enabled: true,
                    conditions: buildConditionDefaults(wedge)
                };
                setPreset(currentPreset);
            }
        } else {
            // Handle normal wedge slots
            const currentPreset = editingPreset === 'A' ? [...presetA] : [...presetB];
            const setPreset = editingPreset === 'A' ? setPresetA : setPresetB;

            // Enforce category by damage type
            if (!allowedCategories.includes(wedge.category)) return;

            // Block equipping duplicates unless the wedge explicitly allows multiples
            const isDuplicate = currentPreset.some((slot, index) =>
                slot && slot.wedge.name === wedge.name && index !== editingSlot
            );
            if (isDuplicate && !canEquipMultiple(wedge)) {
                return;
            }

            // Ensure array is large enough
            while (currentPreset.length <= editingSlot) {
                currentPreset.push(undefined);
            }

            if (editingSlot >= 0 && editingSlot < 9) {
                currentPreset[editingSlot] = {
                    wedge,
                    level: 0,
                    enabled: true,
                    conditions: buildConditionDefaults(wedge)
                };
                setPreset(currentPreset);
            }
        }

        setIsWedgeModalOpen(false);
        setEditingSlot(-1);
        setIsConsonanceSlot(false);
    };

    const handleSelectMultipleWedges = (wedges: DemonWedge[]) => {
        if (isConsonanceSlot) {
            // Handle consonance weapon slots
            const currentPreset = editingPreset === 'A' ? [...consonanceA] : [...consonanceB];
            const setPreset = editingPreset === 'A' ? setConsonanceA : setConsonanceB;

            let slotIndex = editingSlot;
            for (const wedge of wedges) {
                if (slotIndex >= 4) break; // Max 4 consonance slots
                
                // Ensure array is large enough
                while (currentPreset.length <= slotIndex) {
                    currentPreset.push(undefined);
                }

                currentPreset[slotIndex] = {
                    wedge,
                    level: 0,
                    enabled: true,
                    conditions: buildConditionDefaults(wedge)
                };
                slotIndex++;
            }
            setPreset(currentPreset);
        } else {
            // Handle normal wedge slots
            const currentPreset = editingPreset === 'A' ? [...presetA] : [...presetB];
            const setPreset = editingPreset === 'A' ? setPresetA : setPresetB;

            let slotIndex = editingSlot;
            for (const wedge of wedges) {
                if (slotIndex >= 9) break; // Max 9 normal slots

                // Enforce category by damage type
                if (!allowedCategories.includes(wedge.category)) continue;

                // Block equipping duplicates unless the wedge explicitly allows multiples
                const isDuplicate = currentPreset.some((slot, index) =>
                    slot && slot.wedge.name === wedge.name && index !== slotIndex
                );
                if (isDuplicate && !canEquipMultiple(wedge)) continue;

                // Ensure array is large enough
                while (currentPreset.length <= slotIndex) {
                    currentPreset.push(undefined);
                }

                currentPreset[slotIndex] = {
                    wedge,
                    level: 0,
                    enabled: true,
                    conditions: buildConditionDefaults(wedge)
                };
                slotIndex++;
            }
            setPreset(currentPreset);
        }

        setIsWedgeModalOpen(false);
        setEditingSlot(-1);
        setIsConsonanceSlot(false);
    };

    const handleRemoveWedge = (preset: 'A' | 'B', index: number, isConsonance = false) => {
        if (isConsonance) {
            const currentPreset = preset === 'A' ? [...consonanceA] : [...consonanceB];
            const setPreset = preset === 'A' ? setConsonanceA : setConsonanceB;
            delete currentPreset[index];
            setPreset([...currentPreset]);
        } else {
            const currentPreset = preset === 'A' ? [...presetA] : [...presetB];
            const setPreset = preset === 'A' ? setPresetA : setPresetB;
            delete currentPreset[index];
            setPreset([...currentPreset]);
        }
    };

    const handleUpdateLevel = (preset: 'A' | 'B', index: number, level: number, isConsonance = false) => {
        if (isConsonance) {
            const currentPreset = preset === 'A' ? [...consonanceA] : [...consonanceB];
            const setPreset = preset === 'A' ? setConsonanceA : setConsonanceB;

            if (currentPreset[index]) {
                currentPreset[index] = { ...currentPreset[index], level };
                setPreset(currentPreset);
            }
        } else {
            const currentPreset = preset === 'A' ? [...presetA] : [...presetB];
            const setPreset = preset === 'A' ? setPresetA : setPresetB;

            if (currentPreset[index]) {
                currentPreset[index] = { ...currentPreset[index], level };
                setPreset(currentPreset);
            }
        }
    };

    const handleToggleEnabled = (preset: 'A' | 'B', index: number, isConsonance = false) => {
        if (isConsonance) {
            const currentPreset = preset === 'A' ? [...consonanceA] : [...consonanceB];
            const setPreset = preset === 'A' ? setConsonanceA : setConsonanceB;

            if (currentPreset[index]) {
                currentPreset[index] = { ...currentPreset[index], enabled: !currentPreset[index].enabled };
                setPreset(currentPreset);
            }
        } else {
            const currentPreset = preset === 'A' ? [...presetA] : [...presetB];
            const setPreset = preset === 'A' ? setPresetA : setPresetB;

            if (currentPreset[index]) {
                currentPreset[index] = { ...currentPreset[index], enabled: !currentPreset[index].enabled };
                setPreset(currentPreset);
            }
        }
    };

    const handleUpdateConditions = (
        preset: 'A' | 'B',
        index: number,
        conditionId: string,
        enabled: boolean,
        isConsonance = false,
        selectedValue?: number
    ) => {
        const [currentPreset, setPreset] = isConsonance
            ? [preset === 'A' ? [...consonanceA] : [...consonanceB], preset === 'A' ? setConsonanceA : setConsonanceB]
            : [preset === 'A' ? [...presetA] : [...presetB], preset === 'A' ? setPresetA : setPresetB];

        if (!currentPreset[index]) return;

        const newConditions: Record<string, boolean | number> = {
            ...(currentPreset[index]?.conditions || {}),
            [conditionId]: enabled
        };
        
        // Store selected value if provided
        if (selectedValue !== undefined) {
            newConditions[`${conditionId}_value`] = selectedValue;
        }

        currentPreset[index] = {
            ...currentPreset[index],
            conditions: newConditions as Record<string, boolean | number>
        };

        setPreset(currentPreset);
    };

    const handleCopyPreset = (from: 'A' | 'B', to: 'A' | 'B') => {
        const source = from === 'A' ? presetA : presetB;
        const sourceConsonance = from === 'A' ? consonanceA : consonanceB;
        const setTarget = to === 'A' ? setPresetA : setPresetB;
        const setTargetConsonance = to === 'A' ? setConsonanceA : setConsonanceB;
        const sourceLevel = from === 'A' ? characterLevelA : characterLevelB;
        const setTargetLevel = to === 'A' ? setCharacterLevelA : setCharacterLevelB;

        // Deep copy both normal and consonance wedges
        const copy = source.map(item => item ? { ...item, conditions: item.conditions ? { ...item.conditions } : undefined } : item);
        const copyConsonance = sourceConsonance.map(item => item ? { ...item, conditions: item.conditions ? { ...item.conditions } : undefined } : item);
        setTarget(copy);
        setTargetConsonance(copyConsonance);
        setTargetLevel(sourceLevel);
    };

    const handleOpenCharacterModal = (preset: 'A' | 'B') => {
        setEditingCharacterPreset(preset);
        setIsCharacterModalOpen(true);
    };

    const handleSelectCharacter = (char: Character) => {
        if (editingCharacterPreset === 'A') {
            setSelectedCharacterA(char);
        } else {
            setSelectedCharacterB(char);
        }
        setIsCharacterModalOpen(false);
    };

    // Custom filter for center slot (index 8) and damage type
    const customFilter = (wedge: DemonWedge) => {
        // Special handling for consonance weapon slots
        if (isConsonanceSlot) {
            const selectedCharacter = editingPreset === 'A' ? selectedCharacterA : selectedCharacterB;

            // Only allow consonance weapons in consonance slots
            if (wedge.category !== 'melee-consonance' && wedge.category !== 'ranged-consonance') {
                return false;
            }

            // Filter by character weapon type
            if (selectedCharacter) {
                const rangedCharacters = ['Lynn', 'Psyche'];
                const meleeCharacters = ['Lisbell', 'Berenica'];

                if (rangedCharacters.includes(selectedCharacter.name)) {
                    // Only show ranged-consonance for Lynn and Psyche
                    if (wedge.category !== 'ranged-consonance') return false;
                } else if (meleeCharacters.includes(selectedCharacter.name)) {
                    // Only show melee-consonance for Lisbell and Berenica
                    if (wedge.category !== 'melee-consonance') return false;
                }
            }

            // Check element match with selected character
            if (selectedCharacter && wedge.element) {
                if (wedge.element !== selectedCharacter.element) return false;
            }

            return true;
        }

        // 1. Center slot restriction - Feathered Serpent's only in center, and only center can have Feathered Serpent's
        const isFeatheredSerpent = wedge.name.startsWith("Feathered Serpent's");
        if (editingSlot === 8) {
            // Center slot: only allow Feathered Serpent's
            if (!isFeatheredSerpent) return false;
        } else {
            // Non-center slots: exclude Feathered Serpent's
            if (isFeatheredSerpent) return false;
        }

        // 2. Damage Type restriction
        if (damageType === 'character') {
            // Only allow character wedges
            if (wedge.category !== 'character') return false;
        } else if (damageType === 'weapon') {
            // Only allow weapon wedges (exclude character wedges)
            if (wedge.category === 'character') return false;
        }

        // 3. Element restriction based on selected character
        const selectedCharacter = editingPreset === 'A' ? selectedCharacterA : selectedCharacterB;
        if (selectedCharacter && wedge.element) {
            // If character is selected and wedge has element, they must match
            if (wedge.element !== selectedCharacter.element) return false;
        }

        // 4. Duplicate restriction
        // Check if this wedge (by name) is already equipped in another slot of the current preset
        // Wedges with the same name but different rarity are considered the same wedge
        const currentPreset = editingPreset === 'A' ? presetA : presetB;
        const isEquipped = currentPreset.some((slot, index) =>
            // Check if slot has a wedge, it's the same NAME, AND it's not the slot we are currently editing
            slot && slot.wedge.name === wedge.name && index !== editingSlot
        );

        if (isEquipped && !canEquipMultiple(wedge)) return false;

        return true;
    };

    return (
        <div className="mx-auto max-w-[1500px] px-8 lg:px-12 space-y-6 pb-20">
            <div className="flex flex-col gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-headline font-bold">Damage Calculator</h1>
                    <p className="text-white/60 max-w-2xl">
                        Compare two Demon Wedge builds <span className="font-semibold text-white">Head-to-Head</span>.
                    </p>
                </div>

                {/* Character Selectors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Preset A Character */}
                    <div className="flex items-center justify-between bg-[#1a1a1f] p-4 rounded-xl border border-white/10">
                        <div className="text-lg font-bold text-white/80">Preset A</div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleOpenCharacterModal('A')}
                                className="flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-2 pr-6 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-lg bg-black/40 overflow-hidden relative border border-white/10 group-hover:border-white/30">
                                    {selectedCharacterA ? (
                                        <Image
                                            src={selectedCharacterA.image}
                                            alt={selectedCharacterA.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-white/20">
                                            <User className="w-6 h-6" />
                                        </div>
                                    )}
                                </div>
                                <div className="text-left">
                                    <div className="text-xs text-white/40 uppercase tracking-wider font-semibold">Character</div>
                                    <div className="text-lg font-bold text-white">
                                        {selectedCharacterA ? selectedCharacterA.name : 'Select'}
                                    </div>
                                </div>
                            </button>
                            {selectedCharacterA && (
                                <button
                                    onClick={() => setSelectedCharacterA(null)}
                                    className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-red-300 transition-all"
                                    title="Clear character"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Preset B Character */}
                    <div className="flex items-center justify-between bg-[#1a1a1f] p-4 rounded-xl border border-white/10">
                        <div className="text-lg font-bold text-white/80">Preset B</div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleOpenCharacterModal('B')}
                                className="flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-2 pr-6 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-lg bg-black/40 overflow-hidden relative border border-white/10 group-hover:border-white/30">
                                    {selectedCharacterB ? (
                                        <Image
                                            src={selectedCharacterB.image}
                                            alt={selectedCharacterB.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-white/20">
                                            <User className="w-6 h-6" />
                                        </div>
                                    )}
                                </div>
                                <div className="text-left">
                                    <div className="text-xs text-white/40 uppercase tracking-wider font-semibold">Character</div>
                                    <div className="text-lg font-bold text-white">
                                        {selectedCharacterB ? selectedCharacterB.name : 'Select'}
                                    </div>
                                </div>
                            </button>
                            {selectedCharacterB && (
                                <button
                                    onClick={() => setSelectedCharacterB(null)}
                                    className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-red-300 transition-all"
                                    title="Clear character"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Comparison */}
            <DamageVisualization
                resultA={resultA}
                resultB={resultB}
                presetA={presetA}
                presetB={presetB}
                consonanceA={consonanceA}
                consonanceB={consonanceB}
                selectedCharacterA={selectedCharacterA}
                selectedCharacterB={selectedCharacterB}
                characterLevelA={characterLevelA}
                characterLevelB={characterLevelB}
                finalStatsA={finalStatsA}
                finalStatsB={finalStatsB}
                onOpenWedgeModal={handleOpenWedgeModal}
                onRemoveWedge={handleRemoveWedge}
                onUpdateLevel={handleUpdateLevel}
                onToggleEnabled={handleToggleEnabled}
                onUpdateConditions={handleUpdateConditions}
                onCopyPreset={handleCopyPreset}
                onLevelChangeA={setCharacterLevelA}
                onLevelChangeB={setCharacterLevelB}
            />

            <WedgeSelectionModal
                isOpen={isWedgeModalOpen}
                onClose={() => {
                    setIsWedgeModalOpen(false);
                    setEditingSlot(-1);
                    setIsConsonanceSlot(false);
                }}
                onSelect={handleSelectWedge}
                onSelectMultiple={handleSelectMultipleWedges}
                customFilter={customFilter}
                allowedCategories={
                    isConsonanceSlot
                        ? ['melee-consonance', 'ranged-consonance']
                        : allowedCategories
                }
                maxSlots={isConsonanceSlot ? 4 : 9}
                currentSlotIndex={editingSlot}
            />

            <CharacterSelectionModal
                isOpen={isCharacterModalOpen}
                onClose={() => setIsCharacterModalOpen(false)}
                onSelect={handleSelectCharacter}
            />
        </div>
    );
}
