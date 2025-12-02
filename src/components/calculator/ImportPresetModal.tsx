'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface ImportPresetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (value: string) => boolean | Promise<boolean>;
}

export function ImportPresetModal({ isOpen, onClose, onSubmit }: ImportPresetModalProps) {
    const [shareValue, setShareValue] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShareValue('');
            setError(null);
            setIsSubmitting(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!shareValue.trim()) {
            setError('Please paste a share link or code.');
            return;
        }
        setIsSubmitting(true);
        const success = await onSubmit(shareValue.trim());
        setIsSubmitting(false);
        if (!success) {
            setError('That share link or code could not be decoded. Please double-check and try again.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
            <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#111118] p-6 shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-full p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
                    aria-label="Close import modal"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="space-y-4">
                    <div>
                        <h2 className="text-2xl font-semibold text-white">Import Shared Preset</h2>
                        <p className="text-sm text-white/60">
                            Paste a share link or code from another user to load their team configuration.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-white/50">
                            Share Link or Code
                        </label>
                        <textarea
                            value={shareValue}
                            onChange={(event) => {
                                setShareValue(event.target.value);
                                if (error) setError(null);
                            }}
                            className="h-32 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-white/40 focus:ring-1 focus:ring-white/40"
                            placeholder="https://mysite.com/damage-calculator?preset=..."
                        />
                        {error && <p className="text-sm text-red-400">{error}</p>}
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-white/70 transition hover:border-white/30 hover:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-5 py-2 text-sm font-semibold text-white transition hover:from-blue-600 hover:to-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isSubmitting ? 'Importing...' : 'Import Preset'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

