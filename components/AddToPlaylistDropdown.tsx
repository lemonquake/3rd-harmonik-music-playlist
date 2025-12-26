
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Playlist } from '../types';

interface AddToPlaylistDropdownProps {
    playlists: Playlist[];
    songId: string;
    onAddToPlaylist: (playlistId: string, songId: string) => void;
    onCreatePlaylist: () => void;
    className?: string;
}

const AddToPlaylistDropdown: React.FC<AddToPlaylistDropdownProps> = ({
    playlists,
    songId,
    onAddToPlaylist,
    onCreatePlaylist,
    className = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const isInPlaylist = (playlist: Playlist) => playlist.songIds.includes(songId);

    return (
        <div ref={dropdownRef} className={`relative ${className}`}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-all"
            >
                <Plus className="w-4 h-4" />
                Add to Playlist
                <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-2 w-64 bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100]"
                    >
                        {playlists.length === 0 ? (
                            <div className="p-4 text-center">
                                <p className="text-neutral-500 text-xs mb-3">No playlists yet</p>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onCreatePlaylist();
                                        setIsOpen(false);
                                    }}
                                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-pink-500 hover:bg-pink-600 rounded-xl text-xs font-bold transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Create First Playlist
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                    {playlists.map((playlist) => {
                                        const inPlaylist = isInPlaylist(playlist);
                                        return (
                                            <button
                                                key={playlist.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (!inPlaylist) {
                                                        onAddToPlaylist(playlist.id, songId);
                                                    }
                                                    setIsOpen(false);
                                                }}
                                                disabled={inPlaylist}
                                                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${inPlaylist
                                                        ? 'bg-green-500/10 text-green-400 cursor-default'
                                                        : 'hover:bg-white/5'
                                                    }`}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-sm truncate">{playlist.name}</p>
                                                    <p className="text-[10px] text-neutral-500">
                                                        {playlist.songIds.length} songs
                                                    </p>
                                                </div>
                                                {inPlaylist && (
                                                    <Check className="w-4 h-4 text-green-500" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="border-t border-white/10">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onCreatePlaylist();
                                            setIsOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-all"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
                                            <Plus className="w-4 h-4 text-pink-500" />
                                        </div>
                                        <span className="font-bold text-sm text-pink-500">Create New Playlist</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AddToPlaylistDropdown;
