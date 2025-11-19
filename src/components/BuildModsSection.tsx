'use client';

import { useState, useEffect } from 'react';
import type { DragEvent } from 'react';
import type { Mod } from '@/lib/types';
import { ModSlot } from '@/components/ModSlot';
import { ToleranceSystem } from './ToleranceSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { allMods } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface BuildModsSectionProps {
  mods: (Mod | null)[];
  primeMod: Mod | null;
  onModsChange: (mods: (Mod | null)[]) => void;
  onPrimeModChange: (mod: Mod | null) => void;
  onOpenModSelector: () => void;
}

export function BuildModsSection({
  mods,
  primeMod,
  onModsChange,
  onPrimeModChange,
  onOpenModSelector
}: BuildModsSectionProps) {
  const { toast } = useToast();
  const [adjustSlotTrackMode, setAdjustSlotTrackMode] = useState(false);
  const [adjustedSlots, setAdjustedSlots] = useState<Set<number>>(new Set());
  const leftMods = mods.slice(0, 4);
  const rightMods = mods.slice(4);
  const leftFilled = leftMods.filter(Boolean).length;
  const rightFilled = rightMods.filter(Boolean).length;

  const canEquipMultiple = (mod: Mod) => {
    return mod.effect?.includes('can be equipped in multiples') || false;
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    const modName = e.dataTransfer.getData("modName");
    const mod = allMods.find(m => m.name === modName);
    // Prevent centerOnly mods from being placed in regular slots
    if (mod && !mod.centerOnly) {
      // Check if mod already exists in build (excluding the target slot)
      const isDuplicate = mods.some((slot, i) => i !== index && slot?.name === mod.name);

      if (isDuplicate && !canEquipMultiple(mod)) {
        toast({
          title: 'Cannot Equip Duplicate',
          description: `${mod.name} is already equipped. This mod cannot be equipped multiple times.`,
          variant: 'destructive',
        });
        return;
      }

      const newMods = [...mods];
      newMods[index] = mod;
      onModsChange(newMods);
    }
  };

  const handlePrimeDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const modName = e.dataTransfer.getData("modName");
    const mod = allMods.find(m => m.name === modName);
    // Allow both prime mods and centerOnly mods in center slot
    if (mod && (mod.isPrimeMod || mod.centerOnly)) {
      onPrimeModChange(mod);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleRemoveMod = (index: number) => {
    const newMods = [...mods];
    newMods[index] = null;
    onModsChange(newMods);

    if (adjustedSlots.has(index)) {
      const updated = new Set(adjustedSlots);
      updated.delete(index);
      setAdjustedSlots(updated);
    }
  };

  const handleRemovePrimeMod = () => {
    onPrimeModChange(null);
  };

  const handleRemoveAll = () => {
    onModsChange(Array(8).fill(null));
    onPrimeModChange(null);
    setAdjustedSlots(new Set());
  };

  const toggleAdjustSlotTrack = () => {
    const newMode = !adjustSlotTrackMode;
    setAdjustSlotTrackMode(newMode);
    console.log('Adjust Slot Track Mode:', newMode ? 'On' : 'Off');
  };

  const handleSlotClick = (index: number) => {
    console.log('Slot clicked:', index, 'Mode:', adjustSlotTrackMode, 'Has mod:', !!mods[index]);
    if (adjustSlotTrackMode && mods[index]) {
      const newAdjustedSlots = new Set(adjustedSlots);
      if (newAdjustedSlots.has(index)) {
        newAdjustedSlots.delete(index);
        console.log('Removed adjustment from slot', index);
      } else {
        newAdjustedSlots.add(index);
        console.log('Added adjustment to slot', index);
      }
      setAdjustedSlots(newAdjustedSlots);
      console.log('Adjusted slots:', Array.from(newAdjustedSlots));
    }
  };

  useEffect(() => {
    setAdjustedSlots((current) => {
      let changed = false;
      const filtered = new Set<number>();
      current.forEach((slotIndex) => {
        if (mods[slotIndex]) {
          filtered.add(slotIndex);
        } else {
          changed = true;
        }
      });
      return changed ? filtered : current;
    });
  }, [mods]);

  const filledSlots = mods.filter(m => m !== null).length + (primeMod ? 1 : 0);
  const hasAnyMods = filledSlots > 0;

  return (
    <Card className="relative overflow-hidden border border-white/10 bg-gradient-to-b from-slate-950/80 via-slate-900/60 to-slate-900/40 shadow-2xl backdrop-blur">
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute -top-16 left-10 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-10 right-14 h-48 w-48 rounded-full bg-purple-500/20 blur-[120px]" />
      </div>
      <CardHeader className="relative pb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
              Character Set
            </p>
            <CardTitle className="text-2xl font-semibold text-foreground">Build Mods</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Arrange mods, manage tolerance, and fine-tune slots here.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:w-auto">
            <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-center">
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Slots</p>
              <p className="text-xl font-semibold text-foreground">{filledSlots}/9</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-center">
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Adjust Mode</p>
              <p
                className={cn(
                  'text-sm font-semibold',
                  adjustSlotTrackMode ? 'text-emerald-300' : 'text-muted-foreground'
                )}
              >
                {adjustSlotTrackMode ? 'Active' : 'Inactive'}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-center hidden sm:block">
              <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Prime Mod</p>
              <p className="text-sm font-semibold text-foreground truncate">
                {primeMod ? primeMod.name : 'No selection'}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative space-y-8">
        {adjustSlotTrackMode && (
          <div className="rounded-2xl border border-blue-500/40 bg-blue-500/10 p-4 text-sm text-blue-100 flex items-start gap-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-blue-300 shadow-[0_0_8px_rgba(59,130,246,0.7)] animate-pulse" />
            <p>🎯 Adjust Slot Track mode is active — click a slot to halve its tolerance cost.</p>
          </div>
        )}

        {/* 4-1-4 Layout with centered tolerance display */}
        <div className="space-y-6">
          {/* Main slot grid with 4-1-4 layout */}
          <div className="rounded-3xl border border-white/10 bg-black/30 p-8 shadow-inner">
            <div className="flex items-center justify-center gap-8 xl:gap-12">
              {/* Left 4 slots (2x2 grid) */}
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  {leftMods.map((mod, i) => (
                    <div key={`left-${i}`} className="w-24 h-24 xl:w-28 xl:h-28">
                      <ModSlot
                        mod={mod}
                        onDrop={(e: DragEvent<HTMLDivElement>) => handleDrop(e, i)}
                        onDragOver={handleDragOver}
                        onRemove={mod ? () => handleRemoveMod(i) : undefined}
                        primeSymbol={primeMod?.symbol}
                        onClick={() => handleSlotClick(i)}
                        isAdjustMode={adjustSlotTrackMode}
                        isAdjusted={adjustedSlots.has(i)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Center - Tolerance Display with Prime Slot */}
              <div className="flex flex-col items-center gap-6">
                {/* Tolerance Circle */}
                <div className="relative">
                  <div className="w-48 h-48 xl:w-56 xl:h-56 rounded-full bg-gradient-to-br from-slate-900 via-slate-950 to-black border-2 border-blue-500/30 shadow-2xl shadow-blue-500/20 flex flex-col items-center justify-center">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">Tolerance</p>
                    <ToleranceSystem mods={mods} primeMod={primeMod} adjustedSlots={adjustedSlots} compact />
                  </div>
                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-2xl -z-10" />
                </div>

                {/* Prime/Center Slot below tolerance */}
                <div className="w-20 h-20 xl:w-24 xl:h-24">
                  <ModSlot
                    mod={primeMod}
                    onDrop={handlePrimeDrop}
                    onDragOver={handleDragOver}
                    onRemove={primeMod ? handleRemovePrimeMod : undefined}
                    isPrimeSlot
                  />
                </div>
              </div>

              {/* Right 4 slots (2x2 grid) */}
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  {rightMods.map((mod, i) => (
                    <div key={`right-${i}`} className="w-24 h-24 xl:w-28 xl:h-28">
                      <ModSlot
                        mod={mod}
                        onDrop={(e: DragEvent<HTMLDivElement>) => handleDrop(e, i + 4)}
                        onDragOver={handleDragOver}
                        onRemove={mod ? () => handleRemoveMod(i + 4) : undefined}
                        primeSymbol={primeMod?.symbol}
                        onClick={() => handleSlotClick(i + 4)}
                        isAdjustMode={adjustSlotTrackMode}
                        isAdjusted={adjustedSlots.has(i + 4)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Adjust Slot Track Button - centered below */}
            <div className="flex justify-center mt-8">
              <Button
                variant="outline"
                size="lg"
                onClick={toggleAdjustSlotTrack}
                className={cn(
                  'min-w-[240px] justify-center border-white/20 transition-all rounded-full',
                  adjustSlotTrackMode
                    ? 'border-blue-500 bg-blue-500/20 text-blue-200 shadow-lg shadow-blue-500/20'
                    : 'text-muted-foreground hover:border-blue-400/50 bg-black/40'
                )}
              >
                <Settings className={cn('w-4 h-4 mr-2', adjustSlotTrackMode && 'animate-spin')} />
                Adjust Slot Track
                <span
                  className={cn(
                    'ml-3 rounded-full px-3 py-1 text-xs font-bold',
                    adjustSlotTrackMode ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                  )}
                >
                  {adjustSlotTrackMode ? 'ON' : 'OFF'}
                </span>
              </Button>
            </div>
          </div>

          {/* Info cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {primeMod?.symbol && (
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-muted-foreground">
                <span className="text-primary font-semibold">Symbol Bonus:</span> Mods with the {primeMod.symbol} symbol cost 50% less tolerance.
              </div>
            )}
            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-muted-foreground">
              <span className="text-primary font-semibold">Tip:</span> Use Adjust Slot Track to manage tolerance without exceeding the cap.
            </div>
          </div>
        </div>

        {/* Action buttons section */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveAll}
              disabled={!hasAnyMods}
              className="min-w-[150px] border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive disabled:text-muted-foreground disabled:border-muted"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove All
            </Button>
            <Button
              onClick={onOpenModSelector}
              size="sm"
              className="min-w-[150px] bg-primary/90 hover:bg-primary text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              Browse Mods
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
