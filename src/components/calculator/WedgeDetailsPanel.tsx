'use client';

import { useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { DemonWedge } from '@/lib/demon-wedges-data';
import { LevelStepper } from './LevelStepper';
import { getConditionalEffects } from '@/lib/demon-wedge-conditions';
import { DAMAGE_BUCKETS } from '@/lib/damage-buckets';

interface WedgeDetailsPanelProps {
    wedge: DemonWedge | null;
    level: number;
    enabled: boolean;
    conditions?: Record<string, boolean | number>;
    isOpen: boolean;
    onClose: () => void;
    onUpdateLevel: (level: number) => void;
    onToggleEnabled: () => void;
    onUpdateConditions?: (conditionId: string, enabled: boolean, selectedValue?: number) => void;
}

const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

export function WedgeDetailsPanel({
    wedge,
    level,
    enabled,
    conditions,
    isOpen,
    onClose,
    onUpdateLevel,
    onToggleEnabled,
    onUpdateConditions
}: WedgeDetailsPanelProps) {
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen || !wedge) return null;

    const effects = getConditionalEffects(wedge);
    const maxLevel = wedge.rarity === 5 ? 5 : 0;
    const currentLevelData = wedge.levels?.find(l => l.level === level) || wedge.levels?.[0];
    const displayedStats = currentLevelData?.stats || wedge.stats;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0c0c0f] border-l border-white/20 z-50 overflow-y-auto shadow-2xl animate-slide-in-right">
                <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 rounded-xl border-2 flex items-center justify-center bg-black/40 ${wedge.rarity === 5 ? 'border-amber-500/50' :
                                    wedge.rarity === 4 ? 'border-purple-500/50' :
                                        wedge.rarity === 3 ? 'border-blue-500/50' :
                                            'border-white/20'
                                }`}>
                                {wedge.image ? (
                                    <Image
                                        src={wedge.image}
                                        alt={wedge.fullName}
                                        width={64}
                                        height={64}
                                        className="object-contain"
                                        unoptimized
                                    />
                                ) : (
                                    <span className="text-2xl font-bold text-white">{wedge.fullName[0]}</span>
                                )}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white">{wedge.fullName}</div>
                                <div className="flex gap-0.5 mt-1">
                                    {Array.from({ length: wedge.rarity }).map((_, i) => (
                                        <span key={i} className="text-amber-400 text-xs">★</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/40 hover:text-white transition-colors"
                            aria-label="Close panel"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Enable/Disable Toggle */}
                    <div className="bg-[#1a1a1f] rounded-xl border border-white/10 p-4">
                        <button
                            onClick={onToggleEnabled}
                            className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${enabled
                                    ? 'bg-blue-500/20 border-2 border-blue-500/50 hover:bg-blue-500/30'
                                    : 'bg-gray-500/20 border-2 border-gray-500/50 hover:bg-gray-500/30'
                                }`}
                        >
                            <span className="text-sm font-semibold text-white">
                                {enabled ? 'Enabled' : 'Disabled'}
                            </span>
                            {enabled ? (
                                <Eye className="w-5 h-5 text-blue-400" />
                            ) : (
                                <EyeOff className="w-5 h-5 text-gray-400" />
                            )}
                        </button>
                    </div>

                    {/* Level Control */}
                    {maxLevel > 0 && (
                        <div className="bg-[#1a1a1f] rounded-xl border border-white/10 p-4">
                            <div className="space-y-3">
                                <div className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                                    Amplification Level
                                </div>
                                <div className="flex items-center justify-between">
                                    <LevelStepper
                                        value={level + 5}
                                        min={5}
                                        max={5 + maxLevel}
                                        onChange={(newValue) => onUpdateLevel(newValue - 5)}
                                    />
                                    <span className="text-2xl font-bold text-purple-400">+{level + 5}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stats */}
                    {displayedStats.length > 0 && (
                        <div className="bg-[#1a1a1f] rounded-xl border border-white/10 p-4">
                            <div className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">
                                Stats
                            </div>
                            <div className="space-y-2">
                                {displayedStats.map((stat, i) => (
                                    <div key={i} className="flex justify-between items-center bg-white/5 rounded-lg p-2">
                                        <span className="text-sm text-white/70">{stat.name}</span>
                                        <span className="text-sm font-bold text-green-400 font-mono">{stat.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    {wedge.description && (
                        <div className="bg-[#1a1a1f] rounded-xl border border-white/10 p-4">
                            <div className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                                Description
                            </div>
                            <p className="text-sm text-white/70 leading-relaxed">
                                {currentLevelData?.description || wedge.description}
                            </p>
                        </div>
                    )}

                    {/* Conditional Effects */}
                    {effects.length > 0 && onUpdateConditions && (
                        <div className="bg-[#1a1a1f] rounded-xl border border-white/10 p-4">
                            <div className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">
                                Conditional Effects
                            </div>
                            <div className="space-y-2">
                                {effects.map((effect) => {
                                    const isActive = Boolean(conditions?.[effect.id]);
                                    const bucketLabel = DAMAGE_BUCKETS[effect.bucketId]?.label || effect.bucketId;
                                    const hasLevelOptions = effect.levelOptions && effect.levelOptions.length > 1;

                                    const currentValue = conditions?.[`${effect.id}_value`] as unknown as number | undefined;
                                    const displayValue = currentValue ?? effect.value;

                                    return (
                                        <div
                                            key={effect.id}
                                            className={`bg-white/5 border rounded-lg p-3 transition-all ${isActive ? 'border-purple-400/50' : 'border-white/10'
                                                }`}
                                        >
                                            <label className="flex items-start gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={isActive}
                                                    onChange={(e) => {
                                                        onUpdateConditions(effect.id, e.target.checked, displayValue);
                                                    }}
                                                    className="mt-0.5 accent-purple-500"
                                                />
                                                <div className="flex-1 space-y-1">
                                                    {hasLevelOptions ? (
                                                        <>
                                                            <div className="text-sm text-white font-medium leading-snug">
                                                                {effect.baseLabel?.replace('X%', `${formatPercent(displayValue)}`)}
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <span className="text-xs text-white/40">Level:</span>
                                                                <select
                                                                    value={displayValue}
                                                                    onChange={(e) => {
                                                                        const newValue = parseFloat(e.target.value);
                                                                        onUpdateConditions(effect.id, isActive, newValue);
                                                                    }}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    className="bg-black/60 border border-white/20 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-purple-400"
                                                                >
                                                                    {effect.levelOptions!.map((opt) => (
                                                                        <option key={opt.level} value={opt.value}>
                                                                            +{opt.level} ({formatPercent(opt.value)})
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="text-sm text-white font-medium leading-snug">
                                                            {effect.label}
                                                        </div>
                                                    )}
                                                    <div className="text-xs text-white/50">
                                                        {bucketLabel} • {formatPercent(displayValue)}
                                                    </div>
                                                </div>
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-4 bg-[#1a1a1f] rounded-xl border border-white/10 p-4">
                        <div>
                            <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Tolerance</div>
                            <div className="text-lg font-bold text-purple-400">
                                {currentLevelData?.tolerance || wedge.tolerance}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Type</div>
                            <div className="text-lg font-bold text-white">{wedge.type}</div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes slide-in-right {
                    from {
                        transform: translateX(100%);
                    }
                    to {
                        transform: translateX(0);
                    }
                }
                .animate-slide-in-right {
                    animation: slide-in-right 0.3s ease-out;
                }
            `}</style>
        </>
    );
}
