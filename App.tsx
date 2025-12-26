
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play, Pause, SkipForward, SkipBack, Heart,
  Music, ListMusic, Search, Flame,
  Sparkles, X, Shuffle, Repeat,
  ArrowRight,
  Volume2,
  ListOrdered,
  Library,
  Keyboard,
  Mic2,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Song, SmartPlaylistType } from './types';
import { INITIAL_SONGS, BAND_MEMBERS, SONGS_VERSION } from './constants';
import { usePlaylist } from './contexts/PlaylistContext';
import Visualizer from './components/Visualizer';
import ThreeDCard from './components/ThreeDCard';
import VolumeControl from './components/VolumeControl';
import QueuePanel from './components/QueuePanel';
import PlaylistPanel from './components/PlaylistPanel';
import CreatePlaylistModal from './components/CreatePlaylistModal';
import KeyboardShortcutsOverlay from './components/KeyboardShortcutsOverlay';
import SetlistView from './components/SetlistView';
import AddToPlaylistDropdown from './components/AddToPlaylistDropdown';
import FocusedLibraryView from './components/FocusedLibraryView';

const HeartParticle: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <motion.div
    initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
    animate={{
      opacity: 0,
      scale: [0, 1.5, 0.5],
      x: (Math.random() - 0.5) * 200,
      y: (Math.random() - 0.5) * 200,
      rotate: Math.random() * 360
    }}
    transition={{ duration: 0.8 }}
    className="absolute pointer-events-none text-pink-500 z-[1000]"
    style={{ left: x, top: y }}
  >
    <Heart className="w-4 h-4 fill-current" />
  </motion.div>
);

const App: React.FC = () => {
  // ============================================
  // CORE STATE
  // ============================================
  const [songs, setSongs] = useState<Song[]>(() => {
    const saved = localStorage.getItem('3h_songs_v4');
    const savedVersion = localStorage.getItem('3h_songs_version');

    if (saved && savedVersion === SONGS_VERSION) {
      return JSON.parse(saved);
    }

    localStorage.setItem('3h_songs_version', SONGS_VERSION);
    return INITIAL_SONGS;
  });
  const [activeSongId, setActiveSongId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [particles, setParticles] = useState<{ id: number, x: number, y: number }[]>([]);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // ============================================
  // PLAYLIST CONTEXT
  // ============================================
  const {
    playlists,
    createPlaylist,
    deletePlaylist,
    renamePlaylist,
    addToPlaylist,
    queue,
    addToQueue,
    removeFromQueue,
    clearQueue,
    reorderQueue,
    popQueue,
    addToHistory,
    volume,
    setVolume,
    isMuted,
    toggleMute,
    isSetlistMode,
    toggleSetlistMode,
    setlistNotes,
    updateSetlistNote,
    activePlaylistId,
    setActivePlaylistId,
  } = usePlaylist();

  // ============================================
  // UI STATE
  // ============================================
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isPlaylistPanelOpen, setIsPlaylistPanelOpen] = useState(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [isKeyboardShortcutsOpen, setIsKeyboardShortcutsOpen] = useState(false);
  const [isFocusedLibraryOpen, setIsFocusedLibraryOpen] = useState(false);
  const [smartPlaylistView, setSmartPlaylistView] = useState<SmartPlaylistType | null>(null);

  // ============================================
  // REFS
  // ============================================
  const experienceRef = useRef<HTMLDivElement>(null);
  const memberDetailRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ============================================
  // DERIVED STATE
  // ============================================
  const activeSong = songs.find(s => s.id === activeSongId);
  const selectedMember = BAND_MEMBERS.find(m => m.id === selectedMemberId);

  // ============================================
  // SMART PLAYLIST GENERATION
  // ============================================
  const getSmartPlaylistSongs = useCallback((type: SmartPlaylistType): Song[] => {
    switch (type) {
      case 'most-played':
        return [...songs].sort((a, b) => b.playCount - a.playCount).slice(0, 20);
      case 'recently-played':
        // Would use playHistory here, for now just return last played based on order
        return songs.slice(0, 10);
      case 'favorites':
        return songs.filter(s => s.isFavorite);
      case 'discover':
        return [...songs].filter(s => s.playCount < 3).slice(0, 15);
      default:
        return [];
    }
  }, [songs]);

  // ============================================
  // EFFECTS
  // ============================================

  // Persist songs
  useEffect(() => {
    localStorage.setItem('3h_songs_v4', JSON.stringify(songs));
  }, [songs]);

  // Focus search input
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  // Apply volume to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted, activeSongId]);

  // Play/Pause control
  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play().catch(() => setIsPlaying(false));
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying, activeSongId]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextSong();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevSong();
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.1));
          break;
        case 'm':
        case 'M':
          toggleMute();
          break;
        case 's':
        case 'S':
          setIsShuffle(prev => !prev);
          break;
        case 'r':
        case 'R':
          setIsRepeat(prev => !prev);
          break;
        case 'q':
        case 'Q':
          setIsQueueOpen(prev => !prev);
          setIsPlaylistPanelOpen(false);
          setIsVaultOpen(false);
          break;
        case 'p':
        case 'P':
          setIsPlaylistPanelOpen(prev => !prev);
          setIsQueueOpen(false);
          setIsVaultOpen(false);
          break;
        case 'l':
        case 'L':
          setIsVaultOpen(prev => !prev);
          setIsQueueOpen(false);
          setIsPlaylistPanelOpen(false);
          break;
        case 'g':
        case 'G':
          toggleSetlistMode();
          break;
        case 'f':
        case 'F':
          if (activeSongId) {
            setSongs(prev => prev.map(s =>
              s.id === activeSongId ? { ...s, isFavorite: !s.isFavorite } : s
            ));
          }
          break;
        case '?':
          setIsKeyboardShortcutsOpen(prev => !prev);
          break;
        case 'Escape':
          setIsQueueOpen(false);
          setIsPlaylistPanelOpen(false);
          setIsVaultOpen(false);
          setIsSearchOpen(false);
          setIsKeyboardShortcutsOpen(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [volume, activeSongId, toggleMute, setVolume, toggleSetlistMode]);

  // ============================================
  // HANDLERS
  // ============================================

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (!activeSongId && songs.length > 0) {
      setActiveSongId(songs[0].id);
      setIsPlaying(true);
      return;
    }
    setIsPlaying(!isPlaying);
  };

  const handleSongSelect = (id: string) => {
    if (activeSongId === id) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveSongId(id);
      setIsPlaying(true);
      setCurrentTime(0);
      setSongs(prev => prev.map(s => s.id === id ? { ...s, playCount: s.playCount + 1 } : s));
      addToHistory(id);
      setIsVaultOpen(false);
      setIsSearchOpen(false);
    }
  };

  const SongCover: React.FC<{ src: string; alt: string; className: string }> = ({ src, alt, className }) => {
    const [error, setError] = useState(false);

    if (error || !src) {
      return (
        <div className={`${className} bg-neutral-900 flex flex-col items-center justify-center p-4 border border-white/5`}>
          <Music className="w-1/2 h-1/2 text-pink-500/20" />
        </div>
      );
    }

    return (
      <img
        src={src}
        alt={alt}
        className={className}
        onError={() => setError(true)}
      />
    );
  };

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const song = songs.find(s => s.id === id);
    if (song && !song.isFavorite) {
      const newParticles = Array.from({ length: 8 }).map((_, i) => ({
        id: Date.now() + i,
        x: e.clientX,
        y: e.clientY
      }));
      setParticles(prev => [...prev, ...newParticles]);
      setTimeout(() => setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id))), 1000);
    }
    setSongs(prev => prev.map(s => s.id === id ? { ...s, isFavorite: !s.isFavorite } : s));
  };

  const nextSong = () => {
    // Check queue first
    const nextQueueItem = queue.length > 0 ? popQueue() : null;
    if (nextQueueItem) {
      handleSongSelect(nextQueueItem);
      return;
    }

    if (isRepeat && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }

    if (isShuffle) {
      const otherSongs = songs.filter(s => s.id !== activeSongId);
      const randomSong = otherSongs[Math.floor(Math.random() * otherSongs.length)];
      handleSongSelect(randomSong.id);
      return;
    }

    const currentIndex = songs.findIndex(s => s.id === activeSongId);
    const next = songs[(currentIndex + 1) % songs.length];
    handleSongSelect(next.id);
  };

  const prevSong = () => {
    const currentIndex = songs.findIndex(s => s.id === activeSongId);
    const prev = songs[(currentIndex - 1 + songs.length) % songs.length];
    handleSongSelect(prev.id);
  };

  const handleSeek = (e: React.MouseEvent | React.TouchEvent) => {
    if (!audioRef.current || !progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    let clientX = 0;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = (e as React.MouseEvent).clientX;
    }
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    audioRef.current.currentTime = percentage * duration;
    setCurrentTime(percentage * duration);
  };

  const handleAddToQueue = (songId: string) => {
    addToQueue(songId);
  };

  const handleSelectSmartPlaylist = (type: SmartPlaylistType) => {
    setSmartPlaylistView(type);
    setIsPlaylistPanelOpen(false);
  };

  const handleSelectPlaylist = (playlistId: string) => {
    setActivePlaylistId(playlistId);
    setIsPlaylistPanelOpen(false);
  };

  const handleCreatePlaylist = (name: string, description?: string) => {
    createPlaylist(name, description);
  };

  const closeAllPanels = () => {
    setIsQueueOpen(false);
    setIsPlaylistPanelOpen(false);
    setIsVaultOpen(false);
    setIsSearchOpen(false);
  };

  const filteredSongs = songs.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()));

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-[#060606] text-white selection:bg-pink-500/30 overflow-x-hidden pb-48 lg:pb-56">

      {/* Burst Particles */}
      <AnimatePresence>
        {particles.map(p => <HeartParticle key={p.id} x={p.x} y={p.y} />)}
      </AnimatePresence>

      {/* FLOATING ACTION BUTTONS */}
      <div className="fixed top-6 left-6 z-[300] flex flex-col gap-3">
        <button
          onClick={() => { setIsVaultOpen(!isVaultOpen); closeAllPanels(); setIsVaultOpen(!isVaultOpen); }}
          className={`w-14 h-14 backdrop-blur-2xl border rounded-2xl flex items-center justify-center shadow-2xl active:scale-90 transition-all ${isVaultOpen ? 'bg-pink-500/20 border-pink-500/50 text-pink-500' : 'bg-white/5 border-white/10 text-white hover:bg-white/20 hover:border-white/30'
            }`}
          aria-label="Toggle Vault"
          title="Library (L)"
        >
          {isVaultOpen ? <X className="w-6 h-6" /> : <ListMusic className="w-6 h-6" />}
        </button>

        <button
          onClick={() => { closeAllPanels(); setIsPlaylistPanelOpen(!isPlaylistPanelOpen); }}
          className={`w-14 h-14 backdrop-blur-2xl border rounded-2xl flex items-center justify-center shadow-2xl active:scale-90 transition-all ${isPlaylistPanelOpen ? 'bg-pink-500/20 border-pink-500/50 text-pink-500' : 'bg-white/5 border-white/10 text-white hover:bg-white/20 hover:border-white/30'
            }`}
          aria-label="Toggle Playlists"
          title="Playlists (P)"
        >
          <Library className="w-6 h-6" />
        </button>
      </div>

      <div className="fixed top-6 right-6 z-[300] flex flex-col gap-3">
        <button
          onClick={() => { closeAllPanels(); setIsSearchOpen(!isSearchOpen); }}
          className={`w-14 h-14 backdrop-blur-2xl border rounded-2xl flex items-center justify-center shadow-2xl active:scale-90 transition-all ${isSearchOpen ? 'bg-pink-500/20 border-pink-500/50 text-pink-500' : 'bg-white/5 border-white/10 text-white hover:bg-white/20 hover:border-white/30'
            }`}
          aria-label="Toggle Search"
        >
          {isSearchOpen ? <X className="w-6 h-6" /> : <Search className="w-6 h-6" />}
        </button>

        <button
          onClick={() => { closeAllPanels(); setIsQueueOpen(!isQueueOpen); }}
          className={`w-14 h-14 backdrop-blur-2xl border rounded-2xl flex items-center justify-center shadow-2xl active:scale-90 transition-all relative ${isQueueOpen ? 'bg-pink-500/20 border-pink-500/50 text-pink-500' : 'bg-white/5 border-white/10 text-white hover:bg-white/20 hover:border-white/30'
            }`}
          aria-label="Toggle Queue"
          title="Queue (Q)"
        >
          <ListOrdered className="w-6 h-6" />
          {queue.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 rounded-full text-[10px] font-bold flex items-center justify-center">
              {queue.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setIsKeyboardShortcutsOpen(true)}
          className="w-14 h-14 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl active:scale-90 transition-all hover:bg-white/20 hover:border-white/30"
          aria-label="Keyboard Shortcuts"
          title="Keyboard Shortcuts (?)"
        >
          <Keyboard className="w-6 h-6" />
        </button>

        <button
          onClick={toggleSetlistMode}
          className={`w-14 h-14 backdrop-blur-2xl border rounded-2xl flex items-center justify-center shadow-2xl active:scale-90 transition-all ${isSetlistMode ? 'bg-orange-500/20 border-orange-500/50 text-orange-500' : 'bg-white/5 border-white/10 text-white hover:bg-white/20 hover:border-white/30'
            }`}
          aria-label="Toggle Setlist Mode"
          title="Setlist/Gig Mode (G)"
        >
          <Mic2 className="w-6 h-6" />
        </button>
      </div>

      {activeSong && (
        <audio
          ref={audioRef}
          src={activeSong.url}
          onEnded={nextSong}
          onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)}
          onLoadedMetadata={() => {
            setDuration(audioRef.current?.duration || 0);
            if (audioRef.current) {
              audioRef.current.volume = isMuted ? 0 : volume;
            }
          }}
          className="hidden"
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-[100] bg-[#060606]/60 backdrop-blur-3xl border-b border-white/5 px-6 py-6 transition-all duration-300">
        <div className="max-w-[1400px] mx-auto flex items-center justify-center">
          <div className="flex flex-col items-center">
            <h1 className="font-sync text-2xl md:text-3xl font-bold tracking-tighter uppercase leading-none">3rd Harmonik</h1>
            <p className="text-[10px] text-pink-500 font-black tracking-[0.5em] uppercase mt-2">Aljay • Louie • Anthony • Clyde</p>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(40px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            className="fixed inset-0 z-[250] bg-black/80 p-6 md:p-20 overflow-y-auto"
          >
            <div className="max-w-4xl mx-auto pt-24">
              <div className="relative mb-16">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 text-pink-500" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="SEARCH FREQUENCIES..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border-b-2 border-pink-500/30 p-8 pl-20 text-3xl md:text-5xl font-sync font-bold focus:outline-none focus:border-pink-500 transition-all uppercase placeholder:text-neutral-800"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-40">
                {filteredSongs.map((song) => (
                  <motion.div
                    key={song.id}
                    layout
                    className="group p-6 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center gap-6 cursor-pointer hover:bg-pink-500/10 hover:border-pink-500/30 transition-all"
                  >
                    <div onClick={() => handleSongSelect(song.id)} className="flex items-center gap-6 flex-1 min-w-0">
                      <SongCover src={song.cover} alt={song.title} className="w-20 h-20 rounded-2xl object-cover shadow-xl" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold truncate group-hover:text-pink-500 transition-colors">{song.title}</h3>
                        <p className="text-xs font-black uppercase text-neutral-500 tracking-widest">{song.album}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToQueue(song.id);
                        }}
                        className="p-2 text-neutral-500 hover:text-pink-500 hover:bg-pink-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        title="Add to Queue"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                      <div
                        onClick={() => handleSongSelect(song.id)}
                        className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-white/10"
                      >
                        <Play className="w-5 h-5 fill-current text-pink-500" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Queue Panel */}
      <QueuePanel
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
        queue={queue}
        songs={songs}
        currentSongId={activeSongId}
        onReorderQueue={reorderQueue}
        onRemoveFromQueue={removeFromQueue}
        onClearQueue={clearQueue}
        onPlayFromQueue={handleSongSelect}
      />

      {/* Playlist Panel */}
      <PlaylistPanel
        isOpen={isPlaylistPanelOpen}
        onClose={() => setIsPlaylistPanelOpen(false)}
        playlists={playlists}
        songs={songs}
        onCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
        onDeletePlaylist={deletePlaylist}
        onRenamePlaylist={renamePlaylist}
        onSelectPlaylist={handleSelectPlaylist}
        onSelectSmartPlaylist={handleSelectSmartPlaylist}
        activePlaylistId={activePlaylistId}
      />

      {/* Create Playlist Modal */}
      <CreatePlaylistModal
        isOpen={isCreatePlaylistOpen}
        onClose={() => setIsCreatePlaylistOpen(false)}
        onCreatePlaylist={handleCreatePlaylist}
      />

      {/* Keyboard Shortcuts Overlay */}
      <KeyboardShortcutsOverlay
        isOpen={isKeyboardShortcutsOpen}
        onClose={() => setIsKeyboardShortcutsOpen(false)}
      />

      {/* Setlist View */}
      <SetlistView
        isOpen={isSetlistMode}
        onClose={toggleSetlistMode}
        songs={songs}
        currentSongId={activeSongId}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        onNextSong={nextSong}
        onPrevSong={prevSong}
        setlistNotes={setlistNotes}
        onUpdateNote={updateSetlistNote}
        onSelectSong={handleSongSelect}
      />

      {/* Focused Library View */}
      <FocusedLibraryView
        isOpen={isFocusedLibraryOpen}
        onClose={() => setIsFocusedLibraryOpen(false)}
        songs={songs}
        activeSongId={activeSongId}
        isPlaying={isPlaying}
        onSelectSong={(id) => {
          handleSongSelect(id);
          setIsFocusedLibraryOpen(false);
        }}
        onToggleFavorite={toggleFavorite}
        onAddToQueue={handleAddToQueue}
        playlists={playlists}
        onAddToPlaylist={addToPlaylist}
      />

      <main className="max-w-[1400px] mx-auto p-4 md:p-8 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start justify-center">

          {/* Sidebar Vault */}
          <AnimatePresence>
            {(isVaultOpen || (typeof window !== 'undefined' && window.innerWidth >= 1024 && !isSearchOpen)) && (
              <motion.aside
                initial={typeof window !== 'undefined' && window.innerWidth < 1024 ? { x: '-100%', opacity: 0 } : { x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={typeof window !== 'undefined' && window.innerWidth < 1024 ? { x: '-100%', opacity: 0 } : { x: -20, opacity: 0 }}
                className={`fixed lg:sticky top-0 lg:top-32 left-0 h-full lg:h-[calc(100vh-280px)] z-[280] lg:z-10 lg:col-span-4 w-[90vw] lg:w-full bg-[#0a0a0a] lg:bg-transparent border-r lg:border-none border-white/5 p-6 lg:p-0 overflow-y-auto lg:overflow-visible shadow-3xl lg:shadow-none`}
              >
                <div className="bg-neutral-900/40 lg:backdrop-blur-3xl border border-white/5 rounded-[3rem] p-6 lg:p-8 flex flex-col gap-6 lg:h-full shadow-2xl overflow-hidden">
                  <div className="flex items-center justify-between shrink-0">
                    <h2 className="text-xl font-sync font-bold flex items-center gap-3">
                      <ListMusic className="w-5 h-5 text-pink-500" />
                      The Vault
                    </h2>
                  </div>

                  <Reorder.Group
                    axis="y"
                    values={songs}
                    onReorder={setSongs}
                    className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar pb-32"
                  >
                    {songs.map((song, index) => (
                      <Reorder.Item
                        key={song.id}
                        value={song}
                        className={`group relative p-3 rounded-[1.5rem] border transition-all cursor-pointer flex items-center gap-4 ${activeSongId === song.id
                          ? 'bg-pink-500/10 border-pink-500/30'
                          : 'bg-white/5 border-transparent hover:border-white/10 hover:bg-white/10'
                          }`}
                        onClick={() => handleSongSelect(song.id)}
                      >
                        <span className="w-6 text-center text-xs font-bold text-neutral-500 shrink-0">{index + 1}</span>
                        <div className="relative w-12 h-12 flex-shrink-0">
                          <SongCover src={song.cover} alt={song.title} className="w-full h-full object-cover rounded-xl" />
                          {activeSongId === song.id && isPlaying && (
                            <div className="absolute inset-0 bg-pink-500/30 flex items-center justify-center rounded-xl backdrop-blur-[1px]">
                              <div className="flex gap-1 items-end h-4">
                                {[0, 1, 2].map(i => (
                                  <motion.div key={i} animate={{ height: ['30%', '100%', '30%'] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }} className="w-1 bg-white rounded-full" />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm truncate">{song.title}</h3>
                          <p className="text-[9px] text-neutral-500 font-black uppercase tracking-widest">{song.artist}</p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToQueue(song.id);
                            }}
                            className="p-1.5 text-neutral-500 hover:text-pink-500 transition-colors"
                            title="Add to Queue"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <button onClick={(e) => toggleFavorite(e, song.id)} className={`p-2 transition-colors ${song.isFavorite ? 'text-pink-500' : 'text-neutral-600 hover:text-white'}`}>
                          <Heart className={`w-5 h-5 ${song.isFavorite ? 'fill-current' : ''}`} />
                        </button>
                      </Reorder.Item>
                    ))}
                  </Reorder.Group>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Center Stage Player */}
          <section className={`lg:col-span-8 flex flex-col gap-16 transition-all duration-500 ${isVaultOpen ? 'opacity-10 blur-xl pointer-events-none' : ''}`}>

            <div className="bg-neutral-900/60 border border-white/5 rounded-[4rem] p-8 md:p-16 lg:p-24 relative overflow-hidden group shadow-3xl min-h-[650px] flex flex-col items-center justify-center backdrop-blur-md">
              {/* Ambient Background Visualizer */}
              <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <Visualizer isPlaying={isPlaying} color={activeSong?.accentColor || '#ec4899'} />
              </div>

              <AnimatePresence mode="wait">
                {activeSong ? (
                  <motion.div
                    key={activeSongId}
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: -10 }}
                    className="flex flex-col items-center w-full relative z-10"
                  >
                    <div className="relative w-64 h-64 md:w-80 md:h-80 lg:w-[480px] lg:h-[480px] mb-14 perspective-[2000px]">
                      <motion.div
                        animate={isPlaying ? {
                          rotateZ: 360,
                          rotateY: [0, 15, 0, -15, 0],
                          rotateX: [0, -10, 0, 10, 0]
                        } : { rotateZ: 0, rotateY: 0, rotateX: 0 }}
                        transition={{
                          rotateZ: { duration: 20, repeat: Infinity, ease: "linear" },
                          rotateY: { duration: 10, repeat: Infinity, ease: "easeInOut" },
                          rotateX: { duration: 15, repeat: Infinity, ease: "easeInOut" }
                        }}
                        style={{ transformStyle: "preserve-3d" }}
                        className="w-full h-full relative"
                      >
                        <div className="absolute -inset-10 bg-pink-500/15 blur-[120px] rounded-full opacity-60" />
                        <SongCover
                          src={activeSong.cover}
                          className={`w-full h-full object-cover rounded-full shadow-[0_50px_100px_rgba(0,0,0,0.9)] border-8 border-white/10 transition-all duration-1000 ease-in-out p-4 ${isPlaying ? 'border-dashed border-pink-500/40' : ''}`}
                          alt="Cover"
                        />
                        <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none z-20" />
                        <div className="absolute inset-0 rounded-full border border-white/5 pointer-events-none" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-[#060606] rounded-full border-4 border-white/10 shadow-inner z-30 flex items-center justify-center">
                          <div className="w-4 h-4 bg-neutral-800 rounded-full" />
                        </div>
                      </motion.div>
                    </div>

                    <div className="text-center mb-12 px-4 max-w-2xl">
                      <h2 className="text-4xl md:text-6xl lg:text-7xl font-sync font-bold tracking-tighter mb-4 leading-tight">{activeSong.title}</h2>
                      <p className="text-pink-500 font-black tracking-[0.6em] uppercase text-xs md:text-sm">{activeSong.artist} &bull; {activeSong.album}</p>
                    </div>

                    {/* Add to Playlist Dropdown */}
                    <div className="mb-8">
                      <AddToPlaylistDropdown
                        playlists={playlists}
                        songId={activeSong.id}
                        onAddToPlaylist={addToPlaylist}
                        onCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
                      <button
                        onClick={() => setIsShuffle(!isShuffle)}
                        className={`p-2 transition-all hover:scale-110 ${isShuffle ? 'text-pink-500' : 'text-neutral-500 hover:text-white'}`}
                      >
                        <Shuffle className="w-6 h-6" />
                      </button>
                      <button onClick={prevSong} className="p-3 text-neutral-400 hover:text-white transition-all hover:scale-125"><SkipBack className="w-10 h-10 fill-current" /></button>
                      <button
                        onClick={togglePlay}
                        className="w-24 h-24 bg-white text-black rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.15)] hover:scale-110 active:scale-95 transition-all"
                      >
                        {isPlaying ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current translate-x-1" />}
                      </button>
                      <button onClick={nextSong} className="p-3 text-neutral-400 hover:text-white transition-all hover:scale-125"><SkipForward className="w-10 h-10 fill-current" /></button>
                      <button
                        onClick={() => setIsRepeat(!isRepeat)}
                        className={`p-2 transition-all hover:scale-110 ${isRepeat ? 'text-pink-500' : 'text-neutral-500 hover:text-white'}`}
                      >
                        <Repeat className="w-6 h-6" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center relative z-10 p-12">
                    <Music className="w-32 h-32 text-pink-500/10 mx-auto mb-10 animate-pulse" />
                    <h2 className="text-5xl md:text-7xl font-sync font-bold tracking-tighter uppercase mb-8">Select Track</h2>
                    <button onClick={() => setIsFocusedLibraryOpen(true)} className="px-14 py-6 bg-white text-black rounded-full font-sync font-bold text-xs tracking-[0.3em] hover:bg-pink-500 hover:text-white transition-all shadow-2xl">OPEN LIBRARY</button>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Content Sections */}
            <div ref={experienceRef} className="scroll-mt-32">
              <AnimatePresence mode="wait">
                {activeSong && (
                  <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className={`grid gap-10 ${['huling-sandali', 'bulong', 'jopay', 'sa-ngalan-ng-pagibig'].includes(activeSong.id) ? '' : 'md:grid-cols-2'}`}>
                    {/* Only show MAKING OF for original songs, not covers */}
                    {!['huling-sandali', 'bulong', 'jopay', 'sa-ngalan-ng-pagibig'].includes(activeSong.id) && (
                      <div className="bg-neutral-900/40 border border-white/5 rounded-[3.5rem] p-10 md:p-14 backdrop-blur-sm">
                        <h3 className="text-xl font-sync font-bold mb-10 flex items-center gap-4">
                          <Sparkles className="text-indigo-400 w-5 h-5" />
                          MAKING OF
                        </h3>
                        <ul className="space-y-8">
                          {activeSong.funFacts.map((fact, i) => (
                            <li key={i} className="flex gap-6 text-neutral-400 text-sm md:text-base leading-relaxed group">
                              <span className="shrink-0 w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-xs font-black text-pink-500 border border-white/10 group-hover:border-pink-500/30 transition-colors">0{i + 1}</span>
                              {fact}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="bg-neutral-900/40 border border-white/5 rounded-[3.5rem] p-10 md:p-14 backdrop-blur-sm">
                      <h3 className="text-xl font-sync font-bold mb-10 flex items-center gap-4">
                        <Music className="text-pink-400 w-5 h-5" />
                        LYRICS
                      </h3>
                      <div className="space-y-2 md:space-y-3 max-h-[500px] md:max-h-[650px] overflow-y-auto pr-4 custom-scrollbar">
                        {activeSong.lyrics.map((line, i) => (
                          line.trim() === "" ? (
                            <div key={i} className="h-4 md:h-6" />
                          ) : (
                            <p key={i} className="text-base md:text-lg font-sync font-bold text-neutral-300 italic leading-relaxed hover:text-pink-500 transition-colors cursor-default">
                              {line}
                            </p>
                          )
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Band Personnel Section */}
              <div className="py-32 md:py-48">
                <div className="text-center mb-24 px-4">
                  <h2 className="text-6xl md:text-9xl font-sync font-bold tracking-tighter leading-none">3rd Harmonik</h2>
                </div>

                <div className="flex flex-wrap justify-center items-center gap-10 lg:gap-14 overflow-visible">
                  {BAND_MEMBERS.map((member) => (
                    <ThreeDCard
                      key={member.id}
                      member={member}
                      isSelected={selectedMemberId === member.id}
                      onClick={() => {
                        setSelectedMemberId(member.id);
                        setTimeout(() => memberDetailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
                      }}
                    />
                  ))}
                </div>

                <AnimatePresence>
                  {selectedMember && (
                    <motion.div
                      ref={memberDetailRef}
                      initial={{ opacity: 0, scale: 0.98, y: 50 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98, y: 50 }}
                      className="mt-32 bg-neutral-900/60 backdrop-blur-3xl border border-white/10 rounded-[5rem] p-10 md:p-24 relative overflow-hidden shadow-3xl"
                    >
                      <div className="grid lg:grid-cols-2 gap-20 relative z-10 items-center">
                        <div className="relative group">
                          <div className="absolute -inset-4 bg-pink-500/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                          <img src={selectedMember.photo} className="w-full h-[400px] md:h-[550px] object-cover rounded-[4rem] shadow-3xl transition-all duration-500 relative z-10 hover:scale-[1.02]" alt="Band" />
                          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white text-black flex items-center justify-center rounded-full text-4xl font-sync font-bold shadow-3xl z-20">
                            {selectedMember.name.charAt(0)}
                          </div>

                          {selectedMember.extraPhotos && selectedMember.extraPhotos.length > 0 && (
                            <div className="mt-8 relative z-10">
                              <p className="text-[10px] text-neutral-500 font-black uppercase mb-4 tracking-widest">Gallery</p>
                              <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                                {selectedMember.extraPhotos.map((photo, index) => (
                                  <motion.div
                                    key={index}
                                    whileHover={{ scale: 1.05, rotateY: 5 }}
                                    className="flex-shrink-0 w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-2 border-white/10 hover:border-pink-500/50 transition-all duration-300 shadow-xl cursor-pointer"
                                    style={{ transformStyle: "preserve-3d" }}
                                  >
                                    <img
                                      src={photo}
                                      alt={`${selectedMember.name} photo ${index + 1}`}
                                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                                      loading="lazy"
                                    />
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col justify-center">
                          <div className="mb-12">
                            <span className="text-pink-500 font-black text-[11px] uppercase tracking-[0.6em] mb-4 block">FILE: Personnel_Dossier</span>
                            <h4 className="text-6xl md:text-8xl font-sync font-bold tracking-tighter leading-none mb-6">{selectedMember.name}</h4>
                            <p className="text-xl md:text-2xl font-sync font-black text-neutral-400 uppercase tracking-widest">{selectedMember.role}</p>
                          </div>
                          <p className="text-xl md:text-2xl text-neutral-300 font-medium italic mb-12 leading-relaxed opacity-90">"{selectedMember.bio}"</p>
                          <div className="grid grid-cols-2 gap-8 mb-14">
                            <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10">
                              <p className="text-[10px] text-neutral-500 font-black uppercase mb-2 tracking-widest">Height Index</p>
                              <p className="text-3xl font-sync font-bold">{selectedMember.height}</p>
                            </div>
                            <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10">
                              <p className="text-[10px] text-neutral-500 font-black uppercase mb-2 tracking-widest">Favorite Song</p>
                              <p className="text-xl font-sync font-bold">{selectedMember.favoriteSong}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const tid = songs.find(s => s.title === selectedMember.favoriteSong)?.id;
                              if (tid) handleSongSelect(tid);
                            }}
                            className="w-full py-8 bg-white text-black rounded-full font-sync font-bold text-sm tracking-[0.3em] hover:bg-pink-500 hover:text-white transition-all shadow-2xl flex items-center justify-center gap-4 group"
                          >
                            <Play className="w-6 h-6 fill-current" />
                            PLAY FAVORITE SONG
                            <ArrowRight className="w-8 h-8 group-hover:translate-x-3 transition-transform text-pink-500 group-hover:text-white" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* PLAYER FOOTER */}
      <footer className="fixed bottom-0 left-0 right-0 z-[200] bg-black/80 backdrop-blur-3xl border-t border-white/10 shadow-[0_-20px_80px_rgba(0,0,0,0.9)]">
        {/* Progress Bar */}
        <div
          ref={progressBarRef}
          className="h-1.5 w-full bg-white/5 cursor-pointer relative group touch-none"
          onMouseDown={handleSeek}
          onTouchStart={handleSeek}
        >
          <motion.div
            style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
            className="h-full bg-gradient-to-r from-pink-500 to-indigo-500 relative transition-all duration-150 ease-linear"
          >
            <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-[0_0_20px_white] scale-0 group-hover:scale-100 transition-transform duration-300" />
          </motion.div>
        </div>

        <div className="px-6 md:px-12 py-6 md:py-8 flex items-center justify-between gap-6 md:gap-10 max-w-[1600px] mx-auto">
          {activeSong ? (
            <>
              {/* Active Song Info */}
              <div className="flex items-center gap-6 min-w-[60px] md:min-w-[250px]">
                <SongCover src={activeSong.cover} className="w-14 h-14 md:w-20 md:h-20 rounded-2xl shadow-2xl border border-white/10" alt="Current" />
                <div className="hidden sm:block overflow-hidden">
                  <h4 className="font-bold text-lg md:text-xl truncate leading-none mb-2 tracking-tight">{activeSong.title}</h4>
                  <p className="text-[10px] text-pink-500 font-black uppercase tracking-[0.4em] truncate opacity-80">{activeSong.artist}</p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex-1 flex flex-col items-center gap-4">
                <div className="flex items-center gap-6 md:gap-10">
                  <button onClick={() => setIsShuffle(!isShuffle)} className={`p-2 transition-all hover:scale-125 ${isShuffle ? 'text-pink-500' : 'text-neutral-500 hover:text-white'}`}><Shuffle className="w-5 h-5 md:w-6 md:h-6" /></button>
                  <button onClick={prevSong} className="text-neutral-400 hover:text-white transition-all hover:scale-125 p-1"><SkipBack className="w-6 h-6 md:w-8 md:h-8 fill-current" /></button>
                  <button onClick={togglePlay} className="w-14 h-14 md:w-20 md:h-20 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-2xl">
                    {isPlaying ? <Pause className="w-6 h-6 md:w-9 md:h-9 fill-current" /> : <Play className="w-6 h-6 md:w-9 md:h-9 fill-current translate-x-1" />}
                  </button>
                  <button onClick={nextSong} className="text-neutral-400 hover:text-white transition-all hover:scale-125 p-1"><SkipForward className="w-6 h-6 md:w-8 md:h-8 fill-current" /></button>
                  <button onClick={() => setIsRepeat(!isRepeat)} className={`p-2 transition-all hover:scale-125 ${isRepeat ? 'text-pink-500' : 'text-neutral-500'}`}><Repeat className="w-5 h-5 md:w-6 md:h-6" /></button>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-mono text-neutral-500 tracking-widest opacity-60">
                  <span>{formatTime(currentTime)}</span>
                  <span className="w-1 h-1 bg-white/20 rounded-full" />
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Volume & Actions */}
              <div className="flex items-center gap-4 md:gap-6 min-w-[60px] md:min-w-[250px] justify-end">
                <div className="hidden md:block">
                  <VolumeControl
                    volume={volume}
                    isMuted={isMuted}
                    onVolumeChange={setVolume}
                    onToggleMute={toggleMute}
                  />
                </div>
                <button onClick={(e) => toggleFavorite(e, activeSong.id)} className={`transition-all hover:scale-125 ${activeSong.isFavorite ? 'text-pink-500' : 'text-neutral-500 hover:text-white'}`}>
                  <Heart className={`w-8 h-8 md:w-10 md:h-10 ${activeSong.isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>
            </>
          ) : (
            /* Standby State */
            <div className="flex-1 flex items-center justify-between w-full opacity-40">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center"><Volume2 className="w-7 h-7 text-neutral-600" /></div>
                <div>
                  <h4 className="font-bold text-sm tracking-[0.4em] text-neutral-400 uppercase mb-1">AWAITING FREQUENCY</h4>
                  <p className="text-[10px] text-neutral-600 font-black uppercase tracking-[0.5em]">SELECT FROM THE VAULT OR SEARCH</p>
                </div>
              </div>
              <button onClick={() => setIsFocusedLibraryOpen(true)} className="px-8 py-4 bg-white/5 border border-white/10 rounded-full text-[11px] font-sync font-bold tracking-[0.3em] hover:bg-white/10 transition-all uppercase">LIBRARY ACCESS</button>
            </div>
          )}
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}} />
    </div>
  );
};

export default App;
