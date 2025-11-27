import { Info } from 'lucide-react';

interface StatInputProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    tooltip?: string;
    suffix?: string;
}

export function StatInput({ label, value, onChange, tooltip, suffix }: StatInputProps) {
    return (
        <div className="space-y-1.5">
            <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-white/80">{label}</label>
                {tooltip && (
                    <div className="group relative">
                        <Info className="w-3.5 h-3.5 text-white/40 cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-black/90 border border-white/10 rounded text-xs text-white/80 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                            {tooltip}
                        </div>
                    </div>
                )}
            </div>
            <div className="relative">
                <input
                    type="number"
                    value={value || ''}
                    onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
                    placeholder="0"
                />
                {suffix && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40 font-medium">
                        {suffix}
                    </span>
                )}
            </div>
        </div>
    );
}
