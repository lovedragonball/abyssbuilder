import { NextResponse } from 'next/server';
import { matchOcrToMods, type OcrSlotResult } from '@/lib/ocr-matcher';
import { allMods } from '@/lib/data';
import type { Mod } from '@/lib/types';

const parseModDatabase = (mods: unknown): Mod[] => {
    if (!Array.isArray(mods)) return [];

    return mods
        .filter((entry): entry is Mod => Boolean(entry) && typeof (entry as any).name === 'string')
        .map((entry) => {
            const mod = entry as Mod;
            return {
                ...mod,
                name: String(mod.name),
                id: mod.id ? String(mod.id) : String(mod.name),
                variant: mod.variant ? String(mod.variant) : undefined,
            };
        });
};

const parseSlotArray = (slots: unknown): OcrSlotResult[] => {
    if (!Array.isArray(slots)) return [];
    return slots
        .map((slot, idx) => {
            const slotIdRaw = (slot as any)?.slotId ?? (slot as any)?.id;
            const rawText = (slot as any)?.rawText ?? (slot as any)?.text;
            const slotId = typeof slotIdRaw === 'string' && slotIdRaw.trim().length > 0 ? slotIdRaw : `slot-${idx + 1}`;
            const text = typeof rawText === 'string' ? rawText : '';
            return { slotId, rawText: text };
        })
        .filter((slot): slot is OcrSlotResult => slot.rawText.trim().length > 0);
};

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { ocrText, mods, modDatabase, slotTexts, ocrSlots, characterElement } = body ?? {};

        const providedMods = parseModDatabase(mods || modDatabase);
        const database = providedMods.length > 0 ? providedMods : allMods;

        const parsedOcrSlots = parseSlotArray(ocrSlots);
        const legacySlots = parsedOcrSlots.length > 0 ? [] : parseSlotArray(slotTexts);
        const slotsToUse = parsedOcrSlots.length > 0 ? parsedOcrSlots : legacySlots;
        const textToUse = typeof ocrText === 'string' ? ocrText : undefined;
        const elementToUse = typeof characterElement === 'string' ? characterElement : undefined;

        if ((!textToUse || textToUse.length === 0) && slotsToUse.length === 0) {
            return NextResponse.json(
                { error: 'Missing or invalid OCR payload. Provide \"ocrText\" as a string or \"ocrSlots\"/\"slotTexts\" as an array.' },
                { status: 400 }
            );
        }

        const result = matchOcrToMods({
            ocrText: textToUse,
            ocrSlots: slotsToUse,
            allMods: database,
            characterElement: elementToUse,
        });

        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json(
            {
                error: 'Unable to process request body.',
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 400 }
        );
    }
}
