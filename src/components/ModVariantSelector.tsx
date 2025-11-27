'use client';

import { useState } from 'react';
import type { Mod, ModRarity, Element as ModElement } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ModVariantSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variants: Mod[];
  ocrText: string;
  onSelect: (mod: Mod) => void;
  onSkip: () => void;
  characterElement?: string;
}

const RarityStars = ({ rarity }: { rarity: ModRarity }) => (
  <div className="flex items-center gap-0.5" style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.8))' }}>
    {[...Array(rarity)].map((_, i) => (
      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
    ))}
  </div>
);

const getRarityBorderColor = (rarity: ModRarity) => {
  const colors: Record<ModRarity, string> = {
    5: 'border-yellow-400/70',
    4: 'border-purple-400/70',
    3: 'border-blue-400/70',
    2: 'border-green-400/70',
  };
  return colors[rarity] || 'border-border';
};

const getElementColor = (element?: ModElement) => {
  const colors: Record<string, string> = {
    'Lumino': 'bg-yellow-400/10',
    'Umbro': 'bg-purple-400/10',
    'Pyro': 'bg-red-400/10',
    'Anemo': 'bg-cyan-400/10',
    'Electro': 'bg-violet-400/10',
    'Hydro': 'bg-blue-400/10',
  };
  return element ? colors[element] || '' : '';
};

const ModTooltipContent = ({ mod }: { mod: Mod }) => {
  return (
    <div className="p-3 space-y-3 max-w-sm">
      <div className="space-y-1">
        <div className="flex justify-between items-start gap-2">
          <h4 className="font-bold text-base text-foreground">{mod.name}</h4>
          <div className="flex items-center gap-1 flex-shrink-0">
            {mod.symbol && (
              <div className="bg-black/50 text-white text-xs px-1.5 py-0.5 rounded-sm font-bold">
                {mod.symbol}
              </div>
            )}
            <RarityStars rarity={mod.rarity} />
          </div>
        </div>
        <div className="flex gap-2 text-xs text-muted-foreground">
          <span>{mod.modType}</span>
          {mod.element && (
            <>
              <span>&bull;</span>
              <span>{mod.element}</span>
            </>
          )}
        </div>
      </div>

      <div className="space-y-1 text-sm">
        <p className="font-semibold text-primary">Main Attribute</p>
        <p className="text-foreground">{mod.mainAttribute}</p>
      </div>

      {mod.effect && (
        <div className="space-y-1 text-sm">
          <p className="font-semibold text-primary">Effect</p>
          <p className="text-muted-foreground leading-relaxed">{mod.effect}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-2 text-xs border-t border-border/50">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tolerance</span>
          <span className="font-medium text-foreground">{mod.tolerance}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Track</span>
          <span className="font-medium text-foreground">{mod.track}</span>
        </div>
        <div className="flex justify-between col-span-2">
          <span className="text-muted-foreground">Source</span>
          <span className="font-medium text-foreground">{mod.source}</span>
        </div>
      </div>

      {(mod.isPrimeMod || mod.centerOnly) && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
          {mod.isPrimeMod && mod.toleranceBoost && (
            <div className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded-md font-semibold">
              Prime Mod (+{mod.toleranceBoost} Tolerance)
            </div>
          )}
          {mod.centerOnly && (
            <div className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded-md font-semibold">
              Center Only
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export function ModVariantSelector({
  open,
  onOpenChange,
  variants,
  ocrText,
  onSelect,
  onSkip,
  characterElement,
}: ModVariantSelectorProps) {
  const [selectedMod, setSelectedMod] = useState<Mod | null>(null);

  const handleConfirm = () => {
    if (selectedMod) {
      onSelect(selectedMod);
      setSelectedMod(null);
    }
  };

  const handleSkip = () => {
    setSelectedMod(null);
    onSkip();
  };

  // Filter variants by character element if provided
  const filteredVariants = characterElement
    ? variants.filter(mod => !mod.element || mod.element === characterElement)
    : variants;

  if (filteredVariants.length === 0) return null;

  const baseName = filteredVariants[0].name;
  const hasMultipleRarities = new Set(filteredVariants.map(v => v.rarity)).size > 1;
  const hasMultipleElements = new Set(filteredVariants.map(v => v.element).filter(Boolean)).size > 1;
  const elementFiltered = characterElement && filteredVariants.every(v => !v.element || v.element === characterElement);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-xl">เลือก Mod ที่ถูกต้อง</DialogTitle>
          <DialogDescription className="text-base">
            OCR ตรวจพบ: <span className="font-semibold text-foreground">"{ocrText}"</span>
            {filteredVariants.length > 1 && filteredVariants[0].name === baseName && (
              <>
                <br />พบ {filteredVariants.length} แบบของ "{baseName}" - กรุณาเลือกแบบที่ถูกต้อง
              </>
            )}
            {filteredVariants.length > 1 && filteredVariants[0].name !== baseName && (
              <>
                <br />กรุณาเลือก mod ที่ตรงกับที่เห็นในรูป
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {characterElement && elementFiltered && (
            <div className="rounded-lg border border-primary/50 bg-primary/10 p-3 text-sm">
              <span className="font-semibold text-primary">Element ถูกเลือกอัตโนมัติ:</span>{' '}
              <span className="text-foreground">
                กรองเฉพาะ mods ที่ตรงกับ element ของตัวละคร ({characterElement})
              </span>
            </div>
          )}
          {hasMultipleRarities && (
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold">มีหลายระดับดาว:</span> เลือกจำนวนดาวที่ถูกต้อง
            </div>
          )}
          {hasMultipleElements && !elementFiltered && (
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold">มีหลาย element:</span> เลือก element ที่ถูกต้อง
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-[65vh] overflow-y-auto p-2">
            {filteredVariants.map((mod, index) => (
              <TooltipProvider key={`${mod.name}-${mod.rarity}-${mod.element}-${index}`} delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card
                      className={cn(
                        'cursor-pointer transition-all hover:scale-105 border-[3px] overflow-hidden',
                        selectedMod === mod
                          ? 'border-primary shadow-lg shadow-primary/20 ring-2 ring-primary/50'
                          : cn(getRarityBorderColor(mod.rarity), 'hover:border-primary/50'),
                        getElementColor(mod.element)
                      )}
                      onClick={() => setSelectedMod(mod)}
                    >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={mod.image}
                    alt={mod.name}
                    fill
                    className="object-cover"
                    data-ai-hint="abstract pattern"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                  {/* Rarity */}
                  <div className="absolute top-2 left-2 z-10">
                    <RarityStars rarity={mod.rarity} />
                  </div>

                  {/* Symbol */}
                  {mod.symbol && (
                    <div className="absolute top-2 right-2 bg-black/80 text-white text-sm px-2 py-1 rounded font-bold z-10">
                      {mod.symbol}
                    </div>
                  )}

                  {/* Element Badge */}
                  {mod.element && (
                    <div className={cn(
                      "absolute bottom-2 left-2 text-white text-xs px-2 py-1 rounded-full font-bold z-10",
                      mod.element === 'Lumino' ? 'bg-yellow-500/90' : 
                      mod.element === 'Umbro' ? 'bg-purple-500/90' :
                      mod.element === 'Pyro' ? 'bg-red-500/90' :
                      mod.element === 'Hydro' ? 'bg-blue-500/90' :
                      mod.element === 'Electro' ? 'bg-violet-500/90' :
                      mod.element === 'Anemo' ? 'bg-cyan-500/90' : 'bg-gray-500/90'
                    )}>
                      {mod.element}
                    </div>
                  )}
                  
                  {/* Variant Badge */}
                  {mod.variant && (
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-semibold z-10">
                      {mod.variant}
                    </div>
                  )}

                  {/* Selected indicator */}
                  {selectedMod === mod && (
                    <div className="absolute inset-0 bg-primary/30 flex items-center justify-center z-20">
                      <div className="bg-primary text-primary-foreground rounded-full p-3 shadow-lg">
                        <svg
                          className="w-10 h-10"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                <CardContent className="p-3 bg-card">
                  <div className="space-y-2">
                    <p className="font-bold text-sm line-clamp-2 min-h-[2.5rem]">
                      {mod.name}
                      {mod.variant && <span className="text-primary"> • {mod.variant}</span>}
                    </p>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      <span className="font-medium">{mod.mainAttribute}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-medium">Tolerance: {mod.tolerance}</span>
                      <span className="font-medium">Track: {mod.track}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent side="top" align="center" className="z-[9999]">
              <ModTooltipContent mod={mod} />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
            ))}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleSkip}>
            Skip This Mod
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedMod}>
            Confirm Selection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
