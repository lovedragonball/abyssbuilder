'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MultiSelectFilterProps<T extends string | number> {
    label: string;
    options: { value: T; label: string }[];
    selected: T[];
    onToggle: (value: T) => void;
    onClear: () => void;
}

export function MultiSelectFilter<T extends string | number>({
    label,
    options,
    selected,
    onToggle,
    onClear,
}: MultiSelectFilterProps<T>) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        'w-full justify-between',
                        selected.length > 0 && 'border-primary'
                    )}
                >
                    <span>
                        {selected.length === 0
                            ? label
                            : `${label} (${selected.length})`}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-0" align="start">
                <div className="p-2 space-y-1">
                    {selected.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-xs"
                            onClick={onClear}
                        >
                            <X className="mr-2 h-3 w-3" />
                            Clear all
                        </Button>
                    )}
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className="flex items-center space-x-2 p-2 hover:bg-accent rounded-sm cursor-pointer"
                            onClick={() => onToggle(option.value)}
                        >
                            <Checkbox
                                checked={selected.includes(option.value)}
                                onCheckedChange={() => onToggle(option.value)}
                            />
                            <label className="text-sm cursor-pointer flex-1">
                                {option.label}
                            </label>
                        </div>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
}
