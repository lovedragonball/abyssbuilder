import { useState, useMemo } from 'react';
import { Search, X, Check, Layers } from 'lucide-react';
import { allDemonWedges, filterDemonWedges, getAllTypes, getAllElements, getAllTags, DemonWedge, DemonWedgeType, DemonWedgeRarity, DemonWedgeElement, DemonWedgeCategory } from '@/lib/demon-wedges-data';
import { DemonWedgeCard } from '../DemonWedgeCard';
import { MultiSelectFilter } from '../MultiSelectFilter';

interface WedgeSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (wedge: DemonWedge) => void;
    onSelectMultiple?: (wedges: DemonWedge[]) => void;
    customFilter?: (wedge: DemonWedge) => boolean;
    allowedCategories?: DemonWedgeCategory[];
    maxSlots?: number; // Maximum number of wedges that can be selected
    currentSlotIndex?: number; // Current slot being edited
}

export function WedgeSelectionModal({ isOpen, onClose, onSelect, onSelectMultiple, customFilter, allowedCategories, maxSlots = 8, currentSlotIndex = 0 }: WedgeSelectionModalProps) {
    const [search, setSearch] = useState('');
    const [selectedTypes, setSelectedTypes] = useState<DemonWedgeType[]>([]);
    const [selectedRarities, setSelectedRarities] = useState<DemonWedgeRarity[]>([]);
    const [selectedElements, setSelectedElements] = useState<DemonWedgeElement[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedWedges, setSelectedWedges] = useState<DemonWedge[]>([]);
    const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

    // Calculate available slots from current position
    const safeSlotIndex = Math.max(0, currentSlotIndex);
    const availableSlots = Math.max(0, maxSlots - safeSlotIndex);

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
    }, [search, selectedTypes, selectedRarities, selectedElements, selectedTags, customFilter, allowedCategories]);

    const handleWedgeClick = (wedge: DemonWedge) => {
        if (isMultiSelectMode) {
            // Toggle selection
            setSelectedWedges(prev => {
                const isSelected = prev.some(w => w.id === wedge.id);
                if (isSelected) {
                    return prev.filter(w => w.id !== wedge.id);
                } else {
                    // Check if we can add more
                    if (prev.length >= availableSlots) {
                        return prev; // Can't add more
                    }
                    return [...prev, wedge];
                }
            });
        } else {
            // Single select mode - immediate selection
            onSelect(wedge);
        }
    };

    const handleConfirmMultiple = () => {
        if (selectedWedges.length > 0 && onSelectMultiple) {
            onSelectMultiple(selectedWedges);
            setSelectedWedges([]);
            setIsMultiSelectMode(false);
        }
    };

    const handleClose = () => {
        setSelectedWedges([]);
        setIsMultiSelectMode(false);
        onClose();
    };

    const isWedgeSelected = (wedge: DemonWedge) => selectedWedges.some(w => w.id === wedge.id);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#0c0c0f] border border-white/10 rounded-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-white font-headline">Select Demon Wedge</h2>
                        {onSelectMultiple && (
                            <button
                                onClick={() => {
                                    setIsMultiSelectMode(!isMultiSelectMode);
                                    if (isMultiSelectMode) setSelectedWedges([]);
                                }}
                                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
                                    isMultiSelectMode
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/40 scale-105'
                                        : 'bg-gradient-to-r from-amber-500/80 to-orange-500/80 text-white hover:from-amber-500 hover:to-orange-500 hover:shadow-lg hover:shadow-amber-500/30 hover:scale-105 animate-pulse'
                                }`}
                            >
                                <Layers className="w-4 h-4" />
                                {isMultiSelectMode ? 'Multi-Select ON' : 'Multi-Select'}
                            </button>
                        )}
                    </div>
                    <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-full transition text-white/60 hover:text-white">
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
                            <div key={wedge.id} className="relative">
                                {isMultiSelectMode && (
                                    <div 
                                        className={`absolute top-2 left-2 z-10 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${
                                            isWedgeSelected(wedge)
                                                ? 'bg-purple-500 border-purple-500'
                                                : 'bg-black/60 border-white/30 hover:border-white/50'
                                        } ${selectedWedges.length >= availableSlots && !isWedgeSelected(wedge) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleWedgeClick(wedge);
                                        }}
                                    >
                                        {isWedgeSelected(wedge) && <Check className="w-4 h-4 text-white" />}
                                    </div>
                                )}
                                <DemonWedgeCard
                                    wedge={wedge}
                                    onClick={() => handleWedgeClick(wedge)}
                                    className={isMultiSelectMode && isWedgeSelected(wedge) ? 'ring-2 ring-purple-500' : ''}
                                />
                            </div>
                        ))}
                        {filteredWedges.length === 0 && (
                            <div className="col-span-full text-center py-12 text-white/40">
                                No demon wedges found.
                            </div>
                        )}
                    </div>
                </div>

                {/* Multi-select footer */}
                {isMultiSelectMode && (
                    <div className="p-4 border-t border-white/10 bg-white/5 flex items-center justify-between">
                        <div className="text-white/60 text-sm">
                            Selected: <span className="text-white font-bold">{selectedWedges.length}</span> / {availableSlots} slots available
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setSelectedWedges([])}
                                className="px-4 py-2 text-sm bg-white/10 text-white/60 rounded-lg hover:bg-white/20 hover:text-white transition-all"
                            >
                                Clear
                            </button>
                            <button
                                onClick={handleConfirmMultiple}
                                disabled={selectedWedges.length === 0}
                                className="px-6 py-2 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                Confirm ({selectedWedges.length})
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
