import React from 'react';

interface LogoProps {
    size?: number;
    className?: string;
    iconOnly?: boolean;
    variant?: 'default' | 'emerald';
}

export const Logo: React.FC<LogoProps> = ({ size = 40, className = '', iconOnly = true, variant = 'default' }) => {
    const gradientId = `logoGradient-${variant}`;
    const beamGradientId = `beamGradient-${variant}`;

    const getGradientColors = () => {
        if (variant === 'emerald') {
            return {
                start: '#10b981', // emerald-500
                end: '#06b6d4',   // cyan-500
                beam: '#10b981'
            };
        }
        return {
            start: '#6366f1', // indigo-500
            end: '#06b6d4',   // cyan-500
            beam: '#06b6d4'
        };
    };

    const colors = getGradientColors();

    const svgContent = (
        <>
            <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={colors.start} />
                    <stop offset="100%" stopColor={colors.end} />
                </linearGradient>
                <linearGradient id={beamGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={colors.beam} stopOpacity="0.3" />
                    <stop offset="50%" stopColor={colors.start} stopOpacity="0.6" />
                    <stop offset="100%" stopColor={colors.beam} stopOpacity="0.3" />
                </linearGradient>
            </defs>

            {/* Bot Head - Hexagonal shape representing AI */}
            <path
                d="M50 10 L70 22.5 L70 47.5 L50 60 L30 47.5 L30 22.5 Z"
                fill={`url(#${gradientId})`}
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.9"
            />

            {/* Eyes - AI perception */}
            <circle cx="42" cy="35" r="4" fill="white" opacity="0.95" />
            <circle cx="58" cy="35" r="4" fill="white" opacity="0.95" />

            {/* Antenna - connectivity */}
            <path
                d="M50 10 L50 2"
                stroke={`url(#${gradientId})`}
                strokeWidth="2.5"
                strokeLinecap="round"
            />
            <circle cx="50" cy="2" r="2.5" fill={`url(#${gradientId})`} />

            {/* Light Beams - knowledge radiating outward */}
            <path
                d="M50 60 L20 85"
                stroke={`url(#${beamGradientId})`}
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.6"
            />
            <path
                d="M50 60 L50 95"
                stroke={`url(#${beamGradientId})`}
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.6"
            />
            <path
                d="M50 60 L80 85"
                stroke={`url(#${beamGradientId})`}
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.6"
            />

            {/* Circuit Pattern - tech element */}
            <g opacity="0.4" stroke="white" strokeWidth="1.5" fill="none">
                <path d="M35 30 L38 30 L38 27" />
                <path d="M62 30 L65 30 L65 27" />
                <circle cx="38" cy="27" r="1.5" fill="white" />
                <circle cx="65" cy="27" r="1.5" fill="white" />
            </g>

            {/* Central Processor - core intelligence */}
            <rect
                x="45"
                y="40"
                width="10"
                height="8"
                rx="1"
                fill="white"
                opacity="0.3"
            />
            <circle cx="50" cy="44" r="2" fill={`url(#${gradientId})`} />
        </>
    );

    if (iconOnly) {
        return (
            <svg
                width={size}
                height={size}
                viewBox="0 0 100 100"
                className={className}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {svgContent}
            </svg>
        );
    }

    // Full logo with text (for other uses if needed)
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <svg
                width={size}
                height={size}
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                {svgContent}
            </svg>
        </div>
    );
};
