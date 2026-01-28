import React from 'react';
// import { Map } from 'lucide-react';

const MAPS = ['Mirage', 'Inferno', 'Dust 2', 'Nuke', 'Overpass', 'Vertigo', 'Ancient', 'Anubis'];

interface MapSwitcherProps {
    activeMap: string;
    onSelectMap: (map: string) => void;
}

export const MapSwitcher: React.FC<MapSwitcherProps> = ({ activeMap, onSelectMap }) => {
    return (
        <div className="h-full w-20 flex flex-col items-center bg-secondary border-r border-[#ffffff10] py-4 gap-4 z-20">
            <div className="mb-4">
                {/* Logo Placeholder */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent-primary to-purple-400 flex items-center justify-center font-bold text-white text-xs">
                    CS
                </div>
            </div>

            {MAPS.map((map) => (
                <button
                    key={map}
                    onClick={() => onSelectMap(map)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group relative
            ${activeMap === map
                            ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/20'
                            : 'bg-[#262626] text-secondary hover:bg-[#333] hover:text-white'
                        }`}
                    title={map}
                >
                    <span className="text-[10px] font-bold tracking-wider">{map.substring(0, 3).toUpperCase()}</span>

                    {/* Active Indicator */}
                    {activeMap === map && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full w-1 h-8 bg-white rounded-r-md" />
                    )}
                </button>
            ))}
        </div>
    );
};
