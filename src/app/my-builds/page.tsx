'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, Eye, Download, Upload } from 'lucide-react';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

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
    const [exportDialogOpen, setExportDialogOpen] = useState(false);
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [exportedJson, setExportedJson] = useState('');
    const [importJson, setImportJson] = useState('');
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

    const handleExport = () => {
        const savedBuilds = JSON.parse(localStorage.getItem('builds') || '[]');
        const jsonString = JSON.stringify(savedBuilds, null, 2);
        setExportedJson(jsonString);
        setExportDialogOpen(true);

        // Auto copy to clipboard
        navigator.clipboard.writeText(jsonString).then(() => {
            toast({
                title: 'Exported Successfully',
                description: 'Build data has been copied to clipboard!',
            });
        }).catch(() => {
            toast({
                title: 'Export Complete',
                description: 'Please copy the JSON manually.',
                variant: 'destructive',
            });
        });
    };

    const handleImport = () => {
        try {
            const parsedBuilds = JSON.parse(importJson);

            if (!Array.isArray(parsedBuilds)) {
                throw new Error('Invalid format: Expected an array of builds');
            }

            localStorage.setItem('builds', JSON.stringify(parsedBuilds));
            loadBuilds();
            setImportDialogOpen(false);
            setImportJson('');

            toast({
                title: 'Import Successful',
                description: `${parsedBuilds.length} build(s) have been imported.`,
            });
        } catch (error) {
            toast({
                title: 'Import Failed',
                description: 'Invalid JSON format. Please check your data.',
                variant: 'destructive',
            });
        }
    };

    const handleCopyExport = () => {
        navigator.clipboard.writeText(exportedJson).then(() => {
            toast({
                title: 'Copied!',
                description: 'JSON data copied to clipboard.',
            });
        });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-headline font-bold mb-2">My Builds</h1>
                <div className="flex items-center justify-between">
                    <p className="text-muted-foreground">Manage and edit your saved builds</p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setImportDialogOpen(true)}
                            className="gap-2"
                        >
                            <Upload className="w-4 h-4" />
                            Import Build
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleExport}
                            disabled={builds.length === 0}
                            className="gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Export Build
                        </Button>
                    </div>
                </div>
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

            {/* Export Dialog */}
            <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Export Builds</DialogTitle>
                        <DialogDescription>
                            Your build data has been automatically copied to clipboard. You can also copy it manually below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>JSON Data</Label>
                            <Textarea
                                value={exportedJson}
                                readOnly
                                className="font-mono text-xs h-[400px]"
                                placeholder="Build data will appear here..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
                            Close
                        </Button>
                        <Button onClick={handleCopyExport}>
                            Copy to Clipboard
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Import Dialog */}
            <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Import Builds</DialogTitle>
                        <DialogDescription>
                            Paste your exported JSON data below. This will replace all existing builds.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>JSON Data</Label>
                            <Textarea
                                value={importJson}
                                onChange={(e) => setImportJson(e.target.value)}
                                className="font-mono text-xs h-[400px]"
                                placeholder='Paste your JSON data here...'
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setImportDialogOpen(false);
                            setImportJson('');
                        }}>
                            Cancel
                        </Button>
                        <Button onClick={handleImport} disabled={!importJson.trim()}>
                            Import
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
