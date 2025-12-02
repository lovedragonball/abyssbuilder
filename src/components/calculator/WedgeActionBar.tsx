'use client';

import { Eye, Link2, X } from 'lucide-react';

interface WedgeActionBarProps {
    onView?: () => void;
    onCopyLink?: () => void;
    onRemove?: () => void;
}

export function WedgeActionBar({ onView, onCopyLink, onRemove }: WedgeActionBarProps) {
    return (
        <div className="inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {onView && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onView();
                    }}
                    aria-label="View details"
                    title="View details"
                    className="w-6 h-6 rounded-full bg-blue-500 text-white shadow-md flex items-center justify-center hover:bg-blue-600 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-1 focus-visible:ring-offset-black/60"
                >
                    <Eye className="w-3 h-3" />
                </button>
            )}

            {onCopyLink && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onCopyLink();
                    }}
                    aria-label="Copy link"
                    title="Copy link"
                    className="w-6 h-6 rounded-full bg-purple-500 text-white shadow-md flex items-center justify-center hover:bg-purple-600 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-offset-1 focus-visible:ring-offset-black/60"
                >
                    <Link2 className="w-3 h-3" />
                </button>
            )}

            {onRemove && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                    }}
                    aria-label="Remove wedge"
                    title="Remove wedge"
                    className="w-6 h-6 rounded-full bg-red-500 text-white shadow-md flex items-center justify-center hover:bg-red-600 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:ring-offset-1 focus-visible:ring-offset-black/60"
                >
                    <X className="w-3 h-3" />
                </button>
            )}
        </div>
    );
}
