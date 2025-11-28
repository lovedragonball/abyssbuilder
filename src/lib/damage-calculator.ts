import { DemonWedge, DemonWedgeStat } from './demon-wedges-data';
import {
    BucketCombination,
    BucketContribution,
    createEmptyBucketCombination,
    combineBuckets,
    mapStatToBucket
} from './damage-buckets';
import { getConditionalEffects } from './demon-wedge-conditions';

export interface EquippedCalculatorWedge {
    wedge: DemonWedge;
    level: number;
    conditions?: Record<string, boolean | number>;
}

export interface CalculatorState {
    damageType: 'character' | 'weapon';
    characterBaseAtk: number;
    weaponBaseAtk: number;
    skillMultiplier: number; // Percentage (e.g., 200 for 200%)
    weaponTypeAtkPercent?: number; // For weapon damage only
    proficiency?: number; // For weapon damage only (default 1.0)
    wedges: EquippedCalculatorWedge[];
}

export interface DamageBucket {
    name: string;
    value: number; // Multiplier (e.g., 1.5 for +50%)
    description: string;
    breakdown: BucketContribution[];
}

export interface CritDamageBucket extends DamageBucket {
    critRate: number;
    rateBreakdown: BucketContribution[];
}

export interface CalculationResult {
    totalAtk: number;
    buckets: {
        atk: DamageBucket;
        skillDmg: DamageBucket;
        dmgBoost: DamageBucket;
        crit: CritDamageBucket;
        final: DamageBucket;
    };
    finalDmg: {
        nonCrit: number;
        crit: number;
        average: number;
    };
    bucketCombination: BucketCombination;
    atkPools: {
        char: number;
        weapon: number;
        elemental: number;
    };
}

export function calculateDamage(state: CalculatorState): CalculationResult {
    const {
        damageType,
        characterBaseAtk,
        weaponBaseAtk,
        skillMultiplier,
        weaponTypeAtkPercent = 0,
        proficiency = 1.0,
        wedges
    } = state;

    const bucketCombination = createEmptyBucketCombination();
    let charAtkPercent = 0;
    let weaponAtkPercent = weaponTypeAtkPercent / 100;
    let elementalAtkPercent = 0;
    let skillDmgPercent = 0;
    let dmgBoostPercent = 0;
    let finalDmgPercent = 0;
    let critDmgPercent = 0.5; // Base Crit DMG 50%
    let critRatePercent = 0.05; // Base Crit Rate 5%

    wedges.forEach(({ wedge, level, conditions }) => {
        let activeStats: DemonWedgeStat[] = wedge.stats;
        if (wedge.levels && wedge.levels.length > 0) {
            const levelData = wedge.levels.find(l => l.level === level);
            if (levelData) {
                activeStats = levelData.stats;
            }
        }

        activeStats.forEach(stat => {
            const parsed = classifyStat(stat.name, stat.value);
            if (!parsed) return;

            addContribution(
                bucketCombination,
                parsed.bucketId,
                parsed.value,
                `${wedge.name} (+${level + 5})`,
                buildNoteForContribution(parsed.tag, stat.name)
            );

            switch (parsed.bucketId) {
                case 'SCALAR_ATK':
                    ({ charAtkPercent, weaponAtkPercent, elementalAtkPercent } = applyScalarContribution(
                        parsed.value,
                        parsed.tag,
                        charAtkPercent,
                        weaponAtkPercent,
                        elementalAtkPercent
                    ));
                    break;
                case 'MV_DMG':
                    skillDmgPercent += parsed.value;
                    break;
                case 'DMG_BOOST':
                    dmgBoostPercent += parsed.value;
                    break;
                case 'CRIT_DMG':
                    critDmgPercent += parsed.value;
                    break;
                case 'CRIT_RATE':
                    critRatePercent += parsed.value;
                    break;
                case 'FINAL_DMG':
                    finalDmgPercent += parsed.value;
                    break;
            }
        });

        const conditionalEffects = getConditionalEffects(wedge);
        conditionalEffects.forEach(effect => {
            if (!conditions || !conditions[effect.id]) return;

            // Use selected value from conditions if available, otherwise use default
            const selectedValue = (conditions[`${effect.id}_value`] as unknown as number) ?? effect.value;
            
            addContribution(
                bucketCombination,
                effect.bucketId,
                selectedValue,
                wedge.name,
                buildNoteForContribution(effect.bucketTag, effect.label)
            );

            switch (effect.bucketId) {
                case 'SCALAR_ATK':
                    ({ charAtkPercent, weaponAtkPercent, elementalAtkPercent } = applyScalarContribution(
                        selectedValue,
                        effect.bucketTag,
                        charAtkPercent,
                        weaponAtkPercent,
                        elementalAtkPercent
                    ));
                    break;
                case 'MV_DMG':
                    skillDmgPercent += selectedValue;
                    break;
                case 'DMG_BOOST':
                    dmgBoostPercent += selectedValue;
                    break;
                case 'CRIT_DMG':
                    critDmgPercent += selectedValue;
                    break;
                case 'CRIT_RATE':
                    critRatePercent += selectedValue;
                    break;
                case 'FINAL_DMG':
                    finalDmgPercent += selectedValue;
                    break;
            }
        });
    });

    let totalAtk: number;
    let atkMultiplier: number;

    const charFinalAtk = characterBaseAtk * (1 + charAtkPercent) * (1 + elementalAtkPercent);
    const weaponFinalAtk = weaponBaseAtk * (1 + weaponAtkPercent) * (1 + elementalAtkPercent) * proficiency;

    if (damageType === 'character') {
        totalAtk = charFinalAtk;
        atkMultiplier = characterBaseAtk > 0 ? charFinalAtk / characterBaseAtk : 0;
    } else {
        totalAtk = charFinalAtk + weaponFinalAtk;
        const baseSum = characterBaseAtk + weaponBaseAtk;
        atkMultiplier = baseSum > 0 ? totalAtk / baseSum : 0;
    }

    const finalDmgBoostMultiplier = 1 + dmgBoostPercent;
    const finalDamageMultiplier = 1 + finalDmgPercent;
    const finalCritMultiplier = 1 + critDmgPercent;

    const baseDmg = totalAtk * (skillMultiplier / 100);
    const dmgAfterSkill = baseDmg * (1 + skillDmgPercent);
    const dmgAfterBoost = dmgAfterSkill * finalDmgBoostMultiplier;
    const dmgAfterFinal = dmgAfterBoost * finalDamageMultiplier;

    const nonCritDmg = dmgAfterFinal;
    const critDmg = nonCritDmg * finalCritMultiplier;

    const effectiveCritRate = Math.min(1, Math.max(0, critRatePercent));
    const averageDmg = (nonCritDmg * (1 - effectiveCritRate)) + (critDmg * effectiveCritRate);

    return {
        totalAtk,
        buckets: {
            atk: {
                name: 'Attack',
                value: atkMultiplier,
                description: damageType === 'character'
                    ? `(1 + ${Math.round(charAtkPercent * 100)}%) * (1 + ${Math.round(elementalAtkPercent * 100)}%)`
                    : `Char Final ATK ${Math.round(charFinalAtk)} + Weapon Final ATK ${Math.round(weaponFinalAtk)}`,
                breakdown: bucketCombination.SCALAR_ATK.contributions
            },
            skillDmg: {
                name: 'Skill DMG',
                value: 1 + skillDmgPercent,
                description: `1 + ${Math.round(skillDmgPercent * 100)}%`,
                breakdown: bucketCombination.MV_DMG.contributions
            },
            dmgBoost: {
                name: 'DMG Boost',
                value: finalDmgBoostMultiplier,
                description: `1 + ${Math.round(dmgBoostPercent * 100)}%`,
                breakdown: bucketCombination.DMG_BOOST.contributions
            },
            crit: {
                name: 'Crit DMG',
                value: finalCritMultiplier,
                description: `CRIT Rate ${Math.round(effectiveCritRate * 100)}% | CRIT DMG ${Math.round(critDmgPercent * 100)}%`,
                breakdown: bucketCombination.CRIT_DMG.contributions,
                critRate: effectiveCritRate,
                rateBreakdown: bucketCombination.CRIT_RATE.contributions
            },
            final: {
                name: 'Final DMG',
                value: finalDamageMultiplier,
                description: `1 + ${Math.round(finalDmgPercent * 100)}%`,
                breakdown: bucketCombination.FINAL_DMG.contributions
            }
        },
        finalDmg: {
            nonCrit: Math.round(nonCritDmg),
            crit: Math.round(critDmg),
            average: Math.round(averageDmg)
        },
        bucketCombination,
        atkPools: {
            char: charAtkPercent,
            weapon: weaponAtkPercent,
            elemental: elementalAtkPercent
        }
    };
}

function classifyStat(statName: string, statValue: string) {
    const cleanValue = statValue.replace('%', '').trim();
    const numeric = Number.parseFloat(cleanValue);
    if (Number.isNaN(numeric)) return null;

    const bucketMatch = mapStatToBucket(statName);
    if (!bucketMatch || bucketMatch.bucketId === 'UTILITY') return null;

    const isPercentage = bucketMatch.kind === 'percentage' || statValue.trim().endsWith('%');
    const value = isPercentage ? numeric / 100 : numeric;
    return {
        bucketId: bucketMatch.bucketId,
        value,
        tag: bucketMatch.tag
    };
}

function addContribution(
    combination: BucketCombination,
    bucketId: keyof BucketCombination,
    value: number,
    source: string,
    note?: string
) {
    combineBuckets(combination, {
        bucketId,
        value,
        source,
        note
    });
}

function applyScalarContribution(
    value: number,
    tag: string | undefined,
    charPool: number,
    weaponPool: number,
    elementalPool: number
) {
    if (tag === 'elemental') {
        elementalPool += value;
    } else if (tag === 'weapon') {
        weaponPool += value;
    } else {
        charPool += value;
    }
    return {
        charAtkPercent: charPool,
        weaponAtkPercent: weaponPool,
        elementalAtkPercent: elementalPool
    };
}

function buildNoteForContribution(tag: string | undefined, fallback?: string) {
    if (tag === 'elemental') return 'Elemental ATK%';
    if (tag === 'weapon') return 'Weapon ATK%';
    if (tag === 'weapon-type') return 'Attack-Type ATK%';
    return fallback;
}
