'use client';

import { useState, useRef } from 'react';
import { Minus, Plus } from 'lucide-react';
import LevelSliderPopover from './LevelSliderPopover';

interface LevelStepperProps {
    value: number;
    min?: number;
    max?: number;
    onChange: (value: number) => void;
    className?: string;
}

export function LevelStepper({ value, min = 5, max = 10, onChange, className = '' }: LevelStepperProps) {
    const [isSliderOpen, setIsSliderOpen] = useState(false);
    const labelRef = useRef<HTMLButtonElement>(null);

    const handleDecrement = () => {
        if (value > min) {
            onChange(value - 1);
        }
    };

    const handleIncrement = () => {
        if (value < max) {
            onChange(value + 1);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            handleDecrement();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            handleIncrement();
        }
    };

    const handleLabelClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsSliderOpen(true);
    };

    return (
        <>
            <div
                className={`inline-flex items-center gap-1 bg-black/60 backdrop-blur-sm border border-purple-500/40 rounded-lg p-0.5 ${className}`}
                onKeyDown={handleKeyDown}
            >
                <button
                    onClick={(e) => { e.stopPropagation(); handleDecrement(); }}
                    disabled={value <= min}
                    aria-label="Decrease level"
                    className="p-1 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all group"
                >
                    <Minus className="w-3 h-3 text-white group-hover:text-purple-300" />
                </button>

                <button
                    ref={labelRef}
                    onClick={handleLabelClick}
                    aria-label={`Current level: +${value}. Click to open slider`}
                    className="px-2 py-0.5 min-w-[32px] text-xs font-bold text-white hover:text-purple-300 transition-colors cursor-pointer"
                >
                    +{value}
                </button>

                <button
                    onClick={(e) => { e.stopPropagation(); handleIncrement(); }}
                    disabled={value >= max}
                    aria-label="Increase level"
                    className="p-1 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all group"
                >
                    <Plus className="w-3 h-3 text-white group-hover:text-purple-300" />
                </button>
            </div>

            {isSliderOpen && (
                <LevelSliderPopover
                    value={value}
                    min={min}
                    max={max}
                    onChange={onChange}
                    onClose={() => setIsSliderOpen(false)}
                    anchorElement={labelRef.current}
                />
            )}
        </>
    );
}
