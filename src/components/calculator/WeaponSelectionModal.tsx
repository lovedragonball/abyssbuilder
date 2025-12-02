import { useState, useMemo } from 'react';
import { Search, X, Sword, Crosshair } from 'lucide-react';
import { WEAPONS_DATA } from '@/lib/weapons-data';
import { WeaponDefinition } from '@/lib/types';

interface WeaponSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (weapon: WeaponDefinition) => void;
    category: 'Melee' | 'Range';
}

export function WeaponSelectionModal({ isOpen, onClose, onSelect, category }: WeaponSelectionModalProps) {
    const [search, setSearch] = useState('');

    const filteredWeapons = useMemo(() => {
        return WEAPONS_DATA.filter(weapon => {
            const matchesCategory = weapon.category === category;
            const matchesSearch = weapon.name.toLowerCase().includes(search.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [search, category]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#0c0c0f] border border-white/10 rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <h2 className="text-xl font-bold text-white font-headline">Select {category} Weapon</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition text-white/60 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-white/10 bg-black/20">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                        <input
                            type="text"
                            placeholder={`Search ${category} weapon...`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors"
                        />
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {filteredWeapons.map(weapon => (
                            <button
                                key={weapon.id}
                                onClick={() => onSelect(weapon)}
                                className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-white/10 hover:border-white/40 transition-all bg-white/5 hover:bg-white/10 flex flex-col"
                            >
                                {/* Image Area */}
                                <div className="flex-1 relative w-full bg-white/5">
                                    {weapon.image ? (
                                        <img
                                            src={weapon.image}
                                            alt={weapon.name}
                                            className="w-full h-full object-contain p-2 transition-transform group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            {category === 'Melee' ? (
                                                <Sword className="w-12 h-12 text-white/20 group-hover:text-white/40 transition-colors" />
                                            ) : (
                                                <Crosshair className="w-12 h-12 text-white/20 group-hover:text-white/40 transition-colors" />
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="absolute bottom-0 left-0 right-0 p-3 text-left bg-gradient-to-t from-black/90 to-transparent pt-8">
                                    <div className="text-sm font-bold text-white">{weapon.name}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
