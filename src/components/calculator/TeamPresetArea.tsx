'use client';

import { TeamPreset } from '@/lib/team-preset-types';
import { TeamPresetCard } from './TeamPresetCard';
import { Plus } from 'lucide-react';

interface TeamPresetAreaProps {
    presetA: TeamPreset | null;
    presetB: TeamPreset | null;
    onCreatePreset: (side: 'A' | 'B') => void;
    onEditPreset: (side: 'A' | 'B') => void;
    onCopyPreset: (from: 'A' | 'B', to: 'A' | 'B') => void;
    onSharePreset: (side: 'A' | 'B') => void;
    onImportPreset: () => void;
    onDeletePreset: (side: 'A' | 'B') => void;
}

export function TeamPresetArea({
    presetA,
    presetB,
    onCreatePreset,
    onEditPreset,
    onCopyPreset,
    onSharePreset,
    onImportPreset,
    onDeletePreset,
}: TeamPresetAreaProps) {
    return (
        <div className="space-y-4">
            {/* Header with New Preset Button */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold">Team Presets</h2>
                    <p className="text-sm text-white/60">Create and compare team configurations</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                        onClick={onImportPreset}
                        className="flex items-center justify-center gap-2 rounded-lg border border-white/15 px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
                    >
                        Import Shared Preset
                    </button>
                    <button
                        onClick={() => {
                            if (!presetA) {
                                onCreatePreset('A');
                            } else if (!presetB) {
                                onCreatePreset('B');
                            } else {
                                onCreatePreset('A');
                            }
                        }}
                        className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3 font-semibold text-white transition hover:from-blue-600 hover:to-purple-600"
                    >
                        <Plus className="h-5 w-5" />
                        New Team Preset
                    </button>
                </div>
            </div>

            {/* Preset Cards Grid - Only show when presets exist */}
            {(presetA || presetB) && (
                <div className="grid gap-6 lg:grid-cols-2">
                    {presetA && (
                        <TeamPresetCard
                            preset={presetA}
                            side="A"
                            otherSide="B"
                            onCreatePreset={() => onCreatePreset('A')}
                            onEditPreset={() => onEditPreset('A')}
                            onCopyFromOtherSide={() => onCopyPreset('B', 'A')}
                            onShare={() => onSharePreset('A')}
                            onDelete={() => onDeletePreset('A')}
                        />
                    )}
                    {presetB && (
                        <TeamPresetCard
                            preset={presetB}
                            side="B"
                            otherSide="A"
                            onCreatePreset={() => onCreatePreset('B')}
                            onEditPreset={() => onEditPreset('B')}
                            onCopyFromOtherSide={() => onCopyPreset('A', 'B')}
                            onShare={() => onSharePreset('B')}
                            onDelete={() => onDeletePreset('B')}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
