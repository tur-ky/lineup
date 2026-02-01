import React from 'react';

import { Plus, Check, X } from 'lucide-react';

interface FilterPanelProps {
    filters: {
        side: { t: boolean; ct: boolean };
        utility: { smoke: boolean; flash: boolean; molotov: boolean; he: boolean };
    };
    toggleSide: (side: 't' | 'ct') => void;
    toggleUtility: (type: 'smoke' | 'flash' | 'molotov' | 'he') => void;
    onCreate?: () => void;
    isSelecting?: boolean;
    instructionText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, toggleUtility, onCreate, isSelecting, instructionText, onConfirm, onCancel }) => {
    return (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
            {/* Utility Filters - Floating Icons */}
            <div className="flex gap-4 items-center p-2">
                <FilterButton
                    active={filters.utility.smoke}
                    onClick={() => toggleUtility('smoke')}
                    label="Smoke"
                    icon="smoke"
                />
                <FilterButton
                    active={filters.utility.molotov}
                    onClick={() => toggleUtility('molotov')}
                    label="Molotov"
                    icon="molotov"
                />
                <FilterButton
                    active={filters.utility.flash}
                    onClick={() => toggleUtility('flash')}
                    label="Flash"
                    icon="flash"
                />
                <FilterButton
                    active={filters.utility.he}
                    onClick={() => toggleUtility('he')}
                    label="HE Grenade"
                    icon="hegrenade"
                />

                {/* Separator */}
                <div className="w-px h-8 bg-white/10 mx-1"></div>

                {/* Create Lineup Button - Transparent style matching filters */}
                <button
                    onClick={onCreate}
                    title="Create New Lineup"
                    style={{ background: 'transparent', border: 'none', padding: 0 }}
                    className="w-14 h-14 flex items-center justify-center transition-all duration-300 relative group appearance-none !bg-transparent !border-none !outline-none !shadow-none active:scale-95"
                >
                    <Plus
                        color="white"
                        className={`w-8 h-8 transition-all duration-300 drop-shadow-md
                            ${isSelecting
                                ? 'opacity-100 scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                                : 'opacity-100 group-hover:scale-110'
                            }`}
                        strokeWidth={1.5}
                    />
                </button>
            </div>

            {/* Selection Prompt */}
            {isSelecting && instructionText && (
                <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white text-sm font-medium shadow-lg animate-in fade-in slide-in-from-top-2">
                    {instructionText}
                </div>
            )}

            {/* Selection Actions - Rendered here to guarantee position below prompt */}
            {isSelecting && onConfirm && onCancel && (
                <div className="flex gap-8 items-center animate-in fade-in slide-in-from-top-2 pointer-events-auto">
                    <button
                        onClick={onCancel}
                        style={{ backgroundColor: 'transparent', border: 'none', boxShadow: 'none' }}
                        className="p-2 transition-all hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center"
                        title="Cancel"
                    >
                        <X size={32} strokeWidth={3} color="white" />
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{ backgroundColor: 'transparent', border: 'none', boxShadow: 'none' }}
                        className="p-2 transition-all hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center"
                        title="Confirm Location"
                    >
                        <Check size={32} strokeWidth={3} color="white" />
                    </button>
                </div>
            )}
        </div>
    );
};


const FilterButton: React.FC<{ active: boolean; onClick: () => void; label: string; icon: string }> = ({ active, onClick, label, icon }) => (
    <button
        onClick={onClick}
        title={label}
        style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}
        className="w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 relative group bg-transparent border-none outline-none shadow-none"
    >
        <img
            src={`/utils/${icon}.svg`}
            style={{ filter: 'brightness(0) invert(1)' }}
            className={`w-8 h-8 relative z-10 transition-all duration-300
                ${active
                    ? 'opacity-100 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] scale-110'
                    : 'opacity-50 group-hover:opacity-80 group-hover:scale-105'
                }`}
            alt={label}
        />
    </button>
);
