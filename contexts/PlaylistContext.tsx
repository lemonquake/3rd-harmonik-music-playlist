
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Playlist, QueueItem, PlayHistoryEntry, SetlistNote, Song } from '../types';

// ============================================
// CONTEXT VALUE INTERFACE
// ============================================

interface PlaylistContextValue {
    // Playlists
    playlists: Playlist[];
    createPlaylist: (name: string, description?: string) => Playlist;
    deletePlaylist: (id: string) => void;
    renamePlaylist: (id: string, name: string) => void;
    updatePlaylistDescription: (id: string, description: string) => void;
    addToPlaylist: (playlistId: string, songId: string) => void;
    removeFromPlaylist: (playlistId: string, songId: string) => void;
    reorderPlaylistSongs: (playlistId: string, songIds: string[]) => void;

    // Queue
    queue: QueueItem[];
    addToQueue: (songId: string, source?: QueueItem['source']) => void;
    addMultipleToQueue: (songIds: string[], source?: QueueItem['source']) => void;
    removeFromQueue: (queueItemId: string) => void;
    clearQueue: () => void;
    reorderQueue: (newQueue: QueueItem[]) => void;
    getNextInQueue: () => QueueItem | null;
    popQueue: () => string | null;

    // History
    playHistory: PlayHistoryEntry[];
    addToHistory: (songId: string) => void;
    clearHistory: () => void;

    // Volume & Preferences
    volume: number;
    setVolume: (vol: number) => void;
    isMuted: boolean;
    toggleMute: () => void;

    // Setlist Mode
    isSetlistMode: boolean;
    toggleSetlistMode: () => void;
    setlistNotes: Record<string, SetlistNote>;
    updateSetlistNote: (songId: string, note: Partial<SetlistNote>) => void;

    // Active Playlist Context
    activePlaylistId: string | null;
    setActivePlaylistId: (id: string | null) => void;
}

const PlaylistContext = createContext<PlaylistContextValue | null>(null);

// ============================================
// STORAGE KEYS
// ============================================

const STORAGE_KEYS = {
    PLAYLISTS: '3h_playlists_v1',
    QUEUE: '3h_queue_v1',
    HISTORY: '3h_history_v1',
    VOLUME: '3h_volume_v1',
    MUTED: '3h_muted_v1',
    SETLIST_MODE: '3h_setlist_mode_v1',
    SETLIST_NOTES: '3h_setlist_notes_v1',
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : defaultValue;
    } catch {
        return defaultValue;
    }
};

const saveToStorage = <T,>(key: string, value: T): void => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.warn('Failed to save to localStorage:', e);
    }
};

// ============================================
// PROVIDER COMPONENT
// ============================================

interface PlaylistProviderProps {
    children: ReactNode;
}

export const PlaylistProvider: React.FC<PlaylistProviderProps> = ({ children }) => {
    // Playlists State
    const [playlists, setPlaylists] = useState<Playlist[]>(() =>
        loadFromStorage(STORAGE_KEYS.PLAYLISTS, [])
    );

    // Queue State
    const [queue, setQueue] = useState<QueueItem[]>(() =>
        loadFromStorage(STORAGE_KEYS.QUEUE, [])
    );

    // History State
    const [playHistory, setPlayHistory] = useState<PlayHistoryEntry[]>(() =>
        loadFromStorage(STORAGE_KEYS.HISTORY, [])
    );

    // Volume State
    const [volume, setVolumeState] = useState<number>(() =>
        loadFromStorage(STORAGE_KEYS.VOLUME, 0.7)
    );
    const [isMuted, setIsMuted] = useState<boolean>(() =>
        loadFromStorage(STORAGE_KEYS.MUTED, false)
    );

    // Setlist Mode State
    const [isSetlistMode, setIsSetlistMode] = useState<boolean>(() =>
        loadFromStorage(STORAGE_KEYS.SETLIST_MODE, false)
    );
    const [setlistNotes, setSetlistNotes] = useState<Record<string, SetlistNote>>(() =>
        loadFromStorage(STORAGE_KEYS.SETLIST_NOTES, {})
    );

    // Active Playlist
    const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);

    // ============================================
    // PERSISTENCE EFFECTS
    // ============================================

    useEffect(() => { saveToStorage(STORAGE_KEYS.PLAYLISTS, playlists); }, [playlists]);
    useEffect(() => { saveToStorage(STORAGE_KEYS.QUEUE, queue); }, [queue]);
    useEffect(() => { saveToStorage(STORAGE_KEYS.HISTORY, playHistory); }, [playHistory]);
    useEffect(() => { saveToStorage(STORAGE_KEYS.VOLUME, volume); }, [volume]);
    useEffect(() => { saveToStorage(STORAGE_KEYS.MUTED, isMuted); }, [isMuted]);
    useEffect(() => { saveToStorage(STORAGE_KEYS.SETLIST_MODE, isSetlistMode); }, [isSetlistMode]);
    useEffect(() => { saveToStorage(STORAGE_KEYS.SETLIST_NOTES, setlistNotes); }, [setlistNotes]);

    // ============================================
    // PLAYLIST OPERATIONS
    // ============================================

    const createPlaylist = useCallback((name: string, description?: string): Playlist => {
        const newPlaylist: Playlist = {
            id: generateId(),
            name: name.trim() || 'Untitled Playlist',
            description,
            songIds: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        setPlaylists(prev => [...prev, newPlaylist]);
        return newPlaylist;
    }, []);

    const deletePlaylist = useCallback((id: string) => {
        setPlaylists(prev => prev.filter(p => p.id !== id));
        if (activePlaylistId === id) {
            setActivePlaylistId(null);
        }
    }, [activePlaylistId]);

    const renamePlaylist = useCallback((id: string, name: string) => {
        setPlaylists(prev => prev.map(p =>
            p.id === id ? { ...p, name: name.trim() || p.name, updatedAt: Date.now() } : p
        ));
    }, []);

    const updatePlaylistDescription = useCallback((id: string, description: string) => {
        setPlaylists(prev => prev.map(p =>
            p.id === id ? { ...p, description, updatedAt: Date.now() } : p
        ));
    }, []);

    const addToPlaylist = useCallback((playlistId: string, songId: string) => {
        setPlaylists(prev => prev.map(p => {
            if (p.id === playlistId && !p.songIds.includes(songId)) {
                return { ...p, songIds: [...p.songIds, songId], updatedAt: Date.now() };
            }
            return p;
        }));
    }, []);

    const removeFromPlaylist = useCallback((playlistId: string, songId: string) => {
        setPlaylists(prev => prev.map(p => {
            if (p.id === playlistId) {
                return { ...p, songIds: p.songIds.filter(id => id !== songId), updatedAt: Date.now() };
            }
            return p;
        }));
    }, []);

    const reorderPlaylistSongs = useCallback((playlistId: string, songIds: string[]) => {
        setPlaylists(prev => prev.map(p =>
            p.id === playlistId ? { ...p, songIds, updatedAt: Date.now() } : p
        ));
    }, []);

    // ============================================
    // QUEUE OPERATIONS
    // ============================================

    const addToQueue = useCallback((songId: string, source: QueueItem['source'] = 'manual') => {
        const queueItem: QueueItem = {
            id: generateId(),
            songId,
            addedAt: Date.now(),
            source,
        };
        setQueue(prev => [...prev, queueItem]);
    }, []);

    const addMultipleToQueue = useCallback((songIds: string[], source: QueueItem['source'] = 'manual') => {
        const queueItems: QueueItem[] = songIds.map(songId => ({
            id: generateId(),
            songId,
            addedAt: Date.now(),
            source,
        }));
        setQueue(prev => [...prev, ...queueItems]);
    }, []);

    const removeFromQueue = useCallback((queueItemId: string) => {
        setQueue(prev => prev.filter(item => item.id !== queueItemId));
    }, []);

    const clearQueue = useCallback(() => {
        setQueue([]);
    }, []);

    const reorderQueue = useCallback((newQueue: QueueItem[]) => {
        setQueue(newQueue);
    }, []);

    const getNextInQueue = useCallback((): QueueItem | null => {
        return queue.length > 0 ? queue[0] : null;
    }, [queue]);

    const popQueue = useCallback((): string | null => {
        if (queue.length === 0) return null;
        const [first, ...rest] = queue;
        setQueue(rest);
        return first.songId;
    }, [queue]);

    // ============================================
    // HISTORY OPERATIONS
    // ============================================

    const addToHistory = useCallback((songId: string) => {
        const entry: PlayHistoryEntry = {
            songId,
            playedAt: Date.now(),
        };
        setPlayHistory(prev => {
            const newHistory = [entry, ...prev].slice(0, 100); // Keep last 100
            return newHistory;
        });
    }, []);

    const clearHistory = useCallback(() => {
        setPlayHistory([]);
    }, []);

    // ============================================
    // VOLUME OPERATIONS
    // ============================================

    const setVolume = useCallback((vol: number) => {
        setVolumeState(Math.max(0, Math.min(1, vol)));
    }, []);

    const toggleMute = useCallback(() => {
        setIsMuted(prev => !prev);
    }, []);

    // ============================================
    // SETLIST OPERATIONS
    // ============================================

    const toggleSetlistMode = useCallback(() => {
        setIsSetlistMode(prev => !prev);
    }, []);

    const updateSetlistNote = useCallback((songId: string, note: Partial<SetlistNote>) => {
        setSetlistNotes(prev => ({
            ...prev,
            [songId]: { ...prev[songId], songId, ...note },
        }));
    }, []);

    // ============================================
    // CONTEXT VALUE
    // ============================================

    const value: PlaylistContextValue = {
        // Playlists
        playlists,
        createPlaylist,
        deletePlaylist,
        renamePlaylist,
        updatePlaylistDescription,
        addToPlaylist,
        removeFromPlaylist,
        reorderPlaylistSongs,

        // Queue
        queue,
        addToQueue,
        addMultipleToQueue,
        removeFromQueue,
        clearQueue,
        reorderQueue,
        getNextInQueue,
        popQueue,

        // History
        playHistory,
        addToHistory,
        clearHistory,

        // Volume
        volume,
        setVolume,
        isMuted,
        toggleMute,

        // Setlist
        isSetlistMode,
        toggleSetlistMode,
        setlistNotes,
        updateSetlistNote,

        // Active Playlist
        activePlaylistId,
        setActivePlaylistId,
    };

    return (
        <PlaylistContext.Provider value={value}>
            {children}
        </PlaylistContext.Provider>
    );
};

// ============================================
// HOOK
// ============================================

export const usePlaylist = (): PlaylistContextValue => {
    const context = useContext(PlaylistContext);
    if (!context) {
        throw new Error('usePlaylist must be used within a PlaylistProvider');
    }
    return context;
};

export default PlaylistContext;
