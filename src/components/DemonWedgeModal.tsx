'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import type { DemonWedge } from '@/lib/demon-wedges-data';

interface DemonWedgeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    wedge: DemonWedge | null;
}

const rarityThemes = {
    2: {
        border: 'border-emerald-400/40',
        header: 'from-emerald-950 via-emerald-900 to-slate-950',
        accent: 'text-emerald-200',
        badge: 'bg-emerald-500/20 text-emerald-100',
        statBg: 'bg-emerald-500/10',
    },
    3: {
        border: 'border-sky-400/40',
        header: 'from-sky-950 via-blue-900 to-slate-950',
        accent: 'text-sky-100',
        badge: 'bg-sky-500/20 text-sky-100',
        statBg: 'bg-sky-500/10',
    },
    4: {
        border: 'border-violet-400/50',
        header: 'from-violet-950 via-purple-900 to-slate-950',
        accent: 'text-violet-100',
        badge: 'bg-violet-500/20 text-violet-100',
        statBg: 'bg-violet-500/10',
    },
    5: {
        border: 'border-amber-400/60',
        header: 'from-amber-950 via-yellow-900 to-slate-950',
        accent: 'text-amber-100',
        badge: 'bg-amber-500/20 text-amber-100',
        statBg: 'bg-amber-500/10',
    }
};

const elementIconMap = {
    Pyro: 'https://dna.interknot-network.com/images/elements/pyro.webp',
    Hydro: 'https://dna.interknot-network.com/images/elements/hydro.webp',
    Electro: 'https://dna.interknot-network.com/images/elements/electro.webp',
    Lumino: 'https://dna.interknot-network.com/images/elements/lumino.webp',
    Anemo: 'https://dna.interknot-network.com/images/elements/anemo.webp',
    Umbro: 'https://dna.interknot-network.com/images/elements/umbro.webp'
};

const polarityMap = {
    Circle: 1,
    Diamond: 2,
    Moon: 3,
    Rhombus: 4
};

export function DemonWedgeModal({ open, onOpenChange, wedge }: DemonWedgeModalProps) {
    const [selectedPreviewIndex, setSelectedPreviewIndex] = useState(0);

    if (!wedge) return null;

    const theme = rarityThemes[wedge.rarity as keyof typeof rarityThemes] ?? {
        border: 'border-white/10',
        header: 'from-slate-900 via-slate-800 to-black',
        accent: 'text-white',
        badge: 'bg-white/10 text-white',
        statBg: 'bg-white/5',
    };

    const stars = Array.from({ length: wedge.rarity }).map((_, i) => (
        <span key={i} className={`${theme.accent} text-xs`}>◆</span>
    ));

    // Get all images: main image + preview images
    const allImages = wedge.preview && wedge.preview.length > 0
        ? [wedge.image, ...wedge.preview]
        : [wedge.image];

    const currentImage = allImages[selectedPreviewIndex] || wedge.image;

    const handlePrevious = () => {
        setSelectedPreviewIndex((prev) =>
            prev === 0 ? allImages.length - 1 : prev - 1
        );
    };

    const handleNext = () => {
        setSelectedPreviewIndex((prev) =>
            prev === allImages.length - 1 ? 0 : prev + 1
        );
    };

    const polarityIcon = wedge.type !== 'Normal' ? polarityMap[wedge.type as keyof typeof polarityMap] : undefined;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl w-full max-h-[90vh] p-0 gap-0 overflow-hidden">
                <VisuallyHidden>
                    <h2>{wedge.fullName}</h2>
                </VisuallyHidden>

                <div className="flex flex-col h-full">
                    {/* Header with gradient */}
                    <div className={`relative bg-gradient-to-r ${theme.header} p-6`}>
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_#ffffff30,_transparent_60%)]" />
                        <div className="relative flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex gap-0.5">{stars}</div>
                                    <span className="text-xs uppercase tracking-wide text-white/60">Amplification</span>
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">{wedge.fullName}</h2>
                                <div className="flex items-center gap-4">
                                    {wedge.element && (
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={elementIconMap[wedge.element]}
                                                alt={wedge.element}
                                                className="w-6 h-6 object-contain"
                                            />
                                            <span className="text-sm text-white/80">{wedge.element}</span>
                                        </div>
                                    )}
                                    {polarityIcon && (
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={`https://dna.interknot-network.com/images/polarities/${polarityIcon}.webp`}
                                                alt={wedge.type}
                                                className="w-6 h-6 object-contain"
                                            />
                                            <span className="text-sm text-white/80">{wedge.type}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => onOpenChange(false)}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                                aria-label="Close"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0c0c0f]">
                        {/* Image Preview Section */}
                        <div className="relative">
                            <div className="relative w-full aspect-square max-w-md mx-auto bg-black/40 rounded-2xl overflow-hidden border-2 border-white/10">
                                <Image
                                    src={currentImage}
                                    alt={wedge.fullName}
                                    fill
                                    className="object-contain p-4"
                                    unoptimized
                                />
                            </div>

                            {/* Navigation arrows (only show if multiple images) */}
                            {allImages.length > 1 && (
                                <>
                                    <button
                                        onClick={handlePrevious}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 transition-colors z-10"
                                        aria-label="Previous image"
                                    >
                                        <ChevronLeft className="w-6 h-6 text-white" />
                                    </button>
                                    <button
                                        onClick={handleNext}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 transition-colors z-10"
                                        aria-label="Next image"
                                    >
                                        <ChevronRight className="w-6 h-6 text-white" />
                                    </button>
                                </>
                            )}

                            {/* Image indicators */}
                            {allImages.length > 1 && (
                                <div className="flex justify-center gap-2 mt-4">
                                    {allImages.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedPreviewIndex(index)}
                                            className={`w-2 h-2 rounded-full transition-all ${index === selectedPreviewIndex
                                                ? 'bg-white w-8'
                                                : 'bg-white/30 hover:bg-white/50'
                                                }`}
                                            aria-label={`Go to image ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Stats Section */}
                        <div className={`${theme.statBg} rounded-xl p-4 space-y-3`}>
                            <h3 className="font-semibold text-lg text-white mb-3">Attributes</h3>
                            {wedge.stats.length > 0 ? (
                                <div className="space-y-2">
                                    {wedge.stats.map((stat, i) => (
                                        <div key={i} className="flex items-center justify-between text-sm">
                                            <span className="text-white/70">{stat.name}</span>
                                            <span className="font-semibold text-white">{stat.value}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-white/60">No numerical attributes.</p>
                            )}
                        </div>

                        {/* Description */}
                        {wedge.description && (
                            <div className="space-y-2">
                                <h3 className="font-semibold text-lg text-white">Effect</h3>
                                <p className="text-sm text-white/80 leading-relaxed">{wedge.description}</p>
                            </div>
                        )}

                        {/* Additional Info */}
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-white/60 mb-1">Tolerance</p>
                                <p className={`text-xl font-semibold ${theme.accent}`}>{wedge.tolerance}</p>
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wide text-white/60 mb-1">Track</p>
                                <div className="flex items-center gap-2">
                                    {polarityIcon ? (
                                        <img
                                            src={`https://dna.interknot-network.com/images/polarities/${polarityIcon}.webp`}
                                            alt={wedge.type}
                                            className="w-6 h-6 object-contain"
                                        />
                                    ) : (
                                        <span className={`text-xl font-semibold ${theme.accent}`}>—</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Tags */}
                        {wedge.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
                                {wedge.tags.map((tag, i) => (
                                    <span
                                        key={i}
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${theme.badge}`}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

