'use client';

import Image from 'next/image';
import { X } from 'lucide-react';
import { TeamPreset } from '@/lib/team-preset-types';
import { allCharacters } from '@/lib/data';
import { allGeniemon } from '@/lib/geniemon-data';

interface AssignImportedPresetModalProps {
    preset: TeamPreset | null;
    isOpen: boolean;
    onAssign: (side: 'A' | 'B') => void;
    onCancel: () => void;
}

export function AssignImportedPresetModal({
    preset,
    isOpen,
    onAssign,
    onCancel,
}: AssignImportedPresetModalProps) {
    if (!isOpen || !preset) return null;

    const mainCharacter = allCharacters.find((character) => character.id === preset.mainCharacter.characterId);
    const geniemon = allGeniemon.find((entry) => entry.id === preset.geniemon.geniemonId);
    const support1 = allCharacters.find((character) => character.id === preset.supportCharacters[0]?.characterId);
    const support2 = allCharacters.find((character) => character.id === preset.supportCharacters[1]?.characterId);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
            <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-[#111118] p-6 shadow-2xl">
                <button
                    onClick={onCancel}
                    className="absolute right-4 top-4 rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
                    aria-label="Close import assignment modal"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="space-y-6">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-emerald-400">Shared Preset Detected</p>
                        <h2 className="text-2xl font-semibold text-white mt-1">{preset.name}</h2>
                        <p className="text-sm text-white/60">
                            Review the team composition below and import it.
                        </p>
                    </div>

                    <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 md:grid-cols-2">
                        <SummaryTile
                            label="Main"
                            title={mainCharacter?.name ?? 'Unknown'}
                            subtitle={mainCharacter ? `${mainCharacter.element} • ${mainCharacter.role}` : 'No character selected'}
                            image={mainCharacter?.image}
                        />
                        <SummaryTile
                            label="Geniemon"
                            title={geniemon?.name ?? 'Unknown'}
                            subtitle={
                                geniemon
                                    ? `${geniemon.element} • ★${geniemon.rarity} • ${preset.geniemon.traits.length} trait${preset.geniemon.traits.length === 1 ? '' : 's'}`
                                    : 'No geniemon selected'
                            }
                            image={geniemon?.image}
                        />
                        <SummaryTile
                            label="Support 1"
                            title={support1?.name ?? 'Empty'}
                            subtitle={support1 ? `${support1.element} • ${support1.role}` : 'No support selected'}
                            image={support1?.image}
                        />
                        <SummaryTile
                            label="Support 2"
                            title={support2?.name ?? 'Empty'}
                            subtitle={support2 ? `${support2.element} • ${support2.role}` : 'No support selected'}
                            image={support2?.image}
                        />
                    </div>

                    <button
                        onClick={() => onAssign('A')}
                        className="w-full rounded-xl border border-white/10 bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-center transition hover:opacity-90"
                    >
                        <p className="text-lg font-semibold text-white">Import Preset</p>
                    </button>
                </div>
            </div>
        </div>
    );
}

function SummaryTile({
    label,
    title,
    subtitle,
    image,
}: {
    label: string;
    title: string;
    subtitle: string;
    image?: string;
}) {
    return (
        <div className="flex items-center gap-4 rounded-xl border border-white/5 bg-black/30 p-3">
            <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-white/10 bg-black/40">
                {image ? (
                    <Image src={image} alt={title} fill className="object-cover" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl font-bold text-white/40">
                        {title ? title[0] : '?'}
                    </div>
                )}
            </div>
            <div>
                <p className="text-xs uppercase tracking-wide text-white/40">{label}</p>
                <p className="text-base font-semibold text-white">{title}</p>
                <p className="text-xs text-white/60">{subtitle}</p>
            </div>
        </div>
    );
}



