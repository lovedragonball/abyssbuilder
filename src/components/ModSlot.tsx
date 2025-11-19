'use client';

import Image from 'next/image';
import { X, Star } from 'lucide-react';
import type { Mod, ModRarity } from '@/lib/types';
import { cn } from '@/lib/utils';
import { getRarityGradient } from '@/lib/mod-styles';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ModSlotProps {
  mod: Mod | null;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onRemove?: () => void;
  isPrimeSlot?: boolean;
  primeSymbol?: string;
  onClick?: () => void;
  isAdjustMode?: boolean;
  isAdjusted?: boolean;
}

const RarityStars = ({ rarity }: { rarity: ModRarity }) => (
  <div className="flex items-center gap-0.5">
    {[...Array(rarity)].map((_, i) => (
      <Star key={i} className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
    ))}
  </div>
);

export function ModSlot({
  mod,
  onDrop,
  onDragOver,
  onRemove,
  isPrimeSlot = false,
  primeSymbol,
  onClick,
  isAdjustMode = false,
  isAdjusted = false
}: ModSlotProps) {
  const hasSymbolMatch = !isPrimeSlot && mod && primeSymbol && mod.symbol === primeSymbol;
  
  // Calculate actual tolerance cost
  let actualTolerance = mod?.tolerance;
  if (mod && !isPrimeSlot) {
    if (hasSymbolMatch) {
      actualTolerance = Math.floor(mod.tolerance / 2);
    } else if (isAdjusted) {
      actualTolerance = Math.floor(mod.tolerance / 2);
    }
  }
  const rarityGradient = mod ? getRarityGradient(mod.rarity) : null;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isAdjustMode && mod && !isPrimeSlot && onClick) {
      e.stopPropagation();
      onClick();
    }
  };

  const slotContent = (
    <div
      className={cn(
        'relative aspect-square bg-black/20 border-2 border-dashed rounded-md flex items-center justify-center overflow-hidden group transition-all',
        {
          'border-border': !mod,
          'border-primary/50': mod && !isPrimeSlot && !isAdjusted,
          'border-yellow-500/70 shadow-lg shadow-yellow-500/20': isPrimeSlot && mod,
          'border-green-500/70 shadow-md shadow-green-500/20': hasSymbolMatch,
          'border-white/70 shadow-md shadow-white/20': isAdjusted && !hasSymbolMatch,
          'cursor-pointer': isAdjustMode && mod && !isPrimeSlot,
        }
      )}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onClick={handleClick}
    >
      {mod ? (
        <div className="relative w-full h-full">
          <Image
            src={mod.image}
            alt={mod.name}
            fill
            className="object-cover"
            data-ai-hint="abstract pattern"
          />
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-b opacity-80 transition-colors',
              rarityGradient
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* Adjust Mode Indicator */}
          {isAdjustMode && mod && !isPrimeSlot && (
            <div className="absolute inset-0 bg-blue-500/10 border-2 border-blue-400/30 pointer-events-none animate-pulse" />
          )}

          {/* Symbol */}
          {mod.symbol && (
            <div className={cn(
              'absolute top-1 right-1 text-white text-xs px-1.5 py-0.5 rounded-sm font-bold',
              {
                'bg-black/70': !hasSymbolMatch,
                'bg-green-600/90 animate-pulse': hasSymbolMatch,
              }
            )}>
              {mod.symbol}
            </div>
          )}

          {/* Rarity Stars */}
          <div className="absolute top-1 left-1">
            <RarityStars rarity={mod.rarity} />
          </div>

          {/* Tolerance Cost */}
          {!isPrimeSlot && (
            <div
              className={cn(
                'absolute bottom-1 right-1 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center',
                {
                  'bg-blue-600/80 text-white': !hasSymbolMatch && !isAdjusted,
                  'bg-green-600/80 text-white': hasSymbolMatch,
                  'border border-emerald-400/70 bg-emerald-500/15 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.6)]':
                    isAdjusted && !hasSymbolMatch,
                }
              )}
            >
              {(hasSymbolMatch || isAdjusted) && (
                <span className="line-through opacity-60 mr-1 text-white/70">{mod.tolerance}</span>
              )}
              <span className={cn(isAdjusted && !hasSymbolMatch && 'text-emerald-200')}>
                {actualTolerance}
              </span>
            </div>
          )}

          {/* Prime Mod Indicator */}
          {isPrimeSlot && mod.toleranceBoost && (
            <div className="absolute bottom-1 right-1 bg-yellow-600/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
              +{mod.toleranceBoost}
            </div>
          )}

          {/* Center Only Indicator */}
          {isPrimeSlot && mod.centerOnly && (
            <div className="absolute bottom-1 right-1 bg-cyan-600/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
              CENTER
            </div>
          )}

          {/* Remove Button */}
          {onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 z-20 hover:bg-destructive/80 transition-colors opacity-0 group-hover:opacity-100"
            >
              <X className="w-3 h-3" />
            </button>
          )}

          {/* Symbol Match Indicator */}
          {hasSymbolMatch && (
            <div className="absolute inset-0 border-2 border-green-500 rounded-md pointer-events-none" />
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-muted-foreground">
          <span className="text-2xl">+</span>
        </div>
      )}
    </div>
  );

  // Don't show tooltip for empty slots
  if (!mod) {
    return slotContent;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          {slotContent}
        </TooltipTrigger>
        <TooltipContent side="top" align="center" className="w-64">
          <div className="p-2 space-y-2">
            <div className="space-y-1">
              <div className="flex justify-between items-start gap-2">
                <h4 className="font-bold text-sm text-foreground">{mod.name}</h4>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {mod.symbol && <div className="bg-black/50 text-white text-xs p-1 rounded-sm font-bold">{mod.symbol}</div>}
                  <RarityStars rarity={mod.rarity} />
                </div>
              </div>
              <div className="flex gap-2 text-xs text-muted-foreground">
                <span>{mod.modType}</span>
                {mod.element && (
                  <>
                    <span>&bull;</span> <span>{mod.element}</span>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tolerance</span>
                <span className="font-medium text-foreground">{actualTolerance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Track</span>
                <span className="font-medium text-foreground">{mod.track}</span>
              </div>
              {mod.isPrimeMod && mod.toleranceBoost && (
                <div className="flex justify-between col-span-2">
                  <span className="text-muted-foreground">Tolerance Boost</span>
                  <span className="font-medium text-yellow-500">+{mod.toleranceBoost}</span>
                </div>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
