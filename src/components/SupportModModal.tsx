'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { allMods } from '@/lib/data';
import type { Character, Weapon, Mod, ModType, ModRarity, Element as ModElement } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Star, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MultiSelectFilter } from '@/components/multi-select-filter';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

const SUPPORT_SLOT_CAPACITY = 9;

const normalizeSupportModSlots = (mods: (Mod | null)[]) => {
    const capacity = mods.length > 0 ? mods.length : SUPPORT_SLOT_CAPACITY;
    const normalized = [...mods];
    if (normalized.length < capacity) {
        normalized.push(...Array(capacity - normalized.length).fill(null));
    } else if (normalized.length > capacity) {
        normalized.length = capacity;
    }
    return normalized;
};

const RarityStars = ({ rarity }: { rarity: ModRarity }) => (
    <div className="flex items-center">
        {[...Array(rarity)].map((_, i) => (
            <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
        ))}
    </div>
);

const ModSlot = ({
    mod,
    onDrop,
    onDragOver,
    onRemove
}: {
    mod: Mod | null;
    onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
    onRemove?: () => void;
}) => {
    return (
        <div
            className="relative aspect-square rounded-2xl border border-dashed border-white/30 bg-black/40 flex items-center justify-center overflow-hidden group transition-colors hover:border-blue-400/60"
            onDrop={onDrop}
            onDragOver={onDragOver}
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-1">
                        <p className="text-white text-center font-bold text-[10px] leading-tight line-clamp-2">{mod.name}</p>
                    </div>
                    {mod.symbol && (
                        <div className="absolute top-1 right-1 bg-black/70 text-white text-xs px-1 rounded-sm font-bold">
                            {mod.symbol}
                        </div>
                    )}
                    <div className="absolute top-1 left-1">
                        <RarityStars rarity={mod.rarity} />
                    </div>
                    {onRemove && (
                        <button
                            onClick={onRemove}
                            className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 z-20 hover:bg-destructive/80 transition-colors"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>
            ) : (
                <span className="text-muted-foreground text-3xl">+</span>
            )}
        </div>
    );
};

const ModCard = ({
    mod,
    onDragStart,
    onClick
}: {
    mod: Mod;
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
    onClick: () => void;
}) => {
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
                        <Card className={cn("overflow-hidden border-2 bg-card/50 transition-colors group-hover:border-primary", {
                            'border-yellow-400/50': mod.rarity === 5,
                            'border-purple-400/50': mod.rarity === 4,
                            'border-blue-400/50': mod.rarity === 3,
                            'border-green-400/50': mod.rarity === 2,
                        })}>
                            <div className="relative h-20 bg-black/20">
                                <Image
                                    src={mod.image}
                                    alt={mod.name}
                                    fill
                                    className="object-cover"
                                    data-ai-hint="abstract pattern"
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
                            </div>
                            <CardContent className="p-2">
                                <p className="font-bold text-sm truncate">{mod.name}</p>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{mod.mainAttribute}</p>
                            </CardContent>
                        </Card>
                    </div>
                </TooltipTrigger>
                <TooltipContent side="left" align="start" className="w-80">
                    <div className="p-2 space-y-3">
                        <div className='space-y-1'>
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-base text-foreground">{mod.name}</h4>
                                <div className='flex items-center gap-1'>
                                    {mod.symbol && <div className="bg-black/50 text-white text-xs p-1 rounded-sm font-bold">{mod.symbol}</div>}
                                    <RarityStars rarity={mod.rarity} />
                                </div>
                            </div>
                            <div className="flex gap-2 text-xs text-muted-foreground">
                                <span>{mod.modType}</span>
                                {mod.element && <><span>&bull;</span> <span>{mod.element}</span></>}
                            </div>
                        </div>

                        <div className="space-y-1 text-sm">
                            <p className="font-semibold text-primary">Main Attribute</p>
                            <p className="text-foreground">{mod.mainAttribute}</p>
                        </div>

                        {mod.effect && (
                            <div className="space-y-1 text-sm">
                                <p className="font-semibold text-primary">Effect</p>
                                <p className="text-muted-foreground">{mod.effect}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-2 text-xs">
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
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

export interface SupportModModalProps {
    item: Character | Weapon | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialMods: (Mod | null)[];
    onSave: (mods: (Mod | null)[]) => void;
}

function SupportModModal({
    item,
    open,
    onOpenChange,
    initialMods,
    onSave
}: SupportModModalProps) {
    const [mods, setMods] = useState<(Mod | null)[]>(() => normalizeSupportModSlots(initialMods));
    const [searchQuery, setSearchQuery] = useState('');
    const [modTypeFilters, setModTypeFilters] = useState<ModType[]>([]);
    const [rarityFilters, setRarityFilters] = useState<ModRarity[]>([]);
    const [elementFilter, setElementFilter] = useState<ModElement | 'All'>('All');

    useEffect(() => {
        setMods(normalizeSupportModSlots(initialMods));
    }, [initialMods, open]);

    const handleRemoveMod = (index: number) => {
        const newMods = [...mods];
        newMods[index] = null;
        setMods(newMods);
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, mod: Mod) => {
        e.dataTransfer.setData("modName", mod.name);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        const modName = e.dataTransfer.getData("modName");
        const mod = allMods.find(m => m.name === modName);
        if (mod) {
            const newMods = [...mods];
            newMods[index] = mod;
            setMods(newMods);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleModClick = (mod: Mod) => {
        const newMods = [...mods];
        const emptySlotIndex = newMods.findIndex(slot => slot === null);
        if (emptySlotIndex !== -1) {
            newMods[emptySlotIndex] = mod;
            setMods(newMods);
        }
    };

    const handleSave = () => {
        onSave(mods);
        onOpenChange(false);
    };

    const toggleModType = (type: ModType) => {
        setModTypeFilters(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const toggleRarity = (rarity: ModRarity) => {
        setRarityFilters(prev =>
            prev.includes(rarity) ? prev.filter(r => r !== rarity) : [...prev, rarity]
        );
    };

    const filteredMods = useMemo(() => {
        return allMods.filter(mod => {
            const searchLower = searchQuery.toLowerCase();
            const searchMatch = !searchQuery ||
                mod.name.toLowerCase().includes(searchLower) ||
                mod.mainAttribute.toLowerCase().includes(searchLower) ||
                (mod.effect && mod.effect.toLowerCase().includes(searchLower));

            const typeMatch = modTypeFilters.length === 0 || modTypeFilters.includes(mod.modType);
            const rarityMatch = rarityFilters.length === 0 || rarityFilters.includes(mod.rarity);
            const elementMatch = elementFilter === 'All' || !mod.element || mod.element === elementFilter;

            return searchMatch && typeMatch && rarityMatch && elementMatch;
        });
    }, [searchQuery, modTypeFilters, rarityFilters, elementFilter]);

    if (!item) return null;

    const leftMods = mods.slice(0, 4);
    const rightMods = mods.slice(4, 8);
    const filledSlots = mods.filter(m => m !== null).length;

    // Calculate total tolerance
    const totalTolerance = mods.reduce((sum, mod) => {
        if (!mod) return sum;
        return sum + mod.tolerance;
    }, 0);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle>Configure Mods for {item.name}</DialogTitle>
                    <DialogDescription>
                        Add up to {mods.length} mods for this support item.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[calc(95vh-180px)]">
                    <div className="space-y-6 py-4 pr-4">
                        {/* 4-1-4 Layout with Tolerance Circle */}
                        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-slate-950/80 via-slate-900/60 to-slate-900/40 p-6 shadow-inner">
                            <div className="flex items-center justify-between mb-6">
                                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
                                    Character Set
                                </p>
                                <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-center">
                                    <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Slots</p>
                                    <p className="text-xl font-semibold text-foreground">{filledSlots}/{mods.length}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-4 lg:gap-8">
                                {/* Left 4 slots (2x2 grid) */}
                                <div className="grid grid-cols-2 gap-3 lg:gap-4">
                                    {leftMods.map((mod, i) => (
                                        <div key={`left-${i}`} className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24">
                                            <ModSlot
                                                mod={mod}
                                                onDrop={(e) => handleDrop(e, i)}
                                                onDragOver={handleDragOver}
                                                onRemove={mod ? () => handleRemoveMod(i) : undefined}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Center - Tolerance Display */}
                                <div className="flex flex-col items-center">
                                    <div className="relative">
                                        <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full bg-gradient-to-br from-slate-900 via-slate-950 to-black border-2 border-blue-500/30 shadow-2xl shadow-blue-500/20 flex flex-col items-center justify-center">
                                            <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-muted-foreground mb-1 sm:mb-2">Tolerance</p>
                                            <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">{totalTolerance}</p>
                                            <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-muted-foreground mt-1">Total</p>
                                        </div>
                                        <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-2xl -z-10" />
                                    </div>
                                </div>

                                {/* Right 4 slots (2x2 grid) */}
                                <div className="grid grid-cols-2 gap-3 lg:gap-4">
                                    {rightMods.map((mod, i) => (
                                        <div key={`right-${i}`} className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24">
                                            <ModSlot
                                                mod={mod}
                                                onDrop={(e) => handleDrop(e, i + 4)}
                                                onDragOver={handleDragOver}
                                                onRemove={mod ? () => handleRemoveMod(i + 4) : undefined}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 9th slot below if needed */}
                            {mods.length > 8 && (
                                <div className="flex justify-center mt-6">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24">
                                        <ModSlot
                                            mod={mods[8]}
                                            onDrop={(e) => handleDrop(e, 8)}
                                            onDragOver={handleDragOver}
                                            onRemove={mods[8] ? () => handleRemoveMod(8) : undefined}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mod Browser Section */}
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, attribute, or effect..."
                                    className="h-12 rounded-xl border border-blue-500/40 bg-black/30 pl-12 text-sm placeholder:text-muted-foreground"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                                    <Select value={elementFilter} onValueChange={(v) => setElementFilter(v as ModElement | 'All')}>
                                        <SelectTrigger className="h-12 rounded-xl border border-white/10 bg-black/30 text-sm">
                                            <SelectValue placeholder="All Elements" />
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

                            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 min-h-[300px]">
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                    {filteredMods.map((mod, index) => (
                                        <ModCard
                                            key={`${mod.name}-${index}`}
                                            mod={mod}
                                            onDragStart={(e) => handleDragStart(e, mod)}
                                            onClick={() => handleModClick(mod)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default SupportModModal;
