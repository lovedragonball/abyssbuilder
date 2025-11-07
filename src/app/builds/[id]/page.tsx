'use client';

import { allCharacters, allWeapons, allMods } from '@/lib/data';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Calendar, ArrowLeft, Star, Trash2, ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import type { Character, Weapon, Build, Mod } from '@/lib/types';
import { useEffect, useState } from 'react';
import { getBuild, deleteBuild, voteBuild, incrementBuildViews } from '@/lib/firestore';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import {
    pageVariants,
    fadeInUp,
    staggerContainer,
    staggerItem,
    hoverScale,
    tapScale,
} from '@/lib/animations';
import { AnimatedCounter } from '@/components/animated-counter';
import { SkeletonBuildDetail } from '@/components/skeleton-loader';

function SupportItemCard({
    item,
    mods,
    type,
}: {
    item: Character | Weapon;
    mods: Mod[];
    type: 'character' | 'weapon';
}) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <motion.div
                className="flex items-center gap-3 cursor-pointer hover:bg-accent/50 p-3 rounded-lg transition-colors group border border-border hover:border-primary"
                onClick={() => setIsOpen(true)}
                whileHover={hoverScale}
                whileTap={tapScale}
            >
                <div
                    className={`relative w-16 h-16 ${type === 'character' ? 'rounded-full' : 'rounded-md'} overflow-hidden border-2 border-primary shadow-lg`}
                >
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
                <div className="flex-1">
                    <p className="font-semibold text-base">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                        {type === 'character' ? (item as Character).element : (item as Weapon).type}
                    </p>
                    {mods.length > 0 && (
                        <p className="text-xs text-primary font-medium mt-1">
                            {mods.length} mod{mods.length > 1 ? 's' : ''} equipped
                        </p>
                    )}
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </motion.div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-4">
                            <div
                                className={`relative w-16 h-16 ${type === 'character' ? 'rounded-full' : 'rounded-md'} overflow-hidden border-2 border-primary shadow-lg`}
                            >
                                <Image src={item.image} alt={item.name} fill className="object-cover" />
                            </div>
                            <div>
                                <p className="text-xl font-bold">{item.name}</p>
                                <p className="text-sm text-muted-foreground font-normal">
                                    {type === 'character' ? (item as Character).element : (item as Weapon).type}
                                </p>
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="py-4">
                        {mods.length > 0 ? (
                            <>
                                <h3 className="font-semibold text-lg mb-4">Equipped Mods ({mods.length})</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {mods.map((mod, index) => (
                                        <div
                                            key={index}
                                            className="relative aspect-square rounded-md overflow-hidden border-2 border-primary/50 hover:border-primary transition-all group"
                                        >
                                            <Image
                                                src={mod.image}
                                                alt={mod.name}
                                                fill
                                                className="object-cover"
                                                data-ai-hint="abstract pattern"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                                            <div className="absolute bottom-0 left-0 right-0 p-2">
                                                <p className="text-white text-center font-bold text-[10px] leading-tight line-clamp-2">
                                                    {mod.name}
                                                </p>
                                            </div>
                                            {mod.symbol && (
                                                <div className="absolute top-1 right-1 bg-black/70 text-white text-xs px-1 rounded-sm font-bold">
                                                    {mod.symbol}
                                                </div>
                                            )}
                                            <div className="absolute top-1 left-1 flex">
                                                {[...Array(mod.rarity)].map((_, i) => (
                                                    <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                ))}
                                            </div>
                                            {/* Hover overlay with details */}
                                            <div className="absolute inset-0 bg-black/95 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-center">
                                                <p className="text-white text-xs font-bold mb-2 line-clamp-2">{mod.name}</p>
                                                <p className="text-primary text-[10px] font-semibold mb-2">{mod.mainAttribute}</p>
                                                {mod.effect && (
                                                    <p className="text-muted-foreground text-[9px] line-clamp-4">{mod.effect}</p>
                                                )}
                                                <div className="mt-2 pt-2 border-t border-border/50">
                                                    <div className="flex justify-between text-[8px] text-muted-foreground">
                                                        <span>Tolerance: {mod.tolerance}</span>
                                                        <span>Track: {mod.track}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <p className="text-lg">No mods equipped</p>
                                <p className="text-sm mt-2">This {type} doesn't have any mods configured yet.</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default function BuildDetailPage() {
    const params = useParams();
    const { id } = params;
    const { user } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [build, setBuild] = useState<Build | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);
    const [currentVoteCount, setCurrentVoteCount] = useState(0);

    useEffect(() => {
        // Load build from Firestore
        const loadBuild = async () => {
            try {
                const foundBuild = await getBuild(id as string);
                setBuild(foundBuild);
                setCurrentVoteCount(foundBuild?.voteCount || 0);
                
                // Increment views
                if (foundBuild) {
                    await incrementBuildViews(id as string);
                }
            } catch (error) {
                console.error('Error loading build:', error);
            } finally {
                setLoading(false);
            }
        };
        loadBuild();
    }, [id]);

    useEffect(() => {
        if (user && build?.votedBy) {
            setHasVoted(build.votedBy.includes(user.uid));
        }
    }, [user, build?.votedBy]);

    if (loading) {
        return (
            <motion.div
                className="mx-auto max-w-7xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                <SkeletonBuildDetail />
            </motion.div>
        );
    }

    if (!build) {
        notFound();
    }

    // Find the item (character or weapon)
    const item = allCharacters.find((c) => c.id === build.itemId) || allWeapons.find((w) => w.id === build.itemId);

    if (!item) {
        notFound();
    }

    // Get mods from names
    const buildMods = (build.mods || []).map((modName) => allMods.find((m) => m.name === modName)).filter(Boolean) as Mod[];

    // Get team characters
    const teamCharacters = (build.team || [])
        .map((charId) => allCharacters.find((c) => c.id === charId))
        .filter(Boolean) as Character[];

    // Get support weapons
    const supportWeapons = (build.supportWeapons || [])
        .map((wpnId) => allWeapons.find((w) => w.id === wpnId))
        .filter(Boolean) as Weapon[];

    const isOwner = user && build.userId === user.uid;

    const handleVote = async () => {
        if (!user) {
            toast({
                variant: 'destructive',
                title: 'Login Required',
                description: 'Please login to vote on builds.',
            });
            return;
        }

        try {
            await voteBuild(build.id, user.uid, !hasVoted);
            
            if (hasVoted) {
                setHasVoted(false);
                setCurrentVoteCount((prev) => Math.max(0, prev - 1));
                toast({
                    title: 'Vote Removed',
                    description: 'Your vote has been removed.',
                });
            } else {
                setHasVoted(true);
                setCurrentVoteCount((prev) => prev + 1);
                toast({
                    title: 'Voted!',
                    description: 'Thanks for voting on this build.',
                });
            }
        } catch (error) {
            console.error('Error voting:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to vote. Please try again.',
            });
        }
    };

    const handleDeleteBuild = async () => {
        try {
            await deleteBuild(build.id);
            
            toast({
                title: 'Build Deleted',
                description: 'Your build has been deleted successfully.',
            });
            
            router.push('/profile');
        } catch (error) {
            console.error('Error deleting build:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to delete build. Please try again.',
            });
        }
    };

    return (
        <motion.div
            className="mx-auto max-w-7xl"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
        >
            <motion.div
                className="flex justify-between items-center mb-4"
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
            >
                <Button asChild variant="ghost">
                    <Link href="/profile">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Profile
                    </Link>
                </Button>
                <div className="flex gap-2">
                    {!isOwner && (
                        <Button
                            variant={hasVoted ? 'default' : 'outline'}
                            onClick={handleVote}
                            className={cn(hasVoted && 'bg-primary')}
                        >
                            <ThumbsUp className={cn('mr-2 h-4 w-4', hasVoted && 'fill-current')} />
                            {hasVoted ? 'Voted' : 'Vote'} (<AnimatedCounter value={currentVoteCount} duration={0.5} />)
                        </Button>
                    )}
                    {isOwner && (
                        <>
                            <Button asChild variant="outline">
                                <Link href={`/create/${build.itemId}?buildId=${build.id}`}>Edit Build</Link>
                            </Button>
                            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </Button>
                        </>
                    )}
                </div>
            </motion.div>

            <motion.div
                className="relative mb-8 h-64 w-full overflow-hidden rounded-lg md:h-96"
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.1 }}
            >
                <Image src={item.image} alt={item.name} fill className="object-cover object-top" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8">
                    <Badge variant="secondary" className="mb-2 text-base">
                        {build.buildName}
                    </Badge>
                    <h1 className="font-headline text-4xl font-bold text-white shadow-black [text-shadow:0_2px_4px_var(--tw-shadow-color)] md:text-6xl">
                        {item.name}
                    </h1>
                    <div className="mt-4 flex items-center gap-4 text-slate-300">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4" /> <span>{build.creator}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                                Updated{' '}
                                {formatDistanceToNow(new Date(build.updatedAt), {
                                    addSuffix: true,
                                })}
                            </span>
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div
                className="grid grid-cols-1 gap-8 md:grid-cols-3"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
            >
                <motion.div className="space-y-8 md:col-span-2" variants={staggerItem}>
                    {(build.guide || build.description) && (
                        <motion.div variants={staggerItem}>
                            <Card>
                            <CardHeader>
                                <CardTitle>Guide</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {build.guide ? (
                                    <div className="prose prose-invert max-w-none">
                                        <p className="leading-relaxed text-muted-foreground whitespace-pre-wrap">{build.guide}</p>
                                    </div>
                                ) : build.description ? (
                                    <div className="prose prose-invert max-w-none">
                                        <p className="leading-relaxed text-muted-foreground whitespace-pre-wrap">{build.description}</p>
                                    </div>
                                ) : (
                                    <p className="leading-relaxed text-muted-foreground italic">No guide available yet.</p>
                                )}
                            </CardContent>
                        </Card>
                        </motion.div>
                    )}

                    {buildMods.length > 0 && (
                        <motion.div variants={staggerItem}>
                            <Card>
                            <CardHeader>
                                <CardTitle>Mods ({buildMods.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <motion.div
                                    className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                                    variants={staggerContainer}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    {buildMods.map((mod, index) => (
                                        <motion.div
                                            variants={staggerItem}
                                            whileHover={{ scale: 1.05, rotate: 2 }}
                                            whileTap={{ scale: 0.95 }}
                                            key={index}
                                            className="relative aspect-square rounded-md overflow-hidden border-2 border-primary/50 hover:border-primary transition-all cursor-pointer group"
                                        >
                                            <Image
                                                src={mod.image}
                                                alt={mod.name}
                                                fill
                                                className="object-cover"
                                                data-ai-hint="abstract pattern"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                                            <div className="absolute bottom-0 left-0 right-0 p-2">
                                                <p className="text-white text-center font-bold text-[10px] leading-tight line-clamp-2">
                                                    {mod.name}
                                                </p>
                                            </div>
                                            {mod.symbol && (
                                                <div className="absolute top-1 right-1 bg-black/70 text-white text-xs px-1 rounded-sm font-bold">
                                                    {mod.symbol}
                                                </div>
                                            )}
                                            <div className="absolute top-1 left-1 flex">
                                                {[...Array(mod.rarity)].map((_, i) => (
                                                    <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                ))}
                                            </div>
                                            {/* Hover overlay with details */}
                                            <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-center">
                                                <p className="text-white text-xs font-bold mb-1 line-clamp-2">{mod.name}</p>
                                                <p className="text-primary text-[10px] font-semibold mb-1">{mod.mainAttribute}</p>
                                                {mod.effect && (
                                                    <p className="text-muted-foreground text-[9px] line-clamp-3">{mod.effect}</p>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </CardContent>
                        </Card>
                        </motion.div>
                    )}
                </motion.div>

                <motion.div className="space-y-8" variants={staggerItem}>
                    {teamCharacters.length > 0 && (
                        <motion.div variants={staggerItem}>
                            <Card>
                            <CardHeader>
                                <CardTitle>Team</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {teamCharacters.map((char, index) => {
                                        const charMods = (build.supportMods?.[`support-char-${index}`] || [])
                                            .map((modName) => allMods.find((m) => m.name === modName))
                                            .filter(Boolean) as Mod[];
                                        return (
                                            <SupportItemCard
                                                key={char.id}
                                                item={char}
                                                mods={charMods}
                                                type="character"
                                            />
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                        </motion.div>
                    )}

                    {supportWeapons.length > 0 && (
                        <motion.div variants={staggerItem}>
                            <Card>
                            <CardHeader>
                                <CardTitle>Support Weapons</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {supportWeapons.map((weapon, index) => {
                                        const weaponMods = (build.supportMods?.[`support-wpn-${index}`] || [])
                                            .map((modName) => allMods.find((m) => m.name === modName))
                                            .filter(Boolean) as Mod[];
                                        return (
                                            <SupportItemCard
                                                key={weapon.id}
                                                item={weapon}
                                                mods={weaponMods}
                                                type="weapon"
                                            />
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                        </motion.div>
                    )}

                    <motion.div variants={staggerItem}>
                        <Card>
                        <CardHeader>
                            <CardTitle>Build Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Type</span>
                                <span className="font-medium capitalize">{build.itemType}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Visibility</span>
                                <Badge variant={build.visibility === 'public' ? 'secondary' : 'destructive'} className="capitalize">
                                    {build.visibility}
                                </Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Created</span>
                                <span className="font-medium">
                                    {formatDistanceToNow(new Date(build.createdAt), {
                                        addSuffix: true,
                                    })}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                    </motion.div>
                </motion.div>
            </motion.div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Build</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{build.buildName}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteBuild}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Build
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}
