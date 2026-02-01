import React from 'react';

const MAPS = ['Mirage', 'Inferno', 'Dust 2', 'Nuke', 'Overpass', 'Vertigo', 'Ancient', 'Anubis', 'Train'];

const MAP_COLORS: Record<string, string> = {
    'Mirage': '#8b5cf6', // Violet
    'Inferno': '#ef4444', // Red
    'Dust 2': '#eab308', // Yellow
    'Nuke': '#3b82f6', // Blue
    'Overpass': '#06b6d4', // Cyan/Teal
    'Vertigo': '#f43f5e', // Rose
    'Ancient': '#10b981', // Emerald
    'Anubis': '#d97706', // Amber
    'Train': '#f59e0b', // Orange/Yellow
};

interface MapSwitcherProps {
    activeMap: string;
    onSelectMap: (map: string) => void;
}

export const MapSwitcher: React.FC<MapSwitcherProps> = ({ activeMap, onSelectMap }) => {
    return (
        <div className="h-full w-72 flex flex-col items-center bg-secondary border-r border-[#ffffff10] py-4 gap-3 z-20 overflow-y-auto hide-scrollbar">


            <div className="w-full px-3 flex flex-col gap-2">
                {MAPS.map((map) => {
                    const isActive = activeMap === map;
                    const fileNameId = map.toLowerCase().replace(' ', '');
                    const activeColor = MAP_COLORS[map] || '#6366f1';

                    return (
                        <button
                            key={map}
                            onClick={() => onSelectMap(map)}
                            style={{
                                backgroundColor: 'transparent',
                                borderColor: isActive ? activeColor : 'transparent',
                                boxShadow: isActive ? `0 0 20px -5px ${activeColor}80` : 'none'
                            }}

                            className={`w-full h-16 rounded-xl relative overflow-hidden transition-all duration-300 group border bg-transparent
                                ${isActive
                                    ? 'scale-[1.02] z-10'
                                    : 'hover:scale-[1.01] hover:z-10 border-transparent hover:border-white/10'
                                }
                            `}
                        >
                            {/* Background Thumbnail */}
                            <div className="absolute inset-0 bg-black">
                                <img
                                    src={`/map_thumbnails/de_${fileNameId}_cs2.jpg`}
                                    alt={`${map} background`}
                                    style={{ opacity: isActive ? 0.4 : 0.2 }}
                                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isActive ? 'grayscale-0' : 'grayscale-[50%]'}`}
                                />
                                <div className={`absolute inset-0 bg-gradient-to-r from-black/95 via-black/80 to-black/40 transition-opacity duration-300 ${isActive ? 'opacity-60' : 'opacity-90'}`} />
                            </div>

                            {/* Content */}
                            <div className="relative z-10 w-full h-full flex items-center justify-between px-4">
                                <div className="flex items-center gap-5">
                                    <img
                                        src={`/map_icons/map_icon_de_${fileNameId}.svg`}
                                        alt={map}
                                        className={`w-8 h-8 drop-shadow-lg transition-transform duration-300 ${isActive ? 'scale-110 brightness-110 custom-drop-shadow' : 'group-hover:scale-110 brightness-90 grayscale-[0.3]'}`}
                                    />
                                    <span style={{ color: 'white', fontFamily: '"Segoe UI", sans-serif' }} className="font-semibold text-lg tracking-wide shadow-black drop-shadow-md">
                                        {map}
                                    </span>
                                </div>

                                {isActive && (
                                    <div
                                        className="w-1.5 h-1.5 rounded-full shadow-[0_0_10px_currentColor] animate-pulse"
                                        style={{ backgroundColor: activeColor, color: activeColor }}
                                    />
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
