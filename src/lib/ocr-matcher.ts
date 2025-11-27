import type { Mod } from './types';

export type OcrSlotResult = {
    slotId: string;
    rawText: string;
    tolerance?: number;
};

export type OcrModSlot = {
    slot_index: number;
    raw_ocr_text: string;
    matched: boolean;
    mod_id: string | null;
    mod_name: string | null;
    confidence: number;
    reason: string;
    hasMultipleVariants?: boolean;
    variants?: Mod[];
    selectedModData?: {
        id?: string;
        name: string;
        rarity: number;
        element?: string;
        variant?: string;
        modType: string;
    };
};

export type OcrMatchSummary = {
    total_detected: number;
    total_matched: number;
    total_unmatched: number;
};

export type OcrMatcherDebug = {
    source: 'slots' | 'text';
    candidates: string[];
    normalizedCandidates: string[];
    slotCandidates?: {
        slotId: string;
        rawText: string;
        candidates: string[];
    }[];
};

export type OcrMatchResponse = {
    slots: OcrModSlot[];
    summary: OcrMatchSummary;
    debug?: OcrMatcherDebug;
};

export type OcrSlotText = { slotId?: string; text: string };

const MATCH_THRESHOLD = 0.30; // More tolerant for partial OCR matches (lowered from 0.35)

const UI_NOISE_KEYWORDS = [
    'tolerance',
    'adjust slot track',
    'remove all mods',
    'slots',
    'slot track',
    'level',
    'lv.',
    'lv',
    'new',
    'all',
    'atk',
    'hp',
    'def',
    'weapon',
    'center',
    'support',
    'team',
    'guide',
    'track',
    'ears',
    'lee ee ie',
    'slot',
];

/**
 * Extract cleaned OCR candidate lines from raw text.
 * Filters out UI noise and keeps only meaningful text.
 */
export function extractOcrCandidates(rawText: string): string[] {
    return rawText
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length >= 2)
        .filter((l) => {
            const hasLetters = /[a-zA-Z]/.test(l);
            const hasDigitsOrPlus = /[0-9+]/.test(l);
            const letterCount = (l.match(/[a-zA-Z]/g) || []).length;

            // Basic heuristics:
            // - must have some letters
            // - must have at least 2-3 letters OR contain "+digit"
            if (!hasLetters) return false;
            if (letterCount < 2 && !hasDigitsOrPlus) return false;

            const lower = l.toLowerCase();

            // Filter out UI noise
            if (UI_NOISE_KEYWORDS.some((k) => lower.includes(k))) return false;

            return true;
        });
}

/**
 * Get cleaned and normalized OCR candidates from raw text.
 * Combines extraction and normalization in one step.
 */
export function getCleanedOcrCandidates(rawText: string): string[] {
    const lines = extractOcrCandidates(rawText);
    return lines.map(normalizeOcrLine).filter((l) => l.length > 0);
}

/**
 * Normalize a single OCR line for matching.
 * Keeps letters, digits, +, space, and apostrophe.
 */
export function normalizeOcrLine(line: string): string {
    return line
        .toLowerCase()
        // Keep letters, digits, +, space, apostrophe
        .replace(/[^a-z0-9+'\s]/g, " ")
        // Collapse multiple spaces
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Legacy function for backward compatibility.
 * Normalizes mod line by removing +digits and special chars.
 */
export function normalizeOcrModLine(raw: string): string {
    return raw
        .toLowerCase()
        .replace(/\+\s*\d{1,2}/g, '')
        .replace(/[·•*·\-–—]/g, ' ')
        .replace(/[^a-z\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

const hasLetters = (value: string) => /[a-zA-Z]/.test(value);

const hasAtLeastLetters = (value: string, minLetters: number) => {
    const letters = value.match(/[a-zA-Z]/g) || [];
    return letters.length >= minLetters;
};

const isUiNoiseLine = (line: string) => {
    const lower = line.toLowerCase();
    return UI_NOISE_KEYWORDS.some((keyword) => lower.includes(keyword));
};

const isLikelyModLine = (line: string) => {
    const value = line.trim();
    if (!value || value.length < 3) return false;

    const hasPlusLevel = /\+\s*\d{1,2}/.test(value);
    const mostlySymbolsOrDigits = /^[\d\W_]+$/.test(value);

    if (mostlySymbolsOrDigits && !hasPlusLevel) return false;
    if (!hasLetters(value) && !hasPlusLevel) return false;
    if (!hasAtLeastLetters(value, 3) && !hasPlusLevel) return false;
    if (isUiNoiseLine(value)) return false;

    return true;
};

const splitIntoLines = (text: string) =>
    text
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length >= 3);

const extractCandidateLinesFromSlot = (slot: OcrSlotResult) => {
    // Use the new extraction function for better filtering
    const candidates = extractOcrCandidates(slot.rawText);

    if (candidates.length === 0 && slot.rawText.trim()) {
        const fallback = slot.rawText.trim();
        if (isLikelyModLine(fallback)) {
            candidates.push(fallback);
        }
    }

    return candidates;
};

export function extractModCandidatesFromSlots(slots: OcrSlotResult[]): string[] {
    const candidates: string[] = [];

    for (const slot of slots) {
        const lines = extractCandidateLinesFromSlot(slot);
        for (const line of lines) {
            candidates.push(line);
        }
    }

    return candidates;
}

export function extractModCandidatesFromText(text: string): string[] {
    const lines = splitIntoLines(text);
    const candidates = lines.filter(isLikelyModLine);

    if (candidates.length === 0 && text.trim()) {
        candidates.push(text.trim());
    }

    return candidates;
}

const levenshteinDistance = (a: string, b: string) => {
    if (a === b) return 0;
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix: number[][] = Array.from({ length: b.length + 1 }, () => new Array(a.length + 1).fill(0));

    for (let i = 0; i <= b.length; i++) {
        matrix[i][0] = i;
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            const cost = b[i - 1] === a[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }

    return matrix[b.length][a.length];
};

const tokenOverlapScore = (a: string, b: string) => {
    const aTokens = new Set(a.split(' ').filter(Boolean));
    const bTokens = new Set(b.split(' ').filter(Boolean));
    if (aTokens.size === 0 || bTokens.size === 0) return 0;

    let intersection = 0;
    aTokens.forEach((token) => {
        if (bTokens.has(token)) intersection += 1;
    });

    const union = new Set([...aTokens, ...bTokens]).size;
    return union === 0 ? 0 : intersection / union;
};

const computeSimilarity = (a: string, b: string) => {
    if (!a || !b) return 0;

    const distance = levenshteinDistance(a, b);
    const maxLength = Math.max(a.length, b.length);
    const levenshteinScore = maxLength === 0 ? 0 : 1 - distance / maxLength;
    const tokenScore = tokenOverlapScore(a, b);

    return levenshteinScore * 0.6 + tokenScore * 0.4;
};

const RAW_EXTRA_ALIAS_MAP: Record<string, string[]> = {
    "Blaze Inspo": ['blaze inspo', 'blaze inspo +10', 'blaze·inspo', 'blaze inspo 10', "covenanter's blaze inspo", 'covenanters blaze inspo'],
    "Blaze Spectrum": ['blaze spectrum', 'blaze spectrum +10', 'blaze·spectrum', 'blaze spectrum 10', 'blaze • spectrum', "covenanter's blaze spectrum", 'covenanters blaze spectrum'],
    "Wings": ['wings inspo', 'wing inspo', 'wings volition', 'covenanter wings', 'covenanters wings', 'wings • inspo', 'covenanter wing', 'wings', 'wings +5', 'wings +10', 'siren wings', 'sirens wings', "siren's wings", "pan's wings", 'pans wings', "covenanter's wings"],
    "Nirvana": ['covenanter nirvana', 'covenanters nirvana', 'nirvana', 'nirvana +5', 'nirvana +10', "covenanter's nirvana"],
    "Nirvana Volition": ['nirvana volition', 'nirvana·volition', 'nirvana • volition', 'volition', "covenanter's nirvana volition"],
    "Nirvana Spectrum": ['spectrum nirvana', 'nirvana spectrum', "covenanter's nirvana spectrum"],
    "Scorch": ['scorch', 'scorch +5', 'scorch +10', 'covenanter scorch', 'covenanters scorch', "covenanter's scorch"],
    "Misty Veil": ['misty veil +10', 'mistyveil', "bahamut's misty veil", 'bahamuts misty veil'],
    "Prime": ['prime', 'typhon prime', 'typhons prime', 'prime +5', 'prime +10', "typhon's prime"],
    "Prime Morale": ['prime morale +5', 'prime morale 5', 'prime morale', 'prime', 'typhon prime', "typhon's prime morale"],
    "Prime Vitality": ['prime vitality', 'prime', 'typhon prime', "typhon's prime vitality"],
    "Prime Fortitude": ['prime fortitude', 'prime', 'typhon prime', "typhon's prime fortitude"],
    "Prime Celerity": ['prime celerity', 'prime', 'typhon prime', "typhon's prime celerity"],
    "Prime Serenity": ['prime serenity', 'prime • serenity', 'serenity', 'prime', "typhon's prime serenity"],
    "Seawave Midnight Sun": ['seawave - midnight sun', 'sea wave midnight sun'],
    "Standfast": ['steadfast +5', 'steadfast 5', 'standfast'],
    "Onslaught": ['onslaught +10', 'onslaught 10'],
    "Feathered Serpent Vigilant": ['vigilant', 'feathered serpents vigilant', 'serpent vigilant', 'vigilant +5', 'vigilant 5', "feathered serpent's vigilant"],
    "Feathered Serpent Steadfast": ['steadfast', 'serpent steadfast', 'steadfast +5', "feathered serpent's steadfast"],
    "Skylume": ['skylume', 'skylume +5', 'skylume +10', 'griffin skylume', 'griffins skylume', "griffin's skylume"],
    "Skylume Wildfire": ['skylume wildfire', 'skylume • wildfire', 'wildfire', 'skylume', "griffin's skylume wildfire"],
    "Spectrum": ['spectrum', 'spectrum +5', 'spectrum +10', 'siren spectrum', 'sirens spectrum', "siren's spectrum", 'pan spectrum', 'pans spectrum', "pan's spectrum"],
    "Inspo": ['inspo', 'inspo +5', 'inspo +10', 'siren inspo', 'sirens inspo', 'wings • inspo', "siren's inspo"],
    "Wings Inspo": ['wings inspo +10', 'wings·inspo', 'wings • inspo', 'inspo'],
};

const normalizedExtraAliasMap = Object.entries(RAW_EXTRA_ALIAS_MAP).reduce<Record<string, string[]>>((acc, [key, aliases]) => {
    const normalizedKey = normalizeOcrModLine(key);
    if (!normalizedKey) return acc;
    acc[normalizedKey] = [...(acc[normalizedKey] || []), ...aliases];
    return acc;
}, {});

const collectAliasesForMod = (mod: Mod): string[] => {
    const keys = [
        mod.name,
        mod.variant ? `${mod.name} ${mod.variant}` : undefined,
    ];

    const aliases = new Set<string>();
    keys.forEach((key) => {
        if (!key) return;
        const normalizedKey = normalizeOcrModLine(key);
        if (!normalizedKey) return;
        const aliasList = normalizedExtraAliasMap[normalizedKey];
        if (aliasList?.length) {
            aliasList.forEach((alias) => aliases.add(alias));
        }
    });

    return Array.from(aliases);
};

type ComparableName = {
    mod: Mod;
    displayName: string;
    normalized: string;
};

const preferComparablesForElement = (entries: ComparableName[], element?: string) => {
    if (!element) return entries;

    const elementMatches = entries.filter(entry => entry.mod.element === element);
    if (elementMatches.length > 0) return elementMatches;

    const neutralMatches = entries.filter(entry => !entry.mod.element);
    if (neutralMatches.length > 0) return neutralMatches;

    return entries;
};

const buildComparableNames = (mods: Mod[]): ComparableName[] => {
    const entries: ComparableName[] = [];

    mods.forEach((mod) => {
        const base = normalizeOcrModLine(mod.name);
        if (base) {
            entries.push({ mod, displayName: mod.name, normalized: base });
        }

        if (mod.variant) {
            const combined = normalizeOcrModLine(`${mod.name} ${mod.variant}`);
            if (combined) {
                entries.push({ mod, displayName: `${mod.name} ${mod.variant}`, normalized: combined });
            }
        }

        const compact = normalizeOcrModLine(mod.name.replace(/['’]/g, '').replace(/[^a-zA-Z\s]/g, ' '));
        if (compact) {
            entries.push({ mod, displayName: mod.name, normalized: compact });
        }

        collectAliasesForMod(mod).forEach((alias) => {
            const normAlias = normalizeOcrModLine(alias);
            if (normAlias) {
                entries.push({ mod, displayName: alias, normalized: normAlias });
            }
        });
    });

    return entries;
};

const fallbackModId = (mod: Mod) => mod.id || normalizeOcrModLine(mod.name).replace(/\s+/g, '-');

type ModScore = {
    mod: Mod;
    alias: string;
    score: number;
};

const bestMatchForCandidate = (
    candidate: string,
    comparables: ComparableName[],
    allMods: Mod[],
    characterElement?: string,
    tolerance?: number
): { best: ModScore | null; runnerUp: ModScore | null; variants: Mod[] } => {
    let best: ModScore | null = null;
    let runnerUp: ModScore | null = null;

    const entriesToSearch = preferComparablesForElement(comparables, characterElement);

    entriesToSearch.forEach((entry) => {
        const score = computeSimilarity(candidate, entry.normalized);
        if (!best || score > best.score) {
            runnerUp = best;
            best = { mod: entry.mod, alias: entry.displayName, score };
        } else if (!runnerUp || score > runnerUp.score) {
            runnerUp = { mod: entry.mod, alias: entry.displayName, score };
        }
    });

    // Find all variants of the best match (same base name, different rarity/element)
    let variants: Mod[] = [];
    if (best) {
        const bestMatch = best as ModScore;
        const baseName = bestMatch.mod.name;
        const baseVariant = bestMatch.mod.variant;

        // Get all mods with same name and variant
        let allVariants = allMods.filter(m =>
            m.name === baseName &&
            (!baseVariant || m.variant === baseVariant)
        );

        // Filter by character element if provided
        if (characterElement) {
            const elementMatchedVariants = allVariants.filter(m =>
                !m.element || m.element === characterElement
            );

            // If we found element-matched variants, use those; otherwise use all
            allVariants = elementMatchedVariants.length > 0 ? elementMatchedVariants : allVariants;
        }

        // Filter by tolerance if provided (±2 tolerance range for flexibility)
        if (tolerance !== undefined && allVariants.length > 1) {
            const toleranceMatchedVariants = allVariants.filter(m =>
                Math.abs(m.tolerance - tolerance) <= 2
            );

            // If we found tolerance-matched variants, use those; otherwise use all
            if (toleranceMatchedVariants.length > 0) {
                console.log(`[OCR Matcher] Filtered ${allVariants.length} variants to ${toleranceMatchedVariants.length} by tolerance ${tolerance}`);
                variants = toleranceMatchedVariants;
            } else {
                variants = allVariants;
            }
        } else {
            variants = allVariants;
        }
    }

    return { best, runnerUp, variants };
};

type SlotCandidate = {
    slotId: string;
    slotIndex: number;
    rawText: string;
    candidates: string[];
    tolerance?: number;
};

const buildSlotCandidates = (slots: OcrSlotResult[]): SlotCandidate[] => {
    return slots.map((slot, idx) => ({
        slotId: slot.slotId,
        slotIndex: idx + 1,
        rawText: slot.rawText,
        candidates: extractCandidateLinesFromSlot(slot),
        tolerance: slot.tolerance,
    }));
};

const mapSlotCandidatesToMatches = (slotCandidates: SlotCandidate[], comparables: ComparableName[], allMods: Mod[], characterElement?: string): OcrMatchResponse => {
    const slots: OcrModSlot[] = slotCandidates.map((slot) => {
        const normalizedCandidates = slot.candidates
            .map((candidate) => ({ raw: candidate, normalized: normalizeOcrModLine(candidate) }))
            .filter((entry) => entry.normalized.length > 0);

        if (normalizedCandidates.length === 0) {
            return {
                slot_index: slot.slotIndex,
                raw_ocr_text: slot.rawText,
                matched: false,
                mod_id: null,
                mod_name: null,
                confidence: 0,
                reason: 'No usable OCR text found for this slot.',
            };
        }

        let chosenCandidate = normalizedCandidates[0];
        let chosenBest: ModScore | null = null;
        let chosenRunnerUp: ModScore | null = null;
        let chosenVariants: Mod[] = [];

        for (const candidate of normalizedCandidates) {
            const match = bestMatchForCandidate(candidate.normalized, comparables, allMods, characterElement, slot.tolerance);
            if (!match.best) continue;
            const isBetter = match.best.score > (chosenBest?.score ?? -1);
            if (!chosenBest || isBetter) {
                chosenCandidate = candidate;
                chosenBest = match.best;
                chosenRunnerUp = match.runnerUp;
                chosenVariants = match.variants;
            }
        }

        if (!chosenBest) {
            return {
                slot_index: slot.slotIndex,
                raw_ocr_text: chosenCandidate.raw,
                matched: false,
                mod_id: null,
                mod_name: null,
                confidence: 0,
                reason: 'No mods available for matching.',
            };
        }

        const bestMatch = chosenBest as ModScore;
        const runnerUp = chosenRunnerUp;
        const confidence = Math.round(bestMatch.score * 1000) / 1000;

        // Multi-tier matching:
        // 1. High confidence: score >= threshold
        // 2. Unambiguous match: best score is significantly better than runner-up (or no runner-up)
        // 3. Keyword match: contains key identifying words
        let matched = bestMatch.score >= MATCH_THRESHOLD;
        let matchReason = '';

        if (!matched && bestMatch.score > 0) {
            // Check if this is an unambiguous match (clear winner)
            const hasNoRunnerUp = !runnerUp || runnerUp.score < 0.01;
            const significantlyBetter = runnerUp && (bestMatch.score > runnerUp.score * 1.5);

            // Check for strong name match (exact substring match)
            // This handles cases where OCR is noisy but the mod name is clearly present
            const candidateNorm = chosenCandidate.normalized;
            const modNameNorm = normalizeOcrModLine(bestMatch.mod.name);
            const isStrongNameMatch = (candidateNorm.includes(modNameNorm) && modNameNorm.length > 3) ||
                (modNameNorm.includes(candidateNorm) && candidateNorm.length > 4);

            // Check for variant match (e.g., "wings inspo" should match "Covenanter's Wings" with variant "Inspo")
            const hasVariantMatch = bestMatch.mod.variant &&
                candidateNorm.includes(normalizeOcrModLine(bestMatch.mod.variant));

            // Check for key identifying words (e.g., "vigilant" is unique enough)
            const keyWords = ['vigilant', 'feathered', 'serpent', 'prime', 'morale', 'seawave', 'midnight', 'typhon', 'nirvana', 'arbiter', 'bahamut', 'cerberus', 'phoenix', 'siren'];
            const hasKeyWord = keyWords.some(word => candidateNorm.includes(word) && modNameNorm.includes(word));

            // Check for partial name match (e.g., "wings inspo" matches "Covenanter's Wings")
            const candidateWords = candidateNorm.split(' ').filter(w => w.length > 2);
            const modNameWords = modNameNorm.split(' ').filter(w => w.length > 2);
            const matchingWords = candidateWords.filter(w => modNameWords.includes(w));
            const hasPartialNameMatch = matchingWords.length >= 2 || (matchingWords.length === 1 && matchingWords[0].length > 5);

            if (hasNoRunnerUp || significantlyBetter) {
                matched = true;
                matchReason = ' (unambiguous match)';
                console.log(`[OCR Matcher] Accepting low-confidence match for slot #${slot.slotIndex}: "${chosenCandidate.raw}" → "${bestMatch.mod.name}" (score ${confidence}, ${hasNoRunnerUp ? 'no runner-up' : 'clear winner'})`);
            } else if (isStrongNameMatch) {
                matched = true;
                matchReason = ' (strong name match)';
                console.log(`[OCR Matcher] Accepting low-confidence match for slot #${slot.slotIndex}: "${chosenCandidate.raw}" → "${bestMatch.mod.name}" (score ${confidence}, strong name match)`);
            } else if (hasVariantMatch && bestMatch.score > 0.20) {
                matched = true;
                matchReason = ' (variant match)';
                console.log(`[OCR Matcher] Accepting low-confidence match for slot #${slot.slotIndex}: "${chosenCandidate.raw}" → "${bestMatch.mod.name}" (score ${confidence}, variant match)`);
            } else if (hasKeyWord && bestMatch.score > 0.10) {
                matched = true;
                matchReason = ' (keyword match)';
                console.log(`[OCR Matcher] Accepting low-confidence match for slot #${slot.slotIndex}: "${chosenCandidate.raw}" → "${bestMatch.mod.name}" (score ${confidence}, keyword match)`);
            } else if (hasPartialNameMatch && bestMatch.score > 0.15) {
                matched = true;
                matchReason = ' (partial name match)';
                console.log(`[OCR Matcher] Accepting low-confidence match for slot #${slot.slotIndex}: "${chosenCandidate.raw}" → "${bestMatch.mod.name}" (score ${confidence}, partial name match)`);
            }
        }

        const hasMultipleVariants = chosenVariants.length > 1;

        const reason = matched
            ? `Matched to "${bestMatch.mod.name}" via "${bestMatch.alias}" (score ${confidence})${matchReason}.${runnerUp ? ` Next best: "${runnerUp.mod.name}" (${runnerUp.score.toFixed(2)}).` : ''}${hasMultipleVariants ? ` (${chosenVariants.length} variants available)` : ''}`
            : `Top candidate "${bestMatch.mod.name}" scored ${confidence}, below confidence threshold ${MATCH_THRESHOLD}.`;

        return {
            slot_index: slot.slotIndex,
            raw_ocr_text: chosenCandidate.raw,
            matched,
            mod_id: matched ? fallbackModId(bestMatch.mod) : null,
            mod_name: matched ? bestMatch.mod.name : null,
            confidence,
            reason,
            hasMultipleVariants: matched && hasMultipleVariants,
            variants: matched && hasMultipleVariants ? chosenVariants : undefined,
        };
    });

    const totalMatched = slots.filter((slot) => slot.matched).length;
    const summary: OcrMatchSummary = {
        total_detected: slots.length,
        total_matched: totalMatched,
        total_unmatched: slots.length - totalMatched,
    };

    return { slots, summary };
};

const mapFreeformCandidatesToMatches = (candidates: string[], comparables: ComparableName[], allMods: Mod[], characterElement?: string): OcrMatchResponse => {
    const normalized = candidates
        .map((candidate) => ({ raw: candidate, normalized: normalizeOcrModLine(candidate) }))
        .filter((entry) => entry.normalized.length > 0);

    const slots: OcrModSlot[] = normalized.map((candidate, idx) => {
        const match = bestMatchForCandidate(candidate.normalized, comparables, allMods, characterElement, undefined);
        if (!match.best) {
            return {
                slot_index: idx + 1,
                raw_ocr_text: candidate.raw,
                matched: false,
                mod_id: null,
                mod_name: null,
                confidence: 0,
                reason: 'No mods available for matching.',
            };
        }

        const bestMatch = match.best as ModScore;
        const runnerUp = match.runnerUp;
        const confidence = Math.round(bestMatch.score * 1000) / 1000;

        // Two-tier matching (same as slot-based matching)
        let matched = bestMatch.score >= MATCH_THRESHOLD;
        let matchReason = '';

        if (!matched && bestMatch.score > 0) {
            const hasNoRunnerUp = !runnerUp || runnerUp.score < 0.01;
            const significantlyBetter = runnerUp && (bestMatch.score > runnerUp.score * 1.5);

            // Check for strong name match (exact substring match)
            const candidateNorm = normalizeOcrModLine(candidate.raw);
            const modNameNorm = normalizeOcrModLine(bestMatch.mod.name);
            const isStrongNameMatch = (candidateNorm.includes(modNameNorm) && modNameNorm.length > 3) ||
                (modNameNorm.includes(candidateNorm) && candidateNorm.length > 4);

            if (hasNoRunnerUp || significantlyBetter) {
                matched = true;
                matchReason = ' (unambiguous match)';
                console.log(`[OCR Matcher] Accepting low-confidence match for candidate #${idx + 1}: "${candidate.raw}" → "${bestMatch.mod.name}" (score ${confidence}, ${hasNoRunnerUp ? 'no runner-up' : 'clear winner'})`);
            } else if (isStrongNameMatch) {
                matched = true;
                matchReason = ' (strong name match)';
                console.log(`[OCR Matcher] Accepting low-confidence match for candidate #${idx + 1}: "${candidate.raw}" → "${bestMatch.mod.name}" (score ${confidence}, strong name match)`);
            }
        }

        const hasMultipleVariants = match.variants.length > 1;

        const reason = matched
            ? `Matched to "${bestMatch.mod.name}" via "${bestMatch.alias}" (score ${confidence})${matchReason}.${runnerUp ? ` Next best: "${runnerUp.mod.name}" (${runnerUp.score.toFixed(2)}).` : ''}${hasMultipleVariants ? ` (${match.variants.length} variants available)` : ''}`
            : `Top candidate "${bestMatch.mod.name}" scored ${confidence}, below confidence threshold ${MATCH_THRESHOLD}.`;

        return {
            slot_index: idx + 1,
            raw_ocr_text: candidate.raw,
            matched,
            mod_id: matched ? fallbackModId(bestMatch.mod) : null,
            mod_name: matched ? bestMatch.mod.name : null,
            confidence,
            reason,
            hasMultipleVariants: matched && hasMultipleVariants,
            variants: matched && hasMultipleVariants ? match.variants : undefined,
        };
    });

    const totalMatched = slots.filter((slot) => slot.matched).length;
    const summary: OcrMatchSummary = {
        total_detected: slots.length,
        total_matched: totalMatched,
        total_unmatched: slots.length - totalMatched,
    };

    return { slots, summary };
};

const coerceSlots = (slots?: OcrSlotResult[]) =>
    (slots || [])
        .map((slot, idx) => ({
            slotId: slot.slotId || `slot-${idx + 1}`,
            rawText: (slot.rawText || '').toString(),
        }))
        .filter((slot) => slot.rawText.trim().length > 0);

export const matchOcrToMods = (args: {
    ocrText?: string;
    ocrSlots?: OcrSlotResult[];
    allMods: Mod[];
    characterElement?: string;
}): OcrMatchResponse => {
    const comparables = buildComparableNames(args.allMods);
    const normalizedSlots = coerceSlots(args.ocrSlots);
    let source: 'slots' | 'text' = 'text';
    let candidates: string[] = [];
    let slotCandidates: SlotCandidate[] = [];

    if (normalizedSlots.length > 0) {
        source = 'slots';
        slotCandidates = buildSlotCandidates(normalizedSlots);
        candidates = slotCandidates.flatMap((slot) => slot.candidates);
    } else if (args.ocrText) {
        candidates = extractModCandidatesFromText(args.ocrText);
    }

    console.log('[OCR Matcher] Candidates:', candidates);

    const normalizedCandidates = candidates.map((candidate) => normalizeOcrModLine(candidate)).filter(Boolean);
    const debug: OcrMatcherDebug = {
        source,
        candidates,
        normalizedCandidates,
        slotCandidates: slotCandidates.length
            ? slotCandidates.map((slot) => ({
                slotId: slot.slotId,
                rawText: slot.rawText,
                candidates: slot.candidates,
            }))
            : undefined,
    };

    let result: OcrMatchResponse;

    if (slotCandidates.length > 0) {
        result = mapSlotCandidatesToMatches(slotCandidates, comparables, args.allMods, args.characterElement);
    } else {
        result = mapFreeformCandidatesToMatches(candidates, comparables, args.allMods, args.characterElement);
    }

    // Log matching summary
    console.log(`[OCR Matcher] ✅ Matching complete: ${result.summary.total_matched}/${result.summary.total_detected} matched`);
    result.slots.forEach((slot) => {
        if (slot.matched) {
            console.log(`  ✓ Slot #${slot.slot_index}: "${slot.raw_ocr_text}" → ${slot.mod_name} (confidence: ${(slot.confidence * 100).toFixed(0)}%)`);
        } else {
            console.log(`  ✗ Slot #${slot.slot_index}: "${slot.raw_ocr_text}" → No match (best: ${(slot.confidence * 100).toFixed(0)}%)`);
        }
    });

    return { ...result, debug };
};

export const matchOcrMods = (ocrText: string, mods: Mod[], characterElement?: string): OcrMatchResponse => {
    return matchOcrToMods({ ocrText, allMods: mods, characterElement });
};

export const matchOcrSlots = (slots: OcrSlotText[], mods: Mod[], characterElement?: string): OcrMatchResponse => {
    const normalizedSlots: OcrSlotResult[] = slots.map((slot, idx) => ({
        slotId: slot.slotId || `slot-${idx + 1}`,
        rawText: slot.text,
    }));

    return matchOcrToMods({
        ocrText: slots.map((slot) => slot.text).join('\n'),
        ocrSlots: normalizedSlots,
        allMods: mods,
        characterElement,
    });
};
