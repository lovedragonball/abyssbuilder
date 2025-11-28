/**
 * Damage bucket identifiers derived from demon_wedge_builder_data.txt
 *
 * Buckets stack additively within themselves and multiplicatively with
 * the other buckets unless otherwise noted.
 */
export type DamageBucketId =
    | 'SCALAR_ATK'
    | 'SCALAR_HP'
    | 'SCALAR_DEF'
    | 'MV_DMG'
    | 'DMG_BOOST'
    | 'CRIT_DMG'
    | 'CRIT_RATE'
    | 'FINAL_DMG'
    | 'UTILITY';

export interface DamageBucketDefinition {
    id: DamageBucketId;
    label: string;
    description: string;
    notes?: string;
}

export const DAMAGE_BUCKETS: Record<DamageBucketId, DamageBucketDefinition> = {
    SCALAR_ATK: {
        id: 'SCALAR_ATK',
        label: 'Base ATK Scalar',
        description: 'Additive pool of ATK% (including Smash/Slash/Spike/Elemental ATK).',
        notes: 'Applied as (1 + Σ ATK%) to the base attack stat.'
    },
    SCALAR_HP: {
        id: 'SCALAR_HP',
        label: 'Base HP Scalar',
        description: 'Additive pool of HP%.',
        notes: 'Used when a skill scales from HP.'
    },
    SCALAR_DEF: {
        id: 'SCALAR_DEF',
        label: 'Base DEF Scalar',
        description: 'Additive pool of DEF%.',
        notes: 'Used when a skill scales from DEF.'
    },
    MV_DMG: {
        id: 'MV_DMG',
        label: 'Motion Value Multiplier',
        description: 'Additive pool of Skill DMG% style buffs.',
        notes: 'Represents the MV portion of the core formula.'
    },
    DMG_BOOST: {
        id: 'DMG_BOOST',
        label: 'Damage Boost Multiplier',
        description: 'Additive pool of general damage boosts (Damage Dealt, Weapon DMG, etc.).'
    },
    CRIT_DMG: {
        id: 'CRIT_DMG',
        label: 'Critical Damage Multiplier',
        description: 'Additive pool of Crit DMG% stats.',
        notes: 'Applied as part of CRIT multiplier when attacks can crit.'
    },
    CRIT_RATE: {
        id: 'CRIT_RATE',
        label: 'Critical Rate',
        description: 'Additive pool of Crit Rate / Crit Chance bonuses.',
        notes: 'Determines crit chance and crit level.'
    },
    FINAL_DMG: {
        id: 'FINAL_DMG',
        label: 'Final Damage Multiplier',
        description: 'Multipliers that apply after all other buckets (e.g., Feathered Serpent’s Steadfast).'
    },
    UTILITY: {
        id: 'UTILITY',
        label: 'Utility / Non-Damage',
        description: 'Stats that do not affect the damage formula directly (ATK Speed, Skill Duration, etc.).'
    }
};

export type StatValueKind = 'percentage' | 'flat';

export interface BucketMatchResult {
    bucketId: DamageBucketId;
    normalizedStat: string;
    kind: StatValueKind;
    /**
     * Optional tag to help downstream logic (e.g., differentiating elemental ATK vs general ATK).
     */
    tag?: 'elemental' | 'weapon-type' | 'weapon' | 'skill' | 'conditional' | 'flat';
}

interface BucketMatcher {
    bucketId: DamageBucketId;
    keywords: Array<string | RegExp>;
    excludes?: Array<string | RegExp>;
    normalizedStat: string;
    kind: StatValueKind;
    tag?: BucketMatchResult['tag'];
}

const KEYWORD_MATCHERS: BucketMatcher[] = [
    {
        bucketId: 'SCALAR_ATK',
        normalizedStat: 'Weapon ATK%',
        kind: 'percentage',
        keywords: [/weapon atk/i],
        tag: 'weapon'
    },
    {
        bucketId: 'SCALAR_ATK',
        normalizedStat: 'Weapon Type ATK%',
        kind: 'percentage',
        keywords: [/weapon type atk/i, /weapon-type atk/i],
        tag: 'weapon'
    },
    {
        bucketId: 'SCALAR_ATK',
        normalizedStat: 'ATK%',
        kind: 'percentage',
        keywords: [/atk/i],
        excludes: [/speed/i, /range/i, /probability/i, /trigger/i, /damage taken/i, /dodge/i]
    },
    {
        bucketId: 'SCALAR_HP',
        normalizedStat: 'HP%',
        kind: 'percentage',
        keywords: [/hp/i],
    },
    {
        bucketId: 'SCALAR_DEF',
        normalizedStat: 'DEF%',
        kind: 'percentage',
        keywords: [/def/i],
    },
    {
        bucketId: 'MV_DMG',
        normalizedStat: 'Skill DMG%',
        kind: 'percentage',
        keywords: [/skill dmg/i, /skill damage/i, /motion value/i]
    },
    {
        bucketId: 'DMG_BOOST',
        normalizedStat: 'DMG Boost%',
        kind: 'percentage',
        keywords: [/dmg boost/i, /damage dealt/i, /weapon dmg/i, /damage increase/i],
    },
    {
        bucketId: 'CRIT_DMG',
        normalizedStat: 'Crit DMG%',
        kind: 'percentage',
        keywords: [/crit dmg/i, /critical damage/i],
    },
    {
        bucketId: 'CRIT_RATE',
        normalizedStat: 'Crit Rate%',
        kind: 'percentage',
        keywords: [/crit chance/i, /crit rate/i, /critical chance/i],
    },
    {
        bucketId: 'FINAL_DMG',
        normalizedStat: 'Final DMG%',
        kind: 'percentage',
        keywords: [/final dmg/i, /damage dealt is reduced/i],
    },
    {
        bucketId: 'UTILITY',
        normalizedStat: 'Utility',
        kind: 'flat',
        keywords: [
            /atk speed/i,
            /max sanity/i,
            /trigger probability/i,
            /skill range/i,
            /skill duration/i,
            /skill efficiency/i,
            /morale/i,
            /resolve/i,
            /reload speed/i,
            /multishot/i,
            /dodge/i,
            /damage taken/i
        ]
    }
];

/**
 * Attempts to classify a Demon Wedge stat name into a damage bucket.
 */
export function mapStatToBucket(statName: string): BucketMatchResult | null {
    const trimmed = statName.trim();
    if (!trimmed) return null;

    for (const matcher of KEYWORD_MATCHERS) {
        const matchesKeyword = matcher.keywords.some(keyword => testKeyword(trimmed, keyword));
        if (!matchesKeyword) continue;

        if (matcher.excludes?.some(exclude => testKeyword(trimmed, exclude))) {
            continue;
        }

        const tag = inferTag(trimmed, matcher.bucketId) ?? matcher.tag;

        return {
            bucketId: matcher.bucketId,
            normalizedStat: matcher.normalizedStat,
            kind: matcher.kind,
            tag
        };
    }

    return null;
}

function testKeyword(source: string, keyword: string | RegExp): boolean {
    if (typeof keyword === 'string') {
        return source.toLowerCase().includes(keyword.toLowerCase());
    }
    return keyword.test(source);
}

function inferTag(statName: string, bucketId: DamageBucketId): BucketMatchResult['tag'] {
    if (bucketId === 'SCALAR_ATK') {
        if (/weapon\s+type/i.test(statName) || /weapon\s+atk/i.test(statName)) {
            return 'weapon';
        }
        if (/(pyro|hydro|electro|lumino|anemo|umbro)/i.test(statName)) {
            return 'elemental';
        }
        if (/(smash|slash|spike)/i.test(statName)) {
            return 'weapon-type';
        }
    }
    if (bucketId === 'MV_DMG' && /skill/i.test(statName)) {
        return 'skill';
    }
    if (/(when|while|upon|after)/i.test(statName)) {
        return 'conditional';
    }
    return undefined;
}

export interface BucketContribution {
    bucketId: DamageBucketId;
    value: number;
    source: string;
    note?: string;
}

export interface CombinedBucketState {
    total: number;
    contributions: BucketContribution[];
}

export type BucketCombination = Record<DamageBucketId, CombinedBucketState>;

export function createEmptyBucketCombination(): BucketCombination {
    return Object.keys(DAMAGE_BUCKETS).reduce((acc, bucketId) => {
        acc[bucketId as DamageBucketId] = { total: 0, contributions: [] };
        return acc;
    }, {} as BucketCombination);
}

export function combineBuckets(
    buckets: BucketCombination,
    contribution: BucketContribution
): BucketCombination {
    const bucket = buckets[contribution.bucketId];
    if (!bucket) return buckets;

    bucket.total += contribution.value;
    bucket.contributions.push(contribution);
    return buckets;
}

export interface FinalMultiplierBreakdown {
    scalarAtk: number;
    mvMultiplier: number;
    dmgBoost: number;
    finalDmg: number;
    critRate: number;
    critDamage: number;
}

export function buildFinalMultiplier(
    combination: BucketCombination,
    baseCritRate = 0.05,
    baseCritDamage = 0.5
): FinalMultiplierBreakdown {
    const atk = 1 + combination.SCALAR_ATK.total;
    const mv = 1 + combination.MV_DMG.total;
    const dmgBoost = 1 + combination.DMG_BOOST.total;
    const final = 1 + combination.FINAL_DMG.total;

    const critRate = clamp(baseCritRate + combination.CRIT_RATE.total, 0, 1);
    const critDmg = 1 + (baseCritDamage + combination.CRIT_DMG.total);

    return {
        scalarAtk: atk,
        mvMultiplier: mv,
        dmgBoost,
        finalDmg: final,
        critRate,
        critDamage: critDmg
    };
}

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

