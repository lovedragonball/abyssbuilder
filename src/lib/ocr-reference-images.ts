/**
 * OCR Reference Images System
 * 
 * ใช้รูปตัวอย่างจริงจากเกมเป็น reference สำหรับ Gemini Vision API
 * เพื่อเพิ่มความแม่นยำในการอ่าน mod cards
 */

export type ReferenceImageType = 'character' | 'weapon';

export type ReferenceImage = {
  type: ReferenceImageType;
  path: string;
  base64?: string;
};

/**
 * รายการ reference images ที่จะใช้
 * (ต้องคัดลอกรูปจาก DW Image folder มาไว้ใน public/ocr-references/)
 */
export const REFERENCE_IMAGES: Record<ReferenceImageType, string[]> = {
  character: [
    '/ocr-references/character/example-1.png',
    '/ocr-references/character/example-2.png',
  ],
  weapon: [
    '/ocr-references/weapon/example-1.png',
    '/ocr-references/weapon/example-2.png',
  ],
};

/**
 * โหลด reference images เป็น base64
 * (ใช้ใน client-side)
 */
export async function loadReferenceImages(
  type: ReferenceImageType
): Promise<string[]> {
  const paths = REFERENCE_IMAGES[type];
  const base64Images: string[] = [];

  for (const path of paths) {
    try {
      const response = await fetch(path);
      const blob = await response.blob();
      const base64 = await blobToBase64(blob);
      base64Images.push(base64);
    } catch (error) {
      console.warn(`⚠️ [Reference] Failed to load ${path}:`, error);
      // ถ้าโหลดไม่ได้ ข้ามไป (ไม่ให้ระบบล้ม)
    }
  }

  return base64Images;
}

/**
 * แปลง Blob เป็น base64
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * ตรวจสอบว่า reference images พร้อมใช้งานหรือไม่
 */
export async function checkReferenceImagesAvailable(
  type: ReferenceImageType
): Promise<boolean> {
  const paths = REFERENCE_IMAGES[type];

  try {
    const response = await fetch(paths[0], { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * สร้าง prompt สำหรับ few-shot learning
 */
export function createFewShotPrompt(hasReferences: boolean): string {
  const basePrompt = `You are reading mod cards from a game screenshot. There are 9 mod slots arranged as:
- LEFT column: 4 slots (top to bottom)
- CENTER: 1 slot
- RIGHT column: 4 slots (top to bottom)

For EACH mod card, carefully read:
1. COMPLETE mod name (Blaze, Nirvana, Wings, Prime, Standfast, Feathered Serpent Vigilant, etc.)
2. Variant/suffix if present (Morale, Uplift, Blessing, Volition, Inspo, Spectrum, etc.)
3. Level if visible (+5, +10)
4. Tolerance number (shown on the card, typically 9-28)`;

  if (hasReferences) {
    return `${basePrompt}

IMPORTANT: The first 2 images show EXAMPLES of how mod cards look in this game.
Study these examples carefully to understand:
- The visual layout and design of mod cards
- How mod names are displayed
- Where tolerance numbers appear
- The overall style and format

Now, read the mod cards from the THIRD image (the user's screenshot) using the same format you see in the examples.

CRITICAL INSTRUCTIONS:
1. Read SLOWLY and CAREFULLY - accuracy is more important than speed
2. Look at EACH card individually
3. Output format: "ModName | Tolerance"
4. One mod per line, in order (left to right, top to bottom)
5. If a slot is empty (no mod card), write "empty"
6. NO explanations, NO "Slot 1:", NO numbering, NO extra text

EXAMPLE CORRECT OUTPUT:
Standfast +5 | 16
Nirvana +5 | 10
Prime • Uplift | 24
empty
Feathered Serpent Steadfast | 12
Standfast | 16
Onslaught +5 | 17
empty
Nirvana • Blessing +5 | 10

Now carefully read ALL 9 mod slots from the third image (format: "ModName | Tolerance"):`;
  }

  return `${basePrompt}

CRITICAL INSTRUCTIONS:
1. Read SLOWLY and CAREFULLY - accuracy is more important than speed
2. Look at EACH card individually
3. Output format: "ModName | Tolerance"
4. One mod per line, in order (left to right, top to bottom)
5. If a slot is empty (no mod card), write "empty"
6. NO explanations, NO "Slot 1:", NO numbering, NO extra text

COMMON MOD NAMES TO RECOGNIZE:
- Nirvana, Wings, Blaze, Standfast, Scorch
- Prime (with variants: Morale, Uplift, Serenity, etc.)
- Onslaught, Duel, Surge, Trapped
- Feathered Serpent Steadfast, Feathered Serpent Vigilant
- Inspo, Spectrum, Volition
- Celerity, Focus, Impetus, Rage, Crusher, Edge
- Misty Veil, Frosty Torrent, Illusionary Sacrifice

EXAMPLE CORRECT OUTPUT:
Standfast +5 | 16
Nirvana +5 | 10
Prime • Uplift | 24
empty
Feathered Serpent Steadfast | 12
Standfast | 16
Onslaught +5 | 17
empty
Nirvana • Blessing +5 | 10

Now carefully read ALL 9 mod slots (format: "ModName | Tolerance"):`;
}
