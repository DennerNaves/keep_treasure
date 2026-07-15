import { useCallback, useEffect, useRef } from 'react';
import {
  getCurrentTrackIndex,
  getCurrentTrackName,
  getMusicVolume,
  getSFXVolume,
  initializeAudio,
  isPlaying,
  pauseMusic,
  playExhale,
  playIn,
  playInhale,
  playLevelComplete,
  playOut,
  playParticle,
  resumeMusic,
  setMusicVolume,
  setSFXVolume,
  setTrack,
  startMusic,
  stopExhale,
  stopInhale,
  stopMusic,
  toggleMusic,
  togglePreview,
  toggleSFX
} from '../services/audio/audioService';
import type { UseAudioResult } from '../types';

export function useAudio(): UseAudioResult {
  const initializedRef = useRef(false);

  const initAudio = useCallback(() => {
    if (!initializedRef.current) {
      initializeAudio();
      initializedRef.current = true;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (initializedRef.current) {
        stopExhale();
        stopInhale();
        stopMusic();
      }
    };
  }, []);

  return {
    initAudio,
    startMusic,
    stopMusic,
    pauseMusic,
    resumeMusic,
    toggleMusic,
    toggleSFX,
    togglePreview,
    setMusicVolume,
    setSFXVolume,
    setTrack,
    getCurrentTrackName,
    getCurrentTrackIndex,
    playExhale,
    stopExhale,
    playLevelComplete,
    playParticle,
    playIn,
    playInhale,
    stopInhale,
    playOut,
    isPlaying,
    getMusicVolume,
    getSFXVolume
  };
}
