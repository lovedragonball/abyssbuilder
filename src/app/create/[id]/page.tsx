'use client';

import { useState, useMemo, useEffect } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { allCharacters, allWeapons, allMods, allMeleeWeapons, allRangedWeapons } from '@/lib/data';
import type { Character, Weapon } from '@/lib/types';
import type { Mod, ModRarity, ModType, Element as ModElement } from '@/lib/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Plus, Search, X, Users, Crosshair, Star, Settings } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MultiSelectFilter } from '@/components/multi-select-filter';

const SUPPORT_SLOT_CAPACITY = 9;
const CONSONANCE_SLOT_CAPACITY = 4;

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

const ModSlot = ({ mod, onDrop, onDragOver, onRemove }: { mod: Mod | null, onDrop?: (e: React.DragEvent<HTMLDivElement>) => void, onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void, onRemove?: () => void }) => {
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
}

const ModCard = ({ mod, onDragStart, onClick }: {
    mod: Mod,
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => void,
    onClick: () => void
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
                                    layout="fill"
                                    objectFit="cover"
                                    data-ai-hint="abstract pattern" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                <div className="absolute bottom-1 left-1">
                                    <RarityStars rarity={mod.rarity} />
                                </div>
                                {mod.symbol && <div className="absolute top-1 right-1 bg-black/50 text-white text-xs p-1 rounded-sm font-bold">{mod.symbol}</div>}
                            </div>
                            <CardContent className="p-2">
                                <p className="font-bold text-sm truncate">{mod.name}</p>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{mod.mainAttribute}</p>
                            </CardContent>
                        </Card>
                    </div>
                </TooltipTrigger>
                <TooltipContent side="left" align="start" className="w-80 z-[9999] overflow-visible">
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


const CharacterCard = ({ character, onSelect }: { character: Character, onSelect: () => void }) => (
    <Card
        className="overflow-hidden cursor-pointer hover:border-primary transition-colors"
        onClick={onSelect}
    >
        <div className="relative aspect-square">
            <Image src={character.image} alt={character.name} fill className="object-cover" />
        </div>
        <CardHeader className="p-2">
            <CardTitle className="text-sm text-center truncate">{character.name}</CardTitle>
        </CardHeader>
    </Card>
);

const WeaponCard = ({ weapon, onSelect }: { weapon: Weapon, onSelect: () => void }) => (
    <Card
        className="overflow-hidden cursor-pointer hover:border-primary transition-colors"
        onClick={onSelect}
    >
        <div className="relative aspect-square">
            <Image src={weapon.image} alt={weapon.name} fill className="object-cover" />
        </div>
        <CardHeader className="p-2">
            <CardTitle className="text-sm text-center truncate">{weapon.name}</CardTitle>
        </CardHeader>
    </Card>
);

const BASE_ATTACK_RATIO = 12.552;

const STAT_LABEL_MAP: Record<string, string> = {
    critChance: 'CRIT Chance',
    critDamage: 'CRIT Damage',
    atkSpeed: 'ATK Speed',
    triggerProbability: 'Trigger Probability',
    multishot: 'Multishot',
    magCapacity: 'Mag Capacity',
    maxAmmo: 'Max Ammo',
    ammoConversionRate: 'Ammo Conversion Rate',
    atkRange: 'ATK Range',
    projectileExplosionRange: 'Explosion Range',
};

const formatNumber = (value: number) => (Number.isInteger(value) ? value.toString() : value.toFixed(2));
const formatStatValue = (value: string | number) => (typeof value === 'number' ? formatNumber(value) : value);
const formatStatLabel = (key: string) => STAT_LABEL_MAP[key] ?? key.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase());
const getBaseAttack = (weapon: Weapon) => weapon.baseAttack ?? Math.round(weapon.maxAttack / BASE_ATTACK_RATIO);

const StatBadge = ({ label, value }: { label: string; value: string }) => (
    <div className="rounded-lg border border-border/40 bg-background/60 px-3 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-base font-semibold text-foreground">{value}</p>
    </div>
);

const WeaponInfoCard = ({ weapon }: { weapon: Weapon }) => {
    const statEntries = Object.entries(weapon.stats ?? {}).filter(
        (entry): entry is [string, string | number] => entry[1] !== undefined && entry[1] !== null
    );
    const attackLabel = `${weapon.attackType.toUpperCase()} ATK`;
    const baseAttack = getBaseAttack(weapon);

    return (
        <Card className="bg-card/60 backdrop-blur">
            <CardHeader>
                <CardTitle className="text-lg font-semibold tracking-wide">Weapon Details</CardTitle>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {weapon.element ?? 'Neutral'} • {weapon.type} • {weapon.attackType}
                </p>
            </CardHeader>
            <CardContent className="space-y-6">
                <section className="space-y-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Stats</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <StatBadge label={`${attackLabel} (Lv. 1)`} value={formatNumber(baseAttack)} />
                        <StatBadge label={`${attackLabel} (Lv. MAX)`} value={formatNumber(weapon.maxAttack)} />
                        {statEntries.map(([key, value]) => (
                            <StatBadge key={key} label={formatStatLabel(key)} value={formatStatValue(value)} />
                        ))}
                    </div>
                </section>

                {weapon.attributes && Object.keys(weapon.attributes).length > 0 && (
                    <section className="space-y-3">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                            Attributes
                        </p>
                        <div className="space-y-2 rounded-xl border border-border/40 bg-background/40 p-2">
                            {Object.entries(weapon.attributes).map(([label, value]) => (
                                <div
                                    key={label}
                                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-background/60"
                                >
                                    <span className="text-muted-foreground">{label}</span>
                                    <span className="font-semibold text-foreground">
                                        {typeof value === 'number' ? formatNumber(value) : value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <section className="space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Skill</p>
                    <div className="rounded-xl border border-border/40 bg-background/50 p-4 space-y-2">
                        <p className="text-sm font-semibold uppercase text-primary">{weapon.skillType ?? 'Skill'}</p>
                        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                            {weapon.passiveEffect ?? 'No passive information available yet.'}
                        </p>
                    </div>
                </section>
            </CardContent>
        </Card>
    );
};

const CharacterSelectionModal = ({ onSelect, open, onOpenChange }: { onSelect: (character: Character) => void, open: boolean, onOpenChange: (open: boolean) => void }) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
            <DialogHeader>
                <DialogTitle>Select a Character</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[60vh]">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
                    {allCharacters.map(char => (
                        <CharacterCard key={char.id} character={char} onSelect={() => onSelect(char)} />
                    ))}
                </div>
            </ScrollArea>
        </DialogContent>
    </Dialog>
);

const WeaponSelectionModal = ({ onSelect, open, onOpenChange }: { onSelect: (weapon: Weapon) => void, open: boolean, onOpenChange: (open: boolean) => void }) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Select a Weapon</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[60vh]">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
                        {allWeapons.map(weapon => (
                            <WeaponCard key={weapon.id} weapon={weapon} onSelect={() => onSelect(weapon)} />
                        ))}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

// Part A: SupportModModal Component
const SupportModModal = ({
    item,
    open,
    onOpenChange,
    initialMods,
    allowedModTypes,
    onSave
}: {
    item: Character | Weapon | null,
    open: boolean,
    onOpenChange: (open: boolean) => void,
    initialMods: (Mod | null)[],
    allowedModTypes?: ModType[],
    onSave: (mods: (Mod | null)[]) => void
}) => {
    const [mods, setMods] = useState<(Mod | null)[]>(() => normalizeSupportModSlots(initialMods));
    const [searchQuery, setSearchQuery] = useState('');
    const [modTypeFilters, setModTypeFilters] = useState<ModType[]>([]);
    const [rarityFilters, setRarityFilters] = useState<ModRarity[]>([]);
    const [elementFilter, setElementFilter] = useState<ModElement | 'All'>('All');
    const { toast } = useToast();

    const canEquipMultiple = (mod: Mod) => {
        return mod.effect?.includes('can be equipped in multiples') || false;
    };

    const canEquipWithExisting = (newMod: Mod, existingMods: (Mod | null)[]) => {
        // If the mod can't be equipped in multiples at all, no duplicates allowed
        if (!canEquipMultiple(newMod)) {
            return !existingMods.some(slot => slot?.name === newMod.name);
        }

        // If it can be equipped in multiples, check if any existing mod with same name has different rarity
        const sameNameMods = existingMods.filter(slot => slot?.name === newMod.name);
        if (sameNameMods.length === 0) return true;

        // All existing mods with same name must have same rarity
        return sameNameMods.every(existing => existing?.rarity === newMod.rarity);
    };

    const isElementMatch = (mod: Mod) => {
        // If mod has no element, it can be equipped on anything
        if (!mod.element) return true;
        // If item has no element, allow all mods
        if (!item?.element) return true;
        // Otherwise, elements must match
        return mod.element === item.element;
    };

    // Part B Features
    const [adjustedSlots, setAdjustedSlots] = useState<Set<number>>(new Set());
    const [adjustSlotTrackMode, setAdjustSlotTrackMode] = useState(false);

    useEffect(() => {
        setMods(normalizeSupportModSlots(initialMods));
        setAdjustedSlots(new Set());
        setAdjustSlotTrackMode(false);
    }, [initialMods, open]);

    const handleRemoveMod = (index: number) => {
        const newMods = [...mods];
        newMods[index] = null;
        setMods(newMods);

        if (adjustedSlots.has(index)) {
            const newAdjusted = new Set(adjustedSlots);
            newAdjusted.delete(index);
            setAdjustedSlots(newAdjusted);
        }
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, mod: Mod) => {
        e.dataTransfer.setData("modName", mod.name);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        const modName = e.dataTransfer.getData("modName");
        const mod = allMods.find(m => m.name === modName);
        if (mod) {
            // Check allowed types
            if (allowedModTypes && !allowedModTypes.includes(mod.modType)) {
                toast({
                    title: 'Invalid Mod Type',
                    description: `This slot only accepts ${allowedModTypes.join(', ')} mods.`,
                    variant: 'destructive',
                });
                return;
            }

            // Check element matching
            if (!isElementMatch(mod)) {
                toast({
                    title: 'Element Mismatch',
                    description: `${mod.name} (${mod.element}) cannot be equipped on ${item?.name || 'this item'} (${item?.element || 'unknown'}).`,
                    variant: 'destructive',
                });
                return;
            }

            // Check if mod can be equipped with existing mods (excluding the target slot)
            const modsExcludingTarget = mods.map((slot, i) => i === index ? null : slot);

            if (!canEquipWithExisting(mod, modsExcludingTarget)) {
                const hasSameName = modsExcludingTarget.some(slot => slot?.name === mod.name);
                const hasDifferentRarity = modsExcludingTarget.some(
                    slot => slot?.name === mod.name && slot?.rarity !== mod.rarity
                );

                if (hasDifferentRarity) {
                    toast({
                        title: 'Cannot Mix Rarities',
                        description: `${mod.name} is already equipped with a different rarity. Only same rarity duplicates are allowed.`,
                        variant: 'destructive',
                    });
                } else {
                    toast({
                        title: 'Cannot Equip Duplicate',
                        description: `${mod.name} is already equipped. This mod cannot be equipped multiple times.`,
                        variant: 'destructive',
                    });
                }
                return;
            }

            const newMods = [...mods];
            newMods[index] = mod;
            setMods(newMods);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleModClick = (mod: Mod) => {
        // Check allowed types
        if (allowedModTypes && !allowedModTypes.includes(mod.modType)) {
            toast({
                title: 'Invalid Mod Type',
                description: `This slot only accepts ${allowedModTypes.join(', ')} mods.`,
                variant: 'destructive',
            });
            return;
        }

        // Check element matching
        if (!isElementMatch(mod)) {
            toast({
                title: 'Element Mismatch',
                description: `${mod.name} (${mod.element}) cannot be equipped on ${item?.name || 'this item'} (${item?.element || 'unknown'}).`,
                variant: 'destructive',
            });
            return;
        }

        // Check if mod can be equipped with existing mods
        if (!canEquipWithExisting(mod, mods)) {
            const hasSameName = mods.some(slot => slot?.name === mod.name);
            const hasDifferentRarity = mods.some(
                slot => slot?.name === mod.name && slot?.rarity !== mod.rarity
            );

            if (hasDifferentRarity) {
                toast({
                    title: 'Cannot Mix Rarities',
                    description: `${mod.name} is already equipped with a different rarity. Only same rarity duplicates are allowed.`,
                    variant: 'destructive',
                });
            } else {
                toast({
                    title: 'Cannot Equip Duplicate',
                    description: `${mod.name} is already equipped. This mod cannot be equipped multiple times.`,
                    variant: 'destructive',
                });
            }
            return;
        }

        const newMods = [...mods];
        const emptySlotIndex = newMods.findIndex(slot => slot === null);
        if (emptySlotIndex !== -1) {
            newMods[emptySlotIndex] = mod;
            setMods(newMods);
        } else {
            toast({
                title: 'Slots Full',
                description: 'Remove a mod before adding another one.',
                variant: 'destructive',
            });
        }
    };

    const handleSave = () => {
        onSave(mods);
        onOpenChange(false);
    };

    const handleRemoveAllMods = () => {
        setMods(Array(mods.length).fill(null));
        setAdjustedSlots(new Set());
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

    const toggleAdjustSlotTrack = () => {
        setAdjustSlotTrackMode(!adjustSlotTrackMode);
    };

    const handleSlotClickForAdjust = (index: number) => {
        if (adjustSlotTrackMode) {
            const newAdjustedSlots = new Set(adjustedSlots);
            if (newAdjustedSlots.has(index)) {
                newAdjustedSlots.delete(index);
            } else {
                newAdjustedSlots.add(index);
            }
            setAdjustedSlots(newAdjustedSlots);
        }
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

            // Enforce allowed types
            const allowedTypeMatch = !allowedModTypes || allowedModTypes.includes(mod.modType);

            // Enforce element matching with item
            const itemElementMatch = isElementMatch(mod);

            return searchMatch && typeMatch && rarityMatch && elementMatch && allowedTypeMatch && itemElementMatch;
        });
    }, [searchQuery, modTypeFilters, rarityFilters, elementFilter, allowedModTypes, item]);

    if (!item) return null;

    const leftSlots = mods.slice(0, 4);
    const rightSlots = mods.slice(4, 8);
    const centerMod = mods[8]; // Slot 9 (Index 8)
    const filledSlots = mods.filter(m => m !== null).length;

    const totalTolerance = mods.reduce((sum, mod, index) => {
        if (!mod) return sum;
        let cost = mod.tolerance;
        if (adjustedSlots.has(index)) {
            cost = Math.ceil(cost / 2);
        }
        return sum + cost;
    }, 0);

    const ModalModSlot = ({ mod, index }: { mod: Mod | null, index: number }) => {
        const isAdjusted = adjustedSlots.has(index);
        const adjustedTolerance = mod && isAdjusted ? Math.ceil(mod.tolerance / 2) : mod?.tolerance;

        const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
            if (adjustSlotTrackMode) {
                e.stopPropagation();
                handleSlotClickForAdjust(index);
            }
        };

        return (
            <div className="space-y-3">
                <div
                    className={cn(
                        'relative aspect-square w-full overflow-hidden rounded-2xl border border-dashed border-white/20 bg-white/5/20 transition-all duration-300 group hover:border-blue-400/60 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/10',
                        mod && 'border-white/30 bg-black/40 shadow-inner',
                        adjustSlotTrackMode && 'cursor-pointer ring-1 ring-blue-400/60',
                        isAdjusted && 'border-emerald-400/70 shadow-[0_0_25px_rgba(16,185,129,0.35)]'
                    )}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragOver={handleDragOver}
                    onClick={handleClick}
                >
                    {/* Adjust Mode Indicator */}
                    {adjustSlotTrackMode && (
                        <div className="absolute inset-0 bg-blue-500/10 border-2 border-blue-400/30 pointer-events-none animate-pulse z-10" />
                    )}

                    {mod ? (
                        <>
                            <Image
                                src={mod.image}
                                alt={mod.name}
                                fill
                                className="object-cover animate-in fade-in zoom-in duration-500"
                                data-ai-hint="abstract pattern"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-black/80" />

                            <div className={cn(
                                'absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide shadow-lg flex items-center gap-1 border z-20',
                                isAdjusted
                                    ? 'border-emerald-400/80 bg-emerald-500/10 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                                    : 'border-white/20 bg-black/40 text-white'
                            )}>
                                {isAdjusted && (
                                    <span className="line-through opacity-60 text-white/70">
                                        {mod.tolerance}
                                    </span>
                                )}
                                <span className={cn(isAdjusted && 'text-emerald-100')}>
                                    {adjustedTolerance}
                                </span>
                            </div>
                            {mod.symbol && (
                                <div className="absolute top-2 right-2 z-20">
                                    <span className="rounded-full bg-black/80 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide shadow-lg">
                                        {mod.symbol}
                                    </span>
                                </div>
                            )}

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveMod(index);
                                }}
                                className="absolute top-1 right-1 rounded-full bg-destructive text-destructive-foreground p-1 shadow-lg transition hover:bg-destructive/80 opacity-0 group-hover:opacity-100 z-20"
                                aria-label="Remove mod"
                                type="button"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </>
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-2 text-white/50">
                            <div className="grid h-14 w-14 place-items-center rounded-full border border-dashed border-white/30">
                                <Plus className="h-6 w-6" />
                            </div>
                            {isAdjusted && (
                                <div className="absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide shadow-lg flex items-center gap-1 border border-emerald-400/80 bg-emerald-500/10 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.4)] z-20">
                                    <span>Adjusted</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="min-h-[2.5rem] flex items-center justify-center transition-all duration-200">
                    {mod && (
                        <p className="text-center text-sm text-white/95 font-semibold leading-snug px-2">
                            {mod.name}
                        </p>
                    )}
                </div>
            </div>
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Configure Mods for {item.name}</DialogTitle>
                    <DialogDescription>
                        Add up to {mods.length} mods for this support item.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Part B UI Style */}
                    <div className="lg:col-span-8 relative overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-br from-[#060a17] via-[#05060f] to-[#02030a] p-6 md:p-10 shadow-[0_25px_80px_rgba(7,11,24,0.65)] animate-in zoom-in-95 duration-500 slide-in-from-bottom-4">
                        <div className="pointer-events-none absolute inset-0 opacity-70">
                            <div className="absolute -top-32 left-0 h-72 w-72 rounded-full bg-blue-500/20 blur-[180px]" />
                            <div className="absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-purple-500/15 blur-[190px]" />
                        </div>

                        <div className="relative z-10 space-y-10">
                            <div className="flex flex-wrap items-center justify-between gap-4 text-[11px] uppercase tracking-[0.5em] text-white/50">
                                <span>Support Set</span>
                                <span className="flex items-center gap-2 text-white/70 tracking-[0.3em]">
                                    Slots
                                    <span className="text-xl font-semibold tracking-normal text-white">{filledSlots}</span>
                                    <span className="tracking-normal text-white/50 text-base">/ 9</span>
                                </span>
                            </div>

                            <div className="grid gap-6 sm:gap-8 lg:gap-12 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center">
                                {/* Left Slots */}
                                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5 w-full max-w-[400px] sm:max-w-[440px] lg:max-w-[480px] xl:max-w-[520px] justify-self-center lg:justify-self-end">
                                    {leftSlots.map((mod, i) => (
                                        <ModalModSlot key={`left-${i}`} mod={mod} index={i} />
                                    ))}
                                </div>

                                {/* Center Tolerance */}
                                <div className="flex flex-col items-center gap-5 text-center w-full max-w-[260px] justify-self-center">
                                    <span className="text-[11px] uppercase tracking-[0.6em] text-white/60">
                                        Tolerance
                                    </span>
                                    <div className="relative">
                                        <div
                                            className="relative grid h-48 w-48 place-items-center rounded-full border border-white/15 bg-black/60 shadow-[0_0_80px_rgba(59,130,246,0.3)] transition-transform duration-500 hover:scale-105"
                                            onDrop={(e) => handleDrop(e, 8)}
                                            onDragOver={handleDragOver}
                                        >
                                            {centerMod ? (
                                                <>
                                                    <Image
                                                        src={centerMod.image}
                                                        alt={centerMod.name}
                                                        fill
                                                        className="absolute inset-0 rounded-full object-cover opacity-70"
                                                    />
                                                    <div className="absolute inset-0 rounded-full bg-gradient-to-b from-black/20 via-black/60 to-black/80" />
                                                </>
                                            ) : null}
                                            <div className="relative z-10 flex flex-col items-center gap-1 text-white">
                                                <span className="text-5xl font-bold">{totalTolerance}</span>
                                                <span className="text-[9px] uppercase tracking-[0.6em] text-white/70">
                                                    total
                                                </span>
                                            </div>
                                            {centerMod && (
                                                <button
                                                    onClick={() => handleRemoveMod(8)}
                                                    className="absolute top-2 right-2 z-20 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                                                    title="Remove center mod"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="absolute inset-0 -z-10 animate-pulse rounded-full border border-white/10" />
                                    </div>
                                </div>

                                {/* Right Slots */}
                                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5 w-full max-w-[400px] sm:max-w-[440px] lg:max-w-[480px] xl:max-w-[520px] justify-self-center lg:justify-self-start">
                                    {rightSlots.map((mod, i) => (
                                        <ModalModSlot key={`right-${i}`} mod={mod} index={i + 4} />
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-3 pt-6">
                                <Button
                                    variant="outline"
                                    onClick={toggleAdjustSlotTrack}
                                    className={cn(
                                        'flex min-w-[240px] sm:min-w-[260px] items-center justify-center gap-3 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white/80 transition-all hover:bg-white/10',
                                        adjustSlotTrackMode && 'border-blue-500 bg-blue-500/20 text-blue-100 shadow-lg shadow-blue-500/20'
                                    )}
                                >
                                    <Settings className={cn('h-4 w-4', adjustSlotTrackMode && 'animate-spin')} />
                                    Adjust Slot Track
                                    <span
                                        className={cn(
                                            'rounded-full px-3 py-0.5 text-[10px] font-bold uppercase',
                                            adjustSlotTrackMode ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-200'
                                        )}
                                    >
                                        {adjustSlotTrackMode ? 'On' : 'Off'}
                                    </span>
                                </Button>
                                {adjustSlotTrackMode && (
                                    <p className="text-xs text-blue-200 text-center">
                                        🎯 Click a mod slot to halve its tolerance cost.
                                    </p>
                                )}
                                <Button
                                    variant="destructive"
                                    onClick={handleRemoveAllMods}
                                    className="flex min-w-[240px] sm:min-w-[260px] items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
                                >
                                    <X className="h-4 w-4" />
                                    Remove All Mods
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Mod Browser Section */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, attribute, or effect..."
                                className="h-12 rounded-xl border border-blue-500/40 bg-black/30 pl-12 text-sm text-white placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-blue-500/40"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <div className="flex-1 min-w-[140px]">
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
                            </div>
                            <div className="flex-1 min-w-[140px]">
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
                            </div>
                            {(modTypeFilters.length === 0 || modTypeFilters.includes('Characters')) && (
                                <div className="flex-1 min-w-[140px]">
                                    <Select value={elementFilter} onValueChange={(v) => setElementFilter(v as ModElement | 'All')}>
                                        <SelectTrigger className="w-full h-12 rounded-xl border border-white/10 bg-black/30 text-sm">
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
                                </div>
                            )}
                        </div>

                        <ScrollArea className="h-[600px] rounded-2xl border border-white/10 bg-black/20 p-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {filteredMods.map((mod, index) => (
                                    <ModCard
                                        key={`${mod.name}-${index}`}
                                        mod={mod}
                                        onDragStart={(e) => handleDragStart(e, mod)}
                                        onClick={() => handleModClick(mod)}
                                    />
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};


export default function CreateBuildDetailPage() {
    const params = useParams();
    const { id } = params;
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();

    const [buildName, setBuildName] = useState('');
    const [buildDescription, setBuildDescription] = useState('');
    const [buildGuide, setBuildGuide] = useState('');


    const [team, setTeam] = useState<(Character | null)[]>([null, null]);
    const [supportWeapons, setSupportWeapons] = useState<(Weapon | null)[]>([null, null]);
    const [consonanceWeapon, setConsonanceWeapon] = useState<Weapon | null>(null);

    const createEmptySlots = (count: number) => Array(count).fill(null) as (Mod | null)[];
    const [supportMods, setSupportMods] = useState<Record<string, (Mod | null)[]>>({
        'support-char-0': createEmptySlots(SUPPORT_SLOT_CAPACITY),
        'support-char-1': createEmptySlots(SUPPORT_SLOT_CAPACITY),
        'support-wpn-0': createEmptySlots(SUPPORT_SLOT_CAPACITY),
        'support-wpn-1': createEmptySlots(SUPPORT_SLOT_CAPACITY),
        'consonance-wpn': createEmptySlots(CONSONANCE_SLOT_CAPACITY),
    });

    const [isCharModalOpen, setCharModalOpen] = useState(false);
    const [isWeaponModalOpen, setWeaponModalOpen] = useState(false);
    const [isSupportModModalOpen, setSupportModModalOpen] = useState(false);

    const [selectingSupportIndex, setSelectingSupportIndex] = useState<number | null>(null);
    const [selectingWeaponSlot, setSelectingWeaponSlot] = useState<'support-0' | 'support-1' | 'consonance' | null>(null);

    const [editingSupportSlot, setEditingSupportSlot] = useState<string | null>(null);


    const [buildSlots, setBuildSlots] = useState<(Mod | null)[]>(Array(8).fill(null));
    const [centerPreviewMod, setCenterPreviewMod] = useState<Mod | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [modTypeFilters, setModTypeFilters] = useState<ModType[]>([]);
    const [rarityFilters, setRarityFilters] = useState<ModRarity[]>([]);
    const [elementFilter, setElementFilter] = useState<ModElement | 'All'>('All');
    const [showCenterOnly, setShowCenterOnly] = useState(false);
    const [adjustSlotTrackMode, setAdjustSlotTrackMode] = useState(false);
    const [adjustedSlots, setAdjustedSlots] = useState<Set<number>>(new Set());


    const { item, itemType } = useMemo(() => {
        const character = allCharacters.find((c) => c.id === id);
        if (character) return { item: character, itemType: 'character' };

        const weapon = allWeapons.find((w) => w.id === id);
        if (weapon) return { item: weapon, itemType: 'weapon' };

        return { item: null, itemType: null };
    }, [id]);

    useEffect(() => {
        if (item) {
            // Check if we're editing an existing build
            const urlParams = new URLSearchParams(window.location.search);
            const buildId = urlParams.get('buildId');

            if (buildId) {
                // Load existing build
                const savedBuilds = JSON.parse(localStorage.getItem('builds') || '[]');
                const existingBuild = savedBuilds.find((b: any) => b.id === buildId);

                if (existingBuild) {
                    setBuildName(existingBuild.buildName);
                    setBuildDescription(existingBuild.description || '');
                    setBuildGuide(existingBuild.guide || '');


                    // Load mods
                    const loadedMods = (existingBuild.mods || [])
                        .map((modName: string) => allMods.find((m) => m.name === modName))
                        .filter(Boolean);
                    setBuildSlots([...loadedMods, ...Array(8 - loadedMods.length).fill(null)]);
                    if (existingBuild.primeMod) {
                        const loadedCenter = allMods.find((m) => m.name === existingBuild.primeMod) || null;
                        setCenterPreviewMod(loadedCenter);
                    }

                    // Load team
                    const loadedTeam = (existingBuild.team || [])
                        .map((charId: string) => allCharacters.find((c) => c.id === charId))
                        .filter(Boolean);
                    setTeam([...loadedTeam, ...Array(2 - loadedTeam.length).fill(null)]);

                    // Load support weapons
                    const loadedWeapons = (existingBuild.supportWeapons || [])
                        .map((wpnId: string) => allWeapons.find((w) => w.id === wpnId))
                        .filter(Boolean);
                    setSupportWeapons([...loadedWeapons, ...Array(2 - loadedWeapons.length).fill(null)]);

                    // Load consonance weapon
                    if (existingBuild.consonanceWeapon) {
                        const loadedConsonance = allWeapons.find((w) => w.id === existingBuild.consonanceWeapon);
                        if (loadedConsonance) setConsonanceWeapon(loadedConsonance);
                    }

                    // Load support mods
                    if (existingBuild.supportMods) {
                        const loadedSupportMods: Record<string, (Mod | null)[]> = {};
                        Object.entries(existingBuild.supportMods).forEach(([key, modNames]) => {
                            const mods = (modNames as string[])
                                .map((modName) => allMods.find((m) => m.name === modName))
                                .filter(Boolean);
                            const maxSlots = key === 'consonance-wpn' ? CONSONANCE_SLOT_CAPACITY : SUPPORT_SLOT_CAPACITY;
                            loadedSupportMods[key] = [
                                ...mods,
                                ...Array(Math.max(0, maxSlots - mods.length)).fill(null),
                            ].slice(0, maxSlots);
                        });
                        setSupportMods((prev) => ({ ...prev, ...loadedSupportMods }));
                    }
                }
            } else {
                // New build
                setBuildName(`NEW BUILD: ${item.name.toUpperCase()}`);
                setCenterPreviewMod(null);
            }
        }
    }, [item]);

    useEffect(() => {
        if (itemType !== 'character' && showCenterOnly) {
            setShowCenterOnly(false);
        }
    }, [itemType, showCenterOnly]);

    if (!item) {
        notFound();
    }

    const handleSaveBuild = () => {

        // Check if we're editing an existing build
        const urlParams = new URLSearchParams(window.location.search);
        const existingBuildId = urlParams.get('buildId');

        const buildData: any = {
            id: existingBuildId || uuidv4(),
            userId: user.uid,
            buildName: buildName,
            description: buildDescription,
            guide: buildGuide,

            itemType: itemType,
            itemId: item.id,
            itemName: item.name,
            itemImage: item.image,
            creator: user.displayName,
            mods: buildSlots.filter(Boolean).map(m => m?.name),
            primeMod: centerPreviewMod?.name || null,
            team: team.filter(Boolean).map(c => c?.id),
            supportWeapons: supportWeapons.filter(Boolean).map(w => w?.id),
            consonanceWeapon: consonanceWeapon?.id || null,
            supportMods: Object.entries(supportMods).reduce((acc, [key, mods]) => {
                const filteredMods = mods.filter(Boolean).map(m => m?.name);
                if (filteredMods.length > 0) {
                    acc[key] = filteredMods;
                }
                return acc;
            }, {} as Record<string, any>),
            voteCount: 0,
            updatedAt: new Date().toISOString(),
        };

        // Save to localStorage
        const savedBuilds = JSON.parse(localStorage.getItem('builds') || '[]');

        if (existingBuildId) {
            // Update existing build
            const buildIndex = savedBuilds.findIndex((b: any) => b.id === existingBuildId);
            if (buildIndex !== -1) {
                buildData.createdAt = savedBuilds[buildIndex].createdAt; // Keep original creation date
                savedBuilds[buildIndex] = buildData;
            }
        } else {
            // Create new build
            buildData.createdAt = new Date().toISOString();
            savedBuilds.push(buildData);
        }

        localStorage.setItem('builds', JSON.stringify(savedBuilds));

        toast({
            title: existingBuildId ? 'Build Updated!' : 'Build Saved!',
            description: existingBuildId ? 'Your build has been updated.' : 'Your new build has been saved.',
        });

        router.push('/my-builds');
    };

    const handleSelectSupport = (character: Character) => {
        if (selectingSupportIndex !== null) {
            const newTeam = [...team];
            newTeam[selectingSupportIndex] = character;
            setTeam(newTeam);
            setEditingSupportSlot(`support-char-${selectingSupportIndex}`);
            setSupportModModalOpen(true);
        }
        setCharModalOpen(false);
    };

    const handleSelectWeapon = (weapon: Weapon) => {
        let slotId: string | null = null;
        if (selectingWeaponSlot === 'support-0') {
            const newWeapons = [...supportWeapons];
            newWeapons[0] = weapon;
            setSupportWeapons(newWeapons);
            slotId = 'support-wpn-0';
        } else if (selectingWeaponSlot === 'support-1') {
            const newWeapons = [...supportWeapons];
            newWeapons[1] = weapon;
            setSupportWeapons(newWeapons);
            slotId = 'support-wpn-1';
        } else if (selectingWeaponSlot === 'consonance') {
            setConsonanceWeapon(weapon);
            slotId = 'consonance-wpn';
        }

        if (slotId) {
            setEditingSupportSlot(slotId);
            setSupportModModalOpen(true);
        }
        setWeaponModalOpen(false);
    }

    const openWeaponModal = (slot: 'support-0' | 'support-1' | 'consonance') => {
        setSelectingWeaponSlot(slot);
        setWeaponModalOpen(true);
    }


    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, mod: Mod) => {
        e.dataTransfer.setData("modName", mod.name);
    };

    const canEquipMultiple = (mod: Mod) => {
        return mod.effect?.includes('can be equipped in multiples') || false;
    };

    const canEquipWithExisting = (newMod: Mod, existingMods: (Mod | null)[]) => {
        // If the mod can't be equipped in multiples at all, no duplicates allowed
        if (!canEquipMultiple(newMod)) {
            return !existingMods.some(slot => slot?.name === newMod.name);
        }

        // If it can be equipped in multiples, check if any existing mod with same name has different rarity
        const sameNameMods = existingMods.filter(slot => slot?.name === newMod.name);
        if (sameNameMods.length === 0) return true;

        // All existing mods with same name must have same rarity
        return sameNameMods.every(existing => existing?.rarity === newMod.rarity);
    };

    const isElementMatchMain = (mod: Mod) => {
        // If mod has no element, it can be equipped on anything
        if (!mod.element) return true;
        // If item has no element, allow all mods  
        if (!item?.element) return true;
        // Otherwise, elements must match
        return mod.element === item.element;
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        const modName = e.dataTransfer.getData("modName");
        const mod = allMods.find(m => m.name === modName);
        if (mod) {
            if (mod.centerOnly) {
                setCenterPreviewMod(mod);
                return;
            }

            // Check element matching
            if (!isElementMatchMain(mod)) {
                toast({
                    title: 'Element Mismatch',
                    description: `${mod.name} (${mod.element}) cannot be equipped on ${item.name} (${item.element}).`,
                    variant: 'destructive',
                });
                return;
            }

            // Check if mod can be equipped with existing mods (excluding the target slot)
            const modsExcludingTarget = buildSlots.map((slot, i) => i === index ? null : slot);

            if (!canEquipWithExisting(mod, modsExcludingTarget)) {
                const hasDifferentRarity = modsExcludingTarget.some(
                    slot => slot?.name === mod.name && slot?.rarity !== mod.rarity
                );

                if (hasDifferentRarity) {
                    toast({
                        title: 'Cannot Mix Rarities',
                        description: `${mod.name} is already equipped with a different rarity. Only same rarity duplicates are allowed.`,
                        variant: 'destructive',
                    });
                } else {
                    toast({
                        title: 'Cannot Equip Duplicate',
                        description: `${mod.name} is already equipped. This mod cannot be equipped multiple times.`,
                        variant: 'destructive',
                    });
                }
                return;
            }

            const newBuildSlots = [...buildSlots];
            newBuildSlots[index] = mod;
            setBuildSlots(newBuildSlots);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleCenterPreviewDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const modName = e.dataTransfer.getData("modName");
        const mod = allMods.find(m => m.name === modName);
        if (mod && mod.centerOnly) {
            setCenterPreviewMod(mod);
        } else if (mod) {
            toast({
                title: 'Center Slot Only',
                description: 'This slot accepts only Feathered Serpent center mods.',
                variant: 'destructive',
            });
        }
    };

    const handleCenterPreviewDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleModClick = (mod: Mod) => {
        if (mod.centerOnly) {
            setCenterPreviewMod(mod);
            return;
        }

        // Check element matching
        if (!isElementMatchMain(mod)) {
            toast({
                title: 'Element Mismatch',
                description: `${mod.name} (${mod.element}) cannot be equipped on ${item.name} (${item.element}).`,
                variant: 'destructive',
            });
            return;
        }

        // Check if mod can be equipped with existing mods
        if (!canEquipWithExisting(mod, buildSlots)) {
            const hasDifferentRarity = buildSlots.some(
                slot => slot?.name === mod.name && slot?.rarity !== mod.rarity
            );

            if (hasDifferentRarity) {
                toast({
                    title: 'Cannot Mix Rarities',
                    description: `${mod.name} is already equipped with a different rarity. Only same rarity duplicates are allowed.`,
                    variant: 'destructive',
                });
            } else {
                toast({
                    title: 'Cannot Equip Duplicate',
                    description: `${mod.name} is already equipped. This mod cannot be equipped multiple times.`,
                    variant: 'destructive',
                });
            }
            return;
        }

        const newBuildSlots = [...buildSlots];
        const emptySlotIndex = newBuildSlots.findIndex(slot => slot === null);
        if (emptySlotIndex !== -1) {
            newBuildSlots[emptySlotIndex] = mod;
            setBuildSlots(newBuildSlots);
        } else {
            toast({
                title: 'Slots Full',
                description: 'Remove a mod before adding another one.',
                variant: 'destructive',
            });
        }
    };

    const handleRemoveMod = (index: number) => {
        const newBuildSlots = [...buildSlots];
        newBuildSlots[index] = null;
        setBuildSlots(newBuildSlots);

        if (adjustedSlots.has(index)) {
            const newAdjusted = new Set(adjustedSlots);
            newAdjusted.delete(index);
            setAdjustedSlots(newAdjusted);
        }
    }

    const handleRemoveAllMods = () => {
        setBuildSlots(Array(8).fill(null));
        setCenterPreviewMod(null);
        setAdjustedSlots(new Set());
    }

    const toggleAdjustSlotTrack = () => {
        const newMode = !adjustSlotTrackMode;
        setAdjustSlotTrackMode(newMode);
        console.log('Adjust Slot Track Mode:', newMode ? 'On' : 'Off');
    };

    const handleSlotClickForAdjust = (index: number) => {
        console.log('Slot clicked:', index, 'Mode:', adjustSlotTrackMode);
        if (adjustSlotTrackMode) {
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

    // Removed useEffect that auto-clears adjusted slots when mods are removed
    // to allow empty slots to remain adjusted.

    const handleSaveSupportMods = (mods: (Mod | null)[]) => {
        if (editingSupportSlot) {
            setSupportMods(prev => ({
                ...prev,
                [editingSupportSlot]: mods,
            }));
        }
    };

    const openSupportModModal = (slotId: string) => {
        setEditingSupportSlot(slotId);
        setSupportModModalOpen(true);
    };

    const editingItem = useMemo(() => {
        if (!editingSupportSlot) return null;
        if (editingSupportSlot.startsWith('support-char-')) {
            const index = parseInt(editingSupportSlot.split('-')[2]);
            return team[index];
        }
        if (editingSupportSlot.startsWith('support-wpn-')) {
            const index = parseInt(editingSupportSlot.split('-')[2]);
            return supportWeapons[index];
        }
        return null;
    }, [editingSupportSlot, team, supportWeapons]);


    const toggleModTypeMain = (type: ModType) => {
        setModTypeFilters(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const toggleRarityMain = (rarity: ModRarity) => {
        setRarityFilters(prev =>
            prev.includes(rarity) ? prev.filter(r => r !== rarity) : [...prev, rarity]
        );
    };

    const filteredMods = useMemo(() => {
        return allMods.filter(mod => {
            // Enhanced search - match against name, mainAttribute, and effect
            const searchLower = searchQuery.toLowerCase();
            const searchMatch = !searchQuery ||
                mod.name.toLowerCase().includes(searchLower) ||
                mod.mainAttribute.toLowerCase().includes(searchLower) ||
                (mod.effect && mod.effect.toLowerCase().includes(searchLower));

            // Filter by item type
            let itemTypeMatch = true;
            if (itemType === 'character') {
                // For characters with consonance weapon, show both character and consonance weapon mods
                if ((item as Character).hasConsonanceWeapon) {
                    itemTypeMatch = mod.modType === 'Characters' ||
                        mod.modType === 'Melee Consonance Weapon' ||
                        mod.modType === 'Ranged Consonance Weapon';
                } else {
                    // For regular characters, show only character mods
                    itemTypeMatch = mod.modType === 'Characters';
                }
            } else if (itemType === 'weapon') {
                // For weapons, show only weapon mods (excluding consonance)
                itemTypeMatch = mod.modType === 'Melee Weapon' || mod.modType === 'Ranged Weapon';
            }

            // Multi-select type filter (only apply if user has selected filters)
            const typeMatch = modTypeFilters.length === 0 || modTypeFilters.includes(mod.modType);

            // Multi-select rarity filter
            const rarityMatch = rarityFilters.length === 0 || rarityFilters.includes(mod.rarity);

            const elementMatch = elementFilter === 'All' || !mod.element || mod.element === elementFilter;
            const centerMatch = !showCenterOnly || Boolean(mod.centerOnly);

            // Enforce element matching with item
            const itemElementMatch = isElementMatchMain(mod);

            return searchMatch && itemTypeMatch && typeMatch && rarityMatch && elementMatch && centerMatch && itemElementMatch;
        });
    }, [searchQuery, modTypeFilters, rarityFilters, elementFilter, showCenterOnly, itemType, item]);

    const { leftSlots, rightSlots, totalTolerance, filledSlots, featuredMod } = useMemo(() => {
        const primeSymbol = centerPreviewMod?.symbol;
        const totalToleranceValue = buildSlots.reduce((sum, mod, index) => {
            if (!mod) {
                return sum;
            }

            let effectiveTolerance = mod.tolerance;

            if (primeSymbol && mod.symbol && mod.symbol === primeSymbol) {
                effectiveTolerance = Math.ceil(effectiveTolerance / 2);
            } else if (adjustedSlots.has(index)) {
                effectiveTolerance = Math.ceil(effectiveTolerance / 2);
            }

            return sum + effectiveTolerance;
        }, 0);
        const filledCount = buildSlots.reduce((sum, mod) => sum + (mod ? 1 : 0), 0) + (centerPreviewMod ? 1 : 0);
        const firstFilled = buildSlots.find((slot): slot is Mod => Boolean(slot)) ?? null;

        return {
            leftSlots: buildSlots.slice(0, 4),
            rightSlots: buildSlots.slice(4, 8),
            totalTolerance: totalToleranceValue,
            filledSlots: filledCount,
            featuredMod: firstFilled,
        };
    }, [buildSlots, centerPreviewMod, adjustedSlots]);

    const previewMod = centerPreviewMod ?? featuredMod;

    const getRarityClasses = (rarity?: ModRarity) => {
        if (!rarity) {
            return {
                card: 'border-dashed border-border/60 bg-background/50 hover:border-primary/40',
                badge: 'bg-muted/70 text-foreground',
            };
        }

        const map: Record<ModRarity, { card: string; badge: string }> = {
            5: {
                card: 'border-yellow-400/70 bg-gradient-to-b from-yellow-500/20 via-black/40 to-black/80 shadow-[0_20px_45px_rgba(250,204,21,0.2)]',
                badge: 'bg-yellow-400 text-black',
            },
            4: {
                card: 'border-purple-400/70 bg-gradient-to-b from-purple-500/20 via-black/40 to-black/80 shadow-[0_20px_45px_rgba(192,132,252,0.25)]',
                badge: 'bg-purple-400/90 text-white',
            },
            3: {
                card: 'border-blue-400/70 bg-gradient-to-b from-sky-500/15 via-black/40 to-black/80 shadow-[0_20px_45px_rgba(59,130,246,0.2)]',
                badge: 'bg-sky-400/90 text-white',
            },
            2: {
                card: 'border-emerald-400/70 bg-gradient-to-b from-emerald-500/15 via-black/35 to-black/80 shadow-[0_20px_45px_rgba(16,185,129,0.25)]',
                badge: 'bg-emerald-400/90 text-white',
            },
        };

        return map[rarity];
    };

    const MainModSlot = ({ mod, index }: { mod: Mod | null, index: number }) => {
        const isAdjusted = adjustedSlots.has(index);
        const primeSymbol = centerPreviewMod?.symbol;
        const isPrimeAdjusted = primeSymbol && mod?.symbol && mod.symbol === primeSymbol;

        let adjustedTolerance = mod?.tolerance;
        if (isPrimeAdjusted) {
            adjustedTolerance = Math.ceil((mod?.tolerance || 0) / 2);
        } else if (mod && isAdjusted) {
            adjustedTolerance = Math.ceil(mod.tolerance / 2);
        }

        const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
            if (adjustSlotTrackMode) {
                e.stopPropagation();
                handleSlotClickForAdjust(index);
            }
        };

        return (
            <div className="space-y-3">
                <div
                    className={cn(
                        'relative aspect-square w-full overflow-hidden rounded-2xl border border-dashed border-white/20 bg-white/5/20 transition-all duration-300 group hover:border-blue-400/60',
                        mod && 'border-white/30 bg-black/40 shadow-inner',
                        adjustSlotTrackMode && 'cursor-pointer ring-1 ring-blue-400/60',
                        isAdjusted && 'border-emerald-400/70 shadow-[0_0_25px_rgba(16,185,129,0.35)]'
                    )}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragOver={handleDragOver}
                    onClick={handleClick}
                >
                    {/* Adjust Mode Indicator */}
                    {adjustSlotTrackMode && (
                        <div className="absolute inset-0 bg-blue-500/10 border-2 border-blue-400/30 pointer-events-none animate-pulse z-10" />
                    )}

                    {mod ? (
                        <>
                            <Image
                                src={mod.image}
                                alt={mod.name}
                                fill
                                className="object-cover"
                                data-ai-hint="abstract pattern"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-black/80" />

                            <div className={cn(
                                'absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide shadow-lg flex items-center gap-1 border z-20',
                                isAdjusted || isPrimeAdjusted
                                    ? 'border-emerald-400/80 bg-emerald-500/10 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                                    : 'border-white/20 bg-black/40 text-white'
                            )}>
                                {(isAdjusted || isPrimeAdjusted) && (
                                    <span className="line-through opacity-60 text-white/70">
                                        {mod.tolerance}
                                    </span>
                                )}
                                <span className={cn((isAdjusted || isPrimeAdjusted) && 'text-emerald-100')}>
                                    {adjustedTolerance}
                                </span>
                            </div>
                            {mod.symbol && (
                                <div className="absolute top-2 right-2 z-20">
                                    <span className="rounded-full bg-black/80 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide shadow-lg">
                                        {mod.symbol}
                                    </span>
                                </div>
                            )}

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveMod(index);
                                }}
                                className="absolute top-1 right-1 rounded-full bg-destructive text-destructive-foreground p-1 shadow-lg transition hover:bg-destructive/80 opacity-0 group-hover:opacity-100 z-20"
                                aria-label="Remove mod"
                                type="button"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </>
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-2 text-white/50">
                            <div className="grid h-14 w-14 place-items-center rounded-full border border-dashed border-white/30">
                                <Plus className="h-6 w-6" />
                            </div>
                            {isAdjusted && (
                                <div className="absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide shadow-lg flex items-center gap-1 border border-emerald-400/80 bg-emerald-500/10 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.4)] z-20">
                                    <span>Adjusted</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="min-h-[2.5rem] flex items-center justify-center transition-all duration-200">
                    {mod && (
                        <p className="text-center text-sm text-white/95 font-semibold leading-snug px-2">
                            {mod.name}
                        </p>
                    )}
                </div>
            </div>
        );
    };


    const CharacterSlot = ({ character, onSelect, onRemove, onConfigure, title }: { character: Character | null, onSelect: () => void, onRemove?: () => void, onConfigure?: () => void, title: string }) => (
        <Card className="bg-card/50 text-center">
            <CardHeader className="p-2">
                <CardTitle className="text-base">{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
                {character ? (
                    <div className="relative group cursor-pointer" onClick={onConfigure}>
                        <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-primary">
                            <Image src={character.image} alt={character.name} fill className="object-cover" />
                        </div>
                        <p className="mt-2 font-semibold">{character.name}</p>
                        {onRemove && <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 z-10 hover:bg-destructive/80 transition-colors">
                            <X className="w-3 h-3" />
                        </button>}
                    </div>
                ) : (
                    <Button variant="outline" className="w-24 h-24 rounded-full border-dashed" onClick={onSelect}>
                        <Plus className="w-8 h-8" />
                    </Button>
                )}
            </CardContent>
        </Card>
    );

    const WeaponSlot = ({ weapon, onSelect, onRemove, onConfigure, title, icon }: { weapon: Weapon | null, onSelect: () => void, onRemove?: () => void, onConfigure?: () => void, title: string, icon: React.ReactNode }) => (
        <Card className="bg-card/50 text-center">
            <CardHeader className="p-2">
                <CardTitle className="text-base flex items-center justify-center gap-2">{icon} {title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col items-center gap-4">
                {weapon ? (
                    <div className="relative group cursor-pointer" onClick={onConfigure}>
                        <div className="relative w-24 h-24 mx-auto rounded-md overflow-hidden border-2 border-primary">
                            <Image src={weapon.image} alt={weapon.name} fill className="object-cover" />
                        </div>
                        <p className="mt-2 font-semibold text-sm truncate">{weapon.name}</p>
                        {onRemove && <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 z-10 hover:bg-destructive/80 transition-colors">
                            <X className="w-3 h-3" />
                        </button>}
                    </div>
                ) : (
                    <Button variant="outline" className="w-24 h-24 rounded-md border-dashed flex items-center justify-center" onClick={onSelect}>
                        <Plus className="w-8 h-8" />
                    </Button>
                )}
            </CardContent>
        </Card>
    )


    return (
        <div className="container mx-auto px-4 py-8">
            <CharacterSelectionModal open={isCharModalOpen} onOpenChange={setCharModalOpen} onSelect={handleSelectSupport} />
            <WeaponSelectionModal open={isWeaponModalOpen} onOpenChange={setWeaponModalOpen} onSelect={handleSelectWeapon} />
            <SupportModModal
                item={editingItem}
                open={isSupportModModalOpen}
                onOpenChange={setSupportModModalOpen}
                initialMods={editingSupportSlot ? supportMods[editingSupportSlot] : []}
                allowedModTypes={useMemo(() => {
                    if (!editingSupportSlot) return undefined;
                    if (editingSupportSlot.startsWith('support-char-')) return ['Characters'];

                    let weapon: Weapon | null = null;
                    if (editingSupportSlot === 'support-wpn-0') weapon = supportWeapons[0];
                    if (editingSupportSlot === 'support-wpn-1') weapon = supportWeapons[1];

                    if (weapon) {
                        if (allMeleeWeapons.some(w => w.id === weapon?.id)) return ['Melee Weapon'];
                        if (allRangedWeapons.some(w => w.id === weapon?.id)) return ['Ranged Weapon'];
                    }

                    if (editingSupportSlot === 'consonance-wpn') return ['Melee Consonance Weapon', 'Ranged Consonance Weapon'];
                    return undefined;
                }, [editingSupportSlot, supportWeapons])}
                onSave={handleSaveSupportMods}
            />


            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <span>ITEM</span>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground uppercase">{itemType === 'character' ? 'CHARACTER' : 'WEAPON'}</span>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground uppercase">{item.name}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-3 space-y-6">
                    <Card className="bg-card/50">
                        <CardContent className="p-4">
                            <div className="flex flex-col gap-4">
                                <div className="flex gap-4">
                                    <div className="relative w-24 h-24 flex-shrink-0">
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="rounded-md object-cover"
                                            data-ai-hint={itemType === 'character' ? 'fantasy character' : 'fantasy weapon'}
                                        />
                                    </div>
                                    <div className="flex-grow">
                                        <Input
                                            value={buildName}
                                            onChange={(e) => setBuildName(e.target.value)}
                                            className="text-lg font-bold bg-transparent border-0 border-b rounded-none px-0 focus:ring-0"
                                        />
                                        <Textarea
                                            placeholder="A short description for your build..."
                                            value={buildDescription}
                                            onChange={(e) => setBuildDescription(e.target.value)}
                                            className="mt-2 text-sm bg-transparent border-0 rounded-none px-0 focus:ring-0 h-10 resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {itemType === 'weapon' && (
                        <WeaponInfoCard weapon={item as Weapon} />
                    )}

                    {itemType === 'character' && (
                        <Card className="bg-card/50">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-center gap-2 text-lg"><Users className="w-5 h-5" /> Team Setup</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <CharacterSlot
                                        title="Support 1"
                                        character={team[0]}
                                        onSelect={() => { setSelectingSupportIndex(0); setCharModalOpen(true); }}
                                        onRemove={() => setTeam(prev => [null, prev[1]])}
                                        onConfigure={() => openSupportModModal('support-char-0')}
                                    />
                                    <CharacterSlot
                                        title="Support 2"
                                        character={team[1]}
                                        onSelect={() => { setSelectingSupportIndex(1); setCharModalOpen(true); }}
                                        onRemove={() => setTeam(prev => [prev[0], null])}
                                        onConfigure={() => openSupportModModal('support-char-1')}
                                    />
                                </div>
                                <div>
                                    <p className="font-semibold text-center mb-2">Support Weapons</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <WeaponSlot
                                            title="Support 1 WPN"
                                            icon={<Crosshair className="w-4 h-4" />}
                                            weapon={supportWeapons[0]}
                                            onSelect={() => openWeaponModal('support-0')}
                                            onRemove={() => setSupportWeapons(p => [null, p[1]])}
                                            onConfigure={() => openSupportModModal('support-wpn-0')}
                                        />
                                        <WeaponSlot
                                            title="Support 2 WPN"
                                            icon={<Crosshair className="w-4 h-4" />}
                                            weapon={supportWeapons[1]}
                                            onSelect={() => openWeaponModal('support-1')}
                                            onRemove={() => setSupportWeapons(p => [p[0], null])}
                                            onConfigure={() => openSupportModModal('support-wpn-1')}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="space-y-2">
                        <Button className="w-full" onClick={handleSaveBuild}>Save Build</Button>
                        <Button variant="destructive" className="w-full" onClick={handleRemoveAllMods}>Remove All Mods</Button>
                    </div>
                </div>

                {/* Part B: Center Column - Build Config */}
                <div className="lg:col-span-6">
                    <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-br from-[#060a17] via-[#05060f] to-[#02030a] p-6 md:p-10 shadow-[0_25px_80px_rgba(7,11,24,0.65)]">
                        <div className="pointer-events-none absolute inset-0 opacity-70">
                            <div className="absolute -top-32 left-0 h-72 w-72 rounded-full bg-blue-500/20 blur-[180px]" />
                            <div className="absolute -bottom-24 right-10 h-72 w-72 rounded-full bg-purple-500/15 blur-[190px]" />
                        </div>
                        <div className="relative z-10 space-y-10">
                            <div className="flex flex-wrap items-center justify-between gap-4 text-[11px] uppercase tracking-[0.5em] text-white/50">
                                <span>{itemType === 'character' ? 'Character Set' : 'Weapon Set'}</span>
                                <span className="flex items-center gap-2 text-white/70 tracking-[0.3em]">
                                    Slots
                                    <span className="text-xl font-semibold tracking-normal text-white">{filledSlots}</span>
                                    <span className="tracking-normal text-white/50 text-base">/ 9</span>
                                </span>
                            </div>

                            <div className="grid gap-6 sm:gap-8 lg:gap-12 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center">
                                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5 w-full max-w-[400px] sm:max-w-[440px] lg:max-w-[480px] xl:max-w-[520px] justify-self-center lg:justify-self-end">
                                    {leftSlots.map((mod, index) => (
                                        <MainModSlot key={`left-${index}`} mod={mod} index={index} />
                                    ))}
                                </div>

                                <div className="flex flex-col items-center gap-5 text-center w-full max-w-[260px] justify-self-center">
                                    <span className="text-[11px] uppercase tracking-[0.6em] text-white/60">
                                        Tolerance
                                    </span>
                                    <div className="relative">
                                        <div
                                            className="relative grid h-48 w-48 place-items-center rounded-full border border-white/15 bg-black/60 shadow-[0_0_80px_rgba(59,130,246,0.3)]"
                                            onDrop={handleCenterPreviewDrop}
                                            onDragOver={handleCenterPreviewDragOver}
                                        >
                                            {previewMod ? (
                                                <>
                                                    <Image
                                                        src={previewMod.image}
                                                        alt={previewMod.name}
                                                        fill
                                                        className="absolute inset-0 rounded-full object-cover opacity-70"
                                                    />
                                                    <div className="absolute inset-0 rounded-full bg-gradient-to-b from-black/20 via-black/60 to-black/80" />
                                                </>
                                            ) : null}
                                            <div className="relative z-10 flex flex-col items-center gap-1 text-white">
                                                <span className="text-5xl font-bold">{totalTolerance}</span>
                                                <span className="text-[9px] uppercase tracking-[0.6em] text-white/70">
                                                    total
                                                </span>
                                            </div>
                                            {centerPreviewMod && (
                                                <button
                                                    onClick={() => setCenterPreviewMod(null)}
                                                    className="absolute top-2 right-2 z-20 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                                                    title="Remove center mod"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="absolute inset-0 -z-10 animate-pulse rounded-full border border-white/10" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5 w-full max-w-[400px] sm:max-w-[440px] lg:max-w-[480px] xl:max-w-[520px] justify-self-center lg:justify-self-start">
                                    {rightSlots.map((mod, index) => (
                                        <MainModSlot key={`right-${index}`} mod={mod} index={index + 4} />
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-3 pt-6">
                                <Button
                                    variant="outline"
                                    onClick={toggleAdjustSlotTrack}
                                    className={cn(
                                        'flex min-w-[240px] sm:min-w-[260px] items-center justify-center gap-3 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white/80 transition-all hover:bg-white/10',
                                        adjustSlotTrackMode && 'border-blue-500 bg-blue-500/20 text-blue-100 shadow-lg shadow-blue-500/20'
                                    )}
                                >
                                    <Settings className={cn('h-4 w-4', adjustSlotTrackMode && 'animate-spin')} />
                                    Adjust Slot Track
                                    <span
                                        className={cn(
                                            'rounded-full px-3 py-0.5 text-[10px] font-bold uppercase',
                                            adjustSlotTrackMode ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-200'
                                        )}
                                    >
                                        {adjustSlotTrackMode ? 'On' : 'Off'}
                                    </span>
                                </Button>
                                {adjustSlotTrackMode && (
                                    <p className="text-xs text-blue-200 text-center">
                                        🎯 Click a mod slot to halve its tolerance cost.
                                    </p>
                                )}
                                <Button
                                    variant="destructive"
                                    onClick={handleRemoveAllMods}
                                    className="flex min-w-[240px] sm:min-w-[260px] items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
                                >
                                    <X className="h-4 w-4" />
                                    Remove All Mods
                                </Button>
                            </div>
                        </div>
                    </div>

                    {itemType === 'character' && (item as Character).hasConsonanceWeapon && (
                        <Card className="bg-card/50 mt-8">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-center gap-2 text-lg">
                                    <Crosshair className="w-5 h-5" /> Consonance Weapon
                                </CardTitle>
                                <p className="text-xs text-muted-foreground text-center">Optional</p>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="grid grid-cols-4 gap-2">
                                    {supportMods['consonance-wpn'].map((mod, i) => (
                                        <ModSlot
                                            key={i}
                                            mod={mod}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                const modName = e.dataTransfer.getData("modName");
                                                const foundMod = allMods.find(m => m.name === modName);
                                                if (foundMod) {
                                                    const newMods = [...supportMods['consonance-wpn']];
                                                    newMods[i] = foundMod;
                                                    setSupportMods(prev => ({ ...prev, 'consonance-wpn': newMods }));
                                                }
                                            }}
                                            onDragOver={handleDragOver}
                                            onRemove={() => {
                                                const newMods = [...supportMods['consonance-wpn']];
                                                newMods[i] = null;
                                                setSupportMods(prev => ({ ...prev, 'consonance-wpn': newMods }));
                                            }}
                                        />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="bg-card/50 mt-8">
                        <CardHeader>
                            <CardTitle className="text-lg">Write a Guide</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                placeholder="Share your strategy, tips, and playstyle for this build..."
                                className="bg-background"
                                rows={6}
                                value={buildGuide}
                                onChange={(e) => setBuildGuide(e.target.value)}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Mods */}
                <div className="lg:col-span-3">
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, attribute, or effect..."
                                className="pl-10 bg-input"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                            <MultiSelectFilter
                                label="All Types"
                                options={
                                    itemType === 'character' && (item as Character).hasConsonanceWeapon
                                        ? [
                                            { value: 'Characters' as ModType, label: 'Characters' },
                                            { value: 'Melee Consonance Weapon' as ModType, label: 'Melee Consonance' },
                                            { value: 'Ranged Consonance Weapon' as ModType, label: 'Ranged Consonance' },
                                        ]
                                        : itemType === 'character'
                                            ? [
                                                { value: 'Characters' as ModType, label: 'Characters' },
                                            ]
                                            : [
                                                { value: 'Melee Weapon' as ModType, label: 'Melee Weapon' },
                                                { value: 'Ranged Weapon' as ModType, label: 'Ranged Weapon' },
                                            ]
                                }
                                selected={modTypeFilters}
                                onToggle={toggleModTypeMain}
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
                                onToggle={toggleRarityMain}
                                onClear={() => setRarityFilters([])}
                            />
                            {(modTypeFilters.length === 0 || modTypeFilters.includes('Characters')) && (
                                <Select value={elementFilter} onValueChange={(v) => setElementFilter(v as ModElement | 'All')}>
                                    <SelectTrigger><SelectValue placeholder="Filter by Element" /></SelectTrigger>
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

                        <div className="flex flex-wrap items-center gap-3">
                            <Button
                                type="button"
                                size="sm"
                                variant={showCenterOnly ? 'default' : 'outline'}
                                onClick={() => setShowCenterOnly(prev => !prev)}
                                disabled={itemType !== 'character'}
                                className={cn(
                                    'rounded-full',
                                    showCenterOnly
                                        ? 'bg-cyan-600 text-white hover:bg-cyan-500'
                                        : 'border-cyan-500/40 text-cyan-200 hover:bg-cyan-500/10'
                                )}
                            >
                                Center Mods Only
                            </Button>
                            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                                Feathered Serpent series
                            </span>
                        </div>

                        <ScrollArea className="h-[600px] rounded-md border p-2 bg-background/50">
                            <div className="grid grid-cols-2 gap-2">
                                {filteredMods.map((mod, index) => (
                                    <ModCard
                                        key={`${mod.name}-${index}`}
                                        mod={mod}
                                        onDragStart={(e) => handleDragStart(e, mod)}
                                        onClick={() => handleModClick(mod)}
                                    />
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </div>
        </div>
    );
}
