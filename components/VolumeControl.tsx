
import React from 'react';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';
import { motion } from 'framer-motion';

interface VolumeControlProps {
    volume: number;
    isMuted: boolean;
    onVolumeChange: (volume: number) => void;
    onToggleMute: () => void;
    className?: string;
}

const VolumeControl: React.FC<VolumeControlProps> = ({
    volume,
    isMuted,
    onVolumeChange,
    onToggleMute,
    className = '',
}) => {
    const displayVolume = isMuted ? 0 : volume;

    const getVolumeIcon = () => {
        if (isMuted || volume === 0) return <VolumeX className="w-5 h-5" />;
        if (volume < 0.5) return <Volume1 className="w-5 h-5" />;
        return <Volume2 className="w-5 h-5" />;
    };

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        onVolumeChange(newVolume);
    };

    const handleSliderClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        onVolumeChange(percentage);
    };

    return (
        <div className={`flex items-center gap-3 group ${className}`}>
            <button
                onClick={onToggleMute}
                className={`p-2 rounded-xl transition-all hover:scale-110 active:scale-95 ${isMuted ? 'text-pink-500' : 'text-neutral-400 hover:text-white'
                    }`}
                title={isMuted ? 'Unmute' : 'Mute'}
            >
                {getVolumeIcon()}
            </button>

            <div
                className="relative w-24 md:w-32 h-2 bg-white/10 rounded-full cursor-pointer overflow-hidden"
                onClick={handleSliderClick}
            >
                {/* Volume Fill */}
                <motion.div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-500 to-indigo-500 rounded-full"
                    style={{ width: `${displayVolume * 100}%` }}
                    initial={false}
                    animate={{ width: `${displayVolume * 100}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />

                {/* Slider Thumb */}
                <motion.div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ left: `calc(${displayVolume * 100}% - 6px)` }}
                    initial={false}
                    animate={{ left: `calc(${displayVolume * 100}% - 6px)` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />

                {/* Hidden Range Input for Accessibility */}
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={displayVolume}
                    onChange={handleSliderChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    title={`Volume: ${Math.round(displayVolume * 100)}%`}
                />
            </div>

            {/* Volume Percentage (appears on hover) */}
            <span className="text-[10px] font-mono text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity w-8">
                {Math.round(displayVolume * 100)}%
            </span>
        </div>
    );
};

export default VolumeControl;
