import { Plus, X, Eye, EyeOff } from 'lucide-react';
import { DemonWedge } from '@/lib/demon-wedges-data';

interface WedgeSelectorProps {
    wedges: { wedge: DemonWedge; level: number; enabled: boolean }[];
    onAddWedge: () => void;
    onRemoveWedge: (index: number) => void;
    onUpdateLevel: (index: number, level: number) => void;
    onToggleEnabled: (index: number) => void;
}

export function WedgeSelector({ wedges, onAddWedge, onRemoveWedge, onUpdateLevel, onToggleEnabled }: WedgeSelectorProps) {
    const rarityColors: { [key: number]: string } = {
        2: 'from-green-500/20 to-green-600/10 border-green-500/30',
        3: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
        4: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
        5: 'from-amber-500/20 to-amber-600/10 border-amber-500/30',
    };

    const maxLevel = (rarity: number) => rarity >= 4 ? 5 : 0;

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
                        </div>

                        {/* Level Selector */}
                        {maxLevel(equipped.wedge.rarity) > 0 && (
                            <select
                                value={equipped.level}
                                onChange={(e) => onUpdateLevel(index, parseInt(e.target.value))}
                                className="bg-black/40 border border-white/20 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-white/40"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {Array.from({ length: maxLevel(equipped.wedge.rarity) + 1 }, (_, i) => (
                                    <option key={i} value={i}>
                                        +{i + 5}
                                    </option>
                                ))}
                            </select>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => onToggleEnabled(index)}
                                className={`${equipped.enabled
                                        ? 'bg-blue-500 hover:bg-blue-600'
                                        : 'bg-gray-500 hover:bg-gray-600'
                                    } text-white p-1.5 rounded shadow-lg transition-colors`}
                                title={equipped.enabled ? 'Disable' : 'Enable'}
                            >
                                {equipped.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            </button>
                            <button
                                onClick={() => onRemoveWedge(index)}
                                className="bg-red-500 text-white p-1.5 rounded shadow-lg hover:bg-red-600 transition-colors"
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
                    className="w-full border-2 border-dashed border-white/20 rounded-lg p-3 hover:border-white/40 hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-white/60 hover:text-white/80"
                >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">Add Demon Wedge</span>
                </button>
            )}
        </div>
    );
}
