'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import type { DemonWedge } from '@/lib/demon-wedges-data';

interface DemonWedgeCardProps {
    wedge: DemonWedge;
    onClick?: () => void;
    level?: number;
    onLevelChange?: (level: number) => void;
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

const polarityMap = {
    Circle: 1,
    Diamond: 2,
    Moon: 3,
    Rhombus: 4
};

const elementIconMap = {
    Pyro: 'https://dna.interknot-network.com/images/elements/pyro.webp',
    Hydro: 'https://dna.interknot-network.com/images/elements/hydro.webp',
    Electro: 'https://dna.interknot-network.com/images/elements/electro.webp',
    Lumino: 'https://dna.interknot-network.com/images/elements/lumino.webp',
    Anemo: 'https://dna.interknot-network.com/images/elements/anemo.webp',
    Umbro: 'https://dna.interknot-network.com/images/elements/umbro.webp'
};

export function DemonWedgeCard({ wedge, onClick, level: controlledLevel, onLevelChange }: DemonWedgeCardProps) {
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

    const levelOptions = useMemo(() => {
        if (wedge.levels?.length) {
            return [...wedge.levels].sort((a, b) => a.level - b.level);
        }
        return [{
            level: 0,
            tolerance: wedge.tolerance,
            stats: wedge.stats,
            description: wedge.description
        }];
    }, [wedge.levels, wedge.tolerance, wedge.stats, wedge.description]);

    const [internalLevel, setInternalLevel] = useState(levelOptions[0]?.level ?? 0);

    const selectedLevel = controlledLevel !== undefined ? controlledLevel : internalLevel;

    const handleLevelChange = (newLevel: number) => {
        if (onLevelChange) {
            onLevelChange(newLevel);
        } else {
            setInternalLevel(newLevel);
        }
    };

    useEffect(() => {
        // If controlled level becomes undefined, reset to default? 
        // Or just sync internal state when props change if needed.
        // For now, if controlledLevel is undefined, we rely on internalLevel which defaults to 0.
    }, [controlledLevel]);

    const currentLevel = levelOptions.find(l => l.level === selectedLevel) ?? levelOptions[0];
    const displayedStats = currentLevel?.stats?.length ? currentLevel.stats : wedge.stats;
    const displayedTolerance = currentLevel?.tolerance ?? wedge.tolerance;
    const displayedDescription = currentLevel?.description ?? wedge.description;
    const levelButtons = levelOptions.map(l => l.level);

    const polarityIcon = wedge.type !== 'Normal' ? polarityMap[wedge.type as keyof typeof polarityMap] : undefined;

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={onClick}
            className={`border rounded-2xl overflow-hidden bg-[#0c0c0f]/80 backdrop-blur-sm cursor-pointer transition-colors hover:border-white/40 ${theme.border}`}
        >
            <div className={`relative h-32 bg-gradient-to-r ${theme.header}`}>
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_#ffffff30,_transparent_60%)]" />
                <div className="relative flex items-start justify-between p-3">
                    <div className="space-y-2">
                        <div className="w-10 h-10 bg-black/40 rounded-full p-1.5 backdrop-blur flex items-center justify-center">
                            {wedge.elementIcon ? (
                                <img
                                    src={wedge.elementIcon}
                                    alt={wedge.element || 'Element'}
                                    className="w-full h-full object-contain"
                                />
                            ) : wedge.element && elementIconMap[wedge.element as keyof typeof elementIconMap] ? (
                                <img
                                    src={elementIconMap[wedge.element as keyof typeof elementIconMap]}
                                    alt={wedge.element}
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <span className="text-white/20 text-xs">—</span>
                            )}
                        </div>
                        <div className="w-8 h-8 bg-black/40 rounded-full p-1 backdrop-blur flex items-center justify-center">
                            {wedge.trackIcon ? (
                                <img
                                    src={wedge.trackIcon}
                                    alt="Track Polarity"
                                    className="w-full h-full object-contain"
                                />
                            ) : polarityIcon ? (
                                <img
                                    src={`https://dna.interknot-network.com/images/polarities/${polarityIcon}.webp`}
                                    alt={wedge.type}
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <span className="text-white/20 text-xs">—</span>
                            )}
                        </div>
                    </div>
                    <div className="relative w-24 h-24 -mr-4 -mt-4 group">
                        <Image
                            src={wedge.image}
                            alt={wedge.fullName}
                            fill
                            className="object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)]"
                            unoptimized
                        />
                    </div>
                </div>
            </div>
            <div className="p-4 space-y-3">
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-white/60">
                        <span>{wedge.usage || 'Amplification'}</span>
                        <span className="flex gap-0.5">{stars}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {levelButtons.map(level => (
                            <button
                                key={level}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleLevelChange(level);
                                }}
                                className={`px-2 py-0.5 rounded-full text-xs font-semibold transition ${level === selectedLevel
                                    ? 'bg-white text-black'
                                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                                    }`}
                            >
                                +{level + 5}
                            </button>
                        ))}
                    </div>
                </div>
                <h3 className="font-semibold text-xs leading-tight whitespace-nowrap">{wedge.fullName}</h3>
                {displayedStats.length > 0 && (
                    <div className={`${theme.statBg} rounded-xl p-3 space-y-2`}>
                        {displayedStats.map((stat, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                                <span className="text-white/70">{stat.name}</span>
                                <span className="font-semibold text-white">{stat.value}</span>
                            </div>
                        ))}
                    </div>
                )}
                {displayedDescription && (
                    <p className="text-xs text-white/60 leading-relaxed">{displayedDescription}</p>
                )}
            </div>
            <div className="grid grid-cols-2 border-t border-white/10 text-xs">
                <div className="p-3 border-r border-white/10">
                    <p className="uppercase tracking-wide text-[10px] text-white/60">Tolerance</p>
                    <p className={`text-sm font-semibold mt-1 ${theme.accent}`}>{displayedTolerance}</p>
                </div>
                <div className="p-3">
                    <p className="uppercase tracking-wide text-[10px] text-white/60">Track</p>
                    <div className="flex items-center gap-2 mt-1">
                        {wedge.trackIcon ? (
                            <img
                                src={wedge.trackIcon}
                                alt="Track Polarity"
                                className="w-5 h-5 object-contain"
                            />
                        ) : wedge.type !== 'Normal' && polarityMap[wedge.type as keyof typeof polarityMap] ? (
                            <img
                                src={`https://dna.interknot-network.com/images/polarities/${polarityMap[wedge.type as keyof typeof polarityMap]}.webp`}
                                alt={wedge.type}
                                className="w-5 h-5 object-contain"
                            />
                        ) : (
                            <span className={`text-sm font-semibold ${theme.accent}`}>—</span>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
