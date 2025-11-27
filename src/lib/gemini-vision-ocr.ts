/**
 * Google Gemini Vision API for OCR
 * 
 * Uses Gemini 2.5 Flash Lite to read text from images.
 * Very fast and accurate for OCR tasks.
 */

export type GeminiModData = {
  name: string;
  tolerance?: number;
  position?: number; // Slot position (1-9)
};

export type GeminiVisionResult = {
  text: string;
  modNames: string[];
  modData?: GeminiModData[];
  raw: string;
  needsClarification?: Array<{
    index: number;
    originalName: string;
    type: 'scorch' | 'other';
  }>;
};

/**
 * Normalize mod names and detect special cases
 */
function normalizeModNames(modNames: string[]): {
  normalized: string[];
  needsClarification: Array<{ index: number; originalName: string; type: 'scorch' | 'other' }>;
} {
  const normalized: string[] = [];
  const needsClarification: Array<{ index: number; originalName: string; type: 'scorch' | 'other' }> = [];

  modNames.forEach((name, index) => {
    const lowerName = name.toLowerCase().trim();

    // Rule 1: vigilant+5 → Feathered Serpent's Vigilant
    if (lowerName.includes('vigilant') && lowerName.includes('+5')) {
      normalized.push("Feathered Serpent's Vigilant");
      return;
    }

    // Rule 2: scorch → needs clarification
    if (lowerName.includes('scorch')) {
      normalized.push(name); // Keep original for now
      needsClarification.push({
        index,
        originalName: name,
        type: 'scorch',
      });
      return;
    }

    // Default: keep as is
    normalized.push(name);
  });

  return { normalized, needsClarification };
}

/**
 * Extract mod names from image using Gemini Vision API
 * 
 * @param imageBase64 - Base64 encoded image (with or without data URL prefix)
 * @param referenceImages - Optional reference images for few-shot learning
 * @returns Extracted text and parsed mod names
 */
export async function ocrWithGeminiVision(
  imageBase64: string,
  referenceImages?: string[]
): Promise<GeminiVisionResult> {
  // Call our API route
  const response = await fetch('/api/gemini-vision-ocr', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image: imageBase64,
      referenceImages: referenceImages || [],
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'Gemini Vision API failed');
  }

  const result = await response.json();
  
  // Normalize mod names and detect special cases
  const { normalized, needsClarification } = normalizeModNames(result.modNames);

  return {
    ...result,
    modNames: normalized,
    needsClarification: needsClarification.length > 0 ? needsClarification : undefined,
  };
}

/**
 * Check if Gemini Vision API is available
 */
export async function isGeminiVisionAvailable(): Promise<boolean> {
  try {
    const response = await fetch('/api/gemini-vision-ocr/health');
    return response.ok;
  } catch {
    return false;
  }
}
