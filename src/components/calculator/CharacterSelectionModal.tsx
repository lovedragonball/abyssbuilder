import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { allCharacters } from '@/lib/data';
import { Character, Element } from '@/lib/types';
import Image from 'next/image';
import { ElementIcon } from '@/components/game-specific/element-icon';

interface CharacterSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (character: Character) => void;
}

export function CharacterSelectionModal({ isOpen, onClose, onSelect }: CharacterSelectionModalProps) {
    const [search, setSearch] = useState('');
    const [selectedElement, setSelectedElement] = useState<string | null>(null);

    const filteredCharacters = useMemo(() => {
        return allCharacters.filter(char => {
            const matchesSearch = char.name.toLowerCase().includes(search.toLowerCase()) ||
                char.element.toLowerCase().includes(search.toLowerCase());
            const matchesElement = selectedElement ? char.element === selectedElement : true;
            return matchesSearch && matchesElement;
        });
    }, [search, selectedElement]);

    const elements: Element[] = ['Pyro', 'Hydro', 'Electro', 'Anemo', 'Lumino', 'Umbro'];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#0c0c0f] border border-white/10 rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <h2 className="text-xl font-bold text-white font-headline">Select Character</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition text-white/60 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Search & Filter */}
                <div className="p-4 border-b border-white/10 bg-black/20 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                        <input
                            type="text"
                            placeholder="Search character..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
                        />
                    </div>

                    {/* Element Filter */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedElement(null)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${selectedElement === null
                                    ? 'bg-white text-black border-white'
                                    : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
                                }`}
                        >
                            All
                        </button>
                        {elements.map(el => (
                            <button
                                key={el}
                                onClick={() => setSelectedElement(selectedElement === el ? null : el)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1.5 ${selectedElement === el
                                        ? 'bg-white/10 text-white border-white/30 shadow-[0_0_10px_rgba(255,255,255,0.1)]'
                                        : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <ElementIcon element={el} className="w-3 h-3" />
                                {el}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {filteredCharacters.map(char => (
                            <button
                                key={char.id}
                                onClick={() => onSelect(char)}
                                className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-white/10 hover:border-white/40 transition-all bg-white/5 hover:bg-white/10 flex flex-col"
                            >
                                {/* Image */}
                                <div className="flex-1 relative w-full">
                                    <Image
                                        src={char.image}
                                        alt={char.name}
                                        fill
                                        className="object-cover transition-transform group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                </div>

                                {/* Info */}
                                <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                                    <div className="text-sm font-bold text-white">{char.name}</div>
                                    <div className="text-xs text-white/60 flex items-center gap-1">
                                        <ElementIcon element={char.element as Element} className="w-3 h-3" />
                                        {char.element}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
