'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, Download, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
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
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Build {
    id: string;
    buildName: string;
    description?: string;
    itemName: string;
    itemImage: string;
    itemType: string;
    createdAt: string;
    updatedAt: string;
    mods?: (string | null)[];
    primeMod?: string | null;
    adjustedSlots?: number[];
    team?: (string | null)[];
    supportWeapons?: (string | null)[];
    supportMods?: Record<string, (string | null)[]>;
    supportAdjustedSlots?: Record<string, number[]>;
    consonanceWeapon?: string | null;
    [key: string]: any; // Allow additional properties
}

interface BuildValidation {
    buildName: string;
    issues: string[];
    warnings: string[];
    info: string[];
}

const DEFAULT_SUPPORT_ADJUSTED_SLOTS: Record<string, number[]> = {
    'support-char-0': [],
    'support-char-1': [],
    'support-wpn-0': [],
    'support-wpn-1': [],
    'consonance-wpn': [],
};

const normalizeSupportAdjustedSlots = (supportAdjustedSlots?: Record<string, number[]>): Record<string, number[]> => {
    if (supportAdjustedSlots && typeof supportAdjustedSlots === 'object') {
        const safeSlots = Object.entries(supportAdjustedSlots).reduce<Record<string, number[]>>((acc, [slotKey, slots]) => {
            acc[slotKey] = Array.isArray(slots) ? slots : [];
            return acc;
        }, { ...DEFAULT_SUPPORT_ADJUSTED_SLOTS });

        return safeSlots;
    }
    return { ...DEFAULT_SUPPORT_ADJUSTED_SLOTS };
};

const normalizeBuild = (build: Build): Build => {
    return {
        ...build,
        adjustedSlots: Array.isArray(build.adjustedSlots) ? build.adjustedSlots : [],
        supportAdjustedSlots: normalizeSupportAdjustedSlots(build.supportAdjustedSlots),
    };
};

export default function MyBuildsPage() {
    const [builds, setBuilds] = useState<Build[]>([]);
    const [selectedBuilds, setSelectedBuilds] = useState<Set<string>>(new Set());
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [exportDialogOpen, setExportDialogOpen] = useState(false);
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [exportedJson, setExportedJson] = useState('');
    const [importJson, setImportJson] = useState('');
    const [exportValidation, setExportValidation] = useState<BuildValidation[]>([]);
    const [importValidation, setImportValidation] = useState<BuildValidation[]>([]);
    const router = useRouter();
    const { toast } = useToast();

    useEffect(() => {
        loadBuilds();
    }, []);

    const loadBuilds = () => {
        const savedBuilds = JSON.parse(localStorage.getItem('builds') || '[]');
        const normalizedBuilds = savedBuilds.map((build: Build) => normalizeBuild(build));
        setBuilds(normalizedBuilds);
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

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedBuilds(new Set(builds.map(b => b.id)));
        } else {
            setSelectedBuilds(new Set());
        }
    };

    const handleSelectBuild = (buildId: string, checked: boolean) => {
        const newSelected = new Set(selectedBuilds);
        if (checked) {
            newSelected.add(buildId);
        } else {
            newSelected.delete(buildId);
        }
        setSelectedBuilds(newSelected);
    };

    const validateBuild = (build: Build): BuildValidation => {
        const issues: string[] = [];
        const warnings: string[] = [];
        const info: string[] = [];

        // Check required fields
        if (!build.buildName || build.buildName.trim() === '') {
            issues.push('ไม่มีชื่อ build');
        }
        if (!build.itemName) {
            issues.push('ไม่มีชื่อไอเทม');
        }

        // Check for empty or missing mod slots
        const modSlots = ['mod1', 'mod2', 'mod3', 'mod4', 'mod5', 'mod6', 'mod7', 'mod8'];
        const emptySlots: number[] = [];
        const filledSlots: number[] = [];

        modSlots.forEach((slot, index) => {
            if (!build[slot] || build[slot] === null || build[slot] === '') {
                emptySlots.push(index + 1);
            } else {
                filledSlots.push(index + 1);
            }
        });

        if (emptySlots.length > 0) {
            warnings.push(`ช่อง mod ว่าง: ${emptySlots.join(', ')} (${emptySlots.length}/8 ช่อง)`);
        }

        // Check weapon slots
        const weaponSlots = ['weapon1', 'weapon2', 'weapon3'];
        const emptyWeaponSlots: number[] = [];
        const filledWeaponSlots: number[] = [];

        weaponSlots.forEach((slot, index) => {
            if (!build[slot] || build[slot] === null || build[slot] === '') {
                emptyWeaponSlots.push(index + 1);
            } else {
                filledWeaponSlots.push(index + 1);
            }
        });

        if (emptyWeaponSlots.length > 0) {
            warnings.push(`ช่องอาวุธว่าง: ${emptyWeaponSlots.join(', ')} (${emptyWeaponSlots.length}/3 ช่อง)`);
        }

        // Check support mod
        if (!build.supportMod || build.supportMod === null || build.supportMod === '') {
            warnings.push('ไม่มี Support Mod');
        }

        // Info about filled slots
        if (filledSlots.length > 0) {
            info.push(`Mods ที่ใส่แล้ว: ${filledSlots.length}/8 ช่อง`);
        }
        if (filledWeaponSlots.length > 0) {
            info.push(`อาวุธที่ใส่แล้ว: ${filledWeaponSlots.length}/3 ช่อง`);
        }
        if (build.supportMod) {
            info.push(`Support Mod: ${build.supportMod}`);
        }
        if (build.description) {
            info.push('มีคำอธิบาย build');
        }

        // Check adjusted slots (Adjust Slot Track)
        if (build.adjustedSlots && Array.isArray(build.adjustedSlots) && build.adjustedSlots.length > 0) {
            info.push(`Adjust Slot Track: ${build.adjustedSlots.length} ช่อง (ช่อง ${build.adjustedSlots.map((s: number) => s + 1).join(', ')})`);
        }
        if (build.supportAdjustedSlots) {
            const adjustedSupport = Object.entries(build.supportAdjustedSlots)
                .filter(([, slots]) => Array.isArray(slots) && slots.length > 0);
            if (adjustedSupport.length > 0) {
                const supportInfo = adjustedSupport
                    .map(([slotKey, slots]) => `${slotKey}: ${slots.map((s) => s + 1).join(', ')}`)
                    .join(' | ');
                info.push(`Support Adjust Slot Track: ${supportInfo}`);
            }
        }

        return {
            buildName: build.buildName || 'Unnamed Build',
            issues,
            warnings,
            info
        };
    };

    const handleExport = () => {
        if (selectedBuilds.size === 0) {
            toast({
                title: 'ไม่ได้เลือก Build',
                description: 'กรุณาเลือกอย่างน้อย 1 build เพื่อ export',
                variant: 'destructive',
            });
            return;
        }

        const savedBuilds = JSON.parse(localStorage.getItem('builds') || '[]');
        const buildsToExport = savedBuilds
            .filter((b: Build) => selectedBuilds.has(b.id))
            .map((build: Build) => normalizeBuild(build));

        // Validate all builds
        const validations = buildsToExport.map((build: Build) => validateBuild(build));
        setExportValidation(validations);

        const jsonString = JSON.stringify(buildsToExport, null, 2);
        setExportedJson(jsonString);
        setExportDialogOpen(true);

        // Auto copy to clipboard
        navigator.clipboard.writeText(jsonString).then(() => {
            toast({
                title: 'Export สำเร็จ',
                description: `${buildsToExport.length} build(s) ถูก copy ไปที่ clipboard แล้ว`,
            });
        }).catch(() => {
            toast({
                title: 'Export เสร็จสิ้น',
                description: 'กรุณา copy JSON ด้วยตนเอง',
                variant: 'destructive',
            });
        });
    };

    const validateImportJson = () => {
        try {
            const parsedBuilds = JSON.parse(importJson);

            if (!Array.isArray(parsedBuilds)) {
                toast({
                    title: 'รูปแบบไม่ถูกต้อง',
                    description: 'JSON ต้องเป็น array ของ builds',
                    variant: 'destructive',
                });
                return;
            }

            // Validate all builds
            const normalizedBuilds = parsedBuilds.map((build: Build) => normalizeBuild(build));
            const validations = normalizedBuilds.map((build: Build) => validateBuild(build));
            setImportValidation(validations);

            toast({
                title: 'ตรวจสอบเสร็จสิ้น',
                description: `พบ ${parsedBuilds.length} builds - ตรวจสอบรายละเอียดด้านล่าง`,
            });
        } catch (error) {
            toast({
                title: 'JSON ไม่ถูกต้อง',
                description: 'กรุณาตรวจสอบรูปแบบ JSON',
                variant: 'destructive',
            });
            setImportValidation([]);
        }
    };

    const handleImport = () => {
        try {
            const parsedBuilds = JSON.parse(importJson);

            if (!Array.isArray(parsedBuilds)) {
                throw new Error('Invalid format: Expected an array of builds');
            }

            const normalizedBuilds = parsedBuilds.map((build: Build) => normalizeBuild(build));

            // Check for critical issues
            const criticalIssues = normalizedBuilds.filter((build: Build) => {
                const validation = validateBuild(build);
                return validation.issues.length > 0;
            });

            if (criticalIssues.length > 0) {
                toast({
                    title: 'พบปัญหาร้ายแรง',
                    description: `มี ${criticalIssues.length} builds ที่มีปัญหา - กรุณาตรวจสอบก่อน import`,
                    variant: 'destructive',
                });
                return;
            }

            localStorage.setItem('builds', JSON.stringify(normalizedBuilds));
            loadBuilds();
            setImportDialogOpen(false);
            setImportJson('');
            setImportValidation([]);

            toast({
                title: 'Import สำเร็จ',
                description: `${normalizedBuilds.length} build(s) ถูก import แล้ว`,
            });
        } catch (error) {
            toast({
                title: 'Import ล้มเหลว',
                description: 'รูปแบบ JSON ไม่ถูกต้อง กรุณาตรวจสอบข้อมูล',
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
                            disabled={selectedBuilds.size === 0}
                            className="gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Export Selected ({selectedBuilds.size})
                        </Button>
                    </div>
                </div>
            </div>

            {builds.length > 0 && (
                <div className="mb-4 flex items-center gap-2 p-4 bg-card/50 rounded-lg border">
                    <Checkbox
                        id="select-all"
                        checked={selectedBuilds.size === builds.length && builds.length > 0}
                        onCheckedChange={handleSelectAll}
                    />
                    <label
                        htmlFor="select-all"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                        Select All ({selectedBuilds.size}/{builds.length} selected)
                    </label>
                </div>
            )}

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
                        <Card
                            key={build.id}
                            className={`overflow-hidden transition-all ${selectedBuilds.has(build.id)
                                    ? 'border-primary ring-2 ring-primary/20'
                                    : 'hover:border-primary'
                                }`}
                        >
                            <div className="relative aspect-video">
                                <div className="absolute top-2 left-2 z-10">
                                    <Checkbox
                                        id={`build-${build.id}`}
                                        checked={selectedBuilds.has(build.id)}
                                        onCheckedChange={(checked) =>
                                            handleSelectBuild(build.id, checked as boolean)
                                        }
                                        className="bg-white/90 border-2"
                                    />
                                </div>
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
                <DialogContent className="max-w-4xl max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Export Selected Builds</DialogTitle>
                        <DialogDescription>
                            {selectedBuilds.size} build(s) ถูก copy ไปที่ clipboard อัตโนมัติแล้ว
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        {/* Validation Summary */}
                        {exportValidation.length > 0 && (
                            <div className="space-y-2">
                                <Label>รายละเอียด Builds</Label>
                                <ScrollArea className="h-[200px] rounded-md border p-4">
                                    {exportValidation.map((validation, index) => (
                                        <div key={index} className="mb-4 last:mb-0">
                                            <h4 className="font-semibold mb-2">{index + 1}. {validation.buildName}</h4>

                                            {validation.issues.length > 0 && (
                                                <Alert variant="destructive" className="mb-2">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <AlertTitle>ปัญหาร้ายแรง</AlertTitle>
                                                    <AlertDescription>
                                                        <ul className="list-disc list-inside text-sm">
                                                            {validation.issues.map((issue, i) => (
                                                                <li key={i}>{issue}</li>
                                                            ))}
                                                        </ul>
                                                    </AlertDescription>
                                                </Alert>
                                            )}

                                            {validation.warnings.length > 0 && (
                                                <Alert className="mb-2 border-yellow-500/50 bg-yellow-500/10">
                                                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                                                    <AlertTitle className="text-yellow-500">คำเตือน</AlertTitle>
                                                    <AlertDescription>
                                                        <ul className="list-disc list-inside text-sm">
                                                            {validation.warnings.map((warning, i) => (
                                                                <li key={i}>{warning}</li>
                                                            ))}
                                                        </ul>
                                                    </AlertDescription>
                                                </Alert>
                                            )}

                                            {validation.info.length > 0 && (
                                                <Alert className="mb-2 border-blue-500/50 bg-blue-500/10">
                                                    <Info className="h-4 w-4 text-blue-500" />
                                                    <AlertTitle className="text-blue-500">ข้อมูล</AlertTitle>
                                                    <AlertDescription>
                                                        <ul className="list-disc list-inside text-sm">
                                                            {validation.info.map((info, i) => (
                                                                <li key={i}>{info}</li>
                                                            ))}
                                                        </ul>
                                                    </AlertDescription>
                                                </Alert>
                                            )}

                                            {validation.issues.length === 0 && validation.warnings.length === 0 && (
                                                <Alert className="mb-2 border-green-500/50 bg-green-500/10">
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                    <AlertDescription className="text-green-500">
                                                        Build สมบูรณ์
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                        </div>
                                    ))}
                                </ScrollArea>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label>JSON Data</Label>
                            <Textarea
                                value={exportedJson}
                                readOnly
                                className="font-mono text-xs h-[250px]"
                                placeholder="Build data will appear here..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setExportDialogOpen(false)}>
                            ปิด
                        </Button>
                        <Button onClick={handleCopyExport}>
                            Copy to Clipboard
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Import Dialog */}
            <Dialog open={importDialogOpen} onOpenChange={(open) => {
                setImportDialogOpen(open);
                if (!open) {
                    setImportValidation([]);
                }
            }}>
                <DialogContent className="max-w-4xl max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Import Builds</DialogTitle>
                        <DialogDescription>
                            วาง JSON data ด้านล่าง - การ import จะแทนที่ builds ทั้งหมดที่มีอยู่
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>JSON Data</Label>
                            <Textarea
                                value={importJson}
                                onChange={(e) => {
                                    setImportJson(e.target.value);
                                    setImportValidation([]);
                                }}
                                className="font-mono text-xs h-[250px]"
                                placeholder='วาง JSON data ที่นี่...'
                            />
                        </div>

                        {/* Validation Button */}
                        <Button
                            onClick={validateImportJson}
                            disabled={!importJson.trim()}
                            variant="outline"
                            className="w-full"
                        >
                            <Info className="w-4 h-4 mr-2" />
                            ตรวจสอบ JSON ก่อน Import
                        </Button>

                        {/* Validation Results */}
                        {importValidation.length > 0 && (
                            <div className="space-y-2">
                                <Label>ผลการตรวจสอบ ({importValidation.length} builds)</Label>
                                <ScrollArea className="h-[200px] rounded-md border p-4">
                                    {importValidation.map((validation, index) => (
                                        <div key={index} className="mb-4 last:mb-0">
                                            <h4 className="font-semibold mb-2">{index + 1}. {validation.buildName}</h4>

                                            {validation.issues.length > 0 && (
                                                <Alert variant="destructive" className="mb-2">
                                                    <AlertCircle className="h-4 w-4" />
                                                    <AlertTitle>ปัญหาร้ายแรง</AlertTitle>
                                                    <AlertDescription>
                                                        <ul className="list-disc list-inside text-sm">
                                                            {validation.issues.map((issue, i) => (
                                                                <li key={i}>{issue}</li>
                                                            ))}
                                                        </ul>
                                                    </AlertDescription>
                                                </Alert>
                                            )}

                                            {validation.warnings.length > 0 && (
                                                <Alert className="mb-2 border-yellow-500/50 bg-yellow-500/10">
                                                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                                                    <AlertTitle className="text-yellow-500">คำเตือน</AlertTitle>
                                                    <AlertDescription>
                                                        <ul className="list-disc list-inside text-sm">
                                                            {validation.warnings.map((warning, i) => (
                                                                <li key={i}>{warning}</li>
                                                            ))}
                                                        </ul>
                                                    </AlertDescription>
                                                </Alert>
                                            )}

                                            {validation.info.length > 0 && (
                                                <Alert className="mb-2 border-blue-500/50 bg-blue-500/10">
                                                    <Info className="h-4 w-4 text-blue-500" />
                                                    <AlertTitle className="text-blue-500">ข้อมูล</AlertTitle>
                                                    <AlertDescription>
                                                        <ul className="list-disc list-inside text-sm">
                                                            {validation.info.map((info, i) => (
                                                                <li key={i}>{info}</li>
                                                            ))}
                                                        </ul>
                                                    </AlertDescription>
                                                </Alert>
                                            )}

                                            {validation.issues.length === 0 && validation.warnings.length === 0 && (
                                                <Alert className="mb-2 border-green-500/50 bg-green-500/10">
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                    <AlertDescription className="text-green-500">
                                                        Build สมบูรณ์
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                        </div>
                                    ))}
                                </ScrollArea>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setImportDialogOpen(false);
                            setImportJson('');
                            setImportValidation([]);
                        }}>
                            ยกเลิก
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
