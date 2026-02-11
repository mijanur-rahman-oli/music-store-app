export interface MusicRecord {
  index: number;
  songTitle: string;
  artist: string;
  album: string;
  genre: string;
  likes: number;
  albumArtUrl?: string;
  audioUrl?: string;
}

export interface AppState {
  locale: string;
  userSeed: string;
  averageLikes: number;
  viewMode: 'table' | 'gallery';
}