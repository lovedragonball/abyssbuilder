/**
 * Gradient Verification Script
 * 
 * This script verifies that the mod rarity gradients are correctly implemented
 * according to the design specifications.
 */

import { getRarityGradient, getRarityGradientStyle, getRarityBorderColor, getRarityBoxShadow } from '@/lib/mod-styles';
import type { ModRarity } from '@/lib/types';

interface GradientTest {
  rarity: ModRarity;
  expectedGradient: string;
  expectedInlineStyle: string;
  expectedBorder: string;
  expectedShadow: string;
  description: string;
}

const gradientTests: GradientTest[] = [
  {
    rarity: 2,
    expectedGradient: 'from-slate-900 via-green-500 to-green-400',
    expectedInlineStyle: 'linear-gradient(180deg, rgb(15, 23, 42) 0%, rgb(34, 197, 94) 50%, rgb(74, 222, 128) 100%)',
    expectedBorder: 'border-green-400/60',
    expectedShadow: '0 0 16px rgba(74, 222, 128, 0.3)',
    description: '2-star mods should have green gradient (dark slate → green → light green)'
  },
  {
    rarity: 3,
    expectedGradient: 'from-slate-900 via-blue-500 to-blue-400',
    expectedInlineStyle: 'linear-gradient(180deg, rgb(15, 23, 42) 0%, rgb(59, 130, 246) 50%, rgb(96, 165, 250) 100%)',
    expectedBorder: 'border-blue-400/60',
    expectedShadow: '0 0 16px rgba(96, 165, 250, 0.3)',
    description: '3-star mods should have blue gradient (dark slate → blue → light blue)'
  },
  {
    rarity: 4,
    expectedGradient: 'from-slate-900 via-purple-500 via-fuchsia-500 to-pink-500',
    expectedInlineStyle: 'linear-gradient(180deg, rgb(15, 23, 42) 0%, rgb(139, 92, 246) 45%, rgb(217, 70, 239) 75%, rgb(236, 72, 153) 100%)',
    expectedBorder: 'border-purple-400/70',
    expectedShadow: '0 0 20px rgba(217, 70, 239, 0.4)',
    description: '4-star mods should have purple-to-pink gradient (dark slate → purple → fuchsia → pink)'
  },
  {
    rarity: 5,
    expectedGradient: 'from-slate-900 via-amber-600 to-amber-400',
    expectedInlineStyle: 'linear-gradient(180deg, rgb(15, 23, 42) 0%, rgb(245, 158, 11) 50%, rgb(251, 191, 36) 100%)',
    expectedBorder: 'border-amber-400/70',
    expectedShadow: '0 0 20px rgba(251, 191, 36, 0.4)',
    description: '5-star mods should have gold gradient (dark slate → amber → light amber)'
  }
];

/**
 * Run all gradient verification tests
 */
export function verifyGradients(): { passed: number; failed: number; results: Array<{ test: string; passed: boolean; message: string }> } {
  const results: Array<{ test: string; passed: boolean; message: string }> = [];
  let passed = 0;
  let failed = 0;

  console.log('🎨 Starting Gradient Verification Tests...\n');

  gradientTests.forEach((test) => {
    console.log(`Testing ${test.rarity}-star gradient:`);
    console.log(`  Description: ${test.description}`);

    // Test Tailwind gradient classes
    const actualGradient = getRarityGradient(test.rarity);
    const gradientMatch = actualGradient === test.expectedGradient;
    
    if (gradientMatch) {
      console.log(`  ✅ Tailwind gradient: PASS`);
      results.push({ test: `${test.rarity}-star Tailwind gradient`, passed: true, message: 'Gradient classes match' });
      passed++;
    } else {
      console.log(`  ❌ Tailwind gradient: FAIL`);
      console.log(`     Expected: ${test.expectedGradient}`);
      console.log(`     Actual:   ${actualGradient}`);
      results.push({ test: `${test.rarity}-star Tailwind gradient`, passed: false, message: `Expected "${test.expectedGradient}" but got "${actualGradient}"` });
      failed++;
    }

    // Test inline CSS gradient
    const actualInlineStyle = getRarityGradientStyle(test.rarity);
    const inlineMatch = actualInlineStyle === test.expectedInlineStyle;
    
    if (inlineMatch) {
      console.log(`  ✅ Inline CSS gradient: PASS`);
      results.push({ test: `${test.rarity}-star inline gradient`, passed: true, message: 'Inline style matches' });
      passed++;
    } else {
      console.log(`  ❌ Inline CSS gradient: FAIL`);
      console.log(`     Expected: ${test.expectedInlineStyle}`);
      console.log(`     Actual:   ${actualInlineStyle}`);
      results.push({ test: `${test.rarity}-star inline gradient`, passed: false, message: `Inline style mismatch` });
      failed++;
    }

    // Test border color
    const actualBorder = getRarityBorderColor(test.rarity);
    const borderMatch = actualBorder === test.expectedBorder;
    
    if (borderMatch) {
      console.log(`  ✅ Border color: PASS`);
      results.push({ test: `${test.rarity}-star border`, passed: true, message: 'Border color matches' });
      passed++;
    } else {
      console.log(`  ❌ Border color: FAIL`);
      console.log(`     Expected: ${test.expectedBorder}`);
      console.log(`     Actual:   ${actualBorder}`);
      results.push({ test: `${test.rarity}-star border`, passed: false, message: `Border color mismatch` });
      failed++;
    }

    // Test box shadow
    const actualShadow = getRarityBoxShadow(test.rarity);
    const shadowMatch = actualShadow === test.expectedShadow;
    
    if (shadowMatch) {
      console.log(`  ✅ Box shadow: PASS`);
      results.push({ test: `${test.rarity}-star shadow`, passed: true, message: 'Box shadow matches' });
      passed++;
    } else {
      console.log(`  ❌ Box shadow: FAIL`);
      console.log(`     Expected: ${test.expectedShadow}`);
      console.log(`     Actual:   ${actualShadow}`);
      results.push({ test: `${test.rarity}-star shadow`, passed: false, message: `Box shadow mismatch` });
      failed++;
    }

    console.log('');
  });

  console.log('═══════════════════════════════════════');
  console.log(`📊 Test Summary:`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Total:  ${passed + failed}`);
  console.log('═══════════════════════════════════════\n');

  return { passed, failed, results };
}

/**
 * Verify gradient direction (should be 180deg for top-to-bottom)
 */
export function verifyGradientDirection(): boolean {
  console.log('🔍 Verifying gradient direction...');
  
  const rarities: ModRarity[] = [2, 3, 4, 5];
  let allCorrect = true;

  rarities.forEach((rarity) => {
    const gradient = getRarityGradientStyle(rarity);
    const has180deg = gradient.includes('180deg');
    
    if (has180deg) {
      console.log(`  ✅ ${rarity}-star: Correct direction (180deg - top to bottom)`);
    } else {
      console.log(`  ❌ ${rarity}-star: Incorrect direction (should be 180deg)`);
      allCorrect = false;
    }
  });

  console.log('');
  return allCorrect;
}

/**
 * Verify color progression (dark to light)
 */
export function verifyColorProgression(): void {
  console.log('🌈 Verifying color progression (dark to light)...');
  
  console.log('  4-star gradient should progress:');
  console.log('    1. Dark slate (rgb(15, 23, 42)) at 0%');
  console.log('    2. Purple (rgb(139, 92, 246)) at 45%');
  console.log('    3. Fuchsia (rgb(217, 70, 239)) at 75%');
  console.log('    4. Pink (rgb(236, 72, 153)) at 100%');
  
  const gradient4Star = getRarityGradientStyle(4);
  const hasCorrectProgression = 
    gradient4Star.includes('rgb(15, 23, 42) 0%') &&
    gradient4Star.includes('rgb(139, 92, 246) 45%') &&
    gradient4Star.includes('rgb(217, 70, 239) 75%') &&
    gradient4Star.includes('rgb(236, 72, 153) 100%');
  
  if (hasCorrectProgression) {
    console.log('  ✅ 4-star gradient has correct color progression\n');
  } else {
    console.log('  ❌ 4-star gradient color progression is incorrect\n');
  }
}

// Run all tests if this file is executed directly
if (require.main === module) {
  verifyGradients();
  verifyGradientDirection();
  verifyColorProgression();
}
