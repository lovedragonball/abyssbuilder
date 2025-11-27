/**
 * Google Gemini Vision API for OCR
 * 
 * Uses Gemini 2.5 Flash Lite model for fast and accurate text extraction.
 * Includes retry mechanism with exponential backoff for rate limiting.
 */

import { NextRequest, NextResponse } from 'next/server';

// Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyAjYoAl-au_PeadtbsVcVgmIctCqypPTK0';
const GEMINI_MODEL = 'gemini-2.0-flash-exp'; // Gemini 2.5 Flash Lite
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

export async function POST(request: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'Gemini API key not configured' },
      { status: 500 }
    );
  }

  try {
    const { image, referenceImages } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    const hasReferences = referenceImages && referenceImages.length > 0;
    console.log('🤖 [Gemini Vision] Sending image to Gemini 2.5 Flash Lite... (with ' + (hasReferences ? referenceImages.length : 0) + ' reference images)');

    // Remove data URL prefix if present
    let base64Image = image;
    if (image.includes(',')) {
      base64Image = image.split(',')[1];
    }

    // Determine image format
    let mimeType = 'image/png';
    if (image.includes('image/jpeg') || image.includes('image/jpg')) {
      mimeType = 'image/jpeg';
    } else if (image.includes('image/webp')) {
      mimeType = 'image/webp';
    }

    // Process reference images
    const processedReferences: Array<{ base64: string; mimeType: string }> = hasReferences
      ? referenceImages.map((refImg: string) => {
        let base64 = refImg;
        let refMimeType = 'image/png';

        if (refImg.includes(',')) {
          base64 = refImg.split(',')[1];
        }

        if (refImg.includes('image/jpeg') || refImg.includes('image/jpg')) {
          refMimeType = 'image/jpeg';
        } else if (refImg.includes('image/webp')) {
          refMimeType = 'image/webp';
        }

        return { base64, mimeType: refMimeType };
      })
      : [];

    // Build parts array for Gemini API
    const parts: any[] = [];

    // Add prompt text - simplified and more direct
    const referenceCount = processedReferences.length;
    let prompt: string;

    if (hasReferences) {
      prompt = 'Read ALL mod cards from the LAST image.\n\n' +
        'The first ' + referenceCount + ' image(s) are EXAMPLES showing how mod cards look.\n' +
        'The LAST image is what you need to read.\n\n' +
        'LAYOUT: Cards are arranged in a grid pattern. Look carefully at EVERY position:\n' +
        '- Top row (left to right): positions 1, 2, 3, 4\n' +
        '- Middle: position 5 (center)\n' +
        '- Bottom row (left to right): positions 6, 7, 8, 9\n\n' +
        'For EACH card you see:\n' +
        '1. Read the TEXT BELOW the card icon (this is the mod name)\n' +
        '2. Look for a small number in the TOP-LEFT corner of the card icon (this is tolerance, usually 5-30)\n' +
        '3. Note the level if shown (like +5, +10)\n\n' +
        'OUTPUT FORMAT (one line per card):\n' +
        'Position | Mod Name | Tolerance\n\n' +
        'EXAMPLES:\n' +
        '1 | Prime • Serenity +5 | 12\n' +
        '2 | Skylume • Wildfire +5 | 11\n' +
        '3 | Scorch +5 | 8\n' +
        '4 | Scorch +5 | 8\n' +
        '5 | Vigilant +5 | 14\n' +
        '6 | Wings • Inspo +5 | 19\n' +
        '7 | Spectrum +5 | 9\n\n' +
        'IMPORTANT:\n' +
        '- Count ALL cards you see - if you see 7 cards, output 7 lines\n' +
        '- If tolerance number is hard to read, make your best guess (usually 5-30)\n' +
        '- If a card shows 2 names combined, use • between them\n' +
        '- If a slot is empty, write "empty"\n' +
        '- Output ONLY the data, no explanations\n\n' +
        'Now read ALL cards from the LAST image:';
    } else {
      prompt = 'Read ALL mod cards from this image.\n\n' +
        'LAYOUT: Cards are arranged in a grid. Look at EVERY position:\n' +
        '- Top row (left to right): positions 1, 2, 3, 4\n' +
        '- Middle: position 5 (center)\n' +
        '- Bottom row (left to right): positions 6, 7, 8, 9\n\n' +
        'For EACH card:\n' +
        '1. Read the TEXT BELOW the card icon (mod name)\n' +
        '2. Find the small number in TOP-LEFT corner of icon (tolerance, usually 5-30)\n' +
        '3. Note the level if shown (+5, +10)\n\n' +
        'OUTPUT FORMAT:\n' +
        'Position | Mod Name | Tolerance\n\n' +
        'EXAMPLES:\n' +
        '1 | Prime • Serenity +5 | 12\n' +
        '2 | Skylume • Wildfire +5 | 11\n' +
        '3 | Scorch +5 | 8\n' +
        '4 | Scorch +5 | 8\n' +
        '5 | Vigilant +5 | 14\n' +
        '6 | Wings • Inspo +5 | 19\n' +
        '7 | Spectrum +5 | 9\n\n' +
        'IMPORTANT:\n' +
        '- Count ALL cards - if you see 7 cards, output 7 lines\n' +
        '- Guess tolerance if unclear (usually 5-30)\n' +
        '- Use • for combined names\n' +
        '- Write "empty" for empty slots\n' +
        '- Data only, no explanations\n\n' +
        'Read ALL cards now:';
    }

    parts.push({ text: prompt });

    // Add reference images first (if any)
    if (hasReferences) {
      for (const ref of processedReferences) {
        parts.push({
          inline_data: {
            mime_type: ref.mimeType,
            data: ref.base64,
          },
        });
      }
    }

    // Add user's image last
    parts.push({
      inline_data: {
        mime_type: mimeType,
        data: base64Image,
      },
    });

    // Call Gemini API with retry mechanism
    const response = await callGeminiWithRetry(async () => {
      return fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/' + GEMINI_MODEL + ':generateContent?key=' + GEMINI_API_KEY,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: parts,
              },
            ],
            generationConfig: {
              temperature: 0.2, // Increased for better detection (was 0.05)
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048, // Increased for more mods
            },
          }),
        }
      );
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ [Gemini Vision] API error:', error);
      return NextResponse.json(
        { error: error.error?.message || 'Gemini API error' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Extract text from Gemini response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    console.log('✅ [Gemini Vision] Response received');
    console.log('📝 [Gemini Vision] Raw response length:', text.length);
    console.log('📝 [Gemini Vision] First 500 chars:', text.substring(0, 500));

    // Parse mod names and tolerance from response
    const modData = extractModData(text);

    console.log('📊 [Gemini Parser] Extracted mod data:', JSON.stringify(modData, null, 2));

    // Warning if no mods detected
    if (modData.length === 0) {
      console.warn('⚠️ [Gemini Parser] No mods detected! Full response:', text);
    }

    // Enhance with metadata matching (if available)
    let metadataInsights: string[] = [];
    let similarImages: any[] = [];

    try {
      // Dynamic import to avoid build issues if metadata doesn't exist yet
      const { enhanceOcrWithMetadata } = await import('@/lib/ocr-metadata-matcher');

      const modNames = modData.map(m => m.name);
      const confidences = modData.map(() => 0.8); // Default confidence

      const enhanced = enhanceOcrWithMetadata(modNames, confidences);
      metadataInsights = enhanced.insights;
      similarImages = enhanced.similarImages;

      if (metadataInsights.length > 0) {
        console.log('📊 [Metadata] Insights:', metadataInsights);
      }
    } catch (error) {
      // Metadata not available yet, skip enhancement
      console.log('⚠️ [Metadata] Not available, skipping enhancement');
    }

    return NextResponse.json({
      text,
      modNames: modData.map(m => m.name),
      modData: modData,
      raw: text,
      ...(metadataInsights.length > 0 && { metadataInsights }),
      ...(similarImages.length > 0 && { similarImages }),
    });
  } catch (error) {
    console.error('❌ [Gemini Vision] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Health check
  return NextResponse.json({
    status: 'ok',
    model: GEMINI_MODEL,
    configured: true,
  });
}

/**
 * Call Gemini API with retry mechanism for rate limiting
 */
async function callGeminiWithRetry(
  apiCall: () => Promise<Response>,
  retryCount: number = 0
): Promise<Response> {
  try {
    const response = await apiCall();

    // If rate limited (429), retry with exponential backoff
    if (response.status === 429 && retryCount < MAX_RETRIES) {
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
      const jitter = Math.random() * 1000;
      const totalDelay = delay + jitter;

      console.warn(
        '⚠️ [Gemini] Rate limited (429). Retry ' + (retryCount + 1) + '/' + MAX_RETRIES + ' in ' + Math.round(totalDelay) + 'ms...'
      );

      await new Promise(resolve => setTimeout(resolve, totalDelay));
      return callGeminiWithRetry(apiCall, retryCount + 1);
    }

    return response;
  } catch (error) {
    // Network errors - retry
    if (retryCount < MAX_RETRIES) {
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
      console.warn(
        '⚠️ [Gemini] Network error. Retry ' + (retryCount + 1) + '/' + MAX_RETRIES + ' in ' + delay + 'ms...'
      );

      await new Promise(resolve => setTimeout(resolve, delay));
      return callGeminiWithRetry(apiCall, retryCount + 1);
    }

    throw error;
  }
}

/**
 * Extract mod data (position, name, and tolerance) from Gemini response
 */
const MIN_TOLERANCE = 5;
const MAX_TOLERANCE = 40;

const isValidTolerance = (value: number) =>
  !isNaN(value) && value >= MIN_TOLERANCE && value <= MAX_TOLERANCE;

const extractToleranceFromText = (text: string): number | undefined => {
  let tolerance: number | undefined;
  const numbers: number[] = [];

  // First, try to find tolerance in parentheses or after "tolerance:" or "|"
  const tolerancePatterns = [
    /tolerance[:\s]*(\d{1,2})/i,
    /\((\d{1,2})\)/,
    /\|\s*(\d{1,2})\s*$/,
  ];

  for (const pattern of tolerancePatterns) {
    const match = text.match(pattern);
    if (match) {
      const candidate = parseInt(match[1], 10);
      if (isValidTolerance(candidate)) {
        return candidate;
      }
    }
  }

  // Extract all numbers from text
  for (const match of text.matchAll(/(\d{1,2})/g)) {
    const index = match.index ?? 0;
    const prevChar = index > 0 ? text[index - 1] : '';

    // Skip level numbers like "+5"
    if (prevChar === '+') {
      continue;
    }

    const candidate = parseInt(match[1], 10);
    numbers.push(candidate);

    if (isValidTolerance(candidate)) {
      tolerance = candidate; // keep last valid to favor trailing tolerance
    }
  }

  // If no valid tolerance found but we have numbers, log them
  if (!tolerance && numbers.length > 0) {
    console.log(`⚠️ [Tolerance] No valid tolerance in "${text}", found numbers: ${numbers.join(', ')}`);
  }

  return tolerance;
};

const cleanNameText = (text: string): string =>
  text
    .replace(/\|\s*\d{1,2}\s*$/, '')
    .replace(/\(\s*\d{1,2}\s*\)\s*$/, '')
    .trim();

function extractModData(text: string): Array<{ name: string; tolerance?: number; position?: number }> {
  const lines = text.split('\n');
  const modData: Array<{ name: string; tolerance?: number; position?: number }> = [];
  const seenPositions = new Set<number>();

  console.log('🔍 [Parser] Parsing Gemini response:', text);

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) {
      continue;
    }

    // Skip common header/explanation phrases (more lenient)
    const lowerLine = trimmed.toLowerCase();
    if (
      lowerLine.includes('รูปแบบการตอบ') ||
      lowerLine.includes('ตัวอย่าง') ||
      lowerLine.includes('สำคัญมาก') ||
      lowerLine.includes('เริ่มอ่าน') ||
      trimmed.startsWith('#') ||
      trimmed.startsWith('**') ||
      trimmed.startsWith('```')
    ) {
      continue;
    }

    // Remove bullet points and numbering
    let cleaned = trimmed
      .replace(/^[-*•]\s*/, '') // Remove bullet points
      .trim();

    // Handle "slot-1: Name (+tol)" formats
    const slotPrefixMatch = cleaned.match(/^(?:slot|position|ตำแหน่ง)\s*[-#:]*\s*(\d{1,2})\s*[:.)-]?\s*(.+)$/i);
    if (slotPrefixMatch) {
      const position = parseInt(slotPrefixMatch[1], 10);
      if (seenPositions.has(position)) {
        continue;
      }

      const rest = slotPrefixMatch[2].trim();
      const name = cleanNameText(rest);
      const tolerance = extractToleranceFromText(rest);

      if (name.toLowerCase() !== 'empty' && !isNaN(position) && position >= 1 && position <= 9 && name.length >= 2) {
        seenPositions.add(position);
        if (tolerance !== undefined && isValidTolerance(tolerance)) {
          modData.push({ name, tolerance, position });
          console.log(`✅ [Parser] Slot ${position}: "${name}" (tolerance: ${tolerance})`);
        } else {
          modData.push({ name, position });
          console.log(`✅ [Parser] Slot ${position}: "${name}" (no tolerance)`);
        }
      }

      continue;
    }

    // Try to parse new format: "Position | ModName | Tolerance"
    const parts = cleaned.split('|').map(p => p.trim());

    if (parts.length === 3) {
      const position = parseInt(parts[0], 10);
      const name = parts[1];
      const tolerance = parseInt(parts[2], 10);

      // Skip "empty" slots
      if (name.toLowerCase() === 'empty' || name.toLowerCase() === 'ว่าง') {
        console.log(`⏭️ [Parser] Skipping empty slot ${position}`);
        continue;
      }

      if (!isNaN(position) && seenPositions.has(position)) {
        console.log(`⚠️ [Parser] Duplicate position ${position}, skipping`);
        continue;
      }

      // Valid position, name, and tolerance (more lenient - accept 2+ chars)
      if (!isNaN(position) && position >= 1 && position <= 9 && name.length >= 2) {
        seenPositions.add(position);
        if (isValidTolerance(tolerance)) {
          modData.push({ name, tolerance, position });
          console.log(`✅ [Parser] Slot ${position}: "${name}" (tolerance: ${tolerance})`);
        } else {
          // Invalid tolerance, just use name and position
          modData.push({ name, position });
          console.log(`✅ [Parser] Slot ${position}: "${name}" (invalid tolerance: ${tolerance})`);
        }
      } else {
        console.log(`⚠️ [Parser] Invalid data - position: ${position}, name: "${name}" (length: ${name.length})`);
      }
    } else if (parts.length === 2) {
      // Fallback to old format: "ModName | Tolerance"
      const name = parts[0];
      const tolerance = parseInt(parts[1], 10);

      // Skip "empty" slots
      if (name.toLowerCase() === 'empty' || name.toLowerCase() === 'ว่าง') {
        console.log(`⏭️ [Parser] Skipping empty slot (no position)`);
        continue;
      }

      if (name.length >= 2 && /[a-zA-Z]/.test(name)) {
        if (isValidTolerance(tolerance)) {
          modData.push({ name, tolerance });
          console.log(`✅ [Parser] Mod: "${name}" (tolerance: ${tolerance})`);
        } else {
          modData.push({ name });
          console.log(`✅ [Parser] Mod: "${name}" (no valid tolerance)`);
        }
      }
    } else {
      // Try to extract position from start of line (e.g., "1. Mod Name" or "1) Mod Name")
      const positionMatch = cleaned.match(/^(\d{1,2})[\.\):\s]+(.+)$/);
      if (positionMatch) {
        const position = parseInt(positionMatch[1], 10);
        const rest = positionMatch[2].trim();

        if (!seenPositions.has(position) && position >= 1 && position <= 9) {
          const name = cleanNameText(rest);
          const tolerance = extractToleranceFromText(rest);

          if (name.toLowerCase() !== 'empty' && name.toLowerCase() !== 'ว่าง' && name.length >= 2) {
            seenPositions.add(position);
            if (tolerance !== undefined && isValidTolerance(tolerance)) {
              modData.push({ name, tolerance, position });
              console.log(`✅ [Parser] Slot ${position}: "${name}" (tolerance: ${tolerance})`);
            } else {
              modData.push({ name, position });
              console.log(`✅ [Parser] Slot ${position}: "${name}" (no tolerance)`);
            }
            continue;
          }
        }
      }

      // Fallback: keep any meaningful line as a mod name (more lenient)
      if (cleaned.length >= 2 && /[a-zA-Z]/.test(cleaned)) {
        modData.push({ name: cleaned });
        console.log(`✅ [Parser] Fallback mod: "${cleaned}"`);
      }
    }
  }

  console.log(`📊 [Parser] Total mods extracted: ${modData.length}`);
  return modData;
}
