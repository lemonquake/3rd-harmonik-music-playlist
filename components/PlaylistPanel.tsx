
import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, Check, Music, Flame, Clock, Heart, Sparkles, ChevronRight, GripVertical } from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Playlist, Song, SMART_PLAYLISTS, SmartPlaylistType } from '../types';

interface PlaylistPanelProps {
    isOpen: boolean;
    onClose: () => void;
    playlists: Playlist[];
    songs: Song[];
    onCreatePlaylist: () => void;
    onDeletePlaylist: (id: string) => void;
    onRenamePlaylist: (id: string, name: string) => void;
    onSelectPlaylist: (playlistId: string) => void;
    onSelectSmartPlaylist: (type: SmartPlaylistType) => void;
    activePlaylistId: string | null;
}

const PlaylistPanel: React.FC<PlaylistPanelProps> = ({
    isOpen,
    onClose,
    playlists,
    songs,
    onCreatePlaylist,
    onDeletePlaylist,
    onRenamePlaylist,
    onSelectPlaylist,
    onSelectSmartPlaylist,
    activePlaylistId,
}) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    const startEditing = (playlist: Playlist) => {
        setEditingId(playlist.id);
        setEditName(playlist.name);
    };

    const finishEditing = () => {
        if (editingId && editName.trim()) {
            onRenamePlaylist(editingId, editName.trim());
        }
        setEditingId(null);
        setEditName('');
    };

    const getPlaylistCover = (playlist: Playlist) => {
        // Generate collage from first 4 songs
        const playlistSongs = playlist.songIds
            .slice(0, 4)
            .map(id => songs.find(s => s.id === id))
            .filter(Boolean) as Song[];

        if (playlistSongs.length === 0) {
            return null;
        }

        return playlistSongs;
    };

    const getSmartPlaylistIcon = (id: SmartPlaylistType) => {
        switch (id) {
            case 'most-played': return <Flame className="w-5 h-5 text-orange-500" />;
            case 'recently-played': return <Clock className="w-5 h-5 text-blue-500" />;
            case 'favorites': return <Heart className="w-5 h-5 text-pink-500" />;
            case 'discover': return <Sparkles className="w-5 h-5 text-purple-500" />;
            default: return <Music className="w-5 h-5" />;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[400]"
                        onClick={onClose}
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '-100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '-100%', opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed top-0 left-0 h-full w-full max-w-md bg-[#0a0a0a] border-r border-white/10 z-[450] flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <div>
                                <h2 className="text-xl font-sync font-bold flex items-center gap-3">
                                    <span className="text-2xl">🎵</span>
                                    Playlists
                                </h2>
                                <p className="text-sm text-neutral-500 mt-1">
                                    {playlists.length} custom + {SMART_PLAYLISTS.length} smart
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 text-neutral-500 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            {/* Smart Playlists */}
                            <div className="mb-8">
                                <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-4 px-2">
                                    Smart Playlists
                                </h3>
                                <div className="flex flex-col gap-2">
                                    {SMART_PLAYLISTS.map((smartPlaylist) => (
                                        <button
                                            key={smartPlaylist.id}
                                            onClick={() => onSelectSmartPlaylist(smartPlaylist.id)}
                                            className="group flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 rounded-2xl transition-all text-left"
                                        >
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
                                                {getSmartPlaylistIcon(smartPlaylist.id)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-sm">{smartPlaylist.name}</h4>
                                                <p className="text-[10px] text-neutral-500 truncate">
                                                    {smartPlaylist.description}
                                                </p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-neutral-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom Playlists */}
                            <div>
                                <div className="flex items-center justify-between mb-4 px-2">
                                    <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                                        Your Playlists
                                    </h3>
                                    <button
                                        onClick={onCreatePlaylist}
                                        className="flex items-center gap-2 text-xs font-bold text-pink-500 hover:text-pink-400 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        New
                                    </button>
                                </div>

                                {playlists.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center px-8">
                                        <div className="text-5xl mb-4">📀</div>
                                        <h4 className="font-bold mb-2">No Playlists Yet</h4>
                                        <p className="text-neutral-500 text-sm mb-6">
                                            Create your first playlist to organize your music.
                                        </p>
                                        <button
                                            onClick={onCreatePlaylist}
                                            className="px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white rounded-full font-bold text-sm transition-colors flex items-center gap-2"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Create Playlist
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {playlists.map((playlist) => {
                                            const coverSongs = getPlaylistCover(playlist);
                                            const isActive = activePlaylistId === playlist.id;
                                            const isEditing = editingId === playlist.id;

                                            return (
                                                <motion.div
                                                    key={playlist.id}
                                                    layout
                                                    className={`group flex items-center gap-4 p-3 rounded-2xl transition-all cursor-pointer ${isActive
                                                            ? 'bg-pink-500/10 border border-pink-500/30'
                                                            : 'bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10'
                                                        }`}
                                                    onClick={() => !isEditing && onSelectPlaylist(playlist.id)}
                                                >
                                                    {/* Playlist Cover */}
                                                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-neutral-900 grid grid-cols-2 gap-[1px]">
                                                        {coverSongs && coverSongs.length > 0 ? (
                                                            coverSongs.slice(0, 4).map((song, i) => (
                                                                <div key={i} className="aspect-square overflow-hidden">
                                                                    <img
                                                                        src={song.cover}
                                                                        alt=""
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="col-span-2 row-span-2 flex items-center justify-center">
                                                                <Music className="w-6 h-6 text-neutral-600" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Playlist Info */}
                                                    <div className="flex-1 min-w-0">
                                                        {isEditing ? (
                                                            <input
                                                                type="text"
                                                                value={editName}
                                                                onChange={(e) => setEditName(e.target.value)}
                                                                onKeyDown={(e) => e.key === 'Enter' && finishEditing()}
                                                                onBlur={finishEditing}
                                                                className="w-full bg-transparent border-b border-pink-500 font-bold text-sm focus:outline-none"
                                                                autoFocus
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        ) : (
                                                            <h4 className="font-bold text-sm truncate">{playlist.name}</h4>
                                                        )}
                                                        <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">
                                                            {playlist.songIds.length} {playlist.songIds.length === 1 ? 'song' : 'songs'}
                                                        </p>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {isEditing ? (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    finishEditing();
                                                                }}
                                                                className="p-2 text-green-500 hover:bg-green-500/10 rounded-xl transition-all"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </button>
                                                        ) : (
                                                            <>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        startEditing(playlist);
                                                                    }}
                                                                    className="p-2 text-neutral-500 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                                                                >
                                                                    <Edit2 className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onDeletePlaylist(playlist.id);
                                                                    }}
                                                                    className="p-2 text-neutral-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default PlaylistPanel;
