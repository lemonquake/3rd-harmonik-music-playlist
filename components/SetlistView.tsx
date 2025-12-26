
import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, SkipForward, SkipBack, Music, Settings, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Song, SetlistNote } from '../types';

interface SetlistViewProps {
    isOpen: boolean;
    onClose: () => void;
    songs: Song[];
    currentSongId: string | null;
    isPlaying: boolean;
    onTogglePlay: () => void;
    onNextSong: () => void;
    onPrevSong: () => void;
    setlistNotes: Record<string, SetlistNote>;
    onUpdateNote: (songId: string, note: Partial<SetlistNote>) => void;
    onSelectSong: (songId: string) => void;
}

const SetlistView: React.FC<SetlistViewProps> = ({
    isOpen,
    onClose,
    songs,
    currentSongId,
    isPlaying,
    onTogglePlay,
    onNextSong,
    onPrevSong,
    setlistNotes,
    onUpdateNote,
    onSelectSong,
}) => {
    const [countdownActive, setCountdownActive] = useState(false);
    const [countdownValue, setCountdownValue] = useState(0);
    const [isEditingNotes, setIsEditingNotes] = useState(false);
    const [editNoteText, setEditNoteText] = useState('');
    const countdownRef = useRef<NodeJS.Timeout | null>(null);

    const currentSong = songs.find(s => s.id === currentSongId);
    const currentNote = currentSongId ? setlistNotes[currentSongId] : null;
    const currentIndex = songs.findIndex(s => s.id === currentSongId);
    const nextSong = currentIndex >= 0 && currentIndex < songs.length - 1 ? songs[currentIndex + 1] : null;

    useEffect(() => {
        if (countdownActive && countdownValue > 0) {
            countdownRef.current = setTimeout(() => {
                setCountdownValue(prev => prev - 1);
            }, 1000);
        } else if (countdownActive && countdownValue === 0) {
            setCountdownActive(false);
            // Auto-advance to next song when countdown ends
            if (nextSong) {
                onNextSong();
            }
        }

        return () => {
            if (countdownRef.current) {
                clearTimeout(countdownRef.current);
            }
        };
    }, [countdownActive, countdownValue, nextSong, onNextSong]);

    const startCountdown = (seconds: number = 10) => {
        setCountdownValue(seconds);
        setCountdownActive(true);
    };

    const stopCountdown = () => {
        setCountdownActive(false);
        setCountdownValue(0);
    };

    const handleSaveNote = () => {
        if (currentSongId) {
            onUpdateNote(currentSongId, { notes: editNoteText });
        }
        setIsEditingNotes(false);
    };

    const startEditingNotes = () => {
        setEditNoteText(currentNote?.notes || '');
        setIsEditingNotes(true);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black z-[700] flex flex-col"
                >
                    {/* Top Bar */}
                    <div className="flex items-center justify-between p-6 border-b border-white/10">
                        <div className="flex items-center gap-4">
                            <span className="text-3xl">🎤</span>
                            <div>
                                <h1 className="text-xl font-sync font-bold">Setlist Mode</h1>
                                <p className="text-xs text-neutral-500 font-black uppercase tracking-widest">
                                    Song {currentIndex + 1} of {songs.length}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-3 text-neutral-500 hover:text-white hover:bg-white/10 rounded-2xl transition-all"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
                        {currentSong ? (
                            <div className="text-center max-w-4xl w-full">
                                {/* Countdown Overlay */}
                                <AnimatePresence>
                                    {countdownActive && (
                                        <motion.div
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.5, opacity: 0 }}
                                            className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-10"
                                        >
                                            <motion.div
                                                key={countdownValue}
                                                initial={{ scale: 1.5, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="text-[200px] font-sync font-bold text-pink-500"
                                            >
                                                {countdownValue}
                                            </motion.div>
                                            <p className="text-2xl text-neutral-500 font-sync">
                                                Next: {nextSong?.title || 'End of Set'}
                                            </p>
                                            <button
                                                onClick={stopCountdown}
                                                className="mt-8 px-8 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold transition-all"
                                            >
                                                Cancel Countdown
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Current Song Display */}
                                <motion.div
                                    key={currentSongId}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-12"
                                >
                                    <h2 className="text-6xl md:text-8xl lg:text-9xl font-sync font-bold tracking-tighter leading-none mb-6">
                                        {currentSong.title}
                                    </h2>
                                    <p className="text-xl md:text-2xl text-pink-500 font-black uppercase tracking-[0.5em]">
                                        {currentSong.artist}
                                    </p>
                                </motion.div>

                                {/* Song Info Pills */}
                                <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
                                    <div className="px-6 py-3 bg-white/10 rounded-2xl flex items-center gap-3">
                                        <span className="text-neutral-500 text-sm font-bold">BPM</span>
                                        <span className="text-2xl font-sync font-bold">
                                            {currentNote?.bpm || '—'}
                                        </span>
                                    </div>
                                    <div className="px-6 py-3 bg-white/10 rounded-2xl flex items-center gap-3">
                                        <span className="text-neutral-500 text-sm font-bold">Key</span>
                                        <span className="text-2xl font-sync font-bold">
                                            {currentNote?.key || '—'}
                                        </span>
                                    </div>
                                    <div className="px-6 py-3 bg-white/10 rounded-2xl flex items-center gap-3">
                                        <span className="text-neutral-500 text-sm font-bold">Duration</span>
                                        <span className="text-2xl font-sync font-bold">
                                            {currentSong.duration}
                                        </span>
                                    </div>
                                </div>

                                {/* Performance Notes */}
                                <div className="mb-12">
                                    {isEditingNotes ? (
                                        <div className="max-w-2xl mx-auto">
                                            <textarea
                                                value={editNoteText}
                                                onChange={(e) => setEditNoteText(e.target.value)}
                                                placeholder="Add performance notes..."
                                                rows={4}
                                                className="w-full bg-white/5 border border-white/20 rounded-2xl p-6 text-lg focus:outline-none focus:border-pink-500/50 resize-none"
                                                autoFocus
                                            />
                                            <div className="flex justify-center gap-4 mt-4">
                                                <button
                                                    onClick={() => setIsEditingNotes(false)}
                                                    className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-sm transition-all"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleSaveNote}
                                                    className="px-6 py-3 bg-pink-500 hover:bg-pink-600 rounded-xl font-bold text-sm transition-all"
                                                >
                                                    Save Notes
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={startEditingNotes}
                                            className="group inline-flex items-center gap-3 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all"
                                        >
                                            {currentNote?.notes ? (
                                                <p className="text-lg text-neutral-300 italic max-w-xl">
                                                    "{currentNote.notes}"
                                                </p>
                                            ) : (
                                                <p className="text-neutral-500">Click to add performance notes</p>
                                            )}
                                            <Edit2 className="w-4 h-4 text-neutral-500 group-hover:text-white transition-colors" />
                                        </button>
                                    )}
                                </div>

                                {/* Controls */}
                                <div className="flex items-center justify-center gap-6">
                                    <button
                                        onClick={onPrevSong}
                                        className="p-4 text-neutral-400 hover:text-white transition-all hover:scale-110"
                                        disabled={currentIndex <= 0}
                                    >
                                        <SkipBack className="w-10 h-10 fill-current" />
                                    </button>

                                    <button
                                        onClick={onTogglePlay}
                                        className="w-24 h-24 bg-white text-black rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all"
                                    >
                                        {isPlaying ? (
                                            <Pause className="w-10 h-10 fill-current" />
                                        ) : (
                                            <Play className="w-10 h-10 fill-current translate-x-1" />
                                        )}
                                    </button>

                                    <button
                                        onClick={onNextSong}
                                        className="p-4 text-neutral-400 hover:text-white transition-all hover:scale-110"
                                        disabled={currentIndex >= songs.length - 1}
                                    >
                                        <SkipForward className="w-10 h-10 fill-current" />
                                    </button>
                                </div>

                                {/* Countdown Button */}
                                <div className="mt-12">
                                    <button
                                        onClick={() => startCountdown(currentNote?.countdownSeconds || 10)}
                                        disabled={!nextSong}
                                        className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-neutral-700 disabled:to-neutral-700 disabled:cursor-not-allowed rounded-2xl font-bold text-sm transition-all"
                                    >
                                        🔥 Start Countdown to Next Song
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <Music className="w-24 h-24 text-neutral-700 mx-auto mb-6" />
                                <h2 className="text-3xl font-sync font-bold mb-4">No Song Selected</h2>
                                <p className="text-neutral-500">Select a song to start your set</p>
                            </div>
                        )}
                    </div>

                    {/* Bottom Song List */}
                    <div className="border-t border-white/10 p-4 bg-black/50 backdrop-blur-xl">
                        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                            {songs.map((song, index) => (
                                <button
                                    key={song.id}
                                    onClick={() => onSelectSong(song.id)}
                                    className={`flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${song.id === currentSongId
                                            ? 'bg-pink-500/20 border border-pink-500/50'
                                            : 'bg-white/5 hover:bg-white/10 border border-transparent'
                                        }`}
                                >
                                    <span className="text-xs font-bold text-neutral-500 w-6">
                                        {index + 1}
                                    </span>
                                    <img
                                        src={song.cover}
                                        alt={song.title}
                                        className="w-10 h-10 rounded-lg object-cover"
                                    />
                                    <div className="text-left">
                                        <p className="font-bold text-sm truncate max-w-[120px]">{song.title}</p>
                                        <p className="text-[10px] text-neutral-500">{song.duration}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SetlistView;
