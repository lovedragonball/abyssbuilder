'use client';

import { useParams, notFound } from 'next/navigation';
import { allGeniemon } from '@/lib/geniemon-data';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function GeniemonDetailPage() {
    const params = useParams();
    const { id } = params;
    
    const geniemon = allGeniemon.find((g) => g.id === id);

    if (!geniemon) {
        notFound();
    }

    const getRarityColor = (rarity: number) => {
        switch (rarity) {
            case 5: return 'text-yellow-400';
            case 4: return 'text-purple-400';
            case 3: return 'text-blue-400';
            case 2: return 'text-green-400';
            default: return 'text-gray-400';
        }
    };

    const getElementColor = (element: string) => {
        switch (element) {
            case 'Lumino': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
            case 'Anemo': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50';
            case 'Hydro': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
            case 'Pyro': return 'bg-red-500/20 text-red-400 border-red-500/50';
            case 'Electro': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
            case 'Umbro': return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
            case 'Neutral': return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <Button asChild variant="ghost" className="mb-4">
                <Link href="/create">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Create
                </Link>
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column - Image */}
                <div className="md:col-span-1">
                    <Card className="overflow-hidden">
                        <div className="relative aspect-square">
                            <Image
                                src={geniemon.image}
                                alt={geniemon.name}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <h1 className="text-2xl font-headline font-bold">{geniemon.name}</h1>
                                <div className={`flex ${getRarityColor(geniemon.rarity)}`}>
                                    {[...Array(geniemon.rarity)].map((_, i) => (
                                        <Star key={i} className="h-5 w-5 fill-current" />
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Badge className={getElementColor(geniemon.element)}>
                                    {geniemon.element}
                                </Badge>
                                <Badge variant={geniemon.status === 'Active' ? 'default' : 'secondary'}>
                                    {geniemon.status}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Details */}
                <div className="md:col-span-2 space-y-6">
                    {/* Lore */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Description</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground leading-relaxed">{geniemon.lore}</p>
                        </CardContent>
                    </Card>

                    {/* Active Skill */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Active Skill (Lv. {geniemon.activeSkill.level})</span>
                                {geniemon.activeSkill.cooldown !== '-' && (
                                    <Badge variant="outline">Cooldown: {geniemon.activeSkill.cooldown}</Badge>
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground leading-relaxed">
                                {geniemon.activeSkill.description}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Passive Skill */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Passive Skill (Lv. {geniemon.passiveSkill.level})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground leading-relaxed">
                                {geniemon.passiveSkill.description}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Smelt & Location */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Smelt</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground whitespace-pre-line">
                                    {geniemon.smelt}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Location</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{geniemon.location}</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
