'use client';

import { EquippedCalculatorWedge } from '@/lib/damage-calculator';
import { DemonWedge } from '@/lib/demon-wedges-data';
import { Plus, X, SlidersHorizontal } from 'lucide-react';
import Image from 'next/image';
import { TrialRankSelector } from './TrialRankSelector';

type PresetSlot = EquippedCalculatorWedge & { enabled: boolean };
type MaybePresetSlot = PresetSlot | undefined;

interface CompactWedgeGridProps {
    slots: MaybePresetSlot[];
    presetId: 'A' | 'B';
    title: string;
    gradient: string;
    onSlotClick: (slotIndex: number) => void;
    onRemoveWedge: (slotIndex: number) => void;
    onOpenDetails: (wedge: DemonWedge, level: number, enabled: boolean, conditions: Record<string, boolean | number> | undefined, index: number) => void;
    trialRank?: number | null;
    onTrialRankChange?: (rank: number | null) => void;
    onOpenConditionModal: () => void;
}

export function CompactWedgeGrid({
    slots,
    presetId,
    title,
    gradient,
    onSlotClick,
    onRemoveWedge,
    onOpenDetails,
    trialRank,
    onTrialRankChange,
    onOpenConditionModal
}: CompactWedgeGridProps) {
    // Get rarity border color class
    const getRarityBorderClass = (rarity: number): string => {
        switch (rarity) {
            case 5: return 'border-amber-500/50 bg-amber-500/10';
            case 4: return 'border-purple-500/50 bg-purple-500/10';
            case 3: return 'border-blue-500/50 bg-blue-500/10';
            default: return 'border-white/20 bg-white/5';
        }
    };

    // Truncate name for display
    const truncateName = (name: string, maxLength: number = 12): string => {
        if (name.length <= maxLength) return name;
        return name.substring(0, maxLength - 1) + '…';
    };


    // Render empty slot with "+" icon
    const renderEmptySlot = (slotIndex: number) => (
        <button
            key={`empty-${slotIndex}`}
            onClick={() => onSlotClick(slotIndex)}
            className="relative w-[60px] h-[60px] min-w-[50px] max-w-[70px] aspect-square rounded-lg border-2 border-dashed border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10 transition-all flex items-center justify-center group"
            aria-label={`Add wedge to slot ${slotIndex + 1}`}
        >
            <Plus className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
        </button>
    );

    // Render equipped slot with wedge
    const renderEquippedSlot = (slotIndex: number, item: PresetSlot) => (
        <div
            key={`equipped-${slotIndex}`}
            onClick={() => onOpenDetails(item.wedge, item.level, item.enabled, item.conditions, slotIndex)}
            className="flex flex-col items-center group cursor-pointer"
        >
            <div
                className={`relative w-[60px] h-[60px] min-w-[50px] max-w-[70px] aspect-square rounded-lg border-2 overflow-hidden hover:border-white/40 transition-colors ${
                    !item.enabled ? 'opacity-40 grayscale' : ''
                } ${getRarityBorderClass(item.wedge.rarity)}`}
            >
                {/* Wedge Image */}
                <div className="relative w-full h-full flex items-center justify-center p-1">
                    {item.wedge.image ? (
                        <Image
                            src={item.wedge.image}
                            alt={item.wedge.fullName}
                            fill
                            className="object-contain p-0.5"
                            sizes="70px"
                        />
                    ) : (
                        <span className="text-lg font-bold text-white/60">
                            {item.wedge.fullName[0]}
                        </span>
                    )}
                </div>

                {/* Remove button - visible on hover */}
                <div className="absolute top-0.5 right-0.5 z-20 pointer-events-none">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemoveWedge(slotIndex);
                        }}
                        aria-label="Remove wedge"
                        className="w-4 h-4 rounded-full bg-red-500 text-white shadow-md flex items-center justify-center hover:bg-red-600 active:scale-95 transition-all opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-auto"
                    >
                        <X className="w-2 h-2" />
                    </button>
                </div>
            </div>

            {/* Truncated name below icon */}
            <div className="w-[60px] mt-0.5 text-center">
                <div className="text-[8px] leading-tight text-white/70 font-medium truncate" title={item.wedge.fullName}>
                    {truncateName(item.wedge.name)}
                </div>
            </div>
        </div>
    );


    // Render a single slot (empty or equipped)
    const renderSlot = (slotIndex: number) => {
        const item = slots[slotIndex];
        if (!item) {
            return renderEmptySlot(slotIndex);
        }
        return renderEquippedSlot(slotIndex, item);
    };

    return (
        <div className="space-y-3">
            {/* Header with title and Trial Rank selector */}
            <div className="flex items-center justify-between px-1">
                <h3 className={`text-sm font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                    {title}
                </h3>
                {onTrialRankChange && (
                    <TrialRankSelector
                        selectedRankLevel={trialRank ?? null}
                        onChange={onTrialRankChange}
                    />
                )}
            </div>

            {/* 4x2 Grid Layout */}
            <div className="bg-[#1a1a1f] rounded-xl border border-white/10 p-3">
                <div 
                    className="grid gap-2"
                    style={{ 
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        justifyItems: 'center'
                    }}
                >
                    {/* Row 1: Slots 0-3 */}
                    {renderSlot(0)}
                    {renderSlot(1)}
                    {renderSlot(2)}
                    {renderSlot(3)}
                    
                    {/* Row 2: Slots 4-7 */}
                    {renderSlot(4)}
                    {renderSlot(5)}
                    {renderSlot(6)}
                    {renderSlot(7)}
                </div>
            </div>

            {/* Configure Conditions Button */}
            <button
                onClick={onOpenConditionModal}
                className="w-full py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 hover:border-purple-400/50 rounded-lg text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 group"
            >
                <SlidersHorizontal className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                Configure Conditions
            </button>
        </div>
    );
}
