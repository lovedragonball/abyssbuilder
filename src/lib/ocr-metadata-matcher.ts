/**
 * OCR Metadata Matcher
 * 
 * เปรียบเทียบ mod names ที่ Gemini อ่านได้กับ metadata จากรูปตัวอย่าง
 * เพื่อหาจุดที่ซ้ำกันและเพิ่มความมั่นใจในการ match
 */

import metadata from '../../DW Image/metadata.json';

export type ImageMetadata = {
  mods: string[];
  processedAt?: string;
  error?: string;
  rawText?: string;
};

export type SimilarityResult = {
  imagePath: string;
  matchedMods: string[];
  matchCount: number;
  totalMods: number;
  similarity: number; // 0-1
};

/**
 * คำนวณความคล้ายคลึงระหว่าง 2 string (Levenshtein distance)
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1.0;
  
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1.0;
  
  // Levenshtein distance
  const matrix: number[][] = [];
  
  for (let i = 0; i <= s2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= s1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= s2.length; i++) {
    for (let j = 1; j <= s1.length; j++) {
      const cost = s2[i - 1] === s1[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  
  const distance = matrix[s2.length][s1.length];
  return Math.max(0, 1 - distance / maxLen);
}

/**
 * ตรวจสอบว่า 2 mod names ตรงกันหรือไม่ (fuzzy matching)
 */
function isModMatch(mod1: string, mod2: string, threshold: number = 0.8): boolean {
  const similarity = calculateStringSimilarity(mod1, mod2);
  return similarity >= threshold;
}

/**
 * หา mod names ที่ซ้ำกันระหว่าง OCR result กับ metadata
 */
export function findMatchingMods(
  ocrMods: string[],
  metadataMods: string[],
  threshold: number = 0.8
): string[] {
  const matches: string[] = [];
  
  for (const ocrMod of ocrMods) {
    for (const metaMod of metadataMods) {
      if (isModMatch(ocrMod, metaMod, threshold)) {
        matches.push(ocrMod);
        break; // Found a match, move to next OCR mod
      }
    }
  }
  
  return matches;
}

/**
 * หารูปที่คล้ายกันที่สุดจาก metadata
 */
export function findSimilarImages(
  ocrMods: string[],
  topN: number = 5
): SimilarityResult[] {
  const results: SimilarityResult[] = [];
  
  // Get metadata images
  const images = metadata.images as Record<string, ImageMetadata>;
  
  for (const [imagePath, imageData] of Object.entries(images)) {
    if (!imageData.mods || imageData.mods.length === 0) {
      continue; // Skip images without metadata
    }
    
    // Find matching mods
    const matchedMods = findMatchingMods(ocrMods, imageData.mods);
    const matchCount = matchedMods.length;
    const totalMods = Math.max(ocrMods.length, imageData.mods.length);
    const similarity = totalMods > 0 ? matchCount / totalMods : 0;
    
    results.push({
      imagePath,
      matchedMods,
      matchCount,
      totalMods,
      similarity,
    });
  }
  
  // Sort by similarity (highest first)
  results.sort((a, b) => b.similarity - a.similarity);
  
  // Return top N
  return results.slice(0, topN);
}

/**
 * สร้าง confidence boost สำหรับ mod names ที่พบใน metadata
 */
export function getConfidenceBoost(
  modName: string,
  similarImages: SimilarityResult[]
): number {
  let boost = 0;
  
  for (const image of similarImages) {
    // Check if this mod appears in the similar image
    const found = image.matchedMods.some(m => isModMatch(modName, m, 0.8));
    
    if (found) {
      // Boost based on image similarity
      boost += image.similarity * 0.1; // Max 10% boost per image
    }
  }
  
  return Math.min(boost, 0.3); // Cap at 30% total boost
}

/**
 * ปรับปรุง OCR results ด้วย metadata matching
 */
export function enhanceOcrWithMetadata(
  ocrMods: string[],
  ocrConfidences: number[]
): {
  enhancedMods: string[];
  enhancedConfidences: number[];
  similarImages: SimilarityResult[];
  insights: string[];
} {
  const insights: string[] = [];
  
  // Find similar images
  const similarImages = findSimilarImages(ocrMods, 3);
  
  if (similarImages.length > 0 && similarImages[0].similarity > 0.3) {
    insights.push(
      `Found ${similarImages[0].matchCount} matching mods with reference image: ${similarImages[0].imagePath}`
    );
  }
  
  // Enhance confidences
  const enhancedConfidences = ocrConfidences.map((confidence, index) => {
    const modName = ocrMods[index];
    const boost = getConfidenceBoost(modName, similarImages);
    
    if (boost > 0) {
      insights.push(
        `Boosted confidence for "${modName}" by ${(boost * 100).toFixed(0)}% (found in similar images)`
      );
    }
    
    return Math.min(confidence + boost, 1.0); // Cap at 100%
  });
  
  return {
    enhancedMods: ocrMods,
    enhancedConfidences,
    similarImages,
    insights,
  };
}

/**
 * Get all available metadata
 */
export function getAllMetadata(): Record<string, ImageMetadata> {
  return metadata.images as Record<string, ImageMetadata>;
}

/**
 * Get metadata for specific image
 */
export function getImageMetadata(imagePath: string): ImageMetadata | null {
  const images = metadata.images as Record<string, ImageMetadata>;
  return images[imagePath] || null;
}

/**
 * Get statistics about metadata
 */
export function getMetadataStats() {
  const images = metadata.images as Record<string, ImageMetadata>;
  const entries = Object.entries(images);
  
  const total = entries.length;
  const processed = entries.filter(([_, data]) => data.mods && data.mods.length > 0).length;
  const withErrors = entries.filter(([_, data]) => data.error).length;
  
  const allMods = entries.flatMap(([_, data]) => data.mods || []);
  const uniqueMods = new Set(allMods.map(m => m.toLowerCase()));
  
  return {
    totalImages: total,
    processedImages: processed,
    imagesWithErrors: withErrors,
    totalModInstances: allMods.length,
    uniqueModNames: uniqueMods.size,
  };
}
