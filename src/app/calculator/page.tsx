'use client';

import { useState, useMemo, useEffect } from 'react';
import { TeamPreset } from '@/lib/team-preset-types';
import { TeamPresetArea } from '@/components/calculator/TeamPresetArea';
import { TeamPresetBuilder } from '@/components/calculator/TeamPresetBuilder';
import { DamageVisualization } from '@/components/calculator/DamageVisualization';
import {
    copyShareLinkToClipboard,
    parseSharedPresetFromURL,
    decodePresetFromURL,
} from '@/lib/share-preset';
import { calculateDamage, EquippedCalculatorWedge } from '@/lib/damage-calculator';
import { copyTeamPreset } from '@/lib/team-preset-types';
import { allCharacters } from '@/lib/data';
import { WEAPONS_DATA } from '@/lib/weapons-data';
import { ImportPresetModal } from '@/components/calculator/ImportPresetModal';
import { AssignImportedPresetModal } from '@/components/calculator/AssignImportedPresetModal';
import { allDemonWedges } from '@/lib/demon-wedges-data';

type MaybePresetSlot = (EquippedCalculatorWedge & { enabled: boolean }) | undefined;

// LocalStorage keys
const STORAGE_KEY_PRESET_A = 'abyssbuilder_team_preset_a';
const STORAGE_KEY_PRESET_B = 'abyssbuilder_team_preset_b';

export default function CalculatorPage() {
    const [damageType, setDamageType] = useState<'character' | 'weapon'>('character');

    // Team preset state
    const [teamPresetA, setTeamPresetA] = useState<TeamPreset | null>(null);
    const [teamPresetB, setTeamPresetB] = useState<TeamPreset | null>(null);

    // Builder state
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);
    const [editingPresetSide, setEditingPresetSide] = useState<'A' | 'B' | null>(null);
    const [editingPreset, setEditingPreset] = useState<TeamPreset | undefined>(undefined);

    // Sharing / import
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [pendingImportedPreset, setPendingImportedPreset] = useState<TeamPreset | null>(null);

    // Load presets from localStorage on mount
    useEffect(() => {
        try {
            const savedPresetA = localStorage.getItem(STORAGE_KEY_PRESET_A);
            const savedPresetB = localStorage.getItem(STORAGE_KEY_PRESET_B);

            if (savedPresetA) {
                const parsed = JSON.parse(savedPresetA) as TeamPreset;
                setTeamPresetA(parsed);
            }
            if (savedPresetB) {
                const parsed = JSON.parse(savedPresetB) as TeamPreset;
                setTeamPresetB(parsed);
            }
        } catch (error) {
            console.error('Failed to load presets from localStorage:', error);
        }
    }, []);

    // Check for shared preset on mount
    useEffect(() => {
        const sharedPreset = parseSharedPresetFromURL();
        if (sharedPreset) {
            setPendingImportedPreset(sharedPreset);
            clearPresetQueryParam();
        }
    }, []);

    // Save presets to localStorage whenever they change
    useEffect(() => {
        try {
            if (teamPresetA) {
                localStorage.setItem(STORAGE_KEY_PRESET_A, JSON.stringify(teamPresetA));
            } else {
                localStorage.removeItem(STORAGE_KEY_PRESET_A);
            }
        } catch (error) {
            console.error('Failed to save preset A to localStorage:', error);
        }
    }, [teamPresetA]);

    useEffect(() => {
        try {
            if (teamPresetB) {
                localStorage.setItem(STORAGE_KEY_PRESET_B, JSON.stringify(teamPresetB));
            } else {
                localStorage.removeItem(STORAGE_KEY_PRESET_B);
            }
        } catch (error) {
            console.error('Failed to save preset B to localStorage:', error);
        }
    }, [teamPresetB]);

    // Convert team preset to old format for damage calculation
    // This maintains compatibility with existing DamageVisualization component
    const convertPresetToOldFormat = (preset: TeamPreset | null) => {
        if (!preset) {
            return {
                character: null,
                characterLevel: 1,
                presetWedges: [],
                consonanceWedges: [],
                selectedRangeWeapon: null,
                selectedMeleeWeapon: null,
                rangeWeaponLevel: 1,
                meleeWeaponLevel: 1,
                trialRank: null,
                teamWedges: [],
            };
        }

        const character = allCharacters.find(c => c.id === preset.mainCharacter.characterId) || null;
        const rangeWeapon = preset.mainCharacter.rangeWeaponId
            ? WEAPONS_DATA.find(w => w.id.toString() === preset.mainCharacter.rangeWeaponId) || null
            : null;
        const meleeWeapon = preset.mainCharacter.meleeWeaponId
            ? WEAPONS_DATA.find(w => w.id.toString() === preset.mainCharacter.meleeWeaponId) || null
            : null;

        const resolveWedge = (slot: { wedge?: EquippedCalculatorWedge['wedge']; wedgeId?: string }) => {
            const wedgeId = slot.wedge?.id ?? slot.wedgeId;
            if (!wedgeId) return slot.wedge;
            return allDemonWedges.find((entry) => entry.id === wedgeId) ?? slot.wedge;
        };

        const convertSlots = (slots: typeof preset.mainCharacter.demonWedges = []): MaybePresetSlot[] =>
            slots.map((slot) => {
                const wedge = resolveWedge(slot);
                if (!wedge) return undefined;

                return {
                    wedge,
                    level: slot.level || 0,
                    enabled: slot.enabled !== false,
                    conditions: slot.conditions,
                };
            });

        const presetWedges = convertSlots(preset.mainCharacter.demonWedges);
        const consonanceWedges = convertSlots(preset.mainCharacter.consonanceWedges || []);
        const meleeWeaponWedges = convertSlots(preset.mainCharacter.meleeWeaponWedges || []);
        const rangeWeaponWedges = convertSlots(preset.mainCharacter.rangeWeaponWedges || []);
        const geniemonWedges = convertSlots(preset.geniemon.demonWedges);
        const supportWedges = preset.supportCharacters.flatMap(support => convertSlots(support.demonWedges));
        const supportWeaponWedges = preset.supportCharacters.flatMap(support => convertSlots(support.weaponWedges));

        const enabledTeamWedges = [
            ...presetWedges,
            ...consonanceWedges,
            ...meleeWeaponWedges,
            ...rangeWeaponWedges,
            ...geniemonWedges,
            ...supportWedges,
            ...supportWeaponWedges
        ]
            .filter((w): w is EquippedCalculatorWedge & { enabled: boolean } => Boolean(w && w.enabled))
            .map(w => ({ wedge: w.wedge, level: w.level, conditions: w.conditions }));

        return {
            character,
            characterLevel: preset.mainCharacter.characterLevel,
            presetWedges,
            consonanceWedges,
            selectedRangeWeapon: rangeWeapon,
            selectedMeleeWeapon: meleeWeapon,
            rangeWeaponLevel: preset.mainCharacter.rangeWeaponLevel || 1,
            meleeWeaponLevel: preset.mainCharacter.meleeWeaponLevel || 1,
            trialRank: preset.mainCharacter.trialRank || null,
            teamWedges: enabledTeamWedges,
        };
    };

    const dataA = convertPresetToOldFormat(teamPresetA);
    const dataB = convertPresetToOldFormat(teamPresetB);

    // Calculate damage results
    const resultA = useMemo(() => {
        return calculateDamage({
            damageType,
            characterBaseAtk: 1000,
            weaponBaseAtk: 500,
            skillMultiplier: 200,
            weaponTypeAtkPercent: 0,
            proficiency: 1.0,
            wedges: dataA.teamWedges,
        });
    }, [damageType, dataA.teamWedges]);

    const resultB = useMemo(() => {
        return calculateDamage({
            damageType,
            characterBaseAtk: 1000,
            weaponBaseAtk: 500,
            skillMultiplier: 200,
            weaponTypeAtkPercent: 0,
            proficiency: 1.0,
            wedges: dataB.teamWedges,
        });
    }, [damageType, dataB.teamWedges]);

    // Handlers
    const handleCreatePreset = (side: 'A' | 'B') => {
        setEditingPresetSide(side);
        setEditingPreset(undefined);
        setIsBuilderOpen(true);
    };

    const handleEditPreset = (side: 'A' | 'B') => {
        const preset = side === 'A' ? teamPresetA : teamPresetB;
        if (!preset) return;

        setEditingPresetSide(side);
        setEditingPreset(preset);
        setIsBuilderOpen(true);
    };

    const handleSavePreset = (preset: TeamPreset) => {
        if (editingPresetSide === 'A') {
            setTeamPresetA(preset);
        } else if (editingPresetSide === 'B') {
            setTeamPresetB(preset);
        }
        setIsBuilderOpen(false);
        setEditingPresetSide(null);
        setEditingPreset(undefined);
    };

    const handleCopyPreset = (from: 'A' | 'B', to: 'A' | 'B') => {
        const sourcePreset = from === 'A' ? teamPresetA : teamPresetB;
        if (!sourcePreset) return;

        const copied = copyTeamPreset(sourcePreset);
        if (to === 'A') {
            setTeamPresetA(copied);
        } else {
            setTeamPresetB(copied);
        }
    };

    const handleSharePreset = async (side: 'A' | 'B') => {
        const preset = side === 'A' ? teamPresetA : teamPresetB;
        if (!preset) return;

        const success = await copyShareLinkToClipboard(preset);
        if (success) {
            alert('Share link copied to clipboard!');
        } else {
            alert('Failed to copy share link');
        }
    };

    const handleAssignImportedPreset = (side: 'A' | 'B') => {
        if (!pendingImportedPreset) return;
        if (side === 'A') {
            setTeamPresetA(pendingImportedPreset);
        } else {
            setTeamPresetB(pendingImportedPreset);
        }
        setPendingImportedPreset(null);
    };

    const handleManualImportSubmit = async (rawValue: string) => {
        const code = extractPresetCode(rawValue);
        if (!code) return false;
        const decoded = decodePresetFromURL(code);
        if (!decoded) return false;
        setPendingImportedPreset(decoded);
        setIsImportModalOpen(false);
        return true;
    };

    return (
        <div className="mx-auto w-full px-4 space-y-8 pb-20">
            {/* Page Header */}
            <div className="flex flex-col gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-headline font-bold">Damage Calculator</h1>
                    <p className="text-white/60 max-w-2xl">
                        Build and compare team configurations <span className="font-semibold text-white">Head-to-Head</span>.
                    </p>
                </div>
            </div>

            {/* Team Presets Header */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold">Team Presets</h2>
                    <p className="text-sm text-white/60">Create and compare team configurations</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="flex items-center justify-center gap-2 rounded-lg border border-white/15 px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
                    >
                        Import Shared Preset
                    </button>
                    <button
                        onClick={() => {
                            if (!teamPresetA) {
                                handleCreatePreset('A');
                            } else if (!teamPresetB) {
                                handleCreatePreset('B');
                            } else {
                                handleCreatePreset('A');
                            }
                        }}
                        className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 font-semibold text-white transition hover:from-blue-600 hover:to-purple-600"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus h-5 w-5">
                            <path d="M5 12h14"></path>
                            <path d="M12 5v14"></path>
                        </svg>
                        New Team Preset
                    </button>
                </div>
            </div>

            {/* Compare Stats Section - No longer sticky, full width */}
            <DamageVisualization
                resultA={resultA}
                resultB={resultB}
                presetA={dataA.presetWedges}
                presetB={dataB.presetWedges}
                consonanceA={dataA.consonanceWedges}
                consonanceB={dataB.consonanceWedges}
                selectedCharacterA={dataA.character}
                selectedCharacterB={dataB.character}
                characterLevelA={dataA.characterLevel}
                characterLevelB={dataB.characterLevel}
                rangeWeaponLevelA={dataA.rangeWeaponLevel}
                meleeWeaponLevelA={dataA.meleeWeaponLevel}
                rangeWeaponLevelB={dataB.rangeWeaponLevel}
                meleeWeaponLevelB={dataB.meleeWeaponLevel}
                finalStatsA={{
                    ATK: 0, HP: 0, Shield: 0, DEF: 0, MaxSanity: 0,
                    SkillDMG: 0, SkillRange: 0, SkillDuration: 0, SkillEfficiency: 0,
                    Morale: 0, Resolve: 0
                }}
                finalStatsB={{
                    ATK: 0, HP: 0, Shield: 0, DEF: 0, MaxSanity: 0,
                    SkillDMG: 0, SkillRange: 0, SkillDuration: 0, SkillEfficiency: 0,
                    Morale: 0, Resolve: 0
                }}
                onOpenWedgeModal={() => { }}
                onRemoveWedge={() => { }}
                onUpdateLevel={() => { }}
                onToggleEnabled={() => { }}
                onUpdateConditions={() => { }}
                onCopyPreset={() => { }}
                onLevelChangeA={() => { }}
                onLevelChangeB={() => { }}
                onRangeWeaponLevelChangeA={() => { }}
                onMeleeWeaponLevelChangeA={() => { }}
                onRangeWeaponLevelChangeB={() => { }}
                onMeleeWeaponLevelChangeB={() => { }}
                trialRankA={dataA.trialRank}
                trialRankB={dataB.trialRank}
                onTrialRankChangeA={() => { }}
                onTrialRankChangeB={() => { }}
                onOpenCharacterModal={() => { }}
                onClearCharacter={() => { }}
                selectedRangeWeaponA={dataA.selectedRangeWeapon}
                selectedMeleeWeaponA={dataA.selectedMeleeWeapon}
                selectedRangeWeaponB={dataB.selectedRangeWeapon}
                selectedMeleeWeaponB={dataB.selectedMeleeWeapon}
                onOpenWeaponModal={() => { }}
                onClearWeapon={() => { }}
            />

            {/* Team Preset Area */}
            <TeamPresetArea
                presetA={teamPresetA}
                presetB={teamPresetB}
                onCreatePreset={handleCreatePreset}
                onEditPreset={handleEditPreset}
                onCopyPreset={handleCopyPreset}
                onSharePreset={handleSharePreset}
                onDeletePreset={(side) => {
                    if (side === 'A') {
                        setTeamPresetA(null);
                    } else {
                        setTeamPresetB(null);
                    }
                }}
                onImportPreset={() => setIsImportModalOpen(true)}
            />

            {/* Team Preset Builder Modal */}
            <TeamPresetBuilder
                isOpen={isBuilderOpen}
                onClose={() => {
                    setIsBuilderOpen(false);
                    setEditingPresetSide(null);
                    setEditingPreset(undefined);
                }}
                onSave={handleSavePreset}
                initialPreset={editingPreset}
            />
            <ImportPresetModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onSubmit={handleManualImportSubmit}
            />
            <AssignImportedPresetModal
                preset={pendingImportedPreset}
                isOpen={Boolean(pendingImportedPreset)}
                onAssign={handleAssignImportedPreset}
                onCancel={() => setPendingImportedPreset(null)}
            />
        </div>
    );
}

function extractPresetCode(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) return '';
    try {
        const possibleUrl = new URL(trimmed);
        const param = possibleUrl.searchParams.get('preset');
        if (param) return param;
    } catch {
        // not a full URL
    }
    return trimmed;
}

function clearPresetQueryParam() {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (url.searchParams.has('preset')) {
        url.searchParams.delete('preset');
        window.history.replaceState({}, '', url.toString());
    }
}
