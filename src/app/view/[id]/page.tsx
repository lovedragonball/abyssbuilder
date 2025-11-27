'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Star, TrendingUp, BookOpen, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { allCharacters, allWeapons, allMods } from '@/lib/data';
import type { Character, Weapon, Mod, ModRarity } from '@/lib/types';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// --- Type Definitions ---
interface Build {
    id: string;
    buildName: string;
    description?: string;
    itemName: string; // Character Name
    itemId: string;
    itemImage: string;
    itemType: string;
    createdAt: string;
    updatedAt: string;
    mods?: (string | null)[]; // Array of Mod Names
    weapon1?: string | null; // Weapon ID (from old builds)
    adjustedSlots?: number[];
    team?: (string | null)[]; // [SupportChar1 ID, SupportChar2 ID]
    supportWeapons?: (string | null)[]; // [SupportWeapon1 ID, SupportWeapon2 ID]
    supportMods?: Record<string, (string | null)[]>; // { 'support-char-0': [...], ... }
    supportAdjustedSlots?: Record<string, number[]>;
    consonanceWeapon?: string | null; // Weapon ID
    [key: string]: any;
}

// --- Animation Variants ---
const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

// --- Helper Components ---

const WeaponModsHeader = ({ weapon, label = 'Weapon Mods' }: { weapon: Weapon | null; label?: string }) => {
    return (
        <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded overflow-hidden relative bg-black/50 shrink-0">
                {weapon ? (
                    <Image
                        src={weapon.image}
                        alt={weapon.name}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-[8px] text-muted-foreground">
                        ?
                    </div>
                )}
            </div>
            <p className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">
                {weapon?.name || 'No Weapon'} {label}
            </p>
        </div>
    );
};

const RarityStars = ({ rarity }: { rarity: ModRarity }) => (
    <div className="flex items-center gap-0.5">
        {[...Array(rarity)].map((_, i) => (
            <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
        ))}
    </div>
);

const ReadOnlyModSlot = ({ modName, isAdjusted = false }: { modName: string | null, isAdjusted?: boolean }) => {
    const mod = modName ? allMods.find(m => m.id === modName || m.name === modName) : null;

    if (!mod) {
        return (
            <div className="aspect-square rounded-xl border border-dashed border-white/10 bg-white/5 flex items-center justify-center">
                <span className="text-muted-foreground/20 text-xl">+</span>
            </div>
        );
    }

    const adjustedTolerance = isAdjusted ? Math.ceil(mod.tolerance / 2) : mod.tolerance;

    return (
        <TooltipProvider delayDuration={200}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                            "relative aspect-square rounded-xl overflow-hidden border bg-black/40 group cursor-pointer",
                            mod.rarity === 5 ? "border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.15)]" :
                                mod.rarity === 4 ? "border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]" :
                                    mod.rarity === 3 ? "border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)]" :
                                        "border-white/20",
                            isAdjusted && "ring-2 ring-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                        )}
                    >
                        <Image
                            src={mod.image}
                            alt={mod.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                        {/* Top Left: Tolerance */}
                        <div className={cn(
                            "absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold border backdrop-blur-sm",
                            isAdjusted
                                ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
                                : "bg-black/60 border-white/10 text-white/90"
                        )}>
                            {adjustedTolerance}
                        </div>

                        {/* Top Right: Symbol */}
                        {mod.symbol && (
                            <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/60 border border-white/10 text-white/90 backdrop-blur-sm">
                                {mod.symbol}
                            </div>
                        )}

                        {/* Bottom: Name & Rarity */}
                        <div className="absolute bottom-0 left-0 right-0 p-1.5">
                            <div className="flex justify-center mb-0.5">
                                <RarityStars rarity={mod.rarity} />
                            </div>
                            <p className="text-[9px] text-center font-medium text-white/90 line-clamp-1 leading-tight">
                                {mod.name}
                            </p>
                        </div>
                    </motion.div>
                </TooltipTrigger>
                <TooltipContent side="top" className="w-64 p-3 bg-popover/95 backdrop-blur-md border-border/50">
                    <div className="space-y-2">
                        <div className="flex justify-between items-start">
                            <h4 className="font-bold text-sm">{mod.name}</h4>
                            <RarityStars rarity={mod.rarity} />
                        </div>
                        <div className="text-xs space-y-1">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Type</span>
                                <span>{mod.modType}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Main Stat</span>
                                <span className="text-primary">{mod.mainAttribute}</span>
                            </div>
                            {mod.effect && (
                                <p className="text-muted-foreground pt-1 border-t border-white/10 mt-1">
                                    {mod.effect}
                                </p>
                            )}
                        </div>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

const ReadOnlyWeaponCard = ({ weaponId }: { weaponId: string | null }) => {
    const weapon = weaponId ? allWeapons.find(w => w.id === weaponId) : null;

    if (!weapon) {
        return (
            <div className="h-full w-full rounded-xl border border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center gap-2 p-4 text-muted-foreground/40">
                <div className="w-8 h-8 rounded-full border border-dashed border-current flex items-center justify-center">
                    <span className="text-xs">+</span>
                </div>
                <span className="text-xs">No Weapon</span>
            </div>
        );
    }

    return (
        <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <Card className="h-full overflow-hidden border-white/10 bg-black/20 group hover:border-white/20 transition-all hover:shadow-xl">
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <Image
                        src={weapon.image}
                        alt={weapon.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-3 right-3">
                        <p className="font-bold text-sm text-white truncate">{weapon.name}</p>
                        <p className="text-[10px] text-white/60 uppercase tracking-wider">{weapon.type}</p>
                    </div>
                </div>
                <CardContent className="p-3 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white/5 rounded px-2 py-1">
                            <span className="text-muted-foreground block text-[9px] uppercase">ATK</span>
                            <span className="font-medium">{weapon.maxAttack}</span>
                        </div>
                        <div className="bg-white/5 rounded px-2 py-1">
                            <span className="text-muted-foreground block text-[9px] uppercase">Crit</span>
                            <span className="font-medium">{weapon.stats?.critChance || '0%'}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};

const ReadOnlyCharacterCard = ({ charId }: { charId: string | null }) => {
    const character = charId ? allCharacters.find(c => c.id === charId) : null;

    if (!character) {
        return (
            <div className="aspect-[3/4] rounded-xl border border-dashed border-white/10 bg-white/5 flex items-center justify-center text-muted-foreground/40">
                <span className="text-xs">No Character</span>
            </div>
        );
    }

    return (
        <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.3 }}>
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden border border-white/10 bg-black/40 group hover:shadow-2xl transition-shadow">
                <Image
                    src={character.image}
                    alt={character.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-bold text-lg text-white leading-none mb-1">{character.name}</h3>
                    <Badge variant="outline" className="bg-black/50 border-white/20 text-white/80 text-[10px] h-5">
                        {character.element}
                    </Badge>
                </div>
            </div>
        </motion.div>
    );
};

// --- Main Page Component ---

export default function BuildViewPage() {
    const params = useParams();
    const router = useRouter();
    const [build, setBuild] = useState<Build | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadBuild = () => {
            try {
                const savedBuilds = JSON.parse(localStorage.getItem('builds') || '[]');
                const foundBuild = savedBuilds.find((b: Build) => b.id === params.id);

                if (foundBuild) {
                    console.log('Loaded Build:', foundBuild);
                    console.log('Support Mods:', foundBuild.supportMods);
                    setBuild(foundBuild);
                } else {
                    console.error("Build not found");
                }
            } catch (error) {
                console.error("Error loading build:", error);
            } finally {
                setLoading(false);
            }
        };

        loadBuild();
    }, [params.id]);

    // Calculate tolerance stats
    const toleranceStats = useMemo(() => {
        if (!build) return { total: 0, adjusted: 0 };

        const mainMods = build.mods || [];
        const adjustedSlots = build.adjustedSlots || [];

        let total = 0;
        let adjusted = 0;

        mainMods.forEach((modName, index) => {
            if (!modName) return;
            const mod = allMods.find(m => m.name === modName);
            if (!mod) return;

            const isAdjusted = adjustedSlots.includes(index);
            const tolerance = isAdjusted ? Math.ceil(mod.tolerance / 2) : mod.tolerance;

            total += tolerance;
            if (isAdjusted) adjusted += tolerance;
        });

        return { total, adjusted };
    }, [build]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="h-12 w-12 rounded-full bg-primary/20 animate-pulse" />
                    <p className="text-muted-foreground text-sm">Loading build details...</p>
                </motion.div>
            </div>
        );
    }

    if (!build) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold">Build Not Found</h1>
                    <p className="text-muted-foreground">The build you are looking for does not exist or has been deleted.</p>
                </div>
                <Button onClick={() => router.push('/my-builds')} variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to My Builds
                </Button>
            </div>
        );
    }

    // --- Derived Data ---
    const character = allCharacters.find(c => c.id === build.itemId);
    const mainWeaponId = build.weapon1;
    const mainMods = build.mods || Array(9).fill(null);

    // Team Support Data
    const supportChar1Id = build.team?.[0] || null;
    const supportChar2Id = build.team?.[1] || null;
    const supportWeapon1Id = build.supportWeapons?.[0] || null;
    const supportWeapon2Id = build.supportWeapons?.[1] || null;
    const consonanceWeaponId = build.consonanceWeapon || null;

    const supportModsChar1 = build.supportMods?.['support-char-0'] || Array(9).fill(null);
    const supportModsChar2 = build.supportMods?.['support-char-1'] || Array(9).fill(null);
    const supportModsWpn1 = build.supportMods?.['support-wpn-0'] || Array(9).fill(null);
    const supportModsWpn2 = build.supportMods?.['support-wpn-1'] || Array(9).fill(null);
    const consonanceMods = build.supportMods?.['consonance-wpn'] || Array(4).fill(null);

    // Helper to resolve names
    const supportChar1 = supportChar1Id ? allCharacters.find(c => c.id === supportChar1Id) : null;
    const supportChar2 = supportChar2Id ? allCharacters.find(c => c.id === supportChar2Id) : null;
    const supportWeapon1 = supportWeapon1Id ? allWeapons.find(w => w.id === supportWeapon1Id) : null;
    const supportWeapon2 = supportWeapon2Id ? allWeapons.find(w => w.id === supportWeapon2Id) : null;
    const consonanceWeapon = consonanceWeaponId ? allWeapons.find(w => w.id === consonanceWeaponId) : null;

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60"
            >
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-lg font-bold leading-tight">{build.buildName}</h1>
                            <p className="text-xs text-muted-foreground flex items-center gap-2">
                                <span > {build.itemType} Build</span>
                                <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                                <span > Updated {new Date(build.updatedAt).toLocaleDateString()}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => router.push(`/create/${build.itemId}?buildId=${build.id}`)}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                    </div>
                </div>
            </motion.header >

            <main className="container py-8 space-y-8">

                {/* Stats Summary Card */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={fadeIn}
                >
                    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                        <CardContent className="p-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <TrendingUp className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Total Tolerance</p>
                                        <p className="text-lg font-bold">{toleranceStats.total}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                        <Star className="h-5 w-5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Adjusted Slots</p>
                                        <p className="text-lg font-bold">{build.adjustedSlots?.length || 0}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                        <BookOpen className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Main Mods</p>
                                        <p className="text-lg font-bold">{mainMods.filter(m => m !== null).length}/9</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                        <Star className="h-5 w-5 text-purple-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Support Team</p>
                                        <p className="text-lg font-bold">{[supportChar1Id, supportChar2Id].filter(Boolean).length}/2</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div >

                {/* Hero Section: Character & Main Stats */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: Character & Weapon */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="lg:col-span-4 space-y-6"
                    >
                        <motion.div variants={fadeIn} className="grid grid-cols-2 gap-4">
                            <div className="col-span-1">
                                <ReadOnlyCharacterCard charId={build.itemId} />
                            </div>
                            <div className="col-span-1">
                                <ReadOnlyWeaponCard weaponId={mainWeaponId ?? null} />
                            </div>
                        </motion.div >

                        {/* Description Card */}
                        {
                            build.description && (
                                <motion.div variants={fadeIn}>
                                    <Card className="bg-muted/30 border-none">
                                        <CardContent className="p-4">
                                            <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">Description</h3>
                                            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                                                {build.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </motion.div >
                            )
                        }
                    </motion.div >

                    {/* Right: Main Mods Grid */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeIn}
                        className="lg:col-span-8"
                    >
                        <Card className="h-full border-none bg-muted/10">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <div className="h-6 w-1 rounded-full bg-primary" />
                                    Main Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <WeaponModsHeader
                                    weapon={mainWeaponId ? (allWeapons.find(w => w.id === mainWeaponId) || null) : null}
                                    label="Mods"
                                />
                                <motion.div
                                    variants={staggerContainer}
                                    initial="hidden"
                                    animate="visible"
                                    className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3"
                                >
                                    {mainMods.map((modName, index) => (
                                        <motion.div
                                            key={index}
                                            variants={fadeIn}
                                            className={cn(
                                                "relative",
                                                index === 8 && "col-span-full sm:col-span-1 sm:col-start-auto flex justify-center sm:block"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-full max-w-[100px] mx-auto",
                                                index === 8 && "scale-110 origin-center z-10"
                                            )}>
                                                <ReadOnlyModSlot
                                                    modName={modName}
                                                    isAdjusted={build.adjustedSlots?.includes(index)}
                                                />
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </section>

                <Separator className="my-8" />

                {/* Team Support Section */}
                <section className="space-y-6">
                    <div className="flex items-center gap-2 mb-6">
                        <h2 className="text-2xl font-bold tracking-tight">Team Support</h2>
                        <Badge variant="secondary" className="text-xs">Read Only</Badge>
                    </div>

                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    >

                        {/* Support Character 1 */}
                        <motion.div variants={fadeIn} >
                            <Card className="overflow-hidden border-white/5 bg-black/20">
                                <CardHeader className="pb-3 bg-white/5 border-b border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg overflow-hidden relative bg-black/50">
                                            {
                                                supportChar1 ? (
                                                    <Image
                                                        src={supportChar1.image}
                                                        alt={supportChar1.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">?</div>
                                                )
                                            }
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">{supportChar1?.name || 'Support 1'}</CardTitle>
                                            <p className="text-xs text-muted-foreground">Support Character</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 space-y-4">
                                    {/* Weapon */}
                                    <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                                        <div className="w-8 h-8 rounded overflow-hidden relative bg-black/50 shrink-0">
                                            {
                                                supportWeapon1 ? (
                                                    <Image
                                                        src={supportWeapon1.image}
                                                        alt={supportWeapon1.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">?</div>
                                                )
                                            }
                                        </div>
                                        <span className="text-sm font-medium truncate">{supportWeapon1?.name || 'No Weapon'}</span>
                                    </div>

                                    {/* Mods Grid */}
                                    <div >
                                        <p className="text-[10px] uppercase text-muted-foreground font-semibold mb-2 tracking-wider">Character Mods</p>
                                        <div className="grid grid-cols-5 gap-1.5">
                                            {
                                                supportModsChar1.map((modName, idx) => (
                                                    <ReadOnlyModSlot
                                                        key={`char1-${idx}`}
                                                        modName={modName}
                                                        isAdjusted={build.supportAdjustedSlots?.['support-char-0']?.includes(idx)}
                                                    />
                                                ))
                                            }
                                        </div>
                                    </div>
                                    <div>
                                        <WeaponModsHeader weapon={supportWeapon1 || null} label="Mods" />
                                        <div className="grid grid-cols-5 gap-1.5">
                                            {
                                                supportModsWpn1.map((modName, idx) => (
                                                    <ReadOnlyModSlot
                                                        key={`wpn1-${idx}`}
                                                        modName={modName}
                                                        isAdjusted={build.supportAdjustedSlots?.['support-wpn-0']?.includes(idx)}
                                                    />
                                                ))
                                            }
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div >

                        {/* Support Character 2 */}
                        <motion.div variants={fadeIn} >
                            <Card className="overflow-hidden border-white/5 bg-black/20">
                                <CardHeader className="pb-3 bg-white/5 border-b border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg overflow-hidden relative bg-black/50">
                                            {
                                                supportChar2 ? (
                                                    <Image
                                                        src={supportChar2.image}
                                                        alt={supportChar2.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">?</div>
                                                )
                                            }
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">{supportChar2?.name || 'Support 2'}</CardTitle>
                                            <p className="text-xs text-muted-foreground">Support Character</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4 space-y-4">
                                    {/* Weapon */}
                                    <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                                        <div className="w-8 h-8 rounded overflow-hidden relative bg-black/50 shrink-0">
                                            {
                                                supportWeapon2 ? (
                                                    <Image
                                                        src={supportWeapon2.image}
                                                        alt={supportWeapon2.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">?</div>
                                                )
                                            }
                                        </div>
                                        <span className="text-sm font-medium truncate">{supportWeapon2?.name || 'No Weapon'}</span>
                                    </div>

                                    {/* Mods Grid */}
                                    <div >
                                        <p className="text-[10px] uppercase text-muted-foreground font-semibold mb-2 tracking-wider">Character Mods</p>
                                        <div className="grid grid-cols-5 gap-1.5">
                                            {
                                                supportModsChar2.map((modName, idx) => (
                                                    <ReadOnlyModSlot
                                                        key={`char2-${idx}`}
                                                        modName={modName}
                                                        isAdjusted={build.supportAdjustedSlots?.['support-char-1']?.includes(idx)}
                                                    />
                                                ))
                                            }
                                        </div>
                                    </div>
                                    <div>
                                        <WeaponModsHeader weapon={supportWeapon2 || null} label="Mods" />
                                        <div className="grid grid-cols-5 gap-1.5">
                                            {
                                                supportModsWpn2.map((modName, idx) => (
                                                    <ReadOnlyModSlot
                                                        key={`wpn2-${idx}`}
                                                        modName={modName}
                                                        isAdjusted={build.supportAdjustedSlots?.['support-wpn-1']?.includes(idx)}
                                                    />
                                                ))
                                            }
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div >

                        {/* Consonance Weapon - CONDITIONAL */}
                        {
                            consonanceWeaponId && (
                                <motion.div variants={fadeIn} className="md:col-span-2 xl:col-span-1">
                                    <Card className="overflow-hidden border-white/5 bg-black/20">
                                        <CardHeader className="pb-3 bg-white/5 border-b border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg overflow-hidden relative bg-black/50">
                                                    {
                                                        consonanceWeapon ? (
                                                            <Image
                                                                src={consonanceWeapon.image}
                                                                alt={consonanceWeapon.name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">?</div>
                                                        )
                                                    }
                                                </div>
                                                <div>
                                                    <CardTitle className="text-base">{consonanceWeapon?.name || 'Consonance'}</CardTitle>
                                                    <p className="text-xs text-muted-foreground">Consonance Weapon</p>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-4">
                                            <WeaponModsHeader weapon={consonanceWeapon || null} label="Mods" />
                                            <div className="grid grid-cols-4 gap-2 max-w-[200px]">
                                                {
                                                    consonanceMods.map((modName, idx) => (
                                                        <ReadOnlyModSlot
                                                            key={`consonance-${idx}`}
                                                            modName={modName}
                                                            isAdjusted={false}
                                                        />
                                                    ))
                                                }
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div >
                            )
                        }

                    </motion.div >
                </section>

            </main>
        </div>
    );
}
