'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MultiSelectFilterProps {
    label: string;
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    getIconUrl?: (option: string) => string | null;
    showFallbackIcon?: boolean;
}

export function MultiSelectFilter({ label, options, selected, onChange, getIconUrl, showFallbackIcon = false }: MultiSelectFilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const toggleOption = (option: string) => {
        if (selected.includes(option)) {
            onChange(selected.filter(s => s !== option));
        } else {
            onChange([...selected, option]);
        }
    };

    const selectAll = () => onChange(options);
    const clearAll = () => onChange([]);

    return (
        <div className="relative" ref={containerRef}>
            <Button
                variant="outline"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full justify-between"
            >
                <span className="truncate">{selected.length > 0 ? `${label} (${selected.length})` : label}</span>
                <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0" />
            </Button>

            {isOpen && (
                <div className="absolute z-50 mt-2 w-full min-w-[200px] bg-background border rounded-md shadow-lg p-2 max-h-64 overflow-y-auto">
                    <div className="flex gap-2 mb-2">
                        <Button size="sm" variant="ghost" onClick={selectAll}>Select All</Button>
                        <Button size="sm" variant="ghost" onClick={clearAll}>Clear</Button>
                    </div>
                    {options.map(option => {
                        const iconUrl = getIconUrl?.(option);
                        return (
                            <label key={option} className="flex items-center gap-2 p-2 hover:bg-accent rounded cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selected.includes(option)}
                                    onChange={() => toggleOption(option)}
                                    className="h-4 w-4 flex-shrink-0"
                                />
                                {iconUrl ? (
                                    <img
                                        src={iconUrl}
                                        alt={option}
                                        className="w-6 h-6 object-contain flex-shrink-0"
                                    />
                                ) : showFallbackIcon ? (
                                    <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                                        <Circle className="w-5 h-5 text-muted-foreground" />
                                    </div>
                                ) : null}
                                <span className="text-sm whitespace-nowrap">{option}</span>
                            </label>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
