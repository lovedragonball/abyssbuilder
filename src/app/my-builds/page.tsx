'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Build {
    id: string;
    buildName: string;
    description?: string;
    itemName: string;
    itemImage: string;
    itemType: string;
    createdAt: string;
    updatedAt: string;
}

export default function MyBuildsPage() {
    const [builds, setBuilds] = useState<Build[]>([]);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        loadBuilds();
    }, []);

    const loadBuilds = () => {
        const savedBuilds = JSON.parse(localStorage.getItem('builds') || '[]');
        setBuilds(savedBuilds);
    };

    const handleDelete = (id: string) => {
        const savedBuilds = JSON.parse(localStorage.getItem('builds') || '[]');
        const updatedBuilds = savedBuilds.filter((b: Build) => b.id !== id);
        localStorage.setItem('builds', JSON.stringify(updatedBuilds));
        loadBuilds();
        setDeleteId(null);
        toast({
            title: 'Build Deleted',
            description: 'Your build has been removed.',
        });
    };

    const handleEdit = (build: Build) => {
        router.push(`/create/${build.itemType === 'character' ? build.itemName.toLowerCase().replace(/\s+/g, '-') : build.itemName.toLowerCase().replace(/\s+/g, '-')}?buildId=${build.id}`);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-headline font-bold mb-2">My Builds</h1>
                <p className="text-muted-foreground">Manage and edit your saved builds</p>
            </div>

            {builds.length === 0 ? (
                <Card className="bg-card/50">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <p className="text-muted-foreground text-lg mb-4">You don't have any saved builds yet</p>
                        <Button asChild>
                            <Link href="/create">Create Your First Build</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {builds.map((build) => (
                        <Card key={build.id} className="overflow-hidden hover:border-primary transition-colors">
                            <div className="relative aspect-video">
                                <Image
                                    src={build.itemImage}
                                    alt={build.itemName}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                                <div className="absolute bottom-2 left-2 right-2">
                                    <h3 className="text-white font-bold text-lg line-clamp-1">{build.buildName}</h3>
                                    <p className="text-white/80 text-sm">{build.itemName}</p>
                                </div>
                            </div>
                            <CardContent className="p-4">
                                {build.description && (
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                        {build.description}
                                    </p>
                                )}
                                <div className="text-xs text-muted-foreground mb-4">
                                    <p>Created: {new Date(build.createdAt).toLocaleDateString('en-US')}</p>
                                    <p>Last updated: {new Date(build.updatedAt).toLocaleDateString('en-US')}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => handleEdit(build)}
                                    >
                                        <Edit className="w-4 h-4 mr-1" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => setDeleteId(build.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this build? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
