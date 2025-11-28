import { DemonWedge } from './demon-wedges-data';
import { mapStatToBucket, DamageBucketId } from './damage-buckets';

export type ConditionalValueKind = 'percentage' | 'flat';

export interface LevelOption {
    level: number;
    value: number;
    label: string;
}

export interface ConditionalEffectDefinition {
    id: string;
    label: string;
    bucketId: DamageBucketId;
    value: number;
    kind: ConditionalValueKind;
    defaultEnabled: boolean;
    source: 'description' | 'level';
    level?: number;
    // For grouped effects with multiple levels
    levelOptions?: LevelOption[];
    baseLabel?: string; // Label without the percentage number
    bucketTag?: string;
}

const NEGATIVE_KEYWORDS = [/reduce/i, /reduced/i, /decrease/i, /lower/i];

// Keywords that indicate negative effects (must be near damage/value words)
// Note: "less damage" pattern removed because it can false-positive on phrases like
// "facing less than X enemies... Increase Damage Dealt"
const NEGATIVE_DAMAGE_PATTERNS = [
    /reduce.*damage/i,
    /reduced.*damage/i,
    /decrease.*damage/i,
    /lower.*damage/i,
    /damage.*reduced/i,
    /damage.*decreased/i,
    /deal.*less.*damage/i,  // More specific pattern for "deal less damage"
    /deals.*less.*damage/i
];

const IGNORED_KEYWORDS = [
    /max tolerance/i,
    /dodge attempt/i,
    /damage taken/i,
    /trigger probability/i,
    /multishot/i,
    /reload speed/i,
    /sanity/i,
    /heal/i
];

export function getConditionalEffects(wedge: DemonWedge): ConditionalEffectDefinition[] {
    const effects: ConditionalEffectDefinition[] = [];
    const seen = new Set<string>();

    // Map to group similar effects by their base label (without percentage)
    const groupedEffects = new Map<string, ConditionalEffectDefinition>();

    const consider = (text: string | undefined | null, source: 'description' | 'level', level?: number) => {
        if (!text) return;
        const trimmed = text.trim();
        if (!trimmed) return;
        if (IGNORED_KEYWORDS.some(regex => regex.test(trimmed))) {
            return;
        }

        // Use trimmed text as deduplication key to prevent exact duplicates
        // regardless of source or level
        if (seen.has(trimmed)) return;
        seen.add(trimmed);

        const parsed = parseConditionalText(trimmed, wedge, source, level);
        if (parsed) {
            // Create base label by replacing ALL numeric values with placeholder
            // This handles descriptions with multiple values that change per level:
            // - "Skill DMG 18%. When attacking... deals 18.00% additional damage"
            // - "ATK increases equal to 11.40% of the user's ATK (up to 275) for 10s"
            // - "equal to 13.20 of the Summoner's Skill range"
            // We replace all numbers (with optional % or decimal) to create a consistent base
            const baseLabel = trimmed
                .replace(/([+-]?\d+(?:\.\d+)?)\s*%/g, 'X%')  // Replace percentages
                .replace(/\(up to\s+[+-]?\d+(?:\.\d+)?\)/gi, '(up to X)')  // Replace "up to N"
                .replace(/equal to\s+[+-]?\d+(?:\.\d+)?(?:\s+of)/gi, 'equal to X of')  // Replace "equal to N of"
                .replace(/\b\d+(?:\.\d+)?s\b/g, 'Xs');  // Replace durations like "10s"

            const existing = groupedEffects.get(baseLabel);
            if (existing && existing.levelOptions) {
                // Add to existing group
                existing.levelOptions.push({
                    level: level ?? 0,
                    value: parsed.value,
                    label: trimmed
                });
                // Update to highest level value by default
                if ((level ?? 0) > (existing.level ?? 0)) {
                    existing.value = parsed.value;
                    existing.level = level;
                    existing.label = trimmed;
                }
            } else if (existing) {
                // Convert existing to grouped effect
                existing.levelOptions = [
                    {
                        level: existing.level ?? 0,
                        value: existing.value,
                        label: existing.label
                    },
                    {
                        level: level ?? 0,
                        value: parsed.value,
                        label: trimmed
                    }
                ];
                existing.baseLabel = baseLabel;
                // Update to highest level value
                if ((level ?? 0) > (existing.level ?? 0)) {
                    existing.value = parsed.value;
                    existing.level = level;
                    existing.label = trimmed;
                }
            } else {
                // New effect
                parsed.baseLabel = baseLabel;
                groupedEffects.set(baseLabel, parsed);
            }
        }
    };

    consider(wedge.description, 'description');
    wedge.levels?.forEach(level => {
        consider(level.description, 'level', level.level);
    });

    // Convert map to array and sort levelOptions
    for (const effect of groupedEffects.values()) {
        if (effect.levelOptions && effect.levelOptions.length > 1) {
            effect.levelOptions.sort((a, b) => a.level - b.level);
        } else {
            // Single option, no need for dropdown
            delete effect.levelOptions;
            delete effect.baseLabel;
        }
        effects.push(effect);
    }

    return effects;
}

function parseConditionalText(
    text: string,
    wedge: DemonWedge,
    source: 'description' | 'level',
    level?: number
): ConditionalEffectDefinition | null {
    if (/equal to\s+\d+%/i.test(text) && /damage/i.test(text)) {
        // These describe separate damage instances rather than modifiers we can model cleanly.
        return null;
    }

    const classification = mapStatToBucket(text);
    if (!classification) return null;
    if (classification.bucketId === 'UTILITY') return null;

    const match = text.match(/([+-]?\d+(?:\.\d+)?)%/);
    if (!match) return null;

    const numeric = Number.parseFloat(match[1]);
    if (Number.isNaN(numeric)) return null;

    let value = numeric / 100;

    // Check if this is truly a negative effect by looking at patterns
    // Don't just check for "less" as it might be in "facing less than X enemies"
    const isNegativeEffect = NEGATIVE_DAMAGE_PATTERNS.some(regex => regex.test(text)) ||
        NEGATIVE_KEYWORDS.some(regex => {
            // For keywords like "reduce", "decrease", they should be near the numeric value
            const keywordMatch = text.match(regex);
            if (!keywordMatch) return false;
            const keywordIndex = keywordMatch.index!;
            const numericIndex = text.indexOf(match[0]);
            // Check if keyword is within 30 characters of the numeric value
            return Math.abs(keywordIndex - numericIndex) < 30;
        });

    if (isNegativeEffect) {
        value *= -1;
    }

    // Use slugified text without level to ensure uniqueness based on content only
    const id = `${wedge.id}-cond-${slugify(text)}`;

    return {
        id,
        label: text,
        bucketId: classification.bucketId,
        value,
        kind: classification.kind,
        defaultEnabled: false,
        source,
        level,
        bucketTag: classification.tag
    };
}

function slugify(value: string) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
