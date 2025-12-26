
import React, { useState } from 'react';
import { X, Play, Pause, Heart, Plus, Music, Clock, Flame, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Song, Playlist } from '../types';

interface FocusedLibraryViewProps {
    isOpen: boolean;
    onClose: () => void;
    songs: Song[];
    activeSongId: string | null;
    isPlaying: boolean;
    onSelectSong: (id: string) => void;
    onToggleFavorite: (e: React.MouseEvent, id: string) => void;
    onAddToQueue: (id: string) => void;
    playlists: Playlist[];
    onAddToPlaylist: (playlistId: string, songId: string) => void;
}

const FocusedLibraryView: React.FC<FocusedLibraryViewProps> = ({
    isOpen,
    onClose,
    songs,
    activeSongId,
    isPlaying,
    onSelectSong,
    onToggleFavorite,
    onAddToQueue,
    playlists,
    onAddToPlaylist,
}) => {
    const [sortBy, setSortBy] = useState<'default' | 'title' | 'plays' | 'favorites'>('default');
    const [filterFavorites, setFilterFavorites] = useState(false);

    const sortedSongs = [...songs]
        .filter(s => !filterFavorites || s.isFavorite)
        .sort((a, b) => {
            switch (sortBy) {
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'plays':
                    return b.playCount - a.playCount;
                case 'favorites':
                    return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0);
                default:
                    return 0;
            }
        });

    const totalPlays = songs.reduce((acc, s) => acc + s.playCount, 0);
    const totalFavorites = songs.filter(s => s.isFavorite).length;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[350]"
                        onClick={onClose}
                    />

                    {/* Focused Library Panel */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed inset-4 md:inset-8 lg:inset-12 bg-[#0a0a0a] border border-white/10 rounded-[3rem] z-[400] flex flex-col overflow-hidden shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 md:p-8 border-b border-white/10 shrink-0">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-indigo-500 flex items-center justify-center">
                                    <Music className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-sync font-bold">The Vault</h2>
                                    <p className="text-sm text-neutral-500 mt-1">
                                        {songs.length} tracks • {totalPlays} total plays • {totalFavorites} favorites
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-3 text-neutral-500 hover:text-white hover:bg-white/10 rounded-2xl transition-all"
                            >
                                <X className="w-7 h-7" />
                            </button>
                        </div>

                        {/* Filter & Sort Bar */}
                        <div className="flex flex-wrap items-center gap-3 px-6 md:px-8 py-4 border-b border-white/5 shrink-0">
                            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Sort:</span>
                            {[
                                { id: 'default', label: 'Default', icon: null },
                                { id: 'title', label: 'A-Z', icon: null },
                                { id: 'plays', label: 'Most Played', icon: <Flame className="w-3 h-3" /> },
                                { id: 'favorites', label: 'Favorites', icon: <Heart className="w-3 h-3" /> },
                            ].map(option => (
                                <button
                                    key={option.id}
                                    onClick={() => setSortBy(option.id as typeof sortBy)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${sortBy === option.id
                                            ? 'bg-pink-500/20 text-pink-500 border border-pink-500/50'
                                            : 'bg-white/5 text-neutral-400 border border-transparent hover:border-white/10'
                                        }`}
                                >
                                    {option.icon}
                                    {option.label}
                                </button>
                            ))}

                            <div className="w-px h-6 bg-white/10 mx-2" />

                            <button
                                onClick={() => setFilterFavorites(!filterFavorites)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${filterFavorites
                                        ? 'bg-pink-500 text-white'
                                        : 'bg-white/5 text-neutral-400 border border-transparent hover:border-white/10'
                                    }`}
                            >
                                <Heart className={`w-3 h-3 ${filterFavorites ? 'fill-current' : ''}`} />
                                Only Favorites
                            </button>
                        </div>

                        {/* Song Grid */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {sortedSongs.map((song, index) => {
                                    const isActive = activeSongId === song.id;
                                    return (
                                        <motion.div
                                            key={song.id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.02 }}
                                            className={`group relative p-4 rounded-[2rem] border transition-all cursor-pointer ${isActive
                                                    ? 'bg-pink-500/10 border-pink-500/30'
                                                    : 'bg-white/5 border-transparent hover:border-white/10 hover:bg-white/10'
                                                }`}
                                            onClick={() => onSelectSong(song.id)}
                                        >
                                            <div className="flex gap-4">
                                                {/* Cover */}
                                                <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden flex-shrink-0">
                                                    {song.cover ? (
                                                        <img
                                                            src={song.cover}
                                                            alt={song.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                                                            <Music className="w-8 h-8 text-neutral-600" />
                                                        </div>
                                                    )}

                                                    {/* Play Overlay */}
                                                    <div className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                                        }`}>
                                                        {isActive && isPlaying ? (
                                                            <div className="flex gap-1 items-end h-6">
                                                                {[0, 1, 2].map(i => (
                                                                    <motion.div
                                                                        key={i}
                                                                        animate={{ height: ['30%', '100%', '30%'] }}
                                                                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                                                                        className="w-1.5 bg-pink-500 rounded-full"
                                                                    />
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <Play className="w-10 h-10 fill-current text-white" />
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                    <h3 className={`font-bold text-lg md:text-xl truncate mb-1 ${isActive ? 'text-pink-500' : ''
                                                        }`}>
                                                        {song.title}
                                                    </h3>
                                                    <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mb-3">
                                                        {song.artist}
                                                    </p>

                                                    {/* Stats Row */}
                                                    <div className="flex items-center gap-4 text-[10px] text-neutral-500">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {song.duration}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <BarChart3 className="w-3 h-3" />
                                                            {song.playCount} plays
                                                        </span>
                                                        <span className="px-2 py-0.5 bg-white/10 rounded-full">
                                                            {song.album}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onAddToQueue(song.id);
                                                    }}
                                                    className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                                                    title="Add to Queue"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => onToggleFavorite(e, song.id)}
                                                    className={`p-2 rounded-xl transition-all ${song.isFavorite
                                                            ? 'bg-pink-500/20 text-pink-500'
                                                            : 'bg-white/10 hover:bg-white/20 text-neutral-400'
                                                        }`}
                                                    title={song.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                                                >
                                                    <Heart className={`w-4 h-4 ${song.isFavorite ? 'fill-current' : ''}`} />
                                                </button>
                                            </div>

                                            {/* Favorite Badge */}
                                            {song.isFavorite && (
                                                <div className="absolute bottom-4 right-4">
                                                    <Heart className="w-4 h-4 text-pink-500 fill-current" />
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {sortedSongs.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-64 text-center">
                                    <Heart className="w-16 h-16 text-neutral-700 mb-4" />
                                    <h3 className="text-xl font-bold mb-2">No favorites yet</h3>
                                    <p className="text-neutral-500">Heart some songs to see them here</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default FocusedLibraryView;
