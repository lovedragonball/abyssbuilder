'use client';

import { useMemo } from 'react';
import type { Mod } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ToleranceSystemProps {
  mods: (Mod | null)[];
  primeMod: Mod | null;
  className?: string;
  adjustedSlots?: Set<number>;
  compact?: boolean;
}

export function ToleranceSystem({ mods, primeMod, className, adjustedSlots = new Set(), compact = false }: ToleranceSystemProps) {
  const { currentTolerance, maxTolerance, isOverLimit } = useMemo(() => {
    const baseMax = 100;
    const boost = primeMod?.toleranceBoost || 0;
    const max = baseMax + boost;

    let current = 0;
    mods.forEach((mod, index) => {
      if (!mod) return;

      let modCost = mod.tolerance;

      // Matching prime mod symbol cuts tolerance cost in half
      if (primeMod && mod.symbol && mod.symbol === primeMod.symbol) {
        modCost = Math.ceil(modCost / 2);
      }
      // Adjust Slot Track also halves the tolerance cost
      else if (adjustedSlots.has(index)) {
        modCost = Math.ceil(modCost / 2);
      }

      current += modCost;
    });

    return {
      currentTolerance: current,
      maxTolerance: max,
      isOverLimit: current > max,
    };
  }, [mods, primeMod, adjustedSlots]);

  const percentage = Math.min((currentTolerance / maxTolerance) * 100, 100);

  // Compact mode for center display
  if (compact) {
    return (
      <div className="flex flex-col items-center">
        <span className={cn('text-6xl font-bold', {
          'text-destructive': isOverLimit,
          'text-yellow-400': currentTolerance > maxTolerance * 0.8 && !isOverLimit,
          'text-white': currentTolerance <= maxTolerance * 0.8,
        })}>
          {currentTolerance}
        </span>
        <span className="text-sm uppercase tracking-wider text-muted-foreground mt-1">Total</span>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-muted-foreground">TOLERANCE</span>
        <span className={cn('font-bold text-lg', {
          'text-destructive': isOverLimit,
          'text-yellow-500': currentTolerance > maxTolerance * 0.8 && !isOverLimit,
          'text-foreground': currentTolerance <= maxTolerance * 0.8,
        })}>
          {currentTolerance}/{maxTolerance}
        </span>
      </div>

      <div className="relative h-3 bg-black/30 rounded-full overflow-hidden border border-border/50">
        <div
          className={cn('h-full transition-all duration-300 rounded-full', {
            'bg-gradient-to-r from-red-500 to-red-600': isOverLimit,
            'bg-gradient-to-r from-yellow-500 to-yellow-600': currentTolerance > maxTolerance * 0.8 && !isOverLimit,
            'bg-gradient-to-r from-blue-500 to-cyan-500': currentTolerance <= maxTolerance * 0.8,
          })}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {isOverLimit && (
        <p className="text-xs text-destructive font-medium">
          ⚠️ Tolerance limit exceeded! Remove some mods.
        </p>
      )}

      {primeMod && (
        <div className="text-xs text-muted-foreground bg-background/50 rounded-md p-2 border border-border/30">
          <span className="font-semibold text-primary">Prime Mod Active:</span> {primeMod.name}
          {primeMod.symbol && (
            <span className="ml-2">
              (Symbol <span className="font-bold text-foreground">{primeMod.symbol}</span> mods cost 50% less)
            </span>
          )}
        </div>
      )}
    </div>
  );
}
