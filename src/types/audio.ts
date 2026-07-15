export interface AudioTrack {
  id: string;
  name: string;
  src: string;
  element?: HTMLAudioElement;
}

export interface Audio {
  musicVolume: number;
  sfxVolume: number;
  currentTrackIndex: number;
  tracks: AudioTrack[];
  isPlaying: boolean;
  isPaused: boolean;
}

export type SoundEffect = 'particle' | 'levelComplete' | 'in' | 'out' | 'inhale' | 'exhale';

export interface UseAudioResult {
  initAudio: () => void;
  startMusic: () => void;
  stopMusic: () => void;
  pauseMusic: () => void;
  resumeMusic: () => void;
  toggleMusic: () => void;
  toggleSFX: () => void;
  togglePreview: () => void;
  setMusicVolume: (volume: number) => void;
  setSFXVolume: (volume: number) => void;
  setTrack: (index: number, autoPlay?: boolean) => void;
  getCurrentTrackName: () => string;
  getCurrentTrackIndex: () => number;
  playExhale: (duration: number) => void;
  stopExhale: () => void;
  playLevelComplete: () => void;
  playParticle: () => void;
  playIn: () => void;
  playOut: () => void;
  playInhale: (phaseDurationSeconds: number) => void;
  stopInhale: () => void;
  isPlaying: () => boolean;
  getMusicVolume: () => number;
  getSFXVolume: () => number;
}
