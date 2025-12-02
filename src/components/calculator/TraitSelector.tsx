'use client';

import { useState } from 'react';
import { GeniemonTrait, geniemonTraits } from '@/lib/geniemon-traits';
import { GeniemonTraitSlot } from '@/lib/team-preset-types';
import { X, Plus } from 'lucide-react';
import Image from 'next/image';

interface TraitSelectorProps {
    traits: GeniemonTraitSlot[];
    onUpdateTrait: (slotIndex: number, trait: GeniemonTrait | null, rarity?: 'blue' | 'purple' | 'gold') => void;
    maxSlots: number;
}

interface TraitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (trait: GeniemonTrait, rarity: 'blue' | 'purple' | 'gold') => void;
}

function TraitSelectionModal({ isOpen, onClose, onSelect }: TraitModalProps) {
    const [selectedRarity, setSelectedRarity] = useState<'blue' | 'purple' | 'gold'>('gold');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 p-6">
                    <div>
                        <h2 className="text-2xl font-bold">Select Trait</h2>
                        <p className="text-sm text-white/60">Choose a trait and its rarity</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg bg-white/10 p-2 transition hover:bg-white/20"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Rarity Selector */}
                <div className="border-b border-white/10 p-6">
                    <label className="mb-3 block text-sm font-medium text-white/80">Trait Rarity</label>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setSelectedRarity('blue')}
                            className={`flex-1 rounded-lg border-2 px-4 py-3 font-semibold transition ${selectedRarity === 'blue'
                                    ? 'border-blue-400 bg-blue-500/20 text-blue-300'
                                    : 'border-white/20 bg-white/5 text-white/60 hover:bg-white/10'
                                }`}
                        >
                            Blue
                        </button>
                        <button
                            onClick={() => setSelectedRarity('purple')}
                            className={`flex-1 rounded-lg border-2 px-4 py-3 font-semibold transition ${selectedRarity === 'purple'
                                    ? 'border-purple-400 bg-purple-500/20 text-purple-300'
                                    : 'border-white/20 bg-white/5 text-white/60 hover:bg-white/10'
                                }`}
                        >
                            Purple
                        </button>
                        <button
                            onClick={() => setSelectedRarity('gold')}
                            className={`flex-1 rounded-lg border-2 px-4 py-3 font-semibold transition ${selectedRarity === 'gold'
                                    ? 'border-yellow-400 bg-yellow-500/20 text-yellow-300'
                                    : 'border-white/20 bg-white/5 text-white/60 hover:bg-white/10'
                                }`}
                        >
                            Gold
                        </button>
                    </div>
                </div>

                {/* Trait Grid */}
                <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 300px)' }}>
                    <div className="grid gap-3">
                        {geniemonTraits.map((trait, index) => {
                            const effect =
                                selectedRarity === 'blue' ? trait.blueEffect :
                                    selectedRarity === 'purple' ? trait.purpleEffect :
                                        trait.goldEffect;

                            return (
                                <button
                                    key={index}
                                    onClick={() => {
                                        onSelect(trait, selectedRarity);
                                        onClose();
                                    }}
                                    className="group flex items-start gap-4 rounded-xl border border-white/20 bg-white/5 p-4 text-left transition hover:bg-white/10"
                                >
                                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-white/20">
                                        <Image
                                            src={trait.image}
                                            alt={trait.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-white">{trait.name}</div>
                                        <div className="mt-1 text-sm text-white/80">{effect}</div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function TraitSelector({ traits, onUpdateTrait, maxSlots }: TraitSelectorProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSlotIndex, setEditingSlotIndex] = useState<number>(-1);

    const handleOpenModal = (slotIndex: number) => {
        setEditingSlotIndex(slotIndex);
        setIsModalOpen(true);
    };

    const handleSelectTrait = (trait: GeniemonTrait, rarity: 'blue' | 'purple' | 'gold') => {
        // Prevent duplicate traits across slots (traits have no id, so compare by name)
        const exists = traits.some(
            (t) => t.trait?.name === trait.name && t.slotIndex !== editingSlotIndex
        );
        if (exists || editingSlotIndex < 0) {
            setIsModalOpen(false);
            setEditingSlotIndex(-1);
            return;
        }
        onUpdateTrait(editingSlotIndex, trait, rarity);
        setIsModalOpen(false);
        setEditingSlotIndex(-1);
    };

    const handleRemoveTrait = (slotIndex: number) => {
        onUpdateTrait(slotIndex, null);
    };

    const RARITY_COLORS = {
        blue: 'border-blue-400 bg-blue-500/20',
        purple: 'border-purple-400 bg-purple-500/20',
        gold: 'border-yellow-400 bg-yellow-500/20',
    };

    return (
        <>
            <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">
                    Traits (up to {maxSlots})
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {Array.from({ length: maxSlots }).map((_, index) => {
                        const traitSlot = traits.find(t => t.slotIndex === index);
                        const hasTrait = traitSlot?.trait;

                        return (
                            <div key={index}>
                                {hasTrait ? (
                                    <div className={`group relative flex items-center gap-3 rounded-xl border-2 p-3 ${RARITY_COLORS[traitSlot.rarity || 'gold']
                                        }`}>
                                        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-white/20">
                                            <Image
                                                src={traitSlot.trait!.image}
                                                alt={traitSlot.trait!.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="truncate text-sm font-semibold text-white">
                                                {traitSlot.trait!.name}
                                            </div>
                                            <div className="text-xs capitalize text-white/60">
                                                {traitSlot.rarity}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveTrait(index)}
                                            className="opacity-0 transition group-hover:opacity-100 rounded-lg bg-red-500/20 p-1.5 hover:bg-red-500/30"
                                        >
                                            <X className="h-4 w-4 text-red-400" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleOpenModal(index)}
                                        className="flex h-full w-full items-center justify-center rounded-xl border-2 border-dashed border-white/20 bg-white/5 p-3 transition hover:border-white/40 hover:bg-white/10"
                                    >
                                        <div className="text-center">
                                            <Plus className="mx-auto h-6 w-6 text-white/40" />
                                            <div className="mt-1 text-xs text-white/60">Add Trait</div>
                                        </div>
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <TraitSelectionModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingSlotIndex(-1);
                }}
                onSelect={handleSelectTrait}
            />
        </>
    );
}
