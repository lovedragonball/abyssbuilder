'use client';

import { useState, useMemo } from 'react';
import { Geniemon, allGeniemon, GeniemonElement, GeniemonRarity } from '@/lib/geniemon-data';
import { X, Search } from 'lucide-react';
import Image from 'next/image';

interface GeniemonSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (geniemon: Geniemon) => void;
    selectedGeniemon?: Geniemon | null;
}

const ELEMENT_COLORS: Record<GeniemonElement, string> = {
    Lumino: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300',
    Anemo: 'bg-green-500/20 border-green-500/50 text-green-300',
    Hydro: 'bg-blue-500/20 border-blue-500/50 text-blue-300',
    Pyro: 'bg-red-500/20 border-red-500/50 text-red-300',
    Electro: 'bg-purple-500/20 border-purple-500/50 text-purple-300',
    Umbro: 'bg-gray-500/20 border-gray-500/50 text-gray-300',
    Neutral: 'bg-white/20 border-white/50 text-white',
};

const RARITY_COLORS: Record<number, string> = {
    2: 'border-gray-400',
    3: 'border-green-400',
    4: 'border-purple-400',
    5: 'border-orange-400',
};

export function GeniemonSelector({ isOpen, onClose, onSelect, selectedGeniemon }: GeniemonSelectorProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterElement, setFilterElement] = useState<GeniemonElement | 'All'>('All');
    const [filterRarity, setFilterRarity] = useState<GeniemonRarity | 'All'>('All');

    const filteredGeniemon = useMemo(() => {
        return allGeniemon.filter(g => {
            // Only show active geniemon
            if (g.status !== 'Active') return false;

            // Search filter
            if (searchQuery && !g.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }

            // Element filter
            if (filterElement !== 'All' && g.element !== filterElement) {
                return false;
            }

            // Rarity filter
            if (filterRarity !== 'All' && g.rarity !== filterRarity) {
                return false;
            }

            return true;
        });
    }, [searchQuery, filterElement, filterRarity]);

    if (!isOpen) return null;

    const elements: Array<GeniemonElement | 'All'> = ['All', 'Lumino', 'Anemo', 'Hydro', 'Pyro', 'Electro', 'Umbro', 'Neutral'];
    const rarities: Array<GeniemonRarity | 'All'> = ['All', 5, 4, 3, 2];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 p-6">
                    <div>
                        <h2 className="text-2xl font-bold">Select Geniemon</h2>
                        <p className="text-sm text-white/60">Choose your team's companion</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg bg-white/10 p-2 transition hover:bg-white/20"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Filters */}
                <div className="space-y-4 border-b border-white/10 p-6">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
                        <input
                            type="text"
                            placeholder="Search geniemon..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-lg bg-white/5 py-3 pl-10 pr-4 text-white placeholder-white/40 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Element Filter */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-white/80">Element</label>
                        <div className="flex flex-wrap gap-2">
                            {elements.map(element => (
                                <button
                                    key={element}
                                    onClick={() => setFilterElement(element)}
                                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${filterElement === element
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-white/10 text-white/60 hover:bg-white/20'
                                        }`}
                                >
                                    {element}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Rarity Filter */}
                    <div>
                        <label className="mb-2 block text-sm font-medium text-white/80">Rarity</label>
                        <div className="flex flex-wrap gap-2">
                            {rarities.map(rarity => (
                                <button
                                    key={rarity}
                                    onClick={() => setFilterRarity(rarity)}
                                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${filterRarity === rarity
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-white/10 text-white/60 hover:bg-white/20'
                                        }`}
                                >
                                    {rarity === 'All' ? 'All' : `★${rarity}`}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Geniemon Grid */}
                <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 350px)' }}>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                        {filteredGeniemon.map(geniemon => (
                            <button
                                key={geniemon.id}
                                onClick={() => {
                                    onSelect(geniemon);
                                    onClose();
                                }}
                                className={`group relative overflow-hidden rounded-xl border-2 bg-gradient-to-br from-white/5 to-white/10 p-3 transition hover:from-white/10 hover:to-white/20 ${selectedGeniemon?.id === geniemon.id
                                        ? 'border-blue-500 ring-2 ring-blue-500/50'
                                        : RARITY_COLORS[geniemon.rarity] || 'border-white/20'
                                    }`}
                            >
                                {/* Geniemon Image */}
                                <div className="relative aspect-square overflow-hidden rounded-lg">
                                    <Image
                                        src={geniemon.image}
                                        alt={geniemon.name}
                                        fill
                                        className="object-cover transition group-hover:scale-110"
                                    />
                                </div>

                                {/* Info */}
                                <div className="mt-3 text-center">
                                    <div className="font-semibold text-white">{geniemon.name}</div>
                                    <div className="mt-1 flex items-center justify-center gap-2 text-xs">
                                        <span className={`rounded border px-2 py-0.5 ${ELEMENT_COLORS[geniemon.element]}`}>
                                            {geniemon.element}
                                        </span>
                                        <span className="text-white/60">★{geniemon.rarity}</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    {filteredGeniemon.length === 0 && (
                        <div className="py-12 text-center text-white/60">
                            <p>No geniemon found matching your filters</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
