import { useState } from 'react';
import { CalculationResult } from '@/lib/damage-calculator';
import { DemonWedge } from '@/lib/demon-wedges-data';
import { Character } from '@/lib/types';
import { FinalStats } from '@/lib/character-stats';
import { TrendingUp, Plus, X, Eye, EyeOff, ArrowRight, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

interface DamageVisualizationProps {
    resultA: CalculationResult;
    resultB: CalculationResult;
    presetA: { wedge: DemonWedge; level: number; enabled: boolean }[];
    presetB: { wedge: DemonWedge; level: number; enabled: boolean }[];
    consonanceA?: { wedge: DemonWedge; level: number; enabled: boolean }[];
    consonanceB?: { wedge: DemonWedge; level: number; enabled: boolean }[];
    selectedCharacterA?: Character | null;
    selectedCharacterB?: Character | null;
    characterLevelA?: number;
    characterLevelB?: number;
    finalStatsA?: FinalStats;
    finalStatsB?: FinalStats;
    onOpenWedgeModal: (preset: 'A' | 'B', slot: number, isConsonance?: boolean) => void;
    onRemoveWedge: (preset: 'A' | 'B', index: number, isConsonance?: boolean) => void;
    onUpdateLevel: (preset: 'A' | 'B', index: number, level: number, isConsonance?: boolean) => void;
    onToggleEnabled: (preset: 'A' | 'B', index: number, isConsonance?: boolean) => void;
    onCopyPreset: (from: 'A' | 'B', to: 'A' | 'B') => void;
    onLevelChangeA?: (level: number) => void;
    onLevelChangeB?: (level: number) => void;
}

interface StatRowProps {
    category?: string;
    label: string;
    valueA: number;
    valueB: number;
    format?: 'number' | 'percentage' | 'multiplier';
}

export function DamageVisualization({
    resultA,
    resultB,
    presetA,
    presetB,
    consonanceA = [],
    consonanceB = [],
    selectedCharacterA,
    selectedCharacterB,
    characterLevelA = 1,
    characterLevelB = 1,
    finalStatsA,
    finalStatsB,
    onOpenWedgeModal,
    onRemoveWedge,
    onUpdateLevel,
    onToggleEnabled,
    onCopyPreset,
    onLevelChangeA,
    onLevelChangeB
}: DamageVisualizationProps) {
    const avgDamageDiff = ((resultB.finalDmg.average - resultA.finalDmg.average) / resultA.finalDmg.average * 100);
    const winner = avgDamageDiff > 0 ? 'B' : avgDamageDiff < 0 ? 'A' : 'tie';

    // Use provided finalStats or fallback to default/placeholder
    const statsA = finalStatsA || {
        ATK: 0, HP: 0, Shield: 0, DEF: 0, MaxSanity: 0,
        SkillDMG: 0, SkillRange: 0, SkillDuration: 0, SkillEfficiency: 0,
        Morale: 0, Resolve: 0
    };

    const statsB = finalStatsB || {
        ATK: 0, HP: 0, Shield: 0, DEF: 0, MaxSanity: 0,
        SkillDMG: 0, SkillRange: 0, SkillDuration: 0, SkillEfficiency: 0,
        Morale: 0, Resolve: 0
    };

    const statRows: StatRowProps[] = [
        { category: 'BASE STATS', label: 'ATK', valueA: statsA.ATK, valueB: statsB.ATK, format: 'number' },
        { label: 'HP', valueA: statsA.HP, valueB: statsB.HP, format: 'number' },
        { label: 'Shield', valueA: statsA.Shield, valueB: statsB.Shield, format: 'number' },
        { label: 'DEF', valueA: statsA.DEF, valueB: statsB.DEF, format: 'number' },
        { label: 'Max Sanity', valueA: statsA.MaxSanity, valueB: statsB.MaxSanity, format: 'number' },
        { label: 'Skill DMG', valueA: statsA.SkillDMG, valueB: statsB.SkillDMG, format: 'percentage' },
        { label: 'Skill Range', valueA: statsA.SkillRange, valueB: statsB.SkillRange, format: 'percentage' },
        { label: 'Skill Duration', valueA: statsA.SkillDuration, valueB: statsB.SkillDuration, format: 'percentage' },
        { label: 'Skill Efficiency', valueA: statsA.SkillEfficiency, valueB: statsB.SkillEfficiency, format: 'percentage' },
        { label: 'Morale', valueA: statsA.Morale, valueB: statsB.Morale, format: 'percentage' },
        { label: 'Resolve', valueA: statsA.Resolve, valueB: statsB.Resolve, format: 'percentage' },
    ];

    const [viewingStatsWedge, setViewingStatsWedge] = useState<DemonWedge | null>(null);

    return (
        <div className="bg-[#0c0c0f] border border-white/10 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-6 text-center">Compare Stats</h2>

            {/* Copy Controls */}
            <div className="flex justify-center gap-4 mb-6">
                <button
                    onClick={() => onCopyPreset('A', 'B')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white/60 hover:text-white transition-colors"
                >
                    <span>Copy A</span>
                    <ArrowRight className="w-3 h-3" />
                    <span>B</span>
                </button>
                <button
                    onClick={() => onCopyPreset('B', 'A')}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white/60 hover:text-white transition-colors"
                >
                    <span>A</span>
                    <ArrowLeft className="w-3 h-3" />
                    <span>Copy B</span>
                </button>
            </div>

            {/* 3-Column Layout */}
            <div className="grid grid-cols-[360px,1fr,360px] gap-8">
                {/* Left: Preset A */}
                <PresetPanel
                    preset={presetA}
                    consonanceSlots={consonanceA}
                    selectedCharacter={selectedCharacterA}
                    characterLevel={characterLevelA}
                    result={resultA}
                    title="Preset A"
                    gradient="from-cyan-500 to-blue-500"
                    presetId="A"
                    onOpenWedgeModal={onOpenWedgeModal}
                    onRemoveWedge={onRemoveWedge}
                    onUpdateLevel={onUpdateLevel}
                    onToggleEnabled={onToggleEnabled}
                    onViewStats={setViewingStatsWedge}
                    onLevelChange={onLevelChangeA}
                />

                {/* Center: Stats Comparison */}
                <div className="bg-[#1a1a1f] rounded-xl border border-white/10">
                    {/* Winner Badge */}
                    {winner !== 'tie' && (
                        <div className={`m-4 ${winner === 'A'
                            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 border-cyan-500/30'
                            : 'bg-gradient-to-r from-purple-500/20 to-pink-500/10 border-purple-500/30'
                            } border rounded-xl p-3 flex items-center justify-center gap-2`}>
                            <TrendingUp className={`w-5 h-5 ${winner === 'A' ? 'text-cyan-400' : 'text-purple-400'}`} />
                            <div className="text-center">
                                <div className="text-xs text-white/60">Winner</div>
                                <div className={`text-lg font-bold ${winner === 'A' ? 'text-cyan-400' : 'text-purple-400'}`}>
                                    Preset {winner} (+{Math.abs(avgDamageDiff).toFixed(1)}%)
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="divide-y divide-white/5">
                        {statRows.map((row, index) => (
                            <div key={index}>
                                {row.category && (
                                    <div className="px-4 py-2 bg-white/5">
                                        <div className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                                            {row.category}
                                        </div>
                                    </div>
                                )}
                                <StatRow {...row} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Preset B */}
                <PresetPanel
                    preset={presetB}
                    consonanceSlots={consonanceB}
                    selectedCharacter={selectedCharacterB}
                    characterLevel={characterLevelB}
                    result={resultB}
                    title="Preset B"
                    gradient="from-purple-500 to-pink-500"
                    presetId="B"
                    onOpenWedgeModal={onOpenWedgeModal}
                    onRemoveWedge={onRemoveWedge}
                    onUpdateLevel={onUpdateLevel}
                    onToggleEnabled={onToggleEnabled}
                    onViewStats={setViewingStatsWedge}
                    onLevelChange={onLevelChangeB}
                />
            </div>

            {/* Stats Modal */}
            {viewingStatsWedge && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setViewingStatsWedge(null)}>
                    <div className="bg-[#1a1a1f] border border-white/20 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setViewingStatsWedge(null)}
                            className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className={`w-24 h-24 rounded-xl border-2 flex items-center justify-center bg-black/40 ${viewingStatsWedge.rarity === 5 ? 'border-amber-500/50' :
                                viewingStatsWedge.rarity === 4 ? 'border-purple-500/50' :
                                    'border-blue-500/50'
                                }`}>
                                {viewingStatsWedge.image ? (
                                    <Image
                                        src={viewingStatsWedge.image}
                                        alt={viewingStatsWedge.name}
                                        width={80}
                                        height={80}
                                        className="object-contain"
                                    />
                                ) : (
                                    <span className="text-4xl font-bold text-white">{viewingStatsWedge.name[0]}</span>
                                )}
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-white">{viewingStatsWedge.name}</h3>
                                <div className="flex justify-center gap-1 mt-1">
                                    {Array.from({ length: viewingStatsWedge.rarity }).map((_, i) => (
                                        <span key={i} className="text-amber-400 text-xs">★</span>
                                    ))}
                                </div>
                            </div>

                            <div className="w-full bg-white/5 rounded-xl p-4 space-y-2">
                                {viewingStatsWedge.stats.map((stat, i) => (
                                    <div key={i} className="flex justify-between items-center border-b border-white/5 last:border-0 pb-2 last:pb-0">
                                        <span className="text-white/60 text-sm">{stat.name}</span>
                                        <span className="text-green-400 font-mono font-bold">{stat.value}</span>
                                    </div>
                                ))}
                            </div>

                            {viewingStatsWedge.description && (
                                <p className="text-xs text-white/40 italic">
                                    {viewingStatsWedge.description}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function PresetPanel({
    preset,
    consonanceSlots = [],
    selectedCharacter,
    characterLevel = 1,
    result,
    title,
    gradient,
    presetId,
    onOpenWedgeModal,
    onRemoveWedge,
    onUpdateLevel,
    onToggleEnabled,
    onViewStats,
    onLevelChange
}: {
    preset: { wedge: DemonWedge; level: number; enabled: boolean }[];
    consonanceSlots?: { wedge: DemonWedge; level: number; enabled: boolean }[];
    selectedCharacter?: Character | null;
    characterLevel?: number;
    result: CalculationResult;
    title: string;
    gradient: string;
    presetId: 'A' | 'B';
    onOpenWedgeModal: (preset: 'A' | 'B', slot: number, isConsonance?: boolean) => void;
    onRemoveWedge: (preset: 'A' | 'B', index: number, isConsonance?: boolean) => void;
    onUpdateLevel: (preset: 'A' | 'B', index: number, level: number, isConsonance?: boolean) => void;
    onToggleEnabled: (preset: 'A' | 'B', index: number, isConsonance?: boolean) => void;
    onViewStats: (wedge: DemonWedge) => void;
    onLevelChange?: (level: number) => void;
}) {
    const maxLevel = (rarity: number) => rarity === 5 ? 5 : 0;

    // Check if character requires consonance weapons
    const requiresConsonance = selectedCharacter && ['Lynn', 'Lisbell', 'Psyche', 'Berenica'].includes(selectedCharacter.name);

    const renderSlot = (slotIndex: number, isCenter: boolean = false) => {
        const item = preset[slotIndex];

        if (!item) {
            return (
                <button
                    key={slotIndex}
                    onClick={() => onOpenWedgeModal(presetId, slotIndex)}
                    className={`relative rounded-lg border-2 border-dashed border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10 transition-all flex flex-col items-center justify-center group ${isCenter ? 'aspect-square w-full border-amber-500/20 hover:border-amber-500/40' : 'aspect-square'
                        }`}
                >
                    <Plus className={`text-white/20 group-hover:text-white/40 ${isCenter ? 'w-6 h-6' : 'w-4 h-4'}`} />
                    {isCenter && <span className="text-[10px] text-amber-500/40 mt-1 font-medium">Center</span>}
                </button>
            );
        }

        return (
            <div
                key={slotIndex}
                onClick={() => onViewStats(item.wedge)}
                className="flex flex-col items-center group cursor-pointer"
            >
                <div
                    className={`relative rounded-lg border-2 overflow-hidden hover:border-white/40 transition-colors ${!item.enabled ? 'opacity-40 grayscale' : ''
                        } ${item.wedge.rarity === 5 ? 'border-amber-500/50 bg-amber-500/10' :
                            item.wedge.rarity === 4 ? 'border-purple-500/50 bg-purple-500/10' :
                                item.wedge.rarity === 3 ? 'border-blue-500/50 bg-blue-500/10' :
                                    'border-white/20 bg-white/5'
                        } ${isCenter ? 'aspect-square w-full shadow-[0_0_15px_rgba(245,158,11,0.15)]' : 'aspect-square w-full'}`}
                >
                    <div className="relative w-full h-full flex items-center justify-center p-2">
                        {item.wedge.image ? (
                            <Image
                                src={item.wedge.image}
                                alt={item.wedge.fullName}
                                fill
                                className="object-contain p-1"
                            />
                        ) : (
                            <span className="text-xl font-bold">{item.wedge.fullName[0]}</span>
                        )}
                    </div>

                    {maxLevel(item.wedge.rarity) > 0 && (
                        <select
                            value={item.level}
                            onChange={(e) => { e.stopPropagation(); onUpdateLevel(presetId, slotIndex, parseInt(e.target.value)); }}
                            className="absolute top-1 right-1 z-20 bg-black/80 backdrop-blur-sm text-white text-[9px] font-semibold px-1.5 py-0.5 rounded border border-purple-500/50 cursor-pointer hover:bg-purple-600/80 hover:border-purple-400 transition-all focus:outline-none focus:ring-1 focus:ring-purple-400"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {Array.from({ length: maxLevel(item.wedge.rarity) + 1 }, (_, i) => (
                                <option key={i} value={i} className="bg-gray-900">
                                    +{i + 5}
                                </option>
                            ))}
                        </select>
                    )}

                    <div className="absolute top-1 left-1 z-20 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggleEnabled(presetId, slotIndex); }}
                            className={`${item.enabled ? 'bg-blue-500' : 'bg-gray-500'} text-white p-1 rounded shadow-lg hover:brightness-110`}
                        >
                            {item.enabled ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onRemoveWedge(presetId, slotIndex); }}
                            className="bg-red-500 text-white p-1 rounded shadow-lg hover:brightness-110"
                        >
                            <X className="w-2.5 h-2.5" />
                        </button>
                    </div>
                </div>

                <div className="w-full mt-1 text-center">
                    <div className="text-[10px] leading-tight text-white/80 font-semibold break-words whitespace-normal">
                        {item.wedge.fullName}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <h3 className={`text-sm font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent text-center`}>
                {title}
            </h3>

            {/* Character Level Slider */}
            {selectedCharacter && onLevelChange && (
                <div className="bg-[#1a1a1f] rounded-xl border border-white/10 p-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-white/60">Character Level</span>
                        <span className="text-sm font-bold text-white font-mono">Lv.{characterLevel}</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="80"
                        value={characterLevel}
                        onChange={(e) => onLevelChange(parseInt(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                </div>
            )}

            <div className="bg-[#1a1a1f] rounded-xl border border-white/10 p-4">
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between gap-4">
                        <div className="grid grid-cols-2 gap-2 w-[120px]">
                            {renderSlot(0)}
                            {renderSlot(1)}
                        </div>
                        <div className="grid grid-cols-2 gap-2 w-[120px]">
                            {renderSlot(2)}
                            {renderSlot(3)}
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <div className="w-[80px]">
                            {renderSlot(8, true)}
                        </div>
                    </div>

                    <div className="flex justify-between gap-4">
                        <div className="grid grid-cols-2 gap-2 w-[120px]">
                            {renderSlot(4)}
                            {renderSlot(5)}
                        </div>
                        <div className="grid grid-cols-2 gap-2 w-[120px]">
                            {renderSlot(6)}
                            {renderSlot(7)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Consonance Weapon Slots - Only show for Lynn, Lisbell, Psyche, Berenica */}
            {requiresConsonance && (
                <div className="bg-[#1a1a1f] rounded-xl border border-purple-500/30 p-4 mt-4">
                    <div className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3 text-center">
                        Consonance Weapons
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {[0, 1, 2, 3].map((slotIndex) => {
                            const item = consonanceSlots[slotIndex];

                            if (!item) {
                                return (
                                    <button
                                        key={slotIndex}
                                        onClick={() => onOpenWedgeModal(presetId, slotIndex, true)}
                                        className="relative rounded-lg border-2 border-dashed border-purple-500/20 bg-purple-500/5 hover:border-purple-500/40 hover:bg-purple-500/10 transition-all flex flex-col items-center justify-center group aspect-square"
                                    >
                                        <Plus className="text-purple-500/40 group-hover:text-purple-500/60 w-4 h-4" />
                                    </button>
                                );
                            }

                            return (
                                <div
                                    key={slotIndex}
                                    onClick={() => onViewStats(item.wedge)}
                                    className="flex flex-col items-center group cursor-pointer"
                                >
                                    <div
                                        className={`relative rounded-lg border-2 overflow-hidden hover:border-white/40 transition-colors ${!item.enabled ? 'opacity-40 grayscale' : ''
                                            } ${item.wedge.rarity === 5 ? 'border-amber-500/50 bg-amber-500/10' :
                                                item.wedge.rarity === 4 ? 'border-purple-500/50 bg-purple-500/10' :
                                                    item.wedge.rarity === 3 ? 'border-blue-500/50 bg-blue-500/10' :
                                                        'border-white/20 bg-white/5'
                                            } aspect-square w-full`}
                                    >
                                        <div className="relative w-full h-full flex items-center justify-center p-2">
                                            {item.wedge.image ? (
                                                <Image
                                                    src={item.wedge.image}
                                                    alt={item.wedge.fullName}
                                                    fill
                                                    className="object-contain p-1"
                                                />
                                            ) : (
                                                <span className="text-xl font-bold">{item.wedge.fullName[0]}</span>
                                            )}
                                        </div>

                                        {maxLevel(item.wedge.rarity) > 0 && (
                                            <select
                                                value={item.level}
                                                onChange={(e) => { e.stopPropagation(); onUpdateLevel(presetId, slotIndex, parseInt(e.target.value), true); }}
                                                className="absolute top-1 right-1 z-20 bg-black/80 backdrop-blur-sm text-white text-[9px] font-semibold px-1.5 py-0.5 rounded border border-purple-500/50 cursor-pointer hover:bg-purple-600/80 hover:border-purple-400 transition-all focus:outline-none focus:ring-1 focus:ring-purple-400"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {Array.from({ length: maxLevel(item.wedge.rarity) + 1 }, (_, i) => (
                                                    <option key={i} value={i} className="bg-gray-900">
                                                        +{i + 5}
                                                    </option>
                                                ))}
                                            </select>
                                        )}

                                        <div className="absolute top-1 left-1 z-20 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onToggleEnabled(presetId, slotIndex, true); }}
                                                className={`${item.enabled ? 'bg-blue-500' : 'bg-gray-500'} text-white p-1 rounded shadow-lg hover:brightness-110`}
                                            >
                                                {item.enabled ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onRemoveWedge(presetId, slotIndex, true); }}
                                                className="bg-red-500 text-white p-1 rounded shadow-lg hover:brightness-110"
                                            >
                                                <X className="w-2.5 h-2.5" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="w-full mt-1 text-center">
                                        <div className="text-[10px] leading-tight text-white/80 font-semibold break-words whitespace-normal">
                                            {item.wedge.fullName}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

        </div>
    );
}

function StatRow({ label, valueA, valueB, format = 'number' }: StatRowProps) {
    const formatValue = (value: number) => {
        if (format === 'percentage') return `${Math.round(value)}%`;
        if (format === 'multiplier') return `x${value.toFixed(2)}`;
        return Math.round(value).toLocaleString();
    };

    return (
        <div className="grid grid-cols-[1fr,auto,1fr] gap-4 px-4 py-2 hover:bg-white/5 transition-colors">
            <div className="text-right">
                <div className="text-sm font-mono font-semibold text-white">
                    {formatValue(valueA)}
                </div>
            </div>

            <div className="flex items-center justify-center min-w-[200px]">
                <div className="text-xs text-white/60 text-center">
                    {label}
                </div>
            </div>

            <div className="text-left">
                <div className="text-sm font-mono font-semibold text-white">
                    {formatValue(valueB)}
                </div>
            </div>
        </div>
    );
}
