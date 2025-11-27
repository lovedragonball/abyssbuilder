import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { allDemonWedges, filterDemonWedges, getAllTypes, getAllElements, getAllTags, DemonWedge, DemonWedgeType, DemonWedgeRarity, DemonWedgeElement, DemonWedgeCategory } from '@/lib/demon-wedges-data';
import { DemonWedgeCard } from '../DemonWedgeCard';
import { MultiSelectFilter } from '../MultiSelectFilter';

interface WedgeSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (wedge: DemonWedge) => void;
    customFilter?: (wedge: DemonWedge) => boolean;
    allowedCategories?: DemonWedgeCategory[];
}

export function WedgeSelectionModal({ isOpen, onClose, onSelect, customFilter, allowedCategories }: WedgeSelectionModalProps) {
    const [search, setSearch] = useState('');
    const [selectedTypes, setSelectedTypes] = useState<DemonWedgeType[]>([]);
    const [selectedRarities, setSelectedRarities] = useState<DemonWedgeRarity[]>([]);
    const [selectedElements, setSelectedElements] = useState<DemonWedgeElement[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    const availableTypes = useMemo(() => getAllTypes(allDemonWedges), []);
    const availableTags = useMemo(() => getAllTags(allDemonWedges), []);
    const availableElements = useMemo(() => getAllElements(allDemonWedges), []);

    const filteredWedges = useMemo(() => {
        let results = filterDemonWedges(allDemonWedges, {
            search,
            types: selectedTypes.length > 0 ? selectedTypes : undefined,
            rarities: selectedRarities.length > 0 ? selectedRarities : undefined,
            elements: selectedElements.length > 0 ? selectedElements : undefined,
            tags: selectedTags.length > 0 ? selectedTags : undefined,
            categories: allowedCategories && allowedCategories.length > 0 ? allowedCategories : undefined,
        });

        if (customFilter) {
            results = results.filter(customFilter);
        }

        return results;
    }, [search, selectedTypes, selectedRarities, selectedElements, selectedTags, customFilter]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#0c0c0f] border border-white/10 rounded-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <h2 className="text-xl font-bold text-white font-headline">Select Demon Wedge</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition text-white/60 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Filters */}
                <div className="p-4 border-b border-white/10 space-y-4 bg-black/20">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                        <input
                            type="text"
                            placeholder="Search by name, description..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
                        />
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <MultiSelectFilter
                            label="Type"
                            options={availableTypes}
                            selected={selectedTypes}
                            onChange={setSelectedTypes as (selected: string[]) => void}
                        />
                        <MultiSelectFilter
                            label="Rarity"
                            options={['2', '3', '4', '5']}
                            selected={selectedRarities.map(String)}
                            onChange={(s) => setSelectedRarities(s.map(Number) as DemonWedgeRarity[])}
                        />
                        <MultiSelectFilter
                            label="Element"
                            options={availableElements}
                            selected={selectedElements}
                            onChange={setSelectedElements as (selected: string[]) => void}
                        />
                        <MultiSelectFilter
                            label="Tag"
                            options={availableTags}
                            selected={selectedTags}
                            onChange={setSelectedTags}
                        />
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredWedges.map(wedge => (
                            <DemonWedgeCard
                                key={wedge.id}
                                wedge={wedge}
                                onClick={() => onSelect(wedge)}
                            />
                        ))}
                        {filteredWedges.length === 0 && (
                            <div className="col-span-full text-center py-12 text-white/40">
                                No demon wedges found.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
