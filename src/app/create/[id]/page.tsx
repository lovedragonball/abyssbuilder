'use client';

import { useState, useMemo, useEffect } from 'react';
import { notFound, useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { allCharacters, allWeapons, allMods } from '@/lib/data';
import type { Character, Weapon } from '@/lib/types';
import type { Mod, ModRarity, ModType, Element as ModElement } from '@/lib/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Plus, Search, X, Users, Crosshair, Star } from 'lucide-react';
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
            className="relative aspect-square bg-black/20 border-2 border-dashed border-border rounded-md flex items-center justify-center overflow-hidden group"
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
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 z-10 hover:bg-destructive/80 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>
            ) : (
                <span className="text-muted-foreground text-2xl">+</span>
            )}
        </div>
    );
}

const ModCard = ({ mod, onDragStart, onClick }: { mod: Mod, onDragStart: (e: React.DragEvent<HTMLDivElement>) => void, onClick: () => void }) => (
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

const SupportModModal = ({
    item,
    open,
    onOpenChange,
    initialMods,
    onSave
}: {
    item: Character | Weapon | null,
    open: boolean,
    onOpenChange: (open: boolean) => void,
    initialMods: (Mod | null)[],
    onSave: (mods: (Mod | null)[]) => void
}) => {
    const [mods, setMods] = useState(initialMods);
    const [searchQuery, setSearchQuery] = useState('');
    const [modTypeFilters, setModTypeFilters] = useState<ModType[]>([]);
    const [rarityFilters, setRarityFilters] = useState<ModRarity[]>([]);
    const [elementFilter, setElementFilter] = useState<ModElement | 'All'>('All');

    useEffect(() => {
        setMods(initialMods);
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
            // Enhanced search - ค้นหาทั้งชื่อ, mainAttribute, และ effect
            const searchLower = searchQuery.toLowerCase();
            const searchMatch = !searchQuery || 
                mod.name.toLowerCase().includes(searchLower) ||
                mod.mainAttribute.toLowerCase().includes(searchLower) ||
                (mod.effect && mod.effect.toLowerCase().includes(searchLower));
            
            // Multi-select type filter
            const typeMatch = modTypeFilters.length === 0 || modTypeFilters.includes(mod.modType);
            
            // Multi-select rarity filter
            const rarityMatch = rarityFilters.length === 0 || rarityFilters.includes(mod.rarity);
            
            const elementMatch = elementFilter === 'All' || !mod.element || mod.element === elementFilter;
            return searchMatch && typeMatch && rarityMatch && elementMatch;
        });
    }, [searchQuery, modTypeFilters, rarityFilters, elementFilter]);


    if (!item) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-7xl">
                <DialogHeader>
                    <DialogTitle>Configure Mods for {item.name}</DialogTitle>
                    <DialogDescription>
                        Add up to 8 mods for this support item. You can change these later.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-4">
                    <div className="md:col-span-1">
                        <h3 className="font-semibold mb-4 text-center">Equipped Mods</h3>
                        <div className="grid grid-cols-4 gap-2">
                            {mods.map((mod, i) => (
                                <ModSlot
                                    key={i}
                                    mod={mod}
                                    onDrop={(e) => handleDrop(e, i)}
                                    onDragOver={handleDragOver}
                                    onRemove={() => handleRemoveMod(i)}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="md:col-span-2">
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

                            <ScrollArea className="h-[40vh] rounded-md border p-2 bg-background/50">
                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
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
                <DialogFooter>
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
    const [visibility, setVisibility] = useState<'public' | 'private'>('public');

    const [team, setTeam] = useState<(Character | null)[]>([null, null]);
    const [supportWeapons, setSupportWeapons] = useState<(Weapon | null)[]>([null, null]);

    const [supportMods, setSupportMods] = useState<Record<string, (Mod | null)[]>>({
        'support-char-0': Array(8).fill(null),
        'support-char-1': Array(8).fill(null),
        'support-wpn-0': Array(8).fill(null),
        'support-wpn-1': Array(8).fill(null),
    });

    const [isCharModalOpen, setCharModalOpen] = useState(false);
    const [isWeaponModalOpen, setWeaponModalOpen] = useState(false);
    const [isSupportModModalOpen, setSupportModModalOpen] = useState(false);

    const [selectingSupportIndex, setSelectingSupportIndex] = useState<number | null>(null);
    const [selectingWeaponSlot, setSelectingWeaponSlot] = useState<'support-0' | 'support-1' | null>(null);

    const [editingSupportSlot, setEditingSupportSlot] = useState<string | null>(null);


    const [buildSlots, setBuildSlots] = useState<(Mod | null)[]>(Array(8).fill(null));
    const [searchQuery, setSearchQuery] = useState('');
    const [modTypeFilters, setModTypeFilters] = useState<ModType[]>([]);
    const [rarityFilters, setRarityFilters] = useState<ModRarity[]>([]);
    const [elementFilter, setElementFilter] = useState<ModElement | 'All'>('All');


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
                    setVisibility(existingBuild.visibility || 'public');

                    // Load mods
                    const loadedMods = (existingBuild.mods || [])
                        .map((modName: string) => allMods.find((m) => m.name === modName))
                        .filter(Boolean);
                    setBuildSlots([...loadedMods, ...Array(8 - loadedMods.length).fill(null)]);

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

                    // Load support mods
                    if (existingBuild.supportMods) {
                        const loadedSupportMods: Record<string, (Mod | null)[]> = {};
                        Object.entries(existingBuild.supportMods).forEach(([key, modNames]) => {
                            const mods = (modNames as string[])
                                .map((modName) => allMods.find((m) => m.name === modName))
                                .filter(Boolean);
                            loadedSupportMods[key] = [...mods, ...Array(8 - mods.length).fill(null)];
                        });
                        setSupportMods((prev) => ({ ...prev, ...loadedSupportMods }));
                    }
                }
            } else {
                // New build
                setBuildName(`NEW BUILD: ${item.name.toUpperCase()}`);
            }
        }
    }, [item]);

    if (!item) {
        notFound();
    }

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-md mx-auto text-center">
                    <div className="mb-6">
                        <Users className="h-16 w-16 mx-auto text-muted-foreground" />
                    </div>
                    <h1 className="text-3xl font-headline font-bold mb-4">
                        Login Required
                    </h1>
                    <p className="text-muted-foreground mb-8">
                        You need to be logged in to create builds. Please login to continue.
                    </p>
                    <Button asChild size="lg">
                        <Link href="/">
                            Go to Home
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    const handleSaveBuild = () => {
        if (!user) {
            toast({
                variant: 'destructive',
                title: 'Not Logged In',
                description: 'Please log in to save your build.',
            });
            return;
        }

        // Check if we're editing an existing build
        const urlParams = new URLSearchParams(window.location.search);
        const existingBuildId = urlParams.get('buildId');

        const buildData: any = {
            id: existingBuildId || uuidv4(),
            userId: user.uid,
            buildName: buildName,
            description: buildDescription,
            guide: buildGuide,
            visibility: visibility,
            itemType: itemType,
            itemId: item.id,
            itemName: item.name,
            itemImage: item.image,
            creator: user.displayName,
            mods: buildSlots.filter(Boolean).map(m => m?.name),
            team: team.filter(Boolean).map(c => c?.id),
            supportWeapons: supportWeapons.filter(Boolean).map(w => w?.id),
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
            description: existingBuildId ? 'Your build has been updated.' : 'Your new build has been added to your profile.',
        });

        router.push('/profile');
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
        }

        if (slotId) {
            setEditingSupportSlot(slotId);
            setSupportModModalOpen(true);
        }
        setWeaponModalOpen(false);
    }

    const openWeaponModal = (slot: 'support-0' | 'support-1') => {
        setSelectingWeaponSlot(slot);
        setWeaponModalOpen(true);
    }


    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, mod: Mod) => {
        e.dataTransfer.setData("modName", mod.name);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        e.preventDefault();
        const modName = e.dataTransfer.getData("modName");
        const mod = allMods.find(m => m.name === modName);
        if (mod) {
            const newBuildSlots = [...buildSlots];
            newBuildSlots[index] = mod;
            setBuildSlots(newBuildSlots);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleModClick = (mod: Mod) => {
        const newBuildSlots = [...buildSlots];
        const emptySlotIndex = newBuildSlots.findIndex(slot => slot === null);
        if (emptySlotIndex !== -1) {
            newBuildSlots[emptySlotIndex] = mod;
            setBuildSlots(newBuildSlots);
        }
    };

    const handleRemoveMod = (index: number) => {
        const newBuildSlots = [...buildSlots];
        newBuildSlots[index] = null;
        setBuildSlots(newBuildSlots);
    }

    const handleRemoveAllMods = () => {
        setBuildSlots(Array(8).fill(null));
    }

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
            // Enhanced search - ค้นหาทั้งชื่อ, mainAttribute, และ effect
            const searchLower = searchQuery.toLowerCase();
            const searchMatch = !searchQuery || 
                mod.name.toLowerCase().includes(searchLower) ||
                mod.mainAttribute.toLowerCase().includes(searchLower) ||
                (mod.effect && mod.effect.toLowerCase().includes(searchLower));
            
            // Multi-select type filter
            const typeMatch = modTypeFilters.length === 0 || modTypeFilters.includes(mod.modType);
            
            // Multi-select rarity filter
            const rarityMatch = rarityFilters.length === 0 || rarityFilters.includes(mod.rarity);
            
            const elementMatch = elementFilter === 'All' || !mod.element || mod.element === elementFilter;
            return searchMatch && typeMatch && rarityMatch && elementMatch;
        });
    }, [searchQuery, modTypeFilters, rarityFilters, elementFilter]);

    const MainModSlot = ({ mod, index }: { mod: Mod | null, index: number }) => (
        <ModSlot
            mod={mod}
            onDrop={(e) => handleDrop(e, index)}
            onDragOver={handleDragOver}
            onRemove={() => handleRemoveMod(index)}
        />
    );


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
                                <div>
                                    <Label className="text-base font-semibold">Visibility</Label>
                                    <RadioGroup defaultValue="public" value={visibility} onValueChange={(value) => setVisibility(value as 'public' | 'private')} className="mt-2 flex gap-4">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="public" id="r1" />
                                            <Label htmlFor="r1">Public</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="private" id="r2" />
                                            <Label htmlFor="r2">Private</Label>
                                        </div>
                                    </RadioGroup>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Public builds are visible to everyone. Private builds are only visible to you.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

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

                {/* Center Column - Build Config */}
                <div className="lg:col-span-6">
                    <div className="relative aspect-video rounded-lg bg-card/30 flex items-center justify-center p-8">
                        <div className="grid grid-cols-4 gap-4 w-full max-w-lg z-10">
                            {buildSlots.map((mod, i) => (
                                <MainModSlot key={i} mod={mod} index={i} />
                            ))}
                        </div>
                    </div>
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
                                options={[
                                    { value: 'Characters' as ModType, label: 'Characters' },
                                    { value: 'Melee Weapon' as ModType, label: 'Melee Weapon' },
                                    { value: 'Ranged Weapon' as ModType, label: 'Ranged Weapon' },
                                    { value: 'Melee Consonance Weapon' as ModType, label: 'Melee Consonance' },
                                    { value: 'Ranged Consonance Weapon' as ModType, label: 'Ranged Consonance' },
                                ]}
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
