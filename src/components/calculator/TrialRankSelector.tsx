'use client';

import { useState, useRef, useEffect } from 'react';
import { Shield, ChevronDown } from 'lucide-react';
import trialRanks from '@/lib/trial-rank.json';

interface TrialRankSelectorProps {
    selectedRankLevel: number | null;
    onChange: (rankLevel: number | null) => void;
    className?: string;
}

export function TrialRankSelector({ selectedRankLevel, onChange, className = '' }: TrialRankSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedRank = trialRanks.find(r => r.level === selectedRankLevel);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${selectedRank
                        ? 'bg-amber-500/10 border-amber-500/50 text-amber-400'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                    }`}
            >
                <Shield className="w-4 h-4" />
                <span className="text-xs font-bold">
                    {selectedRank ? selectedRank.rank : 'Trial Rank'}
                </span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 max-h-80 overflow-y-auto bg-[#1a1a1f] border border-white/20 rounded-xl shadow-2xl z-50 p-2">
                    <div className="text-xs font-semibold text-white/40 px-2 py-1 mb-1 uppercase tracking-wider">
                        Select Trial Rank
                    </div>

                    <button
                        onClick={() => {
                            onChange(null);
                            setIsOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors mb-1 ${selectedRankLevel === null
                                ? 'bg-white/10 text-white'
                                : 'text-white/60 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        None
                    </button>

                    {trialRanks.map((rank) => (
                        <button
                            key={rank.level}
                            onClick={() => {
                                onChange(rank.level);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors mb-1 group ${selectedRankLevel === rank.level
                                    ? 'bg-amber-500/20 text-amber-400'
                                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-sm">{rank.rank}</span>
                                {selectedRankLevel === rank.level && <Shield className="w-3 h-3" />}
                            </div>
                            <div className="text-[10px] text-white/40 mt-0.5 group-hover:text-white/60">
                                {rank.description}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
