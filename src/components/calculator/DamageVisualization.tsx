import { useState } from 'react';
import { CalculationResult } from '@/lib/damage-calculator';
import { DemonWedge } from '@/lib/demon-wedges-data';
import { Character } from '@/lib/types';
import { FinalStats } from '@/lib/character-stats';
import { TrendingUp, Plus, X, Eye, EyeOff, ArrowRight, ArrowLeft, SlidersHorizontal } from 'lucide-react';
import Image from 'next/image';
import { getConditionalEffects } from '@/lib/demon-wedge-conditions';
import { DAMAGE_BUCKETS } from '@/lib/damage-buckets';

type PresetSlot = {
    wedge: DemonWedge;
    level: number;
    enabled: boolean;
    conditions?: Record<string, number | boolean>;
};
type MaybePresetSlot = PresetSlot | undefined;

const getAmplificationLevels = (wedge: DemonWedge) => {
    if (wedge.levels?.length) {
        return [...wedge.levels]
            .map(level => level.level)
            .sort((a, b) => a - b);
    }
    return wedge.rarity === 5 ? [0, 1, 2, 3, 4, 5] : [0];
};

const formatAmplificationLabel = (level: number) => `+${level + 5}`;

interface DamageVisualizationProps {
    resultA: CalculationResult;
    resultB: CalculationResult;
    presetA: MaybePresetSlot[];
    presetB: MaybePresetSlot[];
    consonanceA?: MaybePresetSlot[];
    consonanceB?: MaybePresetSlot[];
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
    onUpdateConditions: (
        preset: 'A' | 'B',
        index: number,
        conditionId: string,
        enabled: boolean,
        isConsonance?: boolean,
        selectedValue?: number
    ) => void;
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
    hasCharacterA?: boolean;
    hasCharacterB?: boolean;
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
    onUpdateConditions,
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

    const [viewingWedge, setViewingWedge] = useState<{ wedge: DemonWedge; level?: number } | null>(null);

    const bucketRows = buildBucketRows(resultA, resultB);
    const [conditionEditor, setConditionEditor] = useState<'A' | 'B' | null>(null);

    const openConditionModal = (preset: 'A' | 'B') => {
        setConditionEditor(preset);
    };

    // Get all wedges with conditions for the active preset
    const activePresetWedges = conditionEditor
        ? [
            ...((conditionEditor === 'A' ? presetA : presetB) || []).map((slot, index) => ({ slot, index, isConsonance: false })),
            ...((conditionEditor === 'A' ? consonanceA : consonanceB) || []).map((slot, index) => ({ slot, index, isConsonance: true }))
        ].filter(item => item.slot && getConditionalEffects(item.slot.wedge).length > 0)
        : [];

    const viewingLevelData = viewingWedge && viewingWedge.level !== undefined
        ? viewingWedge.wedge.levels?.find(level => level.level === viewingWedge.level)
        : undefined;
    const viewingStatsList = viewingLevelData?.stats?.length
        ? viewingLevelData.stats
        : viewingWedge?.wedge.stats;
    const viewingDescription = viewingLevelData?.description || viewingWedge?.wedge.description;
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
                    onViewStats={(wedge, level) => setViewingWedge({ wedge, level })}
                    onOpenConditionModal={() => openConditionModal('A')}
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
                                <StatRow
                                    {...row}
                                    hasCharacterA={!!selectedCharacterA}
                                    hasCharacterB={!!selectedCharacterB}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-white/5 bg-black/20">
                        <div className="px-4 py-2">
                            <div className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                                Damage Buckets
                            </div>
                        </div>
                        <div className="divide-y divide-white/5">
                            {bucketRows.map((row) => (
                                <div key={row.label} className="px-4 py-3 hover:bg-white/5 transition-colors space-y-1">
                                    <div className="flex justify-between text-sm font-mono text-white">
                                        <span>{formatMultiplier(row.valueA)}</span>
                                        <span className="text-xs text-white/50">x{row.label}</span>
                                        <span className="text-right">{formatMultiplier(row.valueB)}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-[11px] text-white/60">
                                        <div>
                                            <div className="text-white/40 uppercase tracking-widest">Preset A</div>
                                            <div>{row.descA}</div>
                                            <div className="text-white/30 mt-0.5 italic">{row.breakdownA}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-white/40 uppercase tracking-widest">Preset B</div>
                                            <div>{row.descB}</div>
                                            <div className="text-white/30 mt-0.5 italic">{row.breakdownB}</div>
                                        </div>
                                    </div>
                                    {row.subRows && (
                                        <div className="grid grid-cols-2 gap-3 text-[10px] text-white/50 border-t border-white/10 pt-2 mt-2">
                                            <div className="space-y-1">
                                                {row.subRows.map(sub => (
                                                    <div key={`${row.label}-a-${sub.label}`} className="flex justify-between">
                                                        <span>{sub.label}</span>
                                                        <span className="font-mono text-white">{formatPercent(sub.valueA)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="space-y-1 text-right">
                                                {row.subRows.map(sub => (
                                                    <div key={`${row.label}-b-${sub.label}`} className="flex justify-between">
                                                        <span>{formatPercent(sub.valueB)}</span>
                                                        <span>{sub.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
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
                    onViewStats={(wedge, level) => setViewingWedge({ wedge, level })}
                    onOpenConditionModal={() => openConditionModal('B')}
                    onLevelChange={onLevelChangeB}
                />
            </div>

            {/* Stats Modal */}
            {viewingWedge && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setViewingWedge(null)}>
                    <div className="bg-[#1a1a1f] border border-white/20 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setViewingWedge(null)}
                            className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className={`w-24 h-24 rounded-xl border-2 flex items-center justify-center bg-black/40 ${viewingWedge.wedge.rarity === 5 ? 'border-amber-500/50' :
                                viewingWedge.wedge.rarity === 4 ? 'border-purple-500/50' :
                                    'border-blue-500/50'
                                }`}>
                                {viewingWedge.wedge.image ? (
                                    <Image
                                        src={viewingWedge.wedge.image}
                                        alt={viewingWedge.wedge.name}
                                        width={80}
                                        height={80}
                                        className="object-contain"
                                    />
                                ) : (
                                    <span className="text-4xl font-bold text-white">{viewingWedge.wedge.name[0]}</span>
                                )}
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-lg font-bold text-white">{viewingWedge.wedge.name}</h3>
                                <div className="flex justify-center items-center gap-2 flex-wrap">
                                    <div className="flex justify-center gap-1">
                                        {Array.from({ length: viewingWedge.wedge.rarity }).map((_, i) => (
                                            <span key={i} className="text-amber-400 text-xs">★</span>
                                        ))}
                                    </div>
                                    {viewingWedge.wedge.rarity === 5 && viewingWedge.level !== undefined && (
                                        <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-100 border border-amber-500/40">
                                            Amplification {formatAmplificationLabel(viewingWedge.level)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="w-full bg-white/5 rounded-xl p-4 space-y-2">
                                {(viewingStatsList || []).map((stat, i) => (
                                    <div key={i} className="flex justify-between items-center border-b border-white/5 last:border-0 pb-2 last:pb-0">
                                        <span className="text-white/60 text-sm">{stat.name}</span>
                                        <span className="text-green-400 font-mono font-bold">{stat.value}</span>
                                    </div>
                                ))}
                            </div>

                            {viewingDescription && (
                                <p className="text-xs text-white/40 italic">
                                    {viewingDescription}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {conditionEditor && activePresetWedges.length > 0 && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    onClick={() => setConditionEditor(null)}
                >
                    <div
                        className="bg-[#1a1a1f] border border-white/20 rounded-2xl p-6 max-w-2xl w-full shadow-2xl relative space-y-4 max-h-[80vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setConditionEditor(null)}
                            className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div>
                            <div className="text-xs uppercase tracking-widest text-white/40 mb-1">Preset {conditionEditor}</div>
                            <h3 className="text-2xl font-bold text-white">Configure Conditions</h3>
                            <p className="text-sm text-white/50 mt-1">
                                Toggle conditional bonuses for all demon wedges in this preset.
                            </p>
                        </div>

                        <div className="space-y-4">
                            {activePresetWedges.map(({ slot, index, isConsonance }) => {
                                if (!slot) return null;
                                const effects = getConditionalEffects(slot.wedge);

                                return (
                                    <div key={`${conditionEditor}-${isConsonance ? 'cons' : 'norm'}-${index}`} className="bg-black/40 border border-white/10 rounded-xl p-4 space-y-3">
                                        {/* Wedge Header */}
                                        <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-black/60 border border-white/20 flex items-center justify-center">
                                                {slot.wedge.image ? (
                                                    <Image
                                                        src={slot.wedge.image}
                                                        alt={slot.wedge.fullName}
                                                        width={48}
                                                        height={48}
                                                        className="object-contain"
                                                    />
                                                ) : (
                                                    <span className="text-xl font-bold text-white">{slot.wedge.fullName[0]}</span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-white">{slot.wedge.fullName}</div>
                                                <div className="text-xs text-white/40">{effects.length} condition{effects.length !== 1 ? 's' : ''} available</div>
                                            </div>
                                        </div>

                                        {/* Conditions */}
                                        <div className="space-y-2">
                                            {effects.map((effect, effectIndex) => {
                                                const isActive = Boolean(slot.conditions?.[effect.id]);
                                                const bucketLabel = DAMAGE_BUCKETS[effect.bucketId]?.label || effect.bucketId;
                                                const hasLevelOptions = effect.levelOptions && effect.levelOptions.length > 1;

                                                // Get current selected value from conditions
                                                const currentValue = slot.conditions?.[`${effect.id}_value`] as unknown as number | undefined;
                                                const displayValue = currentValue ?? effect.value;

                                                return (
                                                    <div
                                                        key={`${effect.id}-${effectIndex}`}
                                                        className={`bg-white/5 border rounded-lg p-3 transition-all ${isActive ? 'border-purple-400/50' : 'border-white/10 hover:border-purple-400/30'}`}
                                                    >
                                                        <label className="flex items-start gap-3 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={isActive}
                                                                onChange={(e) => {
                                                                    onUpdateConditions(
                                                                        conditionEditor,
                                                                        index,
                                                                        effect.id,
                                                                        e.target.checked,
                                                                        isConsonance,
                                                                        displayValue
                                                                    );
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
                                                                                    onUpdateConditions(
                                                                                        conditionEditor,
                                                                                        index,
                                                                                        effect.id,
                                                                                        isActive,
                                                                                        isConsonance,
                                                                                        newValue
                                                                                    );
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
                                );
                            })}
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
    onOpenConditionModal,
    onLevelChange
}: {
    preset: MaybePresetSlot[];
    consonanceSlots?: MaybePresetSlot[];
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
    onViewStats: (wedge: DemonWedge, level?: number) => void;
    onOpenConditionModal: () => void;
    onLevelChange?: (level: number) => void;
}) {
    const getLevelOptionsForWedge = (wedge: DemonWedge) => getAmplificationLevels(wedge);

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

        const amplificationLevels = getLevelOptionsForWedge(item.wedge);
        const selectedAmplification = amplificationLevels.includes(item.level) ? item.level : amplificationLevels[0];

        return (
            <div
                key={slotIndex}
                onClick={() => onViewStats(item.wedge, item.level)}
                className="flex flex-col items-center group cursor-pointer relative"
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

                    {item.wedge.rarity === 5 && (
                        <div className="absolute inset-x-2 bottom-2 z-20" onClick={(e) => e.stopPropagation()}>
                            <label className="flex items-center justify-between gap-2 bg-black/70 border border-amber-500/40 rounded-lg px-2 py-1 shadow-lg cursor-pointer">
                                <span className="text-[10px] uppercase font-semibold text-amber-100 tracking-wide">
                                    Amplification
                                </span>
                                <select
                                    value={selectedAmplification}
                                    onChange={(e) => { e.stopPropagation(); onUpdateLevel(presetId, slotIndex, parseInt(e.target.value)); }}
                                    className="bg-transparent text-amber-100 text-xs font-bold px-2 py-1 rounded-md border border-amber-500/40 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
                                >
                                    {amplificationLevels.map((lvl) => (
                                        <option key={lvl} value={lvl} className="bg-[#0c0c0f] text-white">
                                            {formatAmplificationLabel(lvl)}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="absolute top-1 left-1 z-20 flex gap-1.5">
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggleEnabled(presetId, slotIndex); }}
                            className={`${item.enabled ? 'bg-blue-500' : 'bg-gray-500'} text-white p-1.5 rounded-md shadow-lg hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-white/30`}
                            title={item.enabled ? "Disable" : "Enable"}
                        >
                            {item.enabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        </button>
                    </div>

                    {/* Remove Button - More prominent and easier to hit */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onRemoveWedge(presetId, slotIndex); }}
                        className="absolute top-1 right-1 z-20 bg-red-600/90 hover:bg-red-600 text-white px-2.5 py-1.5 rounded-md shadow-lg transition-all hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/40"
                        title="Remove"
                    >
                        <X className="w-3 h-3" />
                    </button>
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

                            const amplificationLevels = getLevelOptionsForWedge(item.wedge);
                            const selectedAmplification = amplificationLevels.includes(item.level) ? item.level : amplificationLevels[0];

                            return (
                                <div
                                    key={slotIndex}
                                    onClick={() => onViewStats(item.wedge, item.level)}
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

                                        {item.wedge.rarity === 5 && (
                                            <div className="absolute inset-x-2 bottom-2 z-20" onClick={(e) => e.stopPropagation()}>
                                                <label className="flex items-center justify-between gap-2 bg-black/70 border border-amber-500/40 rounded-lg px-2 py-1 shadow-lg cursor-pointer">
                                                    <span className="text-[10px] uppercase font-semibold text-amber-100 tracking-wide">
                                                        Amplification
                                                    </span>
                                                    <select
                                                        value={selectedAmplification}
                                                        onChange={(e) => { e.stopPropagation(); onUpdateLevel(presetId, slotIndex, parseInt(e.target.value), true); }}
                                                        className="bg-transparent text-amber-100 text-xs font-bold px-2 py-1 rounded-md border border-amber-500/40 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
                                                    >
                                                        {amplificationLevels.map((lvl) => (
                                                            <option key={lvl} value={lvl} className="bg-[#0c0c0f] text-white">
                                                                {formatAmplificationLabel(lvl)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </label>
                                            </div>
                                        )}

                                        <div className="absolute top-1 left-1 z-20 flex gap-0.5">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onToggleEnabled(presetId, slotIndex, true); }}
                                                className={`${item.enabled ? 'bg-blue-500' : 'bg-gray-500'} text-white p-1.5 rounded-md shadow-lg hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-white/30`}
                                            >
                                                {item.enabled ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onRemoveWedge(presetId, slotIndex, true); }}
                                                className="bg-red-600/90 hover:bg-red-600 text-white px-2 py-1.5 rounded-md shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/30"
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

            {/* Configure Conditions Button */}
            <button
                onClick={onOpenConditionModal}
                className="w-full mt-4 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 hover:border-purple-400/50 rounded-xl text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 group"
            >
                <SlidersHorizontal className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Configure Conditions
            </button>

        </div>
    );
}

function StatRow({ label, valueA, valueB, format = 'number', hasCharacterA = false, hasCharacterB = false }: StatRowProps) {
    const formatValue = (value: number) => {
        if (format === 'percentage') return `${Math.round(value)}%`;
        if (format === 'multiplier') return `x${value.toFixed(2)}`;
        return Math.round(value).toLocaleString();
    };

    const formatDiff = (value: number) => {
        const sign = value >= 0 ? '+' : '';
        if (format === 'percentage') return `${sign}${Math.round(value)}%`;
        if (format === 'multiplier') return `${sign}${value.toFixed(2)}`;
        return `${sign}${Math.round(value)}`;
    };

    const diff = valueB - valueA;
    const showDiff = hasCharacterA && hasCharacterB; // แสดง diff เฉพาะเมื่อทั้งสองฝั่งมี character

    return (
        <div className="grid grid-cols-[80px,70px,1fr,70px,80px] gap-3 px-6 py-2 hover:bg-white/5 transition-colors">
            {/* Value A - ชิดซ้าย */}
            <div className="text-left">
                <div className="text-sm font-mono font-semibold text-white tabular-nums">
                    {formatValue(valueA)}
                </div>
            </div>

            {/* Diff A - แสดงว่า A เทียบกับ B เท่าไร (A - B) */}
            <div className="text-left">
                {showDiff && (
                    <div className={`text-sm font-mono font-semibold tabular-nums ${diff < 0 ? 'text-green-400' : diff > 0 ? 'text-red-400' : 'text-white/40'}`}>
                        {diff !== 0 ? formatDiff(-diff) : ''}
                    </div>
                )}
            </div>

            {/* Label - ตรงกลาง - ไม่ขยับ */}
            <div className="flex items-center justify-center">
                <div className="text-xs text-white/60 text-center">
                    {label}
                </div>
            </div>

            {/* Diff B - แสดงว่า B เทียบกับ A เท่าไร (B - A) */}
            <div className="text-right">
                {showDiff && (
                    <div className={`text-sm font-mono font-semibold tabular-nums ${diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-white/40'}`}>
                        {diff !== 0 ? formatDiff(diff) : ''}
                    </div>
                )}
            </div>

            {/* Value B - ชิดขวา */}
            <div className="text-right">
                <div className="text-sm font-mono font-semibold text-white tabular-nums">
                    {formatValue(valueB)}
                </div>
            </div>
        </div>
    );
}

function buildBucketRows(resultA: CalculationResult, resultB: CalculationResult) {
    const rows = [
        {
            label: 'ATK Scalar',
            bucketA: resultA.buckets.atk,
            bucketB: resultB.buckets.atk,
            subRows: [
                { label: 'Char ATK%', valueA: resultA.atkPools.char, valueB: resultB.atkPools.char },
                { label: 'Weapon ATK%', valueA: resultA.atkPools.weapon, valueB: resultB.atkPools.weapon },
                { label: 'Elemental ATK%', valueA: resultA.atkPools.elemental, valueB: resultB.atkPools.elemental }
            ]
        },
        {
            label: 'Skill DMG',
            bucketA: resultA.buckets.skillDmg,
            bucketB: resultB.buckets.skillDmg
        },
        {
            label: 'DMG Boost',
            bucketA: resultA.buckets.dmgBoost,
            bucketB: resultB.buckets.dmgBoost
        },
        {
            label: 'Final Damage',
            bucketA: resultA.buckets.final,
            bucketB: resultB.buckets.final
        }
    ].map(row => ({
        label: row.label,
        valueA: row.bucketA.value,
        valueB: row.bucketB.value,
        descA: row.bucketA.description,
        descB: row.bucketB.description,
        breakdownA: summarizeContributions(row.bucketA.breakdown),
        breakdownB: summarizeContributions(row.bucketB.breakdown),
        subRows: row.subRows
    }));

    const critRow = {
        label: 'CRIT',
        valueA: resultA.buckets.crit.value,
        valueB: resultB.buckets.crit.value,
        descA: `Rate ${Math.round(resultA.buckets.crit.critRate * 100)}% | DMG ${Math.round((resultA.buckets.crit.value - 1) * 100)}%`,
        descB: `Rate ${Math.round(resultB.buckets.crit.critRate * 100)}% | DMG ${Math.round((resultB.buckets.crit.value - 1) * 100)}%`,
        breakdownA: `Rate: ${summarizeContributions(resultA.buckets.crit.rateBreakdown)} • DMG: ${summarizeContributions(resultA.buckets.crit.breakdown)}`,
        breakdownB: `Rate: ${summarizeContributions(resultB.buckets.crit.rateBreakdown)} • DMG: ${summarizeContributions(resultB.buckets.crit.breakdown)}`,
        subRows: undefined
    };

    return [...rows, critRow];
}

function formatMultiplier(value: number) {
    return `x${value.toFixed(2)}`;
}

function formatPercent(value: number) {
    const percent = (value * 100).toFixed(1);
    const sign = Number(percent) > 0 ? '+' : '';
    return `${sign}${percent}%`;
}

function summarizeContributions(contributions: { source: string; value: number; note?: string }[]) {
    if (!contributions || contributions.length === 0) return '—';
    return contributions
        .slice(0, 2)
        .map(entry => `${entry.source} (${formatPercent(entry.value)})${entry.note ? ` – ${entry.note}` : ''}`)
        .join(', ');
}
