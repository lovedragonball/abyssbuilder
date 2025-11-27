'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Image as ImageIcon, Loader2, Upload, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { OcrMatchResponse, OcrSlotResult, OcrModSlot } from '@/lib/ocr-matcher';
import { allMods } from '@/lib/data';
import { ocrWithGeminiVision } from '@/lib/gemini-vision-ocr';
import { ModVariantSelector } from '@/components/ModVariantSelector';
import { OCRLoadingAnimation } from '@/components/OCRLoadingAnimation';
import { OCRReferenceToggle } from '@/components/OCRReferenceToggle';
import { retryWithBackoff } from '@/lib/rate-limiter';
import { loadReferenceImages, checkReferenceImagesAvailable } from '@/lib/ocr-reference-images';
import type { Mod } from '@/lib/types';

type OCRStatus = 'idle' | 'recognizing' | 'matching' | 'success' | 'error';

// SlotOCRResult type definition
export type SlotOCRResult = {
  slotId: string;
  rawText: string;
  lines: Array<{ text: string; confidence: number }>;
  candidates: string[];
  tolerance?: number;
};

interface OCRImagePasteProps {
  onOcrSuccess?: (result: OcrMatchResponse) => void;
  characterElement?: string;
  characterName?: string;
  disabled?: boolean;
}

// Removed ScorchClarification type - now handled through variant selector

// Simple scoring function for low confidence matching with special keyword handling
const computeSimpleScore = (ocrText: string, mod: Mod): number => {
  const ocr = ocrText.toLowerCase().trim();
  const name = mod.name.toLowerCase().trim();
  const variant = mod.variant?.toLowerCase() || '';

  // Special keyword handling
  const ocrWords = ocr.split(/[\s•·]+/).filter(w => w.length > 2);

  // Check for "wings" + "inspo" pattern
  const hasWings = ocrWords.some(w => w.includes('wing'));
  const hasInspo = ocrWords.some(w => w.includes('inspo'));

  if (hasWings && hasInspo) {
    // Boost mods that have both "wings" in name AND "inspo" in variant
    if (name.includes('wing') && variant.includes('inspo')) {
      return 0.95;
    }
    // Also boost mods with "wings" in name (any variant)
    if (name.includes('wing')) {
      return 0.85;
    }
    // Also boost mods with "inspo" variant (like Siren's Inspo)
    if (variant.includes('inspo')) {
      return 0.80;
    }
  }

  // Check for "wings" only
  if (hasWings && !hasInspo) {
    if (name.includes('wing')) {
      return 0.90;
    }
  }

  // Check for "spectrum" keyword
  const hasSpectrum = ocrWords.some(w => w.includes('spectrum'));
  if (hasSpectrum) {
    if (name.includes('spectrum') || variant.includes('spectrum')) {
      return 0.90;
    }
  }

  // Check for "vigilant" keyword
  const hasVigilant = ocrWords.some(w => w.includes('vigilant'));
  if (hasVigilant) {
    if (name.includes('vigilant')) {
      return 0.95;
    }
  }

  // Check for "prime" keyword
  const hasPrime = ocrWords.some(w => w.includes('prime'));
  if (hasPrime) {
    if (name.includes('prime')) {
      return 0.85;
    }
  }

  // Check for "nirvana" keyword
  const hasNirvana = ocrWords.some(w => w.includes('nirvana'));
  if (hasNirvana) {
    if (name.includes('nirvana')) {
      return 0.90;
    }
  }

  // Exact match
  if (ocr === name) return 1.0;

  // Contains match
  if (name.includes(ocr)) return 0.8;
  if (ocr.includes(name)) return 0.7;

  // Word overlap
  const nameWords = name.split(/\s+/).filter(w => w.length > 2);
  const matchingWords = ocrWords.filter(w => nameWords.some(nw => nw.includes(w) || w.includes(nw)));

  if (matchingWords.length > 0) {
    return 0.5 + (matchingWords.length / Math.max(ocrWords.length, nameWords.length)) * 0.3;
  }

  // Levenshtein distance
  const maxLen = Math.max(ocr.length, name.length);
  if (maxLen === 0) return 0;

  let distance = 0;
  const matrix: number[][] = [];

  for (let i = 0; i <= name.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= ocr.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= name.length; i++) {
    for (let j = 1; j <= ocr.length; j++) {
      const cost = name[i - 1] === ocr[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  distance = matrix[name.length][ocr.length];
  return Math.max(0, 1 - distance / maxLen);
};

export function OCRImagePaste({ onOcrSuccess, characterElement, characterName, disabled }: OCRImagePasteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<OcrMatchResponse | null>(null);
  const [slotOcrResults, setSlotOcrResults] = useState<SlotOCRResult[]>([]);
  const [status, setStatus] = useState<OCRStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Removed Scorch dialog - now handled through variant selector

  // Variant selection state
  const [variantSelectionQueue, setVariantSelectionQueue] = useState<OcrModSlot[]>([]);
  const [currentVariantIndex, setCurrentVariantIndex] = useState(0);
  const [showVariantSelector, setShowVariantSelector] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<Map<number, Mod | null>>(new Map());

  // Low confidence selection state
  const [lowConfidenceQueue, setLowConfidenceQueue] = useState<OcrModSlot[]>([]);
  const [currentLowConfidenceIndex, setCurrentLowConfidenceIndex] = useState(0);
  const [showLowConfidenceSelector, setShowLowConfidenceSelector] = useState(false);
  const [lowConfidenceSelections, setLowConfidenceSelections] = useState<Map<number, Mod | null>>(new Map());

  // Reference images state
  const [useReferenceImages, setUseReferenceImages] = useState(true);
  const [referenceImagesAvailable, setReferenceImagesAvailable] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const lockedScorchElement = characterElement === 'Lumino' || characterElement === 'Umbro' ? characterElement : undefined;

  // Check if reference images are available
  useEffect(() => {
    checkReferenceImagesAvailable('character').then(setReferenceImagesAvailable);
  }, []);

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.readAsDataURL(file);
    });
  };

  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            await handleImageFile(file);
          }
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  const handleImageFile = async (file: File) => {
    try {
      const base64 = await fileToDataUrl(file);
      setImage(base64);
      await processImage(base64);
    } catch (error) {
      console.error('❌ [OCR] Failed to read image file:', error);
      setStatus('error');
      setErrorMessage('ไม่สามารถอ่านไฟล์รูปภาพได้');
      toast({
        title: 'OCR ล้มเหลว',
        description: 'ไม่สามารถอ่านข้อมูลจากรูปภาพได้',
        variant: 'destructive',
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const processImage = async (imageData: string) => {
    setIsProcessing(true);
    setOcrResult(null);
    setErrorMessage(null);
    setStatus('recognizing');
    setSlotOcrResults([]);

    console.log('🔍 [OCR] Starting Gemini Vision processing...');

    try {
      // Load reference images if enabled
      let referenceImages: string[] = [];
      if (useReferenceImages && referenceImagesAvailable) {
        console.log('📚 [OCR] Loading reference images for few-shot learning...');
        try {
          referenceImages = await loadReferenceImages('character');
          console.log(`✅ [OCR] Loaded ${referenceImages.length} reference images`);
        } catch (error) {
          console.warn('⚠️ [OCR] Failed to load reference images, continuing without them:', error);
        }
      }

      // Use Gemini Vision API
      console.log(`🤖 [OCR] Using Gemini 2.5 Flash Lite with retry mechanism... (${referenceImages.length > 0 ? 'with' : 'without'} reference images)`);

      // Use retry mechanism for Gemini API call
      const geminiResult = await retryWithBackoff(
        () => ocrWithGeminiVision(imageData, referenceImages),
        3, // max 3 retries
        1000 // initial delay 1 second
      );

      console.log('✅ [Gemini] Response received');
      console.log('📝 [Gemini] Found mod names:', geminiResult.modNames);
      if (geminiResult.modData) {
        console.log('📊 [Gemini] Mod data with tolerance:', geminiResult.modData);
      }

      // Check if we need clarification for Scorch mods
      // Now we handle Scorch mods through variant selector instead of separate dialog
      if (geminiResult.needsClarification && geminiResult.needsClarification.length > 0) {
        console.log('⚠️ [OCR] Scorch mods detected, will handle through variant selector');
        // Continue processing - Scorch will be handled as variants
      }

      // Convert Gemini results to SlotOCRResult format with tolerance info
      const slotResults: SlotOCRResult[] = geminiResult.modNames.map((name, idx) => {
        const modData = geminiResult.modData?.[idx];
        const rawText = modData?.tolerance
          ? `${name} (Tolerance: ${modData.tolerance})`
          : name;

        return {
          slotId: `slot-${idx + 1}`,
          rawText: name, // Keep original name for matching
          lines: [{ text: name, confidence: 95 }],
          candidates: [name.toLowerCase()],
          tolerance: modData?.tolerance, // Add tolerance for filtering
        };
      });

      if (slotResults.length === 0) {
        throw new Error('ไม่พบข้อมูลสำหรับ OCR');
      }

      setSlotOcrResults(slotResults);

      // Prepare data for matching API with tolerance info
      const ocrSlots: OcrSlotResult[] = slotResults.map(result => ({
        slotId: result.slotId,
        rawText: result.candidates.join('\n') || result.rawText,
        tolerance: result.tolerance,
      }));

      const combinedText = slotResults
        .filter((s) => s.candidates.length > 0)
        .map((s) => `${s.slotId}: ${s.candidates.join(', ')}`)
        .join('\n');

      console.log('📄 [OCR] Combined candidates:\n', combinedText || '[no candidates]');

      setStatus('matching');
      console.log('🔄 [OCR] Sending to matcher API...');

      const response = await fetch('/api/ocr-mod-matcher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ocrText: combinedText,
          ocrSlots: ocrSlots,
          modDatabase: allMods,
          characterElement,
        }),
      });

      if (!response.ok) {
        throw new Error('OCR processing failed');
      }

      const result: OcrMatchResponse = await response.json();
      console.log('✅ [OCR] Matching results:', result);
      console.log(`📊 [OCR] Summary: ${result.summary.total_matched}/${result.summary.total_detected} matched`);

      // Log each matched mod
      result.slots.forEach((slot) => {
        if (slot.matched) {
          console.log(`✓ [OCR] Slot #${slot.slot_index}: "${slot.raw_ocr_text}" → ${slot.mod_name} (${(slot.confidence * 100).toFixed(0)}%)`);
          if (slot.hasMultipleVariants) {
            console.log(`  ⚠️ Multiple variants available (${slot.variants?.length})`);
          }
        } else {
          console.log(`✗ [OCR] Slot #${slot.slot_index}: "${slot.raw_ocr_text}" → No match (${(slot.confidence * 100).toFixed(0)}%)`);
        }
      });

      setOcrResult(result);

      // Check for low confidence matches (need manual confirmation)
      const LOW_CONFIDENCE_THRESHOLD = 0.40; // Matches with confidence < 40% need manual selection
      const slotsNeedingManualSelection = result.slots.filter(
        slot => !slot.matched && slot.confidence > 0 && slot.confidence < LOW_CONFIDENCE_THRESHOLD
      );

      // Check if we need variant selection
      const slotsNeedingVariantSelection = result.slots.filter(
        slot => slot.matched && slot.hasMultipleVariants && slot.variants && slot.variants.length > 1
      );

      if (slotsNeedingManualSelection.length > 0) {
        console.log(`⚠️ [OCR] ${slotsNeedingManualSelection.length} slots have low confidence, need manual selection`);
        setLowConfidenceQueue(slotsNeedingManualSelection);
        setCurrentLowConfidenceIndex(0);
        setLowConfidenceSelections(new Map());
        setShowLowConfidenceSelector(true);
        setStatus('success');
      } else if (slotsNeedingVariantSelection.length > 0) {
        console.log(`🔍 [OCR] ${slotsNeedingVariantSelection.length} slots need variant selection`);
        setVariantSelectionQueue(slotsNeedingVariantSelection);
        setCurrentVariantIndex(0);
        setSelectedVariants(new Map());
        setShowVariantSelector(true);
        setStatus('success');
      } else {
        // No variants to select, finish immediately
        setStatus('success');
        console.log('✅ [OCR] No variant selection needed. Final result slots:', result.slots.length);
        console.log('✅ [OCR] Matched slots:', result.slots.filter(s => s.matched).length);

        toast({
          title: 'OCR สำเร็จ',
          description: `ตรวจพบ ${result.summary.total_matched} / ${result.summary.total_detected} mods`,
        });

        if (onOcrSuccess) {
          onOcrSuccess(result);
        }
      }
    } catch (error) {
      console.error('❌ [OCR] Error occurred:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'ไม่สามารถอ่านข้อมูลจากรูปภาพได้');
      toast({
        title: 'OCR ล้มเหลว',
        description: 'ไม่สามารถอ่านข้อมูลจากรูปภาพได้',
        variant: 'destructive',
      });
    } finally {
      console.log('🏁 [OCR] Processing finished');
      setIsProcessing(false);
    }
  };

  // Removed Scorch clarification functions - now handled through variant selector

  const handleLowConfidenceSelect = (mod: Mod) => {
    const currentSlot = lowConfidenceQueue[currentLowConfidenceIndex];
    console.log(`✅ [Low Confidence] Selected for slot #${currentSlot.slot_index}:`, mod.name);

    // Store the selection
    const newSelections = new Map(lowConfidenceSelections);
    newSelections.set(currentSlot.slot_index, mod);
    setLowConfidenceSelections(newSelections);

    // Move to next or finish
    if (currentLowConfidenceIndex < lowConfidenceQueue.length - 1) {
      console.log(`➡️ [Low Confidence] Moving to next (${currentLowConfidenceIndex + 1}/${lowConfidenceQueue.length})`);
      setCurrentLowConfidenceIndex(currentLowConfidenceIndex + 1);
    } else {
      // All low confidence slots handled, apply and continue
      console.log('✅ [Low Confidence] All selections done, applying...');
      applyLowConfidenceSelections(newSelections);
    }
  };

  const handleLowConfidenceSkip = () => {
    const currentSlot = lowConfidenceQueue[currentLowConfidenceIndex];
    console.log(`⏭️ [Low Confidence] Skipped slot #${currentSlot.slot_index}`);

    // Store null to indicate skip
    const newSelections = new Map(lowConfidenceSelections);
    newSelections.set(currentSlot.slot_index, null);
    setLowConfidenceSelections(newSelections);

    // Move to next or finish
    if (currentLowConfidenceIndex < lowConfidenceQueue.length - 1) {
      setCurrentLowConfidenceIndex(currentLowConfidenceIndex + 1);
    } else {
      applyLowConfidenceSelections(newSelections);
    }
  };

  const applyLowConfidenceSelections = (selections: Map<number, Mod | null>) => {
    if (!ocrResult) return;

    console.log('📝 [Low Confidence] Applying selections:', Array.from(selections.entries()));

    // Update OCR result with low confidence selections
    const updatedSlots = ocrResult.slots.map(slot => {
      const selection = selections.get(slot.slot_index);
      if (selection !== undefined) {
        if (selection === null) {
          // User skipped this slot
          console.log(`  ⏭️ Skipped slot #${slot.slot_index}`);
          return slot;
        }
        // User selected a mod
        console.log(`  ✓ Updating slot #${slot.slot_index} with manual selection:`, selection.name, selection.element, selection.rarity);
        return {
          ...slot,
          matched: true,
          mod_id: selection.id || selection.name.toLowerCase().replace(/\s+/g, '-'),
          mod_name: selection.name,
          confidence: 1.0, // Manual selection = 100% confidence
          reason: `Manually selected by user`,
          // Store additional mod details to ensure correct mod is used
          selectedModData: {
            id: selection.id,
            name: selection.name,
            rarity: selection.rarity,
            element: selection.element,
            variant: selection.variant,
            modType: selection.modType,
          },
        };
      }
      return slot;
    });

    const updatedResult: OcrMatchResponse = {
      ...ocrResult,
      slots: updatedSlots,
      summary: {
        ...ocrResult.summary,
        total_matched: updatedSlots.filter(s => s.matched).length,
        total_unmatched: updatedSlots.filter(s => !s.matched).length,
      },
    };

    setOcrResult(updatedResult);
    setShowLowConfidenceSelector(false);
    setLowConfidenceQueue([]);
    setCurrentLowConfidenceIndex(0);
    setLowConfidenceSelections(new Map());

    // Check if we need variant selection after low confidence selection
    const slotsNeedingVariantSelection = updatedResult.slots.filter(
      slot => slot.matched && slot.hasMultipleVariants && slot.variants && slot.variants.length > 1
    );

    if (slotsNeedingVariantSelection.length > 0) {
      console.log(`🔍 [OCR] ${slotsNeedingVariantSelection.length} slots need variant selection after low confidence`);
      setVariantSelectionQueue(slotsNeedingVariantSelection);
      setCurrentVariantIndex(0);
      setSelectedVariants(new Map());
      setShowVariantSelector(true);
    } else {
      // All done
      toast({
        title: 'OCR สำเร็จ',
        description: `ตรวจพบ ${updatedResult.summary.total_matched} / ${updatedResult.summary.total_detected} mods`,
      });

      if (onOcrSuccess) {
        console.log('🚀 [Low Confidence] Calling onOcrSuccess with', updatedResult.slots.length, 'slots');
        onOcrSuccess(updatedResult);
      }
    }
  };

  const handleVariantSelect = (mod: Mod) => {
    const currentSlot = variantSelectionQueue[currentVariantIndex];
    console.log(`✅ [Variant] Selected for slot #${currentSlot.slot_index}:`, mod.name, mod.rarity, mod.element);

    // Store the selection
    const newSelections = new Map(selectedVariants);
    newSelections.set(currentSlot.slot_index, mod);
    setSelectedVariants(newSelections);

    // Move to next or finish
    if (currentVariantIndex < variantSelectionQueue.length - 1) {
      console.log(`➡️ [Variant] Moving to next (${currentVariantIndex + 1}/${variantSelectionQueue.length})`);
      setCurrentVariantIndex(currentVariantIndex + 1);
    } else {
      // All variants selected, apply and finish
      console.log('✅ [Variant] All variants selected, applying...');
      applyVariantSelections(newSelections);
    }
  };

  const handleVariantSkip = () => {
    const currentSlot = variantSelectionQueue[currentVariantIndex];
    console.log(`⏭️ [Variant] Skipped slot #${currentSlot.slot_index} - will not import this mod`);

    // Store null to mark as skipped (will be removed from final result)
    const newSelections = new Map(selectedVariants);
    newSelections.set(currentSlot.slot_index, null as any); // Mark as explicitly skipped
    setSelectedVariants(newSelections);

    // Move to next or finish
    if (currentVariantIndex < variantSelectionQueue.length - 1) {
      setCurrentVariantIndex(currentVariantIndex + 1);
    } else {
      // Done with all slots
      applyVariantSelections(newSelections);
    }
  };

  const applyVariantSelections = (selections: Map<number, Mod | null>) => {
    if (!ocrResult) return;

    console.log('📝 [Variant] Applying selections:', Array.from(selections.entries()));
    console.log('📝 [Variant] Total slots in result:', ocrResult.slots.length);

    // Update OCR result with selected variants
    const updatedSlots = ocrResult.slots.map(slot => {
      const selection = selections.get(slot.slot_index);

      // Check if this slot was explicitly skipped (null value)
      if (selection === null) {
        console.log(`  ⏭️ Slot #${slot.slot_index} was skipped - marking as unmatched`);
        return {
          ...slot,
          matched: false,
          mod_id: null,
          mod_name: null,
          reason: 'User skipped this mod during variant selection',
        };
      }

      // Check if a mod was selected
      if (selection) {
        console.log(`  ✓ Updating slot #${slot.slot_index} with selected variant:`, selection.name, selection.element, selection.rarity);
        // Store the complete mod object in the slot for accurate retrieval later
        return {
          ...slot,
          mod_id: selection.id || selection.name.toLowerCase().replace(/\s+/g, '-'),
          mod_name: selection.name,
          hasMultipleVariants: false,
          variants: undefined,
          // Store additional mod details to ensure correct mod is used
          selectedModData: {
            id: selection.id,
            name: selection.name,
            rarity: selection.rarity,
            element: selection.element,
            variant: selection.variant,
            modType: selection.modType,
          },
        };
      }

      // Keep the original slot if no variant was selected (already matched or not in queue)
      // IMPORTANT: Preserve the original matched status and mod_id if it was already matched
      if (slot.matched && slot.mod_id) {
        console.log(`  → Keeping slot #${slot.slot_index} as is (already matched):`, slot.mod_name);
        return slot;
      }

      console.log(`  → Keeping slot #${slot.slot_index} as is (unmatched):`, slot.mod_name || 'unmatched');
      return slot;
    });

    const updatedResult: OcrMatchResponse = {
      ...ocrResult,
      slots: updatedSlots,
    };

    console.log('✅ [Variant] Final result with all slots:', updatedResult.slots.length);
    console.log('📊 [Variant] Matched slots:', updatedResult.slots.filter(s => s.matched).length);

    // Log final status of each slot
    updatedResult.slots.forEach(slot => {
      if (slot.matched) {
        console.log(`  ✓ Slot #${slot.slot_index}: ${slot.mod_name} (ID: ${slot.mod_id})`);
      } else {
        console.log(`  ✗ Slot #${slot.slot_index}: Not matched`);
      }
    });

    setOcrResult(updatedResult);
    setShowVariantSelector(false);
    setVariantSelectionQueue([]);
    setCurrentVariantIndex(0);
    setSelectedVariants(new Map());

    toast({
      title: 'OCR สำเร็จ',
      description: `ตรวจพบ ${updatedResult.summary.total_matched} / ${updatedResult.summary.total_detected} mods`,
    });

    if (onOcrSuccess) {
      console.log('🚀 [Variant] Calling onOcrSuccess with', updatedResult.slots.length, 'slots');
      onOcrSuccess(updatedResult);
    }
  };

  const handleClear = () => {
    setImage(null);
    setOcrResult(null);
    setSlotOcrResults([]);
    setStatus('idle');
    setErrorMessage(null);
    setVariantSelectionQueue([]);
    setCurrentVariantIndex(0);
    setShowVariantSelector(false);
    setSelectedVariants(new Map());
    setLowConfidenceQueue([]);
    setCurrentLowConfidenceIndex(0);
    setShowLowConfidenceSelector(false);
    setLowConfidenceSelections(new Map());
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="gap-2"
        disabled={disabled}
        title={disabled ? 'กรุณาเลือกตัวละครก่อนเริ่ม OCR' : undefined}
      >
        <ImageIcon className="w-4 h-4" />
        OCR Import (Ctrl+V)
      </Button>

      {/* Low Confidence Selection Dialog */}
      {lowConfidenceQueue.length > 0 && lowConfidenceQueue[currentLowConfidenceIndex] && (
        <ModVariantSelector
          open={showLowConfidenceSelector}
          onOpenChange={setShowLowConfidenceSelector}
          variants={(() => {
            const currentSlot = lowConfidenceQueue[currentLowConfidenceIndex];
            // Get top 15 candidates based on similarity (increased from 10)
            const candidates = allMods
              .map(mod => ({
                mod,
                score: computeSimpleScore(currentSlot.raw_ocr_text.toLowerCase(), mod)
              }))
              .sort((a, b) => b.score - a.score)
              .slice(0, 15)
              .map(c => c.mod);

            // Filter by character element if available
            if (characterElement) {
              const elementFiltered = candidates.filter(mod =>
                !mod.element || mod.element === characterElement
              );
              return elementFiltered.length > 0 ? elementFiltered : candidates;
            }

            return candidates;
          })()}
          ocrText={lowConfidenceQueue[currentLowConfidenceIndex].raw_ocr_text}
          onSelect={handleLowConfidenceSelect}
          onSkip={handleLowConfidenceSkip}
          characterElement={characterElement}
        />
      )}

      {/* Variant Selection Dialog */}
      {variantSelectionQueue.length > 0 && variantSelectionQueue[currentVariantIndex] && (
        <ModVariantSelector
          open={showVariantSelector}
          onOpenChange={setShowVariantSelector}
          variants={variantSelectionQueue[currentVariantIndex].variants || []}
          ocrText={variantSelectionQueue[currentVariantIndex].raw_ocr_text}
          onSelect={handleVariantSelect}
          onSkip={handleVariantSkip}
          characterElement={characterElement}
        />
      )}

      {/* Scorch mods are now handled through variant selector - no separate dialog needed */}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              🤖 OCR Mod Import (Gemini 2.5 Flash Lite)
            </DialogTitle>
            <DialogDescription>
              วางรูปภาพด้วย Ctrl+V หรือเลือกไฟล์เพื่ออ่านข้อมูล mods อัตโนมัติด้วย Gemini AI
            </DialogDescription>
          </DialogHeader>

          {/* Reference Images Toggle */}
          <div className="px-1">
            <OCRReferenceToggle
              enabled={useReferenceImages}
              onToggle={setUseReferenceImages}
              available={referenceImagesAvailable}
            />
          </div>

          <div className="space-y-4">
            {!image ? (
              <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
                <div className="p-12 flex flex-col items-center justify-center text-center">
                  <ImageIcon className="w-16 h-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">วางรูปภาพที่นี่</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    กด Ctrl+V เพื่อวางรูปจาก clipboard<br />
                    หรือคลิกปุ่มด้านล่างเพื่อเลือกไฟล์
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    เลือกไฟล์รูปภาพ
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Image Preview */}
                <div className="relative">
                  <img
                    src={image}
                    alt="Uploaded"
                    className="w-full max-h-[300px] object-contain rounded-lg border"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleClear}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Processing State with Animation */}
                {(isProcessing || status === 'recognizing' || status === 'matching') && (
                  <OCRLoadingAnimation
                    status={status === 'recognizing' ? 'recognizing' : 'matching'}
                  />
                )}

                {status === 'error' && errorMessage && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>เกิดข้อผิดพลาด</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}

                {/* OCR Results */}
                {ocrResult && !isProcessing && (
                  <div className="space-y-4">
                    <Alert className={ocrResult.summary.total_matched > 0 ? "border-green-500/50 bg-green-500/10" : "border-yellow-500/50 bg-yellow-500/10"}>
                      {ocrResult.summary.total_matched > 0 ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                      )}
                      <AlertTitle className={ocrResult.summary.total_matched > 0 ? "text-green-500" : "text-yellow-500"}>
                        {ocrResult.summary.total_matched > 0 ? 'ตรวจพบ Mods' : 'ไม่พบ Mods ที่ตรงกัน'}
                      </AlertTitle>
                      <AlertDescription>
                        พบ {ocrResult.summary.total_matched} จาก {ocrResult.summary.total_detected} รายการ
                        {ocrResult.summary.total_unmatched > 0 && ` (ไม่ตรง: ${ocrResult.summary.total_unmatched})`}
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">รายการ Mods ที่ตรวจพบ:</h4>
                        <span className="text-xs text-muted-foreground">
                          {ocrResult.summary.total_matched} matched
                        </span>
                      </div>
                      <ScrollArea className="max-h-[300px] rounded-md border">
                        <div className="p-3 space-y-2">
                          {ocrResult.slots.map((slot) => (
                            <div
                              key={slot.slot_index}
                              className={`p-3 rounded-lg border transition-colors ${slot.matched
                                ? 'bg-green-500/5 border-green-500/20 hover:bg-green-500/10'
                                : 'bg-muted/30 border-border/50'
                                }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-mono text-xs text-muted-foreground shrink-0">
                                      #{slot.slot_index}
                                    </span>
                                    {slot.matched ? (
                                      <>
                                        <span className="font-semibold text-sm truncate text-green-600 dark:text-green-400">
                                          {slot.mod_name}
                                        </span>
                                        {slot.hasMultipleVariants && (
                                          <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 shrink-0">
                                            {slot.variants?.length} variants
                                          </span>
                                        )}
                                      </>
                                    ) : (
                                      <span className="font-medium text-sm text-muted-foreground">
                                        ไม่พบ
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground truncate">
                                    OCR: "{slot.raw_ocr_text}"
                                  </p>
                                </div>
                                <span
                                  className={`shrink-0 text-xs px-2 py-1 rounded-md font-medium ${slot.matched && slot.confidence >= 0.7
                                    ? 'bg-green-500/20 text-green-600 dark:text-green-400'
                                    : slot.matched && slot.confidence >= 0.5
                                      ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                                      : 'bg-red-500/20 text-red-600 dark:text-red-400'
                                    }`}
                                >
                                  {(slot.confidence * 100).toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Gemini OCR Details */}
                    <Card className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">🤖 Gemini Vision Results</h4>
                        <span className="text-xs text-muted-foreground">
                          {slotOcrResults.length} mods detected
                        </span>
                      </div>
                      <ScrollArea className="max-h-[200px]">
                        <div className="space-y-2 pr-1">
                          {slotOcrResults.length > 0 ? (
                            slotOcrResults.map((slot) => (
                              <div key={slot.slotId} className="rounded-md border bg-muted/30 p-2">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-mono text-[11px] text-muted-foreground">{slot.slotId}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {slot.rawText}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-muted-foreground">ไม่พบข้อมูล</p>
                          )}
                        </div>
                      </ScrollArea>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="justify-between">
            <div className="text-xs text-muted-foreground">
              สถานะ: {status === 'success' ? 'สำเร็จ' : status === 'error' ? 'ผิดพลาด' : 'รอประมวลผล'}
            </div>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              ปิด
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
