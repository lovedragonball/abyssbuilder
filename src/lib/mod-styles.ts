import type { ModRarity } from './types';

const rarityGradients: Record<ModRarity, string> = {
  2: 'from-green-300/70 via-green-400/60 to-green-700/90',
  3: 'from-blue-300/70 via-blue-400/60 to-blue-700/90',
  4: 'from-purple-300/80 via-purple-400/70 to-purple-700/95',
  5: 'from-amber-300/80 via-amber-500/70 to-amber-700/95',
};

const defaultGradient = 'from-slate-800/60 via-slate-900/50 to-black/80';

export function getRarityGradient(rarity: ModRarity | number): string {
  return rarityGradients[rarity as ModRarity] ?? defaultGradient;
}
