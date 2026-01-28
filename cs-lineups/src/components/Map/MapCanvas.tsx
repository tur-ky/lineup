import React, { useState, useRef } from 'react';

interface MapCanvasProps {
    activeMap: string;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({ activeMap }) => {
    const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const lastPos = useRef({ x: 0, y: 0 });

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault(); // Note: React events might not cancel native scroll?
        const scaleAmount = -e.deltaY * 0.001;
        setTransform(prev => ({
            ...prev,
            k: Math.max(0.5, Math.min(5, prev.k + scaleAmount))
        }));
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button === 0) { // Left click
            isDragging.current = true;
            lastPos.current = { x: e.clientX, y: e.clientY };
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current) return;
        const dx = e.clientX - lastPos.current.x;
        const dy = e.clientY - lastPos.current.y;
        setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
        lastPos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
        isDragging.current = false;
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-full relative overflow-hidden bg-[#121212]"
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <div
                className="absolute origin-center transition-transform duration-75"
                style={{
                    transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
                    backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                    width: '2000px',
                    height: '2000px',
                    left: '50%',
                    top: '50%',
                    marginLeft: '-1000px',
                    marginTop: '-1000px'
                }}
            >
                <div className="absolute inset-0 flex items-center justify-center text-secondary text-2xl font-bold opacity-20 pointer-events-none">
                    MAP: {activeMap.toUpperCase()}
                </div>
                {/* Placeholder for SVG map */}
            </div>
        </div>
    );
};
