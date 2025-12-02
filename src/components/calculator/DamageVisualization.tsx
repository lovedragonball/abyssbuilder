import type { CalculationResult, EquippedCalculatorWedge } from '@/lib/damage-calculator';
import type { DemonWedge } from '@/lib/demon-wedges-data';
import type { Character, WeaponDefinition } from '@/lib/types';
import type { FinalStats } from '@/lib/character-stats';
import { TrendingUp, Crosshair, Sword } from 'lucide-react';

type PresetSlot = EquippedCalculatorWedge & { enabled: boolean };
type MaybePresetSlot = PresetSlot | undefined;

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
    rangeWeaponLevelA?: number;
    meleeWeaponLevelA?: number;
    rangeWeaponLevelB?: number;
    meleeWeaponLevelB?: number;
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
    onRangeWeaponLevelChangeA?: (level: number) => void;
    onMeleeWeaponLevelChangeA?: (level: number) => void;
    onRangeWeaponLevelChangeB?: (level: number) => void;
    onMeleeWeaponLevelChangeB?: (level: number) => void;
    trialRankA?: number | null;
    trialRankB?: number | null;
    onTrialRankChangeA?: (rank: number | null) => void;
    onTrialRankChangeB?: (rank: number | null) => void;
    onOpenCharacterModal?: (preset: 'A' | 'B') => void;
    onClearCharacter?: (preset: 'A' | 'B') => void;
    selectedRangeWeaponA?: WeaponDefinition | null;
    selectedMeleeWeaponA?: WeaponDefinition | null;
    selectedRangeWeaponB?: WeaponDefinition | null;
    selectedMeleeWeaponB?: WeaponDefinition | null;
    onOpenWeaponModal?: (preset: 'A' | 'B', category: 'Melee' | 'Range') => void;
    onClearWeapon?: (preset: 'A' | 'B', category: 'Melee' | 'Range') => void;
}

// Helper: get weapon stats for given level (1-80) from level_progression,
// falling back to refinement_data[0].stats if progression data is missing.
const getWeaponStatsForLevel = (weapon: WeaponDefinition | null | undefined, level: number) => {
    if (!weapon) return null;

    const progression = weapon.level_progression;
    if (progression && progression.length) {
        const entry = progression.find((p) => p.level === level) || progression[progression.length - 1];
        return entry?.stats || null;
    }

    const baseRefinement = weapon.refinement_data?.[0];
    return baseRefinement?.stats || null;
};

interface StatRowProps {
    category?: string;
    label: string;
    valueA: number;
    valueB: number;
    format?: 'number' | 'percentage' | 'multiplier';
    hasCharacterA?: boolean;
    hasCharacterB?: boolean;
}

type BucketSubRow = { label: string; valueA: number; valueB: number };

interface BucketRow {
    label: string;
    valueA: number;
    valueB: number;
    descA: string;
    descB: string;
    breakdownA: string;
    breakdownB: string;
    subRows?: BucketSubRow[];
}

export function DamageVisualization({
    resultA,
    resultB,
    selectedCharacterA,
    selectedCharacterB,
    characterLevelA = 1,
    characterLevelB = 1,
    rangeWeaponLevelA = 1,
    meleeWeaponLevelA = 1,
    rangeWeaponLevelB = 1,
    meleeWeaponLevelB = 1,
    finalStatsA,
    finalStatsB,
    selectedRangeWeaponA,
    selectedMeleeWeaponA,
    selectedRangeWeaponB,
    selectedMeleeWeaponB
}: DamageVisualizationProps) {
    const avgDamageDiff = ((resultB.finalDmg.average - resultA.finalDmg.average) / resultA.finalDmg.average) * 100;
    const winner = avgDamageDiff > 0 ? 'B' : avgDamageDiff < 0 ? 'A' : 'tie';

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

    const bucketRows = buildBucketRows(resultA, resultB);

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <div className="bg-[#0c0c0f]/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-4">
                                <h2 className="text-xl font-bold">Compare Stats</h2>
                                {winner !== 'tie' && (
                                    <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${winner === 'A'
                                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                                        : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                                        }`}>
                                        <TrendingUp className="w-4 h-4" />
                                        <span className="text-sm font-bold">
                                            Preset {winner} (+{Math.abs(avgDamageDiff).toFixed(1)}%)
                                        </span>
                                    </div>
                                )}
                            </div>
                            {(!selectedCharacterA || !selectedCharacterB) && (
                                <div className="text-xs text-white/60 flex flex-col sm:flex-row sm:items-center sm:gap-4">
                                    {!selectedCharacterA && <span className="mt-1 sm:mt-0">Team Preset A is not configured yet.</span>}
                                    {!selectedCharacterB && <span className="mt-1 sm:mt-0">Team Preset B is not configured yet.</span>}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-6 border-t border-white/5">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="bg-[#1a1a1f] rounded-xl border border-white/10">
                                <div className="px-4 py-2 bg-white/5">
                                    <div className="text-xs font-semibold text-white/60 uppercase tracking-wider">BASE STATS</div>
                                </div>
                                <div className="divide-y divide-white/5">
                                    {statRows.map((row, index) => (
                                        <StatRow
                                            key={index}
                                            {...row}
                                            hasCharacterA={!!selectedCharacterA}
                                            hasCharacterB={!!selectedCharacterB}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="bg-[#1a1a1f] rounded-xl border border-white/10">
                                <div className="px-4 py-2 bg-white/5">
                                    <div className="text-xs font-semibold text-white/60 uppercase tracking-wider">Damage Buckets</div>
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

                            <div className="bg-[#1a1a1f] rounded-xl border border-white/10">
                                <div className="px-4 py-2 bg-white/5">
                                    <div className="text-xs font-semibold text-white/60 uppercase tracking-wider">Weapon Stats</div>
                                </div>
                                <div className="divide-y divide-white/5 p-4 space-y-6">
                                    <div className="space-y-2">
                                        <div className="text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-2">
                                            <Crosshair className="w-3 h-3" /> Range Weapons
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <WeaponStatsCard
                                                title="Preset A"
                                                weapon={selectedRangeWeaponA}
                                                level={rangeWeaponLevelA}
                                            />
                                            <WeaponStatsCard
                                                title="Preset B"
                                                weapon={selectedRangeWeaponB}
                                                level={rangeWeaponLevelB}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="text-xs font-bold text-white/40 uppercase tracking-wider flex items-center gap-2">
                                            <Sword className="w-3 h-3" /> Melee Weapons
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <WeaponStatsCard
                                                title="Preset A"
                                                weapon={selectedMeleeWeaponA}
                                                level={meleeWeaponLevelA}
                                            />
                                            <WeaponStatsCard
                                                title="Preset B"
                                                weapon={selectedMeleeWeaponB}
                                                level={meleeWeaponLevelB}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function WeaponStatsCard({ title, weapon, level }: { title: string; weapon: WeaponDefinition | null | undefined; level: number }) {
    const stats = getWeaponStatsForLevel(weapon, level);

    return (
        <div className="space-y-1">
            <div className="text-[10px] text-white/60 font-bold uppercase">{title}</div>
            {weapon && stats ? (
                <div className="space-y-1">
                    <div className="text-sm font-bold text-white">{weapon.name}</div>
                    <div className="space-y-0.5">
                        {Object.entries(stats).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-[10px]">
                                <span className="text-white/60">{key}</span>
                                <span className="text-white font-mono">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-xs text-white/20 italic">None selected</div>
            )}
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
    const showDiff = hasCharacterA && hasCharacterB;

    const diffClassA = diff < 0 ? 'text-green-400' : diff > 0 ? 'text-red-400' : 'text-white/40';
    const diffClassB = diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-white/40';

    return (
        <div className="flex items-center px-4 py-2 hover:bg-white/5 transition-colors min-h-[3rem]">
            <div className="w-[70px] text-sm font-semibold text-white font-mono tabular-nums text-right shrink-0">
                {formatValue(valueA)}
            </div>

            <div className={`w-[60px] text-xs font-semibold font-mono tabular-nums text-right shrink-0 px-1 ${showDiff ? diffClassA : 'opacity-0'}`}>
                {showDiff && diff !== 0 ? formatDiff(-diff) : '\u00A0'}
            </div>

            <div className="flex-1 text-xs text-white/60 text-center px-2">
                {label}
            </div>

            <div className={`w-[60px] text-xs font-semibold font-mono tabular-nums text-left shrink-0 px-1 ${showDiff ? diffClassB : 'opacity-0'}`}>
                {showDiff && diff !== 0 ? formatDiff(diff) : '\u00A0'}
            </div>

            <div className="w-[70px] text-sm font-semibold text-white font-mono tabular-nums text-left shrink-0">
                {formatValue(valueB)}
            </div>
        </div>
    );
}

function buildBucketRows(resultA: CalculationResult, resultB: CalculationResult): BucketRow[] {
    const baseRows: Array<{
        label: string;
        bucketA: CalculationResult['buckets'][keyof CalculationResult['buckets']];
        bucketB: CalculationResult['buckets'][keyof CalculationResult['buckets']];
        subRows?: BucketSubRow[];
    }> = [
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
    ];

    const rows: BucketRow[] = baseRows.map((row) => ({
        label: row.label,
        valueA: row.bucketA.value,
        valueB: row.bucketB.value,
        descA: row.bucketA.description,
        descB: row.bucketB.description,
        breakdownA: summarizeContributions(row.bucketA.breakdown),
        breakdownB: summarizeContributions(row.bucketB.breakdown),
        subRows: row.subRows
    }));

    const critRow: BucketRow = {
        label: 'CRIT',
        valueA: resultA.buckets.crit.value,
        valueB: resultB.buckets.crit.value,
        descA: `Rate ${Math.round(resultA.buckets.crit.critRate * 100)}% | DMG ${Math.round((resultA.buckets.crit.value - 1) * 100)}%`,
        descB: `Rate ${Math.round(resultB.buckets.crit.critRate * 100)}% | DMG ${Math.round((resultB.buckets.crit.value - 1) * 100)}%`,
        breakdownA: `Rate: ${summarizeContributions(resultA.buckets.crit.rateBreakdown)} • DMG: ${summarizeContributions(resultA.buckets.crit.breakdown)}`,
        breakdownB: `Rate: ${summarizeContributions(resultB.buckets.crit.rateBreakdown)} • DMG: ${summarizeContributions(resultB.buckets.crit.breakdown)}`
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
