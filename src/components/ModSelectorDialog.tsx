'use client';

import { useState, useMemo } from 'react';
import type { Mod, ModRarity, ModType, Element as ModElement } from '@/lib/types';
import { allMods } from '@/lib/data';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiSelectFilter } from '@/components/multi-select-filter';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getRarityGradient } from '@/lib/mod-styles';

interface ModSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectMod: (mod: Mod) => void;
  onSelectPrimeMod: (mod: Mod) => void;
}

const RarityStars = ({ rarity }: { rarity: ModRarity }) => (
  <div className="flex items-center">
    {[...Array(rarity)].map((_, i) => (
      <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
    ))}
  </div>
);

const ModCard = ({ mod, onDragStart, onClick }: { mod: Mod; onDragStart: (e: React.DragEvent<HTMLDivElement>) => void; onClick: () => void }) => {
  const rarityGradient = getRarityGradient(mod.rarity);

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            draggable="true"
            onDragStart={onDragStart}
            onClick={onClick}
            className="cursor-grab active:cursor-grabbing group"
          >
            <Card
              className={cn(
                'overflow-hidden border-2 transition-colors group-hover:border-primary bg-gradient-to-b',
                rarityGradient,
                {
                  'border-yellow-400/50': mod.rarity === 5,
                  'border-purple-400/50': mod.rarity === 4,
                  'border-blue-400/50': mod.rarity === 3,
                  'border-green-400/50': mod.rarity === 2,
                }
              )}
            >
              <div className="relative h-20 overflow-hidden">
                <Image src={mod.image} alt={mod.name} fill className="object-cover" data-ai-hint="abstract pattern" />
                <div
                  className={cn(
                    'absolute inset-0 opacity-80 bg-gradient-to-b transition-colors',
                    rarityGradient
                  )}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-1 left-1">
                  <RarityStars rarity={mod.rarity} />
                </div>
                {mod.symbol && (
                  <div className="absolute top-1 right-1 bg-black/50 text-white text-xs p-1 rounded-sm font-bold">
                    {mod.symbol}
                  </div>
                )}
                {mod.isPrimeMod && mod.toleranceBoost && (
                  <div className="absolute top-1 left-1 bg-yellow-600/90 text-white text-xs px-1.5 py-0.5 rounded font-bold">
                    +{mod.toleranceBoost}
                  </div>
                )}
                {mod.centerOnly && (
                  <div className="absolute top-1 left-1 bg-cyan-600/90 text-white text-xs px-1.5 py-0.5 rounded font-bold">
                    CENTER
                  </div>
                )}
              </div>
              <CardContent className="p-2">
                <p className="font-bold text-sm truncate">{mod.name}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{mod.mainAttribute}</p>
              </CardContent>
            </Card>
          </div>
        </TooltipTrigger>
      <TooltipContent side="left" align="start" className="w-72">
        <div className="p-3 space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between items-start gap-2">
              <h4 className="font-bold text-base text-foreground">{mod.name}</h4>
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

          <div className="space-y-1 text-sm">
            <p className="font-semibold text-primary">Main Attribute</p>
            <p className="text-foreground">{mod.mainAttribute}</p>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tolerance</span>
              <span className="font-medium text-foreground">{mod.tolerance}</span>
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
            <div className="flex justify-between col-span-2">
              <span className="text-muted-foreground">Source</span>
              <span className="font-medium text-foreground">{mod.source}</span>
            </div>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
  );
};

export function ModSelectorDialog({ open, onOpenChange, onSelectMod, onSelectPrimeMod }: ModSelectorDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [modTypeFilters, setModTypeFilters] = useState<ModType[]>([]);
  const [rarityFilters, setRarityFilters] = useState<ModRarity[]>([]);
  const [elementFilter, setElementFilter] = useState<ModElement | 'All'>('All');

  const primeMods = useMemo(() => allMods.filter(m => m.isPrimeMod), []);
  const centerOnlyMods = useMemo(() => allMods.filter(m => m.centerOnly && !m.isPrimeMod), []);
  const regularMods = useMemo(() => allMods.filter(m => !m.isPrimeMod && !m.centerOnly), []);

  const filterMods = (mods: Mod[]) => {
    return mods.filter(mod => {
      const searchLower = searchQuery.toLowerCase();
      const searchMatch =
        !searchQuery ||
        mod.name.toLowerCase().includes(searchLower) ||
        mod.mainAttribute.toLowerCase().includes(searchLower) ||
        (mod.effect && mod.effect.toLowerCase().includes(searchLower));

      const typeMatch = modTypeFilters.length === 0 || modTypeFilters.includes(mod.modType);
      const rarityMatch = rarityFilters.length === 0 || rarityFilters.includes(mod.rarity);
      const elementMatch = elementFilter === 'All' || !mod.element || mod.element === elementFilter;

      return searchMatch && typeMatch && rarityMatch && elementMatch;
    });
  };

  const filteredPrimeMods = useMemo(() => filterMods(primeMods), [primeMods, searchQuery, modTypeFilters, rarityFilters, elementFilter]);
  const filteredCenterOnlyMods = useMemo(() => filterMods(centerOnlyMods), [centerOnlyMods, searchQuery, modTypeFilters, rarityFilters, elementFilter]);
  const filteredRegularMods = useMemo(() => filterMods(regularMods), [regularMods, searchQuery, modTypeFilters, rarityFilters, elementFilter]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, mod: Mod) => {
    e.dataTransfer.setData('modName', mod.name);
  };

  const toggleModType = (type: ModType) => {
    setModTypeFilters(prev => (prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]));
  };

  const toggleRarity = (rarity: ModRarity) => {
    setRarityFilters(prev => (prev.includes(rarity) ? prev.filter(r => r !== rarity) : [...prev, rarity]));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Select Mods</DialogTitle>
          <DialogDescription>
            Drag mods into slots or click to add them.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, attribute, or effect..."
                className="pl-10 bg-input"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <MultiSelectFilter
                label="All Types"
                options={[
                  { value: 'Characters' as ModType, label: 'Characters' },
                  { value: 'Melee Weapon' as ModType, label: 'Melee Weapon' },
                  { value: 'Ranged Weapon' as ModType, label: 'Ranged Weapon' },
                  { value: 'Melee Consonance Weapon' as ModType, label: 'Melee Consonance' },
                  { value: 'Ranged Consonance Weapon' as ModType, label: 'Ranged Consonance' },
                ]}
                selected={modTypeFilters}
                onToggle={toggleModType}
                onClear={() => setModTypeFilters([])}
              />
              <MultiSelectFilter
                label="All Rarity"
                options={[
                  { value: 5 as ModRarity, label: '5 ★' },
                  { value: 4 as ModRarity, label: '4 ★' },
                  { value: 3 as ModRarity, label: '3 ★' },
                  { value: 2 as ModRarity, label: '2 ★' },
                ]}
                selected={rarityFilters}
                onToggle={toggleRarity}
                onClear={() => setRarityFilters([])}
              />
              {(modTypeFilters.length === 0 || modTypeFilters.includes('Characters')) && (
                <Select value={elementFilter} onValueChange={v => setElementFilter(v as ModElement | 'All')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by Element" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Elements</SelectItem>
                    <SelectItem value="Lumino">Lumino</SelectItem>
                    <SelectItem value="Anemo">Anemo</SelectItem>
                    <SelectItem value="Hydro">Hydro</SelectItem>
                    <SelectItem value="Pyro">Pyro</SelectItem>
                    <SelectItem value="Electro">Electro</SelectItem>
                    <SelectItem value="Umbro">Umbro</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Tabs for Prime, Center-Only, and Regular Mods */}
          <Tabs defaultValue="regular" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="regular">
                Regular ({filteredRegularMods.length})
              </TabsTrigger>
              <TabsTrigger value="center">
                Center Only ({filteredCenterOnlyMods.length})
              </TabsTrigger>
              <TabsTrigger value="prime">
                Prime ({filteredPrimeMods.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="regular" className="mt-4">
              <ScrollArea className="h-[50vh] rounded-md border p-4 bg-background/50">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {filteredRegularMods.map((mod, index) => (
                    <ModCard
                      key={`${mod.name}-${index}`}
                      mod={mod}
                      onDragStart={e => handleDragStart(e, mod)}
                      onClick={() => onSelectMod(mod)}
                    />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="center" className="mt-4">
              <ScrollArea className="h-[50vh] rounded-md border p-4 bg-background/50">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    These mods can only be equipped in the center slot
                  </p>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {filteredCenterOnlyMods.map((mod, index) => (
                      <ModCard
                        key={`${mod.name}-${index}`}
                        mod={mod}
                        onDragStart={e => handleDragStart(e, mod)}
                        onClick={() => onSelectPrimeMod(mod)}
                      />
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="prime" className="mt-4">
              <ScrollArea className="h-[50vh] rounded-md border p-4 bg-background/50">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Prime mods increase tolerance capacity
                  </p>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {filteredPrimeMods.map((mod, index) => (
                      <ModCard
                        key={`${mod.name}-${index}`}
                        mod={mod}
                        onDragStart={e => handleDragStart(e, mod)}
                        onClick={() => onSelectPrimeMod(mod)}
                      />
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
