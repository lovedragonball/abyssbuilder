'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { allCharacters, allWeapons, allWeaponTypes } from '@/lib/data';
import { allGeniemon } from '@/lib/geniemon-data';
import type { Character, Weapon, WeaponType, Element, RangedWeaponType } from '@/lib/types';
import type { Geniemon, GeniemonElement } from '@/lib/geniemon-data';
import { geniemonTraits } from '@/lib/geniemon-traits';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, Sword, Users, Zap, Grid3x3, List, SortAsc, Star, TrendingUp, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WeaponInfoModal } from '@/components/WeaponInfoModal';


const characterElements: (Element | 'all')[] = ['all', 'Lumino', 'Anemo', 'Hydro', 'Pyro', 'Electro', 'Umbro'];
const weaponTypes: (WeaponType | RangedWeaponType | 'all')[] = ['all', ...allWeaponTypes];
const geniemonElements: (GeniemonElement | 'all')[] = ['all', 'Lumino', 'Anemo', 'Hydro', 'Pyro', 'Electro', 'Umbro', 'Neutral'];

const itemCardVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 15
        }
    },
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
        },
    },
};

const heroVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: 'easeOut'
        }
    },
};

const getElementIcon = (element: string) => {
    const elementMap: Record<string, string> = {
        'Umbro': 'https://files.boarhat.gg/assets/duetnightabyss/common/element/umbro.PNG',
        'Anemo': 'https://files.boarhat.gg/assets/duetnightabyss/common/element/anemo.PNG',
        'Lumino': 'https://files.boarhat.gg/assets/duetnightabyss/common/element/lumino.PNG',
        'Hydro': 'https://files.boarhat.gg/assets/duetnightabyss/common/element/hydro.PNG',
        'Pyro': 'https://files.boarhat.gg/assets/duetnightabyss/common/element/pyro.PNG',
        'Electro': 'https://files.boarhat.gg/assets/duetnightabyss/common/element/electro.PNG',
    };
    return elementMap[element] || '';
};

const ItemCard = ({ item, type }: { item: Character | Weapon | Geniemon; type?: 'character' | 'weapon' | 'geniemon' }) => {
    const href = type === 'geniemon' ? `/geniemon/${item.id}` : `/create/${item.id}`;
    const element = 'element' in item ? item.element : null;
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            variants={itemCardVariants}
            whileHover={{
                y: -8,
                scale: 1.03,
                transition: {
                    type: 'spring',
                    stiffness: 400,
                    damping: 17
                }
            }}
            whileTap={{ scale: 0.98 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
        >
            <Link href={href} passHref>
                <Card className="group block overflow-hidden bg-card border-2 border-transparent hover:border-primary transition-all duration-300 aspect-square relative hover:shadow-xl hover:shadow-primary/20">
                    <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        data-ai-hint="fantasy item"
                    />
                    {/* Shine effect on hover */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent"
                        initial={{ x: '-100%', opacity: 0 }}
                        animate={isHovered ? { x: '100%', opacity: 1 } : { x: '-100%', opacity: 0 }}
                        transition={{ duration: 0.6 }}
                    />
                    {/* Element Icon */}
                    {element && type === 'character' && (
                        <motion.div
                            className="absolute top-2 right-2 w-8 h-8 rounded-md overflow-hidden bg-black/60 backdrop-blur-sm border border-white/20 z-10"
                            whileHover={{ scale: 1.2, rotate: 360 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Image
                                src={getElementIcon(element)}
                                alt={element}
                                fill
                                className="object-contain p-1"
                            />
                        </motion.div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
                    <motion.div
                        className="absolute inset-x-0 bottom-0 p-2 text-center"
                        animate={isHovered ? { y: -4 } : { y: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <p className="font-semibold text-sm text-white truncate group-hover:text-primary transition-colors">
                            {item.name.toUpperCase()}
                        </p>
                    </motion.div>
                    {/* Glow effect on hover */}
                    <motion.div
                        className="absolute inset-0 bg-primary/10 rounded-lg"
                        initial={{ opacity: 0 }}
                        animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    />
                </Card>
            </Link>
        </motion.div>
    );
};

const ItemGrid = ({ items, type }: { items: (Character[] | Weapon[] | Geniemon[]); type?: 'character' | 'weapon' | 'geniemon' }) => (
    <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4"
        initial="hidden"
        animate="visible"
        variants={{
            visible: {
                transition: {
                    staggerChildren: 0.02,
                },
            },
        }}
    >
        {items.map(item => (
            <ItemCard key={item.id} item={item} type={type} />
        ))}
    </motion.div>
)

const CharacterGrid = () => {
    const [selectedElement, setSelectedElement] = useState<Element | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState<'name' | 'element'>('name');

    const filteredCharacters = useMemo(() => {
        let filtered = allCharacters;

        if (selectedElement !== 'all') {
            filtered = filtered.filter(c => c.element === selectedElement);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(c =>
                c.name.toLowerCase().includes(query)
            );
        }

        // Sort
        if (sortBy === 'name') {
            filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === 'element') {
            filtered = [...filtered].sort((a, b) => a.element.localeCompare(b.element));
        }

        return filtered;
    }, [selectedElement, searchQuery, sortBy]);

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <motion.div
                        className="relative flex-1 max-w-md"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search characters..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </motion.div>
                    <motion.div
                        className="w-full sm:w-48"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Select onValueChange={(value) => setSelectedElement(value as Element | 'all')} defaultValue="all">
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by Element" />
                            </SelectTrigger>
                            <SelectContent>
                                {characterElements.map(element => (
                                    <SelectItem key={element} value={element} className="capitalize">{element}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </motion.div>
                </div>

                {/* Quick Filter Chips & Controls */}
                <motion.div
                    className="flex flex-wrap items-center gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    {/* Element Quick Filters */}
                    <div className="flex flex-wrap gap-2">
                        {characterElements.filter(e => e !== 'all').map((element) => (
                            <Badge
                                key={element}
                                variant={selectedElement === element ? 'default' : 'outline'}
                                className="cursor-pointer hover:bg-primary/80 transition-colors"
                                onClick={() => setSelectedElement(selectedElement === element ? 'all' : element as Element)}
                            >
                                {element}
                                {selectedElement === element && <X className="ml-1 h-3 w-3" />}
                            </Badge>
                        ))}
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                        {/* Stats Counter */}
                        <motion.div
                            className="flex items-center gap-2 px-3 py-1.5 bg-card border rounded-md text-sm"
                            whileHover={{ scale: 1.05 }}
                        >
                            <TrendingUp className="h-4 w-4 text-primary" />
                            <span className="font-semibold">{filteredCharacters.length}</span>
                            <span className="text-muted-foreground">items</span>
                        </motion.div>

                        {/* Sort */}
                        <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'name' | 'element')}>
                            <SelectTrigger className="w-32">
                                <SortAsc className="h-4 w-4 mr-2" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="name">Name</SelectItem>
                                <SelectItem value="element">Element</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* View Mode Toggle */}
                        <div className="flex gap-1 p-1 bg-card border rounded-md">
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('grid')}
                                className="h-8 w-8 p-0"
                            >
                                <Grid3x3 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('list')}
                                className="h-8 w-8 p-0"
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={`${selectedElement}-${searchQuery}-${viewMode}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {filteredCharacters.length > 0 ? (
                        viewMode === 'grid' ? (
                            <ItemGrid items={filteredCharacters} type="character" />
                        ) : (
                            <div className="space-y-2">
                                {filteredCharacters.map((char, index) => (
                                    <motion.div
                                        key={char.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                    >
                                        <Link href={`/create/${char.id}`}>
                                            <Card className="p-4 hover:border-primary transition-all hover:shadow-lg group cursor-pointer">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                                        <Image
                                                            src={char.image}
                                                            alt={char.name}
                                                            fill
                                                            className="object-cover group-hover:scale-110 transition-transform"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                                            {char.name}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant="outline">{char.element}</Badge>
                                                            {char.melee && <Badge variant="secondary">{char.melee}</Badge>}
                                                        </div>
                                                    </div>
                                                    <div className="text-muted-foreground group-hover:text-primary transition-colors">
                                                        →
                                                    </div>
                                                </div>
                                            </Card>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        )
                    ) : (
                        <motion.div
                            className="text-center py-16"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <p className="text-muted-foreground text-lg">No characters found</p>
                            <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters</p>
                        </motion.div>
                    )}
                </motion.div>
            </AnimatePresence>
        </motion.div>
    )
}

const WeaponGrid = () => {
    const [selectedType, setSelectedType] = useState<WeaponType | RangedWeaponType | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState<'name' | 'type'>('name');
    const [isWeaponInfoOpen, setIsWeaponInfoOpen] = useState(false);

    const filteredWeapons = useMemo(() => {
        let filtered = allWeapons;

        if (selectedType !== 'all') {
            filtered = filtered.filter(w => w.type === selectedType);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(w =>
                w.name.toLowerCase().includes(query)
            );
        }

        // Sort
        if (sortBy === 'name') {
            filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === 'type') {
            filtered = [...filtered].sort((a, b) => a.type.localeCompare(b.type));
        }

        return filtered;
    }, [selectedType, searchQuery, sortBy]);

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <div className="mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <motion.div
                        className="relative flex-1 max-w-md"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search weapons..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </motion.div>
                    <motion.div
                        className="w-full sm:w-48"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Select onValueChange={(value) => setSelectedType(value as WeaponType | RangedWeaponType | 'all')} defaultValue="all">
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by Type" />
                            </SelectTrigger>
                            <SelectContent>
                                {weaponTypes.map(type => (
                                    <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </motion.div>
                </div>

                <motion.div
                    className="flex items-center justify-between gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <motion.div
                        className="flex items-center gap-2 px-3 py-1.5 bg-card border rounded-md text-sm"
                        whileHover={{ scale: 1.05 }}
                    >
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span className="font-semibold">{filteredWeapons.length}</span>
                        <span className="text-muted-foreground">items</span>
                    </motion.div>

                    <div className="flex items-center gap-2">
                        {/* Weapon Info Button - Ultra Enhanced */}
                        <motion.div
                            className="relative"
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {/* Animated Glow Ring */}
                            <motion.div
                                className="absolute -inset-1 rounded-lg bg-gradient-to-r from-primary via-blue-500 to-purple-500 opacity-75 blur-md"
                                animate={{
                                    opacity: [0.5, 0.8, 0.5],
                                    scale: [1, 1.05, 1],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />

                            {/* Secondary Glow Pulse */}
                            <motion.div
                                className="absolute -inset-2 rounded-lg bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 opacity-40 blur-xl"
                                animate={{
                                    opacity: [0.2, 0.5, 0.2],
                                    scale: [0.95, 1.1, 0.95],
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 0.5
                                }}
                            />

                            {/* Pulsing Notification Dot - Top Layer */}
                            <motion.span
                                className="absolute -top-2 -right-2 flex h-5 w-5 z-50"
                                animate={{
                                    scale: [1, 1.3, 1],
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            >
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-5 w-5 bg-yellow-300 shadow-lg border-2 border-white"></span>
                            </motion.span>

                            <Button
                                variant="default"
                                size="lg"
                                onClick={() => setIsWeaponInfoOpen(true)}
                                className="relative overflow-hidden flex items-center gap-3 bg-gradient-to-r from-primary via-blue-600 to-purple-600 hover:from-primary/95 hover:via-blue-700 hover:to-purple-700 text-white font-bold shadow-2xl hover:shadow-primary/50 transition-all duration-300 border-2 border-white/20 px-6 py-3 text-base"
                            >
                                {/* Shine Effect */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                    animate={{
                                        x: ['-200%', '200%'],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "linear",
                                        repeatDelay: 1
                                    }}
                                    style={{ width: '50%' }}
                                />

                                {/* Animated Icon */}
                                <motion.div
                                    className="relative z-10"
                                    animate={{
                                        rotate: [0, 15, -15, 0],
                                        scale: [1, 1.1, 1],
                                    }}
                                    transition={{
                                        duration: 2.5,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                >
                                    <Info className="h-6 w-6 drop-shadow-lg" />
                                </motion.div>

                                {/* Text with Effects */}
                                <span className="relative z-10">
                                    <span className="drop-shadow-lg tracking-wide">Weapon Info</span>
                                </span>
                            </Button>
                        </motion.div>

                        <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'name' | 'type')}>
                            <SelectTrigger className="w-32">
                                <SortAsc className="h-4 w-4 mr-2" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="name">Name</SelectItem>
                                <SelectItem value="type">Type</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="flex gap-1 p-1 bg-card border rounded-md">
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('grid')}
                                className="h-8 w-8 p-0"
                            >
                                <Grid3x3 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setViewMode('list')}
                                className="h-8 w-8 p-0"
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={`${selectedType}-${searchQuery}-${viewMode}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {filteredWeapons.length > 0 ? (
                        viewMode === 'grid' ? (
                            <ItemGrid items={filteredWeapons} type="weapon" />
                        ) : (
                            <div className="space-y-2">
                                {filteredWeapons.map((weapon, index) => (
                                    <motion.div
                                        key={weapon.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                    >
                                        <Link href={`/create/${weapon.id}`}>
                                            <Card className="p-4 hover:border-primary transition-all hover:shadow-lg group cursor-pointer">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                                        <Image
                                                            src={weapon.image}
                                                            alt={weapon.name}
                                                            fill
                                                            className="object-cover group-hover:scale-110 transition-transform"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                                            {weapon.name}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant="outline">{weapon.type}</Badge>
                                                        </div>
                                                    </div>
                                                    <div className="text-muted-foreground group-hover:text-primary transition-colors">
                                                        →
                                                    </div>
                                                </div>
                                            </Card>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                        )
                    ) : (
                        <motion.div
                            className="text-center py-16"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <p className="text-muted-foreground text-lg">No weapons found</p>
                            <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters</p>
                        </motion.div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Weapon Info Modal */}
            <WeaponInfoModal
                open={isWeaponInfoOpen}
                onOpenChange={setIsWeaponInfoOpen}
            />
        </motion.div>
    )
}

const GeniemonGrid = () => {
    const [selectedElement, setSelectedElement] = useState<GeniemonElement | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'name' | 'element' | 'rarity'>('name');
    const [rarityFilter, setRarityFilter] = useState<'all' | '2' | '3' | '4' | '5'>('all');

    const filteredGeniemon = useMemo(() => {
        let filtered = allGeniemon.filter(g => g.status === 'Active'); // Only show active geniemon

        if (selectedElement !== 'all') {
            filtered = filtered.filter(g => g.element === selectedElement);
        }

        if (rarityFilter !== 'all') {
            filtered = filtered.filter(g => g.rarity === parseInt(rarityFilter));
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(g =>
                g.name.toLowerCase().includes(query) ||
                g.activeSkill.description.toLowerCase().includes(query) ||
                g.passiveSkill.description.toLowerCase().includes(query)
            );
        }

        // Sort
        if (sortBy === 'name') {
            filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === 'element') {
            filtered = [...filtered].sort((a, b) => a.element.localeCompare(b.element));
        } else if (sortBy === 'rarity') {
            filtered = [...filtered].sort((a, b) => b.rarity - a.rarity);
        }

        return filtered;
    }, [selectedElement, searchQuery, sortBy, rarityFilter]);

    const getRarityColor = (rarity: number) => {
        switch (rarity) {
            case 5: return 'from-yellow-600/20 via-yellow-500/10 to-transparent';
            case 4: return 'from-purple-600/20 via-purple-500/10 to-transparent';
            case 3: return 'from-blue-600/20 via-blue-500/10 to-transparent';
            case 2: return 'from-green-600/20 via-green-500/10 to-transparent';
            default: return 'from-gray-600/20 via-gray-500/10 to-transparent';
        }
    };

    const getRarityStars = (rarity: number) => {
        return Array.from({ length: rarity }, (_, i) => (
            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        ));
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <div className="mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <motion.div
                        className="relative flex-1 max-w-md"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search geniemon..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </motion.div>
                    <motion.div
                        className="w-full sm:w-48"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Select onValueChange={(value) => setSelectedElement(value as GeniemonElement | 'all')} defaultValue="all">
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by Element" />
                            </SelectTrigger>
                            <SelectContent>
                                {geniemonElements.map(element => (
                                    <SelectItem key={element} value={element} className="capitalize">{element}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </motion.div>
                </div>

                <motion.div
                    className="flex flex-wrap items-center gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex flex-wrap gap-2">
                        {geniemonElements.filter(e => e !== 'all').map((element) => (
                            <Badge
                                key={element}
                                variant={selectedElement === element ? 'default' : 'outline'}
                                className="cursor-pointer hover:bg-primary/80 transition-colors"
                                onClick={() => setSelectedElement(selectedElement === element ? 'all' : element as GeniemonElement)}
                            >
                                {element}
                                {selectedElement === element && <X className="ml-1 h-3 w-3" />}
                            </Badge>
                        ))}
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                        <Select value={rarityFilter} onValueChange={(value) => setRarityFilter(value as 'all' | '2' | '3' | '4' | '5')}>
                            <SelectTrigger className="w-32">
                                <Star className="h-4 w-4 mr-2" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Rarity</SelectItem>
                                <SelectItem value="5">5 Star</SelectItem>
                                <SelectItem value="4">4 Star</SelectItem>
                                <SelectItem value="3">3 Star</SelectItem>
                                <SelectItem value="2">2 Star</SelectItem>
                            </SelectContent>
                        </Select>

                        <motion.div
                            className="flex items-center gap-2 px-3 py-1.5 bg-card border rounded-md text-sm"
                            whileHover={{ scale: 1.05 }}
                        >
                            <TrendingUp className="h-4 w-4 text-primary" />
                            <span className="font-semibold">{filteredGeniemon.length}</span>
                            <span className="text-muted-foreground">items</span>
                        </motion.div>

                        <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'name' | 'element' | 'rarity')}>
                            <SelectTrigger className="w-32">
                                <SortAsc className="h-4 w-4 mr-2" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="name">Name</SelectItem>
                                <SelectItem value="element">Element</SelectItem>
                                <SelectItem value="rarity">Rarity</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </motion.div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={`${selectedElement}-${searchQuery}-${rarityFilter}-${sortBy}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {filteredGeniemon.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredGeniemon.map((geniemon, index) => {
                                const getElementColor = (element: string) => {
                                    switch (element) {
                                        case 'Pyro': return { text: 'text-red-400', glow: 'shadow-red-500/20', border: 'border-red-500/30' };
                                        case 'Hydro': return { text: 'text-blue-400', glow: 'shadow-blue-500/20', border: 'border-blue-500/30' };
                                        case 'Electro': return { text: 'text-purple-400', glow: 'shadow-purple-500/20', border: 'border-purple-500/30' };
                                        case 'Anemo': return { text: 'text-cyan-400', glow: 'shadow-cyan-500/20', border: 'border-cyan-500/30' };
                                        case 'Umbro': return { text: 'text-indigo-400', glow: 'shadow-indigo-500/20', border: 'border-indigo-500/30' };
                                        case 'Lumino': return { text: 'text-yellow-400', glow: 'shadow-yellow-500/20', border: 'border-yellow-500/30' };
                                        default: return { text: 'text-gray-400', glow: 'shadow-gray-500/20', border: 'border-gray-500/30' };
                                    }
                                };

                                const elementTheme = getElementColor(geniemon.element);

                                return (
                                    <motion.div
                                        key={geniemon.id}
                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        transition={{
                                            delay: index * 0.05,
                                            type: "spring",
                                            stiffness: 100,
                                            damping: 15
                                        }}
                                        whileHover={{
                                            y: -8,
                                            transition: { duration: 0.2 }
                                        }}
                                    >
                                        <Card className={`
                                            group relative overflow-hidden 
                                            bg-gradient-to-br ${getRarityColor(geniemon.rarity)} 
                                            backdrop-blur-sm border-2 
                                            hover:border-primary/70 
                                            transition-all duration-500 
                                            hover:shadow-2xl ${elementTheme.glow}
                                            cursor-pointer
                                        `}>
                                            {/* Animated Background Glow */}
                                            <motion.div
                                                className={`absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent`}
                                                initial={{ x: '-100%' }}
                                                whileHover={{ x: '100%' }}
                                                transition={{ duration: 0.8, ease: "easeInOut" }}
                                            />

                                            {/* Rarity Badge with Pulse */}
                                            <motion.div
                                                className="absolute top-2 right-2 z-10"
                                                animate={{
                                                    scale: [1, 1.05, 1],
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: Infinity,
                                                    ease: "easeInOut"
                                                }}
                                            >
                                                <div className="flex gap-0.5 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full border border-white/20">
                                                    {getRarityStars(geniemon.rarity)}
                                                </div>
                                            </motion.div>

                                            {/* Header with Image and Name */}
                                            <div className="p-4 bg-black/30 border-b border-white/10 relative">
                                                <div className="flex items-center gap-4">
                                                    {/* Animated Image Container */}
                                                    <motion.div
                                                        className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-black/40 border-2 ${elementTheme.border}`}
                                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <Image
                                                            src={geniemon.image}
                                                            alt={geniemon.name}
                                                            fill
                                                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                        />
                                                        {/* Image Glow Overlay */}
                                                        <motion.div
                                                            className={`absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-primary/20`}
                                                            initial={{ opacity: 0 }}
                                                            whileHover={{ opacity: 1 }}
                                                            transition={{ duration: 0.3 }}
                                                        />
                                                    </motion.div>
                                                    <div className="flex-1">
                                                        <motion.h3
                                                            className="font-bold text-lg text-foreground mb-1 group-hover:text-primary transition-colors"
                                                            whileHover={{ x: 2 }}
                                                        >
                                                            {geniemon.name}
                                                        </motion.h3>
                                                        <div className="flex items-center gap-2">
                                                            <Badge
                                                                variant="outline"
                                                                className={`text-xs ${elementTheme.text} border-current transition-all group-hover:shadow-lg group-hover:shadow-current/20`}
                                                            >
                                                                {geniemon.element}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Effect Section with Animated Icon */}
                                            <div className="p-4 space-y-3 relative">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <motion.div
                                                            animate={{
                                                                rotate: [0, 10, -10, 0],
                                                                scale: [1, 1.1, 1],
                                                            }}
                                                            transition={{
                                                                duration: 2,
                                                                repeat: Infinity,
                                                                ease: "easeInOut",
                                                            }}
                                                        >
                                                            <Zap className="h-4 w-4 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                                        </motion.div>
                                                        <h4 className="text-sm font-bold text-blue-400 uppercase tracking-wide">Effect</h4>
                                                        {geniemon.activeSkill.cooldown !== '-' && (
                                                            <motion.span
                                                                className="ml-auto text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30"
                                                                whileHover={{ scale: 1.05 }}
                                                            >
                                                                CD: {geniemon.activeSkill.cooldown}
                                                            </motion.span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors">
                                                        {geniemon.activeSkill.description}
                                                    </p>
                                                </div>

                                                {/* Passive Section with Animated Icon */}
                                                <div className="pt-3 border-t border-white/10">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <motion.div
                                                            animate={{
                                                                rotate: [0, 180, 360],
                                                                scale: [1, 1.2, 1],
                                                            }}
                                                            transition={{
                                                                duration: 3,
                                                                repeat: Infinity,
                                                                ease: "easeInOut",
                                                            }}
                                                        >
                                                            <Sparkles className="h-4 w-4 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                                                        </motion.div>
                                                        <h4 className="text-sm font-bold text-purple-400 uppercase tracking-wide">Passive</h4>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors">
                                                        {geniemon.passiveSkill.description}
                                                    </p>
                                                </div>

                                                {/* Floating Particles Effect on Hover */}
                                                <motion.div
                                                    className="absolute inset-0 pointer-events-none"
                                                    initial={{ opacity: 0 }}
                                                    whileHover={{ opacity: 1 }}
                                                >
                                                    {[...Array(3)].map((_, i) => (
                                                        <motion.div
                                                            key={i}
                                                            className={`absolute w-1 h-1 ${elementTheme.text} rounded-full`}
                                                            style={{
                                                                left: `${20 + i * 30}%`,
                                                                top: '50%',
                                                            }}
                                                            animate={{
                                                                y: [-20, -40, -20],
                                                                opacity: [0, 1, 0],
                                                            }}
                                                            transition={{
                                                                duration: 2,
                                                                repeat: Infinity,
                                                                delay: i * 0.3,
                                                            }}
                                                        />
                                                    ))}
                                                </motion.div>
                                            </div>

                                            {/* Bottom Glow Line */}
                                            <motion.div
                                                className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent`}
                                                initial={{ scaleX: 0 }}
                                                whileHover={{ scaleX: 1 }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        <motion.div
                            className="text-center py-16"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <p className="text-muted-foreground text-lg">No geniemon found</p>
                            <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters</p>
                        </motion.div>
                    )}
                </motion.div>
            </AnimatePresence>
        </motion.div>
    )
}






const GeniemonTraitsTable = () => {
    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="rounded-xl border bg-card text-card-foreground shadow overflow-hidden"
        >
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="w-[100px]">Trait</TableHead>
                        <TableHead className="w-[120px]">Image</TableHead>
                        <TableHead className="text-blue-400 font-semibold">Blue Effect</TableHead>
                        <TableHead className="text-purple-400 font-semibold">Purple Effect</TableHead>
                        <TableHead className="text-yellow-500 font-semibold">Gold Effect</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {geniemonTraits.map((trait, index) => (
                        <motion.tr
                            key={trait.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group hover:bg-muted/50 transition-colors"
                        >
                            <TableCell className="font-medium">{trait.name}</TableCell>
                            <TableCell>
                                <div className="relative w-20 h-20 rounded-md overflow-hidden bg-muted">
                                    <Image
                                        src={trait.image}
                                        alt={trait.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </TableCell>
                            <TableCell className="text-blue-400 font-semibold group-hover:text-blue-300 transition-colors">{trait.blueEffect}</TableCell>
                            <TableCell className="text-purple-400 font-semibold group-hover:text-purple-300 transition-colors">{trait.purpleEffect}</TableCell>
                            <TableCell className="text-yellow-500 font-semibold group-hover:text-yellow-400 transition-colors">{trait.goldEffect}</TableCell>
                        </motion.tr>
                    ))}
                </TableBody>
            </Table>
        </motion.div>
    );
};

export default function CreateBuildPage() {

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Hero Section with Animation */}
            <motion.div
                className="text-center mb-12 relative"
                initial="hidden"
                animate="visible"
                variants={heroVariants}
            >
                {/* Floating particles background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        className="absolute top-10 left-1/4 w-2 h-2 bg-primary/30 rounded-full"
                        animate={{
                            y: [0, -20, 0],
                            opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                    <motion.div
                        className="absolute top-20 right-1/3 w-3 h-3 bg-blue-500/20 rounded-full"
                        animate={{
                            y: [0, -30, 0],
                            opacity: [0.2, 0.5, 0.2],
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: 0.5,
                        }}
                    />
                    <motion.div
                        className="absolute top-5 right-1/4 w-2 h-2 bg-purple-500/20 rounded-full"
                        animate={{
                            y: [0, -25, 0],
                            opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{
                            duration: 3.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: 1,
                        }}
                    />
                </div>

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <Sparkles className="w-8 h-8 mx-auto mb-4 text-primary animate-pulse" />
                </motion.div>

                <motion.h1
                    className="text-4xl md:text-5xl font-headline font-bold mb-4 bg-gradient-to-r from-primary via-blue-400 to-purple-400 bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    Choose An Item For A New Build
                </motion.h1>

                <motion.p
                    className="text-muted-foreground text-lg max-w-2xl mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                    Select your character, weapon, or geniemon to start crafting the perfect build
                </motion.p>
            </motion.div>

            {/* Tabs with enhanced styling */}
            <Tabs defaultValue="characters" className="w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                >
                    <TabsList className="mb-8 flex flex-wrap justify-center bg-card/50 backdrop-blur-sm p-2 rounded-xl border border-border/50">
                        <TabsTrigger
                            value="characters"
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 flex items-center gap-2"
                        >
                            <Users className="w-4 h-4" />
                            Characters
                        </TabsTrigger>
                        <TabsTrigger
                            value="weapons"
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 flex items-center gap-2"
                        >
                            <Sword className="w-4 h-4" />
                            Weapons
                        </TabsTrigger>
                        <TabsTrigger
                            value="geniemon"
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 flex items-center gap-2"
                        >
                            <Zap className="w-4 h-4" />
                            Geniemon
                        </TabsTrigger>
                        <TabsTrigger
                            value="geniemon-traits"
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 flex items-center gap-2"
                        >
                            <Sparkles className="w-4 h-4" />
                            Geniemon Traits
                        </TabsTrigger>
                    </TabsList>
                </motion.div>

                <AnimatePresence mode="wait">
                    <TabsContent value="characters" key="characters">
                        <CharacterGrid />
                    </TabsContent>

                    <TabsContent value="weapons" key="weapons">
                        <WeaponGrid />
                    </TabsContent>

                    <TabsContent value="geniemon" key="geniemon">
                        <GeniemonGrid />
                    </TabsContent>

                    <TabsContent value="geniemon-traits" key="geniemon-traits">
                        <GeniemonTraitsTable />
                    </TabsContent>
                </AnimatePresence>
            </Tabs>
        </div>
    );
}
