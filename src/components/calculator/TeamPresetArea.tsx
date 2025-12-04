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
