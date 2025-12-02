import { Plus, X, Eye, EyeOff, ChevronDown } from 'lucide-react';
import { DemonWedge } from '@/lib/demon-wedges-data';
import { useState, useRef, useEffect } from 'react';

interface WedgeSelectorProps {
    wedges: { wedge: DemonWedge; level: number; enabled: boolean }[];
    onAddWedge: () => void;
    onRemoveWedge: (index: number) => void;
    onUpdateLevel: (index: number, level: number) => void;
    onToggleEnabled: (index: number) => void;
}

export function WedgeSelector({ wedges, onAddWedge, onRemoveWedge, onUpdateLevel, onToggleEnabled }: WedgeSelectorProps) {
    const [openLevelSelector, setOpenLevelSelector] = useState<number | null>(null);
    const levelSelectorRef = useRef<HTMLDivElement>(null);

    const rarityColors: { [key: number]: string } = {
        2: 'from-green-500/20 to-green-600/10 border-green-500/30',
        3: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
        4: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
        5: 'from-amber-500/20 to-amber-600/10 border-amber-500/30',
    };

    const maxLevel = (rarity: number) => rarity >= 4 ? 5 : 0;
    const formatAmplification = (level: number) => `+${level + 5}`;

    // Close level selector when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (levelSelectorRef.current && !levelSelectorRef.current.contains(event.target as Node)) {
                setOpenLevelSelector(null);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLevelChange = (index: number, level: number) => {
        onUpdateLevel(index, level);
        setOpenLevelSelector(null);
    };

    const toggleLevelSelector = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setOpenLevelSelector(openLevelSelector === index ? null : index);
    };

    return (
        <div className="space-y-2">
            {wedges.map((equipped, index) => (
                <div
                    key={index}
                    className={`relative group bg-gradient-to-r ${rarityColors[equipped.wedge.rarity] || 'from-white/5 to-white/10 border-white/10'} 
                    border rounded-lg p-3 transition-all ${!equipped.enabled ? 'opacity-40' : 'opacity-100'}`}
                >
                    <div className="flex items-center gap-3">
                        {/* Icon */}
                        <div className="w-10 h-10 rounded-lg bg-black/30 flex items-center justify-center text-xl flex-shrink-0">
                            {equipped.wedge.icon || '⬡'}
                        </div>

                        {/* Name and Stats */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-white text-base whitespace-normal break-words leading-snug">
                                    {equipped.wedge.fullName}
                                </h3>
                                <span className="text-xs text-white/40">
                                    {'★'.repeat(equipped.wedge.rarity)}
                                </span>
                            </div>
                            <p className="text-xs text-white/60 truncate">
                                {equipped.wedge.stats.map(s => `${s.name} ${s.value}`).join(' • ')}
                            </p>
                            
                            {/* Amplification Badge for 5-star */}
                            {equipped.wedge.rarity === 5 && (
                                <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-100 border border-amber-500/30">
                                    <span className="mr-1">Amplification:</span>
                                    <span className="font-bold">{formatAmplification(equipped.level)}</span>
                                </div>
                            )}
                        </div>

                        {/* Level Selector */}
                        {maxLevel(equipped.wedge.rarity) > 0 && (
                            <div className="relative">
                                <button
                                    onClick={(e) => toggleLevelSelector(index, e)}
                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                        equipped.wedge.rarity === 5 
                                            ? 'bg-amber-500/10 border border-amber-500/30 text-amber-100 hover:bg-amber-500/20' 
                                            : 'bg-black/40 border border-white/20 text-white hover:bg-white/10'
                                    }`}
                                >
                                    {equipped.wedge.rarity === 5 ? 'Amplify' : 'Level'} 
                                    <ChevronDown className="w-4 h-4 ml-1" />
                                </button>

                                {openLevelSelector === index && (
                                    <div 
                                        ref={levelSelectorRef}
                                        className="absolute right-0 z-20 mt-1 w-32 py-1 bg-gray-800 border border-white/10 rounded-lg shadow-lg overflow-hidden"
                                    >
                                        <div className="text-xs text-white/70 px-3 py-1.5 border-b border-white/5">
                                            {equipped.wedge.rarity === 5 ? 'Amplification' : 'Level'}
                                        </div>
                                        <div className="max-h-48 overflow-y-auto">
                                            {Array.from({ length: maxLevel(equipped.wedge.rarity) + 1 }, (_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleLevelChange(index, i)}
                                                    className={`w-full text-left px-3 py-1.5 text-sm hover:bg-white/10 transition-colors ${
                                                        equipped.level === i ? 'bg-blue-500/30 text-white' : 'text-white/80'
                                                    }`}
                                                >
                                                    {equipped.wedge.rarity === 5 ? `+${i + 5} Amplification` : `Level ${i + 1}`}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => onToggleEnabled(index)}
                                className={`p-1.5 rounded-full transition-colors ${
                                    equipped.enabled
                                        ? 'bg-blue-500/80 hover:bg-blue-600 text-white'
                                        : 'bg-gray-600/80 hover:bg-gray-500 text-white/80'
                                }`}
                                title={equipped.enabled ? 'Disable' : 'Enable'}
                            >
                                {equipped.enabled ? 
                                    <Eye className="w-3.5 h-3.5" /> : 
                                    <EyeOff className="w-3.5 h-3.5" />
                                }
                            </button>
                            <button
                                onClick={() => onRemoveWedge(index)}
                                className="p-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded-full transition-colors"
                                title="Remove"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {!equipped.enabled && (
                        <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center pointer-events-none">
                            <span className="text-white/80 text-xs font-semibold">Disabled</span>
                        </div>
                    )}
                </div>
            ))}

            {/* Add Button */}
            {wedges.length < 8 && (
                <button
                    onClick={onAddWedge}
                    className="group w-full border-2 border-dashed border-white/20 rounded-lg p-4 hover:border-white/40 hover:bg-white/5 transition-all flex flex-col items-center justify-center gap-2 text-white/60 hover:text-white/80"
                >
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/20 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                        <Plus className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-medium">Add Demon Wedge</span>
                    <span className="text-xs text-white/40">Up to {8 - wedges.length} more</span>
                </button>
            )}
        </div>
    );
}
