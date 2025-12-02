'use client';

import { useEffect, useRef, useState } from 'react';

interface LevelSliderPopoverProps {
    value: number;
    min: number;
    max: number;
    onChange: (value: number) => void;
    onClose: () => void;
    anchorElement: HTMLElement | null;
}

export default function LevelSliderPopover({ value, min, max, onChange, onClose, anchorElement }: LevelSliderPopoverProps) {
    const popoverRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (anchorElement && popoverRef.current) {
            const anchorRect = anchorElement.getBoundingClientRect();
            const popoverRect = popoverRef.current.getBoundingClientRect();

            let top = anchorRect.bottom + 8;
            let left = anchorRect.left + (anchorRect.width / 2) - (popoverRect.width / 2);

            // Adjust if popover goes off-screen
            if (left + popoverRect.width > window.innerWidth) {
                left = window.innerWidth - popoverRect.width - 8;
            }
            if (left < 8) {
                left = 8;
            }
            if (top + popoverRect.height > window.innerHeight) {
                top = anchorRect.top - popoverRect.height - 8;
            }

            setPosition({ top, left });
        }
    }, [anchorElement]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

    return (
        <div
            ref={popoverRef}
            className="fixed z-50 bg-[#1a1a1f] border border-purple-500/50 rounded-xl p-4 shadow-2xl min-w-[200px]"
            style={{ top: `${position.top}px`, left: `${position.left}px` }}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="space-y-3">
                <div className="text-center">
                    <div className="text-xs text-white/40 uppercase tracking-wider">Level</div>
                    <div className="text-2xl font-bold text-purple-400">+{value}</div>
                </div>

                <div className="space-y-2">
                    <input
                        type="range"
                        min={min}
                        max={max}
                        step={1}
                        value={value}
                        onChange={(e) => onChange(parseInt(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500 slider"
                        style={{
                            background: `linear-gradient(to right, rgb(168 85 247) 0%, rgb(168 85 247) ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) 100%)`
                        }}
                    />
                    <div className="flex justify-between text-[10px] text-white/40 font-mono">
                        <span>+{min}</span>
                        <span>+{max}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
