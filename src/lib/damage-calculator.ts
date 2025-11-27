import { DemonWedge, DemonWedgeStat } from './demon-wedges-data';

export interface CalculatorState {
    damageType: 'character' | 'weapon';
    characterBaseAtk: number;
    weaponBaseAtk: number;
    skillMultiplier: number; // Percentage (e.g., 200 for 200%)
    weaponTypeAtkPercent?: number; // For weapon damage only
    proficiency?: number; // For weapon damage only (default 1.0)
    wedges: { wedge: DemonWedge; level: number }[];
}

export interface DamageBucket {
    name: string;
    value: number; // Multiplier (e.g., 1.5 for +50%)
    description: string;
    breakdown: { source: string; value: number }[];
}

export interface CalculationResult {
    totalAtk: number;
    buckets: {
        atk: DamageBucket;
        skillDmg: DamageBucket;
        dmgBoost: DamageBucket;
        crit: DamageBucket;
    };
    finalDmg: {
        nonCrit: number;
        crit: number;
        average: number;
    };
}

// Helper to parse stat string like "ATK +20%" or "Crit DMG +40%"
export function parseStatValue(statName: string, statValue: string): { type: string; value: number } | null {
    const cleanValue = parseFloat(statValue.replace('%', ''));
    if (isNaN(cleanValue)) return null;

    const value = cleanValue / 100;
    const name = statName.toLowerCase();

    if (name.includes('atk') && !name.includes('speed') && !name.includes('range')) {
        return { type: 'ATK', value };
    }
    if (name.includes('skill dmg') || name.includes('skill damage')) {
        return { type: 'Skill DMG', value };
    }
    if (name.includes('crit dmg') || name.includes('crit damage')) {
        return { type: 'Crit DMG', value };
    }
    if (name.includes('crit chance') || name.includes('crit rate')) {
        return { type: 'Crit Rate', value };
    }
    if (name.includes('damage dealt') || name.includes('dmg boost')) {
        return { type: 'DMG Boost', value };
    }
    if (name.includes('pyro atk') || name.includes('hydro atk') || name.includes('electro atk') ||
        name.includes('lumino atk') || name.includes('anemo atk') || name.includes('umbro atk')) {
        return { type: 'Elemental ATK', value };
    }

    return null;
}

export function calculateDamage(state: CalculatorState): CalculationResult {
    const { damageType, characterBaseAtk, weaponBaseAtk, skillMultiplier, weaponTypeAtkPercent = 0, proficiency = 1.0, wedges } = state;

    // Initialize Buckets
    let charAtkPercent = 0;
    let weaponAtkPercent = 0;
    let weaponTypeAtkPercentTotal = weaponTypeAtkPercent / 100;
    let elementalAtkPercent = 0;
    let skillDmgPercent = 0;
    let dmgBoostPercent = 0;
    let critDmgPercent = 0.5; // Base Crit DMG 50%
    let critRatePercent = 0.05; // Base Crit Rate 5%

    const breakdown = {
        charAtk: [] as { source: string; value: number }[],
        weaponAtk: [] as { source: string; value: number }[],
        elementalAtk: [] as { source: string; value: number }[],
        skillDmg: [] as { source: string; value: number }[],
        dmgBoost: [] as { source: string; value: number }[],
        critDmg: [] as { source: string; value: number }[],
        critRate: [] as { source: string; value: number }[],
    };

    // Process Wedges
    wedges.forEach(({ wedge, level }) => {
        let activeStats: DemonWedgeStat[] = wedge.stats;
        if (wedge.levels && wedge.levels.length > 0) {
            const levelData = wedge.levels.find(l => l.level === level);
            if (levelData) {
                activeStats = levelData.stats;
            }
        }

        activeStats.forEach(stat => {
            const parsed = parseStatValue(stat.name, stat.value);
            if (!parsed) return;

            const breakdownItem = { source: `${wedge.name} (+${level + 5})`, value: parsed.value };

            switch (parsed.type) {
                case 'ATK':
                    charAtkPercent += parsed.value;
                    breakdown.charAtk.push(breakdownItem);
                    break;
                case 'Elemental ATK':
                    elementalAtkPercent += parsed.value;
                    breakdown.

                        elementalAtk.push(breakdownItem);
                    break;
                case 'Skill DMG':
                    skillDmgPercent += parsed.value;
                    breakdown.skillDmg.push(breakdownItem);
                    break;
                case 'DMG Boost':
                    dmgBoostPercent += parsed.value;
                    breakdown.dmgBoost.push(breakdownItem);
                    break;
                case 'Crit DMG':
                    critDmgPercent += parsed.value;
                    breakdown.critDmg.push(breakdownItem);
                    break;
                case 'Crit Rate':
                    critRatePercent += parsed.value;
                    breakdown.critRate.push(breakdownItem);
                    break;
            }
        });
    });

    let totalAtk: number;
    let atkMultiplier: number;

    if (damageType === 'character') {
        // Character/Skill Damage Formula
        atkMultiplier = (1 + charAtkPercent) * (1 + elementalAtkPercent);
        totalAtk = characterBaseAtk * atkMultiplier;
    } else {
        // Weapon Damage Formula
        const charPart = characterBaseAtk * (1 + charAtkPercent) * (1 + elementalAtkPercent);
        const weaponPart = weaponBaseAtk * (1 + weaponAtkPercent) * (1 + weaponTypeAtkPercentTotal) * proficiency;
        totalAtk = charPart + weaponPart;
        atkMultiplier = totalAtk / (characterBaseAtk + weaponBaseAtk);
    }

    const finalDmgBoostMultiplier = 1 + dmgBoostPercent;
    const finalCritMultiplier = 1 + critDmgPercent;

    const baseDmg = totalAtk * (skillMultiplier / 100);
    const dmgAfterSkill = baseDmg * (1 + skillDmgPercent);
    const dmgAfterBoost = dmgAfterSkill * finalDmgBoostMultiplier;

    const nonCritDmg = dmgAfterBoost;
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
                    : `Character + Weapon parts`,
                breakdown: [...breakdown.charAtk, ...breakdown.elementalAtk, ...breakdown.weaponAtk]
            },
            skillDmg: {
                name: 'Skill DMG',
                value: 1 + skillDmgPercent,
                description: `1 + ${Math.round(skillDmgPercent * 100)}%`,
                breakdown: breakdown.skillDmg
            },
            dmgBoost: {
                name: 'DMG Boost',
                value: finalDmgBoostMultiplier,
                description: `1 + ${Math.round(dmgBoostPercent * 100)}%`,
                breakdown: breakdown.dmgBoost
            },
            crit: {
                name: 'Crit DMG',
                value: finalCritMultiplier,
                description: `1 + ${Math.round(critDmgPercent * 100)}%`,
                breakdown: breakdown.critDmg
            }
        },
        finalDmg: {
            nonCrit: Math.round(nonCritDmg),
            crit: Math.round(critDmg),
            average: Math.round(averageDmg)
        }
    };
}
