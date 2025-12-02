'use client';

import type { SyntheticEvent } from 'react';
import Image from 'next/image';
import { Plus, X, Power } from 'lucide-react';
import { DemonWedgeSlot } from '@/lib/team-preset-types';

interface TeamPresetWedgeGridProps {
    title: string;
    maxSlots: number;
    slots: DemonWedgeSlot[];
    onSlotClick: (slotIndex: number) => void;
    onRemoveSlot: (slotIndex: number) => void;
    onToggleEnabled?: (slotIndex: number) => void;
    onLevelChange?: (slotIndex: number, level: number) => void;
    centerSlotIndex?: number;
    layoutMode?: 'default' | 'centered-3x3';
}

const rarityStyles: Record<number, string> = {
    5: 'border-amber-400/70 bg-amber-500/10',
    4: 'border-purple-400/70 bg-purple-500/10',
    3: 'border-blue-400/60 bg-blue-500/10',
    2: 'border-teal-400/40 bg-teal-500/10',
};

const stopSlotPropagation = (event: SyntheticEvent) => event.stopPropagation();

export function TeamPresetWedgeGrid({
    title,
    maxSlots,
    slots,
    onSlotClick,
    onRemoveSlot,
    onToggleEnabled,
    onLevelChange,
    centerSlotIndex,
    layoutMode = 'default',
}: TeamPresetWedgeGridProps) {
    const equippedCount = slots.filter((slot) => slot.wedge).length;

    // Create array of slots with their logical indices
    const logicalSlots = Array.from({ length: maxSlots }, (_, index) => ({
        slot: slots.find((s) => s.slotIndex === index),
        logicalIndex: index,
    }));

    let displaySlots = logicalSlots;
    let gridColsClass = maxSlots >= 8 ? 'grid-cols-4' : 'grid-cols-3';

    if (layoutMode === 'centered-3x3' && maxSlots === 9) {
        // Reorder for 5x3 centered layout (Horizontal pairs):
        // Grid:
        // [0] [1] [ ] [2] [3]  (TL1, TL2, Spacer, TR1, TR2)
        // [ ] [ ] [8] [ ] [ ]  (Spacer, Spacer, Center, Spacer, Spacer)
        // [4] [5] [ ] [6] [7]  (BL1, BL2, Spacer, BR1, BR2)

        const d = new Array(15).fill(null);
        d[0] = logicalSlots[0];
        d[1] = logicalSlots[1];
        d[3] = logicalSlots[2];
        d[4] = logicalSlots[3];

        d[7] = logicalSlots[8]; // Center

        d[10] = logicalSlots[4];
        d[11] = logicalSlots[5];
        d[13] = logicalSlots[6];
        d[14] = logicalSlots[7];

        displaySlots = d;
        gridColsClass = 'grid-cols-5';
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white/80">{title}</div>
                <div className="text-xs text-white/50">
                    {equippedCount}/{maxSlots} equipped
                </div>
            </div>
            <div className={`grid gap-3 ${gridColsClass} sm:${gridColsClass}`}>
                {displaySlots.map((item, index) => {
                    if (!item) {
                        return <div key={`spacer-${index}`} className="min-h-[100px]" />;
                    }
                    const { slot, logicalIndex } = item;
                    return slot && slot.wedge ? (
                        <div
                            key={`slot-${logicalIndex}`}
                            className={`relative cursor-pointer rounded-xl border bg-black/30 p-2 transition hover:border-white/40 ${rarityStyles[slot.wedge.rarity] || 'border-white/20'
                                } ${slot.enabled === false ? 'opacity-50' : ''}`}
                            onClick={() => onSlotClick(logicalIndex)}
                        >
                            <button
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onRemoveSlot(logicalIndex);
                                }}
                                className="absolute -right-2 -top-2 rounded-full bg-red-500/90 p-1 text-white shadow-lg hover:bg-red-400"
                                aria-label="Remove demon wedge"
                            >
                                <X className="h-3 w-3" />
                            </button>
                            <div className="flex flex-col items-center gap-2">
                                <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-white/20 bg-black/40">
                                    {slot.wedge.image ? (
                                        <Image
                                            src={slot.wedge.image}
                                            alt={slot.wedge.fullName}
                                            fill
                                            sizes="56px"
                                            className="object-contain"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-lg font-bold text-white/70">
                                            {slot.wedge.name[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="text-center text-[11px] font-semibold leading-tight text-white">
                                    {slot.wedge.name}
                                </div>
                            </div>
                            <div className="mt-3 space-y-2 text-[11px] text-white/70">
                                {onLevelChange && slot.wedge.rarity >= 4 && (
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-[10px] uppercase tracking-wide text-white/40">
                                            <span>Amplification</span>
                                            <span className="font-mono text-white">
                                                +{(slot.level ?? 0) + 5}
                                            </span>
                                        </div>
                                        <input
                                            type="range"
                                            min={0}
                                            max={5}
                                            value={slot.level ?? 0}
                                            onPointerDown={stopSlotPropagation}
                                            onClick={stopSlotPropagation}
                                            onChange={(event) => {
                                                event.stopPropagation();
                                                onLevelChange(logicalIndex, Number(event.target.value));
                                            }}
                                            className="w-full accent-white"
                                        />
                                    </div>
                                )}
                                {onToggleEnabled && (
                                    <button
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            onToggleEnabled(logicalIndex);
                                        }}
                                        className={`flex w-full items-center justify-center gap-1 rounded-md border px-2 py-1 text-[10px] font-semibold transition ${slot.enabled === false
                                            ? 'border-yellow-500/40 bg-yellow-500/10 text-yellow-200'
                                            : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                                            }`}
                                        aria-label={
                                            slot.enabled === false ? 'Enable wedge' : 'Disable wedge'
                                        }
                                    >
                                        <Power className="h-3 w-3" />
                                        {slot.enabled === false ? 'Disabled' : 'Enabled'}
                                    </button>
                                )}
                                <div className="text-[10px] text-white/40">
                                    {centerSlotIndex === logicalIndex
                                        ? 'Center'
                                        : `Slot ${logicalIndex + 1}`}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <button
                            key={`slot-${logicalIndex}`}
                            onClick={() => onSlotClick(logicalIndex)}
                            className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-white/15 bg-white/5 p-4 text-white/40 transition hover:border-white/40 hover:text-white"
                        >
                            <div className="rounded-full bg-white/5 p-2">
                                <Plus className="h-4 w-4" />
                            </div>
                            <div className="text-[11px] font-semibold uppercase tracking-wide">
                                {centerSlotIndex === logicalIndex ? 'Add Center' : 'Add wedge'}
                            </div>
                            <div className="text-[10px] text-white/30">
                                {centerSlotIndex === logicalIndex
                                    ? 'Center'
                                    : `Slot ${logicalIndex + 1}`}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

