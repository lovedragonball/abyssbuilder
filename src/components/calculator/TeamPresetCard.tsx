'use client';

import { TeamPreset } from '@/lib/team-preset-types';
import { allCharacters } from '@/lib/data';
import { allGeniemon } from '@/lib/geniemon-data';
import { Copy, Edit, Share2, Plus, Users, Trash2, Shield } from 'lucide-react';
import Image from 'next/image';
import trialRanks from '@/lib/trial-rank.json';

interface TeamPresetCardProps {
    preset: TeamPreset | null;
    side: 'A' | 'B';
    otherSide: 'A' | 'B';
    onCreatePreset: () => void;
    onEditPreset: () => void;
    onCopyFromOtherSide: () => void;
    onShare: () => void;
    onDelete: () => void;
}

export function TeamPresetCard({
    preset,
    side,
    otherSide,
    onCreatePreset,
    onEditPreset,
    onCopyFromOtherSide,
    onShare,
    onDelete,
}: TeamPresetCardProps) {
    const gradients = {
        A: 'from-blue-500/20 to-purple-500/20',
        B: 'from-orange-500/20 to-red-500/20',
    };

    const borderColors = {
        A: 'border-blue-500/30',
        B: 'border-orange-500/30',
    };

    if (!preset) {
        return (
            <div className={`relative rounded-xl border ${borderColors[side]} bg-gradient-to-br ${gradients[side]} p-6 backdrop-blur-sm`}>
                <div className="flex flex-col items-center justify-center space-y-4 py-8">
                    <div className="rounded-full bg-white/5 p-4">
                        <Users className="h-12 w-12 text-white/40" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-white/60">Team Preset {side}</h3>
                        <p className="mt-2 text-sm text-white/40">No team preset selected</p>
                    </div>
                    <button
                        onClick={onCreatePreset}
                        className="flex items-center gap-2 rounded-lg bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/20"
                    >
                        <Plus className="h-5 w-5" />
                        Create Preset
                    </button>
                </div>
            </div>
        );
    }

    // Get character and geniemon data
    const mainCharacter = allCharacters.find(c => c.id === preset.mainCharacter.characterId);
    const geniemon = allGeniemon.find(g => g.id === preset.geniemon.geniemonId);
    const support1 = allCharacters.find(c => c.id === preset.supportCharacters[0].characterId);
    const support2 = allCharacters.find(c => c.id === preset.supportCharacters[1].characterId);

    // Get trial rank data
    const trialRank = preset.mainCharacter.trialRank
        ? trialRanks.find(r => r.level === preset.mainCharacter.trialRank)
        : null;

    // Count items
    const totalWedges =
        preset.mainCharacter.demonWedges.filter(w => w.wedge).length +
        (preset.mainCharacter.consonanceWedges?.filter(w => w.wedge).length || 0) +
        preset.geniemon.demonWedges.filter(w => w.wedge).length +
        preset.supportCharacters[0].demonWedges.filter(w => w.wedge).length +
        preset.supportCharacters[1].demonWedges.filter(w => w.wedge).length;

    const totalTraits = preset.geniemon.traits.filter(t => t.trait).length;

    return (
        <div className={`relative rounded-xl border ${borderColors[side]} bg-gradient-to-br ${gradients[side]} p-6 backdrop-blur-sm`}>
            {/* Header */}
            <div className="mb-4 flex items-start justify-between">
                <div>
                    <div className="text-xs font-medium uppercase tracking-wider text-white/60">Team Preset {side}</div>
                    <h3 className="mt-1 text-2xl font-bold">{preset.name}</h3>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onShare}
                        className="rounded-lg bg-white/10 p-2 transition hover:bg-white/20"
                        title="Share Preset"
                    >
                        <Share2 className="h-4 w-4" />
                    </button>
                    <button
                        onClick={onEditPreset}
                        className="rounded-lg bg-white/10 p-2 transition hover:bg-white/20"
                        title="Edit Preset"
                    >
                        <Edit className="h-4 w-4" />
                    </button>
                    <button
                        onClick={onCopyFromOtherSide}
                        className="rounded-lg bg-white/10 p-2 transition hover:bg-white/20"
                        title={`Copy from Team ${otherSide}`}
                    >
                        <Copy className="h-4 w-4" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="rounded-lg bg-white/10 p-2 transition hover:bg-red-500/30"
                        title="Delete Preset"
                    >
                        <Trash2 className="h-4 w-4 text-red-300" />
                    </button>
                </div>
            </div>

            {/* Team Composition */}
            <div className="space-y-4">
                {/* Main Character */}
                <div className="flex items-center gap-3 rounded-lg bg-black/20 p-3">
                    {mainCharacter?.image && (
                        <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-white/20">
                            <Image
                                src={mainCharacter.image}
                                alt={mainCharacter.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                    )}
                    <div className="flex-1">
                        <div className="text-xs text-white/60">Main Character</div>
                        <div className="font-semibold">{mainCharacter?.name || 'Not selected'}</div>
                        {mainCharacter && (
                            <>
                                <div className="mt-1 text-xs text-white/60">
                                    Lv.{preset.mainCharacter.characterLevel}
                                    {preset.mainCharacter.meleeWeaponId && ' • Melee'}
                                    {preset.mainCharacter.rangeWeaponId && ' • Range'}
                                </div>
                                {trialRank && (
                                    <div className="mt-1.5 flex items-center gap-1.5 rounded bg-amber-500/10 px-2 py-1 w-fit">
                                        <Shield className="h-3 w-3 text-amber-400" />
                                        <span className="text-xs font-bold text-amber-400">{trialRank.rank}</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Geniemon */}
                <div className="flex items-center gap-3 rounded-lg bg-black/20 p-3">
                    {geniemon?.image && (
                        <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-white/20">
                            <Image
                                src={geniemon.image}
                                alt={geniemon.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                    )}
                    <div className="flex-1">
                        <div className="text-xs text-white/60">Geniemon</div>
                        <div className="font-semibold">{geniemon?.name || 'Not selected'}</div>
                        {geniemon && (
                            <div className="mt-1 text-xs text-white/60">
                                {totalTraits} trait{totalTraits !== 1 ? 's' : ''} equipped
                            </div>
                        )}
                    </div>
                </div>

                {/* Supports */}
                <div className="grid grid-cols-2 gap-2">
                    {/* Support 1 */}
                    <div className="flex items-center gap-2 rounded-lg bg-black/20 p-2">
                        {support1?.image && (
                            <div className="relative h-10 w-10 overflow-hidden rounded border border-white/20">
                                <Image
                                    src={support1.image}
                                    alt={support1.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <div className="text-xs text-white/60">Support 1</div>
                            <div className="truncate text-sm font-semibold">{support1?.name || 'Empty'}</div>
                        </div>
                    </div>

                    {/* Support 2 */}
                    <div className="flex items-center gap-2 rounded-lg bg-black/20 p-2">
                        {support2?.image && (
                            <div className="relative h-10 w-10 overflow-hidden rounded border border-white/20">
                                <Image
                                    src={support2.image}
                                    alt={support2.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <div className="text-xs text-white/60">Support 2</div>
                            <div className="truncate text-sm font-semibold">{support2?.name || 'Empty'}</div>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    );
}
