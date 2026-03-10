import React from 'react';

const MAPS = ['Mirage', 'Inferno', 'Dust 2', 'Nuke', 'Overpass', 'Vertigo', 'Ancient', 'Anubis', 'Train'];

const MAP_TAGS: Record<string, string> = {
    Mirage: 'Default Pool',
    Inferno: 'Close Quarters',
    'Dust 2': 'Long Angles',
    Nuke: 'Vertical Play',
    Overpass: 'Utility Heavy',
    Vertigo: 'High Risk',
    Ancient: 'Mid Pressure',
    Anubis: 'River Control',
    Train: 'Tight Timings',
};

const MAP_COLORS: Record<string, string> = {
    Mirage: '#78dec7',
    Inferno: '#ff8b7b',
    'Dust 2': '#f4c26b',
    Nuke: '#8cbcff',
    Overpass: '#9bd7ff',
    Vertigo: '#f59cb8',
    Ancient: '#8fe0a0',
    Anubis: '#d9ba7a',
    Train: '#d7d7d7',
};

interface MapSwitcherProps {
    activeMap: string;
    onSelectMap: (map: string) => void;
}

export const MapSwitcher: React.FC<MapSwitcherProps> = ({ activeMap, onSelectMap }) => {
    return (
        <aside className="map-sidebar">
            <div className="sidebar-card">
                <div className="sidebar-header">
                    <span className="sidebar-kicker">Lineup Library</span>
                    <h1 className="sidebar-title">Maps</h1>
                    <p className="sidebar-subtitle">Browse the pool with the compact bookshelf layout from the ebook player, while keeping the tactical map untouched.</p>
                </div>

                <div className="sidebar-list hide-scrollbar">
                    {MAPS.map((map) => {
                        const isActive = activeMap === map;
                        const fileNameId = map.toLowerCase().replace(' ', '');
                        const color = MAP_COLORS[map] || '#78dec7';

                        return (
                            <button
                                key={map}
                                type="button"
                                onClick={() => onSelectMap(map)}
                                className={`map-item ${isActive ? 'map-item--active' : ''}`}
                                style={isActive ? { boxShadow: `0 0 0 1px ${color}33, 0 18px 30px rgba(0, 0, 0, 0.24)` } : undefined}
                            >
                                <div className="map-item__thumb">
                                    <img src={`/map_thumbnails/de_${fileNameId}_cs2.jpg`} alt="" />
                                    <img className="map-item__icon" src={`/map_icons/map_icon_de_${fileNameId}.svg`} alt={map} />
                                </div>

                                <div className="map-item__text">
                                    <span className="map-item__title">{map}</span>
                                    <span className="map-item__meta">{MAP_TAGS[map] || 'Utility Index'}</span>
                                </div>

                                <span className="map-item__dot" style={{ color }} />
                            </button>
                        );
                    })}
                </div>
            </div>
        </aside>
    );
};
