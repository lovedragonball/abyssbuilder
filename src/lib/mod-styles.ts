import type { ModRarity } from './types';

// CSS gradient strings for inline styles
const rarityGradientStyles: Record<ModRarity, string> = {
  2: 'linear-gradient(180deg, rgb(15, 23, 42) 0%, rgb(34, 197, 94) 50%, rgb(74, 222, 128) 100%)', // Green for 2-star
  3: 'linear-gradient(180deg, rgb(15, 23, 42) 0%, rgb(59, 130, 246) 50%, rgb(96, 165, 250) 100%)', // Blue for 3-star
  4: 'linear-gradient(180deg, rgb(15, 23, 42) 0%, rgb(139, 92, 246) 45%, rgb(217, 70, 239) 75%, rgb(236, 72, 153) 100%)', // Purple-to-pink for 4-star
  5: 'linear-gradient(180deg, rgb(15, 23, 42) 0%, rgb(245, 158, 11) 50%, rgb(251, 191, 36) 100%)', // Gold for 5-star
};

// Tailwind gradient classes (fallback for components that use classes)
const rarityGradients: Record<ModRarity, string> = {
  2: 'from-slate-900 via-green-500 to-green-400',
  3: 'from-slate-900 via-blue-500 to-blue-400',
  4: 'from-slate-900 via-purple-500 via-fuchsia-500 to-pink-500',
  5: 'from-slate-900 via-amber-600 to-amber-400',
};

const defaultGradient = 'from-slate-800/60 via-slate-900/50 to-black/80';
const defaultGradientStyle = 'linear-gradient(rgb(0, 0, 0) 0%, rgb(30, 41, 59) 60%, rgba(30, 41, 59, 0.6) 100%)';

/**
 * Get Tailwind CSS gradient classes for a mod rarity
 * Used in components that apply gradients via className
 */
export function getRarityGradient(rarity: ModRarity | number): string {
  return rarityGradients[rarity as ModRarity] ?? defaultGradient;
}

/**
 * Get inline CSS gradient style for a mod rarity
 * Used in components that need inline background styles
 */
export function getRarityGradientStyle(rarity: ModRarity | number): string {
  return rarityGradientStyles[rarity as ModRarity] ?? defaultGradientStyle;
}

/**
 * Get border color class for a mod rarity
 */
export function getRarityBorderColor(rarity: ModRarity | number): string {
  const borderColors: Record<ModRarity, string> = {
    2: 'border-green-400/60',
    3: 'border-blue-400/60',
    4: 'border-purple-400/70',
    5: 'border-amber-400/70',
  };
  return borderColors[rarity as ModRarity] ?? 'border-slate-400/50';
}

/**
 * Get box shadow style for a mod rarity
 */
export function getRarityBoxShadow(rarity: ModRarity | number): string {
  const shadows: Record<ModRarity, string> = {
    2: '0 0 16px rgba(74, 222, 128, 0.3)',
    3: '0 0 16px rgba(96, 165, 250, 0.3)',
    4: '0 0 20px rgba(217, 70, 239, 0.4)',
    5: '0 0 20px rgba(251, 191, 36, 0.4)',
  };
  return shadows[rarity as ModRarity] ?? '0 0 12px rgba(0, 0, 0, 0.35)';
}
