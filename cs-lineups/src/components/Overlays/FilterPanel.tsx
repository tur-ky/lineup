import React from 'react';
import { EyeOff } from 'lucide-react';

interface FilterPanelProps {
    filters: {
        side: { t: boolean; ct: boolean };
        utility: { smoke: boolean; flash: boolean; molotov: boolean; he: boolean };
    };
    toggleSide: (side: 't' | 'ct') => void;
    toggleUtility: (type: 'smoke' | 'flash' | 'molotov' | 'he') => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, toggleSide, toggleUtility }) => {
    return (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 panel p-2 flex gap-4 shadow-xl z-20 animate-in fade-in slide-in-from-top-4 duration-500">
            {/* Side Filters */}
            <div className="flex gap-1 border-r border-glass-border pr-4 items-center">
                <FilterButton
                    active={filters.side.t}
                    onClick={() => toggleSide('t')}
                    label="T"
                    color="bg-yellow-600"
                />
                <FilterButton
                    active={filters.side.ct}
                    onClick={() => toggleSide('ct')}
                    label="CT"
                    color="bg-blue-600"
                />
            </div>

            {/* Utility Filters */}
            <div className="flex gap-1 items-center">
                <FilterButton
                    active={filters.utility.smoke}
                    onClick={() => toggleUtility('smoke')}
                    label="Smoke"
                />
                <FilterButton
                    active={filters.utility.flash}
                    onClick={() => toggleUtility('flash')}
                    label="Flash"
                />
                <FilterButton
                    active={filters.utility.molotov}
                    onClick={() => toggleUtility('molotov')}
                    label="Fire"
                />
                <FilterButton
                    active={filters.utility.he}
                    onClick={() => toggleUtility('he')}
                    label="HE"
                />
            </div>
        </div>
    );
};

const FilterButton: React.FC<{ active: boolean; onClick: () => void; label: string; color?: string }> = ({ active, onClick, label, color }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 border flex items-center gap-2
            ${active
                ? `${color || 'bg-white text-black border-white'}`
                : 'bg-transparent text-secondary border-transparent hover:bg-white/5 hover:text-white'
            }`}
    >
        {label}
        {!active && <EyeOff size={12} className="opacity-50" />}
    </button>
);
