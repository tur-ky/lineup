import React from 'react';
import { Crosshair } from 'lucide-react';

interface PinProps {
    x: number;
    y: number;
    type?: 'smoke' | 'flash' | 'molotov' | 'he';
    side?: 't' | 'ct';
    isOrigin?: boolean;
    onClick?: () => void;
    scale?: number;
    count?: number;
    opacity?: number;
}

export const Pin: React.FC<PinProps> = ({
    x, y,
    type = 'smoke',
    side = 't',
    isOrigin = false,
    onClick,
    scale = 1,
    count = 1,
    opacity = 1
}) => {
    let iconName = 'smoke';
    const safeType = (type || 'smoke').toLowerCase();
    if (safeType === 'flash') iconName = 'flash';
    if (safeType === 'molotov') iconName = 'molotov';
    if (safeType === 'he') iconName = 'hegrenade';

    return (
        <div
            onClick={(e) => {
                e.stopPropagation();
                onClick?.();
            }}
            title={`${side.toUpperCase()} ${safeType} ${count > 1 ? `(x${count})` : ''}`}
            className={`absolute flex items-center justify-center transition-transform duration-200 hover:scale-110 hover:z-50 cursor-pointer pointer-events-auto`}
            style={{
                left: x,
                top: y,
                width: isOrigin ? '14px' : '20px',
                height: isOrigin ? '14px' : '20px',
                transform: `translate(-50%, -50%) scale(${1 / scale})`,
                backgroundColor: `rgba(255, 255, 255, ${0.5 * opacity})`,
                borderRadius: '50%',
                border: 'none',
                outline: 'none',
                boxShadow: 'none',
                flexShrink: 0,
            }}
        >
            {isOrigin ? (
                <Crosshair size={10} className="text-white/80" />
            ) : (
                <img
                    src={`/utils/${iconName}.svg`}
                    className="object-contain select-none pointer-events-none"
                    alt={type}
                    style={{
                        filter: 'brightness(0) invert(1)',
                        width: '70%',
                        height: '70%',
                        maxWidth: '70%',
                        maxHeight: '70%',
                        transform: iconName === 'smoke' ? 'translateY(5%)'
                            : iconName === 'hegrenade' ? 'translate(-5%, -5%)'
                                : 'none'
                    }}
                />
            )}

            {/* Count Badge - Just the number */}
            {!isOrigin && count > 1 && (
                <div
                    className="absolute flex items-center justify-center pointer-events-none"
                    style={{
                        bottom: '-6px',
                        right: '-6px',
                        zIndex: 20
                    }}
                >
                    <span
                        className="font-black text-white leading-none"
                        style={{
                            fontSize: '11px'
                        }}
                    >
                        {count}
                    </span>
                </div>
            )}
        </div>
    );
};
