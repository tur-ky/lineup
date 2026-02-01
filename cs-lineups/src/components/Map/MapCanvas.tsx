import React, { useState, useRef } from 'react';
import { Crosshair } from 'lucide-react';

interface MapCanvasProps {
    activeMap: string;
    onMapClick?: (pos: { x: number; y: number }) => void;
    children?: React.ReactNode;
    isSelecting?: boolean;
    selectionMode?: 'landing' | 'throwing';
    onCancelSelection?: () => void;
    selectionInstruction?: string;
    // Active lineups for vector rendering
    activeVectors?: Array<{
        id: string;
        landing: { x: number; y: number };
        origin: { x: number; y: number };
        opacity?: number;
    }>;
    onVectorClick?: (id: string) => void;
}

export interface MapCanvasRef {
    confirmSelection: () => void;
}

export const MapCanvas = React.forwardRef<MapCanvasRef, MapCanvasProps>(({
    activeMap,
    onMapClick,
    children,
    isSelecting = false,
    activeVectors = [],
    onVectorClick
}, ref) => {
    const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const lastPos = useRef({ x: 0, y: 0 });

    const handleWheel = (e: WheelEvent) => {
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

    const confirmSelection = () => {
        if (mapRef.current && containerRef.current && onMapClick) {
            const mapRect = mapRef.current.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();

            // Center of the viewport
            const centerX = containerRect.left + containerRect.width / 2;
            const centerY = containerRect.top + containerRect.height / 2;

            // Calculate position relative to map top-left
            const x = (centerX - mapRect.left) / transform.k;
            const y = (centerY - mapRect.top) / transform.k;

            onMapClick({ x, y });
        }
    };

    React.useImperativeHandle(ref, () => ({
        confirmSelection
    }));

    // Fix for React passive event listener warning
    React.useEffect(() => {
        const currentRef = containerRef.current;
        if (currentRef) {
            currentRef.addEventListener('wheel', handleWheel, { passive: false });
        }
        return () => {
            if (currentRef) {
                currentRef.removeEventListener('wheel', handleWheel);
            }
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="w-full h-full relative overflow-hidden bg-[#121212]"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <div
                ref={mapRef}
                className="absolute origin-center transition-transform duration-75"
                style={{
                    transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
                    width: '1024px', // Standard radar size usually, but we scale it
                    height: '1024px',
                    left: '50%',
                    top: '50%',
                    marginLeft: '-512px',
                    marginTop: '-512px'
                }}
            >
                <img
                    src={`/maps/de_${activeMap.toLowerCase().replace(' ', '')}_radar.svg`}
                    alt={activeMap}
                    className="w-full h-full object-contain pointer-events-none select-none"
                    draggable={false}
                />

                {/* Vector Overlay */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" style={{ zIndex: 10 }}>
                    <defs>
                        <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                            <polygon points="0 0, 6 2, 0 4" fill="#ffffff" fillOpacity="0.8" />
                        </marker>
                    </defs>
                    {activeVectors.map(vec => (
                        <g key={vec.id}>
                            {/* Throw Line */}
                            <line
                                x1={vec.origin.x}
                                y1={vec.origin.y}
                                x2={vec.landing.x}
                                y2={vec.landing.y}
                                stroke="white"
                                strokeWidth="1.5"
                                strokeDasharray="4 4"
                                strokeOpacity="0.6"
                                markerEnd="url(#arrowhead)"
                            />
                            {/* Throw Position Dot - Interactive */}
                            <circle
                                cx={vec.origin.x}
                                cy={vec.origin.y}
                                r="4" // Slightly larger for hittable area
                                fill="white"
                                fillOpacity="1"
                                className="pointer-events-auto cursor-pointer hover:stroke-2 hover:stroke-black/50 transition-all"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onVectorClick?.(vec.id);
                                }}
                            />
                        </g>
                    ))}
                </svg>

                {/* Pins Overlay */}
                <div style={{ zIndex: 20, position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                    {children}
                </div>
            </div>

            {/* Selection UI Overlay */}
            {isSelecting && (
                <>
                    {/* Crosshair - Perfectly Centered */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                        <Crosshair className="text-white drop-shadow-md" size={32} strokeWidth={1.5} />
                    </div>
                </>
            )}
        </div>
    );
});
