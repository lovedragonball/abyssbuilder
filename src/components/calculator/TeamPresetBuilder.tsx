'use client';

import { useEffect, useState, type ReactNode } from 'react';
import {
    TeamPreset,
    createEmptyTeamPreset,
    GeniemonTraitSlot,
    SupportBuild,
    DemonWedgeSlot
} from '@/lib/team-preset-types';
import { CharacterSelectionModal } from './CharacterSelectionModal';
import { GeniemonSelector } from './GeniemonSelector';
import { TraitSelector } from './TraitSelector';
import { WeaponSelectionModal } from './WeaponSelectionModal';
import { WedgeSelectionModal } from './WedgeSelectionModal';
import { TeamPresetWedgeGrid } from './TeamPresetWedgeGrid';
import { allCharacters } from '@/lib/data';
import { allGeniemon } from '@/lib/geniemon-data';
import { WEAPONS_DATA } from '@/lib/weapons-data';
import { WeaponDefinition } from '@/lib/types';
import { TrialRankSelector } from './TrialRankSelector';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import Image from 'next/image';
import { GeniemonTrait } from '@/lib/geniemon-data';
import { DemonWedge } from '@/lib/demon-wedges-data';
import { WEAPON_PRIMARY_STATS, type WeaponPrimaryStat } from '@/data/weaponPrimaryStats';

interface TeamPresetBuilderProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (preset: TeamPreset) => void;
    initialPreset?: TeamPreset;
}

type BuilderStep = 'main' | 'geniemon' | 'support1' | 'support2' | 'summary';
type WeaponModalTarget =
    | { entity: 'main'; category: 'Melee' | 'Range' }
    | { entity: 'support'; supportIndex: 0 | 1; category: 'Melee' | 'Range' };
type WedgeModalTarget =
    | { entity: 'main'; slotIndex: number }
    | { entity: 'mainWeapon'; category: 'Melee' | 'Range'; slotIndex: number }
    | { entity: 'support'; supportIndex: 0 | 1; slotIndex: number }
    | { entity: 'supportWeapon'; supportIndex: 0 | 1; category: 'Melee' | 'Range'; slotIndex: number };

type SlotUpdater = (existing?: DemonWedgeSlot) => DemonWedgeSlot | undefined;

const MAIN_WEDGE_SLOTS = 9; // 8 + 1 center
const SUPPORT_WEDGE_SLOTS = 9; // 8 + 1 center
const WEAPON_WEDGE_SLOTS = 8;

export function TeamPresetBuilder({ isOpen, onClose, onSave, initialPreset }: TeamPresetBuilderProps) {
    const [step, setStep] = useState<BuilderStep>('main');
    const [preset, setPreset] = useState<TeamPreset>(createEmptyTeamPreset());
    const [weaponModalTarget, setWeaponModalTarget] = useState<WeaponModalTarget | null>(null);
    const [wedgeModalTarget, setWedgeModalTarget] = useState<WedgeModalTarget | null>(null);

    // NOTE: Helper function to check if a Demon Wedge is compatible with a weapon's primary stat
    // A wedge is incompatible if it has a stat (Slash ATK, Smash ATK, or Spike ATK) that conflicts
    // with the weapon's primary stat type. For example:
    // - If weapon has Slash as primary stat, filter out wedges with "Smash ATK" or "Spike ATK"
    // - If weapon has Smash as primary stat, filter out wedges with "Slash ATK" or "Spike ATK"
    // - If weapon has Spike as primary stat, filter out wedges with "Slash ATK" or "Smash ATK"
    // 
    // Also checks for special wedges like Fenrir's/Fafnir's Pierce (spike) and Severance (slash)
    // which have "bonus effect: spike/slash" in their tags or stat names
    const isWedgeCompatibleWithWeapon = (wedge: DemonWedge, weaponName?: string): boolean => {
        if (!weaponName) return true; // No weapon selected, show all wedges

        const weaponPrimaryStat = WEAPON_PRIMARY_STATS[weaponName];
        if (!weaponPrimaryStat) return true; // Weapon not in our database, show all wedges

        // Get all stat names from the wedge
        const wedgeStatNames = wedge.stats.map(stat => stat.name);

        // Also get all stats from nested levels
        const levelStatNames = wedge.levels?.flatMap(level =>
            level.stats.map(stat => stat.name)
        ) || [];

        // Combine all stat names
        const allStatNames = [...wedgeStatNames, ...levelStatNames];

        // Define incompatible stats for each weapon primary stat type
        const incompatibleStats: Record<WeaponPrimaryStat, string[]> = {
            'Slash': ['Smash ATK', 'Spike ATK'],
            'Smash': ['Slash ATK', 'Spike ATK'],
            'Spike': ['Slash ATK', 'Smash ATK'],
        };

        // Check for direct stat conflicts
        const conflictingStats = incompatibleStats[weaponPrimaryStat];
        const hasStatConflict = allStatNames.some(statName => conflictingStats.includes(statName));

        if (hasStatConflict) return false;

        // Special check for bonus effect wedges (e.g., Fenrir's/Fafnir's Pierce, Severance)
        // These have "bonus effect: spike" or "bonus effect: slash" in tags or stat names
        const incompatibleBonusEffects: Record<WeaponPrimaryStat, string[]> = {
            'Slash': ['bonus effect: smash', 'bonus effect: spike', 'Smash Reduce', 'Spike Reduce'],
            'Smash': ['bonus effect: slash', 'bonus effect: spike', 'Slash Reduce', 'Spike Reduce'],
            'Spike': ['bonus effect: slash', 'bonus effect: smash', 'Slash Reduce', 'Smash Reduce'],
        };

        const bonusEffectConflicts = incompatibleBonusEffects[weaponPrimaryStat];

        // Check in tags
        const tagsString = wedge.tags.join(' ').toLowerCase();
        const hasTagConflict = bonusEffectConflicts.some(conflict =>
            tagsString.includes(conflict.toLowerCase())
        );

        if (hasTagConflict) return false;

        // Check in stat names (for stats like "HP Reduce on Bonus Effect: Spike")
        const hasStatNameConflict = allStatNames.some(statName =>
            bonusEffectConflicts.some(conflict =>
                statName.toLowerCase().includes(conflict.toLowerCase())
            )
        );

        if (hasStatNameConflict) return false;

        return true; // No conflict found
    };

    const applyDefaults = (value: TeamPreset): TeamPreset => ({
        ...value,
        mainCharacter: {
            ...value.mainCharacter,
            demonWedges: value.mainCharacter.demonWedges || [],
            meleeWeaponWedges: value.mainCharacter.meleeWeaponWedges || [],
            rangeWeaponWedges: value.mainCharacter.rangeWeaponWedges || [],
            consonanceWedges: value.mainCharacter.consonanceWedges || [],
        },
        geniemon: {
            ...value.geniemon,
            traits: value.geniemon.traits || [],
            demonWedges: [],
        },
        supportCharacters: value.supportCharacters.map((support) => ({
            ...support,
            demonWedges: support.demonWedges || [],
            weaponWedges: support.weaponWedges || [],
        })) as [SupportBuild, SupportBuild],
    });

    useEffect(() => {
        if (!isOpen) return;
        const base = initialPreset ? structuredClonePreset(initialPreset) : createEmptyTeamPreset();
        setPreset(applyDefaults(base));
        setStep('main');
    }, [isOpen, initialPreset]);

    if (!isOpen) return null;

    const steps: BuilderStep[] = ['main', 'geniemon', 'support1', 'support2', 'summary'];
    const stepIndex = steps.indexOf(step);

    const supportWeaponCategoryForIndex = (currentPreset: TeamPreset, index: 0 | 1) =>
        currentPreset.supportCharacters[index].weaponCategory ?? 'Melee';

    const stepTitles: Record<BuilderStep, string> = {
        main: 'Main Character',
        geniemon: 'Geniemon & Traits',
        support1: 'Support Character 1',
        support2: 'Support Character 2',
        summary: 'Review & Save',
    };

    const canGoBack = stepIndex > 0;
    const canGoNext = stepIndex < steps.length - 1;

    const handleNext = () => canGoNext && setStep(steps[stepIndex + 1]);
    const handleBack = () => canGoBack && setStep(steps[stepIndex - 1]);

    const handleSave = () => {
        const nextPreset = { ...preset, updatedAt: new Date() };
        onSave(nextPreset);
        onClose();
    };

    const getWeaponById = (weaponId?: string) =>
        weaponId ? WEAPONS_DATA.find((weapon) => weapon.id.toString() === weaponId) ?? null : null;

    const applySlotUpdate = (slots: DemonWedgeSlot[] = [], slotIndex: number, updater: SlotUpdater) => {
        const existingIndex = slots.findIndex((slot) => slot.slotIndex === slotIndex);
        const existingSlot = existingIndex >= 0 ? slots[existingIndex] : undefined;
        const updatedSlot = updater(existingSlot);
        let nextSlots = [...slots];
        if (existingIndex >= 0) {
            nextSlots.splice(existingIndex, 1);
        }
        if (updatedSlot) {
            nextSlots.push(updatedSlot);
        }
        return nextSlots.sort((a, b) => a.slotIndex - b.slotIndex);
    };

    const buildSlot = (slotIndex: number, wedge: DemonWedge, existing?: DemonWedgeSlot): DemonWedgeSlot => ({
        slotIndex,
        wedgeId: wedge.id,
        wedge,
        level: existing?.level ?? 0,
        enabled: existing?.enabled ?? true,
        conditions: existing?.conditions ? { ...existing.conditions } : undefined,
    });

    const updateMainWedges = (slotIndex: number, updater: SlotUpdater) =>
        setPreset((previous) => ({
            ...previous,
            mainCharacter: {
                ...previous.mainCharacter,
                demonWedges: applySlotUpdate(previous.mainCharacter.demonWedges, slotIndex, updater),
            },
        }));

    const updateMainWeaponWedges = (category: 'Melee' | 'Range', slotIndex: number, updater: SlotUpdater) =>
        setPreset((previous) => ({
            ...previous,
            mainCharacter: {
                ...previous.mainCharacter,
                meleeWeaponWedges:
                    category === 'Melee'
                        ? applySlotUpdate(previous.mainCharacter.meleeWeaponWedges, slotIndex, updater)
                        : previous.mainCharacter.meleeWeaponWedges,
                rangeWeaponWedges:
                    category === 'Range'
                        ? applySlotUpdate(previous.mainCharacter.rangeWeaponWedges, slotIndex, updater)
                        : previous.mainCharacter.rangeWeaponWedges,
            },
        }));

    const updateSupportWedges = (supportIndex: 0 | 1, slotIndex: number, updater: SlotUpdater) =>
        setPreset((previous) => {
            const nextSupports = previous.supportCharacters.map((support, index) =>
                index === supportIndex
                    ? {
                        ...support,
                        demonWedges: applySlotUpdate(support.demonWedges, slotIndex, updater),
                    }
                    : support
            ) as [SupportBuild, SupportBuild];
            return { ...previous, supportCharacters: nextSupports };
        });

    const updateSupportWeaponWedges = (supportIndex: 0 | 1, slotIndex: number, updater: SlotUpdater) =>
        setPreset((previous) => {
            const nextSupports = previous.supportCharacters.map((support, index) =>
                index === supportIndex
                    ? {
                        ...support,
                        weaponWedges: applySlotUpdate(support.weaponWedges, slotIndex, updater),
                    }
                    : support
            ) as [SupportBuild, SupportBuild];
            return { ...previous, supportCharacters: nextSupports };
        });

    const handleWedgeSelected = (wedge: DemonWedge) => {
        if (!wedgeModalTarget) return;
        const updater = (existing?: DemonWedgeSlot) => buildSlot(wedgeModalTarget.slotIndex, wedge, existing);

        if (wedgeModalTarget.entity === 'main') {
            updateMainWedges(wedgeModalTarget.slotIndex, updater);
        } else if (wedgeModalTarget.entity === 'mainWeapon') {
            updateMainWeaponWedges(wedgeModalTarget.category, wedgeModalTarget.slotIndex, updater);
        } else if (wedgeModalTarget.entity === 'support') {
            updateSupportWedges(wedgeModalTarget.supportIndex, wedgeModalTarget.slotIndex, updater);
        } else {
            updateSupportWeaponWedges(wedgeModalTarget.supportIndex, wedgeModalTarget.slotIndex, updater);
        }
        setWedgeModalTarget(null);
    };

    const handleRemoveWedge = (target: WedgeModalTarget) => {
        const remover = () => undefined;
        if (target.entity === 'main') {
            updateMainWedges(target.slotIndex, remover);
        } else if (target.entity === 'mainWeapon') {
            updateMainWeaponWedges(target.category, target.slotIndex, remover);
        } else if (target.entity === 'support') {
            updateSupportWedges(target.supportIndex, target.slotIndex, remover);
        } else {
            updateSupportWeaponWedges(target.supportIndex, target.slotIndex, remover);
        }
    };

    const handleToggleWedge = (target: WedgeModalTarget) => {
        const toggler: SlotUpdater = (existing) =>
            existing ? { ...existing, enabled: existing.enabled === false ? true : false } : existing;
        if (target.entity === 'main') {
            updateMainWedges(target.slotIndex, toggler);
        } else if (target.entity === 'mainWeapon') {
            updateMainWeaponWedges(target.category, target.slotIndex, toggler);
        } else if (target.entity === 'support') {
            updateSupportWedges(target.supportIndex, target.slotIndex, toggler);
        } else {
            updateSupportWeaponWedges(target.supportIndex, target.slotIndex, toggler);
        }
    };

    const handleWedgeLevelChange = (target: WedgeModalTarget, level: number) => {
        const updater: SlotUpdater = (existing) => (existing ? { ...existing, level } : existing);
        if (target.entity === 'main') {
            updateMainWedges(target.slotIndex, updater);
        } else if (target.entity === 'mainWeapon') {
            updateMainWeaponWedges(target.category, target.slotIndex, updater);
        } else if (target.entity === 'support') {
            updateSupportWedges(target.supportIndex, target.slotIndex, updater);
        } else {
            updateSupportWeaponWedges(target.supportIndex, target.slotIndex, updater);
        }
    };

    const handleWeaponSelected = (weapon: WeaponDefinition) => {
        if (!weaponModalTarget) return;
        if (weaponModalTarget.entity === 'main') {
            setPreset((previous) => ({
                ...previous,
                mainCharacter:
                    weaponModalTarget.category === 'Melee'
                        ? {
                            ...previous.mainCharacter,
                            meleeWeaponId: weapon.id.toString(),
                            meleeWeaponLevel: previous.mainCharacter.meleeWeaponLevel ?? 1,
                        }
                        : {
                            ...previous.mainCharacter,
                            rangeWeaponId: weapon.id.toString(),
                            rangeWeaponLevel: previous.mainCharacter.rangeWeaponLevel ?? 1,
                        },
            }));
        } else {
            setPreset((previous) => {
                const nextSupports = previous.supportCharacters.map((support, index) =>
                    index === weaponModalTarget.supportIndex
                        ? {
                            ...support,
                            weaponCategory: weaponModalTarget.category,
                            weaponId: weapon.id.toString(),
                            weaponLevel: support.weaponLevel ?? 1,
                        }
                        : support
                ) as [SupportBuild, SupportBuild];
                return { ...previous, supportCharacters: nextSupports };
            });
        }
        setWeaponModalTarget(null);
    };

    const handleRemoveMainWeapon = (category: 'Melee' | 'Range') =>
        setPreset((previous) => ({
            ...previous,
            mainCharacter:
                category === 'Melee'
                    ? { ...previous.mainCharacter, meleeWeaponId: undefined, meleeWeaponLevel: 1, meleeWeaponWedges: [] }
                    : { ...previous.mainCharacter, rangeWeaponId: undefined, rangeWeaponLevel: 1, rangeWeaponWedges: [] },
        }));

    const handleMainWeaponLevelChange = (category: 'Melee' | 'Range', level: number) =>
        setPreset((previous) => ({
            ...previous,
            mainCharacter:
                category === 'Melee'
                    ? { ...previous.mainCharacter, meleeWeaponLevel: level }
                    : { ...previous.mainCharacter, rangeWeaponLevel: level },
        }));

    const handleSupportWeaponCategoryChange = (supportIndex: 0 | 1, category: 'Melee' | 'Range') =>
        setPreset((previous) => {
            const nextSupports = previous.supportCharacters.map((support, index) => {
                if (index !== supportIndex) return support;
                if (support.weaponCategory === category) return support;
                return {
                    ...support,
                    weaponCategory: category,
                    weaponId: undefined,
                    weaponLevel: 1,
                    weaponWedges: [],
                };
            }) as [SupportBuild, SupportBuild];
            return { ...previous, supportCharacters: nextSupports };
        });

    const handleSupportWeaponLevelChange = (supportIndex: 0 | 1, level: number) =>
        setPreset((previous) => {
            const nextSupports = previous.supportCharacters.map((support, index) =>
                index === supportIndex ? { ...support, weaponLevel: level } : support
            ) as [SupportBuild, SupportBuild];
            return { ...previous, supportCharacters: nextSupports };
        });

    const handleRemoveSupportWeapon = (supportIndex: 0 | 1) =>
        setPreset((previous) => {
            const nextSupports = previous.supportCharacters.map((support, index) =>
                index === supportIndex
                    ? { ...support, weaponId: undefined, weaponLevel: 1, weaponWedges: [], weaponCategory: support.weaponCategory }
                    : support
            ) as [SupportBuild, SupportBuild];
            return { ...previous, supportCharacters: nextSupports };
        });

    const mainCharacter = preset.mainCharacter.characterId
        ? allCharacters.find((character) => character.id === preset.mainCharacter.characterId) ?? null
        : null;

    const geniemon = preset.geniemon.geniemonId
        ? allGeniemon.find((entry) => entry.id === preset.geniemon.geniemonId) ?? null
        : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
            <div className="relative flex w-full max-w-6xl max-h-[95vh] flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl">
                <BuilderHeader title={stepTitles[step]} onClose={onClose} step={step} />
                <BuilderProgress steps={steps} activeStep={stepIndex} titles={stepTitles} onStepSelect={(newIndex) => setStep(steps[newIndex])} />
                <div className="flex-1 overflow-y-auto p-6">
                    {step === 'main' && (
                        <MainCharacterStep
                            preset={preset}
                            setPreset={setPreset}
                            character={mainCharacter}
                            onOpenWeaponModal={(category) => setWeaponModalTarget({ entity: 'main', category })}
                            onRemoveWeapon={handleRemoveMainWeapon}
                            onWeaponLevelChange={handleMainWeaponLevelChange}
                            onOpenWedgeModal={(slotIndex) => setWedgeModalTarget({ entity: 'main', slotIndex })}
                            onRemoveWedge={(slotIndex) =>
                                handleRemoveWedge({ entity: 'main', slotIndex })
                            }
                            onToggleWedge={(slotIndex) =>
                                handleToggleWedge({ entity: 'main', slotIndex })
                            }
                            onWedgeLevelChange={(slotIndex, level) =>
                                handleWedgeLevelChange({ entity: 'main', slotIndex }, level)
                            }
                            onOpenWeaponWedgeModal={(category, slotIndex) =>
                                setWedgeModalTarget({ entity: 'mainWeapon', category, slotIndex })
                            }
                            onRemoveWeaponWedge={(category, slotIndex) =>
                                handleRemoveWedge({ entity: 'mainWeapon', category, slotIndex })
                            }
                            onToggleWeaponWedge={(category, slotIndex) =>
                                handleToggleWedge({ entity: 'mainWeapon', category, slotIndex })
                            }
                            onWeaponWedgeLevelChange={(category, slotIndex, level) =>
                                handleWedgeLevelChange({ entity: 'mainWeapon', category, slotIndex }, level)
                            }
                            getWeaponById={getWeaponById}
                        />
                    )}
                    {step === 'geniemon' && (
                        <GeniemonStep
                            preset={preset}
                            setPreset={setPreset}
                            selectedGeniemon={geniemon}
                        />
                    )}
                    {step === 'support1' && (
                        <SupportStep
                            preset={preset}
                            setPreset={setPreset}
                            supportIndex={0}
                            onOpenWeaponModal={(category) =>
                                setWeaponModalTarget({ entity: 'support', supportIndex: 0, category })
                            }
                            onWeaponCategoryChange={(category) => handleSupportWeaponCategoryChange(0, category)}
                            onRemoveWeapon={() => handleRemoveSupportWeapon(0)}
                            onWeaponLevelChange={(level) => handleSupportWeaponLevelChange(0, level)}
                            onOpenWedgeModal={(slotIndex) =>
                                setWedgeModalTarget({ entity: 'support', supportIndex: 0, slotIndex })
                            }
                            onRemoveWedge={(slotIndex) =>
                                handleRemoveWedge({ entity: 'support', supportIndex: 0, slotIndex })
                            }
                            onToggleWedge={(slotIndex) =>
                                handleToggleWedge({ entity: 'support', supportIndex: 0, slotIndex })
                            }
                            onWedgeLevelChange={(slotIndex, level) =>
                                handleWedgeLevelChange(
                                    { entity: 'support', supportIndex: 0, slotIndex },
                                    level
                                )
                            }
                            onOpenWeaponWedgeModal={(slotIndex) =>
                                setWedgeModalTarget({ entity: 'supportWeapon', supportIndex: 0, category: supportWeaponCategoryForIndex(preset, 0), slotIndex })
                            }
                            onRemoveWeaponWedge={(slotIndex) =>
                                handleRemoveWedge({ entity: 'supportWeapon', supportIndex: 0, category: supportWeaponCategoryForIndex(preset, 0), slotIndex })
                            }
                            onToggleWeaponWedge={(slotIndex) =>
                                handleToggleWedge({ entity: 'supportWeapon', supportIndex: 0, category: supportWeaponCategoryForIndex(preset, 0), slotIndex })
                            }
                            onWeaponWedgeLevelChange={(slotIndex, level) =>
                                handleWedgeLevelChange(
                                    { entity: 'supportWeapon', supportIndex: 0, category: supportWeaponCategoryForIndex(preset, 0), slotIndex },
                                    level
                                )
                            }
                            getWeaponById={getWeaponById}
                        />
                    )}
                    {step === 'support2' && (
                        <SupportStep
                            preset={preset}
                            setPreset={setPreset}
                            supportIndex={1}
                            onOpenWeaponModal={(category) =>
                                setWeaponModalTarget({ entity: 'support', supportIndex: 1, category })
                            }
                            onWeaponCategoryChange={(category) => handleSupportWeaponCategoryChange(1, category)}
                            onRemoveWeapon={() => handleRemoveSupportWeapon(1)}
                            onWeaponLevelChange={(level) => handleSupportWeaponLevelChange(1, level)}
                            onOpenWedgeModal={(slotIndex) =>
                                setWedgeModalTarget({ entity: 'support', supportIndex: 1, slotIndex })
                            }
                            onRemoveWedge={(slotIndex) =>
                                handleRemoveWedge({ entity: 'support', supportIndex: 1, slotIndex })
                            }
                            onToggleWedge={(slotIndex) =>
                                handleToggleWedge({ entity: 'support', supportIndex: 1, slotIndex })
                            }
                            onWedgeLevelChange={(slotIndex, level) =>
                                handleWedgeLevelChange(
                                    { entity: 'support', supportIndex: 1, slotIndex },
                                    level
                                )
                            }
                            onOpenWeaponWedgeModal={(slotIndex) =>
                                setWedgeModalTarget({ entity: 'supportWeapon', supportIndex: 1, category: supportWeaponCategoryForIndex(preset, 1), slotIndex })
                            }
                            onRemoveWeaponWedge={(slotIndex) =>
                                handleRemoveWedge({ entity: 'supportWeapon', supportIndex: 1, category: supportWeaponCategoryForIndex(preset, 1), slotIndex })
                            }
                            onToggleWeaponWedge={(slotIndex) =>
                                handleToggleWedge({ entity: 'supportWeapon', supportIndex: 1, category: supportWeaponCategoryForIndex(preset, 1), slotIndex })
                            }
                            onWeaponWedgeLevelChange={(slotIndex, level) =>
                                handleWedgeLevelChange(
                                    { entity: 'supportWeapon', supportIndex: 1, category: supportWeaponCategoryForIndex(preset, 1), slotIndex },
                                    level
                                )
                            }
                            getWeaponById={getWeaponById}
                        />
                    )}
                    {step === 'summary' && <SummaryStep preset={preset} setPreset={setPreset} />}
                </div>
                <BuilderFooter
                    canGoBack={canGoBack}
                    canGoNext={canGoNext}
                    onBack={handleBack}
                    onNext={handleNext}
                    onSave={handleSave}
                    isSummary={step === 'summary'}
                    currentStep={stepIndex + 1}
                    totalSteps={steps.length}
                />
            </div>
            <WeaponSelectionModal
                isOpen={Boolean(weaponModalTarget)}
                onClose={() => setWeaponModalTarget(null)}
                onSelect={handleWeaponSelected}
                category={weaponModalTarget?.category ?? 'Melee'}
            />
            <WedgeSelectionModal
                isOpen={Boolean(wedgeModalTarget)}
                onClose={() => setWedgeModalTarget(null)}
                onSelect={handleWedgeSelected}
                allowedCategories={
                    // Main and Support character wedges
                    wedgeModalTarget?.entity === 'main'
                        ? ['character']
                        : wedgeModalTarget?.entity === 'support'
                            ? ['character']
                            // Main Melee/Range Weapon wedges
                            // NOTE: Only 'melee-weapon' and 'ranged-weapon' categories allowed
                            // Consonance weapon wedges ('melee-consonance', 'ranged-consonance') are EXCLUDED
                            : wedgeModalTarget?.entity === 'mainWeapon'
                                ? wedgeModalTarget.category === 'Melee'
                                    ? ['melee-weapon']
                                    : ['ranged-weapon']
                                // Support Melee/Range Weapon wedges
                                // NOTE: Only 'melee-weapon' and 'ranged-weapon' categories allowed
                                // Consonance weapon wedges ('melee-consonance', 'ranged-consonance') are EXCLUDED
                                : wedgeModalTarget?.entity === 'supportWeapon'
                                    ? wedgeModalTarget.category === 'Melee'
                                        ? ['melee-weapon']
                                        : ['ranged-weapon']
                                    : undefined
                }
                customFilter={
                    wedgeModalTarget?.entity === 'main'
                        ? (wedge) => {
                            const mainCharacter = preset.mainCharacter.characterId
                                ? allCharacters.find((c) => c.id === preset.mainCharacter.characterId)
                                : null;
                            const isCenterSlot = wedgeModalTarget.slotIndex === MAIN_WEDGE_SLOTS - 1;
                            const isFeatheredSerpent = wedge.name.toLowerCase().includes("feathered serpent");

                            // Center slot: only Feathered Serpent's wedges
                            if (isCenterSlot) {
                                return isFeatheredSerpent;
                            }
                            // Other slots: exclude Feathered Serpent's wedges
                            if (isFeatheredSerpent) {
                                return false;
                            }

                            if (!mainCharacter) return true;
                            // Show wedges with no element (generic) or matching the character's element
                            return !wedge.element || wedge.element === mainCharacter.element;
                        }
                        : wedgeModalTarget?.entity === 'support'
                            ? (wedge) => {
                                const supportIndex = wedgeModalTarget.supportIndex;
                                const supportCharacter = preset.supportCharacters[supportIndex]?.characterId
                                    ? allCharacters.find((c) => c.id === preset.supportCharacters[supportIndex].characterId)
                                    : null;
                                const isCenterSlot = wedgeModalTarget.slotIndex === SUPPORT_WEDGE_SLOTS - 1;
                                const isFeatheredSerpent = wedge.name.toLowerCase().includes("feathered serpent");

                                // Center slot: only Feathered Serpent's wedges
                                if (isCenterSlot) {
                                    return isFeatheredSerpent;
                                }
                                // Other slots: exclude Feathered Serpent's wedges
                                if (isFeatheredSerpent) {
                                    return false;
                                }

                                if (!supportCharacter) return true;
                                // Show wedges with no element (generic) or matching the character's element
                                return !wedge.element || wedge.element === supportCharacter.element;
                            }
                            : wedgeModalTarget?.entity === 'mainWeapon'
                                ? (wedge) => {
                                    // Exclude Consonance Weapon wedges
                                    if (wedge.usage === 'Consonance Weapon') return false;

                                    // Get the weapon for this category
                                    const weaponId = wedgeModalTarget.category === 'Melee'
                                        ? preset.mainCharacter.meleeWeaponId
                                        : preset.mainCharacter.rangeWeaponId;
                                    const weapon = getWeaponById(weaponId);

                                    // Filter based on weapon's primary stat
                                    return isWedgeCompatibleWithWeapon(wedge, weapon?.name);
                                }
                                : wedgeModalTarget?.entity === 'supportWeapon'
                                    ? (wedge) => {
                                        // Exclude Consonance Weapon wedges
                                        if (wedge.usage === 'Consonance Weapon') return false;

                                        // Get the weapon for this support character
                                        const supportIndex = wedgeModalTarget.supportIndex;
                                        const weaponId = preset.supportCharacters[supportIndex]?.weaponId;
                                        const weapon = getWeaponById(weaponId);

                                        // Filter based on weapon's primary stat
                                        return isWedgeCompatibleWithWeapon(wedge, weapon?.name);
                                    }
                                    : undefined
                }
            />
        </div>
    );
}

function BuilderHeader({
    title,
    onClose,
    step,
}: {
    title: string;
    onClose: () => void;
    step: BuilderStep;
}) {
    return (
        <div className="flex items-center justify-between border-b border-white/10 p-6">
            <div>
                <h2 className="text-2xl font-bold">Team Preset Builder</h2>
                <p className="text-sm text-white/60">{title}</p>
            </div>
            <button
                onClick={onClose}
                className="rounded-lg bg-white/10 p-2 text-white transition hover:bg-white/20"
            >
                <X className="h-6 w-6" />
            </button>
        </div>
    );
}

function BuilderProgress({
    steps,
    activeStep,
    titles,
    onStepSelect,
}: {
    steps: BuilderStep[];
    activeStep: number;
    titles: Record<BuilderStep, string>;
    onStepSelect: (index: number) => void;
}) {
    return (
        <div className="border-b border-white/10 px-6 py-4">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const state = index < activeStep ? 'complete' : index === activeStep ? 'active' : 'idle';
                    return (
                        <button key={step} className="flex flex-1 items-center text-left" onClick={() => onStepSelect(index)}>
                            <div
                                className={`flex items-center gap-2 ${state === 'complete'
                                    ? 'text-green-400'
                                    : state === 'active'
                                        ? 'text-blue-400'
                                        : 'text-white/40'
                                    }`}
                            >
                                <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold ${state === 'complete'
                                        ? 'border-green-400 bg-green-400/20'
                                        : state === 'active'
                                            ? 'border-blue-400 bg-blue-400/20'
                                            : 'border-white/20 bg-white/5'
                                        }`}
                                >
                                    {state === 'complete' ? <Check className="h-4 w-4" /> : index + 1}
                                </div>
                                <span className="hidden text-xs font-medium sm:inline">{titles[step]}</span>
                            </div>
                            {index < steps.length - 1 && (
                                <div
                                    className={`mx-2 h-0.5 flex-1 ${index < activeStep ? 'bg-green-400' : 'bg-white/10'
                                        }`}
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function BuilderFooter({
    canGoBack,
    canGoNext,
    onBack,
    onNext,
    onSave,
    isSummary,
    currentStep,
    totalSteps,
}: {
    canGoBack: boolean;
    canGoNext: boolean;
    onBack: () => void;
    onNext: () => void;
    onSave: () => void;
    isSummary: boolean;
    currentStep: number;
    totalSteps: number;
}) {
    return (
        <div className="flex items-center justify-between border-t border-white/10 p-6">
            <button
                onClick={onBack}
                disabled={!canGoBack}
                className="flex items-center gap-2 rounded-lg bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
                <ArrowLeft className="h-5 w-5" />
                Back
            </button>
            <div className="text-sm text-white/60">
                Step {currentStep} of {totalSteps}
            </div>
            {isSummary ? (
                <button
                    onClick={onSave}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 font-semibold text-white transition hover:from-green-600 hover:to-emerald-600"
                >
                    <Check className="h-5 w-5" />
                    Save Team Preset
                </button>
            ) : (
                <button
                    onClick={onNext}
                    disabled={!canGoNext}
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 font-semibold text-white transition hover:from-blue-600 hover:to-purple-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Next
                    <ArrowRight className="h-5 w-5" />
                </button>
            )}
        </div>
    );
}

function MainCharacterStep({
    preset,
    setPreset,
    character,
    onOpenWeaponModal,
    onRemoveWeapon,
    onWeaponLevelChange,
    onOpenWedgeModal,
    onRemoveWedge,
    onToggleWedge,
    onWedgeLevelChange,
    onOpenWeaponWedgeModal,
    onRemoveWeaponWedge,
    onToggleWeaponWedge,
    onWeaponWedgeLevelChange,
    getWeaponById,
}: {
    preset: TeamPreset;
    setPreset: (preset: TeamPreset) => void;
    character: (typeof allCharacters)[number] | null;
    onOpenWeaponModal: (category: 'Melee' | 'Range') => void;
    onRemoveWeapon: (category: 'Melee' | 'Range') => void;
    onWeaponLevelChange: (category: 'Melee' | 'Range', level: number) => void;
    onOpenWedgeModal: (slotIndex: number) => void;
    onRemoveWedge: (slotIndex: number) => void;
    onToggleWedge: (slotIndex: number) => void;
    onWedgeLevelChange: (slotIndex: number, level: number) => void;
    onOpenWeaponWedgeModal: (category: 'Melee' | 'Range', slotIndex: number) => void;
    onRemoveWeaponWedge: (category: 'Melee' | 'Range', slotIndex: number) => void;
    onToggleWeaponWedge: (category: 'Melee' | 'Range', slotIndex: number) => void;
    onWeaponWedgeLevelChange: (category: 'Melee' | 'Range', slotIndex: number, level: number) => void;
    getWeaponById: (weaponId?: string) => WeaponDefinition | null;
}) {
    const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
    const meleeWeapon = getWeaponById(preset.mainCharacter.meleeWeaponId);
    const rangeWeapon = getWeaponById(preset.mainCharacter.rangeWeaponId);

    return (
        <div className="space-y-6">
            <StepSection
                title="Main Character"
                actionLabel={character ? 'Change' : 'Select'}
                onAction={() => setIsCharacterModalOpen(true)}
                description={
                    character
                        ? `${character.element} • ${character.role}`
                        : 'Choose who leads this preset.'
                }
                media={
                    character && (
                        <Image
                            src={character.image}
                            alt={character.name}
                            fill
                            className="object-cover object-[50%_25%]"
                        />
                    )
                }
                placeholder={!character}
                placeholderLabel="Tap to pick your lead character"
                titleValue={character?.name}
                rightContent={
                    <TrialRankSelector
                        selectedRankLevel={preset.mainCharacter.trialRank ?? null}
                        onChange={(rank) =>
                            setPreset({
                                ...preset,
                                mainCharacter: { ...preset.mainCharacter, trialRank: rank },
                            })
                        }
                    />
                }
            />
            {character && (
                <>
                    <NumberField
                        label="Character Level"
                        min={1}
                        max={80}
                        value={preset.mainCharacter.characterLevel}
                        onChange={(value) =>
                            setPreset({
                                ...preset,
                                mainCharacter: { ...preset.mainCharacter, characterLevel: Number(value) },
                            })
                        }
                    />
                    <div className="grid gap-4 md:grid-cols-2">
                        <WeaponPanel
                            label="Melee Weapon"
                            weapon={meleeWeapon}
                            level={preset.mainCharacter.meleeWeaponLevel ?? 1}
                            onSelect={() => onOpenWeaponModal('Melee')}
                            onRemove={() => onRemoveWeapon('Melee')}
                            onLevelChange={(level) => onWeaponLevelChange('Melee', level)}
                        />
                        <WeaponPanel
                            label="Range Weapon"
                            weapon={rangeWeapon}
                            level={preset.mainCharacter.rangeWeaponLevel ?? 1}
                            onSelect={() => onOpenWeaponModal('Range')}
                            onRemove={() => onRemoveWeapon('Range')}
                            onLevelChange={(level) => onWeaponLevelChange('Range', level)}
                        />
                    </div>
                    <TeamPresetWedgeGrid
                        title="Demon Wedges"
                        maxSlots={MAIN_WEDGE_SLOTS}
                        centerSlotIndex={MAIN_WEDGE_SLOTS - 1}
                        slots={preset.mainCharacter.demonWedges}
                        onSlotClick={onOpenWedgeModal}
                        onRemoveSlot={onRemoveWedge}
                        onToggleEnabled={onToggleWedge}
                        onLevelChange={onWedgeLevelChange}
                        layoutMode="centered-3x3"
                    />
                    {meleeWeapon && (
                        <TeamPresetWedgeGrid
                            title="Melee Weapon Wedges"
                            maxSlots={WEAPON_WEDGE_SLOTS}
                            slots={preset.mainCharacter.meleeWeaponWedges || []}
                            onSlotClick={(slotIndex) => onOpenWeaponWedgeModal('Melee', slotIndex)}
                            onRemoveSlot={(slotIndex) => onRemoveWeaponWedge('Melee', slotIndex)}
                            onToggleEnabled={(slotIndex) => onToggleWeaponWedge('Melee', slotIndex)}
                            onLevelChange={(slotIndex, level) =>
                                onWeaponWedgeLevelChange('Melee', slotIndex, level)
                            }
                        />
                    )}
                    {rangeWeapon && (
                        <TeamPresetWedgeGrid
                            title="Range Weapon Wedges"
                            maxSlots={WEAPON_WEDGE_SLOTS}
                            slots={preset.mainCharacter.rangeWeaponWedges || []}
                            onSlotClick={(slotIndex) => onOpenWeaponWedgeModal('Range', slotIndex)}
                            onRemoveSlot={(slotIndex) => onRemoveWeaponWedge('Range', slotIndex)}
                            onToggleEnabled={(slotIndex) => onToggleWeaponWedge('Range', slotIndex)}
                            onLevelChange={(slotIndex, level) =>
                                onWeaponWedgeLevelChange('Range', slotIndex, level)
                            }
                        />
                    )}
                </>
            )}
            <CharacterSelectionModal
                isOpen={isCharacterModalOpen}
                onClose={() => setIsCharacterModalOpen(false)}
                onSelect={(selectedCharacter) => {
                    setPreset({
                        ...preset,
                        mainCharacter: {
                            ...preset.mainCharacter,
                            characterId: selectedCharacter.id,
                        },
                    });
                    setIsCharacterModalOpen(false);
                }}
                excludedCharacterIds={[
                    preset.supportCharacters[0]?.characterId,
                    preset.supportCharacters[1]?.characterId,
                ].filter(Boolean) as string[]}
            />
        </div>
    );
}

function GeniemonStep({
    preset,
    setPreset,
    selectedGeniemon,
}: {
    preset: TeamPreset;
    setPreset: (preset: TeamPreset) => void;
    selectedGeniemon: (typeof allGeniemon)[number] | null;
}) {
    const [isGeniemonModalOpen, setIsGeniemonModalOpen] = useState(false);

    const handleUpdateTrait = (slotIndex: number, trait: GeniemonTrait | null, rarity?: 'blue' | 'purple' | 'gold') => {
        const newTraits = [...preset.geniemon.traits];
        const existingIndex = newTraits.findIndex((entry) => entry.slotIndex === slotIndex);
        if (trait) {
            const newTraitSlot: GeniemonTraitSlot = {
                slotIndex,
                traitId: trait.name,
                trait,
                rarity: rarity ?? 'gold',
            };
            if (existingIndex >= 0) {
                newTraits[existingIndex] = newTraitSlot;
            } else {
                newTraits.push(newTraitSlot);
            }
        } else if (existingIndex >= 0) {
            newTraits.splice(existingIndex, 1);
        }
        setPreset({ ...preset, geniemon: { ...preset.geniemon, traits: newTraits } });
    };

    return (
        <div className="space-y-6">
            <StepSection
                title="Geniemon"
                actionLabel={selectedGeniemon ? 'Change' : 'Select'}
                onAction={() => setIsGeniemonModalOpen(true)}
                description={
                    selectedGeniemon
                        ? `${selectedGeniemon.element} • ★${selectedGeniemon.rarity}`
                        : 'Pick the geniemon that best supports this strategy.'
                }
                media={
                    selectedGeniemon && (
                        <Image
                            src={selectedGeniemon.image}
                            alt={selectedGeniemon.name}
                            fill
                            className="object-cover"
                        />
                    )
                }
                placeholder={!selectedGeniemon}
                placeholderLabel="Tap to choose a geniemon companion"
                titleValue={selectedGeniemon?.name}
            />
            {selectedGeniemon && (
                <>
                    <TraitSelector
                        traits={preset.geniemon.traits}
                        onUpdateTrait={handleUpdateTrait}
                        maxSlots={4}
                    />
                </>
            )}
            <GeniemonSelector
                isOpen={isGeniemonModalOpen}
                onClose={() => setIsGeniemonModalOpen(false)}
                onSelect={(geniemon) => {
                    setPreset({ ...preset, geniemon: { ...preset.geniemon, geniemonId: geniemon.id } });
                    setIsGeniemonModalOpen(false);
                }}
                selectedGeniemon={selectedGeniemon}
            />
        </div>
    );
}

function SupportStep({
    preset,
    setPreset,
    supportIndex,
    onOpenWeaponModal,
    onWeaponCategoryChange,
    onRemoveWeapon,
    onWeaponLevelChange,
    onOpenWedgeModal,
    onRemoveWedge,
    onToggleWedge,
    onWedgeLevelChange,
    onOpenWeaponWedgeModal,
    onRemoveWeaponWedge,
    onToggleWeaponWedge,
    onWeaponWedgeLevelChange,
    getWeaponById,
}: {
    preset: TeamPreset;
    setPreset: (preset: TeamPreset) => void;
    supportIndex: 0 | 1;
    onOpenWeaponModal: (category: 'Melee' | 'Range') => void;
    onWeaponCategoryChange: (category: 'Melee' | 'Range') => void;
    onRemoveWeapon: () => void;
    onWeaponLevelChange: (level: number) => void;
    onOpenWedgeModal: (slotIndex: number) => void;
    onRemoveWedge: (slotIndex: number) => void;
    onToggleWedge: (slotIndex: number) => void;
    onWedgeLevelChange: (slotIndex: number, level: number) => void;
    onOpenWeaponWedgeModal: (slotIndex: number) => void;
    onRemoveWeaponWedge: (slotIndex: number) => void;
    onToggleWeaponWedge: (slotIndex: number) => void;
    onWeaponWedgeLevelChange: (slotIndex: number, level: number) => void;
    getWeaponById: (weaponId?: string) => WeaponDefinition | null;
}) {
    const [isCharacterModalOpen, setIsCharacterModalOpen] = useState(false);
    const support = preset.supportCharacters[supportIndex];
    const supportCharacter = support.characterId
        ? allCharacters.find((character) => character.id === support.characterId) ?? null
        : null;
    const supportWeapon = getWeaponById(support.weaponId);

    return (
        <div className="space-y-6">
            <StepSection
                title={`Support ${supportIndex + 1}`}
                actionLabel={supportCharacter ? 'Change' : 'Select'}
                onAction={() => setIsCharacterModalOpen(true)}
                description={
                    supportCharacter
                        ? `${supportCharacter.element} • ${supportCharacter.role}`
                        : 'Supports improve survivability and utility.'
                }
                media={
                    supportCharacter && (
                        <Image
                            src={supportCharacter.image}
                            alt={supportCharacter.name}
                            fill
                            className="object-cover object-[50%_25%]"
                        />
                    )
                }
                placeholder={!supportCharacter}
                placeholderLabel="Tap to add a support character"
                titleValue={supportCharacter?.name}
            />
            {supportCharacter && (
                <>
                    <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
                        <div className="text-sm font-semibold text-white/70">Weapon</div>
                        <div className="flex flex-wrap gap-2 text-xs font-semibold">
                            {(['Melee', 'Range'] as const).map((category) => (
                                <button
                                    key={category}
                                    onClick={() => onWeaponCategoryChange(category)}
                                    className={`rounded-full px-3 py-1 transition ${support.weaponCategory === category
                                        ? 'bg-white text-black'
                                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                        <WeaponPanel
                            label={
                                support.weaponCategory
                                    ? `${support.weaponCategory} Weapon`
                                    : 'Select weapon category first'
                            }
                            weapon={supportWeapon}
                            level={support.weaponLevel ?? 1}
                            onSelect={() =>
                                support.weaponCategory && onOpenWeaponModal(support.weaponCategory)
                            }
                            onRemove={onRemoveWeapon}
                            onLevelChange={onWeaponLevelChange}
                            disabled={!support.weaponCategory}
                        />
                        <p className="text-[11px] text-white/50">Supports can equip exactly one weapon.</p>
                    </div>
                    <TeamPresetWedgeGrid
                        title="Support Wedges"
                        maxSlots={SUPPORT_WEDGE_SLOTS}
                        centerSlotIndex={SUPPORT_WEDGE_SLOTS - 1}
                        slots={support.demonWedges}
                        onSlotClick={onOpenWedgeModal}
                        onRemoveSlot={onRemoveWedge}
                        onToggleEnabled={onToggleWedge}
                        onLevelChange={onWedgeLevelChange}
                        layoutMode="centered-3x3"
                    />
                    {supportWeapon && support.weaponCategory && (
                        <TeamPresetWedgeGrid
                            title={`${support.weaponCategory} Weapon Wedges`}
                            maxSlots={WEAPON_WEDGE_SLOTS}
                            slots={support.weaponWedges || []}
                            onSlotClick={(slotIndex) => onOpenWeaponWedgeModal(slotIndex)}
                            onRemoveSlot={(slotIndex) => onRemoveWeaponWedge(slotIndex)}
                            onToggleEnabled={(slotIndex) => onToggleWeaponWedge(slotIndex)}
                            onLevelChange={(slotIndex, level) => onWeaponWedgeLevelChange(slotIndex, level)}
                        />
                    )}
                </>
            )}
            <CharacterSelectionModal
                isOpen={isCharacterModalOpen}
                onClose={() => setIsCharacterModalOpen(false)}
                onSelect={(selectedCharacter) => {
                    const nextSupports = [...preset.supportCharacters] as [SupportBuild, SupportBuild];
                    nextSupports[supportIndex] = {
                        ...nextSupports[supportIndex],
                        characterId: selectedCharacter.id,
                    };
                    setPreset({ ...preset, supportCharacters: nextSupports });
                    setIsCharacterModalOpen(false);
                }}
                excludedCharacterIds={[
                    preset.mainCharacter.characterId,
                    preset.supportCharacters[supportIndex === 0 ? 1 : 0]?.characterId,
                ].filter(Boolean) as string[]}
            />
        </div>
    );
}

function SummaryStep({ preset, setPreset }: { preset: TeamPreset; setPreset: (preset: TeamPreset) => void }) {
    const mainCharacter = preset.mainCharacter.characterId
        ? allCharacters.find((character) => character.id === preset.mainCharacter.characterId) ?? null
        : null;
    const geniemon = preset.geniemon.geniemonId
        ? allGeniemon.find((entry) => entry.id === preset.geniemon.geniemonId) ?? null
        : null;
    const support1 = preset.supportCharacters[0].characterId
        ? allCharacters.find((character) => character.id === preset.supportCharacters[0].characterId) ?? null
        : null;
    const support2 = preset.supportCharacters[1].characterId
        ? allCharacters.find((character) => character.id === preset.supportCharacters[1].characterId) ?? null
        : null;

    return (
        <div className="space-y-6">
            <NumberField
                label="Preset Name"
                value={preset.name}
                onChange={(value) => setPreset({ ...preset, name: value.toString() })}
                isTextField
            />
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-lg font-semibold text-white">Team Summary</h3>
                <div className="mt-4 space-y-3 text-sm text-white">
                    <SummaryRow label="Main" value={mainCharacter?.name ?? 'Not selected'} />
                    <SummaryRow
                        label="Geniemon"
                        value={
                            geniemon
                                ? `${geniemon.name} (${preset.geniemon.traits.length} traits)`
                                : 'Not selected'
                        }
                    />
                    <SummaryRow label="Support 1" value={support1?.name ?? 'Not selected'} />
                    <SummaryRow label="Support 2" value={support2?.name ?? 'Not selected'} />
                </div>
            </div>
        </div>
    );
}

function StepSection({
    title,
    description,
    actionLabel,
    onAction,
    media,
    placeholder,
    placeholderLabel,
    titleValue,
    rightContent,
}: {
    title: string;
    description: string;
    actionLabel: string;
    onAction: () => void;
    media?: ReactNode;
    placeholder?: boolean;
    placeholderLabel?: string;
    titleValue?: string | null;
    rightContent?: ReactNode;
}) {

    if (placeholder) {
        return (
            <button
                onClick={onAction}
                className="group relative flex w-full max-w-md mx-auto items-center justify-between overflow-hidden rounded-xl border border-dashed border-white/20 bg-white/5 px-6 py-4 transition hover:border-white/40 hover:bg-white/10"
            >
                <div className="text-left">
                    <p className="text-xs uppercase tracking-wide text-white/40">{title}</p>
                    <p className="text-sm font-semibold text-white/70">{placeholderLabel ?? 'Select'}</p>
                </div>
                <div className="rounded-lg border border-white/20 px-3 py-1 text-xs font-semibold text-white/60 group-hover:text-white">
                    Select
                </div>
            </button>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto space-y-2">
            <button
                onClick={onAction}
                className="group relative h-[90px] w-full overflow-hidden rounded-xl border border-white/10 bg-white/5 text-left transition-all hover:border-white/20 hover:bg-white/10"
            >
                {media && (
                    <div className="absolute bottom-0 right-0 top-0 w-[60%]">
                        <div
                            className="relative h-full w-full opacity-80"
                            style={{
                                maskImage: 'linear-gradient(to left, black 40%, transparent 100%)',
                                WebkitMaskImage: 'linear-gradient(to left, black 40%, transparent 100%)',
                            }}
                        >
                            {media}
                        </div>
                    </div>
                )}
                <div className="relative z-10 flex h-full items-center px-6 justify-between">
                    <div className="flex flex-col justify-center">
                        <p className="text-xs font-medium uppercase tracking-wider text-white/40">{title}</p>
                        <p className="text-lg font-bold text-white">{titleValue}</p>
                        <p className="text-xs text-white/60">{description}</p>
                    </div>
                </div>
            </button>
            {rightContent && (
                <div className="flex justify-end">
                    {rightContent}
                </div>
            )}
        </div>
    );
}

function WeaponPanel({
    label,
    weapon,
    level,
    onSelect,
    onRemove,
    onLevelChange,
    disabled,
}: {
    label: string;
    weapon: WeaponDefinition | null;
    level: number;
    onSelect: () => void;
    onRemove: () => void;
    onLevelChange: (level: number) => void;
    disabled?: boolean;
}) {
    return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs uppercase tracking-wide text-white/40">{label}</p>
                    <p className="text-sm font-semibold text-white">
                        {weapon ? weapon.name : disabled ? 'Select a category first' : 'No weapon selected'}
                    </p>
                </div>
                <div className="flex gap-2">
                    {weapon && (
                        <button
                            onClick={onRemove}
                            className="rounded-lg border border-red-500/40 px-3 py-1 text-xs text-red-300 transition hover:bg-red-500/10"
                        >
                            Remove
                        </button>
                    )}
                    <button
                        onClick={onSelect}
                        disabled={disabled}
                        className="rounded-lg border border-white/20 px-3 py-1 text-xs text-white transition hover:border-white/40 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {weapon ? 'Change' : 'Select'}
                    </button>
                </div>
            </div>
            {weapon && (
                <div className="mt-4 space-y-1">
                    <div className="flex items-center justify-between text-xs text-white/60">
                        <span>Level</span>
                        <span className="font-mono text-white">Lv.{level}</span>
                    </div>
                    <input
                        type="range"
                        min={1}
                        max={80}
                        value={level}
                        onChange={(event) => onLevelChange(Number(event.target.value))}
                        className="w-full accent-white"
                    />
                </div>
            )}
        </div>
    );
}

function NumberField({
    label,
    value,
    onChange,
    min,
    max,
    isTextField,
}: {
    label: string;
    value: number | string;
    onChange: (value: number | string) => void;
    min?: number;
    max?: number;
    isTextField?: boolean;
}) {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (isTextField) {
            onChange(event.target.value);
            return;
        }

        const inputValue = event.target.value;

        // Allow empty input for typing
        if (inputValue === '') {
            onChange(min ?? 1);
            return;
        }

        // Parse as integer (no decimals)
        const parsed = parseInt(inputValue, 10);

        // Validate: must be a positive integer within range
        if (isNaN(parsed) || parsed < (min ?? 1)) {
            onChange(min ?? 1);
        } else if (max !== undefined && parsed > max) {
            onChange(max);
        } else {
            onChange(parsed);
        }
    };

    return (
        <div>
            <label className="mb-2 block text-sm font-medium text-white/70">{label}</label>
            <input
                type={isTextField ? 'text' : 'number'}
                min={min}
                max={max}
                step={isTextField ? undefined : 1}
                value={value}
                onChange={handleChange}
                onKeyDown={(event) => {
                    // Prevent decimal point and minus sign for number inputs
                    if (!isTextField && (event.key === '.' || event.key === '-' || event.key === 'e')) {
                        event.preventDefault();
                    }
                }}
                className="w-full rounded-xl bg-white/5 px-4 py-3 text-white outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-blue-500"
            />
        </div>
    );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center gap-4 text-white">
            <span className="w-32 text-xs font-semibold uppercase tracking-wide text-white/40">
                {label}
            </span>
            <span className="flex-1 text-sm font-medium">{value}</span>
        </div>
    );
}

function structuredClonePreset(preset: TeamPreset): TeamPreset {
    if (typeof structuredClone === 'function') {
        return structuredClone(preset);
    }
    return JSON.parse(JSON.stringify(preset)) as TeamPreset;
}
