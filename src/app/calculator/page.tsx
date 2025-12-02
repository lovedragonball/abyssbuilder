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

    // Check for shared preset on mount
    useEffect(() => {
        const sharedPreset = parseSharedPresetFromURL();
        if (sharedPreset) {
            setPendingImportedPreset(sharedPreset);
            clearPresetQueryParam();
        }
    }, []);

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
