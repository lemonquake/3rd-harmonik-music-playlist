
export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  cover: string;
  url: string;
  duration: string;
  lyrics: string[];
  funFacts: string[];
  playCount: number;
  isFavorite: boolean;
  accentColor: string;
}

export interface BandMember {
  id: string;
  name: string;
  role: string;
  photo: string;
  extraPhotos: string[];
  bio: string;
  height: string;
  favoriteSong: string;
}

export interface PlaylistState {
  songs: Song[];
  activeSongId: string | null;
  isPlaying: boolean;
  favorites: string[];
  customPlaylists: Record<string, string[]>;
}

// ============================================
// NEW TYPES FOR COMPREHENSIVE PLAYLIST SYSTEM
// ============================================

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  songIds: string[];
  createdAt: number;
  updatedAt: number;
  cover?: string;
  isSmartPlaylist?: boolean;
}

export interface QueueItem {
  id: string; // Unique ID for the queue item itself
  songId: string;
  addedAt: number;
  source: 'manual' | 'auto' | 'playlist';
}

export interface PlayHistoryEntry {
  songId: string;
  playedAt: number;
}

export interface PlayerPreferences {
  volume: number;
  isMuted: boolean;
  lastPlayedSongId?: string;
  lastPosition?: number;
}

export interface SetlistNote {
  songId: string;
  bpm?: number;
  key?: string;
  notes?: string;
  countdownSeconds?: number;
}

// Smart playlist types
export type SmartPlaylistType = 'most-played' | 'recently-played' | 'favorites' | 'discover';

export interface SmartPlaylist {
  id: SmartPlaylistType;
  name: string;
  icon: string;
  description: string;
}

export const SMART_PLAYLISTS: SmartPlaylist[] = [
  { id: 'most-played', name: 'Most Played', icon: '🔥', description: 'Your top tracks by play count' },
  { id: 'recently-played', name: 'Recently Played', icon: '🕐', description: 'Your listening history' },
  { id: 'favorites', name: 'Favorites', icon: '❤️', description: 'Songs you\'ve hearted' },
  { id: 'discover', name: 'Discover Mix', icon: '✨', description: 'Songs waiting to be explored' },
];
