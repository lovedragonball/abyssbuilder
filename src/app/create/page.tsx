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
import { Search, Sparkles, Sword, Users, Zap, Grid3x3, List, SortAsc, Star, TrendingUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';


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
        </motion.div>
    )
}

const GeniemonGrid = () => {
    const [selectedElement, setSelectedElement] = useState<GeniemonElement | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState<'name' | 'element'>('name');

    const filteredGeniemon = useMemo(() => {
        let filtered = allGeniemon;

        if (selectedElement !== 'all') {
            filtered = filtered.filter(g => g.element === selectedElement);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(g =>
                g.name.toLowerCase().includes(query)
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
                        <motion.div
                            className="flex items-center gap-2 px-3 py-1.5 bg-card border rounded-md text-sm"
                            whileHover={{ scale: 1.05 }}
                        >
                            <TrendingUp className="h-4 w-4 text-primary" />
                            <span className="font-semibold">{filteredGeniemon.length}</span>
                            <span className="text-muted-foreground">items</span>
                        </motion.div>

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
                    {filteredGeniemon.length > 0 ? (
                        viewMode === 'grid' ? (
                            <ItemGrid items={filteredGeniemon} type="geniemon" />
                        ) : (
                            <div className="space-y-2">
                                {filteredGeniemon.map((geniemon, index) => (
                                    <motion.div
                                        key={geniemon.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                    >
                                        <Link href={`/geniemon/${geniemon.id}`}>
                                            <Card className="p-4 hover:border-primary transition-all hover:shadow-lg group cursor-pointer">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                                        <Image
                                                            src={geniemon.image}
                                                            alt={geniemon.name}
                                                            fill
                                                            className="object-cover group-hover:scale-110 transition-transform"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                                                            {geniemon.name}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant="outline">{geniemon.element}</Badge>
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
