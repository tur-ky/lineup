import React from 'react';
import { Plus, Check, X } from 'lucide-react';

import smokeIcon from '../../assets/utils/smoke.svg';
import flashIcon from '../../assets/utils/flash.svg';
import molotovIcon from '../../assets/utils/molotov.svg';
import heIcon from '../../assets/utils/hegrenade.svg';

const ICONS: Record<string, string> = {
    smoke: smokeIcon,
    flash: flashIcon,
    molotov: molotovIcon,
    hegrenade: heIcon,
};

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

export const FilterPanel: React.FC<FilterPanelProps> = ({
    filters,
    toggleSide,
    toggleUtility,
    onCreate,
    isSelecting,
    instructionText,
    onConfirm,
    onCancel,
}) => {
    return (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4 animate-in fade-in duration-500">
            <div className="filter-dock">
                <div className="filter-group">
                    <SideButton active={filters.side.t} label="T" onClick={() => toggleSide('t')} />
                    <SideButton active={filters.side.ct} label="CT" onClick={() => toggleSide('ct')} />
                </div>

                <div className="filter-divider" />

                <div className="filter-group">
                    <FilterButton active={filters.utility.smoke} onClick={() => toggleUtility('smoke')} label="Smoke" icon="smoke" />
                    <FilterButton active={filters.utility.molotov} onClick={() => toggleUtility('molotov')} label="Molotov" icon="molotov" />
                    <FilterButton active={filters.utility.flash} onClick={() => toggleUtility('flash')} label="Flash" icon="flash" />
                    <FilterButton active={filters.utility.he} onClick={() => toggleUtility('he')} label="HE Grenade" icon="hegrenade" />
                </div>

                <div className="filter-divider" />

                <button
                    type="button"
                    onClick={onCreate}
                    title="Create New Lineup"
                    className="create-button"
                >
                    <Plus size={20} strokeWidth={2.2} />
                </button>
            </div>

            {isSelecting && instructionText && (
                <div className="selection-prompt">{instructionText}</div>
            )}

            {isSelecting && onConfirm && onCancel && (
                <div className="selection-actions pointer-events-auto">
                    <button type="button" onClick={onCancel} className="action-icon-button" title="Cancel">
                        <X size={20} strokeWidth={2.5} />
                    </button>
                    <button type="button" onClick={onConfirm} className="action-icon-button action-icon-button--confirm" title="Confirm Location">
                        <Check size={20} strokeWidth={2.5} />
                    </button>
                </div>
            )}
        </div>
    );
};

const SideButton: React.FC<{ active: boolean; label: string; onClick: () => void }> = ({ active, label, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`filter-pill ${active ? 'filter-pill--active' : ''}`}
    >
        {label}
    </button>
);

const FilterButton: React.FC<{ active: boolean; onClick: () => void; label: string; icon: string }> = ({ active, onClick, label, icon }) => (
    <button
        type="button"
        onClick={onClick}
        title={label}
        className={`filter-icon-button ${active ? 'filter-icon-button--active' : ''}`}
    >
        <img src={ICONS[icon]} alt={label} />
    </button>
);
