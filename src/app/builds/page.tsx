'use client';

import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import BuildCard from '@/components/build-card';
import type { Build } from '@/lib/types';
import { Search, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { allCharacters, allWeapons } from '@/lib/data';
import { getAllBuilds } from '@/lib/firestore';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
        },
    },
};

export default function BuildsPage() {
    const [builds, setBuilds] = useState<Build[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');
    const [filterElement, setFilterElement] = useState<string>('all');
    const [filterWeaponType, setFilterWeaponType] = useState<string>('all');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        // Load all public builds from Firestore
        const loadBuilds = async () => {
            try {
                const publicBuilds = await getAllBuilds('public');
                setBuilds(publicBuilds);
            } catch (error) {
                console.error('Error loading builds:', error);
            }
        };
        loadBuilds();
    }, []);

    const filteredAndSortedBuilds = useMemo(() => {
        let result = [...builds];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(
                (build) =>
                    build.buildName.toLowerCase().includes(query) ||
                    build.creator?.toLowerCase().includes(query) ||
                    build.itemName.toLowerCase().includes(query)
            );
        }

        // Element filter
        if (filterElement !== 'all') {
            result = result.filter((build) => {
                const character = allCharacters.find((c) => c.id === build.itemId);
                return character?.element === filterElement;
            });
        }

        // Weapon type filter
        if (filterWeaponType !== 'all') {
            result = result.filter((build) => {
                const weapon = allWeapons.find((w) => w.id === build.itemId);
                return weapon?.type === filterWeaponType;
            });
        }

        // Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'oldest':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'popular':
                    return (b.voteCount || 0) - (a.voteCount || 0);
                default:
                    return 0;
            }
        });

        return result;
    }, [builds, searchQuery, sortBy, filterElement, filterWeaponType]);

    const handleBuildDeleted = (buildId: string) => {
        setBuilds((prevBuilds) => prevBuilds.filter((b) => b.id !== buildId));
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-headline font-bold mb-2">Community Builds</h1>
                <p className="text-muted-foreground">Discover and explore builds created by the community</p>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4 mb-8">
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search builds, creators, characters..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                        Filters
                    </Button>
                </div>

                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-card/50"
                    >
                        <div>
                            <label className="text-sm font-medium mb-2 block">Sort By</label>
                            <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Newest First</SelectItem>
                                    <SelectItem value="oldest">Oldest First</SelectItem>
                                    <SelectItem value="popular">Most Popular</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Element</label>
                            <Select value={filterElement} onValueChange={setFilterElement}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Elements</SelectItem>
                                    <SelectItem value="Lumino">Lumino</SelectItem>
                                    <SelectItem value="Anemo">Anemo</SelectItem>
                                    <SelectItem value="Hydro">Hydro</SelectItem>
                                    <SelectItem value="Pyro">Pyro</SelectItem>
                                    <SelectItem value="Electro">Electro</SelectItem>
                                    <SelectItem value="Umbro">Umbro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Weapon Type</label>
                            <Select value={filterWeaponType} onValueChange={setFilterWeaponType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Weapons</SelectItem>
                                    <SelectItem value="Sword">Sword</SelectItem>
                                    <SelectItem value="Greatsword">Greatsword</SelectItem>
                                    <SelectItem value="Dual Blades">Dual Blades</SelectItem>
                                    <SelectItem value="Katana">Katana</SelectItem>
                                    <SelectItem value="Polearm">Polearm</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </motion.div>
                )}

                {/* Results count */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Found <span className="font-semibold text-foreground">{filteredAndSortedBuilds.length}</span> builds
                    </p>
                    {(searchQuery || filterElement !== 'all' || filterWeaponType !== 'all') && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setSearchQuery('');
                                setFilterElement('all');
                                setFilterWeaponType('all');
                            }}
                        >
                            Clear Filters
                        </Button>
                    )}
                </div>
            </div>

            {/* Builds Grid */}
            {filteredAndSortedBuilds.length > 0 ? (
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {filteredAndSortedBuilds.map((build) => (
                        <BuildCard key={build.id} build={build} onDelete={handleBuildDeleted} />
                    ))}
                </motion.div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-muted-foreground text-lg">No builds found</p>
                    <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters or search query</p>
                </div>
            )}
        </div>
    );
}
