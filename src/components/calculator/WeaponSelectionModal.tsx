import { useState, useMemo } from 'react';
import { Search, X, Sword, Crosshair } from 'lucide-react';
import { WEAPONS_DATA } from '@/lib/weapons-data';
import { WeaponDefinition } from '@/lib/types';
import { WEAPON_PRIMARY_STATS, type WeaponPrimaryStat } from '@/data/weaponPrimaryStats';

interface WeaponSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (weapon: WeaponDefinition) => void;
    category: 'Melee' | 'Range';
}

export function WeaponSelectionModal({ isOpen, onClose, onSelect, category }: WeaponSelectionModalProps) {
    const [search, setSearch] = useState('');
    const [selectedPrimaryStats, setSelectedPrimaryStats] = useState<WeaponPrimaryStat[]>([]);

    const filteredWeapons = useMemo(() => {
        return WEAPONS_DATA.filter(weapon => {
            const matchesCategory = weapon.category === category;
            const matchesSearch = weapon.name.toLowerCase().includes(search.toLowerCase());

            // Filter by primary stat if any are selected
            const weaponPrimaryStat = WEAPON_PRIMARY_STATS[weapon.name];
            const matchesPrimaryStat = selectedPrimaryStats.length === 0 ||
                (weaponPrimaryStat && selectedPrimaryStats.includes(weaponPrimaryStat));

            return matchesCategory && matchesSearch && matchesPrimaryStat;
        });
    }, [search, category, selectedPrimaryStats]);

    const togglePrimaryStat = (stat: WeaponPrimaryStat) => {
        setSelectedPrimaryStats(prev =>
            prev.includes(stat)
                ? prev.filter(s => s !== stat)
                : [...prev, stat]
        );
    };

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

                {/* Search & Filters */}
                <div className="p-4 border-b border-white/10 bg-black/20 space-y-3">
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

                    {/* Primary Stat Filters */}
                    <div className="flex flex-wrap gap-2">
                        <span className="text-xs text-white/60 self-center mr-2">Primary Stat:</span>
                        {(['Slash', 'Smash', 'Spike'] as WeaponPrimaryStat[]).map(stat => (
                            <button
                                key={stat}
                                onClick={() => togglePrimaryStat(stat)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedPrimaryStats.includes(stat)
                                        ? stat === 'Slash'
                                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/30'
                                            : stat === 'Smash'
                                                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30'
                                                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                                        : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                                    }`}
                            >
                                {stat}
                            </button>
                        ))}
                        {selectedPrimaryStats.length > 0 && (
                            <button
                                onClick={() => setSelectedPrimaryStats([])}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {filteredWeapons.map(weapon => {
                            const weaponPrimaryStat = WEAPON_PRIMARY_STATS[weapon.name];
                            return (
                                <button
                                    key={weapon.id}
                                    onClick={() => onSelect(weapon)}
                                    className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-white/10 hover:border-white/40 transition-all bg-white/5 hover:bg-white/10 flex flex-col"
                                >
                                    {/* Primary Stat Badge */}
                                    {weaponPrimaryStat && (
                                        <div className={`absolute top-2 right-2 z-10 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-lg ${weaponPrimaryStat === 'Slash'
                                                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                                                : weaponPrimaryStat === 'Smash'
                                                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                                                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                            }`}>
                                            {weaponPrimaryStat}
                                        </div>
                                    )}

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
                            );
                        })}
                    </div>
                    {filteredWeapons.length === 0 && (
                        <div className="text-center py-12 text-white/40">
                            No weapons found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
