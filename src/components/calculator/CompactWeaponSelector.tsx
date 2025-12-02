'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { WEAPONS } from '@/data/weapons';
import { ChevronDown, Search, ChevronUp } from 'lucide-react';

interface Weapon {
    id: number;
    name: string;
    category: string;
    refinement_data: {
        level: number;
        effect: string;
        stats: Record<string, string>;
    }[];
}

interface CompactWeaponSelectorProps {
    category: 'Ranged' | 'Melee' | 'Consonance';
    selectedWeapon: Weapon | null;
    refinement: number;
    onSelectWeapon: (weapon: Weapon | null) => void;
    onRefinementChange: (level: number) => void;
    gradient: string;
    label: string;
}

export function CompactWeaponSelector({
    category,
    selectedWeapon,
    refinement,
    onSelectWeapon,
    onRefinementChange,
    gradient,
    label
}: CompactWeaponSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [isEffectExpanded, setIsEffectExpanded] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Filter weapons by category
    const weapons = useMemo(() => WEAPONS.filter(w => w.category === category), [category]);

    // Filter weapons by search term
    const filteredWeapons = useMemo(() => 
        weapons.filter(w => w.name.toLowerCase().includes(search.toLowerCase())),
        [weapons, search]
    );


    // Get current refinement data
    const currentRefinementData = useMemo(() => 
        selectedWeapon?.refinement_data.find(r => r.level === refinement),
        [selectedWeapon, refinement]
    );

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Check if effect text is long enough to need collapsing
    const effectText = currentRefinementData?.effect || '';
    const isEffectLong = effectText.length > 100;

    return (
        <div className="space-y-1.5 sm:space-y-2">
            {/* Header with label */}
            <h3 className={`text-xs sm:text-sm font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent px-1`}>
                {label}
            </h3>

            <div className="bg-[#1a1a1f] rounded-lg sm:rounded-xl border border-white/10 p-2 sm:p-3 space-y-2 sm:space-y-3">
                {/* Weapon Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-white/10 transition-all text-xs sm:text-sm"
                    >
                        <span className={selectedWeapon ? 'text-white truncate' : 'text-white/40'}>
                            {selectedWeapon ? selectedWeapon.name : 'Select Weapon'}
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/40 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-[#0c0c0f] border border-white/20 rounded-lg shadow-2xl z-50 max-h-[250px] flex flex-col">
                            {/* Search input */}
                            <div className="p-2 border-b border-white/10">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-md pl-8 pr-2 py-1.5 text-xs text-white focus:outline-none focus:border-white/30"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            
                            {/* Weapon list */}
                            <div className="overflow-y-auto flex-1 p-1.5 space-y-0.5">
                                <button
                                    onClick={() => {
                                        onSelectWeapon(null);
                                        setIsOpen(false);
                                        setSearch('');
                                    }}
                                    className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-white/5 text-white/40 text-xs"
                                >
                                    None
                                </button>
                                {filteredWeapons.map(weapon => (
                                    <button
                                        key={weapon.id}
                                        onClick={() => {
                                            onSelectWeapon(weapon);
                                            setIsOpen(false);
                                            setSearch('');
                                        }}
                                        className={`w-full text-left px-2.5 py-1.5 rounded-md hover:bg-white/5 text-xs transition-colors ${
                                            selectedWeapon?.id === weapon.id 
                                                ? 'bg-white/10 text-white' 
                                                : 'text-white/80'
                                        }`}
                                    >
                                        {weapon.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>


                {/* Refinement Slider and Stats - only show when weapon is selected */}
                {selectedWeapon && currentRefinementData && (
                    <div className="space-y-2 sm:space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Compact Refinement Slider */}
                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] sm:text-xs font-medium text-white/50">Refinement</span>
                                <span className="text-[10px] sm:text-xs font-bold text-white font-mono">Lv.{refinement}</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="5"
                                value={refinement}
                                onChange={(e) => onRefinementChange(parseInt(e.target.value))}
                                className="w-full h-1 sm:h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                            />
                            <div className="flex justify-between text-[8px] sm:text-[10px] text-white/20 font-mono px-0.5">
                                <span>0</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                            </div>
                        </div>

                        {/* Inline Stats Display */}
                        <div className="flex flex-wrap gap-1 sm:gap-1.5">
                            {Object.entries(currentRefinementData.stats).map(([key, value]) => (
                                <div 
                                    key={key} 
                                    className="bg-black/30 rounded-md px-1.5 sm:px-2 py-0.5 sm:py-1 border border-white/5 flex items-center gap-1 sm:gap-1.5"
                                >
                                    <span className="text-[8px] sm:text-[10px] text-white/50">{key}</span>
                                    <span className="text-[10px] sm:text-xs font-mono font-semibold text-white">{value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Collapsible Effect Text */}
                        <div className="bg-white/5 rounded-lg p-1.5 sm:p-2 border border-white/5">
                            <button
                                onClick={() => setIsEffectExpanded(!isEffectExpanded)}
                                className="w-full flex items-center justify-between text-left"
                            >
                                <span className="text-[8px] sm:text-[10px] font-bold text-white/40 uppercase tracking-wider">Effect</span>
                                {isEffectLong && (
                                    <ChevronUp className={`w-2.5 h-2.5 sm:w-3 sm:h-3 text-white/40 transition-transform ${isEffectExpanded ? '' : 'rotate-180'}`} />
                                )}
                            </button>
                            <p className={`text-[9px] sm:text-[11px] text-white/70 leading-relaxed mt-1 ${
                                !isEffectExpanded && isEffectLong ? 'line-clamp-2' : ''
                            }`}>
                                {effectText}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
