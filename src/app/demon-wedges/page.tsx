'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { MultiSelectFilter } from '@/components/MultiSelectFilter';
import { allDemonWedges, getAllTags, getAllTypes, getAllElements, filterDemonWedges } from '@/lib/demon-wedges-data';
import type { DemonWedgeRarity, DemonWedgeType, DemonWedgeElement, DemonWedgeUsage } from '@/lib/demon-wedges-data';
import { DemonWedgeCard } from '@/components/DemonWedgeCard';

export default function DemonWedgesPage() {
    const [search, setSearch] = useState('');
    const [selectedTypes, setSelectedTypes] = useState<DemonWedgeType[]>([]);
    const [selectedRarities, setSelectedRarities] = useState<DemonWedgeRarity[]>([]);
    const [selectedElements, setSelectedElements] = useState<DemonWedgeElement[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedUsage, setSelectedUsage] = useState<DemonWedgeUsage[]>([]);


    const availableTypes = useMemo(() => getAllTypes(allDemonWedges), []);
    const availableTags = useMemo(() => getAllTags(allDemonWedges), []);
    const availableElements = useMemo(() => getAllElements(allDemonWedges), []);

    const filteredWedges = useMemo(() => {
        return filterDemonWedges(allDemonWedges, {
            search,
            types: selectedTypes.length > 0 ? selectedTypes : undefined,
            rarities: selectedRarities.length > 0 ? selectedRarities : undefined,
            elements: selectedElements.length > 0 ? selectedElements : undefined,
            tags: selectedTags.length > 0 ? selectedTags : undefined,
            usage: selectedUsage.length > 0 ? selectedUsage : undefined
        });
    }, [search, selectedTypes, selectedRarities, selectedElements, selectedTags, selectedUsage]);

    return (
        <div className="container mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-4xl font-headline font-bold">Demon Wedges Info</h1>
                <span className="text-muted-foreground">
                    {filteredWedges.length} / {allDemonWedges.length} items
                </span>
            </div>

            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
                <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search demon wedges..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <MultiSelectFilter
                        label="Filter by Usage"
                        options={['Character', 'Weapon', 'Consonance Weapon']}
                        selected={selectedUsage}
                        onChange={(s) => setSelectedUsage(s as DemonWedgeUsage[])}
                    />
                    <MultiSelectFilter
                        label="Filter by Type"
                        options={availableTypes}
                        selected={selectedTypes}
                        onChange={setSelectedTypes as (selected: string[]) => void}
                        showFallbackIcon={true}
                        getIconUrl={(type) => {
                            const polarityMap: Record<string, number> = {
                                'Circle': 1,
                                'Diamond': 2,
                                'Moon': 3,
                                'Rhombus': 4
                            };
                            const num = polarityMap[type];
                            return num ? `https://dna.interknot-network.com/images/polarities/${num}.webp` : null;
                        }}
                    />
                    <MultiSelectFilter
                        label="Filter by Rarity"
                        options={['2', '3', '4', '5']}
                        selected={selectedRarities.map(String)}
                        onChange={(s) => setSelectedRarities(s.map(Number) as DemonWedgeRarity[])}
                    />
                    {/* Element Filter with Icons */}
                    <div className="flex items-center space-x-2">
                        {availableElements.map((el) => (
                            <button
                                key={el}
                                onClick={() => {
                                    if (selectedElements.includes(el)) {
                                        setSelectedElements(selectedElements.filter(e => e !== el));
                                    } else {
                                        setSelectedElements([...selectedElements, el]);
                                    }
                                }}
                                className={`p-2 rounded-lg transition ${selectedElements.includes(el) ? 'bg-primary/20 ring-2 ring-primary' : 'bg-muted/50 hover:bg-muted'}`}
                            >
                                <img
                                    src={`https://dna.interknot-network.com/images/elements/${el.toLowerCase()}.webp`}
                                    alt={el}
                                    className="w-8 h-8 object-contain"
                                />
                            </button>
                        ))}
                    </div>
                    <MultiSelectFilter
                        label="Filter by Tag"
                        options={availableTags}
                        selected={selectedTags}
                        onChange={setSelectedTags}
                    />
                </div>
            </div>

            {/* Wedges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {filteredWedges.map(wedge => (
                    <DemonWedgeCard
                        key={wedge.id}
                        wedge={wedge}
                    />
                ))}
            </div>

            {filteredWedges.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    No demon wedges found matching your filters.
                </div>
            )}
        </div>
    );
}
