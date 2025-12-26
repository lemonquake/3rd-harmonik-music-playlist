
import React from 'react';
import { X, Trash2, GripVertical, Play } from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { QueueItem, Song } from '../types';

interface QueuePanelProps {
    isOpen: boolean;
    onClose: () => void;
    queue: QueueItem[];
    songs: Song[];
    currentSongId: string | null;
    onReorderQueue: (newQueue: QueueItem[]) => void;
    onRemoveFromQueue: (queueItemId: string) => void;
    onClearQueue: () => void;
    onPlayFromQueue: (songId: string) => void;
}

const QueuePanel: React.FC<QueuePanelProps> = ({
    isOpen,
    onClose,
    queue,
    songs,
    currentSongId,
    onReorderQueue,
    onRemoveFromQueue,
    onClearQueue,
    onPlayFromQueue,
}) => {
    const getSong = (songId: string) => songs.find(s => s.id === songId);

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
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0a0a0a] border-l border-white/10 z-[450] flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/10">
                            <div>
                                <h2 className="text-xl font-sync font-bold flex items-center gap-3">
                                    <span className="text-2xl">📋</span>
                                    Up Next
                                </h2>
                                <p className="text-sm text-neutral-500 mt-1">
                                    {queue.length} {queue.length === 1 ? 'song' : 'songs'} in queue
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {queue.length > 0 && (
                                    <button
                                        onClick={onClearQueue}
                                        className="p-2 text-neutral-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                        title="Clear Queue"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="p-2 text-neutral-500 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Queue List */}
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            {queue.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center px-8">
                                    <div className="text-6xl mb-6">🎵</div>
                                    <h3 className="text-xl font-sync font-bold mb-2">Queue is Empty</h3>
                                    <p className="text-neutral-500 text-sm">
                                        Add songs to your queue to see them here.
                                        Use "Play Next" on any song to add it.
                                    </p>
                                </div>
                            ) : (
                                <Reorder.Group
                                    axis="y"
                                    values={queue}
                                    onReorder={onReorderQueue}
                                    className="flex flex-col gap-2"
                                >
                                    {queue.map((queueItem, index) => {
                                        const song = getSong(queueItem.songId);
                                        if (!song) return null;

                                        return (
                                            <Reorder.Item
                                                key={queueItem.id}
                                                value={queueItem}
                                                className="group bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 rounded-2xl p-3 flex items-center gap-3 cursor-grab active:cursor-grabbing transition-all"
                                            >
                                                {/* Drag Handle */}
                                                <div className="text-neutral-600 group-hover:text-neutral-400 transition-colors">
                                                    <GripVertical className="w-5 h-5" />
                                                </div>

                                                {/* Position Number */}
                                                <span className="w-6 text-center text-xs font-bold text-neutral-500">
                                                    {index + 1}
                                                </span>

                                                {/* Song Cover */}
                                                <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={song.cover}
                                                        alt={song.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onPlayFromQueue(song.id);
                                                        }}
                                                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Play className="w-5 h-5 fill-current text-white" />
                                                    </button>
                                                </div>

                                                {/* Song Info */}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-sm truncate">{song.title}</h4>
                                                    <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest truncate">
                                                        {song.artist}
                                                    </p>
                                                </div>

                                                {/* Source Badge */}
                                                {queueItem.source !== 'manual' && (
                                                    <span className="text-[9px] px-2 py-1 bg-pink-500/20 text-pink-400 rounded-full font-black uppercase tracking-wider">
                                                        {queueItem.source}
                                                    </span>
                                                )}

                                                {/* Remove Button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onRemoveFromQueue(queueItem.id);
                                                    }}
                                                    className="p-2 text-neutral-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-xl hover:bg-red-500/10"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </Reorder.Item>
                                        );
                                    })}
                                </Reorder.Group>
                            )}
                        </div>

                        {/* Footer */}
                        {currentSongId && (
                            <div className="border-t border-white/10 p-4">
                                <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mb-2">
                                    Now Playing
                                </p>
                                {(() => {
                                    const currentSong = getSong(currentSongId);
                                    if (!currentSong) return null;
                                    return (
                                        <div className="flex items-center gap-3 bg-pink-500/10 border border-pink-500/20 rounded-2xl p-3">
                                            <img
                                                src={currentSong.cover}
                                                alt={currentSong.title}
                                                className="w-12 h-12 rounded-xl object-cover"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-sm truncate text-pink-500">{currentSong.title}</h4>
                                                <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest truncate">
                                                    {currentSong.artist}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default QueuePanel;
